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
 

function AnimatedChain()
{
	this.joints = new Array();
	this.rootJoint = 0;
	
	this.addJoint = function(joint)
	{
		joint.index = this.joints.length;
		this.joints.push(joint);
	}
	
	this.initMatrices = function()
	{
		
		// ------------------------------------------
		// Init original values
		// ------------------------------------------
		for(var frame=0; frame <this.joints[0].animMatrices.length; frame++){
			for(var j=0; j<this.joints.length; j++){ 
				var joint = this.joints[j];
				var mat = joint.animMatrices[frame];
				var newmat = mat4.create(mat); // copy the matrix
				joint.originalAnimMatrices.push(newmat);
				joint.customAnimMatrices.push(newmat);
				var pos = vec3.createFrom(mat[12],mat[13],mat[14]);
				joint.originalPos.push(pos);
				
				
			}
		}
		if(this.joints[0].animMatrices.length > 0){
			for(var j=0; j<this.joints.length; j++){ 
				var joint = this.joints[j];
				var mat = joint.animMatrices[0];
				mat4ToEuler(mat,joint.rotateDegrees);
				joint.rotateDegrees[0] = joint.rotateDegrees[0] * 180 / Math.PI;
				joint.rotateDegrees[1] = joint.rotateDegrees[1] * 180 / Math.PI;
				joint.rotateDegrees[2] = joint.rotateDegrees[2] * 180 / Math.PI;
			}
		}
		
		// ------------------------------------------
		// Init world matrices
		// ------------------------------------------

		initWorldMatrices(this.rootJoint);
		
		// ------------------------------------------
		// Init InvertedBindPose
		// ------------------------------------------
		
		
		for(var j = 0; j < this.joints.length; j++){
			this.joints[j].invertedBindPose = mat4.create(this.joints[j].worldAnimMatrices[0]);
			mat4.inverse(this.joints[j].invertedBindPose);
		}
		
		// ------------------------------------------
		// Compute skinning matrices
		// ------------------------------------------

		for(var j = 0; j < this.joints.length; j++){
			for(var frame = 0; frame < this.joints[0].worldAnimMatrices.length; frame++){
				var result = mat4.create();
				mat4.multiply(this.joints[j].worldAnimMatrices[frame],this.joints[j].invertedBindPose,result);
				this.joints[j].skinningMatrices.push(result);
			}
		}
		
	}
	
	var initWorldMatrices = function(joint){
		if (joint.parent == 0){ // root joint
			for(var frame=0; frame <joint.animMatrices.length; frame++){
				joint.worldAnimMatrices.push(joint.animMatrices[frame]);
			}
		}
		else{ 
			for(var frame=0; frame <joint.animMatrices.length; frame++){
				var result = mat4.create();
				mat4.multiply(joint.parent.worldAnimMatrices[frame],joint.animMatrices[frame],result);
				joint.worldAnimMatrices.push(result);
			}
		}
		for(var j=0; j<joint.children.length; j++){ 
			initWorldMatrices(joint.children[j]);
		}
	}
	
	this.computeFrame = function(frame)
	{
		// ------------------------------------------
		// Compute world matrices
		// ------------------------------------------

		computeWorldMatricesFrame(this.rootJoint,frame);
		
		// ------------------------------------------
		// Compute skinning matrices
		// ------------------------------------------

		for(var j = 0; j < this.joints.length; j++){
			var result = mat4.create();
			mat4.multiply(this.joints[j].worldAnimMatrices[frame],this.joints[j].invertedBindPose,result);
			this.joints[j].skinningMatrices[frame] = result;
		}
	}
	
	var computeWorldMatricesFrame = function(joint,frame){
		if (joint.parent == 0){ // root joint
			joint.worldAnimMatrices[frame] = joint.animMatrices[frame];
		}
		else{ 
			mat4.multiply(joint.parent.worldAnimMatrices[frame],joint.animMatrices[frame],joint.worldAnimMatrices[frame]);
		}
		for(var j=0; j<joint.children.length; j++){ 
			computeWorldMatricesFrame(joint.children[j],frame);
		}
	}
	
	this.displayHierarchy = function(){
		var str = '';
		str = pDisplayHierarchy(this.rootJoint,0,str);
		console.log(str);
	}

	var pDisplayHierarchy = function(joint,depth,str){
		for(var i=0; i<depth; i++){
			str += '+';
		}
		str += joint.name;
		str += '\n';
		for(var j=0; j<joint.children.length; j++){ 
			str = pDisplayHierarchy(joint.children[j],depth+1,str);
		}
		return str;
	}

}


function State()
{
	// physical state
	//this.p = vec3.createFrom(0.0,0.0,0.0); // position
	//this.v = vec3.createFrom(0.0,0.0,0.0); // velocity
	//this.a = vec3.createFrom(0.0,0.0,0.0); // acceleration
	this.ap = vec3.createFrom(0.0,0.0,0.0); // angular position
	this.av = vec3.createFrom(0.0,0.0,0.0); // angular velocity
	this.aa = vec3.createFrom(0.0,0.0,0.0); // angular acceleration
	
}



function Joint()
{
	this.index = 0;
	this.name = '';
	this.children = new Array();
	this.parent = 0;
	this.invertedBindPose = 0;
	this.originalPos = new Array(); // Local positions
	this.originalAnimMatrices = new Array(); //  Local matrices (non-transformed)
	this.customAnimMatrices = new Array(); // Custom pose / animation (new in 1.0.5)
	//this.originalQuaternion = new Array(); //  Local orientations
	this.animMatrices = new Array(); // Local matrices
	this.worldAnimMatrices = new Array();
	this.skinningMatrices = new Array();
	
	this.rotateDegrees = vec3.createFrom(0,0,0); // new in 0.9.7, for custom pose
	
	// ---------------------
	// jiggleBones
	// ---------------------
	this.currentState = new State();
	this.previousState = new State();

	var _static = true;
	var _flexible = false;
	
	this.mass = 3;
	this.pitch_stiffness = 150;
	this.pitch_damping = 10;
	this.yaw_stiffness = 150;
	this.yaw_damping = 10;
	this.pitch_constraint_min = -Math.PI*25.0/180.0;
	this.pitch_constraint_max = Math.PI*25.0/180.0;
	this.yaw_constraint_min = -Math.PI*25.0/180.0;
	this.yaw_constraint_max = Math.PI*25.0/180.0;
		
	this.addChild=addChild;
	function addChild(child){
		this.children.push(child);
		child.parent = this; 
	}
	
	this.isFlexible = function(){
		return _flexible;
	}
	
	this.setStatic = function(){
		_static = true;
		_flexible = false;
	}
	
	this.setFlexible = function(){
		_static = false;
		_flexible = true;
	}
}
