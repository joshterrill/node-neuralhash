#!/usr/bin/env node
import { getNeuralHashHex } from "../src/core.js";
import { program } from "commander";

program
  .name("neuralhash")
  .description("Compute NeuralHash (hex) for one or more images")
  .option("--output-only", "Print only the hash output(s), without filenames")
  .argument("<images...>", "Path(s) to image files")
  .action(async (images, options) => {
    for (const img of images) {
      try {
        const hash = await getNeuralHashHex(img);
        if (options.outputOnly) {
          console.log(hash);
        } else {
          console.log(`${img}: ${hash}`);
        }
      } catch (err) {
        console.error(`Error processing ${img}:`, err.message);
        process.exit(1);
      }
    }
  });

program.parse();
