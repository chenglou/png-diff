# PNG Diff
Small PNG diff utility, written in pure JS for Node.

```bash
npm install png-diff
```

## Usage

(_Check out the example folder._)

All three methods take two image paths/streams/buffers as input.

### Get a diff value between two images

```js
var PNGDiff = require('png-diff');

var image2Buffer = fs.readFileSync('2.png');
PNGDiff.measureDiff('1.png', image2Buffer, function(err, diffMetric) {
  if (err) throw err;
  // returns 0 if every pixel's the same; return 1 otherwise. Currently, these
  // are the only two possible metric values; possiblity to tweak them in the
  // future
  console.log(diffMetric);
});
```

### Save a diff output

```js
var PNGDiff = require('png-diff');

var readStream2 = fs.createReadStream('2.png');
PNGDiff.outputDiff('1.png', readStream2, 'diffOutput.png', function(err) {
  if (err) throw err;
  // highlights the difference in red
  console.log('Diff saved!');
});
```

### Get the diff stream rather than the output

```js
var PNGDiff = require('png-diff');

var readStream1 = fs.createReadStream('1.png');
PNGDiff.outputDiffStream(readStream1, '2.png', function(err, outputStream) {
  if (err) throw err;
  outputStream.pipe(fs.createWriteStream('diffOutput2.png'));
});
```

## License
MIT.
