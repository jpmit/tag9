// util.js
// utility stuff

// used for removing sprites (only bullets in fact)
Array.prototype.remove = function(value) {
  var idx = this.indexOf(value);
  if (idx != -1) {
      return this.splice(idx, 1);
  }
  return false;
}
