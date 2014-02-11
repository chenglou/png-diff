'use strict';

var imageSize = require('image-size');
var fs = require('fs');
var png = require('pngjs').PNG;

function _loadImage(path, done) {
  var stream = fs.createReadStream(path);

  stream.on('error', done);
  stream.pipe(new png()).on('parsed', function() {
    // `pack` is png's method for outputting the diff png
    done(null, this.data, this.pack.bind(this));
  });
}

function _loadImages(imagePath1, imagePath2, done) {
  _loadImage(imagePath1, function(err, data1, packMethod) {
    if (err) return done(err);

    _loadImage(imagePath2, function(err, data2) {
      if (err) return done(err);

      done(null, data1, data2, packMethod);
    });
  });
}

function _validateDataForComparison(data1, data2, imagePath1, imagePath2) {
  if (!data1.length || !data2.length) return 'Empty image data.';
  if (data1.length !== data2.length) {
    var image1Dimensions = imageSize(imagePath1);
    var image2Dimensions = imageSize(imagePath2);
    return 'Images not the same dimension. First: ' + image1Dimensions.width +
      ' x ' + image1Dimensions.height + '. Second: ' + image2Dimensions.width +
      ' x ' + image2Dimensions.height + '.';
  }
}

function measureDiff(imagePath1, imagePath2, done) {
  _loadImages(imagePath1, imagePath2, function(err, data1, data2) {
    if (err) return done(err);

    var errMessage = _validateDataForComparison(
      data1, data2, imagePath1, imagePath2
    );
    if (errMessage) return done(errMessage);

    var i = 0;
    while(data1[i] != null) {
      if (data1[i] !== data2[i]) return done(null, 1);
      i++;
    }
    return done(null, 0);
  });
}

function outputDiff(imagePath1, imagePath2, outputPath, done) {
  _loadImages(imagePath1, imagePath2, function(err, data1, data2, packMethod) {
    if (err) return done(err);

    var errMessage = _validateDataForComparison(
      data1, data2, imagePath1, imagePath2
    );
    if (errMessage) return done(errMessage);

    var i = 0;

    // chunk of 4 values: r g b a
    while (data1[i] != null) {
      if (data1[i] !== data2[i] ||
        data1[i + 1] !== data2[i + 1] ||
        data1[i + 2] !== data2[i + 2] ||
        data1[i + 3] !== data2[i + 3]) {
          // for convience of using pngjs' api, modify directly the buffer of
          // the first image and output it into a new image

          // turn the diff pixels red. Write on the first image. Alpha doesn't
          // change
          var addRed = 60;
          if (data2[i] + addRed <= 255) {
            data1[i] = data2[i] + addRed;
            data1[i + 1] = Math.max(data2[i + 1] - addRed / 3, 0);
            data1[i + 2] = Math.max(data2[i + 2] - addRed / 3, 0);
          } else {
            // too bright; subtract G and B instead
            data1[i] = data2[i];
            data1[i + 1] = Math.max(data2[i + 1] - addRed, 0);
            data1[i + 2] = Math.max(data2[i + 2] - addRed, 0);
          }
      }
      i += 4;
    }

    packMethod().pipe(fs.createWriteStream(outputPath));
    done(null);
  });
}

module.exports = {
  measureDiff: measureDiff,
  outputDiff: outputDiff
};
