
var mediadumpApp = angular.module('mediadumpApp', ['ngRoute', 'mediadumpControllers']);



mediadumpApp.config(['$routeProvider', '$httpProvider',
	function($routeProvider, $httpProvider) {
	$routeProvider.
		when('/:search_mode/', {
			templateUrl: 'templates/search_ui.html',
			controller: 'mediadumpCtrl',
			reloadOnSearch: false
		}).
		when('/:search_mode/:term/', {
			templateUrl: 'templates/search_ui.html',
			controller: 'mediadumpCtrl',
			reloadOnSearch: false
		}).
		when('/:search_mode/:term/:page', {
			templateUrl: 'templates/search_ui.html',
			controller: 'mediadumpCtrl',
			reloadOnSearch: false
		}).
		when('/:search_mode/:term/:page/:file', {
			templateUrl: 'templates/search_ui.html',
			controller: 'mediadumpCtrl',
			reloadOnSearch: false
		})
		.otherwise({
			templateUrl: 'templates/search_ui.html',
			controller: 'mediadumpCtrl',
			reloadOnSearch: false
		});
	    delete $httpProvider.defaults.headers.common['X-Requested-With'];
	}]);