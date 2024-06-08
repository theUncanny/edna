import {
  decryptBlobAsString,
  encryptStringAsBlob,
  generateSalt,
  hash,
} from "kiss-crypto";

let s = "this is an original string";

let salt1 = "3b8fd0438e8c300e4fb6a1de241f8599";
//let salt1 = generateSalt();
//console.log("salt:", salt1);

let pwd = "this is a password";
let key1 = hash({ key: pwd, salt: salt1 });

let blob = encryptStringAsBlob({ key: key1, plaintext: s });

let d1 = decryptBlobAsString({ key: key1, cipherblob: blob });
console.log(d1);

//let salt2 = generateSalt();
//let key2 = hash({ key: pwd, salt: salt2 });
//let d2 = decryptBlobAsString({ key: key2, cipherblob: blob });
//console.log(d2);
