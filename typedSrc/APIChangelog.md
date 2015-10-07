API Changelog
=============

#### Emitter types are now "constants" and reside in SPE.emitterTypes:

When making an emitter and setting its `type` property, you must now
reference one of the SPE.emitterType "constants" instead of passing
a string value ('sphere', 'cube', etc.) as in previous versions.

Constants are as follows:
* `SPE.emitterTypes.SPHERE`
* `SPE.emitterTypes.DISC` (note the spelling has changed from 'disk'!)
* `SPE.emitterTypes.BOX` (no longer 'cube')

**Example**
```
var emitter = new SPE.Emitter( {
	type: SPE.emitterTypes.SPHERE
} );
```