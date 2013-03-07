var Depth = angular.module('depth', ['ngResource']);

Depth.config(function($routeProvider) {
    $routeProvider.
      when('/', {controller:DepthCtrl, templateUrl:'editProject.html'}).
      when('/sbFields', {controller:DepthCtrl, templateUrl:'editSB.html'}).
      when('/view', {controller:DepthCtrl, templateUrl:'viewProjects.html'}).
      otherwise({redirectTo:'/'});
  });

function DepthCtrl($scope, filterFilter, $http) {
  $scope.sciencebaseUrl = "https://my-beta.usgs.gov/catalog/"
  $scope.josso = checkCookie();
  $scope.josso_check = {};
  $http.get("/depth/josso-auth/json-josso.php").
    success(function(data, status) {
      // $scope.user = data.user;
      // $scope.josso = data.josso;
      $scope.josso_check = data;
    }).error(function (data, status, headers, config) {
      alert("failed josso_check\nstatus: " + status + "\ndata: " + data + "\nheaders: " + headers + "\nconfig: " + config);
    });

  $scope.schema = {};
  $http.get($scope.sciencebaseUrl + "item/5136be49e4b0a47351e401db?format=json&fields=facets").
    success(function(data, status) {
      $scope.schema = filterFilter(data.facets, {className: "gov.sciencebase.catalog.item.facet.ExpandoFacet"})[0].object.schema;
    }).error(function (data, status, headers, config) {
      alert("failed to get schema\nstatus: " + status + "\ndata: " + data + "\nheaders: " + headers + "\nconfig: " + config)
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
    {title: "Other Project Community", org: "Other", id: "51240771e4b00784769a6432"}];
  $scope.fiscalYears = [{fy: "2008"}, {fy: "2009"}, {fy: "2010"}, {fy: "2011"}, {fy: "2012"}, {fy: "2013"}];
  $scope.projectTypes = [{type: "Science Project"}, {type: "Science Support Project"}, {type: "Other"}];

  $scope.orgType = "";
  $scope.fiscalYear = "";
  $scope.projectType = "";
  $scope.project = "";
  $scope.organization = "";

  $scope.projectStatuses = ["Active", "Approved", "Completed", "Funded", "In Progress", "Proposed"];

  $scope.allProjects = [];
  $http.get($scope.sciencebaseUrl + "items?q=&filter=tags={scheme:'Project',type:'Project%20Type'}&format=json&fields=tags,title,facets,contacts&max=1000&josso=" + $scope.josso).
    success(function(data, status) {
      $scope.allProjects = data.items;
    }).error(function (data, status, headers, config) {
      alert("failed to get projects\nstatus: " + status + "\ndata: " + data + "\nheaders: " + headers + "\nconfig: " + config);
    });

  $scope.organizations = [];
  $http.get($scope.sciencebaseUrl + "items?q=&filter=tags={scheme:'Project',type:'Label',name:'CSC'}&filter=tags={scheme:'Project',type:'Label',name:'Other'}&conjunction=tags=OR&format=json&fields=tags,title&max=1000&josso=" + $scope.josso).
    success(function(data, status) {
      $scope.organizations = data.items;
    }).error(function (data, status, headers, config) {
      alert("failed to get orgs\nstatus: " + status + "\ndata: " + data + "\nheaders: " + headers + "\nconfig: " + config);
    });

  $scope.refresh = function() {
    $http.get($scope.sciencebaseUrl + "items?q=&filter=tags={scheme:'Project',type:'Project%20Type'}&format=json&fields=tags,title,facets&max=1000&josso=" + $scope.josso).
      success(function(data, status) {
        $scope.allProjects = data.items;
        // set project
        $scope.project = filterFilter($scope.allProjects, {id: $scope.json.id})[0];
      });

    var hasTags = $scope.json && $scope.json.tags;
    $http.get($scope.sciencebaseUrl + "items?q=&filter=tags={scheme:'Project',type:'Label',name:'CSC'}&filter=tags={scheme:'Project',type:'Label',name:'Other'}&conjunction=tags=OR&format=json&fields=tags,title&max=1000&josso=" + $scope.josso).
      success(function(data, status) {
        $scope.organizations = data.items;
        // set organization
        if (hasTags && filterFilter($scope.json.tags, {scheme: "Project", type: "Organization Name"})[0]) {
          $scope.organization = organization.name;
        }
      });

    // set org type
    if (hasTags && filterFilter($scope.json.tags, {scheme: "Project", type: "Organization Type"})[0]) {
      $scope.orgType.org = orgType.name;
    }
    
    // set fiscal year
    if (hasTags && filterFilter($scope.json.tags, {scheme: "Project", type: "Fiscal Year"})[0]) {
      $scope.fiscalYear = fiscalYear.name;
    }
    // set project type
    if (hasTags && filterFilter($scope.json.tags, {scheme: "Project", type: "Project Type"})[0]) {
      $scope.projectType = projectType.name;
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
    $scope.persistTags(["Fiscal Year", "Organization Type", "Organization Name", "Project Type", "Keyword", "Location"]);

    // if(filterFilter($scope.json.tags, {scheme: "Project", type: "Organization Type"}).length < 
    //    filterFilter($scope.json.contacts, {type: "Principal Investigator"}).length) {
    //   $scope.json.tags.push({scheme: "Project", type: "Organization Type"});
    // }

    var kws = filterFilter($scope.json.tags, {scheme: "Project", type: "Keyword"});
    if(kws[kws.length-1].name) {
      $scope.json.tags.push({scheme: "Project", type: "Keyword"});
    }

    var locs = filterFilter($scope.json.tags, {scheme: "Project", type: "Location"});
    if(locs[locs.length-1].name) {
      $scope.json.tags.push({scheme: "Project", type: "Location"});
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

    // var projIdx = $scope.indexOfProject;
    var projIdx = $scope.findIndexByKeyValue($scope.json.facets, "className", "gov.sciencebase.catalog.item.facet.ProjectFacet");
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

    var expandoIdx = $scope.findIndexByKeyValue($scope.json.facets, "className", "gov.sciencebase.catalog.item.facet.ExpandoFacet");
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
      if (filterFilter($scope.json.tags, {scheme: "Project", type: tagTypes[i]}).length === 0) {
        $scope.json.tags.push({scheme: "Project", type: tagTypes[i]});
      }
    }
  };

  //Need to figure out how to make this persistant
  $scope.indexOfProject = function() {
    return $scope.findIndexByKeyValue($scope.json.facets, "className", "gov.sciencebase.catalog.item.facet.ProjectFacet");
  };

  $scope.findIndexByKeyValue = function (list, key, value) {
    if (list) {
      for (var i = 0; i < list.length; i++) {
        if (list[i][key].toLowerCase() === value.toLowerCase()) {
          return i;
        }
      }
    }
    return -1;
  };

  //Adds on arrays - these are unnecessary now
  $scope.addContact = function() {
    $scope.json.contacts.push({type:$scope.contact.type, name:$scope.contact.name, personsOrganization:$scope.contact.personsOrganization});
    $scope.contact.type = '';
    $scope.contact.name = '';
    $scope.contact.personsOrganization = '';
    $scope.contact.type.focus();
  };

  $scope.addBlankContact = function(type) {
    $scope.json.contacts.push({type: type});
    // if(type === "Principal Investigator") {
      // $scope.json.tags.push({scheme: "Project", type: "Organization Type"});
    // }
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
    $scope.json.tags.push({scheme:"Project", type: type});
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
    var projIdx = $scope.findIndexByKeyValue($scope.json.facets, "className", "gov.sciencebase.catalog.item.facet.ProjectFacet");
    $scope.json.facets[projIdx].projectProducts.splice($scope.json.facets[projIdx].projectProducts.indexOf(this.product), 1);
  };

  $scope.deleteFund = function() {
    var projIdx = $scope.findIndexByKeyValue($scope.json.facets, "className", "gov.sciencebase.catalog.item.facet.ProjectFacet");
    $scope.json.facets[projIdx].funding.splice($scope.json.facets[projIdx].funding.indexOf(this.fund), 1);
  }

  $scope.prodToBeta = function() {
    for (var i = 0; i < $scope.allProjects.length; i++) {

      var prodItem = getItemProd($scope.allProjects[i].id);

      try
      {
        $scope.json = prodItem;
        $scope.persistNecessaryData();
      }
      catch(exception)
      {
        alert(exception);
      }
      $scope.put();
    }

  };

  $scope.get = function() {

    if (!$scope.id) {
      alert("Please choose a project.");
      return false;
    }

    var json = getItem($scope.id);
    show("edit-fields", false);

    try
    {
      $scope.json = json;
      
      $scope.refresh();

      //clean body
    }
    catch(exception)
    {
      alert(exception);
    }
    show("sort-fields", true); 
  };

  $scope.copy = function() {
    show("copy-fields", true); 
  };

  $scope.createOrg = function() {
    show("create-org", true);
  }

  $scope.createCopy = function() {

    var parentId = String($scope.newProjectParent);
    var title = $scope.newProjectTitle;

    if (!parentId) {
      alert("You need to choose an organization to copy the item into.");
      return false;
    }
    if (!$scope.id) {
      alert("You need to choose a project to copy.");
      return false;
    }
    if (!title) {
      alert("You need a new title for the project.");
      return false;
    }

    show("edit-fields", false);

    var json = getItem(String($scope.id));

    //remove things that we don't want to clone, parentId and id
    delete json.parentId;
    delete json.id;

    // Change the appropriate fields
    json.title = title;

    // convert to JSON with angular to remove some crap
    // json = angular.toJson(json);

    var returnedJson = upsert('POST', parentId, json);

    try
    {
      $scope.json = returnedJson;

      $scope.refresh();
    }
    catch(exception)
    {
      alert(exception);
    } 
    show("copy-fields", true);
    show("sort-fields", true);

    alert("Successfully copied item " + String($scope.id) + "to item " + returnedJson.id + ".");
  };

  $scope.createOrganization = function() {

    var json = {};
    json.parentId = $scope.newOrgParent.id;
    json.title = $scope.newOrgTitle;
    json.tags = [{scheme: "Project", type:"Label", name: $scope.newOrgParent.org}];

    if (!json.parentId) {
      alert("You need to choose an organization type to put the organization in.");
      return false;
    }
    if (!title) {
      alert("You need a new title for the organization.");
      return false;
    }

    show("edit-fields", false);

    var returnedJson = upsert('POST', json.parentId, json);

    try
    {
      $scope.json = returnedJson;
      $scope.refresh();
    }
    catch(exception)
    {
      alert(exception);
    } 
    show("create-org", true);
    show("sort-fields", true); 
    alert("Successfully created Organization " + returnedJson.id + ".");
  };

  $scope.create = function() {
    $scope.json = {};
    show("edit-fields", false);
    show("sort-fields", true); 

    // $scope.json.id = "";
    // $scope.json.title = "";
  };

  $scope.post = function() {
    var json = $scope.json;
    json = $scope.prepareJson(json);
    var org = filterFilter($scope.json.tags, {scheme: "Project", type: "Organization Name"})[0].name;
    var orgId = filterFilter($scope.organizations, {title: org})[0].id;
    if (!org || !orgId) {
      alert("Organization required create new items org = " + org + " orgId = " + orgId);
      return false;
    }
    if(!json.title) {
      alert("Title required to create new items");
      return false;
    }
    delete json.id;
    json.parentId = orgId;
    var returnedJson = upsert('POST', orgId, json);

    try
    {
      $scope.json = returnedJson;

      $scope.refresh();
    }
    catch(exception)
    {
      alert(exception);
    }

    alert("Successfully saved item " + returnedJson.id + ".");
  };

  $scope.put = function() {
    if (!$scope.json.id) 
      return $scope.post();
    var json = $scope.json;
    json = $scope.prepareJson(json);
    //delete the parent id so we don't move the item.
    //TODO: have a checkbox if they want to move to the parentId
    delete json.parentId;
    var returnedJson = upsert('PUT', $scope.json.id, json);

    try
    {
      $scope.json = returnedJson;

      $scope.refresh();
    }
    catch(exception)
    {
      alert(exception);
    }
    alert("Successfully saved item " + returnedJson.id + ".");

  };

  $scope.clone = function() {

  };

  $scope.prepareJson = function(json) {
    var json = jQuery.extend(true, {}, json);
    // Remove any contacts without a name
    json.contacts = filterFilter(json.contacts, $scope.filterBlankContacts);
    json.webLinks = filterFilter(json.webLinks, $scope.filterBlankWeblinks);
    json.tags = filterFilter(json.tags, $scope.filterBlankTags);

    var projIdx = $scope.findIndexByKeyValue(json.facets, "className", "gov.sciencebase.catalog.item.facet.ProjectFacet");
    json.facets[projIdx].projectProducts = filterFilter(json.facets[projIdx].projectProducts, $scope.filterBlankProjects);
    json.facets[projIdx].funding = filterFilter(json.facets[projIdx].funding, $scope.filterBlankFunds);

    var expandoIdx = $scope.findIndexByKeyValue(json.facets, "className", "gov.sciencebase.catalog.item.facet.ExpandoFacet");
    for (var concept in json.facets[expandoIdx].object.themes) {
      delete json.facets[expandoIdx].object.themes[concept]["$$hashKey"];
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
  }

  $scope.filterProjects = function(project) {
    if ($scope.orgType && 
        $scope.orgType.org && 
        $scope.orgType.org !== "" && 
        filterFilter(project.tags, {scheme: "Project", type: "Organization Type", name: $scope.orgType.org}).length === 0) {
      return false;
    }

    var fyTag = {scheme: "Project", type: "Fiscal Year", name: $scope.fiscalYear};
    if ($scope.fiscalYear && $scope.fiscalYear !== "" && filterFilter(project.tags, fyTag).length === 0) {
      return false;
    }

    var projTypeTag = {scheme: "Project", type: "Project Type", name: $scope.projectType};
    if ($scope.projectType && $scope.projectType !== "" && filterFilter(project.tags, projTypeTag).length === 0) {
      return false;
    }

    if ($scope.organization &&
        $scope.organization.title && 
        $scope.organization.title !== "" && 
        filterFilter(project.tags, {scheme: "Project", type: "Organization Name", name: $scope.organization.title}).length === 0) {
      return false;
    }

    return true;
  };

  $scope.filterAllProjectsView = function(project) {

    if ($scope.orgType) {
      var orgMatch = false;
      for (var i = 0; i < $scope.orgType.length; i++) {
        if ($scope.orgType[i].org &&
            $scope.orgType[i].org !== "" &&
            filterFilter(project.tags, {scheme: "Project", type: "Organization Type", name: $scope.orgType[i].org}).length > 0) {
          orgMatch = true;
        }
      }
      if (!orgMatch) {
        return false;
      }
    } 
 
    if ($scope.fiscalYear) {
      var fyMatch = false;
      for (var i = 0; i < $scope.fiscalYear.length; i++) {
        if ($scope.fiscalYear[i] &&
            $scope.fiscalYear[i] !== "" &&
            filterFilter(project.tags, {scheme: "Project", type: "Fiscal Year", name: $scope.fiscalYear[i]}).length > 0) {
          fyMatch = true;
        }
      }
      if (!fyMatch) {
        return false;
      }
    }

    if ($scope.projectType) {
      var typeMatch = false;
      for (var i = 0; i < $scope.projectType.length; i++) {
        if ($scope.projectType[i] &&
            $scope.projectType[i] !== "" &&
            filterFilter(project.tags, {scheme: "Project", type: "Project Type", name: $scope.projectType[i]}).length > 0) {
          typeMatch = true;
        }
      }
      if (!typeMatch) {
        return false;
      }
    }

    if ($scope.organization) {
      var orgMatch = false;
      for (var i = 0; i < $scope.organization.length; i++) {
        if ($scope.organization[i].title &&
            $scope.organization[i].title !== "" &&
            filterFilter(project.tags, {scheme: "Project", type: "Organization Name", name: $scope.organization[i].title}).length > 0) {
          orgMatch = true;
        }
      }
      if (!orgMatch) {
        return false;
      }
    }

    if ($scope.project) {
      var projMatch = false;
      for (var i = 0; i < $scope.project.length; i++) {
        if ($scope.project[i] && $scope.project[i] === project) {
          projMatch = true;
        }
      }
      if (!projMatch) {
        return false;
      }
    }

    if ($scope.pi) {
      var piMatch = false;
      for (var i = 0; i < $scope.pi.length; i++) {
        var pis = filterFilter(project.contacts, {type: "Principal Investigator"});
        if ($scope.findIndexByKeyValue(pis, "name", $scope.pi[i].name) !== -1) {
          piMatch = true;
        }
      }
      if (!piMatch) {
        return false;
      }
    }

    if ($scope.keywords) {
      var kwMatch = false;
      for (var i = 0; i < $scope.keywords.length; i++) {
        var kws = filterFilter(project.tags, {scheme: "Project", type: "Keyword"});
        if ($scope.findIndexByKeyValue(kws, "name", $scope.keywords[i].name) !== -1) {
          kwMatch = true;
        }
      }
      if (!kwMatch) {
        return false;
      }
    }

    if ($scope.projStatuses) {
      var statusMatch = false;
      var projIdx = $scope.findIndexByKeyValue(project.facets, "className", "ProjectFacet");
      if (projIdx >= 0) {
        for (var i = 0; i < $scope.projStatuses.length; i++) {
          if (project.facets[projIdx].projectStatus === $scope.projStatuses[i]) {
            statusMatch = true;
          }
        }
      }
      if (!statusMatch) return false;
    }

    return true;
  };

  $scope.filterProjectsView = function(project) {

    if ($scope.orgType) {
      var orgMatch = false;
      for (var i = 0; i < $scope.orgType.length; i++) {
        if ($scope.orgType[i].org &&
            $scope.orgType[i].org !== "" &&
            filterFilter(project.tags, {scheme: "Project", type: "Organization Type", name: $scope.orgType[i].org}).length > 0) {
          orgMatch = true;
        }
      }
      if (!orgMatch) {
        return false;
      }
    } 
 
    if ($scope.fiscalYear) {
      var fyMatch = false;
      for (var i = 0; i < $scope.fiscalYear.length; i++) {
        if ($scope.fiscalYear[i] &&
            $scope.fiscalYear[i] !== "" &&
            filterFilter(project.tags, {scheme: "Project", type: "Fiscal Year", name: $scope.fiscalYear[i]}).length > 0) {
          fyMatch = true;
        }
      }
      if (!fyMatch) {
        return false;
      }
    }

    if ($scope.projectType) {
      var typeMatch = false;
      for (var i = 0; i < $scope.projectType.length; i++) {
        if ($scope.projectType[i] &&
            $scope.projectType[i] !== "" &&
            filterFilter(project.tags, {scheme: "Project", type: "Project Type", name: $scope.projectType[i]}).length > 0) {
          typeMatch = true;
        }
      }
      if (!typeMatch) {
        return false;
      }
    }

    if ($scope.organization) {
      var orgMatch = false;
      for (var i = 0; i < $scope.organization.length; i++) {
        if ($scope.organization[i].title &&
            $scope.organization[i].title !== "" &&
            filterFilter(project.tags, {scheme: "Project", type: "Organization Name", name: $scope.organization[i].title}).length > 0) {
          orgMatch = true;
        }
      }
      if (!orgMatch) {
        return false;
      }
    }


    return true;
  };

  $scope.filterOrganizations = function(org) {
    if ($scope.orgType && 
        $scope.orgType.org && 
        $scope.orgType.org !== "" && 
        filterFilter(org.tags, {scheme: "Project", type: "Label", name: $scope.orgType.org}).length === 0) {
      return false;
    }
    return true;
  };

  $scope.totalFunding = function() {
    var funding = 0;
    var filteredProjects = filterFilter($scope.allProjects, $scope.filterAllProjectsView);
    for (var i = 0; i < filteredProjects.length; i++) {
      var projs = filterFilter(filteredProjects[i].facets, {className: "ProjectFacet"});
      // alert($scope.prettyPrint(filteredProjects[i].facets));
      if (projs && projs.length > 0 && projs[0].parts) {
        for (var j = 0; j < projs[0].parts.length; j++) {
          var value = parseInt(projs[0].parts[j].value);
          if (value) {
            funding += parseInt(projs[0].parts[j].value);
          }
        }
      }
      if (projs && projs.length > 0 && projs[0].funding) {
        for (var j = 0; j < projs[0].funding.length; j++) {
          if (parseInt(projs[0].funding[j].fundingAmount)) {
            funding += parseInt(projs[0].funding[j].fundingAmount);
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
        var idx = $scope.findIndexByKeyValue(contacts, "name", fullContacts[i].name);
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
      var kws = filterFilter(filteredProjects[i].tags, {scheme: "Project", type: "Keyword"});
      for (var j = 0; j < kws.length; j++) {
        var idx = $scope.findIndexByKeyValue(keywords, "name", kws[j].name);
        if (idx === -1) keywords.push(kws[j]);
      }
    }
    return keywords;
  };

  $scope.prettyPrint = function(json) {
    return JSON.stringify(json, undefined, 2);
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
    return (tag.type === "Fiscal Year");
  };

  $scope.isKeyword = function(tag) {
    return (tag.type === "Keyword");
  };

  $scope.isLocation = function(tag) {
    return (tag.type === "Location");
  };

  $scope.isOrganizationType = function(tag) {
    return (tag.type === "Organization Type");
  };

  $scope.isOrganizationName = function(tag) {
    return (tag.type === "Organization Name");
  };

  $scope.isProjectType = function(tag) {
    return (tag.type === "Project Type");
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

