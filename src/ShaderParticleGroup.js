// ShaderParticleGroup 0.5.0
//
// (c) 2013 Luke Moody (http://www.github.com/squarefeet) & Lee Stemkoski (http://www.adelphi.edu/~stemkoski/)
//     Based on Lee Stemkoski's original work (https://github.com/stemkoski/stemkoski.github.com/blob/master/Three.js/js/ParticleEngine.js).
//
// ShaderParticleGroup may be freely distributed under the MIT license (See LICENSE.txt)


function ShaderParticleGroup( options ) {
    var that = this;

    that.fixedTimeStep          = parseFloat( options.fixedTimeStep || 0.016, 10 );

    // Uniform properties ( applied to all particles )
    that.maxAge                 = parseFloat( options.maxAge || 3 );
    that.texture                = options.texture || null;
    that.hasPerspective         = parseInt( typeof options.hasPerspective === 'number' ? options.hasPerspective : 1 );
    that.colorize               = parseInt( options.colorize || 1 );

    // Material properties
    that.blending               = typeof options.blending === 'number' ? options.blending : THREE.AdditiveBlending;
    that.transparent            = options.transparent || true;
    that.alphaTest              = options.alphaTest || 0.5;
    that.depthWrite             = options.depthWrite || false;
    that.depthTest              = options.depthTest || true;

    // Create uniforms
    that.uniforms = {
        duration:       { type: 'f', value: that.maxAge },
        texture:        { type: 't', value: that.texture },
        hasPerspective: { type: 'i', value: that.hasPerspective },
        colorize:       { type: 'i', value: that.colorize }
    };

    // Create a map of attributes that will hold values for each particle in this group.
    that.attributes = {
        acceleration:   { type: 'v3', value: [] },
        velocity:       { type: 'v3', value: [] },
        alive:          { type: 'f', value: [] },
        age:            { type: 'f', value: [] },
        size:           { type: 'f', value: [] },
        sizeEnd:        { type: 'f', value: [] },

        customColor:    { type: 'c', value: [] },
        customColorEnd: { type: 'c', value: [] },

        opacity:        { type: 'f', value: [] },
        opacityMiddle:  { type: 'f', value: [] },
        opacityEnd:     { type: 'f', value: [] }
    };

    // Emitters (that aren't static) will be added to this array for 
    // processing during the `tick()` function.
    that.emitters = [];

    // Create properties for use by the emitter pooling functions.
    that._pool = [];
    that._poolCreationSettings = null;
    that._createNewWhenPoolEmpty = 0;
    that.maxAgeMilliseconds = that.maxAge * 1000;

    // Create an empty geometry to hold the particles.
    // Each particle is a vertex pushed into this geometry's
    // vertices array.
    that.geometry = new THREE.Geometry();

    // Create the shader material using the properties we set above.
    that.material = new THREE.ShaderMaterial({
        uniforms:       that.uniforms,
        attributes:     that.attributes,
        vertexShader:   ShaderParticleGroup.shaders.vertex,
        fragmentShader: ShaderParticleGroup.shaders.fragment,
        blending:       that.blending,
        transparent:    that.transparent,
        alphaTest:      that.alphaTest,
        depthWrite:     that.depthWrite,
        depthTest:      that.depthTest,
    });

    // And finally create the ParticleSystem. It's got its `dynamic` property
    // set so that THREE.js knows to update it on each frame.
    that.mesh = new THREE.ParticleSystem( that.geometry, that.material );
    that.mesh.dynamic = true;
}

ShaderParticleGroup.prototype = {

    /**
     * Given a base vector and a spread range vector, create
     * a new THREE.Vector3 instance with randomised values.
     *
     * @private
     * 
     * @param  {THREE.Vector3} base
     * @param  {THREE.Vector3} spread
     * @return {THREE.Vector3}
     */
    _randomVector3: function( base, spread ) {
        var v = new THREE.Vector3();

        v.copy( base );

        v.x += Math.random() * spread.x - (spread.x/2);
        v.y += Math.random() * spread.y - (spread.y/2);
        v.z += Math.random() * spread.z - (spread.z/2);

        return v;
    },

    /**
     * Create a new THREE.Color instance and given a base vector and 
     * spread range vector, assign random values.
     *
     * Note that THREE.Color RGB values are in the range of 0 - 1, not 0 - 255.
     *
     * @private
     * 
     * @param  {THREE.Vector3} base
     * @param  {THREE.Vector3} spread
     * @return {THREE.Color}
     */
    _randomColor: function( base, spread ) {
        var v = new THREE.Color();

        v.copy( base );

        v.r += (Math.random() * spread.x) - (spread.x/2);
        v.g += (Math.random() * spread.y) - (spread.y/2);
        v.b += (Math.random() * spread.z) - (spread.z/2);

        v.r = Math.max( 0, Math.min( v.r, 1 ) );
        v.g = Math.max( 0, Math.min( v.g, 1 ) );
        v.b = Math.max( 0, Math.min( v.b, 1 ) );

        return v;
    },


    /**
     * Create a random Number value based on an initial value and 
     * a spread range
     *
     * @private
     * 
     * @param  {Number} base
     * @param  {Number} spread
     * @return {Number}
     */
    _randomFloat: function( base, spread ) {
        return base + spread * (Math.random() - 0.5);
    },


    /**
     * Create a new THREE.Vector3 instance and project it onto a random point
     * on a sphere with radius `radius`.
     * 
     * @param  {THREE.Vector3} base
     * @param  {Number} radius
     * @param  {THREE.Vector3} scale
     *
     * @private
     * 
     * @return {THREE.Vector3}
     */
    _randomVector3OnSphere: function( base, radius, scale ) {
        var z = 2 * Math.random() - 1;
        var t = 6.2832 * Math.random();
        var r = Math.sqrt( 1 - z*z );
        var vec = new THREE.Vector3( r * Math.cos(t), r * Math.sin(t), z );

        vec.multiplyScalar( radius );
        
        if( scale ) {
            vec.multiply( scale );
        }

        vec.add( base );

        return vec;
    },


    /**
     * Create a new THREE.Vector3 instance, and given a base position, and various
     * other values, project it onto a random point on a sphere with radius `radius`.
     * 
     * @param  {THREE.Vector3} base
     * @param  {THREE.Vector3} position
     * @param  {Number} speed
     * @param  {Number} speedSpread
     * @param  {THREE.Vector3} scale
     * @param  {Number} radius
     *
     * @private
     * 
     * @return {THREE.Vector3}
     */
    _randomVelocityVector3OnSphere: function( base, position, speed, speedSpread, scale, radius ) {
        var direction = new THREE.Vector3().subVectors( base, position );

        direction.normalize().multiplyScalar( this._randomFloat( speed, speedSpread ) );

        if( scale ) {
            direction.multiply( scale );
        }

        return direction;
    },


    /**
     * Given a base vector and a spread vector, randomise the given vector
     * accordingly.
     * 
     * @param  {THREE.Vector3} vector
     * @param  {THREE.Vector3} base
     * @param  {THREE.Vector3} spread
     *
     * @private
     * 
     * @return {[type]}
     */
    _randomizeExistingVector3: function( vector, base, spread ) {
        vector.set(
            Math.random() * base.x - spread.x,
            Math.random() * base.y - spread.y,
            Math.random() * base.z - spread.z
        );
    },


    /**
     * Tells the age and alive attributes (and the geometry vertices) 
     * that they need updating by THREE.js's internal tick functions.
     * 
     * @private
     * 
     * @return {this}
     */
    _flagUpdate: function() {
        var that = this;

        // Set flags to update (causes less garbage than
        // ```ParticleSystem.sortParticles = true``` in THREE.r58 at least)
        that.attributes.age.needsUpdate = true;
        that.attributes.alive.needsUpdate = true;
        that.geometry.verticesNeedUpdate = true;

        return that;
    },


    /**
     * Add an emitter to this particle group. Once added, an emitter will be automatically
     * updated when ShaderParticleGroup#tick() is called.
     * 
     * @param {ShaderParticleEmitter} emitter
     * @return {this}
     */
    addEmitter: function( emitter ) {
        var that = this;

        if( emitter.duration ) {
            emitter.numParticles = emitter.particlesPerSecond * (that.maxAge < emitter.emitterDuration ? that.maxAge : emitter.emitterDuration) | 0;
        }
        else {
            emitter.numParticles = emitter.particlesPerSecond * that.maxAge | 0;
        }

        emitter.numParticles = Math.ceil(emitter.numParticles);

        var vertices = that.geometry.vertices,
            start = vertices.length,
            end = emitter.numParticles + start,
            a = that.attributes,
            acceleration = a.acceleration.value,
            velocity = a.velocity.value,
            alive = a.alive.value,
            age = a.age.value,
            size = a.size.value,
            sizeEnd = a.sizeEnd.value,
            customColor = a.customColor.value,
            customColorEnd = a.customColorEnd.value,
            opacity = a.opacity.value,
            opacityMiddle = a.opacityMiddle.value;
            opacityEnd = a.opacityEnd.value;

        emitter.particleIndex = parseFloat( start, 10 );

        // Create the values
        for( var i = start; i < end; ++i ) {

            if( emitter.type === 'sphere' ) {
                vertices[i]     = that._randomVector3OnSphere( emitter.position, emitter.radius, emitter.radiusScale );
                velocity[i]     = that._randomVelocityVector3OnSphere( vertices[i], emitter.position, emitter.speed, emitter.speedSpread, emitter.radiusScale, emitter.radius );
            }
            else {
                vertices[i]     = that._randomVector3( emitter.position, emitter.positionSpread );
                velocity[i]     = that._randomVector3( emitter.velocity, emitter.velocitySpread );
            }


            acceleration[i] = that._randomVector3( emitter.acceleration, emitter.accelerationSpread );

            // Fix for bug #1 (https://github.com/squarefeet/ShaderParticleEngine/issues/1)
            // For some stupid reason I was limiting the size value to a minimum of 0.1. Derp.
            size[i]         = that._randomFloat( emitter.size, emitter.sizeSpread );
            sizeEnd[i]      = emitter.sizeEnd;
            age[i]          = 0.0;
            alive[i]        = emitter.static ? 1.0 : 0.0;


            customColor[i]      = that._randomColor( emitter.colorStart, emitter.colorSpread );
            customColorEnd[i]   = emitter.colorEnd;
            opacity[i]          = emitter.opacityStart;
            opacityMiddle[i]    = emitter.opacityMiddle;
            opacityEnd[i]       = emitter.opacityEnd;
        }

        // Cache properties on the emitter so we can access
        // them from its tick function.
        emitter.verticesIndex   = parseFloat( start );
        emitter.attributes      = that.attributes;
        emitter.vertices        = that.geometry.vertices;
        emitter.maxAge          = that.maxAge;

        // Save this emitter in an array for processing during this.tick()
        if( !emitter.static ) {
            that.emitters.push( emitter );
        }

        return that;
    },


    /**
     * The main particle group update function. Call this once per frame.
     * 
     * @param  {Number} dt
     * @return {this}
     */
    tick: function( dt ) {
        var that = this,
            emitters = that.emitters,
            numEmitters = emitters.length;

        dt = dt || that.fixedTimeStep;

        if( numEmitters === 0 ) return;

        for( var i = 0; i < numEmitters; ++i ) {
            emitters[i].tick( dt );
        }

        that._flagUpdate();
        return that;
    },


    /**
     * Fetch a single emitter instance from the pool.
     * If there are no objects in the pool, a new emitter will be 
     * created if specified.
     * 
     * @return {ShaderParticleEmitter | null}
     */
    getFromPool: function() {
        var that = this,
            pool = that._pool,
            createNew = that._createNewWhenPoolEmpty;

        if( pool.length ) {
            return pool.pop();
        }
        else if( createNew ) {
            return new ShaderParticleEmitter( that._poolCreationSettings );
        }
        
        return null;
    },


    /**
     * Release an emitter into the pool.
     * 
     * @param  {ShaderParticleEmitter} emitter
     * @return {this}
     */
    releaseIntoPool: function( emitter ) {
        if( !(emitter instanceof ShaderParticleEmitter) ) {
            console.error( 'Will not add non-emitter to particle group pool:', emitter );
            return;
        }

        emitter.reset();
        this._pool.unshift( emitter );

        return this;
    },


    /**
     * Get the pool array
     * 
     * @return {Array}
     */
    getPool: function() {
        return this._pool;
    },


    /**
     * Add a pool of emitters to this particle group
     * 
     * @param {Number} numEmitters      The number of emitters to add to the pool.
     * @param {Object} emitterSettings  An object describing the settings to pass to each emitter.
     * @param {Boolean} createNew       Should a new emitter be created if the pool runs out?
     * @return {this}
     */
    addPool: function( numEmitters, emitterSettings, createNew ) {
        var that = this,
            pool = that._pool,
            emitter;

        // Save relevant settings and flags.
        that._poolCreationSettings = emitterSettings;
        that._createNewWhenPoolEmpty = !!createNew;

        // Create the emitters, add them to this group and the pool.
        for( var i = 0; i < numEmitters; ++i ) {
            emitter = new ShaderParticleEmitter( emitterSettings );
            that.addEmitter( emitter );
            that.releaseIntoPool( emitter );
        }

        return that;
    },


    /**
     * Internal method. Sets a single emitter to be alive
     * 
     * @private
     * 
     * @param  {THREE.Vector3} pos
     * @return {this}
     */
    _triggerSingleEmitter: function( pos ) {
        var that = this,
            emitter = that.getFromPool();

        if( emitter === null ) {
            console.log('ShaderParticleGroup pool ran out.');
            return;
        }

        // TODO: Should an instanceof check happen here? Or maybe at least a typeof?
        if( pos ) {
            emitter.position.copy( pos );
        }
            
        emitter.enable();

        setTimeout( function() {
            emitter.disable();
            that.releaseIntoPool( emitter );
        }, that.maxAgeMilliseconds );

        return that;
    },


    /**
     * Set a given number of emitters as alive, with an optional position
     * vector3 to move them to.
     * 
     * @param  {Number} numEmitters
     * @param  {THREE.Vector3} position
     * @return {this}
     */
    triggerPoolEmitter: function( numEmitters, position ) {
        var that = this;

        if( typeof numEmitters === 'number' && numEmitters > 1) {
            for( var i = 0; i < numEmitters; ++i ) {
                that._triggerSingleEmitter( position );
            }
        }
        else {
            that._triggerSingleEmitter( position );
        }

        return that;
    }
};



// The all-important shaders
ShaderParticleGroup.shaders = {
    vertex: [
        'uniform float duration;',
        'uniform int hasPerspective;',

        'attribute vec3 customColor;',
        'attribute vec3 customColorEnd;',
        'attribute float opacity;',
        'attribute float opacityMiddle;',
        'attribute float opacityEnd;',

        'attribute vec3 acceleration;',
        'attribute vec3 velocity;',
        'attribute float alive;',
        'attribute float age;',
        'attribute float size;',
        'attribute float sizeEnd;',

        'varying vec4 vColor;',

        // Linearly lerp a float
        'float Lerp( float start, float end, float amount ) {',
            'return (start + ((end - start) * amount));',
        '}',

        // Linearly lerp a vector3
        'vec3 Lerp( vec3 start, vec3 end, float amount ) {',
            'return (start + ((end - start) * amount));',
        '}',

        // Integrate acceleration into velocity and apply it to the particle's position
        'vec4 GetPos() {',
            'vec3 newPos = vec3( position );',

            // Move acceleration & velocity vectors to the value they
            // should be at the current age
            'vec3 a = acceleration * age;',
            'vec3 v = velocity * age;',

            // Move velocity vector to correct values at this age
            'v = v + (a * age);',

            // Add velocity vector to the newPos vector
            'newPos = newPos + v;',

            // Convert the newPos vector into world-space
            'vec4 mvPosition = modelViewMatrix * vec4( newPos, 1.0 );',

            'return mvPosition;',
        '}',


        'void main() {',

            'float positionInTime = (age / duration);',
            'float halfDuration = (duration / 2.0);',

            'if( alive > 0.5 ) {',
                // Integrate color "tween"
                'vec3 color = vec3( customColor );',
                'if( customColor != customColorEnd ) {',
                    'color = Lerp( customColor, customColorEnd, positionInTime );',
                '}',

                // Store the color of this particle in the varying vColor,
                // so frag shader can access it.
                'if( opacity == opacityMiddle && opacityMiddle == opacityEnd ) {',
                    'vColor = vec4( color, opacity );',
                '}',

                'else if( positionInTime < 0.5 ) {',
                    'vColor = vec4( color, Lerp( opacity, opacityMiddle, age / halfDuration ) );',
                '}',

                'else if( positionInTime > 0.5 ) {',
                    'vColor = vec4( color, Lerp( opacityMiddle, opacityEnd, (age - halfDuration) / halfDuration ) );',
                '}',

                'else {',
                    'vColor = vec4( color, opacityMiddle );',
                '}',

                // Get the position of this particle so we can use it
                // when we calculate any perspective that might be required.
                'vec4 pos = GetPos();',

                // Determine point size .
                'float pointSize = Lerp( size, sizeEnd, positionInTime );',

                'if( hasPerspective == 1 ) {',
                    'pointSize = pointSize * ( 300.0 / length( pos.xyz ) );',
                '}',

                // Set particle size and position
                'gl_PointSize = pointSize;',
                'gl_Position = projectionMatrix * pos;',
            '}',

            'else {',
                // Hide particle and set its position to the (maybe) glsl
                // equivalent of Number.POSITIVE_INFINITY
                'vColor = vec4( customColor, 0.0 );',
                'gl_Position = vec4(1e20, 1e20, 1e20, 0);',
            '}',
        '}',
    ].join('\n'),

    fragment: [
        'uniform sampler2D texture;',
        'uniform int colorize;',

        'varying vec4 vColor;',

        'void main() {',
            'float c = cos(0.0);',
            'float s = sin(0.0);',

            'vec2 rotatedUV = vec2(c * (gl_PointCoord.x - 0.5) + s * (gl_PointCoord.y - 0.5) + 0.5,',
                                  'c * (gl_PointCoord.y - 0.5) - s * (gl_PointCoord.x - 0.5) + 0.5);',

            'vec4 rotatedTexture = texture2D( texture, rotatedUV );',

            'if( colorize == 1 ) {',
                'gl_FragColor = vColor * rotatedTexture;',
            '}',
            'else {',
                'gl_FragColor = rotatedTexture;',
            '}',
        '}'
    ].join('\n')
};
