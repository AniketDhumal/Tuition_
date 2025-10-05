const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
const renderer = new THREE.WebGLRenderer({ alpha: true });
renderer.setSize(window.innerWidth * 0.4, 400);
renderer.shadowMap.enabled = true;
document.getElementById('threeCanvas').appendChild(renderer.domElement);

const light = new THREE.PointLight(0xffffff, 1);
light.position.set(10, 10, 10);
light.castShadow = true;
scene.add(light);

const planeGeometry = new THREE.PlaneGeometry(50, 50);
const planeMaterial = new THREE.MeshStandardMaterial({ color: 0x555555 });
const plane = new THREE.Mesh(planeGeometry, planeMaterial);
plane.rotation.x = -Math.PI / 2;
plane.position.y = -0.5;
plane.receiveShadow = true;
scene.add(plane);

const data = [12, 19, 3, 5, 2, 3];
const barWidth = 1;
const barSpacing = 2;

data.forEach((value, index) => {
    const geometry = new THREE.BoxGeometry(barWidth, value, barWidth);
    const material = new THREE.MeshStandardMaterial({ color: 0x00ffcc });
    const bar = new THREE.Mesh(geometry, material);
    
    bar.position.x = index * (barWidth + barSpacing) - (data.length * (barWidth + barSpacing)) / 2;
    bar.position.y = 0;
    bar.castShadow = true;
    scene.add(bar);

    gsap.to(bar.scale, { duration: 2, y: value, ease: "bounce" });
});

camera.position.z = 10;
function animate() {
    requestAnimationFrame(animate);
    renderer.render(scene, camera);
}
animate();
