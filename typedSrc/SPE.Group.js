SPE.Group = function( options ) {
    var utils = SPE.utils,
        types = utils.types;

    // Ensure we have a map of options to play with
    options = utils.ensureTypedArg( options, types.OBJECT, {} );

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

    // Map of uniforms to be applied to the ShaderMaterial instance.
    this.uniforms = {
        duration: {
            type: 'f',
            value: this.maxAge
        },
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
        }
    };

    // Map of all attributes to be applied to the particles.
    //
    // See SPE.ShaderAttribute for a bit more info on this bit.
    this.attributes = {
        acceleration: new SPE.ShaderAttribute( 'v3' ),
        velocity: new SPE.ShaderAttribute( 'v3' ),
        alive: new SPE.ShaderAttribute( 'f' ),
        age: new SPE.ShaderAttribute( 'f' ),
        size: new SPE.ShaderAttribute( 'v3' ),
        angle: new SPE.ShaderAttribute( 'v4' ),
        colorStart: new SPE.ShaderAttribute( 'c' ),
        colorMiddle: new SPE.ShaderAttribute( 'c' ),
        colorEnd: new SPE.ShaderAttribute( 'c' ),
        opacity: new SPE.ShaderAttribute( 'v3' ),
        position: new SPE.ShaderAttribute( 'v3' )
    };

    // Create the ShaderMaterial instance that'll help render the
    // particles.
    this.material = new THREE.ShaderMaterial( {
        uniforms: this.uniforms,
        // vertexShader: SPE.shaders.vertex,
        // fragmentShader: SPE.shaders.fragment,
        // blending: this.blending,
        // transparent: this.transparent,
        // alphaTest: this.alphaTest,
        // depthWrite: this.depthWrite,
        // depthTest: this.depthTest,
        // defines: this.defines,
        // fog: this.fog
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

    // Set the `particlesPerSecond` value (PPS) on the emitter.
    // It's used to determine how many particles to release
    // on a per-frame basis.
    emitter._calculatePPSValue( this.maxAge );

    var attributes = this.attributes,
        start = attributes.position.getLength() / 3,
        totalParticleCount = start + emitter.particleCount,
        utils = SPE.utils;

    // Store the offset value in the TypedArray attributes for this emitter.
    emitter.attributeOffset = start;

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
    for ( var i = start; i < totalParticleCount; ++i ) {
        utils.randomVector3( attributes.position, i, new THREE.Vector3( i, i, i ), new THREE.Vector3() );
        utils.randomVector3( attributes.velocity, i, new THREE.Vector3( i, i, i ), new THREE.Vector3() );
        utils.randomVector3( attributes.acceleration, i, new THREE.Vector3( i, i, i ), new THREE.Vector3() );

        // TODO:
        // Don't use utils.randomVector3 here. Size components need to be calculated seperately
        // and there's no need to use a Vec3 to do it in.
        utils.randomVector3( attributes.size, i, new THREE.Vector3( i, i, i ), new THREE.Vector3() );

        // TODO:
        // Don't use utils here. Use emitter's angle values. Again, no need for Vec3 instance.
        // Also, angle is currently a Vec4, but angleAlignVelocity is borked, so I should remove
        // that "feature".
        utils.randomVector3( attributes.angle, i, new THREE.Vector3( i, i, i ), new THREE.Vector3() );

        attributes.age.typedArray.setNumber( i, i ); // index, value
        attributes.alive.typedArray.setNumber( i, i ); // index, value

        utils.randomColor( attributes.colorStart, i, new THREE.Color( Math.random(), Math.random(), Math.random() ), new THREE.Vector3() );
        utils.randomColor( attributes.colorMiddle, i, new THREE.Color( Math.random(), Math.random(), Math.random() ), new THREE.Vector3() );
        utils.randomColor( attributes.colorEnd, i, new THREE.Color( Math.random(), Math.random(), Math.random() ), new THREE.Vector3() );

        utils.randomVector3( attributes.opacity, i, new THREE.Vector3( i, i, i ), new THREE.Vector3() );
    }

    // Update the geometry and make sure the attributes are referencing
    // the typed arrays properly.
    this._applyAttributesToGeometry();

    return this;
};

SPE.Group.prototype._applyAttributesToGeometry = function() {
    for ( var attr in this.attributes ) {
        // Update the array if this attribute exists on the geometry.
        //
        // This needs to be done because the attribute's typed array might have
        // been resized and reinstantiated, and might now be looking at a
        // different ArrayBuffer, so reference needs updating.
        if ( this.geometry.attributes[ attr ] ) {
            this.geometry.attributes[ attr ].array = this.attributes[ attr ].typedArray.array;
        }

        // Add the attribute to the geometry if it doesn't already exist.
        else {
            this.geometry.addAttribute( attr, this.attributes[ attr ].bufferAttribute );
        }
    }
};