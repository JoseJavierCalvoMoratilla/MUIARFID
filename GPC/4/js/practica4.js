/* Codigo html practica 4
//José Javier Calvo Moratilla
//GPC
//2021 
-->*/

// Variables de consenso
var renderer, scene, camera, camaraPlanta;
var controlesCam;

var material, materialFloor;

var L = 100; // Semilado de la caja ortográfica

function setCameras(ar) { //Relacion de aspecto

    var camaraOrtografica; // Cámara general

    camaraOrtografica = new THREE.OrthographicCamera(-L, L, L, -L, -100, 100);

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

    //Listener para las 4 teclas del teclado para mover el robot 
    window.addEventListener('keyup', moveRobot);


    // STATS --> stats.update() en update()
    stats = new Stats();
    stats.showPanel(0); // FPS inicialmente. Picar para cambiar panel.
    document.getElementById('container').appendChild(stats.domElement);

}

function loadScene() {
    
    // Se cargan los materiales
    cargarMateriales();

    // Se carga el robot
    cargarRobot();

    // Se carga el suelo
    cargarSuelo();

    // Se carga la figura
    cargarFiguras();

    // Se cargan las luces 
    cargarLuces();

}

function cargarSuelo() {
     // Textura para el suelo
     const texture = new THREE.TextureLoader().load("./textures/hierro.jpg");
     texture.wrapS = THREE.RepeatWrapping;
     texture.wrapT = THREE.RepeatWrapping;
     texture.repeat.set(1, 1);
 
     const materialTexture = new THREE.MeshStandardMaterial({
         map: texture,
     });
 
     // Un suelo (1000 x 1000) plano XZ
     var suelo = new THREE.Mesh(new THREE.PlaneGeometry(1000, 1000, 10, 10), materialTexture);
     suelo.rotation.x = -Math.PI / 2;
     scene.add(suelo);
}

function cargarFiguras() {
    // Figura rara
    const geometry = new THREE.TorusKnotGeometry(10, 3, 100, 10);
    const material2 = new THREE.MeshBasicMaterial({ color: 0x000000, wireframe: true });
    const torusKnot = new THREE.Mesh(geometry, material2);
    torusKnot.position.set(0, 10.0, 150.0);
    scene.add(torusKnot);
}
function cargarMateriales() {
     // Se define un material alámbrico de color rojo
     materialFloor = new THREE.MeshBasicMaterial({ color: 'blue', wireframe: true });
     material = new THREE.MeshBasicMaterial({ color: 'red', wireframe: true });
}

function cargarLuces() {
     //Luces
     var hemiLight = new THREE.HemisphereLight(0xffffff, 0x444444);
     hemiLight.position.set(0, 300, 0);
     scene.add(hemiLight);
 
     var dirLight = new THREE.DirectionalLight(0xffffff);
     dirLight.position.set(75, 300, -75);
     scene.add(dirLight);
}

function cargarRobot() {
    //Se definen las diferentes piezas del robot
    robot = new THREE.Object3D();
    // 1. Base de robot, cilindro
    var geoBase = new THREE.CylinderGeometry(50, 50, 15, 30); //50 radio alto y bajo, 15 de altura, 30 ejes alámbricos
    const baseRobot = new THREE.Mesh(geoBase, material);
    baseRobot.position.set(0, 0, 0);

    // 2. Brazo del robot, cilindro gira y -90 grados
    brazoRobot = new THREE.Object3D();
    var geoEje = new THREE.CylinderGeometry(20, 20, 18, 15); //20 radio, 18 altura, alambrico 15
    var geoEsparrago = new THREE.BoxGeometry(18, 120, 12);
    var geoRotula = new THREE.SphereGeometry(20, 15);

    ejeBrazo = new THREE.Mesh(geoEje, material);
    ejeBrazo.rotation.z = Math.PI / 2; //Se gira 90 grados eje z
    brazoRobot.add(ejeBrazo);

    esparragoBrazo = new THREE.Mesh(geoEsparrago, material);
    esparragoBrazo.position.set(0, 50, 0);
    brazoRobot.add(esparragoBrazo);

    rotulaBrazo = new THREE.Mesh(geoRotula, material);
    rotulaBrazo.position.set(0, 120, 0);
    brazoRobot.add(rotulaBrazo);

    // 3. Antebrazo del robot
    anteBrazoRobot = new THREE.Object3D();
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
    manosAnteBrazo = new THREE.Mesh(geoManos, material);
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

    pinzaIz = new THREE.Mesh(geoPinza, material);
    pinzaIz.rotation.y = Math.PI / 2;
    pinzaIz.position.set(0, 100, 0);

    pinzaDe = new THREE.Mesh(geoPinza, material);
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


function setupGUI() {
    // Objeto controlador de la interfaz
    effectController = {
        giroBase: 0.0,
        giroBrazo: 0.0,
        giroAnteBrazoY: 0.0,
        giroAnteBrazoZ: 0.0,
        giroPinza: 177.8,
        separaPinza: -5.0,
        colorMaterial: "rgb(255,0,0)"
    }

    var gui = new dat.GUI();
    var carpeta = gui.addFolder("Control Robot");

    //carpeta.add( effectController,"mensaje").name("Hola");
    carpeta.add(effectController, "giroBase", -180.0, 180.0, 0.2).name("Giro Base");
    carpeta.add(effectController, "giroBrazo", -45.0, 45.0, 0.2).name("Giro Brazo");
    carpeta.add(effectController, "giroAnteBrazoY", -180.0, 180.0, 0.2).name("Giro Antebrazo Y");
    carpeta.add(effectController, "giroAnteBrazoZ", -90.0, 90.0, 0.2).name("Giro Antebrazo Z");
    carpeta.add(effectController, "giroPinza", 40.0, 220.0, 0.2).name("Giro Pinza");
    carpeta.add(effectController, "separaPinza", -5.0, 7.4, 0.2).name("Separación Pinza");

    //carpeta.add( effectController,"reiniciar").name("Reiniciar");
    //carpeta.add( effectController,"check").name("Check sin uso");

    //Control del cambio de color del mesh
    var sensorColor = carpeta.addColor(effectController, "colorMaterial").name("Color");
    sensorColor.onChange(
        function(color) {
            robot.traverse(function(hijo) {
                if (hijo instanceof THREE.Mesh)
                    hijo.material.color = new THREE.Color(color);

            });
        });

}

function giroBase() {
    // Se obtiene el valor pasado por el GUI
    var grados = effectController.giroBase;
    robot.rotation.y = grados * Math.PI / 180; //En radianes
}

function giroBrazo() {
    // Se obtiene el valor pasado por el GUI
    var grados = effectController.giroBrazo;
    brazoRobot.rotation.x = -(grados * Math.PI / 180);
}

function giroAnteBrazoY() {
    // Se obtiene el valor pasado por el GUI
    var grados = effectController.giroAnteBrazoY;
    anteBrazoRobot.rotation.y = grados * Math.PI / 180;
}

function giroAnteBrazoZ() {
    // Se obtiene el valor pasado por el GUI
    var grados = effectController.giroAnteBrazoZ;
    anteBrazoRobot.rotation.x = grados * Math.PI / 180;
}

function giroPinza() {
    // Se obtiene el valor pasado por el GUI
    var grados = effectController.giroPinza;
    manosAnteBrazo.rotation.x = grados * Math.PI / 180;
}

function separaPinza() {
    // Se obtiene el valor pasado por el GUI
    var grados = effectController.separaPinza;
    pinzaDe.position.y = grados;
    pinzaIz.position.y = -grados + 20;
}

function moveRobot(event) {

    const keyName = event.key;
    //console.log(keyName);

    switch (keyName) {
        case 'ArrowUp':
            robot.position.z -= 10.0;
            break;
        case 'ArrowDown':
            robot.position.z += 10.0;
            break;
        case 'ArrowLeft':
            robot.position.x -= 10.0;
            break;
        case 'ArrowRight':
            robot.position.x += 10.0;
            break;
    }

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
    giroBase();
    giroBrazo();
    giroAnteBrazoY();
    giroAnteBrazoZ();
    giroPinza();
    separaPinza();
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
setupGUI();
loadScene();
render();