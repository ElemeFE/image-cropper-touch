
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
    var binaryString = atob(dataURI.split(',')[1]);
    var arrayBuffer = new ArrayBuffer(binaryString.length);
    var intArray = new Uint8Array(arrayBuffer);

    for (var i = 0, j = binaryString.length; i < j; i++) {
      intArray[i] = binaryString.charCodeAt(i);
    }

    var data = [intArray];
    var type = 'image/png';

    var result;

    try {
      result = new Blob(data, { type: type });
    } catch(error) {
      // TypeError old chrome and FF
      window.BlobBuilder = window.BlobBuilder ||
        window.WebKitBlobBuilder ||
        window.MozBlobBuilder ||
        window.MSBlobBuilder;

      if(error.name == 'TypeError' && window.BlobBuilder){
        var builder = new BlobBuilder();
        builder.append(arrayBuffer);
        result = builder.getBlob(type);
      }
    }

    return result;
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