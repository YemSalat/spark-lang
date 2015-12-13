var util = require('../modules/TestUtil');

describe('Test code generated from files', function() {

	describe('Test code generation for /var-declarations.sprk', function () {
		var abstract, symbolScope, funcScope;
		
		beforeEach(function (done) {
			util.loadCode( 'var-declarations.sprk', function (code) {
				abstract = util.getAbstract(code);
				symbolScope = util.getSymbolScope(code, 1);
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

		it('Checks parse trees are identical', function() {
			var scopeExplicit = util.getSymbolScope(files['var-declarations.sprk'], 1);
			var scopeImplicit = util.getSymbolScope(files['var-declarations-alt.sprk'], 1);

			expect( scopeImplicit ).toEqual( scopeExplicit );
		});
	});
});