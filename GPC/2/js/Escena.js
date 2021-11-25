/**
 * Seminario 2. Escena basica en Threejs
 */

// Variables de consenso
var renderer, scene, camera;

// Otras globales
var esferaCubo;
var angulo = 0;

// Acciones
init();
loadScene();
render();

function init()
{
    // Motor de render
    renderer = new THREE.WebGLRenderer();
    renderer.setSize( window.innerWidth, window.innerHeight );
    renderer.setClearColor( new THREE.Color(0x0000AA) );
    document.getElementById('container').appendChild( renderer.domElement );

    // Escena
    scene = new THREE.Scene();

    // Camara
    camera = new THREE.PerspectiveCamera( 75, window.innerWidth/window.innerHeight, 0.1,1000);
    camera.position.set( 0.5, 2, 7 );
    camera.lookAt( new THREE.Vector3(0,0,0) );
}

function loadScene()
{
    var material = new THREE.MeshBasicMaterial( { color: 'yellow', wireframe: true } );

    var geoCubo = new THREE.BoxGeometry( 2,2,2 );
    var geoEsfera = new THREE.SphereGeometry( 1, 20,20 );

    var cubo = new THREE.Mesh( geoCubo, material );
    var esfera = new THREE.Mesh( geoEsfera, material );

    // Suelo
    var suelo = new THREE.Mesh( new THREE.PlaneGeometry(10,10, 10,10), material );
    suelo.rotation.x = -Math.PI / 2;
    scene.add(suelo);

    // Importar un modelo
    var loader = new THREE.ObjectLoader();

    loader.load( 'models/soldado/soldado.json', 
        function(objeto){
            cubo.add(objeto);
            objeto.position.y = 1;
        }
    )



    esferaCubo = new THREE.Object3D();
    esferaCubo.position.y = 1.5;
    cubo.position.x = -1;
    esfera.position.x = 1;
    cubo.add( new THREE.AxesHelper(1) );

    scene.add( esferaCubo);
    esferaCubo.add( cubo );
    esferaCubo.add( esfera );
 

    scene.add( new THREE.AxesHelper(3) );

}

function update()
{
    angulo += 0.01;
    esferaCubo.rotation.y = angulo;
}

function render()
{
    requestAnimationFrame( render );
    update();
    renderer.render( scene, camera );
}