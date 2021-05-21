uniform float uTime;

varying vec3 vPos;

void main() {
  vec3 pos = position;

  // float dist = distance(pos.xy, vec2(0.0, 0.0));
  float dist = distance(pos.x, 0.0);
  float offset = sin(dist * 10.0 - uTime / 50.0) / 20.0;

  pos.z = pos.z + offset;

  vec4 mvPosition = modelViewMatrix * vec4(pos, 1.0);

  gl_PointSize = 2.5 - (1.0 / - mvPosition.z);
  gl_Position = projectionMatrix * mvPosition;

  vPos = pos;
}
