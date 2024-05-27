import {
  decryptBlobAsString,
  encryptStringAsBlob,
  generateEncryptionKey,
  generateSalt,
  hash,
} from "kiss-crypto";

const plaintext = "hello world";

export async function encryptString(s) {}

/*
const ciphertext = await encryptStringAsBlob({
  key,
  plaintext,
});

const decrypted = await decryptBlobAsString({
  key,
  blob,
});
*/

export function generateEncryptionKeyFromPassword(password) {
  let salt = generateSalt();
  let key = hash({ key: password, salt });
  return key;
}
