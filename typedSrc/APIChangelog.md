API Changelog
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
```
var emitter = new SPE.Emitter( {
	type: SPE.distributions.SPHERE
} );
```



#### MaxAge property is now part of `SPE.Emitter` properties

`SPE.Group` no longer takes a `maxAge` property. Maximum ages for particles
is calculated on a per-particle basis.

**Example**
```
var emitter = new SPE.Emitter( {
	// Gives a maxAge range of 3 to 7
	maxAge: {
		value: 5,
		spread: 2
	}
} );
```