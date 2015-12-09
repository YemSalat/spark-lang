(function (module) {
  var moduleName = 'DEFAULT_CONSTANTS';
  if (module.checkModule(moduleName)) {
    return;
  }
  // :: CONSTANTS
  'use strict';
  
  var DEFAULT_CONSTANTS = {
    LOW: {
      name: 'LOW',
      type: 'int',
      value: 0
    },
    HIGH: {
      name: 'HIGH',
      type: 'int',
      value: 1
    },
    READ: {
      name: 'READ',
      type: 'int',
      value: 0
    },
    WRITE: {
      name: 'WRITE',
      type: 'int',
      value: 1
    }
  };

  // :: EXPORT
  module.exportModule(moduleName, DEFAULT_CONSTANTS);
})(this);