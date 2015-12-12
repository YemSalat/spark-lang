var fs = require('fs');

var SparkParser = require('../../src/parser/parser.js');
var SparkEvaluator = require('../../src/evaluator/evaluator.js');
var SparkGenerator = require('../../src/generator/generator.js');

var CODE_DIR = './resources/code/';

var getSyntaxTree = function (source) {
	if (typeof source !== 'string') {
		console.log('Note: non-string supplied to parser');
		return source;
	}
	var result = SparkParser.parse(source);
	return result;
};
var getAbstract = function (source) {
	var result = SparkEvaluator.parse(getSyntaxTree(source));
	return result;
};
var getAbstractTree = function (source) {
	var result = SparkEvaluator.parse(getSyntaxTree(source));
	return result.tree;
};
var getSymbolScope = function (source, n) {
	var result = SparkEvaluator.parse(getSyntaxTree(source));
	result = (n) ? result.symbolScope['sc' + n] : result.symbolScope;
	return result;
};
var getFuncScope = function (source) {
	var result = SparkEvaluator.parse(getSyntaxTree(source));
	return result.funcScope;
};
var getCode = function (source, tree) {
	var code = SparkGenerator.parse(getAbstractTree(source, tree));
	return code;
};
var getFirstChild = function (tree) {
	return tree.body[0];
};
var loadCode = function (filename, callback) {
	fs.readFile(CODE_DIR + filename, 'utf8', function (err, data) {
		if (err) {
			return console.log(err);
		}

		callback(data);
	});
};
var loadCodeFiles = function (fileArray, callbackTop) {
	var result = {};
	var count = 0;
	for (var i=0, l=fileArray.length; i<l; i++) {
		(function (n, len) {
			var fname = fileArray[n];
			loadCode(fname, function (code) {
				result[fname] = code;

				count++;
				if (count >= len) {
					callbackTop(result);
				}
			});
		})(i, l);
	}
};


describe('Test code generated from files', function() {

	describe('Test code generation for /var-declarations.sprk', function () {
		var abstract, symbolScope, funcScope;
		
		beforeEach(function (done) {
			loadCode( 'var-declarations.sprk', function (code) {
				abstract = getAbstract(code);
				symbolScope = getSymbolScope(code, 1);
				done();
			});
			
		});

		it('Checks number of variable declarations is correct', function() {

			expect( Object.keys(symbolScope).length ).toEqual( 5 );
		});

		it('Checks variable types are correct', function() {

			expect( symbolScope['a'].type ).toEqual( 'byte' );
			expect( symbolScope['b'].type ).toEqual( 'int' );
			expect( symbolScope['c'].type ).toEqual( 'long' );
			expect( symbolScope['d'].type ).toEqual( 'long' );
			expect( symbolScope['e'].type ).toEqual( 'str' );
		});

	});

	describe('Test code generation for /var-declarations-alt.sprk', function () {
		var abstract, symbolScope, funcScope;
		
		beforeEach(function (done) {
			loadCode( 'var-declarations-alt.sprk', function (code) {
				abstract = getAbstract(code);
				symbolScope = getSymbolScope(code, 1);
				done();
			});
			
		});

		it('Checks number of variable declarations is correct', function() {

			expect( Object.keys(symbolScope).length ).toEqual( 5 );
		});

		it('Checks variable types are correct', function() {

			expect( symbolScope['a'].type ).toEqual( 'byte' );
			expect( symbolScope['b'].type ).toEqual( 'int' );
			expect( symbolScope['c'].type ).toEqual( 'long' );
			expect( symbolScope['d'].type ).toEqual( 'long' );
			expect( symbolScope['e'].type ).toEqual( 'str' );
		});

	});

	describe('Compare output for /var-declarations.sprk and /var-declarations-alt.sprk', function () {
		var files;
		
		beforeEach(function (done) {
			loadCodeFiles([
					'var-declarations.sprk',
					'var-declarations-alt.sprk'
				],
				function (codeFiles) {
					files = codeFiles;
					done();
				}
			);
			
		});

		it('Checks parse trees are identical', function() {
			var scopeExplicit = getSymbolScope(files['var-declarations.sprk'], 1);
			var scopeImplicit = getSymbolScope(files['var-declarations-alt.sprk'], 1);

			expect( scopeImplicit ).toEqual( scopeExplicit );
		});
	});
});