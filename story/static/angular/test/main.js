var demoApp = angular.module('demoApp', ['ngRoute']);

demoApp.controller("SimpleController", function ($scope, simpleFactory) {
	$scope.names = [];
	init();
	function init() {
		$scope.names = simpleFactory.getNames();
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
			controller: 'SimpleController2',
			templateUrl: 'View1.html',
			resolve: {
				lol : function get() {
					console.log('file is being loaded');
					var fileRef = document.createElement('script');
					fileRef.setAttribute("type", "text/javascript");
					fileRef.setAttribute("src", "view1.js");
					document.getElementsByTagName("head")[0].appendChild(fileRef);
					fileRef.onload = function () {
						console.log('file loaded');
					}

				}
			}
		})
		.when('/view2',
		{
			controller: 'SimpleController',
			templateUrl: 'View2.html'
		})
		.otherwise({redirectTo: '/view1'});
});

console.log('config has been added');

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

