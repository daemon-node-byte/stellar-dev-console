uniform float uTime;
varying vec2 vUv;

void main() {
    float dist = distance(vUv, vec2(0.5));
    float band = smoothstep(0.45, 0.5, abs(sin(dist * 30.0 - uTime * 3.0)));

    vec3 ringColor = mix(vec3(0.6, 0.5, 0.9), vec3(0.2, 0.1, 0.5), band);
    gl_FragColor = vec4(ringColor, 1.0 - dist);
}
