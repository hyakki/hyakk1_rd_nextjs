varying vec2 vUv;

void main() {

  if ( length( gl_PointCoord - vec2( 0.5, 0.5 ) ) > 0.475 ) discard;

  gl_FragColor = vec4( vUv.x + 0.5, 0.0, 0.0, 1.0 );
  // gl_FragColor = vec4(1.0, 0.0, 0.0, 1.0);

}
