'use strict';

/* Services */

angular.module('depth.services', ['ngResource'])
	.factory('ItemsResult', function($resource, AppConfig) {
		return $resource(AppConfig.sciencebaseUrl + '/catalog/items', {}, {
			query: {method: 'GET'}
		});
	})
	.factory('Item', function($resource, AppConfig) {
		return $resource(AppConfig.sciencebaseUrl + '/catalog/item/:itemId', {itemId: '@id'}, {
			get: {method: 'GET'},
			update: {method: 'PUT'}
		});
	})
	.value('version', '0.1');

Depth.factory('State', function() {
	var currentSet = {};

	var links = [
    {route: "view", text: "<i class='icon-search'></i> View Projects"},
    {route: "edit", text: "<i class='icon-pencil'></i> Edit Projects"},
    {route: "edit/create", text: "<i class='icon-plus'></i> Create Project"},
    {route: "agendas", text: "<i class='icon-leaf'></i> Edit Agendas"},
    {route: "docs", text: "<i class='icon-book'></i> Developer Documentation"}
  ];

  return {shared: {currentSet: currentSet, links: links, projectSets: {}}};

});