varying vec3 vPos;
uniform float uTime;
uniform float uDepth;
uniform float uLimit;
uniform vec3 uColor1;
uniform vec3 uColor2;

void main() {
  vec4 color = vec4(1.0, 1.0, 1.0, 1.0);
  // vec4 color = vec4(uColor1, 1.0);
  // color = vec4(uColor2, 1.0);

  float dist = distance(vPos, vec3(0.0, 0.0, 0.0));

  color.rgb = mix(uColor1, uColor2, dist / uLimit);

  float sms = smoothstep(0.0, uDepth, dist);
  color.a = (1.0 - sms);

  // float sms2 = smoothstep(1.0, 2.0, dist);
  // float sms3 = smoothstep(1.0, 3.0, dist);

  // color.a = 1.0;

  // color.a = (1.0 - sms) * 0.25;
  // color.r = 1.0 - sms2 + sms3;
  // color.r = 1.0 - sms3;

  // color.a -= min(0.2, step(dist, 0.7));

  gl_FragColor = color;
}
