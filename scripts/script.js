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

app.constant('levels', [
  'LGU',
  'NDRRMC',
  'DPWH',
  'OP',
  'DBM'
]);

// filters

app.filter("timeago", function () {
  //time: the time
  //local: compared to what time? default: now
  //raw: wheter you want in a format of "5 minutes ago", or "5 minutes"
  return function (time, local, raw) {
    if (!time) return "never";

    if (!local) {
      (local = Date.now())
    }

    if (angular.isDate(time)) {
      time = time.getTime();
    } else if (typeof time === "string") {
      time = new Date(time).getTime();
    }

    if (angular.isDate(local)) {
      local = local.getTime();
    }else if (typeof local === "string") {
      local = new Date(local).getTime();
    }

    if (typeof time !== 'number' || typeof local !== 'number') {
      return;
    }

    var
      offset = Math.abs((local - time) / 1000),
      span = [],
      MINUTE = 60,
      HOUR = 3600,
      DAY = 86400,
      WEEK = 604800,
      MONTH = 2629744,
      YEAR = 31556926,
      DECADE = 315569260;

    if (offset <= MINUTE)              span = [ '', raw ? 'now' : 'less than a minute' ];
    else if (offset < (MINUTE * 60))   span = [ Math.round(Math.abs(offset / MINUTE)), 'min' ];
    else if (offset < (HOUR * 24))     span = [ Math.round(Math.abs(offset / HOUR)), 'hr' ];
    else if (offset < (DAY * 7))       span = [ Math.round(Math.abs(offset / DAY)), 'day' ];
    else if (offset < (WEEK * 52))     span = [ Math.round(Math.abs(offset / WEEK)), 'week' ];
    else if (offset < (YEAR * 10))     span = [ Math.round(Math.abs(offset / YEAR)), 'year' ];
    else if (offset < (DECADE * 100))  span = [ Math.round(Math.abs(offset / DECADE)), 'decade' ];
    else                               span = [ '', 'a long time' ];

    span[1] += (span[0] === 0 || span[0] > 1) ? 's' : '';
    span = span.join(' ');

    if (raw === true) {
      return span;
    }
    return (time <= local) ? span + ' ago' : 'in ' + span;
  }
});

// Factories

app.factory('sampleData', function(types, users){
  return {
    genFromType: function(type){
      var n = Math.random() * (types[type].length - 1);
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
        level: 1,
        isRejected: false,
        disaster: {
          type: self.genDisasterType(),
          name: self.genName(),
          date: new Date(Date.now()),
          cause: null
        },
        author: users.current,
        implementingAgency: null,
        project: {
          type: self.genProjectType(),
          description: self.genFromType('descriptions'),
          amount: self.genAmount()
        },
        remarks: null,
        history: []
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

app.factory('randomUser', function($http){
  return {
    async: function(qty){
      if(!qty) qty = 1;
      return $http({method: 'GET', url: 'http://api.randomuser.me/?results=' + qty});
    }
  }
  
});

app.factory('users', function(){
  // console.log(randomUser);
  
  var l = [
    {
      level: 0,
      name: 'Mayor Lucia L. Astorga',
      picture: null,
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
      level: 0,
      name: 'Mayor Pepe Bawagan',
      picture: null,
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
      level: 1,
      name: 'Philip Cheang',
      picture: null,
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

app.controller('Main', function($scope, users, requests, sampleData, $http, randomUser){
  $scope.requests = requests;
  $scope.users = users;
  $scope.curView = 'List';
  $scope.sampleData = sampleData;
  randomUser.async(3).success(function(data){
    var us = data.results;
    us.forEach(function(elem, index){
      users.list[index].picture = elem.user.picture;
    })
  });
  // console.log(p);

  $scope.setView = function(str){
    $scope.curView = str;
  }
  
});

app.controller('List', function($scope, users, requests, levels){
  $scope.users = users;
  $scope.requests = requests;
  $scope.levels = levels;
});

app.controller('Detail', function($scope, users, requests, levels){
  $scope.users = users;
  $scope.requests = requests;
  $scope.response = {comment: ''};
  $scope.levels = levels;
  $scope.submit = function(){
    $scope.response.timestamp = new Date(Date.now());
    $scope.response.author = users.current;

    switch($scope.response.type){
      case 'approval':
        $scope.requests.current.level++;
        break;
      case 'rejection':
        $scope.requests.current.isRejected = true;
        break;
    }

    requests.current.history.push($scope.response);
    $scope.response = {comment: ''};
  }
});

app.controller('New', function($scope, users, types, requests){
  var reqProto = {
    date: null, // auto
    code: null, // auto
    level: 1,
    isRejected: false,
    disaster: {
      type: 'Typhoon',
      name: null,
      date: null,
      cause: null
    },
    author: null, // auto
    implementingAgency: null, // auto
    project: {
      type: 'Infrastructure',
      description: null,
      amount: 0
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