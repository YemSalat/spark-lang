module.exports = (function () {
  // :: FUNCTION TABLE
  'use strict';

  var table = {};
  var currentFunc = {
    node: null,
    returns: []
  };
  
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
      var params = node.params;
      if (node['$$'] === 'CALL_STATEMENT') {
        params = node.arguments;
      } 
      var result = node.type + '__' + node.id.name + '__';
      for (var i=0, l=params.length; i<l; i++) {
        result += params[i].type + '_';
      }
      result += 'fn';
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

    findFunc: function (node) {
      var name = node.id.name;
      var signature = api.getSignature(node);
      if (table.hasOwnProperty(name)) {
        var tableFunc = table[name];
        for (var i=0, l=tableFunc.length; i<l; i++) {
          var cFunc = tableFunc[i];
          if (cFunc.signature === signature) {
            return cFunc; 
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
      var doc = (node.doc) ? node.doc.body : "";

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
  }
  // :: EXPORT
  return api;

})();
