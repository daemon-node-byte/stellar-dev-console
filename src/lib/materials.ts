import * as THREE from 'three';
import vertexShader from '$lib/shaders/planet.vert.glsl?raw';
import fragmentShader from '$lib/shaders/planet.frag.glsl?raw';
import sunVertexShader from '$lib/shaders/sun.vert.glsl?raw';
import sunFragmentShader from '$lib/shaders/sun.frag.glsl?raw';
import sunGlowVertexShader from '$lib/shaders/sunGlow.vert.glsl?raw';
import sunGlowFragmentShader from '$lib/shaders/sunGlow.frag.glsl?raw';
import flareVertexShader from '$lib/shaders/solarFlares.vert.glsl?raw';
import flareFragmentShader from '$lib/shaders/solarFlares.frag.glsl?raw';
import p1VertexShader from '$lib/shaders/planet1.vert.glsl?raw';
import p1FragmentShader from '$lib/shaders/planet1.frag.glsl?raw';
import p1RingVertexShader from '$lib/shaders/p1Ring.vert.glsl?raw';
import p1RingFragmentShader from '$lib/shaders/p1Ring.frag.glsl?raw';

type UniformsType = {
	uTime: { value: number },
	uLightPos?: { value: THREE.Vector3 },
}

const material = (uniforms: UniformsType) => new THREE.ShaderMaterial({
	vertexShader,
	fragmentShader,
	uniforms
});
const sunMaterial = (uniforms: UniformsType) => new THREE.ShaderMaterial({
	vertexShader: sunVertexShader,
	fragmentShader: sunFragmentShader,
	uniforms: uniforms,
	side: THREE.FrontSide,
	transparent: false
});
const sunGlowMaterial = () => new THREE.ShaderMaterial({
	vertexShader: sunGlowVertexShader,
	fragmentShader: sunGlowFragmentShader,
	blending: THREE.AdditiveBlending,
	transparent: true,
	depthWrite: false,
	side: THREE.BackSide
});
const flareMaterial = () => new THREE.ShaderMaterial({
	vertexShader: flareVertexShader,
	fragmentShader: flareFragmentShader,
	uniforms: {
		uTime: { value: 0 }
	},
	transparent: true,
	side: THREE.DoubleSide,
	depthWrite: false
});
const planet1Material = (uniforms: UniformsType) => new THREE.ShaderMaterial({
	vertexShader: p1VertexShader,
	fragmentShader: p1FragmentShader,
	uniforms,
});

const p1RingMaterial = (uniforms: UniformsType) => new THREE.ShaderMaterial({
	vertexShader: p1RingVertexShader,
	fragmentShader: p1RingFragmentShader,
	uniforms: uniforms,
	transparent: true,
	side: THREE.DoubleSide,
});

export {
	material,
	sunMaterial,
	sunGlowMaterial,
	flareMaterial,
	planet1Material,
	p1RingMaterial
};
