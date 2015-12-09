(function (module) {
  var moduleName = 'GeneratorUtil';
  if (module.checkModule(moduleName)) {
    return;
  }
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

  var util = {
    generateType: function (type) {
      return typeMap[type] || type;
    }
  };

  // :: EXPORT
  module.exportModule(moduleName, util);

})(this);