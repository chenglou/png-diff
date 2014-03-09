var fs = require('fs');

var PNGDiff = require('../');

PNGDiff.measureDiff('1.png', '2.png', function(err, diffMetric) {
  if (err) throw err;
  // returns 0 if every pixel's the same; return 1 otherwise. Currently, these
  // are the only two possible metric values; possiblity to tweak them in the
  // future
  console.log(diffMetric);
});

// independent method. Doesn't need to call `measureDiff` first
var readStream2 = fs.createReadStream('2.png');
PNGDiff.outputDiff('1.png', readStream2, 'diffOutput.png', function(err) {
  if (err) throw err;
  // highlights the difference in red
  console.log('Diff saved!');
});

var readStream1 = fs.createReadStream('1.png');
PNGDiff.outputDiffStream(readStream1, '2.png', function(err, outputStream) {
  if (err) throw err;
  // do whatever with the stream
});
