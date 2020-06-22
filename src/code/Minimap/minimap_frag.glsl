/* Minimap fragment shader */

#define PI 3.1415926535

uniform sampler2D uTexFloors[2];

in vec3 planePosition;

/*
struct light {
  vec3 pos;
};

uniform light lights[ NUM_OF_LIGHTS ];
*/

in vec2 vUv;

void main() {
  gl_FragColor = texture2D(uTexFloors[0], vUv);
  //gl_FragColor = vec4((planePosition.x + 25.0) / 50.0, (planePosition.y + 25.0) / 50.0 * 0.0, 0.0, 1.0);
}