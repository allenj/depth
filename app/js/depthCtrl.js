'use strict';

// The main Depth Controller
function DepthCtrl($scope, filterFilter, $http, $location, $filter, $routeParams, State) {
  // Set ScienceBase URL
  // $scope.sciencebaseUrl = "https://my-beta.usgs.gov/catalog";
  $scope.sciencebaseUrl = "https://www.sciencebase.gov/catalog";

  // Load config file
  $scope.depthConfig = {};
  var configLoaded = false;
  $http.get('depthConfig.json').success(function(data){
    $scope.depthConfig = data;
    configLoaded = true;
  });

  // ALERTS
  $scope.alerts = [{msg: "WARNING: DEPTH is currently pointed at SB Production. Any changes you make will be PERMANENT!", type: "warning"}];
  // $scope.alerts = [];
  $scope.devAlerts = [];
  $scope.closeAlert = function(index) {
    $scope.alerts.splice(index, 1);
  };

  // whether or not to show the agenda, should remove once we have sessions figured out
  $scope.hasAgendas = function() {
    if ($routeParams.projectSet === "csc") {
      return true;
    }
    else { 
      return false ; 
    }
  };

  // Check for Josso, if found refresh the items
  $scope.checkJosso = function() {
    $scope.josso_check = {};
    $http.get("/depth/josso-auth/json-josso.php").
      success(function(data, status) {
        $scope.josso_check = data;
        $scope.refreshData();
      }).error(function (data, status, headers, config) {
        $scope.alerts.push({msg: "DEPTH error: Security Check Failed.", type: "error"})
        $scope.devAlerts.push({msg: "failed josso_check\nstatus: " + status + "\ndata: " + data + "\nheaders: " + headers + "\nconfig: " + config, type: "error"});
      });
  };
  $scope.checkJosso();

  // Set up the json for the edit form
  $scope.json = {};
  $scope.json.id = "";
  $scope.json.parentId = "";
  $scope.json.contacts = [];
  $scope.json.alternateTitles = [];
  $scope.json.facets = [];
  $scope.json.identifiers = [];
  $scope.json.tags = [];
  $scope.json.dates = [];
  $scope.json.webLinks = [];

  // Some defaults for fields
  $scope.fiscalYears = [{fy: "2008"}, {fy: "2009"}, {fy: "2010"}, {fy: "2011"}, {fy: "2012"}, {fy: "2013"}];
  $scope.projectTypes = [{type: "Science Project"}, {type: "Science Support Project"}, {type: "Other Project"}];
  $scope.projectStatuses = ["Active", "Approved", "Completed", "Funded", "In Progress", "Proposed"];

  // Load the projects and organizations
  $scope.currentSet = State.shared.currentSet;
  $scope.vocabName = $scope.currentSet.vocabName;
  $scope.orgTypes = $scope.currentSet.communities;
  $scope.allProjects = [], $scope.organizations = [];
  $scope.refreshData = function() {
    if (!$scope.josso_check) { $scope.checkJosso(); }
    $scope.allProjects = [];
    var projectTypeScheme = "http://www.sciencebase.gov/vocab/category/" + $scope.vocabName + "/Project/ProjectType";
    var projectsUrl = "/items?q=&filter=tags={scheme:'" + projectTypeScheme + "',type:'Label'}&format=json&fields=tags,title,facets,dates,contacts&max=1000&josso=" + $scope.josso_check.josso;
    $http.get($scope.sciencebaseUrl + projectsUrl).
      success(function(data, status) {
        $scope.allProjects = data.items;
        // set project
        $scope.project = filterFilter($scope.allProjects, {id: $scope.json.id})[0];
      }).error(function (data, status, headers, config) {
        $scope.alerts.push({msg: "DEPTH error: failed to load necessary data.", type: "error"});
        $scope.devAlerts.push({msg: "failed to get orgs\nstatus: " + status + "\ndata: " + data + "\nheaders: " + headers + "\nconfig: " + config, type: "error"});
      });

    $scope.organizations = [];
    var hasTags = $scope.json && $scope.json.tags;
    var orgLabelScheme = "http://www.sciencebase.gov/vocab/category/" + $scope.vocabName + "/OrgLabel";
    var orgsUrl = $scope.sciencebaseUrl + "/items?q=&filter=tags={scheme:'" + orgLabelScheme + "',type:'Label'}&format=json&fields=tags,title&max=1000&josso=" + $scope.josso_check.josso;
    $http.get(orgsUrl).
      success(function(data, status) {
        $scope.organizations = data.items;
        // set organization
        if (hasTags && filterFilter($scope.json.tags, {scheme: "http://www.sciencebase.gov/vocab/category/" + $scope.vocabName + "/Project/OrganizationName", type: "Label"})[0]) {
          $scope.organization = organization.name;
        }
      }).error(function (data, status, headers, config) {
        $scope.alerts.push({msg: "DEPTH error: failed to load necessary data.", type: "error"});
        $scope.devAlerts.push({msg: "failed to get orgs\nstatus: " + status + "\ndata: " + data + "\nheaders: " + headers + "\nconfig: " + config, type: "error"});
      });
  };

  // Load the agendas, TODO: get rid of hardcoding
  $scope.agendas = [];
  $http.get($scope.sciencebaseUrl + "/item/4f4e476ae4b07f02db47e13b?format=json&fields=facets").
    success(function(data, status) {
      $scope.agendas = filterFilter(data.facets, {className: "gov.sciencebase.catalog.item.facet.ExpandoFacet"})[0].object.agendas;
    }).error(function (data, status, headers, config) {
      $scope.alerts.push({msg: "DEPTH error: failed to load necessary data.", type: "error"});
      $scope.devAlerts.push({msg: "failed to get agendas\nstatus: " + status + "\ndata: " + data + "\nheaders: " + headers + "\nconfig: " + config, type: "error"});
    });
  // watch the agenda for changes
  $scope.$watch('filter.agenda', function(oldVal, newVal) {
    if (!$scope.filter.agenda || !$scope.filter.agenda.themes) {
      return;
    }
    var allTrue = true;
    var allFalse = true;
    for (var t in $scope.filter.agenda.themes) {
      var themeTrue = true;
      for (var o in $scope.filter.agenda.themes[t].options) {
        if ($scope.filter.agenda.themes[t].options[o] !== true) {
          themeTrue = false;
          allTrue = false;
        } else {
          allFalse = false;
        }
      }
      $scope.filter.agenda.themes[t].set = themeTrue;
    }
    $scope.filter.agenda.all = allTrue;
    $scope.filter.agenda.none = allFalse;
  }, true);

  // View page Filters (and prefilters because angularui doesn't work quite right)
  $scope.filter = {orgTypes: null, organizations: null, fiscalYears: null, projectTypes: null, pis: null, keywords: null, projStatuses: null, projects: null};
  $scope.prefilter = {orgTypes: null, organizations: null, fiscalYears: null, projectTypes: null, pis: null, keywords: null, projStatuses: null, projects: null};

  // select2/angularui doesn't work quite right and so we need to parse strings into json
  $scope.$watch('prefilter.orgTypes', function(oldVal, newVal){
    $scope.filter.orgTypes = $scope.parseJsonArray($scope.prefilter.orgTypes);
  }, true);
  $scope.$watch('prefilter.organizations', function(oldVal, newVal) {
    $scope.filter.organizations = $scope.parseJsonArray($scope.prefilter.organizations);
  }, true);
  $scope.$watch('prefilter.pis', function(oldVal, newVal) {
    $scope.filter.pis = $scope.parseJsonArray($scope.prefilter.pis);
  }, true);
  $scope.$watch('prefilter.keywords', function(oldVal, newVal) {
    $scope.filter.keywords = $scope.parseJsonArray($scope.prefilter.keywords);
  }, true);
  $scope.$watch('prefilter.projects', function(oldVal, newVal) {
    $scope.filter.projects = $scope.parseJsonArray($scope.prefilter.projects);
  }, true);

  // other watches for the project view page filters
  $scope.pis = [];
  $scope.$watch('searchProjects', function(oldVal, newVal){
    var contacts = [];
    var fullContacts = [];
    var filteredProjects = $scope.searchProjects;
    for (var i = 0; i < filteredProjects.length; i++) {
      var pis = filterFilter(filteredProjects[i].contacts, {type: "Principal Investigator"});
      fullContacts = fullContacts.concat(pis);
    }
    for (var i = 0; i < fullContacts.length; i++) {
      if (fullContacts[i]) {
        // Only put in unique contacts (aka ones that aren't already in contacts)
        var idx = findIndexByKeyValue(contacts, "name", fullContacts[i].name);
        if (idx === -1) {
          contacts.push(fullContacts[i]);
        }
      } 
    }
    // contacts = jQuery.unique(contacts);
    $scope.pis = contacts;
  }, true);
  $scope.kws = [];
  $scope.$watch('allProjects', function(oldVal, newVal){
    var filteredProjects = $scope.allProjects;
    var keywords = [];
    for (var i = 0; i < filteredProjects.length; i++) {
      var kws = filterFilter(filteredProjects[i].tags, {scheme: "http://www.sciencebase.gov/vocab/category/" + $scope.vocabName + "/Keyword", type: "Keyword"});
      for (var j = 0; j < kws.length; j++) {
        var idx = findIndexByKeyValue(keywords, "name", kws[j].name);
        if (idx === -1) keywords.push(kws[j]);
      }
    }
    $scope.kws = keywords;
  }, true);
  $scope.searchProjects = [];
  $scope.$watch('[allProjects, filter]', function(oldVal, newVal){
    $scope.searchProjects = $filter('projectsFilter')($scope.allProjects, 
      {
        orgTypes: $scope.filter.orgTypes, 
        orgs: $scope.filter.organizations, 
        projType: $scope.filter.projectType
      });

  }, true);

  // Make sure the data in the form stays in good shape
  $scope.persistNecessaryData = function() {
    // all json
    if (!$scope.json) $scope.json = {};
    // arrays
    if (!$scope.json.alternateTitles) $scope.json.alternateTitles = [];
    if (!$scope.json.contacts) $scope.json.contacts = [];
    if (!$scope.json.dates) $scope.json.dates = [];
    if (!$scope.json.identifiers) $scope.json.identifiers = [];
    if (!$scope.json.facets) $scope.json.facets = [];
    if (!$scope.json.tags) $scope.json.tags = [];
    if (!$scope.json.webLinks) $scope.json.webLinks = [];

    // Contacts
    $scope.persistContacts(["Principal Investigator", "Funding Agency", "Cooperator/Partner"]);

    var coops = filterFilter($scope.json.contacts, {type: "Cooperator/Partner"});
    if(coops[coops.length-1].name){
      $scope.json.contacts.push({type: "Cooperator/Partner"});
    }

    // Tags
    $scope.persistTags([
      {scheme: "http://www.sciencebase.gov/vocab/category/" + $scope.vocabName + "/Project/FiscalYear", type: "Label"}, 
      {scheme: "http://www.sciencebase.gov/vocab/category/" + $scope.vocabName + "/Project/OrganizationType", type: "Label"}, 
      {scheme: "http://www.sciencebase.gov/vocab/category/" + $scope.vocabName + "/Project/OrganizationName", type: "Label"}, 
      {scheme: "http://www.sciencebase.gov/vocab/category/" + $scope.vocabName + "/Project/ProjectType", type: "Label"}, 
      {scheme: "http://www.sciencebase.gov/vocab/category/" + $scope.vocabName + "/Keyword", type: "Keyword"}, 
      {scheme: "http://www.sciencebase.gov/vocab/category/" + $scope.vocabName + "/Location", type: "Location"}]);

    var kws = filterFilter($scope.json.tags, {scheme: "http://www.sciencebase.gov/vocab/category/" + $scope.vocabName + "/Keyword", type: "Keyword"});
    if(kws.length > 0 && kws[kws.length-1].name) {
      $scope.json.tags.push({scheme: "http://www.sciencebase.gov/vocab/category/" + $scope.vocabName + "/Keyword", type: "Keyword"});
    }

    var locs = filterFilter($scope.json.tags, {scheme: "http://www.sciencebase.gov/vocab/category/" + $scope.vocabName + "/Location", type: "Location"});
    if(locs.length > 0 && locs[locs.length-1].name) {
      $scope.json.tags.push({scheme: "http://www.sciencebase.gov/vocab/category/" + $scope.vocabName + "/Location", type: "Location"});
    }

    // Dates
    $scope.persistDates([
      {label: "Start Date", type: "Start"},
      {label: "End Date", type: "End"}
      ]);

    // Weblinks
    if ($scope.json.webLinks.length === 0 || 
        $scope.json.webLinks[$scope.json.webLinks.length-1].uri ||
        $scope.json.webLinks[$scope.json.webLinks.length-1].title) {
      $scope.json.webLinks.push({});
    }

    // Facets
    var projs = filterFilter($scope.json.facets, {className: "gov.sciencebase.catalog.item.facet.ProjectFacet"});
    if(projs.length === 0) {
      $scope.json.facets.push({className: "gov.sciencebase.catalog.item.facet.ProjectFacet"});
    }

    var expandos = filterFilter($scope.json.facets, {className: "gov.sciencebase.catalog.item.facet.ExpandoFacet"});
    if(expandos.length === 0) {
      $scope.json.facets.push({className: "gov.sciencebase.catalog.item.facet.ExpandoFacet"});
    }

    var projIdx = findIndexByKeyValue($scope.json.facets, "className", "gov.sciencebase.catalog.item.facet.ProjectFacet");
    if(projIdx >= 0){
      if(!$scope.json.facets[projIdx].funding){
        $scope.json.facets[projIdx].funding = [];
      }

      var funds = $scope.json.facets[projIdx].funding;
      if(funds.length === 0 || funds[funds.length-1].fiscalYear || funds[funds.length-1].fundingAmount) {
        $scope.json.facets[projIdx].funding.push({fiscalYear: null, fundingAmount: null});
      }

      if(!$scope.json.facets[projIdx].projectProducts) {
        $scope.json.facets[projIdx].projectProducts = [{status: "Expected"}, {status: "Delivered"}];
      }

      var expProd = filterFilter($scope.json.facets[projIdx].projectProducts, {status: "Expected"});
      if(expProd.length === 0 || expProd[expProd.length-1].productDescription) {
        $scope.json.facets[projIdx].projectProducts.push({status: "Expected"});
      }
      var delProd = filterFilter($scope.json.facets[projIdx].projectProducts, {status: "Delivered"});
      if(delProd.length === 0 || delProd[delProd.length-1].productDescription) {
        $scope.json.facets[projIdx].projectProducts.push({status: "Delivered"});
      }

      if(!$scope.json.facets[projIdx].parts) {
        $scope.json.facets[projIdx].parts = [];
      }
    }

    var expandoIdx = findIndexByKeyValue($scope.json.facets, "className", "gov.sciencebase.catalog.item.facet.ExpandoFacet");
    if (expandoIdx >= 0) {
      if (!$scope.json.facets[expandoIdx].object) {
        $scope.json.facets[expandoIdx].object = {};
      }
      if (!$scope.json.facets[expandoIdx].object.agendas) {
        $scope.json.facets[expandoIdx].object.agendas = [];
      }
    }

    // TODO: should change this to a $watch instead
    return "";
  };

  $scope.persistContacts = function(contactTypes) {
    for (var i = 0; i < contactTypes.length; i++) {
      if (filterFilter($scope.json.contacts, {type: contactTypes[i]}).length === 0) {
        $scope.json.contacts.push({type: contactTypes[i]});
      }
    }

  };

  $scope.persistTags = function(tagTypes) {
    for (var i = 0; i < tagTypes.length; i++) {
      if (filterFilter($scope.json.tags, {scheme: tagTypes[i].scheme, type: tagTypes[i].type}).length === 0) {
        $scope.json.tags.push({scheme: tagTypes[i].scheme, type: tagTypes[i].type});
      }
    }
  };

  $scope.persistDates = function(dates) {
    for (var i = 0; i < dates.length; i++) {
      if (filterFilter($scope.json.dates, {label: dates[i].label, type: dates[i].type}).length === 0) {
        $scope.json.dates.push({label: dates[i].label, type: dates[i].type});
      }
    }
  };

  $scope.orgIsParent = function (id, org, orgs) {
    var orgId;
    angular.forEach(orgs, function(orgJson) {
      if (orgJson.title === org) {
        orgId = orgJson.id;
      }
    });
    if (id && orgId && orgId === id) {
      return true;
    }
    return false;
  };

  $scope.setOrgAsParent = function (org, orgs) {
    var orgId;
    angular.forEach(orgs, function(orgJson) {
      if (orgJson.title === org) {
        orgId = orgJson.id;
      }
    });
    if (orgId) {
      $scope.json.parentId = orgId;
    }
    if (!orgId || $scope.json.parentId !== orgId) {
      $scope.alerts.push({msg: "Error setting parent id. Please choose and organization.", type: "error"});
    }
  };

  //Need to figure out how to make this persistant
  $scope.indexOfProject = function() {
    return findIndexByKeyValue($scope.json.facets, "className", "gov.sciencebase.catalog.item.facet.ProjectFacet");
  };

  //Adds on arrays - these are unnecessary now
  $scope.addContact = function() {
    $scope.json.contacts.push({type:$scope.contact.type, name:$scope.contact.name, organization:{displayText:$scope.contact.organization.displayText}});
    $scope.contact.type = '';
    $scope.contact.name = '';
    $scope.contact.organization = {};
    $scope.contact.organization.displayText = '';
    $scope.contact.type.focus();
  };

  $scope.addBlankContact = function(type) {
    $scope.json.contacts.push({type: type});
  };

  $scope.addAltTitle = function() {
    $scope.json.alternateTitles.push($scope.altTitles);
    $scope.altTitles = "";
  };

  $scope.addIdentifier = function() {
    $scope.json.identifiers.push({scheme:$scope.identifier.scheme, type:$scope.identifier.type, key:$scope.identifier.key});
    $scope.identifier.scheme = '';
    $scope.identifier.type = '';
    $scope.identifier.key = '';
  };

  $scope.addTag = function() {
    $scope.json.tags.push({scheme:$scope.tag.scheme, type:$scope.tag.type, name:$scope.tag.name});
    $scope.tag.scheme = '';
    $scope.tag.type = '';
    $scope.tag.name = '';
  };

  $scope.addBlankTag = function(type) {
    var httpType = type.replace(" ", "%20");
    $scope.json.tags.push({scheme:"http://www.sciencebase.gov/vocab/category/" + $scope.vocabName + "/Project/" + httpType, type: type});
  };

  $scope.addDate = function() {
    $scope.json.dates.push({type:$scope.date.type, dateString:$scope.date.dateString, label:$scope.date.label});
    $scope.date.type = '';
    $scope.date.dateString = '';
    $scope.date.label = '';
  };

  //Deletes on arrays
  $scope.deleteContact = function() {
    $scope.json.contacts.splice($scope.json.contacts.indexOf(this.contact), 1);
  };

  $scope.deleteAltTitle = function() {
    $scope.json.alternateTitles.splice($scope.json.alternateTitles.indexOf(this.altTitle), 1);
  };

  $scope.deleteIdentifier = function() {
    $scope.json.identifiers.splice($scope.json.identifiers.indexOf(this.identifier), 1);
  };

  $scope.deleteTag = function() {
    $scope.json.tags.splice($scope.json.tags.indexOf(this.tag), 1);
  };

  $scope.deleteDate = function() {
    $scope.json.dates.splice($scope.json.dates.indexOf(this.date), 1);
  };

  $scope.deleteWeblink = function() {
    $scope.json.webLinks.splice($scope.json.webLinks.indexOf(this.weblink), 1);
  };

  $scope.deleteFacet = function() {
    $scope.json.facets.splice($scope.json.facets.indexOf(this.facet), 1);
  };

  $scope.deleteProduct = function() {
    var projIdx = findIndexByKeyValue($scope.json.facets, "className", "gov.sciencebase.catalog.item.facet.ProjectFacet");
    $scope.json.facets[projIdx].projectProducts.splice($scope.json.facets[projIdx].projectProducts.indexOf(this.product), 1);
  };

  $scope.deleteFund = function() {
    var projIdx = findIndexByKeyValue($scope.json.facets, "className", "gov.sciencebase.catalog.item.facet.ProjectFacet");
    $scope.json.facets[projIdx].funding.splice($scope.json.facets[projIdx].funding.indexOf(this.fund), 1);
  };

  $scope.get = function () {

    if (!$scope.id) {
      $scope.alerts.push({msg: "Please choose a project.", type: "error"});
      return false;
    }

    $scope.newAgenda = {};
    var json = getItem($scope.id, $scope.sciencebaseUrl, $scope.josso_check.josso);
    show("edit-fields", false);

    try
    {
      $scope.json = json;

      $scope.refreshData();

      //clean body
    }
    catch(exception)
    {
      $scope.alerts.push({msg: exception, type: "error"});
    }
    show("sort-fields", true); 
  };

  $scope.copy = function() {
    show("copy-fields", true); 
  };

  $scope.createOrg = function() {
    show("create-org", true);
  };

  $scope.createCopy = function() {

    var parentId = String($scope.newProjectParent);
    var title = $scope.newProjectTitle;

    if (!parentId) {
      $scope.alerts.push({msg: "You need to choose an organization to copy the item into.", type: "error"});
      return false;
    }
    if (!$scope.id) {
      $scope.alerts.push({msg: "You need to choose a project to copy.", type: "error"});
      return false;
    }
    if (!title) {
      $scope.alerts.push({msg: "You need a new title for the project.", type: "error"});
      return false;
    }

    show("edit-fields", false);

    var json = getItem(String($scope.id), $scope.sciencebaseUrl, $scope.josso_check.josso);

    //remove things that we don't want to clone, parentId and id
    delete json.parentId;
    delete json.id;

    // Change the appropriate fields
    json.title = title;

    // remove $$hashKeys
    json = angular.toJson(json);
    json = angular.fromJson(json);

    var returnedJson = upsert('POST', parentId, json, $scope.sciencebaseUrl, $scope.josso_check.josso);

    if (returnedJson && !returnedJson.id) {
      $scope.alerts.push({msg: returnedJson, type: "error"});
      return false;
    }
    else if (!returnedJson || !returnedJson.id) {
      $scope.alerts.push({msg: "An error occurred, please make sure you are logged in and have appropriate permissions.", type: "error"});
      return false;
    }

    try
    {
      $scope.json = returnedJson;

      $scope.refreshData();
    }
    catch(exception)
    {
      $scope.alerts.push({msg: exception, type: "error"});
    } 
    show("copy-fields", true);
    show("sort-fields", true);

    $scope.alerts.push({msg: "Successfully copied item " + String($scope.id) + "to item " + returnedJson.id + ".", type: "success"});
  };

  $scope.createOrganization = function() {

    if (!$scope.josso_check.user) {
      $scope.alerts.push({msg: "You are not logged in.", type: "error"});
      return false;
    } 

    if (!$scope.newOrg || !$scope.newOrg.parent || !$scope.newOrg.parent.id) {
      $scope.alerts.push({msg: "You need to choose an organization type to put the organization in.", type: "error"});
      return false;
    }
    if (!$scope.newOrg.title) {
      $scope.alerts.push({msg: "You need a new title for the organization.", type: "error"});
      return false;
    }

    var json = {};
    json.parentId = $scope.newOrg.parent.id;
    json.title = $scope.newOrg.title;
    json.tags = [{scheme: "http://www.sciencebase.gov/vocab/category/" + $scope.vocabName + "/OrgLabel", type:"Label", name: $scope.newOrg.parent.orgType}];
    json.body = $scope.newOrg.body;
    json.contacts = [{name: $scope.newOrg.contact.name, email: $scope.newOrg.contact.email, type: "Contact"}];


    var returnedJson = upsert('POST', json.parentId, json, $scope.sciencebaseUrl, $scope.josso_check.josso);

    // show("edit-fields", false);
    if (returnedJson && !returnedJson.id) {
      $scope.alerts.push({msg: returnedJson, type: "error"});
      return false;
    }
    else if (!returnedJson || !returnedJson.id) {
      $scope.alerts.push({msg: "An error occurred, please make sure you are logged in and have appropriate permissions.", type: "error"});
      return false;
    }

    try
    {
      $scope.json = returnedJson;
      $scope.refreshData();
    }
    catch(exception)
    {
      $scope.alerts.push({msg: exception, type: "error"});
    } 
    // show("create-org", true);
    // show("sort-fields", true); 

    $scope.alerts.push({msg: "Successfully created Organization " + returnedJson.id + ".", type: "success"});
  };

  $scope.create = function() {
    $scope.json = {};
    $scope.newAgenda = {};
    show("edit-fields", false);
    show("sort-fields", true); 
  };
  if ($routeParams.itemId === "create") {
    $scope.create();
  }


  $scope.put = function() {
    if (!$scope.josso_check.user) {
      $scope.alerts.push({msg: "You are not logged in.", type: "error"});
      return false;
    } 

    var restType = "PUT";
    var json = $scope.json;
    json = $scope.prepareJson(json);

    if (!$scope.json.id) {
      restType = "POST";
      if(!json.title) {
        $scope.alerts.push({msg: "Title required to create new items", type: "error"});
        return false;
      }
      if (!$scope.json.parentId) {
        $scope.alerts.push({msg: "Parent Id is required to create items.", type: "error"});
        return false;
      }
      
      delete json.id;
    } 

    var returnedJson = upsert(restType, $scope.json.id, json, $scope.sciencebaseUrl, $scope.josso_check.josso);

    if (returnedJson && !returnedJson.id) {
      $scope.alerts.push({msg: returnedJson, type: "error"});
      return false;
    }
    else if (!returnedJson || !returnedJson.id) {
      $scope.alerts.push({msg: "An error occurred, please make sure you are logged in and have appropriate permissions.", type: "error"});
      return false;
    }

    try
    {
      $scope.json = returnedJson;

      $scope.refreshData();
    }
    catch(exception)
    {
      $scope.alerts.push({msg: exception, type: "error"});
    }

    $scope.alerts.push({msg: "Successfully saved item " + returnedJson.id + ".", type: "success"});

  };

  $scope.prepareJson = function(json) {
    json = jQuery.extend(true, {}, json);
    // Remove any contacts without a name
    json.contacts = filterFilter(json.contacts, $scope.filterBlankContacts);
    json.webLinks = filterFilter(json.webLinks, $scope.filterBlankWeblinks);
    json.tags = filterFilter(json.tags, $scope.filterBlankTags);
    json.dates = filterFilter(json.dates, $scope.filterBlankDates);

    var projIdx = findIndexByKeyValue(json.facets, "className", "gov.sciencebase.catalog.item.facet.ProjectFacet");
    json.facets[projIdx].projectProducts = filterFilter(json.facets[projIdx].projectProducts, $scope.filterBlankProjects);
    json.facets[projIdx].funding = filterFilter(json.facets[projIdx].funding, $scope.filterBlankFunds);

    // remove $$hashKeys
    json = angular.toJson(json);
    json = angular.fromJson(json);

    return json;
  };

  $scope.filterBlankTags = function(tag) {
    return (tag.name != null && tag.name != "");
  };

  $scope.filterBlankContacts = function(contact) {
    return (contact.name != null && contact.name != ""); 
  };

  $scope.filterBlankWeblinks = function(weblink) {
    return (weblink.uri != null && weblink.uri != "");
  };

  $scope.filterBlankProjects = function(product) {
    return (product.productDescription != null && product.productDescription != "");
  };

  $scope.filterBlankFunds = function(fund) {
    return (fund.fundingAmount != null && fund.fundingAmount != "");
  };

  $scope.filterBlankDates = function(date) {
    return (date.dateString != null && date.dateString != "");
  }

  $scope.filterProjects = function(project) {
    if ($scope.orgType && 
        $scope.orgType.orgType && 
        $scope.orgType.orgType !== "" && 
        filterFilter(project.tags, {scheme: "http://www.sciencebase.gov/vocab/category/" + $scope.vocabName + "/Project/OrganizationType", type: "Label", name: $scope.orgType.orgType}).length === 0) {
      return false;
    }

    var fyTag = {scheme: "http://www.sciencebase.gov/vocab/category/" + $scope.vocabName + "/Project/FiscalYear", type: "Label", name: $scope.fiscalYear};
    if ($scope.fiscalYear && $scope.fiscalYear !== "" && filterFilter(project.tags, fyTag).length === 0) {
      return false;
    }

    var projTypeTag = {scheme: "http://www.sciencebase.gov/vocab/category/" + $scope.vocabName + "/Project/ProjectType", type: "Label", name: $scope.projectType};
    if ($scope.projectType && $scope.projectType !== "" && filterFilter(project.tags, projTypeTag).length === 0) {
      return false;
    }

    if ($scope.organization &&
        $scope.organization.title && 
        $scope.organization.title !== "" && 
        filterFilter(project.tags, {scheme: "http://www.sciencebase.gov/vocab/category/" + $scope.vocabName + "/Project/OrganizationName", type: "Label", name: $scope.organization.title}).length === 0) {
      return false;
    }

    return true;
  };

  $scope.totalFunding = function() {
    var filterParams = {
      orgTypes: $scope.filter.orgTypes, 
      orgs: $scope.filter.organizations, 
      fys: $scope.filter.fiscalYears, 
      projTypes: $scope.filter.projectTypes, 
      pis: $scope.filter.pis, 
      kws: $scope.filter.keywords, 
      projStatuses: $scope.filter.projStatuses, 
      projects: $scope.filter.projects
    };
    var filteredProjects = $filter('projectsFilter')($scope.allProjects, filterParams);
    
    var funding = 0;
    for (var i = 0; i < filteredProjects.length; i++) {
      var projs = filterFilter(filteredProjects[i].facets, {className: "ProjectFacet"});
      // alert($scope.prettyPrint(filteredProjects[i].facets));
      if (projs && projs.length > 0 && projs[0].parts) {
        for (var j = 0; j < projs[0].parts.length; j++) {
          var value = parseInt(projs[0].parts[j].value, 10);
          if (value) {
            funding += parseInt(projs[0].parts[j].value, 10);
          }
        }
      }
      if (projs && projs.length > 0 && projs[0].funding) {
        for (var j = 0; j < projs[0].funding.length; j++) {
          if (parseInt(projs[0].funding[j].fundingAmount, 10)) {
            funding += parseInt(projs[0].funding[j].fundingAmount, 10);
          }
        }
      }
    }
    return funding;
  };

  $scope.prettyPrint = function(json) {
    return JSON.stringify(json, undefined, 2);
  };

  $scope.getJsonObjectLength = function(jsonObj) {
    return Object.keys(jsonObj).length;
  };

  $scope.getCsv = function() {
    var filterParams = {
      orgTypes: $scope.filter.orgTypes, 
      orgs: $scope.filter.organizations, 
      fys: $scope.filter.fiscalYears, 
      projTypes: $scope.filter.projectTypes, 
      pis: $scope.filter.pis, 
      kws: $scope.filter.keywords, 
      projStatuses: $scope.filter.projStatuses, 
      projects: $scope.filter.projects
    };

    var projects = $filter('projectsFilter')($scope.allProjects, filterParams);
    if (!projects) {
      return;
    }

    var url = "/items?q=&filter=tags={scheme:'http://www.sciencebase.gov/vocab/category/" + $scope.vocabName + "/Project/ProjectType',type:'Label'}";
    url += "&format=json&max=1000&josso=" + $scope.josso_check.josso;
    url += "&fields=id,title,contacts,tags,facets,webLinks,body,dates";
   
    $http.get($scope.sciencebaseUrl + url).
      success(function(data, status) {
        var fullJsonItems = $filter('projectsFilter')(data.items, filterParams);

        var flatProjects = [];
        for (var i in fullJsonItems) {
          var flatProject = {};

          // Set up columns, this will keep the order correct
          flatProject["Funding Agency"] = "";
          flatProject["Fiscal Year"] = "";
          flatProject["Project Title"] = "";
          flatProject["Lead Pi"] = "";
          flatProject["Email"] = "";
          flatProject["Organization"] = "";
          flatProject["Affiliation (CSC)"] = "";
          flatProject["Cooperators"] = "";
          flatProject["Project Type"] = "";
          flatProject["Project Status"] = "";
          flatProject["Start Date"] = "";
          flatProject["End Date"] = "";
          flatProject["FY2008 Funding"] = "";
          flatProject["FY2009 Funding"] = "";
          flatProject["FY2010 Funding"] = "";
          flatProject["FY2011 Funding"] = "";
          flatProject["FY2012 Funding"] = "";
          flatProject["FY2013 Funding"] = "";
          flatProject["FY2014 Funding"] = "";
          flatProject["Webpage"] = "";
          flatProject["Project Objectives"] = "";
          flatProject["Keywords"] = "";
          flatProject["Locations"] = "";
          flatProject["Expected Products"] = "";
          flatProject["Delivered Products"] = "";
          flatProject["Summary of Results"] = "";
          flatProject.id = "";

          flatProject.id = fullJsonItems[i].id;
          flatProject["Project Title"] = fullJsonItems[i].title;

          // Tags - Funding Agency
          var fundingAgencies = filterFilter(fullJsonItems[i].tags, {scheme: "http://www.sciencebase.gov/vocab/category/" + $scope.vocabName + "/Project/OrganizationType", type: "Label"});
          for (var fa in fundingAgencies) {
            if (flatProject["Funding Agency"] === "") flatProject["Funding Agency"] = fundingAgencies[fa].name;
            else flatProject["Funding Agency"] += ", " + fundingAgencies[fa].name;
          }

          // Tags - Organization Name
          var affiliations = filterFilter(fullJsonItems[i].tags, {scheme: "http://www.sciencebase.gov/vocab/category/" + $scope.vocabName + "/Project/OrganizationName", type: "Label"});
          for (var affil in affiliations) {
            if (flatProject["Affiliation (CSC)"] === "") flatProject["Affiliation (CSC)"] = affiliations[affil].name;
            else flatProject["Affiliation (CSC)"] += ", " + affiliations[affil].name;
          }

          // Tags - Fiscal Year
          var fys = filterFilter(fullJsonItems[i].tags, {scheme: "http://www.sciencebase.gov/vocab/category/" + $scope.vocabName + "/Project/FiscalYear", type: "Label"});
          for (var fy in fys) {
            if (flatProject["Fiscal Year"] === "") flatProject["Fiscal Year"] = fys[fy].name;
            else flatProject["Fiscal Year"] += ", " + fys[fy].name;
          }

          // Tags - Keywords
          var kws = filterFilter(fullJsonItems[i].tags, {scheme: "http://www.sciencebase.gov/vocab/category/" + $scope.vocabName + "/Keyword", type: "Keyword"});
          for (var kw in kws) {
            if (flatProject["Keywords"] === "") flatProject["Keywords"] = kws[kw].name;
            else flatProject["Keywords"] += ", " + kws[kw].name;
          }

          // Tags - Location
          var locs = filterFilter(fullJsonItems[i].tags, {scheme: "http://www.sciencebase.gov/vocab/category/" + $scope.vocabName + "/Location", type: "Location"});
          for (var loc in locs) {
            if (flatProject["Locations"] === "") flatProject["Locations"] = locs[loc].name;
            else flatProject["Locations"] += ", " + locs[loc].name;
          }

          // Tags - Project Type
          var types = filterFilter(fullJsonItems[i].tags, {scheme: "http://www.sciencebase.gov/vocab/category/" + $scope.vocabName + "/Project/ProjectType", type: "Label"});
          for (var type in types) {
            if (flatProject["Project Type"] === "") flatProject["Project Type"] = types[type].name;
            else flatProject["Project Type"] += ", " + types[type].name;
          }

          // Weblinks
          for (var weblink in fullJsonItems[i].webLinks) {
            if (flatProject["Webpage"] === "") flatProject["Webpage"] = fullJsonItems[i].webLinks[weblink].uri;
            else flatProject["Webpage"] += ", " + fullJsonItems[i].webLinks[weblink].uri;
          }

          // Contacts - PI
          var pis = filterFilter(fullJsonItems[i].contacts, {type: "Principal Investigator"});
          for (var pi in pis) {
            if (flatProject["Lead Pi"] === "") {
              flatProject["Lead Pi"] = pis[pi].name;
              flatProject["Email"] = pis[pi].email;
              if (pis[pi].organization && pis[pi].organization.displayText) {
                flatProject["Organization"] = pis[pi].organization.displayText;
              }
            } else {
              // if (flatProject["Cooperators"] === "") flatProject["Cooperators"] = pis[pi].name;
              // else flatProject["Cooperators"] += ", " + pis[pi].name;
              flatProject["Lead Pi"] += ", " + pis[pi].name;
            }
          }

          // Contacts - Cooperators
          var cos = filterFilter(fullJsonItems[i].contacts, {type: "Cooperator/Partner"});
          for (var co in cos) {
            if (flatProject["Cooperators"] === "") flatProject["Cooperators"] = cos[co].name;
            else flatProject["Cooperators"] += ", " + cos[co].name;
          }

          // Dates
          var startDate = filterFilter(fullJsonItems[i].dates, {type: "Start"});
          if (startDate && startDate.length > 0) {
            flatProject["Start Date"] = startDate[0].dateString;
          }
          var endDate = filterFilter(fullJsonItems[i].dates, {type: "End"});
          if (endDate && endDate.length > 0) {
            flatProject["End Date"] = endDate[0].dateString;
          }

          // Facets - Project
          var projIdx = findIndexByKeyValue(fullJsonItems[i].facets, "className", "ProjectFacet");
          if (projIdx >= 0) {
            var projFacet = fullJsonItems[i].facets[projIdx];
            flatProject["Summary of Results"] = projFacet.summaryOfResults;
            flatProject["Project Objectives"] = projFacet.objectives;
            flatProject["Project Status"] = projFacet.projectStatus;

            for (i in projFacet.projectProducts) {
              var product = projFacet.projectProducts[i];
              if (product.status === "Expected") {
                if (flatProject["Expected Products"] === "") flatProject["Expected Products"] = product.productDescription;
                else flatProject["Expected Products"] += ", " + product.productDescription;
              }
              else if (product.status === "Delivered") {
                if (flatProject["Delivered Products"] === "") flatProject["Delivered Products"] = product.productDescription;
                else flatProject["Delivered Products"] += ", " + product.productDescription;
              }
            }

            for (i in projFacet.funding) {
              flatProject["FY" + projFacet.funding[i].fiscalYear + " Funding"] = projFacet.funding[i].fundingAmount;
            }

          }

          flatProjects.push(flatProject);
        }
        if (flatProjects) {
          $scope.csv = agnes.jsonToCsv(flatProjects);
        }

        var csvContent;

        var is_chrome = navigator.userAgent.toLowerCase().indexOf('chrome') > -1;
        if (is_chrome) {
          csvContent = 'data:text/csv;charset=utf-8,' + $scope.csv;
          
        } else {
          csvContent = 'data:text/csv;charset=utf-8;base64,' + window.btoa(encodeURI($scope.csv));
        }

        var encodedUri = encodeURI(csvContent);
        var link = document.getElementById("download");
        link.setAttribute("href", encodedUri);
        link.setAttribute("download", "projectsOutput.csv");

        link.click();
        // link.setAttribute("style", "display: inline-block;");

      });

    
  };

  /*
  * getJsonArray: parses an array of strings that are json into an array of json objects
  * @arrayOfString an array of strings that are json
  * @returns an array of json objects
  */
  $scope.parseJsonArray = function(arrayOfStrings) {
    if (!arrayOfStrings) {
      return "";
    }
    var jsons = [];
    angular.forEach(arrayOfStrings, function(str) {
      jsons.push(JSON.parse(str));
    });
    return jsons;
  };

}

function ContactsCtrl($scope, filterFilter) {
  $scope.isFundingAgency = function(contact) {
    return (contact.type === "Funding Agency");
  };

  $scope.isPrincipalInvestigator = function(contact) {
    return (contact.type === "Principal Investigator");
  };

  $scope.isCooperator = function(contact) {
    return (contact.type === "Cooperator/Partner" || contact.type === "Co-Investigator");
  };

  $scope.fundingAgencies = function() {
    return filterFilter($scope.json.contacts, {type: "Funding Agency"}).length;
  };

  $scope.principalInvestigators = function() {
    return filterFilter($scope.json.contacts, {type: "Principal Investigator"}).length;
  };

  $scope.cooperators = function() {
    return filterFilter($scope.json.contacts, {type: "Cooperator/Partner"}).length;
  };

  $scope.sum = function() {
    if($scope.json.contacts.length === 0){
      $scope.json.contacts.push({type: "", name: ""});
    }
    else if($scope.json.contacts[$scope.json.contacts.length-1].type ||
            $scope.json.contacts[$scope.json.contacts.length-1].name) {
      $scope.json.contacts.push({type: "", name: ""});
    }
    return $scope.json.contacts.length - 1;
  };

}

function TagsCtrl($scope, State) {
  $scope.currentSet = State.shared.currentSet;
  $scope.vocabName = $scope.currentSet.vocabName;
  $scope.sum = function() {
    if($scope.json.tags.length === 0){
      $scope.json.tags.push({type: "", name: "", scheme: ""});
    }
    else if($scope.json.tags[$scope.json.tags.length-1].name ||
            $scope.json.tags[$scope.json.tags.length-1].type ||
            $scope.json.tags[$scope.json.tags.length-1].scheme) {
      $scope.json.tags.push({type: "", name: "", scheme: ""});
    }
    return $scope.json.tags.length - 1;
  };

  $scope.isFiscalYear = function(tag) {
    var pattern = new RegExp("http://www.sciencebase.gov/vocab/category/.*/Project/FiscalYear");
    return pattern.test(tag.scheme);
  };

  $scope.isKeyword = function(tag) {
    var pattern = new RegExp("http://www.sciencebase.gov/vocab/category/.*/Keyword");
    return pattern.test(tag.scheme);
  };

  $scope.isLocation = function(tag) {
    var pattern = new RegExp("http://www.sciencebase.gov/vocab/category/.*/Location");
    return pattern.test(tag.scheme);
  };

  $scope.isOrganizationType = function(tag) {
    var pattern = new RegExp("http://www.sciencebase.gov/vocab/category/.*/Project/OrganizationType");
    return pattern.test(tag.scheme);
  };

  $scope.isOrganizationName = function(tag) {
    var pattern = new RegExp("http://www.sciencebase.gov/vocab/category/.*/Project/OrganizationName");
    return pattern.test(tag.scheme);
  };

  $scope.isProjectType = function(tag) {
    var pattern = new RegExp("http://www.sciencebase.gov/vocab/category/.*/Project/ProjectType");
    return pattern.test(tag.scheme);
  };

}

function WeblinksCtrl($scope) {

  $scope.sum = function() {
    if($scope.json.webLinks.length === 0){
      $scope.json.webLinks.push({type: "webLink", typeLabel: "Web Link"});
    }
    else if($scope.json.webLinks[$scope.json.webLinks.length-1].uri ||
            $scope.json.webLinks[$scope.json.webLinks.length-1].title) {
      $scope.json.webLinks.push({type: "webLink", typeLabel: "Web Link"});
    }
    return $scope.json.webLinks.length - 1;
  };

}

function DatesCtrl($scope) {
  $scope.sum = function() {
    var length = $scope.json.dates.length;
    if(length === 0){
      $scope.json.dates.push({type: "", dateString: "", label: ""});
    }
    else if($scope.json.dates[length-1].type ||
            $scope.json.dates[length-1].dateString || 
            $scope.json.dates[length-1].label) {
      $scope.json.dates.push({type: "", dateString: "", label: ""});
    }
    return $scope.json.dates.length - 1;
  }
}

function FacetsCtrl($scope, filterFilter) {


  $scope.isProject = function(facet) {
    return (facet.className === "gov.sciencebase.catalog.item.facet.ProjectFacet");
  }

  $scope.isExpando = function(facet) {
    return (facet.className === "gov.sciencebase.catalog.item.facet.ExpandoFacet");
  }

  $scope.isExpectedProduct = function(product) {
    return (product.status === "Expected");
  }

  $scope.isDeliveredProduct = function(product) {
    return (product.status === "Delivered");
  }

  $scope.addCurAgenda = function(agenda) {
    var newAgenda = {};
    newAgenda.name = agenda.name;
    newAgenda.description = agenda.description;
    newAgenda.url = agenda.url;
    newAgenda.themes = [];

    for (var i in agenda.themes) {
      newAgenda.themes[i] = {};
      newAgenda.themes[i].number = agenda.themes[i].number;
      newAgenda.themes[i].name = agenda.themes[i].name;
      var options = {};
      for ( var key in agenda.themes[i].options ) {
        options[key] = false;
      }
      newAgenda.themes[newAgenda.themes.length-1].options = options;
    }
    var expandoIdx = findIndexByKeyValue($scope.json.facets, "className", "gov.sciencebase.catalog.item.facet.ExpandoFacet");
    $scope.json.facets[expandoIdx].object.agendas.push(newAgenda);
  };

  $scope.addAgenda = function() {
    if (!$scope.newAgenda || !$scope.newAgenda.name) {
      console.log("Please choose an agenda");
      return;
    }
    var expandoIdx = findIndexByKeyValue($scope.json.facets, "className", "gov.sciencebase.catalog.item.facet.ExpandoFacet");
    if (expandoIdx >= 0) {
      if ($scope.json.facets[expandoIdx].object && $scope.json.facets[expandoIdx].object.agendas) {
        if (findIndexByKeyValue($scope.json.facets[expandoIdx].object.agendas, "name", $scope.newAgenda.name) >= 0) {
          $scope.alerts.push({msg: "You have already added that agenda to this item.", type: "warn"});
          return;
        } 
        else {
          $scope.addCurAgenda($scope.newAgenda);
        }
      } 
      else {
        console.log("The expando facet is not being set up correctly. Expando: {{$scope.json.facets[expandoIdx]}}");
        return;
      }
    }
    else {
      console.log("Expando facet not found.");
      return;
    }

  };

  $scope.deleteAgenda = function() {
    var expandoIdx = findIndexByKeyValue($scope.json.facets, "className", "gov.sciencebase.catalog.item.facet.ExpandoFacet");
    $scope.json.facets[expandoIdx].object.agendas.splice($scope.json.facets[expandoIdx].object.agendas.indexOf(this.agenda), 1);
  };

  $scope.getAgenda = function() {
    return $scope.getAgendaByName(this.agenda.name);
  };

  $scope.getAgendaByName = function(name) {
    return $scope.agendas[findIndexByKeyValue($scope.agendas, "name", name)];
  };

  $scope.toggleQuestion = function(question, set) {
    for (var i in question.options) {
      question.options[i] = !set;
    }
  }

  $scope.toggleAgenda = function(agenda, type) {
    for (var t in agenda.themes) {
      for (var o in agenda.themes[t].options) {
        agenda.themes[t].options[o] = type;
      }
    }
  }

}

var findIndexByKeyValue = function (list, key, value) {
  if (list) {
    for (var i = 0; i < list.length; i++) {
      if (list[i][key] && value && list[i][key].toLowerCase() === value.toLowerCase()) {
        return i;
      }
    }
  }
  return -1;
};

