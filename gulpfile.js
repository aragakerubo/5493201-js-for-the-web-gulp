const browserify = require("browserify"),
  babelify = require("babelify"),
  browserSync = require("browser-sync"),
  gulp = require("gulp"),
  jshint = require("gulp-jshint"),
  svgmin = require("gulp-svgmin"),
  source = require("vinyl-source-stream"),
  buffer = require("vinyl-buffer"),
  uglify = require("gulp-uglify"),
  sourcemaps = require("gulp-sourcemaps"),
  log = require("gulplog");

const jsFILES = ["blog.js", "functions.js"];

gulp.task("processIMAGES", cb => {
  gulp
    .src("images/**")
    .pipe(svgmin())
    .pipe(gulp.dest("dist/images"));
  cb();
});

gulp.task("processHTML", cb => {
  gulp.src("*.html").pipe(gulp.dest("dist"));
  cb();
});

gulp.task("lint", cb => {
  gulp
    .src("*.js")
    .pipe(
      jshint({
        esversion: 8
      })
    )
    .pipe(jshint.reporter("default"));
  cb();
});

gulp.task(
  "processJS",
  gulp.series("lint", cb => {
    jsFILES.map(entry => {
      return browserify({
        entries: [entry]
      })
        .transform(babelify, {
          presets: ["@babel/preset-env"],
          plugins: ["@babel/plugin-transform-runtime"]
        })
        .bundle()
        .pipe(source(entry))
        .pipe(buffer())
        .pipe(sourcemaps.init({ loadMaps: true }))
        .pipe(uglify())
        .on("error", log.error)
        .pipe(sourcemaps.write("./"))
        .pipe(gulp.dest("dist"));
    });
    cb();
  })
);

gulp.task("browserSync", cb => {
  browserSync.init({
    server: "./dist",
    port: process.env.PORT || 8080,
    ui: {
      port: process.env.PORT || 8081
    }
  });
  cb();
});

gulp.task(
  "watch",
  gulp.series("browserSync", () => {
    gulp.watch("*.js", gulp.series("processJS"));
    gulp.watch("*.html", gulp.series("processHTML"));

    gulp.watch("dist/*.js").on("change", browserSync.reload);
    gulp.watch("dist/*.html").on("change", browserSync.reload);
  })
);

gulp.task(
  "default",
  gulp.series(
    gulp.parallel("processIMAGES", "processHTML", "processJS"),
    "watch"
  )
);
