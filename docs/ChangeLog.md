Change Log
==========

v2.0.0
------
* Replaced Grunt with Webpack.
* Moved to import/export.
* Full module support.
	* `Group`, `Emitter`, `distribution`, and `globals` are now the only exposed objects.
* `SPE.valueOverLifetimeLength` is now `SPE.globals.valueOverLifetimeLength` (or accessed by importing `globals`)
* Distribution files are now located in `dist`, changed from `build`.
* `SPE.min.js` has been removed. Please use `SPE.js` instead - this is minified.

v1.1.0
------
* Updated `texture` uniform name to `tex`.
* Moved to use BufferAttribute.usage instead of BufferAttribute.dynamic.

v1.0.6
------
* #110: Added `three` as an NPM dependency.
* #119: As of THREE.js r81, a `THREE.BufferAttribute` instance no longer calculates its `count` property each time the `count` getter is called. Since `SPE.ShaderAttribute` can sometimes resize itself when necessary, a fix has been issued to keep a shader attribute's `count` property in sync with its array size.
* #118: Fix for `getFromPool()` when pool is empty (@FracturedShader).
* Fixed fog.

v1.0.5
------
* Fixed issue with emitter pools where `duration` would be ignored in favour of `maxAge`. Duration is now taken into account.

v1.0.3
------
* Make sure grunt dependencies are listed in `devDependencies` (**[pawsong](https://github.com/pawsong)**).
* Fixed bug #81: Axis of rotation ignores signs.
* Fixed bug #82: `radiusScale` of `position` does not work because it is labelled incorrectly.

v1.0.2
------
* Fixed bug #80:
	* Rotation on one emitter affects others in the same group.
	* Rotation with center !== position inverts forces.

v1.0.1
------
* Fixed bugs #77 and #78.
	* #78: Using rotation on an emitter inverted its position.
	* #77: The `alphaTest` setting on `SPE.Group` wasn't being applied. No `ALPHATEST` check in fragment shader existed.


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
