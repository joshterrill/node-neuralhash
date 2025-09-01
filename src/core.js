import fs from "fs";
import path from "path";
import * as ort from "onnxruntime-node";
import Jimp from "jimp";

const __dirname = path.dirname(new URL(import.meta.url).pathname);

const modelPath = path.join(__dirname, "model.onnx");
const seedPath = path.join(__dirname, "neuralhash_128x96_seed1.dat");

const session = await ort.InferenceSession.create(modelPath);

// Load seed matrix
const seedBuffer = fs.readFileSync(seedPath);
const seed = new Float32Array(seedBuffer.buffer, seedBuffer.byteOffset + 128, (96 * 128));

/**
 * Compute NeuralHash for an image
 * @param {string} imagePath - Path to the image
 * @returns {Promise<string>} - Hash as hex string
 */
export async function getNeuralHashHex(imagePath) {
  const image = await Jimp.read(imagePath);
  image.resize(360, 360).rgba(true);

  // Convert to float32 tensor, normalize [-1, 1]
  const imgArray = new Float32Array(360 * 360 * 3);
  let idx = 0;
  for (let y = 0; y < 360; y++) {
    for (let x = 0; x < 360; x++) {
      const { r, g, b } = Jimp.intToRGBA(image.getPixelColor(x, y));
      imgArray[idx++] = (r / 255.0) * 2 - 1;
      imgArray[idx++] = (g / 255.0) * 2 - 1;
      imgArray[idx++] = (b / 255.0) * 2 - 1;
    }
  }

  // NH expects [1, 3, 360, 360]
  const inputTensor = new ort.Tensor("float32", imgArray, [1, 3, 360, 360]);
  const feeds = { [session.inputNames[0]]: inputTensor };
  const results = await session.run(feeds);
  const logits = results[session.outputNames[0]].data;

  const projection = new Array(96).fill(0);
  for (let i = 0; i < 96; i++) {
    for (let j = 0; j < 128; j++) {
      projection[i] += seed[i * 128 + j] * logits[j];
    }
  }

  const bits = projection.map(x => (x >= 0 ? "1" : "0")).join("");
  const hashHex = BigInt("0b" + bits).toString(16).padStart(bits.length / 4, "0");

  return hashHex;
}
