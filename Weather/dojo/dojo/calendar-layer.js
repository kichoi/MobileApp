require({cache:{
'url:dojox/calendar/templates/LabelRenderer.html':"<div class=\"dojoxCalendarEvent dojoxCalendarLabel\" onselectstart=\"return false;\">\t\n\t<div class=\"labels\">\n\t\t<span data-dojo-attach-point=\"startTimeLabel\" class=\"startTime\"></span>\n\t\t<span data-dojo-attach-point=\"summaryLabel\" class=\"summary\"></span>\n\t\t<span data-dojo-attach-point=\"endTimeLabel\" class=\"endTime\"></span>\n\t</div>\t\n\t<div data-dojo-attach-point=\"moveHandle\" class=\"handle moveHandle\" ></div>\n</div>\n",
'dojox/calendar/MatrixView':function(){
require({cache:{
'url:dojox/calendar/templates/MatrixView.html':"<div data-dojo-attach-events=\"keydown:_onKeyDown\">\n\t<div  class=\"dojoxCalendarYearColumnHeader\" data-dojo-attach-point=\"yearColumnHeader\">\n\t\t<table><tr><td><span data-dojo-attach-point=\"yearColumnHeaderContent\"></span></td></tr></table>\t\t\n\t</div>\t\n\t<div data-dojo-attach-point=\"columnHeader\" class=\"dojoxCalendarColumnHeader\">\n\t\t<table data-dojo-attach-point=\"columnHeaderTable\" class=\"dojoxCalendarColumnHeaderTable\" cellpadding=\"0\" cellspacing=\"0\"></table>\n\t</div>\t\t\n\t<div dojoAttachPoint=\"rowHeader\" class=\"dojoxCalendarRowHeader\">\n\t\t<table data-dojo-attach-point=\"rowHeaderTable\" class=\"dojoxCalendarRowHeaderTable\" cellpadding=\"0\" cellspacing=\"0\"></table>\n\t</div>\t\n\t<div dojoAttachPoint=\"grid\" class=\"dojoxCalendarGrid\">\n\t\t<table data-dojo-attach-point=\"gridTable\" class=\"dojoxCalendarGridTable\" cellpadding=\"0\" cellspacing=\"0\"></table>\n\t</div>\t\n\t<div data-dojo-attach-point=\"itemContainer\" class=\"dojoxCalendarContainer\" data-dojo-attach-event=\"mousedown:_onGridMouseDown,mouseup:_onGridMouseUp,ondblclick:_onGridDoubleClick,touchstart:_onGridTouchStart,touchmove:_onGridTouchMove,touchend:_onGridTouchEnd\">\n\t\t<table data-dojo-attach-point=\"itemContainerTable\" class=\"dojoxCalendarContainerTable\" cellpadding=\"0\" cellspacing=\"0\" style=\"width:100%\"></table>\n\t</div>\t\n</div>\n"}});
define("dojox/calendar/MatrixView", [
"dojo/_base/declare", 
"dojo/_base/array", 
"dojo/_base/event", 
"dojo/_base/lang", 
"dojo/_base/sniff", 
"dojo/_base/fx", 
"dojo/_base/html",
"dojo/on", 
"dojo/dom", 
"dojo/dom-class", 
"dojo/dom-style",
"dojo/dom-geometry", 
"dojo/dom-construct", 
"dojo/query", 
"dojox/html/metrics", 
"dojo/i18n",
"./ViewBase", 
"dojo/text!./templates/MatrixView.html", 
"dijit/_TemplatedMixin"],
	
function(
	declare, 
	arr, 
	event, 
	lang, 
	has, 
	fx, 
	html,
	on, 
	dom, 
	domClass, 
	domStyle,
	domGeometry,
	domConstruct, 
	query, 
	metrics, 
	i18n,
	ViewBase, 
	template, 
	_TemplatedMixin){
	
	/*=====
	var __HeaderClickEventArgs = {
		// summary:
		//		A column click event.
		// index: Integer
		//		The column index. 
		// date: Date
		//		The date displayed by the column.
		// triggerEvent: Event
		//		The origin event.
	};
	=====*/
	
	return declare("dojox.calendar.MatrixView", [ViewBase, _TemplatedMixin], {
		
		// summary:
		//		The matrix view is a calendar view that displaying a matrix where each cell is a day.

		templateString: template,
	
		baseClass: "dojoxCalendarMatrixView",
		
		_setTabIndexAttr: "domNode",
		
		// viewKind: String
		//		Type of the view. Used by the calendar widget to determine how to configure the view.
		//		This view kind is "matrix".
		viewKind: "matrix",

		// renderData: Object
		//		The render data object contains all the data needed to render the widget.
		renderData: null,
		
		// startDate: Date
		//		The start date of the time interval displayed.
		//		If not set at initialization time, will be set to current day.
		startDate: null,
		
		// refStartTime: Date?
		//		(Optional) Start of the time interval of interest. 
		//		It is used to style differently the displayed rows out of the 
		//		time interval of interest.  		
		refStartTime: null,
		
		// refStartTime: Date?
		//		(Optional) End of the time interval of interest. 
		//		It is used to style differently the displayed rows out of the 
		//		time interval of interest.  
		refEndTime: null,
				
		// columnCount: Integer
		//		The number of column to display (from the startDate).
		columnCount: 7,
		
		// rowCount: Integer
		//		The number of rows to display (from the startDate).
		rowCount: 5,
			
		// horizontalRenderer: Class
		//		The class use to create horizontal renderers.
		horizontalRenderer: null,
		
		// labelRenderer: Class
		//		The class use to create label renderers.
		labelRenderer: null,

		// expandRenderer: Class
		//		The class use to create drill down renderers.		
		expandRenderer: null,
		
		// percentOverlap: Integer
		//		The percentage of the renderer width used to superimpose one item renderers on another 
		//		when two events are overlapping. By default 0.
		percentOverlap: 0,
		
		// verticalGap: Integer
		//		The number of pixels between two item renderers that are overlapping each other if the percentOverlap property is 0.
		verticalGap: 2,
		
		// horizontalRendererHeight: Integer
		//		The height in pixels of the horizontal and label renderers that is applied by the layout.
		horizontalRendererHeight: 17,
		
		// horizontalRendererHeight: Integer
		//		The height in pixels of the horizontal and label renderers that is applied by the layout.
		labelRendererHeight: 14,
		
		// expandRendererHeight: Integer
		//		The height in pixels of the expand/collapse renderers that is applied by the layout.
		expandRendererHeight: 15,
		
		// cellPaddingTop: Integer
		//		The top offset in pixels of each cell applied by the layout.
		cellPaddingTop: 16,
		
		// expandDuration: Integer
		//		Duration of the animation when expanding or collapsing a row.
		expandDuration: 300,
		
		// expandEasing: Function
		//		Easing function of the animation when expanding or collapsing a row (null by default).
		expandEasing: null,
		
		// layoutDuringResize: Boolean
		//		Indicates if the item renderers' position and size is updated or if they are hidden during a resize of the widget. 
		layoutDuringResize: false,
		
		// roundToDay: Boolean
		//		For horizontal renderers that are not filling entire days, whether fill the day or not.
		roundToDay: true,
		
		// showCellLabel: Boolean
		//		Whether display or not the grid cells label (usually the day of month).
		showCellLabel: true,
		
		// scrollable: [private] Boolean
		scrollable: false,

		// resizeCursor: [private] Boolean
		resizeCursor: "e-resize",
		
		constructor: function(){
			this.invalidatingProperties = ["columnCount", "rowCount", "startDate", "horizontalRenderer", "labelRenderer", "expandRenderer",
			"rowHeaderDatePattern", "columnHeaderLabelLength", "cellHeaderShortPattern", "cellHeaderLongPattern", "percentOverlap", 
			"verticalGap", "horizontalRendererHeight", "labelRendererHeight", "expandRendererHeight", "cellPaddingTop", 
			"roundToDay", "itemToRendererKindFunc", "layoutPriorityFunction", "formatItemTimeFunc", "textDir", "items"];
			
			this._ddRendererList = [];
			this._ddRendererPool = [];
			this._rowHeaderHandles = [];
			
			// For Dojo 1.8
			//	this._viewHandles.push(
			//		ViewPort.on("resize", lang.hitch(this, this._resizeHandler)));
			
			// pre 1.8 compat code
			this._viewHandles.push(on(window, "resize", lang.hitch(this, this._resizeHandler)));
			
		},
		
		destroy: function(preserveDom){
			this._cleanupRowHeader();
			this.inherited(arguments);
		},
			
		postCreate: function(){
			this.inherited(arguments);
			this._initialized = true;
			if(!this.invalidRendering){
				this.refreshRendering();
			}			
		},
						
		_createRenderData: function(){
			
			var rd = {};
			
			rd.dateLocaleModule = this.dateLocaleModule;
			rd.dateClassObj = this.dateClassObj;
			rd.dateModule = this.dateModule; // arithmetics on Dates
			
			rd.dates = [];
			
			rd.columnCount = this.get("columnCount");
			rd.rowCount = this.get("rowCount");
			
			rd.sheetHeight = this.itemContainer.offsetHeight;
			
			this._computeRowsHeight(rd);
			
			var d = this.get("startDate");
		
			if(d == null){
				d = new rd.dateClassObj();				
			}

			d = this.floorToDay(d, false, rd);
			
			this.startDate = d;					
			
			for(var row = 0; row < rd.rowCount ; row++){
				rd.dates.push([]);
				for(var col = 0; col < rd.columnCount ; col++){
					rd.dates[row].push(d);
					d = rd.dateModule.add(d, "day", 1);
					d = this.floorToDay(d, false, rd);					
				}
			}

			rd.startTime = this.newDate(rd.dates[0][0], rd);
			rd.endTime = this.newDate(rd.dates[rd.rowCount-1][rd.columnCount-1], rd);
			rd.endTime = rd.dateModule.add(rd.endTime, "day", 1);
			rd.endTime = this.floorToDay(rd.endTime, true);
			
			if(this.displayedItemsInvalidated){
				this.displayedItemsInvalidated = false;
				this._computeVisibleItems(rd);
				
				if(this._isEditing){
					this._endItemEditing(null, false);
				}
				
			}else if(this.renderData){
				rd.items = this.renderData.items;
			}
			
			rd.rtl = !this.isLeftToRight();
			
			return rd;
		},
				
		_validateProperties: function(){
			
			this.inherited(arguments);
						
			if(this.columnCount<1 || isNaN(this.columnCount)){
				this.columnCount = 1;
			}
			
			if(this.rowCount<1 || isNaN(this.rowCount)){
				this.rowCount = 1;
			}
			
			if(isNaN(this.percentOverlap) || this.percentOverlap < 0 || this.percentOverlap > 100){
				this.percentOverlap = 0;
			}
			
			if(isNaN(this.verticalGap) || this.verticalGap < 0){
				this.verticalGap = 2;
			}
			
			if(isNaN(this.horizontalRendererHeight) || this.horizontalRendererHeight < 1){
				this.horizontalRendererHeight = 17;
			}
			
			if(isNaN(this.labelRendererHeight) || this.labelRendererHeight < 1){
				this.labelRendererHeight = 14;
			}
			
			if(isNaN(this.expandRendererHeight) || this.expandRendererHeight < 1){
				this.expandRendererHeight = 15;
			}
		
		},
		
		_setStartDateAttr: function(value){
			this.displayedItemsInvalidated = true;
			this._set("startDate", value);
		},
		
		_setColumnCountAttr: function(value){
			this.displayedItemsInvalidated = true;
			this._set("columnCount", value);
		},
		
		_setRowCountAttr: function(value){
			this.displayedItemsInvalidated = true;
			this._set("rowCount", value);
		},
		
		__fixEvt:function(e){
			e.sheet = "primary";
			e.source = this;
			return e;
		},

		//////////////////////////////////////////
		//
		// Formatting functions
		//
		//////////////////////////////////////////

		_formatRowHeaderLabel: function(/*Date*/d){
			// summary:
			//		Computes the row header label for the specified time of day.
			//		By default the getWeekNumberLabel() function is called. 
			//		The rowHeaderDatePattern property can be used to set a 
			//		custom date pattern to the formatter.
			// d: Date
			//		The date to format	
			// tags:
			//		protected

			if(this.rowHeaderDatePattern){
				return this.renderData.dateLocaleModule.format(d, {
					selector: 'date',
					datePattern: this.rowHeaderDatePattern
				});
			}else{
				return this.getWeekNumberLabel(d);
			}

		},
	
		_formatColumnHeaderLabel: function(d){
			// summary:
			//		Computes the column header label for the specified date.
			//		By default a formatter is used, optionally the <code>columnHeaderLabelLength</code> 
			//		property can be used to specify the length of the string.
			// d: Date
			//		The date to format 
			// tags:
			//		protected

			return this.renderData.dateLocaleModule.getNames('days', this.columnHeaderLabelLength ? this.columnHeaderLabelLength : 'wide', 'standAlone')[d.getDay()];
		},
		
		_formatGridCellLabel: function(d, row, col){
			// summary:
			//		Computes the column header label for the specified date.
			//		By default a formatter is used, optionally the <code>cellHeaderLongPattern</code> and <code>cellHeaderShortPattern</code> 
			//		properties can be used to set a custom date pattern to the formatter.
			// d: Date
			//		The date to format.
			// row: Integer
			//		The row that displays the current date.
			// col: Integer
			//		The column that displays the current date.
			// tags:
			//		protected


			var isFirstDayOfMonth = row == 0 && col == 0 || d.getDate() == 1;
			var format, rb;
			if(isFirstDayOfMonth){
				if(this.cellHeaderLongPattern){
					format = this.cellHeaderLongPattern;
				}else{
					rb = i18n.getLocalization("dojo.cldr", this._calendar);
					format = rb["dateFormatItem-MMMd"];
				}
			}else{
				if(this.cellHeaderShortPattern){
					format = this.cellHeaderShortPattern;
				}else{
					rb = i18n.getLocalization("dojo.cldr", this._calendar);
					format = rb["dateFormatItem-d"];
				}
			}
			return this.renderData.dateLocaleModule.format(d, {
				selector: 'date',
				datePattern: format
			});
		},
		
		////////////////////////////////////////////
		//
		// HTML structure management
		//
		///////////////////////////////////////////
	
		refreshRendering: function(){
			this.inherited(arguments);
			
			if(!this.domNode){
				return;
			}
						
			this._validateProperties();

			var oldRd = this.renderData;
			this.renderData = this._createRenderData();

			this._createRendering(this.renderData, oldRd);
			
			this._layoutRenderers(this.renderData);						
		},
		
		_createRendering: function(renderData, oldRenderData){
			// summary:
			//		Creates the HTML structure (grid, place holders, headers, etc)
			// renderData: Object
			//		The new render data
			// oldRenderData: Object
			//		The previous render data
			// tags:
			//		private
			
			if(renderData.rowHeight <= 0){
				renderData.columnCount = 0;
				renderData.rowCount = 0;
				return;
			}
			
			this._buildColumnHeader(renderData, oldRenderData);
			this._buildRowHeader(renderData, oldRenderData);
			this._buildGrid(renderData, oldRenderData);
			this._buildItemContainer(renderData, oldRenderData);
			
			if(this.buttonContainer && this.owner != null && this.owner.currentView == this){
				domStyle.set(this.buttonContainer, {"right":0, "left":0});
			}
		},	
		
		_buildColumnHeader: function(/*Object*/ renderData, /*Object*/oldRenderData){
			// summary:
			//		Creates incrementally the HTML structure of the column header and configures its content.
			//
			// renderData:
			//		The render data to display.
			//
			// oldRenderData:
			//		The previously render data displayed, if any.
			// tags:
			//		private
			var table = this.columnHeaderTable;
			
			if(!table){
				return;
			}	
						
			var count = renderData.columnCount - (oldRenderData ? oldRenderData.columnCount : 0);
			
			if(has("ie") == 8){
				// workaround Internet Explorer 8 bug.
				// if on the table, width: 100% and table-layout: fixed are set
				// and columns are removed, width of remaining columns is not 
				// recomputed: must rebuild all. 
				if(this._colTableSave == null){
					this._colTableSave = lang.clone(table);
				}else if(count < 0){
					this.columnHeader.removeChild(table);
					domConstruct.destroy(table);
					table = lang.clone(this._colTableSave);
					this.columnHeaderTable = table;
					this.columnHeader.appendChild(table);
					count = renderData.columnCount;
				}
				
			} // else incremental dom add/remove for real browsers.
		
			var tbodies = query("tbody", table);
			var trs = query("tr", table);
			var tbody, tr, td;
			
			if(tbodies.length == 1){
				tbody = tbodies[0];
			}else{ 
				tbody = html.create("tbody", null, table);
			}
			
			if(trs.length == 1){
				tr = trs[0];
			}else{ 
				tr = domConstruct.create("tr", null, tbody);
			}			
						 
			// Build HTML structure (incremental)
			if(count > 0){ // creation				
				for(var i=0; i < count; i++){
					td = domConstruct.create("td", null, tr);
				}
			}else{ // deletion
				count = -count;
				for(var i=0; i < count; i++){
					tr.removeChild(tr.lastChild);
				}
			}
			
			// fill & configure		
			query("td", table).forEach(function(td, i){
				td.className = "";
				var d = renderData.dates[0][i];
				this._setText(td, this._formatColumnHeaderLabel(d));
				if(i == 0){
					domClass.add(td, "first-child");
				}else if(i == this.renderData.columnCount-1){
					domClass.add(td, "last-child");
				}
				this.styleColumnHeaderCell(td, d, renderData);
			}, this);
			
			if(this.yearColumnHeaderContent){
				var d = renderData.dates[0][0];
					this._setText(this.yearColumnHeaderContent, renderData.dateLocaleModule.format(d,
						{selector: "date", datePattern:"yyyy"}));
			}
		},
		
		styleColumnHeaderCell: function(node, date, renderData){
			// summary:
			//		Styles the CSS classes to the node that displays a column header cell.
			//		By default this method is setting the "dojoxCalendarWeekend" if the day of week represents a weekend.
			// node: Node
			//		The DOM node that displays the column in the grid.
			// date: Date
			//		The date displayed by this column
			// renderData: Object			
			//		The render data.
			// tags:
			//		protected

			if(this.isWeekEnd(date)){
				return domClass.add(node, "dojoxCalendarWeekend");
			}	
		},		
		
		_rowHeaderHandles: null,
		
		_cleanupRowHeader: function(){
			// tags:
			//		private

			while(this._rowHeaderHandles.length > 0){
				var list = this._rowHeaderHandles.pop();
				while(list.length>0){
					list.pop().remove();
				}
			}
		},

		
		_rowHeaderClick: function(e){
			// tags:
			//		private

			var index = query("td", this.rowHeaderTable).indexOf(e.currentTarget);
			this._onRowHeaderClick({
				index: index,
				date: this.renderData.dates[index][0],
				triggerEvent: e
			});
		},
		 
		_buildRowHeader: function(renderData, oldRenderData){
			
			// summary:
			//		Creates incrementally the HTML structure of the row header and configures its content.			
			//
			// renderData:
			//		The render data to display.
			//
			// oldRenderData:
			//		The previously render data displayed, if any.
			// tags:
			//		private
			
			var rowHeaderTable = this.rowHeaderTable;
			
			if(!rowHeaderTable){
				return;
			}

			var tbodies = query("tbody", rowHeaderTable);			
			var tbody, tr, td;
			
			if(tbodies.length == 1){
				tbody = tbodies[0];
			}else{ 
				tbody = domConstruct.create("tbody", null, rowHeaderTable);
			}				
						
			var count = renderData.rowCount - (oldRenderData ? oldRenderData.rowCount : 0);
			
			// Build HTML structure
			if(count>0){ // creation
				for(var i=0; i < count; i++){
					tr = domConstruct.create("tr", null, tbody);
					td = domConstruct.create("td", null, tr);
					
					var h = [];
						
					h.push(on(td, "click", lang.hitch(this, this._rowHeaderClick)));
					
					if(!has("touch")){
						h.push(on(td, "mousedown", function(e){
							domClass.add(e.currentTarget, "Active");
						}));
						
						h.push(on(td, "mouseup", function(e){
							domClass.remove(e.currentTarget, "Active");
						}));
						
						h.push(on(td, "mouseover", function(e){
							domClass.add(e.currentTarget, "Hover");
						}));
						
						h.push(on(td, "mouseout", function(e){
							domClass.remove(e.currentTarget, "Hover");
						}));
					}
					this._rowHeaderHandles.push(h);
				}
			}else{
				count = -count;
				// deletion of existing nodes
				for(var i=0; i < count; i++){
					tbody.removeChild(tbody.lastChild);
					var list = this._rowHeaderHandles.pop();
					while(list.length>0){
						list.pop().remove();
					}
				}
			}

			// fill labels

			query("tr", rowHeaderTable).forEach(function(tr, i){

				domStyle.set(tr, "height", this._getRowHeight(i) + "px");
				
				var d = renderData.dates[i][0];
				
				var td = query("td", tr)[0];
				td.className = "";
				if(i == 0){
					domClass.add(td, "first-child");
				}	
				if(i == this.renderData.rowCount-1){
					domClass.add(td, "last-child");
				}
								
				this.styleRowHeaderCell(td, d, renderData);

				this._setText(td, this._formatRowHeaderLabel(d));
			}, this);

		},		
		
		styleRowHeaderCell: function(node, date, renderData){
			// summary:
			//		Styles the CSS classes to the node that displays a row header cell.
			//		By default this method is doing nothing.
			// node: Node
			//		The DOM node that displays the column in the grid.
			// date: Date
			//		The date in the week.
			// renderData: Object
			//		The render data.
			// tags:
			//		protected

				
		},
	
		_buildGrid: function (renderData, oldRenderData){
			// summary:
			//		Creates incrementally the HTML structure of the grid and configures its content.
			//
			// renderData:
			//		The render data to display.
			//
			// oldRenderData:
			//		The previously render data displayed, if any.
			// tags:
			//		private

			var table = this.gridTable;
			
			if(!table){
				return;
			}

			var rowDiff = renderData.rowCount - (oldRenderData ? oldRenderData.rowCount : 0);
			var addRows = rowDiff > 0;
			
			var colDiff  = renderData.columnCount - (oldRenderData ? oldRenderData.columnCount : 0);
			
			if(has("ie") == 8){
				// workaround Internet Explorer 8 bug.
				// if on the table, width: 100% and table-layout: fixed are set
				// and columns are removed, width of remaining columns is not 
				// recomputed: must rebuild all. 
				if(this._gridTableSave == null){
					this._gridTableSave = lang.clone(table);
				}else if(colDiff < 0){					
					this.grid.removeChild(table);
					domConstruct.destroy(table);
					table = lang.clone(this._gridTableSave);
					this.gridTable = table;
					this.grid.appendChild(table);
					colDiff = renderData.columnCount;
					rowDiff = renderData.rowCount;
					addRows = true;
				}				
			}
			
			var tbodies = query("tbody", table);
			var tbody;

			if(tbodies.length == 1){
				tbody = tbodies[0];
			}else{ 
				tbody = domConstruct.create("tbody", null, table);
			}

			// Build rows HTML structure (incremental)
			if(addRows){ // creation
				for(var i=0; i<rowDiff; i++){
					domConstruct.create("tr", null, tbody);
				}		 
			}else{ // deletion		 
				rowDiff = -rowDiff;
				for(var i=0; i<rowDiff; i++){
					tbody.removeChild(tbody.lastChild);
				}
			}

			var rowIndex = renderData.rowCount - rowDiff;
			
			var addCols = addRows || colDiff >0; 
			colDiff = addCols ? colDiff : -colDiff;
			
			query("tr", table).forEach(function(tr, i){
				
				if(addCols){ // creation
					var len = i >= rowIndex ? renderData.columnCount : colDiff;
					for(var i=0; i<len; i++){
						var td = domConstruct.create("td", null, tr);
						domConstruct.create("span", null, td);
					}
				}else{ // deletion
					for(var i=0; i<colDiff; i++){
						tr.removeChild(tr.lastChild);
					}
				}
			});

			// Set the CSS classes

			query("tr", table).forEach(function (tr, row){
				
				domStyle.set(tr, "height", this._getRowHeight(row) + "px");
				
				tr.className = "";
				// compatibility layer for IE7 & 8 that does not support :first-child and :last-child pseudo selectors
				if(row == 0){
					domClass.add(tr, "first-child");
				}
				if(row == renderData.rowCount-1){
					domClass.add(tr, "last-child");
				}

				query("td", tr).forEach(function (td, col){
					
					td.className = "";
					
					if(col == 0){
						domClass.add(td, "first-child");
					}
					
					if(col == renderData.columnCount-1){
						domClass.add(td, "last-child");
					}
					
					var d = renderData.dates[row][col];
					
					var span = query("span", td)[0];
					this._setText(span, this.showCellLabel ? this._formatGridCellLabel(d, row, col): null);
					
					this.styleGridCell(td, d, renderData);
				}, this);
			}, this); 

		},
		
		styleGridCell: function(node, date, renderData){
			// summary:
			//		Styles the CSS classes to the node that displays a column.
			//		By default this method is setting the following CSS classes:
			//		- "dojoxCalendarToday" class name if the date displayed is the current date, 
			//		- "dojoxCalendarWeekend" if the date represents a weekend or
			//		- "dojoxCalendarDayDisabled" if the date is out of the [refStartTime, refEndTime] interval.
			// node: Node
			//		The DOM node that displays the column in the grid.
			// date: Date
			//		The date displayed by this column
			// renderData: Object
			//		The render data.
			// tags:
			//		protected

			var cal = renderData.dateModule;
			if(this.isToday(date)){				
				domClass.add(node, "dojoxCalendarToday");
			}else if(this.refStartTime != null && this.refEndTime != null && 
								(cal.compare(date, this.refEndTime) >= 0 || 
				 				 cal.compare(cal.add(date, "day", 1), this.refStartTime) <= 0)){
				domClass.add(node, "dojoxCalendarDayDisabled");
			}else if(this.isWeekEnd(date)){
				domClass.add(node, "dojoxCalendarWeekend");
			}	
		},

		_buildItemContainer: function(renderData, oldRenderData){
			// summary:
			//		Creates the HTML structure of the item container and configures its content.
			//
			// renderData:
			//		The render data to display.
			//
			// oldRenderData:
			//		The previously render data displayed, if any.
			// tags:
			//		private
			
			var table = this.itemContainerTable;
			
			if(!table){
				return;
			}
			
			var rows = [];
	
			var count = renderData.rowCount - (oldRenderData ? oldRenderData.rowCount : 0);
			
			if(has("ie") == 8){
				// workaround Internet Explorer 8 bug.
				// if on the table, width: 100% and table-layout: fixed are set
				// and columns are removed, width of remaining columns is not 
				// recomputed: must rebuild all. 
				if(this._itemTableSave == null){
					this._itemTableSave = lang.clone(table);
				}else if(count < 0){
					this.itemContainer.removeChild(table);
					this._recycleItemRenderers(true);
					this._recycleExpandRenderers(true);
					domConstruct.destroy(table);
					table = lang.clone(this._itemTableSave);
					this.itemContainerTable = table;
					this.itemContainer.appendChild(table);
					count = renderData.columnCount;
				}
				
			} // else incremental dom add/remove for real browsers.
			
			var tbodies = query("tbody", table);
			var tbody, tr, td, div;
			
			if(tbodies.length == 1){
				tbody = tbodies[0];
			}else{ 
				tbody = domConstruct.create("tbody", null, table);
			}
			
			// Build HTML structure (incremental)
			if(count>0){ // creation
				for(var i=0; i < count; i++){
					tr = domConstruct.create("tr", null, tbody);
					domClass.add(tr, "dojoxCalendarItemContainerRow");
					td = domConstruct.create("td", null, tr);	
					div = domConstruct.create("div", null, td);
					domClass.add(div, "dojoxCalendarContainerRow");
				}
			}else{ // deletion		 
				count = -count;
				for(var i=0; i < count; i++){
					tbody.removeChild(tbody.lastChild);
				}
			}

			query(".dojoxCalendarItemContainerRow", table).forEach(function(tr, i){
				domStyle.set(tr, "height", this._getRowHeight(i) + "px");
				rows.push(tr.childNodes[0].childNodes[0]);
			}, this); 

			renderData.cells = rows;
		},

		_resizeHandler: function(e, apply){
			// summary:
			//		Refreshes and apply the row height according to the widget height.
			// e: Event
			//		The resize event (optional)
			// apply: Boolean
			//		Whether take into account the layoutDuringResize flag to relayout item while resizing or not.
			// tags:
			//		private

			var rd = this.renderData;
			
			if(rd == null){
				this.refreshRendering();
				return;
			}

			if(rd.sheetHeight != this.itemContainer.offsetHeight){
				// refresh values
				rd.sheetHeight = this.itemContainer.offsetHeight;
				var expRow = this.getExpandedRowIndex();
				if(expRow == -1){
					this._computeRowsHeight();
					this._resizeRows();
				}else{
					this.expandRow(rd.expandedRow, rd.expandedRowCol, 0, null, true);
				}
			}
			
			if(this.layoutDuringResize || apply){
				// Use a time for FF (at least). In FF the cell size and position info are not ready yet. 
				setTimeout(lang.hitch(this, function(){
					this._layoutRenderers(this.renderData);
				  }), 20);
								
			}else{
				domStyle.set(this.itemContainer, "opacity", 0);
				this._recycleItemRenderers();
				this._recycleExpandRenderers();
				if(this._resizeTimer != undefined){
					clearTimeout(this._resizeTimer);
				}
				this._resizeTimer = setTimeout(lang.hitch(this, function(){
					delete this._resizeTimer;
					this._resizeRowsImpl(this.itemContainer, "tr");
					this._layoutRenderers(this.renderData);
					if(this.resizeAnimationDuration == 0){
						domStyle.set(this.itemContainer, "opacity", 1);
					}else{
						fx.fadeIn({node:this.itemContainer, curve:[0, 1]}).play(this.resizeAnimationDuration);
					}					
				}), 200);
			}

		},
		
		// resizeAnimationDuration: Integer
		//		Duration, in milliseconds, of the fade animation showing the item renderers after a widget resize.
		resizeAnimationDuration: 0,
		
		/////////////////////////////////////////////
		//
		// Row height management
		//
		//////////////////////////////////////////////
		
		getExpandedRowIndex: function(){
			// summary:
			//		Returns the index of the expanded row or -1 if there's no row expanded.
			return this.renderData.expandedRow == null ? -1 : this.renderData.expandedRow;
		},
		
		collapseRow: function(duration, easing, apply){
			// summary:
			//		Collapses the expanded row, if any.
			// duration: Integer
			//		Duration in milliseconds of the optional animation.
			// easing: Function
			//		Easing function of the optional animation.
			
			var rd = this.renderData;
			
			if(apply == undefined){
				apply = true;
			}
			if(duration == undefined){
				duration = this.expandDuration;
			}
			
			if(rd && rd.expandedRow != null && rd.expandedRow != -1){
				if(apply && duration){
					var index = rd.expandedRow;
					var oldSize = rd.expandedRowHeight;
					delete rd.expandedRow;
					this._computeRowsHeight(rd);
					var size = this._getRowHeight(index);
					rd.expandedRow = index;
					
					this._recycleExpandRenderers();
					this._recycleItemRenderers();
					domStyle.set(this.itemContainer, "display", "none");
					
					this._expandAnimation = new fx.Animation({
						curve: [oldSize, size],
						duration: duration,
						easing: easing,
						onAnimate: lang.hitch(this, function(size) {
							this._expandRowImpl(Math.floor(size));
						}),
						onEnd: lang.hitch(this, function(size) {
							this._expandAnimation = null;
							this._collapseRowImpl(false);
							this._resizeRows();
							domStyle.set(this.itemContainer, "display", "block");
							setTimeout(lang.hitch(this, function(){								
								this._layoutRenderers(rd);								
							}), 100);
							this.onExpandAnimationEnd(false);
						}) 
					});
									
					this._expandAnimation.play();
				}else{
					this._collapseRowImpl(apply);
				}				
			}
		},
		
		_collapseRowImpl: function(apply){
			// tags:
			//		private

			var rd = this.renderData;
			delete rd.expandedRow;
			delete rd.expandedRowHeight;
			this._computeRowsHeight(rd);
			if(apply == undefined || apply){
				this._resizeRows();
				this._layoutRenderers(rd);
			}
		},
		
		expandRow: function(rowIndex, colIndex, duration, easing, apply){
			// summary:
			//		Expands the specified row.
			// rowIndex: Integer
			//		The index of the row to expand.
			// colIndex: Integer?
			//		The column index of the expand renderer that triggers the action, optional. 
			// duration: Integer?
			//		Duration in milliseconds of the optional animation.
			// easing: Function?
			//		Easing function of the optional animation.
			
			var rd = this.renderData;
			if(!rd || rowIndex < 0 || rowIndex >= rd.rowCount){
				return -1;
			}
			if(colIndex == undefined || colIndex < 0 || colIndex >= rd.columnCount){
				colIndex = -1; // ignore invalid values
			}
			if(apply == undefined){
				apply = true;
			}
			if(duration == undefined){
				duration = this.expandDuration;
			}
			if(easing == undefined){
				easing = this.expandEasing;
			}
			
			var oldSize = this._getRowHeight(rowIndex);
			var size = rd.sheetHeight - Math.ceil(this.cellPaddingTop * (rd.rowCount-1));

			rd.expandedRow = rowIndex;
			rd.expandedRowCol = colIndex;
			rd.expandedRowHeight = size;

			if(apply){
				if(duration){
					//debugger;
					this._recycleExpandRenderers();
					this._recycleItemRenderers();
					domStyle.set(this.itemContainer, "display", "none");
					
					this._expandAnimation = new fx.Animation({
						curve: [oldSize, size],
						duration: duration,
						delay:50,
						easing: easing,
						onAnimate: lang.hitch(this, function(size) {
							this._expandRowImpl(Math.floor(size));
						}),
						onEnd: lang.hitch(this, function(){
							this._expandAnimation = null;
							domStyle.set(this.itemContainer, "display", "block");
							setTimeout(lang.hitch(this, function(){
								this._expandRowImpl(size, true);
							}), 100);
							this.onExpandAnimationEnd(true);
						})
					});
					this._expandAnimation.play();
				}else{
					this._expandRowImpl(size)
				}
			}			
		},
		
		_expandRowImpl: function(size, layout){
			// tags:
			//		private

			var rd = this.renderData;
			rd.expandedRowHeight = size;
			this._computeRowsHeight(rd, rd.sheetHeight-size);
			this._resizeRows();
			if(layout){
				this._layoutRenderers(rd);
			}
		},
		
		onExpandAnimationEnd: function(expand){
			// summary:
			//		Event dispatched at the end of an expand or collapse animation.
			// expand: Boolean
			//		Whether the finished animation was an expand or a collapse animation.
			// tags:
			//		callback

		},
		
		_resizeRows: function(){
			// summary:
			//		Refreshes the height of the underlying HTML objects.
			// tags:
			//		private
			
			if(this._getRowHeight(0) <= 0){
				return;
			}
			
			if(this.rowHeaderTable){
				this._resizeRowsImpl(this.rowHeaderTable, "tr");
			}
			if(this.gridTable){
				this._resizeRowsImpl(this.gridTable, "tr");
			}
			if(this.itemContainerTable){
				this._resizeRowsImpl(this.itemContainerTable, "tr");
			}
		},
		
		_computeRowsHeight:function(renderData, max){
			// summary:
			//		1. Determine if it's better to add or remove pixels
			//		2. distribute added/removed pixels on first and last rows.
			//		if rows are not too small, it is not noticeable.
			// tags:
			//		private

			var rd = renderData == null ? this.renderData : renderData;
			
			max = max || rd.sheetHeight;
			
			max--;
			
			if(has("ie") == 7){
				max -= rd.rowCount;
			}
			
			if(rd.rowCount == 1){
				rd.rowHeight = max;
				rd.rowHeightFirst = max;
				rd.rowHeightLast = max;
				return;
			}
								
			var count = rd.expandedRow == null ? rd.rowCount : rd.rowCount-1;
			var rhx = max / count;
			var rhf, rhl, rh;
			
			var diffMin = max - (Math.floor(rhx) * count);
			var diffMax = Math.abs(max - (Math.ceil(rhx) * count));
			var diff;
			
			var sign = 1;
			if(diffMin < diffMax){
				rh = Math.floor(rhx);
				diff = diffMin;
			}else{
				sign = -1;
				rh = Math.ceil(rhx);
				diff = diffMax;
			}
			rhf = rh + sign * Math.floor(diff/2);
			rhl = rhf + sign * (diff%2);

			rd.rowHeight = rh;
			rd.rowHeightFirst = rhf;
			rd.rowHeightLast = rhl;
		},

		_getRowHeight: function(index){
			// tags:
			//		private

			var rd = this.renderData;
			if(index == rd.expandedRow){
				return rd.expandedRowHeight;
			} else if(rd.expandedRow == 0 && index == 1 || index == 0){
				return rd.rowHeightFirst;
			} else if(rd.expandedRow == this.renderData.rowCount-1 && 
								index == this.renderData.rowCount-2 || 
								index == this.renderData.rowCount-1){
				return rd.rowHeightLast;
			}else{
				return rd.rowHeight;
			}
		},

		_resizeRowsImpl: function(tableNode, query){
			// tags:
			//		private
			var rd = this.renderData;
			dojo.query(query, tableNode).forEach(function(tr, i){
				domStyle.set(tr, "height", this._getRowHeight(i)+"px");
			}, this);
		},

		////////////////////////////////////////////
		//
		// Item renderers
		//
		///////////////////////////////////////////
				
		_setHorizontalRendererAttr: function(value){
			this._destroyRenderersByKind("horizontal");
			this._set("horizontalRenderer", value);			
		},
		
		_setLabelRendererAttr: function(value){
			this._destroyRenderersByKind("label");			
			this._set("labelRenderer", value);
		},
		
		_destroyExpandRenderer: function(renderer){
			// summary: 
			//		Destroys the expand renderer.
			// renderer: dojox/calendar/_RendererMixin
			//		The item renderer to destroy.
			// tags:
			//		protected
			
			arr.forEach(renderer.__handles, function(handle){
				handle.remove();
			});				
			
			if(renderer["destroy"]){
				renderer.destroy();
			}
			
			html.destroy(renderer.domNode);	
		},
		
		_setExpandRendererAttr: function(value){
			while(this._ddRendererList.length>0){
				this._destroyExpandRenderer(this._ddRendererList.pop());
			}			
						
			var pool = this._ddRendererPool;
			if(pool){
				while(pool.length > 0){
					this._destroyExpandRenderer(pool.pop());
				}
			}							
			this._set("expandRenderer", value);
		},				
		
		_ddRendererList: null,
		_ddRendererPool: null,

		_getExpandRenderer: function(date, items, rowIndex, colIndex, expanded){
			// tags:
			//		private
			
			if(this.expandRenderer == null){
				return null;
			}
			
			var ir = this._ddRendererPool.pop();
			if(ir == null){
				ir = new this.expandRenderer();
			}
			
			this._ddRendererList.push(ir);
			
			ir.set("owner", this);
			ir.set("date", date);
			ir.set("items", items);
			ir.set("rowIndex", rowIndex);
			ir.set("columnIndex", colIndex);
			ir.set("expanded", expanded);
			return ir;
		},
		
		_recycleExpandRenderers: function(remove){
			// tags:
			//		private
			
			for(var i=0; i<this._ddRendererList.length; i++){
				var ir = this._ddRendererList[i];
				ir.set("Up", false);
				ir.set("Down", false);
				if(remove){
					ir.domNode.parentNode.removeChild(ir.domNode);
				}
				domStyle.set(ir.domNode, "display", "none");
			}
			this._ddRendererPool = this._ddRendererPool.concat(this._ddRendererList);
			this._ddRendererList = [];
		},

		_defaultItemToRendererKindFunc:function(item){
			// tags:
			//		private
			var dur = Math.abs(this.renderData.dateModule.difference(item.startTime, item.endTime, "minute"));
			return dur >= 1440 ? "horizontal" : "label";
		}, 
		
		////////////////////////////////////////////
		//
		// Layout
		//
		///////////////////////////////////////////
		
		// naturalRowHeight: Integer[]
		//		After an item layout has been done, contains for each row the natural height of the row. 
		//		Ie. the height, in pixels, needed to display all the item renderers. 
		naturalRowsHeight: null,
		
		_roundItemToDay: function(item){
			// tags:
			//		private
			
			var s = item.startTime, e = item.endTime;
			
			if(!this.isStartOfDay(s)){
				s = this.floorToDay(s, false, this.renderData);
			}
			if(!this.isStartOfDay(e)){
				e = this.renderData.dateModule.add(e, "day", 1);
				e = this.floorToDay(e, true);
			}
			return {startTime:s, endTime:e};
		},
		
		_sortItemsFunction: function(a, b){
			// tags:
			//		private
			
			if(this.roundToDay){
				a = this._roundItemToDay(a);
				b = this._roundItemToDay(b);
			}
			var res = this.dateModule.compare(a.startTime, b.startTime);
			if(res == 0){
				res = -1 * this.dateModule.compare(a.endTime, b.endTime);
			}
			return res;
		},
		
		_overlapLayoutPass3: function(lanes){
			// summary:
			//		Third pass of the overlap layout (optional). Compute the number of lanes used by sub interval.
			// lanes: Object[]
			//		The array of lanes.
			// tags:
			//		private

			var pos=0, posEnd=0;
			var res = [];
			
			var refPos = domGeometry.position(this.gridTable).x;
			
			for(var col=0; col<this.renderData.columnCount; col++){
				
				var stop = false;
				var colPos = domGeometry.position(this._getCellAt(0, col));
				pos = colPos.x - refPos;
				posEnd = pos + colPos.w;
				
				for(var lane=lanes.length-1; lane>=0 && !stop; lane--){
					for (var i=0; i<lanes[lane].length; i++){
						var item = lanes[lane][i];
						stop = item.start < posEnd && pos < item.end;
						if(stop){
							res[col] = lane + 1;
							break;
						}
					}
				}
				
				if(!stop){
					res[col] = 0;
				}
			}
			
			return res;
		},
		
		applyRendererZIndex: function(item, renderer, hovered, selected, edited, focused){
			// summary:
			//		Applies the z-index to the renderer based on the state of the item.
			//		This methods is setting a z-index of 20 is the item is selected or edited 
			//		and the current lane value computed by the overlap layout (i.e. the renderers 
			//		are stacked according to their lane).
			// item: Object
			//		The render item.
			// renderer: Object
			//		A renderer associated with the render item.
			// hovered: Boolean
			//		Whether the item is hovered or not.
			// selected: Boolean
			//		Whether the item is selected or not.
			// edited: Boolean
			//		Whether the item is being edited not not.
			// focused: Boolean
			//		Whether the item is focused not not.
			// tags:
			//		private
						
			domStyle.set(renderer.container, {"zIndex": edited || selected ? renderer.renderer.mobile ? 100 : 0: item.lane == undefined ? 1 : item.lane+1});
		},

		_layoutRenderers: function(renderData){
			// tags:
			//		private
			if(renderData == null || renderData.items == null || renderData.rowHeight <= 0){
				return;
			}					
			
			if(!this.gridTable || this._expandAnimation != null || 
				(this.horizontalRenderer == null && this.labelRenderer == null)){
				this._recycleItemRenderers();
				return;
			}
			
			this.renderData.gridTablePosX = domGeometry.position(this.gridTable).x;		
			this._layoutStep = renderData.columnCount;
			this._recycleExpandRenderers();
			this._hiddenItems = [];
			this._offsets = [];
			this.naturalRowsHeight = [];
			
			this.inherited(arguments);
		},

		_offsets: null,

		_layoutInterval: function(/*Object*/renderData, /*Integer*/index, /*Date*/start, /*Date*/end, /*Object[]*/items){
			// tags:
			//		private
			
			if(this.renderData.cells == null){
				return;
			}
			var horizontalItems = [];
			var labelItems = [];

			for(var i=0; i<items.length; i++){
				var item = items[i];
				var kind = this._itemToRendererKind(item);
				if(kind == "horizontal"){
					horizontalItems.push(item);
				}else if(kind == "label"){
					labelItems.push(item);
				}
			}
			
			var expIndex = this.getExpandedRowIndex();
			
			if(expIndex != -1 && expIndex != index){
				return; // when row is expanded, layout only expanded row
			}
			
			var offsets;
			
			var hiddenItems = [];
			
			var hItems;
			var hOffsets = [];
			if(horizontalItems.length > 0 && this.horizontalRenderer){
				var hItems = this._createHorizontalLayoutItems(index, start, end, horizontalItems);
				var hOverlapLayout = this._computeHorizontalOverlapLayout(hItems, hOffsets);
			}
			
			var lItems;
			var lOffsets = [];
			if(labelItems.length > 0 && this.labelRenderer){
				lItems = this._createLabelLayoutItems(index, start, end, labelItems);
				this._computeLabelOffsets(lItems, lOffsets);
			}
			
			var hasHiddenItems = this._computeColHasHiddenItems(index, hOffsets, lOffsets);
			
			if(hItems != null){
				this._layoutHorizontalItemsImpl(index, hItems, hOverlapLayout, hasHiddenItems, hiddenItems);
			}
			
			if(lItems != null){
				this._layoutLabelItemsImpl(index, lItems, hasHiddenItems, hiddenItems, hOffsets);
			}
			
			this._layoutExpandRenderers(index, hasHiddenItems, hiddenItems);
			
			this._hiddenItems[index] = hiddenItems;
		},

		_createHorizontalLayoutItems: function(/*Integer*/index, /*Date*/startTime, /*Date*/endTime, /*Object[]*/items){
			// tags:
			//		private
			
			if(this.horizontalRenderer == null){
				return;
			}

			var rd = this.renderData;
			var cal = rd.dateModule;
			var cell = rd.cells[index];
			var irHeight = this.horizontalRendererHeight;
			var vOverlap = this.percentOverlap / 100;
			var maxW = domGeometry.getMarginBox(this.itemContainer).w;
			var sign = rd.rtl ? -1 : 1;
			var layoutItems = [];

			// step 1: compute projected position and size
			for(var i = 0; i < items.length; i++){
				
				var item = items[i];
				var overlap = this.computeRangeOverlap(rd, item.startTime, item.endTime, startTime, endTime);
				
				var startOffset = cal.difference(startTime, this.floorToDay(overlap[0], false, rd), "day");
				var dayStart = rd.dates[index][startOffset];
				
				var celPos = domGeometry.position(this._getCellAt(index, startOffset, false));
				var start = celPos.x - rd.gridTablePosX;
				if(rd.rtl){
					start += celPos.w;
				}
				
				if(!this.roundToDay && !item.allDay){
					start += sign * this.computeProjectionOnDate(rd, dayStart, overlap[0], celPos.w);
				}
				
				start = Math.ceil(start);
				
				var endOffset = cal.difference(startTime, this.floorToDay(overlap[1], false, rd), "day");
				
				var end;
				if(endOffset > rd.columnCount-1){
					celPos = domGeometry.position(this._getCellAt(index, rd.columnCount-1, false));
					if(rd.rtl){
						end = celPos.x - rd.gridTablePosX;						
					}else{
						end = celPos.x - rd.gridTablePosX + celPos.w;
					}				
				}else{ 
					dayStart = rd.dates[index][endOffset];
					celPos = domGeometry.position(this._getCellAt(index, endOffset, false));
					end = celPos.x - rd.gridTablePosX;
					
					if(rd.rtl){
						end += celPos.w;
					}
					
					if(this.roundToDay){
						if(!this.isStartOfDay(overlap[1])){
							end += sign * celPos.w;
						}
					}else{
						end += sign * this.computeProjectionOnDate(rd, dayStart, overlap[1], celPos.w);
					}
				}
				
				end = Math.floor(end);
				
				if(rd.rtl){
					var t = end;
					end = start;
					start = t; 
				}
				
				if(end > start){ // invalid items are not displayed
					var litem = lang.mixin({
						start: start,
						end: end,
						range: overlap,
						item: item,
						startOffset: startOffset,
						endOffset: endOffset
					}, item);
					layoutItems.push(litem);
				}
			}
			return layoutItems;
		},
		
		_computeHorizontalOverlapLayout: function(layoutItems, offsets){
			// tags:
			//		private
			
			var rd = this.renderData;
			var irHeight = this.horizontalRendererHeight;
			var overlapLayoutRes = this.computeOverlapping(layoutItems, this._overlapLayoutPass3);
			var vOverlap = this.percentOverlap / 100;
		
			for(i=0; i<rd.columnCount; i++){
				var numLanes = overlapLayoutRes.addedPassRes[i];
				var index = rd.rtl ? rd.columnCount - i - 1 : i;				
				if(vOverlap == 0){
					offsets[index] = numLanes == 0 ? 0 : numLanes == 1 ? irHeight : irHeight + (numLanes-1) * (irHeight + this.verticalGap);
				}else{
					offsets[index] = numLanes == 0 ? 0 : numLanes * irHeight - (numLanes-1) * (vOverlap * irHeight) + this.verticalGap;
				}
				offsets[index] += this.cellPaddingTop;
			}
			return overlapLayoutRes;
		},
		
		_createLabelLayoutItems: function(/*Integer*/index, /*Date*/startTime, /*Date*/endTime, /*Object[]*/items){
			// tags:
			//		private
			
			if(this.labelRenderer == null){
				return;
			}
			
			var d;
			var rd = this.renderData;
			var cal = rd.dateModule;
			
			var layoutItems = [];
			
			for(var i = 0; i < items.length; i++){
				var item = items[i];
				
				d = this.floorToDay(item.startTime, false, rd);
								
				var comp = this.dateModule.compare;
				
				// iterate on columns overlapped by this item to create one item per column
				//while(d < item.endTime && d < rd.endTime){
				while(comp(d, item.endTime) == -1 && comp(d, endTime) == -1){
					
					var dayEnd = cal.add(d, "day", 1);
					dayEnd = this.floorToDay(dayEnd, true);
					
					var overlap = this.computeRangeOverlap(rd, item.startTime, item.endTime, d, dayEnd);
					var startOffset = cal.difference(startTime, this.floorToDay(overlap[0], false, rd), "day");
										
					if(startOffset >= this.columnCount){
						// If the offset is greater than the column count
						// the item will be processed in another row.
						break;
					}
					
					if(startOffset >= 0){					
						var list = layoutItems[startOffset];
						if(list == null){
							list = [];
							layoutItems[startOffset] = list;
						}
						
						list.push(lang.mixin(
							{	startOffset: startOffset,
								range: overlap,
								item: item
							}, item));
					}
					
					d = cal.add(d, "day", 1);
					this.floorToDay(d, true);
				}
			}
			return layoutItems;
		},

		_computeLabelOffsets: function(layoutItems, offsets){
			// tags:
			//		private
			
			for(var i=0; i<this.renderData.columnCount; i++){
				offsets[i] = layoutItems[i] == null ? 0 : layoutItems[i].length * (this.labelRendererHeight + this.verticalGap);
			}
		},			

		_computeColHasHiddenItems: function(index, hOffsets, lOffsets){
			// tags:
			//		private
			
			var res = [];
			var cellH = this._getRowHeight(index);
			var h;
			var maxH = 0;
			for(var i=0; i<this.renderData.columnCount; i++){
				h = hOffsets == null || hOffsets[i] == null ? this.cellPaddingTop : hOffsets[i];
				h += lOffsets == null || lOffsets[i] == null ? 0 : lOffsets[i];
				if(h > maxH){
					maxH = h;
				}
				res[i] = h > cellH;
			}
			
			this.naturalRowsHeight[index] = maxH;
			return res;
		},

		_layoutHorizontalItemsImpl: function(index, layoutItems, hOverlapLayout, hasHiddenItems, hiddenItems){
			
			// tags:
			//		private
			
			var rd = this.renderData;
			var cal = rd.dateModule;
			var cell = rd.cells[index];
			var cellH = this._getRowHeight(index);
			var irHeight = this.horizontalRendererHeight;
			var vOverlap = this.percentOverlap / 100;

			for(var i=0; i<layoutItems.length; i++){

				var item = layoutItems[i];
				var lane = item.lane;

				var posY = this.cellPaddingTop;

				if(vOverlap == 0) {
					//no overlap and a padding between each event
					posY += lane * (irHeight + this.verticalGap);
				} else {
					// an overlap	
					posY += lane * (irHeight - vOverlap * irHeight);
				}
				
				var exp = false;
				var maxH = cellH;
				if(this.expandRenderer){				
					for(var off=item.startOffset; off<=item.endOffset; off++){
						if(hasHiddenItems[off]){
							exp = true;
							break;
						}
					}
					maxH = exp ? cellH - this.expandRendererHeight : cellH;
				}
				
				if(posY + irHeight <= maxH){

					var ir = this._createRenderer(item, "horizontal", this.horizontalRenderer, "dojoxCalendarHorizontal");
	
					var fullHeight = this.isItemBeingEdited(item) && !this.liveLayout && this._isEditing;
					var h = fullHeight ? cellH - this.cellPaddingTop : irHeight;
					var w = item.end - item.start;
					if (has("ie") >= 9 && item.start + w < this.itemContainer.offsetWidth) {
						w++;
					};

					domStyle.set(ir.container, {
						"top": (fullHeight ? this.cellPaddingTop : posY) + "px",
						"left": item.start + "px",
						"width": w + "px",
						"height": h + "px"
					});

					this._applyRendererLayout(item, ir, cell, w, h, "horizontal");

				}else{
					// The items does not fit in view, fill hidden items per column
					for(var d=item.startOffset;d<item.endOffset;d++){
						if(hiddenItems[d] == null){
							hiddenItems[d] = [item.item];
						}else{
							hiddenItems[d].push(item.item);
						}
					}
				}
			}
		},
		
		_layoutLabelItemsImpl: function(index, layoutItems, hasHiddenItems, hiddenItems, hOffsets){
			// tags:
			//		private
			var d, list, posY;
			var rd = this.renderData;
			var cal = rd.dateModule;
			var cell = rd.cells[index];
			var cellH = this._getRowHeight(index);
			var irHeight = this.labelRendererHeight;
			var maxW = domGeometry.getMarginBox(this.itemContainer).w;

			for(var i=0; i<layoutItems.length; i++){
				list = layoutItems[i];
				
				if(list != null){
					
					var maxH = this.expandRenderer ? (hasHiddenItems[i] ? cellH - this.expandRendererHeight: cellH) : cellH;
					posY = hOffsets == null || hOffsets[i] == null ? this.cellPaddingTop : hOffsets[i] + this.verticalGap;
					var celPos = domGeometry.position(this._getCellAt(index, i));
					var dayStart = rd.dates[index][i];
					var left = celPos.x - rd.gridTablePosX;
					
					for(var j=0; j<list.length; j++){
						
						if(posY + irHeight + this.verticalGap <= maxH){
							var item = list[j];
							
							lang.mixin(item, {
								start: left,
								end: left + celPos.w
							});
							
							var ir = this._createRenderer(item, "label", this.labelRenderer, "dojoxCalendarLabel");
								
							var fullHeight = this.isItemBeingEdited(item) && !this.liveLayout && this._isEditing;
							var h = fullHeight ? this._getRowHeight(index) - this.cellPaddingTop : irHeight;
							
							if(rd.rtl){
								item.start = maxW - item.end;
								item.end = item.start + celPos.w;
							}
								 
							domStyle.set(ir.container, {
								"top": (fullHeight ? this.cellPaddingTop : posY) + "px",
								"left": item.start + "px",
								"width": celPos.w + "px",
								"height": h + "px"
							});
							
							this._applyRendererLayout(item, ir, cell, celPos.w, h, "label");
						
						}else{
							break;
						}
						posY += irHeight + this.verticalGap;
					}
					
					for(var j; j<list.length; j++){
						if(hiddenItems[i] == null){
							hiddenItems[i] = [list[j]];
						}else{
							hiddenItems[i].push(list[j]);
						}
					}
				}
			}
		},
		
		_applyRendererLayout: function(item, ir, cell, w, h, kind){
			// tags:
			//		private
			
			var edited = this.isItemBeingEdited(item);
			var selected = this.isItemSelected(item);
			var hovered = this.isItemHovered(item);
			var focused = this.isItemFocused(item);

			var renderer = ir.renderer;

			renderer.set("hovered", hovered);
			renderer.set("selected", selected);
			renderer.set("edited", edited);
			renderer.set("focused", this.showFocus ? focused : false);
			renderer.set("moveEnabled", this.isItemMoveEnabled(item, kind));
			if(kind != "label"){
				renderer.set("resizeEnabled", this.isItemResizeEnabled(item, kind));
			}

			this.applyRendererZIndex(item, ir, hovered, selected, edited, focused);

			if(renderer.updateRendering){
				renderer.updateRendering(w, h);
			}
										
			domConstruct.place(ir.container, cell);
			domStyle.set(ir.container, "display", "block");
		},
		
		_getCellAt: function(rowIndex, columnIndex, rtl){
			// tags:
			//		private
			
			if((rtl == undefined || rtl == true) && !this.isLeftToRight()){
				columnIndex = this.renderData.columnCount -1 - columnIndex;
			}
			return this.gridTable.childNodes[0].childNodes[rowIndex].childNodes[columnIndex];
		},
	
		_layoutExpandRenderers: function(index, hasHiddenItems, hiddenItems){
			// tags:
			//		private
			
			if(!this.expandRenderer){
				return;
			}
			var rd = this.renderData;
			if(rd.expandedRow == index){
				if(rd.expandedRowCol != null && rd.expandedRowCol != -1){
					this._layoutExpandRendererImpl(rd.expandedRow, rd.expandedRowCol, null, true);
				}
			}else{
				if(rd.expandedRow == null){
					for(var i=0; i<rd.columnCount; i++){
						if(hasHiddenItems[i]){
							this._layoutExpandRendererImpl(index, rd.rtl ? rd.columnCount -1 -i: i, hiddenItems[i], false);
						}
					}
				}
			}
		},
		
		_layoutExpandRendererImpl: function(rowIndex, colIndex, items, expanded){
			// tags:
			//		private
			
			var d, ir;		
			var rd = this.renderData;
			var cal = rd.dateModule;
			var cell = rd.cells[rowIndex];					
			
			ir = this._getExpandRenderer(
				lang.clone(rd.dates[rowIndex][colIndex]),
				items, rowIndex, colIndex, expanded);
				
			var dim = domGeometry.position(this._getCellAt(rowIndex, colIndex));
			dim.x -= rd.gridTablePosX;
			this.layoutExpandRenderer(ir, d, items, dim, this.expandRendererHeight);
			domConstruct.place(ir.domNode, cell);
			domStyle.set(ir.domNode, "display", "block");
		},
		
		layoutExpandRenderer: function(renderer, date, items, cellPosition, height){
			// summary:
			//		Computes and sets the position of the expand/collapse renderers.
			//		By default the renderer is set to take the width of the cell and is placed at the bottom of the cell.
			//		The renderer DOM node is in a row that takes all the grid width. 
			// renderer: Object
			//		The renderer used in specified cell that indicates that some items cannot be displayed.
			// date: Date
			//		The date displayed by the cell.
			// items: Object[]
			//		The list of non visible items.
			// cellPosition: Object
			//		An object that contains the position (x and y properties) and size of the cell (w and h properties).
			// tags:
			//		private
			domStyle.set(renderer.domNode, {
				"left": cellPosition.x + "px",
				"width": cellPosition.w + "px",
				"height": height + "px",
				"top":  (cellPosition.h - height -1) + "px"
			});
		},
		
		/////////////////////////////////////////////
		//
		// Editing
		//
		//////////////////////////////////////////////
		
		_onItemEditBeginGesture: function(e){
			// tags:
			//		private
			var p = this._edProps;
			
			var item = p.editedItem;
			var dates = e.dates;
			
			var refTime = this.newDate(p.editKind == "resizeEnd" ? item.endTime : item.startTime);
			
			if(p.rendererKind == "label"){
				// noop
			}else if(e.editKind == "move" && (item.allDay || this.roundToDay)){							
				var cal = this.renderData.dateModule;
				p.dayOffset = cal.difference(
					this.floorToDay(dates[0], false, this.renderData), 
					refTime, "day");
			} // else managed in super
			
			this.inherited(arguments);
		},
		
		_computeItemEditingTimes: function(item, editKind, rendererKind, times, eventSource){
			// tags:
			//		private
			var cal = this.renderData.dateModule;
			var p = this._edProps;
			
			if(rendererKind == "label"){ // noop
			}else	if(item.allDay || this.roundToDay){		
				var isStartOfDay = this.isStartOfDay(times[0]);	
				switch(editKind){
					case "resizeEnd":
						if(!isStartOfDay && item.allDay){
							times[0] = cal.add(times[0], "day", 1); // no break;
						}
					case "resizeStart":
						if(!isStartOfDay){
							times[0] = this.floorToDay(times[0], true);
						}
						break;
					case "move":
						times[0] = cal.add(times[0], "day", p.dayOffset);
						break;
					case "resizeBoth":
						if(!isStartOfDay){
							times[0] = this.floorToDay(times[0], true);
						}
						if(!this.isStartOfDay(times[1])){
							times[1] = this.floorToDay(cal.add(times[1], "day", 1), true);
						}
						break; 
				}	
				
			}else{
				times = this.inherited(arguments); 
			}			
			
			return times;			
		},
			
		
		/////////////////////////////////////////////
		//
		// Pixel to Time projection
		//
		//////////////////////////////////////////////
		
		getTime: function(e, x, y, touchIndex){
			// summary:
			//		Returns the time displayed at the specified point by this component.
			// e: Event
			//		Optional mouse event.
			// x: Number
			//		Position along the x-axis with respect to the sheet container used if event is not defined.
			// y: Number
			//		Position along the y-axis with respect to the sheet container (scroll included) used if event is not defined.
			// touchIndex: Integer
			//		If parameter 'e' is not null and a touch event, the index of the touch to use.
			// returns: Date
			
			var rd = this.renderData;
			
			if(e != null){				
				var refPos = domGeometry.position(this.itemContainer, true);
				
				if(e.touches){

					touchIndex = touchIndex==undefined ? 0 : touchIndex;

					x = e.touches[touchIndex].pageX - refPos.x;
					y = e.touches[touchIndex].pageY - refPos.y;
					
				}else{

					x = e.pageX - refPos.x;
					y = e.pageY - refPos.y;
				}
			}
			
			var r = domGeometry.getContentBox(this.itemContainer);
			
			if(x < 0){
				x = 0;
			}else if(x > r.w){
				x = r.w-1;
			}
			
			if(y < 0){
				y = 0;
			}else if(y > r.h){
				y = r.h-1;
			}

			// compute the date from column the time in day instead of time from start date of row to prevent DST hour offset.
			
			var w = domGeometry.getMarginBox(this.itemContainer).w;
			var colW = w / rd.columnCount;
			 
			var row;
			if(rd.expandedRow == null){
				row = Math.floor(y / (domGeometry.getMarginBox(this.itemContainer).h / rd.rowCount));
			}else{
				row = rd.expandedRow; //other rows are not usable
			}
			
			var r = domGeometry.getContentBox(this.itemContainer);
			
			if(rd.rtl){
				x = r.w - x;
			}
			
			var col = Math.floor(x / colW);
			
			var tm = Math.floor((x-(col*colW)) * 1440 / colW);
			
			var date = null;
			if(row < rd.dates.length && col < this.renderData.dates[row].length){
				date = this.newDate(this.renderData.dates[row][col]); 
				date = this.renderData.dateModule.add(date, "minute", tm);
			}
			
			return date;
		},
		
		/////////////////////////////////////////////
		//
		// Event management
		//
		//////////////////////////////////////////////
		
		_onGridMouseUp: function(e){
			// tags:
			//		private
			
			this.inherited(arguments);
			
			if(this._gridMouseDown){
				this._gridMouseDown = false;
				
				this._onGridClick({
					date: this.getTime(e),
					triggerEvent: e
				});
			}			
		},
		
		_onGridTouchEnd: function(e){
			// tags:
			//		private
			this.inherited(arguments);

			var g = this._gridProps;
			
			if(g){
				
				if(!this._isEditing){
						
					// touched on grid and on touch start editing was ongoing.
					if(!g.fromItem && !g.editingOnStart){
						this.selectFromEvent(e, null, null, true);
					}			
					
					if(!g.fromItem){
					
						if(this._pendingDoubleTap && this._pendingDoubleTap.grid){
														
							this._onGridDoubleClick({
								date: this.getTime(this._gridProps.event),
								triggerEvent: this._gridProps.event
							});
							
							clearTimeout(this._pendingDoubleTap.timer);
					
							delete this._pendingDoubleTap;
							
						}else{

							this._onGridClick({
								date: this.getTime(this._gridProps.event),
								triggerEvent: this._gridProps.event
							});
							
							this._pendingDoubleTap = {
								grid: true,
								timer: setTimeout(lang.hitch(this, function(){
										delete this._pendingDoubleTap;
								}), this.doubleTapDelay)
							};
						}
					}	
				}
				
				this._gridProps = null;
			}					
		},
		
				
		/////////////////////////////////////////////
		//
		// Events
		//
		//////////////////////////////////////////////
		
		_onRowHeaderClick: function(e){
			this._dispatchCalendarEvt(e, "onRowHeaderClick");
			// tags:
			//		private
		},
		
		onRowHeaderClick: function(e){
			// summary:
			//		Event dispatched when a row header cell is clicked.
			// e: __HeaderClickEventArgs
			//		Header click event.
			// tags:
			//		callback
		},
		
		expandRendererClickHandler: function(e, renderer){
			// summary:
			//		Default action when an expand renderer is clicked.
			// e: Event
			//		The mouse event.
			// renderer: Object
			//		The expand renderer.
			// tags:
			//		protected
			
			event.stop(e);
			
			if(this.getExpandedRowIndex() != -1){
				this.collapseRow();
			}else{
				this.expandRow(renderer.rowIndex, renderer.columnIndex);
			}
		},
		
		
		////////////////////////////////////////////
		//
		// Editing
		//
		///////////////////////////////////////////
								
		snapUnit: "minute",
		snapSteps: 15,
		minDurationUnit: "minute",
		minDurationSteps: 15,
		triggerExtent: 3,
		liveLayout: false,
		stayInView: true,
		allowStartEndSwap: true,
		allowResizeLessThan24H: false		

	});
});

},
'url:dojox/calendar/templates/ColumnViewSecondarySheet.html':"<div data-dojo-attach-events=\"keydown:_onKeyDown\">\n\t<div  data-dojo-attach-point=\"rowHeader\" class=\"dojoxCalendarRowHeader\">\n\t\t<table data-dojo-attach-point=\"rowHeaderTable\" class=\"dojoxCalendarRowHeaderTable\" cellpadding=\"0\" cellspacing=\"0\"></table>\n\t</div>\t\n\t<div data-dojo-attach-point=\"grid\" class=\"dojoxCalendarGrid\">\n\t\t<table data-dojo-attach-point=\"gridTable\" class=\"dojoxCalendarGridTable\" cellpadding=\"0\" cellspacing=\"0\"></table>\n\t</div>\n\t<div data-dojo-attach-point=\"itemContainer\" class=\"dojoxCalendarContainer\" data-dojo-attach-event=\"mousedown:_onGridMouseDown,mouseup:_onGridMouseUp,ondblclick:_onGridDoubleClick,touchstart:_onGridTouchStart,touchmove:_onGridTouchMove,touchend:_onGridTouchEnd\">\n\t\t<table data-dojo-attach-point=\"itemContainerTable\" class=\"dojoxCalendarContainerTable\" cellpadding=\"0\" cellspacing=\"0\" style=\"width:100%\"></table>\n\t</div>\n</div>\n",
'dojox/calendar/MobileHorizontalRenderer':function(){
require({cache:{
'url:dojox/calendar/templates/MobileHorizontalRenderer.html':"<div class=\"dojoxCalendarEvent dojoxCalendarHorizontal\" onselectstart=\"return false;\">\n\t<div class=\"bg\" ></div>\n\t<div style=\"position:absolute;left:2px;bottom:2px\"><span data-dojo-attach-point=\"beforeIcon\" class=\"beforeIcon\">◄</span></div>\t\n\t<div data-dojo-attach-point=\"labelContainer\" class=\"labels\">\t\t\n\t\t<span data-dojo-attach-point=\"startTimeLabel\" class=\"startTime\"></span>\n\t\t<span data-dojo-attach-point=\"summaryLabel\" class=\"summary\"></span>\n\t\t<span  data-dojo-attach-point=\"endTimeLabel\" class=\"endTime\"></span>\n\t</div>\n\t<div style=\"position:absolute;right:2px;bottom:2px\"><span data-dojo-attach-point=\"afterIcon\" class=\"afterIcon\">►</span></div>\n\t<div data-dojo-attach-point=\"moveHandle\" class=\"moveHandle\" ></div>\t\n\t<div data-dojo-attach-point=\"resizeStartHandle\" class=\"resizeHandle resizeStartHandle\"><div></div></div>\t\n\t<div data-dojo-attach-point=\"resizeEndHandle\" class=\"resizeHandle resizeEndHandle\"><div></div></div>\t\n</div>\n"}});
define("dojox/calendar/MobileHorizontalRenderer", [
"dojo/_base/declare", 
"dojo/dom-style", 
"dijit/_WidgetBase", 
"dijit/_TemplatedMixin",
"dojox/calendar/_RendererMixin", 
"dojo/text!./templates/MobileHorizontalRenderer.html"],
	 
function(
declare, 
domStyle, 
_WidgetBase, 
_TemplatedMixin, 
_RendererMixin, 
template){
	
	return declare("dojox.calendar.MobileHorizontalRenderer", [_WidgetBase, _TemplatedMixin, _RendererMixin], {
		
		// summary:
		//		The mobile specific item horizontal renderer.
		
		templateString: template,
		
		_orientation: "horizontal",
		
		mobile: true,
		
		visibilityLimits: {
			resizeStartHandle: 50,
			resizeEndHandle: -1,
			summaryLabel: 15,
			startTimeLabel: 32,
			endTimeLabel: 30
		},
		
		_displayValue: "inline",
		
		// arrowPadding: Integer
		//		The padding size in pixels to apply to the label container on left and/or right side, to show the arrows correctly.
		arrowPadding: 12, 
		
		_isElementVisible: function(elt, startHidden, endHidden, size){
			var d;
			var ltr = this.isLeftToRight();
			
			if(elt == "startTimeLabel"){
				if(this.labelContainer && (ltr && endHidden || !ltr && startHidden)){
					domStyle.set(this.labelContainer, "marginRight", this.arrowPadding+"px");
				}else{
					domStyle.set(this.labelContainer, "marginRight", 0);
				}
				if(this.labelContainer && (!ltr && endHidden || ltr && startHidden)){
					domStyle.set(this.labelContainer, "marginLeft", this.arrowPadding+"px");
				}else{
					domStyle.set(this.labelContainer, "marginLeft", 0);
				}
			}
			
			switch(elt){
				case "startTimeLabel":
					d = this.item.startTime;
					if(this.item.allDay || this.owner.isStartOfDay(d)){
						return false;
					}
					break;
				case "endTimeLabel":
					d = this.item.endTime;
					if(this.item.allDay || this.owner.isStartOfDay(d)){
						return false;
					}
					break;
			}
			return this.inherited(arguments);
		},
		
		postCreate: function() {
			this.inherited(arguments);
			this._applyAttributes();
		}
	});
});

},
'url:dojox/calendar/templates/HorizontalRenderer.html':"<div class=\"dojoxCalendarEvent dojoxCalendarHorizontal\" onselectstart=\"return false;\">\n\t<div class=\"bg\" ></div>\n\t<div style=\"position:absolute;left:2px;bottom:2px\" data-dojo-attach-point=\"beforeIcon\" class=\"beforeIcon\">◄</div>\t\n\t<div data-dojo-attach-point=\"labelContainer\" class=\"labels\">\t\t\n\t\t<span data-dojo-attach-point=\"startTimeLabel\" class=\"startTime\"></span>\n\t\t<span data-dojo-attach-point=\"summaryLabel\" class=\"summary\"></span>\n\t\t<span  data-dojo-attach-point=\"endTimeLabel\" class=\"endTime\"></span>\n\t</div>\n\t<div style=\"position:absolute;right:2px;bottom:2px\" data-dojo-attach-point=\"afterIcon\" class=\"afterIcon\">►</div>\n\t<div data-dojo-attach-point=\"moveHandle\" class=\"handle moveHandle\" ></div>\n\t<div data-dojo-attach-point=\"resizeStartHandle\" class=\"handle resizeStartHandle\"></div>\n\t<div data-dojo-attach-point=\"resizeEndHandle\" class=\"handle resizeEndHandle\" ></div>\t\n</div>\n",
'dojox/calendar/nls/buttons':function(){
define("dojox/calendar/nls/buttons", { root: {
//begin v1.x content
	previousButton: "◄",
	nextButton: "►",
	todayButton: "Today",
	dayButton: "Day",
	weekButton: "Week",
	fourDaysButton: "4 Days",
	monthButton: "Month"
}
//end v1.x content
,
"zh": true,
"zh-tw": true,
"tr": true,
"th": true,
"sv": true,
"sl": true,
"sk": true,
"ru": true,
"ro": true,
"pt": true,
"pt-pt": true,
"pl": true,
"nl": true,
"nb": true,
"ko": true,
"kk": true,
"ja": true,
"it": true,
"hu": true,
"fr": true,
"fi": true,
"es": true,
"el": true,
"de": true,
"da": true,
"cs": true,
"ca": true,
"ar": true
});

},
'dojox/calendar/time':function(){
define("dojox/calendar/time", ["dojo/_base/lang", "dojo/date", "dojo/cldr/supplemental", "dojo/date/stamp"], function(lang, date, cldr, stamp) {

// summary: Advanced date manipulation utilities.

var time = {};


time.newDate = function(obj, dateClassObj){
	// summary:
	//		Creates a new Date object.
	// obj: Object
	//		This object can have several values:
	//		- the time in milliseconds since gregorian epoch.
	//		- a Date instance
	//		- a String instance that can be decoded by the dojo/date/stamp class.
	// dateClassObj: Object?
	//		The Date class used, by default the native Date.

	// returns: Date
	dateClassObj = dateClassObj || Date;  
	var d;
	
	if(typeof(obj) == "number"){
		return new dateClassObj(time);
	}else if(obj.getTime){
		return new dateClassObj(obj.getTime());
	}else if(obj.toGregorian){
		d = obj.toGregorian();
		if(dateClassObj !== Date){
			d = new dateClassObj(d.getTime());
		}
		return d;
	}else if(typeof obj == "string"){
		d = stamp.fromISOString(obj);
		if(d === null){
			d = new dateClassObj(obj); // kept for backward compat, will throw error in dojo 1.9
		}else if(dateClassObj !== Date){ // from Date to dateClassObj
			d = new dateClassObj(d.getTime());
		}
		return d;
	}
	
};

time.floorToDay = function(d, reuse, dateClassObj){
	// summary:
	//		Floors the specified date to the start of day.
	// date: Date
	//		The date to floor.
	// reuse: Boolean
	//		Whether use the specified instance or create a new one. Default is false.
	// dateClassObj: Object?
	//		The Date class used, by default the native Date.	
	// returns: Date
	dateClassObj = dateClassObj || Date;  
	
	if(!reuse){
		d = time.newDate(d, dateClassObj);
	}
	
	d.setHours(0, 0, 0, 0);
		
	return d;
};

time.floorToMonth = function(d, reuse, dateClassObj){
	// summary:
	//		Floors the specified date to the start of the date's month.
	// date: Date
	//		The date to floor.
	// reuse: Boolean
	//		Whether use the specified instance or create a new one. Default is false.
	// dateClassObj: Object?
	//		The Date class used, by default the native Date.	
	// returns: Date
	dateClassObj = dateClassObj || Date;  
	
	if(!reuse){
		d = time.newDate(d, dateClassObj);
	}
	
	d.setDate(1);
	d.setHours(0, 0, 0, 0);
	
	return d;
};


time.floorToWeek = function(d, dateClassObj, dateModule, firstDayOfWeek, locale){
	// summary:
	//		Floors the specified date to the beginning of week.
	// d: Date
	//		Date to floor.
	// dateClassObj: Object?
	//		The Date class used, by default the native Date.	
	// dateModule: Object?
	//		Object that contains the "add" method. By default dojo.date is used.
	// firstDayOfWeek: Integer?
	//		Optional day of week that overrides the one provided by the CLDR.	
	// locale: String?
	//		Optional locale used to determine first day of week.
	dateClassObj = dateClassObj || Date; 
	dateModule = dateModule || date;  	
	
	var fd = firstDayOfWeek == undefined || firstDayOfWeek < 0 ? cldr.getFirstDayOfWeek(locale) : firstDayOfWeek;
	var day = d.getDay();
	if(day == fd){
		return d;
	}
	return time.floorToDay(
		dateModule.add(d, "day", day > fd ? -day+fd : fd-day),
		true, dateClassObj);
};

time.floor = function(date, unit, steps, reuse, dateClassObj){
	// summary:
	//		floors the date to the unit.
	// date: Date
	//		The date/time to floor.
	// unit: String
	//		The unit. Valid values are "minute", "hour", "day".
	// steps: Integer
	//		Valid for "minute" or "hour" units.
	// reuse: Boolean
	//		Whether use the specified instance or create a new one. Default is false.	
	// dateClassObj: Object?
	//		The Date class used, by default the native Date.
	// returns: Date

	var d = time.floorToDay(date, reuse, dateClassObj);
	
	switch(unit){
		case "week":
			return time.floorToWeek(d, firstDayOfWeek, dateModule, locale);
		case "minute":
			d.setHours(date.getHours());
			d.setMinutes(Math.floor(date.getMinutes() /steps) * steps);
			break;
		case "hour":
			d.setHours(Math.floor(date.getHours() /steps) * steps);
			break;
	}
	return d;
};

time.isStartOfDay = function(d, dateClassObj, dateModule){
	// summary:
	//		Tests if the specified date represents the starts of day. 
	// d: Date
	//		The date to test.
	// dateClassObj: Object?
	//		The Date class used, by default the native Date.	
	// dateModule: Object?
	//		Object that contains the "add" method. By default dojo.date is used.
	// returns: Boolean
	dateModule = dateModule || date;
	return dateModule.compare(this.floorToDay(d, false, dateClassObj), d) == 0;
};

time.isToday = function(d, dateClassObj){
	// summary:
	//		Returns whether the specified date is in the current day.
	// d: Date
	//		The date to test.
	// dateClassObj: Object?
	//		The Date class used, by default the native Date.
	// returns: Boolean
	dateClassObj = dateClassObj || Date;
	var today = new dateClassObj();
	return d.getFullYear() == today.getFullYear() &&
				 d.getMonth() == today.getMonth() && 
				 d.getDate() == today.getDate();
};

return time;
});
},
'url:dojox/calendar/templates/SimpleColumnView.html':"<div data-dojo-attach-events=\"keydown:_onKeyDown\">\t\n\t<div data-dojo-attach-point=\"header\" class=\"dojoxCalendarHeader\">\n\t\t<div class=\"dojoxCalendarYearColumnHeader\" data-dojo-attach-point=\"yearColumnHeader\">\n\t\t\t<table><tr><td><span data-dojo-attach-point=\"yearColumnHeaderContent\"></span></td></tr></table>\t\t\n\t\t</div>\n\t\t<div data-dojo-attach-point=\"columnHeader\" class=\"dojoxCalendarColumnHeader\">\n\t\t\t<table data-dojo-attach-point=\"columnHeaderTable\" class=\"dojoxCalendarColumnHeaderTable\" cellpadding=\"0\" cellspacing=\"0\"></table>\n\t\t</div>\n\t</div>\t\n\t<div data-dojo-attach-point=\"vScrollBar\" class=\"dojoxCalendarVScrollBar\">\n\t\t<div data-dojo-attach-point=\"vScrollBarContent\" style=\"visibility:hidden;position:relative; width:1px; height:1px;\" ></div>\n\t</div>\t\n\t<div data-dojo-attach-point=\"scrollContainer\" class=\"dojoxCalendarScrollContainer\">\n\t\t<div data-dojo-attach-point=\"sheetContainer\" style=\"position:relative;left:0;right:0;margin:0;padding:0\">\n\t\t\t<div data-dojo-attach-point=\"rowHeader\" class=\"dojoxCalendarRowHeader\">\n\t\t\t\t<table data-dojo-attach-point=\"rowHeaderTable\" class=\"dojoxCalendarRowHeaderTable\" cellpadding=\"0\" cellspacing=\"0\"></table>\n\t\t\t</div>\n\t\t\t<div data-dojo-attach-point=\"grid\" class=\"dojoxCalendarGrid\">\n\t\t\t\t<table data-dojo-attach-point=\"gridTable\" class=\"dojoxCalendarGridTable\" cellpadding=\"0\" cellspacing=\"0\" style=\"width:100%\"></table>\n\t\t\t</div>\n\t\t\t<div data-dojo-attach-point=\"itemContainer\" class=\"dojoxCalendarContainer\" data-dojo-attach-event=\"mousedown:_onGridMouseDown,mouseup:_onGridMouseUp,ondblclick:_onGridDoubleClick,touchstart:_onGridTouchStart,touchmove:_onGridTouchMove,touchend:_onGridTouchEnd\">\n\t\t\t\t<table data-dojo-attach-point=\"itemContainerTable\" class=\"dojoxCalendarContainerTable\" cellpadding=\"0\" cellspacing=\"0\" style=\"width:100%\"></table>\n\t\t\t</div>\n\t\t</div> \n\t</div>\n</div>\n\n",
'dojox/calendar/Keyboard':function(){
define("dojox/calendar/Keyboard", ["dojo/_base/array", "dojo/_base/lang", "dojo/_base/declare", "dojo/on", "dojo/_base/event", "dojo/keys"],
	function(arr, lang, declare, on, event, keys){
	
	return declare("dojox.calendar.Keyboard", null, {

		// summary:
		//		This mixin is managing the keyboard interactions on a calendar view.
		
		// keyboardUpDownUnit: String
		//		Unit used during editing of an event using the keyboard and the up or down keys were pressed. Valid values are "week", "day", "hours" "minute".
		keyboardUpDownUnit: "minute",
		
		// keyboardUpDownSteps: Integer
		//		Steps used during editing of an event using the keyboard and the up or down keys were pressed.		
		keyboardUpDownSteps: 15,		
		
		// keyboardLeftRightUnit: String
		//		Unit used during editing of an event using the keyboard and the left or right keys were pressed. Valid values are "week", "day", "hours" "minute".
		keyboardLeftRightUnit: "day",
		
		// keyboardLeftRightSteps: Integer
		//		Unit used during editing of an event using the keyboard and the left or right keys were pressed.		
		keyboardLeftRightSteps: 1,

		// allDayKeyboardUpDownSteps: Integer
		//		Steps used during editing of an all day event using the keyboard and the up or down keys were pressed.
		allDayKeyboardUpDownUnit: "day",
		
		// allDayKeyboardUpDownUnit: String
		//		Unit used during editing of an all day event using the keyboard and the up or down keys were pressed. Valid values are "week", "day", "hours" "minute".		
		allDayKeyboardUpDownSteps: 7,
		
		// allDayKeyboardUpDownSteps: Integer
		//		Steps used during editing of an all day event using the keyboard and the up or down keys were pressed.
		allDayKeyboardLeftRightUnit: "day",
		
		// allDayKeyboardLeftRightUnit: String
		//		Unit used during editing of an all day event using the keyboard and the left or right keys were pressed. Valid values are "week", "day", "hours" "minute".
		allDayKeyboardLeftRightSteps: 1,

		postCreate: function(){
			this.inherited(arguments);
			this._viewHandles.push(on(this.domNode, "keydown", lang.hitch(this, this._onKeyDown)));
		},
		
		// resizeModfier: "ctrl"
		//		The modifier used to determine if the item is resized instead moved during the editing on an item.
		resizeModifier: "ctrl",

		// maxScrollAnimationDuration: Number
		//		The duration in milliseconds to scroll the entire view. 
		//		The scroll speed is constant when scrolling to show an item renderer. 
		maxScrollAnimationDuration: 1000,
		
		///////////////////////////////////////////////////////////////
		//
		// Focus management
		//
		//////////////////////////////////////////////////////////////
		
		// tabIndex: String
		//		Order fields are traversed when user hits the tab key
		tabIndex: "0",
		
		// focusedItem: Object
		//		The data item that currently has the focus.
		focusedItem: null,
		
		_isItemFocused: function(item){
			return this.focusedItem != null && this.focusedItem.id == item.id;
		},

		_setFocusedItemAttr: function(value){
			if(value != this.focusedItem){
				var old = this.focusedItem;
				this._set("focusedItem", value);
				this.updateRenderers([old, this.focusedItem], true);
				this.onFocusChange({
					oldValue: old,
					newValue: value
				});
			}
			if(value != null){
				if(this.owner != null && this.owner.get("focusedItem") != null){
					this.owner.set("focusedItem", null);
				}
				if(this._secondarySheet != null && this._secondarySheet.set("focusedItem") != null){
					this._secondarySheet.set("focusedItem", null);
				}
			}			
		},
		
		onFocusChange: function(e){
			// summary:
			//		Event dispatched when the focus has changed.
			// tags:
			//		callback

		},

		// showFocus: Boolean
		//		Show or hide the focus graphic feedback on item renderers.
		showFocus: false,		
		
		_focusNextItem: function(dir){			
			// summary:
			//		Moves the focus to the next item in the specified direction.
			//		If there is no current child focused, the first (dir == 1) or last (dir == -1) is focused.
			// dir: Integer
			//		The direction of the next child to focus.
			//
			//		- 1: Move focus to the next item in the list.
			//		- -1: Move focus to the previous item in the list.
			
			if(!this.renderData || !this.renderData.items || this.renderData.items.length == 0){
				return null;
			}
			
			var index = -1;
			var list = this.renderData.items;
			var max = list.length - 1;
			var focusedItem = this.get("focusedItem");
			
			// find current index.
			if(focusedItem == null){
				index = dir > 0 ? 0 : max;
			}else{
				arr.some(list, lang.hitch(this, function(item, i){
					var found = item.id == focusedItem.id;
					if(found){
						index = i;
					}
					return found;
				}));
				index = this._focusNextItemImpl(dir, index, max);
			}
			
			// find the first item with renderers.
			var reachedOnce = false;
			var old = -1;
			
			while(old != index && (!reachedOnce || index != 0)){
				
				if(!reachedOnce && index == 0){
					reachedOnce = true;
				}
				
				var item = list[index];
				
				if(this.itemToRenderer[item.id] != null){
					// found item
					this.set("focusedItem", item);
					return;
				}
				old = index;				
				index = this._focusNextItemImpl(dir, index, max);
				
			}						
		},
		
		_focusNextItemImpl: function(dir, index, max){
			// tags:
			//		private

			if(index == -1){ // not found should not occur
				index = dir > 0 ? 0 : max;
			}else{				
				if(index == 0 && dir == -1 || index == max && dir == 1){
					return index;
				}				
				index = dir > 0 ? ++index : --index;					
			}			
			return index; 	
		},
		
		///////////////////////////////////////////////////////////
		//
		// Keyboard
		//
		//////////////////////////////////////////////////////////

		_handlePrevNextKeyCode: function(e, dir){
			// tags:
			//		private

			if(!this.isLeftToRight()){
				dir = dir == 1 ? -1 : 1;
			}
			this.showFocus = true;
			this._focusNextItem(dir);
			
			var focusedItem = this.get("focusedItem");
			
			if(!e.ctrlKey && focusedItem){
				this.set("selectedItem", focusedItem);
			}

			if(focusedItem){
				this.ensureVisibility(focusedItem.startTime, focusedItem.endTime, "both", undefined, this.maxScrollAnimationDuration);
			}
		},

		_keyboardItemEditing: function(e, dir){
			// tags:
			//		private

			event.stop(e);

			var p = this._edProps;

			var unit, steps; 

			if(p.editedItem.allDay || this.roundToDay || p.rendererKind == "label"){
				unit = dir == "up" || dir == "down" ? this.allDayKeyboardUpDownUnit : this.allDayKeyboardLeftRightUnit; 
				steps = dir == "up" || dir == "down" ? this.allDayKeyboardUpDownSteps : this.allDayKeyboardLeftRightSteps;
			}else{
				unit = dir == "up" || dir == "down" ? this.keyboardUpDownUnit : this.keyboardLeftRightUnit; 
				steps = dir == "up" || dir == "down" ? this.keyboardUpDownSteps : this.keyboardLeftRightSteps;
			}			
						
			if(dir == "up" || !this.isLeftToRight() && dir == "right" || 
				 this.isLeftToRight() && dir == "left"){
				steps = -steps;
			}
						
			var editKind = e[this.resizeModifier+"Key"] ? "resizeEnd" : "move";
			
			var d = editKind == "resizeEnd" ? p.editedItem.endTime : p.editedItem.startTime;
			
			var newTime = this.renderData.dateModule.add(d, unit, steps);
			
			this._startItemEditingGesture([d], editKind, "keyboard", e);
			this._moveOrResizeItemGesture([newTime], "keyboard", e);
			this._endItemEditingGesture(editKind, "keyboard", e, false);
			
			if(editKind == "move"){
				if(this.renderData.dateModule.compare(newTime, d) == -1){
					this.ensureVisibility(p.editedItem.startTime, p.editedItem.endTime, "start");
				}else{
					this.ensureVisibility(p.editedItem.startTime, p.editedItem.endTime, "end");
				}				
			}else{ // resize end only
				this.ensureVisibility(p.editedItem.startTime, p.editedItem.endTime, "end");	
			}						
		},
						
		_onKeyDown: function(e){
			// tags:
			//		private

			var focusedItem = this.get("focusedItem");
			
			switch(e.keyCode){

				case keys.ESCAPE:

					if(this._isEditing){
						
						if(this._editingGesture){
							this._endItemEditingGesture("keyboard", e, true);
						}
						
						this._endItemEditing("keyboard", true);

						this._edProps = null;
					}
					break;

				case keys.SPACE:

					event.stop(e); // prevent browser shortcut

					if(focusedItem != null){
						this.setItemSelected(focusedItem, e.ctrlKey ? !this.isItemSelected(focusedItem) : true);
					}
					break;

				case keys.ENTER:

					event.stop(e); // prevent browser shortcut

					if(focusedItem != null){

						if(this._isEditing){
							this._endItemEditing("keyboard", false);
						}else{
							
							var renderers = this.itemToRenderer[focusedItem.id];
								
							if(renderers && renderers.length > 0 && this.isItemEditable(focusedItem, renderers[0].kind)){

								this._edProps = {
									renderer: renderers[0],
									rendererKind: renderers[0].kind,
									tempEditedItem: focusedItem,
									liveLayout: this.liveLayout
								};

								this.set("selectedItem", focusedItem);

								this._startItemEditing(focusedItem, "keyboard");
							}
						}
					}
					break;

				case keys.LEFT_ARROW:
				
					event.stop(e); // prevent browser shortcut
					
					if(this._isEditing){
						this._keyboardItemEditing(e, "left");
					}else{
						this._handlePrevNextKeyCode(e, -1);
					}				
					break;
					
				case keys.RIGHT_ARROW:
				
					event.stop(e); // prevent browser shortcut
					
					if(this._isEditing){
						this._keyboardItemEditing(e, "right");
					}else{
						this._handlePrevNextKeyCode(e, 1);
					}
					break;
				
				case keys.UP_ARROW:
					if(this._isEditing){
						this._keyboardItemEditing(e, "up");
					}else if(this.scrollable){
						this.scrollView(-1);
					}
					break;
					
				case keys.DOWN_ARROW:
					if(this._isEditing){
						this._keyboardItemEditing(e, "down");
					}else if(this.scrollable){
						this.scrollView(1);
					}
					break;
					
			}
			
		}
	});
});

},
'dojox/widget/Selection':function(){
define("dojox/widget/Selection", ["dojo/_base/declare", "dojo/_base/array", "dojo/_base/lang", "dojo/Stateful"], 
	function(declare, arr, lang, Stateful){
		
	return declare("dojox.widget.Selection", Stateful, {
		// summary:
		//		Base class for widgets that manage a list of selected data items.

		constructor: function(){
			this.selectedItems = [];
		},
		
		// selectionMode: String
		//		Valid values are:
		//
		//		1. "none": No selection can be done.
		//		2. "single": Only one item can be selected at a time.
		//		3. "multiple": Several item can be selected using the control key modifier.
		//		Default value is "single".
		selectionMode: "single",
		
		_setSelectionModeAttr: function(value){
			if(value != "none" && value != "single" && value != "multiple"){
				value = "single"; //default value
			}			
			if(value != this.selectionMode){
				this.selectionMode = value;
				if(value == "none"){
					this.set("selectedItems", null);
				}else if(value == "single"){
					this.set("selectedItem", this.selectedItem); // null or last selected item 
				}
			}
		},
		
		// selectedItem: Object
		//		In single selection mode, the selected item or in multiple selection mode the last selected item.
		//		Warning: Do not use this property directly, make sure to call set() or get() methods.
		selectedItem: null,
		
		_setSelectedItemAttr: function(value){
			if(this.selectedItem != value){
				this._set("selectedItem", value);
				this.set("selectedItems", value ? [value] : null);
			}
		},
		
		// selectedItems: Object[]
		//		The list of selected items.
		//		Warning: Do not use this property directly, make sure to call set() or get() methods.
		selectedItems: null,
		
		_setSelectedItemsAttr: function(value){
			var oldSelectedItems = this.selectedItems;
			
			this.selectedItems = value;
			this.selectedItem = null;
			
			if(oldSelectedItems != null && oldSelectedItems.length>0){
				this.updateRenderers(oldSelectedItems, true);
			}
			if(this.selectedItems && this.selectedItems.length>0){
				this.selectedItem = this.selectedItems[0];
				this.updateRenderers(this.selectedItems, true);
			}
		},
		
		_getSelectedItemsAttr: function(){
			return this.selectedItems == null ? [] : this.selectedItems.concat();
		},
		
		isItemSelected: function(item){
			// summary:
			//		Returns wether an item is selected or not.
			// item: Object
			//		The item to test the selection for.			
			if(this.selectedItems == null || this.selectedItems.length== 0){
				return false;
			}
			 
			return arr.some(this.selectedItems, lang.hitch(this, function(sitem){
				return this.getIdentity(sitem) == this.getIdentity(item);
			}));
		},
		
		getIdentity: function(item){
			// summary:
			//		This function must be implemented to return the id of a item.
			// item: Object
			//		The item to query the identity for.
		},
		
		setItemSelected: function(item, value){
			// summary:
			//		Change the selection state of an item.
			// item: Object
			//		The item to change the selection state for.
			// value: Boolean
			//		True to select the item, false to deselect it. 
			
			if(this.selectionMode == "none" || item == null){
				return;
			}

			// copy is returned
			var sel = this.get("selectedItems");
			var old = this.get("selectedItems");
			
			if(this.selectionMode == "single"){
				if(value){
					this.set("selectedItem", item);
				}else if(this.isItemSelected(item)){
					this.set("selectedItems", null);
				}
			}else{ // multiple
				if(value){
					if(this.isItemSelected(item)){
						return; // already selected
					}
					if(sel == null){
						sel = [item];
					}else{
						sel.unshift(item);
					}
					this.set("selectedItems", sel);
				}else{
					var res = arr.filter(sel, function(sitem){
						return sitem.id != item.id; 
					});
					if(res == null || res.length == sel.length){
						return; // already not selected
					}
					this.set("selectedItems", res);
				}
			}
		},
		
		selectFromEvent: function(e, item, renderer, dispatch){
			// summary:
			//		Applies selection triggered by an user interaction
			// e: Event
			//		The source event of the user interaction.
			// item: Object
			//		The render item that has been selected/deselected.
			// renderer: Object
			//		The visual renderer of the selected/deselected item.			
			// dispatch: Boolean
			//		Whether an event must be dispatched or not.
			// returns: Boolean
			//		Returns true if the selection has changed and false otherwise.
			// tags:
			//		protected
			
			if(this.selectionMode == "none"){
				return false;
			}
			
			var changed;
			var oldSelectedItem = this.get("selectedItem");
			var selected = item ? this.isItemSelected(item): false;
			
			if(item == null){
				if(!e.ctrlKey && this.selectedItem != null){
					this.set("selectedItem", null);
					changed = true;
				}
			}else if(this.selectionMode == "multiple"){
				 if(e.ctrlKey){
					this.setItemSelected(item, !selected);
					changed = true;
				}else{
					this.set("selectedItem", item);					
					changed = true;						
				}				 								
			}else{ // single
				if(e.ctrlKey){					
					//if the object is selected deselects it.
					this.set("selectedItem", selected ? null : item);
					changed = true;					
				}else{
					if(!selected){							
						this.set("selectedItem", item);
						changed = true;
					}
				}
			}						
			
			if(dispatch && changed){
				this.dispatchChange(oldSelectedItem, this.get("selectedItem"), renderer, e);
			}
			
			return changed;
		},
		
		dispatchChange: function(oldSelectedItem, newSelectedItem, renderer, triggerEvent){
			// summary:
			//		Dispatch a selection change event.
			// oldSelectedItem: Object
			//		The previously selectedItem.
			// newSelectedItem: Object
			//		The new selectedItem.
			// renderer: Object
			//		The visual renderer of the selected/deselected item.
			// triggerEvent: Event
			//		The event that lead to the selection of the item. 			
			this.onChange({
				oldValue: oldSelectedItem,
				newValue: newSelectedItem,
				renderer: renderer,
				triggerEvent: triggerEvent
			});
		},
		
		onChange: function(){
			// summary:
			//		Called when the selection changed.
			// tags:
			//		callback			
		}
	});
});

},
'dojox/calendar/ViewBase':function(){
define("dojox/calendar/ViewBase", [
"dojo/_base/declare", 
"dojo/_base/lang", 
"dojo/_base/array", 
"dojo/_base/window", 
"dojo/_base/event",
"dojo/_base/html", 
"dojo/_base/sniff", 
"dojo/query", 
"dojo/dom", 
"dojo/dom-style",
"dojo/dom-construct", 
"dojo/on", 
"dojo/date", 
"dojo/date/locale", 
"dijit/_WidgetBase",  
"dojox/widget/_Invalidating", 
"dojox/widget/Selection", 
"dojox/calendar/time",
"./StoreMixin"],

function(
	declare, 
	lang, 
	arr, 
	win, 
	event, 
	html, 
	has, 
	query, 
	dom, 
	domStyle,
	domConstruct, 
	on, 
	date, 
	locale, 
	_WidgetBase, 
	_Invalidating, 
	Selection, 
	timeUtil, 
	StoreMixin){
	
	/*=====
	var __GridClickEventArgs = {
		// summary:
		//		The event dispatched when the grid is clicked or double-clicked.
		// date: Date
		//		The start of the previously displayed time interval, if any. 
		// triggerEvent: Event
		//		The event at the origin of this event.
	};
	=====*/
	
	/*=====
	var __ItemMouseEventArgs = {
		// summary:
		//		The event dispatched when an item is clicked, double-clicked or context-clicked.
		// item: Object
		//		The item clicked.
		// renderer: dojox/calendar/_RendererMixin
		//		The item renderer clicked.
		// triggerEvent: Event
		//		The event at the origin of this event.
	};
	=====*/
	
	/*=====
	var __itemEditingEventArgs = {
		// summary:
		//		An item editing event.
		// item: Object
		//		The date item that is being edited.
		// editKind: String
		//		Kind of edit: "resizeBoth", "resizeStart", "resizeEnd" or "move".
		// dates: Date[]
		//		The computed date/time of the during the event editing. One entry per edited date (touch use case).
		// startTime: Date?
		//		The start time of data item.
		// endTime: Date?
		//		The end time of data item.
		// sheet: String
		//		For views with several sheets (columns view for example), the sheet when the event occurred.
		// source: dojox/calendar/ViewBase
		//		The view where the event occurred.
		// eventSource: String
		//		The device that triggered the event. This property can take the following values:
		//
		//		- "mouse", 
		//		- "keyboard", 
		//		- "touch"		
		// triggerEvent: Event
		//		The event at the origin of this event.
	};
	=====*/
	

	return declare("dojox.calendar.ViewBase", [_WidgetBase, StoreMixin, _Invalidating, Selection], {
		
		// summary:
		//		The dojox.calendar.ViewBase widget is the base of calendar view widgets
		
		// datePackage: Object
		//		JavaScript namespace to find Calendar routines. Uses Gregorian Calendar routines at dojo.date by default.
		datePackage: date,
		
		_calendar: "gregorian",
		
		// viewKind: String
		//		Kind of the view. Used by the calendar widget to determine how to configure the view.
		viewKind: null,
		
		// _layoutStep: [protected] Integer
		//		The number of units displayed by a visual layout unit (i.e. a column or a row)
		_layoutStep: 1,
		
		// _layoutStep: [protected] Integer
		//		The unit displayed by a visual layout unit (i.e. a column or a row)
		_layoutUnit: "day",
		
		// resizeCursor: String
		//		CSS value to apply to the cursor while resizing an item renderer. 
		resizeCursor: "n-resize",
		
		// formatItemTimeFunc: Function
		//		Optional function to format the time of day of the item renderers.
		//		The function takes the date and render data object as arguments and returns a String.
		formatItemTimeFunc: null,
				
		_getFormatItemTimeFuncAttr: function(){
			if(this.owner != null){
				return this.owner.get("formatItemTimeFunc");
			}else{
				return this.formatItemTimeFunc;
			}
		},
		
		// The listeners added by the view itself.
		_viewHandles: null,
		
		// doubleTapDelay: Integer
		//		The maximum time amount in milliseconds between to touchstart events that trigger a double-tap event.  
		doubleTapDelay: 300,
		
		constructor: function(/*Object*/ args){
			args = args || {};
			
			this._calendar = args.datePackage ? args.datePackage.substr(args.datePackage.lastIndexOf(".")+1) : this._calendar; 
			this.dateModule = args.datePackage ? lang.getObject(args.datePackage, false) : date; 
			this.dateClassObj = this.dateModule.Date || Date; 
			this.dateLocaleModule = args.datePackage ? lang.getObject(args.datePackage+".locale", false) : locale; 
			
			this.rendererPool = [];
			this.rendererList = [];
			this.itemToRenderer = {};
			this._viewHandles = [];
		},
		
		destroy: function(preserveDom){
			// renderers
			while(this.rendererList.length > 0){
				this._destroyRenderer(this.rendererList.pop());
			}			
			for(kind in this._rendererPool){				
				var pool = this._rendererPool[kind];
				if(pool){
					while(pool.length > 0){
						this._destroyRenderer(pool.pop());
					}
				}
			}
			
			while(this._viewHandles.length > 0){
				this._viewHandles.pop().remove();
			}
		
			this.inherited(arguments);
		},
		
		_createRenderData: function(){
			// summary:
			//		Creates the object that contains all the data needed to render this widget.
			// tags:
			//		protected
		},
		
		_validateProperties: function(){
			// summary:
			//		Validates the widget properties before the rendering pass.
			// tags:
			//		protected
		},

		_setText: function(node, text, allowHTML){
			// summary:
			//		Creates a text node under the parent node after having removed children nodes if any.
			// node: Node
			//		The node that will contain the text node.
			// text: String
			//		The text to set to the text node.
			if(text != null){			
				if(!allowHTML && node.hasChildNodes()){
					// span > textNode
					node.childNodes[0].childNodes[0].nodeValue = text;
				}else{												
			
					while(node.hasChildNodes()){
						node.removeChild(node.lastChild);
					}				
			
					var tNode = win.doc.createElement("span");
					this.applyTextDir(tNode, text);					
					
					if(allowHTML){
						tNode.innerHTML = text;
					}else{
						tNode.appendChild(win.doc.createTextNode(text));
					}
					node.appendChild(tNode);
				}
			}
		},
		
		isAscendantHasClass: function(node, ancestor, className){
			// summary:
			//		Determines if a node has an ascendant node that has the css class specified.
			// node: Node
			//		The DOM node.
			// ancestor: Node
			//		The ancestor node used to limit the search in hierarchy.
			// className: String
			//		The css class name.
			// returns: Boolean
			
			while(node != ancestor && node != document){
				
				if(dojo.hasClass(node, className)){
					return true;
				}
				
				node = node.parentNode;
			}
			return false;
		},
		
		isWeekEnd: function(date){
			// summary:
			//		Determines whether the specified date is a week-end.
			//		This method is using dojo.date.locale.isWeekend() method as
			//		dojox.date.XXXX calendars are not supporting this method.
			// date: Date
			//		The date to test.  
			return locale.isWeekend(date);
		},
		
		getWeekNumberLabel: function(date){
			// summary:
			//		Returns the week number string from dojo.date.locale.format() method as
			//		dojox.date.XXXX calendar are not supporting the "w" pattern.
			// date: Date
			//		The date to format.
			if(date.toGregorian){
				date = date.toGregorian();
			}
			return locale.format(date, {
				selector: "date", 
				datePattern: "w"});
		},
		
		floorToDay: function(date, reuse){
			// summary:
			//		Floors the specified date to the start of day.
			// date: Date
			//		The date to floor.
			// reuse: Boolean
			//		Whether use the specified instance or create a new one. Default is false.
			// returns: Date
			return timeUtil.floorToDay(date, reuse, this.dateClassObj);
		},
		
		floorToMonth: function(date, reuse){
			// summary:
			//		Floors the specified date to the start of the date's month.
			// date: Date
			//		The date to floor.
			// reuse: Boolean
			//		Whether use the specified instance or create a new one. Default is false.
			// returns: Date
			return timeUtil.floorToMonth(date, reuse, this.dateClassObj);
		},
		
				
		floorDate: function(date, unit, steps, reuse){
			// summary:
			//		floors the date to the unit.
			// date: Date
			//		The date/time to floor.
			// unit: String
			//		The unit. Valid values are "minute", "hour", "day".
			// steps: Integer
			//		For "day" only 1 is valid.
			// reuse: Boolean
			//		Whether use the specified instance or create a new one. Default is false.			
			// returns: Date
			return timeUtil.floor(date, unit, steps, reuse, this.dateClassObj);
		},

		isToday: function(date){
			// summary:
			//		Returns whether the specified date is in the current day.
			// date: Date
			//		The date to test.
			// renderData: Object
			//		The current renderData
			// returns: Boolean
			return timeUtil.isToday(date, this.dateClassObj);
		},
		
		isStartOfDay: function(d){
			// summary:
			//		Tests if the specified date represents the starts of day. 
			// d:Date
			//		The date to test.
			// returns: Boolean
			return timeUtil.isStartOfDay(d, this.dateClassObj, this.dateModule);
		},
		
		isOverlapping: function(renderData, start1, end1, start2, end2, includeLimits){
			// summary:
			//		Computes if the first time range defined by the start1 and end1 parameters 
			//		is overlapping the second time range defined by the start2 and end2 parameters.
			// renderData: Object
			//		The render data.
			// start1: Date
			//		The start time of the first time range.
			// end1: Date
			//		The end time of the first time range.
			// start2: Date
			//		The start time of the second time range.
			// end2: Date
			//		The end time of the second time range.
			// includeLimits: Boolean
			//		Whether include the end time or not.
			// returns: Boolean
			if(start1 == null || start2 == null || end1 == null || end2 == null){
				return false;
			}
			
			var cal = renderData.dateModule;
			
			if(includeLimits){
				if(cal.compare(start1, end2) == 1 || cal.compare(start2, end1) == 1){
					return false;
				}					
			}else if(cal.compare(start1, end2) != -1 || cal.compare(start2, end1) != -1){
				return false;
			}
			return true; 
		},			 
			 
		computeRangeOverlap: function(renderData, start1, end1, start2, end2, includeLimits){
			// summary:
			//		Computes the overlap time range of the time ranges.
			//		Returns a vector of Date with at index 0 the start time and at index 1 the end time.
			// renderData: Object.
			//		The render data.
			// start1: Date
			//		The start time of the first time range.
			// end1: Date
			//		The end time of the first time range.
			// start2: Date
			//		The start time of the second time range.
			// end2: Date
			//		The end time of the second time range.
			// includeLimits: Boolean
			//		Whether include the end time or not.
			// returns: Date[]
			var cal = renderData.dateModule;
			
			if(start1 == null || start2 == null || end1 == null || end2 == null){
				return null;
			}
			
			var comp1 = cal.compare(start1, end2);
			var comp2 = cal.compare(start2, end1);
			
			if(includeLimits){
				
				if(comp1 == 0 || comp1 == 1 || comp2 == 0 || comp2 == 1){
					return null;
				}
			} else if(comp1 == 1 || comp2 == 1){
				return null;
			}
			
			return [
				this.newDate(cal.compare(start1, start2)>0 ? start1: start2, renderData),
				this.newDate(cal.compare(end1, end2)>0 ? end2: end1, renderData)
			];
		},
		
		isSameDay : function(date1, date2){
			// summary:
			//		Tests if the specified dates are in the same day.
			// date1: Date
			//		The first date.
			// date2: Date
			//		The second date.
			// returns: Boolean
			if(date1 == null || date2 == null){
				return false; 
			}
		
			return date1.getFullYear() == date2.getFullYear() &&
						 date1.getMonth() == date2.getMonth() &&
						 date1.getDate() == date2.getDate();
			 
		},
		
		computeProjectionOnDate: function(renderData, refDate, date, max){
			// summary:
			//		Computes the time to pixel projection in a day.
			// renderData: Object
			//		The render data.
			// refDate: Date
			//		The reference date that defines the destination date.
			// date: Date
			//		The date to project.
			// max: Integer
			//		The size in pixels of the representation of a day.
			// tags:
			//		protected
			// returns: Number

			var cal = renderData.dateModule;
			
			if(max <= 0 || cal.compare(date, refDate) == -1){
				return 0;
			}
			
			var referenceDate = this.floorToDay(refDate, false, renderData);

			if(date.getDate() != referenceDate.getDate()){
				if(date.getMonth() == referenceDate.getMonth()){
					if(date.getDate() < referenceDate.getDate()){
						return 0;
					} else if(date.getDate() > referenceDate.getDate()){
						return max;
					}
				}else{
					if(date.getFullYear() == referenceDate.getFullYear()){
						if(date.getMonth() < referenceDate.getMonth()){
							return 0;
						} else if(date.getMonth() > referenceDate.getMonth()){
							return max;
						}						 
					}else{
						if(date.getFullYear() < referenceDate.getFullYear()){
							return 0;
						} else if(date.getFullYear() > referenceDate.getFullYear()){
							return max;
						}
					}
				}
			}

			var res;

			if(this.isSameDay(refDate, date)){
				
				var d = lang.clone(refDate);
				var minTime = 0;
				
				if(renderData.minHours != null && renderData.minHours != 0){
					d.setHours(renderData.minHours);
					minTime = d.getHours() * 3600 + d.getMinutes() * 60 + d.getSeconds();
				}
				
				d = lang.clone(refDate);
				
				var maxTime;
				if(renderData.maxHours == null || renderData.maxHours == 24){
					maxTime = 86400; // 24h x 60m x 60s
				}else{
					d.setHours(renderData.maxHours);
					maxTime = d.getHours() * 3600 + d.getMinutes() * 60 + d.getSeconds();
				}
				
				//precision is the second
				//use this API for daylight time issues.
				var delta = date.getHours() * 3600 + date.getMinutes() * 60 + date.getSeconds() - minTime;
				
				if(delta < 0){
					return 0;
				}
				if(delta > maxTime){
					return max;
				}

				res = (max * delta)/(maxTime - minTime);
				
			}else{
				
				if(date.getDate() < refDate.getDate() && 
						date.getMonth() == refDate.getMonth()){
					return 0;
				}
				
				var d2 = this.floorToDay(date);
				var dp1 = renderData.dateModule.add(refDate, "day", 1);
				dp1 = this.floorToDay(dp1, false, renderData);
				
				if(cal.compare(d2, refDate) == 1 && cal.compare(d2, dp1) == 0 || cal.compare(d2, dp1) == 1){
					res =	max;
				}else{
					res = 0;
				}
			}
				
			return res;
		},	
		
		getTime: function(e, x, y, touchIndex){
			// summary:
			//		Returns the time displayed at the specified point by this component.
			// e: Event
			//		Optional mouse event.
			// x: Number
			//		Position along the x-axis with respect to the sheet container used if event is not defined.
			// y: Number
			//		Position along the y-axis with respect to the sheet container (scroll included) used if event is not defined.
			// touchIndex: Integer
			//		If parameter 'e' is not null and a touch event, the index of the touch to use.
			// returns: Date
			return null;
		},
		
		newDate: function(obj){
			// summary:
			//		Creates a new Date object.
			// obj: Object
			//		This object can have several values:
			//
			//		- the time in milliseconds since gregorian epoch.
			//		- a Date instance
			// returns: Date
			return timeUtil.newDate(obj, this.dateClassObj);			
		},
		
		_isItemInView: function(item){
			// summary:
			//		Computes whether the specified item is entirely in the view or not.
			// item: Object
			//		The item to test
			// returns: Boolean	
			var rd = this.renderData;
			var cal = rd.dateModule;
			
			if(cal.compare(item.startTime, rd.startTime) == -1){
				return false;
			} 			
			
			if(cal.compare(item.endTime, rd.endTime) == 1){
				return false;
			}
			
			return true;
		},
		
		_ensureItemInView: function(item){
			// summary:
			//		If needed, moves the item to be entirely in view.
			// item: Object
			//		The item to test
			// returns: Boolean
			//		Whether the item has been moved to be in view or not.
			// tags:
			//		protected

			var rd = this.renderData;
			var cal = rd.dateModule;
			
			var duration = Math.abs(cal.difference(item.startTime, item.endTime, "millisecond"));
			var fixed = false;
			
			if(cal.compare(item.startTime, rd.startTime) == -1){
				item.startTime = rd.startTime;
				item.endTime = cal.add(item.startTime, "millisecond", duration);
				fixed = true;
			}else if(cal.compare(item.endTime, rd.endTime) == 1){
				item.endTime = rd.endTime;
				item.startTime = cal.add(item.endTime, "millisecond", -duration);
				fixed = true;
			}			
			return fixed;
		},
		
		/////////////////////////////////////////////////////////
		//
		// Scrollable
		//
		/////////////////////////////////////////////////////////
				
		// scrollable: Boolean
		//		Indicates whether the view can be scrolled or not.
		scrollable: true,
		
		// autoScroll: Boolean
		//		Indicates whether the view can be scrolled automatically. 
		//		Auto scrolling is used when moving focus to a non visible renderer using keyboard 
		//		and while editing an item. 
		autoScroll: true,				
		
		_autoScroll: function(gx, gy, orientation){
			// summary:
			//		Starts or stops the auto scroll according to the mouse cursor position during an item editing.
			// gx: Integer
			//		The position of the mouse cursor along the x-axis.
			// gy: Integer
			//		The position of the mouse cursor along the y-axis.			
			// tags:
			//		extension

			return false;
		},
			
		// scrollMethod: String
		//		Method used to scroll the view, for example the scroll of column view.
		//		Valid value are:
		//
		//		- "auto": let the view decide (default),
		//		- "css": use css 3d transform,
		//		- "dom": use the scrollTop property.
		scrollMethod: "auto",
		
		_setScrollMethodAttr: function(value){
			if(this.scrollMethod != value){
				this.scrollMethod = value;
				
				// reset
				if(this._domScroll !== undefined){
					if(this._domScroll){
						domStyle.set(this.sheetContainer, this._cssPrefix+"transform", "translateY(-"+pos+"px)");
					}else{
						this.scrollContainer.scrollTop = 0
					}
				}
				
				delete this._domScroll;
				var pos = this._getScrollPosition();
				delete this._scrollPos;
				
				this._setScrollPosition(pos);
			}
			
		},
		
		_startAutoScroll: function(step){
			// summary:
			//		Starts the auto scroll of the view (if it's scrollable). Used only during editing.
			// tags:
			//		protected
			var sp = this._scrollProps;
			if(!sp){
				sp = this._scrollProps = {};
			}
				
			sp.scrollStep = step;
			
			if (!sp.isScrolling){
				sp.isScrolling = true;
				sp.scrollTimer = setInterval(lang.hitch(this, this._onScrollTimer_tick), 10);
			}		
		},
				
		_stopAutoScroll: function(){
			// summary:
			//		Stops the auto scroll of the view (if it's scrollable). Used only during editing.
			// tags:
			//		protected
			var sp = this._scrollProps;
			
			if (sp && sp.isScrolling) {
				clearInterval(sp.scrollTimer);
				sp.scrollTimer = null;
			}
			this._scrollProps = null;
		},
		
		_onScrollTimer_tick: function(pos){
		},
		
		_scrollPos: 0,
		
		getCSSPrefix: function(){
			// summary:
			//		Utility method that return the specific CSS prefix
			//		for non standard CSS properties. Ex: -moz-border-radius.
			if(has("ie")){
				return "-ms-";
			}
			if(has("webkit")){
				return "-webkit-";
			}
			if(has("mozilla")){
				return "-moz-";
			}
			if(has("opera")){
				return "-o-";
			}			
		},				
		
		_setScrollPosition: function(pos){
			// summary:
			//		Sets the scroll position (if the view is scrollable), using the scroll method defined.
			// tags:
			//		protected

			if(this._scrollPos == pos){
				return;
			}
			
			// determine scroll method once.
			if(this._domScroll === undefined){
			
				var sm = this.get("scrollMethod");
				if(sm === "auto"){					
					this._domScroll = !has("ios") && !has("android") && !has("webkit");
				}else{
					this._domScroll = sm === "dom";
				}
			}
			
			this._scrollPos = pos;
							
			if(this._domScroll){				
				this.scrollContainer.scrollTop = pos;				
			}else{			
				if(!this._cssPrefix){
					this._cssPrefix =  this.getCSSPrefix();
				}
				domStyle.set(this.sheetContainer, this._cssPrefix+"transform", "translateY(-"+pos+"px)");
			}
		},
		
		_getScrollPosition: function(){
			// summary:
			//		Returns the scroll position (if the view is scrollable), using the scroll method defined.
			// tags:
			//		protected

			return this._scrollPos; 
		},
		
		scrollView: function(dir){
			// summary:
			//		If the view is scrollable, scrolls it to the specified direction.
			// dir: Integer
			//		Direction of the scroll. Valid values are -1 and 1.
			// tags:
			//		extension
		},
		
		ensureVisibility: function(start, end, margin, visibilityTarget, duration){
			// summary:
			//		Scrolls the view if the [start, end] time range is not visible or only partially visible.
			// start: Date
			//		Start time of the range of interest.
			// end: Date
			//		End time of the range of interest.
			// margin: int
			//		Margin in minutes around the time range.
			// visibilityTarget: String
			//		The end(s) of the time range to make visible.
			//		Valid values are: "start", "end", "both".	
			// duration: Number
			//		Optional, the maximum duration of the scroll animation.
			// tags:
			//		extension

		},

	  	////////////////////////////////////////////////////////
		//
		// Store & Items
		//
		////////////////////////////////////////////////////////
		
		_getStoreAttr: function(){
			if(this.owner){
				return this.owner.get("store");
			}
			return this.store;
		},

		_setItemsAttr: function(value){
			this._set("items", value);
			this.displayedItemsInvalidated = true;
		},

		_refreshItemsRendering: function(){
			var rd = this.renderData;
			this._computeVisibleItems(rd);
			this._layoutRenderers(rd);
		},
		
		invalidateLayout: function(){
			// summary:
			//		Triggers a re-layout of the renderers.
			this._layoutRenderers(this.renderData);
		},
		
		resize: function(){
			//this.invalidateRendering();
		},

		////////////////////////////////////////////////////////
		//
		// Layout
		//
		////////////////////////////////////////////////////////
				
		computeOverlapping: function(layoutItems, func){
			// summary:
			//		Computes the overlap layout of a list of items. A lane and extent properties are added to each layout item.
			// layoutItems: Object[]
			//		List of layout items, each item must have a start and end properties.
			// addedPass: Function
			//		Whether computes the extent of each item renderer on free sibling lanes.
			// returns: Object
			// tags:
			//		protected

			
			if(layoutItems.length == 0){
				return {
					numLanes: 0,
					addedPassRes: [1]
				};
			}
			
			var numLanesPerInt;
			var lanes = [];

			for(var i=0; i<layoutItems.length; i++){
				var layoutItem = layoutItems[i];
				this._layoutPass1(layoutItem, lanes);
			}

			var addedPassRes;
			if(func){
				addedPassRes = lang.hitch(this, func)(lanes);
			}
			
			return {
				numLanes: lanes.length,
				addedPassRes: addedPassRes
			};
		},

		_layoutPass1: function (layoutItem, lanes){
			// summary:
			//		First pass of the overlap layout. Find a lane where the item can be placed or create a new one.
			// layoutItem: Object
			//		An object that contains a start and end properties at least.
			// lanes:
			//		The array of lanes.
			// tags:
			//		protected
			var stop = true;
			
			for(var i=0; i<lanes.length; i++){
				var lane = lanes[i]; 
				stop = false;
				for(var j=0; j<lane.length && !stop; j++){
					if(lane[j].start < layoutItem.end && layoutItem.start < lane[j].end){
						// one already placed item is overlapping
						stop = true;
						lane[j].extent = 1;
					} 
				}
				if(!stop){
					//we have found a place
					layoutItem.lane = i;
					layoutItem.extent = -1;
					lane.push(layoutItem);
					return;
				}
			}
			
			//no place found -> add a lane
			lanes.push([layoutItem]);
			layoutItem.lane = lanes.length-1;			 
			layoutItem.extent = -1;
		},
			
		
		
		_layoutInterval: function(renderData, index, start, end, items){
			// summary:
			//		For each item in the items list: retrieve a renderer, compute its location and size and add it to the DOM.
			// renderData: Object
			//		The render data.
			// index: Integer
			//		The index of the interval.
			// start: Date
			//		The start time of the displayed date interval.
			// end: Date
			//		The end time of the displayed date interval.
			// items: Object[]
			//		The list of the items to represent.
			// tags:
			//		extension
		},
		
		// layoutPriorityFunction: Function
		//		An optional comparison function use to determine the order the item will be laid out
		//		The function is used to sort an array and must, as any sorting function, take two items 
		//		as argument and must return an integer whose sign define order between arguments.
		//		By default, a comparison by start time then end time is used.
		layoutPriorityFunction: null,
		
		_sortItemsFunction: function(a, b){
			var res = this.dateModule.compare(a.startTime, b.startTime);
			if(res == 0){
				res = -1 * this.dateModule.compare(a.endTime, b.endTime);
			}
			return res;
		},
		
		_layoutRenderers: function(renderData){
			// summary:
			//		Renders the data items. This method will call the _layoutInterval() method.
			// renderData: Object
			//		The render data.
			// tags:
			//		protected
			if(!renderData.items){
				return;
			}
						
			// recycle renderers first
			this._recycleItemRenderers();
			
			var cal = renderData.dateModule; 
			
			// Date
			var startDate = this.newDate(renderData.startTime);
			
			// Date and time
			var startTime = lang.clone(startDate);
			
			var endDate;
			
			var items = renderData.items.concat();

			var itemsTemp = [], events;
			
			var index = 0;
			
			while(cal.compare(startDate, renderData.endTime) == -1 && items.length > 0){
			
				endDate = cal.add(startDate, this._layoutUnit, this._layoutStep);
				endDate = this.floorToDay(endDate, true, renderData);
				
				var endTime = lang.clone(endDate);
				
				if(renderData.minHours){
					startTime.setHours(renderData.minHours);
				}
				
				if(renderData.maxHours && renderData.maxHours != 24){
					endTime = cal.add(endDate, "day", -1);
					endTime = this.floorToDay(endTime, true, renderData);
					endTime.setHours(renderData.maxHours);
				}
				
				// look for events that overlap the current sub interval
				events = arr.filter(items, function(item){
					var r = this.isOverlapping(renderData, item.startTime, item.endTime, startTime, endTime);
					if(r){
						// item was not fully processed as it overlaps another sub interval
						if(cal.compare(item.endTime, endTime) == 1){
							itemsTemp.push(item);
						}	
					}else{
						itemsTemp.push(item);
					}
					return r;
				}, this);

				items = itemsTemp;
				itemsTemp = [];
				
				// if event are in the current sub interval, layout them
				if(events.length > 0){
					// Sort the item according a sorting function, by default start time then end time comparison are used.
					events.sort(lang.hitch(this, this.layoutPriorityFunction ? this.layoutPriorityFunction : this._sortItemsFunction));
					this._layoutInterval(renderData, index, startTime, endTime, events);
				}

				startDate = endDate;
				startTime = lang.clone(startDate);

				index++;
			}			
			
			this._onRenderersLayoutDone(this);
		},
	
		/////////////////////////////////////////////////////////////////
		//
		//	Renderers management
		//
		////////////////////////////////////////////////////////////////
		
		_recycleItemRenderers: function(remove){
			// summary:
			//		Recycles all the item renderers.
			// remove: Boolean
			//		Whether remove the DOM node from it parent.
			// tags:
			//		protected
			while(this.rendererList.length>0){
				this._recycleRenderer(this.rendererList.pop(), remove);
			}
			this.itemToRenderer = {};
		},
				
		// rendererPool: [protected] Array
		//		The stack of recycled renderers available.
		rendererPool: null,
		
		// rendererList: [protected] Array
		//		The list of used renderers
		rendererList: null,
		
		// itemToRenderer: [protected] Object
		//		The associated array item to renderer list.
		itemToRenderer: null,
		
		getRenderers: function(item){
			// summary:
			//		Returns the renderers that are currently used to displayed the speficied item.
			//		Returns an array of objects that contains two properties:
			//		- container: The DOM node that contains the renderer.
			//		- renderer: The dojox.calendar._RendererMixin instance.
			//		Do not keep references on the renderers are they are recycled and reused for other items.
			// item: Object
			//		The data or render item.
			// returns: Object[]
			if(item == null || item.id == null){
				return null;
			}
			var list = this.itemToRenderer[item.id];
			return list == null ? null : list.concat();
		},
		
		_rendererHandles: {},
		
		// itemToRendererKindFunc: Function
		//		An optional function to associate a kind of renderer ("horizontal", "label" or null) with the specified item.
		//		By default, if an item is lasting more that 24 hours an horizontal item is used, otherwise a label is used.
		itemToRendererKindFunc: null,
		
		_itemToRendererKind: function(item){
			// summary: 
			//		Associates a kind of renderer with a data item.
			// item: Object
			//		The data item.
			// returns: String
			// tags:
			//		protected			
			if(this.itemToRendererKindFunc){
				return this.itemToRendererKindFunc(item);
			}
			return this._defaultItemToRendererKindFunc(item); // String
		},
		
		_defaultItemToRendererKindFunc:function(item){
			// tags:
			//		private
			return null
		},

		_createRenderer: function(item, kind, rendererClass, cssClass){			
			// summary: 
			//		Creates an item renderer of the specified kind. A renderer is an object with the "container" and "instance" properties.
			// item: Object
			//		The data item.
			// kind: String
			//		The kind of renderer.
			// rendererClass: Object
			//		The class to instantiate to create the renderer.
			// returns: Object
			// tags:
			//		protected				
						
			if(item != null && kind != null && rendererClass != null){
				
				var res, renderer;
				
				var pool = this.rendererPool[kind];
				
				if(pool != null){
					res = pool.shift();
				}

				if (res == null){

					renderer = new rendererClass;

					// the container allow to lay out the renderer
					// this is important for styling (in box model 
					// content size does take into account border)
					var container = domConstruct.create("div");

					// The DOM object that will contain the event renderer
					container.className = "dojoxCalendarEventContainer "+ cssClass ;
					container.appendChild(renderer.domNode);
					
					res = {
						renderer: renderer,
						container: renderer.domNode,
						kind: kind
					};

					this.onRendererCreated(res);
					
				} else {
					renderer = res.renderer; 
					
					this.onRendererReused(renderer);
				}
				
				renderer.owner = this;
				renderer.set("rendererKind", kind);
				renderer.set("item", item);
				
				var list = this.itemToRenderer[item.id];
				if (list == null) {
					this.itemToRenderer[item.id] = list = [];
				}
				list.push(res);
				
				this.rendererList.push(res);
				return res;	
			}
			return null;
		},	
						
		onRendererCreated: function(renderer){
			// summary:
			//		Event dispatched when an item renderer has been created.
			// renderer: dojox/calendar/_RendererMixin
			//		The renderer created.
			// tags:
			//		callback
		},	
		
		onRendererRecycled: function(renderer){
			// summary:
			//		Event dispatched when an item renderer has been recycled.
			// renderer: dojox/calendar/_RendererMixin
			//		The renderer recycled.
			// tags:
			//		callback

		},
		
		onRendererReused: function(renderer){
			// summary:
			//		Event dispatched when an item renderer that was recycled is reused.
			// renderer: dojox/calendar/_RendererMixin
			//		The renderer reused.
			// tags:
			//		callback
		},
		
		onRendererDestroyed: function(renderer){
			// summary:
			//		Event dispatched when an item renderer is destroyed.
			// renderer: dojox/calendar/_RendererMixin
			//		The renderer destroyed.
			// tags:
			//		callback
		},
				
		_onRenderersLayoutDone: function(view){
			// tags:
			//		private

			this.onRenderersLayoutDone(view);
			if(this.owner != null){
				this.owner.onRenderersLayoutDone(view);
			}				
		},
									
		onRenderersLayoutDone: function(view){
			// summary:
			//		Event triggered when item renderers layout has been done.
			// tags:
			//		callback
		},

		_recycleRenderer: function(renderer, remove){
			// summary: 
			//		Recycles the item renderer to be reused in the future.
			// renderer: dojox/calendar/_RendererMixin
			//		The item renderer to recycle.
			// tags:
			//		protected			
								
			this.onRendererRecycled(renderer);
			
			var pool = this.rendererPool[renderer.kind];
			
			if(pool == null){
				this.rendererPool[renderer.kind] = [renderer];
			}else{
				pool.push(renderer);
			}
								
			if(remove){
				renderer.container.parentNode.removeChild(renderer.container);
			}

			domStyle.set(renderer.container, "display", "none");

			renderer.renderer.owner = null;
			renderer.renderer.set("item", null);
		},
							
		_destroyRenderer: function(renderer){
			// summary: 
			//		Destroys the item renderer.
			// renderer: dojox/calendar/_RendererMixin
			//		The item renderer to destroy.
			// tags:
			//		protected
			this.onRendererDestroyed(renderer);
			
			var ir = renderer.renderer;
			
			arr.forEach(ir.__handles, function(handle){
				handle.remove();
			});				
			
			if(ir["destroy"]){
				ir.destroy();
			}
			
			html.destroy(renderer.container);	
		},
		
		_destroyRenderersByKind: function(kind){
			// tags:
			//		private

			var list = [];
			for(var i=0;i<this.rendererList.length;i++){
				var ir = this.rendererList[i];
				if(ir.kind == kind){
					this._destroyRenderer(ir);
				}else{
					list.push(ir);
				}
			}
			
			this.rendererList = list;
			
			var pool = this.rendererPool[kind];
			if(pool){
				while(pool.length > 0){
					this._destroyRenderer(pool.pop());
				}
			}
			
		},
				
					
		_updateEditingCapabilities: function(item, renderer){
			// summary:
			//		Update the moveEnabled and resizeEnabled properties of a renderer according to its event current editing state.
			// item: Object
			//		The event data item.
			// renderer: dojox/calendar/_RendererMixin
			//		The item renderer.
			// tags:
			//		protected

			var moveEnabled = this.isItemMoveEnabled(item, renderer.rendererKind);
			var resizeEnabled = this.isItemResizeEnabled(item, renderer.rendererKind);
			var changed = false;
			
			if(moveEnabled != renderer.get("moveEnabled")){
				renderer.set("moveEnabled", moveEnabled);
				changed = true;
			}
			if(resizeEnabled != renderer.get("resizeEnabled")){
				renderer.set("resizeEnabled", resizeEnabled);
				changed = true;
			}
			
			if(changed){
				renderer.updateRendering();
			}
		},
	
		updateRenderers: function(obj, stateOnly){
			// summary:
			//		Updates all the renderers that represents the specified item(s).
			// obj: Object
			//		A render item or an array of render items.
			// stateOnly: Boolean
			//		Whether only the state of the item has changed (selected, edited, edited, focused) or a more global change has occured.
			// tags:
			//		protected

			if(obj == null){
				return;
			}
			
			var items = lang.isArray(obj) ? obj : [obj];
			
			for(var i=0; i<items.length; i++){
				
				var item = items[i];
				
				if(item == null || item.id == null){
					continue;
				}
						
				var list = this.itemToRenderer[item.id];
				
				if(list == null){
					continue;
				}
				
				var selected = this.isItemSelected(item);
				var hovered = this.isItemHovered(item);
				var edited = this.isItemBeingEdited(item);
				var focused = this.showFocus ? this.isItemFocused(item) : false;
				
				for(var j = 0; j < list.length; j++){
					
					var renderer = list[j].renderer;
					renderer.set("hovered", hovered);
					renderer.set("selected", selected);
					renderer.set("edited", edited);
					renderer.set("focused", focused);
					
					this.applyRendererZIndex(item, list[j], hovered, selected, edited, focused);
					
					if(!stateOnly){
						renderer.set("item", item); // force content refresh
						if(renderer.updateRendering){
							renderer.updateRendering(); // reuse previously set dimensions	
						}
					}
				}
				
			}
		},
		
		applyRendererZIndex: function(item, renderer, hovered, selected, edited, focused){
			// summary:
			//		Applies the z-index to the renderer based on the state of the item.
			//		This methods is setting a z-index of 20 is the item is selected or edited 
			//		and the current lane value computed by the overlap layout (i.e. the renderers 
			//		are stacked according to their lane).
			// item: Object
			//		The render item.
			// renderer: Object
			//		A renderer associated with the render item.
			// hovered: Boolean
			//		Whether the item is hovered or not.
			// selected: Boolean
			//		Whether the item is selected or not.
			// edited: Boolean
			//		Whether the item is being edited not not.
			// focused: Boolean
			//		Whether the item is focused not not.
			// tags:
			//		protected
						
			domStyle.set(renderer.container, {"zIndex": edited || selected ? 20: item.lane == undefined ? 0 : item.lane});
		},
		
		getIdentity: function(item){
			return this.owner ? this.owner.getIdentity(item) : item.id; 
		},		
		
		/////////////////////////////////////////////////////
		//
		// Hovered item
		//
		////////////////////////////////////////////////////

		_setHoveredItem: function(item, renderer){
			// summary:
			//		Sets the current hovered item.
			// item: Object
			//		The data item.
			// renderer: dojox/calendar/_RendererMixin
			//		The item renderer.
			// tags:
			//		protected

			if(this.owner){
				this.owner._setHoveredItem(item, renderer);
				return;
			}
			
			if(this.hoveredItem && item && this.hoveredItem.id != item.id || 
				item == null || this.hoveredItem == null){
				var old = this.hoveredItem;
				this.hoveredItem = item;
				
				this.updateRenderers([old, this.hoveredItem], true);
				
				if(item && renderer){
					this._updateEditingCapabilities(item, renderer);
				}
			}
		},
		
		// hoveredItem: Object
		//		The currently hovered data item.
		hoveredItem: null,
		
		isItemHovered: function(item){
			// summary:
			//		Returns whether the specified item is hovered or not.
			// item: Object
			//		The item.
			// returns: Boolean
			if (this._isEditing && this._edProps){
				return item.id == this._edProps.editedItem.id;
			}else{
				return this.owner ?  
					this.owner.isItemHovered(item) : 
					this.hoveredItem != null && this.hoveredItem.id == item.id;
			}
		},
		
		isItemFocused: function(item){
			// summary:
			//		Returns whether the specified item is focused or not.
			// item: Object
			//		The item.
			// returns: Boolean
			return this._isItemFocused ? this._isItemFocused(item) : false;
		},
		
		////////////////////////////////////////////////////////////////////
		//
		// Selection delegation
		//
		///////////////////////////////////////////////////////////////////
		
		_setSelectionModeAttr: function(value){
			if(this.owner){
				this.owner.set("selectionMode", value);
			}else{
				this.inherited(arguments);
			}			
		},					
		
		_getSelectionModeAttr: function(value){			
			if(this.owner){
				return this.owner.get("selectionMode");
			}else{
				return this.inherited(arguments);
			}
		},
		
		_setSelectedItemAttr: function(value){			
			if(this.owner){
				this.owner.set("selectedItem", value);
			}else{
				this.inherited(arguments);
			}
		},
		
		_getSelectedItemAttr: function(value){			
			if(this.owner){
				return this.owner.get("selectedItem");
			}else{
				return this.selectedItem; // no getter on super class (dojox.widget.Selection)
			}
		},
		
		_setSelectedItemsAttr: function(value){			
			if(this.owner){
				this.owner.set("selectedItems", value);
			}else{
				this.inherited(arguments);
			}
		},
		
		_getSelectedItemsAttr: function(){			
			if(this.owner){
				return this.owner.get("selectedItems");
			}else{
				return this.inherited(arguments);
			}
		},
		
		isItemSelected: function(item){			
			if(this.owner){
				return this.owner.isItemSelected(item);
			}else{
				return this.inherited(arguments);
			}
		},
		
		selectFromEvent: function(e, item, renderer, dispatch){			
			if(this.owner){
				this.owner.selectFromEvent(e, item, renderer, dispatch);
			}else{
				this.inherited(arguments);
			}
		},
		
		setItemSelected: function(item, value){
			if(this.owner){
				this.owner.setItemSelected(item, value);
			}else{
				this.inherited(arguments);
			}
		},
		
		////////////////////////////////////////////////////////////////////
		//
		// Event creation
		//
		///////////////////////////////////////////////////////////////////
		
		createItemFunc: null,
		/*=====
		createItemFunc: function(view, d, e){
		 	// summary:
			//		A user supplied function that creates a new event.
			// view:
			//		the current view,
			// d:
			//		the date at the clicked location.
			// e:
			//		the mouse event (can be used to return null for example)
		},
		=====*/

				
		_getCreateItemFuncAttr: function(){			
			if(this.owner){
				return this.owner.get("createItemFunc");
			}else{
				return this.createItemFunc;
			}
		},
		
		// createOnGridClick: Boolean
		//		Indicates whether the user can create new event by clicking and dragging the grid.
		//		A createItem function must be defined on the view or the calendar object.
		createOnGridClick: false,
		
		_getCreateOnGridClickAttr: function(){
			if(this.owner){
				return this.owner.get("createOnGridClick");
			}else{
				return this.createOnGridClick;
			}
		},
		
		////////////////////////////////////////////////////////////////////
		//
		// Event creation
		//
		///////////////////////////////////////////////////////////////////	
		
		_gridMouseDown: false,
				
		_onGridMouseDown: function(e){
			// tags:
			//		private
			this._gridMouseDown = true;
								
			this.showFocus = false;
								
			if(this._isEditing){	
				this._endItemEditing("mouse", false);
			}
			
			this._doEndItemEditing(this.owner, "mouse");			
			
			this.set("focusedItem", null);
			this.selectFromEvent(e, null, null, true);
			
			if(this._setTabIndexAttr){
				this[this._setTabIndexAttr].focus();
			}
								
			if(this._onRendererHandleMouseDown){
				
				var f = this.get("createItemFunc");
				
				if(!f){
					return;
				}
				
				var newItem = f(this, this.getTime(e), e);
								
				var store = this.get("store");
											
				if(!newItem || store == null){
					return;
				}
				
				store.put(newItem);
				
				var renderers = this.getRenderers(newItem);
				// renderer created when item put in store
				if(renderers && renderers.length>0){
					var renderer = renderers[0];					
					if(renderer){
						this._onRendererHandleMouseDown(e, renderer.renderer, "resizeEnd");
					}					
				}
			}
		},
		
		_onGridMouseMove: function(e){
			// tags:
			//		private
		},
		
		_onGridMouseUp: function(e){
			// tags:
			//		private
		},
		
		_onGridTouchStart: function(e){
			// tags:
			//		private

			var p = this._edProps;

			this._gridProps = {
				event: e,				
				fromItem: this.isAscendantHasClass(e.target, this.eventContainer, "dojoxCalendarEventContainer")
			};			
	
			if(this._isEditing){
				
				if(this._gridProps){
					this._gridProps.editingOnStart = true;
				}

				lang.mixin(p, this._getTouchesOnRenderers(e, p.editedItem));
				
				if(p.touchesLen == 0){
					
					if(p && p.endEditingTimer){
						clearTimeout(p.endEditingTimer);
						p.endEditingTimer = null;
					}
					this._endItemEditing("touch", false);
				}
			}
			
			this._doEndItemEditing(this.owner, "touch");		

			event.stop(e);
			
		},
		
		_doEndItemEditing: function(obj, eventSource){
			// tags:
			//		private

			if(obj && obj._isEditing){
				p = obj._edProps;
				if(p && p.endEditingTimer){
					clearTimeout(p.endEditingTimer);
					p.endEditingTimer = null;
				}
				obj._endItemEditing(eventSource, false);
			}	
		},
					
		_onGridTouchEnd: function(e){
			// tags:
			//		private
		},
		
		_onGridTouchMove: function(e){
			// tags:
			//		private
		},
		
		__fixEvt: function(e){
			// summary:
			//		Extension point for a view to add some event properties to a calendar event.
			// tags:
			//		callback
			return e;
		},
		
		_dispatchCalendarEvt: function(e, name){
			// summary:
			//		Adds view properties to event and enable bubbling at owner level.
			// e: Event
			//		The dispatched event.
			// name: String
			//		The event name.
			// tags:
			//		protected
			
			e = this.__fixEvt(e);
			this[name](e);
			if(this.owner){
				this.owner[name](e);
			}
			return e;
		},

		_onGridClick: function(e){
			// tags:
			//		private
			if(!e.triggerEvent){
				e = {
					date: this.getTime(e),
					triggerEvent: e
				};
			}	
			
			this._dispatchCalendarEvt(e, "onGridClick");
		},
		
		onGridClick: function(e){
			// summary:
			//		Event dispatched when the grid has been clicked.
			// e: __GridClickEventArgs
			//		The event dispatched when the grid is clicked.
			// tags:
			//		callback
		},
		
		_onGridDoubleClick: function(e){
			// tags:
			//		private

			if(!e.triggerEvent){
				e = {
					date: this.getTime(e),
					triggerEvent: e
				};
			}
						
			this._dispatchCalendarEvt(e, "onGridDoubleClick");
		},
				
		onGridDoubleClick: function(e){
			// summary:
			//		Event dispatched when the grid has been double-clicked.
			// e: __GridClickEventArgs
			//		The event dispatched when the grid is double-clicked.
			// tags:
			//		protected

		},
		
		_onItemClick: function(e){
			// tags:
			//		private

			this._dispatchCalendarEvt(e, "onItemClick");
		},
		
		onItemClick: function(e){
			// summary:
			//		Event dispatched when an item renderer has been clicked.
			// e: __ItemMouseEventArgs
			//		The event dispatched when an item is clicked.
			// tags:
			//		callback

		},
		
		_onItemDoubleClick: function(e){
			// tags:
			//		private

			this._dispatchCalendarEvt(e, "onItemDoubleClick");	
		},
		
		onItemDoubleClick: function(e){
			// summary:
			//		Event dispatched when an item renderer has been double-clicked.
			// e: __ItemMouseEventArgs
			//		The event dispatched when an item is double-clicked.
			// tags:
			//		callback

		},

		_onItemContextMenu: function(e){
			this._dispatchCalendarEvt(e, "onItemContextMenu");
			// tags:
			//		private

		},
		
		onItemContextMenu: function(e){
			// summary:
			//		Event dispatched when an item renderer has been context-clicked.
			// e: __ItemMouseEventArgs
			//		The event dispatched when an item is context-clicked.
			// tags:
			//		callback

		},
		
		//////////////////////////////////////////////////////////
		//
		//	Editing
		//
		//////////////////////////////////////////////////////////

		_getStartEndRenderers: function(item){
			// summary:
			//		Returns an array that contains the first and last renderers of an item 			
			//		that are currently displayed. They could be the same renderer if only one renderer is used.
			// item: Object
			//		The render item.
			// returns: Object[]
			// tags:
			//		protected


			var list = this.itemToRenderer[item.id];

			if(list == null){
				return;
			}

			// trivial and most common use case.
			if(list.length == 1){
				var node = list[0].renderer;
				return [node, node];
			}

			var rd = this.renderData;
			var resizeStartFound = false;
			var resizeEndFound = false;

			var res = [];

			for(var i=0; i<list.length; i++){

				var ir = list[i].renderer;

				if (!resizeStartFound){
					resizeStartFound = rd.dateModule.compare(ir.item.range[0], ir.item.startTime) == 0;
					res[0] = ir;
				}

				if (!resizeEndFound){
					resizeEndFound =  rd.dateModule.compare(ir.item.range[1], ir.item.endTime) == 0;
					res[1] = ir;
				}

				if (resizeStartFound && resizeEndFound){
					break;	
				}
			}

			return res;			
		},
								
		// editable: Boolean
		//		A flag that indicates whether or not the user can edit
		//		items in the data provider.
		//		If <code>true</code>, the item renderers in the control are editable.
		//		The user can click on an item renderer, or use the keyboard or touch devices, to move or resize the associated event.
		editable: true,

		// moveEnabled: Boolean
		//		A flag that indicates whether the user can move items displayed.
		//		If <code>true</code>, the user can move the items.
		moveEnabled: true,

		// resizeEnabled: Boolean
		//		A flag that indicates whether the items can be resized.
		//		If `true`, the control supports resizing of items.
		resizeEnabled: true,
		
		isItemEditable: function(item, rendererKind){
			// summary:
			//		Computes whether particular item renderer can be edited or not.
			//		By default it is using the editable property value.
			// item: Object
			//		The item represented by the renderer.
			// rendererKind: String
			//		The kind of renderer.
			// returns: Boolean
			return this.editable && (this.owner ? this.owner.isItemEditable() : true);
		},

		isItemMoveEnabled: function(item, rendererKind){
			// summary:
			//		Computes whether particular item renderer can be moved.
			//		By default it is using the moveEnabled property value.
			// item: Object
			//		The item represented by the renderer.
			// rendererKind: String
			//		The kind of renderer.
			// returns: Boolean
			return this.isItemEditable(item, rendererKind) && this.moveEnabled && 
				(this.owner ? this.owner.isItemMoveEnabled(item, rendererKind): true);
		},
		
		isItemResizeEnabled: function(item, rendererKind){
			// summary:
			//		Computes whether particular item renderer can be resized.
			//		By default it is using the resizedEnabled property value.
			// item: Object
			//		The item represented by the renderer.
			// rendererKind: String
			//		The kind of renderer.
			// returns: Boolean
			
			return this.isItemEditable(item, rendererKind) && this.resizeEnabled && 
				(this.owner ? this.owner.isItemResizeEnabled(item, rendererKind): true);
		},

		// _isEditing: Boolean
		//		Whether an item is being edited or not.
		_isEditing: false,
		
		isItemBeingEdited: function(item){
			// summary:
			//		Returns whether an item is being edited or not.
			// item: Object
			//		The item to test.
			// returns: Boolean
			return this._isEditing && this._edProps && this._edProps.editedItem && this._edProps.editedItem.id == item.id;
		},
		
		_setEditingProperties: function(props){
			// summary:
			//		Registers the editing properties used by the editing functions.
			//		This method should only be called by editing interaction mixins like Mouse, Keyboard and Touch.
			// tags:
			//		protected

			this._edProps = props;
		},
		
		_startItemEditing: function(item, eventSource){
			// summary:
			//		Configures the component, renderers to start one (mouse) of several (touch, keyboard) editing gestures.
			// item: Object
			//		The item that will be edited.
			// eventSource: String
			//		"mouse", "keyboard", "touch"
			// tags:
			//		protected

			this._isEditing = true;			
			var p = this._edProps;
			
			p.editedItem = item;
			p.eventSource = eventSource;
			
			p.secItem = this._secondarySheet ? this._findRenderItem(item.id, this._secondarySheet.renderData.items) : null;
			p.ownerItem = this.owner ? this._findRenderItem(item.id, this.items) : null;
						
			if (!p.liveLayout){
				p.editSaveStartTime = item.startTime;
				p.editSaveEndTime = item.endTime;
				
				p.editItemToRenderer = this.itemToRenderer;
				p.editItems = this.renderData.items;
				p.editRendererList = this.rendererList;
				
				this.renderData.items = [p.editedItem];
				var id = p.editedItem.id;
			
				this.itemToRenderer = {};
				this.rendererList = [];
				var list = p.editItemToRenderer[id];
				
				p.editRendererIndices = [];
				
				arr.forEach(list, lang.hitch(this, function(ir, i){
					if(this.itemToRenderer[id] == null){
						this.itemToRenderer[id] = [ir];
					}else{
						this.itemToRenderer[id].push(ir);
					}
					this.rendererList.push(ir);
				}));
				
				// remove in old map & list the occurrence used by the edited item
				p.editRendererList = arr.filter(p.editRendererList, function(ir){
					return ir != null && ir.renderer.item.id != id;
				});
				delete p.editItemToRenderer[id];
			}
			
			// graphic feedback refresh
			this._layoutRenderers(this.renderData);
			
			this._onItemEditBegin({
				item: item,
				eventSource: eventSource
			});
		},
		
		_onItemEditBegin: function(e){
			// tags:
			//		private

			this._editStartTimeSave = this.newDate(e.item.startTime);
			this._editEndTimeSave = this.newDate(e.item.endTime);
			
			this._dispatchCalendarEvt(e, "onItemEditBegin");
		},
		
		onItemEditBegin: function(e){
			// summary:
			//		Event dispatched when the item is entering the editing mode.
			// tags:
			//		callback

		},
		
		_endItemEditing: function(/*String*/eventSource, /*Boolean*/canceled){
			// summary:
			//		Leaves the item editing mode.
			// item: Object
			//		The item that was edited.
			// eventSource: String
			//		"mouse", "keyboard", "touch"
			// tags:
			//		protected

			this._isEditing = false;					
			
			var p = this._edProps;
			
			arr.forEach(p.handles, function(handle){
				handle.remove();
			});					
						
			if (!p.liveLayout){
				this.renderData.items = p.editItems;
				this.rendererList = p.editRendererList.concat(this.rendererList);
				lang.mixin(this.itemToRenderer, p.editItemToRenderer);
			}
			
			var store = this.get("store");
						
			this._onItemEditEnd(lang.mixin(this._createItemEditEvent(), {
				item: this.renderItemToItem(p.editedItem, store),
				eventSource: eventSource,
				completed: !canceled
			}));
			
			this._layoutRenderers(this.renderData);				
			
			this._edProps = null;
		},
		
		_onItemEditEnd: function(e){
			// tags:
			//		private
								
			this._dispatchCalendarEvt(e, "onItemEditEnd");
			
			if(!e.isDefaultPrevented()){
				if(e.completed){
					// Inject new properties in data store item				
					// and apply data changes
					var store = this.get("store");
					store.put(e.item, store);
				}else{			
					e.item.startTime = this._editStartTimeSave; 
					e.item.endTime = this._editEndTimeSave;
				}
			}
		},
		
		onItemEditEnd: function(e){
			// summary:
			//		Event dispatched when the item is leaving the editing mode.
			// tags:
			//		protected

		},
		
		_createItemEditEvent: function(){
			// tags:
			//		private

			var e = {
				cancelable: true,
				bubbles: false,
				__defaultPrevent: false
			};
			
			e.preventDefault = function(){
				this.__defaultPrevented = true;
			};
			
			e.isDefaultPrevented = function(){
				return this.__defaultPrevented;
			};
			
			return e;
		},

		
		_startItemEditingGesture: function(dates, editKind, eventSource, e){
			// summary:
			//		Starts the editing gesture.
			// date: Date[]
			//		The reference dates (at least one). 
			// editKind: String
			//		Kind of edit: "resizeBoth", "resizeStart", "resizeEnd" or "move".
			// eventSource: String
			//		"mouse", "keyboard", "touch"
			// e: Event
			//		The event at the origin of the editing gesture.
			// tags:
			//		protected
			
			var p = this._edProps;
			
			if(!p || p.editedItem == null){
				return;
			}
			
			this._editingGesture = true;
			
			var item = p.editedItem;
			
			p.editKind = editKind; 
			
			this._onItemEditBeginGesture(this.__fixEvt(lang.mixin(this._createItemEditEvent(), {
				item: item,
				startTime: item.startTime,
				endTime: item.endTime,
				editKind: editKind,
				rendererKind: p.rendererKind,
				triggerEvent: e,
				dates: dates,
				eventSource: eventSource
			})));
			
			p.itemBeginDispatched = true;

		},
		
		
		_onItemEditBeginGesture: function(e){
			// tags:
			//		private
			var p = this._edProps;
			
			var item = p.editedItem;
			var dates = e.dates;
			
			p.editingTimeFrom = [];			
			p.editingTimeFrom[0] = dates[0];			
			
			p.editingItemRefTime = [];
			p.editingItemRefTime[0] = this.newDate(p.editKind == "resizeEnd" ? item.endTime : item.startTime);
			
			if (p.editKind == "resizeBoth"){
				p.editingTimeFrom[1] = dates[1];
				p.editingItemRefTime[1] = this.newDate(item.endTime);				
			}		
			
			var cal = this.renderData.dateModule;
			
			p.inViewOnce = this._isItemInView(item);
			
			if(p.rendererKind == "label" || this.roundToDay){
				p._itemEditBeginSave = this.newDate(item.startTime);
				p._itemEditEndSave = this.newDate(item.endTime);
			}
			
			p._initDuration = cal.difference(item.startTime, item.endTime, item.allDay?"day":"millisecond");	
			
			this._dispatchCalendarEvt(e, "onItemEditBeginGesture");

			if (!e.isDefaultPrevented()){
				
				if (e.eventSource == "mouse"){
					var cursor = e.editKind=="move"?"move":this.resizeCursor;
					p.editLayer = domConstruct.create("div", {
						style: "position: absolute; left:0; right:0; bottom:0; top:0; z-index:30; tabIndex:-1; background-image:url('"+this._blankGif+"'); cursor: "+cursor,
						onresizestart: function(e){return false;},
						onselectstart: function(e){return false;}
					}, this.domNode);
					p.editLayer.focus();
				}
			}
		},
		
		onItemEditBeginGesture: function(e){
			// summary:
			//		Event dispatched when an editing gesture is beginning.
			// e: __itemEditingEventArgs
			//		The editing event.
			// tags:
			//		callback

		},
		
		_waDojoxAddIssue: function(d, unit, steps){
			// summary:
			//		Workaround an issue of dojox.date.XXXXX.date.add() function 
			//		that does not support the subtraction of time correctly (normalization issues). 
			// d: Date
			//		Reference date.
			// unit: String
			//		Unit to add.
			// steps: Integer
			//		Number of units to add.
			// tags:
			//		protected

			var cal = this.renderData.dateModule;
			if(this._calendar != "gregorian" && steps < 0){
				var gd = d.toGregorian();
				gd = date.add(gd, unit, steps);
				return new this.renderData.dateClassObj(gd);
			}else{
				return cal.add(d, unit, steps);
			}
		},
						
		_computeItemEditingTimes: function(item, editKind, rendererKind, times, eventSource){
			// tags:
			//		private

			var cal = this.renderData.dateModule;
			var p = this._edProps;
			var diff = cal.difference(p.editingTimeFrom[0], times[0], "millisecond");
			times[0] = this._waDojoxAddIssue(p.editingItemRefTime[0], "millisecond", diff);
			
			if(editKind == "resizeBoth"){
				diff = cal.difference(p.editingTimeFrom[1], times[1], "millisecond");
				times[1] = this._waDojoxAddIssue(p.editingItemRefTime[1], "millisecond", diff); 
			}
			return times;
		},
		
		_moveOrResizeItemGesture: function(dates, eventSource, e){
			// summary:
			//		Moves or resizes an item.
			// dates: Date[]
			//		The reference dates.
			// editKind: String
			//		Kind of edit: "resizeStart", "resizeEnd", "resizeBoth" or "move".
			// eventSource: String
			//		"mouse", "keyboard", "touch"
			// e: Event
			//		The event at the origin of the editing gesture.
			// tags:
			//		private

			if(!this._isEditing || dates[0] == null){
				return;
			}
			
			var p = this._edProps;
			var item = p.editedItem;
			var rd = this.renderData;
			var cal = rd.dateModule;
			var editKind = p.editKind;
					
			var newTimes = [dates[0]];
			
			if(editKind == "resizeBoth"){
				newTimes[1] = dates[1];
			}
			
			newTimes = this._computeItemEditingTimes(item, p.editKind, p.rendererKind, newTimes, eventSource);
							
			var newTime = newTimes[0]; // usual use case
					
			var moveOrResizeDone = false;
			
			var oldStart = lang.clone(item.startTime);
			var oldEnd = lang.clone(item.endTime);
			
			// swap cannot used using keyboard as a gesture is made of one single change (loss of start/end context).
			var allowSwap = p.eventSource == "keyboard" ? false : this.allowStartEndSwap;

			// Update the Calendar with the edited value.
			if(editKind == "move"){
					
				if(cal.compare(item.startTime, newTime) != 0){
					var duration = cal.difference(item.startTime, item.endTime, "millisecond");
					item.startTime = this.newDate(newTime);
					item.endTime = cal.add(item.startTime, "millisecond", duration);
					moveOrResizeDone = true;
				}
				
			}else if(editKind == "resizeStart"){
				
				if(cal.compare(item.startTime, newTime) != 0){	
					if(cal.compare(item.endTime, newTime) != -1){				
						item.startTime = this.newDate(newTime);
					}else{ // swap detected
						if(allowSwap){
							item.startTime = this.newDate(item.endTime);
							item.endTime = this.newDate(newTime);	
							p.editKind = editKind = "resizeEnd";
							if(eventSource == "touch"){ // invert touches as well!
								p.resizeEndTouchIndex = p.resizeStartTouchIndex;
								p.resizeStartTouchIndex = -1;
							}	
						}else{ // block the swap but keep the time of day
							item.startTime = this.newDate(item.endTime);
							item.startTime.setHours(newTime.getHours());
							item.startTime.setMinutes(newTime.getMinutes());
							item.startTime.setSeconds(newTime.getSeconds());
						}
					}
					moveOrResizeDone = true;
				}
				
			}else if(editKind == "resizeEnd"){
				
				if(cal.compare(item.endTime, newTime) != 0){
					if(cal.compare(item.startTime, newTime) != 1){
						item.endTime = this.newDate(newTime);	
					}else{ // swap detected

						if(allowSwap){
							item.endTime = this.newDate(item.startTime);
							item.startTime = this.newDate(newTime);	
							p.editKind = editKind = "resizeStart";
							if(eventSource == "touch"){ // invert touches as well!
								p.resizeStartTouchIndex = p.resizeEndTouchIndex;
								p.resizeEndTouchIndex = -1;
							}
						}else{ // block the swap but keep the time of day
							item.endTime = this.newDate(item.startTime);
							item.endTime.setHours(newTime.getHours());
							item.endTime.setMinutes(newTime.getMinutes());
							item.endTime.setSeconds(newTime.getSeconds());	
						}
					}

					moveOrResizeDone = true;
				}
			}else if(editKind == "resizeBoth"){
				
					moveOrResizeDone = true;

					var start =  this.newDate(newTime);
					var end = this.newDate(newTimes[1]);		

					if(cal.compare(start, end) != -1){ // swap detected
						if(allowSwap){
							var t = start;
							start = end;
							end = t;
						}else{ // as both ends are moved, the simple way is to forbid the move gesture.
							moveOrResizeDone = false;
						}
					}

					if(moveOrResizeDone){
						item.startTime = start;
						item.endTime = end; 
					}

			}else{	
				return false;
			}

			if(!moveOrResizeDone){
				return false;
			}

			var evt = lang.mixin(this._createItemEditEvent(), {
				item: item,
				startTime: item.startTime,
				endTime: item.endTime,
				editKind: editKind,
				rendererKind: p.rendererKind,
				triggerEvent: e,
				eventSource: eventSource
			}); 
			
			// trigger snapping, rounding, minimal duration, boundaries checks etc.
			if(editKind == "move"){
				this._onItemEditMoveGesture(evt);
			}else{
				this._onItemEditResizeGesture(evt);
			}
			
			// prevent invalid range
			if(cal.compare(item.startTime, item.endTime) == 1){
				var tmp = item.startTime;
				item.startTime = item.startTime;
				item.endTime = tmp;
			}
			
			moveOrResizeDone = 
				cal.compare(oldStart, item.startTime) != 0 || 
				cal.compare(oldEnd, item.endTime) != 0;
			
			if(!moveOrResizeDone){
				return false;
			}

			this._layoutRenderers(this.renderData);	

			if(p.liveLayout && p.secItem != null){
				p.secItem.startTime = item.startTime;
				p.secItem.endTime = item.endTime;
				this._secondarySheet._layoutRenderers(this._secondarySheet.renderData);
			}else if(p.ownerItem != null && this.owner.liveLayout){
				p.ownerItem.startTime = item.startTime;
				p.ownerItem.endTime = item.endTime;
				this.owner._layoutRenderers(this.owner.renderData);
			}
												
			return true;
		},
		
		_findRenderItem: function(id, list){
			// tags:
			//		private

			list = list || this.renderData.items;
			for(var i=0; i<list.length; i++){
				if(list[i].id == id){
					return list[i];
				}
			}
			return null;
		},

		_onItemEditMoveGesture: function(e){	
			// tags:
			//		private

			this._dispatchCalendarEvt(e, "onItemEditMoveGesture");

			if(!e.isDefaultPrevented()){
				
				var p = e.source._edProps;
				var rd = this.renderData;
				var cal = rd.dateModule;
				var newStartTime, newEndTime;
				
				if(p.rendererKind == "label" || (this.roundToDay && !e.item.allDay)){
					
					newStartTime = this.floorToDay(e.item.startTime, false, rd);
					newStartTime.setHours(p._itemEditBeginSave.getHours());
					newStartTime.setMinutes(p._itemEditBeginSave.getMinutes());
					
					newEndTime = cal.add(newStartTime, "millisecond", p._initDuration);
					
				}else if(e.item.allDay){
					newStartTime = this.floorToDay(e.item.startTime, true);
					newEndTime = cal.add(newStartTime, "day", p._initDuration);
				}else{
					newStartTime = this.floorDate(e.item.startTime, this.snapUnit, this.snapSteps);
					newEndTime = cal.add(newStartTime, "millisecond", p._initDuration);
				} 

				e.item.startTime = newStartTime;
				e.item.endTime = newEndTime;
				
				if(!p.inViewOnce){
					p.inViewOnce = this._isItemInView(e.item);
				}

				// to prevent strange behaviors use constraint in items already fully in view.
				if(p.inViewOnce && this.stayInView){
					this._ensureItemInView(e.item);
				}
			}
		},
		
		_DAY_IN_MILLISECONDS: 24 * 60 * 60 * 1000,
		
		onItemEditMoveGesture: function(e){
			// summary:
			//		Event dispatched during a move editing gesture.
			// e: __itemEditingEventArgs
			//		The editing event.
			// tags:
			//		callback

		},
				
		_onItemEditResizeGesture: function(e){
			// tags:
			//		private

			this._dispatchCalendarEvt(e, "onItemEditResizeGesture");
			
			if(!e.isDefaultPrevented()){				
							
				var p = e.source._edProps;
				var rd = this.renderData;
				var cal = rd.dateModule;
				
				var newStartTime = e.item.startTime;
				var newEndTime = e.item.endTime;
				
				if(e.editKind == "resizeStart"){
					if(e.item.allDay){
						newStartTime = this.floorToDay(e.item.startTime, false, this.renderData);
					}else if(this.roundToDay){
						newStartTime = this.floorToDay(e.item.startTime, false, rd);
						newStartTime.setHours(p._itemEditBeginSave.getHours());
						newStartTime.setMinutes(p._itemEditBeginSave.getMinutes());
					}else{
						newStartTime = this.floorDate(e.item.startTime, this.snapUnit, this.snapSteps);
					}
				}else if(e.editKind == "resizeEnd"){
					if(e.item.allDay){
						if(!this.isStartOfDay(e.item.endTime)){
							newEndTime = this.floorToDay(e.item.endTime, false, this.renderData);
							newEndTime = cal.add(newEndTime, "day", 1);
						}
					}else if(this.roundToDay){
						newEndTime = this.floorToDay(e.item.endTime, false, rd);
						newEndTime.setHours(p._itemEditEndSave.getHours());
						newEndTime.setMinutes(p._itemEditEndSave.getMinutes());
					}else{
						newEndTime = this.floorDate(e.item.endTime, this.snapUnit, this.snapSteps);
					
						if(e.eventSource == "mouse"){
							newEndTime = cal.add(newEndTime, this.snapUnit, this.snapSteps);
						}
					}
				}else{ // Resize both
					newStartTime = this.floorDate(e.item.startTime, this.snapUnit, this.snapSteps);
					newEndTime = this.floorDate(e.item.endTime, this.snapUnit, this.snapSteps);
					newEndTime = cal.add(newEndTime, this.snapUnit, this.snapSteps);
				}
				
				e.item.startTime = newStartTime;
				e.item.endTime = newEndTime;
				
				var minimalDay = e.item.allDay || p._initDuration >= this._DAY_IN_MILLISECONDS && !this.allowResizeLessThan24H;
				
				this.ensureMinimalDuration(this.renderData, e.item, 
					minimalDay ? "day" : this.minDurationUnit, 
					minimalDay ? 1 : this.minDurationSteps, 
					e.editKind);
					
				if(!p.inViewOnce){
					p.inViewOnce = this._isItemInView(e.item);
				}

				// to prevent strange behaviors use constraint in items already fully in view.
				if(p.inViewOnce && this.stayInView){
					this._ensureItemInView(e.item);
				}
			}
		},
		
		onItemEditResizeGesture: function(e){
			// summary:
			//		Event dispatched during a resize editing gesture.
			// e: __itemEditingEventArgs
			//		The editing event.
			// tags:
			//		callback

		},
		
		_endItemEditingGesture: function(/*String*/eventSource,	/*Event*/e){
			// tags:
			//		protected

			if(!this._isEditing){
				return;
			}					
			
			this._editingGesture = false;
			
			var p = this._edProps;
			var item = p.editedItem;
			
			p.itemBeginDispatched = false;							
			
			this._onItemEditEndGesture(lang.mixin(this._createItemEditEvent(), {
				item: item,
				startTime: item.startTime,
				endTime: item.endTime,
				editKind: p.editKind,
				rendererKind: p.rendererKind,
				triggerEvent: e,
				eventSource: eventSource
			}));

		},
		
		_onItemEditEndGesture: function(e){
			// tags:
			//		private

			var p = this._edProps;
			
			delete p._itemEditBeginSave;
			delete p._itemEditEndSave;
					
			this._dispatchCalendarEvt(e, "onItemEditEndGesture");
			
			if (!e.isDefaultPrevented()){
				if(p.editLayer){
					if(has("ie")){
						p.editLayer.style.cursor = "default";
					}
					setTimeout(lang.hitch(this, function(){
						if(this.domNode){ // for unit tests					
							this.domNode.focus();
							p.editLayer.parentNode.removeChild(p.editLayer);
							p.editLayer = null;
						}		
					}), 10);
								
				}
			}
		},
		
		onItemEditEndGesture: function(e){
			// summary:
			//		Event dispatched at the end of an editing gesture.
			// e: __itemEditingEventArgs
			//		The editing event.
			// tags:
			//		callback

		},
		
		ensureMinimalDuration: function(renderData, item, unit, steps, editKind){
			// summary:
			//		During the resize editing gesture, ensures that the item has the specified minimal duration.
			// renderData: Object
			//		The render data.
			// item: Object
			//		The edited item.
			// unit: String
			//		The unit used to define the minimal duration.
			// steps: Integer
			//		The number of time units.
			// editKind: String
			//		The edit kind: "resizeStart" or "resizeEnd".
			var minTime;
			var cal = renderData.dateModule;
			
			if(editKind == "resizeStart"){
				minTime = cal.add(item.endTime, unit, -steps);
				if(cal.compare(item.startTime, minTime) == 1){
					item.startTime = minTime;
				}
			} else {
				minTime = cal.add(item.startTime, unit, steps);
				if(cal.compare(item.endTime, minTime) == -1){
					item.endTime = minTime;
				}
			}
		},
		
		// doubleTapDelay: Integer
		//		The maximum delay between two taps needed to trigger an "itemDoubleClick" event, in touch context.		
		doubleTapDelay: 300,
		
		// snapUnit: String
		//		The unit of the snapping to apply during the editing of an event.
		//		"day", "hour" and "minute" are valid values. 
		snapUnit: "minute",
		
		// snapSteps: Integer
		//		The number of units used to compute the snapping of the edited item.
		snapSteps: 15,
		
		// minDurationUnit: "String"
		//		The unit used to define the minimal duration of the edited item.
		//		"day", "hour" and "minute" are valid values.
		minDurationUnit: "hour",
		
		// minDurationSteps: Integer
		//		The number of units used to define the minimal duration of the edited item.
		minDurationSteps: 1,
		
		// liveLayout: Boolean
		//		If true, all the events are laid out during the editing gesture. If false, only the edited event is laid out.
		liveLayout: false,			
		
		// stayInView: Boolean
		//		Specifies during editing, if the item is already in view, if the item must stay in the time range defined by the view or not.		
		stayInView: true,
		
		// allowStartEndSwap: Boolean
		//		Specifies if the start and end time of an item can be swapped during an editing gesture. Note that using the keyboard this property is ignored.	
		allowStartEndSwap: true,			
		
		// allowResizeLessThan24H: Boolean
		//		If an event has a duration greater than 24 hours, indicates if using a resize gesture, it can be resized to last less than 24 hours.
		//		This flag is usually used when two different kind of renderers are used (MatrixView) to prevent changing the kind of renderer during an editing gesture.
		allowResizeLessThan24H: false
		
	});
});

},
'dojox/calendar/Touch':function(){
define("dojox/calendar/Touch", ["dojo/_base/array", "dojo/_base/lang", "dojo/_base/declare", "dojo/dom", "dojo/dom-geometry", "dojo/_base/window", "dojo/on", "dojo/_base/event", "dojo/keys"],

	function(arr, lang, declare, dom, domGeometry, win, on, event, keys){
			
	return declare("dojox.calendar.Touch", null, {
		
		// summary:
		//		This plugin is managing the touch interactions on item renderers displayed by a calendar view.		
				
		// touchStartEditingTimer: Integer
		//		The delay of one touch over the renderer before setting the item in editing mode.		
		touchStartEditingTimer: 500,
		
		// touchEndEditingTimer: Integer
		//		The delay after which the item is leaving the editing mode after the previous editing gesture, in touch context.
		touchEndEditingTimer: 10000,
		
		postMixInProperties: function(){
			
			this.on("rendererCreated", lang.hitch(this, function(ir){
				
				var renderer = ir.renderer;
				
				
				var h;
				if(!renderer.__handles){
					renderer.__handles = [];
				}
											
				h = on(renderer.domNode, "touchstart", lang.hitch(this, function(e){
					this._onRendererTouchStart(e, renderer);
				}));
				
				renderer.__handles.push(h);
			}));
		},
		
		_onRendererTouchStart: function(e, renderer){
			// tags:
			//		private
			var p = this._edProps;	
			
			if(p && p.endEditingTimer){
				clearTimeout(p.endEditingTimer);
				p.endEditingTimer = null;
			}				

			var theItem = renderer.item.item;

			if(p && p.endEditingTimer){
				clearTimeout(p.endEditingTimer);
				p.endEditingTimer = null;
			}

			if(p != null && p.item != theItem){
				// another item is edited.
				// stop previous item
				if(p.startEditingTimer){
					clearTimeout(p.startEditingTimer);
				}

				this._endItemEditing("touch", false);
				p = null;

			}

			// initialize editing properties
			if(!p){
				
				// register event listeners to manage gestures.
				var handles = [];
				
				handles.push(on(win.doc, "touchend", lang.hitch(this, this._docEditingTouchEndHandler)));
				handles.push(on(this.itemContainer, "touchmove", lang.hitch(this, this._docEditingTouchMoveHandler)));						
				
				this._setEditingProperties({
					touchMoved: false,
					item: theItem,
					renderer: renderer,
					rendererKind: renderer.rendererKind,
					event: e,
					handles: handles,
					liveLayout: this.liveLayout
				});

				p = this._edProps;
			}

			if(this._isEditing){
									
				// get info on touches 
				lang.mixin(p, this._getTouchesOnRenderers(e, p.editedItem));
				
				// start an editing gesture.
				this._startTouchItemEditingGesture(e);
				
			} else {
				
				// initial touch that will trigger or not the editing
			
				if(e.touches.length > 1){
					event.stop(e);
					return;
				}
				
				// set the selection state without dispatching (on touch end) after a short amount of time.
				// to allow a bit of time to scroll without selecting (graphically at least) 											
				this._touchSelectionTimer = setTimeout(lang.hitch(this, function(){									
					
					this._saveSelectedItems = this.get("selectedItems");
							
					var changed = this.selectFromEvent(e, this.renderItemToItem(theItem, this.get("store")), renderer, false);
					
					if(changed){					
						this._pendingSelectedItem = theItem;
					}else{
						delete this._saveSelectedItems;
					}
					this._touchSelectionTimer = null;
				}), 200);
				
				p.start = {x: e.touches[0].screenX, y: e.touches[0].screenY};
				
				if(this.isItemEditable(p.item, p.rendererKind)){
									
					// editing gesture timer
					this._edProps.startEditingTimer = setTimeout(lang.hitch(this, function(){											
						
						// we are editing, so the item *must* be selected.
						if(this._touchSelectionTimer){							
							clearTimeout(this._touchSelectionTimer);
							delete this._touchSelectionTime; 
						}
						if(this._pendingSelectedItem){							
							this.dispatchChange(this._saveSelectedItems == null ? null : this._saveSelectedItems[0], this._pendingSelectedItem, null, e);
							delete this._saveSelectedItems;
							delete this._pendingSelectedItem;
						}else{							
							this.selectFromEvent(e, this.renderItemToItem(theItem, this.get("store")), renderer);
						}
																					
						this._startItemEditing(p.item, "touch", e);
						
						p.moveTouchIndex = 0;
						
						// A move gesture is initiated even if we don't move 
						this._startItemEditingGesture([this.getTime(e)], "move", "touch", e);
						
					}), this.touchStartEditingTimer);
				
				}				
			}							
		},
		
		_docEditingTouchMoveHandler: function(e){
			// tags:
			//		private
			var p = this._edProps;
										
			// When the screen is touched, it can dispatch move events if the 
			// user press the finger a little more...
			var touch = {x: e.touches[0].screenX, y: e.touches[0].screenY};														
			if(p.startEditingTimer && 
					(Math.abs(touch.x - p.start.x) > 25 || 
					 Math.abs(touch.y - p.start.y) > 25)) {
					 	
				// scroll use case, do not edit
				clearTimeout(p.startEditingTimer);
				p.startEditingTimer = null;
				
				clearTimeout(this._touchSelectionTimer);
				this._touchSelectionTimer = null;				
				
				if(this._pendingSelectedItem){					
					delete this._pendingSelectedItem;
					this.selectFromEvent(e, null, null, false);
				}			
			}
			
			p.touchMoved = true;
								
			if(this._editingGesture){				
			
				event.stop(e);
				
				if(p.itemBeginDispatched){
					
					var times = [];
					var d = p.editKind == "resizeEnd" ? p.editedItem.endTime : p.editedItem.startTime;
					
					switch(p.editKind){
						case "move":
						  var touchIndex = p.moveTouchIndex == null || p.moveTouchIndex < 0 ? 0 : p.moveTouchIndex;
							times[0] = this.getTime(e, -1, -1, touchIndex);							
							break;
						case "resizeStart":
							times[0] = this.getTime(e, -1, -1, p.resizeStartTouchIndex);							
							break;
						case "resizeEnd":
							times[0] = this.getTime(e, -1, -1, p.resizeEndTouchIndex);							
							break;
						case "resizeBoth":
							times[0] = this.getTime(e, -1, -1, p.resizeStartTouchIndex);
							times[1] = this.getTime(e, -1, -1, p.resizeEndTouchIndex);
							break;							
					}
														
					this._moveOrResizeItemGesture(times, "touch", e);
					
					if(p.editKind == "move"){
						if(this.renderData.dateModule.compare(p.editedItem.startTime, d) == -1){
							this.ensureVisibility(p.editedItem.startTime, p.editedItem.endTime, "start", this.autoScrollTouchMargin);							
						}else{
							this.ensureVisibility(p.editedItem.startTime, p.editedItem.endTime, "end", this.autoScrollTouchMargin);
						}
					}else if(e.editKind == "resizeStart" || e.editKind == "resizeBoth"){
						this.ensureVisibility(p.editedItem.startTime, p.editedItem.endTime, "start", this.autoScrollTouchMargin);	
					}else{
						this.ensureVisibility(p.editedItem.startTime, p.editedItem.endTime, "end", this.autoScrollTouchMargin);
					}
																		
				}			
			} // else scroll, if any, is delegated to sub class							
						
		},
		
		// autoScrollTouchMargin: Integer
		//		The minimum number of minutes of margin around the edited event. 
		autoScrollTouchMargin: 10,
		
		_docEditingTouchEndHandler: function(e){
			// tags:
			//		private
			event.stop(e);
			
			var p = this._edProps;
			
			if(p.startEditingTimer){
				clearTimeout(p.startEditingTimer);
				p.startEditingTimer = null;
			}
								
			if(this._isEditing){
				
				lang.mixin(p, this._getTouchesOnRenderers(e, p.editedItem));
				
				if(this._editingGesture){
				
					if(p.touchesLen == 0){
						
						// all touches were removed => end of editing gesture
						this._endItemEditingGesture("touch", e);
						
						if(this.touchEndEditingTimer > 0){
						
							// Timer that trigger the end of the item editing mode.
							p.endEditingTimer = setTimeout(lang.hitch(this, function(){															
																	
								this._endItemEditing("touch", false);															
								
							}), this.touchEndEditingTimer);
						} // else validation must be explicit
						
					}else{
												
						if(this._editingGesture){
							this._endItemEditingGesture("touch", e);
						}
						// there touches of interest on item, process them.
						this._startTouchItemEditingGesture(e);						
					}
				}
				
			}else if(!p.touchMoved){
												
				event.stop(e);
					
				arr.forEach(p.handles, function(handle){
					handle.remove();
				});
								
				if(this._touchSelectionTimer){					
					// selection timer was not reached to a proper selection.
					clearTimeout(this._touchSelectionTimer);
					this.selectFromEvent(e, this.renderItemToItem(p.item, this.get("store")), p.renderer, true);
					
				}else if(this._pendingSelectedItem){
					// selection timer was reached, dispatch change event
					this.dispatchChange(this._saveSelectedItems.length == 0 ? null : this._saveSelectedItems[0], 
						this._pendingSelectedItem, null, e); // todo renderer ?
					delete this._saveSelectedItems;
					delete this._pendingSelectedItem;					
				}
								
				if(this._pendingDoubleTap && this._pendingDoubleTap.item == p.item){							
					this._onItemDoubleClick({
						triggerEvent: e,
						renderer: p.renderer,
						item: this.itemToRenderItem(p.item, this.get("store"))
					});
					
					clearTimeout(this._pendingDoubleTap.timer);
					
					delete this._pendingDoubleTap;					
					
				}else{
					
					this._pendingDoubleTap = {
						item: p.item,
						timer: setTimeout(lang.hitch(this, function(){
								delete this._pendingDoubleTap;								
							}), this.doubleTapDelay)
					};
																						
					this._onItemClick({
						triggerEvent: e,
						renderer: p.renderer,
						item: this.itemToRenderItem(p.item, this.get("store"))
					});
				}
								
				this._edProps = null;
							
			}else{
				// scroll view has finished.									
				
				if(this._saveSelectedItems){									
											
					// selection without dipatching was done, but the view scrolled, 
					// so revert last selection
				  this.set("selectedItems", this._saveSelectedItems);					
					delete this._saveSelectedItems;
					delete this._pendingSelectedItem;
				}								
							
				arr.forEach(p.handles, function(handle){
					handle.remove();
				});
							
				this._edProps = null;				
			}
		},
		
		_startTouchItemEditingGesture: function(e){
			// summary:
			//		Determines if a editing gesture is starting according to touches.  
			// tags:
			//		private

			var p = this._edProps;

			var fromResizeStart = p.resizeStartTouchIndex != -1;
			var fromResizeEnd = p.resizeEndTouchIndex != -1;

			if(fromResizeStart && fromResizeEnd || // initial gesture using two touches 
					this._editingGesture && p.touchesLen == 2 && 
					(fromResizeEnd && p.editKind == "resizeStart" || 
					 fromResizeStart && p.editKind =="resizeEnd")){ // gesture one after the other touch

				if(this._editingGesture && p.editKind != "resizeBoth"){ // stop ongoing gesture
					this._endItemEditingGesture("touch", e);
				}

				p.editKind = "resizeBoth";

				this._startItemEditingGesture([this.getTime(e, -1, -1, p.resizeStartTouchIndex), 
					this.getTime(e, -1, -1, p.resizeEndTouchIndex)], 
					p.editKind, "touch", e);

				return;

			}else if(fromResizeStart && p.touchesLen == 1 && !this._editingGesture){

				this._startItemEditingGesture([this.getTime(e, -1, -1, p.resizeStartTouchIndex)], 
					"resizeStart", "touch", e);

				return;

			}else if(fromResizeEnd && p.touchesLen == 1 && !this._editingGesture){

				this._startItemEditingGesture([this.getTime(e, -1, -1, p.resizeEndTouchIndex)], 
					"resizeEnd", "touch", e);

				return;

			} else {
				// A move gesture is initiated even if we don't move 
				this._startItemEditingGesture([this.getTime(e)], "move", "touch", e);
			}					
		},
		
		_getTouchesOnRenderers: function(e, item){
			// summary:
			//		Returns the touch indices that are on a editing handles or body of the renderers 
			// tags:
			//		private
			// item: Object
			//		The render item.
			// e: Event
			//		The touch event.
			// tags:
			//		private
			
			var irs = this._getStartEndRenderers(item);
										
			var resizeStartTouchIndex = -1;			
			var resizeEndTouchIndex = -1;			
			var moveTouchIndex = -1;
			var hasResizeStart = irs[0] != null && irs[0].resizeStartHandle != null;
			var hasResizeEnd = irs[1] != null && irs[1].resizeEndHandle != null;
			var len = 0;
			var touched = false;			
			var list = this.itemToRenderer[item.id];
														
			for(var i=0; i<e.touches.length; i++){
				
				if(resizeStartTouchIndex == -1 && hasResizeStart){
					touched = dom.isDescendant(e.touches[i].target, irs[0].resizeStartHandle);
					if(touched){
						resizeStartTouchIndex = i;
						len++;
					}
				}
				
				if(resizeEndTouchIndex == -1 && hasResizeEnd){
					touched = dom.isDescendant(e.touches[i].target, irs[1].resizeEndHandle);
					if(touched){
						resizeEndTouchIndex = i;
						len++;
					}
				}

				if(resizeStartTouchIndex == -1 && resizeEndTouchIndex == -1){ 

					for (var j=0; j<list.length; j++){
					  touched = dom.isDescendant(e.touches[i].target, list[j].container);
						if(touched){
							moveTouchIndex = i;
							len++;
							break;
						}
					}
				}

				if(resizeStartTouchIndex != -1 && resizeEndTouchIndex != -1 && moveTouchIndex != -1){
					// all touches of interest were found, ignore other ones.
				  break;	
				}
			}

			return {
				touchesLen: len,
				resizeStartTouchIndex: resizeStartTouchIndex,
				resizeEndTouchIndex: resizeEndTouchIndex,
				moveTouchIndex: moveTouchIndex
			};
		}

	});

});

},
'dojox/calendar/_VerticalScrollBarBase':function(){
define("dojox/calendar/_VerticalScrollBarBase", ["dojo/_base/declare", "dojo/_base/event", "dojo/_base/lang", "dojo/on", "dojo/dom-style", "dijit/_WidgetBase"],
function(declare, event, lang, on, domStyle, _WidgetBase){
	
		return declare('dojox.calendar._VerticalScrollBarBase', _WidgetBase, {
		
		// value: Number 
		//		The value of the scroll bar in pixel offset.
		value: 0,
		
		// minimum: Number 
		//		The minimum value of the scroll bar.
		minimum: 0,
		
		// maximum: Number 
		//		The maximum value of the scroll bar.
		maximum: 100,
		
		_scrollHandle: null,
		
		buildRendering: function(){
			this.inherited(arguments);
			this._scrollHandle = on(this.domNode, "scroll", lang.hitch(this, function(param) {
				this.value = this._getDomScrollerValue();
				this.onChange(this.value);
				this.onScroll(this.value);
			}));
		},
		
		destroy: function(preserveDom){
			this._scrollHandle.remove();
			this.inherited(arguments);
		},

		_getDomScrollerValue : function() {
			return this.domNode.scrollTop;
		},
		
		_setDomScrollerValue : function(value) {
			this.domNode.scrollTop = value;	
		},
			
		_setValueAttr: function(value){
			value = Math.min(this.maximum, value);
			value = Math.max(this.minimum, value);
			if (this.value != value) {
				this.value = value;			 
				this.onChange(value);
				this._setDomScrollerValue(value);
			}
		},
				
		onChange: function(value){
			// summary:
			//		 An extension point invoked when the value has changed.
			// value: Integer
			//		The postiion of the scroll bar in pixels.
			// tags:
			//		callback
		},
		
		onScroll: function(value){
			// summary:
			//		 An extension point invoked when the user scrolls with the mouse.
			// value: Integer
			//		The position of the scroll bar in pixels.
			// tags:
			//		callback
		},
		
		_setMinimumAttr: function(value){
			value = Math.min(value, this.maximum);
			this.minimum = value;
		},
		
		_setMaximumAttr: function(value){
			value = Math.max(value, this.minimum);
			this.maximum = value;
			
			domStyle.set(this.content, "height", value + "px");
		}

	});

});

},
'url:dojox/calendar/templates/MonthColumnView.html':"<div data-dojo-attach-events=\"keydown:_onKeyDown\">\t\t\n\t<div data-dojo-attach-point=\"columnHeader\" class=\"dojoxCalendarColumnHeader\">\n\t\t<table data-dojo-attach-point=\"columnHeaderTable\" class=\"dojoxCalendarColumnHeaderTable\" cellpadding=\"0\" cellspacing=\"0\"></table>\n\t</div>\t\n\t<div data-dojo-attach-point=\"vScrollBar\" class=\"dojoxCalendarVScrollBar\">\n\t\t<div data-dojo-attach-point=\"vScrollBarContent\" style=\"visibility:hidden;position:relative; width:1px; height:1px;\" ></div>\n\t</div>\t\n\t<div data-dojo-attach-point=\"scrollContainer\" class=\"dojoxCalendarScrollContainer\">\n\t\t<div data-dojo-attach-point=\"sheetContainer\" style=\"position:relative;left:0;right:0;margin:0;padding:0\">\t\t\t\n\t\t\t<div data-dojo-attach-point=\"grid\" class=\"dojoxCalendarGrid\">\n\t\t\t\t<table data-dojo-attach-point=\"gridTable\" class=\"dojoxCalendarGridTable\" cellpadding=\"0\" cellspacing=\"0\" style=\"width:100%\"></table>\n\t\t\t</div>\n\t\t\t<div data-dojo-attach-point=\"itemContainer\" class=\"dojoxCalendarContainer\" data-dojo-attach-event=\"mousedown:_onGridMouseDown,mouseup:_onGridMouseUp,ondblclick:_onGridDoubleClick,touchstart:_onGridTouchStart,touchmove:_onGridTouchMove,touchend:_onGridTouchEnd\">\n\t\t\t\t<table data-dojo-attach-point=\"itemContainerTable\" class=\"dojoxCalendarContainerTable\" cellpadding=\"0\" cellspacing=\"0\" style=\"width:100%\"></table>\n\t\t\t</div>\n\t\t</div> \n\t</div>\t\n</div>\n",
'url:dojox/calendar/templates/MobileHorizontalRenderer.html':"<div class=\"dojoxCalendarEvent dojoxCalendarHorizontal\" onselectstart=\"return false;\">\n\t<div class=\"bg\" ></div>\n\t<div style=\"position:absolute;left:2px;bottom:2px\"><span data-dojo-attach-point=\"beforeIcon\" class=\"beforeIcon\">◄</span></div>\t\n\t<div data-dojo-attach-point=\"labelContainer\" class=\"labels\">\t\t\n\t\t<span data-dojo-attach-point=\"startTimeLabel\" class=\"startTime\"></span>\n\t\t<span data-dojo-attach-point=\"summaryLabel\" class=\"summary\"></span>\n\t\t<span  data-dojo-attach-point=\"endTimeLabel\" class=\"endTime\"></span>\n\t</div>\n\t<div style=\"position:absolute;right:2px;bottom:2px\"><span data-dojo-attach-point=\"afterIcon\" class=\"afterIcon\">►</span></div>\n\t<div data-dojo-attach-point=\"moveHandle\" class=\"moveHandle\" ></div>\t\n\t<div data-dojo-attach-point=\"resizeStartHandle\" class=\"resizeHandle resizeStartHandle\"><div></div></div>\t\n\t<div data-dojo-attach-point=\"resizeEndHandle\" class=\"resizeHandle resizeEndHandle\"><div></div></div>\t\n</div>\n",
'url:dojox/calendar/templates/MatrixView.html':"<div data-dojo-attach-events=\"keydown:_onKeyDown\">\n\t<div  class=\"dojoxCalendarYearColumnHeader\" data-dojo-attach-point=\"yearColumnHeader\">\n\t\t<table><tr><td><span data-dojo-attach-point=\"yearColumnHeaderContent\"></span></td></tr></table>\t\t\n\t</div>\t\n\t<div data-dojo-attach-point=\"columnHeader\" class=\"dojoxCalendarColumnHeader\">\n\t\t<table data-dojo-attach-point=\"columnHeaderTable\" class=\"dojoxCalendarColumnHeaderTable\" cellpadding=\"0\" cellspacing=\"0\"></table>\n\t</div>\t\t\n\t<div dojoAttachPoint=\"rowHeader\" class=\"dojoxCalendarRowHeader\">\n\t\t<table data-dojo-attach-point=\"rowHeaderTable\" class=\"dojoxCalendarRowHeaderTable\" cellpadding=\"0\" cellspacing=\"0\"></table>\n\t</div>\t\n\t<div dojoAttachPoint=\"grid\" class=\"dojoxCalendarGrid\">\n\t\t<table data-dojo-attach-point=\"gridTable\" class=\"dojoxCalendarGridTable\" cellpadding=\"0\" cellspacing=\"0\"></table>\n\t</div>\t\n\t<div data-dojo-attach-point=\"itemContainer\" class=\"dojoxCalendarContainer\" data-dojo-attach-event=\"mousedown:_onGridMouseDown,mouseup:_onGridMouseUp,ondblclick:_onGridDoubleClick,touchstart:_onGridTouchStart,touchmove:_onGridTouchMove,touchend:_onGridTouchEnd\">\n\t\t<table data-dojo-attach-point=\"itemContainerTable\" class=\"dojoxCalendarContainerTable\" cellpadding=\"0\" cellspacing=\"0\" style=\"width:100%\"></table>\n\t</div>\t\n</div>\n",
'dojox/calendar/StoreMixin':function(){
define("dojox/calendar/StoreMixin", ["dojo/_base/declare", "dojo/_base/array", "dojo/_base/html", "dojo/_base/lang", "dojo/dom-class",
	"dojo/Stateful", "dojo/when"],
	function(declare, arr, html, lang, domClass, Stateful, when){

	return declare("dojox.calendar.StoreMixin", Stateful, {
		
		// summary:
		//		This mixin contains the store management.
		
		// store: dojo.store.Store
		//		The store that contains the events to display.
		store: null,
		
		// query: Object
		//		A query that can be passed to when querying the store.
		query: {},
		
		// startTimeAttr: String
		//		The attribute of the store item that contains the start time of 
		//		the events represented by this item.	Default is "startTime". 
		startTimeAttr: "startTime",
		
		// endTimeAttr: String
		//		The attribute of the store item that contains the end time of 
		//		the events represented by this item.	Default is "endTime".
		endTimeAttr: "endTime",
		
		// summaryAttr: String
		//		The attribute of the store item that contains the summary of 
		//		the events represented by this item.	Default is "summary".
		summaryAttr: "summary",
		
		// allDayAttr: String
		//		The attribute of the store item that contains the all day state of 
		//		the events represented by this item.	Default is "allDay".
		allDayAttr: "allDay",
	
		// cssClassFunc: Function
		//		Optional function that returns a css class name to apply to item renderers that are displaying the specified item in parameter. 
		cssClassFunc: null,		
							
		// decodeDate: Function?
		//		An optional function to transform store date into Date objects.	Default is null. 
		decodeDate: null,
		
		// encodeDate: Function?
		//		An optional function to transform Date objects into store date.	Default is null. 
		encodeDate: null,
		
		// displayedItemsInvalidated: Boolean
		//		Whether the data items displayed must be recomputed, usually after the displayed 
		//		time range has changed. 
		// tags:
		//		protected
		displayedItemsInvalidated: false,
				
		itemToRenderItem: function(item, store){
			// summary:
			//		Creates the render item based on the dojo.store item. It must be of the form:
			//	|	{
			//  |		id: Object,
			//	|		startTime: Date,
			//	|		endTime: Date,
			//	|		summary: String
			//	|	}
			//		By default it is building an object using the store id, the summaryAttr, 
			//		startTimeAttr and endTimeAttr properties as well as decodeDate property if not null. 
			//		Other fields or way to query fields can be used if needed.
			// item: Object
			//		The store item. 
			// store: dojo.store.api.Store
			//		The store.
			// returns: Object
			if(this.owner){
				return this.owner.itemToRenderItem(item, store);
			}
			return {
				id: store.getIdentity(item),
				summary: item[this.summaryAttr],
				startTime: (this.decodeDate && this.decodeDate(item[this.startTimeAttr])) || this.newDate(item[this.startTimeAttr], this.dateClassObj),
				endTime: (this.decodeDate && this.decodeDate(item[this.endTimeAttr])) || this.newDate(item[this.endTimeAttr], this.dateClassObj),
				allDay: item[this.allDayAttr] != null ? item[this.allDayAttr] : false,
				cssClass: this.cssClassFunc ? this.cssClassFunc(item) : null 
			};
		},
		
		renderItemToItem: function(/*Object*/ renderItem, /*dojo.store.api.Store*/ store){
			// summary:
			//		Create a store item based on the render item. It must be of the form:
			//	|	{
			//	|		id: Object
			//	|		startTime: Date,
			//	|		endTime: Date,
			//	|		summary: String
			//	|	}
			//		By default it is building an object using the summaryAttr, startTimeAttr and endTimeAttr properties
			//		and encodeDate property if not null. If the encodeDate property is null a Date object will be set in the start and end time.
			//		When using a JsonRest store, for example, it is recommended to transfer dates using the ISO format (see dojo.date.stamp).
			//		In that case, provide a custom function to the encodeDate property that is using the date ISO encoding provided by Dojo. 
			// renderItem: Object
			//		The render item. 
			// store: dojo.store.api.Store
			//		The store.
			// returns:Object
			if(this.owner){
				return this.owner.renderItemToItem(renderItem, store);
			}
			var item = {};
			item[store.idProperty] = renderItem.id;
			item[this.summaryAttr] = renderItem.summary;
			item[this.startTimeAttr] = (this.encodeDate && this.encodeDate(renderItem.startTime)) || renderItem.startTime;
			item[this.endTimeAttr] = (this.encodeDate && this.encodeDate(renderItem.endTime)) || renderItem.endTime;
			return lang.mixin(store.get(renderItem.id), item);
		},			
		
		_computeVisibleItems: function(renderData){
			// summary:
			//		Computes the data items that are in the displayed interval.
			// renderData: Object
			//		The renderData that contains the start and end time of the displayed interval.
			// tags:
			//		protected

			var startTime = renderData.startTime;
			var endTime = renderData.endTime;
			if(this.items){
				renderData.items = arr.filter(this.items, function(item){
					return this.isOverlapping(renderData, item.startTime, item.endTime, startTime, endTime);
				}, this);
			}
		},
		
		_initItems: function(items){
			// tags:
			//		private
			this.set("items", items);
			return items;
		},
		
		_refreshItemsRendering: function(renderData){
		},
		
		_updateItems: function(object, previousIndex, newIndex){
			// as soon as we add a item or remove one layout might change,
			// let's make that the default
			// TODO: what about items in non visible area...
			// tags:
			//		private
			var layoutCanChange = true;
			var oldItem = null;
			var newItem = this.itemToRenderItem(object, this.store);
			if(previousIndex!=-1){
				if(newIndex!=previousIndex){
					// this is a remove or a move
					this.items.splice(previousIndex, 1);
					if(this.setItemSelected && this.isItemSelected(newItem)){
						this.setItemSelected(newItem, false);
						this.dispatchChange(newItem, this.get("selectedItem"), null, null);
					}
				}else{
					// this is a put, previous and new index identical
					// check what changed
					oldItem = this.items[previousIndex];
					var cal = this.dateModule; 
					layoutCanChange = cal.compare(newItem.startTime, oldItem.startTime) != 0 ||
						cal.compare(newItem.endTime, oldItem.endTime) != 0;
					// we want to keep the same item object and mixin new values
					// into old object
					lang.mixin(oldItem, newItem); 
				}
			}else if(newIndex!=-1){
				// this is a add 
				this.items.splice(newIndex, 0, newItem);				
			}
			if(layoutCanChange){
				this._refreshItemsRendering();			
			}else{
				// just update the item
				this.updateRenderers(oldItem);
			}
		},
		
		_setStoreAttr: function(value){
			this.displayedItemsInvalidated = true;
			var r;
			if(value){
				var results = value.query(this.query);
				if(results.observe){
					// user asked us to observe the store
					results.observe(lang.hitch(this, this._updateItems), true);
				}				
				results = results.map(lang.hitch(this, function(item){
					return this.itemToRenderItem(item, value);
				}));
				r = when(results, lang.hitch(this, this._initItems));
			}else{
				// we remove the store
				r = this._initItems([]);
			}
			this._set("store", value);
			return r;
		}
				
	});

});

},
'dojox/calendar/LabelRenderer':function(){
require({cache:{
'url:dojox/calendar/templates/LabelRenderer.html':"<div class=\"dojoxCalendarEvent dojoxCalendarLabel\" onselectstart=\"return false;\">\t\n\t<div class=\"labels\">\n\t\t<span data-dojo-attach-point=\"startTimeLabel\" class=\"startTime\"></span>\n\t\t<span data-dojo-attach-point=\"summaryLabel\" class=\"summary\"></span>\n\t\t<span data-dojo-attach-point=\"endTimeLabel\" class=\"endTime\"></span>\n\t</div>\t\n\t<div data-dojo-attach-point=\"moveHandle\" class=\"handle moveHandle\" ></div>\n</div>\n"}});
define("dojox/calendar/LabelRenderer", ["dojo/_base/declare", "dijit/_WidgetBase", "dijit/_TemplatedMixin",
	"dojox/calendar/_RendererMixin", "dojo/text!./templates/LabelRenderer.html"],
	 
	function(declare, _WidgetBase, _TemplatedMixin, _RendererMixin, template){
	
	return declare("dojox.calendar.LabelRenderer", [_WidgetBase, _TemplatedMixin, _RendererMixin], {
		
		// summary:
		//		The default item label renderer. 
		
		templateString: template,
		
		_orientation: "horizontal",
		
		resizeEnabled: false,
		
		visibilityLimits: {
			resizeStartHandle: 50,
			resizeEndHandle: -1,
			summaryLabel: 15,
			startTimeLabel: 45,
			endTimeLabel: 30
		},
		
		_isElementVisible: function(elt, startHidden, endHidden, size){
			switch(elt){
				case "startTimeLabel":
					var d = this.item.startTime;
					if(this.item.isAllDay || d.getHours() == 0 && d.getMinutes() == 0 && d.getSeconds() == 0 && d.getMilliseconds() == 0){
						return false;
					}
					break;
			}
			return this.inherited(arguments);
		},
		
		_displayValue: "inline",
		
		postCreate: function() {
			this.inherited(arguments);
			this._applyAttributes();
		}
	});
});

},
'dojox/calendar/SimpleColumnView':function(){
require({cache:{
'url:dojox/calendar/templates/SimpleColumnView.html':"<div data-dojo-attach-events=\"keydown:_onKeyDown\">\t\n\t<div data-dojo-attach-point=\"header\" class=\"dojoxCalendarHeader\">\n\t\t<div class=\"dojoxCalendarYearColumnHeader\" data-dojo-attach-point=\"yearColumnHeader\">\n\t\t\t<table><tr><td><span data-dojo-attach-point=\"yearColumnHeaderContent\"></span></td></tr></table>\t\t\n\t\t</div>\n\t\t<div data-dojo-attach-point=\"columnHeader\" class=\"dojoxCalendarColumnHeader\">\n\t\t\t<table data-dojo-attach-point=\"columnHeaderTable\" class=\"dojoxCalendarColumnHeaderTable\" cellpadding=\"0\" cellspacing=\"0\"></table>\n\t\t</div>\n\t</div>\t\n\t<div data-dojo-attach-point=\"vScrollBar\" class=\"dojoxCalendarVScrollBar\">\n\t\t<div data-dojo-attach-point=\"vScrollBarContent\" style=\"visibility:hidden;position:relative; width:1px; height:1px;\" ></div>\n\t</div>\t\n\t<div data-dojo-attach-point=\"scrollContainer\" class=\"dojoxCalendarScrollContainer\">\n\t\t<div data-dojo-attach-point=\"sheetContainer\" style=\"position:relative;left:0;right:0;margin:0;padding:0\">\n\t\t\t<div data-dojo-attach-point=\"rowHeader\" class=\"dojoxCalendarRowHeader\">\n\t\t\t\t<table data-dojo-attach-point=\"rowHeaderTable\" class=\"dojoxCalendarRowHeaderTable\" cellpadding=\"0\" cellspacing=\"0\"></table>\n\t\t\t</div>\n\t\t\t<div data-dojo-attach-point=\"grid\" class=\"dojoxCalendarGrid\">\n\t\t\t\t<table data-dojo-attach-point=\"gridTable\" class=\"dojoxCalendarGridTable\" cellpadding=\"0\" cellspacing=\"0\" style=\"width:100%\"></table>\n\t\t\t</div>\n\t\t\t<div data-dojo-attach-point=\"itemContainer\" class=\"dojoxCalendarContainer\" data-dojo-attach-event=\"mousedown:_onGridMouseDown,mouseup:_onGridMouseUp,ondblclick:_onGridDoubleClick,touchstart:_onGridTouchStart,touchmove:_onGridTouchMove,touchend:_onGridTouchEnd\">\n\t\t\t\t<table data-dojo-attach-point=\"itemContainerTable\" class=\"dojoxCalendarContainerTable\" cellpadding=\"0\" cellspacing=\"0\" style=\"width:100%\"></table>\n\t\t\t</div>\n\t\t</div> \n\t</div>\n</div>\n\n"}});
define("dojox/calendar/SimpleColumnView", [
"./ViewBase", 
"dijit/_TemplatedMixin", 
"./_VerticalScrollBarBase", 
"dojo/text!./templates/SimpleColumnView.html",
"dojo/_base/declare", 
"dojo/_base/event", 
"dojo/_base/lang", 
"dojo/_base/array",
"dojo/_base/sniff",
"dojo/_base/fx", 
"dojo/_base/html",
"dojo/on",
"dojo/dom", 
"dojo/dom-class", 
"dojo/dom-style", 
"dojo/dom-geometry", 
"dojo/dom-construct",
"dojo/mouse", 
"dojo/query", 
"dojox/html/metrics"],

function(
	ViewBase, 
	_TemplatedMixin, 
	_VerticalScrollBarBase, 
	template, 
	declare, 
	event, 
	lang, 
	arr, 
	has,
	fx, 
	html,
	on,
	dom, 
	domClass, 
	domStyle,
	domGeometry, 
	domConstruct,
	mouse,
	query, 
	metrics){
	
	/*=====
	var __ColumnClickEventArgs = {
		// summary:
		//		A column click event.
		// index: Integer
		//		The column index. 
		// date: Date
		//		The date displayed by the column.
		// triggerEvent: Event
		//		The origin event.
	};
	=====*/
				
	return declare("dojox.calendar.SimpleColumnView", [ViewBase, _TemplatedMixin], {
		
		// summary:
		//		The simple column view is displaying a day per column. Each cell of a column is a time slot.

		baseClass: "dojoxCalendarSimpleColumnView",
		
		templateString: template,
		
		// viewKind: String
		//		Type of the view. Used by the calendar widget to determine how to configure the view.
		//		This view kind is "columns".
		viewKind: "columns",
		
		// scroll container is the focusable item to enable scrolling using up and down arrows
		_setTabIndexAttr: "domNode",
		
		// renderData: Object
		//		The render data is the object that contains all the properties needed to render the component.
		renderData: null,		
				
		// startDate: Date
		//		The start date of the time interval displayed.
		//		If not set at initialization time, will be set to current day.
		startDate: null,
			
		// columnCount: Integer
		//		The number of column to display (from the startDate).
		columnCount: 7,
	
		// minHours: Integer
		//		The minimum hour to be displayed. It must be in the [0,24] interval.
		minHours: 8,
		
		// maxHours: Integer
		//		The maximum hour to be displayed. It must be in the [0,24] interval.	
		maxHours: 18,
		
		// hourSize: Integer
		//		The desired size in pixels of an hour on the screen.
		//		Note that the effective size may be different as the time slot size must be an integer.
		hourSize: 100,
		
		// timeSlotDuration: Integer
		//		Duration of the time slot in minutes. Must be a divisor of 60.
		timeSlotDuration: 15,
		
		// verticalRenderer: Class
		//		The class use to create vertical renderers.
		verticalRenderer: null,
		
		// percentOverlap: Integer
		//		The percentage of the renderer width used to superimpose one item renderer on another 
		//		when two events are overlapping.
		percentOverlap: 70,
		
		// horizontalGap: Integer
		//		The number of pixels between two item renderers that are overlapping each other if the percentOverlap property is 0.
		horizontalGap: 4,
		
		_columnHeaderHandlers: null,
		
		constructor: function(){
			this.invalidatingProperties = ["columnCount", "startDate", "minHours", "maxHours", "hourSize", "verticalRenderer",
				"rowHeaderTimePattern", "columnHeaderDatePattern", "timeSlotDuration", "percentOverlap", "horizontalGap", 
				"scrollBarRTLPosition","itemToRendererKindFunc", "layoutPriorityFunction", "formatItemTimeFunc", "textDir", "items"];
			this._columnHeaderHandlers = [];
		},
		
		destroy: function(preserveDom){
			this._cleanupColumnHeader();
			if(this.scrollBar){
				this.scrollBar.destroy(preserveDom);
			}
			this.inherited(arguments);
		},
		
		_scrollBar_onScroll: function(value){
			this._setScrollPosition(value);
		},
		
		buildRendering: function(){
			this.inherited(arguments);
			if(this.vScrollBar){
				this.scrollBar = new _VerticalScrollBarBase(
					{content: this.vScrollBarContent}, 
					this.vScrollBar);
					
				this.scrollBar.on("scroll", lang.hitch(this, this._scrollBar_onScroll));
				this._viewHandles.push(
						on(this.scrollContainer, mouse.wheel,  
							dojo.hitch(this, this._mouseWheelScrollHander)));
			}
		},
		
		postscript: function(){
			this.inherited(arguments);
			this._initialized = true;
			if(!this.invalidRendering){
				this.refreshRendering();
			}
		},
		
		_setVerticalRendererAttr: function(value){
			this._destroyRenderersByKind("vertical");
			this._set("verticalRenderer", value);	
		},
				
		_createRenderData: function(){
			
			var renderData = {};

			renderData.minHours = this.get("minHours");		
			renderData.maxHours = this.get("maxHours");
			renderData.hourSize = this.get("hourSize");
			renderData.hourCount = renderData.maxHours - renderData.minHours;		
			renderData.slotDuration = this.get("timeSlotDuration"); // must be consistent with previous statement
			renderData.slotSize = Math.ceil(renderData.hourSize / (60 / renderData.slotDuration));
			renderData.hourSize = renderData.slotSize * (60 / renderData.slotDuration);
			renderData.sheetHeight = renderData.hourSize * renderData.hourCount;		
			renderData.scrollbarWidth = metrics.getScrollbar().w + 1;
			
			renderData.dateLocaleModule = this.dateLocaleModule;
			renderData.dateClassObj = this.dateClassObj;
			renderData.dateModule = this.dateModule; // arithmetics on Dates
			
			renderData.dates = [];
						
			renderData.columnCount = this.get("columnCount");

			var d = this.get("startDate");
		
			if (d == null){
				d = new renderData.dateClassObj();
			}

			d = this.floorToDay(d, false, renderData);
			
			this.startDate = d;
			
			for(var col = 0; col < renderData.columnCount ; col++){
				renderData.dates.push(d);
				d = renderData.dateModule.add(d, "day", 1);
				d = this.floorToDay(d, false, renderData);
			}

			renderData.startTime = new renderData.dateClassObj(renderData.dates[0]);
			renderData.startTime.setHours(renderData.minHours);
			renderData.endTime = new renderData.dateClassObj(renderData.dates[renderData.columnCount-1]);
			renderData.endTime.setHours(renderData.maxHours);
			
			if(this.displayedItemsInvalidated){
				this.displayedItemsInvalidated = false;
				this._computeVisibleItems(renderData);
				
				if(this._isEditing){					
					this._endItemEditing(null, false);
				}
				
			}else if (this.renderData){
				renderData.items = this.renderData.items;
			}
			
			return renderData;
		},
		
		_validateProperties: function() {
			
			this.inherited(arguments);
			
			var v = this.minHours;
			if(v < 0 || v>24 || isNaN(v)){
				this.minHours = 0;
			}
			v = this.maxHours;
			if (v < 0 || v>24 || isNaN(v)){
				this.minHours = 24;
			}
			
			if(this.minHours > this.maxHours){
				var t = this.maxHours;
				this.maxHours = this.minHours;
				this.maxHours = t;
			}
			if (v-this.minHours < 1){
				this.minHours = 0;
				this.maxHours = 24;				
			}
			if (this.columnCount<1 || isNaN(this.columnCount)){
				this.columnCount = 1;				
			}
			
			v = this.percentOverlap;
			if(this.percentOverlap<0 ||this.percentOverlap>100 || isNaN(this.percentOverlap)){
				this.percentOverlap = 70;
			}
			if(this.hourSize<5 || isNaN(this.hourSize)){
				this.hourSize = 10;
			}
			v = this.timeSlotDuration;
			if(v<1 || v>60 || isNaN(v)){
				v = 15;
			}
		},
		
		_setStartDateAttr: function(value){
			this.displayedItemsInvalidated = true;			
			this._set("startDate", value);
		},
		
		_setColumnCountAttr: function(value){			
			this.displayedItemsInvalidated = true;
			this._set("columnCount", value);
		},
		
		__fixEvt:function(e){
			// tags:
			//		private
			e.sheet = "primary";
			e.source = this;
			return e;
		},
		
		//////////////////////////////////////////
		//
		// Formatting functions
		//
		//////////////////////////////////////////
		
		_formatRowHeaderLabel: function(/*Date*/d){
			// summary:
			//		Computes the row header label for the specified time of day.
			//		By default a formatter is used, optionally the <code>rowHeaderTimePattern</code> property can be used to set a custom time pattern to the formatter.
			// d: Date
			//		The date to format
			// tags:
			//		protected

			return this.renderData.dateLocaleModule.format(d, {
				selector: "time", 
				timePattern: this.rowHeaderTimePattern
			});
		},
	
		_formatColumnHeaderLabel: function(/*Date*/d){			
			// summary:
			//		Computes the column header label for the specified date.
			//		By default a formatter is used, optionally the <code>columnHeaderDatePattern</code> property can be used to set a custom date pattern to the formatter.
			// d: Date
			//		The date to format 
			// tags:
			//		protected

			return this.renderData.dateLocaleModule.format(d, {
				selector: "date", 
				datePattern: this.columnHeaderDatePattern, 
				formatLength: "medium"
			});
		},
		
		//////////////////////////////////////////
		//
		// Time of day management
		//
		//////////////////////////////////////////
		
		// startTimeOfDay: Object
		//		The scroll position of the view. The value is an object made of "hours" and "minutes" properties.
		startTimeOfDay: null,
				
		// scrollBarRTLPosition: String
		//		Position of the scroll bar in right-to-left display.
		//		Valid values are "left" and "right", default value is "left".
		scrollBarRTLPosition: "left",
		
		_getStartTimeOfDay: function(){
			// summary:
			//		Returns the visible first time of day.
			// tags:
			//		protected
			// returns: Integer[]

			var v = (this.get("maxHours") - this.get("minHours")) * 
				this._getScrollPosition() / this.renderData.sheetHeight;
			
			return {
				hours: this.renderData.minHours + Math.floor(v),
				minutes: (v - Math.floor(v)) * 60
			};
		},
		
		_getEndTimeOfDay: function(){
			// summary:
			//		Returns the visible last time of day.
			// tags:
			//		protected
			// returns: Integer[]

			var v = (this.get("maxHours") - this.get("minHours")) * 
				(this._getScrollPosition() + this.scrollContainer.offsetHeight) / this.renderData.sheetHeight;
			
			return {
				hours: this.renderData.minHours + Math.floor(v),
				minutes: (v - Math.floor(v)) * 60
			};
		},
		
		_setStartTimeOfDayAttr: function(value){
			this._setStartTimeOfDay(value.hours, value.minutes, value.duration, value.easing)
		},
		
		_getStartTimeOfDayAttr: function(){
			return this._getStartTimeOfDay();
		},
		
		_setStartTimeOfDay: function(hour, minutes, maxDuration, easing){
			// summary:
			//		Scrolls the view to show the specified first time of day.
			// hour: Integer
			//		The hour of the start time of day.
			// minutes: Integer
			//		The minutes part of the start time of day.
			// maxDuration: Integer
			//		The max duration of the scroll animation.
			// tags:
			//		protected

			var rd = this.renderData;
			
			hour = hour || rd.minHours;
			minutes = minutes || 0;
			maxDuration = maxDuration || 0;
			
			if (minutes < 0){
				minutes = 0;
			}else if (minutes > 59){
				minutes = 59;
			}
			
			if (hour < 0){
				hour = 0;
			}else if (hour > 24){
				hour = 24;
			}
			
			var timeInMinutes = hour * 60 + minutes;
			
			var minH = rd.minHours*60;
			var maxH = rd.maxHours*60;
			
			if (timeInMinutes < minH){
				timeInMinutes = minH;
			}else if(timeInMinutes > maxH){
				timeInMinutes = maxH;
			}
					
			var pos = (timeInMinutes - minH) * rd.sheetHeight / (maxH - minH);
			pos = Math.min(rd.sheetHeight - this.scrollContainer.offsetHeight, pos);
			
			this._scrollToPosition(pos, maxDuration, easing);
		},
		
		_scrollToPosition: function(position, maxDuration, easing){
			// summary:
			//		Scrolls the view to show the specified first time of day.
			// position: Integer
			//		The position in pixels.
			// maxDuration: Integer
			//		The max duration of the scroll animation.
			// tags:
			//		protected
			
			if (maxDuration) {
				
				if(this._scrollAnimation){
					this._scrollAnimation.stop();
				}
				
				var scrollPos = this._getScrollPosition();
				
				var duration = Math.abs(((position - scrollPos) * maxDuration) / this.renderData.sheetHeight);
				
				this._scrollAnimation = new fx.Animation({
					curve: [scrollPos, position],
					duration: duration,
					easing: easing,
					onAnimate: lang.hitch(this, function(position) {
						this._setScrollImpl(position);
					})
				});
								
				this._scrollAnimation.play();

			}else{
				this._setScrollImpl(position);
			}
		},
		
		_setScrollImpl: function(v){
			this._setScrollPosition(v);
			if(this.scrollBar){
				this.scrollBar.set("value", v);
			}
		},
		
		ensureVisibility: function(start, end, visibilityTarget, margin, duration){
			
			// summary:
			//		Scrolls the view if the [start, end] time range is not visible or only partially visible.
			// start: Date
			//		Start time of the range of interest.
			// end: Date
			//		End time of the range of interest.
			// margin: Integer
			//		Margin in minutes around the time range.
			// visibilityTarget: String
			//		The end(s) of the time range to make visible.
			//		Valid values are: "start", "end", "both".	
			// duration: Number
			//		Optional, the maximum duration of the scroll animation.
			
			margin = margin == undefined ? this.renderData.slotDuration : margin;
			
			if(this.scrollable && this.autoScroll){
				
				var s = start.getHours() * 60 + start.getMinutes() - margin;
				var e = end.getHours() * 60 + end.getMinutes() + margin;
				
				var vs = this._getStartTimeOfDay();
				var ve = this._getEndTimeOfDay();
				
				var viewStart = vs.hours * 60 + vs.minutes; 
				var viewEnd = ve.hours * 60 + ve.minutes;
				
				var visible = false;
				var target = null;
				
				switch(visibilityTarget){
					case "start":
						visible = s >= viewStart && s <= viewEnd;
						target = s ;
						break;
					case "end":
						visible = e >= viewStart && e <= viewEnd;
						target = e - (viewEnd - viewStart);
						break;
					case "both":
						visible = s >= viewStart && e <= viewEnd;
						target = s;
						break;
				}

				if(!visible){
					this._setStartTimeOfDay(Math.floor(target/60), target%60, duration);
				}
			}
		},
		
		scrollView: function(dir){
			// summary:
			//		Scrolls the view to the specified direction of one time slot duration.
			// dir: Integer
			//		Direction of the scroll. Valid values are -1 and 1.
			//
			var t = this._getStartTimeOfDay();
			t = t.hours*60 + t.minutes + (dir * this.timeSlotDuration);
			this._setStartTimeOfDay(Math.floor(t/60), t%60);
		},
		
		_mouseWheelScrollHander: function(e){
			// summary:
			//		Mouse wheel handler.
			// tags:
			//		protected
			this.scrollView(e.wheelDelta > 0 ? -1 : 1);
		},		
		
		//////////////////////////////////////////
		//
		// HTML structure management
		//
		//////////////////////////////////////////		
	
		refreshRendering: function(){
			if(!this._initialized){
				return;
			}
						
			this._validateProperties();

			var oldRd = this.renderData;
			var rd = this._createRenderData();
			this.renderData = rd;
			this._createRendering(rd, oldRd);
			this._layoutRenderers(rd);
		},
		
		_createRendering: function(/*Object*/renderData, /*Object*/oldRenderData){
			// tags:
			//		private
			domStyle.set(this.sheetContainer, "height", renderData.sheetHeight + "px");
			// padding for the scroll bar.
			this._configureScrollBar(renderData);
			this._buildColumnHeader(renderData, oldRenderData);
			this._buildRowHeader(renderData, oldRenderData);
			this._buildGrid(renderData, oldRenderData);
			this._buildItemContainer(renderData, oldRenderData);
		},
		
		_configureScrollBar: function(renderData){
			// summary:
			//		Sets the scroll bar size and position.
			// renderData: Object
			//		The render data.
			// tags:
			//		protected

			if(has("ie") && this.scrollBar){
				domStyle.set(this.scrollBar.domNode, "width", (renderData.scrollbarWidth + 1) + "px");
			}
						
			var atRight = this.isLeftToRight() ? true : this.scrollBarRTLPosition == "right";
			var rPos = atRight ? "right" : "left";
			var lPos = atRight? "left" : "right";
			
			if(this.scrollBar){
				this.scrollBar.set("maximum", renderData.sheetHeight);			
				domStyle.set(this.scrollBar.domNode, rPos, 0);
				domStyle.set(this.scrollBar.domNode, atRight? "left" : "right", "auto");
			}
			domStyle.set(this.scrollContainer, rPos, renderData.scrollbarWidth + "px");
			domStyle.set(this.scrollContainer, lPos, "0");
			domStyle.set(this.header, rPos, renderData.scrollbarWidth + "px");
			domStyle.set(this.header, lPos, "0");
			if(this.buttonContainer && this.owner != null && this.owner.currentView == this){
				domStyle.set(this.buttonContainer, rPos, renderData.scrollbarWidth + "px");
				domStyle.set(this.buttonContainer, lPos, "0");
			}
		},
		
		_columnHeaderClick: function(e){
			// tags:
			//		private

			event.stop(e);
			var index = query("td", this.columnHeaderTable).indexOf(e.currentTarget);
			this._onColumnHeaderClick({
				index: index,
				date: this.renderData.dates[index],
				triggerEvent: e
			});						
		},
		
		_buildColumnHeader: function(renderData, oldRenderData){				
			// summary:
			//		Creates incrementally the HTML structure of the column header and configures its content.
			//
			// renderData:
			//		The render data to display.
			//
			// oldRenderData:
			//		The previously render data displayed, if any.
			// tags:
			//		private

			var table = this.columnHeaderTable;
			
			if (!table){
				return;
			}
					
			var count = renderData.columnCount - (oldRenderData ? oldRenderData.columnCount : 0);
			
			if(has("ie") == 8){
				// workaround Internet Explorer 8 bug.
				// if on the table, width: 100% and table-layout: fixed are set
				// and columns are removed, width of remaining columns is not 
				// recomputed: must rebuild all. 
				if(this._colTableSave == null){
					this._colTableSave = lang.clone(table);
				}else if(count < 0){
					this._cleanupColumnHeader();
					this.columnHeader.removeChild(table);
					domConstruct.destroy(table);
					table = lang.clone(this._colTableSave);
					this.columnHeaderTable = table;
					this.columnHeader.appendChild(table);
					count = renderData.columnCount;
				}
				
			} // else incremental dom add/remove for real browsers.
					
			var tbodies = query("tbody", table);
			
			var trs = query("tr", table);
			var tbody, tr, td;
			
			if (tbodies.length == 1){
				tbody = tbodies[0];
			}else{ 
				tbody = html.create("tbody", null, table);
			}
			
			if (trs.length == 1){
				tr = trs[0];
			}else{ 
				tr = domConstruct.create("tr", null, tbody);
			}
						 
			// Build HTML structure (incremental)
			if(count > 0){ // creation				
				for(var i=0; i < count; i++){
														
					td = domConstruct.create("td", null, tr);
					
					var h = [];
					h.push(on(td, "click", lang.hitch(this, this._columnHeaderClick)));
										
					if(has("touch")){					
						h.push(on(td, "touchstart", function(e){
							event.stop(e);
							domClass.add(e.currentTarget, "Active");
						}));
						
						h.push(on(td, "touchend", function(e){			
							event.stop(e);			
							domClass.remove(e.currentTarget, "Active");			
						}));
					}else{
						h.push(on(td, "mousedown", function(e){
							event.stop(e);
							domClass.add(e.currentTarget, "Active");
						}));
												
						h.push(on(td, "mouseup", function(e){
							event.stop(e);
							domClass.remove(e.currentTarget, "Active");
						}));					
						
						h.push(on(td, "mouseover", function(e){
							event.stop(e);
							domClass.add(e.currentTarget, "Hover");
						}));
											
						h.push(on(td, "mouseout", function(e){
							event.stop(e);
							domClass.remove(e.currentTarget, "Hover");
						}));
					
					}
					
					this._columnHeaderHandlers.push(h);
					 
				}
			}else{ // deletion
				count = -count;
				for(var i=0; i < count; i++){
					td = tr.lastChild;
					tr.removeChild(td);
					domConstruct.destroy(td);
					var list = this._columnHeaderHandlers.pop();
					while(list.length>0){
						list.pop().remove();
					}
				}
			}
			
			// fill & configure		
			query("td", table).forEach(function(td, i){
				td.className = "";											
				if(i == 0){
					domClass.add(td, "first-child");
				}else if(i == this.renderData.columnCount-1){
					domClass.add(td, "last-child");
				}
				var d = renderData.dates[i];
				this._setText(td, this._formatColumnHeaderLabel(d));
				this.styleColumnHeaderCell(td, d, renderData);						
			}, this);
			
			if(this.yearColumnHeaderContent){
				var d = renderData.dates[0];
					this._setText(this.yearColumnHeaderContent, renderData.dateLocaleModule.format(d,
						{selector: "date", datePattern:"yyyy"}));
			}
		},
		
		_cleanupColumnHeader: function(){
			while(this._columnHeaderHandlers.length > 0){
				var list = this._columnHeaderHandlers.pop();
				while(list.length > 0){
					list.pop().remove();
				}
			}
		},
		
		styleColumnHeaderCell: function(node, date, renderData){
			// summary:
			//		Styles the CSS classes to the node that displays a column header cell.
			//		By default this method is setting the "dojoxCalendarToday" class name if the 
			//		date displayed is the current date or "dojoxCalendarWeekend" if the date represents a weekend.
			// node: Node
			//		The DOM node that displays the column in the grid.
			// date: Date
			//		The date displayed by this column
			// renderData: Object			
			//		The render data.
			// tags:
			//		protected

			if(this.isToday(date)){				
				return domClass.add(node, "dojoxCalendarToday");
			} else if(this.isWeekEnd(date)){
				return domClass.add(node, "dojoxCalendarWeekend");
			}	
		},
		
		_buildRowHeader: function(renderData, oldRenderData){

			// summary:
			//		Creates incrementally the HTML structure of the row header and configures its content.			
			//
			// renderData:
			//		The render data to display.
			//
			// oldRenderData:
			//		The previously render data displayed, if any.
			// tags:
			//		private

			
			var rowHeaderTable = this.rowHeaderTable;
			
			if (!rowHeaderTable){
				return;
			}
						
			domStyle.set(rowHeaderTable, "height", renderData.sheetHeight + "px");
			
			var tbodies = query("tbody", rowHeaderTable);			
			var tbody, tr, td;
			
			if (tbodies.length == 1){
				tbody = tbodies[0];
			}else{ 
				tbody = domConstruct.create("tbody", null, rowHeaderTable);
			}
									
			var count = renderData.hourCount - (oldRenderData ? oldRenderData.hourCount : 0);
		
			// Build HTML structure
			if(count>0){ // creation
				for(var i=0; i < count; i++){
					tr = domConstruct.create("tr", null, tbody);
					td = domConstruct.create("td", null, tr);						
				}					 
			}else{
				count = -count;
				// deletion of existing nodes
				for(var i=0; i < count; i++){
					tbody.removeChild(tbody.lastChild);
				}
			}		
								
			// fill labels
			var d = new Date(2000, 0, 1, 0, 0, 0);
			
			query("tr", rowHeaderTable).forEach(function(tr, i){
				var td = query("td", tr)[0];				
				td.className = "";				
				
				var size = renderData.hourSize;
				if (has("ie") == 7) {
					// ie7 workaournd: do not take border into account.
					size -= 2;					
				}

				domStyle.set(tr, "height", size + "px");
				
				d.setHours(this.renderData.minHours + (i));
				this.styleRowHeaderCell(td, d.getHours(), renderData);					
				this._setText(td, this._formatRowHeaderLabel(d));

			}, this);
						
		},		
		
		styleRowHeaderCell: function(node, h, renderData){
			// summary:
			//		Styles the CSS classes to the node that displays a row header cell.
			//		By default this method is doing nothing.
			// node: Node
			//		The DOM node that displays the column in the grid.
			// h: Integer
			//		The time of day displayed by this row header cell.
			// renderData: Object
			//		The render data.
			// tags:
			//		protected
		},
	
		_buildGrid: function (renderData, oldRenderData){
			// summary:
			//		Creates incrementally the HTML structure of the grid and configures its content.
			//
			// renderData:
			//		The render data to display.
			//
			// oldRenderData:
			//		The previously render data displayed, if any.	
			// tags:
			//		private

									
			var table = this.gridTable;
			
			if (!table){
				return;
			}
			
			domStyle.set(table, "height", renderData.sheetHeight + "px");											
			
			var nbRows = Math.floor(60 / renderData.slotDuration) * renderData.hourCount;
			
			var rowDiff = nbRows - 
				(oldRenderData ? Math.floor(60 / oldRenderData.slotDuration) * oldRenderData.hourCount : 0);
				
			var addRows = rowDiff > 0;
			
			var colDiff  = renderData.columnCount - (oldRenderData ? oldRenderData.columnCount : 0);
			
			if(has("ie") == 8){
				// workaround Internet Explorer 8 bug.
				// if on the table, width: 100% and table-layout: fixed are set
				// and columns are removed, width of remaining columns is not 
				// recomputed: must rebuild all. 
				if(this._gridTableSave == null){
					this._gridTableSave = lang.clone(table);
				}else if(colDiff < 0){										
					this.grid.removeChild(table);
					domConstruct.destroy(table);
					table = lang.clone(this._gridTableSave);
					this.gridTable = table;
					this.grid.appendChild(table);
					colDiff = renderData.columnCount;
					rowDiff = nbRows;
					addRows = true;
				}				
			}
			
			var tbodies = query("tbody", table);			
			var tbody;
			
			if (tbodies.length == 1){
				tbody = tbodies[0];
			}else{ 
				tbody = domConstruct.create("tbody", null, table);
			}
			
			// Build time slots (lines) HTML structure (incremental)
			if(addRows){ // creation
				for(var i=0; i<rowDiff; i++){
					domConstruct.create("tr", null, tbody);
				}		 
			}else{ // deletion		 
				rowDiff = -rowDiff;
				for(var i=0; i<rowDiff; i++){
					tbody.removeChild(tbody.lastChild);
				}
			}
			
			var rowIndex = Math.floor(60 / renderData.slotDuration) * renderData.hourCount - rowDiff;
			
			var addCols = addRows || colDiff >0; 
			colDiff = addCols ? colDiff : -colDiff;
			
			query("tr", table).forEach(function(tr, i){
				
				if(addCols){ // creation				
					var len = i >= rowIndex ? renderData.columnCount : colDiff;							
					for(var i=0; i<len; i++){
						domConstruct.create("td", null, tr);
					}
				}else{ // deletion								
					for(var i=0; i<colDiff; i++){
						tr.removeChild(tr.lastChild);
					}
				}
			});
			
			// Set the CSS classes
			
			query("tr", table).forEach(function (tr, i){
				
				domStyle.set(tr, "height", renderData.slotSize + "px");
				
				if(i == 0){
					domClass.add(tr, "first-child");
				}else if(i == nbRows-1){
					domClass.add(tr, "last-child");
				}
				
				// the minutes part of the time of day displayed by the current tr
				var m = (i * this.renderData.slotDuration) % 60;
				
				query("td", tr).forEach(function (td, col){
					
					td.className = "";
					
					if(col == 0){
						domClass.add(td, "first-child");
					}else if(col == this.renderData.columnCount-1){
						domClass.add(td, "last-child");
					}
					
					var d = renderData.dates[col];
					
					this.styleGridColumn(td, d, renderData);
					
					switch(m){
						case 0:
							domClass.add(td, "hour");
							break;
						case 30:
							domClass.add(td, "halfhour");
							break;
						case 15:
						case 45:
							domClass.add(td, "quarterhour");
							break;
					}
				}, this);				
			}, this); 
												 
		},
				
		styleGridColumn: function(node, date, renderData){
			// summary:
			//		Styles the CSS classes to the node that displays a column.
			//		By default this method is setting the "dojoxCalendarToday" class name if the 
			//		date displayed is the current date or "dojoxCalendarWeekend" if the date represents a weekend.
			// node: Node
			//		The DOM node that displays the column in the grid.
			// date: Date
			//		The date displayed by this column
			// renderData: Object
			//		The render data object.
			// tags:
			//		protected

			if(this.isToday(date)){				
				return domClass.add(node, "dojoxCalendarToday");
			} else if(this.isWeekEnd(date)){
				return domClass.add(node, "dojoxCalendarWeekend");
			}	
		},
							
		_buildItemContainer: function(renderData, oldRenderData){
			// summary:
			//		Creates the HTML structure of the item container and configures its content.
			// renderData:
			//		The render data to display.
			// oldRenderData:
			//		The previously render data displayed, if any.
			// tags:
			//		private

			var table = this.itemContainerTable;
			
			if (!table){
				return;
			}
			
			var bgCols = [];
	
			domStyle.set(table, "height", renderData.sheetHeight + "px");			
			
			var count = renderData.columnCount - (oldRenderData ? oldRenderData.columnCount : 0);
			
			if(has("ie") == 8){
				// workaround Internet Explorer 8 bug.
				// if on the table, width: 100% and table-layout: fixed are set
				// and columns are removed, width of remaining columns is not 
				// recomputed: must rebuild all. 
				if(this._itemTableSave == null){
					this._itemTableSave = lang.clone(table);
				}else if(count < 0){
					this.itemContainer.removeChild(table);
					this._recycleItemRenderers(true);
					domConstruct.destroy(table);
					table = lang.clone(this._itemTableSave);
					this.itemContainerTable = table;
					this.itemContainer.appendChild(table);
					count = renderData.columnCount;
				}
				
			} // else incremental dom add/remove for real browsers.
			
			var tbodies = query("tbody", table);
			var trs = query("tr", table);
			var tbody, tr, td;
			
			if (tbodies.length == 1){
				tbody = tbodies[0];
			}else{ 
				tbody = domConstruct.create("tbody", null, table);
			}
			
			if (trs.length == 1){
				tr = trs[0];
			}else{ 
				tr = domConstruct.create("tr", null, tbody);
			}					
								
			// Build HTML structure (incremental)
			if(count>0){ // creation
				for(var i=0; i < count; i++){
					td = domConstruct.create("td", null, tr);	
					domConstruct.create("div", {"className": "dojoxCalendarContainerColumn"}, td);
				}
			}else{ // deletion		 
				count = -count;
				for(var i=0; i < count; i++){
					tr.removeChild(tr.lastChild);
				}
			}	
			
			query("td>div", table).forEach(function(div, i){

				domStyle.set(div, {
					"height": renderData.sheetHeight + "px"
				});
				bgCols.push(div);		
			}, this);
			
			renderData.cells = bgCols;
		},			
		
		///////////////////////////////////////////////////////////////
		//
		// Layout
		//
		///////////////////////////////////////////////////////////////
		
		_overlapLayoutPass2: function(lanes){
			// summary:
			//		Second pass of the overlap layout (optional). Compute the extent of each layout item.
			// lanes:
			//		The array of lanes.
			// tags:
			//		private
			var i,j,lane, layoutItem;
			// last lane, no extent possible
			lane = lanes[lanes.length-1];
			
			for(j = 0; j < lane.length; j++){
				lane[j].extent = 1;
			}
						
			for(i=0; i<lanes.length-1; i++){
				lane = lanes[i];
				
				for(var j=0; j<lane.length; j++){	 
					layoutItem = lane[j];
					
					// if item was already overlapping another one there is no extent possible.
					if(layoutItem.extent == -1){
						layoutItem.extent = 1;
						var space = 0;
						
						var stop = false;
						
						for(var k = i + 1; k < lanes.length && !stop; k++){
							var ccol = lanes[k];
							for(var l = 0; l < ccol.length && !stop; l++){
								var layoutItem2 = ccol[l];
								
								if(layoutItem.start < layoutItem2.end && layoutItem2.start < layoutItem.end){
									stop = true;
								}
							}
							if(!stop){
								//no hit in the entire lane
								space++;
							}
						}
						layoutItem.extent += space;
					}
				}
			}
		},
		
		_defaultItemToRendererKindFunc: function(item){
			// tags:
			//		private
			return "vertical"; // String
		},
		
		_layoutInterval: function(/*Object*/renderData, /*Integer*/index, /*Date*/start, /*Date*/end, /*Object[]*/items){
			// tags:
			//		private

			var verticalItems = [];
			renderData.colW = this.itemContainer.offsetWidth / renderData.columnCount;
			
			for(var i=0; i<items.length; i++){
				var item = items[i];
				if(this._itemToRendererKind(item) == "vertical"){
					verticalItems.push(item);
				}
			}
			
			if(verticalItems.length > 0){
				this._layoutVerticalItems(renderData, index, start, end, verticalItems);
			}
		},

		_layoutVerticalItems: function(/*Object*/renderData, /*Integer*/index, /*Date*/startTime, /*Date*/endTime, /*Object[]*/items){
			// tags:
			//		private

			if(this.verticalRenderer == null){
				return;
			}
			
			var cell = renderData.cells[index];
			var layoutItems = [];			
			
			// step 1 compute projected position and size
			for(var i = 0; i < items.length; i++){
				
				var item = items[i];
				var overlap = this.computeRangeOverlap(renderData, item.startTime, item.endTime, startTime, endTime);
				
				var top = this.computeProjectionOnDate(renderData, startTime, overlap[0], renderData.sheetHeight);
				var bottom = this.computeProjectionOnDate(renderData, startTime, overlap[1], renderData.sheetHeight);
				
				if (bottom > top){
					var litem = lang.mixin({
						start: top,
						end: bottom,
						range: overlap,
						item: item
					}, item);
					layoutItems.push(litem);
				}
			}
			
			// step 2: compute overlapping layout
			var numLanes = this.computeOverlapping(layoutItems, this._overlapLayoutPass2).numLanes;

			var hOverlap = this.percentOverlap / 100;

			// step 3: create renderers and apply layout
			for(i=0; i<layoutItems.length; i++){

				item = layoutItems[i];					
				var lane = item.lane;
				var extent = item.extent;

				var w;
				var posX;				

				if(hOverlap == 0) {
					//no overlap and a padding between each event
					w = numLanes == 1 ? renderData.colW : ((renderData.colW - (numLanes - 1) * this.horizontalGap)/ numLanes);
					posX = lane * (w + this.horizontalGap);
					w = extent == 1 ? w : w * extent + (extent-1) * this.horizontalGap;
					w = 100 * w / renderData.colW;
					posX = 100 * posX / renderData.colW; 
				} else {
					// an overlap
					w = numLanes == 1 ? 100 : (100 / (numLanes - (numLanes - 1) * hOverlap));
					posX = lane * (w - hOverlap*w);
					w = extent == 1 ? w : w * ( extent - (extent-1) * hOverlap);
				}

				var ir = this._createRenderer(item, "vertical", this.verticalRenderer, "dojoxCalendarVertical");

				domStyle.set(ir.container, {
					"top": item.start + "px",
					"left": posX + "%",
					"width": w + "%",
					"height": (item.end-item.start+1) + "px"
				});

				var edited = this.isItemBeingEdited(item);
				var selected = this.isItemSelected(item);
				var hovered = this.isItemHovered(item);
				var focused = this.isItemFocused(item);

				var renderer = ir.renderer;

				renderer.set("hovered", hovered);
				renderer.set("selected", selected);
				renderer.set("edited", edited);
				renderer.set("focused", this.showFocus ? focused : false);
				renderer.set("moveEnabled", this.isItemMoveEnabled(item, "vertical"));
				renderer.set("resizeEnabled", this.isItemResizeEnabled(item, "vertical"));

				this.applyRendererZIndex(item, ir, hovered, selected, edited, focused);

				if(renderer.updateRendering){
					renderer.updateRendering(w, item.end-item.start+1);
				}

				domConstruct.place(ir.container, cell);
				domStyle.set(ir.container, "display", "block");
			}
		},
		
		_sortItemsFunction: function(a, b){
			// tags:
			//		private

			var res = this.dateModule.compare(a.startTime, b.startTime);
			if(res == 0){
				res = -1 * this.dateModule.compare(a.endTime, b.endTime);
			}
			return this.isLeftToRight() ? res : -res;
		},
		
		///////////////////////////////////////////////////////////////
		//
		// View to time projection
		//
		///////////////////////////////////////////////////////////////
		
		getTime: function(e, x, y, touchIndex){
			// summary:
			//		Returns the time displayed at the specified point by this component.
			// e: Event
			//		Optional mouse event.
			// x: Number
			//		Position along the x-axis with respect to the sheet container used if event is not defined.
			// y: Number
			//		Position along the y-axis with respect to the sheet container (scroll included) used if event is not defined.
			// touchIndex: Integer
			//		If parameter 'e' is not null and a touch event, the index of the touch to use.
			// returns: Date
			
			if (e != null){				
				var refPos = domGeometry.position(this.itemContainer, true);
				
				if(e.touches){									
					
					touchIndex = touchIndex==undefined ? 0 : touchIndex;
									
					x = e.touches[touchIndex].pageX - refPos.x;
					y = e.touches[touchIndex].pageY - refPos.y;									
					
				}else{
					
					x = e.pageX - refPos.x;					
					y = e.pageY - refPos.y;					
				}
			}
			
			var r = domGeometry.getContentBox(this.itemContainer);
			
			if(!this.isLeftToRight()){
				x = r.w - x;
			}
			
			if (x < 0){
				x = 0;
			}else if(x > r.w){
				x = r.w-1;
			}
			
			if (y < 0){
				y = 0;
			}else if(y > r.h){
				y = r.h-1;
			}
			
			var col = Math.floor(x / (domGeometry.getMarginBox(this.itemContainer).w / this.renderData.columnCount));
			var t = this.getTimeOfDay(y, this.renderData);
			
			var date = null;
			if(col < this.renderData.dates.length){			
				date = this.newDate(this.renderData.dates[col]); 
				date = this.floorToDay(date, true);
				date.setHours(t.hours);
				date.setMinutes(t.minutes);
			}
	
			return date;
		},
		
		///////////////////////////////////////////////////////////////
		//
		// Events
		//
		///////////////////////////////////////////////////////////////
		
		_onGridMouseUp: function(e){
			// tags:
			//		private

			this.inherited(arguments);
			
			if (this._gridMouseDown) {
				this._gridMouseDown = false;
				
				this._onGridClick({
					date: this.getTime(e),
					triggerEvent: e
				});
			}			
		},			
			
		_onGridTouchStart: function(e){
			// tags:
			//		private

			this.inherited(arguments);
			
			var g = this._gridProps;

			g.moved= false;
			g.start= e.touches[0].screenY;
			g.scrollTop= this._getScrollPosition();
		},
		
		_onGridTouchMove: function(e){
			// tags:
			//		private

			this.inherited(arguments);						
			
			if (e.touches.length > 1 && !this._isEditing){
				event.stop(e);				
				return;
			}			
			
			if(this._gridProps && !this._isEditing){
				
				var touch = {x: e.touches[0].screenX, y: e.touches[0].screenY};
				
				var p = this._edProps;
				
				if (!p || p && 
					(Math.abs(touch.x - p.start.x) > 25 || 
					 Math.abs(touch.y - p.start.y) > 25)) {
																		
					this._gridProps.moved = true;
					var d = e.touches[0].screenY - this._gridProps.start; 
					var value = this._gridProps.scrollTop - d;
					var max = this.itemContainer.offsetHeight - this.scrollContainer.offsetHeight;
					if (value < 0){
						this._gridProps.start = e.touches[0].screenY;
						this._setScrollImpl(0);
						this._gridProps.scrollTop = 0;
					}else if(value > max){
						this._gridProps.start = e.touches[0].screenY;
						this._setScrollImpl(max);
						this._gridProps.scrollTop = max;
					}else{
						this._setScrollImpl(value);
					}
				}
			}
		},
		
		_onGridTouchEnd: function(e){
			// tags:
			//		private

			//event.stop(e);
								
			this.inherited(arguments);
									
			var g = this._gridProps;					
			
			if(g){
				if(!this._isEditing){
					if(!g.moved){
						
						// touched on grid and on touch start editing was ongoing.
						if(!g.fromItem && !g.editingOnStart){								
							this.selectFromEvent(e, null, null, true);
						}			
						
						if(!g.fromItem){
						
							if(this._pendingDoubleTap && this._pendingDoubleTap.grid){
															
								this._onGridDoubleClick({
									date: this.getTime(this._gridProps.event),
									triggerEvent: this._gridProps.event
								});
								
								clearTimeout(this._pendingDoubleTap.timer);
						
								delete this._pendingDoubleTap;
								
							}else{
															
								this._onGridClick({
									date: this.getTime(this._gridProps.event),
									triggerEvent: this._gridProps.event
								});
								
								this._pendingDoubleTap = {
									grid: true,
									timer: setTimeout(lang.hitch(this, function(){
											delete this._pendingDoubleTap;
									}), this.doubleTapDelay)
								};
							}
						}	
					}
				}
				
				this._gridProps = null;
			}
		},
		
		_onColumnHeaderClick: function(e){
			// tags:
			//		private

			this._dispatchCalendarEvt(e, "onColumnHeaderClick");
		},
		
		
		
		onColumnHeaderClick: function(e){
			// summary:
			//		Event dispatched when a column header cell is dispatched.
			// e: __ColumnClickEventArgs
			//		The event has the following properties
			// tags:
			//		callback					
		},
		

		getTimeOfDay: function (pos, rd) {
			// summary:
			//		Return the time of day associated to the specified position.
			// pos: Integer
			//		The position in pixels.
			// rd: Object
			//		The render data.
			var minH = rd.minHours*60;
			var maxH = rd.maxHours*60;
			var minutes = minH + (pos * (maxH - minH) / rd.sheetHeight);
			var d = {
				hours: Math.floor(minutes / 60),
				minutes: Math.floor(minutes % 60)
			};
			return d;
		},
		
		///////////////////////////////////////////////////////////////
		//
		// View limits
		//
		///////////////////////////////////////////////////////////////
		
		_isItemInView: function(item){
			
			// subclassed to add some tests
									
			var res = this.inherited(arguments);
			
			if(res){
				
				// test if time range is overlapping [maxHours, next day min hours]
				var rd = this.renderData;
				
				var len = rd.dateModule.difference(item.startTime, item.endTime, "millisecond"); 
				var vLen = (24 - rd.maxHours + rd.minHours) * 3600000; // 60 * 60 * 1000, number of milliseconds in 1 minute
				
				if(len > vLen){ // longer events are always visible
					return true;
				}						
				
				var sMin = item.startTime.getHours()*60 + item.startTime.getMinutes();
				var eMin = item.endTime.getHours()*60 + item.endTime.getMinutes(); 
				var sV = rd.minHours * 60;
				var eV = rd.maxHours * 60;
				
				if(sMin > 0 && sMin < sV || sMin > eV && sMin <= 1440){
					return false;
				}
				
				if(eMin > 0 && eMin < sV || eMin > eV && eMin <= 1440){
					return false;
				}							
			}
			return res;
		},
				
		_ensureItemInView: function(item){
											
			var fixed;
			
			var startTime = item.startTime;
			var endTime = item.endTime;
									
			// test if time range is overlapping [maxHours, next day min hours]
			var rd = this.renderData;
			var cal = rd.dateModule;
			
			var len = Math.abs(cal.difference(item.startTime, item.endTime, "millisecond")); 
			var vLen = (24 - rd.maxHours + rd.minHours) * 3600000;
			
			if(len > vLen){ // longer events are always visible
				return false;
			}						
			
			var sMin = startTime.getHours()*60 + startTime.getMinutes();
			var eMin = endTime.getHours()*60 + endTime.getMinutes(); 
			var sV = rd.minHours * 60;
			var eV = rd.maxHours * 60;
			
			if(sMin > 0 && sMin < sV){
				this.floorToDay(item.startTime, true, rd);
				item.startTime.setHours(rd.minHours);
				item.endTime = cal.add(item.startTime, "millisecond", len);
				fixed = true;
			}else if(sMin > eV && sMin <= 1440){
				// go on next visible time
				this.floorToDay(item.startTime, true, rd);
				item.startTime = cal.add(item.startTime, "day", 1);
				// if we are going out of the view, the super() will fix it
				item.startTime.setHours(rd.minHours);
				item.endTime = cal.add(item.startTime, "millisecond", len);
				fixed = true;
			}
			
			if(eMin > 0 && eMin < sV){
				// go on previous day
				this.floorToDay(item.endTime, true, rd);
				item.endTime = cal.add(item.endTime, "day", -1);
				item.endTime.setHours(rd.maxHours);
				item.startTime = cal.add(item.endTime, "millisecond", -len);
				fixed = true;
			}else if(eMin > eV && eMin <= 1440){
				this.floorToDay(item.endTime, true, rd);
				item.endTime.setHours(rd.maxHours);
				item.startTime = cal.add(item.endTime, "millisecond", -len);
				fixed = true;
			}							
			
			fixed = fixed || this.inherited(arguments);
			
			return fixed;
		},
				
		_onScrollTimer_tick: function(){
			// tags:
			//		private

			this._scrollToPosition(this._getScrollPosition() + this._scrollProps.scrollStep);
		},
		
		////////////////////////////////////////////
		//
		// Editing
		//
		///////////////////////////////////////////						
		
		snapUnit: "minute",
		snapSteps: 15,
		minDurationUnit: "minute",
		minDurationSteps: 15,
		liveLayout: false,
		stayInView: true,
		allowStartEndSwap: true,
		allowResizeLessThan24H: true
		
	});
});

},
'dojox/calendar/ExpandRenderer':function(){
require({cache:{
'url:dojox/calendar/templates/ExpandRenderer.html':"<div class=\"dojoxCalendarExpand\" onselectstart=\"return false;\" data-dojo-attach-event=\"click:_onClick,touchstart:_onMouseDown,touchend:_onClick,mousedown:_onMouseDown,mouseup:_onMouseUp,mouseover:_onMouseOver,mouseout:_onMouseOut\">\n\t<div class=\"bg\"><span data-dojo-attach-point=\"expand\">▼</span><span style=\"display:none\" data-dojo-attach-point=\"collapse\">▲</span></div>\t\n</div>\n"}});
define("dojox/calendar/ExpandRenderer", [
"dojo/_base/declare", 
"dojo/_base/lang", 
"dojo/_base/event", 
"dojo/_base/window", 
"dojo/on", 
"dojo/dom-class", 
"dojo/dom-style",
"dijit/_WidgetBase", 
"dijit/_TemplatedMixin", 
"dojo/text!./templates/ExpandRenderer.html"],
	 
function(
declare, 
lang, 
event, 
win, 
on, 
domClass, 
domStyle, 
_WidgetBase, 
_TemplatedMixin, 
template){
	
	return declare("dojox.calendar.ExpandRenderer", [_WidgetBase, _TemplatedMixin], {
		
		// summary:
		//		The default renderer display in MatrixView cells where some item renderers cannot be displayed because of size constraints.
		
		templateString: template,
		
		baseClass: "dojoxCalendarExpand",
		
		// owner: dojox/calendar/_ViewBase
		//		The view that contains this renderer.
		owner: null,

		// focused: Boolean
		//		Indicates that the renderer is focused.
		focused: false,

		// up: Boolean
		//		Indicates that the mouse cursor is over renderer.
		up: false,

		// down: Boolean
		//		Indicates that the renderer is pressed.
		down: false,

		// date: Date
		//		The date displayed by the cell where this renderer is used.
		date: null,

		// items: Object[]
		//		List of items that are not displayed in the cell because of the size constraints.
		items: null,
		
		// rowIndex: Integer
		//		Row index where this renderer is used.
		rowIndex: -1,
		
		// columnIndex: Integer
		//		Column index where this renderer is used.
		columnIndex: -1,
		
		_setExpandedAttr: function(value){
			domStyle.set(this.expand, "display", value ? "none" : "inline-block");
			domStyle.set(this.collapse, "display", value ? "inline-block" : "none"); 
			this._set("expanded", value);
		},

		_setDownAttr: function(value){
			this._setState("down", value, "Down");
		},

		_setUpAttr: function(value){
			this._setState("up", value, "Up");
		},

		_setFocusedAttr: function(value){
			this._setState("focused", value, "Focused");
		},

		_setState: function(prop, value, cssClass){
			if (this[prop] != value){
				var tn = this.stateNode || this.domNode;
				domClass[value ? "add" : "remove"](tn, cssClass);
				this._set(prop, value);
			}	
		},

		_onClick: function(e){
			// tags:
			//		private

			if(this.owner && this.owner.expandRendererClickHandler){
				this.owner.expandRendererClickHandler(e, this);
			}
		},

		_onMouseDown: function(e){
			// tags:
			//		private

			event.stop(e);
			this.set("down", true);
		},

		_onMouseUp: function(e){
			// tags:
			//		private

			this.set("down", false);
		},

		_onMouseOver: function(e){
			// tags:
			//		private

			if(!this.up){
				var buttonDown = e.button == 1;
				this.set("up", !buttonDown);
				this.set("down", buttonDown);
			}
		},

		_onMouseOut: function(e){
			// tags:
			//		private

			var node = e.relatedTarget;
			while(node != e.currentTarget && node != win.doc.body && node != null){
				node = node.parentNode;
			}
			if(node == e.currentTarget){
				return;
			}
			this.set("up", false);
			this.set("down", false);
		}

	});

});

},
'url:dojox/calendar/templates/MobileVerticalRenderer.html':"<div class=\"dojoxCalendarEvent dojoxCalendarVertical\">\n\t<div class=\"bg\"></div>\t\n\t<div data-dojo-attach-point=\"resizeStartHandle\" class=\"resizeStartHandle resizeHandle\"><div></div></div>\n\t<dl style=\"width:100%;\">\t\t\t\t\n\t\t<dd data-dojo-attach-point=\"beforeIcon\" class=\"beforeIcon\">▲</dd>\n\t\t<dd data-dojo-attach-point=\"startTimeLabel\" class=\"startTime\"></dd>\n\t\t<dd data-dojo-attach-point=\"summaryLabel\" class=\"summary\"></dd>\n\t</dl>\n\t<span data-dojo-attach-point=\"afterIcon\" class=\"afterIcon\">▼</span>\t\n\t<div data-dojo-attach-point=\"resizeEndHandle\" class=\"resizeEndHandle resizeHandle\"><div></div></div>\n\t<span data-dojo-attach-point=\"endTimeLabel\" class=\"endTime\"></span>\n</div>\n",
'dojox/calendar/_RendererMixin':function(){
define("dojox/calendar/_RendererMixin", ["dojo/_base/declare", "dojo/_base/lang", "dojo/dom-style", "dojo/dom-class", "dojo/Stateful"],
	 
	function(declare, lang, domStyle, domClass, Stateful){
	
	return declare("dojox.calendar._RendererMixin", Stateful, {
		
		// summary:
		//		This class is the base class of calendar renderers.
		
		// item: Object
		//		The layout item displayed by this renderer.
		item: null,
		
		// owner: dojox/calendar/_ViewBase
		//		The view that contains this renderer.
		owner: null,
		
		// edited: Boolean
		//		Indicates that the item displayed by this renderer is in editing mode.
		edited: false,
		
		// focused: Boolean
		//		Indicates that the item displayed by this renderer is focused.
		focused: false,
		
		// hovered: Boolean
		//		Indicates that the item displayed by this renderer is hovered.
		hovered: false,
		
		// selected: Boolean
		//		Indicates that the item displayed by this renderer is selected.
		selected: false,
		
		// moveEnabled: Boolean
		//		Whether the event displayed by this renderer can be moved.
		moveEnabled: true,
		
		// resizeEnabled: Boolean
		//		Whether the event displayed by this renderer can be resized.
		resizeEnabled: true,
		
		_orientation: "vertical",
		_displayValue: "block",		
		
		_displayValueMap: {},
		
		visibilityLimits: {
			resizeStartHandle: 50,
			resizeEndHandle: -1,
			summaryLabel: 15,
			startTimeLabel: 45,
			endTimeLabel: 50
		},		
		
		_setSelectedAttr: function(value){
			this._setState("selected", value, "Selected");
		},
		
		_setFocusedAttr: function(value){
			this._setState("focused", value, "Focused");
		},

		_setEditedAttr: function(value){
			this._setState("edited", value, "Edited");
		},
		
		_setHoveredAttr: function(value){
			this._setState("hovered", value, "Hovered");
		},
		
		_setState: function(prop, value, cssClass){
			if(this[prop] != value){
				var tn = this.stateNode || this.domNode;
				domClass[value ? "add" : "remove"](tn, cssClass);
				this._set(prop, value);
			}	
		},
		
		_setItemAttr: function(value){
			if(value == null){
				if(this.item && this.item.cssClass){
					domClass.remove(this.domNode, this.item.cssClass);
				}
				this.item = null;
			}else{
				if(this.item != null){
					if(this.item.cssClass != value.cssClass){
						if(this.item.cssClass){
							domClass.remove(this.domNode, this.item.cssClass);
						}
					}
					this.item = lang.mixin(this.item, value);
					if(value.cssClass){
						domClass.add(this.domNode, value.cssClass);
					}
				}else{
					this.item = value;
					if(value.cssClass){
						domClass.add(this.domNode, value.cssClass);
					}
				}
			}
		},
		
		_setText: function(node, text, allowHTML){
			// summary:
			//		Set the text to the specified node.
			// node: Node
			//		The parent node.
			// text: String
			//		The text to display.
			// allowHTML: Boolean
			//		Whether text is containing HTML formatting.
			// tags:
			//		protected
			
			if(this.owner){
				this.owner._setText(node, text, allowHTML);
			}			
		},
		
		_isElementVisible: function(elt, startHidden, endHidden, size){
			// summary:
			//		Determine whether the item renderer sub element is visible or not.
			// elt: String
			//		The element node.
			// startHidden: Boolean
			//		Indicates that the start of time interval displayed by this item renderer is not the start of the displayed event. 
			// endHidden: Boolean
			//		Indicates that the end of time interval displayed by this item renderer is not the end of the displayed event.
			// size: Integer
			//		The size of the item renderer on the time axis. 
			// tags:
			//		protected
			var visible;
			var limit = this.visibilityLimits[elt];
			
			switch(elt){
				case "moveHandle":
					visible = this.moveEnabled;
					break;
				case "resizeStartHandle":
					if(this.mobile){
						visible = this.resizeEnabled && !startHidden && this.edited && (limit == -1 || size>limit);
					}else{
						visible = this.resizeEnabled && !startHidden && (limit == -1 || size>limit);
					}
					break;
				case "resizeEndHandle":
					if(this.mobile){
						visible = this.resizeEnabled && !endHidden && this.edited && (limit == -1 || size>limit);
					}else{
						visible = this.resizeEnabled && !endHidden && (limit == -1 || size>limit);
					}
					break;
				case "startTimeLabel":
					if(this.mobile){
						visible = !startHidden && (!this.edited || this.edited && (limit == -1 || size>limit));
					}else{
						visible = !startHidden && (limit == -1 || size>limit);
					}
					break;
				case "endTimeLabel":
					
					visible = this.edited && !endHidden && (limit == -1 || size>limit);
					
					break;
				case "summaryLabel":
					if(this.mobile){
						visible = !this.edited || this.edited && (limit == -1 || size>limit);
					}else{
						visible = limit == -1 || size>limit;
					}
					break;
			}
			
			return visible;
		},
		
		_formatTime: function(rd, d){
			// summary:
			//		Returns the time formatted string.
			// rd: Object
			//		The render data.
			// d: Date
			//		The time to format.
			// tags:
			//		protected
			if(this.owner){
				var f = this.owner.get("formatItemTimeFunc");
				if(f != null){
					return this.owner.formatItemTimeFunc(d, rd);
				}
			}
			return rd.dateLocaleModule.format(d, {selector: 'time'});
		},
		
		getDisplayValue: function(part){
			return this._displayValue;
		},
		
		updateRendering: function (w, h) {
			// summary:
			//		Updates the visual appearance of the renderer according the new values of the properties and the new size of the component.
			// w: Number?
			//		The width in pixels of the renderer.
			// h: Number?
			//		The height in pixels of the renderer.
		
			h = h || this.item.h;
			w = w || this.item.w;
			
			if(!h && !w){
				return;
			}
			
			this.item.h = h;
			this.item.w = w;
			
			var size = this._orientation == "vertical" ? h : w;
	
			var rd = this.owner.renderData;

			var startHidden = rd.dateModule.compare(this.item.range[0], this.item.startTime) != 0;
			var endHidden =  rd.dateModule.compare(this.item.range[1], this.item.endTime) != 0;
			
			var visible, limit;
			
			if(this.beforeIcon != null) {
				visible = this._orientation != "horizontal" || this.isLeftToRight() ? startHidden : endHidden;
				domStyle.set(this.beforeIcon, "display", visible ? this.getDisplayValue("beforeIcon") : "none");
			}

			if(this.afterIcon != null) {
				visible = this._orientation != "horizontal" || this.isLeftToRight() ? endHidden : startHidden;
				domStyle.set(this.afterIcon, "display", visible ? this.getDisplayValue("afterIcon") : "none");
			}
			
			if(this.moveHandle){
				visible = this._isElementVisible("moveHandle", startHidden, endHidden, size);
				domStyle.set(this.moveHandle, "display", visible?this.getDisplayValue("moveHandle"):"none");				
			}
			
			if(this.resizeStartHandle){
				visible = this._isElementVisible("resizeStartHandle", startHidden, endHidden, size);
				domStyle.set(this.resizeStartHandle, "display", visible?this.getDisplayValue("resizeStartHandle"):"none");				
			}
			
			if(this.resizeEndHandle){
				visible = this._isElementVisible("resizeEndHandle", startHidden, endHidden, size);
				domStyle.set(this.resizeEndHandle, "display", visible?this.getDisplayValue("resizeEndHandle"):"none");				
			}
			
			if(this.startTimeLabel) {
				visible = this._isElementVisible("startTimeLabel", startHidden, endHidden, size);
				
				domStyle.set(this.startTimeLabel, "display", visible?this.getDisplayValue("startTimeLabel"):"none");
				if(visible) {
					this._setText(this.startTimeLabel, this._formatTime(rd, this.item.startTime));
				}
			}
			
			if(this.endTimeLabel) {
				visible = this._isElementVisible("endTimeLabel", startHidden, endHidden, size);
				domStyle.set(this.endTimeLabel, "display", visible?this.getDisplayValue("endTimeLabel"):"none");
				if(visible) {
					this._setText(this.endTimeLabel, this._formatTime(rd, this.item.endTime));
				}
			}
			
			if(this.summaryLabel) {
				visible = this._isElementVisible("summaryLabel", startHidden, endHidden, size);
				domStyle.set(this.summaryLabel, "display", visible?this.getDisplayValue("summaryLabel"):"none");
				if(visible){
					this._setText(this.summaryLabel, this.item.summary, true);
				}
			}
		}
	});
});

},
'dojox/calendar/MonthColumnView':function(){
require({cache:{
'url:dojox/calendar/templates/MonthColumnView.html':"<div data-dojo-attach-events=\"keydown:_onKeyDown\">\t\t\n\t<div data-dojo-attach-point=\"columnHeader\" class=\"dojoxCalendarColumnHeader\">\n\t\t<table data-dojo-attach-point=\"columnHeaderTable\" class=\"dojoxCalendarColumnHeaderTable\" cellpadding=\"0\" cellspacing=\"0\"></table>\n\t</div>\t\n\t<div data-dojo-attach-point=\"vScrollBar\" class=\"dojoxCalendarVScrollBar\">\n\t\t<div data-dojo-attach-point=\"vScrollBarContent\" style=\"visibility:hidden;position:relative; width:1px; height:1px;\" ></div>\n\t</div>\t\n\t<div data-dojo-attach-point=\"scrollContainer\" class=\"dojoxCalendarScrollContainer\">\n\t\t<div data-dojo-attach-point=\"sheetContainer\" style=\"position:relative;left:0;right:0;margin:0;padding:0\">\t\t\t\n\t\t\t<div data-dojo-attach-point=\"grid\" class=\"dojoxCalendarGrid\">\n\t\t\t\t<table data-dojo-attach-point=\"gridTable\" class=\"dojoxCalendarGridTable\" cellpadding=\"0\" cellspacing=\"0\" style=\"width:100%\"></table>\n\t\t\t</div>\n\t\t\t<div data-dojo-attach-point=\"itemContainer\" class=\"dojoxCalendarContainer\" data-dojo-attach-event=\"mousedown:_onGridMouseDown,mouseup:_onGridMouseUp,ondblclick:_onGridDoubleClick,touchstart:_onGridTouchStart,touchmove:_onGridTouchMove,touchend:_onGridTouchEnd\">\n\t\t\t\t<table data-dojo-attach-point=\"itemContainerTable\" class=\"dojoxCalendarContainerTable\" cellpadding=\"0\" cellspacing=\"0\" style=\"width:100%\"></table>\n\t\t\t</div>\n\t\t</div> \n\t</div>\t\n</div>\n"}});
define("dojox/calendar/MonthColumnView", [
"./ViewBase", 
"dijit/_TemplatedMixin", 
"./_VerticalScrollBarBase", 
"dojo/text!./templates/MonthColumnView.html",
"dojo/_base/declare", 
"dojo/_base/event", 
"dojo/_base/lang", 
"dojo/_base/array",
"dojo/_base/sniff",
"dojo/_base/fx", 
"dojo/_base/html",
"dojo/on",
"dojo/dom", 
"dojo/dom-class", 
"dojo/dom-style", 
"dojo/dom-geometry", 
"dojo/dom-construct", 
"dojo/mouse",
"dojo/query", 
"dojo/i18n",
"dojox/html/metrics"],

function(
	ViewBase, 
	_TemplatedMixin, 
	_VerticalScrollBarBase, 
	template, 
	declare, 
	event, 
	lang, 
	arr, 
	has,
	fx, 
	html,
	on,
	dom, 
	domClass, 
	domStyle,
	domGeometry, 
	domConstruct,
	mouse,
	query, 
	i18n,
	metrics){
	
	/*=====
	var __ColumnClickEventArgs = {
		// summary:
		//		A column click event.
		// index: Integer
		//		The column index. 
		// date: Date
		//		The date displayed by the column.
		// triggerEvent: Event
		//		The origin event.
	};
	=====*/
				
	return declare("dojox.calendar.MonthColumnView", [ViewBase, _TemplatedMixin], {

		// summary:
		//		The month column view is a calendar view used to display a month per column where each cell of the column is a day.

		baseClass: "dojoxCalendarMonthColumnView",
		
		templateString: template,
		
		// viewKind: String
		//		Type of the view. Used by the calendar widget to determine how to configure the view.
		//		This view kind is "columns".
		viewKind: "monthColumns",
		
		// scroll container is the focusable item to enable scrolling using up and down arrows
		_setTabIndexAttr: "domNode",
		
		// renderData: Object
		//		The render data is the object that contains all the properties needed to render the component.
		renderData: null,		
				
		// startDate: Date
		//		The start date of the time interval displayed.
		//		If not set at initialization time, will be set to current day.
		startDate: null,
			
		// columnCount: Integer
		//		The number of column to display (from the startDate).
		columnCount: 6,
		
		// daySize: Integer
		//		The desired size in pixels of an hour on the screen.
		//		Note that the effective size may be different as the time slot size must be an integer.
		daySize: 30,
		
		// showCellLabel: Boolean
		//		Whether display or not the grid cells label (usually the day of month).
		showCellLabel: true,
		
		// showHiddenItems: Boolean
		//		Whether show or not the hidden items.
		//		By default the events that are shorter than a day are not displayed using vertical renderers by this widget.
		//		But the grid cells that contains one or several hidden items display a decoration.
		showHiddenItems: true,
			
		// verticalRenderer: Class
		//		The class use to create vertical renderers.
		verticalRenderer: null,
		
		// percentOverlap: Integer
		//		The percentage of the renderer width used to superimpose one item renderer on another 
		//		when two events are overlapping.
		percentOverlap: 0,
				
		// horizontalGap: Integer
		//		The number of pixels between two item renderers.
		horizontalGap: 4,
		
		// columnHeaderFormatLength: String
		//		Length of the column labels. Valid values are "wide" or "abbr".
		columnHeaderFormatLength: null,
		
		// gridCellDatePattern: String
		//		The date pattern of the cell labels. By default a custom function is used to compute the label.
		gridCellDatePattern: null,
		
		// roundToDay: [private] Boolean
		roundToDay: true,
		
		// _layoutUnit: String
		//		Unit of layout: each column is displaying a month. 
		_layoutUnit: "month",
		
		_columnHeaderHandlers: null,
		
		constructor: function(){
			this.invalidatingProperties = ["columnCount", "startDate", "daySize", "percentOverlap", "verticalRenderer",
				"columnHeaderDatePattern", "horizontalGap", "scrollBarRTLPosition", "itemToRendererKindFunc", 
				"layoutPriorityFunction", "textDir", "items", "showCellLabel", "showHiddenItems"];
			this._columnHeaderHandlers = [];
		},
		
		postCreate: function(){
			this.inherited(arguments);
			this.keyboardUpDownUnit = "day";	
			this.keyboardUpDownSteps =  1;			
			this.keyboardLeftRightUnit = "month";			
			this.keyboardLeftRightSteps = 1;
			this.allDayKeyboardUpDownUnit = "day";			
			this.allDayKeyboardUpDownSteps = 1;	
			this.allDayKeyboardLeftRightUnit = "month";			
			this.allDayKeyboardLeftRightSteps = 1;
		},
		
		destroy: function(preserveDom){
			this._cleanupColumnHeader();
			if(this.scrollBar){
				this.scrollBar.destroy(preserveDom);
			}
			this.inherited(arguments);
		},
		
		_scrollBar_onScroll: function(value){
			// tags:
			//		private
			this.scrollContainer.scrollTop = value;
		},
		
		buildRendering: function(){
			// tags:
			//		private
			this.inherited(arguments);
			if(this.vScrollBar){
				this.scrollBar = new _VerticalScrollBarBase(
					{content: this.vScrollBarContent}, 
					this.vScrollBar);
					
				this.scrollBar.on("scroll", lang.hitch(this, this._scrollBar_onScroll));
				this._viewHandles.push(
					on(this.scrollContainer, mouse.wheel,  
						dojo.hitch(this, this._mouseWheelScrollHander)));
			}
		},
		
		postscript: function(){
			this.inherited(arguments);
			this._initialized = true;
			if(!this.invalidRendering){
				this.refreshRendering();
			}
		},
		
		_setVerticalRendererAttr: function(value){
			this._destroyRenderersByKind("vertical");
			this._set("verticalRenderer", value);	
		},
				
		_createRenderData: function(){
			
			var rd = {};
						
			rd.daySize = this.get("daySize");				
			rd.scrollbarWidth = metrics.getScrollbar().w + 1;
					
			rd.dateLocaleModule = this.dateLocaleModule;
			rd.dateClassObj = this.dateClassObj;
			rd.dateModule = this.dateModule; // arithmetics on Dates
			
			rd.dates = [];
						
			rd.columnCount = this.get("columnCount");

			var d = this.get("startDate");
		
			if (d == null){
				d = new rd.dateClassObj();
			}

			d = this.floorToMonth(d, false, rd);
			
			this.startDate = d;
			var currentMonth = d.getMonth();
			var maxDayCount = 0;			
			
			for(var col = 0; col < rd.columnCount ; col++){
				
				var dates = [];
				rd.dates.push(dates);
				
				while(d.getMonth() == currentMonth){							
					dates.push(d);
					d = rd.dateModule.add(d, "day", 1);
					d = this.floorToDay(d, false, rd);					
				}
				
				currentMonth = d.getMonth();
				
				if(maxDayCount < dates.length){
					maxDayCount = dates.length;
				}						
			}
						
			rd.startTime = new rd.dateClassObj(rd.dates[0][0]);			
			rd.endTime = new rd.dateClassObj(dates[dates.length-1]);
			rd.endTime = rd.dateModule.add(rd.endTime, "day", 1);
						
			rd.maxDayCount = maxDayCount;
			rd.sheetHeight = rd.daySize * maxDayCount;
			
			if(this.displayedItemsInvalidated){
				this.displayedItemsInvalidated = false;
				this._computeVisibleItems(rd);
				
				if(this._isEditing){					
					this._endItemEditing(null, false);
				}
				
			}else if (this.renderData){
				rd.items = this.renderData.items;
			}
			
			return rd;
		},
		
		_validateProperties: function() {
			
			this.inherited(arguments);
						
			if (this.columnCount<1 || isNaN(this.columnCount)){
				this.columnCount = 1;				
			}
			
			if(this.daySize<5 || isNaN(this.daySize)){
				this.daySize = 5;
			}
			
		},
		
		_setStartDateAttr: function(value){
			this.displayedItemsInvalidated = true;			
			this._set("startDate", value);
		},
		
		_setColumnCountAttr: function(value){			
			this.displayedItemsInvalidated = true;
			this._set("columnCount", value);
		},
		
		__fixEvt:function(e){
			e.sheet = "primary";
			e.source = this;
			return e;
		},
		
		//////////////////////////////////////////
		//
		// Formatting functions
		//
		//////////////////////////////////////////
		
		_formatColumnHeaderLabel: function(/*Date*/d){			
			// summary:
			//		Computes the column header label for the specified date.
			// d: Date
			//		The date to format
			// tags:
			//		protected
			
			var len = "wide";
			
			if(this.columnHeaderFormatLength){
				len = this.columnHeaderFormatLength
			}
			
			var months = this.renderData.dateLocaleModule.getNames("months", len, "standAlone");
			
			return months[d.getMonth()];
		},
		
		_formatGridCellLabel: function(d, row, col){
			// summary:
			//		Computes the column header label for the specified date.
			//		By default a formatter is used, optionally the <code>gridCellDatePattern</code> 
			//		property can be used to set a custom date pattern to the formatter.
			// d: Date
			//		The date to format.
			// row: Integer
			//		The row that displays the current date.
			// col: Integer
			//		The column that displays the current date.
			// tags:
			//		protected

			var format, rb;
			
			if(d == null){
				return "";
			}
			
			if(this.gridCellPattern){
				return this.renderData.dateLocaleModule.format(d, {
					selector: 'date',
					datePattern: this.gridCellDatePattern
				});
			}else{
				rb = i18n.getLocalization("dojo.cldr", this._calendar);
				format = rb["dateFormatItem-d"];
			
				var days = this.renderData.dateLocaleModule.getNames("days", "abbr", "standAlone");
					
				return days[d.getDay()].substring(0, 1) + " " + this.renderData.dateLocaleModule.format(d, {
					selector: 'date',
					datePattern: format
				});
			}
		},
		
		//////////////////////////////////////////
		//
		// Time of day management
		//
		//////////////////////////////////////////
		
		// scrollPosition: Integer
		//		The scroll position of the view. 
		scrollPosition: null,
				
		// scrollBarRTLPosition: String
		//		Position of the scroll bar in right-to-left display.
		//		Valid values are "left" and "right", default value is "left".
		scrollBarRTLPosition: "left",
					
		_setScrollPositionAttr: function(value){
			this._setScrollPosition(value.date, value.duration, value.easing);
		},
		
		_getScrollPositionAttr: function(){
			return {date: (this.scrollContainer.scrollTop / this.daySize) + 1};
		},
		
		_setScrollPosition: function(date, maxDuration, easing){
			// tags:
			//		private
			
			if(date < 1){
				date = 1
			}else if(date>31){
				date = 31;
			}
			
			var position = (date-1) * this.daySize;
			
			if(maxDuration) {
				
				if(this._scrollAnimation){
					this._scrollAnimation.stop();
				}
				
				var duration = Math.abs(((position - this.scrollContainer.scrollTop) * maxDuration) / this.renderData.sheetHeight);
				
				this._scrollAnimation = new fx.Animation({
					curve: [this.scrollContainer.scrollTop, position],
					duration: duration,
					easing: easing,
					onAnimate: lang.hitch(this, function(position) {
						this._setScrollImpl(position);
					})
				});
								
				this._scrollAnimation.play();

			}else{
				this._setScrollImpl(position);
			}
		},
		
		_setScrollImpl: function(v){
			// tags:
			//		private
			
			this.scrollContainer.scrollTop = v;
			if(this.scrollBar){
				this.scrollBar.set("value", v);
			}
		},
		
		ensureVisibility: function(start, end, visibilityTarget, margin, duration){
			
			// summary:
			//		Scrolls the view if the [start, end] time range is not visible or only partially visible.
			// start: Date
			//		Start time of the range of interest.
			// end: Date
			//		End time of the range of interest.
			// margin: Integer
			//		Margin in minutes around the time range.
			// visibilityTarget: String
			//		The end(s) of the time range to make visible.
			//		Valid values are: "start", "end", "both".	
			// duration: Number
			//		Optional, the maximum duration of the scroll animation.
			
			margin = margin == undefined ? 1 : margin;
			
			if(this.scrollable && this.autoScroll){
							
				var s = start.getDate() - margin; // -1 because day of months starts at 1 and not 0
				if(this.isStartOfDay(end)){
					end = this._waDojoxAddIssue(end, "day", -1);
				}
				var e = end.getDate() + margin;
				
				var viewStart = this.get("scrollPosition").date;
				var r = domGeometry.getContentBox(this.scrollContainer);
				var viewEnd = (this.get("scrollPosition").date + (r.h/this.daySize)); 
				
				var visible = false;
				var target = null;
				
				switch(visibilityTarget){
					case "start":
						visible = s >= viewStart && s <= viewEnd;
						target = s ;
						break;
					case "end":
						visible = e >= viewStart && e <= viewEnd;
						target = e - (viewEnd - viewStart);
						break;
					case "both":
						visible = s >= viewStart && e <= viewEnd;
						target = s;
						break;
				}
				
				if(!visible){
					this._setScrollPosition(target, duration);
				}
			}
		},
		
		scrollView: function(dir){
			// summary:
			//		Scrolls the view to the specified direction of one time slot duration.
			// dir: Integer
			//		Direction of the scroll. Valid values are -1 and 1.
			//
			var pos = this.get("scrollPosition").date + dir;
			this._setScrollPosition(pos);
		},
		
		_mouseWheelScrollHander: function(e){
			// summary:
			//		Mouse wheel handler.
			// tags:
			//		protected
			this.scrollView(e.wheelDelta > 0 ? -1 : 1);
		},		
		
		//////////////////////////////////////////
		//
		// HTML structure management
		//
		//////////////////////////////////////////		
	
		refreshRendering: function(){
			if(!this._initialized){
				return;
			}
						
			this._validateProperties();

			var oldRd = this.renderData;
			var rd = this._createRenderData();
			this.renderData = rd;			
			this._createRendering(rd, oldRd);
			this._layoutRenderers(rd);
		},
		
		_createRendering: function(/*Object*/renderData, /*Object*/oldRenderData){
			// tags:
			//		private
			domStyle.set(this.sheetContainer, "height", renderData.sheetHeight + "px");
			// padding for the scroll bar.
			this._configureScrollBar(renderData);
			this._buildColumnHeader(renderData, oldRenderData);			
			this._buildGrid(renderData, oldRenderData);
			this._buildItemContainer(renderData, oldRenderData);
		},
		
		_configureScrollBar: function(renderData){
			if(has("ie") && this.scrollBar){
				domStyle.set(this.scrollBar.domNode, "width", (renderData.scrollbarWidth + 1) + "px");
			}
						
			var atRight = this.isLeftToRight() ? true : this.scrollBarRTLPosition == "right";
			var rPos = atRight ? "right" : "left";
			var lPos = atRight? "left" : "right";
			
			if(this.scrollBar){
				this.scrollBar.set("maximum", renderData.sheetHeight);			
				domStyle.set(this.scrollBar.domNode, rPos, 0);
				domStyle.set(this.scrollBar.domNode, lPos, "auto");
			}
			domStyle.set(this.scrollContainer, rPos, renderData.scrollbarWidth + "px");
			domStyle.set(this.scrollContainer, lPos, "0");
			domStyle.set(this.columnHeader, rPos, renderData.scrollbarWidth + "px");
			domStyle.set(this.columnHeader, lPos, "0");
			if(this.buttonContainer && this.owner != null && this.owner.currentView == this){
				domStyle.set(this.buttonContainer, rPos, renderData.scrollbarWidth + "px");
				domStyle.set(this.buttonContainer, lPos, "0");
			}
		},
		
		_columnHeaderClick: function(e){
			// tags:
			//		private

			event.stop(e);
			var index = query("td", this.columnHeaderTable).indexOf(e.currentTarget);
			this._onColumnHeaderClick({
				index: index,
				date: this.renderData.dates[index][0],
				triggerEvent: e
			});						
		},
		
		_buildColumnHeader: function(renderData, oldRenderData){				
			// summary:
			//		Creates incrementally the HTML structure of the column header and configures its content.
			//
			// renderData:
			//		The render data to display.
			//
			// oldRenderData:
			//		The previously render data displayed, if any.
			// tags:
			//		private


			var table = this.columnHeaderTable;
			
			if (!table){
				return;
			}
					
			var count = renderData.columnCount - (oldRenderData ? oldRenderData.columnCount : 0);
			
			if(has("ie") == 8){
				// workaround Internet Explorer 8 bug.
				// if on the table, width: 100% and table-layout: fixed are set
				// and columns are removed, width of remaining columns is not 
				// recomputed: must rebuild all. 
				if(this._colTableSave == null){
					this._colTableSave = lang.clone(table);
				}else if(count < 0){
					this._cleanupColumnHeader();
					this.columnHeader.removeChild(table);
					domConstruct.destroy(table);
					table = lang.clone(this._colTableSave);
					this.columnHeaderTable = table;
					this.columnHeader.appendChild(table);
					count = renderData.columnCount;
				}
				
			} // else incremental dom add/remove for real browsers.
					
			var tbodies = query("tbody", table);
			
			var trs = query("tr", table);
			var tbody, tr, td;
			
			if (tbodies.length == 1){
				tbody = tbodies[0];
			}else{ 
				tbody = html.create("tbody", null, table);
			}
			
			if (trs.length == 1){
				tr = trs[0];
			}else{ 
				tr = domConstruct.create("tr", null, tbody);
			}
						 
			// Build HTML structure (incremental)
			if(count > 0){ // creation				
				for(var i=0; i < count; i++){
														
					td = domConstruct.create("td", null, tr);
					
					var h = [];
					h.push(on(td, "click", lang.hitch(this, this._columnHeaderClick)));
										
					if(has("touch")){					
						h.push(on(td, "touchstart", function(e){
							event.stop(e);
							domClass.add(e.currentTarget, "Active");
						}));
						
						h.push(on(td, "touchend", function(e){			
							event.stop(e);			
							domClass.remove(e.currentTarget, "Active");			
						}));
					}else{
						h.push(on(td, "mousedown", function(e){
							event.stop(e);
							domClass.add(e.currentTarget, "Active");
						}));
												
						h.push(on(td, "mouseup", function(e){
							event.stop(e);
							domClass.remove(e.currentTarget, "Active");
						}));					
						
						h.push(on(td, "mouseover", function(e){
							event.stop(e);
							domClass.add(e.currentTarget, "Hover");
						}));
											
						h.push(on(td, "mouseout", function(e){
							event.stop(e);
							domClass.remove(e.currentTarget, "Hover");
						}));
					
					}
					
					this._columnHeaderHandlers.push(h);					 
				}
				
			}else{ // deletion
				count = -count;
				for(var i=0; i < count; i++){
					td = tr.lastChild;
					tr.removeChild(td);
					domConstruct.destroy(td);
					var list = this._columnHeaderHandlers.pop();
					while(list.length>0){
						list.pop().remove();
					}
				}
			}
			
			// fill & configure		
			query("td", table).forEach(function(td, i){
				td.className = "";											
				if(i == 0){
					domClass.add(td, "first-child");
				}else if(i == this.renderData.columnCount-1){
					domClass.add(td, "last-child");
				}
				var d = renderData.dates[i][0];
				this._setText(td, this._formatColumnHeaderLabel(d));
				this.styleColumnHeaderCell(td, d, renderData);						
			}, this);
						
		},
		
		_cleanupColumnHeader: function(){
			// tags:
			//		private

			while(this._columnHeaderHandlers.length > 0){
				var list = this._columnHeaderHandlers.pop();
				while(list.length > 0){
					list.pop().remove();
				}
			}
		},
		
		styleColumnHeaderCell: function(node, date, renderData){
			// summary:
			//		Styles the CSS classes to the node that displays a column header cell.
			//		By default this method is does nothing and is designed to be overridden.
			// node: Node
			//		The DOM node that displays the column in the grid.
			// date: Date
			//		The date displayed by this column
			// renderData: Object			
			//		The render data.			
			// tags:
			//		protected

		},
		
		_buildGrid: function (renderData, oldRenderData){
			// summary:
			//		Creates incrementally the HTML structure of the grid and configures its content.
			//
			// renderData:
			//		The render data to display.
			//
			// oldRenderData:
			//		The previously render data displayed, if any.
			// tags:
			//		private


			var table = this.gridTable;
			
			if(!table){
				return;
			}
			
			domStyle.set(table, "height", renderData.sheetHeight + "px");				

			var rowDiff = renderData.maxDayCount - (oldRenderData ? oldRenderData.maxDayCount : 0);
			var addRows = rowDiff > 0;
			
			var colDiff  = renderData.columnCount - (oldRenderData ? oldRenderData.columnCount : 0);
			
			if(has("ie") == 8){
				// workaround Internet Explorer 8 bug.
				// if on the table, width: 100% and table-layout: fixed are set
				// and columns are removed, width of remaining columns is not 
				// recomputed: must rebuild all. 
				if(this._gridTableSave == null){
					this._gridTableSave = lang.clone(table);
				}else if(colDiff < 0){					
					this.grid.removeChild(table);
					domConstruct.destroy(table);
					table = lang.clone(this._gridTableSave);
					this.gridTable = table;
					this.grid.appendChild(table);
					colDiff = renderData.columnCount;
					rowDiff = renderData.maxDayCount;
					addRows = true;
				}				
			}
			
			var tbodies = query("tbody", table);
			var tbody;

			if(tbodies.length == 1){
				tbody = tbodies[0];
			}else{ 
				tbody = domConstruct.create("tbody", null, table);
			}

			// Build rows HTML structure (incremental)
			if(addRows){ // creation
				for(var i=0; i<rowDiff; i++){
					domConstruct.create("tr", null, tbody);
				}		 
			}else{ // deletion		 
				rowDiff = -rowDiff;
				for(var i=0; i<rowDiff; i++){
					tbody.removeChild(tbody.lastChild);
				}
			}

			var rowIndex = renderData.maxDayCount - rowDiff;
			
			var addCols = addRows || colDiff >0; 
			colDiff = addCols ? colDiff : -colDiff;
			
			query("tr", table).forEach(function(tr, i){
				
				if(addCols){ // creation
					var len = i >= rowIndex ? renderData.columnCount : colDiff;
					for(var i=0; i<len; i++){
						var td = domConstruct.create("td", null, tr);
						domConstruct.create("span", null, td);
					}
				}else{ // deletion
					for(var i=0; i<colDiff; i++){
						tr.removeChild(tr.lastChild);
					}
				}
			});

			// Set the CSS classes

			query("tr", table).forEach(function (tr, row){
				
				//domStyle.set(tr, "height", this._getRowHeight(row) + "px");
				
				tr.className = "";
				// compatibility layer for IE7 & 8 that does not support :first-child and :last-child pseudo selectors
				if(row == 0){
					domClass.add(tr, "first-child");
				}
				if(row == renderData.maxDayCount-1){
					domClass.add(tr, "last-child");
				}

				query("td", tr).forEach(function (td, col){
					
					td.className = "";
					
					if(col == 0){
						domClass.add(td, "first-child");
					}
					
					if(col == renderData.columnCount-1){
						domClass.add(td, "last-child");
					}
					
					var d = null;
					if(row < renderData.dates[col].length) {
						d = renderData.dates[col][row];
					}
					
					var span = query("span", td)[0];
					this._setText(span, this.showCellLabel ? this._formatGridCellLabel(d, row, col): null);
					
					this.styleGridCell(td, d, col, row, renderData);
					
				}, this);
			}, this); 

		},
		
		styleGridCell: function(node, date, col, row, renderData){
			// summary:
			//		Styles the CSS classes to the node that displays a column.
			//		By default this method is setting the "dojoxCalendarToday" class name if the 
			//		date displayed is the current date or "dojoxCalendarWeekend" if the date represents a weekend.
			// node: Node
			//		The DOM node that displays the column in the grid.
			// date: Date
			//		The date displayed by this column
			// renderData: Object
			//		The render data.
			// tags:
			//		protected

			var cal = renderData.dateModule;
			if(date == null){
				return;
			}
			if(this.isToday(date)){				
				domClass.add(node, "dojoxCalendarToday");
			}else if(this.isWeekEnd(date)){
				domClass.add(node, "dojoxCalendarWeekend");
			}					
		},
							
		_buildItemContainer: function(renderData, oldRenderData){
			// summary:
			//		Creates the HTML structure of the item container and configures its content.
			// renderData:
			//		The render data to display.
			// oldRenderData:
			//		The previously render data displayed, if any.
			// tags:
			//		private

			
			var table = this.itemContainerTable;
			
			if (!table){
				return;
			}
			
			var bgCols = [];
	
			domStyle.set(table, "height", renderData.sheetHeight + "px");			
			
			var count = renderData.columnCount - (oldRenderData ? oldRenderData.columnCount : 0);
			
			if(has("ie") == 8){
				// workaround Internet Explorer 8 bug.
				// if on the table, width: 100% and table-layout: fixed are set
				// and columns are removed, width of remaining columns is not 
				// recomputed: must rebuild all. 
				if(this._itemTableSave == null){
					this._itemTableSave = lang.clone(table);
				}else if(count < 0){
					this.itemContainer.removeChild(table);
					this._recycleItemRenderers(true);
					domConstruct.destroy(table);
					table = lang.clone(this._itemTableSave);
					this.itemContainerTable = table;
					this.itemContainer.appendChild(table);
					count = renderData.columnCount;
				}
				
			} // else incremental dom add/remove for real browsers.
			
			var tbodies = query("tbody", table);
			var trs = query("tr", table);
			var tbody, tr, td;
			
			if (tbodies.length == 1){
				tbody = tbodies[0];
			}else{ 
				tbody = domConstruct.create("tbody", null, table);
			}
			
			if (trs.length == 1){
				tr = trs[0];
			}else{ 
				tr = domConstruct.create("tr", null, tbody);
			}					
								
			// Build HTML structure (incremental)
			if(count>0){ // creation
				for(var i=0; i < count; i++){
					td = domConstruct.create("td", null, tr);	
					domConstruct.create("div", {"className": "dojoxCalendarContainerColumn"}, td);
				}
			}else{ // deletion		 
				count = -count;
				for(var i=0; i < count; i++){
					tr.removeChild(tr.lastChild);
				}
			}	
			
			query("td>div", table).forEach(function(div, i){

				domStyle.set(div, {
					"height": renderData.sheetHeight + "px"
				});
				bgCols.push(div);		
			}, this);
			
			renderData.cells = bgCols;
		},			
		
		///////////////////////////////////////////////////////////////
		//
		// Layout
		//
		///////////////////////////////////////////////////////////////
		
		_overlapLayoutPass2: function(lanes){
			// summary:
			//		Second pass of the overlap layout (optional). Compute the extent of each layout item.
			// lanes:
			//		The array of lanes.
			// tags:
			//		private
			var i,j,lane, layoutItem;
			// last lane, no extent possible
			lane = lanes[lanes.length-1];
			
			for(j = 0; j < lane.length; j++){
				lane[j].extent = 1;
			}
						
			for(i=0; i<lanes.length-1; i++){
				lane = lanes[i];
				
				for(var j=0; j<lane.length; j++){	 
					layoutItem = lane[j];
					
					// if item was already overlapping another one there is no extent possible.
					if(layoutItem.extent == -1){
						layoutItem.extent = 1;
						var space = 0;
						
						var stop = false;
						
						for(var k = i + 1; k < lanes.length && !stop; k++){
							var ccol = lanes[k];
							for(var l = 0; l < ccol.length && !stop; l++){
								var layoutItem2 = ccol[l];
								
								if(layoutItem.start < layoutItem2.end && layoutItem2.start < layoutItem.end){
									stop = true;
								}
							}
							if(!stop){
								//no hit in the entire lane
								space++;
							}
						}
						layoutItem.extent += space;
					}
				}
			}
		},
		
		_defaultItemToRendererKindFunc: function(item){
			// tags:
			//		private

			if(item.allDay){
				return "vertical";
			}
			var dur = Math.abs(this.renderData.dateModule.difference(item.startTime, item.endTime, "minute"));
			return dur >= 1440 ? "vertical" : null;
		},
		
		_layoutRenderers: function(renderData){
			this.hiddenEvents = {};
			this.inherited(arguments);
		},
		
		_layoutInterval: function(/*Object*/renderData, /*Integer*/index, /*Date*/start, /*Date*/end, /*Object[]*/items){
			// tags:
			//		private

			var verticalItems = [];
			var hiddenItems = [];
			renderData.colW = this.itemContainer.offsetWidth / renderData.columnCount;
			
			for(var i=0; i<items.length; i++){
				var item = items[i];
				if(this._itemToRendererKind(item) == "vertical"){
					verticalItems.push(item);
				}else if(this.showHiddenItems){	
					hiddenItems.push(item);					
				}
			}
			
			if(verticalItems.length > 0){
				this._layoutVerticalItems(renderData, index, start, end, verticalItems);
			}
			if(hiddenItems.length > 0){
				this._layoutBgItems(renderData, index, start, end, hiddenItems);
			}
		},
		
		_dateToYCoordinate: function(renderData, d, start){
			// tags:
			//		private

			var pos = 0;
			if(start){
				pos = (d.getDate()-1) * this.renderData.daySize;
			}else{
				var d2 = this._waDojoxAddIssue(d, "day", -1);
				pos = this.renderData.daySize + ((d2.getDate()-1) * this.renderData.daySize);
			}			 
			pos += (d.getHours()*60+d.getMinutes())*this.renderData.daySize/1440;
			
			return pos;
		},
		
		_layoutVerticalItems: function(/*Object*/renderData, /*Integer*/index, /*Date*/startTime, /*Date*/endTime, /*Object[]*/items){
			// tags:
			//		private

			if(this.verticalRenderer == null){
				return;
			}
			
			var cell = renderData.cells[index];
			var layoutItems = [];			
			
			// step 1 compute projected position and size
			for(var i = 0; i < items.length; i++){
				
				var item = items[i];
				var overlap = this.computeRangeOverlap(renderData, item.startTime, item.endTime, startTime, endTime);
				
				var top = this._dateToYCoordinate(renderData, overlap[0], true);
				var bottom = this._dateToYCoordinate(renderData, overlap[1], false);
				
				if (bottom > top){
					var litem = lang.mixin({
						start: top,
						end: bottom,
						range: overlap,
						item: item
					}, item);
					layoutItems.push(litem);
				}
			}
			
			// step 2: compute overlapping layout
			var numLanes = this.computeOverlapping(layoutItems, this._overlapLayoutPass2).numLanes;

			var hOverlap = this.percentOverlap / 100;

			// step 3: create renderers and apply layout
			for(i=0; i<layoutItems.length; i++){

				item = layoutItems[i];					
				var lane = item.lane;
				var extent = item.extent;

				var w;
				var posX;				

				if(hOverlap == 0) {
					//no overlap and a padding between each event
					w = numLanes == 1 ? renderData.colW : ((renderData.colW - (numLanes - 1) * this.horizontalGap)/ numLanes);
					posX = lane * (w + this.horizontalGap);
					w = extent == 1 ? w : w * extent + (extent-1) * this.horizontalGap;
					w = 100 * w / renderData.colW;
					posX = 100 * posX / renderData.colW; 
				} else {
					// an overlap
					w = numLanes == 1 ? 100 : (100 / (numLanes - (numLanes - 1) * hOverlap));
					posX = lane * (w - hOverlap*w);
					w = extent == 1 ? w : w * ( extent - (extent-1) * hOverlap);
				}

				var ir = this._createRenderer(item, "vertical", this.verticalRenderer, "dojoxCalendarVertical");

				domStyle.set(ir.container, {
					"top": item.start + "px",
					"left": posX + "%",
					"width": w + "%",
					"height": (item.end-item.start+1) + "px"
				});

				var edited = this.isItemBeingEdited(item);
				var selected = this.isItemSelected(item);
				var hovered = this.isItemHovered(item);
				var focused = this.isItemFocused(item);

				var renderer = ir.renderer;

				renderer.set("hovered", hovered);
				renderer.set("selected", selected);
				renderer.set("edited", edited);
				renderer.set("focused", this.showFocus ? focused : false);
				renderer.set("moveEnabled", this.isItemMoveEnabled(item, "vertical"));
				renderer.set("resizeEnabled", this.isItemResizeEnabled(item, "vertical"));

				this.applyRendererZIndex(item, ir, hovered, selected, edited, focused);

				if(renderer.updateRendering){
					renderer.updateRendering(w, item.end-item.start+1);
				}

				domConstruct.place(ir.container, cell);
				domStyle.set(ir.container, "display", "block");
			}
		},
		
		_getCellAt: function(rowIndex, columnIndex, rtl){
			// tags:
			//		private

			if((rtl == undefined || rtl == true) && !this.isLeftToRight()){
				columnIndex = this.renderData.columnCount -1 - columnIndex;
			}
			return this.gridTable.childNodes[0].childNodes[rowIndex].childNodes[columnIndex];
		},
		
		invalidateLayout: function(){
			//make sure to clear hiddens object state
			query("td", this.gridTable).forEach(function(td){
				domClass.remove(td, "dojoxCalendarHiddenEvents");
			});
			this.inherited(arguments);			
		},
		
		_layoutBgItems: function(/*Object*/renderData, /*Integer*/col, /*Date*/startTime, /*Date*/endTime, /*Object[]*/items){
			// tags:
			//		private

			var bgItems = {};
			for(var i = 0; i < items.length; i++){
				
				var item = items[i];
				var overlap = this.computeRangeOverlap(renderData, item.startTime, item.endTime, startTime, endTime);
				var start = overlap[0].getDate()-1;
				// handle use case where end time is first day of next month.
				var end;
				if(this.isStartOfDay(overlap[1])){
					end = this._waDojoxAddIssue(overlap[1], "day", -1);
					end = end.getDate()-1;
				}else{
					end = overlap[1].getDate()-1;
				}
				
				for (var d=start; d<=end; d++){
					bgItems[d] = true;
				}
			}					
	
			for(var row in bgItems) {
				if(bgItems[row]){
					var node = this._getCellAt(row, col, false);
					domClass.add(node, "dojoxCalendarHiddenEvents");
				}
			}			
		},
		
		_sortItemsFunction: function(a, b){
			// tags:
			//		private

			var res = this.dateModule.compare(a.startTime, b.startTime);
			if(res == 0){
				res = -1 * this.dateModule.compare(a.endTime, b.endTime);
			}
			return this.isLeftToRight() ? res : -res;
		},
		
		///////////////////////////////////////////////////////////////
		//
		// View to time projection
		//
		///////////////////////////////////////////////////////////////
		
		getTime: function(e, x, y, touchIndex){
			// summary:
			//		Returns the time displayed at the specified point by this component.
			// e: Event
			//		Optional mouse event.
			// x: Number
			//		Position along the x-axis with respect to the sheet container used if event is not defined.
			// y: Number
			//		Position along the y-axis with respect to the sheet container (scroll included) used if event is not defined.
			// touchIndex: Integer
			//		If parameter 'e' is not null and a touch event, the index of the touch to use.
			// returns: Date
			
			if (e != null){				
				var refPos = domGeometry.position(this.itemContainer, true);
				
				if(e.touches){									
					
					touchIndex = touchIndex==undefined ? 0 : touchIndex;
									
					x = e.touches[touchIndex].pageX - refPos.x;
					y = e.touches[touchIndex].pageY - refPos.y;									
					
				}else{
					
					x = e.pageX - refPos.x;					
					y = e.pageY - refPos.y;					
				}
			}
			
			var r = domGeometry.getContentBox(this.itemContainer);
			
			if(!this.isLeftToRight()){
				x = r.w - x;
			}
			
			if (x < 0){
				x = 0;
			}else if(x > r.w){
				x = r.w-1;
			}
			
			if (y < 0){
				y = 0;
			}else if(y > r.h){
				y = r.h-1;
			}
			
			var col = Math.floor(x / (r.w / this.renderData.columnCount));
			var row = Math.floor(y / (r.h / this.renderData.maxDayCount));
			
			var date = null;
			if(col < this.renderData.dates.length && 
				 row < this.renderData.dates[col].length){			
				date = this.newDate(this.renderData.dates[col][row]); 			
			}
	
			return date;
		},
		
		///////////////////////////////////////////////////////////////
		//
		// Events
		//
		///////////////////////////////////////////////////////////////
		
		_onGridMouseUp: function(e){
			
			// tags:
			//		private

			
			this.inherited(arguments);
			
			if (this._gridMouseDown) {
				this._gridMouseDown = false;
				
				this._onGridClick({
					date: this.getTime(e),
					triggerEvent: e
				});
			}			
		},			
			
		_onGridTouchStart: function(e){
			// tags:
			//		private

			
			this.inherited(arguments);			
			
			var g = this._gridProps;						

			g.moved= false;
			g.start= e.touches[0].screenY;
			g.scrollTop= this.scrollContainer.scrollTop;
		},
		
		_onGridTouchMove: function(e){
			// tags:
			//		private

			this.inherited(arguments);						
			
			if (e.touches.length > 1 && !this._isEditing){
				event.stop(e);				
				return;
			}			
			
			if(this._gridProps && !this._isEditing){
				
				var touch = {x: e.touches[0].screenX, y: e.touches[0].screenY};
				
				var p = this._edProps;
				
				if (!p || p && 
					(Math.abs(touch.x - p.start.x) > 25 || 
					 Math.abs(touch.y - p.start.y) > 25)) {
																		
					this._gridProps.moved = true;
					var d = e.touches[0].screenY - this._gridProps.start; 
					var value = this._gridProps.scrollTop - d;
					var max = this.itemContainer.offsetHeight - this.scrollContainer.offsetHeight;
					if (value < 0){
						this._gridProps.start = e.touches[0].screenY;
						this._setScrollImpl(0);
						this._gridProps.scrollTop = 0;
					}else if(value > max){
						this._gridProps.start = e.touches[0].screenY;
						this._setScrollImpl(max);
						this._gridProps.scrollTop = max;
					}else{
						this._setScrollImpl(value);
					}
				}
			}
		},
		
		_onGridTouchEnd: function(e){
			// tags:
			//		private

			//event.stop(e);
								
			this.inherited(arguments);
									
			var g = this._gridProps;					
			
			if(g){
				if(!this._isEditing){
					if(!g.moved){
						
						// touched on grid and on touch start editing was ongoing.
						if(!g.fromItem && !g.editingOnStart){								
							this.selectFromEvent(e, null, null, true);
						}			
						
						if(!g.fromItem){
						
							if(this._pendingDoubleTap && this._pendingDoubleTap.grid){
															
								this._onGridDoubleClick({
									date: this.getTime(this._gridProps.event),
									triggerEvent: this._gridProps.event
								});
								
								clearTimeout(this._pendingDoubleTap.timer);
						
								delete this._pendingDoubleTap;
								
							}else{
															
								this._onGridClick({
									date: this.getTime(this._gridProps.event),
									triggerEvent: this._gridProps.event
								});
								
								this._pendingDoubleTap = {
									grid: true,
									timer: setTimeout(lang.hitch(this, function(){
											delete this._pendingDoubleTap;
									}), this.doubleTapDelay)
								};
							}
						}	
					}
				}
				
				this._gridProps = null;
			}
		},
		
		_onColumnHeaderClick: function(e){
			// tags:
			//		private

			this._dispatchCalendarEvt(e, "onColumnHeaderClick");
		},
		
		onColumnHeaderClick: function(e){
			// summary:
			//		Event dispatched when a column header cell is dispatched.
			// e: __ColumnClickEventArgs
			// tags:
			//		callback

		},
		

		///////////////////////////////////////////////////////////////
		//
		// View limits
		//
		///////////////////////////////////////////////////////////////
						
		_onScrollTimer_tick: function(){
			// tags:
			//		private

			this._setScrollImpl(this.scrollContainer.scrollTop + this._scrollProps.scrollStep);
		},
		
		////////////////////////////////////////////
		//
		// Editing
		//
		///////////////////////////////////////////						
		
		snapUnit: "day",
		snapSteps: 1,
		minDurationUnit: "day",
		minDurationSteps: 1,
		liveLayout: false,
		stayInView: true,
		allowStartEndSwap: true,
		allowResizeLessThan24H: false
		
	});
});

},
'url:dojox/calendar/templates/Calendar.html':"<div>\n\t<div data-dojo-attach-point=\"buttonContainer\" class=\"buttonContainer\">\n\t\t<div data-dojo-attach-point=\"toolbar\" data-dojo-type=\"dijit.Toolbar\" >\n\t\t\t<button data-dojo-attach-point=\"previousButton\" data-dojo-type=\"dijit.form.Button\" >◄</button>\n\t\t\t<button data-dojo-attach-point=\"nextButton\" data-dojo-type=\"dijit.form.Button\" >►</button>\n\t\t\t<span data-dojo-type=\"dijit.ToolbarSeparator\"></span>\n\t\t\t<button data-dojo-attach-point=\"todayButton\" data-dojo-type=\"dijit.form.Button\" />Today</button>\n\t\t\t<span data-dojo-type=\"dijit.ToolbarSeparator\"></span>\n\t\t\t<button data-dojo-attach-point=\"dayButton\" data-dojo-type=\"dijit.form.Button\" >Day</button>\n\t\t\t<button data-dojo-attach-point=\"fourDaysButton\" data-dojo-type=\"dijit.form.Button\" >4 Days</button>\n\t\t\t<button data-dojo-attach-point=\"weekButton\" data-dojo-type=\"dijit.form.Button\" >Week</button>\t\t\t\n\t\t\t<button data-dojo-attach-point=\"monthButton\" data-dojo-type=\"dijit.form.Button\" >Month</button>\n\t\t</div>\n\t</div>\n\t<div data-dojo-attach-point=\"viewContainer\" class=\"viewContainer\"></div>\n</div>\n",
'dojox/calendar/MobileVerticalRenderer':function(){
require({cache:{
'url:dojox/calendar/templates/MobileVerticalRenderer.html':"<div class=\"dojoxCalendarEvent dojoxCalendarVertical\">\n\t<div class=\"bg\"></div>\t\n\t<div data-dojo-attach-point=\"resizeStartHandle\" class=\"resizeStartHandle resizeHandle\"><div></div></div>\n\t<dl style=\"width:100%;\">\t\t\t\t\n\t\t<dd data-dojo-attach-point=\"beforeIcon\" class=\"beforeIcon\">▲</dd>\n\t\t<dd data-dojo-attach-point=\"startTimeLabel\" class=\"startTime\"></dd>\n\t\t<dd data-dojo-attach-point=\"summaryLabel\" class=\"summary\"></dd>\n\t</dl>\n\t<span data-dojo-attach-point=\"afterIcon\" class=\"afterIcon\">▼</span>\t\n\t<div data-dojo-attach-point=\"resizeEndHandle\" class=\"resizeEndHandle resizeHandle\"><div></div></div>\n\t<span data-dojo-attach-point=\"endTimeLabel\" class=\"endTime\"></span>\n</div>\n"}});
define("dojox/calendar/MobileVerticalRenderer", ["dojo/_base/declare", "dijit/_WidgetBase", "dijit/_TemplatedMixin", 
	"dojox/calendar/_RendererMixin", "dojo/text!./templates/MobileVerticalRenderer.html"],
	 
	function(declare, _WidgetBase, _TemplatedMixin, _RendererMixin, template){
	
	return declare("dojox.calendar.MobileVerticalRenderer", [_WidgetBase, _TemplatedMixin, _RendererMixin], {
				
		// summary:
		//		The mobile specific item vertical renderer.
		
		templateString: template,
		mobile: true,
		
		visibilityLimits: {
			resizeStartHandle: 75,
			resizeEndHandle: -1,
			summaryLabel: 55,			
			startTimeLabel: 75,
			endTimeLabel: 20
		},		
		
		postCreate: function() {
			this.inherited(arguments);
			this._applyAttributes();
		},
		
		_isElementVisible: function(elt, startHidden, endHidden, size){
			var d;
			
			switch(elt){
				case "startTimeLabel":
					d = this.item.startTime;
					if(this.item.allDay || this.owner.isStartOfDay(d)){
						return false;
					}
					break;
				case "endTimeLabel":
					d = this.item.endTime;
					if(this.item.allDay || this.owner.isStartOfDay(d)){
						return false;
					}
					break;
			}
			return this.inherited(arguments);
		}
	});
});

},
'dojox/calendar/Mouse':function(){
define("dojox/calendar/Mouse", [
	"dojo/_base/array", 
	"dojo/_base/declare",
	"dojo/_base/event",
	"dojo/_base/lang",
	"dojo/_base/window", 
	"dojo/dom-geometry",
	"dojo/mouse",
	"dojo/on", 	
	"dojo/keys"],
	
function(
	arr, 	
	declare,
	event,
	lang, 	
	win, 
	domGeometry,
	mouse,
	on, 	
	keys){
	
	/*=====
	var __ItemMouseEventArgs = {
		// summary:
		//		The event dispatched when an item is clicked, double-clicked or context-clicked.
		// item: Object
		//		The item clicked.
		// renderer: dojox/calendar/_RendererMixin
		//		The item renderer clicked.
		// triggerEvent: Event
		//		The event at the origin of this event.
	};
	=====*/
			
	return declare("dojox.calendar.Mouse", null, {

		// summary:
		//		This plugin is managing the mouse interactions on item renderers displayed by a calendar view.		
				
		// triggerExtent: Number
		//		The distance in pixels along the vertical or horizontal axis to cover with the 
		//		mouse button down before triggering the editing gesture.
		triggerExtent: 3,
					
		postMixInProperties: function(){
			this.inherited(arguments);
			
			this.on("rendererCreated", lang.hitch(this, function(ir){
				
				var renderer = ir.renderer;
				
				var h;
				if(!renderer.__handles){
					renderer.__handles = [];
				}
															
				h = on(renderer.domNode, "click", lang.hitch(this, function(e){
					event.stop(e);
					this._onItemClick({
						triggerEvent: e,
						renderer: renderer,
						item: this.renderItemToItem(renderer.item, this.get("store"))
					});
				}));
				renderer.__handles.push(h);
				
				h = on(renderer.domNode, "dblclick", lang.hitch(this, function(e){
					event.stop(e);
					this._onItemDoubleClick({
						triggerEvent: e,
						renderer: renderer,
						item: this.renderItemToItem(renderer.item, this.get("store"))
					});
				}));
				renderer.__handles.push(h);
				
				h = on(renderer.domNode, "contextmenu", lang.hitch(this, function(e){
					this._onItemContextMenu({
						triggerEvent: e,
						renderer: renderer,
						item: this.renderItemToItem(renderer.item, this.get("store"))
					});
				}));
				renderer.__handles.push(h);
				
				if(renderer.resizeStartHandle){
					h = on(renderer.resizeStartHandle, "mousedown", lang.hitch(this, function(e){
						this._onRendererHandleMouseDown(e, renderer, "resizeStart");
					}));
					renderer.__handles.push(h);
				}
				
				if(renderer.moveHandle){
					h = on(renderer.moveHandle, "mousedown", lang.hitch(this, function(e){
						this._onRendererHandleMouseDown(e, renderer, "move");
					}));
					renderer.__handles.push(h);
				}
				
				if(renderer.resizeEndHandle){
					h = on(renderer.resizeEndHandle, "mousedown", lang.hitch(this, function(e){
						this._onRendererHandleMouseDown(e, renderer, "resizeEnd");
					}));
					renderer.__handles.push(h);
				}				
				
				h = on(renderer.domNode, "mousedown", lang.hitch(this, function(e){
					this._rendererMouseDownHandler(e, renderer);
				}));
				renderer.__handles.push(h);
				
				h = on(ir.container, mouse.enter, lang.hitch(this, function(e){
					if(!renderer.item) return;
					
					if(!this._editingGesture){
						this._setHoveredItem(renderer.item.item, ir.renderer);
						this._onItemRollOver(this.__fixEvt({
							item: this.renderItemToItem(renderer.item, this.get("store")),
							renderer: renderer,
							triggerEvent: e
						}));
					}					
				}));
				renderer.__handles.push(h);
				
				h = on(renderer.domNode, mouse.leave, lang.hitch(this, function(e){
					if(!renderer.item) return;
					if(!this._editingGesture){						
						this._setHoveredItem(null);
						
						this._onItemRollOut(this.__fixEvt({
							item: this.renderItemToItem(renderer.item, this.get("store")),
							renderer: renderer,
							triggerEvent: e
						}));
					}
				}));
				
				renderer.__handles.push(h);
				
			}));			
		},
		
		_onItemRollOver: function(e){
			// tags:
			//		private

			this._dispatchCalendarEvt(e, "onItemRollOver");
		},
		
		onItemRollOver: function(e){
			// summary:
			//		Event dispatched when the mouse cursor in going over an item renderer.
			// e: __ItemMouseEventArgs
			//		The event dispatched when the mouse cursor enters in the item renderer.
			// tags:
			//		callback

		},
		
		_onItemRollOut: function(e){
			// tags:
			//		private

			this._dispatchCalendarEvt(e, "onItemRollOut");
		},
		
		onItemRollOut: function(e){
			// summary:
			//		Event dispatched when the mouse cursor in leaving an item renderer.
			// e: __ItemMouseEventArgs
			//		The event dispatched when the mouse cursor enters in the item renderer.
			// tags:
			//		protected

		},
		
		_rendererMouseDownHandler: function(e, renderer){
			
			// summary:
			//		Callback if the user clicked on the item renderer but not on a handle.
			//		Manages item selection.
			// tags:
			//		private

			event.stop(e);				
			
			var item = this.renderItemToItem(renderer.item, this.get("store"));
			
			this.selectFromEvent(e, item, renderer, true);
			
			if(this._setTabIndexAttr){
				this[this._setTabIndexAttr].focus();
			}
		},
		
		_onRendererHandleMouseDown: function(e, renderer, editKind){
			// summary:
			//		Callback if the user clicked on a handle of an item renderer.
			//		Manages item selection and editing gesture. If editing is not allowed, 
			//		resize handles are not displayed and so this callback will never be called.
			//		In that case selected is managed by the _rendererMouseDownHandler function.
			// tags:
			//		private

			
			event.stop(e);				
			
			this.showFocus = false;
			
			// save item here as calling endItemEditing may call a relayout and changes the item.
			var ritem = renderer.item;
			var item = ritem.item;
			
			if(!this.isItemBeingEdited(item)){
						
				if(this._isEditing){								
					this._endItemEditing("mouse", false);								
				}
				
				this.selectFromEvent(e, this.renderItemToItem(renderer.item, this.get("store")), renderer, true);
				
				if(this._setTabIndexAttr){
					this[this._setTabIndexAttr].focus();
				}
				
				this._edProps = {
					editKind: editKind,
					editedItem: item,
					rendererKind: renderer.rendererKind,
					tempEditedItem: item,					
					liveLayout: this.liveLayout				
				};
							
				this.set("focusedItem", this._edProps.editedItem);	
			}
																						
			var handles = [];
			handles.push(on(win.doc, "mouseup", lang.hitch(this, this._editingMouseUpHandler)));
			handles.push(on(win.doc, "mousemove", lang.hitch(this, this._editingMouseMoveHandler)));
			
			var p = this._edProps;
			p.handles = handles;
			p.eventSource = "mouse";
			p.editKind = editKind;
			
			this._startPoint = {x: e.screenX, y: e.screenY};												
		},
		
		_editingMouseMoveHandler: function(e){
			// tags:
			//		private

			var p = this._edProps;
					
			if(this._editingGesture){
				
				if(!this._autoScroll(e.pageX, e.pageY, true)){
					this._moveOrResizeItemGesture([this.getTime(e)], "mouse", e);	
				}
											
			}else if(Math.abs(this._startPoint.x - e.screenX) >= this.triggerExtent || // moved enough to trigger editing
							 Math.abs(this._startPoint.y - e.screenY) >= this.triggerExtent){
							 	
				if(!this._isEditing){
					this._startItemEditing(p.editedItem, "mouse");	
				}
				
				p = this._edProps;
								
				this._startItemEditingGesture([this.getTime(e)], p.editKind, "mouse", e);
			}
		},		
		
		_editingMouseUpHandler: function(e){
			// tags:
			//		private
			
			var p = this._edProps;
			
			this._stopAutoScroll();
									
			if(this._isEditing){			
				
				if(this._editingGesture){ // a gesture is ongoing.					
					this._endItemEditingGesture("mouse", e);					
				}
				
				this._endItemEditing("mouse", false);
								
			}else{ // handlers were not removed by endItemEditing
				arr.forEach(p.handles, function(handle){
					handle.remove();
				});
			}
		},
		
		_autoScroll: function(globalX, globalY, isVertical){
			
			if (!this.scrollable || !this.autoScroll) {
				return false;
			}
								
			var scrollerPos = domGeometry.position(this.scrollContainer, true);
			
			var p = isVertical ? globalY - scrollerPos.y : globalX - scrollerPos.x;
			var max = isVertical ? scrollerPos.h : scrollerPos.w;
			
			if (p < 0 || p > max) {
				
				step = Math.floor((p < 0	? p : p - max)/2)/3;
				
				this._startAutoScroll(step);
						
				return true;
				
			} else {
				
				this._stopAutoScroll();				
			}
			return false;
		}							
	});

});

},
'url:dojox/calendar/templates/MobileCalendar.html':"<div>\n\t<div data-dojo-attach-point=\"viewContainer\" class=\"viewContainer\"></div>\n\t<div data-dojo-attach-point=\"buttonContainer\" class=\"buttonContainer\">\n\t\t\t<button data-dojo-attach-point=\"previousButton\" data-dojo-type=\"dojox.mobile.Button\" >◄</button>\n\t\t\t<button data-dojo-attach-point=\"todayButton\" data-dojo-type=\"dojox.mobile.Button\" />Today</button>\n\t\t\t<button data-dojo-attach-point=\"dayButton\" data-dojo-type=\"dojox.mobile.Button\" >Day</button>\n\t\t\t<button data-dojo-attach-point=\"weekButton\" data-dojo-type=\"dojox.mobile.Button\" >Week</button>\t\t\t\n\t\t\t<button data-dojo-attach-point=\"monthButton\" data-dojo-type=\"dojox.mobile.Button\" >Month</button>\n\t\t<button data-dojo-attach-point=\"nextButton\" data-dojo-type=\"dojox.mobile.Button\" >►</button>\n\t</div>\n</div>\n",
'url:dojox/calendar/templates/ColumnView.html':"<div data-dojo-attach-events=\"keydown:_onKeyDown\">\n\t\n\t<div data-dojo-attach-point=\"header\" class=\"dojoxCalendarHeader\">\n\t\t<div class=\"dojoxCalendarYearColumnHeader\" data-dojo-attach-point=\"yearColumnHeader\">\n\t\t\t<table cellspacing=\"0\" cellpadding=\"0\"><tr><td><span data-dojo-attach-point=\"yearColumnHeaderContent\"></span></td></tr></table>\t\t\n\t\t</div>\n\t\t<div data-dojo-attach-point=\"columnHeader\" class=\"dojoxCalendarColumnHeader\">\n\t\t\t<table data-dojo-attach-point=\"columnHeaderTable\" class=\"dojoxCalendarColumnHeaderTable\" cellpadding=\"0\" cellspacing=\"0\"></table>\n\t\t</div>\n\t</div>\n\t\n\t<div data-dojo-attach-point=\"secondarySheetNode\"></div>\n\t\n\t<div data-dojo-attach-point=\"scrollContainer\" class=\"dojoxCalendarScrollContainer\">\n\t\t<div data-dojo-attach-point=\"sheetContainer\" style=\"position:relative;left:0;right:0;margin:0;padding:0\">\n\t\t\t<div data-dojo-attach-point=\"rowHeader\" class=\"dojoxCalendarRowHeader\">\n\t\t\t\t<table data-dojo-attach-point=\"rowHeaderTable\" class=\"dojoxCalendarRowHeaderTable\" cellpadding=\"0\" cellspacing=\"0\"></table>\n\t\t\t</div>\n\t\t\t<div data-dojo-attach-point=\"grid\" class=\"dojoxCalendarGrid\">\n\t\t\t\t<table data-dojo-attach-point=\"gridTable\" class=\"dojoxCalendarGridTable\" cellpadding=\"0\" cellspacing=\"0\" style=\"width:100%\"></table>\n\t\t\t</div>\n\t\t\t<div data-dojo-attach-point=\"itemContainer\" class=\"dojoxCalendarContainer\" data-dojo-attach-event=\"mousedown:_onGridMouseDown,mouseup:_onGridMouseUp,ondblclick:_onGridDoubleClick,touchstart:_onGridTouchStart,touchmove:_onGridTouchMove,touchend:_onGridTouchEnd\">\n\t\t\t\t<table data-dojo-attach-point=\"itemContainerTable\" class=\"dojoxCalendarContainerTable\" cellpadding=\"0\" cellspacing=\"0\" style=\"width:100%\"></table>\n\t\t\t</div>\n\t\t</div> \n\t</div>\n\t\n\t<div data-dojo-attach-point=\"vScrollBar\" class=\"dojoxCalendarVScrollBar\">\n\t\t<div data-dojo-attach-point=\"vScrollBarContent\" style=\"visibility:hidden;position:relative;width:1px;height:1px;\" ></div>\n\t</div>\n\t\n</div>\n",
'dojox/calendar/CalendarBase':function(){
define("dojox/calendar/CalendarBase", [
"dojo/_base/declare", 
"dojo/_base/sniff", 
"dojo/_base/event", 
"dojo/_base/lang", 
"dojo/_base/array", 
"dojo/cldr/supplemental",
"dojo/dom", 
"dojo/dom-class", 
"dojo/dom-style",
"dojo/dom-construct", 
"dojo/date", 
"dojo/date/locale", 
"dojo/_base/fx", 
"dojo/fx",
"dojo/on", 
"dijit/_WidgetBase", 
"dijit/_TemplatedMixin", 
"dijit/_WidgetsInTemplateMixin", 
"./StoreMixin", 
"dojox/widget/_Invalidating", 
"dojox/widget/Selection", 
"dojox/calendar/time", 
"dojo/i18n!./nls/buttons"],	
function(
declare, 
has, 
event, 
lang, 
arr, 
cldr, 
dom, 
domClass, 
domStyle,
domConstruct, 
date, 
locale,
coreFx,
fx, 
on,  
_WidgetBase, 
_TemplatedMixin, 
_WidgetsInTemplateMixin, 
StoreMixin, 
_Invalidating, 
Selection, 
timeUtil,
_nls){
	
	/*=====
	var __HeaderClickEventArgs = {
		// summary:
		//		A column click event.
		// index: Integer
		//		The column index. 
		// date: Date
		//		The date displayed by the column.
		// triggerEvent: Event
		//		The origin event.
	};
	=====*/
	
	/*=====
	var __TimeIntervalChangeArgs = {
		// summary:
		//		An time interval change event, dispatched when the calendar displayed time range has changed.
		// oldStartTime: Date
		//		The start of the previously displayed time interval, if any. 
		// startTime: Date
		//		The new start of the displayed time interval.
		// oldEndTime: Date
		//		The end of the previously displayed time interval, if any.
		// endTime: Date
		//		The new end of the displayed time interval.
	};
	=====*/
	
	/*=====
	var __GridClickEventArgs = {
		// summary:
		//		The event dispatched when the grid is clicked or double-clicked.
		// date: Date
		//		The start of the previously displayed time interval, if any. 
		// triggerEvent: Event
		//		The event at the origin of this event.
	};
	=====*/
	
	/*=====
	var __ItemMouseEventArgs = {
		// summary:
		//		The event dispatched when an item is clicked, double-clicked or context-clicked.
		// item: Object
		//		The item clicked.
		// renderer: dojox/calendar/_RendererMixin
		//		The item renderer clicked.
		// triggerEvent: Event
		//		The event at the origin of this event.
	};
	=====*/
	
	/*=====
	var __itemEditingEventArgs = {
		// summary:
		//		An item editing event.
		// item: Object
		//		The date item that is being edited.
		// editKind: String
		//		Kind of edit: "resizeBoth", "resizeStart", "resizeEnd" or "move".
		// dates: Date[]
		//		The computed date/time of the during the event editing. One entry per edited date (touch use case).
		// startTime: Date?
		//		The start time of data item.
		// endTime: Date?
		//		The end time of data item.
		// sheet: String
		//		For views with several sheets (columns view for example), the sheet when the event occured.
		// source: dojox/calendar/ViewBase
		//		The view where the event occurred.
		// eventSource: String
		//		The device that triggered the event. This property can take the following values:
		//
		//		- "mouse", 
		//		- "keyboard", 
		//		- "touch"		
		// triggerEvent: Event
		//		The event at the origin of this event.
	};
	=====*/

	return declare("dojox.calendar.CalendarBase", [_WidgetBase, _TemplatedMixin, _WidgetsInTemplateMixin, StoreMixin, _Invalidating, Selection], {
		
		// summary:		
		//		This class defines a generic calendar widget that manages several views to display event in time.
		
		baseClass: "dojoxCalendar",
		
		// datePackage: Object
		//		JavaScript namespace to find Calendar routines. Uses Gregorian Calendar routines at dojo.date by default.
		datePackage: date,
		
		// startDate: Date
		//		The start date of the displayed time interval.
		startDate: null,

		// endDate: Date
		//		The end date of the displayed time interval (included).		
		endDate: null,
		
		// date:Date
		//		The reference date used to determine along with the <code>dateInterval</code> 
		//		and <code>dateIntervalSteps</code> properties the time interval to display.
		date: null,
	
		// dateInterval:String
		//		The date interval used to compute along with the <code>date</code> and 
		//		<code>dateIntervalSteps</code> the time interval to display.
		//		Valid values are "day", "week" (default value) and "month".
		dateInterval: "week",
		
		// dateInterval:Integer
		//		The number of date intervals used to compute along with the <code>date</code> and 
		//		<code>dateInterval</code> the time interval to display.
		//		Default value is 1.		
		dateIntervalSteps: 1,		
		
		// viewContainer: Node
		//		The DOM node that will contains the views.
		viewContainer: null,
		
		// firstDayOfWeek: Integer
		//		(Optional) The first day of week override. By default the first day of week is determined 
		//		for the current locale (extracted from the CLDR).
		//		Special value -1 (default value), means use locale dependent value.
		firstDayOfWeek: -1, 
		
		// formatItemTimeFunc: Function?
		//		Optional function to format the time of day of the item renderers.
		//		The function takes the date and render data object as arguments and returns a String.
		formatItemTimeFunc: null,
		
		// editable: Boolean
		//		A flag that indicates whether or not the user can edit
		//		items in the data provider.
		//		If <code>true</code>, the item renderers in the control are editable.
		//		The user can click on an item renderer, or use the keyboard or touch devices, to move or resize the associated event.
		editable: true,
		
		// moveEnabled: Boolean
		//		A flag that indicates whether the user can move items displayed.
		//		If <code>true</code>, the user can move the items.
		moveEnabled: true,
		
		// resizeEnabled: Boolean
		//		A flag that indicates whether the items can be resized.
		//		If <code>true</code>, the control supports resizing of items.
		resizeEnabled: true,
		
		// columnView: dojox/calendar/ColumnView
		//		The column view is displaying one day to seven days time intervals.
		columnView: null,
		
		// matrixView: dojox/calendar/MatrixView
		//		The column view is displaying time intervals that lasts more than seven days.
		matrixView: null,
		
		// columnViewProps: Object
		//		Map of property/value passed to the constructor of the column view.
		columnViewProps: null,
		
		// matrixViewProps: Object
		//		Map of property/value passed to the constructor of the matrix view.
		matrixViewProps: null,
		
		// createOnGridClick: Boolean
		//		Indicates whether the user can create new event by clicking and dragging the grid.
		//		A createItem function must be defined on the view or the calendar object.
		createOnGridClick: false,
		
		// createItemFunc: Function
		//		A user supplied function that creates a new event.
		//		This function is used when createOnGridClick is set to true and the user is clicking and dragging on the grid.
		//		This view takes two parameters:
		//
		//		- view: the current view,
		//		- d: the date at the clicked location.
		createItemFunc: null,
				
		_currentViewIndex: -1,
		
		views: null,
		
		_calendar: "gregorian",
		
		constructor: function(/*Object*/args){
			this.views = [];
			
			this.invalidatingProperties = ["store", "items", "startDate", "endDate", "views", 
				"date", "dateInterval", "dateIntervalSteps", "firstDayOfWeek"];
			
			args = args || {};
			this._calendar = args.datePackage ? args.datePackage.substr(args.datePackage.lastIndexOf(".")+1) : this._calendar;
			this.dateModule = args.datePackage ? lang.getObject(args.datePackage, false) : date; 
			this.dateClassObj = this.dateModule.Date || Date; 
			this.dateLocaleModule = args.datePackage ? lang.getObject(args.datePackage+".locale", false) : locale; 
						
			this.invalidateRendering();
		},
		
		destroy: function(preserveDom){
			arr.forEach(this._buttonHandles, function(h){
				h.remove();
			});
			this.inherited(arguments);
		},
				
		buildRendering: function(){
			this.inherited(arguments);
			if(this.views == null || this.views.length == 0){
				this.set("views", this._createDefaultViews());	
			}			
		},
		
		_applyAttributes: function(){
			this._applyAttr = true;
			this.inherited(arguments);
			delete this._applyAttr;
		},
		
		////////////////////////////////////////////////////
		//
		// Getter / setters
		//
		////////////////////////////////////////////////////
				
		_setStartDateAttr: function(value){
			this._set("startDate", value);
			this._timeRangeInvalidated = true;
		},
		
		_setEndDateAttr: function(value){
			this._set("endDate", value);
			this._timeRangeInvalidated = true;
		},
		
		_setDateAttr: function(value){
			this._set("date", value);
			this._timeRangeInvalidated = true;
		},
		
		_setDateIntervalAttr: function(value){
			this._set("dateInterval", value);
			this._timeRangeInvalidated = true;
		},
		
		_setDateIntervalStepsAttr: function(value){
			this._set("dateIntervalSteps", value);
			this._timeRangeInvalidated = true;
		},
		
		_setFirstDayOfWeekAttr: function(value){
			this._set("firstDayOfWeek", value);
			if(this.get("date") != null && this.get("dateInterval") == "week"){
				this._timeRangeInvalidated = true;
			}			
		},
		
		_setTextDirAttr: function(value){
			arr.forEach(this.views, function(view){
				view.set("textDir", value);
			});
		},
		
		///////////////////////////////////////////////////
		//
		// Validating
		//
		///////////////////////////////////////////////////
		
		refreshRendering: function(){
			// summary:
			//		Refreshes all the visual rendering of the calendar. 
			// tags:
			//		protected
			this.inherited(arguments);
			this._validateProperties();
		},
		
		_refreshItemsRendering: function(){
			if(this.currentView){
				this.currentView._refreshItemsRendering();
			}
		},
				
		_validateProperties: function(){
			// tags:
			//		private

			var cal = this.dateModule;
			var startDate = this.get("startDate");
			var endDate = this.get("endDate");
			var date = this.get("date");
			
			if(this.firstDayOfWeek < -1 || this.firstDayOfWeek > 6){
				this._set("firstDayOfWeek", 0);
			}
			
			if(date == null && (startDate != null || endDate != null)){
				
				if(startDate == null){
					startDate = new this.dateClassObj();
					this._set("startDate", startDate);
					this._timeRangeInvalidated = true;
				}
				
				if(endDate == null){
					endDate = new this.dateClassObj();
					this._set("endDate", endDate);
					this._timeRangeInvalidated = true;
				}
				
				if(cal.compare(startDate, endDate) >= 0){
					endDate = cal.add(startDate, "day", 1);
					this._set("endDate", endDate);
					this._timeRangeInvalidated = true;
				}
			
			}else{
			
				if(this.date == null){
					this._set("date", new this.dateClassObj());
					this._timeRangeInvalidated = true;
				}
				
				var dint = this.get("dateInterval");
				if(dint != "day" && dint != "week" && dint != "month"){
					this._set("dateInterval", "day");
					this._timeRangeInvalidated = true;
				}
				
				var dis = this.get("dateIntervalSteps");
				if(lang.isString(dis)){
					dis = parseInt(dis);
					this._set("dateIntervalSteps", dis);
				}
				if(dis <= 0) {
					this.set("dateIntervalSteps", 1);
					this._timeRangeInvalidated = true;
				}
			}
			
			if(this._timeRangeInvalidated){
				this._timeRangeInvalidated = false;
				var timeInterval = this.computeTimeInterval();
				
				if(this._timeInterval == null || 
					 cal.compare(this._timeInterval[0], timeInterval[0] != 0) || 
					 cal.compare(this._timeInterval[1], timeInterval[1] != 0)){
					this.onTimeIntervalChange({
						oldStartTime: this._timeInterval == null ? null : this._timeInterval[0],
						oldEndTime: this._timeInterval == null ? null : this._timeInterval[1],
						startTime: timeInterval[0],
						endTime: timeInterval[1]
					});
				}
				
				this._timeInterval = timeInterval;
				
				var duration = this.dateModule.difference(this._timeInterval[0], this._timeInterval[1], "day");
				var view = this._computeCurrentView(timeInterval[0], timeInterval[1], duration);
				
				var index = arr.indexOf(this.views, view);
				
				if(view == null || index == -1){
					return;
				}
				
				if(this.animateRange && (!has("ie") || has("ie")>8) ){
					if(this.currentView){ // there's a view to animate
						var ltr = this.isLeftToRight();
						var inLeft = this._animRangeInDir=="left" || this._animRangeInDir == null; 
						var outLeft = this._animRangeOutDir=="left" || this._animRangeOutDir == null;
						this._animateRange(this.currentView.domNode, outLeft && ltr, false, 0, outLeft ? -100 : 100, 
							lang.hitch(this, function(){
								this.animateRangeTimer = setTimeout(lang.hitch(this, function(){
									this._applyViewChange(view, index, timeInterval, duration);
									this._animateRange(this.currentView.domNode, inLeft && ltr, true, inLeft ? -100 : 100, 0);
									this._animRangeInDir = null;
									this._animRangeOutDir = null;
								}), 100);	// setTimeout give time for layout of view.							
							}));
					}else{
						this._applyViewChange(view, index, timeInterval, duration);						
					}
				}else{					
					this._applyViewChange(view, index, timeInterval, duration);
				}
			}
		},
		
		_applyViewChange: function(view, index, timeInterval, duration){			
			// summary:
			//		Applies the changes of a view time and changes the currently visible view if needed.
			// view: ViewBase
			//		The view that is configured and is or will be shown.
			// index: Integer
			//		The view index in the internal structure.
			// timeInterval: Date[]
			//		The time interval displayed by the calendar.
			// duration: Integer
			//		The duration in days of the time interval.
			// tags:
			//		protected
			
			this._configureView(view, index, timeInterval, duration);
			
			if(index != this._currentViewIndex){
				if(this.currentView == null){
					view.set("items", this.items);
					this.set("currentView", view);			
				}else{					
					if(this.items == null || this.items.length == 0){
						this.set("currentView", view);
						if(this.animateRange && (!has("ie") || has("ie")>8) ){
							domStyle.set(this.currentView.domNode, "opacity", 0);
						}
						view.set("items", this.items);
					}else{
						this.currentView = view;
						view.set("items", this.items);
						this.set("currentView", view);
						if(this.animateRange && (!has("ie") || has("ie")>8) ){
							domStyle.set(this.currentView.domNode, "opacity", 0);
						}
					}																	
				}											
			}
		},
		
		_timeInterval: null,
		
		computeTimeInterval: function(){
			// summary:
			//		Computes the displayed time interval according to the date, dateInterval and 
			//		dateIntervalSteps if date is not null or startDate and endDate properties otherwise.
			// tags:
			//		protected
					
			var cal = this.dateModule;
			var d = this.get("date");
			
			if(d == null){
				return [ this.floorToDay(this.get("startDate")), cal.add(this.get("endDate"), "day", 1) ];
			}else{
				
				var s = this.floorToDay(d);
				var di = this.get("dateInterval");
				var dis = this.get("dateIntervalSteps");
				var e;
				
				switch(di){
					case "day":						
						e = cal.add(s, "day", dis);
						break;
					case "week":
						s = this.floorToWeek(s);
						e = cal.add(s, "week", dis);
						break;
					case "month":
						s.setDate(1);
						e = cal.add(s, "month", dis);						
						break;
				}				
				return [s, e];
			}			
		},
		
		onTimeIntervalChange: function(e){
			// summary:
			//		Event dispatched when the displayed time interval has changed.
			// e: __TimeIntervalChangeArgs
			//		The time interval change event.
			// tags:
			//		callback
		},
		
		/////////////////////////////////////////////////////
		//
		// View Management
		//
		/////////////////////////////////////////////////////
		
		// views: dojox.calendar.ViewBase[]
		//		The views displayed by the widget.
		//		To add/remove only one view, prefer, respectively, the addView() or removeView() methods.
		views: null,
		
		_setViewsAttr: function(views){
			if(!this._applyAttr){
				// 1/ in create() the constructor parameters are mixed in the widget 
				// 2/ in _applyAttributes(), every property with a setter is called.
				// So no need to call on view removed for a non added view.... 
				for(var i=0;i<this.views.length;i++){
					this._onViewRemoved(this.views[i]);
				}
			}
			if(views != null){
				for(var i=0;i<views.length;i++){
					this._onViewAdded(views[i]);
				}			
			}
			this._set("views",  views == null ? [] : views.concat());			
		},
		
		_getViewsAttr: function(){
			return this.views.concat();
		},
		
		_createDefaultViews: function(){
			// summary:
			//		Creates the default views.
			//		This method does nothing and is designed to be overridden.
			// tags:
			//		protected
		},
		
		addView: function(view, index){
			// summary:
			//		Add a view to the calendar's view list.
			// view: dojox/calendar/ViewBase
			//		The view to add to the calendar.
			// index: Integer
			//		Optional, the index where to insert the view in current view list.
			// tags:
			//		protected

			if(index <= 0 || index > this.views.length){
				index = this.views.length;
			}
			this.views.splice(index, view);
			this._onViewAdded(view);
		},
		
		removeView: function(view){
			// summary:
			//		Removes a view from the calendar's view list.
			// view: dojox/calendar/ViewBase
			//		The view to remove from the calendar.
			// tags:
			//		protected

			if(index < 0 || index >=  this.views.length){
				return;
			}
			
			this._onViewRemoved(this.views[index]);
			this.views.splice(index, 1);
		},
		
		_onViewAdded: function(view){
			view.owner = this;
			view.buttonContainer = this.buttonContainer;
			view._calendar = this._calendar;
			view.datePackage = this.datePackage;
			view.dateModule = this.dateModule;
			view.dateClassObj = this.dateClassObj;
			view.dateLocaleModule = this.dateLocaleModule;
			domStyle.set(view.domNode, "display", "none");			
			domClass.add(view.domNode, "view");
			domConstruct.place(view.domNode, this.viewContainer);
			this.onViewAdded(view);
		},
		
		onViewAdded: function(view){
			// summary:
			//		Event dispatched when a view is added from the calendar.
			// view: dojox/calendar/ViewBase
			//		The view that has been added to the calendar.
			// tags:
			//		callback

		},
		
		_onViewRemoved: function(view){
			view.owner = null;
			view.buttonContainer = null;
			domClass.remove(view.domNode, "view");
			this.viewContainer.removeChild(view.domNode);
			this.onViewRemoved(view);
		},
		
		onViewRemoved: function(view){			
			// summary:
			//		Event dispatched when a view is removed from the calendar.
			// view: dojox/calendar/ViewBase
			//		The view that has been removed from the calendar.
			// tags:
			//		callback

		},
		
		_setCurrentViewAttr: function(view){
			var index = arr.indexOf(this.views, view);
			if(index != -1){
				var oldView = this.get("currentView");
				this._currentViewIndex = index;
				this._set("currentView", view);
				
				this._showView(oldView, view);
				this.onCurrentViewChange({
					oldView: oldView,
					newView: view
				});
			}					
		},
				
		_getCurrentViewAttr: function(){
			return this.views[this._currentViewIndex];		
		},
		
		onCurrentViewChange: function(e){
			// summary:
			//		Event dispatched when the current view has changed.
			// e: Event
			//		Object that contains the oldView and newView properties.
			// tags:
			//		callback

		},
		
		_configureView: function(view, index, timeInterval, duration){
			// summary:
			//		Configures the view to show the specified time interval.
			//		This method is computing and setting the following properties:
			//		- "startDate", "columnCount" for a column view,
			//		- "startDate", "columnCount", "rowCount", "refStartTime" and "refEndTime" for a matrix view.
			//		This method can be extended to configure other properties like layout properties for example.
			// view: dojox/calendar/ViewBase
			//		The view to configure.
			// index: Integer
			//		The index of the view in the Calendar view list.
			// timeInterval: Date[]
			//		The time interval that will be displayed by the view.
			// duration: Integer
			//		The duration, in days, of the displayed time interval.
			// tags:
			//		protected

			var cal = this.dateModule;
			if(view.viewKind == "columns"){
				view.set("startDate", timeInterval[0]);
				view.set("columnCount", duration);
			}else if(view.viewKind == "matrix"){
				if(duration > 7){ // show only full weeks.
					var s = this.floorToWeek(timeInterval[0]);					
					var e = this.floorToWeek(timeInterval[1]);
					if(cal.compare(e, timeInterval[1]) != 0){
						e = this.dateModule.add(e, "week", 1);
					}					
					duration = this.dateModule.difference(s, e, "day");
					view.set("startDate", s);
					view.set("columnCount", 7);
					view.set("rowCount", Math.ceil(duration/7));
					view.set("refStartTime", timeInterval[0]);
					view.set("refEndTime", timeInterval[1]);					
				}else{ 
					view.set("startDate", timeInterval[0]);
					view.set("columnCount", duration);
					view.set("rowCount", 1);
					view.set("refStartTime", null);
					view.set("refEndTime", null);
				}				
			}
		},
		
		_computeCurrentView: function(startDate, endDate, duration){
			// summary:
			//		If the time range is lasting less than seven days returns the column view or the matrix view otherwise.
			// startDate: Date
			//		The start date of the displayed time interval
			// endDate: Date
			//		The end date of the displayed time interval	
			// duration: Integer
			//		Duration of the 		
			// returns: dojox/calendar/ViewBase
			//		The view to display.
			// tags:
			//		protected

			return duration <= 7 ? this.columnView : this.matrixView;
		},
		
		matrixViewRowHeaderClick: function(e){
			// summary:
			//		Function called when the cell of a row header of the matrix view is clicked.
			//		The implementation is doing the foolowing actions:
			//		- If another row is already expanded, collapse it and then expand the clicked row.
			//		- If the clicked row is already expadned, collapse it.
			//		- If no row is expanded, expand the click row.
			// e: Object
			//		The row header click event.
			// tags:
			//		protected

			var expIndex = this.matrixView.getExpandedRowIndex();
				if(expIndex == e.index){
					this.matrixView.collapseRow();
				}else if(expIndex == -1){
					this.matrixView.expandRow(e.index);
				}else{
					var h = this.matrixView.on("expandAnimationEnd", lang.hitch(this, function(){
						h.remove();
						this.matrixView.expandRow(e.index);
					}));
					this.matrixView.collapseRow();
				}
		},
		
		columnViewColumnHeaderClick: function(e){
			// summary:
			//		Function called when the cell of a column header of the column view is clicked.
			//		Show the time range defined by the clicked date.
			// e: Object
			//		The column header click event.
			// tags:
			//		protected

			var cal = this.dateModule;
			if(cal.compare(e.date, this._timeInterval[0]) == 0 && this.dateInterval == "day" && this.dateIntervalSteps == 1){
				this.set("dateInterval", "week");
			}else{
				this.set("date", e.date);
				this.set("dateInterval", "day");
				this.set("dateIntervalSteps", 1);
			}
		},
		
		// viewFadeDuration: Integer
		//		The duration in milliseconds of the fade animation when the current view is changing.
		viewChangeDuration: 0,
		
		_showView: function(oldView, newView){
			// summary:
			//		Displays the current view.
			// oldView: dojox/calendar/ViewBase
			//		The previously displayed view or null.
			// newView: dojox/calendar/ViewBase
			//		The view to display.
			// tags:
			//		protected

			if(oldView != null){									
				domStyle.set(oldView.domNode, "display", "none");							
			}
			if(newView != null){												
				domStyle.set(newView.domNode, "display", "block");
				newView.resize();				
				if(!has("ie") || has("ie") > 7){
					domStyle.set(newView.domNode, "opacity", "1");
				}
			}
		},
		
		////////////////////////////////////////////////////
		//
		// Store & data
		//
		////////////////////////////////////////////////////
		
		_setItemsAttr: function(value){
			this._set("items", value);
			if(this.currentView){
				this.currentView.set("items", value);
				this.currentView.invalidateRendering();
			}
		},
		
		/////////////////////////////////////////////////////
		//
		// Time utilities
		//
		////////////////////////////////////////////////////
		
		floorToDay: function(date, reuse){
			// summary:
			//		Floors the specified date to the start of day.
			// date: Date
			//		The date to floor.
			// reuse: Boolean
			//		Whether use the specified instance or create a new one. Default is false.
			// returns: Date
			return timeUtil.floorToDay(date, reuse, this.dateClassObj);
		},
		
		floorToWeek: function(d){
			// summary:
			//		Floors the specified date to the beginning of week.
			// date: Date
			//		Date to floor.
			return timeUtil.floorToWeek(d, this.dateClassObj, this.dateModule, this.firstDayOfWeek, this.locale);
		},
		
		newDate: function(obj){
			// summary:
			//		Creates a new Date object.
			// obj: Object
			//		This object can have several values:
			//		- the time in milliseconds since gregorian epoch.
			//		- a Date instance
			// returns: Date
			return timeUtil.newDate(obj, this.dateClassObj);			
		},
		
		isToday: function(date){
			// summary:
			//		Returns whether the specified date is in the current day.
			// date: Date
			//		The date to test.
			// renderData: Object
			//		The current renderData
			// returns: Boolean
			return timeUtil.isToday(date, this.dateClassObj);
		},
		
		isStartOfDay: function(d){
			// summary:
			//		Tests if the specified date represents the starts of day. 
			// d:Date
			//		The date to test.
			// returns: Boolean
			return timeUtil.isStartOfDay(d, this.dateClassObj, this.dateModule);
		},
		
		floorDate: function(date, unit, steps, reuse){
			// summary:
			//		floors the date to the unit.
			// date: Date
			//		The date/time to floor.
			// unit: String
			//		The unit. Valid values are "minute", "hour", "day".
			// steps: Integer
			//		For "day" only 1 is valid.
			// reuse: Boolean
			//		Whether use the specified instance or create a new one. Default is false.			
			// returns: Date
			return timeUtil.floor(date, unit, steps, reuse, this.classFuncObj);
		},
		
		/////////////////////////////////////////////////////
		//
		// Time navigation
		//
		////////////////////////////////////////////////////
		
		
		// animateRange: Boolean
		//		Indicates that the previous/next range method will be animated.
		animateRange: true,
		
		// animationRangeDuration: Integer
		//		The duration of the next/previous range animation.
		animationRangeDuration: 400,
		
		_animateRange : function(node, toLeft, fadeIn, xFrom, xTo, onEnd){
			// summary:
			//		Animates the current view using a synchronous fade and horizontal translation.
			// toLeft: Boolean
			//		Whether the view is moved to the left or to the right.
			// fadeIn: Boolean
			//		Whether the view is faded in or out.
			// xFrom: Integer
			//		Position before the animation
			// xTo: Integer
			//		Position after the animation
			// onEnd: Function
			//		Function called when the animation is finished.
			// tags:
			//		protected

			
			if(this.animateRangeTimer){ // cleanup previous call not finished
				clearTimeout(this.animateRangeTimer);
				delete this.animateRangeTimer;
			}
			
			var fadeFunc = fadeIn ? coreFx.fadeIn : coreFx.fadeOut;								
			domStyle.set(node, {left: xFrom + "px", right: (-xFrom) + "px"});
						
			fx.combine([
				coreFx.animateProperty({
					node: node, 
					properties: {left: xTo, right: -xTo},
					duration: this.animationRangeDuration/2,
					onEnd: onEnd									
				}),
				fadeFunc({node: node, duration: this.animationRangeDuration/2})
			]).play();
		},			
		
		// _animRangeOutDir: Boolean
		//		Direction of the range animation when the view 'leaving' the screen. 
		//		Valid values are: 
		//		- null: auto value,
		//		- "left": hides to left side (right in right to left).
		//		- "right": hides to right side (left in right to left).
		_animRangeOutDir: null,

		// _animRangeInDir: Boolean
		//		Direction of the range animation when the view 'entering' the screen. 
		//		Valid values are: 
		//		- null: auto value,
		//		- "left": shows from left side (right in right to left).
		//		- "right": shows from  right side (left in right to left).
		_animRangeOutDir: null,		
		
		nextRange: function(){
			this._animRangeOutDir = "left";
			this._animRangeInDir = "right";			
			this._navigate(1);			
		},
		
		previousRange: function(){
			this._animRangeOutDir = "right";
			this._animRangeInDir =  "left";			
			this._navigate(-1);			
		},
		
		_navigate: function(dir){
			// tags:
			//		private

			var d = this.get("date");
			var cal = this.dateModule;
			
			if(d == null){
				var s = this.get("startDate");
				var e = this.get("endDate");
				var dur = cal.difference(s, e, "day");
				if(dir == 1){								
					e = cal.add(e, "day", 1);
					this.set("startDate", e);
					this.set("endDate", cal.add(e, "day", dur));
				}else{
					s = cal.add(s, "day", -1);
					this.set("startDate", cal.add(s, "day", -dur));
					this.set("endDate", s);
				}
			}else{
				var di = this.get("dateInterval");
				var dis = this.get("dateIntervalSteps");
				this.set("date", cal.add(d, di, dir * dis));
			}
		},
		
		goToday: function(){
			// summary:
			//		Changes the displayed time interval to show the current day.
			//		Sets the date property to the current day, the dateInterval property to "day" and 
			//		the "dateIntervalSteps" to 1.
			this.set("date", this.floorToDay(new this.dateClassObj(), true));
			this.set("dateInterval", "day");
			this.set("dateIntervalSteps", 1);			
		},
		
		////////////////////////////////////////////////////
		//
		// Buttons
		//
		////////////////////////////////////////////////////
		
		postCreate: function(){
			this.inherited(arguments);
			this.configureButtons();
		},
		
		configureButtons: function(){
			// summary:
			//		Set the localized labels of the buttons and the event handlers.
			// tags:
			//		protected

			
			var h = [];
			var rtl = !this.isLeftToRight();
			
			if(this.previousButton){
				this.previousButton.set("label", _nls[rtl?"nextButton":"previousButton"]);
				h.push(
					on(this.previousButton, "click", lang.hitch(this, rtl?this.nextRange:this.previousRange))
				);	
			}
			
			if(this.nextButton){
				this.nextButton.set("label", _nls[rtl?"previousButton":"nextButton"]);
				h.push(
					on(this.nextButton, "click", lang.hitch(this, rtl?this.previousRange:this.nextRange))
				);	
			}
			
			if(rtl && this.previousButton && this.nextButton){
				var t = this.previousButton;
				this.previousButton = this.nextButton;
				this.nextButton = t;
			}
			
			if(this.todayButton){
				this.todayButton.set("label", _nls.todayButton);
				h.push(
					on(this.todayButton, "click", lang.hitch(this, this.todayButtonClick))
				);	
			}
			
			if(this.dayButton){
				this.dayButton.set("label", _nls.dayButton);
				h.push(
					on(this.dayButton, "click", lang.hitch(this, this.dayButtonClick))
				);
			}		
			
			if(this.weekButton){
				this.weekButton.set("label", _nls.weekButton);
				h.push(
					on(this.weekButton, "click", lang.hitch(this, this.weekButtonClick))
				);	
			}		

			if(this.fourDaysButton){
				this.fourDaysButton.set("label", _nls.fourDaysButton);
				h.push(
					on(this.fourDaysButton, "click", lang.hitch(this, this.fourDaysButtonClick))
				);
			}
			
			if(this.monthButton){
				this.monthButton.set("label", _nls.monthButton);
				h.push(
					on(this.monthButton, "click", lang.hitch(this, this.monthButtonClick))
				);	
			}	
			
			this._buttonHandles = h;
		},
		
		todayButtonClick: function(e){
			// summary:
			//		The action triggered when the today button is clicked.
			//		By default, calls the goToday() method.

			this.goToday();							
		},
		dayButtonClick: function(e){
			// summary:
			//		The action triggerred when the day button is clicked.
			//		By default, sets the dateInterval property to "day" and 
			//		the "dateIntervalSteps" to 1.

			if(this.get("date") == null){
				this.set("date", this.floorToDay(new this.dateClassObj(), true));
			}			
			this.set("dateInterval", "day");
			this.set("dateIntervalSteps", 1);								
		},
		
		weekButtonClick: function(e){
			// summary:
			//		The action triggered when the week button is clicked.
			//		By default, sets the dateInterval property to "week" and 
			//		the "dateIntervalSteps" to 1.
			this.set("dateInterval", "week");
			this.set("dateIntervalSteps", 1);						
		},
		fourDaysButtonClick: function(e){
			// summary:
			//		The action triggerred when the 4 days button is clicked.
			//		By default, sets the dateInterval property to "day" and 
			//		the "dateIntervalSteps" to 4.
			this.set("dateInterval", "day");
			this.set("dateIntervalSteps", 4);		
		},
		monthButtonClick: function(e){
			// summary:
			//		The action triggered when the month button is clicked.
			//		By default, sets the dateInterval property to "month" and 
			//		the "dateIntervalSteps" to 1.
			this.set("dateInterval", "month");
			this.set("dateIntervalSteps", 1);		
		},
					
		/////////////////////////////////////////////////////
		//
		// States item
		//
		////////////////////////////////////////////////////
		
		updateRenderers: function(obj, stateOnly){
			if(this.currentView){
				this.currentView.updateRenderers(obj, stateOnly);
			}			
		},

		getIdentity: function(item){
			return item ? item.id : null; 
		},

		_setHoveredItem: function(item, renderer){			
			if(this.hoveredItem && item && this.hoveredItem.id != item.id || 
				item == null || this.hoveredItem == null){
				var old = this.hoveredItem;
				this.hoveredItem = item;
				
				this.updateRenderers([old, this.hoveredItem], true);
				
				if(item && renderer){
					this.currentView._updateEditingCapabilities(item, renderer);
				}
			}
		},
		
		hoveredItem: null,
		
		isItemHovered: function(item){
			// summary:
			//		Returns whether the specified item is hovered or not.
			// item: Object
			//		The item.
			// returns: Boolean								
			return this.hoveredItem != null && this.hoveredItem.id == item.id;			
		},
		
		////////////////////////////////////////////////////////////////////////
		//
		// Editing 
		//
		////////////////////////////////////////////////////////////////////////

		isItemEditable: function(item, rendererKind){
			// summary:
			//		Computes whether particular item renderer can be edited.
			//		By default it is using the editable property value.
			// item: Object
			//		The item represented by the renderer.
			// rendererKind: String
			//		The kind of renderer.
			// returns: Boolean
			return this.editable;
		},
		
		isItemMoveEnabled: function(item, rendererKind){
			// summary:
			//		Computes whether particular item renderer can be moved.
			//		By default it is using the moveEnabled property value.
			// item: Object
			//		The item represented by the renderer.
			// rendererKind: String
			//		The kind of renderer.
			// returns: Boolean
			return this.isItemEditable() && this.moveEnabled;
		},
		
		isItemResizeEnabled: function(item, rendererKind){
			// summary:
			//		Computes whether particular item renderer can be resized.
			//		By default it is using the resizedEnabled property value.
			// item: Object
			//		The item represented by the renderer.
			// rendererKind: String
			//		The kind of renderer.
			// returns: Boolean
			
			return this.isItemEditable() && this.resizeEnabled;
		},			

		////////////////////////////////////////////////////////////////////////
		//
		// Widget events
		//
		////////////////////////////////////////////////////////////////////////
		
		onGridClick: function(e){
			// summary:
			//		Event dispatched when the grid has been clicked.
			// e: __GridClickEventArgs
			//		The event dispatched when the grid is clicked.
			// tags:
			//		callback

		},
		
		onGridDoubleClick: function(e){
			// summary:
			//		Event dispatched when the grid has been double-clicked.	
			// e: __GridClickEventArgs
			//		The event dispatched when the grid is double-clicked.
			// tags:
			//		callback
		},	
		
		onItemClick: function(e){
			// summary:
			//		Event dispatched when an item renderer has been clicked.
			// e: __ItemMouseEventArgs
			//		The event dispatched when an item is clicked.
			// tags:
			//		callback
		},
		
		onItemDoubleClick: function(e){
			// summary:
			//		Event dispatched when an item renderer has been double-clicked.
			// e: __ItemMouseEventArgs
			//		The event dispatched when an item is double-clicked.
			// tags:
			//		callback
		},
		
		onItemContextMenu: function(e){
			// summary:
			//		Event dispatched when an item renderer has been context-clicked.
			// e: __ItemMouseEventArgs
			//		The event dispatched when an item is context-clicked.
			// tags:
			//		callback
		},
		
		onItemEditBegin: function(e){
			// summary:
			//		Event dispatched when the item is entering the editing mode.
			// e: __itemEditingEventArgs
			//		The editing event.
			// tags:
			//		callback
		},
		
		onItemEditEnd: function(e){
			// summary:
			//		Event dispatched when the item is leaving the editing mode.
			// e: __itemEditingEventArgs
			//		The editing event.
			// tags:
			//		callback
		},
		
		onItemEditBeginGesture: function(e){
			// summary:
			//		Event dispatched when an editing gesture is beginning.
			// e: __itemEditingEventArgs
			//		The editing event.
			// tags:
			//		callback
		},
		
		onItemEditMoveGesture: function(e){
			// summary:
			//		Event dispatched during a move editing gesture.		
			// e: __itemEditingEventArgs
			//		The editing event.
			// tags:
			//		callback
		},
		
		onItemEditResizeGesture: function(e){
			// summary:
			//		Event dispatched during a resize editing gesture.
			// e: __itemEditingEventArgs
			//		The editing event.
			// tags:
			//		callback
		},
		
		onItemEditEndGesture: function(e){
			// summary:
			//		Event dispatched at the end of an editing gesture.
			// e: __itemEditingEventArgs
			//		The editing event.
			// tags:
			//		callback
		},
		
		onItemRollOver: function(e){
			// Summary:
			//		Event dispatched when the mouse cursor in going over an item renderer.
			// e: __ItemMouseEventArgs
			//		The event dispatched when the mouse cursor enters in the item renderer.
			// tags:
			//		callback
		},
		
		onItemRollOut: function(e){
			// Summary:
			//		Event dispatched when the mouse cursor in leaving an item renderer.
			// e: __ItemMouseEventArgs
			//		The event dispatched when the mouse cursor enters in the item renderer.
			// tags:
			//		callback
		},
		
		onColumnHeaderClick: function(e){
			// summary:
			//		Event dispatched when a column header cell is dispatched.
			// e: __HeaderClickEventArgs
			//		Header click event.
			// tags:
			//		callback
		},
				
		onRowHeaderClick: function(e){
			// summary:
			//		Event dispatched when a row header cell is clicked.
			// e: __HeaderClickEventArgs
			//		Header click event.
			// tags:
			//		callback
		},		
		
		onRendererCreated: function(renderer){
			// summary:
			//		Event dispatched when an item renderer has been created.
			// renderer: dojox/calendar/_RendererMixin
			//		The renderer created.
			// tags:
			//		callback
		},
		
		onRendererRecycled: function(renderer){
			// summary:
			//		Event dispatched when an item renderer has been recycled.
			// renderer: dojox/calendar/_RendererMixin
			//		The renderer created.
			// tags:
			//		callback
		},
		
		onRendererReused: function(renderer){
			// summary:
			//		Event dispatched when an item renderer that was recycled is reused.
			// renderer: dojox/calendar/_RendererMixin
			//		The renderer created.
			// tags:
			//		callback
		},
		
		onRendererDestroyed: function(renderer){
			// summary:
			//		Event dispatched when an item renderer is destroyed.
			// renderer: dojox/calendar/_RendererMixin
			//		The renderer created.
			// tags:
			//		callback
		},
		
		onRenderersLayoutDone: function(view){
			// summary:
			//		Event triggered when item renderers layout has been done.
			// view: dojox/calendar/ViewBase
			//		The view that has been laid-out.
			// tags:
			//		callback
		}

	}) 
});

},
'dojox/html/metrics':function(){
define("dojox/html/metrics", ["dojo/_base/kernel","dojo/_base/lang", "dojo/_base/sniff", "dojo/ready", "dojo/_base/unload",
		"dojo/_base/window", "dojo/dom-geometry"],
  function(kernel,lang,has,ready,UnloadUtil,Window,DOMGeom){
	var dhm = lang.getObject("dojox.html.metrics",true);
	var dojox = lang.getObject("dojox");

	//	derived from Morris John's emResized measurer
	dhm.getFontMeasurements = function(){
		// summary:
		//		Returns an object that has pixel equivilents of standard font size values.
		var heights = {
			'1em':0, '1ex':0, '100%':0, '12pt':0, '16px':0, 'xx-small':0, 'x-small':0,
			'small':0, 'medium':0, 'large':0, 'x-large':0, 'xx-large':0
		};
	
		if(has("ie")){
			//	we do a font-size fix if and only if one isn't applied already.
			//	NOTE: If someone set the fontSize on the HTML Element, this will kill it.
			Window.doc.documentElement.style.fontSize="100%";
		}
	
		//	set up the measuring node.
		var div=Window.doc.createElement("div");
		var ds = div.style;
		ds.position="absolute";
		ds.left="-100px";
		ds.top="0";
		ds.width="30px";
		ds.height="1000em";
		ds.borderWidth="0";
		ds.margin="0";
		ds.padding="0";
		ds.outline="0";
		ds.lineHeight="1";
		ds.overflow="hidden";
		Window.body().appendChild(div);
	
		//	do the measurements.
		for(var p in heights){
			ds.fontSize = p;
			heights[p] = Math.round(div.offsetHeight * 12/16) * 16/12 / 1000;
		}
		
		Window.body().removeChild(div);
		div = null;
		return heights; 	//	object
	};

	var fontMeasurements = null;
	
	dhm.getCachedFontMeasurements = function(recalculate){
		if(recalculate || !fontMeasurements){
			fontMeasurements = dhm.getFontMeasurements();
		}
		return fontMeasurements;
	};

	var measuringNode = null, empty = {};
	dhm.getTextBox = function(/* String */ text, /* Object */ style, /* String? */ className){
		var m, s;
		if(!measuringNode){
			m = measuringNode = Window.doc.createElement("div");
			// Container that we can set contraints on so that it doesn't
			// trigger a scrollbar.
			var c = Window.doc.createElement("div");
			c.appendChild(m);
			s = c.style;
			s.overflow='scroll';
			s.position = "absolute";
			s.left = "0px";
			s.top = "-10000px";
			s.width = "1px";
			s.height = "1px";
			s.visibility = "hidden";
			s.borderWidth = "0";
			s.margin = "0";
			s.padding = "0";
			s.outline = "0";
			Window.body().appendChild(c);
		}else{
			m = measuringNode;
		}
		// reset styles
		m.className = "";
		s = m.style;
		s.borderWidth = "0";
		s.margin = "0";
		s.padding = "0";
		s.outline = "0";
		// set new style
		if(arguments.length > 1 && style){
			for(var i in style){
				if(i in empty){ continue; }
				s[i] = style[i];
			}
		}
		// set classes
		if(arguments.length > 2 && className){
			m.className = className;
		}
		// take a measure
		m.innerHTML = text;
		var box = DOMGeom.position(m);
		// position doesn't report right (reports 1, since parent is 1)
		// So we have to look at the scrollWidth to get the real width
		// Height is right.
		box.w = m.parentNode.scrollWidth;
		return box;
	};

	//	determine the scrollbar sizes on load.
	var scroll={ w:16, h:16 };
	dhm.getScrollbar=function(){ return { w:scroll.w, h:scroll.h }; };

	dhm._fontResizeNode = null;

	dhm.initOnFontResize = function(interval){
		var f = dhm._fontResizeNode = Window.doc.createElement("iframe");
		var fs = f.style;
		fs.position = "absolute";
		fs.width = "5em";
		fs.height = "10em";
		fs.top = "-10000px";
		fs.display = "none";
		if(has("ie")){
			f.onreadystatechange = function(){
				if(f.contentWindow.document.readyState == "complete"){
					f.onresize = f.contentWindow.parent[dojox._scopeName].html.metrics._fontresize;
				}
			};
		}else{
			f.onload = function(){
				f.contentWindow.onresize = f.contentWindow.parent[dojox._scopeName].html.metrics._fontresize;
			};
		}
		//The script tag is to work around a known firebug race condition.  See comments in bug #9046
		f.setAttribute("src", "javascript:'<html><head><script>if(\"loadFirebugConsole\" in window){window.loadFirebugConsole();}</script></head><body></body></html>'");
		Window.body().appendChild(f);
		dhm.initOnFontResize = function(){};
	};

	dhm.onFontResize = function(){};
	dhm._fontresize = function(){
		dhm.onFontResize();
	};

	UnloadUtil.addOnUnload(function(){
		// destroy our font resize iframe if we have one
		var f = dhm._fontResizeNode;
		if(f){
			if(has("ie") && f.onresize){
				f.onresize = null;
			}else if(f.contentWindow && f.contentWindow.onresize){
				f.contentWindow.onresize = null;
			}
			dhm._fontResizeNode = null;
		}
	});

	ready(function(){
		// getScrollbar metrics node
		try{
			var n=Window.doc.createElement("div");
			n.style.cssText = "top:0;left:0;width:100px;height:100px;overflow:scroll;position:absolute;visibility:hidden;";
			Window.body().appendChild(n);
			scroll.w = n.offsetWidth - n.clientWidth;
			scroll.h = n.offsetHeight - n.clientHeight;
			Window.body().removeChild(n);
			//console.log("Scroll bar dimensions: ", scroll);
			delete n;
		}catch(e){}

		// text size poll setup
		if("fontSizeWatch" in kernel.config && !!kernel.config.fontSizeWatch){
			dhm.initOnFontResize();
		}
	});
	return dhm;
});
},
'url:dojox/calendar/templates/VerticalRenderer.html':"<div class=\"dojoxCalendarEvent dojoxCalendarVertical\" onselectstart=\"return false;\">\n\t<div class=\"bg\"></div>\n\t<dl style=\"width:100%;\">\n\t\t<dd data-dojo-attach-point=\"beforeIcon\" class=\"beforeIcon\">▲</dd>\n\t\t<dd data-dojo-attach-point=\"startTimeLabel\" class=\"startTime\"></dd>\n\t\t<dd data-dojo-attach-point=\"summaryLabel\" class=\"summary\"></dd>\n\t</dl>\t\n\t<span data-dojo-attach-point=\"afterIcon\" class=\"afterIcon\">▼</span>\n\t<div data-dojo-attach-point=\"moveHandle\" class=\"handle moveHandle\" ></div>\n\t<div data-dojo-attach-point=\"resizeStartHandle\" class=\"handle resizeStartHandle\"></div>\n\t<div data-dojo-attach-point=\"resizeEndHandle\" class=\"handle resizeEndHandle\" ></div>\n\t<div data-dojo-attach-point=\"endTimeLabel\" class=\"endTime\"></div>\n</div>\n",
'dojox/calendar/ColumnViewSecondarySheet':function(){
require({cache:{
'url:dojox/calendar/templates/ColumnViewSecondarySheet.html':"<div data-dojo-attach-events=\"keydown:_onKeyDown\">\n\t<div  data-dojo-attach-point=\"rowHeader\" class=\"dojoxCalendarRowHeader\">\n\t\t<table data-dojo-attach-point=\"rowHeaderTable\" class=\"dojoxCalendarRowHeaderTable\" cellpadding=\"0\" cellspacing=\"0\"></table>\n\t</div>\t\n\t<div data-dojo-attach-point=\"grid\" class=\"dojoxCalendarGrid\">\n\t\t<table data-dojo-attach-point=\"gridTable\" class=\"dojoxCalendarGridTable\" cellpadding=\"0\" cellspacing=\"0\"></table>\n\t</div>\n\t<div data-dojo-attach-point=\"itemContainer\" class=\"dojoxCalendarContainer\" data-dojo-attach-event=\"mousedown:_onGridMouseDown,mouseup:_onGridMouseUp,ondblclick:_onGridDoubleClick,touchstart:_onGridTouchStart,touchmove:_onGridTouchMove,touchend:_onGridTouchEnd\">\n\t\t<table data-dojo-attach-point=\"itemContainerTable\" class=\"dojoxCalendarContainerTable\" cellpadding=\"0\" cellspacing=\"0\" style=\"width:100%\"></table>\n\t</div>\n</div>\n"}});
define("dojox/calendar/ColumnViewSecondarySheet", ["./MatrixView", "dojo/text!./templates/ColumnViewSecondarySheet.html",
	"dojo/_base/html", "dojo/_base/declare", "dojo/_base/event", "dojo/_base/lang", 
	"dojo/_base/sniff", "dojo/dom", "dojo/dom-class", "dojo/dom-geometry", "dojo/dom-construct", 
	"dojo/date", "dojo/date/locale", "dojo/query", "dojox/html/metrics", "dojo/_base/fx", "dojo/on", 
	"dojo/i18n", "dojo/window"],
	
	function(MatrixView, template, html, declare, event, lang, has, dom, domClass, domGeometry, domConstruct, 
		date, locale, query, metrics, fx, on, i18n, win){
	
	return declare("dojox.calendar.ColumnViewSecondarySheet", MatrixView, {
		
		// summary:
		//		This class defines a matrix view designed to be embedded in a column view, 
		//		usually to display long or all day events on one row. 

		templateString: template,
	
		rowCount: 1,
		
		cellPaddingTop: 4,
		
		roundToDay: false,
		
		_defaultHeight: -1,
		
		layoutDuringResize: true,
		
		_defaultItemToRendererKindFunc: function(item){
			// tags:
			//		private
			return item.allDay ? "horizontal" : null;
		},
		
		_formatGridCellLabel: function(){return null;},
		
		_formatRowHeaderLabel: function(){return null;},
		
		
		// events redispatch
		__fixEvt:function(e){
			e.sheet = "secondary";
			e.source = this;
			return e;
		},
		
		_dispatchCalendarEvt: function(e, name){
			e = this.inherited(arguments);
			if(this.owner.owner){ // the calendar
				this.owner.owner[name](e);
			}
		},
		
		_layoutExpandRenderers: function(index, hasHiddenItems, hiddenItems){
			if(!this.expandRenderer){
				return;
			}
			var h = domGeometry.getMarginBox(this.domNode).h;
			if(this._defaultHeight == -1){
				this._defaultHeight = h;
			}
			if(this._defaultHeight != -1 && this._defaultHeight != h && h >= this._getExpandedHeight()){
				this._layoutExpandRendererImpl(0, this._expandedRowCol, null, true);
			}else{
				this.inherited(arguments);
			}
		},
	
		expandRendererClickHandler: function(e, renderer){
			// summary:
			//		Default action when an expand renderer is clicked.
			//		This method will expand the secondary sheet to show all the events.
			// e: Event
			//		The mouse event.
			// renderer: Object
			//		The renderer that was clicked.
			// tags:
			//		callback

			
			event.stop(e);
			var h = domGeometry.getMarginBox(this.domNode).h;			
			if(this._defaultHeight == h || h < this._getExpandedHeight()){
				this._expandedRowCol = renderer.columnIndex;
				this.owner.resizeSecondarySheet(this._getExpandedHeight());
			}else{
				this.owner.resizeSecondarySheet(this._defaultHeight);
			}
		},
		
		_getExpandedHeight: function(){
			// tags:
			//		private

			return this.naturalRowsHeight[0] + this.expandRendererHeight + this.verticalGap + this.verticalGap;
		},
		
		_layoutRenderers: function(renderData){
			if(!this._domReady){			
				return;
			}
			this.inherited(arguments);
		}

	});
});

},
'dojox/calendar/VerticalRenderer':function(){
require({cache:{
'url:dojox/calendar/templates/VerticalRenderer.html':"<div class=\"dojoxCalendarEvent dojoxCalendarVertical\" onselectstart=\"return false;\">\n\t<div class=\"bg\"></div>\n\t<dl style=\"width:100%;\">\n\t\t<dd data-dojo-attach-point=\"beforeIcon\" class=\"beforeIcon\">▲</dd>\n\t\t<dd data-dojo-attach-point=\"startTimeLabel\" class=\"startTime\"></dd>\n\t\t<dd data-dojo-attach-point=\"summaryLabel\" class=\"summary\"></dd>\n\t</dl>\t\n\t<span data-dojo-attach-point=\"afterIcon\" class=\"afterIcon\">▼</span>\n\t<div data-dojo-attach-point=\"moveHandle\" class=\"handle moveHandle\" ></div>\n\t<div data-dojo-attach-point=\"resizeStartHandle\" class=\"handle resizeStartHandle\"></div>\n\t<div data-dojo-attach-point=\"resizeEndHandle\" class=\"handle resizeEndHandle\" ></div>\n\t<div data-dojo-attach-point=\"endTimeLabel\" class=\"endTime\"></div>\n</div>\n"}});
define("dojox/calendar/VerticalRenderer", ["dojo/_base/declare", "dijit/_WidgetBase", "dijit/_TemplatedMixin",
	"dojox/calendar/_RendererMixin", "dojo/text!./templates/VerticalRenderer.html"],
	
	function(declare, _WidgetBase, _TemplatedMixin, _RendererMixin, template){
	
	return declare("dojox.calendar.VerticalRenderer", [_WidgetBase, _TemplatedMixin, _RendererMixin], {
		
		// summary:
		//		The default item vertical renderer.		
		
		templateString: template,
		
		postCreate: function() {
			this.inherited(arguments);
			this._applyAttributes();
		},
	
		_isElementVisible: function(elt, startHidden, endHidden, size){
			var d;
			
			switch(elt){
				case "startTimeLabel":
					d = this.item.startTime;
					if(this.item.allDay || this.owner.isStartOfDay(d)){
						return false;
					}
					break;
				case "endTimeLabel":
					d = this.item.endTime;
					if(this.item.allDay || this.owner.isStartOfDay(d)){
						return false;
					}
					break;
			}
			return this.inherited(arguments);
		}
		
	});
});

},
'dojox/calendar/Calendar':function(){
require({cache:{
'url:dojox/calendar/templates/Calendar.html':"<div>\n\t<div data-dojo-attach-point=\"buttonContainer\" class=\"buttonContainer\">\n\t\t<div data-dojo-attach-point=\"toolbar\" data-dojo-type=\"dijit.Toolbar\" >\n\t\t\t<button data-dojo-attach-point=\"previousButton\" data-dojo-type=\"dijit.form.Button\" >◄</button>\n\t\t\t<button data-dojo-attach-point=\"nextButton\" data-dojo-type=\"dijit.form.Button\" >►</button>\n\t\t\t<span data-dojo-type=\"dijit.ToolbarSeparator\"></span>\n\t\t\t<button data-dojo-attach-point=\"todayButton\" data-dojo-type=\"dijit.form.Button\" />Today</button>\n\t\t\t<span data-dojo-type=\"dijit.ToolbarSeparator\"></span>\n\t\t\t<button data-dojo-attach-point=\"dayButton\" data-dojo-type=\"dijit.form.Button\" >Day</button>\n\t\t\t<button data-dojo-attach-point=\"fourDaysButton\" data-dojo-type=\"dijit.form.Button\" >4 Days</button>\n\t\t\t<button data-dojo-attach-point=\"weekButton\" data-dojo-type=\"dijit.form.Button\" >Week</button>\t\t\t\n\t\t\t<button data-dojo-attach-point=\"monthButton\" data-dojo-type=\"dijit.form.Button\" >Month</button>\n\t\t</div>\n\t</div>\n\t<div data-dojo-attach-point=\"viewContainer\" class=\"viewContainer\"></div>\n</div>\n"}});
define("dojox/calendar/Calendar", ["dojo/_base/declare", "dojo/_base/lang", "./CalendarBase", "./ColumnView", "./ColumnViewSecondarySheet", 
				"./VerticalRenderer", "./MatrixView",	"./HorizontalRenderer", "./LabelRenderer", 
				"./ExpandRenderer", "./Keyboard", "./Mouse", "dojo/text!./templates/Calendar.html", 
				"dijit/form/Button", "dijit/Toolbar", "dijit/ToolbarSeparator"],
	
	function(declare, lang, CalendarBase, ColumnView, ColumnViewSecondarySheet, VerticalRenderer, 
					 MatrixView, HorizontalRenderer, LabelRenderer, ExpandRenderer, Keyboard, Mouse, template){
	
	return declare("dojox.calendar.Calendar", CalendarBase, {
		
		templateString: template,
		
		// summary:
		//		This class defines a calendar widget that display events in time.
		
		_createDefaultViews: function(){
			// summary:
			//		Creates the default views:
			//		- A dojox.calendar.ColumnView instance used to display one day to seven days time intervals,
			//		- A dojox.calendar.MatrixView instance used to display the other time intervals.
			//		The views are mixed with Mouse and Keyboard to allow editing items using mouse and keyboard.

			var secondarySheetClass = declare([ColumnViewSecondarySheet, Keyboard, Mouse]);
			
			var colView = declare([ColumnView, Keyboard, Mouse])(lang.mixin({
				secondarySheetClass: secondarySheetClass,
				verticalRenderer: VerticalRenderer,
				horizontalRenderer: HorizontalRenderer,
				expandRenderer: ExpandRenderer
			}, this.columnViewProps));
			
			var matrixView = declare([MatrixView, Keyboard, Mouse])(lang.mixin({
				horizontalRenderer: HorizontalRenderer,
				labelRenderer: LabelRenderer,
				expandRenderer: ExpandRenderer
			}, this.matrixViewProps));
								
			this.columnView = colView;
			this.matrixView = matrixView;
			
			var views = [colView, matrixView];
			
			this.installDefaultViewsActions(views);
			
			return views;
		},
		
		installDefaultViewsActions: function(views){
			// summary:
			//		Installs the default actions on newly created default views.
			//		By default this action is registering:
			//		- the matrixViewRowHeaderClick method on the rowHeaderClick event of the matrix view.
			//		- the columnViewColumnHeaderClick method on the columnHeaderClick event of the column view.
			this.matrixView.on("rowHeaderClick", lang.hitch(this, this.matrixViewRowHeaderClick));
			this.columnView.on("columnHeaderClick", lang.hitch(this, this.columnViewColumnHeaderClick));
		}
		
	}) 
});

},
'url:dojox/calendar/templates/ExpandRenderer.html':"<div class=\"dojoxCalendarExpand\" onselectstart=\"return false;\" data-dojo-attach-event=\"click:_onClick,touchstart:_onMouseDown,touchend:_onClick,mousedown:_onMouseDown,mouseup:_onMouseUp,mouseover:_onMouseOver,mouseout:_onMouseOut\">\n\t<div class=\"bg\"><span data-dojo-attach-point=\"expand\">▼</span><span style=\"display:none\" data-dojo-attach-point=\"collapse\">▲</span></div>\t\n</div>\n",
'dojox/calendar/HorizontalRenderer':function(){
require({cache:{
'url:dojox/calendar/templates/HorizontalRenderer.html':"<div class=\"dojoxCalendarEvent dojoxCalendarHorizontal\" onselectstart=\"return false;\">\n\t<div class=\"bg\" ></div>\n\t<div style=\"position:absolute;left:2px;bottom:2px\" data-dojo-attach-point=\"beforeIcon\" class=\"beforeIcon\">◄</div>\t\n\t<div data-dojo-attach-point=\"labelContainer\" class=\"labels\">\t\t\n\t\t<span data-dojo-attach-point=\"startTimeLabel\" class=\"startTime\"></span>\n\t\t<span data-dojo-attach-point=\"summaryLabel\" class=\"summary\"></span>\n\t\t<span  data-dojo-attach-point=\"endTimeLabel\" class=\"endTime\"></span>\n\t</div>\n\t<div style=\"position:absolute;right:2px;bottom:2px\" data-dojo-attach-point=\"afterIcon\" class=\"afterIcon\">►</div>\n\t<div data-dojo-attach-point=\"moveHandle\" class=\"handle moveHandle\" ></div>\n\t<div data-dojo-attach-point=\"resizeStartHandle\" class=\"handle resizeStartHandle\"></div>\n\t<div data-dojo-attach-point=\"resizeEndHandle\" class=\"handle resizeEndHandle\" ></div>\t\n</div>\n"}});
define("dojox/calendar/HorizontalRenderer", [
"dojo/_base/declare", 
"dojo/dom-style", 
"dijit/_WidgetBase", 
"dijit/_TemplatedMixin",
"dojox/calendar/_RendererMixin", 
"dojo/text!./templates/HorizontalRenderer.html"],
	 
function(
declare, 
domStyle, 
_WidgetBase, 
_TemplatedMixin, 
_RendererMixin, 
template){
	
	return declare("dojox.calendar.HorizontalRenderer", [_WidgetBase, _TemplatedMixin, _RendererMixin], {
		
		// summary:
		//		The default item horizontal renderer. 
		
		templateString: template,
		
		_orientation: "horizontal",
		
		visibilityLimits: {
			resizeStartHandle: 50,
			resizeEndHandle: -1,
			summaryLabel: 15,
			startTimeLabel: 32,
			endTimeLabel: 30
		},
		
		_displayValueMap: {
			"beforeIcon": "inline",
			"afterIcon": "inline"
		},
		
		_displayValue: "inline",
		
		// arrowPadding: Integer
		//		The padding size in pixels to apply to the label container on left and/or right side, to show the arrows correctly.
		arrowPadding: 12, 
		
		_isElementVisible: function(elt, startHidden, endHidden, size){
			var d;
			var ltr = this.isLeftToRight();
			
			if(elt == "startTimeLabel"){
				if(this.labelContainer && (ltr && endHidden || !ltr && startHidden)){
					domStyle.set(this.labelContainer, "marginRight", this.arrowPadding+"px");
				}else{
					domStyle.set(this.labelContainer, "marginRight", 0);
				}
				if(this.labelContainer && (!ltr && endHidden || ltr && startHidden)){
					domStyle.set(this.labelContainer, "marginLeft", this.arrowPadding+"px");
				}else{
					domStyle.set(this.labelContainer, "marginLeft", 0);
				}
			}
			
			switch(elt){
				case "startTimeLabel":
					d = this.item.startTime;
					if(this.item.allDay || this.owner.isStartOfDay(d)){
						return false;
					}
					break;
				case "endTimeLabel":
					d = this.item.endTime;
					if(this.item.allDay || this.owner.isStartOfDay(d)){
						return false;
					}
					break;
			}
			return this.inherited(arguments);
		},
		
		getDisplayValue: function(part){
			var res = this._displayValueMap[part];
			if(res){
				return res;
			}
			return this._displayValue;
		},
		
		postCreate: function() {
			this.inherited(arguments);
			this._applyAttributes();
		}
	});
});

},
'dojox/widget/_Invalidating':function(){
define("dojox/widget/_Invalidating", ["dojo/_base/declare", "dojo/_base/lang", "dojo/Stateful"], 
	function(declare, lang, Stateful){
		
	return declare("dojox.widget._Invalidating", Stateful, {
		// summary:
		//		Base class for classes (usually widgets) that watch invalidated properties and delay the rendering
		//		after these properties modifications to the next execution frame.
		
		// invalidatingPoperties: String[]
		//		The list of properties to watch for to trigger invalidation. This list must be initialized in the
		//		constructor. Default value is null.
		invalidatingProperties: null,
		// invalidRenderering: Boolean
		//		Whether the rendering is invalid or not. This is a readonly information, one must call 
		//		invalidateRendering to modify this flag. 
		invalidRendering: false,
		postscript: function(mixin){
			this.inherited(arguments);
			if(this.invalidatingProperties){
				var props = this.invalidatingProperties;
				for(var i = 0; i < props.length; i++){
					this.watch(props[i], lang.hitch(this, this.invalidateRendering));
					if(mixin && props[i] in mixin){
						// if the prop happens to have been passed in the ctor mixin we are invalidated
						this.invalidateRendering();
					}
				}
			}
		},
		addInvalidatingProperties: function(/*String[]*/ properties){
			// summary:
			//		Add properties to the watched properties to trigger invalidation. This method must be called in
			//		the constructor. It is typically used by subclasses of a _Invalidating class to add more properties
			//		to watch for.
			// properties:
			//		The list of properties to watch for.
			this.invalidatingProperties = this.invalidatingProperties?this.invalidatingProperties.concat(properties):properties;
		},
		invalidateRendering: function(){
			// summary:
			//		Invalidating the rendering for the next executation frame.
			if(!this.invalidRendering){
				this.invalidRendering = true;
				setTimeout(lang.hitch(this, this.validateRendering), 0);
			}
		},
		validateRendering: function(){
			// summary:
			//		Immediately validate the rendering if it has been invalidated. You generally do not call that method yourself.
			// tags:
			//		protected
			if(this.invalidRendering){
				this.refreshRendering();
				this.invalidRendering = false;
			}
		},
		refreshRendering: function(){
			// summary:
			//		Actually refresh the rendering. Implementation should implement that method.
		}
	});
});

},
'dojox/calendar/ColumnView':function(){
require({cache:{
'url:dojox/calendar/templates/ColumnView.html':"<div data-dojo-attach-events=\"keydown:_onKeyDown\">\n\t\n\t<div data-dojo-attach-point=\"header\" class=\"dojoxCalendarHeader\">\n\t\t<div class=\"dojoxCalendarYearColumnHeader\" data-dojo-attach-point=\"yearColumnHeader\">\n\t\t\t<table cellspacing=\"0\" cellpadding=\"0\"><tr><td><span data-dojo-attach-point=\"yearColumnHeaderContent\"></span></td></tr></table>\t\t\n\t\t</div>\n\t\t<div data-dojo-attach-point=\"columnHeader\" class=\"dojoxCalendarColumnHeader\">\n\t\t\t<table data-dojo-attach-point=\"columnHeaderTable\" class=\"dojoxCalendarColumnHeaderTable\" cellpadding=\"0\" cellspacing=\"0\"></table>\n\t\t</div>\n\t</div>\n\t\n\t<div data-dojo-attach-point=\"secondarySheetNode\"></div>\n\t\n\t<div data-dojo-attach-point=\"scrollContainer\" class=\"dojoxCalendarScrollContainer\">\n\t\t<div data-dojo-attach-point=\"sheetContainer\" style=\"position:relative;left:0;right:0;margin:0;padding:0\">\n\t\t\t<div data-dojo-attach-point=\"rowHeader\" class=\"dojoxCalendarRowHeader\">\n\t\t\t\t<table data-dojo-attach-point=\"rowHeaderTable\" class=\"dojoxCalendarRowHeaderTable\" cellpadding=\"0\" cellspacing=\"0\"></table>\n\t\t\t</div>\n\t\t\t<div data-dojo-attach-point=\"grid\" class=\"dojoxCalendarGrid\">\n\t\t\t\t<table data-dojo-attach-point=\"gridTable\" class=\"dojoxCalendarGridTable\" cellpadding=\"0\" cellspacing=\"0\" style=\"width:100%\"></table>\n\t\t\t</div>\n\t\t\t<div data-dojo-attach-point=\"itemContainer\" class=\"dojoxCalendarContainer\" data-dojo-attach-event=\"mousedown:_onGridMouseDown,mouseup:_onGridMouseUp,ondblclick:_onGridDoubleClick,touchstart:_onGridTouchStart,touchmove:_onGridTouchMove,touchend:_onGridTouchEnd\">\n\t\t\t\t<table data-dojo-attach-point=\"itemContainerTable\" class=\"dojoxCalendarContainerTable\" cellpadding=\"0\" cellspacing=\"0\" style=\"width:100%\"></table>\n\t\t\t</div>\n\t\t</div> \n\t</div>\n\t\n\t<div data-dojo-attach-point=\"vScrollBar\" class=\"dojoxCalendarVScrollBar\">\n\t\t<div data-dojo-attach-point=\"vScrollBarContent\" style=\"visibility:hidden;position:relative;width:1px;height:1px;\" ></div>\n\t</div>\n\t\n</div>\n"}});
define("dojox/calendar/ColumnView", [    
"dojo/_base/declare", 
"dojo/_base/event", 
"dojo/_base/lang", 
"dojo/_base/sniff", 
"dojo/_base/fx", 
"dojo/dom",
"dojo/dom-class",
"dojo/dom-style", 
"dojo/dom-geometry", 
"dojo/dom-construct", 
"dojo/on",
"dojo/date", 
"dojo/date/locale", 
"dojo/query",	
"dojox/html/metrics",
"./SimpleColumnView", 
"dojo/text!./templates/ColumnView.html", 
"./ColumnViewSecondarySheet"],

function(
	declare, 
	event, 
	lang, 
	has, 
	fx, 
	dom, 
	domClass, 
	domStyle,
	domGeometry, 
	domConstruct,
	on,
	date, 
	locale, 
	query, 
	metrics,
	SimpleColumnView, 
	template, 
	ColumnViewSecondarySheet){

	return declare("dojox.calendar.ColumnView", SimpleColumnView, {

		// summary:		
		//		This class defines a simple column view that also uses a secondary 
		//		sheet to display long or all day events. 
		//		By default an dojox.calendar.ColumnViewSecondarySheet instance is created.
		//		Set the secondarySheetClass property to define the class to instantiate,
		//		for example to mix the default class with Mouse, Keyboard or Touch plugins. 

		templateString: template,
	
		baseClass: "dojoxCalendarColumnView",
		
		// secondarySheetClass: Class
		//		The secondary sheet class, by default dojox.calendar.ColumnViewSecondarySheet.
		secondarySheetClass: ColumnViewSecondarySheet,
		
		// secondarySheetProps: Object
		//		Secondary sheet constructor parameters.
		secondarySheetProps: null,
		
		// headerPadding: Integer
		//	Padding between the header (composed of the secondary sheet and the column header) 
		//	and the primary sheet.
		headerPadding: 3,
		
		buildRendering: function(){
			this.inherited(arguments);
			if(this.secondarySheetNode){
				var args = lang.mixin({owner: this}, this.secondarySheetProps);
				this.secondarySheet = new this.secondarySheetClass(args, this.secondarySheetNode);				
				this.secondarySheetNode = this.secondarySheet.domNode;				
			}
		},
			
		destroy: function(preserveDom){
			if(this.secondarySheet){
				this.secondarySheet.destroy(preserveDom);
			}
			this.inherited(arguments);
		},
		
		_setVisibility: function(value){
			// tags:
			//		private

			this.inherited(arguments);
			if(this.secondarySheet){
				this.secondarySheet._setVisibility(value);
			}
		},
		
		invalidateLayout: function(){
			// tags:
			//		private

			this._layoutRenderers(this.renderData);
			if(this.secondarySheet){
				this.secondarySheet._layoutRenderers(this.secondarySheet.renderData);
			}
		},
		
		onRowHeaderClick: function(e){
			// summary:
			//		Event dispatched when the row header cell of the secondary sheet is clicked.
			// tags:
			//		callback

		},
		
		resizeSecondarySheet: function(height){
			// summary:
			//		Resizes the secondary sheet header and relayout the other sub components according this new height.
			//		Warning: this method is only available for the default template and default CSS.
			// height: Integer
			//		The new height in pixels.
			if(this.secondarySheetNode){
				var headerH = domGeometry.getMarginBox(this.header).h;
				domStyle.set(this.secondarySheetNode, "height", height+"px");
				this.secondarySheet._resizeHandler(null, true);
				var top = (height + headerH + this.headerPadding)+"px";
				domStyle.set(this.scrollContainer, "top", top);
				if(this.vScrollBar){
					domStyle.set(this.vScrollBar, "top", top);
				}
			}
		},
		
		updateRenderers: function(obj, stateOnly){
			this.inherited(arguments);
			if(this.secondarySheet){
				this.secondarySheet.updateRenderers(obj, stateOnly);
			}
		},
		
		_setItemsAttr: function(value){
			this.inherited(arguments);
			if(this.secondarySheet){
				this.secondarySheet.set("items", value);
			}
		},
		
		_setStartDateAttr: function(value){
			this.inherited(arguments);
			if(this.secondarySheet){
				this.secondarySheet.set("startDate", value);
			}
		},
		
		_setColumnCountAttr: function(value){
			this.inherited(arguments);
			if(this.secondarySheet){
				this.secondarySheet.set("columnCount", value);
			}
		},
		
		_setHorizontalRendererAttr: function(value){
			if(this.secondarySheet){
				this.secondarySheet.set("horizontalRenderer", value);
			}
		},
		
		_getHorizontalRendererAttr: function(value){
			if(this.secondarySheet){
				return this.secondarySheet.get("horizontalRenderer");
			}
		},
		
		_setExpandRendererAttr: function(value){
			if(this.secondarySheet){
				this.secondarySheet.set("expandRenderer", value);
			}
		},
		
		_getExpandRendererAttr: function(value){
			if(this.secondarySheet){
				return this.secondarySheet.get("expandRenderer");
			}
		},
					
		_setTextDirAttr: function(value){
			this.secondarySheet.set("textDir", value);
			this._set("textDir", value);
		},
		
		_defaultItemToRendererKindFunc: function(item){
			return item.allDay ? null : "vertical"; // String
		},
		
		getSecondarySheet: function(){
			// summary:
			//		Returns the secondary sheet
			// returns: dojox/calendar/MatrixView
			return this.secondarySheet;
		},
		
		_onGridTouchStart: function(e){
			this.inherited(arguments);
			this._doEndItemEditing(this.secondarySheet, "touch");
		},
		
		_onGridMouseDown: function(e){
			this.inherited(arguments);
			this._doEndItemEditing(this.secondarySheet, "mouse");
		},
		
		_configureScrollBar: function(renderData){


			this.inherited(arguments);
			if(this.secondarySheetNode){
				var atRight = this.isLeftToRight() ? true : this.scrollBarRTLPosition == "right";
				domStyle.set(this.secondarySheetNode, atRight ? "right" : "left", renderData.scrollbarWidth + "px");
				domStyle.set(this.secondarySheetNode, atRight ? "left" : "right", "0");
			}
		},
		
		_refreshItemsRendering: function(){
			this.inherited(arguments);
			if(this.secondarySheet){
				var rd = this.secondarySheet.renderData;
				this.secondarySheet._computeVisibleItems(rd);
				this.secondarySheet._layoutRenderers(rd);
			}			
		},
		
		_layoutRenderers: function(renderData){
			if(!this.secondarySheet._domReady){
				this.secondarySheet._domReady = true;
				this.secondarySheet._layoutRenderers(this.secondarySheet.renderData);
			}
			
			this.inherited(arguments);
		},
		
		invalidateRendering: function(){
			if(this.secondarySheet){
				this.secondarySheet.invalidateRendering();
			}
			this.inherited(arguments);
		}

	});
});

},
'dojox/calendar/MobileCalendar':function(){
require({cache:{
'url:dojox/calendar/templates/MobileCalendar.html':"<div>\n\t<div data-dojo-attach-point=\"viewContainer\" class=\"viewContainer\"></div>\n\t<div data-dojo-attach-point=\"buttonContainer\" class=\"buttonContainer\">\n\t\t\t<button data-dojo-attach-point=\"previousButton\" data-dojo-type=\"dojox.mobile.Button\" >◄</button>\n\t\t\t<button data-dojo-attach-point=\"todayButton\" data-dojo-type=\"dojox.mobile.Button\" />Today</button>\n\t\t\t<button data-dojo-attach-point=\"dayButton\" data-dojo-type=\"dojox.mobile.Button\" >Day</button>\n\t\t\t<button data-dojo-attach-point=\"weekButton\" data-dojo-type=\"dojox.mobile.Button\" >Week</button>\t\t\t\n\t\t\t<button data-dojo-attach-point=\"monthButton\" data-dojo-type=\"dojox.mobile.Button\" >Month</button>\n\t\t<button data-dojo-attach-point=\"nextButton\" data-dojo-type=\"dojox.mobile.Button\" >►</button>\n\t</div>\n</div>\n"}});
define("dojox/calendar/MobileCalendar", ["dojo/_base/declare", "dojo/_base/lang", "./CalendarBase", "./ColumnView", "./ColumnViewSecondarySheet", 
				"./MobileVerticalRenderer", "./MatrixView",	"./MobileHorizontalRenderer", "./LabelRenderer", 
				"./ExpandRenderer", "./Touch", "dojo/text!./templates/MobileCalendar.html", "dojox/mobile/Button"],
	
	function(declare, lang, CalendarBase, ColumnView, ColumnViewSecondarySheet, VerticalRenderer, 
					 MatrixView, HorizontalRenderer, LabelRenderer, ExpandRenderer, Touch, template){
	
	return declare("dojox.calendar.MobileCalendar", CalendarBase, {
		
		// summary:
		//		This class defines a calendar widget that display events in time designed to be used in mobile environment.
		
		templateString: template,
		
		_createDefaultViews: function(){
			// summary:
			//		Creates the default views:
			//		- A dojox.calendar.ColumnView instance used to display one day to seven days time intervals,
			//		- A dojox.calendar.MatrixView instance used to display the other time intervals.
			//		The views are mixed with Mouse and Keyboard to allow editing items using mouse and keyboard.

			var secondarySheetClass = declare([ColumnViewSecondarySheet, Touch]);
			
			var colView = declare([ColumnView, Touch])(lang.mixin({
				secondarySheetClass: secondarySheetClass,
				verticalRenderer: VerticalRenderer,
				horizontalRenderer: HorizontalRenderer,
				expandRenderer: ExpandRenderer
			}, this.columnViewProps));
			
			var matrixView = declare([MatrixView, Touch])(lang.mixin({
				horizontalRenderer: HorizontalRenderer,
				labelRenderer: LabelRenderer,
				expandRenderer: ExpandRenderer
			}, this.matrixViewProps));
								
			this.columnView = colView;
			this.matrixView = matrixView;
			
			var views = [colView, matrixView];
			
			this.installDefaultViewsActions(views);
			
			return views;
		},
		
		installDefaultViewsActions: function(views){
			// summary:
			//		Installs the default actions on newly created default views.
			//		By default this action is registering:
			//		- the matrixViewRowHeaderClick method	on the rowHeaderClick event of the matrix view.
			//		- the columnViewColumnHeaderClick method	on the columnHeaderClick event of the column view.
			this.matrixView.on("rowHeaderClick", lang.hitch(this, this.matrixViewRowHeaderClick));
			this.columnView.on("columnHeaderClick", lang.hitch(this, this.columnViewColumnHeaderClick));			
		}
		
	}) 
});

}}});
define("dojo/calendar-layer", [], 1);
