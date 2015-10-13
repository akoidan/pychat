angular.module('app.directives.contactCard', [] )
	.directive('contactCard', function() {
		return {
			restrict: 'A',
			controller: function($scope) {
				console.log($scope.data)
			},
			scope: {
				data: '='
			},
			templateUrl: "template.html"
		}
	}
);

