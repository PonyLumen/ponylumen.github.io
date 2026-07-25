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

function ModelCharacter(_id)
{
	var self = this;
	this.id = _id;
	this.animations = new Array();
	this.filename = '';
	this.mesh = 0; // Mesh
	this.skeleton = 0; // AnimatedChain
	this.maxColors = 2; // number of colors max by default(doesn't count gradient, nor shading colors)
	this.jointID = 0;
	
	// only for hair front (the headgear place depends of the hair)
	this.headgearOffset = vec3.createFrom(0.0,0.0,0.0); 
	
	this.textureFilename = '';
	this.texture1Filename = "js/models/pony/blank.png";
	
	this.texture = new Array(); 
	//this.texture[0] = 0;
	//this.texture[1] = 0;
	this.textureLoadState = new Array();
	this.textureLoadState[0] = 0;  // 0 : IS_NOT_LOADED,
							// 1 : deprecated
							// 2 : IS_LOADED
	this.textureLoadState[1] = 0;			
	this.clampToEdge = false;
	
	var bMorphing = false; 
	// true if the model has morphs, 
	// false if the model has no morphs, or if the computer doesn't handle morph textures.
	this.morphTexture = 0;
	// 1024 * 1024 is ok for containing all the data. Note : larger textures than 2048*2048 are not compatible with some computers.
	var morphTextureWidth = 1024; 
	var morphTextureHeight = 1024;
	
	
	var bUsePickingID = false; // new in 0.9.7
	
	
	
	this.VertexIndexBuffer = 0;
	this.VertexPositionBuffer = 0;
	this.VertexNormalBuffer = 0;
	this.JointBuffer = 0;
	this.WeightBuffer = 0;
	this.UVBuffer = 0;
	this.MorphOffsetBuffer = 0;
	
	this.VertexPositionBufferPicking = 0;
	this.WeightBufferPicking = 0;
	this.VertexIndexBufferPicking = 0;
	this.JointBufferPicking = 0;
	this.aTriangleIDBufferPicking = 0;
	
	this.VertexIndexBufferPickingID = 0;
	this.VertexPositionBufferPickingID = 0;
	this.JointBufferPickingID = 0;
	this.WeightBufferPickingID = 0;
	
	// Stickers
	this.lCutieMark = new Sticker(0);
	this.rCutieMark = new Sticker(0);
	this.rCutieMark.reverse = true;
	this.lCutieMark.uscale = 0.1; // scale
	this.lCutieMark.vscale = 0.1; 
	this.rCutieMark.uscale = 0.1; 
	this.rCutieMark.vscale = 0.1;
	this.sticker = new Array();
	for(var i=0; i<8; i++){
		this.sticker[i] = new Sticker(i);
	}
	
	this.useStickers = false; // true for the body
	
	var loadState = 0; // 0 : IS_NOT_LOADED,
					   // 1 : IS_LOADING
					   // 2 : IS_LOADED

	this.isFullyLoaded = function(){
		// Function called before drawing a model.
		// Return true if data and textures loaded, and shader ready.
		if((this.getLoadState() == 2) && (this.texturesAreLoaded())){
			return true;
		}
		else{
			return false;
		}
	}
	this.getLoadState = function(){
		return loadState;
	}
	this.texturesAreLoaded = function(){
		if((this.textureLoadState[0] == 2) && (this.textureLoadState[1] == 2)){
			return true;
		}
		else{
			return false;
		}
	}
	this.setLoading = function(){
		loadState = 1;
	}
	this.setLoaded = function(){
		loadState = 2;
	}
			
	
			
	this.initTexture = function(src,i){
	  var texture = gl.createTexture(); 
	  texture.image = new Image();
	  texture.image.onload = function() { 
		handleTextureLoaded(texture.image, texture, i); 
	  }
	  texture.image.src = src;
	}
    

	this.initTextures = function(){
		this.initTexture(this.textureFilename,0);
		this.initTexture(this.texture1Filename,1);
	}
	
    function handleTextureLoaded(image, texture, i) {
	  gl.bindTexture(gl.TEXTURE_2D, texture);
	  gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, image);
	  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
	  //gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR_MIPMAP_NEAREST);
	  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
	  if(self.clampToEdge){
		  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE); //Prevents s-coordinate wrapping (repeating).
		  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE); //Prevents t-coordinate wrapping (repeating).
	  }
	  gl.generateMipmap(gl.TEXTURE_2D);
	  gl.bindTexture(gl.TEXTURE_2D, null);
	  self.deleteTexture(self.texture[i],i);
	  self.texture[i] = texture;
	  self.textureLoadState[i] = 2;
	}
	
	this.deleteTexture = function(texture,i){
		if(texture){
		    gl.deleteTexture(texture);
		}
		this.textureLoadState[i] = 0;
	}
	
	
	/**
     * create a new animation
     *
     * @param {string} name animation name 
     * @param {int} begin beginning frame
     * @param {int} end ending frame
	 *
     * @returns {bool} true or false
     */
	this.createAnimation = function(name, begin, end){
		if (end < begin) {
			return false; 
		}
		this.animations[name] = [begin, end];
		return true;
	}
	
	
	
	this.getMorphTextureWidth = function(){
		return morphTextureWidth;
	}
	
	this.getMorphTextureHeight = function(){
		return morphTextureHeight;
	}

	this.setMorphTextureWidth = function(w){
		morphTextureWidth = w;
	}
	
	this.setMorphTextureHeight = function(h){
		morphTextureHeight = h;
	}
	
	this.getbMorphing = function(){
		return bMorphing;
	}
	
	this.setbMorphing = function(b){
		bMorphing = b;
	}
}

// Sticker class
function Sticker(_id){
	var self = this;
	this.id = _id; // id of the sticker, 0 to 7
	
	this.htmlid = 0;
	this.src = 0;
	this.uv; // Array of vec2
	this.angle = 0; // in radians
	this.uscale = 0.2; // scale
	this.vscale = 0.2;
	this.ut = 0.5; // translation
	this.vt = 0.5;
	this.reverse = false;
	this.triID = 0;
	this.triIDs = 0; // stored for speed
	this.vertIDs = 0; // stored for speed
	
	this.display = false;
	this.texture;
	this.morphTexture = 0;
	var stickerMorphTextureWidth = 128; // allows around 200 vertices, with 19 moprhs
	var stickerMorphTextureHeight = 128; 
	this.faceNumber = 0;
	this.aVertexIndexBufferSticker = 0;
	this.aVertexPositionBufferSticker = 0;
	this.aVertexNormalBufferSticker = 0;
	this.aJointBufferSticker = 0;
	this.aWeightBufferSticker = 0;
	this.aUVBufferSticker = 0;
	this.aMorphOffsetBufferSticker = 0;
	
	this.getStickerMorphTextureWidth = function(){
		return stickerMorphTextureWidth;
	}
	
	this.getStickerMorphTextureHeight = function(){
		return stickerMorphTextureHeight;
	}
	
	this.setStickerMorphTextureWidth = function(w){
		stickerMorphTextureWidth = w;
	}
	
	this.setStickerMorphTextureHeight = function(h){
		stickerMorphTextureHeight = h;
	}
	
	
	function handleStickerTextureLoaded(image, texture) {
	
		var width = image.width;
		var height = image.height;
		var tmpcanvas = document.createElement('canvas');
		tmpcanvas.width = width;
		tmpcanvas.height = height;
		var context = tmpcanvas.getContext('2d');
		
		// Draw an image for getting the data.
		context.drawImage(image, 0, 0 );
		var imgData = context.getImageData(0, 0, width, height);
		
		var data = new Uint8Array(width * height * 4);
		for (var i=0;i<data.length;i++){
			data[i] = imgData.data[i];
		}

		// Add some transparent space because of the "clamp to edge".
		// (2px border)
		if((width > 2 ) &&(height > 2 )){
			// top border
			for (var i=0;i<width*8;i++){
				data[i] = 0;
			}
			// bottom border
			for (var i=data.length-width*8;i<data.length;i++){
				data[i] = 0;
			}
			// left border
			for (var i=0;i<data.length;i+=height*4){
				data[i] = 0;
				data[i+1] = 0;
				data[i+2] = 0;
				data[i+3] = 0;
				data[i+4] = 0;
				data[i+5] = 0;
				data[i+6] = 0;
				data[i+7] = 0;
			}
			// right border
			for (var i=height*4-8;i<data.length;i+=height*4){
				data[i] = 0;
				data[i+1] = 0;
				data[i+2] = 0;
				data[i+3] = 0;
				data[i+4] = 0;
				data[i+5] = 0;
				data[i+6] = 0;
				data[i+7] = 0;
			}
		}
		
		
		// Copy the pixels to a 2D canvas.
		var imageData = context.createImageData(width, height);
		imageData.data.set(data);
		context.putImageData(imageData, 0, 0);

		var newImg = new Image();
		newImg.onload = function(){
			gl.bindTexture(gl.TEXTURE_2D, texture);
			gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, newImg);
			gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
			//gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR_MIPMAP_NEAREST);
			gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE); //Prevents s-coordinate wrapping (repeating).
			gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE); //Prevents t-coordinate wrapping (repeating).
			gl.generateMipmap(gl.TEXTURE_2D);
			gl.bindTexture(gl.TEXTURE_2D, null);
			self.deleteTexture(self.texture);
			self.texture = texture;
		}
		newImg.src = tmpcanvas.toDataURL();
		
	}
	
	function handleCustomCMTextureLoaded(image, texture) {
		var width = 502;
		var height = 502;
		var tmpcanvas = document.createElement('canvas');
		tmpcanvas.width = 502;
		tmpcanvas.height = 502;
		var context = tmpcanvas.getContext('2d');
		
		
		// Draw an image for getting the data.
		// Resize image (we need a 2pow texture)
		context.drawImage(image, 0, 0, width, height );
		var imgData = context.getImageData(0, 0, width, height);
		
		var edge = 5; // add 5 pixels on each edge.
		var datasize = width * height + 4*edge*edge + 2*edge*width + 2*edge*height;
		datasize *= 4; // because r,g,b,a
		
		
		var data = new Uint8Array(datasize);
		
		var new_width = edge*2 + width;
		var new_height = edge*2 + height;
		var k=0;
		var l=0;
		
		// top edges
		for (k;k<edge*new_width*4;k++){	
				data[k] = 0;
		}
		
		// image and left/right edges
		for (var i=0;i<height;i++){	
			// process one line.
			for (var j=0;j<edge*4;j++){
				data[k] = 0;
				k++;
			}
			for (var j=0;j<width*4;j++){
				data[k] = imgData.data[l];
				k++;
				l++;
			}
			for (var j=0;j<edge*4;j++){
				data[k] = 0;
				k++;
			}
		}
		
		// bottom edges
		for (k;k<edge*new_width*4;k++){	
				data[k] = 0;
		}
		
		
		
	
	
		// Copy the pixels to a 2D canvas.
		tmpcanvas.width = new_width;
		tmpcanvas.height = new_height;
		var imageData = context.createImageData(new_width, new_height);
		imageData.data.set(data);
		context.putImageData(imageData, 0, 0);

		var newImg = new Image();
		newImg.onload = function(){
			gl.bindTexture(gl.TEXTURE_2D, texture);
			gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, newImg);
			gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
			//gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR_MIPMAP_NEAREST);
			gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE); //Prevents s-coordinate wrapping (repeating).
			gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE); //Prevents t-coordinate wrapping (repeating).
			gl.generateMipmap(gl.TEXTURE_2D);
			gl.bindTexture(gl.TEXTURE_2D, null);
			self.deleteTexture(self.texture);
			self.texture = texture;
		}
		newImg.src = tmpcanvas.toDataURL();
		
	}
	
	
	this.initStickerTexture = function(_src){
		this.src = _src;
		var texture = gl.createTexture(); 
		var image = new Image();
		image.onload = function() { 
			handleStickerTextureLoaded(image, texture); 
		}
		image.src = _src;
	}
	
	this.initCustomCutieMark = function(_src){
		this.src = _src;
		var texture = gl.createTexture(); 
		var image = new Image();
		image.onload = function() { 
			handleCustomCMTextureLoaded(image, texture); 
		}
		image.src = _src;
	}
	
	this.deleteTexture = function(texture){
		if(texture){
		    gl.deleteTexture(texture);
		}
	}
}