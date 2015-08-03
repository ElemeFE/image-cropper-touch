
var once = function(el, event, fn) {
  var listener = function() {
    if (fn) {
      fn.apply(this, arguments);
    }
    el.removeEventListener(event, listener);
  };
  el.addEventListener(event, listener);
};

module.exports = {
  dataURItoBlob: function (dataURI) {
    var binary = atob(dataURI.split(',')[1]);
    var array = [];

    for (var i = 0, j = binary.length; i < j; i++) {
      array.push(binary.charCodeAt(i));
    }

    return new Blob([new Uint8Array(array)], {
      type: dataURI.slice(5, dataURI.indexOf(';'))
    });
  },
  getTouchDistance: function(event) {
    var finger = event.touches[0];
    var finger2 = event.touches[1];

    var c1 = Math.abs(finger.pageX - finger2.pageX);
    var c2 = Math.abs(finger.pageY - finger2.pageY);

    return Math.sqrt( c1 * c1 + c2 * c2 );
  },
  translate: function(element, left, top, speed, callback) {
    element.style.webkitTransform = 'translate3d(' + (left || 0) + 'px, ' + (top || 0) + 'px, 0)';
    if (speed) {
      var called = false;

      var realCallback = function() {
        if (called) return;
        element.style.webkitTransition = '';
        called = true;
        if (callback) {
          callback.apply(this, arguments);
        }
      };
      element.style.webkitTransition = '-webkit-transform ' + speed + 'ms cubic-bezier(0.325, 0.770, 0.000, 1.000)';
      once(element, 'webkitTransitionEnd', realCallback);
      once(element, 'transitionend', realCallback);
      // for android...
      setTimeout(realCallback, speed + 50);
    } else {
      element.style.webkitTransition = '';
    }
  },
  translateElement: function(element, left, top) {
    element.style.webkitTransform = 'translate3d(' + (left || 0) + 'px, ' + (top || 0) + 'px, 0)';
  },
  getElementTranslate: function(element) {
    var transform = element.style.webkitTransform;
    var matches = /translate3d\((.*?)\)/ig.exec(transform);
    if (matches) {
      var translates = matches[1].split(',');
      return {
        left: parseInt(translates[0], 10),
        top: parseInt(translates[1], 10)
      }
    }
    return {
      left: 0,
      top: 0
    }
  }
};