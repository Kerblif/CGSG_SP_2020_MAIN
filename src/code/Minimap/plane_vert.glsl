/* Plane vertex shader */

uniform float uTime;

out vec2 vUv;
out vec3 planePosition;

void main(void) {
    vUv = uv;
    planePosition = position;
    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
}