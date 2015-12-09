(function(exports) {
  'use strict';

  // :: CONSTANTS
  var DEFAULT_CONSTANTS = require('./modules/DEFAULT_CONSTANTS');

  // :: ERRORS
  function SemanticError (name, message, location) {
    this.name = name;
    this.message = message;
    this.location = location;
  }

  // :: MODULES
  var symbolTable = require('./modules/SymbolTable');
  var funcTable = require('./modules/FuncTable');
  var errorManager = require('./modules/ErrorManager');
  var util = require('./modules/EvaluatorUtil');

  // :: OP
  var __evalNode = function(node, method) {
    var mType = method || node['$$'];
    var pNode = evaluate[mType](node)
    if (pNode.error) {
      throw new SemanticError('SemanticError', pNode.error.message, pNode.error.location);
    }
    return pNode;
  };

  var api = {
    parse: function (tree, options) {
      // reset tables
      symbolTable.reset(); 
      funcTable.reset();

      var _nd = __evalNode(tree);
      console.log(symbolTable.getTable());

      return _nd;
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
          symbolTable.addSymbol(item, { value: null, type: node.type });
        }
      }

      return node;
    },

    VARIABLE_DECLARATOR: function (node) {
      return node;
    },


    FUNCTION_DECLARATION: function (node) {
      var cFunc = funcTable.findFunc(node);
      if (cFunc) {
        // error
        return errorManager.logError(node, node.location, 'already_exists', [cFunc.name, cFunc.initLine]);
      }

      // check duplicate params
      var cParam = util.checkParamDuplicates(node.params);
      if (cParam) {
        return errorManager.logError(cParam, cParam.location, 'duplicate_param', [cParam.id.name]);
      }

      funcTable.addFunc(node);

      // increase current scope
      symbolTable.enterScope();
      // enter function (used for return check)
      funcTable.enterFunc(node);
      // parse function body
      node.body = __evalNode(node.body);
      // exit function
      funcTable.exitFunc();
      // exit scope
      symbolTable.exitScope();

      return node;
    },
    PARAM_DECLARATOR: function (node) {
      return node;
    },
    RETURN_STATEMENT: function (node) {
      node.argument = __evalNode(node.argument);
      // set return statement type
      node.type = node.argument.type;

      // check type matches current function
      var curFunc = getCurrentFunc();
      if (!curFunc.node) {
        return errorManager.logError(node, node.location, 'return_outside');
      }
      var cType = util.typeCheck(node.type, curFunc.type);
      if (!cType) {
        return errorManager.logError(node, node.location, 'type_mismatch', [curFunc.node.id.name]);
      }

      return node;
    },
    CALL_STATEMENT: function (node) {
      node.type = 'int';
      return node;
    },



    FOR_STATEMENT: function (node) {
      return node;
    },

    FOR_STATEMENT_DECLARATION: function (node) {
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
      var cType = util.typeCheck(node.argument.type);
      if (cType !== 'bool') {
        // error
        return errorManager.logError(node, node.location, 'not_a_bool');
      }
      return node;
    }

  };

  // :: SPARK EVALUATOR
  window.theEvaluator = api;

})(exports || this);