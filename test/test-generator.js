'use strict';
// :: SETUP
var getSyntaxTree = window.SPARK_test.getSyntaxTree;
var getAbstractTree = window.SPARK_test.getAbstractTree;
var getCode = window.SPARK_test.getCode;
var getFirstChild = window.SPARK_test.getFirstChild;

// :: TEST
QUnit.module('Code Generator Output', function () {

	QUnit.test( 'Output assignment declaration', function( assert ) {
		var source = 'a = 1';
		var codeResult = getCode(source);
		var expectedResult = 'char a = 1;';

		assert.deepEqual( codeResult, expectedResult );
	});
});
