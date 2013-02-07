// Get cookie by name
function getCookie(c_name)
{
  var i,x,y,ARRcookies=document.cookie.split(";");
  var cookieNames = "";
  for (i=0; i < ARRcookies.length; i++)
  {
    x = ARRcookies[i].substr(0, ARRcookies[i].indexOf("="));
    y = ARRcookies[i].substr(ARRcookies[i].indexOf("=")+1);
    x = x.replace(/^\s+|\s+$/g, "");
    cookieNames += x;
    if (x == c_name) {
      return unescape(y);
    }
  }
  return x;
}

// get the josso cookie
function checkCookie()
{
  var josso = getCookie("JOSSO_SESSIONID");
  if (josso != null && josso != "") {
    return josso;
  }
  else {
    return false;
  }
}

function getItem(id)
{
  var josso = checkCookie();
  var itemUrl = "https://beta.sciencebase.gov/catalog/item/" + id + "?josso=" + josso + "&format=json";
  // var itemUrl = "https://my-beta.usgs.gov/catalog/item/" + id + "?josso=" + josso + "&format=json";
  // var itemUrl = "http://localhost:8090/catalog/item/" + id + "?josso=" + josso + "&format=json";

  var json;

  $.ajax({
    type: 'GET',
    url: itemUrl,
    crossDomain: true,
    dataType: 'json',
    async: false,
    success: function(data) { 
      json = jQuery.extend(true, {}, data);
    },
    failure: function(data) { json = {"error": data}; },
    beforeSend: function(request)
    {
      request.setRequestHeader("Accept", "application/json");
      request.setRequestHeader("Content-Type", "application/json");
    } 
  });
  return json;  
}

function upsert(type, id, json)
{
  var josso = checkCookie();

  if (!josso) {
    alert("Could not get josso");
    return false;
  }
  if (!json) {
    alert("JSON invalid");
    return false;
  }

  var itemUrl = "https://beta.sciencebase.gov/catalog/item/";
  // var itemUrl = "https://my-beta.usgs.gov/cataog/item/"
  // var itemUrl = "http://localhost:8090/catalog/item/";
  itemUrl += id;
  itemUrl += "?josso=" + josso;
  itemUrl += "&format=json";

  var json;

  // Make the request
  $.ajax({
    type: type,
    url: itemUrl,
    data: JSON.stringify(json),
    crossDomain: true,
    dataType: 'json',
    async: false,
    success: function(data) { json = jQuery.extend(true, {}, data); },
    failure: function(data) { json = {"error": data}; },
    beforeSend: function(request)
    {
      request.setRequestHeader("Accept", "application/json");
      request.setRequestHeader("Content-Type", "application/json");
    }
  });  
  return json;
}

function show(id)
{
  var display = document.getElementById(id).style.display;
  document.getElementById(id).style.display = display === 'none'? 'block': 'none';
}

