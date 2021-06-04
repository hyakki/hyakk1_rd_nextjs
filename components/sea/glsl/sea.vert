uniform vec2 uBigWavesFrequency;
uniform float uBigWavesElevation;
uniform float uBigWavesSpeed;
uniform float uSmallWavesElevation;
uniform float uSmallWavesFrequency;
uniform float uSmallWavesSpeed;
uniform float uSmallWavesIterations;
uniform float uTime;
uniform float uSize;

varying float vElevation;

void main() {
  vec4 modelPosition = modelMatrix * vec4(position, 1.0);

  float devicePixelRatio = 1.0;

  float elevation = sin((modelPosition.x * uBigWavesFrequency.x) + (uTime * uBigWavesSpeed)) *
                    sin((modelPosition.z * uBigWavesFrequency.y) + (uTime * uBigWavesSpeed)) *
                    uBigWavesElevation;

	for(float i = 1.0; i <= uSmallWavesIterations; i++)
	{
		elevation -= abs(cnoise(vec3(modelPosition.xz * uSmallWavesFrequency * i, uTime * uSmallWavesSpeed)) * uSmallWavesElevation / i);
	}

  // float d = distance(vec3(0.0, 0.0, 0.0), vec3(position.x, position.y, position.z)); 

  // elevation -= (0.0 - smoothstep(0.0, 4.0, d));

  modelPosition.y += elevation;

  vec4 viewPosition = viewMatrix * modelPosition;
  vec4 projectionPosition = projectionMatrix * viewPosition;

  vec4 mvPosition = modelViewMatrix * vec4(position, 1.0);

  gl_Position = projectionPosition;
  gl_PointSize = (uSize * devicePixelRatio) - ( distance(vec2(0.0, 0.0), mvPosition.xz) );
  // gl_PointSize = (uSize * devicePixelRatio);

  vElevation = elevation;
}
