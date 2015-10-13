SPE.Group = function( options ) {
    var utils = SPE.utils,
        types = utils.types;

    // Ensure we have a map of options to play with
    options = utils.ensureTypedArg( options, types.OBJECT, {} );

    // Assign a UUID to this instance
    this.uuid = THREE.Math.generateUUID();

    // If no `deltaTime` value is passed to the `SPE.Group.tick` function,
    // the value of this property will be used to advance the simulation.
    this.fixedTimeStep = utils.ensureTypedArg( options.fixedTimeStep, types.NUMBER, 0.016 );

    // Set properties used in the uniforms map.
    this.texture = utils.ensureInstanceOf( options.texture, THREE.Texture, null );
    this.hasPerspective = utils.ensureTypedArg( options.hasPerspective, types.BOOLEAN, true );
    this.colorize = utils.ensureTypedArg( options.colorize, types.BOOLEAN, true );



    // Set properties used to define the ShaderMaterial's appearance.
    this.blending = utils.ensureTypedArg( options.blending, types.NUMBER, THREE.AdditiveBlending );
    this.transparent = utils.ensureTypedArg( options.transparent, types.BOOLEAN, true );
    this.alphaTest = utils.ensureTypedArg( options.alphaTest, types.NUMBER, 0.5 );
    this.depthWrite = utils.ensureTypedArg( options.depthWrite, types.BOOLEAN, false );
    this.depthTest = utils.ensureTypedArg( options.depthTest, types.BOOLEAN, true );
    this.fog = utils.ensureTypedArg( options.fog, types.BOOLEAN, true );
    // this.fogColor = utils.ensureInstanceOf( options.fogColor, THREE.Color, new THREE.Color() );

    // Where emitter's go to curl up in a warm blanket and live
    // out their days.
    this.emitters = [];
    this.emitterIDs = [];

    // Map of uniforms to be applied to the ShaderMaterial instance.
    this.uniforms = {
        texture: {
            type: 't',
            value: this.texture
        },
        // fogColor: {
        //     type: 'c',
        //     value: this.fogColor
        // },
        fogNear: {
            type: 'f',
            value: 10
        },
        fogFar: {
            type: 'f',
            value: 200
        },
        fogDensity: {
            type: 'f',
            value: 0.5
        },
        deltaTime: {
            type: 'f',
            value: 0
        },
        runTime: {
            type: 'f',
            value: 0
        }
    };

    // Add some defines into the mix...
    this.defines = {
        HAS_PERSPECTIVE: this.hasPerspective,
        COLORIZE: this.colorize,
        VALUE_OVER_LIFETIME_LENGTH: SPE.valueOverLifetimeLength,

        SHOULD_ROTATE_TEXTURE: false,
        SHOULD_ROTATE_PARTICLES: false,
        SHOULD_WIGGLE_PARTICLES: false,

        // Querying these in the shader slows it down!?
        // But they're constants?!
        // USING_SIZE_OVER_LIFETIME: false,
        // USING_COLOR_OVER_LIFETIME: false,
        // USING_ANGLE_OVER_LIFETIME: false,
        // USING_OPACITY_OVER_LIFETIME: false
    };

    // Map of all attributes to be applied to the particles.
    //
    // See SPE.ShaderAttribute for a bit more info on this bit.
    this.attributes = {
        position: new SPE.ShaderAttribute( 'v3', true ),
        acceleration: new SPE.ShaderAttribute( 'v4', true ), // w component is drag
        velocity: new SPE.ShaderAttribute( 'v3', true ),
        rotation: new SPE.ShaderAttribute( 'v4' ),
        rotationCenter: new SPE.ShaderAttribute( 'v3' ),
        params: new SPE.ShaderAttribute( 'v4', true ), // Holds (alive, age, delay, wiggle)
        size: new SPE.ShaderAttribute( 'v4' ),
        angle: new SPE.ShaderAttribute( 'v4' ),
        color: new SPE.ShaderAttribute( 'v4' ),
        opacity: new SPE.ShaderAttribute( 'v4' )
    };

    // Create the ShaderMaterial instance that'll help render the
    // particles.
    this.material = new THREE.ShaderMaterial( {
        uniforms: this.uniforms,
        vertexShader: SPE.shaders.vertex,
        fragmentShader: SPE.shaders.fragment,
        blending: this.blending,
        transparent: this.transparent,
        alphaTest: this.alphaTest,
        depthWrite: this.depthWrite,
        depthTest: this.depthTest,
        defines: this.defines,
        fog: this.fog
    } );

    // Create the BufferGeometry and Points instances, ensuring
    // the geometry and material are given to the latter.
    this.geometry = new THREE.BufferGeometry();
    this.mesh = new THREE.Points( this.geometry, this.material );
};

SPE.Group.constructor = SPE.Group;


SPE.Group.prototype._updateDefines = function( emitter ) {
    this.defines.SHOULD_ROTATE_TEXTURE = this.defines.SHOULD_ROTATE_TEXTURE || !!Math.max(
        Math.max.apply( null, emitter.angle.value ),
        Math.max.apply( null, emitter.angle.spread )
    );

    this.defines.SHOULD_ROTATE_PARTICLES = this.defines.SHOULD_ROTATE_PARTICLES || !!Math.max(
        emitter.rotation.angle,
        emitter.rotation.angleSpread
    );

    this.defines.SHOULD_WIGGLE_PARTICLES = this.defines.SHOULD_WIGGLE_PARTICLES || !!Math.max(
        emitter.wiggle.value,
        emitter.wiggle.spread
    );
};

SPE.Group.prototype._applyAttributesToGeometry = function() {
    var attributes = this.attributes,
        geometry = this.geometry,
        geometryAttributes = geometry.attributes,
        attribute,
        geometryAttribute;

    for ( var attr in attributes ) {
        attribute = attributes[ attr ];

        // Update the array if this attribute exists on the geometry.
        //
        // This needs to be done because the attribute's typed array might have
        // been resized and reinstantiated, and might now be looking at a
        // different ArrayBuffer, so reference needs updating.
        if ( geometryAttribute = geometryAttributes[ attr ] ) {
            geometryAttribute.array = attribute.typedArray.array;
        }

        // Add the attribute to the geometry if it doesn't already exist.
        else {
            geometry.addAttribute( attr, attribute.bufferAttribute );
        }
    }
};



SPE.Group.prototype.addEmitter = function( emitter ) {
    // Ensure an actual emitter instance is passed here.
    //
    // Decided not to throw here, just in case a scene's
    // rendering would be paused. Logging an error instead
    // of stopping execution if exceptions aren't caught.
    if ( emitter instanceof SPE.Emitter === false ) {
        console.error( '`emitter` argument must be instance of SPE.Emitter. Was provided with:', emitter );
        return;
    }
    else if ( this.emitterIDs.indexOf( emitter.uuid ) > -1 ) {
        console.warn( 'Emitter already exists in this group. Will not add again.' );
        return;
    }


    console.time( 'SPE.Group.prototype.addEmitter' );


    var attributes = this.attributes,
        start = attributes.position.getLength() / 3,
        totalParticleCount = start + emitter.particleCount,
        utils = SPE.utils;

    // Set the `particlesPerSecond` value (PPS) on the emitter.
    // It's used to determine how many particles to release
    // on a per-frame basis.
    emitter._calculatePPSValue( emitter.maxAge.value + emitter.maxAge.spread );

    // Store the offset value in the TypedArray attributes for this emitter.
    emitter.attributeOffset = start;
    emitter.activationIndex = start;

    // Store reference to the attributes on the emitter for
    // easier access during the emitter's tick function.
    emitter.attributes = this.attributes;
    // emitter.maxAge = this.maxAge;



    // Ensure the attributes and their BufferAttributes exist, and their
    // TypedArrays are of the correct size.
    for ( var attr in attributes ) {
        attributes[ attr ]._createBufferAttribute( totalParticleCount );
    }



    // Loop through each particle this emitter wants to have, and create the attributes values,
    // storing them in the TypedArrays that each attribute holds.
    //
    // TODO: Optimise this!
    for ( var i = start, relativeIndex, particleStartTime; i < totalParticleCount; ++i ) {
        relativeIndex = i - start;
        particleStartTime = relativeIndex / emitter.particlesPerSecond;

        emitter._assignPositionValue( i );
        emitter._assignVelocityValue( i );
        emitter._assignAccelerationValue( i );

        attributes.size.typedArray.setVec4Components( i,
            Math.abs( utils.randomFloat( emitter.size.value[ 0 ], emitter.size.spread[ 0 ] ) ),
            Math.abs( utils.randomFloat( emitter.size.value[ 1 ], emitter.size.spread[ 1 ] ) ),
            Math.abs( utils.randomFloat( emitter.size.value[ 2 ], emitter.size.spread[ 2 ] ) ),
            Math.abs( utils.randomFloat( emitter.size.value[ 3 ], emitter.size.spread[ 3 ] ) )
        );

        attributes.angle.typedArray.setVec4Components( i,
            utils.randomFloat( emitter.angle.value[ 0 ], emitter.angle.spread[ 0 ] ),
            utils.randomFloat( emitter.angle.value[ 1 ], emitter.angle.spread[ 1 ] ),
            utils.randomFloat( emitter.angle.value[ 2 ], emitter.angle.spread[ 2 ] ),
            utils.randomFloat( emitter.angle.value[ 3 ], emitter.angle.spread[ 3 ] )
        );

        // alive, age, maxAge, wiggle
        attributes.params.typedArray.setVec4Components( i,
            0,
            0,
            Math.abs( utils.randomFloat( emitter.maxAge.value, emitter.maxAge.spread ) ),
            utils.randomFloat( emitter.wiggle.value, emitter.wiggle.spread )
        );


        utils.randomColorAsHex( attributes.color, i, emitter.color.value, emitter.color.spread );

        // utils.randomColor( attributes.colorStart, i, emitter.color.value[ 0 ], emitter.color.spread[ 0 ] );
        // utils.randomColor( attributes.colorMiddle, i, emitter.color.value[ 1 ], emitter.color.spread[ 1 ] );
        // utils.randomColor( attributes.colorEnd, i, emitter.color.value[ 2 ], emitter.color.spread[ 2 ] );

        attributes.opacity.typedArray.setVec4Components( i,
            Math.abs( utils.randomFloat( emitter.opacity.value[ 0 ], emitter.opacity.spread[ 0 ] ) ),
            Math.abs( utils.randomFloat( emitter.opacity.value[ 1 ], emitter.opacity.spread[ 1 ] ) ),
            Math.abs( utils.randomFloat( emitter.opacity.value[ 2 ], emitter.opacity.spread[ 2 ] ) ),
            Math.abs( utils.randomFloat( emitter.opacity.value[ 3 ], emitter.opacity.spread[ 3 ] ) )
        );

        attributes.rotation.typedArray.setVec3Components( i,
            utils.getPackedRotationAxis( emitter.rotation.axis, emitter.rotation.axisSpread ),
            utils.randomFloat( emitter.rotation.angle, emitter.rotation.angleSpread ),
            emitter.rotation.static ? 0 : 1
        );

        attributes.rotationCenter.typedArray.setVec3( i, emitter.rotation.center );
    }

    // Update the geometry and make sure the attributes are referencing
    // the typed arrays properly.
    this._applyAttributesToGeometry();

    // Store this emitter in this group's emitter's store.
    this.emitters.push( emitter );
    this.emitterIDs.push( emitter.uuid );

    // Update certain flags to enable shader calculations only if they're necessary.
    this._updateDefines( emitter );

    // Update the material since defines might have changed
    this.material.needsUpdate = true;

    console.timeEnd( 'SPE.Group.prototype.addEmitter' );

    return this;
};

SPE.Group.prototype.removeEmitter = function( emitter ) {
    var emitterIndex = this.emitterIDs.indexOf( emitter.uuid );

    // Ensure an actual emitter instance is passed here.
    //
    // Decided not to throw here, just in case a scene's
    // rendering would be paused. Logging an error instead
    // of stopping execution if exceptions aren't caught.
    if ( emitter instanceof SPE.Emitter === false ) {
        console.error( '`emitter` argument must be instance of SPE.Emitter. Was provided with:', emitter );
        return;
    }
    else if ( emitterIndex === -1 ) {
        console.warn( 'Emitter does not exist in this group. Will not remove.' );
        return;
    }

    // Kill all particles
    var start = emitter.attributeOffset,
        end = start + emitter.particleCount,
        params = this.attributes.params.typedArray;

    for ( var i = start; i < end; ++i ) {
        params.array[ i * 4 ] = 0.0;
        params.array[ i * 4 + 1 ] = 0.0;
    }

    this.attributes.params.bufferAttribute.updateRange.count = -1;
    this.attributes.params.bufferAttribute.needsUpdate = true;

    this.emitters.splice( emitterIndex, 1 );
    this.emitterIDs.splice( emitterIndex, 1 );
};

SPE.Group.prototype._updateUniforms = function( dt ) {
    this.uniforms.runTime.value += dt;
    this.uniforms.deltaTime.value = dt;
};

SPE.Group.prototype.tick = function( dt ) {
    var emitters = this.emitters,
        numEmitters = emitters.length,
        deltaTime = dt || this.fixedTimeStep;

    if ( numEmitters === 0 ) {
        return;
    }

    this._updateUniforms( deltaTime );

    for ( var i = 0; i < numEmitters; ++i ) {
        emitters[ i ].tick( deltaTime );
    }

    return this;
};