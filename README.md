# Node NeuralHash

This is a library that exposes the [Apple Neuralhash](https://www.apple.com/child-safety/pdf/CSAM_Detection_Technical_Summary.pdf) model, which can be used to determine similar images, even if the images are not exactly the same.


## Installation

From npm:

```bash
npm install neuralhash
```

## Usage

NodeJS API:

```javascript
import { getNeuralHashHex } from "neuralhash";

const hash = await getNeuralHashHex("/path/to/image.png");
console.log(hash);
// a0cca3edec8339d006068f1d
```

CLI:

```bash
npx neuralhash /path/to/image.png
# /path/to/image.png: a0cca3edec8339d006068f1d
```

Hash multiple files at once:

```bash
npx neuralhash image1.png image2.jpg
# image1.png: a0cca3edec8339d006068f1d
# image2.png: ab13fcd08dd3b0a31b07fa2e
```

## License

MIT