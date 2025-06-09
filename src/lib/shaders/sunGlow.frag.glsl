precision highp float;

varying vec3 vNormal;

void main() {
    float intensity = pow(0.6 - dot(vNormal, vec3(0.0, 0.0, 1.0)), 4.0);
    vec3 glowColor = vec3(1.0, 0.6, 0.2) * intensity;
    gl_FragColor = vec4(glowColor, 1.0);
}
