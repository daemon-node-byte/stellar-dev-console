import * as THREE from 'three';

export function createGlowMaterial(color = 0x00ffff) {
	return new THREE.ShaderMaterial({
		uniforms: {
			glowColor: { value: new THREE.Color(color) },
			viewVector: { value: new THREE.Vector3(0, 0, 1) }
		},
		vertexShader: `
      uniform vec3 viewVector;
      varying float intensity;
      void main() {
        vec3 vNormal = normalize(normalMatrix * normal);
        vec3 vNormView = normalize(normalMatrix * viewVector);
        intensity = pow(0.6 - dot(vNormal, vNormView), 2.0);
        gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
      }
    `,
		fragmentShader: `
      uniform vec3 glowColor;
      varying float intensity;
      void main() {
        vec3 glow = glowColor * intensity;
        gl_FragColor = vec4(glow, 1.0);
      }
    `,
		side: THREE.BackSide,
		blending: THREE.AdditiveBlending,
		transparent: true,
		depthWrite: false
	});
}
