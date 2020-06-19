
class Minimap {
  constructor (scene) {
    this.scene = scene;
  }

  init () {
    const geometry = new THREE.SphereGeometry(3, 20, 20);
    const material = new THREE.MeshBasicMaterial({ color: 0xFFffFF });
    this.primitive = new THREE.Mesh(geometry, material);
    this.scene.add(this.primitive);
  }
}