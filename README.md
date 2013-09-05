ShaderParticleEngine
====================
A GLSL-heavy particle engine for THREE.js. Based on [Stemkoski's great particle engine](https://github.com/stemkoski/stemkoski.github.com/blob/master/Three.js/js/ParticleEngine.js).


Pull requests and issue reports welcome.


Version 0.5.0
=============
Currently not at 1.0.0, so the API is due to change. Please be aware of this when using this library.
That said, it ain't gonna be long until it's at 1.0.0.


Changelog
=========
**Version 0.5.0**
* The latest update sees the addition of the ```ShaderParticleGroup.addPool()``` method. This allows for much easier control of emitter pools. See [the pool example](http://squarefeet.github.io/ShaderParticleEngine/examples/pool.html) for an example.
* There are also quite a few bug fixes courtesy of [Stemkoski](https://github.com/stemkoski/).
* I've also added quite a few more comments to the source-code, so it should be easier to get your head around should you want/need to dig into the internals.



About
=====
After experimenting with Stemkoski's particle engine, I was having trouble getting high numbers of particles to render at ~60fps. After digging into the code and doing some benchmarks, it was clear that the bottleneck was coming from applying each particle's movement parameters (```velocity += acceleration```, and ```position += velocity```). After moving these calculations to the shaders the performance was drastically increased.

Another optimisation I wanted was to be able to 'group' lots of emitters into one ```THREE.ParticleSystem```, so that if I had (for example) 20 particle emitters sharing the same texture, I could send all 20 of those emitters to the GPU at the same time via sharing the same geometry. This is where the basis for the ```ShaderParticleGroup``` comes from.

This project requires THREE.js revision 58/59/60.



Usage
=====
See the ```./examples/``` folder (or [here](http://squarefeet.github.io/ShaderParticleEngine/)) for some simple demos.

Assuming you have a basic scene set up using THREE.js and have added the JS to your page, adding a particle emitter is as simple as the following code:

```javascript
// Create a particle group to add the emitter to.
var particleGroup = new ShaderParticleGroup({
	// Give the particles in this group a texture
	texture: THREE.ImageUtils.loadTexture('path/to/your/texture.file'),

	// How long should the particles live for? Measured in seconds.
	maxAge: 5
});

// Create a single emitter
var particleEmitter = new ShaderParticleEmitter({
	type: 'cube',
	position: new THREE.Vector3(0, 0, 0),
	acceleration: new THREE.Vector3(0, 10, 0),
	velocity: new THREE.Vector3(0, 15, 0),
	particlesPerSecond: 100,
	size: 10,
	sizeEnd: 0,
	opacityStart: 1,
	opacityEnd: 0,
	colorStart: new THREE.Color('blue'),
	colorEnd: new THREE.Color('white')
});

// Add the emitter to the group.
particleGroup.addEmitter( particleEmitter );

// Add the particle group to the scene so it can be drawn.
scene.add( particleGroup.mesh ); // Where `scene` is an instance of `THREE.Scene`.

// ...

// In your frame render function:
// 	Where dt is the time delta
// 	(the time it took to render the last frame.)
particleGroup.tick( dt );

```


API
===

####```ShaderParticleGroup``` settings:####

```javascript
// All possible parameters for the ShaderParticleGroup constructor.
// - Default values for each key are as given below if the key is [OPTIONAL].
var particleGroup = new ShaderParticleGroup({

	// [REQUIRED] Give the particles in this group a texture.
	texture: THREE.ImageUtils.loadTexture('path/to/your/texture.file'),

	// [OPTIONAL] How long should the particles live for? Measured in seconds.
	maxAge: 3,

	// [OPTIONAL] Should the particles have perspective applied when drawn?
	// Use 0 for false and 1 for true.
	hasPerspective: 1,

	// [OPTIONAL] Should the particles in this group have a color applied?
	// Use 0 for false and 1 for true
	colorize: 1,

	// [OPTIONAL] What blending style should be used?
	// THREE.NoBlending
	// THREE.NormalBlending
	// THREE.AdditiveBlending
	// THREE.SubtractiveBlending
	// THREE.MultiplyBlending
	blending: THREE.AdditiveBlending,

	// [OPTIONAL] Should transparency be applied?
	transparent: true,

	// [OPTIONAL] What threshold should be used to test the alpha channel?
	alphaTest: 0.5,

	// [OPTIONAL] Should this particle group be written to the depth buffer?
	depthWrite: false,

	// [OPTIONAL] Should a depth test be performed on this group?
	depthTest: true,

	// [OPTIONAL] Specify a fixed time-step value if you're more bothered
	// about smooth performance. Only use this if necessary. Measured in seconds.
	fixedTimeStep: 0.016
});
```


####```ShaderParticleEmitter``` settings:

```javascript
// All possible parameters for the ShaderParticleEmitter constructor
// - Default values for each key are as given below if the key is [OPTIONAL]
var particleEmitter = new ShaderParticleEmitter({

	// [OPTIONAL] Emitter shape.
	// 	'cube' or 'sphere'.
	// 		When using 'sphere' shape, use `radius` and `speed` parameters.
	// 		When using 'cube' shape, use `acceleration` and `velocity` parameters.
	type: 'cube',


	// [OPTIONAL] Base position for the emitter. Can be changed over time.
	position: new THREE.Vector3(0, 0, 0),

	// [OPTIONAL] Particle start position variance.
	positionSpread: new THREE.Vector3(0, 0, 0),


	// [OPTIONAL] Acceleration base vector.
	acceleration: new THREE.Vector3(0, 0, 0),

	// [OPTIONAL] Acceleration variance.
	accelerationSpread: new THREE.Vector3(0, 0, 0),


	// [OPTIONAL] Velocity base vector.
	velocity: new THREE.Vector3(0, 0, 0),

	// [OPTIONAL] Velocity variance.
	velocitySpread: new THREE.Vector3(0, 0, 0),


	// [OPTIONAL - Sphere type] Starting position radius.
	radius: 10,

	// [OPTIONAL - Sphere type] Starting position radius scale.
	radiusScale: new THREE.Vector3(1, 1, 1),

	// [OPTIONAL - Sphere type] Particle speed.
	speed: 0,

	// [OPTIONAL - Sphere type] Particle speed variance.
	speedSpread: 0,


	// [OPTIONAL] Particle start size.
	size: 10,

	// [OPTIONAL] Particle start size variance.
	sizeSpread: 0,

	// [OPTIONAL] Particle end size.
	sizeEnd: 10,


	// [OPTIONAL] Particle start colour.
	colorStart: new THREE.Color( 'white' ),

	// [OPTIONAL] Particle start colour variance.
	colorSpread: new THREE.Vector3(0, 0, 0),

	// [OPTIONAL] Particle end colour.
	colorEnd: new THREE.Color( 'blue' ),


	// [OPTIONAL] Particle start opacity.
	opacityStart: 1,

	// [OPTIONAL] New in v0.4.0. Particle middle opacity.
	// The opacity value at half a particle's lifecycle.
	// If not specified, it will be set to halfway between the
	// `opacityStart` and `opacityEnd` values.
	opacityMiddle: 0.5

	// [OPTIONAL] Particle end opacity.
	opacityEnd: 0,


	// [OPTIONAL] The number of particles emitted per second.
	particlesPerSecond: 100,

	// [OPTIONAL] Emitter duration. Measured in seconds.
	// 	A null value indicates an infinite duration.
	emitterDuration: null,

	// [OPTIONAL] Should this emitter be alive (i.e. should it be emitting)?
	// 0 for false, 1 for true
	alive: 1,

	// [OPTIONAL] New in v0.4.0. If you want a huge amount of particles, and
	// they aren't going to be moving, then set this property to `1`. This will
	// take the start values for color, opacity, and size (with spreads applied),
	// not add the emitter from its group's tick function, and so will be static.
	// See the static.html file in the examples directory for more.
	static: 0
});
```

####"Public" Methods for ```ShaderParticleGroup```:####

**- ```.addEmitter( emitter )```**
Adds an instance of ```ShaderParticleEmitter``` to the particle group.

**- ```.tick( dt )```**
Call this function once per frame. If no ```dt``` argument is given, the ```ShaderParticleGroup``` instance will use its ```.fixedTimeStep``` value as ```dt```.

**- ```.addPool( numEmitters, emitterSettings, createNewEmitterIfPoolRunsOut )```**
Automatically create a pool of emitters for easy triggering in the future.

**- ```.triggerPoolEmitter( numEmittersToActivate, positionVector )```**
Turn on a given number of emitters that live in a pool created using the method above. You can also pass a ```THREE.Vector3``` instance to dictate where this emitter will sit.


Known Bugs
==========
See the [issues page](https://github.com/squarefeet/ShaderParticleEngine/issues) for any known bugs. Please open an issue if you find anything not behaving properly.



Thanks
======
Huge thanks are extended to [Stemkoski](http://stemkoski.github.io/Three.js/) for his initial particle engine, and to [Mr Doob, AlteredQualia, et. al](https://github.com/mrdoob/three.js/graphs/contributors) for their awesome work on [THREE.js](http://threejs.org/).