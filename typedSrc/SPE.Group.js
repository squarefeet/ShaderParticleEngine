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
    this.maxAge = utils.ensureTypedArg( options.maxAge, types.NUMBER, 3 );
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
    this.fogColor = utils.ensureInstanceOf( options.fogColor, THREE.Color, new THREE.Color() );

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
        fogColor: {
            type: 'c',
            value: this.fogColor
        },
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

        sizeOverLifetime: {
            type: 'fv1',
            value: [ 0, 2, 0 ]
        }
    };

    // Add some defines into the mix...
    this.defines = {
        HAS_PERSPECTIVE: this.hasPerspective,
        COLORIZE: this.colorize,
        MAX_AGE: this.maxAge
    };

    // Map of all attributes to be applied to the particles.
    //
    // See SPE.ShaderAttribute for a bit more info on this bit.
    this.attributes = {
        acceleration: new SPE.ShaderAttribute( 'v3' ),
        velocity: new SPE.ShaderAttribute( 'v3' ),
        params: new SPE.ShaderAttribute( 'v3' ), // Holds (alive, age, emitterIndex)
        size: new SPE.ShaderAttribute( 'v3' ),
        angle: new SPE.ShaderAttribute( 'v4' ),
        color: new SPE.ShaderAttribute( 'v3' ),
        opacity: new SPE.ShaderAttribute( 'v3' ),
        position: new SPE.ShaderAttribute( 'v3' )
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
    else if ( this.emitterIDs.indexOf( emitter.UUID ) > -1 ) {
        console.warn( 'Emitter already exists in this group. Will not add again.' );
        return;
    }



    var attributes = this.attributes,
        start = attributes.position.getLength() / 3,
        totalParticleCount = start + emitter.particleCount,
        utils = SPE.utils;

    // Ensure the attributes and their BufferAttributes exist, and their
    // TypedArrays are of the correct size.
    for ( var attr in attributes ) {
        attributes[ attr ]._createBufferAttribute( totalParticleCount );
    }

    // Loop through each particle this emitter wants to have, and create the attributes values,
    // storing them in the TypedArrays that each attribute holds.
    //
    // TODO: Apply actual values from emitter, not just test data!
    // TODO: Think about attribute packing...esp. with age and alive.
    // TODO: Think about values over lifetimes...
    for ( var i = start; i < totalParticleCount; ++i ) {
        utils.randomVector3( attributes.position, i, emitter.position.value, emitter.position.spread );
        utils.randomVector3( attributes.velocity, i, emitter.velocity.value, emitter.velocity.spread );
        utils.randomVector3( attributes.acceleration, i, emitter.acceleration.value, emitter.acceleration.spread );


        attributes.size.typedArray.setVec3Components( i,
            Math.abs( utils.randomFloat( emitter.size.value[ 0 ], emitter.size.spread[ 0 ] ) ),
            Math.abs( utils.randomFloat( emitter.size.value[ 1 ], emitter.size.spread[ 1 ] ) ),
            Math.abs( utils.randomFloat( emitter.size.value[ 2 ], emitter.size.spread[ 2 ] ) )
        );

        attributes.angle.typedArray.setVec3Components( i,
            utils.randomFloat( emitter.angle.value[ 0 ], emitter.angle.spread[ 0 ] ),
            utils.randomFloat( emitter.angle.value[ 1 ], emitter.angle.spread[ 1 ] ),
            utils.randomFloat( emitter.angle.value[ 2 ], emitter.angle.spread[ 2 ] )
        );

        // alive, age, emitterIndex (used for valueOverLifetimes as array start index)
        attributes.params.typedArray.setVec3Components( i, 0, 0, 0 );

        // attributes.color.typedArray.setVec3Components( i,
        //     utils.randomFloat( emitter.color.value[ 0 ], emitter.color.spread[ 0 ] )
        // );

        utils.randomColorAsHex( attributes.color, i, emitter.color.value, emitter.color.spread );

        // utils.randomColor( attributes.colorStart, i, emitter.color.value[ 0 ], emitter.color.spread[ 0 ] );
        // utils.randomColor( attributes.colorMiddle, i, emitter.color.value[ 1 ], emitter.color.spread[ 1 ] );
        // utils.randomColor( attributes.colorEnd, i, emitter.color.value[ 2 ], emitter.color.spread[ 2 ] );

        utils.randomVector3( attributes.opacity, i, new THREE.Vector3( i, i, i ), new THREE.Vector3() );
    }

    // Update the geometry and make sure the attributes are referencing
    // the typed arrays properly.
    this._applyAttributesToGeometry();

    // Set the `particlesPerSecond` value (PPS) on the emitter.
    // It's used to determine how many particles to release
    // on a per-frame basis.
    emitter._calculatePPSValue( this.maxAge );

    // Store the offset value in the TypedArray attributes for this emitter.
    emitter.attributeOffset = start;

    // Store reference to the attributes on the emitter for
    // easier access during the emitter's tick function.
    emitter.attributes = this.attributes;
    emitter.maxAge = this.maxAge;

    // Store this emitter in this group's emitter's store.
    this.emitters.push( emitter );
    this.emitterIDs.push( emitter.uuid );

    return this;
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



SPE.Group.prototype.tick = function( dt ) {
    var that = this,
        emitters = that.emitters,
        numEmitters = emitters.length;

    dt = dt || that.fixedTimeStep;

    if ( numEmitters === 0 ) {
        return;
    }

    for ( var i = 0; i < numEmitters; ++i ) {
        emitters[ i ].tick( dt );
    }

    // this.geometry.needsUpdate = true;

    // that._flagUpdate();
    return that;
};