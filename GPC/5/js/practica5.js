/* Codigo html practica 5
//José Javier Calvo Moratilla
//GPC
//2021 
-->*/

// Variables de consenso
var renderer, scene, camera, camaraPlanta;
var controlesCam;

var materialRobot;
var materialSuelo, materialBase, materialRodilla, materialEsparragos, materialPinzas, materialCube;
var material;

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
    
    // Habilitamos sombras
    renderer.shadowMapEnabled = true;

    // Escena
    scene = new THREE.Scene();

    // Camara
    var aspectRatio = window.innerWidth / window.innerHeight;
    camera = new THREE.PerspectiveCamera(75, aspectRatio, 0.1, 3000);
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
    // Se define un material alámbrico de color rojo
    materialFloor = new THREE.MeshBasicMaterial({ color: 'blue', wireframe: true });
    material = new THREE.MeshBasicMaterial({ color: 'red', wireframe: true });

    // Se carga el robot
    cargarRobot();

    // Se carga el suelo
    cargarSuelo();

    // Carga las figuras raras
    cargarFiguras();

    // Carga la iluminacion
    cargarLuces();

    // Cargar el entorno
    cargarEntorno();

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
        function (color) {
            robot.traverse(function (hijo) {
                if (hijo instanceof THREE.Mesh)
                    hijo.material.color = new THREE.Color(color);

            });
        });

}

function cargarLuces() {

    //Luces
    var luzAmbiente = new THREE.AmbientLight(0xFFFFFF, 0.5);
	scene.add( luzAmbiente );

    var luzDireccional = new THREE.DirectionalLight(0xFFFFFF,0.5);
	luzDireccional.position.set(-10,5,10 );
	scene.add(luzDireccional)

    var luzPuntual = new THREE.PointLight(0xFFFFFF,0.5);
	luzPuntual.position.set( -10, 10, -10 );
	scene.add( luzPuntual );

    var luzFocal = new THREE.SpotLight(0xFFFFFF,0.5);
	luzFocal.position.set( -700,400,3 );
	luzFocal.target.position.set(0,0,0);
	luzFocal.angle = Math.PI/8;
	luzFocal.penumbra = 0.2;
	luzFocal.castShadow = true;

	luzFocal.shadow.camera.near = 1;
	luzFocal.shadow.camera.far = 3000;
	luzFocal.shadow.camera.fov = 50;
	luzFocal.shadow.mapSize.width = 1024;
	luzFocal.shadow.camera.height = 1024;	
	scene.add( new THREE.CameraHelper(luzFocal.shadow.camera) );
	scene.add(luzFocal);


    //var luzHemisferica = new THREE.HemisphereLight(0xffffff, 0x444444);
    //luzHemisferica .position.set(0, 300, 0);
    //scene.add(luzHemisferica );   


}

function cargarFiguras() {
    // Figura rara
    const geometry = new THREE.TorusKnotGeometry(10, 3, 100, 10);
    const material2 = new THREE.MeshBasicMaterial({ color: 0x000000, wireframe: false });
    const torusKnot = new THREE.Mesh(geometry, material2);
    torusKnot.position.set(0, 10.0, 150.0);
    torusKnot.castShadow = true;
    torusKnot.receiveShadow = true;
    scene.add(torusKnot);
    
}

function cargarSuelo() {

    // Textura para el suelo
    materialSuelo = cargarTextura("suelo.jpg", 4, 'phong');

    // Un suelo (1000 x 1000) plano XZ
    var suelo = new THREE.Mesh(new THREE.PlaneGeometry(2000, 2000, 10, 10), materialSuelo);
    suelo.rotation.x = -Math.PI / 2;
    suelo.receiveShadow = true;
    suelo.castShadow= true;
    scene.add(suelo);
}

function cargarEntorno() {

    var paredes = [ 'textures/pond/posx.jpg','textures/pond/negx.jpg',
					'textures/pond/posy.jpg','textures/pond/negy.jpg',
					'textures/pond/posz.jpg','textures/pond/negz.jpg'
	              ];
 	
    var mapaEntorno = new THREE.CubeTextureLoader().load(paredes);

    // Habitacion
	var shader = THREE.ShaderLib.cube;
	shader.uniforms.tCube.value = mapaEntorno;

	var matparedes = new THREE.ShaderMaterial({
		fragmentShader: shader.fragmentShader,
		vertexShader: shader.vertexShader,
		uniforms: shader.uniforms,
		//dephtWrite: false,
		side: THREE.BackSide
	});

	var habitacion = new THREE.Mesh( new THREE.CubeGeometry(3000,3000,3000),matparedes);
    habitacion.position.set(0,1500,0);
    habitacion.receiveShadow = true;
    habitacion.castShadow = true;
	scene.add(habitacion);

}

function cargarRobot() {

    // Cargar los materiales
    materialBase = cargarTextura('hierro.jpg', 1, 'phong');
    materialRotula = cargarTextura('rotula.jpg', 1, 'phong');
    materialEsparragos = cargarTextura('oro.jpg', 1, 'lambert');
    materialPinzas = cargarTextura('hierro.jpg', 1, 'lambert');

    //Se definen las diferentes piezas del robot
    robot = new THREE.Object3D(); 
    // 1. Base de robot, cilindro    
    var geoBase = new THREE.CylinderGeometry(50, 50, 15, 30); //50 radio alto y bajo, 15 de altura, 30 ejes alámbricos
    const baseRobot = new THREE.Mesh(geoBase, materialBase);
    baseRobot.castShadow = true;
    baseRobot.receiveShadow = true;
    baseRobot.position.set(0, 0, 0);  

    // 2. Brazo del robot, cilindro gira y -90 grados
    brazoRobot = new THREE.Object3D();
    var geoEje = new THREE.CylinderGeometry(20, 20, 18, 15); //20 radio, 18 altura, alambrico 15
    var geoEsparrago = new THREE.BoxGeometry(18, 120, 12);
    var geoRotula = new THREE.SphereGeometry(20, 15);

    ejeBrazo = new THREE.Mesh(geoEje, materialBase);
    ejeBrazo.rotation.z = Math.PI / 2; //Se gira 90 grados eje z
    ejeBrazo.castShadow = true;
    ejeBrazo.receiveShadow = true;
    brazoRobot.add(ejeBrazo);

    esparragoBrazo = new THREE.Mesh(geoEsparrago, materialBase);
    esparragoBrazo.position.set(0, 50, 0);
    esparragoBrazo.castShadow = true;
    esparragoBrazo.receiveShadow = true;
    brazoRobot.add(esparragoBrazo);

    materialRelfejoRodilla = materialReflejo();

    rotulaBrazo = new THREE.Mesh(geoRotula, materialRelfejoRodilla);
    rotulaBrazo.castShadow = true;
    rotulaBrazo.receiveShadow = true;
    
    rotulaBrazo.position.set(0, 120, 0);
    brazoRobot.add(rotulaBrazo);

    // 3. Antebrazo del robot
    anteBrazoRobot = new THREE.Object3D();
    var geoDisco = new THREE.CylinderGeometry(22, 22, 6, 15); //22 radio, 6 altura, alambrico 15
    var geoNervios = new THREE.BoxGeometry(4, 80, 4);
    var geoManos = new THREE.CylinderGeometry(15, 15, 40, 15);

    const discoAnteBrazo = new THREE.Mesh(geoDisco, materialEsparragos);
    discoAnteBrazo.castShadow = true;
    discoAnteBrazo.receiveShadow = true;

    const nerviosAnteBrazo1 = new THREE.Mesh(geoNervios, materialEsparragos);
    nerviosAnteBrazo1.position.set(-9, 34, 9);

    const nerviosAnteBrazo2 = new THREE.Mesh(geoNervios, materialEsparragos);
    nerviosAnteBrazo2.position.set(9, 34, 9);

    const nerviosAnteBrazo3 = new THREE.Mesh(geoNervios, materialEsparragos);
    nerviosAnteBrazo3.position.set(9, 34, -9);

    const nerviosAnteBrazo4 = new THREE.Mesh(geoNervios, materialEsparragos);
    nerviosAnteBrazo4.position.set(-9, 34, -9);

    nerviosAnteBrazo1.castShadow = true;
    nerviosAnteBrazo1.receiveShadow = true;
    nerviosAnteBrazo2.castShadow = true;
    nerviosAnteBrazo2.receiveShadow = true;
    nerviosAnteBrazo3.castShadow = true;
    nerviosAnteBrazo3.receiveShadow = true;
    nerviosAnteBrazo4.castShadow = true;
    nerviosAnteBrazo4.receiveShadow = true;

    // 4. Mano del robot
    manosAnteBrazo = new THREE.Mesh(geoManos, materialEsparragos);
    manosAnteBrazo.position.set(0, 70, 5);
    manosAnteBrazo.rotation.z = Math.PI / 2; //Se gira 90 grados eje z   
    manosAnteBrazo.castShadow = true;
    manosAnteBrazo.receiveShadow = true; 

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

    pinzaIz = new THREE.Mesh(geoPinza, materialPinzas);
    pinzaIz.rotation.y = Math.PI / 2;
    pinzaIz.position.set(0, 100, 0);

    pinzaDe = new THREE.Mesh(geoPinza, materialPinzas);
    pinzaDe.rotation.y = Math.PI / 2;
    pinzaDe.position.set(0, 20, 0);
    
    pinzaIz.castShadow = true;
    pinzaIz.receiveShadow = true;
    pinzaDe.castShadow = true;
    pinzaDe.receiveShadow = true;

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

function materialReflejo(){

    var paredes = [ 'textures/pond/posx.jpg','textures/pond/negx.jpg',
					'textures/pond/posy.jpg','textures/pond/negy.jpg',
					'textures/pond/posz.jpg','textures/pond/negz.jpg'
	              ];
       
  
  var mapaEntorno = new THREE.CubeTextureLoader().load(paredes);
  
  //Material brillante 
  var materialBrillante = new THREE.MeshPhongMaterial({color:'white',
                                                       specular:'white',
                                                       shininess: 50,
                                                       envMap:mapaEntorno });
    return materialBrillante;

}

function cargarTextura(nombre, repeticiones, modo) {

    var materialTexture;

    // Textura para el suelo
    const texture = new THREE.TextureLoader().load("./textures/" + nombre);
    texture.wrapS = THREE.RepeatWrapping;
    texture.wrapT = THREE.RepeatWrapping;
    texture.repeat.set(repeticiones, repeticiones);

    if (modo == 'basic') {
        materialTexture = new THREE.MeshBasicMaterial({
            map: texture,
        });
    } else if (modo == 'lambert') {
        materialTexture = new THREE.MeshLambertMaterial({
            map: texture,
        });
    }
    else if (modo == 'phong') {
        materialTexture = new THREE.MeshPhongMaterial({
            map: texture,
        });
    }
        return materialTexture;
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