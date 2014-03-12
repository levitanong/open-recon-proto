var app = angular.module('recon', []);

// values and constants

app.constant('curUser', {
	name: 'Mayor Lucia L. Astorga',
	income: null,
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
});

app.constant('types', {
	'disaster': ['Earthquake', 'Flood', 'Typhoon', 'Landslide', 'Anthropogenic'],
	'project': ['Infrastructure', 'Medical', 'Equipment', 'Personnel']
});

app.value('reqList', []);

app.factory('sampleData', function(types, curUser, reqList){
	return {
		genFromType: function(type){
			var n = Math.random() * types[type].length;
			var index = Math.round(n);
			return types[type][index];
		},
		genDisasterType: function(){return this.genFromType('disaster');},
		genProjectType: function(){return this.genFromType('project');},
		genAmount: function(){
			return Math.round(Math.random() * 100) * 100000;
		},
		genName: function(){return 'Project Name'},
		genRequest: function(){
			var self = this;
			return {
				date: new Date(Date.now()),
				code: '123-456',
				disaster: {
					type: self.genDisasterType(),
					name: self.genName(),
					date: new Date(Date.now()),
					cause: null
				},
				author: curUser,
				implementingAgency: null,
				amount: self.genAmount(),
				project: {
					type: self.genProjectType(),
					description: null
				},
				remarks: null
			}
		},
		genReqList: function(qty){
			for(var i = 0; i < qty; i++){
				reqList.push(this.genRequest());
			}
		}
	}
});

// controllers

app.controller('Main', function($scope, curUser, reqList, sampleData){
	$scope.reqList = reqList;
	$scope.curUser = curUser;
	$scope.curView = 'List';
	$scope.sampleData = sampleData;

	$scope.setView = function(str){
		$scope.curView = str;
	}
});

app.controller('List', function($scope){
});

app.controller('New', function($scope, curUser, types, reqList){
	var reqProto = {
		date: null, // auto
		code: null, // auto
		disaster: {
			type: 'Typhoon',
			name: null,
			date: null,
			cause: null
		},
		author: null, // auto
		implementingAgency: null, // auto
		amount: 0,
		project: {
			type: 'Infrastructure',
			description: null
		},
		remarks: null
	};
	$scope.curReq = reqProto;
	$scope.types = types;
	$scope.getCurReq = function(){
		return $scope.curReq;
	}

	$scope.generateCode = function(request){
		return '123-456'
	}
	$scope.submit = function(){
		$scope.curReq.date = new Date(Date.now());
		$scope.curReq.author = curUser;

		// below always has to be last, because generate code via UACS
		$scope.curReq.code = $scope.generateCode($scope.curReq);

		// push to array
		reqList.push($scope.curReq);
		$scope.curReq = {};
		curReq = {};
		console.log(reqList);

		// go back to list
		$scope.setView('List');
	}
});

app.controller('Account', function($scope, curUser){
	$scope.curUser = curUser;

});