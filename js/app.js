
var mediadumpApp = angular.module('mediadumpApp', ['ngRoute', 'mediadumpController', 'google-maps']);


function _set_tab(s_tab){
	$("#tabs li").removeClass("active");
	$("#tabs li#"+s_tab+"_tab").addClass("active");

	$("#search_results .search_results_tab").removeClass("active");
	$("#search_results .search_results_tab#"+s_tab).addClass("active");
}