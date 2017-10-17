angular.module('CoinService', [])

.service('coin', function($http, $cookies) {
    this.ec = new elliptic.ec('secp256k1');
    
    this.decryptKey = function(key) {
        var pbkdf = CryptoJS.algo.PBKDF2.create({ keySize: 8,
                                                  iterations: 100000,
                                                  hasher: 
                                                  CryptoJS.algo.SHA256
                                                });
        
        var encKey = pbkdf.compute($cookies.get('password'), 
                                   CryptoJS.enc.Base64.parse(key.salt)); 
        
        var privKey = CryptoJS.AES.decrypt(CryptoJS.lib.CipherParams.create({
            ciphertext: CryptoJS.enc.Base64.parse(key.cipherText)}), 
            encKey, 
            { iv: CryptoJS.enc.Base64.parse(key.iv) });
                                          
        return privKey;
    };
    
    this.genKeyPair = function() {      
        var key = this.ec.genKeyPair();
        
        // Pubkey in form z||x||y where z is 0x04
        var pubPoint = key.getPublic().encode();
        
        var base64PubPoint = base64js.fromByteArray(pubPoint);
        
        var privateKey = key.getPrivate().toArray();
        var base64PrivateKey = base64js.fromByteArray(privateKey);
        
        var keypair = {
            pub: base64PubPoint,
            priv: base64PrivateKey
        };
        
        return keypair;
    };
    
    this.pubkeyToAddress = function(pubkey) {
        return pubkey;
    };
    
    this.sendToAddress = function(address, 
                                  amount, 
                                  utxos, 
                                  changeAddr, 
                                  keys, 
                                  callback) {
        // Build transaction
        var byteAddr = base64js.toByteArray(address);
        var pub = {x: byteAddr.slice(1, 33), y: byteAddr.slice(33)};

        var key = this.ec.keyFromPublic(pub);
        
        var toSpend = [];
        var accumulator = 0;
        var fee = 15000;
        
        for(var i in utxos) {
            if(accumulator < amount + fee) {
                if(!utxos[i].contract) {
                    fee += JSON.stringify(utxos[i]).length * 100;
                    accumulator += utxos[i].value;
                    toSpend.push(utxos[i]);
                }
            } else {
                break;
            }
        }
        
        if(accumulator < amount + fee) {
            callback("Insufficient funds when " + (fee / 100000000.0).toString() 
                   + " fee included", null);
            return;
        } 
        
        var outputs = [];
        
        if(accumulator - amount - fee > 0) {
            outputs.push({
                data: {
                    publicKey: changeAddr
                },
                nonce: Math.floor((Math.random() * 100000000) + 1),
                value: accumulator - amount - fee
            });
        }
        
        outputs.push({
            data: {
                publicKey: address
            },
            nonce: Math.floor((Math.random() * 100000000) + 1),
            value: amount
        });
        
        var decryptKey = this.decryptKey;
        var ec = this.ec;

        $http.post('/api/blockchain/util/getoutputsetid', {outputs: outputs})
        .then(function(res) {
            if(!res.data.success) {
                callback(res.data.message, null);
                return;
            }
            
            var outputSetId = res.data.id;
            
            var decKeys = {};
            
            var inputs = [];
            
            // Sign
            for(var i in toSpend) {
                if(!decKeys[toSpend[i].data.publicKey]) {
                    for(var j in keys) {
                        if(keys[j].publicKey == toSpend[i].data.publicKey) {
                            decKeys[toSpend[i].data.publicKey] = 
                            base64js.toByteArray(
                            CryptoJS.enc.Base64.stringify(
                            decryptKey(keys[j])
                            ));
                            break;
                        }
                    }
                }
                            
                var ecKey = ec.keyFromPrivate(decKeys[toSpend[i].data.publicKey]);
                
                var toSign = base64js.toByteArray(
                            CryptoJS.enc.Base64.stringify(
                            CryptoJS.enc.Utf8.parse(
                            CryptoJS.SHA256(toSpend[i].id + outputSetId).toString())));
                
                var sig = ecKey.sign(toSign).toDER();
                inputs.push({
                    outputId: toSpend[i].id,
                    data: {
                        signature: base64js.fromByteArray(sig)
                    }
                });
            }
            
            var tx = {
                inputs: inputs,
                outputs: outputs,
                timestamp: Math.round((new Date()).getTime() / 1000)
            };
            
            // Broadcast
            
            $http.post('/api/blockchain/util/sendrawtransaction', {tx: tx})
            .then(function(res) {
                callback(null, res);
            });
            
        });
    };
});