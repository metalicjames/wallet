angular.module('UserCtrl', []).controller('UserController', 
                                          function($scope, User, 
                                                   $routeParams, $q, coin) {
    
    $scope.key = {};  

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