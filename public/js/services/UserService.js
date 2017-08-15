angular.module('UserService', [])

.factory('User', ['$http', function($http) {

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
            var ec = new elliptic.ec('secp256k1');
            
            var key = ec.genKeyPair();
            
            var keyData = {
                label: label,
                publicKey: key.getPublic()
            };
            
            console.log(keyData);
            
            return $http.post('/api/users/' + id + '/keys', keyData);
        }
    }       

}]);