'use strict';

var gulp = require('gulp');
var nodemon = require('gulp-nodemon');

// the paths to our app files
var paths = {
  // all our client app js files, not including 3rd party js files
  scripts: ['public/libraries/*.js', 'public/*.js'],
  html: [ 'public/index.html'],
  styles: ['public/assets/bundle.css'],
};

// any changes made to your
// client side code will automagically refresh your page
// with the new changes
// start our node server using nodemon
gulp.task('start', function () {
  nodemon({
    script: './server/server.js',
    ignore: 'node_modules/**/*.js'
  });
});

gulp.task('default', ['start']);

