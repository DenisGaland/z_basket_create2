sap.ui.define([
	"sap/ui/core/mvc/Controller",
	"../TABLE/TableExampleUtils",
	"sap/m/MessageToast",
	"sap/m/MessageBox",
	"sap/ui/model/json/JSONModel", 
	"sap/ui/model/odata/ODataModel",
	"sap/ui/model/resource/ResourceModel",
	"sap/ui/table/SelectionMode",
	"sap/ui/table/SelectionBehavior",
	"sap/ui/core/BusyIndicator"
], function(Controller, TableExampleUtils, MessageToast, MessageBox, JSONModel, ODataModel, ResourceModel, SelectionMode,
	SelectionBehavior, BusyIndicator) {
	"use strict";
	return Controller.extend("z_basket_create2.controller.MYVIEW", {
		onInit: function() {
			var i18nModel = new ResourceModel({
				bundleName: "z_basket_create2.i18n.i18n"
			});
			this.getView().setModel(i18nModel, "i18n");
			var oView = this.getView();
			var osite = oView.byId("__PLANT");
			var URL = "/sap/opu/odata/sap/ZGET_PLANT_SRV/";
			var OData = new ODataModel(URL, true);
			var query = "/S_T001WSet(Type='')";
			debugger;
			BusyIndicator.show();
			OData.read(query, null, null, true, function(response) {
				BusyIndicator.hide();
				var plant = response.EPlant;
				var name1 = response.ET001w.Name1;
				var site = plant + " " + name1;
				osite.setText(site);
				jQuery.sap.delayedCall(500, this, function() {
					oView.byId("SearchArt").focus();
				});
				var oArticle = oView.byId("Article");
				oArticle.setVisible(true);
			}, function(error) {
				BusyIndicator.hide();
				MessageBox.error(JSON.parse(error.response.body).error.message.value, {
					title: "Error"
				});
			});
			this.GetData("D");
			oView.byId("H_Header").setVisible(false);
			oView.byId("savebasket").setVisible(false);
		},

		searchArt: function(oEvent) {
			var oController = this;
			var oView = this.getView();
			var oTable = oView.byId("table1");
			var material = oView.byId("SearchArt").getValue();
			var URL = "/sap/opu/odata/sap/ZCHECK_VALUE_SCAN_SRV/";
			var OData = new ODataModel(URL, true);
			var query = "/MessageSet(PValue='07" + material + "')";
			debugger;
			BusyIndicator.show();
			OData.read(query, null, null, true, function(response) {
				BusyIndicator.hide();
				if (response.EMessage !== "" && response.EZtype === "E") {
					var path = $.sap.getModulePath("z_basket_create2", "/audio");
					var aud = new Audio(path + "/MOREINFO.png");
					aud.play();
					oView.byId("SearchArt").setValue("");
					MessageBox.error(response.EMessage, {
						title: "Error",
						initialFocus: oView.byId("SearchArt").focus(),
						onClose: function() {
							jQuery.sap.delayedCall(500, this, function() {
								oView.byId("SearchArt").focus();
							});
						}
					});
				} else {
					oTable.setVisible(true);
					oController.GetData("A");
				}
			}, function(error) {
				BusyIndicator.hide();
				MessageBox.error(JSON.parse(error.response.body).error.message.value, {
					title: "Error"
				});
			});
		},

		ClearLabels: function(oEvent) {
			var oView = this.getView();
			var oTable = oView.byId("table1");
			var Button = oView.byId("TOOL_BAR");
			var URL = "/sap/opu/odata/sap/ZBASKET_ITEMS_SRV/";
			var OData = new ODataModel(URL, true);
			var query = "/ItemsSet?$filter=ZembArt%20eq%20%27C/T%27";
			var model = new JSONModel();
			debugger;
			BusyIndicator.show();
			OData.read(query, null, null, true, function(response) {
				BusyIndicator.hide();
				jQuery.sap.delayedCall(500, this, function() {
					oView.byId("SearchArt").focus();
				});
				oTable.setVisible(false);
				Button.setVisible(false);
				oView.setModel(model, "itemModel");
				var infoMsg = oView.getModel("i18n").getResourceBundle().getText("list_cleared");
				MessageToast.show(infoMsg, {
					my: "center top",
					at: "center top"
				});
			}, function(error) {
				BusyIndicator.hide();
				MessageBox.error(JSON.parse(error.response.body).error.message.value, {
					title: "Error"
				});
			});
			jQuery.sap.delayedCall(500, this, function() {
				oView.byId("SearchArt").focus();
			});
		},

		SaveSelected: function(oEvent) {
			var oView = this.getView();
			oView.byId("H_Header").setVisible(true);
			var URL = "/sap/opu/odata/sap/ZBASKET_HEADER_SRV_01/";
			var OData = new ODataModel(URL, true);
			var query = "/ItemsSet(IEan='')";
			debugger;
			BusyIndicator.show();
			OData.read(query, null, null, true, function(response) {
				BusyIndicator.hide();
				if (response.Matnr !== "") {
					oView.byId("headertext").setText(oView.getModel("i18n").getResourceBundle().getText("new_basket"));
				} else {
					oView.byId("headertext").setText(oView.getModel("i18n").getResourceBundle().getText("existing_basket"));
				}
				oView.byId("eancode").setValue(response.Ean11);
				oView.byId("descr").setValue(response.Maktx);
				oView.byId("prx").setValue(response.Price);
				oView.byId("ccy").setText(oView.getModel("i18n").getResourceBundle().getText("price_in_eur"));
				oView.byId("unit").setText(oView.getModel("i18n").getResourceBundle().getText("quantity_in_ea"));
				oView.byId("stk").setValue(Math.floor(response.Labst));
				oView.byId("save").setVisible(false);
				oView.byId("clear").setVisible(false);
				oView.byId("Article").setVisible(false);
				oView.byId("savebasket").setVisible(true);
				oView.byId("scroll").setHeight("250px");
				//oView.byId("qty").focus();
			}, function(error) {
				BusyIndicator.hide();
				MessageBox.error(JSON.parse(error.response.body).error.message.value, {
					title: "Error"
				});
			});
		},

		SaveBasket: function(oEvent) {
			var oView = this.getView();
			var oTable = oView.byId("table1");
			var Button = oView.byId("TOOL_BAR");
			var model = new JSONModel();
			debugger;
			var qty = parseInt(oView.byId("qty").getSelectedItem().getText());
			//if (!isNaN(qty) && qty > 0) {
			var URL = "/sap/opu/odata/sap/ZBASKET_SAVE1_SRV/";
			var OData = new ODataModel(URL, true);
			var query = "/ItemsSet(IQuantity=" + qty + ")";
			debugger;
			BusyIndicator.show();
			OData.read(query, null, null, true, function(response) {
				BusyIndicator.hide();
				Button.setVisible(false);
				oTable.setVisible(false);
				oView.byId("H_Header").setVisible(false);
				oView.byId("Article").setVisible(true);
				oView.byId("SearchArt").setVisible(true);
				oView.byId("clear").setVisible(true);
				oView.byId("save").setVisible(true);
				oView.byId("savebasket").setVisible(false);
				oView.byId("scroll").setHeight("420px");
				oView.byId("qty").setSelectedKey("1");
				oView.setModel(model, "itemModel");
				jQuery.sap.delayedCall(500, this, function() {
					oView.byId("SearchArt").focus();
				});
				var infoMsg = oView.getModel("i18n").getResourceBundle().getText("the_basket_has_been_saved");
				MessageToast.show(infoMsg, {
					my: "center top",
					at: "center top"
				});
			}, function(error) {
				BusyIndicator.hide();
				MessageBox.error(JSON.parse(error.response.body).error.message.value, {
					title: "Error"
				});
			});
		},

		GetData: function(action) {
			var oView = this.getView();
			var material = this.getView().byId("SearchArt").getValue();
			var searchString = "C/" + action + "/" + material;
			this.getView().byId("SearchArt").setValue("");
			var URL = "/sap/opu/odata/sap/ZBASKET_ITEMS_SRV/";
			var OData = new ODataModel(URL, true);
			var query = "/ItemsSet?$filter=ZembArt " + "%20eq%20" + "%27" + searchString + "%27&$format=json";
			debugger;
			BusyIndicator.show();
			OData.read(query, null, null, true, function(response) {
				BusyIndicator.hide();
				if (response.EMessage !== "" && response.EZtype === "E") {
					var path = $.sap.getModulePath("z_basket_create2", "/audio");
					var aud = new Audio(path + "/MOREINFO.png");
					aud.play();
					oView.byId("SearchArt").setValue("");
					MessageBox.show(response.EMessage, MessageBox.Icon.ERROR);
				} else {
					var newArray = response.results;
					var lines = newArray.length;
					var sum = 0;
					for (var i = 0; i < response.results.length; i++) {
						if (i < response.results.length) {
							sum = parseInt(response.results[i].Qty) + sum;
						}
					}
					var model2 = new JSONModel({
						"Sum": sum,
						"Products": lines
					});
					oView.setModel(model2, "Model2");
					if (lines > 0) {
						var oArticle = oView.byId("TOOL_BAR");
						oArticle.setVisible(true);
						oView.byId("table1").setVisible(true);
						oView.byId("clear").setVisible(true);
						if (lines > 8) {
							oView.byId("Scroll").setVisible(true);
						}
					}
					var model = new JSONModel({
						"items": newArray
					});
					model.setSizeLimit(100);
					oView.setModel(model, "itemModel");
					jQuery.sap.delayedCall(500, this, function() {
						oView.byId("SearchArt").focus();
					});
				}

			}, function(error) {
				BusyIndicator.hide();
				MessageBox.error(JSON.parse(error.response.body).error.message.value, {
					title: "Error"
				});
			});
			var aSelectionModes = [];
			jQuery.each(SelectionMode, function(k, v) {
				if (k !== SelectionMode.Multi) {
					aSelectionModes.push({
						key: k,
						text: v
					});
				}
			});
			var aSelectionBehaviors = [];
			jQuery.each(SelectionBehavior, function(k, v) {
				aSelectionBehaviors.push({
					key: k,
					text: v
				});
			});
			var oModel = new JSONModel({
				"selectionitems": aSelectionModes,
				"behavioritems": aSelectionBehaviors
			});
			oView.setModel(oModel, "selectionmodel");
		}
	});
});