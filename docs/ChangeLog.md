Change Log
==========

v1.0.0
------
* A complete rewrite to enable support for THREE.js r72.
* Options for `SPE.Group` and `SPE.Emitter` have changed format. Please see API docs for more information.
* Now using `BufferGeometry` and typed arrays for attribute manipulation.
* Removed support for `onParticleSpawn` option in emitters. Changing emitter values at runtime is supported instead.
* Added emitter rotation properties.
* Added emitter drag properties.
* Added emitter wiggle properties.
* Added `dispose()` method to `SPE.Group`.
* Added `remove()` method to `SPE.Emitter`. Delegates to `removeEmitter()` method on `SPE.Group`.
* Emitter types are now known as `distributions`, and are "constants". See Migration log for more.
* `maxAge` property is no longer part of `SPE.Group` and has been moved to `SPE.Emitter`.
* `alive` property of `SPE.Emitter` is now a boolean no longer controls percentage of particles emitted. `activeMultiplier` property of `SPE.Emitter` replaces this functionalty.
* Added `direction` property to `SPE.Emitter`. Allows control over direction of the emitter (forwards, or backwards).
