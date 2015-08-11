(function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){
(function() {

    var debug = false;

    var root = this;

    var EXIF = function(obj) {
        if (obj instanceof EXIF) return obj;
        if (!(this instanceof EXIF)) return new EXIF(obj);
        this.EXIFwrapped = obj;
    };

    if (typeof exports !== 'undefined') {
        if (typeof module !== 'undefined' && module.exports) {
            exports = module.exports = EXIF;
        }
        exports.EXIF = EXIF;
    } else {
        root.EXIF = EXIF;
    }

    var ExifTags = EXIF.Tags = {

        // version tags
        0x9000 : "ExifVersion",             // EXIF version
        0xA000 : "FlashpixVersion",         // Flashpix format version

        // colorspace tags
        0xA001 : "ColorSpace",              // Color space information tag

        // image configuration
        0xA002 : "PixelXDimension",         // Valid width of meaningful image
        0xA003 : "PixelYDimension",         // Valid height of meaningful image
        0x9101 : "ComponentsConfiguration", // Information about channels
        0x9102 : "CompressedBitsPerPixel",  // Compressed bits per pixel

        // user information
        0x927C : "MakerNote",               // Any desired information written by the manufacturer
        0x9286 : "UserComment",             // Comments by user

        // related file
        0xA004 : "RelatedSoundFile",        // Name of related sound file

        // date and time
        0x9003 : "DateTimeOriginal",        // Date and time when the original image was generated
        0x9004 : "DateTimeDigitized",       // Date and time when the image was stored digitally
        0x9290 : "SubsecTime",              // Fractions of seconds for DateTime
        0x9291 : "SubsecTimeOriginal",      // Fractions of seconds for DateTimeOriginal
        0x9292 : "SubsecTimeDigitized",     // Fractions of seconds for DateTimeDigitized

        // picture-taking conditions
        0x829A : "ExposureTime",            // Exposure time (in seconds)
        0x829D : "FNumber",                 // F number
        0x8822 : "ExposureProgram",         // Exposure program
        0x8824 : "SpectralSensitivity",     // Spectral sensitivity
        0x8827 : "ISOSpeedRatings",         // ISO speed rating
        0x8828 : "OECF",                    // Optoelectric conversion factor
        0x9201 : "ShutterSpeedValue",       // Shutter speed
        0x9202 : "ApertureValue",           // Lens aperture
        0x9203 : "BrightnessValue",         // Value of brightness
        0x9204 : "ExposureBias",            // Exposure bias
        0x9205 : "MaxApertureValue",        // Smallest F number of lens
        0x9206 : "SubjectDistance",         // Distance to subject in meters
        0x9207 : "MeteringMode",            // Metering mode
        0x9208 : "LightSource",             // Kind of light source
        0x9209 : "Flash",                   // Flash status
        0x9214 : "SubjectArea",             // Location and area of main subject
        0x920A : "FocalLength",             // Focal length of the lens in mm
        0xA20B : "FlashEnergy",             // Strobe energy in BCPS
        0xA20C : "SpatialFrequencyResponse",    //
        0xA20E : "FocalPlaneXResolution",   // Number of pixels in width direction per FocalPlaneResolutionUnit
        0xA20F : "FocalPlaneYResolution",   // Number of pixels in height direction per FocalPlaneResolutionUnit
        0xA210 : "FocalPlaneResolutionUnit",    // Unit for measuring FocalPlaneXResolution and FocalPlaneYResolution
        0xA214 : "SubjectLocation",         // Location of subject in image
        0xA215 : "ExposureIndex",           // Exposure index selected on camera
        0xA217 : "SensingMethod",           // Image sensor type
        0xA300 : "FileSource",              // Image source (3 == DSC)
        0xA301 : "SceneType",               // Scene type (1 == directly photographed)
        0xA302 : "CFAPattern",              // Color filter array geometric pattern
        0xA401 : "CustomRendered",          // Special processing
        0xA402 : "ExposureMode",            // Exposure mode
        0xA403 : "WhiteBalance",            // 1 = auto white balance, 2 = manual
        0xA404 : "DigitalZoomRation",       // Digital zoom ratio
        0xA405 : "FocalLengthIn35mmFilm",   // Equivalent foacl length assuming 35mm film camera (in mm)
        0xA406 : "SceneCaptureType",        // Type of scene
        0xA407 : "GainControl",             // Degree of overall image gain adjustment
        0xA408 : "Contrast",                // Direction of contrast processing applied by camera
        0xA409 : "Saturation",              // Direction of saturation processing applied by camera
        0xA40A : "Sharpness",               // Direction of sharpness processing applied by camera
        0xA40B : "DeviceSettingDescription",    //
        0xA40C : "SubjectDistanceRange",    // Distance to subject

        // other tags
        0xA005 : "InteroperabilityIFDPointer",
        0xA420 : "ImageUniqueID"            // Identifier assigned uniquely to each image
    };

    var TiffTags = EXIF.TiffTags = {
        0x0100 : "ImageWidth",
        0x0101 : "ImageHeight",
        0x8769 : "ExifIFDPointer",
        0x8825 : "GPSInfoIFDPointer",
        0xA005 : "InteroperabilityIFDPointer",
        0x0102 : "BitsPerSample",
        0x0103 : "Compression",
        0x0106 : "PhotometricInterpretation",
        0x0112 : "Orientation",
        0x0115 : "SamplesPerPixel",
        0x011C : "PlanarConfiguration",
        0x0212 : "YCbCrSubSampling",
        0x0213 : "YCbCrPositioning",
        0x011A : "XResolution",
        0x011B : "YResolution",
        0x0128 : "ResolutionUnit",
        0x0111 : "StripOffsets",
        0x0116 : "RowsPerStrip",
        0x0117 : "StripByteCounts",
        0x0201 : "JPEGInterchangeFormat",
        0x0202 : "JPEGInterchangeFormatLength",
        0x012D : "TransferFunction",
        0x013E : "WhitePoint",
        0x013F : "PrimaryChromaticities",
        0x0211 : "YCbCrCoefficients",
        0x0214 : "ReferenceBlackWhite",
        0x0132 : "DateTime",
        0x010E : "ImageDescription",
        0x010F : "Make",
        0x0110 : "Model",
        0x0131 : "Software",
        0x013B : "Artist",
        0x8298 : "Copyright"
    };

    var GPSTags = EXIF.GPSTags = {
        0x0000 : "GPSVersionID",
        0x0001 : "GPSLatitudeRef",
        0x0002 : "GPSLatitude",
        0x0003 : "GPSLongitudeRef",
        0x0004 : "GPSLongitude",
        0x0005 : "GPSAltitudeRef",
        0x0006 : "GPSAltitude",
        0x0007 : "GPSTimeStamp",
        0x0008 : "GPSSatellites",
        0x0009 : "GPSStatus",
        0x000A : "GPSMeasureMode",
        0x000B : "GPSDOP",
        0x000C : "GPSSpeedRef",
        0x000D : "GPSSpeed",
        0x000E : "GPSTrackRef",
        0x000F : "GPSTrack",
        0x0010 : "GPSImgDirectionRef",
        0x0011 : "GPSImgDirection",
        0x0012 : "GPSMapDatum",
        0x0013 : "GPSDestLatitudeRef",
        0x0014 : "GPSDestLatitude",
        0x0015 : "GPSDestLongitudeRef",
        0x0016 : "GPSDestLongitude",
        0x0017 : "GPSDestBearingRef",
        0x0018 : "GPSDestBearing",
        0x0019 : "GPSDestDistanceRef",
        0x001A : "GPSDestDistance",
        0x001B : "GPSProcessingMethod",
        0x001C : "GPSAreaInformation",
        0x001D : "GPSDateStamp",
        0x001E : "GPSDifferential"
    };

    var StringValues = EXIF.StringValues = {
        ExposureProgram : {
            0 : "Not defined",
            1 : "Manual",
            2 : "Normal program",
            3 : "Aperture priority",
            4 : "Shutter priority",
            5 : "Creative program",
            6 : "Action program",
            7 : "Portrait mode",
            8 : "Landscape mode"
        },
        MeteringMode : {
            0 : "Unknown",
            1 : "Average",
            2 : "CenterWeightedAverage",
            3 : "Spot",
            4 : "MultiSpot",
            5 : "Pattern",
            6 : "Partial",
            255 : "Other"
        },
        LightSource : {
            0 : "Unknown",
            1 : "Daylight",
            2 : "Fluorescent",
            3 : "Tungsten (incandescent light)",
            4 : "Flash",
            9 : "Fine weather",
            10 : "Cloudy weather",
            11 : "Shade",
            12 : "Daylight fluorescent (D 5700 - 7100K)",
            13 : "Day white fluorescent (N 4600 - 5400K)",
            14 : "Cool white fluorescent (W 3900 - 4500K)",
            15 : "White fluorescent (WW 3200 - 3700K)",
            17 : "Standard light A",
            18 : "Standard light B",
            19 : "Standard light C",
            20 : "D55",
            21 : "D65",
            22 : "D75",
            23 : "D50",
            24 : "ISO studio tungsten",
            255 : "Other"
        },
        Flash : {
            0x0000 : "Flash did not fire",
            0x0001 : "Flash fired",
            0x0005 : "Strobe return light not detected",
            0x0007 : "Strobe return light detected",
            0x0009 : "Flash fired, compulsory flash mode",
            0x000D : "Flash fired, compulsory flash mode, return light not detected",
            0x000F : "Flash fired, compulsory flash mode, return light detected",
            0x0010 : "Flash did not fire, compulsory flash mode",
            0x0018 : "Flash did not fire, auto mode",
            0x0019 : "Flash fired, auto mode",
            0x001D : "Flash fired, auto mode, return light not detected",
            0x001F : "Flash fired, auto mode, return light detected",
            0x0020 : "No flash function",
            0x0041 : "Flash fired, red-eye reduction mode",
            0x0045 : "Flash fired, red-eye reduction mode, return light not detected",
            0x0047 : "Flash fired, red-eye reduction mode, return light detected",
            0x0049 : "Flash fired, compulsory flash mode, red-eye reduction mode",
            0x004D : "Flash fired, compulsory flash mode, red-eye reduction mode, return light not detected",
            0x004F : "Flash fired, compulsory flash mode, red-eye reduction mode, return light detected",
            0x0059 : "Flash fired, auto mode, red-eye reduction mode",
            0x005D : "Flash fired, auto mode, return light not detected, red-eye reduction mode",
            0x005F : "Flash fired, auto mode, return light detected, red-eye reduction mode"
        },
        SensingMethod : {
            1 : "Not defined",
            2 : "One-chip color area sensor",
            3 : "Two-chip color area sensor",
            4 : "Three-chip color area sensor",
            5 : "Color sequential area sensor",
            7 : "Trilinear sensor",
            8 : "Color sequential linear sensor"
        },
        SceneCaptureType : {
            0 : "Standard",
            1 : "Landscape",
            2 : "Portrait",
            3 : "Night scene"
        },
        SceneType : {
            1 : "Directly photographed"
        },
        CustomRendered : {
            0 : "Normal process",
            1 : "Custom process"
        },
        WhiteBalance : {
            0 : "Auto white balance",
            1 : "Manual white balance"
        },
        GainControl : {
            0 : "None",
            1 : "Low gain up",
            2 : "High gain up",
            3 : "Low gain down",
            4 : "High gain down"
        },
        Contrast : {
            0 : "Normal",
            1 : "Soft",
            2 : "Hard"
        },
        Saturation : {
            0 : "Normal",
            1 : "Low saturation",
            2 : "High saturation"
        },
        Sharpness : {
            0 : "Normal",
            1 : "Soft",
            2 : "Hard"
        },
        SubjectDistanceRange : {
            0 : "Unknown",
            1 : "Macro",
            2 : "Close view",
            3 : "Distant view"
        },
        FileSource : {
            3 : "DSC"
        },

        Components : {
            0 : "",
            1 : "Y",
            2 : "Cb",
            3 : "Cr",
            4 : "R",
            5 : "G",
            6 : "B"
        }
    };

    function addEvent(element, event, handler) {
        if (element.addEventListener) {
            element.addEventListener(event, handler, false);
        } else if (element.attachEvent) {
            element.attachEvent("on" + event, handler);
        }
    }

    function imageHasData(img) {
        return !!(img.exifdata);
    }


    function base64ToArrayBuffer(base64, contentType) {
        contentType = contentType || base64.match(/^data\:([^\;]+)\;base64,/mi)[1] || ''; // e.g. 'data:image/jpeg;base64,...' => 'image/jpeg'
        base64 = base64.replace(/^data\:([^\;]+)\;base64,/gmi, '');
        var binary = atob(base64);
        var len = binary.length;
        var buffer = new ArrayBuffer(len);
        var view = new Uint8Array(buffer);
        for (var i = 0; i < len; i++) {
            view[i] = binary.charCodeAt(i);
        }
        return buffer;
    }

    function objectURLToBlob(url, callback) {
        var http = new XMLHttpRequest();
        http.open("GET", url, true);
        http.responseType = "blob";
        http.onload = function(e) {
            if (this.status == 200 || this.status === 0) {
                callback(this.response);
            }
        };
        http.send();
    }

    function getImageData(img, callback) {
        function handleBinaryFile(binFile) {
            var data = findEXIFinJPEG(binFile);
            var iptcdata = findIPTCinJPEG(binFile);
            img.exifdata = data || {};
            img.iptcdata = iptcdata || {};
            if (callback) {
                callback.call(img);
            }
        }

        if (img.src) {
            if (/^data\:/i.test(img.src)) { // Data URI
                var arrayBuffer = base64ToArrayBuffer(img.src);
                handleBinaryFile(arrayBuffer);

            } else if (/^blob\:/i.test(img.src)) { // Object URL
                var fileReader = new FileReader();
                fileReader.onload = function(e) {
                    handleBinaryFile(e.target.result);
                };
                objectURLToBlob(img.src, function (blob) {
                    fileReader.readAsArrayBuffer(blob);
                });
            } else {
                var http = new XMLHttpRequest();
                http.onload = function() {
                    if (this.status == 200 || this.status === 0) {
                        handleBinaryFile(http.response);
                    } else {
                        throw "Could not load image";
                    }
                    http = null;
                };
                http.open("GET", img.src, true);
                http.responseType = "arraybuffer";
                http.send(null);
            }
        } else if (window.FileReader && (img instanceof window.Blob || img instanceof window.File)) {
            var fileReader = new FileReader();
            fileReader.onload = function(e) {
                if (debug) console.log("Got file of length " + e.target.result.byteLength);
                handleBinaryFile(e.target.result);
            };

            fileReader.readAsArrayBuffer(img);
        }
    }

    function findEXIFinJPEG(file) {
        var dataView = new DataView(file);

        if (debug) console.log("Got file of length " + file.byteLength);
        if ((dataView.getUint8(0) != 0xFF) || (dataView.getUint8(1) != 0xD8)) {
            if (debug) console.log("Not a valid JPEG");
            return false; // not a valid jpeg
        }

        var offset = 2,
            length = file.byteLength,
            marker;

        while (offset < length) {
            if (dataView.getUint8(offset) != 0xFF) {
                if (debug) console.log("Not a valid marker at offset " + offset + ", found: " + dataView.getUint8(offset));
                return false; // not a valid marker, something is wrong
            }

            marker = dataView.getUint8(offset + 1);
            if (debug) console.log(marker);

            // we could implement handling for other markers here,
            // but we're only looking for 0xFFE1 for EXIF data

            if (marker == 225) {
                if (debug) console.log("Found 0xFFE1 marker");

                return readEXIFData(dataView, offset + 4, dataView.getUint16(offset + 2) - 2);

                // offset += 2 + file.getShortAt(offset+2, true);

            } else {
                offset += 2 + dataView.getUint16(offset+2);
            }

        }

    }

    function findIPTCinJPEG(file) {
        var dataView = new DataView(file);

        if (debug) console.log("Got file of length " + file.byteLength);
        if ((dataView.getUint8(0) != 0xFF) || (dataView.getUint8(1) != 0xD8)) {
            if (debug) console.log("Not a valid JPEG");
            return false; // not a valid jpeg
        }

        var offset = 2,
            length = file.byteLength;


        var isFieldSegmentStart = function(dataView, offset){
            return (
                dataView.getUint8(offset) === 0x38 &&
                dataView.getUint8(offset+1) === 0x42 &&
                dataView.getUint8(offset+2) === 0x49 &&
                dataView.getUint8(offset+3) === 0x4D &&
                dataView.getUint8(offset+4) === 0x04 &&
                dataView.getUint8(offset+5) === 0x04
            );
        };

        while (offset < length) {

            if ( isFieldSegmentStart(dataView, offset )){

                // Get the length of the name header (which is padded to an even number of bytes)
                var nameHeaderLength = dataView.getUint8(offset+7);
                if(nameHeaderLength % 2 !== 0) nameHeaderLength += 1;
                // Check for pre photoshop 6 format
                if(nameHeaderLength === 0) {
                    // Always 4
                    nameHeaderLength = 4;
                }

                var startOffset = offset + 8 + nameHeaderLength;
                var sectionLength = dataView.getUint16(offset + 6 + nameHeaderLength);

                return readIPTCData(file, startOffset, sectionLength);

                break;

            }


            // Not the marker, continue searching
            offset++;

        }

    }
    var IptcFieldMap = {
        0x78 : 'caption',
        0x6E : 'credit',
        0x19 : 'keywords',
        0x37 : 'dateCreated',
        0x50 : 'byline',
        0x55 : 'bylineTitle',
        0x7A : 'captionWriter',
        0x69 : 'headline',
        0x74 : 'copyright',
        0x0F : 'category'
    };
    function readIPTCData(file, startOffset, sectionLength){
        var dataView = new DataView(file);
        var data = {};
        var fieldValue, fieldName, dataSize, segmentType, segmentSize;
        var segmentStartPos = startOffset;
        while(segmentStartPos < startOffset+sectionLength) {
            if(dataView.getUint8(segmentStartPos) === 0x1C && dataView.getUint8(segmentStartPos+1) === 0x02){
                segmentType = dataView.getUint8(segmentStartPos+2);
                if(segmentType in IptcFieldMap) {
                    dataSize = dataView.getInt16(segmentStartPos+3);
                    segmentSize = dataSize + 5;
                    fieldName = IptcFieldMap[segmentType];
                    fieldValue = getStringFromDB(dataView, segmentStartPos+5, dataSize);
                    // Check if we already stored a value with this name
                    if(data.hasOwnProperty(fieldName)) {
                        // Value already stored with this name, create multivalue field
                        if(data[fieldName] instanceof Array) {
                            data[fieldName].push(fieldValue);
                        }
                        else {
                            data[fieldName] = [data[fieldName], fieldValue];
                        }
                    }
                    else {
                        data[fieldName] = fieldValue;
                    }
                }

            }
            segmentStartPos++;
        }
        return data;
    }



    function readTags(file, tiffStart, dirStart, strings, bigEnd) {
        var entries = file.getUint16(dirStart, !bigEnd),
            tags = {},
            entryOffset, tag,
            i;

        for (i=0;i<entries;i++) {
            entryOffset = dirStart + i*12 + 2;
            tag = strings[file.getUint16(entryOffset, !bigEnd)];
            if (!tag && debug) console.log("Unknown tag: " + file.getUint16(entryOffset, !bigEnd));
            tags[tag] = readTagValue(file, entryOffset, tiffStart, dirStart, bigEnd);
        }
        return tags;
    }


    function readTagValue(file, entryOffset, tiffStart, dirStart, bigEnd) {
        var type = file.getUint16(entryOffset+2, !bigEnd),
            numValues = file.getUint32(entryOffset+4, !bigEnd),
            valueOffset = file.getUint32(entryOffset+8, !bigEnd) + tiffStart,
            offset,
            vals, val, n,
            numerator, denominator;

        switch (type) {
            case 1: // byte, 8-bit unsigned int
            case 7: // undefined, 8-bit byte, value depending on field
                if (numValues == 1) {
                    return file.getUint8(entryOffset + 8, !bigEnd);
                } else {
                    offset = numValues > 4 ? valueOffset : (entryOffset + 8);
                    vals = [];
                    for (n=0;n<numValues;n++) {
                        vals[n] = file.getUint8(offset + n);
                    }
                    return vals;
                }

            case 2: // ascii, 8-bit byte
                offset = numValues > 4 ? valueOffset : (entryOffset + 8);
                return getStringFromDB(file, offset, numValues-1);

            case 3: // short, 16 bit int
                if (numValues == 1) {
                    return file.getUint16(entryOffset + 8, !bigEnd);
                } else {
                    offset = numValues > 2 ? valueOffset : (entryOffset + 8);
                    vals = [];
                    for (n=0;n<numValues;n++) {
                        vals[n] = file.getUint16(offset + 2*n, !bigEnd);
                    }
                    return vals;
                }

            case 4: // long, 32 bit int
                if (numValues == 1) {
                    return file.getUint32(entryOffset + 8, !bigEnd);
                } else {
                    vals = [];
                    for (n=0;n<numValues;n++) {
                        vals[n] = file.getUint32(valueOffset + 4*n, !bigEnd);
                    }
                    return vals;
                }

            case 5:    // rational = two long values, first is numerator, second is denominator
                if (numValues == 1) {
                    numerator = file.getUint32(valueOffset, !bigEnd);
                    denominator = file.getUint32(valueOffset+4, !bigEnd);
                    val = new Number(numerator / denominator);
                    val.numerator = numerator;
                    val.denominator = denominator;
                    return val;
                } else {
                    vals = [];
                    for (n=0;n<numValues;n++) {
                        numerator = file.getUint32(valueOffset + 8*n, !bigEnd);
                        denominator = file.getUint32(valueOffset+4 + 8*n, !bigEnd);
                        vals[n] = new Number(numerator / denominator);
                        vals[n].numerator = numerator;
                        vals[n].denominator = denominator;
                    }
                    return vals;
                }

            case 9: // slong, 32 bit signed int
                if (numValues == 1) {
                    return file.getInt32(entryOffset + 8, !bigEnd);
                } else {
                    vals = [];
                    for (n=0;n<numValues;n++) {
                        vals[n] = file.getInt32(valueOffset + 4*n, !bigEnd);
                    }
                    return vals;
                }

            case 10: // signed rational, two slongs, first is numerator, second is denominator
                if (numValues == 1) {
                    return file.getInt32(valueOffset, !bigEnd) / file.getInt32(valueOffset+4, !bigEnd);
                } else {
                    vals = [];
                    for (n=0;n<numValues;n++) {
                        vals[n] = file.getInt32(valueOffset + 8*n, !bigEnd) / file.getInt32(valueOffset+4 + 8*n, !bigEnd);
                    }
                    return vals;
                }
        }
    }

    function getStringFromDB(buffer, start, length) {
        var outstr = "";
        for (n = start; n < start+length; n++) {
            outstr += String.fromCharCode(buffer.getUint8(n));
        }
        return outstr;
    }

    function readEXIFData(file, start) {
        if (getStringFromDB(file, start, 4) != "Exif") {
            if (debug) console.log("Not valid EXIF data! " + getStringFromDB(file, start, 4));
            return false;
        }

        var bigEnd,
            tags, tag,
            exifData, gpsData,
            tiffOffset = start + 6;

        // test for TIFF validity and endianness
        if (file.getUint16(tiffOffset) == 0x4949) {
            bigEnd = false;
        } else if (file.getUint16(tiffOffset) == 0x4D4D) {
            bigEnd = true;
        } else {
            if (debug) console.log("Not valid TIFF data! (no 0x4949 or 0x4D4D)");
            return false;
        }

        if (file.getUint16(tiffOffset+2, !bigEnd) != 0x002A) {
            if (debug) console.log("Not valid TIFF data! (no 0x002A)");
            return false;
        }

        var firstIFDOffset = file.getUint32(tiffOffset+4, !bigEnd);

        if (firstIFDOffset < 0x00000008) {
            if (debug) console.log("Not valid TIFF data! (First offset less than 8)", file.getUint32(tiffOffset+4, !bigEnd));
            return false;
        }

        tags = readTags(file, tiffOffset, tiffOffset + firstIFDOffset, TiffTags, bigEnd);

        if (tags.ExifIFDPointer) {
            exifData = readTags(file, tiffOffset, tiffOffset + tags.ExifIFDPointer, ExifTags, bigEnd);
            for (tag in exifData) {
                switch (tag) {
                    case "LightSource" :
                    case "Flash" :
                    case "MeteringMode" :
                    case "ExposureProgram" :
                    case "SensingMethod" :
                    case "SceneCaptureType" :
                    case "SceneType" :
                    case "CustomRendered" :
                    case "WhiteBalance" :
                    case "GainControl" :
                    case "Contrast" :
                    case "Saturation" :
                    case "Sharpness" :
                    case "SubjectDistanceRange" :
                    case "FileSource" :
                        exifData[tag] = StringValues[tag][exifData[tag]];
                        break;

                    case "ExifVersion" :
                    case "FlashpixVersion" :
                        exifData[tag] = String.fromCharCode(exifData[tag][0], exifData[tag][1], exifData[tag][2], exifData[tag][3]);
                        break;

                    case "ComponentsConfiguration" :
                        exifData[tag] =
                            StringValues.Components[exifData[tag][0]] +
                            StringValues.Components[exifData[tag][1]] +
                            StringValues.Components[exifData[tag][2]] +
                            StringValues.Components[exifData[tag][3]];
                        break;
                }
                tags[tag] = exifData[tag];
            }
        }

        if (tags.GPSInfoIFDPointer) {
            gpsData = readTags(file, tiffOffset, tiffOffset + tags.GPSInfoIFDPointer, GPSTags, bigEnd);
            for (tag in gpsData) {
                switch (tag) {
                    case "GPSVersionID" :
                        gpsData[tag] = gpsData[tag][0] +
                            "." + gpsData[tag][1] +
                            "." + gpsData[tag][2] +
                            "." + gpsData[tag][3];
                        break;
                }
                tags[tag] = gpsData[tag];
            }
        }

        return tags;
    }

    EXIF.getData = function(img, callback) {
        if ((img instanceof Image || img instanceof HTMLImageElement) && !img.complete) return false;

        if (!imageHasData(img)) {
            getImageData(img, callback);
        } else {
            if (callback) {
                callback.call(img);
            }
        }
        return true;
    }

    EXIF.getTag = function(img, tag) {
        if (!imageHasData(img)) return;
        return img.exifdata[tag];
    }

    EXIF.getAllTags = function(img) {
        if (!imageHasData(img)) return {};
        var a,
            data = img.exifdata,
            tags = {};
        for (a in data) {
            if (data.hasOwnProperty(a)) {
                tags[a] = data[a];
            }
        }
        return tags;
    }

    EXIF.pretty = function(img) {
        if (!imageHasData(img)) return "";
        var a,
            data = img.exifdata,
            strPretty = "";
        for (a in data) {
            if (data.hasOwnProperty(a)) {
                if (typeof data[a] == "object") {
                    if (data[a] instanceof Number) {
                        strPretty += a + " : " + data[a] + " [" + data[a].numerator + "/" + data[a].denominator + "]\r\n";
                    } else {
                        strPretty += a + " : [" + data[a].length + " values]\r\n";
                    }
                } else {
                    strPretty += a + " : " + data[a] + "\r\n";
                }
            }
        }
        return strPretty;
    }

    EXIF.readFromBinaryFile = function(file) {
        return findEXIFinJPEG(file);
    }

    if (typeof define === 'function' && define.amd) {
        define('exif-js', [], function() {
            return EXIF;
        });
    }
}.call(this));


},{}],2:[function(require,module,exports){
var util = require('./util');
var EXIF = require('exif-js');

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
},{"./util":4,"exif-js":1}],3:[function(require,module,exports){
window.Cropper = require('./cropper');
},{"./cropper":2}],4:[function(require,module,exports){

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
},{}]},{},[3])
//# sourceMappingURL=data:application/json;charset:utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIm5vZGVfbW9kdWxlcy93YXRjaGlmeS9ub2RlX21vZHVsZXMvYnJvd3NlcmlmeS9ub2RlX21vZHVsZXMvYnJvd3Nlci1wYWNrL19wcmVsdWRlLmpzIiwibm9kZV9tb2R1bGVzL2V4aWYtanMvZXhpZi5qcyIsInNyYy9jcm9wcGVyLmpzIiwic3JjL2luZGV4LmpzIiwic3JjL3V0aWwuanMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7QUNBQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ3J5QkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDL2hCQTs7QUNBQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSIsImZpbGUiOiJnZW5lcmF0ZWQuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlc0NvbnRlbnQiOlsiKGZ1bmN0aW9uIGUodCxuLHIpe2Z1bmN0aW9uIHMobyx1KXtpZighbltvXSl7aWYoIXRbb10pe3ZhciBhPXR5cGVvZiByZXF1aXJlPT1cImZ1bmN0aW9uXCImJnJlcXVpcmU7aWYoIXUmJmEpcmV0dXJuIGEobywhMCk7aWYoaSlyZXR1cm4gaShvLCEwKTt2YXIgZj1uZXcgRXJyb3IoXCJDYW5ub3QgZmluZCBtb2R1bGUgJ1wiK28rXCInXCIpO3Rocm93IGYuY29kZT1cIk1PRFVMRV9OT1RfRk9VTkRcIixmfXZhciBsPW5bb109e2V4cG9ydHM6e319O3Rbb11bMF0uY2FsbChsLmV4cG9ydHMsZnVuY3Rpb24oZSl7dmFyIG49dFtvXVsxXVtlXTtyZXR1cm4gcyhuP246ZSl9LGwsbC5leHBvcnRzLGUsdCxuLHIpfXJldHVybiBuW29dLmV4cG9ydHN9dmFyIGk9dHlwZW9mIHJlcXVpcmU9PVwiZnVuY3Rpb25cIiYmcmVxdWlyZTtmb3IodmFyIG89MDtvPHIubGVuZ3RoO28rKylzKHJbb10pO3JldHVybiBzfSkiLCIoZnVuY3Rpb24oKSB7XG5cbiAgICB2YXIgZGVidWcgPSBmYWxzZTtcblxuICAgIHZhciByb290ID0gdGhpcztcblxuICAgIHZhciBFWElGID0gZnVuY3Rpb24ob2JqKSB7XG4gICAgICAgIGlmIChvYmogaW5zdGFuY2VvZiBFWElGKSByZXR1cm4gb2JqO1xuICAgICAgICBpZiAoISh0aGlzIGluc3RhbmNlb2YgRVhJRikpIHJldHVybiBuZXcgRVhJRihvYmopO1xuICAgICAgICB0aGlzLkVYSUZ3cmFwcGVkID0gb2JqO1xuICAgIH07XG5cbiAgICBpZiAodHlwZW9mIGV4cG9ydHMgIT09ICd1bmRlZmluZWQnKSB7XG4gICAgICAgIGlmICh0eXBlb2YgbW9kdWxlICE9PSAndW5kZWZpbmVkJyAmJiBtb2R1bGUuZXhwb3J0cykge1xuICAgICAgICAgICAgZXhwb3J0cyA9IG1vZHVsZS5leHBvcnRzID0gRVhJRjtcbiAgICAgICAgfVxuICAgICAgICBleHBvcnRzLkVYSUYgPSBFWElGO1xuICAgIH0gZWxzZSB7XG4gICAgICAgIHJvb3QuRVhJRiA9IEVYSUY7XG4gICAgfVxuXG4gICAgdmFyIEV4aWZUYWdzID0gRVhJRi5UYWdzID0ge1xuXG4gICAgICAgIC8vIHZlcnNpb24gdGFnc1xuICAgICAgICAweDkwMDAgOiBcIkV4aWZWZXJzaW9uXCIsICAgICAgICAgICAgIC8vIEVYSUYgdmVyc2lvblxuICAgICAgICAweEEwMDAgOiBcIkZsYXNocGl4VmVyc2lvblwiLCAgICAgICAgIC8vIEZsYXNocGl4IGZvcm1hdCB2ZXJzaW9uXG5cbiAgICAgICAgLy8gY29sb3JzcGFjZSB0YWdzXG4gICAgICAgIDB4QTAwMSA6IFwiQ29sb3JTcGFjZVwiLCAgICAgICAgICAgICAgLy8gQ29sb3Igc3BhY2UgaW5mb3JtYXRpb24gdGFnXG5cbiAgICAgICAgLy8gaW1hZ2UgY29uZmlndXJhdGlvblxuICAgICAgICAweEEwMDIgOiBcIlBpeGVsWERpbWVuc2lvblwiLCAgICAgICAgIC8vIFZhbGlkIHdpZHRoIG9mIG1lYW5pbmdmdWwgaW1hZ2VcbiAgICAgICAgMHhBMDAzIDogXCJQaXhlbFlEaW1lbnNpb25cIiwgICAgICAgICAvLyBWYWxpZCBoZWlnaHQgb2YgbWVhbmluZ2Z1bCBpbWFnZVxuICAgICAgICAweDkxMDEgOiBcIkNvbXBvbmVudHNDb25maWd1cmF0aW9uXCIsIC8vIEluZm9ybWF0aW9uIGFib3V0IGNoYW5uZWxzXG4gICAgICAgIDB4OTEwMiA6IFwiQ29tcHJlc3NlZEJpdHNQZXJQaXhlbFwiLCAgLy8gQ29tcHJlc3NlZCBiaXRzIHBlciBwaXhlbFxuXG4gICAgICAgIC8vIHVzZXIgaW5mb3JtYXRpb25cbiAgICAgICAgMHg5MjdDIDogXCJNYWtlck5vdGVcIiwgICAgICAgICAgICAgICAvLyBBbnkgZGVzaXJlZCBpbmZvcm1hdGlvbiB3cml0dGVuIGJ5IHRoZSBtYW51ZmFjdHVyZXJcbiAgICAgICAgMHg5Mjg2IDogXCJVc2VyQ29tbWVudFwiLCAgICAgICAgICAgICAvLyBDb21tZW50cyBieSB1c2VyXG5cbiAgICAgICAgLy8gcmVsYXRlZCBmaWxlXG4gICAgICAgIDB4QTAwNCA6IFwiUmVsYXRlZFNvdW5kRmlsZVwiLCAgICAgICAgLy8gTmFtZSBvZiByZWxhdGVkIHNvdW5kIGZpbGVcblxuICAgICAgICAvLyBkYXRlIGFuZCB0aW1lXG4gICAgICAgIDB4OTAwMyA6IFwiRGF0ZVRpbWVPcmlnaW5hbFwiLCAgICAgICAgLy8gRGF0ZSBhbmQgdGltZSB3aGVuIHRoZSBvcmlnaW5hbCBpbWFnZSB3YXMgZ2VuZXJhdGVkXG4gICAgICAgIDB4OTAwNCA6IFwiRGF0ZVRpbWVEaWdpdGl6ZWRcIiwgICAgICAgLy8gRGF0ZSBhbmQgdGltZSB3aGVuIHRoZSBpbWFnZSB3YXMgc3RvcmVkIGRpZ2l0YWxseVxuICAgICAgICAweDkyOTAgOiBcIlN1YnNlY1RpbWVcIiwgICAgICAgICAgICAgIC8vIEZyYWN0aW9ucyBvZiBzZWNvbmRzIGZvciBEYXRlVGltZVxuICAgICAgICAweDkyOTEgOiBcIlN1YnNlY1RpbWVPcmlnaW5hbFwiLCAgICAgIC8vIEZyYWN0aW9ucyBvZiBzZWNvbmRzIGZvciBEYXRlVGltZU9yaWdpbmFsXG4gICAgICAgIDB4OTI5MiA6IFwiU3Vic2VjVGltZURpZ2l0aXplZFwiLCAgICAgLy8gRnJhY3Rpb25zIG9mIHNlY29uZHMgZm9yIERhdGVUaW1lRGlnaXRpemVkXG5cbiAgICAgICAgLy8gcGljdHVyZS10YWtpbmcgY29uZGl0aW9uc1xuICAgICAgICAweDgyOUEgOiBcIkV4cG9zdXJlVGltZVwiLCAgICAgICAgICAgIC8vIEV4cG9zdXJlIHRpbWUgKGluIHNlY29uZHMpXG4gICAgICAgIDB4ODI5RCA6IFwiRk51bWJlclwiLCAgICAgICAgICAgICAgICAgLy8gRiBudW1iZXJcbiAgICAgICAgMHg4ODIyIDogXCJFeHBvc3VyZVByb2dyYW1cIiwgICAgICAgICAvLyBFeHBvc3VyZSBwcm9ncmFtXG4gICAgICAgIDB4ODgyNCA6IFwiU3BlY3RyYWxTZW5zaXRpdml0eVwiLCAgICAgLy8gU3BlY3RyYWwgc2Vuc2l0aXZpdHlcbiAgICAgICAgMHg4ODI3IDogXCJJU09TcGVlZFJhdGluZ3NcIiwgICAgICAgICAvLyBJU08gc3BlZWQgcmF0aW5nXG4gICAgICAgIDB4ODgyOCA6IFwiT0VDRlwiLCAgICAgICAgICAgICAgICAgICAgLy8gT3B0b2VsZWN0cmljIGNvbnZlcnNpb24gZmFjdG9yXG4gICAgICAgIDB4OTIwMSA6IFwiU2h1dHRlclNwZWVkVmFsdWVcIiwgICAgICAgLy8gU2h1dHRlciBzcGVlZFxuICAgICAgICAweDkyMDIgOiBcIkFwZXJ0dXJlVmFsdWVcIiwgICAgICAgICAgIC8vIExlbnMgYXBlcnR1cmVcbiAgICAgICAgMHg5MjAzIDogXCJCcmlnaHRuZXNzVmFsdWVcIiwgICAgICAgICAvLyBWYWx1ZSBvZiBicmlnaHRuZXNzXG4gICAgICAgIDB4OTIwNCA6IFwiRXhwb3N1cmVCaWFzXCIsICAgICAgICAgICAgLy8gRXhwb3N1cmUgYmlhc1xuICAgICAgICAweDkyMDUgOiBcIk1heEFwZXJ0dXJlVmFsdWVcIiwgICAgICAgIC8vIFNtYWxsZXN0IEYgbnVtYmVyIG9mIGxlbnNcbiAgICAgICAgMHg5MjA2IDogXCJTdWJqZWN0RGlzdGFuY2VcIiwgICAgICAgICAvLyBEaXN0YW5jZSB0byBzdWJqZWN0IGluIG1ldGVyc1xuICAgICAgICAweDkyMDcgOiBcIk1ldGVyaW5nTW9kZVwiLCAgICAgICAgICAgIC8vIE1ldGVyaW5nIG1vZGVcbiAgICAgICAgMHg5MjA4IDogXCJMaWdodFNvdXJjZVwiLCAgICAgICAgICAgICAvLyBLaW5kIG9mIGxpZ2h0IHNvdXJjZVxuICAgICAgICAweDkyMDkgOiBcIkZsYXNoXCIsICAgICAgICAgICAgICAgICAgIC8vIEZsYXNoIHN0YXR1c1xuICAgICAgICAweDkyMTQgOiBcIlN1YmplY3RBcmVhXCIsICAgICAgICAgICAgIC8vIExvY2F0aW9uIGFuZCBhcmVhIG9mIG1haW4gc3ViamVjdFxuICAgICAgICAweDkyMEEgOiBcIkZvY2FsTGVuZ3RoXCIsICAgICAgICAgICAgIC8vIEZvY2FsIGxlbmd0aCBvZiB0aGUgbGVucyBpbiBtbVxuICAgICAgICAweEEyMEIgOiBcIkZsYXNoRW5lcmd5XCIsICAgICAgICAgICAgIC8vIFN0cm9iZSBlbmVyZ3kgaW4gQkNQU1xuICAgICAgICAweEEyMEMgOiBcIlNwYXRpYWxGcmVxdWVuY3lSZXNwb25zZVwiLCAgICAvL1xuICAgICAgICAweEEyMEUgOiBcIkZvY2FsUGxhbmVYUmVzb2x1dGlvblwiLCAgIC8vIE51bWJlciBvZiBwaXhlbHMgaW4gd2lkdGggZGlyZWN0aW9uIHBlciBGb2NhbFBsYW5lUmVzb2x1dGlvblVuaXRcbiAgICAgICAgMHhBMjBGIDogXCJGb2NhbFBsYW5lWVJlc29sdXRpb25cIiwgICAvLyBOdW1iZXIgb2YgcGl4ZWxzIGluIGhlaWdodCBkaXJlY3Rpb24gcGVyIEZvY2FsUGxhbmVSZXNvbHV0aW9uVW5pdFxuICAgICAgICAweEEyMTAgOiBcIkZvY2FsUGxhbmVSZXNvbHV0aW9uVW5pdFwiLCAgICAvLyBVbml0IGZvciBtZWFzdXJpbmcgRm9jYWxQbGFuZVhSZXNvbHV0aW9uIGFuZCBGb2NhbFBsYW5lWVJlc29sdXRpb25cbiAgICAgICAgMHhBMjE0IDogXCJTdWJqZWN0TG9jYXRpb25cIiwgICAgICAgICAvLyBMb2NhdGlvbiBvZiBzdWJqZWN0IGluIGltYWdlXG4gICAgICAgIDB4QTIxNSA6IFwiRXhwb3N1cmVJbmRleFwiLCAgICAgICAgICAgLy8gRXhwb3N1cmUgaW5kZXggc2VsZWN0ZWQgb24gY2FtZXJhXG4gICAgICAgIDB4QTIxNyA6IFwiU2Vuc2luZ01ldGhvZFwiLCAgICAgICAgICAgLy8gSW1hZ2Ugc2Vuc29yIHR5cGVcbiAgICAgICAgMHhBMzAwIDogXCJGaWxlU291cmNlXCIsICAgICAgICAgICAgICAvLyBJbWFnZSBzb3VyY2UgKDMgPT0gRFNDKVxuICAgICAgICAweEEzMDEgOiBcIlNjZW5lVHlwZVwiLCAgICAgICAgICAgICAgIC8vIFNjZW5lIHR5cGUgKDEgPT0gZGlyZWN0bHkgcGhvdG9ncmFwaGVkKVxuICAgICAgICAweEEzMDIgOiBcIkNGQVBhdHRlcm5cIiwgICAgICAgICAgICAgIC8vIENvbG9yIGZpbHRlciBhcnJheSBnZW9tZXRyaWMgcGF0dGVyblxuICAgICAgICAweEE0MDEgOiBcIkN1c3RvbVJlbmRlcmVkXCIsICAgICAgICAgIC8vIFNwZWNpYWwgcHJvY2Vzc2luZ1xuICAgICAgICAweEE0MDIgOiBcIkV4cG9zdXJlTW9kZVwiLCAgICAgICAgICAgIC8vIEV4cG9zdXJlIG1vZGVcbiAgICAgICAgMHhBNDAzIDogXCJXaGl0ZUJhbGFuY2VcIiwgICAgICAgICAgICAvLyAxID0gYXV0byB3aGl0ZSBiYWxhbmNlLCAyID0gbWFudWFsXG4gICAgICAgIDB4QTQwNCA6IFwiRGlnaXRhbFpvb21SYXRpb25cIiwgICAgICAgLy8gRGlnaXRhbCB6b29tIHJhdGlvXG4gICAgICAgIDB4QTQwNSA6IFwiRm9jYWxMZW5ndGhJbjM1bW1GaWxtXCIsICAgLy8gRXF1aXZhbGVudCBmb2FjbCBsZW5ndGggYXNzdW1pbmcgMzVtbSBmaWxtIGNhbWVyYSAoaW4gbW0pXG4gICAgICAgIDB4QTQwNiA6IFwiU2NlbmVDYXB0dXJlVHlwZVwiLCAgICAgICAgLy8gVHlwZSBvZiBzY2VuZVxuICAgICAgICAweEE0MDcgOiBcIkdhaW5Db250cm9sXCIsICAgICAgICAgICAgIC8vIERlZ3JlZSBvZiBvdmVyYWxsIGltYWdlIGdhaW4gYWRqdXN0bWVudFxuICAgICAgICAweEE0MDggOiBcIkNvbnRyYXN0XCIsICAgICAgICAgICAgICAgIC8vIERpcmVjdGlvbiBvZiBjb250cmFzdCBwcm9jZXNzaW5nIGFwcGxpZWQgYnkgY2FtZXJhXG4gICAgICAgIDB4QTQwOSA6IFwiU2F0dXJhdGlvblwiLCAgICAgICAgICAgICAgLy8gRGlyZWN0aW9uIG9mIHNhdHVyYXRpb24gcHJvY2Vzc2luZyBhcHBsaWVkIGJ5IGNhbWVyYVxuICAgICAgICAweEE0MEEgOiBcIlNoYXJwbmVzc1wiLCAgICAgICAgICAgICAgIC8vIERpcmVjdGlvbiBvZiBzaGFycG5lc3MgcHJvY2Vzc2luZyBhcHBsaWVkIGJ5IGNhbWVyYVxuICAgICAgICAweEE0MEIgOiBcIkRldmljZVNldHRpbmdEZXNjcmlwdGlvblwiLCAgICAvL1xuICAgICAgICAweEE0MEMgOiBcIlN1YmplY3REaXN0YW5jZVJhbmdlXCIsICAgIC8vIERpc3RhbmNlIHRvIHN1YmplY3RcblxuICAgICAgICAvLyBvdGhlciB0YWdzXG4gICAgICAgIDB4QTAwNSA6IFwiSW50ZXJvcGVyYWJpbGl0eUlGRFBvaW50ZXJcIixcbiAgICAgICAgMHhBNDIwIDogXCJJbWFnZVVuaXF1ZUlEXCIgICAgICAgICAgICAvLyBJZGVudGlmaWVyIGFzc2lnbmVkIHVuaXF1ZWx5IHRvIGVhY2ggaW1hZ2VcbiAgICB9O1xuXG4gICAgdmFyIFRpZmZUYWdzID0gRVhJRi5UaWZmVGFncyA9IHtcbiAgICAgICAgMHgwMTAwIDogXCJJbWFnZVdpZHRoXCIsXG4gICAgICAgIDB4MDEwMSA6IFwiSW1hZ2VIZWlnaHRcIixcbiAgICAgICAgMHg4NzY5IDogXCJFeGlmSUZEUG9pbnRlclwiLFxuICAgICAgICAweDg4MjUgOiBcIkdQU0luZm9JRkRQb2ludGVyXCIsXG4gICAgICAgIDB4QTAwNSA6IFwiSW50ZXJvcGVyYWJpbGl0eUlGRFBvaW50ZXJcIixcbiAgICAgICAgMHgwMTAyIDogXCJCaXRzUGVyU2FtcGxlXCIsXG4gICAgICAgIDB4MDEwMyA6IFwiQ29tcHJlc3Npb25cIixcbiAgICAgICAgMHgwMTA2IDogXCJQaG90b21ldHJpY0ludGVycHJldGF0aW9uXCIsXG4gICAgICAgIDB4MDExMiA6IFwiT3JpZW50YXRpb25cIixcbiAgICAgICAgMHgwMTE1IDogXCJTYW1wbGVzUGVyUGl4ZWxcIixcbiAgICAgICAgMHgwMTFDIDogXCJQbGFuYXJDb25maWd1cmF0aW9uXCIsXG4gICAgICAgIDB4MDIxMiA6IFwiWUNiQ3JTdWJTYW1wbGluZ1wiLFxuICAgICAgICAweDAyMTMgOiBcIllDYkNyUG9zaXRpb25pbmdcIixcbiAgICAgICAgMHgwMTFBIDogXCJYUmVzb2x1dGlvblwiLFxuICAgICAgICAweDAxMUIgOiBcIllSZXNvbHV0aW9uXCIsXG4gICAgICAgIDB4MDEyOCA6IFwiUmVzb2x1dGlvblVuaXRcIixcbiAgICAgICAgMHgwMTExIDogXCJTdHJpcE9mZnNldHNcIixcbiAgICAgICAgMHgwMTE2IDogXCJSb3dzUGVyU3RyaXBcIixcbiAgICAgICAgMHgwMTE3IDogXCJTdHJpcEJ5dGVDb3VudHNcIixcbiAgICAgICAgMHgwMjAxIDogXCJKUEVHSW50ZXJjaGFuZ2VGb3JtYXRcIixcbiAgICAgICAgMHgwMjAyIDogXCJKUEVHSW50ZXJjaGFuZ2VGb3JtYXRMZW5ndGhcIixcbiAgICAgICAgMHgwMTJEIDogXCJUcmFuc2ZlckZ1bmN0aW9uXCIsXG4gICAgICAgIDB4MDEzRSA6IFwiV2hpdGVQb2ludFwiLFxuICAgICAgICAweDAxM0YgOiBcIlByaW1hcnlDaHJvbWF0aWNpdGllc1wiLFxuICAgICAgICAweDAyMTEgOiBcIllDYkNyQ29lZmZpY2llbnRzXCIsXG4gICAgICAgIDB4MDIxNCA6IFwiUmVmZXJlbmNlQmxhY2tXaGl0ZVwiLFxuICAgICAgICAweDAxMzIgOiBcIkRhdGVUaW1lXCIsXG4gICAgICAgIDB4MDEwRSA6IFwiSW1hZ2VEZXNjcmlwdGlvblwiLFxuICAgICAgICAweDAxMEYgOiBcIk1ha2VcIixcbiAgICAgICAgMHgwMTEwIDogXCJNb2RlbFwiLFxuICAgICAgICAweDAxMzEgOiBcIlNvZnR3YXJlXCIsXG4gICAgICAgIDB4MDEzQiA6IFwiQXJ0aXN0XCIsXG4gICAgICAgIDB4ODI5OCA6IFwiQ29weXJpZ2h0XCJcbiAgICB9O1xuXG4gICAgdmFyIEdQU1RhZ3MgPSBFWElGLkdQU1RhZ3MgPSB7XG4gICAgICAgIDB4MDAwMCA6IFwiR1BTVmVyc2lvbklEXCIsXG4gICAgICAgIDB4MDAwMSA6IFwiR1BTTGF0aXR1ZGVSZWZcIixcbiAgICAgICAgMHgwMDAyIDogXCJHUFNMYXRpdHVkZVwiLFxuICAgICAgICAweDAwMDMgOiBcIkdQU0xvbmdpdHVkZVJlZlwiLFxuICAgICAgICAweDAwMDQgOiBcIkdQU0xvbmdpdHVkZVwiLFxuICAgICAgICAweDAwMDUgOiBcIkdQU0FsdGl0dWRlUmVmXCIsXG4gICAgICAgIDB4MDAwNiA6IFwiR1BTQWx0aXR1ZGVcIixcbiAgICAgICAgMHgwMDA3IDogXCJHUFNUaW1lU3RhbXBcIixcbiAgICAgICAgMHgwMDA4IDogXCJHUFNTYXRlbGxpdGVzXCIsXG4gICAgICAgIDB4MDAwOSA6IFwiR1BTU3RhdHVzXCIsXG4gICAgICAgIDB4MDAwQSA6IFwiR1BTTWVhc3VyZU1vZGVcIixcbiAgICAgICAgMHgwMDBCIDogXCJHUFNET1BcIixcbiAgICAgICAgMHgwMDBDIDogXCJHUFNTcGVlZFJlZlwiLFxuICAgICAgICAweDAwMEQgOiBcIkdQU1NwZWVkXCIsXG4gICAgICAgIDB4MDAwRSA6IFwiR1BTVHJhY2tSZWZcIixcbiAgICAgICAgMHgwMDBGIDogXCJHUFNUcmFja1wiLFxuICAgICAgICAweDAwMTAgOiBcIkdQU0ltZ0RpcmVjdGlvblJlZlwiLFxuICAgICAgICAweDAwMTEgOiBcIkdQU0ltZ0RpcmVjdGlvblwiLFxuICAgICAgICAweDAwMTIgOiBcIkdQU01hcERhdHVtXCIsXG4gICAgICAgIDB4MDAxMyA6IFwiR1BTRGVzdExhdGl0dWRlUmVmXCIsXG4gICAgICAgIDB4MDAxNCA6IFwiR1BTRGVzdExhdGl0dWRlXCIsXG4gICAgICAgIDB4MDAxNSA6IFwiR1BTRGVzdExvbmdpdHVkZVJlZlwiLFxuICAgICAgICAweDAwMTYgOiBcIkdQU0Rlc3RMb25naXR1ZGVcIixcbiAgICAgICAgMHgwMDE3IDogXCJHUFNEZXN0QmVhcmluZ1JlZlwiLFxuICAgICAgICAweDAwMTggOiBcIkdQU0Rlc3RCZWFyaW5nXCIsXG4gICAgICAgIDB4MDAxOSA6IFwiR1BTRGVzdERpc3RhbmNlUmVmXCIsXG4gICAgICAgIDB4MDAxQSA6IFwiR1BTRGVzdERpc3RhbmNlXCIsXG4gICAgICAgIDB4MDAxQiA6IFwiR1BTUHJvY2Vzc2luZ01ldGhvZFwiLFxuICAgICAgICAweDAwMUMgOiBcIkdQU0FyZWFJbmZvcm1hdGlvblwiLFxuICAgICAgICAweDAwMUQgOiBcIkdQU0RhdGVTdGFtcFwiLFxuICAgICAgICAweDAwMUUgOiBcIkdQU0RpZmZlcmVudGlhbFwiXG4gICAgfTtcblxuICAgIHZhciBTdHJpbmdWYWx1ZXMgPSBFWElGLlN0cmluZ1ZhbHVlcyA9IHtcbiAgICAgICAgRXhwb3N1cmVQcm9ncmFtIDoge1xuICAgICAgICAgICAgMCA6IFwiTm90IGRlZmluZWRcIixcbiAgICAgICAgICAgIDEgOiBcIk1hbnVhbFwiLFxuICAgICAgICAgICAgMiA6IFwiTm9ybWFsIHByb2dyYW1cIixcbiAgICAgICAgICAgIDMgOiBcIkFwZXJ0dXJlIHByaW9yaXR5XCIsXG4gICAgICAgICAgICA0IDogXCJTaHV0dGVyIHByaW9yaXR5XCIsXG4gICAgICAgICAgICA1IDogXCJDcmVhdGl2ZSBwcm9ncmFtXCIsXG4gICAgICAgICAgICA2IDogXCJBY3Rpb24gcHJvZ3JhbVwiLFxuICAgICAgICAgICAgNyA6IFwiUG9ydHJhaXQgbW9kZVwiLFxuICAgICAgICAgICAgOCA6IFwiTGFuZHNjYXBlIG1vZGVcIlxuICAgICAgICB9LFxuICAgICAgICBNZXRlcmluZ01vZGUgOiB7XG4gICAgICAgICAgICAwIDogXCJVbmtub3duXCIsXG4gICAgICAgICAgICAxIDogXCJBdmVyYWdlXCIsXG4gICAgICAgICAgICAyIDogXCJDZW50ZXJXZWlnaHRlZEF2ZXJhZ2VcIixcbiAgICAgICAgICAgIDMgOiBcIlNwb3RcIixcbiAgICAgICAgICAgIDQgOiBcIk11bHRpU3BvdFwiLFxuICAgICAgICAgICAgNSA6IFwiUGF0dGVyblwiLFxuICAgICAgICAgICAgNiA6IFwiUGFydGlhbFwiLFxuICAgICAgICAgICAgMjU1IDogXCJPdGhlclwiXG4gICAgICAgIH0sXG4gICAgICAgIExpZ2h0U291cmNlIDoge1xuICAgICAgICAgICAgMCA6IFwiVW5rbm93blwiLFxuICAgICAgICAgICAgMSA6IFwiRGF5bGlnaHRcIixcbiAgICAgICAgICAgIDIgOiBcIkZsdW9yZXNjZW50XCIsXG4gICAgICAgICAgICAzIDogXCJUdW5nc3RlbiAoaW5jYW5kZXNjZW50IGxpZ2h0KVwiLFxuICAgICAgICAgICAgNCA6IFwiRmxhc2hcIixcbiAgICAgICAgICAgIDkgOiBcIkZpbmUgd2VhdGhlclwiLFxuICAgICAgICAgICAgMTAgOiBcIkNsb3VkeSB3ZWF0aGVyXCIsXG4gICAgICAgICAgICAxMSA6IFwiU2hhZGVcIixcbiAgICAgICAgICAgIDEyIDogXCJEYXlsaWdodCBmbHVvcmVzY2VudCAoRCA1NzAwIC0gNzEwMEspXCIsXG4gICAgICAgICAgICAxMyA6IFwiRGF5IHdoaXRlIGZsdW9yZXNjZW50IChOIDQ2MDAgLSA1NDAwSylcIixcbiAgICAgICAgICAgIDE0IDogXCJDb29sIHdoaXRlIGZsdW9yZXNjZW50IChXIDM5MDAgLSA0NTAwSylcIixcbiAgICAgICAgICAgIDE1IDogXCJXaGl0ZSBmbHVvcmVzY2VudCAoV1cgMzIwMCAtIDM3MDBLKVwiLFxuICAgICAgICAgICAgMTcgOiBcIlN0YW5kYXJkIGxpZ2h0IEFcIixcbiAgICAgICAgICAgIDE4IDogXCJTdGFuZGFyZCBsaWdodCBCXCIsXG4gICAgICAgICAgICAxOSA6IFwiU3RhbmRhcmQgbGlnaHQgQ1wiLFxuICAgICAgICAgICAgMjAgOiBcIkQ1NVwiLFxuICAgICAgICAgICAgMjEgOiBcIkQ2NVwiLFxuICAgICAgICAgICAgMjIgOiBcIkQ3NVwiLFxuICAgICAgICAgICAgMjMgOiBcIkQ1MFwiLFxuICAgICAgICAgICAgMjQgOiBcIklTTyBzdHVkaW8gdHVuZ3N0ZW5cIixcbiAgICAgICAgICAgIDI1NSA6IFwiT3RoZXJcIlxuICAgICAgICB9LFxuICAgICAgICBGbGFzaCA6IHtcbiAgICAgICAgICAgIDB4MDAwMCA6IFwiRmxhc2ggZGlkIG5vdCBmaXJlXCIsXG4gICAgICAgICAgICAweDAwMDEgOiBcIkZsYXNoIGZpcmVkXCIsXG4gICAgICAgICAgICAweDAwMDUgOiBcIlN0cm9iZSByZXR1cm4gbGlnaHQgbm90IGRldGVjdGVkXCIsXG4gICAgICAgICAgICAweDAwMDcgOiBcIlN0cm9iZSByZXR1cm4gbGlnaHQgZGV0ZWN0ZWRcIixcbiAgICAgICAgICAgIDB4MDAwOSA6IFwiRmxhc2ggZmlyZWQsIGNvbXB1bHNvcnkgZmxhc2ggbW9kZVwiLFxuICAgICAgICAgICAgMHgwMDBEIDogXCJGbGFzaCBmaXJlZCwgY29tcHVsc29yeSBmbGFzaCBtb2RlLCByZXR1cm4gbGlnaHQgbm90IGRldGVjdGVkXCIsXG4gICAgICAgICAgICAweDAwMEYgOiBcIkZsYXNoIGZpcmVkLCBjb21wdWxzb3J5IGZsYXNoIG1vZGUsIHJldHVybiBsaWdodCBkZXRlY3RlZFwiLFxuICAgICAgICAgICAgMHgwMDEwIDogXCJGbGFzaCBkaWQgbm90IGZpcmUsIGNvbXB1bHNvcnkgZmxhc2ggbW9kZVwiLFxuICAgICAgICAgICAgMHgwMDE4IDogXCJGbGFzaCBkaWQgbm90IGZpcmUsIGF1dG8gbW9kZVwiLFxuICAgICAgICAgICAgMHgwMDE5IDogXCJGbGFzaCBmaXJlZCwgYXV0byBtb2RlXCIsXG4gICAgICAgICAgICAweDAwMUQgOiBcIkZsYXNoIGZpcmVkLCBhdXRvIG1vZGUsIHJldHVybiBsaWdodCBub3QgZGV0ZWN0ZWRcIixcbiAgICAgICAgICAgIDB4MDAxRiA6IFwiRmxhc2ggZmlyZWQsIGF1dG8gbW9kZSwgcmV0dXJuIGxpZ2h0IGRldGVjdGVkXCIsXG4gICAgICAgICAgICAweDAwMjAgOiBcIk5vIGZsYXNoIGZ1bmN0aW9uXCIsXG4gICAgICAgICAgICAweDAwNDEgOiBcIkZsYXNoIGZpcmVkLCByZWQtZXllIHJlZHVjdGlvbiBtb2RlXCIsXG4gICAgICAgICAgICAweDAwNDUgOiBcIkZsYXNoIGZpcmVkLCByZWQtZXllIHJlZHVjdGlvbiBtb2RlLCByZXR1cm4gbGlnaHQgbm90IGRldGVjdGVkXCIsXG4gICAgICAgICAgICAweDAwNDcgOiBcIkZsYXNoIGZpcmVkLCByZWQtZXllIHJlZHVjdGlvbiBtb2RlLCByZXR1cm4gbGlnaHQgZGV0ZWN0ZWRcIixcbiAgICAgICAgICAgIDB4MDA0OSA6IFwiRmxhc2ggZmlyZWQsIGNvbXB1bHNvcnkgZmxhc2ggbW9kZSwgcmVkLWV5ZSByZWR1Y3Rpb24gbW9kZVwiLFxuICAgICAgICAgICAgMHgwMDREIDogXCJGbGFzaCBmaXJlZCwgY29tcHVsc29yeSBmbGFzaCBtb2RlLCByZWQtZXllIHJlZHVjdGlvbiBtb2RlLCByZXR1cm4gbGlnaHQgbm90IGRldGVjdGVkXCIsXG4gICAgICAgICAgICAweDAwNEYgOiBcIkZsYXNoIGZpcmVkLCBjb21wdWxzb3J5IGZsYXNoIG1vZGUsIHJlZC1leWUgcmVkdWN0aW9uIG1vZGUsIHJldHVybiBsaWdodCBkZXRlY3RlZFwiLFxuICAgICAgICAgICAgMHgwMDU5IDogXCJGbGFzaCBmaXJlZCwgYXV0byBtb2RlLCByZWQtZXllIHJlZHVjdGlvbiBtb2RlXCIsXG4gICAgICAgICAgICAweDAwNUQgOiBcIkZsYXNoIGZpcmVkLCBhdXRvIG1vZGUsIHJldHVybiBsaWdodCBub3QgZGV0ZWN0ZWQsIHJlZC1leWUgcmVkdWN0aW9uIG1vZGVcIixcbiAgICAgICAgICAgIDB4MDA1RiA6IFwiRmxhc2ggZmlyZWQsIGF1dG8gbW9kZSwgcmV0dXJuIGxpZ2h0IGRldGVjdGVkLCByZWQtZXllIHJlZHVjdGlvbiBtb2RlXCJcbiAgICAgICAgfSxcbiAgICAgICAgU2Vuc2luZ01ldGhvZCA6IHtcbiAgICAgICAgICAgIDEgOiBcIk5vdCBkZWZpbmVkXCIsXG4gICAgICAgICAgICAyIDogXCJPbmUtY2hpcCBjb2xvciBhcmVhIHNlbnNvclwiLFxuICAgICAgICAgICAgMyA6IFwiVHdvLWNoaXAgY29sb3IgYXJlYSBzZW5zb3JcIixcbiAgICAgICAgICAgIDQgOiBcIlRocmVlLWNoaXAgY29sb3IgYXJlYSBzZW5zb3JcIixcbiAgICAgICAgICAgIDUgOiBcIkNvbG9yIHNlcXVlbnRpYWwgYXJlYSBzZW5zb3JcIixcbiAgICAgICAgICAgIDcgOiBcIlRyaWxpbmVhciBzZW5zb3JcIixcbiAgICAgICAgICAgIDggOiBcIkNvbG9yIHNlcXVlbnRpYWwgbGluZWFyIHNlbnNvclwiXG4gICAgICAgIH0sXG4gICAgICAgIFNjZW5lQ2FwdHVyZVR5cGUgOiB7XG4gICAgICAgICAgICAwIDogXCJTdGFuZGFyZFwiLFxuICAgICAgICAgICAgMSA6IFwiTGFuZHNjYXBlXCIsXG4gICAgICAgICAgICAyIDogXCJQb3J0cmFpdFwiLFxuICAgICAgICAgICAgMyA6IFwiTmlnaHQgc2NlbmVcIlxuICAgICAgICB9LFxuICAgICAgICBTY2VuZVR5cGUgOiB7XG4gICAgICAgICAgICAxIDogXCJEaXJlY3RseSBwaG90b2dyYXBoZWRcIlxuICAgICAgICB9LFxuICAgICAgICBDdXN0b21SZW5kZXJlZCA6IHtcbiAgICAgICAgICAgIDAgOiBcIk5vcm1hbCBwcm9jZXNzXCIsXG4gICAgICAgICAgICAxIDogXCJDdXN0b20gcHJvY2Vzc1wiXG4gICAgICAgIH0sXG4gICAgICAgIFdoaXRlQmFsYW5jZSA6IHtcbiAgICAgICAgICAgIDAgOiBcIkF1dG8gd2hpdGUgYmFsYW5jZVwiLFxuICAgICAgICAgICAgMSA6IFwiTWFudWFsIHdoaXRlIGJhbGFuY2VcIlxuICAgICAgICB9LFxuICAgICAgICBHYWluQ29udHJvbCA6IHtcbiAgICAgICAgICAgIDAgOiBcIk5vbmVcIixcbiAgICAgICAgICAgIDEgOiBcIkxvdyBnYWluIHVwXCIsXG4gICAgICAgICAgICAyIDogXCJIaWdoIGdhaW4gdXBcIixcbiAgICAgICAgICAgIDMgOiBcIkxvdyBnYWluIGRvd25cIixcbiAgICAgICAgICAgIDQgOiBcIkhpZ2ggZ2FpbiBkb3duXCJcbiAgICAgICAgfSxcbiAgICAgICAgQ29udHJhc3QgOiB7XG4gICAgICAgICAgICAwIDogXCJOb3JtYWxcIixcbiAgICAgICAgICAgIDEgOiBcIlNvZnRcIixcbiAgICAgICAgICAgIDIgOiBcIkhhcmRcIlxuICAgICAgICB9LFxuICAgICAgICBTYXR1cmF0aW9uIDoge1xuICAgICAgICAgICAgMCA6IFwiTm9ybWFsXCIsXG4gICAgICAgICAgICAxIDogXCJMb3cgc2F0dXJhdGlvblwiLFxuICAgICAgICAgICAgMiA6IFwiSGlnaCBzYXR1cmF0aW9uXCJcbiAgICAgICAgfSxcbiAgICAgICAgU2hhcnBuZXNzIDoge1xuICAgICAgICAgICAgMCA6IFwiTm9ybWFsXCIsXG4gICAgICAgICAgICAxIDogXCJTb2Z0XCIsXG4gICAgICAgICAgICAyIDogXCJIYXJkXCJcbiAgICAgICAgfSxcbiAgICAgICAgU3ViamVjdERpc3RhbmNlUmFuZ2UgOiB7XG4gICAgICAgICAgICAwIDogXCJVbmtub3duXCIsXG4gICAgICAgICAgICAxIDogXCJNYWNyb1wiLFxuICAgICAgICAgICAgMiA6IFwiQ2xvc2Ugdmlld1wiLFxuICAgICAgICAgICAgMyA6IFwiRGlzdGFudCB2aWV3XCJcbiAgICAgICAgfSxcbiAgICAgICAgRmlsZVNvdXJjZSA6IHtcbiAgICAgICAgICAgIDMgOiBcIkRTQ1wiXG4gICAgICAgIH0sXG5cbiAgICAgICAgQ29tcG9uZW50cyA6IHtcbiAgICAgICAgICAgIDAgOiBcIlwiLFxuICAgICAgICAgICAgMSA6IFwiWVwiLFxuICAgICAgICAgICAgMiA6IFwiQ2JcIixcbiAgICAgICAgICAgIDMgOiBcIkNyXCIsXG4gICAgICAgICAgICA0IDogXCJSXCIsXG4gICAgICAgICAgICA1IDogXCJHXCIsXG4gICAgICAgICAgICA2IDogXCJCXCJcbiAgICAgICAgfVxuICAgIH07XG5cbiAgICBmdW5jdGlvbiBhZGRFdmVudChlbGVtZW50LCBldmVudCwgaGFuZGxlcikge1xuICAgICAgICBpZiAoZWxlbWVudC5hZGRFdmVudExpc3RlbmVyKSB7XG4gICAgICAgICAgICBlbGVtZW50LmFkZEV2ZW50TGlzdGVuZXIoZXZlbnQsIGhhbmRsZXIsIGZhbHNlKTtcbiAgICAgICAgfSBlbHNlIGlmIChlbGVtZW50LmF0dGFjaEV2ZW50KSB7XG4gICAgICAgICAgICBlbGVtZW50LmF0dGFjaEV2ZW50KFwib25cIiArIGV2ZW50LCBoYW5kbGVyKTtcbiAgICAgICAgfVxuICAgIH1cblxuICAgIGZ1bmN0aW9uIGltYWdlSGFzRGF0YShpbWcpIHtcbiAgICAgICAgcmV0dXJuICEhKGltZy5leGlmZGF0YSk7XG4gICAgfVxuXG5cbiAgICBmdW5jdGlvbiBiYXNlNjRUb0FycmF5QnVmZmVyKGJhc2U2NCwgY29udGVudFR5cGUpIHtcbiAgICAgICAgY29udGVudFR5cGUgPSBjb250ZW50VHlwZSB8fCBiYXNlNjQubWF0Y2goL15kYXRhXFw6KFteXFw7XSspXFw7YmFzZTY0LC9taSlbMV0gfHwgJyc7IC8vIGUuZy4gJ2RhdGE6aW1hZ2UvanBlZztiYXNlNjQsLi4uJyA9PiAnaW1hZ2UvanBlZydcbiAgICAgICAgYmFzZTY0ID0gYmFzZTY0LnJlcGxhY2UoL15kYXRhXFw6KFteXFw7XSspXFw7YmFzZTY0LC9nbWksICcnKTtcbiAgICAgICAgdmFyIGJpbmFyeSA9IGF0b2IoYmFzZTY0KTtcbiAgICAgICAgdmFyIGxlbiA9IGJpbmFyeS5sZW5ndGg7XG4gICAgICAgIHZhciBidWZmZXIgPSBuZXcgQXJyYXlCdWZmZXIobGVuKTtcbiAgICAgICAgdmFyIHZpZXcgPSBuZXcgVWludDhBcnJheShidWZmZXIpO1xuICAgICAgICBmb3IgKHZhciBpID0gMDsgaSA8IGxlbjsgaSsrKSB7XG4gICAgICAgICAgICB2aWV3W2ldID0gYmluYXJ5LmNoYXJDb2RlQXQoaSk7XG4gICAgICAgIH1cbiAgICAgICAgcmV0dXJuIGJ1ZmZlcjtcbiAgICB9XG5cbiAgICBmdW5jdGlvbiBvYmplY3RVUkxUb0Jsb2IodXJsLCBjYWxsYmFjaykge1xuICAgICAgICB2YXIgaHR0cCA9IG5ldyBYTUxIdHRwUmVxdWVzdCgpO1xuICAgICAgICBodHRwLm9wZW4oXCJHRVRcIiwgdXJsLCB0cnVlKTtcbiAgICAgICAgaHR0cC5yZXNwb25zZVR5cGUgPSBcImJsb2JcIjtcbiAgICAgICAgaHR0cC5vbmxvYWQgPSBmdW5jdGlvbihlKSB7XG4gICAgICAgICAgICBpZiAodGhpcy5zdGF0dXMgPT0gMjAwIHx8IHRoaXMuc3RhdHVzID09PSAwKSB7XG4gICAgICAgICAgICAgICAgY2FsbGJhY2sodGhpcy5yZXNwb25zZSk7XG4gICAgICAgICAgICB9XG4gICAgICAgIH07XG4gICAgICAgIGh0dHAuc2VuZCgpO1xuICAgIH1cblxuICAgIGZ1bmN0aW9uIGdldEltYWdlRGF0YShpbWcsIGNhbGxiYWNrKSB7XG4gICAgICAgIGZ1bmN0aW9uIGhhbmRsZUJpbmFyeUZpbGUoYmluRmlsZSkge1xuICAgICAgICAgICAgdmFyIGRhdGEgPSBmaW5kRVhJRmluSlBFRyhiaW5GaWxlKTtcbiAgICAgICAgICAgIHZhciBpcHRjZGF0YSA9IGZpbmRJUFRDaW5KUEVHKGJpbkZpbGUpO1xuICAgICAgICAgICAgaW1nLmV4aWZkYXRhID0gZGF0YSB8fCB7fTtcbiAgICAgICAgICAgIGltZy5pcHRjZGF0YSA9IGlwdGNkYXRhIHx8IHt9O1xuICAgICAgICAgICAgaWYgKGNhbGxiYWNrKSB7XG4gICAgICAgICAgICAgICAgY2FsbGJhY2suY2FsbChpbWcpO1xuICAgICAgICAgICAgfVxuICAgICAgICB9XG5cbiAgICAgICAgaWYgKGltZy5zcmMpIHtcbiAgICAgICAgICAgIGlmICgvXmRhdGFcXDovaS50ZXN0KGltZy5zcmMpKSB7IC8vIERhdGEgVVJJXG4gICAgICAgICAgICAgICAgdmFyIGFycmF5QnVmZmVyID0gYmFzZTY0VG9BcnJheUJ1ZmZlcihpbWcuc3JjKTtcbiAgICAgICAgICAgICAgICBoYW5kbGVCaW5hcnlGaWxlKGFycmF5QnVmZmVyKTtcblxuICAgICAgICAgICAgfSBlbHNlIGlmICgvXmJsb2JcXDovaS50ZXN0KGltZy5zcmMpKSB7IC8vIE9iamVjdCBVUkxcbiAgICAgICAgICAgICAgICB2YXIgZmlsZVJlYWRlciA9IG5ldyBGaWxlUmVhZGVyKCk7XG4gICAgICAgICAgICAgICAgZmlsZVJlYWRlci5vbmxvYWQgPSBmdW5jdGlvbihlKSB7XG4gICAgICAgICAgICAgICAgICAgIGhhbmRsZUJpbmFyeUZpbGUoZS50YXJnZXQucmVzdWx0KTtcbiAgICAgICAgICAgICAgICB9O1xuICAgICAgICAgICAgICAgIG9iamVjdFVSTFRvQmxvYihpbWcuc3JjLCBmdW5jdGlvbiAoYmxvYikge1xuICAgICAgICAgICAgICAgICAgICBmaWxlUmVhZGVyLnJlYWRBc0FycmF5QnVmZmVyKGJsb2IpO1xuICAgICAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICB2YXIgaHR0cCA9IG5ldyBYTUxIdHRwUmVxdWVzdCgpO1xuICAgICAgICAgICAgICAgIGh0dHAub25sb2FkID0gZnVuY3Rpb24oKSB7XG4gICAgICAgICAgICAgICAgICAgIGlmICh0aGlzLnN0YXR1cyA9PSAyMDAgfHwgdGhpcy5zdGF0dXMgPT09IDApIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIGhhbmRsZUJpbmFyeUZpbGUoaHR0cC5yZXNwb25zZSk7XG4gICAgICAgICAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgICAgICAgICB0aHJvdyBcIkNvdWxkIG5vdCBsb2FkIGltYWdlXCI7XG4gICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgaHR0cCA9IG51bGw7XG4gICAgICAgICAgICAgICAgfTtcbiAgICAgICAgICAgICAgICBodHRwLm9wZW4oXCJHRVRcIiwgaW1nLnNyYywgdHJ1ZSk7XG4gICAgICAgICAgICAgICAgaHR0cC5yZXNwb25zZVR5cGUgPSBcImFycmF5YnVmZmVyXCI7XG4gICAgICAgICAgICAgICAgaHR0cC5zZW5kKG51bGwpO1xuICAgICAgICAgICAgfVxuICAgICAgICB9IGVsc2UgaWYgKHdpbmRvdy5GaWxlUmVhZGVyICYmIChpbWcgaW5zdGFuY2VvZiB3aW5kb3cuQmxvYiB8fCBpbWcgaW5zdGFuY2VvZiB3aW5kb3cuRmlsZSkpIHtcbiAgICAgICAgICAgIHZhciBmaWxlUmVhZGVyID0gbmV3IEZpbGVSZWFkZXIoKTtcbiAgICAgICAgICAgIGZpbGVSZWFkZXIub25sb2FkID0gZnVuY3Rpb24oZSkge1xuICAgICAgICAgICAgICAgIGlmIChkZWJ1ZykgY29uc29sZS5sb2coXCJHb3QgZmlsZSBvZiBsZW5ndGggXCIgKyBlLnRhcmdldC5yZXN1bHQuYnl0ZUxlbmd0aCk7XG4gICAgICAgICAgICAgICAgaGFuZGxlQmluYXJ5RmlsZShlLnRhcmdldC5yZXN1bHQpO1xuICAgICAgICAgICAgfTtcblxuICAgICAgICAgICAgZmlsZVJlYWRlci5yZWFkQXNBcnJheUJ1ZmZlcihpbWcpO1xuICAgICAgICB9XG4gICAgfVxuXG4gICAgZnVuY3Rpb24gZmluZEVYSUZpbkpQRUcoZmlsZSkge1xuICAgICAgICB2YXIgZGF0YVZpZXcgPSBuZXcgRGF0YVZpZXcoZmlsZSk7XG5cbiAgICAgICAgaWYgKGRlYnVnKSBjb25zb2xlLmxvZyhcIkdvdCBmaWxlIG9mIGxlbmd0aCBcIiArIGZpbGUuYnl0ZUxlbmd0aCk7XG4gICAgICAgIGlmICgoZGF0YVZpZXcuZ2V0VWludDgoMCkgIT0gMHhGRikgfHwgKGRhdGFWaWV3LmdldFVpbnQ4KDEpICE9IDB4RDgpKSB7XG4gICAgICAgICAgICBpZiAoZGVidWcpIGNvbnNvbGUubG9nKFwiTm90IGEgdmFsaWQgSlBFR1wiKTtcbiAgICAgICAgICAgIHJldHVybiBmYWxzZTsgLy8gbm90IGEgdmFsaWQganBlZ1xuICAgICAgICB9XG5cbiAgICAgICAgdmFyIG9mZnNldCA9IDIsXG4gICAgICAgICAgICBsZW5ndGggPSBmaWxlLmJ5dGVMZW5ndGgsXG4gICAgICAgICAgICBtYXJrZXI7XG5cbiAgICAgICAgd2hpbGUgKG9mZnNldCA8IGxlbmd0aCkge1xuICAgICAgICAgICAgaWYgKGRhdGFWaWV3LmdldFVpbnQ4KG9mZnNldCkgIT0gMHhGRikge1xuICAgICAgICAgICAgICAgIGlmIChkZWJ1ZykgY29uc29sZS5sb2coXCJOb3QgYSB2YWxpZCBtYXJrZXIgYXQgb2Zmc2V0IFwiICsgb2Zmc2V0ICsgXCIsIGZvdW5kOiBcIiArIGRhdGFWaWV3LmdldFVpbnQ4KG9mZnNldCkpO1xuICAgICAgICAgICAgICAgIHJldHVybiBmYWxzZTsgLy8gbm90IGEgdmFsaWQgbWFya2VyLCBzb21ldGhpbmcgaXMgd3JvbmdcbiAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgbWFya2VyID0gZGF0YVZpZXcuZ2V0VWludDgob2Zmc2V0ICsgMSk7XG4gICAgICAgICAgICBpZiAoZGVidWcpIGNvbnNvbGUubG9nKG1hcmtlcik7XG5cbiAgICAgICAgICAgIC8vIHdlIGNvdWxkIGltcGxlbWVudCBoYW5kbGluZyBmb3Igb3RoZXIgbWFya2VycyBoZXJlLFxuICAgICAgICAgICAgLy8gYnV0IHdlJ3JlIG9ubHkgbG9va2luZyBmb3IgMHhGRkUxIGZvciBFWElGIGRhdGFcblxuICAgICAgICAgICAgaWYgKG1hcmtlciA9PSAyMjUpIHtcbiAgICAgICAgICAgICAgICBpZiAoZGVidWcpIGNvbnNvbGUubG9nKFwiRm91bmQgMHhGRkUxIG1hcmtlclwiKTtcblxuICAgICAgICAgICAgICAgIHJldHVybiByZWFkRVhJRkRhdGEoZGF0YVZpZXcsIG9mZnNldCArIDQsIGRhdGFWaWV3LmdldFVpbnQxNihvZmZzZXQgKyAyKSAtIDIpO1xuXG4gICAgICAgICAgICAgICAgLy8gb2Zmc2V0ICs9IDIgKyBmaWxlLmdldFNob3J0QXQob2Zmc2V0KzIsIHRydWUpO1xuXG4gICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgIG9mZnNldCArPSAyICsgZGF0YVZpZXcuZ2V0VWludDE2KG9mZnNldCsyKTtcbiAgICAgICAgICAgIH1cblxuICAgICAgICB9XG5cbiAgICB9XG5cbiAgICBmdW5jdGlvbiBmaW5kSVBUQ2luSlBFRyhmaWxlKSB7XG4gICAgICAgIHZhciBkYXRhVmlldyA9IG5ldyBEYXRhVmlldyhmaWxlKTtcblxuICAgICAgICBpZiAoZGVidWcpIGNvbnNvbGUubG9nKFwiR290IGZpbGUgb2YgbGVuZ3RoIFwiICsgZmlsZS5ieXRlTGVuZ3RoKTtcbiAgICAgICAgaWYgKChkYXRhVmlldy5nZXRVaW50OCgwKSAhPSAweEZGKSB8fCAoZGF0YVZpZXcuZ2V0VWludDgoMSkgIT0gMHhEOCkpIHtcbiAgICAgICAgICAgIGlmIChkZWJ1ZykgY29uc29sZS5sb2coXCJOb3QgYSB2YWxpZCBKUEVHXCIpO1xuICAgICAgICAgICAgcmV0dXJuIGZhbHNlOyAvLyBub3QgYSB2YWxpZCBqcGVnXG4gICAgICAgIH1cblxuICAgICAgICB2YXIgb2Zmc2V0ID0gMixcbiAgICAgICAgICAgIGxlbmd0aCA9IGZpbGUuYnl0ZUxlbmd0aDtcblxuXG4gICAgICAgIHZhciBpc0ZpZWxkU2VnbWVudFN0YXJ0ID0gZnVuY3Rpb24oZGF0YVZpZXcsIG9mZnNldCl7XG4gICAgICAgICAgICByZXR1cm4gKFxuICAgICAgICAgICAgICAgIGRhdGFWaWV3LmdldFVpbnQ4KG9mZnNldCkgPT09IDB4MzggJiZcbiAgICAgICAgICAgICAgICBkYXRhVmlldy5nZXRVaW50OChvZmZzZXQrMSkgPT09IDB4NDIgJiZcbiAgICAgICAgICAgICAgICBkYXRhVmlldy5nZXRVaW50OChvZmZzZXQrMikgPT09IDB4NDkgJiZcbiAgICAgICAgICAgICAgICBkYXRhVmlldy5nZXRVaW50OChvZmZzZXQrMykgPT09IDB4NEQgJiZcbiAgICAgICAgICAgICAgICBkYXRhVmlldy5nZXRVaW50OChvZmZzZXQrNCkgPT09IDB4MDQgJiZcbiAgICAgICAgICAgICAgICBkYXRhVmlldy5nZXRVaW50OChvZmZzZXQrNSkgPT09IDB4MDRcbiAgICAgICAgICAgICk7XG4gICAgICAgIH07XG5cbiAgICAgICAgd2hpbGUgKG9mZnNldCA8IGxlbmd0aCkge1xuXG4gICAgICAgICAgICBpZiAoIGlzRmllbGRTZWdtZW50U3RhcnQoZGF0YVZpZXcsIG9mZnNldCApKXtcblxuICAgICAgICAgICAgICAgIC8vIEdldCB0aGUgbGVuZ3RoIG9mIHRoZSBuYW1lIGhlYWRlciAod2hpY2ggaXMgcGFkZGVkIHRvIGFuIGV2ZW4gbnVtYmVyIG9mIGJ5dGVzKVxuICAgICAgICAgICAgICAgIHZhciBuYW1lSGVhZGVyTGVuZ3RoID0gZGF0YVZpZXcuZ2V0VWludDgob2Zmc2V0KzcpO1xuICAgICAgICAgICAgICAgIGlmKG5hbWVIZWFkZXJMZW5ndGggJSAyICE9PSAwKSBuYW1lSGVhZGVyTGVuZ3RoICs9IDE7XG4gICAgICAgICAgICAgICAgLy8gQ2hlY2sgZm9yIHByZSBwaG90b3Nob3AgNiBmb3JtYXRcbiAgICAgICAgICAgICAgICBpZihuYW1lSGVhZGVyTGVuZ3RoID09PSAwKSB7XG4gICAgICAgICAgICAgICAgICAgIC8vIEFsd2F5cyA0XG4gICAgICAgICAgICAgICAgICAgIG5hbWVIZWFkZXJMZW5ndGggPSA0O1xuICAgICAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgICAgIHZhciBzdGFydE9mZnNldCA9IG9mZnNldCArIDggKyBuYW1lSGVhZGVyTGVuZ3RoO1xuICAgICAgICAgICAgICAgIHZhciBzZWN0aW9uTGVuZ3RoID0gZGF0YVZpZXcuZ2V0VWludDE2KG9mZnNldCArIDYgKyBuYW1lSGVhZGVyTGVuZ3RoKTtcblxuICAgICAgICAgICAgICAgIHJldHVybiByZWFkSVBUQ0RhdGEoZmlsZSwgc3RhcnRPZmZzZXQsIHNlY3Rpb25MZW5ndGgpO1xuXG4gICAgICAgICAgICAgICAgYnJlYWs7XG5cbiAgICAgICAgICAgIH1cblxuXG4gICAgICAgICAgICAvLyBOb3QgdGhlIG1hcmtlciwgY29udGludWUgc2VhcmNoaW5nXG4gICAgICAgICAgICBvZmZzZXQrKztcblxuICAgICAgICB9XG5cbiAgICB9XG4gICAgdmFyIElwdGNGaWVsZE1hcCA9IHtcbiAgICAgICAgMHg3OCA6ICdjYXB0aW9uJyxcbiAgICAgICAgMHg2RSA6ICdjcmVkaXQnLFxuICAgICAgICAweDE5IDogJ2tleXdvcmRzJyxcbiAgICAgICAgMHgzNyA6ICdkYXRlQ3JlYXRlZCcsXG4gICAgICAgIDB4NTAgOiAnYnlsaW5lJyxcbiAgICAgICAgMHg1NSA6ICdieWxpbmVUaXRsZScsXG4gICAgICAgIDB4N0EgOiAnY2FwdGlvbldyaXRlcicsXG4gICAgICAgIDB4NjkgOiAnaGVhZGxpbmUnLFxuICAgICAgICAweDc0IDogJ2NvcHlyaWdodCcsXG4gICAgICAgIDB4MEYgOiAnY2F0ZWdvcnknXG4gICAgfTtcbiAgICBmdW5jdGlvbiByZWFkSVBUQ0RhdGEoZmlsZSwgc3RhcnRPZmZzZXQsIHNlY3Rpb25MZW5ndGgpe1xuICAgICAgICB2YXIgZGF0YVZpZXcgPSBuZXcgRGF0YVZpZXcoZmlsZSk7XG4gICAgICAgIHZhciBkYXRhID0ge307XG4gICAgICAgIHZhciBmaWVsZFZhbHVlLCBmaWVsZE5hbWUsIGRhdGFTaXplLCBzZWdtZW50VHlwZSwgc2VnbWVudFNpemU7XG4gICAgICAgIHZhciBzZWdtZW50U3RhcnRQb3MgPSBzdGFydE9mZnNldDtcbiAgICAgICAgd2hpbGUoc2VnbWVudFN0YXJ0UG9zIDwgc3RhcnRPZmZzZXQrc2VjdGlvbkxlbmd0aCkge1xuICAgICAgICAgICAgaWYoZGF0YVZpZXcuZ2V0VWludDgoc2VnbWVudFN0YXJ0UG9zKSA9PT0gMHgxQyAmJiBkYXRhVmlldy5nZXRVaW50OChzZWdtZW50U3RhcnRQb3MrMSkgPT09IDB4MDIpe1xuICAgICAgICAgICAgICAgIHNlZ21lbnRUeXBlID0gZGF0YVZpZXcuZ2V0VWludDgoc2VnbWVudFN0YXJ0UG9zKzIpO1xuICAgICAgICAgICAgICAgIGlmKHNlZ21lbnRUeXBlIGluIElwdGNGaWVsZE1hcCkge1xuICAgICAgICAgICAgICAgICAgICBkYXRhU2l6ZSA9IGRhdGFWaWV3LmdldEludDE2KHNlZ21lbnRTdGFydFBvcyszKTtcbiAgICAgICAgICAgICAgICAgICAgc2VnbWVudFNpemUgPSBkYXRhU2l6ZSArIDU7XG4gICAgICAgICAgICAgICAgICAgIGZpZWxkTmFtZSA9IElwdGNGaWVsZE1hcFtzZWdtZW50VHlwZV07XG4gICAgICAgICAgICAgICAgICAgIGZpZWxkVmFsdWUgPSBnZXRTdHJpbmdGcm9tREIoZGF0YVZpZXcsIHNlZ21lbnRTdGFydFBvcys1LCBkYXRhU2l6ZSk7XG4gICAgICAgICAgICAgICAgICAgIC8vIENoZWNrIGlmIHdlIGFscmVhZHkgc3RvcmVkIGEgdmFsdWUgd2l0aCB0aGlzIG5hbWVcbiAgICAgICAgICAgICAgICAgICAgaWYoZGF0YS5oYXNPd25Qcm9wZXJ0eShmaWVsZE5hbWUpKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAvLyBWYWx1ZSBhbHJlYWR5IHN0b3JlZCB3aXRoIHRoaXMgbmFtZSwgY3JlYXRlIG11bHRpdmFsdWUgZmllbGRcbiAgICAgICAgICAgICAgICAgICAgICAgIGlmKGRhdGFbZmllbGROYW1lXSBpbnN0YW5jZW9mIEFycmF5KSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgZGF0YVtmaWVsZE5hbWVdLnB1c2goZmllbGRWYWx1ZSk7XG4gICAgICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgICAgICBlbHNlIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBkYXRhW2ZpZWxkTmFtZV0gPSBbZGF0YVtmaWVsZE5hbWVdLCBmaWVsZFZhbHVlXTtcbiAgICAgICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICBlbHNlIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIGRhdGFbZmllbGROYW1lXSA9IGZpZWxkVmFsdWU7XG4gICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICB9XG5cbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIHNlZ21lbnRTdGFydFBvcysrO1xuICAgICAgICB9XG4gICAgICAgIHJldHVybiBkYXRhO1xuICAgIH1cblxuXG5cbiAgICBmdW5jdGlvbiByZWFkVGFncyhmaWxlLCB0aWZmU3RhcnQsIGRpclN0YXJ0LCBzdHJpbmdzLCBiaWdFbmQpIHtcbiAgICAgICAgdmFyIGVudHJpZXMgPSBmaWxlLmdldFVpbnQxNihkaXJTdGFydCwgIWJpZ0VuZCksXG4gICAgICAgICAgICB0YWdzID0ge30sXG4gICAgICAgICAgICBlbnRyeU9mZnNldCwgdGFnLFxuICAgICAgICAgICAgaTtcblxuICAgICAgICBmb3IgKGk9MDtpPGVudHJpZXM7aSsrKSB7XG4gICAgICAgICAgICBlbnRyeU9mZnNldCA9IGRpclN0YXJ0ICsgaSoxMiArIDI7XG4gICAgICAgICAgICB0YWcgPSBzdHJpbmdzW2ZpbGUuZ2V0VWludDE2KGVudHJ5T2Zmc2V0LCAhYmlnRW5kKV07XG4gICAgICAgICAgICBpZiAoIXRhZyAmJiBkZWJ1ZykgY29uc29sZS5sb2coXCJVbmtub3duIHRhZzogXCIgKyBmaWxlLmdldFVpbnQxNihlbnRyeU9mZnNldCwgIWJpZ0VuZCkpO1xuICAgICAgICAgICAgdGFnc1t0YWddID0gcmVhZFRhZ1ZhbHVlKGZpbGUsIGVudHJ5T2Zmc2V0LCB0aWZmU3RhcnQsIGRpclN0YXJ0LCBiaWdFbmQpO1xuICAgICAgICB9XG4gICAgICAgIHJldHVybiB0YWdzO1xuICAgIH1cblxuXG4gICAgZnVuY3Rpb24gcmVhZFRhZ1ZhbHVlKGZpbGUsIGVudHJ5T2Zmc2V0LCB0aWZmU3RhcnQsIGRpclN0YXJ0LCBiaWdFbmQpIHtcbiAgICAgICAgdmFyIHR5cGUgPSBmaWxlLmdldFVpbnQxNihlbnRyeU9mZnNldCsyLCAhYmlnRW5kKSxcbiAgICAgICAgICAgIG51bVZhbHVlcyA9IGZpbGUuZ2V0VWludDMyKGVudHJ5T2Zmc2V0KzQsICFiaWdFbmQpLFxuICAgICAgICAgICAgdmFsdWVPZmZzZXQgPSBmaWxlLmdldFVpbnQzMihlbnRyeU9mZnNldCs4LCAhYmlnRW5kKSArIHRpZmZTdGFydCxcbiAgICAgICAgICAgIG9mZnNldCxcbiAgICAgICAgICAgIHZhbHMsIHZhbCwgbixcbiAgICAgICAgICAgIG51bWVyYXRvciwgZGVub21pbmF0b3I7XG5cbiAgICAgICAgc3dpdGNoICh0eXBlKSB7XG4gICAgICAgICAgICBjYXNlIDE6IC8vIGJ5dGUsIDgtYml0IHVuc2lnbmVkIGludFxuICAgICAgICAgICAgY2FzZSA3OiAvLyB1bmRlZmluZWQsIDgtYml0IGJ5dGUsIHZhbHVlIGRlcGVuZGluZyBvbiBmaWVsZFxuICAgICAgICAgICAgICAgIGlmIChudW1WYWx1ZXMgPT0gMSkge1xuICAgICAgICAgICAgICAgICAgICByZXR1cm4gZmlsZS5nZXRVaW50OChlbnRyeU9mZnNldCArIDgsICFiaWdFbmQpO1xuICAgICAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgICAgIG9mZnNldCA9IG51bVZhbHVlcyA+IDQgPyB2YWx1ZU9mZnNldCA6IChlbnRyeU9mZnNldCArIDgpO1xuICAgICAgICAgICAgICAgICAgICB2YWxzID0gW107XG4gICAgICAgICAgICAgICAgICAgIGZvciAobj0wO248bnVtVmFsdWVzO24rKykge1xuICAgICAgICAgICAgICAgICAgICAgICAgdmFsc1tuXSA9IGZpbGUuZ2V0VWludDgob2Zmc2V0ICsgbik7XG4gICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgcmV0dXJuIHZhbHM7XG4gICAgICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICBjYXNlIDI6IC8vIGFzY2lpLCA4LWJpdCBieXRlXG4gICAgICAgICAgICAgICAgb2Zmc2V0ID0gbnVtVmFsdWVzID4gNCA/IHZhbHVlT2Zmc2V0IDogKGVudHJ5T2Zmc2V0ICsgOCk7XG4gICAgICAgICAgICAgICAgcmV0dXJuIGdldFN0cmluZ0Zyb21EQihmaWxlLCBvZmZzZXQsIG51bVZhbHVlcy0xKTtcblxuICAgICAgICAgICAgY2FzZSAzOiAvLyBzaG9ydCwgMTYgYml0IGludFxuICAgICAgICAgICAgICAgIGlmIChudW1WYWx1ZXMgPT0gMSkge1xuICAgICAgICAgICAgICAgICAgICByZXR1cm4gZmlsZS5nZXRVaW50MTYoZW50cnlPZmZzZXQgKyA4LCAhYmlnRW5kKTtcbiAgICAgICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgICAgICBvZmZzZXQgPSBudW1WYWx1ZXMgPiAyID8gdmFsdWVPZmZzZXQgOiAoZW50cnlPZmZzZXQgKyA4KTtcbiAgICAgICAgICAgICAgICAgICAgdmFscyA9IFtdO1xuICAgICAgICAgICAgICAgICAgICBmb3IgKG49MDtuPG51bVZhbHVlcztuKyspIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIHZhbHNbbl0gPSBmaWxlLmdldFVpbnQxNihvZmZzZXQgKyAyKm4sICFiaWdFbmQpO1xuICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgIHJldHVybiB2YWxzO1xuICAgICAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgY2FzZSA0OiAvLyBsb25nLCAzMiBiaXQgaW50XG4gICAgICAgICAgICAgICAgaWYgKG51bVZhbHVlcyA9PSAxKSB7XG4gICAgICAgICAgICAgICAgICAgIHJldHVybiBmaWxlLmdldFVpbnQzMihlbnRyeU9mZnNldCArIDgsICFiaWdFbmQpO1xuICAgICAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgICAgIHZhbHMgPSBbXTtcbiAgICAgICAgICAgICAgICAgICAgZm9yIChuPTA7bjxudW1WYWx1ZXM7bisrKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICB2YWxzW25dID0gZmlsZS5nZXRVaW50MzIodmFsdWVPZmZzZXQgKyA0Km4sICFiaWdFbmQpO1xuICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgIHJldHVybiB2YWxzO1xuICAgICAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgY2FzZSA1OiAgICAvLyByYXRpb25hbCA9IHR3byBsb25nIHZhbHVlcywgZmlyc3QgaXMgbnVtZXJhdG9yLCBzZWNvbmQgaXMgZGVub21pbmF0b3JcbiAgICAgICAgICAgICAgICBpZiAobnVtVmFsdWVzID09IDEpIHtcbiAgICAgICAgICAgICAgICAgICAgbnVtZXJhdG9yID0gZmlsZS5nZXRVaW50MzIodmFsdWVPZmZzZXQsICFiaWdFbmQpO1xuICAgICAgICAgICAgICAgICAgICBkZW5vbWluYXRvciA9IGZpbGUuZ2V0VWludDMyKHZhbHVlT2Zmc2V0KzQsICFiaWdFbmQpO1xuICAgICAgICAgICAgICAgICAgICB2YWwgPSBuZXcgTnVtYmVyKG51bWVyYXRvciAvIGRlbm9taW5hdG9yKTtcbiAgICAgICAgICAgICAgICAgICAgdmFsLm51bWVyYXRvciA9IG51bWVyYXRvcjtcbiAgICAgICAgICAgICAgICAgICAgdmFsLmRlbm9taW5hdG9yID0gZGVub21pbmF0b3I7XG4gICAgICAgICAgICAgICAgICAgIHJldHVybiB2YWw7XG4gICAgICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICAgICAgdmFscyA9IFtdO1xuICAgICAgICAgICAgICAgICAgICBmb3IgKG49MDtuPG51bVZhbHVlcztuKyspIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIG51bWVyYXRvciA9IGZpbGUuZ2V0VWludDMyKHZhbHVlT2Zmc2V0ICsgOCpuLCAhYmlnRW5kKTtcbiAgICAgICAgICAgICAgICAgICAgICAgIGRlbm9taW5hdG9yID0gZmlsZS5nZXRVaW50MzIodmFsdWVPZmZzZXQrNCArIDgqbiwgIWJpZ0VuZCk7XG4gICAgICAgICAgICAgICAgICAgICAgICB2YWxzW25dID0gbmV3IE51bWJlcihudW1lcmF0b3IgLyBkZW5vbWluYXRvcik7XG4gICAgICAgICAgICAgICAgICAgICAgICB2YWxzW25dLm51bWVyYXRvciA9IG51bWVyYXRvcjtcbiAgICAgICAgICAgICAgICAgICAgICAgIHZhbHNbbl0uZGVub21pbmF0b3IgPSBkZW5vbWluYXRvcjtcbiAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICByZXR1cm4gdmFscztcbiAgICAgICAgICAgICAgICB9XG5cbiAgICAgICAgICAgIGNhc2UgOTogLy8gc2xvbmcsIDMyIGJpdCBzaWduZWQgaW50XG4gICAgICAgICAgICAgICAgaWYgKG51bVZhbHVlcyA9PSAxKSB7XG4gICAgICAgICAgICAgICAgICAgIHJldHVybiBmaWxlLmdldEludDMyKGVudHJ5T2Zmc2V0ICsgOCwgIWJpZ0VuZCk7XG4gICAgICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICAgICAgdmFscyA9IFtdO1xuICAgICAgICAgICAgICAgICAgICBmb3IgKG49MDtuPG51bVZhbHVlcztuKyspIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIHZhbHNbbl0gPSBmaWxlLmdldEludDMyKHZhbHVlT2Zmc2V0ICsgNCpuLCAhYmlnRW5kKTtcbiAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICByZXR1cm4gdmFscztcbiAgICAgICAgICAgICAgICB9XG5cbiAgICAgICAgICAgIGNhc2UgMTA6IC8vIHNpZ25lZCByYXRpb25hbCwgdHdvIHNsb25ncywgZmlyc3QgaXMgbnVtZXJhdG9yLCBzZWNvbmQgaXMgZGVub21pbmF0b3JcbiAgICAgICAgICAgICAgICBpZiAobnVtVmFsdWVzID09IDEpIHtcbiAgICAgICAgICAgICAgICAgICAgcmV0dXJuIGZpbGUuZ2V0SW50MzIodmFsdWVPZmZzZXQsICFiaWdFbmQpIC8gZmlsZS5nZXRJbnQzMih2YWx1ZU9mZnNldCs0LCAhYmlnRW5kKTtcbiAgICAgICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgICAgICB2YWxzID0gW107XG4gICAgICAgICAgICAgICAgICAgIGZvciAobj0wO248bnVtVmFsdWVzO24rKykge1xuICAgICAgICAgICAgICAgICAgICAgICAgdmFsc1tuXSA9IGZpbGUuZ2V0SW50MzIodmFsdWVPZmZzZXQgKyA4Km4sICFiaWdFbmQpIC8gZmlsZS5nZXRJbnQzMih2YWx1ZU9mZnNldCs0ICsgOCpuLCAhYmlnRW5kKTtcbiAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICByZXR1cm4gdmFscztcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICB9XG5cbiAgICBmdW5jdGlvbiBnZXRTdHJpbmdGcm9tREIoYnVmZmVyLCBzdGFydCwgbGVuZ3RoKSB7XG4gICAgICAgIHZhciBvdXRzdHIgPSBcIlwiO1xuICAgICAgICBmb3IgKG4gPSBzdGFydDsgbiA8IHN0YXJ0K2xlbmd0aDsgbisrKSB7XG4gICAgICAgICAgICBvdXRzdHIgKz0gU3RyaW5nLmZyb21DaGFyQ29kZShidWZmZXIuZ2V0VWludDgobikpO1xuICAgICAgICB9XG4gICAgICAgIHJldHVybiBvdXRzdHI7XG4gICAgfVxuXG4gICAgZnVuY3Rpb24gcmVhZEVYSUZEYXRhKGZpbGUsIHN0YXJ0KSB7XG4gICAgICAgIGlmIChnZXRTdHJpbmdGcm9tREIoZmlsZSwgc3RhcnQsIDQpICE9IFwiRXhpZlwiKSB7XG4gICAgICAgICAgICBpZiAoZGVidWcpIGNvbnNvbGUubG9nKFwiTm90IHZhbGlkIEVYSUYgZGF0YSEgXCIgKyBnZXRTdHJpbmdGcm9tREIoZmlsZSwgc3RhcnQsIDQpKTtcbiAgICAgICAgICAgIHJldHVybiBmYWxzZTtcbiAgICAgICAgfVxuXG4gICAgICAgIHZhciBiaWdFbmQsXG4gICAgICAgICAgICB0YWdzLCB0YWcsXG4gICAgICAgICAgICBleGlmRGF0YSwgZ3BzRGF0YSxcbiAgICAgICAgICAgIHRpZmZPZmZzZXQgPSBzdGFydCArIDY7XG5cbiAgICAgICAgLy8gdGVzdCBmb3IgVElGRiB2YWxpZGl0eSBhbmQgZW5kaWFubmVzc1xuICAgICAgICBpZiAoZmlsZS5nZXRVaW50MTYodGlmZk9mZnNldCkgPT0gMHg0OTQ5KSB7XG4gICAgICAgICAgICBiaWdFbmQgPSBmYWxzZTtcbiAgICAgICAgfSBlbHNlIGlmIChmaWxlLmdldFVpbnQxNih0aWZmT2Zmc2V0KSA9PSAweDRENEQpIHtcbiAgICAgICAgICAgIGJpZ0VuZCA9IHRydWU7XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICBpZiAoZGVidWcpIGNvbnNvbGUubG9nKFwiTm90IHZhbGlkIFRJRkYgZGF0YSEgKG5vIDB4NDk0OSBvciAweDRENEQpXCIpO1xuICAgICAgICAgICAgcmV0dXJuIGZhbHNlO1xuICAgICAgICB9XG5cbiAgICAgICAgaWYgKGZpbGUuZ2V0VWludDE2KHRpZmZPZmZzZXQrMiwgIWJpZ0VuZCkgIT0gMHgwMDJBKSB7XG4gICAgICAgICAgICBpZiAoZGVidWcpIGNvbnNvbGUubG9nKFwiTm90IHZhbGlkIFRJRkYgZGF0YSEgKG5vIDB4MDAyQSlcIik7XG4gICAgICAgICAgICByZXR1cm4gZmFsc2U7XG4gICAgICAgIH1cblxuICAgICAgICB2YXIgZmlyc3RJRkRPZmZzZXQgPSBmaWxlLmdldFVpbnQzMih0aWZmT2Zmc2V0KzQsICFiaWdFbmQpO1xuXG4gICAgICAgIGlmIChmaXJzdElGRE9mZnNldCA8IDB4MDAwMDAwMDgpIHtcbiAgICAgICAgICAgIGlmIChkZWJ1ZykgY29uc29sZS5sb2coXCJOb3QgdmFsaWQgVElGRiBkYXRhISAoRmlyc3Qgb2Zmc2V0IGxlc3MgdGhhbiA4KVwiLCBmaWxlLmdldFVpbnQzMih0aWZmT2Zmc2V0KzQsICFiaWdFbmQpKTtcbiAgICAgICAgICAgIHJldHVybiBmYWxzZTtcbiAgICAgICAgfVxuXG4gICAgICAgIHRhZ3MgPSByZWFkVGFncyhmaWxlLCB0aWZmT2Zmc2V0LCB0aWZmT2Zmc2V0ICsgZmlyc3RJRkRPZmZzZXQsIFRpZmZUYWdzLCBiaWdFbmQpO1xuXG4gICAgICAgIGlmICh0YWdzLkV4aWZJRkRQb2ludGVyKSB7XG4gICAgICAgICAgICBleGlmRGF0YSA9IHJlYWRUYWdzKGZpbGUsIHRpZmZPZmZzZXQsIHRpZmZPZmZzZXQgKyB0YWdzLkV4aWZJRkRQb2ludGVyLCBFeGlmVGFncywgYmlnRW5kKTtcbiAgICAgICAgICAgIGZvciAodGFnIGluIGV4aWZEYXRhKSB7XG4gICAgICAgICAgICAgICAgc3dpdGNoICh0YWcpIHtcbiAgICAgICAgICAgICAgICAgICAgY2FzZSBcIkxpZ2h0U291cmNlXCIgOlxuICAgICAgICAgICAgICAgICAgICBjYXNlIFwiRmxhc2hcIiA6XG4gICAgICAgICAgICAgICAgICAgIGNhc2UgXCJNZXRlcmluZ01vZGVcIiA6XG4gICAgICAgICAgICAgICAgICAgIGNhc2UgXCJFeHBvc3VyZVByb2dyYW1cIiA6XG4gICAgICAgICAgICAgICAgICAgIGNhc2UgXCJTZW5zaW5nTWV0aG9kXCIgOlxuICAgICAgICAgICAgICAgICAgICBjYXNlIFwiU2NlbmVDYXB0dXJlVHlwZVwiIDpcbiAgICAgICAgICAgICAgICAgICAgY2FzZSBcIlNjZW5lVHlwZVwiIDpcbiAgICAgICAgICAgICAgICAgICAgY2FzZSBcIkN1c3RvbVJlbmRlcmVkXCIgOlxuICAgICAgICAgICAgICAgICAgICBjYXNlIFwiV2hpdGVCYWxhbmNlXCIgOlxuICAgICAgICAgICAgICAgICAgICBjYXNlIFwiR2FpbkNvbnRyb2xcIiA6XG4gICAgICAgICAgICAgICAgICAgIGNhc2UgXCJDb250cmFzdFwiIDpcbiAgICAgICAgICAgICAgICAgICAgY2FzZSBcIlNhdHVyYXRpb25cIiA6XG4gICAgICAgICAgICAgICAgICAgIGNhc2UgXCJTaGFycG5lc3NcIiA6XG4gICAgICAgICAgICAgICAgICAgIGNhc2UgXCJTdWJqZWN0RGlzdGFuY2VSYW5nZVwiIDpcbiAgICAgICAgICAgICAgICAgICAgY2FzZSBcIkZpbGVTb3VyY2VcIiA6XG4gICAgICAgICAgICAgICAgICAgICAgICBleGlmRGF0YVt0YWddID0gU3RyaW5nVmFsdWVzW3RhZ11bZXhpZkRhdGFbdGFnXV07XG4gICAgICAgICAgICAgICAgICAgICAgICBicmVhaztcblxuICAgICAgICAgICAgICAgICAgICBjYXNlIFwiRXhpZlZlcnNpb25cIiA6XG4gICAgICAgICAgICAgICAgICAgIGNhc2UgXCJGbGFzaHBpeFZlcnNpb25cIiA6XG4gICAgICAgICAgICAgICAgICAgICAgICBleGlmRGF0YVt0YWddID0gU3RyaW5nLmZyb21DaGFyQ29kZShleGlmRGF0YVt0YWddWzBdLCBleGlmRGF0YVt0YWddWzFdLCBleGlmRGF0YVt0YWddWzJdLCBleGlmRGF0YVt0YWddWzNdKTtcbiAgICAgICAgICAgICAgICAgICAgICAgIGJyZWFrO1xuXG4gICAgICAgICAgICAgICAgICAgIGNhc2UgXCJDb21wb25lbnRzQ29uZmlndXJhdGlvblwiIDpcbiAgICAgICAgICAgICAgICAgICAgICAgIGV4aWZEYXRhW3RhZ10gPVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIFN0cmluZ1ZhbHVlcy5Db21wb25lbnRzW2V4aWZEYXRhW3RhZ11bMF1dICtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBTdHJpbmdWYWx1ZXMuQ29tcG9uZW50c1tleGlmRGF0YVt0YWddWzFdXSArXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgU3RyaW5nVmFsdWVzLkNvbXBvbmVudHNbZXhpZkRhdGFbdGFnXVsyXV0gK1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIFN0cmluZ1ZhbHVlcy5Db21wb25lbnRzW2V4aWZEYXRhW3RhZ11bM11dO1xuICAgICAgICAgICAgICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIHRhZ3NbdGFnXSA9IGV4aWZEYXRhW3RhZ107XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cblxuICAgICAgICBpZiAodGFncy5HUFNJbmZvSUZEUG9pbnRlcikge1xuICAgICAgICAgICAgZ3BzRGF0YSA9IHJlYWRUYWdzKGZpbGUsIHRpZmZPZmZzZXQsIHRpZmZPZmZzZXQgKyB0YWdzLkdQU0luZm9JRkRQb2ludGVyLCBHUFNUYWdzLCBiaWdFbmQpO1xuICAgICAgICAgICAgZm9yICh0YWcgaW4gZ3BzRGF0YSkge1xuICAgICAgICAgICAgICAgIHN3aXRjaCAodGFnKSB7XG4gICAgICAgICAgICAgICAgICAgIGNhc2UgXCJHUFNWZXJzaW9uSURcIiA6XG4gICAgICAgICAgICAgICAgICAgICAgICBncHNEYXRhW3RhZ10gPSBncHNEYXRhW3RhZ11bMF0gK1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIFwiLlwiICsgZ3BzRGF0YVt0YWddWzFdICtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBcIi5cIiArIGdwc0RhdGFbdGFnXVsyXSArXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgXCIuXCIgKyBncHNEYXRhW3RhZ11bM107XG4gICAgICAgICAgICAgICAgICAgICAgICBicmVhaztcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgdGFnc1t0YWddID0gZ3BzRGF0YVt0YWddO1xuICAgICAgICAgICAgfVxuICAgICAgICB9XG5cbiAgICAgICAgcmV0dXJuIHRhZ3M7XG4gICAgfVxuXG4gICAgRVhJRi5nZXREYXRhID0gZnVuY3Rpb24oaW1nLCBjYWxsYmFjaykge1xuICAgICAgICBpZiAoKGltZyBpbnN0YW5jZW9mIEltYWdlIHx8IGltZyBpbnN0YW5jZW9mIEhUTUxJbWFnZUVsZW1lbnQpICYmICFpbWcuY29tcGxldGUpIHJldHVybiBmYWxzZTtcblxuICAgICAgICBpZiAoIWltYWdlSGFzRGF0YShpbWcpKSB7XG4gICAgICAgICAgICBnZXRJbWFnZURhdGEoaW1nLCBjYWxsYmFjayk7XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICBpZiAoY2FsbGJhY2spIHtcbiAgICAgICAgICAgICAgICBjYWxsYmFjay5jYWxsKGltZyk7XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICAgICAgcmV0dXJuIHRydWU7XG4gICAgfVxuXG4gICAgRVhJRi5nZXRUYWcgPSBmdW5jdGlvbihpbWcsIHRhZykge1xuICAgICAgICBpZiAoIWltYWdlSGFzRGF0YShpbWcpKSByZXR1cm47XG4gICAgICAgIHJldHVybiBpbWcuZXhpZmRhdGFbdGFnXTtcbiAgICB9XG5cbiAgICBFWElGLmdldEFsbFRhZ3MgPSBmdW5jdGlvbihpbWcpIHtcbiAgICAgICAgaWYgKCFpbWFnZUhhc0RhdGEoaW1nKSkgcmV0dXJuIHt9O1xuICAgICAgICB2YXIgYSxcbiAgICAgICAgICAgIGRhdGEgPSBpbWcuZXhpZmRhdGEsXG4gICAgICAgICAgICB0YWdzID0ge307XG4gICAgICAgIGZvciAoYSBpbiBkYXRhKSB7XG4gICAgICAgICAgICBpZiAoZGF0YS5oYXNPd25Qcm9wZXJ0eShhKSkge1xuICAgICAgICAgICAgICAgIHRhZ3NbYV0gPSBkYXRhW2FdO1xuICAgICAgICAgICAgfVxuICAgICAgICB9XG4gICAgICAgIHJldHVybiB0YWdzO1xuICAgIH1cblxuICAgIEVYSUYucHJldHR5ID0gZnVuY3Rpb24oaW1nKSB7XG4gICAgICAgIGlmICghaW1hZ2VIYXNEYXRhKGltZykpIHJldHVybiBcIlwiO1xuICAgICAgICB2YXIgYSxcbiAgICAgICAgICAgIGRhdGEgPSBpbWcuZXhpZmRhdGEsXG4gICAgICAgICAgICBzdHJQcmV0dHkgPSBcIlwiO1xuICAgICAgICBmb3IgKGEgaW4gZGF0YSkge1xuICAgICAgICAgICAgaWYgKGRhdGEuaGFzT3duUHJvcGVydHkoYSkpIHtcbiAgICAgICAgICAgICAgICBpZiAodHlwZW9mIGRhdGFbYV0gPT0gXCJvYmplY3RcIikge1xuICAgICAgICAgICAgICAgICAgICBpZiAoZGF0YVthXSBpbnN0YW5jZW9mIE51bWJlcikge1xuICAgICAgICAgICAgICAgICAgICAgICAgc3RyUHJldHR5ICs9IGEgKyBcIiA6IFwiICsgZGF0YVthXSArIFwiIFtcIiArIGRhdGFbYV0ubnVtZXJhdG9yICsgXCIvXCIgKyBkYXRhW2FdLmRlbm9taW5hdG9yICsgXCJdXFxyXFxuXCI7XG4gICAgICAgICAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgICAgICAgICBzdHJQcmV0dHkgKz0gYSArIFwiIDogW1wiICsgZGF0YVthXS5sZW5ndGggKyBcIiB2YWx1ZXNdXFxyXFxuXCI7XG4gICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgICAgICBzdHJQcmV0dHkgKz0gYSArIFwiIDogXCIgKyBkYXRhW2FdICsgXCJcXHJcXG5cIjtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICAgICAgcmV0dXJuIHN0clByZXR0eTtcbiAgICB9XG5cbiAgICBFWElGLnJlYWRGcm9tQmluYXJ5RmlsZSA9IGZ1bmN0aW9uKGZpbGUpIHtcbiAgICAgICAgcmV0dXJuIGZpbmRFWElGaW5KUEVHKGZpbGUpO1xuICAgIH1cblxuICAgIGlmICh0eXBlb2YgZGVmaW5lID09PSAnZnVuY3Rpb24nICYmIGRlZmluZS5hbWQpIHtcbiAgICAgICAgZGVmaW5lKCdleGlmLWpzJywgW10sIGZ1bmN0aW9uKCkge1xuICAgICAgICAgICAgcmV0dXJuIEVYSUY7XG4gICAgICAgIH0pO1xuICAgIH1cbn0uY2FsbCh0aGlzKSk7XG5cbiIsInZhciB1dGlsID0gcmVxdWlyZSgnLi91dGlsJyk7XG52YXIgRVhJRiA9IHJlcXVpcmUoJ2V4aWYtanMnKTtcblxudmFyIHRyYW5zbGF0ZUVsZW1lbnQgPSB1dGlsLnRyYW5zbGF0ZUVsZW1lbnQ7XG52YXIgZ2V0RWxlbWVudFRyYW5zbGF0ZSA9IHV0aWwuZ2V0RWxlbWVudFRyYW5zbGF0ZTtcbnZhciBnZXREaXN0YW5jZSA9IHV0aWwuZ2V0VG91Y2hEaXN0YW5jZTtcbnZhciB0cmFuc2xhdGUgPSB1dGlsLnRyYW5zbGF0ZTtcbnZhciBkYXRhVVJJdG9CbG9iID0gdXRpbC5kYXRhVVJJdG9CbG9iO1xudmFyIFVSTEFwaSA9IHdpbmRvdy5jcmVhdGVPYmplY3RVUkwgJiYgd2luZG93IHx8IHdpbmRvdy5VUkwgJiYgVVJMLnJldm9rZU9iamVjdFVSTCAmJiBVUkwgfHwgd2luZG93LndlYmtpdFVSTCAmJiB3ZWJraXRVUkw7XG5cbnZhciBDcm9wcGVyID0gZnVuY3Rpb24oKSB7XG4gIGlmICghKCdvbnRvdWNoc3RhcnQnIGluIHdpbmRvdykpIHtcbiAgICB0aHJvdyBuZXcgRXJyb3IoJ3RoaXMgZGVtbyBzaG91bGQgcnVuIGluIG1vYmlsZSBkZXZpY2UnKTtcbiAgfVxuXG4gIHRoaXMuaW1hZ2VTdGF0ZSA9IHt9O1xufTtcblxuQ3JvcHBlci5wcm90b3R5cGUgPSB7XG4gIGNvbnN0cnVjdG9yOiBDcm9wcGVyLFxuXG4gIHNldEltYWdlOiBmdW5jdGlvbihzcmMsIGZpbGUpIHtcbiAgICB2YXIgc2VsZiA9IHRoaXM7XG4gICAgc2VsZi5pbWFnZUxvYWRpbmcgPSB0cnVlO1xuICAgIHNlbGYuaW1hZ2UgPSBzcmM7XG5cbiAgICBzZWxmLnJlc2V0U2l6ZSgpO1xuXG4gICAgdmFyIHVybDtcbiAgICBpZiAoZmlsZSkge1xuICAgICAgdXJsID0gVVJMQXBpLmNyZWF0ZU9iamVjdFVSTChmaWxlKTtcbiAgICB9XG5cbiAgICB2YXIgaW1hZ2UgPSBuZXcgSW1hZ2UoKTtcblxuICAgIGltYWdlLm9ubG9hZCA9IGZ1bmN0aW9uKCkge1xuICAgICAgdmFyIHNlbGZJbWFnZSA9IHNlbGYucmVmcy5pbWFnZTtcblxuICAgICAgbG9hZEltYWdlLnBhcnNlTWV0YURhdGEoZmlsZSwgZnVuY3Rpb24oZGF0YSkge1xuICAgICAgICB2YXIgb3JpZW50YXRpb247XG4gICAgICAgIGlmIChkYXRhLmV4aWYpIHtcbiAgICAgICAgICBvcmllbnRhdGlvbiA9IGRhdGEuZXhpZlsweDAxMTJdO1xuICAgICAgICB9XG5cbiAgICAgICAgc2VsZkltYWdlLnNyYyA9IHNyYztcbiAgICAgICAgc2VsZi5vcmllbnRhdGlvbiA9IG9yaWVudGF0aW9uO1xuXG4gICAgICAgIHZhciBvcmlnaW5hbFdpZHRoLCBvcmlnaW5hbEhlaWdodDtcblxuICAgICAgICBzZWxmLmltYWdlU3RhdGUubGVmdCA9IHNlbGYuaW1hZ2VTdGF0ZS50b3AgPSAwO1xuXG4gICAgICAgIGlmIChcIjU2NzhcIi5pbmRleE9mKG9yaWVudGF0aW9uKSA+IC0xKSB7XG4gICAgICAgICAgb3JpZ2luYWxXaWR0aCA9IGltYWdlLmhlaWdodDtcbiAgICAgICAgICBvcmlnaW5hbEhlaWdodCA9IGltYWdlLndpZHRoO1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgIG9yaWdpbmFsV2lkdGggPSBpbWFnZS53aWR0aDtcbiAgICAgICAgICBvcmlnaW5hbEhlaWdodCA9IGltYWdlLmhlaWdodDtcbiAgICAgICAgfVxuXG4gICAgICAgIHNlbGYuaW1hZ2VTdGF0ZS53aWR0aCA9IG9yaWdpbmFsV2lkdGg7XG4gICAgICAgIHNlbGYuaW1hZ2VTdGF0ZS5oZWlnaHQgPSBvcmlnaW5hbEhlaWdodDtcblxuICAgICAgICBzZWxmLmluaXRTY2FsZSgpO1xuXG4gICAgICAgIHZhciBtaW5TY2FsZSA9IHNlbGYuc2NhbGVSYW5nZVswXTtcbiAgICAgICAgdmFyIGltYWdlV2lkdGggPSBtaW5TY2FsZSAqIG9yaWdpbmFsV2lkdGg7XG4gICAgICAgIHZhciBpbWFnZUhlaWdodCA9IG1pblNjYWxlICogb3JpZ2luYWxIZWlnaHQ7XG4gICAgICAgIHNlbGZJbWFnZS5zdHlsZS53aWR0aCA9IGltYWdlV2lkdGggKyAncHgnO1xuICAgICAgICBzZWxmSW1hZ2Uuc3R5bGUuaGVpZ2h0ID0gaW1hZ2VIZWlnaHQgKyAncHgnO1xuXG4gICAgICAgIHZhciBpbWFnZUxlZnQsIGltYWdlVG9wO1xuXG4gICAgICAgIHZhciBjcm9wQm94UmVjdCA9IHNlbGYuY3JvcEJveFJlY3Q7XG5cbiAgICAgICAgaWYgKG9yaWdpbmFsV2lkdGggPiBvcmlnaW5hbEhlaWdodCkge1xuICAgICAgICAgIGltYWdlTGVmdCA9IChjcm9wQm94UmVjdC53aWR0aCAtIGltYWdlV2lkdGgpIC8gMiArY3JvcEJveFJlY3QubGVmdDtcbiAgICAgICAgICBpbWFnZVRvcCA9IGNyb3BCb3hSZWN0LnRvcDtcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICBpbWFnZUxlZnQgPSBjcm9wQm94UmVjdC5sZWZ0O1xuICAgICAgICAgIGltYWdlVG9wID0gKGNyb3BCb3hSZWN0LmhlaWdodCAtIGltYWdlSGVpZ2h0KSAvIDIgKyBjcm9wQm94UmVjdC50b3A7XG4gICAgICAgIH1cblxuICAgICAgICBzZWxmLm1vdmVJbWFnZShpbWFnZUxlZnQsIGltYWdlVG9wKTtcblxuICAgICAgICBzZWxmLmltYWdlTG9hZGluZyA9IGZhbHNlO1xuICAgICAgfSk7XG4gICAgfTtcbiAgICBpbWFnZS5zcmMgPSB1cmwgfHwgc3JjO1xuICB9LFxuXG4gIGdldEZvY2FsUG9pbnQ6IGZ1bmN0aW9uKGV2ZW50KSB7XG4gICAgdmFyIGZvY2FsUG9pbnQgPSB7XG4gICAgICBsZWZ0OiAoZXZlbnQudG91Y2hlc1swXS5wYWdlWCArIGV2ZW50LnRvdWNoZXNbMV0ucGFnZVgpIC8gMixcbiAgICAgIHRvcDogKGV2ZW50LnRvdWNoZXNbMF0ucGFnZVkgKyBldmVudC50b3VjaGVzWzFdLnBhZ2VZKSAvIDJcbiAgICB9O1xuXG4gICAgdmFyIGltYWdlU3RhdGUgPSB0aGlzLmltYWdlU3RhdGU7XG4gICAgdmFyIGNyb3BCb3hSZWN0ID0gdGhpcy5jcm9wQm94UmVjdDtcblxuICAgIGZvY2FsUG9pbnQubGVmdCAtPSBjcm9wQm94UmVjdC5sZWZ0ICsgaW1hZ2VTdGF0ZS5sZWZ0O1xuICAgIGZvY2FsUG9pbnQudG9wIC09IGNyb3BCb3hSZWN0LnRvcCArIGltYWdlU3RhdGUudG9wO1xuXG4gICAgcmV0dXJuIGZvY2FsUG9pbnQ7XG4gIH0sXG5cbiAgcmVuZGVyOiBmdW5jdGlvbihwYXJlbnROb2RlKSB7XG4gICAgdmFyIGVsZW1lbnQgPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KCdkaXYnKTtcbiAgICBlbGVtZW50LmNsYXNzTmFtZSA9ICdjcm9wcGVyJztcblxuICAgIHZhciBjb3ZlclN0YXJ0ID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudCgnZGl2Jyk7XG4gICAgdmFyIGNvdmVyRW5kID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudCgnZGl2Jyk7XG4gICAgdmFyIGNyb3BCb3ggPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KCdkaXYnKTtcbiAgICB2YXIgaW1hZ2UgPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KCdpbWcnKTtcblxuICAgIGNvdmVyU3RhcnQuY2xhc3NOYW1lID0gJ2NvdmVyIGNvdmVyLXN0YXJ0JztcbiAgICBjb3ZlckVuZC5jbGFzc05hbWUgPSAnY292ZXIgY292ZXItZW5kJztcbiAgICBjcm9wQm94LmNsYXNzTmFtZSA9ICdjcm9wLWJveCc7XG5cbiAgICBlbGVtZW50LmFwcGVuZENoaWxkKGNvdmVyU3RhcnQpO1xuICAgIGVsZW1lbnQuYXBwZW5kQ2hpbGQoY292ZXJFbmQpO1xuICAgIGVsZW1lbnQuYXBwZW5kQ2hpbGQoY3JvcEJveCk7XG4gICAgZWxlbWVudC5hcHBlbmRDaGlsZChpbWFnZSk7XG5cbiAgICB0aGlzLnJlZnMgPSB7XG4gICAgICBlbGVtZW50OiBlbGVtZW50LFxuICAgICAgY292ZXJTdGFydDogY292ZXJTdGFydCxcbiAgICAgIGNvdmVyRW5kOiBjb3ZlckVuZCxcbiAgICAgIGNyb3BCb3g6IGNyb3BCb3gsXG4gICAgICBpbWFnZTogaW1hZ2VcbiAgICB9O1xuXG4gICAgaWYgKHBhcmVudE5vZGUpIHtcbiAgICAgIHBhcmVudE5vZGUuYXBwZW5kQ2hpbGQoZWxlbWVudCk7XG4gICAgfVxuXG4gICAgaWYgKGVsZW1lbnQub2Zmc2V0SGVpZ2h0ID4gMCkge1xuICAgICAgdGhpcy5yZXNldFNpemUoKTtcbiAgICB9XG5cbiAgICB0aGlzLmJpbmRFdmVudHMoKTtcbiAgfSxcblxuICBpbml0U2NhbGU6IGZ1bmN0aW9uICgpIHtcbiAgICB2YXIgY3JvcEJveFJlY3QgPSB0aGlzLmNyb3BCb3hSZWN0O1xuICAgIHZhciB3aWR0aCA9IHRoaXMuaW1hZ2VTdGF0ZS53aWR0aDtcbiAgICB2YXIgaGVpZ2h0ID0gdGhpcy5pbWFnZVN0YXRlLmhlaWdodDtcbiAgICB2YXIgc2NhbGUsIG1pblNjYWxlO1xuXG4gICAgaWYgKHdpZHRoID4gaGVpZ2h0KSB7XG4gICAgICBzY2FsZSA9IHRoaXMuaW1hZ2VTdGF0ZS5zY2FsZSA9IGNyb3BCb3hSZWN0LmhlaWdodCAvIGhlaWdodDtcbiAgICAgIG1pblNjYWxlID0gY3JvcEJveFJlY3QuaGVpZ2h0ICogMC44IC8gaGVpZ2h0O1xuICAgIH0gZWxzZSB7XG4gICAgICBzY2FsZSA9IHRoaXMuaW1hZ2VTdGF0ZS5zY2FsZSA9IGNyb3BCb3hSZWN0LndpZHRoIC8gd2lkdGg7XG4gICAgICBtaW5TY2FsZSA9IGNyb3BCb3hSZWN0LndpZHRoICogMC44IC8gd2lkdGg7XG4gICAgfVxuXG4gICAgdGhpcy5zY2FsZVJhbmdlID0gW3NjYWxlLCAyXTtcbiAgICB0aGlzLmJvdW5jZVNjYWxlUmFuZ2UgPSBbbWluU2NhbGUsIDNdO1xuICB9LFxuXG4gIHJlc2V0U2l6ZTogZnVuY3Rpb24oKSB7XG4gICAgdmFyIHJlZnMgPSB0aGlzLnJlZnM7XG4gICAgaWYgKCFyZWZzKSByZXR1cm47XG5cbiAgICB2YXIgZWxlbWVudCA9IHJlZnMuZWxlbWVudDtcbiAgICB2YXIgY3JvcEJveCA9IHJlZnMuY3JvcEJveDtcbiAgICB2YXIgY292ZXJTdGFydCA9IHJlZnMuY292ZXJTdGFydDtcbiAgICB2YXIgY292ZXJFbmQgPSByZWZzLmNvdmVyRW5kO1xuXG4gICAgdmFyIHdpZHRoID0gZWxlbWVudC5vZmZzZXRXaWR0aDtcbiAgICB2YXIgaGVpZ2h0ID0gZWxlbWVudC5vZmZzZXRIZWlnaHQ7XG5cbiAgICBpZiAod2lkdGggPiBoZWlnaHQpIHtcbiAgICAgIGVsZW1lbnQuY2xhc3NOYW1lID0gJ2Nyb3BwZXIgY3JvcHBlci1ob3Jpem9udGFsJztcblxuICAgICAgY292ZXJTdGFydC5zdHlsZS53aWR0aCA9IGNvdmVyRW5kLnN0eWxlLndpZHRoID0gKHdpZHRoIC0gaGVpZ2h0KSAvIDIgKyAncHgnO1xuICAgICAgY292ZXJTdGFydC5zdHlsZS5oZWlnaHQgPSBjb3ZlckVuZC5zdHlsZS5oZWlnaHQgPSAnJztcbiAgICAgIGNyb3BCb3guc3R5bGUud2lkdGggPSBjcm9wQm94LnN0eWxlLmhlaWdodCA9IGhlaWdodCArICdweCc7XG4gICAgfSBlbHNlIHtcbiAgICAgIGVsZW1lbnQuY2xhc3NOYW1lID0gJ2Nyb3BwZXInO1xuXG4gICAgICBjb3ZlclN0YXJ0LnN0eWxlLmhlaWdodCA9IGNvdmVyRW5kLnN0eWxlLmhlaWdodCA9IChoZWlnaHQgLSB3aWR0aCkgLyAyICsgJ3B4JztcbiAgICAgIGNvdmVyU3RhcnQuc3R5bGUud2lkdGggPSBjb3ZlckVuZC5zdHlsZS53aWR0aCA9ICcnO1xuICAgICAgY3JvcEJveC5zdHlsZS53aWR0aCA9IGNyb3BCb3guc3R5bGUuaGVpZ2h0ID0gd2lkdGggKyAncHgnO1xuICAgIH1cblxuICAgIHZhciBlbGVtZW50UmVjdCA9IGVsZW1lbnQuZ2V0Qm91bmRpbmdDbGllbnRSZWN0KCk7XG4gICAgdmFyIGNyb3BCb3hSZWN0ID0gY3JvcEJveC5nZXRCb3VuZGluZ0NsaWVudFJlY3QoKTtcblxuICAgIHRoaXMuY3JvcEJveFJlY3QgPSB7XG4gICAgICBsZWZ0OiBjcm9wQm94UmVjdC5sZWZ0IC0gZWxlbWVudFJlY3QubGVmdCxcbiAgICAgIHRvcDogY3JvcEJveFJlY3QudG9wIC0gZWxlbWVudFJlY3QudG9wLFxuICAgICAgd2lkdGg6IGNyb3BCb3hSZWN0LndpZHRoLFxuICAgICAgaGVpZ2h0OiBjcm9wQm94UmVjdC5oZWlnaHRcbiAgICB9O1xuXG4gICAgdGhpcy5pbml0U2NhbGUoKTtcblxuICAgIHRoaXMuY2hlY2tCb3VuY2UoMCk7XG4gIH0sXG5cbiAgY2hlY2tCb3VuY2U6IGZ1bmN0aW9uIChzcGVlZCkge1xuICAgIHZhciBpbWFnZVN0YXRlID0gdGhpcy5pbWFnZVN0YXRlO1xuICAgIHZhciBjcm9wQm94UmVjdCA9IHRoaXMuY3JvcEJveFJlY3Q7XG5cbiAgICB2YXIgaW1hZ2VXaWR0aCA9IGltYWdlU3RhdGUud2lkdGg7XG4gICAgdmFyIGltYWdlSGVpZ2h0ID0gaW1hZ2VTdGF0ZS5oZWlnaHQ7XG4gICAgdmFyIGltYWdlU2NhbGUgPSBpbWFnZVN0YXRlLnNjYWxlO1xuXG4gICAgdmFyIGltYWdlT2Zmc2V0ID0gZ2V0RWxlbWVudFRyYW5zbGF0ZSh0aGlzLnJlZnMuaW1hZ2UpO1xuICAgIHZhciBsZWZ0ID0gaW1hZ2VPZmZzZXQubGVmdDtcbiAgICB2YXIgdG9wID0gaW1hZ2VPZmZzZXQudG9wO1xuXG4gICAgdmFyIGxlZnRSYW5nZSA9IFstaW1hZ2VXaWR0aCAqIGltYWdlU2NhbGUgKyBjcm9wQm94UmVjdC53aWR0aCArIGNyb3BCb3hSZWN0LmxlZnQsIGNyb3BCb3hSZWN0LmxlZnRdO1xuICAgIHZhciB0b3BSYW5nZSA9IFstaW1hZ2VIZWlnaHQgKiBpbWFnZVNjYWxlICsgY3JvcEJveFJlY3QuaGVpZ2h0ICsgY3JvcEJveFJlY3QudG9wLCBjcm9wQm94UmVjdC50b3BdO1xuXG4gICAgdmFyIG92ZXJmbG93ID0gZmFsc2U7XG5cbiAgICBpZiAobGVmdCA8IGxlZnRSYW5nZVswXSkge1xuICAgICAgbGVmdCA9IGxlZnRSYW5nZVswXTtcbiAgICAgIG92ZXJmbG93ID0gdHJ1ZTtcbiAgICB9IGVsc2UgaWYgKGxlZnQgPiBsZWZ0UmFuZ2VbMV0pIHtcbiAgICAgIGxlZnQgPSBsZWZ0UmFuZ2VbMV07XG4gICAgICBvdmVyZmxvdyA9IHRydWU7XG4gICAgfVxuXG4gICAgaWYgKHRvcCA8IHRvcFJhbmdlWzBdKSB7XG4gICAgICB0b3AgPSB0b3BSYW5nZVswXTtcbiAgICAgIG92ZXJmbG93ID0gdHJ1ZTtcbiAgICB9IGVsc2UgaWYgKHRvcCA+IHRvcFJhbmdlWzFdKSB7XG4gICAgICB0b3AgPSB0b3BSYW5nZVsxXTtcbiAgICAgIG92ZXJmbG93ID0gdHJ1ZTtcbiAgICB9XG5cbiAgICBpZiAob3ZlcmZsb3cpIHtcbiAgICAgIHZhciBzZWxmID0gdGhpcztcbiAgICAgIHRyYW5zbGF0ZSh0aGlzLnJlZnMuaW1hZ2UsIGxlZnQsIHRvcCwgc3BlZWQgPT09IHVuZGVmaW5lZCA/IDIwMCA6IDAsIGZ1bmN0aW9uKCkge1xuICAgICAgICBzZWxmLm1vdmVJbWFnZShsZWZ0LCB0b3ApO1xuICAgICAgfSk7XG4gICAgfVxuICB9LFxuXG4gIG1vdmVJbWFnZTogZnVuY3Rpb24obGVmdCwgdG9wKSB7XG4gICAgdmFyIGltYWdlID0gdGhpcy5yZWZzLmltYWdlO1xuICAgIHRyYW5zbGF0ZUVsZW1lbnQoaW1hZ2UsIGxlZnQsIHRvcCk7XG5cbiAgICB0aGlzLmltYWdlU3RhdGUubGVmdCA9IGxlZnQ7XG4gICAgdGhpcy5pbWFnZVN0YXRlLnRvcCA9IHRvcDtcbiAgfSxcblxuICBvblRvdWNoU3RhcnQ6IGZ1bmN0aW9uKGV2ZW50KSB7XG4gICAgdGhpcy5hbXBsaXR1ZGUgPSAwO1xuICAgIHZhciBpbWFnZSA9IHRoaXMucmVmcy5pbWFnZTtcblxuICAgIHZhciBmaW5nZXJDb3VudCA9IGV2ZW50LnRvdWNoZXMubGVuZ3RoO1xuICAgIGlmIChmaW5nZXJDb3VudCkge1xuICAgICAgdmFyIHRvdWNoRXZlbnQgPSBldmVudC50b3VjaGVzWzBdO1xuXG4gICAgICB2YXIgaW1hZ2VPZmZzZXQgPSBnZXRFbGVtZW50VHJhbnNsYXRlKGltYWdlKTtcblxuICAgICAgdGhpcy5kcmFnU3RhdGUgPSB7XG4gICAgICAgIHRpbWVzdGFtcDogRGF0ZS5ub3coKSxcbiAgICAgICAgc3RhcnRUb3VjaExlZnQ6IHRvdWNoRXZlbnQucGFnZVgsXG4gICAgICAgIHN0YXJ0VG91Y2hUb3A6IHRvdWNoRXZlbnQucGFnZVksXG4gICAgICAgIHN0YXJ0TGVmdDogaW1hZ2VPZmZzZXQubGVmdCB8fCAwLFxuICAgICAgICBzdGFydFRvcDogaW1hZ2VPZmZzZXQudG9wIHx8IDBcbiAgICAgIH07XG4gICAgfVxuXG4gICAgaWYgKGZpbmdlckNvdW50ID49IDIpIHtcbiAgICAgIHZhciB6b29tU3RhdGUgPSB0aGlzLnpvb21TdGF0ZSA9IHtcbiAgICAgICAgdGltZXN0YW1wOiBEYXRlLm5vdygpXG4gICAgICB9O1xuXG4gICAgICB6b29tU3RhdGUuc3RhcnREaXN0YW5jZSA9IGdldERpc3RhbmNlKGV2ZW50KTtcbiAgICAgIHpvb21TdGF0ZS5mb2NhbFBvaW50ID0gdGhpcy5nZXRGb2NhbFBvaW50KGV2ZW50KTtcbiAgICB9XG4gIH0sXG5cbiAgb25Ub3VjaE1vdmU6IGZ1bmN0aW9uKGV2ZW50KSB7XG4gICAgdmFyIGZpbmdlckNvdW50ID0gZXZlbnQudG91Y2hlcy5sZW5ndGg7XG5cbiAgICB2YXIgdG91Y2hFdmVudCA9IGV2ZW50LnRvdWNoZXNbMF07XG5cbiAgICB2YXIgY3JvcEJveFJlY3QgPSB0aGlzLmNyb3BCb3hSZWN0O1xuICAgIHZhciBpbWFnZSA9IHRoaXMucmVmcy5pbWFnZTtcblxuICAgIHZhciBpbWFnZVN0YXRlID0gdGhpcy5pbWFnZVN0YXRlO1xuICAgIHZhciBpbWFnZVdpZHRoID0gaW1hZ2VTdGF0ZS53aWR0aDtcbiAgICB2YXIgaW1hZ2VIZWlnaHQgPSBpbWFnZVN0YXRlLmhlaWdodDtcblxuICAgIHZhciBkcmFnU3RhdGUgPSB0aGlzLmRyYWdTdGF0ZTtcbiAgICB2YXIgem9vbVN0YXRlID0gdGhpcy56b29tU3RhdGU7XG5cbiAgICBpZiAoZmluZ2VyQ291bnQgPT09IDEpIHtcbiAgICAgIHZhciBsZWZ0UmFuZ2UgPSBbIC1pbWFnZVdpZHRoICogaW1hZ2VTdGF0ZS5zY2FsZSArIGNyb3BCb3hSZWN0LndpZHRoLCBjcm9wQm94UmVjdC5sZWZ0IF07XG4gICAgICB2YXIgdG9wUmFuZ2UgPSBbIC1pbWFnZUhlaWdodCAqIGltYWdlU3RhdGUuc2NhbGUgKyBjcm9wQm94UmVjdC5oZWlnaHQgKyBjcm9wQm94UmVjdC50b3AsIGNyb3BCb3hSZWN0LnRvcCBdO1xuXG4gICAgICB2YXIgZGVsdGFYID0gdG91Y2hFdmVudC5wYWdlWCAtIChkcmFnU3RhdGUubGFzdExlZnQgfHwgZHJhZ1N0YXRlLnN0YXJ0VG91Y2hMZWZ0KTtcbiAgICAgIHZhciBkZWx0YVkgPSB0b3VjaEV2ZW50LnBhZ2VZIC0gKGRyYWdTdGF0ZS5sYXN0VG9wIHx8IGRyYWdTdGF0ZS5zdGFydFRvdWNoVG9wKTtcblxuICAgICAgdmFyIGltYWdlT2Zmc2V0ID0gZ2V0RWxlbWVudFRyYW5zbGF0ZShpbWFnZSk7XG5cbiAgICAgIHZhciBsZWZ0ID0gaW1hZ2VPZmZzZXQubGVmdCArIGRlbHRhWDtcbiAgICAgIHZhciB0b3AgPSBpbWFnZU9mZnNldC50b3AgKyBkZWx0YVk7XG5cbiAgICAgIGlmIChsZWZ0IDwgbGVmdFJhbmdlWzBdIHx8IGxlZnQgPiBsZWZ0UmFuZ2VbMV0pIHtcbiAgICAgICAgbGVmdCAtPSBkZWx0YVggLyAyO1xuICAgICAgfVxuXG4gICAgICBpZiAodG9wIDwgdG9wUmFuZ2UgWzBdIHx8IHRvcCA+IHRvcFJhbmdlWzFdKSB7XG4gICAgICAgIHRvcCAtPSBkZWx0YVkgLyAyO1xuICAgICAgfVxuXG4gICAgICB0aGlzLm1vdmVJbWFnZShsZWZ0LCB0b3ApO1xuICAgIH0gZWxzZSBpZiAoZmluZ2VyQ291bnQgPj0gMikge1xuICAgICAgaWYgKCF6b29tU3RhdGUudGltZXN0YW1wKSB7XG4gICAgICAgIHpvb21TdGF0ZSA9IHtcbiAgICAgICAgICB0aW1lc3RhbXA6IERhdGUubm93KClcbiAgICAgICAgfTtcblxuICAgICAgICB6b29tU3RhdGUuc3RhcnREaXN0YW5jZSA9IGdldERpc3RhbmNlKGV2ZW50KTtcbiAgICAgICAgem9vbVN0YXRlLmZvY2FsUG9pbnQgPSB0aGlzLmdldEZvY2FsUG9pbnQoZXZlbnQpO1xuXG4gICAgICAgIHJldHVybjtcbiAgICAgIH1cblxuICAgICAgdmFyIG5ld0Rpc3RhbmNlID0gZ2V0RGlzdGFuY2UoZXZlbnQpO1xuICAgICAgdmFyIG9sZFNjYWxlID0gaW1hZ2VTdGF0ZS5zY2FsZTtcblxuICAgICAgaW1hZ2VTdGF0ZS5zY2FsZSA9IG9sZFNjYWxlICogbmV3RGlzdGFuY2UgLyAoem9vbVN0YXRlLmxhc3REaXN0YW5jZSB8fCB6b29tU3RhdGUuc3RhcnREaXN0YW5jZSk7XG5cbiAgICAgIHZhciBzY2FsZVJhbmdlID0gdGhpcy5zY2FsZVJhbmdlO1xuICAgICAgaWYgKGltYWdlU3RhdGUuc2NhbGUgPCBzY2FsZVJhbmdlWzBdKSB7XG4gICAgICAgIGltYWdlU3RhdGUuc2NhbGUgPSBzY2FsZVJhbmdlWzBdO1xuICAgICAgfSBlbHNlIGlmIChpbWFnZVN0YXRlLnNjYWxlID4gc2NhbGVSYW5nZVsxXSkge1xuICAgICAgICBpbWFnZVN0YXRlLnNjYWxlID0gc2NhbGVSYW5nZVsxXTtcbiAgICAgIH1cblxuICAgICAgdGhpcy56b29tV2l0aEZvY2FsKG9sZFNjYWxlKTtcblxuICAgICAgem9vbVN0YXRlLmZvY2FsUG9pbnQgPSB0aGlzLmdldEZvY2FsUG9pbnQoZXZlbnQpO1xuICAgICAgem9vbVN0YXRlLmxhc3REaXN0YW5jZSA9IG5ld0Rpc3RhbmNlO1xuICAgIH1cblxuICAgIGRyYWdTdGF0ZS5sYXN0TGVmdCA9IHRvdWNoRXZlbnQucGFnZVg7XG4gICAgZHJhZ1N0YXRlLmxhc3RUb3AgPSB0b3VjaEV2ZW50LnBhZ2VZO1xuICB9LFxuXG4gIG9uVG91Y2hFbmQ6IGZ1bmN0aW9uKGV2ZW50KSB7XG4gICAgdmFyIGltYWdlU3RhdGUgPSB0aGlzLmltYWdlU3RhdGU7XG4gICAgdmFyIHpvb21TdGF0ZSA9IHRoaXMuem9vbVN0YXRlO1xuICAgIHZhciBkcmFnU3RhdGUgPSB0aGlzLmRyYWdTdGF0ZTtcbiAgICB2YXIgYW1wbGl0dWRlID0gdGhpcy5hbXBsaXR1ZGU7XG4gICAgdmFyIGltYWdlV2lkdGggPSBpbWFnZVN0YXRlLndpZHRoO1xuICAgIHZhciBpbWFnZUhlaWdodCA9IGltYWdlU3RhdGUuaGVpZ2h0O1xuICAgIHZhciBjcm9wQm94UmVjdCA9IHRoaXMuY3JvcEJveFJlY3Q7XG5cbiAgICBpZiAoZXZlbnQudG91Y2hlcy5sZW5ndGggPT09IDAgJiYgZHJhZ1N0YXRlLnRpbWVzdGFtcCkge1xuICAgICAgdmFyIHNlbGYgPSB0aGlzO1xuICAgICAgdmFyIGR1cmF0aW9uID0gRGF0ZS5ub3coKSAtIGRyYWdTdGF0ZS50aW1lc3RhbXA7XG5cbiAgICAgIGlmIChkdXJhdGlvbiA+IDMwMCkge1xuICAgICAgICBzZWxmLmNoZWNrQm91bmNlKCk7XG4gICAgICB9IGVsc2Uge1xuICAgICAgICB2YXIgdGFyZ2V0O1xuXG4gICAgICAgIHZhciB0b3AgPSBpbWFnZVN0YXRlLnRvcDtcbiAgICAgICAgdmFyIGxlZnQgPSBpbWFnZVN0YXRlLmxlZnQ7XG5cbiAgICAgICAgdmFyIG1vbWVudHVtVmVydGljYWwgPSBmYWxzZTtcblxuICAgICAgICB2YXIgdGltZUNvbnN0YW50ID0gMTYwO1xuXG4gICAgICAgIHZhciBhdXRvU2Nyb2xsID0gZnVuY3Rpb24gKCkge1xuICAgICAgICAgIHZhciBlbGFwc2VkLCBkZWx0YTtcblxuICAgICAgICAgIGlmIChhbXBsaXR1ZGUpIHtcbiAgICAgICAgICAgIGVsYXBzZWQgPSBEYXRlLm5vdygpIC0gdGltZXN0YW1wO1xuICAgICAgICAgICAgZGVsdGEgPSAtYW1wbGl0dWRlICogTWF0aC5leHAoLWVsYXBzZWQgLyB0aW1lQ29uc3RhbnQpO1xuICAgICAgICAgICAgaWYgKGRlbHRhID4gMC41IHx8IGRlbHRhIDwgLTAuNSkge1xuICAgICAgICAgICAgICBpZiAobW9tZW50dW1WZXJ0aWNhbCkge1xuICAgICAgICAgICAgICAgIHNlbGYubW92ZUltYWdlKGxlZnQsIHRhcmdldCArIGRlbHRhKTtcbiAgICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICBzZWxmLm1vdmVJbWFnZSh0YXJnZXQgKyBkZWx0YSwgdG9wKTtcbiAgICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICAgIHJlcXVlc3RBbmltYXRpb25GcmFtZShhdXRvU2Nyb2xsKTtcbiAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgIHZhciBjdXJyZW50TGVmdDtcbiAgICAgICAgICAgICAgdmFyIGN1cnJlbnRUb3A7XG5cbiAgICAgICAgICAgICAgaWYgKG1vbWVudHVtVmVydGljYWwpIHtcbiAgICAgICAgICAgICAgICBjdXJyZW50TGVmdCA9IGxlZnQ7XG4gICAgICAgICAgICAgICAgY3VycmVudFRvcCA9IHRhcmdldDtcbiAgICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICBjdXJyZW50TGVmdCA9IHRhcmdldDtcbiAgICAgICAgICAgICAgICBjdXJyZW50VG9wID0gdG9wO1xuICAgICAgICAgICAgICB9XG5cbiAgICAgICAgICAgICAgc2VsZi5tb3ZlSW1hZ2UoY3VycmVudExlZnQsIGN1cnJlbnRUb3ApO1xuICAgICAgICAgICAgICBzZWxmLmNoZWNrQm91bmNlKCk7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgfVxuICAgICAgICB9O1xuXG4gICAgICAgIHZhciB2ZWxvY2l0eTtcblxuICAgICAgICB2YXIgZGVsdGFYID0gZXZlbnQuY2hhbmdlZFRvdWNoZXNbMF0ucGFnZVggLSBkcmFnU3RhdGUuc3RhcnRUb3VjaExlZnQ7XG4gICAgICAgIHZhciBkZWx0YVkgPSBldmVudC5jaGFuZ2VkVG91Y2hlc1swXS5wYWdlWSAtIGRyYWdTdGF0ZS5zdGFydFRvdWNoVG9wO1xuXG4gICAgICAgIGlmIChNYXRoLmFicyhkZWx0YVgpID4gTWF0aC5hYnMoZGVsdGFZKSkge1xuICAgICAgICAgIHZlbG9jaXR5ID0gZGVsdGFYIC8gZHVyYXRpb247XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgbW9tZW50dW1WZXJ0aWNhbCA9IHRydWU7XG4gICAgICAgICAgdmVsb2NpdHkgPSBkZWx0YVkgLyBkdXJhdGlvbjtcbiAgICAgICAgfVxuXG4gICAgICAgIGFtcGxpdHVkZSA9IDgwICogdmVsb2NpdHk7XG5cbiAgICAgICAgdmFyIHJhbmdlO1xuXG4gICAgICAgIGlmIChtb21lbnR1bVZlcnRpY2FsKSB7XG4gICAgICAgICAgdGFyZ2V0ID0gTWF0aC5yb3VuZChpbWFnZVN0YXRlLnRvcCArIGFtcGxpdHVkZSk7XG4gICAgICAgICAgcmFuZ2UgPSBbLWltYWdlSGVpZ2h0ICogaW1hZ2VTdGF0ZS5zY2FsZSArIGNyb3BCb3hSZWN0LmhlaWdodCAvIDIgKyBjcm9wQm94UmVjdC50b3AsIGNyb3BCb3hSZWN0LnRvcCArIGNyb3BCb3hSZWN0LmhlaWdodCAvIDJdO1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgIHRhcmdldCA9IE1hdGgucm91bmQoaW1hZ2VTdGF0ZS5sZWZ0ICsgYW1wbGl0dWRlKTtcbiAgICAgICAgICByYW5nZSA9IFstaW1hZ2VXaWR0aCAqIGltYWdlU3RhdGUuc2NhbGUgKyBjcm9wQm94UmVjdC53aWR0aCAvIDIsIGNyb3BCb3hSZWN0LmxlZnQgKyBjcm9wQm94UmVjdC53aWR0aCAvIDJdO1xuICAgICAgICB9XG5cbiAgICAgICAgaWYgKHRhcmdldCA8IHJhbmdlWzBdKSB7XG4gICAgICAgICAgdGFyZ2V0ID0gcmFuZ2VbMF07XG4gICAgICAgICAgYW1wbGl0dWRlIC89IDI7XG4gICAgICAgIH0gZWxzZSBpZiAodGFyZ2V0ID4gcmFuZ2VbMV0pIHtcbiAgICAgICAgICB0YXJnZXQgPSByYW5nZVsxXTtcbiAgICAgICAgICBhbXBsaXR1ZGUgLz0gMjtcbiAgICAgICAgfVxuXG4gICAgICAgIHZhciB0aW1lc3RhbXAgPSBEYXRlLm5vdygpO1xuICAgICAgICByZXF1ZXN0QW5pbWF0aW9uRnJhbWUoYXV0b1Njcm9sbCk7XG4gICAgICB9XG5cbiAgICAgIHRoaXMuZHJhZ1N0YXRlID0ge307XG4gICAgfSBlbHNlIGlmICh6b29tU3RhdGUudGltZXN0YW1wKSB7XG4gICAgICB0aGlzLmNoZWNrQm91bmNlKCk7XG5cbiAgICAgIHRoaXMuem9vbVN0YXRlID0ge307XG4gICAgfVxuICB9LFxuXG4gIHpvb21XaXRoRm9jYWw6IGZ1bmN0aW9uKG9sZFNjYWxlKSB7XG4gICAgdmFyIGltYWdlID0gdGhpcy5yZWZzLmltYWdlO1xuICAgIHZhciBpbWFnZVN0YXRlID0gdGhpcy5pbWFnZVN0YXRlO1xuICAgIHZhciBpbWFnZVNjYWxlID0gaW1hZ2VTdGF0ZS5zY2FsZTtcblxuICAgIGltYWdlLnN0eWxlLndpZHRoID0gaW1hZ2VTdGF0ZS53aWR0aCAqIGltYWdlU2NhbGUgKyAncHgnO1xuICAgIGltYWdlLnN0eWxlLmhlaWdodCA9IGltYWdlU3RhdGUuaGVpZ2h0ICogaW1hZ2VTY2FsZSArICdweCc7XG5cbiAgICB2YXIgZm9jYWxQb2ludCA9IHRoaXMuem9vbVN0YXRlLmZvY2FsUG9pbnQ7XG5cbiAgICB2YXIgb2Zmc2V0TGVmdCA9IChmb2NhbFBvaW50LmxlZnQgLyBpbWFnZVNjYWxlIC0gZm9jYWxQb2ludC5sZWZ0IC8gb2xkU2NhbGUpICogaW1hZ2VTY2FsZTtcbiAgICB2YXIgb2Zmc2V0VG9wID0gKGZvY2FsUG9pbnQudG9wIC8gaW1hZ2VTY2FsZSAtIGZvY2FsUG9pbnQudG9wIC8gb2xkU2NhbGUpICogaW1hZ2VTY2FsZTtcblxuICAgIHZhciBpbWFnZUxlZnQgPSBpbWFnZVN0YXRlLmxlZnQgfHwgMDtcbiAgICB2YXIgaW1hZ2VUb3AgPSBpbWFnZVN0YXRlLnRvcCB8fCAwO1xuXG4gICAgdGhpcy5tb3ZlSW1hZ2UoaW1hZ2VMZWZ0ICsgb2Zmc2V0TGVmdCwgaW1hZ2VUb3AgKyBvZmZzZXRUb3ApO1xuICB9LFxuXG4gIGJpbmRFdmVudHM6IGZ1bmN0aW9uKCkge1xuICAgIHZhciBjcm9wQm94ID0gdGhpcy5yZWZzLmNyb3BCb3g7XG5cbiAgICBjcm9wQm94LmFkZEV2ZW50TGlzdGVuZXIoJ3RvdWNoc3RhcnQnLCB0aGlzLm9uVG91Y2hTdGFydC5iaW5kKHRoaXMpKTtcblxuICAgIGNyb3BCb3guYWRkRXZlbnRMaXN0ZW5lcigndG91Y2htb3ZlJywgdGhpcy5vblRvdWNoTW92ZS5iaW5kKHRoaXMpKTtcblxuICAgIGNyb3BCb3guYWRkRXZlbnRMaXN0ZW5lcigndG91Y2hlbmQnLCB0aGlzLm9uVG91Y2hFbmQuYmluZCh0aGlzKSk7XG4gIH0sXG5cbiAgY3JlYXRlQmFzZTY0OiBmdW5jdGlvbiAoY2FsbGJhY2ssIHdpZHRoKSB7XG4gICAgdmFyIGltYWdlU3RhdGUgPSB0aGlzLmltYWdlU3RhdGU7XG4gICAgdmFyIGNyb3BCb3hSZWN0ID0gdGhpcy5jcm9wQm94UmVjdDtcbiAgICB2YXIgc2NhbGUgPSBpbWFnZVN0YXRlLnNjYWxlO1xuXG4gICAgdmFyIGNhbnZhc1NpemUgPSB3aWR0aDtcblxuICAgIGlmICghY2FudmFzU2l6ZSkge1xuICAgICAgY2FudmFzU2l6ZSA9IGNyb3BCb3hSZWN0LndpZHRoICogMjtcbiAgICB9XG5cbiAgICB2YXIgaW1hZ2VMZWZ0ID0gTWF0aC5yb3VuZCgoY3JvcEJveFJlY3QubGVmdCAtIGltYWdlU3RhdGUubGVmdCkgLyBzY2FsZSk7XG4gICAgdmFyIGltYWdlVG9wID0gTWF0aC5yb3VuZCgoY3JvcEJveFJlY3QudG9wIC0gaW1hZ2VTdGF0ZS50b3ApIC8gc2NhbGUpO1xuICAgIHZhciBpbWFnZVNpemUgPSBNYXRoLmZsb29yKGNyb3BCb3hSZWN0LndpZHRoIC8gc2NhbGUpO1xuXG4gICAgdmFyIG9yaWVudGF0aW9uID0gdGhpcy5vcmllbnRhdGlvbjtcbiAgICB2YXIgaW1hZ2UgPSB0aGlzLnJlZnMuaW1hZ2U7XG5cbiAgICB2YXIgY3JvcEltYWdlID0gbmV3IEltYWdlKCk7XG4gICAgY3JvcEltYWdlLnNyYyA9IGltYWdlLnNyYztcblxuICAgIGNyb3BJbWFnZS5vbmxvYWQgPSBmdW5jdGlvbigpIHtcbiAgICAgIHZhciByZXN1bHRDYW52YXMgPSBsb2FkSW1hZ2Uuc2NhbGUoY3JvcEltYWdlLCB7XG4gICAgICAgIGNhbnZhczogdHJ1ZSxcbiAgICAgICAgbGVmdDogaW1hZ2VMZWZ0LFxuICAgICAgICB0b3A6IGltYWdlVG9wLFxuICAgICAgICBzb3VyY2VXaWR0aDogaW1hZ2VTaXplLFxuICAgICAgICBzb3VyY2VIZWlnaHQ6IGltYWdlU2l6ZSxcbiAgICAgICAgb3JpZW50YXRpb246IG9yaWVudGF0aW9uLFxuICAgICAgICBtYXhXaWR0aDogY2FudmFzU2l6ZSxcbiAgICAgICAgbWF4SGVpZ2h0OiBjYW52YXNTaXplXG4gICAgICB9KTtcblxuICAgICAgdmFyIGRhdGFVUkwgPSByZXN1bHRDYW52YXMudG9EYXRhVVJMKCk7XG4gICAgICBpZiAodHlwZW9mIGNhbGxiYWNrID09PSAnZnVuY3Rpb24nKSB7XG4gICAgICAgIGNhbGxiYWNrKHtcbiAgICAgICAgICBjYW52YXNTaXplOiBjYW52YXNTaXplLFxuICAgICAgICAgIGNhbnZhczogcmVzdWx0Q2FudmFzLFxuICAgICAgICAgIGRhdGFVUkw6IGRhdGFVUkxcbiAgICAgICAgfSk7XG4gICAgICB9XG4gICAgfTtcbiAgfSxcblxuICBnZXRDcm9wcGVkSW1hZ2U6IGZ1bmN0aW9uKGNhbGxiYWNrLCB3aWR0aCkge1xuICAgIGlmICghdGhpcy5pbWFnZSkgcmV0dXJuIG51bGw7XG5cbiAgICB0aGlzLmNyZWF0ZUJhc2U2NChmdW5jdGlvbihyZXN1bHQpIHtcbiAgICAgIHZhciBjYW52YXNTaXplID0gcmVzdWx0LmNhbnZhc1NpemU7XG4gICAgICB2YXIgY2FudmFzID0gcmVzdWx0LmNhbnZhcztcbiAgICAgIHZhciBkYXRhVVJMID0gcmVzdWx0LmRhdGFVUkw7XG5cbiAgICAgIGlmICh0eXBlb2YgY2FsbGJhY2sgPT09ICdmdW5jdGlvbicpIHtcbiAgICAgICAgY2FsbGJhY2soe1xuICAgICAgICAgIGZpbGU6IGNhbnZhcy50b0Jsb2IgPyBjYW52YXMudG9CbG9iKCkgOiBkYXRhVVJJdG9CbG9iKGRhdGFVUkwpLFxuICAgICAgICAgIGRhdGFVcmw6IGRhdGFVUkwsXG4gICAgICAgICAgb0RhdGFVUkw6IHJlc3VsdC5vRGF0YVVSTCxcbiAgICAgICAgICBzaXplOiBjYW52YXNTaXplXG4gICAgICAgIH0pO1xuICAgICAgfVxuICAgIH0sIHdpZHRoKTtcbiAgfVxufTtcblxubW9kdWxlLmV4cG9ydHMgPSBDcm9wcGVyOyIsIndpbmRvdy5Dcm9wcGVyID0gcmVxdWlyZSgnLi9jcm9wcGVyJyk7IiwiXG52YXIgb25jZSA9IGZ1bmN0aW9uKGVsLCBldmVudCwgZm4pIHtcbiAgdmFyIGxpc3RlbmVyID0gZnVuY3Rpb24oKSB7XG4gICAgaWYgKGZuKSB7XG4gICAgICBmbi5hcHBseSh0aGlzLCBhcmd1bWVudHMpO1xuICAgIH1cbiAgICBlbC5yZW1vdmVFdmVudExpc3RlbmVyKGV2ZW50LCBsaXN0ZW5lcik7XG4gIH07XG4gIGVsLmFkZEV2ZW50TGlzdGVuZXIoZXZlbnQsIGxpc3RlbmVyKTtcbn07XG5cbm1vZHVsZS5leHBvcnRzID0ge1xuICBkYXRhVVJJdG9CbG9iOiBmdW5jdGlvbiAoZGF0YVVSSSkge1xuICAgIHZhciBiaW5hcnlTdHJpbmcgPSBhdG9iKGRhdGFVUkkuc3BsaXQoJywnKVsxXSk7XG4gICAgdmFyIGFycmF5QnVmZmVyID0gbmV3IEFycmF5QnVmZmVyKGJpbmFyeVN0cmluZy5sZW5ndGgpO1xuICAgIHZhciBpbnRBcnJheSA9IG5ldyBVaW50OEFycmF5KGFycmF5QnVmZmVyKTtcblxuICAgIGZvciAodmFyIGkgPSAwLCBqID0gYmluYXJ5U3RyaW5nLmxlbmd0aDsgaSA8IGo7IGkrKykge1xuICAgICAgaW50QXJyYXlbaV0gPSBiaW5hcnlTdHJpbmcuY2hhckNvZGVBdChpKTtcbiAgICB9XG5cbiAgICB2YXIgZGF0YSA9IFtpbnRBcnJheV07XG4gICAgdmFyIHR5cGUgPSAnaW1hZ2UvcG5nJztcblxuICAgIHZhciByZXN1bHQ7XG5cbiAgICB0cnkge1xuICAgICAgcmVzdWx0ID0gbmV3IEJsb2IoZGF0YSwgeyB0eXBlOiB0eXBlIH0pO1xuICAgIH0gY2F0Y2goZXJyb3IpIHtcbiAgICAgIC8vIFR5cGVFcnJvciBvbGQgY2hyb21lIGFuZCBGRlxuICAgICAgd2luZG93LkJsb2JCdWlsZGVyID0gd2luZG93LkJsb2JCdWlsZGVyIHx8XG4gICAgICAgIHdpbmRvdy5XZWJLaXRCbG9iQnVpbGRlciB8fFxuICAgICAgICB3aW5kb3cuTW96QmxvYkJ1aWxkZXIgfHxcbiAgICAgICAgd2luZG93Lk1TQmxvYkJ1aWxkZXI7XG5cbiAgICAgIGlmKGVycm9yLm5hbWUgPT0gJ1R5cGVFcnJvcicgJiYgd2luZG93LkJsb2JCdWlsZGVyKXtcbiAgICAgICAgdmFyIGJ1aWxkZXIgPSBuZXcgQmxvYkJ1aWxkZXIoKTtcbiAgICAgICAgYnVpbGRlci5hcHBlbmQoYXJyYXlCdWZmZXIpO1xuICAgICAgICByZXN1bHQgPSBidWlsZGVyLmdldEJsb2IodHlwZSk7XG4gICAgICB9XG4gICAgfVxuXG4gICAgcmV0dXJuIHJlc3VsdDtcbiAgfSxcbiAgZ2V0VG91Y2hEaXN0YW5jZTogZnVuY3Rpb24oZXZlbnQpIHtcbiAgICB2YXIgZmluZ2VyID0gZXZlbnQudG91Y2hlc1swXTtcbiAgICB2YXIgZmluZ2VyMiA9IGV2ZW50LnRvdWNoZXNbMV07XG5cbiAgICB2YXIgYzEgPSBNYXRoLmFicyhmaW5nZXIucGFnZVggLSBmaW5nZXIyLnBhZ2VYKTtcbiAgICB2YXIgYzIgPSBNYXRoLmFicyhmaW5nZXIucGFnZVkgLSBmaW5nZXIyLnBhZ2VZKTtcblxuICAgIHJldHVybiBNYXRoLnNxcnQoIGMxICogYzEgKyBjMiAqIGMyICk7XG4gIH0sXG4gIHRyYW5zbGF0ZTogZnVuY3Rpb24oZWxlbWVudCwgbGVmdCwgdG9wLCBzcGVlZCwgY2FsbGJhY2spIHtcbiAgICBlbGVtZW50LnN0eWxlLndlYmtpdFRyYW5zZm9ybSA9ICd0cmFuc2xhdGUzZCgnICsgKGxlZnQgfHwgMCkgKyAncHgsICcgKyAodG9wIHx8IDApICsgJ3B4LCAwKSc7XG4gICAgaWYgKHNwZWVkKSB7XG4gICAgICB2YXIgY2FsbGVkID0gZmFsc2U7XG5cbiAgICAgIHZhciByZWFsQ2FsbGJhY2sgPSBmdW5jdGlvbigpIHtcbiAgICAgICAgaWYgKGNhbGxlZCkgcmV0dXJuO1xuICAgICAgICBlbGVtZW50LnN0eWxlLndlYmtpdFRyYW5zaXRpb24gPSAnJztcbiAgICAgICAgY2FsbGVkID0gdHJ1ZTtcbiAgICAgICAgaWYgKGNhbGxiYWNrKSB7XG4gICAgICAgICAgY2FsbGJhY2suYXBwbHkodGhpcywgYXJndW1lbnRzKTtcbiAgICAgICAgfVxuICAgICAgfTtcbiAgICAgIGVsZW1lbnQuc3R5bGUud2Via2l0VHJhbnNpdGlvbiA9ICctd2Via2l0LXRyYW5zZm9ybSAnICsgc3BlZWQgKyAnbXMgY3ViaWMtYmV6aWVyKDAuMzI1LCAwLjc3MCwgMC4wMDAsIDEuMDAwKSc7XG4gICAgICBvbmNlKGVsZW1lbnQsICd3ZWJraXRUcmFuc2l0aW9uRW5kJywgcmVhbENhbGxiYWNrKTtcbiAgICAgIG9uY2UoZWxlbWVudCwgJ3RyYW5zaXRpb25lbmQnLCByZWFsQ2FsbGJhY2spO1xuICAgICAgLy8gZm9yIGFuZHJvaWQuLi5cbiAgICAgIHNldFRpbWVvdXQocmVhbENhbGxiYWNrLCBzcGVlZCArIDUwKTtcbiAgICB9IGVsc2Uge1xuICAgICAgZWxlbWVudC5zdHlsZS53ZWJraXRUcmFuc2l0aW9uID0gJyc7XG4gICAgfVxuICB9LFxuICB0cmFuc2xhdGVFbGVtZW50OiBmdW5jdGlvbihlbGVtZW50LCBsZWZ0LCB0b3ApIHtcbiAgICBlbGVtZW50LnN0eWxlLndlYmtpdFRyYW5zZm9ybSA9ICd0cmFuc2xhdGUzZCgnICsgKGxlZnQgfHwgMCkgKyAncHgsICcgKyAodG9wIHx8IDApICsgJ3B4LCAwKSc7XG4gIH0sXG4gIGdldEVsZW1lbnRUcmFuc2xhdGU6IGZ1bmN0aW9uKGVsZW1lbnQpIHtcbiAgICB2YXIgdHJhbnNmb3JtID0gZWxlbWVudC5zdHlsZS53ZWJraXRUcmFuc2Zvcm07XG4gICAgdmFyIG1hdGNoZXMgPSAvdHJhbnNsYXRlM2RcXCgoLio/KVxcKS9pZy5leGVjKHRyYW5zZm9ybSk7XG4gICAgaWYgKG1hdGNoZXMpIHtcbiAgICAgIHZhciB0cmFuc2xhdGVzID0gbWF0Y2hlc1sxXS5zcGxpdCgnLCcpO1xuICAgICAgcmV0dXJuIHtcbiAgICAgICAgbGVmdDogcGFyc2VJbnQodHJhbnNsYXRlc1swXSwgMTApLFxuICAgICAgICB0b3A6IHBhcnNlSW50KHRyYW5zbGF0ZXNbMV0sIDEwKVxuICAgICAgfVxuICAgIH1cbiAgICByZXR1cm4ge1xuICAgICAgbGVmdDogMCxcbiAgICAgIHRvcDogMFxuICAgIH1cbiAgfVxufTsiXX0=
