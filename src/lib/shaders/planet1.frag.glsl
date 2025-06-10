precision highp float;

uniform float uTime;
uniform vec3 uLightPos;

varying vec3 vNormal;
varying vec3 vWorldPosition;

void main() {
    // Basic light direction
    vec3 normal = normalize(vNormal);
    vec3 lightDir = normalize(uLightPos - vWorldPosition);


    // Lambertian diffuse
    float diff = max(dot(normal, lightDir), 0.0);

    // Surface color animation
    float bands = sin(vWorldPosition.y * 10.0 + uTime) * 0.5 + 0.5;
    vec3 baseColor = mix(vec3(0.2, 0.6, 0.9), vec3(0.8, 0.3, 0.5), bands);

    vec3 finalColor = baseColor * diff;

    gl_FragColor = vec4(finalColor, 1.0);
}
