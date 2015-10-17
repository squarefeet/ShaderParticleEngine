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
        _distribution: utils.ensureTypedArg( options.position.distribution, types.NUMBER, this.type ),
        _randomise: utils.ensureTypedArg( options.position.randomise, types.BOOLEAN, false )
    };

    // TODO: Use this as the old `speed` property.
    this.velocity = {
        _value: utils.ensureInstanceOf( options.velocity.value, THREE.Vector3, new THREE.Vector3() ),
        _spread: utils.ensureInstanceOf( options.velocity.spread, THREE.Vector3, new THREE.Vector3() ),
        _distribution: utils.ensureTypedArg( options.velocity.distribution, types.NUMBER, this.type ),
        _randomise: utils.ensureTypedArg( options.position.randomise, types.BOOLEAN, false )
    };

    this.acceleration = {
        _value: utils.ensureInstanceOf( options.acceleration.value, THREE.Vector3, new THREE.Vector3() ),
        _spread: utils.ensureInstanceOf( options.acceleration.spread, THREE.Vector3, new THREE.Vector3() ),
        _distribution: utils.ensureTypedArg( options.acceleration.distribution, types.NUMBER, this.type ),
        _randomise: utils.ensureTypedArg( options.position.randomise, types.BOOLEAN, false )
    };

    this.radius = {
        _value: utils.ensureTypedArg( options.radius.value, types.NUMBER, 10 ),
        _spread: utils.ensureTypedArg( options.radius.spread, types.NUMBER, 0 ),
        _spreadClamp: utils.ensureTypedArg( options.radius.spreadClamp, types.NUMBER, 0 ),
        _scale: utils.ensureInstanceOf( options.radius.scale, THREE.Vector3, new THREE.Vector3( 1, 1, 1 ) ),
        _randomise: utils.ensureTypedArg( options.position.randomise, types.BOOLEAN, false )
    };

    this.drag = {
        _value: utils.ensureTypedArg( options.drag.value, types.NUMBER, 0 ),
        _spread: utils.ensureTypedArg( options.drag.spread, types.NUMBER, 0 ),
        _randomise: utils.ensureTypedArg( options.position.randomise, types.BOOLEAN, false )
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
        _randomise: utils.ensureTypedArg( options.position.randomise, types.BOOLEAN, false )
    };


    this.maxAge = {
        _value: utils.ensureTypedArg( options.maxAge.value, types.NUMBER, 2 ),
        _spread: utils.ensureTypedArg( options.maxAge.spread, types.NUMBER, 0 )
    };



    // The following properties can support either single values, or an array of values that change
    // the property over a particle's lifetime (value over lifetime).
    this.color = {
        _value: utils.ensureArrayInstanceOf( options.color.value, THREE.Color, new THREE.Color() ),
        _spread: utils.ensureArrayInstanceOf( options.color.spread, THREE.Vector3, new THREE.Vector3() ),
        _randomise: utils.ensureTypedArg( options.position.randomise, types.BOOLEAN, false )
    };

    this.opacity = {
        _value: utils.ensureArrayTypedArg( options.opacity.value, types.NUMBER, 1 ),
        _spread: utils.ensureArrayTypedArg( options.opacity.spread, types.NUMBER, 0 ),
        _randomise: utils.ensureTypedArg( options.position.randomise, types.BOOLEAN, false )
    };

    this.size = {
        _value: utils.ensureArrayTypedArg( options.size.value, types.NUMBER, 1 ),
        _spread: utils.ensureArrayTypedArg( options.size.spread, types.NUMBER, 0 ),
        _randomise: utils.ensureTypedArg( options.position.randomise, types.BOOLEAN, false )
    };

    this.angle = {
        _value: utils.ensureArrayTypedArg( options.angle.value, types.NUMBER, 0 ),
        _spread: utils.ensureArrayTypedArg( options.angle.spread, types.NUMBER, 0 ),
        _randomise: utils.ensureTypedArg( options.position.randomise, types.BOOLEAN, false )
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
        // params: utils.ensureTypedArg( options.maxAge.randomise, types.BOOLEAN, !!options.maxAge.spread ) ||
        //     utils.ensureTypedArg( options.wiggle.randomise, types.BOOLEAN, !!options.wiggle.spread ),
        position: utils.ensureTypedArg( options.position.randomise, types.BOOLEAN, false ) ||
            utils.ensureTypedArg( options.radius.randomise, types.BOOLEAN, false ),
        velocity: utils.ensureTypedArg( options.velocity.randomise, types.BOOLEAN, false ),
        acceleration: utils.ensureTypedArg( options.acceleration.randomise, types.BOOLEAN, false ) ||
            utils.ensureTypedArg( options.drag.randomise, types.BOOLEAN, false ),
        rotation: utils.ensureTypedArg( options.rotation.randomise, types.BOOLEAN, false ),
        rotationCenter: utils.ensureTypedArg( options.rotation.randomise, types.BOOLEAN, false ),
        size: utils.ensureTypedArg( options.size.randomise, types.BOOLEAN, false ),
        color: utils.ensureTypedArg( options.color.randomise, types.BOOLEAN, false ),
        opacity: utils.ensureTypedArg( options.opacity.randomise, types.BOOLEAN, false ),
        angle: utils.ensureTypedArg( options.angle.randomise, types.BOOLEAN, false ),
    };

    this.updateFlags = {};
    this.updateCounts = {};

    // A map to indicate which emitter parameters should update
    // which attribute.
    this.updateMap = {
        maxAge: 'params',
        position: 'position', //
        velocity: 'velocity', //
        acceleration: 'acceleration', //
        radius: 'position', //
        drag: 'acceleration',
        wiggle: 'params',
        rotation: 'rotation',
        size: 'size',
        color: 'color',
        opacity: 'opacity',
        angle: 'angle'
    };

    for ( var i in this.updateMap ) {
        // this.updateFlags[ i ] = false;
        // this.updateCounts[ i ] = 0;
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
                    var mapName = self.updateMap[ propName ],
                        prevValue = this[ prop ],
                        length = SPE.valueOverLifetimeLength;

                    if ( prop === '_rotationCenter' ) {
                        self.updateFlags.rotationCenter = true;
                        self.updateCounts.rotationCenter = 0.0;
                    }
                    else if ( prop === '_randomise' ) {
                        self.resetFlags[ mapName ] = value;
                    }
                    else {
                        self.updateFlags[ mapName ] = true;
                        self.updateCounts[ mapName ] = 0.0;
                    }

                    this[ prop ] = value;

                    // If the previous value was an array, then make
                    // sure the provided value is interpolated correctly.
                    if ( Array.isArray( prevValue ) ) {
                        SPE.utils.ensureValueOverLifetimeCompliance( self[ propName ], length, length )
                    }
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
    switch ( prop ) {
        case 'position':
            this._assignPositionValue( index );
            break;

        case 'radius':
            if ( this.position._distribution !== SPE.distributions.BOX ) {
                this._assignPositionValue( index );
            }
            break;

        case 'velocity':
        case 'acceleration':
            this._assignForceValue( index, prop );
            break;

        case 'size':
        case 'opacity':
            this._assignLifetimeValue( index, prop );
            break;

        case 'angle':
            this._assignAngleValue( index );
            break;

        case 'params':
            this._assignParamsValue( index );
            break;

        case 'rotation':
            this._assignRotationValue( index );
            break;

        case 'color':
            this._assignColorValue( index );
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

        case distributions.SPHERE:
            utils.randomVector3OnSphere( attr, index, value, this.radius._value, this.radius._spread, this.radius._scale, this.radius._spreadClamp );
            break;

        case distributions.DISC:
            utils.randomVector3OnDisc( attr, index, value, this.radius._value, this.radius._spread, this.radius._scale, this.radius._spreadClamp );
            break;
    }
};

SPE.Emitter.prototype._assignForceValue = function( index, attrName ) {
    var distributions = SPE.distributions,
        utils = SPE.utils,
        prop = this[ attrName ],
        value = prop._value,
        spread = prop._spread,
        distribution = prop._distribution,
        pos,
        positionX,
        positionY,
        positionZ;

    switch ( distribution ) {
        case distributions.BOX:
            utils.randomVector3( this.attributes[ attrName ], index, value, spread );
            break;

        case distributions.SPHERE:
        case distributions.DISC:
            pos = this.attributes.position.typedArray.array;

            // Ensure position values aren't zero, otherwise no force will be
            // applied.
            positionX = utils.zeroToEpsilon( pos[ index * 3 ], true );
            positionY = utils.zeroToEpsilon( pos[ index * 3 + 1 ], true );
            positionZ = utils.zeroToEpsilon( pos[ index * 3 + 2 ], true );

            utils.randomDirectionVector3OnSphere(
                this.attributes[ attrName ], index,
                positionX, positionY, positionZ,
                this.position._value,
                this[ attrName ]._value.x,
                this[ attrName ]._spread.x
            );
            break;
    }

    if ( attrName === 'acceleration' ) {
        var drag = utils.clamp( utils.randomFloat( this.drag._value, this.drag._spread ), 0, 1 );
        this.attributes.acceleration.typedArray.array[ index * 4 + 3 ] = drag;
    }
};

SPE.Emitter.prototype._assignLifetimeValue = function( index, propName ) {
    var array = this.attributes[ propName ].typedArray,
        prop = this[ propName ],
        utils = SPE.utils,
        value;

    if ( utils.arrayValuesAreEqual( prop._value ) && utils.arrayValuesAreEqual( prop._spread ) ) {
        value = Math.abs( utils.randomFloat( prop._value[ 0 ], prop._spread[ 0 ] ) );
        array.setVec4Components( index, value, value, value, value );
    }
    else {
        array.setVec4Components( index,
            Math.abs( utils.randomFloat( prop._value[ 0 ], prop._spread[ 0 ] ) ),
            Math.abs( utils.randomFloat( prop._value[ 1 ], prop._spread[ 1 ] ) ),
            Math.abs( utils.randomFloat( prop._value[ 2 ], prop._spread[ 2 ] ) ),
            Math.abs( utils.randomFloat( prop._value[ 3 ], prop._spread[ 3 ] ) )
        );
    }
};

SPE.Emitter.prototype._assignAngleValue = function( index ) {
    var array = this.attributes.angle.typedArray,
        prop = emitter.angle,
        utils = SPE.utils,
        value;

    if ( utils.arrayValuesAreEqual( prop._value ) && utils.arrayValuesAreEqual( prop._spread ) ) {
        value = utils.randomFloat( prop._value[ 0 ], prop._spread[ 0 ] );
        array.setVec4Components( index, value, value, value, value );
    }
    else {
        array.setVec4Components( index,
            utils.randomFloat( prop._value[ 0 ], prop._spread[ 0 ] ),
            utils.randomFloat( prop._value[ 1 ], prop._spread[ 1 ] ),
            utils.randomFloat( prop._value[ 2 ], prop._spread[ 2 ] ),
            utils.randomFloat( prop._value[ 3 ], prop._spread[ 3 ] )
        );
    }
};

SPE.Emitter.prototype._assignParamsValue = function( index ) {
    this.attributes.params.typedArray.setVec4Components( index,
        this.isStatic ? 1 : 0,
        0.0,
        Math.abs( SPE.utils.randomFloat( this.maxAge._value, this.maxAge._spread ) ),
        SPE.utils.randomFloat( this.wiggle._value, this.wiggle._spread )
    );
};

SPE.Emitter.prototype._assignRotationValue = function( index ) {
    this.attributes.rotation.typedArray.setVec3Components( index,
        SPE.utils.getPackedRotationAxis( this.rotation._axis, this.rotation._axisSpread ),
        SPE.utils.randomFloat( this.rotation._angle, this.rotation._angleSpread ),
        this.rotation._static ? 0 : 1
    );

    this.attributes.rotationCenter.typedArray.setVec3( index, this.rotation._center );
};

SPE.Emitter.prototype._assignColorValue = function( index ) {
    SPE.utils.randomColorAsHex( this.attributes.color, index, this.color._value, this.color._spread );
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

            if ( updateFlag === true && ( ++updateCounts[ key ] ) === this.particleCount ) {
                updateFlags[ key ] = false;
                updateCounts[ key ] = 0.0;
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
            if ( age >= maxAge ) {
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
            // this.updateFlags.params = true;
            this._resetParticle( i );

            // Move each particle being activated to
            // it's actual position in time.
            //
            // This stops particles being 'clumped' together
            // when frame rates are on the lower side of 60fps
            // or not constant (a very real possibility!)
            params[ index + 1 ] = dtPerParticle * ( i - activationStart );
            // params[ index + 1 ] = 0.0;

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