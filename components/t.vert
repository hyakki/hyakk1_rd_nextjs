varying vec2 vUv;
uniform float time;
varying float foo;

// void main() {
//   vUv = uv;  
//   vec3 pos = position;

//   // pos.y = pos.y + (sin(time / 100.0) * 0.2);

//   vec4 mvPosition = modelViewMatrix * vec4(pos, 1.0);

//   gl_Position = projectionMatrix * mvPosition;
// }

attribute float scale;

void main() {
  vUv = position.xy;

  vec3 pos = position;
  float SPEED = 1000.0;
  float AMPLITUDE = 200.0;
  float c = distance(vec2(0.5, 0.5), pos.xy);
  float OFFSET = c;

  // pos.y = pos.y + (sin((time / SPEED) + c) * AMPLITUDE);

  vec4 mvPosition = modelViewMatrix * vec4( pos, 1.0 );

  gl_PointSize = scale * ( 1000.0 / - mvPosition.z );
  gl_Position = projectionMatrix * mvPosition;

}
