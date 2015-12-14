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