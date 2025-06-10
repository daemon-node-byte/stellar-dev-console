import { planet1Material, p1RingMaterial, material } from '$lib/materials';



type UniT = { uTime: { value: number } };

export const planets = [
	{
		id: 0,
		name: 'About',
		radius: 6,
		size: 0.7,
		material: (uniforms: UniT) => material(uniforms),
		withRing: false,
		speed: 0.003,
		project: {
			name: 'Project Mercury',
			description: 'A blazing fast API server.',
		}
	},
	{
		id: 1,
		name: 'Blog',
		radius: 10,
		size: 1.0,
		material: (uniforms: UniT) => planet1Material(uniforms),
		withRing: true,
		ringMaterial: (uniforms: UniT) => p1RingMaterial(uniforms),
		speed: 0.008,
		project: {
			name: 'Project Venus',
			description: 'Beautiful UI component library.',
		}
	},
	{
		id: 2,
		name: 'Projects',
		radius: 14,
		size: 1.3,
		material: (uniforms: UniT) => material(uniforms),
		withRing: false,
		speed: 0.006,
		project: {
			name: 'Project Earth',
			description: 'Full-stack web platform.',
		}
	},
	{
		id: 3,
		name: 'Contact',
		radius: 18,
		size: 0.9,
		material: (uniforms: UniT) => material(uniforms),
		withRing: false,
		speed: 0.004,
		project: {
			name: 'Project Mars',
			description: 'AI-powered data analysis tool.',
		}
	}
];