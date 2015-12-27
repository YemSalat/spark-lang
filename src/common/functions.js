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
      println: 'Serial.println'
    }
  };

  return api;

})();