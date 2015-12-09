QUnit.module('Code Generator Output', function () {

	QUnit.test( 'Output assignment declaration', function( assert ) {
		var source = 'a = 1';
		var codeResult = getCode(source);
		var expectedResult = 'char a = 1;';

		assert.deepEqual( codeResult, expectedResult );
	});
});
