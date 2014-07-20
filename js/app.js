
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

function _set_tab(s_tab){
	$("#tabs li").removeClass("active");
	$("#tabs li#"+s_tab+"_tab").addClass("active");

	$("#search_results .search_results_tab").removeClass("active");
	$("#search_results .search_results_tab#"+s_tab).addClass("active");
}