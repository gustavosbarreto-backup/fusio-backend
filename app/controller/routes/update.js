'use strict';

module.exports = function($scope, $http, $uibModalInstance, fusio, route) {

  $scope.route = route;

  $scope.methods = ['GET', 'POST', 'PUT', 'DELETE'];
  $scope.schemas = [];
  $scope.actions = [];

  $scope.statuuus = [{
    key: 4,
    value: "Development"
  }, {
    key: 1,
    value: "Production"
  }, {
    key: 2,
    value: "Deprecated"
  }, {
    key: 3,
    value: "Closed"
  }];

  $scope.update = function(route) {
    var data = angular.copy(route);

    // remove active key
    if (angular.isObject(data.config)) {
      for (var i = 0; i < data.config.length; i++) {
        if (data.config[i].hasOwnProperty('active')) {
          delete data.config[i].active;
        }
      }
    }

    $http.put(fusio.baseUrl + 'backend/routes/' + route.id, data)
      .then(function(response) {
        var data = response.data;
        $scope.response = data;
        if (data.success === true) {
          $uibModalInstance.close(data);
        }
      })
      .catch(function(response) {
        $scope.response = response.data;
      });
  };

  $http.get(fusio.baseUrl + 'backend/routes/' + route.id)
    .then(function(response) {
      var data = response.data;
      // check and add missing methods
      if (data.config) {
        var config = [];
        for (var version in data.config) {
          var ver = data.config[version];
          var methods = {};
          for (var i = 0; i < $scope.methods.length; i++) {
            if (ver.methods.hasOwnProperty($scope.methods[i])) {
              methods[$scope.methods[i]] = ver.methods[$scope.methods[i]];
            } else {
              methods[$scope.methods[i]] = {};
            }
          }
          ver.methods = methods;
          config.push(ver);
        }
        data.config = config;
      }

      $scope.route = data;
    });

  $http.get(fusio.baseUrl + 'backend/action')
    .then(function(response) {
      $scope.actions = response.data.entry;
    });

  $http.get(fusio.baseUrl + 'backend/schema')
    .then(function(response) {
      $scope.schemas = response.data.entry;
    });

  $scope.close = function() {
    $uibModalInstance.dismiss('cancel');
  };

  $scope.closeResponse = function() {
    $scope.response = null;
  };

  $scope.addVersion = function() {
    var versions = [];
    for (var i = 0; i < $scope.route.config.length; i++) {
      var version = $scope.route.config[i];
      version.active = false;

      versions.push(version);
    }

    versions.push($scope.newVersion());

    $scope.route.config = versions;
  };

  $scope.newVersion = function() {
    var version = {
      version: $scope.getLatestVersion() + 1,
      active: true,
      status: 4,
      methods: {}
    };

    for (var i = 0; i < $scope.methods.length; i++) {
      version.methods[$scope.methods[i]] = {};
    }

    return version;
  };

  $scope.getLatestVersion = function() {
    var version = 0;
    for (var i = 0; i < $scope.route.config.length; i++) {
      var ver = parseInt($scope.route.config[i].version);
      if (ver > version) {
        version = ver;
      }
    }
    return version;
  };

};
