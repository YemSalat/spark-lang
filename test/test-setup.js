'use strict';

var theParser = window.theParser;
var theEvaluator = window.theEvaluator;
var theGenerator = window.theGenerator;

var evaluatorUtil = window.SPARK_modules.EvaluatorUtil;

var testUtil = window.SPARK_test = {};

testUtil.getSyntaxTree = function (source) {
	var result = theParser.parse(source);
	return result;
};

testUtil.getAbstractTree = function (source, tree) {
	var result = theEvaluator.parse(tree || getSyntaxTree(source));
	return result;
};

testUtil.getCode = function (source, tree) {
	var code = theGenerator.parse(getAbstractTree(source, tree));
	return code;
};

testUtil.getFirstChild = function (tree) {
	return tree.body[0];
};
