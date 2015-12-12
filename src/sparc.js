'use strict';

var fs = require('fs');
var argv = require('minimist')(process.argv.slice(2));

var SparkParser = require('./parser/parser.js');
var SparkEvaluator = require('./evaluator/evaluator.js');
var SparkGenerator = require('./generator/generator.js');

var fInput = argv['_'][0];
var fOutput = argv['_'][1];

console.log(argv)

var api = {
	parse: function () {
		fs.readFile(fInput, 'utf8', function (err, data) {
			if(err) {
				return console.log(err);
			}
			var syntaxTree = SparkParser.parse(data);
			var abstractTree = SparkEvaluator.parse(syntaxTree).tree;
			var resultCode = SparkGenerator.parse(abstractTree);
			if (!fOutput) {
				console.log(resultCode);
			}
			else {
				fs.writeFile(fOutput, resultCode, function(err) {
					if(err) {
						return console.log(err);
					}
					console.log('Output saved to: ' + fOutput);
				});
			}
		});
	}
}

api.parse();
