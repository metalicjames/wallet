angular.module('UserService', [])

.factory('User', function($http, $q, $cookies, coin) {
    return {
        get: function(id) {
            return $http.get('/api/users/' + id);
        },
        
        getKeys: function(id) {
            return $http.get('/api/users/' + id + '/keys').then(function(res) {
                var keys = res.data.keys;
                for(var i in keys) {
                    keys[i].publicKey = 
                    coin.pubkeyToAddress(keys[i].publicKey);
                }
                
                return keys;
            });
        },

        create: function(userData) {
            return $http.post('/api/users', userData);
        },

        newKey: function(id, label) {
            var gen = function() {
                var defer = $q.defer();
                
                var keypair = coin.genKeyPair();
                
                var pbkdf = CryptoJS.algo.PBKDF2.create({ keySize: 8,
                                                          iterations: 100000,
                                                          hasher: 
                                                          CryptoJS.algo.SHA256
                                                        });
                var salt = CryptoJS.lib.WordArray.random(32);
                var encKey = pbkdf.compute($cookies.get('password'), salt);                                    
                                                           
                var iv = CryptoJS.lib.WordArray.random(16);
               
                var cipherText = CryptoJS.AES.encrypt(keypair.priv, 
                                                      encKey, 
                                                      { iv: iv });
                var keyData = {
                    label: label,
                    publicKey: keypair.pub,
                    cipherText: CryptoJS.enc.Base64
                                        .stringify(cipherText.ciphertext),
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

