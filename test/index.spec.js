'use strict';

var concat = require('concat-stream');
var fs = require('fs');
var should = require('should');

var PNGDiff = require('../');

var img1Path = 'test/fixtures/1.png';
var img2Path = 'test/fixtures/2.png';
var imgDotPath = 'test/fixtures/dot.png';
var imgExpected12DiffPath = 'test/fixtures/expected12Diff.png';
var tempImgPath = 'temp.png';

describe('measureDiff', function() {
  it('should error for misinput 1', function(done) {
    PNGDiff.measureDiff('bla', img1Path, function(err, res) {
      err.message.should.equal("ENOENT, open 'bla'");
      done();
    });
  });

  it('should error for misinput 2', function(done) {
    PNGDiff.measureDiff(img1Path, 'bla', function(err, res) {
      err.message.should.equal("ENOENT, open 'bla'");
      done();
    });
  });

  it('should error for incompatible image dimensions', function(done) {
    PNGDiff.measureDiff(img1Path, imgDotPath, function(err, res) {
      err.message.should.equal(
        'Images not the same dimension. First: 1000x494. Second: 1x1.'
      );
      done();
    });
  });

  it('should return a diff measure', function(done) {
    PNGDiff.measureDiff(img1Path, img2Path, function(err, res) {
      should.not.exist(err);
      res.should.equal(1);
      done();
    });
  });

  it('should return a diff metric of 0 for identical images', function(done) {
    PNGDiff.measureDiff(img1Path, img1Path, function(err, res) {
      should.not.exist(err);
      res.should.equal(0);
      done();
    });
  });
});

describe('outputDiffStream', function() {
  it('should error for misinput 1', function(done) {
    PNGDiff.outputDiffStream('bla', img1Path, function(err, res) {
      err.message.should.equal("ENOENT, open 'bla'");
      done();
    });
  });

  it('should error for misinput 2', function(done) {
    PNGDiff.outputDiffStream(img1Path, 'bla', function(err, res) {
      err.message.should.equal("ENOENT, open 'bla'");
      done();
    });
  });

  it('should error for incompatible image dimensions', function(done) {
    PNGDiff.outputDiffStream(img1Path, imgDotPath, function(err, res) {
      err.message.should.equal(
        'Images not the same dimension. First: 1000x494. Second: 1x1.'
      );
      done();
    });
  });

  it('should output the diff as a stream', function(done) {
    PNGDiff.outputDiffStream(img1Path, img2Path, function(err, res) {
      should.not.exist(err);

      res.pipe(concat(function(buf1) {
        fs.createReadStream(imgExpected12DiffPath).pipe(concat(function(buf2) {
          buf1.length.should.equal(buf2.length);

          for (var i = 0; i < buf1.length; i++) {
            if (buf1[i] !== buf2[i]) {
              done(false);
            }
          }
          done();
        }));
      }));
    });
  });
});

describe('outputDiff', function() {
  afterEach(function() {
    if (fs.existsSync(tempImgPath)) {
      fs.unlinkSync(tempImgPath);
    }
  });

  it('should error for misinput 1', function(done) {
    PNGDiff.outputDiff('bla', img1Path, 'dest', function(err) {
      err.message.should.equal("ENOENT, open 'bla'");
      done();
    });
  });

  it('should error for misinput 2', function(done) {
    PNGDiff.outputDiff(img1Path, 'bla', 'dest', function(err) {
      err.message.should.equal("ENOENT, open 'bla'");
      done();
    });
  });

  it('should error for incompatible image dimensions', function(done) {
    PNGDiff.outputDiff(img1Path, imgDotPath, 'dest', function(err) {
      err.message.should.equal(
        'Images not the same dimension. First: 1000x494. Second: 1x1.'
      );
      done();
    });
  });

  it('should output the diff', function(done) {
    PNGDiff.outputDiff(img1Path, img2Path, tempImgPath, function(err) {
      should.not.exist(err);

      fs.createReadStream(tempImgPath).pipe(concat(function(buf1) {
        fs.createReadStream(imgExpected12DiffPath).pipe(concat(function(buf2) {
          buf1.length.should.equal(buf2.length);

          for (var i = 0; i < buf1.length; i++) {
            if (buf1[i] !== buf2[i]) {
              done(false);
            }
          }
          done();
        }));
      }));
    });
  });
});
