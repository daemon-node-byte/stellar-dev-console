import * as THREE from 'three';

interface PlanetInfo {
	id: string;
	order: number;
	label: string;
	title?: string;
	description?: string;
	size: number;
	radius: number;
	speed: number;
	parent?: THREE.Object3D;
	mesh?: THREE.Mesh;
	withRing: boolean;
}

export const settings: {
	solarSystem: {
		sun: {
			size: number;
			bloom: {
				enabled: boolean;
				strength: number;
				radius: number;
				threshold: number;
			};
			flares?: {
				size: number;
				color: string;
				opacity: number;
			};
			arcs?: {
				amount: number;
				opacity: number;
				radius: number;
				height: number;
				angle: number;
			};
		};
		planets?: {
			id: string;
			order: number;
			label: string;
			title?: string;
			description?: string;
			size: number;
			radius: number;
			speed: number;
			parent?: THREE.Object3D;
			mesh?: THREE.Mesh;
			texture?: THREE.Mesh;
		}[];
	};
	starfield: {
		amount: number;
	distance: {
		min: number;
		max: number;
	}
	}
} = {
	solarSystem: {
		sun: {
			size: 2.2,
			bloom: {
				enabled: true,
				strength: 1.5,
				radius: 0.4,
				threshold: 0.9
			}
		},
	planets: [
		{ radius: 5, size: 0.7, speed: 0.002, label: 'About', id: 'planet1', order: 1},
		{ radius: 8, size: 1.0, speed: 0.008, label: 'Blog', id: 'planet2', order: 2 },
		{ radius: 11, size: 1.3, speed: 0.006, label: 'Projects', id: 'planet3', order: 3 },
		{ radius: 14, size: 0.9, speed: 0.004, label: 'Contact', id: 'planet4', order: 4 },

	]
	},
	starfield: {
		amount: 2500,
		distance: {
			min: 40,
			max: 150,
		}
	}
};
