angular.module('CoinService', [])

.service('coin', function() {
    this.ec = new elliptic.ec('secp256k1');
    
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
    
    this.sendToAddress = function(address, amount) {
        // Build transaction
        // Sign
        // Broadcast
    };
});