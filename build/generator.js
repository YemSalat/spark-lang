(function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){
module.exports = (function () {
  // :: CONSTANTS
  'use strict';
  
  var DEFAULT_FUNCTIONS = {
    millis: 'millis',
    pinRead: 'digitalRead',
    pinWrite: 'digitalWrite',
    pinMode: 'pinMode',
    print: 'Serial.print',
    printn: 'Serial.println'
  };

  return DEFAULT_FUNCTIONS;

})();
},{}],2:[function(require,module,exports){
(function (global){
module.exports = (function() {
  'use strict';

  // :: MODULES
  var useWatcher = require('./modules/UseWatcher');
  var indentManager = require('./modules/IndentManager');
  var util = require('./modules/GeneratorUtil');

  // :: CONSTANTS
  var DEFAULT_FUNCTIONS = require('./../common/DEFAULT_FUNCTIONS');

  // :: OP
  var __generateNode = function (node, method) {
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

  var __preProcess = function (code) {
    var result = '';
    // @TODO: Refactor
    if (useWatcher.isUsed('print') || useWatcher.isUsed('println')) {
      result = 'Serial.begin( 9600 );\n\n';
    }

    result = result + code;

    return result;
  };

  var __postProcess = function (code) {
    var result = code.trim().replace(/([a-z0-9])[ ]+/gi, '$1 ');
    return result;
  };

  // :: VARS

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

      result += '( ';
      var args = [];
      for (var i=0, l=node['arguments'].length; i<l; i++) {
        var curArg = node['arguments'][i];
        args.push(__generateNode(curArg));
      }
      result += args.join(', ');

      result += ' )';

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
}).call(this,typeof global !== "undefined" ? global : typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : {})

},{"./../common/DEFAULT_FUNCTIONS":1,"./modules/GeneratorUtil":3,"./modules/IndentManager":4,"./modules/UseWatcher":5}],3:[function(require,module,exports){
module.exports = (function () {
  // :: UTIL
  'use strict';

  var typeMap = {
    'byte'  : 'char',
    'ubyte' : 'unsigned char',
    'int'   : 'int',
    'uint'  : 'unsigned int',
    'long'  : 'long',
    'ulong' : 'unsigned long',
    'float' : 'float',
    'str'   : 'char',
    'void'  : 'void',
  };

  var typeDescriptors = {
    'str' : {
      isArray: true,
      isString: true
    }
  }

  var api = {
    generateType: function (type) {
      return typeMap[type] || type;
    },

    generateVarDeclaration: function (node) {
      var type = api.generateType(node.type);
      var name = node.id.name;
      if (typeDescriptors.hasOwnProperty(node.type)) {
        var td = typeDescriptors[node.type];
        if (td.isArray) {
          return type + ' ' + name + '[]';
        }
      }
      return type + ' ' + name;
    } 
  };

  // :: EXPORT
  return api;

})();
},{}],4:[function(require,module,exports){
module.exports = (function () {
  // :: INDENT MANAGER
  'use strict';

  var indentLevel = 0;
  var indentChar = '  ';
  var currentIndent = '';

  var api = {
    getCurrentIndent: function () {
      return currentIndent;
    },
    increase: function () {
      indentLevel += 1;
      currentIndent = Array(indentLevel + 1).join(indentChar);
      console.log('currentIndent');
      console.log(currentIndent.length);
    },
    decrease: function () {
      indentLevel -= 1;
      currentIndent = Array(indentLevel + 1).join(indentChar);
    }
  }

  // :: EXPORT
  return api;

})();
},{}],5:[function(require,module,exports){
module.exports = (function () {
  var uses = [];

  var api = {
    add: function (func) {
      if (uses.indexOf(func) === -1) {
        uses.push(func);
        return func;
      }
      return false;
    },

    isUsed: function (func) {
      return uses.indexOf(func) > -1;
    },

    getUses: function () {
      return uses;
    },

    reset: function () {
      uses = [];
    }
  }
  
  // :: EXPORT
  return api;

})();
},{}]},{},[2])


//# sourceMappingURL=maps/generator.js.map
