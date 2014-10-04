
var mediadumpApp = angular.module('mediadumpApp', ['ngRoute', 'google-maps']);

mediadumpApp.config(function($httpProvider){
    delete $httpProvider.defaults.headers.common['X-Requested-With'];
});

mediadumpApp.controller('mediadumpCtrl', function ($location, $scope, $route, $routeParams, $http) {

	$scope.query = "*";
	$scope.default_query = "*";

	$scope.sort_mode = "datetime";
	$scope.sort_direction = "asc";
	$scope.operator = "and";
	$scope.total_files_in_md = 12447;

	$scope.s_media_dump_url = "http://127.0.0.1:8000"
	
	$scope.default_queries = [];
	$http.get($scope.s_media_dump_url + '/tree/')
	.then(function(res) {
		$scope.default_queries = res.data.tree;
	});
	
	// app stuff
	
	$scope.bQueryBuilderVisible = false;

	// search stuff
	$scope.search_input_mode = "tree";
	$scope.search_mode = "search";
	$scope.setSearchInputMode = function(sMode){
		$scope.search_input_mode = sMode;
		if(sMode === "map"){
			$scope.refreshSearchMap()
			// grid only when search mode is map
			$scope.search_mode = "search";
		}
	}
	
	$scope.page = 1;

	$scope.iLightIndex = -1;

	$scope.i_markers_showing = 0;

	$scope.bShowAdvancedSearch = false;
	$scope.bEventsOn = false;

	var s_land = "#c0c0c0";
	var s_media_dump_color = "#e74c3c";
	var s_silver_colour = "#bdc3c7";
	s_land = s_silver_colour;


	$scope.media_dump_map_options = {
		styles: [{
            "featureType": "water",
            "stylers": [{
                "color": "#ffffff"
            }]
        }, {
            "featureType": "landscape.natural",
            "stylers": [{
                "color": s_land
            }]
        }, {
            "featureType": "poi",
            "stylers": [{
                "visibility": "on"
            }, {
                "color": s_silver_colour
            }]
        }, {
            "featureType": "road",
            "stylers": [{
                "color": s_media_dump_color
            }]
        }, {
            "featureType": "poi",
            "elementType": "labels.text.stroke",
            "stylers": [{
                "color": "#ffffff"
            }]
        }, {
            "featureType": "poi",
            "elementType": "labels.text.fill",
            "stylers": [{
                "color": "#000000"
            }]
        }, {
            "featureType": "road",
            "elementType": "labels.text.stroke",
            "stylers": [{
                "color": s_silver_colour
            }]
        }, {
            "featureType": "road.local",
            "elementType": "labels.icon",
            "stylers": [{
                "color": "#000000"
            }]
        }, {
            "featureType": "transit",
            "stylers": [{
                "color": s_silver_colour
            }]
        }, {
            "featureType": "poi",
            "elementType": "labels.icon",
            "stylers": [{
                "color": "#000000"
            }]
        }, {
            "featureType": "water",
            "elementType": "labels.text.fill",
            "stylers": [{
                "color": s_silver_colour
            }]
        }, {
            "elementType": "labels.text.stroke",
            "stylers": [{
                "color": "#ffffff"
            }]
        }, {
            "featureType": "road.highway",
            "elementType": "labels.icon"
        }],
		backgroundColor: '#fff'};

	var jo_url_vars = $location.search();
	
	
	if(jo_url_vars.search_mode != undefined){
		$scope.search_mode = jo_url_vars.search_mode;
	}
	if(jo_url_vars.query != undefined){
		$scope.query = jo_url_vars.query;
	}
	if(jo_url_vars.page  != undefined){
		$scope.page = parseInt(jo_url_vars.page);
	}
	if(jo_url_vars.file  != undefined){
		$scope.iLightIndex = parseInt(jo_url_vars.file);
	}
	$scope.bEventsOn = true;

	$scope.results = [];
	$scope.available_filters = [];

	$scope.bResults = function(){
		if(typeof $scope.results === 'undefined')
			return false;
		return ($scope.results.length > 0) ? true : false;
	}
	$scope.addFilter = function($index){
		// add filters to search query
		$scope.query += " " + $scope.available_filters[$index].value;
	}
	$scope.results_bounds = {
		northeast: {
			latitude:0,
			longitude:0
		},
		southwest: {
			latitude:0,
			longitude:0
		}
	};

	$scope.search_info = [];
	$scope.result_info = [];
	$scope.bSearching = false;


	// ui stuff
	$scope.sLightboxURL = "";
	$scope.sLightboxPlace = "";
	$scope.map_settings = {"centre": [0, 0], "zoom": 1};

	//
	// data interfaces
	//
	$scope.search_map = {
	    center: {
	        latitude: 0,
	        longitude: 0
	    },
	    bounds: {},
	    zoom: 1,
	    events: {
		    idle: function (map) {
		    	$scope.$apply(function () {

		    		if(typeof $scope.search_map !== 'undefined'){

			    		var llBounds = map.getBounds();

				    	var llNorthEast = llBounds.getNorthEast();
				    	var llSouthWest = llBounds.getSouthWest();


				    	var sQuery = "map=";
				    	sQuery += llSouthWest.lat().toFixed(2);
				    	sQuery += "|";			
				    	sQuery += llNorthEast.lat().toFixed(2);
				    	sQuery += "|";			
				    	sQuery += llSouthWest.lng().toFixed(2);
				    	sQuery += "|";			
				    	sQuery += llNorthEast.lng().toFixed(2);

				    	$scope.query = sQuery;  
				    }
				});
		    }
	    }
	};	
	$scope.markers = [];
	$scope.map = {
	    center: {
	        latitude: 45,
	        longitude: -73
	    },
	    zoom: 8,
	    bounds: {}
	};	

	$scope.sourceFromData = function(sBase){
		return 'data:image/jpeg;base64, '+sBase;
	}
	$scope.setNavSize = function(sMode){
		// set size of left nav section and results to give best UX for current search/browse mode
		var iLeftWidth = "30%";
		switch(sMode){
			case "map":
				iLeftWidth = "50%";
				break;
		}
		/*
		$("#nav").width(iLeftWidth);
		$("#results").css("left", iLeftWidth);
		*/
		$(".left_position").animate({'width':iLeftWidth},700);
		$(".right_position").animate({'left':iLeftWidth},700);
	}

	$scope.bMapVisible = function(){
		if ($scope.search_mode === 'map')
			if (!$scope.bSearching)
				return true;
		/*
			if(!$scope.bSearching){
				google.maps.event.trigger(map, 'resize');
				return true;
			}
*/
		return false;
	};


	//
	// 'events'
	//
	$scope.$watch('query', function(){
		if($scope.bEventsOn)
			$scope.page = 1;
		$scope.do_search();
		$scope.reconstruct_url();
	});
	$scope.$watch('page', function(){
		if($scope.page < 1 && $scope.bEventsOn){
			$scope.page = 1;
		}
		$scope.do_search();
		$scope.reconstruct_url();
	});
	$scope.$watch('sort_mode', function(){
		$scope.do_search();
		$scope.reconstruct_url();
	});
	$scope.$watch('operator', function(){
		$scope.do_search();
		$scope.reconstruct_url();
	});
	$scope.$watch('sort_direction', function(){
		$scope.do_search();
		$scope.reconstruct_url();
	});
	$scope.$watch('iLightIndex', function(){
		$scope.reconstruct_url();
		$scope.preload_around();
	});
	$scope.$watch('search_mode', function(){
		$scope.reconstruct_url();
	});
	$scope.$watch('search_input_mode', function(){
		$scope.setNavSize($scope.search_input_mode);
	});



	$scope.$watch('results', function(){
		// reset markers structure that we'll return (so that it can be returned empty if no resutls)
		$scope.markers = [];

		var mTempMarker = {};

		// go through all results and parse them into what a marker requires
		$scope.i_markers_showing = 0;
		for(var cResult = 0; cResult < $scope.results.length; cResult++){

			var pinIcon = new google.maps.MarkerImage(
				$scope.urlFromHash('thumbs', $scope.results[cResult], ''),
			    null, /* size is determined at runtime */
			    null, /* origin is 0,0 */
			    null, /* anchor is bottom center of the scaled image */
			    new google.maps.Size(48, 48)
			);  

			mTempMarker = {
	            latitude: $scope.results[cResult].lat,
	            longitude: $scope.results[cResult].lon,
	            title: 'm' + cResult,
	            icon: pinIcon
	        };
	        mTempMarker["id"] = cResult;
	        $scope.markers.push(mTempMarker);
	        $scope.i_markers_showing++;
		}
	});
	$scope.markersEvents = {
        click: function (gMarker, eventName, model) {            
        	$scope.map_icon_click(model.id);
        }
    };
    $scope.bMapRefreshed = false;

    $scope.refreshSearchMap = function(){
    	$scope.bMapRefreshed = false;
    	$scope.bMapRefreshed = true;
    }
    $scope.setOperator = function(sOperator){
    	$scope.operator = sOperator;
    	$scope.bShowUpdateButton = true;
    }

	$scope.$watch('result_info', function(){
		var oTempFilter = {};
		$scope.available_filters = [];
		if(typeof $scope.result_info.distinct !== 'undefined')
			for(var cFilter = 0; cFilter < $scope.result_info.distinct.length; cFilter++){
				oTempFilter = {
					"value": $scope.result_info.distinct[cFilter],
					"add": false
				};
				$scope.available_filters.push(oTempFilter);
			}
	});

	
	$scope.boundsChanged = function(){
		console.log("var");
	};

	$scope.new_bounds = function(){
		return $scope.results_bounds;
	};


	$scope.reset = function(){
		$scope.query = "*";
		$scope.search_mode = "search";
	};

	// ui logic
	$scope.b_results = function() {
		if($scope.results.length > 0 || $scope.search_mode !== 'search')
			return true;
		else
			return false;
	};
	$scope.b_query = function() {
		if($scope.query == '')
			return false;
		else
			return true;
	};
	$scope.do_default_query = function(s_new_query) {
		$scope.query = s_new_query;
	};
	$scope.lightChange = function(iDelta){
		if(($scope.iLightIndex + iDelta) > -1 && ($scope.iLightIndex + iDelta) < $scope.results.length){
			$scope.iLightIndex += iDelta;
		}else{
			// 'loop' the results
			$scope.iLightIndex = 0;
		}
	};
	/*
	$scope.lightRight = function(){		
		if($scope.iLightIndex < $scope.results.length -1){
			$scope.iLightIndex++;
			$scope.sLightboxURL = $scope.urlFromHash('lightbox', $scope.results[$scope.iLightIndex].h, $scope.results[$scope.iLightIndex].e);
			$scope.sLightboxPlace = $scope.results[$scope.iLightIndex].p;
		}else{
			$scope.iLightIndex = 0;
		}
	};
	*/

	$scope.urlFromHash = function(sMode, sHash, sExt){
		//sHash = Object.keys(sHash)[0];

		if(typeof sHash === "undefined")
		{
			console.log("failed to make");
			return "";
		}
		
		switch(sMode){
			case 'lightbox':
				return 'http://mdcdn/thumb/lightbox/'+sHash.id+'.jpg';
				break;
			case 'map_search':
				return 'http://mdcdn/thumb/icon/'+sHash.id+'.jpg';
				break;
			case 'thumbs':
				return 'data:image/jpeg;base64, '+sHash.data_thumb["115"];
				/*return 'http://mdcdn/thumb/thumb/'+sHash.id+'.jpg';*/
				break;
		}
	};

	$scope.preload_around = function(){
		if($scope.iLightIndex > -1 && $scope.results.length > 0){
			var saPreloadURLS = [];

			for(cImage = $scope.iLightIndex - 2, cPreloadCount = 0; cPreloadCount < 5; cImage++, cPreloadCount++){
				if(cImage > -1 && cImage < $scope.results.length){
					saPreloadURLS.push($scope.urlFromHash('lightbox', $scope.results[cImage].h, 'jpg'));
				}
			}
			
			
			saPreloadURLS.forEach(function(value){
				try {
		            var _img = new Image();
		            _img.src = value;
		        } catch (e) { }
			});
		}
	}

	$scope.reconstruct_url = function(){
		if($scope.query !== ''){
			$location.search('query', $scope.query);
			$location.search('page', $scope.page);

			if($scope.iLightIndex > -1){
				$location.search('file', $scope.iLightIndex);
			}else{
				$location.search('file', null);
			}
		}else{
			$location.search('query', null);
			$location.search('page', null);
			$location.search('file', null);
		}

		if($scope.search_mode != 'search'){
			$location.search('search_mode', $scope.search_mode);
		}else{
			$location.search('search_mode', null);
		}


		if($scope.sort_mode != 'datetime'){
			$location.search('sort_mode', $scope.sort_mode);
		}else{
			$location.search('sort_mode', null);
		}



		if($scope.sort_direction != 'asc'){
			$location.search('sort_direction', $scope.sort_direction);
		}else{
			$location.search('sort_direction', null);
		}

		if($scope.operator != 'and'){
			$location.search('operator', $scope.operator);
		}else{
			$location.search('operator', null);
		}
	};

	$scope.do_search = function() {
		$scope.results = [];
		$scope.search_info = [];

		if($scope.query !== ""){
			$scope.bSearching = true;	
			$scope.bShowAdvancedSearch = false;
			$http({
		        method  : 'GET',
		        /*url     : 'http://media-dump-instant/api/search',
		        url     : 'http://media-dump.samt.st/api/search',*/
		        url     : $scope.s_media_dump_url + '/search/',
		        params    : {query: $scope.query.replace(" ", ","), page: $scope.page, m: $scope.search_mode, operator: $scope.operator, sort: $scope.sort_mode, sort_direction: $scope.sort_direction}
		    })
	        .success(function(data) {
	            if(data != undefined){
	            	$scope.results = data.files;
		            $scope.result_info = data.results_info;
				}else{
	            	// if not successful, bind errors to error variables
	            	console.log("http successful, but problem with results :(");
					$scope.results = [];
					$scope.search_info = [];					
				}
				$scope.bSearching = false;
	        })
	        .error(function() {
        		console.log("http search error :(");
				$scope.bSearching = false;
				$scope.results = [];
				$scope.search_info = [];
	        });
        }
	};

	$scope.thumb_click = function(index) {
		console.log("thumb click");
		$scope.iLightIndex = index;
	}
	$scope.map_icon_click = function(index) {
		console.log("map click");
		$scope.thumb_click(index);
		$scope.$apply();
	}

	/*
	$scope.map_icon_click = function(event, index) {
		console.log("icon clicked: " + index)
		$scope.iLightIndex = index;
		$scope.$apply();
	}*/
	$scope.map_changed = function(event) {
		// only fire this event if we're actually doing a geo search
		if($scope.search_mode == 'map' || $scope.search_mode == 'search_map'){
			// the map has been interacted with, so we'll make a geo search for the user
			// for now we replace their search with this geo-search, later we'll re-support multiquery searches
			var llBounds = this.getBounds();
			var fNELat = llBounds.getNorthEast().lat();
			var fNELon = llBounds.getNorthEast().lng();
			var fSWLat = llBounds.getSouthWest().lat();
			var fSWLon = llBounds.getSouthWest().lng();

			var sGeoQuery = "map=" + fSWLat + "," + fNELat + "," + fSWLon + "," + fNELon;

			console.log(sGeoQuery);
			$scope.query = sGeoQuery;
			$scope.page = 1;
			$scope.$apply();
		}
	}

	$scope.close_lightbox = function(){
		$scope.iLightIndex = -1;
	}
	$scope.pagination_enabled = function(b_previous){
		if(b_previous){
			if($scope.page == 1)
				return false;
			else
				return true;
		}else{
			if($scope.page == $scope.search_info.available_pages)
				return false;
			else
				return true;
		}
	}
	$scope.show_pagination = function(){
		if($scope.search_mode === 'map'){
			return false;
		}else{
			return ($scope.search_info.available_pages > 1);
		}
	}
	$scope.show_map_summary = function(){
		if($scope.search_mode === 'map'){
			return true;
		}else{
			return false;
		}
	}
	$scope.map = {
	    center: {
	        latitude: 0,
	        longitude: 0
	    },
	    zoom: 1
	};

	$scope.status = function(){
		var s_message = "";


		return s_message;
	}
});