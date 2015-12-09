var gulp = require('gulp');
var sourcemaps = require('gulp-sourcemaps');
var concat = require('gulp-concat');
var uglify = require('gulp-uglify');
var PEG = require("pegjs");
var fs = require('fs');
var minify = require('uglify-js').minify;


gulp.task('evaluator', function() {
    gulp.src([
            'src/module.js',
            'src/evaluator/modules/*.js',
            'src/evaluator/evaluator.js',
        ])
        .pipe(sourcemaps.init())
            .pipe(concat('evaluator.js'))
            .pipe(uglify())
        .pipe(sourcemaps.write('/maps'))
        .pipe(gulp.dest('build/'));
    console.log('Evaluator saved');
});

gulp.task('evaluator_nomin', function() {
    gulp.src([
            'src/module.js',
            'src/evaluator/modules/*.js',
            'src/evaluator/evaluator.js',
        ])
        .pipe(sourcemaps.init())
            .pipe(concat('evaluator.js'))
        .pipe(sourcemaps.write('/maps'))
        .pipe(gulp.dest('build/'));
    console.log('Evaluator saved');
});

gulp.task('generator', function() {
    gulp.src([
            'src/module.js',
            'src/generator/modules/*.js',
            'src/generator/generator.js',
        ])
        .pipe(sourcemaps.init())
            .pipe(concat('generator.js'))
            .pipe(uglify())
        .pipe(sourcemaps.write('/maps'))
        .pipe(gulp.dest('build/'));
    console.log('Generator saved');
});

gulp.task('generator_nomin', function() {
    gulp.src([
            'src/module.js',
            'src/generator/modules/*.js',
            'src/generator/generator.js',
        ])
        .pipe(sourcemaps.init())
            .pipe(concat('generator.js'))
        .pipe(sourcemaps.write('/maps'))
        .pipe(gulp.dest('build/'));
    console.log('Generator saved');
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

