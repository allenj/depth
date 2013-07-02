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

function getItem(id, sbUrl, josso)
{
  // var josso = checkCookie();
  var itemUrl = sbUrl + "/item/" + id + "?josso=" + josso + "&format=json";

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

function upsert(type, id, json, sbUrl, josso)
{
  // var josso = checkCookie();

  if (!josso) {
    alert("Please log in again.");
    return false;
  }
  if (!json) {
    alert("JSON invalid");
    return false;
  }

  var itemUrl = sbUrl + "/item/";
  itemUrl += id;
  itemUrl += "?josso=" + josso;
  itemUrl += "&format=json";

  var returnedJson;

  // Make the request
  $.ajax({
    type: type,
    url: itemUrl,
    data: JSON.stringify(json),
    crossDomain: true,
    dataType: 'json',
    async: false,
    success: function(data) { returnedJson = jQuery.extend(true, {}, data); },
    error: function(data) { returnedJson = data.responseText; },
    beforeSend: function(request)
    {
      request.setRequestHeader("Accept", "application/json");
      request.setRequestHeader("Content-Type", "application/json");
    }
  });  
  return returnedJson;
}

function show(id, hide)
{
  if (!document.getElementById(id)) {
    return;
  }
  var display = document.getElementById(id).style.display;
  if (hide)
    document.getElementById(id).style.display = display === 'none'? 'block': 'none';
  else
    document.getElementById(id).style.display = 'block';
}

