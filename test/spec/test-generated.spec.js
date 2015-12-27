var util = require('../modules/TestUtil');

describe('Test code generated from files', function() {

	describe('Test code generation comparison - simple #1', function () {
		var cmpArray;
		var chkResults = [];
		var genResults = [];
		beforeEach(function (done) {
			util.loadComparison( 'cmp-simple-1.sprk', function (cmpArray) {
				cmpArray = cmpArray;
				for (var i=0,l = cmpArray.length; i<l; i++) {
					chkResults.push(cmpArray[i][1]);
					genResults.push(util.getCode(cmpArray[i][0]));
				}
				done();
			});
			
		});

		it('Checks code comparison #1', function() {

			for (var i=0,l = chkResults.length; i<l; i++) {
				expect( genResults[i] ).toEqual( chkResults[i] );
			}
		});
	});

	describe('Test code generation comparison - simple #2', function () {
		var cmpArray;
		var chkResults = [];
		var genResults = [];
		beforeEach(function (done) {
			util.loadComparison( 'cmp-simple-2.sprk', function (cmpArray) {
				cmpArray = cmpArray;
				for (var i=0,l = cmpArray.length; i<l; i++) {
					chkResults.push(cmpArray[i][1]);
					genResults.push(util.getCode(cmpArray[i][0]));
				}
				done();
			});
			
		});

		it('Checks code comparison #2', function() {

			for (var i=0,l = chkResults.length; i<l; i++) {
				expect( genResults[i] ).toEqual( chkResults[i] );
			}
		});
	});



	describe('Test code generation for /var-declarations.sprk', function () {
		var abstract, symbolScope, funcScope;
		
		beforeEach(function (done) {
			util.loadCode( 'var-declarations.sprk', function (code) {
				abstract = util.getAbstract(code);
				symbolScope = util.getSymbolScope(code, 1);
				done();
			});
			
		});

		it('Checks number of variable declarations are correct', function() {

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

	describe('Compare output for /var-declarations/or/-alt.sprk', function () {
		var files;
		
		beforeEach(function (done) {
			util.loadCodeFiles([
					'var-declarations.sprk',
					'var-declarations-alt.sprk'
				],
				function (codeFiles) {
					files = codeFiles;
					done();
				}
			);
			
		});

		it('Checks if implicit and explicit scopes are identical', function() {
			var scopeExplicit = util.getSymbolScope(files['var-declarations.sprk'], 1);
			var scopeImplicit = util.getSymbolScope(files['var-declarations-alt.sprk'], 1);

			expect( scopeImplicit ).toEqual( scopeExplicit );
		});
	});
});