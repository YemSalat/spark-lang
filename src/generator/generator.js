module.exports = (function() {
  'use strict';

  // :: MODULES
  var useWatcher = require('./modules/UseWatcher');
  var indentManager = require('./modules/IndentManager');
  var util = require('./modules/GeneratorUtil');

  // :: CONSTANTS
  var DEFAULT_FUNCTIONS = require('./../common/functions').DEFAULT_FUNCTIONS;

  // :: ERRORS
  function GeneratorError (name, message, location) {
    this.name = name;
    this.message = message;
    this.location = location;
  }

  // :: PRIVATE
  // generate c++ code for parse tree node
  var __generateNode = function (node, method) {
    if (node === null) {
      return '';
    }
    var mType = method || node['$$'];
    var pNode = evaluate[mType](node);
    if (pNode.error) {
      throw new GeneratorError('SemanticError', pNode.error.message, pNode.error.location);
    }
    return pNode;
  };



  // pre-process output
  var __preProcess = function (code) {
    var result = '';
    // @TODO: Refactor
    if (useWatcher.isUsed('print') || useWatcher.isUsed('println')) {
      result = 'Serial.begin( 9600 );\n\n';
    }

    result = result + code;

    return result;
  };

  // post-process output
  var __postProcess = function (code) {
    var result = code.trim().replace(/([a-z0-9])[ ]+/gi, '$1 ');
    return result;
  };


  // :: API
  var api = {
    parse: function (tree) {
      var code;

      // reset uses watcher
      useWatcher.reset();
      
      code = __generateNode(tree);
      code = __preProcess(code);
      code = __postProcess(code);

      return code;
    }
  };

  // :: GENERATE
  var evaluate = {

    DOCSTRING: function(node) {
      return '// ' + node.body.join('\n// ') + '\n';
    },
    
    VARIABLE_STATEMENT: function(node) {
      var result = util.generateType(node.type) + ' ';

      var decs = [];
      for (var i=0,l=node.declarations.length; i<l; i++) {
        var item = node.declarations[i];
        var curDec = '';
        
        var varPostfix = '';
        if (item.type === 'str') {
          varPostfix = '[]';
        }
        curDec += __generateNode(item.id) + varPostfix;

        if (item.init) {

          curDec += ' = ' + __generateNode(item.init);
        }

        decs.push( curDec );
      }

      result += decs.join(', ');

      return result;
    },

    VARIABLE_DECLARATOR: function (node) {
      return node;
    },

    FUNCTION_DECLARATION: function (node) {
      var result = '';
      if (node.doc) {
        result += __generateNode(node.doc);
      }

      result += node.type + ' ' + node.id.name + ' ( ';

      var fnParams = [];
      for (var i=0, l=node.params.length; i<l; i++) {
        var prm = __generateNode(node.params[i]);
        fnParams.push(prm);
      }

      result += fnParams.join(', ');

      result += ' ) ';

      // parse function body
      result += __generateNode(node.body);
      
      return result;
    },

    PARAM_DECLARATOR: function (node) {
      var result = util.generateVarDeclaration(node);
      return result;
    },

    RETURN_STATEMENT: function (node) {
      var result = 'return ' + __generateNode(node.argument);
      return result;
    },

    CALL_STATEMENT: function (node) {
      var fName = node.callee.name;
      var result = fName;
      if (DEFAULT_FUNCTIONS.hasOwnProperty(fName)) {
        result = DEFAULT_FUNCTIONS[fName];
        useWatcher.add(fName);
      }

      // output arguments
      result += '(';

      var args = [];
      for (var i=0, l=node['arguments'].length; i<l; i++) {
        var curArg = node['arguments'][i];
        args.push(__generateNode(curArg));
      }
      if (args.length > 0) {
        result += ' ' + args.join(', ') + ' ';
      }

      result += ')';

      return result;
    },

    FOR_STATEMENT: function (node) {
      var result = 'for (';
      result += __generateNode(node.init) + ' ; ';
      result += __generateNode(node.test) + ' ; ';
      result += __generateNode(node.update) + ' )';
      result += __generateNode(node.body);
      return result;
    },

    BREAK_STATEMENT: function (node) {
      return node;
    },

    CONTINUE_STATEMENT: function (node) {
      return node;
    },

    EXPRESSION_STATEMENT: function (node) {
      var result = __generateNode(node.expression);
      return result;
    },

    IDENTIFIER: function (node) {
      return node.name;
    },

    LITERAL: function(node) {
      var result = node.value;
      if (node.type === 'str') {
        result = '"' + result + '"';
      }
      return result;
    },

    BINARY_EXPRESSION: function (node) {
      var result = '';
      // eval left and right parts first
      result += __generateNode(node.left);
      result += ' ' + node.operator + ' ';
      result += __generateNode(node.right);
      return result;
    },

    ASSIGNMENT_STATEMENT: function (node) {
      var result = __generateNode(node.left);
      // eval asignment right hand side
      result += ' = ' + __generateNode(node.right);
      return result;
    },

    ASSIGNMENT_ACTION: function (node) {
      var result = __generateNode(node.left);
      // eval asignment right hand side
      result += ' '+ node.operator +' ' + __generateNode(node.right);
      return result;
    },

    BLOCK_STATEMENT: function (node) {
      var result = ' {\n';

      indentManager.increase();

      node.body.forEach(function(item) {
        result += indentManager.getCurrentIndent() + __generateNode(item);
        if (!result.match(/\}\s*$/g)) {
          result += ';\n';
        }
        if (!result.match(/\n\s*$/g)) {
          result += '\n';
        }
      });

      indentManager.decrease();
      
      result += indentManager.getCurrentIndent() + '}\n';

      return result;
    },

    PROGRAM: function (node) {
      var result = '';
      node.body.forEach(function(item) {
        result += indentManager.getCurrentIndent() + __generateNode(item);
        if (!result.match(/\}\s*$/g)) {
          result += ';';
        }
        result += '\n';
      });
      
      return result;
    },

    IF_STATEMENT: function (node) {

      var result = 'if ( ';

      result += __generateNode(node.test);
      result += ' )';
      result += __generateNode(node.consequent);

      if (node.alternate) {
      result += indentManager.getCurrentIndent() + 'else ';
        result += __generateNode(node.alternate);
      }
      return result;
    },

    LOGICAL_EXPRESSION: function (node) {
      var result = __generateNode(node.left) + ' ' + node.operator + ' ' + __generateNode(node.right);
      return result;
    },

    UPDATE_EXPRESSION: function (node) {
      var result = '';
      if (node.prefix) {
        result += node.operator + __generateNode(node.argument);
      }
      else {
        result += __generateNode(node.argument) + node.operator;
      }
      return result;
    },

    UNARY_EXPRESSION: function (node) {
      var result = node.operator + '';
      result += __generateNode(node.argument);
      return result;
    }

  };

  // :: SPARK GENERATOR
  global.SparkGenerator = api;
  return api;

})();