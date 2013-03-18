require({cache:{
'dojox/fx':function(){
define("dojox/fx", ["./fx/_base"], function(DojoxFx){
	/*=====
	 return {
	 // summary:
	 //		Deprecated.  Should require dojox/fx modules directly rather than trying to access them through
	 //		this module.
	 };
	 =====*/
	return DojoxFx;
});

},
'dojox/fx/flip':function(){
define("dojox/fx/flip", [
	"dojo/_base/kernel",
	"dojo/_base/html",
	"dojo/dom",
	"dojo/dom-construct",
	"dojo/dom-geometry",
	"dojo/_base/connect",
	"dojo/_base/Color",
	"dojo/_base/sniff",
	"dojo/_base/lang",
	"dojo/_base/window",
	"dojo/_base/fx",
	"dojo/fx",
	"./_base"
], function(kernel, htmlUtil, dom, domConstruct, domGeom, connectUtil, Color, has, lang, winUtil, baseFx, coreFx, fxExt) {
//kernel,lang->(sniff,array,has),sniff,unload,window

	kernel.experimental("dojox.fx.flip");
	// because ShrinkSafe will eat this up:
	var borderConst = "border",
		widthConst = "Width",
		heightConst = "Height",
		topConst = "Top",
		rightConst = "Right",
		leftConst = "Left",
		bottomConst = "Bottom"
	;

	fxExt.flip = function(/*Object*/ args){
		// summary:
		//		Animate a node flipping following a specific direction
		// description:
		//		Returns an animation that will flip the
		//		node around a central axis:
		//
		//		if args.dir is "left" or "right" --> y axis
		//
		//		if args.dir is "top" or "bottom" --> x axis
		//
		//		This effect is obtained using a border distortion applied to a helper node.
		//
		//		The user can specify three background colors for the helper node:
		//
		//		- darkColor: the darkest color reached during the animation
		//		- lightColor: the brightest color
		//		- endColor: the final backgroundColor for the node
		//
		//		Other arguments:
		//
		//		- depth: Float
		//			 - 0 <= depth <= 1 overrides the computed "depth"
		//			- (0: min distortion, 1: max distortion)
		//
		//		- whichAnim: String
		//			- "first"			 : the first half animation
		//			- "last"			 : the second one
		//			- "both" (default) : both
		//
		//		- axis: String
		//			- "center" (default)	  : the node is flipped around his center
		//			- "shortside"			  : the node is flipped around his "short" (in perspective) side
		//			- "longside"			  : the node is flipped around his "long" (in perspective) side
		//			- "cube"				  : the node flips around the central axis of the cube
		//
		//		- shift: Integer:
		//			node translation, perpendicular to the rotation axis
		//
		// example:
		//	|	var anim = dojox.fx.flip({
		//	|		node: dojo.byId("nodeId"),
		//	|		dir: "top",
		//	|		darkColor: "#555555",
		//	|		lightColor: "#dddddd",
		//	|		endColor: "#666666",
		//	|		depth: .5,
		//	|		shift: 50,
		//	|		duration:300
		//	|	  });

		var helperNode = domConstruct.create("div"),
			node = args.node = dom.byId(args.node),
			s = node.style,
			dims = null,
			hs = null,
			pn = null,
			lightColor = args.lightColor || "#dddddd",
			darkColor = args.darkColor || "#555555",
			bgColor = htmlUtil.style(node, "backgroundColor"),
			endColor = args.endColor || bgColor,
			staticProps = {},
			anims = [],
			duration = args.duration ? args.duration / 2 : 250,
			dir = args.dir || "left",
			pConst = .9,
			transparentColor = "transparent",
			whichAnim = args.whichAnim,
			axis = args.axis || "center",
			depth = args.depth
		;
		// IE6 workaround: IE6 doesn't support transparent borders
		var convertColor = function(color){
			return ((new Color(color)).toHex() === "#000000") ? "#000001" : color;
		};

		if(has("ie") < 7){
			endColor = convertColor(endColor);
			lightColor = convertColor(lightColor);
			darkColor = convertColor(darkColor);
			bgColor = convertColor(bgColor);
			transparentColor = "black";
			helperNode.style.filter = "chroma(color='#000000')";
		}

		var init = (function(n){
			return function(){
				var ret = htmlUtil.coords(n, true);
				dims = {
					top: ret.y,
					left: ret.x,
					width: ret.w,
					height: ret.h
				};
			}
		})(node);
		init();
		// helperNode initialization
		hs = {
			position: "absolute",
			top: dims["top"] + "px",
			left: dims["left"] + "px",
			height: "0",
			width: "0",
			zIndex: args.zIndex || (s.zIndex || 0),
			border: "0 solid " + transparentColor,
			fontSize: "0",
			visibility: "hidden"
		};
		var props = [ {},
			{
				top: dims["top"],
				left: dims["left"]
			}
		];
		var dynProperties = {
			left: [leftConst, rightConst, topConst, bottomConst, widthConst, heightConst, "end" + heightConst + "Min", leftConst, "end" + heightConst + "Max"],
			right: [rightConst, leftConst, topConst, bottomConst, widthConst, heightConst, "end" + heightConst + "Min", leftConst, "end" + heightConst + "Max"],
			top: [topConst, bottomConst, leftConst, rightConst, heightConst, widthConst, "end" + widthConst + "Min", topConst, "end" + widthConst + "Max"],
			bottom: [bottomConst, topConst, leftConst, rightConst, heightConst, widthConst, "end" + widthConst + "Min", topConst, "end" + widthConst + "Max"]
		};
		// property names
		pn = dynProperties[dir];

		// .4 <= pConst <= .9
		if(typeof depth != "undefined"){
			depth = Math.max(0, Math.min(1, depth)) / 2;
			pConst = .4 + (.5 - depth);
		}else{
			pConst = Math.min(.9, Math.max(.4, dims[pn[5].toLowerCase()] / dims[pn[4].toLowerCase()]));
		}
		var p0 = props[0];
		for(var i = 4; i < 6; i++){
			if(axis == "center" || axis == "cube"){ // find a better name for "cube"
				dims["end" + pn[i] + "Min"] = dims[pn[i].toLowerCase()] * pConst;
				dims["end" + pn[i] + "Max"] = dims[pn[i].toLowerCase()] / pConst;
			}else if(axis == "shortside"){
				dims["end" + pn[i] + "Min"] = dims[pn[i].toLowerCase()];
				dims["end" + pn[i] + "Max"] = dims[pn[i].toLowerCase()] / pConst;
			}else if(axis == "longside"){
				dims["end" + pn[i] + "Min"] = dims[pn[i].toLowerCase()] * pConst;
				dims["end" + pn[i] + "Max"] = dims[pn[i].toLowerCase()];
			}
		}
		if(axis == "center"){
			p0[pn[2].toLowerCase()] = dims[pn[2].toLowerCase()] - (dims[pn[8]] - dims[pn[6]]) / 4;
		}else if(axis == "shortside"){
			p0[pn[2].toLowerCase()] = dims[pn[2].toLowerCase()] - (dims[pn[8]] - dims[pn[6]]) / 2;
		}

		staticProps[pn[5].toLowerCase()] = dims[pn[5].toLowerCase()] + "px";
		staticProps[pn[4].toLowerCase()] = "0";
		staticProps[borderConst + pn[1] + widthConst] = dims[pn[4].toLowerCase()] + "px";
		staticProps[borderConst + pn[1] + "Color"] = bgColor;

		p0[borderConst + pn[1] + widthConst] = 0;
		p0[borderConst + pn[1] + "Color"] = darkColor;
		p0[borderConst + pn[2] + widthConst] = p0[borderConst + pn[3] + widthConst] = axis != "cube"
			? (dims["end" + pn[5] +	 "Max"] - dims["end" + pn[5] + "Min"]) / 2
			: dims[pn[6]] / 2
		;
		p0[pn[7].toLowerCase()] = dims[pn[7].toLowerCase()] + dims[pn[4].toLowerCase()] / 2 + (args.shift || 0);
		p0[pn[5].toLowerCase()] = dims[pn[6]];

		var p1 = props[1];
		p1[borderConst + pn[0] + "Color"] = { start: lightColor, end: endColor };
		p1[borderConst + pn[0] + widthConst] = dims[pn[4].toLowerCase()];
		p1[borderConst + pn[2] + widthConst] = 0;
		p1[borderConst + pn[3] + widthConst] = 0;
		p1[pn[5].toLowerCase()] = { start: dims[pn[6]], end: dims[pn[5].toLowerCase()] };

		lang.mixin(hs, staticProps);
		htmlUtil.style(helperNode, hs);
		winUtil.body().appendChild(helperNode);

		var finalize = function(){
//			helperNode.parentNode.removeChild(helperNode);
			domConstruct.destroy(helperNode);
			// fixes a flicker when the animation ends
			s.backgroundColor = endColor;
			s.visibility = "visible";
		};
		if(whichAnim == "last"){
			for(i in p0){
				p0[i] = { start: p0[i] };
			}
			p0[borderConst + pn[1] + "Color"] = { start: darkColor, end: endColor };
			p1 = p0;
		}
		if(!whichAnim || whichAnim == "first"){
			anims.push(baseFx.animateProperty({
				node: helperNode,
				duration: duration,
				properties: p0
			}));
		}
		if(!whichAnim || whichAnim == "last"){
			anims.push(baseFx.animateProperty({
				node: helperNode,
				duration: duration,
				properties: p1,
				onEnd: finalize
			}));
		}

		// hide the original node
		connectUtil.connect(anims[0], "play", function(){
			helperNode.style.visibility = "visible";
			s.visibility = "hidden";
		});

		return coreFx.chain(anims); // dojo.Animation

	}

	fxExt.flipCube = function(/*Object*/ args){
		// summary:
		//		An extension to `dojox.fx.flip` providing a more 3d-like rotation
		// description:
		//		An extension to `dojox.fx.flip` providing a more 3d-like rotation.
		//		Behaves the same as `dojox.fx.flip`, using the same attributes and
		//		other standard `dojo.Animation` properties.
		// example:
		//		See `dojox.fx.flip`
		var anims = [],
			mb = domGeom.getMarginBox(args.node),
			shiftX = mb.w / 2,
			shiftY = mb.h / 2,
			dims = {
				top: {
					pName: "height",
					args:[
						{
							whichAnim: "first",
							dir: "top",
							shift: -shiftY
						},
						{
							whichAnim: "last",
							dir: "bottom",
							shift: shiftY
						}
					]
				},
				right: {
					pName: "width",
					args:[
						{
							whichAnim: "first",
							dir: "right",
							shift: shiftX
						},
						{
							whichAnim: "last",
							dir: "left",
							shift: -shiftX
						}
					]
				},
				bottom: {
					pName: "height",
					args:[
						{
							whichAnim: "first",
							dir: "bottom",
							shift: shiftY
						},
						{
							whichAnim: "last",
							dir: "top",
							shift: -shiftY
						}
					]
				},
				left: {
					pName: "width",
					args:[
						{
							whichAnim: "first",
							dir: "left",
							shift: -shiftX
						},
						{
							whichAnim: "last",
							dir: "right",
							shift: shiftX
						}
					]
				}
			}
		;
		var d = dims[args.dir || "left"],
			p = d.args
		;
		args.duration = args.duration ? args.duration * 2 : 500;
		args.depth = .8;
		args.axis = "cube";
		for(var i = p.length - 1; i >= 0; i--){
			lang.mixin(args, p[i]);
			anims.push(fxExt.flip(args));
		}
		return coreFx.combine(anims);
	};
	
	fxExt.flipPage = function(/*Object*/ args){
		// summary:
		//		An extension to `dojox.fx.flip` providing a page flip like animation.
		// description:
		//		An extension to `dojox.fx.flip` providing a page flip effect.
		//		Behaves the same as `dojox.fx.flip`, using the same attributes and
		//		other standard `dojo.Animation` properties.
		// example:
		//		See `dojox.fx.flip`
		var n = args.node,
			coords = htmlUtil.coords(n, true),
			x = coords.x,
			y = coords.y,
			w = coords.w,
			h = coords.h,
			bgColor = htmlUtil.style(n, "backgroundColor"),
			lightColor = args.lightColor || "#dddddd",
			darkColor = args.darkColor,
			helperNode = domConstruct.create("div"),
			anims = [],
			hn = [],
			dir = args.dir || "right",
			pn = {
				left: ["left", "right", "x", "w"],
				top: ["top", "bottom", "y", "h"],
				right: ["left", "left", "x", "w"],
				bottom: ["top", "top", "y", "h"]
			},
			shiftMultiplier = {
				right: [1, -1],
				left: [-1, 1],
				top: [-1, 1],
				bottom: [1, -1]
			}
		;
		htmlUtil.style(helperNode, {
			position: "absolute",
			width  : w + "px",
			height : h + "px",
			top	   : y + "px",
			left   : x + "px",
			visibility: "hidden"
		});
		var hs = [];
		for(var i = 0; i < 2; i++){
			var r = i % 2,
				d = r ? pn[dir][1] : dir,
				wa = r ? "last" : "first",
				endColor = r ? bgColor : lightColor,
				startColor = r ? endColor : args.startColor || n.style.backgroundColor
			;
			hn[i] = lang.clone(helperNode);
			var finalize = function(x){
					return function(){
						domConstruct.destroy(hn[x]);
					}
				}(i)
			;
			winUtil.body().appendChild(hn[i]);
			hs[i] = {
				backgroundColor: r ? startColor : bgColor
			};
			
			hs[i][pn[dir][0]] = coords[pn[dir][2]] + shiftMultiplier[dir][0] * i * coords[pn[dir][3]] + "px";
			htmlUtil.style(hn[i], hs[i]);
			anims.push(dojox.fx.flip({
				node: hn[i],
				dir: d,
				axis: "shortside",
				depth: args.depth,
				duration: args.duration / 2,
				shift: shiftMultiplier[dir][i] * coords[pn[dir][3]] / 2,
				darkColor: darkColor,
				lightColor: lightColor,
				whichAnim: wa,
				endColor: endColor
			}));
			connectUtil.connect(anims[i], "onEnd", finalize);
		}
		return coreFx.chain(anims);
	};
	
	
	fxExt.flipGrid = function(/*Object*/ args){
		// summary:
		//		An extension to `dojox.fx.flip` providing a decomposition in rows * cols flipping elements
		// description:
		//		An extension to `dojox.fx.flip` providing a page flip effect.
		//		Behaves the same as `dojox.fx.flip`, using the same attributes and
		//		other standard `dojo.Animation` properties and
		//
		//		- cols: Integer columns
		//		- rows: Integer rows
		//		- duration: the single flip duration
		// example:
		//		See `dojox.fx.flip`
		var rows = args.rows || 4,
			cols = args.cols || 4,
			anims = [],
			helperNode = domConstruct.create("div"),
			n = args.node,
			coords = htmlUtil.coords(n, true),
			x = coords.x,
			y = coords.y,
			nw = coords.w,
			nh = coords.h,
			w = coords.w / cols,
			h = coords.h / rows,
			cAnims = []
		;
		htmlUtil.style(helperNode, {
			position: "absolute",
			width: w + "px",
			height: h + "px",
			backgroundColor: htmlUtil.style(n, "backgroundColor")
		});
		for(var i = 0; i < rows; i++){
			var r = i % 2,
				d = r ? "right" : "left",
				signum = r ? 1 : -1
			;
			// cloning
			var cn = lang.clone(n);
			htmlUtil.style(cn, {
				position: "absolute",
				width: nw + "px",
				height: nh + "px",
				top: y + "px",
				left: x + "px",
				clip: "rect(" + i * h + "px," + nw + "px," + nh + "px,0)"
			});
			winUtil.body().appendChild(cn);
			anims[i] = [];
			for(var j = 0; j < cols; j++){
				var hn = lang.clone(helperNode),
					l = r ? j : cols - (j + 1)
				;
				var adjustClip = function(xn, yCounter, xCounter){
					return function(){
						if(!(yCounter % 2)){
							htmlUtil.style(xn, {
								clip: "rect(" + yCounter * h + "px," + (nw - (xCounter + 1) * w ) + "px," + ((yCounter + 1) * h) + "px,0px)"
							});
						}else{
							htmlUtil.style(xn, {
								clip: "rect(" + yCounter * h + "px," + nw + "px," + ((yCounter + 1) * h) + "px," + ((xCounter + 1) * w) + "px)"
							});
						}
					}
				}(cn, i, j);
				winUtil.body().appendChild(hn);
				htmlUtil.style(hn, {
					left: x + l * w + "px",
					top: y + i * h + "px",
					visibility: "hidden"
				});
				var a = dojox.fx.flipPage({
				   node: hn,
				   dir: d,
				   duration: args.duration || 900,
				   shift: signum * w/2,
				   depth: .2,
				   darkColor: args.darkColor,
				   lightColor: args.lightColor,
				   startColor: args.startColor || args.node.style.backgroundColor
				}),
				removeHelper = function(xn){
					return function(){
						domConstruct.destroy(xn);
					}
				}(hn)
				;
				connectUtil.connect(a, "play", this, adjustClip);
				connectUtil.connect(a, "play", this, removeHelper);
				anims[i].push(a);
			}
			cAnims.push(coreFx.chain(anims[i]));
			
		}
		connectUtil.connect(cAnims[0], "play", function(){
			htmlUtil.style(n, {visibility: "hidden"});
		});
		return coreFx.combine(cAnims);
	};
	return fxExt;
});

},
'dojox/fx/_base':function(){
define("dojox/fx/_base", ["dojo/_base/array","dojo/_base/lang", "dojo/_base/fx", "dojo/fx", "dojo/dom", "dojo/dom-style",
	    "dojo/dom-geometry", "dojo/_base/connect", "dojo/_base/html"],
	function(arrayUtil, lang, baseFx, coreFx, dom, domStyle, domGeom, connectUtil, htmlUtil){

/*=====
return {
	// summary:
	//		Experimental and extended Animations beyond Dojo Core / Base functionality.
	//		Provides advanced Lines, Animations, and convenience aliases.
};
=====*/

var dojoxFx = lang.getObject("dojox.fx", true);

lang.mixin(dojoxFx, {

	// anim: Function
	//		Alias of `dojo.anim` - the shorthand `dojo.animateProperty` with auto-play
	anim: baseFx.anim,

	// animateProperty: Function
	//		Alias of `dojo.animateProperty` - animate any CSS property
	animateProperty: baseFx.animateProperty,

	// fadeTo: Function
	//		Fade an element from an opacity to an opacity.
	//		Omit `start:` property to detect. `end:` property is required.
	//		Ultimately an alias to `dojo._fade`
	fadeTo: baseFx._fade,

	// fadeIn: Function
	//		Alias of `dojo.fadeIn` - Fade a node in.
	fadeIn: baseFx.fadeIn,
	
	// fadeOut: Function
	//		Alias of `dojo.fadeOut` - Fades a node out.
	fadeOut: baseFx.fadeOut,

	// combine: Function
	//		Alias of `dojo.fx.combine` - Run an array of animations in parallel
	combine: coreFx.combine,

	// chain: Function
	//		Alias of `dojo.fx.chain` - Run an array of animations in sequence
	chain: coreFx.chain,

	// slideTo: Function
	//		Alias of `dojo.fx.slideTo` - Slide a node to a defined top/left coordinate
	slideTo: coreFx.slideTo,

	// wipeIn: Function
	//		Alias of `dojo.fx.wipeIn` - Wipe a node to visible
	wipeIn: coreFx.wipeIn,

	// wipeOut: Function
	//		Alias of `dojo.fx.wipeOut` - Wipe a node to non-visible
	wipeOut: coreFx.wipeOut
});


dojoxFx.sizeTo = function(/* Object */args){
	// summary:
	//		Creates an animation that will size a node
	//
	// description:
	//		Returns an animation that will size the target node
	//		defined in args Object about it's center to
	//		a width and height defined by (args.width, args.height),
	//		supporting an optional method: chain||combine mixin
	//		(defaults to chain).
	//
	//	- works best on absolutely or relatively positioned elements
	//
	// example:
	//	|	// size #myNode to 400px x 200px over 1 second
	//	|	dojo.fx.sizeTo({
	//	|		node:'myNode',
	//	|		duration: 1000,
	//	|		width: 400,
	//	|		height: 200,
	//	|		method: "combine"
	//	|	}).play();
	//

	var node = args.node = dom.byId(args.node),
		abs = "absolute";

	var method = args.method || "chain";
	if(!args.duration){ args.duration = 500; } // default duration needed
	if(method == "chain"){ args.duration = Math.floor(args.duration / 2); }
	
	var top, newTop, left, newLeft, width, height = null;

	var init = (function(n){
		return function(){
			var cs = domStyle.getComputedStyle(n),
				pos = cs.position,
				w = cs.width,
				h = cs.height
			;
			
			top = (pos == abs ? n.offsetTop : parseInt(cs.top) || 0);
			left = (pos == abs ? n.offsetLeft : parseInt(cs.left) || 0);
			width = (w == "auto" ? 0 : parseInt(w));
			height = (h == "auto" ? 0 : parseInt(h));
			
			newLeft = left - Math.floor((args.width - width) / 2);
			newTop = top - Math.floor((args.height - height) / 2);

			if(pos != abs && pos != 'relative'){
				var ret = domStyle.coords(n, true);
				top = ret.y;
				left = ret.x;
				n.style.position = abs;
				n.style.top = top + "px";
				n.style.left = left + "px";
			}
		}
	})(node);

	var anim1 = baseFx.animateProperty(lang.mixin({
		properties: {
			height: function(){
				init();
				return { end: args.height || 0, start: height };
			},
			top: function(){
				return { start: top, end: newTop };
			}
		}
	}, args));
	var anim2 = baseFx.animateProperty(lang.mixin({
		properties: {
			width: function(){
				return { start: width, end: args.width || 0 }
			},
			left: function(){
				return { start: left, end: newLeft }
			}
		}
	}, args));

	var anim = coreFx[(args.method == "combine" ? "combine" : "chain")]([anim1, anim2]);
	return anim; // dojo.Animation

};

dojoxFx.slideBy = function(/* Object */args){
	// summary:
	//		Returns an animation to slide a node by a defined offset.
	//
	// description:
	//		Returns an animation that will slide a node (args.node) from it's
	//		current position to it's current posision plus the numbers defined
	//		in args.top and args.left. standard dojo.fx mixin's apply.
	//
	// example:
	//	|	// slide domNode 50px down, and 22px left
	//	|	dojox.fx.slideBy({
	//	|		node: domNode, duration:400,
	//	|		top: 50, left: -22
	//	|	}).play();

	var node = args.node = dom.byId(args.node),
		top, left;

	var init = (function(n){
		return function(){
			var cs = domStyle.getComputedStyle(n);
			var pos = cs.position;
			top = (pos == 'absolute' ? n.offsetTop : parseInt(cs.top) || 0);
			left = (pos == 'absolute' ? n.offsetLeft : parseInt(cs.left) || 0);
			if(pos != 'absolute' && pos != 'relative'){
				var ret = domGeom.coords(n, true);
				top = ret.y;
				left = ret.x;
				n.style.position = "absolute";
				n.style.top = top + "px";
				n.style.left = left + "px";
			}
		}
	})(node);
	init();
	
	var _anim = baseFx.animateProperty(lang.mixin({
		properties: {
			// FIXME: is there a way to update the _Line after creation?
			// null start values allow chaining to work, animateProperty will
			// determine them for us (except in ie6? -- ugh)
			top: top + (args.top || 0),
			left: left + (args.left || 0)
		}
	}, args));
	connectUtil.connect(_anim, "beforeBegin", _anim, init);
	return _anim; // dojo.Animation
};

dojoxFx.crossFade = function(/* Object */args){
	// summary:
	//		Returns an animation cross fading two element simultaneously
	// args:
	//		- args.nodes: Array - two element array of domNodes, or id's
	//
	//		all other standard animation args mixins apply. args.node ignored.

	// simple check for which node is visible, maybe too simple?
	var node1 = args.nodes[0] = dom.byId(args.nodes[0]),
		op1 = htmlUtil.style(node1,"opacity"),
		node2 = args.nodes[1] = dom.byId(args.nodes[1]),
		op2 = htmlUtil.style(node2, "opacity")
	;
	
	var _anim = coreFx.combine([
		baseFx[(op1 == 0 ? "fadeIn" : "fadeOut")](lang.mixin({
			node: node1
		},args)),
		baseFx[(op1 == 0 ? "fadeOut" : "fadeIn")](lang.mixin({
			node: node2
		},args))
	]);
	return _anim; // dojo.Animation
};

dojoxFx.highlight = function(/*Object*/ args){
	// summary:
	//		Highlight a node
	//
	// description:
	//		Returns an animation that sets the node background to args.color
	//		then gradually fades back the original node background color
	//
	// example:
	//	|	dojox.fx.highlight({ node:"foo" }).play();

	var node = args.node = dom.byId(args.node);

	args.duration = args.duration || 400;
	
	// Assign default color light yellow
	var startColor = args.color || '#ffff99',
		endColor = htmlUtil.style(node, "backgroundColor")
	;

	// safari "fix"
	// safari reports rgba(0, 0, 0, 0) (black) as transparent color, while
	// other browsers return "transparent", rendered as white by default by
	// dojo.Color; now dojo.Color maps "transparent" to
	// djConfig.transparentColor ([r, g, b]), if present; so we can use
	// the color behind the effect node
	if(endColor == "rgba(0, 0, 0, 0)"){
		endColor = "transparent";
	}

	var anim = baseFx.animateProperty(lang.mixin({
		properties: {
			backgroundColor: { start: startColor, end: endColor }
		}
	}, args));

	if(endColor == "transparent"){
		connectUtil.connect(anim, "onEnd", anim, function(){
			node.style.backgroundColor = endColor;
		});
	}

	return anim; // dojo.Animation
};

 
dojoxFx.wipeTo = function(/*Object*/ args){
	// summary:
	//		Animate a node wiping to a specific width or height
	//
	// description:
	//		Returns an animation that will expand the
	//		node defined in 'args' object from it's current to
	//		the height or width value given by the args object.
	//
	//		default to height:, so leave height null and specify width:
	//		to wipeTo a width. note: this may be deprecated by a
	//
	//		Note that the final value should not include
	//		units and should be an integer.  Thus a valid args object
	//		would look something like this:
	//
	//		|	dojox.fx.wipeTo({ node: "nodeId", height: 200 }).play();
	//
	//		Node must have no margin/border/padding, so put another
	//		node inside your target node for additional styling.

	args.node = dom.byId(args.node);
	var node = args.node, s = node.style;

	var dir = (args.width ? "width" : "height"),
		endVal = args[dir],
		props = {}
	;

	props[dir] = {
		// wrapped in functions so we wait till the last second to query (in case value has changed)
		start: function(){
			// start at current [computed] height, but use 1px rather than 0
			// because 0 causes IE to display the whole panel
			s.overflow = "hidden";
			if(s.visibility == "hidden" || s.display == "none"){
				s[dir] = "1px";
				s.display = "";
				s.visibility = "";
				return 1;
			}else{
				var now = htmlUtil.style(node,dir);
				return Math.max(now, 1);
			}
		},
		end: endVal
	};

	var anim = baseFx.animateProperty(lang.mixin({ properties: props }, args));
	return anim; // dojo.Animation
};

return dojoxFx;
});

},
'dojox/mobile/_compat':function(){
define("dojox/mobile/_compat", [
	"dojo/_base/array",	// array.forEach
	"dojo/_base/config",
	"dojo/_base/connect",	// connect.connect
	"dojo/_base/fx",	// fx.fadeOut, fx.fadeIn
	"dojo/_base/lang",	// lang.extend, lang.isArray
	"dojo/_base/sniff",		// has("webkit"), has("ie")
	"dojo/_base/window",	// win.doc, win.body
	"dojo/dom-class",
	"dojo/dom-construct",
	"dojo/dom-geometry",
	"dojo/dom-style",
	"dojo/fx",
	"dojo/fx/easing",
	"dojo/ready",
	"dojo/uacss",
	"dijit/registry",	// registry.byNode
	"dojox/fx",
	"dojox/fx/flip",
	"./EdgeToEdgeList",
	"./IconContainer",
	"./ProgressIndicator",
	"./RoundRect",
	"./RoundRectList",
	"./ScrollableView",
	"./Switch",
	"./View",
	"require"
], function(array, config, connect, bfx, lang, has, win, domClass, domConstruct, domGeometry, domStyle, fx, easing, ready, uacss, registry, xfx, flip, EdgeToEdgeList, IconContainer, ProgressIndicator, RoundRect, RoundRectList, ScrollableView, Switch, View, require){

	// module:
	//		dojox/mobile/compat

/*=====
return {
	// summary:
	//		CSS3 compatibility module.
	// description:
	//		This module provides to dojox/mobile support for some of the CSS3 features 
	//		in non-CSS3 browsers, such as IE or Firefox.
	//		If you require this module, when running in a non-CSS3 browser it directly 
	//		replaces some of the methods of	dojox/mobile classes, without any subclassing. 
	//		This way, HTML pages remain the same regardless of whether this compatibility 
	//		module is used or not.
	//
	//		Example of usage: 
	//		|	require([
	//		|		"dojox/mobile",
	//		|		"dojox/mobile/compat",
	//		|		...
	//		|	], function(...){
	//		|		...
	//		|	});
	//
	//		This module also loads compatibility CSS files, which have a -compat.css
	//		suffix. You can use either the `<link>` tag or `@import` to load theme
	//		CSS files. Then, this module searches for the loaded CSS files and loads
	//		compatibility CSS files. For example, if you load dojox/mobile/themes/iphone/iphone.css
	//		in a page, this module automatically loads dojox/mobile/themes/iphone/iphone-compat.css.
	//		If you explicitly load iphone-compat.css with `<link>` or `@import`,
	//		this module will not load again the already loaded file.
	//
	//		Note that, by default, compatibility CSS files are only loaded for CSS files located
	//		in a directory containing a "mobile/themes" path. For that, a matching is done using 
	//		the default pattern	"/\/mobile\/themes\/.*\.css$/". If a custom theme is not located 
	//		in a directory containing this path, the data-dojo-config needs to specify a custom 
	//		pattern using the "mblLoadCompatPattern" configuration parameter, for instance:
	//		|	data-dojo-config="mblLoadCompatPattern: /\/mycustomtheme\/.*\.css$/"
};
=====*/

	var dm = lang.getObject("dojox.mobile", true);

	if(!has("webkit")){
		lang.extend(View, {
			_doTransition: function(fromNode, toNode, transition, dir){
				var anim;
				this.wakeUp(toNode);
				var s1, s2;
				if(!transition || transition == "none"){
					toNode.style.display = "";
					fromNode.style.display = "none";
					toNode.style.left = "0px";
					this.invokeCallback();
				}else if(transition == "slide" || transition == "cover" || transition == "reveal"){
					var w = fromNode.offsetWidth;
					s1 = fx.slideTo({
						node: fromNode,
						duration: 400,
						left: -w*dir,
						top: domStyle.get(fromNode, "top")
					});
					s2 = fx.slideTo({
						node: toNode,
						duration: 400,
						left: 0,
						top: domStyle.get(toNode, "top")
					});
					toNode.style.position = "absolute";
					toNode.style.left = w*dir + "px";
					toNode.style.display = "";
					anim = fx.combine([s1,s2]);
					connect.connect(anim, "onEnd", this, function(){
						fromNode.style.display = "none";
						fromNode.style.left = "0px";
						toNode.style.position = "relative";
						var toWidget = registry.byNode(toNode);
						if(toWidget && !domClass.contains(toWidget.domNode, "out")){
							// Reset the temporary padding
							toWidget.containerNode.style.paddingTop = "";
						}
						this.invokeCallback();
					});
					anim.play();
				}else if(transition == "slidev" || transition == "coverv" || transition == "reavealv"){
					var h = fromNode.offsetHeight;
					s1 = fx.slideTo({
						node: fromNode,
						duration: 400,
						left: 0,
						top: -h*dir
					});
					s2 = fx.slideTo({
						node: toNode,
						duration: 400,
						left: 0,
						top: 0
					});
					toNode.style.position = "absolute";
					toNode.style.top = h*dir + "px";
					toNode.style.left = "0px";
					toNode.style.display = "";
					anim = fx.combine([s1,s2]);
					connect.connect(anim, "onEnd", this, function(){
						fromNode.style.display = "none";
						toNode.style.position = "relative";
						this.invokeCallback();
					});
					anim.play();
				}else if(transition == "flip"){
					anim = xfx.flip({
						node: fromNode,
						dir: "right",
						depth: 0.5,
						duration: 400
					});
					toNode.style.position = "absolute";
					toNode.style.left = "0px";
					connect.connect(anim, "onEnd", this, function(){
						fromNode.style.display = "none";
						toNode.style.position = "relative";
						toNode.style.display = "";
						this.invokeCallback();
					});
					anim.play();
				}else {
					// other transitions - "fade", "dissolve", "swirl"
					anim = fx.chain([
						bfx.fadeOut({
							node: fromNode,
							duration: 600
						}),
						bfx.fadeIn({
							node: toNode,
							duration: 600
						})
					]);
					toNode.style.position = "absolute";
					toNode.style.left = "0px";
					toNode.style.display = "";
					domStyle.set(toNode, "opacity", 0);
					connect.connect(anim, "onEnd", this, function(){
						fromNode.style.display = "none";
						toNode.style.position = "relative";
						domStyle.set(fromNode, "opacity", 1);
						this.invokeCallback();
					});
					anim.play();
				}
			},

			wakeUp: function(/*DomNode*/node){
				// summary:
				//		Function to force IE to redraw a node since its layout
				//		code tends to misrender in partial draws.
				// node: DomNode
				//		The node to forcibly redraw.
				// tags:
				//		public
				if(has("ie") && !node._wokeup){
					node._wokeup = true;
					var disp = node.style.display;
					node.style.display = "";
					var nodes = node.getElementsByTagName("*");
					for(var i = 0, len = nodes.length; i < len; i++){
						var val = nodes[i].style.display;
						nodes[i].style.display = "none";
						nodes[i].style.display = "";
						nodes[i].style.display = val;
					}
					node.style.display = disp;
				}
			}
		});	


		lang.extend(Switch, {
			_changeState: function(/*String*/state, /*Boolean*/anim){
				// summary:
				//		Function to toggle the switch state on the switch
				// state:
				//		The state to toggle, switch 'on' or 'off'
				// anim:
				//		Whether to use animation or not
				// tags:
				//		private
				var on = (state === "on");

				var pos;
				if(!on){
					pos = -this.inner.firstChild.firstChild.offsetWidth;
				}else{
					pos = 0;
				}

				this.left.style.display = "";
				this.right.style.display = "";

				var _this = this;
				var f = function(){
					domClass.remove(_this.domNode, on ? "mblSwitchOff" : "mblSwitchOn");
					domClass.add(_this.domNode, on ? "mblSwitchOn" : "mblSwitchOff");
					_this.left.style.display = on ? "" : "none";
					_this.right.style.display = !on ? "" : "none";
				};

				if(anim){
					var a = fx.slideTo({
						node: this.inner,
						duration: 300,
						left: pos,
						onEnd: f
					});
					a.play();
				}else{
					if(on || pos){
						this.inner.style.left = pos + "px";
					}
					f();
				}
			}
		});	


		lang.extend(ProgressIndicator, {
			scale: function(/*Number*/size){
				if(has("ie")){
					var dim = {w:size, h:size};
					domGeometry.setMarginBox(this.domNode, dim);
					domGeometry.setMarginBox(this.containerNode, dim);
				}else if(has("ff")){
					var scale = size / 40;
					domStyle.set(this.containerNode, {
						MozTransform: "scale(" + scale + ")",
						MozTransformOrigin: "0 0"
					});

					domGeometry.setMarginBox(this.domNode, {w:size, h:size});
					domGeometry.setMarginBox(this.containerNode, {w:size / scale, h:size / scale});
				}
			}
		});	


		if(has("ie")){
			lang.extend(RoundRect, {
				buildRendering: function(){
					// summary:
					//		Function to simulate the borderRadius appearance on
					//		IE, since IE does not support this CSS style.
					// tags:
					//		protected
					dm.createRoundRect(this);
					this.domNode.className = "mblRoundRect";
				}
			});


			RoundRectList._addChild = RoundRectList.prototype.addChild;
			RoundRectList._postCreate = RoundRectList.prototype.postCreate;
			lang.extend(RoundRectList, {
				buildRendering: function(){
					// summary:
					//		Function to simulate the borderRadius appearance on
					//		IE, since IE does not support this CSS style.
					// tags:
					//		protected
					dm.createRoundRect(this, true);
					this.domNode.className = "mblRoundRectList";
				},

				postCreate: function(){
					RoundRectList._postCreate.apply(this, arguments);
					this.redrawBorders();
				},

				addChild: function(widget, /*Number?*/insertIndex){
					RoundRectList._addChild.apply(this, arguments);
					this.redrawBorders();
					if(dm.applyPngFilter){
						dm.applyPngFilter(widget.domNode);
					}
				},

				redrawBorders: function(){
					// summary:
					//		Function to adjust the creation of RoundRectLists on IE.
					//		Removed undesired styles.
					// tags:
					//		public

					// Remove a border of the last ListItem.
					// This is for browsers that do not support the last-child CSS pseudo-class.

					if(this instanceof EdgeToEdgeList){ return; }
					var lastChildFound = false;
					for(var i = this.containerNode.childNodes.length - 1; i >= 0; i--){
						var c = this.containerNode.childNodes[i];
						if(c.tagName == "LI"){
							c.style.borderBottomStyle = lastChildFound ? "solid" : "none";
							lastChildFound = true;
						}
					}
				}
			});	


			lang.extend(EdgeToEdgeList, {
				buildRendering: function(){
				this.domNode = this.containerNode = this.srcNodeRef || win.doc.createElement("ul");
					this.domNode.className = "mblEdgeToEdgeList";
				}
			});


			IconContainer._addChild = IconContainer.prototype.addChild;
			lang.extend(IconContainer, {
				addChild: function(widget, /*Number?*/insertIndex){
					IconContainer._addChild.apply(this, arguments);
					if(dm.applyPngFilter){
						dm.applyPngFilter(widget.domNode);
					}
				}
			});


			lang.mixin(dm, {
				createRoundRect: function(_this, isList){
					// summary:
					//		Function to adjust the creation of rounded rectangles on IE.
					//		Deals with IE's lack of borderRadius support
					// tags:
					//		public
					var i, len;
					_this.domNode = win.doc.createElement("div");
					_this.domNode.style.padding = "0px";
					_this.domNode.style.backgroundColor = "transparent";
					_this.domNode.style.border = "none"; // borderStyle = "none"; doesn't work on IE9
					_this.containerNode = win.doc.createElement(isList?"ul":"div");
					_this.containerNode.className = "mblRoundRectContainer";
					if(_this.srcNodeRef){
						_this.srcNodeRef.parentNode.replaceChild(_this.domNode, _this.srcNodeRef);
						for(i = 0, len = _this.srcNodeRef.childNodes.length; i < len; i++){
							_this.containerNode.appendChild(_this.srcNodeRef.removeChild(_this.srcNodeRef.firstChild));
						}
						_this.srcNodeRef = null;
					}
					_this.domNode.appendChild(_this.containerNode);

					for(i = 0; i <= 5; i++){
						var top = domConstruct.create("div");
						top.className = "mblRoundCorner mblRoundCorner"+i+"T";
						_this.domNode.insertBefore(top, _this.containerNode);

						var bottom = domConstruct.create("div");
						bottom.className = "mblRoundCorner mblRoundCorner"+i+"B";
						_this.domNode.appendChild(bottom);
					}
				}
			});


			lang.extend(ScrollableView, {
				postCreate: function(){
					// On IE, margin-top of the first child does not seem to be effective,
					// probably because padding-top is specified for containerNode
					// to make room for a fixed header. This dummy node is a workaround for that.
					var dummy = domConstruct.create("div", {className:"mblDummyForIE", innerHTML:"&nbsp;"}, this.containerNode, "first");
					domStyle.set(dummy, {
						position: "relative",
						marginBottom: "-2px",
						fontSize: "1px"
					});
				}
			});
		} // if	(has("ie"))


		if(has("ie") <= 6){
			dm.applyPngFilter = function(root){
				root = root || win.body();
				var nodes = root.getElementsByTagName("IMG");
				var blank = require.toUrl("dojo/resources/blank.gif");
				for(var i = 0, len = nodes.length; i < len; i++){
					var img = nodes[i];
					var w = img.offsetWidth;
					var h = img.offsetHeight;
					if(w === 0 || h === 0){
						// The reason why the image has no width/height may be because
						// display is "none". If that is the case, let's change the
						// display to "" temporarily and see if the image returns them.
						if(domStyle.get(img, "display") != "none"){ continue; }
						img.style.display = "";
						w = img.offsetWidth;
						h = img.offsetHeight;
						img.style.display = "none";
						if(w === 0 || h === 0){ continue; }
					}
					var src = img.src;
					if(src.indexOf("resources/blank.gif") != -1){ continue; }
					img.src = blank;
					img.runtimeStyle.filter = "progid:DXImageTransform.Microsoft.AlphaImageLoader(src='" + src+"')";
					img.style.width = w + "px";
					img.style.height = h + "px";
				}
			};

			if(!dm._disableBgFilter && dm.createDomButton){
				dm._createDomButton_orig = dm.createDomButton;
				dm.createDomButton = function(/*DomNode*/refNode, /*Object?*/style, /*DomNode?*/toNode){
					var node = dm._createDomButton_orig.apply(this, arguments);
					if(node && node.className && node.className.indexOf("mblDomButton") !== -1){
						var f = function(){
							if(node.currentStyle && node.currentStyle.backgroundImage.match(/url.*(mblDomButton.*\.png)/)){
								var img = RegExp.$1;
								var src = require.toUrl("dojox/mobile/themes/common/domButtons/compat/") + img;
								node.runtimeStyle.filter = "progid:DXImageTransform.Microsoft.AlphaImageLoader(src='" + src+"',sizingMethod='crop')";
								node.style.background = "none";
							}
						};
						setTimeout(f, 1000);
						setTimeout(f, 5000);
					}
					return node;
				};
			}
		} // if(has("ie") <= 6)

		dm.loadCssFile = function(/*String*/file){
			// summary:
			//		Overrides dojox/mobile.loadCssFile() defined in
			//		deviceTheme.js.
			if(!dm.loadedCssFiles){ dm.loadedCssFiles = []; }
			if(win.doc.createStyleSheet){
				// for some reason, IE hangs when you try to load
				// multiple css files almost at once.
				setTimeout(function(file){
					return function(){
						var ss = win.doc.createStyleSheet(file);
						ss && dm.loadedCssFiles.push(ss.owningElement);
					};
				}(file), 0);
			}else{
				dm.loadedCssFiles.push(domConstruct.create("link", {
					href: file,
					type: "text/css",
					rel: "stylesheet"
				}, win.doc.getElementsByTagName('head')[0]));
			}
		};

		dm.loadCss = function(/*String|Array*/files){
			// summary:
			//		Function to load and register CSS files with the page
			// files: String|Array
			//		The CSS files to load and register with the page.
			// tags:
			//		private
			if(!dm._loadedCss){
				var obj = {};
				array.forEach(dm.getCssPaths(), function(path){
					obj[path] = true;
				});
				dm._loadedCss = obj;
			}
			if(!lang.isArray(files)){ files = [files]; }
			for(var i = 0; i < files.length; i++){
				var file = files[i];
				if(!dm._loadedCss[file]){
					dm._loadedCss[file] = true;
					dm.loadCssFile(file);
				}
			}
		};

		dm.getCssPaths = function(){
			var paths = [];
			var i, j, len;

			// find @import
			var s = win.doc.styleSheets;
			for(i = 0; i < s.length; i++){
				if(s[i].href){ continue; }
				var r = s[i].cssRules || s[i].imports;
				if(!r){ continue; }
				for(j = 0; j < r.length; j++){
					if(r[j].href){
						paths.push(r[j].href);
					}
				}
			}

			// find <link>
			var elems = win.doc.getElementsByTagName("link");
			for(i = 0, len = elems.length; i < len; i++){
				if(elems[i].href){
					paths.push(elems[i].href);
				}
			}
			return paths;
		};

		dm.loadCompatPattern = /\/mobile\/themes\/.*\.css$/;

		dm.loadCompatCssFiles = function(/*Boolean?*/force){
			// summary:
			//		Function to perform page-level adjustments on browsers such as
			//		IE and firefox.  It loads compat specific css files into the
			//		page header.
			if(has("ie") && !force){
				setTimeout(function(){ // IE needs setTimeout
					dm.loadCompatCssFiles(true);
				}, 0);
				return;
			}
			dm._loadedCss = undefined;
			var paths = dm.getCssPaths();
			for(var i = 0; i < paths.length; i++){
				var href = paths[i];
				// Load the -compat.css only for css files that belong to a theme. For that, by default
				// we match on directories containing "mobile/themes". If a custom theme is located
				// outside a "mobile/themes" directory, the dojoConfig needs to specify a custom 
				// pattern using the "mblLoadCompatPattern" configuration parameter, for instance:
				// data-dojo-config="mblLoadCompatPattern: /\/mycustom\/.*\.css$/"
				// Additionally, compat css files are loaded for css in the mobile/tests directory.
				if((href.match(config.mblLoadCompatPattern || dm.loadCompatPattern) || 
					location.href.indexOf("mobile/tests/") !== -1) && href.indexOf("-compat.css") === -1){
					var compatCss = href.substring(0, href.length-4)+"-compat.css";
					dm.loadCss(compatCss);
				}
			}
		};

		dm.hideAddressBar = function(/*Event?*/evt, /*Boolean?*/doResize){
			if(doResize !== false){ dm.resizeAll(); }
		};

		ready(function(){
			if(config["mblLoadCompatCssFiles"] !== false){
				dm.loadCompatCssFiles();
			}
			if(dm.applyPngFilter){
				dm.applyPngFilter();
			}
		});

	} // end of if(!has("webkit")){

	return dm;
});

}}});
define("dojo/mobile-compat-layer", [], 1);
