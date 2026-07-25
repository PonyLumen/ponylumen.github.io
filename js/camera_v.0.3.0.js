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


function Camera()
{
	var pos = vec3.createFrom(-70.0,28.0,70.0);
	var view = vec3.createFrom(0.0,28.0,0.0);
	var up = vec3.createFrom(0.0,1.0,0.0);
	
	this.rotateY = function(angle){
		// rotate around the view, around the Y axis.
		var v = this.getAxis(); 
		var d = Math.sqrt(v[0] * v[0]  + v[2] * v[2]); 
		var x = v[0]; 
		var z = v[2]; 
		if (Math.abs(z) < 0.00001) {
			z = 0.00001;
		}
		var c = Math.atan2(x,z);
		x = Math.sin(angle+c) * d;
		z = Math.cos(angle+c) * d;
		pos[0] = view[0] - x;
		pos[2] = view[2] - z;
	}
	
	this.getAxis = function(){
		var v = vec3.create();
		vec3.subtract(view,pos,v);
		return v;
	}
	
	this.getUp = function(){
		return up;
	}
	
	this.getViewMatrix = function(){
		var vMatrix = mat4.create();
		mat4.lookAt(pos, view, up, vMatrix);
		return vMatrix;
	}
	
	// get distance between pos and view
	this.getDistance = function(){
		return (vec3.length(this.getAxis())); 
	}

	// set distance between pos and view
	this.setDistance = function(d){
		var dist = this.getDistance();
		if(Math.abs(dist) < 0.00001){
			dist = 0.00001; // prevent division by zero
		}
		var l = d/dist;
		pos[0] = view[0] + (pos[0] - view[0]) * l;
		pos[1] = view[1] + (pos[1] - view[1]) * l;
		pos[2] = view[2] + (pos[2] - view[2]) * l;
	}
	
	this.zoomForward = function(){
		var l = 0.9;
		pos[0] = view[0] + (pos[0] - view[0]) * l;
		pos[1] = view[1] + (pos[1] - view[1]) * l;
		pos[2] = view[2] + (pos[2] - view[2]) * l;
		// set a minimum distance
		if(this.getDistance() < 30.0){
			this.setDistance(30.0);
		}
	}
	
	this.zoomBackward = function(){
		var l = 1/0.9;
		pos[0] = view[0] + (pos[0] - view[0]) * l;
		pos[1] = view[1] + (pos[1] - view[1]) * l;
		pos[2] = view[2] + (pos[2] - view[2]) * l;
		// set a maximum distance
		if(this.getDistance() > 500.0){
			this.setDistance(500.0);
		}
	}
	
	
}
