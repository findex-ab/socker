"use strict";
(() => {
  // src/utils.ts
  var sleep = (ms) => {
    return new Promise((resolve) => {
      setTimeout(resolve, ms);
    });
  };
})();
