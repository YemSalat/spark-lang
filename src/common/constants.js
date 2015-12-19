module.exports = (function () {
  // :: CONSTANTS
  'use strict';
  
  var api = {
    DEFAULT_CONSTANTS: {
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
    }
  };

  return api;

})();