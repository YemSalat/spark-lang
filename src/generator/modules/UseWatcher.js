module.exports = (function () {
  'use strict';

  // :: PRIVATE
  var uses = [];

  // :: API
  var api = {
    add: function (func) {
      if (uses.indexOf(func) === -1) {
        uses.push(func);
        return func;
      }
      return false;
    },

    isUsed: function (func) {
      return uses.indexOf(func) > -1;
    },

    getUses: function () {
      return uses;
    },

    reset: function () {
      uses = [];
    }
  };
  
  // :: EXPORT
  return api;

})();