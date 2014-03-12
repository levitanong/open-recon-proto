var app = angular.module('recon', []);

// values and constants

app.constant('types', {
	'disaster': ['Earthquake', 'Flood', 'Typhoon', 'Landslide', 'Anthropogenic'],
	'project': ['Infrastructure', 'Medical', 'Equipment', 'Personnel'],
	'descriptions': [
		'Boats and shit',
		'These equipments, you know. I need them.',
		'omg, have you seen these trees? we gotta plant more!',
		'the whole town kinda burnt down and we pretty much need to build the whole thing again. Seriously guys. This is the tenth time.',
		'EVERYONE IS DEAD. WE NEED TO REPOPULATE',
		'Rubber boat plzkthnx'
	]
});

app.factory('sampleData', function(types, users){
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
		genName: function(){return 'Placeholder Name'},
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
				author: users.current,
				implementingAgency: null,
				amount: self.genAmount(),
				project: {
					type: self.genProjectType(),
					description: self.genFromType('descriptions')
				},
				remarks: null
			}
		},
		genReqList: function(qty){
			var list = [];
			for(var i = 0; i < qty; i++){
				list.push(this.genRequest());
			}
			return list;
		}
	}
});

app.factory('users', function(){
	var l = [
		{
			type: 'LGU',
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
		},
		{
			type: 'LGU',
			name: 'Mayor Pepe Bawagan',
			income: null,
			address: {
				district: null,
				department: null,
				region: 8,
				province: 'Eastern Samar',
				city: null,
				town: 'PepeVille',
				barangay: null,
				sitio: null
			}
		},
		{
			type: 'NDRRMC',
			name: 'Philip Cheang',
			income: null,
			address: {
				district: null,
				department: 'NDRRMC',
				region: null,
				province: null,
				city: null,
				town: null,
				barangay: null,
				sitio: null
			}
		}
	];
	var u = {
		list: l,
		current: l[0],
		switchTo: function(u){
			this.current = u;
		}
	}
	return u;
});

app.factory('requests', function(sampleData){
	var l = sampleData.genReqList(10);

	var reqs = {
		list: l,
		current: l[0], 
		addSampleData: function(qty){
			this.list = this.list.concat(sampleData.genReqList(qty));
		}
	}
	return reqs;
});

// controllers

app.controller('Main', function($scope, users, requests, sampleData){
	$scope.requests = requests;
	$scope.users = users;
	$scope.curView = 'List';
	$scope.sampleData = sampleData;
	// $scope.sampleData.genReqList(10);

	$scope.setView = function(str){
		$scope.curView = str;
	}
});

app.controller('List', function($scope, users, requests){
	$scope.users = users;
	$scope.requests = requests;
});

app.controller('Detail', function($scope, users, requests){
	$scope.users = users;
	$scope.requests = requests;
});

app.controller('New', function($scope, users, types, requests){
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
	$scope.users = users;
	$scope.types = types;
	$scope.getCurReq = function(){
		return $scope.curReq;
	}

	$scope.generateCode = function(request){
		return '123-456'
	}
	$scope.submit = function(){
		$scope.curReq.date = new Date(Date.now());
		$scope.curReq.author = users.current;

		// below always has to be last, because generate code via UACS
		$scope.curReq.code = $scope.generateCode($scope.curReq);

		// push to array
		requests.list.push($scope.curReq);
		$scope.curReq = {};
		curReq = {};

		// go back to list
		$scope.setView('List');
	}
});

app.controller('Account', function($scope, users){
	$scope.users = users;

});