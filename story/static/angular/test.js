var demoApp = angular.module('demoApp', ['ngRoute',  'app.directives.contactCard']);

//demoApp.controller('SimpleController', function ($scope) {
//	$scope.names = [
//		{name: 'Dave', city: 'New York'},
//		{name: 'Napur', city: 'Paris'},
//		{name: 'Heedy', city: 'Boston'}
//	];
//});


demoApp.controller("SimpleController", function ($scope, simpleFactory, simpleService ) {
	$scope.names = [];
	var promise = simpleService.get();
	promise.then(function(data) {
		$scope.service = data.data;
	});

	init();
	function init() {
		$scope.names  = simpleFactory.getNames();
	}

	$scope.addCustomer = function () {
		$scope.names.push({
				name: $scope.new.name,
				city: $scope.new.city
			}
		)

	};
});

demoApp.config(function ($routeProvider) {
	$routeProvider
		.when('/view1', {
			controller: 'SimpleController',
			templateUrl: 'View1.html'
		})
		.when('/view2',
		{
			controller: 'SimpleController',
			templateUrl: 'View2.html'
		})
		.otherwise({redirectTo: '/view1'});
});

demoApp.factory('simpleFactory', function() {
	var names = [
		{name: 'Dave', city: 'New York'},
		{name: 'Napur', city: 'Paris'},
		{name: 'Heedy', city: 'Boston'}
	];
	var factory = {};
	factory.getNames = function() {
		return names;
	};
	factory.postCustomer = function(customer) {
		//
	};
	return factory;
});

demoApp.service('simpleService', function($http, $q) {
	var deffer = $q.defer();
	$http.get('/static/smileys/info.json').then(function (data) {
		deffer.resolve(data);
	});

	this.get = function() {
		return deffer.promise;
	}

});
