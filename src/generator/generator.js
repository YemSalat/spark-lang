module.exports = (function() {
  'use strict';

  // :: MODULES
  var indentManager = require('./modules/IndentManager');
  var util = require('./modules/GeneratorUtil');

  // :: OP
  var __generateNode = function(node, method) {
    if (node === null) {
      return '';
    }
    var mType = method || node['$$'];
    var pNode = evaluate[mType](node)
    if (pNode.error) {
      throw new CompilerError('SemanticError', pNode.error.message, pNode.error.location);
    }
    return pNode;
  };

  // :: GENERATE
  var evaluate = {

    DOCSTRING: function(node) {
      return '// ' + node.body.join('\n// ') + '\n';
    },
    
    VARIABLE_STATEMENT: function(node) {
      var result = util.generateType(node.type) + ' ';

      for (var i=0,l=node.declarations.length; i<l; i++) {
        var item = node.declarations[i];
        
        var varPostfix = '';
        if (item.type === 'str') {
          varPostfix = '[]';
        }
        result += __generateNode(item.id) + varPostfix;

        if (item.init) {

          result += ' = ' + __generateNode(item.init);
        }
      }

      return result;
    },

    VARIABLE_DECLARATOR: function (node) {
      return node;
    },


    FUNCTION_DECLARATION: function (node) {
      var result = ''
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

      result += ' ) '

      // parse function body
      result += __generateNode(node.body);
      
      return result;
    },
    PARAM_DECLARATOR: function (node) {
      var result = util.generateType(node.type) + ' ' + node.id.name;
      return result;
    },
    RETURN_STATEMENT: function (node) {
      var result = 'return ' + __generateNode(node.argument);
      return result;
    },
    CALL_STATEMENT: function (node) {
      var result = node.name;
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

    BLOCK_STATEMENT: function (node) {
      var result = ' {\n';

      indentManager.increase();

      node.body.forEach(function(item) {
        result += indentManager.getCurrentIndent() + __generateNode(item) + ';\n';
      });

      indentManager.decrease();
      
      result += '}\n';

      return result;
    },

    PROGRAM: function (node) {
      var result = '';
      node.body.forEach(function(item) {
        result += indentManager.getCurrentIndent() + __generateNode(item);
        if (!result.match(/\}[\s]*$/)) {
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
      result += 'else ';
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

  var api = {
    parse: function (tree) {

      var code = __generateNode(tree);
      return code.trim();
    }
  };
  // :: SPARK GENERATOR
  global.SparkGenerator = api;
  return api;

})();