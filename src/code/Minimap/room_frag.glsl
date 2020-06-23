/* Room fragment shader */

#define PI 3.1415926535

uniform sampler2D uTexFloors[NUM_OF_FLOORS];
uniform int uCurFloor;

in vec3 planePosition;
in vec2 vUv;

void main() {
  
    gl_FragColor = texture2D(uTexFloors[FLOOR_NUMBER], vUv);    
  
  

  //gl_FragColor = vec4((planePosition.x + 25.0) / 50.0, (planePosition.y + 25.0) / 50.0 * 0.0, 0.0, 1.0);
}