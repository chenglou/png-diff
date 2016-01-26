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

var img2Stream;
var img2Buf;

function _compareDiff(actualStream, done) {
  actualStream.pipe(concat(function(buf1) {
    fs.createReadStream(imgExpected12DiffPath).pipe(concat(function(buf2) {
      buf1.length.should.equal(buf2.length);

      for (var i = 0; i < buf1.length; i++) {
        if (buf1[i] !== buf2[i]) {
          fs.writeFileSync(__dirname + 'fixtures/failTest.png', buf1);
          done(new Error('Test failed, image output at fixtures/failTest.png'));
          return;
        }
      }
      done();
    }));
  }));
}

describe('outputDiffStream', function() {
  beforeEach(function() {
    img2Stream = fs.createReadStream(img2Path);
    img2Buf = fs.readFileSync(img2Path);
  });

  it('should error for misinput', function(done) {
    PNGDiff.outputDiffStream('bla', img1Path, function(err, res) {
      err.message.should.equal("ENOENT: no such file or directory, open 'bla'");
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

  it('should accept a stream', function(done) {
    PNGDiff.outputDiffStream(img1Path, img2Stream, function(err, res) {
      should.not.exist(err);

      _compareDiff(res, done);
    });
  });

  it('should accept a buffer', function(done) {
    PNGDiff.outputDiffStream(img1Path, img2Buf, function(err, res) {
      should.not.exist(err);

      _compareDiff(res, done);
    });
  });

  it('should output the diff as a stream', function(done) {
    PNGDiff.outputDiffStream(img1Path, img2Path, function(err, res) {
      should.not.exist(err);

      _compareDiff(res, done);
    });
  });
});

describe('outputDiff', function() {
  beforeEach(function() {
    img2Stream = fs.createReadStream(img2Path);
    img2Buf = fs.readFileSync(img2Path);
  });

  afterEach(function() {
    if (fs.existsSync(tempImgPath)) {
      fs.unlinkSync(tempImgPath);
    }
  });

  it('should error for misinput', function(done) {
    PNGDiff.outputDiff('bla', img1Path, 'dest', function(err) {
      err.message.should.equal("ENOENT: no such file or directory, open 'bla'");
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

  it('should accept a stream', function(done) {
    PNGDiff.outputDiff(img1Path, img2Stream, tempImgPath, function(err) {
      should.not.exist(err);

      _compareDiff(fs.createReadStream(tempImgPath), done);
    });
  });

  it('should accept a buffer', function(done) {
    PNGDiff.outputDiff(img1Path, img2Buf, tempImgPath, function(err) {
      should.not.exist(err);

      _compareDiff(fs.createReadStream(tempImgPath), done);
    });
  });

  it('should output the diff', function(done) {
    PNGDiff.outputDiff(img1Path, img2Path, tempImgPath, function(err) {
      should.not.exist(err);

      _compareDiff(fs.createReadStream(tempImgPath), done);
    });
  });
});
