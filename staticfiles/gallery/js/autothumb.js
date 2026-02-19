import * as THREE from 'three';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';

// Находим DOM элементы
const fileInput = document.querySelector('input[type="file"]');
const previewContainer = document.getElementById('preview-container');
const hiddenInput = document.getElementById('id_image_data');
const submitBtn = document.getElementById('submit-btn');

if (fileInput){
    fileInput.addEventListener('change', function(e){
        const file = e.target.files[0];
        if (file){
            //Временная ссылка на файл
            const url = URL.createObjectURL(file);
            generateThumbnail(url);
        }
    });
}

function generateThumbnail(modelUrl){
    previewContainer.innerHTML = 'Генерация...';

    //Настройка сцены
    const width = 300;
    const height = 200;

    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0xffffff); //Белый фон для превью

    const camera = new THREE.PerspectiveCamera(45, width / height, 0.1, 1000);

    const renderer = new THREE.WebGLRenderer({ antialias: true, preserveDrawingBuffer: true });

    renderer.setSize(width, height);
    renderer.outputColorSpace = THREE.SRGBColorSpace; //Конвертация цветов под монитор

    //Очищаем контейнер и добавляем наш канвас
    previewContainer.innerHTML = '';
    previewContainer.appendChild(renderer.domElement);

    //Свет

    const ambientLight = new THREE.AmbientLight(0xffffff, 1.5);
    scene.add(ambientLight);

    const dirlight = new THREE.DirectionalLight(0xffffff, 1.5);
    dirlight.position.set(5, 10, 7);
    scene.add(dirlight);

    //Загрузка модели
    const loader = new GLTFLoader();
    loader.load(modelUrl, (gltf) => {
       const model = gltf.scene;
       
       //Центрируем модель
       const box = new THREE.Box3().setFromObject(model);
        const center = box.getCenter(new THREE.Vector3());
        const size = box.getSize(new THREE.Vector3());
        const maxDim = Math.max(size.x, size.y, size.z);

        model.position.sub(center); // Центр в нулях
        scene.add(model);

        //Ставим камеру
        const fov = camera.fov * (Math.PI / 180);
        // calculate camera distance from model based on its size
        let cameraZ = Math.abs(maxDim / 2 / Math.tan(fov / 2)) * 1.5;
        camera.position.set(cameraZ * 0.5, cameraZ * 0.5, cameraZ);
        camera.lookAt(0, 0, 0);

        //Рендер кадра
        renderer.render(scene, camera);

        //Фотка в джипег
        const dataURL = renderer.domElement.toDataURL('image/jpeg', 0.8);

        //Сохраняем строку в скрытый инпут
        hiddenInput.value = dataURL;

        //Разблокируем кнопку отправки
        submitBtn.disabled = false;
        submitBtn.innerText = 'Загрузить';

        console.log('Скриншот сделан');

        //Освобождаем память
        URL.revokeObjectURL(modelUrl);
    }, undefined, (error) => {
        console.error(error);
        previewContainer.innerHTML = 'Ошибка генерации превью';
    });
}