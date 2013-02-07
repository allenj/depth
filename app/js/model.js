var viewModel;

var modelParams;

if (typeof params === 'undefined') {
    modelParams = {
        url: "https://www.sciencebase.gov/catalog/items",
        max: 20
    }
}

$(document).ready(loadItems);

var mapping = {
    "items": {
        create: function(options) {
            return new Item(options.data);
        }
    },
    "link": {
        create: function(options) {
            return new Link(options.data);
        }
    },
    "webLinks": {
         create: function(options) {
             return new WebLink(options.data);
         }
     }
};

function loadItems() {
    console.log("loading items");

    viewModel = ko.mapping.fromJS({
        items: [],
        total: "",
        nextlink: "",
        prevlink: ""
    }, mapping);

    viewModel.q = ko.observable('');
    // viewModel.pages = ko.observableArray([]);

    viewModel.next = function() {
        viewModel._updateModel(viewModel.nextlink().url());
    }

    viewModel.previous = function() {
        viewModel._updateModel(viewModel.prevlink().url());
    }  

    viewModel.doSearch = function(data, event) {
        $.extend(data, {
            q: viewModel.q(),
            max: modelParams.max,
            format: "jsonp",
            fields: "webLinks,title,summary"
        });

        viewModel._updateModel(modelParams.url, data);
    }

    viewModel._updateModel = function(url, data) {
        $.ajax({
            type: "GET",
            url: url ? url : modelParams.url,
            data: data ? data : {},
            contentType: "application/jsonp",
            dataType: "jsonp",
            crossdomain: true,
            success: function(json) {
                $("#welcome").hide();

                if (json.items) {
                    ko.mapping.fromJS(json, {}, viewModel);

                    if (viewModel.total() == 0) {
                        $("#no-results").show();
                    }
                } else {
                    //TODO: This should be an error
                    $("#no-results").show();
                }
                // viewModel._addPages();
            }
        });

        
    }

    // viewModel._addPages = function() {
    //     if (viewModel.total() > modelParams.max && (viewModel.prevlink() || viewModel.nextlink())) {
    //         var currentOffset;
    //         var baseUrl;

    //         if (viewModel.nextlink()) {
    //             currentOffset = _getQParamValue(viewModel.nextlink().url(), "offset") - modelParams.max
    //             baseUrl = 
    //         } else {
    //             currentOffset = _getQParamValue(viewModel.nextlink().url(), "offset") + modelParams.max
    //         }

    //         // page 1
    //         if (currentOffset == 0) {
    //             viewModel.pages.push({"pageNum": 1, "url": (currentOffset != 0) ? })
    //         }
    //     }
    // }

    ko.applyBindings(viewModel);   
}

function Item(data) {
    this.summary = ko.observable('');
    this.id = ko.observable('');
    this.title = ko.observable('');
    this.link = ko.observable('');

    this.webLinks = ko.observableArray([]);

    this.browseImageUri = ko.observable('');

    if (data) {
        ko.mapping.fromJS(data, mapping, this);

        var item = this;
        $.each(this.webLinks(), function(index, webLink) {
            if (webLink.type() == 'browseImage') {
                item.browseImageUri(webLink.uri());
            }
        });
    }
}

function Link(data) {
    this.rel = ko.observable('');
    this.url = ko.observable('');

    if (data) {
        ko.mapping.fromJS(data, mapping, this);
    }
}

function WebLink(data) {
    this.title = ko.observable('');
    this.itemWebLinkTypeId = ko.observable('');
    this.hidden = ko.observable('');
    this.rel = ko.observable('');
    this.typeLabel = ko.observable('');
    this.type = ko.observable('');
    this.uri = ko.observable('');

    if (data) {
        ko.mapping.fromJS(data, mapping, this);
    }
}

function _getQParamValue(url, param) {
    var qParams = url.split("?")[1];
    var start = qParams.indexOf(param);
    var param = qParams.indexOf("&", start) > 0 ? qParams.substring(start, qParams.indexOf("&", start)) : qParams.substring(start);
    return decodeURIComponent(param.split("=")[1]);
}

// function _getBaseUrl(url) {
//     var parts = url.split("?");
//     var params = parts[1].split("&");
    
//     var url = parts[0] + "?";
//     for (var i=0; i < params.length; i++) {
//         if ()
//     }
// }