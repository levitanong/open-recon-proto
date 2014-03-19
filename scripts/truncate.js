angular.module('truncate', []).
	filter('largeCurrency', function(){
		return function(input, place){
			var out = "";
			var buffer;
			var suffix = "";

			if(typeof(place) == "undefined"){
				var place = 2;
			}

			var placeCheck = function(val, place){
				if(typeof(place) == "undefined") place = 1;
				if(val / 1000 < 1){
					// this means val cannot be divided by 1000 anymore
					return [val, place];
				} else {
					// val can still be divided by 1000. placeCheck again.
					return placeCheck(val / 1000, place * 1000);
				}
			}

			buffer = placeCheck(input);

			switch(buffer[1]){
				case Math.pow(10, 3):
					suffix = "K";
					break;
				case Math.pow(10, 6):
					suffix = "M";
					break;
				case Math.pow(10, 9):
					suffix = "B";
					break;
				case Math.pow(10, 12):
					suffix = "T";
					break;
				default:
					suffix = "";
					break;
			}

			var roundTo = function(num, place){
				var p = Math.pow(10, place);
				return Math.round(num * p) / p;
			}
			out = roundTo(buffer[0], place) + " " + suffix;
			return out;
		}
	})