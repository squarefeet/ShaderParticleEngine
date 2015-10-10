SPE.Emitter = function( options ) {
    var utils = SPE.utils,
        types = utils.types,
        minLifetimeLength = SPE.valueOverLifetimes.minLength,
        maxLifetimeLength = SPE.valueOverLifetimes.maxLength;

    // Ensure we have a map of options to play with,
    // and that each option is in the correct format.
    options = utils.ensureTypedArg( options, types.OBJECT, {} );
    options.position = utils.ensureTypedArg( options.position, types.OBJECT, {} );
    options.velocity = utils.ensureTypedArg( options.velocity, types.OBJECT, {} );
    options.acceleration = utils.ensureTypedArg( options.acceleration, types.OBJECT, {} );
    options.drag = utils.ensureTypedArg( options.drag, types.OBJECT, {} );
    options.color = utils.ensureTypedArg( options.color, types.OBJECT, {} );
    options.opacity = utils.ensureTypedArg( options.opacity, types.OBJECT, {} );
    options.size = utils.ensureTypedArg( options.size, types.OBJECT, {} );
    options.angle = utils.ensureTypedArg( options.angle, types.OBJECT, {} );
    this.uuid = THREE.Math.generateUUID();

    this.type = utils.ensureTypedArg( options.type, types.NUMBER, SPE.emitterTypes.BOX );

    // Start assigning properties...kicking it off with props that DON'T support values over
    // lifetimes.
    //
    // Btw, values over lifetimes are just the new way of referring to *Start, *Middle, and *End.
    // Soon, I hope to allow for more than 3 values.
    this.position = {
        value: utils.ensureInstanceOf( options.position.value, THREE.Vector3, new THREE.Vector3() ),
        spread: utils.ensureInstanceOf( options.position.spread, THREE.Vector3, new THREE.Vector3() )
    };

    this.velocity = {
        value: utils.ensureInstanceOf( options.velocity.value, THREE.Vector3, new THREE.Vector3() ),
        spread: utils.ensureInstanceOf( options.velocity.spread, THREE.Vector3, new THREE.Vector3() )
    };

    this.acceleration = {
        value: utils.ensureInstanceOf( options.acceleration.value, THREE.Vector3, new THREE.Vector3() ),
        spread: utils.ensureInstanceOf( options.acceleration.spread, THREE.Vector3, new THREE.Vector3() )
    };

    this.drag = {
        value: utils.ensureTypedArg( options.drag.value, types.NUMBER, 0 ),
        spread: utils.ensureTypedArg( options.drag.spread, types.NUMBER, 0 )
    };

    // The following properties can support either single values, or an array of values that change
    // the property over a particle's lifetime (value over lifetime).
    this.color = {
        value: utils.ensureArrayInstanceOf( options.color.value, THREE.Color, [ new THREE.Color() ] ),
        spread: utils.ensureArrayInstanceOf( options.color.spread, THREE.Vector3, [ new THREE.Vector3() ] )
    };

    this.opacity = {
        value: utils.ensureArrayTypedArg( options.opacity.value, types.NUMBER, [ 1 ] ),
        spread: utils.ensureArrayTypedArg( options.opacity.spread, types.NUMBER, [ 0 ] )
    };

    this.size = {
        value: utils.ensureArrayTypedArg( options.size.value, types.NUMBER, [ 1 ] ),
        spread: utils.ensureArrayTypedArg( options.size.spread, types.NUMBER, [ 0 ] )
    };

    this.angle = {
        value: utils.ensureArrayTypedArg( options.angle.value, types.NUMBER, [ 1 ] ),
        spread: utils.ensureArrayTypedArg( options.angle.spread, types.NUMBER, [ 0 ] )
    };

    // Assign renaining option values.
    this.particleCount = utils.ensureTypedArg( options.particleCount, types.NUMBER, 100 );
    this.duration = utils.ensureTypedArg( options.duration, types.NUMBER, null );


    // The following properties are set internally and are not
    // user-controllable.
    this.particlesPerSecond = 0;


    // Ensure that the value-over-lifetime property objects above
    // have value and spread properties that are of the same length.
    //
    // Also, for now, make sure they have a length of 3 (min/max arguments here).
    utils.ensureValueOverLifetimeCompliance( this.color, minLifetimeLength, maxLifetimeLength );
    utils.ensureValueOverLifetimeCompliance( this.opacity, minLifetimeLength, maxLifetimeLength );
    utils.ensureValueOverLifetimeCompliance( this.size, minLifetimeLength, maxLifetimeLength );
    utils.ensureValueOverLifetimeCompliance( this.angle, minLifetimeLength, maxLifetimeLength );
};

SPE.Emitter.constructor = SPE.Emitter;

// SPE.Emitter.prototype._ensureProperty = function( options, name, type, defaultValue, spreadValue ) {
//     options[ name ] = utils.ensureTypedArg( options[ name ], SPE.utils.types.OBJECT, {} );

//     this[ name ] = {
//         value: utils.ensureInstanceOf( options[ name ].value, THREE.Vector3, new THREE.Vector3() ),
//         spread: utils.ensureInstanceOf( options[ name].spread, THREE.Vector3, new THREE.Vector3() ),
//     }
// };

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


SPE.Emitter.prototype.tick = function( dt ) {
    var start = this.attributeOffset,
        end = start + this.particleCount,
        attributes = this.attributes,
        params = attributes.params.typedArray.array; // vec3( alive, age, emitterIndex )

    for ( var i = start; i < end; ++i ) {
        // Increment age
        params[ ( i * 3 ) + 1 ] += dt;

        if ( params[ ( i * 3 ) + 1 ] >= this.maxAge ) {
            params[ ( i * 3 ) + 1 ] = 0.0;
        }

    }

    // params.typedArray.array[ ( start * 3 ) + 1 ] += dt;

    // if ( params.typedArray.array[ ( start * 3 ) + 1 ] > this.maxAge ) {
    //     console.log( 'reset' );
    //     params.typedArray.array[ ( start * 3 ) + 1 ] = 0.0;
    // }
    attributes.params.bufferAttribute.needsUpdate = true;

    // console.log( start, end );
};