(function (exports) {
  // :: SYMBOL TABLE
  'use strict';

  var initialScope = {};

  var scopePointer = 1;
  var table = {
    sc0: initialScope,
    sc1: {}
  };
  var currentScope = table['sc' + scopePointer];

  var api = {

    setInitialScope: function (scope) {
      initialScope = scope;
      reset();
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
      var scNum = num || scopePointer;
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
  }

  // :: EXPORT
  exports.SymbolTable = api;
  
})(exports || this);