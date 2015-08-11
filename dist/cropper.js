(function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){
var util = require('./util');

var translateElement = util.translateElement;
var getElementTranslate = util.getElementTranslate;
var getDistance = util.getTouchDistance;
var translate = util.translate;
var dataURItoBlob = util.dataURItoBlob;
var URLApi = window.createObjectURL && window || window.URL && URL.revokeObjectURL && URL || window.webkitURL && webkitURL;

var Cropper = function() {
  if (!('ontouchstart' in window)) {
    throw new Error('this demo should run in mobile device');
  }

  this.imageState = {};
};

Cropper.prototype = {
  constructor: Cropper,

  setImage: function(src, file) {
    var self = this;
    self.imageLoading = true;
    self.image = src;

    self.resetSize();

    var url;
    if (file) {
      url = URLApi.createObjectURL(file);
    }

    var image = new Image();

    image.onload = function() {
      var selfImage = self.refs.image;

      loadImage.parseMetaData(file, function(data) {
        var orientation;
        if (data.exif) {
          orientation = data.exif[0x0112];
        }

        selfImage.src = src;
        self.orientation = orientation;

        var originalWidth, originalHeight;

        self.imageState.left = self.imageState.top = 0;

        if ("5678".indexOf(orientation) > -1) {
          originalWidth = image.height;
          originalHeight = image.width;
        } else {
          originalWidth = image.width;
          originalHeight = image.height;
        }

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
      });
    };
    image.src = url || src;
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

  createBase64: function (callback, width) {
    var imageState = this.imageState;
    var cropBoxRect = this.cropBoxRect;
    var scale = imageState.scale;

    var canvasSize = width;

    if (!canvasSize) {
      canvasSize = cropBoxRect.width * 2;
    }

    var imageLeft = Math.round((cropBoxRect.left - imageState.left) / scale);
    var imageTop = Math.round((cropBoxRect.top - imageState.top) / scale);
    var imageSize = Math.floor(cropBoxRect.width / scale);

    var orientation = this.orientation;
    var image = this.refs.image;

    var cropImage = new Image();
    cropImage.src = image.src;

    cropImage.onload = function() {
      var resultCanvas = loadImage.scale(cropImage, {
        canvas: true,
        left: imageLeft,
        top: imageTop,
        sourceWidth: imageSize,
        sourceHeight: imageSize,
        orientation: orientation,
        maxWidth: canvasSize,
        maxHeight: canvasSize
      });

      var dataURL = resultCanvas.toDataURL();
      if (typeof callback === 'function') {
        callback({
          canvasSize: canvasSize,
          canvas: resultCanvas,
          dataURL: dataURL
        });
      }
    };
  },

  getCroppedImage: function(callback, width) {
    if (!this.image) return null;

    this.createBase64(function(result) {
      var canvasSize = result.canvasSize;
      var canvas = result.canvas;
      var dataURL = result.dataURL;

      if (typeof callback === 'function') {
        callback({
          file: canvas.toBlob ? canvas.toBlob() : dataURItoBlob(dataURL),
          dataUrl: dataURL,
          oDataURL: result.oDataURL,
          size: canvasSize
        });
      }
    }, width);
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
},{}]},{},[2])
//# sourceMappingURL=data:application/json;charset:utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIm5vZGVfbW9kdWxlcy93YXRjaGlmeS9ub2RlX21vZHVsZXMvYnJvd3NlcmlmeS9ub2RlX21vZHVsZXMvYnJvd3Nlci1wYWNrL19wcmVsdWRlLmpzIiwic3JjL2Nyb3BwZXIuanMiLCJzcmMvaW5kZXguanMiLCJzcmMvdXRpbC5qcyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQTtBQ0FBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUM5aEJBOztBQ0FBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBIiwiZmlsZSI6ImdlbmVyYXRlZC5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzQ29udGVudCI6WyIoZnVuY3Rpb24gZSh0LG4scil7ZnVuY3Rpb24gcyhvLHUpe2lmKCFuW29dKXtpZighdFtvXSl7dmFyIGE9dHlwZW9mIHJlcXVpcmU9PVwiZnVuY3Rpb25cIiYmcmVxdWlyZTtpZighdSYmYSlyZXR1cm4gYShvLCEwKTtpZihpKXJldHVybiBpKG8sITApO3ZhciBmPW5ldyBFcnJvcihcIkNhbm5vdCBmaW5kIG1vZHVsZSAnXCIrbytcIidcIik7dGhyb3cgZi5jb2RlPVwiTU9EVUxFX05PVF9GT1VORFwiLGZ9dmFyIGw9bltvXT17ZXhwb3J0czp7fX07dFtvXVswXS5jYWxsKGwuZXhwb3J0cyxmdW5jdGlvbihlKXt2YXIgbj10W29dWzFdW2VdO3JldHVybiBzKG4/bjplKX0sbCxsLmV4cG9ydHMsZSx0LG4scil9cmV0dXJuIG5bb10uZXhwb3J0c312YXIgaT10eXBlb2YgcmVxdWlyZT09XCJmdW5jdGlvblwiJiZyZXF1aXJlO2Zvcih2YXIgbz0wO288ci5sZW5ndGg7bysrKXMocltvXSk7cmV0dXJuIHN9KSIsInZhciB1dGlsID0gcmVxdWlyZSgnLi91dGlsJyk7XG5cbnZhciB0cmFuc2xhdGVFbGVtZW50ID0gdXRpbC50cmFuc2xhdGVFbGVtZW50O1xudmFyIGdldEVsZW1lbnRUcmFuc2xhdGUgPSB1dGlsLmdldEVsZW1lbnRUcmFuc2xhdGU7XG52YXIgZ2V0RGlzdGFuY2UgPSB1dGlsLmdldFRvdWNoRGlzdGFuY2U7XG52YXIgdHJhbnNsYXRlID0gdXRpbC50cmFuc2xhdGU7XG52YXIgZGF0YVVSSXRvQmxvYiA9IHV0aWwuZGF0YVVSSXRvQmxvYjtcbnZhciBVUkxBcGkgPSB3aW5kb3cuY3JlYXRlT2JqZWN0VVJMICYmIHdpbmRvdyB8fCB3aW5kb3cuVVJMICYmIFVSTC5yZXZva2VPYmplY3RVUkwgJiYgVVJMIHx8IHdpbmRvdy53ZWJraXRVUkwgJiYgd2Via2l0VVJMO1xuXG52YXIgQ3JvcHBlciA9IGZ1bmN0aW9uKCkge1xuICBpZiAoISgnb250b3VjaHN0YXJ0JyBpbiB3aW5kb3cpKSB7XG4gICAgdGhyb3cgbmV3IEVycm9yKCd0aGlzIGRlbW8gc2hvdWxkIHJ1biBpbiBtb2JpbGUgZGV2aWNlJyk7XG4gIH1cblxuICB0aGlzLmltYWdlU3RhdGUgPSB7fTtcbn07XG5cbkNyb3BwZXIucHJvdG90eXBlID0ge1xuICBjb25zdHJ1Y3RvcjogQ3JvcHBlcixcblxuICBzZXRJbWFnZTogZnVuY3Rpb24oc3JjLCBmaWxlKSB7XG4gICAgdmFyIHNlbGYgPSB0aGlzO1xuICAgIHNlbGYuaW1hZ2VMb2FkaW5nID0gdHJ1ZTtcbiAgICBzZWxmLmltYWdlID0gc3JjO1xuXG4gICAgc2VsZi5yZXNldFNpemUoKTtcblxuICAgIHZhciB1cmw7XG4gICAgaWYgKGZpbGUpIHtcbiAgICAgIHVybCA9IFVSTEFwaS5jcmVhdGVPYmplY3RVUkwoZmlsZSk7XG4gICAgfVxuXG4gICAgdmFyIGltYWdlID0gbmV3IEltYWdlKCk7XG5cbiAgICBpbWFnZS5vbmxvYWQgPSBmdW5jdGlvbigpIHtcbiAgICAgIHZhciBzZWxmSW1hZ2UgPSBzZWxmLnJlZnMuaW1hZ2U7XG5cbiAgICAgIGxvYWRJbWFnZS5wYXJzZU1ldGFEYXRhKGZpbGUsIGZ1bmN0aW9uKGRhdGEpIHtcbiAgICAgICAgdmFyIG9yaWVudGF0aW9uO1xuICAgICAgICBpZiAoZGF0YS5leGlmKSB7XG4gICAgICAgICAgb3JpZW50YXRpb24gPSBkYXRhLmV4aWZbMHgwMTEyXTtcbiAgICAgICAgfVxuXG4gICAgICAgIHNlbGZJbWFnZS5zcmMgPSBzcmM7XG4gICAgICAgIHNlbGYub3JpZW50YXRpb24gPSBvcmllbnRhdGlvbjtcblxuICAgICAgICB2YXIgb3JpZ2luYWxXaWR0aCwgb3JpZ2luYWxIZWlnaHQ7XG5cbiAgICAgICAgc2VsZi5pbWFnZVN0YXRlLmxlZnQgPSBzZWxmLmltYWdlU3RhdGUudG9wID0gMDtcblxuICAgICAgICBpZiAoXCI1Njc4XCIuaW5kZXhPZihvcmllbnRhdGlvbikgPiAtMSkge1xuICAgICAgICAgIG9yaWdpbmFsV2lkdGggPSBpbWFnZS5oZWlnaHQ7XG4gICAgICAgICAgb3JpZ2luYWxIZWlnaHQgPSBpbWFnZS53aWR0aDtcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICBvcmlnaW5hbFdpZHRoID0gaW1hZ2Uud2lkdGg7XG4gICAgICAgICAgb3JpZ2luYWxIZWlnaHQgPSBpbWFnZS5oZWlnaHQ7XG4gICAgICAgIH1cblxuICAgICAgICBzZWxmLmltYWdlU3RhdGUud2lkdGggPSBvcmlnaW5hbFdpZHRoO1xuICAgICAgICBzZWxmLmltYWdlU3RhdGUuaGVpZ2h0ID0gb3JpZ2luYWxIZWlnaHQ7XG5cbiAgICAgICAgc2VsZi5pbml0U2NhbGUoKTtcblxuICAgICAgICB2YXIgbWluU2NhbGUgPSBzZWxmLnNjYWxlUmFuZ2VbMF07XG4gICAgICAgIHZhciBpbWFnZVdpZHRoID0gbWluU2NhbGUgKiBvcmlnaW5hbFdpZHRoO1xuICAgICAgICB2YXIgaW1hZ2VIZWlnaHQgPSBtaW5TY2FsZSAqIG9yaWdpbmFsSGVpZ2h0O1xuICAgICAgICBzZWxmSW1hZ2Uuc3R5bGUud2lkdGggPSBpbWFnZVdpZHRoICsgJ3B4JztcbiAgICAgICAgc2VsZkltYWdlLnN0eWxlLmhlaWdodCA9IGltYWdlSGVpZ2h0ICsgJ3B4JztcblxuICAgICAgICB2YXIgaW1hZ2VMZWZ0LCBpbWFnZVRvcDtcblxuICAgICAgICB2YXIgY3JvcEJveFJlY3QgPSBzZWxmLmNyb3BCb3hSZWN0O1xuXG4gICAgICAgIGlmIChvcmlnaW5hbFdpZHRoID4gb3JpZ2luYWxIZWlnaHQpIHtcbiAgICAgICAgICBpbWFnZUxlZnQgPSAoY3JvcEJveFJlY3Qud2lkdGggLSBpbWFnZVdpZHRoKSAvIDIgK2Nyb3BCb3hSZWN0LmxlZnQ7XG4gICAgICAgICAgaW1hZ2VUb3AgPSBjcm9wQm94UmVjdC50b3A7XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgaW1hZ2VMZWZ0ID0gY3JvcEJveFJlY3QubGVmdDtcbiAgICAgICAgICBpbWFnZVRvcCA9IChjcm9wQm94UmVjdC5oZWlnaHQgLSBpbWFnZUhlaWdodCkgLyAyICsgY3JvcEJveFJlY3QudG9wO1xuICAgICAgICB9XG5cbiAgICAgICAgc2VsZi5tb3ZlSW1hZ2UoaW1hZ2VMZWZ0LCBpbWFnZVRvcCk7XG5cbiAgICAgICAgc2VsZi5pbWFnZUxvYWRpbmcgPSBmYWxzZTtcbiAgICAgIH0pO1xuICAgIH07XG4gICAgaW1hZ2Uuc3JjID0gdXJsIHx8IHNyYztcbiAgfSxcblxuICBnZXRGb2NhbFBvaW50OiBmdW5jdGlvbihldmVudCkge1xuICAgIHZhciBmb2NhbFBvaW50ID0ge1xuICAgICAgbGVmdDogKGV2ZW50LnRvdWNoZXNbMF0ucGFnZVggKyBldmVudC50b3VjaGVzWzFdLnBhZ2VYKSAvIDIsXG4gICAgICB0b3A6IChldmVudC50b3VjaGVzWzBdLnBhZ2VZICsgZXZlbnQudG91Y2hlc1sxXS5wYWdlWSkgLyAyXG4gICAgfTtcblxuICAgIHZhciBpbWFnZVN0YXRlID0gdGhpcy5pbWFnZVN0YXRlO1xuICAgIHZhciBjcm9wQm94UmVjdCA9IHRoaXMuY3JvcEJveFJlY3Q7XG5cbiAgICBmb2NhbFBvaW50LmxlZnQgLT0gY3JvcEJveFJlY3QubGVmdCArIGltYWdlU3RhdGUubGVmdDtcbiAgICBmb2NhbFBvaW50LnRvcCAtPSBjcm9wQm94UmVjdC50b3AgKyBpbWFnZVN0YXRlLnRvcDtcblxuICAgIHJldHVybiBmb2NhbFBvaW50O1xuICB9LFxuXG4gIHJlbmRlcjogZnVuY3Rpb24ocGFyZW50Tm9kZSkge1xuICAgIHZhciBlbGVtZW50ID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudCgnZGl2Jyk7XG4gICAgZWxlbWVudC5jbGFzc05hbWUgPSAnY3JvcHBlcic7XG5cbiAgICB2YXIgY292ZXJTdGFydCA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoJ2RpdicpO1xuICAgIHZhciBjb3ZlckVuZCA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoJ2RpdicpO1xuICAgIHZhciBjcm9wQm94ID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudCgnZGl2Jyk7XG4gICAgdmFyIGltYWdlID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudCgnaW1nJyk7XG5cbiAgICBjb3ZlclN0YXJ0LmNsYXNzTmFtZSA9ICdjb3ZlciBjb3Zlci1zdGFydCc7XG4gICAgY292ZXJFbmQuY2xhc3NOYW1lID0gJ2NvdmVyIGNvdmVyLWVuZCc7XG4gICAgY3JvcEJveC5jbGFzc05hbWUgPSAnY3JvcC1ib3gnO1xuXG4gICAgZWxlbWVudC5hcHBlbmRDaGlsZChjb3ZlclN0YXJ0KTtcbiAgICBlbGVtZW50LmFwcGVuZENoaWxkKGNvdmVyRW5kKTtcbiAgICBlbGVtZW50LmFwcGVuZENoaWxkKGNyb3BCb3gpO1xuICAgIGVsZW1lbnQuYXBwZW5kQ2hpbGQoaW1hZ2UpO1xuXG4gICAgdGhpcy5yZWZzID0ge1xuICAgICAgZWxlbWVudDogZWxlbWVudCxcbiAgICAgIGNvdmVyU3RhcnQ6IGNvdmVyU3RhcnQsXG4gICAgICBjb3ZlckVuZDogY292ZXJFbmQsXG4gICAgICBjcm9wQm94OiBjcm9wQm94LFxuICAgICAgaW1hZ2U6IGltYWdlXG4gICAgfTtcblxuICAgIGlmIChwYXJlbnROb2RlKSB7XG4gICAgICBwYXJlbnROb2RlLmFwcGVuZENoaWxkKGVsZW1lbnQpO1xuICAgIH1cblxuICAgIGlmIChlbGVtZW50Lm9mZnNldEhlaWdodCA+IDApIHtcbiAgICAgIHRoaXMucmVzZXRTaXplKCk7XG4gICAgfVxuXG4gICAgdGhpcy5iaW5kRXZlbnRzKCk7XG4gIH0sXG5cbiAgaW5pdFNjYWxlOiBmdW5jdGlvbiAoKSB7XG4gICAgdmFyIGNyb3BCb3hSZWN0ID0gdGhpcy5jcm9wQm94UmVjdDtcbiAgICB2YXIgd2lkdGggPSB0aGlzLmltYWdlU3RhdGUud2lkdGg7XG4gICAgdmFyIGhlaWdodCA9IHRoaXMuaW1hZ2VTdGF0ZS5oZWlnaHQ7XG4gICAgdmFyIHNjYWxlLCBtaW5TY2FsZTtcblxuICAgIGlmICh3aWR0aCA+IGhlaWdodCkge1xuICAgICAgc2NhbGUgPSB0aGlzLmltYWdlU3RhdGUuc2NhbGUgPSBjcm9wQm94UmVjdC5oZWlnaHQgLyBoZWlnaHQ7XG4gICAgICBtaW5TY2FsZSA9IGNyb3BCb3hSZWN0LmhlaWdodCAqIDAuOCAvIGhlaWdodDtcbiAgICB9IGVsc2Uge1xuICAgICAgc2NhbGUgPSB0aGlzLmltYWdlU3RhdGUuc2NhbGUgPSBjcm9wQm94UmVjdC53aWR0aCAvIHdpZHRoO1xuICAgICAgbWluU2NhbGUgPSBjcm9wQm94UmVjdC53aWR0aCAqIDAuOCAvIHdpZHRoO1xuICAgIH1cblxuICAgIHRoaXMuc2NhbGVSYW5nZSA9IFtzY2FsZSwgMl07XG4gICAgdGhpcy5ib3VuY2VTY2FsZVJhbmdlID0gW21pblNjYWxlLCAzXTtcbiAgfSxcblxuICByZXNldFNpemU6IGZ1bmN0aW9uKCkge1xuICAgIHZhciByZWZzID0gdGhpcy5yZWZzO1xuICAgIGlmICghcmVmcykgcmV0dXJuO1xuXG4gICAgdmFyIGVsZW1lbnQgPSByZWZzLmVsZW1lbnQ7XG4gICAgdmFyIGNyb3BCb3ggPSByZWZzLmNyb3BCb3g7XG4gICAgdmFyIGNvdmVyU3RhcnQgPSByZWZzLmNvdmVyU3RhcnQ7XG4gICAgdmFyIGNvdmVyRW5kID0gcmVmcy5jb3ZlckVuZDtcblxuICAgIHZhciB3aWR0aCA9IGVsZW1lbnQub2Zmc2V0V2lkdGg7XG4gICAgdmFyIGhlaWdodCA9IGVsZW1lbnQub2Zmc2V0SGVpZ2h0O1xuXG4gICAgaWYgKHdpZHRoID4gaGVpZ2h0KSB7XG4gICAgICBlbGVtZW50LmNsYXNzTmFtZSA9ICdjcm9wcGVyIGNyb3BwZXItaG9yaXpvbnRhbCc7XG5cbiAgICAgIGNvdmVyU3RhcnQuc3R5bGUud2lkdGggPSBjb3ZlckVuZC5zdHlsZS53aWR0aCA9ICh3aWR0aCAtIGhlaWdodCkgLyAyICsgJ3B4JztcbiAgICAgIGNvdmVyU3RhcnQuc3R5bGUuaGVpZ2h0ID0gY292ZXJFbmQuc3R5bGUuaGVpZ2h0ID0gJyc7XG4gICAgICBjcm9wQm94LnN0eWxlLndpZHRoID0gY3JvcEJveC5zdHlsZS5oZWlnaHQgPSBoZWlnaHQgKyAncHgnO1xuICAgIH0gZWxzZSB7XG4gICAgICBlbGVtZW50LmNsYXNzTmFtZSA9ICdjcm9wcGVyJztcblxuICAgICAgY292ZXJTdGFydC5zdHlsZS5oZWlnaHQgPSBjb3ZlckVuZC5zdHlsZS5oZWlnaHQgPSAoaGVpZ2h0IC0gd2lkdGgpIC8gMiArICdweCc7XG4gICAgICBjb3ZlclN0YXJ0LnN0eWxlLndpZHRoID0gY292ZXJFbmQuc3R5bGUud2lkdGggPSAnJztcbiAgICAgIGNyb3BCb3guc3R5bGUud2lkdGggPSBjcm9wQm94LnN0eWxlLmhlaWdodCA9IHdpZHRoICsgJ3B4JztcbiAgICB9XG5cbiAgICB2YXIgZWxlbWVudFJlY3QgPSBlbGVtZW50LmdldEJvdW5kaW5nQ2xpZW50UmVjdCgpO1xuICAgIHZhciBjcm9wQm94UmVjdCA9IGNyb3BCb3guZ2V0Qm91bmRpbmdDbGllbnRSZWN0KCk7XG5cbiAgICB0aGlzLmNyb3BCb3hSZWN0ID0ge1xuICAgICAgbGVmdDogY3JvcEJveFJlY3QubGVmdCAtIGVsZW1lbnRSZWN0LmxlZnQsXG4gICAgICB0b3A6IGNyb3BCb3hSZWN0LnRvcCAtIGVsZW1lbnRSZWN0LnRvcCxcbiAgICAgIHdpZHRoOiBjcm9wQm94UmVjdC53aWR0aCxcbiAgICAgIGhlaWdodDogY3JvcEJveFJlY3QuaGVpZ2h0XG4gICAgfTtcblxuICAgIHRoaXMuaW5pdFNjYWxlKCk7XG5cbiAgICB0aGlzLmNoZWNrQm91bmNlKDApO1xuICB9LFxuXG4gIGNoZWNrQm91bmNlOiBmdW5jdGlvbiAoc3BlZWQpIHtcbiAgICB2YXIgaW1hZ2VTdGF0ZSA9IHRoaXMuaW1hZ2VTdGF0ZTtcbiAgICB2YXIgY3JvcEJveFJlY3QgPSB0aGlzLmNyb3BCb3hSZWN0O1xuXG4gICAgdmFyIGltYWdlV2lkdGggPSBpbWFnZVN0YXRlLndpZHRoO1xuICAgIHZhciBpbWFnZUhlaWdodCA9IGltYWdlU3RhdGUuaGVpZ2h0O1xuICAgIHZhciBpbWFnZVNjYWxlID0gaW1hZ2VTdGF0ZS5zY2FsZTtcblxuICAgIHZhciBpbWFnZU9mZnNldCA9IGdldEVsZW1lbnRUcmFuc2xhdGUodGhpcy5yZWZzLmltYWdlKTtcbiAgICB2YXIgbGVmdCA9IGltYWdlT2Zmc2V0LmxlZnQ7XG4gICAgdmFyIHRvcCA9IGltYWdlT2Zmc2V0LnRvcDtcblxuICAgIHZhciBsZWZ0UmFuZ2UgPSBbLWltYWdlV2lkdGggKiBpbWFnZVNjYWxlICsgY3JvcEJveFJlY3Qud2lkdGggKyBjcm9wQm94UmVjdC5sZWZ0LCBjcm9wQm94UmVjdC5sZWZ0XTtcbiAgICB2YXIgdG9wUmFuZ2UgPSBbLWltYWdlSGVpZ2h0ICogaW1hZ2VTY2FsZSArIGNyb3BCb3hSZWN0LmhlaWdodCArIGNyb3BCb3hSZWN0LnRvcCwgY3JvcEJveFJlY3QudG9wXTtcblxuICAgIHZhciBvdmVyZmxvdyA9IGZhbHNlO1xuXG4gICAgaWYgKGxlZnQgPCBsZWZ0UmFuZ2VbMF0pIHtcbiAgICAgIGxlZnQgPSBsZWZ0UmFuZ2VbMF07XG4gICAgICBvdmVyZmxvdyA9IHRydWU7XG4gICAgfSBlbHNlIGlmIChsZWZ0ID4gbGVmdFJhbmdlWzFdKSB7XG4gICAgICBsZWZ0ID0gbGVmdFJhbmdlWzFdO1xuICAgICAgb3ZlcmZsb3cgPSB0cnVlO1xuICAgIH1cblxuICAgIGlmICh0b3AgPCB0b3BSYW5nZVswXSkge1xuICAgICAgdG9wID0gdG9wUmFuZ2VbMF07XG4gICAgICBvdmVyZmxvdyA9IHRydWU7XG4gICAgfSBlbHNlIGlmICh0b3AgPiB0b3BSYW5nZVsxXSkge1xuICAgICAgdG9wID0gdG9wUmFuZ2VbMV07XG4gICAgICBvdmVyZmxvdyA9IHRydWU7XG4gICAgfVxuXG4gICAgaWYgKG92ZXJmbG93KSB7XG4gICAgICB2YXIgc2VsZiA9IHRoaXM7XG4gICAgICB0cmFuc2xhdGUodGhpcy5yZWZzLmltYWdlLCBsZWZ0LCB0b3AsIHNwZWVkID09PSB1bmRlZmluZWQgPyAyMDAgOiAwLCBmdW5jdGlvbigpIHtcbiAgICAgICAgc2VsZi5tb3ZlSW1hZ2UobGVmdCwgdG9wKTtcbiAgICAgIH0pO1xuICAgIH1cbiAgfSxcblxuICBtb3ZlSW1hZ2U6IGZ1bmN0aW9uKGxlZnQsIHRvcCkge1xuICAgIHZhciBpbWFnZSA9IHRoaXMucmVmcy5pbWFnZTtcbiAgICB0cmFuc2xhdGVFbGVtZW50KGltYWdlLCBsZWZ0LCB0b3ApO1xuXG4gICAgdGhpcy5pbWFnZVN0YXRlLmxlZnQgPSBsZWZ0O1xuICAgIHRoaXMuaW1hZ2VTdGF0ZS50b3AgPSB0b3A7XG4gIH0sXG5cbiAgb25Ub3VjaFN0YXJ0OiBmdW5jdGlvbihldmVudCkge1xuICAgIHRoaXMuYW1wbGl0dWRlID0gMDtcbiAgICB2YXIgaW1hZ2UgPSB0aGlzLnJlZnMuaW1hZ2U7XG5cbiAgICB2YXIgZmluZ2VyQ291bnQgPSBldmVudC50b3VjaGVzLmxlbmd0aDtcbiAgICBpZiAoZmluZ2VyQ291bnQpIHtcbiAgICAgIHZhciB0b3VjaEV2ZW50ID0gZXZlbnQudG91Y2hlc1swXTtcblxuICAgICAgdmFyIGltYWdlT2Zmc2V0ID0gZ2V0RWxlbWVudFRyYW5zbGF0ZShpbWFnZSk7XG5cbiAgICAgIHRoaXMuZHJhZ1N0YXRlID0ge1xuICAgICAgICB0aW1lc3RhbXA6IERhdGUubm93KCksXG4gICAgICAgIHN0YXJ0VG91Y2hMZWZ0OiB0b3VjaEV2ZW50LnBhZ2VYLFxuICAgICAgICBzdGFydFRvdWNoVG9wOiB0b3VjaEV2ZW50LnBhZ2VZLFxuICAgICAgICBzdGFydExlZnQ6IGltYWdlT2Zmc2V0LmxlZnQgfHwgMCxcbiAgICAgICAgc3RhcnRUb3A6IGltYWdlT2Zmc2V0LnRvcCB8fCAwXG4gICAgICB9O1xuICAgIH1cblxuICAgIGlmIChmaW5nZXJDb3VudCA+PSAyKSB7XG4gICAgICB2YXIgem9vbVN0YXRlID0gdGhpcy56b29tU3RhdGUgPSB7XG4gICAgICAgIHRpbWVzdGFtcDogRGF0ZS5ub3coKVxuICAgICAgfTtcblxuICAgICAgem9vbVN0YXRlLnN0YXJ0RGlzdGFuY2UgPSBnZXREaXN0YW5jZShldmVudCk7XG4gICAgICB6b29tU3RhdGUuZm9jYWxQb2ludCA9IHRoaXMuZ2V0Rm9jYWxQb2ludChldmVudCk7XG4gICAgfVxuICB9LFxuXG4gIG9uVG91Y2hNb3ZlOiBmdW5jdGlvbihldmVudCkge1xuICAgIHZhciBmaW5nZXJDb3VudCA9IGV2ZW50LnRvdWNoZXMubGVuZ3RoO1xuXG4gICAgdmFyIHRvdWNoRXZlbnQgPSBldmVudC50b3VjaGVzWzBdO1xuXG4gICAgdmFyIGNyb3BCb3hSZWN0ID0gdGhpcy5jcm9wQm94UmVjdDtcbiAgICB2YXIgaW1hZ2UgPSB0aGlzLnJlZnMuaW1hZ2U7XG5cbiAgICB2YXIgaW1hZ2VTdGF0ZSA9IHRoaXMuaW1hZ2VTdGF0ZTtcbiAgICB2YXIgaW1hZ2VXaWR0aCA9IGltYWdlU3RhdGUud2lkdGg7XG4gICAgdmFyIGltYWdlSGVpZ2h0ID0gaW1hZ2VTdGF0ZS5oZWlnaHQ7XG5cbiAgICB2YXIgZHJhZ1N0YXRlID0gdGhpcy5kcmFnU3RhdGU7XG4gICAgdmFyIHpvb21TdGF0ZSA9IHRoaXMuem9vbVN0YXRlO1xuXG4gICAgaWYgKGZpbmdlckNvdW50ID09PSAxKSB7XG4gICAgICB2YXIgbGVmdFJhbmdlID0gWyAtaW1hZ2VXaWR0aCAqIGltYWdlU3RhdGUuc2NhbGUgKyBjcm9wQm94UmVjdC53aWR0aCwgY3JvcEJveFJlY3QubGVmdCBdO1xuICAgICAgdmFyIHRvcFJhbmdlID0gWyAtaW1hZ2VIZWlnaHQgKiBpbWFnZVN0YXRlLnNjYWxlICsgY3JvcEJveFJlY3QuaGVpZ2h0ICsgY3JvcEJveFJlY3QudG9wLCBjcm9wQm94UmVjdC50b3AgXTtcblxuICAgICAgdmFyIGRlbHRhWCA9IHRvdWNoRXZlbnQucGFnZVggLSAoZHJhZ1N0YXRlLmxhc3RMZWZ0IHx8IGRyYWdTdGF0ZS5zdGFydFRvdWNoTGVmdCk7XG4gICAgICB2YXIgZGVsdGFZID0gdG91Y2hFdmVudC5wYWdlWSAtIChkcmFnU3RhdGUubGFzdFRvcCB8fCBkcmFnU3RhdGUuc3RhcnRUb3VjaFRvcCk7XG5cbiAgICAgIHZhciBpbWFnZU9mZnNldCA9IGdldEVsZW1lbnRUcmFuc2xhdGUoaW1hZ2UpO1xuXG4gICAgICB2YXIgbGVmdCA9IGltYWdlT2Zmc2V0LmxlZnQgKyBkZWx0YVg7XG4gICAgICB2YXIgdG9wID0gaW1hZ2VPZmZzZXQudG9wICsgZGVsdGFZO1xuXG4gICAgICBpZiAobGVmdCA8IGxlZnRSYW5nZVswXSB8fCBsZWZ0ID4gbGVmdFJhbmdlWzFdKSB7XG4gICAgICAgIGxlZnQgLT0gZGVsdGFYIC8gMjtcbiAgICAgIH1cblxuICAgICAgaWYgKHRvcCA8IHRvcFJhbmdlIFswXSB8fCB0b3AgPiB0b3BSYW5nZVsxXSkge1xuICAgICAgICB0b3AgLT0gZGVsdGFZIC8gMjtcbiAgICAgIH1cblxuICAgICAgdGhpcy5tb3ZlSW1hZ2UobGVmdCwgdG9wKTtcbiAgICB9IGVsc2UgaWYgKGZpbmdlckNvdW50ID49IDIpIHtcbiAgICAgIGlmICghem9vbVN0YXRlLnRpbWVzdGFtcCkge1xuICAgICAgICB6b29tU3RhdGUgPSB7XG4gICAgICAgICAgdGltZXN0YW1wOiBEYXRlLm5vdygpXG4gICAgICAgIH07XG5cbiAgICAgICAgem9vbVN0YXRlLnN0YXJ0RGlzdGFuY2UgPSBnZXREaXN0YW5jZShldmVudCk7XG4gICAgICAgIHpvb21TdGF0ZS5mb2NhbFBvaW50ID0gdGhpcy5nZXRGb2NhbFBvaW50KGV2ZW50KTtcblxuICAgICAgICByZXR1cm47XG4gICAgICB9XG5cbiAgICAgIHZhciBuZXdEaXN0YW5jZSA9IGdldERpc3RhbmNlKGV2ZW50KTtcbiAgICAgIHZhciBvbGRTY2FsZSA9IGltYWdlU3RhdGUuc2NhbGU7XG5cbiAgICAgIGltYWdlU3RhdGUuc2NhbGUgPSBvbGRTY2FsZSAqIG5ld0Rpc3RhbmNlIC8gKHpvb21TdGF0ZS5sYXN0RGlzdGFuY2UgfHwgem9vbVN0YXRlLnN0YXJ0RGlzdGFuY2UpO1xuXG4gICAgICB2YXIgc2NhbGVSYW5nZSA9IHRoaXMuc2NhbGVSYW5nZTtcbiAgICAgIGlmIChpbWFnZVN0YXRlLnNjYWxlIDwgc2NhbGVSYW5nZVswXSkge1xuICAgICAgICBpbWFnZVN0YXRlLnNjYWxlID0gc2NhbGVSYW5nZVswXTtcbiAgICAgIH0gZWxzZSBpZiAoaW1hZ2VTdGF0ZS5zY2FsZSA+IHNjYWxlUmFuZ2VbMV0pIHtcbiAgICAgICAgaW1hZ2VTdGF0ZS5zY2FsZSA9IHNjYWxlUmFuZ2VbMV07XG4gICAgICB9XG5cbiAgICAgIHRoaXMuem9vbVdpdGhGb2NhbChvbGRTY2FsZSk7XG5cbiAgICAgIHpvb21TdGF0ZS5mb2NhbFBvaW50ID0gdGhpcy5nZXRGb2NhbFBvaW50KGV2ZW50KTtcbiAgICAgIHpvb21TdGF0ZS5sYXN0RGlzdGFuY2UgPSBuZXdEaXN0YW5jZTtcbiAgICB9XG5cbiAgICBkcmFnU3RhdGUubGFzdExlZnQgPSB0b3VjaEV2ZW50LnBhZ2VYO1xuICAgIGRyYWdTdGF0ZS5sYXN0VG9wID0gdG91Y2hFdmVudC5wYWdlWTtcbiAgfSxcblxuICBvblRvdWNoRW5kOiBmdW5jdGlvbihldmVudCkge1xuICAgIHZhciBpbWFnZVN0YXRlID0gdGhpcy5pbWFnZVN0YXRlO1xuICAgIHZhciB6b29tU3RhdGUgPSB0aGlzLnpvb21TdGF0ZTtcbiAgICB2YXIgZHJhZ1N0YXRlID0gdGhpcy5kcmFnU3RhdGU7XG4gICAgdmFyIGFtcGxpdHVkZSA9IHRoaXMuYW1wbGl0dWRlO1xuICAgIHZhciBpbWFnZVdpZHRoID0gaW1hZ2VTdGF0ZS53aWR0aDtcbiAgICB2YXIgaW1hZ2VIZWlnaHQgPSBpbWFnZVN0YXRlLmhlaWdodDtcbiAgICB2YXIgY3JvcEJveFJlY3QgPSB0aGlzLmNyb3BCb3hSZWN0O1xuXG4gICAgaWYgKGV2ZW50LnRvdWNoZXMubGVuZ3RoID09PSAwICYmIGRyYWdTdGF0ZS50aW1lc3RhbXApIHtcbiAgICAgIHZhciBzZWxmID0gdGhpcztcbiAgICAgIHZhciBkdXJhdGlvbiA9IERhdGUubm93KCkgLSBkcmFnU3RhdGUudGltZXN0YW1wO1xuXG4gICAgICBpZiAoZHVyYXRpb24gPiAzMDApIHtcbiAgICAgICAgc2VsZi5jaGVja0JvdW5jZSgpO1xuICAgICAgfSBlbHNlIHtcbiAgICAgICAgdmFyIHRhcmdldDtcblxuICAgICAgICB2YXIgdG9wID0gaW1hZ2VTdGF0ZS50b3A7XG4gICAgICAgIHZhciBsZWZ0ID0gaW1hZ2VTdGF0ZS5sZWZ0O1xuXG4gICAgICAgIHZhciBtb21lbnR1bVZlcnRpY2FsID0gZmFsc2U7XG5cbiAgICAgICAgdmFyIHRpbWVDb25zdGFudCA9IDE2MDtcblxuICAgICAgICB2YXIgYXV0b1Njcm9sbCA9IGZ1bmN0aW9uICgpIHtcbiAgICAgICAgICB2YXIgZWxhcHNlZCwgZGVsdGE7XG5cbiAgICAgICAgICBpZiAoYW1wbGl0dWRlKSB7XG4gICAgICAgICAgICBlbGFwc2VkID0gRGF0ZS5ub3coKSAtIHRpbWVzdGFtcDtcbiAgICAgICAgICAgIGRlbHRhID0gLWFtcGxpdHVkZSAqIE1hdGguZXhwKC1lbGFwc2VkIC8gdGltZUNvbnN0YW50KTtcbiAgICAgICAgICAgIGlmIChkZWx0YSA+IDAuNSB8fCBkZWx0YSA8IC0wLjUpIHtcbiAgICAgICAgICAgICAgaWYgKG1vbWVudHVtVmVydGljYWwpIHtcbiAgICAgICAgICAgICAgICBzZWxmLm1vdmVJbWFnZShsZWZ0LCB0YXJnZXQgKyBkZWx0YSk7XG4gICAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgc2VsZi5tb3ZlSW1hZ2UodGFyZ2V0ICsgZGVsdGEsIHRvcCk7XG4gICAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgICByZXF1ZXN0QW5pbWF0aW9uRnJhbWUoYXV0b1Njcm9sbCk7XG4gICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICB2YXIgY3VycmVudExlZnQ7XG4gICAgICAgICAgICAgIHZhciBjdXJyZW50VG9wO1xuXG4gICAgICAgICAgICAgIGlmIChtb21lbnR1bVZlcnRpY2FsKSB7XG4gICAgICAgICAgICAgICAgY3VycmVudExlZnQgPSBsZWZ0O1xuICAgICAgICAgICAgICAgIGN1cnJlbnRUb3AgPSB0YXJnZXQ7XG4gICAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgY3VycmVudExlZnQgPSB0YXJnZXQ7XG4gICAgICAgICAgICAgICAgY3VycmVudFRvcCA9IHRvcDtcbiAgICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICAgIHNlbGYubW92ZUltYWdlKGN1cnJlbnRMZWZ0LCBjdXJyZW50VG9wKTtcbiAgICAgICAgICAgICAgc2VsZi5jaGVja0JvdW5jZSgpO1xuICAgICAgICAgICAgfVxuICAgICAgICAgIH1cbiAgICAgICAgfTtcblxuICAgICAgICB2YXIgdmVsb2NpdHk7XG5cbiAgICAgICAgdmFyIGRlbHRhWCA9IGV2ZW50LmNoYW5nZWRUb3VjaGVzWzBdLnBhZ2VYIC0gZHJhZ1N0YXRlLnN0YXJ0VG91Y2hMZWZ0O1xuICAgICAgICB2YXIgZGVsdGFZID0gZXZlbnQuY2hhbmdlZFRvdWNoZXNbMF0ucGFnZVkgLSBkcmFnU3RhdGUuc3RhcnRUb3VjaFRvcDtcblxuICAgICAgICBpZiAoTWF0aC5hYnMoZGVsdGFYKSA+IE1hdGguYWJzKGRlbHRhWSkpIHtcbiAgICAgICAgICB2ZWxvY2l0eSA9IGRlbHRhWCAvIGR1cmF0aW9uO1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgIG1vbWVudHVtVmVydGljYWwgPSB0cnVlO1xuICAgICAgICAgIHZlbG9jaXR5ID0gZGVsdGFZIC8gZHVyYXRpb247XG4gICAgICAgIH1cblxuICAgICAgICBhbXBsaXR1ZGUgPSA4MCAqIHZlbG9jaXR5O1xuXG4gICAgICAgIHZhciByYW5nZTtcblxuICAgICAgICBpZiAobW9tZW50dW1WZXJ0aWNhbCkge1xuICAgICAgICAgIHRhcmdldCA9IE1hdGgucm91bmQoaW1hZ2VTdGF0ZS50b3AgKyBhbXBsaXR1ZGUpO1xuICAgICAgICAgIHJhbmdlID0gWy1pbWFnZUhlaWdodCAqIGltYWdlU3RhdGUuc2NhbGUgKyBjcm9wQm94UmVjdC5oZWlnaHQgLyAyICsgY3JvcEJveFJlY3QudG9wLCBjcm9wQm94UmVjdC50b3AgKyBjcm9wQm94UmVjdC5oZWlnaHQgLyAyXTtcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICB0YXJnZXQgPSBNYXRoLnJvdW5kKGltYWdlU3RhdGUubGVmdCArIGFtcGxpdHVkZSk7XG4gICAgICAgICAgcmFuZ2UgPSBbLWltYWdlV2lkdGggKiBpbWFnZVN0YXRlLnNjYWxlICsgY3JvcEJveFJlY3Qud2lkdGggLyAyLCBjcm9wQm94UmVjdC5sZWZ0ICsgY3JvcEJveFJlY3Qud2lkdGggLyAyXTtcbiAgICAgICAgfVxuXG4gICAgICAgIGlmICh0YXJnZXQgPCByYW5nZVswXSkge1xuICAgICAgICAgIHRhcmdldCA9IHJhbmdlWzBdO1xuICAgICAgICAgIGFtcGxpdHVkZSAvPSAyO1xuICAgICAgICB9IGVsc2UgaWYgKHRhcmdldCA+IHJhbmdlWzFdKSB7XG4gICAgICAgICAgdGFyZ2V0ID0gcmFuZ2VbMV07XG4gICAgICAgICAgYW1wbGl0dWRlIC89IDI7XG4gICAgICAgIH1cblxuICAgICAgICB2YXIgdGltZXN0YW1wID0gRGF0ZS5ub3coKTtcbiAgICAgICAgcmVxdWVzdEFuaW1hdGlvbkZyYW1lKGF1dG9TY3JvbGwpO1xuICAgICAgfVxuXG4gICAgICB0aGlzLmRyYWdTdGF0ZSA9IHt9O1xuICAgIH0gZWxzZSBpZiAoem9vbVN0YXRlLnRpbWVzdGFtcCkge1xuICAgICAgdGhpcy5jaGVja0JvdW5jZSgpO1xuXG4gICAgICB0aGlzLnpvb21TdGF0ZSA9IHt9O1xuICAgIH1cbiAgfSxcblxuICB6b29tV2l0aEZvY2FsOiBmdW5jdGlvbihvbGRTY2FsZSkge1xuICAgIHZhciBpbWFnZSA9IHRoaXMucmVmcy5pbWFnZTtcbiAgICB2YXIgaW1hZ2VTdGF0ZSA9IHRoaXMuaW1hZ2VTdGF0ZTtcbiAgICB2YXIgaW1hZ2VTY2FsZSA9IGltYWdlU3RhdGUuc2NhbGU7XG5cbiAgICBpbWFnZS5zdHlsZS53aWR0aCA9IGltYWdlU3RhdGUud2lkdGggKiBpbWFnZVNjYWxlICsgJ3B4JztcbiAgICBpbWFnZS5zdHlsZS5oZWlnaHQgPSBpbWFnZVN0YXRlLmhlaWdodCAqIGltYWdlU2NhbGUgKyAncHgnO1xuXG4gICAgdmFyIGZvY2FsUG9pbnQgPSB0aGlzLnpvb21TdGF0ZS5mb2NhbFBvaW50O1xuXG4gICAgdmFyIG9mZnNldExlZnQgPSAoZm9jYWxQb2ludC5sZWZ0IC8gaW1hZ2VTY2FsZSAtIGZvY2FsUG9pbnQubGVmdCAvIG9sZFNjYWxlKSAqIGltYWdlU2NhbGU7XG4gICAgdmFyIG9mZnNldFRvcCA9IChmb2NhbFBvaW50LnRvcCAvIGltYWdlU2NhbGUgLSBmb2NhbFBvaW50LnRvcCAvIG9sZFNjYWxlKSAqIGltYWdlU2NhbGU7XG5cbiAgICB2YXIgaW1hZ2VMZWZ0ID0gaW1hZ2VTdGF0ZS5sZWZ0IHx8IDA7XG4gICAgdmFyIGltYWdlVG9wID0gaW1hZ2VTdGF0ZS50b3AgfHwgMDtcblxuICAgIHRoaXMubW92ZUltYWdlKGltYWdlTGVmdCArIG9mZnNldExlZnQsIGltYWdlVG9wICsgb2Zmc2V0VG9wKTtcbiAgfSxcblxuICBiaW5kRXZlbnRzOiBmdW5jdGlvbigpIHtcbiAgICB2YXIgY3JvcEJveCA9IHRoaXMucmVmcy5jcm9wQm94O1xuXG4gICAgY3JvcEJveC5hZGRFdmVudExpc3RlbmVyKCd0b3VjaHN0YXJ0JywgdGhpcy5vblRvdWNoU3RhcnQuYmluZCh0aGlzKSk7XG5cbiAgICBjcm9wQm94LmFkZEV2ZW50TGlzdGVuZXIoJ3RvdWNobW92ZScsIHRoaXMub25Ub3VjaE1vdmUuYmluZCh0aGlzKSk7XG5cbiAgICBjcm9wQm94LmFkZEV2ZW50TGlzdGVuZXIoJ3RvdWNoZW5kJywgdGhpcy5vblRvdWNoRW5kLmJpbmQodGhpcykpO1xuICB9LFxuXG4gIGNyZWF0ZUJhc2U2NDogZnVuY3Rpb24gKGNhbGxiYWNrLCB3aWR0aCkge1xuICAgIHZhciBpbWFnZVN0YXRlID0gdGhpcy5pbWFnZVN0YXRlO1xuICAgIHZhciBjcm9wQm94UmVjdCA9IHRoaXMuY3JvcEJveFJlY3Q7XG4gICAgdmFyIHNjYWxlID0gaW1hZ2VTdGF0ZS5zY2FsZTtcblxuICAgIHZhciBjYW52YXNTaXplID0gd2lkdGg7XG5cbiAgICBpZiAoIWNhbnZhc1NpemUpIHtcbiAgICAgIGNhbnZhc1NpemUgPSBjcm9wQm94UmVjdC53aWR0aCAqIDI7XG4gICAgfVxuXG4gICAgdmFyIGltYWdlTGVmdCA9IE1hdGgucm91bmQoKGNyb3BCb3hSZWN0LmxlZnQgLSBpbWFnZVN0YXRlLmxlZnQpIC8gc2NhbGUpO1xuICAgIHZhciBpbWFnZVRvcCA9IE1hdGgucm91bmQoKGNyb3BCb3hSZWN0LnRvcCAtIGltYWdlU3RhdGUudG9wKSAvIHNjYWxlKTtcbiAgICB2YXIgaW1hZ2VTaXplID0gTWF0aC5mbG9vcihjcm9wQm94UmVjdC53aWR0aCAvIHNjYWxlKTtcblxuICAgIHZhciBvcmllbnRhdGlvbiA9IHRoaXMub3JpZW50YXRpb247XG4gICAgdmFyIGltYWdlID0gdGhpcy5yZWZzLmltYWdlO1xuXG4gICAgdmFyIGNyb3BJbWFnZSA9IG5ldyBJbWFnZSgpO1xuICAgIGNyb3BJbWFnZS5zcmMgPSBpbWFnZS5zcmM7XG5cbiAgICBjcm9wSW1hZ2Uub25sb2FkID0gZnVuY3Rpb24oKSB7XG4gICAgICB2YXIgcmVzdWx0Q2FudmFzID0gbG9hZEltYWdlLnNjYWxlKGNyb3BJbWFnZSwge1xuICAgICAgICBjYW52YXM6IHRydWUsXG4gICAgICAgIGxlZnQ6IGltYWdlTGVmdCxcbiAgICAgICAgdG9wOiBpbWFnZVRvcCxcbiAgICAgICAgc291cmNlV2lkdGg6IGltYWdlU2l6ZSxcbiAgICAgICAgc291cmNlSGVpZ2h0OiBpbWFnZVNpemUsXG4gICAgICAgIG9yaWVudGF0aW9uOiBvcmllbnRhdGlvbixcbiAgICAgICAgbWF4V2lkdGg6IGNhbnZhc1NpemUsXG4gICAgICAgIG1heEhlaWdodDogY2FudmFzU2l6ZVxuICAgICAgfSk7XG5cbiAgICAgIHZhciBkYXRhVVJMID0gcmVzdWx0Q2FudmFzLnRvRGF0YVVSTCgpO1xuICAgICAgaWYgKHR5cGVvZiBjYWxsYmFjayA9PT0gJ2Z1bmN0aW9uJykge1xuICAgICAgICBjYWxsYmFjayh7XG4gICAgICAgICAgY2FudmFzU2l6ZTogY2FudmFzU2l6ZSxcbiAgICAgICAgICBjYW52YXM6IHJlc3VsdENhbnZhcyxcbiAgICAgICAgICBkYXRhVVJMOiBkYXRhVVJMXG4gICAgICAgIH0pO1xuICAgICAgfVxuICAgIH07XG4gIH0sXG5cbiAgZ2V0Q3JvcHBlZEltYWdlOiBmdW5jdGlvbihjYWxsYmFjaywgd2lkdGgpIHtcbiAgICBpZiAoIXRoaXMuaW1hZ2UpIHJldHVybiBudWxsO1xuXG4gICAgdGhpcy5jcmVhdGVCYXNlNjQoZnVuY3Rpb24ocmVzdWx0KSB7XG4gICAgICB2YXIgY2FudmFzU2l6ZSA9IHJlc3VsdC5jYW52YXNTaXplO1xuICAgICAgdmFyIGNhbnZhcyA9IHJlc3VsdC5jYW52YXM7XG4gICAgICB2YXIgZGF0YVVSTCA9IHJlc3VsdC5kYXRhVVJMO1xuXG4gICAgICBpZiAodHlwZW9mIGNhbGxiYWNrID09PSAnZnVuY3Rpb24nKSB7XG4gICAgICAgIGNhbGxiYWNrKHtcbiAgICAgICAgICBmaWxlOiBjYW52YXMudG9CbG9iID8gY2FudmFzLnRvQmxvYigpIDogZGF0YVVSSXRvQmxvYihkYXRhVVJMKSxcbiAgICAgICAgICBkYXRhVXJsOiBkYXRhVVJMLFxuICAgICAgICAgIG9EYXRhVVJMOiByZXN1bHQub0RhdGFVUkwsXG4gICAgICAgICAgc2l6ZTogY2FudmFzU2l6ZVxuICAgICAgICB9KTtcbiAgICAgIH1cbiAgICB9LCB3aWR0aCk7XG4gIH1cbn07XG5cbm1vZHVsZS5leHBvcnRzID0gQ3JvcHBlcjsiLCJ3aW5kb3cuQ3JvcHBlciA9IHJlcXVpcmUoJy4vY3JvcHBlcicpOyIsIlxudmFyIG9uY2UgPSBmdW5jdGlvbihlbCwgZXZlbnQsIGZuKSB7XG4gIHZhciBsaXN0ZW5lciA9IGZ1bmN0aW9uKCkge1xuICAgIGlmIChmbikge1xuICAgICAgZm4uYXBwbHkodGhpcywgYXJndW1lbnRzKTtcbiAgICB9XG4gICAgZWwucmVtb3ZlRXZlbnRMaXN0ZW5lcihldmVudCwgbGlzdGVuZXIpO1xuICB9O1xuICBlbC5hZGRFdmVudExpc3RlbmVyKGV2ZW50LCBsaXN0ZW5lcik7XG59O1xuXG5tb2R1bGUuZXhwb3J0cyA9IHtcbiAgZGF0YVVSSXRvQmxvYjogZnVuY3Rpb24gKGRhdGFVUkkpIHtcbiAgICB2YXIgYmluYXJ5U3RyaW5nID0gYXRvYihkYXRhVVJJLnNwbGl0KCcsJylbMV0pO1xuICAgIHZhciBhcnJheUJ1ZmZlciA9IG5ldyBBcnJheUJ1ZmZlcihiaW5hcnlTdHJpbmcubGVuZ3RoKTtcbiAgICB2YXIgaW50QXJyYXkgPSBuZXcgVWludDhBcnJheShhcnJheUJ1ZmZlcik7XG5cbiAgICBmb3IgKHZhciBpID0gMCwgaiA9IGJpbmFyeVN0cmluZy5sZW5ndGg7IGkgPCBqOyBpKyspIHtcbiAgICAgIGludEFycmF5W2ldID0gYmluYXJ5U3RyaW5nLmNoYXJDb2RlQXQoaSk7XG4gICAgfVxuXG4gICAgdmFyIGRhdGEgPSBbaW50QXJyYXldO1xuICAgIHZhciB0eXBlID0gJ2ltYWdlL3BuZyc7XG5cbiAgICB2YXIgcmVzdWx0O1xuXG4gICAgdHJ5IHtcbiAgICAgIHJlc3VsdCA9IG5ldyBCbG9iKGRhdGEsIHsgdHlwZTogdHlwZSB9KTtcbiAgICB9IGNhdGNoKGVycm9yKSB7XG4gICAgICAvLyBUeXBlRXJyb3Igb2xkIGNocm9tZSBhbmQgRkZcbiAgICAgIHdpbmRvdy5CbG9iQnVpbGRlciA9IHdpbmRvdy5CbG9iQnVpbGRlciB8fFxuICAgICAgICB3aW5kb3cuV2ViS2l0QmxvYkJ1aWxkZXIgfHxcbiAgICAgICAgd2luZG93Lk1vekJsb2JCdWlsZGVyIHx8XG4gICAgICAgIHdpbmRvdy5NU0Jsb2JCdWlsZGVyO1xuXG4gICAgICBpZihlcnJvci5uYW1lID09ICdUeXBlRXJyb3InICYmIHdpbmRvdy5CbG9iQnVpbGRlcil7XG4gICAgICAgIHZhciBidWlsZGVyID0gbmV3IEJsb2JCdWlsZGVyKCk7XG4gICAgICAgIGJ1aWxkZXIuYXBwZW5kKGFycmF5QnVmZmVyKTtcbiAgICAgICAgcmVzdWx0ID0gYnVpbGRlci5nZXRCbG9iKHR5cGUpO1xuICAgICAgfVxuICAgIH1cblxuICAgIHJldHVybiByZXN1bHQ7XG4gIH0sXG4gIGdldFRvdWNoRGlzdGFuY2U6IGZ1bmN0aW9uKGV2ZW50KSB7XG4gICAgdmFyIGZpbmdlciA9IGV2ZW50LnRvdWNoZXNbMF07XG4gICAgdmFyIGZpbmdlcjIgPSBldmVudC50b3VjaGVzWzFdO1xuXG4gICAgdmFyIGMxID0gTWF0aC5hYnMoZmluZ2VyLnBhZ2VYIC0gZmluZ2VyMi5wYWdlWCk7XG4gICAgdmFyIGMyID0gTWF0aC5hYnMoZmluZ2VyLnBhZ2VZIC0gZmluZ2VyMi5wYWdlWSk7XG5cbiAgICByZXR1cm4gTWF0aC5zcXJ0KCBjMSAqIGMxICsgYzIgKiBjMiApO1xuICB9LFxuICB0cmFuc2xhdGU6IGZ1bmN0aW9uKGVsZW1lbnQsIGxlZnQsIHRvcCwgc3BlZWQsIGNhbGxiYWNrKSB7XG4gICAgZWxlbWVudC5zdHlsZS53ZWJraXRUcmFuc2Zvcm0gPSAndHJhbnNsYXRlM2QoJyArIChsZWZ0IHx8IDApICsgJ3B4LCAnICsgKHRvcCB8fCAwKSArICdweCwgMCknO1xuICAgIGlmIChzcGVlZCkge1xuICAgICAgdmFyIGNhbGxlZCA9IGZhbHNlO1xuXG4gICAgICB2YXIgcmVhbENhbGxiYWNrID0gZnVuY3Rpb24oKSB7XG4gICAgICAgIGlmIChjYWxsZWQpIHJldHVybjtcbiAgICAgICAgZWxlbWVudC5zdHlsZS53ZWJraXRUcmFuc2l0aW9uID0gJyc7XG4gICAgICAgIGNhbGxlZCA9IHRydWU7XG4gICAgICAgIGlmIChjYWxsYmFjaykge1xuICAgICAgICAgIGNhbGxiYWNrLmFwcGx5KHRoaXMsIGFyZ3VtZW50cyk7XG4gICAgICAgIH1cbiAgICAgIH07XG4gICAgICBlbGVtZW50LnN0eWxlLndlYmtpdFRyYW5zaXRpb24gPSAnLXdlYmtpdC10cmFuc2Zvcm0gJyArIHNwZWVkICsgJ21zIGN1YmljLWJlemllcigwLjMyNSwgMC43NzAsIDAuMDAwLCAxLjAwMCknO1xuICAgICAgb25jZShlbGVtZW50LCAnd2Via2l0VHJhbnNpdGlvbkVuZCcsIHJlYWxDYWxsYmFjayk7XG4gICAgICBvbmNlKGVsZW1lbnQsICd0cmFuc2l0aW9uZW5kJywgcmVhbENhbGxiYWNrKTtcbiAgICAgIC8vIGZvciBhbmRyb2lkLi4uXG4gICAgICBzZXRUaW1lb3V0KHJlYWxDYWxsYmFjaywgc3BlZWQgKyA1MCk7XG4gICAgfSBlbHNlIHtcbiAgICAgIGVsZW1lbnQuc3R5bGUud2Via2l0VHJhbnNpdGlvbiA9ICcnO1xuICAgIH1cbiAgfSxcbiAgdHJhbnNsYXRlRWxlbWVudDogZnVuY3Rpb24oZWxlbWVudCwgbGVmdCwgdG9wKSB7XG4gICAgZWxlbWVudC5zdHlsZS53ZWJraXRUcmFuc2Zvcm0gPSAndHJhbnNsYXRlM2QoJyArIChsZWZ0IHx8IDApICsgJ3B4LCAnICsgKHRvcCB8fCAwKSArICdweCwgMCknO1xuICB9LFxuICBnZXRFbGVtZW50VHJhbnNsYXRlOiBmdW5jdGlvbihlbGVtZW50KSB7XG4gICAgdmFyIHRyYW5zZm9ybSA9IGVsZW1lbnQuc3R5bGUud2Via2l0VHJhbnNmb3JtO1xuICAgIHZhciBtYXRjaGVzID0gL3RyYW5zbGF0ZTNkXFwoKC4qPylcXCkvaWcuZXhlYyh0cmFuc2Zvcm0pO1xuICAgIGlmIChtYXRjaGVzKSB7XG4gICAgICB2YXIgdHJhbnNsYXRlcyA9IG1hdGNoZXNbMV0uc3BsaXQoJywnKTtcbiAgICAgIHJldHVybiB7XG4gICAgICAgIGxlZnQ6IHBhcnNlSW50KHRyYW5zbGF0ZXNbMF0sIDEwKSxcbiAgICAgICAgdG9wOiBwYXJzZUludCh0cmFuc2xhdGVzWzFdLCAxMClcbiAgICAgIH1cbiAgICB9XG4gICAgcmV0dXJuIHtcbiAgICAgIGxlZnQ6IDAsXG4gICAgICB0b3A6IDBcbiAgICB9XG4gIH1cbn07Il19
