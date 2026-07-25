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
 

function ColladaLoader(){

	// Read a collada (.dae) file, and send the model to the shader.

	// This class is poorly coded, and may not work with some collada files.
	// Perfer to use the BinaryModel loader instead.
	
	this.loadCollada = function(_model,_async) {
	
		model = _model;
		data = ' ';
		
		jQuery.ajaxSetup({async:_async});
		jQuery.get(model.filename, function(fdata) {

			data = fdata;
			meshs = new Array();
			skeleton = new AnimatedChain();
			tmp_weights = new Array();
			tmp_normals = new Array();
			tmp_uvcoords = new Array();
			ichar = 0;
			
			while(ichar < data.length){
				ichar++;
				if(data.charAt(ichar) != '<'){
					continue;
				}
				else{
					readTag();
				}
			}
			
			// end stuff
			model.skeleton = skeleton;
			model.mesh = meshs[0];
			
			// init mesh things
			model.mesh.calculateCenter();
			model.mesh.calculateVmin();
			model.mesh.calculateVmax();
			model.mesh.calculateNormals();
			if(skeleton.joints.length){
				model.mesh.reduceJointNumberTo(4);
				model.mesh.normalizeWeights(); 
			}
			model.mesh.prepareVBO();
			
			// init skeleton matrices
			if(skeleton.joints.length){
				skeleton.initMatrices();
			}
			
			// set flexible bones
			for(var i=0; i<skeleton.joints.length; i++){
				if(skeleton.joints[i].name.indexOf('"jiggle_') == 0){ // if the joint's name starts with "jiggle_"
					skeleton.joints[i].setFlexible();
				}
			}

			// init blend shapes (morphs)
			// not supported yet
			
			// init textures
			model.initTextures();
			
			// send model to the shader
			initCharacterShader(model);

			model.setLoaded();
		
			// end of the async function
		}, 'text');
		
	}
	
	var model;
	var data;
	var ichar;
	var meshs;
	var skeleton;
	var tmp_weights;
	var tmp_normals;
	var tmp_uvcoords;
	
	var readTag = function(){

		ichar++;
		var allTag = '';
		var element = '';
		while(data.charAt(ichar) != ' '){
			if(data.charAt(ichar) == '>'){
				break;
			}
			allTag = allTag + data.charAt(ichar);
			element = element + data.charAt(ichar);
			ichar++;
		}

		while(data.charAt(ichar) != '>'){
			allTag = allTag + data.charAt(ichar);
			ichar++;
		}
		
		var attribute = new Array();
		var str = allTag.split(" ");
		for(var i=1; i<str.length; i++){
			var keyval = str[i].split("=");
			attribute[keyval[0]] = keyval[1];
		}
		
		if(element == 'geometry'){
			meshs.push(new Mesh());
		}
		else if(element == 'float_array'){
			if(allTag.indexOf("POSITION") != -1){ // read vertex positions
				readVertexPositions();
			}
			else if(allTag.indexOf("Normal") != -1){ // read vertex normals
				readVertexNormals();
			}
			else if(allTag.indexOf("UV") != -1){ // read vertex uv
				readVertexUV();
			}
			else if(allTag.indexOf("Weights-array") != -1){	// read joints weights
				readWeights();
			}
		}
		else if(element == 'triangles'){ // read triangles
			readTriangles();
		}
		else if(element == 'input'){
			if(attribute['semantic'] == '"WEIGHT"'){
				readWeightJointsID();
			}
		}
		else if(element == 'Name_array'){
			if(allTag.indexOf('Joints-array') != -1){
				readJoints();
			}
		}
		else if(element == 'animation'){
			var joint = 0;
			if(allTag.indexOf('name=') != -1){
				var name = attribute['name'];
				for(var i=0; i < skeleton.joints.length; i++){
					if(skeleton.joints[i].name == name){
						joint = skeleton.joints[i];
						break;
					}
				}
			}
			if(joint){
				while(true){
				// to do, change this because it's a "poor" method
					if(data.charAt(ichar) == '>'){
						if(allTag.indexOf("</float_array") != -1){
							allTag = '';
						}
						if(allTag.indexOf("<float_array") != -1){
							if(allTag.indexOf("TIME") != -1){ 
								readAnimMatrices(joint);
								break;
							}
						}
					}
					allTag = allTag + data.charAt(ichar);
					ichar++;
				}
			}
		}
		else if(element == 'bind_shape_matrix'){
			var vals = readFloatArray();
			var mat = mat4.create();
			for(var j=0; j<16; j++){
				mat[j] = vals[j];
			}
			mat4.transpose(mat,mat);
			for(var i=0; i<meshs.length; i++){
				meshs[i].transform(mat);
			}
		}
		else if(element == 'node'){
			while(true){
				if(data.charAt(ichar) == '>'){
					if(allTag.indexOf("<matrix") != -1){
						var name = attribute['name'];
						// check if joint
						var jointID = -1;
						for(var i=0; i<skeleton.joints.length; i++){
							if(name == skeleton.joints[i].name){
								skeleton.rootJoint = skeleton.joints[i];
								jointID = i;
								break;
							}
						}
						if(jointID==-1){
							// not a joint
							var vals = readFloatArray();
							var mat = mat4.create();
							for(var j=0; j<16; j++){
								mat[j] = vals[j];
							}
							mat4.transpose(mat,mat);
							for(var i=0; i<meshs.length; i++){
								meshs[i].transform(mat);
							}
						}
						else{
							readJointHierarchy();
						}
						break;
					}
					else if(allTag.indexOf("</node") != -1){
						break;
					}
					else if(allTag.indexOf("</visual_scene") != -1){
						break;
					}
				}
					
				allTag = allTag + data.charAt(ichar);
				ichar++;
			}
		}
		else if(element == 'image'){
			// texture file
		}
	}


	var readVertexPositions = function(){

		var vals = readFloatArray();
		
		for(var i=0; i <vals.length; i+=3){
			meshs[meshs.length-1].addVertex(new Vertex(vals[i], vals[i+1], vals[i+2]));
		}
		
	}


	var readVertexNormals = function (){

		var vals = readFloatArray();
		
		for(var i=0; i <vals.length; i+=3){
			var vec = vec3.createFrom(vals[i], vals[i+1], vals[i+2]);
			tmp_normals.push(vec);
		}
		
	}


	var readVertexUV = function (){

		var vals = readFloatArray();
		
		for(var i=0; i <vals.length; i+=2){
			var vec = vec2.createFrom(vals[i], vals[i+1]);
			tmp_uvcoords.push(vec);
		}
		
	}


	var readWeights = function (){
	// this function can be replaced by readFloatArray()
		while(true){
			ichar++;
			// read 1 float
			
			if (data.charAt(ichar) == '<' ){
				break;
			}
			var val = '';
			
			while(data.charAt(ichar) != ' ' && data.charAt(ichar) != '\t' && data.charAt(ichar) != '\n'){
				if (data.charAt(ichar) == '<' ){
					ichar--;
					break;
				}
				val = val + data.charAt(ichar);
				ichar++;
			}

			val = parseFloat(val);
			
			if(!isNaN(val)){ // check if float
				tmp_weights.push(val);
			}	
		}
		
	}

	var readTriangles = function (){
		
		var vertexOffset = -1;
		var normalOffset = -1;
		var texcoordOffset = -1;
		
		while(true){
			// read element and attributes
			ichar++;
			var allTag = '';
			var element = '';
			while(data.charAt(ichar) != ' '){
				if(data.charAt(ichar) == '>'){
					break; // end of element
				}
				allTag = allTag + data.charAt(ichar);
				element = element + data.charAt(ichar);
				if(data.charAt(ichar) == '<'){
					element = ''; // new element
				}
				ichar++;
			}

			while(data.charAt(ichar) != '>'){
				allTag = allTag + data.charAt(ichar);
				ichar++;
			}
			
			var attribute = new Array();
			var str = allTag.split(" ");
			for(var i=1; i<str.length; i++){
				var keyval = str[i].split("=");
				attribute[keyval[0]] = keyval[1];
			}
				
			if(element == 'input'){
				if(attribute['semantic'] == '"VERTEX"'){
					var str = attribute['offset'];
					var strs = str.split('"');
					vertexOffset = parseInt(strs[1]);
				}
				else if(attribute['semantic'] == '"NORMAL"'){
					var str = attribute['offset'];
					var strs = str.split('"');
					normalOffset = parseInt(strs[1]);
				}
				else if(attribute['semantic'] == '"TEXCOORD"'){
					var str = attribute['offset'];
					var strs = str.split('"');
					texcoordOffset = parseInt(strs[1]);
				}
			}
			else if(element == 'p'){
				break;
			}
		}
		
		
		var range = 0;
		if(vertexOffset != -1) range++;
		if(normalOffset != -1) range++;
		if(texcoordOffset != -1) range++;
		
		var vals = readIntArray();

		var r3 = range*3;
		var r2 = range*2;
		var t1 = texcoordOffset;
		var t2 = texcoordOffset+range;
		var t3 = texcoordOffset+r2;
		var n1 = normalOffset;
		var n2 = normalOffset+range;
		var n3 = normalOffset+r2;
		
		// create triangles
		for(var i=0; i <vals.length; i+=r3){
		
			var tri = new Triangle(vals[i], vals[i+range], vals[i+r2]);
			// uv coords
			//if(texcoordOffset != -1){
			  tri.u0 = tmp_uvcoords[vals[i+t1]][0];
			  tri.u1 = tmp_uvcoords[vals[i+t2]][0];
			  tri.u2 = tmp_uvcoords[vals[i+t3]][0];
			  tri.v0 = tmp_uvcoords[vals[i+t1]][1];
			  tri.v1 = tmp_uvcoords[vals[i+t2]][1];
			  tri.v2 = tmp_uvcoords[vals[i+t3]][1];
			//}
			
			// normals
			//if(normalOffset != -1){
				//meshs[meshs.length-1].vertices[tri.x].normal = tmp_normals[vals[i+n1]]; 
				//meshs[meshs.length-1].vertices[tri.y].normal = tmp_normals[vals[i+n2]]; 
				//meshs[meshs.length-1].vertices[tri.z].normal = tmp_normals[vals[i+n3]]; 
			//}
				
			meshs[meshs.length-1].addTriangle(tri);
		}

	}

	var readWeightJointsID = function (){
		var element = '';
		while(element.indexOf("<vcount>") == -1){
			ichar++;
			element = element + data.charAt(ichar);
		}
		
		var vals = readIntArray(); // joints number attached to each vertex
		
		// ------
		
		element = '';
		while(element.indexOf("<v>") == -1){
			ichar++;
			element = element + data.charAt(ichar);
		}
		
		var vals2 = readIntArray(); // jointsID and weightsID
		
		// store data
		var k = 0;
		for(var i = 0; i < vals.length ; i++){
			for(var j = 0; j < vals[i]; j++){ // vals[i] is the numbers of joints attached to the vertex i; usually, vals[i] = 4.
				meshs[0].vertices[i].jointsID.push(vals2[k]);
				k++;
				meshs[0].vertices[i].weights.push(tmp_weights[vals2[k]]);
				k++;
			}
		}
		
	}

	var readIntArray = function (){
		// read values until '<' appears
		vals = new Array();
		while(true){	

			ichar++;
			// read 1 value (integer)
					
			if (data.charAt(ichar) == '<' ){
				break;
			}
			
			var val = '';
			
			while(data.charAt(ichar) != ' ' && data.charAt(ichar) != '\t' && data.charAt(ichar) != '\n'){
				if (data.charAt(ichar) == '<' ){
					ichar--;
					break;
				}
				val = val + data.charAt(ichar);
				ichar++;
			}


			val = parseInt(val);
			
			if(!isNaN(val)){ // check if this is a number
				vals.push(val);
			}	
			
		}
		return vals;
	}

	var readFloatArray = function (){
		// read values until '<' appears
		vals = new Array();
		while(true){	

			ichar++;
			// read 1 value (float)
					
			if (data.charAt(ichar) == '<' ){
				break;
			}
			
			var val = '';
			
			while(data.charAt(ichar) != ' ' && data.charAt(ichar) != '\t' && data.charAt(ichar) != '\n'){
				if (data.charAt(ichar) == '<' ){
					ichar--;
					break;
				}
				val = val + data.charAt(ichar);
				ichar++;
			}

			val = parseFloat(val);
			
			if(!isNaN(val)){ // check if this is a number
				vals.push(val);
			}	
			
		}
		return vals;
	}

	var readStringArray = function (){
		// read values until '<' appears
		vals = new Array();
		while(true){	

			ichar++;
			// read 1 value (float)
					
			if (data.charAt(ichar) == '<' ){
				break;
			}
			
			var val = '';
			
			while(data.charAt(ichar) != ' ' && data.charAt(ichar) != '\t' && data.charAt(ichar) != '\n'){
				if (data.charAt(ichar) == '<' ){
					ichar--;
					break;
				}
				val = val + data.charAt(ichar);
				ichar++;
			}
			
			if(val.length > 0){
				vals.push(val);
			}

		}
		return vals;
	}

	var readJoints = function (joint){
		var vals = readStringArray(); 
		for(var i=0; i<vals.length; i++){
			var joint = new Joint();
			joint.name = '"' + vals[i] + '"';
			skeleton.addJoint(joint);
		}
	}
				
	var readAnimMatrices = function (joint){
		var vals = readFloatArray(); 

		for(var i=0; i<vals.length; i+=16){
			var mat = mat4.create();
			for(var j=0; j<16; j++){
				mat[j] = vals[i+j];
			}
			mat4.transpose(mat,mat);
			joint.animMatrices.push(mat);
		}

	}

	var readJointHierarchy = function(){

		var joint = skeleton.rootJoint;
		var jointID = joint.index;

		if(joint.animMatrices.length == 0){
			// if we dont have any animation, init to the bind pose
			var vals = readFloatArray(); 
			var mat = mat4.create();
			for(var j=0; j<16; j++){
				mat[j] = vals[j];
			}
			mat4.transpose(mat,mat);
			joint.animMatrices.push(mat);
		}
						
		while (true){
			while(data.charAt(ichar) != '<'){
				ichar++;
			}
			ichar++;
			var allTag = '';
			var element = '';
			while(data.charAt(ichar) != ' '){
				if(data.charAt(ichar) == '>'){
					break;
				}
				allTag = allTag + data.charAt(ichar);
				element = element + data.charAt(ichar);
				ichar++;
			}

			while(data.charAt(ichar) != '>'){
				allTag = allTag + data.charAt(ichar);
				ichar++;
			}
			
			var attribute = new Array();
			var str = allTag.split(" ");
			for(var i=1; i<str.length; i++){
				var keyval = str[i].split("=");
				attribute[keyval[0]] = keyval[1];
			}
			
			if(element == 'node'){
				var str = attribute['name'];
				for(var i=0; i<skeleton.joints.length; i++){
					if(str == skeleton.joints[i].name){
						jointID = i;
						break;
					}
				}
				
				joint.addChild(skeleton.joints[jointID]);	
				joint = skeleton.joints[jointID];
			}
			else if (element == '/node'){
				joint = joint.parent;
				if(!joint) break; // end the loop
			}
			else if (element == 'matrix'){
				// if we dont have any animation, init to the bind pose
				if(joint.animMatrices.length == 0){
					var vals = readFloatArray(); 
					var mat = mat4.create();
					for(var j=0; j<16; j++){
						mat[j] = vals[j];
					}
					mat4.transpose(mat,mat);
					joint.animMatrices.push(mat);
				}
			}
		}

	}

}
