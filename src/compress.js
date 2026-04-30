// compress.js — utilities for compressing and decompressing session data

const zlib = require('zlib');

/**
 * Compress a session object to a base64-encoded gzip string.
 * @param {object} session
 * @returns {string} compressed base64 string
 */
function compressSession(session) {
  const json = JSON.stringify(session);
  const buf = zlib.gzipSync(Buffer.from(json, 'utf8'));
  return buf.toString('base64');
}

/**
 * Decompress a base64-encoded gzip string back to a session object.
 * @param {string} compressed
 * @returns {object} session
 */
function decompressSession(compressed) {
  const buf = Buffer.from(compressed, 'base64');
  const json = zlib.gunzipSync(buf).toString('utf8');
  return JSON.parse(json);
}

/**
 * Return the compressed size in bytes for a session.
 * Useful for storage estimates.
 * @param {object} session
 * @returns {number} byte length of compressed payload
 */
function compressedSize(session) {
  const compressed = compressSession(session);
  return Buffer.byteLength(compressed, 'base64');
}

/**
 * Compare raw JSON size vs compressed size for a session.
 * @param {object} session
 * @returns {{ raw: number, compressed: number, ratio: string }}
 */
function compressionStats(session) {
  const raw = Buffer.byteLength(JSON.stringify(session), 'utf8');
  const compressed = compressedSize(session);
  const ratio = raw > 0 ? ((1 - compressed / raw) * 100).toFixed(1) + '%' : '0%';
  return { raw, compressed, ratio };
}

module.exports = { compressSession, decompressSession, compressedSize, compressionStats };
