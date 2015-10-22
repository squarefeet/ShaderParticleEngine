Migration Log
=============

#### Emitter types are now "constants" and reside in SPE.distributions:

When making an emitter and setting its `type` property, you must now
reference one of the `SPE.distributions` "constants" instead of passing
a string value ('sphere', 'cube', etc.) as in previous versions.

Constants are as follows:
* `SPE.distributions.SPHERE`
* `SPE.distributions.DISC` (note the spelling has changed from 'disk'!)
* `SPE.distributions.BOX` (no longer 'cube')

**Example**
```javascript
var emitter = new SPE.Emitter( {
	type: SPE.distributions.SPHERE
} );
```



#### MaxAge property is now part of `SPE.Emitter` properties

`SPE.Group` no longer takes a `maxAge` property. Maximum ages for particles
are calculated on a per-particle basis.

**Example**
```javascript
var emitter = new SPE.Emitter( {
	// Gives a maxAge range of 3 to 7
	maxAge: {
		value: 5,
		spread: 2
	}
} );
```


#### `SPE.Emitter.alive` is no longer a numeric value ####
The `alive` property of an `SPE.Emitter` instance is now a Boolean. The previous functionality of using the `alive` property as a value to determine what percentage of an emitter's particles were alive has been moved to the `activeMultiplier` property.

The benefit here is that you get a more fine-grained control over the number of particles emitter per-second for an emitter. Values greater than `1` will emulate a burst of particles, causing the emitter to run out of particles before it's next activation cycle, and values less than `1` and greater than `0` will emitter fewer particles per second than the emitter's default.


### Texture property supports sprite sheets ###
The `texture` property of `SPE.Group` is in a slightly different format, but now supports animated sprite sheets:

**Example**
```javascript
var group = new SPE.Group( {
	texture: {
		value: THREE.ImageUtils.loadTexture( ... ),
		frames: new THREE.Vector2( 4, 4 ), // Optional. No. frames on x/y axis of texture
		frameCount: 16, // Optional. If whole texture isn't used, specify the total number of frames the texture has here
		loop: 2, // Optional. The number of loops the spritesheet should perform during a particle's lifetime.
	}
} );