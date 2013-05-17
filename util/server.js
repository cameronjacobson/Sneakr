// Example of node module that performs encryption / decryption
// ** This node module is based on RSA js libraries in the wild

var rsa = require('../node/RSA.js');
var qs = require('querystring');
var http = require('http');
var url = require('url');

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

http.createServer(function (req, res) {

  var body = '';

  req.on('end',function(){

	var url_parts = url.parse(req.url,true);
	var query = url_parts.query;

	var keylen = query.keylen;
	var modulus = query.modulus;
	var pubexp = query.pubexponent;
	var privexp = "";
	var key = createKey(keylen, pubexp, privexp, modulus);
	var encrypted = rsa.encryptedString(key, "this is a test")

	res.writeHead(200, {'Content-Type': 'text/plain'});
	res.end(query.callback+'("'+encrypted+'")');
  });


}).listen(9700);

