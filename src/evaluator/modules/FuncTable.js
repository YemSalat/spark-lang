module.exports = (function () {
  // :: FUNCTION TABLE
  'use strict';

  var table = {};
  var currentFunc = {
    node: null,
    returns: []
  };

  // @TODO: REFACTOR!  
  var numberTypes = ['byte', 'int', 'long', 'float'];
  var isNumber = function (type) {
    return numberTypes.indexOf(type) > -1;
  }
  
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
