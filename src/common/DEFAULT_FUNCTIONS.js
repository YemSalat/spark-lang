module.exports = (function () {
  // :: CONSTANTS
  'use strict';
  
  var DEFAULT_FUNCTIONS = {
    millis: 'millis',
    pinRead: 'digitalRead',
    pinWrite: 'digitalWrite',
    pinMode: 'pinMode',
    print: 'Serial.print',
    printn: 'Serial.println'
  };

  return DEFAULT_FUNCTIONS;

})();