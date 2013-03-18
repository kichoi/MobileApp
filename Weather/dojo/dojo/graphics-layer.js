require({cache:{
'dojox/gfx/arc':function(){
define("dojox/gfx/arc", ["./_base", "dojo/_base/lang", "./matrix"], 
  function(g, lang, m){
	var twoPI = 2 * Math.PI, pi4 = Math.PI / 4, pi8 = Math.PI / 8,
		pi48 = pi4 + pi8, curvePI4 = unitArcAsBezier(pi8);

	function unitArcAsBezier(alpha){
		// summary:
		//		return a start point, 1st and 2nd control points, and an end point of
		//		a an arc, which is reflected on the x axis
		// alpha: Number
		//		angle in radians, the arc will be 2 * angle size
		var cosa  = Math.cos(alpha), sina  = Math.sin(alpha),
			p2 = {x: cosa + (4 / 3) * (1 - cosa), y: sina - (4 / 3) * cosa * (1 - cosa) / sina};
		return {	// Object
			s:  {x: cosa, y: -sina},
			c1: {x: p2.x, y: -p2.y},
			c2: p2,
			e:  {x: cosa, y: sina}
		};
	}

	var arc = g.arc = {
		// summary:
		//		This module contains the core graphics Arc functions.
		
		unitArcAsBezier: unitArcAsBezier,
		/*===== 
		unitArcAsBezier: function(alpha) {
			// summary:
			//		return a start point, 1st and 2nd control points, and an end point of
			//		a an arc, which is reflected on the x axis
			// alpha: Number
			//		angle in radians, the arc will be 2 * angle size
		},
		=====*/

		// curvePI4: Object
		//		an object with properties of an arc around a unit circle from 0 to pi/4
		curvePI4: curvePI4,

		arcAsBezier: function(last, rx, ry, xRotg, large, sweep, x, y){
			// summary:
			//		calculates an arc as a series of Bezier curves
			//		given the last point and a standard set of SVG arc parameters,
			//		it returns an array of arrays of parameters to form a series of
			//		absolute Bezier curves.
			// last: Object
			//		a point-like object as a start of the arc
			// rx: Number
			//		a horizontal radius for the virtual ellipse
			// ry: Number
			//		a vertical radius for the virtual ellipse
			// xRotg: Number
			//		a rotation of an x axis of the virtual ellipse in degrees
			// large: Boolean
			//		which part of the ellipse will be used (the larger arc if true)
			// sweep: Boolean
			//		direction of the arc (CW if true)
			// x: Number
			//		the x coordinate of the end point of the arc
			// y: Number
			//		the y coordinate of the end point of the arc

			// calculate parameters
			large = Boolean(large);
			sweep = Boolean(sweep);
			var xRot = m._degToRad(xRotg),
				rx2 = rx * rx, ry2 = ry * ry,
				pa = m.multiplyPoint(
					m.rotate(-xRot),
					{x: (last.x - x) / 2, y: (last.y - y) / 2}
				),
				pax2 = pa.x * pa.x, pay2 = pa.y * pa.y,
				c1 = Math.sqrt((rx2 * ry2 - rx2 * pay2 - ry2 * pax2) / (rx2 * pay2 + ry2 * pax2));
			if(isNaN(c1)){ c1 = 0; }
			var	ca = {
					x:  c1 * rx * pa.y / ry,
					y: -c1 * ry * pa.x / rx
				};
			if(large == sweep){
				ca = {x: -ca.x, y: -ca.y};
			}
			// the center
			var c = m.multiplyPoint(
				[
					m.translate(
						(last.x + x) / 2,
						(last.y + y) / 2
					),
					m.rotate(xRot)
				],
				ca
			);
			// calculate the elliptic transformation
			var elliptic_transform = m.normalize([
				m.translate(c.x, c.y),
				m.rotate(xRot),
				m.scale(rx, ry)
			]);
			// start, end, and size of our arc
			var inversed = m.invert(elliptic_transform),
				sp = m.multiplyPoint(inversed, last),
				ep = m.multiplyPoint(inversed, x, y),
				startAngle = Math.atan2(sp.y, sp.x),
				endAngle   = Math.atan2(ep.y, ep.x),
				theta = startAngle - endAngle;	// size of our arc in radians
			if(sweep){ theta = -theta; }
			if(theta < 0){
				theta += twoPI;
			}else if(theta > twoPI){
				theta -= twoPI;
			}

			// draw curve chunks
			var alpha = pi8, curve = curvePI4, step  = sweep ? alpha : -alpha,
				result = [];
			for(var angle = theta; angle > 0; angle -= pi4){
				if(angle < pi48){
					alpha = angle / 2;
					curve = unitArcAsBezier(alpha);
					step  = sweep ? alpha : -alpha;
					angle = 0;	// stop the loop
				}
				var c2, e, M = m.normalize([elliptic_transform, m.rotate(startAngle + step)]);
				if(sweep){
					c1 = m.multiplyPoint(M, curve.c1);
					c2 = m.multiplyPoint(M, curve.c2);
					e  = m.multiplyPoint(M, curve.e );
				}else{
					c1 = m.multiplyPoint(M, curve.c2);
					c2 = m.multiplyPoint(M, curve.c1);
					e  = m.multiplyPoint(M, curve.s );
				}
				// draw the curve
				result.push([c1.x, c1.y, c2.x, c2.y, e.x, e.y]);
				startAngle += 2 * step;
			}
			return result;	// Array
		}
	};
	
	return arc;
});

},
'dojox/gfx/VectorText':function(){
define("dojox/gfx/VectorText", ["dojo/_base/lang","dojo/_base/declare","dojo/_base/array", "dojo/_base/loader" /* dojo._getText */,
	    "dojo/_base/xhr","./_base", "dojox/xml/DomParser", "dojox/html/metrics","./matrix"],
function (lang,declare,arr,loader,xhr,gfx,xmlDomParser,HtmlMetrics,Matrix){
	var _getText = function(url){
		var result;
		xhr.get({url:url, sync:true, load:function(text){ // Note synchronous!
			result = text;
		}});
		return result;
	};

	 lang.getObject("dojox.gfx.VectorText", true);

	 lang.mixin(gfx, {
		  vectorFontFitting: {
			  NONE: 0,	//		render text according to passed size.
			  FLOW: 1,		//		render text based on the passed width and size
			  FIT: 2			//		render text based on a passed viewbox.
		  },
		  defaultVectorText: {
			  type:"vectortext", x:0, y:0, width: null, height: null,
			  text: "", align: "start", decoration: "none", fitting: 0,	//		vectorFontFitting.NONE
			  leading: 1.5	//		in ems.
		  },
		  defaultVectorFont: {
			  type:"vectorfont", size: "10pt", family: null
		  },
		  _vectorFontCache: {},
		  _svgFontCache: {},
		  getVectorFont: function(/* String */url){
			  if(gfx._vectorFontCache[url]){
				  return gfx._vectorFontCache[url];
			  }
			  return new gfx.VectorFont(url);
		  }
	 });

	// TODO: Make up your mind.   Module is called VectorText but it's creating and returning a global called VectorFont

	return declare("dojox.gfx.VectorFont", null, {
		// summary:
		//		An implementation of the SVG Font 1.1 spec, using dojox/gfx.
		//
		//		Basic interface:
		//	|	var f = new gfx.Font(url|string);
		//	|	surface||group.createVectorText(text)
		//	|	.setFill(fill)
		//	|	.setStroke(stroke)
		//	|	.setFont(fontStyleObject);
		//
		//		The arguments passed to createVectorText are the same as you would
		//		pass to surface||group.createText; the difference is that this
		//		is entirely renderer-agnostic, and the return value is a subclass
		//		of dojox/gfx.Group.
		//
		//		Note also that the "defaultText" object is slightly different:
		//		{ type:"vectortext", x:0, y:0, width:null, height: null,
		//		text: "", align: "start", decoration: "none" }
		//
		//		...as well as the "defaultVectorFont" object:
		//		{ type:"vectorfont", size:"10pt" }
		//
		//		The reason for this should be obvious: most of the style for the font is defined
		//		by the font object itself.
		//
		//		Note that this will only render IF and WHEN you set the font.

		_entityRe: /&(quot|apos|lt|gt|amp|#x[^;]+|#\d+);/g,
		_decodeEntitySequence: function(str){
			//		unescape the unicode sequences

			//		nothing to decode
			if(!str.match(this._entityRe)){ return; }  // undefined
			var xmlEntityMap = {
				amp:"&", apos:"'", quot:'"', lt:"<", gt:">"
			};

			//		we have at least one encoded entity.
			var r, tmp="";
			while((r=this._entityRe.exec(str))!==null){
				if(r[1].charAt(1)=="x"){
					tmp += String.fromCharCode(parseInt(r[1].slice(2), 16));
				}
				else if(!isNaN(parseInt(r[1].slice(1),10))){
					tmp += String.fromCharCode(parseInt(r[1].slice(1), 10));
				}
				else {
					tmp += xmlEntityMap[r[1]] || "";
				}
			}
			return tmp;	//		String
		},
		_parse: function(/* String */svg, /* String */url){
			// summary:
			//		Take the loaded SVG Font definition file and convert the info
			//		into things we can use. The SVG Font definition must follow
			//		the SVG 1.1 Font specification.
			var doc = gfx._svgFontCache[url]||xmlDomParser.parse(svg);

			//		font information
			var f = doc.documentElement.byName("font")[0], face = doc.documentElement.byName("font-face")[0];
			var unitsPerEm = parseFloat(face.getAttribute("units-per-em")||1000, 10);
			var advance = {
				x: parseFloat(f.getAttribute("horiz-adv-x"), 10),
				y: parseFloat(f.getAttribute("vert-adv-y")||0, 10)
			};
			if(!advance.y){
				advance.y = unitsPerEm;
			}

			var origin = {
				horiz: {
					x: parseFloat(f.getAttribute("horiz-origin-x")||0, 10),
					y: parseFloat(f.getAttribute("horiz-origin-y")||0, 10)
				},
				vert: {
					x: parseFloat(f.getAttribute("vert-origin-x")||0, 10),
					y: parseFloat(f.getAttribute("vert-origin-y")||0, 10)
				}
			};

			//		face information
			var family = face.getAttribute("font-family"),
				style = face.getAttribute("font-style")||"all",
				variant = face.getAttribute("font-variant")||"normal",
				weight = face.getAttribute("font-weight")||"all",
				stretch = face.getAttribute("font-stretch")||"normal",

				//		additional info, may not be needed
				range = face.getAttribute("unicode-range")||"U+0-10FFFF",
				panose = face.getAttribute("panose-1") || "0 0 0 0 0 0 0 0 0 0",
				capHeight = face.getAttribute("cap-height"),
				ascent = parseFloat(face.getAttribute("ascent")||(unitsPerEm-origin.vert.y), 10),
				descent = parseFloat(face.getAttribute("descent")||origin.vert.y, 10),
				baseline = {};

			//		check for font-face-src/font-face-name
			var name = family;
			if(face.byName("font-face-name")[0]){
				name = face.byName("font-face-name")[0].getAttribute("name");
			}

			//		see if this is cached already, and if so, forget the rest of the parsing.
			if(gfx._vectorFontCache[name]){ return; }

			//		get any provided baseline alignment offsets.
			arr.forEach(["alphabetic", "ideographic", "mathematical", "hanging" ], function(attr){
				var a = face.getAttribute(attr);
				if(a !== null /* be explicit, might be 0 */){
					baseline[attr] = parseFloat(a, 10);
				}
			});

		/*
			//		TODO: decoration hinting.
			var decoration = { };
			arr.forEach(["underline", "strikethrough", "overline"], function(type){
				if(face.getAttribute(type+"-position")!=null){
					decoration[type]={ };
				}
			});
		*/

			//		missing glyph info
			var missing = parseFloat(doc.documentElement.byName("missing-glyph")[0].getAttribute("horiz-adv-x")||advance.x, 10);

			//		glyph information
			var glyphs = {}, glyphsByName={}, g=doc.documentElement.byName("glyph");
			arr.forEach(g, function(node){
				//		we are going to assume the following:
				//		1) we have the unicode attribute
				//		2) we have the name attribute
				//		3) we have the horiz-adv-x and d attributes.
				var code = node.getAttribute("unicode"),
					name = node.getAttribute("glyph-name"),
					xAdv = parseFloat(node.getAttribute("horiz-adv-x")||advance.x, 10),
					path = node.getAttribute("d");

				//		unescape the unicode sequences
				if(code.match(this._entityRe)){
					code = this._decodeEntitySequence(code);
				}

				// build our glyph objects
				var o = { code: code, name: name, xAdvance: xAdv, path: path };
				glyphs[code]=o;
				glyphsByName[name]=o;
			}, this);

			//		now the fun part: look for kerning pairs.
			var hkern=doc.documentElement.byName("hkern");
			arr.forEach(hkern, function(node, i){
				var k = -parseInt(node.getAttribute("k"),10);
				//		look for either a code or a name
				var u1=node.getAttribute("u1"),
					g1=node.getAttribute("g1"),
					u2=node.getAttribute("u2"),
					g2=node.getAttribute("g2"),
					gl;

				if(u1){
					//		the first of the pair is a sequence of unicode characters.
					//		TODO: deal with unicode ranges and mulitple characters.
					u1 = this._decodeEntitySequence(u1);
					if(glyphs[u1]){
						gl = glyphs[u1];
					}
				} else {
					//		we are referring to a name.
					//		TODO: deal with multiple names
					if(glyphsByName[g1]){
						gl = glyphsByName[g1];
					}
				}

				if(gl){
					if(!gl.kern){ gl.kern = {}; }
					if(u2){
						//		see the notes above.
						u2 = this._decodeEntitySequence(u2);
						gl.kern[u2] = { x: k };
					} else {
						if(glyphsByName[g2]){
							gl.kern[glyphsByName[g2].code] = { x: k };
						}
					}
				}
			}, this);

			//		pop the final definition in the font cache.
			lang.mixin(this, {
				family: family,
				name: name,
				style: style,
				variant: variant,
				weight: weight,
				stretch: stretch,
				range: range,
				viewbox: { width: unitsPerEm, height: unitsPerEm },
				origin: origin,
				advance: lang.mixin(advance, {
					missing:{ x: missing, y: missing }
				}),
				ascent: ascent,
				descent: descent,
				baseline: baseline,
				glyphs: glyphs
			});

			//		cache the parsed font
			gfx._vectorFontCache[name] = this;
			gfx._vectorFontCache[url] = this;
			if(name!=family && !gfx._vectorFontCache[family]){
				gfx._vectorFontCache[family] = this;
			}

			//		cache the doc
			if(!gfx._svgFontCache[url]){
				gfx._svgFontCache[url]=doc;
			}
		},
		_clean: function(){
			// summary:
			//		Clean off all of the given mixin parameters.
			var name = this.name, family = this.family;
			arr.forEach(["family","name","style","variant",
				"weight","stretch","range","viewbox",
				"origin","advance","ascent","descent",
				"baseline","glyphs"], function(prop){
					try{ delete this[prop]; } catch(e) { }
			}, this);

			//		try to pull out of the font cache.
			if(gfx._vectorFontCache[name]){
				delete gfx._vectorFontCache[name];
			}
			if(gfx._vectorFontCache[family]){
				delete gfx._vectorFontCache[family];
			}
			return this;
		},

		constructor: function(/* String|dojo._Url */url){
			// summary:
			//		Create this font object based on the SVG Font definition at url.
			// url:
			//		An url pointing to the SVG Font definition.
			this._defaultLeading = 1.5;
			if(url!==undefined){
				this.load(url);
			}
		},
		load: function(/* String|dojo._Url */url){
			// summary:
			//		Load the passed SVG and send it to the parser for parsing.
			// url:
			//		The svg to parse.
			this.onLoadBegin(url.toString());
			this._parse(
				gfx._svgFontCache[url.toString()]||_getText(url.toString()),
				url.toString()
			);
			this.onLoad(this);
			return this;	//		dojox/gfx.VectorFont
		},
		initialized: function(){
			// summary:
			//		Return if we've loaded a font def, and the parsing was successful.
			return (this.glyphs!==null);	//		Boolean
		},

		//		preset round to 3 places.
		_round: function(n){ return Math.round(1000*n)/1000; },
		_leading: function(unit){ return this.viewbox.height * (unit||this._defaultLeading); },
		_normalize: function(str){
			return str.replace(/\s+/g, String.fromCharCode(0x20));
		},

		_getWidth: function(glyphs){
			var w=0, last=0, lastGlyph=null;
			arr.forEach(glyphs, function(glyph, i){
				last=glyph.xAdvance;
				if(glyphs[i] && glyph.kern && glyph.kern[glyphs[i].code]){
					last += glyph.kern[glyphs[i].code].x;
				}
				w += last;
				lastGlyph = glyph;
			});

			//		if the last glyph was a space, pull it off.
			if(lastGlyph && lastGlyph.code == " "){
				w -= lastGlyph.xAdvance;
			}

			return this._round(w/*-last*/);
		},

		_getLongestLine: function(lines){
			var maxw=0, idx=0;
			arr.forEach(lines, function(line, i){
				var max = Math.max(maxw, this._getWidth(line));
				if(max > maxw){
					maxw = max;
					idx=i;
				}
			}, this);
			return { width: maxw, index: idx, line: lines[idx] };
		},

		_trim: function(lines){
			var fn = function(arr){
				//		check if the first or last character is a space and if so, remove it.
				if(!arr.length){ return; }
				if(arr[arr.length-1].code == " "){ arr.splice(arr.length-1, 1); }
				if(!arr.length){ return; }
				if(arr[0].code == " "){ arr.splice(0, 1); }
			};

			if(lang.isArray(lines[0])){
				//		more than one line.
				arr.forEach(lines, fn);
			} else {
				fn(lines);
			}
			return lines;
		},

		_split: function(chars, nLines){
			// summary:
			//		split passed chars into nLines by finding the closest whitespace.
			var w = this._getWidth(chars),
				limit = Math.floor(w/nLines),
				lines = [],
				cw = 0,
				c = [],
				found = false;

			for(var i=0, l=chars.length; i<l; i++){
				if(chars[i].code == " "){ found = true; }
				cw += chars[i].xAdvance;
				if(i+1<l && chars[i].kern && chars[i].kern[chars[i+1].code]){
					cw += chars[i].kern[chars[i+1].code].x;
				}

				if(cw>=limit){
					var chr=chars[i];
					while(found && chr.code != " " && i>=0){
						chr = c.pop(); i--;
					}
					lines.push(c);
					c=[];
					cw=0;
					found=false;
				}
				c.push(chars[i]);
			}
			if(c.length){ lines.push(c); }
			//		"trim" it
			return this._trim(lines);
		},

		_getSizeFactor: function(size){
			//		given the size, return a scaling factor based on the height of the
			//		font as defined in the font definition file.
			size += "";	//		force the string cast.
			var metrics = HtmlMetrics.getCachedFontMeasurements(),
				height=this.viewbox.height,
				f=metrics["1em"],
				unit=parseFloat(size, 10);	//		the default.
			if(size.indexOf("em")>-1){
				return this._round((metrics["1em"]*unit)/height);
			}
			else if(size.indexOf("ex")>-1){
				return this._round((metrics["1ex"]*unit)/height);
			}
			else if(size.indexOf("pt")>-1){
				return this._round(((metrics["12pt"] / 12)*unit) / height);
			}
			else if(size.indexOf("px")>-1){
				return this._round(((metrics["16px"] / 16)*unit) / height);
			}
			else if(size.indexOf("%")>-1){
				return this._round((metrics["1em"]*(unit / 100)) / height);
			}
			else {
				f=metrics[size]||metrics.medium;
				return this._round(f/height);
			}
		},

		_getFitFactor: function(lines, w, h, l){
			// summary:
			//		Find the scaling factor for the given phrase set.
			if(!h){
				//		if no height was passed, we assume an array of glyphs instead of lines.
				return this._round(w/this._getWidth(lines));
			} else {
				var maxw = this._getLongestLine(lines).width,
					maxh = (lines.length*(this.viewbox.height*l))-((this.viewbox.height*l)-this.viewbox.height);
				return this._round(Math.min(w/maxw, h/maxh));
			}
		},
		_getBestFit: function(chars, w, h, ldng){
			// summary:
			//		Get the best number of lines to return given w and h.
			var limit=32,
				factor=0,
				lines=limit;
			while(limit>0){
				var f=this._getFitFactor(this._split(chars, limit), w, h, ldng);
				if(f>factor){
					factor = f;
					lines=limit;
				}
				limit--;
			}
			return { scale: factor, lines: this._split(chars, lines) };
		},

		_getBestFlow: function(chars, w, scale){
			// summary:
			//		Based on the given scale, do the best line splitting possible.
			var lines = [],
				cw = 0,
				c = [],
				found = false;
			for(var i=0, l=chars.length; i<l; i++){
				if(chars[i].code == " "){ found = true; }
				var tw = chars[i].xAdvance;
				if(i+1<l && chars[i].kern && chars[i].kern[chars[i+1].code]){
					tw += chars[i].kern[chars[i+1].code].x;
				}
				cw += scale*tw;

				if(cw>=w){
					var chr=chars[i];
					while(found && chr.code != " " && i>=0){
						chr = c.pop(); i--;
					}
					lines.push(c);
					c=[];
					cw=0;
					found=false;
				}
				c.push(chars[i]);
			}
			if(c.length){ lines.push(c); }
			return this._trim(lines);
		},

		//		public functions
		getWidth: function(/* String */text, /* Float? */scale){
			// summary:
			//		Get the width of the rendered text without actually rendering it.
			// text:
			//		The string to measure.
			// scale:
			//		an optional scaling factor.
			return this._getWidth(arr.map(this._normalize(text).split(""), function(chr){
				return this.glyphs[chr] || { xAdvance: this.advance.missing.x };
			}, this)) * (scale || 1);	//		Float
		},
		getLineHeight: function(/* Float? */scale){
			// summary:
			//		return the height of a single line, sans leading, based on scale.
			// scale:
			//		an optional scaling factor.
			return this.viewbox.height * (scale || 1);	//		Float
		},

		//		A note:
		//		Many SVG exports do not include information such as x-height, caps-height
		//		and other coords that may help alignment.  We can calc the baseline and
		//		we can get a mean line (i.e. center alignment) but that's about all, reliably.
		getCenterline: function(/* Float? */scale){
			// summary:
			//		return the y coordinate that is the center of the viewbox.
			// scale:
			//		an optional scaling factor.
			return (scale||1) * (this.viewbox.height/2);
		},
		getBaseline: function(/* Float? */scale){
			// summary:
			//		Find the baseline coord for alignment; adjust for scale if passed.
			// scale:
			//		an optional scaling factor.
			return (scale||1) * (this.viewbox.height+this.descent);	//		Float
		},

		draw: function(
				/* dojox/gfx.Container */group,
				/* dojox/gfx.Text */ textArgs,
				/* dojox/gfx.Font */fontArgs,
				/* dojox/gfx.Fill */fillArgs,
				/* dojox/gfx.Stroke */strokeArgs){
			// summary:
			//		based on the passed parameters, draw the given text using paths
			//		defined by this font.
			// description:
			//		The main method of a VectorFont, draw() will take a text fragment
			//		and render it in a set of groups and paths based on the parameters
			//		passed.
			//
			//		The basics of drawing text are simple enough: pass it your text as
			//		part of the textArgs object, pass size and family info as part of
			//		the fontArgs object, pass at least a color as the fillArgs object,
			//		and if you are looking to create an outline, pass the strokeArgs
			//		object as well. fillArgs and strokeArgs are the same as any other
			//		gfx fill and stroke arguments; they are simply applied to any path
			//		object generated by this method.
			//
			//		Resulting GFX structure
			//		-----------------------
			//
			//		The result of this function is a set of gfx objects in the following structure:
			//
			//	|	gfx.Group 			//		the parent group generated by this function
			//	|	+	gfx.Group[]		//		a group generated for each line of text
			//	|		+	gfx.Path[]	//		each glyph/character in the text
			//
			//		Scaling transformations (i.e. making the generated text the correct size)
			//		are always applied to the parent Group that is generated (i.e. the top
			//		node in the above example).  In theory, if you are looking to do any kind
			//		of other transformations (such as a translation), you should apply it to
			//		the group reference you pass to this method.  If you find that you need
			//		to apply transformations to the group that is returned by this method,
			//		you will need to reapply the scaling transformation as the *last* transform,
			//		like so:
			//
			//	|	textGroup.setTransform(new matrix.Matrix2D([
			//	|		matrix.translate({ dx: dx, dy: dy }),
			//	|		textGroup.getTransform()
			//	|	]));
			//
			//		In general, this should never be necessary unless you are doing advanced
			//		placement of your text.
			//
			//		Advanced Layout Functionality
			//		-----------------------------
			//
			//		In addition to straight text fragments, draw() supports a few advanced
			//		operations not normally available with vector graphics:
			//
			//		- Flow operations (i.e. wrap to a given width)
			//		- Fitting operations (i.e. find a best fit to a given rectangle)
			//
			//		To enable either, pass a `fitting` property along with the textArgs object.
			//		The possible values are contained in the dojox/gfx.vectorFontFitting enum
			//		(NONE, FLOW, FIT).
			//
			//		`Flow fitting`
			//		Flow fitting requires both a passed size (in the fontArgs object) and a
			//		width (passed with the textArgs object).  draw() will attempt to split the
			//		passed text up into lines, at the closest whitespace according to the
			//		passed width.  If a width is missing, it will revert to NONE.
			//
			//		`Best fit fitting`
			//		Doing a "best fit" means taking the passed text, and finding the largest
			//		size and line breaks so that it is the closest fit possible.  With best
			//		fit, any size arguments are ignored; if a height is missing, it will revert
			//		to NONE.
			//
			//		Other notes
			//		-----------
			//
			//		`a11y`
			//		Since the results of this method are rendering using pure paths (think
			//		"convert to outlines" in Adobe Illustrator), any text rendered by this
			//		code is NOT considered a11y-friendly.  If a11y is a requirement, we
			//		suggest using other, more a11y-friendly methods.
			//
			//		`Font sources`
			//		Always make sure that you are legally allowed to use any fonts that you
			//		convert to SVG format; we claim no responsibility for any licensing
			//		infractions that may be caused by the use of this code.
			// returns: dojox/gfx.Group
			if(!this.initialized()){
				throw new Error("dojox.gfx.VectorFont.draw(): we have not been initialized yet.");
			}
			//		TODO: BIDI handling.  Deal with layout/alignments based on font parameters.

			//		start by creating the overall group.  This is the INNER group (the caller
			//		should be the outer).
			var g = group.createGroup();

			//		do the x/y translation on the parent group
			//		FIXME: this is probably not the best way of doing this.
			if(textArgs.x || textArgs.y){
				group.applyTransform({ dx: textArgs.x||0, dy: textArgs.y||0 });
			}

			//		go get the glyph array.
			var text = arr.map(this._normalize(textArgs.text).split(""), function(chr){
				return this.glyphs[chr] || { path:null, xAdvance: this.advance.missing.x };
			}, this);

			//		determine the font style info, ignore decoration.
			var size = fontArgs.size,
				fitting = textArgs.fitting,
				width = textArgs.width,
				height = textArgs.height,
				align = textArgs.align,
				leading = textArgs.leading||this._defaultLeading;

			//		figure out if we have to do fitting at all.
			if(fitting){
				//		more than zero.
				if((fitting==gfx.vectorFontFitting.FLOW && !width) || (fitting==gfx.vectorFontFitting.FIT && (!width || !height))){
					//		reset the fitting if we don't have everything we need.
					fitting = gfx.vectorFontFitting.NONE;
				}
			}

			//		set up the lines array and the scaling factor.
			var lines, scale;
			switch(fitting){
				case gfx.vectorFontFitting.FIT:
					var o=this._getBestFit(text, width, height, leading);
					scale = o.scale;
					lines = o.lines;
					break;

				case gfx.vectorFontFitting.FLOW:
					scale = this._getSizeFactor(size);
					lines = this._getBestFlow(text, width, scale);
					break;

				default:
					scale = this._getSizeFactor(size);
					lines = [ text ];

			}

			//		make sure lines doesn't have any empty lines.
			lines = arr.filter(lines, function(item){
				return item.length>0;
			});

			//		let's start drawing.
			var cy = 0,
				maxw = this._getLongestLine(lines).width;

			for(var i=0, l=lines.length; i<l; i++){
				var cx = 0,
					line=lines[i],
					linew = this._getWidth(line),
					lg=g.createGroup();

				//		loop through the glyphs and add them to the line group (lg)
				for (var j=0; j<line.length; j++){
					var glyph=line[j];
					if(glyph.path!==null){
						var p = lg.createPath(glyph.path).setFill(fillArgs);
						if(strokeArgs){ p.setStroke(strokeArgs); }
						p.setTransform([
							Matrix.flipY,
							Matrix.translate(cx, -this.viewbox.height-this.descent)
						]);
					}
					cx += glyph.xAdvance;
					if(j+1<line.length && glyph.kern && glyph.kern[line[j+1].code]){
						cx += glyph.kern[line[j+1].code].x;
					}
				}

				//		transform the line group.
				var dx = 0;
				if(align=="middle"){ dx = maxw/2 - linew/2; }
				else if(align=="end"){ dx = maxw - linew; }
				lg.setTransform({ dx: dx, dy: cy });
				cy += this.viewbox.height * leading;
			}

			//		scale the group
			g.setTransform(Matrix.scale(scale));

			//		return the overall group
			return g;	//		dojox/gfx.Group
		},

		//		events
		onLoadBegin: function(/* String */url){ },
		onLoad: function(/* dojox/gfx/VectorText */font){ }
	});

	//		TODO: dojox/gfx integration
/*

	//		Inherit from Group but attach Text properties to it.
	dojo.declare("dojox.gfx.VectorText", dojox.gfx.Group, {
		constructor: function(rawNode){
			dojox.gfx.Group._init.call(this);
			this.fontStyle = null;
		},

		//		private methods.
		_setFont: function(){
			//		render this using the font code.
			var f = this.fontStyle;
			var font = dojox.gfx._vectorFontCache[f.family];
			if(!font){
				throw new Error("dojox.gfx.VectorText._setFont: the passed font family '" + f.family + "' was not found.");
			}

			//		the actual rendering belongs to the font itself.
			font.draw(this, this.shape, this.fontStyle, this.fillStyle, this.strokeStyle);
		},

		getFont: function(){ return this.fontStyle; },

		//		overridden public methods.
		setShape: function(newShape){
			dojox.gfx.Group.setShape.call(this);
			this.shape = dojox.gfx.makeParameters(this.shape, newShape);
			this.bbox = null;
			this._setFont();
			return this;
		},

		//		if we've been drawing, we should have exactly one child, and that
		//		child will contain the real children.
		setFill: function(fill){
			this.fillStyle = fill;
			if(this.children[0]){
				dojo.forEach(this.children[0].children, function(group){
					dojo.forEach(group.children, function(path){
						path.setFill(fill);
					});
				}, this);
			}
			return this;
		},
		setStroke: function(stroke){
			this.strokeStyle = stroke;
			if(this.children[0]){
				dojo.forEach(this.children[0].children, function(group){
					dojo.forEach(group.children, function(path){
						path.setStroke(stroke);
					});
				}, this);
			}
			return this;
		},

		setFont: function(newFont){
			//		this will do the real rendering.
			this.fontStyle = typeof newFont == "string" ? dojox.gfx.splitFontString(newFont)
				: dojox.gfx.makeParameters(dojox.gfx.defaultFont, newFont);
			this._setFont();
			return this;
		},

		getBoundingBox: function(){
			return this.bbox;
		}
	});

	//		TODO: figure out how to add this to container objects!
	dojox.gfx.shape.Creator.createVectorText = function(text){
		return this.createObject(dojox.gfx.VectorText, text);
	}
*/
});

},
'dojox/gfx':function(){
define("dojox/gfx", ["dojo/_base/lang", "./gfx/_base", "./gfx/renderer!"], 
  function(lang, gfxBase, renderer){
	// module:
	//		dojox/gfx
	// summary:
	//		This the root of the Dojo Graphics package
	gfxBase.switchTo(renderer);
	return gfxBase;
});

},
'dojox/gfx/shape':function(){
define("dojox/gfx/shape", ["./_base", "dojo/_base/lang", "dojo/_base/declare", "dojo/_base/kernel", "dojo/_base/sniff",
	"dojo/_base/connect", "dojo/_base/array", "dojo/dom-construct", "dojo/_base/Color", "./matrix" /*===== , "./path" =====*/ ], 
	function(g, lang, declare, kernel, has, events, arr, domConstruct, Color, matrixLib){

	var shape = g.shape = {
		// summary:
		//		This module contains the core graphics Shape API.
		//		Different graphics renderer implementation modules (svg, canvas, vml, silverlight, etc.) extend this
		//		basic api to provide renderer-specific implementations for each shape.
	};
	
	// a set of ids (keys=type)
	var _ids = {};
	// a simple set impl to map shape<->id
	var registry = {};
	
	shape.register = function(/*dojox/gfx/shape.Shape*/s){
		// summary:
		//		Register the specified shape into the graphics registry.
		// s: dojox/gfx/shape.Shape
		//		The shape to register.
		// returns: Number
		//		The unique id associated with this shape.
		
		// the id pattern : type+number (ex: Rect0,Rect1,etc)
		var t = s.declaredClass.split('.').pop();
		var i = t in _ids ? ++_ids[t] : ((_ids[t] = 0));
		var uid = t+i;
		registry[uid] = s;
		return uid;
	};
	
	shape.byId = function(/*String*/id){
		// summary:
		//		Returns the shape that matches the specified id.
		// id: String
		//		The unique identifier for this Shape.
		// returns: dojox/gfx/shape.Shape
		return registry[id]; //dojox/gfx/shape.Shape
	};
	
	shape.dispose = function(/*dojox/gfx/shape.Shape*/s){
		// summary:
		//		Removes the specified shape from the registry.
		// s: dojox/gfx/shape.Shape
		//		The shape to unregister.
		delete registry[s.getUID()];
	};
	
	shape.Shape = declare("dojox.gfx.shape.Shape", null, {
		// summary:
		//		a Shape object, which knows how to apply
		//		graphical attributes and transformations
	
		constructor: function(){
			// rawNode: Node
			//		underlying graphics-renderer-specific implementation object (if applicable)
			this.rawNode = null;

			// shape: Object
			//		an abstract shape object
			//		(see dojox/gfx.defaultPath,
			//		dojox/gfx.defaultPolyline,
			//		dojox/gfx.defaultRect,
			//		dojox/gfx.defaultEllipse,
			//		dojox/gfx.defaultCircle,
			//		dojox/gfx.defaultLine,
			//		or dojox/gfx.defaultImage)
			this.shape = null;
	
			// matrix: dojox/gfx/matrix.Matrix2D
			//		a transformation matrix
			this.matrix = null;
	
			// fillStyle: dojox/gfx.Fill
			//		a fill object
			//		(see dojox/gfx.defaultLinearGradient,
			//		dojox/gfx.defaultRadialGradient,
			//		dojox/gfx.defaultPattern,
			//		or dojo/Color)
			this.fillStyle = null;
	
			// strokeStyle: dojox/gfx.Stroke
			//		a stroke object
			//		(see dojox/gfx.defaultStroke)
			this.strokeStyle = null;
	
			// bbox: dojox/gfx.Rectangle
			//		a bounding box of this shape
			//		(see dojox/gfx.defaultRect)
			this.bbox = null;
	
			// virtual group structure
	
			// parent: Object
			//		a parent or null
			//		(see dojox/gfx/shape.Surface,
			//		or dojox/gfx.Group)
			this.parent = null;
	
			// parentMatrix: dojox/gfx/matrix.Matrix2D
			//		a transformation matrix inherited from the parent
			this.parentMatrix = null;
			
			var uid = shape.register(this);
			this.getUID = function(){
				return uid;
			}
		},
		
		destroy: function(){
			// summary:
			//		Releases all internal resources owned by this shape. Once this method has been called,
			//		the instance is considered destroyed and should not be used anymore.
			shape.dispose(this);
		},
	
		// trivial getters
	
		getNode: function(){
			// summary:
			//		Different graphics rendering subsystems implement shapes in different ways.  This
			//		method provides access to the underlying graphics subsystem object.  Clients calling this
			//		method and using the return value must be careful not to try sharing or using the underlying node
			//		in a general way across renderer implementation.
			//		Returns the underlying graphics Node, or null if no underlying graphics node is used by this shape.
			return this.rawNode; // Node
		},
		getShape: function(){
			// summary:
			//		returns the current Shape object or null
			//		(see dojox/gfx.defaultPath,
			//		dojox/gfx.defaultPolyline,
			//		dojox/gfx.defaultRect,
			//		dojox/gfx.defaultEllipse,
			//		dojox/gfx.defaultCircle,
			//		dojox/gfx.defaultLine,
			//		or dojox/gfx.defaultImage)
			return this.shape; // Object
		},
		getTransform: function(){
			// summary:
			//		Returns the current transformation matrix applied to this Shape or null
			return this.matrix;	// dojox/gfx/matrix.Matrix2D
		},
		getFill: function(){
			// summary:
			//		Returns the current fill object or null
			//		(see dojox/gfx.defaultLinearGradient,
			//		dojox/gfx.defaultRadialGradient,
			//		dojox/gfx.defaultPattern,
			//		or dojo/Color)
			return this.fillStyle;	// Object
		},
		getStroke: function(){
			// summary:
			//		Returns the current stroke object or null
			//		(see dojox/gfx.defaultStroke)
			return this.strokeStyle;	// Object
		},
		getParent: function(){
			// summary:
			//		Returns the parent Shape, Group or null if this Shape is unparented.
			//		(see dojox/gfx/shape.Surface,
			//		or dojox/gfx.Group)
			return this.parent;	// Object
		},
		getBoundingBox: function(){
			// summary:
			//		Returns the bounding box Rectangle for this shape or null if a BoundingBox cannot be
			//		calculated for the shape on the current renderer or for shapes with no geometric area (points).
			//		A bounding box is a rectangular geometric region
			//		defining the X and Y extent of the shape.
			//		(see dojox/gfx.defaultRect)
			//		Note that this method returns a direct reference to the attribute of this instance. Therefore you should
			//		not modify its value directly but clone it instead.
			return this.bbox;	// dojox/gfx.Rectangle
		},
		getTransformedBoundingBox: function(){
			// summary:
			//		returns an array of four points or null
			//		four points represent four corners of the untransformed bounding box
			var b = this.getBoundingBox();
			if(!b){
				return null;	// null
			}
			var m = this._getRealMatrix(),
				gm = matrixLib;
			return [	// Array
					gm.multiplyPoint(m, b.x, b.y),
					gm.multiplyPoint(m, b.x + b.width, b.y),
					gm.multiplyPoint(m, b.x + b.width, b.y + b.height),
					gm.multiplyPoint(m, b.x, b.y + b.height)
				];
		},
		getEventSource: function(){
			// summary:
			//		returns a Node, which is used as
			//		a source of events for this shape
			
			// COULD BE RE-IMPLEMENTED BY THE RENDERER!
			return this.rawNode;	// Node
		},
	
		// empty settings
		
		setClip: function(clip){
			// summary:
			//		sets the clipping area of this shape.
			// description:
			//		The clipping area defines the shape area that will be effectively visible. Everything that
			//		would be drawn outside of the clipping area will not be rendered.
			//		The possible clipping area types are rectangle, ellipse, polyline and path, but all are not
			//		supported by all the renderers. vml only supports rectangle clipping, while the gfx silverlight renderer does not
			//		support path clipping.
			//		The clip parameter defines the clipping area geometry, and should be an object with the following properties:
			//
			//		- {x:Number, y:Number, width:Number, height:Number} for rectangular clip
			//		- {cx:Number, cy:Number, rx:Number, ry:Number} for ellipse clip
			//		- {points:Array} for polyline clip
			//		- {d:String} for a path clip.
			//
			//		The clip geometry coordinates are expressed in the coordinate system used to draw the shape. In other
			//		words, the clipping area is defined in the shape parent coordinate system and the shape transform is automatically applied.
			// example:
			//		The following example shows how to clip a gfx image with all the possible clip geometry: a rectangle,
			//		an ellipse, a circle (using the ellipse geometry), a polyline and a path:
			//
			//	|	surface.createImage({src:img, width:200,height:200}).setClip({x:10,y:10,width:50,height:50});
			//	|	surface.createImage({src:img, x:100,y:50,width:200,height:200}).setClip({cx:200,cy:100,rx:20,ry:30});
			//	|	surface.createImage({src:img, x:0,y:350,width:200,height:200}).setClip({cx:100,cy:425,rx:60,ry:60});
			//	|	surface.createImage({src:img, x:300,y:0,width:200,height:200}).setClip({points:[350,0,450,50,380,130,300,110]});
			//	|	surface.createImage({src:img, x:300,y:350,width:200,height:200}).setClip({d:"M 350,350 C314,414 317,557 373,450.0000 z"});

			// clip: Object
			//		an object that defines the clipping geometry, or null to remove clip.
			
			// COULD BE RE-IMPLEMENTED BY THE RENDERER!
			this.clip = clip;
		},
		
		getClip: function(){
			return this.clip;
		},
	
		setShape: function(shape){
			// summary:
			//		sets a shape object
			//		(the default implementation simply ignores it)
			// shape: Object
			//		a shape object
			//		(see dojox/gfx.defaultPath,
			//		dojox/gfx.defaultPolyline,
			//		dojox/gfx.defaultRect,
			//		dojox/gfx.defaultEllipse,
			//		dojox/gfx.defaultCircle,
			//		dojox/gfx.defaultLine,
			//		or dojox/gfx.defaultImage)
			
			// COULD BE RE-IMPLEMENTED BY THE RENDERER!
			this.shape = g.makeParameters(this.shape, shape);
			this.bbox = null;
			return this;	// self
		},
		setFill: function(fill){
			// summary:
			//		sets a fill object
			//		(the default implementation simply ignores it)
			// fill: Object
			//		a fill object
			//		(see dojox/gfx.defaultLinearGradient,
			//		dojox/gfx.defaultRadialGradient,
			//		dojox/gfx.defaultPattern,
			//		or dojo/_base/Color)
			
			// COULD BE RE-IMPLEMENTED BY THE RENDERER!
			if(!fill){
				// don't fill
				this.fillStyle = null;
				return this;	// self
			}
			var f = null;
			if(typeof(fill) == "object" && "type" in fill){
				// gradient or pattern
				switch(fill.type){
					case "linear":
						f = g.makeParameters(g.defaultLinearGradient, fill);
						break;
					case "radial":
						f = g.makeParameters(g.defaultRadialGradient, fill);
						break;
					case "pattern":
						f = g.makeParameters(g.defaultPattern, fill);
						break;
				}
			}else{
				// color object
				f = g.normalizeColor(fill);
			}
			this.fillStyle = f;
			return this;	// self
		},
		setStroke: function(stroke){
			// summary:
			//		sets a stroke object
			//		(the default implementation simply ignores it)
			// stroke: Object
			//		a stroke object
			//		(see dojox/gfx.defaultStroke)
			
			// COULD BE RE-IMPLEMENTED BY THE RENDERER!
			if(!stroke){
				// don't stroke
				this.strokeStyle = null;
				return this;	// self
			}
			// normalize the stroke
			if(typeof stroke == "string" || lang.isArray(stroke) || stroke instanceof Color){
				stroke = {color: stroke};
			}
			var s = this.strokeStyle = g.makeParameters(g.defaultStroke, stroke);
			s.color = g.normalizeColor(s.color);
			return this;	// self
		},
		setTransform: function(matrix){
			// summary:
			//		sets a transformation matrix
			// matrix: dojox/gfx/matrix.Matrix2D
			//		a matrix or a matrix-like object
			//		(see an argument of dojox/gfx/matrix.Matrix2D
			//		constructor for a list of acceptable arguments)
			
			// COULD BE RE-IMPLEMENTED BY THE RENDERER!
			this.matrix = matrixLib.clone(matrix ? matrixLib.normalize(matrix) : matrixLib.identity);
			return this._applyTransform();	// self
		},
	
		_applyTransform: function(){
			// summary:
			//		physically sets a matrix
			
			// COULD BE RE-IMPLEMENTED BY THE RENDERER!
			return this;	// self
		},
	
		// z-index
	
		moveToFront: function(){
			// summary:
			//		moves a shape to front of its parent's list of shapes
			var p = this.getParent();
			if(p){
				p._moveChildToFront(this);
				this._moveToFront();	// execute renderer-specific action
			}
			return this;	// self
		},
		moveToBack: function(){
			// summary:
			//		moves a shape to back of its parent's list of shapes
			var p = this.getParent();
			if(p){
				p._moveChildToBack(this);
				this._moveToBack();	// execute renderer-specific action
			}
			return this;
		},
		_moveToFront: function(){
			// summary:
			//		renderer-specific hook, see dojox/gfx/shape.Shape.moveToFront()
			
			// COULD BE RE-IMPLEMENTED BY THE RENDERER!
		},
		_moveToBack: function(){
			// summary:
			//		renderer-specific hook, see dojox/gfx/shape.Shape.moveToFront()
			
			// COULD BE RE-IMPLEMENTED BY THE RENDERER!
		},
	
		// apply left & right transformation
	
		applyRightTransform: function(matrix){
			// summary:
			//		multiplies the existing matrix with an argument on right side
			//		(this.matrix * matrix)
			// matrix: dojox/gfx/matrix.Matrix2D
			//		a matrix or a matrix-like object
			//		(see an argument of dojox/gfx/matrix.Matrix2D
			//		constructor for a list of acceptable arguments)
			return matrix ? this.setTransform([this.matrix, matrix]) : this;	// self
		},
		applyLeftTransform: function(matrix){
			// summary:
			//		multiplies the existing matrix with an argument on left side
			//		(matrix * this.matrix)
			// matrix: dojox/gfx/matrix.Matrix2D
			//		a matrix or a matrix-like object
			//		(see an argument of dojox/gfx/matrix.Matrix2D
			//		constructor for a list of acceptable arguments)
			return matrix ? this.setTransform([matrix, this.matrix]) : this;	// self
		},
		applyTransform: function(matrix){
			// summary:
			//		a shortcut for dojox/gfx/shape.Shape.applyRightTransform
			// matrix: dojox/gfx/matrix.Matrix2D
			//		a matrix or a matrix-like object
			//		(see an argument of dojox/gfx/matrix.Matrix2D
			//		constructor for a list of acceptable arguments)
			return matrix ? this.setTransform([this.matrix, matrix]) : this;	// self
		},
	
		// virtual group methods
	
		removeShape: function(silently){
			// summary:
			//		removes the shape from its parent's list of shapes
			// silently: Boolean
			//		if true, do not redraw a picture yet
			if(this.parent){
				this.parent.remove(this, silently);
			}
			return this;	// self
		},
		_setParent: function(parent, matrix){
			// summary:
			//		sets a parent
			// parent: Object
			//		a parent or null
			//		(see dojox/gfx/shape.Surface,
			//		or dojox/gfx.Group)
			// matrix: dojox/gfx/matrix.Matrix2D
			//		a 2D matrix or a matrix-like object
			this.parent = parent;
			return this._updateParentMatrix(matrix);	// self
		},
		_updateParentMatrix: function(matrix){
			// summary:
			//		updates the parent matrix with new matrix
			// matrix: dojox/gfx/Matrix2D
			//		a 2D matrix or a matrix-like object
			this.parentMatrix = matrix ? matrixLib.clone(matrix) : null;
			return this._applyTransform();	// self
		},
		_getRealMatrix: function(){
			// summary:
			//		returns the cumulative ('real') transformation matrix
			//		by combining the shape's matrix with its parent's matrix
			var m = this.matrix;
			var p = this.parent;
			while(p){
				if(p.matrix){
					m = matrixLib.multiply(p.matrix, m);
				}
				p = p.parent;
			}
			return m;	// dojox/gfx/matrix.Matrix2D
		}
	});
	
	shape._eventsProcessing = {
		connect: function(name, object, method){
			// summary:
			//		connects a handler to an event on this shape
			
			// COULD BE RE-IMPLEMENTED BY THE RENDERER!
			// redirect to fixCallback to normalize events and add the gfxTarget to the event. The latter
			// is done by dojox/gfx.fixTarget which is defined by each renderer
			return events.connect(this.getEventSource(), name, shape.fixCallback(this, g.fixTarget, object, method));
			
		},
		disconnect: function(token){
			// summary:
			//		connects a handler by token from an event on this shape
			
			// COULD BE RE-IMPLEMENTED BY THE RENDERER!
	
			events.disconnect(token);
		}
	};
	
	shape.fixCallback = function(gfxElement, fixFunction, scope, method){
		// summary:
		//		Wraps the callback to allow for tests and event normalization
		//		before it gets invoked. This is where 'fixTarget' is invoked.
		// tags:
		//      private
		// gfxElement: Object
		//		The GFX object that triggers the action (ex.:
		//		dojox/gfx.Surface and dojox/gfx/shape.Shape). A new event property
		//		'gfxTarget' is added to the event to reference this object.
		//		for easy manipulation of GFX objects by the event handlers.
		// fixFunction: Function
		//		The function that implements the logic to set the 'gfxTarget'
		//		property to the event. It should be 'dojox/gfx.fixTarget' for
		//		most of the cases
		// scope: Object
		//		Optional. The scope to be used when invoking 'method'. If
		//		omitted, a global scope is used.
		// method: Function|String
		//		The original callback to be invoked.
		if(!method){
			method = scope;
			scope = null;
		}
		if(lang.isString(method)){
			scope = scope || kernel.global;
			if(!scope[method]){ throw(['dojox.gfx.shape.fixCallback: scope["', method, '"] is null (scope="', scope, '")'].join('')); }
			return function(e){  
				return fixFunction(e,gfxElement) ? scope[method].apply(scope, arguments || []) : undefined; }; // Function
		}
		return !scope 
			? function(e){ 
				return fixFunction(e,gfxElement) ? method.apply(scope, arguments) : undefined; } 
			: function(e){ 
				return fixFunction(e,gfxElement) ? method.apply(scope, arguments || []) : undefined; }; // Function
	};
	lang.extend(shape.Shape, shape._eventsProcessing);
	
	shape.Container = {
		// summary:
		//		a container of shapes, which can be used
		//		as a foundation for renderer-specific groups, or as a way
		//		to logically group shapes (e.g, to propagate matricies)
	
		_init: function() {
			// children: Array
			//		a list of children
			this.children = [];
		},
	
		// group management
	
		openBatch: function() {
			// summary:
			//		starts a new batch, subsequent new child shapes will be held in
			//		the batch instead of appending to the container directly
		},
		closeBatch: function() {
			// summary:
			//		submits the current batch, append all pending child shapes to DOM
		},
		add: function(shape){
			// summary:
			//		adds a shape to the list
			// shape: dojox/gfx/shape.Shape
			//		the shape to add to the list
			var oldParent = shape.getParent();
			if(oldParent){
				oldParent.remove(shape, true);
			}
			this.children.push(shape);
			return shape._setParent(this, this._getRealMatrix());	// self
		},
		remove: function(shape, silently){
			// summary:
			//		removes a shape from the list
			// shape: dojox/gfx/shape.Shape
			//		the shape to remove
			// silently: Boolean
			//		if true, do not redraw a picture yet
			for(var i = 0; i < this.children.length; ++i){
				if(this.children[i] == shape){
					if(silently){
						// skip for now
					}else{
						shape.parent = null;
						shape.parentMatrix = null;
					}
					this.children.splice(i, 1);
					break;
				}
			}
			return this;	// self
		},
		clear: function(/*Boolean?*/ destroy){
			// summary:
			//		removes all shapes from a group/surface.
			// destroy: Boolean
			//		Indicates whether the children should be destroyed. Optional.
			var shape;
			for(var i = 0; i < this.children.length;++i){
				shape = this.children[i];
				shape.parent = null;
				shape.parentMatrix = null;
				if(destroy){
					shape.destroy();
				}
			}
			this.children = [];
			return this;	// self
		},
		getBoundingBox: function(){
			// summary:
			//		Returns the bounding box Rectangle for this shape.
			if(this.children){
				// if this is a composite shape, then sum up all the children
				var result = null;
				arr.forEach(this.children, function(shape){
					var bb = shape.getBoundingBox();
					if(bb){
						var ct = shape.getTransform();
						if(ct){
							bb = matrixLib.multiplyRectangle(ct, bb);
						}
						if(result){
							// merge two bbox 
							result.x = Math.min(result.x, bb.x);
							result.y = Math.min(result.y, bb.y);
							result.endX = Math.max(result.endX, bb.x + bb.width);
							result.endY = Math.max(result.endY, bb.y + bb.height);
						}else{
							// first bbox 
							result = {
								x: bb.x,
								y: bb.y,
								endX: bb.x + bb.width,
								endY: bb.y + bb.height
							};
						}
					}
				});
				if(result){
					result.width = result.endX - result.x;
					result.height = result.endY - result.y;
				}
				return result; // dojox/gfx.Rectangle
			}
			// unknown/empty bounding box, subclass shall override this impl 
			return null;
		},
		// moving child nodes
		_moveChildToFront: function(shape){
			// summary:
			//		moves a shape to front of the list of shapes
			// shape: dojox/gfx/shape.Shape
			//		one of the child shapes to move to the front
			for(var i = 0; i < this.children.length; ++i){
				if(this.children[i] == shape){
					this.children.splice(i, 1);
					this.children.push(shape);
					break;
				}
			}
			return this;	// self
		},
		_moveChildToBack: function(shape){
			// summary:
			//		moves a shape to back of the list of shapes
			// shape: dojox/gfx/shape.Shape
			//		one of the child shapes to move to the front
			for(var i = 0; i < this.children.length; ++i){
				if(this.children[i] == shape){
					this.children.splice(i, 1);
					this.children.unshift(shape);
					break;
				}
			}
			return this;	// self
		}
	};

	shape.Surface = declare("dojox.gfx.shape.Surface", null, {
		// summary:
		//		a surface object to be used for drawings
		constructor: function(){
			// underlying node
			this.rawNode = null;
			// the parent node
			this._parent = null;
			// the list of DOM nodes to be deleted in the case of destruction
			this._nodes = [];
			// the list of events to be detached in the case of destruction
			this._events = [];
		},
		destroy: function(){
			// summary:
			//		destroy all relevant external resources and release all
			//		external references to make this object garbage-collectible
			arr.forEach(this._nodes, domConstruct.destroy);
			this._nodes = [];
			arr.forEach(this._events, events.disconnect);
			this._events = [];
			this.rawNode = null;	// recycle it in _nodes, if it needs to be recycled
			if(has("ie")){
				while(this._parent.lastChild){
					domConstruct.destroy(this._parent.lastChild);
				}
			}else{
				this._parent.innerHTML = "";
			}
			this._parent = null;
		},
		getEventSource: function(){
			// summary:
			//		returns a node, which can be used to attach event listeners
			return this.rawNode; // Node
		},
		_getRealMatrix: function(){
			// summary:
			//		always returns the identity matrix
			return null;	// dojox/gfx/Matrix2D
		},
		/*=====
		 setDimensions: function(width, height){
			 // summary:
			 //		sets the width and height of the rawNode
			 // width: String
			 //		width of surface, e.g., "100px"
			 // height: String
			 //		height of surface, e.g., "100px"
			 return this;	// self
		 },
		 getDimensions: function(){
			 // summary:
			 //     gets current width and height in pixels
			 // returns: Object
			 //     object with properties "width" and "height"
		 },
		 =====*/
		isLoaded: true,
		onLoad: function(/*dojox/gfx/shape.Surface*/ surface){
			// summary:
			//		local event, fired once when the surface is created
			//		asynchronously, used only when isLoaded is false, required
			//		only for Silverlight.
		},
		whenLoaded: function(/*Object|Null*/ context, /*Function|String*/ method){
			var f = lang.hitch(context, method);
			if(this.isLoaded){
				f(this);
			}else{
				var h = events.connect(this, "onLoad", function(surface){
					events.disconnect(h);
					f(surface);
				});
			}
		}
	});
	lang.extend(shape.Surface, shape._eventsProcessing);

	/*=====
	g.Point = declare("dojox/gfx.Point", null, {
		// summary:
		//		2D point for drawings - {x, y}
		// description:
		//		Do not use this object directly!
		//		Use the naked object instead: {x: 1, y: 2}.
	});

	g.Rectangle = declare("dojox.gfx.Rectangle", null, {
		// summary:
		//		rectangle - {x, y, width, height}
		// description:
		//		Do not use this object directly!
		//		Use the naked object instead: {x: 1, y: 2, width: 100, height: 200}.
	});
	 =====*/


	shape.Rect = declare("dojox.gfx.shape.Rect", shape.Shape, {
		// summary:
		//		a generic rectangle
		constructor: function(rawNode){
			// rawNode: Node
			//		The underlying graphics system object (typically a DOM Node)
			this.shape = g.getDefault("Rect");
			this.rawNode = rawNode;
		},
		getBoundingBox: function(){
			// summary:
			//		returns the bounding box (its shape in this case)
			return this.shape;	// dojox/gfx.Rectangle
		}
	});
	
	shape.Ellipse = declare("dojox.gfx.shape.Ellipse", shape.Shape, {
		// summary:
		//		a generic ellipse
		constructor: function(rawNode){
			// rawNode: Node
			//		a DOM Node
			this.shape = g.getDefault("Ellipse");
			this.rawNode = rawNode;
		},
		getBoundingBox: function(){
			// summary:
			//		returns the bounding box
			if(!this.bbox){
				var shape = this.shape;
				this.bbox = {x: shape.cx - shape.rx, y: shape.cy - shape.ry,
					width: 2 * shape.rx, height: 2 * shape.ry};
			}
			return this.bbox;	// dojox/gfx.Rectangle
		}
	});
	
	shape.Circle = declare("dojox.gfx.shape.Circle", shape.Shape, {
		// summary:
		//		a generic circle
		constructor: function(rawNode){
			// rawNode: Node
			//		a DOM Node
			this.shape = g.getDefault("Circle");
			this.rawNode = rawNode;
		},
		getBoundingBox: function(){
			// summary:
			//		returns the bounding box
			if(!this.bbox){
				var shape = this.shape;
				this.bbox = {x: shape.cx - shape.r, y: shape.cy - shape.r,
					width: 2 * shape.r, height: 2 * shape.r};
			}
			return this.bbox;	// dojox/gfx.Rectangle
		}
	});
	
	shape.Line = declare("dojox.gfx.shape.Line", shape.Shape, {
		// summary:
		//		a generic line (do not instantiate it directly)
		constructor: function(rawNode){
			// rawNode: Node
			//		a DOM Node
			this.shape = g.getDefault("Line");
			this.rawNode = rawNode;
		},
		getBoundingBox: function(){
			// summary:
			//		returns the bounding box
			if(!this.bbox){
				var shape = this.shape;
				this.bbox = {
					x:		Math.min(shape.x1, shape.x2),
					y:		Math.min(shape.y1, shape.y2),
					width:	Math.abs(shape.x2 - shape.x1),
					height:	Math.abs(shape.y2 - shape.y1)
				};
			}
			return this.bbox;	// dojox/gfx.Rectangle
		}
	});
	
	shape.Polyline = declare("dojox.gfx.shape.Polyline", shape.Shape, {
		// summary:
		//		a generic polyline/polygon (do not instantiate it directly)
		constructor: function(rawNode){
			// rawNode: Node
			//		a DOM Node
			this.shape = g.getDefault("Polyline");
			this.rawNode = rawNode;
		},
		setShape: function(points, closed){
			// summary:
			//		sets a polyline/polygon shape object
			// points: Object|Array
			//		a polyline/polygon shape object, or an array of points
			// closed: Boolean
			//		close the polyline to make a polygon
			if(points && points instanceof Array){
				this.inherited(arguments, [{points: points}]);
				if(closed && this.shape.points.length){
					this.shape.points.push(this.shape.points[0]);
				}
			}else{
				this.inherited(arguments, [points]);
			}
			return this;	// self
		},
		_normalizePoints: function(){
			// summary:
			//		normalize points to array of {x:number, y:number}
			var p = this.shape.points, l = p && p.length;
			if(l && typeof p[0] == "number"){
				var points = [];
				for(var i = 0; i < l; i += 2){
					points.push({x: p[i], y: p[i + 1]});
				}
				this.shape.points = points;
			}
		},
		getBoundingBox: function(){
			// summary:
			//		returns the bounding box
			if(!this.bbox && this.shape.points.length){
				var p = this.shape.points;
				var l = p.length;
				var t = p[0];
				var bbox = {l: t.x, t: t.y, r: t.x, b: t.y};
				for(var i = 1; i < l; ++i){
					t = p[i];
					if(bbox.l > t.x) bbox.l = t.x;
					if(bbox.r < t.x) bbox.r = t.x;
					if(bbox.t > t.y) bbox.t = t.y;
					if(bbox.b < t.y) bbox.b = t.y;
				}
				this.bbox = {
					x:		bbox.l,
					y:		bbox.t,
					width:	bbox.r - bbox.l,
					height:	bbox.b - bbox.t
				};
			}
			return this.bbox;	// dojox/gfx.Rectangle
		}
	});
	
	shape.Image = declare("dojox.gfx.shape.Image", shape.Shape, {
		// summary:
		//		a generic image (do not instantiate it directly)
		constructor: function(rawNode){
			// rawNode: Node
			//		a DOM Node
			this.shape = g.getDefault("Image");
			this.rawNode = rawNode;
		},
		getBoundingBox: function(){
			// summary:
			//		returns the bounding box (its shape in this case)
			return this.shape;	// dojox/gfx.Rectangle
		},
		setStroke: function(){
			// summary:
			//		ignore setting a stroke style
			return this;	// self
		},
		setFill: function(){
			// summary:
			//		ignore setting a fill style
			return this;	// self
		}
	});
	
	shape.Text = declare(shape.Shape, {
		// summary:
		//		a generic text (do not instantiate it directly)
		constructor: function(rawNode){
			// rawNode: Node
			//		a DOM Node
			this.fontStyle = null;
			this.shape = g.getDefault("Text");
			this.rawNode = rawNode;
		},
		getFont: function(){
			// summary:
			//		returns the current font object or null
			return this.fontStyle;	// Object
		},
		setFont: function(newFont){
			// summary:
			//		sets a font for text
			// newFont: Object
			//		a font object (see dojox/gfx.defaultFont) or a font string
			this.fontStyle = typeof newFont == "string" ? g.splitFontString(newFont) :
				g.makeParameters(g.defaultFont, newFont);
			this._setFont();
			return this;	// self
		}
	});
	
	shape.Creator = {
		// summary:
		//		shape creators
		createShape: function(shape){
			// summary:
			//		creates a shape object based on its type; it is meant to be used
			//		by group-like objects
			// shape: Object
			//		a shape descriptor object
			// returns: dojox/gfx/shape.Shape | Null
			//      a fully instantiated surface-specific Shape object
			switch(shape.type){
				case g.defaultPath.type:		return this.createPath(shape);
				case g.defaultRect.type:		return this.createRect(shape);
				case g.defaultCircle.type:	    return this.createCircle(shape);
				case g.defaultEllipse.type:	    return this.createEllipse(shape);
				case g.defaultLine.type:		return this.createLine(shape);
				case g.defaultPolyline.type:	return this.createPolyline(shape);
				case g.defaultImage.type:		return this.createImage(shape);
				case g.defaultText.type:		return this.createText(shape);
				case g.defaultTextPath.type:	return this.createTextPath(shape);
			}
			return null;
		},
		createGroup: function(){
			// summary:
			//		creates a group shape
			return this.createObject(g.Group);	// dojox/gfx/Group
		},
		createRect: function(rect){
			// summary:
			//		creates a rectangle shape
			// rect: Object
			//		a path object (see dojox/gfx.defaultRect)
			return this.createObject(g.Rect, rect);	// dojox/gfx/shape.Rect
		},
		createEllipse: function(ellipse){
			// summary:
			//		creates an ellipse shape
			// ellipse: Object
			//		an ellipse object (see dojox/gfx.defaultEllipse)
			return this.createObject(g.Ellipse, ellipse);	// dojox/gfx/shape.Ellipse
		},
		createCircle: function(circle){
			// summary:
			//		creates a circle shape
			// circle: Object
			//		a circle object (see dojox/gfx.defaultCircle)
			return this.createObject(g.Circle, circle);	// dojox/gfx/shape.Circle
		},
		createLine: function(line){
			// summary:
			//		creates a line shape
			// line: Object
			//		a line object (see dojox/gfx.defaultLine)
			return this.createObject(g.Line, line);	// dojox/gfx/shape.Line
		},
		createPolyline: function(points){
			// summary:
			//		creates a polyline/polygon shape
			// points: Object
			//		a points object (see dojox/gfx.defaultPolyline)
			//		or an Array of points
			return this.createObject(g.Polyline, points);	// dojox/gfx/shape.Polyline
		},
		createImage: function(image){
			// summary:
			//		creates a image shape
			// image: Object
			//		an image object (see dojox/gfx.defaultImage)
			return this.createObject(g.Image, image);	// dojox/gfx/shape.Image
		},
		createText: function(text){
			// summary:
			//		creates a text shape
			// text: Object
			//		a text object (see dojox/gfx.defaultText)
			return this.createObject(g.Text, text);	// dojox/gfx/shape.Text
		},
		createPath: function(path){
			// summary:
			//		creates a path shape
			// path: Object
			//		a path object (see dojox/gfx.defaultPath)
			return this.createObject(g.Path, path);	// dojox/gfx/shape.Path
		},
		createTextPath: function(text){
			// summary:
			//		creates a text shape
			// text: Object
			//		a textpath object (see dojox/gfx.defaultTextPath)
			return this.createObject(g.TextPath, {}).setText(text);	// dojox/gfx/shape.TextPath
		},
		createObject: function(shapeType, rawShape){
			// summary:
			//		creates an instance of the passed shapeType class
			// shapeType: Function
			//		a class constructor to create an instance of
			// rawShape: Object 
			//		properties to be passed in to the classes 'setShape' method
	
			// SHOULD BE RE-IMPLEMENTED BY THE RENDERER!
			return null;	// dojox/gfx/shape.Shape
		}
	};
	
	/*=====
	 lang.extend(shape.Surface, shape.Container);
	 lang.extend(shape.Surface, shape.Creator);

	 g.Group = declare(shape.Shape, {
		// summary:
		//		a group shape, which can be used
		//		to logically group shapes (e.g, to propagate matricies)
	});
	lang.extend(g.Group, shape.Container);
	lang.extend(g.Group, shape.Creator);

	g.Rect     = shape.Rect;
	g.Circle   = shape.Circle;
	g.Ellipse  = shape.Ellipse;
	g.Line     = shape.Line;
	g.Polyline = shape.Polyline;
	g.Path     = shape.Path;
	g.Text     = shape.Text;
	g.Surface  = shape.Surface;

	g.Path = g.path.Path;
	g.TextPath = g.path.TextPath;
	=====*/

	return shape;
});

},
'dojox/gfx/canvas':function(){
define("dojox/gfx/canvas", ["./_base", "dojo/_base/lang", "dojo/_base/array", "dojo/_base/declare", "dojo/_base/window", "dojo/dom-geometry", 
		"dojo/dom", "./_base", "./shape", "./path", "./arc", "./matrix", "./decompose"], 
function(g, lang, arr, declare, win, domGeom, dom, gfxBase, gs, pathLib, ga, m, decompose ){
	var canvas = g.canvas = {
		// summary:
		//		This the graphics rendering bridge for W3C Canvas compliant browsers.
		//		Since Canvas is an immediate mode graphics api, with no object graph or
		//		eventing capabilities, use of this module alone will only add in drawing support.
		//		The additional module, canvasWithEvents extends this module with additional support
		//		for handling events on Canvas.  By default, the support for events is now included
		//		however, if only drawing capabilities are needed, canvas event module can be disabled
		//		using the dojoConfig option, canvasEvents:true|false.
		//		The id of the Canvas renderer is 'canvas'.  This id can be used when switch Dojo's
		//		graphics context between renderer implementations.  See dojox/gfx/_base.switchRenderer
		//		API.
	};
	var pattrnbuffer = null,
		mp = m.multiplyPoint, 
		pi = Math.PI, 
		twoPI = 2 * pi, 
		halfPI = pi /2,
		extend = lang.extend;

	canvas.Shape = declare("dojox.gfx.canvas.Shape", gs.Shape, {
		_render: function(/* Object */ ctx){
			// summary:
			//		render the shape
			ctx.save();
			this._renderTransform(ctx);
			this._renderClip(ctx);
			this._renderShape(ctx);
			this._renderFill(ctx, true);
			this._renderStroke(ctx, true);
			ctx.restore();
		},
		_renderClip: function(ctx){
			if (this.canvasClip){
				this.canvasClip.render(ctx);
				ctx.clip();
			}
		},
		_renderTransform: function(/* Object */ ctx){
			if("canvasTransform" in this){
				var t = this.canvasTransform;
				ctx.translate(t.dx, t.dy);
				ctx.rotate(t.angle2);
				ctx.scale(t.sx, t.sy);
				ctx.rotate(t.angle1);
				// The future implementation when vendors catch up with the spec:
				// var t = this.matrix;
				// ctx.transform(t.xx, t.yx, t.xy, t.yy, t.dx, t.dy);
			}
		},
		_renderShape: function(/* Object */ ctx){
			// nothing
		},
		_renderFill: function(/* Object */ ctx, /* Boolean */ apply){
			if("canvasFill" in this){
				var fs = this.fillStyle;
				if("canvasFillImage" in this){
					var w = fs.width, h = fs.height,
						iw = this.canvasFillImage.width, ih = this.canvasFillImage.height,
						// let's match the svg default behavior wrt. aspect ratio: xMidYMid meet
						sx = w == iw ? 1 : w / iw,
						sy = h == ih ? 1 : h / ih,
						s = Math.min(sx,sy), //meet->math.min , slice->math.max
						dx = (w - s * iw)/2,
						dy = (h - s * ih)/2;
					// the buffer used to scaled the image
					pattrnbuffer.width = w; pattrnbuffer.height = h;
					var copyctx = pattrnbuffer.getContext("2d");
					copyctx.clearRect(0, 0, w, h);
					copyctx.drawImage(this.canvasFillImage, 0, 0, iw, ih, dx, dy, s*iw, s*ih);
					this.canvasFill = ctx.createPattern(pattrnbuffer, "repeat");
					delete this.canvasFillImage;
				}
				ctx.fillStyle = this.canvasFill;
				if(apply){
					// offset the pattern
					if (fs.type==="pattern" && (fs.x !== 0 || fs.y !== 0)) {
						ctx.translate(fs.x,fs.y);
					}
					ctx.fill();
				}
			}else{
				ctx.fillStyle = "rgba(0,0,0,0.0)";
			}
		},
		_renderStroke: function(/* Object */ ctx, /* Boolean */ apply){
			var s = this.strokeStyle;
			if(s){
				ctx.strokeStyle = s.color.toString();
				ctx.lineWidth = s.width;
				ctx.lineCap = s.cap;
				if(typeof s.join == "number"){
					ctx.lineJoin = "miter";
					ctx.miterLimit = s.join;
				}else{
					ctx.lineJoin = s.join;
				}
				if(apply){ ctx.stroke(); }
			}else if(!apply){
				ctx.strokeStyle = "rgba(0,0,0,0.0)";
			}
		},

		// events are not implemented
		getEventSource: function(){ return null; },
		connect:		function(){},
		disconnect:		function(){},
		
		canvasClip:null,
		setClip: function(/*Object*/clip){
			this.inherited(arguments);
			var clipType = clip ? "width" in clip ? "rect" : 
							"cx" in clip ? "ellipse" : 
							"points" in clip ? "polyline" : "d" in clip ? "path" : null : null;
			if(clip && !clipType){
				return this;
			}
			this.canvasClip = clip ? makeClip(clipType, clip) : null;
			this.surface.makeDirty();
			return this;
		}
	});

	var makeClip = function(clipType, geometry){
		switch(clipType){
			case "ellipse":
				return {
					canvasEllipse: makeEllipse(geometry),
					render: function(ctx){return canvas.Ellipse.prototype._renderShape.call(this, ctx);}
				};
			case "rect":
				return {
					shape: lang.delegate(geometry,{r:0}),
					render: function(ctx){return canvas.Rect.prototype._renderShape.call(this, ctx);}
				};
			case "path":
				return {
					canvasPath: makeClipPath(geometry),
					render: function(ctx){this.canvasPath._renderShape(ctx);}
				};
			case "polyline":
				return {
					canvasPolyline: geometry.points,
					render: function(ctx){return canvas.Polyline.prototype._renderShape.call(this, ctx);}
				};
		}
		return null;
	};
	
	var makeClipPath = function(geo){	
		var p = new dojox.gfx.canvas.Path();		
		p.canvasPath = [];
		p._setPath(geo.d);
		return p;
	};

	var modifyMethod = function(shape, method, extra){
		var old = shape.prototype[method];
		shape.prototype[method] = extra ?
			function(){
				this.surface.makeDirty();
				old.apply(this, arguments);
				extra.call(this);
				return this;
			} :
			function(){
				this.surface.makeDirty();
				return old.apply(this, arguments);
			};
	};

	modifyMethod(canvas.Shape, "setTransform",
		function(){
			// prepare Canvas-specific structures
			if(this.matrix){
				this.canvasTransform = g.decompose(this.matrix);
			}else{
				delete this.canvasTransform;
			}
		});

	modifyMethod(canvas.Shape, "setFill",
		function(){
			// prepare Canvas-specific structures
			var fs = this.fillStyle, f;
			if(fs){
				if(typeof(fs) == "object" && "type" in fs){
					var ctx = this.surface.rawNode.getContext("2d");
					switch(fs.type){
						case "linear":
						case "radial":
							f = fs.type == "linear" ?
								ctx.createLinearGradient(fs.x1, fs.y1, fs.x2, fs.y2) :
								ctx.createRadialGradient(fs.cx, fs.cy, 0, fs.cx, fs.cy, fs.r);
							arr.forEach(fs.colors, function(step){
								f.addColorStop(step.offset, g.normalizeColor(step.color).toString());
							});
							break;
						case "pattern":
							if (!pattrnbuffer) {
								pattrnbuffer = document.createElement("canvas");
							}
							// no need to scale the image since the canvas.createPattern uses
							// the original image data and not the scaled ones (see spec.)
							// the scaling needs to be done at rendering time in a context buffer
							var img =new Image();
							this.surface.downloadImage(img, fs.src);
							this.canvasFillImage = img;
					}
				}else{
					// Set fill color using CSS RGBA func style
					f = fs.toString();
				}
				this.canvasFill = f;
			}else{
				delete this.canvasFill;
			}
		});

	modifyMethod(canvas.Shape, "setStroke");
	modifyMethod(canvas.Shape, "setShape");

	canvas.Group = declare("dojox.gfx.canvas.Group", canvas.Shape, {
		// summary:
		//		a group shape (Canvas), which can be used
		//		to logically group shapes (e.g, to propagate matricies)
		constructor: function(){
			gs.Container._init.call(this);
		},
		_render: function(/* Object */ ctx){
			// summary:
			//		render the group
			ctx.save();
			this._renderTransform(ctx);
			this._renderClip(ctx);
			for(var i = 0; i < this.children.length; ++i){
				this.children[i]._render(ctx);
			}
			ctx.restore();
		},
		destroy: function(){
			// summary:
			//		Releases all internal resources owned by this shape. Once this method has been called,
			//		the instance is considered disposed and should not be used anymore.
			this.clear(true);
			// avoid this.inherited
			canvas.Shape.prototype.destroy.apply(this, arguments);
		}		
	});

	canvas.Rect = declare("dojox.gfx.canvas.Rect", [canvas.Shape, gs.Rect], {
		// summary:
		//		a rectangle shape (Canvas)
		_renderShape: function(/* Object */ ctx){
			var s = this.shape, r = Math.min(s.r, s.height / 2, s.width / 2),
				xl = s.x, xr = xl + s.width, yt = s.y, yb = yt + s.height,
				xl2 = xl + r, xr2 = xr - r, yt2 = yt + r, yb2 = yb - r;
			ctx.beginPath();
			ctx.moveTo(xl2, yt);
			if(r){
				ctx.arc(xr2, yt2, r, -halfPI, 0, false);
				ctx.arc(xr2, yb2, r, 0, halfPI, false);
				ctx.arc(xl2, yb2, r, halfPI, pi, false);
				ctx.arc(xl2, yt2, r, pi, pi + halfPI, false);
			}else{
				ctx.lineTo(xr2, yt);
				ctx.lineTo(xr, yb2);
				ctx.lineTo(xl2, yb);
				ctx.lineTo(xl, yt2);
			}
	 		ctx.closePath();
		}
	});

	var bezierCircle = [];
	(function(){
		var u = ga.curvePI4;
		bezierCircle.push(u.s, u.c1, u.c2, u.e);
		for(var a = 45; a < 360; a += 45){
			var r = m.rotateg(a);
			bezierCircle.push(mp(r, u.c1), mp(r, u.c2), mp(r, u.e));
		}
	})();
	
	var makeEllipse = function(s){
		// prepare Canvas-specific structures
		var t, c1, c2, r = [],
			M = m.normalize([m.translate(s.cx, s.cy), m.scale(s.rx, s.ry)]);
		t = mp(M, bezierCircle[0]);
		r.push([t.x, t.y]);
		for(var i = 1; i < bezierCircle.length; i += 3){
			c1 = mp(M, bezierCircle[i]);
			c2 = mp(M, bezierCircle[i + 1]);
			t  = mp(M, bezierCircle[i + 2]);
			r.push([c1.x, c1.y, c2.x, c2.y, t.x, t.y]);
		}
		return r;
	};

	canvas.Ellipse = declare("dojox.gfx.canvas.Ellipse", [canvas.Shape, gs.Ellipse], {
		// summary:
		//		an ellipse shape (Canvas)
		setShape: function(){
			this.inherited(arguments);
			this.canvasEllipse = makeEllipse(this.shape);
			return this;
		},
		_renderShape: function(/* Object */ ctx){
			var r = this.canvasEllipse;
			ctx.beginPath();
			ctx.moveTo.apply(ctx, r[0]);
			for(var i = 1; i < r.length; ++i){
				ctx.bezierCurveTo.apply(ctx, r[i]);
			}
			ctx.closePath();
		}
	});

	canvas.Circle = declare("dojox.gfx.canvas.Circle", [canvas.Shape, gs.Circle], {
		// summary:
		//		a circle shape (Canvas)
		_renderShape: function(/* Object */ ctx){
			var s = this.shape;
			ctx.beginPath();
			ctx.arc(s.cx, s.cy, s.r, 0, twoPI, 1);
		}
	});

	canvas.Line = declare("dojox.gfx.canvas.Line", [canvas.Shape, gs.Line], {
		// summary:
		//		a line shape (Canvas)
		_renderShape: function(/* Object */ ctx){
			var s = this.shape;
			ctx.beginPath();
			ctx.moveTo(s.x1, s.y1);
			ctx.lineTo(s.x2, s.y2);
		}
	});

	canvas.Polyline = declare("dojox.gfx.canvas.Polyline", [canvas.Shape, gs.Polyline], {
		// summary:
		//		a polyline/polygon shape (Canvas)
		setShape: function(){
			this.inherited(arguments);
			var p = this.shape.points, f = p[0], r, c, i;
			this.bbox = null;
			// normalize this.shape.points as array of points: [{x,y}, {x,y}, ...]
			this._normalizePoints();			
			// after _normalizePoints, if shape.points was [x1,y1,x2,y2,..], shape.points references a new array 
			// and p references the original points array
			// prepare Canvas-specific structures, if needed
			if(p.length){  
				if(typeof f == "number"){ // already in the canvas format [x1,y1,x2,y2,...]
					r = p; 
				}else{ // convert into canvas-specific format
					r = [];
					for(i=0; i < p.length; ++i){
						c = p[i];
						r.push(c.x, c.y);
					}
				}
			}else{
				r = [];
			}
			this.canvasPolyline = r;
			return this;
		},
		_renderShape: function(/* Object */ ctx){
			var p = this.canvasPolyline;
			if(p.length){
				ctx.beginPath();
				ctx.moveTo(p[0], p[1]);
				for(var i = 2; i < p.length; i += 2){
					ctx.lineTo(p[i], p[i + 1]);
				}
			}
		}
	});

	canvas.Image = declare("dojox.gfx.canvas.Image", [canvas.Shape, gs.Image], {
		// summary:
		//		an image shape (Canvas)
		setShape: function(){
			this.inherited(arguments);
			// prepare Canvas-specific structures
			var img = new Image();
			this.surface.downloadImage(img, this.shape.src);
			this.canvasImage = img;
			return this;
		},
		_renderShape: function(/* Object */ ctx){
			var s = this.shape;
			ctx.drawImage(this.canvasImage, s.x, s.y, s.width, s.height);
		}
	});

	canvas.Text = declare("dojox.gfx.canvas.Text", [canvas.Shape, gs.Text], {
		_setFont:function(){
			if(this.fontStyle){
				this.canvasFont = g.makeFontString(this.fontStyle);
			}else{
				delete this.canvasFont;
			}
		},
		
		getTextWidth: function(){
			// summary:
			//		get the text width in pixels
			var s = this.shape, w = 0, ctx;
			if(s.text && s.text.length > 0){
				ctx = this.surface.rawNode.getContext("2d");
				ctx.save();
				this._renderTransform(ctx);
				this._renderFill(ctx, false);
				this._renderStroke(ctx, false);
				if (this.canvasFont)
					ctx.font = this.canvasFont;
				w = ctx.measureText(s.text).width;
				ctx.restore();
			}
			return w;
		},
		
		// override to apply first fill and stroke (
		// the base implementation is for path-based shape that needs to first define the path then to fill/stroke it.
		// Here, we need the fillstyle or strokestyle to be set before calling fillText/strokeText.
		_render: function(/* Object */ctx){
			// summary:
			//		render the shape
			// ctx: Object
			//		the drawing context.
			ctx.save();
			this._renderTransform(ctx);
			this._renderFill(ctx, false);
			this._renderStroke(ctx, false);
			this._renderShape(ctx);
			ctx.restore();
		},
		
		_renderShape: function(ctx){
			// summary:
			//		a text shape (Canvas)
			// ctx: Object
			//		the drawing context.
			var ta, s = this.shape;
			if(!s.text || s.text.length == 0){
				return;
			}
			// text align
			ta = s.align === 'middle' ? 'center' : s.align;
			ctx.textAlign = ta;
			if(this.canvasFont){
				ctx.font = this.canvasFont;
			}
			if(this.canvasFill){
				ctx.fillText(s.text, s.x, s.y);
			}
			if(this.strokeStyle){
				ctx.beginPath(); // fix bug in FF3.6. Fixed in FF4b8
				ctx.strokeText(s.text, s.x, s.y);
				ctx.closePath();
			}
		}
	});
	modifyMethod(canvas.Text, "setFont");
	
	// the next test is from https://github.com/phiggins42/has.js
	if(win.global.CanvasRenderingContext2D){
		// need to doublecheck canvas is supported since module can be loaded if building layers (ticket 14288)
		var ctx2d = win.doc.createElement("canvas").getContext("2d");
		if(ctx2d && typeof ctx2d.fillText != "function"){
			canvas.Text.extend({
				getTextWidth: function(){
					return 0;
				},
				_renderShape: function(){
				}
			});
		}
	}

	var pathRenderers = {
			M: "_moveToA", m: "_moveToR",
			L: "_lineToA", l: "_lineToR",
			H: "_hLineToA", h: "_hLineToR",
			V: "_vLineToA", v: "_vLineToR",
			C: "_curveToA", c: "_curveToR",
			S: "_smoothCurveToA", s: "_smoothCurveToR",
			Q: "_qCurveToA", q: "_qCurveToR",
			T: "_qSmoothCurveToA", t: "_qSmoothCurveToR",
			A: "_arcTo", a: "_arcTo",
			Z: "_closePath", z: "_closePath"
		};

	canvas.Path = declare("dojox.gfx.canvas.Path", [canvas.Shape, pathLib.Path], {
		// summary:
		//		a path shape (Canvas)
		constructor: function(){
			this.lastControl = {};
		},
		setShape: function(){
			this.canvasPath = [];
			return this.inherited(arguments);
		},
		_updateWithSegment: function(segment){
			var last = lang.clone(this.last);
			this[pathRenderers[segment.action]](this.canvasPath, segment.action, segment.args);
			this.last = last;
			this.inherited(arguments);
		},
		_renderShape: function(/* Object */ ctx){
			var r = this.canvasPath;
			ctx.beginPath();
			for(var i = 0; i < r.length; i += 2){
				ctx[r[i]].apply(ctx, r[i + 1]);
			}
		},
		_moveToA: function(result, action, args){
			result.push("moveTo", [args[0], args[1]]);
			for(var i = 2; i < args.length; i += 2){
				result.push("lineTo", [args[i], args[i + 1]]);
			}
			this.last.x = args[args.length - 2];
			this.last.y = args[args.length - 1];
			this.lastControl = {};
		},
		_moveToR: function(result, action, args){
			if("x" in this.last){
				result.push("moveTo", [this.last.x += args[0], this.last.y += args[1]]);
			}else{
				result.push("moveTo", [this.last.x = args[0], this.last.y = args[1]]);
			}
			for(var i = 2; i < args.length; i += 2){
				result.push("lineTo", [this.last.x += args[i], this.last.y += args[i + 1]]);
			}
			this.lastControl = {};
		},
		_lineToA: function(result, action, args){
			for(var i = 0; i < args.length; i += 2){
				result.push("lineTo", [args[i], args[i + 1]]);
			}
			this.last.x = args[args.length - 2];
			this.last.y = args[args.length - 1];
			this.lastControl = {};
		},
		_lineToR: function(result, action, args){
			for(var i = 0; i < args.length; i += 2){
				result.push("lineTo", [this.last.x += args[i], this.last.y += args[i + 1]]);
			}
			this.lastControl = {};
		},
		_hLineToA: function(result, action, args){
			for(var i = 0; i < args.length; ++i){
				result.push("lineTo", [args[i], this.last.y]);
			}
			this.last.x = args[args.length - 1];
			this.lastControl = {};
		},
		_hLineToR: function(result, action, args){
			for(var i = 0; i < args.length; ++i){
				result.push("lineTo", [this.last.x += args[i], this.last.y]);
			}
			this.lastControl = {};
		},
		_vLineToA: function(result, action, args){
			for(var i = 0; i < args.length; ++i){
				result.push("lineTo", [this.last.x, args[i]]);
			}
			this.last.y = args[args.length - 1];
			this.lastControl = {};
		},
		_vLineToR: function(result, action, args){
			for(var i = 0; i < args.length; ++i){
				result.push("lineTo", [this.last.x, this.last.y += args[i]]);
			}
			this.lastControl = {};
		},
		_curveToA: function(result, action, args){
			for(var i = 0; i < args.length; i += 6){
				result.push("bezierCurveTo", args.slice(i, i + 6));
			}
			this.last.x = args[args.length - 2];
			this.last.y = args[args.length - 1];
			this.lastControl.x = args[args.length - 4];
			this.lastControl.y = args[args.length - 3];
			this.lastControl.type = "C";
		},
		_curveToR: function(result, action, args){
			for(var i = 0; i < args.length; i += 6){
				result.push("bezierCurveTo", [
					this.last.x + args[i],
					this.last.y + args[i + 1],
					this.lastControl.x = this.last.x + args[i + 2],
					this.lastControl.y = this.last.y + args[i + 3],
					this.last.x + args[i + 4],
					this.last.y + args[i + 5]
				]);
				this.last.x += args[i + 4];
				this.last.y += args[i + 5];
			}
			this.lastControl.type = "C";
		},
		_smoothCurveToA: function(result, action, args){
			for(var i = 0; i < args.length; i += 4){
				var valid = this.lastControl.type == "C";
				result.push("bezierCurveTo", [
					valid ? 2 * this.last.x - this.lastControl.x : this.last.x,
					valid ? 2 * this.last.y - this.lastControl.y : this.last.y,
					args[i],
					args[i + 1],
					args[i + 2],
					args[i + 3]
				]);
				this.lastControl.x = args[i];
				this.lastControl.y = args[i + 1];
				this.lastControl.type = "C";
			}
			this.last.x = args[args.length - 2];
			this.last.y = args[args.length - 1];
		},
		_smoothCurveToR: function(result, action, args){
			for(var i = 0; i < args.length; i += 4){
				var valid = this.lastControl.type == "C";
				result.push("bezierCurveTo", [
					valid ? 2 * this.last.x - this.lastControl.x : this.last.x,
					valid ? 2 * this.last.y - this.lastControl.y : this.last.y,
					this.last.x + args[i],
					this.last.y + args[i + 1],
					this.last.x + args[i + 2],
					this.last.y + args[i + 3]
				]);
				this.lastControl.x = this.last.x + args[i];
				this.lastControl.y = this.last.y + args[i + 1];
				this.lastControl.type = "C";
				this.last.x += args[i + 2];
				this.last.y += args[i + 3];
			}
		},
		_qCurveToA: function(result, action, args){
			for(var i = 0; i < args.length; i += 4){
				result.push("quadraticCurveTo", args.slice(i, i + 4));
			}
			this.last.x = args[args.length - 2];
			this.last.y = args[args.length - 1];
			this.lastControl.x = args[args.length - 4];
			this.lastControl.y = args[args.length - 3];
			this.lastControl.type = "Q";
		},
		_qCurveToR: function(result, action, args){
			for(var i = 0; i < args.length; i += 4){
				result.push("quadraticCurveTo", [
					this.lastControl.x = this.last.x + args[i],
					this.lastControl.y = this.last.y + args[i + 1],
					this.last.x + args[i + 2],
					this.last.y + args[i + 3]
				]);
				this.last.x += args[i + 2];
				this.last.y += args[i + 3];
			}
			this.lastControl.type = "Q";
		},
		_qSmoothCurveToA: function(result, action, args){
			for(var i = 0; i < args.length; i += 2){
				var valid = this.lastControl.type == "Q";
				result.push("quadraticCurveTo", [
					this.lastControl.x = valid ? 2 * this.last.x - this.lastControl.x : this.last.x,
					this.lastControl.y = valid ? 2 * this.last.y - this.lastControl.y : this.last.y,
					args[i],
					args[i + 1]
				]);
				this.lastControl.type = "Q";
			}
			this.last.x = args[args.length - 2];
			this.last.y = args[args.length - 1];
		},
		_qSmoothCurveToR: function(result, action, args){
			for(var i = 0; i < args.length; i += 2){
				var valid = this.lastControl.type == "Q";
				result.push("quadraticCurveTo", [
					this.lastControl.x = valid ? 2 * this.last.x - this.lastControl.x : this.last.x,
					this.lastControl.y = valid ? 2 * this.last.y - this.lastControl.y : this.last.y,
					this.last.x + args[i],
					this.last.y + args[i + 1]
				]);
				this.lastControl.type = "Q";
				this.last.x += args[i];
				this.last.y += args[i + 1];
			}
		},
		_arcTo: function(result, action, args){
			var relative = action == "a";
			for(var i = 0; i < args.length; i += 7){
				var x1 = args[i + 5], y1 = args[i + 6];
				if(relative){
					x1 += this.last.x;
					y1 += this.last.y;
				}
				var arcs = ga.arcAsBezier(
					this.last, args[i], args[i + 1], args[i + 2],
					args[i + 3] ? 1 : 0, args[i + 4] ? 1 : 0,
					x1, y1
				);
				arr.forEach(arcs, function(p){
					result.push("bezierCurveTo", p);
				});
				this.last.x = x1;
				this.last.y = y1;
			}
			this.lastControl = {};
		},
		_closePath: function(result, action, args){
			result.push("closePath", []);
			this.lastControl = {};
		}
	});
	arr.forEach(["moveTo", "lineTo", "hLineTo", "vLineTo", "curveTo",
		"smoothCurveTo", "qCurveTo", "qSmoothCurveTo", "arcTo", "closePath"],
		function(method){ modifyMethod(canvas.Path, method); }
	);

	canvas.TextPath = declare("dojox.gfx.canvas.TextPath", [canvas.Shape, pathLib.TextPath], {
		// summary:
		//		a text shape (Canvas)
		_renderShape: function(/* Object */ ctx){
			var s = this.shape;
			// nothing for the moment
		},
		_setText: function(){
			// not implemented
		},
		_setFont: function(){
			// not implemented
		}
	});

	canvas.Surface = declare("dojox.gfx.canvas.Surface", gs.Surface, {
		// summary:
		//		a surface object to be used for drawings (Canvas)
		constructor: function(){
			gs.Container._init.call(this);
			this.pendingImageCount = 0;
			this.makeDirty();
		},
		destroy: function(){
			gs.Container.clear.call(this, true); // avoid makeDirty() from canvas.Container.clear impl.
			this.inherited(arguments);
		},
		setDimensions: function(width, height){
			// summary:
			//		sets the width and height of the rawNode
			// width: String
			//		width of surface, e.g., "100px"
			// height: String
			//		height of surface, e.g., "100px"
			this.width  = g.normalizedLength(width);	// in pixels
			this.height = g.normalizedLength(height);	// in pixels
			if(!this.rawNode) return this;
			var dirty = false;
			if (this.rawNode.width != this.width){
				this.rawNode.width = this.width;
				dirty = true;
			}
			if (this.rawNode.height != this.height){
				this.rawNode.height = this.height;
				dirty = true;
			}
			if (dirty)
				this.makeDirty();
			return this;	// self
		},
		getDimensions: function(){
			// summary:
			//		returns an object with properties "width" and "height"
			return this.rawNode ? {width:  this.rawNode.width, height: this.rawNode.height} : null;	// Object
		},
		_render: function(force){
			// summary:
			//		render the all shapes
			if(!force && this.pendingImageCount){ return; }
			var ctx = this.rawNode.getContext("2d");
			ctx.clearRect(0, 0, this.rawNode.width, this.rawNode.height);
			this.render(ctx);
			if("pendingRender" in this){
				clearTimeout(this.pendingRender);
				delete this.pendingRender;
			}
		},
		render: function(ctx){
			// summary:
			//		Renders the gfx scene.
			// description:
			//		this method is called to render the gfx scene to the specified context.
			//		This method should not be invoked directly but should be used instead
			//		as an extension point on which user can connect to with aspect.before/aspect.after
			//		to implement pre- or post- image processing jobs on the drawing surface.
			// ctx: CanvasRenderingContext2D
			//		The surface Canvas rendering context.
			ctx.save();
			for(var i = 0; i < this.children.length; ++i){
				this.children[i]._render(ctx);
			}
			ctx.restore();
		},		
		makeDirty: function(){
			// summary:
			//		internal method, which is called when we may need to redraw
			if(!this.pendingImagesCount && !("pendingRender" in this)){
				this.pendingRender = setTimeout(lang.hitch(this, this._render), 0);
			}
		},
		downloadImage: function(img, url){
			// summary:
			//		internal method, which starts an image download and renders, when it is ready
			// img: Image
			//		the image object
			// url: String
			//		the url of the image
			var handler = lang.hitch(this, this.onImageLoad);
			if(!this.pendingImageCount++ && "pendingRender" in this){
				clearTimeout(this.pendingRender);
				delete this.pendingRender;
			}
			img.onload  = handler;
			img.onerror = handler;
			img.onabort = handler;
			img.src = url;
		},
		onImageLoad: function(){
			if(!--this.pendingImageCount){
				this.onImagesLoaded();
				this._render();
			}
		},
		onImagesLoaded: function(){
			// summary:
			//		An extension point called when all pending images downloads have been completed.
			// description:
			//		This method is invoked when all pending images downloads have been completed, just before
			//		the gfx scene is redrawn. User can connect to this method to get notified when a
			//		gfx scene containing images is fully resolved.
		},

		// events are not implemented
		getEventSource: function(){ return null; },
		connect:		function(){},
		disconnect:		function(){}
	});

	canvas.createSurface = function(parentNode, width, height){
		// summary:
		//		creates a surface (Canvas)
		// parentNode: Node
		//		a parent node
		// width: String
		//		width of surface, e.g., "100px"
		// height: String
		//		height of surface, e.g., "100px"

		if(!width && !height){
			var pos = domGeom.position(parentNode);
			width  = width  || pos.w;
			height = height || pos.h;
		}
		if(typeof width == "number"){
			width = width + "px";
		}
		if(typeof height == "number"){
			height = height + "px";
		}

		var s = new canvas.Surface(),
			p = dom.byId(parentNode),
			c = p.ownerDocument.createElement("canvas");

		c.width  = g.normalizedLength(width);	// in pixels
		c.height = g.normalizedLength(height);	// in pixels

		p.appendChild(c);
		s.rawNode = c;
		s._parent = p;
		s.surface = s;
		return s;	// dojox/gfx.Surface
	};

	// Extenders

	var C = gs.Container, Container = {
		add: function(shape){
			this.surface.makeDirty();
			return C.add.apply(this, arguments);
		},
		remove: function(shape, silently){
			this.surface.makeDirty();
			return C.remove.apply(this, arguments);
		},
		clear: function(){
			this.surface.makeDirty();
			return C.clear.apply(this, arguments);
		},
		getBoundingBox: C.getBoundingBox,
		_moveChildToFront: function(shape){
			this.surface.makeDirty();
			return C._moveChildToFront.apply(this, arguments);
		},
		_moveChildToBack: function(shape){
			this.surface.makeDirty();
			return C._moveChildToBack.apply(this, arguments);
		}
	};

	var Creator = {
		// summary:
		//		Canvas shape creators
		createObject: function(shapeType, rawShape) {
			// summary:
			//		creates an instance of the passed shapeType class
			// shapeType: Function
			//		a class constructor to create an instance of
			// rawShape: Object
			//		properties to be passed in to the classes "setShape" method
			// overrideSize: Boolean
			//		set the size explicitly, if true
			var shape = new shapeType();
			shape.surface = this.surface;
			shape.setShape(rawShape);
			this.add(shape);
			return shape;	// dojox/gfx/shape.Shape
		}
	};

	extend(canvas.Group, Container);
	extend(canvas.Group, gs.Creator);
	extend(canvas.Group, Creator);

	extend(canvas.Surface, Container);
	extend(canvas.Surface, gs.Creator);
	extend(canvas.Surface, Creator);
	
	// no event support -> nothing to fix. 
	canvas.fixTarget = function(event, gfxElement){
		// tags:
		//		private
		return true;
	};
	 
	return canvas;
});

},
'dojox/gfx/gradutils':function(){
// Various generic utilities to deal with a linear gradient

define("dojox/gfx/gradutils", ["./_base", "dojo/_base/lang", "./matrix", "dojo/_base/Color"], 
  function(g, lang, m, Color){
  
	var gradutils = g.gradutils = {};

	function findColor(o, c){
		if(o <= 0){
			return c[0].color;
		}
		var len = c.length;
		if(o >= 1){
			return c[len - 1].color;
		}
		//TODO: use binary search
		for(var i = 0; i < len; ++i){
			var stop = c[i];
			if(stop.offset >= o){
				if(i){
					var prev = c[i - 1];
					return Color.blendColors(new Color(prev.color), new Color(stop.color),
						(o - prev.offset) / (stop.offset - prev.offset));
				}
				return stop.color;
			}
		}
		return c[len - 1].color;
	}

	gradutils.getColor = function(fill, pt){
		// summary:
		//		sample a color from a gradient using a point
		// fill: Object
		//		fill object
		// pt: dojox/gfx.Point
		//		point where to sample a color
		var o;
		if(fill){
			switch(fill.type){
				case "linear":
					var angle = Math.atan2(fill.y2 - fill.y1, fill.x2 - fill.x1),
						rotation = m.rotate(-angle),
						projection = m.project(fill.x2 - fill.x1, fill.y2 - fill.y1),
						p = m.multiplyPoint(projection, pt),
						pf1 = m.multiplyPoint(projection, fill.x1, fill.y1),
						pf2 = m.multiplyPoint(projection, fill.x2, fill.y2),
						scale = m.multiplyPoint(rotation, pf2.x - pf1.x, pf2.y - pf1.y).x;
					o = m.multiplyPoint(rotation, p.x - pf1.x, p.y - pf1.y).x / scale;
					break;
				case "radial":
					var dx = pt.x - fill.cx, dy = pt.y - fill.cy;
					o = Math.sqrt(dx * dx + dy * dy) / fill.r;
					break;
			}
			return findColor(o, fill.colors);	// dojo/_base/Color
		}
		// simple color
		return new Color(fill || [0, 0, 0, 0]);	// dojo/_base/Color
	};

	gradutils.reverse = function(fill){
		// summary:
		//		reverses a gradient
		// fill: Object
		//		fill object
		if(fill){
			switch(fill.type){
				case "linear":
				case "radial":
					fill = lang.delegate(fill);
					if(fill.colors){
						var c = fill.colors, l = c.length, i = 0, stop,
							n = fill.colors = new Array(c.length);
						for(; i < l; ++i){
							stop = c[i];
							n[i] = {
								offset: 1 - stop.offset,
								color:  stop.color
							};
						}
						n.sort(function(a, b){ return a.offset - b.offset; });
					}
					break;
			}
		}
		return fill;	// Object
	};

	return gradutils;
});

},
'dojox/gfx/_gfxBidiSupport':function(){
define("dojox/gfx/_gfxBidiSupport", ["./_base", "dojo/_base/lang","dojo/_base/sniff", "dojo/dom", "dojo/_base/html", "dojo/_base/array",
		"./utils", "./shape", "dojox/string/BidiEngine"], 
function(g, lang, has, dom, html, arr, utils, shapeLib, BidiEngine){
	lang.getObject("dojox.gfx._gfxBidiSupport", true);

	/*=====
	// Prevent changes here from masking the definitions in _base.js from the doc parser
	var origG = g;
	g = {};
	=====*/

	switch (g.renderer){
		case 'vml':
			g.isVml = true;
			break;
		case 'svg':
			g.isSvg = true;
			if(g.svg.useSvgWeb){
				g.isSvgWeb = true;
			}
			break;
		case 'silverlight':
			g.isSilverlight = true;
			break;
		case 'canvas':
			g.isCanvas = true;
			break;
	}

	var bidi_const = {
		LRM : '\u200E',
		LRE : '\u202A',
		PDF : '\u202C',
		RLM : '\u200f',
		RLE : '\u202B'
	};

	/*===== g = origG; =====*/

	// the object that performs text transformations.
	var bidiEngine = new BidiEngine();

	lang.extend(g.shape.Surface, {
		// textDir: String
		//		Will be used as default for Text/TextPath/Group objects that created by this surface
		//		and textDir wasn't directly specified for them, though the bidi support was loaded.
		//		Can be set in two ways:
		//
		//		1. When the surface is created and textDir value passed to it as fourth
		//		parameter.
		//		2. Using the setTextDir(String) function, when this function is used the value
		//		of textDir propagates to all of it's children and the children of children (for Groups) etc.
		textDir: "",

		setTextDir: function(/*String*/newTextDir){
			// summary:
			//		Used for propagation and change of textDir.
			//		newTextDir will be forced as textDir for all of it's children (Group/Text/TextPath).
			setTextDir(this, newTextDir);
		},

		getTextDir: function(){
			return this.textDir;
		}
	});

	lang.extend(g.Group, {                          
		// textDir: String
		//		Will be used for inheritance, or as default for text objects
		//		that textDir wasn't directly specified for them but the bidi support was required.
		textDir: "",

		setTextDir: function(/*String*/newTextDir){
			// summary:
			//		Used for propagation and change of textDir.
			//		newTextDir will be forced as textDir for all of it's children (Group/Text/TextPath).
			setTextDir(this, newTextDir);
		},

		getTextDir: function(){
			return this.textDir;
		}	
	});
	
	lang.extend(g.Text, {  
		// summary:
		//		Overrides some of dojox/gfx.Text properties, and adds some
		//		for bidi support.
		
		// textDir: String
		//		Used for displaying bidi scripts in right layout.
		//		Defines the base direction of text that displayed, can have 3 values:
		//
		//		1. "ltr" - base direction is left to right.
		//		2. "rtl" - base direction is right to left.
		//		3. "auto" - base direction is contextual (defined by first strong character).
		textDir: "",

		formatText: function (/*String*/ text, /*String*/ textDir){
			// summary:
			//		Applies the right transform on text, according to renderer.
			// text:	
			//		the string for manipulation, by default return value.
			// textDir:	
			//		Text direction.
			//		Can be:
			//
			//		1. "ltr" - for left to right layout.
			//		2. "rtl" - for right to left layout
			//		3. "auto" - for contextual layout: the first strong letter decides the direction.
			// description:
			//		Finds the right transformation that should be applied on the text, according to renderer.
			//		Was tested in:
			//
			//		Renderers (browser for testing):
			//
			//		- canvas (FF, Chrome, Safari),
			//		- vml (IE),
			//		- svg (FF, Chrome, Safari, Opera),
			//		- silverlight (IE, Chrome, Safari, Opera),
			//		- svgWeb(FF, Chrome, Safari, Opera, IE).
			//
			//		Browsers [browser version that was tested]:
			//
			//		- IE [6,7,8], FF [3.6],
			//		- Chrome (latest for March 2011),
			//		- Safari [5.0.3],
			//		- Opera [11.01].

			if(textDir && text && text.length > 1){
				var sourceDir = "ltr", targetDir = textDir;
	
				if(targetDir == "auto"){
					//is auto by default
					if(g.isVml){
						return text;
					}
					targetDir = bidiEngine.checkContextual(text);
				}
	
				if(g.isVml){
					sourceDir = bidiEngine.checkContextual(text);
					if(targetDir != sourceDir){
						if(targetDir == "rtl"){
							return !bidiEngine.hasBidiChar(text) ? bidiEngine.bidiTransform(text,"IRNNN","ILNNN") : bidi_const.RLM + bidi_const.RLM + text;
						}else{
							return bidi_const.LRM + text;
						}
					}
					return text;
				}
	
				if(g.isSvgWeb){
					if(targetDir == "rtl"){
						return bidiEngine.bidiTransform(text,"IRNNN","ILNNN");
					}
					return text;
				}
	
				if(g.isSilverlight){
					return (targetDir == "rtl") ? bidiEngine.bidiTransform(text,"IRNNN","VLYNN") : bidiEngine.bidiTransform(text,"ILNNN","VLYNN");
				}
	
				if(g.isCanvas){
					return (targetDir == "rtl") ? bidi_const.RLE + text + bidi_const.PDF : bidi_const.LRE + text + bidi_const.PDF;
				}
	
				if(g.isSvg){
					if(has("ff") < 4){
						return (targetDir == "rtl") ? bidiEngine.bidiTransform(text,"IRYNN","VLNNN") : bidiEngine.bidiTransform(text,"ILYNN","VLNNN");
					}else{
						return bidi_const.LRM + (targetDir == "rtl" ? bidi_const.RLE : bidi_const.LRE) + text + bidi_const.PDF;
					}					
				}					
			}
			return text;
		},	

		bidiPreprocess: function(newShape){     
			return newShape;
		}
	});

	lang.extend(g.TextPath, {          
		// textDir: String
		//		Used for displaying bidi scripts in right layout.
		//		Defines the base direction of text that displayed, can have 3 values:
		//
		//		1. "ltr" - base direction is left to right.
		//		2. "rtl" - base direction is right to left.
		//		3. "auto" - base direction is contextual (defined by first strong character).
		textDir: "",

		formatText: function (/*String*/text, /*String*/textDir){
			// summary:
			//		Applies the right transform on text, according to renderer.
			// text:
			//		the string for manipulation, by default return value.
			// textDir:
			//		text direction direction.
			//		Can be:
			//
			//		1. "ltr" - for left to right layout.
			//		2. "rtl" - for right to left layout
			//		3. "auto" - for contextual layout: the first strong letter decides the direction.
			// description:
			//		Finds the right transformation that should be applied on the text, according to renderer.
			//		Was tested in:
			//
			//		Renderers:
			//		canvas (FF, Chrome, Safari), vml (IE), svg (FF, Chrome, Safari, Opera), silverlight (IE8), svgWeb(FF, Chrome, Safari, Opera, IE).
			//
			//		Browsers:
			//		IE [6,7,8], FF [3.6], Chrome (latest for February 2011), Safari [5.0.3], Opera [11.01].

			if(textDir && text && text.length > 1){
				var sourceDir = "ltr", targetDir = textDir;

				if(targetDir == "auto"){
					//is auto by default
					if(g.isVml){
						return text;
					}
					targetDir = bidiEngine.checkContextual(text);
				}

				if(g.isVml){
					sourceDir = bidiEngine.checkContextual(text);
					if(targetDir != sourceDir){
						if(targetDir == "rtl"){
							return !bidiEngine.hasBidiChar(text) ? bidiEngine.bidiTransform(text,"IRNNN","ILNNN") : bidi_const.RLM + bidi_const.RLM + text;
						}else{
							return bidi_const.LRM + text;
						}
					}
					return text;
				}
				if(g.isSvgWeb){
					if(targetDir == "rtl"){
						return bidiEngine.bidiTransform(text,"IRNNN","ILNNN");
					}
					return text;
				}
				//unlike the g.Text that is rendered in logical layout for Bidi scripts.
				//for g.TextPath in svg always visual -> bidi script is unreadable (except Opera and FF start from version 4)
				if(g.isSvg){
					if(has("opera") || has("ff") >= 4){
						text = bidi_const.LRM + (targetDir == "rtl"? bidi_const.RLE : bidi_const.LRE) + text + bidi_const.PDF;
					}else{
						text = (targetDir == "rtl") ? bidiEngine.bidiTransform(text,"IRYNN","VLNNN") : bidiEngine.bidiTransform(text,"ILYNN","VLNNN");
					}
				}					
			}	
			return text;
		},
		bidiPreprocess: function(newText){
			if(newText && (typeof newText == "string")){
				this.origText = newText;
				newText = this.formatText(newText,this.textDir);
			}
			return newText;
		}
	});	
		
	var extendMethod = function(shape, method, before, after){
		// summary:
		//		Some helper function. Used for extending methods of shape.
		// shape: Object
		//		The shape we overriding it's method.
		// method: String
		//		The method that is extended, the original method is called before or after
		//		functions that passed to extendMethod.
		// before: function
		//		If defined this function will be executed before the original method.
		// after: function
		//		If defined this function will be executed after the original method.
		var old = shape.prototype[method];
		shape.prototype[method] = 
			function(){
				var rBefore;
				if (before){
					rBefore = before.apply(this, arguments);
				}
				var r = old.call(this, rBefore);
				if (after){
					r = after.call(this, r, arguments);
				}
				return r;
			};
	};

	var bidiPreprocess = function(newText){
		if (newText){  
			if (newText.textDir){
				newText.textDir = validateTextDir(newText.textDir);
			}
			if (newText.text && (newText.text instanceof Array)){
				newText.text = newText.text.join(",");
			}
		}
		if(newText && (newText.text != undefined || newText.textDir) && (this.textDir != newText.textDir || newText.text != this.origText)){
			// store the original text. 
			this.origText = (newText.text != undefined) ? newText.text : this.origText;
			if(newText.textDir){
				this.textDir = newText.textDir;
			}
			newText.text = this.formatText(this.origText,this.textDir);
		}
		return this.bidiPreprocess(newText);

	};

	// Instead of adding bidiPreprocess to all renders one by one
	// use the extendMethod, at first there's a need for bidi transformation 
	// on text then call to original setShape.
	extendMethod(g.Text,"setShape", bidiPreprocess, null);
	extendMethod(g.TextPath,"setText", bidiPreprocess, null);
	
	var restoreText = function(origObj){
		var obj = lang.clone(origObj);
		if (obj && this.origText){
			obj.text = this.origText;
		}
		return obj;
	};

	// Instead of adding restoreText to all renders one by one
	// use the extendMethod, at first get the shape by calling the original getShape,
	// than resrore original text (without the text transformations).
	extendMethod(g.Text, "getShape", null, restoreText);
	extendMethod(g.TextPath, "getText", null, restoreText);

	var groupTextDir = function(group, args){
		var textDir;
		if (args && args[0]){
			textDir = validateTextDir(args[0]);
		}
		group.setTextDir(textDir ? textDir : this.textDir);
		return group;	// dojox/gfx.Group
	};

	// In creation of Group there's a need to update it's textDir,
	// so instead of doing it in renders one by one (vml vs others)
	// use the extendMethod, at first the original createGroup is applied, the
	// groupTextDir which is setts Group's textDir as it's father's or if was defined
	// by user by this value.
	extendMethod(g.Surface, "createGroup", null, groupTextDir);
	extendMethod(g.Group, "createGroup", null, groupTextDir);

	var textDirPreprocess =  function(text){
		// inherit from surface / group  if textDir is defined there
		if(text){
			var textDir = text.textDir ? validateTextDir(text.textDir) : this.textDir;
			if(textDir){
				text.textDir = textDir;
			}
		}
		return text;
	};

	// In creation there's a need to some preprocess,
	// so instead of doing it in renders one by one (vml vs others)
	// use the extendMethod, at first the textDirPreprocess function handles the input
	// then the original createXXXXXX is applied.
	extendMethod(g.Surface,"createText", textDirPreprocess, null);
	extendMethod(g.Surface,"createTextPath", textDirPreprocess, null);
	extendMethod(g.Group,"createText", textDirPreprocess, null);
	extendMethod(g.Group,"createTextPath", textDirPreprocess, null);

	/*=====
	// don't mask definition of original createSurface() function from doc parser
	g = {};
	=====*/

	g.createSurface = function(parentNode, width, height, textDir) {
		var s = g[g.renderer].createSurface(parentNode, width, height);
		var tDir = validateTextDir(textDir);
		
		if(g.isSvgWeb){
			s.textDir = tDir ? tDir : html.style(dom.byId(parentNode),"direction");
			return s;
		}
		// if textDir was defined use it, else get default value.
		//s.textDir = tDir ? tDir : html.style(s.rawNode,"direction");
		if(g.isVml || g.isSvg || g.isCanvas){
			s.textDir = tDir ? tDir : html.style(s.rawNode,"direction");
		}
		if(g.isSilverlight){
			// allow this once rawNode will be able for the silverlight
			//s.textDir = tDir ? tDir : dojo.style(s.rawNode,"direction");
			s.textDir = tDir ? tDir : html.style(s._nodes[1],"direction");
		}
		
		return s;
	};
	/*===== g = origG; =====*/

	// some helper functions
	
	function setTextDir(/*Object*/ obj, /*String*/ newTextDir){
		var tDir = validateTextDir(newTextDir);
		if (tDir){
			g.utils.forEach(obj,function(e){
				if(e instanceof g.Surface || e instanceof g.Group){
					e.textDir = tDir;
				}		
				if(e instanceof g.Text){
					e.setShape({textDir: tDir});
				}
				if(e instanceof g.TextPath){
					e.setText({textDir: tDir})
				}
			}, obj);
		}
		return obj;
	}

	function validateTextDir(textDir){
		var validValues = ["ltr","rtl","auto"]; 
		if (textDir){
			textDir = textDir.toLowerCase();
			if (arr.indexOf(validValues, textDir) < 0){
				return null;
			}
		}
		return textDir;
	}

	return g; // return gfx api augmented with bidi support	
});


},
'dojox/gfx/fx':function(){
define("dojox/gfx/fx", ["dojo/_base/lang", "./_base", "./matrix", "dojo/_base/Color", "dojo/_base/array", "dojo/_base/fx", "dojo/_base/connect"], 
  function(lang, g, m, Color, arr, fx, Hub){
	var fxg = g.fx = {};

	// Generic interpolators. Should they be moved to dojox.fx?

	function InterpolNumber(start, end){
		this.start = start, this.end = end;
	}
	InterpolNumber.prototype.getValue = function(r){
		return (this.end - this.start) * r + this.start;
	};

	function InterpolUnit(start, end, units){
		this.start = start, this.end = end;
		this.units = units;
	}
	InterpolUnit.prototype.getValue = function(r){
		return (this.end - this.start) * r + this.start + this.units;
	};

	function InterpolColor(start, end){
		this.start = start, this.end = end;
		this.temp = new Color();
	}
	InterpolColor.prototype.getValue = function(r){
		return Color.blendColors(this.start, this.end, r, this.temp);
	};

	function InterpolValues(values){
		this.values = values;
		this.length = values.length;
	}
	InterpolValues.prototype.getValue = function(r){
		return this.values[Math.min(Math.floor(r * this.length), this.length - 1)];
	};

	function InterpolObject(values, def){
		this.values = values;
		this.def = def ? def : {};
	}
	InterpolObject.prototype.getValue = function(r){
		var ret = lang.clone(this.def);
		for(var i in this.values){
			ret[i] = this.values[i].getValue(r);
		}
		return ret;
	};

	function InterpolTransform(stack, original){
		this.stack = stack;
		this.original = original;
	}
	InterpolTransform.prototype.getValue = function(r){
		var ret = [];
		arr.forEach(this.stack, function(t){
			if(t instanceof m.Matrix2D){
				ret.push(t);
				return;
			}
			if(t.name == "original" && this.original){
				ret.push(this.original);
				return;
			}
 			// Adding support for custom matrices
 			if(t.name == "matrix"){
 				if((t.start instanceof m.Matrix2D) && (t.end instanceof m.Matrix2D)){
 					var transfMatrix = new m.Matrix2D();
 					for(var p in t.start) {
 						transfMatrix[p] = (t.end[p] - t.start[p])*r + t.start[p];
 					}
 					ret.push(transfMatrix);
 				}
 				return;
 			}
			if(!(t.name in m)){ return; }
			var f = m[t.name];
			if(typeof f != "function"){
				// constant
				ret.push(f);
				return;
			}
			var val = arr.map(t.start, function(v, i){
							return (t.end[i] - v) * r + v;
						}),
				matrix = f.apply(m, val);
			if(matrix instanceof m.Matrix2D){
				ret.push(matrix);
			}
		}, this);
		return ret;
	};

	var transparent = new Color(0, 0, 0, 0);

	function getColorInterpol(prop, obj, name, def){
		if(prop.values){
			return new InterpolValues(prop.values);
		}
		var value, start, end;
		if(prop.start){
			start = g.normalizeColor(prop.start);
		}else{
			start = value = obj ? (name ? obj[name] : obj) : def;
		}
		if(prop.end){
			end = g.normalizeColor(prop.end);
		}else{
			if(!value){
				value = obj ? (name ? obj[name] : obj) : def;
			}
			end = value;
		}
		return new InterpolColor(start, end);
	}

	function getNumberInterpol(prop, obj, name, def){
		if(prop.values){
			return new InterpolValues(prop.values);
		}
		var value, start, end;
		if(prop.start){
			start = prop.start;
		}else{
			start = value = obj ? obj[name] : def;
		}
		if(prop.end){
			end = prop.end;
		}else{
			if(typeof value != "number"){
				value = obj ? obj[name] : def;
			}
			end = value;
		}
		return new InterpolNumber(start, end);
	}

	fxg.animateStroke = function(/*Object*/ args){
		// summary:
		//		Returns an animation which will change stroke properties over time.
		// args:
		//		an object defining the animation setting.
		// example:
		//	|	fxg.animateStroke{{
		//	|		shape: shape,
		//	|		duration: 500,
		//	|		color: {start: "red", end: "green"},
		//	|		width: {end: 15},
		//	|		join:  {values: ["miter", "bevel", "round"]}
		//	|	}).play();
		if(!args.easing){ args.easing = fx._defaultEasing; }
		var anim = new fx.Animation(args), shape = args.shape, stroke;
		Hub.connect(anim, "beforeBegin", anim, function(){
			stroke = shape.getStroke();
			var prop = args.color, values = {}, value, start, end;
			if(prop){
				values.color = getColorInterpol(prop, stroke, "color", transparent);
			}
			prop = args.style;
			if(prop && prop.values){
				values.style = new InterpolValues(prop.values);
			}
			prop = args.width;
			if(prop){
				values.width = getNumberInterpol(prop, stroke, "width", 1);
			}
			prop = args.cap;
			if(prop && prop.values){
				values.cap = new InterpolValues(prop.values);
			}
			prop = args.join;
			if(prop){
				if(prop.values){
					values.join = new InterpolValues(prop.values);
				}else{
					start = prop.start ? prop.start : (stroke && stroke.join || 0);
					end = prop.end ? prop.end : (stroke && stroke.join || 0);
					if(typeof start == "number" && typeof end == "number"){
						values.join = new InterpolNumber(start, end);
					}
				}
			}
			this.curve = new InterpolObject(values, stroke);
		});
		Hub.connect(anim, "onAnimate", shape, "setStroke");
		return anim; // dojo.Animation
	};

	fxg.animateFill = function(/*Object*/ args){
		// summary:
		//		Returns an animation which will change fill color over time.
		//		Only solid fill color is supported at the moment
		// args:
		//		an object defining the animation setting.
		// example:
		//	|	gfx.animateFill{{
		//	|		shape: shape,
		//	|		duration: 500,
		//	|		color: {start: "red", end: "green"}
		//	|	}).play();
		if(!args.easing){ args.easing = fx._defaultEasing; }
		var anim = new fx.Animation(args), shape = args.shape, fill;
		Hub.connect(anim, "beforeBegin", anim, function(){
			fill = shape.getFill();
			var prop = args.color, values = {};
			if(prop){
				this.curve = getColorInterpol(prop, fill, "", transparent);
			}
		});
		Hub.connect(anim, "onAnimate", shape, "setFill");
		return anim; // dojo.Animation
	};

	fxg.animateFont = function(/*Object*/ args){
		// summary:
		//		Returns an animation which will change font properties over time.
		// args:
		//		an object defining the animation setting.
		// example:
		//	|	gfx.animateFont{{
		//	|		shape: shape,
		//	|		duration: 500,
		//	|		variant: {values: ["normal", "small-caps"]},
		//	|		size:  {end: 10, units: "pt"}
		//	|	}).play();
		if(!args.easing){ args.easing = fx._defaultEasing; }
		var anim = new fx.Animation(args), shape = args.shape, font;
		Hub.connect(anim, "beforeBegin", anim, function(){
			font = shape.getFont();
			var prop = args.style, values = {}, value, start, end;
			if(prop && prop.values){
				values.style = new InterpolValues(prop.values);
			}
			prop = args.variant;
			if(prop && prop.values){
				values.variant = new InterpolValues(prop.values);
			}
			prop = args.weight;
			if(prop && prop.values){
				values.weight = new InterpolValues(prop.values);
			}
			prop = args.family;
			if(prop && prop.values){
				values.family = new InterpolValues(prop.values);
			}
			prop = args.size;
			if(prop && prop.units){
				start = parseFloat(prop.start ? prop.start : (shape.font && shape.font.size || "0"));
				end = parseFloat(prop.end ? prop.end : (shape.font && shape.font.size || "0"));
				values.size = new InterpolUnit(start, end, prop.units);
			}
			this.curve = new InterpolObject(values, font);
		});
		Hub.connect(anim, "onAnimate", shape, "setFont");
		return anim; // dojo.Animation
	};

	fxg.animateTransform = function(/*Object*/ args){
		// summary:
		//		Returns an animation which will change transformation over time.
		// args:
		//		an object defining the animation setting.
		// example:
		//	|	gfx.animateTransform{{
		//	|		shape: shape,
		//	|		duration: 500,
		//	|		transform: [
		//	|			{name: "translate", start: [0, 0], end: [200, 200]},
		//	|			{name: "original"}
		//	|		]
		//	|	}).play();
		if(!args.easing){ args.easing = fx._defaultEasing; }
		var anim = new fx.Animation(args), shape = args.shape, original;
		Hub.connect(anim, "beforeBegin", anim, function(){
			original = shape.getTransform();
			this.curve = new InterpolTransform(args.transform, original);
		});
		Hub.connect(anim, "onAnimate", shape, "setTransform");
		return anim; // dojo.Animation
	};
	
	return fxg;
});

},
'dojox/gfx/utils':function(){
define("dojox/gfx/utils", ["dojo/_base/kernel","dojo/_base/lang","./_base", "dojo/_base/html","dojo/_base/array", "dojo/_base/window", "dojo/_base/json", 
	"dojo/_base/Deferred", "dojo/_base/sniff", "require","dojo/_base/config"], 
  function(kernel, lang, g, html, arr, win, jsonLib, Deferred, has, require, config){
	var gu = g.utils = {};

	lang.mixin(gu, {
		forEach: function(
			/*dojox/gfx/shape.Surface|dojox/gfx/shape.Shape*/ object,
			/*Function|String|Array*/ f, /*Object?*/ o
		){
			// summary:
			//		Takes a shape or a surface and applies a function "f" to in the context of "o"
			//		(or global, if missing). If "shape" was a surface or a group, it applies the same
			//		function to all children recursively effectively visiting all shapes of the underlying scene graph.
			// object:
			//		The gfx container to iterate.
			// f:
			//		The function to apply.
			// o:
			//		The scope.
			o = o || kernel.global;
			f.call(o, object);
			if(object instanceof g.Surface || object instanceof g.Group){
				arr.forEach(object.children, function(shape){
					gu.forEach(shape, f, o);
				});
			}
		},

		serialize: function(object){
			// summary:
			//		Takes a shape or a surface and returns a JSON-like object, which describes underlying shapes.
			// object: dojox/gfx/shape.Surface|dojox/gfx/shape.Shape
			//		The container to serialize.

			var t = {}, v, isSurface = object instanceof g.Surface;
			if(isSurface || object instanceof g.Group){
				t.children = arr.map(object.children, gu.serialize);
				if(isSurface){
					return t.children;	// Array
				}
			}else{
				t.shape = object.getShape();
			}
			if(object.getTransform){
				v = object.getTransform();
				if(v){ t.transform = v; }
			}
			if(object.getStroke){
				v = object.getStroke();
				if(v){ t.stroke = v; }
			}
			if(object.getFill){
				v = object.getFill();
				if(v){ t.fill = v; }
			}
			if(object.getFont){
				v = object.getFont();
				if(v){ t.font = v; }
			}
			return t;	// Object
		},

		toJson: function(object, prettyPrint){
			// summary:
			//		Works just like serialize() but returns a JSON string. If prettyPrint is true, the string is pretty-printed to make it more human-readable.
			// object: dojox/gfx/shape.Surface|dojox/gfx/shape.Shape
			//		The container to serialize.
			// prettyPrint: Boolean?
			//		Indicates whether the output string should be formatted.
			// returns: String
			
			return jsonLib.toJson(gu.serialize(object), prettyPrint);	// String
		},

		deserialize: function(parent, object){
			// summary:
			//		Takes a surface or a shape and populates it with an object produced by serialize().
			// parent: dojox/gfx/shape.Surface|dojox/gfx/shape.Shape
			//		The destination container for the deserialized shapes.
			// object: dojox/gfx/shape.Shape|Array
			//		The shapes to deserialize.

			if(object instanceof Array){
				return arr.map(object, lang.hitch(null, gu.deserialize, parent));	// Array
			}
			var shape = ("shape" in object) ? parent.createShape(object.shape) : parent.createGroup();
			if("transform" in object){
				shape.setTransform(object.transform);
			}
			if("stroke" in object){
				shape.setStroke(object.stroke);
			}
			if("fill" in object){
				shape.setFill(object.fill);
			}
			if("font" in object){
				shape.setFont(object.font);
			}
			if("children" in object){
				arr.forEach(object.children, lang.hitch(null, gu.deserialize, shape));
			}
			return shape;	// dojox/gfx/shape.Shape
		},

		fromJson: function(parent, json){
			// summary:
			//		Works just like deserialize() but takes a JSON representation of the object.
			// parent: dojox/gfx/shape.Surface|dojox/gfx/shape.Shape
			//		The destination container for the deserialized shapes.
			// json: String
			//		The shapes to deserialize.

			return gu.deserialize(parent, jsonLib.fromJson(json));	// Array|dojox/gfx/shape.Shape
		},

		toSvg: function(/*dojox/gfx/shape.Surface*/surface){
			// summary:
			//		Function to serialize a GFX surface to SVG text.
			// description:
			//		Function to serialize a GFX surface to SVG text.  The value of this output
			//		is that there are numerous serverside parser libraries that can render
			//		SVG into images in various formats.  This provides a way that GFX objects
			//		can be captured in a known format and sent serverside for serialization
			//		into an image.
			// surface:
			//		The GFX surface to serialize.
			// returns:
			//		Deferred object that will be called when SVG serialization is complete.
		
			//Since the init and even surface creation can be async, we need to
			//return a deferred that will be called when content has serialized.
			var deferred = new Deferred();
		
			if(g.renderer === "svg"){
				//If we're already in SVG mode, this is easy and quick.
				try{
					var svg = gu._cleanSvg(gu._innerXML(surface.rawNode));
					deferred.callback(svg);
				}catch(e){
					deferred.errback(e);
				}
			}else{
				//Okay, now we have to get creative with hidden iframes and the like to
				//serialize SVG.
				if (!gu._initSvgSerializerDeferred) {
					gu._initSvgSerializer();
				}
				var jsonForm = gu.toJson(surface);
				var serializer = function(){
					try{
						var sDim = surface.getDimensions();
						var width = sDim.width;
						var	height = sDim.height;

						//Create an attach point in the iframe for the contents.
						var node = gu._gfxSvgProxy.document.createElement("div");
						gu._gfxSvgProxy.document.body.appendChild(node);
						//Set the node scaling.
						win.withDoc(gu._gfxSvgProxy.document, function() {
							html.style(node, "width", width);
							html.style(node, "height", height);
						}, this);

						//Create temp surface to render object to and render.
						var ts = gu._gfxSvgProxy[dojox._scopeName].gfx.createSurface(node, width, height);

						//It's apparently possible that a suface creation is async, so we need to use
						//the whenLoaded function.  Probably not needed for SVG, but making it common
						var draw = function(surface) {
							try{
								gu._gfxSvgProxy[dojox._scopeName].gfx.utils.fromJson(surface, jsonForm);

								//Get contents and remove temp surface.
								var svg = gu._cleanSvg(node.innerHTML);
								surface.clear();
								surface.destroy();
								gu._gfxSvgProxy.document.body.removeChild(node);
								deferred.callback(svg);
							}catch(e){
								deferred.errback(e);
							}
						};
						ts.whenLoaded(null,draw);
					 }catch (ex) {
						deferred.errback(ex);
					}
				};
				//See if we can call it directly or pass it to the deferred to be
				//called on initialization.
				if(gu._initSvgSerializerDeferred.fired > 0){
					serializer();
				}else{
					gu._initSvgSerializerDeferred.addCallback(serializer);
				}
			}
			return deferred; //dojo.Deferred that will be called when serialization finishes.
		},

		//iFrame document used for handling SVG serialization.
		_gfxSvgProxy: null,

		//Serializer loaded.
		_initSvgSerializerDeferred: null,

		_svgSerializerInitialized: function() {
			// summary:
			//		Internal function to call when the serializer init completed.
			// tags:
			//		private
			gu._initSvgSerializerDeferred.callback(true);
		},

		_initSvgSerializer: function(){
			// summary:
			//		Internal function to initialize the hidden iframe where SVG rendering
			//		will occur.
			// tags:
			//		private
			if(!gu._initSvgSerializerDeferred){
				gu._initSvgSerializerDeferred = new Deferred();
				var f = win.doc.createElement("iframe");
				html.style(f, {
					display: "none",
					position: "absolute",
					width: "1em",
					height: "1em",
					top: "-10000px"
				});
				var intv;
				if(has("ie")){
					f.onreadystatechange = function(){
						if(f.contentWindow.document.readyState == "complete"){
							f.onreadystatechange = function() {};
							intv = setInterval(function() {
								if(f.contentWindow[kernel.scopeMap["dojo"][1]._scopeName] &&
								   f.contentWindow[kernel.scopeMap["dojox"][1]._scopeName].gfx &&
								   f.contentWindow[kernel.scopeMap["dojox"][1]._scopeName].gfx.utils){
									clearInterval(intv);
									f.contentWindow.parent[kernel.scopeMap["dojox"][1]._scopeName].gfx.utils._gfxSvgProxy = f.contentWindow;
									f.contentWindow.parent[kernel.scopeMap["dojox"][1]._scopeName].gfx.utils._svgSerializerInitialized();
								}
							}, 50);
						}
					};
				}else{
					f.onload = function(){
						f.onload = function() {};
						intv = setInterval(function() {
							if(f.contentWindow[kernel.scopeMap["dojo"][1]._scopeName] &&
							   f.contentWindow[kernel.scopeMap["dojox"][1]._scopeName].gfx &&
							   f.contentWindow[kernel.scopeMap["dojox"][1]._scopeName].gfx.utils){
								clearInterval(intv);
								f.contentWindow.parent[kernel.scopeMap["dojox"][1]._scopeName].gfx.utils._gfxSvgProxy = f.contentWindow;
								f.contentWindow.parent[kernel.scopeMap["dojox"][1]._scopeName].gfx.utils._svgSerializerInitialized();
							}
						}, 50);
					};
				}
				//We have to load the GFX SVG proxy frame.  Default is to use the one packaged in dojox.
				var uri = (config["dojoxGfxSvgProxyFrameUrl"]||require.toUrl("dojox/gfx/resources/gfxSvgProxyFrame.html"));
				f.setAttribute("src", uri.toString());
				win.body().appendChild(f);
			}
		},

		_innerXML: function(/*Node*/node){
			// summary:
			//		Implementation of MS's innerXML function, borrowed from dojox.xml.parser.
			// node:
			//		The node from which to generate the XML text representation.
			// tags:
			//		private
			if(node.innerXML){
				return node.innerXML;	//String
			}else if(node.xml){
				return node.xml;		//String
			}else if(typeof XMLSerializer != "undefined"){
				return (new XMLSerializer()).serializeToString(node);	//String
			}
			return null;
		},

		_cleanSvg: function(svg) {
			// summary:
			//		Internal function that cleans up artifacts in extracted SVG content.
			// tags:
			//		private
			if(svg){
				//Make sure the namespace is set.
				if(svg.indexOf("xmlns=\"http://www.w3.org/2000/svg\"") == -1){
					svg = svg.substring(4, svg.length);
					svg = "<svg xmlns=\"http://www.w3.org/2000/svg\"" + svg;
				}
				//Same for xmlns:xlink (missing in Chrome and Safari)
				if(svg.indexOf("xmlns:xlink=\"http://www.w3.org/1999/xlink\"") == -1){
					svg = svg.substring(4, svg.length);
					svg = "<svg xmlns:xlink=\"http://www.w3.org/1999/xlink\"" + svg;
				}
				//and add namespace to href attribute if not done yet 
				//(FF 5+ adds xlink:href but not the xmlns def)
				if(svg.indexOf("xlink:href") === -1){
					svg = svg.replace(/href\s*=/g, "xlink:href=");
				}
				// in IE, <image are serialized as <img>
				svg = svg.replace(/<img\b([^>]*)>/gi,"<image $1 />");
				//Do some other cleanup, like stripping out the
				//dojoGfx attributes and quoting ids.
				svg = svg.replace(/\bdojoGfx\w*\s*=\s*(['"])\w*\1/g, "");
				svg = svg.replace(/\b__gfxObject__\s*=\s*(['"])\w*\1/g, "");
				svg = svg.replace(/[=]([^"']+?)(\s|>)/g,'="$1"$2');
			}
			return svg;  //Cleaned SVG text.
		}
	});

	return gu;
});

},
'dojox/gfx/_base':function(){
define("dojox/gfx/_base", ["dojo/_base/kernel", "dojo/_base/lang", "dojo/_base/Color", "dojo/_base/sniff", "dojo/_base/window",
	    "dojo/_base/array","dojo/dom", "dojo/dom-construct","dojo/dom-geometry"],
function(kernel, lang, Color, has, win, arr, dom, domConstruct, domGeom){
	// module:
	//		dojox/gfx
	// summary:
	//		This module contains common core Graphics API used by different graphics renderers.

	var g = lang.getObject("dojox.gfx", true),
		b = g._base = {};
	
	// candidates for dojox.style (work on VML and SVG nodes)
	g._hasClass = function(/*DomNode*/node, /*String*/classStr){
		// summary:
		//		Returns whether or not the specified classes are a portion of the
		//		class list currently applied to the node.
		
		// return (new RegExp('(^|\\s+)'+classStr+'(\\s+|$)')).test(node.className)	// Boolean
		var cls = node.getAttribute("className");
		return cls && (" " + cls + " ").indexOf(" " + classStr + " ") >= 0;  // Boolean
	};
	g._addClass = function(/*DomNode*/node, /*String*/classStr){
		// summary:
		//		Adds the specified classes to the end of the class list on the
		//		passed node.
		var cls = node.getAttribute("className") || "";
		if(!cls || (" " + cls + " ").indexOf(" " + classStr + " ") < 0){
			node.setAttribute("className", cls + (cls ? " " : "") + classStr);
		}
	};
	g._removeClass = function(/*DomNode*/node, /*String*/classStr){
		// summary:
		//		Removes classes from node.
		var cls = node.getAttribute("className");
		if(cls){
			node.setAttribute(
				"className",
				cls.replace(new RegExp('(^|\\s+)' + classStr + '(\\s+|$)'), "$1$2")
			);
		}
	};

	// candidate for dojox.html.metrics (dynamic font resize handler is not implemented here)

	//		derived from Morris John's emResized measurer
	b._getFontMeasurements = function(){
		// summary:
		//		Returns an object that has pixel equivilents of standard font
		//		size values.
		var heights = {
			'1em': 0, '1ex': 0, '100%': 0, '12pt': 0, '16px': 0, 'xx-small': 0,
			'x-small': 0, 'small': 0, 'medium': 0, 'large': 0, 'x-large': 0,
			'xx-large': 0
		};
		var p;

		if(has("ie")){
			//		we do a font-size fix if and only if one isn't applied already.
			// NOTE: If someone set the fontSize on the HTML Element, this will kill it.
			win.doc.documentElement.style.fontSize="100%";
		}

		//		set up the measuring node.
		var div = domConstruct.create("div", {style: {
				position: "absolute",
				left: "0",
				top: "-100px",
				width: "30px",
				height: "1000em",
				borderWidth: "0",
				margin: "0",
				padding: "0",
				outline: "none",
				lineHeight: "1",
				overflow: "hidden"
			}}, win.body());

		//		do the measurements.
		for(p in heights){
			div.style.fontSize = p;
			heights[p] = Math.round(div.offsetHeight * 12/16) * 16/12 / 1000;
		}

		win.body().removeChild(div);
		return heights; //object
	};

	var fontMeasurements = null;

	b._getCachedFontMeasurements = function(recalculate){
		if(recalculate || !fontMeasurements){
			fontMeasurements = b._getFontMeasurements();
		}
		return fontMeasurements;
	};

	// candidate for dojox.html.metrics

	var measuringNode = null, empty = {};
	b._getTextBox = function(	/*String*/ text,
								/*Object*/ style,
								/*String?*/ className){
		var m, s, al = arguments.length;
		var i;
		if(!measuringNode){
			measuringNode = domConstruct.create("div", {style: {
				position: "absolute",
				top: "-10000px",
				left: "0"
			}}, win.body());
		}
		m = measuringNode;
		// reset styles
		m.className = "";
		s = m.style;
		s.borderWidth = "0";
		s.margin = "0";
		s.padding = "0";
		s.outline = "0";
		// set new style
		if(al > 1 && style){
			for(i in style){
				if(i in empty){ continue; }
				s[i] = style[i];
			}
		}
		// set classes
		if(al > 2 && className){
			m.className = className;
		}
		// take a measure
		m.innerHTML = text;

		if(m["getBoundingClientRect"]){
			var bcr = m.getBoundingClientRect();
			return {l: bcr.left, t: bcr.top, w: bcr.width || (bcr.right - bcr.left), h: bcr.height || (bcr.bottom - bcr.top)};
		}else{
			return domGeom.getMarginBox(m);
		}
	};

	// candidate for dojo.dom

	var uniqueId = 0;
	b._getUniqueId = function(){
		// summary:
		//		returns a unique string for use with any DOM element
		var id;
		do{
			id = kernel._scopeName + "xUnique" + (++uniqueId);
		}while(dom.byId(id));
		return id;
	};

	/*=====
	g.Stroke = {
		// summary:
		//		A stroke defines stylistic properties that are used when drawing a path.

		// color: String
		//		The color of the stroke, default value 'black'.
		color: "black",

		// style: String
		//		The style of the stroke, one of 'solid', ... . Default value 'solid'.
		style: "solid",

		// width: Number
		//		The width of a stroke, default value 1.
		width: 1,

		// cap: String
		//		The endcap style of the path. One of 'butt', 'round', ... . Default value 'butt'.
		cap: "butt",

		// join: Number
		//		The join style to use when combining path segments. Default value 4.
		join: 4
	};
	
	g.Fill = {
		// summary:
		//		Defines how to fill a shape. Four types of fills can be used: solid, linear gradient, radial gradient and pattern.
		//		See dojox/gfx.LinearGradient, dojox/gfx.RadialGradient and dojox/gfx.Pattern respectively for more information about the properties supported by each type.
		
		// type: String?
		//		The type of fill. One of 'linear', 'radial', 'pattern' or undefined. If not specified, a solid fill is assumed.
		type:"",
		
		// color: String|dojo/Color?
		//		The color of a solid fill type.
		color:null,
		
	};
	
	g.LinearGradient = {
		// summary:
		//		An object defining the default stylistic properties used for Linear Gradient fills.
		//		Linear gradients are drawn along a virtual line, which results in appearance of a rotated pattern in a given direction/orientation.

		// type: String
		//		Specifies this object is a Linear Gradient, value 'linear'
		type: "linear",

		// x1: Number
		//		The X coordinate of the start of the virtual line along which the gradient is drawn, default value 0.
		x1: 0,

		// y1: Number
		//		The Y coordinate of the start of the virtual line along which the gradient is drawn, default value 0.
		y1: 0,

		// x2: Number
		//		The X coordinate of the end of the virtual line along which the gradient is drawn, default value 100.
		x2: 100,

		// y2: Number
		//		The Y coordinate of the end of the virtual line along which the gradient is drawn, default value 100.
		y2: 100,

		// colors: Array
		//		An array of colors at given offsets (from the start of the line).  The start of the line is
		//		defined at offest 0 with the end of the line at offset 1.
		//		Default value, [{ offset: 0, color: 'black'},{offset: 1, color: 'white'}], is a gradient from black to white.
		colors: []
	};
	
	g.RadialGradient = {
		// summary:
		//		Specifies the properties for RadialGradients using in fills patterns.

		// type: String
		//		Specifies this is a RadialGradient, value 'radial'
		type: "radial",

		// cx: Number
		//		The X coordinate of the center of the radial gradient, default value 0.
		cx: 0,

		// cy: Number
		//		The Y coordinate of the center of the radial gradient, default value 0.
		cy: 0,

		// r: Number
		//		The radius to the end of the radial gradient, default value 100.
		r: 100,

		// colors: Array
		//		An array of colors at given offsets (from the center of the radial gradient).
		//		The center is defined at offest 0 with the outer edge of the gradient at offset 1.
		//		Default value, [{ offset: 0, color: 'black'},{offset: 1, color: 'white'}], is a gradient from black to white.
		colors: []
	};
	
	g.Pattern = {
		// summary:
		//		An object specifying the default properties for a Pattern using in fill operations.

		// type: String
		//		Specifies this object is a Pattern, value 'pattern'.
		type: "pattern",

		// x: Number
		//		The X coordinate of the position of the pattern, default value is 0.
		x: 0,

		// y: Number
		//		The Y coordinate of the position of the pattern, default value is 0.
		y: 0,

		// width: Number
		//		The width of the pattern image, default value is 0.
		width: 0,

		// height: Number
		//		The height of the pattern image, default value is 0.
		height: 0,

		// src: String
		//		A url specifying the image to use for the pattern.
		src: ""
	};

	g.Text = {
		//	summary:
		//		A keyword argument object defining both the text to be rendered in a VectorText shape,
		//		and specifying position, alignment, and fitting.
		//	text: String
		//		The text to be rendered.
		//	x: Number?
		//		The left coordinate for the text's bounding box.
		//	y: Number?
		//		The top coordinate for the text's bounding box.
		//	width: Number?
		//		The width of the text's bounding box.
		//	height: Number?
		//		The height of the text's bounding box.
		//	align: String?
		//		The alignment of the text, as defined in SVG. Can be "start", "end" or "middle".
		//	fitting: Number?
		//		How the text is to be fitted to the bounding box. Can be 0 (no fitting), 1 (fitting based on
		//		passed width of the bounding box and the size of the font), or 2 (fit text to the bounding box,
		//		and ignore any size parameters).
		//	leading: Number?
		//		The leading to be used between lines in the text.
		//	decoration: String?
		//		Any text decoration to be used.
	};

	g.Font = {
		// summary:
		//		An object specifying the properties for a Font used in text operations.
	
		// type: String
		//		Specifies this object is a Font, value 'font'.
		type: "font",
	
		// style: String
		//		The font style, one of 'normal', 'bold', default value 'normal'.
		style: "normal",
	
		// variant: String
		//		The font variant, one of 'normal', ... , default value 'normal'.
		variant: "normal",
	
		// weight: String
		//		The font weight, one of 'normal', ..., default value 'normal'.
		weight: "normal",
	
		// size: String
		//		The font size (including units), default value '10pt'.
		size: "10pt",
	
		// family: String
		//		The font family, one of 'serif', 'sanserif', ..., default value 'serif'.
		family: "serif"
	};

	=====*/

	lang.mixin(g, {
		// summary:
		//		defines constants, prototypes, and utility functions for the core Graphics API

		// default shapes, which are used to fill in missing parameters
		defaultPath: {
			// summary:
			//		Defines the default Path prototype object.

			// type: String
			//		Specifies this object is a Path, default value 'path'.
			type: "path", 

			// path: String
			//		The path commands. See W32C SVG 1.0 specification.
			//		Defaults to empty string value.
			path: ""
		},
		defaultPolyline: {
			// summary:
			//		Defines the default PolyLine prototype.

			// type: String
			//		Specifies this object is a PolyLine, default value 'polyline'.
			type: "polyline",

			// points: Array
			//		An array of point objects [{x:0,y:0},...] defining the default polyline's line segments. Value is an empty array [].
			points: []
		},
		defaultRect: {
			// summary:
			//		Defines the default Rect prototype.

			// type: String
			//		Specifies this default object is a type of Rect. Value is 'rect'
			type: "rect",

			// x: Number
			//		The X coordinate of the default rectangles position, value 0.
			x: 0,

			// y: Number
			//		The Y coordinate of the default rectangle's position, value 0.
			y: 0,

			// width: Number
			//		The width of the default rectangle, value 100.
			width: 100,

			// height: Number
			//		The height of the default rectangle, value 100.
			height: 100,

			// r: Number
			//		The corner radius for the default rectangle, value 0.
			r: 0
		},
		defaultEllipse: {
			// summary:
			//		Defines the default Ellipse prototype.

			// type: String
			//		Specifies that this object is a type of Ellipse, value is 'ellipse'
			type: "ellipse",

			// cx: Number
			//		The X coordinate of the center of the ellipse, default value 0.
			cx: 0,

			// cy: Number
			//		The Y coordinate of the center of the ellipse, default value 0.
			cy: 0,

			// rx: Number
			//		The radius of the ellipse in the X direction, default value 200.
			rx: 200,

			// ry: Number
			//		The radius of the ellipse in the Y direction, default value 200.
			ry: 100
		},
		defaultCircle: {
			// summary:
			//		An object defining the default Circle prototype.

			// type: String
			//		Specifies this object is a circle, value 'circle'
			type: "circle",

			// cx: Number
			//		The X coordinate of the center of the circle, default value 0.
			cx: 0,
			// cy: Number
			//		The Y coordinate of the center of the circle, default value 0.
			cy: 0,

			// r: Number
			//		The radius, default value 100.
			r: 100
		},
		defaultLine: {
			// summary:
			//		An object defining the default Line prototype.

			// type: String
			//		Specifies this is a Line, value 'line'
			type: "line",

			// x1: Number
			//		The X coordinate of the start of the line, default value 0.
			x1: 0,

			// y1: Number
			//		The Y coordinate of the start of the line, default value 0.
			y1: 0,

			// x2: Number
			//		The X coordinate of the end of the line, default value 100.
			x2: 100,

			// y2: Number
			//		The Y coordinate of the end of the line, default value 100.
			y2: 100
		},
		defaultImage: {
			// summary:
			//		Defines the default Image prototype.

			// type: String
			//		Specifies this object is an image, value 'image'.
			type: "image",

			// x: Number
			//		The X coordinate of the image's position, default value 0.
			x: 0,

			// y: Number
			//		The Y coordinate of the image's position, default value 0.
			y: 0,

			// width: Number
			//		The width of the image, default value 0.
			width: 0,

			// height: Number
			//		The height of the image, default value 0.
			height: 0,

			// src: String
			//		The src url of the image, defaults to empty string.
			src: ""
		},
		defaultText: {
			// summary:
			//		Defines the default Text prototype.

			// type: String
			//		Specifies this is a Text shape, value 'text'.
			type: "text",

			// x: Number
			//		The X coordinate of the text position, default value 0.
			x: 0,

			// y: Number
			//		The Y coordinate of the text position, default value 0.
			y: 0,

			// text: String
			//		The text to be displayed, default value empty string.
			text: "",

			// align:	String
			//		The horizontal text alignment, one of 'start', 'end', 'center'. Default value 'start'.
			align: "start",

			// decoration: String
			//		The text decoration , one of 'none', ... . Default value 'none'.
			decoration: "none",

			// rotated: Boolean
			//		Whether the text is rotated, boolean default value false.
			rotated: false,

			// kerning: Boolean
			//		Whether kerning is used on the text, boolean default value true.
			kerning: true
		},
		defaultTextPath: {
			// summary:
			//		Defines the default TextPath prototype.

			// type: String
			//		Specifies this is a TextPath, value 'textpath'.
			type: "textpath",

			// text: String
			//		The text to be displayed, default value empty string.
			text: "",

			// align: String
			//		The horizontal text alignment, one of 'start', 'end', 'center'. Default value 'start'.
			align: "start",

			// decoration: String
			//		The text decoration , one of 'none', ... . Default value 'none'.
			decoration: "none",

			// rotated: Boolean
			//		Whether the text is rotated, boolean default value false.
			rotated: false,

			// kerning: Boolean
			//		Whether kerning is used on the text, boolean default value true.
			kerning: true
		},

		// default stylistic attributes
		defaultStroke: {
			// summary:
			//		A stroke defines stylistic properties that are used when drawing a path.
			//		This object defines the default Stroke prototype.
			// type: String
			//		Specifies this object is a type of Stroke, value 'stroke'.
			type: "stroke",

			// color: String
			//		The color of the stroke, default value 'black'.
			color: "black",

			// style: String
			//		The style of the stroke, one of 'solid', ... . Default value 'solid'.
			style: "solid",

			// width: Number
			//		The width of a stroke, default value 1.
			width: 1,

			// cap: String
			//		The endcap style of the path. One of 'butt', 'round', ... . Default value 'butt'.
			cap: "butt",

			// join: Number
			//		The join style to use when combining path segments. Default value 4.
			join: 4
		},
		defaultLinearGradient: {
			// summary:
			//		An object defining the default stylistic properties used for Linear Gradient fills.
			//		Linear gradients are drawn along a virtual line, which results in appearance of a rotated pattern in a given direction/orientation.

			// type: String
			//		Specifies this object is a Linear Gradient, value 'linear'
			type: "linear",

			// x1: Number
			//		The X coordinate of the start of the virtual line along which the gradient is drawn, default value 0.
			x1: 0,

			// y1: Number
			//		The Y coordinate of the start of the virtual line along which the gradient is drawn, default value 0.
			y1: 0,

			// x2: Number
			//		The X coordinate of the end of the virtual line along which the gradient is drawn, default value 100.
			x2: 100,

			// y2: Number
			//		The Y coordinate of the end of the virtual line along which the gradient is drawn, default value 100.
			y2: 100,

			// colors: Array
			//		An array of colors at given offsets (from the start of the line).  The start of the line is
			//		defined at offest 0 with the end of the line at offset 1.
			//		Default value, [{ offset: 0, color: 'black'},{offset: 1, color: 'white'}], is a gradient from black to white.
			colors: [
				{ offset: 0, color: "black" }, { offset: 1, color: "white" }
			]
		},
		defaultRadialGradient: {
			// summary:
			//		An object specifying the default properties for RadialGradients using in fills patterns.

			// type: String
			//		Specifies this is a RadialGradient, value 'radial'
			type: "radial",

			// cx: Number
			//		The X coordinate of the center of the radial gradient, default value 0.
			cx: 0,

			// cy: Number
			//		The Y coordinate of the center of the radial gradient, default value 0.
			cy: 0,

			// r: Number
			//		The radius to the end of the radial gradient, default value 100.
			r: 100,

			// colors: Array
			//		An array of colors at given offsets (from the center of the radial gradient).
			//		The center is defined at offest 0 with the outer edge of the gradient at offset 1.
			//		Default value, [{ offset: 0, color: 'black'},{offset: 1, color: 'white'}], is a gradient from black to white.
			colors: [
				{ offset: 0, color: "black" }, { offset: 1, color: "white" }
			]
		},
		defaultPattern: {
			// summary:
			//		An object specifying the default properties for a Pattern using in fill operations.

			// type: String
			//		Specifies this object is a Pattern, value 'pattern'.
			type: "pattern",

			// x: Number
			//		The X coordinate of the position of the pattern, default value is 0.
			x: 0,

			// y: Number
			//		The Y coordinate of the position of the pattern, default value is 0.
			y: 0,

			// width: Number
			//		The width of the pattern image, default value is 0.
			width: 0,

			// height: Number
			//		The height of the pattern image, default value is 0.
			height: 0,

			// src: String
			//		A url specifying the image to use for the pattern.
			src: ""
		},
		defaultFont: {
			// summary:
			//		An object specifying the default properties for a Font used in text operations.

			// type: String
			//		Specifies this object is a Font, value 'font'.
			type: "font",

			// style: String
			//		The font style, one of 'normal', 'bold', default value 'normal'.
			style: "normal",

			// variant: String
			//		The font variant, one of 'normal', ... , default value 'normal'.
			variant: "normal",

			// weight: String
			//		The font weight, one of 'normal', ..., default value 'normal'.
			weight: "normal",

			// size: String
			//		The font size (including units), default value '10pt'.
			size: "10pt",

			// family: String
			//		The font family, one of 'serif', 'sanserif', ..., default value 'serif'.
			family: "serif"
		},

		getDefault: (function(){
			// summary:
			//		Returns a function used to access default memoized prototype objects (see them defined above).
			var typeCtorCache = {};
			// a memoized delegate()
			return function(/*String*/ type){
				var t = typeCtorCache[type];
				if(t){
					return new t();
				}
				t = typeCtorCache[type] = new Function();
				t.prototype = g[ "default" + type ];
				return new t();
			}
		})(),

		normalizeColor: function(/*dojo/Color|Array|string|Object*/ color){
			// summary:
			//		converts any legal color representation to normalized
			//		dojo/Color object
			// color:
			//		A color representation.
			return (color instanceof Color) ? color : new Color(color); // dojo/Color
		},
		normalizeParameters: function(existed, update){
			// summary:
			//		updates an existing object with properties from an 'update'
			//		object
			// existed: Object
			//		the target object to be updated
			// update: Object
			//		the 'update' object, whose properties will be used to update
			//		the existed object
			var x;
			if(update){
				var empty = {};
				for(x in existed){
					if(x in update && !(x in empty)){
						existed[x] = update[x];
					}
				}
			}
			return existed;	// Object
		},
		makeParameters: function(defaults, update){
			// summary:
			//		copies the original object, and all copied properties from the
			//		'update' object
			// defaults: Object
			//		the object to be cloned before updating
			// update: Object
			//		the object, which properties are to be cloned during updating
			// returns: Object
			//      new object with new and default properties
			var i = null;
			if(!update){
				// return dojo.clone(defaults);
				return lang.delegate(defaults);
			}
			var result = {};
			for(i in defaults){
				if(!(i in result)){
					result[i] = lang.clone((i in update) ? update[i] : defaults[i]);
				}
			}
			return result; // Object
		},
		formatNumber: function(x, addSpace){
			// summary:
			//		converts a number to a string using a fixed notation
			// x: Number
			//		number to be converted
			// addSpace: Boolean
			//		whether to add a space before a positive number
			// returns: String
			//      the formatted value
			var val = x.toString();
			if(val.indexOf("e") >= 0){
				val = x.toFixed(4);
			}else{
				var point = val.indexOf(".");
				if(point >= 0 && val.length - point > 5){
					val = x.toFixed(4);
				}
			}
			if(x < 0){
				return val; // String
			}
			return addSpace ? " " + val : val; // String
		},
		// font operations
		makeFontString: function(font){
			// summary:
			//		converts a font object to a CSS font string
			// font: Object
			//		font object (see dojox/gfx.defaultFont)
			return font.style + " " + font.variant + " " + font.weight + " " + font.size + " " + font.family; // Object
		},
		splitFontString: function(str){
			// summary:
			//		converts a CSS font string to a font object
			// description:
			//		Converts a CSS font string to a gfx font object. The CSS font
			//		string components should follow the W3C specified order
			//		(see http://www.w3.org/TR/CSS2/fonts.html#font-shorthand):
			//		style, variant, weight, size, optional line height (will be
			//		ignored), and family. Note that the Font.size attribute is limited to numeric CSS length.
			// str: String
			//		a CSS font string.
			// returns: Object
			//      object in dojox/gfx.defaultFont format
			var font = g.getDefault("Font");
			var t = str.split(/\s+/);
			do{
				if(t.length < 5){ break; }
				font.style   = t[0];
				font.variant = t[1];
				font.weight  = t[2];
				var i = t[3].indexOf("/");
				font.size = i < 0 ? t[3] : t[3].substring(0, i);
				var j = 4;
				if(i < 0){
					if(t[4] == "/"){
						j = 6;
					}else if(t[4].charAt(0) == "/"){
						j = 5;
					}
				}
				if(j < t.length){
					font.family = t.slice(j).join(" ");
				}
			}while(false);
			return font;	// Object
		},
		// length operations

		// cm_in_pt: Number
		//		points per centimeter (constant)
		cm_in_pt: 72 / 2.54,

		// mm_in_pt: Number
		//		points per millimeter (constant)
		mm_in_pt: 7.2 / 2.54,

		px_in_pt: function(){
			// summary:
			//		returns the current number of pixels per point.
			return g._base._getCachedFontMeasurements()["12pt"] / 12;	// Number
		},

		pt2px: function(len){
			// summary:
			//		converts points to pixels
			// len: Number
			//		a value in points
			return len * g.px_in_pt();	// Number
		},

		px2pt: function(len){
			// summary:
			//		converts pixels to points
			// len: Number
			//		a value in pixels
			return len / g.px_in_pt();	// Number
		},

		normalizedLength: function(len) {
			// summary:
			//		converts any length value to pixels
			// len: String
			//		a length, e.g., '12pc'
			// returns: Number
			//      pixels
			if(len.length === 0){ return 0; }
			if(len.length > 2){
				var px_in_pt = g.px_in_pt();
				var val = parseFloat(len);
				switch(len.slice(-2)){
					case "px": return val;
					case "pt": return val * px_in_pt;
					case "in": return val * 72 * px_in_pt;
					case "pc": return val * 12 * px_in_pt;
					case "mm": return val * g.mm_in_pt * px_in_pt;
					case "cm": return val * g.cm_in_pt * px_in_pt;
				}
			}
			return parseFloat(len);	// Number
		},

		// pathVmlRegExp: RegExp
		//		a constant regular expression used to split a SVG/VML path into primitive components
		// tags:
		//		private
		pathVmlRegExp: /([A-Za-z]+)|(\d+(\.\d+)?)|(\.\d+)|(-\d+(\.\d+)?)|(-\.\d+)/g,

		// pathVmlRegExp: RegExp
		//		a constant regular expression used to split a SVG/VML path into primitive components
		// tags:
		//		private
		pathSvgRegExp: /([A-Za-z])|(\d+(\.\d+)?)|(\.\d+)|(-\d+(\.\d+)?)|(-\.\d+)/g,

		equalSources: function(a, b){
			// summary:
			//		compares event sources, returns true if they are equal
			// a: Object
			//		first event source
			// b: Object
			//		event source to compare against a
			// returns: Boolean
			//      true, if objects are truthy and the same
			return a && b && a === b;
		},

		switchTo: function(/*String|Object*/ renderer){
			// summary:
			//		switch the graphics implementation to the specified renderer.
			// renderer:
			//		Either the string name of a renderer (eg. 'canvas', 'svg, ...) or the renderer
			//		object to switch to.
			var ns = typeof renderer == "string" ? g[renderer] : renderer;
			if(ns){
				// If more options are added, update the docblock at the end of shape.js!
				arr.forEach(["Group", "Rect", "Ellipse", "Circle", "Line",
						"Polyline", "Image", "Text", "Path", "TextPath",
						"Surface", "createSurface", "fixTarget"], function(name){
					g[name] = ns[name];
				});
			}
		}
	});
	
	/*=====
		g.createSurface = function(parentNode, width, height){
			// summary:
			//		creates a surface
			// parentNode: Node
			//		a parent node
			// width: String|Number
			//		width of surface, e.g., "100px" or 100
			// height: String|Number
			//		height of surface, e.g., "100px" or 100
			// returns: dojox/gfx.Surface
			//     newly created surface
		};
		g.fixTarget = function(){
			// tags:
			//		private
		};
	=====*/
	
	return g; // defaults object api
});

},
'dojox/gfx/Moveable':function(){
define("dojox/gfx/Moveable", ["dojo/_base/lang","dojo/_base/declare","dojo/_base/array","dojo/_base/event","dojo/topic","dojo/has",
	"dojo/dom-class","dojo/_base/window","./Mover"], 
  function(lang,declare,arr,event,topic,has,domClass,win,Mover){

	/*=====
	var __MoveableCtorArgs = declare("dojox.gfx.__MoveableCtorArgs", null, {
		// summary:
		//		The arguments used for dojox/gfx/Moveable constructor.

		// delay: Number
		//		delay move by this number of pixels
		delay:0,

		// mover: Object
		//		a constructor of custom Mover
		mover:Mover
	});
	=====*/

	return declare("dojox.gfx.Moveable", null, {
		constructor: function(shape, params){
			// summary:
			//		an object, which makes a shape moveable
			// shape: dojox/gfx.Shape
			//		a shape object to be moved.
			// params: __MoveableCtorArgs
			//		an optional configuration object.
			
			this.shape = shape;
			this.delay = (params && params.delay > 0) ? params.delay : 0;
			this.mover = (params && params.mover) ? params.mover : Mover;
			this.events = [
				this.shape.connect(has("touch") ? "touchstart" : "mousedown", this, "onMouseDown")
				// cancel text selection and text dragging
				//, dojo.connect(this.handle, "ondragstart",   dojo, "stopEvent")
				//, dojo.connect(this.handle, "onselectstart", dojo, "stopEvent")
			];
		},
	
		// methods
		destroy: function(){
			// summary:
			//		stops watching for possible move, deletes all references, so the object can be garbage-collected
			arr.forEach(this.events, this.shape.disconnect, this.shape);
			this.events = this.shape = null;
		},
	
		// mouse event processors
		onMouseDown: function(e){
			// summary:
			//		event processor for onmousedown, creates a Mover for the shape
			// e: Event
			//		mouse event
			if(this.delay){
				this.events.push(
					this.shape.connect(has("touch") ? "touchmove" : "mousemove", this, "onMouseMove"),
					this.shape.connect(has("touch") ? "touchend" : "mouseup", this, "onMouseUp"));
				this._lastX = has("touch") ? (e.changedTouches ? e.changedTouches[0] : e).clientX : e.clientX;
				this._lastY = has("touch") ? (e.changedTouches ? e.changedTouches[0] : e).clientY : e.clientY;
			}else{
				new this.mover(this.shape, e, this);
			}
			event.stop(e);
		},
		onMouseMove: function(e){
			// summary:
			//		event processor for onmousemove, used only for delayed drags
			// e: Event
			//		mouse event
			var clientX = has("touch") ? (e.changedTouches ? e.changedTouches[0] : e).clientX : e.clientX,
				clientY = has("touch") ? (e.changedTouches ? e.changedTouches[0] : e).clientY : e.clientY;
			
			if(Math.abs(clientX - this._lastX) > this.delay || Math.abs(clientY - this._lastY) > this.delay){
				this.onMouseUp(e);
				new this.mover(this.shape, e, this);
			}
			event.stop(e);
		},
		onMouseUp: function(e){
			// summary:
			//		event processor for onmouseup, used only for delayed delayed drags
			// e: Event
			//		mouse event
			this.shape.disconnect(this.events.pop());
		},
	
		// local events
		onMoveStart: function(/* dojox/gfx/Mover */ mover){
			// summary:
			//		called before every move operation
			// mover:
			//		A Mover instance that fired the event.
			topic.publish("/gfx/move/start", mover);
			domClass.add(win.body(), "dojoMove");
		},
		onMoveStop: function(/* dojox/gfx/Mover */ mover){
			// summary:
			//		called after every move operation
			// mover:
			//		A Mover instance that fired the event.
			topic.publish("/gfx/move/stop", mover);
			domClass.remove(win.body(), "dojoMove");
		},
		onFirstMove: function(/* dojox/gfx/Mover */ mover){
			// summary:
			//		called during the very first move notification,
			//		can be used to initialize coordinates, can be overwritten.
			// mover:
			//		A Mover instance that fired the event.
	
			// default implementation does nothing
		},
		onMove: function(/* dojox/gfx/Mover */ mover, /* Object */ shift){
			// summary:
			//		called during every move notification,
			//		should actually move the node, can be overwritten.
			// mover:
			//		A Mover instance that fired the event.
			// shift:
			//		An object as {dx,dy} that represents the shift.
			this.onMoving(mover, shift);
			this.shape.applyLeftTransform(shift);
			this.onMoved(mover, shift);
		},
		onMoving: function(/* dojox/gfx/Mover */ mover, /* Object */ shift){
			// summary:
			//		called before every incremental move,
			//		can be overwritten.
			// mover:
			//		A Mover instance that fired the event.
			// shift:
			//		An object as {dx,dy} that represents the shift.
	
			// default implementation does nothing
		},
		onMoved: function(/* dojox/gfx/Mover */ mover, /* Object */ shift){
			// summary:
			//		called after every incremental move,
			//		can be overwritten.
			// mover:
			//		A Mover instance that fired the event.
			// shift:
			//		An object as {dx,dy} that represents the shift.
	
			// default implementation does nothing
		}
	});
});

},
'dojox/gfx/canvasWithEvents':function(){
define("dojox/gfx/canvasWithEvents", ["dojo/_base/lang", "dojo/_base/declare", "dojo/_base/connect", "dojo/_base/Color", "dojo/dom", 
		"dojo/dom-geometry", "./_base","./canvas", "./shape", "./matrix"], 
function(lang, declare, hub, Color, dom, domGeom, g, canvas, shapeLib, m){
	var canvasWithEvents = g.canvasWithEvents = {
		// summary:
		//		This the graphics rendering bridge for W3C Canvas compliant browsers which extends
		//		the basic canvas drawing renderer bridge to add additional support for graphics events
		//		on Shapes.
		//		Since Canvas is an immediate mode graphics api, with no object graph or
		//		eventing capabilities, use of the canvas module alone will only add in drawing support.
		//		This additional module, canvasWithEvents extends this module with additional support
		//		for handling events on Canvas.  By default, the support for events is now included
		//		however, if only drawing capabilities are needed, canvas event module can be disabled
		//		using the dojoConfig option, canvasEvents:true|false.
		//		The id of the Canvas renderer is 'canvasWithEvents'.  This id can be used when switch Dojo's
		//		graphics context between renderer implementations.  See dojox/gfx/_base.switchRenderer
		//		API.
	};

	canvasWithEvents.Shape = declare("dojox.gfx.canvasWithEvents.Shape", canvas.Shape, {
		
		_testInputs: function(/* Object */ctx, /* Array */ pos){
			if(this.clip || (!this.canvasFill && this.strokeStyle)){
				// pixel-based until a getStrokedPath-like api is available on the path
				this._hitTestPixel(ctx, pos);
			}else{
				this._renderShape(ctx);
				var cnt = pos.length, t = this.getTransform();
				for(var i = 0; i < pos.length; ++i){
					var input = pos[i];
					// already hit
					if(input.target) continue;
					var x = input.x, y = input.y;
					var p = t ? m.multiplyPoint(m.invert(t), x, y) : {
						x: x,
						y: y
					};
					input.target = this._hitTestGeometry(ctx, p.x, p.y);
				}
			}
		},
		_hitTestPixel: function(/* Object */ctx, /* Array */ pos){
			for(var i = 0; i < pos.length; ++i){
				var input = pos[i];
				if(input.target) continue;
				var x = input.x, y = input.y;
				ctx.clearRect(0,0,1,1);
				ctx.save();
				ctx.translate(-x, -y);
				this._render(ctx, true);
				input.target = ctx.getImageData(0, 0, 1, 1).data[0] ? this : null;
				ctx.restore();
			}
		},
		_hitTestGeometry: function(ctx, x, y){
			return ctx.isPointInPath(x, y) ? this : null;
		},				
		_renderFill: function(/* Object */ ctx, /* Boolean */ apply){
			// summary:
			//		render fill for the shape
			// ctx:
			//		a canvas context object
			// apply:
			//		whether ctx.fill() shall be called
			if(ctx.pickingMode){
				if("canvasFill" in this && apply){
					ctx.fill();
				}
				return;
			}
			this.inherited(arguments);
		},
		_renderStroke: function(/* Object */ ctx, /* Boolean */ apply){
			// summary:
			//		render stroke for the shape
			// ctx:
			//		a canvas context object
			// apply:
			//		whether ctx.stroke() shall be called
			if(this.strokeStyle && ctx.pickingMode){
				var c = this.strokeStyle.color;
				try{
					this.strokeStyle.color = new Color(ctx.strokeStyle);
					this.inherited(arguments);
				}finally{
					this.strokeStyle.color = c;
				}
			}else{
				this.inherited(arguments);				
			}
		},
		
		// events
		
		getEventSource: function(){
			// summary:
			//		returns this gfx shape event source, which is the surface rawnode in the case of canvas.
			return this.surface.getEventSource();
		},		
		connect: function(name, object, method){
			// summary:
			//		connects a handler to an event on this shape
			
			// mouse events *must* start with "on" but touch events *must not* start with on
			if(name.indexOf("mouse") === 0){
				name = "on" + name;
			}else if(name.indexOf("ontouch") === 0){
				name = name.slice(2);
			}
			
			this.surface._setupEvents(name); // setup events on demand
			// No need to fix callback. The listeners registered by
			// '_setupEvents()' are always invoked first and they
			// already 'fix' the event
			return arguments.length > 2 ? // Object
					 hub.connect(this, name, object, method) : hub.connect(this, name, object);
		},
		disconnect: function(token){
			// summary:
			//		disconnects an event handler
			hub.disconnect(token);
		},
		
		// connect hook
		
		oncontextmenu:  function(){},
		onclick:        function(){},
		ondblclick:     function(){},
		onmouseenter:   function(){},
		onmouseleave:   function(){},
		onmouseout:     function(){},
		onmousedown:    function(){},
		ontouchstart:   function(){},
		touchstart:     function(){},
		onmouseup:      function(){},
		ontouchend:     function(){},
		touchend:       function(){},
		onmouseover:    function(){},
		onmousemove:    function(){},
		ontouchmove:    function(){},
		touchmove:      function(){},
		onkeydown:      function(){},
		onkeyup:        function(){}
	});

	canvasWithEvents.Group = declare("dojox.gfx.canvasWithEvents.Group", [canvasWithEvents.Shape, canvas.Group], {
		_testInputs: function(/*Object*/ctx, /*Array*/ pos){
			var children = this.children, t = this.getTransform(), i, j, input;
			if(children.length === 0){
				return;
			}
			var posbk = [];
			for(i = 0; i < pos.length; ++i){
				input = pos[i];
				// backup position before transform applied
				posbk[i] = {
					x: input.x,
					y: input.y
				};
				if(input.target) continue;
				var x = input.x, y = input.y;
				var p = t ? m.multiplyPoint(m.invert(t), x, y) : {
					x: x,
					y: y
				};
				input.x = p.x;
				input.y = p.y;
			}
			for(i = children.length - 1; i >= 0; --i){
				children[i]._testInputs(ctx, pos);
				// does it need more hit tests ?
				var allFound = true;
				for(j = 0; j < pos.length; ++j){
					if(pos[j].target == null){
						allFound = false;
						break;
					}
				}
				if(allFound){
					break;
				}
			}
			if(this.clip){
				// filter positive hittests against the group clipping area
				for(i = 0; i < pos.length; ++i){
					input = pos[i];
					input.x = posbk[i].x;
					input.y = posbk[i].y;
					if(input.target){
						ctx.clearRect(0,0,1,1);
						ctx.save();
						ctx.translate(-input.x, -input.y);
						this._render(ctx, true);
						if(!ctx.getImageData(0, 0, 1, 1).data[0]){
							input.target = null;
						}
						ctx.restore();
					}
				}
			}else{
				for(i = 0; i < pos.length; ++i){
					pos[i].x = posbk[i].x;
					pos[i].y = posbk[i].y;
				}	
			}
		}	
	});

	canvasWithEvents.Image = declare("dojox.gfx.canvasWithEvents.Image", [canvasWithEvents.Shape, canvas.Image], {
		_renderShape: function(/* Object */ ctx){
			// summary:
			//		render image
			// ctx:
			//		a canvas context object
			var s = this.shape;
			if(ctx.pickingMode){
				ctx.fillRect(s.x, s.y, s.width, s.height);
			}else{
				this.inherited(arguments);
			}
		},		
		_hitTestGeometry: function(ctx, x, y){
			// TODO: improve hit testing to take into account transparency
			var s = this.shape;
			return x >= s.x && x <= s.x + s.width && y >= s.y && y <= s.y + s.height ? this : null;
		}
	});

	canvasWithEvents.Text = declare("dojox.gfx.canvasWithEvents.Text", [canvasWithEvents.Shape, canvas.Text], {
		_testInputs: function(ctx, pos){
			return this._hitTestPixel(ctx, pos);
		}
	});

	canvasWithEvents.Rect = declare("dojox.gfx.canvasWithEvents.Rect", [canvasWithEvents.Shape, canvas.Rect], {});
	canvasWithEvents.Circle = declare("dojox.gfx.canvasWithEvents.Circle", [canvasWithEvents.Shape, canvas.Circle], {});
	canvasWithEvents.Ellipse = declare("dojox.gfx.canvasWithEvents.Ellipse", [canvasWithEvents.Shape, canvas.Ellipse],{});
	canvasWithEvents.Line = declare("dojox.gfx.canvasWithEvents.Line", [canvasWithEvents.Shape, canvas.Line],{});
	canvasWithEvents.Polyline = declare("dojox.gfx.canvasWithEvents.Polyline", [canvasWithEvents.Shape, canvas.Polyline],{});
	canvasWithEvents.Path = declare("dojox.gfx.canvasWithEvents.Path", [canvasWithEvents.Shape, canvas.Path],{});
	canvasWithEvents.TextPath = declare("dojox.gfx.canvasWithEvents.TextPath", [canvasWithEvents.Shape, canvas.TextPath],{});

	
	// a map that redirects shape-specific events to the canvas event handler that deals with these events
	var _eventsRedirectMap = {
		onmouseenter : 'onmousemove',
		onmouseleave : 'onmousemove',
		onmouseout   : 'onmousemove',
		onmouseover  : 'onmousemove',
		touchstart   : 'ontouchstart',
		touchend     : 'ontouchend',
		touchmove    : 'ontouchmove'
	};
	var _eventsShortNameMap = {
		ontouchstart   : 'touchstart',
		ontouchend     : 'touchend',
		ontouchmove    : 'touchmove'
	};
	
	var uagent = navigator.userAgent.toLowerCase(),
		isiOS = uagent.search('iphone') > -1 || 
			    uagent.search('ipad') > -1 || 
				uagent.search('ipod') > -1;

	canvasWithEvents.Surface = declare("dojox.gfx.canvasWithEvents.Surface", canvas.Surface, {
		constructor:function(){
			this._pick = { curr: null, last: null };
			this._pickOfMouseDown = null;
			this._pickOfMouseUp = null;
		},
		
		connect: function(/*String*/name, /*Object*/object, /*Function|String*/method){
			// summary:
			//		connects a handler to an event on this surface
			// name: String
			//		The event name
			// object: Object
			//		The object that method will receive as "this".
			// method: Function
			//		A function reference, or name of a function in context.
			 
			if(name.indexOf('touch') !== -1){
				// in case of surface.connect('touchXXX'...), we must root the handler to the
				// specific touch event processing (done in fireTouchEvents) so that the event is properly configured.
				// So, we activate the shape-level event processing calling _setupEvents,
				// and connect to the _ontouchXXXImpl_ hooks that are called back by invokeHandler() 
				this._setupEvents(name);
				name = "_on" + name + "Impl_";
				return hub.connect(this, name, object, method);
			}else{
				this._initMirrorCanvas();
				return hub.connect(this.getEventSource(), name, null,
							shapeLib.fixCallback(this, g.fixTarget, object, method));
			}	
		},

		// connection hooks for touch events connect
		_ontouchstartImpl_: function(){},
		_ontouchendImpl_:   function(){},
		_ontouchmoveImpl_:  function(){},
		
		_initMirrorCanvas: function(){
			if(!this.mirrorCanvas){
				var p = this._parent, mirror = p.ownerDocument.createElement("canvas");
				mirror.width = 1;
				mirror.height = 1;
				mirror.style.position = 'absolute';
				mirror.style.left = '-99999px';
				mirror.style.top = '-99999px';
				p.appendChild(mirror);
				this.mirrorCanvas = mirror;
			}
		},

		_setupEvents: function(eventName){
			// summary:
			//		setup event listeners if not yet

			// onmouseenter and onmouseleave shape events are handled in the onmousemove surface handler
			if(eventName in _eventsRedirectMap){
				eventName = _eventsRedirectMap[eventName];
			}
			if(this._eventsH && this._eventsH[eventName]){
				// the required listener has already been connected
				return;
			}
			// a mirror canvas for shape picking
			this._initMirrorCanvas();
			if(!this._eventsH){
				this._eventsH = {};
			}
			// register event hooks if not done yet
			this._eventsH[eventName] = hub.connect(this.getEventSource(), eventName,
					shapeLib.fixCallback(this, g.fixTarget, this, "_" + eventName));
			if(eventName === 'onclick' || eventName==='ondblclick'){
				if(!this._eventsH['onmousedown']){
					this._eventsH['onmousedown'] = hub.connect(this.getEventSource(),
							'onmousedown', shapeLib.fixCallback(this, g.fixTarget, this, "_onmousedown"));
				}
			 	if(!this._eventsH['onmouseup']){
					this._eventsH['onmouseup'] = hub.connect(this.getEventSource(),
							'onmouseup', shapeLib.fixCallback(this, g.fixTarget, this, "_onmouseup"));
				}
			}
		},
		
		destroy: function(){
			// summary:
			//		stops the move, deletes all references, so the object can be garbage-collected
			this.inherited(arguments);
			// destroy events and objects
			for(var i in this._eventsH){
				hub.disconnect(this._eventsH[i]);
			}
			this._eventsH = this.mirrorCanvas = null;
		},	
		
		// events
		getEventSource: function(){
			// summary:
			//		returns the canvas DOM node for surface-level events
			return this.rawNode;
		},

		// internal handlers used to implement shape-level event notification
		_invokeHandler: function(base, method, event){
			// Invokes handler function
			var handler = base[method];
			if(handler && handler.after){
				handler.apply(base, [event]);
			}else if (method in _eventsShortNameMap){
				// there may be a synonym event name (touchstart -> ontouchstart)
				handler = base[_eventsShortNameMap[method]];
				if(handler && handler.after){
					handler.apply(base, [event]);
				}
			}
			if(!handler && method.indexOf('touch') !== -1){
				// special case for surface touch handlers
				method = "_" + method + "Impl_";
				handler = base[method];
				if(handler){
					handler.apply(base, [event]);
				}
			}
			// Propagates event up in the DOM hierarchy only if event
			// has not been stopped (event.cancelBubble is true)
			if(!isEventStopped(event) && base.parent){
				this._invokeHandler(base.parent, method, event);
			}
		},
		_oncontextmenu: function(e){
			// summary:
			//		triggers onclick
			
			// this._pick.curr = an array of target for touch event, one target instance for mouse events
			if(this._pick.curr){
				this._invokeHandler(this._pick.curr, 'oncontextmenu', e);
			}
		},
		_ondblclick: function(e){
			// summary:
			//		triggers onclick
			
			// this._pick.curr = an array of target for touch event, one target instance for mouse events
			if(this._pickOfMouseUp){
				this._invokeHandler(this._pickOfMouseUp, 'ondblclick', e);
			}
		},
		_onclick: function(e){
			// summary:
			//		triggers onclick
			
			// this._pick.curr = an array of target for touch event, one target instance for mouse events
			if(this._pickOfMouseUp && this._pickOfMouseUp == this._pickOfMouseDown){
				this._invokeHandler(this._pickOfMouseUp, 'onclick', e);
			}
		},
		_onmousedown: function(e){
			// summary:
			//		triggers onmousedown
			this._pickOfMouseDown = this._pick.curr;
			// this._pick.curr = an array of target for touch event, one target instance for mouse events
			if(this._pick.curr){
				this._invokeHandler(this._pick.curr, 'onmousedown', e);
			}
		},
		_ontouchstart: function(e){
			// summary:
			//		triggers ontouchstart
			
			// this._pick.curr = an array of target for touch event, one target instance for mouse events
			if(this._pick.curr) {
				this._fireTouchEvent(e);
			}			
		},
		_onmouseup: function(e){
			// summary:
			//		triggers onmouseup
			
			// this._pick.curr = an array of target for touch event, one target instance for mouse events
			this._pickOfMouseUp = this._pick.curr;
			if(this._pick.curr){
				this._invokeHandler(this._pick.curr, 'onmouseup', e);
			}
		},
		_ontouchend: function(e){
			// summary:
			//		triggers ontouchend
			
			// this._pick.curr = an array of target for touch event, one target instance for mouse events
			if(this._pick.curr){
				for(var i = 0; i < this._pick.curr.length; ++i){
					if(this._pick.curr[i].target){
						e.gfxTarget = this._pick.curr[i].target;
						this._invokeHandler(this._pick.curr[i].target, 'ontouchend', e);
					}
				}
			}
		},
		_onmousemove: function(e){
			// summary:
			//		triggers onmousemove, onmouseenter, onmouseleave
			
			// this._pick.curr = an array of target for touch event, one target instance for mouse events
			if(this._pick.last && this._pick.last != this._pick.curr){
				this._invokeHandler(this._pick.last, 'onmouseleave', e);
				this._invokeHandler(this._pick.last, 'onmouseout', e);
			}
			if(this._pick.curr){
				if(this._pick.last == this._pick.curr){
					this._invokeHandler(this._pick.curr, 'onmousemove', e);
				}else{
					this._invokeHandler(this._pick.curr, 'onmouseenter', e);
					this._invokeHandler(this._pick.curr, 'onmouseover', e);
				}
			}
		},
		_ontouchmove: function(e){
			// summary:
			//		triggers ontouchmove
			if(this._pick.curr){
				this._fireTouchEvent(e);
			}
		},
		
		_fireTouchEvent: function(e){
			// this._pick.curr = an array of target for touch event, one target instance for mouse events
			var toFire = []; // the per-shape events list to fire
			// for each positive picking:
			// .group all pickings by target
			// .collect all touches for the picking target 
			for(var i = 0; i < this._pick.curr.length; ++i){
				var pick = this._pick.curr[i];
				if(pick.target){
					// touches for this target
					var gfxtt = pick.target.__gfxtt;
					if(!gfxtt){
						gfxtt = [];
						pick.target.__gfxtt = gfxtt;
					}
					// store the touch that yielded to this picking
					gfxtt.push(pick.t);
					// if the target has not been added yet, add it
					if(!pick.target.__inToFire){
						toFire.push(pick.target);
						pick.target.__inToFire=true;
					}
				}
			}
			if(toFire.length === 0){
				// no target, invokes the surface handler
				this._invokeHandler(this, 'on' + e.type, e);
			}else{
				for(i = 0; i < toFire.length; ++i){
					(function(){
						var targetTouches = toFire[i].__gfxtt;
						// fires the original event BUT with our own targetTouches array.
						// Note for iOS:
						var evt = lang.delegate(e, {gfxTarget: toFire[i]});
						if(isiOS){
							// must use the original preventDefault function or iOS will throw a TypeError
							evt.preventDefault = function(){e.preventDefault();};
							evt.stopPropagation = function(){e.stopPropagation();};
						}
						// override targetTouches with the filtered one
						evt.__defineGetter__('targetTouches', function(){return targetTouches;});
						// clean up
						delete toFire[i].__gfxtt;
						delete toFire[i].__inToFire;
						// fire event
						this._invokeHandler(toFire[i], 'on' + e.type, evt);
					}).call(this);
				}
			}
		},
		_onkeydown: function(){},	// needed?
		_onkeyup:   function(){},	// needed?

		_whatsUnderEvent: function(evt){
			// summary:
			//		returns the shape under the mouse event
			// evt:
			//		mouse event
			
			var surface = this, i,
				pos = domGeom.position(surface.rawNode, true),
				inputs = [], changedTouches = evt.changedTouches, touches = evt.touches;
			// collect input events targets
			if(changedTouches){
				for(i = 0; i < changedTouches.length; ++i){
					inputs.push({
						t: changedTouches[i],
						x: changedTouches[i].pageX - pos.x,
						y: changedTouches[i].pageY - pos.y
					});
				}
			}else if(touches){
				for(i = 0; i < touches.length; ++i){
					inputs.push({
						t: touches[i],
						x: touches[i].pageX - pos.x,
						y: touches[i].pageY - pos.y
					});
				}
			}else{
				inputs.push({
					x : evt.pageX - pos.x,
					y : evt.pageY - pos.y
				});
			} 
				
			var mirror = surface.mirrorCanvas,
				ctx = mirror.getContext('2d'),
				children = surface.children;
			
			ctx.clearRect(0, 0, mirror.width, mirror.height);
			ctx.save();
			ctx.strokeStyle = "rgba(127,127,127,1.0)";
			ctx.fillStyle = "rgba(127,127,127,1.0)";
			ctx.pickingMode = true;
			var pick = null;
			// process the inputs to find the target.
			for(i = children.length-1; i >= 0; i--){
				children[i]._testInputs(ctx, inputs);
				// does it need more hit tests ?
				var allFound = true;
				for(j = 0; j < inputs.length; ++j){
					if(inputs[j].target == null){
						allFound = false;
						break;
					}
				}
				if(allFound){
					break;
				}
			}
			ctx.restore();
			// touch event handlers expect an array of target, mouse handlers one target
			return (touches || changedTouches) ? inputs : inputs[0].target;
		}		
	});
	
	canvasWithEvents.createSurface = function(parentNode, width, height){
		// summary:
		//		creates a surface (Canvas)
		// parentNode: Node
		//		a parent node
		// width: String
		//		width of surface, e.g., "100px"
		// height: String
		//		height of surface, e.g., "100px"

		if(!width && !height){
			var pos = domGeom.position(parentNode);
			width  = width  || pos.w;
			height = height || pos.h;
		}
		if(typeof width == "number"){
			width = width + "px";
		}
		if(typeof height == "number"){
			height = height + "px";
		}

		var s = new canvasWithEvents.Surface(),
			p = dom.byId(parentNode),
			c = p.ownerDocument.createElement("canvas");

		c.width  = g.normalizedLength(width);	// in pixels
		c.height = g.normalizedLength(height);	// in pixels

		p.appendChild(c);
		s.rawNode = c;
		s._parent = p;
		s.surface = s;
		return s;	// dojox/gfx.Surface
	};


	// Mouse/Touch event
	var isEventStopped = function(/*Event*/ evt){
		// summary:
		//		queries whether an event has been stopped or not
		// evt: Event
		//		The event object.
		if(evt.cancelBubble !== undefined){
			return evt.cancelBubble;
		}
		return false;
	};
	
	canvasWithEvents.fixTarget = function(event, gfxElement){
		// summary:
		//		Adds the gfxElement to event.gfxTarget if none exists. This new
		//		property will carry the GFX element associated with this event.
		// event: Object 
		//		The current input event (MouseEvent or TouchEvent)
		// gfxElement: Object
		//		The GFX target element (a Surface in this case)
		if(isEventStopped(event)){
			return false;
		}
		if(!event.gfxTarget){
			gfxElement._pick.last = gfxElement._pick.curr;
			gfxElement._pick.curr = gfxElement._whatsUnderEvent(event);
			if(!lang.isArray(gfxElement._pick.curr)){
				event.gfxTarget = gfxElement._pick.curr;
			}
		}
		return true;
	};

	return canvasWithEvents;
});

},
'dojox/xml/DomParser':function(){
define("dojox/xml/DomParser", [
	"dojo/_base/kernel",// dojo.getObject
	"dojo/_base/array"	// dojo.forEach
], function(dojo){
dojo.getObject("xml", true, dojox);

dojox.xml.DomParser=new (function(){
	/**********************************************************
	 *	The DomParser is a close-to (but not entirely)
	 *	conforming XML parser based on regular
	 *	expressions.  It will take any XML fragment
	 *	and return a lightweight JS structure that is
	 *	similar to (but not exactly) the DOM specification.
	 *
	 *	Getter and setter methods are NOT available; the goal
	 *	was to keep the resulting object model entirely JS-like.
	 *
	 *	All node types but document fragments are supported;
	 *	all nodes support getElementsByTagName and
	 *	getElementsByTagNameNS (with short names byName and
	 *	byNameNS).  The document node supports getElementById
	 *	(byId), and all nodes support a supplimental
	 *	childrenByName/childrenByNameNS method as well.
	 *
	 *	The object model is intended to be a READONLY format;
	 *	mutation events are NOT supported, and though you
	 *	can change properties on a node-by-node basis, certain
	 *	operations are not supported (such as changing the ID
	 *	of an element).
	 **********************************************************/

	//	internal use only.
	var nodeTypes={ ELEMENT:1, ATTRIBUTE:2, TEXT:3, CDATA_SECTION:4, PROCESSING_INSTRUCTION:7, COMMENT:8, DOCUMENT:9 };

	//	compile the regular expressions once.
	var reTags=/<([^>\/\s+]*)([^>]*)>([^<]*)/g;
	var reAttr=/([^=]*)=(("([^"]*)")|('([^']*)'))/g;	//	patch from tdedischew AT gmail, with additional grouping
	var reEntity=/<!ENTITY\s+([^"]*)\s+"([^"]*)">/g;
	var reCData=/<!\[CDATA\[([\u0001-\uFFFF]*?)\]\]>/g;
	var reComments=/<!--([\u0001-\uFFFF]*?)-->/g;
	var trim=/^\s+|\s+$/g;
	var normalize=/\s+/g;
	var egt=/\&gt;/g;
	var elt=/\&lt;/g;
	var equot=/\&quot;/g;
	var eapos=/\&apos;/g;
	var eamp=/\&amp;/g;
	var dNs="_def_";

	//	create a root node.
	function _doc(){
		return new (function(){
			var all={};
			this.nodeType=nodeTypes.DOCUMENT;
			this.nodeName="#document";
			this.namespaces={};
			this._nsPaths={};
			this.childNodes=[];
			this.documentElement=null;

			//	any element with an ID attribute will be added to the internal hashtable.
			this._add=function(obj){
				if(typeof(obj.id)!="undefined"){ all[obj.id]=obj; }
			};
			this._remove=function(id){
				if(all[id]){ delete all[id]; }
			};

			this.byId=this.getElementById=function(id){ return all[id]; };
			this.byName=this.getElementsByTagName=byName;
			this.byNameNS=this.getElementsByTagNameNS=byNameNS;
			this.childrenByName=childrenByName;
			this.childrenByNameNS=childrenByNameNS;
		})();
	}

	//	functions attached to element nodes
	function byName(name){
		//	return all descendants with name.  Fully qualified (i.e. svg:svg)
		function __(node, name, arr){
			dojo.forEach(node.childNodes, function(c){
				if(c.nodeType==nodeTypes.ELEMENT){
					if(name=="*"){ arr.push(c); }
					else if(c.nodeName==name){ arr.push(c); }
					__(c, name, arr);
				}
			});
		}
		var a=[];
		__(this, name, a);
		return a;
	}
	function byNameNS(name, ns){
		//	return all descendants with name by namespace.  If no namespace passed, the default is used.
		function __(node, name, ns, arr){
			dojo.forEach(node.childNodes, function(c){
				if(c.nodeType==nodeTypes.ELEMENT){
					if(name=="*"&&c.ownerDocument._nsPaths[ns]==c.namespace){ arr.push(c); }
					else if(c.localName==name&&c.ownerDocument._nsPaths[ns]==c.namespace){ arr.push(c); }
					__(c, name, ns, arr);
				}
			});
		}
		if(!ns){ ns=dNs; }
		var a=[];
		__(this, name, ns, a);
		return a;
	}
	//	Only child nodes with name.
	function childrenByName(name){
		var a=[];
		dojo.forEach(this.childNodes, function(c){
			if(c.nodeType==nodeTypes.ELEMENT){
				if(name=="*"){ a.push(c); }
				else if(c.nodeName==name){ a.push(c); }
			}
		});
		return a;
	}

	function childrenByNameNS(name, ns){
		var a=[];
		dojo.forEach(this.childNodes, function(c){
			if(c.nodeType==nodeTypes.ELEMENT){
				if(name=="*"&&c.ownerDocument._nsPaths[ns]==c.namespace){ a.push(c); }
				else if(c.localName==name&&c.ownerDocument._nsPaths[ns]==c.namespace){ a.push(c); }
			}
		});
		return a;
	}

	function _createTextNode(v){
		return {
			nodeType:nodeTypes.TEXT,
			nodeName:"#text",
			nodeValue:v.replace(normalize," ").replace(egt,">").replace(elt,"<").replace(eapos,"'").replace(equot,'"').replace(eamp,"&")
		};
	}

	//	attribute functions
	function getAttr(name){
		for(var i=0; i<this.attributes.length; i++){
			if(this.attributes[i].nodeName==name){
				return this.attributes[i].nodeValue;
			}
		}
		return null;
	}
	function getAttrNS(name, ns){
		for(var i=0; i<this.attributes.length; i++){
			if(this.ownerDocument._nsPaths[ns]==this.attributes[i].namespace
				&&this.attributes[i].localName==name
			){
				return this.attributes[i].nodeValue;
			}
		}
		return null;
	}
	//	note that you can only swap IDs using setAttribute, NOT with setAttributeNS.
	function setAttr(name, val){
		var old=null;
		for(var i=0; i<this.attributes.length; i++){
			if(this.attributes[i].nodeName==name){
				old=this.attributes[i].nodeValue;
				this.attributes[i].nodeValue=val;
				break;
			}
		}
		if(name=="id"){
			if(old!=null){ this.ownerDocument._remove(old); }
			this.ownerDocument._add(this);
		}
	}
	function setAttrNS(name, val, ns){
		for(var i=0; i<this.attributes.length; i++){
			if(this.ownerDocument._nsPaths[ns]==this.attributes[i].namespace
				&&this.attributes[i].localName==name
			){
				this.attributes[i].nodeValue=val;
				return;
			}
		}
	}

	//	navigation
	function prev(){
		var p=this.parentNode;
		if(p){
			for(var i=0;i<p.childNodes.length;i++){
				if(p.childNodes[i]==this&&i>0){
					return p.childNodes[i-1];
				}
			}
		}
		return null;
	}
	function next(){
		var p=this.parentNode;
		if(p){
			for(var i=0;i<p.childNodes.length;i++){
				if(p.childNodes[i]==this&&(i+1)<p.childNodes.length){
					return p.childNodes[i+1];
				}
			}
		}
		return null;
	}

	//	the main method.
	this.parse=function(/* String */str){
		var root=_doc();
		if(str==null){ return root; }
		if(str.length==0){ return root; }

		//	preprocess custom entities
		if(str.indexOf("<!ENTITY")>0){
			var entity, eRe=[];
			if(reEntity.test(str)){
				reEntity.lastIndex=0;
				//	match entities
				while((entity=reEntity.exec(str))!=null){
					eRe.push({
						entity:"&"+entity[1].replace(trim,"")+";",
						expression:entity[2]
					});
				}
				//	replace instances in the document.
				for(var i=0; i<eRe.length; i++){
					str=str.replace(new RegExp(eRe[i].entity, "g"), eRe[i].expression);
				}
			}
		}

		//	pre-parse for CData, and tokenize.
		var cdSections=[], cdata;
		while((cdata=reCData.exec(str))!=null){ cdSections.push(cdata[1]); }
		for(var i=0; i<cdSections.length; i++){ str=str.replace(cdSections[i], i); }
		
		//	pre-parse for comments, and tokenize.
		var comments=[], comment;
		while((comment=reComments.exec(str))!=null){ comments.push(comment[1]); }
		for(i=0; i<comments.length; i++){ str=str.replace(comments[i], i); }

		//	parse the document
		var res, obj=root;
		while((res=reTags.exec(str))!=null){
			//	closing tags.
			if(res[2].charAt(0)=="/" && res[2].replace(trim, "").length>1){
				if(obj.parentNode){
					obj=obj.parentNode;
				}
				var text=(res[3]||"").replace(trim, "");
				if(text.length>0) {
					obj.childNodes.push(_createTextNode(text));
				}
			}

			//	open tags.
			else if(res[1].length>0){
				//	figure out the type of node.
				if(res[1].charAt(0)=="?"){
					//	processing instruction
					var name=res[1].substr(1);
					var target=res[2].substr(0,res[2].length-2);
					obj.childNodes.push({
						nodeType:nodeTypes.PROCESSING_INSTRUCTION,
						nodeName:name,
						nodeValue:target
					});
				}
				else if(res[1].charAt(0)=="!"){
					//	CDATA; skip over any declaration elements.
					if(res[1].indexOf("![CDATA[")==0){
						var val=parseInt(res[1].replace("![CDATA[","").replace("]]",""));
						obj.childNodes.push({
							nodeType:nodeTypes.CDATA_SECTION,
							nodeName:"#cdata-section",
							nodeValue:cdSections[val]
						});
					}
					//	Comments.
					else if(res[1].substr(0,3)=="!--"){
						var val=parseInt(res[1].replace("!--","").replace("--",""));
						obj.childNodes.push({
							nodeType:nodeTypes.COMMENT,
							nodeName:"#comment",
							nodeValue:comments[val]
						});
					}
				}
				else {
					//	Elements (with attribute and text)
					var name=res[1].replace(trim,"");
					var o={
						nodeType:nodeTypes.ELEMENT,
						nodeName:name,
						localName:name,
						namespace:dNs,
						ownerDocument:root,
						attributes:[],
						parentNode:null,
						childNodes:[]
					};

					//	check to see if it's namespaced.
					if(name.indexOf(":")>-1){
						var t=name.split(":");
						o.namespace=t[0];
						o.localName=t[1];
					}

					//	set the function references.
					o.byName=o.getElementsByTagName=byName;
					o.byNameNS=o.getElementsByTagNameNS=byNameNS;
					o.childrenByName=childrenByName;
					o.childrenByNameNS=childrenByNameNS;
					o.getAttribute=getAttr;
					o.getAttributeNS=getAttrNS;
					o.setAttribute=setAttr;
					o.setAttributeNS=setAttrNS;
					o.previous=o.previousSibling=prev;
					o.next=o.nextSibling=next;

					//	parse the attribute string.
					var attr;
					while((attr=reAttr.exec(res[2]))!=null){
						if(attr.length>0){
							var name=attr[1].replace(trim,"");
							var val=(attr[4]||attr[6]||"").replace(normalize," ")
								.replace(egt,">")
								.replace(elt,"<")
								.replace(eapos,"'")
								.replace(equot,'"')
								.replace(eamp,"&");
							if(name.indexOf("xmlns")==0){
								if(name.indexOf(":")>0){
									var ns=name.split(":");
									root.namespaces[ns[1]]=val;
									root._nsPaths[val]=ns[1];
								} else {
									root.namespaces[dNs]=val;
									root._nsPaths[val]=dNs;
								}
							} else {
								var ln=name;
								var ns=dNs;
								if(name.indexOf(":")>0){
									var t=name.split(":");
									ln=t[1];
									ns=t[0];
								}
								o.attributes.push({
									nodeType:nodeTypes.ATTRIBUTE,
									nodeName:name,
									localName:ln,
									namespace:ns,
									nodeValue:val
								});

								//	only add id as a property.
								if(ln=="id"){ o.id=val; }
							}
						}
					}
					root._add(o);

					if(obj){
						obj.childNodes.push(o);
						o.parentNode=obj;
						//	if it's not a self-closing node.
						if(res[2].charAt(res[2].length-1)!="/"){
							obj=o;
						}
					}
					var text=res[3];
					if(text.length>0){
						obj.childNodes.push(_createTextNode(text));
					}
				}
			}
		}

		//	set the document element
		for(var i=0; i<root.childNodes.length; i++){
			var e=root.childNodes[i];
			if(e.nodeType==nodeTypes.ELEMENT){
				root.documentElement=e;
				break;
			}
		}
		return root;
	};
})();
return dojox.xml.DomParser;
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
'dojox/gfx/renderer':function(){
define("dojox/gfx/renderer", ["./_base","dojo/_base/lang", "dojo/_base/sniff", "dojo/_base/window", "dojo/_base/config"],
  function(g, lang, has, win, config){
  //>> noBuildResolver
	var currentRenderer = null;
	return {
		// summary:
		//		This module is an AMD loader plugin that loads the appropriate graphics renderer
		//		implementation based on detected environment and current configuration settings.
		
		load: function(id, require, load){
			// tags:
			//      private
			if(currentRenderer && id != "force"){
				load(currentRenderer);
				return;
			}
			var renderer = config.forceGfxRenderer,
				renderers = !renderer && (lang.isString(config.gfxRenderer) ?
					config.gfxRenderer : "svg,vml,canvas,silverlight").split(","),
				silverlightObject, silverlightFlag;

			while(!renderer && renderers.length){
				switch(renderers.shift()){
					case "svg":
						// the next test is from https://github.com/phiggins42/has.js
						if("SVGAngle" in win.global){
							renderer = "svg";
						}
						break;
					case "vml":
						if(has("ie")){
							renderer = "vml";
						}
						break;
					case "silverlight":
						try{
							if(has("ie")){
								silverlightObject = new ActiveXObject("AgControl.AgControl");
								if(silverlightObject && silverlightObject.IsVersionSupported("1.0")){
									silverlightFlag = true;
								}
							}else{
								if(navigator.plugins["Silverlight Plug-In"]){
									silverlightFlag = true;
								}
							}
						}catch(e){
							silverlightFlag = false;
						}finally{
							silverlightObject = null;
						}
						if(silverlightFlag){
							renderer = "silverlight";
						}
						break;
					case "canvas":
						if(win.global.CanvasRenderingContext2D){
							renderer = "canvas";
						}
						break;
				}
			}

			if (renderer === 'canvas' && config.canvasEvents !== false) {
				renderer = "canvasWithEvents";
			}

			if(config.isDebug){
				console.log("gfx renderer = " + renderer);
			}

			function loadRenderer(){
				require(["dojox/gfx/" + renderer], function(module){
					g.renderer = renderer;
					// memorize the renderer module
					currentRenderer = module;
					// now load it
					load(module);
				});
			}
			if(renderer == "svg" && typeof window.svgweb != "undefined"){
				window.svgweb.addOnLoad(loadRenderer);
			}else{
				loadRenderer();
			}
		}
	};
});

},
'dojox/gfx/matrix':function(){
define("dojox/gfx/matrix", ["./_base","dojo/_base/lang"], 
  function(g, lang){
	var m = g.matrix = {};

	// candidates for dojox.math:
	var _degToRadCache = {};
	m._degToRad = function(degree){
		return _degToRadCache[degree] || (_degToRadCache[degree] = (Math.PI * degree / 180));
	};
	m._radToDeg = function(radian){ return radian / Math.PI * 180; };

	m.Matrix2D = function(arg){
		// summary:
		//		a 2D matrix object
		// description:
		//		Normalizes a 2D matrix-like object. If arrays is passed,
		//		all objects of the array are normalized and multiplied sequentially.
		// arg: Object
		//		a 2D matrix-like object, a number, or an array of such objects
		if(arg){
			if(typeof arg == "number"){
				this.xx = this.yy = arg;
			}else if(arg instanceof Array){
				if(arg.length > 0){
					var matrix = m.normalize(arg[0]);
					// combine matrices
					for(var i = 1; i < arg.length; ++i){
						var l = matrix, r = m.normalize(arg[i]);
						matrix = new m.Matrix2D();
						matrix.xx = l.xx * r.xx + l.xy * r.yx;
						matrix.xy = l.xx * r.xy + l.xy * r.yy;
						matrix.yx = l.yx * r.xx + l.yy * r.yx;
						matrix.yy = l.yx * r.xy + l.yy * r.yy;
						matrix.dx = l.xx * r.dx + l.xy * r.dy + l.dx;
						matrix.dy = l.yx * r.dx + l.yy * r.dy + l.dy;
					}
					lang.mixin(this, matrix);
				}
			}else{
				lang.mixin(this, arg);
			}
		}
	};

	// the default (identity) matrix, which is used to fill in missing values
	lang.extend(m.Matrix2D, {xx: 1, xy: 0, yx: 0, yy: 1, dx: 0, dy: 0});

	lang.mixin(m, {
		// summary:
		//		class constants, and methods of dojox/gfx/matrix

		// matrix constants

		// identity: dojox/gfx/matrix.Matrix2D
		//		an identity matrix constant: identity * (x, y) == (x, y)
		identity: new m.Matrix2D(),

		// flipX: dojox/gfx/matrix.Matrix2D
		//		a matrix, which reflects points at x = 0 line: flipX * (x, y) == (-x, y)
		flipX:    new m.Matrix2D({xx: -1}),

		// flipY: dojox/gfx/matrix.Matrix2D
		//		a matrix, which reflects points at y = 0 line: flipY * (x, y) == (x, -y)
		flipY:    new m.Matrix2D({yy: -1}),

		// flipXY: dojox/gfx/matrix.Matrix2D
		//		a matrix, which reflects points at the origin of coordinates: flipXY * (x, y) == (-x, -y)
		flipXY:   new m.Matrix2D({xx: -1, yy: -1}),

		// matrix creators

		translate: function(a, b){
			// summary:
			//		forms a translation matrix
			// description:
			//		The resulting matrix is used to translate (move) points by specified offsets.
			// a: Number|dojox/gfx.Point
			//		an x coordinate value, or a point-like object, which specifies offsets for both dimensions
			// b: Number?
			//		a y coordinate value
			// returns: dojox/gfx/matrix.Matrix2D
			if(arguments.length > 1){
				return new m.Matrix2D({dx: a, dy: b}); // dojox/gfx/matrix.Matrix2D
			}
			// branch
			return new m.Matrix2D({dx: a.x, dy: a.y}); // dojox/gfx/matrix.Matrix2D
		},
		scale: function(a, b){
			// summary:
			//		forms a scaling matrix
			// description:
			//		The resulting matrix is used to scale (magnify) points by specified offsets.
			// a: Number|dojox/gfx.Point
			//		a scaling factor used for the x coordinate, or
			//		a uniform scaling factor used for the both coordinates, or
			//		a point-like object, which specifies scale factors for both dimensions
			// b: Number?
			//		a scaling factor used for the y coordinate
			// returns: dojox/gfx/matrix.Matrix2D
			if(arguments.length > 1){
				return new m.Matrix2D({xx: a, yy: b}); // dojox/gfx/matrix.Matrix2D
			}
			if(typeof a == "number"){
				return new m.Matrix2D({xx: a, yy: a}); // dojox/gfx/matrix.Matrix2D
			}
			return new m.Matrix2D({xx: a.x, yy: a.y}); // dojox/gfx/matrix.Matrix2D
		},
		rotate: function(angle){
			// summary:
			//		forms a rotating matrix
			// description:
			//		The resulting matrix is used to rotate points
			//		around the origin of coordinates (0, 0) by specified angle.
			// angle: Number
			//		an angle of rotation in radians (>0 for CW)
			// returns: dojox/gfx/matrix.Matrix2D
			var c = Math.cos(angle);
			var s = Math.sin(angle);
			return new m.Matrix2D({xx: c, xy: -s, yx: s, yy: c}); // dojox/gfx/matrix.Matrix2D
		},
		rotateg: function(degree){
			// summary:
			//		forms a rotating matrix
			// description:
			//		The resulting matrix is used to rotate points
			//		around the origin of coordinates (0, 0) by specified degree.
			//		See dojox/gfx/matrix.rotate() for comparison.
			// degree: Number
			//		an angle of rotation in degrees (>0 for CW)
			// returns: dojox/gfx/matrix.Matrix2D
			return m.rotate(m._degToRad(degree)); // dojox/gfx/matrix.Matrix2D
		},
		skewX: function(angle) {
			// summary:
			//		forms an x skewing matrix
			// description:
			//		The resulting matrix is used to skew points in the x dimension
			//		around the origin of coordinates (0, 0) by specified angle.
			// angle: Number
			//		a skewing angle in radians
			// returns: dojox/gfx/matrix.Matrix2D
			return new m.Matrix2D({xy: Math.tan(angle)}); // dojox/gfx/matrix.Matrix2D
		},
		skewXg: function(degree){
			// summary:
			//		forms an x skewing matrix
			// description:
			//		The resulting matrix is used to skew points in the x dimension
			//		around the origin of coordinates (0, 0) by specified degree.
			//		See dojox/gfx/matrix.skewX() for comparison.
			// degree: Number
			//		a skewing angle in degrees
			// returns: dojox/gfx/matrix.Matrix2D
			return m.skewX(m._degToRad(degree)); // dojox/gfx/matrix.Matrix2D
		},
		skewY: function(angle){
			// summary:
			//		forms a y skewing matrix
			// description:
			//		The resulting matrix is used to skew points in the y dimension
			//		around the origin of coordinates (0, 0) by specified angle.
			// angle: Number
			//		a skewing angle in radians
			// returns: dojox/gfx/matrix.Matrix2D
			return new m.Matrix2D({yx: Math.tan(angle)}); // dojox/gfx/matrix.Matrix2D
		},
		skewYg: function(degree){
			// summary:
			//		forms a y skewing matrix
			// description:
			//		The resulting matrix is used to skew points in the y dimension
			//		around the origin of coordinates (0, 0) by specified degree.
			//		See dojox/gfx/matrix.skewY() for comparison.
			// degree: Number
			//		a skewing angle in degrees
			// returns: dojox/gfx/matrix.Matrix2D
			return m.skewY(m._degToRad(degree)); // dojox/gfx/matrix.Matrix2D
		},
		reflect: function(a, b){
			// summary:
			//		forms a reflection matrix
			// description:
			//		The resulting matrix is used to reflect points around a vector,
			//		which goes through the origin.
			// a: dojox/gfx.Point|Number
			//		a point-like object, which specifies a vector of reflection, or an X value
			// b: Number?
			//		a Y value
			// returns: dojox/gfx/matrix.Matrix2D
			if(arguments.length == 1){
				b = a.y;
				a = a.x;
			}
			// make a unit vector
			var a2 = a * a, b2 = b * b, n2 = a2 + b2, xy = 2 * a * b / n2;
			return new m.Matrix2D({xx: 2 * a2 / n2 - 1, xy: xy, yx: xy, yy: 2 * b2 / n2 - 1}); // dojox/gfx/matrix.Matrix2D
		},
		project: function(a, b){
			// summary:
			//		forms an orthogonal projection matrix
			// description:
			//		The resulting matrix is used to project points orthogonally on a vector,
			//		which goes through the origin.
			// a: dojox/gfx.Point|Number
			//		a point-like object, which specifies a vector of projection, or
			//		an x coordinate value
			// b: Number?
			//		a y coordinate value
			// returns: dojox/gfx/matrix.Matrix2D
			if(arguments.length == 1){
				b = a.y;
				a = a.x;
			}
			// make a unit vector
			var a2 = a * a, b2 = b * b, n2 = a2 + b2, xy = a * b / n2;
			return new m.Matrix2D({xx: a2 / n2, xy: xy, yx: xy, yy: b2 / n2}); // dojox/gfx/matrix.Matrix2D
		},

		// ensure matrix 2D conformance
		normalize: function(matrix){
			// summary:
			//		converts an object to a matrix, if necessary
			// description:
			//		Converts any 2D matrix-like object or an array of
			//		such objects to a valid dojox/gfx/matrix.Matrix2D object.
			// matrix: Object
			//		an object, which is converted to a matrix, if necessary
			// returns: dojox/gfx/matrix.Matrix2D
			return (matrix instanceof m.Matrix2D) ? matrix : new m.Matrix2D(matrix); // dojox/gfx/matrix.Matrix2D
		},

		// common operations

		isIdentity: function(matrix){
			// summary:
			//		returns whether the specified matrix is the identity.
			// matrix: dojox/gfx/matrix.Matrix2D
			//		a 2D matrix object to be tested
			// returns: Boolean
			return matrix.xx == 1 && matrix.xy == 0 && matrix.yx == 0 && matrix.yy == 1 && matrix.dx == 0 && matrix.dy == 0; // Boolean
		},
		clone: function(matrix){
			// summary:
			//		creates a copy of a 2D matrix
			// matrix: dojox/gfx/matrix.Matrix2D
			//		a 2D matrix-like object to be cloned
			// returns: dojox/gfx/matrix.Matrix2D
			var obj = new m.Matrix2D();
			for(var i in matrix){
				if(typeof(matrix[i]) == "number" && typeof(obj[i]) == "number" && obj[i] != matrix[i]) obj[i] = matrix[i];
			}
			return obj; // dojox/gfx/matrix.Matrix2D
		},
		invert: function(matrix){
			// summary:
			//		inverts a 2D matrix
			// matrix: dojox/gfx/matrix.Matrix2D
			//		a 2D matrix-like object to be inverted
			// returns: dojox/gfx/matrix.Matrix2D
			var M = m.normalize(matrix),
				D = M.xx * M.yy - M.xy * M.yx;
				M = new m.Matrix2D({
					xx: M.yy/D, xy: -M.xy/D,
					yx: -M.yx/D, yy: M.xx/D,
					dx: (M.xy * M.dy - M.yy * M.dx) / D,
					dy: (M.yx * M.dx - M.xx * M.dy) / D
				});
			return M; // dojox/gfx/matrix.Matrix2D
		},
		_multiplyPoint: function(matrix, x, y){
			// summary:
			//		applies a matrix to a point
			// matrix: dojox/gfx/matrix.Matrix2D
			//		a 2D matrix object to be applied
			// x: Number
			//		an x coordinate of a point
			// y: Number
			//		a y coordinate of a point
			// returns: dojox/gfx.Point
			return {x: matrix.xx * x + matrix.xy * y + matrix.dx, y: matrix.yx * x + matrix.yy * y + matrix.dy}; // dojox/gfx.Point
		},
		multiplyPoint: function(matrix, /* Number||Point */ a, /* Number? */ b){
			// summary:
			//		applies a matrix to a point
			// matrix: dojox/gfx/matrix.Matrix2D
			//		a 2D matrix object to be applied
			// a: Number|dojox/gfx.Point
			//		an x coordinate of a point, or a point
			// b: Number?
			//		a y coordinate of a point
			// returns: dojox/gfx.Point
			var M = m.normalize(matrix);
			if(typeof a == "number" && typeof b == "number"){
				return m._multiplyPoint(M, a, b); // dojox/gfx.Point
			}
			return m._multiplyPoint(M, a.x, a.y); // dojox/gfx.Point
		},
		multiplyRectangle: function(matrix, /*Rectangle*/ rect){
			// summary:
			//		Applies a matrix to a rectangle.
			// description:
			//		The method applies the transformation on all corners of the
			//		rectangle and returns the smallest rectangle enclosing the 4 transformed
			//		points.
			// matrix: dojox/gfx/matrix.Matrix2D
			//		a 2D matrix object to be applied.
			// rect: Rectangle
			//		the rectangle to transform.
			// returns: dojox/gfx.Rectangle
			var M = m.normalize(matrix);
			rect = rect || {x:0, y:0, width:0, height:0}; 
			if(m.isIdentity(M))
				return {x: rect.x, y: rect.y, width: rect.width, height: rect.height}; // dojo/gfx.Rectangle
			var p0 = m.multiplyPoint(M, rect.x, rect.y),
				p1 = m.multiplyPoint(M, rect.x, rect.y + rect.height),
				p2 = m.multiplyPoint(M, rect.x + rect.width, rect.y),
				p3 = m.multiplyPoint(M, rect.x + rect.width, rect.y + rect.height),
				minx = Math.min(p0.x, p1.x, p2.x, p3.x),
				miny = Math.min(p0.y, p1.y, p2.y, p3.y),
				maxx = Math.max(p0.x, p1.x, p2.x, p3.x),
				maxy = Math.max(p0.y, p1.y, p2.y, p3.y);
			return{ // dojo/gfx.Rectangle
				x: minx,
				y: miny,
				width: maxx - minx,
				height: maxy - miny
			};
		},
		multiply: function(matrix){
			// summary:
			//		combines matrices by multiplying them sequentially in the given order
			// matrix: dojox/gfx/matrix.Matrix2D
			//		a 2D matrix-like object,
			//		all subsequent arguments are matrix-like objects too
			var M = m.normalize(matrix);
			// combine matrices
			for(var i = 1; i < arguments.length; ++i){
				var l = M, r = m.normalize(arguments[i]);
				M = new m.Matrix2D();
				M.xx = l.xx * r.xx + l.xy * r.yx;
				M.xy = l.xx * r.xy + l.xy * r.yy;
				M.yx = l.yx * r.xx + l.yy * r.yx;
				M.yy = l.yx * r.xy + l.yy * r.yy;
				M.dx = l.xx * r.dx + l.xy * r.dy + l.dx;
				M.dy = l.yx * r.dx + l.yy * r.dy + l.dy;
			}
			return M; // dojox/gfx/matrix.Matrix2D
		},

		// high level operations

		_sandwich: function(matrix, x, y){
			// summary:
			//		applies a matrix at a central point
			// matrix: dojox/gfx/matrix.Matrix2D
			//		a 2D matrix-like object, which is applied at a central point
			// x: Number
			//		an x component of the central point
			// y: Number
			//		a y component of the central point
			return m.multiply(m.translate(x, y), matrix, m.translate(-x, -y)); // dojox/gfx/matrix.Matrix2D
		},
		scaleAt: function(a, b, c, d){
			// summary:
			//		scales a picture using a specified point as a center of scaling
			// description:
			//		Compare with dojox/gfx/matrix.scale().
			// a: Number
			//		a scaling factor used for the x coordinate, or a uniform scaling factor used for both coordinates
			// b: Number?
			//		a scaling factor used for the y coordinate
			// c: Number|Point
			//		an x component of a central point, or a central point
			// d: Number
			//		a y component of a central point
			// returns: dojox/gfx/matrix.Matrix2D
			switch(arguments.length){
				case 4:
					// a and b are scale factor components, c and d are components of a point
					return m._sandwich(m.scale(a, b), c, d); // dojox/gfx/matrix.Matrix2D
				case 3:
					if(typeof c == "number"){
						return m._sandwich(m.scale(a), b, c); // dojox/gfx/matrix.Matrix2D
					}
					return m._sandwich(m.scale(a, b), c.x, c.y); // dojox/gfx/matrix.Matrix2D
			}
			return m._sandwich(m.scale(a), b.x, b.y); // dojox/gfx/matrix.Matrix2D
		},
		rotateAt: function(angle, a, b){
			// summary:
			//		rotates a picture using a specified point as a center of rotation
			// description:
			//		Compare with dojox/gfx/matrix.rotate().
			// angle: Number
			//		an angle of rotation in radians (>0 for CW)
			// a: Number|dojox/gfx.Point
			//		an x component of a central point, or a central point
			// b: Number?
			//		a y component of a central point
			// returns: dojox/gfx/matrix.Matrix2D
			if(arguments.length > 2){
				return m._sandwich(m.rotate(angle), a, b); // dojox/gfx/matrix.Matrix2D
			}
			return m._sandwich(m.rotate(angle), a.x, a.y); // dojox/gfx/matrix.Matrix2D
		},
		rotategAt: function(degree, a, b){
			// summary:
			//		rotates a picture using a specified point as a center of rotation
			// description:
			//		Compare with dojox/gfx/matrix.rotateg().
			// degree: Number
			//		an angle of rotation in degrees (>0 for CW)
			// a: Number|dojox/gfx.Point
			//		an x component of a central point, or a central point
			// b: Number?
			//		a y component of a central point
			// returns: dojox/gfx/matrix.Matrix2D
			if(arguments.length > 2){
				return m._sandwich(m.rotateg(degree), a, b); // dojox/gfx/matrix.Matrix2D
			}
			return m._sandwich(m.rotateg(degree), a.x, a.y); // dojox/gfx/matrix.Matrix2D
		},
		skewXAt: function(angle, a, b){
			// summary:
			//		skews a picture along the x axis using a specified point as a center of skewing
			// description:
			//		Compare with dojox/gfx/matrix.skewX().
			// angle: Number
			//		a skewing angle in radians
			// a: Number|dojox/gfx.Point
			//		an x component of a central point, or a central point
			// b: Number?
			//		a y component of a central point
			// returns: dojox/gfx/matrix.Matrix2D
			if(arguments.length > 2){
				return m._sandwich(m.skewX(angle), a, b); // dojox/gfx/matrix.Matrix2D
			}
			return m._sandwich(m.skewX(angle), a.x, a.y); // dojox/gfx/matrix.Matrix2D
		},
		skewXgAt: function(degree, a, b){
			// summary:
			//		skews a picture along the x axis using a specified point as a center of skewing
			// description:
			//		Compare with dojox/gfx/matrix.skewXg().
			// degree: Number
			//		a skewing angle in degrees
			// a: Number|dojox/gfx.Point
			//		an x component of a central point, or a central point
			// b: Number?
			//		a y component of a central point
			// returns: dojox/gfx/matrix.Matrix2D
			if(arguments.length > 2){
				return m._sandwich(m.skewXg(degree), a, b); // dojox/gfx/matrix.Matrix2D
			}
			return m._sandwich(m.skewXg(degree), a.x, a.y); // dojox/gfx/matrix.Matrix2D
		},
		skewYAt: function(angle, a, b){
			// summary:
			//		skews a picture along the y axis using a specified point as a center of skewing
			// description:
			//		Compare with dojox/gfx/matrix.skewY().
			// angle: Number
			//		a skewing angle in radians
			// a: Number|dojox/gfx.Point
			//		an x component of a central point, or a central point
			// b: Number?
			//		a y component of a central point
			// returns: dojox/gfx/matrix.Matrix2D
			if(arguments.length > 2){
				return m._sandwich(m.skewY(angle), a, b); // dojox/gfx/matrix.Matrix2D
			}
			return m._sandwich(m.skewY(angle), a.x, a.y); // dojox/gfx/matrix.Matrix2D
		},
		skewYgAt: function(/* Number */ degree, /* Number||Point */ a, /* Number? */ b){
			// summary:
			//		skews a picture along the y axis using a specified point as a center of skewing
			// description:
			//		Compare with dojox/gfx/matrix.skewYg().
			// degree: Number
			//		a skewing angle in degrees
			// a: Number|dojox/gfx.Point
			//		an x component of a central point, or a central point
			// b: Number?
			//		a y component of a central point
			// returns: dojox/gfx/matrix.Matrix2D
			if(arguments.length > 2){
				return m._sandwich(m.skewYg(degree), a, b); // dojox/gfx/matrix.Matrix2D
			}
			return m._sandwich(m.skewYg(degree), a.x, a.y); // dojox/gfx/matrix.Matrix2D
		}

		//TODO: rect-to-rect mapping, scale-to-fit (isotropic and anisotropic versions)

	});
	// propagate Matrix2D up
	g.Matrix2D = m.Matrix2D;

	return m;
});



},
'dojox/gfx/gradient':function(){
define("dojox/gfx/gradient", ["dojo/_base/lang", "./matrix", "dojo/_base/Color"], 
  function(lang, m, Color){
// Various utilities to deal with a linear gradient (mostly VML-specific)
	var grad = lang.getObject("dojox.gfx.gradient", true);
	var C = Color;
	
	grad.rescale = function(stops, from, to){
		// summary:
		//		Recalculates a gradient from 0-1 window to
		//		"from"-"to" window blending and replicating colors,
		//		if necessary.
		// stops: Array
		//		input gradient as a list of colors with offsets
		//		(see dojox/gfx.defaultLinearGradient and dojox/gfx.defaultRadialGradient)
		// from: Number
		//		the beginning of the window, should be less than "to"
		// to: Number
		//		the end of the window, should be more than "from"

		var len = stops.length, reverseFlag = (to < from), newStops;

		// do we need to reverse the color table?
		if(reverseFlag){
			var tmp = from;
			from = to;
			to = tmp;
		}
		
		// various edge cases
		if(!len){
			// no colors
			return [];
		}
		if(to <= stops[0].offset){
			// all colors are before the color table
			newStops = [
				{offset: 0, color: stops[0].color},
				{offset: 1, color: stops[0].color}
			];
		}else if(from >= stops[len - 1].offset){
			// all colors are after the color table
			newStops = [
				{offset: 0, color: stops[len - 1].color},
				{offset: 1, color: stops[len - 1].color}
			];
		}else{
			// main scanning algorithm
			var span = to - from, stop, prev, i;
			newStops = [];
			if(from < 0){
				newStops.push({offset: 0, color: new C(stops[0].color)});
			}
			for(i = 0; i < len; ++i){
				stop = stops[i];
				if(stop.offset >= from){
					break;
				}
				// skip this color
			}
			if(i){
				prev = stops[i - 1];
				newStops.push({
					offset: 0,
					color: Color.blendColors(new C(prev.color), new C(stop.color), (from - prev.offset) / (stop.offset - prev.offset))
				});
			}else{
				newStops.push({offset: 0, color: new C(stop.color)});
			}
			for(; i < len; ++i){
				stop = stops[i];
				if(stop.offset >= to){
					break;
				}
				newStops.push({offset: (stop.offset - from) / span, color: new C(stop.color)});
			}
			if(i < len){
				prev = stops[i - 1];
				newStops.push({
					offset: 1,
					color: Color.blendColors(new C(prev.color), new C(stop.color), (to - prev.offset) / (stop.offset - prev.offset))
				});
			}else{
				newStops.push({offset: 1, color: new C(stops[len - 1].color)});
			}
		}
		
		// reverse the color table, if needed
		if(reverseFlag){
			newStops.reverse();
			for(i = 0, len = newStops.length; i < len; ++i){
				stop = newStops[i];
				stop.offset = 1 - stop.offset;
			}
		}
		
		return newStops;
	};
	
	function getPoint(x, y, matrix, project, shiftAndRotate, scale){
		var r = m.multiplyPoint(matrix, x, y),
			p = m.multiplyPoint(project, r);
		return {r: r, p: p, o: m.multiplyPoint(shiftAndRotate, p).x / scale};
	}
	
	function sortPoints(a, b){
		return a.o - b.o;
	}
	
	grad.project = function(matrix, gradient, tl, rb, ttl, trb){
		// summary:
		//		Returns a new gradient using the "VML algorithm" and suitable for VML.
		// matrix: dojox/gfx/matrix.Matrix2D|null
		//		matrix to apply to a shape and its gradient
		// gradient: Object
		//		a linear gradient object to be transformed
		// tl: dojox/gfx.Point
		//		top-left corner of shape's bounding box
		// rb: dojox/gfx.Point
		//		right-bottom corner of shape's bounding box
		// ttl: dojox/gfx.Point
		//		top-left corner of shape's transformed bounding box
		// trb: dojox/gfx.Point
		//		right-bottom corner of shape's transformed bounding box
		
		matrix = matrix || m.identity;

		var f1 = m.multiplyPoint(matrix, gradient.x1, gradient.y1),
			f2 = m.multiplyPoint(matrix, gradient.x2, gradient.y2),
			angle = Math.atan2(f2.y - f1.y, f2.x - f1.x),
			project = m.project(f2.x - f1.x, f2.y - f1.y),
			pf1 = m.multiplyPoint(project, f1),
			pf2 = m.multiplyPoint(project, f2),
			shiftAndRotate = new m.Matrix2D([m.rotate(-angle), {dx: -pf1.x, dy: -pf1.y}]),
			scale = m.multiplyPoint(shiftAndRotate, pf2).x,
			//comboMatrix = new m.Matrix2D([shiftAndRotate, project, matrix]),
			// bbox-specific calculations
			points = [
					getPoint(tl.x, tl.y, matrix, project, shiftAndRotate, scale),
					getPoint(rb.x, rb.y, matrix, project, shiftAndRotate, scale),
					getPoint(tl.x, rb.y, matrix, project, shiftAndRotate, scale),
					getPoint(rb.x, tl.y, matrix, project, shiftAndRotate, scale)
				].sort(sortPoints),
			from = points[0].o,
			to   = points[3].o,
			stops = grad.rescale(gradient.colors, from, to),
			//angle2 = Math.atan2(Math.abs(points[3].r.y - points[0].r.y) * (f2.y - f1.y), Math.abs(points[3].r.x - points[0].r.x) * (f2.x - f1.x));
			angle2 = Math.atan2(points[3].r.y - points[0].r.y, points[3].r.x - points[0].r.x);

		return {
			type: "linear",
			x1: points[0].p.x, y1: points[0].p.y, x2: points[3].p.x, y2: points[3].p.y,
			colors: stops,
			// additional helpers (for VML)
			angle: angle
		};
	};
	
	return grad;
});

},
'dojox/gfx/move':function(){
define("dojox/gfx/move", ["dojo/_base/lang", "./Mover", "./Moveable"], 
  function(lang){ return lang.getObject("dojox.gfx.move", true); });

},
'dojox/string/BidiEngine':function(){
define("dojox/string/BidiEngine", ["dojo/_base/lang", "dojo/_base/declare"], 
  function(lang,declare){
lang.getObject("string", true, dojox);

declare("dojox.string.BidiEngine", null, {
	// summary:
	//		This class provides a bidi transformation engine, i.e.
	//		functions for reordering and shaping bidi text.
	// description:
	//		Bidi stands for support for languages with a bidirectional script. 
	//
	//		Usually Unicode Bidi Algorithm used by OS platform (and web browsers) is capable of properly transforming
	//		Bidi text and as a result it is adequately displayed on the screen. However, in some situations, 
	//		Unicode Bidi Algorithm is not invoked or is not properly applied. This may occur in situation in which software
	//		responsible for rendering the text is not leveraging Unicode Bidi Algorithm implemented by OS (e.g. dojox.GFX renderers).
	//
	//		Bidi engine provided in this class implements Unicode Bidi Algorithm as specified at
	//		http://www.unicode.org/reports/tr9/.
	//
	//		For more information on basic Bidi concepts please read
	//		"Bidirectional script support - A primer" available from
	//		http://www.ibm.com/developerworks/websphere/library/techarticles/bidi/bidigen.html.
	//
	//		As of February 2011, Bidi engine has following limitations:
	//
	//		1. No support for following numeric shaping options:
	//		    - H - Hindi,
	//		    - C - Contextual,
	//		    - N - Nominal.
	//		2. No support for following shaping options:
	//		    - I - Initial shaping,
	//		    - M - Middle shaping,
	//		    - F - Final shaping,
	//		    - B - Isolated shaping.
	//		3. No support for source-to-target or/and target-to-source maps.
	//		4. No support for LRE/RLE/LRO/RLO/PDF (they are handled like neutrals).
	//		5. No support for Windows compatibility.
	//		6. No support for  insert/remove marks.
	//		7. No support for code pages (currently only UTF-8 is supported. Ideally we should convert from any code page to UTF-8).
	
	bidiTransform: function (/*String*/text, /*String*/formatIn, /*String*/formatOut){
		// summary:
		//		Central public API for Bidi engine. Transforms the text according to formatIn, formatOut parameters.
		//		If formatIn or formatOut parametrs are not valid throws an exception.
		// inputText:
		//		Input text subject to application of Bidi transformation.
		// formatIn:
		//		Input Bidi layout in which inputText is passed to the function.
		// formatOut:
		//		Output Bidi layout to which inputText should be transformed.
		// description:
		//		Both formatIn and formatOut parameters are 5 letters long strings. 
		//		For example - "ILYNN". Each letter is associated with specific attribute of Bidi layout. 
		//		Possible and default values for each one of the letters are provided below:
		//
		//		First letter:
		//
		//		- Letter position/index:
		//			1
		//		- Letter meaning:
		//			Ordering Schema.
		//		- Possible values:
		//			- I - Implicit (Logical).
		//			- V - Visual.
		//		- Default value:
		//			I
		//
		//		Second letter:
		//
		//		- Letter position/index:
		//			2
		//		- Letter meaning:
		//			Orientation.
		//		- Possible values:
		//			- L - Left To Right.
		//			- R - Right To Left.
		//			- C - Contextual Left to Right.
		//			- D - Contextual Right to Left.
		//		- Default value:
		//			L		
		//
		//		Third letter:
		//
		//		- Letter position/index:
		//			3
		//		- Letter meaning:
		//			Symmetric Swapping.
		//		- Possible values:
		//			- Y - Symmetric swapping is on.
		//			- N - Symmetric swapping is off.
		//		- Default value:
		//			Y		
		//
		//		Fourth letter:
		//
		//		- Letter position/index:
		//			4
		//		- Letter meaning:
		//			Shaping.
		//		- Possible values:
		//			- S - Text is shaped.
		//			- N - Text is not shaped.
		//		- Default value:
		//			N				
		//
		//		Fifth letter:
		//
		//		- Letter position/index:
		//			5
		//		- Letter meaning:
		//			Numeric Shaping.
		//		- Possible values:
		//			- N - Nominal.
		//		- Default value:
		//			N				
		//
		//		The output of this function is original text (passed via first argument) transformed from input Bidi layout (second argument)
		//		to output Bidi layout (last argument). 
		//
		//		Sample call:
		//	|	mytext = bidiTransform("HELLO WORLD", "ILYNN", "VLYNN");
		//		In this case, "HELLO WORLD" text is transformed from Logical - LTR to Visual - LTR Bidi layout with 
		//		default values for symmetric swapping (Yes), shaping (Not shaped) and numeric shaping (Nominal).
		// returns: String
		//		Original text transformed from input Bidi layout (second argument)
		//		to output Bidi layout (last argument).
		//		Throws an exception if the bidi layout strings are not valid.
		// tags:
		//		public
		
		if(!text){
			return '';
		}
		if(!formatIn && !formatOut){
			return text;
		}

		// regex for format validation
		// Allowed values for format string are:
		// 1st letter- I, V
		// 2nd letter- L, R, C, D
		// 3rd letter- Y, N
		// 4th letter- S, N
		// 5th letter- N
		var validFormat = /^[(I|V)][(L|R|C|D)][(Y|N)][(S|N)][N]$/;
		if(!validFormat.test(formatIn) || !validFormat.test(formatOut)){
			throw new Error("dojox.string.BidiEngine: the bidi layout string is wrong!");
		}

		if(formatIn == formatOut){
			return text;
		}

		var orientIn = getOrientation(formatIn.charAt(1))
			, orientOut = getOrientation(formatOut.charAt(1))
			, os_in = (formatIn.charAt(0) == 'I') ? 'L' : formatIn.charAt(0)
			, os_out = (formatOut.charAt(0) == 'I') ? 'L' : formatOut.charAt(0)
			, inFormat = os_in + orientIn
			, outFormat = os_out + orientOut
			, swap = formatIn.charAt(2) + formatOut.charAt(2)
			;

		if(inFormat){
			bdx.defInFormat = inFormat;
		}
		if(outFormat){
			bdx.defOutFormat = outFormat;
		}
		if(swap){
			bdx.defSwap = swap;
		}
		
		var stage1_text = doBidiReorder(text, os_in + orientIn, os_out + orientOut, formatIn.charAt(2) + formatOut.charAt(2))
			, isRtl = false;

		if(formatOut.charAt(1) == 'R'){
			isRtl = true;
		}else if(formatOut.charAt(1) == 'C' || formatOut.charAt(1) == 'D'){
			isRtl = this.checkContextual(stage1_text);
		}
		if(formatIn.charAt(3) == formatOut.charAt(3)){
			return stage1_text;
		}else if(formatOut.charAt(3) == 'S'){
			return shape(isRtl, stage1_text, true);
		}
		if(formatOut.charAt(3) == 'N'){
			return deshape(stage1_text, isRtl, true);
		}
	},
	checkContextual: function(/*String*/text){
		// summary:
		//		Determine the base direction of a bidi text according
		//		to its first strong directional character.
		// text: 
		//		The text to check.
		// returns: /*String*/
		//		"ltr" or "rtl" according to the first strong character.
		//		If there is no strong character, returns the value of the
		//		document dir property.
		// tags:
		//		public		
		var dir = firstStrongDir(text);
		if(dir != "ltr" && dir != "rtl"){
			dir = document.dir.toLowerCase();
			if(dir != "ltr" && dir != "rtl"){dir = "ltr";}
		}
		return dir;
	},
	hasBidiChar: function(/*String*/text){
		// summary:
		//		Return true if text contains RTL directed character.
		// text:
		//		The source string.
		// description:
		//		Iterates over the text string, letter by letter starting from its beginning,
		//		searching for RTL directed character. 
		//		Return true if found else false. Needed for vml transformation.
		// returns: /*Boolean*/
		//		true - if text has a RTL directed character.
		//		false - otherwise. 
		// tags:
		//		public

		var type = null, uc = null,	hi = null;
		for(var i = 0; i < text.length; i++){
			uc = text.charAt(i).charCodeAt(0);
			hi = MasterTable[uc >> 8];
			type = hi < TBBASE ? hi : UnicodeTable[hi - TBBASE][uc & 0xFF];
			if(type == UBAT_R || type == UBAT_AL){
				return true;
			}
			if(type == UBAT_B){
				break;
			}
		}
		return false;
	}	

});


function doBidiReorder(/*String*/text, /*String*/inFormat,
						/*String*/outFormat, /*String*/swap){
	// summary:
	//		Reorder the source text according to the bidi attributes
	//		of source and result.
	// text:
	//		The text to reorder.
	// inFormat:
	//		Ordering scheme and base direction of the source text.
	//		Can be "LLTR", "LRTL", "LCLR", "LCRL", "VLTR", "VRTL",
	//		"VCLR", "VCRL".
	//		The first letter is "L" for logical ordering scheme,
	//		"V" for visual ordering scheme.
	//		The other letters specify the base direction.
	//		"CLR" means contextual direction defaulting to LTR if
	//		there is no strong letter.
	//		"CRL" means contextual direction defaulting to RTL if
	//		there is no strong letter.
	//		The initial value is "LLTR", if none, the initial value is used.
	// outFormat:
	//		Required ordering scheme and base direction of the
	//		result. Has the same format as inFormat.
	//		If none, the initial value "VLTR" is used.
	// swap:
	//		Symmetric swapping attributes of source and result.
	//		The allowed values can be "YN", "NY", "YY" and "NN".
	//		The first letter reflects the symmetric swapping attribute
	//		of the source, the second letter that of the result.	
	// returns:
	//		Text reordered according to source and result attributes.

	if(inFormat == undefined){
		inFormat = bdx.defInFormat;
	}
	if(outFormat == undefined){
		outFormat = bdx.defOutFormat;
	}
	if(swap == undefined){
		swap = bdx.defSwap;
	}
	if(inFormat == outFormat){
		return text;
	}
	var dir, inOrdering = inFormat.substring(0,1)
		, inOrientation = inFormat.substring(1,4)
		, outOrdering = outFormat.substring(0,1)
		, outOrientation = outFormat.substring(1,4)
		;
	if(inOrientation.charAt(0) == "C"){
		dir = firstStrongDir(text);
		if(dir == "ltr" || dir == "rtl"){
			inOrientation = dir.toUpperCase();
		}else{
			inOrientation = inFormat.charAt(2) == "L" ? "LTR" : "RTL";
		}
		inFormat = inOrdering + inOrientation;
	}
	if(outOrientation.charAt(0) == "C"){
		dir = firstStrongDir(text);
		if(dir == "rtl"){
			outOrientation = "RTL";
		}else if(dir == "ltr"){
			dir = lastStrongDir(text);
			outOrientation = dir.toUpperCase();
		}else{
			outOrientation = outFormat.charAt(2) == "L" ? "LTR" : "RTL";
		}
		outFormat = outOrdering + outOrientation;
	}
	if(inFormat == outFormat){
		return text;
	}
	bdx.inFormat = inFormat;
	bdx.outFormat = outFormat;
	bdx.swap = swap;
	if((inOrdering == "L") && (outFormat == "VLTR")){ //core cases
		//cases: LLTR->VLTR, LRTL->VLTR
		if(inOrientation == "LTR"){
			bdx.dir = LTR;
			return doReorder(text);
		}
		if(inOrientation == "RTL"){
			bdx.dir = RTL;
			return doReorder(text);
		}
	}
	if((inOrdering == "V") && (outOrdering == "V")){
		//inOrientation != outOrientation
		//cases: VRTL->VLTR, VLTR->VRTL
		return invertStr(text);
	}
	if((inOrdering == "L") && (outFormat == "VRTL")){
		//cases: LLTR->VRTL, LRTL->VRTL
		if(inOrientation == "LTR"){
			bdx.dir = LTR;
			text = doReorder(text);
		}else{
			//inOrientation == RTL
			bdx.dir = RTL;
			text = doReorder(text);
		}
		return invertStr(text);
	}
	if((inFormat == "VLTR") && (outFormat == "LLTR")){
		//case: VLTR->LLTR
		bdx.dir = LTR;
		return doReorder(text);
	}
	if((inOrdering == "V") && (outOrdering == "L") && (inOrientation != outOrientation)){
		//cases: VLTR->LRTL, VRTL->LLTR
		text = invertStr(text);

		return (inOrientation == "RTL") ? doBidiReorder(text, "LLTR","VLTR", swap) : doBidiReorder(text, "LRTL","VRTL", swap);
	}
	if((inFormat == "VRTL") && (outFormat == "LRTL")){
		//case VRTL->LRTL
		return doBidiReorder(text, "LRTL","VRTL", swap);
	}
	if((inOrdering == "L") && (outOrdering == "L")){
		//inOrientation != outOrientation
		//cases: LRTL->LLTR, LLTR->LRTL
		var saveSwap = bdx.swap;
		bdx.swap = saveSwap.substr(0, 1) + "N";
		if(inOrientation == "RTL"){
			//LRTL->LLTR
			bdx.dir = RTL;
			text = doReorder(text);
			bdx.swap = "N" + saveSwap.substr(1, 2);
			bdx.dir = LTR;
			text = doReorder(text);
		}else{ //LLTR->LRTL
			bdx.dir = LTR;
			text = doReorder(text);
			bdx.swap = "N" + saveSwap.substr(1, 2);
			text = doBidiReorder(text, "VLTR","LRTL", bdx.swap);
		}
		return text;
	}

}

function shape(/*boolean*/rtl, /*String*/text, /*boolean*/compress){
	// summary:
	//		Shape the source text.
	// rtl:
	//		Flag indicating if the text is in RTL direction (logical
	//		direction for Arabic words).
	// text:
	//		The text to shape.
	// compress:
	//		A flag indicates to insert extra space after the lam alef compression
	//		to preserve the buffer size or not insert an extra space which will lead
	//		to decrease the buffer size. This option can be:
	//
	//		- true (default) to not insert extra space after compressing Lam+Alef into one character Lamalef
	//		- false to insert an extra space after compressed Lamalef to preserve the buffer size
	// returns:
	//		text shaped.
	// tags:
	//		private.
	
	if(text.length == 0){
		return;
	}
	if(rtl == undefined){
		rtl = true;
	}
	if(compress == undefined){
		compress = true;
	}
	text = new String(text);
	
	var str06 = text.split("")
		, Ix = 0
		, step = +1
		, nIEnd = str06.length
		;
	if(!rtl){
		Ix = str06.length - 1;
		step = -1;
		nIEnd = 1;
	}
	var previousCursive = 0, compressArray = [], compressArrayIndx = 0;
	for(var index = Ix; index * step < nIEnd; index = index + step){
		if(isArabicAlefbet(str06[index]) || isArabicDiacritics(str06[index])){
			// Arabic letter Lam
			if(str06[index] == '\u0644'){
				if(isNextAlef(str06, (index + step), step, nIEnd)){
					str06[index] = (previousCursive == 0) ? getLamAlefFE(str06[index + step], LamAlefInialTableFE) : getLamAlefFE(str06[index + step], LamAlefMedialTableFE);
					index += step;
					setAlefToSpace(str06, index, step, nIEnd);
					if(compress){
						compressArray[compressArrayIndx] = index;
						compressArrayIndx++;
					}
					previousCursive = 0;
					continue;
				}
			}
			var currentChr = str06[index];
			if(previousCursive == 1){
				// if next is Arabic
				//Character is in medial form
				// else character is in final form
				str06[index] = (isNextArabic(str06, (index + step), step, nIEnd)) ? 
					getMedialFormCharacterFE(str06[index]) : getFormCharacterFE(str06[index], FinalForm);
			}else{
				if(isNextArabic(str06, (index + step), step, nIEnd) == true){
					//character is in Initial form
					str06[index] = getFormCharacterFE(str06[index],InitialForm);
				}else{
					str06[index] = getFormCharacterFE(str06[index], IsolatedForm);
				}
			}
			//exam if the current character is cursive
			if(!isArabicDiacritics(currentChr)){
				previousCursive = 1;
			}
			if(isStandAlonCharacter(currentChr) == true){
				previousCursive = 0;
			}
		}else{
			previousCursive = 0;
		}
	}
	var outBuf = "";
	for(idx = 0; idx < str06.length; idx++){
		if(!(compress && indexOf(compressArray, compressArray.length, idx) > -1)){
			outBuf += str06[idx];
		}
	}
	return outBuf;
}

function firstStrongDir(/*String*/text){
	// summary:
	//		Return the first strong character direction
	// text:
	//		The source string.
	// description:
	//		Iterates over the text string, letter by letter starting from its beginning,
	//		searching for first "strong" character. 
	//		Returns if strong character was found with the direction defined by this 
	//		character, if no strong character was found returns an empty string.
	// returns: String
	//		"ltr" - if the first strong character is Latin.
	//		"rtl" - if the first strong character is RTL directed character.
	//		"" - if the strong character wasn't found.
	// tags:
	//		private

	var type = null, uc = null, hi = null;
	for(var i = 0; i < text.length; i++){
		uc = text.charAt(i).charCodeAt(0);
		hi = MasterTable[uc >> 8];
		type = hi < TBBASE ? hi : UnicodeTable[hi - TBBASE][uc & 0xFF];
		if(type == UBAT_R || type == UBAT_AL){
			return "rtl";
		}
		if(type == UBAT_L){
			return	"ltr";
		}
		if(type == UBAT_B){
			break;
		}
	}
	return "";
}

function lastStrongDir(text){
	// summary:
	//		Return the last strong character direction
	// text:
	//		The source string.
	// description:
	//		Iterates over the text string, letter by letter starting from its end,
	//		searching for first (from the end) "strong" character. 
	//		Returns if strong character was found with the direction defined by this 
	//		character, if no strong character was found returns an empty string.
	// tags:
	//		private		
	var type = null;
	for(var i = text.length - 1; i >= 0; i--){
		type = getCharacterType(text.charAt(i));
		if(type == UBAT_R || type == UBAT_AL){
			return "rtl";
		}
		if(type == UBAT_L){
			return	"ltr";
		}
		if(type == UBAT_B){
			break;
		}
	}
	return "";
}

function deshape(/*String*/text, /*boolean*/rtl, /*boolean*/consume_next_space){
	// summary:
	//		deshape the source text.
	// text:
	//		the text to be deshape.
	// rtl:
	//		flag indicating if the text is in RTL direction (logical
	//		direction for Arabic words).
	// consume_next_space:
	//		flag indicating whether to consume the space next to the 
	//		the lam alef if there is a space followed the Lamalef character to preserve the buffer size. 
	//		In case there is no space next to the lam alef the buffer size will be increased due to the
	//		expansion of the lam alef one character into lam+alef two characters
	// returns:
	//		text deshaped.
	if(text.length == 0){
		return;
	}
	if(consume_next_space == undefined){
		consume_next_space = true;
	}
	if(rtl == undefined){
		rtl = true;
	}
	text = new String(text);

	var outBuf = "", strFE = [], textBuff = "";
	if(consume_next_space){
		for(var j = 0; j < text.length; j++){
			if(text.charAt(j) == ' '){
				if(rtl){
					if(j > 0){
						if(text.charAt(j - 1) >= '\uFEF5' && text.charAt(j - 1) <= '\uFEFC'){
							continue;
						}
					}
				}else{
					if(j+1 < text.length){
						if(text.charAt(j + 1) >= '\uFEF5' && text.charAt(j + 1) <= '\uFEFC'){
							continue;
						}
					}				
				}
			}
			textBuff += text.charAt(j);
		}
	}else{
		textBuff = new String(text);
	}
	strFE = textBuff.split("");
	for(var i = 0; i < textBuff.length; i++){
		if(strFE[i] >= '\uFE70' && strFE[i] < '\uFEFF'){
			var chNum = textBuff.charCodeAt(i);
			if(strFE[i] >= '\uFEF5' && strFE[i] <= '\uFEFC'){
				//expand the LamAlef
				if(rtl){
					//Lam + Alef
					outBuf += '\u0644';
					outBuf += AlefTable[parseInt((chNum - 65269) / 2)];
				}else{
					outBuf += AlefTable[parseInt((chNum - 65269) / 2)];
					outBuf += '\u0644';
				}
			}else{
				outBuf += FETo06Table[chNum - 65136];
			}
		}else{
			outBuf += strFE[i];
		}
	}
	return outBuf;
}

function doReorder(str){
	// summary:
	//		Helper to the doBidiReorder. Manages the UBA.
	// str:
	//		the string to reorder.
	// returns:
	//		text reordered according to source and result attributes.
	// tags: 
	//		private	
	var chars = str.split(""), levels = [];

	computeLevels(chars, levels);
	swapChars(chars, levels);
	invertLevel(2, chars, levels);
	invertLevel(1, chars, levels);
	return chars.join("");
}

function computeLevels(chars, levels){
	var len = chars.length
		, impTab = bdx.dir ? impTab_RTL : impTab_LTR
		, prevState = null, newClass = null, newLevel = null, newState = 0
		, action = null, cond = null, condPos = -1, i = null, ix = null
		, types = []
		, classes = []
		;
	bdx.hiLevel = bdx.dir;
	bdx.lastArabic = false;
	bdx.hasUBAT_AL = false,
	bdx.hasUBAT_B = false;
	bdx.hasUBAT_S = false;
	for(i = 0; i < len; i++){
		types[i] = getCharacterType(chars[i]);
	}
	for(ix = 0; ix < len; ix++){
		prevState = newState;
		classes[ix] = newClass = getCharClass(chars, types, classes, ix);
		newState = impTab[prevState][newClass];
		action = newState & 0xF0;
		newState &= 0x0F;
		levels[ix] = newLevel = impTab[newState][ITIL];
		if(action > 0){
			if(action == 0x10){	// set conditional run to level 1
				for(i = condPos; i < ix; i++){
					levels[i] = 1;
				}
				condPos = -1;
			}else{	// 0x20 confirm the conditional run
				condPos = -1;
			}
		}
		cond = impTab[newState][ITCOND];
		if(cond){
			if(condPos == -1){
				condPos = ix;
			}
		}else{	// unconditional level
			if(condPos > -1){
				for(i = condPos; i < ix; i++){
					levels[i] = newLevel;
				}
				condPos = -1;
			}
		}
		if(types[ix] == UBAT_B){
			levels[ix] = 0;
		}
		bdx.hiLevel |= newLevel;
	}
	if(bdx.hasUBAT_S){
		for(i = 0; i < len; i++){
			if(types[i] == UBAT_S){
				levels[i] = bdx.dir;
				for(var j = i - 1; j >= 0; j--){
					if(types[j] == UBAT_WS){
						levels[j] = bdx.dir;
					}else{
						break;
					}
				}
			}
		}
	}
}

function swapChars(chars, levels){
	// summary:
	//		Swap characters with symmetrical mirroring as all kinds of parenthesis.
	//		(When needed).
	// chars:
	//		The source string as Array of characters.
	// levels:
	//		An array (like hash) of flags for each character in the source string,
	//		that defines if swapping should be applied on the following character.
	// description:
	//		First checks if the swapping should be applied, if not returns, else 
	//		uses the levels "hash" to find what characters should be swapped.
	// tags:
	//		private	

	if(bdx.hiLevel == 0 || bdx.swap.substr(0, 1) == bdx.swap.substr(1, 2)){
		return;
	}

	//console.log("bdx.hiLevel == 0: " + bdx.hiLevel + "bdx.swap[0]: "+ bdx.swap[0] +" bdx.swap[1]: " +bdx.swap[1]);
	for(var i = 0; i < chars.length; i++){
		if(levels[i] == 1){chars[i] = getMirror(chars[i]);}
	}
}

function getCharacterType(ch){
	// summary:
	//		Return the type of the character.
	// ch:
	//		The character to be checked.

	// description:
	//		Check the type of the character according to MasterTable,
	//		type = LTR, RTL, neutral,Arabic-Indic digit etc.
	// tags:
	//		private			
	var uc = ch.charCodeAt(0)
		, hi = MasterTable[uc >> 8];
	return (hi < TBBASE) ? hi : UnicodeTable[hi - TBBASE][uc & 0xFF];
}

function invertStr(str){
	// summary:
	//		Return the reversed string.
	// str:
	//		The string to be reversed.
	// description:
	//		Reverse the string str.
	// tags:
	//		private					
	var chars = str.split("");
	chars.reverse();
	return chars.join("");
}

function indexOf(cArray, cLength, idx){
	var counter = -1;
	for(var i = 0; i < cLength; i++){
		if(cArray[i] == idx){
			return i;
		}
	}
	return -1;
}

function isArabicAlefbet(c){
	for(var i = 0; i < ArabicAlefBetIntervalsBegine.length; i++){
		if(c >= ArabicAlefBetIntervalsBegine[i] && c <= ArabicAlefBetIntervalsEnd[i]){
			return true;
		}
	}
	return false;
}

function isNextArabic(str06, index, step, nIEnd){
	while(((index) * step) < nIEnd && isArabicDiacritics(str06[index])){
		index += step;
	}
	if(((index) * step) < nIEnd && isArabicAlefbet(str06[index])){
		return true;
	}
	return false;
}

function isNextAlef(str06, index, step, nIEnd){
	while(((index) * step) < nIEnd && isArabicDiacritics(str06[index])){
		index += step;
	}
	var c = ' ';
	if(((index) * step) < nIEnd){
		c = str06[index];
	}else{
		return false;
	}
	for(var i = 0; i < AlefTable.length; i++){
		if(AlefTable[i] == c){
			return true;
		}
	}
	return false;
}

function invertLevel(lev, chars, levels){
	if(bdx.hiLevel < lev){
		return;
	}
	if(lev == 1 && bdx.dir == RTL && !bdx.hasUBAT_B){
		chars.reverse();
		return;
	}
	var len = chars.length, start = 0, end, lo, hi, tmp;
	while(start < len){
		if(levels[start] >= lev){
			end = start + 1;
			while(end < len && levels[end] >= lev){
				end++;
			}
			for(lo = start, hi = end - 1 ; lo < hi; lo++, hi--){
				tmp = chars[lo];
				chars[lo] = chars[hi];
				chars[hi] = tmp;
			}
			start = end;
		}
		start++;
	}
}

function getCharClass(chars, types, classes, ix){
	// summary:
	//		Return the class if ix character in chars.
	// chars:
	//		The source string as Array of characters.
	// types:
	//		Array of types, for each character in chars.
	// classes:
	//		Array of classes that already been solved. 
	// ix:
	//		the index of checked character.
	// tags:
	//		private				
	var cType = types[ix], wType, nType, len, i;
	switch(cType){
		case UBAT_L:
		case UBAT_R:
			bdx.lastArabic = false;
		case UBAT_ON:
		case UBAT_AN:
			return cType;
		case UBAT_EN:
			return bdx.lastArabic ? UBAT_AN : UBAT_EN;
		case UBAT_AL:
			bdx.lastArabic = true;
			bdx.hasUBAT_AL = true;
			return UBAT_R;
		case UBAT_WS:
			return UBAT_ON;
		case UBAT_CS:
			if(ix < 1 || (ix + 1) >= types.length ||
				((wType = classes[ix - 1]) != UBAT_EN && wType != UBAT_AN) ||
				((nType = types[ix + 1]) != UBAT_EN && nType != UBAT_AN)){
				return UBAT_ON;
			}
			if(bdx.lastArabic){nType = UBAT_AN;}
			return nType == wType ? nType : UBAT_ON;
		case UBAT_ES:
			wType = ix > 0 ? classes[ix - 1] : UBAT_B;
			if(wType == UBAT_EN && (ix + 1) < types.length && types[ix + 1] == UBAT_EN){
				return UBAT_EN;
			}
			return UBAT_ON;
		case UBAT_ET:
			if(ix > 0 && classes[ix - 1] == UBAT_EN){
				return UBAT_EN;
			}
			if(bdx.lastArabic){
				return UBAT_ON;
			}
			i = ix + 1;
			len = types.length;
			while(i < len && types[i] == UBAT_ET){
				i++;
			}
			if(i < len && types[i] == UBAT_EN){
				return UBAT_EN;
			}
			return UBAT_ON;
		case UBAT_NSM:
			if(bdx.inFormat == "VLTR"){	// visual to implicit transformation
				len = types.length;
				i = ix + 1;
				while(i < len && types[i] == UBAT_NSM){
					i++;
				}
				if(i < len){
					var c = chars[ix]
						, rtlCandidate = (c >= 0x0591 && c <= 0x08FF) || c == 0xFB1E
						;
					wType = types[i];
					if(rtlCandidate && (wType == UBAT_R || wType == UBAT_AL)){
						return UBAT_R;
					}
				}
			}
			if(ix < 1 || (wType = types[ix - 1]) == UBAT_B){
				return UBAT_ON;
			}
			return classes[ix - 1];
		case UBAT_B:
			lastArabic = false;
			bdx.hasUBAT_B = true;
			return bdx.dir;
		case UBAT_S:
			bdx.hasUBAT_S = true;
			return UBAT_ON;
		case UBAT_LRE:
		case UBAT_RLE:
		case UBAT_LRO:
		case UBAT_RLO:
		case UBAT_PDF:
			lastArabic = false;
		case UBAT_BN:
			return UBAT_ON;
	}
}

function getMirror(c){
	// summary:
	//		Calculates the mirrored character of c
	// c:
	//		The character to be mirrored.
	// tags:
	//		private					
	var mid, low = 0, high = SwapTable.length - 1;

	while(low <= high){
		mid = Math.floor((low + high) / 2);
		if(c < SwapTable[mid][0]){
			high = mid - 1;
		}else if(c > SwapTable[mid][0]){
			low = mid + 1;
		}else{
			return SwapTable[mid][1];
		}
	}
	return c;
}

function isStandAlonCharacter(c){
	for(var i = 0; i < StandAlonForm.length; i++){
		if(StandAlonForm[i] == c){
			return true;
		}
	}
	return false;
}

function getMedialFormCharacterFE(c){
	for(var i = 0; i < BaseForm.length; i++){
		if(c == BaseForm[i]){
			return MedialForm[i];
		}
	}
	return c;
}

function getFormCharacterFE(/*char*/ c, /*char[]*/formArr){
	for(var i = 0; i < BaseForm.length; i++){
		if(c == BaseForm[i]){
			return formArr[i];
		}
	}
	return c;
}

function isArabicDiacritics(c){
	return	(c >= '\u064b' && c <= '\u0655') ? true : false;
}

function getOrientation(/*Char*/ oc){
	if(oc == 'L'){
		return "LTR";
	}
	if(oc == 'R'){
		return "RTL";
	}
	if(oc == 'C'){
		return "CLR";
	}
	if(oc == 'D'){
		return "CRL";
	}
}

function setAlefToSpace(str06, index, step, nIEnd){
	while(((index) * step) < nIEnd && isArabicDiacritics(str06[index])){
		index += step;
	}
	if(((index) * step) < nIEnd){
		str06[index] = ' ';
		return true;
	}
	return false;
}

function getLamAlefFE(alef06, LamAlefForm){
	for(var i = 0; i < AlefTable.length; i++){
		if(alef06 == AlefTable[i]){
			return LamAlefForm[i];
		}
	}
	return alef06;
}

function LamAlef(alef){
	// summary:
	//		If the alef variable is an ARABIC ALEF letter,
	//		return the LamAlef code associated with the specific 
	//		alef character.
	// alef:
	//		The alef code type.
	// description:
	//		If "alef" is an ARABIC ALEF letter, identify which alef is it,
	//		using AlefTable, then return the LamAlef associated with it.
	// tags:
	//		private			
	for(var i = 0; i < AlefTable.length; i++){
		if(AlefTable[i] == alef){
			return AlefTable[i];
		}
	}
	return 0;
}

var	bdx = {
		dir: 0,
		defInFormat: "LLTR",
		defoutFormat: "VLTR",
		defSwap: "YN",
		inFormat: "LLTR",
		outFormat: "VLTR",
		swap: "YN",
		hiLevel: 0,
		lastArabic: false,
		hasUBAT_AL: false,
		hasBlockSep: false,
		hasSegSep: false
};

var ITIL = 5;

var ITCOND = 6;

var LTR = 0;

var RTL = 1;

/****************************************************************************/
/* Array in which directional characters are replaced by their symmetric.	*/
/****************************************************************************/
var SwapTable = [
	[ "\u0028", "\u0029" ],	/* Round brackets					*/
	[ "\u0029", "\u0028" ],
	[ "\u003C", "\u003E" ],	/* Less than/greater than			*/
	[ "\u003E", "\u003C" ],
	[ "\u005B", "\u005D" ],	/* Square brackets					*/
	[ "\u005D", "\u005B" ],
	[ "\u007B", "\u007D" ],	/* Curly brackets					*/
	[ "\u007D", "\u007B" ],
	[ "\u00AB", "\u00BB" ],	/* Double angle quotation marks	*/
	[ "\u00BB", "\u00AB" ],
	[ "\u2039", "\u203A" ],	/* single angle quotation mark		*/
	[ "\u203A", "\u2039" ],
	[ "\u207D", "\u207E" ],	/* Superscript parentheses			*/
	[ "\u207E", "\u207D" ],
	[ "\u208D", "\u208E" ],	/* Subscript parentheses			*/
	[ "\u208E", "\u208D" ],
	[ "\u2264", "\u2265" ],	/* Less/greater than or equal		*/
	[ "\u2265", "\u2264" ],
	[ "\u2329", "\u232A" ],	/* Angle brackets					*/
	[ "\u232A", "\u2329" ],
	[ "\uFE59", "\uFE5A" ],	/* Small round brackets			*/
	[ "\uFE5A", "\uFE59" ],
	[ "\uFE5B", "\uFE5C" ],	/* Small curly brackets			*/
	[ "\uFE5C", "\uFE5B" ],
	[ "\uFE5D", "\uFE5E" ],	/* Small tortoise shell brackets	*/
	[ "\uFE5E", "\uFE5D" ],
	[ "\uFE64", "\uFE65" ],	/* Small less than/greater than	*/
	[ "\uFE65", "\uFE64" ]
];
var AlefTable = ['\u0622', '\u0623', '\u0625', '\u0627'];

var AlefTableFE = [0xFE81, 0xFE82, 0xFE83, 0xFE84, 0xFE87, 0xFE88, 0xFE8D, 0xFE8E];

var LamTableFE = [0xFEDD, 0xFEDE, 0xFEDF, 0xFEE0];

var LamAlefInialTableFE = ['\ufef5', '\ufef7', '\ufef9', '\ufefb'];

var LamAlefMedialTableFE = ['\ufef6', '\ufef8', '\ufefa', '\ufefc'];
/**
 * Arabic Characters in the base form
 */
var BaseForm = ['\u0627', '\u0628', '\u062A', '\u062B', '\u062C', '\u062D', '\u062E', '\u062F', '\u0630', '\u0631', '\u0632', '\u0633', '\u0634', '\u0635', '\u0636', '\u0637', '\u0638', '\u0639', '\u063A', '\u0641', '\u0642', '\u0643', '\u0644', '\u0645', '\u0646', '\u0647', '\u0648', '\u064A', '\u0625', '\u0623', '\u0622', '\u0629', '\u0649', '\u06CC', '\u0626', '\u0624', '\u064B', '\u064C', '\u064D', '\u064E', '\u064F', '\u0650', '\u0651', '\u0652', '\u0621'];

/**
 * Arabic shaped characters in Isolated form
 */
var IsolatedForm = ['\uFE8D', '\uFE8F', '\uFE95', '\uFE99', '\uFE9D', '\uFEA1', '\uFEA5', '\uFEA9', '\uFEAB', '\uFEAD', '\uFEAF', '\uFEB1', '\uFEB5', '\uFEB9', '\uFEBD', '\uFEC1', '\uFEC5', '\uFEC9', '\uFECD', '\uFED1', '\uFED5', '\uFED9', '\uFEDD', '\uFEE1', '\uFEE5', '\uFEE9', '\uFEED', '\uFEF1', '\uFE87', '\uFE83', '\uFE81', '\uFE93', '\uFEEF', '\uFBFC', '\uFE89', '\uFE85', '\uFE70', '\uFE72', '\uFE74', '\uFE76', '\uFE78', '\uFE7A', '\uFE7C', '\uFE7E', '\uFE80'];

/**
 * Arabic shaped characters in Final form
 */
var FinalForm = ['\uFE8E', '\uFE90', '\uFE96', '\uFE9A', '\uFE9E', '\uFEA2', '\uFEA6', '\uFEAA', '\uFEAC', '\uFEAE', '\uFEB0', '\uFEB2', '\uFEB6', '\uFEBA', '\uFEBE', '\uFEC2', '\uFEC6', '\uFECA', '\uFECE', '\uFED2', '\uFED6', '\uFEDA', '\uFEDE', '\uFEE2', '\uFEE6', '\uFEEA', '\uFEEE', '\uFEF2', '\uFE88', '\uFE84', '\uFE82', '\uFE94', '\uFEF0', '\uFBFD', '\uFE8A', '\uFE86', '\uFE70', '\uFE72', '\uFE74', '\uFE76', '\uFE78', '\uFE7A', '\uFE7C', '\uFE7E', '\uFE80'];

/**
 * Arabic shaped characters in Media form
 */
var MedialForm = ['\uFE8E', '\uFE92', '\uFE98', '\uFE9C', '\uFEA0', '\uFEA4', '\uFEA8', '\uFEAA', '\uFEAC', '\uFEAE', '\uFEB0', '\uFEB4', '\uFEB8', '\uFEBC', '\uFEC0', '\uFEC4', '\uFEC8', '\uFECC', '\uFED0', '\uFED4', '\uFED8', '\uFEDC', '\uFEE0', '\uFEE4', '\uFEE8', '\uFEEC', '\uFEEE', '\uFEF4', '\uFE88', '\uFE84', '\uFE82', '\uFE94', '\uFEF0', '\uFBFF', '\uFE8C', '\uFE86', '\uFE71', '\uFE72', '\uFE74', '\uFE77', '\uFE79', '\uFE7B', '\uFE7D', '\uFE7F', '\uFE80'];

/**
 * Arabic shaped characters in Initial form
 */
var InitialForm = ['\uFE8D', '\uFE91', '\uFE97', '\uFE9B', '\uFE9F', '\uFEA3', '\uFEA7', '\uFEA9', '\uFEAB', '\uFEAD', '\uFEAF', '\uFEB3', '\uFEB7', '\uFEBB', '\uFEBF', '\uFEC3', '\uFEC7', '\uFECB', '\uFECF', '\uFED3', '\uFED7', '\uFEDB', '\uFEDF', '\uFEE3', '\uFEE7', '\uFEEB', '\uFEED', '\uFEF3', '\uFE87', '\uFE83', '\uFE81', '\uFE93', '\uFEEF', '\uFBFE', '\uFE8B', '\uFE85', '\uFE70', '\uFE72', '\uFE74', '\uFE76', '\uFE78', '\uFE7A', '\uFE7C', '\uFE7E', '\uFE80'];

/**
 * Arabic characters that couldn't join to the next character
 */
var StandAlonForm = ['\u0621', '\u0627', '\u062F', '\u0630', '\u0631', '\u0632', '\u0648', '\u0622', '\u0629', '\u0626', '\u0624', '\u0625', '\u0675', '\u0623'];

var FETo06Table = ['\u064B', '\u064B', '\u064C', '\u061F', '\u064D', '\u061F', '\u064E', '\u064E', '\u064F', '\u064F', '\u0650', '\u0650', '\u0651', '\u0651', '\u0652', '\u0652', '\u0621', '\u0622', '\u0622', '\u0623', '\u0623', '\u0624', '\u0624', '\u0625', '\u0625', '\u0626', '\u0626', '\u0626', '\u0626', '\u0627', '\u0627', '\u0628', '\u0628', '\u0628', '\u0628', '\u0629', '\u0629', '\u062A', '\u062A', '\u062A', '\u062A', '\u062B', '\u062B', '\u062B', '\u062B', '\u062C', '\u062C', '\u062C', '\u062c', '\u062D', '\u062D', '\u062D', '\u062D', '\u062E', '\u062E', '\u062E', '\u062E', '\u062F', '\u062F', '\u0630', '\u0630', '\u0631', '\u0631', '\u0632', '\u0632', '\u0633', '\u0633', '\u0633', '\u0633', '\u0634', '\u0634', '\u0634', '\u0634', '\u0635', '\u0635', '\u0635', '\u0635', '\u0636', '\u0636', '\u0636', '\u0636', '\u0637', '\u0637', '\u0637', '\u0637', '\u0638', '\u0638', '\u0638', '\u0638', '\u0639', '\u0639', '\u0639', '\u0639', '\u063A', '\u063A', '\u063A', '\u063A', '\u0641', '\u0641', '\u0641', '\u0641', '\u0642', '\u0642', '\u0642', '\u0642', '\u0643', '\u0643', '\u0643', '\u0643', '\u0644', '\u0644', '\u0644', '\u0644', '\u0645', '\u0645', '\u0645', '\u0645', '\u0646', '\u0646', '\u0646', '\u0646', '\u0647', '\u0647', '\u0647', '\u0647', '\u0648', '\u0648', '\u0649', '\u0649', '\u064A', '\u064A', '\u064A', '\u064A', '\uFEF5', '\uFEF6', '\uFEF7', '\uFEF8', '\uFEF9', '\uFEFA', '\uFEFB', '\uFEFC', '\u061F', '\u061F', '\u061F'];

var ArabicAlefBetIntervalsBegine = ['\u0621', '\u0641'];

var ArabicAlefBetIntervalsEnd = ['\u063A', '\u064a'];

var Link06 = [
	1			+ 32 + 256 * 0x11,
	1			+ 32 + 256 * 0x13,
	1			+ 256 * 0x15,
	1			+ 32 + 256 * 0x17,
	1 + 2		+ 256 * 0x19,
	1			+ 32 + 256 * 0x1D,
	1 + 2		+ 256 * 0x1F,
	1			+ 256 * 0x23,
	1 + 2		+ 256 * 0x25,
	1 + 2		+ 256 * 0x29,
	1 + 2		+ 256 * 0x2D,
	1 + 2		+ 256 * 0x31,
	1 + 2		+ 256 * 0x35,
	1			+ 256 * 0x39,
	1			+ 256 * 0x3B,
	1			+ 256 * 0x3D,
	1			+ 256 * 0x3F,
	1 + 2		+ 256 * 0x41,
	1 + 2		+ 256 * 0x45,
	1 + 2		+ 256 * 0x49,
	1 + 2		+ 256 * 0x4D,
	1 + 2		+ 256 * 0x51,
	1 + 2		+ 256 * 0x55,
	1 + 2		+ 256 * 0x59,
	1 + 2		+ 256 * 0x5D,
	0, 0, 0, 0, 0,	/* 0x63B - 0x63F */
	1 + 2,
	1 + 2		+ 256 * 0x61,
	1 + 2		+ 256 * 0x65,
	1 + 2		+ 256 * 0x69,
	1 + 2		+ 16 + 256 * 0x6D,
	1 + 2		+ 256 * 0x71,
	1 + 2		+ 256 * 0x75,
	1 + 2		+ 256 * 0x79,
	1			+ 256 * 0x7D,
	1			+ 256 * 0x7F,
	1 + 2		+ 256 * 0x81,
	4, 4, 4, 4,
	4, 4, 4, 4, 	/* 0x64B - 0x652 */
	0, 0, 0, 0, 0,
	0, 0, 0, 0, 	/* 0x653 - 0x65B */
	1			+ 256 * 0x85,
	1			+ 256 * 0x87,
	1			+ 256 * 0x89,
	1			+ 256 * 0x8B,
	0, 0, 0, 0, 0,
	0, 0, 0, 0, 0,
	0, 0, 0, 0, 0, 0,/* 0x660 - 0x66F */
	4,
	0,
	1			+ 32,
	1			+ 32,
	0,
	1			+ 32,
	1, 1,
	1+2, 1+2, 1+2, 1+2, 1+2, 1+2,
	1+2, 1+2, 1+2, 1+2, 1+2, 1+2,
	1+2, 1+2, 1+2, 1+2,
	1, 1, 1, 1, 1, 1, 1, 1, 1, 1,
	1, 1, 1, 1, 1, 1, 1, 1,
	1+2, 1+2, 1+2, 1+2, 1+2, 1+2, 1+2, 1+2, 1+2, 1+2,
	1+2, 1+2, 1+2, 1+2, 1+2, 1+2, 1+2, 1+2, 1+2, 1+2,
	1+2, 1+2, 1+2, 1+2, 1+2, 1+2, 1+2, 1+2, 1+2, 1+2,
	1+2, 1+2, 1+2, 1+2, 1+2, 1+2, 1+2, 1+2,
	1,
	1+2,
	1, 1, 1, 1, 1, 1, 1, 1, 1, 1,
	1+2,
	1,
	1+2, 1+2, 1+2, 1+2,
	1, 1
];

var LinkFE = [
	1 + 2,
	1 + 2,
	1 + 2, 0, 1+ 2, 0, 1+ 2,
	1 + 2,
	1+ 2, 1 + 2, 1+2, 1 + 2,
	1+ 2, 1 + 2, 1+2, 1 + 2,
	0, 0 + 32, 1 + 32, 0 + 32,
	1 + 32, 0, 1, 0 + 32,
	1 + 32, 0, 2, 1 + 2,
	1, 0 + 32, 1 + 32, 0,
	2, 1 + 2, 1, 0,
	1, 0, 2, 1 + 2,
	1, 0, 2, 1 + 2,
	1, 0, 2, 1 + 2,
	1, 0, 2, 1 + 2,
	1, 0, 2, 1 + 2,
	1, 0, 1, 0,
	1, 0, 1, 0,
	1, 0, 2, 1+2,
	1, 0, 2, 1+2,
	1, 0, 2, 1+2,
	1, 0, 2, 1+2,
	1, 0, 2, 1+2,
	1, 0, 2, 1+2,
	1, 0, 2, 1+2,
	1, 0, 2, 1+2,
	1, 0, 2, 1+2,
	1, 0, 2, 1+2,
	1, 0, 2, 1+2,
	1, 0 + 16, 2 + 16, 1 + 2 +16,
	1 + 16, 0, 2, 1+2,
	1, 0, 2, 1+2,
	1, 0, 2, 1+2,
	1, 0, 1, 0,
	1, 0, 2, 1+2,
	1, 0, 1, 0,
	1, 0, 1, 0,
	1
];
var	impTab_LTR = [
					/*		L,		R,		EN,		AN,		N,		IL,		Cond */
	/* 0 LTR text	*/	[	0,		3,		0,		1,		0,		0,		0	],
	/* 1 LTR+AN		*/	[	0,		3,		0,		1,		2,		2,		0	],
	/* 2 LTR+AN+N	*/	[	0,		3,		0,		0x11,	2,		0,		1	],
	/* 3 RTL text	*/	[	0,		3,		5,		5,		4,		1,		0	],
	/* 4 RTL cont	*/	[	0,		3,		0x15,	0x15,	4,		0,		1	],
	/* 5 RTL+EN/AN	*/	[	0,		3,		5,		5,		4,		2,		0	]
];
var impTab_RTL = [
					/*		L,		R,		EN,		AN,		N,		IL,		Cond */
	/* 0 RTL text	*/	[	2,		0,		1,		1,		0,		1,		0	],
	/* 1 RTL+EN/AN	*/	[	2,		0,		1,		1,		0,		2,		0	],
	/* 2 LTR text	*/	[	2,		0,		2,		1,		3,		2,		0	],
	/* 3 LTR+cont	*/	[	2,		0,		2,		0x21,	3,		1,		1	]
];

var UBAT_L	= 0; /* left to right				*/
var UBAT_R	= 1; /* right to left				*/
var UBAT_EN = 2; /* European digit				*/
var UBAT_AN = 3; /* Arabic-Indic digit			*/
var UBAT_ON = 4; /* neutral						*/
var UBAT_B	= 5; /* block separator				*/
var UBAT_S	= 6; /* segment separator			*/
var UBAT_AL = 7; /* Arabic Letter				*/
var UBAT_WS = 8; /* white space					*/
var UBAT_CS = 9; /* common digit separator		*/
var UBAT_ES = 10; /* European digit separator	*/
var UBAT_ET = 11; /* European digit terminator	*/
var UBAT_NSM = 12; /* Non Spacing Mark			*/
var UBAT_LRE = 13; /* LRE						*/
var UBAT_RLE = 14; /* RLE						*/
var UBAT_PDF = 15; /* PDF						*/
var UBAT_LRO = 16; /* LRO						*/
var UBAT_RLO = 17; /* RLO						*/
var UBAT_BN	= 18; /* Boundary Neutral			*/

var TBBASE = 100;

var TB00 = TBBASE + 0;
var TB05 = TBBASE + 1;
var TB06 = TBBASE + 2;
var TB07 = TBBASE + 3;
var TB20 = TBBASE + 4;
var TBFB = TBBASE + 5;
var TBFE = TBBASE + 6;
var TBFF = TBBASE + 7;

var L	= UBAT_L;
var R	= UBAT_R;
var EN	= UBAT_EN;
var AN	= UBAT_AN;
var ON	= UBAT_ON;
var B	= UBAT_B;
var S	= UBAT_S;
var AL	= UBAT_AL;
var WS	= UBAT_WS;
var CS	= UBAT_CS;
var ES	= UBAT_ES;
var ET	= UBAT_ET;
var NSM	= UBAT_NSM;
var LRE	= UBAT_LRE;
var RLE	= UBAT_RLE;
var PDF	= UBAT_PDF;
var LRO	= UBAT_LRO;
var RLO	= UBAT_RLO;
var BN	= UBAT_BN;

var MasterTable = [
	/************************************************************************************************************************************/
	/*		0		1		2		3		4		5		6		7		8		9		A		B		C		D		E		F	*/
	/************************************************************************************************************************************/
	/*0-*/	TB00,	L	,	L	,	L	,	L	,	TB05,	TB06,	TB07,	R	,	L	,	L	,	L	,	L	,	L	,	L	,	L	,
	/*1-*/	L	,	L	,	L	,	L	,	L	,	L	,	L	,	L	,	L	,	L	,	L	,	L	,	L	,	L	,	L	,	L	,
	/*2-*/	TB20,	ON	,	ON	,	ON	,	L	,	ON	,	L	,	ON	,	L	,	ON	,	ON	,	ON	,	L	,	L	,	ON	,	ON	,
	/*3-*/	L	,	L	,	L	,	L	,	L	,	ON	,	ON	,	ON	,	ON	,	ON	,	ON	,	ON	,	ON	,	ON	,	ON	,	ON	,
	/*4-*/	ON	,	ON	,	ON	,	ON	,	ON	,	ON	,	ON	,	ON	,	ON	,	ON	,	ON	,	ON	,	ON	,	L	,	L	,	ON	,
	/*5-*/	ON	,	ON	,	ON	,	ON	,	ON	,	ON	,	ON	,	ON	,	ON	,	ON	,	ON	,	ON	,	ON	,	ON	,	ON	,	ON	,
	/*6-*/	ON	,	ON	,	ON	,	ON	,	ON	,	ON	,	ON	,	ON	,	ON	,	ON	,	ON	,	ON	,	ON	,	ON	,	ON	,	ON	,
	/*7-*/	ON	,	ON	,	ON	,	ON	,	ON	,	ON	,	ON	,	ON	,	ON	,	ON	,	ON	,	ON	,	ON	,	ON	,	ON	,	ON	,
	/*8-*/	ON	,	ON	,	ON	,	ON	,	ON	,	ON	,	ON	,	ON	,	ON	,	ON	,	ON	,	ON	,	ON	,	ON	,	ON	,	ON	,
	/*9-*/	ON	,	ON	,	ON	,	ON	,	ON	,	ON	,	ON	,	ON	,	ON	,	ON	,	ON	,	ON	,	ON	,	ON	,	ON	,	L	,
	/*A-*/	L	,	L	,	L	,	L	,	L	,	L	,	L	,	L	,	L	,	L	,	L	,	L	,	L	,	ON	,	ON	,	ON	,
	/*B-*/	ON	,	ON	,	ON	,	ON	,	ON	,	ON	,	ON	,	ON	,	ON	,	ON	,	ON	,	ON	,	ON	,	ON	,	ON	,	ON	,
	/*C-*/	ON	,	ON	,	ON	,	ON	,	ON	,	ON	,	ON	,	ON	,	ON	,	ON	,	ON	,	ON	,	ON	,	ON	,	ON	,	ON	,
	/*D-*/	ON	,	ON	,	ON	,	ON	,	ON	,	ON	,	ON	,	L	,	L	,	ON	,	ON	,	L	,	L	,	ON	,	ON	,	L	,
	/*E-*/	L	,	ON	,	ON	,	ON	,	ON	,	ON	,	ON	,	ON	,	ON	,	ON	,	ON	,	ON	,	ON	,	ON	,	ON	,	ON	,
	/*F-*/	ON	,	ON	,	ON	,	ON	,	ON	,	ON	,	ON	,	ON	,	L	,	L	,	L	,	TBFB,	AL	,	AL	,	TBFE,	TBFF
];

delete TB00;
delete TB05;
delete TB06;
delete TB07;
delete TB20;
delete TBFB;
delete TBFE;
delete TBFF;

var UnicodeTable = [
	[ /*	Table 00: Unicode 00xx */
	/************************************************************************************************************************************/
	/*		0		1		2		3		4		5		6		7		8		9		A		B		C		D		E		F	*/
	/************************************************************************************************************************************/
	/*0-*/	BN	,	BN	,	BN	,	BN	,	BN	,	BN	,	BN	,	BN	,	BN	,	S	,	B	,	S	,	WS	,	B	,	BN	,	BN	,
	/*1-*/	BN	,	BN	,	BN	,	BN	,	BN	,	BN	,	BN	,	BN	,	BN	,	BN	,	BN	,	BN	,	B	,	B	,	B	,	S	,
	/*2-*/	WS	,	ON	,	ON	,	ET	,	ET	,	ET	,	ON	,	ON	,	ON	,	ON	,	ON	,	ES	,	CS	,	ES	,	CS	,	CS	,
	/*3-*/	EN	,	EN	,	EN	,	EN	,	EN	,	EN	,	EN	,	EN	,	EN	,	EN	,	CS	,	ON	,	ON	,	ON	,	ON	,	ON	,
	/*4-*/	ON	,	L	,	L	,	L	,	L	,	L	,	L	,	L	,	L	,	L	,	L	,	L	,	L	,	L	,	L	,	L	,
	/*5-*/	L	,	L	,	L	,	L	,	L	,	L	,	L	,	L	,	L	,	L	,	L	,	ON	,	ON	,	ON	,	ON	,	ON	,
	/*6-*/	ON	,	L	,	L	,	L	,	L	,	L	,	L	,	L	,	L	,	L	,	L	,	L	,	L	,	L	,	L	,	L	,
	/*7-*/	L	,	L	,	L	,	L	,	L	,	L	,	L	,	L	,	L	,	L	,	L	,	ON	,	ON	,	ON	,	ON	,	BN	,
	/*8-*/	BN	,	BN	,	BN	,	BN	,	BN	,	B	,	BN	,	BN	,	BN	,	BN	,	BN	,	BN	,	BN	,	BN	,	BN	,	BN	,
	/*9-*/	BN	,	BN	,	BN	,	BN	,	BN	,	BN	,	BN	,	BN	,	BN	,	BN	,	BN	,	BN	,	BN	,	BN	,	BN	,	BN	,
	/*A-*/	CS	,	ON	,	ET	,	ET	,	ET	,	ET	,	ON	,	ON	,	ON	,	ON	,	L	,	ON	,	ON	,	BN	,	ON	,	ON	,
	/*B-*/	ET	,	ET	,	EN	,	EN	,	ON	,	L	,	ON	,	ON	,	ON	,	EN	,	L	,	ON	,	ON	,	ON	,	ON	,	ON	,
	/*C-*/	L	,	L	,	L	,	L	,	L	,	L	,	L	,	L	,	L	,	L	,	L	,	L	,	L	,	L	,	L	,	L	,
	/*D-*/	L	,	L	,	L	,	L	,	L	,	L	,	L	,	ON	,	L	,	L	,	L	,	L	,	L	,	L	,	L	,	L	,
	/*E-*/	L	,	L	,	L	,	L	,	L	,	L	,	L	,	L	,	L	,	L	,	L	,	L	,	L	,	L	,	L	,	L	,
	/*F-*/	L	,	L	,	L	,	L	,	L	,	L	,	L	,	ON	,	L	,	L	,	L	,	L	,	L	,	L	,	L	,	L
	],
	[ /*	Table 01: Unicode 05xx */
	/************************************************************************************************************************************/
	/*		0		1		2		3		4		5		6		7		8		9		A		B		C		D		E		F	*/
	/************************************************************************************************************************************/
	/*0-*/	L	,	L	,	L	,	L	,	L	,	L	,	L	,	L	,	L	,	L	,	L	,	L	,	L	,	L	,	L	,	L	,
	/*1-*/	L	,	L	,	L	,	L	,	L	,	L	,	L	,	L	,	L	,	L	,	L	,	L	,	L	,	L	,	L	,	L	,
	/*2-*/	L	,	L	,	L	,	L	,	L	,	L	,	L	,	L	,	ON	,	ON	,	ON	,	ON	,	ON	,	ON	 , ON	,	ON	,
	/*3-*/	ON	,	L	,	L	,	L	,	L	,	L	,	L	,	L	,	L	,	L	,	L	,	L	,	L	,	L	,	L	,	L	,
	/*4-*/	L	,	L	,	L	,	L	,	L	,	L	,	L	,	L	,	L	,	L	,	L	,	L	,	L	,	L	,	L	,	L	,
	/*5-*/	L	,	L	,	L	,	L	,	L	,	L	,	L	,	ON	,	ON	,	L	,	L	,	L	,	L	,	L	,	L	,	L	,
	/*6-*/	ON	,	L	,	L	,	L	,	L	,	L	,	L	,	L	,	L	,	L	,	L	,	L	,	L	,	L	,	L	,	L	,
	/*7-*/	L	,	L	,	L	,	L	,	L	,	L	,	L	,	L	,	L	,	L	,	L	,	L	,	L	,	L	,	L	,	L	,
	/*8-*/	L	,	L	,	L	,	L	,	L	,	L	,	L	,	L	,	ON	,	L	,	ON	,	ON	,	ON	,	ON	,	ON	,	ON	,
	/*9-*/	ON	,	NSM	,	NSM	,	NSM	,	NSM	,	NSM	,	NSM	,	NSM	,	NSM	,	NSM	,	NSM	,	NSM	,	NSM	,	NSM	,	NSM	,	NSM	,
	/*A-*/	NSM	,	NSM	,	NSM	,	NSM	,	NSM	,	NSM	,	NSM	,	NSM	,	NSM	,	NSM	,	NSM	,	NSM	,	NSM	,	NSM	,	NSM	,	NSM	,
	/*B-*/	NSM	,	NSM	,	NSM	,	NSM	,	NSM	,	NSM	,	NSM	,	NSM	,	NSM	,	NSM	,	NSM	,	NSM	,	NSM	,	NSM	,	R	,	NSM	,
	/*C-*/	R	,	NSM	,	NSM	,	R	,	NSM	,	NSM	,	R	,	NSM	,	ON	,	ON	,	ON	,	ON	,	ON	,	ON	,	ON	,	ON	,
	/*D-*/	R	,	R	,	R	,	R	,	R	,	R	,	R	,	R	,	R	,	R	,	R	,	R	,	R	,	R	,	R	,	R	,
	/*E-*/	R	,	R	,	R	,	R	,	R	,	R	,	R	,	R	,	R	,	R	,	R	,	ON	,	ON	,	ON	,	ON	,	ON	,
	/*F-*/	R	,	R	,	R	,	R	,	R	,	ON	,	ON	,	ON	,	ON	,	ON	,	ON	,	ON	,	ON	,	ON	,	ON	,	ON
	],
	[ /*	Table 02: Unicode 06xx */
	/************************************************************************************************************************************/
	/*		0		1		2		3		4		5		6		7		8		9		A		B		C		D		E		F	*/
	/************************************************************************************************************************************/
	/*0-*/	AN	,	AN	,	AN	,	AN	,	ON	,	ON	,	ON	,	ON	,	AL	,	ET	,	ET	,	AL	,	CS	,	AL	,	ON	,	ON	,
	/*1-*/	NSM	,	NSM	,	NSM	,	NSM	,	NSM	,	NSM	,	NSM	,	NSM	,	NSM	,	NSM	,	NSM	,	AL	,	ON	,	ON	,	AL	,	AL	,
	/*2-*/	AL	,	AL	,	AL	,	AL	,	AL	,	AL	,	AL	,	AL	,	AL	,	AL	,	AL	,	AL	,	AL	,	AL	,	AL	,	AL	,
	/*3-*/	AL	,	AL	,	AL	,	AL	,	AL	,	AL	,	AL	,	AL	,	AL	,	AL	,	AL	,	AL	,	AL	,	AL	,	AL	,	AL	,
	/*4-*/	AL	,	AL	,	AL	,	AL	,	AL	,	AL	,	AL	,	AL	,	AL	,	AL	,	AL	,	NSM	,	NSM	,	NSM	,	NSM	,	NSM	,
	/*5-*/	NSM	,	NSM	,	NSM	,	NSM	,	NSM	,	NSM	,	NSM	,	NSM	,	NSM	,	NSM	,	NSM	,	NSM	,	NSM	,	NSM	,	NSM	,	NSM	,
	/*6-*/	AN	,	AN	,	AN	,	AN	,	AN	,	AN	,	AN	,	AN	,	AN	,	AN	,	ET	,	AN	,	AN	,	AL	,	AL	,	AL	,
	/*7-*/	NSM	,	AL	,	AL	,	AL	,	AL	,	AL	,	AL	,	AL	,	AL	,	AL	,	AL	,	AL	,	AL	,	AL	,	AL	,	AL	,
	/*8-*/	AL	,	AL	,	AL	,	AL	,	AL	,	AL	,	AL	,	AL	,	AL	,	AL	,	AL	,	AL	,	AL	,	AL	,	AL	,	AL	,
	/*9-*/	AL	,	AL	,	AL	,	AL	,	AL	,	AL	,	AL	,	AL	,	AL	,	AL	,	AL	,	AL	,	AL	,	AL	,	AL	,	AL	,
	/*A-*/	AL	,	AL	,	AL	,	AL	,	AL	,	AL	,	AL	,	AL	,	AL	,	AL	,	AL	,	AL	,	AL	,	AL	,	AL	,	AL	,
	/*B-*/	AL	,	AL	,	AL	,	AL	,	AL	,	AL	,	AL	,	AL	,	AL	,	AL	,	AL	,	AL	,	AL	,	AL	,	AL	,	AL	,
	/*C-*/	AL	,	AL	,	AL	,	AL	,	AL	,	AL	,	AL	,	AL	,	AL	,	AL	,	AL	,	AL	,	AL	,	AL	,	AL	,	AL	,
	/*D-*/	AL	,	AL	,	AL	,	AL	,	AL	,	AL	,	NSM	,	NSM	,	NSM	,	NSM	,	NSM	,	NSM	,	NSM	,	AN	,	ON	,	NSM	,
	/*E-*/	NSM	,	NSM	,	NSM	,	NSM	,	NSM	,	AL	,	AL	,	NSM	,	NSM	,	ON	,	NSM	,	NSM	,	NSM	,	NSM	,	AL	,	AL	,
	/*F-*/	EN	,	EN	,	EN	,	EN	,	EN	,	EN	,	EN	,	EN	,	EN	,	EN	,	AL	,	AL	,	AL	,	AL	,	AL	,	AL
	],
	[	/*	Table	03:	Unicode	07xx	*/
	/************************************************************************************************************************************/
	/*		0		1		2		3		4		5		6		7		8		9		A		B		C		D		E		F	*/
	/************************************************************************************************************************************/
	/*0-*/	AL	,	AL	,	AL	,	AL	,	AL	,	AL	,	AL	,	AL	,	AL	,	AL	,	AL	,	AL	,	AL	,	AL	,	ON	,	AL	,
	/*1-*/	AL	,	NSM	,	AL	,	AL	,	AL	,	AL	,	AL	,	AL	,	AL	,	AL	,	AL	,	AL	,	AL	,	AL	,	AL	,	AL	,
	/*2-*/	AL	,	AL	,	AL	,	AL	,	AL	,	AL	,	AL	,	AL	,	AL	,	AL	,	AL	,	AL	,	AL	,	AL	,	AL	,	AL	,
	/*3-*/	NSM	,	NSM	,	NSM	,	NSM	,	NSM	,	NSM	,	NSM	,	NSM	,	NSM	,	NSM	,	NSM	,	NSM	,	NSM	,	NSM	,	NSM	,	NSM	,
	/*4-*/	NSM	,	NSM	,	NSM	,	NSM	,	NSM	,	NSM	,	NSM	,	NSM	,	NSM	,	NSM	,	NSM	,	ON	,	ON	,	AL	,	AL	,	AL	,
	/*5-*/	AL	,	AL	,	AL	,	AL	,	AL	,	AL	,	AL	,	AL	,	AL	,	AL	,	AL	,	AL	,	AL	,	AL	,	AL	,	AL	,
	/*6-*/	AL	,	AL	,	AL	,	AL	,	AL	,	AL	,	AL	,	AL	,	AL	,	AL	,	AL	,	AL	,	AL	,	AL	,	AL	,	AL	,
	/*7-*/	AL	,	AL	,	AL	,	AL	,	AL	,	AL	,	AL	,	AL	,	AL	,	AL	,	AL	,	AL	,	AL	,	AL	,	AL	,	AL	,
	/*8-*/	AL	,	AL	,	AL	,	AL	,	AL	,	AL	,	AL	,	AL	,	AL	,	AL	,	AL	,	AL	,	AL	,	AL	,	AL	,	AL	,
	/*9-*/	AL	,	AL	,	AL	,	AL	,	AL	,	AL	,	AL	,	AL	,	AL	,	AL	,	AL	,	AL	,	AL	,	AL	,	AL	,	AL	,
	/*A-*/	AL	,	AL	,	AL	,	AL	,	AL	,	AL	,	NSM	,	NSM	,	NSM	,	NSM	,	NSM	,	NSM	,	NSM	,	NSM	,	NSM	,	NSM	,
	/*B-*/	NSM	,	AL	,	ON	,	ON	,	ON	,	ON	,	ON	,	ON	,	ON	,	ON	,	ON	,	ON	,	ON	,	ON	,	ON	,	ON	,
	/*C-*/	R	,	R	,	R	,	R	,	R	,	R	,	R	,	R	,	R	,	R	,	R	,	R	,	R	,	R	,	R	,	R	,
	/*D-*/	R	,	R	,	R	,	R	,	R	,	R	,	R	,	R	,	R	,	R	,	R	,	R	,	R	,	R	,	R	,	R	,
	/*E-*/	R	,	R	,	R	,	R	,	R	,	R	,	R	,	R	,	R	,	R	,	R	,	NSM	,	NSM	,	NSM	,	NSM	,	NSM	,
	/*F-*/	NSM	,	NSM	,	NSM	,	NSM	,	R	,	R	,	ON	,	ON	,	ON	,	ON	,	R	,	ON	,	ON	,	ON	,	ON	,	ON
	],
	[	/*	Table	04:	Unicode	20xx	*/
	/************************************************************************************************************************************/
	/*		0		1		2		3		4		5		6		7		8		9		A		B		C		D		E		F	*/
	/************************************************************************************************************************************/
	/*0-*/	WS	,	WS	,	WS	,	WS	,	WS	,	WS	,	WS	,	WS	,	WS	,	WS	,	WS	,	BN	,	BN	,	BN	,	L	,	R	,
	/*1-*/	ON	,	ON	,	ON	,	ON	,	ON	,	ON	,	ON	,	ON	,	ON	,	ON	,	ON	,	ON	,	ON	,	ON	,	ON	,	ON	,
	/*2-*/	ON	,	ON	,	ON	,	ON	,	ON	,	ON	,	ON	,	ON	,	WS	,	B	,	LRE	,	RLE	,	PDF	,	LRO	,	RLO	,	CS	,
	/*3-*/	ET	,	ET	,	ET	,	ET	,	ET	,	ON	,	ON	,	ON	,	ON	,	ON	,	ON	,	ON	,	ON	,	ON	,	ON	,	ON	,
	/*4-*/	ON	,	ON	,	ON	,	ON	,	CS	,	ON	,	ON	,	ON	,	ON	,	ON	,	ON	,	ON	,	ON	,	ON	,	ON	,	ON	,
	/*5-*/	ON	,	ON	,	ON	,	ON	,	ON	,	ON	,	ON	,	ON	,	ON	,	ON	,	ON	,	ON	,	ON	,	ON	,	ON	,	WS	,
	/*6-*/	BN	,	BN	,	BN	,	BN	,	BN	,	ON	,	ON	,	ON	,	ON	,	ON	,	BN	,	BN	,	BN	,	BN	,	BN	,	BN	,
	/*7-*/	EN	,	L	,	ON	,	ON	,	EN	,	EN	,	EN	,	EN	,	EN	,	EN	,	ES	,	ES	,	ON	,	ON	,	ON	,	L	,
	/*8-*/	EN	,	EN	,	EN	,	EN	,	EN	,	EN	,	EN	,	EN	,	EN	,	EN	,	ES	,	ES	,	ON	,	ON	,	ON	,	ON	,
	/*9-*/	L	,	L	,	L	,	L	,	L	,	L	,	L	,	L	,	L	,	L	,	L	,	L	,	L	,	ON	,	ON	,	ON	,
	/*A-*/	ET	,	ET	,	ET	,	ET	,	ET	,	ET	,	ET	,	ET	,	ET	,	ET	,	ET	,	ET	,	ET	,	ET	,	ET	,	ET	,
	/*B-*/	ET	,	ET	,	ET	,	ET	,	ET	,	ET	,	ET	,	ET	,	ET	,	ET	,	ON	,	ON	,	ON	,	ON	,	ON	,	ON	,
	/*C-*/	ON	,	ON	,	ON	,	ON	,	ON	,	ON	,	ON	,	ON	,	ON	,	ON	,	ON	,	ON	,	ON	,	ON	,	ON	,	ON	,
	/*D-*/	NSM	,	NSM	,	NSM	,	NSM	,	NSM	,	NSM	,	NSM	,	NSM	,	NSM	,	NSM	,	NSM	,	NSM	,	NSM	,	NSM	,	NSM	,	NSM	,
	/*E-*/	NSM	,	NSM	,	NSM	,	NSM	,	NSM	,	NSM	,	NSM	,	NSM	,	NSM	,	NSM	,	NSM	,	NSM	,	NSM	,	NSM	,	NSM	,	NSM	,
	/*F-*/	NSM	,	ON	,	ON	,	ON	,	ON	,	ON	,	ON	,	ON	,	ON	,	ON	,	ON	,	ON	,	ON	,	ON	,	ON	,	ON
	],
	[	/*	Table	05:	Unicode	FBxx	*/
	/************************************************************************************************************************************/
	/*		0		1		2		3		4		5		6		7		8		9		A		B		C		D		E		F	*/
	/************************************************************************************************************************************/
	/*0-*/	L	,	L	,	L	,	L	,	L	,	L	,	L	,	ON	,	ON	,	ON	,	ON	,	ON	,	ON	,	ON	,	ON	,	ON	,
	/*1-*/	ON	,	ON	,	ON	,	L	,	L	,	L	,	L	,	L	,	ON	,	ON	,	ON	,	ON	,	ON	,	R	,	NSM	,	R	,
	/*2-*/	R	,	R	,	R	,	R	,	R	,	R	,	R	,	R	,	R	,	ES	,	R	,	R	,	R	,	R	,	R	,	R	,
	/*3-*/	R	,	R	,	R	,	R	,	R	,	R	,	R	,	ON	,	R	,	R	,	R	,	R	,	R	,	ON	,	R	,	ON	,
	/*4-*/	R	,	R	,	ON	,	R	,	R	,	ON	,	R	,	R	,	R	,	R	,	R	,	R	,	R	,	R	,	R	,	R	,
	/*5-*/	AL	,	AL	,	AL	,	AL	,	AL	,	AL	,	AL	,	AL	,	AL	,	AL	,	AL	,	AL	,	AL	,	AL	,	AL	,	AL	,
	/*6-*/	AL	,	AL	,	AL	,	AL	,	AL	,	AL	,	AL	,	AL	,	AL	,	AL	,	AL	,	AL	,	AL	,	AL	,	AL	,	AL	,
	/*7-*/	AL	,	AL	,	AL	,	AL	,	AL	,	AL	,	AL	,	AL	,	AL	,	AL	,	AL	,	AL	,	AL	,	AL	,	AL	,	AL	,
	/*8-*/	AL	,	AL	,	AL	,	AL	,	AL	,	AL	,	AL	,	AL	,	AL	,	AL	,	AL	,	AL	,	AL	,	AL	,	AL	,	AL	,
	/*9-*/	AL	,	AL	,	AL	,	AL	,	AL	,	AL	,	AL	,	AL	,	AL	,	AL	,	AL	,	AL	,	AL	,	AL	,	AL	,	AL	,
	/*A-*/	AL	,	AL	,	AL	,	AL	,	AL	,	AL	,	AL	,	AL	,	AL	,	AL	,	AL	,	AL	,	AL	,	AL	,	AL	,	AL	,
	/*B-*/	AL	,	AL	,	AL	,	AL	,	AL	,	AL	,	AL	,	AL	,	AL	,	AL	,	AL	,	AL	,	AL	,	AL	,	AL	,	AL	,
	/*C-*/	AL	,	AL	,	ON	,	ON	,	ON	,	ON	,	ON	,	ON	,	ON	,	ON	,	ON	,	ON	,	ON	,	ON	,	ON	,	ON	,
	/*D-*/	ON	,	ON	,	ON	,	AL	,	AL	,	AL	,	AL	,	AL	,	AL	,	AL	,	AL	,	AL	,	AL	,	AL	,	AL	,	AL	,
	/*E-*/	AL	,	AL	,	AL	,	AL	,	AL	,	AL	,	AL	,	AL	,	AL	,	AL	,	AL	,	AL	,	AL	,	AL	,	AL	,	AL	,
	/*F-*/	AL	,	AL	,	AL	,	AL	,	AL	,	AL	,	AL	,	AL	,	AL	,	AL	,	AL	,	AL	,	AL	,	AL	,	AL	,	AL
	],
	[	/*	Table	06:	Unicode	FExx	*/
	/************************************************************************************************************************************/
	/*		0		1		2		3		4		5		6		7		8		9		A		B		C		D		E		F	*/
	/************************************************************************************************************************************/
	/*0-*/	NSM	,	NSM	,	NSM	,	NSM	,	NSM	,	NSM	,	NSM	,	NSM	,	NSM	,	NSM	,	NSM	,	NSM	,	NSM	,	NSM	,	NSM	,	NSM	,
	/*1-*/	ON	,	ON	,	ON	,	ON	,	ON	,	ON	,	ON	,	ON	,	ON	,	ON	,	ON	,	ON	,	ON	,	ON	,	ON	,	ON	,
	/*2-*/	NSM	,	NSM	,	NSM	,	NSM	,	NSM	,	NSM	,	NSM	,	ON	,	ON	,	ON	,	ON	,	ON	,	ON	,	ON	,	ON	,	ON	,
	/*3-*/	ON	,	ON	,	ON	,	ON	,	ON	,	ON	,	ON	,	ON	,	ON	,	ON	,	ON	,	ON	,	ON	,	ON	,	ON	,	ON	,
	/*4-*/	ON	,	ON	,	ON	,	ON	,	ON	,	ON	,	ON	,	ON	,	ON	,	ON	,	ON	,	ON	,	ON	,	ON	,	ON	,	ON	,
	/*5-*/	CS	,	ON	,	CS	,	ON	,	ON	,	CS	,	ON	,	ON	,	ON	,	ON	,	ON	,	ON	,	ON	,	ON	,	ON	,	ET	,
	/*6-*/	ON	,	ON	,	ES	,	ES	,	ON	,	ON	,	ON	,	ON	,	ON	,	ET	,	ET	,	ON	,	ON	,	ON	,	ON	,	ON	,
	/*7-*/	AL	,	AL	,	AL	,	AL	,	AL	,	ON	,	AL	,	AL	,	AL	,	AL	,	AL	,	AL	,	AL	,	AL	,	AL	,	AL	,
	/*8-*/	AL	,	AL	,	AL	,	AL	,	AL	,	AL	,	AL	,	AL	,	AL	,	AL	,	AL	,	AL	,	AL	,	AL	,	AL	,	AL	,
	/*9-*/	AL	,	AL	,	AL	,	AL	,	AL	,	AL	,	AL	,	AL	,	AL	,	AL	,	AL	,	AL	,	AL	,	AL	,	AL	,	AL	,
	/*A-*/	AL	,	AL	,	AL	,	AL	,	AL	,	AL	,	AL	,	AL	,	AL	,	AL	,	AL	,	AL	,	AL	,	AL	,	AL	,	AL	,
	/*B-*/	AL	,	AL	,	AL	,	AL	,	AL	,	AL	,	AL	,	AL	,	AL	,	AL	,	AL	,	AL	,	AL	,	AL	,	AL	,	AL	,
	/*C-*/	AL	,	AL	,	AL	,	AL	,	AL	,	AL	,	AL	,	AL	,	AL	,	AL	,	AL	,	AL	,	AL	,	AL	,	AL	,	AL	,
	/*D-*/	AL	,	AL	,	AL	,	AL	,	AL	,	AL	,	AL	,	AL	,	AL	,	AL	,	AL	,	AL	,	AL	,	AL	,	AL	,	AL	,
	/*E-*/	AL	,	AL	,	AL	,	AL	,	AL	,	AL	,	AL	,	AL	,	AL	,	AL	,	AL	,	AL	,	AL	,	AL	,	AL	,	AL	,
	/*F-*/	AL	,	AL	,	AL	,	AL	,	AL	,	AL	,	AL	,	AL	,	AL	,	AL	,	AL	,	AL	,	AL	,	ON	,	ON	,	BN
	],
	[	/*	Table	07:	Unicode	FFxx	*/
	/************************************************************************************************************************************/
	/*		0		1		2		3		4		5		6		7		8		9		A		B		C		D		E		F	*/
	/************************************************************************************************************************************/
	/*0-*/	ON	,	ON	,	ON	,	ET	,	ET	,	ET	,	ON	,	ON	,	ON	,	ON	,	ON	,	ES	,	CS	,	ES	,	CS	,	CS	,
	/*1-*/	EN	,	EN	,	EN	,	EN	,	EN	,	EN	,	EN	,	EN	,	EN	,	EN	,	CS	,	ON	,	ON	,	ON	,	ON	,	ON	,
	/*2-*/	ON	,	L	,	L	,	L	,	L	,	L	,	L	,	L	,	L	,	L	,	L	,	L	,	L	,	L	,	L	,	L	,
	/*3-*/	L	,	L	,	L	,	L	,	L	,	L	,	L	,	L	,	L	,	L	,	L	,	ON	,	ON	,	ON	,	ON	,	ON	,
	/*4-*/	ON	,	L	,	L	,	L	,	L	,	L	,	L	,	L	,	L	,	L	,	L	,	L	,	L	,	L	,	L	,	L	,
	/*5-*/	L	,	L	,	L	,	L	,	L	,	L	,	L	,	L	,	L	,	L	,	L	,	ON	,	ON	,	ON	,	ON	,	ON	,
	/*6-*/	ON	,	ON	,	ON	,	ON	,	ON	,	ON	,	L	,	L	,	L	,	L	,	L	,	L	,	L	,	L	,	L	,	L	,
	/*7-*/	L	,	L	,	L	,	L	,	L	,	L	,	L	,	L	,	L	,	L	,	L	,	L	,	L	,	L	,	L	,	L	,
	/*8-*/	L	,	L	,	L	,	L	,	L	,	L	,	L	,	L	,	L	,	L	,	L	,	L	,	L	,	L	,	L	,	L	,
	/*9-*/	L	,	L	,	L	,	L	,	L	,	L	,	L	,	L	,	L	,	L	,	L	,	L	,	L	,	L	,	L	,	L	,
	/*A-*/	L	,	L	,	L	,	L	,	L	,	L	,	L	,	L	,	L	,	L	,	L	,	L	,	L	,	L	,	L	,	L	,
	/*B-*/	L	,	L	,	L	,	L	,	L	,	L	,	L	,	L	,	L	,	L	,	L	,	L	,	L	,	L	,	L	,	ON	,
	/*C-*/	ON	,	ON	,	L	,	L	,	L	,	L	,	L	,	L	,	ON	,	ON	,	L	,	L	,	L	,	L	,	L	,	L	,
	/*D-*/	ON	,	ON	,	L	,	L	,	L	,	L	,	L	,	L	,	ON	,	ON	,	L	,	L	,	L	,	ON	,	ON	,	ON	,
	/*E-*/	ET	,	ET	,	ON	,	ON	,	ON	,	ET	,	ET	,	ON	,	ON	,	ON	,	ON	,	ON	,	ON	,	ON	,	ON	,	ON	,
	/*F-*/	ON	,	ON	,	ON	,	ON	,	ON	,	ON	,	ON	,	ON	,	ON	,	ON	,	ON	,	ON	,	ON	,	ON	,	ON	,	ON
	]
];

delete L;
delete R;
delete EN;
delete AN;
delete ON;
delete B;
delete S;
delete AL;
delete WS;
delete CS;
delete ES;
delete ET;
delete NSM;
delete LRE;
delete RLE;
delete PDF;
delete LRO;
delete RLO;
delete BN;

return dojox.string.BidiEngine;
});

},
'dojox/gfx/path':function(){
define("dojox/gfx/path", ["./_base", "dojo/_base/lang","dojo/_base/declare", "./matrix", "./shape"], 
	function(g, lang, declare, matrix, shapeLib){
// summary:
//		This module contains the core graphics Path API.
//		Path command format follows the W3C SVG 1.0 Path api.

	var Path = declare("dojox.gfx.path.Path", shapeLib.Shape, {
		// summary:
		//		a generalized path shape

		constructor: function(rawNode){
			// summary:
			//		a path constructor
			// rawNode: Node
			//		a DOM node to be used by this path object
			this.shape = lang.clone(g.defaultPath);
			this.segments = [];
			this.tbbox = null;
			this.absolute = true;
			this.last = {};
			this.rawNode = rawNode;
			this.segmented = false;
		},

		// mode manipulations
		setAbsoluteMode: function(mode){
			// summary:
			//		sets an absolute or relative mode for path points
			// mode: Boolean
			//		true/false or "absolute"/"relative" to specify the mode
			this._confirmSegmented();
			this.absolute = typeof mode == "string" ? (mode == "absolute") : mode;
			return this; // self
		},
		getAbsoluteMode: function(){
			// summary:
			//		returns a current value of the absolute mode
			this._confirmSegmented();
			return this.absolute; // Boolean
		},

		getBoundingBox: function(){
			// summary:
			//		returns the bounding box {x, y, width, height} or null
			this._confirmSegmented();
			return (this.bbox && ("l" in this.bbox)) ? {x: this.bbox.l, y: this.bbox.t, width: this.bbox.r - this.bbox.l, height: this.bbox.b - this.bbox.t} : null; // dojox/gfx.Rectangle
		},

		_getRealBBox: function(){
			// summary:
			//		returns an array of four points or null
			//		four points represent four corners of the untransformed bounding box
			this._confirmSegmented();
			if(this.tbbox){
				return this.tbbox;	// Array
			}
			var bbox = this.bbox, matrix = this._getRealMatrix();
			this.bbox = null;
			for(var i = 0, len = this.segments.length; i < len; ++i){
				this._updateWithSegment(this.segments[i], matrix);
			}
			var t = this.bbox;
			this.bbox = bbox;
			this.tbbox = t ? [
				{x: t.l, y: t.t},
				{x: t.r, y: t.t},
				{x: t.r, y: t.b},
				{x: t.l, y: t.b}
			] : null;
			return this.tbbox;	// Array
		},

		getLastPosition: function(){
			// summary:
			//		returns the last point in the path, or null
			this._confirmSegmented();
			return "x" in this.last ? this.last : null; // Object
		},

		_applyTransform: function(){
			this.tbbox = null;
			return this.inherited(arguments);
		},

		// segment interpretation
		_updateBBox: function(x, y, m){
			// summary:
			//		updates the bounding box of path with new point
			// x: Number
			//		an x coordinate
			// y: Number
			//		a y coordinate

			if(m){
				var t = matrix.multiplyPoint(m, x, y);
				x = t.x;
				y = t.y;
			}

			// we use {l, b, r, t} representation of a bbox
			if(this.bbox && ("l" in this.bbox)){
				if(this.bbox.l > x) this.bbox.l = x;
				if(this.bbox.r < x) this.bbox.r = x;
				if(this.bbox.t > y) this.bbox.t = y;
				if(this.bbox.b < y) this.bbox.b = y;
			}else{
				this.bbox = {l: x, b: y, r: x, t: y};
			}
		},
		_updateWithSegment: function(segment, matrix){
			// summary:
			//		updates the bounding box of path with new segment
			// segment: Object
			//		a segment
			var n = segment.args, l = n.length, i;
			// update internal variables: bbox, absolute, last
			switch(segment.action){
				case "M":
				case "L":
				case "C":
				case "S":
				case "Q":
				case "T":
					for(i = 0; i < l; i += 2){
						this._updateBBox(n[i], n[i + 1], matrix);
					}
					this.last.x = n[l - 2];
					this.last.y = n[l - 1];
					this.absolute = true;
					break;
				case "H":
					for(i = 0; i < l; ++i){
						this._updateBBox(n[i], this.last.y, matrix);
					}
					this.last.x = n[l - 1];
					this.absolute = true;
					break;
				case "V":
					for(i = 0; i < l; ++i){
						this._updateBBox(this.last.x, n[i], matrix);
					}
					this.last.y = n[l - 1];
					this.absolute = true;
					break;
				case "m":
					var start = 0;
					if(!("x" in this.last)){
						this._updateBBox(this.last.x = n[0], this.last.y = n[1], matrix);
						start = 2;
					}
					for(i = start; i < l; i += 2){
						this._updateBBox(this.last.x += n[i], this.last.y += n[i + 1], matrix);
					}
					this.absolute = false;
					break;
				case "l":
				case "t":
					for(i = 0; i < l; i += 2){
						this._updateBBox(this.last.x += n[i], this.last.y += n[i + 1], matrix);
					}
					this.absolute = false;
					break;
				case "h":
					for(i = 0; i < l; ++i){
						this._updateBBox(this.last.x += n[i], this.last.y, matrix);
					}
					this.absolute = false;
					break;
				case "v":
					for(i = 0; i < l; ++i){
						this._updateBBox(this.last.x, this.last.y += n[i], matrix);
					}
					this.absolute = false;
					break;
				case "c":
					for(i = 0; i < l; i += 6){
						this._updateBBox(this.last.x + n[i], this.last.y + n[i + 1], matrix);
						this._updateBBox(this.last.x + n[i + 2], this.last.y + n[i + 3], matrix);
						this._updateBBox(this.last.x += n[i + 4], this.last.y += n[i + 5], matrix);
					}
					this.absolute = false;
					break;
				case "s":
				case "q":
					for(i = 0; i < l; i += 4){
						this._updateBBox(this.last.x + n[i], this.last.y + n[i + 1], matrix);
						this._updateBBox(this.last.x += n[i + 2], this.last.y += n[i + 3], matrix);
					}
					this.absolute = false;
					break;
				case "A":
					for(i = 0; i < l; i += 7){
						this._updateBBox(n[i + 5], n[i + 6], matrix);
					}
					this.last.x = n[l - 2];
					this.last.y = n[l - 1];
					this.absolute = true;
					break;
				case "a":
					for(i = 0; i < l; i += 7){
						this._updateBBox(this.last.x += n[i + 5], this.last.y += n[i + 6], matrix);
					}
					this.absolute = false;
					break;
			}
			// add an SVG path segment
			var path = [segment.action];
			for(i = 0; i < l; ++i){
				path.push(g.formatNumber(n[i], true));
			}
			if(typeof this.shape.path == "string"){
				this.shape.path += path.join("");
			}else{
				Array.prototype.push.apply(this.shape.path, path); //FIXME: why not simple push()?
			}
		},

		// a dictionary, which maps segment type codes to a number of their arguments
		_validSegments: {m: 2, l: 2, h: 1, v: 1, c: 6, s: 4, q: 4, t: 2, a: 7, z: 0},

		_pushSegment: function(action, args){
			// summary:
			//		adds a segment
			// action: String
			//		valid SVG code for a segment's type
			// args: Array
			//		a list of parameters for this segment
			this.tbbox = null;
			var group = this._validSegments[action.toLowerCase()], segment;
			if(typeof group == "number"){
				if(group){
					if(args.length >= group){
						segment = {action: action, args: args.slice(0, args.length - args.length % group)};
						this.segments.push(segment);
						this._updateWithSegment(segment);
					}
				}else{
					segment = {action: action, args: []};
					this.segments.push(segment);
					this._updateWithSegment(segment);
				}
			}
		},

		_collectArgs: function(array, args){
			// summary:
			//		converts an array of arguments to plain numeric values
			// array: Array
			//		an output argument (array of numbers)
			// args: Array
			//		an input argument (can be values of Boolean, Number, dojox/gfx.Point, or an embedded array of them)
			for(var i = 0; i < args.length; ++i){
				var t = args[i];
				if(typeof t == "boolean"){
					array.push(t ? 1 : 0);
				}else if(typeof t == "number"){
					array.push(t);
				}else if(t instanceof Array){
					this._collectArgs(array, t);
				}else if("x" in t && "y" in t){
					array.push(t.x, t.y);
				}
			}
		},

		// segments
		moveTo: function(){
			// summary:
			//		forms a move segment
			this._confirmSegmented();
			var args = [];
			this._collectArgs(args, arguments);
			this._pushSegment(this.absolute ? "M" : "m", args);
			return this; // self
		},
		lineTo: function(){
			// summary:
			//		forms a line segment
			this._confirmSegmented();
			var args = [];
			this._collectArgs(args, arguments);
			this._pushSegment(this.absolute ? "L" : "l", args);
			return this; // self
		},
		hLineTo: function(){
			// summary:
			//		forms a horizontal line segment
			this._confirmSegmented();
			var args = [];
			this._collectArgs(args, arguments);
			this._pushSegment(this.absolute ? "H" : "h", args);
			return this; // self
		},
		vLineTo: function(){
			// summary:
			//		forms a vertical line segment
			this._confirmSegmented();
			var args = [];
			this._collectArgs(args, arguments);
			this._pushSegment(this.absolute ? "V" : "v", args);
			return this; // self
		},
		curveTo: function(){
			// summary:
			//		forms a curve segment
			this._confirmSegmented();
			var args = [];
			this._collectArgs(args, arguments);
			this._pushSegment(this.absolute ? "C" : "c", args);
			return this; // self
		},
		smoothCurveTo: function(){
			// summary:
			//		forms a smooth curve segment
			this._confirmSegmented();
			var args = [];
			this._collectArgs(args, arguments);
			this._pushSegment(this.absolute ? "S" : "s", args);
			return this; // self
		},
		qCurveTo: function(){
			// summary:
			//		forms a quadratic curve segment
			this._confirmSegmented();
			var args = [];
			this._collectArgs(args, arguments);
			this._pushSegment(this.absolute ? "Q" : "q", args);
			return this; // self
		},
		qSmoothCurveTo: function(){
			// summary:
			//		forms a quadratic smooth curve segment
			this._confirmSegmented();
			var args = [];
			this._collectArgs(args, arguments);
			this._pushSegment(this.absolute ? "T" : "t", args);
			return this; // self
		},
		arcTo: function(){
			// summary:
			//		forms an elliptic arc segment
			this._confirmSegmented();
			var args = [];
			this._collectArgs(args, arguments);
			this._pushSegment(this.absolute ? "A" : "a", args);
			return this; // self
		},
		closePath: function(){
			// summary:
			//		closes a path
			this._confirmSegmented();
			this._pushSegment("Z", []);
			return this; // self
		},

		_confirmSegmented: function() {
			if (!this.segmented) {
				var path = this.shape.path;
				// switch to non-updating version of path building
				this.shape.path = [];
				this._setPath(path);
				// switch back to the string path
				this.shape.path = this.shape.path.join("");
				// become segmented
				this.segmented = true;
			}
		},

		// setShape
		_setPath: function(path){
			// summary:
			//		forms a path using an SVG path string
			// path: String
			//		an SVG path string
			var p = lang.isArray(path) ? path : path.match(g.pathSvgRegExp);
			this.segments = [];
			this.absolute = true;
			this.bbox = {};
			this.last = {};
			if(!p) return;
			// create segments
			var action = "",	// current action
				args = [],		// current arguments
				l = p.length;
			for(var i = 0; i < l; ++i){
				var t = p[i], x = parseFloat(t);
				if(isNaN(x)){
					if(action){
						this._pushSegment(action, args);
					}
					args = [];
					action = t;
				}else{
					args.push(x);
				}
			}
			this._pushSegment(action, args);
		},
		setShape: function(newShape){
			// summary:
			//		forms a path using a shape
			// newShape: Object
			//		an SVG path string or a path object (see dojox/gfx.defaultPath)
			this.inherited(arguments, [typeof newShape == "string" ? {path: newShape} : newShape]);

			this.segmented = false;
			this.segments = [];
			if(!g.lazyPathSegmentation){
				this._confirmSegmented();
			}
			return this; // self
		},

		// useful constant for descendants
		_2PI: Math.PI * 2
	});

	var TextPath = declare("dojox.gfx.path.TextPath", Path, {
		// summary:
		//		a generalized TextPath shape

		constructor: function(rawNode){
			// summary:
			//		a TextPath shape constructor
			// rawNode: Node
			//		a DOM node to be used by this TextPath object
			if(!("text" in this)){
				this.text = lang.clone(g.defaultTextPath);
			}
			if(!("fontStyle" in this)){
				this.fontStyle = lang.clone(g.defaultFont);
			}
		},
		getText: function(){
			// summary:
			//		returns the current text object or null
			return this.text;	// Object
		},
		setText: function(newText){
			// summary:
			//		sets a text to be drawn along the path
			this.text = g.makeParameters(this.text,
				typeof newText == "string" ? {text: newText} : newText);
			this._setText();
			return this;	// self
		},
		getFont: function(){
			// summary:
			//		returns the current font object or null
			return this.fontStyle;	// Object
		},
		setFont: function(newFont){
			// summary:
			//		sets a font for text
			this.fontStyle = typeof newFont == "string" ?
				g.splitFontString(newFont) :
				g.makeParameters(g.defaultFont, newFont);
			this._setFont();
			return this;	// self
		}
	});

	return g.path = { // our hash of newly defined objects
		Path: Path,
		TextPath: TextPath
	};
});

},
'dojox/gfx/svg':function(){
define("dojox/gfx/svg", ["dojo/_base/lang", "dojo/_base/window", "dojo/dom", "dojo/_base/declare", "dojo/_base/array",
  "dojo/dom-geometry", "dojo/dom-attr", "dojo/_base/Color", "./_base", "./shape", "./path"],
function(lang, win, dom, declare, arr, domGeom, domAttr, Color, g, gs, pathLib){

	var svg = g.svg = {
		// summary:
		//		This the graphics rendering bridge for browsers compliant with W3C SVG1.0.
		//		This is the preferred renderer to use for interactive and accessible graphics.
	};
	svg.useSvgWeb = (typeof window.svgweb != "undefined");

	// Need to detect iOS in order to workaround bug when
	// touching nodes with text
	var uagent = navigator.userAgent.toLowerCase(),
		safMobile = uagent.search('iphone') > -1 ||
					uagent.search('ipad') > -1 ||
					uagent.search('ipod') > -1;

	function _createElementNS(ns, nodeType){
		// summary:
		//		Internal helper to deal with creating elements that
		//		are namespaced.  Mainly to get SVG markup output
		//		working on IE.
		if(win.doc.createElementNS){
			return win.doc.createElementNS(ns,nodeType);
		}else{
			return win.doc.createElement(nodeType);
		}
	}
	
	function _setAttributeNS(node, ns, attr, value){
		if(node.setAttributeNS){
			return node.setAttributeNS(ns, attr, value);
		}else{
			return node.setAttribute(attr, value);
		}
	}

	function _createTextNode(text){
		if(svg.useSvgWeb){
			return win.doc.createTextNode(text, true);
		}else{
			return win.doc.createTextNode(text);
		}
	}

	function _createFragment(){
		if(svg.useSvgWeb){
			return win.doc.createDocumentFragment(true);
		}else{
			return win.doc.createDocumentFragment();
		}
	}

	svg.xmlns = {
		xlink: "http://www.w3.org/1999/xlink",
		svg:   "http://www.w3.org/2000/svg"
	};

	svg.getRef = function(name){
		// summary:
		//		looks up a node by its external name
		// name: String
		//		an SVG external reference
		// returns:
		//      returns a DOM Node specified by the name argument or null
		if(!name || name == "none") return null;
		if(name.match(/^url\(#.+\)$/)){
			return dom.byId(name.slice(5, -1));	// Node
		}
		// alternative representation of a reference
		if(name.match(/^#dojoUnique\d+$/)){
			// we assume here that a reference was generated by dojox/gfx
			return dom.byId(name.slice(1));	// Node
		}
		return null;	// Node
	};

	svg.dasharray = {
		solid:				"none",
		shortdash:			[4, 1],
		shortdot:			[1, 1],
		shortdashdot:		[4, 1, 1, 1],
		shortdashdotdot:	[4, 1, 1, 1, 1, 1],
		dot:				[1, 3],
		dash:				[4, 3],
		longdash:			[8, 3],
		dashdot:			[4, 3, 1, 3],
		longdashdot:		[8, 3, 1, 3],
		longdashdotdot:		[8, 3, 1, 3, 1, 3]
	};

	var clipCount = 0;

	svg.Shape = declare("dojox.gfx.svg.Shape", gs.Shape, {
		// summary:
		//		SVG-specific implementation of dojox/gfx/shape.Shape methods

		destroy: function(){
			if(this.fillStyle && "type" in this.fillStyle){
				var fill = this.rawNode.getAttribute("fill"),
					ref  = svg.getRef(fill);
				if(ref){
					ref.parentNode.removeChild(ref);
				}
			}
			if(this.clip){
				var clipPathProp = this.rawNode.getAttribute("clip-path");
				if(clipPathProp){
					var clipNode = dom.byId(clipPathProp.match(/gfx_clip[\d]+/)[0]);
					clipNode && clipNode.parentNode.removeChild(clipNode);
				}
			}
			this.rawNode = null;
			gs.Shape.prototype.destroy.apply(this, arguments);
		},

		setFill: function(fill){
			// summary:
			//		sets a fill object (SVG)
			// fill: Object
			//		a fill object
			//		(see dojox/gfx.defaultLinearGradient,
			//		dojox/gfx.defaultRadialGradient,
			//		dojox/gfx.defaultPattern,
			//		or dojo/_base/Color)

			if(!fill){
				// don't fill
				this.fillStyle = null;
				this.rawNode.setAttribute("fill", "none");
				this.rawNode.setAttribute("fill-opacity", 0);
				return this;
			}
			var f;
			// FIXME: slightly magical. We're using the outer scope's "f", but setting it later
			var setter = function(x){
					// we assume that we're executing in the scope of the node to mutate
					this.setAttribute(x, f[x].toFixed(8));
				};
			if(typeof(fill) == "object" && "type" in fill){
				// gradient
				switch(fill.type){
					case "linear":
						f = g.makeParameters(g.defaultLinearGradient, fill);
						var gradient = this._setFillObject(f, "linearGradient");
						arr.forEach(["x1", "y1", "x2", "y2"], setter, gradient);
						break;
					case "radial":
						f = g.makeParameters(g.defaultRadialGradient, fill);
						var grad = this._setFillObject(f, "radialGradient");
						arr.forEach(["cx", "cy", "r"], setter, grad);
						break;
					case "pattern":
						f = g.makeParameters(g.defaultPattern, fill);
						var pattern = this._setFillObject(f, "pattern");
						arr.forEach(["x", "y", "width", "height"], setter, pattern);
						break;
				}
				this.fillStyle = f;
				return this;
			}
			// color object
			f = g.normalizeColor(fill);
			this.fillStyle = f;
			this.rawNode.setAttribute("fill", f.toCss());
			this.rawNode.setAttribute("fill-opacity", f.a);
			this.rawNode.setAttribute("fill-rule", "evenodd");
			return this;	// self
		},

		setStroke: function(stroke){
			// summary:
			//		sets a stroke object (SVG)
			// stroke: Object
			//		a stroke object (see dojox/gfx.defaultStroke)

			var rn = this.rawNode;
			if(!stroke){
				// don't stroke
				this.strokeStyle = null;
				rn.setAttribute("stroke", "none");
				rn.setAttribute("stroke-opacity", 0);
				return this;
			}
			// normalize the stroke
			if(typeof stroke == "string" || lang.isArray(stroke) || stroke instanceof Color){
				stroke = { color: stroke };
			}
			var s = this.strokeStyle = g.makeParameters(g.defaultStroke, stroke);
			s.color = g.normalizeColor(s.color);
			// generate attributes
			if(s){
				rn.setAttribute("stroke", s.color.toCss());
				rn.setAttribute("stroke-opacity", s.color.a);
				rn.setAttribute("stroke-width",   s.width);
				rn.setAttribute("stroke-linecap", s.cap);
				if(typeof s.join == "number"){
					rn.setAttribute("stroke-linejoin",   "miter");
					rn.setAttribute("stroke-miterlimit", s.join);
				}else{
					rn.setAttribute("stroke-linejoin",   s.join);
				}
				var da = s.style.toLowerCase();
				if(da in svg.dasharray){
					da = svg.dasharray[da];
				}
				if(da instanceof Array){
					da = lang._toArray(da);
					for(var i = 0; i < da.length; ++i){
						da[i] *= s.width;
					}
					if(s.cap != "butt"){
						for(var i = 0; i < da.length; i += 2){
							da[i] -= s.width;
							if(da[i] < 1){ da[i] = 1; }
						}
						for(var i = 1; i < da.length; i += 2){
							da[i] += s.width;
						}
					}
					da = da.join(",");
				}
				rn.setAttribute("stroke-dasharray", da);
				rn.setAttribute("dojoGfxStrokeStyle", s.style);
			}
			return this;	// self
		},

		_getParentSurface: function(){
			var surface = this.parent;
			for(; surface && !(surface instanceof g.Surface); surface = surface.parent);
			return surface;
		},

		_setFillObject: function(f, nodeType){
			var svgns = svg.xmlns.svg;
			this.fillStyle = f;
			var surface = this._getParentSurface(),
				defs = surface.defNode,
				fill = this.rawNode.getAttribute("fill"),
				ref  = svg.getRef(fill);
			if(ref){
				fill = ref;
				if(fill.tagName.toLowerCase() != nodeType.toLowerCase()){
					var id = fill.id;
					fill.parentNode.removeChild(fill);
					fill = _createElementNS(svgns, nodeType);
					fill.setAttribute("id", id);
					defs.appendChild(fill);
				}else{
					while(fill.childNodes.length){
						fill.removeChild(fill.lastChild);
					}
				}
			}else{
				fill = _createElementNS(svgns, nodeType);
				fill.setAttribute("id", g._base._getUniqueId());
				defs.appendChild(fill);
			}
			if(nodeType == "pattern"){
				fill.setAttribute("patternUnits", "userSpaceOnUse");
				var img = _createElementNS(svgns, "image");
				img.setAttribute("x", 0);
				img.setAttribute("y", 0);
				img.setAttribute("width",  f.width .toFixed(8));
				img.setAttribute("height", f.height.toFixed(8));
				_setAttributeNS(img, svg.xmlns.xlink, "xlink:href", f.src);
				fill.appendChild(img);
			}else{
				fill.setAttribute("gradientUnits", "userSpaceOnUse");
				for(var i = 0; i < f.colors.length; ++i){
					var c = f.colors[i], t = _createElementNS(svgns, "stop"),
						cc = c.color = g.normalizeColor(c.color);
					t.setAttribute("offset",       c.offset.toFixed(8));
					t.setAttribute("stop-color",   cc.toCss());
					t.setAttribute("stop-opacity", cc.a);
					fill.appendChild(t);
				}
			}
			this.rawNode.setAttribute("fill", "url(#" + fill.getAttribute("id") +")");
			this.rawNode.removeAttribute("fill-opacity");
			this.rawNode.setAttribute("fill-rule", "evenodd");
			return fill;
		},

		_applyTransform: function() {
			var matrix = this.matrix;
			if(matrix){
				var tm = this.matrix;
				this.rawNode.setAttribute("transform", "matrix(" +
					tm.xx.toFixed(8) + "," + tm.yx.toFixed(8) + "," +
					tm.xy.toFixed(8) + "," + tm.yy.toFixed(8) + "," +
					tm.dx.toFixed(8) + "," + tm.dy.toFixed(8) + ")");
			}else{
				this.rawNode.removeAttribute("transform");
			}
			return this;
		},

		setRawNode: function(rawNode){
			// summary:
			//		assigns and clears the underlying node that will represent this
			//		shape. Once set, transforms, gradients, etc, can be applied.
			//		(no fill & stroke by default)
			var r = this.rawNode = rawNode;
			if(this.shape.type!="image"){
				r.setAttribute("fill", "none");
			}
			r.setAttribute("fill-opacity", 0);
			r.setAttribute("stroke", "none");
			r.setAttribute("stroke-opacity", 0);
			r.setAttribute("stroke-width", 1);
			r.setAttribute("stroke-linecap", "butt");
			r.setAttribute("stroke-linejoin", "miter");
			r.setAttribute("stroke-miterlimit", 4);
			// Bind GFX object with SVG node for ease of retrieval - that is to
			// save code/performance to keep this association elsewhere
			r.__gfxObject__ = this.getUID();
		},

		setShape: function(newShape){
			// summary:
			//		sets a shape object (SVG)
			// newShape: Object
			//		a shape object
			//		(see dojox/gfx.defaultPath,
			//		dojox/gfx.defaultPolyline,
			//		dojox/gfx.defaultRect,
			//		dojox/gfx.defaultEllipse,
			//		dojox/gfx.defaultCircle,
			//		dojox/gfx.defaultLine,
			//		or dojox/gfx.defaultImage)
			this.shape = g.makeParameters(this.shape, newShape);
			for(var i in this.shape){
				if(i != "type"){
					this.rawNode.setAttribute(i, this.shape[i]);
				}
			}
			this.bbox = null;
			return this;	// self
		},

		// move family

		_moveToFront: function(){
			// summary:
			//		moves a shape to front of its parent's list of shapes (SVG)
			this.rawNode.parentNode.appendChild(this.rawNode);
			return this;	// self
		},
		_moveToBack: function(){
			// summary:
			//		moves a shape to back of its parent's list of shapes (SVG)
			this.rawNode.parentNode.insertBefore(this.rawNode, this.rawNode.parentNode.firstChild);
			return this;	// self
		},
		setClip: function(clip){
			// summary:
			//		sets the clipping area of this shape.
			// description:
			//		This method overrides the dojox/gfx/shape.Shape.setClip() method.
			// clip: Object
			//		an object that defines the clipping geometry, or null to remove clip.
			this.inherited(arguments);
			var clipType = clip ? "width" in clip ? "rect" : 
							"cx" in clip ? "ellipse" : 
							"points" in clip ? "polyline" : "d" in clip ? "path" : null : null;
			if(clip && !clipType){
				return this;
			}
			if(clipType === "polyline"){
				clip = lang.clone(clip);
				clip.points = clip.points.join(",");
			}
			var clipNode, clipShape,
				clipPathProp = domAttr.get(this.rawNode, "clip-path");
			if(clipPathProp){
				clipNode = dom.byId(clipPathProp.match(/gfx_clip[\d]+/)[0]);
				if(clipNode){ // may be null if not in the DOM anymore
					clipNode.removeChild(clipNode.childNodes[0]);
				}
			}
			if(clip){
				if(clipNode){
					clipShape = _createElementNS(svg.xmlns.svg, clipType);
					clipNode.appendChild(clipShape);
				}else{
					var idIndex = ++clipCount;
					var clipId = "gfx_clip" + idIndex;
					var clipUrl = "url(#" + clipId + ")";
					this.rawNode.setAttribute("clip-path", clipUrl);
					clipNode = _createElementNS(svg.xmlns.svg, "clipPath");
					clipShape = _createElementNS(svg.xmlns.svg, clipType);
					clipNode.appendChild(clipShape);
					this.rawNode.parentNode.appendChild(clipNode);
					domAttr.set(clipNode, "id", clipId);
				}
				domAttr.set(clipShape, clip);
			}else{
				//remove clip-path
				this.rawNode.removeAttribute("clip-path");
				if(clipNode){
					clipNode.parentNode.removeChild(clipNode);
				}
			}
			return this;
		},
		_removeClipNode: function(){
			var clipNode, clipPathProp = domAttr.get(this.rawNode, "clip-path");
			if(clipPathProp){
				clipNode = dom.byId(clipPathProp.match(/gfx_clip[\d]+/)[0]);
				if(clipNode){
					clipNode.parentNode.removeChild(clipNode);
				}
			}
			return clipNode;
		}
	});


	svg.Group = declare("dojox.gfx.svg.Group", svg.Shape, {
		// summary:
		//		a group shape (SVG), which can be used
		//		to logically group shapes (e.g, to propagate matricies)
		constructor: function(){
			gs.Container._init.call(this);
		},
		setRawNode: function(rawNode){
			// summary:
			//		sets a raw SVG node to be used by this shape
			// rawNode: Node
			//		an SVG node
			this.rawNode = rawNode;
			// Bind GFX object with SVG node for ease of retrieval - that is to
			// save code/performance to keep this association elsewhere
			this.rawNode.__gfxObject__ = this.getUID();
		},
		destroy: function(){
			// summary:
			//		Releases all internal resources owned by this shape. Once this method has been called,
			//		the instance is considered disposed and should not be used anymore.
			this.clear(true);
			// avoid this.inherited
			svg.Shape.prototype.destroy.apply(this, arguments);
		}
	});
	svg.Group.nodeType = "g";

	svg.Rect = declare("dojox.gfx.svg.Rect", [svg.Shape, gs.Rect], {
		// summary:
		//		a rectangle shape (SVG)
		setShape: function(newShape){
			// summary:
			//		sets a rectangle shape object (SVG)
			// newShape: Object
			//		a rectangle shape object
			this.shape = g.makeParameters(this.shape, newShape);
			this.bbox = null;
			for(var i in this.shape){
				if(i != "type" && i != "r"){
					this.rawNode.setAttribute(i, this.shape[i]);
				}
			}
			if(this.shape.r != null){
				this.rawNode.setAttribute("ry", this.shape.r);
				this.rawNode.setAttribute("rx", this.shape.r);
			}
			return this;	// self
		}
	});
	svg.Rect.nodeType = "rect";

	svg.Ellipse = declare("dojox.gfx.svg.Ellipse", [svg.Shape, gs.Ellipse], {});
	svg.Ellipse.nodeType = "ellipse";

	svg.Circle = declare("dojox.gfx.svg.Circle", [svg.Shape, gs.Circle], {});
	svg.Circle.nodeType = "circle";

	svg.Line = declare("dojox.gfx.svg.Line", [svg.Shape, gs.Line], {});
	svg.Line.nodeType = "line";

	svg.Polyline = declare("dojox.gfx.svg.Polyline", [svg.Shape, gs.Polyline], {
		// summary:
		//		a polyline/polygon shape (SVG)
		setShape: function(points, closed){
			// summary:
			//		sets a polyline/polygon shape object (SVG)
			// points: Object|Array
			//		a polyline/polygon shape object, or an array of points
			if(points && points instanceof Array){
				this.shape = g.makeParameters(this.shape, { points: points });
				if(closed && this.shape.points.length){
					this.shape.points.push(this.shape.points[0]);
				}
			}else{
				this.shape = g.makeParameters(this.shape, points);
			}
			this.bbox = null;
			this._normalizePoints();
			var attr = [], p = this.shape.points;
			for(var i = 0; i < p.length; ++i){
				attr.push(p[i].x.toFixed(8), p[i].y.toFixed(8));
			}
			this.rawNode.setAttribute("points", attr.join(" "));
			return this;	// self
		}
	});
	svg.Polyline.nodeType = "polyline";

	svg.Image = declare("dojox.gfx.svg.Image", [svg.Shape, gs.Image], {
		// summary:
		//		an image (SVG)
		setShape: function(newShape){
			// summary:
			//		sets an image shape object (SVG)
			// newShape: Object
			//		an image shape object
			this.shape = g.makeParameters(this.shape, newShape);
			this.bbox = null;
			var rawNode = this.rawNode;
			for(var i in this.shape){
				if(i != "type" && i != "src"){
					rawNode.setAttribute(i, this.shape[i]);
				}
			}
			rawNode.setAttribute("preserveAspectRatio", "none");
			_setAttributeNS(rawNode, svg.xmlns.xlink, "xlink:href", this.shape.src);
			// Bind GFX object with SVG node for ease of retrieval - that is to
			// save code/performance to keep this association elsewhere
			rawNode.__gfxObject__ = this.getUID();
			return this;	// self
		}
	});
	svg.Image.nodeType = "image";

	svg.Text = declare("dojox.gfx.svg.Text", [svg.Shape, gs.Text], {
		// summary:
		//		an anchored text (SVG)
		setShape: function(newShape){
			// summary:
			//		sets a text shape object (SVG)
			// newShape: Object
			//		a text shape object
			this.shape = g.makeParameters(this.shape, newShape);
			this.bbox = null;
			var r = this.rawNode, s = this.shape;
			r.setAttribute("x", s.x);
			r.setAttribute("y", s.y);
			r.setAttribute("text-anchor", s.align);
			r.setAttribute("text-decoration", s.decoration);
			r.setAttribute("rotate", s.rotated ? 90 : 0);
			r.setAttribute("kerning", s.kerning ? "auto" : 0);
			r.setAttribute("text-rendering", "optimizeLegibility");

			// update the text content
			if(r.firstChild){
				r.firstChild.nodeValue = s.text;
			}else{
				r.appendChild(_createTextNode(s.text));
			}
			return this;	// self
		},
		getTextWidth: function(){
			// summary:
			//		get the text width in pixels
			var rawNode = this.rawNode,
				oldParent = rawNode.parentNode,
				_measurementNode = rawNode.cloneNode(true);
			_measurementNode.style.visibility = "hidden";

			// solution to the "orphan issue" in FF
			var _width = 0, _text = _measurementNode.firstChild.nodeValue;
			oldParent.appendChild(_measurementNode);

			// solution to the "orphan issue" in Opera
			// (nodeValue == "" hangs firefox)
			if(_text!=""){
				while(!_width){
//Yang: work around svgweb bug 417 -- http://code.google.com/p/svgweb/issues/detail?id=417
if (_measurementNode.getBBox)
					_width = parseInt(_measurementNode.getBBox().width);
else
	_width = 68;
				}
			}
			oldParent.removeChild(_measurementNode);
			return _width;
		}
	});
	svg.Text.nodeType = "text";

	svg.Path = declare("dojox.gfx.svg.Path", [svg.Shape, pathLib.Path], {
		// summary:
		//		a path shape (SVG)
		_updateWithSegment: function(segment){
			// summary:
			//		updates the bounding box of path with new segment
			// segment: Object
			//		a segment
			this.inherited(arguments);
			if(typeof(this.shape.path) == "string"){
				this.rawNode.setAttribute("d", this.shape.path);
			}
		},
		setShape: function(newShape){
			// summary:
			//		forms a path using a shape (SVG)
			// newShape: Object
			//		an SVG path string or a path object (see dojox/gfx.defaultPath)
			this.inherited(arguments);
			if(this.shape.path){
				this.rawNode.setAttribute("d", this.shape.path);
			}else{
				this.rawNode.removeAttribute("d");
			}
			return this;	// self
		}
	});
	svg.Path.nodeType = "path";

	svg.TextPath = declare("dojox.gfx.svg.TextPath", [svg.Shape, pathLib.TextPath], {
		// summary:
		//		a textpath shape (SVG)
		_updateWithSegment: function(segment){
			// summary:
			//		updates the bounding box of path with new segment
			// segment: Object
			//		a segment
			this.inherited(arguments);
			this._setTextPath();
		},
		setShape: function(newShape){
			// summary:
			//		forms a path using a shape (SVG)
			// newShape: Object
			//		an SVG path string or a path object (see dojox/gfx.defaultPath)
			this.inherited(arguments);
			this._setTextPath();
			return this;	// self
		},
		_setTextPath: function(){
			if(typeof this.shape.path != "string"){ return; }
			var r = this.rawNode;
			if(!r.firstChild){
				var tp = _createElementNS(svg.xmlns.svg, "textPath"),
					tx = _createTextNode("");
				tp.appendChild(tx);
				r.appendChild(tp);
			}
			var ref  = r.firstChild.getAttributeNS(svg.xmlns.xlink, "href"),
				path = ref && svg.getRef(ref);
			if(!path){
				var surface = this._getParentSurface();
				if(surface){
					var defs = surface.defNode;
					path = _createElementNS(svg.xmlns.svg, "path");
					var id = g._base._getUniqueId();
					path.setAttribute("id", id);
					defs.appendChild(path);
					_setAttributeNS(r.firstChild, svg.xmlns.xlink, "xlink:href", "#" + id);
				}
			}
			if(path){
				path.setAttribute("d", this.shape.path);
			}
		},
		_setText: function(){
			var r = this.rawNode;
			if(!r.firstChild){
				var tp = _createElementNS(svg.xmlns.svg, "textPath"),
					tx = _createTextNode("");
				tp.appendChild(tx);
				r.appendChild(tp);
			}
			r = r.firstChild;
			var t = this.text;
			r.setAttribute("alignment-baseline", "middle");
			switch(t.align){
				case "middle":
					r.setAttribute("text-anchor", "middle");
					r.setAttribute("startOffset", "50%");
					break;
				case "end":
					r.setAttribute("text-anchor", "end");
					r.setAttribute("startOffset", "100%");
					break;
				default:
					r.setAttribute("text-anchor", "start");
					r.setAttribute("startOffset", "0%");
					break;
			}
			//r.parentNode.setAttribute("alignment-baseline", "central");
			//r.setAttribute("dominant-baseline", "central");
			r.setAttribute("baseline-shift", "0.5ex");
			r.setAttribute("text-decoration", t.decoration);
			r.setAttribute("rotate", t.rotated ? 90 : 0);
			r.setAttribute("kerning", t.kerning ? "auto" : 0);
			r.firstChild.data = t.text;
		}
	});
	svg.TextPath.nodeType = "text";

	svg.Surface = declare("dojox.gfx.svg.Surface", gs.Surface, {
		// summary:
		//		a surface object to be used for drawings (SVG)
		constructor: function(){
			gs.Container._init.call(this);
		},
		destroy: function(){
			// no need to call svg.Container.clear to remove the children raw
			// nodes since the surface raw node will be removed. So, only dispose at gfx level	
			gs.Container.clear.call(this, true); 
			this.defNode = null;	// release the external reference
			this.inherited(arguments);
		},
		setDimensions: function(width, height){
			// summary:
			//		sets the width and height of the rawNode
			// width: String
			//		width of surface, e.g., "100px"
			// height: String
			//		height of surface, e.g., "100px"
			if(!this.rawNode){ return this; }
			this.rawNode.setAttribute("width",  width);
			this.rawNode.setAttribute("height", height);
			return this;	// self
		},
		getDimensions: function(){
			// summary:
			//		returns an object with properties "width" and "height"
			var t = this.rawNode ? {
				width:  g.normalizedLength(this.rawNode.getAttribute("width")),
				height: g.normalizedLength(this.rawNode.getAttribute("height"))} : null;
			return t;	// Object
		}
	});

	svg.createSurface = function(parentNode, width, height){
		// summary:
		//		creates a surface (SVG)
		// parentNode: Node
		//		a parent node
		// width: String|Number
		//		width of surface, e.g., "100px" or 100
		// height: String|Number
		//		height of surface, e.g., "100px" or 100
		// returns: dojox/gfx/shape.Surface
		//     newly created surface

		var s = new svg.Surface();
		s.rawNode = _createElementNS(svg.xmlns.svg, "svg");
		s.rawNode.setAttribute("overflow", "hidden");
		if(width){
			s.rawNode.setAttribute("width",  width);
		}
		if(height){
			s.rawNode.setAttribute("height", height);
		}

		var defNode = _createElementNS(svg.xmlns.svg, "defs");
		s.rawNode.appendChild(defNode);
		s.defNode = defNode;

		s._parent = dom.byId(parentNode);
		s._parent.appendChild(s.rawNode);

		return s;	// dojox/gfx.Surface
	};

	// Extenders

	var Font = {
		_setFont: function(){
			// summary:
			//		sets a font object (SVG)
			var f = this.fontStyle;
			// next line doesn't work in Firefox 2 or Opera 9
			//this.rawNode.setAttribute("font", dojox.gfx.makeFontString(this.fontStyle));
			this.rawNode.setAttribute("font-style", f.style);
			this.rawNode.setAttribute("font-variant", f.variant);
			this.rawNode.setAttribute("font-weight", f.weight);
			this.rawNode.setAttribute("font-size", f.size);
			this.rawNode.setAttribute("font-family", f.family);
		}
	};

	var C = gs.Container, Container = {
		openBatch: function() {
			// summary:
			//		starts a new batch, subsequent new child shapes will be held in
			//		the batch instead of appending to the container directly
			this.fragment = _createFragment();
		},
		closeBatch: function() {
			// summary:
			//		submits the current batch, append all pending child shapes to DOM
			if (this.fragment) {
				this.rawNode.appendChild(this.fragment);
				delete this.fragment;
			}
		},
		add: function(shape){
			// summary:
			//		adds a shape to a group/surface
			// shape: dojox/gfx/shape.Shape
			//		an VML shape object
			if(this != shape.getParent()){
				if (this.fragment) {
					this.fragment.appendChild(shape.rawNode);
				} else {
					this.rawNode.appendChild(shape.rawNode);
				}
				C.add.apply(this, arguments);
				// update clipnode with new parent
				shape.setClip(shape.clip);
			}
			return this;	// self
		},
		remove: function(shape, silently){
			// summary:
			//		remove a shape from a group/surface
			// shape: dojox/gfx/shape.Shape
			//		an VML shape object
			// silently: Boolean?
			//		if true, regenerate a picture
			if(this == shape.getParent()){
				if(this.rawNode == shape.rawNode.parentNode){
					this.rawNode.removeChild(shape.rawNode);
				}
				if(this.fragment && this.fragment == shape.rawNode.parentNode){
					this.fragment.removeChild(shape.rawNode);
				}
				// remove clip node from parent 
				shape._removeClipNode();
				C.remove.apply(this, arguments);
			}
			return this;	// self
		},
		clear: function(){
			// summary:
			//		removes all shapes from a group/surface
			var r = this.rawNode;
			while(r.lastChild){
				r.removeChild(r.lastChild);
			}
			var defNode = this.defNode;
			if(defNode){
				while(defNode.lastChild){
					defNode.removeChild(defNode.lastChild);
				}
				r.appendChild(defNode);
			}
			return C.clear.apply(this, arguments);
		},
		getBoundingBox: C.getBoundingBox,
		_moveChildToFront: C._moveChildToFront,
		_moveChildToBack:  C._moveChildToBack
	};

	var Creator = {
		// summary:
		//		SVG shape creators
		createObject: function(shapeType, rawShape){
			// summary:
			//		creates an instance of the passed shapeType class
			// shapeType: Function
			//		a class constructor to create an instance of
			// rawShape: Object
			//		properties to be passed in to the classes "setShape" method
			if(!this.rawNode){ return null; }
			var shape = new shapeType(),
				node = _createElementNS(svg.xmlns.svg, shapeType.nodeType);

			shape.setRawNode(node);
			shape.setShape(rawShape);
			// rawNode.appendChild() will be done inside this.add(shape) below
			this.add(shape);
			return shape;	// dojox/gfx/shape.Shape
		}
	};

	lang.extend(svg.Text, Font);
	lang.extend(svg.TextPath, Font);

	lang.extend(svg.Group, Container);
	lang.extend(svg.Group, gs.Creator);
	lang.extend(svg.Group, Creator);

	lang.extend(svg.Surface, Container);
	lang.extend(svg.Surface, gs.Creator);
	lang.extend(svg.Surface, Creator);

	// Mouse/Touch event
	svg.fixTarget = function(event, gfxElement) {
		// summary:
		//		Adds the gfxElement to event.gfxTarget if none exists. This new
		//		property will carry the GFX element associated with this event.
		// event: Object
		//		The current input event (MouseEvent or TouchEvent)
		// gfxElement: Object
		//		The GFX target element
		if (!event.gfxTarget) {
			if (safMobile && event.target.wholeText) {
				// Workaround iOS bug when touching text nodes
				event.gfxTarget = gs.byId(event.target.parentElement.__gfxObject__);
			} else {
				event.gfxTarget = gs.byId(event.target.__gfxObject__);
			}
		}
		return true;
	};

	// some specific override for svgweb + flash
	if(svg.useSvgWeb){
		// override createSurface()
		svg.createSurface = function(parentNode, width, height){
			var s = new svg.Surface();

			// ensure width / height
			if(!width || !height){
				var pos = domGeom.position(parentNode);
				width  = width  || pos.w;
				height = height || pos.h;
			}

			// ensure id
			parentNode = dom.byId(parentNode);
			var id = parentNode.id ? parentNode.id+'_svgweb' : g._base._getUniqueId();

			// create dynamic svg root
			var mockSvg = _createElementNS(svg.xmlns.svg, 'svg');
			mockSvg.id = id;
			mockSvg.setAttribute('width', width);
			mockSvg.setAttribute('height', height);
			svgweb.appendChild(mockSvg, parentNode);

			// notice: any call to the raw node before flash init will fail.
			mockSvg.addEventListener('SVGLoad', function(){
				// become loaded
				s.rawNode = this;
				s.isLoaded = true;

				// init defs
				var defNode = _createElementNS(svg.xmlns.svg, "defs");
				s.rawNode.appendChild(defNode);
				s.defNode = defNode;

				// notify application
				if (s.onLoad)
					s.onLoad(s);
			}, false);

			// flash not loaded yet
			s.isLoaded = false;
			return s;
		};

		// override Surface.destroy()
		svg.Surface.extend({
			destroy: function(){
				var mockSvg = this.rawNode;
				svgweb.removeChild(mockSvg, mockSvg.parentNode);
			}
		});

		// override connect() & disconnect() for Shape & Surface event processing
		var _eventsProcessing = {
			connect: function(name, object, method){
				// connect events using the mock addEventListener() provided by svgweb
				if (name.substring(0, 2)==='on') { name = name.substring(2); }
				if (arguments.length == 2) {
					method = object;
				} else {
					method = lang.hitch(object, method);
				}
				this.getEventSource().addEventListener(name, method, false);
				return [this, name, method];
			},
			disconnect: function(token){
				// disconnect events using the mock removeEventListener() provided by svgweb
				this.getEventSource().removeEventListener(token[1], token[2], false);
				delete token[0];
			}
		};

		lang.extend(svg.Shape, _eventsProcessing);
		lang.extend(svg.Surface, _eventsProcessing);
	}

	return svg;
});

},
'dojox/gfx/Mover':function(){
define("dojox/gfx/Mover", ["dojo/_base/lang","dojo/_base/array", "dojo/_base/declare", "dojo/on", "dojo/has", "dojo/_base/event"],
  function(lang, arr, declare, on, has, event){
	return declare("dojox.gfx.Mover", null, {
		constructor: function(shape, e, host){
			// summary:
			//		an object, which makes a shape follow the mouse,
			//		used as a default mover, and as a base class for custom movers
			// shape: dojox/gfx.Shape
			//		a shape object to be moved
			// e: Event
			//		a mouse event, which started the move;
			//		only clientX and clientY properties are used
			// host: Object?
			//		object which implements the functionality of the move,
			//		 and defines proper events (onMoveStart and onMoveStop)
			this.shape = shape;
			this.lastX = has("touch") ? (e.changedTouches ? e.changedTouches[0] : e).clientX : e.clientX;
			this.lastY = has("touch") ? (e.changedTouches ? e.changedTouches[0] : e).clientY : e.clientY;
			var h = this.host = host, d = document,
				firstEvent = on(d, has("touch") ? "touchmove" : "mousemove", lang.hitch(this, "onFirstMove"));
			this.events = [
				on(d, has("touch") ? "touchmove" : "mousemove",    lang.hitch(this, "onMouseMove")),
				on(d, has("touch") ? "touchend" : "mouseup", lang.hitch(this, "destroy")),
				// cancel text selection and text dragging
				on(d, "dragstart",   lang.hitch(event, "stop")),
				on(d, "selectstart", lang.hitch(event, "stop")),
				firstEvent
			];
			// notify that the move has started
			if(h && h.onMoveStart){
				h.onMoveStart(this);
			}
		},
		// mouse event processors
		onMouseMove: function(e){
			// summary:
			//		event processor for onmousemove
			// e: Event
			//		mouse event
			var x = has("touch") ? (e.changedTouches ? e.changedTouches[0] : e).clientX : e.clientX;
			var y = has("touch") ? (e.changedTouches ? e.changedTouches[0] : e).clientY : e.clientY;
			this.host.onMove(this, {dx: x - this.lastX, dy: y - this.lastY});
			this.lastX = x;
			this.lastY = y;
			event.stop(e);
		},
		// utilities
		onFirstMove: function(){
			// summary:
			//		it is meant to be called only once
			this.host.onFirstMove(this);
			this.events.pop().remove();
		},
		destroy: function(){
			// summary:
			//		stops the move, deletes all references, so the object can be garbage-collected
			arr.forEach(this.events, function(h){h.remove();});
			// undo global settings
			var h = this.host;
			if(h && h.onMoveStop){
				h.onMoveStop(this);
			}
			// destroy objects
			this.events = this.shape = null;
		}
	});
});

},
'dojox/gfx/decompose':function(){
define("dojox/gfx/decompose", ["./_base", "dojo/_base/lang", "./matrix"], 
  function (g, lang, m){
	function eq(/* Number */ a, /* Number */ b){
		// summary:
		//		compare two FP numbers for equality
		return Math.abs(a - b) <= 1e-6 * (Math.abs(a) + Math.abs(b));	// Boolean
	}

	function calcFromValues(/* Number */ r1, /* Number */ m1, /* Number */ r2, /* Number */ m2){
		// summary:
		//		uses two close FP ration and their original magnitudes to approximate the result
		if(!isFinite(r1)){
			return r2;	// Number
		}else if(!isFinite(r2)){
			return r1;	// Number
		}
		m1 = Math.abs(m1); m2 = Math.abs(m2);
		return (m1 * r1 + m2 * r2) / (m1 + m2);	// Number
	}

	function transpose(matrix){
		// matrix: dojox/gfx/matrix.Matrix2D
		//		a 2D matrix-like object
		var M = new m.Matrix2D(matrix);
		return lang.mixin(M, {dx: 0, dy: 0, xy: M.yx, yx: M.xy});	// dojox/gfx/matrix.Matrix2D
	}

	function scaleSign(/* dojox/gfx/matrix.Matrix2D */ matrix){
		return (matrix.xx * matrix.yy < 0 || matrix.xy * matrix.yx > 0) ? -1 : 1;	// Number
	}

	function eigenvalueDecomposition(matrix){
		// matrix: dojox/gfx/matrix.Matrix2D
		//		a 2D matrix-like object
		var M = m.normalize(matrix),
			b = -M.xx - M.yy,
			c = M.xx * M.yy - M.xy * M.yx,
			d = Math.sqrt(b * b - 4 * c),
			l1 = -(b + (b < 0 ? -d : d)) / 2,
			l2 = c / l1,
			vx1 = M.xy / (l1 - M.xx), vy1 = 1,
			vx2 = M.xy / (l2 - M.xx), vy2 = 1;
		if(eq(l1, l2)){
			vx1 = 1, vy1 = 0, vx2 = 0, vy2 = 1;
		}
		if(!isFinite(vx1)){
			vx1 = 1, vy1 = (l1 - M.xx) / M.xy;
			if(!isFinite(vy1)){
				vx1 = (l1 - M.yy) / M.yx, vy1 = 1;
				if(!isFinite(vx1)){
					vx1 = 1, vy1 = M.yx / (l1 - M.yy);
				}
			}
		}
		if(!isFinite(vx2)){
			vx2 = 1, vy2 = (l2 - M.xx) / M.xy;
			if(!isFinite(vy2)){
				vx2 = (l2 - M.yy) / M.yx, vy2 = 1;
				if(!isFinite(vx2)){
					vx2 = 1, vy2 = M.yx / (l2 - M.yy);
				}
			}
		}
		var d1 = Math.sqrt(vx1 * vx1 + vy1 * vy1),
			d2 = Math.sqrt(vx2 * vx2 + vy2 * vy2);
		if(!isFinite(vx1 /= d1)){ vx1 = 0; }
		if(!isFinite(vy1 /= d1)){ vy1 = 0; }
		if(!isFinite(vx2 /= d2)){ vx2 = 0; }
		if(!isFinite(vy2 /= d2)){ vy2 = 0; }
		return {	// Object
			value1: l1,
			value2: l2,
			vector1: {x: vx1, y: vy1},
			vector2: {x: vx2, y: vy2}
		};
	}

	function decomposeSR(/* dojox/gfx/matrix.Matrix2D */ M, /* Object */ result){
		// summary:
		//		decomposes a matrix into [scale, rotate]; no checks are done.
		var sign = scaleSign(M),
			a = result.angle1 = (Math.atan2(M.yx, M.yy) + Math.atan2(-sign * M.xy, sign * M.xx)) / 2,
			cos = Math.cos(a), sin = Math.sin(a);
		result.sx = calcFromValues(M.xx / cos, cos, -M.xy / sin, sin);
		result.sy = calcFromValues(M.yy / cos, cos,  M.yx / sin, sin);
		return result;	// Object
	}

	function decomposeRS(/* dojox/gfx/matrix.Matrix2D */ M, /* Object */ result){
		// summary:
		//		decomposes a matrix into [rotate, scale]; no checks are done
		var sign = scaleSign(M),
			a = result.angle2 = (Math.atan2(sign * M.yx, sign * M.xx) + Math.atan2(-M.xy, M.yy)) / 2,
			cos = Math.cos(a), sin = Math.sin(a);
		result.sx = calcFromValues(M.xx / cos, cos,  M.yx / sin, sin);
		result.sy = calcFromValues(M.yy / cos, cos, -M.xy / sin, sin);
		return result;	// Object
	}

	return g.decompose = function(matrix){
		// summary:
		//		Decompose a 2D matrix into translation, scaling, and rotation components.
		// description:
		//		This function decompose a matrix into four logical components:
		//		translation, rotation, scaling, and one more rotation using SVD.
		//		The components should be applied in following order:
		//	| [translate, rotate(angle2), scale, rotate(angle1)]
		// matrix: dojox/gfx/matrix.Matrix2D
		//		a 2D matrix-like object
		var M = m.normalize(matrix),
			result = {dx: M.dx, dy: M.dy, sx: 1, sy: 1, angle1: 0, angle2: 0};
		// detect case: [scale]
		if(eq(M.xy, 0) && eq(M.yx, 0)){
			return lang.mixin(result, {sx: M.xx, sy: M.yy});	// Object
		}
		// detect case: [scale, rotate]
		if(eq(M.xx * M.yx, -M.xy * M.yy)){
			return decomposeSR(M, result);	// Object
		}
		// detect case: [rotate, scale]
		if(eq(M.xx * M.xy, -M.yx * M.yy)){
			return decomposeRS(M, result);	// Object
		}
		// do SVD
		var	MT = transpose(M),
			u  = eigenvalueDecomposition([M, MT]),
			v  = eigenvalueDecomposition([MT, M]),
			U  = new m.Matrix2D({xx: u.vector1.x, xy: u.vector2.x, yx: u.vector1.y, yy: u.vector2.y}),
			VT = new m.Matrix2D({xx: v.vector1.x, xy: v.vector1.y, yx: v.vector2.x, yy: v.vector2.y}),
			S = new m.Matrix2D([m.invert(U), M, m.invert(VT)]);
		decomposeSR(VT, result);
		S.xx *= result.sx;
		S.yy *= result.sy;
		decomposeRS(U, result);
		S.xx *= result.sx;
		S.yy *= result.sy;
		return lang.mixin(result, {sx: S.xx, sy: S.yy});	// Object
	};
});

}}});
define("dojo/graphics-layer", [], 1);
