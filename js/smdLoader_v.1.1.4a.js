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
 

function SmdLoader(){

	// Can write smd files
	// But can't read smd files yet
	
	var writeModel = function(_model,option,name){
		if(!_model) return;
	
		var mesh = _model.mesh;
		var sk = _model.skeleton;
		
		// option : 1 (tongue,eyelashes,teeth)
		// option : 2 (eyes)
		if(option==1 || option==2){
			sk = pony.model.skeleton;
		}
		
		// comments
		data += "// Created by PonyLumen's 3D Pony Creator\n"
		
		// version
		data += "version 1\n";
		
		// bones
		if(sk.joints.length){
			data += "nodes";
			data += "\n";
			for(var i=0;i<sk.joints.length;i++){
				var joint = sk.joints[i];
				var id = joint.index;
				var jname = joint.name;
				var parentID = -1; // -1 if no parent
				if(joint.parent){
					parentID = joint.parent.index;
				}
				data += "  " + id + ' "' + jname + '" ' + parentID + "\n";
			}
		}
		
		data += "end\n";
		data += "skeleton\n";


		// animations
		if(sk.joints.length){
			//for(var f=0; f<sk.joints[0].skinningMatrices.length;f++){
			for(var f=0; f<1;f++){
				data += "time " + f +"\n";

				for(var i=0; i<sk.joints.length;i++){ 
					var joint = sk.joints[i];
					// TODO I'm not sure : animMatrices or originalAnimMatrices
					var id = joint.index;
					var mat = joint.animMatrices[f];
					
					var pos = joint.originalPos[f];
					var r = vec3.createFrom(0,0,0);
					
					mat4ToEuler_test(mat,r); 
					if(joint.name == "Pelvis"){ // TODO This joint is bugged so the values are entered manually
						r[0] = -1.570796;
						r[1] = -0.208742;
						r[2] += 1.570796;
					}
					data += "" + id + " " + pos[0].toFixed(6) + " " + pos[1].toFixed(6) + " " + pos[2].toFixed(6);
					data += " " + r[0].toFixed(6) + " " + r[1].toFixed(6) + " " + r[2].toFixed(6) + "\n";
				}
			}
		}

		data += "end\n";
		data += "triangles\n";
		
		var faces = mesh.faces;
		var vertices = mesh.vertices;
		for(var i=0;i<faces.length;i++){
			data += name + "\n";
			for(var j=0; j<3; j++){
				var v; // vertex
				if(j==0){ v = vertices[faces[i].x] }
				else if(j==1){ v = vertices[faces[i].y] }
				else { v = vertices[faces[i].z] }
				
				var px = v.position[0].toFixed(6);
				var py = v.position[1].toFixed(6);
				var pz = v.position[2].toFixed(6);
				var nx = v.normal[0].toFixed(6);
				var ny = v.normal[1].toFixed(6);
				var nz = v.normal[2].toFixed(6);
				var ucoord = v.uvcoord[0].toFixed(6);
				var vcoord = v.uvcoord[1].toFixed(6);
				var nbJoints = v.jointsID.length;
				
				// Some joints are attached to the joint 0 with weight 0, and we don't need them.
				for(var k=nbJoints-1; k>=0; k--){
					if(!v.jointsID[k]){
						nbJoints--; 
					}
				}
				
				data += "0 " + px + " " + py + " " + pz + " " + nx + " " + ny + " " + nz + " " + ucoord + " " + vcoord + " " +nbJoints;
				for(var k=0; k<nbJoints; k++){
					data += " " + v.jointsID[k];
					data += " " + v.weights[k].toFixed(6);
				}
				data += "\n";
			}
			
		}
		
	}
	
	var writeVTA = function(_model){
		if(!_model) return;
	
		var mesh = _model.mesh;
		var sk = _model.skeleton;

		// comments
		data += "// Created by PonyLumen's 3D Pony Creator\n"
		
		// version
		data += "version 1\n";
		
		// bones
		if(sk.joints.length){
			data += "nodes";
			data += "\n";
			for(var i=0;i<sk.joints.length;i++){
				var joint = sk.joints[i];
				var id = joint.index;
				var jname = joint.name;
				var parentID = -1; // -1 if no parent
				if(joint.parent){
					parentID = joint.parent.index;
				}
				data += "  " + id + ' "' + jname + '" ' + parentID + "\n";
			}
		}
		
		data += "end\n";
		data += "skeleton\n";

		// morphs list
		data += "time 0\n";
		for(var f=1; f<61;f++){ // 61 = morph number
			data += "time " + f +" # pony_moprh"+ f +"\n";
		}
		data += "end\n";
		data += "vertexanimation\n";
		
		data += "time 0\n";
		var k=0;
		for(var i=0;i<mesh.faces.length;i++){
			var tri = mesh.faces[i];
			var v1 = mesh.vertices[tri.x];
			// TODO change position to opos to correct male morph
			data += k +" "+ v1.position[0].toFixed(6) +" "+ v1.position[1].toFixed(6)+" "+ v1.position[2].toFixed(6)+" "+ v1.normal[0].toFixed(6)+" "+ v1.normal[1].toFixed(6)+" "+ v1.normal[2].toFixed(6)+"\n"; 
			k++;
			v1 = mesh.vertices[tri.y];
			data += k +" "+ v1.position[0].toFixed(6) +" "+ v1.position[1].toFixed(6)+" "+ v1.position[2].toFixed(6)+" "+ v1.normal[0].toFixed(6)+" "+ v1.normal[1].toFixed(6)+" "+ v1.normal[2].toFixed(6)+"\n"; 
			k++;
			v1 = mesh.vertices[tri.z];
			data += k +" "+ v1.position[0].toFixed(6) +" "+ v1.position[1].toFixed(6)+" "+ v1.position[2].toFixed(6)+" "+ v1.normal[0].toFixed(6)+" "+ v1.normal[1].toFixed(6)+" "+ v1.normal[2].toFixed(6)+"\n"; 
			k++;
		}
			
		// morphs pos and normal difference
		for(var f=1; f<61;f++){ // 61 = morph number
			k=0;
			data += "time " + f +"\n";
			for(var i=0;i<mesh.faces.length;i++){
				for(var l=0;l<3;l++){
					var v1;
					var tri = mesh.faces[i];
					if(l==0) v1 = mesh.vertices[tri.x];
					else if(l==1) v1 = mesh.vertices[tri.y];
					else v1 = mesh.vertices[tri.z];
					var v2 = mesh.vertices[v1.indexBS];
					for(var j=0; j<v2.morphID.length; j++){
						var morph_id = v2.morphID[j];
						if(morph_id == f){
							var p = v2.morphPosDiff[j];
							var n = v2.morphNormalDiff[j];
							data += k +" "+p[0].toFixed(6)+" "+p[1].toFixed(6)+" "+p[2].toFixed(6)+" "+n[0].toFixed(6)+" "+n[1].toFixed(6)+" "+n[2].toFixed(6)+"\n";
						}
					}
					k++;
				}
			}
			
		}
		
		data += "end\n";
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
		
		//data = "data:text/plain;charset=utf-8,";
		data = "";
		writeModel(inst.model,option,name);
		
		var smdName = name + '.smd';
		var textureName = name + '.png';
		zip.file(smdName, data);
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
	
	var addVTAToZip = function(inst,name){
		if(!inst.model) return;
		data = "";
		writeVTA(inst.model);
		var vtaName = name + '.vta';
		zip.file(vtaName, data);
	}
		
	this.save = function(){
	
		// create a new zip file
		zip = new JSZip();
		addToZip(pony,"pony");
		addVTAToZip(pony,"pony");
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


}

