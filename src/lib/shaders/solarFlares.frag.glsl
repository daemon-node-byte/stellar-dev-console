precision highp float;
uniform float uTime;
varying vec2 vUv;

void main() {
    float angle = atan(vUv.y - 0.5, vUv.x - 0.5);
    float flare = sin(angle * 6.0 + uTime * 2.0);
    flare = smoothstep(0.0, 1.0, flare);
    vec3 color = mix(vec3(1.0, 0.4, 0.0), vec3(1.0, 1.0, 0.0), flare);
    float alpha = 1.0 - length(vUv - 0.5);
    gl_FragColor = vec4(color, alpha * flare);
}
