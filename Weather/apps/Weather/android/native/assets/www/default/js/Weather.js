
/* JavaScript content from js/Weather.js in folder common */
/*
* Licensed Materials - Property of IBM
* 5725-G92 (C) Copyright IBM Corp. 2006, 2012. All Rights Reserved.
* US Government Users Restricted Rights - Use, duplication or
* disclosure restricted by GSA ADP Schedule Contract with IBM Corp.
*/

// Worklight comes with the jQuery 1.8.1 framework bundled inside. If you do not want to use it, please comment out the line below.
window.$ = window.jQuery = WLJQ;

function wlCommonInit(){
	require([ "dojo/core-web-layer", "dojo/mobile-ui-layer",
			"dojo/mobile-compat-layer" ], dojoInit);

	/*
	 * Application is started in offline mode as defined by a connectOnStartup property in initOptions.js file.
	 * In order to begin communicating with Worklight Server you need to either:
	 * 
	 * 1. Change connectOnStartup property in initOptions.js to true. 
	 *    This will make Worklight framework automatically attempt to connect to Worklight Server as a part of application start-up.
	 *    Keep in mind - this may increase application start-up time.
	 *    
	 * 2. Use WL.Client.connect() API once connectivity to a Worklight Server is required. 
	 *    This API needs to be called only once, before any other WL.Client methods that communicate with the Worklight Server.
	 *    Don't forget to specify and implement onSuccess and onFailure callback functions for WL.Client.connect(), e.g:
	 *    
	 *    WL.Client.connect({
	 *    		onSuccess: onConnectSuccess,
	 *    		onFailure: onConnectFailure
	 *    });
	 *     
	 */
	
	
	// Common initialization code goes here

}

function dojoInit() {
	require([ "dojo", "dojo/parser", "dojox/mobile", "dojox/mobile/compat", "dojox/mobile/deviceTheme", "dojox/mobile/ScrollableView", "dojox/mobile/EdgeToEdgeList", "dojox/mobile/ListItem", "dojox/mobile/Button","dijit/registry", "dijit/form/DataList", "dojox/mobile/ComboBox" ],
			function(dojo) {
				dojo.ready(function() {
				});
			});
}

function getWeatherInfo(){
	alert("XUZ");
	var dataList=dijit.registry.byId('dataListId');
	var selectedItemName=dijit.registry.byId('location').value;
	var selectedItems=dataList.query({name:selectedItemName});
	var selectedItem=selectedItems[0];
	var selectedItemValue=selectedItem.value;
	
	var urlStr="http://weather.yahooapis.com/forecastrss?u=c&w="+selectedItemValue;
	
	dojo.xhrGet({
		url :urlStr,
		handleAs : "xml",
		load : function(response, ioArgs) {
			var item=response.getElementsByTagName('item').item(0);
			var description = item.getElementsByTagName('description').item(0).firstChild.data;
			document.getElementById("weatherResult").innerHTML=description;
		},
		error : function(response, ioArgs) {
			alert("error="+response+" ioArgs"+ioArgs);
		}
	});
		
};

/* JavaScript content from js/Weather.js in folder android */
/*
 *  Licensed Materials - Property of IBM
 *  5725-G92 (C) Copyright IBM Corp. 2011, 2012. All Rights Reserved.
 *  US Government Users Restricted Rights - Use, duplication or
 *  disclosure restricted by GSA ADP Schedule Contract with IBM Corp.
 */

// This method is invoked after loading the main HTML and successful initialization of the Worklight runtime.
function wlEnvInit(){
    wlCommonInit();
    // Environment initialization code goes here
}