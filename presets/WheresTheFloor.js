{
	particleCount: 10000,
	maxAge: {
		value: 3,
	},
	rotation: {
		angle: Math.PI * 0.25,
		axis: new THREE.Vector3( 1, 0, 0 )
	},
	color: {
		value: new THREE.Color( 0, 1, 1 )
	},
	position: {
		value: new THREE.Vector3( 0, 0, 0 ),
		spread: new THREE.Vector3( 100, 100, 20 )
	},
	velocity: {
		value: new THREE.Vector3( 0, 5, 0 )
	},
	wiggle: {
		spread: 20
	},
	size: {
		value: 1
	},
	opacity: {
		value: [ 0, 1, 1, 0 ]
	},
	color: {
		spread: new THREE.Vector3( 2, 2, 2 )
	}
}