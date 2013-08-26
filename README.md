ShaderParticleEngine
====================

A GLSL-heavy particle engine for THREE.js. Heavily based on [Stemkoski's great particle engine](https://github.com/stemkoski/stemkoski.github.com/blob/master/Three.js/js/ParticleEngine.js).



About
=====

After experimenting with Stemkoski's particle engine, I was having trouble getting
high numbers of particles to render at ~60fps. After digging into the code
and doing some benchmarks, it was clear that the bottleneck was coming from applying
each particle's movement parameters (```velocity += acceleration```, and ```position += velocity```). Moving these calculations to the shaders, performance was drastically 
increased.

Another optimisation I wanted was to be able to 'group' lots of emitters into one 
```THREE.ParticleSystem```, so that if I had (for example) 20 particle emitters sharing
the same texture, I could send all 20 of those emitters to the GPU at the same time. 
This is where the basis for the ```ShaderParticleGroup``` comes from.



Usage
=====
See the ```./examples/``` folder for some simple demos.

Assuming you have a basic scene set up using THREE.js and have added the JS to your page, adding a particle emitter is as simple as the following code:

```
// Create a particle group to add the emitter to
var particleGroup = new ShaderParticleGroup({
	// Give the particles in this group a texture
	texture: THREE.ImageUtils.loadTexture('path/to/your/texture.file'),

	// How long should the particles live for? Measured in seconds
	maxAge: 5
});

// Create a single emitter
var particleEmitter = new ShaderParticleEmitter({
	
});

// Add the emitter to the group
particleGroup.addEmitter( particleEmitter );

// Add the particle group to the scene so it can be drawn
scene.add( particleGroup.mesh ); // Where `scene` is an instance of THREE.Scene

// ...

// In your render function:
particleGroup.tick( dt ); // Where dt is the time delta (the time it took to render the last frame.)

```


API
===
```ShaderParticleGroup``` settings:
```
// All possible parameters for the ShaderParticleGroup.
// - Default values for each key are as given below if the key is [OPTIONAL]
var particleGroup = ShaderParticleGroup({

	// [REQUIRED] Give the particles in this group a texture
	texture: THREE.ImageUtils.loadTexture('path/to/your/texture.file'),

	// [OPTIONAL] How long should the particles live for? Measured in seconds
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

	// [OPTIONAL] Specify a fixed time-step value if you're more bothered about smooth
	// performance. Only use this if necessary! Measured in seconds
	fixedTimeStep: 0.016
});
```



Thanks
======
Huge thanks are extended to [Stemkoski](http://stemkoski.github.io/Three.js/) for his
initial particle engine, and to Mr Doob/AlteredQualia/et. al for their awesome work on
THREE.js.