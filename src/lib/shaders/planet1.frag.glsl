uniform float uTime;
varying vec3 vNormal;
varying vec3 vPosition;

void main() {
    float stripes = sin(vPosition.y * 10.0 + uTime) * 0.5 + 0.5;
    float colorShift = sin(vPosition.x * 3.0 + uTime * 0.2);

    vec3 baseColor = mix(vec3(0.2, 0.6, 0.9), vec3(0.8, 0.3, 0.5), colorShift);
    vec3 finalColor = baseColor * stripes;

    gl_FragColor = vec4(finalColor, 1.0);
}
