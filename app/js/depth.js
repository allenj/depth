var Depth = angular.module('depth', ['ngResource']);

Depth.config(function($routeProvider) {
    $routeProvider.
      when('/', {controller:depthCtrl, templateUrl:'editProject.html'}).
      when('/sbFields', {controller:depthCtrl, templateUrl:'editSB.html'}).
      otherwise({redirectTo:'/'});
  });

function depthCtrl($scope, filterFilter) {
  $scope.json = {};
  // $scope.json.id = "5006e94ee4b0abf7ce733f56";
  $scope.json.id = "51102503e4b0eea71f706101";
  $scope.json.parentId = "51102464e4b0eea71f7060fd";
  $scope.json.contacts = [];
  $scope.json.alternateTitles = [];
  $scope.json.facets = [];
  $scope.json.identifiers = [];
  $scope.json.tags = [];
  $scope.json.dates = [];
  $scope.json.webLinks = [];

  $scope.addRequiredFields = function() {
    // Contacts
    var pis = filterFilter($scope.json.contacts, {type: "Principal Investigator"});
    if (pis.length < 1) {
      $scope.json.contacts.push({type:"Principal Investigator"});
    }

    var fas = filterFilter($scope.json.contacts, {type: "Funding Agency"});
    if (fas.length < 1) {
      $scope.json.contacts.push({type: "Funding Agency"});
    }

    var coops = filterFilter($scope.json.contacts, {type: "Cooperator/Partner"});
    if(coops.length === 0 || coops[coops.length-1].name){
      $scope.json.contacts.push({type: "Cooperator/Partner"});
    }

    // Tags
    var fys = filterFilter($scope.json.tags, {scheme: "Project", type: "Fiscal Year"});
    if(fys.length === 0) {
      $scope.json.tags.push({scheme: "Project", type: "Fiscal Year"});
    }

    var orgTypes = filterFilter($scope.json.tags, {scheme: "Project", type: "Organization Type"});
    if(orgTypes.length === 0) {
      $scope.json.tags.push({scheme: "Project", type: "Organization Type"});
    }

    var kws = filterFilter($scope.json.tags, {scheme: "Project", type: "Keyword"});
    if(kws.length === 0 || kws[kws.length-1].name) {
      $scope.json.tags.push({scheme: "Project", type: "Keyword"});
    }

    var locs = filterFilter($scope.json.tags, {scheme: "Project", type: "Location"});
    if(locs.length === 0 || locs[locs.length-1].name) {
      $scope.json.tags.push({scheme: "Project", type: "Location"});
    }

    // Facets
    var projs = filterFilter($scope.json.facets, {className: "gov.sciencebase.catalog.item.facet.ProjectFacet"});
    if(projs.length === 0) {
      $scope.json.facets.push({className: "gov.sciencebase.catalog.item.facet.ProjectFacet"});
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

    // TODO: should change this to a $watch instead
    return "";
  };

  //Need to figure out how to make this persistant
  $scope.indexOfProject = function() {
    return $scope.findIndexByKeyValue($scope.json.facets, "className", "gov.sciencebase.catalog.item.facet.ProjectFacet");
  };

  $scope.findIndexByKeyValue = function (list, key, value) {
    for (var i = 0; i < list.length; i++) {
      if (list[i][key] === value) {
        return i;
      }
    }
    return -1;
  };

  $scope.fiscalYears = [{fy: "2011"}, {fy: "2012"}, {fy: "2013"}];

  $scope.projects = [
    {projectId: "5006e94ee4b0abf7ce733f56", projectName: "Climate Change and Peak Flows"},
    {projectId: "51102503e4b0eea71f706101", projectName: "depthTesting"}
  ];

  $scope.folders = [
    {folderId: "5048dfdae4b0ec4a6c8198bd", folderName: "NCCWSC Science Projects"},
    {folderId: "51102464e4b0eea71f7060fd", folderName: "depth"}
  ];

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
    if(type === "Principal Investigator") {
      $scope.json.tags.push({scheme: "Project", type: "Organization Type"});
    }
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

  $scope.get = function() {
    var json = getItem($scope.json.id);

    try
    {
      $scope.json = json;
    }
    catch(exception)
    {
      alert(exception);
    }
  };

  $scope.post = function() {
    var json = $scope.json;
    json = $scope.prepareJson(json);
    if (!json.parentId) {
      alert("Parent Id required create new items");
      return false;
    }
    if(!json.title) {
      alert("Title required to create new items");
      return false;
    }
    delete json.id;
    var returnedJson = upsert('POST', $scope.json.parentId, json);

    try
    {
      $scope.json = returnedJson;
    }
    catch(exception)
    {
      alert(exception);
    }

  };

  $scope.put = function() {
    var json = $scope.json;
    json = $scope.prepareJson(json);
    //delete the parent id so we don't move the item.
    //TODO: have a checkbox if they want to move to the parentId
    delete json.parentId;
    var returnedJson = upsert('PUT', $scope.json.id, json);

    try
    {
      $scope.json = returnedJson;
    }
    catch(exception)
    {
      alert(exception);
    }

  };

  $scope.clone = function() {
    var parentId = $scope.json.parentId;
    if (!parentId) {
      alert("You need a parent id to create new items");
      return false;
    }

    var json = getItem($scope.json.id);

    //remove things that we don't want to clone, parentId and id
    delete json.parentId;
    delete json.id;

    var returnedJson = upsert('POST', parentId, json);

    try
    {
      $scope.json = returnedJson;
    }
    catch(exception)
    {
      alert(exception);
    }
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

    // json.dates.pop();
    return json;
  };

  $scope.filterBlankTags = function(tag) {
    return (tag.name != null && tag.name != "");
  };

  $scope.filterBlankContacts = function(contact) {
    return (contact.name != null && contact.name != ""); 
  };

  $scope.fitlerBlankWeblinks = function(weblink) {
    return (weblink.uri != null && weblink.uri != "");
  };

  $scope.filterBlankProjects = function(product) {
    return (product.productDescription != null && product.productDescription != "");
  };

  $scope.filterBlankFunds = function(fund) {
    return (fund.fundingAmount != null && fund.fundingAmount != "");
  }

  $scope.prettyPrint = function(json) {
    return JSON.stringify(json, undefined, 2);
  };

}

function ContactsCtrl($scope, filterFilter) {
  $scope.getContactType = function(contact) {
    switch (contact.type) {
        case "Principal Investigator":
          return "PI";
          break;
        case "Cooperator/Partner":
          return "Cooperator";
          break;
        default:
          return $contact.type;
          break;
        //TODO: add more contact type here
      }
  };

  $scope.isFundingAgency = function(contact) {
    return (contact.type === "Funding Agency");
  };

  $scope.isPrincipalInvestigator = function(contact) {
    return (contact.type == "Principal Investigator");
  };

  $scope.isCooperator = function(contact) {
    return (contact.type == "Cooperator/Partner");
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
  }

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

  $scope.isExpectedProduct = function(product) {
    return (product.status === "Expected");
  }

  $scope.isDeliveredProduct = function(product) {
    return (product.status === "Delivered");
  }
}

// function SbRestCtrl($scope) {


//   $scope.post = function() {
//     $http.post('/someUrl', data).success(successCallback);
//   };
// }

