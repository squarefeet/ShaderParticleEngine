ShaderParticleEngine
====================
A GLSL-heavy particle engine for THREE.js. Based on [Stemkoski's great particle engine](https://github.com/stemkoski/stemkoski.github.com/blob/master/Three.js/js/ParticleEngine.js).


Pull requests and issue reports welcome. Please see the notes on pull requests at the end of this document.


Version 0.7.5
=============
A minor release, this changes the behaviour of the `SPE.Emitter#alive` property. It is no longer just 0 and 1.

`SPE.Emitter#alive`: Values between 0 and 1 now control the percentage of particles that are alive at a given moment. If you have an emitter with a `particleCount` of 1000 and you set alive to be 0.1, only 100 particles will be emitted (`1000 * 0.1 === 100`).

See `examples/alive.html` for an example.

Currently not at ```1.0.0```, so the API _might_ change. Please be aware of this when using this library.


Breaking Changes
================
* **Version 0.7.4** There's a change in the way the total number of particles an emitter has is calculated, and one emitter option rename:
	* ```SPE.Emitter#particlesPerSecond``` is now ```SPE.Emitter#particleCount```.
		* Rather than specifying how many particles an emitter will produce per second, you now specify the total number of particles yourself.
	* Renamed ```SPE.Emitter#emitterDuration``` to ```SPE.Emitter#duration```.

* **Version 0.7.3** has renamed and added a lot of emitter options. Opacity, color, size, and angle are now consistent. They all have *Start, *Middle, and *End varients, as well as *StartSpread, *MiddleSpread, and *EndSpread varients. As an example:
	* ```opacityStart```, ```opacityStartSpread```,
	* ```opacityMiddle```, ```opacityMiddleSpread```,
	* ```opacityEnd```, ```opacityEndSpread```.

* **Version 0.7.2** packages up the emitter objects (Group, Emitter, utils) into one namespace: ```SPE```.
	* To create a particle group from **v0.7.2+**: ```new SPE.Group( ... )```.
	* To create a particle emitter from **v0.7.2+**: ```new SPE.Emitter( ... )```.



About
=====
After experimenting with Stemkoski's particle engine, I was having trouble getting high numbers of particles to render at ~60fps. After digging into the code and doing some benchmarks, it was clear that the bottleneck was coming from applying each particle's movement parameters (```velocity += acceleration```, and ```position += velocity```). After moving these calculations to the shaders the performance was drastically increased.

Another optimisation I wanted was to be able to 'group' lots of emitters into one ```THREE.ParticleSystem```, so that if I had (for example) 20 particle emitters sharing the same texture, I could send all 20 of those emitters to the GPU at the same time via sharing the same geometry. This is where the basis for the ```ShaderParticleGroup``` comes from.

This project requires THREE.js revision 58 to revision 65.



Usage
=====
See the ```./examples/``` folder (or [here](http://squarefeet.github.io/ShaderParticleEngine/)) for some simple demos.

Assuming you have a basic scene set up using THREE.js and have added the JS to your page, adding a particle emitter is as simple as the following code:

```javascript
// Create a particle group to add the emitter to.
var particleGroup = new SPE.Group({
	// Give the particles in this group a texture
	texture: THREE.ImageUtils.loadTexture('path/to/your/texture.file'),

	// How long should the particles live for? Measured in seconds.
	maxAge: 5
});

// Create a single emitter
var particleEmitter = new SPE.Emitter({
	type: 'cube',
	position: new THREE.Vector3(0, 0, 0),
	acceleration: new THREE.Vector3(0, 10, 0),
	velocity: new THREE.Vector3(0, 15, 0),
	particlesPerSecond: 100,
	sizeStart: 10,
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

####```SPE.Group``` options:####

```javascript
// All possible parameters for the SPE.Group constructor.
// - Default values for each key are as given below if the key is [OPTIONAL].
var particleGroup = new SPE.Group({

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


####```SPE.Emitter``` settings:

```javascript
// All possible parameters for the SPE.Emitter constructor
// - Default values for each key are as given below if the key is [OPTIONAL]
var particleEmitter = new SPE.Emitter({

	// [OPTIONAL] Emitter shape.
	// 	'cube', 'sphere', or 'disk'
	// 		When using 'sphere' or 'disk' shape, use `radius` and `speed` parameters.
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
	sizeStart: 10,

	// [OPTIONAL] Particle start size variance.
	sizeStartSpread: 0,

	// [OPTIONAL] Particle middle size.
	// If not specified, it will be set to halfway between the 
	// `sizeStart` and `sizeEnd` values.
	sizeMiddle: 10,

	// [OPTIONAL] Particle middle size variance.
	sizeMiddleSpread: 0,

	// [OPTIONAL] Particle end size.
	sizeEnd: 10,

	// [OPTIONAL] Particle end size variance.
	sizeEndSpread: 0,


	// [OPTIONAL] Particle rotation start angle (radians).
	angleStart: 0,

	// [OPTIONAL] Particle rotation start angle spread (radians).
	angleStartSpread: 0,

	// [OPTIONAL] Particle rotation middle angle (radians).
	angleMiddle: 0,

	// [OPTIONAL] Particle rotation middle angle spread (radians).
	angleMiddleSpread: 0,

	// [OPTIONAL] Particle rotation end angle (radians).
	angleEnd: 0,

	// [OPTIONAL] Particle rotation end angle spread (radians).
	angleEndSpread: 0,

	// [OPTIONAL] Align particle angle along its velocity vector
	// If this property is set to `true`, then all other angle properties 
	// are ignored.
	angleAlignVelocity: false,


	// [OPTIONAL] Particle start colour.
	colorStart: new THREE.Color( 'white' ),

	// [OPTIONAL] Particle start colour variance.
	colorStartSpread: new THREE.Vector3(0, 0, 0),

	// [OPTIONAL] Particle middle colour.
	// If not specified, it will be set to halfway between the 
	// `colorStart` and `colorEnd` values.
	colorMiddle: new THREE.Color( 'white' ),

	// [OPTIONAL] Particle middle colour variance.
	colorMiddleSpread: new THREE.Vector3(0, 0, 0),

	// [OPTIONAL] Particle end colour.
	colorEnd: new THREE.Color( 'blue' ),

	// [OPTIONAL] Particle end colour variance.
	colorEndSpread: new THREE.Vector3(0, 0, 0),



	// [OPTIONAL] Particle start opacity.
	opacityStart: 1,

	// [OPTIONAL] Particle start opacity variance.
	opacityStartSpread: 0,

	// [OPTIONAL] Particle middle opacity.
	// The opacity value at half a particle's lifecycle.
	// If not specified, it will be set to halfway between the
	// `opacityStart` and `opacityEnd` values.
	opacityMiddle: 0.5,

	// [OPTIONAL] Particle middle opacity variance.
	opacityMiddleSpread: 0,

	// [OPTIONAL] Particle end opacity.
	opacityEnd: 0,

	// [OPTIONAL] Particle end opacity variance.
	opacityEndSpread: 0,


	// [OPTIONAL] The number of particles emitted per second.
	particlesPerSecond: 100,

	// [OPTIONAL] Emitter duration. Measured in seconds.
	// 	A null value indicates an infinite duration.
	emitterDuration: null,

	// [OPTIONAL] What percentage of `particleCount` particles should be emitted?
	// 0 being no particles, 1 being 100% of `particleCount`.
	alive: 1.0,

	// [OPTIONAL] New in v0.4.0. If you want a huge amount of particles, and
	// they aren't going to be moving, then set this property to `1`. This will
	// take the start values for color, opacity, and size (with spreads applied),
	// not add the emitter from its group's tick function, and so will be static.
	// See the static.html file in the examples directory for more.
	isStatic: 0
});
```

####"Public" Methods for ```SPE.Group```:####

**- ```.addEmitter( emitter )```**
Adds an instance of ```SPE.Emitter``` to the particle group.

**- ```.tick( dt )```**
Call this function once per frame. If no ```dt``` argument is given, the ```SPE.Group``` instance will use its ```.fixedTimeStep``` value as ```dt```.

**- ```.addPool( numEmitters, emitterSettings, createNewEmitterIfPoolRunsOut )```**
Automatically create a pool of emitters for easy triggering in the future.

**- ```.triggerPoolEmitter( numEmittersToActivate, positionVector )```**
Turn on a given number of emitters that live in a pool created using the method above. You can also pass a ```THREE.Vector3``` instance to dictate where this emitter will sit.


Changelog
=========
**Version 0.7.5**
* `SPE.Emitter#alive`: Values between 0 and 1 now control the percentage of particles that are alive at a given moment. If you have an emitter with a `particleCount` of 1000 and you set alive to be 0.1, only 100 particles will be emitted (`1000 * 0.1 === 100`).


**Version 0.7.4**
* The latest release has jumped from ```0.5.1``` to ```0.7.4```. There are no release versions in between - the party was all on the dev branch. A full log of the changes between these versions is available in the changelog towards the end of this document. There have been a lot of changes since ```0.5.1```, so if you're updating, please check the [Breaking Changes](https://github.com/squarefeet/ShaderParticleEngine#breaking-changes) and [Changelog](https://github.com/squarefeet/ShaderParticleEngine#changelog) to play catchup.

* In between ```0.5.1``` and ```0.7.4```, there have been some contributions from the community to the library:
	* [@DelvarWorld](https://github.com/delvarworld/)) has kindly brought this library into a much fitter state than it was before, and feature contributions from [@stemkoski](https://github.com/stemkoski/)) have been combined into the ```0.7.4``` release.

* Deprecated ```SPE.Emitter#particlesPerSecond``` in favour of ```SPE.Emitter#particleCount```.
* Renamed ```SPE.Emitter#emitterDuration``` to ```SPE.Emitter#duration```.



**Version 0.7.3**
* Added the following properties:
	* ```sizeEndSpread```, ```opacityEndSpread```, ```colorEndSpread```
	* ```sizeMiddleSpread```, ```opacityMiddleSpread```, ```colorMiddleSpread```
	* ```angleStart``` (replaces ```angle```), ```angleStartSpread```,
	* ```angleMiddle```, ```angleMiddleSpread```,
	* ```angleEnd```, ```angleEndSpread```

**Version 0.7.2**
* Moved ```ShaderParticleGroup```, ```ShaderParticleEmitter```, and ```shaderParticleUtils``` to a shared object. ```SPE.Group```, ```SPE.Emitter```, and ```SPE.utils``` respectively.

**Version 0.7.1**
* Changed the attribute model. Size attributes, opacity attributes, and angle attributes are all squashed into shared attributes using various vector types.
* Added ```sizeMiddle``` functionality.

**Version 0.7.0**
* new ShaderParticleUtils object (alpha) to share functions between the Group and Emitter constructors.
* ShaderParticleGroup.removeEmitter()
* ShaderParticleEmitter.angle
* ShaderParticleEmitter.angleAlignVelocity

**Version 0.6.0**
* To adjust particle sizes, please use `sizeStart` instead of the old `size` property.
* Particle angles are now supported, thanks to [Stemkoski](https://github.com/stemkoski/).


**Version 0.5.1**
* Fixed some issues with parseFloat and accidental globals. Thanks to [DelvarWorld](https://github.com/DelvarWorld) for noticing these.


**Version 0.5.0**
* The latest update sees the addition of the ```ShaderParticleGroup.addPool()``` method. This allows for much easier control of emitter pools. See [the pool example](http://squarefeet.github.io/ShaderParticleEngine/examples/pool.html) for an example.
* There are also quite a few bug fixes courtesy of [Stemkoski](https://github.com/stemkoski/).
* I've also added quite a few more comments to the source-code, so it should be easier to get your head around should you want/need to dig into the internals.



Building
========
This project uses [Grunt](http://gruntjs.com/) to create the distributions, one dev build (not minimized) and one production build (minimized). If you make changes and want to build it, follow these steps:

If you don't have grunt installed, first make sure you've got [NodeJS](http://nodejs.org/) and NPM installed, then install Grunt CLI. You might have to do this as root:

```npm install -g grunt-cli```

Now you can install the local grunt package:

```cd [projectFolder] && npm install && grunt```


The output of grunt will sit in the `build` folder.



Known Bugs
==========
* There is an issue using ```SPE.Emitter#angleAlignVelocity``` if your emitter isn't positioned at origin (0, 0, 0). This is being investigated.

See the [issues page](https://github.com/squarefeet/ShaderParticleEngine/issues) for any known other bugs. Please open an issue if you find anything not behaving properly.


Submitting Pull Requests
========================
Just a couple of notes about submitting pull requests:
* **Indentation**: 4 spaces.
* **Whitespace**: No trailing whitespace.
* **JSHint**: If you can, please run JSHint over your forked copy before submitting to make sure there are no common mistakes.
* **Description**: Please provide a full description of your changes.
* **Comments**: Follow existing commenting conventions.

Thanks :)




Thanks
======
Huge thanks are extended to [Stemkoski](http://stemkoski.github.io/Three.js/) for his initial particle engine, and to [Mr Doob, AlteredQualia, et. al](https://github.com/mrdoob/three.js/graphs/contributors) for their awesome work on [THREE.js](http://threejs.org/).