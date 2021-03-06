module.exports = (function () {
  'use strict';

  var errorConvertMaps = {
    operator: {
      '+' : 'add',
      '-' : 'subtract',
      '*' : 'multiply',
      '/' : 'divide'
    },
    typeArticle: {
      'int'   : 'an',
      'byte'  : 'a',
      'long'  : 'a',
      'float' : 'a',
      'bool'  : 'a',
      'str'   : 'a'
    }
  };

  var errorMap = {
    VARIABLE_STATEMENT    : {
      type_mismatch       :   'variable "{0}" does not match type "{1}"',
      already_exists      :   'variable "{0}" was already initialized as \'{1}\' on line {2}',
      does_not_exist      :   'variable "{0}" is not defined',
      number_doesnt_fit   :   'number of type "{0}" won\'t fit into {typeArticle: 1} "{1}"'
                            },
    VARIABLE_DECLARATOR   : {
      already_initialized :   'variable "{0}" was already initialized as {1} on line {2}',
      already_declared    :   'variable "{0}" was already declared on line {1}'
                            },
    FUNCTION_DECLARATION  : {
      already_exists      :   'function "{0}" was already declared on line {1}',
      must_return         :   'function "{0}" must return {typeArticle: 1} "{1}"',
      incorrect_params    :   'parameters with default values must be declared last',
      cant_redeclare      :   'can\'t re-declare built-in function "{0}"'
                            },
    CALL_STATEMENT        : {
      does_not_exist      :   'function "{0}" does not exist'
                            },
    PARAM_DECLARATOR      : {
      duplicate_param     :   'duplicate parameter "{0}"',
      type_mismatch       :   'default value for parameter "{0}" must be {typeArticle: 1} "{1}"'
                            },
    RETURN_STATEMENT      : {
      return_outside      :   'return statement outside function declaration',
      type_mismatch       :   'return statement type does not match function "{0}" of type "{1}"'
                            },
    IDENTIFIER            : {
      does_not_exist      :   'variable "{0}" does not exist'
                            },
    BINARY_EXPRESSION     : {
      type_mismatch       :   '"{0}" operation types do not match, can\'t {operator: 0} "{1}" and "{2}"'
                            },
    LOGICAL_EXPRESSION    : {
      type_mismatch       :   'can\'t compare "{0}" and "{1}"',
      cant_compare        :   'can\'t compare "{0}" and "{1}"',
      not_a_number        :   'can use "{0}" operator only on numbers'
                            },
    ASSIGNMENT_STATEMENT  : {
      type_mismatch       :   'assignment types mismatch, can\'t assign "{0}" to "{1}"'
                            },
    ASSIGNMENT_ACTION     : {
      type_mismatch       :   'assignment types mismatch, can\'t assign "{0}" to "{1}"'
                            },
    UPDATE_EXPRESSION     : {
      not_a_number        :   'expression is not a number'
                            },
    UNARY_EXPRESSION      : {
      not_a_bool          :   'unary expression must be a boolean'
                            },
    IF_STATEMENT          : {
      not_a_bool          :   'IF condition must be a boolean'
                            }
  };


  // log error
  var logError = function(node, location, errorType, params) {
    var errorCategory = (typeof node === 'string') ? node : node['$$'];
    var errorMessage = errorMap[errorCategory][errorType];
    // 'parse' error message
    if (params) {
      for (var i=0,l=params.length; i<l; i++) {
        var cParam = params[i];
        var paramRegexA = new RegExp('\\{[ ]*([a-z]+)[ ]*\\:[ ]*'+ i +'[ ]*\\}', 'gi');
        var paramRegexB = new RegExp('\\{[ ]*'+ i +'[ ]*\\}', 'gi');
        errorMessage = errorMessage.replace(paramRegexA, function (a, b) {
          var cMap = errorConvertMaps[b];
          return cMap[cParam];
        });
        errorMessage = errorMessage.replace(paramRegexB, cParam);
      }
    }

    var err = {
      error: {
        location: location,
        message: errorMessage,
        node: node
      }
    };

    return err;
  };

  // api
  var api = {
    logError: logError
  };


  // :: EXPORT
  return api;

})();