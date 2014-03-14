var app = angular.module('recon', []);

// values and constants

app.constant('types', {
  'disaster': ['Earthquake', 'Flood', 'Typhoon', 'Landslide', 'Anthropogenic'],
  'project': ['Infrastructure', 'Medical', 'Equipment', 'Personnel'],
  'description': [
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

app.factory('sampleData', function(types, users, $http){
  return {
    genFromArray: function(arr){
      var n = Math.random() * (arr.length - 1);
      var index = Math.round(n);
      return arr[index];
    },
    genAmount: function(){
      return Math.round(Math.random() * 100) * 100000;
    },
    genInt: function(lower, upper){
      if(typeof(upper) == 'undefined'){
        // catches for when only one argument is added, meant for upper.
        upper = lower;
        lower = 0
      }
      return Math.round(Math.random() * (upper - lower)) + lower;
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
          type: self.genFromArray(types.disaster),
          name: self.genName(),
          date: new Date(Date.now()),
          cause: null
        },
        author: users.current,
        implementingAgency: null,
        project: {
          type: self.genFromArray(types.project),
          description: self.genFromArray(types.description),
          amount: self.genAmount()
        },
        remarks: null,
        history: []
      }
    },
    genUser: function(level){
      var self = this;
      return {
        level: level,
        name: {},
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
        },
        getName: function(){
          return this.name.first + ' ' + this.name.last;
        }
      }
    },
    genReqList: function(qty){
      var list = [];
      for(var i = 0; i < qty; i++){
        list.push(this.genRequest());
      }
      return list;
    },
    genUsers: function(qty){
      var self = this;
      if(!qty) qty = 1;
      $http({method: 'GET', url: 'http://api.randomuser.me/?results=' + qty})
        .success(function(data){
          var us = data.results;
          for(var i = 0; i < qty; i++){
            var u = self.genUser(i);
            u.picture = us[i].user.picture;
            u.name = us[i].user.name;
            users.list.push(u);
          }
          users.current = users.list[0];
        });
    }
  }
});

app.factory('users', function(){
  var u = {
    list: [],
    current: {},
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

app.factory('responses', function(){
  return {
    current: {
      timestamp: null,
      author: null,
      type: null,
      comment: ''
    },
    approve: function(user, request){
      this.current.timestamp = new Date(Date.now());
      this.current.author = user; // change this to appropriate approval level
      this.current.type = 'approval';

      request.history.push(this.current);
      request.level++;
      return request;
    },
    reject: function(user, request){
      this.current.timestamp = new Date(Date.now());
      this.current.author = user; // change this to appropriate approval level
      this.current.type = 'rejection';

      request.history.push(this.current);
      request.isRejected = true;
      return request;
    },
    comment: function(user, request){
      this.current.timestamp = new Date(Date.now());
      this.current.author = user;
      this.current.type = 'comment';

      request.history.push(this.current);
      return request;
    }, 
    reset: function(){
      this.current = {
        timestamp: null,
        author: null,
        type: null,
        comment: ''
      }
    }
  }
});

// controllers

app.controller('Main', function($scope, users, requests, sampleData){
  $scope.requests = requests;
  $scope.users = users;
  $scope.curView = 'List';
  $scope.sampleData = sampleData;

  sampleData.genUsers(3);
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

app.controller('Detail', function($scope, users, requests, levels, responses){
  $scope.users = users;
  $scope.requests = requests;
  $scope.responses = responses;
  $scope.levels = levels;
  $scope.submit = function(){
    switch($scope.responses.current.type){
      case 'approval':
        responses.approve(users.current, requests.current);
        break;
      case 'rejection':
        responses.reject(users.current, requests.current);
        break;
      case 'comment': default:
        responses.comment(users.current, requests.current);
    }
    $scope.responses.reset();
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