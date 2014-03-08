var CONFIG = CONFIG || {};

(function() {

	CONFIG.editor = {
		group: {
			texture: THREE.ImageUtils.loadTexture( 'res/img/smokeparticle.png' ),
	        maxAge: 5
		},

		emitter: {
			type: 'cube',
	        particleCount: 1000,

	        position: new THREE.Vector3(),
	        positionSpread: new THREE.Vector3( 10, 10, 10 ),

	        acceleration: new THREE.Vector3( 0, -2, 0 ),
	        accelerationSpread: new THREE.Vector3( 1, 0, 1 ),

	        velocity: new THREE.Vector3( 0, 5, 0 ),
	        velocitySpread: new THREE.Vector3( 1, 1, 1 ),

	        radius: 10,
	        radiusSpread: 0,
	        radiusSpreadClamp: 3,
	        radiusScale: new THREE.Vector3( 1, 1, 1 ),

	        speed: 5,
	        speedSpread: 1,

	        sizeStart: 1,
	        sizeStartSpread: 4,

	        sizeMiddle: 2,
	        sizeMiddleSpread: 3,

	        sizeEnd: 0,
	        sizeEndSpread: 2,

	        angleStart: 0,
	        angleStartSpread: 0,

	        angleMiddle: 0,
	        angleMiddleSpread: 0,

	        angleEnd: 0,
	        angleEndSpread: 0,

	        colorStart: new THREE.Color( 0x5577FF ),
	        colorStartSpread: new THREE.Vector3(),

	        colorMiddle: new THREE.Color( 0xFFFFFF ),
	        colorMiddleSpread: new THREE.Vector3(),

	        colorEnd: new THREE.Color( 0x557700 ),
	        colorEndSpread: new THREE.Vector3(),

	        opacityStart: 1,
	        opacityStartSpread: 0.1,

	        opacityMiddle: 0.5,
	        opacityMiddleSpread: 0.2,

	        opacityEnd: 0,
	        opacityEndSpread: 0.3,

	        duration: null,

	        alive: 1,
	        isStatic: 0
		}
	};

}());