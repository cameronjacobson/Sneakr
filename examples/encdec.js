// Example of node module that performs encryption / decryption
// ** This node module is based on RSA js libraries in the wild

var rsa = require('../node/RSA.js');

var modulus = "8df3ef2e5bca81aebed5ea254738d6703c88cabab0ce18d980cfbfe73de5d928310ad05be1b4b307e4876a466d054e6708de86765143595d99f1d2597a428ea5";
var pubexp = "65537";
var privexp = "6f29e8e31b2aa66a831932356ffd4b14e0ce0f6fdcd56c416d00c4f7ee092945b2f509f6e44bad2a181b6b53e26c3c055c98b09ae5d3a51f7a4fbe0c4e04ca07";

var key = createKey(512, pubexp, privexp, modulus);

var tmp;

// ENCRYPT
tmp = key.d;
key.d = null;
var encrypted = rsa.encryptedString(key, "this is a test")
key.d = tmp;

//console.log(key);
console.log(encrypted);

// DECRYPT
tmp = key.e;
key.e = null;
console.log(rsa.decryptedString(key,encrypted))
key.e = tmp;



function createKey(keySize,pubexp,privexp,mod) {
    if(keySize==128){
        rsa.setMaxDigits(19);
    }
    else if(keySize==256){
        rsa.setMaxDigits(38);
    }
    else if(keySize==512){
        rsa.setMaxDigits(76);
    }
    else if(keySize==1024){
        rsa.setMaxDigits(130);
    }
    else if(keySize==2048){
        rsa.setMaxDigits(260);
    }
    else {
        throw ('invalid keySize')
    }

    return new rsa.RSAKeyPair(pubexp,privexp,mod);
}
