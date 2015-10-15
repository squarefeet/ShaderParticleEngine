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
    options.wiggle = utils.ensureTypedArg( options.wiggle, types.OBJECT, {} );
    options.maxAge = utils.ensureTypedArg( options.maxAge, types.OBJECT, {} );

    this.uuid = THREE.Math.generateUUID();

    this.type = utils.ensureTypedArg( options.type, types.NUMBER, SPE.distributions.BOX );

    // Start assigning properties...kicking it off with props that DON'T support values over
    // lifetimes.
    //
    // Btw, values over lifetimes are just the new way of referring to *Start, *Middle, and *End.
    this.position = {
        _value: utils.ensureInstanceOf( options.position.value, THREE.Vector3, new THREE.Vector3() ),
        _spread: utils.ensureInstanceOf( options.position.spread, THREE.Vector3, new THREE.Vector3() ),
        _spreadClamp: utils.ensureInstanceOf( options.position.spreadClamp, THREE.Vector3, new THREE.Vector3() ),
        _distribution: utils.ensureTypedArg( options.position.distribution, types.NUMBER, this.type )
    };

    // TODO: Use this as the old `speed` property.
    this.velocity = {
        _value: utils.ensureInstanceOf( options.velocity.value, THREE.Vector3, new THREE.Vector3() ),
        _spread: utils.ensureInstanceOf( options.velocity.spread, THREE.Vector3, new THREE.Vector3() ),
        _distribution: utils.ensureTypedArg( options.velocity.distribution, types.NUMBER, this.type )
    };

    this.acceleration = {
        _value: utils.ensureInstanceOf( options.acceleration.value, THREE.Vector3, new THREE.Vector3() ),
        _spread: utils.ensureInstanceOf( options.acceleration.spread, THREE.Vector3, new THREE.Vector3() ),
        _distribution: utils.ensureTypedArg( options.acceleration.distribution, types.NUMBER, this.type )
    };

    this.radius = {
        _value: utils.ensureTypedArg( options.radius.value, types.NUMBER, 10 ),
        _spread: utils.ensureTypedArg( options.radius.spread, types.NUMBER, 0 ),
        _spreadClamp: utils.ensureTypedArg( options.radius.spreadClamp, types.NUMBER, 0 ),
        _scale: utils.ensureInstanceOf( options.radius.scale, THREE.Vector3, new THREE.Vector3( 1, 1, 1 ) )
    };

    this.drag = {
        _value: utils.ensureTypedArg( options.drag.value, types.NUMBER, 0 ),
        _spread: utils.ensureTypedArg( options.drag.spread, types.NUMBER, 0 )
    };

    this.wiggle = {
        _value: utils.ensureTypedArg( options.wiggle.value, types.NUMBER, 0 ),
        _spread: utils.ensureTypedArg( options.wiggle.spread, types.NUMBER, 0 )
    };


    this.rotation = {
        _axis: utils.ensureInstanceOf( options.rotation.axis, THREE.Vector3, new THREE.Vector3( 0.0, 1.0, 0.0 ) ),
        _axisSpread: utils.ensureInstanceOf( options.rotation.axisSpread, THREE.Vector3, new THREE.Vector3() ),
        _angle: utils.ensureTypedArg( options.rotation.angle, types.NUMBER, 0 ),
        _angleSpread: utils.ensureTypedArg( options.rotation.angleSpread, types.NUMBER, 0 ),
        _static: utils.ensureTypedArg( options.rotation.static, types.BOOLEAN, false ),
        _center: utils.ensureInstanceOf( options.rotation.center, THREE.Vector3, this.position._value ),
    };


    this.maxAge = {
        _value: utils.ensureTypedArg( options.maxAge.value, types.NUMBER, 2 ),
        _spread: utils.ensureTypedArg( options.maxAge.spread, types.NUMBER, 0 )
    };



    // The following properties can support either single values, or an array of values that change
    // the property over a particle's lifetime (value over lifetime).
    this.color = {
        _value: utils.ensureArrayInstanceOf( options.color.value, THREE.Color, new THREE.Color() ),
        _spread: utils.ensureArrayInstanceOf( options.color.spread, THREE.Vector3, new THREE.Vector3() )
    };

    this.opacity = {
        _value: utils.ensureArrayTypedArg( options.opacity.value, types.NUMBER, 1 ),
        _spread: utils.ensureArrayTypedArg( options.opacity.spread, types.NUMBER, 0 )
    };

    this.size = {
        _value: utils.ensureArrayTypedArg( options.size.value, types.NUMBER, 1 ),
        _spread: utils.ensureArrayTypedArg( options.size.spread, types.NUMBER, 0 )
    };

    this.angle = {
        _value: utils.ensureArrayTypedArg( options.angle.value, types.NUMBER, 0 ),
        _spread: utils.ensureArrayTypedArg( options.angle.spread, types.NUMBER, 0 )
    };


    // Assign renaining option values.
    this.particleCount = utils.ensureTypedArg( options.particleCount, types.NUMBER, 100 );
    this.duration = utils.ensureTypedArg( options.duration, types.NUMBER, null );
    this.isStatic = utils.ensureTypedArg( options.isStatic, types.BOOLEAN, false );
    this.activeMultiplier = utils.ensureTypedArg( options.activeMultiplier, types.NUMBER, 1 );



    // The following properties are set internally and are not
    // user-controllable.
    this.particlesPerSecond = 0;

    // The current particle index for which particles should
    // be marked as active on the next update cycle.
    this.activationIndex = 0;

    // Whether this emitter is alive or not.
    this.alive = true;

    // Holds the time the emitter has been alive for.
    this.age = 0.0;

    // A set of flags to determine whether particular properties
    // should be re-randomised when a particle is reset.
    //
    // If a `randomise` property is given, this is preferred.
    // Otherwise, it looks at whether a spread value has been
    // given.
    //
    // It allows randomization to be turned off as desired. If
    // all randomization is turned off, then I'd expect a performance
    // boost as no attribute buffers (excluding the `params`)
    // would have to be re-passed to the GPU each frame (since nothing
    // except the `params` attribute would have changed).
    this.resetFlags = {
        maxAge: utils.ensureTypedArg( options.maxAge._randomise, types.BOOLEAN, !!options.maxAge._spread ),
        position: utils.ensureTypedArg( options.position._randomise, types.BOOLEAN, !!options.position._spread && !!options.position._spread.lengthSq() ),
        velocity: utils.ensureTypedArg( options.velocity._randomise, types.BOOLEAN, !!options.velocity._spread && !!options.velocity._spread.lengthSq() ),
        acceleration: utils.ensureTypedArg( options.acceleration._randomise, types.BOOLEAN, !!options.acceleration._spread && !!options.acceleration._spread.lengthSq() ),
        radius: utils.ensureTypedArg( options.radius._randomise, types.BOOLEAN, !!options.radius._spread ),
        drag: utils.ensureTypedArg( options.drag._randomise, types.BOOLEAN, !!options.drag._spread ),
        wiggle: utils.ensureTypedArg( options.wiggle._randomise, types.BOOLEAN, !!options.wiggle._spread ),
        rotation: utils.ensureTypedArg( options.rotation._randomise, types.BOOLEAN, !!options.rotation._spread ),
        size: utils.ensureTypedArg( options.size._randomise, types.BOOLEAN, !!options.size._spread && ( !!options.size._spread.length || options.size._spread ) ),
        color: utils.ensureTypedArg( options.color._randomise, types.BOOLEAN, !!options.color._spread && ( !!options.color._spread.length || options.color._spread ) ),
        opacity: utils.ensureTypedArg( options.opacity._randomise, types.BOOLEAN, !!options.opacity._spread && ( !!options.opacity._spread.length || options.opacity._spread ) ),
        angle: utils.ensureTypedArg( options.angle._randomise, types.BOOLEAN, !!options.angle._spread && ( !!options.angle._spread.length || options.angle._spread ) ),
    };

    this.updateFlags = {};
    this.updateCounts = {};

    // A map to indicate which emitter parameters should update
    // which attribute.
    this.updateMap = {
        maxAge: 'params',
        position: 'position',
        velocity: 'velocity',
        acceleration: 'acceleration',
        radius: 'position',
        drag: 'acceleration',
        wiggle: 'params',
        rotation: 'rotation',
        size: 'size',
        color: 'color',
        opacity: 'opacity',
        angle: 'angle'
    };

    for ( var i in this.resetFlags ) {
        this.updateFlags[ i ] = false;
        this.updateCounts[ i ] = 0;
        this._createGetterSetters( this[ i ], i );
    }

    this.bufferUpdateRanges = {};
    this.attributeKeys = null;
    this.attributeCount = 0;


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

SPE.Emitter.prototype._createGetterSetters = function( propObj, propName ) {
    var self = this;

    for ( var i in propObj ) {
        var name = i.replace( '_', '' );

        Object.defineProperty( propObj, name, {
            get: ( function( prop ) {
                return function() {
                    return this[ prop ];
                };
            }( i ) ),

            set: ( function( prop ) {
                return function( value ) {
                    var mapName = self.updateMap[ propName ];
                    self.updateFlags[ mapName ] = true;
                    self.updateCounts[ mapName ] = 0.0;
                    this[ prop ] = value;
                };
            }( i ) )
        } )
    }
};

SPE.Emitter.prototype._setBufferUpdateRanges = function( keys ) {
    this.attributeKeys = keys;
    this.attributeCount = keys.length;

    for ( var i = this.attributeCount - 1; i >= 0; --i ) {
        this.bufferUpdateRanges[ keys[ i ] ] = {
            min: Number.POSITIVE_INFINITY,
            max: Number.NEGATIVE_INFINITY
        };
    }
};

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

    // this.particlesPerSecond = Math.max( this.particlesPerSecond, 1 );
};

SPE.Emitter.prototype._assignValue = function( prop, index ) {
    console.log( prop );

    switch ( prop ) {
        case 'position':
            this._assignPositionValue( index );
            break;

        case 'velocity':
            this._assignVelocityValue( index );
            break;

        case 'acceleration':
            this._assignAccelerationValue( index );
            break;
    }
};

SPE.Emitter.prototype._assignPositionValue = function( index ) {
    var distributions = SPE.distributions,
        utils = SPE.utils,
        prop = this.position,
        attr = this.attributes.position,
        value = prop._value,
        spread = prop._spread,
        distribution = prop._distribution;

    switch ( distribution ) {
        case distributions.BOX:
            utils.randomVector3( attr, index, value, spread, prop._spreadClamp );
            break;

        case SPE.distributions.SPHERE:
            utils.randomVector3OnSphere( attr, index, value, this.radius._value, this.radius._spread, this.radius._scale, this.radius._spreadClamp );
            break;
    }
};

SPE.Emitter.prototype._assignVelocityValue = function( index ) {
    var distributions = SPE.distributions,
        utils = SPE.utils,
        prop = this.velocity,
        value = prop._value,
        spread = prop._spread,
        distribution = prop._distribution,
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
                this.position._value,
                this.velocity._value.x,
                this.velocity._spread.x
            );
            break;
    }
};

SPE.Emitter.prototype._assignAccelerationValue = function( index ) {
    var distributions = SPE.distributions,
        utils = SPE.utils,
        prop = this.acceleration,
        value = prop._value,
        spread = prop._spread,
        distribution = prop._distribution,
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
                this.position._value,
                this.acceleration._value.x,
                this.acceleration._spread.x
            );
            break;
    }

    // Assign drag to w component.
    var drag = utils.clamp( utils.randomFloat( this.drag._value, this.drag._spread ), 0, 1 );
    this.attributes.acceleration.typedArray.array[ index * 4 + 3 ] = drag;
};

SPE.Emitter.prototype._resetParticle = function( index ) {
    var resetFlags = this.resetFlags,
        updateFlags = this.updateFlags,
        updateCounts = this.updateCounts,
        keys = this.attributeKeys,
        key,
        updateFlag;

    for ( var i = this.attributeCount - 1; i >= 0; --i ) {
        key = keys[ i ];
        updateFlag = updateFlags[ key ];

        if ( resetFlags[ key ] || updateFlag ) {
            this._assignValue( key, index );
            this._updateAttributeUpdateRange( key, index );

            if ( updateFlag === true && updateCounts[ key ] > this.particleCount ) {
                updateFlags[ key ] = false;
                updateCounts[ key ] = 0.0;
            }
            else if ( updateFlag === true ) {
                ++updateCounts[ key ]
            }
        }
    }
};

SPE.Emitter.prototype._updateAttributeUpdateRange = function( attr, i ) {
    var ranges = this.bufferUpdateRanges[ attr ],
        min = ranges.min,
        max = ranges.max;

    ranges.min = Math.min( i, ranges.min );
    ranges.max = Math.max( i, ranges.max );
};

SPE.Emitter.prototype._resetBufferRanges = function() {
    var ranges = this.bufferUpdateRanges,
        keys = this.bufferUpdateKeys,
        i = this.bufferUpdateCount - 1,
        key;

    for ( i; i >= 0; --i ) {
        key = keys[ i ];
        ranges[ key ].min = Number.POSITIVE_INFINITY;
        ranges[ key ].max = Number.NEGATIVE_INFINITY;
    }
};

SPE.Emitter.prototype._resetUpdateFlags = function() {
    this.position.needsUpdate = false;
    this.velocity.needsUpdate = false;
    this.acceleration.needsUpdate = false;
    this.radius.needsUpdate = false;
    this.drag.needsUpdate = false;
    this.wiggle.needsUpdate = false;
    this.rotation.needsUpdate = false;
    this.maxAge.needsUpdate = false;
    this.color.needsUpdate = false;
    this.opacity.needsUpdate = false;
    this.size.needsUpdate = false;
    this.angle.needsUpdate = false;
};


SPE.Emitter.prototype.tick = function( dt ) {
    if ( this.isStatic ) {
        return;
    }

    var start = this.attributeOffset,
        end = start + this.particleCount,
        params = this.attributes.params.typedArray.array, // vec3( alive, age, maxAge, wiggle )
        ppsDt = this.particlesPerSecond * this.activeMultiplier * dt,
        activationIndex = this.activationIndex;

    // Reset the buffer update indices.
    this._resetBufferRanges();

    // Reset update flags
    this._resetUpdateFlags();

    // Increment age for those particles that are alive,
    // and kill off any particles whose age is over the limit.
    for ( var i = end - 1, index, maxAge, age, alive; i >= start; --i ) {
        index = i * 4;

        alive = params[ index ];

        // Increment age
        if ( alive === 1.0 ) {
            age = params[ index + 1 ];
            maxAge = params[ index + 2 ];
            age += dt;

            // Mark particle as dead
            if ( age > maxAge ) {
                age = 0.0;
                alive = 0.0;
            }

            params[ index ] = alive;
            params[ index + 1 ] = age;

            this._updateAttributeUpdateRange( 'params', i );
        }
    }

    // If the emitter is dead, reset the age of the emitter to zero,
    // ready to go again if required
    if ( this.alive === false ) {
        // this._updatePostTick( updatedParamsMin, updatedParamsMax );
        paramsUpdateRange.min = updatedParamsMin;
        paramsUpdateRange.max = updatedParamsMax;
        this.age = 0.0;
        return;
    }

    // If the emitter has a specified lifetime and we've exceeded it,
    // mark the emitter as dead.
    if ( this.duration !== null && this.age > this.duration ) {
        this.alive = false;
        this.age = 0.0;
    }


    var activationStart = activationIndex | 0,
        activationEnd = activationStart + ppsDt,
        activationCount = activationEnd - this.activationIndex + 1 | 0,
        dtPerParticle = activationCount > 0 ? dt / activationCount : 0;

    for ( var i = activationStart, index; i < activationEnd; ++i ) {
        index = i * 4;

        if ( params[ index ] === 0.0 ) {
            // Mark the particle as alive.
            params[ index ] = 1.0;
            this._resetParticle( i );

            // Move each particle being activated to
            // it's actual position in time.
            //
            // This stops particles being 'clumped' together
            // when frame rates are on the lower side of 60fps
            // or not constant (a very real possibility!)
            params[ index + 1 ] = dtPerParticle * ( i - activationStart );

            this._updateAttributeUpdateRange( 'params', i );
        }
    }

    // Move the activation window forward, soldier.
    this.activationIndex += ppsDt;

    if ( this.activationIndex > end ) {
        this.activationIndex = start;
    }


    // Increment the age of the emitter.
    this.age += dt;
};

SPE.Emitter.prototype.reset = function( force ) {
    this.age = 0.0;
    this.alive = false;

    if ( force === true ) {
        var start = this.attributeOffset,
            end = start + this.particleCount,
            array = this.attributes.params.typedArray.array,
            attr = this.attributes.params.bufferAttribute;

        for ( var i = end - 1, index; i >= start; --i ) {
            index = i * 4;

            array[ index ] = 0.0;
            array[ index + 1 ] = 0.0;
        }

        attr.updateRange.offset = 0;
        attr.updateRange.count = -1;
        attr.needsUpdate = true;
    }
};

SPE.Emitter.prototype.enable = function() {
    this.alive = true;
};
SPE.Emitter.prototype.disable = function() {
    this.alive = false;
};