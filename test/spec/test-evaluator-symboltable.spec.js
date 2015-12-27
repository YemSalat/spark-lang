var util = require('../modules/TestUtil');
var symbolTable = require('../../src/evaluator/modules/SymbolTable.js');

describe('Test evaluator SymbolTable', function() {

	describe('Test assignment declaration', function() {

		it( 'Checks integer types are converted correctly', function( ) {

			expect( evaluatorUtil.getIntegerType(1) ).toEqual( 'byte' );
			expect( evaluatorUtil.getIntegerType(-1) ).toEqual( 'byte' );
			expect( evaluatorUtil.getIntegerType(128) ).toEqual( 'byte' );
			expect( evaluatorUtil.getIntegerType(-129) ).toEqual( 'int' );
			expect( evaluatorUtil.getIntegerType(32767) ).toEqual( 'int' );
			expect( evaluatorUtil.getIntegerType(-32768) ).toEqual( 'long' );
			expect( evaluatorUtil.getIntegerType(2147483647) ).toEqual( 'long' );
		});

		it( 'Checks typeCheck() works correctly', function( ) {

			expect( evaluatorUtil.typeCheck('int', 'int') ).toEqual( 'int' );
			expect( evaluatorUtil.typeCheck('int', 'byte') ).toEqual( 'int' );
			expect( evaluatorUtil.typeCheck('int', 'long') ).toEqual( 'long' );
			expect( evaluatorUtil.typeCheck('byte', 'int') ).toEqual( 'int' );
			expect( evaluatorUtil.typeCheck('long', 'float') ).toEqual( 'float' );
			expect( evaluatorUtil.typeCheck('long', 'str') ).toEqual( false );
			expect( evaluatorUtil.typeCheck('str' , null) ).toEqual( false );
			expect( evaluatorUtil.typeCheck({}, 'str') ).toEqual( false );
			expect( evaluatorUtil.typeCheck(null , null) ).toEqual( false );
		});

		it( 'Checks isNumber()', function( ) {

			expect( evaluatorUtil.isNumber('byte') ).toEqual( true );
			expect( evaluatorUtil.isNumber('int') ).toEqual( true );
			expect( evaluatorUtil.isNumber('float') ).toEqual( true );
			expect( evaluatorUtil.isNumber('long') ).toEqual( true );
			expect( evaluatorUtil.isNumber('str') ).toEqual( false );
		});

		it( 'Checks isEqualityOperator()', function( ) {

			expect( evaluatorUtil.isEqualityOperator('==') ).toEqual( true );
			expect( evaluatorUtil.isEqualityOperator('!=') ).toEqual( true );
			expect( evaluatorUtil.isEqualityOperator('is') ).toEqual( true );
			expect( evaluatorUtil.isEqualityOperator('is not') ).toEqual( true );
			expect( evaluatorUtil.isEqualityOperator('<') ).toEqual( false );
			expect( evaluatorUtil.isEqualityOperator('is is not') ).toEqual( false );
		});

		it( 'Checks compareNumberTypes()', function( ) {

			expect( evaluatorUtil.compareNumberTypes('int', 'int') ).toEqual( 0 );
			expect( evaluatorUtil.compareNumberTypes('int', 'long') ).toEqual( -1 );
			expect( evaluatorUtil.compareNumberTypes('byte', 'int') ).toEqual( -1 );
			expect( evaluatorUtil.compareNumberTypes('byte', 'long') ).toEqual( -2 );
			expect( evaluatorUtil.compareNumberTypes('byte', 'float') ).toEqual( -3 );
			expect( evaluatorUtil.compareNumberTypes('long', 'byte') ).toEqual( 2 );
			expect( evaluatorUtil.compareNumberTypes('long', 'int') ).toEqual( 1 );
			expect( evaluatorUtil.compareNumberTypes('long', null) ).toEqual( -Infinity );
			expect( evaluatorUtil.compareNumberTypes(null, 'hello') ).toEqual( -Infinity );
			expect( evaluatorUtil.compareNumberTypes('int', 'hello') ).toEqual( -Infinity );
		});

	});
});
