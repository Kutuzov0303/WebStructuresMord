import * as THREE from 'three';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import { RoomEnvironment } from 'three/addons/environments/RoomEnvironment.js';
// Отдельный импорт PMREMGenerator не нужен!
export function loadModel(containerId, modelUrl) {
    const container = document.getElementById(containerId);
    if (!container) {
        console.error(`Контейнер с id ${containerId} не найден`);
        return;
    }

// Сцена
const scene = new THREE.Scene();
scene.background = null; // Прозрачный фон
// Камера
const camera = new THREE.PerspectiveCamera(
    75,
    container.clientWidth / container.clientHeight,
    0.1,
    1000
);
camera.position.z = 2;

// Рендерер
const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
renderer.setSize(container.clientWidth, container.clientHeight);
renderer.setPixelRatio(window.devicePixelRatio);
container.appendChild(renderer.domElement);
renderer.outputColorSpace = THREE.SRGBColorSpace; //Конвертация цветов под монитор
renderer.toneMapping = THREE.ACESFilmicToneMapping //Тонирование через ACESFilmic
renderer.toneMappingExposure = 1; //Экспозиция тонирования

// Контроллеры
const controls = new OrbitControls(camera, renderer.domElement);

//Инерция
controls.enableDamping = true;
controls.dampingFactor = 0.05;

//Ограничение зума
controls.minDistance = 0.1;
controls.maxDistance = 50;

//Очистка контейнера от текста
container.innerHTML = '';
container.appendChild(renderer.domElement);

// Куб
//const geometry = new THREE.BoxGeometry(1, 1, 1);
//const material = new THREE.MeshStandardMaterial({ color: 0x007bff }); 
//const cube = new THREE.Mesh(geometry, material);
//scene.add(cube);

//Свет
//const light = new THREE.DirectionalLight(0xffffff, 2); 
//light.position.set(5, 5, 5);
//scene.add(light);

const premGenerator = new THREE.PMREMGenerator(renderer);
premGenerator.compileEquirectangularShader();

const roomEnvironment = new RoomEnvironment();

scene.environment = premGenerator.fromScene(roomEnvironment).texture;

const loaderDiv = document.createElement('div');
loaderDiv.className = 'loader-overlay';
loaderDiv.innerHTML = `
    <div style="color: #666; font-size: 0.9rem;">Loading...</div>
    <div class="progress-bar">
        <div class="progress-fill"></div>
    </div>
`;
container.appendChild(loaderDiv);

const progressFill = loaderDiv.querySelector('.progress-fill');

// Загрузка модели
const loader = new GLTFLoader();
    console.log(`loadModel called for container ${containerId}, url: ${modelUrl}`);
    console.log(`container size = ${container.clientWidth}x${container.clientHeight}`);
//let loadedModel = null; // Создайте переменную

loader.load(modelUrl, 

    //Успешная загрузка
    (gltf) => {
    const model = gltf.scene; // Сохраняем ссылку
    console.log('model loaded', model);
    const boundingBox = new THREE.Box3().setFromObject(model);
    console.log('bounding box', boundingBox);
    fitCameraToObject(camera, model, controls);
    console.log('camera after fit', camera.position.toArray());
    scene.add(model);

    // Скрываем загрузчик после загрузки
    loaderDiv.style.display = 'none'; 
    setTimeout(() => {
        loaderDiv.remove();
    }, 300);
},

// Прогресс загрузки
xhr => {
    if(xhr.total > 0){
        const percent = (xhr.loaded / xhr.total) * 100;
        progressFill.style.width = percent + '%';
    }

},

//ошибка загрузки
error => {
    console.error('Ошибка загрузки модели:', error);
    loaderDiv.innerHTML = `<div class="error-msg">❌ Ошибка загрузки<br> <small>Проверьте файл</small></div>`;
}

);

// loader.load(
//     modelUrl,
//     (gltf) => {
//         const model = gltf.scene;

//         fitCameraToObject(camera, model, 1.5);

//         scene.add(model);
//     },
//     undefined,
//     (error) => {
//         console.error('Ошибка загрузки модели:', error);
//         container.innerHTML = '❌ Error';
//     }

// );



// Анимация
function animate() {
    requestAnimationFrame(animate); // Запрос кадра
    
    controls.update(); // Обновление контроллеров каждый кадр

    // if (loadedModel) {
    //     loadedModel.rotation.y += 0.005; // Вращение модели
    // }
    renderer.render(scene, camera); // Рендеринг кадра сцены
}
// Запуск анимации
animate();
console.log("3D сцена запущена в", containerId);

//Изменение размеров окна
window.addEventListener('resize', () => {
    camera.aspect = container.clientWidth / container.clientHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(container.clientWidth, container.clientHeight);
});

}

function fitCameraToObject(camera, object, offset = 1.25) {
    const boundingBox = new THREE.Box3();
    boundingBox.setFromObject(object);
    const center = boundingBox.getCenter(new THREE.Vector3());
    const size = boundingBox.getSize(new THREE.Vector3());

    const maxDim = Math.max(size.x, size.y, size.z);

    object.position.x = -center.x;
    object.position.y = -center.y;
    object.position.z = -center.z;

    const fov = camera.fov * (Math.PI / 180);
    let cameraZ = Math.abs(maxDim / 2 / Math.tan(fov / 2));

    cameraZ *= offset;

    camera.position.set(0, maxDim * 0.5, cameraZ); 
    camera.lookAt(0, 0, 0);
    camera.updateProjectionMatrix();
}
