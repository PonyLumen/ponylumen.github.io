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

 
 /**
 *
 * @version 1.1.9
 * @author ponylumen
 *
 */
 
 
// ------------------------------------------
// Known bugs
// ------------------------------------------
// Internet explorer 11
// - Black body and black eyes. Updating IE resolves this problem.
// Chrome
// - Sometimes the game doesn't load for unknown reasons.
// All browsers
// - Models don't load sometimes. (reboot the computer and it'll work)
// - Unable to initialize shaders (on few computers)
// ------------------------------------------



// ------------------------------------------
// Run local version on Chrome
// ------------------------------------------
// cd C:\Program Files (x86)\Google\Chrome\Application\
// chrome --allow-file-access-from-files



 
 
// ******************************************
// **         GLOBAL VARIABLES             **
// ******************************************


// programs for shading
var programCharacter2; // shader for hair, tail, horn (and body since 1.1.0)
var programBG; // shader for background
var programEyes; // shader for eyes
var programPicking; // picking triangle
var programSticker;
var programPickingID; // picking object
var shadingType = 1; // (1 = lambert, 2 = toon)

// instances and models
var pony = 0; // pony body that is currently displaying
var hairFront = 0; // front hair that is currently displaying
var hairFrontModelArray; // array of all different front hairs
var hairBack = 0; // etc
var hairBackModelArray; 
var hairExtra = 0; // for Cloudchaser
var hairExtraModelArray;
var tail = 0; 
var tailModelArray; 
var leftEye = 0;
var leftEyeModel = 0;
var rightEye = 0;
var rightEyeModel = 0;
var horn = 0; 
var hornModelArray; 
var tongue = 0;
var tongueModelArray = 0;
var eyelashes = 0;
var eyelashesModelArray = 0;
var teeth = 0;
var teethModelArray = 0;
var leftWing = 0;
var leftWingModelArray;
var rightWing = 0;
var rightWingModelArray;
var cloth1 = 0; 
var clothModelArray;
var collar1 = 0;
var collarModelArray;
var headgear1 = 0;
var headgearModelArray;
var headbandA = new Array(2);
var headbandModelArray;
var glassesArray;
var accessoriesModelArray;
var accessories;
var jointSphereInst = 0;
var jointSphereModel = 0;
var torusX = 0;
var torusY = 0;
var torusZ = 0;
var bigtorusX = 0;
var bigtorusY = 0;
var bigtorusZ = 0;
var bgModel = 0;

// stickers
var stickerNumber = 8;
var currentStickerID = 0;
var oldStickerImgID = document.getElementById("blankStickerImg");
var stickerEditMode = false;

// stuff
var canvas;
var camera;
var lightArray;
var beginTime = 0;

// event listeners
var mouseDown = false;
var lastMouseX = null;
var lastMouseY = null;
var mouseButton = 0; // 0 : left, 1 : middle, 2 : right (at least, for chrome and firefox)
var cursor3DPos = 0; // 3d coordiantes of the cursor when it's on the canvas. ( = 0 if outside)
var currentlyPressedKeys = {};

// joints indices

// the head is the rootjoint for hair, eyes, and horn
var headID; 
// the neck is the rootjoint for necklaces
var neckID; 
// the tail is the rootjoint for ... tail
var tail1ID;
// the chest1 is the rootjoint for wings
var chest1ID; 
// the chest2 is the rootjoint for headphones
var chest2ID;
// etc
var pelvisID;
var leftForearmID; 
var rightForearmID; 
var leftShoulderID;
var rightShoulderID;
var leftThighID; 
var rightThighID; 
var leftLeg1ID;
var rightLeg1ID;
var r_earID;
var l_earID;
var r_handID;
var r_ballID;
var l_handID;
var l_ballID;
var r_leg2ID;
var r_footID;
var l_leg2ID;
var l_footID;


// matrices
var pMatrix; // projection matrix
var vMatrix; // view matrix
var mMatrix; // model matrix
var normalMatrix; // normal matrix
	
// options
var bJiggleBonesPhysics = true; // enable jigglebones or not
var bMoveIrisesWithMouse = true; // eyes move with mouse or not
var bMatchEyesColor = false; // eyes have the same color if true
var bMatchEyesStyle = true; // eyes have the same style if true
var bMatchManeTailColor = false; // share mane and tail colors if true
var derpEyes = false; // derp
var saveLimit = 20;
var gender = 0; // 0 = female, 1 = male, 2 = female long face
		
var offsetHueEye = 0.11;
var scaleSatEye = 1.5;
var scaleValueEye = 1.0;
var headSize; // vec3
var translation_right = 0.0;
var translation_up = 0.0;

var morphNumber = 100; 
// 1-49 : face expressions
// 50 : weight, range from -0.5 to 1
// 51 : male face
// 52 : long face (alicorn, Fleur de Lis)
// 53 : ear size, range from -0.6 to 1.5
// 54 : spiked ears
// 55 : star shaped ears
// 56 : eye 1 UNUSED
// 57 : eye 2 UNUSED
// 58 : fangs
// 59 : Fluttershy eye shape
// 60 : Rarity eye shape
 
// handled by the program, do not modify
var blankTexture = 0;
var mouseCanvasX = -1; // position of the cursor, (0,0) is the top left of the canvas
var mouseCanvasY = -1;
var mouseForceX = 0; // add force when click + move
var mouseForceY = 0; // add force when click + move
var documentBeginTime = 0;
var hasWEBGL = false;
var bTakeScreenshot = false;
var screenshot = null; // image of the canvas
var takeScreenshot = function(){
	bTakeScreenshot = true;
}
var updateSticker = false;
var currentSticker = 0;
var fbPickingTriangle = 0; // framebuffer (picking))
var customCutieMark = false;
var customFrame = 20; // 2-19 : run, 20 : custom, etc
var customPoseCurrentJoint = 0;
var selectedTorus = 0; //501 = x, 502 = y, 503 = z,
var bDisplayTorus = false;
var bDisplayJointSphere = false;
var bClicked = false;
var currentJointRotateDegrees = vec3.createFrom(0,0,0);
var mouseCanvasRotateJoint = vec2.createFrom(0,0);

var tex1MoveMode = 1;

var tabID = 1; // active tab (create, accessories ...)

// background
var bgVertexPositionBuffer = 0;
var bgVertexIndexBuffer = 0;
var bgUVBuffer = 0;
var bgColorR = 0;
var bgColorG = 0;
var bgColorB = 0;
var bgColorA = 0;
var bgNum = 1; //0 = no bckground, 1 = background 1, etc

// ******************************************
// **         GLOBAL FUNCTIONS             **
// ******************************************

var clamp = function(n, min, max) {
  return Math.min(Math.max(n, min), max);
};

var lerp = function(a,b,t){
	// 0 < t < 1
	return (1-t)*a + t*b;
}

$(document).ready(function() {
  documentBeginTime = Date.now();
});


function resizeCanvas() {
	var wW = window.innerWidth;
	var wH = window.innerHeight;
	if(wW < 1255){
		if(wW < 600){ wW=600;} // minimal size
		canvas.width = wW-355;
		canvas.height = 0.75*canvas.width; // because canvas ratio is 4/3
		//$(".game-aera").css("padding", "0px");
	}
	else{
		canvas.width = 900; 
		canvas.height = 675;
	}
	gl.viewport(0, 0, canvas.width, canvas.height);
	gl.viewportWidth = canvas.width; 
	gl.viewportHeight = canvas.height; 
	
	$(".contenu").css("height", canvas.height);
	
	// correct ad-banner problem
	if(wW < 1065){
		$('.game-aera').css("margin-top", "50px");
	}
	else{
		$('.game-aera').css("margin-top", "30px");
	}
}



function startWebGL() {

	// http://stackoverflow.com/questions/17447373/how-can-i-target-only-internet-explorer-11-with-javascript
	//var isIE11 = !!navigator.userAgent.match(/Trident.*rv[ :]*11\./)
	//if(isIE11){ 
		//alert('Sorry, 3D Pony Creator isn\'t compatible with Internet Explorer. Please use Chrome or Firefox.');
		//return;
	//}
		
	canvas = document.getElementById("glcanvas");
	
	initWebGL(canvas);      // Initialize the GL context
	  
	  // Only continue if WebGL is available and working
	  
	  if (gl) {
	    hasWEBGL = true;
		
		// http://greggman.github.io/webgl-fundamentals/webgl/lessons/webgl-and-alpha.html
		gl.pixelStorei(gl.UNPACK_PREMULTIPLY_ALPHA_WEBGL, false);
	  
		gl.viewportWidth = canvas.width; 
		gl.viewportHeight = canvas.height; 

		pMatrix = mat4.create();
		normalMatrix = mat3.create();
		
		// ---------------------
		// init stuff
		// ---------------------
		displayTab(1);
		initBlankTexture();
		initCamera();
		initLights();
		initShaders();
		initFrameBuffer();
		initCharacters(); 
		initBackground();
		loadLocalStorage();
		initDefaultInstances();
		
		
		
		// ---------------------
		// options
		// ---------------------
		pony.angle = 0.4;
		bgColorR = 0.88;
		bgColorG = 0.88;
		bgColorB = 0.88;
		bgColorA = 0.4;
		
		gl.clearColor(bgColorR*bgColorA,bgColorG*bgColorA,bgColorB*bgColorA,bgColorA);  
		gl.enable(gl.DEPTH_TEST);                               // Enable depth testing
		gl.depthFunc(gl.LEQUAL);                                // Near things obscure far things
		gl.clear(gl.COLOR_BUFFER_BIT|gl.DEPTH_BUFFER_BIT);      // Clear the color as well as the depth buffer.
	  
		// ---------------------
		// event listeners
		// ---------------------
		canvas.onmousedown = handleMouseDown;
		document.onmouseup = handleMouseUp;
		document.onmousemove = handleMouseMove;
		document.onkeydown = handleKeyDown;
		document.onkeyup = handleKeyUp;
		window.addEventListener('resize', resizeCanvas);
		
		// source : http://www.javascriptkit.com/javatutors/onmousewheel.shtml
		var mousewheelevt=(/Firefox/i.test(navigator.userAgent))? "DOMMouseScroll" : "mousewheel" //FF doesn't recognize mousewheel as of FF3.x
		
		canvas.addEventListener(mousewheelevt,function(event){
			handleMouseWheel(event);
			if (event.preventDefault) //disable default wheel action of scrolling page
				event.preventDefault();
			return false;
		}, false);

		
	
		resizeCanvas();
		
		// disabling right click context menu
		canvas.oncontextmenu = function() {
			 return false;  
		} 
		
		// ---------------------
		// init done
		// ---------------------
		
		
		beginTime = new Date().getTime();

		tick(); 
	  }
	  
	  //writeLogInit();
}

	
function writeLogInit(){
	var data = "hasWEBGL="+hasWEBGL;
	data+= "&screenWidth="+window.innerWidth;
	data+= "&screenHeight="+window.innerHeight;
	var xhr = new XMLHttpRequest(); 

	var url = 'log_init.php';
	xhr.open("POST",url,false);
	
	xhr.setRequestHeader("Content-type", "application/x-www-form-urlencoded");
	xhr.setRequestHeader("Content-length", data.length);
	xhr.setRequestHeader("Connection", "close");

	xhr.send(data);
}
	
	
// ******************************************
// **      INITIALIZATION FUNCTIONS        **
// ******************************************

function initWebGL(canvas) {
  // Initialize the global variable gl to null.
  gl = null;
  
  try {
	// Try to grab the standard context. If it fails, fallback to experimental.
	//gl = canvas.getContext("webgl") || canvas.getContext("experimental-webgl");
	
	// Use this with webgl-utils.js
	gl = WebGLUtils.setupWebGL(canvas,{premultipliedAlpha: false}); 
	//gl = WebGLUtils.setupWebGL(canvas);
	

  }
  catch(e) {}
  
  // If we don't have a GL context, give up now
  if (!gl) {
	alert("Unable to initialize WebGL. Your browser may not support it.");
  }
}


function initBlankTexture(){
	blankTexture = gl.createTexture(); 
	var image = new Image();
	image.onload = function() { 
		gl.bindTexture(gl.TEXTURE_2D, blankTexture);
		gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, image);
		gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
		gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR_MIPMAP_NEAREST);
		gl.generateMipmap(gl.TEXTURE_2D);
		gl.bindTexture(gl.TEXTURE_2D, null); 
	}
	image.src = 'js/models/pony/blank.png';
}

function initCamera(){
	camera = new Camera();
}



function initLights(){
	lightArray = new Array();
	lightArray.push(new Light());
	lightArray[0].ambiant = [0.4,0.4,0.4,1.0]; 
	lightArray[0].diffuse = [0.4,0.4,0.4,1.0];
	lightArray[0].specular = [0.25,0.25,0.25,1.0];
	lightArray[0].setAngle(0.1);
	
}



function initCharacters() {

	var unicolor = "js/models/pony/red.png";
	var tricolor = "js/models/pony/tricolor.png";
	
	// ---------------------
	// load body
	// ---------------------
	pony = new InstanceCharacter();
	pony.model = new ModelCharacter();
	pony.model.useStickers = true;
	pony.model.filename = './js/models/pony/body/body60.bm';
	pony.model.textureFilename = 'js/models/pony/body/body_f2.png';
	loadModel(pony.model,true); 
	
	// ---------------------
	// init animations
	// ---------------------
	pony.model.createAnimation("idle",0,0);
	pony.model.createAnimation("run",2,19);
	pony.model.createAnimation("custom",20,20);
	pony.model.createAnimation("stand",21,24);
	pony.model.createAnimation("flying_stationary",25,48);
	pony.model.createAnimation("walk",49,72);
	pony.model.createAnimation("trot",73,102);
	pony.setAnimation("stand");
	//document.getElementById('animationSelect').value="stand";
	
	// ---------------------
	// retrieve some joints ID
	// ---------------------

	
	
	pelvisID = 1;
	chest1ID = 2;
	chest2ID = 3;
	neckID = 4;
	headID = 5;
	r_earID = 6;
	l_earID = 7;
	rightShoulderID = 8;
	rightForearmID = 9; 
	r_handID = 10;
	r_ballID = 11;
	leftShoulderID = 12;
	leftForearmID = 13; 
	l_handID = 14;
	l_ballID = 15;
	rightThighID = 16; 
	rightLeg1ID = 17; 
	r_leg2ID = 18;
	r_footID = 19;
	leftThighID = 20; 
	leftLeg1ID = 21;
	l_leg2ID = 22;
	l_footID = 23;
	tail1ID = 24;

	// init morph values
	for(var i=0; i<morphNumber; i++){
		pony.morphValue.push(0.0);
	}



	// ---------------------
	// init front hairs
	// ---------------------
	hairFrontModelArray = new Array();
	
	var nb_hair_front_styles = 47;
	for(var i=0; i<nb_hair_front_styles; i++){
		hairFrontModelArray.push(new ModelCharacter(i));
	}
	
	var hairFrontPath = './js/models/pony/hair_front/';
	
	hairFrontModelArray[0] = 0;
	
	hairFrontModelArray[1].filename = hairFrontPath + 'lyra_hair_front.bm';
	hairFrontModelArray[1].textureFilename = hairFrontPath + 'lyra_hair_front.png';
	
	hairFrontModelArray[2].filename = hairFrontPath + 'bonbon_hair_front.bm';
	hairFrontModelArray[2].textureFilename = hairFrontPath + 'bonbon_hair_front.png';
	hairFrontModelArray[2].headgearOffset = vec3.createFrom(0.0,-2.0,2.0);
	
	hairFrontModelArray[3].filename = hairFrontPath + 'octavia_mane.bm';
	hairFrontModelArray[3].textureFilename = hairFrontPath + 'octavia_mane.png';
    hairFrontModelArray[3].headgearOffset = vec3.createFrom(0.0,-2.0,2.0);
  
	hairFrontModelArray[4].filename = hairFrontPath + 'vinyl_mane.bm';
	hairFrontModelArray[4].textureFilename = hairFrontPath + 'vinyl_mane.png';
  
	hairFrontModelArray[5].filename = hairFrontPath + 'derpy_hair_front.bm';
	hairFrontModelArray[5].textureFilename = hairFrontPath + 'derpy_hair_front.png';
	hairFrontModelArray[5].headgearOffset = vec3.createFrom(0.0,-2.0,2.0);
	hairFrontModelArray[5].maxColors = 3;
	
	hairFrontModelArray[6].filename = hairFrontPath + 'spa_sisters_hair_front.bm';
	hairFrontModelArray[6].textureFilename = hairFrontPath + 'spa_sisters_hair_front.png';

	hairFrontModelArray[7].filename = hairFrontPath + 'berrypunch_mane.bm';
	hairFrontModelArray[7].textureFilename = unicolor;
	
	hairFrontModelArray[8].filename = hairFrontPath + 'carrottop_mane.bm';
	hairFrontModelArray[8].textureFilename = unicolor;
	
	hairFrontModelArray[9].filename = hairFrontPath + 'cheerilee_hair_front.bm';
	hairFrontModelArray[9].textureFilename = hairFrontPath + 'cheerilee_hair_front.png';
	hairFrontModelArray[9].headgearOffset = vec3.createFrom(0.0,-2.0,2.0);
	
	hairFrontModelArray[10].filename = hairFrontPath + 'cloudchaser_hair_front.bm';
	hairFrontModelArray[10].textureFilename = hairFrontPath + 'cloudchaser_hair_front.png';
	
	hairFrontModelArray[11].filename = hairFrontPath + 'flitter_mane.bm';
	hairFrontModelArray[11].textureFilename = hairFrontPath + 'flitter_mane.png';
	hairFrontModelArray[11].headgearOffset = vec3.createFrom(0.0,-1.0,1.0);
	
	hairFrontModelArray[12].filename = hairFrontPath + 'lightningdust_mane.bm';
	hairFrontModelArray[12].textureFilename = hairFrontPath + 'lightningdust_mane.png';
	hairFrontModelArray[12].headgearOffset = vec3.createFrom(0.0,-2.0,2.0);
	hairFrontModelArray[12].maxColors = 3;
	
	hairFrontModelArray[13].filename = hairFrontPath + 'nurseredheart_hair_front.bm';
	hairFrontModelArray[13].textureFilename = hairFrontPath + 'nurseredheart_hair_front.png';
	hairFrontModelArray[13].headgearOffset = vec3.createFrom(0.0,-1.0,1.0);
	
	hairFrontModelArray[14].filename = hairFrontPath + 'spitfire_mane.bm';
	hairFrontModelArray[14].textureFilename = hairFrontPath + 'spitfire_mane.png';
	hairFrontModelArray[14].headgearOffset = vec3.createFrom(0.0,-2.0,2.0);
	
	hairFrontModelArray[15].filename = hairFrontPath + 'trixie_hair_front.bm';
	hairFrontModelArray[15].textureFilename = hairFrontPath + 'trixie_hair_front.png';
	hairFrontModelArray[15].headgearOffset = vec3.createFrom(0.0,-0.5,0.5);
	
	hairFrontModelArray[16].filename = hairFrontPath + 'pinkamena_hair_front.bm';
	hairFrontModelArray[16].textureFilename = hairFrontPath + 'pinkamena_mane.png';
	hairFrontModelArray[16].headgearOffset = vec3.createFrom(0.0,-2.0,2.0);
	
	hairFrontModelArray[17].filename = hairFrontPath + 'solidsparkle_hair_front.bm';
	hairFrontModelArray[17].textureFilename = hairFrontPath + 'solidsparkle_hair_front.png';
	hairFrontModelArray[17].headgearOffset = vec3.createFrom(0.0,-2.0,2.0);
	hairFrontModelArray[17].maxColors = 3;
	
	hairFrontModelArray[18].filename = hairFrontPath + 'applejack_hair_front.bm';
	hairFrontModelArray[18].textureFilename = hairFrontPath + 'applejack_hair_front.png';
	
	hairFrontModelArray[19].filename = hairFrontPath + 'fluttershy_hair_front.bm';
	hairFrontModelArray[19].textureFilename = hairFrontPath + 'fluttershy_hair_front.png';
	
	hairFrontModelArray[20].filename = hairFrontPath + 'pinkie_mane.bm';
	hairFrontModelArray[20].textureFilename = hairFrontPath + 'pinkie_mane.png';
	
	hairFrontModelArray[21].filename = hairFrontPath + 'rainbow_hair_front.bm';
	hairFrontModelArray[21].textureFilename = hairFrontPath + 'rainbow_hair_front.png';
	hairFrontModelArray[21].maxColors = 3;
	
	hairFrontModelArray[22].filename = hairFrontPath + 'rarity_hair_front.bm';
	hairFrontModelArray[22].textureFilename = hairFrontPath + 'rarity_hair_front.png';
	
	hairFrontModelArray[23].filename = hairFrontPath + 'twilight_hair_front.bm';
	hairFrontModelArray[23].textureFilename = hairFrontPath + 'twilight_hair_front.png';
	hairFrontModelArray[23].headgearOffset = vec3.createFrom(0.0,-2.0,2.0);
	hairFrontModelArray[23].maxColors = 3;
	
	hairFrontModelArray[24].filename = hairFrontPath + 'coco_hair_front.bm';
	hairFrontModelArray[24].textureFilename = hairFrontPath + 'coco_hair_front.png';
	hairFrontModelArray[24].headgearOffset = vec3.createFrom(0.0,-2.0,2.0);
	
	hairFrontModelArray[25].filename = hairFrontPath + 'celestia_mane.bm';
	hairFrontModelArray[25].textureFilename = hairFrontPath + 'celestia_mane.png';
	hairFrontModelArray[25].maxColors = 3;
	
	hairFrontModelArray[26].filename = hairFrontPath + 'luna_hair_front.bm';
	hairFrontModelArray[26].textureFilename = hairFrontPath + 'luna_hair_front.png';
	hairFrontModelArray[26].headgearOffset = vec3.createFrom(0.0,-2.0,2.0);
	hairFrontModelArray[26].maxColors = 3;
	
	hairFrontModelArray[27].filename = hairFrontPath + 'cadence_hair_front.bm';
	hairFrontModelArray[27].textureFilename = hairFrontPath + 'cadence_hair_front.png';
	hairFrontModelArray[27].headgearOffset = vec3.createFrom(0.0,-2.0,2.0);
	hairFrontModelArray[27].maxColors = 3;
	
	hairFrontModelArray[28].filename = hairFrontPath + 'wet_hair_front.bm';
	hairFrontModelArray[28].textureFilename = unicolor;
	hairFrontModelArray[28].headgearOffset = vec3.createFrom(0.0,-2.0,2.0);
	
	hairFrontModelArray[29].filename = hairFrontPath + 'flutterbat_hair_front.bm';
	hairFrontModelArray[29].textureFilename = hairFrontPath + 'fluttershy_hair_front.png';
	
	hairFrontModelArray[30].filename = hairFrontPath + 'braeburn_hair_front.bm';
	hairFrontModelArray[30].textureFilename = hairFrontPath + 'braeburn_hair_front.png';
	
	hairFrontModelArray[31].filename = hairFrontPath + 'caramel_hair.bm';
	hairFrontModelArray[31].textureFilename = hairFrontPath + 'caramel_hair.png';
	
	hairFrontModelArray[32].filename = hairFrontPath + 'nightlight_hair.bm';
	hairFrontModelArray[32].textureFilename = hairFrontPath + 'nightlight_hair.png';
	
	hairFrontModelArray[33].filename = hairFrontPath + 'noteworthy_hair_front.bm';
	hairFrontModelArray[33].textureFilename = unicolor;
	
	hairFrontModelArray[34].filename = hairFrontPath + 'pokeypierce_hair.bm';
	hairFrontModelArray[34].textureFilename = hairFrontPath + 'pokeypierce_hair.png';
	
	hairFrontModelArray[35].filename = hairFrontPath + 'soarin_hair.bm';
	hairFrontModelArray[35].textureFilename = unicolor;
	
	hairFrontModelArray[36].filename = hairFrontPath + 'thunderlane_hair.bm';
	hairFrontModelArray[36].textureFilename = hairFrontPath + 'thunderlane_hair.png';
	
	hairFrontModelArray[37].filename = hairFrontPath + 'drwhooves_hair.bm';
	hairFrontModelArray[37].textureFilename = unicolor;

	hairFrontModelArray[38].filename = hairFrontPath + 'chrysalis_hair_front.bm';
	hairFrontModelArray[38].textureFilename = hairFrontPath + 'chrysalis_hair_front.png';
	
	hairFrontModelArray[39].filename = hairFrontPath + 'applebloom_hair_front.bm';
	hairFrontModelArray[39].textureFilename = hairFrontPath + 'applebloom_hair_front.png';
	
	hairFrontModelArray[40].filename = hairFrontPath + 'scootaloo_hair_front.bm';
	hairFrontModelArray[40].textureFilename = hairFrontPath + 'scootaloo_hair_front.png';
	
	hairFrontModelArray[41].filename = hairFrontPath + 'sweetie_belle_hair_front.bm';
	hairFrontModelArray[41].textureFilename = hairFrontPath + 'sweetie_belle_hair_front.png';
	
	hairFrontModelArray[42] = 0;
	
	hairFrontModelArray[43].filename = hairFrontPath + 'sunset_shimmer_hair_front.bm';
	hairFrontModelArray[43].textureFilename = hairFrontPath + 'sunset_shimmer_mane.png';
	
	hairFrontModelArray[44].filename = hairFrontPath + 'bigmac_hair_front.bm';
	hairFrontModelArray[44].textureFilename = hairFrontPath + 'bigmac_hair.png';
	
	hairFrontModelArray[45].filename = hairFrontPath + 'celestia_mane.bm';
	hairFrontModelArray[45].textureFilename = hairFrontPath + 'luna_new_hair.png';
	
	hairFrontModelArray[46].filename = hairFrontPath + 'fleur_de_lis_hair_front.bm';
	hairFrontModelArray[46].textureFilename = hairFrontPath + 'fleur_de_lis.png';
	
	// ---------------------
	// init back hairs
	// ---------------------
	hairBackModelArray = new Array();
	var nb_hair_back_styles = 47;
	for(var i=0; i<nb_hair_back_styles; i++){
		hairBackModelArray.push(new ModelCharacter(i));
	}
	var hairBackPath = './js/models/pony/hair_back/';
	
	hairBackModelArray[0] = 0;
	
	hairBackModelArray[1].filename = hairBackPath + 'lyra_hair_back.bm';
	hairBackModelArray[1].textureFilename = hairBackPath + 'lyra_hair_back.png';
  
	hairBackModelArray[2].filename = hairBackPath + 'bonbon_hair_back.bm';
	hairBackModelArray[2].textureFilename = hairBackPath + 'bonbon_hair_back.png';
  
	hairBackModelArray[3] = 0;
	hairBackModelArray[4] = 0;
	
	hairBackModelArray[5].filename = hairBackPath + 'derpy_hair_back.bm';
	hairBackModelArray[5].textureFilename =  hairBackPath + 'derpy_hair_back_fix1.png';
	hairBackModelArray[5].maxColors = 3;
	
	hairBackModelArray[6].filename = hairBackPath + 'spa_sisters_hair_back.bm';
	hairBackModelArray[6].textureFilename =  hairBackPath + 'spa_sisters_hair_back.png';
	
	hairBackModelArray[7] = 0;
	hairBackModelArray[8] = 0;
	
	hairBackModelArray[9].filename = hairBackPath + 'cheerilee_hair_back.bm';
	hairBackModelArray[9].textureFilename =  hairBackPath + 'cheerilee_hair_back.png';
	
	hairBackModelArray[10].filename = hairBackPath + 'cloudchaser_hair_back.bm';
	hairBackModelArray[10].textureFilename =  hairBackPath + 'cloudchaser_hair_back.png';
	
	hairBackModelArray[11] = 0;
	
	hairBackModelArray[12] = 0;
	
	hairBackModelArray[13].filename = hairBackPath + 'nurseredheart_hair_back.bm';
	hairBackModelArray[13].textureFilename = hairBackPath + 'nurseredheart_hair_back.png';
	
	hairBackModelArray[14] = 0;
	
	hairBackModelArray[15].filename = hairBackPath + 'trixie_hair_back.bm';
	hairBackModelArray[15].textureFilename = hairBackPath + 'trixie_hair_back.png';
	
	hairBackModelArray[16].filename = hairBackPath + 'pinkamena_hair_back.bm';
	hairBackModelArray[16].textureFilename = './js/models/pony/hair_front/pinkamena_mane.png';
	
	hairBackModelArray[17].filename = hairBackPath + 'solidsparkle_hair_back.bm';
	hairBackModelArray[17].textureFilename = unicolor;
	
	hairBackModelArray[18].filename = hairBackPath + 'applejack_hair_back.bm';
	hairBackModelArray[18].textureFilename = hairBackPath + 'applejack_hair_back.png';
	hairBackModelArray[18].maxColors = 3;
	
	hairBackModelArray[19].filename = hairBackPath + 'fluttershy_hair_back.bm';
	hairBackModelArray[19].textureFilename = hairBackPath + 'fluttershy_hair_back.png';
	
	hairBackModelArray[20] = 0;
	
	hairBackModelArray[21].filename = hairBackPath + 'rainbow_hair_back.bm';
	hairBackModelArray[21].textureFilename = hairBackPath + 'rainbow_hair_back.png';
	hairBackModelArray[21].maxColors = 3;
	
	hairBackModelArray[22].filename = hairBackPath + 'rarity_hair_back.bm';
	hairBackModelArray[22].textureFilename = hairBackPath + 'rarity_hair_back.png';
	
	hairBackModelArray[23].filename = hairBackPath + 'twilight_hair_back.bm';
	hairBackModelArray[23].textureFilename = hairBackPath + 'twilight_hair_back.png';
	hairBackModelArray[23].maxColors = 3;
	
	hairBackModelArray[24].filename = hairBackPath + 'coco_hair_back.bm';
	hairBackModelArray[24].textureFilename = hairBackPath + 'coco_hair_back.png';
	
	hairBackModelArray[25] = 0;
	
	hairBackModelArray[26].filename = hairBackPath + 'luna_hair_back.bm';
	hairBackModelArray[26].textureFilename = hairBackPath + 'luna_hair_back.png';
	hairBackModelArray[26].maxColors = 3;
	
	hairBackModelArray[27].filename = hairBackPath + 'cadence_hair_back.bm';
	hairBackModelArray[27].textureFilename = hairBackPath + 'cadence_hair_back.png';
	hairBackModelArray[27].maxColors = 3;
	
	hairBackModelArray[28].filename = hairBackPath + 'wet_hair_back.bm';
	hairBackModelArray[28].textureFilename = unicolor;
	
	hairBackModelArray[29].filename = hairBackPath + 'flutterbat_hair_back.bm';
	hairBackModelArray[29].textureFilename = hairBackPath + 'fluttershy_hair_back.png';
	
	hairBackModelArray[30].filename = hairFrontPath + 'braeburn_hair_back.bm';
	hairBackModelArray[30].textureFilename = hairFrontPath + 'braeburn_hair_back.png';
	
	hairBackModelArray[31] = 0;
	hairBackModelArray[32] = 0;
	
	hairBackModelArray[33].filename = hairFrontPath + 'noteworthy_hair_back.bm';
	hairBackModelArray[33].textureFilename = unicolor;
	
	hairBackModelArray[34] = 0;
	hairBackModelArray[35] = 0;
	hairBackModelArray[36] = 0;
	hairBackModelArray[37] = 0;
	hairBackModelArray[38] = 0;
	
	hairBackModelArray[39].filename = hairFrontPath + 'applebloom_hair_back.bm';
	hairBackModelArray[39].textureFilename = hairFrontPath + 'applebloom_hair_back.png';
	
	hairBackModelArray[40].filename = hairFrontPath + 'scootaloo_hair_back.bm';
	hairBackModelArray[40].textureFilename = hairFrontPath + 'scootaloo_hair_back.png';
	
	hairBackModelArray[41].filename = hairFrontPath + 'sweetie_belle_hair_back.bm';
	hairBackModelArray[41].textureFilename = hairFrontPath + 'sweetie_belle_hair_back.png';
	
	hairBackModelArray[42] = 0;
	
	hairBackModelArray[43].filename = hairFrontPath + 'sunset_shimmer_hair_back.bm';
	hairBackModelArray[43].textureFilename = hairFrontPath + 'sunset_shimmer_mane.png';
	
	hairBackModelArray[44].filename = hairFrontPath + 'bigmac_hair_back.bm';
	hairBackModelArray[44].textureFilename = hairFrontPath + 'bigmac_hair.png';
	
	hairBackModelArray[45] = 0;
	
	hairBackModelArray[46].filename = hairFrontPath + 'fleur_de_lis_hair_back.bm';
	hairBackModelArray[46].textureFilename = hairFrontPath + 'fleur_de_lis.png';
	
	// ---------------------
	// init extra hairs ( for Cloudchaser only )
	// ---------------------
	hairExtraModelArray = new Array();
	var nb_hair_extra_styles = 2;
	for(var i=0; i<nb_hair_back_styles; i++){
		hairExtraModelArray.push(new ModelCharacter(i));
	}
	var hairExtraPath = './js/models/pony/hair_extra/';
	
	hairExtraModelArray[0] = 0;
	
	hairExtraModelArray[1].filename = hairExtraPath + 'cloudchaser_hair_extra.bm';
	hairExtraModelArray[1].textureFilename = hairExtraPath + 'cloudchaser_hair_extra.png';
	
	
	// ---------------------
	// init tails
	// ---------------------
	tailModelArray = new Array();
	var nb_tail_styles = 47;
	for(var i=0; i<nb_tail_styles; i++){
		tailModelArray.push(new ModelCharacter(i));
	}
	var tailPath = './js/models/pony/tail/';
	
	tailModelArray[0] = 0;
	
	tailModelArray[1].filename = tailPath + 'lyra_tail.bm';
	tailModelArray[1].textureFilename = tailPath + 'lyra_tail_fix.png';

	tailModelArray[2].filename = tailPath + 'bonbon_tail.bm';
	tailModelArray[2].textureFilename = tailPath + 'bonbon_tail.png';
	
	tailModelArray[3].filename = tailPath + 'octavia_tail.bm';
	tailModelArray[3].textureFilename = tailPath + 'octavia_tail.png';
  
	tailModelArray[4].filename = tailPath + 'vinyl_tail.bm';
	tailModelArray[4].textureFilename = tailPath + 'vinyl_tail.png';
  
	tailModelArray[5].filename = tailPath + 'derpy_tail.bm';
	tailModelArray[5].textureFilename = tailPath + 'derpy_tail_fix1.png';
	tailModelArray[5].maxColors = 3;
	
	tailModelArray[6].filename = tailPath + 'spa_sisters_tail.bm';
	tailModelArray[6].textureFilename = tailPath + 'spa_sisters_tail.png';
	
	tailModelArray[7].filename = tailPath + 'berrypunch_tail.bm';
	tailModelArray[7].textureFilename = unicolor;
	
	tailModelArray[8].filename = tailPath + 'carrottop_tail.bm';
	tailModelArray[8].textureFilename = unicolor;
	
	tailModelArray[9].filename = tailPath + 'cheerilee_tail.bm';
	tailModelArray[9].textureFilename = tailPath + 'cheerilee_tail.png';
	
	tailModelArray[10].filename = tailPath + 'cloudchaser_tail.bm';
	tailModelArray[10].textureFilename = tailPath + 'cloudchaser_tail.png';
	
	tailModelArray[11].filename = tailPath + 'flitter_tail.bm';
	tailModelArray[11].textureFilename = tailPath + 'flitter_tail.png';
	
	tailModelArray[12].filename = tailPath + 'lightningdust_tail.bm';
	tailModelArray[12].textureFilename = tailPath + 'lightningdust_tail.png';
	tailModelArray[12].maxColors = 3;
	
	tailModelArray[13].filename = tailPath + 'nurseredheart_tail.bm';
	tailModelArray[13].textureFilename = tailPath + 'nurseredheart_tail.png';
	
	tailModelArray[14].filename = tailPath + 'spitfire_tail.bm';
	tailModelArray[14].textureFilename = tailPath + 'spitfire_tail.png';
	
	tailModelArray[15].filename = tailPath + 'trixie_tail.bm';
	tailModelArray[15].textureFilename = tailPath + 'trixie_tail.png';
	
	tailModelArray[16].filename = tailPath + 'pinkamena_tail.bm';
	tailModelArray[16].textureFilename = tailPath + 'pinkamena_tail.png';
	
	tailModelArray[17] = 0; // Solid Sparkle : same tail as Twilight Sparkle
	
	tailModelArray[18].filename = tailPath + 'applejack_tail.bm';
	tailModelArray[18].textureFilename = tailPath + 'applejack_tail.png';
	tailModelArray[18].maxColors = 3;
	
	tailModelArray[19].filename = tailPath + 'fluttershy_tail.bm';
	tailModelArray[19].textureFilename = tailPath + 'fluttershy_tail.png';
	
	tailModelArray[20].filename = tailPath + 'pinkie_tail.bm';
	tailModelArray[20].textureFilename = tailPath + 'pinkie_tail.png';
	
	tailModelArray[21].filename = tailPath + 'rainbow_tail.bm';
	tailModelArray[21].textureFilename = unicolor;
	tailModelArray[21].texture1Filename = './js/models/pony/tail/rainbow_tail.png';
	tailModelArray[21].maxColors = 0;
	
	tailModelArray[22].filename = tailPath + 'rarity_tail.bm';
	tailModelArray[22].textureFilename = tailPath + 'rarity_tail.png';
	
	tailModelArray[23].filename = tailPath + 'twilight_tail.bm';
	tailModelArray[23].textureFilename = tailPath + 'twilight_tail.png';
	tailModelArray[23].maxColors = 3;
	
	tailModelArray[24] = 0;
	
	tailModelArray[25].filename = tailPath + 'celestia_tail.bm';
	tailModelArray[25].textureFilename = tailPath + 'celestia_tail.png';
	tailModelArray[25].maxColors = 3;
	
	tailModelArray[26] = 0;
	
	tailModelArray[27].filename = tailPath + 'cadence_tail.bm';
	tailModelArray[27].textureFilename = tailPath + 'cadence_tail.png';
	tailModelArray[27].maxColors = 3;
	
	tailModelArray[28].filename = tailPath + 'wet_tail.bm';
	tailModelArray[28].textureFilename = unicolor;

	tailModelArray[29].filename = tailPath + 'flutterbat_tail.bm';
	tailModelArray[29].textureFilename = tailPath + 'fluttershy_tail.png';
	
	tailModelArray[30].filename = hairFrontPath + 'braeburn_tail.bm';
	tailModelArray[30].textureFilename = hairFrontPath + 'braeburn_tail.png';
	
	tailModelArray[31].filename = hairFrontPath + 'caramel_tail.bm';
	tailModelArray[31].textureFilename = hairFrontPath + 'caramel_tail.png';
	
	tailModelArray[32].filename = hairFrontPath + 'nightlight_tail.bm';
	tailModelArray[32].textureFilename = hairFrontPath + 'nightlight_tail.png';
	
	tailModelArray[33].filename = hairFrontPath + 'noteworthy_tail.bm';
	tailModelArray[33].textureFilename = unicolor;
	
	tailModelArray[34].filename = hairFrontPath + 'pokeypierce_tail.bm';
	tailModelArray[34].textureFilename = hairFrontPath + 'pokeypierce_tail.png';
	
	tailModelArray[35].filename = hairFrontPath + 'soarin_tail.bm';
	tailModelArray[35].textureFilename = unicolor;
	
	tailModelArray[36].filename = hairFrontPath + 'thunderlane_tail.bm';
	tailModelArray[36].textureFilename = hairFrontPath + 'thunderlane_tail.png';
	
	tailModelArray[37].filename = hairFrontPath + 'drwhooves_tail.bm';
	tailModelArray[37].textureFilename = unicolor;

	tailModelArray[38].filename = hairFrontPath + 'chrysalis_tail.bm';
	tailModelArray[38].textureFilename = hairFrontPath + 'chrysalis_tail.png';
	
	tailModelArray[39].filename = hairFrontPath + 'applebloom_tail.bm';
	tailModelArray[39].textureFilename = hairFrontPath + 'applebloom_tail.png';
	
	tailModelArray[40].filename = hairFrontPath + 'scootaloo_tail.bm';
	tailModelArray[40].textureFilename = hairFrontPath + 'scootaloo_tail.png';
	
	tailModelArray[41].filename = hairFrontPath + 'sweetie_belle_tail.bm';
	tailModelArray[41].textureFilename = hairFrontPath + 'sweetie_belle_tail.png';
	
	tailModelArray[42].filename = tailPath + 'rainbow_tail.bm';
	tailModelArray[42].textureFilename = './js/models/pony/tail/rainbow_tail_2.png';
	tailModelArray[42].maxColors = 3; 
	
	tailModelArray[43].filename = hairFrontPath + 'sunset_shimmer_tail.bm';
	tailModelArray[43].textureFilename = hairFrontPath + 'sunset_shimmer_mane.png';
	
	tailModelArray[44].filename = hairFrontPath + 'bigmac_tail.bm';
	tailModelArray[44].textureFilename = hairFrontPath + 'bigmac_tail.png';
	
	tailModelArray[45].filename = hairFrontPath + 'luna_tail.bm';
	tailModelArray[45].textureFilename = hairFrontPath + 'luna_tail.png';
	
	tailModelArray[46].filename = hairFrontPath + 'fleur_de_lis_tail.bm';
	tailModelArray[46].textureFilename = hairFrontPath + 'fleur_de_lis.png';
	
	// ---------------------
	// init eyes
	// ---------------------
	leftEyeModel = new ModelCharacter();
	leftEyeModel.clampToEdge = true;
	leftEyeModel.filename = './js/models/pony/eyes/left_eye_v_0_3_0.obj';
	leftEyeModel.textureFilename = './js/models/pony/eyes/pupil_normal_l.png';
	var ol = new ObjLoader();
	ol.loadObj(leftEyeModel,1);
	
	rightEyeModel = new ModelCharacter();
	rightEyeModel.clampToEdge = true;
	rightEyeModel.filename = './js/models/pony/eyes/right_eye_v_0_3_0.obj';
	rightEyeModel.textureFilename = './js/models/pony/eyes/pupil_normal_r.png';
	var ol2 = new ObjLoader();
	ol2.loadObj(rightEyeModel,1);
	
	
	
	// ---------------------
	// init horns
	// ---------------------
	hornModelArray = new Array();
	
	var nb_horn_styles = 4;
	for(var i=0; i<nb_horn_styles; i++){
		hornModelArray.push(new ModelCharacter(i));
	}
	
	var hornPath = './js/models/pony/horn/';
	hornModelArray[0] = 0;
	hornModelArray[1].filename = hornPath + 'normal_horn.bm';
	hornModelArray[1].textureFilename = hornPath + 'normal_horn.png';
	
	hornModelArray[2].filename = hornPath + 'alicorn_horn.bm';
	hornModelArray[2].textureFilename = hornPath + 'alicorn_horn.png';
	
	hornModelArray[3].filename = hornPath + 'chrysalis_horn.bm';
	hornModelArray[3].textureFilename = hornPath + 'chrysalis_horn.png';
	
	 // preload this model, because the alicorn horn size is bugged the first time it loads
	loadModel(hornModelArray[2],true);
	
	// ---------------------
	// init wings
	// ---------------------
	var wingPath = './js/models/pony/wings/';
	var nb_wing_styles = 14;
	
	leftWingModelArray = new Array();
	for(var i=0; i<nb_wing_styles; i++){
		leftWingModelArray.push(new ModelCharacter(i));
	}
	leftWingModelArray[0] = 0;
	leftWingModelArray[1].filename = wingPath + 'left_normal_wing_open.bm';
	leftWingModelArray[1].textureFilename = unicolor;
	leftWingModelArray[2].filename = wingPath + 'left_bat_wing_open.bm';
	leftWingModelArray[2].textureFilename = tricolor;
	leftWingModelArray[3].filename = wingPath + 'left_large_wing_open.bm';
	leftWingModelArray[3].textureFilename = wingPath + 'large_wing_open.png';
	leftWingModelArray[4].filename = wingPath + 'left_normal_wing_closed.bm';
	leftWingModelArray[4].textureFilename = unicolor;
	leftWingModelArray[5].filename = wingPath + 'left_bat_wing_closed.bm';
	leftWingModelArray[5].textureFilename = tricolor;
	leftWingModelArray[6].filename = wingPath + 'left_large_wing_closed.bm';
	leftWingModelArray[6].textureFilename = wingPath + 'large_wing_open.png';
	leftWingModelArray[7].filename = wingPath + 'l_aviator_wing.bm';
	leftWingModelArray[7].textureFilename = unicolor;
	leftWingModelArray[8].filename = wingPath + 'l_mech_wing_fix1.bm';
	leftWingModelArray[8].textureFilename = wingPath + 'mech_wing.png';
	leftWingModelArray[9].filename = wingPath + 'l_dragon_wing.bm';
	leftWingModelArray[9].textureFilename = wingPath + 'dragon_wing.png';
	leftWingModelArray[10].filename = wingPath + 'l_mech_wing_closed.bm';
	leftWingModelArray[10].textureFilename = wingPath + 'mech_wing.png';
	leftWingModelArray[11].filename = wingPath + 'chrysalis_lwing_open_fix1.bm';
	leftWingModelArray[11].textureFilename = wingPath + 'chrysalis_wings.png';
	leftWingModelArray[12].filename = wingPath + 'left_dark_wing_open.bm';
	leftWingModelArray[12].textureFilename = unicolor;
	leftWingModelArray[13].filename = wingPath + 'left_dark_wing_closed.bm';
	leftWingModelArray[13].textureFilename = unicolor;
	
	
	rightWingModelArray = new Array();
	for(var i=0; i<nb_wing_styles; i++){
		rightWingModelArray.push(new ModelCharacter(i));
	}
	rightWingModelArray[0] = 0;
	rightWingModelArray[1].filename = wingPath + 'right_normal_wing_open.bm';
	rightWingModelArray[1].textureFilename = unicolor;
	rightWingModelArray[2].filename = wingPath + 'right_bat_wing_open_fix1.bm'; 
	rightWingModelArray[2].textureFilename = tricolor;
	rightWingModelArray[3].filename = wingPath + 'right_large_wing_open.bm';
	rightWingModelArray[3].textureFilename = wingPath + 'large_wing_open.png';
	rightWingModelArray[4].filename = wingPath + 'right_normal_wing_closed.bm';
	rightWingModelArray[4].textureFilename = unicolor;
	rightWingModelArray[5].filename = wingPath + 'right_bat_wing_closed.bm'; 
	rightWingModelArray[5].textureFilename = tricolor;
	rightWingModelArray[6].filename = wingPath + 'right_large_wing_closed.bm';
	rightWingModelArray[6].textureFilename = wingPath + 'large_wing_open.png';
	rightWingModelArray[7].filename = wingPath + 'right_aviator_wing_open_fix1.bm';
	rightWingModelArray[7].textureFilename = unicolor;
	rightWingModelArray[8].filename = wingPath + 'r_mech_wing_fix2.bm';
	rightWingModelArray[8].textureFilename = wingPath + 'mech_wing.png';
	rightWingModelArray[9].filename = wingPath + 'r_dragon_wing_fix1.bm';
	rightWingModelArray[9].textureFilename = wingPath + 'dragon_wing.png';
	rightWingModelArray[10].filename = wingPath + 'r_mech_wing_closed.bm';
	rightWingModelArray[10].textureFilename = wingPath + 'mech_wing.png';
	rightWingModelArray[11].filename = wingPath + 'chrysalis_rwing_open_fix1.bm';
	rightWingModelArray[11].textureFilename = wingPath + 'chrysalis_wings.png';
	rightWingModelArray[12].filename = wingPath + 'right_dark_wing_open.bm';
	rightWingModelArray[12].textureFilename = unicolor;
	rightWingModelArray[13].filename = wingPath + 'right_dark_wing_closed.bm';
	rightWingModelArray[13].textureFilename = unicolor;
	
	// ---------------------
	// init tongue
	// ---------------------
	tongueModelArray = new Array();
	
	var nb_tongue_styles = 2;
	for(var i=0; i<nb_tongue_styles; i++){
		tongueModelArray.push(new ModelCharacter(i));
	}
	
	var tonguePath = './js/models/pony/tongue/';
	tongueModelArray[0] = 0;
	tongueModelArray[1].filename = tonguePath + 'tongue1.bm';
	tongueModelArray[1].textureFilename = unicolor;

	// ---------------------
	// init eyelashes
	// ---------------------
	eyelashesModelArray = new Array();
	
	var nb_eyelashes_styles = 4;
	for(var i=0; i<nb_eyelashes_styles; i++){
		eyelashesModelArray.push(new ModelCharacter(i));
	}
	
	var eyelashesPath = './js/models/pony/eyelashes/';
	eyelashesModelArray[0] = 0;
	eyelashesModelArray[1].filename = eyelashesPath + 'eyelashes.bm';
	eyelashesModelArray[1].textureFilename = unicolor;
	eyelashesModelArray[2].filename = eyelashesPath + 'fluttershy_eyelashes.bm';
	eyelashesModelArray[2].textureFilename = unicolor;
	eyelashesModelArray[3].filename = eyelashesPath + 'rarity_eyelashes.bm';
	eyelashesModelArray[3].textureFilename = unicolor;
	
	
	// ---------------------
	// init teeth
	// ---------------------
	teethModelArray = new Array();
	
	var nb_teeth_styles = 2;
	for(var i=0; i<nb_teeth_styles; i++){
		teethModelArray.push(new ModelCharacter(i));
	}
	
	var teethPath = './js/models/pony/teeth/';
	teethModelArray[0] = 0;
	teethModelArray[1].filename = teethPath + 'fangs58.bm';
	teethModelArray[1].textureFilename = unicolor;
	
	
	// ---------------------
	// init collars
	// ---------------------
	collarModelArray = new Array();
	
	var nb_collar_styles = 18;
	for(var i=0; i<nb_collar_styles; i++){
		collarModelArray.push(new ModelCharacter(i));
	}
	
	collarModelArray[0] = 0;
	collarModelArray[1].filename = './js/models/pony/accessories/necklace_spa.bm';
	collarModelArray[1].textureFilename = "js/models/pony/accessories/necklace_spa.png";
	collarModelArray[2].filename = './js/models/pony/accessories/octavia_bowtie.bm';
	collarModelArray[2].textureFilename = "js/models/pony/accessories/octavia_bowtie.png";
	collarModelArray[3].filename = './js/models/pony/accessories/headphones.bm';
	collarModelArray[3].textureFilename = "js/models/pony/accessories/headphones.png";
	collarModelArray[4].filename = './js/models/pony/accessories/coco_tie.bm';
	collarModelArray[4].textureFilename = "js/models/pony/accessories/coco_tie.png";
	collarModelArray[5].filename = './js/models/pony/accessories/goggles_neck.bm';
	collarModelArray[5].textureFilename = tricolor;
	collarModelArray[6].filename = './js/models/pony/accessories/octavia_collar.bm';
	collarModelArray[6].textureFilename = unicolor;
	collarModelArray[7].filename = './js/models/pony/accessories/celestia_collar_fix1.bm';
	collarModelArray[7].textureFilename = './js/models/pony/accessories/celestia_collar.png';
	collarModelArray[8].filename = './js/models/pony/accessories/luna_collar.bm';
	collarModelArray[8].textureFilename = './js/models/pony/accessories/luna_collar.png';
	collarModelArray[9].filename = './js/models/pony/accessories/cadence_collar.bm';
	collarModelArray[9].textureFilename = unicolor;
	collarModelArray[10].filename = './js/models/pony/accessories/dark_collar.bm';
	collarModelArray[10].textureFilename = tricolor;
	collarModelArray[11].filename = './js/models/pony/accessories/element_of_honesty.bm';
	collarModelArray[11].textureFilename = './js/models/pony/accessories/element_of_honesty.png';
	collarModelArray[12].filename = './js/models/pony/accessories/element_of_kindness.bm';
	collarModelArray[12].textureFilename = './js/models/pony/accessories/element_of_kindness.png';
	collarModelArray[13].filename = './js/models/pony/accessories/element_of_laughter.bm';
	collarModelArray[13].textureFilename = './js/models/pony/accessories/element_of_laughter.png';
	collarModelArray[14].filename = './js/models/pony/accessories/element_of_loyalty.bm';
	collarModelArray[14].textureFilename = './js/models/pony/accessories/element_of_loyalty.png';
	collarModelArray[15].filename = './js/models/pony/accessories/element_of_generosity.bm';
	collarModelArray[15].textureFilename = './js/models/pony/accessories/element_of_generosity.png';
	collarModelArray[16].filename = './js/models/pony/accessories/scarf.bm';
	collarModelArray[16].textureFilename = unicolor;
	collarModelArray[17].filename = './js/models/pony/accessories/ankh.bm';
	collarModelArray[17].textureFilename = unicolor;
	
	// ---------------------
	// init headgears
	// ---------------------
	headgearModelArray = new Array();
	
	var nb_headgear_styles = 12;
	for(var i=0; i<nb_headgear_styles; i++){
		headgearModelArray.push(new ModelCharacter(i));
	}
	
	headgearModelArray[0] = 0;
	headgearModelArray[1].filename = './js/models/pony/accessories/flitter_bow_hair.bm';
	headgearModelArray[1].textureFilename = "js/models/pony/accessories/flitter_bow_hair.png";
	headgearModelArray[2].filename = './js/models/pony/accessories/applejack_hat.bm';
	headgearModelArray[2].textureFilename = "js/models/pony/accessories/applejack_hat.png";
	headgearModelArray[3].filename = './js/models/pony/accessories/coco_hair_clip.bm';
	headgearModelArray[3].textureFilename = "js/models/pony/accessories/coco_hair_clip.png";
	headgearModelArray[4].filename = './js/models/pony/accessories/bee_antennas.bm';
	headgearModelArray[4].textureFilename = "js/models/pony/accessories/bee_antennas.png";
	headgearModelArray[5].filename = './js/models/pony/accessories/celestia_crown.bm';
	headgearModelArray[5].textureFilename = tricolor;
	headgearModelArray[6].filename = './js/models/pony/accessories/luna_crown.bm';
	headgearModelArray[6].textureFilename = './js/models/pony/accessories/luna_collar.png';
	headgearModelArray[7].filename = './js/models/pony/accessories/cadence_crown.bm';
	headgearModelArray[7].textureFilename = tricolor;
	headgearModelArray[8].filename = './js/models/pony/accessories/sunset_shimmer_crown.bm';
	headgearModelArray[8].textureFilename = tricolor;
	headgearModelArray[9].filename = './js/models/pony/accessories/chrysalis_crown.bm';
	headgearModelArray[9].textureFilename = tricolor;
	headgearModelArray[10].filename = './js/models/pony/accessories/dark_helm.bm';
	headgearModelArray[10].textureFilename = unicolor;
	headgearModelArray[11].filename = './js/models/pony/accessories/element_of_magic.bm';
	headgearModelArray[11].textureFilename = './js/models/pony/accessories/element_of_magic.png';
	
	// ---------------------
	// init headgears
	// ---------------------
	headbandModelArray = new Array();
	
	var nb_headband_styles = 2;
	for(var i=0; i<nb_headband_styles; i++){
		headbandModelArray.push(new ModelCharacter(i));
	}
	
	headbandModelArray[0] = 0;
	headbandModelArray[1].filename = './js/models/pony/accessories/solidsparkle_headband.bm';
	headbandModelArray[1].textureFilename = "js/models/pony/accessories/solidsparkle_headband.png";

	
	// ---------------------
	// init glasses
	// ---------------------
	glassesArray = new Array();
	
	var nb_glasses_styles = 6;
	for(var i=0; i<nb_glasses_styles; i++){
		glassesArray.push(new ModelCharacter(i));
	}
	
	glassesArray[0] = 0;
	glassesArray[1].filename = './js/models/pony/accessories/patch.bm';
	glassesArray[1].textureFilename = unicolor;
	glassesArray[2].filename = './js/models/pony/accessories/rarity_glasses.bm';
	glassesArray[2].textureFilename = './js/models/pony/accessories/rarity_glasses.png';
	glassesArray[3].filename = './js/models/pony/accessories/shades.bm';
	glassesArray[3].textureFilename = './js/models/pony/accessories/shades_lense.png';
	glassesArray[4].filename = './js/models/pony/accessories/monocle.bm';
	glassesArray[4].textureFilename = tricolor;
	glassesArray[5].filename = './js/models/pony/accessories/male_glasses.bm';
	glassesArray[5].textureFilename = tricolor;

	// ---------------------
	// init other accessories
	// ---------------------
	accessoriesModelArray = new Array();
	
	var nb_acc_styles = 40;
	for(var i=0; i<nb_acc_styles; i++){
		accessoriesModelArray.push(new ModelCharacter(i));
	}

	var acc_path = './js/models/pony/accessories/';
	accessoriesModelArray[0] = 0;
	accessoriesModelArray[1].filename = acc_path+'bee_abdomen.bm';
	accessoriesModelArray[1].textureFilename = acc_path+'bee_abdomen.png';
	accessoriesModelArray[1].jointID = pelvisID;
	
	accessoriesModelArray[2].filename = acc_path+'legring_blb.bm';
	accessoriesModelArray[2].textureFilename = tricolor;
	accessoriesModelArray[2].jointID = l_leg2ID;
	
	accessoriesModelArray[3].filename = acc_path+'legring_blf.bm';
	accessoriesModelArray[3].textureFilename = tricolor;
	accessoriesModelArray[3].jointID = l_handID;
	
	accessoriesModelArray[4].filename = acc_path+'legring_brb.bm';
	accessoriesModelArray[4].textureFilename = tricolor;
	accessoriesModelArray[4].jointID = r_leg2ID;
	
	accessoriesModelArray[5].filename = acc_path+'legring_brf.bm';
	accessoriesModelArray[5].textureFilename = tricolor;
	accessoriesModelArray[5].jointID = r_handID;
	
	accessoriesModelArray[6].filename = acc_path+'legring_tlb.bm';
	accessoriesModelArray[6].textureFilename = tricolor;
	accessoriesModelArray[6].jointID = l_leg2ID;
	
	accessoriesModelArray[7].filename = acc_path+'legring_tlf.bm';
	accessoriesModelArray[7].textureFilename = tricolor;
	accessoriesModelArray[7].jointID = leftForearmID;
	
	accessoriesModelArray[8].filename = acc_path+'legring_trb.bm';
	accessoriesModelArray[8].textureFilename = tricolor;
	accessoriesModelArray[8].jointID = r_leg2ID;
	
	accessoriesModelArray[9].filename = acc_path+'legring_trf.bm';
	accessoriesModelArray[9].textureFilename = tricolor;
	accessoriesModelArray[9].jointID = rightForearmID;
	
	// shoes
	
	// Celestia's shoes
	accessoriesModelArray[10].filename = acc_path+'celestia_shoe_lb_fix1.bm';
	accessoriesModelArray[10].textureFilename = unicolor;
	accessoriesModelArray[10].jointID = l_footID;
	
	accessoriesModelArray[11].filename = acc_path+'celestia_shoe_lf_fix1.bm';
	accessoriesModelArray[11].textureFilename = unicolor;
	accessoriesModelArray[11].jointID = l_ballID;
	
	accessoriesModelArray[12].filename = acc_path+'celestia_shoe_rb.bm';
	accessoriesModelArray[12].textureFilename = unicolor;
	accessoriesModelArray[12].jointID = r_footID;
	
	accessoriesModelArray[13].filename = acc_path+'celestia_shoe_rf.bm';
	accessoriesModelArray[13].textureFilename = unicolor;
	accessoriesModelArray[13].jointID = r_ballID;
	
	// Luna's shoes
	accessoriesModelArray[14].filename = acc_path+'luna_shoe_lb_fix1.bm';
	accessoriesModelArray[14].textureFilename = acc_path+'luna_shoes.png';
	accessoriesModelArray[14].jointID = l_footID;
	
	accessoriesModelArray[15].filename = acc_path+'luna_shoe_lf_fix1.bm';
	accessoriesModelArray[15].textureFilename = acc_path+'luna_shoes.png';
	accessoriesModelArray[15].jointID = l_ballID;
	
	accessoriesModelArray[16].filename = acc_path+'luna_shoe_rb.bm';
	accessoriesModelArray[16].textureFilename = acc_path+'luna_shoes.png';
	accessoriesModelArray[16].jointID = r_footID;
	
	accessoriesModelArray[17].filename = acc_path+'luna_shoe_rf.bm';
	accessoriesModelArray[17].textureFilename = acc_path+'luna_shoes.png';
	accessoriesModelArray[17].jointID = r_ballID;
	
	// Nightmare Moon's shoes (Dark shoes)
	accessoriesModelArray[18].filename = acc_path+'dark_shoe_lb.bm';
	accessoriesModelArray[18].textureFilename = unicolor
	accessoriesModelArray[18].jointID = l_footID;
	
	accessoriesModelArray[19].filename = acc_path+'dark_shoe_lf.bm';
	accessoriesModelArray[19].textureFilename = unicolor
	accessoriesModelArray[19].jointID = l_ballID;
	
	accessoriesModelArray[20].filename = acc_path+'dark_shoe_rb.bm';
	accessoriesModelArray[20].textureFilename = unicolor
	accessoriesModelArray[20].jointID = r_footID;
	
	accessoriesModelArray[21].filename = acc_path+'dark_shoe_rf.bm';
	accessoriesModelArray[21].textureFilename = unicolor
	accessoriesModelArray[21].jointID = r_ballID;
	
	
	
	// ---------------------
	// init misc objects
	// ---------------------
	
	torusX = new InstanceCharacter();
	torusY = new InstanceCharacter();
	torusZ = new InstanceCharacter();
	torusX.model = new ModelCharacter();
	torusX.model.filename = './js/models/other/torusX.bm';
	torusX.model.textureFilename = unicolor;
	torusY.model = new ModelCharacter();
	torusY.model.filename = './js/models/other/torusY.bm';
	torusY.model.textureFilename = unicolor;
	torusZ.model = new ModelCharacter();
	torusZ.model.filename = './js/models/other/torusZ.bm';
	torusZ.model.textureFilename = unicolor;
	
	bigtorusX = new InstanceCharacter();
	bigtorusY = new InstanceCharacter();
	bigtorusZ = new InstanceCharacter();
	bigtorusX.model = new ModelCharacter();
	bigtorusX.model.filename = './js/models/other/bigtorusX.bm';
	bigtorusX.model.textureFilename = unicolor;
	bigtorusY.model = new ModelCharacter();
	bigtorusY.model.filename = './js/models/other/bigtorusY.bm';
	bigtorusY.model.textureFilename = unicolor;
	bigtorusZ.model = new ModelCharacter();
	bigtorusZ.model.filename = './js/models/other/bigtorusZ.bm';
	bigtorusZ.model.textureFilename = unicolor;
	bigtorusX.model.bUsePickingID = true;
	bigtorusY.model.bUsePickingID = true;
	bigtorusZ.model.bUsePickingID = true;
	
	jointSphereModel = new ModelCharacter();
	jointSphereModel.filename = './js/models/other/jointSphere.bm';
	jointSphereModel.textureFilename = unicolor;
	jointSphereModel.bUsePickingID = true;
	
	jointSphereInst = new InstanceCharacter();
	jointSphereInst.model = jointSphereModel;
	jointSphereInst.firstColor = [0.5,0.5,0.5,1.0];
	
	
	// ---------------------
	// init background
	// ---------------------
	
	bgModel = new ModelCharacter();
	bgModel.clampToEdge = true;
	//bgModel.textureFilename = './img/bg/1.png';
	bgModel.initTexture('./img/bg/bg1.png',0);
}



function initDefaultInstances(){
	// ---------------------
	// init a default pony 
	// ---------------------
		
	pony.firstColor = [0.53,0.58,0.8,1];
	pony.secondColor = [0.486,0.302,0.812,1];
	pony.thirdColor = [0.215,0.215,0.81,1];
	pony.shininess = 1;
	
	hairFront = new InstanceCharacter();
	loadModel(hairFrontModelArray[1],true);
	hairFront.model = hairFrontModelArray[1];
	changeElementValue('hairFrontStyleSelect','1');
	hairFront.firstColor = [0.24,0.77,0.72,1.0];
	hairFront.secondColor = [0.64,0.64,0.64,1.0];
	hairFront.thirdColor = [1.0,0.8,0.41,1.0];
	
	hairBack = new InstanceCharacter();
	loadModel(hairBackModelArray[1],true);
	hairBack.model = hairBackModelArray[1];
	changeElementValue('hairBackStyleSelect','1');
	hairBack.firstColor = [0.24,0.77,0.72,1.0];
	hairBack.secondColor = [0.64,0.64,0.64,1.0];
	hairBack.thirdColor = [1.0,0.8,0.41,1.0];
	
	hairExtra = new InstanceCharacter();
	hairExtra.model = 0;
	hairExtra.firstColor = [0.24,0.77,0.72,1.0];
	hairExtra.secondColor = [0.64,0.64,0.64,1.0];
	hairExtra.thirdColor = [1.0,0.8,0.41,1.0];
	
	tail = new InstanceCharacter();
	loadModel(tailModelArray[1],true);
	tail.model = tailModelArray[1];
	changeElementValue('tailStyleSelect','1');
	tail.firstColor = [0.24,0.77,0.72,1.0];
	tail.secondColor = [0.64,0.64,0.64,1.0];
	tail.thirdColor = [1.0,0.8,0.41,1.0];
	tail.height = 1;
	
	leftEye = new InstanceCharacter();
	leftEye.model = leftEyeModel;
	leftEye.firstColor = [1.0,1.0,1.0,1.0];
	leftEye.secondColor = [1.0,1.0,1.0,1.0];
	leftEye.thirdColor = [0.0,0.0,0.0,1.0];
	
	rightEye = new InstanceCharacter();
	rightEye.model = rightEyeModel;
	rightEye.firstColor = [1.0,1.0,1.0,1.0];
	rightEye.secondColor = [1.0,1.0,1.0,1.0];
	rightEye.thirdColor = [0.0,0.0,0.0,1.0];
	
	horn = new InstanceCharacter();
	horn.model = 0;
	horn.firstColor = [0.5,0.5,0.7,1.0];
	horn.secondColor = [0.64,0.64,0.64,1.0];
	//horn.secondColor = [0.35,0.35,0.49,1.0];
	
	leftWing = new InstanceCharacter();
	leftWing.model = 0;
	leftWing.firstColor = [0.53,0.58,0.8,1.0];
	leftWing.secondColor = [0.64,0.64,0.64,1.0];
	leftWing.thirdColor = [1.0,0.8,0.41,1.0];
	leftWing.height = 1;
	
	rightWing = new InstanceCharacter();
	rightWing.model = 0;
	rightWing.firstColor = [0.53,0.58,0.8,1.0];
	rightWing.secondColor = [0.64,0.64,0.64,1.0];
	rightWing.thirdColor = [1.0,0.8,0.41,1.0];
	rightWing.height = 1;
	
	tongue = new InstanceCharacter();
	loadModel(tongueModelArray[1],true);
	tongue.model = tongueModelArray[1];
	tongue.firstColor = [1.0,0.53,0.23,1.0];
	
	eyelashes = new InstanceCharacter();
	changeElementValue('EyelashesSelect','1');
	loadModel(eyelashesModelArray[1],true);
	eyelashes.model = eyelashesModelArray[1];
	eyelashes.firstColor = [0.0,0.0,0.0,1.0];
	
	teeth = new InstanceCharacter();
	loadModel(teethModelArray[1],true);
	teeth.model = teethModelArray[1];
	teeth.firstColor = [1.0,1.0,1.0,1.0];
	
	collar1 = new InstanceCharacter();
	collar1.model = 0;
	collar1.firstColor = [1.0,1.0,1.0,1.0]; 
	collar1.secondColor = [0.149,0.588,0.796,1.0]; 
	collar1.thirdColor = [1.0,0.8,0.41,1.0];
	
	headgear1 = new InstanceCharacter();
	headgear1.model = 0;
	headgear1.firstColor = [1.0,1.0,1.0,1.0]; 
	headgear1.secondColor = [0.149,0.588,0.796,1.0]; 
	headgear1.thirdColor = [1.0,0.8,0.41,1.0];
	
	headbandA[0] = new InstanceCharacter();
	headbandA[0].model = 0;
	headbandA[0].firstColor = [1.0,1.0,1.0,1.0]; 
	headbandA[0].secondColor = [0.149,0.588,0.796,1.0]; 
	headbandA[0].thirdColor = [1.0,0.8,0.41,1.0];
	
	headbandA[1] = new InstanceCharacter();
	headbandA[1].model = 0;
	headbandA[1].firstColor = [1.0,1.0,1.0,1.0]; 
	headbandA[1].secondColor = [0.149,0.588,0.796,1.0]; 
	headbandA[1].thirdColor = [1.0,0.8,0.41,1.0];
	
	accessories = new Array(13);
	for(var i=0; i<accessories.length; i++){
		accessories[i] = new InstanceCharacter();
		accessories[i].model = 0;
		accessories[i].firstColor = [1.0,1.0,1.0,1.0]; 
		accessories[i].secondColor = [0.149,0.588,0.796,1.0]; 
		accessories[i].thirdColor = [1.0,0.8,0.41,1.0];
	}
	
	headSize = vec3.createFrom(1,1,1);
	
	// reset sliders
	changeElementValue('txlEye','0');
	changeElementValue('txrEye','0');
	changeElementValue('tylEye','0');
	changeElementValue('tyrEye','0');
	changeElementValue('slEye','1');
	changeElementValue('srEye','1');
	changeElementValue('headSize','1');
	for(var i=1; i<50; i++){
		changeElementValue('rangeMorph'+i,'0');
	}
	
	
	
	
}



// to do : move these 2 functions into the model class.

function loadModel(model,async){
	// load a collada or binary file into a model
	if(!model){
		return;
	}
	if(model.getLoadState() == 0){
		model.setLoading();
		var ext = model.filename.split('.').pop();
		if(ext == 'dae'){
			var cl = new ColladaLoader();
			cl.loadCollada(model,async);
		}
		else if(ext == 'bm'){
			var bm = new BinaryModel();
			bm.loadBinaryModel(model);
		}
	}
	// else, the model is loading or already loaded
}


	
	
// ******************************************
// **        SHADERS INITIALIZATION        **
// ******************************************

function initShaders() {
	
	// ---------------------
	// programCharacter2 (mane, tail and horn) (and body since 1.1.0)
	// ---------------------
	
	var fragmentShader = getShader(gl, "shader-fs");  
	var vertexShader2 = getShader(gl, "shader-vs2"); 
    programCharacter2 = gl.createProgram(); 
    gl.attachShader(programCharacter2, vertexShader2); 
    gl.attachShader(programCharacter2, fragmentShader); 
    gl.linkProgram(programCharacter2); 
	
	if (!gl.getProgramParameter(programCharacter2, gl.LINK_STATUS)) { 
      alert("Unable to initialize shaders"); 
    } 
	
	// uniforms
	programCharacter2.pMatrixUniform = gl.getUniformLocation(programCharacter2, "uPMatrix"); 
    programCharacter2.mvMatrixUniform = gl.getUniformLocation(programCharacter2, "uMVMatrix"); 
	programCharacter2.normalMatrixUniform = gl.getUniformLocation(programCharacter2, "NormalMatrix"); 
	programCharacter2.uAnim = gl.getUniformLocation (programCharacter2, "Anim") ;
	programCharacter2.uSampler = gl.getUniformLocation(programCharacter2, "uSampler");
	programCharacter2.uSampler2 = gl.getUniformLocation(programCharacter2, "uSampler2");
	programCharacter2.uFirstColor = gl.getUniformLocation(programCharacter2, "uFirstColor");
	programCharacter2.uSecondColor = gl.getUniformLocation(programCharacter2, "uSecondColor");
	programCharacter2.uThirdColor = gl.getUniformLocation(programCharacter2, "uThirdColor");
	programCharacter2.uShadingType = gl.getUniformLocation(programCharacter2, "uShadingType");
	programCharacter2.uPosLight0 = gl.getUniformLocation(programCharacter2, "uPosLight0");
	programCharacter2.uAmbientLight0 = gl.getUniformLocation(programCharacter2, "uAmbientLight0");
	programCharacter2.uDiffuseLight0 = gl.getUniformLocation(programCharacter2, "uDiffuseLight0");
	programCharacter2.uSpecularLight0 = gl.getUniformLocation(programCharacter2, "uSpecularLight0");
	programCharacter2.uShininess = gl.getUniformLocation(programCharacter2, "uShininess");
	programCharacter2.uTex1Alpha = gl.getUniformLocation(programCharacter2, "uTex1Alpha");
	programCharacter2.uTex1u = gl.getUniformLocation(programCharacter2, "uTex1u");
	programCharacter2.uTex1v = gl.getUniformLocation(programCharacter2, "uTex1v");
	programCharacter2.uHSV = gl.getUniformLocation(programCharacter2, "uHSV");
	
	// attributes
	programCharacter2.vertexPosition = gl.getAttribLocation(programCharacter2, "VertexPosition"); 
    gl.enableVertexAttribArray(programCharacter2.vertexPosition);
	programCharacter2.vertexNormal = gl.getAttribLocation(programCharacter2, "VertexNormal"); 
    gl.enableVertexAttribArray(programCharacter2.vertexNormal);
	programCharacter2.vertexTexCoord = gl.getAttribLocation(programCharacter2, "VertexTexCoord"); 
    gl.enableVertexAttribArray(programCharacter2.vertexTexCoord);
	programCharacter2.joint = gl.getAttribLocation(programCharacter2, "Joint"); 
    gl.enableVertexAttribArray(programCharacter2.joint);
	programCharacter2.weight = gl.getAttribLocation(programCharacter2, "Weight"); 
    gl.enableVertexAttribArray(programCharacter2.weight);
	
	
	// ---------------------
	// programBG (background)
	// ---------------------
	var fragmentShaderObject = getShader(gl, "shader-fsObject"); 
    var vertexShaderObject = getShader(gl, "shader-vsObject"); 

    programBG = gl.createProgram(); 
    gl.attachShader(programBG, vertexShaderObject); 
    gl.attachShader(programBG, fragmentShaderObject); 
    gl.linkProgram(programBG); 

    if (!gl.getProgramParameter(programBG, gl.LINK_STATUS)) { 
      alert("Unable to initialize shaders"); 
    } 
	
	// uniforms
	programBG.pMatrixUniform = gl.getUniformLocation(programBG, "uPMatrix"); 
    programBG.mvMatrixUniform = gl.getUniformLocation(programBG, "uMVMatrix"); 
	programBG.uSampler = gl.getUniformLocation(programBG, "uSampler");
	
	// attributes
	programBG.vertexPosition = gl.getAttribLocation(programBG, "VertexPosition"); 
    gl.enableVertexAttribArray(programBG.vertexPosition);
	programBG.vertexTexCoord = gl.getAttribLocation(programBG, "VertexTexCoord");
	gl.enableVertexAttribArray(programBG.vertexTexCoord);
	
	// ---------------------
	// programEyes (eyes)
	// ---------------------
	
	var fragmentShaderEyes = getShader(gl, "shader-fs-eye"); 

	programEyes = gl.createProgram(); 
    gl.attachShader(programEyes, vertexShader2); 
    gl.attachShader(programEyes, fragmentShaderEyes); 
    gl.linkProgram(programEyes); 
	
	if (!gl.getProgramParameter(programEyes, gl.LINK_STATUS)) { 
      alert("Unable to initialize shaders"); 
    } 
	
	// uniforms
	programEyes.pMatrixUniform = gl.getUniformLocation(programEyes, "uPMatrix"); 
    programEyes.mvMatrixUniform = gl.getUniformLocation(programEyes, "uMVMatrix"); 
	programEyes.normalMatrixUniform = gl.getUniformLocation(programEyes, "NormalMatrix"); 
	programEyes.uAnim = gl.getUniformLocation (programEyes, "Anim") ;
	programEyes.uSampler = gl.getUniformLocation(programEyes, "uSampler");
	programEyes.uHSV = gl.getUniformLocation(programEyes, "uHSV");
	programEyes.uWhitecolor = gl.getUniformLocation(programEyes, "uWhitecolor");
	programEyes.uUVtranslation = gl.getUniformLocation(programEyes, "uUVtranslation");
	programEyes.uUVscale = gl.getUniformLocation(programEyes, "uUVscale");
	programEyes.uShadingType = gl.getUniformLocation(programEyes, "uShadingType");
	programEyes.uPosLight0 = gl.getUniformLocation(programEyes, "uPosLight0");
	programEyes.uAmbientLight0 = gl.getUniformLocation(programEyes, "uAmbientLight0");
	programEyes.uDiffuseLight0 = gl.getUniformLocation(programEyes, "uDiffuseLight0");
	programEyes.uSpecularLight0 = gl.getUniformLocation(programEyes, "uSpecularLight0");
	programEyes.uShininess = gl.getUniformLocation(programEyes, "uShininess");
	
	// attributes
	programEyes.vertexPosition = gl.getAttribLocation(programEyes, "VertexPosition"); 
    gl.enableVertexAttribArray(programEyes.vertexPosition);
	programEyes.vertexNormal = gl.getAttribLocation(programEyes, "VertexNormal"); 
    gl.enableVertexAttribArray(programEyes.vertexNormal);
	programEyes.vertexTexCoord = gl.getAttribLocation(programEyes, "VertexTexCoord"); 
    gl.enableVertexAttribArray(programEyes.vertexTexCoord);
	programEyes.joint = gl.getAttribLocation(programEyes, "Joint"); 
    gl.enableVertexAttribArray(programEyes.joint);
	programEyes.weight = gl.getAttribLocation(programEyes, "Weight"); 
    gl.enableVertexAttribArray(programEyes.weight);

	
	
	// ---------------------
	// programPicking (interactive triangle selection)
	// ---------------------
	InitProgramPicking();
	
	// ---------------------
	// programSticker (sticker)
	// ---------------------
	InitProgramSticker();
	
	
	// ---------------------
	// programPickingID 
	// ---------------------
	InitProgramPickingID();
	
}

function InitProgramPickingID(){
	var fragmentShader = getShader(gl, "shader-fs-Picking-ID"); 
    var vertexShader = getShader(gl, "shader-vs-Picking-ID"); 
	 
    programPickingID = gl.createProgram(); 
    gl.attachShader(programPickingID, vertexShader); 
	gl.attachShader(programPickingID, fragmentShader); 
    gl.linkProgram(programPickingID); 

    if (!gl.getProgramParameter(programPickingID, gl.LINK_STATUS)) { 
      alert("Unable to initialize shaders"); 
    } 
	
	// uniforms
	programPickingID.pMatrixUniform = gl.getUniformLocation(programPickingID, "uPMatrix"); 
    programPickingID.mvMatrixUniform = gl.getUniformLocation(programPickingID, "uMVMatrix"); 
	programPickingID.uAnim = gl.getUniformLocation (programPickingID, "Anim") ;
	programPickingID.uID = gl.getUniformLocation(programPickingID, "uID");
	
	// attributes
	programPickingID.vertexPosition = gl.getAttribLocation(programPickingID, "VertexPosition"); 
    gl.enableVertexAttribArray(programPickingID.vertexPosition);
	programPickingID.joint = gl.getAttribLocation(programPickingID, "Joint"); 
    gl.enableVertexAttribArray(programPickingID.joint);
	programPickingID.weight = gl.getAttribLocation(programPickingID, "Weight"); 
    gl.enableVertexAttribArray(programPickingID.weight);
	
}
	
function InitProgramSticker(){
	var fragmentShader = getShader(gl, "shader-fs-Sticker"); 
	var vertexShader = getShader(gl, "shader-vs2"); 
	
	 
    programSticker = gl.createProgram(); 
    gl.attachShader(programSticker, vertexShader); 
	gl.attachShader(programSticker, fragmentShader); 
    gl.linkProgram(programSticker); 

    if (!gl.getProgramParameter(programSticker, gl.LINK_STATUS)) { 
      alert("Unable to initialize shaders"); 
    } 
	
	// uniforms
	programSticker.pMatrixUniform = gl.getUniformLocation(programSticker, "uPMatrix"); 
    programSticker.mvMatrixUniform = gl.getUniformLocation(programSticker, "uMVMatrix"); 
	programSticker.normalMatrixUniform = gl.getUniformLocation(programSticker, "NormalMatrix"); 
	programSticker.uAnim = gl.getUniformLocation (programSticker, "Anim") ;
	programSticker.uSampler = gl.getUniformLocation(programSticker, "uSampler");
	programSticker.uShadingType = gl.getUniformLocation(programSticker, "uShadingType");
	programSticker.uPosLight0 = gl.getUniformLocation(programSticker, "uPosLight0");
	programSticker.uAmbientLight0 = gl.getUniformLocation(programSticker, "uAmbientLight0");
	programSticker.uDiffuseLight0 = gl.getUniformLocation(programSticker, "uDiffuseLight0");
	programSticker.uSpecularLight0 = gl.getUniformLocation(programSticker, "uSpecularLight0");
	programSticker.uShininess = gl.getUniformLocation(programSticker, "uShininess");

	
	// attributes
	programSticker.vertexPosition = gl.getAttribLocation(programSticker, "VertexPosition"); 
    gl.enableVertexAttribArray(programSticker.vertexPosition);
	programSticker.vertexNormal = gl.getAttribLocation(programSticker, "VertexNormal"); 
    gl.enableVertexAttribArray(programSticker.vertexNormal);
	programSticker.vertexTexCoord = gl.getAttribLocation(programSticker, "VertexTexCoord"); 
    gl.enableVertexAttribArray(programSticker.vertexTexCoord);
	programSticker.joint = gl.getAttribLocation(programSticker, "Joint"); 
    gl.enableVertexAttribArray(programSticker.joint);
	programSticker.weight = gl.getAttribLocation(programSticker, "Weight"); 
    gl.enableVertexAttribArray(programSticker.weight);

}


function InitProgramPicking(){
	var fragmentShader = getShader(gl, "shader-fs-Picking"); 
    var vertexShader = getShader(gl, "shader-vs-Picking"); 
	 
    programPicking = gl.createProgram(); 
    gl.attachShader(programPicking, vertexShader); 
	gl.attachShader(programPicking, fragmentShader); 
    gl.linkProgram(programPicking); 

    if (!gl.getProgramParameter(programPicking, gl.LINK_STATUS)) { 
      alert("Unable to initialize shaders"); 
    } 
	
	// uniforms
	programPicking.pMatrixUniform = gl.getUniformLocation(programPicking, "uPMatrix"); 
    programPicking.mvMatrixUniform = gl.getUniformLocation(programPicking, "uMVMatrix"); 
	programPicking.uAnim = gl.getUniformLocation (programPicking, "Anim") ;
	
	// attributes
	programPicking.vertexPosition = gl.getAttribLocation(programPicking, "VertexPosition"); 
    gl.enableVertexAttribArray(programPicking.vertexPosition);
	programPicking.joint = gl.getAttribLocation(programPicking, "Joint"); 
    gl.enableVertexAttribArray(programPicking.joint);
	programPicking.weight = gl.getAttribLocation(programPicking, "Weight"); 
    gl.enableVertexAttribArray(programPicking.weight);
	programPicking.aTriangleID = gl.getAttribLocation(programPicking, "aTriangleID"); 
    gl.enableVertexAttribArray(programPicking.aTriangleID);
}

function initPickingIDShader(model){
	
	var positions = new Array();
	for(var i=0;i<model.mesh.vertices.length;i++){
		positions.push(model.mesh.vertices[i].position[0]); 
		positions.push(model.mesh.vertices[i].position[1]); 
		positions.push(model.mesh.vertices[i].position[2]); 
	}

	var indices = new Array();
	for(var i=0;i<model.mesh.faces.length;i++){
		indices.push(model.mesh.faces[i].x); 
		indices.push(model.mesh.faces[i].y); 
		indices.push(model.mesh.faces[i].z); 
	}
	
	var joints = new Array();
	for(var i=0;i<model.mesh.vertices.length;i++){	
		joints[i*4] = model.mesh.vertices[i].jointsID[0];
		if(model.mesh.vertices[i].jointsID.length == 1) { joints[i*4+1] = joints[i*4+2] = joints[i*4+3] = 0.0; continue;}
		joints[i*4+1] = model.mesh.vertices[i].jointsID[1];
		if(model.mesh.vertices[i].jointsID.length == 2) { joints[i*4+2] = joints[i*4+3] = 0.0; continue;}
		joints[i*4+2] = model.mesh.vertices[i].jointsID[2];
		if(model.mesh.vertices[i].jointsID.length == 3) { joints[i*4+3] = 0.0; continue;}
		joints[i*4+3] = model.mesh.vertices[i].jointsID[3];
	}

	var weights = new Array();
	for(var i=0;i<model.mesh.vertices.length;i++){	
		weights[i*4] = model.mesh.vertices[i].weights[0];
		if(model.mesh.vertices[i].weights.length == 1) { weights[i*4+1] = weights[i*4+2] = weights[i*4+3] = 0.0; continue;}
		weights[i*4+1] = model.mesh.vertices[i].weights[1];
		if(model.mesh.vertices[i].weights.length == 2) { weights[i*4+2] = weights[i*4+3] = 0.0; continue;}
		weights[i*4+2] = model.mesh.vertices[i].weights[2];
		if(model.mesh.vertices[i].weights.length == 3) { weights[i*4+3] = 0.0; continue;}
		weights[i*4+3] = model.mesh.vertices[i].weights[3];
	}
	
	model.VertexPositionBufferPickingID = gl.createBuffer(); 
    gl.bindBuffer(gl.ARRAY_BUFFER, model.VertexPositionBufferPickingID); 
	gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(positions), gl.DYNAMIC_DRAW); 

	model.WeightBufferPickingID = gl.createBuffer(); 
    gl.bindBuffer(gl.ARRAY_BUFFER, model.WeightBufferPickingID); 
	gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(weights), gl.DYNAMIC_DRAW);
	
	model.VertexIndexBufferPickingID = gl.createBuffer(); 
	gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, model.VertexIndexBufferPickingID);
	gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, new Uint16Array(indices), gl.DYNAMIC_DRAW);
	
	model.JointBufferPickingID = gl.createBuffer(); 
    gl.bindBuffer(gl.ARRAY_BUFFER, model.JointBufferPickingID); 
	gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(joints), gl.DYNAMIC_DRAW);

}

function initPickingShader(model){
	// create a temporary new mesh whose vertices contain triangle indices

	var newMesh = new Mesh();
	for(var i=0; i<model.mesh.faces.length; i++){
		var tri = model.mesh.faces[i];
		var vertex1 = model.mesh.vertices[tri.x];
		var vertex2 = model.mesh.vertices[tri.y];
		var vertex3 = model.mesh.vertices[tri.z];
		newMesh.vertices.push(vertex1);
		newMesh.vertices.push(vertex2);
		newMesh.vertices.push(vertex3);
		var i3 = i*3;
		var newTri = new Triangle(i3,i3+1,i3+2);
		newMesh.addTriangle(newTri);
	}
	
	var positions = new Array();
	for(var i=0;i<newMesh.vertices.length;i++){
		positions.push(newMesh.vertices[i].position[0]); 
		positions.push(newMesh.vertices[i].position[1]); 
		positions.push(newMesh.vertices[i].position[2]); 
	}
	
	var indices = new Array();
	for(var i=0;i<newMesh.faces.length;i++){
		indices.push(newMesh.faces[i].x); // i3
		indices.push(newMesh.faces[i].y); // i3 + 1
		indices.push(newMesh.faces[i].z); // i3 + 2
	}

	var aTriangleID = new Array();
	for(var i=0;i<newMesh.vertices.length;i++){
		var triID = parseInt(i/3);
		
		var r = ((triID >> 16) & 255) / 255.0;   
		var g = ((triID >> 8) & 255) / 255.0;
		var b = (triID & 255) / 255.0;
		aTriangleID.push(r);
		aTriangleID.push(g);
		aTriangleID.push(b);
	}

	// A vertex can be attached to 4 joints or less.
	var joints = new Float32Array(newMesh.vertices.length*4);
	for(var i=0;i<newMesh.vertices.length;i++){	
		joints[i*4] = parseFloat(newMesh.vertices[i].jointsID[0]);
		if(newMesh.vertices[i].jointsID.length == 1) { joints[i*4+1] = joints[i*4+2] = joints[i*4+3] = 0.0; continue;}
		joints[i*4+1] = parseFloat(newMesh.vertices[i].jointsID[1]);
		if(newMesh.vertices[i].jointsID.length == 2) { joints[i*4+2] = joints[i*4+3] = 0.0; continue;}
		joints[i*4+2] = parseFloat(newMesh.vertices[i].jointsID[2]);
		if(newMesh.vertices[i].jointsID.length == 3) { joints[i*4+3] = 0.0; continue;}
		joints[i*4+3] = parseFloat(newMesh.vertices[i].jointsID[3]);
	}

	var weights = new Float32Array(newMesh.vertices.length*4);
	for(var i=0;i<newMesh.vertices.length;i++){	
		weights[i*4] = newMesh.vertices[i].weights[0];
		if(newMesh.vertices[i].weights.length == 1) { weights[i*4+1] = weights[i*4+2] = weights[i*4+3] = 0.0; continue;}
		weights[i*4+1] = newMesh.vertices[i].weights[1];
		if(newMesh.vertices[i].weights.length == 2) { weights[i*4+2] = weights[i*4+3] = 0.0; continue;}
		weights[i*4+2] = newMesh.vertices[i].weights[2];
		if(newMesh.vertices[i].weights.length == 3) { weights[i*4+3] = 0.0; continue;}
		weights[i*4+3] = newMesh.vertices[i].weights[3];
	}
	
	// ---------------------
	// to shader
	// ---------------------


	if(model.VertexPositionBufferPicking) delete(model.VertexPositionBufferPicking);
	model.VertexPositionBufferPicking = gl.createBuffer(); 
    gl.bindBuffer(gl.ARRAY_BUFFER, model.VertexPositionBufferPicking); 
	gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(positions), gl.DYNAMIC_DRAW); 
	
	if(model.WeightBufferPicking) delete(model.WeightBufferPicking);
	model.WeightBufferPicking = gl.createBuffer(); 
    gl.bindBuffer(gl.ARRAY_BUFFER, model.WeightBufferPicking); 
	gl.bufferData(gl.ARRAY_BUFFER, weights, gl.DYNAMIC_DRAW);
	
	if(model.VertexIndexBufferPicking) delete(model.VertexIndexBufferPicking);
	model.VertexIndexBufferPicking = gl.createBuffer(); 
	gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, model.VertexIndexBufferPicking);
	gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, new Uint16Array(indices), gl.DYNAMIC_DRAW);
	
	if(model.JointBufferPicking) delete(model.JointBufferPicking);
	model.JointBufferPicking = gl.createBuffer(); 
    gl.bindBuffer(gl.ARRAY_BUFFER, model.JointBufferPicking); 
	gl.bufferData(gl.ARRAY_BUFFER, joints, gl.DYNAMIC_DRAW); // Uncaught illegal access on Chrome ??

	if(model.aTriangleIDBufferPicking) delete(model.aTriangleIDBufferPicking);
	model.aTriangleIDBufferPicking = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, model.aTriangleIDBufferPicking); 
	gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(aTriangleID), gl.DYNAMIC_DRAW); 
	
	
}


function initCharacterShader(model){
	initCharacterShader2(model); // use normal shader
}


function initCharacterShader2(model){

	// init the normal shader for characters
	
	var mesh = model.mesh;
	
	var positions = new Array();
	for(var i=0;i<model.mesh.vertices.length;i++){
		positions.push(model.mesh.vertices[i].position[0]); 
		positions.push(model.mesh.vertices[i].position[1]); 
		positions.push(model.mesh.vertices[i].position[2]); 
		mesh.vertices[i].opos[0] = mesh.vertices[i].position[0];
		mesh.vertices[i].opos[1] = mesh.vertices[i].position[1];
		mesh.vertices[i].opos[2] = mesh.vertices[i].position[2];
	}
	
	var normals = new Array();
	for(var i=0;i<model.mesh.vertices.length;i++){
		normals.push(model.mesh.vertices[i].normal[0]); 
		normals.push(model.mesh.vertices[i].normal[1]); 
		normals.push(model.mesh.vertices[i].normal[2]); 
	}
	
	var uvcoords = new Array();
	for(var i=0;i<model.mesh.vertices.length;i++){
		uvcoords.push(model.mesh.vertices[i].uvcoord[0]);
		uvcoords.push(model.mesh.vertices[i].uvcoord[1]);
	}

	var indices = new Array();
	for(var i=0;i<model.mesh.faces.length;i++){
		indices.push(model.mesh.faces[i].x); 
		indices.push(model.mesh.faces[i].y); 
		indices.push(model.mesh.faces[i].z); 
	}

	// A vertex can be attached to 4 joints or less.
	var joints = new Array();
	for(var i=0;i<model.mesh.vertices.length;i++){	
		joints[i*4] = model.mesh.vertices[i].jointsID[0];
		if(model.mesh.vertices[i].jointsID.length == 1) { joints[i*4+1] = joints[i*4+2] = joints[i*4+3] = 0.0; continue;}
		joints[i*4+1] = model.mesh.vertices[i].jointsID[1];
		if(model.mesh.vertices[i].jointsID.length == 2) { joints[i*4+2] = joints[i*4+3] = 0.0; continue;}
		joints[i*4+2] = model.mesh.vertices[i].jointsID[2];
		if(model.mesh.vertices[i].jointsID.length == 3) { joints[i*4+3] = 0.0; continue;}
		joints[i*4+3] = model.mesh.vertices[i].jointsID[3];
	}

	var weights = new Array();
	for(var i=0;i<model.mesh.vertices.length;i++){	
		weights[i*4] = model.mesh.vertices[i].weights[0];
		if(model.mesh.vertices[i].weights.length == 1) { weights[i*4+1] = weights[i*4+2] = weights[i*4+3] = 0.0; continue;}
		weights[i*4+1] = model.mesh.vertices[i].weights[1];
		if(model.mesh.vertices[i].weights.length == 2) { weights[i*4+2] = weights[i*4+3] = 0.0; continue;}
		weights[i*4+2] = model.mesh.vertices[i].weights[2];
		if(model.mesh.vertices[i].weights.length == 3) { weights[i*4+3] = 0.0; continue;}
		weights[i*4+3] = model.mesh.vertices[i].weights[3];
	}

	model.VertexPositionBuffer = gl.createBuffer(); 
    gl.bindBuffer(gl.ARRAY_BUFFER, model.VertexPositionBuffer); 
	gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(positions), gl.DYNAMIC_DRAW); 
	
	model.VertexNormalBuffer = gl.createBuffer(); 
    gl.bindBuffer(gl.ARRAY_BUFFER, model.VertexNormalBuffer); 
	gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(normals), gl.DYNAMIC_DRAW);
	
	model.UVBuffer = gl.createBuffer(); 
    gl.bindBuffer(gl.ARRAY_BUFFER, model.UVBuffer); 
	gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(uvcoords), gl.DYNAMIC_DRAW);
	
	model.WeightBuffer = gl.createBuffer(); 
    gl.bindBuffer(gl.ARRAY_BUFFER, model.WeightBuffer); 
	gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(weights), gl.DYNAMIC_DRAW);
	
	model.VertexIndexBuffer = gl.createBuffer(); 
	gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, model.VertexIndexBuffer);
	gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, new Uint16Array(indices), gl.DYNAMIC_DRAW);
	
	model.JointBuffer = gl.createBuffer(); 
    gl.bindBuffer(gl.ARRAY_BUFFER, model.JointBuffer); 
	gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(joints), gl.DYNAMIC_DRAW);
	
}




// update stickers after each modification of the mesh (facial expression, weight, ...)

function updateStickers(){
	for(var i=0;i<stickerNumber;i++){
		var sticker = pony.model.sticker[i];
		if(sticker.display){
			sticker.initStickerTexture(sticker.src);
			initStickerShader1(pony.model,sticker.vertIDs,sticker.triIDs,sticker.triID,sticker);
		}
	}
	var a = pony.model.lCutieMark;
	initStickerShader1(pony.model,a.vertIDs,a.triIDs,a.triID,a);
	var b = pony.model.rCutieMark;
	initStickerShader1(pony.model,b.vertIDs,b.triIDs,b.triID,b);
	
	initPickingShader(pony.model);
}



	// background
function initBackground(){	
	
	var positions = [
        1.0, 1.0, 0.0,
        -1.0, 1.0, 0.0,
        1.0, -1.0, 0.0,
        -1.0, -1.0, 0.0
    ];
	
	var textureCoords = [
			0.0,  0.0,      
			1.0,  0.0,  
			0.0,  1.0,      
			1.0,  1.0,      
	];
	
		
	var indices = [
			0, 1, 2,
			1, 2, 3
	];
	
	bgVertexPositionBuffer = gl.createBuffer(); 
    gl.bindBuffer(gl.ARRAY_BUFFER, bgVertexPositionBuffer); 
	gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(positions), gl.STATIC_DRAW); 

	bgUVBuffer  = gl.createBuffer();
	gl.bindBuffer(gl.ARRAY_BUFFER, bgUVBuffer );
	gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(textureCoords), gl.STATIC_DRAW);
		
	bgVertexIndexBuffer = gl.createBuffer(); 
	gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, bgVertexIndexBuffer);
	gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, new Uint16Array(indices), gl.STATIC_DRAW);

}


var bgColor = document.getElementById("bgColor");
var bgTransparency = document.getElementById("bgTransparency");

bgColor.onchange = function() {
	bgColorR = this.color.rgb[0];
	bgColorG = this.color.rgb[1];
	bgColorB = this.color.rgb[2];
}

bgTransparency.onchange = function() {
	bgColorA = bgTransparency.value;
	bgColorA = clamp(bgColorA,0,1);
	if(!bgNum){
		var str = "rgba(255,255,255,"+bgColorA+")";
		$('canvas').css("background", str);
	}
}

function initObjectShader(model){
	// init the shader for one given model

	var positions = new Array();
	for(var i=0;i<model.mesh.vertices.length;i++){
		positions.push(model.mesh.vertices[i].position[0]); 
		positions.push(model.mesh.vertices[i].position[1]); 
		positions.push(model.mesh.vertices[i].position[2]); 
	}
	
	var normals = new Array();
	for(var i=0;i<model.mesh.vertices.length;i++){
		normals.push(model.mesh.vertices[i].normal[0]); 
		normals.push(model.mesh.vertices[i].normal[1]); 
		normals.push(model.mesh.vertices[i].normal[2]); 
	}

	var indices = new Array();
	for(var i=0;i<model.mesh.faces.length;i++){
		indices.push(model.mesh.faces[i].x); 
		indices.push(model.mesh.faces[i].y); 
		indices.push(model.mesh.faces[i].z); 
	}
	
	model.VertexPositionBuffer = gl.createBuffer(); 
    gl.bindBuffer(gl.ARRAY_BUFFER, model.VertexPositionBuffer); 
	gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(positions), gl.STATIC_DRAW); 
	
	model.VertexNormalBuffer = gl.createBuffer(); 
    gl.bindBuffer(gl.ARRAY_BUFFER, model.VertexNormalBuffer); 
	gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(normals), gl.STATIC_DRAW);
	
	model.VertexIndexBuffer = gl.createBuffer(); 
	gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, model.VertexIndexBuffer);
	gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, new Uint16Array(indices), gl.STATIC_DRAW);
}


 function getShader(gl, id) { 
	// source http://jeux.developpez.com/tutoriels/OpenGL/WebGL
    var shaderScript = document.getElementById(id); 
    if (!shaderScript) { 
        return null; 
    } 

    var str = ""; 
    var k = shaderScript.firstChild; 
    while (k) { 
        if (k.nodeType == 3) 
            str += k.textContent; 
        k = k.nextSibling; 
    } 

    var shader; 
    if (shaderScript.type == "x-shader/x-fragment") { 
        shader = gl.createShader(gl.FRAGMENT_SHADER); 
    } else if (shaderScript.type == "x-shader/x-vertex") { 
        shader = gl.createShader(gl.VERTEX_SHADER); 
    } else { 
        return null; 
    } 

    gl.shaderSource(shader, str); 
    gl.compileShader(shader); 

    if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) { 
        alert(gl.getShaderInfoLog(shader)); 
        return null; 
    } 

    return shader; 
}
  

function initFrameBuffer(){

	fbPickingTriangle = gl.createFramebuffer();
    gl.bindFramebuffer(gl.FRAMEBUFFER, fbPickingTriangle);
    fbPickingTriangle.width = canvas.width;
    fbPickingTriangle.height = canvas.height;
	
	texturePickingTriangle = gl.createTexture();
    gl.bindTexture(gl.TEXTURE_2D, texturePickingTriangle);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.NEAREST);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.NEAREST);
	gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, fbPickingTriangle.width, fbPickingTriangle.height, 0, gl.RGBA, gl.UNSIGNED_BYTE, null);
	
	var renderbuffer = gl.createRenderbuffer();
    gl.bindRenderbuffer(gl.RENDERBUFFER, renderbuffer);
    gl.renderbufferStorage(gl.RENDERBUFFER, gl.DEPTH_COMPONENT16, fbPickingTriangle.width, fbPickingTriangle.height);

	gl.framebufferTexture2D(gl.FRAMEBUFFER, gl.COLOR_ATTACHMENT0, gl.TEXTURE_2D, texturePickingTriangle, 0);
    gl.framebufferRenderbuffer(gl.FRAMEBUFFER, gl.DEPTH_ATTACHMENT, gl.RENDERBUFFER, renderbuffer);
	
	gl.bindTexture(gl.TEXTURE_2D, null);
    gl.bindRenderbuffer(gl.RENDERBUFFER, null);
    gl.bindFramebuffer(gl.FRAMEBUFFER, null);
	
}
  

  
// ******************************************
// **            EVENT LISTENERS           **
// ******************************************


// keyboard events
function handleKeyDown(event) {
    currentlyPressedKeys[event.keyCode] = true;
	if(mouseIsInCanvas()){ // prevent to scroll the page.
		if (event.keyCode == 38){ // up arrow
			event.preventDefault();
		}
		if (event.keyCode == 40){ // down arrow
			event.preventDefault();
		}
	}
	
}

function handleKeyUp(event) {
    currentlyPressedKeys[event.keyCode] = false;
	//if(mouseIsInCanvas()){
		if (event.keyCode == 38){ // up arrow
			camera.zoomForward();
		}
		if (event.keyCode == 40){ // down arrow
			camera.zoomBackward();
		}
	//}
}


function handleKeys(){
	if (currentlyPressedKeys[13]){ // KEY_ENTER
		disableEditMode();
	}
}

function computeCursor3DPos(canvasX,canvasY){
	// get the cursor 3D coordinates from 2D screen coordinates

	// http://webglfactory.blogspot.com/2011/05/how-to-convert-world-to-screen.html 
		
	var vpMatrix = mat4.create();
	mat4.multiply(pMatrix,vMatrix,vpMatrix); // compute the view projection matrix
	var vpInv = mat4.create();
	mat4.inverse(vpMatrix,vpInv); // compute the invert view projection matrix

	var x = canvasX *2.0/canvas.width -1;
	var y =  -canvasY * 2.0/canvas.height + 1; 
	var z = camera.getDistance(); // it's the z-depth.
	x = x * z;
	y = y * z;
	var w = (1.0 - vpInv[11] * z) / vpInv[15];

	var pos = vec4.createFrom(x,y,z,w); // screen coordinates
	var finalPos = vec4.create();
	mat4.multiplyVec4(vpInv,pos,finalPos); // 3D coordinates
	
	cursor3DPos = finalPos;
}

function handleMouseDown(event) {
	bClicked = true;
	mouseDown = true;
	lastMouseX = event.clientX;
	lastMouseY = event.clientY;
	mouseButton = event.button;
}

function handleMouseUp(event) {
	mouseForceX = 0;
	mouseForceY = 0;
	mouseDown = false;
	selectedTorus = 0;
	
	var sticker = pony.model.sticker[currentStickerID];
	if(stickerEditMode &&  sticker.triID != 16777215){ // 16777215 = mouse is not on the pony's body
		disableEditMode(); // pose sticker
	}
}

function mouseIsInCanvas(){
	if((mouseCanvasX < 0) || (mouseCanvasX > canvas.width) || (mouseCanvasY < 0) || (mouseCanvasY > canvas.height)){
		return false;
	}
	else{
		return true;
	}
}

function handleMouseMove(event) {

	updateSticker = true;
	
	var rect = canvas.getBoundingClientRect();
    mouseCanvasX = event.clientX - rect.left;
    mouseCanvasY = event.clientY - rect.top;
	if(mouseIsInCanvas()){
		// the cursor is inside the canvas

		// get the cursor 3D coordinates from 2D screen coordinates
		computeCursor3DPos(mouseCanvasX,mouseCanvasY);

	}
	else{
		// the cursor is outside the canvas
		cursor3DPos = 0;
	}
	  
	if (!mouseDown) {
	  mouseForceX = 0;
	  mouseForceY = 0;
	  
	  return;
	}
	

	var newX = event.clientX;
	var newY = event.clientY;

	var deltaX = newX - lastMouseX;
	var deltaY = newY - lastMouseY;

	lastMouseX = newX
	lastMouseY = newY;

	switch (mouseButton) {
		case 0:
			// Left mouse button pressed.
			
			if(!selectedTorus){
				// Rotate pony.
				pony.angle += 0.01 * deltaX;
				pony.angleXZ += 0.01 * deltaY;
				
				// Add a motion force.
				mouseForceY = 52.0*deltaX; // old 12.0
				mouseForceX = 52.0*deltaY; // old 12.0

				// It's nicer to clamp the values, but not necessary.
				mouseForceY = clamp(mouseForceY,-80.0,80.0);
				mouseForceX = clamp(mouseForceX,-80.0,80.0);
				
			}
			else if(selectedTorus){
				// move joints manually
				var inst = 0;
				var jointID = 0;
				var f = 0;
				if(customPoseCurrentJoint<500){
					inst = pony;
					jointID = customPoseCurrentJoint;
					f = customFrame;
				}
				else if(customPoseCurrentJoint<2000){
					inst = tail;
					jointID = customPoseCurrentJoint-1000;
					f = 0;
				}
				else if(customPoseCurrentJoint<3000){
					inst = leftWing;
					jointID = customPoseCurrentJoint-2000;
					f = customFrame;
				}
				else if(customPoseCurrentJoint<4000){
					inst = rightWing;
					jointID = customPoseCurrentJoint-3000;
					f = customFrame;
				}
				
				var joint = inst.model.skeleton.joints[jointID];
				var mat = joint.worldAnimMatrices[f];
				var pos = vec3.createFrom(mat[12],mat[13],mat[14]);
				
				//compute2DPos
				
				
				var mv = mat4.create(); 
				var mvp = mat4.create();
				var pos2d = vec3.create();
				
				mat4.multiply(vMatrix,mMatrix,mv);
				mat4.multiply(pMatrix,mv,mvp);
				mat4.multiplyVec3(mvp,pos,pos2d);
				
				var z = camera.getDistance();
				//pos2d[0] = (pos2d[0] + z) * canvas.width / (2*z);
				pos2d[0] = canvas.width * ( pos2d[0] / z + 1 ) / 2;
				pos2d[1]  = (1 - pos2d[1] /z) * canvas.height / 2;	   
			
				var a = vec2.create();
				a[0] = mouseCanvasRotateJoint[0] - pos2d[0];
				a[1] = mouseCanvasRotateJoint[1] - pos2d[1];
				var b = vec2.create();
				b[0] = mouseCanvasX - pos2d[0];
				b[1] = mouseCanvasY - pos2d[1];
				
				var adotb = vec2.dot(a,b);
				var acrossb = a[0] * b[1] - b[0] * a[1];
				var cosalpha = adotb / (vec2.length(a) * vec2.length(b));
				//var sinalpha = acrossb / (vec2.length(a) * vec2.length(b));
				var alpha = Math.acos(cosalpha) * 180 / Math.PI;
				//var alpha = Math.asin(sinalpha) * 180 / Math.PI;
				if(acrossb > 0) alpha = -alpha;
				//document.title =  parseInt(pos2d[0]) + " " + parseInt(pos2d[1]) + " " + mouseCanvasX + " " + mouseCanvasY;
				//document.title = alpha ;
				if(selectedTorus == 501){
					joint.rotateDegrees[0] = currentJointRotateDegrees[0] + alpha;
				}
				else if(selectedTorus == 502){
					joint.rotateDegrees[1] = currentJointRotateDegrees[1] + alpha;
				}
				else if(selectedTorus == 503){
					joint.rotateDegrees[2] = currentJointRotateDegrees[2] + alpha;
				}
				// compute pose for custom frame
				rotateJoint(joint);
				
				
			}
	
			break;
		case 1:
			// Middle mouse button pressed.
			break;
		case 2:
			// Right mouse button pressed.
			
			// translate pony
			translation_right += deltaX*0.1;
			translation_up -= deltaY*0.1;
			
			translation_right = clamp(translation_right,-25,25);
			translation_up = clamp(translation_up,-25,25);
			
			break;
	}
}
  
function handleMouseWheel(event) {
	//delta returns +120 when wheel is scrolled up, -120 when scrolled down
	var delta=event.detail? event.detail*(-120) : event.wheelDelta 
	if(delta>0){
		camera.zoomForward();
	}
	else{
		camera.zoomBackward();
	}
}

  
  
  
function retrieveTriangleID(mouseX,mouseY,_mvMatrix,_floatArray,inst){
	// called when the mouse is on the canvas and if we are placing a sticker

	// (0,0) is left-top corner (mouse coordinates)
	// (0,0) is left-bottom corner (gl.readPixels)
	var readPixelY = canvas.height - mouseY;
	
	// if model is ready
	
	if(inst.model.getLoadState() == 2){
		var model = inst.model;
		
		gl.bindFramebuffer(gl.FRAMEBUFFER, fbPickingTriangle);
		gl.clearColor(1.0,1.0,1.0,1.0);
		gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
		
		// ---------------------
		// body

		gl.useProgram(programPicking);
		gl.uniformMatrix4fv(programPicking.pMatrixUniform, false, pMatrix); 
		gl.uniformMatrix4fv(programPicking.mvMatrixUniform, false, _mvMatrix);	
		gl.uniformMatrix4fv(programPicking.uAnim,false,_floatArray);

		gl.enableVertexAttribArray(programPicking.vertexPosition);	
		gl.bindBuffer(gl.ARRAY_BUFFER, model.VertexPositionBufferPicking); 
		gl.vertexAttribPointer(programPicking.vertexPosition, 3, gl.FLOAT, false, 0, 0);
		
		gl.enableVertexAttribArray(programPicking.joint);	
		gl.bindBuffer(gl.ARRAY_BUFFER, model.JointBufferPicking);
		gl.vertexAttribPointer(programPicking.joint, 4, gl.FLOAT, false, 0, 0); 
		
		gl.enableVertexAttribArray(programPicking.weight);
		gl.bindBuffer(gl.ARRAY_BUFFER, model.WeightBufferPicking);
		gl.vertexAttribPointer(programPicking.weight, 4, gl.FLOAT, false, 0, 0); 
		
		gl.enableVertexAttribArray(programPicking.aTriangleID);
		gl.bindBuffer(gl.ARRAY_BUFFER, model.aTriangleIDBufferPicking);
		gl.vertexAttribPointer(programPicking.aTriangleID, 3, gl.FLOAT, false, 0, 0); 

		gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, model.VertexIndexBufferPicking);
		   
		gl.drawElements(gl.TRIANGLES, model.mesh.faces.length * 3,  gl.UNSIGNED_SHORT, 0);
		
		
		// ------------------------------------------
		// read pixel color under the cursor
		// which is the triangle index.
		// ------------------------------------------
		var pixelData = new Uint8Array(4);
		gl.readPixels(mouseX, readPixelY, 1, 1, gl.RGBA, gl.UNSIGNED_BYTE, pixelData);

		var index = pixelData[0];
		index = index << 8; 
		index = index | pixelData[1];
		index = index << 8; 
		index = index | pixelData[2];

		gl.bindFramebuffer(gl.FRAMEBUFFER, null);
		
		return index; 
	}
	return 0; 
}

function drawInFrameBuffer(inst){
	var model = inst.model;
	var floatArray2 = new Array();
	for(var i = 0; i < model.skeleton.joints.length; i++){
		var animMat = model.skeleton.joints[i].skinningMatrices[0];
		for(var j=0; j<16; j++){
			floatArray2.push(animMat[j]);
		}
	}
	gl.uniformMatrix4fv(programPickingID.uAnim,false,floatArray2);

	gl.enableVertexAttribArray(programPickingID.vertexPosition);	
	gl.bindBuffer(gl.ARRAY_BUFFER, model.VertexPositionBufferPickingID); 
	gl.vertexAttribPointer(programPickingID.vertexPosition, 3, gl.FLOAT, false, 0, 0);
	
	gl.enableVertexAttribArray(programPickingID.joint);	
	gl.bindBuffer(gl.ARRAY_BUFFER, model.JointBufferPickingID);
	gl.vertexAttribPointer(programPickingID.joint, 4, gl.FLOAT, false, 0, 0); 
	
	gl.enableVertexAttribArray(programPickingID.weight);
	gl.bindBuffer(gl.ARRAY_BUFFER, model.WeightBufferPickingID);
	gl.vertexAttribPointer(programPickingID.weight, 4, gl.FLOAT, false, 0, 0); 

	gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, model.VertexIndexBufferPickingID);
	   
	gl.drawElements(gl.TRIANGLES, model.mesh.faces.length * 3,  gl.UNSIGNED_SHORT, 0);
}

function drawInFrameBuffer2(inst,offset,_iFrame){
	// comment here
	var i=0;
	if(!inst.model) return;
	if(offset >= 1000) i=1; //  do not display the root joint for tail and wings.
	for(i; i<inst.model.skeleton.joints.length; i++){
		var joint = inst.model.skeleton.joints[i];
		jointSphereInst.model.skeleton.rootJoint.animMatrices[0] = mat4.create(joint.worldAnimMatrices[_iFrame]); 
		jointSphereInst.model.skeleton.computeFrame(0);	
		var uID = i + offset;
		var r = ((uID >> 16) & 255) / 255.0;   
		var g = ((uID >> 8) & 255) / 255.0;
		var b = (uID & 255) / 255.0;
		gl.uniform3f(programPickingID.uID,r,g,b);
		drawInFrameBuffer(jointSphereInst);
	}
}

function retrieveID(mouseX,mouseY,_mvMatrix){
	// when click on a joint or torus
	var readPixelY = canvas.height - mouseY;
	var iFrame = pony.getICurrentFrame();
			
	gl.bindFramebuffer(gl.FRAMEBUFFER, fbPickingTriangle);
	gl.clearColor(1.0,1.0,1.0,1.0);
	gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
	gl.useProgram(programPickingID);
	
	gl.uniformMatrix4fv(programPickingID.pMatrixUniform, false, pMatrix); 
	gl.uniformMatrix4fv(programPickingID.mvMatrixUniform, false, _mvMatrix);
	
	var inst = 0;
	var jointID = 0;
	var f = 0;
	
	if(customPoseCurrentJoint<500){
		inst = pony;
		jointID = customPoseCurrentJoint;
		f = iFrame;
	}
	else if(customPoseCurrentJoint<2000){
		inst = tail;
		jointID = customPoseCurrentJoint-1000;
		f = 0;
	}
	else if(customPoseCurrentJoint<3000){
		inst = leftWing;
		jointID = customPoseCurrentJoint-2000;
		f = iFrame;
	}
	else if(customPoseCurrentJoint<4000){
		inst = rightWing;
		jointID = customPoseCurrentJoint-3000;
		f = iFrame;
	}
		
	if((jointSphereModel.getLoadState() == 2) && (bDisplayJointSphere)){
		drawInFrameBuffer2(pony,0,iFrame);
		drawInFrameBuffer2(tail,1000,0);
		drawInFrameBuffer2(leftWing,2000,iFrame);
		drawInFrameBuffer2(rightWing,3000,iFrame);
		
	}
	if(bDisplayTorus){
		if(
		(bigtorusX.model.getLoadState() == 2)
		&& (bigtorusY.model.getLoadState() == 2)
		&& (bigtorusZ.model.getLoadState() == 2)) {
				
	
		
		
		bigtorusX.model.skeleton.rootJoint.animMatrices[0] = mat4.create(inst.model.skeleton.joints[jointID].worldAnimMatrices[f]); 
		bigtorusX.model.skeleton.computeFrame(0);

		bigtorusY.model.skeleton.rootJoint.animMatrices[0] = mat4.create(inst.model.skeleton.joints[jointID].worldAnimMatrices[f]); 
		bigtorusY.model.skeleton.computeFrame(0);

		bigtorusZ.model.skeleton.rootJoint.animMatrices[0] = mat4.create(inst.model.skeleton.joints[jointID].worldAnimMatrices[f]); 
		bigtorusZ.model.skeleton.computeFrame(0);

		var uID = 501;
		var r = ((uID >> 16) & 255) / 255.0;   
		var g = ((uID >> 8) & 255) / 255.0;
		var b = (uID & 255) / 255.0;
		gl.uniform3f(programPickingID.uID,r,g,b);
		drawInFrameBuffer(bigtorusX);
			
		uID = 502;
		r = ((uID >> 16) & 255) / 255.0;   
		g = ((uID >> 8) & 255) / 255.0;
		b = (uID & 255) / 255.0;
		gl.uniform3f(programPickingID.uID,r,g,b);
		drawInFrameBuffer(bigtorusY);
		
		uID = 503;
		r = ((uID >> 16) & 255) / 255.0;   
		g = ((uID >> 8) & 255) / 255.0;
		b = (uID & 255) / 255.0;
		gl.uniform3f(programPickingID.uID,r,g,b);
		drawInFrameBuffer(bigtorusZ);
		
		}
	}
	// ------------------------------------------
	// read pixel color under the cursor
	// which is the object ID
	// ------------------------------------------
	var pixelData = new Uint8Array(4);
	gl.readPixels(mouseX, readPixelY, 1, 1, gl.RGBA, gl.UNSIGNED_BYTE, pixelData);

	var index = pixelData[0];
	index = index << 8; 
	index = index | pixelData[1];
	index = index << 8; 
	index = index | pixelData[2];

	gl.bindFramebuffer(gl.FRAMEBUFFER, null);
	
	selectedTorus = 0;
	if(index < pony.model.skeleton.joints.length){
		// body selected
		changePose(index);
		bDisplayTorus = true;
	}
	else if((index == 501) || (index == 502) || (index == 503)){
		// torus selected, 501, 502, 503
		selectedTorus = index;
		
		//currentJointRotateDegrees = vec3.create(pony.model.skeleton.joints[customPoseCurrentJoint].rotateDegrees); // old, before 1.0.5
		currentJointRotateDegrees = vec3.create(inst.model.skeleton.joints[jointID].rotateDegrees); 

		mouseCanvasRotateJoint[0] = mouseCanvasX;
		mouseCanvasRotateJoint[1] = mouseCanvasY;
	}
	else if(index < 4000){
		// tail or wing selected
		changePose(index);
		bDisplayTorus = true;
	}
	else{
		// if index == 16777215, nothing is selected
	}

		
}

function initStickerShader1(model,vertIDs,triIDs,triID,sticker){
	
	sticker.faceNumber = triIDs.length;
	
	var positions = new Array();
	for(var i=0;i<vertIDs.length;i++){
		var id = vertIDs[i];
		var vertex = model.mesh.vertices[id];
		positions.push(vertex.position[0]); 
		positions.push(vertex.position[1]); 
		positions.push(vertex.position[2]); 
		vertex.tmpID = i;
	}
	
	var normals = new Array();
	for(var i=0;i<vertIDs.length;i++){
		var id = vertIDs[i];
		normals.push(model.mesh.vertices[id].normal[0]); 
		normals.push(model.mesh.vertices[id].normal[1]); 
		normals.push(model.mesh.vertices[id].normal[2]); 
	}
	
	
	var r;
	sticker.reverse ? r=-1 : r=1;
	var uscale = sticker.uscale;
	var vscale = sticker.vscale;
	var a = sticker.angle;
	var ca = Math.cos(a);
	var sa = Math.sin(a);
	var ut = sticker.ut;
	var vt = sticker.vt;
	
	var uvcoords = new Array();
	for(var i=0;i<sticker.uv.length;i++){
		// scale
		var x = sticker.uv[i][0] * uscale * r;
		var y = sticker.uv[i][1] * vscale * -1;
		// rotate
		var u = x * ca - y * sa;
		var v = x * sa + y * ca;
		// translate
		u += ut;
		v += vt;
		uvcoords.push(u);
		uvcoords.push(v);
		
	}

	var indices = new Array();
	for(var i=0;i<triIDs.length;i++){
		var tri = model.mesh.faces[triIDs[i]];
			var v1ID = model.mesh.vertices[tri.x].tmpID;
			var v2ID = model.mesh.vertices[tri.y].tmpID;
			var v3ID = model.mesh.vertices[tri.z].tmpID;
			indices.push(v1ID); 
			indices.push(v2ID); 
			indices.push(v3ID); 
	}

	// A vertex can be attached to 4 joints or less.
	var joints = new Array();
	for(var j=0;j<vertIDs.length;j++){
		var i = vertIDs[j];
		joints.push(model.mesh.vertices[i].jointsID[0]);
		joints.push(model.mesh.vertices[i].jointsID[1]);
		joints.push(model.mesh.vertices[i].jointsID[2]);
		joints.push(model.mesh.vertices[i].jointsID[3]);
	}

	var weights = new Array();
	for(var j=0;j<vertIDs.length;j++){
		var i = vertIDs[j];
		weights.push(model.mesh.vertices[i].weights[0]);
		weights.push(model.mesh.vertices[i].weights[1]);
		weights.push(model.mesh.vertices[i].weights[2]);
		weights.push(model.mesh.vertices[i].weights[3]);
	}


	
	// ---------------------
	// to shader
	// ---------------------
	
	if(sticker.aVertexPositionBufferSticker) gl.deleteBuffer(sticker.aVertexPositionBufferSticker);
	sticker.aVertexPositionBufferSticker = gl.createBuffer(); 
    gl.bindBuffer(gl.ARRAY_BUFFER, sticker.aVertexPositionBufferSticker); 
	gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(positions), gl.DYNAMIC_DRAW); 
	
	if(sticker.aVertexNormalBufferSticker) gl.deleteBuffer(sticker.aVertexNormalBufferSticker);
	sticker.aVertexNormalBufferSticker = gl.createBuffer(); 
    gl.bindBuffer(gl.ARRAY_BUFFER, sticker.aVertexNormalBufferSticker); 
	gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(normals), gl.DYNAMIC_DRAW);
	
	if(sticker.aUVBufferSticker) gl.deleteBuffer(sticker.aUVBufferSticker);
	sticker.aUVBufferSticker = gl.createBuffer(); 
    gl.bindBuffer(gl.ARRAY_BUFFER, sticker.aUVBufferSticker); 
	gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(uvcoords), gl.DYNAMIC_DRAW);
	
	if(sticker.aWeightBufferSticker) gl.deleteBuffer(sticker.aWeightBufferSticker);
	sticker.aWeightBufferSticker = gl.createBuffer(); 
    gl.bindBuffer(gl.ARRAY_BUFFER, sticker.aWeightBufferSticker); 
	gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(weights), gl.DYNAMIC_DRAW);
	
	if(sticker.aVertexIndexBufferSticker) gl.deleteBuffer(sticker.aVertexIndexBufferSticker);
	sticker.aVertexIndexBufferSticker = gl.createBuffer(); 
	gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, sticker.aVertexIndexBufferSticker);
	gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, new Uint16Array(indices), gl.DYNAMIC_DRAW);
	
	if(sticker.aJointBufferSticker) gl.deleteBuffer(sticker.aJointBufferSticker);
	sticker.aJointBufferSticker = gl.createBuffer(); 
    gl.bindBuffer(gl.ARRAY_BUFFER, sticker.aJointBufferSticker); 
	gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(joints), gl.DYNAMIC_DRAW);
	
}
  
// ******************************************
// **            DRAW FUNCTIONS            **
// ******************************************

function drawScene() { 
	
	
	 
	var iFrame = pony.getICurrentFrame();
	
	mat4.perspective(45, gl.viewportWidth / gl.viewportHeight, 0.1, 1000.0, pMatrix); 
	vMatrix = camera.getViewMatrix();
	mMatrix = pony.getModelMatrix();
	var mvMatrix = mat4.create(); // modelView matrix
	mat4.multiply(vMatrix,mMatrix,mvMatrix);
	mat4.toInverseMat3(mvMatrix,normalMatrix);
	mat3.transpose(normalMatrix);

	var floatArray = new Array();
	for(var i = 0; i < pony.model.skeleton.joints.length; i++){
		var mat = pony.model.skeleton.joints[i].skinningMatrices[pony.getICurrentFrame()];
		for(var j=0; j<16; j++){
			floatArray.push(mat[j]);
		}
	}
	

	
	// ---------------------
	// draw in the framebuffer (for picking)
	
	if(mouseIsInCanvas()){
		if(stickerEditMode && updateSticker){
			// Update only when the mouse has moved, for performance issue.
			// This supposes the pony doesn't move.
			updateSticker = false; 
			var sticker = pony.model.sticker[currentStickerID];
			
			// find the triangle under the cursor
			sticker.triID = retrieveTriangleID(mouseCanvasX,mouseCanvasY,mvMatrix,floatArray,pony);
			if(sticker.triID == 16777215){ // 0xFFFFFF, which means cursor isn't on the pony
				sticker.display = false;
			}
			else{
				// find the triangle neighbors
				sticker.triIDs = pony.model.mesh.findTriangleNeighbors(sticker.triID,4);
				
				// find the vertices
				sticker.vertIDs = pony.model.mesh.verticesFromTriangles(sticker.triIDs);
		
				// project the uv
				sticker.uv = pony.model.mesh.projectUVcoords(sticker.vertIDs,sticker.triID);
				
				initStickerShader1(pony.model,sticker.vertIDs,sticker.triIDs,sticker.triID,sticker);
				
				sticker.display = true;
			}
		}
		
		if(bClicked){
			bClicked = false;
			retrieveID(mouseCanvasX,mouseCanvasY,mvMatrix);
		}
		
	}
		
	
	
	
	
	
	
	// ---------------------
	// draw in the canvas
	
    gl.viewport(0, 0, gl.viewportWidth, gl.viewportHeight); 
	gl.clearColor(bgColorR*bgColorA,bgColorG*bgColorA,bgColorB*bgColorA,bgColorA); 
	gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);			
	
	// ---------------------
	// background
	
	if(bgNum){
		gl.disable(gl.DEPTH_TEST);
		mat4.ortho(-1, 1, -1, 1, 0.1, 100.0, pMatrix);
		var bgvMatrix = mat4.create();
		var pos = vec3.createFrom(0.0,0.0,-70.0);
		var view = vec3.createFrom(0.0,0.0,0.0);
		var up = vec3.createFrom(0.0,1.0,0.0);
		mat4.lookAt(pos, view, up, bgvMatrix);
		
		gl.useProgram(programBG);
		gl.uniformMatrix4fv(programBG.pMatrixUniform, false, pMatrix); 
		gl.uniformMatrix4fv(programBG.mvMatrixUniform, false, bgvMatrix);
		
		gl.uniform1i(programBG.uSampler, 0);
		gl.activeTexture(gl.TEXTURE0);
		gl.bindTexture(gl.TEXTURE_2D, bgModel.texture[0]);
		
		gl.enableVertexAttribArray(programBG.vertexPosition);	
		gl.bindBuffer(gl.ARRAY_BUFFER, bgVertexPositionBuffer); 
		gl.vertexAttribPointer(programBG.vertexPosition, 3, gl.FLOAT, false, 0, 0);

		gl.enableVertexAttribArray(programBG.vertexTexCoord);	
		gl.bindBuffer(gl.ARRAY_BUFFER, bgUVBuffer);
		gl.vertexAttribPointer(programBG.vertexTexCoord, 2, gl.FLOAT, false, 0, 0);
		
		gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, bgVertexIndexBuffer);  
		gl.drawElements(gl.TRIANGLES, 6,  gl.UNSIGNED_SHORT, 0);
	}
	

	
	
	
	
	// ---------------------
	// body
	
	mat4.perspective(45, gl.viewportWidth / gl.viewportHeight, 0.1, 1000.0, pMatrix); 
	gl.blendFunc(gl.SRC_ALPHA, gl.ONE_MINUS_SRC_ALPHA);
	gl.enable(gl.BLEND);
	gl.enable(gl.DEPTH_TEST);
	
	var program = programCharacter2;

	gl.useProgram(program);
	gl.uniformMatrix4fv(program.pMatrixUniform, false, pMatrix); 
    gl.uniformMatrix4fv(program.mvMatrixUniform, false, mvMatrix);
	gl.uniformMatrix3fv(program.normalMatrixUniform, false, normalMatrix);		
	gl.uniformMatrix4fv(program.uAnim,false,floatArray);
	gl.uniform4f(program.uFirstColor,pony.firstColor[0],pony.firstColor[1],pony.firstColor[2],pony.firstColor[3]);
	gl.uniform4f(program.uSecondColor,pony.secondColor[0],pony.secondColor[1],pony.secondColor[2],pony.secondColor[3]);
	gl.uniform4f(program.uThirdColor,pony.thirdColor[0],pony.thirdColor[1],pony.thirdColor[2],pony.thirdColor[3]);
	gl.uniform1i(program.uShadingType,shadingType);
	gl.uniform4f(program.uPosLight0,lightArray[0].pos[0],lightArray[0].pos[1],lightArray[0].pos[2],lightArray[0].pos[3]);
	gl.uniform4f(program.uAmbientLight0,lightArray[0].ambiant[0],lightArray[0].ambiant[1],lightArray[0].ambiant[2],lightArray[0].ambiant[3]);
	gl.uniform4f(program.uDiffuseLight0,lightArray[0].diffuse[0],lightArray[0].diffuse[1],lightArray[0].diffuse[2],lightArray[0].diffuse[3]);
	gl.uniform4f(program.uSpecularLight0,lightArray[0].specular[0],lightArray[0].specular[1],lightArray[0].specular[2],lightArray[0].specular[3]);
	gl.uniform1f(program.uShininess,pony.shininess);
	gl.uniform1f(program.uTex1Alpha,pony.tex1alpha);
	gl.uniform1f(program.uTex1u,pony.tex1u);
	gl.uniform1f(program.uTex1v,pony.tex1v);
	gl.uniform3f(program.uHSV,pony.uHSV[0],pony.uHSV[1],pony.uHSV[2]);
	
	if(pony.model.getLoadState() == 2){
		drawPony(pony.model,program);
		
	}
	
	// ---------------------
	// tongue, teeth, eyelashes
	
	if(tongue.model.getLoadState() == 2){
		gl.uniform4f(program.uFirstColor,tongue.firstColor[0],tongue.firstColor[1],tongue.firstColor[2],tongue.firstColor[3]);
		drawPony(tongue.model,program);
	}

	if(teeth.model.getLoadState() == 2){
		gl.uniform4f(program.uFirstColor,teeth.firstColor[0],teeth.firstColor[1],teeth.firstColor[2],teeth.firstColor[3]);
		drawPony(teeth.model,program);
	}
	
	if(eyelashes.model){
		if(eyelashes.model.getLoadState() == 2){
			gl.uniform4f(program.uFirstColor,eyelashes.firstColor[0],eyelashes.firstColor[1],eyelashes.firstColor[2],eyelashes.firstColor[3]);
			drawPony(eyelashes.model,program);
		}
	}
	
	// ---------------------
	// stickers
	
	gl.useProgram(programSticker);
	gl.uniformMatrix4fv(programSticker.pMatrixUniform, false, pMatrix); 
    gl.uniformMatrix4fv(programSticker.mvMatrixUniform, false, mvMatrix);
	gl.uniformMatrix3fv(programSticker.normalMatrixUniform, false, normalMatrix);
	gl.uniformMatrix4fv(programSticker.uAnim,false,floatArray);	
	gl.uniform1i(programSticker.uShadingType,shadingType);
	gl.uniform4f(programSticker.uPosLight0,lightArray[0].pos[0],lightArray[0].pos[1],lightArray[0].pos[2],lightArray[0].pos[3]);
	gl.uniform4f(programSticker.uAmbientLight0,lightArray[0].ambiant[0],lightArray[0].ambiant[1],lightArray[0].ambiant[2],lightArray[0].ambiant[3]);
	gl.uniform4f(programSticker.uDiffuseLight0,lightArray[0].diffuse[0],lightArray[0].diffuse[1],lightArray[0].diffuse[2],lightArray[0].diffuse[3]);
	gl.uniform4f(programSticker.uSpecularLight0,lightArray[0].specular[0],lightArray[0].specular[1],lightArray[0].specular[2],lightArray[0].specular[3]);
	gl.uniform1f(programSticker.uShininess,pony.shininess);
	
	if(pony.model.getLoadState() == 2){
		if(customCutieMark){
			// draw custom cutie mark
			drawSticker(pony.model.lCutieMark,programSticker);
			drawSticker(pony.model.rCutieMark,programSticker);
		}
	
		for(var i=0; i<stickerNumber; i++){
			var sticker = pony.model.sticker[i];
			if(sticker.display){
				drawSticker(sticker,programSticker);
			}
		}
	}
	gl.disable(gl.BLEND);
   
	// ---------------------
	// hair, tail, horn, and wings
	
	gl.useProgram(programCharacter2);
	gl.uniformMatrix4fv(programCharacter2.pMatrixUniform, false, pMatrix); 
    gl.uniformMatrix4fv(programCharacter2.mvMatrixUniform, false, mvMatrix);
	gl.uniformMatrix3fv(programCharacter2.normalMatrixUniform, false, normalMatrix);		
	gl.uniform1i(programCharacter2.uShadingType,shadingType);
	gl.uniform4f(programCharacter2.uPosLight0,lightArray[0].pos[0],lightArray[0].pos[1],lightArray[0].pos[2],lightArray[0].pos[3]);
	gl.uniform4f(programCharacter2.uAmbientLight0,lightArray[0].ambiant[0],lightArray[0].ambiant[1],lightArray[0].ambiant[2],lightArray[0].ambiant[3]);
	gl.uniform4f(programCharacter2.uDiffuseLight0,lightArray[0].diffuse[0],lightArray[0].diffuse[1],lightArray[0].diffuse[2],lightArray[0].diffuse[3]);
	gl.uniform4f(programCharacter2.uSpecularLight0,lightArray[0].specular[0],lightArray[0].specular[1],lightArray[0].specular[2],lightArray[0].specular[3]);
	gl.uniform1f(programCharacter2.uShininess,pony.shininess);
	
	drawHairTail(hairFront);
	drawHairTail(hairBack);
	drawHairTail(hairExtra);
	drawHairTail(tail);
	drawHairTail(collar1);
	drawHairTail(headgear1);
	drawHairTail(headbandA[0]); // headband
	drawHairTail(horn);
	drawHairTail(headbandA[1]); // glasses
	for(var i=0; i<accessories.length; i++){
		drawHairTail(accessories[i]);
	}
	
	//gl.blendFunc(gl.SRC_ALPHA, gl.ONE_MINUS_SRC_ALPHA);
	gl.enable(gl.BLEND);
	//gl.disable(gl.DEPTH_TEST);
	
	drawWing(leftWing); 
	drawWing(rightWing);
	
	gl.disable(gl.BLEND);
	//gl.enable(gl.DEPTH_TEST);
	
	// ---------------------
	// eyes
	
	gl.useProgram(programEyes);
	gl.uniformMatrix4fv(programEyes.pMatrixUniform, false, pMatrix); 
    gl.uniformMatrix4fv(programEyes.mvMatrixUniform, false, mvMatrix);
	gl.uniformMatrix3fv(programEyes.normalMatrixUniform, false, normalMatrix);		
	gl.uniform1i(programEyes.uShadingType,shadingType);
	gl.uniform4f(programEyes.uPosLight0,lightArray[0].pos[0],lightArray[0].pos[1],lightArray[0].pos[2],lightArray[0].pos[3]);
	gl.uniform4f(programEyes.uAmbientLight0,lightArray[0].ambiant[0],lightArray[0].ambiant[1],lightArray[0].ambiant[2],lightArray[0].ambiant[3]);
	gl.uniform4f(programEyes.uDiffuseLight0,lightArray[0].diffuse[0],lightArray[0].diffuse[1],lightArray[0].diffuse[2],lightArray[0].diffuse[3]);
	gl.uniform4f(programEyes.uSpecularLight0,lightArray[0].specular[0],lightArray[0].specular[1],lightArray[0].specular[2],lightArray[0].specular[3]);
	gl.uniform1f(programEyes.uShininess,pony.shininess);
	// use body transformations for eyes 
	gl.uniformMatrix4fv(programEyes.uAnim,false,floatArray);
	drawEye(leftEye);
	drawEye(rightEye);
	
	
	
	// ---------------------
	// joints and 
	// torus (to change joint orientation)
	
	
	gl.clear(gl.DEPTH_BUFFER_BIT);
	gl.useProgram(programCharacter2);
		
	if(bDisplayJointSphere){
		if(jointSphereModel.getLoadState() == 2){
			for(var i=0; i<pony.model.skeleton.joints.length; i++){
				jointSphereInst.model.skeleton.rootJoint.animMatrices[0] = mat4.create(pony.model.skeleton.joints[i].worldAnimMatrices[iFrame]); 
				jointSphereInst.model.skeleton.computeFrame(0);
				drawHairTail(jointSphereInst);
			}
			if(tail.model){
				for(var i=0; i<tail.model.skeleton.joints.length; i++){
					jointSphereInst.model.skeleton.rootJoint.animMatrices[0] = mat4.create(tail.model.skeleton.joints[i].worldAnimMatrices[0]); 
					jointSphereInst.model.skeleton.computeFrame(0);
					drawHairTail(jointSphereInst);
				}
			}
			if(leftWing.model){
				for(var i=0; i<leftWing.model.skeleton.joints.length; i++){
					jointSphereInst.model.skeleton.rootJoint.animMatrices[0] = mat4.create(leftWing.model.skeleton.joints[i].worldAnimMatrices[iFrame]); 
					jointSphereInst.model.skeleton.computeFrame(0);
					drawHairTail(jointSphereInst);
				}
			}
			if(rightWing.model){
				for(var i=0; i<rightWing.model.skeleton.joints.length; i++){
					jointSphereInst.model.skeleton.rootJoint.animMatrices[0] = mat4.create(rightWing.model.skeleton.joints[i].worldAnimMatrices[iFrame]); 
					jointSphereInst.model.skeleton.computeFrame(0);
					drawHairTail(jointSphereInst);
				}
			}
		}
		
	}
	
	if(bDisplayTorus){
		if((torusX.model.getLoadState() == 2) 
		&& (torusY.model.getLoadState() == 2) 
		&& (torusZ.model.getLoadState() == 2))
		{
		
		var inst = 0;
		var jointID = 0;
		var f = 0;
		
		if(customPoseCurrentJoint<500){
			inst = pony;
			jointID = customPoseCurrentJoint;
			f = iFrame;
		}
		else if(customPoseCurrentJoint<2000){
			inst = tail;
			jointID = customPoseCurrentJoint-1000;
			f = 0;
		}
		else if(customPoseCurrentJoint<3000){
			inst = leftWing;
			jointID = customPoseCurrentJoint-2000;
			f = iFrame;
		}
		else if(customPoseCurrentJoint<4000){
			inst = rightWing;
			jointID = customPoseCurrentJoint-3000;
			f = iFrame;
		}
		
		if(inst){
			torusX.model.skeleton.rootJoint.animMatrices[0] = mat4.create(inst.model.skeleton.joints[jointID].worldAnimMatrices[f]); 
			torusX.model.skeleton.computeFrame(0);

			torusY.model.skeleton.rootJoint.animMatrices[0] = mat4.create(inst.model.skeleton.joints[jointID].worldAnimMatrices[f]); 
			torusY.model.skeleton.computeFrame(0);

			torusZ.model.skeleton.rootJoint.animMatrices[0] = mat4.create(inst.model.skeleton.joints[jointID].worldAnimMatrices[f]); 
			torusZ.model.skeleton.computeFrame(0);
		}
		
		torusX.firstColor = [1.0,0.3,0.3,1.0];
		torusY.firstColor = [0.3,1.0,0.3,1.0];
		torusZ.firstColor = [0.3,0.3,1.0,1.0];
		if(selectedTorus == 501)
			torusX.firstColor = [0.95,0.95,0.2,1.0];
		else if(selectedTorus == 502)
			torusY.firstColor = [0.95,0.95,0.2,1.0];
		else if(selectedTorus == 503)
			torusZ.firstColor = [0.95,0.95,0.2,1.0];
		
		gl.disable(gl.DEPTH_TEST);
		drawHairTail(torusX);
		drawHairTail(torusY);
		drawHairTail(torusZ);
		gl.enable(gl.DEPTH_TEST);

		}
	}
	

	
}

drawSticker = function(sticker,program){
	
	gl.uniform1i(program.uSampler, 0);

	gl.activeTexture(gl.TEXTURE0);
	gl.bindTexture(gl.TEXTURE_2D, sticker.texture);
	
	gl.enableVertexAttribArray(program.vertexPosition);	
	gl.bindBuffer(gl.ARRAY_BUFFER, sticker.aVertexPositionBufferSticker); 
	gl.vertexAttribPointer(program.vertexPosition, 3, gl.FLOAT, false, 0, 0);
	
	gl.enableVertexAttribArray(program.vertexNormal);	
	gl.bindBuffer(gl.ARRAY_BUFFER, sticker.aVertexNormalBufferSticker); 
	gl.vertexAttribPointer(program.vertexNormal, 3, gl.FLOAT, false, 0, 0);
	
	gl.enableVertexAttribArray(program.vertexTexCoord);	
	gl.bindBuffer(gl.ARRAY_BUFFER, sticker.aUVBufferSticker); 
	gl.vertexAttribPointer(program.vertexTexCoord, 2, gl.FLOAT, false, 0, 0);
	
	gl.enableVertexAttribArray(program.joint);	
	gl.bindBuffer(gl.ARRAY_BUFFER, sticker.aJointBufferSticker);
	gl.vertexAttribPointer(program.joint, 4, gl.FLOAT, false, 0, 0); 
	
	gl.enableVertexAttribArray(program.weight);
	gl.bindBuffer(gl.ARRAY_BUFFER, sticker.aWeightBufferSticker);
	gl.vertexAttribPointer(program.weight, 4, gl.FLOAT, false, 0, 0); 
	
	gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, sticker.aVertexIndexBufferSticker);
	 	   
	gl.drawElements(gl.TRIANGLES, sticker.faceNumber* 3,  gl.UNSIGNED_SHORT, 0);

}

drawPony = function(model,program){
	
	gl.uniform1i(program.uSampler, 0);
	gl.uniform1i(program.uSampler2, 1);
	
	gl.activeTexture(gl.TEXTURE0);
	gl.bindTexture(gl.TEXTURE_2D, model.texture[0]);
	
	gl.activeTexture(gl.TEXTURE1);
	gl.bindTexture(gl.TEXTURE_2D, model.texture[1]);
	
	gl.enableVertexAttribArray(program.vertexPosition);	
	gl.bindBuffer(gl.ARRAY_BUFFER, model.VertexPositionBuffer); 
	gl.vertexAttribPointer(program.vertexPosition, 3, gl.FLOAT, false, 0, 0);
	
	gl.enableVertexAttribArray(program.vertexNormal);	
	gl.bindBuffer(gl.ARRAY_BUFFER, model.VertexNormalBuffer); 
	gl.vertexAttribPointer(program.vertexNormal, 3, gl.FLOAT, false, 0, 0);
	
	gl.enableVertexAttribArray(program.vertexTexCoord);	
	gl.bindBuffer(gl.ARRAY_BUFFER, model.UVBuffer); 
	gl.vertexAttribPointer(program.vertexTexCoord, 2, gl.FLOAT, false, 0, 0);
	
	gl.enableVertexAttribArray(program.joint);	
	gl.bindBuffer(gl.ARRAY_BUFFER, model.JointBuffer);
	gl.vertexAttribPointer(program.joint, 4, gl.FLOAT, false, 0, 0); 
	
	gl.enableVertexAttribArray(program.weight);
	gl.bindBuffer(gl.ARRAY_BUFFER, model.WeightBuffer);
	gl.vertexAttribPointer(program.weight, 4, gl.FLOAT, false, 0, 0); 
	
	gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, model.VertexIndexBuffer);
	 	   
	gl.drawElements(gl.TRIANGLES, model.mesh.faces.length * 3,  gl.UNSIGNED_SHORT, 0);
}

drawHairTail = function(inst){
	if(inst.model){
	    if(inst.model.isFullyLoaded()){
			var floatArray2 = new Array();
			for(var i = 0; i < inst.model.skeleton.joints.length; i++){
				var animMat = inst.model.skeleton.joints[i].skinningMatrices[0];
				for(var j=0; j<16; j++){
					floatArray2.push(animMat[j]);
				}
			}
			gl.uniformMatrix4fv(programCharacter2.uAnim,false,floatArray2);
			gl.uniform4f(programCharacter2.uFirstColor,inst.firstColor[0],inst.firstColor[1],inst.firstColor[2],inst.firstColor[3]);
			gl.uniform4f(programCharacter2.uSecondColor,inst.secondColor[0],inst.secondColor[1],inst.secondColor[2],inst.secondColor[3]);
			gl.uniform4f(programCharacter2.uThirdColor,inst.thirdColor[0],inst.thirdColor[1],inst.thirdColor[2],inst.thirdColor[3]);
			gl.uniform1f(programCharacter2.uTex1Alpha,inst.tex1alpha);
			gl.uniform1f(programCharacter2.uTex1u,inst.tex1u);
			gl.uniform1f(programCharacter2.uTex1v,inst.tex1v);
			gl.uniform3f(programCharacter2.uHSV,inst.uHSV[0],inst.uHSV[1],inst.uHSV[2]);
			
			drawPony(inst.model,programCharacter2);
		}
	}
}


drawEye = function(inst){
	var model = inst.model;
	var program = programEyes;
	if(model){
		if(model.isFullyLoaded()){
			gl.uniform3f(program.uHSV,inst.hsv[0],inst.hsv[1],inst.hsv[2]);
			gl.uniform3f(program.uWhitecolor,inst.firstColor[0],inst.firstColor[1],inst.firstColor[2]);
			
			if(cursor3DPos && bMoveIrisesWithMouse){ // of cursor on canvas && eyes follow mouse
				gl.uniform2f(programEyes.uUVtranslation,inst.uvTranslation[0],inst.uvTranslation[1]);
			}
			else{
				gl.uniform2f(programEyes.uUVtranslation,inst.uvT[0],inst.uvT[1]);
			}
			gl.uniform1f(programEyes.uUVscale,inst.uvScale);
			
			gl.uniform1i(program.uSampler, 0);
			
			gl.activeTexture(gl.TEXTURE0);
			gl.bindTexture(gl.TEXTURE_2D, model.texture[0]);
			
			gl.enableVertexAttribArray(program.vertexPosition);	
			gl.bindBuffer(gl.ARRAY_BUFFER, model.VertexPositionBuffer); 
			gl.vertexAttribPointer(program.vertexPosition, 3, gl.FLOAT, false, 0, 0);
			
			gl.enableVertexAttribArray(program.vertexNormal);	
			gl.bindBuffer(gl.ARRAY_BUFFER, model.VertexNormalBuffer); 
			gl.vertexAttribPointer(program.vertexNormal, 3, gl.FLOAT, false, 0, 0);
			
			gl.enableVertexAttribArray(program.vertexTexCoord);	
			gl.bindBuffer(gl.ARRAY_BUFFER, model.UVBuffer); 
			gl.vertexAttribPointer(program.vertexTexCoord, 2, gl.FLOAT, false, 0, 0);
			
			gl.enableVertexAttribArray(program.joint);	
			gl.bindBuffer(gl.ARRAY_BUFFER, model.JointBuffer);
			gl.vertexAttribPointer(program.joint, 4, gl.FLOAT, false, 0, 0); 
			
			gl.enableVertexAttribArray(program.weight);
			gl.bindBuffer(gl.ARRAY_BUFFER, model.WeightBuffer);
			gl.vertexAttribPointer(program.weight, 4, gl.FLOAT, false, 0, 0); 
			
			gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, model.VertexIndexBuffer);
				   
			gl.drawElements(gl.TRIANGLES, model.mesh.faces.length * 3,  gl.UNSIGNED_SHORT, 0);
			
		}
	}
}

drawWing = function(inst){
	if(inst.model){
	    if(inst.model.isFullyLoaded()){
			var floatArray2 = new Array();
			var iFrame = pony.getICurrentFrame();
			// make sure we are not out of range
			if(iFrame >= inst.model.skeleton.joints[0].skinningMatrices.length){
				iFrame = 0;
			}
			for(var i = 0; i < inst.model.skeleton.joints.length; i++){
				var animMat = inst.model.skeleton.joints[i].skinningMatrices[iFrame];
				for(var j=0; j<16; j++){
					floatArray2.push(animMat[j]);
				}
			}
			gl.uniformMatrix4fv(programCharacter2.uAnim,false,floatArray2);
			gl.uniform4f(programCharacter2.uFirstColor,inst.firstColor[0],inst.firstColor[1],inst.firstColor[2],inst.firstColor[3]);
			gl.uniform4f(programCharacter2.uSecondColor,inst.secondColor[0],inst.secondColor[1],inst.secondColor[2],inst.secondColor[3]);
			gl.uniform4f(programCharacter2.uThirdColor,inst.thirdColor[0],inst.thirdColor[1],inst.thirdColor[2],inst.thirdColor[3]);
			drawPony(inst.model,programCharacter2);
		}
	}
}

drawLight = function(model,program){
 
	gl.enableVertexAttribArray(program.vertexPosition);	
	gl.bindBuffer(gl.ARRAY_BUFFER, model.VertexPositionBuffer); 
	gl.vertexAttribPointer(program.vertexPosition, 3, gl.FLOAT, false, 0, 0);
	
	gl.enableVertexAttribArray(program.vertexNormal);	
	gl.bindBuffer(gl.ARRAY_BUFFER, model.VertexNormalBuffer); 
	gl.vertexAttribPointer(program.vertexNormal, 3, gl.FLOAT, false, 0, 0);
	
	gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, model.VertexIndexBuffer);
	 	   
	gl.drawElements(gl.TRIANGLES, model.mesh.faces.length * 3,  gl.UNSIGNED_SHORT, 0);
}





// ******************************************
// **         ANIMATION FUNCTIONS          **
// ******************************************

var accumulator = 0.0;
var stepTime = 1.0/60.0; // physics stepTime in seconds
var lastTime = 0;
var totalTime = 0; // time elapsed since the beginning in milliseconds

function tick() {
    //requestAnimFrame(tick);
	window.requestAnimFrame(tick, canvas);
	handleKeys();
	
	var timeNow = new Date().getTime();
	totalTime = timeNow - beginTime;
	if (lastTime != 0) {
		var dt = (timeNow - lastTime)*0.001;
		if ( dt > 0.25 ) dt = 0.25;  // max frame time to avoid spiral of death 
		accumulator += dt;
		while ( accumulator >= stepTime )
		{
			doPhysics( stepTime );
			accumulator -= stepTime;	
		}
		
		// linear interpolation in order to smooth the renderer
		var alpha = accumulator / stepTime;

		// animate body skeleton
		animate(dt); // calculate current frame
		var iFrame = pony.getICurrentFrame();
		
		
		
		// extra : move special textures

		var dx = dt * 0.2;
		
		
			
		if(tex1MoveMode == 1){
			dx *= 0.4;
			hairFront.uHSV[0] += dx;
			hairBack.uHSV[0] += dx;
			tail.uHSV[0] += dx;
			horn.uHSV[0] += dx;
			leftWing.uHSV[0] += dx;
			rightWing.uHSV[0] += dx;
			
		}
		else if(tex1MoveMode == 2){
			hairFront.tex1u += dx;
			hairBack.tex1u += dx;
			tail.tex1u += dx;
			horn.tex1u += dx;
			leftWing.tex1u += dx;
			rightWing.tex1u += dx;
		}
		
		if(tail.model == tailModelArray[21]){ // rainbow dash tail (special)
			tail.tex1u = 0;
			tail.tex1v = 0;
			tail.uHSV[0] = 0;
		}
		
		if(pony.model.getLoadState() == 2){
			// update hair, tail, and wings skeleton
			if(hairFront.model){
				if(hairFront.model.getLoadState() == 2){ // check if the model is completly loaded
					animateJiggleBones(hairFront.model,alpha);
					hairFront.model.skeleton.rootJoint.animMatrices[0] = mat4.create(pony.model.skeleton.joints[headID].worldAnimMatrices[iFrame]); 
					hairFront.model.skeleton.computeFrame(0);
				}
			}
			if(hairBack.model){
				if(hairBack.model.getLoadState() == 2){
					animateJiggleBones(hairBack.model,alpha);
					hairBack.model.skeleton.rootJoint.animMatrices[0] = mat4.create(pony.model.skeleton.joints[headID].worldAnimMatrices[iFrame]); 
					hairBack.model.skeleton.computeFrame(0);
				}
			}
			if(hairExtra.model){
				if(hairExtra.model.getLoadState() == 2){
					animateJiggleBones(hairExtra.model,alpha);
					hairExtra.model.skeleton.rootJoint.animMatrices[0] = mat4.create(pony.model.skeleton.joints[headID].worldAnimMatrices[iFrame]); 
					hairExtra.model.skeleton.computeFrame(0);
				}
			}
			if(tail.model){
				if(tail.model.getLoadState() == 2){
					animateJiggleBones(tail.model,alpha);
					var rootJoint = tail.model.skeleton.rootJoint;
					rootJoint.animMatrices[0] = mat4.create(pony.model.skeleton.joints[tail1ID].worldAnimMatrices[iFrame]); 
					
					// scale tail
					var x = tail.height;
					var s = vec3.createFrom(x,x,x);
					mat4.scale(rootJoint.animMatrices[0],s,rootJoint.animMatrices[0]);
										
					if(iFrame == customFrame){
						var j = tail.model.skeleton.joints;
						for( var k=0; k<j.length ; k++){
							if(j[k] == rootJoint) continue;// TEST_TMP
							j[k].animMatrices[0] = mat4.create(j[k].customAnimMatrices[0]);
						}
					}
					tail.model.skeleton.computeFrame(0);
					
				}
			}
			if(leftWing.model){
				if(leftWing.model.getLoadState() == 2){
					// make sure we are not out of range
					var wingFrame = iFrame;
					if(wingFrame >= leftWing.model.skeleton.joints[0].skinningMatrices.length){
						wingFrame = 0;
					}
					var rootJoint = leftWing.model.skeleton.rootJoint;
					rootJoint.animMatrices[wingFrame] = mat4.create(pony.model.skeleton.joints[chest1ID].worldAnimMatrices[iFrame]); 
	
					if(rootJoint.children.length){
					// scale the wing (reference joint wing = child of "chest2")
						var wingJoint = rootJoint.children[0];
						var x = leftWing.height;
						var s = vec3.createFrom(x,x,x);
						mat4.scale(wingJoint.originalAnimMatrices[wingFrame],s,wingJoint.animMatrices[wingFrame]);
					}
					if(iFrame == customFrame){
						var j = leftWing.model.skeleton.joints;
						for( var k=0; k<j.length ; k++){ 
							if(j[k] == rootJoint) continue;// TEST_TMP
							j[k].animMatrices[wingFrame] = mat4.create(j[k].customAnimMatrices[0]);
						}
						if(rootJoint.children.length){
							var wingJoint = rootJoint.children[0];
							var x = leftWing.height;
							var s = vec3.createFrom(x,x,x);
							mat4.scale(wingJoint.animMatrices[wingFrame],s,wingJoint.animMatrices[wingFrame]);
						}
					}
					leftWing.model.skeleton.computeFrame(wingFrame);
				}
			}
			if(rightWing.model){
				if(rightWing.model.getLoadState() == 2){
					// make sure we are not out of range
					var wingFrame = iFrame;
					if(wingFrame >= rightWing.model.skeleton.joints[0].skinningMatrices.length){
						wingFrame = 0;
					}
					var rootJoint = rightWing.model.skeleton.rootJoint;
					rootJoint.animMatrices[wingFrame] = mat4.create(pony.model.skeleton.joints[chest1ID].worldAnimMatrices[iFrame]); 
					
					if(rootJoint.children.length){
					// scale the wing (reference joint wing = child of "chest2")
						var wingJoint = rootJoint.children[0];
						var x = rightWing.height;
						var s = vec3.createFrom(x,x,x);
						mat4.scale(wingJoint.originalAnimMatrices[wingFrame],s,wingJoint.animMatrices[wingFrame]);
					}
					if(iFrame == customFrame){
						var j = rightWing.model.skeleton.joints;
						for( var k=0; k<j.length ; k++){
							if(j[k] == rootJoint) continue;// TEST_TMP
							j[k].animMatrices[wingFrame] = mat4.create(j[k].customAnimMatrices[0]);
						}
						if(rootJoint.children.length){
							var wingJoint = rootJoint.children[0];
							var x = rightWing.height;
							var s = vec3.createFrom(x,x,x);
							mat4.scale(wingJoint.animMatrices[wingFrame],s,wingJoint.animMatrices[wingFrame]);
						}
					}
					rightWing.model.skeleton.computeFrame(wingFrame);
				}
			}
			if(collar1.model){
				if(collar1.model.getLoadState() == 2){
					animateJiggleBones(collar1.model,alpha);
					var jointID = neckID;
					if(collar1.model.skeleton.rootJoint.name == "Chest2"){
						jointID = chest2ID;
					}
					collar1.model.skeleton.rootJoint.animMatrices[0] = mat4.create(pony.model.skeleton.joints[jointID].worldAnimMatrices[iFrame]); 
					collar1.model.skeleton.computeFrame(0);
				}
			}
			for(var i=0; i<accessories.length; i++){
				var m = accessories[i].model;
				if(m){
					if(m.getLoadState() == 2){
						animateJiggleBones(m,alpha);
						var j = accessories[i].jointID;
						m.skeleton.rootJoint.animMatrices[0] = mat4.create(pony.model.skeleton.joints[j].worldAnimMatrices[iFrame]); 
						m.skeleton.computeFrame(0);
					}
				}
			}
			
			if(horn.model){
				if(horn.model.getLoadState() == 2){ 
					horn.model.skeleton.rootJoint.animMatrices[0] = mat4.create(pony.model.skeleton.joints[headID].worldAnimMatrices[iFrame]); 
					horn.model.skeleton.computeFrame(0);
				}
			}
			for(var i=0; i<headbandA.length; i++){
				if(headbandA[i].model){
					if(headbandA[i].model.getLoadState() == 2){
						animateJiggleBones(headbandA[i].model,alpha);
						headbandA[i].model.skeleton.rootJoint.animMatrices[0] = mat4.create(pony.model.skeleton.joints[headID].worldAnimMatrices[iFrame]); 
						headbandA[i].model.skeleton.computeFrame(0);
					}
				}
			}
			if(headgear1.model){
				if(headgear1.model.getLoadState() == 2){
					animateJiggleBones(headgear1.model,alpha);
					headgear1.model.skeleton.rootJoint.animMatrices[0] = mat4.create(pony.model.skeleton.joints[headID].worldAnimMatrices[iFrame]); 
					var offset = vec3.createFrom(0.0,-2.0,2.0);
					if(hairFront.model){
						offset[0] = hairFront.model.headgearOffset[0];
						offset[1] = hairFront.model.headgearOffset[1];
						offset[2] = hairFront.model.headgearOffset[2];
					}
					headgear1.model.skeleton.rootJoint.animMatrices[0][12] += offset[0];
					headgear1.model.skeleton.rootJoint.animMatrices[0][13] += offset[1];
					headgear1.model.skeleton.rootJoint.animMatrices[0][14] += offset[2];
					headgear1.model.skeleton.computeFrame(0);
				}
			}
			// draw scene
			drawScene();
			
			// download png image
			if(bTakeScreenshot){
				screenshot = canvas.toDataURL("image/png");
				bTakeScreenshot = false; // screenshot is ready
			}
			
		}
	}
	lastTime = timeNow;
}
	

function animate(dt) {
	// animate characters
	pony.animate(dt); // calculate current frame
}

function animateJiggleBones(model,alpha){
	if(bJiggleBonesPhysics){
		for(var i=0; i<model.skeleton.joints.length; i++){
			var joint = model.skeleton.joints[i];
			if(joint.isFlexible()){
				
				var euler = vec3.create();
				vec3.lerp(joint.previousState.ap,joint.currentState.ap,alpha,euler);
				// same as : previousState.ap * ( 1.0 - alpha ) + currentState.ap *alpha;
				
				var axisAngle = vec4.create();
				eulerToAxisAngle(euler,axisAngle);
				var angle = axisAngle[3];
				var axis = vec3.createFrom(axisAngle[0],axisAngle[1],axisAngle[2]);
				var mat = mat4.create();
				mat4.rotate(joint.originalAnimMatrices[0], angle, axis, mat);
				 
				joint.animMatrices[0] = mat;
			}
		}
	}
}

function computeIris(inst, dt, derp){
	if(inst.model){
		if(inst.model.getLoadState() == 2){
			if(cursor3DPos){
			
				// eyes are weird if we only consider one center for each eye.
				
				// to do, compute the tranformation matrices when the neck will turn.
				
				var ecl = leftEye.model.mesh.getCenter();
				var ecr = rightEye.model.mesh.getCenter();
				var eyeCenter = vec3.create();
				vec3.add(ecl,ecr,eyeCenter);
				vec3.scale(eyeCenter,0.5);
				
				var dx = cursor3DPos[0] - eyeCenter[0];
				var dy = cursor3DPos[1] - eyeCenter[1];
				
				var dist = vec3.dist(eyeCenter,cursor3DPos); // distance between eye and cursor
				if (Math.abs(dist)<0.00001){dist = 0.00001;}
				var alphaX = Math.asin(-dx/dist);
				var alphaY = Math.asin(dy/dist);

				alphaX *= 0.1;
				alphaY *= 0.1;
				if(derp){
					alphaX = -alphaX;
					alphaY = -alphaY;
				}
				
				// apply constraints
				alphaX = clamp(alphaX,-0.1,0.1);
				alphaY = clamp(alphaY,-0.1,0.1);
				
				inst.uvTranslation[0] = alphaX;
				inst.uvTranslation[1] = alphaY;
			}
			else{
				// if mouse outside the canvas, reset the translation values.
				inst.uvTranslation[0] = 0;
				inst.uvTranslation[1] = 0;
			}
		}
	}
}

var animSpeedID = document.getElementById("animSpeedID");
animSpeedID.onchange = function() {
	f = clamp(animSpeedID.value,0.0,4.0);
	pony.setAnimationSpeed(f);
}




// ******************************************
// **               PHYSICS                **
// ******************************************

// There are good tutorials here, http://gafferongames.com/game-physics/ 
// They cover :
//  - Spring physics
//  - Integration basics (runge kutta 4)
//  - Fixed timestep
//  - Physics in 3D
//  - Networked physics

// Also http://doswa.com/2009/01/02/fourth-order-runge-kutta-numerical-integration.html

function Derivative()
{
	this.dp = 0;
	this.dv = 0;
}

function doPhysics(dt) {
	// dt is in seconds
	// compute jiggle bones for hair and tail
	if(bJiggleBonesPhysics){
		computeJiggleBonesPhysics(hairFront.model,dt);
		computeJiggleBonesPhysics(hairBack.model,dt);
		computeJiggleBonesPhysics(hairExtra.model,dt);
		computeJiggleBonesPhysics(tail.model,dt);
		computeJiggleBonesPhysics(collar1.model,dt);
		computeJiggleBonesPhysics(headgear1.model,dt);
		for(var i=0; i<accessories.length; i++){
			computeJiggleBonesPhysics(accessories[i].model,dt);
		}
		for(var i=0; i<headbandA.length; i++){
			computeJiggleBonesPhysics(headbandA[i].model,dt);
		}
	}
	// move the eye irises
	if(bMoveIrisesWithMouse){
		computeIris(leftEye,dt,derpEyes);
		computeIris(rightEye,dt,false);
	}
}

function computeJiggleBonesPhysics(model,dt) {
	// dt is in seconds
	if(model){
		if(model.getLoadState() == 2){
			for(var i=0; i<model.skeleton.joints.length; i++){
				var joint = model.skeleton.joints[i];
				if(joint.isFlexible()){				
					computeFlexibleJoint(joint,dt);	
				}
			}
		}
	}
}

function computeFlexibleJoint(joint,dt){

	// copy state
	for(var i=0; i<3; i++){
		//joint.previousState.p[i] = joint.currentState.p[i]; // position
		//joint.previousState.v[i] = joint.currentState.v[i]; // velocity
		//joint.previousState.a[i] = joint.currentState.a[i]; // acceleration
		
		joint.previousState.ap[i] = joint.currentState.ap[i]; // angular position
		joint.previousState.av[i] = joint.currentState.av[i]; // angular velocity
		joint.previousState.aa[i] = joint.currentState.aa[i]; // angular acceleration
	}
	
	// integrate velocities and positions
	integrate(joint,dt);
	
	// apply constraints
	joint.currentState.ap[0] = clamp(joint.currentState.ap[0],joint.pitch_constraint_min,joint.pitch_constraint_max);
	joint.currentState.ap[1] = clamp(joint.currentState.ap[1],joint.yaw_constraint_min,joint.yaw_constraint_max);
	
}

function integrate(joint,dt){
	// use runge-kutta 4 for integration
	var k1 = f1(joint);
	var k2 = f2(joint, dt*0.5, k1);
	var k3 = f2(joint, dt*0.5, k2);
	var k4 = f2(joint, dt, k3);

	for(var i=0;i<3;i++){
		joint.currentState.ap[i] += dt/6.0 * (k1.dp[i] + 2.0*(k2.dp[i] + k3.dp[i]) + k4.dp[i]);
		joint.currentState.av[i] += dt/6.0 * (k1.dv[i] + 2.0*(k2.dv[i] + k3.dv[i]) + k4.dv[i]);
	}
}

/*
function rk4(x, v, a, dt){
        x1 = x
        v1 = v
        a1 = a(x1, v1, 0)

        x2 = x + 0.5*v1*dt
        v2 = v + 0.5*a1*dt
        a2 = a(x2, v2, dt/2.0)

        x3 = x + 0.5*v2*dt
        v3 = v + 0.5*a2*dt
        a3 = a(x3, v3, dt/2.0)

        x4 = x + v3*dt
        v4 = v + a3*dt
        a4 = a(x4, v4, dt)

        xf = x + (dt/6.0)*(v1 + 2*v2 + 2*v3 + v4)
        vf = v + (dt/6.0)*(a1 + 2*a2 + 2*a3 + a4)

        return xf, vf
}*/

function f1(joint)
{
	var k = new Derivative();
	k.dp = joint.currentState.av;
	k.dv = acceleration(joint,joint.currentState);
	return k;
}

function f2(joint, dt, d)
{
	var newState = new State();
	for(var i=0;i<3;i++){
		newState.ap[i] = joint.currentState.ap[i] + d.dp[i]*dt;
		newState.av[i] = joint.currentState.av[i] + d.dv[i]*dt;
	}
	var k = new Derivative();
	k.dp = newState.av;
	k.dv = acceleration(joint,newState);
	return k;
}

function acceleration(joint,state)
{
	var k0 = joint.pitch_stiffness;
	var d0 = joint.pitch_damping;
	var k1 = joint.yaw_stiffness; 
	var d1 = joint.yaw_damping;
	var a = vec3.create();

	// apply spring-mass system
	a[0] = - k0 * state.ap[0] - d0 * state.av[0];
	a[1] = - k1 * state.ap[1] - d1 * state.av[1];
	a[2] = 0;
	
	// add some wind effect
	//a[1] += 30*(1+Math.sin(0.003*totalTime));
	
	// add the force generated by mouse
	a[0] += mouseForceX;
	a[1] += mouseForceY;
	
	a[0] /= joint.mass;
	a[1] /= joint.mass;

	return a;
}





// ******************************************
// **   INTERFACE FUNCTIONS WITH HMTL      **
// ******************************************


// Light
var lightDocID = new Array();
lightDocID[0] = document.getElementById("aLight0r");
lightDocID[1] = document.getElementById("aLight0g");
lightDocID[2] = document.getElementById("aLight0b");
lightDocID[3] = document.getElementById("dLight0r");
lightDocID[4] = document.getElementById("dLight0g");
lightDocID[5] = document.getElementById("dLight0b");
lightDocID[6] = document.getElementById("sLight0r");
lightDocID[7] = document.getElementById("sLight0g");
lightDocID[8] = document.getElementById("sLight0b");
var shininessDocID = document.getElementById("shininess");

function setDefaultLight(){
	lightDocID[0].value = 0.4;
	lightDocID[1].value = 0.4;
	lightDocID[2].value = 0.4;
	lightDocID[3].value = 0.4;
	lightDocID[4].value = 0.4;
	lightDocID[5].value = 0.4;
	lightDocID[6].value = 0.25;
	lightDocID[7].value = 0.25;
	lightDocID[8].value = 0.25;
	shininessDocID.value = 1;
	lightArray[0].ambiant = [0.4,0.4,0.4,1.0]; 
	lightArray[0].diffuse = [0.4,0.4,0.4,1.0];
	lightArray[0].specular = [0.25,0.25,0.25,1.0];
	pony.shininess = 1;
}

function setDefault2Light(){
	lightDocID[0].value = 0.45;
	lightDocID[1].value = 0.45;
	lightDocID[2].value = 0.45;
	lightDocID[3].value = 0.5;
	lightDocID[4].value = 0.5;
	lightDocID[5].value = 0.5;
	lightDocID[6].value = 0.05;
	lightDocID[7].value = 0.05;
	lightDocID[8].value = 0.05;
	shininessDocID.value = 25;
	lightArray[0].ambiant = [0.45,0.45,0.45,1.0]; 
	lightArray[0].diffuse = [0.5,0.5,0.5,1.0];
	lightArray[0].specular = [0.05,0.05,0.05,1.0];
	pony.shininess = 25;
}

function setShinyLight(){
	lightDocID[0].value = 0.3;
	lightDocID[1].value = 0.3;
	lightDocID[2].value = 0.3;
	lightDocID[3].value = 0.7;
	lightDocID[4].value = 0.7;
	lightDocID[5].value = 0.7;
	lightDocID[6].value = 0.9;
	lightDocID[7].value = 0.9;
	lightDocID[8].value = 0.9;
	shininessDocID.value = 40;
	lightArray[0].ambiant = [0.3,0.3,0.3,1.0]; 
	lightArray[0].diffuse = [0.7,0.7,0.7,1.0];
	lightArray[0].specular = [0.9,0.9,0.9,1.0];
	pony.shininess = 40;
}

function changeLight(){
	var a = new Array();
	for(var i=0; i<9; i++){
		a[i] = lightDocID[i].value;
		if(isNaN(a[i])){
			a[i] = 0;
			lightDocID.value = 0;
		}
	}
	lightArray[0].ambiant = [a[0],a[1],a[2],1]; 
	lightArray[0].diffuse = [a[3],a[4],a[5],1];
	lightArray[0].specular = [a[6],a[7],a[8],1];
}

function changeShininess(value){
	if(isNaN(value)){
		value = 1;
		shininessDocID.value = 1;
	}
	pony.shininess = value;
}

// Stickers

function changeCurrentStickerID(value){

	// change current sticker and update interface

	var oldSticker = pony.model.sticker[currentStickerID];
	document.getElementById('stickerMini'+currentStickerID).className = 'stickerMiniInactive';
	document.getElementById('stickerMini'+value).className = 'stickerMiniActive';
	document.getElementById(oldSticker.htmlid).className = 'stickerImgInactive';
	currentStickerID = value;
	
	var sticker = pony.model.sticker[currentStickerID];
	document.getElementById('stickerRotation').value = sticker.angle * 180 / Math.PI;
	document.getElementById('stickerScale').value = 1 / sticker.uscale;
	document.getElementById('stickerReverse').checked = sticker.reverse;
	if(sticker.htmlid){
		if(document.getElementById(sticker.htmlid)){
			document.getElementById(sticker.htmlid).className = 'stickerImgActive';
		}
	}

}

function changeStickerImage(img){
	oldStickerImgID.className = 'stickerImgInactive';
	img.className = 'stickerImgActive';
	oldStickerImgID = img;
	document.getElementById('stickerMini'+currentStickerID).src = img.src;
	var sticker = pony.model.sticker[currentStickerID];
	sticker.htmlid = img.id;
	if(img.id == "blankStickerImg"){
		// disable sticker if no texture, for performance issue
		sticker.display = false;
	}
	else{
		sticker.initStickerTexture(img.src);
		sticker.display = true;
	}
}

var editModeButton = document.getElementById("stickerEditModeButton");
editModeButton.onclick = function (){
	if(stickerEditMode){
		stickerEditMode = false;
		editModeButton.value = "Edit mode disabled";
		editModeButton.className = "editModeDisabled";
		
	}
	else{
		stickerEditMode = true;
		editModeButton.value = "Edit mode enabled";
		editModeButton.className = "editModeEnabled";
	}
}

function disableEditMode(){
	stickerEditMode = false;
	editModeButton.value = "Edit mode disabled";
	editModeButton.className = "editModeDisabled";
}

function changeStickerRotation(a){
	var sticker = pony.model.sticker[currentStickerID];
	sticker.angle = a*Math.PI/180.0;
	updateStickerUVBuffer(sticker);
}

function changeStickerScale(u){
	//u = clamp(u,5,12);
	var sticker = pony.model.sticker[currentStickerID];
	sticker.uscale = 1/u;
	sticker.vscale = 1/u;
	updateStickerUVBuffer(sticker);
}

var stickerReverse = document.getElementById("stickerReverse");
stickerReverse.onclick = function() {
	var sticker = pony.model.sticker[currentStickerID];
	sticker.reverse = stickerReverse.checked;
	updateStickerUVBuffer(sticker);
}

function changeCutieMarkUt(a){
	pony.model.lCutieMark.ut = a*1;
	updateStickerUVBuffer(pony.model.lCutieMark);
	pony.model.rCutieMark.ut = a*1;
	updateStickerUVBuffer(pony.model.rCutieMark);
}

function changeCutieMarkVt(a){
	pony.model.lCutieMark.vt = a*1;
	updateStickerUVBuffer(pony.model.lCutieMark);
	pony.model.rCutieMark.vt = a*1;
	updateStickerUVBuffer(pony.model.rCutieMark);
}
	
function changeCutieMarkRotation(a){
	pony.model.lCutieMark.angle = a*Math.PI/180.0;
	updateStickerUVBuffer(pony.model.lCutieMark);
	pony.model.rCutieMark.angle = a*Math.PI/180.0;
	updateStickerUVBuffer(pony.model.rCutieMark);
}

function changeCutieMarkScale(u){
	pony.model.lCutieMark.uscale = 1/u;
	pony.model.lCutieMark.vscale = 1/u;
	updateStickerUVBuffer(pony.model.lCutieMark);
	pony.model.rCutieMark.uscale = 1/u;
	pony.model.rCutieMark.vscale = 1/u;
	updateStickerUVBuffer(pony.model.rCutieMark);
}

var cutieMarkReverse = document.getElementById("cutieMarkReverse");
cutieMarkReverse.onclick = function() {
	pony.model.lCutieMark.reverse = cutieMarkReverse.checked;
	updateStickerUVBuffer(pony.model.lCutieMark);
	pony.model.rCutieMark.reverse = !cutieMarkReverse.checked;
	updateStickerUVBuffer(pony.model.rCutieMark);
}

function updateStickerUVBuffer(sticker){
	var r;
	sticker.reverse ? r=-1 : r=1;
	var uscale = sticker.uscale;
	var vscale = sticker.vscale;
	var a = sticker.angle;
	var ca = Math.cos(a);
	var sa = Math.sin(a);
	var ut = sticker.ut;
	var vt = sticker.vt;

	var uvcoords = new Array();
	for(var i=0;i<sticker.uv.length;i++){
		// scale
		var x = sticker.uv[i][0] * uscale * r;
		var y = sticker.uv[i][1] * vscale * -1;
		// rotate
		var u = x * ca - y * sa;
		var v = x * sa + y * ca;
		// translate
		u += ut;
		v += vt;
		uvcoords.push(u);
		uvcoords.push(v);
	}

	gl.bindBuffer(gl.ARRAY_BUFFER, sticker.aUVBufferSticker); 
	gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(uvcoords), gl.DYNAMIC_DRAW);

}

var hairFrontColor1 = document.getElementById("hairFrontColor1");
var hairFrontColor2 = document.getElementById("hairFrontColor2");
var hairFrontColor3 = document.getElementById("hairFrontColor3");
var hairBackColor1 = document.getElementById("hairBackColor1");
var hairBackColor2 = document.getElementById("hairBackColor2");
var hairBackColor3 = document.getElementById("hairBackColor3");
var tailColor1 = document.getElementById("tailColor1");
var tailColor2 = document.getElementById("tailColor2");
var tailColor3 = document.getElementById("tailColor3");
var wingsColor1 = document.getElementById("wingsColor1");
var wingsColor2 = document.getElementById("wingsColor2");
var wingsColor3 = document.getElementById("wingsColor3");
var hornColor1 = document.getElementById("hornColor1");
var hornColor2 = document.getElementById("hornColor2");


function changeAnimation(name){
	pony.setAnimation(name);
	document.getElementById("animationSelect").value = name;
	//document.getElementById("animationSelect2").value = name;
}

function changePose1(){
	// default pose
	var sk = pony.model.skeleton;
	sk.joints[0].rotateDegrees = [0,0,0];
	sk.joints[1].rotateDegrees = [0,-89.8,77.88];
	sk.joints[2].rotateDegrees = [0,0,23.77];
	sk.joints[3].rotateDegrees = [0,0,25.44];
	sk.joints[4].rotateDegrees = [0,0,47.87];
	sk.joints[5].rotateDegrees = [0,0,7.30];
	sk.joints[6].rotateDegrees = [0,0,-104.18];
	sk.joints[7].rotateDegrees = [0,0,-104.18];
	sk.joints[8].rotateDegrees = [0,0,-157.58];
	sk.joints[9].rotateDegrees = [0,0,28.92];
	sk.joints[10].rotateDegrees = [-8.70,0,14.29];
	sk.joints[11].rotateDegrees = [0,0,29.91];
	sk.joints[12].rotateDegrees = [0,0,22.28];
	sk.joints[13].rotateDegrees = [0,0,28.92];
	sk.joints[14].rotateDegrees = [-8.70,0,14.29];
	sk.joints[15].rotateDegrees = [0,0,29.91];
	sk.joints[16].rotateDegrees = [-2,9.38,-83.86];
	sk.joints[17].rotateDegrees = [1.38,-19.13,-99.85];
	sk.joints[18].rotateDegrees = [-6.26,2.86,98.61];
	sk.joints[19].rotateDegrees = [-1.47,-10.34,41.01];
	sk.joints[20].rotateDegrees = [1.97,-9.38,95.88];
	sk.joints[21].rotateDegrees = [1.38,-19.13,-99.85];
	sk.joints[22].rotateDegrees = [-6.26,2.86,98.61];
	sk.joints[23].rotateDegrees = [-1.47,-10.34,41.01];
	sk.joints[24].rotateDegrees = [7.74,-1.24,167.66];
	for(var i=0; i<sk.joints.length; i++){
		customPoseCurrentJoint = i;
		var j = sk.joints[i];
		rotateJoint(j);
	}
}

function changePose2(){
	// sit
	var sk = pony.model.skeleton;
	sk.joints[0].rotateDegrees = [-30,0,0];
	sk.joints[1].rotateDegrees = [0,-89.8,90];
	sk.joints[2].rotateDegrees = [0,0,23.77];
	sk.joints[3].rotateDegrees = [0,0,25.44];
	sk.joints[4].rotateDegrees = [0,-9.87,10.16];
	sk.joints[5].rotateDegrees = [0,0,7.30];
	sk.joints[6].rotateDegrees = [0,0,-104.18];
	sk.joints[7].rotateDegrees = [0,0,-104.18];
	sk.joints[8].rotateDegrees = [0,0,-157.58];
	sk.joints[9].rotateDegrees = [0,0,28.92];
	sk.joints[10].rotateDegrees = [-8.70,0,14.29];
	sk.joints[11].rotateDegrees = [0,0,29.91];
	sk.joints[12].rotateDegrees = [0,0,22.28];
	sk.joints[13].rotateDegrees = [0,0,28.92];
	sk.joints[14].rotateDegrees = [-8.70,0,14.29];
	sk.joints[15].rotateDegrees = [0,0,29.91];
	sk.joints[16].rotateDegrees = [-2,9.38,-83.86];
	sk.joints[17].rotateDegrees = [1.38,-19.13,-49.63];
	sk.joints[18].rotateDegrees = [-6.26,2.86,98.61];
	sk.joints[19].rotateDegrees = [-1.47,-10.34,41.01];
	sk.joints[20].rotateDegrees = [1.97,-9.38,137.66];
	sk.joints[21].rotateDegrees = [-13.24,1.39,-99.85];
	sk.joints[22].rotateDegrees = [-6.26,2.86,98.61];
	sk.joints[23].rotateDegrees = [-1.47,-10.34,41.01];
	sk.joints[24].rotateDegrees = [0,89.99,117.73];
	for(var i=0; i<sk.joints.length; i++){
		customPoseCurrentJoint = i;
		var j = sk.joints[i];
		rotateJoint(j);
	}
}

function changePose3(){
	// brohoof pose
	var sk = pony.model.skeleton;
	sk.joints[0].rotateDegrees = [0,0,0];
	sk.joints[1].rotateDegrees = [0,-89.8,77.88];
	sk.joints[2].rotateDegrees = [0,0,23.77];
	sk.joints[3].rotateDegrees = [0,0,25.44];
	sk.joints[4].rotateDegrees = [0,0,47.87];
	sk.joints[5].rotateDegrees = [0,0,7.30];
	sk.joints[6].rotateDegrees = [0,0,-104.18];
	sk.joints[7].rotateDegrees = [0,0,-104.18];
	sk.joints[8].rotateDegrees = [0,0,-120.82];
	sk.joints[9].rotateDegrees = [0,0,111.92];
	sk.joints[10].rotateDegrees = [-8.70,0,-20.22];
	sk.joints[11].rotateDegrees = [0,0,30.35];
	sk.joints[12].rotateDegrees = [0,0,22.28];
	sk.joints[13].rotateDegrees = [0,0,28.92];
	sk.joints[14].rotateDegrees = [-8.70,0,14.29];
	sk.joints[15].rotateDegrees = [0,0,29.91];
	sk.joints[16].rotateDegrees = [-2,9.38,-83.86];
	sk.joints[17].rotateDegrees = [1.38,-19.13,-99.85];
	sk.joints[18].rotateDegrees = [-6.26,2.86,98.61];
	sk.joints[19].rotateDegrees = [-1.47,-10.34,41.01];
	sk.joints[20].rotateDegrees = [1.97,-9.38,95.88];
	sk.joints[21].rotateDegrees = [1.38,-19.13,-99.85];
	sk.joints[22].rotateDegrees = [-6.26,2.86,98.61];
	sk.joints[23].rotateDegrees = [-1.47,-10.34,41.01];
	sk.joints[24].rotateDegrees = [7.74,-1.24,167.66];
	for(var i=0; i<sk.joints.length; i++){
		customPoseCurrentJoint = i;
		var j = sk.joints[i];
		rotateJoint(j);
	}
}

var tailPosDiv = document.getElementById("tailPosDiv");
var lWingPosDiv = document.getElementById("lWingPosDiv");
var rWingPosDiv = document.getElementById("rWingPosDiv");

function createTailWingInput(div,joint,j,offset){
	var n = 2; // number precision
	var euler = vec3.create();
	mat4ToEuler(joint.customAnimMatrices[0],euler);
	var c = document.createElement("input");
	var x = joint.index + offset;
	if(j==0){
		c.id = "joint"+x+"rotateX";
	}
	else if(j==1){
		c.id = "joint"+x+"rotateY";
	}
	else if(j==2){
		c.id = "joint"+x+"rotateZ";
	}
	c.className="inputPose";
	c.value = (euler[j] * 180 / Math.PI).toFixed(n);
	c.onchange = function(){
		rotateJoint2(c,x,j);
	}
	div.appendChild(c);
}
				
function createTailWingButton(div,k,i){
	var c = document.createElement("input");
	c.type="button";
	if(k==1000){
		c.value="Tail "+i;
	}
	else if(k==2000){
		c.value="leftWing "+i;
	}
	else if(k==3000){
		c.value="rightWing "+i;
	}
	var l=i+k;
	c.id = "joint"+l+"button";
	c.onclick = function(){
		changePose(l);
	}
	div.appendChild(c);	
}
			
function initCustomPose(){
	changeAnimation("custom");
	loadModel(jointSphereModel,true);
	bDisplayJointSphere = true;
	loadModel(torusX.model,true); 
	loadModel(torusY.model,true); 
	loadModel(torusZ.model,true); 
	loadModel(bigtorusX.model,true); 
	loadModel(bigtorusY.model,true); 
	loadModel(bigtorusZ.model,true);
	
	var n = 2; // number precision
	var sk = pony.model.skeleton;
	var euler = vec3.create();
	
	for(var i=0; i<25; i++){
		mat4ToEuler(sk.joints[i].originalAnimMatrices[customFrame],euler);
		document.getElementById("joint"+i+"rotateX").value = (euler[0] * 180 / Math.PI).toFixed(n);
		document.getElementById("joint"+i+"rotateY").value = (euler[1] * 180 / Math.PI).toFixed(n);
		document.getElementById("joint"+i+"rotateZ").value = (euler[2] * 180 / Math.PI).toFixed(n);
	}
	
	// init tail and wings pose (new in 1.0.5)
	if(tail.model){
		var sk2 = tail.model.skeleton;

		tailPosDiv.innerHTML = ''; // remove content
		for(var i=1; i<sk2.joints.length; i++){
			var joint = sk2.joints[i];
			// tail joint id starts at 1000
			
			createTailWingButton(tailPosDiv,1000,i);
					
			for(var j=0; j<3; j++){
				createTailWingInput(tailPosDiv,joint,j,1000);
				
			}
			tailPosDiv.appendChild(document.createElement("br"));
		}
	} // end tail
	
	if(leftWing.model){
		var sk2 = leftWing.model.skeleton;

		lWingPosDiv.innerHTML = ''; // remove content
		for(var i=1; i<sk2.joints.length; i++){
			var joint = sk2.joints[i];
			// left wing joint id starts at 2000
			createTailWingButton(lWingPosDiv,2000,i);	
			for(var j=0; j<3; j++){
				createTailWingInput(lWingPosDiv,joint,j,2000);
			}
			lWingPosDiv.appendChild(document.createElement("br"));
		}
	} // end left wing
	
	if(rightWing.model){
		var sk2 = rightWing.model.skeleton;

		rWingPosDiv.innerHTML = ''; // remove content
		for(var i=1; i<sk2.joints.length; i++){
			var joint = sk2.joints[i];
			// right wing joint id starts at 3000
			createTailWingButton(rWingPosDiv,3000,i);
			for(var j=0; j<3; j++){
				createTailWingInput(rWingPosDiv,joint,j,3000);
			}
			rWingPosDiv.appendChild(document.createElement("br"));
		}
	} // end right wing

}

function endCustomPose(){
	bDisplayJointSphere = false;
	bDisplayTorus = false;
	selectedTorus = 0;
}

function rotateJoint(joint){

	var f = 0;
	if(customPoseCurrentJoint<500){
		f = customFrame;
	}
	else if(customPoseCurrentJoint<2000){
		//f = 0;
		rotateJoint3(joint); 
		return;
	}
	else if(customPoseCurrentJoint<4000){
		//f = customFrame;
		rotateJoint3(joint); 
		return;
	}
				
	var n = 2;
	var euler = vec3.create();
	euler[0] = joint.rotateDegrees[0] * Math.PI / 180;
	euler[1] = joint.rotateDegrees[1] * Math.PI / 180;
	euler[2] = joint.rotateDegrees[2] * Math.PI / 180;
	
	/*
	0 = reference 
	1 = pelvis
	2 = chest1
	etc
	
	init limits somewhere else
	jointLimit[0] = [-70,70,-60,60,-13,50];
	jointLimit[1] = [-20,20,-40,40,-10,30];
	jointLimit[2] = [-20,20,-50,50,-18,20];
	
	joint.rotateDegrees[0] = clamp(joint.rotateDegrees[0],tab[joint.id].limitMin[0],tab[joint.id].limitax[0]);
		
	*/
	//document.getElementById("joint"+joint.index+"rotateX").value = parseFloat(joint.rotateDegrees[0]).toFixed(n);
	//document.getElementById("joint"+joint.index+"rotateY").value = parseFloat(joint.rotateDegrees[1]).toFixed(n);
	//document.getElementById("joint"+joint.index+"rotateZ").value = parseFloat(joint.rotateDegrees[2]).toFixed(n);

	document.getElementById("joint"+customPoseCurrentJoint+"rotateX").value = parseFloat(joint.rotateDegrees[0]).toFixed(n);
	document.getElementById("joint"+customPoseCurrentJoint+"rotateY").value = parseFloat(joint.rotateDegrees[1]).toFixed(n);
	document.getElementById("joint"+customPoseCurrentJoint+"rotateZ").value = parseFloat(joint.rotateDegrees[2]).toFixed(n);
	
	var t = vec3.createFrom(joint.originalAnimMatrices[f][12],joint.originalAnimMatrices[f][13],joint.originalAnimMatrices[f][14]);
	mat4.identity(joint.originalAnimMatrices[f]);
	mat4.rotateX(joint.originalAnimMatrices[f],euler[0]);
	mat4.rotateY(joint.originalAnimMatrices[f],euler[1]);
	mat4.rotateZ(joint.originalAnimMatrices[f],euler[2]);
	joint.originalAnimMatrices[f][12] = t[0];
	joint.originalAnimMatrices[f][13] = t[1];
	joint.originalAnimMatrices[f][14] = t[2];
	changePonyHeight(pony.height,true);	
	pony.model.skeleton.computeFrame(customFrame);
}

function rotateJoint3(joint){
 // tail / wings
 var n = 2;
	var euler = vec3.create();
	euler[0] = joint.rotateDegrees[0] * Math.PI / 180;
	euler[1] = joint.rotateDegrees[1] * Math.PI / 180;
	euler[2] = joint.rotateDegrees[2] * Math.PI / 180;
	
	var d0 = document.getElementById("joint"+customPoseCurrentJoint+"rotateX");
	if(d0){
		d0.value = parseFloat(joint.rotateDegrees[0]).toFixed(n);
	}
	var d1 = document.getElementById("joint"+customPoseCurrentJoint+"rotateY");
	if(d1){
		d1.value = parseFloat(joint.rotateDegrees[1]).toFixed(n);
	}
	var d2 = document.getElementById("joint"+customPoseCurrentJoint+"rotateZ");
	if(d2){
		d2.value = parseFloat(joint.rotateDegrees[2]).toFixed(n);
	}
		
	
	var m = joint.customAnimMatrices[0];
	var t = vec3.createFrom(m[12],m[13],m[14]);
	mat4.identity(m);
	mat4.rotateX(m,euler[0]);
	mat4.rotateY(m,euler[1]);
	mat4.rotateZ(m,euler[2]);
	m[12] = t[0];
	m[13] = t[1];
	m[14] = t[2];

}


function rotateXJoint(e,jointID){
	var joint = pony.model.skeleton.joints[jointID];
	joint.rotateDegrees[0] = e.value;
	changeAnimation("custom");
	rotateJoint(joint);
}


function rotateYJoint(e,jointID){
	var joint = pony.model.skeleton.joints[jointID];
	joint.rotateDegrees[1] = e.value;
	changeAnimation("custom");
	rotateJoint(joint);
}

function rotateZJoint(e,jointID){
	var joint = pony.model.skeleton.joints[jointID];
	joint.rotateDegrees[2] = e.value;
	changeAnimation("custom");
	rotateJoint(joint);
}


function rotateJoint2(e,x,j){
	changePose(x);
	var inst = 0;
	var jointID = 0;
	var f = 0;
	if(x<500){
		inst = pony;
		jointID = x;
	}
	else if(x<2000){
		inst = tail;
		jointID = x-1000;
		f = 0;
	}
	else if(x<3000){
		inst = leftWing;
		jointID = x-2000;
	}
	else if(x<4000){
		inst = rightWing;
		jointID = x-3000;
	}
	var joint = inst.model.skeleton.joints[jointID];
	joint.rotateDegrees[j] = e.value;
	changeAnimation("custom");
	rotateJoint3(joint);
}

function changePose(value){
	document.getElementById("joint"+customPoseCurrentJoint+"button").style = "color:black";
	customPoseCurrentJoint = value;
	document.getElementById("joint"+customPoseCurrentJoint+"button").style = "color:teal";
	bDisplayTorus = true;
}

function changeShading(value){
	shadingType = value;
}

function changeEyelashes(value){
	loadModel(eyelashesModelArray[value],true);
	eyelashes.model = eyelashesModelArray[value];
}

function changeHairFrontModel(value){

	loadModel(hairFrontModelArray[value],true);
	hairFront.model = hairFrontModelArray[value];

	// disable back hair if the front hair do both
	if(!hairBackModelArray[value] && value!=0){
		document.getElementById("hairBackStyleSelect").disabled=true;
		hairBack.model = 0;
	}
	else{ // retrieve back hair 
		document.getElementById("hairBackStyleSelect" ).disabled=false;
		var v = document.getElementById("hairBackStyleSelect").value;
		hairBack.model = hairBackModelArray[v];
	}
	
	// special hair for Cloudchaser only
	if(value == 10){
		loadModel(hairExtraModelArray[1],true);
		hairExtra.model = hairExtraModelArray[1];
	}
	else{
		hairExtra.model = 0;
	}
	
	
	if(!hairFront.model){
		hairFrontColor1.style.display="none";
		hairFrontColor2.style.display="none";
		hairFrontColor3.style.display="none";
	}
	else if(hairFront.model.maxColors == 1){
		hairFrontColor1.style.display="inline";
		hairFrontColor2.style.display="none";
		hairFrontColor3.style.display="none";
	}
	else if(hairFront.model.maxColors == 2){
		hairFrontColor1.style.display="inline";
		hairFrontColor2.style.display="inline";
		hairFrontColor3.style.display="none";
	}
	else{ // 3 or unknown
		hairFrontColor1.style.display="inline";
		hairFrontColor2.style.display="inline";
		hairFrontColor3.style.display="inline";
	}
	
	changeTexture1_inst(hairFront);
}

function changeHairBackModel(value){
	loadModel(hairBackModelArray[value],true);
	hairBack.model = hairBackModelArray[value];
	if(!hairBack.model){
		hairBackColor1.style.display="none";
		hairBackColor2.style.display="none";
		hairBackColor3.style.display="none";
	}
	else if(hairBack.model.maxColors == 1){
		hairBackColor1.style.display="inline";
		hairBackColor2.style.display="none";
		hairBackColor3.style.display="none";
	}
	else if(hairBack.model.maxColors == 2){
		hairBackColor1.style.display="inline";
		hairBackColor2.style.display="inline";
		hairBackColor3.style.display="none";
	}
	else{ // 3 or unknown
		hairBackColor1.style.display="inline";
		hairBackColor2.style.display="inline";
		hairBackColor3.style.display="inline";
	}
	
	changeTexture1_inst(hairBack);
}

function changeTailModel(value){
	loadModel(tailModelArray[value],true);
	tail.model = tailModelArray[value];
	if(!tail.model){
		tailColor1.style.display="none";
		tailColor2.style.display="none";
		tailColor3.style.display="none";
	}
	else if(tail.model.maxColors == 0){
		tailColor1.style.display="none";
		tailColor2.style.display="none";
		tailColor3.style.display="none";
	}
	else if(tail.model.maxColors == 1){
		tailColor1.style.display="inline";
		tailColor2.style.display="none";
		tailColor3.style.display="none";
	}
	else if(tail.model.maxColors == 2){
		tailColor1.style.display="inline";
		tailColor2.style.display="inline";
		tailColor3.style.display="none";
	}
	else{ // 3 or unknown
		tailColor1.style.display="inline";
		tailColor2.style.display="inline";
		tailColor3.style.display="inline";
	}
	changeTailSize(tail.height);
	
	changeTexture1_inst(tail);
}

function changeHornModel(value){
	horn.id = value;
	horn.model = hornModelArray[value];
	if(!value) return;
	loadModel(hornModelArray[value],true);
	changeHornSize(horn.height);
	
	changeTexture1_inst(horn);
}

function changeHeadSize(value){
	headSize[0] = value;
	headSize[1] = value;
	headSize[2] = value;
	changePonyHeight(pony.height);
}

				
function changeLeftWingModel(value){
	var val = parseInt(value);
	var newval = val;
	
	leftWing.id = newval;
	loadModel(leftWingModelArray[newval],true);
	leftWing.model = leftWingModelArray[newval];
	changeLeftWingSize(leftWing.height);
	
	changeTexture1_inst(leftWing);
}

function changeRightWingModel(value){
	var val = parseInt(value);
	var newval = val;

	rightWing.id = newval;
	loadModel(rightWingModelArray[newval],true);
	rightWing.model = rightWingModelArray[newval];
	changeRightWingSize(rightWing.height);
	
	changeTexture1_inst(rightWing);
}

function changeWingModel(value){
	changeLeftWingModel(value);
	changeRightWingModel(value);
}


function changeBodyColorStyle(value){
	var val = parseInt(value);
	switch(val)
	{
	case 0:
	  pony.model.initTexture("js/models/pony/body/body_f2.png",0);
	  break;
	case 1:
	  pony.model.initTexture("js/models/pony/body/colored_legs_fix_HD_f.png",0);
	  break;
	case 2:
	  pony.model.initTexture("js/models/pony/body/body_cow_fix_HD_f.png",0);
	  break;
	case 3:
	  pony.model.initTexture("js/models/pony/body/body_m.png",0);
	  break;
	case 4:
	  pony.model.initTexture("js/models/pony/body/body_zecora_fix_HD_f.png",0);
	  break;
	case 5:
	  pony.model.initTexture("js/models/pony/body/body_marking_HD.png",0);
	  break;
	case 6:
	  pony.model.initTexture("js/models/pony/body/muzzle1.png",0);
	  break;
	case 7:
	  pony.model.initTexture("js/models/pony/body/wonderbolt_outfit_fix_HD_f.png",0);
	  break;
	case 8:
	  pony.model.initTexture("js/models/pony/body/socks_f.png",0);
	  break;
	case 9:
	  pony.model.initTexture("js/models/pony/body/big_mac_hooves_HD_m.png",0);
	  break;  
	case 10:
	  pony.model.initTexture("js/models/pony/body/shining_armor_hooves_HD_m.png",0);
	  break;
	case 11:
	  pony.model.initTexture("js/models/pony/body/pipsqueak_HD_m.png",0);
	  break;  
	case 12:
	  pony.model.initTexture("js/models/pony/body/striped_legs_fix1.png",0);
	  break;
	case 13:
	  pony.model.initTexture("js/models/pony/body/maneniac_costume_HD_f.png",0);
	  break;
	case 14:
	  pony.model.initTexture("js/models/pony/body/gummy_suit.png",0);
	  break; 
	case 15:
	  pony.model.initTexture("js/models/pony/body/ninja_HD.png",0);
	  break;
	case 16:
	  pony.model.initTexture("js/models/pony/body/chrysalis_bodytwo.png",0);
	  break;
	case 17:
	  pony.model.initTexture("js/models/pony/body/spots_f.png",0);
	  break;
	case 18:
	  pony.model.initTexture("js/models/pony/body/mech1.png",0);
	  break; 
	case 19:
	  pony.model.initTexture("js/models/pony/body/mech2.png",0);
	  break; 
	case 20:
	  pony.model.initTexture("js/models/pony/body/mech3.png",0);
	  break; 
	case 21:
	  pony.model.initTexture("js/models/pony/body/mech4.png",0);
	  break; 	  
	case 22:
	  pony.model.initTexture("js/models/pony/body/colored_legs_fix_HD_m.png",0);
	  break;
	case 23:
	  pony.model.initTexture("js/models/pony/body/body_cow_fix_HD_m.png",0);
	  break;
	case 24:
	  pony.model.initTexture("js/models/pony/body/body_zecora_fix_HD_m.png",0);
	  break; 
	case 25:
	  pony.model.initTexture("js/models/pony/body/wonderbolt_outfit_fix_HD_m.png",0);
	  break;
	case 26:
	  pony.model.initTexture("js/models/pony/body/socks_m.png",0);
	  break;
	case 27:
	  pony.model.initTexture("js/models/pony/body/big_mac_hooves_HD_f.png",0);
	  break;
	case 28:
	  pony.model.initTexture("js/models/pony/body/shining_armor_hooves_HD_f.png",0);
	  break; 
	case 29:
	  pony.model.initTexture("js/models/pony/body/pipsqueak_HD_f.png",0);
	  break; 
	case 30:
	  pony.model.initTexture("js/models/pony/body/maneniac_costume_HD_m.png",0);
	  break; 
	case 31:
	  pony.model.initTexture("js/models/pony/body/chrysalis_m.png",0);
	  break;
	case 32:
	  pony.model.initTexture("js/models/pony/body/spots_m.png",0);
	  break;
	case 33:
	  pony.model.initTexture("js/models/pony/body/mech1_m.png",0);
	  break;
	case 34:
	  pony.model.initTexture("js/models/pony/body/mech2_m.png",0);
	  break; 
	case 35:
	  pony.model.initTexture("js/models/pony/body/mech3_m.png",0);
	  break;
	case 36:
	  pony.model.initTexture("js/models/pony/body/mech4_m.png",0);
	  break;
	default:
	  pony.model.initTexture("js/models/pony/body/body_f2.png",0);
	}
	
}



function changeCutieMark(value){
	var val = parseInt(value);
	customCutieMark = false;
	switch(val)
	{
	case 0:
	  pony.model.initTexture("js/models/pony/blank.png",1);
	  break;
	case 1:
	  pony.model.initTexture("js/models/pony/cutie_mark/lyra_cutie_mark.png",1);
	  break;
	case 2:
	  pony.model.initTexture("js/models/pony/cutie_mark/bonbon_cutie_mark.png",1);
	  break;
	case 3:
	  pony.model.initTexture("js/models/pony/cutie_mark/octavia_cutie_mark.png",1);
	  break;
	case 4:
	  pony.model.initTexture("js/models/pony/cutie_mark/vinyl_cutie_mark.png",1);
	  break;
	case 5:
	  pony.model.initTexture("js/models/pony/cutie_mark/derpy_cutie_mark.png",1);
	  break;
	case 6:
	  pony.model.initTexture("js/models/pony/cutie_mark/aloe_lotus_cutie_mark.png",1);
	  break;
	case 7:
	  pony.model.initTexture("js/models/pony/cutie_mark/berrypunch_cutie_mark.png",1);
	  break;
	case 8:
	  pony.model.initTexture("js/models/pony/cutie_mark/carrottop_cutie_mark.png",1);
	  break;
	case 9:
	  pony.model.initTexture("js/models/pony/cutie_mark/cheerilee_cutie_mark.png",1);
	  break;
	case 10:
	  pony.model.initTexture("js/models/pony/cutie_mark/cloudchaser_cutie_mark.png",1);
	  break;
	case 11:
	  pony.model.initTexture("js/models/pony/cutie_mark/flitter_cutie_mark.png",1);
	  break;
	case 12:
	  pony.model.initTexture("js/models/pony/cutie_mark/lightning_dust_cutie_mark.png",1);
	  break;
	case 13:
	  pony.model.initTexture("js/models/pony/cutie_mark/nurse_redheart_cutie_mark.png",1);
	  break;
	case 14:
	  pony.model.initTexture("js/models/pony/cutie_mark/spitfire_cutie_mark.png",1);
	  break;
	case 15:
	  pony.model.initTexture("js/models/pony/cutie_mark/trixie_cutie_mark.png",1);
	  break;
	case 18:
	  pony.model.initTexture("js/models/pony/cutie_mark/applejack_cutie_mark.png",1);
	  break;
	case 19:
	  pony.model.initTexture("js/models/pony/cutie_mark/fluttershy_cutie_mark.png",1);
	  break; 	
	case 20:
	  pony.model.initTexture("js/models/pony/cutie_mark/pinkie_cutie_mark.png",1);
	  break;
	case 21:
	  pony.model.initTexture("js/models/pony/cutie_mark/rainbow_dash_cutie_mark.png",1);
	  break;
	case 22:
	  pony.model.initTexture("js/models/pony/cutie_mark/rarity_cutie_mark.png",1);
	  break;
	case 23:
	  pony.model.initTexture("js/models/pony/cutie_mark/twilight_cutie_mark.png",1);
	  break; 
	case 500:
	  // custom
	  customCutieMark = true;
	  pony.model.initTexture("js/models/pony/blank.png",1);
	  break; 
	case 501:
	  pony.model.initTexture("js/models/pony/cutie_mark/apple_pie.png",1);
	  break;
	case 502:
	  pony.model.initTexture("js/models/pony/cutie_mark/cherry_berry.png",1);
	  break; 
	case 503:
	  pony.model.initTexture("js/models/pony/cutie_mark/cherry_fuzzy.png",1);
	  break; 
	case 504:
	  pony.model.initTexture("js/models/pony/cutie_mark/cinnamon_swirl.png",1);
	  break;
	case 505:
	  pony.model.initTexture("js/models/pony/cutie_mark/cloud_kicker.png",1);
	  break; 
	case 506:
	  pony.model.initTexture("js/models/pony/cutie_mark/deep_blue.png",1);
	  break; 
	case 507:
	  pony.model.initTexture("js/models/pony/cutie_mark/dizzy_twister.png",1);
	  break;
	case 508:
	  pony.model.initTexture("js/models/pony/cutie_mark/green_jewel.png",1);
	  break; 
	case 509:
	  pony.model.initTexture("js/models/pony/cutie_mark/lemon_hearts.png",1);
	  break; 
	case 510:
	  pony.model.initTexture("js/models/pony/cutie_mark/lightning_bolt.png",1);
	  break;
	case 511:
	  pony.model.initTexture("js/models/pony/cutie_mark/linked_hearts.png",1);
	  break; 
	case 512:
	  pony.model.initTexture("js/models/pony/cutie_mark/lucky_clover.png",1);
	  break; 
	case 513:
	  pony.model.initTexture("js/models/pony/cutie_mark/merry_may.png",1);
	  break; 
	case 514:
	  pony.model.initTexture("js/models/pony/cutie_mark/parasol.png",1);
	  break;
	case 515:
	  pony.model.initTexture("js/models/pony/cutie_mark/ponet.png",1);
	  break; 
	case 516:
	  pony.model.initTexture("js/models/pony/cutie_mark/rainbowshine.png",1);
	  break; 
	case 517:
	  pony.model.initTexture("js/models/pony/cutie_mark/sassaflash.png",1);
	  break;
	case 518:
	  pony.model.initTexture("js/models/pony/cutie_mark/seaswirl.png",1);
	  break; 
	case 519:
	  pony.model.initTexture("js/models/pony/cutie_mark/tropical_spring.png",1);
	  break; 
	case 520:
	  pony.model.initTexture("js/models/pony/cutie_mark/trumpeter.png",1);
	  break;
	case 521:
	  pony.model.initTexture("js/models/pony/cutie_mark/welly.png",1);
	  break; 
	case 522:
	  pony.model.initTexture("js/models/pony/cutie_mark/dr_whooves.png",1);
	  break; 
	case 523:
	  pony.model.initTexture("js/models/pony/cutie_mark/luna.png",1);
	  break; 
	case 524:
	  pony.model.initTexture("js/models/pony/cutie_mark/sunset_shimmer.png",1);
	  break; 
	default:
	  pony.model.initTexture("js/models/pony/blank.png",1);
	}
	
}

function importCutieMark(input){

	if (input.files && input.files[0])
	{
		var value = input.value;
		var ext = value.split('.').pop();
		if(ext == 'png'){
			var reader = new FileReader();
            reader.onload = function (e)
            {	                         
				var src = e.target.result;
                pony.model.lCutieMark.initCustomCutieMark(src);
				pony.model.rCutieMark.initCustomCutieMark(src);
				document.getElementById('cutieMarkSelect').value = 500;
				changeCutieMark(500); // Select custom cutie mark.                            
            };
            reader.readAsDataURL(input.files[0]);
				   
			// read file
			
			
			
		}
		else {
			alert("Please select a png file.");
		}
	}
}

function importTextureBody1(input){
// only used for beta-testing textures
	if (input.files && input.files[0])
	{
		var value = input.value;
		var ext = value.split('.').pop();
		if(ext == 'png'){
			var reader = new FileReader();
            reader.onload = function (e)
            {	                         
				var src = e.target.result;
                pony.model.initTexture(src,0);
				                         
            };
            reader.readAsDataURL(input.files[0]);
				   
			// read file
			
		}
		else {
			alert("Please select a png file.");
		}
	}
}

function importTextureEye1(input){
// only used for beta-testing textures
	if (input.files && input.files[0])
	{
		var value = input.value;
		var ext = value.split('.').pop();
		if(ext == 'png'){
			var reader = new FileReader();
            reader.onload = function (e)
            {	                         
				var src = e.target.result;
                leftEyeModel.initTexture(src,0);
				rightEyeModel.initTexture(src,0);   
            };
            reader.readAsDataURL(input.files[0]);
				   
			// read file

		}
		else {
			alert("Please select a png file.");
		}
	}
}

function _changelEye(value){
	changelEye(value);
	if(bMatchEyesStyle){
		changerEye(value);
		document.getElementById("rEyeSelect").value = value;
	}
}

function _changerEye(value){
	changerEye(value);
	if(bMatchEyesStyle){
		changelEye(value);
		document.getElementById("lEyeSelect").value = value;
	}
}

function changelEye(value){
	var val = parseInt(value);
	var m = leftEyeModel;
	switch(val)
	{
	case 0:
		m.initTexture('./js/models/pony/eyes/pupil_normal_l.png',0);
		break;
	case 1:
		m.initTexture('./js/models/pony/eyes/bat_pupil_l.png',0);
	    break;	  
	case 2:
		m.initTexture('./js/models/pony/eyes/snowdrop_pupil.png',0);
	    break;	  
	case 3:
		m.initTexture('./js/models/pony/eyes/love_potion_pupil_l.png',0);
	    break;	  
	case 4:
		m.initTexture('./js/models/pony/eyes/heart_pupil_l.png',0);
	    break;	  
	case 5:
		m.initTexture('./js/models/pony/eyes/chrysalis_eye.png',0);
	    break;
	case 6:
		m.initTexture('./js/models/pony/eyes/changeling_eye.png',0);
	    break;
	case 7:
		m.initTexture('./js/models/pony/eyes/dragon_pupil_l.png',0);
	    break;
	case 8:
	    m.initTexture("js/models/pony/eyes/maneiac_eye.png",0);
	    break; 
	case 9:
	    m.initTexture("js/models/pony/eyes/changeling_eye_2.png",0);
	    break;
	case 10:
	    m.initTexture("js/models/pony/eyes/cow_eye.png",0);
	    break; 
	case 11:
	    m.initTexture("js/models/pony/eyes/discord_eye.png",0);
	    break;
	case 12:
	    m.initTexture("js/models/pony/eyes/heart_pupil_l_2.png",0);
	    break;
	case 13:
	    m.initTexture("js/models/pony/eyes/love_potion_pupil_l_2.png",0);
	    break; 
	case 14:
	    m.initTexture("js/models/pony/eyes/mad_eye.png",0);
	    break;
	case 15:
	    m.initTexture("js/models/pony/eyes/mad_alternatif_eye.png",0);
	    break; 
	case 16:
	    m.initTexture("js/models/pony/eyes/other_eye.png",0);
	    break;
	case 17:
	    m.initTexture("js/models/pony/eyes/pupil_l_bat_filly.png",0);
	    break; 
	case 18:
	    m.initTexture("js/models/pony/eyes/pupil_l_bat_old.png",0);
	    break;
	case 19:
	    m.initTexture("js/models/pony/eyes/pupil_l_bat_stallion.png",0);
	    break;
	case 20:
	    m.initTexture("js/models/pony/eyes/pupil_l_bat_young.png",0);
	    break; 
	case 21:
	    m.initTexture("js/models/pony/eyes/pupil_l_chrysallis.png",0);
	    break;
	case 22:
	    m.initTexture("js/models/pony/eyes/pupil_l_crystal_filly.png",0);
	    break;
	case 23:
	    m.initTexture("js/models/pony/eyes/pupil_l_crystal_old.png",0);
	    break; 
	case 24:
	    m.initTexture("js/models/pony/eyes/pupil_l_crystal_stallion.png",0);
	    break;
	case 25:
	    m.initTexture("js/models/pony/eyes/pupil_l_crystal_young.png",0);
	    break; 
	case 26:
	    m.initTexture("js/models/pony/eyes/pupil_l_dragon.png",0);
	    break;
	case 27:
	    m.initTexture("js/models/pony/eyes/pupil_l_filly.png",0);
	    break; 
	case 28:
	    m.initTexture("js/models/pony/eyes/pupil_l_old.png",0);
	    break;
	case 29:
	    m.initTexture("js/models/pony/eyes/pupil_l_stallion.png",0);
	    break;
	case 30:
	    m.initTexture("js/models/pony/eyes/pupil_l_young.png",0);
	    break; 
	case 31:
	    m.initTexture("js/models/pony/eyes/snowdrop_pupil_2.png",0);
	    break;
	case 32:
	    m.initTexture("js/models/pony/eyes/dog_eye.png",0);
	    break;
	case 33:
	    m.initTexture("js/models/pony/eyes/gummy_eye.png",0);
	    break; 
	case 34:
		m.initTexture("js/models/pony/eyes/pupil_Rainbow.png",0);
	    break;
	case 35:
		m.initTexture("js/models/pony/eyes/nighmaremoon.png",0);
	    break;
	case 36:
		m.initTexture("js/models/pony/eyes/chrysalispupilfour_r.png",0);
	    break;
	case 37:
		m.initTexture("js/models/pony/eyes/mechaeye.png",0);
	    break; 		
	}
	
	
	
	
}

function changerEye(value){
	var val = parseInt(value);
	var m = rightEyeModel;
	switch(val)
	{
	case 0:
		m.initTexture('./js/models/pony/eyes/pupil_normal_r.png',0);
		break;
	case 1:
		m.initTexture('./js/models/pony/eyes/bat_pupil_r.png',0);
	    break;	  
	case 2:
		m.initTexture('./js/models/pony/eyes/snowdrop_pupil.png',0);
	    break;	
	case 3:
		m.initTexture('./js/models/pony/eyes/love_potion_pupil_l.png',0);
	    break;	  
	case 4:
		m.initTexture('./js/models/pony/eyes/heart_pupil_l.png',0);
	    break;		
	case 5:
		m.initTexture('./js/models/pony/eyes/chrysalis_eye.png',0);
	    break;
	case 6:
		m.initTexture('./js/models/pony/eyes/changeling_eye.png',0);
	    break;
	case 7:
		m.initTexture('./js/models/pony/eyes/dragon_pupil_l.png',0);
	    break;
	case 8:
	    m.initTexture("js/models/pony/eyes/maneiac_eye.png",0);
	    break;
	case 9:
	    m.initTexture("js/models/pony/eyes/changeling_eye_2.png",0);
	    break;
	case 10:
	    m.initTexture("js/models/pony/eyes/cow_eye.png",0);
	    break; 
	case 11:
	    m.initTexture("js/models/pony/eyes/discord_eye.png",0);
	    break;
	case 12:
	    m.initTexture("js/models/pony/eyes/heart_pupil_l_2.png",0);
	    break;
	case 13:
	    m.initTexture("js/models/pony/eyes/love_potion_pupil_l_2.png",0);
	    break; 
	case 14:
	    m.initTexture("js/models/pony/eyes/mad_eye.png",0);
	    break;
	case 15:
	    m.initTexture("js/models/pony/eyes/mad_alternatif_eye.png",0);
	    break; 
	case 16:
	    m.initTexture("js/models/pony/eyes/other_eye.png",0);
	    break;
	case 17:
	    m.initTexture("js/models/pony/eyes/pupil_l_bat_filly.png",0);
	    break; 
	case 18:
	    m.initTexture("js/models/pony/eyes/pupil_l_bat_old.png",0);
	    break;
	case 19:
	    m.initTexture("js/models/pony/eyes/pupil_l_bat_stallion.png",0);
	    break;
	case 20:
	    m.initTexture("js/models/pony/eyes/pupil_l_bat_young.png",0);
	    break; 
	case 21:
	    m.initTexture("js/models/pony/eyes/pupil_l_chrysallis.png",0);
	    break;
	case 22:
	    m.initTexture("js/models/pony/eyes/pupil_l_crystal_filly.png",0);
	    break;
	case 23:
	    m.initTexture("js/models/pony/eyes/pupil_l_crystal_old.png",0);
	    break; 
	case 24:
	    m.initTexture("js/models/pony/eyes/pupil_l_crystal_stallion.png",0);
	    break;
	case 25:
	    m.initTexture("js/models/pony/eyes/pupil_l_crystal_young.png",0);
	    break; 
	case 26:
	    m.initTexture("js/models/pony/eyes/pupil_l_dragon.png",0);
	    break;
	case 27:
	    m.initTexture("js/models/pony/eyes/pupil_l_filly.png",0);
	    break; 
	case 28:
	    m.initTexture("js/models/pony/eyes/pupil_l_old.png",0);
	    break;
	case 29:
	    m.initTexture("js/models/pony/eyes/pupil_l_stallion.png",0);
	    break;
	case 30:
	    m.initTexture("js/models/pony/eyes/pupil_l_young.png",0);
	    break; 
	case 31:
	    m.initTexture("js/models/pony/eyes/snowdrop_pupil_2.png",0);
	    break;
	case 32:
	    m.initTexture("js/models/pony/eyes/dog_eye.png",0);
	    break; 
	case 33:
	    m.initTexture("js/models/pony/eyes/gummy_eye.png",0);
	    break;
	case 34:
		m.initTexture("js/models/pony/eyes/pupil_Rainbow.png",0);
	    break;
	case 35:
		m.initTexture("js/models/pony/eyes/nighmaremoon.png",0);
	    break;
	case 36:
		m.initTexture("js/models/pony/eyes/chrysalispupilfour_r.png",0);
	    break;
	case 37:
		m.initTexture("js/models/pony/eyes/mechaeye.png",0);
	    break;		
	}
	
	
}

function changeTexture1(value,inst){
	inst.tex1 = value;
	changeTexture1_inst(inst);
}

function changeBGTexture(value){
	var val = parseInt(value);
	bgNum = val;
	var m = bgModel;
	switch(val)
	{
	case 0:
		m.initTexture('./img/bg/blank.png',0);
		var str = "rgba(255,255,255,"+bgColorA+")";
		$('canvas').css("background", str);
		break;
	default:
		m.initTexture('./img/bg/bg'+value+'.png',0);
		var str = "rgba(255,255,255,1)";
		$('canvas').css("background", str);
	    break;	  
	}
}

function changeTexture1_inst(inst){
	var m = inst.model;
	if(m == tailModelArray[21]){ // rainbow dash tail (special)
		return;
	}
	if(m){
		if(inst.tex1 == 0){
			m.initTexture('./js/models/pony/blank.png',1);
		}
		else if(inst.tex1  == 1){
			m.initTexture('./js/models/pony/arc.png',1);
		}
	}
}


function changeTex1Sat(value,inst){
	inst.uHSV[1] = clamp(value,0.0,2.0);
}

function changeTex1Alpha(value,inst){
	inst.tex1alpha = clamp(value,0.0,1.0);
}

function changetex1MoveMode(value){
	tex1MoveMode = value;
}

function computeMorphsModel(model){
	if(!model) return;
	if(model.getLoadState() != 2) return;
	var mesh = model.mesh;
	
	var positions = new Array();
	for(var i=0;i<mesh.vertices.length;i++){
		var id = mesh.vertices[i].indexBS;
		mesh.vertices[i].position[0] = mesh.vertices[i].opos[0];
		mesh.vertices[i].position[1] = mesh.vertices[i].opos[1];
		mesh.vertices[i].position[2] = mesh.vertices[i].opos[2];
		var pos0 = mesh.vertices[i].position[0];
		var pos1 = mesh.vertices[i].position[1];
		var pos2 = mesh.vertices[i].position[2];
		var v = mesh.vertices[id];
		for(var j=0; j<v.morphID.length; j++){
			var k = v.morphID[j];
			pos0 += v.morphPosDiff[j][0] * pony.morphValue[k];
			pos1 += v.morphPosDiff[j][1] * pony.morphValue[k];
			pos2 += v.morphPosDiff[j][2] * pony.morphValue[k];
		}
		positions.push(pos0); 
		positions.push(pos1); 
		positions.push(pos2); 
		mesh.vertices[i].position[0] = pos0;
		mesh.vertices[i].position[1] = pos1;
		mesh.vertices[i].position[2] = pos2;
	}
	
	var normals = new Array();
	for(var i=0;i<mesh.vertices.length;i++){
		var id = mesh.vertices[i].indexBS;
		var n0 = mesh.vertices[i].normal[0];
		var n1 = mesh.vertices[i].normal[1];
		var n2 = mesh.vertices[i].normal[2];
		var v = mesh.vertices[id];
		for(var j=0; j<v.morphID.length; j++){
			var k = v.morphID[j];
			n0 += v.morphNormalDiff[j][0] * pony.morphValue[k];
			n1 += v.morphNormalDiff[j][1] * pony.morphValue[k];
			n2 += v.morphNormalDiff[j][2] * pony.morphValue[k];
		}
		normals.push(n0); 
		normals.push(n1); 
		normals.push(n2);
	}
	
	// recreate a new buffer which contains new positions and normals 
	if(model.VertexPositionBuffer) gl.deleteBuffer(model.VertexPositionBuffer);
	model.VertexPositionBuffer = gl.createBuffer(); 
    gl.bindBuffer(gl.ARRAY_BUFFER, model.VertexPositionBuffer); 
	gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(positions), gl.DYNAMIC_DRAW); 
	
	if(model.VertexNormalBuffer) gl.deleteBuffer(model.VertexNormalBuffer);
	model.VertexNormalBuffer = gl.createBuffer(); 
    gl.bindBuffer(gl.ARRAY_BUFFER, model.VertexNormalBuffer); 
	gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(normals), gl.DYNAMIC_DRAW);
}

function computeMorphs(){
	changePonyHeight(pony.height,false); 
	
	computeMorphsModel(pony.model);
	computeMorphsModel(tongue.model);
	computeMorphsModel(teeth.model);
	computeMorphsModel(eyelashes.model);

	// update stickers
	updateStickers();
}

function changeMorphValue(n,value){
	var val = parseFloat(value);
	val = clamp(val,-1.0,1.5);
	pony.morphValue[n] = value;
	computeMorphs();
}

function changeEar(value){
	var val = parseInt(value);
	switch(val)
	{
	case 0:
	  pony.morphValue[54] = 0;
	  pony.morphValue[55] = 0;
	  break;
	case 1:
	  pony.morphValue[54] = 1;
	  pony.morphValue[55] = 0;
	  break;
	case 2:
	  pony.morphValue[54] = 0;
	  pony.morphValue[55] = 1;
	  break;
	}
	computeMorphs();
}

function changeTeeth(value){
	var val = parseInt(value);
	switch(val)
	{
	case 1: // normal teeth
	  pony.morphValue[58] = 0;
	  break;
	case 2: // fangs
	  pony.morphValue[58] = 1;
	  break;
	}
	computeMorphs();
}

function changeFemaleBody(){
	if(pony.model.getLoadState() != 2) return; // no loaded

	gender = 0;
	pony.morphValue[51] = 0;
	pony.morphValue[52] = 0;
	changePonyHeight(pony.height,false);
	
	document.getElementById("femaleSign").className = 'stickerImgActive';
	document.getElementById("maleSign").className = 'stickerImgInactive';
	document.getElementById("longFaceSign").className = 'stickerImgInactive';
	
	computeMorphs();
	
}

function changeMaleBody(){
	if(pony.model.getLoadState() != 2) return; // no loaded

	gender = 1;
	pony.morphValue[51] = 1;
	pony.morphValue[52] = 0;
	changePonyHeight(pony.height,false);
	
	document.getElementById("femaleSign").className = 'stickerImgInactive';
	document.getElementById("maleSign").className = 'stickerImgActive';
	document.getElementById("longFaceSign").className = 'stickerImgInactive';
	
	computeMorphs();
	
}

function changeLongFace(){
	if(pony.model.getLoadState() != 2) return; // no loaded

	gender = 2;
	pony.morphValue[51] = 0;
	pony.morphValue[52] = 1;
	changePonyHeight(pony.height,false);
	
	document.getElementById("femaleSign").className = 'stickerImgInactive';
	document.getElementById("maleSign").className = 'stickerImgInactive';
	document.getElementById("longFaceSign").className = 'stickerImgActive';
	
	computeMorphs();
	
}
	
function computeBodyTexture(){

}
	
function changePonyHeight(value,bCustomPose){

	pony.height = value;
	var x = value;
	
	// Change the legs joints scale.
	if(pony.model.getLoadState() == 2){
		var sk = pony.model.skeleton;
		var ls = sk.joints[leftShoulderID];
		var rs = sk.joints[rightShoulderID];
		var lf = sk.joints[leftForearmID];
		var rf = sk.joints[rightForearmID];
		//var lt = sk.joints[leftThighID];
		//var rt = sk.joints[rightThighID];
		var rl1 = sk.joints[rightLeg1ID];
		var ll1 = sk.joints[leftLeg1ID];
		var tail1 = sk.joints[tail1ID];
		var neck = sk.joints[neckID];
		var head = sk.joints[headID];
		var pelvis = sk.joints[pelvisID];
		var chest1 = sk.joints[chest1ID];
		
		var shoulderScale = vec3.createFrom(1,1,1);
		var scale1 = vec3.createFrom(1,1,1);
		var pelvisScale = vec3.createFrom(0.85,0.85,0.85);
		var frontLegsScale = vec3.createFrom(0.93,0.71,1.06);
		var backLegsScale = vec3.createFrom(0.7,0.85,0.85);
		var neckScale = vec3.createFrom(0.75,0.75,0.75);
		var tailScale = vec3.createFrom(0.65,0.65,0.65);
		var headScale = vec3.createFrom(1.3,1.3,1.3);
		var chest1Scale = vec3.createFrom(1,1,1);
		
			
		if(pony.height < 0){
			// filly
			
			// f = ax + b
			for(var i=0; i<3; i++){
				pelvisScale[i] = x * (1-pelvisScale[i])/100 + 1;
				frontLegsScale[i] = x * (1-frontLegsScale[i])/100 + 1;
				backLegsScale[i] = x * (1-backLegsScale[i])/100 + 1;
				neckScale[i] = x * (1-neckScale[i])/100 + 1;
				tailScale[i] = x * (1-tailScale[i])/100 + 1;
				headScale[i] = x * (1-headScale[i])/100 + 1;
			}
		}
		else{
			// tall pony
			pelvisScale = vec3.createFrom(1,1,1);
			neckScale = vec3.createFrom(1,1,1);
			headScale = vec3.createFrom(1,1,1);
			frontLegsScale = vec3.createFrom(1.25,1.48,1.25);
			backLegsScale = vec3.createFrom(1.45,1.1,1.5);
			tailScale = vec3.createFrom(1.25,1.25,1.25);
		
			// f = ax + b
			for(var i=0; i<3; i++){
				pelvisScale[i] = x * (pelvisScale[i]-1)/100 + 1;
				frontLegsScale[i] = x * (frontLegsScale[i]-1)/100 + 1;
				backLegsScale[i] = x * (backLegsScale[i]-1)/100 + 1;
				neckScale[i] = x * (neckScale[i]-1)/100 + 1;
				tailScale[i] = x * (tailScale[i]-1)/100 + 1;
				headScale[i] = x * (headScale[i]-1)/100 + 1;
			}
		}
		
		if(gender == 1){
			 //male ponies have larger legs
			 shoulderScale[2] *= 1.2;
			 frontLegsScale[0] *= 1.2;
			 backLegsScale[2] *= 1.25;
 
		}
		neckScale[0] *= headSize[0];
		neckScale[1] *= headSize[1];
		neckScale[2] *= headSize[2];
		
		if(bCustomPose){
			// Compute custom frame only
			var f = customFrame;
			for(var j=0; j<pony.model.skeleton.joints.length; j++){
				var joint = pony.model.skeleton.joints[j];
				mat4.scale(joint.originalAnimMatrices[f],scale1,joint.animMatrices[f]);
			}
			mat4.scale(ls.originalAnimMatrices[f],shoulderScale,ls.animMatrices[f]);
			mat4.scale(rs.originalAnimMatrices[f],shoulderScale,rs.animMatrices[f]);
			mat4.scale(lf.originalAnimMatrices[f],frontLegsScale,lf.animMatrices[f]);
			mat4.scale(rf.originalAnimMatrices[f],frontLegsScale,rf.animMatrices[f]);
			mat4.scale(ll1.originalAnimMatrices[f],backLegsScale,ll1.animMatrices[f]);
			mat4.scale(rl1.originalAnimMatrices[f],backLegsScale,rl1.animMatrices[f]);
			
			mat4.scale(pelvis.originalAnimMatrices[f],pelvisScale,pelvis.animMatrices[f]);
			mat4.scale(tail1.originalAnimMatrices[f],tailScale,tail1.animMatrices[f]);
			mat4.scale(neck.originalAnimMatrices[f],neckScale,neck.animMatrices[f]);
			mat4.scale(head.originalAnimMatrices[f],headScale,head.animMatrices[f]);
			mat4.scale(chest1.originalAnimMatrices[f],chest1Scale,chest1.animMatrices[f]);
			
		} 
		else{
			// Compute all frames.
			for(var f=0; f<pony.model.skeleton.joints[0].animMatrices.length; f++){
				mat4.scale(ls.originalAnimMatrices[f],shoulderScale,ls.animMatrices[f]);
				mat4.scale(rs.originalAnimMatrices[f],shoulderScale,rs.animMatrices[f]);
				mat4.scale(lf.originalAnimMatrices[f],frontLegsScale,lf.animMatrices[f]);
				mat4.scale(rf.originalAnimMatrices[f],frontLegsScale,rf.animMatrices[f]);
				mat4.scale(ll1.originalAnimMatrices[f],backLegsScale,ll1.animMatrices[f]);
				mat4.scale(rl1.originalAnimMatrices[f],backLegsScale,rl1.animMatrices[f]);
				
				mat4.scale(pelvis.originalAnimMatrices[f],pelvisScale,pelvis.animMatrices[f]);
				mat4.scale(tail1.originalAnimMatrices[f],tailScale,tail1.animMatrices[f]);
				mat4.scale(neck.originalAnimMatrices[f],neckScale,neck.animMatrices[f]);
				mat4.scale(head.originalAnimMatrices[f],headScale,head.animMatrices[f]);
				mat4.scale(chest1.originalAnimMatrices[f],chest1Scale,chest1.animMatrices[f]);
				
				pony.model.skeleton.computeFrame(f);
			}
		}
		
	}
	
}

function changeHornSize(value){

	horn.height = value;
	var x = value;
	if(!horn.model) return;
	if(horn.model.getLoadState() == 2){
		var hornJoint = horn.model.skeleton.joints[1];
		
		var hornScale = vec3.createFrom(0.5,1,1);
			
		if(horn.height < 0){
			// f = ax + b
			for(var i=0; i<3; i++){
				hornScale[i] = x * (1-hornScale[i])/100 + 1;
			}
		}
		else{
			
			hornScale = vec3.createFrom(1.5,1,1);
			
			// f = ax + b
			for(var i=0; i<3; i++){
				hornScale[i] = x * (hornScale[i]-1)/100 + 1;
			}
		}
		// alicorn horns are too long, scale them down.
		if(horn.id == 2) hornScale[0] = hornScale[0]*0.5; 
		
		// Compute frame 0.

		mat4.scale(hornJoint.originalAnimMatrices[0],hornScale,hornJoint.animMatrices[0]);
		horn.model.skeleton.computeFrame(0);
		
	}
	
}

function changeInstWingSize(inst,value){
	/*inst.height = value;
	var x = value;
	if(!inst.model) return;
	if(inst.model.getLoadState() == 2){
		var wingJoint = inst.model.skeleton.joints[1];
		var s = vec3.createFrom(x,x,x);
		for(var f=0; f<wingJoint.originalAnimMatrices.length; f++){
			mat4.scale(wingJoint.originalAnimMatrices[f],s,wingJoint.animMatrices[f]);
			inst.model.skeleton.computeFrame(f);
		}
	}*/
}

function changeLeftWingSize(value){
	leftWing.height = value;
}

function changeRightWingSize(value){
	rightWing.height = value;
}

function changeTailSize(value){
	tail.height = value;
}

var enableEyeMovement = document.getElementById("enableEyeMovement");
enableEyeMovement.onclick = function() {
	bMoveIrisesWithMouse = enableEyeMovement.checked;
}

var matchEyesColorID = document.getElementById("matchEyesColor");
matchEyesColorID.onclick = function() {
	bMatchEyesColor = matchEyesColorID.checked;
}

var matchEyesStyleID = document.getElementById("matchEyesStyle");
matchEyesStyleID.onclick = function() {
	bMatchEyesStyle = matchEyesStyleID.checked;
}

var matchManeTailColorID = document.getElementById("matchManeTailColor");
matchManeTailColorID.onclick = function() {
	bMatchManeTailColor = matchManeTailColorID.checked;
}



// eye size
var slEye = document.getElementById("slEye");
slEye.onchange = function() {
	leftEye.uvScale = clamp(this.value,0.5,2.0);
}

var srEye = document.getElementById("srEye");
srEye.onchange = function() {
	rightEye.uvScale = clamp(this.value,0.5,2.0);
}

// translation x for left eye
var txlEye = document.getElementById("txlEye");
txlEye.onchange = function() {
	leftEye.uvT[0] = clamp(this.value,-0.5,0.5);
}

// translation y for left eye
var tylEye = document.getElementById("tylEye");
tylEye.onchange = function() {
	leftEye.uvT[1] = clamp(this.value,-0.5,0.5);
}

// translation x for right eye
var txrEye = document.getElementById("txrEye");
txrEye.onchange = function() {
	rightEye.uvT[0] = clamp(this.value,-0.5,0.5);
}

// translation y for right eye
var tyrEye = document.getElementById("tyrEye");
tyrEye.onchange = function() {
	rightEye.uvT[1] = clamp(this.value,-0.5,0.5);
}



function hexToRgb(hex) {
    // Expand shorthand form (e.g. "03F") to full form (e.g. "0033FF")
    var shorthandRegex = /^#?([a-f\d])([a-f\d])([a-f\d])$/i;
    hex = hex.replace(shorthandRegex, function(m, r, g, b) {
        return r + r + g + g + b + b;
    });

    var result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
    return result ? {
        r: parseInt(result[1], 16),
        g: parseInt(result[2], 16),
        b: parseInt(result[3], 16)
    } : null;
}

//function rgbToHex(rgb){}

var bodyColor1 = document.getElementById("bodyColor1");
bodyColor1.onchange = function() {
	// change the body color, as well as horn and wings
	var rgb = hexToRgb(this.value);
	if(rgb){
		pony.firstColor = [rgb.r/255.0,rgb.g/255.0,rgb.b/255.0,1.0];
		//horn.firstColor = [rgb.r/255.0,rgb.g/255.0,rgb.b/255.0,1.0];
		//leftWing.firstColor = [rgb.r/255.0,rgb.g/255.0,rgb.b/255.0,1.0];
		//rightWing.firstColor = [rgb.r/255.0,rgb.g/255.0,rgb.b/255.0,1.0];
	}
}

var bodyColor2 = document.getElementById("bodyColor2");
bodyColor2.onchange = function() {
	var rgb = hexToRgb(this.value);
	if(rgb){
		pony.secondColor = [rgb.r/255.0,rgb.g/255.0,rgb.b/255.0,1.0];
	}
}

var bodyColor3 = document.getElementById("bodyColor3");
bodyColor3.onchange = function() {
	var rgb = hexToRgb(this.value);
	if(rgb){
		pony.thirdColor = [rgb.r/255.0,rgb.g/255.0,rgb.b/255.0,1.0];
	}
}


var leftEyeColor = document.getElementById("leftEyeColor");
var rightEyeColor = document.getElementById("rightEyeColor");
var leftEyeColor2 = document.getElementById("leftEyeColor2");
var rightEyeColor2 = document.getElementById("rightEyeColor2");

leftEyeColor.onchange = function() {
	// divided by 6 for a [0 - 1] range 
	// my eye texture colors are yellow, so I subtract offsetHueEye
	// in order to have a red color for hue = 0
	leftEye.hsv[0] = this.color.hsv[0]/6.0-offsetHueEye;
	leftEye.hsv[1] = this.color.hsv[1] * scaleSatEye;
	leftEye.hsv[2] = this.color.hsv[2] * scaleValueEye;
	if(bMatchEyesColor){
		rightEye.hsv[0] = this.color.hsv[0]/6.0-offsetHueEye;
		rightEye.hsv[1] = this.color.hsv[1] * scaleSatEye;
		rightEye.hsv[2] = this.color.hsv[2] * scaleValueEye;
		// udpate input text and color
		rightEyeColor.color.fromString(this.value);
	}
}

rightEyeColor.onchange = function() {
	rightEye.hsv[0] = this.color.hsv[0]/6.0-offsetHueEye;
	rightEye.hsv[1] = this.color.hsv[1] * scaleSatEye;
	rightEye.hsv[2] = this.color.hsv[2] * scaleValueEye;
	if(bMatchEyesColor){
		leftEye.hsv[0] = this.color.hsv[0]/6.0-offsetHueEye;
		leftEye.hsv[1] = this.color.hsv[1] * scaleSatEye;
		leftEye.hsv[2] = this.color.hsv[2] * scaleValueEye;
		// udpate input text and color
		leftEyeColor.color.fromString(this.value);
	}
}

leftEyeColor2.onchange = function() {
	leftEye.firstColor[0] = this.color.rgb[0];
	leftEye.firstColor[1] = this.color.rgb[1];
	leftEye.firstColor[2] = this.color.rgb[2];
	if(bMatchEyesColor){
		rightEye.firstColor[0] = this.color.rgb[0];
		rightEye.firstColor[1] = this.color.rgb[1];
		rightEye.firstColor[2] = this.color.rgb[2];
		rightEyeColor2.color.fromString(this.value);
	}
}

rightEyeColor2.onchange = function() {
	rightEye.firstColor[0] = this.color.rgb[0];
	rightEye.firstColor[1] = this.color.rgb[1];
	rightEye.firstColor[2] = this.color.rgb[2];
	if(bMatchEyesColor){
		leftEye.firstColor[0] = this.color.rgb[0];
		leftEye.firstColor[1] = this.color.rgb[1];
		leftEye.firstColor[2] = this.color.rgb[2];
		leftEyeColor2.color.fromString(this.value);
	}
}

var changeManeTailColor1 = function(s){
		var r = s.color.rgb[0];
		var g = s.color.rgb[1];
		var b = s.color.rgb[2];
		
		tail.firstColor[0] = r;
		tail.firstColor[1] = g;
		tail.firstColor[2] = b;
		
		hairBack.firstColor[0] = r;
		hairBack.firstColor[1] = g;
		hairBack.firstColor[2] = b;
		
		hairFront.firstColor[0] = r;
		hairFront.firstColor[1] = g;
		hairFront.firstColor[2] = b;
		
		hairExtra.firstColor[0] = r;
		hairExtra.firstColor[1] = g;
		hairExtra.firstColor[2] = b;
		
		// udpate input text and color
		tailColor1.color.fromString(s.value);
		hairFrontColor1.color.fromString(s.value);
		hairBackColor1.color.fromString(s.value);
}

var changeManeTailColor2 = function(s){
		var r = s.color.rgb[0];
		var g = s.color.rgb[1];
		var b = s.color.rgb[2];
		
		tail.secondColor[0] = r;
		tail.secondColor[1] = g;
		tail.secondColor[2] = b;
		
		hairBack.secondColor[0] = r;
		hairBack.secondColor[1] = g;
		hairBack.secondColor[2] = b;
		
		hairFront.secondColor[0] = r;
		hairFront.secondColor[1] = g;
		hairFront.secondColor[2] = b;
		
		hairExtra.secondColor[0] = r;
		hairExtra.secondColor[1] = g;
		hairExtra.secondColor[2] = b;
		
		// udpate input text and color
		tailColor2.color.fromString(s.value);
		hairFrontColor2.color.fromString(s.value);
		hairBackColor2.color.fromString(s.value);
}

var changeManeTailColor3 = function(s){
		var r = s.color.rgb[0];
		var g = s.color.rgb[1];
		var b = s.color.rgb[2];
		
		tail.thirdColor[0] = r;
		tail.thirdColor[1] = g;
		tail.thirdColor[2] = b;
		
		hairBack.thirdColor[0] = r;
		hairBack.thirdColor[1] = g;
		hairBack.thirdColor[2] = b;
		
		hairFront.thirdColor[0] = r;
		hairFront.thirdColor[1] = g;
		hairFront.thirdColor[2] = b;
		
		hairExtra.thirdColor[0] = r;
		hairExtra.thirdColor[1] = g;
		hairExtra.thirdColor[2] = b;
		
		// udpate input text and color
		tailColor3.color.fromString(s.value);
		hairFrontColor3.color.fromString(s.value);
		hairBackColor3.color.fromString(s.value);
}


hairFrontColor1.onchange = function() {
	if(bMatchManeTailColor){
		changeManeTailColor1(this);
	}
	// else works too
	hairFront.firstColor[0] = this.color.rgb[0];
	hairFront.firstColor[1] = this.color.rgb[1];
	hairFront.firstColor[2] = this.color.rgb[2];
	
	hairExtra.firstColor[0] = this.color.rgb[0];
	hairExtra.firstColor[1] = this.color.rgb[1];
	hairExtra.firstColor[2] = this.color.rgb[2];
	
}


hairFrontColor2.onchange = function() {
	if(bMatchManeTailColor){
		changeManeTailColor2(this);
	}
	hairFront.secondColor[0] = this.color.rgb[0];
	hairFront.secondColor[1] = this.color.rgb[1];
	hairFront.secondColor[2] = this.color.rgb[2];
	
	hairExtra.secondColor[0] = this.color.rgb[0];
	hairExtra.secondColor[1] = this.color.rgb[1];
	hairExtra.secondColor[2] = this.color.rgb[2];

}

hairFrontColor3.onchange = function() {
	if(bMatchManeTailColor){
		changeManeTailColor3(this);
	}
	hairFront.thirdColor[0] = this.color.rgb[0];
	hairFront.thirdColor[1] = this.color.rgb[1];
	hairFront.thirdColor[2] = this.color.rgb[2];

	hairExtra.thirdColor[0] = this.color.rgb[0];
	hairExtra.thirdColor[1] = this.color.rgb[1];
	hairExtra.thirdColor[2] = this.color.rgb[2];
	
}

hairBackColor1.onchange = function() {
	hairBack.firstColor[0] = this.color.rgb[0];
	hairBack.firstColor[1] = this.color.rgb[1];
	hairBack.firstColor[2] = this.color.rgb[2];
	
	if(bMatchManeTailColor){
		changeManeTailColor1(this);
	}
}

hairBackColor2.onchange = function() {
	hairBack.secondColor[0] = this.color.rgb[0];
	hairBack.secondColor[1] = this.color.rgb[1];
	hairBack.secondColor[2] = this.color.rgb[2];
	
	if(bMatchManeTailColor){
		changeManeTailColor2(this);
	}
}

hairBackColor3.onchange = function() {
	hairBack.thirdColor[0] = this.color.rgb[0];
	hairBack.thirdColor[1] = this.color.rgb[1];
	hairBack.thirdColor[2] = this.color.rgb[2];
	
	if(bMatchManeTailColor){
		changeManeTailColor3(this);
	}
}

tailColor1.onchange = function() {
	tail.firstColor[0] = this.color.rgb[0];
	tail.firstColor[1] = this.color.rgb[1];
	tail.firstColor[2] = this.color.rgb[2];
	
	if(bMatchManeTailColor){
		changeManeTailColor1(this);
	}
}

tailColor2.onchange = function() {
	tail.secondColor[0] = this.color.rgb[0];
	tail.secondColor[1] = this.color.rgb[1];
	tail.secondColor[2] = this.color.rgb[2];
	
	if(bMatchManeTailColor){
		changeManeTailColor2(this);
	}
}

tailColor3.onchange = function() {
	tail.thirdColor[0] = this.color.rgb[0];
	tail.thirdColor[1] = this.color.rgb[1];
	tail.thirdColor[2] = this.color.rgb[2];
	
	if(bMatchManeTailColor){
		changeManeTailColor3(this);
	}
}

wingsColor1.onchange = function() {
	leftWing.firstColor[0] = this.color.rgb[0];
	leftWing.firstColor[1] = this.color.rgb[1];
	leftWing.firstColor[2] = this.color.rgb[2];
	rightWing.firstColor[0] = this.color.rgb[0];
	rightWing.firstColor[1] = this.color.rgb[1];
	rightWing.firstColor[2] = this.color.rgb[2];
}

wingsColor2.onchange = function() {
	leftWing.secondColor[0] = this.color.rgb[0];
	leftWing.secondColor[1] = this.color.rgb[1];
	leftWing.secondColor[2] = this.color.rgb[2];
	rightWing.secondColor[0] = this.color.rgb[0];
	rightWing.secondColor[1] = this.color.rgb[1];
	rightWing.secondColor[2] = this.color.rgb[2];
}

wingsColor3.onchange = function() {
	leftWing.thirdColor[0] = this.color.rgb[0];
	leftWing.thirdColor[1] = this.color.rgb[1];
	leftWing.thirdColor[2] = this.color.rgb[2];
	rightWing.thirdColor[0] = this.color.rgb[0];
	rightWing.thirdColor[1] = this.color.rgb[1];
	rightWing.thirdColor[2] = this.color.rgb[2];
}

hornColor1.onchange = function() {
	horn.firstColor[0] = this.color.rgb[0];
	horn.firstColor[1] = this.color.rgb[1];
	horn.firstColor[2] = this.color.rgb[2];
}

hornColor2.onchange = function() {
	horn.secondColor[0] = this.color.rgb[0];
	horn.secondColor[1] = this.color.rgb[1];
	horn.secondColor[2] = this.color.rgb[2];
}



/*
var clothColor1 = document.getElementById("cloth1Color1");
var clothColor2 = document.getElementById("cloth1Color2");
var clothColor3 = document.getElementById("cloth1Color3");

function changeCloth1(value){
	loadModel(clothModelArray[value],true);
	cloth1.model = clothModelArray[value];
}

cloth1Color1.onchange = function() {
	var rgb = hexToRgb(this.value);
	if(rgb){
		cloth1.firstColor =  [rgb.r/255.0,rgb.g/255.0,rgb.b/255.0,1.0];
	}
}

cloth1Color2.onchange = function() {
	var rgb = hexToRgb(this.value);
	if(rgb){
		cloth1.secondColor =  [rgb.r/255.0,rgb.g/255.0,rgb.b/255.0,1.0];
	}
}

cloth1Color3.onchange = function() {
	var rgb = hexToRgb(this.value);
	if(rgb){
		cloth1.thirdColor =  [rgb.r/255.0,rgb.g/255.0,rgb.b/255.0,1.0];
	}
}
*/

var collar1Color1 = document.getElementById("collar1Color1");
var collar1Color2 = document.getElementById("collar1Color2");
var collar1Color3 = document.getElementById("collar1Color3");

function changeCollar1Model(value) {
	collar1.model = collarModelArray[value];
	loadModel(collarModelArray[value],true);
}

collar1Color1.onchange = function() {
	collar1.firstColor[0] = this.color.rgb[0];
	collar1.firstColor[1] = this.color.rgb[1];
	collar1.firstColor[2] = this.color.rgb[2];
}

collar1Color2.onchange = function() {
	collar1.secondColor[0] = this.color.rgb[0];
	collar1.secondColor[1] = this.color.rgb[1];
	collar1.secondColor[2] = this.color.rgb[2];
}

collar1Color3.onchange = function() {
	collar1.thirdColor[0] = this.color.rgb[0];
	collar1.thirdColor[1] = this.color.rgb[1];
	collar1.thirdColor[2] = this.color.rgb[2];
}


var headgear1Color1 = document.getElementById("headgear1Color1");
var headgear1Color2 = document.getElementById("headgear1Color2");
var headgear1Color3 = document.getElementById("headgear1Color3");

function changeHeadgear1Model(value) {
	headgear1.model = headgearModelArray[value];
	loadModel(headgearModelArray[value],true);
}

headgear1Color1.onchange = function() {
	headgear1.firstColor[0] = this.color.rgb[0];
	headgear1.firstColor[1] = this.color.rgb[1];
	headgear1.firstColor[2] = this.color.rgb[2];
}

headgear1Color2.onchange = function() {
	headgear1.secondColor[0] = this.color.rgb[0];
	headgear1.secondColor[1] = this.color.rgb[1];
	headgear1.secondColor[2] = this.color.rgb[2];
}

headgear1Color3.onchange = function() {
	headgear1.thirdColor[0] = this.color.rgb[0];
	headgear1.thirdColor[1] = this.color.rgb[1];
	headgear1.thirdColor[2] = this.color.rgb[2];
}


var headband0Color1 = document.getElementById("headband0Color1");
var headband0Color2 = document.getElementById("headband0Color2");
var headband0Color3 = document.getElementById("headband0Color3");
var headband1Color1 = document.getElementById("headband1Color1");
var headband1Color2 = document.getElementById("headband1Color2");
var headband1Color3 = document.getElementById("headband1Color3");

function changeHeadband0Model(value) {
	headbandA[0].model = headbandModelArray[value];
	loadModel(headbandModelArray[value],true);
	
}

function changeHeadband1Model(value) {
	loadModel(glassesArray[value],true);
	headbandA[1].model = glassesArray[value];
}

headband0Color1.onchange = function() {
	headbandA[0].firstColor[0] = this.color.rgb[0];
	headbandA[0].firstColor[1] = this.color.rgb[1];
	headbandA[0].firstColor[2] = this.color.rgb[2];
}

headband0Color2.onchange = function() {
	headbandA[0].secondColor[0] = this.color.rgb[0];
	headbandA[0].secondColor[1] = this.color.rgb[1];
	headbandA[0].secondColor[2] = this.color.rgb[2];
}

headband0Color3.onchange = function() {
	headbandA[0].thirdColor[0] = this.color.rgb[0];
	headbandA[0].thirdColor[1] = this.color.rgb[1];
	headbandA[0].thirdColor[2] = this.color.rgb[2];
}

headband1Color1.onchange = function() {
	headbandA[1].firstColor[0] = this.color.rgb[0];
	headbandA[1].firstColor[1] = this.color.rgb[1];
	headbandA[1].firstColor[2] = this.color.rgb[2];
}

headband1Color2.onchange = function() {
	headbandA[1].secondColor[0] = this.color.rgb[0];
	headbandA[1].secondColor[1] = this.color.rgb[1];
	headbandA[1].secondColor[2] = this.color.rgb[2];
}

headband1Color3.onchange = function() {
	headbandA[1].thirdColor[0] = this.color.rgb[0];
	headbandA[1].thirdColor[1] = this.color.rgb[1];
	headbandA[1].thirdColor[2] = this.color.rgb[2];
}


function changeAccessoryModel(value,i) {
	loadModel(accessoriesModelArray[value],true);
	accessories[i].model = accessoriesModelArray[value];
	accessories[i].jointID = accessories[i].model.jointID; // change this line for the new accssory system
}

var changeAccessoryColor1 = function(self,i) {
	accessories[i].firstColor[0] = self.color.rgb[0];
	accessories[i].firstColor[1] = self.color.rgb[1];
	accessories[i].firstColor[2] = self.color.rgb[2];
}

var changeAccessoryColor2 = function(self,i) {
	accessories[i].secondColor[0] = self.color.rgb[0];
	accessories[i].secondColor[1] = self.color.rgb[1];
	accessories[i].secondColor[2] = self.color.rgb[2];
}

var changeAccessoryColor3 = function(self,i) {
	accessories[i].thirdColor[0] = self.color.rgb[0];
	accessories[i].thirdColor[1] = self.color.rgb[1];
	accessories[i].thirdColor[2] = self.color.rgb[2];
}



// ******************************************
// **            LOAD AND SAVE             **
// ******************************************


var loadSaveDiv = document.getElementById("contenu_4");

function loadLocalStorage(){
	if(typeof(Storage)!=="undefined")
	{
		// localStorage and sessionStorage support!
		for(var i=1; i<saveLimit+1; i++){
			var key = "ponySave" + i;
			if (localStorage.getItem(key) !== null){
				var ponyData = JSON.parse(localStorage.getItem(key));
				CreateWrapSaveDiv(i,ponyData);
			}
		}
		
		if(localStorage.length >= saveLimit){
			// disable save new pony button
			document.getElementById("buttonSaveNewPony").disabled = true;
		}
	}
}

function PonyData(){
	// used to retrieve data from the local storage
	
	function PonySaveSticker(_sticker){
		this.id = _sticker.id;
		this.htmlid = _sticker.htmlid;
		this.display = _sticker.display;
		this.src = _sticker.src;
		//this.uv = _sticker.uv; // auto-calculated since 1.0.4
		this.angle = _sticker.angle;
		this.uscale = _sticker.uscale;
		this.vscale = _sticker.vscale;
		this.ut = _sticker.ut;
		this.vt = _sticker.vt;
		this.reverse = _sticker.reverse;
		this.triID = _sticker.triID;
		//this.triIDs = _sticker.triIDs; // auto-calculated since 1.0.4
		//this.vertIDs = _sticker.vertIDs; // auto-calculated since 1.0.4
	}
	
	// version
	this.version = 1.19;
	
	// the name of the pony
	this.ponyName = document.getElementById("ponyName").value;
	
	this.ponySaveDate = Date.now();
	
	// Data url of a mini screenshot (160*120) of the pony
	this.miniScreenshot = 0;
	
	// style and color of mane, tail, accessories, etc
	this.bodyColorStyle = document.getElementById("bodyColorStyleSelect").value;
	this.bodyColor1 = pony.firstColor;
	this.bodyColor2 = pony.secondColor;
	this.bodyColor3 = pony.thirdColor;
	
	this.lEyeSelect = document.getElementById("lEyeSelect").value;
	this.rEyeSelect = document.getElementById("rEyeSelect").value;
	this.leftEyeHSV = leftEye.hsv;
	this.rightEyeHSV = rightEye.hsv;
	this.leftEyeColor1 = leftEye.firstColor;
	this.rightEyeColor1 = rightEye.firstColor;
	this.leftEyeScale = leftEye.uvScale;
	this.rightEyeScale = rightEye.uvScale;
	this.lEyeTx = leftEye.uvT[0];
	this.lEyeTy = leftEye.uvT[1];
	this.rEyeTx = rightEye.uvT[0];
	this.rEyeTy = rightEye.uvT[1];
	
	this.hairFrontStyle = hairFront.model ? hairFront.model.id : 0;
	this.hairFrontColor1 = hairFront.firstColor;
	this.hairFrontColor2 = hairFront.secondColor;
	this.hairFrontColor3 = hairFront.thirdColor;
	
	this.hairBackStyle = hairBack.model ? hairBack.model.id : 0;
	this.hairBackColor1 = hairBack.firstColor;
	this.hairBackColor2 = hairBack.secondColor;
	this.hairBackColor3 = hairBack.thirdColor;
	
	this.hairExtratyle = hairExtra.model ? hairExtra.model.id : 0;
	this.hairExtraColor1 = hairExtra.firstColor;
	this.hairExtraColor2 = hairExtra.secondColor;
	this.hairExtraColor3 = hairExtra.thirdColor;
	
	this.tailStyle = tail.model ? tail.model.id : 0;
	this.tailColor1 = tail.firstColor;
	this.tailColor2 = tail.secondColor;
	this.tailColor3 = tail.thirdColor;
	
	this.hornStyle = horn.model ? horn.model.id : 0;
	this.hornColor1 = horn.firstColor;
	this.hornColor2 = horn.secondColor;
	this.hornColor3 = horn.thirdColor;
	
	this.leftWingStyle = leftWing.model ? leftWing.model.id : 0;
	this.leftWingColor1 = leftWing.firstColor;
	this.leftWingColor2 = leftWing.secondColor;
	this.leftWingColor3 = leftWing.thirdColor;
	
	this.rightWingStyle = rightWing.model ? rightWing.model.id : 0;
	this.rightWingColor1 = rightWing.firstColor;
	this.rightWingColor2 = rightWing.secondColor;
	this.rightWingColor3 = rightWing.thirdColor;
	
	this.collar1Style = collar1.model ? collar1.model.id : 0;
	this.collar1Color1 = collar1.firstColor;
	this.collar1Color2 = collar1.secondColor;
	this.collar1Color3 = collar1.thirdColor;
	
	this.headgear1Style = headgear1.model ? headgear1.model.id : 0;
	this.headgear1Color1 = headgear1.firstColor;
	this.headgear1Color2 = headgear1.secondColor;
	this.headgear1Color3 = headgear1.thirdColor;
	
	this.headbandAlength = headbandA.length;
	this.headbandAStyle = new Array(headbandA.length);
	this.headbandAColor1 = new Array(headbandA.length);
	this.headbandAColor2 = new Array(headbandA.length);
	this.headbandAColor3 = new Array(headbandA.length);
	for(var i=0; i<headbandA.length; i++){
		var _headbandA = headbandA[i];
		this.headbandAStyle[i] = _headbandA.model ? _headbandA.model.id : 0;
		this.headbandAColor1[i] = _headbandA.firstColor;
		this.headbandAColor2[i] = _headbandA.secondColor;
		this.headbandAColor3[i] = _headbandA.thirdColor;
	}
	
	this.accLength = accessories.length;
	this.accStyle = new Array(accessories.length);
	this.accColor1 = new Array(accessories.length);
	this.accColor2 = new Array(accessories.length);
	this.accColor3 = new Array(accessories.length);
	for(var i=0; i<accessories.length; i++){
		var _acc = accessories[i];
		this.accStyle[i] = _acc.model ? _acc.model.id : 0;
		this.accColor1[i] = _acc.firstColor;
		this.accColor2[i] = _acc.secondColor;
		this.accColor3[i] = _acc.thirdColor;
	}
	
	this.tongueStyle = tongue.model ? tongue.model.id : 0;
	this.tongueColor1 = tongue.firstColor;
	this.tongueColor2 = tongue.secondColor;
	this.tongueColor3 = tongue.thirdColor;
	
	this.teethStyle = teeth.model ? teeth.model.id : 0;
	this.teethColor1 = teeth.firstColor;
	this.teethColor2 = teeth.secondColor;
	this.teethColor3 = teeth.thirdColor;
	
	this.eyelashesStyle = eyelashes.model ? eyelashes.model.id : 0;
	this.eyelashesColor1 = eyelashes.firstColor;
	this.eyelashesColor2 = eyelashes.secondColor;
	this.eyelashesColor3 = eyelashes.thirdColor;
	
	// morph
	this.morphValue = new Array();
	for(var j=0; j<morphNumber; j++){ 
		var val = pony.morphValue[j];
		this.morphValue.push(val);
	}
	
	// stickers
	this.stickerNumber = stickerNumber;
	this.sticker = new Array();
	for(var i=0; i<stickerNumber; i++){
		var _sticker = pony.model.sticker[i];
		this.sticker[i] = new PonySaveSticker(_sticker);
	}
	
	// cutie mark
	this.cutieMark = document.getElementById("cutieMarkSelect").value;
	this.custom_l_CM_angle = pony.model.lCutieMark.angle;
	this.custom_l_CM_uscale = pony.model.lCutieMark.uscale;
	this.custom_l_CM_vscale = pony.model.lCutieMark.vscale;
	this.custom_l_CM_reverse = pony.model.lCutieMark.reverse;
	this.custom_r_CM_angle = pony.model.rCutieMark.angle;
	this.custom_r_CM_uscale = pony.model.rCutieMark.uscale;
	this.custom_r_CM_vscale = pony.model.rCutieMark.vscale;
	this.custom_r_CM_reverse = pony.model.rCutieMark.reverse;
	this.custom_l_CM_ut = pony.model.lCutieMark.ut;
	this.custom_l_CM_vt = pony.model.lCutieMark.vt;
	this.custom_r_CM_ut = pony.model.rCutieMark.ut;
	this.custom_r_CM_vt = pony.model.rCutieMark.vt;
	
	// pony height
	this.ponyHeight = pony.height;
	
	// horn, wing, tail, head size
	this.hornHeight = horn.height;
	this.leftWingHeight = leftWing.height;
	this.rightWingHeight = rightWing.height;
	this.tailWingHeight = tail.height; 
	this.headSize = headSize;
	
	// custom pose
	this.jointRotateDegrees = new Array(); // vec3
	for(var i=0; i<pony.model.skeleton.joints.length; i++){
		this.jointRotateDegrees.push(vec3.create(pony.model.skeleton.joints[i].rotateDegrees));
	}
	
	this.tailjointRotateDegrees = new Array(); // vec3
	if(tail.model){
		for(var i=0; i<tail.model.skeleton.joints.length; i++){
			this.tailjointRotateDegrees.push(vec3.create(tail.model.skeleton.joints[i].rotateDegrees));
		}
	}
	
	this.lwingjointRotateDegrees = new Array(); // vec3
	if(leftWing.model){
		for(var i=0; i<leftWing.model.skeleton.joints.length; i++){
			this.lwingjointRotateDegrees.push(vec3.create(leftWing.model.skeleton.joints[i].rotateDegrees));
		}
	}
	
	this.rwingjointRotateDegrees = new Array(); // vec3
	if(rightWing.model){
		for(var i=0; i<rightWing.model.skeleton.joints.length; i++){
			this.rwingjointRotateDegrees.push(vec3.create(rightWing.model.skeleton.joints[i].rotateDegrees));
		}
	}

	// animation
	this.animation = document.getElementById("animationSelect").value;
	
	// gender
	this.gender = gender; //0 = female, 1 = male, 2 = long face
	
	// lightning
	var l0a = lightArray[0].ambiant;
	var l0d = lightArray[0].diffuse;
	var l0s = lightArray[0].specular;
	this.light0A = vec3.createFrom(l0a[0],l0a[1],l0a[2]);
	this.light0D = vec3.createFrom(l0d[0],l0d[1],l0d[2]);
	this.light0S = vec3.createFrom(l0s[0],l0s[1],l0s[2]);
	this.ponyShininess = pony.shininess;
	
	
	// extra
	this.hairFront_uHSV = hairFront.uHSV;
	this.hairFront_tex1 = hairFront.tex1;
	this.hairFront_tex1alpha = hairFront.tex1alphatex1alpha;
	this.hairBack_uHSV = hairBack.uHSV;
	this.hairBack_tex1 = hairBack.tex1;
	this.hairBack_tex1alpha = hairBack.tex1alphatex1alpha;
	this.tail_uHSV = tail.uHSV;
	this.tail_tex1 = tail.tex1;
	this.tail_tex1alpha = tail.tex1alphatex1alpha;
	this.horn_uHSV = horn.uHSV;
	this.horn_tex1 = horn.tex1;
	this.horn_tex1alpha = horn.tex1alphatex1alpha;
	this.leftWing_uHSV = leftWing.uHSV;
	this.leftWing_tex1 = leftWing.tex1;
	this.leftWing_tex1alpha = leftWing.tex1alphatex1alpha;
	this.rightWing_uHSV = rightWing.uHSV;
	this.rightWing_tex1 = rightWing.tex1;
	this.rightWing_tex1alpha = rightWing.tex1alphatex1alpha;
	
	// ear
	this.earSelect = document.getElementById("earSelect").value; 
	
	// teeth / fangs
	this.teethSelect = document.getElementById("teethSelect").value; 
	
	// background
	this.bgSelect = document.getElementById("bgSelect").value;
	this.bgColorR = bgColorR;
	this.bgColorG = bgColorG;
	this.bgColorB = bgColorB;
	this.bgColorA = bgColorA;
}

function generatePonyData(miniScreenshot){
	var ponyData = new PonyData();
	ponyData.miniScreenshot = miniScreenshot;
	return ponyData;
}

function saveNewPony(){
	if(typeof(Storage)!=="undefined")
	{
		// localStorage and sessionStorage support!
		takeScreenshot();
		setTimeout(_saveNewPony, 20); 
	}
	else
	{
		// to do, error message, pony can't be saved.
	}
}

function _saveNewPony(){
	if(bTakeScreenshot){
		// wait for the screenshot to be ready
		// (wait for the draw buffer)
		setTimeout(_saveNewPony, 20); 
		return;
	}

	if(localStorage.length >= saveLimit){
		return; // should never happen if the button is disaled.
	}

	// resize screenshot with an off-screen canvas
    var miniScreenshot = 0;
	var tmpimg = new Image();
	tmpimg.src = screenshot;
	tmpimg.onload = function () {

		var tmpcanvas = document.createElement('canvas');
		tmpcanvas.width = 160;
		tmpcanvas.height = 120;
		var tmpctx = tmpcanvas.getContext('2d');
		tmpctx.drawImage(this, 0, 0, 160, 120);
		miniScreenshot = tmpcanvas.toDataURL("image/png");
		saveNewPony2(miniScreenshot);
	}
}


	
function CreateWrapSaveDiv(i,ponyData){
	// Create a new div which contains the new save.
	var wrapDiv = document.createElement("div");
	wrapDiv.id = "saveWrap" + i;
	wrapDiv.className = "save-wrap";
	loadSaveDiv.appendChild(wrapDiv);
	
	var leftDiv = document.createElement("div");
	leftDiv.className = "save-left-col";
	wrapDiv.appendChild(leftDiv);

	var spanName = document.createElement("span");
	spanName.innerHTML = ponyData.ponyName;
	leftDiv.appendChild(spanName);
	leftDiv.appendChild(document.createElement("br"));
	
	var d = new Date(ponyData.ponySaveDate);
	var strDate = [d.getDate(), d.getMonth()+1, d.getFullYear()].join('/');
	var spanDate = document.createElement("span");
	spanDate.innerHTML = strDate;
	leftDiv.appendChild(spanDate);
	leftDiv.appendChild(document.createElement("br"));
	
	var loadButton = document.createElement("input");
	loadButton.type="button";
	loadButton.dataset.num = i;
	loadButton.value=" << Load pony" 
	loadButton.onclick = function() {
		loadPony(i);
	}
	leftDiv.appendChild(loadButton);
	
	leftDiv.appendChild(document.createElement("br"));
	
	var eraseButton = document.createElement("input");
	eraseButton.type="button";
	eraseButton.dataset.num = i;
	eraseButton.value="Erase pony" 
	eraseButton.style.verticalAlign = "middle";
	eraseButton.onclick = function() {
		erasePony(i);
	}
	leftDiv.appendChild(eraseButton);
	
	rightDiv = document.createElement("div");
	rightDiv.className = "save-right-col";
	wrapDiv.appendChild(rightDiv);
	
	var img = document.createElement("img");
	img.src = ponyData.miniScreenshot;
	rightDiv.appendChild(img);
}

function saveNewPony2(miniScreenshot){

	var i = 0;
	// try to find a place to save the pony
	for(var _i=1; _i<saveLimit+1; _i++){
		var key = "ponySave" + _i;
		if (localStorage.getItem(key) === null){
			i = _i;
			break;
		}
	}
	if(i){
		
		// store data into the localStorage
		var key = "ponySave" + i;
		var ponyData = generatePonyData(miniScreenshot);
		localStorage.setItem(key,JSON.stringify(ponyData));

		CreateWrapSaveDiv(i,ponyData);
		
		if(localStorage.length >= saveLimit){
			// disable save new pony button
			document.getElementById("buttonSaveNewPony").disabled = true;
		}
	}
	// else, localStorage contains a number of elements equal to saveLimit

}

function componentToHex(c) {
    var hex = c.toString(16);
    return hex.length == 1 ? "0" + hex : hex;
}

function rgbToHex(r, g, b) {
    return componentToHex(r) + componentToHex(g) + componentToHex(b);
}

function vec3ToHex(v) {
	var r = parseInt(v[0]*255.0);
	var g = parseInt(v[1]*255.0);
	var b = parseInt(v[2]*255.0);
    return rgbToHex(r, g, b);
}

function loadPony(ponysaveid){
	// load from localStorage
	var key = "ponySave" + ponysaveid;
	var ponyData = JSON.parse(localStorage.getItem(key));
	loadPony2(ponyData);
}
	
function loadPony2(ponyData){
	
	//ponyData.version;
	
	document.getElementById("bodyColorStyleSelect").value = ponyData.bodyColorStyle;
	changeBodyColorStyle(ponyData.bodyColorStyle);
	
	document.getElementById("bodyColor1").color.fromRGB(ponyData.bodyColor1[0],ponyData.bodyColor1[1],ponyData.bodyColor1[2]);
	pony.firstColor = ponyData.bodyColor1;
	
	document.getElementById("bodyColor2").color.fromRGB(ponyData.bodyColor2[0],ponyData.bodyColor2[1],ponyData.bodyColor2[2]);
	pony.secondColor = ponyData.bodyColor2;
	
	document.getElementById("bodyColor3").color.fromRGB(ponyData.bodyColor2[0],ponyData.bodyColor2[1],ponyData.bodyColor2[2]);
	pony.thirdColor = ponyData.bodyColor3;
	
	document.getElementById("lEyeSelect").value = ponyData.lEyeSelect;
	changelEye(ponyData.lEyeSelect);
	document.getElementById("rEyeSelect").value = ponyData.rEyeSelect;
	changerEye(ponyData.rEyeSelect);
	
	var lh = (ponyData.leftEyeHSV[0] +offsetHueEye)*6.0;
	var ls = ponyData.leftEyeHSV[1] / scaleSatEye;
	var lv = ponyData.leftEyeHSV[2] / scaleValueEye;
	document.getElementById("leftEyeColor").color.fromHSV(lh,ls,lv);
	leftEye.hsv = ponyData.leftEyeHSV;
	var rh = (ponyData.rightEyeHSV[0] +offsetHueEye)*6.0;
	var rs = ponyData.rightEyeHSV[1] / scaleSatEye;
	var rv = ponyData.rightEyeHSV[2] / scaleValueEye;
	document.getElementById("rightEyeColor").color.fromHSV(rh,rs,rv);
	rightEye.hsv = ponyData.rightEyeHSV;
	document.getElementById("slEye").value = ponyData.leftEyeScale;
	document.getElementById("srEye").value = ponyData.rightEyeScale;
	leftEye.uvScale = ponyData.leftEyeScale;
	rightEye.uvScale = ponyData.rightEyeScale;
	
	// eyelashes option, new in 1.0
	document.getElementById("EyelashesSelect").value = ponyData.eyelashesStyle;
	changeEyelashes(ponyData.eyelashesStyle);
	
	if(ponyData.version >= 1.18){
		leftEye.firstColor = ponyData.leftEyeColor1;
		rightEye.firstColor = ponyData.rightEyeColor1;
		document.getElementById("leftEyeColor2").value = ponyData.leftEyeColor1;
		document.getElementById("rightEyeColor2").value = ponyData.rightEyeColor1;
	}
	
	
	// ear (new in 1.1.0)
	if(ponyData.version >= 1.10){
		document.getElementById("earSelect").value = ponyData.earSelect;
	}
	else{
		document.getElementById("earSelect").value = 0; // default = normal ears
	}
	
	// teeth (new in 1.1.1)
	if(ponyData.version >= 1.11){
		document.getElementById("teethSelect").value = ponyData.teethSelect;
	}
	else{
		document.getElementById("teethSelect").value = 1; // default = normal teeth
	}
	
	
	
	
	// hair
	document.getElementById("hairFrontStyleSelect").value = ponyData.hairFrontStyle;
	changeHairFrontModel(ponyData.hairFrontStyle);
	document.getElementById("hairFrontColor1").color.fromRGB(ponyData.hairFrontColor1[0],ponyData.hairFrontColor1[1],ponyData.hairFrontColor1[2]);
	hairFront.firstColor = ponyData.hairFrontColor1;
	document.getElementById("hairFrontColor2").color.fromRGB(ponyData.hairFrontColor2[0],ponyData.hairFrontColor2[1],ponyData.hairFrontColor2[2]);
	hairFront.secondColor = ponyData.hairFrontColor2;
	document.getElementById("hairFrontColor3").color.fromRGB(ponyData.hairFrontColor3[0],ponyData.hairFrontColor3[1],ponyData.hairFrontColor3[2]);
	hairFront.thirdColor = ponyData.hairFrontColor3;
	
	document.getElementById("hairBackStyleSelect").value = ponyData.hairBackStyle;
	changeHairBackModel(ponyData.hairBackStyle);
	document.getElementById("hairBackColor1").color.fromRGB(ponyData.hairBackColor1[0],ponyData.hairBackColor1[1],ponyData.hairBackColor1[2]);
	hairBack.firstColor = ponyData.hairBackColor1;
	document.getElementById("hairBackColor2").color.fromRGB(ponyData.hairBackColor2[0],ponyData.hairBackColor2[1],ponyData.hairBackColor2[2]);
	hairBack.secondColor = ponyData.hairBackColor2;
	document.getElementById("hairBackColor3").color.fromRGB(ponyData.hairBackColor3[0],ponyData.hairBackColor3[1],ponyData.hairBackColor3[2]);
	hairBack.thirdColor = ponyData.hairBackColor3;
	
	// Cloudchaser only
	hairExtra.firstColor = ponyData.hairExtraColor1;
	hairExtra.secondColor = ponyData.hairExtraColor2;
	hairExtra.thirdColor = ponyData.hairExtraColor3;
	
	document.getElementById("tailStyleSelect").value = ponyData.tailStyle;
	changeTailModel(ponyData.tailStyle);
	document.getElementById("tailColor1").color.fromRGB(ponyData.tailColor1[0],ponyData.tailColor1[1],ponyData.tailColor1[2]);
	tail.firstColor = ponyData.tailColor1;
	document.getElementById("tailColor2").color.fromRGB(ponyData.tailColor2[0],ponyData.tailColor2[1],ponyData.tailColor2[2]);
	tail.secondColor = ponyData.tailColor2;
	document.getElementById("tailColor3").color.fromRGB(ponyData.tailColor3[0],ponyData.tailColor3[1],ponyData.tailColor3[2]);
	tail.thirdColor = ponyData.tailColor3;
	
	if(ponyData.version >= 0.95){
		// horn height
		document.getElementById("hornSize").value = ponyData.hornHeight;
		horn.height = ponyData.hornHeight;
	}
	
	document.getElementById("hornStyleSelect").value = ponyData.hornStyle;
	changeHornModel(ponyData.hornStyle);
	document.getElementById("hornColor1").color.fromRGB(ponyData.hornColor1[0],ponyData.hornColor1[1],ponyData.hornColor1[2]);
	horn.firstColor = ponyData.hornColor1;
	document.getElementById("hornColor2").color.fromRGB(ponyData.hornColor2[0],ponyData.hornColor2[1],ponyData.hornColor2[2]);
	horn.secondColor = ponyData.hornColor2;
	//document.getElementById("hornColor3").color.fromRGB(ponyData.hornColor3[0],ponyData.hornColor3[1],ponyData.hornColor3[2]);
	horn.thirdColor = ponyData.hornColor3;
	
	document.getElementById("wingStyleSelect").value = ponyData.leftWingStyle;
	changeLeftWingModel(ponyData.leftWingStyle);
	document.getElementById("wingsColor1").color.fromRGB(ponyData.leftWingColor1[0],ponyData.leftWingColor1[1],ponyData.leftWingColor1[2]);
	leftWing.firstColor = ponyData.leftWingColor1;
	document.getElementById("wingsColor2").color.fromRGB(ponyData.leftWingColor2[0],ponyData.leftWingColor2[1],ponyData.leftWingColor2[2]);
	leftWing.secondColor = ponyData.leftWingColor2;
	document.getElementById("wingsColor3").color.fromRGB(ponyData.leftWingColor3[0],ponyData.leftWingColor3[1],ponyData.leftWingColor3[2]);
	leftWing.thirdColor = ponyData.leftWingColor3;
	
	changeRightWingModel(ponyData.rightWingStyle);
	//document.getElementById("rightWingColor1").color.fromRGB(ponyData.rightWingColor1[0],ponyData.rightWingColor1[1],ponyData.rightWingColor1[2]);
	rightWing.firstColor = ponyData.rightWingColor1;
	//document.getElementById("rightWingColor2").color.fromRGB(ponyData.rightWingColor2[0],ponyData.rightWingColor2[1],ponyData.rightWingColor2[2]);
	rightWing.secondColor = ponyData.rightWingColor2;
	//document.getElementById("rightWingColor3").color.fromRGB(ponyData.rightWingColor3[0],ponyData.rightWingColor3[1],ponyData.rightWingColor3[2]);
	rightWing.thirdColor = ponyData.rightWingColor3;
	
	document.getElementById("collar1Select").value = ponyData.collar1Style;
	changeCollar1Model(ponyData.collar1Style);
	document.getElementById("collar1Color1").color.fromRGB(ponyData.collar1Color1[0],ponyData.collar1Color1[1],ponyData.collar1Color1[2]);
	collar1.firstColor = ponyData.collar1Color1;
	document.getElementById("collar1Color2").color.fromRGB(ponyData.collar1Color2[0],ponyData.collar1Color2[1],ponyData.collar1Color2[2]);
	collar1.secondColor = ponyData.collar1Color2;
	document.getElementById("collar1Color3").color.fromRGB(ponyData.collar1Color3[0],ponyData.collar1Color3[1],ponyData.collar1Color3[2]);
	collar1.thirdColor = ponyData.collar1Color3;
	
	
	
	document.getElementById("headgear1Select").value = ponyData.headgear1Style;
	changeHeadgear1Model(ponyData.headgear1Style);
	document.getElementById("headgear1Color1").color.fromRGB(ponyData.headgear1Color1[0],ponyData.headgear1Color1[1],ponyData.headgear1Color1[2]);
	headgear1.firstColor = ponyData.headgear1Color1;
	document.getElementById("headgear1Color2").color.fromRGB(ponyData.headgear1Color2[0],ponyData.headgear1Color2[1],ponyData.headgear1Color2[2]);
	headgear1.secondColor = ponyData.headgear1Color2;
	document.getElementById("headgear1Color3").color.fromRGB(ponyData.headgear1Color3[0],ponyData.headgear1Color3[1],ponyData.headgear1Color3[2]);
	headgear1.thirdColor = ponyData.headgear1Color3;
	
	
	if(ponyData.version>0.7){
		changeHeadband0Model(ponyData.headbandAStyle[0]);
		changeHeadband1Model(ponyData.headbandAStyle[1]);
		for(var i=0;i<ponyData.headbandAlength;i++){
			document.getElementById("headband"+i+"Select").value = ponyData.headbandAStyle[i];
			document.getElementById("headband"+i+"Color1").color.fromRGB(ponyData.headbandAColor1[i][0],ponyData.headbandAColor1[i][1],ponyData.headbandAColor1[i][2]);
			headbandA[i].firstColor = ponyData.headbandAColor1[i];
			document.getElementById("headband"+i+"Color2").color.fromRGB(ponyData.headbandAColor2[i][0],ponyData.headbandAColor2[i][1],ponyData.headbandAColor2[i][2]);
			headbandA[i].secondColor = ponyData.headbandAColor2[i];
			document.getElementById("headband"+i+"Color3").color.fromRGB(ponyData.headbandAColor3[i][0],ponyData.headbandAColor3[i][1],ponyData.headbandAColor3[i][2]);
			headbandA[i].thirdColor = ponyData.headbandAColor3[i];
		}
	}

	if(ponyData.version>=1.03){
		for(var i=0;i<ponyData.accLength;i++){
			document.getElementById("misc"+i+"Select").value = ponyData.accStyle[i];
			changeAccessoryModel(ponyData.accStyle[i],i);
			document.getElementById("misc"+i+"Color1").color.fromRGB(ponyData.accColor1[i][0],ponyData.accColor1[i][1],ponyData.accColor1[i][2]);
			accessories[i].firstColor = ponyData.accColor1[i];
			document.getElementById("misc"+i+"Color2").color.fromRGB(ponyData.accColor2[i][0],ponyData.accColor2[i][1],ponyData.accColor2[i][2]);
			accessories[i].secondColor = ponyData.accColor2[i];
			document.getElementById("misc"+i+"Color3").color.fromRGB(ponyData.accColor3[i][0],ponyData.accColor3[i][1],ponyData.accColor3[i][2]);
			accessories[i].thirdColor = ponyData.accColor3[i];
		}
		// "remove non-existant accessories"
		for(var i=ponyData.accLength;i<accessories.length;i++){
			document.getElementById("misc"+i+"Select").value = 0;
			changeAccessoryModel(0,i);
		}
	}
	else{
		for(var i=0;i<ponyData.accLength;i++){
			document.getElementById("misc"+i+"Select").value = 0;
			changeAccessoryModel(0,i);
		}
	}
	/*
	ponyData.tongueStyle = tongue.model ? tongue.model.id : 0;
	ponyData.tongueColor1 = tongue.firstColor;
	ponyData.tongueColor2 = tongue.secondColor;
	ponyData.tongueColor3 = tongue.thirdColor;*/
	 
	
	// morphs
	for(var j=1; j<50; j++){ // 1 to 49 are facial expressions.
		var val = ponyData.morphValue[j];
		if(document.getElementById("rangeMorph"+j)){
			document.getElementById("rangeMorph"+j).value = val;
		}
		pony.morphValue[j] = val;
	}
	
	// Fluttershy and Rarity eyeshapes, new in 1.1.2
	if(ponyData.morphValue.length > 60){
		changeElementValue("rangeMorph59",ponyData.morphValue[59]);
		pony.morphValue[59] = ponyData.morphValue[59];
		changeElementValue("rangeMorph60",ponyData.morphValue[60]);
		pony.morphValue[60] = ponyData.morphValue[60];
	}
	
	// 50 = pony's weight.
	var val = 1.0;
	if(ponyData.version >= 0.91){
		val = ponyData.morphValue[50]; 
	}
	document.getElementById("ponyWeight").value = val;
	pony.morphValue[50] = val;
	
	// 53 = ear size
	val = 0.0;	
	if(ponyData.version >= 1.10){
		val = ponyData.morphValue[53]; 
	}
	document.getElementById("rangeMorph53").value = val;
	pony.morphValue[53] = val;

	
	// sticker
	// update interface
	var oldSticker = pony.model.sticker[currentStickerID];
	document.getElementById('stickerMini'+currentStickerID).className = 'stickerMiniInactive';
	if(oldSticker.htmlid){
		document.getElementById(oldSticker.htmlid).className = 'stickerImgInactive';
	}
	
	// retrieve data
	for(var i=0;i<ponyData.stickerNumber;i++){
		var sticker = pony.model.sticker[i];
		var _sticker = ponyData.sticker[i];
		sticker.id = _sticker.id;
		sticker.htmlid = _sticker.htmlid;
		sticker.display = _sticker.display;
		sticker.src = _sticker.src;
		//sticker.uv = _sticker.uv;
		sticker.angle = _sticker.angle;
		sticker.uscale = _sticker.uscale;
		sticker.vscale = _sticker.vscale;
		sticker.ut = _sticker.ut;
		sticker.vt = _sticker.vt;
		sticker.reverse = _sticker.reverse;
		sticker.triID = _sticker.triID;
		//sticker.triIDs = _sticker.triIDs;
		//sticker.vertIDs = _sticker.vertIDs;
		
		// find the triangle neighbors
		sticker.triIDs = pony.model.mesh.findTriangleNeighbors(sticker.triID,4);
		
		if(sticker.triIDs){		
			// find the vertices
			sticker.vertIDs = pony.model.mesh.verticesFromTriangles(sticker.triIDs);
			
			// project the uv
			sticker.uv = pony.model.mesh.projectUVcoords(sticker.vertIDs,sticker.triID);
			
			if(sticker.src){
				document.getElementById('stickerMini'+i).src = sticker.src;
			}
			if(sticker.display){
				sticker.initStickerTexture(sticker.src);
				initStickerShader1(pony.model,sticker.vertIDs,sticker.triIDs,sticker.triID,sticker);
			}
		}
	}
	
	// update interface
	currentStickerID = 0;
	var sticker = pony.model.sticker[currentStickerID];
	document.getElementById('stickerRotation').value = sticker.angle * 180 / Math.PI;
	document.getElementById('stickerScale').value = 1 / sticker.uscale;
	document.getElementById('stickerReverse').checked = sticker.reverse;
	if(sticker.htmlid){
		if(document.getElementById(sticker.htmlid)){
			document.getElementById(sticker.htmlid).className = 'stickerImgActive';
		}
	}
	
	oldStickerImgID.className = 'stickerImgInactive';
	var img = document.getElementById(sticker.htmlid);
	if(img){
		img.className = 'stickerImgActive';
		oldStickerImgID = img;
	}

	if(ponyData.version >= 0.9){
		// cutie mark
		document.getElementById("cutieMarkSelect").value = ponyData.cutieMark;
		changeCutieMark(ponyData.cutieMark);
	}
	
	if(ponyData.version >= 1.05){
		leftWing.height = ponyData.leftWingHeight;
		rightWing.height = ponyData.rightWingHeight;
		tail.height = ponyData.tailWingHeight;
		headSize = ponyData.headSize;
		document.getElementById("lWingSize").value = ponyData.leftWingHeight;
		document.getElementById("rWingSize").value = ponyData.rightWingHeight;
		document.getElementById("tailSize").value = ponyData.tailWingHeight;
		document.getElementById("headSize").value = ponyData.headSize[0];
	}
	else{
		tail.height = 1;
		rightWing.height = 1;
		leftWing.height = 1;
		headSize = vec3.createFrom(1,1,1);
		document.getElementById("lWingSize").value = 1;
		document.getElementById("rWingSize").value = 1;
		document.getElementById("tailSize").value = 1;
		document.getElementById("headSize").value = 1;
	}
	
	if(ponyData.version >= 0.91){
		// pony height
		document.getElementById("ponyHeight").value = ponyData.ponyHeight;
		pony.height = ponyData.ponyHeight;
		changePonyHeight(ponyData.ponyHeight,false);
		
	}

	if(ponyData.version >= 0.97){
		// custom pose
		//ponyData.jointRotateDegrees // vec3 Array
		var size = Math.min(ponyData.jointRotateDegrees.length,pony.model.skeleton.joints.length);
		for(var i=0; i<size; i++){
			pony.model.skeleton.joints[i].rotateDegrees = vec3.create(ponyData.jointRotateDegrees[i]);
			rotateJoint(pony.model.skeleton.joints[i]);
		}
		changeAnimation(ponyData.animation);
	}
	if(ponyData.version >= 1.05){
	// bugged sometimes
		/*if(tail.model){
			var size = Math.min(ponyData.tailjointRotateDegrees.length,tail.model.skeleton.joints.length);
			for(var i=0; i<size; i++){
				tail.model.skeleton.joints[i].rotateDegrees = vec3.create(ponyData.tailjointRotateDegrees[i]);
				customPoseCurrentJoint = 1000 +i;
				rotateJoint3(tail.model.skeleton.joints[i],true);
			}
		}
		if(leftWing.model){
			var size = Math.min(ponyData.lwingjointRotateDegrees.length,leftWing.model.skeleton.joints.length);
			for(var i=0; i<size; i++){
				leftWing.model.skeleton.joints[i].rotateDegrees = vec3.create(ponyData.lwingjointRotateDegrees[i]);
				customPoseCurrentJoint = 2000 +i;
				rotateJoint3(leftWing.model.skeleton.joints[i],true);		
			}
		}
		if(rightWing.model){
			console.log(rightWing.model.skeleton.joints.length);
			var size = Math.min(ponyData.rwingjointRotateDegrees.length,rightWing.model.skeleton.joints.length);
			for(var i=0; i<size; i++){
				rightWing.model.skeleton.joints[i].rotateDegrees = vec3.create(ponyData.rwingjointRotateDegrees[i]);
				customPoseCurrentJoint = 3000 +i;
				//console.log(rightWing.model.skeleton.joints[i].rotateDegrees[2]);
				rotateJoint3(rightWing.model.skeleton.joints[i],true);
			}
		}*/
	}
	
	if(ponyData.version >= 1.0){
		gender = ponyData.gender;
		if(gender == 0){
			changeFemaleBody();
		}
		else if(gender == 1){
			changeMaleBody();
		}
		else if(gender == 2){
			changeLongFace();
		}
	}
	
	if(ponyData.version >= 1.01){
		leftEye.uvT[0] = ponyData.lEyeTx;
		leftEye.uvT[1] = ponyData.lEyeTy;
		rightEye.uvT[0] = ponyData.rEyeTx;
		rightEye.uvT[1] = ponyData.rEyeTy;
		document.getElementById("txlEye").value = ponyData.lEyeTx;
		document.getElementById("tylEye").value = ponyData.lEyeTy;
		document.getElementById("txrEye").value = ponyData.rEyeTx;
		document.getElementById("tyrEye").value = ponyData.rEyeTy;
	}
	
	// lightning
	if(ponyData.version >= 1.02){
		for(var j=0; j<3; j++){
			lightArray[0].ambiant[j] = ponyData.light0A[j];
			lightArray[0].diffuse[j] = ponyData.light0D[j];
			lightArray[0].specular[j] = ponyData.light0S[j];
		}
		pony.shininess = ponyData.ponyShininess;
		document.getElementById("aLight0r").value = ponyData.light0A[0];
		document.getElementById("aLight0g").value = ponyData.light0A[1];
		document.getElementById("aLight0b").value = ponyData.light0A[2];
		document.getElementById("dLight0r").value = ponyData.light0D[0];
		document.getElementById("dLight0g").value = ponyData.light0D[1];
		document.getElementById("dLight0b").value = ponyData.light0D[2];
		document.getElementById("sLight0r").value = ponyData.light0S[0];
		document.getElementById("sLight0g").value = ponyData.light0S[1];
		document.getElementById("sLight0b").value = ponyData.light0S[2];
		document.getElementById("shininess").value = ponyData.ponyShininess;
	}
	
	if(ponyData.version >= 1.172){
		pony.model.lCutieMark.ut = ponyData.custom_l_CM_ut;
		pony.model.lCutieMark.vt = ponyData.custom_l_CM_vt;
		pony.model.rCutieMark.ut = ponyData.custom_r_CM_ut;
		pony.model.rCutieMark.vt = ponyData.custom_r_CM_vt;
		document.getElementById("cutieMarkUt").value = pony.model.lCutieMark.ut;
		document.getElementById("cutieMarkVt").value = pony.model.lCutieMark.vt;
	}
		
	if(ponyData.version >= 1.04){
		pony.model.lCutieMark.angle = ponyData.custom_l_CM_angle;
		pony.model.lCutieMark.uscale = ponyData.custom_l_CM_uscale;
		pony.model.lCutieMark.vscale = ponyData.custom_l_CM_vscale;
		pony.model.lCutieMark.reverse = ponyData.custom_l_CM_reverse;
		pony.model.rCutieMark.angle = ponyData.custom_r_CM_angle;
		pony.model.rCutieMark.uscale = ponyData.custom_r_CM_uscale;
		pony.model.rCutieMark.vscale = ponyData.custom_r_CM_vscale;
		pony.model.rCutieMark.reverse = ponyData.custom_r_CM_reverse;
		document.getElementById("cutieMarkRotation").value = pony.model.lCutieMark.angle*180/Math.PI;
		document.getElementById("cutieMarkScale").value = 1/pony.model.lCutieMark.uscale;
		document.getElementById("cutieMarkReverse").value = pony.model.lCutieMark.reverse;
		updateStickerUVBuffer(pony.model.lCutieMark);
		updateStickerUVBuffer(pony.model.rCutieMark);
	}
	
	if(ponyData.version >= 1.06){
		// extra
		if(hairFront){
			hairFront.tex1 = ponyData.hairFront_tex1 ; 
			hairFront.uHSV = ponyData.hairFront_uHSV ; 
			hairFront.tex1alphatex1alpha = ponyData.hairFront_tex1alpha; 
			changeElementValue("tex1_hairfront",ponyData.hairFront_tex1);
			changeElementValue("tex1sat_hairfront",ponyData.hairFront_uHSV[1]);
			changeElementValue("tex1alpha_hairfront",ponyData.hairFront_tex1alpha);
			changeTexture1_inst(hairFront);
		}
		
		if(hairBack){
			hairBack.uHSV = ponyData.hairBack_uHSV ; 
			hairBack.tex1 = ponyData.hairBack_tex1 ; 
			hairBack.tex1alphatex1alpha = ponyData.hairBack_tex1alpha ;
			changeElementValue("tex1_hairback",ponyData.hairBack_tex1);
			changeElementValue("tex1sat_hairback",ponyData.hairBack_uHSV[1]);
			changeElementValue("tex1alpha_hairback",ponyData.hairBack_tex1alpha);
			changeTexture1_inst(hairBack);
		}
		
		
		if(tail){
			tail.uHSV = ponyData.tail_uHSV ; 
			tail.tex1 = ponyData.tail_tex1 ; 
			tail.tex1alphatex1alpha = ponyData.tail_tex1alpha ;
			changeElementValue("tex1_tail",ponyData.tail_tex1);
			changeElementValue("tex1sat_tail",ponyData.tail_uHSV[1]);
			changeElementValue("tex1alpha_tail",ponyData.tail_tex1alpha);
			changeTexture1_inst(tail);
		}
		
		if(horn){
			horn.uHSV = ponyData.horn_uHSV ; 
			horn.tex1 = ponyData.horn_tex1 ; 
			horn.tex1alphatex1alpha = ponyData.horn_tex1alpha ; 
			changeElementValue("tex1_horn",ponyData.horn_tex1);
			changeElementValue("tex1sat_horn",ponyData.horn_uHSV[1]);
			changeElementValue("tex1alpha_horn",ponyData.horn_tex1alpha);
			changeTexture1_inst(horn);
		}
		
		if(leftWing){
			leftWing.uHSV = ponyData.leftWing_uHSV ; 
			leftWing.tex1 = ponyData.leftWing_tex1 ; 
			leftWing.tex1alphatex1alpha = ponyData.leftWing_tex1alpha ; 
			changeElementValue("tex1_lwing",ponyData.leftWing_tex1);
			changeElementValue("tex1sat_lwing",ponyData.leftWing_uHSV[1]);
			changeElementValue("tex1alpha_lwing",ponyData.leftWing_tex1alpha);
			changeTexture1_inst(leftWing);
		}
		
		if(rightWing){
			rightWing.uHSV = ponyData.rightWing_uHSV ; 
			rightWing.tex1 = ponyData.rightWing_tex1 ; 
			rightWing.tex1alphatex1alpha = ponyData.rightWing_tex1alpha ;
			changeElementValue("tex1_rwing",ponyData.rightWing_tex1);
			changeElementValue("tex1sat_rwing",ponyData.rightWing_uHSV[1]);
			changeElementValue("tex1alpha_rwing",ponyData.rightWing_tex1alpha);
			changeTexture1_inst(rightWing);
		}
	
	
	}

	// background
	if(ponyData.version >= 1.161){
		bgColorR = ponyData.bgColorR;
		bgColorG = ponyData.bgColorG;
		bgColorB = ponyData.bgColorB;
		bgColorA = ponyData.bgColorA;
		document.getElementById("bgColor").color.fromRGB(bgColorR,bgColorG,bgColorB);
		document.getElementById("bgTransparency").value = bgColorA;
	}
	
	if(ponyData.version >= 1.16){
		document.getElementById("bgSelect").value = ponyData.bgSelect;
		bgNum = ponyData.bgSelect;
		changeBGTexture(ponyData.bgSelect);
	}
	else{
		document.getElementById("bgSelect").value = 0; // default = normal teeth
		bgNum = 0;
		changeBGTexture(0);
	}

	
	
}



function erasePony(i){
	var r = confirm("If you erase your pony, it will be lost forever.\n Are you sure you want to delete it ?");
	if(r==true){
		var key = "ponySave" + i;
		localStorage.removeItem(key);
		var wrapDiv = document.getElementById("saveWrap" + i);
		wrapDiv.innerHTML = ''; // remove children
		wrapDiv.parentNode.removeChild(wrapDiv); // remove this div
		// enable save new pony button
		document.getElementById("buttonSaveNewPony").disabled = false;
	}
	
}



function downloadPonySave(){
	var ponyData = generatePonyData(0);
 
	var isIE11 = !!navigator.userAgent.match(/Trident.*rv[ :]*11\./)
	if(isIE11){ // if internet explorer 11
		var j = JSON.stringify(ponyData);
		var blob = new Blob([j], {type: "text/plain;charset=utf-8"});
		saveAs(blob, "ponysave.json");
	}else{
		var j = "data:text/plain;charset=utf-8,";
		j += JSON.stringify(ponyData);
		var a = $("<a>").attr("href", j).attr("download", "ponysave.json").appendTo("body");
		a[0].click();
		a.remove();
	}
	
}

function importPonySave(input){
	if (input.files && input.files[0])
	{
		var value = input.value;
		var ext = value.split('.').pop();
		//if(ext == 'json'){
			var reader = new FileReader();
            reader.onload = function (e)
            {	                         
				var src = e.target.result;
                var ponyData = JSON.parse(src);
				loadPony2(ponyData);                           
            };
            reader.readAsText(input.files[0]);
				   
			// read file

		//}
		//else {
			
		//}
	}
}

// ******************************************
// **            MISC FUNCTIONS            **
// ******************************************

function buttonPrintCanvas(){
	var is_chrome = navigator.userAgent.toLowerCase().indexOf('chrome') > -1;
	if(is_chrome){ // Chrome can't handle files > 2MB
		canvas.width = 1200;
		canvas.height = 900;
	}
	else{
		canvas.width = 2000;
		canvas.height = 1500;
	}
	gl.viewport(0, 0, canvas.width, canvas.height);
	gl.viewportWidth = canvas.width;
	gl.viewportHeight = canvas.height;
	drawScene();
	screenshot = canvas.toDataURL("image/png");
	
	var isIE11 = !!navigator.userAgent.match(/Trident.*rv[ :]*11\./)
	if(isIE11){ 
		canvas.toBlob(function(blob) {
			saveAs(blob, "pony.png");
		});
	}
	
	bTakeScreenshot = false;
	resizeCanvas();
	setTimeout(downloadScreenshot, 1000); 
}

function downloadScreenshot(){
	if(bTakeScreenshot){
		// wait for the screenshot to be ready
		// (wait for the draw buffer)
		setTimeout(downloadScreenshot, 20); 
        return;
    }
	
	var isIE11 = !!navigator.userAgent.match(/Trident.*rv[ :]*11\./)
	if(isIE11){ // if internet explorer 11

	}
	else{ // 
		var a = $("<a>").attr("href", screenshot).attr("download", "pony.png").appendTo("body");
		a[0].click();
		a.remove();
	}
}

var b_download = false; // prevent to click until the save is done.
function downloadOBJ(){
	if(!b_download){
		b_download = true;
		var obj = new ObjLoader();
		obj.save();
		b_download = false;
	}
}

function downloadSMD(){
	if(!b_download){
		b_download = true;
		var smd = new SmdLoader();
		smd.save();
		b_download = false;
	}
}


// source http://www.euclideanspace.com/maths/geometry/rotations/conversions/angleToEuler/
function axisAngleToEuler(axisAngle,euler) {
	if(!euler) { euler = vec3.create();}
	var z = axisAngle[0];
	var y = axisAngle[1];
	var x = axisAngle[2];
	var angle = axisAngle[3];
	var s = Math.sin(angle);
	var c = Math.cos(angle);
	var t=1-c;
	if ((x*y*t + z*s) > 0.998) { // north pole singularity detected
		euler[1] = 2*Math.atan2(x*Math.sin(angle/2),Math.cos(angle/2));
		euler[0] = Math.PI/2;
		euler[2] = 0;
		return euler;
	}
	if ((x*y*t + z*s) < -0.998) { // south pole singularity detected
		euler[1] = -2*Math.atan2(x*Math.sin(angle/2),Math.cos(angle/2));
		euler[0] = -Math.PI/2;
		euler[2] = 0;
		return euler;
	}
	euler[1] = Math.atan2(y * s- x * z * t , 1 - (y*y+ z*z ) * t);
	euler[0] = Math.asin(x * y * t + z * s) ;
	euler[2] = Math.atan2(x * s - y * z * t , 1 - (x*x + z*z) * t);
	return euler;
}

// source http://www.euclideanspace.com/maths/geometry/rotations/conversions/eulerToAngle/
function eulerToAxisAngle(euler,axisAngle) {
	if(!axisAngle) { axisAngle = vec4.create();}
	// Assuming the angles are in radians.
	var c1 = Math.cos(euler[1]/2);
	var s1 = Math.sin(euler[1]/2);
	var c2 = Math.cos(euler[0]/2);
	var s2 = Math.sin(euler[0]/2);
	var c3 = Math.cos(euler[2]/2);
	var s3 = Math.sin(euler[2]/2);
	var c1c2 = c1*c2;
	var s1s2 = s1*s2;
	var w =c1c2*c3 - s1s2*s3;
	var x =c1c2*s3 + s1s2*c3;
	var y =s1*c2*c3 + c1*s2*s3;
	var z =c1*s2*c3 - s1*c2*s3;
	var angle = 2 * Math.acos(w);
	var norm = x*x+y*y+z*z;
	if (norm < 0.00001) { // when all euler angles are zero angle =0 so
		// we can set axis to anything to avoid divide by zero
		x=1;
		y=0;
		z=0;
	} else {
		norm = Math.sqrt(norm);
    	x /= norm;
    	y /= norm;
    	z /= norm;
	}
	axisAngle[0] = z;
	axisAngle[1] = y;
	axisAngle[2] = x;
	axisAngle[3] = angle;
	return axisAngle;
}

// euler to mat4
function eulerToMat4(euler,translation,mat) {
	// TODO : change formulas for speed
	// euler : vec3, X, Y, Z
	if(!mat) {mat = mat4.create();}
	var axisAngle = vec4.create();
	eulerToAxisAngle(euler,axisAngle);
	var q = quat4.create();
	var axis = vec3.createFrom(axisAngle[0],axisAngle[1],axisAngle[2]);
	quat4.fromAngleAxis(axisAngle[3],axis,q);
	mat4.fromRotationTranslation(q,translation,mat);
	return mat;
}

// mat4 to euler 
function mat4ToEuler(mat,euler) {
	// TODO : change formulas for speed
	// euler : vec3, X, Y, Z
	if(!euler) {euler = vec3.create();}
	var rotMat = mat3.create();
	mat4.toMat3(mat,rotMat);
	var q = quat4.create();
	quat4.fromRotationMatrix(rotMat,q);
	var axisAngle = vec4.create();
	quat4.toAngleAxis(q,axisAngle);
	axisAngleToEuler(axisAngle,euler);
	euler[0] = -euler[0];
	euler[1] = -euler[1];
	euler[2] = -euler[2];
}



function axisAngleToEuler_test(axisAngle,euler) {
	if(!euler) { euler = vec3.create();}
	var z = axisAngle[0];
	var y = axisAngle[1];
	var x = axisAngle[2];
	var angle = axisAngle[3];
	var s = Math.sin(angle);
	var c = Math.cos(angle);
	var t=1-c;
	
	var magnitude = Math.sqrt(x*x + y*y + z*z);
	if(magnitude>0){
		x /= magnitude;
		y /= magnitude;
		z /= magnitude;
	}
	
	if ((x*y*t + z*s) > 0.998) { // north pole singularity detected
		euler[1] = 2*Math.atan2(x*Math.sin(angle/2),Math.cos(angle/2));
		euler[0] = Math.PI/2;
		euler[2] = 0;
		return euler;
	}
	if ((x*y*t + z*s) < -0.998) { // south pole singularity detected
		euler[1] = -2*Math.atan2(x*Math.sin(angle/2),Math.cos(angle/2)) + Math.PI/2;
		euler[0] = -Math.PI/2;
		euler[2] = Math.PI/2;
		return euler;
	}
	euler[1] = Math.atan2(y * s- x * z * t , 1 - (y*y+ z*z ) * t);
	euler[0] = Math.asin(x * y * t + z * s) ;
	euler[2] = Math.atan2(x * s - y * z * t , 1 - (x*x + z*z) * t);
	return euler;
}

quat4.fromRotationMatrix_test = function(mat, q) {
	if (!q) q = quat4.create();

	var qw,qx,qy,qz;
	var m00 = mat[0];
	var m10 = mat[1];
	var m20 = mat[2];
	var m01 = mat[3];
	var m11 = mat[4];
	var m21 = mat[5];
	var m02 = mat[6];
	var m12 = mat[7];
	var m22 = mat[8];
	
	var tr = m00 + m11 + m22
	if (tr > 0) { 
	  var S = Math.sqrt(tr+1.0) * 2; // S=4*qw 
	  qw = 0.25 * S;
	  qx = (m21 - m12) / S;
	  qy = (m02 - m20) / S; 
	  qz = (m10 - m01) / S; 
	} else if ((m00 > m11)&(m00 > m22)) { 
	  var S = Math.sqrt(1.0 + m00 - m11 - m22) * 2; // S=4*qx 
	  qw = (m21 - m12) / S;
	  qx = 0.25 * S;
	  qy = (m01 + m10) / S; 
	  qz = (m02 + m20) / S; 
	} else if (m11 > m22) { 
	  var S = Math.sqrt(1.0 + m11 - m00 - m22) * 2; // S=4*qy
	  qw = (m02 - m20) / S;
	  qx = (m01 + m10) / S; 
	  qy = 0.25 * S;
	  qz = (m12 + m21) / S; 
	} else { 
	  var S = Math.sqrt(1.0 + m22 - m00 - m11) * 2; // S=4*qz
	  qw = (m10 - m01) / S;
	  qx = (m02 + m20) / S;
	  qy = (m12 + m21) / S;
	  qz = 0.25 * S;
	}
	
	q[0] = qx;
	q[1] = qy;
	q[2] = qz;
	q[3] = qw;
	return q;
};

	
function mat4ToEuler_test(mat,euler) {
	if(!euler) {euler = vec3.create();}
	var rotMat = mat3.create();
	mat4.toMat3(mat,rotMat);
	var q = quat4.create();
	quat4.fromRotationMatrix_test(rotMat,q);
	var axisAngle = vec4.create();
	quat4.toAngleAxis(q,axisAngle);
	axisAngleToEuler_test(axisAngle,euler);
}

function changeElementValue(s,val){ // html
	var d = document.getElementById(s);
	if(d) d.value = val;
}

function displayTab(Nom){
	document.getElementById('affiche-contenu-'+tabID).className = 'inactif onglet';
	document.getElementById('affiche-contenu-'+Nom).className = 'affiche-contenu-1 onglet';
	document.getElementById('contenu_'+tabID).style.display = 'none';
	document.getElementById('contenu_'+Nom).style.display = 'block';
	tabID = Nom;
	
	if(parseInt(Nom) == 7){ 
		initCustomPose(); 
	}
	else{
		endCustomPose(); 
	}
}
