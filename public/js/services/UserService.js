angular.module('UserService', [])

.factory('User', function($http, $q, $cookies) {

    return {
        get: function(id) {
            return $http.get('/api/users/' + id);
        },
        
        getKeys: function(id) {
            return $http.get('/api/users/' + id + '/keys');
        },

        create: function(userData) {
            return $http.post('/api/users', userData);
        },

        newKey: function(id, label) {
            var gen = function() {
                var defer = $q.defer();
                
                var ec = new elliptic.ec('secp256k1');
                
                var key = ec.genKeyPair();
                
                // Pubkey in form z||x||y where z is 0x04
                var pubPoint = key.getPublic().encode();
                
                var base64PubPoint = base64js.fromByteArray(pubPoint);
                
                var privateKey = key.getPrivate().toArray();
                var base64PrivateKey = base64js.fromByteArray(privateKey);
                
                var pbkdf = CryptoJS.algo.PBKDF2.create({ keySize: 8,
                                                          iterations: 100000,
                                                          hasher: 
                                                          CryptoJS.algo.SHA256});
                var salt = CryptoJS.lib.WordArray.random(32);
                var encKey = pbkdf.compute($cookies.get('password'), salt);                                    
                                                           
                var iv = CryptoJS.lib.WordArray.random(16);
               
                var cipherText = CryptoJS.AES.encrypt(base64PrivateKey, 
                                                      encKey, 
                                                      { iv: iv });
                var keyData = {
                    label: label,
                    publicKey: base64PubPoint,
                    cipherText: CryptoJS.enc.Base64.stringify(cipherText.ciphertext),
                    iv: CryptoJS.enc.Base64.stringify(iv),
                    salt: CryptoJS.enc.Base64.stringify(salt)
                };
               
                defer.resolve(keyData);
                
                return defer.promise;
            };
            
            return gen().then(function(res) {
                return $http.post('/api/users/' + id + '/keys', res);
            });
        }
    }   
});

