//José Javier Calvo Moratilla 2021
//Graficos por computador
//Seminario 3

// Variables de consenso
var renderer, scene, camera;

// Camaras adicionales planta, alzado, perfil
var planta, alzado, perfil;
var L = 3; // Semillado de la caja ortográfica

// Controlar la camara
var cameraControls;

// Acciones
init();
loadScene();
render();

function setCameras(ar) { //Relacion de aspecto
    // Configurar las tres camaras ortográficas
    var camaraOrtografica;

    // Cuando carga la web se definen las dimensiones para que se visualize de manera óptima en relación con el aspecto
    if (ar > 1) { // Si el horizontal es más ancho que el alto
        camaraOrtografica = new THREE.OrthographicCamera(
            -L * ar, L * ar, L, -L, -100, 100);

    }
    else { // Si es al revés
        camaraOrtografica = new THREE.OrthographicCamera(
            -L, L, L / ar, -L / ar, -100, 100);
    }

    // Camara Arriba Izquierda
    alzado = camaraOrtografica.clone();
    alzado.position.set(0, 0, L); //La vista desde la Z
    alzado.lookAt(0, 0, 0);

    // Camara Abajo izquierda
    planta = camaraOrtografica.clone();
    planta.position.set(0, L, 0); // La vista desde eje y, desde arriba
    planta.lookAt(0, 0, 0);
    planta.up = new THREE.Vector3(0, 0, -1); //Cambio la dirección de haz de la camara

    // Camara arriba derechas
    perfil = camaraOrtografica.clone();
    perfil.position.set(L, 0, 0); //Se mira desde el eje de las X
    perfil.lookAt(0, 0, 0);

    scene.add(alzado);
    scene.add(planta);
    scene.add(perfil);
}

function init() {
    // Configurar el canvas y el motor de render
    renderer = new THREE.WebGLRenderer();
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.setClearColor(new THREE.Color(0x0000AA));
    document.getElementById('container').appendChild(renderer.domElement);
    renderer.autoClear = false;

    // Escena
    scene = new THREE.Scene();

    // Camara
    var aspectRatio = window.innerWidth / window.innerHeight;
    camera = new THREE.PerspectiveCamera(75, aspectRatio, 0.1, 1000);
    camera.position.set(2, 2, 3);
    camera.lookAt(new THREE.Vector3(0, 0, 0));

    // Se preparan las diferentes cámaras
    setCameras(aspectRatio);

    // Se permite poder mover la vista con el ratón con la libreria Orbit Controls
    cameraControls = new THREE.OrbitControls(camera, renderer.domElement);
    cameraControls.target.set(0, 0, 0);

    // Captura de eventos, cambio de tamaño de la pantalla y ejecuta la función updateAspectRatio
    window.addEventListener('resize', updateAspectRatio);

    // Recoger el evento del dobleclik para que rote el cubo seleccionado y ejecuta la funcion rotateCube
    renderer.domElement.addEventListener('dblclick', rotateCube);

}

// Función para rotar el cubo seleccionado por el evento del doble
function rotateCube(event) {

    // Capturar las coordenadas del click
    var x = event.clientX;
    var y = event.clientY;

    // En qué zona se hizo el click?
    var derecha = false, abajo = false;
    var cam = null;

    if (x > window.innerWidth / 2) {
        //Derecha
        derecha = true;
        x -= window.innerWidth / 2;

    }
    if (y > window.innerHeight / 2) {
        //Estoy a bajo
        abajo = true;
        y -= window.innerHeight / 2;
    }

    if (derecha) {
        if (abajo) {
            cam = camera
        }
        else {
            cam = perfil;
        }
    }
    else {
        if (abajo) {
            cam = planta;
        }
        else {
            cam = alzado;
        }

    }

    // cam es la camara que recibe el click

    // Normalizar a cuadrado de 2x2
    x = (x * 4/window.innerWidth) - 1;
    y = -(y * 4/window.innerHeight) + 1;

    // Construir el rayo para ver que objeto se ha seleccionado
    var rayo = new THREE.Raycaster();
    rayo.setFromCamera(new THREE.Vector2(x, y), cam);

    //Calculamos las intersecciones
    var intersecciones = rayo.intersectObjects(scene.children, true);

    //Si hay intersecciones
    if( intersecciones.length > 0) 
    // ME interesa la primera de todas que es la que va a rotar el eje de las x
    intersecciones[0].object.rotation.x += Math.PI / 8;
    
}

// Función donde se carga la escena que se visualiza en la web
function loadScene() {
    // 5 cubos iguales en tirereta
    var geometria = new THREE.BoxGeometry(0.9, 0.9, 0.9)
    var material = new THREE.MeshBasicMaterial({
        color: 'yellow',
        wireframe: true
    });

    for (var i = 0; i < 5; i++) {
        var cubo = new THREE.Mesh(geometria, material);
        cubo.position.set(-2 + i, 0, 0);
        scene.add(cubo);
    }

    scene.add(new THREE.AxesHelper(3));

}

//Se actualiza el aspect Ratio cuando se detecta el evento de que se ha modificado la ventana
function updateAspectRatio() {
    // Se dispara cuando se cambia el área de dibujo
    renderer.setSize(window.innerWidth, window.innerHeight);

    var ar = window.innerWidth / window.innerHeight

    camera.aspect = ar;
    camera.updateProjectionMatrix();

    // Para camaras adicionales
    if (ar > 1) { // Ancho más largo que alto
        alzado.left = perfil.left = planta.left = -L * ar;
        alzado.right = perfil.right = planta.right = L * ar;
        alzado.bottom = perfil.bottom = planta.bottom = -L;
        alzado.top = perfil.top = planta.top = L;
    }
    else {
        alzado.left = perfil.left = planta.left = -L;
        alzado.right = perfil.right = planta.right = L;
        alzado.bottom = perfil.bottom = planta.bottom = -L / ar;
        alzado.top = perfil.top = planta.top = L / ar;
    }

    alzado.updateProjectionMatrix();
    perfil.updateProjectionMatrix();
    planta.updateProjectionMatrix();
}

function update() {

}

function render() {
    requestAnimationFrame(render);
    update();
    // renderer.render( scene, camera );   
    renderer.clear();

    // Decir al motor del canvas donde va a dibujar
    // Alzado izquierda arriba 
    renderer.setViewport(0, 0, window.innerWidth / 2, window.innerHeight / 2);
    renderer.render(scene, alzado);

    // Planta abajo izquierda
    renderer.setViewport(0, window.innerHeight / 2, window.innerWidth / 2, window.innerHeight / 2);
    renderer.render(scene, planta);

    // Perfil Arriba a la derecha
    renderer.setViewport(window.innerWidth / 2, 0, window.innerWidth / 2, window.innerHeight / 2);
    renderer.render(scene, perfil);

    // Perspectiva interactiva abajo derecha
    renderer.setViewport(window.innerWidth / 2, window.innerHeight / 2, window.innerWidth / 2, window.innerHeight / 2);
    renderer.render(scene, camera);

}

