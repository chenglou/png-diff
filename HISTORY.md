Legend:
  - [I]: improvement
  - [F]: fix

### 0.3.2 (January 26th 2016)
- [I] New option to output identical pixels as transparent ones.

### 0.3.1 (August 17th 2015)
- [I] Switch to using pngjs2. No API change.

## 0.3.0 (March 12th 2014)
- [F] Deprecate `measureDiff`. The `diffMetric` is now the third argument to the `outputDiffStream` callback and second for `outputDiff`. The underlying reason is that it was possible to measure streams and then do `outputDiff`, except by then, the stream would already have been piped by `measureDiff`, which causes weird bug messages.

### 0.2.1 (March 9th 2014)
- [I] All three methods now accept buffers as input too.

## 0.2.0 (March 8th 2014)
- [I] New `outputDiffStream` that gives you back a stream. See README and example folder.
- [I] All three methods can now accept streams, in addition to the old file path arguments.
- [I] Proper error messages that are actually of the Error class.

### 0.1.4 (March 2nd 2014)
- [F] Fix callback executing before output has been written.
- [I] The same callback can now receive error, if any.

### 0.1.3 (February 10th 2014)
- [I] Show images dimensions when a size mismatch happens.

### 0.1.1 (December 20th 2013)
- [I] No more error throwing internally; better async compatibility.

## 0.1.0 (December 13th 2013)
- [I] Pass error as first parameter to callback.

## 0.0.0 (December 13th 2013)
- Initial public release.
