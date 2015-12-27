(function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){
module.exports = (function () {
  // :: CONSTANTS
  'use strict';
  
  var api = {
    DEFAULT_CONSTANTS: {
      LOW: {
        name: 'LOW',
        type: 'int',
        value: 0
      },
      HIGH: {
        name: 'HIGH',
        type: 'int',
        value: 1
      },
      READ: {
        name: 'READ',
        type: 'int',
        value: 0
      },
      WRITE: {
        name: 'WRITE',
        type: 'int',
        value: 1
      }
    }
  };

  return api;

})();
},{}],2:[function(require,module,exports){
module.exports = (function () {
  // :: CONSTANTS
  'use strict';
  
  var api = {
      DEFAULT_FUNCTIONS: {
      millis: 'millis',
      pinRead: 'digitalRead',
      pinWrite: 'digitalWrite',
      pinMode: 'pinMode',
      print: 'Serial.print',
      println: 'Serial.println'
    }
  };

  return api;

})();
},{}],3:[function(require,module,exports){
(function (global){
module.exports = (function() {
  'use strict';

  // :: MODULES
  var symbolTable = require('./modules/SymbolTable');
  var funcTable = require('./modules/FuncTable');
  var errorManager = require('./modules/ErrorManager');
  var util = require('./modules/EvaluatorUtil');

  // :: CONSTANTS
  var DEFAULT_CONSTANTS = require('./../common/constants').DEFAULT_CONSTANTS;
  var DEFAULT_FUNCTIONS = require('./../common/functions').DEFAULT_FUNCTIONS;

  // :: ERRORS
  function SemanticError (name, message, location) {
    this.name = name;
    this.message = message;
    this.location = location;
  }

  // :: PRIVATE
  var __evalNode = function(node, method) {
    var mType = method ||
                (node !== null) ? node['$$'] : null;

    var pNode = null;
    if (mType) {
      pNode = evaluate[mType](node);
      if (pNode.error) {
        console.log(JSON.stringify( pNode ));
        throw new SemanticError('SemanticError', pNode.error.message, pNode.error.location);
      }
    }

    return pNode;
  };

  // :: API
  var api = {
    parse: function (tree, options) {
      // reset tables
      symbolTable.reset();
      funcTable.reset();

      var _tree = __evalNode(tree);

      return {
        tree: _tree,
        symbolScope: symbolTable.getTable(),
        funcScope: funcTable.getTable()
      };
    }
  };

  // :: EVALUATOR
  var evaluate = {

    DOCSTRING: function(node) {
      return node;
    },

    VARIABLE_STATEMENT: function(node) {
      var varType = node.type;

      for (var i=0,l=node.declarations.length; i<l; i++) {
        var item = node.declarations[i];

        // eval right side
        var initType = null;
        if (item.init !== null) {
          item.init = __evalNode(item.init);
          // check types
          var cType = util.typeCheck(node.type, item.init.type);
          if (!cType) {
            return errorManager.logError(node, node.location, 'type_mismatch', [item.id.name, varType]);
          }
          else {
            if (util.isNumber(node.type)) {
              if (util.compareNumberTypes(varType, item.init.type) < 0)
                return errorManager.logError(node, node.location, 'number_doesnt_fit', [item.init.type, varType]);
            }
            node.type = cType;
          }
          initType = cType;
        }
        // set identifier type
        item.type = initType;
        // check if variable exists
        var varName = item.id.name;
        var variable = symbolTable.checkScope(varName);
        if (variable) {
          // error
          return errorManager.logError(node, item.id.location, 'already_exists', [item.id.name, variable.value, variable.initLine]);
        }
        else {
          // add new variable to current scope
          var cVal = '{null}';
          if (item.init) {
            cVal = '{expression}';
            if (item.init['$$'] === 'LITERAL') {
              cVal = item.init.value;
            }
          }
          symbolTable.addSymbol(item, { value: cVal, type: node.type });
        }
      }

      return node;
    },

    VARIABLE_DECLARATOR: function (node) {
      return node;
    },

    FUNCTION_DECLARATION: function (node) {
      var cName = node.id.name;
      // dont eval built-in functions
      if (DEFAULT_FUNCTIONS.hasOwnProperty(cName)) {
        return errorManager.logError(node, node.location, 'cant_redeclare', [cName]);
      }

      var cFunc = funcTable.findFunc(node);
      if (cFunc) {
        // error
        return errorManager.logError(node, node.location, 'already_exists', [cName, cFunc.initLine]);
      }

      // check duplicate params
      var cParamDupes = util.checkParamDuplicates(node.params);
      if (cParamDupes) {
        return errorManager.logError(cParamDupes, cParamDupes.location, 'duplicate_param', [cParamDupes.id.name]);
      }

      funcTable.addFunc(node);

      // increase current scope
      symbolTable.enterScope();

      // eval params
      if (node.params) {
        var defaultParamReached = false;
        for (var i=0,l=node.params.length; i<l; i++) {
          var item = __evalNode(node.params[i]);
          // make sure that params with defaults are at the end
          if (item.default) {
            defaultParamReached = true;
          }
          else if (defaultParamReached) {
            // incorrect syntax for default params
            return errorManager.logError(node, item.location, 'incorrect_params', [cName, node.type]);
          }
          symbolTable.addSymbol(item, { value: null, type: item.type });
        }
      }

      // enter function (used for return check)
      funcTable.enterFunc(node);
      // parse function body
      node.body = __evalNode(node.body);
      // evaluate return statemnts
      var curFunc = funcTable.getCurrentFunc();
      var returnAmount = curFunc.returns.length;
      if (node.type !== 'void' && returnAmount === 0) {
        return errorManager.logError(node, node.id.location, 'must_return', [cName, node.type]);
      }
      // exit function
      funcTable.exitFunc();
      // exit scope
      symbolTable.exitScope();

      return node;
    },
    
    PARAM_DECLARATOR: function (node) {
      // check default value
      if (node.default) {
        node.default = __evalNode(node.default);
        var cType = util.typeCheck(node.type, node.default.type, false);
        if (!cType) {
          return errorManager.logError(node, node.location, 'type_mismatch', [node.id.name, node.type]);
        }
      }
      return node;
    },

    RETURN_STATEMENT: function (node) {
      node.argument = __evalNode(node.argument);
      // set return statement type
      node.type = (node.argument) ? node.argument.type : 'void';

      // check type matches current function
      var curFunc = funcTable.getCurrentFunc();
      if (!curFunc.node) {
        return errorManager.logError(node, node.location, 'return_outside');
      }
      var cType = util.typeCheck(node.type, curFunc.node.type);
      if (!cType) {
        var errLocation = ( node.argument ) ? node.argument.location : node.location;
        return errorManager.logError(node, errLocation, 'type_mismatch', [curFunc.node.id.name, curFunc.node.type]);
      }

      // add return
      funcTable.funcAddReturn(node);

      return node;
    },

    CALL_STATEMENT: function (node) {
      var cName = node.callee.name;
      // eval arguments      
      for (var i=0, l=node.arguments.length; i<l; i++) {
        node.arguments[i] = __evalNode(node.arguments[i]);
      }
      // dont eval built-in functions
      if (DEFAULT_FUNCTIONS.hasOwnProperty(cName)) {
        return node;
      }
      // check if function exists
      var cFunc = funcTable.findFunc(node);
      if (!cFunc) {
        return errorManager.logError(node, node.callee.location, 'does_not_exist', [cName]);
      }
      // add missing default params
      if (funcTable.funcHasDefaults(cFunc) && node.arguments.length < cFunc.params.length) {
        var defParams = cFunc.params.slice(node.arguments.length);
        for (var i=0, l=defParams.length; i<l; i++) {
          node.arguments.push(__evalNode(defParams[i].default));
        }
      }
      // assign call statement type
      node.type = cFunc.type;
      return node;
    },

    FOR_STATEMENT: function (node) {
      symbolTable.enterScope();
      node.init = __evalNode(node.init);
      node.test = __evalNode(node.test);
      node.update = __evalNode(node.update);
      node.body = __evalNode(node.body);
      symbolTable.exitScope();

      return node;
    },

    BREAK_STATEMENT: function (node) {
      return node;
    },

    CONTINUE_STATEMENT: function (node) {
      return node;
    },

    EXPRESSION_STATEMENT: function (node) {
      var newNode = __evalNode(node.expression);
      return newNode;
    },

    IDENTIFIER: function (node) {
      // check if variable exists
      var varName = node.name;
      var variable = symbolTable.findSymbol(varName);
      if (variable) {
        // assign node type
        node.type = variable.type;
      } else {
        // error
        return errorManager.logError(node, node.location, 'does_not_exist', [varName]);
      }

      return node;
    },

    LITERAL: function(node) {
      // convert int type
      if (node.type === 'int') {
        node.type = util.getIntegerType(node.value);
      }

      return node;
    },

    BINARY_EXPRESSION: function (node) {
      // eval left and right parts first
      node.left = __evalNode(node.left);
      node.right = __evalNode(node.right);
      // assign node type
      // check types
      node.type = util.typeCheck(node.left.type, node.right.type);
      // error
      if (!node.type) {
        return errorManager.logError(node, node.location, 'type_mismatch', [node.operator, node.left.type, node.right.type]);
      }
      return node;
    },

    ASSIGNMENT_STATEMENT: function (node) {
      // eval asignment right hand side
      node.right = __evalNode(node.right);
      // check if variable exists
      var varName = node.left.name;
      var variable = symbolTable.findSymbol(varName);
      if (!variable) {
        // eval as variable statement instead
        return __evalNode(util.constructVarDeclarator(node));
      }
      // eval left hand side
      node.left = __evalNode(node.left);

      // check types
      var cType = util.typeCheck(node.left.type, node.right.type);
      if (!cType) {
        return errorManager.logError(node, node.left.location, 'type_mismatch', [node.right.type, node.left.type]);
      }

      return node;
    },

    ASSIGNMENT_ACTION: function (node) {
      node.left = __evalNode(node.left);
      node.right = __evalNode(node.right);
      var cType = util.typeCheck(node.left.type, node.right.type);
      if (!cType) {
        return errorManager.logError(node, node.location, 'type_mismatch', [node.right.type, node.left.type]);
      }
      return node;
    },

    BLOCK_STATEMENT: function (node) {
      // increase current scope
      symbolTable.enterScope();

      node.body.forEach(function(item) {
        item = __evalNode(item);
      });

      // decrease scope
      symbolTable.exitScope();

      return node;
    },

    PROGRAM: function (node) {
      // parse each program statement
      node.body.forEach(function(item) {
        item = __evalNode(item);
      });

      return node;
    },

    IF_STATEMENT: function (node) {
      // parse test condition
      node.test = __evalNode(node.test);
      // check test type
      if (node.test.type !== 'bool') {
        return errorManager.logError(node, node.test.location, 'not_a_bool');
      }

      // parse consequent and alternate
      node.consequent = __evalNode(node.consequent);
      if (node.alternate) {
        node.alternate = __evalNode(node.alternate);
      }
      return node;
    },

    LOGICAL_EXPRESSION: function (node) {
      node.left = __evalNode(node.left);
      node.right = __evalNode(node.right);

      // check types
      var cType = util.typeCheck(node.left.type, node.right.type);
      if (!cType) {
        // error
        return errorManager.logError(node, node.location, 'type_mismatch', [node.left.type, node.right.type]);
      }
      else if (!util.isEqualityOperator(node.operator) && !util.isNumber(cType)) {
        // cant compare
        return errorManager.logError(node, node.location, 'not_a_number', [node.operator]);
      }
      return node;
    },

    UPDATE_EXPRESSION: function (node) {
      node.argument = __evalNode(node.argument);
      if (!util.isNumber(node.argument.type)) {
        // error
        return errorManager.logError(node, node.location, 'not_a_number');
      }
      node.type = node.argument.type;
      return node;
    },

    UNARY_EXPRESSION: function (node) {
      node.argument = __evalNode(node.argument);
      // check 'not' operator is a boolean
      if (node.operator === '!' && node.argument.type !== 'bool') {
        // error
        return errorManager.logError(node, node.location, 'not_a_bool');
      }
      node.type = node.argument.type;
      return node;
    }

  };

  // :: EXPORT
  global.SparkEvaluator = api;
  return api;

})();

}).call(this,typeof global !== "undefined" ? global : typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : {})

},{"./../common/constants":1,"./../common/functions":2,"./modules/ErrorManager":4,"./modules/EvaluatorUtil":5,"./modules/FuncTable":6,"./modules/SymbolTable":7}],4:[function(require,module,exports){
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
},{}],5:[function(require,module,exports){
module.exports = (function () {
  'use strict';

  // :: PRIVATE
  var numberTypeScale = ['byte', 'int', 'long', 'float'];
  var equalityOperatorMap = ['==', '!=', 'is', 'is not'];
  var signedIntegerLimits = {
    'byte': 128,
    'int': 32767,
    'long': 2147483647
  };
  

  // :: API
  var api = {
    constructVarDeclarator: function (node) {
      node['$$'] = 'VARIABLE_STATEMENT';
      node.type = node.right.type;
      node.declarations = [
        {
          '$$': 'VARIABLE_DECLARATOR',
          'id': {
            'location': node.left.location,
            '$$': 'IDENTIFIER',
            'name': node.left.name
          },
          'location': node.left.location,
          'init': node.right
        }
      ];

      return node;
    },

    typeCheck: function (leftType, rightType, strict) {
      if (strict) {
        return leftType === rightType;
      }
      if (!leftType || !rightType) {
        return false;
      }
      // types match - return
      if (leftType === rightType) {
        return leftType;
      }

      // check numbers
      var iLeft = numberTypeScale.indexOf(leftType);
      if (iLeft > -1) {
        var iRight = numberTypeScale.indexOf(rightType);
        if (iRight > -1) {
          // promote left type
          if (iLeft < iRight) {
            leftType = rightType;
          }
          return leftType;
        }
        // left is number, right is not
        return false;
      }

      return false;
    },

    checkParamDuplicates: function (params) {
      for (var i=1,l=params.length; i<l; i++) {
        var curPram = params[i];
        for (var j=0; j<i; j++) {
          var prvParam = params[j];
          if (prvParam.id.name === curPram.id.name) {
            return curPram;
          }
        }
      }
      return false;
    },

    isNumber: function (type) {
      return numberTypeScale.indexOf(type) > -1;
    },

    compareNumberTypes: function (typeA, typeB) {
      var nA = numberTypeScale.indexOf(typeA);
      var nB = numberTypeScale.indexOf(typeB);
      if (nA > -1 && nB > -1) {
        return nA - nB;
      }
      else {
        return -Infinity; // something went wrong, check nA/nB
      }
    },

    isEqualityOperator: function (operator) {
      return equalityOperatorMap.indexOf(operator) > -1;
    },

    getIntegerType: function (number) {
      var nmb = parseInt(number, 10);
      var a_nmb = Math.abs(nmb);

      var resType = 'int';
      var last = signedIntegerLimits['long'];

      for (var nType in signedIntegerLimits) {
        if (signedIntegerLimits.hasOwnProperty(nType)) {
          var limit = signedIntegerLimits[nType];
          if (a_nmb <= limit && last >= limit) {
            resType = nType;
            last = limit;
          }
        }
      }

      return resType;
    }
  };

  // :: EXPORT
  return api;

})();
},{}],6:[function(require,module,exports){
module.exports = (function () {
  'use strict';

  // :: PRIVATE
  var table = {};
  var currentFunc = {
    node: null,
    returns: []
  };

  // @TODO: REFACTOR!  
  var numberTypes = ['byte', 'int', 'long', 'float'];
  var isNumber = function (type) {
    return numberTypes.indexOf(type) > -1;
  };
  
  // :: API
  var api = {
    getTable: function () {
      return table;
    },

    reset: function () {
      table = {};
      currentFunc = {
        node: null,
        returns: []
      };
    },

    getCurrentFunc: function () {
      return currentFunc;
    },

    enterFunc: function (node) {
      currentFunc.node = node;
    },

    exitFunc: function () {
      currentFunc = {
        node: null,
        returns: []
      };
    },

    funcAddReturn: function (node) {
      currentFunc.returns.push(node);
    },

    getSignature: function (node) {
      var cId = node.id || node.callee;
      var params = node.params;
      if (node['$$'] === 'CALL_STATEMENT') {
        params = node.arguments;
      } 
      var result = cId.name + '__';
      var reachedDefaultParam = false;
      var paramTypes = [];
      for (var i=0, l=params.length; i<l; i++) {
        var cParam = params[i];
        if ( !reachedDefaultParam && cParam.default) {
          result += '|'; // separate default params with pipes
          reachedDefaultParam = true;
        }
        var paramType = isNumber(cParam.type) ? 'num' : cParam.type;
        result += paramType + '_';
      }
      return result;
    },

    getParams: function (params) {
      var result = [];
      for (var i=0,l=params.length;i<l;i++) {
        var pr = params[i];
        result.push({
          type: pr.type,
          name: pr.id.name,
          default: pr.default
        });
      }
      return result;
    },

    funcHasDefaults: function (func) {
      return func.signature.match(/\|/) !== null;
    },

    findFunc: function (node) {
      var cId = node.id || node.callee;
      var name = cId.name;
      var signature = api.getSignature(node);
      if (table.hasOwnProperty(name)) {
        var tableFunc = table[name];
        for (var i=0, l=tableFunc.length; i<l; i++) {
          var cFunc = tableFunc[i];
          if (cFunc.signature === signature) {
            return cFunc; 
          }
          else if (api.funcHasDefaults(cFunc)) {
            // @TODO: REFACTOR!
            var sigSplit = cFunc.signature.split('|');
            var sigStart = sigSplit[0]; 
            var sigRest = sigSplit[1].split('_').slice(0, -1);
            for (var j=0, ll=sigRest.length; j<=ll; j++) {
              var sigTmp = sigStart + sigRest.slice(0, j).join('_');
              if (sigTmp[sigTmp.length - 1] !== '_') {
                sigTmp += '_';
              }
              if (sigTmp === signature) {
                return cFunc;
              }
            }
          }
        }
      }
      return null;
    },

    addFunc: function (node) {
      var signature = api.getSignature(node);
      var name = node.id.name;
      var type = node.type;
      var params = api.getParams(node.params);
      var initLine = node.location.start.line;
      var doc = (node.doc) ? node.doc.body : '';

      if (! table[name] ) {
        table[name] = [];
      }

      var func = {
        signature: signature,
        type: type,
        params: params,
        initLine: initLine,
        doc: doc,
        node: node
      };

      table[name].push(func);

      return func;
    }
  };

  // :: EXPORT
  return api;

})();

},{}],7:[function(require,module,exports){
module.exports = (function () {
  'use strict';

  // :: MODULES
  var initialScope = require('../../common/constants').DEFAULT_CONSTANTS;

  // :: PRIVATE
  var scopePointer = 1;
  var table = {
    sc0: initialScope,
    sc1: {}
  };
  var currentScope = table['sc' + scopePointer];

  // :: API
  var api = {

    setInitialScope: function (scope) {
      initialScope = scope;
      api.reset();
    },

    getTable: function() {
      return table;
    },

    reset: function () {
      scopePointer = 1;
      table = {
        sc0: initialScope,
        sc1: {}
      };
      currentScope = table['sc' + scopePointer];
    },

    enterScope: function () {
      scopePointer += 1;
      table['sc' + scopePointer] = {};
      currentScope = table['sc' + scopePointer];
    },

    exitScope: function () {
      if (scopePointer > 1) {
        table['sc' + scopePointer] = null;
      }
      scopePointer -= 1;
      currentScope = table['sc' + scopePointer];
    },

    getScope: function (num) {
      var scNum = (typeof num !== 'undefined') ? num : scopePointer;
      return table['sc' + scNum];
    },

    findSymbol: function (name) {
      for (var i = scopePointer; i >= 0; i--) {
        var tempScope = api.getScope(i);
        if (tempScope.hasOwnProperty(name)) {
          return tempScope[name];
        }
      }
      return null;
    },

    addSymbol: function (symbol, it) {
      var init = it || symbol.init;
      var name = symbol.id.name;
      var value = init.value;
      var type = init.type;
      var initLine = symbol.location.start.line;

      currentScope[name] = {
        name: name,
        value: value,
        type: type,
        initLine: initLine
      };
    },

    checkScope: function (name) {
      if (currentScope.hasOwnProperty(name)) {
        return currentScope[name];
      } else {
        return false;
      }
    }  
  };

  // :: EXPORT
  return api;
  
})();
},{"../../common/constants":1}]},{},[3])


//# sourceMappingURL=maps/evaluator.js.map
