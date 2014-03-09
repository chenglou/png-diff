'use strict';

var fs = require('fs');
var PNG = require('pngjs').PNG;
var Stream = require('stream');
var util = require('util');

function _getDimsMismatchErrMsg(dims1, dims2) {
  return util.format(
    'Images not the same dimension. First: %sx%s. Second: %sx%s.',
    dims1[0],
    dims1[1],
    dims2[0],
    dims2[1]
  );
}

function _turnPathsOrStreamIntoStreams(streamOrPath1, streamOrPath2, done) {
  var readStreamErrorCount = 0;
  function errorCb(err) {
    // already called error
    if (readStreamErrorCount === 1) return;

    readStreamErrorCount++;
    done(err);
  }

  if (typeof streamOrPath1 === 'string') {
    streamOrPath1 = fs.createReadStream(streamOrPath1).once('error', errorCb);
  }

  if (typeof streamOrPath2 === 'string') {
    streamOrPath2 = fs.createReadStream(streamOrPath2).once('error', errorCb);
  }

  if (!(streamOrPath1 instanceof Stream)) {
    return done(new Error('First argument needs to be a valid read stream.'));
  }

  if (!(streamOrPath2 instanceof Stream)) {
    return done(new Error('Second argument needs to be a valid read stream.'));
  }

  done(null, streamOrPath1, streamOrPath2);
}

function measureDiff(streamOrPath1, streamOrPath2, done) {
  _turnPathsOrStreamIntoStreams(streamOrPath1, streamOrPath2, function(err, stream1, stream2) {
    if (err) return done(err);

    stream1.pipe(new PNG()).once('error', done).on('parsed', function() {
      var data1 = this.data;
      var dims1 = [this.width, this.height];
      stream2.pipe(new PNG()).once('error', done).on('parsed', function() {
        var data2 = this.data;
        var dims2 = [this.width, this.height];

        if (data1.length !== data2.length) {
          return done(new Error(_getDimsMismatchErrMsg(dims1, dims2)));
        }

        for (var i = 0; i < data1.length; i++) {
          if (data1[i] !== data2[i]) return done(null, 1);
        }

        return done(null, 0);
      });
    });
  });
}

function outputDiffStream(streamOrPath1, streamOrPath2, done) {
  _turnPathsOrStreamIntoStreams(streamOrPath1, streamOrPath2, function(err, stream1, stream2) {
    if (err) return done(err);

    var writeStream = new PNG();
    stream1.pipe(writeStream).once('error', done).on('parsed', function() {
      var data1 = this.data;
      var dims1 = [this.width, this.height];
      stream2.pipe(new PNG()).once('error', done).on('parsed', function() {
        var data2 = this.data;
        var dims2 = [this.width, this.height];

        if (data1.length !== data2.length) {
          return done(new Error(_getDimsMismatchErrMsg(dims1, dims2)));
        }

        var i = 0;
        var data = writeStream.data;
        // chunk of 4 values: r g b a
        while (data1[i] != null) {
          // var r, g, b, a;
          if (data1[i] !== data2[i] ||
              data1[i + 1] !== data2[i + 1] ||
              data1[i + 2] !== data2[i + 2] ||
              data1[i + 3] !== data2[i + 3]) {

            // turn the diff pixels redder. No change to alpha
            var addRed = 60;

            if (data2[i] + addRed <= 255) {
              data[i] = data2[i] + addRed;
              data[i + 1] = Math.max(data2[i + 1] - addRed / 3, 0);
              data[i + 2] = Math.max(data2[i + 2] - addRed / 3, 0);
            } else {
              // too bright; subtract G and B instead
              data[i] = data2[i];
              data[i + 1] = Math.max(data2[i + 1] - addRed, 0);
              data[i + 2] = Math.max(data2[i + 2] - addRed, 0);
            }
          }
          i += 4;
        }
        return done(null, writeStream.pack());
      });
    });

  });
}

function outputDiff(streamOrPath1, streamOrPath2, destPath, done) {
  outputDiffStream(streamOrPath1, streamOrPath2, function(err, res) {
    if (err) return done(err);

    res
      .pipe(fs.createWriteStream(destPath))
      .once('error', done)
      .on('close', done);
  });
}

module.exports = {
  measureDiff: measureDiff,
  outputDiff: outputDiff,
  outputDiffStream: outputDiffStream
};
