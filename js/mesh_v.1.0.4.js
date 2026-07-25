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
 
 
 // http://stackoverflow.com/questions/13486479/javascript-array-unique
var arrayUnique = function(a) {
	return a.reduce(function(p, c) {
		if (p.indexOf(c) < 0) p.push(c);
		return p;
	}, []);
};

function Mesh()
{
	this.vertices = new Array();
	this.faces = new Array();
	
	var center = 0; 
	var vmin = 0;
	var vmax = 0;
	var originalVertexLength = 0;
	var morphNumber = 0;
	
	this.addVertex=addVertex;
	function addVertex(vertex)
	{
		vertex.indexBS = this.vertices.length;
		this.vertices.push(vertex);
		
	}
	
	this.addTriangle=addTriangle;
	function addTriangle(tri)
	{
		this.faces.push(tri);
	}
	
	this.transform=transform;
	function transform(mat){
		for(var i=0; i< this.vertices.length; i++){
			var pos = vec4.create();
			pos[0] = this.vertices[i].position[0];
			pos[1] = this.vertices[i].position[1];
			pos[2] = this.vertices[i].position[2];
			pos[3] = 1.0;
			var finalpos = mat4.multiplyVec4(mat,pos);
			this.vertices[i].position[0] = finalpos[0];
			this.vertices[i].position[1] = finalpos[1];
			this.vertices[i].position[2] = finalpos[2];
		}
	}
	
	this.calculateCenter = function(){
		var v = vec3.create();
		for(var i=0; i<this.vertices.length; i++){
			vec3.add(v,this.vertices[i].position,v);
		}
		v[0] = v[0] / this.vertices.length;
		v[1] = v[1] / this.vertices.length;
		v[2] = v[2] / this.vertices.length;
		center = v;
	}
	
	this.getCenter = function() {
		return(center);
	} 
	
	this.calculateVmin = function(){
		var v = vec3.create();
		v[0] = this.vertices[0].position[0];
		v[1] = this.vertices[0].position[1];
		v[2] = this.vertices[0].position[2];
		for(var i=0; i<this.vertices.length; i++){
			v[0] = Math.min(v[0], this.vertices[i].position[0]);
			v[1] = Math.min(v[1], this.vertices[i].position[1]);
			v[2] = Math.min(v[2], this.vertices[i].position[2]);
		}
		vmin = v;
	}

	this.getVmin = function() {
		return(vmin);
	} 
	
	this.calculateVmax = function(){
		var v = vec3.create();
		v[0] = this.vertices[0].position[0];
		v[1] = this.vertices[0].position[1];
		v[2] = this.vertices[0].position[2];
		for(var i=0; i<this.vertices.length; i++){
			v[0] = Math.max(v[0], this.vertices[i].position[0]);
			v[1] = Math.max(v[1], this.vertices[i].position[1]);
			v[2] = Math.max(v[2], this.vertices[i].position[2]);
		}
		vmax = v;
	}
	
	this.getVmax = function() {
		return(vmax);
	} 
	
	this.setOriginalVertexLength = function(i){
		originalVertexLength = i;
	}
	
	this.getOriginalVertexLength = function(){
		return originalVertexLength;
	}
	
	this.setMorphNumber = function(i){
		morphNumber = i;
	}
	
	this.getMorphNumber = function(){
		return morphNumber;
	}
	
	this.calculateNormals = function(){
		// only works for triangles

		// Calculate normals for each face 
		for(var i=0; i < this.faces.length; i++){
			var tri = this.faces[i];
			var v1 = vec3.create();
			var v2 = vec3.create();
			var v1ID = this.vertices[tri.x].indexBS;
			var v2ID = this.vertices[tri.y].indexBS;
			var v3ID = this.vertices[tri.z].indexBS;
			vec3.subtract(this.vertices[v1ID].position, this.vertices[v2ID].position, v1);
			vec3.subtract(this.vertices[v1ID].position, this.vertices[v3ID].position, v2);
			tri.normal = vec3.create();
			vec3.cross(v1,v2,tri.normal);
			vec3.normalize(tri.normal);
		}
		
		// Calculate normals for each vertex 
		for(var i=0; i < this.vertices.length; i++){
			this.vertices[i].normal = vec3.createFrom(0,0,0);
		}
		for(var i=0; i < this.faces.length; i++){
			var tri = this.faces[i];
			var v1ID = this.vertices[tri.x].indexBS;
			var v2ID = this.vertices[tri.y].indexBS;
			var v3ID = this.vertices[tri.z].indexBS;
			var vertex1 = this.vertices[v1ID];
			var vertex2 = this.vertices[v2ID];
			var vertex3 = this.vertices[v3ID];
			vec3.add(vertex1.normal,tri.normal);
			vec3.add(vertex2.normal,tri.normal);
			vec3.add(vertex3.normal,tri.normal);
		}
		for(var i=0; i < this.vertices.length; i++){
			vec3.normalize(this.vertices[i].normal);
		}
	}
	
	var bTriNeighborsDone = false;
	this.computeTriangleNeighbors = function(){
		if(bTriNeighborsDone) return;
		bTriNeighborsDone = true;
		for(var i=0; i < this.faces.length; i++){
			var tri = this.faces[i];
			// use the original vertices
			var v1ID = this.vertices[tri.x].indexBS;
			var v2ID = this.vertices[tri.y].indexBS;
			var v3ID = this.vertices[tri.z].indexBS;
			var vertex1 = this.vertices[v1ID];
			var vertex2 = this.vertices[v2ID];
			var vertex3 = this.vertices[v3ID];
			vertex1.trianglesID.push(i);
			vertex2.trianglesID.push(i);
			vertex3.trianglesID.push(i);
		}
		for(var i=0; i < this.faces.length; i++){
			var tri = this.faces[i];
			// use the original vertices
			var v1ID = this.vertices[tri.x].indexBS;
			var v2ID = this.vertices[tri.y].indexBS;
			var v3ID = this.vertices[tri.z].indexBS;
			var vertex1 = this.vertices[v1ID];
			var vertex2 = this.vertices[v2ID];
			var vertex3 = this.vertices[v3ID];
			tri.neighbors = tri.neighbors.concat(vertex1.trianglesID);
			tri.neighbors = tri.neighbors.concat(vertex2.trianglesID);
			tri.neighbors = tri.neighbors.concat(vertex3.trianglesID);
			tri.neighbors = arrayUnique(tri.neighbors);
			// remove the triangle id (otherwise, it's a neighbor of itself)
			var a = tri.neighbors.indexOf(i); 
			if (a > -1) {
				tri.neighbors.splice(a, 1);
			}
		}
	}
	this.calcualteTriCenter = function(){
		for(var i=0; i < this.faces.length; i++){
			var tri = this.faces[i];
			var v1ID = this.vertices[tri.x].indexBS;
			var v2ID = this.vertices[tri.y].indexBS;
			var v3ID = this.vertices[tri.z].indexBS;
			var vertex1 = this.vertices[v1ID];
			var vertex2 = this.vertices[v2ID];
			var vertex3 = this.vertices[v3ID];
			var x = (vertex1.position[0] + vertex2.position[0] + vertex3.position[0])/3;
			var y = (vertex1.position[1] + vertex2.position[1] + vertex3.position[1])/3;
			var z = (vertex1.position[2] + vertex2.position[2] + vertex3.position[2])/3;
			tri.center = vec3.createFrom(x,y,z);
		}
	}
	
/*
	this.findTriangleNeighbors = function(triID,nb){
		// ! too long : 50 ms for nb = 3;
		// triID : the triangle index
		// nb : number of steps
		// note : this function can be optimized a lot.
		var triIDArray = new Array(); // This should be a set, but javascript doesn't handle sets.
		triIDArray.push(triID);
		for(var i=0; i<nb; i++){
			var tmpArray = new Array();
			for(var j=0; j<triIDArray.length; j++){
				var id = triIDArray[j];
				var tmpArray = tmpArray.concat(this.faces[id].neighbors); 
			}
			triIDArray = triIDArray.concat(tmpArray);
		}
		return arrayUnique(triIDArray);
	}*/
	
	this.findTriangleNeighbors = function(triID,nb){
		
		// triID : the triangle index
		// nb : number of steps
		// to do : optimize speed
		
		if (triID==16777215){ // 1.0.4 fix  // 16777215 = 0xFFFFFF, means sticker isn't on the pony
			return 0;
		}
		
		var a = new Array(); 
		a.push(new Array()); // This should be a set, but javascript doesn't handle sets.
		a[0].push(triID);	
		//var s = new Array(this.faces.length); 
		var s = new Array(); 
		for(var i=0; i<this.faces.length; i++){
			s.push(false);
		}
		s[triID] = true;
		
		for(var i=0; i<nb; i++){
			a.push(new Array());
			for(var j=0; j<a[i].length; j++){
				var fid = a[i][j]; // face id
				var tri = this.faces[fid];
				for(var k=0; k<tri.neighbors.length; k++){
					var nid = tri.neighbors[k];// neighbor id
					if(!s[nid]){
						s[nid] = true;
						a[i+1].push(nid); // simulate a set
					}
				}
			}
		}
		
		var finalArray = new Array(); 
		// organize data
		for(var i=0; i<a.length; i++){
			finalArray = finalArray.concat(a[i]);
		}
		return finalArray;
	}
	
	
	this.verticesFromTriangles = function(triIDs){
		// to do : optimize speed
		var vertIDs = new Array();
		for(var i=0; i<triIDs.length; i++){
			var tri = this.faces[triIDs[i]];
			// use the original vertices
			var v1ID = this.vertices[tri.x].indexBS;
			var v2ID = this.vertices[tri.y].indexBS;
			var v3ID = this.vertices[tri.z].indexBS;
			vertIDs.push(v1ID);
			vertIDs.push(v2ID);
			vertIDs.push(v3ID);
		}
		return arrayUnique(vertIDs);
	}
	
	/*this.projectUVcoords = function(vertIDs,triID){
		var n = triID.normal;
		var newUVs = new Array();
		for(var i=0; i<vertIDs.length; i++){
			var vertex = this.vertices[vertIDs[i]];
			var v1 = vertex.position;
			var v2 = vec3.createFrom(0,0,0);
			var v3 = vec3.create();
			vec3.subtract(v1,v2,v3);
			var d = vec3.dot(v3,n);
			var nd = vec3.create();
			vec3.scale(n,d,nd);
			var uv = vec3.create();
			vec3.subtract(v1,nd,uv);
			newUVs.push(uv);
		}
		return newUVs;
		
	}*/
	
	this.projectUVcoords = function(vertIDs,triID){
	
		var tri = this.faces[triID];
		var pos = vec3.create();
		var vm = mat4.create();
		var pm = mat4.create();
		var vpm = mat4.create();
		var up = vec3.createFrom(0,1,0);
		vec3.add(tri.center,tri.normal,pos);
		mat4.lookAt(pos, tri.center, up, vm);
		mat4.ortho(-0.5,0.5,-0.5,0.5,0.1,100.0,pm);
		mat4.multiply(pm,vm,vpm);
		
		var newUVs = new Array();
		for(var i=0; i<vertIDs.length; i++){
			var vertex = this.vertices[vertIDs[i]];
			var finalPos = vec4.create();
			var vpos = vec4.createFrom(vertex.position[0],vertex.position[1],vertex.position[2],1.0);
			mat4.multiplyVec4(vpm,vpos,finalPos);
			var uv = vec2.createFrom(finalPos[0],finalPos[1]);
			newUVs.push(uv);
		}
		return newUVs;
		
	}
	
	
	this.reduceJointNumberTo = function(nb) {
	// used for gpu skinning (reduce to 4 joints)
	// the lowest weights are removed and the 4 others are normalized
		if(nb < 1) return;
		for(var i = 0; i < this.vertices.length; i++){
			if(nb >= this.vertices[i].jointsID.length) continue; // don't need to reduce
		
			var jw = new Array();
			for(var j=0; j<this.vertices[i].jointsID.length ; j++){
				jw[j] = [this.vertices[i].jointsID[j], this.vertices[i].weights[j]];
			}
			jw.sort (function(a,b){return(b[1]-a[1])}); // sort by weight (numerically and descending)
			
			// normalization
			var totalweight = 0.0;
			for(var j=0; j<nb; j++){
				totalweight += jw[j][1];
			}
			this.vertices[i].jointsID.length = 0;
			this.vertices[i].weights.length = 0;
			for(var j=0; j<jw.length; j++){
				this.vertices[i].jointsID[j] = jw[j][0];
				this.vertices[i].weights[j] = jw[j][1] / totalweight;
			}
		}
	} 
	
	this.normalizeWeights = function() {
		// set weights sum = 1
		for(var i = 0; i < this.vertices.length; i++){
			var totalweight = 0.0;
			for(var j=0; j<this.vertices[i].weights.length; j++){
				totalweight += this.vertices[i].weights[j];
			}
			for(var j=0; j<this.vertices[i].weights.length; j++){
				this.vertices[i].weights[j] = this.vertices[i].weights[j] / totalweight;
			}
		}
	}
	
	this.prepareVBO = function() {
		// (this function should be renamed)
		
		// duplicate vertices with same pos and normal but different texcoord 
		// because vertices must have the same attributes in the shader
		
		// IMPORTANT, normals have to be calculated at this step, because of "bad" models (bad 
		// shaping, with non-distinct vertices).
		// (one of my model had a "bad" shape)
	
		originalVertexLength = this.vertices.length;
		
		// first pass, init all vertex texcoord
		for(var i = 0; i < this.faces.length; i++){
			var tri = this.faces[i];
			// vertex 1
			this.vertices[tri.x].uvcoord =  vec2.createFrom(tri.u0,tri.v0);

			// vertex 2
			this.vertices[tri.y].uvcoord =  vec2.createFrom(tri.u1,tri.v1);

			// vertex 3
			this.vertices[tri.z].uvcoord =  vec2.createFrom(tri.u2,tri.v2);
		}

		// second pass, if the same vertex has 2 different texcoords, then duplicate this vertex
		for(var i=0; i < this.faces.length; i++){
			// vertex 1
			
			var tri = this.faces[i];
			for(var k=0; k<3; k++){
				var current_vertex_index; // unsigned int
				var u_face; // float
				var v_face; // float
				if(k==0) {
					current_vertex_index = tri.x;
					u_face = tri.u0;
					v_face = tri.v0;
				}
				else if(k==1) {
					current_vertex_index = tri.y;
					u_face = tri.u1;
					v_face = tri.v1;
				}
				else if(k==2) {
					current_vertex_index = tri.z;
					u_face = tri.u2;
					v_face = tri.v2;
				}

				var current_vertex = this.vertices[current_vertex_index]; // Vertex
				var u_vertex = current_vertex.uvcoord[0]; // float
				var v_vertex = current_vertex.uvcoord[1]; // float

				//if the same vertex has 2 different texcoords
				if((u_vertex != u_face) || (v_vertex != v_face)){
				
				// it should be written as :
				// if((Math.abs(u_vertex - u_face) >= epsilon) || (Math.abs(v_vertex - v_face) >= epsilon)){
				// but it works either way.
				
					// search if another vertex with same pos, normal and coord exists
					var found = false; // bool
					// i'm not sure if this loop is necessary
					for(var j = 0; j < this.vertices.length; j++){
						if(j == current_vertex_index) continue;// same vertex
						if( 
							vec3.equal(current_vertex.position,this.vertices[j].position) &&
							vec3.equal(current_vertex.normal,this.vertices[j].normal) &&
							vec2.equal(current_vertex.uvcoord,this.vertices[j].uvcoord)
						)
						{
							//  same pos, normal and coord
							found = true;
							if(k==0) tri.x = j;
							else if(k==1) tri.y = j;
							else if(k==2) tri.z = j;
							break;
						}
					}
					
					// else, we need to create a new vertex
					if (!found){
						var new_vertex = Vertex.copy(current_vertex);
						new_vertex.uvcoord[0] = u_face; 
						new_vertex.uvcoord[1] = v_face; 
						this.addVertex(new_vertex);
						new_vertex.indexBS = current_vertex.indexBS;
						if(k==0) tri.x =  this.vertices.length-1;
						else if(k==1) tri.y = this.vertices.length-1;
						else if(k==2) tri.z = this.vertices.length-1;
					}
				}
			}
		}
	 
	 //alert(this.vertices.length);
	}
	
	this.copyExtraVerticesData = function() {
		for(var i = originalVertexLength; i<this.vertices.length; i++){
			var newVertex = this.vertices[i];
			var vID = newVertex.indexBS;
			var vertex = this.vertices[vID];
			newVertex.position[0] = vertex.position[0];
			newVertex.position[1] = vertex.position[1];
			newVertex.position[2] = vertex.position[2];
			newVertex.normal = vec3.create(vertex.normal);
			for(var j=0; j< vertex.jointsID.length; j++) {
				newVertex.jointsID.push(vertex.jointsID[j]);
			}
			for(var j=0; j< vertex.weights.length; j++) {
				newVertex.weights.push(vertex.weights[j]);
			}
		}
	}
	
} //end of class

function Vertex(x,y,z)
{
	// Vertices beyond the originalVertexLength share position, normal, jointsID, and weights with another vertex.
	// They refer to another vertex through their index.
	// However, they have their own uvcoord.

	this.indexBS = 0; // vertex original index used for blend shape (should be renamed) (int)
	this.position = vec3.createFrom(x,y,z); //  males change positions
	this.normal = 0; // vec3
	this.uvcoord = 0; // vec2
	this.jointsID = new Array(); // array of int
	this.weights = new Array(); // array of float
	this.opos = new Array(); // original position (never change)
	
	// blend shape / morph
	
	// the blend shape indices which impact the vertex.
	this.morphID = new Array(); // array of int
	
	this.morphPosDiff = new Array(); // array of vec3
	this.morphNormalDiff = new Array(); // array of vec3


	this.trianglesID = new Array(); // triangles sharing this vertex
	
	this.tmpID = 0; // tmp id for stickers
}

Vertex.copy = function(vertex){
	// Copy all the atributes except index to a vertex from an other.
	var newVertex = new Vertex(vertex.position[0],vertex.position[1],vertex.position[2]);
	newVertex.normal = vec3.create(vertex.normal);
	newVertex.uvcoord = vec2.create(vertex.uvcoord);
	for(var i=0; i< vertex.jointsID.length; i++) {
		newVertex.jointsID.push(vertex.jointsID[i]);
	}
	for(var i=0; i< vertex.weights.length; i++) {
		newVertex.weights.push(vertex.weights[i]);
	}
	return newVertex;
}

function Triangle(x,y,z)
{
	// x,y,z are the indices of the vertices
	this.x = x;
	this.y = y;
	this.z = z;
	
	this.center = 0;// vec3
	this.neighbors = new Array(); // indices (uint)
	this.normal = 0; // vec3
	this.u0 = 0; // float, u coord of the first vertex 
	this.u1 = 0; //                       second vertex 
	this.u2 = 0; //                       third vertex 
	this.v0 = 0; // float, v coord of the first vertex 
	this.v1 = 0; //                       second vertex 
	this.v2 = 0; //                       third vertex 
	
}



