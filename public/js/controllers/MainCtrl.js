angular.module('MainCtrl', []).controller('MainController', 
                                          function($scope, auth) {
    $scope.auth = auth;
});
