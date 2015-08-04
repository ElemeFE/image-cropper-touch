(function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){
var util = require('./util');

var translateElement = util.translateElement;
var getElementTranslate = util.getElementTranslate;
var getDistance = util.getTouchDistance;
var translate = util.translate;
var dataURItoBlob = util.dataURItoBlob;

var Cropper = function() {
  if (!('ontouchstart' in window)) {
    throw new Error('this demo should run in mobile device');
  }

  this.imageState = {};
};

Cropper.prototype = {
  constructor: Cropper,

  setImage: function(src) {
    var self = this;
    self.imageLoading = true;
    self.image = src;

    self.resetSize();

    var image = new Image();

    image.onload = function() {
      var selfImage = self.refs.image;

      selfImage.src = src;

      var originalWidth = image.width;
      var originalHeight = image.height;

      self.imageState.left = self.imageState.top = 0;

      self.imageState.width = originalWidth;
      self.imageState.height = originalHeight;

      self.initScale();

      var minScale = self.scaleRange[0];
      var imageWidth = minScale * originalWidth;
      var imageHeight = minScale * originalHeight;
      selfImage.style.width = imageWidth + 'px';
      selfImage.style.height = imageHeight + 'px';

      var imageLeft, imageTop;

      var cropBoxRect = self.cropBoxRect;

      if (originalWidth > originalHeight) {
        imageLeft = (cropBoxRect.width - imageWidth) / 2 +cropBoxRect.left;
        imageTop = cropBoxRect.top;
      } else {
        imageLeft = cropBoxRect.left;
        imageTop = (cropBoxRect.height - imageHeight) / 2 + cropBoxRect.top;
      }

      self.moveImage(imageLeft, imageTop);

      self.imageLoading = false;
    };
    image.src = src;
  },

  getFocalPoint: function(event) {
    var focalPoint = {
      left: (event.touches[0].pageX + event.touches[1].pageX) / 2,
      top: (event.touches[0].pageY + event.touches[1].pageY) / 2
    };

    var imageState = this.imageState;
    var cropBoxRect = this.cropBoxRect;

    focalPoint.left -= cropBoxRect.left + imageState.left;
    focalPoint.top -= cropBoxRect.top + imageState.top;

    return focalPoint;
  },

  render: function(parentNode) {
    var element = document.createElement('div');
    element.className = 'cropper';

    var coverStart = document.createElement('div');
    var coverEnd = document.createElement('div');
    var cropBox = document.createElement('div');
    var image = document.createElement('img');

    coverStart.className = 'cover cover-start';
    coverEnd.className = 'cover cover-end';
    cropBox.className = 'crop-box';

    element.appendChild(coverStart);
    element.appendChild(coverEnd);
    element.appendChild(cropBox);
    element.appendChild(image);

    this.refs = {
      element: element,
      coverStart: coverStart,
      coverEnd: coverEnd,
      cropBox: cropBox,
      image: image
    };

    if (parentNode) {
      parentNode.appendChild(element);
    }

    if (element.offsetHeight > 0) {
      this.resetSize();
    }

    this.bindEvents();
  },

  initScale: function () {
    var cropBoxRect = this.cropBoxRect;
    var width = this.imageState.width;
    var height = this.imageState.height;
    var scale, minScale;

    if (width > height) {
      scale = this.imageState.scale = cropBoxRect.height / height;
      minScale = cropBoxRect.height * 0.8 / height;
    } else {
      scale = this.imageState.scale = cropBoxRect.width / width;
      minScale = cropBoxRect.width * 0.8 / width;
    }

    this.scaleRange = [scale, 2];
    this.bounceScaleRange = [minScale, 3];
  },

  resetSize: function() {
    var refs = this.refs;
    if (!refs) return;

    var element = refs.element;
    var cropBox = refs.cropBox;
    var coverStart = refs.coverStart;
    var coverEnd = refs.coverEnd;

    var width = element.offsetWidth;
    var height = element.offsetHeight;

    if (width > height) {
      element.className = 'cropper cropper-horizontal';

      coverStart.style.width = coverEnd.style.width = (width - height) / 2 + 'px';
      coverStart.style.height = coverEnd.style.height = '';
      cropBox.style.width = cropBox.style.height = height + 'px';
    } else {
      element.className = 'cropper';

      coverStart.style.height = coverEnd.style.height = (height - width) / 2 + 'px';
      coverStart.style.width = coverEnd.style.width = '';
      cropBox.style.width = cropBox.style.height = width + 'px';
    }

    var elementRect = element.getBoundingClientRect();
    var cropBoxRect = cropBox.getBoundingClientRect();

    this.cropBoxRect = {
      left: cropBoxRect.left - elementRect.left,
      top: cropBoxRect.top - elementRect.top,
      width: cropBoxRect.width,
      height: cropBoxRect.height
    };

    this.initScale();

    this.checkBounce(0);
  },

  checkBounce: function (speed) {
    var imageState = this.imageState;
    var cropBoxRect = this.cropBoxRect;

    var imageWidth = imageState.width;
    var imageHeight = imageState.height;
    var imageScale = imageState.scale;

    var imageOffset = getElementTranslate(this.refs.image);
    var left = imageOffset.left;
    var top = imageOffset.top;

    var leftRange = [-imageWidth * imageScale + cropBoxRect.width + cropBoxRect.left, cropBoxRect.left];
    var topRange = [-imageHeight * imageScale + cropBoxRect.height + cropBoxRect.top, cropBoxRect.top];

    var overflow = false;

    if (left < leftRange[0]) {
      left = leftRange[0];
      overflow = true;
    } else if (left > leftRange[1]) {
      left = leftRange[1];
      overflow = true;
    }

    if (top < topRange[0]) {
      top = topRange[0];
      overflow = true;
    } else if (top > topRange[1]) {
      top = topRange[1];
      overflow = true;
    }

    if (overflow) {
      var self = this;
      translate(this.refs.image, left, top, speed === undefined ? 200 : 0, function() {
        self.moveImage(left, top);
      });
    }
  },

  moveImage: function(left, top) {
    var image = this.refs.image;
    translateElement(image, left, top);

    this.imageState.left = left;
    this.imageState.top = top;
  },

  onTouchStart: function(event) {
    this.amplitude = 0;
    var image = this.refs.image;

    var fingerCount = event.touches.length;
    if (fingerCount) {
      var touchEvent = event.touches[0];

      var imageOffset = getElementTranslate(image);

      this.dragState = {
        timestamp: Date.now(),
        startTouchLeft: touchEvent.pageX,
        startTouchTop: touchEvent.pageY,
        startLeft: imageOffset.left || 0,
        startTop: imageOffset.top || 0
      };
    }

    if (fingerCount >= 2) {
      var zoomState = this.zoomState = {
        timestamp: Date.now()
      };

      zoomState.startDistance = getDistance(event);
      zoomState.focalPoint = this.getFocalPoint(event);
    }
  },

  onTouchMove: function(event) {
    var fingerCount = event.touches.length;

    var touchEvent = event.touches[0];

    var cropBoxRect = this.cropBoxRect;
    var image = this.refs.image;

    var imageState = this.imageState;
    var imageWidth = imageState.width;
    var imageHeight = imageState.height;

    var dragState = this.dragState;
    var zoomState = this.zoomState;

    if (fingerCount === 1) {
      var leftRange = [ -imageWidth * imageState.scale + cropBoxRect.width, cropBoxRect.left ];
      var topRange = [ -imageHeight * imageState.scale + cropBoxRect.height + cropBoxRect.top, cropBoxRect.top ];

      var deltaX = touchEvent.pageX - (dragState.lastLeft || dragState.startTouchLeft);
      var deltaY = touchEvent.pageY - (dragState.lastTop || dragState.startTouchTop);

      var imageOffset = getElementTranslate(image);

      var left = imageOffset.left + deltaX;
      var top = imageOffset.top + deltaY;

      if (left < leftRange[0] || left > leftRange[1]) {
        left -= deltaX / 2;
      }

      if (top < topRange [0] || top > topRange[1]) {
        top -= deltaY / 2;
      }

      this.moveImage(left, top);
    } else if (fingerCount >= 2) {
      if (!zoomState.timestamp) {
        zoomState = {
          timestamp: Date.now()
        };

        zoomState.startDistance = getDistance(event);
        zoomState.focalPoint = this.getFocalPoint(event);

        return;
      }

      var newDistance = getDistance(event);
      var oldScale = imageState.scale;

      imageState.scale = oldScale * newDistance / (zoomState.lastDistance || zoomState.startDistance);

      var scaleRange = this.scaleRange;
      if (imageState.scale < scaleRange[0]) {
        imageState.scale = scaleRange[0];
      } else if (imageState.scale > scaleRange[1]) {
        imageState.scale = scaleRange[1];
      }

      this.zoomWithFocal(oldScale);

      zoomState.focalPoint = this.getFocalPoint(event);
      zoomState.lastDistance = newDistance;
    }

    dragState.lastLeft = touchEvent.pageX;
    dragState.lastTop = touchEvent.pageY;
  },

  onTouchEnd: function(event) {
    var imageState = this.imageState;
    var zoomState = this.zoomState;
    var dragState = this.dragState;
    var amplitude = this.amplitude;
    var imageWidth = imageState.width;
    var imageHeight = imageState.height;
    var cropBoxRect = this.cropBoxRect;

    if (event.touches.length === 0 && dragState.timestamp) {
      var self = this;
      var duration = Date.now() - dragState.timestamp;

      if (duration > 300) {
        self.checkBounce();
      } else {
        var target;

        var top = imageState.top;
        var left = imageState.left;

        var momentumVertical = false;

        var timeConstant = 160;

        var autoScroll = function () {
          var elapsed, delta;

          if (amplitude) {
            elapsed = Date.now() - timestamp;
            delta = -amplitude * Math.exp(-elapsed / timeConstant);
            if (delta > 0.5 || delta < -0.5) {
              if (momentumVertical) {
                self.moveImage(left, target + delta);
              } else {
                self.moveImage(target + delta, top);
              }

              requestAnimationFrame(autoScroll);
            } else {
              var currentLeft;
              var currentTop;

              if (momentumVertical) {
                currentLeft = left;
                currentTop = target;
              } else {
                currentLeft = target;
                currentTop = top;
              }

              self.moveImage(currentLeft, currentTop);
              self.checkBounce();
            }
          }
        };

        var velocity;

        var deltaX = event.changedTouches[0].pageX - dragState.startTouchLeft;
        var deltaY = event.changedTouches[0].pageY - dragState.startTouchTop;

        if (Math.abs(deltaX) > Math.abs(deltaY)) {
          velocity = deltaX / duration;
        } else {
          momentumVertical = true;
          velocity = deltaY / duration;
        }

        amplitude = 80 * velocity;

        var range;

        if (momentumVertical) {
          target = Math.round(imageState.top + amplitude);
          range = [-imageHeight * imageState.scale + cropBoxRect.height / 2 + cropBoxRect.top, cropBoxRect.top + cropBoxRect.height / 2];
        } else {
          target = Math.round(imageState.left + amplitude);
          range = [-imageWidth * imageState.scale + cropBoxRect.width / 2, cropBoxRect.left + cropBoxRect.width / 2];
        }

        if (target < range[0]) {
          target = range[0];
          amplitude /= 2;
        } else if (target > range[1]) {
          target = range[1];
          amplitude /= 2;
        }

        var timestamp = Date.now();
        requestAnimationFrame(autoScroll);
      }

      this.dragState = {};
    } else if (zoomState.timestamp) {
      this.checkBounce();

      this.zoomState = {};
    }
  },

  zoomWithFocal: function(oldScale) {
    var image = this.refs.image;
    var imageState = this.imageState;
    var imageScale = imageState.scale;

    image.style.width = imageState.width * imageScale + 'px';
    image.style.height = imageState.height * imageScale + 'px';

    var focalPoint = this.zoomState.focalPoint;

    var offsetLeft = (focalPoint.left / imageScale - focalPoint.left / oldScale) * imageScale;
    var offsetTop = (focalPoint.top / imageScale - focalPoint.top / oldScale) * imageScale;

    var imageLeft = imageState.left || 0;
    var imageTop = imageState.top || 0;

    this.moveImage(imageLeft + offsetLeft, imageTop + offsetTop);
  },

  bindEvents: function() {
    var cropBox = this.refs.cropBox;

    cropBox.addEventListener('touchstart', this.onTouchStart.bind(this));

    cropBox.addEventListener('touchmove', this.onTouchMove.bind(this));

    cropBox.addEventListener('touchend', this.onTouchEnd.bind(this));
  },

  getCroppedImage: function() {
    if (!this.image) return null;

    var imageState = this.imageState;
    var cropBoxRect = this.cropBoxRect;
    var scale = imageState.scale;

    var canvasSize = cropBoxRect.width * 2;

    var canvas = document.createElement('canvas');
    var context = canvas.getContext('2d');
    canvas.width = canvas.height = canvasSize;

    var imageLeft = Math.round((cropBoxRect.left - imageState.left) / scale);
    var imageTop = Math.round((cropBoxRect.top  - imageState.top) / scale);
    var imageSize = Math.floor(cropBoxRect.width / scale);

    context.drawImage(this.refs.image, imageLeft, imageTop, imageSize, imageSize, 0, 0, canvasSize, canvasSize);

    var dataURL = canvas.toDataURL();

    return {
      file: canvas.toBlob ? canvas.toBlob() : dataURItoBlob(dataURL),
      dataUrl: dataURL,
      size: canvasSize
    };
  }
};

module.exports = Cropper;
},{"./util":3}],2:[function(require,module,exports){
window.Cropper = require('./cropper');
},{"./cropper":1}],3:[function(require,module,exports){

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
},{}]},{},[2])
//# sourceMappingURL=data:application/json;charset:utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIm5vZGVfbW9kdWxlcy93YXRjaGlmeS9ub2RlX21vZHVsZXMvYnJvd3NlcmlmeS9ub2RlX21vZHVsZXMvYnJvd3Nlci1wYWNrL19wcmVsdWRlLmpzIiwic3JjL2Nyb3BwZXIuanMiLCJzcmMvaW5kZXguanMiLCJzcmMvdXRpbC5qcyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQTtBQ0FBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ3RlQTs7QUNBQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBIiwiZmlsZSI6ImdlbmVyYXRlZC5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzQ29udGVudCI6WyIoZnVuY3Rpb24gZSh0LG4scil7ZnVuY3Rpb24gcyhvLHUpe2lmKCFuW29dKXtpZighdFtvXSl7dmFyIGE9dHlwZW9mIHJlcXVpcmU9PVwiZnVuY3Rpb25cIiYmcmVxdWlyZTtpZighdSYmYSlyZXR1cm4gYShvLCEwKTtpZihpKXJldHVybiBpKG8sITApO3ZhciBmPW5ldyBFcnJvcihcIkNhbm5vdCBmaW5kIG1vZHVsZSAnXCIrbytcIidcIik7dGhyb3cgZi5jb2RlPVwiTU9EVUxFX05PVF9GT1VORFwiLGZ9dmFyIGw9bltvXT17ZXhwb3J0czp7fX07dFtvXVswXS5jYWxsKGwuZXhwb3J0cyxmdW5jdGlvbihlKXt2YXIgbj10W29dWzFdW2VdO3JldHVybiBzKG4/bjplKX0sbCxsLmV4cG9ydHMsZSx0LG4scil9cmV0dXJuIG5bb10uZXhwb3J0c312YXIgaT10eXBlb2YgcmVxdWlyZT09XCJmdW5jdGlvblwiJiZyZXF1aXJlO2Zvcih2YXIgbz0wO288ci5sZW5ndGg7bysrKXMocltvXSk7cmV0dXJuIHN9KSIsInZhciB1dGlsID0gcmVxdWlyZSgnLi91dGlsJyk7XG5cbnZhciB0cmFuc2xhdGVFbGVtZW50ID0gdXRpbC50cmFuc2xhdGVFbGVtZW50O1xudmFyIGdldEVsZW1lbnRUcmFuc2xhdGUgPSB1dGlsLmdldEVsZW1lbnRUcmFuc2xhdGU7XG52YXIgZ2V0RGlzdGFuY2UgPSB1dGlsLmdldFRvdWNoRGlzdGFuY2U7XG52YXIgdHJhbnNsYXRlID0gdXRpbC50cmFuc2xhdGU7XG52YXIgZGF0YVVSSXRvQmxvYiA9IHV0aWwuZGF0YVVSSXRvQmxvYjtcblxudmFyIENyb3BwZXIgPSBmdW5jdGlvbigpIHtcbiAgaWYgKCEoJ29udG91Y2hzdGFydCcgaW4gd2luZG93KSkge1xuICAgIHRocm93IG5ldyBFcnJvcigndGhpcyBkZW1vIHNob3VsZCBydW4gaW4gbW9iaWxlIGRldmljZScpO1xuICB9XG5cbiAgdGhpcy5pbWFnZVN0YXRlID0ge307XG59O1xuXG5Dcm9wcGVyLnByb3RvdHlwZSA9IHtcbiAgY29uc3RydWN0b3I6IENyb3BwZXIsXG5cbiAgc2V0SW1hZ2U6IGZ1bmN0aW9uKHNyYykge1xuICAgIHZhciBzZWxmID0gdGhpcztcbiAgICBzZWxmLmltYWdlTG9hZGluZyA9IHRydWU7XG4gICAgc2VsZi5pbWFnZSA9IHNyYztcblxuICAgIHNlbGYucmVzZXRTaXplKCk7XG5cbiAgICB2YXIgaW1hZ2UgPSBuZXcgSW1hZ2UoKTtcblxuICAgIGltYWdlLm9ubG9hZCA9IGZ1bmN0aW9uKCkge1xuICAgICAgdmFyIHNlbGZJbWFnZSA9IHNlbGYucmVmcy5pbWFnZTtcblxuICAgICAgc2VsZkltYWdlLnNyYyA9IHNyYztcblxuICAgICAgdmFyIG9yaWdpbmFsV2lkdGggPSBpbWFnZS53aWR0aDtcbiAgICAgIHZhciBvcmlnaW5hbEhlaWdodCA9IGltYWdlLmhlaWdodDtcblxuICAgICAgc2VsZi5pbWFnZVN0YXRlLmxlZnQgPSBzZWxmLmltYWdlU3RhdGUudG9wID0gMDtcblxuICAgICAgc2VsZi5pbWFnZVN0YXRlLndpZHRoID0gb3JpZ2luYWxXaWR0aDtcbiAgICAgIHNlbGYuaW1hZ2VTdGF0ZS5oZWlnaHQgPSBvcmlnaW5hbEhlaWdodDtcblxuICAgICAgc2VsZi5pbml0U2NhbGUoKTtcblxuICAgICAgdmFyIG1pblNjYWxlID0gc2VsZi5zY2FsZVJhbmdlWzBdO1xuICAgICAgdmFyIGltYWdlV2lkdGggPSBtaW5TY2FsZSAqIG9yaWdpbmFsV2lkdGg7XG4gICAgICB2YXIgaW1hZ2VIZWlnaHQgPSBtaW5TY2FsZSAqIG9yaWdpbmFsSGVpZ2h0O1xuICAgICAgc2VsZkltYWdlLnN0eWxlLndpZHRoID0gaW1hZ2VXaWR0aCArICdweCc7XG4gICAgICBzZWxmSW1hZ2Uuc3R5bGUuaGVpZ2h0ID0gaW1hZ2VIZWlnaHQgKyAncHgnO1xuXG4gICAgICB2YXIgaW1hZ2VMZWZ0LCBpbWFnZVRvcDtcblxuICAgICAgdmFyIGNyb3BCb3hSZWN0ID0gc2VsZi5jcm9wQm94UmVjdDtcblxuICAgICAgaWYgKG9yaWdpbmFsV2lkdGggPiBvcmlnaW5hbEhlaWdodCkge1xuICAgICAgICBpbWFnZUxlZnQgPSAoY3JvcEJveFJlY3Qud2lkdGggLSBpbWFnZVdpZHRoKSAvIDIgK2Nyb3BCb3hSZWN0LmxlZnQ7XG4gICAgICAgIGltYWdlVG9wID0gY3JvcEJveFJlY3QudG9wO1xuICAgICAgfSBlbHNlIHtcbiAgICAgICAgaW1hZ2VMZWZ0ID0gY3JvcEJveFJlY3QubGVmdDtcbiAgICAgICAgaW1hZ2VUb3AgPSAoY3JvcEJveFJlY3QuaGVpZ2h0IC0gaW1hZ2VIZWlnaHQpIC8gMiArIGNyb3BCb3hSZWN0LnRvcDtcbiAgICAgIH1cblxuICAgICAgc2VsZi5tb3ZlSW1hZ2UoaW1hZ2VMZWZ0LCBpbWFnZVRvcCk7XG5cbiAgICAgIHNlbGYuaW1hZ2VMb2FkaW5nID0gZmFsc2U7XG4gICAgfTtcbiAgICBpbWFnZS5zcmMgPSBzcmM7XG4gIH0sXG5cbiAgZ2V0Rm9jYWxQb2ludDogZnVuY3Rpb24oZXZlbnQpIHtcbiAgICB2YXIgZm9jYWxQb2ludCA9IHtcbiAgICAgIGxlZnQ6IChldmVudC50b3VjaGVzWzBdLnBhZ2VYICsgZXZlbnQudG91Y2hlc1sxXS5wYWdlWCkgLyAyLFxuICAgICAgdG9wOiAoZXZlbnQudG91Y2hlc1swXS5wYWdlWSArIGV2ZW50LnRvdWNoZXNbMV0ucGFnZVkpIC8gMlxuICAgIH07XG5cbiAgICB2YXIgaW1hZ2VTdGF0ZSA9IHRoaXMuaW1hZ2VTdGF0ZTtcbiAgICB2YXIgY3JvcEJveFJlY3QgPSB0aGlzLmNyb3BCb3hSZWN0O1xuXG4gICAgZm9jYWxQb2ludC5sZWZ0IC09IGNyb3BCb3hSZWN0LmxlZnQgKyBpbWFnZVN0YXRlLmxlZnQ7XG4gICAgZm9jYWxQb2ludC50b3AgLT0gY3JvcEJveFJlY3QudG9wICsgaW1hZ2VTdGF0ZS50b3A7XG5cbiAgICByZXR1cm4gZm9jYWxQb2ludDtcbiAgfSxcblxuICByZW5kZXI6IGZ1bmN0aW9uKHBhcmVudE5vZGUpIHtcbiAgICB2YXIgZWxlbWVudCA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoJ2RpdicpO1xuICAgIGVsZW1lbnQuY2xhc3NOYW1lID0gJ2Nyb3BwZXInO1xuXG4gICAgdmFyIGNvdmVyU3RhcnQgPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KCdkaXYnKTtcbiAgICB2YXIgY292ZXJFbmQgPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KCdkaXYnKTtcbiAgICB2YXIgY3JvcEJveCA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoJ2RpdicpO1xuICAgIHZhciBpbWFnZSA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoJ2ltZycpO1xuXG4gICAgY292ZXJTdGFydC5jbGFzc05hbWUgPSAnY292ZXIgY292ZXItc3RhcnQnO1xuICAgIGNvdmVyRW5kLmNsYXNzTmFtZSA9ICdjb3ZlciBjb3Zlci1lbmQnO1xuICAgIGNyb3BCb3guY2xhc3NOYW1lID0gJ2Nyb3AtYm94JztcblxuICAgIGVsZW1lbnQuYXBwZW5kQ2hpbGQoY292ZXJTdGFydCk7XG4gICAgZWxlbWVudC5hcHBlbmRDaGlsZChjb3ZlckVuZCk7XG4gICAgZWxlbWVudC5hcHBlbmRDaGlsZChjcm9wQm94KTtcbiAgICBlbGVtZW50LmFwcGVuZENoaWxkKGltYWdlKTtcblxuICAgIHRoaXMucmVmcyA9IHtcbiAgICAgIGVsZW1lbnQ6IGVsZW1lbnQsXG4gICAgICBjb3ZlclN0YXJ0OiBjb3ZlclN0YXJ0LFxuICAgICAgY292ZXJFbmQ6IGNvdmVyRW5kLFxuICAgICAgY3JvcEJveDogY3JvcEJveCxcbiAgICAgIGltYWdlOiBpbWFnZVxuICAgIH07XG5cbiAgICBpZiAocGFyZW50Tm9kZSkge1xuICAgICAgcGFyZW50Tm9kZS5hcHBlbmRDaGlsZChlbGVtZW50KTtcbiAgICB9XG5cbiAgICBpZiAoZWxlbWVudC5vZmZzZXRIZWlnaHQgPiAwKSB7XG4gICAgICB0aGlzLnJlc2V0U2l6ZSgpO1xuICAgIH1cblxuICAgIHRoaXMuYmluZEV2ZW50cygpO1xuICB9LFxuXG4gIGluaXRTY2FsZTogZnVuY3Rpb24gKCkge1xuICAgIHZhciBjcm9wQm94UmVjdCA9IHRoaXMuY3JvcEJveFJlY3Q7XG4gICAgdmFyIHdpZHRoID0gdGhpcy5pbWFnZVN0YXRlLndpZHRoO1xuICAgIHZhciBoZWlnaHQgPSB0aGlzLmltYWdlU3RhdGUuaGVpZ2h0O1xuICAgIHZhciBzY2FsZSwgbWluU2NhbGU7XG5cbiAgICBpZiAod2lkdGggPiBoZWlnaHQpIHtcbiAgICAgIHNjYWxlID0gdGhpcy5pbWFnZVN0YXRlLnNjYWxlID0gY3JvcEJveFJlY3QuaGVpZ2h0IC8gaGVpZ2h0O1xuICAgICAgbWluU2NhbGUgPSBjcm9wQm94UmVjdC5oZWlnaHQgKiAwLjggLyBoZWlnaHQ7XG4gICAgfSBlbHNlIHtcbiAgICAgIHNjYWxlID0gdGhpcy5pbWFnZVN0YXRlLnNjYWxlID0gY3JvcEJveFJlY3Qud2lkdGggLyB3aWR0aDtcbiAgICAgIG1pblNjYWxlID0gY3JvcEJveFJlY3Qud2lkdGggKiAwLjggLyB3aWR0aDtcbiAgICB9XG5cbiAgICB0aGlzLnNjYWxlUmFuZ2UgPSBbc2NhbGUsIDJdO1xuICAgIHRoaXMuYm91bmNlU2NhbGVSYW5nZSA9IFttaW5TY2FsZSwgM107XG4gIH0sXG5cbiAgcmVzZXRTaXplOiBmdW5jdGlvbigpIHtcbiAgICB2YXIgcmVmcyA9IHRoaXMucmVmcztcbiAgICBpZiAoIXJlZnMpIHJldHVybjtcblxuICAgIHZhciBlbGVtZW50ID0gcmVmcy5lbGVtZW50O1xuICAgIHZhciBjcm9wQm94ID0gcmVmcy5jcm9wQm94O1xuICAgIHZhciBjb3ZlclN0YXJ0ID0gcmVmcy5jb3ZlclN0YXJ0O1xuICAgIHZhciBjb3ZlckVuZCA9IHJlZnMuY292ZXJFbmQ7XG5cbiAgICB2YXIgd2lkdGggPSBlbGVtZW50Lm9mZnNldFdpZHRoO1xuICAgIHZhciBoZWlnaHQgPSBlbGVtZW50Lm9mZnNldEhlaWdodDtcblxuICAgIGlmICh3aWR0aCA+IGhlaWdodCkge1xuICAgICAgZWxlbWVudC5jbGFzc05hbWUgPSAnY3JvcHBlciBjcm9wcGVyLWhvcml6b250YWwnO1xuXG4gICAgICBjb3ZlclN0YXJ0LnN0eWxlLndpZHRoID0gY292ZXJFbmQuc3R5bGUud2lkdGggPSAod2lkdGggLSBoZWlnaHQpIC8gMiArICdweCc7XG4gICAgICBjb3ZlclN0YXJ0LnN0eWxlLmhlaWdodCA9IGNvdmVyRW5kLnN0eWxlLmhlaWdodCA9ICcnO1xuICAgICAgY3JvcEJveC5zdHlsZS53aWR0aCA9IGNyb3BCb3guc3R5bGUuaGVpZ2h0ID0gaGVpZ2h0ICsgJ3B4JztcbiAgICB9IGVsc2Uge1xuICAgICAgZWxlbWVudC5jbGFzc05hbWUgPSAnY3JvcHBlcic7XG5cbiAgICAgIGNvdmVyU3RhcnQuc3R5bGUuaGVpZ2h0ID0gY292ZXJFbmQuc3R5bGUuaGVpZ2h0ID0gKGhlaWdodCAtIHdpZHRoKSAvIDIgKyAncHgnO1xuICAgICAgY292ZXJTdGFydC5zdHlsZS53aWR0aCA9IGNvdmVyRW5kLnN0eWxlLndpZHRoID0gJyc7XG4gICAgICBjcm9wQm94LnN0eWxlLndpZHRoID0gY3JvcEJveC5zdHlsZS5oZWlnaHQgPSB3aWR0aCArICdweCc7XG4gICAgfVxuXG4gICAgdmFyIGVsZW1lbnRSZWN0ID0gZWxlbWVudC5nZXRCb3VuZGluZ0NsaWVudFJlY3QoKTtcbiAgICB2YXIgY3JvcEJveFJlY3QgPSBjcm9wQm94LmdldEJvdW5kaW5nQ2xpZW50UmVjdCgpO1xuXG4gICAgdGhpcy5jcm9wQm94UmVjdCA9IHtcbiAgICAgIGxlZnQ6IGNyb3BCb3hSZWN0LmxlZnQgLSBlbGVtZW50UmVjdC5sZWZ0LFxuICAgICAgdG9wOiBjcm9wQm94UmVjdC50b3AgLSBlbGVtZW50UmVjdC50b3AsXG4gICAgICB3aWR0aDogY3JvcEJveFJlY3Qud2lkdGgsXG4gICAgICBoZWlnaHQ6IGNyb3BCb3hSZWN0LmhlaWdodFxuICAgIH07XG5cbiAgICB0aGlzLmluaXRTY2FsZSgpO1xuXG4gICAgdGhpcy5jaGVja0JvdW5jZSgwKTtcbiAgfSxcblxuICBjaGVja0JvdW5jZTogZnVuY3Rpb24gKHNwZWVkKSB7XG4gICAgdmFyIGltYWdlU3RhdGUgPSB0aGlzLmltYWdlU3RhdGU7XG4gICAgdmFyIGNyb3BCb3hSZWN0ID0gdGhpcy5jcm9wQm94UmVjdDtcblxuICAgIHZhciBpbWFnZVdpZHRoID0gaW1hZ2VTdGF0ZS53aWR0aDtcbiAgICB2YXIgaW1hZ2VIZWlnaHQgPSBpbWFnZVN0YXRlLmhlaWdodDtcbiAgICB2YXIgaW1hZ2VTY2FsZSA9IGltYWdlU3RhdGUuc2NhbGU7XG5cbiAgICB2YXIgaW1hZ2VPZmZzZXQgPSBnZXRFbGVtZW50VHJhbnNsYXRlKHRoaXMucmVmcy5pbWFnZSk7XG4gICAgdmFyIGxlZnQgPSBpbWFnZU9mZnNldC5sZWZ0O1xuICAgIHZhciB0b3AgPSBpbWFnZU9mZnNldC50b3A7XG5cbiAgICB2YXIgbGVmdFJhbmdlID0gWy1pbWFnZVdpZHRoICogaW1hZ2VTY2FsZSArIGNyb3BCb3hSZWN0LndpZHRoICsgY3JvcEJveFJlY3QubGVmdCwgY3JvcEJveFJlY3QubGVmdF07XG4gICAgdmFyIHRvcFJhbmdlID0gWy1pbWFnZUhlaWdodCAqIGltYWdlU2NhbGUgKyBjcm9wQm94UmVjdC5oZWlnaHQgKyBjcm9wQm94UmVjdC50b3AsIGNyb3BCb3hSZWN0LnRvcF07XG5cbiAgICB2YXIgb3ZlcmZsb3cgPSBmYWxzZTtcblxuICAgIGlmIChsZWZ0IDwgbGVmdFJhbmdlWzBdKSB7XG4gICAgICBsZWZ0ID0gbGVmdFJhbmdlWzBdO1xuICAgICAgb3ZlcmZsb3cgPSB0cnVlO1xuICAgIH0gZWxzZSBpZiAobGVmdCA+IGxlZnRSYW5nZVsxXSkge1xuICAgICAgbGVmdCA9IGxlZnRSYW5nZVsxXTtcbiAgICAgIG92ZXJmbG93ID0gdHJ1ZTtcbiAgICB9XG5cbiAgICBpZiAodG9wIDwgdG9wUmFuZ2VbMF0pIHtcbiAgICAgIHRvcCA9IHRvcFJhbmdlWzBdO1xuICAgICAgb3ZlcmZsb3cgPSB0cnVlO1xuICAgIH0gZWxzZSBpZiAodG9wID4gdG9wUmFuZ2VbMV0pIHtcbiAgICAgIHRvcCA9IHRvcFJhbmdlWzFdO1xuICAgICAgb3ZlcmZsb3cgPSB0cnVlO1xuICAgIH1cblxuICAgIGlmIChvdmVyZmxvdykge1xuICAgICAgdmFyIHNlbGYgPSB0aGlzO1xuICAgICAgdHJhbnNsYXRlKHRoaXMucmVmcy5pbWFnZSwgbGVmdCwgdG9wLCBzcGVlZCA9PT0gdW5kZWZpbmVkID8gMjAwIDogMCwgZnVuY3Rpb24oKSB7XG4gICAgICAgIHNlbGYubW92ZUltYWdlKGxlZnQsIHRvcCk7XG4gICAgICB9KTtcbiAgICB9XG4gIH0sXG5cbiAgbW92ZUltYWdlOiBmdW5jdGlvbihsZWZ0LCB0b3ApIHtcbiAgICB2YXIgaW1hZ2UgPSB0aGlzLnJlZnMuaW1hZ2U7XG4gICAgdHJhbnNsYXRlRWxlbWVudChpbWFnZSwgbGVmdCwgdG9wKTtcblxuICAgIHRoaXMuaW1hZ2VTdGF0ZS5sZWZ0ID0gbGVmdDtcbiAgICB0aGlzLmltYWdlU3RhdGUudG9wID0gdG9wO1xuICB9LFxuXG4gIG9uVG91Y2hTdGFydDogZnVuY3Rpb24oZXZlbnQpIHtcbiAgICB0aGlzLmFtcGxpdHVkZSA9IDA7XG4gICAgdmFyIGltYWdlID0gdGhpcy5yZWZzLmltYWdlO1xuXG4gICAgdmFyIGZpbmdlckNvdW50ID0gZXZlbnQudG91Y2hlcy5sZW5ndGg7XG4gICAgaWYgKGZpbmdlckNvdW50KSB7XG4gICAgICB2YXIgdG91Y2hFdmVudCA9IGV2ZW50LnRvdWNoZXNbMF07XG5cbiAgICAgIHZhciBpbWFnZU9mZnNldCA9IGdldEVsZW1lbnRUcmFuc2xhdGUoaW1hZ2UpO1xuXG4gICAgICB0aGlzLmRyYWdTdGF0ZSA9IHtcbiAgICAgICAgdGltZXN0YW1wOiBEYXRlLm5vdygpLFxuICAgICAgICBzdGFydFRvdWNoTGVmdDogdG91Y2hFdmVudC5wYWdlWCxcbiAgICAgICAgc3RhcnRUb3VjaFRvcDogdG91Y2hFdmVudC5wYWdlWSxcbiAgICAgICAgc3RhcnRMZWZ0OiBpbWFnZU9mZnNldC5sZWZ0IHx8IDAsXG4gICAgICAgIHN0YXJ0VG9wOiBpbWFnZU9mZnNldC50b3AgfHwgMFxuICAgICAgfTtcbiAgICB9XG5cbiAgICBpZiAoZmluZ2VyQ291bnQgPj0gMikge1xuICAgICAgdmFyIHpvb21TdGF0ZSA9IHRoaXMuem9vbVN0YXRlID0ge1xuICAgICAgICB0aW1lc3RhbXA6IERhdGUubm93KClcbiAgICAgIH07XG5cbiAgICAgIHpvb21TdGF0ZS5zdGFydERpc3RhbmNlID0gZ2V0RGlzdGFuY2UoZXZlbnQpO1xuICAgICAgem9vbVN0YXRlLmZvY2FsUG9pbnQgPSB0aGlzLmdldEZvY2FsUG9pbnQoZXZlbnQpO1xuICAgIH1cbiAgfSxcblxuICBvblRvdWNoTW92ZTogZnVuY3Rpb24oZXZlbnQpIHtcbiAgICB2YXIgZmluZ2VyQ291bnQgPSBldmVudC50b3VjaGVzLmxlbmd0aDtcblxuICAgIHZhciB0b3VjaEV2ZW50ID0gZXZlbnQudG91Y2hlc1swXTtcblxuICAgIHZhciBjcm9wQm94UmVjdCA9IHRoaXMuY3JvcEJveFJlY3Q7XG4gICAgdmFyIGltYWdlID0gdGhpcy5yZWZzLmltYWdlO1xuXG4gICAgdmFyIGltYWdlU3RhdGUgPSB0aGlzLmltYWdlU3RhdGU7XG4gICAgdmFyIGltYWdlV2lkdGggPSBpbWFnZVN0YXRlLndpZHRoO1xuICAgIHZhciBpbWFnZUhlaWdodCA9IGltYWdlU3RhdGUuaGVpZ2h0O1xuXG4gICAgdmFyIGRyYWdTdGF0ZSA9IHRoaXMuZHJhZ1N0YXRlO1xuICAgIHZhciB6b29tU3RhdGUgPSB0aGlzLnpvb21TdGF0ZTtcblxuICAgIGlmIChmaW5nZXJDb3VudCA9PT0gMSkge1xuICAgICAgdmFyIGxlZnRSYW5nZSA9IFsgLWltYWdlV2lkdGggKiBpbWFnZVN0YXRlLnNjYWxlICsgY3JvcEJveFJlY3Qud2lkdGgsIGNyb3BCb3hSZWN0LmxlZnQgXTtcbiAgICAgIHZhciB0b3BSYW5nZSA9IFsgLWltYWdlSGVpZ2h0ICogaW1hZ2VTdGF0ZS5zY2FsZSArIGNyb3BCb3hSZWN0LmhlaWdodCArIGNyb3BCb3hSZWN0LnRvcCwgY3JvcEJveFJlY3QudG9wIF07XG5cbiAgICAgIHZhciBkZWx0YVggPSB0b3VjaEV2ZW50LnBhZ2VYIC0gKGRyYWdTdGF0ZS5sYXN0TGVmdCB8fCBkcmFnU3RhdGUuc3RhcnRUb3VjaExlZnQpO1xuICAgICAgdmFyIGRlbHRhWSA9IHRvdWNoRXZlbnQucGFnZVkgLSAoZHJhZ1N0YXRlLmxhc3RUb3AgfHwgZHJhZ1N0YXRlLnN0YXJ0VG91Y2hUb3ApO1xuXG4gICAgICB2YXIgaW1hZ2VPZmZzZXQgPSBnZXRFbGVtZW50VHJhbnNsYXRlKGltYWdlKTtcblxuICAgICAgdmFyIGxlZnQgPSBpbWFnZU9mZnNldC5sZWZ0ICsgZGVsdGFYO1xuICAgICAgdmFyIHRvcCA9IGltYWdlT2Zmc2V0LnRvcCArIGRlbHRhWTtcblxuICAgICAgaWYgKGxlZnQgPCBsZWZ0UmFuZ2VbMF0gfHwgbGVmdCA+IGxlZnRSYW5nZVsxXSkge1xuICAgICAgICBsZWZ0IC09IGRlbHRhWCAvIDI7XG4gICAgICB9XG5cbiAgICAgIGlmICh0b3AgPCB0b3BSYW5nZSBbMF0gfHwgdG9wID4gdG9wUmFuZ2VbMV0pIHtcbiAgICAgICAgdG9wIC09IGRlbHRhWSAvIDI7XG4gICAgICB9XG5cbiAgICAgIHRoaXMubW92ZUltYWdlKGxlZnQsIHRvcCk7XG4gICAgfSBlbHNlIGlmIChmaW5nZXJDb3VudCA+PSAyKSB7XG4gICAgICBpZiAoIXpvb21TdGF0ZS50aW1lc3RhbXApIHtcbiAgICAgICAgem9vbVN0YXRlID0ge1xuICAgICAgICAgIHRpbWVzdGFtcDogRGF0ZS5ub3coKVxuICAgICAgICB9O1xuXG4gICAgICAgIHpvb21TdGF0ZS5zdGFydERpc3RhbmNlID0gZ2V0RGlzdGFuY2UoZXZlbnQpO1xuICAgICAgICB6b29tU3RhdGUuZm9jYWxQb2ludCA9IHRoaXMuZ2V0Rm9jYWxQb2ludChldmVudCk7XG5cbiAgICAgICAgcmV0dXJuO1xuICAgICAgfVxuXG4gICAgICB2YXIgbmV3RGlzdGFuY2UgPSBnZXREaXN0YW5jZShldmVudCk7XG4gICAgICB2YXIgb2xkU2NhbGUgPSBpbWFnZVN0YXRlLnNjYWxlO1xuXG4gICAgICBpbWFnZVN0YXRlLnNjYWxlID0gb2xkU2NhbGUgKiBuZXdEaXN0YW5jZSAvICh6b29tU3RhdGUubGFzdERpc3RhbmNlIHx8IHpvb21TdGF0ZS5zdGFydERpc3RhbmNlKTtcblxuICAgICAgdmFyIHNjYWxlUmFuZ2UgPSB0aGlzLnNjYWxlUmFuZ2U7XG4gICAgICBpZiAoaW1hZ2VTdGF0ZS5zY2FsZSA8IHNjYWxlUmFuZ2VbMF0pIHtcbiAgICAgICAgaW1hZ2VTdGF0ZS5zY2FsZSA9IHNjYWxlUmFuZ2VbMF07XG4gICAgICB9IGVsc2UgaWYgKGltYWdlU3RhdGUuc2NhbGUgPiBzY2FsZVJhbmdlWzFdKSB7XG4gICAgICAgIGltYWdlU3RhdGUuc2NhbGUgPSBzY2FsZVJhbmdlWzFdO1xuICAgICAgfVxuXG4gICAgICB0aGlzLnpvb21XaXRoRm9jYWwob2xkU2NhbGUpO1xuXG4gICAgICB6b29tU3RhdGUuZm9jYWxQb2ludCA9IHRoaXMuZ2V0Rm9jYWxQb2ludChldmVudCk7XG4gICAgICB6b29tU3RhdGUubGFzdERpc3RhbmNlID0gbmV3RGlzdGFuY2U7XG4gICAgfVxuXG4gICAgZHJhZ1N0YXRlLmxhc3RMZWZ0ID0gdG91Y2hFdmVudC5wYWdlWDtcbiAgICBkcmFnU3RhdGUubGFzdFRvcCA9IHRvdWNoRXZlbnQucGFnZVk7XG4gIH0sXG5cbiAgb25Ub3VjaEVuZDogZnVuY3Rpb24oZXZlbnQpIHtcbiAgICB2YXIgaW1hZ2VTdGF0ZSA9IHRoaXMuaW1hZ2VTdGF0ZTtcbiAgICB2YXIgem9vbVN0YXRlID0gdGhpcy56b29tU3RhdGU7XG4gICAgdmFyIGRyYWdTdGF0ZSA9IHRoaXMuZHJhZ1N0YXRlO1xuICAgIHZhciBhbXBsaXR1ZGUgPSB0aGlzLmFtcGxpdHVkZTtcbiAgICB2YXIgaW1hZ2VXaWR0aCA9IGltYWdlU3RhdGUud2lkdGg7XG4gICAgdmFyIGltYWdlSGVpZ2h0ID0gaW1hZ2VTdGF0ZS5oZWlnaHQ7XG4gICAgdmFyIGNyb3BCb3hSZWN0ID0gdGhpcy5jcm9wQm94UmVjdDtcblxuICAgIGlmIChldmVudC50b3VjaGVzLmxlbmd0aCA9PT0gMCAmJiBkcmFnU3RhdGUudGltZXN0YW1wKSB7XG4gICAgICB2YXIgc2VsZiA9IHRoaXM7XG4gICAgICB2YXIgZHVyYXRpb24gPSBEYXRlLm5vdygpIC0gZHJhZ1N0YXRlLnRpbWVzdGFtcDtcblxuICAgICAgaWYgKGR1cmF0aW9uID4gMzAwKSB7XG4gICAgICAgIHNlbGYuY2hlY2tCb3VuY2UoKTtcbiAgICAgIH0gZWxzZSB7XG4gICAgICAgIHZhciB0YXJnZXQ7XG5cbiAgICAgICAgdmFyIHRvcCA9IGltYWdlU3RhdGUudG9wO1xuICAgICAgICB2YXIgbGVmdCA9IGltYWdlU3RhdGUubGVmdDtcblxuICAgICAgICB2YXIgbW9tZW50dW1WZXJ0aWNhbCA9IGZhbHNlO1xuXG4gICAgICAgIHZhciB0aW1lQ29uc3RhbnQgPSAxNjA7XG5cbiAgICAgICAgdmFyIGF1dG9TY3JvbGwgPSBmdW5jdGlvbiAoKSB7XG4gICAgICAgICAgdmFyIGVsYXBzZWQsIGRlbHRhO1xuXG4gICAgICAgICAgaWYgKGFtcGxpdHVkZSkge1xuICAgICAgICAgICAgZWxhcHNlZCA9IERhdGUubm93KCkgLSB0aW1lc3RhbXA7XG4gICAgICAgICAgICBkZWx0YSA9IC1hbXBsaXR1ZGUgKiBNYXRoLmV4cCgtZWxhcHNlZCAvIHRpbWVDb25zdGFudCk7XG4gICAgICAgICAgICBpZiAoZGVsdGEgPiAwLjUgfHwgZGVsdGEgPCAtMC41KSB7XG4gICAgICAgICAgICAgIGlmIChtb21lbnR1bVZlcnRpY2FsKSB7XG4gICAgICAgICAgICAgICAgc2VsZi5tb3ZlSW1hZ2UobGVmdCwgdGFyZ2V0ICsgZGVsdGEpO1xuICAgICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgIHNlbGYubW92ZUltYWdlKHRhcmdldCArIGRlbHRhLCB0b3ApO1xuICAgICAgICAgICAgICB9XG5cbiAgICAgICAgICAgICAgcmVxdWVzdEFuaW1hdGlvbkZyYW1lKGF1dG9TY3JvbGwpO1xuICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgdmFyIGN1cnJlbnRMZWZ0O1xuICAgICAgICAgICAgICB2YXIgY3VycmVudFRvcDtcblxuICAgICAgICAgICAgICBpZiAobW9tZW50dW1WZXJ0aWNhbCkge1xuICAgICAgICAgICAgICAgIGN1cnJlbnRMZWZ0ID0gbGVmdDtcbiAgICAgICAgICAgICAgICBjdXJyZW50VG9wID0gdGFyZ2V0O1xuICAgICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgIGN1cnJlbnRMZWZ0ID0gdGFyZ2V0O1xuICAgICAgICAgICAgICAgIGN1cnJlbnRUb3AgPSB0b3A7XG4gICAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgICBzZWxmLm1vdmVJbWFnZShjdXJyZW50TGVmdCwgY3VycmVudFRvcCk7XG4gICAgICAgICAgICAgIHNlbGYuY2hlY2tCb3VuY2UoKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICB9XG4gICAgICAgIH07XG5cbiAgICAgICAgdmFyIHZlbG9jaXR5O1xuXG4gICAgICAgIHZhciBkZWx0YVggPSBldmVudC5jaGFuZ2VkVG91Y2hlc1swXS5wYWdlWCAtIGRyYWdTdGF0ZS5zdGFydFRvdWNoTGVmdDtcbiAgICAgICAgdmFyIGRlbHRhWSA9IGV2ZW50LmNoYW5nZWRUb3VjaGVzWzBdLnBhZ2VZIC0gZHJhZ1N0YXRlLnN0YXJ0VG91Y2hUb3A7XG5cbiAgICAgICAgaWYgKE1hdGguYWJzKGRlbHRhWCkgPiBNYXRoLmFicyhkZWx0YVkpKSB7XG4gICAgICAgICAgdmVsb2NpdHkgPSBkZWx0YVggLyBkdXJhdGlvbjtcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICBtb21lbnR1bVZlcnRpY2FsID0gdHJ1ZTtcbiAgICAgICAgICB2ZWxvY2l0eSA9IGRlbHRhWSAvIGR1cmF0aW9uO1xuICAgICAgICB9XG5cbiAgICAgICAgYW1wbGl0dWRlID0gODAgKiB2ZWxvY2l0eTtcblxuICAgICAgICB2YXIgcmFuZ2U7XG5cbiAgICAgICAgaWYgKG1vbWVudHVtVmVydGljYWwpIHtcbiAgICAgICAgICB0YXJnZXQgPSBNYXRoLnJvdW5kKGltYWdlU3RhdGUudG9wICsgYW1wbGl0dWRlKTtcbiAgICAgICAgICByYW5nZSA9IFstaW1hZ2VIZWlnaHQgKiBpbWFnZVN0YXRlLnNjYWxlICsgY3JvcEJveFJlY3QuaGVpZ2h0IC8gMiArIGNyb3BCb3hSZWN0LnRvcCwgY3JvcEJveFJlY3QudG9wICsgY3JvcEJveFJlY3QuaGVpZ2h0IC8gMl07XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgdGFyZ2V0ID0gTWF0aC5yb3VuZChpbWFnZVN0YXRlLmxlZnQgKyBhbXBsaXR1ZGUpO1xuICAgICAgICAgIHJhbmdlID0gWy1pbWFnZVdpZHRoICogaW1hZ2VTdGF0ZS5zY2FsZSArIGNyb3BCb3hSZWN0LndpZHRoIC8gMiwgY3JvcEJveFJlY3QubGVmdCArIGNyb3BCb3hSZWN0LndpZHRoIC8gMl07XG4gICAgICAgIH1cblxuICAgICAgICBpZiAodGFyZ2V0IDwgcmFuZ2VbMF0pIHtcbiAgICAgICAgICB0YXJnZXQgPSByYW5nZVswXTtcbiAgICAgICAgICBhbXBsaXR1ZGUgLz0gMjtcbiAgICAgICAgfSBlbHNlIGlmICh0YXJnZXQgPiByYW5nZVsxXSkge1xuICAgICAgICAgIHRhcmdldCA9IHJhbmdlWzFdO1xuICAgICAgICAgIGFtcGxpdHVkZSAvPSAyO1xuICAgICAgICB9XG5cbiAgICAgICAgdmFyIHRpbWVzdGFtcCA9IERhdGUubm93KCk7XG4gICAgICAgIHJlcXVlc3RBbmltYXRpb25GcmFtZShhdXRvU2Nyb2xsKTtcbiAgICAgIH1cblxuICAgICAgdGhpcy5kcmFnU3RhdGUgPSB7fTtcbiAgICB9IGVsc2UgaWYgKHpvb21TdGF0ZS50aW1lc3RhbXApIHtcbiAgICAgIHRoaXMuY2hlY2tCb3VuY2UoKTtcblxuICAgICAgdGhpcy56b29tU3RhdGUgPSB7fTtcbiAgICB9XG4gIH0sXG5cbiAgem9vbVdpdGhGb2NhbDogZnVuY3Rpb24ob2xkU2NhbGUpIHtcbiAgICB2YXIgaW1hZ2UgPSB0aGlzLnJlZnMuaW1hZ2U7XG4gICAgdmFyIGltYWdlU3RhdGUgPSB0aGlzLmltYWdlU3RhdGU7XG4gICAgdmFyIGltYWdlU2NhbGUgPSBpbWFnZVN0YXRlLnNjYWxlO1xuXG4gICAgaW1hZ2Uuc3R5bGUud2lkdGggPSBpbWFnZVN0YXRlLndpZHRoICogaW1hZ2VTY2FsZSArICdweCc7XG4gICAgaW1hZ2Uuc3R5bGUuaGVpZ2h0ID0gaW1hZ2VTdGF0ZS5oZWlnaHQgKiBpbWFnZVNjYWxlICsgJ3B4JztcblxuICAgIHZhciBmb2NhbFBvaW50ID0gdGhpcy56b29tU3RhdGUuZm9jYWxQb2ludDtcblxuICAgIHZhciBvZmZzZXRMZWZ0ID0gKGZvY2FsUG9pbnQubGVmdCAvIGltYWdlU2NhbGUgLSBmb2NhbFBvaW50LmxlZnQgLyBvbGRTY2FsZSkgKiBpbWFnZVNjYWxlO1xuICAgIHZhciBvZmZzZXRUb3AgPSAoZm9jYWxQb2ludC50b3AgLyBpbWFnZVNjYWxlIC0gZm9jYWxQb2ludC50b3AgLyBvbGRTY2FsZSkgKiBpbWFnZVNjYWxlO1xuXG4gICAgdmFyIGltYWdlTGVmdCA9IGltYWdlU3RhdGUubGVmdCB8fCAwO1xuICAgIHZhciBpbWFnZVRvcCA9IGltYWdlU3RhdGUudG9wIHx8IDA7XG5cbiAgICB0aGlzLm1vdmVJbWFnZShpbWFnZUxlZnQgKyBvZmZzZXRMZWZ0LCBpbWFnZVRvcCArIG9mZnNldFRvcCk7XG4gIH0sXG5cbiAgYmluZEV2ZW50czogZnVuY3Rpb24oKSB7XG4gICAgdmFyIGNyb3BCb3ggPSB0aGlzLnJlZnMuY3JvcEJveDtcblxuICAgIGNyb3BCb3guYWRkRXZlbnRMaXN0ZW5lcigndG91Y2hzdGFydCcsIHRoaXMub25Ub3VjaFN0YXJ0LmJpbmQodGhpcykpO1xuXG4gICAgY3JvcEJveC5hZGRFdmVudExpc3RlbmVyKCd0b3VjaG1vdmUnLCB0aGlzLm9uVG91Y2hNb3ZlLmJpbmQodGhpcykpO1xuXG4gICAgY3JvcEJveC5hZGRFdmVudExpc3RlbmVyKCd0b3VjaGVuZCcsIHRoaXMub25Ub3VjaEVuZC5iaW5kKHRoaXMpKTtcbiAgfSxcblxuICBnZXRDcm9wcGVkSW1hZ2U6IGZ1bmN0aW9uKCkge1xuICAgIGlmICghdGhpcy5pbWFnZSkgcmV0dXJuIG51bGw7XG5cbiAgICB2YXIgaW1hZ2VTdGF0ZSA9IHRoaXMuaW1hZ2VTdGF0ZTtcbiAgICB2YXIgY3JvcEJveFJlY3QgPSB0aGlzLmNyb3BCb3hSZWN0O1xuICAgIHZhciBzY2FsZSA9IGltYWdlU3RhdGUuc2NhbGU7XG5cbiAgICB2YXIgY2FudmFzU2l6ZSA9IGNyb3BCb3hSZWN0LndpZHRoICogMjtcblxuICAgIHZhciBjYW52YXMgPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KCdjYW52YXMnKTtcbiAgICB2YXIgY29udGV4dCA9IGNhbnZhcy5nZXRDb250ZXh0KCcyZCcpO1xuICAgIGNhbnZhcy53aWR0aCA9IGNhbnZhcy5oZWlnaHQgPSBjYW52YXNTaXplO1xuXG4gICAgdmFyIGltYWdlTGVmdCA9IE1hdGgucm91bmQoKGNyb3BCb3hSZWN0LmxlZnQgLSBpbWFnZVN0YXRlLmxlZnQpIC8gc2NhbGUpO1xuICAgIHZhciBpbWFnZVRvcCA9IE1hdGgucm91bmQoKGNyb3BCb3hSZWN0LnRvcCAgLSBpbWFnZVN0YXRlLnRvcCkgLyBzY2FsZSk7XG4gICAgdmFyIGltYWdlU2l6ZSA9IE1hdGguZmxvb3IoY3JvcEJveFJlY3Qud2lkdGggLyBzY2FsZSk7XG5cbiAgICBjb250ZXh0LmRyYXdJbWFnZSh0aGlzLnJlZnMuaW1hZ2UsIGltYWdlTGVmdCwgaW1hZ2VUb3AsIGltYWdlU2l6ZSwgaW1hZ2VTaXplLCAwLCAwLCBjYW52YXNTaXplLCBjYW52YXNTaXplKTtcblxuICAgIHZhciBkYXRhVVJMID0gY2FudmFzLnRvRGF0YVVSTCgpO1xuXG4gICAgcmV0dXJuIHtcbiAgICAgIGZpbGU6IGNhbnZhcy50b0Jsb2IgPyBjYW52YXMudG9CbG9iKCkgOiBkYXRhVVJJdG9CbG9iKGRhdGFVUkwpLFxuICAgICAgZGF0YVVybDogZGF0YVVSTCxcbiAgICAgIHNpemU6IGNhbnZhc1NpemVcbiAgICB9O1xuICB9XG59O1xuXG5tb2R1bGUuZXhwb3J0cyA9IENyb3BwZXI7Iiwid2luZG93LkNyb3BwZXIgPSByZXF1aXJlKCcuL2Nyb3BwZXInKTsiLCJcbnZhciBvbmNlID0gZnVuY3Rpb24oZWwsIGV2ZW50LCBmbikge1xuICB2YXIgbGlzdGVuZXIgPSBmdW5jdGlvbigpIHtcbiAgICBpZiAoZm4pIHtcbiAgICAgIGZuLmFwcGx5KHRoaXMsIGFyZ3VtZW50cyk7XG4gICAgfVxuICAgIGVsLnJlbW92ZUV2ZW50TGlzdGVuZXIoZXZlbnQsIGxpc3RlbmVyKTtcbiAgfTtcbiAgZWwuYWRkRXZlbnRMaXN0ZW5lcihldmVudCwgbGlzdGVuZXIpO1xufTtcblxubW9kdWxlLmV4cG9ydHMgPSB7XG4gIGRhdGFVUkl0b0Jsb2I6IGZ1bmN0aW9uIChkYXRhVVJJKSB7XG4gICAgdmFyIGJpbmFyeSA9IGF0b2IoZGF0YVVSSS5zcGxpdCgnLCcpWzFdKTtcbiAgICB2YXIgYXJyYXkgPSBbXTtcblxuICAgIGZvciAodmFyIGkgPSAwLCBqID0gYmluYXJ5Lmxlbmd0aDsgaSA8IGo7IGkrKykge1xuICAgICAgYXJyYXkucHVzaChiaW5hcnkuY2hhckNvZGVBdChpKSk7XG4gICAgfVxuXG4gICAgcmV0dXJuIG5ldyBCbG9iKFtuZXcgVWludDhBcnJheShhcnJheSldLCB7XG4gICAgICB0eXBlOiBkYXRhVVJJLnNsaWNlKDUsIGRhdGFVUkkuaW5kZXhPZignOycpKVxuICAgIH0pO1xuICB9LFxuICBnZXRUb3VjaERpc3RhbmNlOiBmdW5jdGlvbihldmVudCkge1xuICAgIHZhciBmaW5nZXIgPSBldmVudC50b3VjaGVzWzBdO1xuICAgIHZhciBmaW5nZXIyID0gZXZlbnQudG91Y2hlc1sxXTtcblxuICAgIHZhciBjMSA9IE1hdGguYWJzKGZpbmdlci5wYWdlWCAtIGZpbmdlcjIucGFnZVgpO1xuICAgIHZhciBjMiA9IE1hdGguYWJzKGZpbmdlci5wYWdlWSAtIGZpbmdlcjIucGFnZVkpO1xuXG4gICAgcmV0dXJuIE1hdGguc3FydCggYzEgKiBjMSArIGMyICogYzIgKTtcbiAgfSxcbiAgdHJhbnNsYXRlOiBmdW5jdGlvbihlbGVtZW50LCBsZWZ0LCB0b3AsIHNwZWVkLCBjYWxsYmFjaykge1xuICAgIGVsZW1lbnQuc3R5bGUud2Via2l0VHJhbnNmb3JtID0gJ3RyYW5zbGF0ZTNkKCcgKyAobGVmdCB8fCAwKSArICdweCwgJyArICh0b3AgfHwgMCkgKyAncHgsIDApJztcbiAgICBpZiAoc3BlZWQpIHtcbiAgICAgIHZhciBjYWxsZWQgPSBmYWxzZTtcblxuICAgICAgdmFyIHJlYWxDYWxsYmFjayA9IGZ1bmN0aW9uKCkge1xuICAgICAgICBpZiAoY2FsbGVkKSByZXR1cm47XG4gICAgICAgIGVsZW1lbnQuc3R5bGUud2Via2l0VHJhbnNpdGlvbiA9ICcnO1xuICAgICAgICBjYWxsZWQgPSB0cnVlO1xuICAgICAgICBpZiAoY2FsbGJhY2spIHtcbiAgICAgICAgICBjYWxsYmFjay5hcHBseSh0aGlzLCBhcmd1bWVudHMpO1xuICAgICAgICB9XG4gICAgICB9O1xuICAgICAgZWxlbWVudC5zdHlsZS53ZWJraXRUcmFuc2l0aW9uID0gJy13ZWJraXQtdHJhbnNmb3JtICcgKyBzcGVlZCArICdtcyBjdWJpYy1iZXppZXIoMC4zMjUsIDAuNzcwLCAwLjAwMCwgMS4wMDApJztcbiAgICAgIG9uY2UoZWxlbWVudCwgJ3dlYmtpdFRyYW5zaXRpb25FbmQnLCByZWFsQ2FsbGJhY2spO1xuICAgICAgb25jZShlbGVtZW50LCAndHJhbnNpdGlvbmVuZCcsIHJlYWxDYWxsYmFjayk7XG4gICAgICAvLyBmb3IgYW5kcm9pZC4uLlxuICAgICAgc2V0VGltZW91dChyZWFsQ2FsbGJhY2ssIHNwZWVkICsgNTApO1xuICAgIH0gZWxzZSB7XG4gICAgICBlbGVtZW50LnN0eWxlLndlYmtpdFRyYW5zaXRpb24gPSAnJztcbiAgICB9XG4gIH0sXG4gIHRyYW5zbGF0ZUVsZW1lbnQ6IGZ1bmN0aW9uKGVsZW1lbnQsIGxlZnQsIHRvcCkge1xuICAgIGVsZW1lbnQuc3R5bGUud2Via2l0VHJhbnNmb3JtID0gJ3RyYW5zbGF0ZTNkKCcgKyAobGVmdCB8fCAwKSArICdweCwgJyArICh0b3AgfHwgMCkgKyAncHgsIDApJztcbiAgfSxcbiAgZ2V0RWxlbWVudFRyYW5zbGF0ZTogZnVuY3Rpb24oZWxlbWVudCkge1xuICAgIHZhciB0cmFuc2Zvcm0gPSBlbGVtZW50LnN0eWxlLndlYmtpdFRyYW5zZm9ybTtcbiAgICB2YXIgbWF0Y2hlcyA9IC90cmFuc2xhdGUzZFxcKCguKj8pXFwpL2lnLmV4ZWModHJhbnNmb3JtKTtcbiAgICBpZiAobWF0Y2hlcykge1xuICAgICAgdmFyIHRyYW5zbGF0ZXMgPSBtYXRjaGVzWzFdLnNwbGl0KCcsJyk7XG4gICAgICByZXR1cm4ge1xuICAgICAgICBsZWZ0OiBwYXJzZUludCh0cmFuc2xhdGVzWzBdLCAxMCksXG4gICAgICAgIHRvcDogcGFyc2VJbnQodHJhbnNsYXRlc1sxXSwgMTApXG4gICAgICB9XG4gICAgfVxuICAgIHJldHVybiB7XG4gICAgICBsZWZ0OiAwLFxuICAgICAgdG9wOiAwXG4gICAgfVxuICB9XG59OyJdfQ==
