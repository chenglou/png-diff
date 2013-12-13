# PNG Diff
FSmall PNG diff utility, written in pure JS for Node.ast, light and hassle-free JavaScript data structures, written in CoffeeScript.

```bash
npm install png-diff
```

## Usage

### Get a diff value between two images

```js
var PNGDiff = require('png-diff');

PNGDiff.measureDiff('1.png', '2.png', function(diffMetric) {
  // returns 0 if every pixel's the same; return 1 otherwise. Currently, these
  // are the only two possible metric values; possiblity to tweak them in the
  // future
  console.log(diffMetric);
});
```

### Save a diff output

```js
var PNGDiff = require('png-diff');

PNGDiff.outputDiff('1.png', '2.png', 'output.png', function() {
  // highlights the difference in red
  console.log('Diff saved!');
});
```

## License
MIT.
