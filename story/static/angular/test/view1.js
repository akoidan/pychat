console.log("file parsed");
demoApp.filter('myFilter', function ($sce) {

	return function (input, isRaw) {
		input = input.replace(/a/g, 'b');
		return $sce.trustAsHtml(input);
	};

});

demoApp.controller("SimpleController1", function ($scope, simpleFactory) {
	$scope.names = [

		{name: 'Nick', city: 'London'},
		{name: 'Sick', city: 'Tokio'},
		{name: 'Brick', city: 'cellar'}
	];


});