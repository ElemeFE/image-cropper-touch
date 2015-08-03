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
    var image = new Image();

    image.onload = function() {
      var selfImage = self.refs.image;

      selfImage.src = src;

      var originalWidth = image.width;
      var originalHeight = image.height;

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