SPE.Emitter = function( options ) {
    var utils = SPE.utils,
        types = utils.types,
        lifetimeLength = SPE.valueOverLifetimeLength;

    // Ensure we have a map of options to play with,
    // and that each option is in the correct format.
    options = utils.ensureTypedArg( options, types.OBJECT, {} );
    options.position = utils.ensureTypedArg( options.position, types.OBJECT, {} );
    options.velocity = utils.ensureTypedArg( options.velocity, types.OBJECT, {} );
    options.acceleration = utils.ensureTypedArg( options.acceleration, types.OBJECT, {} );
    options.radius = utils.ensureTypedArg( options.radius, types.OBJECT, {} );
    options.drag = utils.ensureTypedArg( options.drag, types.OBJECT, {} );
    options.rotation = utils.ensureTypedArg( options.rotation, types.OBJECT, {} );
    options.color = utils.ensureTypedArg( options.color, types.OBJECT, {} );
    options.opacity = utils.ensureTypedArg( options.opacity, types.OBJECT, {} );
    options.size = utils.ensureTypedArg( options.size, types.OBJECT, {} );
    options.angle = utils.ensureTypedArg( options.angle, types.OBJECT, {} );
    options.delay = utils.ensureTypedArg( options.delay, types.OBJECT, {} );
    options.maxAge = utils.ensureTypedArg( options.maxAge, types.OBJECT, {} );

    this.uuid = THREE.Math.generateUUID();

    this.type = utils.ensureTypedArg( options.type, types.NUMBER, SPE.distributions.BOX );

    // Start assigning properties...kicking it off with props that DON'T support values over
    // lifetimes.
    //
    // Btw, values over lifetimes are just the new way of referring to *Start, *Middle, and *End.
    this.position = {
        value: utils.ensureInstanceOf( options.position.value, THREE.Vector3, new THREE.Vector3() ),
        spread: utils.ensureInstanceOf( options.position.spread, THREE.Vector3, new THREE.Vector3() ),
        distribution: utils.ensureTypedArg( options.position.distribution, types.NUMBER, this.type )
    };

    // TODO: Use this as the old `speed` property.
    this.velocity = {
        value: utils.ensureInstanceOf( options.velocity.value, THREE.Vector3, new THREE.Vector3() ),
        spread: utils.ensureInstanceOf( options.velocity.spread, THREE.Vector3, new THREE.Vector3() ),
        distribution: utils.ensureTypedArg( options.velocity.distribution, types.NUMBER, this.type )
    };

    this.acceleration = {
        value: utils.ensureInstanceOf( options.acceleration.value, THREE.Vector3, new THREE.Vector3() ),
        spread: utils.ensureInstanceOf( options.acceleration.spread, THREE.Vector3, new THREE.Vector3() ),
        distribution: utils.ensureTypedArg( options.acceleration.distribution, types.NUMBER, this.type )
    };

    this.radius = {
        value: utils.ensureTypedArg( options.radius.value, types.NUMBER, 10 ),
        spread: utils.ensureTypedArg( options.radius.spread, types.NUMBER, 0 ),
        spreadClamp: utils.ensureTypedArg( options.radius.spreadClamp, types.NUMBER, 0 ),
        scale: utils.ensureInstanceOf( options.radius.scale, THREE.Vector3, new THREE.Vector3( 1, 1, 1 ) )
    };

    this.drag = {
        value: utils.ensureTypedArg( options.drag.value, types.NUMBER, 0 ),
        spread: utils.ensureTypedArg( options.drag.spread, types.NUMBER, 0 )
    };

    // TODO:
    // - Figure out how to do this!
    this.delay = {
        value: utils.ensureTypedArg( options.delay.value, types.NUMBER, 0 ),
        spread: utils.ensureTypedArg( options.delay.spread, types.NUMBER, 0 )
    };


    this.rotation = {
        axis: utils.ensureInstanceOf( options.rotation.axis, THREE.Vector3, new THREE.Vector3( 0.0, 1.0, 0.0 ) ),
        speed: utils.ensureTypedArg( options.rotation.speed, types.NUMBER, 0 ),
        speedSpread: utils.ensureTypedArg( options.rotation.speedSpread, types.NUMBER, 0 ),
        angle: utils.ensureTypedArg( options.rotation.angle, types.NUMBER, 0 ),
        angleSpread: utils.ensureTypedArg( options.rotation.angleSpread, types.NUMBER, 0 )
    };


    this.maxAge = {
        value: utils.ensureTypedArg( options.maxAge.value, types.NUMBER, 2 ),
        spread: utils.ensureTypedArg( options.maxAge.spread, types.NUMBER, 0 )
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

    // The current particle index for which particles should
    // be marked as active on the next update cycle.
    this.activationIndex = 0;


    // A set of flags to determine whether particular properties
    // should be re-randomized when a particle is reset.
    //
    // If a `randomize` property is given, this is preferred.
    // Otherwise, it looks at whether a spread value has been
    // given.
    //
    // It allows randomization to be turned off as desired. If
    // all randomization is turned off, then I'd expect a performance
    // boost no attribute buffers (excluding the `params`)
    // would have to be re-passed to the GPU each frame (since nothing
    // except the `params` attribute would have changed).
    this.resetFlags = {
        position: utils.ensureTypedArg( options.position.randomize, types.BOOLEAN, !!options.position.spread ),
        velocity: utils.ensureTypedArg( options.velocity.randomize, types.BOOLEAN, !!options.velocity.spread ),
        acceleration: utils.ensureTypedArg( options.acceleration.randomize, types.BOOLEAN, !!options.acceleration.spread ),
        delay: utils.ensureTypedArg( options.delay.randomize, types.BOOLEAN, !!options.delay.spread )
    };


    // Ensure that the value-over-lifetime property objects above
    // have value and spread properties that are of the same length.
    //
    // Also, for now, make sure they have a length of 3 (min/max arguments here).
    utils.ensureValueOverLifetimeCompliance( this.color, lifetimeLength, lifetimeLength );
    utils.ensureValueOverLifetimeCompliance( this.opacity, lifetimeLength, lifetimeLength );
    utils.ensureValueOverLifetimeCompliance( this.size, lifetimeLength, lifetimeLength );
    utils.ensureValueOverLifetimeCompliance( this.angle, lifetimeLength, lifetimeLength );
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
    var particleCount = this.particleCount;


    // Calculate the `particlesPerSecond` value for this emitter. It's used
    // when determining which particles should die and which should live to
    // see another day. Or be born, for that matter. The "God" property.
    if ( this.duration ) {
        this.particlesPerSecond = particleCount / ( groupMaxAge < this.duration ? groupMaxAge : this.duration );
    }
    else {
        this.particlesPerSecond = particleCount / groupMaxAge;
    }
};

SPE.Emitter.prototype._assignPositionValue = function( index ) {
    var distributions = SPE.distributions,
        utils = SPE.utils,
        prop = this.position,
        attr = this.attributes.position,
        value = prop.value,
        spread = prop.spread,
        distribution = prop.distribution;

    switch ( distribution ) {
        case distributions.BOX:
            utils.randomVector3( attr, index, value, spread );
            break;

        case SPE.distributions.SPHERE:
            utils.randomVector3OnSphere( attr, index, value, this.radius.value, this.radius.spread, this.radius.scale, this.radius.spreadClamp );
            break;
    }
};

SPE.Emitter.prototype._assignVelocityValue = function( index ) {
    var distributions = SPE.distributions,
        utils = SPE.utils,
        prop = this.velocity,
        value = prop.value,
        spread = prop.spread,
        distribution = prop.distribution,
        positionX,
        positionY,
        positionZ;

    switch ( distribution ) {
        case distributions.BOX:
            utils.randomVector3( this.attributes.velocity, index, value, spread );
            break;

        case SPE.distributions.SPHERE:
            positionX = this.attributes.position.typedArray.array[ index * 3 ];
            positionY = this.attributes.position.typedArray.array[ index * 3 + 1 ];
            positionZ = this.attributes.position.typedArray.array[ index * 3 + 2 ];

            utils.randomDirectionVector3OnSphere(
                this.attributes.velocity, index,
                positionX, positionY, positionZ,
                this.position.value,
                this.velocity.value.x,
                this.velocity.spread.x
            );
            break;
    }
};

SPE.Emitter.prototype._assignAccelerationValue = function( index ) {
    var distributions = SPE.distributions,
        utils = SPE.utils,
        prop = this.acceleration,
        value = prop.value,
        spread = prop.spread,
        distribution = prop.distribution,
        positionX,
        positionY,
        positionZ;

    switch ( distribution ) {
        case distributions.BOX:
            utils.randomVector3( this.attributes.acceleration, index, value, spread );
            break;

        case SPE.distributions.SPHERE:
            positionX = this.attributes.position.typedArray.array[ index * 3 ];
            positionY = this.attributes.position.typedArray.array[ index * 3 + 1 ];
            positionZ = this.attributes.position.typedArray.array[ index * 3 + 2 ];

            utils.randomDirectionVector3OnSphere(
                this.attributes.acceleration, index,
                positionX, positionY, positionZ,
                this.position.value,
                this.acceleration.value.x,
                this.acceleration.spread.x
            );
            break;
    }

    // TODO:
    // - Assign drag to w component.
    var drag = 1 - utils.clamp( utils.randomFloat( this.drag.value, this.drag.spread ), 0, 1 );
    this.attributes.acceleration.typedArray.array[ index * 4 + 3 ] = drag;
};


SPE.Emitter.prototype.resetParticle = function( index ) {
    var resetFlags = this.resetFlags;

    if ( resetFlags.position === true ) {
        this._assignPositionValue( index );
        this.attributes.position.bufferAttribute.needsUpdate = true;
    }

    if ( resetFlags.velocity === true ) {
        this._assignVelocityValue( index );
        this.attribuets.position.bufferAttribute.needsUpdate = true;
    }

    if ( resetFlags.acceleration === true ) {
        this._assignAccelerationValue( index );
        this.attribuets.position.bufferAttribute.needsUpdate = true;
    }

    // Re-randomize delay attribute if required
    // if ( resetFlags.delay === true ) {
    //     this.attributes.params.typedArray.array[ index + 2 ] = Math.abs( SPE.utils.randomFloat( this.delay.value, this.delay.spread ) )
    // }
};


SPE.Emitter.prototype.tick = function( dt ) {
    var start = this.attributeOffset,
        end = start + this.particleCount,
        attributes = this.attributes,
        params = attributes.params.typedArray.array, // vec3( alive, age, maxAge, particleStartTime )
        ppsDt = this.particlesPerSecond * dt,
        activationIndex = this.activationIndex,
        updatedParamIndices = [];

    // Increment age for those particles that are alive,
    // and kill off any particles whose age is over the limit.
    for ( var i = start, index, maxAge, age, alive; i < end; ++i ) {
        index = i * 4;

        alive = params[ index ];
        age = params[ index + 1 ];
        maxAge = params[ index + 2 ];

        // Increment age
        if ( alive === 1.0 ) {
            age += dt;

            // Mark particle as dead
            if ( age > maxAge ) {
                age = 0.0;
                alive = 0.0;
                // this.resetParticle( i );
            }
            updatedParamIndices.push( i );



            params[ index ] = alive;
            params[ index + 1 ] = age;
        }
    }



    var activationStart = activationIndex | 0,
        activationEnd = activationStart + ppsDt,
        activationCount = activationEnd - this.activationIndex + 1 | 0,
        dtPerParticle = activationCount > 0 ? dt / activationCount : 0;

    for ( var i = activationStart, index; i < activationEnd; ++i ) {
        index = i * 4
        if ( params[ index ] === 0.0 ) {
            // Mark the particle as alive.
            params[ index ] = 1.0;

            // Move each particle being activated to
            // it's actual position in time.
            //
            // This stops particles being 'clumped' together
            // when frame rates are on the lower side of 60fps
            // or not constant (a very real possibility!)
            params[ index + 1 ] = dtPerParticle * ( i - activationStart );
            updatedParamIndices.push( i );
        }
    }

    // console.log( updatedParamIndices );

    var min = Number.POSITIVE_INFINITY,
        max = Number.NEGATIVE_INFINITY;

    for ( var i = 0; i < updatedParamIndices.length; ++i ) {
        min = Math.min( min, updatedParamIndices[ i ] * 4 );
        max = Math.max( max, updatedParamIndices[ i ] * 4 );
    }

    this.activationIndex += ppsDt;

    if ( this.activationIndex > end ) {
        this.activationIndex = start;
    }

    attributes.params.bufferAttribute.updateRange.offset = min;
    attributes.params.bufferAttribute.updateRange.count = max - min;
    attributes.params.bufferAttribute.dynamic = true;
    attributes.params.bufferAttribute.needsUpdate = true;
};