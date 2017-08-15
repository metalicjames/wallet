angular.module('UserCtrl', []).controller('UserController', 
                                          function($scope, User, $routeParams) {
    $scope.keys = User.getKeys($routeParams.user_id);
    
    $scope.newKey = User.newKey($routeParams.user_id, 'test');
})

.controller('LoginController', function($scope, $http, API, 
                                        User, $location, auth) {
    if(auth.isAuthed()) {
        $location.path("/");
    }
   
    $scope.login = function() {
        $scope.message = "Logging in...";
        var callback = function(res) {
            $scope.message = res.data.message;
            if(res.data.success) {
                $location.path("/");
            }
        };
        
        return $http.post(API + '/authenticate', {
            name: $scope.username,
            password: $scope.password
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
            password: $scope.password
        }).then(callback, callback);
    };
});