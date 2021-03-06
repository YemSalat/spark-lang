var exec = require('child_process').exec;
var fs = require('fs');
var PEG = require("pegjs");
var minify = require('uglify-js').minify;
var browserify = require('browserify');
var prependFile = require('prepend-file');
var xml2js = require('xml2js');
var glob = require("glob")

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
		.pipe(uglify())
		.on('error', gutil.log)
	.pipe(sourcemaps.write('./maps/'))
	.pipe(gulp.dest('./build/'));
});


gulp.task('evaluator_nomin', function () {
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
		// .pipe(uglify())
		// .on('error', gutil.log)
	.pipe(sourcemaps.write('./maps/'))
	.pipe(gulp.dest('./build/'));
});

gulp.task('generator_nomin', function () {
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
		// .pipe(uglify())
		// .on('error', gutil.log)
	.pipe(sourcemaps.write('./maps/'))
	.pipe(gulp.dest('./build/'));
});

gulp.task('parser', function () {

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
		fs.writeFile('src/parser/parser.js', parserSource, function (err) {
			if(err) {
				return console.log(err);
			}
			exec('browserify ./src/parser/parser.js > ./build/parser.js', function (err, out, code) {
				if (err instanceof Error) {
					return console.log(err);
				}
				var result = minify('build/parser.js');
				fs.writeFile('build/parser.js', result.code, function (err) {
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
	exec('browserify --bare ./src/sparc.js > ./bin/sparc', function (err, out, code) {
		if (err instanceof Error) {
			return console.log(err);
		}
		prependFile('bin/sparc', '#!/usr/bin/env node\n\n', function (err) {
			if(err) {
				return console.log(err);
			}
			var result = minify('bin/sparc');
			fs.writeFile('bin/sparc', result.code, function (err) {
				if(err) {
					return console.log(err);
				}
				console.log('Sparc bundled');
			});
		})

		console.log('Sparc saved');
	});
});

gulp.task('default', ['evaluator', 'generator'], function () {

});

gulp.task('build', ['parser', 'evaluator', 'generator'], function () {

});

gulp.task('build_nomin', ['evaluator_nomin', 'generator_nomin'], function () {

});

gulp.task('build_nomin_all', ['parser', 'evaluator_nomin', 'generator_nomin'], function () {

});

var report2Markdown = function (report) {
	var indentSymbol = '  ';
	var indentLevel = 0;
	var currentName = '';
	var quote = function (str) {
	    return str.replace(/(?=[\/\\^$*+?.()|{}[\]])/g, "\\");
	};
	
	var api = {
		getCurrentIndent: function () {
			currentIndent = Array(indentLevel + 1).join(indentSymbol);
		},
		parseTestCase: function (node) {
			var result = '';
			var cNode = node['$'];
			var cTime = (parseFloat(cNode.time) * 1000).toFixed() + 'ms';
			result += '- ' + cNode.name + ' - *' + cTime + '* \n';

			return result
		},
		parseTestSuite: function (node) {
			var result = '';
			var cNode = node['$'];
			var cName = cNode.name;

			if (node.testcase) {

				if (currentName !== '') {
					var cRegex = cName.match(new RegExp('^'+ quote(currentName) +'\\.'));
					if (cRegex !== null) {
						cName = cName.replace(cRegex, '')
					}
				}

				result += '**' + cName + '**\n';


				++indentLevel; // INCRESE indent
				for (var i=0, l=node.testcase.length; i<l; i++) {
					var cCase = node.testcase[i];
					result += api.parseTestCase(cCase);
				}
				--indentLevel; // DECREASE indent
				currentName = '';
			}
			else {
				currentName = cName;
				result += '##' + cName + '';
			}

			result += '\n\n';

			return result;
		},
		parseReport: function (node) {
			var result = '';
			for (var i=0, l=node.testsuite.length; i<l; i++) {
				var cSuite = node.testsuite[i];
				result += api.parseTestSuite( cSuite );
			}
			return result;
		}
	};

	return api;
};

var reportConverter = report2Markdown();

gulp.task('test', function () {
	exec('cd test && ../node_modules/jasmine-node/bin/jasmine-node --verbose --junitreport --color spec', function (err, out, code) {
		if (err instanceof Error) {
			console.log(err);

			return code;
		}

		console.log(out);

		var parser = new xml2js.Parser();

		glob("./test/reports/**/*.xml", { nodir: true }, function (er, files) {	
			for (var i=0,l=files.length; i<l; i++) {
				var curFile = files[i];

				(function (curFile) {
					fs.readFile(curFile, function(err, data) {
						if (err) {
							console.log(err);
						}
					    parser.parseString(data, function (err, result) {
					    	if (err) {
					    		console.log(err);
					    	}
					    	var mdFilename = curFile.split('.').slice(0, -1).join('.') + '.md';
					    	var mdReport = reportConverter.parseReport( result.testsuites );
					        fs.writeFile(mdFilename, mdReport, function(err, data) {
					        	if (err) {
					        		console.log(err);
					        	}
					        	fs.unlink(curFile, function(err) {
					        		if (err) {
					        			console.log(err);
					        		}
					        	});
					            console.log(mdFilename + ' :: saved');
					        });
					    });
					});
				})(curFile);

				
			}
		});
		 
	});
});
