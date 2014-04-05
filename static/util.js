var Util = (function () {
    function currier (fn) {
        var args = Array.prototype.slice.call(arguments, 1);

        return function() {
            return fn.apply(this, args.concat(
                Array.prototype.slice.call(arguments, 0)));
        };
    };

    return {'currier': currier}
}());

// Pythonesque range and arange functions
Array.range = function (n) {
    return Array.arange(0, n, 1);
};

Array.arange = function (start, stop, step) {
    var len = Math.round((stop - start) / step);
    return Array.apply(null, Array(len)).map(function (_, i) { return start + i*step; });
};

Array.prototype.remove = function(value) {
  var idx = this.indexOf(value);
  if (idx != -1) {
      return this.splice(idx, 1);
  }
  return false;
}
