module.exports = (function () {
  'use strict';

  // :: PRIVATE
  var indentLevel = 0;
  var indentChar = '  ';
  var currentIndent = '';

  // :: API
  var api = {

    getCurrentIndent: function () {
      return currentIndent;
    },
    
    increase: function () {
      indentLevel += 1;
      currentIndent = new Array(indentLevel + 1).join(indentChar);
    },

    decrease: function () {
      indentLevel -= 1;
      currentIndent = new Array(indentLevel + 1).join(indentChar);
    }
  };

  // :: EXPORT
  return api;

})();