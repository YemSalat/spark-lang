(function (exports) {
  // :: INDENT MANAGER
  'use strict';

  var indentLevel = 0;
  var indentChar = '  ';
  var currentIndent = '';

  var api = {
    getCurrentIndent: function () {
      return currentIndent;
    },
    increase: function () {
      indentLevel += 1;
      currentIndent = Array(indentLevel + 1).join(indentChar);
    },
    decrease: function () {
      indentLevel -= 1;
      currentIndent = Array(indentLevel + 1).join(indentChar);
    }
  }

  // :: EXPORT
  module.exports.IndentManager = api;

})(this);