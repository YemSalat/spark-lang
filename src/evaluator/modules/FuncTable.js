(function (exports) {
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
      current.returns.push(node);
    },

    getSignature: function (node) {
      var result = node.type + '__' + node.id.name + '__';
      for (var i=0, l=node.params.length; i<l; i++) {
        result += node.params[i].type + '_';
      }
      result += 'fn';
      return result;
    },

    getParams: function (params) {
      var result = [];
      for (var i=0,l=params.length;i<l;i++) {
        var pr = params[i];
        result.push({ type: pr.type, name: pr.id.name });
      }
      return result;
    },

    findFunc: function (node) {
      var signature = api.getSignature(node);
      if (table.hasOwnProperty(signature)) {
        return table[signature];
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

      table[signature] = {
        name: name,
        type: type,
        params: params,
        initLine: initLine,
        doc: doc
      };
    }
  }
  // :: EXPORT
  exports.FuncTable = api;

})(exports || this);
