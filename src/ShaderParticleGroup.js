// ShaderParticleGroup 0.8.2
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

    that.fixedTimeStep = parseFloat( typeof options.fixedTimeStep === 'number' ? options.fixedTimeStep : 0.016 );

    // Uniform properties ( applied to all particles )
    that.maxAge = parseFloat( options.maxAge || 3 );
    that.texture = options.texture || null;
    that.hasPerspective = typeof options.hasPerspective === 'boolean' ? options.hasPerspective :
        typeof options.hasPerspective === 'number' ? !!options.hasPerspective : true;

    that.colorize = typeof options.colorize === 'boolean' ? options.colorize :
        typeof options.colorize === 'number' ? !!options.colorize : true;

    // Material properties
    that.blending = typeof options.blending === 'number' ? options.blending : THREE.AdditiveBlending;
    that.transparent = typeof options.transparent === 'boolean' ? options.transparent : true;
    that.alphaTest = typeof options.alphaTest === 'number' ? options.alphaTest : 0.5;
    that.depthWrite = typeof options.depthWrite === 'boolean' ? options.depthWrite : false;
    that.depthTest = typeof options.depthTest === 'boolean' ? options.depthTest : true;
    that.fog = typeof options.fog === 'boolean' ? options.fog : true;

    // Create uniforms
    that.uniforms = {
        duration: {
            type: 'f',
            value: that.maxAge
        },
        texture: {
            type: 't',
            value: that.texture
        },
        fogColor: {
            type: 'c',
            value: new THREE.Color()
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

    // Create a map of attributes that will hold values for each particle in this group.
    that.attributes = {
        acceleration: {
            type: 'v3',
            value: []
        },
        velocity: {
            type: 'v3',
            value: []
        },

        alive: {
            type: 'f',
            value: []
        },
        age: {
            type: 'f',
            value: []
        },

        size: {
            type: 'v3',
            value: []
        },
        angle: {
            type: 'v4',
            value: []
        },

        colorStart: {
            type: 'c',
            value: []
        },
        colorMiddle: {
            type: 'c',
            value: []
        },
        colorEnd: {
            type: 'c',
            value: []
        },

        opacity: {
            type: 'v3',
            value: []
        },

        pos: {
            type: 'v3',
            value: []
        }
    };

    that.defines = {
        HAS_PERSPECTIVE: that.hasPerspective,
        COLORIZE: that.colorize
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
    that.material = new THREE.ShaderMaterial( {
        uniforms: that.uniforms,
        attributes: that.attributes,
        vertexShader: SPE.shaders.vertex,
        fragmentShader: SPE.shaders.fragment,
        blending: that.blending,
        transparent: that.transparent,
        alphaTest: that.alphaTest,
        depthWrite: that.depthWrite,
        depthTest: that.depthTest,
        defines: that.defines,
        fog: that.fog
    } );

    // And finally create the ParticleSystem. It's got its `dynamic` property
    // set so that THREE.js knows to update it on each frame.
    that.mesh = new THREE.PointCloud( that.geometry, that.material );
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

        // Set flags to update
        that.attributes.age.needsUpdate = true;
        that.attributes.alive.needsUpdate = true;
        that.attributes.pos.needsUpdate = true;
        // that.geometry.verticesNeedUpdate = true;

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

        if ( emitter.duration ) {
            emitter.particlesPerSecond = emitter.particleCount / ( that.maxAge < emitter.duration ? that.maxAge : emitter.duration ) | 0;
        }
        else {
            emitter.particlesPerSecond = emitter.particleCount / that.maxAge | 0
        }

        var vertices = that.geometry.vertices,
            start = vertices.length,
            end = emitter.particleCount + start,
            a = that.attributes,
            acceleration = a.acceleration.value,
            velocity = a.velocity.value,
            alive = a.alive.value,
            age = a.age.value,
            size = a.size.value,
            angle = a.angle.value,
            colorStart = a.colorStart.value,
            colorMiddle = a.colorMiddle.value,
            colorEnd = a.colorEnd.value,
            opacity = a.opacity.value,
            pos = a.pos.value;

        emitter.particleIndex = parseFloat( start );

        // Create the values
        for ( var i = start; i < end; ++i ) {

            if ( emitter.type === 'sphere' ) {
                pos[ i ] = that.randomVector3OnSphere( emitter._position, emitter._radius, emitter._radiusSpread, emitter._radiusScale, emitter._radiusSpreadClamp );
                vertices[ i ] = pos[ i ];
                velocity[ i ] = that.randomVelocityVector3OnSphere( pos[ i ], emitter._position, emitter._speed, emitter._speedSpread );
            }
            else if ( emitter.type === 'disk' ) {
                pos[ i ] = that.randomVector3OnDisk( emitter._position, emitter._radius, emitter._radiusSpread, emitter._radiusScale, emitter._radiusSpreadClamp );
                vertices[ i ] = pos[ i ];
                velocity[ i ] = that.randomVelocityVector3OnSphere( pos[ i ], emitter._position, emitter._speed, emitter._speedSpread );
            }
            else {
                pos[ i ] = that.randomVector3( emitter._position, emitter._positionSpread );
                vertices[ i ] = pos[ i ];
                velocity[ i ] = that.randomVector3( emitter._velocity, emitter._velocitySpread );
            }

            acceleration[ i ] = that.randomVector3( emitter._acceleration, emitter._accelerationSpread );

            size[ i ] = new THREE.Vector3(
                Math.abs( that.randomFloat( emitter._sizeStart, emitter._sizeStartSpread ) ),
                Math.abs( that.randomFloat( emitter._sizeMiddle, emitter._sizeMiddleSpread ) ),
                Math.abs( that.randomFloat( emitter._sizeEnd, emitter._sizeEndSpread ) )
            );

            angle[ i ] = new THREE.Vector4(
                that.randomFloat( emitter._angleStart, emitter._angleStartSpread ),
                that.randomFloat( emitter._angleMiddle, emitter._angleMiddleSpread ),
                that.randomFloat( emitter._angleEnd, emitter._angleEndSpread ),
                emitter.angleAlignVelocity ? 1.0 : 0.0
            );

            age[ i ] = 0.0;
            alive[ i ] = emitter.isStatic ? 1.0 : 0.0;

            colorStart[ i ] = that.randomColor( emitter._colorStart, emitter._colorStartSpread );
            colorMiddle[ i ] = that.randomColor( emitter._colorMiddle, emitter._colorMiddleSpread );
            colorEnd[ i ] = that.randomColor( emitter._colorEnd, emitter._colorEndSpread );

            opacity[ i ] = new THREE.Vector3(
                Math.abs( that.randomFloat( emitter._opacityStart, emitter._opacityStartSpread ) ),
                Math.abs( that.randomFloat( emitter._opacityMiddle, emitter._opacityMiddleSpread ) ),
                Math.abs( that.randomFloat( emitter._opacityEnd, emitter._opacityEndSpread ) )
            );
        }

        // Cache properties on the emitter so we can access
        // them from its tick function.
        emitter.verticesIndex = parseFloat( start );
        emitter.attributes = a;
        emitter.vertices = that.geometry.vertices;
        emitter.geometry = that.geometry;
        emitter.maxAge = that.maxAge;

        // Assign a unique ID to this emitter
        emitter.__id = that.generateID();

        // Save this emitter in an array for processing during this.tick()
        if ( !emitter.isStatic ) {
            that.emitters.push( emitter );
        }

        return that;
    },


    removeEmitter: function( emitter ) {
        var id,
            emitters = this.emitters;

        if ( emitter instanceof SPE.Emitter ) {
            id = emitter.__id;
        }
        else if ( typeof emitter === 'string' ) {
            id = emitter;
        }
        else {
            console.warn( 'Invalid emitter or emitter ID passed to SPE.Group#removeEmitter.' );
            return;
        }

        for ( var i = 0, il = emitters.length; i < il; ++i ) {
            if ( emitters[ i ].__id === id ) {
                emitters.splice( i, 1 );
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

        if ( numEmitters === 0 ) {
            return;
        }

        for ( var i = 0; i < numEmitters; ++i ) {
            emitters[ i ].tick( dt );
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

        if ( pool.length ) {
            return pool.pop();
        }
        else if ( createNew ) {
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
        if ( !( emitter instanceof SPE.Emitter ) ) {
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
        for ( var i = 0; i < numEmitters; ++i ) {
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

        if ( emitter === null ) {
            console.log( 'SPE.Group pool ran out.' );
            return;
        }

        if ( pos instanceof THREE.Vector3 ) {
            emitter._position.copy( pos );
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

        if ( typeof numEmitters === 'number' && numEmitters > 1 ) {
            for ( var i = 0; i < numEmitters; ++i ) {
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
for ( var i in SPE.utils ) {
    SPE.Group.prototype[ i ] = SPE.utils[ i ];
}


// The all-important shaders
SPE.shaders = {
    vertex: [
        'uniform float duration;',
        'uniform float scale;',

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

        'attribute vec3 pos;',

        // values to be passed to the fragment shader
        'varying vec4 vColor;',
        'varying float vAngle;',


        THREE.ShaderChunk[ "common" ],
        THREE.ShaderChunk[ "logdepthbuf_pars_vertex" ],


        // Integrate acceleration into velocity and apply it to the particle's position
        'vec4 GetPos() {',
        '   vec3 newPos = vec3( pos );',

        // Move acceleration & velocity vectors to the value they
        // should be at the current age
        '   vec3 a = acceleration * age;',
        '   vec3 v = velocity * age;',

        // Move velocity vector to correct values at this age
        '   v = v + (a * age);',

        // Add velocity vector to the newPos vector
        '   newPos = newPos + v;',

        // Convert the newPos vector into world-space
        '   vec4 mvPosition = modelViewMatrix * vec4( newPos, 1.0 );',

        '   return mvPosition;',
        '}',


        'void main() {',

        '   float positionInTime = (age / duration);',
        '   float halfDuration = 0.5 * duration;',
        '   float lerpAmount = 0.0;',
        '   float pointSize = 0.0;',
        '   float deadPos = 1000000000.0;',

        '   vAngle = 0.0;',

        '   if( alive == 1.0 ) {',

        // Get the position of this particle so we can use it
        // when we calculate any perspective that might be required.
        '       vec4 currentPos = GetPos();',

        // Lerp the color and opacity, and determine point size and angle.
        '       if( positionInTime < 0.5 ) {',
        '           lerpAmount = age / halfDuration;',
        '           vColor = vec4( mix( colorStart, colorMiddle, lerpAmount ), mix( opacity.x, opacity.y, lerpAmount ) );',
        '           pointSize = mix( size.x, size.y, lerpAmount );',
        '           vAngle = mix( angle.x, angle.y, lerpAmount );',
        '       }',
        '       else {',
        '           lerpAmount = ( age - halfDuration ) / halfDuration;',
        '           vColor = vec4( mix( colorMiddle, colorEnd, lerpAmount ), mix( opacity.y, opacity.z, lerpAmount ) );',
        '           pointSize = mix( size.y, size.z, lerpAmount );',
        '           vAngle = mix( angle.y, angle.z, lerpAmount );',
        '       }',

        '       if( angle.w == 1.0 ) {',
        '           vAngle = -atan( currentPos.y, currentPos.x );',
        '       }',

        '       #ifdef HAS_PERSPECTIVE',
        '           pointSize = pointSize * ( 300.0 / length( currentPos.xyz ) );',
        '       #endif',

        // Set particle size and position
        '       gl_PointSize = pointSize;',
        '       gl_Position = projectionMatrix * currentPos;',
        '   }',

        '   else {',
        // Hide particle and set its position to the (maybe) glsl
        // equivalent of Number.POSITIVE_INFINITY
        '       vColor = vec4( 0.0 );',
        '       gl_Position = vec4( deadPos, deadPos, deadPos, 0.0 );',
        '   }',

        THREE.ShaderChunk[ "logdepthbuf_vertex" ],

        '}',
    ].join( '\n' ),

    fragment: [
        'uniform sampler2D texture;',

        THREE.ShaderChunk[ "common" ],
        THREE.ShaderChunk[ "fog_pars_fragment" ],
        THREE.ShaderChunk[ "logdepthbuf_pars_fragment" ],

        'varying vec4 vColor;',
        'varying float vAngle;',

        'void main() {',
        '   vec3 outgoingLight = vColor.xyz;',

        '   float c = cos( vAngle );',
        '   float s = sin( vAngle );',
        '   float x = gl_PointCoord.x - 0.5;',
        '   float y = gl_PointCoord.y - 0.5;',

        '   vec2 rotatedUV = vec2( c * x + s * y + 0.5, c * y - s * x + 0.5 );',

        '   vec4 rotatedTexture = texture2D( texture, rotatedUV );',

        THREE.ShaderChunk[ "logdepthbuf_fragment" ],

        '   #ifdef COLORIZE',
        '      outgoingLight = vColor.xyz * rotatedTexture.xyz;',
        '   #else',
        '      outgoingLight = vec3( rotatedTexture.xyz );',
        '   #endif',

        THREE.ShaderChunk[ "fog_fragment" ],

        '   gl_FragColor = vec4( outgoingLight.xyz, rotatedTexture.w * vColor.w );',
        '}'
    ].join( '\n' )
};