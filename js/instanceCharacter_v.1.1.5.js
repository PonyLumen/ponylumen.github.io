/*
 * Copyright (c) 2013-2015 ponylumen
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
 

function InstanceCharacter()
{
	this.id = 0;
	this.axis = vec3.createFrom(0.0,1.0,0.0); 
	this.angle = 0.0; // angle around Y axis in radians
	this.angleXZ = 0.0; 
	//this.pos = vec3.createFrom(0.0,0.0,0.0); 
	this.model = 0; // ModelCharacter
	this.morphValue = new Array(); // float Array, usually between 0 and 1
	this.height = 0; // default = 0, min = -100, max = 100
	
	this.firstColor =  vec4.createFrom(0.0,0.0,0.0,1.0);
	this.secondColor =  vec4.createFrom(0.0,0.0,0.0,1.0);
	this.thirdColor =  vec4.createFrom(0.0,0.0,0.0,1.0);
	this.hsv = vec3.createFrom(0.2,0.5,1.0); // only for eyes
	this.uvTranslation = vec2.createFrom(0.0,0.0); // eye translation (mouse)
	this.uvT = vec2.createFrom(0.0,0.0);  // eye translation (custom)
	this.uvScale = 1.0;  // eye scale
	this.shininess = 1.0;
	var animationSpeed = 1.0;
	var jointID = -1; // if attached to a joint
	
	this.tex1 = 0; // extra texture
	this.tex1alpha = 1.0; 
	this.tex1u = 0.0; 
	this.tex1v = 0.0; 
	this.uHSV = vec3.createFrom(0,1,1);
	
	var currentAnimation = '';
	var newAnimation = true;
	var currentFrame = 0.0; // float
	var iCurrentFrame = 0; // int
	
	
	this.getModelMatrix = function(){
		var modelMatrix = mat4.create();
		mat4.identity(modelMatrix);
		
		// camera is a global variable defined in ponyCretor.js
		
		var _axis = vec3.create();
		var a = camera.getAxis();
		vec3.normalize(a);
		var b = camera.getUp();
		vec3.normalize(b);
		vec3.cross(a,b,_axis);
		
		// translate then rotate
		var vtranslate = vec3.createFrom(translation_right,translation_up,translation_right);
		mat4.translate(modelMatrix,vtranslate,modelMatrix);
		
		// to change the axis position :
		// T.R.T^-1 (or T^-1.R.T)
		var vt = vec3.createFrom(0,30.0,0);
		var vtInv = vec3.createFrom(0,-30.0,0);
		mat4.translate(modelMatrix,vt,modelMatrix);
		mat4.rotate(modelMatrix, this.angleXZ, _axis, modelMatrix);
		mat4.translate(modelMatrix,vtInv,modelMatrix)
		mat4.rotateY(modelMatrix,this.angle);
		
		

		return modelMatrix;
	}
	
	this.animate = function(dt){
		// dt in seconds
		var begin = this.model.animations[currentAnimation][0];
		var end = this.model.animations[currentAnimation][1];
		if(isNaN(begin)) {currentFrame=0.0;  return false;}
		if(isNaN(end)) {currentFrame=0.0;  return false;}
		
		if(newAnimation){
			currentFrame = parseInt(begin);
			newAnimation = false;
		} 
		else{
			currentFrame += animationSpeed * 24.0 * dt; // our animations have 24 frames per second (it's possible to use collada's frame rate otherwise)
		}
		iCurrentFrame = parseInt(currentFrame);
		while(iCurrentFrame >= end+1){ // animation end -> loop
			currentFrame -= (end+1-begin);
			iCurrentFrame -= (end+1-begin);
		}
		// those 3 next cases might happen because of float precision error
		if(iCurrentFrame < 0){ 
			currentFrame = 0.0;
			iCurrentFrame = 0;
			//alert('warning, animation 0');
		}
		if(iCurrentFrame < begin){
			currentFrame = begin;
			iCurrentFrame = begin;
			//alert('warning, animation begin');
		}
		if(iCurrentFrame >= end+1){
			currentFrame = end;
			iCurrentFrame = end;
			//alert('warning, animation end');
		}
		return true;
	}
	
	this.setAnimation = function(name){
		// switch to another animation (stand, walk, run, ...)
		if(currentAnimation != name){
			newAnimation = true;
			currentAnimation = name;
		}
	}
	
	this.getICurrentFrame = function(){
		return iCurrentFrame;
	}
	
	this.setAnimationSpeed = function(f){
		animationSpeed = f;
	}
}