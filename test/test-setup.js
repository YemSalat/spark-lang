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
};
