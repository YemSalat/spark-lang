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

  var api = {
    generateType: function (type) {
      return typeMap[type] || type;
    }
  };

  // :: EXPORT
  return api;

})();