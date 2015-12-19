module.exports = (function () {
  // :: CONSTANTS
  'use strict';
  
  var api = {
      DEFAULT_FUNCTIONS: {
      millis: 'millis',
      pinRead: 'digitalRead',
      pinWrite: 'digitalWrite',
      pinMode: 'pinMode',
      print: 'Serial.print',
      printn: 'Serial.println'
    }
  }

  return api;

})();