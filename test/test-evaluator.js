
QUnit.module('Evaluator Utils', function () {
	var ut = evaluatorUtil;

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

		assert.deepEqual( ut.typeCheck('int', 'long'), 'long' );
		assert.deepEqual( ut.typeCheck('int', 'byte'), 'int' );
		assert.deepEqual( ut.typeCheck('long', 'float'), 'float' );
		assert.deepEqual( ut.typeCheck('long', 'str'), false );
	});

	
});
