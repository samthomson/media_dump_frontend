
var mediadumpApp = angular.module('mediadumpApp', ['ngRoute', 'mediadumpController']);



/*
mediadumpApp.config(['$routeProvider', '$httpProvider',
	function($routeProvider, $httpProvider) {
	$routeProvider.
		when('/:search_mode/', {
			templateUrl: 'templates/page_ui.html',
			controller: 'mediadumpCtrl',
			reloadOnSearch: false
		}).
		when('/:search_mode/:term/', {
			templateUrl: 'templates/page_ui.html',
			controller: 'mediadumpCtrl',
			reloadOnSearch: false
		}).
		when('/:search_mode/:term/:page', {
			templateUrl: 'templates/page_ui.html',
			controller: 'mediadumpCtrl',
			reloadOnSearch: false
		}).
		when('/:search_mode/:term/:page/:file', {
			templateUrl: 'templates/page_ui.html',
			controller: 'mediadumpCtrl',
			reloadOnSearch: false
		})
		.otherwise({
			templateUrl: 'templates/page_ui.html',
			controller: 'mediadumpCtrl',
			reloadOnSearch: false
		});
	    delete $httpProvider.defaults.headers.common['X-Requested-With'];
	}]);
*/