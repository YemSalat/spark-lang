module.exports = (function () {

	var fs = require('fs');

	var SparkParser = require('../../src/parser/parser.js');
	var SparkEvaluator = require('../../src/evaluator/evaluator.js');
	var SparkGenerator = require('../../src/generator/generator.js');

	var CODE_DIR = './resources/code/';
	var COMPARE_DIR = './resources/comparison/';

	var api = {
		getSyntaxTree: function (source) {
			if (typeof source !== 'string') {
				console.log('Note: non-string supplied to parser');
				return source;
			}
			var result = SparkParser.parse(source);
			return result;
		},
		getAbstract: function (source) {
			var result = SparkEvaluator.parse(api.getSyntaxTree(source));
			return result;
		},
		getAbstractTree: function (source) {
			var result = SparkEvaluator.parse(api.getSyntaxTree(source));
			return result.tree;
		},
		getSymbolScope: function (source, n) {
			var result = SparkEvaluator.parse(api.getSyntaxTree(source));
			result = (n) ? result.symbolScope['sc' + n] : result.symbolScope;
			return result;
		},
		getFuncScope: function (source) {
			var result = SparkEvaluator.parse(api.getSyntaxTree(source));
			return result.funcScope;
		},
		getCode: function (source, tree) {
			var code = SparkGenerator.parse(api.getAbstractTree(source, tree));
			return code;
		},
		getFirstChild: function (tree) {
			return tree.body[0];
		},
		loadComparison: function (filename, callback) {
			var result = [];
			fs.readFile(COMPARE_DIR + filename, 'utf8', function (err, data) {
				if (err) {
					return console.log(err);
				}
				var cases = data.split(/%\s*\={5,}\s*%/g);
				for (var i=0, l=cases.length; i<l; i++) {
					var compare = cases[i].split(/%\s*\-{5,}\s*%/g);
					if (typeof compare[1] !== 'undefined') {
						var cmpSprk = compare[0].trim();
						var cmpCpp = compare[1].trim();
						result.push([cmpSprk, cmpCpp]);
					}
				}
				callback(result);
			});
		},
		loadCode: function (filename, callback) {
			fs.readFile(CODE_DIR + filename, 'utf8', function (err, data) {
				if (err) {
					return console.log(err);
				}

				callback(data);
			});
		},
		loadCodeFiles: function (fileArray, callbackTop) {
			var result = {};
			var count = 0;
			for (var i=0, l=fileArray.length; i<l; i++) {
				(function (n, len) {
					var fname = fileArray[n];
					api.loadCode(fname, function (code) {
						result[fname] = code;

						count++;
						if (count >= len) {
							callbackTop(result);
						}
					});
				})(i, l);
			}
		}
	};


	// :: EXPORT
	return api;

})();