'use strict';

var theParser = window.theParser;
var theEvaluator = window.theEvaluator;
var theGenerator = window.theGenerator;

var evaluatorUtil = window.SPARK_modules.EvaluatorUtil;

var getSyntaxTree = function (source) {
	var result = theParser.parse(source);
	return result;
};

var getAbstractTree = function (source, tree) {
	var result = theEvaluator.parse(tree || getSyntaxTree(source));
	return result;
};

var getCode = function (source, tree) {
	var code = theGenerator.parse(getAbstractTree(source, tree));
	return code;
};

var getFirstChild = function (tree) {
	return tree.body[0];
}


QUnit.module('Simple Compare Trees', function () {

	QUnit.test( 'Test assignment declaration', function( assert ) {
		var source = 'a = 1';
		var syntaxTree = getSyntaxTree(source);
		var abstractTree = getAbstractTree(null, syntaxTree);
		var codeResult = getCode(null, abstractTree);

		var tt1 = {"location":{"start":{"offset":0,"line":1,"column":1},"end":{"offset":5,"line":1,"column":6}},"$$":"EXPRESSION_STATEMENT","expression":{"location":{"start":{"offset":0,"line":1,"column":1},"end":{"offset":5,"line":1,"column":6}},"$$":"VARIABLE_STATEMENT","operator":"=","left":{"location":{"start":{"offset":0,"line":1,"column":1},"end":{"offset":1,"line":1,"column":2}},"$$":"IDENTIFIER","name":"a"},"right":{"location":{"start":{"offset":4,"line":1,"column":5},"end":{"offset":5,"line":1,"column":6}},"$$":"LITERAL","value":1,"type":"byte"},"type":"byte","declarations":[{"$$":"VARIABLE_DECLARATOR","id":{"location":{"start":{"offset":0,"line":1,"column":1},"end":{"offset":1,"line":1,"column":2}},"$$":"IDENTIFIER","name":"a"},"location":{"start":{"offset":0,"line":1,"column":1},"end":{"offset":1,"line":1,"column":2}},"init":{"location":{"start":{"offset":4,"line":1,"column":5},"end":{"offset":5,"line":1,"column":6}},"$$":"LITERAL","value":1,"type":"byte"},"type":"byte"}]}};
		var tt2 = {"location":{"start":{"offset":0,"line":1,"column":1},"end":{"offset":5,"line":1,"column":6}},"$$":"EXPRESSION_STATEMENT","expression":{"location":{"start":{"offset":0,"line":1,"column":1},"end":{"offset":5,"line":1,"column":6}},"$$":"VARIABLE_STATEMENT","operator":"=","left":{"location":{"start":{"offset":0,"line":1,"column":1},"end":{"offset":1,"line":1,"column":2}},"$$":"IDENTIFIER","name":"a"},"right":{"location":{"start":{"offset":4,"line":1,"column":5},"end":{"offset":5,"line":1,"column":6}},"$$":"LITERAL","value":1,"type":"byte"},"type":"byte","declarations":[{"$$":"VARIABLE_DECLARATOR","id":{"location":{"start":{"offset":0,"line":1,"column":1},"end":{"offset":1,"line":1,"column":2}},"$$":"IDENTIFIER","name":"a"},"location":{"start":{"offset":0,"line":1,"column":1},"end":{"offset":1,"line":1,"column":2}},"init":{"location":{"start":{"offset":4,"line":1,"column":5},"end":{"offset":5,"line":1,"column":6}},"$$":"LITERAL","value":1,"type":"byte"},"type":"byte"}]}};
		var cdr = 'char a = 1;';

		assert.deepEqual( getFirstChild(syntaxTree), tt1 );
		assert.deepEqual( getFirstChild(abstractTree), tt2 );
		assert.deepEqual( codeResult, cdr );
	});
});

QUnit.module('Code Genrator Output', function () {

	QUnit.test( 'Output assignment declaration', function( assert ) {
		var source = 'a = 1';
		var codeResult = getCode(source);
		var expectedResult = 'char a = 1;';

		assert.deepEqual( codeResult, expectedResult );
	});
});


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
