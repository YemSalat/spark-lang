var exec = require('child_process').exec;
var fs = require('fs');
var PEG = require("pegjs");
var minify = require('uglify-js').minify;
var browserify = require('browserify');
var prependFile = require('prepend-file');


var gulp = require('gulp');
var source = require('vinyl-source-stream');
var buffer = require('vinyl-buffer');
var gutil = require('gulp-util');
var sourcemaps = require('gulp-sourcemaps');
var uglify = require('gulp-uglify');
var header = require('gulp-header');


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
		parserSource = 'global.SparkParser = module.exports = ' + parserSource;
		// save file
		fs.writeFile('src/parser/parser.js', parserSource, function(err) {
			if(err) {
				return console.log(err);
			}
			exec('browserify ./src/parser/parser.js > ./build/parser.js', function(err, out, code) {
				if (err instanceof Error) {
					return console.log(err);
				}
				var result = minify('build/parser.js');
				fs.writeFile('build/parser.js', result.code, function(err) {
					if(err) {
						return console.log(err);
					}
					console.log('Parser bundled');
				});
				console.log('Parser saved');
			});
		});	 
	});
});

gulp.task('build_sparc', function () {
	exec('browserify --bare ./src/sparc.js > ./bin/sparc', function(err, out, code) {
		if (err instanceof Error) {
			return console.log(err);
		}
		prependFile('bin/sparc', '#!/usr/bin/env node\n\n', function(err) {
			if(err) {
				return console.log(err);
			}
			var result = minify('bin/sparc');
			fs.writeFile('bin/sparc', result.code, function(err) {
				if(err) {
					return console.log(err);
				}
				console.log('Sparc bundled');
			});
		})

		console.log('Sparc saved');
	});
});

gulp.task('default', ['evaluator', 'generator'], function() {

});

gulp.task('build', ['parser', 'evaluator', 'generator'], function() {

});

