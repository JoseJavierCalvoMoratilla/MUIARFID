//José Javier Calvo Moratilla 2021
//Graficos por computador
//Seminario 4

/**
 * Seminario GPC #4  AnimaciÃģn por simulaciÃģn fÃ­sica.
 * Esferas en habitaciÃģn cerrada con molinete central
 * 
 * @requires three_r96.js, coordinates.js, orbitControls.js, cannon.js, tween.js, stats_r16.js
 * @author rvivo / http://personales.upv.es/rvivo
 * @date 2020
 */

// Globales convenidas por threejs
var renderer, scene, camera;
// Control de camara
var cameraControls;
// Monitor de recursos
var stats;
// Mundo fisico
var world, reloj;
// Objetos
const nesferas = 20;
var esferas = [];

// Monitor
var stats;

initPhysicWorld();
initVisualWorld();
loadWorld();
render();

/**
 * Construye una bola con cuerpo y vista
 */
function esfera( radio, posicion, material ){
	var masa = 1;
	this.body = new CANNON.Body( {mass: masa, material: material} );
	this.body.addShape( new CANNON.Sphere( radio ) );
	this.body.position.copy( posicion );
	this.visual = new THREE.Mesh( new THREE.SphereGeometry( radio ), 
		          new THREE.MeshBasicMaterial( {wireframe: true } ) );
	this.visual.position.copy( this.body.position );
}

/**
 * Inicializa el mundo fisico con un
 * suelo y cuatro paredes de altura infinita
 */
function initPhysicWorld()
{
	// Mundo 
  	world = new CANNON.World(); 
   	world.gravity.set(0,-9.8,0); 
   	///world.broadphase = new CANNON.NaiveBroadphase(); 
   	world.solver.iterations = 10; 

   	// Material y comportamiento
    var groundMaterial = new CANNON.Material("groundMaterial");
    var materialEsfera = new CANNON.Material("sphereMaterial");
    world.addMaterial( materialEsfera );
    world.addMaterial( groundMaterial );
    // -existe un defaultContactMaterial con valores de restitucion y friccion por defecto
    // -en caso que el material tenga su friccion y restitucion positivas, estas prevalecen 
    var sphereGroundContactMaterial = new CANNON.ContactMaterial(groundMaterial,materialEsfera,
    										    				{ friction: 0.3, 
    										      				  restitution: 0.7 });
    world.addContactMaterial(sphereGroundContactMaterial);

    // Suelo
    var groundShape = new CANNON.Plane();
    var ground = new CANNON.Body({ mass: 0, material: groundMaterial });
    ground.addShape(groundShape);
    ground.quaternion.setFromAxisAngle(new CANNON.Vec3(1,0,0),-Math.PI/2);
    world.addBody(ground);

    // Paredes
    var backWall = new CANNON.Body( {mass:0, material:groundMaterial} );
    backWall.addShape( new CANNON.Plane() );
    backWall.position.z = -5;
    world.addBody( backWall );
    var frontWall = new CANNON.Body( {mass:0, material:groundMaterial} );
    frontWall.addShape( new CANNON.Plane() );
    frontWall.quaternion.setFromEuler(0,Math.PI,0,'XYZ');
    frontWall.position.z = 5;
    world.addBody( frontWall );
    var leftWall = new CANNON.Body( {mass:0, material:groundMaterial} );
    leftWall.addShape( new CANNON.Plane() );
    leftWall.position.x = -5;
    leftWall.quaternion.setFromEuler(0,Math.PI/2,0,'XYZ');
    world.addBody( leftWall );
    var rightWall = new CANNON.Body( {mass:0, material:groundMaterial} );
    rightWall.addShape( new CANNON.Plane() );
    rightWall.position.x = 5;
    rightWall.quaternion.setFromEuler(0,-Math.PI/2,0,'XYZ');
    world.addBody( rightWall );
}

/**
 * Inicializa la escena visual
 */
function initVisualWorld()
{
	// Inicializar el motor de render
	renderer = new THREE.WebGLRenderer();
	renderer.setSize( window.innerWidth, window.innerHeight );
	renderer.setClearColor( new THREE.Color(0x000000) );
	document.getElementById( 'container' ).appendChild( renderer.domElement );

	// Crear el grafo de escena
	scene = new THREE.Scene();

	// Reloj
	reloj = new THREE.Clock();
	reloj.start();

	// Crear y situar la camara
	var aspectRatio = window.innerWidth / window.innerHeight;
	camera = new THREE.PerspectiveCamera( 75, aspectRatio , 0.1, 100 );
	camera.position.set( 2,5,10 );
	camera.lookAt( new THREE.Vector3( 0,0,0 ) );
	// Control de camara
	cameraControls = new THREE.OrbitControls( camera, renderer.domElement );
	cameraControls.target.set(0,0,0);

	// STATS --> stats.update() en update()
	stats = new Stats();
	stats.showPanel(0);	// FPS inicialmente. Picar para cambiar panel.
	document.getElementById( 'container' ).appendChild( stats.domElement );

	// Callbacks
	window.addEventListener('resize', updateAspectRatio );
}

/**
 * Carga los objetos es el mundo fÃ­sico y visual
 */
function loadWorld()
{
	// Genera las esferas
	var materialEsfera;
	for( i=0; i<world.materials.length; i++){
		if( world.materials[i].name === "sphereMaterial" ) materialEsfera = world.materials[i];
	}
	for (var i = 0; i < nesferas; i++) {;
		var e = new esfera( 1/2, new CANNON.Vec3( -1, i+1, 0 ), materialEsfera );
		world.addBody( e.body );
		scene.add( e.visual );
		esferas.push( e );
	};
    // Restricciones
 	for (var i = 0; i < esferas.length-1; i++) {
    	var restriccion = new CANNON.PointToPointConstraint(esferas[i].body,
    												    new CANNON.Vec3( 0, 1/2, 0),
    												    esferas[i+1].body,
														new CANNON.Vec3( 0, -1/2, 0) ); 
     	world.addConstraint( restriccion );
 	};   

	// El molinete: Es un disco fijo (masa=0) con velocidad angular que se representa como
	// un disco girando con tween
    var discShape = new CANNON.Cylinder(2,2,0.1,10); // ojo: eje en z
    var discBody = new CANNON.Body({ mass: 0 });
    discBody.addShape(discShape);
    discBody.quaternion.setFromEuler( -Math.PI/2,0,0 );
    discBody.angularVelocity.set(0,3,0); 
    discBody.angularDamping = 0.1;
    world.addBody(discBody);

	var molinete = new THREE.Mesh( new THREE.CylinderGeometry(2,2,0.1), 				
						   		   new THREE.MeshBasicMaterial( {wireframe:true}) ); 
	scene.add( molinete );
	molinete.add( new THREE.AxisHelper(1) );
	molinete.position.copy( discBody.position );

	var giro = new TWEEN.Tween( molinete.rotation ).to( {x:0, y:2*Math.PI, z:0}, 1000 );
	giro.repeat(Infinity);
	giro.start();

	// Suelo
	Coordinates.drawGrid({size:10,scale:1, orientation:"x"});

	scene.add( new THREE.AxisHelper(5 ) );


}

/**
 * IsotropÃ­a frente a redimension del canvas
 */
function updateAspectRatio()
{
	renderer.setSize(window.innerWidth, window.innerHeight);
	camera.aspect = window.innerWidth/window.innerHeight;
	camera.updateProjectionMatrix();
}

/**
 * Actualizacion segun pasa el tiempo
 */
function update()
{
	var segundos = reloj.getDelta();	// tiempo en segundos que ha pasado
	world.step( segundos );				// recalcula el mundo tras ese tiempo

	for (var i = 0; i < esferas.length; i++) {
		esferas[i].visual.position.copy( esferas[i].body.position );
		esferas[i].visual.quaternion.copy( esferas[i].body.quaternion );
	};

	// Actualiza el monitor 
	stats.update();

	// Actualiza el movimeinto del molinete
	TWEEN.update();
}

/**
 * Update & render
 */
function render()
{
	requestAnimationFrame( render );
    stats.begin();
	update();
	renderer.render( scene, camera );
    stats.end();
}   