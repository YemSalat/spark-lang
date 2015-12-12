var ut = require('../../../src/evaluator/modules/EvaluatorUtil.js');


describe('Test EvaluatorUtil', function() {
	describe('Test assignment declaration', function() {
		it( 'Checks integer types are converted correctly', function( ) {

			expect( ut.getIntegerType(1) ).toEqual( 'byte' );
			expect( ut.getIntegerType(-1) ).toEqual( 'byte' );
			expect( ut.getIntegerType(128) ).toEqual( 'byte' );
			expect( ut.getIntegerType(-129) ).toEqual( 'int' );
			expect( ut.getIntegerType(32767) ).toEqual( 'int' );
			expect( ut.getIntegerType(-32768) ).toEqual( 'long' );
			expect( ut.getIntegerType(2147483647) ).toEqual( 'long' );
		});

		it( 'Checks typeCheck() works correctly', function( ) {

			expect( ut.typeCheck('int', 'int') ).toEqual( 'int' );
			expect( ut.typeCheck('int', 'byte') ).toEqual( 'int' );
			expect( ut.typeCheck('int', 'long') ).toEqual( 'long' );
			expect( ut.typeCheck('byte', 'int') ).toEqual( 'int' );
			expect( ut.typeCheck('long', 'float') ).toEqual( 'float' );
			expect( ut.typeCheck('long', 'str') ).toEqual( false );
			expect( ut.typeCheck('str' , null) ).toEqual( false );
			expect( ut.typeCheck({}, 'str') ).toEqual( false );
			expect( ut.typeCheck(null , null) ).toEqual( false );
		});
	});
});
