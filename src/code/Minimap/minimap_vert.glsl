/* Minimap vertex shader */

uniform float uTime;

out vec2 vUv;
out vec3 planePosition;

void main(void) {
    vUv = uv;
    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
                  
    planePosition = position;

}