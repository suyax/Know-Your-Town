/* Gulpfile file*/

//inject dependencies
var gulp = require('gulp');
var gutil = require('gulp-util');
var jshint = require('gulp-jshint');
var stylish = require('jshint-stylish');

//define default task
gulp.task('default', ['watch']);

// configure jshint task
gulp.task('jshint', function() {
  return gulp.src('js/*.js')
    .pipe(jshint())
    .pipe(jshint.reporter(stylish));
});

//configure which file to watch and what task to use
gulp.task('watch', function() {
  gulp.watch('js/*.js', ['jshint']);
});

