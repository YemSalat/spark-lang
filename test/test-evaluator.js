'use strict';
// :: SETUP
var getSyntaxTree = window.SPARK_test.getSyntaxTree;
var getAbstractTree = window.SPARK_test.getAbstractTree;
var getCode = window.SPARK_test.getCode;
var getFirstChild = window.SPARK_test.getFirstChild;

var ut = window.SPARK_modules.EvaluatorUtil

// :: TEST
QUnit.module('Evaluator Utils', function () {

	QUnit.test( 'Test getIntegerType()', function( assert ) {

		assert.deepEqual( ut.getIntegerType(1), 'byte' );
		assert.deepEqual( ut.getIntegerType(-1), 'byte' );
		assert.deepEqual( ut.getIntegerType(128), 'byte' );
		assert.deepEqual( ut.getIntegerType(-129), 'int' );
		assert.deepEqual( ut.getIntegerType(32767), 'int' );
		assert.deepEqual( ut.getIntegerType(-32768), 'long' );
		assert.deepEqual( ut.getIntegerType(2147483647), 'long' );
	});

	QUnit.test( 'Test typeCheck()', function( assert ) {

		assert.deepEqual( ut.typeCheck('int', 'int'), 'int' );
		assert.deepEqual( ut.typeCheck('int', 'byte'), 'int' );
		assert.deepEqual( ut.typeCheck('int', 'long'), 'long' );
		assert.deepEqual( ut.typeCheck('byte', 'int'), 'int' );
		assert.deepEqual( ut.typeCheck('long', 'float'), 'float' );
		assert.deepEqual( ut.typeCheck('long', 'str'), false );
		assert.deepEqual( ut.typeCheck('str', null), false );
		assert.deepEqual( ut.typeCheck({}, 'str'), false );
		assert.deepEqual( ut.typeCheck(null, null), false );
	});

});
QUnit.module('Evaluator Errors', function () {
	QUnit.test( 'Test Evaluator ErrorManager', function( assert ) {

		
	});
});
