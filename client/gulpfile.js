/* Gulpfile file*/

//inject dependencies
var gulp = require('gulp');
var gutil = require('gulp-util');
var jshint = require('gulp-jshint');
var stylish = require('jshint-stylish');
var beautify = require('gulp-beautify');
var sass = require('gulp-sass');
var concat = require('gulp-concat');
var uglify = require('gulp-uglify');
var cssmin = require('gulp-cssmin');
var rename = require('gulp-rename');
var addsrc = require('gulp-add-src');

//define default task
gulp.task('default', ['watch','build-css','bundle-js']);

// configure jshint task
gulp.task('jshint', function() {
  return gulp.src('js/*.js')
    .pipe(jshint())
    .pipe(jshint.reporter(stylish));
});

gulp.task('build-css', function() {
  return gulp.src('./stylesheets/sass/*.scss')
    .pipe(sass())
    .pipe(cssmin())
    .pipe(rename({suffix: '.min'}))
    .pipe(addsrc('./stylesheets/bootstrap.min.css'))
    .pipe(concat('bundle.css'))
    .pipe(gulp.dest('./public/assets/'))
});

gulp.task('bundle-js', function(){
  return gulp.src('js/*.js')
  .pipe(beautify({indent_size: 2}))
  .pipe(uglify())
  .pipe(concat('bundle.js'))
  .pipe(gulp.dest('./public/'))


})

//configure which file to watch and what task to use
gulp.task('watch', function() {
  gulp.watch('js/*.js', ['jshint','bundle-js']);
  gulp.watch('sass/*.scss',['build-css']);
});

