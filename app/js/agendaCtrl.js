'use strict';

function AgendaCtrl($scope, filterFilter, $http, $location, $filter, Item, ItemsResult, $cookies) {
	$scope.alerts = [];
	$scope.devAlerts = [];

	$scope.agendas = [];
	$scope.items = [];

	$scope.isNew = true;

	// Get all the agendas for an item
	$scope.getAgendas = function(item) {
		if (!item) {
			return {};
		}
		var agendas;
		var expandos = filterFilter(item.facets, {className: "gov.sciencebase.catalog.item.facet.ExpandoFacet"});
		if (expandos.length > 0) {
			for (var i in expandos[0].object.agendas) {
				expandos[0].object.agendas[i].id = item.id;
			}
			agendas = expandos[0].object.agendas;
		}
		return agendas;
	};

	// Get an item from ScienceBase by id
	var getItem = function(id) {
		var item = Item.get({
			itemId: id,
			josso: $cookies["JOSSO_SESSIONID"]
		}, function() {
			$scope.items = $scope.items.concat(item);
			item.agendas = $scope.getAgendas(item);
			$scope.agendas = $scope.agendas.concat(item.agendas);
		});
		return item;
	};

	$scope.testitem = getItem('519f7e3ee4b0bc9b960d973c');
	$scope.nccwsc = getItem('4f4e476ae4b07f02db47e13b');
	$scope.lcmap = getItem('4f4e476ee4b07f02db47e164');
	$scope.other = getItem('511ac38ee4b084e2824d6a26');

	var refreshItems = function() {
		$scope.items = [];
		$scope.agendas = [];
		$scope.testitem = getItem('519f7e3ee4b0bc9b960d973c');
		$scope.nccwsc = getItem('4f4e476ae4b07f02db47e13b');
		$scope.lcmap = getItem('4f4e476ee4b07f02db47e164');
		$scope.other = getItem('511ac38ee4b084e2824d6a26');
	};

	$scope.agenda = {};
	$scope.alphabet = ['a','b','c','d','e','f','g','h','i','j','k','l','m','n','o','p','q','r','s','t','u','v','w','x','y','z'];

	// Keeps the agenda themes numbered correctly
	$scope.$watch('agenda', function(newVal, oldVal) {
		if (oldVal && newVal && oldVal.themes && newVal.themes && oldVal.themes.length !== newVal.themes.length) {
			for (var i in $scope.agenda.themes) {
				$scope.agenda.themes[i].number = parseInt(i, 10) + 1;
			}
		}
	}, true);

	// Add a new agenda to it's parent item
	$scope.addAgenda = function() {
		// $scope.agendas.push($scope.agenda);
		var itemIdx = findIndexByKeyValue($scope.items, 'id', $scope.agenda.id);
		var item = $scope.items[itemIdx];
	    var expandoIdx = findIndexByKeyValue(item.facets, "className", "gov.sciencebase.catalog.item.facet.ExpandoFacet");
	    item.facets[expandoIdx].object.agendas.push($scope.agenda);

	    item.$update({josso: $cookies["JOSSO_SESSIONID"]});
	};

	// Save agenda changes (except parent change)
	$scope.save = function() {
		var idx = findIndexByKeyValue($scope.items, 'id', $scope.agenda.id);
		$scope.items[idx].$update({josso: $cookies["JOSSO_SESSIONID"]});
	};

	// Edit agenda
	$scope.editAgenda = function(agenda) {
		$scope.agenda = agenda;
	};

	// Delete agenda and save item
	$scope.deleteAgenda = function(item, agenda) {
		var idx = findIndexByKeyValue(item, 'id', agenda.id);
		item.agendas.splice(item.agendas.indexOf(agenda), 1);
		item.$update(
			{
				josso: $cookies["JOSSO_SESSIONID"]
			}, function() {
				item = new Item(item);
			});
		refreshItems();
	};

	// get parent item by id
	$scope.getParent = function(id) {
		var idx = findIndexByKeyValue($scope.items, 'id', id);
		return $scope.items[idx];
	};

	// edit an agenda
	$scope.edit = function(item, agenda) {
		$scope.isNew = false;
		$scope.agenda = agenda;
		show('editAgenda', false);
		show('viewAgendas', true);
	};

	// clear the agenda
	$scope.newAgenda = function() {
		show('editAgenda', false);
		show('viewAgendas', true);
		$scope.isNew = true;
		var agenda = 
		{
			name: "",
			description: "", 
			url: "",
			themes: 
			[
			{
				name: "",
				question: 1,
				options: 
				{
					a: "Boolean"
				}
			}
			]
		};
		return agenda;
	};

	$scope.view = function() {
		show('viewAgendas', false);
		show('editAgenda', true);
	};

	$scope.addTheme = function(themes) {
		if (!themes) {
			themes = [];
		}
		var nextNum = 1;
		for (var i in themes) {
			if (themes[i].number >= nextNum) {
				nextNum = themes[i].number + 1;
			}
		}

		themes.push({name: "", options: {a: "Boolean"}});
		return themes;
	};

	$scope.removeTheme = function(themes, theme) {
		themes.splice(themes.indexOf(theme), 1);
		return themes;
	};

	$scope.addOption = function(options) {
		var alphabet = ['a','b','c','d','e','f','g','h','i','j','k','l','m','n','o','p','q','r','s','t','u','v','w','x','y','z'];
		var nextLetter = 'a';
		for (var key in options) {
			if (alphabet.indexOf(key) >= alphabet.indexOf(nextLetter)) {
				nextLetter = alphabet[alphabet.indexOf(key) + 1];
			}
		}
		options[nextLetter] = "Boolean";
		return options;
	};

	$scope.removeOption = function(options) {
		var key;
		// Get the last key and delete it
		for (key in options) {}

		delete options[key];
		return options;
	}
}