var CONFIG = CONFIG || {};

(function() {

	CONFIG.editor = {
		group: {
			texture: THREE.ImageUtils.loadTexture( 'res/img/smoke.png' ),
	        maxAge: 5
		},

		emitter: {
			type: 'cube',
	        particleCount: 50,

	        position: new THREE.Vector3(),
	        positionSpread: new THREE.Vector3(),

	        acceleration: new THREE.Vector3( 0, 0, 0 ),
	        accelerationSpread: new THREE.Vector3( 0, 0, 0 ),

	        velocity: new THREE.Vector3( 2, 0, 0 ),
	        velocitySpread: new THREE.Vector3( 0, 0, 0 ),

	        radius: 10,
	        radiusSpread: 0,
	        radiusSpreadClamp: 3,
	        radiusScale: new THREE.Vector3( 1, 1, 1 ),

	        speed: 5,
	        speedSpread: 1,

	        sizeStart: 2,
	        sizeStartSpread: 0,

	        sizeMiddle: 2,
	        sizeMiddleSpread: 0,

	        sizeEnd: 2,
	        sizeEndSpread: 0,

	        angleStart: 0,
	        angleStartSpread: 0,

	        angleMiddle: 0,
	        angleMiddleSpread: 0,

	        angleEnd: 0,
	        angleEndSpread: 0,

	        angleAlignVelocity: 0,

	        colorStart: new THREE.Color( 0x5577FF ),
	        colorStartSpread: new THREE.Vector3(),

	        colorMiddle: new THREE.Color( 0xFFFFFF ),
	        colorMiddleSpread: new THREE.Vector3(),

	        colorEnd: new THREE.Color( 0x557700 ),
	        colorEndSpread: new THREE.Vector3(),

	        opacityStart: 1,
	        opacityStartSpread: 0,

	        opacityMiddle: 1,
	        opacityMiddleSpread: 0,

	        opacityEnd: 1,
	        opacityEndSpread: 0,

	        duration: null,

	        alive: 1,
	        isStatic: 0
		},

		globalSettings: [
			'type',
	        'particleCount',
	        'position',
	        'positionSpread',
	        'sizeStart',
	        'sizeStartSpread',
	        'sizeMiddle',
	        'sizeMiddleSpread',
	        'sizeEnd',
	        'sizeEndSpread',
	        'angleStart',
	        'angleStartSpread',
	        'angleMiddle',
	        'angleMiddleSpread',
	        'angleEnd',
	        'angleEndSpread',
	        'angleAlignVelocity',
	        'colorStart',
	        'colorStartSpread',
	        'colorMiddle',
	        'colorMiddleSpread',
	        'colorEnd',
	        'colorEndSpread',
	        'opacityStart',
	        'opacityStartSpread',
	        'opacityMiddle',
	        'opacityMiddleSpread',
	        'opacityEnd',
	        'opacityEndSpread',
	        'duration',
	        'alive',
	        'isStatic'
		],

		cubeSettings: [
			'acceleration',
	        'accelerationSpread',
	        'velocity',
	        'velocitySpread'
		],

		sphereDiskSettings: [
			'radius',
	        'radiusSpread',
	        'radiusSpreadClamp',
	        'radiusScale',
	        'speed',
	        'speedSpread'
		],

		defaultEmitter: new SPE.Emitter()
	};

	CONFIG.editor.defaultGroup = new SPE.Group( CONFIG.editor.group );
}());