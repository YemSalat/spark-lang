module.exports = (function() {
  'use strict';

  // :: MODULES
  var symbolTable = require('./modules/SymbolTable')
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

  // :: OP
  var __evalNode = function(node, method) {
    var mType = method ||
                (node !== null) ? node['$$'] : null;

    var pNode = null;
    if (mType) {
      pNode = evaluate[mType](node)
      if (pNode.error) {
        console.log(JSON.stringify( pNode ));
        throw new SemanticError('SemanticError', pNode.error.message, pNode.error.location);
      }
    }
    else {
      console.log('Node evaluation method is not defined for:');
      console.log(node);
    }

    return pNode;
  };

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

  // :: EVALUATE
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
          return errorManager.logError(node, node.location, 'already_exists', [item.id.name, variable.value, variable.initLine]);
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
        var cArg = node.arguments[i] = __evalNode(node.arguments[i]);
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

  // :: SPARK EVALUATOR
  global.SparkEvaluator = api;
  return api;

})();
