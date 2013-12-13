var PNGDiff = require('../');

PNGDiff.measureDiff('1.png', '2.png', function(diffMetric) {
  // returns 0 if every pixel's the same; return 1 otherwise. Currently, these
  // are the only two possible metric values; possiblity to tweak them in the
  // future
  console.log(diffMetric);
});

// independent method. Doesn't need to call `measureDiff` first
PNGDiff.outputDiff('1.png', '2.png', 'diffOutput.png', function() {
  // highlights the difference in red
  console.log('Diff saved!');
});
