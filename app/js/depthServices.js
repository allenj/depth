'use strict';

/* Services */

angular.module('depth.services', ['ngResource'])
	.factory('ItemsResult', function($resource) {
		// return $resource('https://my-beta.usgs.gov/catalog/items', {}, {
		return $resource('https://www.sciencebase.gov/catalog/items', {}, {
			query: {method: 'GET'}
		});
	})
	.factory('Item', function($resource) {
		// return $resource('https://my-beta.usgs.gov/catalog/item/:itemId', {itemId: '@id'}, {
		return $resource('https://www.sciencebase.gov/catalog/item/:itemId', {itemId: '@id'}, {
			get: {method: 'GET'},
			update: {method: 'PUT'}
		});
	})
	.value('version', '0.1');

Depth.factory('State', function() {
	var currentSet = {};
	var projectSets = [
    {route: "csc", name: "CSCs & Partners", hasAgenda: true, parentIds: []},
    {route: "sandy", name: "Sandy", hasAgenda: false, parentIds: []}
  ];

	var links = [
    {route: "view", text: "<i class='icon-search'></i> View Projects"},
    {route: "edit", text: "<i class='icon-pencil'></i> Edit Projects"},
    {route: "edit/create", text: "<i class='icon-plus'></i> Create Project"},
    {route: "agendas", text: "<i class='icon-leaf'></i> Edit Agendas"},
    {route: "docs", text: "<i class='icon-book'></i> Developer Documentation"}
  ];

  return {shared: {currentSet: currentSet, projectSets: projectSets, links: links}};

});