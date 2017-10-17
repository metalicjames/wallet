angular.module('UserCtrl', []).controller('UserController', 
                                          function($scope, User, 
                                                   $routeParams, $q, coin) {
    
    $scope.key = {};  
    $scope.send = {};

    $scope.updateBalance = function() {
        User.getBalance($routeParams.user_id).then(function(res) {
            $scope.balance = res / 100000000.0;
        });
    }; 
    
    $scope.updateBalance();
    
    $scope.updateKeys = function() {
        User.getKeys($routeParams.user_id).then(function(res) {
            $scope.keys = res;
        });
    };
         
    $scope.updateKeys();
    
    $scope.newKey = function() {
        $scope.message = "Generating...";
        User.newKey($routeParams.user_id, 
                    $scope.key.label)
        .then(function(res) {
            if(res.data.message) {
                $scope.message = res.data.message
                                    .join('<br>');
            }
            if(res.data.success) {
                $scope.updateKeys();
            }
            $scope.message = "Done";
        });
    };
    
    $scope.sendToAddress = function() {
        $scope.message = "Sending...";
        User.getUtxos($routeParams.user_id).then(function(utxos) {
            User.getNewKey($routeParams.user_id, "change " + Date.now()).then(
                function(changeAddr) {
                    $scope.updateKeys();
                    User.getKeys($routeParams.user_id).then(function(keys) {
                        coin.sendToAddress($scope.send.address, 
                           $scope.send.amount * 100000000, 
                           utxos, 
                           changeAddr.publicKey,
                           keys,
                           function(err, res) {
                                if(err) {
                                   $scope.message = err; 
                                } else {
                                   $scope.message = "Sent";
                                }
                        });
                    });
                }
            )
        });
    };
})

.controller('LoginController', function($scope, $http, API, 
                                        User, $location, auth, $cookies) {
    if(auth.isAuthed()) {
        $location.path("/");
    }
   
    $scope.login = function() {
        $scope.message = "Logging in...";
        var callback = function(res) {
            $scope.message = res.data.message;
            if(res.data.success) {
                var expiry = new Date();
                expiry.setDate(expiry.getDate() + (1.0/48));
                $cookies.put('password', $scope.password, {expiry: expiry});
                $location.path("/");
            }
        };
        
        return $http.post(API + '/authenticate', {
            name: $scope.username,
            password: CryptoJS.SHA3($scope.password).toString()
        }).then(callback, callback);
    };
    
    $scope.register = function() {
        $scope.message = "Registering...";
        var callback = function(res) {
            $scope.message = res.data.message;
            if(res.data.success) {
                $scope.login();
            }
        };
        
        return User.create({
            name: $scope.username,
            password: CryptoJS.SHA3($scope.password).toString()
        }).then(callback, callback);
    };
});