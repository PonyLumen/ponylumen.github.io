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
 

function BinaryModel(){
	this.loadBinaryModel = function(_model) {

		// Read a binary model (.bm) file, and send the model to the shader.
	
		// 3d models have much data, so it is better to compress it into a binary file.
		
		// endianness : littleEndian 

		var local = false; // run on local or on the web
		
		model = _model;
		// init textures
		model.initTextures();
		
		var loc = window.location.pathname;
		var dir = loc.substring(0, loc.lastIndexOf('/'));
		var url = '';
		if(local){
			url = dir + '/' + model.filename;
		}
		else{
			url = model.filename;
		}
		;
		var xhr = new XMLHttpRequest();
		xhr.onreadystatechange=function() {
		  if(xhr.readyState==4){
		   if((xhr.status == 200) || ((xhr.status == 0) && local)){
		     var buffer = xhr.response; 
			 // alert(buffer.byteLength);
			 // We must use Dataview because it doesn't follow the alignment restrictions.
			 dataView = new DataView(buffer); 
		     // alert(xhr.status);
		     readFile();
			
		}}}
		xhr.open("GET",url,true);
		xhr.overrideMimeType('text/plain; charset=x-user-defined');
		xhr.responseType = 'arraybuffer';
		xhr.send();
		
	}

	var readFile = function(){
		mesh = new Mesh();
		skeleton = new AnimatedChain();
		
		ptr = 0; // keep track of the byteOffset.

		var version = readOneFloat32();
			
		// ---------------------
		// vertices 
		//
		var ovl = readOneInt32();
		mesh.setOriginalVertexLength(ovl);
			
		var verticesLength = readOneInt32();
		for(var i=0; i<verticesLength; i++){
			mesh.addVertex(new Vertex(0, 0, 0));
		}
		
		var positions = readFloat32Array();
		for(var i=0; i<positions.length/3; i++){
		   mesh.vertices[i].indexBS = i;
		   mesh.vertices[i].position[0] = positions[i*3];
		   mesh.vertices[i].position[1] = positions[i*3+1];
		   mesh.vertices[i].position[2] = positions[i*3+2];
	   }
	   
		var extraIndices = readInt32Array();
		for(var i=0; i<extraIndices.length; i++){
			mesh.vertices[ovl+i].indexBS = extraIndices[i];
		}
		
		var uvcoords = readFloat32Array();
		for(var i=0; i<uvcoords.length/2; i++){
		   mesh.vertices[i].uvcoord = vec2.createFrom(uvcoords[i*2],uvcoords[i*2+1]);
	    }
		
		var jointVertexNumber = readUint8Array();
		// continue only if skeleton
		if(jointVertexNumber.length){
			for(var i=0; i<jointVertexNumber.length; i++){
				mesh.vertices[i].jointsID.length = jointVertexNumber[i]; // should be between 1 to 4
				mesh.vertices[i].weights.length = jointVertexNumber[i];
			}
			
			var jointsID = readUint8Array();
			var weights = readFloat32Array();
			var k=0;
			var i=0;
			while(i<jointsID.length){
				for(var j=0; j<mesh.vertices[k].jointsID.length; j++){
					mesh.vertices[k].jointsID[j] = jointsID[i];
					mesh.vertices[k].weights[j] = weights[i];
					i++;
				}
				k++;
			}
		}
		else{
			// no skeleton
			// nothing to do
		}
	
		// blend shapes (morphs)
		var totalMorphNumber = readOneInt32(); 
		mesh.setMorphNumber(totalMorphNumber);
		
		if(totalMorphNumber){
			for(var i=0; i<mesh.getOriginalVertexLength(); i++){
				var vertex = mesh.vertices[i];
				var morphNb = readOneUint8(); // number of blend shapes for this vertex
				for(var j=0; j<morphNb; j++){
					var id = readOneUint8();
					vertex.morphID.push(id);
					
					var px = readOneFloat32();
					var py = readOneFloat32();
					var pz = readOneFloat32();
					var vecp = vec3.createFrom(px,py,pz);
					vertex.morphPosDiff.push(vecp);
					
					var nx = readOneFloat32();
					var ny = readOneFloat32();
					var nz = readOneFloat32();
					var vecn = vec3.createFrom(nx,ny,nz);
					vertex.morphNormalDiff.push(vecn);

				}
			}
		}
		
	
		// ---------------------
		// faces 
		//
		var faceVertexID = readUint16Array();
		for(var i=0; i<faceVertexID.length/3; i++){
			var tri = new Triangle(faceVertexID[i*3], faceVertexID[i*3+1], faceVertexID[i*3+2]);
			mesh.addTriangle(tri);
	    }
	   
	    // ---------------------
		// skeleton and joints 
		//

		var jointSize = readOneInt32();
		if(jointSize){ // if there is a skeleton
			var rootJointIndex = readOneInt32();
			
			var jointNames = readStringArray();
			for(var i=0; i<jointSize; i++){
				var joint = new Joint();
				joint.name = jointNames[i];
				skeleton.addJoint(joint);
				
			}
			skeleton.rootJoint = skeleton.joints[rootJointIndex];
			
			var jointparentIndices = readInt32Array();
			for(var i=0; i<jointparentIndices.length; i++){
				var idParent = jointparentIndices[i];
				if(idParent != -1){
					skeleton.joints[idParent].addChild(skeleton.joints[i]);
				}
				else{
					// the joint has no parent
				}
			}
			
			// skeleton.displayHierarchy();
			
			var frameNumber = readOneInt32();
			var animFloatArray = readFloat32Array();
			var l=0;
			for(var i=0; i<skeleton.joints.length; i++){
				for(var j=0; j<frameNumber; j++){
					var mat = mat4.create();
					for(var k=0; k<16; k++){
						mat[k] = animFloatArray[l];
						l++;
					}
					skeleton.joints[i].animMatrices.push(mat);
				}
			}
		}
		else{ // if no skeleton
			
			// TMP method, attach tongue, teeth, and eyelashes to the head joint
			for(var i=0; i<mesh.getOriginalVertexLength(); i++){
				mesh.vertices[i].jointsID.push(headID);
				mesh.vertices[i].weights.push(1.0);
			}
			
		
		}
		
		
		// ---------------------
		// checksum, to do
		//
		
		var checksum = readOneInt32();
		// alert(checksum);
		
		
		// ---------------------
		// end stuff
		//
		model.mesh = mesh;
		model.skeleton = skeleton;
		
		// init mesh stuff
		model.mesh.calculateCenter();
		model.mesh.calculateVmin();
		model.mesh.calculateVmax();
		model.mesh.calculateNormals();
		
		// init skeleton matrices
		if(skeleton.joints.length){
			skeleton.initMatrices();
		}
		
		// set flexible bones
		for(var i=0; i<skeleton.joints.length; i++){
			if(skeleton.joints[i].name.indexOf('jiggle_') == 0){ // if the joint's name starts with "jiggle_"
				skeleton.joints[i].setFlexible();
			}
		}
		
		// copy extra vertices data
		model.mesh.copyExtraVerticesData();
		
		if(model.useStickers){
			// for the body, for placing stickers
			model.mesh.calcualteTriCenter();
			model.mesh.computeTriangleNeighbors();
			for(var i=0;i<model.mesh.getOriginalVertexLength();i++){
				var jsize = model.mesh.vertices[i].jointsID.length;
				for(var j=jsize; j<4; j++){
					model.mesh.vertices[i].jointsID.push(0);
				}
				for(var j=jsize; j<4; j++){
					model.mesh.vertices[i].weights.push(0.0);
				}
			}
			initPickingShader(model);
		}
		
		 // send model to the shader
		initCharacterShader(model);
		
		if(model.useStickers){
			// place stickers by default
			var triID = 3898;
			
			// find the triangle neighbors
			var triIDs = model.mesh.findTriangleNeighbors(triID,3);
			
			// find the vertices
			var vertIDs = model.mesh.verticesFromTriangles(triIDs);

			for(var i = 0; i<8; i++){
				// init all the stickers
				var sticker = model.sticker[i];
				
				// project the uv
				sticker.uv = model.mesh.projectUVcoords(vertIDs,triID); 
				sticker.vertIDs = vertIDs;
				sticker.triIDs = triIDs;
				
				// init texture
				sticker.initStickerTexture("js/stickers/blank.png");
				
				// init shader
				initStickerShader1(model,vertIDs,triIDs,triID,sticker);
			}
			
			// init custom cutie mark (same as stickers)
			var lTriID = 7176;
			var rTriID = 3840;
			initSticker(model.lCutieMark,lTriID);
			initSticker(model.rCutieMark,rTriID);
			
		}
		
		if(model.bUsePickingID){
			initPickingIDShader(model);
		}
		model.setLoaded();
		
		
	} // end function
	 
	var readOneInt32 = function(){
		var i = dataView.getInt32(ptr,littleEndian);
		ptr += 4;
		return i;
	}
	
	var readOneFloat32 = function(){
		var f = dataView.getFloat32(ptr,littleEndian);
		ptr += 4;
		return f;
	}
	
	var readOneUint8 = function(){
		var c = dataView.getUint8(ptr,littleEndian);
		ptr += 1;
		return c;
	}
	
	var readUint8Array = function(){
		var size = dataView.getInt32(ptr,littleEndian);
		ptr += 4;
		var data = new Uint8Array(size);
		for(var i=0; i<size; i++){
			data[i] = dataView.getUint8(ptr,littleEndian);
			ptr += 1;
		}
		return data;
	}
	
	var readUint16Array = function(){
		var size = dataView.getInt32(ptr,littleEndian);
		ptr += 4;
		var data = new Uint16Array(size);
		for(var i=0; i<size; i++){
			data[i] = dataView.getUint16(ptr,littleEndian);
			ptr += 2;
		}
		return data;
	}
	
	var readInt32Array = function(){
		var size = dataView.getInt32(ptr,littleEndian);
		ptr += 4;
		var data = new Int32Array(size);
		for(var i=0; i<size; i++){
			data[i] = dataView.getInt32(ptr,littleEndian);
			ptr += 4;
		}
		return data;
	}
	
	var readFloat32Array = function(){
		var size = dataView.getInt32(ptr,littleEndian);
		ptr += 4;
		var data = new Float32Array(size);
		for(var i=0; i<size; i++){
			data[i] = dataView.getFloat32(ptr,littleEndian);
			ptr += 4;
		}
		return data;
	}
	
	var readStringArray = function(){
		var size = dataView.getInt32(ptr,littleEndian);
		ptr += 4;
		var data = Array(size);
		for(var i=0; i<size; i++){
			var str = readString();
			data[i] = str;
		}
		return data;
	}
	
	var readString = function(){
		var size = dataView.getInt32(ptr,littleEndian);
		ptr += 4;
		var ui8a = new Uint8Array(size);
		for(var i=0; i<size; i++){
			ui8a[i] = dataView.getUint8(ptr,littleEndian);
			ptr += 1;
		}
		var str = String.fromCharCode.apply(null, ui8a);
		return str;
	}
	
	var initSticker = function(sticker,triID){
		
		// find the triangle neighbors
		var triIDs = model.mesh.findTriangleNeighbors(triID,4);
		
		// find the vertices
		var vertIDs = model.mesh.verticesFromTriangles(triIDs);
		
		// project the uv
		sticker.uv = model.mesh.projectUVcoords(vertIDs,triID); 
		sticker.vertIDs = vertIDs;
		sticker.triIDs = triIDs;
		
		// init texture
		sticker.initStickerTexture("js/stickers/blank.png");
		
		// init shader
		initStickerShader1(model,vertIDs,triIDs,triID,sticker);
	
	
	}
	
	
	var model = 0;
	var mesh = 0;
	var skeleton = 0;
	var dataView = 0;
	var ptr = 0; // byte offset
	var littleEndian = true;
}
