angular.module('depth', []).
  config(function($routeProvider) {
    $routeProvider.
      when('/', {controller:depthCtrl, templateUrl:'editProject.html'}).
      when('/sbFields', {controller:depthCtrl, templateUrl:'editSB.html'}).
      otherwise({redirectTo:'/'});
  });

function depthCtrl($scope) {
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

  //Adds on arrays
  $scope.addContact = function() {
    $scope.json.contacts.push({type:$scope.contact.type, name:$scope.contact.name, personsOrganization:$scope.contact.personsOrganization});
    $scope.contact.type = '';
    $scope.contact.name = '';
    $scope.contact.personsOrganization = '';
    $scope.contact.type.focus();
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
    json.contacts.pop();
    json.tags.pop();
    json.dates.pop();
    return json;
  }

  $scope.prettyPrint = function(json) {
    return JSON.stringify(json, undefined, 2);
  };

}

function ContactsCtrl($scope) {
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

  $scope.isProject = $scope.facetType() === "Project" ? true : false;
}

// function SbRestCtrl($scope) {


//   $scope.post = function() {
//     $http.post('/someUrl', data).success(successCallback);
//   };
// }

