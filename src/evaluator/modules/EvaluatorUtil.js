module.exports = (function () {
  // :: UTILS
  'use strict';
  var numberTypeScale = ['byte', 'int', 'long', 'float'];
  var equalityOperatorMap = ['==', '!=', 'is', 'is not'];
  var signedIntegerLimits = {
    'byte': 128,
    'int': 32767,
    'long': 2147483647
  };
  
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
    getParameters: function (paramArray) {

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