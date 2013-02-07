'use strict';

var params = {
    // url: "https://www.sciencebase.gov/catalog/items"
    // url: "http://localhost:8090/catalog/items",
    url: "https://my-beta.usgs.gov/catalog/items",
    max: 20
};

/* jasmine specs for searching */
describe("doSearch", function() {
        
    beforeEach(function() {
        loadItems();
    });

    it("should get some results with a search for 'water'", function() {
        viewModel.q("water");

        viewModel.doSearch({});

        waitsFor(function() {
            return typeof viewModel.total() == "number";
        }, "service to return results", 5000);

        runs(function() {
            // dump(viewModel.total() + " Items returned");
            expect(viewModel.total()).toBeGreaterThan(0);
        });        
    });

    it("should get no results with a search for 'qwerasdfzxcv'", function() {
        viewModel.q("qwerasdfzxcv");

        viewModel.doSearch({});

        waitsFor(function() {
            return typeof viewModel.total() == "number";
        }, "service to return results", 10000);

        runs(function() {
            // dump(viewModel.total() + " Items returned");
            expect(viewModel.total()).toEqual(0);
        });    
    });
});