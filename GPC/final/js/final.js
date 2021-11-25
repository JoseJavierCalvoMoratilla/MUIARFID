/* ##########################################################################################
Codigo js Proyecto Final
José Javier Calvo Moratilla
GPC
2021 
##############################################################################################*/

// VARIABLES
//############################################################################################
// Variables del proyecto
var renderer, scene, camera, camaraPlanta;
var controlesCam;

// Monitor de estadisticas superior izquierdo
var stats;

//Variable para la fuente
var loaderDeTexto = new THREE.FontLoader();

// Variables para el control de las luces
var luzAmbiente;
var luzHab;
var estadoluzHab = true;

var L = 100; // Semilado de la caja ortográfica
//############################################################################################

// FUNCIONES
//#############################################################################################

// Función de carga inicial de elementos en la vista
function init() {
    // Motor de render
    renderer = new THREE.WebGLRenderer();
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.setClearColor(new THREE.Color(0xFFFFFF));
    renderer.autoClear = false;
    document.getElementById('container').appendChild(renderer.domElement);

    //Sombras
    renderer.shadowMap.enabled = true;

    // Escena
    scene = new THREE.Scene();

    // Camara
    var aspectRatio = window.innerWidth / window.innerHeight;
    camera = new THREE.PerspectiveCamera(75, aspectRatio, 0.1, 10000);
    camera.position.set(0, 120, 586);
    camera.lookAt(new THREE.Vector3(0, 0, 0));

    // Luces
    setLuces();

    // Movimiento con raton
    controlesCam = new THREE.OrbitControls(camera, renderer.domElement);
    //controles.screenSpacePanning = true;
    controlesCam.target.set(0, 0, 0);

    // Estadisticas vista
    stats = new Stats();
    stats.showPanel(0); // FPS inicialmente. Picar para cambiar panel.
    document.getElementById('container').appendChild(stats.domElement);

    // Captura de eventos, cambio de tamaño de la pantalla y ejecuta la función updateAspectRatio
    window.addEventListener('resize', updateAspectRatio);

    // Evento doblekick encendido apagado luces de la habitación
    renderer.domElement.addEventListener('dblclick', controlAlum);

    // Actualiza la hora de la pantalla de la habitación
    actualizarHora('', 15, 50, 140, -180);

    // Se define el color de fondo inicial
    renderer.setClearColor("rgb(0,0,0)");

}

// Función para cargar la escena
function loadScene() {

    // Se cargan los modelos 3D utilizados en el proyecto
    cargarModelos();
    // Se carga el suelo de la habitación
    cargarSuelo();
    // Las axes para ayudarnos en el proyecto
    // scene.add(new THREE.AxesHelper(1000))  
    // Se carga el fondo de la ciudad
    cargarFondo();
    // Se carga el texto de la pantalla de la habitación
    cargarTexto();

}

// Función para cargar la interfaz gráfica que interactua con el usuario
function setupGUI() {
    var gui = new dat.GUI();
    var carpeta = gui.addFolder("Control Hospital");

    // Variables para el menú de la derecha
    // Objeto controlador de la interfaz
    effectController = {
        colorSuelo: "rgb(46, 67, 73)",
        colorPared: "rgb(0,0,0)",
        colorLuzAmbiente: "rgb(255,255,255)",
        mensaje: 'Doble Click en escena',
        intAmbiente: 1.0
    }

    // Se añaden los elementos al menú GUI
    carpeta.add(effectController, "mensaje").name("Alumbrado");
    carpeta.add(effectController, "intAmbiente", 0.1, 2.5, 0.1).name("Intensidad Luz Ambiente");
    //carpeta.add(effectController, "tamañoNiebla", 0, 20, 0.2).name("Tamaño Niebla");
    //carpeta.add( effectController,"reiniciar").name("Reiniciar");
    //carpeta.add( effectController,"check").name("Check sin uso");

    // Cambio de color luz ambiente
    var sensorColorAmbiente = carpeta.addColor(effectController, "colorLuzAmbiente").name("Color luz Ambiente");
    sensorColorAmbiente.onChange(
        function (color) {
            luzAmbiente.traverse(function (hijo) {
                //console.log(hijo);
                hijo.color = new THREE.Color(color);
            });
        });

    //Cambio de color pared
    var sensorColorPared = carpeta.addColor(effectController, "colorPared").name("Color suelo");
    sensorColorPared.onChange(
        function (color) {
            pared.traverse(function (hijo) {
                if (hijo instanceof THREE.Mesh)
                    //hijo.material.color = new THREE.Color(color);
                    //Se modifica el color de fondo
                    renderer.setClearColor(color);

            });
        });

    //Control del cambio de color del suelo
    var sensorColor = carpeta.addColor(effectController, "colorSuelo").name("Color ladrillos Habitación");
    sensorColor.onChange(
        function (color) {
            suelo.traverse(function (hijo) {
                if (hijo instanceof THREE.Mesh)
                    hijo.material.color = new THREE.Color(color);

            });
        });

}

// Función que reacciona al evento de modificación del área de la web cuando cambia el tamaño de la pantalla
function updateAspectRatio() {
    renderer.setSize(window.innerWidth, window.innerHeight);
    var ar = window.innerWidth / window.innerHeight;
    camera.aspect = ar;
    camera.updateProjectionMatrix();
}

// Función para cargar los modelos 3D utilizados en el proyecto
function cargarModelos() {
    // Se Carga la habitación del hospital a la vista desde un fichero gltf
    var loader = new THREE.GLTFLoader();
    loader.load('./models/lowpoly_medical_room/scene2.gltf', function (gltf) {

        gltf.scene.position.x = -200;
        gltf.scene.position.y = -100;
        gltf.scene.castShadow = true;
        gltf.scene.recieveShadow = true;
         gltf.scene.traverse( function( node ) {
        if ( node.isMesh ) { node.castShadow = true; }
    } );
        scene.add(gltf.scene);

    }, undefined, function (error) {
        console.error(error);
    });

    // Se carga el sofá
    loader.load('./models/sofa/scene.gltf', function (gltf) {

        gltf.scene.position.set(320, -90, 30);
        gltf.scene.scale.set(2.4, 2.4, 2.4);
        gltf.scene.castShadow = true;
        gltf.scene.recieveShadow = true;
        scene.add(gltf.scene);

    }, undefined, function (error) {

        console.error(error);

    });

    // Se carga el monitor    
    loader.load('./models/monitor/scene.gltf', function (gltf) {

        //console.log(gltf.scene);
        gltf.scene.position.set(180, -10, -190);
        gltf.scene.scale.set(280, 280, 280);
        gltf.scene.castShadow = true;
        gltf.scene.recieveShadow = true;
        scene.add(gltf.scene);

    }, undefined, function (error) {

        console.error(error);

    });

    // Se carga la pantalla de luz 
    loader.load('./models/luces/scene.gltf', function (gltf) {
        gltf.scene.position.set(-310, 85, 0);
        gltf.scene.scale.set(1, 1, 1);

        gltf.scene.rotation.y = 90 * (Math.PI / 180);
        gltf.scene.name = 'pantallaLuz';
        gltf.scene.castShadow = true;
        gltf.scene.recieveShadow = true;
        scene.add(gltf.scene);

    }, undefined, function (error) {

        console.error(error);

    });

}

// Función para cargar el fondo de la ciudad
function cargarFondo() {
    // Textura para el fondo de la ciudad
    const texturaFondo = new THREE.TextureLoader().load("./textures/ciudadnoche.jpg");
    texturaFondo.wrapS = THREE.RepeatWrapping;
    texturaFondo.wrapT = THREE.RepeatWrapping;
    //texturaFondo.repeat.set(2, 2);
    texturaFondo.rotation = 90 * (Math.PI / 180);
    const textureFondo = new THREE.MeshStandardMaterial({
        map: texturaFondo,
    });

    // Se añaden las paredes del fondo enfrente
    pared = new THREE.Mesh(new THREE.PlaneGeometry(5000, 12000, 30, 30), textureFondo);
    pared.rotation.z = -90 * (Math.PI / 180);
    pared.position.set(0, 500, -1400); //Para mover lejania Z defecto = (0,500,-1400)
    scene.add(pared);

    //Añadimos las paredes del fondo izquierdo
    paredIz = new THREE.Mesh(new THREE.PlaneGeometry(5000, 12000, 30, 30), textureFondo);
    paredIz.rotation.y = 90 * (Math.PI / 180);
    paredIz.rotation.x = -90 * (Math.PI / 180);
    paredIz.position.set(-6000, 500, 0); //Para mover lejania Z defecto = (0,500,-1400)
    scene.add(paredIz);

    //Añadimos las paredes del fondo derecho
    paredIz = new THREE.Mesh(new THREE.PlaneGeometry(5000, 12000, 30, 30), textureFondo);
    paredIz.rotation.y = -90 * (Math.PI / 180);
    paredIz.rotation.x = 90 * (Math.PI / 180);
    paredIz.position.set(6000, 500, 0); //Para mover lejania Z defecto = (0,500,-1400)
    scene.add(paredIz);
}

// Función para cargar el texto del monitor de la habitación
function cargarTexto() {
    // Temperatura 30 distancia vertical
    escribirTexto('Temperatura:', 15, 50, 110, -180);
    escribirTexto(String(getRandomFloat(20.0, 25.0)) + ' °C', 15, 220, 110, -180);

    //Humedad
    escribirTexto('Humedad:', 15, 50, 80, -180);
    escribirTexto(String(getRandomFloat(50.0, 80.0)) + ' HR', 15, 220, 80, -180);

    //presión
    escribirTexto('Presion:', 15, 50, 50, -180);
    escribirTexto(String(getRandomFloat(1.0, 2.0)) + ' BAR', 15, 220, 50, -180);

    // Créditos
    escribirTexto('Xavier Calvo', 80, 50, 400, -1000);
}

// Función para cargar el suelo de la habitación
function cargarSuelo() {
    // Textura para el suelo de la habitación
    const texture1 = new THREE.TextureLoader().load("./textures/celosilla.jpg");
    texture1.wrapS = THREE.RepeatWrapping;
    texture1.wrapT = THREE.RepeatWrapping;
    texture1.repeat.set(2, 2);

    const sueloTexture = new THREE.MeshStandardMaterial({
        map: texture1,
    });

    // Se genera la geometria con la textura definida
    suelo = new THREE.Mesh(new THREE.PlaneGeometry(920, 450, 30, 30), sueloTexture);
    suelo.rotation.x = -Math.PI / 2;
    suelo.position.y = -100;
    scene.add(suelo);
}

// Se definen las luces del proyecto junto a las sombras
function setLuces() {

    //Luces
    luzAmbiente = new THREE.AmbientLight(luzAmbiente, 1.3); // soft white light
    luzAmbiente.name = 'luzAmbiente';
    scene.add(luzAmbiente);

    //Luz puntual
    luzPuntual = new THREE.PointLight(0xFFFFFF, 0.1);
    luzPuntual.position.set(0, 300, 0);
    //scene.add(luzPuntual);

    //LuzDireccional 
    luzDireccional = new THREE.DirectionalLight(0xFFFFFF, 0.5);
    luzDireccional.position.set(80, 50, 600);
    //scene.add(luzDireccional);

    //Luz focal
    luzFocal = new THREE.SpotLight(0xffffff, 2.0);
    luzFocal.position.set(0, 510, 0); //luzFocal.position.set(0, 1000, 0);
    luzFocal.target.position.set(0, 0, 0);
    luzFocal.angle = 60 * (Math.PI / 180);
    luzFocal.penumbra = 0.2;
    luzFocal.castShadow = true;
    //luzFocal.shadow.camera.near = 1;
	//luzFocal.shadow.camera.far = 200;
	//luzFocal.shadow.camera.fov = 50;
	//luzFocal.shadow.mapSize.width = 1024;
	//luzFocal.shadow.camera.height = 1024;	
	//scene.add( new THREE.CameraHelper(luzFocal.shadow.camera) );
    luzHab = luzFocal;
    scene.add(luzFocal);   

}

// Se controla el encendido y apagado de la luz de la habitación
function controlAlum() {
    // Construir el rayo para ver que objeto se ha seleccionado
    var rayo = new THREE.Raycaster();
    rayo.setFromCamera(new THREE.Vector2(window.innerWidth, window.innerheight), camera);

    //Calculamos las intersecciones
    var intersecciones = rayo.intersectObjects(scene.children, true);

    //Si hay intersecciones
    if (intersecciones.length > 0) {
        console.log(intersecciones[0]);

        //if(intersecciones[0].object.name == 'pantallaLuz') {
        if (estadoluzHab == true) {
            luzHab.intensity = 0.0;
            estadoluzHab = false;
        } else {
            luzHab.intensity = 2.0;
            estadoluzHab = true;
        }
        //}
    }
}


// Función para definir la intensidad de la luz ambiente desde la interfaz GUI
function setIntAmbiente() {
    const intAmb = effectController.intAmbiente;

    luzAmbiente.traverse(function (hijo) {
        //console.log(hijo);
        hijo.intensity = intAmb;
    });
}

// Función para obtener un valor aleatorio flotante dentro de un rango
function getRandomFloat(min, max) {
    min = Math.ceil(min);
    max = Math.floor(max);
    return (Math.random() * (max - min) + min).toFixed(1); //The maximum is exclusive and the minimum is inclusive
}

// Función para escribir texto en el proyecto
function escribirTexto(texto, tamaño, posX, posY, posZ) {

    var geometry;
    loaderDeTexto.load('./fonts/helvetiker_bold.typeface.json',
        // Crea texto en 3D después de cargar la fuente
        function (font) {

            geometry = new THREE.TextGeometry(texto, {
                font: font,
                size: tamaño,
                height: 1,
                curveSegments: 12,
                bevelEnabled: false,
                bevelThickness: 10,
                bevelSize: 8,
                bevelSegments: 5
            });
            // Crear material vectorial normal
            var meshMaterial = new THREE.MeshNormalMaterial({
                flatShading: THREE.FlatShading,
                transparent: true,
                opacity: 0.9
            });
            var mesh = new THREE.Mesh(geometry, meshMaterial);
            mesh.position.set(-300, 0, 0);
            mesh.position.set(posX, posY, posZ);
            mesh.name = texto;
            scene.add(mesh);

        },
        // Progreso de carga
        function (xhr) {
            console.log((xhr.loaded / xhr.total * 100) + '% loaded');
        },

        // se produjo un error
        function (err) {
            console.log(err);
        }
    );
}

// Función para cargar exclusivamente el texto de la hora
function actualizarHora(lastItemHour, tamaño, posX, posY, posZ) {

    var texto = getTime();
    var geometry;
    loaderDeTexto.load('./fonts/helvetiker_bold.typeface.json',
        // Crea texto en 3D después de cargar la fuente
        function (font) {

            geometry = new THREE.TextGeometry(texto, {
                font: font,
                size: tamaño,
                height: 1,
                curveSegments: 12,
                bevelEnabled: false,
                bevelThickness: 10,
                bevelSize: 8,
                bevelSegments: 5
            });
            // Crear material vectorial normal
            var meshMaterial = new THREE.MeshNormalMaterial({
                flatShading: THREE.FlatShading,
                transparent: true,
                opacity: 0.9
            });

            var mesh = new THREE.Mesh(geometry, meshMaterial);
            mesh.position.set(-300, 0, 0);
            mesh.position.set(posX, posY, posZ);
            mesh.name = texto;
            scene.add(mesh);

            //console.log(lastItemHour);
            if (lastItemHour != '') {
                var select = scene.getObjectByName(lastItemHour);
                scene.remove(select);
            }
            var newLastItemHour = mesh.name;
            scene.add(mesh);

            setTimeout(actualizarHora, 1000, newLastItemHour, 15, 50, 140, -180);

        },
        // Progreso de carga
        function (xhr) {
            console.log((xhr.loaded / xhr.total * 100) + '% loaded');
        },

        // se produjo un error
        function (err) {
            console.log(err);
        }
    );

}

// Función para obtener el tiempo actual
function getTime() {
    date = new Date;
    hora = date.getHours();
    min = date.getMinutes();
    if (min < 10) { min = '0' + min }
    sec = date.getSeconds();
    if (sec < 10) { sec = '0' + sec }

    res = String(hora) + ':' + String(min) + ':' + String(sec);
    return res

}

// Función para actualizar la vista
function update() {
    // Se actualizan las estadisticas
    stats.update();

    // Se define la luz de ambiente si cambia
    setIntAmbiente();
}

// Función de rendering del proyecto
function render() {
    requestAnimationFrame(render);
    update();
    renderer.clear();
    renderer.setViewport(0, 0, window.innerWidth, window.innerHeight);
    renderer.render(scene, camera);
    renderer.outputEncoding = THREE.sRGBEncoding;
}
//#############################################################################################

// EJECUCIÓN PROYECTO
//#############################################################################################

// Acciones para ejecutar el proyecto
init();
setupGUI();
loadScene();
stats.begin();
render();
stats.end();
//#############################################################################################