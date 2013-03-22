var Depth = angular.module('depth', ['ngResource', 'ui']);

Depth.config(function($routeProvider) {
    $routeProvider.
      when('/migrate', {controller:DepthCtrl, templateUrl:'migrate.html'}).
      when('/edit', {controller:DepthCtrl, templateUrl:'editProject.html'}).
      when('/sbFields', {controller:DepthCtrl, templateUrl:'editSB.html'}).
      when('/view', {controller:DepthCtrl, templateUrl:'viewProjects.html'}); //.
      // otherwise({redirectTo:'/'});
  });

Depth.value('ui.config', {
});

function DepthCtrl($scope, filterFilter, $http, $location, $filter) {
  // $scope.alerts = [{msg: "WARNING: DEPTH is currently pointed at SB Production. Any changes you make will be PERMANENT!", type: "warning"}];
  $scope.alerts = [];
  $scope.devAlerts = [];

  $scope.closeAlert = function(index) {
    $scope.alerts.splice(index, 1);
  };

  $scope.testLoc = function() {
    $location.search({id: "test"});
    $location.path("/edit");
  };

  $scope.urlSearch = $location.search();

  $scope.isActiveRoute = function(route) {
   return '/' + route === $location.path();
  };

  $scope.setRoute = function(route) {
    $location.path(route);
  };

  $scope.sciencebaseUrl = "https://my-beta.usgs.gov/catalog";
  $scope.josso = checkCookie();
  $scope.josso_check = {};
  $http.get("/depth/josso-auth/json-josso.php").
    success(function(data, status) {
      $scope.josso_check = data;
    }).error(function (data, status, headers, config) {
      $scope.alerts.push({msg: "DEPTH error: Security Check Failed.", type: "error"})
      $scope.devAlerts.push({msg: "failed josso_check\nstatus: " + status + "\ndata: " + data + "\nheaders: " + headers + "\nconfig: " + config, type: "error"});
    });

  $scope.recheckJosso = function() {
    $scope.josso_check = {};
    $http.get("/depth/josso-auth/json-josso.php").
      success(function(data, status) {
        $scope.josso_check = data;
      }).error(function (data, status, headers, config) {
        // alert("failed josso_check\nstatus: " + status + "\ndata: " + data + "\nheaders: " + headers + "\nconfig: " + config);
        $scope.josso_check = {};
      });
  };

  $scope.schema = {};
  $http.get($scope.sciencebaseUrl + "/item/4f4e476ae4b07f02db47e13b?format=json&fields=facets").
    success(function(data, status) {
      $scope.schema = filterFilter(data.facets, {className: "gov.sciencebase.catalog.item.facet.ExpandoFacet"})[0].object.schema;
    }).error(function (data, status, headers, config) {
      $scope.alerts.push({msg: "DEPTH error: failed to load necessary data.", type: "error"});
      $scope.devAlerts.push({msg: "failed to get schema\nstatus: " + status + "\ndata: " + data + "\nheaders: " + headers + "\nconfig: " + config, type: "error"});
    });

  $scope.json = {};
  $scope.json.id = "";
  $scope.json.parentId = "";
  $scope.json.contacts = [];
  $scope.json.alternateTitles = [];
  $scope.json.facets = [];
  $scope.json.identifiers = [];
  $scope.json.tags = [];
  $scope.json.dates = [];
  $scope.json.webLinks = [{}];

  $scope.orgTypes = [
    {title: "National Climate Change and Wildlife Science Center", org: "CSC", id: "4f4e476ae4b07f02db47e13b"}, 
    {title: "Landscape Conservation Management and Analysis Portal", org: "LCC", id:"4f4e476ee4b07f02db47e164"}, 
    {title: "Other Project Community", org: "Other", id: "511ac38ee4b084e2824d6a26"}];
  $scope.fiscalYears = [{fy: "2008"}, {fy: "2009"}, {fy: "2010"}, {fy: "2011"}, {fy: "2012"}, {fy: "2013"}];
  $scope.projectTypes = [{type: "Science Project"}, {type: "Science Support Project"}, {type: "Other"}];

  $scope.filter = {orgTypes: null, organizations: null, fiscalYears: null, projectTypes: null, pis: null, keywords: null, projStatuses: null, projects: null};

  $scope.projectStatuses = ["Active", "Approved", "Completed", "Funded", "In Progress", "Proposed"];

  $scope.allProjects = [];
  $http.get($scope.sciencebaseUrl + "/items?q=&filter=tags={scheme:'http://www.sciencebase.gov/vocab/category/NCCWSC/Project/Project%2520Type',type:'Label'}&format=json&fields=tags,title,facets,contacts&max=1000&josso=" + $scope.josso).
    success(function(data, status) {
      $scope.allProjects = data.items;
    }).error(function (data, status, headers, config) {
      $scope.alerts.push({msg: "DEPTH error: failed to load necessary data.", type: "error"});
      $scope.devAlerts.push({msg: "failed to get projects\nstatus: " + status + "\ndata: " + data + "\nheaders: " + headers + "\nconfig: " + config, type: "error"});
    });

  $scope.organizations = [];
  $http.get($scope.sciencebaseUrl + "/items?q=&filter=tags={scheme:'http://www.sciencebase.gov/vocab/category/NCCWSC/OrgLabel',type:'Label',name:'CSC'}&filter=tags={scheme:'http://www.sciencebase.gov/vocab/category/NCCWSC/OrgLabel',type:'Label',name:'Other'}&filter=tags={scheme:'http://www.sciencebase.gov/vocab/category/NCCWSC/OrgLabel',type:'Label',name:'LCC'}&conjunction=tags=OR&format=json&fields=tags,title&max=1000&josso=" + $scope.josso).
    success(function(data, status) {
      $scope.organizations = data.items;
    }).error(function (data, status, headers, config) {
      $scope.alerts.push({msg: "DEPTH error: failed to load necessary data.", type: "error"});
      $scope.devAlerts.push({msg: "failed to get orgs\nstatus: " + status + "\ndata: " + data + "\nheaders: " + headers + "\nconfig: " + config, type: "error"});
    });

  $scope.refresh = function() {
    $http.get($scope.sciencebaseUrl + "/items?q=&filter=tags={scheme:'http://www.sciencebase.gov/vocab/category/NCCWSC/Project/Project%2520Type',type:'Label'}&format=json&fields=tags,title,facets&max=1000&josso=" + $scope.josso).
      success(function(data, status) {
        $scope.allProjects = data.items;
        // set project
        $scope.project = filterFilter($scope.allProjects, {id: $scope.json.id})[0];
      }).error(function (data, status, headers, config) {
        $scope.alerts.push({msg: "DEPTH error: failed to load necessary data.", type: "error"});
        $scope.devAlerts.push({msg: "failed to get orgs\nstatus: " + status + "\ndata: " + data + "\nheaders: " + headers + "\nconfig: " + config, type: "error"});
      });

    var hasTags = $scope.json && $scope.json.tags;
    $http.get($scope.sciencebaseUrl + "/items?q=&filter=tags={scheme:'http://www.sciencebase.gov/vocab/category/NCCWSC/OrgLabel',type:'Label',name:'CSC'}&filter=tags={scheme:'http://www.sciencebase.gov/vocab/category/NCCWSC/OrgLabel',type:'Label',name:'Other'}&conjunction=tags=OR&format=json&fields=tags,title&max=1000&josso=" + $scope.josso).
      success(function(data, status) {
        $scope.organizations = data.items;
        // set organization
        if (hasTags && filterFilter($scope.json.tags, {scheme: "http://www.sciencebase.gov/vocab/category/NCCWSC/Project/Organization%20Name", type: "Label"})[0]) {
          $scope.organization = organization.name;
        }
      }).error(function (data, status, headers, config) {
        $scope.alerts.push({msg: "DEPTH error: failed to load necessary data.", type: "error"});
        $scope.devAlerts.push({msg: "failed to get orgs\nstatus: " + status + "\ndata: " + data + "\nheaders: " + headers + "\nconfig: " + config, type: "error"});
      });

  };

  $scope.persistMigrate = function() {
    if (!$scope.migrateProj) {
      $scope.migrateProj = {};
    }
    // Facets
    var projs = filterFilter($scope.migrateProj.facets, {className: "ProjectFacet"});
    var projsLongName = filterFilter($scope.migrateProj.facets, {className: "gov.sciencebase.catalog.item.facet.ProjectFacet"});
    var projsIdx = findIndexByKeyValue($scope.migrateProj.facets, "className", "ProjectFacet");
    if (projs && (!projsLongName || projsLongName.length === 0)) {
      $scope.migrateProj.facets[projsIdx].className = "gov.sciencebase.catalog.item.facet.ProjectFacet";
    } 

    var expandoIdx = findIndexByKeyValue($scope.migrateProj.facets, "className", "ExpandoFacet");
    var expandoLongIdx = findIndexByKeyValue($scope.migrateProj.facets, "className", "gov.sciencebase.catalog.item.facet.ExpandoFacet");
    if (expandoIdx > -1 && !expandoLongIdx > -1) {
      $scope.migrateProj.facets[expandoIdx].className = "gov.sciencebase.catalog.item.facet.ExpandoFacet";
    }

    var projIdx = findIndexByKeyValue($scope.migrateProj.facets, "className", "gov.sciencebase.catalog.item.facet.ProjectFacet");
    if(projIdx >= 0){
      if(!$scope.migrateProj.facets[projIdx].funding){
        $scope.migrateProj.facets[projIdx].funding = [];
      }

      var funds = $scope.migrateProj.facets[projIdx].funding;
      if(funds.length === 0 || funds[funds.length-1].fiscalYear || funds[funds.length-1].fundingAmount) {
        $scope.migrateProj.facets[projIdx].funding.push({fiscalYear: null, fundingAmount: null});
      }

    }

  };

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
    if (!$scope.json.webLinks) $scope.json.webLinks = [{}];

    // Contacts
    $scope.persistContacts(["Principal Investigator", "Funding Agency", "Cooperator/Partner"]);

    var coops = filterFilter($scope.json.contacts, {type: "Cooperator/Partner"});
    if(coops[coops.length-1].name){
      $scope.json.contacts.push({type: "Cooperator/Partner"});
    }

    // Tags
    $scope.persistTags([
      {scheme: "http://www.sciencebase.gov/vocab/category/NCCWSC/Project/Fiscal%20Year", type: "Label"}, 
      {scheme: "http://www.sciencebase.gov/vocab/category/NCCWSC/Project/Organization%20Type", type: "Label"}, 
      {scheme: "http://www.sciencebase.gov/vocab/category/NCCWSC/Project/Organization%20Name", type: "Label"}, 
      {scheme: "http://www.sciencebase.gov/vocab/category/NCCWSC/Project/Project%20Type", type: "Label"}, 
      {scheme: "http://www.sciencebase.gov/vocab/category/NCCWSC/Keyword", type: "Keyword"}, 
      {scheme: "http://www.sciencebase.gov/vocab/category/NCCWSC/Location", type: "Location"}]);

    var kws = filterFilter($scope.json.tags, {scheme: "http://www.sciencebase.gov/vocab/category/NCCWSC/Keyword", type: "Keyword"});
    if(kws.length > 0 && kws[kws.length-1].name) {
      $scope.json.tags.push({scheme: "http://www.sciencebase.gov/vocab/category/NCCWSC/Keyword", type: "Keyword"});
    }

    var locs = filterFilter($scope.json.tags, {scheme: "http://www.sciencebase.gov/vocab/category/NCCWSC/Location", type: "Location"});
    if(locs.length > 0 && locs[locs.length-1].name) {
      $scope.json.tags.push({scheme: "http://www.sciencebase.gov/vocab/category/NCCWSC/Location", type: "Location"});
    }

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
      if (!$scope.json.facets[expandoIdx].object.themes) {
        $scope.json.facets[expandoIdx].object.themes = {};
      }
      for (var concept in $scope.schema) {
        if (!$scope.json.facets[expandoIdx].object.themes[concept]) {
          $scope.json.facets[expandoIdx].object.themes[concept] = {};
        }
        for (var theme in $scope.schema[concept]) {
          if (!$scope.json.facets[expandoIdx].object.themes[concept][theme]) {
            $scope.json.facets[expandoIdx].object.themes[concept][theme] = false;
          }
        }
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
    $scope.json.tags.push({scheme:"http://www.sciencebase.gov/vocab/category/NCCWSC/OrgLabel", type: type});
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

  // $scope.prodToBeta = function() {
  //   for (var i = 0; i < $scope.allProjects.length; i++) {

  //     var prodItem = getItemProd($scope.allProjects[i].id, );

  //     try
  //     {
  //       $scope.json = prodItem;
  //       $scope.persistNecessaryData();
  //     }
  //     catch(exception)
  //     {
  //       $scope.alerts.push({msg: exception, type: "error"});
  //     }
  //     $scope.put();
  //   }

  // };

  $scope.get = function () {
    console.log('anything');

    if (!$scope.id) {
      $scope.alerts.push({msg: "Please choose a project.", type: "error"});
      return false;
    }

    var json = getItem($scope.id, $scope.sciencebaseUrl);
    show("edit-fields", false);

    try
    {
      $scope.json = json;
      
      $scope.refresh();

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

    var json = getItem(String($scope.id), $scope.sciencebaseUrl);

    //remove things that we don't want to clone, parentId and id
    delete json.parentId;
    delete json.id;

    // Change the appropriate fields
    json.title = title;

    // convert to JSON with angular to remove some crap
    // json = angular.toJson(json);

    var returnedJson = upsert('POST', parentId, json, $scope.sciencebaseUrl);

    try
    {
      $scope.json = returnedJson;

      $scope.refresh();
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
    json.tags = [{scheme: "http://www.sciencebase.gov/vocab/category/NCCWSC/OrgLabel", type:"Label", name: $scope.newOrg.parent.org}];
    json.body = $scope.newOrg.body;
    json.contacts = [{name: $scope.newOrg.contact.name, email: $scope.newOrg.contact.email}];


    var returnedJson = upsert('POST', json.parentId, json, $scope.sciencebaseUrl);

    // show("edit-fields", false);

    try
    {
      $scope.json = returnedJson;
      $scope.refresh();
    }
    catch(exception)
    {
      $scope.alerts.push({msg: exception, type: "error"});
    } 
    // show("create-org", true);
    // show("sort-fields", true); 
    if (!returnedJson.id) {
      $scope.alerts.push({msg: "An error occurred, please make sure you are logged in and have appropriate permissions.", type: "error"});
      return false;
    }
    $scope.alerts.push({msg: "Successfully created Organization " + returnedJson.id + ".", type: "success"});
  };

  $scope.create = function() {
    $scope.json = {};
    show("edit-fields", false);
    show("sort-fields", true); 

    // $scope.json.id = "";
    // $scope.json.title = "";
  };

  $scope.migrate = function() {
    var projIdx = findIndexByKeyValue($scope.migrateProj.facets, "className", "gov.sciencebase.catalog.item.facet.ProjectFacet");
    if (projIdx > -1) {
      delete $scope.migrateProj.facets[projIdx].parts;
    }

    $scope.json = $scope.migrateProj;
    $scope.put();

    // $scope.alerts.push({msg: $scope.migrateProj.facets, type: "success"});
  }

  $scope.post = function() {
    var json = $scope.json;
    json = $scope.prepareJson(json);
    var org = filterFilter($scope.json.tags, {scheme: "http://www.sciencebase.gov/vocab/category/NCCWSC/Project/Organization%20Name", type: "Label"})[0].name;
    var orgId = filterFilter($scope.organizations, {title: org})[0].id;
    if (!org || !orgId) {
      $scope.alerts.push({msg: "Organization required create new items org = " + org + " orgId = " + orgId, type: "error"});
      return false;
    }
    if(!json.title) {
      $scope.alerts.push({msg: "Title required to create new items", type: "error"});
      return false;
    }
    delete json.id;
    json.parentId = orgId;
    var returnedJson = upsert('POST', orgId, json, $scope.sciencebaseUrl);

    try
    {
      $scope.json = returnedJson;

      $scope.refresh();
    }
    catch(exception)
    {
      $scope.alerts.push({msg: exception, type: "error"});
    }

    $scope.alerts.push({msg: "Successfully saved item " + returnedJson.id + ".", type: "success"});
  };

  $scope.put = function() {
    if (!$scope.json.id) return $scope.post();

    var json = $scope.json;
    json = $scope.prepareJson(json);
    //delete the parent id so we don't move the item.
    //TODO: have a checkbox if they want to move to the parentId
    delete json.parentId;
    var returnedJson = upsert('PUT', $scope.json.id, json, $scope.sciencebaseUrl);

    try
    {
      $scope.json = returnedJson;

      $scope.refresh();
    }
    catch(exception)
    {
      $scope.alerts.push({msg: exception, type: "error"});
    }

    if (!returnedJson.id) {
      $scope.alerts.push({msg: "There was an error saving your item.", type: "error"});
    } 
    else {
      $scope.alerts.push({msg: "Successfully saved item " + returnedJson.id + ".", type: "success"});
    }

  };

  $scope.clone = function() {

  };

  $scope.prepareJson = function(json) {
    json = jQuery.extend(true, {}, json);
    // Remove any contacts without a name
    json.contacts = filterFilter(json.contacts, $scope.filterBlankContacts);
    json.webLinks = filterFilter(json.webLinks, $scope.filterBlankWeblinks);
    json.tags = filterFilter(json.tags, $scope.filterBlankTags);

    var projIdx = findIndexByKeyValue(json.facets, "className", "gov.sciencebase.catalog.item.facet.ProjectFacet");
    json.facets[projIdx].projectProducts = filterFilter(json.facets[projIdx].projectProducts, $scope.filterBlankProjects);
    json.facets[projIdx].funding = filterFilter(json.facets[projIdx].funding, $scope.filterBlankFunds);

    var expandoIdx = findIndexByKeyValue(json.facets, "className", "gov.sciencebase.catalog.item.facet.ExpandoFacet");
    if (expandoIdx >= 0) {
      for (var concept in json.facets[expandoIdx].object.themes) {
        delete json.facets[expandoIdx].object.themes[concept]["$$hashKey"];
      }
    }

    // json.dates.pop();
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

  $scope.filterProjects = function(project) {
    if ($scope.orgType && 
        $scope.orgType.org && 
        $scope.orgType.org !== "" && 
        filterFilter(project.tags, {scheme: "http://www.sciencebase.gov/vocab/category/NCCWSC/Project/Organization%20Type", type: "Label", name: $scope.orgType.org}).length === 0) {
      return false;
    }

    var fyTag = {scheme: "http://www.sciencebase.gov/vocab/category/NCCWSC/Project/Fiscal%20Year", type: "Label", name: $scope.fiscalYear};
    if ($scope.fiscalYear && $scope.fiscalYear !== "" && filterFilter(project.tags, fyTag).length === 0) {
      return false;
    }

    var projTypeTag = {scheme: "http://www.sciencebase.gov/vocab/category/NCCWSC/Project/Project%20Type", type: "Label", name: $scope.projectType};
    if ($scope.projectType && $scope.projectType !== "" && filterFilter(project.tags, projTypeTag).length === 0) {
      return false;
    }

    if ($scope.organization &&
        $scope.organization.title && 
        $scope.organization.title !== "" && 
        filterFilter(project.tags, {scheme: "http://www.sciencebase.gov/vocab/category/NCCWSC/Project/Organization%20Name", type: "Label", name: $scope.organization.title}).length === 0) {
      return false;
    }

    return true;
  };

  $scope.filterAllProjectsView = function(project) {


  };

  $scope.filterProjectsView = function(project) {

    if ($scope.orgType && $scope.orgType.length > 0) {
      var orgMatch = false;
      for (var i = 0; i < $scope.orgType.length; i++) {
        if ($scope.orgType[i].org &&
            $scope.orgType[i].org !== "" &&
            filterFilter(project.tags, {scheme: "http://www.sciencebase.gov/vocab/category/NCCWSC/Project/Organization%20Type", type: "Label", name: $scope.orgType[i].org}).length > 0) {
          orgMatch = true;
        }
      }
      if (!orgMatch) {
        return false;
      }
    } 
 
    if ($scope.fiscalYear && $scope.fiscalYear.length > 0) {
      var fyMatch = false;
      for (var i = 0; i < $scope.fiscalYear.length; i++) {
        if ($scope.fiscalYear[i] &&
            $scope.fiscalYear[i] !== "" &&
            filterFilter(project.tags, {scheme: "http://www.sciencebase.gov/vocab/category/NCCWSC/Project/Fiscal%20Year", type: "Label", name: $scope.fiscalYear[i]}).length > 0) {
          fyMatch = true;
        }
      }
      if (!fyMatch) {
        return false;
      }
    }

    if ($scope.projectType && $scope.projectType.length > 0) {
      var typeMatch = false;
      for (var i = 0; i < $scope.projectType.length; i++) {
        if ($scope.projectType[i] &&
            $scope.projectType[i] !== "" &&
            filterFilter(project.tags, {scheme: "http://www.sciencebase.gov/vocab/category/NCCWSC/Project/Project%20Type", type: "Label", name: $scope.projectType[i]}).length > 0) {
          typeMatch = true;
        }
      }
      if (!typeMatch) {
        return false;
      }
    }

    if ($scope.organization && $scope.organization.length > 0) {
      var orgMatch = false;
      for (var i = 0; i < $scope.organization.length; i++) {
        if ($scope.organization[i].title &&
            $scope.organization[i].title !== "" &&
            filterFilter(project.tags, {scheme: "http://www.sciencebase.gov/vocab/category/NCCWSC/Project/Organization%20Name", type: "Label", name: $scope.organization[i].title}).length > 0) {
          orgMatch = true;
        }
      }
      if (!orgMatch) {
        return false;
      }
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

  $scope.allPIs = function() {
    var contacts = [];
    var fullContacts = [];
    // var filteredProjects = filterFilter($scope.allProjects, $scope.filterProjectsView);
    var filteredProjects = $scope.allProjects;
    for (var i = 0; i < filteredProjects.length; i++) {
      var pis = filterFilter(filteredProjects[i].contacts, {type: "Principal Investigator"});
      fullContacts = fullContacts.concat(pis);
    }
    for (var i = 0; i < fullContacts.length; i++) {
      if (fullContacts[i]) {
        var idx = findIndexByKeyValue(contacts, "name", fullContacts[i].name);
        // console.log(fullContacts[i]);
        if (idx === -1) contacts.push(fullContacts[i]);
      }
    }
    // contacts = jQuery.unique(contacts);
    return contacts;
  };

  $scope.allKeywords = function() {
    // var filteredProjects = filterFilter($scope.allProjects, $scope.filterProjectsView);
    var filteredProjects = $scope.allProjects;
    var keywords = [];
    for (var i = 0; i < filteredProjects.length; i++) {
      var kws = filterFilter(filteredProjects[i].tags, {scheme: "http://www.sciencebase.gov/vocab/category/NCCWSC/Keyword", type: "Keyword"});
      for (var j = 0; j < kws.length; j++) {
        var idx = findIndexByKeyValue(keywords, "name", kws[j].name);
        if (idx === -1) keywords.push(kws[j]);
      }
    }
    return keywords;
  };

  $scope.prettyPrint = function(json) {
    return JSON.stringify(json, undefined, 2);
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

    var url = "/items?q=&filter=tags={scheme:'http://www.sciencebase.gov/vocab/category/NCCWSC/Project/Project%2520Type',type:'Label'}";
    url += "&format=json&max=1000&josso=" + $scope.josso;
    url += "&fields=id,title,contacts,tags,facets,webLinks,body";
   
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
          flatProject["Affiliation"] = "";
          flatProject["Organization"] = "";
          flatProject["Cooperators"] = "";
          flatProject["Project Type"] = "";
          flatProject["Project Status"] = "";
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

          var fundingAgencies = filterFilter(fullJsonItems[i].tags, {scheme: "http://www.sciencebase.gov/vocab/category/NCCWSC/Project/Organization%20Type", type: "Label"});
          for (fa in fundingAgencies) {
            if (flatProject["Funding Agency"] === "") flatProject["Funding Agency"] = fundingAgencies[fa].name;
            else flatProject["Funding Agency"] += ", " + fundingAgencies[fa].name;
          }

          var affiliations = filterFilter(fullJsonItems[i].tags, {scheme: "http://www.sciencebase.gov/vocab/category/NCCWSC/Project/Organization%20Name", type: "Label"});
          for (affil in affiliations) {
            if (flatProject["Affiliation"] === "") flatProject["Affiliation"] = affiliations[affil].name;
            else flatProject["Affiliation"] += ", " + affiliations[affil].name;
          }

          var fys = filterFilter(fullJsonItems[i].tags, {scheme: "http://www.sciencebase.gov/vocab/category/NCCWSC/Project/Fiscal%20Year", type: "Label"});
          for (fy in fys) {
            if (flatProject["Fiscal Year"] === "") flatProject["Fiscal Year"] = fys[fy].name;
            else flatProject["Fiscal Year"] += ", " + fys[fy].name;
          }

          var kws = filterFilter(fullJsonItems[i].tags, {scheme: "http://www.sciencebase.gov/vocab/category/NCCWSC/Keyword", type: "Keyword"});
          for (kw in kws) {
            if (flatProject["Keywords"] === "") flatProject["Keywords"] = kws[kw].name;
            else flatProject["Keywords"] += ", " + kws[kw].name;
          }

          var locs = filterFilter(fullJsonItems[i].tags, {scheme: "http://www.sciencebase.gov/vocab/category/NCCWSC/Location", type: "Location"});
          for (loc in locs) {
            if (flatProject["Locations"] === "") flatProject["Locations"] = locs[loc].name;
            else flatProject["Locations"] += ", " + locs[loc].name;
          }

          var types = filterFilter(fullJsonItems[i].tags, {scheme: "http://www.sciencebase.gov/vocab/category/NCCWSC/Project/Project%20Type", type: "Label"});
          for (type in types) {
            if (flatProject["Project Type"] === "") flatProject["Project Type"] = types[type].name;
            else flatProject["Project Type"] += ", " + types[type].name;
          }

          for (weblink in fullJsonItems[i].webLinks) {
            if (flatProject["Webpage"] === "") flatProject["Webpage"] = fullJsonItems[i].webLinks[weblink].uri;
            else flatProject["Webpage"] += ", " + fullJsonItems[i].webLinks[weblink].uri;
          }

          var pis = filterFilter(fullJsonItems[i].contacts, {type: "Principal Investigator"});
          for (pi in pis) {
            if (flatProject["Lead Pi"] === "") {
              flatProject["Lead Pi"] = pis[pi].name;
              flatProject["Email"] = pis[pi].email;
              // flatProject["Organization"] = pis[pi].organization.displayText;
              flatProject["Organization"] = pis[pi].personsOrganization;
            } else {
              if (flatProject["Cooperators"] === "") flatProject["Cooperators"] = pis[pi].name;
              else flatProject["Cooperators"] += ", " + pis[pi].name;
            }
          }

          var cos = filterFilter(fullJsonItems[i].contacts, {type: "Cooperator/Partner"});
          for (co in cos) {
            if (flatProject["Cooperators"] === "") flatProject["Cooperators"] = cos[co].name;
            else flatProject["Cooperators"] += ", " + cos[co].name;
          }

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

}

function ContactsCtrl($scope, filterFilter) {
  $scope.isFundingAgency = function(contact) {
    return (contact.type === "Funding Agency");
  };

  $scope.isPrincipalInvestigator = function(contact) {
    return (contact.type == "Principal Investigator");
  };

  $scope.isCooperator = function(contact) {
    return (contact.type == "Cooperator/Partner" || contact.type == "Co-Investigator");
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

function TagsCtrl($scope) {

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
    return (tag.scheme === "http://www.sciencebase.gov/vocab/category/NCCWSC/Project/Fiscal%20Year");
  };

  $scope.isKeyword = function(tag) {
    return (tag.scheme === "http://www.sciencebase.gov/vocab/category/NCCWSC/Keyword");
  };

  $scope.isLocation = function(tag) {
    return (tag.scheme === "http://www.sciencebase.gov/vocab/category/NCCWSC/Location");
  };

  $scope.isOrganizationType = function(tag) {
    return (tag.scheme === "http://www.sciencebase.gov/vocab/category/NCCWSC/Project/Organization%20Type");
  };

  $scope.isOrganizationName = function(tag) {
    return (tag.scheme === "http://www.sciencebase.gov/vocab/category/NCCWSC/Project/Organization%20Name");
  };

  $scope.isProjectType = function(tag) {
    return (tag.scheme === "http://www.sciencebase.gov/vocab/category/NCCWSC/Project/Project%20Type");
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

function FacetsCtrl($scope) {
  $scope.facetType = function(){
    switch ($scope.facet.className) {
      case "gov.sciencebase.catalog.item.facet.ProjectFacet":
        return "Project";
        break;
      default:
        return $scope.facet.className;
        break;
      //TODO: add more facet types here
    }
  };

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

