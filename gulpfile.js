var fs = require('fs');
var PEG = require("pegjs");
var browserify = require('browserify');

var gulp = require('gulp');
var source = require('vinyl-source-stream');
var buffer = require('vinyl-buffer');
var gutil = require('gulp-util');
var sourcemaps = require('gulp-sourcemaps');
var uglify = require('gulp-uglify');


'use strict';


gulp.task('evaluator', function () {
  // set up the browserify instance on a task basis
  var b = browserify({
    entries: './src/evaluator/evaluator.js',
    debug: true
  });

  return b.bundle()
    .pipe(source('evaluator.js'))
    .pipe(buffer())
    .pipe(sourcemaps.init({loadMaps: true}))
        // Add transformation tasks to the pipeline here.
        .pipe(uglify())
        .on('error', gutil.log)
    .pipe(sourcemaps.write('./maps/'))
    .pipe(gulp.dest('./build/'));
});

gulp.task('generator', function () {
  // set up the browserify instance on a task basis
  var b = browserify({
    entries: './src/generator/generator.js',
    debug: true
  });

  return b.bundle()
    .pipe(source('generator.js'))
    .pipe(buffer())
    .pipe(sourcemaps.init({loadMaps: true}))
        // Add transformation tasks to the pipeline here.
        .pipe(uglify())
        .on('error', gutil.log)
    .pipe(sourcemaps.write('./maps/'))
    .pipe(gulp.dest('./build/'));
});

gulp.task('parser', function() {

    // read grammar
    fs.readFile('src/parser/spark-grammar.pegjs', 'utf8', function (err, data) {
        if (err) {
            return console.log(err);
        }
        // generate parser
        var parserSource = PEG.buildParser(data, {
            cache: true,
            output: 'source'
        });
        // append variable name
        parserSource = 'var theParser = ' + parserSource;
        // save file
        fs.writeFile('build/parser.js', parserSource, function(err) {
            if(err) {
                return console.log(err);
            }
            var result = minify('build/parser.js');
            fs.writeFile('build/parser.js', result.code, function(err) {
                if(err) {
                    return console.log(err);
                }
                console.log('Parser saved');
            });
        });   
    });
});

gulp.task('default', ['evaluator', 'generator'], function() {

});


gulp.task('nomin', ['evaluator_nomin', 'generator_nomin'], function() {

});

gulp.task('all', ['parser', 'evaluator', 'generator'], function() {

});

