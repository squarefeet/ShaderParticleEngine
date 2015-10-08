Value Types
===========

Old API:

var emitter = new SPE.Emitter( {
	position: new THREE.Vector3,
	positionSpread: new THREE.Vector3,
	sizeStart: 1,
	sizeMiddle: 10,
	sizeEnd: 5
} );

* Single values
	* Backwards-compatible
	* eg. position: new THREE.Vector3

* Spreads
	* eg. new SPE.Spread( base, spread )

* Value over lifetime
	* eg. new SPE.ValueOverLifetime( value1, value2, value3, value4, ... )
	* eg. [ value1, value2, value3, value4, ... ]

	* Shaders:
		#DEFINE PROP_NAME 1 (number being valueOverLifetime's array length)

		#ifdef PROP_NAME
			attribute vec3 value_name[length]
		#elseif
			attribute vec3 value_name
		#endif

		...

		#ifdef PROP_NAME
			...valueOverLifetime calc here...
		#elseif
			...normal calc here...
		#endif

* How to combine spreads with valueOverLifetime?
	* Necessary to emulate sizeStart and sizeStartSpread, etc.

* How to have each emitter have its own valueOverLifetime settings?!
	* Have valueOverLifetime arrays as uniforms? 
		* Flatten arrays
		* Have an attribute that refers to the emitter's start position in the array uniform array?
		* Make sure arrays aren't larger than 253 4-float components
			* Each uniform occupies a minimum of 4-floats