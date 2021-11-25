/** 
*  Seminario 4. Ejemplo de animación e interfaz
*				Peonza que se mueve en un plano
*  @date 2021
*/

// Variables reservadas
var renderer, scene, camera;

// Controlador de camara
var cameraControls;

// Peonza
var peonza, eje;

// Control del tiempo
var antes = Date.now();
var angulo = 0;

// Monitor
var stats;

// GUI
var effectController;

// Acciones
init();
setupGUI();
loadScene();
render();

function init()
{
    // Configurar el motor
    renderer = new THREE.WebGLRenderer();
    renderer.setSize( window.innerWidth, window.innerHeight );
    renderer.setClearColor( new THREE.Color(0x0000AA));
    document.getElementById('container').appendChild( renderer.domElement );

    // Escena
    scene = new THREE.Scene();

    // Camara
    var ar = window.innerWidth / window.innerHeight;
    camera = new THREE.PerspectiveCamera( 75, ar, 0.1, 100 );
    camera.position.set( 2,2,3 );
    camera.lookAt( 0,0,0 );

    cameraControls = new THREE.OrbitControls( camera,renderer.domElement );
    cameraControls.target.set( 0,0,0 );

    // Eventos
    window.addEventListener( 'resize', updateAspectRatio );

    // Monitor
    stats = new Stats();
    stats.showPanel(0);
    document.getElementById('container').appendChild( stats.domElement );
    
}

function setupGUI()
{
	// Objeto controlador de la interfaz
	effectController = {
		mensaje: "Interfaz Peonza",
		vueltasXsg: 1.0,
		reiniciar: function(){
			TWEEN.removeAll();
			eje.position.set( -2.5,0,-2.5 );
			eje.rotation.set( 0, 0, 0 );
			startAnimation();
		},
		check: true,
		colorMaterial: "rgb(255,255,0)"
	}

	var gui = new dat.GUI();
	var carpeta = gui.addFolder("Control Peonza");

	carpeta.add( effectController,"mensaje").name("Hola");
	carpeta.add( effectController,"vueltasXsg",0.0,5.0,0.2).name("Vueltas/sg");
	carpeta.add( effectController,"reiniciar").name("Reiniciar");
	carpeta.add( effectController,"check").name("Check sin uso");
	var sensorColor = carpeta.addColor( effectController,"colorMaterial").name("Color");

	sensorColor.onChange( 
		function(color){
			peonza.traverse( function(hijo){
								if(hijo instanceof THREE.Mesh)
									hijo.material.color = new THREE.Color(color);

							 });
		});

}

function loadScene()
{
	var material = new THREE.MeshBasicMaterial( {color:'yellow',
                                                  wireframe: true} );

	eje = new THREE.Object3D();
	peonza = new THREE.Object3D();

	// Construir la peonza
	var cuerpo = new THREE.Mesh( new THREE.CylinderGeometry(1,0.2,2, 20,2),
		                         material );
	cuerpo.position.set(0,1.5,0);
	peonza.add(cuerpo);

	var punta = new THREE.Mesh( new THREE.CylinderGeometry(0.1,0,0.5, 10,1),
		                        material );
	punta.position.set(0,0.25,0);
	peonza.add(punta);

	var mango = new THREE.Mesh( new THREE.CylinderGeometry(0.1,0.1,0.5, 10,1),
		                        material );
	mango.position.set(0,2.75,0);
	peonza.add(mango);

	peonza.rotation.x = Math.PI/16;
	eje.position.set( -2.5,0,-2.5 );

	eje.add(peonza);

	scene.add(eje);
	scene.add(new THREE.AxesHelper(2));

	// Suelo
	Coordinates.drawGrid( {size:6, scale:1, orientation:"x"} );




}

function startAnimation()
{
	var movtIzq = new TWEEN.Tween( eje.position )
	              .to( { x:[-1.5, -2.5],
	                     y:[   0,    0],
	                     z:[   0,  2.5]}, 5000)
	              .interpolation( TWEEN.Interpolation.Bezier )
	              .easing( TWEEN.Easing.Bounce.Out );

	var movtFrente = new TWEEN.Tween( eje.position )
	              .to( { x:[   0,  2.5],
	                     y:[   0,    0],
	                     z:[   0,  2.5]}, 5000)
	              .interpolation( TWEEN.Interpolation.Bezier )
	              .easing( TWEEN.Easing.Bounce.Out );

	var movtDer = new TWEEN.Tween( eje.position )
	              .to( { x:[ 1.5,  2.5],
	                     y:[   0,    0],
	                     z:[   0, -2.5]}, 5000)
	              .interpolation( TWEEN.Interpolation.Bezier )
	              .easing( TWEEN.Easing.Bounce.Out );

	var movtTras = new TWEEN.Tween( eje.position )
	              .to( { x:[   0, -2.5],
	                     y:[   0,    0],
	                     z:[-1.5, -2.5]}, 5000)
	              .interpolation( TWEEN.Interpolation.Bezier )
	              .easing( TWEEN.Easing.Bounce.Out );

	movtIzq.chain( movtFrente );
	movtFrente.chain( movtDer );
	movtDer.chain( movtTras );

	movtIzq.start();

	var giro = new TWEEN.Tween( eje.rotation )
					.to( {x:0,y:Math.PI*2,z:0}, 10000 );
	giro.repeat(Infinity);
	giro.start();


}

function updateAspectRatio()
{
    // Cambiar el tamanyo del canvas
    renderer.setSize( window.innerWidth, window.innerHeight );

    var ar = window.innerWidth / window.innerHeight;
    camera.aspect = ar;
    camera.updateProjectionMatrix();
}

function update()
{
	var ahora = Date.now();
	var vueltasXsg = effectController.vueltasXsg;
	angulo += vueltasXsg * Math.PI * 2 * (ahora-antes)/1000;
	peonza.rotation.y = angulo;
	//eje.rotation.y = angulo/5;
	antes = ahora;

	TWEEN.update();
}

function render()
{
    requestAnimationFrame( render );
    stats.begin();
    update();
    renderer.render( scene,camera );
    stats.end();
}