var fs = require('fs');

var PNGDiff = require('../');

var image2Buffer = fs.readFileSync('2.png');
PNGDiff.measureDiff('1.png', image2Buffer, function(err, diffMetric) {
  if (err) throw err;
  // returns 0 if every pixel's the same; return 1 otherwise. Currently, these
  // are the only two possible metric values; possiblity to tweak them in the
  // future
  console.log(diffMetric);
});

var image2Stream = fs.createReadStream('2.png');
PNGDiff.outputDiff('1.png', image2Stream, 'diffOutput.png', function(err) {
  if (err) throw err;
  // highlights the difference in red
  console.log('Diff saved!');
});

var image1Stream = fs.createReadStream('1.png');
PNGDiff.outputDiffStream(image1Stream, '2.png', function(err, outputStream) {
  if (err) throw err;
  outputStream.pipe(fs.createWriteStream('diffOutput2.png'));
});
