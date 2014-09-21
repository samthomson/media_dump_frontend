
var mediadumpApp = angular.module('mediadumpApp', ['ngRoute', 'google-maps']);

mediadumpApp.config(function($httpProvider){
    delete $httpProvider.defaults.headers.common['X-Requested-With'];
});

mediadumpApp.controller('mediadumpCtrl', function ($location, $scope, $route, $routeParams, $http) {


	$scope.query = "*";
	$scope.total_files_in_md = 12447;

	
	$scope.default_queries = [];
	$http.get('http://media-dump.samt.st/generate_json.php')
	.then(function(res) {
		$scope.default_queries = res.data;
	});


	
	// app stuff
	
	$scope.bQueryBuilderVisible = false;

	// search stuff
	$scope.search_mode = "search";
	
	$scope.page = 1;

	$scope.iLightIndex = -1;


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

	$scope.results = [];
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
	$scope.bSearching = false;


	// ui stuff
	$scope.sLightboxURL = "";
	$scope.sLightboxPlace = "";
	$scope.map_settings = {"centre": [0, 0], "zoom": 1};

	//
	// data interfaces
	//
	$scope.markers = [];
	$scope.map = {
	    center: {
	        latitude: 45,
	        longitude: -73
	    },
	    zoom: 8
	};	
	$scope.search_map = {
	    center: {
	        latitude: 45,
	        longitude: -73
	    },
	    bounds: {},
	    zoom: 8,
	    events: {
		    idle: function (map) {
		    	$scope.$apply(function () {

		    		//$scope.map_changed();


					/*
		    		console.log(map.getBounds().getNorthEast());
		    		console.log(map.getBounds().getSouthWest());
		    		console.log(map.getBounds());
		    		console.log("");
		    		*/

		    		/*
		    		console.log($scope.search_map.bounds.northeast.latitude);
		    		console.log($scope.search_map.bounds.southwest.latitude);
		    		console.log("");
		    		*/
		    		/*
		    		var llBounds = map.getBounds();

			    	var llNorthEast = llBounds.getNorthEast();
			    	var llSouthWest = llBounds.getSouthWest();


			    	var sQuery = "map=";
			    	sQuery += llSouthWest.lat();
			    	sQuery += ",";			
			    	sQuery += llNorthEast.lat();
			    	sQuery += ",";			
			    	sQuery += llSouthWest.lng();
			    	sQuery += ",";			
			    	sQuery += llNorthEast.lng();

			    	console.log(sQuery);    
			    	*/
				});
		    }
	    }
	};	

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
		$scope.page = 1;
		$scope.do_search();
		$scope.reconstruct_url();
	});
	$scope.$watch('page', function(){
		if($scope.page < 1){
			$scope.page = 1;
		}
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
	$scope.$watch('results', function(){
		// reset markers structure that we'll return (so that it can be returned empty if no resutls)
		$scope.markers = [];

		var mTempMarker = {};

		// go through all results and parse them into what a marker requires
		for(var cResult = 0; cResult < $scope.results.length; cResult++){
			mTempMarker = {
	            latitude: $scope.results[cResult].a,
	            longitude: $scope.results[cResult].o,
	            title: 'm' + cResult,
	            icon: $scope.urlFromHash('map_search', $scope.results[cResult].h, '')
	        };
	        mTempMarker["id"] = cResult;
	        $scope.markers.push(mTempMarker);
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
		}
	};
	$scope.lightRight = function(){		
		if($scope.iLightIndex < $scope.results.length -1){
			$scope.iLightIndex++;
			$scope.sLightboxURL = $scope.urlFromHash('lightbox', $scope.results[$scope.iLightIndex].h, $scope.results[$scope.iLightIndex].e);
			$scope.sLightboxPlace = $scope.results[$scope.iLightIndex].p;
		}
	};

	$scope.urlFromHash = function(sMode, sHash, sExt){
		//sHash = Object.keys(sHash)[0];

		return 'http://mdcdn/thumb/'+sHash.id+'.jpg';
		
		switch(sMode){
			case 'lightbox':
				return 'http://5.cdn.samt.st/lightbox/'+sHash+'.'+sExt;
				break;
			case 'map_search':
				return 'http://6.cdn.samt.st/icon/'+sHash+'.jpg';
				break;
			case 'thumbs':
				return 'http://7.cdn.samt.st/map-result/'+sHash+'.jpg';
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

			
			
			//console.log("preload: " + );
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
	};

	$scope.do_search = function() {
		$scope.results = [];
		$scope.search_info = [];

		if($scope.query !== ""){
			$scope.bSearching = true;	
			$http({
		        method  : 'GET',
		        /*url     : 'http://media-dump-instant/api/search',
		        url     : 'http://media-dump.samt.st/api/search',*/
		        url     : 'http://127.0.0.1:8000/search/',
		        params    : {query: $scope.query, page: $scope.page, m: $scope.search_mode}
		    })
	        .success(function(data) {
	            if(data != undefined){
	            	$scope.results = data.files;
		            $scope.search_info = data.results_info;

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
		$scope.iLightIndex = index;
	}
	$scope.map_icon_click = function() {
		console.log("light clicked");
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