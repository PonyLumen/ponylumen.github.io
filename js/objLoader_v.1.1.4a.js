/*
 * Copyright (c) 2013-2014 ponylumen
 * 
 * Permission is hereby granted, free of charge, to any person obtaining a copy
 * of this software and associated documentation files (the "Software"), to deal
 * in the Software without restriction, including without limitation the rights
 * to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
 * copies of the Software, and to permit persons to whom the Software is
 * furnished to do so, subject to the following conditions:
 *
 * The above copyright notice and this permission notice shall be included in all
 * copies or substantial portions of the Software.
 *
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
 * IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
 * FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
 * AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
 * LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
 * OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
 * SOFTWARE.
 */
 

function ObjLoader(){

	// Read an .obj file, and send the model to the shader.
	// Works only for triangles.
	
	this.loadObj = function(_model,_method) {
		
		method = _method; // 0 : default, 1 : horn and eye
		model = _model;
		data = ' ';
		
		jQuery.ajaxSetup({async:true});
		jQuery.get(model.filename, function(fdata) {

			data = fdata;
			objLoader_tmp_normals = new Array();
			objLoader_tmp_uvcoords = new Array();
			mesh = new Mesh();
			ichar = 0;
			var line;
			var	currentString;
			
			while(ichar < data.length){
				ichar++;
				if(data.charAt(ichar) != '\n'){
					continue;
				}
				else{
					readLine();
				}
			}
			
			// end stuff
			mesh.calculateCenter();
			mesh.calculateVmin();
			mesh.calculateVmax();
			mesh.calculateNormals();
			mesh.prepareVBO();

			model.mesh = mesh;
			
			model.initTextures();
			
			if(method == 0){
				// send model to the shader
				initObjectShader(model); 
			}
			if(method == 1){ 
				// This is not a "good" method because of the asynchronous readers.
				// In order to avoid problems, the eyes must have their own skeleton with one joint.
				
				// attach eyes to the head joint
				for(var i=0; i<model.mesh.vertices.length; i++){
					model.mesh.vertices[i].jointsID.push(headID);
					model.mesh.vertices[i].weights.push(1.0);
				}
				// send model to the shader
				initCharacterShader(model); 
			}
			
			model.setLoaded();
			
			
			// end of the async function
		}, 'text');

	}

	
	var readLine = function(){
		ichar++;
		var element = '';
		while(data.charAt(ichar) != ' '){
			if(ichar >= data.length) return;
			element = element + data.charAt(ichar);
			ichar++;
		}
		
		if(element == 'v'){
			readVertexPosition();
		}
		else if(element == 'vn'){
			readVertexNormal();
		}
		else if(element == 'vt'){
			readVertexUV();
		}
		else if(element == 'f'){
			readFace();
		}
	}

	var readVertexPosition = function(){
		var vals = readFloatArray();
		mesh.addVertex(new Vertex(vals[0], vals[1], vals[2]));
	}
	
	var readVertexNormal = function(){

		var vals = readFloatArray();

		var vec = vec3.createFrom(vals[0], vals[1], vals[2]);
		objLoader_tmp_normals.push(vec);
		
	}
	
	var readVertexUV = function(){

		var vals = readFloatArray();

		var vec = vec2.createFrom(vals[0], vals[1]);
		objLoader_tmp_uvcoords.push(vec);
		
	}

	var readFace = function(){

		ichar++;
		var vals = new Array(3); //vals[i][j]
		for(var i = 0; i < 3; i++){
			vals[i] = new Array();
		}
		var i=0;
		var j=0;
		var val='';
		while(true){
			if(data.charAt(ichar) == ' '){
				vals[i][j] = parseInt(val)-1;
				j++;
				i=0;
				val='';
			}
			else if(data.charAt(ichar) == '\n'){
				vals[i][j] = parseInt(val)-1;
				break;
			}
			else if(data.charAt(ichar) == '/'){
				vals[i][j] = parseInt(val)-1; 
				i++;
				val='';
			}
			else{
				val = val + data.charAt(ichar);
			}
			ichar++;
		}
		ichar--;
		
		

		// create face
		// only works with triangles

		var tri = new Triangle(vals[0][0], vals[0][1], vals[0][2]);
		// uv coords
		if(vals[1].length){
			tri.u0 = objLoader_tmp_uvcoords[vals[1][0]][0];
			tri.u1 = objLoader_tmp_uvcoords[vals[1][1]][0];
			tri.u2 = objLoader_tmp_uvcoords[vals[1][2]][0];
			tri.v0 = objLoader_tmp_uvcoords[vals[1][0]][1];
			tri.v1 = objLoader_tmp_uvcoords[vals[1][1]][1];
			tri.v2 = objLoader_tmp_uvcoords[vals[1][2]][1];
		}
		// normals
		//mesh.vertices[tri.x].normal = objLoader_tmp_normals[vals[2][0]]; 
		//mesh.vertices[tri.y].normal = objLoader_tmp_normals[vals[2][1]]; 
		//mesh.vertices[tri.z].normal = objLoader_tmp_normals[vals[2][2]]; 

		mesh.addTriangle(tri);

	}

	var readFloatArray = function (){
		// read values until end of line
		var vals = new Array();
		while(true){	

			ichar++;
			// read 1 value (float)
			
			var val = '';
			while(data.charAt(ichar) != ' ' && data.charAt(ichar) != '\n'){
				val = val + data.charAt(ichar);
				ichar++;
			}

			val = parseFloat(val);
			
			if(!isNaN(val)){ // check if this is a number
				vals.push(val);
			}

			if (data.charAt(ichar) == '\n' ){
				ichar--;
				break;
			}
			
		}
		return vals;
	}
	
	var writeModel = function(_model,option){
		if(!_model) return;
	
		var mesh = _model.mesh;
		var sk = _model.skeleton;
		var v = mesh.vertices;
		
		// option : 1 (tongue,eyelashes,teeth)
		// option : 2 (eyes)
		if(option==1 || option==2){
			sk = pony.model.skeleton;
		}
		
		// retrieve current frame
		var iFrame = pony.getICurrentFrame();
		
		
		var finalPos = new Array();
		
		// compute skeleton pose if any.
		if(sk.joints.length){
		
			// prevent segmentation fault
			if (iFrame >= sk.joints[0].skinningMatrices.length){
				iFrame = 0;
			}
			
			// init pose
			for(var i=0;i<v.length;i++){
				finalPos.push(vec4.createFrom(0,0,0,1));
			}
			
			// compute morphs (face expression & weight of the pony)
			for(var i=0;i<v.length;i++){
				for(var j=0; j< v[i].morphPosDiff.length; j++){
				var id = v[i].morphID[j] ;
					if(id < 51) {// 51th morph is male pony
						var p = vec4.createFrom(v[i].morphPosDiff[j][0],v[i].morphPosDiff[j][1],v[i].morphPosDiff[j][2],1)
						vec4.scale(p,pony.morphValue[id]);
						vec4.add(finalPos[i],p,finalPos[i]);
					}
				}
			}
				
			// compute skeleton pose
			for(var i=0;i<v.length;i++){
				for(var j=0;j<v[i].jointsID.length;j++){
					var p = vec4.createFrom(v[i].position[0],v[i].position[1],v[i].position[2],1);
					var jID = v[i].jointsID[j];
					var w = v[i].weights[j];
					var m4 = sk.joints[jID].skinningMatrices[iFrame];
					mat4.multiplyVec4(m4,p);
					vec4.scale(p,w);
					vec4.add(finalPos[i],p,finalPos[i]);
				}
			}
		}
		else{
			for(var i=0;i<v.length;i++){
				finalPos.push(vec4.createFrom(v[i].position[0],v[i].position[1],v[i].position[2],1));
				
				// compute morphs (face expression & weight of the pony)
				for(var j=0; j< v[i].morphPosDiff.length; j++){
				var id = v[i].morphID[j] ;
					if(id < 51) {// 51th morph is male pony
						var p = vec4.createFrom(v[i].morphPosDiff[j][0],v[i].morphPosDiff[j][1],v[i].morphPosDiff[j][2],1)
						vec4.scale(p,pony.morphValue[id]);
						vec4.add(finalPos[i],p,finalPos[i]);
					}
				}
			}
			
			
		}

		
		for(var i=0;i<v.length;i++){
			data += 'v ';
			data += finalPos[i][0].toFixed(6);
			data += ' ';
			data += finalPos[i][1].toFixed(6);
			data += ' ';
			data += finalPos[i][2].toFixed(6);
			data += "\n";
		}
		
		for(var i=0;i<v.length;i++){
			data += 'vt ';
			data += v[i].uvcoord[0].toFixed(6);
			data += ' ';
			data += v[i].uvcoord[1].toFixed(6);
			data += "\n";
		}
		
		var f = mesh.faces;
		for(var i=0;i<f.length;i++){
			data += 'f ';
			data += (f[i].x+offsetVertices);
			data += '/';
			data += (f[i].x+offsetVertices);
			data += ' ';
			
			data += (f[i].y+offsetVertices);
			data += '/';
			data += (f[i].y+offsetVertices);
			data += ' ';
			
			data += (f[i].z+offsetVertices);
			data += "/";
			data += (f[i].z+offsetVertices);
			data += "\n";
		}
		offsetVertices += v.length;
	}
	
	var computeTexture = function(inst){
		// This function is used to export final textures as files.
		var model = inst.model;
		if(!model) return false;
		// TODO handle the following exceptions :
		// - Rainbow Dash tail (use a larger canvas to draw)
		// - stickers and custom cutie mark (custom cutie mark works like stickers)
	
		var img = model.texture[0].image;
		var c = document.createElement('canvas');
		var w = img.width;
		var h = img.height;
		c.width = w;
		c.height = h;
		var ctx1 = c.getContext('2d');
		
		// Draw image to get the data
		ctx1.drawImage(img, 0, 0, w, h);
		var imgData = ctx1.getImageData(0, 0, w, h);
		var data = imgData.data;
	
		var finalColor1 = vec4.create();
		var finalColor2 = vec4.create();
		var finalColor3 = vec4.create();
		var finalColor = vec4.create();
		
		for (var i=0; i<data.length;i+=4) {
			vec4.scale(inst.firstColor,data[i],finalColor1);
			vec4.scale(inst.secondColor,data[i+1],finalColor2);
			vec4.scale(inst.thirdColor,data[i+2],finalColor3);
			vec4.add(finalColor1,finalColor2,finalColor);
			vec4.add(finalColor,finalColor3,finalColor);
			data[i] = finalColor[0]; // r
			data[i+1] = finalColor[1]; // g
			data[i+2] = finalColor[2]; // b
			//data[i+3]; // a
		}

		ctx1.putImageData(imgData,0,0);
		
		// draw additional texture (non-custom cutie mark, rainbow dash tail with 6 colors)
		var img1 = model.texture[1].image;
		ctx1.drawImage(img1, 0, 0, w, h);
		
		// get the result
		result = c.toDataURL();	
		return(result);
	}
		
	
	var rgb2hsv = function(rgb){ 
		// source http://www.easyrgb.com
		
		var var_R = ( rgb[0] / 255 );                    //RGB from 0 to 255
		var var_G = ( rgb[1] / 255 );
		var var_B = ( rgb[2] / 255 );

		var var_Min = Math.min( var_R, var_G, var_B );    //Min. value of RGB
		var var_Max = Math.max( var_R, var_G, var_B );    //Max. value of RGB
		var del_Max = var_Max - var_Min;             //Delta RGB value

		var V = var_Max;    //HSV results from 0 to 1
		var H = 0;
		var S = 0;
		
		if ( del_Max == 0 )                     //This is a gray, no chroma...
		{
		
		}
		else                                    //Chromatic data...
		{
		   S = del_Max / var_Max;

		   var del_R = ( ( ( var_Max - var_R ) / 6 ) + ( del_Max / 2 ) ) / del_Max;
		   var del_G = ( ( ( var_Max - var_G ) / 6 ) + ( del_Max / 2 ) ) / del_Max;
		   var del_B = ( ( ( var_Max - var_B ) / 6 ) + ( del_Max / 2 ) ) / del_Max;

		   if      ( var_R == var_Max ) H = del_B - del_G;
		   else if ( var_G == var_Max ) H = ( 1 / 3 ) + del_R - del_B;
		   else if ( var_B == var_Max ) H = ( 2 / 3 ) + del_G - del_R;

		   if ( H < 0 ) H += 1;
		   if ( H > 1 ) H -= 1;
		}

		return vec3.createFrom(H,S,V);
	}
	
	var hsv2rgb = function(hsv) {
		// source http://www.easyrgb.com
		var H = hsv[0];
		var S = hsv[1];
		var V = hsv[2];
		var R = 0;
		var G = 0;
		var B = 0;
		
		if ( S == 0 )                       //HSV from 0 to 1
		{
		   R = V * 255;
		   G = V * 255;
		   B = V * 255;
		}
		else
		{
		   var var_h = H * 6;
		   if ( var_h == 6 ) var_h = 0  ;    //H must be < 1
		   var var_i = parseInt( var_h );             //Or ... var_i = floor( var_h )
		   var var_1 = V * ( 1 - S );
		   var var_2 = V * ( 1 - S * ( var_h - var_i ) );
		   var var_3 = V * ( 1 - S * ( 1 - ( var_h - var_i ) ) );
		   var var_r = 0;
		   var var_g = 0;
		   var var_b = 0;
			
		   if      ( var_i == 0 ) { var_r = V     ; var_g = var_3 ; var_b = var_1; }
		   else if ( var_i == 1 ) { var_r = var_2 ; var_g = V     ; var_b = var_1; }
		   else if ( var_i == 2 ) { var_r = var_1 ; var_g = V     ; var_b = var_3; }
		   else if ( var_i == 3 ) { var_r = var_1 ; var_g = var_2 ; var_b = V;     }
		   else if ( var_i == 4 ) { var_r = var_3 ; var_g = var_1 ; var_b = V;     }
		   else                   { var_r = V     ; var_g = var_1 ; var_b = var_2; }

		   R = var_r * 255;                  //RGB results from 0 to 255
		   G = var_g * 255;
		   B = var_b * 255;
		}
		
		return vec3.createFrom(R,G,B);
	}

	var computeEyeTexture = function(inst){
		var model = inst.model;
		if(!model) return false;
	
		var img = model.texture[0].image;
		var c = document.createElement('canvas');
		var w = img.width;
		var h = img.height;
		c.width = w;
		c.height = h;
		var ctx1 = c.getContext('2d');
		
		// Draw image to get the data
		ctx1.drawImage(img, 0, 0, w, h);
		var imgData = ctx1.getImageData(0, 0, w, h);
		var data = imgData.data;

		for (var i=0; i<data.length;i+=4) {

			var texColor = vec3.createFrom(data[i],data[i+1],data[i+2]);
			var texHSV = rgb2hsv(texColor);
	
			var hue = texHSV[0] + inst.hsv[0];
			var saturation = texHSV[1] * inst.hsv[1];
			var value = texHSV[2] * inst.hsv[2];
			
			var finalHSV = vec3.createFrom(hue,saturation,value);	
			var v3color = hsv2rgb(finalHSV);
			
			// replace alpha by white
			var a = data[i+3]/255;
			data[i] = lerp(255.0,v3color[0],a);
			data[i+1] = lerp(255.0,v3color[1],a);
			data[i+2] = lerp(255.0,v3color[2],a);
			
			data[i+3] = 255.0;// a
		}

		//console.log(data);
		
		ctx1.putImageData(imgData,0,0);
		
		// get the result
		result = c.toDataURL();	
		return(result);
	}
		
	var addToZip = function(inst,name,option){
		// option : 1 (tongue,eyelashes,teeth) (see writeModel() for details)
		// option : 2 (eyes)
		if(!inst.model) return;
		
		data = "data:text/plain;charset=utf-8,";
		data += "mtllib pony.mtl\n";
		offsetVertices = 1;
		writeModel(inst.model,option);
		
		var objName = name + '.obj';
		var textureName = name + '.png';
		zip.file(objName, data);
		var img = 0;
		if(option == 2){
			img = computeEyeTexture(inst);
		}
		else{
			img = computeTexture(inst);
		}
		if(img){
			// thanks http://stackoverflow.com/questions/15287393/saving-an-image-from-canvas-in-a-zip
			zip.file(textureName, img.substr(img.indexOf(',')+1), {base64: true});
		}
	}
	
		
	this.save = function(){
	
		// create a new zip file
		zip = new JSZip();
		addToZip(pony,"pony");
		addToZip(hairFront,"hairFront");
		addToZip(hairBack,"hairBack");
		addToZip(hairExtra,"hairExtra"); // for Cloudchaser
		addToZip(tail,"tail");
		addToZip(leftWing,"leftWing");
		addToZip(rightWing,"rightWing");
		addToZip(horn,"horn");
		addToZip(eyelashes,"eyelashes",1);
		addToZip(tongue,"tongue",1);
		addToZip(teeth,"teeth",1);
		addToZip(leftEye,"leftEye",2);
		addToZip(rightEye,"rightEye",2);
		
		// accessories
		addToZip(collar1,'collar');
		addToZip(headgear1,'headgear');
		addToZip(headbandA[0],'headband');
		addToZip(headbandA[1],'glasses');
		for(var i=0; i<accessories.length; i++){	
			addToZip(accessories[i],'accessory_'+i);
		}
		
		// readme file
		var readme = "The textures applied to the model in your 3d application might appear not to fit right. Depending on your software, it may be necessary to flip the textures vertically."
		zip.file("readme.txt", readme);
		
		// download the zip file
		var blob = zip.generate({type:"blob"});
		saveAs(blob, "pony.zip");
		
		
	}

	var data; // char Array
	var zip; // zip file (when export obj and textures)
	
	// load
	var ichar; // unsigned int
	var objLoader_tmp_normals; // vec3 Array
	var objLoader_tmp_uvcoords; // vec2 Array
	var mesh; // Mesh
	var model; // ModelCharacter
	var method; // 0 : default, 1 : horn and eye
	
	// write
	var offsetVertices;

}

