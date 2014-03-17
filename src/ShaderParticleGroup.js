// ShaderParticleGroup 0.7.5
//
// (c) 2014 Luke Moody (http://www.github.com/squarefeet)
//     & Lee Stemkoski (http://www.adelphi.edu/~stemkoski/)
//
// Based on Lee Stemkoski's original work:
//    (https://github.com/stemkoski/stemkoski.github.com/blob/master/Three.js/js/ParticleEngine.js).
//
// ShaderParticleGroup may be freely distributed under the MIT license (See LICENSE.txt)

var SPE = SPE || {};

SPE.Group = function( options ) {
    var that = this;

    that.fixedTimeStep          = parseFloat( typeof options.fixedTimeStep === 'number' ? options.fixedTimeStep : 0.016 );

    // Uniform properties ( applied to all particles )
    that.maxAge                 = parseFloat( options.maxAge || 3 );
    that.texture                = options.texture || null;
    that.hasPerspective         = parseInt( typeof options.hasPerspective === 'number' ? options.hasPerspective : 1, 10 );
    that.colorize               = parseInt( typeof options.colorize === 'number' ? options.colorize : 1, 10 );

    // Material properties
    that.blending               = typeof options.blending === 'number' ? options.blending : THREE.AdditiveBlending;
    that.transparent            = typeof options.transparent === 'number' ? options.transparent : 1;
    that.alphaTest              = typeof options.alphaTest === 'number' ? options.alphaTest : 0.5;
    that.depthWrite             = options.depthWrite || false;
    that.depthTest              = options.depthTest || true;

    // Create uniforms
    that.uniforms = {
        duration:       { type: 'f',    value: that.maxAge },
        texture:        { type: 't',    value: that.texture },
        hasPerspective: { type: 'i',    value: that.hasPerspective },
        colorize:       { type: 'i',    value: that.colorize }
    };

    // Create a map of attributes that will hold values for each particle in this group.
    that.attributes = {
        acceleration:           { type: 'v3',   value: [] },
        velocity:               { type: 'v3',   value: [] },

        alive:                  { type: 'f',    value: [] },
        age:                    { type: 'f',    value: [] },

        size:                   { type: 'v3',   value: [] },
        angle:                  { type: 'v4',   value: [] },

        colorStart:             { type: 'c',    value: [] },
        colorMiddle:            { type: 'c',    value: [] },
        colorEnd:               { type: 'c',    value: [] },

        opacity:                { type: 'v3',   value: [] }
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
        vertexShader:   SPE.shaders.vertex,
        fragmentShader: SPE.shaders.fragment,
        blending:       that.blending,
        transparent:    that.transparent,
        alphaTest:      that.alphaTest,
        depthWrite:     that.depthWrite,
        depthTest:      that.depthTest
    });

    // And finally create the ParticleSystem. It's got its `dynamic` property
    // set so that THREE.js knows to update it on each frame.
    that.mesh = new THREE.ParticleSystem( that.geometry, that.material );
    that.mesh.dynamic = true;
};

SPE.Group.prototype = {

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
        that.attributes.angle.needsUpdate = true;
        // that.attributes.angleAlignVelocity.needsUpdate = true;
        that.attributes.velocity.needsUpdate = true;
        that.attributes.acceleration.needsUpdate = true;
        that.geometry.verticesNeedUpdate = true;

        return that;
    },

    /**
     * Add an emitter to this particle group. Once added, an emitter will be automatically
     * updated when SPE.Group#tick() is called.
     *
     * @param {SPE.Emitter} emitter
     * @return {this}
     */
    addEmitter: function( emitter ) {
        var that = this;

        if( emitter.duration ) {
            emitter.particlesPerSecond = emitter.particleCount / (that.maxAge < emitter.duration ? that.maxAge : emitter.duration) | 0;
        }
        else {
            emitter.particlesPerSecond = emitter.particleCount / that.maxAge | 0
        }

        var vertices            = that.geometry.vertices,
            start               = vertices.length,
            end                 = emitter.particleCount + start,
            a                   = that.attributes,
            acceleration        = a.acceleration.value,
            velocity            = a.velocity.value,
            alive               = a.alive.value,
            age                 = a.age.value,
            size                = a.size.value,
            angle               = a.angle.value,
            colorStart          = a.colorStart.value,
            colorMiddle         = a.colorMiddle.value,
            colorEnd            = a.colorEnd.value,
            opacity             = a.opacity.value;

        emitter.particleIndex = parseFloat( start );

        // Create the values
        for( var i = start; i < end; ++i ) {

            if( emitter.type === 'sphere' ) {
                vertices[i]         = that._randomVector3OnSphere( emitter.position, emitter.radius, emitter.radiusSpread, emitter.radiusScale, emitter.radiusSpreadClamp );
                velocity[i]         = that._randomVelocityVector3OnSphere( vertices[i], emitter.position, emitter.speed, emitter.speedSpread );
            }
            else if( emitter.type === 'disk' ) {
                vertices[i]         = that._randomVector3OnDisk( emitter.position, emitter.radius, emitter.radiusSpread, emitter.radiusScale, emitter.radiusSpreadClamp );
                velocity[i]         = that._randomVelocityVector3OnSphere( vertices[i], emitter.position, emitter.speed, emitter.speedSpread );
            }
            else {
                vertices[i]         = that._randomVector3( emitter.position, emitter.positionSpread );
                velocity[i]         = that._randomVector3( emitter.velocity, emitter.velocitySpread );
            }

            acceleration[i]         = that._randomVector3( emitter.acceleration, emitter.accelerationSpread );

            size[i]                 = new THREE.Vector3(
                Math.abs( that._randomFloat( emitter.sizeStart, emitter.sizeStartSpread ) ),
                Math.abs( that._randomFloat( emitter.sizeMiddle, emitter.sizeMiddleSpread ) ),
                Math.abs( that._randomFloat( emitter.sizeEnd, emitter.sizeEndSpread ) )
            );

            angle[i]                = new THREE.Vector4(
                that._randomFloat( emitter.angleStart, emitter.angleStartSpread ),
                that._randomFloat( emitter.angleMiddle, emitter.angleMiddleSpread ),
                that._randomFloat( emitter.angleEnd, emitter.angleEndSpread ),
                emitter.angleAlignVelocity ? 1.0 : 0.0
            );

            age[i]                  = 0.0;
            alive[i]                = emitter.isStatic ? 1.0 : 0.0;

            colorStart[i]           = that._randomColor( emitter.colorStart,    emitter.colorStartSpread );
            colorMiddle[i]          = that._randomColor( emitter.colorMiddle,   emitter.colorMiddleSpread );
            colorEnd[i]             = that._randomColor( emitter.colorEnd,      emitter.colorEndSpread );

            opacity[i]              = new THREE.Vector3(
                Math.abs( that._randomFloat( emitter.opacityStart, emitter.opacityStartSpread ) ),
                Math.abs( that._randomFloat( emitter.opacityMiddle, emitter.opacityMiddleSpread ) ),
                Math.abs( that._randomFloat( emitter.opacityEnd, emitter.opacityEndSpread ) )
            );
        }

        // Cache properties on the emitter so we can access
        // them from its tick function.
        emitter.verticesIndex   = parseFloat( start );
        emitter.attributes      = a;
        emitter.vertices        = that.geometry.vertices;
        emitter.maxAge          = that.maxAge;

        // Assign a unique ID to this emitter
        emitter.__id = that._generateID();

        // Save this emitter in an array for processing during this.tick()
        if( !emitter.isStatic ) {
            that.emitters.push( emitter );
        }

        return that;
    },


    removeEmitter: function( emitter ) {
        var id,
            emitters = this.emitters;

        if( emitter instanceof SPE.Emitter ) {
            id = emitter.__id;
        }
        else if( typeof emitter === 'string' ) {
            id = emitter;
        }
        else {
            console.warn('Invalid emitter or emitter ID passed to SPE.Group#removeEmitter.' );
            return;
        }

        for( var i = 0, il = emitters.length; i < il; ++i ) {
            if( emitters[i].__id === id ) {
                emitters.splice(i, 1);
                break;
            }
        }
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

        if( numEmitters === 0 ) {
            return;
        }

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
            return new SPE.Emitter( that._poolCreationSettings );
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
        if( !(emitter instanceof SPE.Emitter) ) {
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
            emitter;

        // Save relevant settings and flags.
        that._poolCreationSettings = emitterSettings;
        that._createNewWhenPoolEmpty = !!createNew;

        // Create the emitters, add them to this group and the pool.
        for( var i = 0; i < numEmitters; ++i ) {
            emitter = new SPE.Emitter( emitterSettings );
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
            console.log('SPE.Group pool ran out.');
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


// Extend ShaderParticleGroup's prototype with functions from utils object.
for( var i in SPE.utils ) {
    SPE.Group.prototype[ '_' + i ] = SPE.utils[i];
}


// The all-important shaders
SPE.shaders = {
    vertex: [
        'uniform float duration;',
        'uniform int hasPerspective;',

        'attribute vec3 colorStart;',
        'attribute vec3 colorMiddle;',
        'attribute vec3 colorEnd;',
        'attribute vec3 opacity;',

        'attribute vec3 acceleration;',
        'attribute vec3 velocity;',
        'attribute float alive;',
        'attribute float age;',

        'attribute vec3 size;',
        'attribute vec4 angle;',

        // values to be passed to the fragment shader
        'varying vec4 vColor;',
        'varying float vAngle;',


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

            'float lerpAmount1 = (age / (0.5 * duration));', // percentage during first half
            'float lerpAmount2 = ((age - 0.5 * duration) / (0.5 * duration));', // percentage during second half
            'float halfDuration = duration / 2.0;',
            'float pointSize = 0.0;',

            'vAngle = 0.0;',

            'if( alive > 0.5 ) {',

                // lerp the color and opacity
                'if( positionInTime < 0.5 ) {',
                    'vColor = vec4( mix(colorStart, colorMiddle, lerpAmount1), mix(opacity.x, opacity.y, lerpAmount1) );',
                '}',
                'else {',
                    'vColor = vec4( mix(colorMiddle, colorEnd, lerpAmount2), mix(opacity.y, opacity.z, lerpAmount2) );',
                '}',


                // Get the position of this particle so we can use it
                // when we calculate any perspective that might be required.
                'vec4 pos = GetPos();',


                // Determine the angle we should use for this particle.
                'if( angle[3] == 1.0 ) {',
                    'vAngle = -atan(pos.y, pos.x);',
                '}',
                'else if( positionInTime < 0.5 ) {',
                    'vAngle = mix( angle.x, angle.y, lerpAmount1 );',
                '}',
                'else {',
                    'vAngle = mix( angle.y, angle.z, lerpAmount2 );',
                '}',

                // Determine point size.
                'if( positionInTime < 0.5) {',
                    'pointSize = mix( size.x, size.y, lerpAmount1 );',
                '}',
                'else {',
                    'pointSize = mix( size.y, size.z, lerpAmount2 );',
                '}',


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
                'vColor = vec4( 0.0, 0.0, 0.0, 0.0 );',
                'gl_Position = vec4(1000000000.0, 1000000000.0, 1000000000.0, 0.0);',
            '}',
        '}',
    ].join('\n'),

    fragment: [
        'uniform sampler2D texture;',
        'uniform int colorize;',

        'varying vec4 vColor;',
        'varying float vAngle;',

        'void main() {',
            'float c = cos(vAngle);',
            'float s = sin(vAngle);',

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
