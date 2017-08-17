angular.module('UserCtrl', []).controller('UserController', 
                                          function($scope, User, 
                                                   $routeParams, $q) {
    
    $scope.key = {};            
    User.getKeys($routeParams.user_id).then(function(res) {
        $scope.keys = res.data.keys;
    });
    
    $scope.newKey = function() {
                        var defer = $q.defer();
                        User.newKey($routeParams.user_id, 
                                $scope.key.label)
                        .then(function(res) {
                                if(res.data.message) {
                                    $scope.message = res.data.message
                                                        .join('<br>');
                                }
                                if(res.data.success) {
                                    User.getKeys($routeParams.user_id).then(
                                    function(res) {
                                        $scope.keys = res.data.keys;
                                    });
                                    defer.resolve('Key generated');
                                } else {
                                    defer.reject('Failed to generate key');
                                }
                              });
                              
                        return defer.promise;
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