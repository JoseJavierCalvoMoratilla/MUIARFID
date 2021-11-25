/* Codigo html practica 3
//José Javier Calvo Moratilla
//GPC
//2021 
-->*/

// Variables de consenso
var renderer, scene, camera, camaraPlanta;
var controlesCam;

var material;

var L = 100; // Semilado de la caja ortográfica

function setCameras(ar) { //Relacion de aspecto

    var camaraOrtografica; // Cámara general

    camaraOrtografica = new THREE.OrthographicCamera(
        -L, L, L, -L, -100, 100);

    // Se genera una nueva cámara que va a alojarse arriba a la izquirda
    // La cámara se visualiza desde el ejece de las Y (Planta) 
    camaraPlanta = camaraOrtografica.clone();
    camaraPlanta.position.set(0, L, 0);
    camaraPlanta.lookAt(0, 0, 0);
    camaraPlanta.up = new THREE.Vector3(0, 0, -1); // Cambio la dirección de haz de la camara

    scene.add(camaraPlanta);

}

function init() {
    // Motor de render
    renderer = new THREE.WebGLRenderer();
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.setClearColor(new THREE.Color(0xFFFFFF));
    renderer.autoClear = false;
    document.getElementById('container').appendChild(renderer.domElement);
    

    // Escena
    scene = new THREE.Scene();

    // Camara
    var aspectRatio = window.innerWidth / window.innerHeight;
    camera = new THREE.PerspectiveCamera(75, aspectRatio, 0.1, 1000);
    camera.position.set(200, 300, 150);
    camera.lookAt(new THREE.Vector3(0, 0, 0));

    setCameras(aspectRatio);

    // Movimiento con raton
    controlesCam = new THREE.OrbitControls(camera, renderer.domElement);
    //controles.screenSpacePanning = true;
    controlesCam.target.set(0, 0, 0);

    // Captura de eventos, cambio de tamaño de la pantalla y ejecuta la función updateAspectRatio
    window.addEventListener('resize', updateAspectRatio);

}

function loadScene() {
    // Se define un material alámbrico de color rojo
    material = cargarMaterial();

    // Cargar el robot
    cargarRobot();

    // Cargar suelo
    cargarSuelo(); 

}

function cargarMaterial() {
    return new THREE.MeshBasicMaterial({ color: 'red', wireframe: true });
}

function cargarSuelo() {
    // Un suelo (1000 x 1000) plano XZ
    var suelo = new THREE.Mesh(new THREE.PlaneGeometry(1000, 1000, 30, 30), material);
    suelo.rotation.x = -Math.PI / 2;
    scene.add(suelo);
}

function cargarRobot() {
    //Se definen las diferentes piezas del robot
    robot = new THREE.Object3D();
    // 1. Base de robot, cilindro
    var geoBase = new THREE.CylinderGeometry(50, 50, 15, 25); //50 radio alto y bajo, 15 de altura, 30 ejes alámbricos
    const baseRobot = new THREE.Mesh(geoBase, material);
    baseRobot.position.set(0, 0, 0);

    // 2. Brazo del robot, cilindro gira y -90 grados
    const brazoRobot = new THREE.Object3D();
    var geoEje = new THREE.CylinderGeometry(20, 20, 18, 15); //20 radio, 18 altura, alambrico 15
    var geoEsparrago = new THREE.BoxGeometry(18, 120, 12);
    var geoRotula = new THREE.SphereGeometry(20, 15);

    const ejeBrazo = new THREE.Mesh(geoEje, material);
    ejeBrazo.rotation.z = Math.PI / 2; //Se gira 90 grados eje z
    brazoRobot.add(ejeBrazo);

    const esparragoBrazo = new THREE.Mesh(geoEsparrago, material);
    esparragoBrazo.position.set(0, 50, 0);
    brazoRobot.add(esparragoBrazo);

    const rotulaBrazo = new THREE.Mesh(geoRotula, material);
    rotulaBrazo.position.set(0, 120, 0);
    brazoRobot.add(rotulaBrazo);

    // 3. Antebrazo del robot
    const anteBrazoRobot = new THREE.Object3D();
    var geoDisco = new THREE.CylinderGeometry(22, 22, 6, 15); //22 radio, 6 altura, alambrico 15
    var geoNervios = new THREE.BoxGeometry(4, 80, 4);
    var geoManos = new THREE.CylinderGeometry(15, 15, 40, 15);

    const discoAnteBrazo = new THREE.Mesh(geoDisco, material);

    const nerviosAnteBrazo1 = new THREE.Mesh(geoNervios, material);
    nerviosAnteBrazo1.position.set(-9, 34, 9);

    const nerviosAnteBrazo2 = new THREE.Mesh(geoNervios, material);
    nerviosAnteBrazo2.position.set(9, 34, 9);

    const nerviosAnteBrazo3 = new THREE.Mesh(geoNervios, material);
    nerviosAnteBrazo3.position.set(9, 34, -9);

    const nerviosAnteBrazo4 = new THREE.Mesh(geoNervios, material);
    nerviosAnteBrazo4.position.set(-9, 34, -9);

    // 4. Mano del robot
    const manosAnteBrazo = new THREE.Mesh(geoManos, material);
    manosAnteBrazo.position.set(0, 70, 5);
    manosAnteBrazo.rotation.z = Math.PI / 2; //Se gira 90 grados eje z    

    anteBrazoRobot.position.set(0, 120, 0);

    var geoPinza = new THREE.Geometry();

    geoPinza.vertices.push(
        new THREE.Vector3(0, -8, -10),
        new THREE.Vector3(19, -8, -10),
        new THREE.Vector3(0, -8, 10),
        new THREE.Vector3(19, -8, 10),
        new THREE.Vector3(0, -12, -10),
        new THREE.Vector3(19, -12, -10),
        new THREE.Vector3(0, -12, 10),
        new THREE.Vector3(19, -12, 10),
        new THREE.Vector3(38, -8, -5),
        new THREE.Vector3(38, -12, -5),
        new THREE.Vector3(38, -8, 5),
        new THREE.Vector3(38, -12, 5),
    );

    geoPinza.faces.push(
        new THREE.Face3(0, 3, 2),
        new THREE.Face3(0, 1, 3),
        new THREE.Face3(1, 7, 3),
        new THREE.Face3(1, 5, 7),
        new THREE.Face3(5, 6, 7),
        new THREE.Face3(5, 4, 6),
        new THREE.Face3(4, 2, 6),
        new THREE.Face3(4, 0, 2),
        new THREE.Face3(2, 7, 6),
        new THREE.Face3(2, 3, 7),
        new THREE.Face3(4, 1, 0),
        new THREE.Face3(4, 5, 1),
        new THREE.Face3(1, 10, 3),
        new THREE.Face3(1, 8, 10),
        new THREE.Face3(8, 11, 10),
        new THREE.Face3(8, 9, 11),
        new THREE.Face3(9, 7, 11),
        new THREE.Face3(9, 5, 7),
        new THREE.Face3(3, 11, 7),
        new THREE.Face3(3, 10, 11),
        new THREE.Face3(5, 8, 1),
        new THREE.Face3(5, 9, 8),
    );

    var pinzaIz = new THREE.Mesh(geoPinza, material);
    pinzaIz.rotation.y = Math.PI / 2;

    var pinzaDe = new THREE.Mesh(geoPinza, material);
    pinzaDe.rotation.y = Math.PI / 2;
    pinzaDe.position.set(0, 20, 0);

    // Grafo de elementos
    anteBrazoRobot.add(discoAnteBrazo);
    anteBrazoRobot.add(nerviosAnteBrazo1);
    anteBrazoRobot.add(nerviosAnteBrazo2);
    anteBrazoRobot.add(nerviosAnteBrazo3);
    anteBrazoRobot.add(nerviosAnteBrazo4);
    brazoRobot.add(anteBrazoRobot);
    anteBrazoRobot.add(manosAnteBrazo);
    manosAnteBrazo.add(pinzaIz);
    manosAnteBrazo.add(pinzaDe);

    robot.add(baseRobot);
    baseRobot.add(brazoRobot);
    scene.add(robot);
}

function updateAspectRatio() {
    // Se dispara cuando se cambia el área de dibujo
    renderer.setSize(window.innerWidth, window.innerHeight);
    var ar = window.innerWidth / window.innerHeight;
    camera.aspect = ar;
    camera.updateProjectionMatrix();

    camaraPlanta.left = -L;
    camaraPlanta.right = L;
    camaraPlanta.bottom = -L;
    camaraPlanta.top = L;
   
    camaraPlanta.updateProjectionMatrix();
}



function update() {
    //document.getElementById('container').focus();

}

function render() {
    requestAnimationFrame(render);
    update();
    //renderer.render(scene, camera);
    renderer.clear();

    renderer.setViewport(0, 0, window.innerWidth, window.innerHeight);
    renderer.render(scene, camera);

    renderer.setViewport(0, 0, window.innerHeight / 4, window.innerHeight / 4);
    renderer.render(scene, camaraPlanta);
}


// Acciones
init();
loadScene();
render();