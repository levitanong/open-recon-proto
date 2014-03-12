var app = angular.module('recon', []);

app.constant('curUser', {
		name: 'Mayor Lucia L. Astorga',
		address: {
			district: null,
			department: null,
			region: 8,
			province: 'Western Samar',
			city: null,
			town: 'Daram',
			barangay: null,
			sitio: null
		}
	}
);

app.controller('Main', function($scope, curUser){
	$scope.reqList = ['hi', 'ho'];
	$scope.curUser = curUser;
	$scope.curView = 'List';

	$scope.setView = function(str){
		$scope.curView = str;
	}

	$scope.genReqList = function(qty){

	}
});

app.controller('List', function($scope){

});

app.controller('New', function($scope){

});

app.controller('Account', function($scope, curUser){
	$scope.curUser = curUser;

});