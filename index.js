'use strict';

var fs = require('fs');
var PNG = require('pngjs').PNG;
var Stream = require('stream');
var streamifier = require('streamifier');
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

function _turnPathOrStreamOrBufIntoStream(streamOrBufOrPath, done) {
  if (typeof streamOrBufOrPath === 'string') {
    streamOrBufOrPath = fs.createReadStream(streamOrBufOrPath).once('error', done);
  }

  if (streamOrBufOrPath instanceof Buffer) {
    streamOrBufOrPath = streamifier.createReadStream(streamOrBufOrPath).once('error', done);
  }

  if (!(streamOrBufOrPath instanceof Stream)) {
    return done(
      new Error('Argument needs to be a valid read path, stream or buffer.')
    );
  }

  done(null, streamOrBufOrPath);
}

function _turnPathsOrStreamsOrBufsIntoStreams(streamOrBufOrPath1, streamOrBufOrPath2, done) {
  _turnPathOrStreamOrBufIntoStream(streamOrBufOrPath1, function(err, res1) {
    if (err) return done(err);

    _turnPathOrStreamOrBufIntoStream(streamOrBufOrPath2, function(err, res2) {
      if (err) return done(err);

      done(null, res1, res2);
    });
  });
}

function measureDiff(streamOrBufOrPath1, streamOrBufOrPath2, done) {
  _turnPathsOrStreamsOrBufsIntoStreams(streamOrBufOrPath1, streamOrBufOrPath2, function(err, stream1, stream2) {
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

function outputDiffStream(streamOrBufOrPath1, streamOrBufOrPath2, done) {
  _turnPathsOrStreamsOrBufsIntoStreams(streamOrBufOrPath1, streamOrBufOrPath2, function(err, stream1, stream2) {
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

function outputDiff(streamOrBufOrPath1, streamOrBufOrPath2, destPath, done) {
  outputDiffStream(streamOrBufOrPath1, streamOrBufOrPath2, function(err, res) {
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
