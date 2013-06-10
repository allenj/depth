'use strict';

/* Services */

angular.module('depth.services', ['ngResource'])
	.factory('ItemsResult', function($resource) {
		return $resource('https://my-beta.usgs.gov/catalog/items', {}, {
		// return $resource('https://www.sciencebase.gov/catalog/items', {}, {
			query: {method: 'GET'}
		});
	})
	.factory('Item', function($resource) {
		return $resource('https://my-beta.usgs.gov/catalog/item/:itemId', {itemId: '@id'}, {
		// return $resource('https://www.sciencebase.gov/catalog/item/:itemId', {itemId: '@id'}, {
			get: {method: 'GET'},
			update: {method: 'PUT'}
		});
	})
	.value('version', '0.1');