

var app = angular.module('recon', ['highcharts-ng', 'truncate']);

// values and constants

app.constant('types', {
  'disaster names': ['Brunhilda', 'Bantay', 'Muning', 'Dodong', 'Puring'],
  'disaster': ['Earthquake', 'Flood', 'Typhoon', 'Landslide', 'Anthropogenic'],
  'project': ['Infrastructure', 'Agriculture', 'School Building', 'Health Facilities', 'Shelter Units', 'Environment', 'Other'],
  'description': [
    'Adamantium reinforcement for nipa huts.',
    'These equipments, you know. I need them.',
    'Very very urgent, we ran out of soft drinks! Help!',
    'We want to hire Michael Jackson to dance for residents of disaster-afflicted areas',
    'Request for funding to dispatch search and rescue team for missing local domesticated feline',
    'Our bridge is missing, can you help us buy another one?',
    'We must construct additional pylons.'
  ],
  'comment': [
    'Please attach two photocopies of Form R311-78a.9v8 (1983)',
    'This is a wonderful idea, we should double their budget and give them cake.',
    'Can I promise to do this if they vote for me?'
  ],
  'revision': [null, 0.85, 0.70, 0.65, 0.50, 0.35, 0.2],
  'region': ["Region 1", "Region 2", "Region 3", "Region 4", "Region 5", "Region 6", "Region 7", "Region 8", "Region 9", "Region 10", "Region 11", "Region 12", "Region 13", 'ARMM', 'NCR', 'CAR']
});

app.constant('levels', [
  'LGU',
  'NDRRMC',
  'DPWH',
  'OP',
  'DBM'
]);

app.constant('colors', {
  aqua: "#7FDBFF",
  blue: "#0074D9",
  lime: "#01FF70",
  navy: "#001F3F",
  teal: "#39CCCC",
  olive: "#3D9970",
  green: "#2ECC40",
  red: "#FF4136",
  maroon: "#85144B",
  orange: "#FF851B",
  purple: "#B10DC9",
  yellow: "#FFDC00",
  fuchsia: "#F012BE",
  gray: "#aaa",
  white: "#fff",
  black: "#111",
  silver: "#ddd"
});

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

app.factory('sampleData', function(types, users, requests, responses, $http){
  return {
    genFromArray: function(arr){
      var n = Math.random() * (arr.length - 1);
      var index = Math.round(n);
      return arr[index];
    },
    genDate: function(then){
      if(typeof(then) == "undefined"){
        var then = new Date('January 1, 2013');
      }
      var now = new Date(Date.now());
      return new Date(now - Math.round((now - then) * Math.random()));
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
      var genArray = function(len){
        var arr = [];
        for (var i = 0; i < len; i++) {
          arr.push({number: i});
        };
        return arr;
      }
      return {
        date: self.genDate(),
        code: '123-456',
        level: 1,
        isRejected: false,
        disaster: {
          type: self.genFromArray(types.disaster),
          name: self.genFromArray(types['disaster names']),
          date: new Date(Date.now()),
          cause: null
        },
        author: users.list.filter(function(user){return user.level == 0})[0],
        implementingAgency: null,
        project: {
          type: self.genFromArray(types.project),
          description: self.genFromArray(types.description),
          amount: self.genAmount()
        },
        location: users.current.address,
        remarks: null,
        history: [],
        attachments: genArray(self.genInt(1, 6))
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
          region: 'Region 8',
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
      var backupUsers = {"results":[{"user":{"gender":"female","name":{"title":"miss","first":"dora","last":"little"},"location":{"street":"8070 lakeview st","city":"roseburg","state":"kansas","zip":"51648"},"email":"dora.little60@example.com","username":"ticklishelephant593","password":"121212","salt":"TL3[@F_T","md5":"abbb59295aab4d1dfe460c0d8db9d9c3","sha1":"7aa93a9581897e59906fc666300d76630fe3968f","sha256":"fb4637934a85bbd765e0d08a0065adf63608620b424e349005d19a8c98f8b4bd","registered":"1059126112","dob":"25717879","phone":"(572)-318-2418","cell":"(280)-601-3392","SSN":"350-39-1332","picture":"backupUsers/women/30.jpg"},"seed":"ce2b8529023508c","version":"0.3.2"},{"user":{"gender":"female","name":{"title":"mrs","first":"judy","last":"west"},"location":{"street":"8760 photinia ave","city":"fountain valley","state":"massachusetts","zip":"92342"},"email":"judy.west50@example.com","username":"blackkoala874","password":"domino","salt":"ZF$QrMFZ","md5":"5be03d5fe05cb671fc0bfae4cbb53164","sha1":"d0b7a789d1908c93acb4d165f6221a5308116459","sha256":"204d082383565a0bfaefea25ddc4325cf76ff0741e13beab9450d95b0a541fd3","registered":"1384311792","dob":"331011243","phone":"(908)-287-7543","cell":"(258)-148-4457","SSN":"255-19-6093","picture":"backupUsers/women/29.jpg"},"seed":"8b9f2fb636338d4","version":"0.3.2"},{"user":{"gender":"male","name":{"title":"mr","first":"bryan","last":"george"},"location":{"street":"4017 blue island ave","city":"magna","state":"new york","zip":"69672"},"email":"bryan.george43@example.com","username":"bluepanda291","password":"asdfasdf","salt":"","md5":"6a204bd89f3c8348afd5c77c717a097a","sha1":"92429d82a41e930486c6de5ebda9602d55c39986","sha256":"2413fb3709b05939f04cf2e92f7d0897fc2596f9ad0b8a9ea855c7bfebaae892","registered":"966276524","dob":"22723478","phone":"(365)-510-4602","cell":"(437)-643-4832","SSN":"747-24-6019","picture":"backupUsers/men/24.jpg"},"seed":"72ef73303fa008d","version":"0.3.2"},{"user":{"gender":"male","name":{"title":"mr","first":"floyd","last":"welch"},"location":{"street":"6260 eagle point rd","city":"rockford","state":"new hampshire","zip":"59940"},"email":"floyd.welch39@example.com","username":"purplekoala243","password":"lennon","salt":"GNHXkh:H","md5":"6fd10f8eedb71d2446e324fcc69bfd15","sha1":"3491477bbac65fb0f6bf5b30f34ecfea80809dd6","sha256":"119562e47bf056cb8b8029d312d91ca4c57aaf111c32b8e8d1fbde5d85616bf5","registered":"1266144183","dob":"109056973","phone":"(896)-222-8460","cell":"(484)-608-1738","SSN":"905-21-5507","picture":"backupUsers/men/19.jpg"},"seed":"2949c52e25e6bfc","version":"0.3.2"},{"user":{"gender":"male","name":{"title":"mr","first":"alex","last":"reed"},"location":{"street":"7121 texas ave","city":"sunnyvale","state":"new jersey","zip":"91802"},"email":"alex.reed17@example.com","username":"tinybutterfly964","password":"wesley","salt":":1ZNO?Le","md5":"97615a72f8f4e7167deface7318123fa","sha1":"23faa3b06c61f5a53da5fb0f33755843a7544f91","sha256":"1788e40aa3da2eaafe2193533bf514c2f7980626a3760f8e33066617d918c7e6","registered":"937492198","dob":"380566097","phone":"(623)-132-3167","cell":"(183)-619-6929","SSN":"421-34-9252","picture":"backupUsers/men/13.jpg"},"seed":"66dd0304b80175a","version":"0.3.2"}]};
      var self = this;
      var populate = function(results, qty, generator){
        if(!qty) qty = 1;
        for(var i = 0; i < qty; i++){
          var u = self.genUser(i);
          u.picture = results[i].user.picture;
          u.name = results[i].user.name;
          users.list.push(u);
        }
        users.current = users.list[0];

        // now that users exist, generate requests.
        requests.list = self.genReqList(self.genInt(50, 90));
        self.genResponses();
      }
      $http({method: 'GET', url: 'http://api.randomuser.me/?results=' + qty})
        .success(function(data){
          populate(data.results, qty, self);
        })
        .error(function(){
          populate(backupUsers.results, qty, self);
        });
    },
    genResponses: function(){
      var self = this;
      // for each request, generate a random target level.
      requests.list.map(function(r){
        var target = self.genInt(4);

        // create an approval by authorized user for each step up to target
        for(var i = 1; i < target; i++){
          // find a user with authority for that level
          var approver = users.list.filter(function(user){
            return user.level == i;
          })[0];
          // does this authorized user approve with revision?
          var discount = self.genFromArray(types.revision);
          if(discount){
            responses.current.revised = r.project.amount * discount;
          }

          // approve
          responses.approve(approver, r);
        }
      });
    }
  }
});

app.factory('users', function(){
  var u = {
    list: [],
    current: {},
    isLoggedIn: true,
    switchTo: function(u){
      this.current = u;
      this.isLoggedIn = true;
    },
    logout: function(){
      this.current = {};
      this.isLoggedIn = false;
    }
  }
  return u;
});

app.factory('requests', function(){

  var reqs = {
    list: [],
    current: {}, 
    mostCommonProjectType: function(){
      return _.chain(this.list)
      .countBy(function(r){
        return r.project.type;
      })
      .pairs()
      .max(function(r){
        return r[1];
      })
      .value();
    },
    mostCommonDisasterType: function(){
      return _.chain(this.list)
      .countBy(function(r){
        return r.disaster.type;
      })
      .pairs()
      .max(function(r){
        return r[1];
      })
      .value();
    },
    totalPending: function(){
      return this.list.filter(function(r){
        return r.level < 4;
      });
    },
    totalApproved: function(){
      return this.list.filter(function(r){
        return r.level >= 4;
      });
    },
    totalCost: function(){
      return this.list.reduce(function(a, b){
        return a + b.project.amount;
      }, 0);
    },
    pendingCost: function(){
      return this.totalPending().reduce(function(a, b){
        return a + b.project.amount;
      }, 0);
    },
    approvedCost: function(){
      return this.totalApproved().reduce(function(a, b){
        return a + b.project.amount;
      }, 0);
    },
    percentApproved: function(){
      var numApproved = this.totalApproved().length;
      return Math.round(numApproved * 100 / this.list.length);
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
      comment: '',
      revised: null,
      previous: null
    },
    approve: function(user, request){
      var r = {};
      r.timestamp = new Date(Date.now());
      r.author = user; // change this to appropriate approval level
      r.type = 'approval';
      r.comment = this.current.comment;
      if(this.current.revised){
        r.revised = this.current.revised;
        r.previous = request.project.amount;
        request.project.amount = r.revised;
      }

      request.history.push(r);
      request.level++;
      return request;
    },
    reject: function(user, request){
      var r = {};
      r.timestamp = new Date(Date.now());
      r.author = user; // change this to appropriate approval level
      r.type = 'rejection';
      r.comment = this.current.comment;

      request.history.push(r);
      request.isRejected = true;
      return request;
    },
    comment: function(user, request){
      var r = {};
      r.timestamp = new Date(Date.now());
      r.author = user;
      r.type = 'comment';
      r.comment = this.current.comment;

      request.history.push(r);
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

app.factory('filters', function(){
  return {
    current: {},
    reset: function(){
      this.current = {}
    }
  }
})

// controllers

app.controller('Main', function($scope, users, requests, sampleData, levels){
  $scope.requests = requests;
  $scope.users = users;
  $scope.levels = levels;
  $scope.curView = 'Overview';
  $scope.sampleData = sampleData;

  sampleData.genUsers(5);
  // console.log(p);

  $scope.setView = function(str){
    $scope.curView = str;
  }
  
});

app.controller('Overview', function($scope, requests, levels, colors){
  $scope.requests = requests;
  console.log(_.values(colors));

  $scope.chartSeries = [
    {
      "name": "Projects", 
      "data": [],
      dataLabels: {
        formatter: function() {
            return this.y > 5 ? this.point.name : null;
        },
        color: "white"
      },
      style: {
        fontFamily: "Roboto Condensed",
        fontSize: 18
      },
      color: "#000",
      distance: -40

    }
  ];

  $scope.timeChartSeries = [
    {
      "name": "Requests Over Time",
      "data": [],
      style: {
        fontFamily: "Roboto Condensed",
        fontSize: 18
      },
      color: "#000"
    }
  ]

  $scope.chartConfig = {
    options: {
      chart: {
        type: 'column',
        style: {
          fontFamily: "Roboto Condensed"
        },
        height: 300
      }
    },
    series: $scope.chartSeries,
    title: {
      text: 'Number of projects in each state of approval',
      style: {
        fontFamily: "Roboto Condensed",
        color: "#000"
      }
    },
    xAxis: {
      categories: []
    },
    yAxis:{
      title: {
        text: "Number of Projects",
        style:{
          fontFamily: "Roboto Condensed",
          color: "#000"
        }
      }
    },
    legend:{
      enabled: false
    },
    credits: {
      enabled: false
    },
    loading: false
  }

  $scope.timeChartConfig = {
    options: {
      chart: {
        type: 'line',
        style: {
          fontFamily: "Roboto Condensed"
        },
        height: 300
      }
    },
    series: $scope.timeChartSeries,
    title: {
      text: 'Number of requests per month',
      style: {
        fontFamily: "Roboto Condensed",
        color: "#000"
      }
    },
    yAxis:{
      title: {
        text: "Number of Projects",
        style:{
          fontFamily: "Roboto Condensed",
          color: "#000"
        }
      }
    }
  }

  $scope.$watch('requests.list', function(requestList){
    if(requestList.length){
      var base = _.chain(requestList)
      .countBy('level');

      var keys = base.keys().map(function(r){return levels[r[0]];}).value();
      var values = base.values().value();
      
      $scope.chartSeries[0].data = values;
      $scope.chartConfig.xAxis.categories = keys;

      // time chart series

      var base2 = _.chain(requestList)
      .countBy(function(r){
        return r.date.getMonth() + ", " + r.date.getYear();
      })
      .pairs()
      .value();

      $scope.timeChartSeries[0].data = base2;
    }
  });

  // $scope.$watch('requests.list', function(requestList){
  //   if(requestList.length){
  //     var countPairs = _.chain(requestList)
  //     .countBy('level')
  //     .pairs()
  //     .map(function(r){return [levels[r[0]], r[1]];})
  //     .value();
  //     // console.log(countPairs);

  //     $scope.chartSeries[0].data = countPairs;
  //   }
  // });

  // $scope.chartConfig = {
  //   options: {
  //     chart: {
  //       type: 'pie',
  //       colors: _.values(colors),
  //       style: {
  //         fontFamily: "Roboto Condensed"
  //       }
  //     },
  //   },
  //   series: $scope.chartSeries,
  //   title: {
  //     text: 'Approval State of Projects',
  //     style: {
  //       fontFamily: "Roboto Condensed"
  //     }
  //   },
  //   credits: {
  //     enabled: true
  //   },
  //   loading: false
  // }
});

app.controller('List', function($scope, users, requests, levels, filters, types){
  $scope.users = users;
  console.log(requests.list);
  $scope.requests = requests;
  $scope.levels = levels;
  $scope.filters = filters;
  $scope.types = types;

  if(users.current.level){
    $scope.filters.current.level = users.current.level;
  } else {
    $scope.filters.current.level = 1;
  }
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
      name: 'Yolanda',
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
    remarks: null,
    history: [],
    attachments: [],
    location: users.current.address
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