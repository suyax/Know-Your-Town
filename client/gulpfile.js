/* Gulpfile file*/

//inject dependencies
var gulp = require('gulp');
var gutil = require('gulp-util');
var jshint = require('gulp-jshint');
var stylish = require('jshint-stylish');
var beautify = require('gulp-jsbeautify');
var sass = require('gulp-sass');

//define default task
gulp.task('default', ['watch','beautify','build-css']);

// configure jshint task
gulp.task('jshint', function() {
  return gulp.src('js/*.js')
    .pipe(jshint())
    .pipe(jshint.reporter(stylish));
});

gulp.task('beautify', function() {
  gulp.src('js/*.js')
    .pipe(beautify({indentSize: 2}))
    .pipe(gulp.dest('./public/'))
});

gulp.task('build-css', function() {
  return gulp.src('sass/*.scss')
    .pipe(sass())
    .pipe(gulp.dest('public/assets/stylesheets'));
});

//configure which file to watch and what task to use
gulp.task('watch', function() {
  gulp.watch('js/*.js', ['jshint','beautify']);
  gulp.watch('sass/*.scss',['build-css']);
});

