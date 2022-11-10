// Template code for A2 Fall 2021 -- DO NOT DELETE THIS LINE
//open -a "Google Chrome" --args --allow-file-access-from-files
//chrome --allow-access-from-files
//grass image source: https://opengameart.org/content/grass-1
//brick image source: https://opengameart.org/content/brick-texture
//wood image source: https://opengameart.org/content/wood-texture-tiles
//window image source: https://opengameart.org/content/brown-plastic-window-with-matted-glass
//fur image source:https://opengameart.org/content/4k-seamless-textures-public-domain
var canvas;
var gl;

var program ;

var near = 1;
var far = 100;


var left = -6.0;
var right = 6.0;
var ytop =6.0;
var bottom = -6.0;

var lightPosition2 = vec4(100.0, 100.0, 100.0, 1.0 );
var lightPosition = vec4(0.0, 0.0, 100.0, 1.0 );

var lightAmbient = vec4(0.2, 0.2, 0.2, 1.0 );
var lightDiffuse = vec4( 1.0, 1.0, 1.0, 1.0 );
var lightSpecular = vec4( 1.0, 1.0, 1.0, 1.0 );

var materialAmbient = vec4( 1.0, 0.0, 1.0, 1.0 );
var materialDiffuse = vec4( 1.0, 0.8, 0.0, 1.0 );
var materialSpecular = vec4( 0.4, 0.4, 0.4, 1.0 );
var materialShininess = 30.0;


var ambientColor, diffuseColor, specularColor;

var modelMatrix, viewMatrix ;
var modelViewMatrix, projectionMatrix, normalMatrix;
var modelViewMatrixLoc, projectionMatrixLoc, normalMatrixLoc;
var eye;
var at = vec3(0.0, 0.0, 0.0);
var up = vec3(0.0, 1.0, 0.0);

var RX = 0 ;
var RY = 0 ;
var RZ = 0 ;
var cam_angle = 0;

var MS = [] ; // The modeling matrix stack
var TIME = 0.0 ; // Realtime
var TIME = 0.0 ; // Realtime
var resetTimerFlag = true ;
var animFlag = false ;
var prevTime = 0.0 ;
var useTextures = 1 ;

// **initial variables starts here **
var frame_per_second = 0; //frame per second
var frame_time = 0; //frame per second
var frame_two_second = 2; //frame per second

var house_appear_timer = 0; //house animation
var house_appear_counter = 0; //house animation
var house_destroy_timer = 1; //house animation

var cam_switch_curr = 0;

// **Static variables ends here **

// ------------ Images for textures stuff --------------
var texSize = 64;

var image1 = new Array()
for (var i =0; i<texSize; i++)  image1[i] = new Array();
for (var i =0; i<texSize; i++)
for ( var j = 0; j < texSize; j++)
image1[i][j] = new Float32Array(4);
for (var i =0; i<texSize; i++) for (var j=0; j<texSize; j++) {
    var c = (((i & 0x8) == 0) ^ ((j & 0x8)  == 0));
    image1[i][j] = [c, c, c, 1];
}

// Convert floats to ubytes for texture

var image2 = new Uint8Array(4*texSize*texSize);

for ( var i = 0; i < texSize; i++ )
for ( var j = 0; j < texSize; j++ )
for(var k =0; k<4; k++)
image2[4*texSize*i+4*j+k] = 255*image1[i][j][k];


var textureArray = [] ;



function isLoaded(im) {
    if (im.complete) {
        console.log("loaded") ;
        return true ;
    }
    else {
        console.log("still not loaded!!!!") ;
        return false ;
    }
}

function loadFileTexture(tex, filename)
{
    tex.textureWebGL  = gl.createTexture();
    tex.image = new Image();
    tex.image.src = filename ;
    tex.isTextureReady = false ;
    tex.image.onload = function() { handleTextureLoaded(tex); }
    // The image is going to be loaded asyncronously (lazy) which could be
    // after the program continues to the next functions. OUCH!
}

function loadImageTexture(tex, image) {
    tex.textureWebGL  = gl.createTexture();
    tex.image = new Image();
    //tex.image.src = "CheckerBoard-from-Memory" ;
    
    gl.bindTexture( gl.TEXTURE_2D, tex.textureWebGL );
    //gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, true);
    gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, texSize, texSize, 0,
                  gl.RGBA, gl.UNSIGNED_BYTE, image);
    gl.generateMipmap( gl.TEXTURE_2D );
    gl.texParameteri( gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER,
                     gl.NEAREST_MIPMAP_LINEAR );
    gl.texParameteri( gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.NEAREST );
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE); //Prevents s-coordinate wrapping (repeating)
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE); //Prevents t-coordinate wrapping (repeating)
    gl.bindTexture(gl.TEXTURE_2D, null);

    tex.isTextureReady = true ;

}

function initTextures() {
    
    textureArray.push({}) ;
    loadFileTexture(textureArray[textureArray.length-1],"grass.png") ;

    textureArray.push({}) ;
    loadFileTexture(textureArray[textureArray.length-1],"fur.png") ;
    
    textureArray.push({}) ;
    loadFileTexture(textureArray[textureArray.length-1],"bricks2.png") ;
    
    
}


function handleTextureLoaded(textureObj) {
    gl.bindTexture(gl.TEXTURE_2D, textureObj.textureWebGL);
	gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, true); // otherwise the image would be flipped upsdide down
    gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, textureObj.image);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR_MIPMAP_NEAREST);
    gl.generateMipmap(gl.TEXTURE_2D);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE); //Prevents s-coordinate wrapping (repeating)
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE); //Prevents t-coordinate wrapping (repeating)
    gl.bindTexture(gl.TEXTURE_2D, null);
    console.log(textureObj.image.src) ;
    
    textureObj.isTextureReady = true ;
}

//----------------------------------------------------------------

function setColor(c)
{
    ambientProduct = mult(lightAmbient, c);
    diffuseProduct = mult(lightDiffuse, c);
    specularProduct = mult(lightSpecular, materialSpecular);
    
    gl.uniform4fv( gl.getUniformLocation(program,
                                         "ambientProduct"),flatten(ambientProduct) );
    gl.uniform4fv( gl.getUniformLocation(program,
                                         "diffuseProduct"),flatten(diffuseProduct) );
    gl.uniform4fv( gl.getUniformLocation(program,
                                         "specularProduct"),flatten(specularProduct) );
    gl.uniform4fv( gl.getUniformLocation(program,
                                         "lightPosition"),flatten(lightPosition) );
    gl.uniform1f( gl.getUniformLocation(program, 
                                        "shininess"),materialShininess );
}

function toggleTextures() {
    useTextures = 1 - useTextures ;
    gl.uniform1i( gl.getUniformLocation(program,
                                         "useTextures"), useTextures );
}

function waitForTextures1(tex) {
    setTimeout( function() {
    console.log("Waiting for: "+ tex.image.src) ;
    wtime = (new Date()).getTime() ;
    if( !tex.isTextureReady )
    {
        //console.log(wtime + " not ready yet") ;
        waitForTextures1(tex) ;
    }
    else
    {
        //console.log("ready to render") ;
        window.requestAnimFrame(render);
    }
               },5) ;
    
}

// Takes an array of textures and calls render if the textures are created
function waitForTextures(texs) {
    setTimeout( function() {
               var n = 0 ;
               for ( var i = 0 ; i < texs.length ; i++ )
               {
                    //console.log("boo"+texs[i].image.src) ;
                    n = n+texs[i].isTextureReady ;
               }
               wtime = (new Date()).getTime() ;
               if( n != texs.length )
               {
               //console.log(wtime + " not ready yet") ;
               waitForTextures(texs) ;
               }
               else
               {
               //console.log("ready to render") ;
               window.requestAnimFrame(render);
               }
               },5) ;
    
}

window.onload = function init() {

    canvas = document.getElementById( "gl-canvas" );
    
    gl = WebGLUtils.setupWebGL( canvas );
    if ( !gl ) { alert( "WebGL isn't available" ); }

    gl.viewport( 0, 0, canvas.width, canvas.height );
    gl.clearColor( 0.5, 0.5, 1.0, 1.0 );
    
    gl.enable(gl.DEPTH_TEST);

    //
    //  Load shaders and initialize attribute buffers
    //
    program = initShaders( gl, "vertex-shader", "fragment-shader" );
    gl.useProgram( program );
    
 
    // Load canonical objects and their attributes
    Cube.init(program);
    Cylinder.init(9,program);
    Cone.init(9,program) ;
    Sphere.init(36,program) ;

    gl.uniform1i( gl.getUniformLocation(program, "useTextures"), useTextures );

    // record the locations of the matrices that are used in the shaders
    modelViewMatrixLoc = gl.getUniformLocation( program, "modelViewMatrix" );
    normalMatrixLoc = gl.getUniformLocation( program, "normalMatrix" );
    projectionMatrixLoc = gl.getUniformLocation( program, "projectionMatrix" );
    
    // set a default material
    setColor(materialDiffuse) ;
    
  
    
    // set the callbacks for the UI elements
    document.getElementById("sliderXi").oninput = function() {
        RX = this.value ;
        window.requestAnimFrame(render);
    };
    document.getElementById("sliderYi").oninput = function() {
        RY = this.value;
        window.requestAnimFrame(render);
    };
    document.getElementById("sliderZi").oninput = function() {
        RZ =  this.value;
        window.requestAnimFrame(render);
    };
    
    document.getElementById("animToggleButton").onclick = function() {
        if( animFlag ) {
            animFlag = false;
        }
        else {
            animFlag = true  ;
            resetTimerFlag = true ;
            window.requestAnimFrame(render);
        }
    };
    
    document.getElementById("textureToggleButton").onclick = function() {
        toggleTextures() ;
        window.requestAnimFrame(render);
    };

    var controller = new CameraController(canvas);
    controller.onchange = function(xRot,yRot) {
        RX = xRot ;
        RY = yRot ;
        window.requestAnimFrame(render); };
    
    // load and initialize the textures
    initTextures() ;
    
    // Recursive wait for the textures to load
    waitForTextures(textureArray) ;
    //setTimeout (render, 100) ;
    
}

// Sets the modelview and normal matrix in the shaders
function setMV() {
    modelViewMatrix = mult(viewMatrix,modelMatrix) ;
    gl.uniformMatrix4fv(modelViewMatrixLoc, false, flatten(modelViewMatrix) );
    normalMatrix = inverseTranspose(modelViewMatrix) ;
    gl.uniformMatrix4fv(normalMatrixLoc, false, flatten(normalMatrix) );
}

// Sets the projection, modelview and normal matrix in the shaders
function setAllMatrices() {
    gl.uniformMatrix4fv(projectionMatrixLoc, false, flatten(projectionMatrix) );
    setMV() ;
    
}

// Draws a 2x2x2 cube center at the origin
// Sets the modelview matrix and the normal matrix of the global program
function drawCube() {
    setMV() ;
    Cube.draw() ;
}

// Draws a sphere centered at the origin of radius 1.0.
// Sets the modelview matrix and the normal matrix of the global program
function drawSphere() {
    setMV() ;
    Sphere.draw() ;
}
// Draws a cylinder along z of height 1 centered at the origin
// and radius 0.5.
// Sets the modelview matrix and the normal matrix of the global program
function drawCylinder() {
    setMV() ;
    Cylinder.draw() ;
}

// Draws a cone along z of height 1 centered at the origin
// and base radius 1.0.
// Sets the modelview matrix and the normal matrix of the global program
function drawCone() {
    setMV() ;
    Cone.draw() ;
}

function resetCam(setEye) {
    //setMV();
    viewMatrix = lookAt(setEye, at , up);
}

// Post multiples the modelview matrix with a translation matrix
// and replaces the modelview matrix with the result
function gTranslate(x,y,z) {
    modelMatrix = mult(modelMatrix,translate([x,y,z])) ;
}

// Post multiples the modelview matrix with a rotation matrix
// and replaces the modelview matrix with the result
function gRotate(theta,x,y,z) {
    modelMatrix = mult(modelMatrix,rotate(theta,[x,y,z])) ;
}

// Post multiples the modelview matrix with a scaling matrix
// and replaces the modelview matrix with the result
function gScale(sx,sy,sz) {
    modelMatrix = mult(modelMatrix,scale(sx,sy,sz)) ;
}

// Post multiples the modelview matrix with a translation matrix
// and replaces the modelview matrix with the result
function gCamTranslate(x,y,z) {
    setMV();
    viewMatrix = mult(viewMatrix,translate([x,y,z])) ;
}

// Post multiples the modelview matrix with a rotation matrix
// and replaces the modelview matrix with the result
function gCamRotate(theta,x,y,z) {
    setMV() ;
    viewMatrix = mult(viewMatrix,rotate(theta,[x,y,z])) ;
}

// Post multiples the modelview matrix with a scaling matrix
// and replaces the modelview matrix with the result
function gCamScale(sx,sy,sz) {
    setMV() ;
    viewMatrix = mult(viewMatrix,scale(sx,sy,sz)) ;
}

// Pops MS and stores the result as the current modelMatrix
function gPop() {
    modelMatrix = MS.pop() ;
}

// pushes the current modelMatrix in the stack MS
function gPush() {
    MS.push(modelMatrix) ;
}

function create_house(){
    gPush();
    {
        gRotate(-90,1,0,0);
        drawCylinder();
    }
    gPop();
    
    gPush();
    {   
        gScale(0.7,0.7,0.7);
        gTranslate(0,1,0);
        gRotate(-90,1,0,0);
        drawCone();
    }  
    gPop();
}


function render() {
    // ** code to display frames per second starts here **
    if(TIME - frame_time >= 2){
        console.log("FPS = " , frame_per_second/2);
        frame_per_second = 0;
        frame_time = frame_time +2;
    }else{
        frame_per_second++;
    }

    // ** code to display frames per second ends here **
    
    gl.clear( gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
    
    eye = vec3(0,0,10);
    eye[1] = eye[1] + 0 ;
   
    // set the projection matrix
    projectionMatrix = ortho(left, right, bottom, ytop, near, far);
    
    // set the camera matrix
    //rotate view matrix 360 degrees by manipulating camera slider
    //viewMatrix = mult(lookAt(eye, at , up), rotate(cam_angle,[0,1,0]));
    resetCam(eye);
    
    // initialize the modeling matrix stack
    MS= [] ;
    modelMatrix = mat4() ;
    
    // apply the slider rotations
    gRotate(RZ,0,0,1) ;
    gRotate(RY,0,1,0) ;
    gRotate(RX,1,0,0) ;
    
    // send all the matrices to the shaders
    setAllMatrices() ;
    
    // get real time
    var curTime ;
    if( animFlag )
    {
        curTime = (new Date()).getTime() /1000 ;
        if( resetTimerFlag ) {
            prevTime = curTime ;
            resetTimerFlag = false ;
        }
        TIME = TIME + curTime - prevTime ;
        prevTime = curTime ;
    }

    if(Math.cos(TIME/2)>=0){
        gCamScale(3, 3, 1);
        gCamRotate(TIME*18+10, 0, -1, 0);
    }
    
    gPush();
    {//floor
        gPush();{
            useTexture0(0, gl);
            useTexture1(0, gl);
            setColor(vec4(0,1,0,1));
            gTranslate(0,-4.2,0);
            gScale(8,3,8);
            drawCube();
        }
        gPop();
    }
    gPop();
    
    gPush();{
        useTexture0(2, gl);
        useTexture1(0, gl);
        setColor(vec4(1,1,1,1));
        gPush();{
            gTranslate(0, 0.7, 0);
            gScale(2.7, 2, 2.7);
            drawCube();
        }gPop();
        gPush();{
            gTranslate(0, 4.2,0);
            gScale(4, 3, 4);
            gRotate(90,-1,0,0);
            drawCone();
        }gPop();
    }gPop();

    gPush();
    {
        gRotate(TIME*18, 0, 1, 0);
        gTranslate(0, 0, 4.5);

        useTexture0(1, gl);
        useTexture1(1, gl);
        gPush();
        {// ** Cat modeling starts here **
            gTranslate(0.2, 0, 0);
            gRotate(16*Math.cos(2*TIME), 0, -1, 0);

            gPush();{
                gPush();{
                    setColor(vec4(1,0.65,0,1));
                    gTranslate(1.7, 1, 0);
                    gRotate(10*Math.cos(2*TIME)-5, 0, 0, 1);
                    gTranslate(-1.7, -1, 0);

                    gPush();
                    {//head
                        gTranslate(1.9,0.9,0);
                        gScale(0.5,0.5,0.5);
                        drawSphere();
                    }
                    gPop();
                    gPush();
                    {//right ear
                        gTranslate(2,1.3,-0.3);
                        gRotate(-90,1,0,0);
                        gRotate(-30,1,0,0);
                        gScale(0.25,0.25,0.25);
                        drawCone();
                    }gPop();
                    gPush();
                    {//left ear
                        gTranslate(2,1.3,0.3);
                        gRotate(-90,1,0,0);
                        gRotate(30,1,0,0);
                        gScale(0.25,0.25,0.25);
                        drawCone();
                    }gPop();

                    setColor(vec4(0,0,0,1));
                    gPush();
                    {//right eye
                        gTranslate(2.25,1,-0.18);
                        gScale(0.1,0.1,0.1);
                        drawSphere();
                    }gPop();
                    gPush();
                    {//left eye
                        gTranslate(2.25,1,0.18);
                        gScale(0.1,0.1,0.1);
                        drawSphere();
                    }gPop();
                    gPush();
                    {//nose
                        gTranslate(2.4,0.8,0);
                        gScale(0.1,0.1,0.1);
                        drawSphere();
                    }
                    gPop();
                    setColor(vec4(0,0,0,1));
                    gPush();
                    {//whiskers left upper
                        gTranslate(2.4,0.8,0.2);
                        create_whisker_part();
                    }
                    gPop();
                    gPush();
                    {//whiskers left bottom         
                        gTranslate(2.4,0.675,0.15);
                        gRotate(45,1,0,0);
                        create_whisker_part();
                    }gPop();
                    gPush();
                    {//whiskers right upper
                    gTranslate(2.4,0.8,-0.2);
                    create_whisker_part();
                    }
                    gPop();
                    gPush();
                    {//whiskers right bottom
                        gTranslate(2.4,0.675,-0.15);
                        gRotate(-45,1,0,0);
                        create_whisker_part();
                    }
                    gPop();
                }gPop();

                gPush();
                {//neck
                    setColor(vec4(1,0.65,0,1));
                    gTranslate(1.55,0.4,0);
                    gScale(0.3,0.3,0.3);
                    gRotate(90,1,0,0);
                    gRotate(-30,0,1,0);
                    drawCylinder();
                }
                gPop();

                setColor(vec4(1,0.65,0,1));
                gPush();{
                    gPush();{//body right (upper body)
                        gTranslate(1,0,0);
                        gScale(0.7,0.5,0.5);
                        drawSphere();
                    }gPop();
                    gPush();{
                        gTranslate(2,1.5,0);
                        gRotate(10*Math.cos(2*TIME)-5, 0, 0, 1);
                        gTranslate(-2,-1.5,0);
                        gPush();
                        {//front leg (right)
                            gTranslate(1.5,-0.5,-0.3);
                            gRotate(30,0,0,1);
                            create_leg_parts();
                        }
                        gPop();
                        gPush();
                        {//front foot (right)
                            gTranslate(1.8,-1,-0.3);
                            gRotate(45,0,0,1);
                            create_foot_part();
                        }
                        gPop();
                    }gPop();
                    gPush();{
                        gTranslate(1.5,1.5,0);
                        gRotate(10*Math.cos(2*TIME+10)-5, 0, 0, 1);
                        gTranslate(-1.5,-1.5,0);
                        gPush();
                        {//front leg (left)
                            gTranslate(1.5,-0.5,0.3);
                            gRotate(30,0,0,1);
                            create_leg_parts();
                        }
                        gPop();
                        gPush();
                        {//front foot (left)
                            gTranslate(1.8,-1,0.3);
                            gRotate(45,0,0,1);
                            create_foot_part();
                        }
                        gPop();
                    }gPop();
                }gPop();
            }gPop();

            gTranslate(0.3, 0, 0);
            gRotate(16*Math.cos(2*TIME), 0, 1, 0);
            setColor(vec4(1,0.65,0,1));
            gPush();{
                gPush();
                {//body left (lower body)
                    gScale(0.7,0.5,0.6);
                    drawSphere();
                }
                gPop();

                gPush();{
                    //left right seeing cat from the face
                    gRotate(20*Math.cos(2*TIME)-20, 0, 0, 1);
                    gPush();
                    {//back leg (right)
                        gTranslate(-0.2,-0.5,-0.25);
                        gRotate(30,0,0,1);
                        gScale(2,1,2);
                        create_leg_parts();
                    }
                    gPop();
                    gPush();
                    {//back foot (right)
                        gTranslate(0.1,-1,-0.3);
                        gRotate(45,0,0,1);
                        create_foot_part();
                    }
                    gPop();
                }gPop();
                gPush();{
                    gRotate(20*Math.cos(2*TIME+10)-20, 0, 0, 1);
                    gPush();
                    {//back leg (left)
                        gTranslate(-0.2,-0.5,0.25);
                        gRotate(30,0,0,1);
                        gScale(2,1,2);
                        create_leg_parts();
                    }
                    gPop();
                    gPush();
                    {//back foot (left)
                        gTranslate(0.1,-1,0.3);
                        gRotate(45,0,0,1);
                        create_foot_part();
                    }
                    gPop();
                }gPop();

                gPush();{//tail
                    gTranslate(-0.5,0,0);
                    tail();
                }gPop();
            }gPop();
        }
        gPop();
    }
    gPop();
    // ** Cat modling ends here **

    // ** House starts here **
    // appears every 5 second for 3 times.

    if( TIME - house_destroy_timer >= 8 && house_appear_counter < 4){
        house_appear_timer += 5*house_appear_counter;
        house_destroy_timer += 8*house_appear_counter;
        house_appear_counter++;
        //resetCam();
    }

    if(TIME - house_appear_timer > 5 && house_appear_counter < 4){
        gPush();
        {
            setColor(vec4(0,1,0,1));
            if(house_appear_counter == 0){
                gTranslate(-4,-0.5,0);
            }else if(house_appear_counter == 1){
                gTranslate(-4,-0.5,0);
            }else if(house_appear_counter == 2){
                gTranslate(2,-0.5,4);
            }else{
                gTranslate(-3,-0.5,4);
            }
            gScale(1.5,1.5,1.5);
            useTexture0(2, gl);
            useTexture1(2, gl);
            create_house();
        }
        gPop();
    }

    function tail(){
        for(let i = 1; i <= 5; i++){
            gTranslate(0,0.15,0);
            gRotate(20*Math.cos(2*TIME+i)+20, 0, 0, 1);
            gTranslate(0,0.15,0);
            gPush();{
                gScale(0.1,0.3,0.1);
                drawSphere();
            }gPop();
        }
    }
    function create_leg_parts(){
        gScale(0.15,0.4,0.15);
        drawSphere();
    }
    function create_foot_part(){
        gScale(0.1,0.3,0.1);
        drawSphere();
    }
    function create_whisker_part(){
        gScale(0.05,0.05,0.2);
        drawCylinder();
    }

    function useTexture0(i, gl){
        gl.activeTexture(gl.TEXTURE0);
        gl.bindTexture(gl.TEXTURE_2D, textureArray[i].textureWebGL);
        gl.uniform1i(gl.getUniformLocation(program, "texture" + (i + 1)), 0);
    }
    function useTexture1(i, gl){
        gl.activeTexture(gl.TEXTURE1);
        gl.bindTexture(gl.TEXTURE_2D, textureArray[i].textureWebGL);
        gl.uniform1i(gl.getUniformLocation(program, "texture" + (i + 1)), 1);
    }
    // ** House ends here **
    if( animFlag )
        window.requestAnimFrame(render);
}

// A simple camera controller which uses an HTML element as the event
// source for constructing a view matrix. Assign an "onchange"
// function to the controller as follows to receive the updated X and
// Y angles for the camera:
//
//   var controller = new CameraController(canvas);
//   controller.onchange = function(xRot, yRot) { ... };
//
// The view matrix is computed elsewhere.
function CameraController(element) {
    var controller = this;
    this.onchange = null;
    this.xRot = 0;
    this.yRot = 0;
    this.scaleFactor = 3.0;
    this.dragging = false;
    this.curX = 0;
    this.curY = 0;
    
    // Assign a mouse down handler to the HTML element.
    element.onmousedown = function(ev) {
        controller.dragging = true;
        controller.curX = ev.clientX;
        controller.curY = ev.clientY;
    };
    
    // Assign a mouse up handler to the HTML element.
    element.onmouseup = function(ev) {
        controller.dragging = false;
    };
    
    // Assign a mouse move handler to the HTML element.
    element.onmousemove = function(ev) {
        if (controller.dragging) {
            // Determine how far we have moved since the last mouse move
            // event.
            var curX = ev.clientX;
            var curY = ev.clientY;
            var deltaX = (controller.curX - curX) / controller.scaleFactor;
            var deltaY = (controller.curY - curY) / controller.scaleFactor;
            controller.curX = curX;
            controller.curY = curY;
            // Update the X and Y rotation angles based on the mouse motion.
            controller.yRot = (controller.yRot + deltaX) % 360;
            controller.xRot = (controller.xRot + deltaY);
            // Clamp the X rotation to prevent the camera from going upside
            // down.
            if (controller.xRot < -90) {
                controller.xRot = -90;
            } else if (controller.xRot > 90) {
                controller.xRot = 90;
            }
            // Send the onchange event to any listener.
            if (controller.onchange != null) {
                controller.onchange(controller.xRot, controller.yRot);
            }
        }
    };
}
