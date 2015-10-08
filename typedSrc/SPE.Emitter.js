SPE.Emitter = function( options ) {
    var utils = SPE.utils,
        types = utils.types;

    // Ensure we have a map of options to play with,
    // and that each option is in the correct format.
    options = utils.ensureTypedArg( options, types.OBJECT, {} );
    options.position = utils.ensureTypedArg( options.position, types.OBJECT, {} );
    options.velocity = utils.ensureTypedArg( options.velocity, types.OBJECT, {} );

    this.uuid = THREE.Math.generateUUID();

    this.type = utils.ensureTypedArg( options.type, types.NUMBER, SPE.emitterTypes.BOX );

    this.position = {
        value: utils.ensureInstanceOf( options.position.value, THREE.Vector3, new THREE.Vector3() ),
        spread: utils.ensureInstanceOf( options.position.spread, THREE.Vector3, new THREE.Vector3() )
    };

    this.velocity = {
        value: utils.ensureInstanceOf( options.velocity.value, THREE.Vector3, new THREE.Vector3() ),
        spread: utils.ensureInstanceOf( options.velocity.spread, THREE.Vector3, new THREE.Vector3() )
    };

    this.particleCount = utils.ensureTypedArg( options.particleCount, types.NUMBER, 100 );
    this.duration = utils.ensureTypedArg( options.duration, types.NUMBER, null );


    // The following properties are set internally and are not
    // user-controllable.
    this.particlesPerSecond = 0;
};

SPE.Emitter.constructor = SPE.Emitter;


SPE.Emitter.prototype._calculatePPSValue = function( groupMaxAge ) {
    // Calculate the `particlesPerSecond` value for this emitter. It's used
    // when determining which particles should die and which should live to
    // see another day. Or be born, for that matter. The "God" property.
    if ( this.duration ) {
        this.particlesPerSecond = this.particleCount / ( groupMaxAge < this.duration ? groupMaxAge : this.duration );
    }
    else {
        this.particlesPerSecond = this.particleCount / groupMaxAge;
    }

    // Ensure the calculated value is floored. Will make sure that it
    // doesn't run out of particles and cause a (very brief) gap in
    // emission.
    this.particlesPerSecond |= 0;
};