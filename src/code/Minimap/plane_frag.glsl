/***
 * Plane fragment shader 
 * Programmer: DV1
 ***/

/* Defines */
#define PI 3.1415926535

/* Structures */
struct animation {
  int mode;
  float progress;
  int numStep;
  sampler2D texture_01;
  sampler2D texture_02;
  vec3 color_01;
  vec3 color_02;
  float coefBlend;
};

/* Uniforms */
uniform sampler2D uTexFloors[NUM_OF_FLOORS];
uniform int uCurFloor;
uniform animation uAnim; 

/* In variables */
in vec3 planePosition;
in vec2 vUv;

/* Main function */
void main() {

  /* Check animation mode */
  vec4 resColor = vec4(1.0, 0.0, 0.0, 1.0);


  switch (uAnim.mode) {
    case 0:
      /* Change floors */

      vec4 patternColor = vec4(vec3(173.0, 255.0, 47.0) * (1.0 / 255.0), 1.0);

      bool rowType = mod(gl_FragCoord.y / 25.0, 2.0) > 1.0;
      bool columnType = mod(gl_FragCoord.x / 25.0, 2.0) > 1.0;

      if (rowType ^^ columnType) {
        patternColor = vec4(uAnim.color_01, 1.0);
      } else {
        patternColor = vec4(uAnim.color_02, 1.0);
      }




      switch (uAnim.numStep) {
        case 0:
          resColor = mix( texture2D(uAnim.texture_01, vUv), patternColor, uAnim.coefBlend );
          break;
        case 1:
          resColor = patternColor;
          break;
        case 2:
          resColor = mix( texture2D(uAnim.texture_02, vUv), patternColor, uAnim.coefBlend );
          break;
        case -1:
          resColor = texture2D(uAnim.texture_02, vUv);
          break;      

      }
  }

  //gl_FragColor = texture2D(uTexFloors[FLOOR_NUMBER], vUv);
  gl_FragColor = resColor;
}