require({cache:{
'dojox/dgauges/components/default/HorizontalLinearGauge':function(){
define("dojox/dgauges/components/default/HorizontalLinearGauge", [
		"dojo/_base/lang", 
		"dojo/_base/declare", 
		"dojo/_base/connect", 
		"dojo/_base/Color", 
		"../utils",
		"../../RectangularGauge", 
		"../../LinearScaler", 
		"../../RectangularScale", 
		"../../RectangularValueIndicator", 
		"../../TextIndicator",
		"../DefaultPropertiesMixin"
	], 
	function(lang, declare, connect, Color, utils, RectangularGauge, LinearScaler, RectangularScale, RectangularValueIndicator, TextIndicator, DefaultPropertiesMixin){
	return declare("dojox.dgauges.components.default.HorizontalLinearGauge", [RectangularGauge, DefaultPropertiesMixin], {
		// summary:
		//		A horizontal gauge widget.

		// borderColor: Object|Array|int
		//		The border color. Default is "#C9DFF2".
		borderColor: "#C9DFF2",
		// fillColor: Object|Array|int
		//		The background color. Default is "#FCFCFF".
		fillColor: "#FCFCFF",
		// indicatorColor: Object|Array|int
		//		The indicator fill color. Default is "#F01E28".
		indicatorColor: "#F01E28",
		constructor: function(){
			// Base colors
			this.borderColor = new Color(this.borderColor);
			this.fillColor = new Color(this.fillColor);
			this.indicatorColor = new Color(this.indicatorColor);
			
			// Draw background
			this.addElement("background", lang.hitch(this, this.drawBackground));
			
			// Scaler			
			var scaler = new LinearScaler();
			
			// Scale
			var scale = new RectangularScale();
			scale.set("scaler", scaler);
			scale.set("labelPosition", "trailing");
			scale.set("paddingTop", 15);
			scale.set("paddingRight", 23);
			
			this.addElement("scale", scale);
			
			// Value indicator
			var indicator = new RectangularValueIndicator();			
			indicator.indicatorShapeFunc = lang.hitch(this, function(group){
				var indic = group.createPolyline([0, 0, 10, 0, 0, 10, -10, 0, 0, 0]).setStroke({
					color: "blue",
					width: 0.25
				}).setFill(this.indicatorColor);
				
				return indic;
			});
			indicator.set("paddingTop", 5);
			indicator.set("interactionArea", "gauge");
			scale.addIndicator("indicator", indicator);
			
			// Indicator Text Border
			this.addElement("indicatorTextBorder", lang.hitch(this, this.drawTextBorder), "leading");
			
			// Indicator Text
			var indicatorText = new TextIndicator();
			indicatorText.set("indicator", indicator);
			indicatorText.set("x", 32.5);
			indicatorText.set("y", 30);
			this.addElement("indicatorText", indicatorText);

		},
		
		drawBackground: function(g, w, h){
			// summary:
			//		Draws the background shape of the gauge.
			// g: dojox/gfx/Group
			//		The group used to draw the background. 
			// w: Number
			//		The width of the gauge.
			// h: Number
			//		The height of the gauge.
			// tags:
			//		protected
			h = 49;
			var gap = 0;
			var cr = 3;
			var entries = utils.createGradient([0, utils.brightness(this.borderColor, -20), 0.1, utils.brightness(this.borderColor, -40)]);
			g.createRect({
				x: 0,
				y: 0,
				width: w,
				height: h,
				r: cr
			}).setFill(lang.mixin({
				type: "linear",
				x1: 0,
				y1: 0,
				x2: w,
				y2: h
			}, entries)).setStroke({
				color: "#A5A5A5",
				width: 0.2
			});
			entries = utils.createGradient([0, utils.brightness(this.borderColor, 70), 1, utils.brightness(this.borderColor, -50)]);
			gap = 4;
			cr = 2
			g.createRect({
				x: gap,
				y: gap,
				width: w - 2 * gap,
				height: h - 2 * gap,
				r: cr
			}).setFill(lang.mixin({
				type: "linear",
				x1: 0,
				y1: 0,
				x2: w,
				y2: h
			}, entries));
			gap = 6;
			cr = 1
			entries = utils.createGradient([0, utils.brightness(this.borderColor, 60), 1, utils.brightness(this.borderColor, -40)]);
			g.createRect({
				x: gap,
				y: gap,
				width: w - 2 * gap,
				height: h - 2 * gap,
				r: cr
			}).setFill(lang.mixin({
				type: "linear",
				x1: 0,
				y1: 0,
				x2: w,
				y2: h
			}, entries));
			
			gap = 7;
			cr = 0
			entries = utils.createGradient([0, utils.brightness(this.borderColor, 70), 1, utils.brightness(this.borderColor, -40)]);
			g.createRect({
				x: gap,
				y: gap,
				width: w - 2 * gap,
				height: h - 2 * gap,
				r: cr
			}).setFill(lang.mixin({
				type: "linear",
				x1: w,
				y1: 0,
				x2: 0,
				y2: h
			}, entries));
			gap = 5;
			cr = 0
			entries = utils.createGradient([0, [255, 255, 255, 220], 0.8, utils.brightness(this.fillColor, -5), 1, utils.brightness(this.fillColor, -30)]);
			g.createRect({
				x: gap,
				y: gap,
				width: w - 2 * gap,
				height: h - 2 * gap,
				r: cr
			}).setFill(lang.mixin({
				type: "radial",
				cx: w / 2,
				cy: 0,
				r: w
			}, entries)).setStroke({
				color: utils.brightness(this.fillColor, -40),
				width: 0.4
			});
			
		},
		drawTextBorder: function(g){
			// summary:
			//		Internal method.
			// tags:
			//		private
			return g.createRect({
				x: 5,
				y: 5,
				width: 60,
				height: 39
			}).setStroke({
				color: "#CECECE",
				width: 1
			});
		}
	});
});

},
'dojox/dgauges/GaugeBase':function(){
define("dojox/dgauges/GaugeBase", ["dojo/_base/lang", "dojo/_base/declare", "dojo/dom-geometry", "dijit/registry", "dijit/_WidgetBase", "dojo/_base/html", 
		"dojo/_base/event", "dojox/gfx", "dojox/widget/_Invalidating","./ScaleBase", "dojox/gfx/matrix"],
	function(lang, // lang.extend
		declare, domGeom,  WidgetRegistry, _WidgetBase, html, event, gfx, _Invalidating, ScaleBase, matrix){
	return declare("dojox.dgauges.GaugeBase", [_WidgetBase, _Invalidating], {
		// summary: 
		//		This class is the base class for the circular and 
		//		rectangular (horizontal and vertical) gauge components.
		//		A gauge is a composition of elements added to the gauge using the addElement method.
		//		Elements are drawn from back to front in the same order they are added (using addElement).
		//		An elements can be: 
		//
		//		- A GFX drawing functions typically used for defining the style of the gauge.
		//		- A scale: CircularScale or RectangularScale depending on the type of gauge.
		//		- A text, using the TextIndicator
		//		Note: Indicator classes (value indicators, range indicators) are sub-elements of scales
		//		To create a custom gauge, subclass CircularGauge or RectangularGauge and
		//		configure its elements in the constructor.
		//		Ready to use, predefined gauges are available in dojox/dgauges/components/
		//		They are good examples of gauges built on top of the framework.
		
		_elements: null,
		_scales: null,
		_elementsIndex: null,
		_elementsRenderers: null,
		_gfxGroup: null,
		_mouseShield: null,
		_widgetBox: null,
		_node: null,

		// value: Number
		//		A convenient way for setting the value of the first indicator of the first
		//		scale declared in the gauge. It must be changed using the set method.
		//		For other indicators, you have to set their value explicitly.
		value: 0,
		
		// font: Object
		//		The font of the gauge used by elements if not overridden.
		font: null,
		
		constructor: function(/* Object */args, /* DOMNode */ node){
			this.font = {
				family: "Helvetica",
				style: "normal",
				variant: "small-caps",
				weight: "bold",
				size: "10pt",
				color: "black"
			};
			this._elements = [];
			this._scales = [];
			this._elementsIndex = {};
			this._elementsRenderers = {};
			this._node = WidgetRegistry.byId(node);
			var box = html.getMarginBox(node);

			this.surface = gfx.createSurface(this._node, box.w || 1, box.h || 1);
			this._widgetBox = box;
			// _baseGroup is a workaround for http://bugs.dojotoolkit.org/ticket/14471
			this._baseGroup = this.surface.createGroup();
			this._mouseShield = this._baseGroup.createGroup();
			this._gfxGroup = this._baseGroup.createGroup();
		},
		
		_setCursor: function(type){
			// summary:
			//		Internal method.
			// tags:
			//		private
			if(this._node)
				this._node.style.cursor = type;
		},
		
		_computeBoundingBox: function(/* Object */element){
			// summary:
			//		Internal method.
			// tags:
			//		private
			return element ? element.getBoundingBox() : {x:0, y:0, width:0, height:0};
		},
		
		destroy: function(){
			// summary:
			//		Cleanup when a gauge is to be destroyed.
			this.surface.destroy();
			this.inherited(arguments);
		},

		resize: function(width, height){
			// summary:
			//		Resize the gauge to the dimensions of width and height.
			// description:
			//		Resize the gauge and its surface to the width and height dimensions.
			//		If no width/height or box is provided, resize the surface to the marginBox of the gauge.
			// width: Number
			//		The new width of the gauge.
			// height: Number
			//		The new height of the gauge.
			// returns: dojox/dgauges/GaugeBase
			//		A reference to the current gauge for functional chaining.
			var box;
			switch(arguments.length){
				// case 0, do not resize the div, just the surface
				case 1:
					// argument, override node box
					box = lang.mixin({}, width);
					domGeom.setMarginBox(this._node, box);
					break;
				case 2:
					box = {w: width, h: height};
					// argument, override node box
					domGeom.setMarginBox(this._node, box);
					break;
			}
			// in all cases take back the computed box
			box = domGeom.getMarginBox(this._node);
			this._widgetBox = box;
			var d = this.surface.getDimensions();
			if(d.width != box.w || d.height != box.h){
				// and set it on the surface
				this.surface.setDimensions(box.w, box.h);
				this._mouseShield.clear();
				this._mouseShield.createRect({x:0,y:0,width:box.w,height:box.h}).setFill([0, 0, 0, 0]);
				return this.invalidateRendering();
			}else{
				return this;
			}
		},
		
		addElement: function(/* String */name, /* Object */ element){
			// summary:
			//		Adds a element to the gauge.
			// name: String
			//		The name of the element to be added.
			// element: Object
			//		This parameter can be:
			//
			//		- A function which takes on argument of type GFX Group and return null or a
			//		GFX element retrievable using the getElementRenderer() method.
			//		- A Scale instance, i.e. CircularScale or RectangularScale.
			//		- A TextIndicator instance.
			if(this._elementsIndex[name] && this._elementsIndex[name] != element){
				this.removeElement(name);
			}
			
			if(lang.isFunction(element)){
				var gfxHolder = {};
				lang.mixin(gfxHolder, new _Invalidating());
				gfxHolder._name = name;
				gfxHolder._gfxGroup = this._gfxGroup.createGroup();
				gfxHolder.width = 0;
				gfxHolder.height = 0;
				gfxHolder._isGFX = true;
				gfxHolder.refreshRendering = function(){
					gfxHolder._gfxGroup.clear();
					return element(gfxHolder._gfxGroup, gfxHolder.width, gfxHolder.height);
				};
				this._elements.push(gfxHolder);
				this._elementsIndex[name] = gfxHolder;
			}else{
				element._name = name;
				element._gfxGroup = this._gfxGroup.createGroup();
				element._gauge = this;
				this._elements.push(element);
				this._elementsIndex[name] = element;
				
				if(element instanceof ScaleBase){
					this._scales.push(element);
				}
			}
			return this.invalidateRendering();
		},
		
		removeElement: function(/* String */name){
			// summary:
			//		Remove the element defined by name from the gauge.
			// name: String
			//		The name of the element as defined using addElement.
			// returns: Object
			//		A reference to the removed element.
			
			var element = this._elementsIndex[name];
			
			if(element){
				element._gfxGroup.removeShape();
				var idx = this._elements.indexOf(element);
				this._elements.splice(idx, 1);
				
				if(element instanceof ScaleBase){
					var idxs = this._scales.indexOf(element);
					this._scales.splice(idxs, 1);
				}
				delete this._elementsIndex[name];
				delete this._elementsRenderers[name];
			}
			this.invalidateRendering();
			return element;
		},
		
		getElement: function(/* String */name){
			// summary:
			//		Get the given element, by name.
			// name: String
			//		The name of the element as defined using addElement.
			// returns: Object
			//		The element.
			return this._elementsIndex[name];
		},
		
		getElementRenderer: function(/* String */name){
			// summary:
			//		Get the given element renderer, by name.
			// name: String
			//		The name of the element as defined using addElement.
			// returns: Object
			//		The element renderer returned by the
			//		drawing function or by the refreshRendering() method
			//		in the case of framework classes.
			return this._elementsRenderers[name];
		},
		
		onStartEditing: function(event){
			// summary:
			//		Called when an interaction begins (keyboard, mouse or gesture).
			// event:
			//		On object with a unique member "indicator". This member is a reference to the modified indicator.
			// tags:
			//		callback
		},
		
		onEndEditing: function(event){
			// summary:
			//		Called when an interaction ends (keyboard, mouse or gesture).
			// event:
			//		On object with a unique member "indicator". This member is a reference to the modified indicator.
			// tags:
			//		callback
		}
	})
});

},
'dojox/dgauges/RectangularRangeIndicator':function(){
define("dojox/dgauges/RectangularRangeIndicator", ["dojo/_base/declare", "dojox/gfx", "./ScaleIndicatorBase", "dojo/_base/event", "dojo/dom-geometry"],
	function(declare, gfx, ScaleIndicatorBase, eventUtil, domGeom){
	return declare("dojox.dgauges.RectangularRangeIndicator", ScaleIndicatorBase, {
		// summary:
		//		A RectangularRangeIndicator is used to represent a range of values on a scale.
		//		For adding this kind of indicator instance to the gauge, use the addIndicator 
		//		method of RectangularScale.

		// start: Number
		//		The start value of the range. Default is 0.
		start: 0,
		// startThickness: Number
		//		The thickness in pixels of the shape at the position defined by the start property.
		//		Default is 10.
		startThickness: 10,
		// endThickness: Number
		//		The thickness in pixels of the shape at the position defined by the value property.
		//		Default is 10.
		endThickness: 10,
		// fill: Object
		//		A fill object that will be passed to the setFill method of GFX.
		fill: null,
		// stroke: Object
		//		A stroke object that will be passed to the setStroke method of GFX.
		stroke: null,
		// paddingLeft: Number
		//		The left padding. Not used for horizontal gauges.
		paddingLeft: 10,
		// paddingTop: Number
		//		The top padding. Not used for vertical gauges.
		paddingTop: 10,
		// paddingRight: Number
		//		The right padding. Not used for horizontal gauges.
		paddingRight: 10,
		// paddingBottom: Number
		//		The bottom padding. Not used for vertical gauges.
		paddingBottom: 10,
		
		constructor: function(){
			this.fill = [255, 120, 0];
			this.stroke = {
				color: "black",
				width: .2
			};
			this.interactionMode = "none";
			
			this.addInvalidatingProperties(["start", "startThickness", "endThickness", "fill", "stroke"]);
		},

		_defaultHorizontalShapeFunc: function(indicator, group, scale, startX, startY, endPosition, startThickness, endThickness, fill, stroke){
			// summary:
			//		Internal method.
			// tags:
			//		private
			var gp = [startX, startY, endPosition, startY, endPosition, startY + endThickness, startX, startY + startThickness, startX, startY]
			if(fill && fill.colors){
				// Configure gradient
				fill.x1 = startX;
				fill.y1 = startY;
				fill.x2 = endPosition;
				fill.y2 = startY;
			}
			return group.createPolyline(gp).setFill(fill).setStroke(stroke);
		},

		_defaultVerticalShapeFunc: function(indicator, group, scale, startX, startY, endPosition, startThickness, endThickness, fill, stroke){
			// summary:
			//		Internal method.
			// tags:
			//		private
			var gp = [startX, startY, startX, endPosition, startX + endThickness, endPosition, startX, startY + startThickness, startX, startY]
			if(fill && fill.colors){
				// Configure gradient
				fill.x1 = startX;
				fill.y1 = startY;
				fill.x2 = startX;
				fill.y2 = endPosition;
			}
			return group.createPolyline(gp).setFill(fill).setStroke(stroke);
		},
				
		_shapeFunc: function(indicator, group, scale, startX, startY, endPosition, startThickness, endThickness, fill, stroke){
			// summary:
			//		Internal method.
			// tags:
			//		private
			if(this.scale._gauge.orientation == "horizontal"){
				this._defaultHorizontalShapeFunc(indicator, group, scale, startX, startY, endPosition, startThickness, endThickness, fill, stroke);
			}else{
				this._defaultVerticalShapeFunc(indicator, group, scale, startX, startY, endPosition, startThickness, endThickness, fill, stroke);
			}
		},
		
		refreshRendering: function(){
			this.inherited(arguments);
			
			if(this._gfxGroup == null || this.scale == null){
				return;
			}
			// gets position corresponding to the values
			var spos = this.scale.positionForValue(this.start);
			var v = isNaN(this._transitionValue) ? this.value : this._transitionValue;
			var pos = this.scale.positionForValue(v);
			this._gfxGroup.clear();
			
			var startX;
			var startY;
			var endPosition;
			if(this.scale._gauge.orientation == "horizontal"){
				startX = spos;
				startY = this.paddingTop;
				endPosition = pos;
			}else{
				startX = this.paddingLeft;
				startY = spos;
				endPosition = pos;
			}
			this._shapeFunc(this, this._gfxGroup, this.scale, startX, startY, endPosition, this.startThickness, this.endThickness, this.fill, this.stroke);
		},

		_onMouseDown: function(event){
			// summary:
			//		Internal method.
			// tags:
			//		private
			this.inherited(arguments);

			var np = domGeom.position(this.scale._gauge.domNode, true);
			this.set("value", this.scale.valueForPosition({x: event.pageX - np.x, y: event.pageY - np.y}));

			// prevent the browser from selecting text
			eventUtil.stop(event);
		},
		
		_onMouseMove: function(event){
			// summary:
			//		Internal method.
			// tags:
			//		private
			this.inherited(arguments);
			
			var np = domGeom.position(this.scale._gauge.domNode, true);
			this.set("value", this.scale.valueForPosition({x: event.pageX - np.x, y: event.pageY - np.y}));
		}
	})
});

},
'dojox/dgauges/CircularValueIndicator':function(){
define("dojox/dgauges/CircularValueIndicator", ["dojo/_base/declare", "dojox/gfx", "./ScaleIndicatorBase", "dojo/_base/event"], function(declare, gfx, ScaleIndicatorBase, eventUtil){
	return declare("dojox.dgauges.CircularValueIndicator", ScaleIndicatorBase, {
		// summary:
		//		The circular value indicator, typically used for creating needles.

		indicatorShapeFunc: function(group, indicator){
			// summary:
			//		Draws the indicator. The rotation center is at (0, 0).
			// group: dojox/gfx/Group
			//		A GFX group for drawing. 
			// indicator: dojox/dgauges/IndicatorBase
			//		A reference to this indicator.
			// returns: dojox/gfx/shape.Shape
			//		A GFX shape retrievable using the getIndicatorRenderer method of the associated scale. 
			return group.createLine({
				x1: 0,
				y1: 0,
				x2: 40,
				y2: 0
			}).setStroke({
				color: "black",
				width: 1
			});
		},
		
		refreshRendering: function(){
			this.inherited(arguments);
			var v = isNaN(this._transitionValue) ? this.value : this._transitionValue;
			var angle = this.scale.positionForValue(v);
			
			this._gfxGroup.setTransform([{
				dx: this.scale.originX,
				dy: this.scale.originY
			}, gfx.matrix.rotateg(angle)]);
		},
		
		_onMouseDown: function(event){
			// summary:
			//		Internal method.
			// tags:
			//		private
			this.inherited(arguments);
			var origin = this.scale._gauge._gaugeToPage(this.scale.originX, this.scale.originY);
			var angle = ((Math.atan2(event.pageY - origin.y, event.pageX - origin.x)) * 180) / (Math.PI);
			this.set("value", this.scale.valueForPosition(angle));

			// prevent the browser from selecting text
			eventUtil.stop(event);
		},
		
		_onMouseMove: function(event){
			// summary:
			//		Internal method.
			// tags:
			//		private
			this.inherited(arguments);
			var origin = this.scale._gauge._gaugeToPage(this.scale.originX, this.scale.originY);
			var angle = ((Math.atan2(event.pageY - origin.y, event.pageX - origin.x)) * 180) / (Math.PI);
			this.set("value", this.scale.valueForPosition(angle));
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
'dojox/dgauges/components/DefaultPropertiesMixin':function(){
define("dojox/dgauges/components/DefaultPropertiesMixin", ["dojo/_base/declare", "dojo/_base/Color"], function(declare, Color){
	return declare("dojox.dgauges.components.DefaultPropertiesMixin", null, {
		// summary:
		//		This class defines default properties of predefined gauges.

		// minimum: Number
		//		The minimum value of the scaler. Default is 0.
		minimum: 0,
		// maximum: Number
		//		The maximum value of the scaler. Default is 100.
		maximum: 100,
		// snapInterval:
		//		Specifies the increment value to be used as snap values on this scale 
		//		during user interaction.
		//		Default is 1.
		snapInterval: 1,
		// majorTickInterval: Number
		//		The interval between two major ticks.
		majorTickInterval: NaN,
		// minorTickInterval: Number
		//		The interval between two minor ticks.
		minorTickInterval: NaN,
		// minorTicksEnabled: Boolean
		//		If false, minor ticks are not generated. Default is true.
		minorTicksEnabled: true,

		// summary:
		//		The value of the indicator. Default is 0.
		value: 0,
		
		// interactionArea: String
		//		How to interact with the indicator using mouse or touch interactions.
		//		Can be "indicator", "gauge" or "none". The default value is "gauge".
		//		If set to "indicator", the indicator shape reacts to mouse and touch events.
		//		If set to "gauge", the whole gauge reacts to mouse and touch events.
		//		If "none", interactions are disabled.
		interactionArea: "gauge",

		// interactionMode: String
		//		Can be "mouse" or "touch".
		interactionMode: "mouse",

		// animationDuration: Number
		//		The duration of the value change animation in milliseconds. Default is 0.
		//		The animation occurs on both user interactions and programmatic value changes.
		//		Set this property to 0 to disable animation.
		animationDuration: 0,

		_setMinimumAttr: function(v){
			this.getElement("scale").scaler.minimum = v;
		},
		_setMaximumAttr: function(v){
			this.getElement("scale").scaler.maximum = v;
		},
		_setSnapIntervalAttr: function(v){
			this.getElement("scale").scaler.snapInterval = v;
		},
		_setMajorTickIntervalAttr: function(v){
			this.getElement("scale").scaler.majorTickInterval = v;
		},
		_setMinorTickIntervalAttr: function(v){
			this.getElement("scale").scaler.minorTickInterval = v;
		},
		_setMinorTicksEnabledAttr: function(v){
			this.getElement("scale").scaler.minorTicksEnabled = v;
		},
		_setValueAttr: function(v){
			this.getElement("scale").getIndicator("indicator").value = v;
		},
		_setInteractionAreaAttr: function(v){
			this.getElement("scale").getIndicator("indicator").interactionArea = v;
		},
		_setInteractionModeAttr: function(v){
			this.getElement("scale").getIndicator("indicator").interactionMode = v;
		},
		_setAnimationDurationAttr: function(v){
			this.getElement("scale").getIndicator("indicator").animationDuration = v;
		},
		_setBorderColorAttr: function(v){
			this.borderColor = new Color(v);
			this.invalidateRendering();
		},
		_setFillColorAttr: function(v){
			this.fillColor = new Color(v);
			this.invalidateRendering();
		},
		_setIndicatorColorAttr: function(v){
			this.indicatorColor = new Color(v);
			this.invalidateRendering();
		}
	});
});

},
'dojox/dgauges/RectangularScale':function(){
define("dojox/dgauges/RectangularScale", ["dojo/_base/declare", "dojox/gfx", "./ScaleBase"], function(declare, gfx, ScaleBase){
	return declare("dojox.dgauges.RectangularScale", ScaleBase, {
		// summary:
		//		The rectangular scale. A scaler must be set to use this class.

		// paddingLeft: Number
		//		The left padding.
		paddingLeft: 15,
		// paddingTop: Number
		//		The top padding.
		paddingTop: 12,
		// paddingRight: Number
		//		The right padding.
		paddingRight: 15,
		// paddingBottom: Number
		//		The bottom padding.
		paddingBottom: 0,
		_contentBox: null,		
		constructor: function(){
			this.labelPosition = "leading";
			this.addInvalidatingProperties(["paddingTop", "paddingLeft", "paddingRight", "paddingBottom"]);
		},
		
		positionForValue: function(value){
			// summary:
			//		Transforms a value into a position using the associated scaler.
			// value:
			//		The value to transform.
			// returns: Number
			//		A position in pixels.
			var relativePos = 0;
			var position;
			var spos = 0;
			var length = 0;
			if(this._contentBox){
				if(this._gauge.orientation == "horizontal"){
					spos = this._contentBox.x;
					length = this._contentBox.w;
				}else{
					spos = this._contentBox.y;
					length = this._contentBox.h;
				}
			}
			relativePos = this.scaler.positionForValue(value);
			position = spos + (relativePos * length);
			return position;
		},
		
		valueForPosition: function(pos){
			// summary:
			//		Transforms a position in pixels into a value using the associated scaler.
			// pos:
			//		The position to transform.
			// returns: Number
			//		The value represented by pos. 
			var value = this.scaler.minimum;
			var position = NaN;
			var spos = 0;
			var epos = 0;
			
			if(this._gauge.orientation == "horizontal"){
				position = pos.x;
				spos = this._contentBox.x;
				epos = this._contentBox.x + this._contentBox.w;
			}else{
				position = pos.y;
				spos = this._contentBox.y;
				epos = this._contentBox.y + this._contentBox.h;
			}
			
			if(position <= spos){
				value = this.scaler.minimum;
			}else if(position >= epos){
				value = this.scaler.maximum;
			}else {
				value = this.scaler.valueForPosition((position - spos)/(epos - spos));
			}
			return value;
			
		},
		
		refreshRendering: function(){
			this.inherited(arguments);
			if(!this._gfxGroup || !this.scaler) 
				return;
			
			this._ticksGroup.clear();
			
			// variables for ticks rendering
			var middleBox = this._gauge._layoutInfos.middle;
			
			this._contentBox = {};
			
			this._contentBox.x = middleBox.x + this.paddingLeft;
			this._contentBox.y = middleBox.y + this.paddingTop;
			this._contentBox.w = middleBox.w - (this.paddingLeft + this.paddingRight);
			this._contentBox.h = middleBox.h - (this.paddingBottom + this.paddingTop);
			var renderer;
			
			// variables for tick labels
			var labelText;
			var font = this._getFont();
			
			// Layout ticks
			var allTicks = this.scaler.computeTicks();
			
			for(var i = 0; i < allTicks.length; i++){
				var tickItem = allTicks[i];
				renderer = this.tickShapeFunc(this._ticksGroup, this, tickItem);
				
				if(renderer){
					var a = this.positionForValue(tickItem.value);
					var tickSize = this._gauge._computeBoundingBox(renderer).width;
					
					var x1 = 0, y1 = 0, angle = 0;
					if(this._gauge.orientation == "horizontal"){
						x1 = a;
						y1 = this._contentBox.y;
						angle = 90;
					}else{
						x1 = this._contentBox.x;
						y1 = a;
					}
					
					renderer.setTransform([{
						dx: x1,
						dy: y1
					}, gfx.matrix.rotateg(angle)]);
				}
				
				labelText = this.tickLabelFunc(tickItem);
				
				if(labelText){
					var tbox = gfx._base._getTextBox(labelText, {
						font: gfx.makeFontString(gfx.makeParameters(gfx.defaultFont, font))
					});
					var tw = tbox.w;
					var th = tbox.h;
					var al = "start";
					var xt = x1;
					var yt = y1;
					
					if(this._gauge.orientation == "horizontal"){
						xt = x1;
						if(this.labelPosition == "trailing"){
							yt = y1 + tickSize + this.labelGap + th;
						}else{
							yt = y1 - this.labelGap;
						}
						al = "middle";
					}else{
						if(this.labelPosition == "trailing"){
							xt = x1 + tickSize + this.labelGap;
						}else{
							xt = x1 - this.labelGap - tw;
						}
						yt = y1 + th / 2;
					}
					
					var t = this._ticksGroup.createText({
						x: xt,
						y: yt,
						text: labelText,
						align: al
					});
					t.setFill(font.color ? font.color : "black");
					t.setFont(font);
				}
			}
			
			for(var key in this._indicatorsIndex){
				this._indicatorsRenderers[key] = this._indicatorsIndex[key].invalidateRendering();
			}
		}
	})
});

},
'dojox/dgauges/RectangularValueIndicator':function(){
define("dojox/dgauges/RectangularValueIndicator", ["dojo/_base/declare", "./ScaleIndicatorBase", "dojox/gfx", "dojo/_base/event", "dojo/dom-geometry"],
	function(declare, ScaleIndicatorBase, gfx, eventUtil, domGeom){
	return declare("dojox.dgauges.RectangularValueIndicator", ScaleIndicatorBase, {
		// summary:
		//		The rectangular value indicator, typically used for creating markers or thumbs.

		// paddingLeft: Number
		//		The left padding.
		paddingLeft: 0,
		// paddingTop: Number
		//		The top padding.
		paddingTop: 0,
		// paddingRight: Number
		//		The right padding.
		paddingRight: 0,
		// paddingBottom: Number
		//		The bottom padding.
		paddingBottom: 0,

		
		constructor: function(){
			this.addInvalidatingProperties(["paddingTop", "paddingLeft", "paddingRight", "paddingBottom"]);
		},
		
		indicatorShapeFunc: function(group, indicator){
			// summary:
			//		Draws the indicator.
			// group: dojox/gfx/Group
			//		A GFX group for drawing. The indicator is always centered horizontally and is
			//		automatically rotated if the scale is vertical.
			// indicator: dojox/dgauges/IndicatorBase
			//		A reference to this indicator.
			// returns: dojox/gfx/shape.Shape
			//		A GFX shape retrievable using the getIndicatorRenderer method of the associated scale. 
			return group.createPolyline([0, 0, 10, 0, 0, 10, -10, 0, 0, 0]).setStroke({
					color: "black",
					width: 1
				});
		},
				
		refreshRendering: function(){
			this.inherited(arguments);

			// get position corresponding to the value
			var v = isNaN(this._transitionValue) ? this.value : this._transitionValue;
			var pos = this.scale.positionForValue(v);
			
			// computes offsets to move the indicator
			var dx = 0, dy = 0;
			var angle = 0;
			if(this.scale._gauge.orientation == "horizontal"){
				dx = pos;
				dy = this.paddingTop;
			}else{
				dx = this.paddingLeft;
				dy = pos;
				angle = 90;
			}
			
			// translate the indicator
			
			this._gfxGroup.setTransform([{
				dx: dx,
				dy: dy
			}, gfx.matrix.rotateg(angle)]);
		},
		
		_onMouseDown: function(event){
			// summary:
			//		Internal method.
			// tags:
			//		private
			this.inherited(arguments);
			var np = domGeom.position(this.scale._gauge.domNode, true);
			this.set("value", this.scale.valueForPosition({x: event.pageX - np.x, y: event.pageY - np.y}));

			// prevent the browser from selecting text
			eventUtil.stop(event);
		},
		
		_onMouseMove: function(event){
			// summary:
			//		Internal method.
			// tags:
			//		private
			this.inherited(arguments);
			
			var np = domGeom.position(this.scale._gauge.domNode, true);
			this.set("value", this.scale.valueForPosition({x: event.pageX - np.x, y: event.pageY - np.y}));
		}
	})
});

},
'dojox/dgauges/components/default/CircularLinearGauge':function(){
define("dojox/dgauges/components/default/CircularLinearGauge", [
		"dojo/_base/lang", 
		"dojo/_base/declare", 
		"dojo/_base/Color", 
		"../utils",
		"../../CircularGauge", 
		"../../LinearScaler", 
		"../../CircularScale", 
		"../../CircularValueIndicator",
		"../../TextIndicator",
		"../DefaultPropertiesMixin"
	], 
	function(lang, declare, Color, utils, CircularGauge, LinearScaler, CircularScale, CircularValueIndicator, TextIndicator, DefaultPropertiesMixin){
	return declare("dojox.dgauges.components.default.CircularLinearGauge", [CircularGauge, DefaultPropertiesMixin], {
		// summary:
		//		A circular gauge widget.

		// _radius: Number
		_radius: 100,
		// borderColor: Object|Array|int
		//		The border color. Default is "#C9DFF2".
		borderColor: "#C9DFF2",
		// fillColor: Object|Array|int
		//		The background color. Default is "#FCFCFF".
		fillColor: "#FCFCFF",
		// indicatorColor: Object|Array|int
		//		The indicator fill color. Default is "#F01E28".
		indicatorColor: "#F01E28",
		constructor: function(){
			
			// Base colors
			this.borderColor = new Color(this.borderColor);
			this.fillColor = new Color(this.fillColor);
			this.indicatorColor = new Color(this.indicatorColor);

			// Draw background
			this.addElement("background", lang.hitch(this, this.drawBackground));
			
			// Scaler
			var scaler = new LinearScaler();
			
			// Scale
			var scale = new CircularScale();
			scale.set("scaler", scaler);
			this.addElement("scale", scale);
			
			// Value indicator
			var indicator = new CircularValueIndicator();
			scale.addIndicator("indicator", indicator);
			
			// Gauge Foreground (needle cap)
			this.addElement("foreground", lang.hitch(this, this.drawForeground));
			
			// Indicator Text
			var indicatorText = new TextIndicator();
			indicatorText.set("indicator", indicator);
			indicatorText.set("x", 100);
			indicatorText.set("y", 150);
			this.addElement("indicatorText", indicatorText);
			
			utils.genericCircularGauge(scale, indicator, this._radius, this._radius, 0.65 * this._radius, 130, 50, null, null, "outside");
		},
		
		drawBackground: function(g){
			// summary:
			//		Draws the background shape of the gauge.
			// g: dojox/gfx/Group
			//		The group used to draw the background. 
			// tags:
			//		protected
			var r = this._radius;
			var w = 2 * r;
			var h = w;
			var entries = utils.createGradient([0, utils.brightness(this.borderColor, 70), 1, utils.brightness(this.borderColor, -40)]);
			g.createEllipse({
				cx: r,
				cy: r,
				rx: r,
				ry: r
			}).setFill(lang.mixin({
				type: "linear",
				x1: w,
				y1: 0,
				x2: 0,
				y2: h
			}, entries)).setStroke({
				color: "#A5A5A5",
				width: 0.2
			});
			
			entries = utils.createGradient([0, utils.brightness(this.borderColor, 70), 1, utils.brightness(this.borderColor, -50)]);
			g.createEllipse({
				cx: r,
				cy: r,
				rx: r * 0.99,
				ry: r * 0.99
			}).setFill(lang.mixin({
				type: "linear",
				x1: 0,
				y1: 0,
				x2: w,
				y2: h
			}, entries));
			
			entries = utils.createGradient([0, utils.brightness(this.borderColor, 60), 1, utils.brightness(this.borderColor, -40)]);
			g.createEllipse({
				cx: r,
				cy: r,
				rx: r * 0.92,
				ry: r * 0.92
			}).setFill(lang.mixin({
				type: "linear",
				x1: 0,
				y1: 0,
				x2: w,
				y2: h
			}, entries));
			
			entries = utils.createGradient([0, utils.brightness(this.borderColor, 70), 1, utils.brightness(this.borderColor, -40)]);
			g.createEllipse({
				cx: r,
				cy: r,
				rx: r * 0.9,
				ry: r * 0.9
			}).setFill(lang.mixin({
				type: "linear",
				x1: w,
				y1: 0,
				x2: 0,
				y2: h
			}, entries));
			
			entries = utils.createGradient([0, [255, 255, 255, 220], 0.8, utils.brightness(this.fillColor, -5), 1, utils.brightness(this.fillColor, -30)]);
			g.createEllipse({
				cx: r,
				cy: r,
				rx: r * 0.9,
				ry: r * 0.9
			}).setFill(lang.mixin({
				type: "radial",
				cx: r,
				cy: r,
				r: r
			}, entries)).setStroke({
				color: utils.brightness(this.fillColor, -40),
				width: 0.4
			});
			
		},
		
		drawForeground: function(g){
			// summary:
			//		Draws the foreground shape of the gauge.
			// g: dojox/gfx/Group
			//		The group used to draw the foreground. 
			// tags:
			//		protected
			var r = 0.07 * this._radius;
			var entries = utils.createGradient([0, this.borderColor, 1, utils.brightness(this.borderColor, -20)]);
			g.createEllipse({
				cx: this._radius,
				cy: this._radius,
				rx: r,
				ry: r
			}).setFill(lang.mixin({
				type: "radial",
				cx: 0.96 * this._radius,
				cy: 0.96 * this._radius,
				r: r
			}, entries)).setStroke({
				color: utils.brightness(this.fillColor, -50),
				width: 0.4
			});
		}
	});
});

},
'dojox/dgauges/IndicatorBase':function(){
define("dojox/dgauges/IndicatorBase", ["dojo/_base/declare", "dojox/widget/_Invalidating"], function(declare, _Invalidating){
	return declare("dojox.dgauges.IndicatorBase", _Invalidating, {
		// summary:
		//		The base class for indicators. Basically, an indicator is used to render a value.

		// value: Number
		//		The value of this indicator.
		value: null
	});
});

},
'dojox/dgauges/CircularScale':function(){
define("dojox/dgauges/CircularScale", ["dojo/_base/declare", "dojox/gfx", "./ScaleBase", "./_circularUtils"], function(declare, gfx, ScaleBase, _circularUtils){
	return declare("dojox.dgauges.CircularScale", ScaleBase, {
		// summary:
		//		The circular scale. A scaler must be set to use this class.

		// originX: Number
		//		The origin x-coordinate of the scale in pixels.
		originX: 50,
		// originY: Number
		//		The origin y-coordinate of the scale in pixels.
		originY: 50,
		// radius: Number
		//		The outer radius in pixels of the scale.
		radius: 50,
		// startAngle: Number
		//		The start angle of the scale in degrees.
		startAngle: 0,
		// endAngle: Number
		//		The end angle of the scale in degrees.
		endAngle: 180,
		// orientation: String
		//		The orientation of the scale. Can be "clockwise" or "cclockwise".
		//		The default value is "clockwise".
		orientation: "clockwise",
		
		constructor: function(){

			this.labelPosition = "inside";
			
			this.addInvalidatingProperties(["originX", "originY", "radius", "startAngle", "endAngle", "orientation"]);
		},
		
		_getOrientationNum: function(){
			// summary:
			//		Internal method.
			// tags:
			//		private
			return this.orientation == "cclockwise" ? -1 : 1;
		},
		
		positionForValue: function(/* Number */value){
			// summary:
			//		Transforms a value into an angle using the associated scaler.
			// returns: Number
			//		An angle in degrees.
			var totalAngle = _circularUtils.computeTotalAngle(this.startAngle, this.endAngle, this.orientation);
			var relativePos = this.scaler.positionForValue(value);
			return _circularUtils.modAngle(this.startAngle + this._getOrientationNum() * totalAngle * relativePos, 360);
		},
		
		_positionForTickItem: function(tickItem){
			// summary:
			//		Internal method.
			// tags:
			//		private
			var totalAngle = _circularUtils.computeTotalAngle(this.startAngle, this.endAngle, this.orientation);
			return _circularUtils.modAngle(this.startAngle + this._getOrientationNum() * totalAngle * tickItem.position, 360);
		},
		
		valueForPosition: function(/* Number */angle){
			// summary:
			//		Transforms an angle in degrees into a value using the associated scaler.
			// returns: Number
			//		The value represented by angle. 
			if(!this.positionInRange(angle)){
				var min1 = _circularUtils.modAngle(this.startAngle - angle, 360);
				var min2 = 360 - min1;
				var max1 = _circularUtils.modAngle(this.endAngle - angle, 360);
				var max2 = 360 - max1;
				var pos;
				if(Math.min(min1, min2) < Math.min(max1, max2)){
					pos = 0;
				}else{
					pos = 1;
				}
			}else{
				var relativeAngle = _circularUtils.modAngle(this._getOrientationNum() * (angle - this.startAngle), 360);
				var totalAngle = _circularUtils.computeTotalAngle(this.startAngle, this.endAngle, this.orientation);
				pos = relativeAngle / totalAngle;
			}
			return this.scaler.valueForPosition(pos);
		},
		
		positionInRange: function(/* Number */value){
			// summary:
			//		Returns true if the value parameter is between the accepted scale positions.
			// returns: Boolean
			//		True if the value parameter is between the accepted scale positions.
			if(this.startAngle == this.endAngle){
				return true;
			}
			value = _circularUtils.modAngle(value, 360);
			if(this._getOrientationNum() == 1){
				if(this.startAngle < this.endAngle){
					return value >= this.startAngle && value <= this.endAngle;
				}else{
					return !(value > this.endAngle && value < this.startAngle);
				}
			}else{
				if(this.startAngle < this.endAngle){
					return !(value > this.startAngle && value < this.endAngle);
				}else{
					return value >= this.endAngle && value <= this.startAngle;
				}
			}
		},
		
		_distance: function(x1, y1, x2, y2){
			// summary:
			//		Internal method.
			// tags:
			//		private
			return Math.sqrt((x2 - x1) * (x2 - x1) + (y2 - y1) * (y2 - y1));
		},
		
		_layoutLabel: function(label, txt, ox, oy, lrad, angle, labelPlacement){
			// summary:
			//		Internal method.
			// tags:
			//		private
			var font = this._getFont();
			var box = gfx._base._getTextBox(txt, {
				font: gfx.makeFontString(gfx.makeParameters(gfx.defaultFont, font))
			});
			var tw = box.w;
			var fz = font.size;
			var th = gfx.normalizedLength(fz);
			
			var tfx = ox + Math.cos(angle) * lrad - tw / 2;
			var tfy = oy - Math.sin(angle) * lrad - th / 2;
			var side;
			
			var intersections = [];
			
			// Intersection with top segment
			side = tfx;
			var ipx = side;
			var ipy = -Math.tan(angle) * side + oy + Math.tan(angle) * ox;
			// Verify if intersection is on segment
			if(ipy >= tfy && ipy <= tfy + th){
				intersections.push({
					x: ipx,
					y: ipy
				});
			}
			
			// Intersection with bottom segment
			side = tfx + tw;
			ipx = side;
			ipy = -Math.tan(angle) * side + oy + Math.tan(angle) * ox;
			// Verify if intersection is on segment
			if(ipy >= tfy && ipy <= tfy + th){
				intersections.push({
					x: ipx,
					y: ipy
				});
			}
			// Intersection with left segment
			side = tfy;
			ipx = -1 / Math.tan(angle) * side + ox + 1 / Math.tan(angle) * oy;
			ipy = side;
			// Verify if intersection is on segment
			if(ipx >= tfx && ipx <= tfx + tw){
				intersections.push({
					x: ipx,
					y: ipy
				});
			}
			// Intersection with right segment
			side = tfy + th;
			ipx = -1 / Math.tan(angle) * side + ox + 1 / Math.tan(angle) * oy;
			ipy = side;
			// Verify if intersection is on segment
			if(ipx >= tfx && ipx <= tfx + tw){
				intersections.push({
					x: ipx,
					y: ipy
				});
			}
			var dif;
			if(labelPlacement == "inside"){
				for(var it = 0; it < intersections.length; it++){
					var ip = intersections[it];
					dif = this._distance(ip.x, ip.y, ox, oy) - lrad;
					if(dif >= 0){
						// Place reference intersection point on reference circle
						tfx = ox + Math.cos(angle) * (lrad - dif) - tw / 2;
						tfy = oy - Math.sin(angle) * (lrad - dif) - th / 2;
						break;
					}
				}
			}else{// "outside" placement
				for(it = 0; it < intersections.length; it++){
					ip = intersections[it];
					dif = this._distance(ip.x, ip.y, ox, oy) - lrad;
					if(dif <= 0){
						// Place reference intersection point on reference circle
						tfx = ox + Math.cos(angle) * (lrad - dif) - tw / 2;
						tfy = oy - Math.sin(angle) * (lrad - dif) - th / 2;
						
						break;
					}
				}
			}
			if(label){
				label.setTransform([{
					dx: tfx + tw / 2,
					dy: tfy + th
				}]);
			}
		},
		
		refreshRendering: function(){
			this.inherited(arguments);
			if(!this._gfxGroup || !this.scaler){
				return;
			}
			
			// Normalize angles
			this.startAngle = _circularUtils.modAngle(this.startAngle, 360);
			this.endAngle = _circularUtils.modAngle(this.endAngle, 360);
			
			this._ticksGroup.clear();
			
			var renderer;
			var label;
			var labelText;
			
			// Layout ticks
			var allTicks = this.scaler.computeTicks();
			
			var tickBB;
			for(var i = 0; i < allTicks.length; i++){
				var tickItem = allTicks[i];
				renderer = this.tickShapeFunc(this._ticksGroup, this, tickItem);
				
				tickBB = this._gauge._computeBoundingBox(renderer);
				var a;
				if(tickItem.position){
					a = this._positionForTickItem(tickItem);
				}else{
					a = this.positionForValue(tickItem.value);
				}
				if(renderer){
					renderer.setTransform([{
						dx: this.originX,
						dy: this.originY
					}, gfx.matrix.rotateg(a), {
						dx: this.radius - tickBB.width - 2 * tickBB.x,
						dy: 0
					}]);
				}
				labelText = this.tickLabelFunc(tickItem);
				if(labelText){
					label = this._ticksGroup.createText({
						x: 0,
						y: 0,
						text: labelText,
						align: "middle"
					}).setFont(this._getFont()).setFill(this._getFont().color ? this._getFont().color : "black");
					var rad = this.radius;
					if(this.labelPosition == "inside"){
						rad -= (tickBB.width + this.labelGap);
					}else{
						rad += this.labelGap;
					}
					this._layoutLabel(label, labelText, this.originX, this.originY, rad, _circularUtils.toRadians(360 - a), this.labelPosition);
				}
			}
			
			for(var key in this._indicatorsIndex){
				this._indicatorsRenderers[key] = this._indicatorsIndex[key].invalidateRendering();
			}
		}
	});
});

},
'dojox/dgauges/RectangularGauge':function(){
define("dojox/dgauges/RectangularGauge", ["dojo/_base/declare", "./GaugeBase", "dojox/gfx/matrix"], function(declare, GaugeBase, matrix){
	return declare("dojox.dgauges.RectangularGauge", GaugeBase, {
		// summary:
		//		The base class for rectangular gauges.
		//		You can create custom horizontal or vertical gauges by extending this class.
		//		See dojox/dgauges/components/default/HorinzontalLinearGauge.js for an example of rectangular gauge.

		// orientation: "horizontal"|"vertical"
		//		The orientation of the gauge. Default is "horizontal".	
		orientation: "horizontal",
		
		// leading, middle and trailing graphical parts
		_middleParts: null,
		_leadingParts: null,
		_trailingParts: null,
		_baseParts: null,
		_classParts: null,
		_layoutInfos: {},
		constructor: function(){
		
			this.orientation = "horizontal";
			
			this._middleParts = [];
			this._leadingParts = [];
			this._trailingParts = [];
			this._baseParts = [];
			this._classParts = [];
			
			this._layoutInfos = {
				leading: {
					x: 0,
					y: 0,
					w: 0,
					h: 0
				},
				middle: {
					x: 0,
					y: 0,
					w: 0,
					h: 0
				},
				trailing: {
					x: 0,
					y: 0,
					w: 0,
					h: 0
				}
			};
			this.addInvalidatingProperties(["orientation"]);
			
		},
		
		addElement: function(name, element, location){
			// summary:
			//		Adds a element to the gauge.
			// name: String
			//		The name of the element to be added.
			// element: Object
			//		This parameter can be:
			//		- A function which takes on argument of type GFX Group and return null or a
			//		GFX element retrievable using the getElementRenderer() method.
			//		- A Scale instance, i.e. CircularScale or RectangularScale.
			//		- A TextIndicator instance.
			// location: String
			//		The area to place the element. Valid values are "leading"|"middle"|"trailing". Leading and trailing areas are fixed size. The
			//		middle area use the remaining size. If not specified, the element's refreshRendering 
			//		is called with the whole gauge size as argument.

			this.inherited(arguments);
			
			var obj = this._elements[this._elements.length - 1];
			
			if(location == "middle"){
				this._middleParts.push(obj);
			}else if(location == "leading"){
				this._leadingParts.push(obj);
			}else if(location == "trailing"){
				this._trailingParts.push(obj);
			}else{
				if(obj._isGFX){
					this._baseParts.push(obj);
				}else{
					this._classParts.push(obj);
				}
			}
		},
		
		removeElement: function(name){
			// summary:
			//		Remove the element defined by name from the gauge.
			// name: String
			//		The name of the element as defined using addElement.
			// returns: Object
			//		A reference to the removed element.		
			var obj = this.getElement(name);
			if(obj){
				if(this._middleParts && this._middleParts.indexOf(obj) >= 0){
					this._middleParts.splice(this._middleParts.indexOf(obj), 1);
				}else if(this._leadingParts && this._leadingParts.indexOf(obj) >= 0){
					this._leadingParts.splice(this._leadingParts.indexOf(obj), 1);
				}else if(this._trailingParts && this._trailingParts.indexOf(obj) >= 0){
					this._trailingParts.splice(this._trailingParts.indexOf(obj), 1);
				}else if(this._baseParts && this._baseParts.indexOf(obj) >= 0){
					this._baseParts.splice(this._baseParts.indexOf(obj), 1);
				}else if(this._classParts && this._classParts.indexOf(obj) >= 0){
					this._classParts.splice(this._classParts.indexOf(obj), 1);
				}
			}
			
			this.inherited(arguments);
		},
		
		_computeArrayBoundingBox: function(elements){
			// summary:
			//		Internal method.
			// tags:
			//		private
			if(elements.length == 0){
				return {
					x: 0,
					y: 0,
					w: 0,
					h: 0
				};
			}
			var res = {
				x: -Infinity,
				y: -Infinity,
				w: 0,
				h: 0
			};
			var bbox = null;
			for(var i = 0; i < elements.length; i++){
				bbox = this._computeBoundingBox(elements[i]._gfxGroup);
				if(!bbox){
					continue;
				}
				if(res.x < bbox.x){
					res.x = bbox.x;
				}
				if(res.w < bbox.width){
					res.w = bbox.width;
				}
				if(res.y < bbox.y){
					res.y = bbox.y;
				}
				if(res.h < bbox.height){
					res.h = bbox.height;
				}
			}
			if(res.x == -Infinity){
				res.x = 0;
			}
			if(res.y == -Infinity){
				res.y = 0;
			}
			
			return res;
		},
		
		refreshRendering: function(){
			if(this._widgetBox.w <= 0 || this._widgetBox.h <= 0){
				return;
			}
			var i;
			if(this._baseParts){
				for(i = 0; i < this._baseParts.length; i++){
					this._baseParts[i].width = this._widgetBox.w;
					this._baseParts[i].height = this._widgetBox.h;
					this._elementsRenderers[this._baseParts[i]._name] = this._baseParts[i].refreshRendering();
				}
			}
			
			if(this._leadingParts){
				for(i = 0; i < this._leadingParts.length; i++){
					this._elementsRenderers[this._leadingParts[i]._name] = this._leadingParts[i].refreshRendering();
				}
			}
			
			if(this._trailingParts){
				for(i = 0; i < this._trailingParts.length; i++){
					this._elementsRenderers[this._trailingParts[i]._name] = this._trailingParts[i].refreshRendering();
				}
			}
			
			var leadingBoundingBox = this._computeArrayBoundingBox(this._leadingParts);
			var trailingBoundingBox = this._computeArrayBoundingBox(this._trailingParts);
			var middleBoundingBox = {};
			
			if(this.orientation == "horizontal"){
				middleBoundingBox.x = leadingBoundingBox.x + leadingBoundingBox.w;
				middleBoundingBox.y = 0;
				middleBoundingBox.w = this._widgetBox.w - leadingBoundingBox.w - trailingBoundingBox.w;
				middleBoundingBox.h = this._widgetBox.h;
			}else{
				middleBoundingBox.x = 0;
				middleBoundingBox.y = leadingBoundingBox.y + leadingBoundingBox.h;
				middleBoundingBox.w = this._widgetBox.w; 
				middleBoundingBox.h = this._widgetBox.h - leadingBoundingBox.h - trailingBoundingBox.h;
			}
			
			this._layoutInfos = {
				leading: leadingBoundingBox,
				middle: middleBoundingBox,
				trailing: trailingBoundingBox
			};
			
			// translates middle part
			for(i = 0; i < this._middleParts.length; i++){
				this._middleParts[i]._gfxGroup.setTransform([matrix.translate(middleBoundingBox.x, middleBoundingBox.y)]);
			}
			
			// translates trailing part
			if(this._trailingParts){
				for(i = 0; i < this._trailingParts.length; i++){
					this._trailingParts[i]._gfxGroup.setTransform(matrix.translate(this._widgetBox.w - trailingBoundingBox.w, 0));
				}
			}
			
			// Render remaining elements (scales, ...)
			for(i = 0; i < this._classParts.length; i++){
				this._elementsRenderers[this._classParts[i]._name] = this._classParts[i].refreshRendering();
			}
		}
	})
});

},
'dojox/dgauges/MultiLinearScaler':function(){
define("dojox/dgauges/MultiLinearScaler", ["dojo/_base/declare", "dojo/Stateful"], function(declare, Stateful){
	return declare("dojox.dgauges.MultiLinearScaler", Stateful, {
		// summary:
		//		The multi-linear scaler. This scaler maps numeric values according 
		//		to the majorTickValues content. 
		//		This allows display of very large value intervals that are difficult to render 
		//		with a linear scale. For example, if majorTickValues contains [0, 10, 50, 500, 2000], 
		//		the scale will show five major ticks with these values. 
		//		Note that this is not a logarithmic scale, the interpolation is linear between 
		//		two contiguous major ticks.
		//		Scalers are responsible for tick generation and various data-transform operations.	

		// majorTickValues: Array
		//		An array of Number for creating major ticks.
		//		This array must be sorted in ascendant order.
		majorTickValues: null,
		// minorTickCount: Array
		//		The number of minor ticks between two contiguous major ticks.
		//		The default value is 4.
		minorTickCount: 4,
		// majorTicks:
		//		The array of generated major ticks. You should not set this
		//		property when using the scaler.
		majorTicks: null,
		// minorTicks:
		//		The array of generated minor ticks. You should not set this
		//		property when using the scaler.
		minorTicks: null,
		_snapIntervalPrecision: null,
		_snapCount: 4,
		_snapIntervalPrecision: 6,
		
		constructor: function(){
			this.watchedProperties = ["majorTickValues", "snapCount", "minorTickCount"];
		},
				
		computeTicks: function(){
			// summary:
			//		Creates or re-creates the ticks for this scaler.
			// returns: Array
			//		An array containing all ticks (major then minor ticks).			
			this.majorTicks = [];
			this.minorTicks = [];
			var ti;
			var step = 1 / (this.majorTickValues.length - 1);
			var minorStep = step / (this.minorTickCount + 1);
			var currentIndex = 0;
			var minorInterval;
			var currentMajorValue;
			var v;
			for(var i = 0; i < this.majorTickValues.length; i++){
				v = this.majorTickValues[i];
				ti = {scaler: this};
				ti.position = currentIndex * step;
				ti.value = v;
				ti.isMinor = false;
				this.majorTicks.push(ti);
				if(currentIndex < this.majorTickValues.length - 1){
					currentMajorValue = Number(v);
					minorInterval = (Number(this.majorTickValues[i + 1]) - currentMajorValue) / (this.minorTickCount + 1);
					for(var j = 1; j <= this.minorTickCount; j++){
						ti = {scaler: this};
						ti.isMinor = true;
						ti.position = currentIndex * step + j * minorStep;
						ti.value = currentMajorValue + minorInterval * j;
						this.minorTicks.push(ti);
					}
				}
				currentIndex++;
			}
			return this.majorTicks.concat(this.minorTicks);
		},
		
		positionForValue: function(value){
			// summary:
			//		Transforms a value into a relative position between 0 and 1.
			// value: Number
			//		A value to transform.
			// returns: Number
			//		The position between 0 and 1.			
			if(!this.majorTickValues){
				return 0;
			}
			
			if(!this.majorTicks){
				this.computeTicks();
			}
			
			var minmax = this._getMinMax(value);
			var position = (value - minmax[0].value) / (minmax[1].value - minmax[0].value);
			return minmax[0].position + position * (minmax[1].position - minmax[0].position);
		},
		
		valueForPosition: function(position){
			// summary:
			//		Transforms a relative position (between 0 and 1) into a value.
			// position: Number
			//		A relative position to transform.
			// returns: Number
			//		The transformed value.
			if(this.majorTicks == null){
				return 0;
			}
			var minmax = this._getMinMax(position, "position");
			var value = (position - minmax[0].position) / (minmax[1].position - minmax[0].position);
			return minmax[0].value + value * (minmax[1].value - minmax[0].value);
		},
		
		_getMinMax: function(v, property){
			// summary:
			//		Internal method.
			// tags:
			//		private
			if(!property){
				property = "value";
			}
			var res = [];
			var pre;
			var post;
			var left = 0;
			var right = this.majorTicks.length - 1;
			var center;
			
			if(v <= this.majorTicks[0][property] || v >= this.majorTicks[right][property]){
				res[0] = this.majorTicks[0];
				res[1] = this.majorTicks[right];
				return res;
			}
			
			while (true){
				center = Math.floor((left + right) / 2);
				
				if(this.majorTicks[center][property] <= v){
					if(this.majorTicks[center + 1][property] >= v){
						res[0] = this.majorTicks[center];
						res[1] = this.majorTicks[center + 1];
						return res;
					}else{
						left = center + 1;
						continue;
					}
				}else{
					right = center;
					continue;
				}
			}
		}
	});
});

},
'dojox/dgauges/ScaleIndicatorBase':function(){
define("dojox/dgauges/ScaleIndicatorBase", ["dojo/_base/lang", "dojo/_base/declare", "dojo/on", "dojo/_base/connect", "dojo/_base/fx", "dojox/gfx", "dojox/widget/_Invalidating", "./IndicatorBase"],
	function(lang, declare, on, connect, fx, gfx, _Invalidating, IndicatorBase){
	return declare("dojox.dgauges.ScaleIndicatorBase", IndicatorBase, {
		// summary:
		//		The base class for indicators that rely on a scale for their rendering.
		//		Typically, value indicators and range indicators are subclasses of ScaleIndicatorBase.

		// summary:
		//		The scale associated with this indicator.
		scale: null,
		// summary:
		//		The value of the indicator. Default is 0.
		value: 0,
		
		// interactionArea: String
		//		How to interact with the indicator using mouse or touch interactions.
		//		Can be "indicator", "gauge", "area" or "none". The default value is "gauge".
		//		If set to "indicator", the indicator shape reacts to mouse and touch events.
		//		If set to "gauge", the whole gauge reacts to mouse and touch events.
		//		If set to "area", the whole bounding box of the widget reacts to mouse and touch events.
		//		If "none", interactions are disabled.
		interactionArea: "gauge",

		// interactionMode: String
		//		Can be "mouse" or "touch".
		interactionMode: "mouse",

		// animationDuration: Number
		//		The duration of the value change animation in milliseconds. Default is 0.
		//		The animation occurs on both user interactions and programmatic value changes.
		//		Set this property to 0 to disable animation.
		animationDuration: 0,

		// animationEaser: Object
		//		The easer function of the value change animation. Default is fx._defaultEasing.
		animationEaser: null,

		_indicatorShapeFuncFlag: true,
		
		_interactionAreaFlag: true,
		
		_downListeners: null,
		
		_cursorListeners: null,
		
		_moveAndUpListeners: null,
		
		_transitionValue: NaN,
		
		_preventAnimation: false,
		
		_animation: null,
		
		constructor: function(){
		
			// watches changed happening on the "value" property to call this.valueChanged() function which
			// can be listen by user with connect.connect
			this.watch("value", lang.hitch(this, function(){
				this.valueChanged(this);
			}));
			this.watch("value", lang.hitch(this, this._startAnimation));
			
			this.watch("interactionArea", lang.hitch(this, function(){
				this._interactionAreaFlag = true;
			}));
			this.watch("interactionMode", lang.hitch(this, function(){
				this._interactionAreaFlag = true;
			}));
			
			this.watch("indicatorShapeFunc", lang.hitch(this, function(){
				this._indicatorShapeFuncFlag = true;
			}));
			
			this.addInvalidatingProperties(["scale", "value", "indicatorShapeFunc", "interactionArea", "interactionMode"]);
			
			this._downListeners = [];
			this._moveAndUpListeners = [];
			this._cursorListeners = [];
		},
		
		_startAnimation: function(prop, oldValue, newValue){
			// summary:
			//		Internal method.
			// tags:
			//		private
			if(this.animationDuration == 0){
				return;
			}
			if(this._animation && (this._preventAnimation || oldValue == newValue)){
				this._animation.stop();
				return;
			}
			this._animation = new fx.Animation({curve: [oldValue, newValue], 
										duration: this.animationDuration, 
										easing: this.animationEaser ? this.animationEaser : fx._defaultEasing,
										onAnimate: lang.hitch(this, this._updateAnimation),
										onEnd: lang.hitch(this, this._endAnimation),
										onStop: lang.hitch(this, this._endAnimation)});
			
			this._animation.play();
		},
		
		_updateAnimation: function(v){
			// summary:
			//		Internal method.
			// tags:
			//		private
			this._transitionValue = v;
			this.invalidateRendering();
		},
		
		_endAnimation: function(){
			// summary:
			//		Internal method.
			// tags:
			//		private
			this._transitionValue = NaN; 
			this.invalidateRendering();			
		},
		
		refreshRendering: function(){
			if(this._gfxGroup == null || this.scale == null){
				return;
			}else{
				if(this._indicatorShapeFuncFlag && lang.isFunction(this.indicatorShapeFunc)){
					this._gfxGroup.clear();
					this.indicatorShapeFunc(this._gfxGroup, this);
					this._indicatorShapeFuncFlag = false;
				}
				
				if(this._interactionAreaFlag){
					this._interactionAreaFlag = this._connectDownListeners();
				}
			}
		},
		
		valueChanged: function(indicator){
			// summary:
			//		Invoked when the value of the indicator changes.
			//		User can connect an listener on this function: 
			// |	connect.connect(theIndicator, "valueChanged", lang.hitch(this, function(){
			// |		//do something
			// |	}));
			on.emit(this, "valueChanged", {
				target: this,
				bubbles: true,
				cancelable: true
			});
		},
		
		_disconnectDownListeners: function(){
			// summary:
			//		Internal method.
			// tags:
			//		private
			for(var i = 0; i < this._downListeners.length; i++){
				connect.disconnect(this._downListeners[i]);
			}
			this._downListeners = [];
		},
		
		_disconnectMoveAndUpListeners: function(){
			// summary:
			//		Internal method.
			// tags:
			//		private
			for(var i = 0; i < this._moveAndUpListeners.length; i++){
				connect.disconnect(this._moveAndUpListeners[i]);
			}
			this._moveAndUpListeners = [];
		},
		
		_disconnectListeners: function(){
			// summary:
			//		Internal method.
			// tags:
			//		private
			this._disconnectDownListeners();
			this._disconnectMoveAndUpListeners();
			this._disconnectCursorListeners();
		},
		
		_connectCursorListeners: function(target){
			// summary:
			//		Internal method.
			// tags:
			//		private
			var listener = target.connect("onmouseover", this, function(){
				this.scale._gauge._setCursor("pointer");
			});
			this._cursorListeners.push(listener);
			listener = target.connect("onmouseout", this, function(event){
					this.scale._gauge._setCursor("");
				}
			);
			this._cursorListeners.push(listener);
		},
		
		_disconnectCursorListeners: function(){
			// summary:
			//		Internal method.
			// tags:
			//		private
			for(var i = 0; i < this._cursorListeners.length; i++){
				connect.disconnect(this._cursorListeners[i]);
			}
			this._cursorListeners = [];
		},

		_connectDownListeners: function(){
			// summary:
			//		Internal method.
			// tags:
			//		private
			this._disconnectDownListeners();
			this._disconnectCursorListeners();
			var listener = null;
			var downEventName;
			if(this.interactionMode == "mouse"){
				downEventName = "onmousedown";
			}else if(this.interactionMode == "touch"){
				downEventName = "ontouchstart";
			}
			
			if(this.interactionMode == "mouse" || this.interactionMode == "touch"){
				if(this.interactionArea == "indicator"){
					listener = this._gfxGroup.connect(downEventName, this, this._onMouseDown);
					this._downListeners.push(listener);
					if (this.interactionMode == "mouse") {
						this._connectCursorListeners(this._gfxGroup);
					}
				}else if(this.interactionArea == "gauge"){
					if(!this.scale || !this.scale._gauge || !this.scale._gauge._gfxGroup){
						return true;
					}
					listener = this.scale._gauge._gfxGroup.connect(downEventName, this, this._onMouseDown);
					this._downListeners.push(listener);
					listener = this._gfxGroup.connect(downEventName, this, this._onMouseDown);
					this._downListeners.push(listener);
					if (this.interactionMode == "mouse") {
						this._connectCursorListeners(this.scale._gauge._gfxGroup);
					}
				}else if(this.interactionArea == "area"){
					if(!this.scale || !this.scale._gauge || !this.scale._gauge._baseGroup){
						return true;
					}
					listener = this.scale._gauge._baseGroup.connect(downEventName, this, this._onMouseDown);
					this._downListeners.push(listener);
					listener = this._gfxGroup.connect(downEventName, this, this._onMouseDown);
					this._downListeners.push(listener);
					if (this.interactionMode == "mouse") {
						this._connectCursorListeners(this.scale._gauge._baseGroup);
					}
				}
			}
			return false;
		},
		
		_connectMoveAndUpListeners: function(){
			// summary:
			//		Internal method.
			// tags:
			//		private
			var listener = null;
			var moveEventName;
			var upEventName;
			if(this.interactionMode == "mouse"){
				moveEventName = "onmousemove";
				upEventName = "onmouseup";
			}else if(this.interactionMode == "touch"){
				moveEventName = "ontouchmove";
				upEventName = "ontouchend";
			}
			listener = this.scale._gauge._baseGroup.connect(moveEventName, this, this._onMouseMove);
			this._moveAndUpListeners.push(listener);
			listener = this._gfxGroup.connect(moveEventName, this, this._onMouseMove);
			this._moveAndUpListeners.push(listener);
			
			listener = this.scale._gauge._baseGroup.connect(upEventName, this, this._onMouseUp);
			this._moveAndUpListeners.push(listener);
			listener = this._gfxGroup.connect(upEventName, this, this._onMouseUp);
			this._moveAndUpListeners.push(listener);
		},
		
		_onMouseDown: function(event){
			// summary:
			//		Internal method.
			// tags:
			//		private
			this._connectMoveAndUpListeners();
			this._startEditing();
		},
		
		_onMouseMove: function(event){
			// summary:
			//		Internal method.
			// tags:
			//		private
			this._preventAnimation = true;
			if(this._animation){
				this._animation.stop();
			}
		},
		
		_onMouseUp: function(event){
			// summary:
			//		Internal method.
			// tags:
			//		private
			this._disconnectMoveAndUpListeners();
			this._preventAnimation = false;
			this._endEditing();
		},
		
		_startEditing: function(){
			// summary:
			//		Internal method.
			// tags:
			//		private
			if(!this.scale || !this.scale._gauge){
				return;
			}else{
				this.scale._gauge.onStartEditing({
					indicator: this
				});
			}
		},
		
		_endEditing: function(){
			// summary:
			//		Internal method.
			// tags:
			//		private
			if(!this.scale || !this.scale._gauge){
				return;
			}else{
				this.scale._gauge.onEndEditing({
					indicator: this
				});
			}
		}
		
	});
});

},
'dojox/dgauges/RectangularSegmentedRangeIndicator':function(){
define("dojox/dgauges/RectangularSegmentedRangeIndicator", ["dojo/_base/declare", "dojo/on", "dojox/gfx", "./IndicatorBase"], function(declare, on, gfx, IndicatorBase){
	return declare("dojox.dgauges.RectangularSegmentedRangeIndicator", IndicatorBase, {
		// summary:
		//		A segmented-style range indicator for rectangular gauges.
		//		This class will be replaced by a cleaner implementation in a future version.
		
		start: 0,
		startThickness: 10,
		endThickness: 10,
		fill: null,
		stroke: null,
		paddingLeft: 0,
		paddingTop: 0,
		paddingRight: 0,
		paddingBottom: 0,
		
		// segments: Number
		//		The number of segments making the indicator.
		//		By default it is 10.
		segments: 10,

		// segmentSpacing: Number
		//		The blank space between two segments. The default value is 2
		segmentSpacing: 2,
		
		// rounded: Boolean
		//		Indicates if the extremity segments are rounded.
		//		Default is true.		
		rounded: true,
		
		// ranges: Array
		//		An array containing objects to define color ranges. Example [{color:"#FF0000", size:20}, {color:"#FF8800", size:50}].
		ranges: null,
		
		constructor: function(){
			// summary:
			//		Constructor.
			// description:
			//		Creates a segmented range indicator.
			this.fill = [255, 120, 0];
			this.stroke = {
				color: "black",
				width: .2
			};
			
			this.addInvalidatingProperties(["start", "startThickness", "endThickness", "fill", "stroke","segments","segmentSpacing","ranges"]);
		},

		_defaultHorizontalShapeFunc: function(indicator, group, scale, startX, startY, endPosition, startThickness, endThickness, fill, stroke){
			// summary:
			//		Internal method.
			// tags:
			//		private
			var length = scale._contentBox.w ;
			var shape, i, gp, radius;
			
			if(this.ranges){
				// Configure gradient to represent the ranges
				fill = {type:"linear", colors:[]};
				fill.x1 = startX;
				fill.y1 = startY;
				fill.x2 = startX + length;
				fill.y2 = startY;
				
				var rangeStart = this.start;
				
				for(i = 0; i < this.ranges.length; i++){
					var entry1 = {
						color:this.ranges[i].color,
						offset: scale.scaler.positionForValue(rangeStart)
					};
					var entry2 = {
						color:this.ranges[i].color,
						offset: scale.scaler.positionForValue(rangeStart+this.ranges[i].size)
					};
					fill.colors.push(entry1);
					fill.colors.push(entry2);
					rangeStart += this.ranges[i].size;
				}
			}else if(fill && fill.colors){
				// Configure gradient
				fill.x1 = startX;
				fill.y1 = startY;
				fill.x2 = startX + length;
				fill.y2 = startY;
			}
			
			var x = startX;
			var y = startY;
			var chicklet = (length / this.segments) - this.segmentSpacing;
			var visibleSegments = Math.abs( (endPosition - startX) / (chicklet+this.segmentSpacing) );
			var sw = this.startThickness;
			var inc = (this.endThickness - this.startThickness) /this.segments
			var ew = sw+inc;			
			var remain = visibleSegments - Math.floor(visibleSegments);
			
			for(i = 0; i < Math.floor(visibleSegments); i++){
				var path = group.createPath();
				
				if(i == 0 && this.rounded && (sw/2) < chicklet){ // first segment rounded
					radius = sw/2;
					path.moveTo(x + radius, y);
					path.lineTo(x + chicklet, y);
					path.lineTo(x + chicklet, y + ew);
					path.lineTo(x + radius, y + sw);
					path.arcTo(radius, radius, 0, 0, 1, x + radius, y)
				}else{
					if(i == Math.floor(visibleSegments) - 1 && (remain == 0) && this.rounded && (ew/2) < chicklet){ // last segment rounded
						radius = ew/2;
						path.moveTo(x, y);
						path.lineTo(x + chicklet - radius, y);
						path.arcTo(radius, radius, 0, 0, 1, x + chicklet - radius, y + ew)
						path.lineTo(x, y + sw);
						path.lineTo(x, y);
					}else{
						path.moveTo(x, y);
						path.lineTo(x + chicklet, y);
						path.lineTo(x + chicklet, y + ew);
						path.lineTo(x, y + sw);
						path.lineTo(x, y);
					}
				}
				
				path.setFill(fill).setStroke(stroke);
				sw = ew;
				ew += inc;
				x += chicklet + this.segmentSpacing;
			}
			
			// draw the remaining segment part
			if(remain > 0){
				ew = sw+( (ew-sw)*remain );
				gp = [x, y, x+(chicklet*remain), y, x+(chicklet*remain), y  + ew, x, y + sw, x, y]
				shape = group.createPolyline(gp).setFill(fill).setStroke(stroke);
			}
			
			return shape;
		},

		_defaultVerticalShapeFunc: function(indicator, group, scale, startX, startY, endPosition, startThickness, endThickness, fill, stroke){
			// summary:
			//		Internal method.
			// tags:
			//		private
			var length = scale._contentBox.h ;
			var shape, i,gp,radius;
			if(this.ranges){
				// Configure gradient to represent the ranges
				fill = {type:"linear", colors:[]};				
				fill.x1 = startX;
				fill.y1 = startY;
				fill.x2 = startX;
				fill.y2 = startY + length;
				
				var rangeStart = 0;
				
				for(i = 0; i < this.ranges.length; i++){
					var entry1 = {
						color:this.ranges[i].color,
						offset: scale.scaler.positionForValue(rangeStart)
					};
					var entry2 = {
						color:this.ranges[i].color,
						offset: scale.scaler.positionForValue(rangeStart+this.ranges[i].size)
					};
					fill.colors.push(entry1);
					fill.colors.push(entry2);
					rangeStart += this.ranges[i].size
				}
			}else if(fill && fill.colors){
				// Configure gradient
				fill.x1 = startX;
				fill.y1 = startY;
				fill.x2 = startX;
				fill.y2 = startY + length;
			}
			
			var x = startX;
			var y = startY;
			var chicklet = (length / this.segments) - this.segmentSpacing;
			var visibleSegments = Math.abs( (endPosition - startY) / (chicklet+this.segmentSpacing) );
			var sw = this.startThickness;
			var inc = (this.endThickness - this.startThickness) /this.segments
			var ew = sw+inc;			
			var remain = visibleSegments - Math.floor(visibleSegments);
			
			for(i = 0; i < Math.floor(visibleSegments); i++){
				var path = group.createPath();
				
				if(i == 0 && this.rounded && (sw/2) < chicklet){ // first segment rounded
					radius = sw/2;
					path.moveTo(x , y+ radius);
					path.lineTo(x , y+ chicklet);
					path.lineTo(x + ew, y + chicklet);
					path.lineTo(x + sw, y + radius);
					path.arcTo(radius, radius, 0, 0, 0, x , y+ radius)
				}else{
					if(i == Math.floor(visibleSegments) - 1 && (remain == 0) && this.rounded && (ew/2) < chicklet){ // last segment rounded
						radius = ew/2;
						path.moveTo(x, y);
						path.lineTo(x , y+ chicklet - radius);
						path.arcTo(radius, radius, 0, 0, 0, x + ew, y + chicklet - radius)
						path.lineTo(x+ sw, y );
						path.lineTo(x, y);
					}else{
						path.moveTo(x, y);
						path.lineTo(x , y+ chicklet);
						path.lineTo(x + ew, y + chicklet);
						path.lineTo(x+ sw, y );
						path.lineTo(x, y);
					}
				}

				path.setFill(fill).setStroke(stroke);
				sw = ew;
				ew += inc;
				y += chicklet + this.segmentSpacing;
			}
			
			// draw the remaining segment part
			if(remain > 0){
				ew = sw+( (ew-sw)*remain );
				gp = [x, y, x, y+(chicklet*remain), x+ ew, y+(chicklet*remain), x+ sw, y , x, y];
				shape = group.createPolyline(gp).setFill(fill).setStroke(stroke);
			}
			
			return shape;
		},
				
		indicatorShapeFunc: function(group, indicator, startX, startY, endPosition, startThickness, endThickness, fill, stroke){
			// summary:
			//		Internal method.
			// tags:
			//		private
			
			if(indicator.scale._gauge.orientation == "horizontal"){
				this._defaultHorizontalShapeFunc(indicator, group, indicator.scale, startX, startY, endPosition, startThickness, endThickness, fill, stroke);
			}else{
				this._defaultVerticalShapeFunc(indicator, group, indicator.scale, startX, startY, endPosition, startThickness, endThickness, fill, stroke);
			}
		},
		
		refreshRendering: function(){
		
			if(this._gfxGroup == null || this.scale == null){
				return;
			}
			// gets position corresponding to the values
			var spos = this.scale.positionForValue(this.start);
			var pos = this.scale.positionForValue(this.value);
			this._gfxGroup.clear();
			
			var startX;
			var startY;
			var endPosition;
			if(this.scale._gauge.orientation == "horizontal"){
				startX = spos;
				startY = this.paddingTop;
				endPosition = pos;
			}else{
				startX = this.paddingLeft;
				startY = spos ;
				endPosition = pos;			
			}
			this.indicatorShapeFunc(this._gfxGroup, this, startX, startY, endPosition, this.startThickness, this.endThickness, this.fill, this.stroke);
		}
	})
});

},
'dojox/dgauges/TextIndicator':function(){
define("dojox/dgauges/TextIndicator", ["dojo/_base/lang", "dojo/_base/declare", "dojo/_base/sniff", "dojo/_base/array", "dojo/on", "dojox/gfx", "./IndicatorBase"],
	function(lang, declare, has, array, on, gfx, IndicatorBase){
	return declare("dojox.dgauges.TextIndicator", IndicatorBase, {
		// summary:
		//		This type of indicator is used to render text.
		//		To render an arbitrary text, set the value property.
		//		To render the value of a value indicator or a range indicator, set the indicator property.
		//		Setting the indicator property takes precedence on setting the value property.
		//		When the indicator property is set, the text is automatically updated on value changes.

		// font: Object
		//		Font used by this element.
		font: null,
		// x: Number
		//		The text anchor x-position. Default is 0.
		x: 0,
		// y: Number
		//		The text anchor y-position. Default is 0.
		y: 0,
		// align: String
		//		An alignment of a text in regards to the anchor position:
		//
		//		- "start": A text's baseline starts at the anchor. 
		//		This is the default value of the align attribute.
		//		- "middle": A text's baseline is centered on the anchor point.
		//		- "end": A text's baseline ends at the anchor point.
		align: "middle",
		// color: Object
		//		The color of the text.
		color: "black",
		// indicator: dojox/dgauges/IndicatorBase
		//		If this property is set, the value of the indicator is automatically
		//		rendered by this text element.
		indicator: null,
		// labelFunc: Object
		//		If set, this method allows to format the value of this text indicator.
		//		A label function takes the text to render as argument and returns a String. 
		labelFunc: null,
		
		constructor: function(){
			this.addInvalidatingProperties(["indicator"]);

			var resetProps = ["x", "y", "font", "align", "color", "labelFunc"];
			array.forEach(resetProps, lang.hitch(this, function(entry){
				this.watch(entry, this._resetText);
			}));
			
			this.watch("indicator", lang.hitch(this, this._indicatorChanged));
		},

		postscript: function(mixin){
			// summary:
			//		Internal method
			// tags:
			//		private
			this.inherited(arguments);
			if(mixin && mixin.indicator){
				this._indicatorChanged("indicator", null, mixin.indicator);
			}
		},
		
		_resetText: function(){
			// summary:
			//		Internal method.
			// tags:
			//		private
			this._textCreated = false;
			this.invalidateRendering();
		},
		
		_valueWatcher: null,
		
		_indicatorChanged: function(name, oldValue, newValue){
			// summary:
			//		Internal method.
			// tags:
			//		private
			if(this._valueWatcher){
				this._valueWatcher.unwatch();
			}
			this._valueWatcher = newValue.watch("value", lang.hitch(this, this.refreshRendering));
		},
		
		_getFont: function(){
			// summary:
			//		Internal method.
			// tags:
			//		private
			var font = this.font;
			if(!font && this._gauge){
				font = this._gauge.font;
			}
			if(!font){
				font = gfx.defaultFont;
			}
			return font;
		},
		
		_textCreated: false,
		_textInstance: null,
		
		_createText: function(group, font, color, text, x, y, align){
			// summary:
			//		Internal method.
			// tags:
			//		private
			var gfxText = group.createText({
				x: x,
				y: y,
				text: text,
				align: align
			}).setFont(font).setFill(color);
			return gfxText;
		},
		
		refreshRendering: function(){
			if(this._gfxGroup == null){
				return;
			}
			var text;
			if(this.indicator){
				text = this.indicator.value;
			}else{
				text = this.value;
			}
			if(this.labelFunc){
				text = this.labelFunc(text);
			}
			var iOsVersion = has("iphone");
			// Workaround for a bug on iOS version < 5.0: Recreate the text every times
			if(!this._textCreated || (iOsVersion != undefined && iOsVersion < 5)){
				this._gfxGroup.clear();
				var font = this._getFont();
				this._textInstance = this._createText(this._gfxGroup, font, font.color ? font.color : this.color, "", this.x, this.y, this.align);
				this._textCreated = true;
			}
			this._textInstance.setShape({
				text: text
			});
			
			return this._textInstance;
		}
	})
});

},
'dojox/dgauges/components/default/VerticalLinearGauge':function(){
define("dojox/dgauges/components/default/VerticalLinearGauge", [
		"dojo/_base/lang", 
		"dojo/_base/declare", 
		"dojo/_base/connect", 
		"dojo/_base/Color", 
		"../utils",
		"../../RectangularGauge", 
		"../../LinearScaler", 
		"../../RectangularScale", 
		"../../RectangularValueIndicator", 
		"../../RectangularRangeIndicator",
		"../../TextIndicator",
		"../DefaultPropertiesMixin"
	], 
	function(lang, declare, connect, Color, utils, RectangularGauge, LinearScaler, RectangularScale, RectangularValueIndicator, RectangularRangeIndicator, TextIndicator, DefaultPropertiesMixin){
	return declare("dojox.dgauges.components.default.VerticalLinearGauge", [RectangularGauge, DefaultPropertiesMixin], {
		// summary:
		//		A vertical gauge widget.

		// borderColor: Object|Array|int
		//		The border color. Default is "#C9DFF2".
		borderColor: "#C9DFF2",
		// fillColor: Object|Array|int
		//		The background color. Default is "#FCFCFF".
		fillColor: "#FCFCFF",
		// indicatorColor: Object|Array|int
		//		The indicator fill color. Default is "#F01E28".
		indicatorColor: "#F01E28",
		constructor: function(){
			this.orientation = "vertical";
			// Base colors
			this.borderColor = new Color(this.borderColor);
			this.fillColor = new Color(this.fillColor);
			this.indicatorColor = new Color(this.indicatorColor);
			
			// Draw background
			this.addElement("background", lang.hitch(this, this.drawBackground));
			
			
			// Scaler
			var scaler = new LinearScaler();
			
			// Scale
			var scale = new RectangularScale();
			scale.set("scaler", scaler);
			scale.set("labelPosition", "leading");
			scale.set("paddingBottom", 20);
			scale.set("paddingLeft", 25);
			
			this.addElement("scale", scale);
			
			// Value indicator
			var indicator = new RectangularValueIndicator();
			
			indicator.indicatorShapeFunc = lang.hitch(this, function(group){
				var indic = group.createPolyline([0, 0, 10, 0, 0, 10, -10, 0, 0, 0]).setStroke({
					color: "blue",
					width: 0.25
				}).setFill(this.indicatorColor);
				
				return indic;
			});
			indicator.set("paddingLeft", 45);
			indicator.set("interactionArea", "gauge");
			scale.addIndicator("indicator", indicator);

			
			// Indicator Text Border
			this.addElement("indicatorTextBorder", lang.hitch(this, this.drawTextBorder), "leading");
			
			// Indicator Text
			var indicatorText = new TextIndicator();
			indicatorText.set("indicator", indicator);
			indicatorText.set("x", 22.5);
			indicatorText.set("y", 30);
			this.addElement("indicatorText", indicatorText);
		},
		
		drawBackground: function(g, w, h){
			// summary:
			//		Draws the background shape of the gauge.
			// g: dojox/gfx/Group
			//		The group used to draw the background. 
			// w: Number
			//		The width of the gauge.
			// h: Number
			//		The height of the gauge.
			// tags:
			//		protected
			w = 49;
			var gap = 0;
			var cr = 3;
			var entries = utils.createGradient([0, utils.brightness(this.borderColor, -20), 0.1, utils.brightness(this.borderColor, -40)]);
			g.createRect({
				x: 0,
				y: 0,
				width: w,
				height: h,
				r: cr
			}).setFill(lang.mixin({
				type: "linear",
				x1: 0,
				y1: 0,
				x2: w,
				y2: h
			}, entries)).setStroke({
				color: "#A5A5A5",
				width: 0.2
			});
			entries = utils.createGradient([0, utils.brightness(this.borderColor, 70), 1, utils.brightness(this.borderColor, -50)]);
			gap = 4;
			cr = 2
			g.createRect({
				x: gap,
				y: gap,
				width: w - 2 * gap,
				height: h - 2 * gap,
				r: cr
			}).setFill(lang.mixin({
				type: "linear",
				x1: 0,
				y1: 0,
				x2: w,
				y2: h
			}, entries));
			gap = 6;
			cr = 1
			entries = utils.createGradient([0, utils.brightness(this.borderColor, 60), 1, utils.brightness(this.borderColor, -40)]);
			g.createRect({
				x: gap,
				y: gap,
				width: w - 2 * gap,
				height: h - 2 * gap,
				r: cr
			}).setFill(lang.mixin({
				type: "linear",
				x1: 0,
				y1: 0,
				x2: w,
				y2: h
			}, entries));
			
			gap = 7;
			cr = 0
			entries = utils.createGradient([0, utils.brightness(this.borderColor, 70), 1, utils.brightness(this.borderColor, -40)]);
			g.createRect({
				x: gap,
				y: gap,
				width: w - 2 * gap,
				height: h - 2 * gap,
				r: cr
			}).setFill(lang.mixin({
				type: "linear",
				x1: w,
				y1: 0,
				x2: 0,
				y2: h
			}, entries));
			gap = 5;
			cr = 0
			entries = utils.createGradient([0, [255, 255, 255, 220], 0.8, utils.brightness(this.fillColor, -5), 1, utils.brightness(this.fillColor, -30)]);
			g.createRect({
				x: gap,
				y: gap,
				width: w - 2 * gap,
				height: h - 2 * gap,
				r: cr
			}).setFill(lang.mixin({
				type: "radial",
				cx: 0,
				cy: h / 2,
				r: h
			}, entries)).setStroke({
				color: utils.brightness(this.fillColor, -40),
				width: 0.4
			});
			
		},
		drawTextBorder: function(g){
			// summary:
			//		Internal method.
			// tags:
			//		private
			return g.createRect({
				x: 5,
				y: 5,
				width: 40,
				height: 40
			}).setStroke({
				color: "#CECECE",
				width: 1
			});
		}
	});
});

},
'dojox/dgauges/ScaleBase':function(){
define("dojox/dgauges/ScaleBase", ["dojo/_base/lang", "dojo/_base/declare", "dojox/gfx", "dojo/_base/array", "dojox/widget/_Invalidating", "dojo/_base/sniff"],
	function(lang, declare, gfx, array, _Invalidating, has){
	return declare("dojox.dgauges.ScaleBase", _Invalidating, {
		// summary:
		//		The ScaleBase class is the base class for the circular and rectangular scales.
		//		A scaler must be set to use this class. A scaler is responsible for
		//		tick generation and various data-transform operations.	

		// scaler: Object
		//		The scaler used for tick generation and data-transform operations.
		//		This property is mandatory for using the scale.
		scaler: null,
		// font: Object
		//		The font used for the ticks labels.
		//		This is null by default which means this scale use the font defined 
		//		on the gauge.
		font: null,
		// labelPosition: String
		//		See CircularScale and RectangularScale for valid values.
		labelPosition: null,
		// labelGap: Number
		//		The label gap between the ticks and their labels. Default value is 1.
		labelGap: 1,
		// tickStroke: Object
		//		The GFX stroke used by the default tickShapeFunc implementation.
		tickStroke: null,
		_gauge: null,
		_gfxGroup: null,
		_bgGroup: null,
		_fgGroup: null,
		_indicators: null,
		_indicatorsIndex: null,
		_indicatorsRenderers: null,
		
		constructor: function(){
			this._indicators = [];
			this._indicatorsIndex = {};
			this._indicatorsRenderers = {};
			this._gauge = null;
			this._gfxGroup = null;
			// Fix for #1, IE<9 don't render correctly stroke with width<1
			this.tickStroke = {color: "black", width: has("ie") <= 8 ? 1 : 0.5};
			
			this.addInvalidatingProperties(["scaler", "font", "labelGap", "labelPosition", "tickShapeFunc", "tickLabelFunc", "tickStroke"]);
			
			this.watch("scaler", lang.hitch(this, this._watchScaler));
		},

		postscript: function(mixin){
			// summary:
			//		Internal method.
			// tags:
			//		private
			this.inherited(arguments);
			if(mixin && mixin.scaler){
				this._watchScaler("scaler", null, mixin.scaler);
			}
		},
		
		_watchers: null,

		_watchScaler: function(name, oldValue, newValue){
			// summary:
			//		Internal method.
			// tags:
			//		private
			array.forEach(this._watchers, lang.hitch(this, function(entry){
				entry.unwatch();
			}));

			// Get the properties declared by the watched object
			var props = newValue.watchedProperties;
			this._watchers = [];
			array.forEach(props, lang.hitch(this, function(entry){
				this._watchers.push(newValue.watch(entry, lang.hitch(this, this.invalidateRendering)));
			}));
		},
		
		_getFont: function(){
			// summary:
			//		Internal method.
			// tags:
			//		private
			var font = this.font;
			if(!font){
				font = this._gauge.font;
			}
			if(!font){
				font = gfx.defaultFont;
			}
			return font;
		},
		
		positionForValue: function(value){
			// summary:
			//		See CircularScale and Rectangular for more informations.
			// value: Number
			//		The value to convert.
			// returns: Number
			//		The position corresponding to the value.
			return 0;
		},
		
		valueForPosition: function(position){
			// summary:
			//		See CircularScale and Rectangular for more informations.
			// position: Number
			//		The position to convert.
			// returns: Number
			//		The value corresponding to the position.
		},
		
		tickLabelFunc: function(tickItem){
			// summary:
			//		Customize the text of ticks labels.
			// tickItem: Object
			//		An object containing the tick informations.
			// returns: String
			//		The text to be aligned with the tick. If null, the tick has no label.
			if(tickItem.isMinor){
				return null;
			}else{
				return String(tickItem.value);
			}
		},
		
		tickShapeFunc: function(group, scale, tickItem){
			// summary:
			//		Customize the shape of ticks.
			// group: dojox/gfx/Group
			//		The GFX group used for drawing the tick.
			// scale: dojox/dgauges/ScaleBase
			//		The scale being processed.
			// tickItem: Object
			//		An object containing the tick informations.
			return group.createLine({
				x1: 0,
				y1: 0,
				x2: tickItem.isMinor ? 6 : 10,
				y2: 0
			}).setStroke(this.tickStroke);
		},
		
		getIndicatorRenderer: function(name){
			// summary:
			//		Gets the GFX shape of an indicator.
			// name: String
			//		The name of the indicator as defined using addIndicator.
			// returns: dojox/gfx/canvas/Shape
			//		The GFX shape of the indicator.
			return this._indicatorsRenderers[name];
		},
		
		removeIndicator: function(name){
			// summary:
			//		Removes an indicator.
			// name: String
			//		The name of the indicator as defined using addIndicator.
			// returns: IndicatorBase
			//		The removed indicator.
			var indicator = this._indicatorsIndex[name];
			if(indicator){
				indicator._gfxGroup.removeShape();
				var idx = this._indicators.indexOf(indicator);
				this._indicators.splice(idx, 1);
				
				indicator._disconnectListeners();
				
				delete this._indicatorsIndex[name];
				delete this._indicatorsRenderers[name];
			}
			this.invalidateRendering();
			return indicator;
		},
		
		getIndicator: function(name){
			// summary:
			//		Get an indicator instance.
			// name: String
			//		The name of the indicator as defined using addIndicator.
			// returns: IndicatorBase
			//		The indicator associated with the name parameter.
			return this._indicatorsIndex[name];
		},
		
		addIndicator: function(name, indicator, behindScale){
			// summary:
			//		Add an indicator to the scale. Before calling this function, ensure 
			//		this scale has already been added to a gauge using the addElement method
			//		of the gauge.
			// name: String
			//		The name of the indicator to be added.
			// indicator: dojox/dgauges/IndicatorBase
			//		The indicator to add to this scale.
			// behindScale: Boolean
			//		If true, this indicator is drawn behind the scale. Default value is false.	
			if(this._indicatorsIndex[name] && this._indicatorsIndex[name] != indicator){
				this.removeIndicator(name);
			}
			
			this._indicators.push(indicator);
			this._indicatorsIndex[name] = indicator;
			
			if(!this._ticksGroup){
				this._createSubGroups();
			}
			
			var group = behindScale ? this._bgGroup : this._fgGroup;
			indicator._gfxGroup = group.createGroup();
			
			indicator.scale = this;
			
			return this.invalidateRendering();
		},
		
		_createSubGroups: function(){
			// summary:
			//		Internal method.
			// tags:
			//		private
			if(!this._gfxGroup || this._ticksGroup){
				return;
			}
			this._bgGroup = this._gfxGroup.createGroup();
			this._ticksGroup = this._gfxGroup.createGroup();
			this._fgGroup = this._gfxGroup.createGroup();
		},
		
		refreshRendering: function(){
			if(!this._ticksGroup){
				this._createSubGroups();
			}
		}
	});
});

},
'dojox/dgauges/CircularRangeIndicator':function(){
define("dojox/dgauges/CircularRangeIndicator", ["dojo/_base/declare", "./ScaleIndicatorBase", "./_circularUtils", "dojo/_base/event"],
	function(declare, ScaleIndicatorBase, _circularUtils, eventUtil){
	return declare("dojox.dgauges.CircularRangeIndicator", ScaleIndicatorBase, {
		// summary:
		//		A CircularRangeIndicator is used to represent a range of values on a scale.
		//		Use the addIndicator method of CircularScale to use it.
		//		It is represented as a donut slice.
		
		// start: Number
		//		The start value of the range indicator.
		start: 0,
		// radius: Number
		//		The outer radius in pixels of the range indicator.
		radius: NaN,
		// startThickness: Number
		//		The start thickness of the donut slice in pixels. 
		startThickness: 6,
		// endThickness: Number
		//		The end thickness of the donut slice in pixels. 
		endThickness: 6,
		// fill: Object
		//		A fill object that will be passed to the setFill method of GFX.
		fill: null,
		// stroke: Object
		//		A stroke object that will be passed to the setStroke method of GFX.
		stroke: null,
		constructor: function(){
			this.indicatorShapeFunc = null;
			this.fill = [255, 120, 0];
			this.stroke = {
				color: "black",
				width: .2
			};
			this.interactionMode = "none";
			
			this.addInvalidatingProperties(["start", "radius", "startThickness", "endThickness", "fill", "stroke"]);
		},
		
		_interpolateColor: function(from, dest, n){
			// summary:
			//		Internal method.
			// tags:
			//		private
			var fr = (from >> 16) & 0xff;
			var fg = (from >> 8) & 0xff;
			var fb = from & 0xff;
			
			var tr = (dest >> 16) & 0xff;
			var tg = (dest >> 8) & 0xff;
			var tb = dest & 0xff;
			
			var r = ((1 - n) * fr + n * tr) & 0xff;
			var g = ((1 - n) * fg + n * tg) & 0xff;
			var b = ((1 - n) * fb + n * tb) & 0xff;
			
			return r << 16 | g << 8 | b;
		},
		
		_colorsInterpolation: function(colors, ratios, len){
			// summary:
			//		Internal method.
			// tags:
			//		private
			var ret = [];
			var ilen = 0;
			
			for(var i = 0; i < colors.length - 1; i++){
				ilen = (ratios[i + 1] - ratios[i]) * len;
				ilen = Math.round(ilen);
				ret = ret.concat(_colorInterpolation(colors[i], colors[i + 1], ilen));
			}
			return ret;
		},
		
		_alphasInterpolation: function(alphas, positions, len){
			// summary:
			//		Internal method.
			// tags:
			//		private
			var ret = [];
			var ilen = 0;
			for(var i = 0; i < alphas.length - 1; i++){
				ilen = (positions[i + 1] - positions[i]) * len;
				ilen = Math.round(ilen);
				ret = ret.concat(_alphaInterpolation(alphas[i], alphas[i + 1], ilen));
			}
			return ret;
		},
		
		_alphaInterpolation: function(c1, c2, len){
			// summary:
			//		Internal method.
			// tags:
			//		private
			var step = (c2 - c1) / (len - 1);
			var ret = [];
			for(var i = 0; i < len; i++){
				ret.push(c1 + i * step);
			}
			return ret;
		},
		
		_colorInterpolation: function(c1, c2, len){
			// summary:
			//		Internal method.
			// tags:
			//		private
			var ret = [];
			for (var i = 0; i < len; i++){
				ret.push(_interpolateColor(c1, c2, i / (len - 1)));
			}
			return ret;
		},
		
		_getEntriesFor: function(entries, attr){
			// summary:
			//		Internal method.
			// tags:
			//		private
			var ret = [];
			var e;
			var val;
			for(var i = 0; i < entries.length; i++){
				e = entries[i];
				if(e[attr] == null || isNaN(e[attr])) {
					val = i / (entries.length - 1);
				}
				else{
					val = e[attr];
				}
				ret.push(val);
			}
			return ret;
		},
		
		_drawColorTrack: function(g, ox, oy, radius, orientation, startAngleRadians, endAngleRadians, sWeight, eWeight, fill, stroke, clippingAngleRadians){
			// summary:
			//		Internal method.
			// tags:
			//		private
			var angleStep = 0.05;
			var totalAngle;
			
			totalAngle = 6.28318530718 - _circularUtils.computeAngle(startAngleRadians, endAngleRadians, orientation);
			if(!isNaN(clippingAngleRadians)){
				var deltaAngle = _circularUtils.computeAngle(startAngleRadians, clippingAngleRadians, orientation);
				eWeight *= deltaAngle / totalAngle;
				totalAngle = deltaAngle;
			}
			var iterCount = Math.max(2, Math.floor(totalAngle / angleStep));
			
			angleStep = totalAngle / iterCount;
			var innerRadius;
			var outerRadius;
			var outerStep = 0;
			var innerStep = 0;
			var px;
			var py;
			innerRadius = -sWeight;
			outerRadius = 0;
			innerStep = (sWeight - eWeight) / iterCount;
			
			var angle;
			var i;
			if(orientation == "clockwise"){
				angleStep = -angleStep;
			}
			
			var gp = [];
			
			px = ox + Math.cos(startAngleRadians) * (radius + innerRadius);
			py = oy - Math.sin(startAngleRadians) * (radius + innerRadius);
			gp.push(px, py);
			for(i = 0; i < iterCount; i++){
				angle = startAngleRadians + i * angleStep;
				px = ox + Math.cos(angle + angleStep) * (radius + innerRadius + i * innerStep);
				py = oy - Math.sin(angle + angleStep) * (radius + innerRadius + i * innerStep);
				gp.push(px, py);
			}
			if(isNaN(angle)){
				angle = startAngleRadians;
			}
			px = ox + Math.cos(angle + angleStep) * (radius + outerRadius + (iterCount - 1) * outerStep);
			py = oy - Math.sin(angle + angleStep) * (radius + outerRadius + (iterCount - 1) * outerStep);
			gp.push(px, py);
			for(i = iterCount - 1; i >= 0; i--){
				angle = startAngleRadians + i * angleStep;
				px = ox + Math.cos(angle + angleStep) * (radius + outerRadius + i * outerStep);
				py = oy - Math.sin(angle + angleStep) * (radius + outerRadius + i * outerStep);
				gp.push(px, py);
			}
			px = ox + Math.cos(startAngleRadians) * (radius + outerRadius);
			py = oy - Math.sin(startAngleRadians) * (radius + outerRadius);
			gp.push(px, py);
			
			px = ox + Math.cos(startAngleRadians) * (radius + innerRadius);
			py = oy - Math.sin(startAngleRadians) * (radius + innerRadius);
			gp.push(px, py);
			g.createPolyline(gp).setFill(fill).setStroke(stroke);
		},
		
		refreshRendering: function(){
			this.inherited(arguments);

			var g = this._gfxGroup;
			g.clear();
			var ox = this.scale.originX;
			var oy = this.scale.originY;
			var radius = isNaN(this.radius) ? this.scale.radius  : this.radius;
			var orientation = this.scale.orientation;
			var startAngleRadians = _circularUtils.toRadians(360 - this.scale.positionForValue(this.start));
			var v = isNaN(this._transitionValue) ? this.value : this._transitionValue;
			var endAngleRadians = _circularUtils.toRadians(360 - this.scale.positionForValue(v));
			var sWeight = this.startThickness;
			var eWeight = this.endThickness;
			var clippingAngleRadians = NaN;
			
			this._drawColorTrack(g, ox, oy, radius, orientation, startAngleRadians, endAngleRadians, sWeight, eWeight, this.fill, this.stroke, clippingAngleRadians);
		},
		
		_onMouseDown: function(event){
			// summary:
			//		Internal method.
			// tags:
			//		private
			this.inherited(arguments);
			var origin = this.scale._gauge._gaugeToPage(this.scale.originX, this.scale.originY);
			var angle = ((Math.atan2(event.pageY - origin.y, event.pageX - origin.x)) * 180) / (Math.PI);
			this.set("value", this.scale.valueForPosition(angle));

			// prevent the browser from selecting text
			eventUtil.stop(event);
		},
		
		_onMouseMove: function(event){
			// summary:
			//		Internal method.
			// tags:
			//		private
			this.inherited(arguments);
			
			var origin = this.scale._gauge._gaugeToPage(this.scale.originX, this.scale.originY);
			var angle = ((Math.atan2(event.pageY - origin.y, event.pageX - origin.x)) * 180) / (Math.PI);
			this.set("value", this.scale.valueForPosition(angle));
		}
	});
});

},
'dojox/dgauges/LogScaler':function(){
define("dojox/dgauges/LogScaler", ["dojo/_base/lang", "dojo/_base/declare", "dojo/Stateful"], function(lang, declare, Stateful){
	return declare("dojox.dgauges.LogScaler", Stateful, {
		// summary:
		//		The LogScaler maps numeric values evenly
		//		between a minimum and a maximum value along a gauge scale.
		//		If no multiplier is specified, the scale will place
		//		a tick on each power of 10 value (1, 10, 100, 1000, and so on) between
		//		the minimum and maximum values.
		
		// minimum: Number
		//		The minimum value of the scaler. Default is 0.
		minimum: 0,
		// maximum: Number
		//		The maximum value of the scaler. Default is 1000.
		maximum: 1000,
		// multiplier: Number
		//		The interval between two major ticks.
		multiplier: 10,
		// majorTicks:
		//		The array of generated major ticks. You should not set this
		//		property when using the scaler.
		majorTicks: null,
		
		_computedMultiplier: NaN,
		
		constructor: function(){
			this.watchedProperties = ["minimum", "maximum", "multiplier"];
		},
		_buildMajorTickItems: function(){
			// summary:
			//		Internal method.
			// tags:
			//		private
			var majorTickCache = [];
			this._computedMinimum = this.getComputedMinimum();
			this._computedMaximum = this.getComputedMaximum();
			this._computedMultiplier = this.getComputedMultiplier();
			
			if(this._computedMaximum > this._computedMinimum){
				var start = Math.max(0, Math.floor(Math.log(this._computedMinimum + 0.000000001) / Math.LN10));
				var end = Math.max(0, Math.floor(Math.log(this._computedMaximum + 0.000000001) / Math.LN10));
				var data;
				for(var i = start; i <= end; i += this._computedMultiplier){
					data = {};
					data.value = Math.pow(10, i);
					data.position = (i - start) / (end - start);
					majorTickCache.push(data);
				}
			}
			return majorTickCache;
		},
		
		getComputedMinimum: function(){
			// summary:
			//		The computed minimum value of the scale. If the minimum value is not
			//		an even power of 10, the scale computes a new minimum so that it maps to 
			//		an even power of 10.
			return Math.pow(10, Math.max(0, Math.floor(Math.log(this.minimum + 0.000000001) / Math.LN10)));
		},
		
		getComputedMaximum: function(){
			// summary:
			//		The computed maximum value of the scale. If the maximum value is not
			//		an even power of 10, the scale computes a new maximum so that it maps to 
			//		an even power of 10.
			return Math.pow(10, Math.max(0, Math.floor(Math.log(this.maximum + 0.000000001) / Math.LN10)));
		},
		
		
		getComputedMultiplier: function(){
			// summary:
			//		The computed multiplier value of the scale. If the multiplier value is not
			//		an even power of 10, the scale computes a new multiplier so that it maps to 
			//		an even power of 10.
			return Math.max(1, Math.floor(Math.log(this.multiplier + 0.000000001) / Math.LN10));
			
		},
		
		computeTicks: function(){
			// summary:
			//		Creates or re-creates the ticks for this scaler.
			// returns: Array
			//		An array containing ticks.
			this.majorTicks = this._buildMajorTickItems();
			return this.majorTicks.concat();
		},
		
		positionForValue: function(value){
			// summary:
			//		Transforms a value into a relative position between 0 and 1.
			// value: Number
			//		A value to transform.
			// returns: Number
			//		The position between 0 and 1.
			
			if(this._computedMaximum < this._computedMinimum || value <= this._computedMinimum || value < 1 || isNaN(value)){
				value = this._computedMinimum;
			}
			if(value >= this._computedMaximum){
				value = this._computedMaximum;
			}
			value = Math.log(value) / Math.LN10;
			var sv = Math.log(this._computedMinimum) / Math.LN10;
			var ev = Math.log(this._computedMaximum) / Math.LN10;
			return (value - sv) / (ev - sv);
		},
		
		valueForPosition: function(position){
			// summary:
			//		Transforms a relative position (between 0 and 1) into a value.
			// position: Number
			//		A relative position to transform.
			// returns: Number
			//		The transformed value between minimum and maximum.
			var sv = Math.log(this._computedMinimum) / Math.LN10;
			var ev = Math.log(this._computedMaximum) / Math.LN10;
			return Math.pow(10, sv + position * (ev - sv));
		}
	});
});

},
'dojox/dgauges/CircularGauge':function(){
define("dojox/dgauges/CircularGauge", ["dojo/_base/declare", "dojo/dom-geometry", "dojox/gfx", "./GaugeBase"], function(declare, domGeom, gfx, GaugeBase){
	return declare("dojox.dgauges.CircularGauge", GaugeBase, {
		// summary:
		//		The base class for circular gauges.
		//		You can create custom circular or semi-circular gauges by extending this class.
		//		See dojox.dgauges.components.default.CircularLinearGauge.js for an example of circular gauge.
		
		_transformProperties: null,
		
		refreshRendering: function(){
			if(this._widgetBox.w <= 0 || this._widgetBox.h <= 0){
				return;
			}
			
			for(var key in this._elementsIndex){
				this._elementsRenderers[key] = this._elementsIndex[key].refreshRendering();
			}
			
			// Maximize the drawing area and center the gauge
			var bb = this._computeBoundingBox(this._gfxGroup);
			
			var naturalRatio = (bb.x + bb.width) / (bb.y + bb.height);
			var widgetWidth = this._widgetBox.w;
			var widgetHeight = this._widgetBox.h;
			var widgetRatio = this._widgetBox.w / this._widgetBox.h;
			
			var xpos = 0;
			var ypos = 0;
			var h = 0;
			var w = 0;
			if(naturalRatio > widgetRatio){
				w = widgetWidth;
				h = w / naturalRatio;
				ypos = (widgetHeight - h) / 2;
			}else{
				h = widgetHeight;
				w = h * naturalRatio;
				xpos = (widgetWidth - w) / 2;
			}
			var scaleFactor = Math.max(w / (bb.x + bb.width), h / (bb.y + bb.height));
			this._transformProperties = {scale:scaleFactor, tx:xpos, ty:ypos};
			this._gfxGroup.setTransform([gfx.matrix.scale(scaleFactor), gfx.matrix.translate(xpos / scaleFactor, ypos / scaleFactor)]);
		},
		
		_gaugeToPage: function(px, py){
			// summary:
			//		Internal method.
			// tags:
			//		private
			if(this._transformProperties){
				var np = domGeom.position(this.domNode, true);
				return {x: np.x + px * this._transformProperties.scale + this._transformProperties.tx, y: np.y + py * this._transformProperties.scale + this._transformProperties.ty};
			}else{
				return null;
			}
		}
	});
});

},
'dojox/dgauges/components/utils':function(){
define("dojox/dgauges/components/utils", ["dojo/_base/lang", "dojo/_base/Color"], function(lang, Color){
	// module:
	//		dojox/dgauges/components/utils
	// summary:
	//		Gauge utilities.
	// tags:
	//		public

	var utils = {};

	lang.mixin(utils, {
		brightness: function(col, b){
			// summary:
			//		Adjusts the brightness of a color.
			// col: Number
			//		The base color
			// b: Number
			//		A positive or negative value to adjust the brightness
			// returns: Number
			//		The modified color			
			var res = lang.mixin(null, col);
			res.r = Math.max(Math.min(res.r + b, 255), 0);
			res.g = Math.max(Math.min(res.g + b, 255), 0);
			res.b = Math.max(Math.min(res.b + b, 255), 0);
			return res;
		},
		
		createGradient: function(entries){
			// summary:
			//		Creates a gradient object
			// entries: Array
			//		An array of numbers representing colors
			// returns: Number
			//		The modified color			
			var res = {
				colors: []
			};
			var obj;
			for(var i = 0; i < entries.length; i++){
				if(i % 2 == 0){
					obj = {
						offset: entries[i]
					};
				} else {
					obj.color = entries[i];
					res.colors.push(obj);
				}
			}
			return res;
		},
		
		_setter: function(obj, attributes, values){
			for(var i = 0; i < attributes.length; i++){
				obj[attributes[i]] = values[i];
			}
		},
		
		genericCircularGauge: function(scale, indicator, originX, originY, radius, startAngle, endAngle, orientation, font, labelPosition, tickShapeFunc){
			// summary:
			//		A helper method for configuring a circular gauge.
			// scale: CircularScale
			//		A circular scale
			// indicator: IndicatorBase
			//		A circular indicator
			// originX: Number
			//		The x-coordinate of the center of the scale (in pixels) 
			// originY: Number
			//		The y-coordinate of the center of the scale (in pixels)
			// radius: Number
			//		The radius of the scale (in pixels)
			// startAngle: Number
			//		The start angle of the scale (in degrees)
			// endAngle: Number
			//		The end angle of the scale (in degrees)
			// orientation: String?
			//		The orientation of the scale, can be "clockwise" or "cclockwise"
			// font: Object?
			//		The font used for the gauge
			// labelPosition: String?
			//		The position of the labels regarding   
			// tickShapeFunc: Object?
			//		A drawing function for the ticks
			// returns: Number
			//		The modified color	
			var attributes = ["originX", "originY", "radius", "startAngle", "endAngle", "orientation", "font", "labelPosition", "tickShapeFunc"];
			if(!orientation){
				orientation = "clockwise";
			}
			if(!font){
				font = {
					family: "Helvetica",
					style: "normal",
					size: "10pt",
					color: "#555555"
				};
			}
			if(!labelPosition){
				labelPosition = "inside";
			}
			if(!tickShapeFunc){
				tickShapeFunc = function(group, scale, tick){
					var stroke = scale.tickStroke;
					var majorStroke;
					var minorStroke;
					if(stroke){
						majorStroke = {color:stroke.color ? stroke.color : "#000000", width:stroke.width ? stroke.width : 0.5};
						var col = new Color(stroke.color).toRgb();
						minorStroke = {color:stroke.color ? utils.brightness({r:col[0], g:col[1], b:col[2]},51) : "#000000", width:stroke.width ? stroke.width * 0.6 : 0.3};
					}
					return group.createLine({
						x1: tick.isMinor ? 2 : 0,
						y1: 0,
						x2: tick.isMinor ? 8 : 10,
						y2: 0
					}).setStroke(tick.isMinor ? minorStroke : majorStroke);
				};
			}
			
			this._setter(scale, attributes, [originX, originY, radius, startAngle, endAngle, orientation, font, labelPosition, tickShapeFunc]);
			
			indicator.set("interactionArea", "gauge");
			// Needle shape
			indicator.set("indicatorShapeFunc", function(group, indicator){
				return group.createPolyline([0, -5, indicator.scale.radius - 6, 0, 0, 5, 0, -5]).setStroke({
					color: "#333333",
					width: 0.25
				}).setFill(scale._gauge.indicatorColor);
			});
		}
	});

	return utils;
});

},
'dojox/dgauges/_circularUtils':function(){
define("dojox/dgauges/_circularUtils", function(){
	// module:
	//		dojox/dgauges/components/_circularUtils
	// summary:
	//		Internal circular utilities.
	// tags:
	//		private

	return {
		computeTotalAngle: function(start, end, orientation){
			// summary:
			//		Internal method.
			// tags:
			//		private
			if(start == end){
				return 360;
			}else{
				return this.computeAngle(start, end, orientation, 360);
			}
		},
		
		modAngle: function(angle, base){
			// summary:
			//		Internal method.
			// tags:
			//		private
			if(base == undefined){
				base = 6.28318530718;
			}
			if(angle >= base){
				do {
					angle -= base;
				}
				while (angle >= base);
			}else{
				while (angle < 0){
					angle += base;
				}
			}
			return angle;
		},
		
		computeAngle: function(startAngle, endAngle, orientation, base){
			// summary:
			//		Internal method.
			// tags:
			//		private
			if(base == undefined){
				base = 6.28318530718;
			}
			
			var totalAngle;
			
			if(endAngle == startAngle){
				return base;
			}
			
			if(orientation == "clockwise"){
				if(endAngle < startAngle){
					totalAngle = base - (startAngle - endAngle);
				}else{
					totalAngle = endAngle - startAngle;
				}
			}
			else{
				if(endAngle < startAngle){
					totalAngle = startAngle - endAngle;
				}else{
					totalAngle = base - (endAngle - startAngle);
				}
			}
			return this.modAngle(totalAngle, base);
		},
		
		toRadians: function(deg){
			// summary:
			//		Internal method.
			// tags:
			//		private
			return deg * Math.PI / 180;
		},
		
		toDegrees: function(rad){
			// summary:
			//		Internal method.
			// tags:
			//		private
			return rad * 180 / Math.PI;
		}
	}
});

},
'dojox/dgauges/LinearScaler':function(){
define("dojox/dgauges/LinearScaler", ["dojo/_base/lang", "dojo/_base/declare", "dojo/Stateful"], function(lang, declare, Stateful){
	return declare("dojox.dgauges.LinearScaler", Stateful, {
		// summary:
		//		The linear scaler. This scaler creates major and minor ticks regularly between 
		//		a minimum and a maximum.
		//		Scalers are responsible for tick generation and various data-transform operations.		
		
		// minimum: Number
		//		The minimum value of the scaler. Default is 0.
		minimum: 0,
		// maximum: Number
		//		The maximum value of the scaler. Default is 100.
		maximum: 100,
		// snapInterval:
		//		Specifies the increment value to be used as snap values on this scale 
		//		during user interaction.
		//		Default is 1.
		snapInterval: 1,
		// majorTickInterval: Number
		//		The interval between two major ticks.
		majorTickInterval: NaN,
		// minorTickInterval: Number
		//		The interval between two minor ticks.
		minorTickInterval: NaN,
		// minorTicksEnabled: Boolean
		//		If false, minor ticks are not generated. Default is true.
		minorTicksEnabled: true,
		// majorTicks:
		//		The array of generated major ticks. You should not set this
		//		property when using the scaler.
		majorTicks: null,
		// minorTicks:
		//		The array of generated minor ticks. You should not set this
		//		property when using the scaler.
		minorTicks: null,

		_computedMajorTickInterval: NaN,
		_computedMinorTickInterval: NaN,
		
		constructor: function(){
			this.watchedProperties = ["minimum", "maximum", "majorTickInterval", "minorTickInterval", "snapInterval", "minorTicksEnabled"];
		},

		_buildMinorTickItems: function(){
			// summary:
			//		Internal method.
			// tags:
			//		private
			var mt = this.majorTicks;
			var minorTickCache = [];
			if(this.maximum > this.minimum){
				var majorTickCount = Math.floor((this.maximum - this.minimum) / this.getComputedMajorTickInterval()) + 1;
				var minorTickCount = Math.floor(this.getComputedMajorTickInterval() / this.getComputedMinorTickInterval());
				var data;
				for(var i = 0; i < majorTickCount - 1; i++){
					for(var j = 1; j < minorTickCount; j++){
						data = {scaler: this};
						data.isMinor = true;
						data.value = mt[i].value + j * this.getComputedMinorTickInterval();
						data.position = (Number(data.value) - this.minimum) / (this.maximum - this.minimum);
						minorTickCache.push(data);
					}
				}
			}
			return minorTickCache;
		},
		
		_buildMajorTickItems: function(){
			// summary:
			//		Internal method.
			// tags:
			//		private
			var majorTickCache = [];
			if(this.maximum > this.minimum){
				var majorTickCount = Math.floor((this.maximum - this.minimum) / this.getComputedMajorTickInterval()) + 1;
				var data;
				for(var i = 0; i < majorTickCount; i++){
					data = {scaler: this};
					data.isMinor = false;
					data.value = this.minimum + i * this.getComputedMajorTickInterval();
					data.position = (Number(data.value) - this.minimum) / (this.maximum - this.minimum);
					majorTickCache.push(data);
				}
			}
			return majorTickCache;
		},
		
		getComputedMajorTickInterval: function(){
			// summary:
			//		The computed or user defined major tick interval.
			// returns: Number
			//		The major tick interval used for ticks generation.
			if(!isNaN(this.majorTickInterval)){
				return this.majorTickInterval;
			}
			if(isNaN(this._computedMajorTickInterval)){
				this._computedMajorTickInterval = (this.maximum - this.minimum) / 10;
			}
			return this._computedMajorTickInterval;
		},
		
		getComputedMinorTickInterval: function(){
			// summary:
			//		The computed or user defined minor tick interval.
			// returns: Number
			//		The minor tick interval used for ticks generation.
			if(!isNaN(this.minorTickInterval)){
				return this.minorTickInterval;
			}
			if(isNaN(this._computedMinorTickInterval)){
				this._computedMinorTickInterval = this.getComputedMajorTickInterval() / 5;
			}
			return this._computedMinorTickInterval;
		},
		
		computeTicks: function(){
			// summary:
			//		Creates or re-creates the ticks for this scaler.
			// returns: Array
			//		An array containing all ticks (major then minor ticks).
			this.majorTicks = this._buildMajorTickItems();
			this.minorTicks = this.minorTicksEnabled ? this._buildMinorTickItems() : [];
			return this.majorTicks.concat(this.minorTicks);
		},
		
		positionForValue: function(value){
			// summary:
			//		Transforms a value into a relative position between 0 and 1.
			// value: Number
			//		A value to transform.
			// returns: Number
			//		The position between 0 and 1.
			var position;
			if(value == null || isNaN(value) || value <= this.minimum){
				position = 0;
			}
			if(value >= this.maximum){
				position = 1;
			}
			if(isNaN(position)){
				position = (value - this.minimum) / (this.maximum - this.minimum);
			}
			return position;
		},
		
		valueForPosition: function(position){
			// summary:
			//		Transforms a relative position (between 0 and 1) into a value.
			// position: Number
			//		A relative position to transform.
			// returns: Number
			//		The transformed value between minimum and maximum.
			var range = Math.abs(this.minimum - this.maximum);
			var value = this.minimum + range * position;
			if(!isNaN(this.snapInterval) && this.snapInterval > 0){
				value = Math.round((value - this.minimum) / this.snapInterval) * this.snapInterval + this.minimum;
			}
			return value;
		}
	});
});

},
'dojox/dgauges/components/default/SemiCircularLinearGauge':function(){
define("dojox/dgauges/components/default/SemiCircularLinearGauge", [
		"dojo/_base/lang", 
		"dojo/_base/declare", 
		"dojo/_base/Color", 
		"../utils",
		"../../CircularGauge", 
		"../../LinearScaler", 
		"../../CircularScale", 
		"../../CircularValueIndicator", 
		"../../TextIndicator",
		"../DefaultPropertiesMixin"
		], 
	function(lang, declare, Color, utils, CircularGauge, LinearScaler, CircularScale, CircularValueIndicator, TextIndicator, DefaultPropertiesMixin){
	return declare("dojox.dgauges.components.default.SemiCircularLinearGauge", [CircularGauge, DefaultPropertiesMixin], {
		// summary:
		//		A semi circular gauge widget.

		_radius: 88,
		_width: 200,
		_height: 123,
		// borderColor: Object|Array|int
		//		The border color. Default is "#C9DFF2".
		borderColor: "#C9DFF2",
		// fillColor: Object|Array|int
		//		The background color. Default is "#FCFCFF".
		fillColor: "#FCFCFF",
		// indicatorColor: Object|Array|int
		//		The indicator fill color. Default is "#F01E28".
		indicatorColor: "#F01E28",
		constructor: function(){
			
			// Base colors
			this.borderColor = new Color(this.borderColor);
			this.fillColor = new Color(this.fillColor);
			this.indicatorColor = new Color(this.indicatorColor);

			// Draw background
			this.addElement("background", lang.hitch(this, this.drawBackground));
			
			// Scaler
			var scaler = new LinearScaler();
			
			// Scale
			var scale = new CircularScale();
			scale.set("scaler", scaler);
			this.addElement("scale", scale);
			
			// Value indicator
			var indicator = new CircularValueIndicator();
			scale.addIndicator("indicator", indicator);
			
			// Gauge Foreground (needle cap)
			this.addElement("foreground", lang.hitch(this, this.drawForeground));
			
			// Indicator Text Border
			this.addElement("indicatorTextBorder", lang.hitch(this, this.drawTextBorder), "leading");
			
			// Indicator Text
			var indicatorText = new TextIndicator();
			indicatorText.set("indicator", indicator);
			indicatorText.set("x", 100);
			indicatorText.set("y", 115);
			this.addElement("indicatorText", indicatorText);			
			
			utils.genericCircularGauge(scale, indicator, this._width / 2, 0.76 * this._height, this._radius, 166, 14, null, null, "inside");
		},
		
		drawBackground: function(g){
			// summary:
			//		Draws the background shape of the gauge.
			// g: dojox/gfx/Group
			//		The group used to draw the background. 
			// tags:
			//		protected
			var w = this._width;
			var h = this._height;
			var gap = 0;
			var cr = 3;
			var entries = utils.createGradient([0, utils.brightness(this.borderColor, -20), 0.1, utils.brightness(this.borderColor, -40)]);
			g.createRect({
				x: 0,
				y: 0,
				width: w,
				height: h,
				r: cr
			}).setFill(lang.mixin({
				type: "linear",
				x1: 0,
				y1: 0,
				x2: w,
				y2: h
			}, entries)).setStroke({
				color: "#A5A5A5",
				width: 0.2
			});
			entries = utils.createGradient([0, utils.brightness(this.borderColor, 70), 1, utils.brightness(this.borderColor, -50)]);
			gap = 4;
			cr = 2
			g.createRect({
				x: gap,
				y: gap,
				width: w - 2 * gap,
				height: h - 2 * gap,
				r: cr
			}).setFill(lang.mixin({
				type: "linear",
				x1: 0,
				y1: 0,
				x2: w,
				y2: h
			}, entries));
			gap = 6;
			cr = 1
			entries = utils.createGradient([0, utils.brightness(this.borderColor, 60), 1, utils.brightness(this.borderColor, -40)]);
			g.createRect({
				x: gap,
				y: gap,
				width: w - 2 * gap,
				height: h - 2 * gap,
				r: cr
			}).setFill(lang.mixin({
				type: "linear",
				x1: 0,
				y1: 0,
				x2: w,
				y2: h
			}, entries));
			
			gap = 7;
			cr = 0
			entries = utils.createGradient([0, utils.brightness(this.borderColor, 70), 1, utils.brightness(this.borderColor, -40)]);
			g.createRect({
				x: gap,
				y: gap,
				width: w - 2 * gap,
				height: h - 2 * gap,
				r: cr
			}).setFill(lang.mixin({
				type: "linear",
				x1: w,
				y1: 0,
				x2: 0,
				y2: h
			}, entries));
			gap = 5;
			cr = 0			
			entries = utils.createGradient([0, [255, 255, 255, 220], 0.8, utils.brightness(this.fillColor, -5), 1, utils.brightness(this.fillColor, -30)]);
			g.createRect({
				x: gap,
				y: gap,
				width: w - 2 * gap,
				height: h - 2 * gap,
				r: cr
			}).setFill(lang.mixin({
				type: "radial",
				cx: w/2,
				cy: h/2,
				r: h
			}, entries)).setStroke({
				color: utils.brightness(this.fillColor, -40),
				width: 0.4
			});
			
		},
		
		drawForeground: function(g){
			// summary:
			//		Draws the foreground shape of the gauge.
			// g: dojox/gfx/Group
			//		The group used to draw the foreground. 
			// tags:
			//		protected
			var r = 0.07 * this._radius;
			var entries = utils.createGradient([0, this.borderColor, 1, utils.brightness(this.borderColor, -20)]);
			g.createEllipse({
				cx: this._width / 2,
				cy: 0.76 * this._height,
				rx: r,
				ry: r
			}).setFill(lang.mixin({
				type: "radial",
				cx: this._width / 2 - 5,
				cy: this._height * 0.76 - 5,
				r: r
			}, entries)).setStroke({
				color: utils.brightness(this.fillColor, -50),
				width: 0.4
			});
		},
		
		drawTextBorder: function(g){
			// summary:
			//		Internal method.
			// tags:
			//		private
			return g.createRect({
				x: this._width / 2 - 12,
				y: this._height - 20,
				width: 24,
				height: 14
			}).setStroke({
				color: utils.brightness(this.fillColor, -20),
				width: 0.3
			});
		}
	});
});


}}});
define("dojo/dgauges-layer", [], 1);
