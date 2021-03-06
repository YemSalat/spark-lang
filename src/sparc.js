'use strict';

var fs = require('fs');
var argv = require('minimist')(process.argv.slice(2));

var SparkParser = require('./parser/parser.js');
var SparkEvaluator = require('./evaluator/evaluator.js');
var SparkGenerator = require('./generator/generator.js');

var options = {
	fInput: argv['_'][0] || null,
	fOutput: argv['o'] || null,
	iSource: argv['i'] || null
};

var logError = function (error) {
	var result = 'Unknown error';
	var loc = error.location.start;
	var link = 'line '+ loc.line +', column '+ loc.column;
	if (error.name === 'SyntaxError') {
		if (error.expected) {
			var found = error.found || 'end of input';
			result = 'Check syntax on '+ link +': unexpected "'+found+'"';
		}
		else {
			result = 'Check syntax on '+ link +':'+ error.message;
		}
	}
	else {
		result = 'Semantic error on '+ link +': '+ error.message;
	}
	console.log(result);
	process.exit(1);
};

var loadSource = function (callback) {
	if (options.fInput) {
		fs.readFile(options.fInput, 'utf8', function (err, data) {
			if(err) {
				return console.log(err);
			}
			callback(data);
		});
	}
	else if (options.iSource) {
		callback(options.iSource);
	}
	else {
		console.log('Source not specified');
		process.exit(1);
	}
};

var processSource = function (source, callback) {
	var syntaxTree, abstractTree;
	try {
		syntaxTree = SparkParser.parse(source);
	} catch (e) {
		logError(e);
	}
	
	try {
		abstractTree = SparkEvaluator.parse(syntaxTree).tree;
	} catch (e) {
		logError(e);
	}
	var resultCode = SparkGenerator.parse(abstractTree);

	callback(resultCode);
};

var outputGeneratedCode = function (code) {
	if (options.fOutput) {
		fs.writeFile(options.fOutput, code, function(err) {
			if(err) {
				return console.log(err);
			}
			console.log('Output saved to: ' + options.fOutput);
		});
	}
	else {
		console.log(code);
	}
};

var api = {
	parse: function () {
		loadSource(function (source) {
			processSource(source, outputGeneratedCode);
		});
	}
};

api.parse();
