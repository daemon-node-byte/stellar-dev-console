precision highp float;

uniform float uTime;
uniform vec3 uLightPos;

varying vec3 vNormal;
varying vec3 vWorldPosition;

void main() {
    vec3 normal = normalize(vNormal); // world-space normal
    vec3 lightDir = normalize(uLightPos - vWorldPosition);

    float diff = max(dot(normal, lightDir), 0.0);

    float pulse = 0.5; // No pulsing, fixed color
    vec3 baseColor = mix(vec3(0.2, 0.0, 0.3), vec3(0.6, 0.1, 1.0), pulse);
    vec3 finalColor = baseColor * diff;

    gl_FragColor = vec4(finalColor, 1.0);
}