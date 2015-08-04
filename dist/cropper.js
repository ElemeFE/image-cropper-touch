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

  getCroppedImage: function(width) {
    if (!this.image) return null;

    var imageState = this.imageState;
    var cropBoxRect = this.cropBoxRect;
    var scale = imageState.scale;

    var canvasSize = width;

    if (!canvasSize) {
      canvasSize = cropBoxRect.width * 2;
    }

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
//# sourceMappingURL=data:application/json;charset:utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIm5vZGVfbW9kdWxlcy93YXRjaGlmeS9ub2RlX21vZHVsZXMvYnJvd3NlcmlmeS9ub2RlX21vZHVsZXMvYnJvd3Nlci1wYWNrL19wcmVsdWRlLmpzIiwic3JjL2Nyb3BwZXIuanMiLCJzcmMvaW5kZXguanMiLCJzcmMvdXRpbC5qcyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQTtBQ0FBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDMWVBOztBQ0FBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EiLCJmaWxlIjoiZ2VuZXJhdGVkLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXNDb250ZW50IjpbIihmdW5jdGlvbiBlKHQsbixyKXtmdW5jdGlvbiBzKG8sdSl7aWYoIW5bb10pe2lmKCF0W29dKXt2YXIgYT10eXBlb2YgcmVxdWlyZT09XCJmdW5jdGlvblwiJiZyZXF1aXJlO2lmKCF1JiZhKXJldHVybiBhKG8sITApO2lmKGkpcmV0dXJuIGkobywhMCk7dmFyIGY9bmV3IEVycm9yKFwiQ2Fubm90IGZpbmQgbW9kdWxlICdcIitvK1wiJ1wiKTt0aHJvdyBmLmNvZGU9XCJNT0RVTEVfTk9UX0ZPVU5EXCIsZn12YXIgbD1uW29dPXtleHBvcnRzOnt9fTt0W29dWzBdLmNhbGwobC5leHBvcnRzLGZ1bmN0aW9uKGUpe3ZhciBuPXRbb11bMV1bZV07cmV0dXJuIHMobj9uOmUpfSxsLGwuZXhwb3J0cyxlLHQsbixyKX1yZXR1cm4gbltvXS5leHBvcnRzfXZhciBpPXR5cGVvZiByZXF1aXJlPT1cImZ1bmN0aW9uXCImJnJlcXVpcmU7Zm9yKHZhciBvPTA7bzxyLmxlbmd0aDtvKyspcyhyW29dKTtyZXR1cm4gc30pIiwidmFyIHV0aWwgPSByZXF1aXJlKCcuL3V0aWwnKTtcblxudmFyIHRyYW5zbGF0ZUVsZW1lbnQgPSB1dGlsLnRyYW5zbGF0ZUVsZW1lbnQ7XG52YXIgZ2V0RWxlbWVudFRyYW5zbGF0ZSA9IHV0aWwuZ2V0RWxlbWVudFRyYW5zbGF0ZTtcbnZhciBnZXREaXN0YW5jZSA9IHV0aWwuZ2V0VG91Y2hEaXN0YW5jZTtcbnZhciB0cmFuc2xhdGUgPSB1dGlsLnRyYW5zbGF0ZTtcbnZhciBkYXRhVVJJdG9CbG9iID0gdXRpbC5kYXRhVVJJdG9CbG9iO1xuXG52YXIgQ3JvcHBlciA9IGZ1bmN0aW9uKCkge1xuICBpZiAoISgnb250b3VjaHN0YXJ0JyBpbiB3aW5kb3cpKSB7XG4gICAgdGhyb3cgbmV3IEVycm9yKCd0aGlzIGRlbW8gc2hvdWxkIHJ1biBpbiBtb2JpbGUgZGV2aWNlJyk7XG4gIH1cblxuICB0aGlzLmltYWdlU3RhdGUgPSB7fTtcbn07XG5cbkNyb3BwZXIucHJvdG90eXBlID0ge1xuICBjb25zdHJ1Y3RvcjogQ3JvcHBlcixcblxuICBzZXRJbWFnZTogZnVuY3Rpb24oc3JjKSB7XG4gICAgdmFyIHNlbGYgPSB0aGlzO1xuICAgIHNlbGYuaW1hZ2VMb2FkaW5nID0gdHJ1ZTtcbiAgICBzZWxmLmltYWdlID0gc3JjO1xuXG4gICAgc2VsZi5yZXNldFNpemUoKTtcblxuICAgIHZhciBpbWFnZSA9IG5ldyBJbWFnZSgpO1xuXG4gICAgaW1hZ2Uub25sb2FkID0gZnVuY3Rpb24oKSB7XG4gICAgICB2YXIgc2VsZkltYWdlID0gc2VsZi5yZWZzLmltYWdlO1xuXG4gICAgICBzZWxmSW1hZ2Uuc3JjID0gc3JjO1xuXG4gICAgICB2YXIgb3JpZ2luYWxXaWR0aCA9IGltYWdlLndpZHRoO1xuICAgICAgdmFyIG9yaWdpbmFsSGVpZ2h0ID0gaW1hZ2UuaGVpZ2h0O1xuXG4gICAgICBzZWxmLmltYWdlU3RhdGUubGVmdCA9IHNlbGYuaW1hZ2VTdGF0ZS50b3AgPSAwO1xuXG4gICAgICBzZWxmLmltYWdlU3RhdGUud2lkdGggPSBvcmlnaW5hbFdpZHRoO1xuICAgICAgc2VsZi5pbWFnZVN0YXRlLmhlaWdodCA9IG9yaWdpbmFsSGVpZ2h0O1xuXG4gICAgICBzZWxmLmluaXRTY2FsZSgpO1xuXG4gICAgICB2YXIgbWluU2NhbGUgPSBzZWxmLnNjYWxlUmFuZ2VbMF07XG4gICAgICB2YXIgaW1hZ2VXaWR0aCA9IG1pblNjYWxlICogb3JpZ2luYWxXaWR0aDtcbiAgICAgIHZhciBpbWFnZUhlaWdodCA9IG1pblNjYWxlICogb3JpZ2luYWxIZWlnaHQ7XG4gICAgICBzZWxmSW1hZ2Uuc3R5bGUud2lkdGggPSBpbWFnZVdpZHRoICsgJ3B4JztcbiAgICAgIHNlbGZJbWFnZS5zdHlsZS5oZWlnaHQgPSBpbWFnZUhlaWdodCArICdweCc7XG5cbiAgICAgIHZhciBpbWFnZUxlZnQsIGltYWdlVG9wO1xuXG4gICAgICB2YXIgY3JvcEJveFJlY3QgPSBzZWxmLmNyb3BCb3hSZWN0O1xuXG4gICAgICBpZiAob3JpZ2luYWxXaWR0aCA+IG9yaWdpbmFsSGVpZ2h0KSB7XG4gICAgICAgIGltYWdlTGVmdCA9IChjcm9wQm94UmVjdC53aWR0aCAtIGltYWdlV2lkdGgpIC8gMiArY3JvcEJveFJlY3QubGVmdDtcbiAgICAgICAgaW1hZ2VUb3AgPSBjcm9wQm94UmVjdC50b3A7XG4gICAgICB9IGVsc2Uge1xuICAgICAgICBpbWFnZUxlZnQgPSBjcm9wQm94UmVjdC5sZWZ0O1xuICAgICAgICBpbWFnZVRvcCA9IChjcm9wQm94UmVjdC5oZWlnaHQgLSBpbWFnZUhlaWdodCkgLyAyICsgY3JvcEJveFJlY3QudG9wO1xuICAgICAgfVxuXG4gICAgICBzZWxmLm1vdmVJbWFnZShpbWFnZUxlZnQsIGltYWdlVG9wKTtcblxuICAgICAgc2VsZi5pbWFnZUxvYWRpbmcgPSBmYWxzZTtcbiAgICB9O1xuICAgIGltYWdlLnNyYyA9IHNyYztcbiAgfSxcblxuICBnZXRGb2NhbFBvaW50OiBmdW5jdGlvbihldmVudCkge1xuICAgIHZhciBmb2NhbFBvaW50ID0ge1xuICAgICAgbGVmdDogKGV2ZW50LnRvdWNoZXNbMF0ucGFnZVggKyBldmVudC50b3VjaGVzWzFdLnBhZ2VYKSAvIDIsXG4gICAgICB0b3A6IChldmVudC50b3VjaGVzWzBdLnBhZ2VZICsgZXZlbnQudG91Y2hlc1sxXS5wYWdlWSkgLyAyXG4gICAgfTtcblxuICAgIHZhciBpbWFnZVN0YXRlID0gdGhpcy5pbWFnZVN0YXRlO1xuICAgIHZhciBjcm9wQm94UmVjdCA9IHRoaXMuY3JvcEJveFJlY3Q7XG5cbiAgICBmb2NhbFBvaW50LmxlZnQgLT0gY3JvcEJveFJlY3QubGVmdCArIGltYWdlU3RhdGUubGVmdDtcbiAgICBmb2NhbFBvaW50LnRvcCAtPSBjcm9wQm94UmVjdC50b3AgKyBpbWFnZVN0YXRlLnRvcDtcblxuICAgIHJldHVybiBmb2NhbFBvaW50O1xuICB9LFxuXG4gIHJlbmRlcjogZnVuY3Rpb24ocGFyZW50Tm9kZSkge1xuICAgIHZhciBlbGVtZW50ID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudCgnZGl2Jyk7XG4gICAgZWxlbWVudC5jbGFzc05hbWUgPSAnY3JvcHBlcic7XG5cbiAgICB2YXIgY292ZXJTdGFydCA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoJ2RpdicpO1xuICAgIHZhciBjb3ZlckVuZCA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoJ2RpdicpO1xuICAgIHZhciBjcm9wQm94ID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudCgnZGl2Jyk7XG4gICAgdmFyIGltYWdlID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudCgnaW1nJyk7XG5cbiAgICBjb3ZlclN0YXJ0LmNsYXNzTmFtZSA9ICdjb3ZlciBjb3Zlci1zdGFydCc7XG4gICAgY292ZXJFbmQuY2xhc3NOYW1lID0gJ2NvdmVyIGNvdmVyLWVuZCc7XG4gICAgY3JvcEJveC5jbGFzc05hbWUgPSAnY3JvcC1ib3gnO1xuXG4gICAgZWxlbWVudC5hcHBlbmRDaGlsZChjb3ZlclN0YXJ0KTtcbiAgICBlbGVtZW50LmFwcGVuZENoaWxkKGNvdmVyRW5kKTtcbiAgICBlbGVtZW50LmFwcGVuZENoaWxkKGNyb3BCb3gpO1xuICAgIGVsZW1lbnQuYXBwZW5kQ2hpbGQoaW1hZ2UpO1xuXG4gICAgdGhpcy5yZWZzID0ge1xuICAgICAgZWxlbWVudDogZWxlbWVudCxcbiAgICAgIGNvdmVyU3RhcnQ6IGNvdmVyU3RhcnQsXG4gICAgICBjb3ZlckVuZDogY292ZXJFbmQsXG4gICAgICBjcm9wQm94OiBjcm9wQm94LFxuICAgICAgaW1hZ2U6IGltYWdlXG4gICAgfTtcblxuICAgIGlmIChwYXJlbnROb2RlKSB7XG4gICAgICBwYXJlbnROb2RlLmFwcGVuZENoaWxkKGVsZW1lbnQpO1xuICAgIH1cblxuICAgIGlmIChlbGVtZW50Lm9mZnNldEhlaWdodCA+IDApIHtcbiAgICAgIHRoaXMucmVzZXRTaXplKCk7XG4gICAgfVxuXG4gICAgdGhpcy5iaW5kRXZlbnRzKCk7XG4gIH0sXG5cbiAgaW5pdFNjYWxlOiBmdW5jdGlvbiAoKSB7XG4gICAgdmFyIGNyb3BCb3hSZWN0ID0gdGhpcy5jcm9wQm94UmVjdDtcbiAgICB2YXIgd2lkdGggPSB0aGlzLmltYWdlU3RhdGUud2lkdGg7XG4gICAgdmFyIGhlaWdodCA9IHRoaXMuaW1hZ2VTdGF0ZS5oZWlnaHQ7XG4gICAgdmFyIHNjYWxlLCBtaW5TY2FsZTtcblxuICAgIGlmICh3aWR0aCA+IGhlaWdodCkge1xuICAgICAgc2NhbGUgPSB0aGlzLmltYWdlU3RhdGUuc2NhbGUgPSBjcm9wQm94UmVjdC5oZWlnaHQgLyBoZWlnaHQ7XG4gICAgICBtaW5TY2FsZSA9IGNyb3BCb3hSZWN0LmhlaWdodCAqIDAuOCAvIGhlaWdodDtcbiAgICB9IGVsc2Uge1xuICAgICAgc2NhbGUgPSB0aGlzLmltYWdlU3RhdGUuc2NhbGUgPSBjcm9wQm94UmVjdC53aWR0aCAvIHdpZHRoO1xuICAgICAgbWluU2NhbGUgPSBjcm9wQm94UmVjdC53aWR0aCAqIDAuOCAvIHdpZHRoO1xuICAgIH1cblxuICAgIHRoaXMuc2NhbGVSYW5nZSA9IFtzY2FsZSwgMl07XG4gICAgdGhpcy5ib3VuY2VTY2FsZVJhbmdlID0gW21pblNjYWxlLCAzXTtcbiAgfSxcblxuICByZXNldFNpemU6IGZ1bmN0aW9uKCkge1xuICAgIHZhciByZWZzID0gdGhpcy5yZWZzO1xuICAgIGlmICghcmVmcykgcmV0dXJuO1xuXG4gICAgdmFyIGVsZW1lbnQgPSByZWZzLmVsZW1lbnQ7XG4gICAgdmFyIGNyb3BCb3ggPSByZWZzLmNyb3BCb3g7XG4gICAgdmFyIGNvdmVyU3RhcnQgPSByZWZzLmNvdmVyU3RhcnQ7XG4gICAgdmFyIGNvdmVyRW5kID0gcmVmcy5jb3ZlckVuZDtcblxuICAgIHZhciB3aWR0aCA9IGVsZW1lbnQub2Zmc2V0V2lkdGg7XG4gICAgdmFyIGhlaWdodCA9IGVsZW1lbnQub2Zmc2V0SGVpZ2h0O1xuXG4gICAgaWYgKHdpZHRoID4gaGVpZ2h0KSB7XG4gICAgICBlbGVtZW50LmNsYXNzTmFtZSA9ICdjcm9wcGVyIGNyb3BwZXItaG9yaXpvbnRhbCc7XG5cbiAgICAgIGNvdmVyU3RhcnQuc3R5bGUud2lkdGggPSBjb3ZlckVuZC5zdHlsZS53aWR0aCA9ICh3aWR0aCAtIGhlaWdodCkgLyAyICsgJ3B4JztcbiAgICAgIGNvdmVyU3RhcnQuc3R5bGUuaGVpZ2h0ID0gY292ZXJFbmQuc3R5bGUuaGVpZ2h0ID0gJyc7XG4gICAgICBjcm9wQm94LnN0eWxlLndpZHRoID0gY3JvcEJveC5zdHlsZS5oZWlnaHQgPSBoZWlnaHQgKyAncHgnO1xuICAgIH0gZWxzZSB7XG4gICAgICBlbGVtZW50LmNsYXNzTmFtZSA9ICdjcm9wcGVyJztcblxuICAgICAgY292ZXJTdGFydC5zdHlsZS5oZWlnaHQgPSBjb3ZlckVuZC5zdHlsZS5oZWlnaHQgPSAoaGVpZ2h0IC0gd2lkdGgpIC8gMiArICdweCc7XG4gICAgICBjb3ZlclN0YXJ0LnN0eWxlLndpZHRoID0gY292ZXJFbmQuc3R5bGUud2lkdGggPSAnJztcbiAgICAgIGNyb3BCb3guc3R5bGUud2lkdGggPSBjcm9wQm94LnN0eWxlLmhlaWdodCA9IHdpZHRoICsgJ3B4JztcbiAgICB9XG5cbiAgICB2YXIgZWxlbWVudFJlY3QgPSBlbGVtZW50LmdldEJvdW5kaW5nQ2xpZW50UmVjdCgpO1xuICAgIHZhciBjcm9wQm94UmVjdCA9IGNyb3BCb3guZ2V0Qm91bmRpbmdDbGllbnRSZWN0KCk7XG5cbiAgICB0aGlzLmNyb3BCb3hSZWN0ID0ge1xuICAgICAgbGVmdDogY3JvcEJveFJlY3QubGVmdCAtIGVsZW1lbnRSZWN0LmxlZnQsXG4gICAgICB0b3A6IGNyb3BCb3hSZWN0LnRvcCAtIGVsZW1lbnRSZWN0LnRvcCxcbiAgICAgIHdpZHRoOiBjcm9wQm94UmVjdC53aWR0aCxcbiAgICAgIGhlaWdodDogY3JvcEJveFJlY3QuaGVpZ2h0XG4gICAgfTtcblxuICAgIHRoaXMuaW5pdFNjYWxlKCk7XG5cbiAgICB0aGlzLmNoZWNrQm91bmNlKDApO1xuICB9LFxuXG4gIGNoZWNrQm91bmNlOiBmdW5jdGlvbiAoc3BlZWQpIHtcbiAgICB2YXIgaW1hZ2VTdGF0ZSA9IHRoaXMuaW1hZ2VTdGF0ZTtcbiAgICB2YXIgY3JvcEJveFJlY3QgPSB0aGlzLmNyb3BCb3hSZWN0O1xuXG4gICAgdmFyIGltYWdlV2lkdGggPSBpbWFnZVN0YXRlLndpZHRoO1xuICAgIHZhciBpbWFnZUhlaWdodCA9IGltYWdlU3RhdGUuaGVpZ2h0O1xuICAgIHZhciBpbWFnZVNjYWxlID0gaW1hZ2VTdGF0ZS5zY2FsZTtcblxuICAgIHZhciBpbWFnZU9mZnNldCA9IGdldEVsZW1lbnRUcmFuc2xhdGUodGhpcy5yZWZzLmltYWdlKTtcbiAgICB2YXIgbGVmdCA9IGltYWdlT2Zmc2V0LmxlZnQ7XG4gICAgdmFyIHRvcCA9IGltYWdlT2Zmc2V0LnRvcDtcblxuICAgIHZhciBsZWZ0UmFuZ2UgPSBbLWltYWdlV2lkdGggKiBpbWFnZVNjYWxlICsgY3JvcEJveFJlY3Qud2lkdGggKyBjcm9wQm94UmVjdC5sZWZ0LCBjcm9wQm94UmVjdC5sZWZ0XTtcbiAgICB2YXIgdG9wUmFuZ2UgPSBbLWltYWdlSGVpZ2h0ICogaW1hZ2VTY2FsZSArIGNyb3BCb3hSZWN0LmhlaWdodCArIGNyb3BCb3hSZWN0LnRvcCwgY3JvcEJveFJlY3QudG9wXTtcblxuICAgIHZhciBvdmVyZmxvdyA9IGZhbHNlO1xuXG4gICAgaWYgKGxlZnQgPCBsZWZ0UmFuZ2VbMF0pIHtcbiAgICAgIGxlZnQgPSBsZWZ0UmFuZ2VbMF07XG4gICAgICBvdmVyZmxvdyA9IHRydWU7XG4gICAgfSBlbHNlIGlmIChsZWZ0ID4gbGVmdFJhbmdlWzFdKSB7XG4gICAgICBsZWZ0ID0gbGVmdFJhbmdlWzFdO1xuICAgICAgb3ZlcmZsb3cgPSB0cnVlO1xuICAgIH1cblxuICAgIGlmICh0b3AgPCB0b3BSYW5nZVswXSkge1xuICAgICAgdG9wID0gdG9wUmFuZ2VbMF07XG4gICAgICBvdmVyZmxvdyA9IHRydWU7XG4gICAgfSBlbHNlIGlmICh0b3AgPiB0b3BSYW5nZVsxXSkge1xuICAgICAgdG9wID0gdG9wUmFuZ2VbMV07XG4gICAgICBvdmVyZmxvdyA9IHRydWU7XG4gICAgfVxuXG4gICAgaWYgKG92ZXJmbG93KSB7XG4gICAgICB2YXIgc2VsZiA9IHRoaXM7XG4gICAgICB0cmFuc2xhdGUodGhpcy5yZWZzLmltYWdlLCBsZWZ0LCB0b3AsIHNwZWVkID09PSB1bmRlZmluZWQgPyAyMDAgOiAwLCBmdW5jdGlvbigpIHtcbiAgICAgICAgc2VsZi5tb3ZlSW1hZ2UobGVmdCwgdG9wKTtcbiAgICAgIH0pO1xuICAgIH1cbiAgfSxcblxuICBtb3ZlSW1hZ2U6IGZ1bmN0aW9uKGxlZnQsIHRvcCkge1xuICAgIHZhciBpbWFnZSA9IHRoaXMucmVmcy5pbWFnZTtcbiAgICB0cmFuc2xhdGVFbGVtZW50KGltYWdlLCBsZWZ0LCB0b3ApO1xuXG4gICAgdGhpcy5pbWFnZVN0YXRlLmxlZnQgPSBsZWZ0O1xuICAgIHRoaXMuaW1hZ2VTdGF0ZS50b3AgPSB0b3A7XG4gIH0sXG5cbiAgb25Ub3VjaFN0YXJ0OiBmdW5jdGlvbihldmVudCkge1xuICAgIHRoaXMuYW1wbGl0dWRlID0gMDtcbiAgICB2YXIgaW1hZ2UgPSB0aGlzLnJlZnMuaW1hZ2U7XG5cbiAgICB2YXIgZmluZ2VyQ291bnQgPSBldmVudC50b3VjaGVzLmxlbmd0aDtcbiAgICBpZiAoZmluZ2VyQ291bnQpIHtcbiAgICAgIHZhciB0b3VjaEV2ZW50ID0gZXZlbnQudG91Y2hlc1swXTtcblxuICAgICAgdmFyIGltYWdlT2Zmc2V0ID0gZ2V0RWxlbWVudFRyYW5zbGF0ZShpbWFnZSk7XG5cbiAgICAgIHRoaXMuZHJhZ1N0YXRlID0ge1xuICAgICAgICB0aW1lc3RhbXA6IERhdGUubm93KCksXG4gICAgICAgIHN0YXJ0VG91Y2hMZWZ0OiB0b3VjaEV2ZW50LnBhZ2VYLFxuICAgICAgICBzdGFydFRvdWNoVG9wOiB0b3VjaEV2ZW50LnBhZ2VZLFxuICAgICAgICBzdGFydExlZnQ6IGltYWdlT2Zmc2V0LmxlZnQgfHwgMCxcbiAgICAgICAgc3RhcnRUb3A6IGltYWdlT2Zmc2V0LnRvcCB8fCAwXG4gICAgICB9O1xuICAgIH1cblxuICAgIGlmIChmaW5nZXJDb3VudCA+PSAyKSB7XG4gICAgICB2YXIgem9vbVN0YXRlID0gdGhpcy56b29tU3RhdGUgPSB7XG4gICAgICAgIHRpbWVzdGFtcDogRGF0ZS5ub3coKVxuICAgICAgfTtcblxuICAgICAgem9vbVN0YXRlLnN0YXJ0RGlzdGFuY2UgPSBnZXREaXN0YW5jZShldmVudCk7XG4gICAgICB6b29tU3RhdGUuZm9jYWxQb2ludCA9IHRoaXMuZ2V0Rm9jYWxQb2ludChldmVudCk7XG4gICAgfVxuICB9LFxuXG4gIG9uVG91Y2hNb3ZlOiBmdW5jdGlvbihldmVudCkge1xuICAgIHZhciBmaW5nZXJDb3VudCA9IGV2ZW50LnRvdWNoZXMubGVuZ3RoO1xuXG4gICAgdmFyIHRvdWNoRXZlbnQgPSBldmVudC50b3VjaGVzWzBdO1xuXG4gICAgdmFyIGNyb3BCb3hSZWN0ID0gdGhpcy5jcm9wQm94UmVjdDtcbiAgICB2YXIgaW1hZ2UgPSB0aGlzLnJlZnMuaW1hZ2U7XG5cbiAgICB2YXIgaW1hZ2VTdGF0ZSA9IHRoaXMuaW1hZ2VTdGF0ZTtcbiAgICB2YXIgaW1hZ2VXaWR0aCA9IGltYWdlU3RhdGUud2lkdGg7XG4gICAgdmFyIGltYWdlSGVpZ2h0ID0gaW1hZ2VTdGF0ZS5oZWlnaHQ7XG5cbiAgICB2YXIgZHJhZ1N0YXRlID0gdGhpcy5kcmFnU3RhdGU7XG4gICAgdmFyIHpvb21TdGF0ZSA9IHRoaXMuem9vbVN0YXRlO1xuXG4gICAgaWYgKGZpbmdlckNvdW50ID09PSAxKSB7XG4gICAgICB2YXIgbGVmdFJhbmdlID0gWyAtaW1hZ2VXaWR0aCAqIGltYWdlU3RhdGUuc2NhbGUgKyBjcm9wQm94UmVjdC53aWR0aCwgY3JvcEJveFJlY3QubGVmdCBdO1xuICAgICAgdmFyIHRvcFJhbmdlID0gWyAtaW1hZ2VIZWlnaHQgKiBpbWFnZVN0YXRlLnNjYWxlICsgY3JvcEJveFJlY3QuaGVpZ2h0ICsgY3JvcEJveFJlY3QudG9wLCBjcm9wQm94UmVjdC50b3AgXTtcblxuICAgICAgdmFyIGRlbHRhWCA9IHRvdWNoRXZlbnQucGFnZVggLSAoZHJhZ1N0YXRlLmxhc3RMZWZ0IHx8IGRyYWdTdGF0ZS5zdGFydFRvdWNoTGVmdCk7XG4gICAgICB2YXIgZGVsdGFZID0gdG91Y2hFdmVudC5wYWdlWSAtIChkcmFnU3RhdGUubGFzdFRvcCB8fCBkcmFnU3RhdGUuc3RhcnRUb3VjaFRvcCk7XG5cbiAgICAgIHZhciBpbWFnZU9mZnNldCA9IGdldEVsZW1lbnRUcmFuc2xhdGUoaW1hZ2UpO1xuXG4gICAgICB2YXIgbGVmdCA9IGltYWdlT2Zmc2V0LmxlZnQgKyBkZWx0YVg7XG4gICAgICB2YXIgdG9wID0gaW1hZ2VPZmZzZXQudG9wICsgZGVsdGFZO1xuXG4gICAgICBpZiAobGVmdCA8IGxlZnRSYW5nZVswXSB8fCBsZWZ0ID4gbGVmdFJhbmdlWzFdKSB7XG4gICAgICAgIGxlZnQgLT0gZGVsdGFYIC8gMjtcbiAgICAgIH1cblxuICAgICAgaWYgKHRvcCA8IHRvcFJhbmdlIFswXSB8fCB0b3AgPiB0b3BSYW5nZVsxXSkge1xuICAgICAgICB0b3AgLT0gZGVsdGFZIC8gMjtcbiAgICAgIH1cblxuICAgICAgdGhpcy5tb3ZlSW1hZ2UobGVmdCwgdG9wKTtcbiAgICB9IGVsc2UgaWYgKGZpbmdlckNvdW50ID49IDIpIHtcbiAgICAgIGlmICghem9vbVN0YXRlLnRpbWVzdGFtcCkge1xuICAgICAgICB6b29tU3RhdGUgPSB7XG4gICAgICAgICAgdGltZXN0YW1wOiBEYXRlLm5vdygpXG4gICAgICAgIH07XG5cbiAgICAgICAgem9vbVN0YXRlLnN0YXJ0RGlzdGFuY2UgPSBnZXREaXN0YW5jZShldmVudCk7XG4gICAgICAgIHpvb21TdGF0ZS5mb2NhbFBvaW50ID0gdGhpcy5nZXRGb2NhbFBvaW50KGV2ZW50KTtcblxuICAgICAgICByZXR1cm47XG4gICAgICB9XG5cbiAgICAgIHZhciBuZXdEaXN0YW5jZSA9IGdldERpc3RhbmNlKGV2ZW50KTtcbiAgICAgIHZhciBvbGRTY2FsZSA9IGltYWdlU3RhdGUuc2NhbGU7XG5cbiAgICAgIGltYWdlU3RhdGUuc2NhbGUgPSBvbGRTY2FsZSAqIG5ld0Rpc3RhbmNlIC8gKHpvb21TdGF0ZS5sYXN0RGlzdGFuY2UgfHwgem9vbVN0YXRlLnN0YXJ0RGlzdGFuY2UpO1xuXG4gICAgICB2YXIgc2NhbGVSYW5nZSA9IHRoaXMuc2NhbGVSYW5nZTtcbiAgICAgIGlmIChpbWFnZVN0YXRlLnNjYWxlIDwgc2NhbGVSYW5nZVswXSkge1xuICAgICAgICBpbWFnZVN0YXRlLnNjYWxlID0gc2NhbGVSYW5nZVswXTtcbiAgICAgIH0gZWxzZSBpZiAoaW1hZ2VTdGF0ZS5zY2FsZSA+IHNjYWxlUmFuZ2VbMV0pIHtcbiAgICAgICAgaW1hZ2VTdGF0ZS5zY2FsZSA9IHNjYWxlUmFuZ2VbMV07XG4gICAgICB9XG5cbiAgICAgIHRoaXMuem9vbVdpdGhGb2NhbChvbGRTY2FsZSk7XG5cbiAgICAgIHpvb21TdGF0ZS5mb2NhbFBvaW50ID0gdGhpcy5nZXRGb2NhbFBvaW50KGV2ZW50KTtcbiAgICAgIHpvb21TdGF0ZS5sYXN0RGlzdGFuY2UgPSBuZXdEaXN0YW5jZTtcbiAgICB9XG5cbiAgICBkcmFnU3RhdGUubGFzdExlZnQgPSB0b3VjaEV2ZW50LnBhZ2VYO1xuICAgIGRyYWdTdGF0ZS5sYXN0VG9wID0gdG91Y2hFdmVudC5wYWdlWTtcbiAgfSxcblxuICBvblRvdWNoRW5kOiBmdW5jdGlvbihldmVudCkge1xuICAgIHZhciBpbWFnZVN0YXRlID0gdGhpcy5pbWFnZVN0YXRlO1xuICAgIHZhciB6b29tU3RhdGUgPSB0aGlzLnpvb21TdGF0ZTtcbiAgICB2YXIgZHJhZ1N0YXRlID0gdGhpcy5kcmFnU3RhdGU7XG4gICAgdmFyIGFtcGxpdHVkZSA9IHRoaXMuYW1wbGl0dWRlO1xuICAgIHZhciBpbWFnZVdpZHRoID0gaW1hZ2VTdGF0ZS53aWR0aDtcbiAgICB2YXIgaW1hZ2VIZWlnaHQgPSBpbWFnZVN0YXRlLmhlaWdodDtcbiAgICB2YXIgY3JvcEJveFJlY3QgPSB0aGlzLmNyb3BCb3hSZWN0O1xuXG4gICAgaWYgKGV2ZW50LnRvdWNoZXMubGVuZ3RoID09PSAwICYmIGRyYWdTdGF0ZS50aW1lc3RhbXApIHtcbiAgICAgIHZhciBzZWxmID0gdGhpcztcbiAgICAgIHZhciBkdXJhdGlvbiA9IERhdGUubm93KCkgLSBkcmFnU3RhdGUudGltZXN0YW1wO1xuXG4gICAgICBpZiAoZHVyYXRpb24gPiAzMDApIHtcbiAgICAgICAgc2VsZi5jaGVja0JvdW5jZSgpO1xuICAgICAgfSBlbHNlIHtcbiAgICAgICAgdmFyIHRhcmdldDtcblxuICAgICAgICB2YXIgdG9wID0gaW1hZ2VTdGF0ZS50b3A7XG4gICAgICAgIHZhciBsZWZ0ID0gaW1hZ2VTdGF0ZS5sZWZ0O1xuXG4gICAgICAgIHZhciBtb21lbnR1bVZlcnRpY2FsID0gZmFsc2U7XG5cbiAgICAgICAgdmFyIHRpbWVDb25zdGFudCA9IDE2MDtcblxuICAgICAgICB2YXIgYXV0b1Njcm9sbCA9IGZ1bmN0aW9uICgpIHtcbiAgICAgICAgICB2YXIgZWxhcHNlZCwgZGVsdGE7XG5cbiAgICAgICAgICBpZiAoYW1wbGl0dWRlKSB7XG4gICAgICAgICAgICBlbGFwc2VkID0gRGF0ZS5ub3coKSAtIHRpbWVzdGFtcDtcbiAgICAgICAgICAgIGRlbHRhID0gLWFtcGxpdHVkZSAqIE1hdGguZXhwKC1lbGFwc2VkIC8gdGltZUNvbnN0YW50KTtcbiAgICAgICAgICAgIGlmIChkZWx0YSA+IDAuNSB8fCBkZWx0YSA8IC0wLjUpIHtcbiAgICAgICAgICAgICAgaWYgKG1vbWVudHVtVmVydGljYWwpIHtcbiAgICAgICAgICAgICAgICBzZWxmLm1vdmVJbWFnZShsZWZ0LCB0YXJnZXQgKyBkZWx0YSk7XG4gICAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgc2VsZi5tb3ZlSW1hZ2UodGFyZ2V0ICsgZGVsdGEsIHRvcCk7XG4gICAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgICByZXF1ZXN0QW5pbWF0aW9uRnJhbWUoYXV0b1Njcm9sbCk7XG4gICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICB2YXIgY3VycmVudExlZnQ7XG4gICAgICAgICAgICAgIHZhciBjdXJyZW50VG9wO1xuXG4gICAgICAgICAgICAgIGlmIChtb21lbnR1bVZlcnRpY2FsKSB7XG4gICAgICAgICAgICAgICAgY3VycmVudExlZnQgPSBsZWZ0O1xuICAgICAgICAgICAgICAgIGN1cnJlbnRUb3AgPSB0YXJnZXQ7XG4gICAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgY3VycmVudExlZnQgPSB0YXJnZXQ7XG4gICAgICAgICAgICAgICAgY3VycmVudFRvcCA9IHRvcDtcbiAgICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICAgIHNlbGYubW92ZUltYWdlKGN1cnJlbnRMZWZ0LCBjdXJyZW50VG9wKTtcbiAgICAgICAgICAgICAgc2VsZi5jaGVja0JvdW5jZSgpO1xuICAgICAgICAgICAgfVxuICAgICAgICAgIH1cbiAgICAgICAgfTtcblxuICAgICAgICB2YXIgdmVsb2NpdHk7XG5cbiAgICAgICAgdmFyIGRlbHRhWCA9IGV2ZW50LmNoYW5nZWRUb3VjaGVzWzBdLnBhZ2VYIC0gZHJhZ1N0YXRlLnN0YXJ0VG91Y2hMZWZ0O1xuICAgICAgICB2YXIgZGVsdGFZID0gZXZlbnQuY2hhbmdlZFRvdWNoZXNbMF0ucGFnZVkgLSBkcmFnU3RhdGUuc3RhcnRUb3VjaFRvcDtcblxuICAgICAgICBpZiAoTWF0aC5hYnMoZGVsdGFYKSA+IE1hdGguYWJzKGRlbHRhWSkpIHtcbiAgICAgICAgICB2ZWxvY2l0eSA9IGRlbHRhWCAvIGR1cmF0aW9uO1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgIG1vbWVudHVtVmVydGljYWwgPSB0cnVlO1xuICAgICAgICAgIHZlbG9jaXR5ID0gZGVsdGFZIC8gZHVyYXRpb247XG4gICAgICAgIH1cblxuICAgICAgICBhbXBsaXR1ZGUgPSA4MCAqIHZlbG9jaXR5O1xuXG4gICAgICAgIHZhciByYW5nZTtcblxuICAgICAgICBpZiAobW9tZW50dW1WZXJ0aWNhbCkge1xuICAgICAgICAgIHRhcmdldCA9IE1hdGgucm91bmQoaW1hZ2VTdGF0ZS50b3AgKyBhbXBsaXR1ZGUpO1xuICAgICAgICAgIHJhbmdlID0gWy1pbWFnZUhlaWdodCAqIGltYWdlU3RhdGUuc2NhbGUgKyBjcm9wQm94UmVjdC5oZWlnaHQgLyAyICsgY3JvcEJveFJlY3QudG9wLCBjcm9wQm94UmVjdC50b3AgKyBjcm9wQm94UmVjdC5oZWlnaHQgLyAyXTtcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICB0YXJnZXQgPSBNYXRoLnJvdW5kKGltYWdlU3RhdGUubGVmdCArIGFtcGxpdHVkZSk7XG4gICAgICAgICAgcmFuZ2UgPSBbLWltYWdlV2lkdGggKiBpbWFnZVN0YXRlLnNjYWxlICsgY3JvcEJveFJlY3Qud2lkdGggLyAyLCBjcm9wQm94UmVjdC5sZWZ0ICsgY3JvcEJveFJlY3Qud2lkdGggLyAyXTtcbiAgICAgICAgfVxuXG4gICAgICAgIGlmICh0YXJnZXQgPCByYW5nZVswXSkge1xuICAgICAgICAgIHRhcmdldCA9IHJhbmdlWzBdO1xuICAgICAgICAgIGFtcGxpdHVkZSAvPSAyO1xuICAgICAgICB9IGVsc2UgaWYgKHRhcmdldCA+IHJhbmdlWzFdKSB7XG4gICAgICAgICAgdGFyZ2V0ID0gcmFuZ2VbMV07XG4gICAgICAgICAgYW1wbGl0dWRlIC89IDI7XG4gICAgICAgIH1cblxuICAgICAgICB2YXIgdGltZXN0YW1wID0gRGF0ZS5ub3coKTtcbiAgICAgICAgcmVxdWVzdEFuaW1hdGlvbkZyYW1lKGF1dG9TY3JvbGwpO1xuICAgICAgfVxuXG4gICAgICB0aGlzLmRyYWdTdGF0ZSA9IHt9O1xuICAgIH0gZWxzZSBpZiAoem9vbVN0YXRlLnRpbWVzdGFtcCkge1xuICAgICAgdGhpcy5jaGVja0JvdW5jZSgpO1xuXG4gICAgICB0aGlzLnpvb21TdGF0ZSA9IHt9O1xuICAgIH1cbiAgfSxcblxuICB6b29tV2l0aEZvY2FsOiBmdW5jdGlvbihvbGRTY2FsZSkge1xuICAgIHZhciBpbWFnZSA9IHRoaXMucmVmcy5pbWFnZTtcbiAgICB2YXIgaW1hZ2VTdGF0ZSA9IHRoaXMuaW1hZ2VTdGF0ZTtcbiAgICB2YXIgaW1hZ2VTY2FsZSA9IGltYWdlU3RhdGUuc2NhbGU7XG5cbiAgICBpbWFnZS5zdHlsZS53aWR0aCA9IGltYWdlU3RhdGUud2lkdGggKiBpbWFnZVNjYWxlICsgJ3B4JztcbiAgICBpbWFnZS5zdHlsZS5oZWlnaHQgPSBpbWFnZVN0YXRlLmhlaWdodCAqIGltYWdlU2NhbGUgKyAncHgnO1xuXG4gICAgdmFyIGZvY2FsUG9pbnQgPSB0aGlzLnpvb21TdGF0ZS5mb2NhbFBvaW50O1xuXG4gICAgdmFyIG9mZnNldExlZnQgPSAoZm9jYWxQb2ludC5sZWZ0IC8gaW1hZ2VTY2FsZSAtIGZvY2FsUG9pbnQubGVmdCAvIG9sZFNjYWxlKSAqIGltYWdlU2NhbGU7XG4gICAgdmFyIG9mZnNldFRvcCA9IChmb2NhbFBvaW50LnRvcCAvIGltYWdlU2NhbGUgLSBmb2NhbFBvaW50LnRvcCAvIG9sZFNjYWxlKSAqIGltYWdlU2NhbGU7XG5cbiAgICB2YXIgaW1hZ2VMZWZ0ID0gaW1hZ2VTdGF0ZS5sZWZ0IHx8IDA7XG4gICAgdmFyIGltYWdlVG9wID0gaW1hZ2VTdGF0ZS50b3AgfHwgMDtcblxuICAgIHRoaXMubW92ZUltYWdlKGltYWdlTGVmdCArIG9mZnNldExlZnQsIGltYWdlVG9wICsgb2Zmc2V0VG9wKTtcbiAgfSxcblxuICBiaW5kRXZlbnRzOiBmdW5jdGlvbigpIHtcbiAgICB2YXIgY3JvcEJveCA9IHRoaXMucmVmcy5jcm9wQm94O1xuXG4gICAgY3JvcEJveC5hZGRFdmVudExpc3RlbmVyKCd0b3VjaHN0YXJ0JywgdGhpcy5vblRvdWNoU3RhcnQuYmluZCh0aGlzKSk7XG5cbiAgICBjcm9wQm94LmFkZEV2ZW50TGlzdGVuZXIoJ3RvdWNobW92ZScsIHRoaXMub25Ub3VjaE1vdmUuYmluZCh0aGlzKSk7XG5cbiAgICBjcm9wQm94LmFkZEV2ZW50TGlzdGVuZXIoJ3RvdWNoZW5kJywgdGhpcy5vblRvdWNoRW5kLmJpbmQodGhpcykpO1xuICB9LFxuXG4gIGdldENyb3BwZWRJbWFnZTogZnVuY3Rpb24od2lkdGgpIHtcbiAgICBpZiAoIXRoaXMuaW1hZ2UpIHJldHVybiBudWxsO1xuXG4gICAgdmFyIGltYWdlU3RhdGUgPSB0aGlzLmltYWdlU3RhdGU7XG4gICAgdmFyIGNyb3BCb3hSZWN0ID0gdGhpcy5jcm9wQm94UmVjdDtcbiAgICB2YXIgc2NhbGUgPSBpbWFnZVN0YXRlLnNjYWxlO1xuXG4gICAgdmFyIGNhbnZhc1NpemUgPSB3aWR0aDtcblxuICAgIGlmICghY2FudmFzU2l6ZSkge1xuICAgICAgY2FudmFzU2l6ZSA9IGNyb3BCb3hSZWN0LndpZHRoICogMjtcbiAgICB9XG5cbiAgICB2YXIgY2FudmFzID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudCgnY2FudmFzJyk7XG4gICAgdmFyIGNvbnRleHQgPSBjYW52YXMuZ2V0Q29udGV4dCgnMmQnKTtcbiAgICBjYW52YXMud2lkdGggPSBjYW52YXMuaGVpZ2h0ID0gY2FudmFzU2l6ZTtcblxuICAgIHZhciBpbWFnZUxlZnQgPSBNYXRoLnJvdW5kKChjcm9wQm94UmVjdC5sZWZ0IC0gaW1hZ2VTdGF0ZS5sZWZ0KSAvIHNjYWxlKTtcbiAgICB2YXIgaW1hZ2VUb3AgPSBNYXRoLnJvdW5kKChjcm9wQm94UmVjdC50b3AgIC0gaW1hZ2VTdGF0ZS50b3ApIC8gc2NhbGUpO1xuICAgIHZhciBpbWFnZVNpemUgPSBNYXRoLmZsb29yKGNyb3BCb3hSZWN0LndpZHRoIC8gc2NhbGUpO1xuXG4gICAgY29udGV4dC5kcmF3SW1hZ2UodGhpcy5yZWZzLmltYWdlLCBpbWFnZUxlZnQsIGltYWdlVG9wLCBpbWFnZVNpemUsIGltYWdlU2l6ZSwgMCwgMCwgY2FudmFzU2l6ZSwgY2FudmFzU2l6ZSk7XG5cbiAgICB2YXIgZGF0YVVSTCA9IGNhbnZhcy50b0RhdGFVUkwoKTtcblxuICAgIHJldHVybiB7XG4gICAgICBmaWxlOiBjYW52YXMudG9CbG9iID8gY2FudmFzLnRvQmxvYigpIDogZGF0YVVSSXRvQmxvYihkYXRhVVJMKSxcbiAgICAgIGRhdGFVcmw6IGRhdGFVUkwsXG4gICAgICBzaXplOiBjYW52YXNTaXplXG4gICAgfTtcbiAgfVxufTtcblxubW9kdWxlLmV4cG9ydHMgPSBDcm9wcGVyOyIsIndpbmRvdy5Dcm9wcGVyID0gcmVxdWlyZSgnLi9jcm9wcGVyJyk7IiwiXG52YXIgb25jZSA9IGZ1bmN0aW9uKGVsLCBldmVudCwgZm4pIHtcbiAgdmFyIGxpc3RlbmVyID0gZnVuY3Rpb24oKSB7XG4gICAgaWYgKGZuKSB7XG4gICAgICBmbi5hcHBseSh0aGlzLCBhcmd1bWVudHMpO1xuICAgIH1cbiAgICBlbC5yZW1vdmVFdmVudExpc3RlbmVyKGV2ZW50LCBsaXN0ZW5lcik7XG4gIH07XG4gIGVsLmFkZEV2ZW50TGlzdGVuZXIoZXZlbnQsIGxpc3RlbmVyKTtcbn07XG5cbm1vZHVsZS5leHBvcnRzID0ge1xuICBkYXRhVVJJdG9CbG9iOiBmdW5jdGlvbiAoZGF0YVVSSSkge1xuICAgIHZhciBiaW5hcnkgPSBhdG9iKGRhdGFVUkkuc3BsaXQoJywnKVsxXSk7XG4gICAgdmFyIGFycmF5ID0gW107XG5cbiAgICBmb3IgKHZhciBpID0gMCwgaiA9IGJpbmFyeS5sZW5ndGg7IGkgPCBqOyBpKyspIHtcbiAgICAgIGFycmF5LnB1c2goYmluYXJ5LmNoYXJDb2RlQXQoaSkpO1xuICAgIH1cblxuICAgIHJldHVybiBuZXcgQmxvYihbbmV3IFVpbnQ4QXJyYXkoYXJyYXkpXSwge1xuICAgICAgdHlwZTogZGF0YVVSSS5zbGljZSg1LCBkYXRhVVJJLmluZGV4T2YoJzsnKSlcbiAgICB9KTtcbiAgfSxcbiAgZ2V0VG91Y2hEaXN0YW5jZTogZnVuY3Rpb24oZXZlbnQpIHtcbiAgICB2YXIgZmluZ2VyID0gZXZlbnQudG91Y2hlc1swXTtcbiAgICB2YXIgZmluZ2VyMiA9IGV2ZW50LnRvdWNoZXNbMV07XG5cbiAgICB2YXIgYzEgPSBNYXRoLmFicyhmaW5nZXIucGFnZVggLSBmaW5nZXIyLnBhZ2VYKTtcbiAgICB2YXIgYzIgPSBNYXRoLmFicyhmaW5nZXIucGFnZVkgLSBmaW5nZXIyLnBhZ2VZKTtcblxuICAgIHJldHVybiBNYXRoLnNxcnQoIGMxICogYzEgKyBjMiAqIGMyICk7XG4gIH0sXG4gIHRyYW5zbGF0ZTogZnVuY3Rpb24oZWxlbWVudCwgbGVmdCwgdG9wLCBzcGVlZCwgY2FsbGJhY2spIHtcbiAgICBlbGVtZW50LnN0eWxlLndlYmtpdFRyYW5zZm9ybSA9ICd0cmFuc2xhdGUzZCgnICsgKGxlZnQgfHwgMCkgKyAncHgsICcgKyAodG9wIHx8IDApICsgJ3B4LCAwKSc7XG4gICAgaWYgKHNwZWVkKSB7XG4gICAgICB2YXIgY2FsbGVkID0gZmFsc2U7XG5cbiAgICAgIHZhciByZWFsQ2FsbGJhY2sgPSBmdW5jdGlvbigpIHtcbiAgICAgICAgaWYgKGNhbGxlZCkgcmV0dXJuO1xuICAgICAgICBlbGVtZW50LnN0eWxlLndlYmtpdFRyYW5zaXRpb24gPSAnJztcbiAgICAgICAgY2FsbGVkID0gdHJ1ZTtcbiAgICAgICAgaWYgKGNhbGxiYWNrKSB7XG4gICAgICAgICAgY2FsbGJhY2suYXBwbHkodGhpcywgYXJndW1lbnRzKTtcbiAgICAgICAgfVxuICAgICAgfTtcbiAgICAgIGVsZW1lbnQuc3R5bGUud2Via2l0VHJhbnNpdGlvbiA9ICctd2Via2l0LXRyYW5zZm9ybSAnICsgc3BlZWQgKyAnbXMgY3ViaWMtYmV6aWVyKDAuMzI1LCAwLjc3MCwgMC4wMDAsIDEuMDAwKSc7XG4gICAgICBvbmNlKGVsZW1lbnQsICd3ZWJraXRUcmFuc2l0aW9uRW5kJywgcmVhbENhbGxiYWNrKTtcbiAgICAgIG9uY2UoZWxlbWVudCwgJ3RyYW5zaXRpb25lbmQnLCByZWFsQ2FsbGJhY2spO1xuICAgICAgLy8gZm9yIGFuZHJvaWQuLi5cbiAgICAgIHNldFRpbWVvdXQocmVhbENhbGxiYWNrLCBzcGVlZCArIDUwKTtcbiAgICB9IGVsc2Uge1xuICAgICAgZWxlbWVudC5zdHlsZS53ZWJraXRUcmFuc2l0aW9uID0gJyc7XG4gICAgfVxuICB9LFxuICB0cmFuc2xhdGVFbGVtZW50OiBmdW5jdGlvbihlbGVtZW50LCBsZWZ0LCB0b3ApIHtcbiAgICBlbGVtZW50LnN0eWxlLndlYmtpdFRyYW5zZm9ybSA9ICd0cmFuc2xhdGUzZCgnICsgKGxlZnQgfHwgMCkgKyAncHgsICcgKyAodG9wIHx8IDApICsgJ3B4LCAwKSc7XG4gIH0sXG4gIGdldEVsZW1lbnRUcmFuc2xhdGU6IGZ1bmN0aW9uKGVsZW1lbnQpIHtcbiAgICB2YXIgdHJhbnNmb3JtID0gZWxlbWVudC5zdHlsZS53ZWJraXRUcmFuc2Zvcm07XG4gICAgdmFyIG1hdGNoZXMgPSAvdHJhbnNsYXRlM2RcXCgoLio/KVxcKS9pZy5leGVjKHRyYW5zZm9ybSk7XG4gICAgaWYgKG1hdGNoZXMpIHtcbiAgICAgIHZhciB0cmFuc2xhdGVzID0gbWF0Y2hlc1sxXS5zcGxpdCgnLCcpO1xuICAgICAgcmV0dXJuIHtcbiAgICAgICAgbGVmdDogcGFyc2VJbnQodHJhbnNsYXRlc1swXSwgMTApLFxuICAgICAgICB0b3A6IHBhcnNlSW50KHRyYW5zbGF0ZXNbMV0sIDEwKVxuICAgICAgfVxuICAgIH1cbiAgICByZXR1cm4ge1xuICAgICAgbGVmdDogMCxcbiAgICAgIHRvcDogMFxuICAgIH1cbiAgfVxufTsiXX0=
