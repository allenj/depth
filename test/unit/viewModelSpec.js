'use strict';

/* jasmine specs for the view model */
describe('viewModel unit tests', function() {
    describe("after initializing viewModel with loadItems", function() {
        beforeEach(function() {
            loadItems();
        });

        it("should exist", function() {
            expect(viewModel).toBeDefined();
        });

        it("total should be ''", function() {
            expect(viewModel.total()).toEqual("");
        });

        it("testItems should exist", function() {
            expect(testItems).toBeDefined();
        });

        
    });

    describe("Item", function() {
        it("testItem1 should exist", function() {
            expect(testItem1).toBeDefined();
        });

        it("should retrieve set a browseImage", function() {
            var item = new Item(testItem1);

            expect(item.browseImageUri()).toEqual("http://thor-f5.er.usgs.gov/ngtoc/metadata/ustopo/thumbnails/AZ/AZ_Houck_20111028_TM_tn.jpg");
        });

    });
});

describe("helper functions", function() {
    describe("_getQParamValues", function() {
        var base_url = "https://www.asdf.com"

        it("should get the value of the first qparam", function() {
            expect(_getQParamValue(base_url+"?bob=asdf&shirley=123123", "bob")).toEqual("asdf");
        });

        it("should get the value of the last qparam", function() {
            expect(_getQParamValue(base_url+"?bob=asdf&shirley=123123&sam=thebest", "sam")).toEqual("thebest");
        });

    });
});