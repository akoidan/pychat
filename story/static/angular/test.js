var demoApp = angular.module('demoApp', ['ngRoute']);

//demoApp.controller('SimpleController', function ($scope) {
//	$scope.names = [
//		{name: 'Dave', city: 'New York'},
//		{name: 'Napur', city: 'Paris'},
//		{name: 'Heedy', city: 'Boston'}
//	];
//});

var controllers = {};
controllers.SimpleController = function ($scope, simpleFactory ) {
	$scope.names = [];
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

	}
};

demoApp.controller(controllers);

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

