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
 

function Light()
{
	this.ambiant = vec4.createFrom(0.0,0.0,0.0,1.0);
	this.diffuse = vec4.createFrom(0.0,0.0,0.0,1.0); 
	this.specular = vec4.createFrom(0.0,0.0,0.0,1.0); 
	this.pos = vec4.createFrom(0.0,0.0,0.0,1.0); 
	
	var angle = 0.0;
	var distance = 75.0;
	var height = 30.0;
	
	this.computePosition = function(){
		this.pos[0] = Math.sin(angle) * distance;
		this.pos[1] = height;
		this.pos[2] = Math.cos(angle) * distance;
	}
	
	this.setAngle = function(value){
		angle = value;
		this.computePosition();
	}
	
	this.setDistance = function(value){
		distance = value;
		this.computePosition();
	}
	
	this.setHeight = function(value){
		height = value;
		this.computePosition();
	}

}