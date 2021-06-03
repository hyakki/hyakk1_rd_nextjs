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

  modelPosition.y += elevation;

  vec4 viewPosition = viewMatrix * modelPosition;
  vec4 projectionPosition = projectionMatrix * viewPosition;

  vec4 mvPosition = modelViewMatrix * vec4(position, 1.0);

  gl_Position = projectionPosition;
  gl_PointSize = (uSize * devicePixelRatio) - ( 1.0 - mvPosition.x );

  vElevation = elevation;
}
