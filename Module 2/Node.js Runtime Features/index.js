/**
 * Node.js Runtime Features — Streams, Buffers & the File System
 *
 * Move the same file in two ways:
 * 1) Read the complete file into memory with fs.readFile.
 * 2) Copy it using a readable stream piped to a writable stream.
 */

const fs = require('fs');
const path = require('path');

const INPUT = path.join(__dirname, 'sample-data.txt');
const OUTPUT = path.join(__dirname, 'sample-copy.txt');

// PART 1: Read the whole file into memory.
function readWholeFile() {
  fs.readFile(INPUT, (error, data) => {
    if (error) {
      console.error('readFile error:', error.message);
      return;
    }

    // data is a Buffer because no text encoding was supplied.
    console.log(`readFile: loaded ${data.length} bytes into memory`);
  });
}

// PART 2: Copy the file using streams.
function streamFile() {
  const readable = fs.createReadStream(INPUT);
  const writable = fs.createWriteStream(OUTPUT);

  readable.on('error', (error) => {
    console.error('stream read error:', error.message);
    writable.destroy();
  });

  writable.on('error', (error) => {
    console.error('stream write error:', error.message);
  });

  writable.on('finish', () => {
    console.log('stream: finished copying via 64KB chunks (flat memory)');
  });

  readable.pipe(writable);
}

// PART 3: Explanation
// readFile loads the entire file into memory before its callback runs, so a
// very large file can consume a lot of RAM. A stream processes the file in
// small chunks and passes each chunk to the destination, keeping memory usage
// much lower and more consistent even when the file is large.

// Run both approaches.
readWholeFile();
streamFile();

module.exports = { readWholeFile, streamFile, INPUT, OUTPUT };
