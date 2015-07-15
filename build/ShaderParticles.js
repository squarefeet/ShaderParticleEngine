// ShaderParticleUtils 0.8.2
//
// (c) 2014 Luke Moody (http://www.github.com/squarefeet)
//     & Lee Stemkoski (http://www.adelphi.edu/~stemkoski/)
//
// Based on Lee Stemkoski's original work:
//    (https://github.com/stemkoski/stemkoski.github.com/blob/master/Three.js/js/ParticleEngine.js).
//
// ShaderParticleGroup may be freely distributed under the MIT license (See LICENSE.txt)

var SPE = SPE || {};

SPE.utils = {

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
    randomVector3: function( base, spread ) {
        var v = new THREE.Vector3();

        this.randomizeExistingVector3( v, base, spread );

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
    randomColor: function( base, spread ) {
        var v = new THREE.Color();

        this.randomizeExistingColor( v, base, spread );

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
    randomFloat: function( base, spread ) {
        return base + spread * ( Math.random() - 0.5 );
    },

    /**
     * Create a new THREE.Vector3 instance and project it onto a random point
     * on a sphere with randomized radius.
     *
     * @param  {THREE.Vector3} base
     * @param  {Number} radius
     * @param  {THREE.Vector3} radiusSpread
     * @param  {THREE.Vector3} radiusScale
     *
     * @private
     *
     * @return {THREE.Vector3}
     */
    randomVector3OnSphere: function( base, radius, radiusSpread, radiusScale, radiusSpreadClamp ) {
        var v = new THREE.Vector3();

        this.randomizeExistingVector3OnSphere( v, base, radius, radiusSpread, radiusScale, radiusSpreadClamp );

        return v;
    },

    /**
     * Create a new THREE.Vector3 instance and project it onto a random point
     * on a disk (in the XY-plane) centered at `base` and with randomized radius.
     *
     * @param  {THREE.Vector3} base
     * @param  {Number} radius
     * @param  {THREE.Vector3} radiusSpread
     * @param  {THREE.Vector3} radiusScale
     *
     * @private
     *
     * @return {THREE.Vector3}
     */
    randomVector3OnDisk: function( base, radius, radiusSpread, radiusScale, radiusSpreadClamp ) {
        var v = new THREE.Vector3();

        this.randomizeExistingVector3OnDisk( v, base, radius, radiusSpread, radiusScale, radiusSpreadClamp );

        return v;
    },


    /**
     * Create a new THREE.Vector3 instance, and given a sphere with center `base` and
     * point `position` on sphere, set direction away from sphere center with random magnitude.
     *
     * @param  {THREE.Vector3} base
     * @param  {THREE.Vector3} position
     * @param  {Number} speed
     * @param  {Number} speedSpread
     * @param  {THREE.Vector3} scale
     *
     * @private
     *
     * @return {THREE.Vector3}
     */
    randomVelocityVector3OnSphere: function( base, position, speed, speedSpread, scale ) {
        var direction = new THREE.Vector3();

        this.randomizeExistingVelocityVector3OnSphere( direction, base, position, speed, speedSpread );

        if ( scale ) {
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
    randomizeExistingVector3: function( v, base, spread ) {
        v.copy( base );

        v.x += Math.random() * spread.x - ( spread.x / 2 );
        v.y += Math.random() * spread.y - ( spread.y / 2 );
        v.z += Math.random() * spread.z - ( spread.z / 2 );
    },


    /**
     * Randomize a THREE.Color instance and given a base vector and
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
    randomizeExistingColor: function( v, base, spread ) {
        v.copy( base );

        v.r += ( Math.random() * spread.x ) - ( spread.x / 2 );
        v.g += ( Math.random() * spread.y ) - ( spread.y / 2 );
        v.b += ( Math.random() * spread.z ) - ( spread.z / 2 );

        v.r = Math.max( 0, Math.min( v.r, 1 ) );
        v.g = Math.max( 0, Math.min( v.g, 1 ) );
        v.b = Math.max( 0, Math.min( v.b, 1 ) );
    },

    /**
     * Given an existing particle vector, project it onto a random point on a
     * sphere with radius `radius` and position `base`.
     *
     * @private
     *
     * @param  {THREE.Vector3} v
     * @param  {THREE.Vector3} base
     * @param  {Number} radius
     */
    randomizeExistingVector3OnSphere: function( v, base, radius, radiusSpread, radiusScale, radiusSpreadClamp ) {
        var z = 2 * Math.random() - 1,
            t = 6.2832 * Math.random(),
            r = Math.sqrt( 1 - z * z ),
            rand = this.randomFloat( radius, radiusSpread );

        if ( radiusSpreadClamp ) {
            rand = Math.round( rand / radiusSpreadClamp ) * radiusSpreadClamp;
        }

        v.set(
            ( r * Math.cos( t ) ) * rand, ( r * Math.sin( t ) ) * rand,
            z * rand
        ).multiply( radiusScale );

        v.add( base );
    },


    /**
     * Given an existing particle vector, project it onto a random point
     * on a disk (in the XY-plane) centered at `base` and with radius `radius`.
     *
     * @private
     *
     * @param  {THREE.Vector3} v
     * @param  {THREE.Vector3} base
     * @param  {Number} radius
     */
    randomizeExistingVector3OnDisk: function( v, base, radius, radiusSpread, radiusScale, radiusSpreadClamp ) {
        var t = 6.2832 * Math.random(),
            rand = Math.abs( this.randomFloat( radius, radiusSpread ) );

        if ( radiusSpreadClamp ) {
            rand = Math.round( rand / radiusSpreadClamp ) * radiusSpreadClamp;
        }

        v.set(
            Math.cos( t ),
            Math.sin( t ),
            0
        ).multiplyScalar( rand );

        if ( radiusScale ) {
            v.multiply( radiusScale );
        }

        v.add( base );
    },

    randomizeExistingVelocityVector3OnSphere: function( v, base, position, speed, speedSpread ) {
        v.copy( position )
            .sub( base )
            .normalize()
            .multiplyScalar( Math.abs( this.randomFloat( speed, speedSpread ) ) );
    },

    generateID: function() {
        var str = 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx';

        str = str.replace( /[xy]/g, function( c ) {
            var rand = Math.random();
            var r = rand * 16 | 0 % 16,
                v = c === 'x' ? r : ( r & 0x3 | 0x8 );

            return v.toString( 16 );
        } );

        return str;
    }
};;

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
};;

// ShaderParticleEmitter 0.8.2
//
// (c) 2014 Luke Moody (http://www.github.com/squarefeet)
//     & Lee Stemkoski (http://www.adelphi.edu/~stemkoski/)
//
// Based on Lee Stemkoski's original work:
//    (https://github.com/stemkoski/stemkoski.github.com/blob/master/Three.js/js/ParticleEngine.js).
//
// ShaderParticleEmitter may be freely distributed under the MIT license (See LICENSE.txt)

var SPE = SPE || {};

SPE.Emitter = function( options ) {
    // If no options are provided, fallback to an empty object.
    options = options || {};

    // Helps with minification. Not as easy to read the following code,
    // but should still be readable enough!
    var that = this;

    // Any changes to emitter properties will be flagged here,
    // so the next time a particle is reset, updates will be
    // applied.
    that._updateFlags = {};
    that._updateCounts = {};

    that._particleCount = 100;
    that._type = 'cube';

    that._position = new THREE.Vector3();
    that._positionSpread = new THREE.Vector3();

    that._radius = 10.0;
    that._radiusSpread = 0.0;
    that._radiusScale = new THREE.Vector3( 1, 1, 1 );
    that._radiusSpreadClamp = 0.0;

    that._acceleration = new THREE.Vector3();
    that._accelerationSpread = new THREE.Vector3();

    that._velocity = new THREE.Vector3();
    that._velocitySpread = new THREE.Vector3();

    that._speed = 0.0;
    that._speedSpread = 0.0;

    that._sizeStart = 1.0;
    that._sizeStartSpread = 0.0;
    that._sizeEnd = 1.0;
    that._sizeEndSpread = 0.0;

    that._sizeMiddle = Math.abs( that._sizeEnd + that._sizeStart ) / 2;
    that._sizeMiddleSpread = 0.0;

    that._angleStart = 0.0;
    that._angleStartSpread = 0.0;
    that._angleMiddle = 0.0;
    that._angleMiddleSpread = 0.0;
    that._angleEnd = 0.0;
    that._angleEndSpread = 0.0;
    that._angleAlignVelocity = false;

    that._colorStart = new THREE.Color( 'white' );
    that._colorStartSpread = new THREE.Vector3();
    that._colorEnd = that._colorStart.clone();
    that._colorEndSpread = new THREE.Vector3();
    that._colorMiddle = new THREE.Color().addColors( that._colorStart, that._colorEnd ).multiplyScalar( 0.5 );
    that._colorMiddleSpread = new THREE.Vector3();



    // Opacities
    that._opacityStart = 1.0;
    that._opacityStartSpread = 0.0;
    that._opacityEnd = 0.0;
    that._opacityEndSpread = 0.0;
    that._opacityMiddle = Math.abs( that._opacityEnd + that._opacityStart ) / 2;
    that._opacityMiddleSpread = 0.0;


    var optionKeys = Object.keys( options ),
        hasSizeMiddle = !!~optionKeys.indexOf( 'sizeMiddle' ),
        hasAngleMiddle = !!~optionKeys.indexOf( 'angleMiddle' ),
        hasColorMiddle = !!~optionKeys.indexOf( 'colorMiddle' ),
        hasOpacityMiddle = !!~optionKeys.indexOf( 'opacityMiddle' );

    // Copy over the provided options (if any).
    for ( var i in options ) {
        if ( that.hasOwnProperty( '_' + i ) ) {
            that[ i ] = options[ i ];
        }
    }

    // If no middle states for various properties have been provided, then
    // interpolate them.
    if ( !hasSizeMiddle ) {
        that.sizeMiddle = Math.abs( that._sizeEnd + that._sizeStart ) / 2;
    }

    if ( !hasAngleMiddle ) {
        that.angleMiddle = Math.abs( that._angleEnd + that._angleStart ) / 2;
    }

    if ( !hasColorMiddle ) {
        that.colorMiddle = Math.abs( that._colorEnd + that._colorStart ) / 2;
    }

    if ( !hasOpacityMiddle ) {
        that.opacityMiddle = Math.abs( that._opacityEnd + that._opacityStart ) / 2;
    }

    // Generic
    that.duration = typeof options.duration === 'number' ? options.duration : null;
    that.alive = parseFloat( typeof options.alive === 'number' ? options.alive : 1.0 );
    that.isStatic = typeof options.isStatic === 'number' ? !!options.isStatic : typeof options.isStatic === 'boolean' ? options.isStatic : false;

    // Particle spawn callback function.
    that.onParticleSpawn = typeof options.onParticleSpawn === 'function' ? options.onParticleSpawn : null;


    // The following properties are used internally, and mostly set when this emitter
    // is added to a particle group.
    that.particlesPerSecond = 0;
    that.attributes = null;
    that.vertices = null;
    that.verticesIndex = 0;
    that.age = 0.0;
    that.maxAge = 0.0;

    that.particleIndex = 0.0;
    that.hasRendered = false;
    that.attributesNeedUpdate = false;

    that.__id = null;

    that.userData = {};
};

SPE.Emitter.prototype = {

    /**
     * Reset a particle's position. Accounts for emitter type and spreads.
     *
     * @private
     *
     * @param  {THREE.Vector3} p
     */
    _resetParticle: function( i ) {
        var that = this,
            type = that._type,
            spread = that.positionSpread,
            a = that.attributes,
            particlePosition = a.pos.value[ i ],
            particleVelocity = a.velocity.value[ i ],
            particleAcceleration = a.acceleration.value[ i ],
            vSpread = that.velocitySpread,
            aSpread = that.accelerationSpread;

        // Optimise for no position spread or radius
        if (
            ( type === 'cube' && spread.x === 0 && spread.y === 0 && spread.z === 0 ) ||
            ( type === 'sphere' && that.radius === 0 ) ||
            ( type === 'disk' && that.radius === 0 )
        ) {
            particlePosition.copy( that._position );
            that.randomizeExistingVector3( particleVelocity, that._velocity, vSpread );
            a.velocity.needsUpdate = true;

            if ( type === 'cube' ) {
                that.randomizeExistingVector3( particleAcceleration, that.acceleration, aSpread );
                a.acceleration.needsUpdate = true;
            }
        }

        // If there is a position spread, then get a new position based on this spread.
        else if ( type === 'cube' ) {
            that.randomizeExistingVector3( particlePosition, that._position, spread );
            that.randomizeExistingVector3( particleVelocity, that._velocity, vSpread );
            that.randomizeExistingVector3( particleAcceleration, that.acceleration, aSpread );
            a.velocity.needsUpdate = true;
            a.acceleration.needsUpdate = true;
        }

        else if ( type === 'sphere' ) {
            that.randomizeExistingVector3OnSphere( particlePosition, that._position, that._radius, that._radiusSpread, that._radiusScale, that._radiusSpreadClamp );
            that.randomizeExistingVelocityVector3OnSphere( particleVelocity, that._position, particlePosition, that._speed, that._speedSpread );
            that.randomizeExistingVector3( particleAcceleration, that.acceleration, aSpread );
            a.velocity.needsUpdate = true;
            a.acceleration.needsUpdate = true;
        }

        else if ( type === 'disk' ) {
            that.randomizeExistingVector3OnDisk( particlePosition, that._position, that._radius, that._radiusSpread, that._radiusScale, that._radiusSpreadClamp );
            that.randomizeExistingVelocityVector3OnSphere( particleVelocity, that.position, particlePosition, that._speed, that._speedSpread );
            that.randomizeExistingVector3( particleAcceleration, that.acceleration, aSpread );
            a.velocity.needsUpdate = true;
            a.acceleration.needsUpdate = true;
        }


        that._updateParticlesFromFlags( i );


        if ( typeof that.onParticleSpawn === 'function' ) {
            that.onParticleSpawn( a, i );
        }
    },

    /**
     * When a parameter of this emitter is changed, a flag will be set
     * indicating this. This function takes care of updating the
     * required attributes.
     *
     * It could probably be done a little better than this, but it'll
     * do for now...
     *
     * TODO:
     *     - Refactor this into something more succinct.
     *
     * @private
     *
     * @param  {Number} i Particle index
     */
    _updateParticlesFromFlags: function( particleIndex ) {
        if ( !this.hasRendered ) return;

        var that = this,
            flags = that._updateFlags,
            counts = that._updateCounts,
            numParticles = that._particleCount,
            attributes = that.attributes,
            needsUpdate = that.attributesNeedUpdate,
            vertices = that.vertices,
            start = that.verticesIndex,
            end = start + numParticles,
            pos = attributes.pos.value,
            type = that.type;


        // Base attributes...
        if ( flags.position === true && needsUpdate === true ) {
            // No spreads...
            if (
                ( type === 'cube' && that._positionSpread.x === 0 && that._positionSpread.y === 0 && that._positionSpread.z === 0 ) ||
                ( type === 'sphere' && that._radius === 0 ) ||
                ( type === 'disk' && that._radius === 0 )
            ) {
                for ( var i = start, p = that.position; i < end; ++i ) {
                    pos[ i ].copy( p );
                    vertices[ i ].copy( p );
                }
            }

            // Cube, and spread is !0
            else if ( type === 'cube' ) {
                for ( var i = start, p = that._position; i < end; ++i ) {
                    that.randomizeExistingVector3( pos[ i ], p, that._positionSpread );
                    vertices[ i ].copy( p );
                }
            }
            else if ( type === 'sphere' ) {
                for ( var i = start, p = that._position; i < end; ++i ) {
                    that.randomizeExistingVector3OnSphere( pos[ i ], that._position, that._radius, that._radiusSpread, that._radiusScale, that._radiusSpreadClamp );
                    vertices[ i ].copy( p );
                }
            }

            else if ( type === 'disk' ) {
                for ( var i = start, p = that._position; i < end; ++i ) {
                    that.randomizeExistingVector3OnDisk( pos[ i ], that._position, that._radius, that._radiusSpread, that._radiusScale, that._radiusSpreadClamp );
                    vertices[ i ].copy( p );
                }
            }

            that.geometry.verticesNeedUpdate = true;

            flags.position = false;
        }


        if ( flags.velocity === true && needsUpdate === true ) {
            // Cube, and spread is !0
            if ( type === 'cube' ) {
                for ( var i = start; i < end; ++i ) {
                    that.randomizeExistingVector3( attributes.velocity.value[ i ], that._velocity, that._velocitySpread );
                }
            }
            else if ( type === 'sphere' || type === 'disk' ) {
                for ( var i = start, p = that.position; i < end; ++i ) {
                    that.randomizeExistingVelocityVector3OnSphere( attributes.velocity.value[ i ], p, pos[ i ], that._speed, that._speedSpread );
                }
            }

            attributes.velocity.needsUpdate = true;
            flags.velocity = false;
        }


        if ( flags.acceleration === true && needsUpdate === true && type === 'cube' ) {
            for ( var i = start, a = attributes.acceleration.value; i < end; ++i ) {
                that.randomizeExistingVector3( a[ i ], that._acceleration, that._accelerationSpread );
            }
            attributes.acceleration.needsUpdate = true;
            flags.acceleration = false;
        }


        // Sizes...
        if ( flags.sizeStart === true ) {
            if ( needsUpdate === true ) {
                for ( var i = start, v = attributes.size.value; i < end; ++i ) {
                    v[ i ].x = Math.abs( that.randomFloat( that._sizeStart, that._sizeStartSpread ) );
                }
            }
            else {
                attributes.size.value[ particleIndex ].x = Math.abs( that.randomFloat( that._sizeStart, that._sizeStartSpread ) );
            }

            attributes.size.needsUpdate = true;

            if ( ++counts.sizeStart === numParticles ) {
                counts.sizeStart = 0;
                flags.sizeStart = false;
            }
        }

        if ( flags.sizeMiddle === true ) {
            if ( needsUpdate === true ) {
                for ( var i = start, v = attributes.size.value; i < end; ++i ) {
                    v[ i ].y = Math.abs( that.randomFloat( that._sizeMiddle, that._sizeMiddleSpread ) );
                }
            }
            else {
                attributes.size.value[ particleIndex ].y = Math.abs( that.randomFloat( that._sizeMiddle, that._sizeMiddleSpread ) );
            }

            attributes.size.needsUpdate = true;

            if ( ++counts.sizeMiddle === numParticles ) {
                counts.sizeMiddle = 0;
                flags.sizeMiddle = false;
            }
        }

        if ( flags.sizeEnd === true ) {
            if ( needsUpdate === true ) {
                for ( var i = start, v = attributes.size.value; i < end; ++i ) {
                    v[ i ].z = Math.abs( that.randomFloat( that._sizeEnd, that._sizeEndSpread ) );
                }
            }
            else {
                attributes.size.value[ particleIndex ].z = Math.abs( that.randomFloat( that._sizeEnd, that._sizeEndSpread ) );
            }

            attributes.size.needsUpdate = true;

            if ( ++counts.sizeEnd === numParticles ) {
                counts.sizeEnd = 0;
                flags.sizeEnd = false;
            }
        }


        // Colors...
        if ( flags.colorStart === true ) {
            if ( needsUpdate === true ) {
                for ( var i = start, v = attributes.colorStart.value; i < end; ++i ) {
                    that.randomizeExistingColor( v[ i ], that._colorStart, that._colorStartSpread );
                }
            }
            else {
                that.randomizeExistingColor(
                    attributes.colorStart.value[ particleIndex ], that._colorStart, that._colorStartSpread
                );
            }

            attributes.colorStart.needsUpdate = true;

            if ( ++counts.colorStart === numParticles ) {
                counts.colorStart = 0;
                flags.colorStart = false;
            }
        }

        if ( flags.colorMiddle === true ) {
            if ( needsUpdate === true ) {
                for ( var i = start, v = attributes.colorMiddle.value; i < end; ++i ) {
                    that.randomizeExistingColor( v[ i ], that._colorMiddle, that._colorMiddleSpread );
                }
            }
            else {
                that.randomizeExistingColor(
                    attributes.colorMiddle.value[ particleIndex ], that._colorMiddle, that._colorMiddleSpread
                );
            }

            attributes.colorMiddle.needsUpdate = true;

            if ( ++counts.colorMiddle === numParticles ) {
                counts.colorMiddle = 0;
                flags.colorMiddle = false;
            }
        }

        if ( flags.colorEnd === true ) {
            if ( needsUpdate === true ) {
                for ( var i = start, v = attributes.colorEnd.value; i < end; ++i ) {
                    that.randomizeExistingColor( v[ i ], that._colorEnd, that._colorEndSpread );
                }
            }
            else {
                that.randomizeExistingColor(
                    attributes.colorEnd.value[ particleIndex ], that._colorEnd, that._colorEndSpread
                );
            }

            attributes.colorEnd.needsUpdate = true;

            if ( ++counts.colorEnd === numParticles ) {
                counts.colorEnd = 0;
                flags.colorEnd = false;
            }
        }


        // Opacities...
        if ( flags.opacityStart === true ) {
            if ( needsUpdate === true ) {
                for ( var i = start, v = attributes.opacity.value; i < end; ++i ) {
                    v[ i ].x = Math.abs( that.randomFloat( that._opacityStart, that._opacityStartSpread ) );
                }
            }
            else {
                attributes.opacity.value[ particleIndex ].x = Math.abs( that.randomFloat( that._opacityStart, that._opacityStartSpread ) );
            }

            attributes.opacity.needsUpdate = true;

            if ( ++counts.opacityStart === numParticles ) {
                counts.opacityStart = 0;
                flags.opacityStart = false;
            }
        }

        if ( flags.opacityMiddle === true ) {
            if ( needsUpdate === true ) {
                for ( var i = start, v = attributes.opacity.value; i < end; ++i ) {
                    v[ i ].y = Math.abs( that.randomFloat( that._opacityMiddle, that._opacityMiddleSpread ) );
                }
            }
            else {
                attributes.opacity.value[ particleIndex ].y = Math.abs( that.randomFloat( that._opacityMiddle, that._opacityMiddleSpread ) );
            }

            attributes.opacity.needsUpdate = true;

            if ( ++counts.opacityMiddle === numParticles ) {
                counts.opacityMiddle = 0;
                flags.opacityMiddle = false;
            }
        }

        if ( flags.opacityEnd === true ) {
            if ( needsUpdate === true ) {
                for ( var i = start, v = attributes.opacity.value; i < end; ++i ) {
                    v[ i ].z = Math.abs( that.randomFloat( that._opacityEnd, that._opacityEndSpread ) );
                }
            }
            else {
                attributes.opacity.value[ particleIndex ].z = Math.abs( that.randomFloat( that._opacityEnd, that._opacityEndSpread ) );
            }

            attributes.opacity.needsUpdate = true;

            if ( ++counts.opacityEnd === numParticles ) {
                counts.opacityEnd = 0;
                flags.opacityEnd = false;
            }
        }


        if ( flags.angleStart === true ) {
            if ( needsUpdate === true ) {
                for ( var i = start, v = attributes.angle.value; i < end; ++i ) {
                    v[ i ].x = Math.abs( that.randomFloat( that._angleStart, that._angleStartSpread ) );
                }
            }
            else {
                attributes.angle.value[ particleIndex ].x = Math.abs( that.randomFloat( that._angleStart, that._angleStartSpread ) );
            }

            attributes.angle.needsUpdate = true;

            if ( ++counts.angleStart === numParticles ) {
                counts.angleStart = 0;
                flags.angleStart = false;
            }
        }

        if ( flags.angleMiddle === true ) {
            if ( needsUpdate === true ) {
                for ( var i = start, v = attributes.angle.value; i < end; ++i ) {
                    v[ i ].y = Math.abs( that.randomFloat( that._angleMiddle, that._angleMiddleSpread ) );
                }
            }
            else {
                attributes.angle.value[ particleIndex ].y = Math.abs( that.randomFloat( that._angleMiddle, that._angleMiddleSpread ) );
            }


            attributes.angle.needsUpdate = true;

            if ( ++counts.angleMiddle === numParticles ) {
                counts.angleMiddle = 0;
                flags.angleMiddle = false;
            }
        }

        if ( flags.angleEnd === true ) {
            if ( needsUpdate === true ) {
                for ( var i = start, v = attributes.angle.value; i < end; ++i ) {
                    v[ i ].z = Math.abs( that.randomFloat( that._angleEnd, that._angleEndSpread ) );
                }
            }
            else {
                attributes.angle.value[ particleIndex ].z = Math.abs( that.randomFloat( that._angleEnd, that._angleEndSpread ) );
            }


            attributes.angle.needsUpdate = true;

            if ( ++counts.angleEnd === numParticles ) {
                counts.angleEnd = 0;
                flags.angleEnd = false;
            }
        }

        that.attributesNeedUpdate = false;
    },

    /**
     * Update this emitter's particle's positions. Called by the SPE.Group
     * that this emitter belongs to.
     *
     * @param  {Number} dt
     */
    tick: function( dt ) {
        this.hasRendered = true;

        if ( this.isStatic === true ) {
            return;
        }

        // Cache some values for quicker access in loops.
        var that = this,
            a = that.attributes,
            alive = a.alive.value,
            age = a.age.value,
            start = that.verticesIndex,
            particleCount = that._particleCount,
            end = start + particleCount,
            pps = that.particlesPerSecond * that.alive,
            ppsdt = pps * dt,
            m = that.maxAge,
            emitterAge = that.age,
            duration = that.duration,
            pIndex = that.particleIndex;

        // Loop through all the particles in this emitter and
        // determine whether they're still alive and need advancing
        // or if they should be dead and therefore marked as such.
        for ( var i = start; i < end; ++i ) {
            if ( alive[ i ] === 1.0 ) {
                age[ i ] += dt;
            }

            if ( age[ i ] >= m ) {
                age[ i ] = 0.0;
                alive[ i ] = 0.0;
            }
        }

        // If the emitter is dead, reset any particles that are in
        // the recycled vertices array and reset the age of the
        // emitter to zero ready to go again if required, then
        // exit this function.
        if ( that.alive === 0.0 ) {
            that.age = 0.0;
            return;
        }

        // If the emitter has a specified lifetime and we've exceeded it,
        // mark the emitter as dead and exit this function.
        if ( typeof duration === 'number' && emitterAge > duration ) {
            that.alive = 0.0;
            that.age = 0.0;
            return;
        }



        var n = Math.max( Math.min( end, pIndex + ppsdt ), 0 ),
            count = 0,
            index = 0,
            pIndexFloor = pIndex | 0,
            dtInc;

        for ( i = pIndexFloor; i < n; ++i ) {
            if ( alive[ i ] !== 1.0 ) {
                ++count;
            }
        }

        if ( count !== 0 ) {
            dtInc = dt / count;

            for ( i = pIndexFloor; i < n; ++i, ++index ) {
                if ( alive[ i ] !== 1.0 ) {
                    alive[ i ] = 1.0;
                    age[ i ] = dtInc * index;
                    that._resetParticle( i );
                }
            }
        }

        that.particleIndex += ppsdt;

        if ( that.particleIndex < 0.0 ) {
            that.particleIndex = 0.0;
        }

        if ( pIndex >= start + particleCount ) {
            that.particleIndex = parseFloat( start );
        }

        // Add the delta time value to the age of the emitter.
        that.age += dt;

        if ( that.age < 0.0 ) {
            that.age = 0.0;
        }
    },

    /**
     * Reset this emitter back to its starting position.
     * If `force` is truthy, then reset all particles in this
     * emitter as well, even if they're currently alive.
     *
     * @param  {Boolean} force
     * @return {this}
     */
    reset: function( force ) {
        var that = this;

        that.age = 0.0;
        that.alive = 0;

        if ( force ) {
            var start = that.verticesIndex,
                end = that.verticesIndex + that._particleCount,
                a = that.attributes,
                alive = a.alive.value,
                age = a.age.value;

            for ( var i = start; i < end; ++i ) {
                alive[ i ] = 0.0;
                age[ i ] = 0.0;
            }
        }

        return that;
    },


    /**
     * Enable this emitter.
     */
    enable: function() {
        this.alive = 1;
    },

    /**
     * Disable this emitter.
     */
    disable: function() {
        this.alive = 0;
    }
};



Object.defineProperty( SPE.Emitter.prototype, 'type', {
    get: function() {
        return this._type;
    },
    set: function( value ) {
        if ( value === 'cube' || value === 'sphere' || value === 'disk' ) {
            this._type = value;
            this._updateFlags.type = true;
        }
        else {
            console.warn( 'Invalid emitter type: ' + value + '. Emitter type not changed from "' + this._type + '"' );
        }
    }
} );


Object.defineProperty( SPE.Emitter.prototype, 'particleCount', {
    get: function() {
        return this._particleCount;
    },
    set: function( value ) {
        if ( typeof value === 'number' && value >= 1 ) {
            this._particleCount = Math.round( value );
        }
        else {
            console.warn( 'Invalid particleCount specified: ' + value + '. Must be a number >= 1. ParticleCount remains at: ' + this._particleCount );
        }
    }
} );


Object.defineProperty( SPE.Emitter.prototype, 'position', {
    get: function() {
        return this._position;
    },
    set: function( value ) {
        if ( value instanceof THREE.Vector3 ) {
            this._position = value;
            this._updateFlags.position = true;
        }
        else {
            console.warn( 'Invalid position specified. Must be instance of THREE.Vector3.' );
        }
    }
} );

Object.defineProperty( SPE.Emitter.prototype, 'positionSpread', {
    get: function() {
        return this._positionSpread;
    },
    set: function( value ) {
        if ( value instanceof THREE.Vector3 ) {
            this._positionSpread = value;
            this._updateFlags.position = true;
        }
        else {
            console.warn( 'Invalid positionSpread specified. Must be instance of THREE.Vector3.' );
        }
    }
} );


Object.defineProperty( SPE.Emitter.prototype, 'radius', {
    get: function() {
        return this._radius;
    },
    set: function( value ) {
        if ( typeof value === 'number' ) {
            this._radius = value;
            this._updateFlags.position = true;
        }
        else {
            console.warn( 'Invalid radius specified: ' + value + '. Must be a number. radius remains at: ' + this._radius );
        }
    }
} );

Object.defineProperty( SPE.Emitter.prototype, 'radiusSpread', {
    get: function() {
        return this._radiusSpread;
    },
    set: function( value ) {
        if ( typeof value === 'number' ) {
            this._radiusSpread = value;
            this._updateFlags.position = true;
        }
        else {
            console.warn( 'Invalid radiusSpread specified: ' + value + '. Must be a number. radiusSpread remains at: ' + this._radiusSpread );
        }
    }
} );

Object.defineProperty( SPE.Emitter.prototype, 'radiusScale', {
    get: function() {
        return this._radiusScale;
    },
    set: function( value ) {
        if ( value instanceof THREE.Vector3 ) {
            this._radiusScale = value;
            this._updateFlags.position = true;
        }
        else {
            console.warn( 'Invalid radiusScale specified. Must be instance of THREE.Vector3.' );
        }
    }
} );

Object.defineProperty( SPE.Emitter.prototype, 'radiusSpreadClamp', {
    get: function() {
        return this._radiusSpreadClamp;
    },
    set: function( value ) {
        if ( typeof value === 'number' ) {
            this._radiusSpreadClamp = value;
            this._updateFlags.position = true;
        }
        else {
            console.warn( 'Invalid radiusSpreadClamp specified: ' + value + '. Must be a number. radiusSpreadClamp remains at: ' + this._radiusSpreadClamp );
        }
    }
} );


Object.defineProperty( SPE.Emitter.prototype, 'acceleration', {
    get: function() {
        return this._acceleration;
    },
    set: function( value ) {
        if ( value instanceof THREE.Vector3 ) {
            this._acceleration = value;
            this._updateFlags.acceleration = true;
        }
        else {
            console.warn( 'Invalid acceleration specified. Must be instance of THREE.Vector3.' );
        }
    }
} );

Object.defineProperty( SPE.Emitter.prototype, 'accelerationSpread', {
    get: function() {
        return this._accelerationSpread;
    },
    set: function( value ) {
        if ( value instanceof THREE.Vector3 ) {
            this._accelerationSpread = value;
            this._updateFlags.acceleration = true;
        }
        else {
            console.warn( 'Invalid accelerationSpread specified. Must be instance of THREE.Vector3.' );
        }
    }
} );


Object.defineProperty( SPE.Emitter.prototype, 'velocity', {
    get: function() {
        return this._velocity;
    },
    set: function( value ) {
        if ( value instanceof THREE.Vector3 ) {
            this._velocity = value;
            this._updateFlags.velocity = true;
        }
        else {
            console.warn( 'Invalid velocity specified. Must be instance of THREE.Vector3.' );
        }
    }
} );

Object.defineProperty( SPE.Emitter.prototype, 'velocitySpread', {
    get: function() {
        return this._velocitySpread;
    },
    set: function( value ) {
        if ( value instanceof THREE.Vector3 ) {
            this._velocitySpread = value;
            this._updateFlags.velocity = true;
        }
        else {
            console.warn( 'Invalid velocitySpread specified. Must be instance of THREE.Vector3.' );
        }
    }
} );


Object.defineProperty( SPE.Emitter.prototype, 'speed', {
    get: function() {
        return this._speed;
    },
    set: function( value ) {
        if ( typeof value === 'number' ) {
            this._speed = value;
            this._updateFlags.velocity = true;
        }
        else {
            console.warn( 'Invalid speed specified: ' + value + '. Must be a number. speed remains at: ' + this._speed );
        }
    }
} );

Object.defineProperty( SPE.Emitter.prototype, 'speedSpread', {
    get: function() {
        return this._speedSpread;
    },
    set: function( value ) {
        if ( typeof value === 'number' ) {
            this._speedSpread = value;
            this._updateFlags.velocity = true;
        }
        else {
            console.warn( 'Invalid speedSpread specified: ' + value + '. Must be a number. speedSpread remains at: ' + this._speedSpread );
        }
    }
} );


Object.defineProperty( SPE.Emitter.prototype, 'sizeStart', {
    get: function() {
        return this._sizeStart;
    },
    set: function( value ) {
        if ( typeof value === 'number' ) {
            this._sizeStart = value;
            this._updateFlags.sizeStart = true;
            this._updateCounts.sizeStart = 0;
        }
        else {
            console.warn( 'Invalid sizeStart specified: ' + value + '. Must be a number. sizeStart remains at: ' + this._sizeStart );
        }
    }
} );
Object.defineProperty( SPE.Emitter.prototype, 'sizeStartSpread', {
    get: function() {
        return this._sizeStartSpread;
    },
    set: function( value ) {
        if ( typeof value === 'number' ) {
            this._sizeStartSpread = value;
            this._updateFlags.sizeStart = true;
            this._updateCounts.sizeStart = 0;
        }
        else {
            console.warn( 'Invalid sizeStartSpread specified: ' + value + '. Must be a number. sizeStartSpread remains at: ' + this._sizeStartSpread );
        }
    }
} );


Object.defineProperty( SPE.Emitter.prototype, 'sizeMiddle', {
    get: function() {
        return this._sizeMiddle;
    },
    set: function( value ) {
        if ( typeof value === 'number' ) {
            this._sizeMiddle = value;
        }
        else {
            this._sizeMiddle = Math.abs( this._sizeEnd + this._sizeStart );
        }

        this._updateFlags.sizeMiddle = true;
        this._updateCounts.sizeMiddle = 0;
    }
} );
Object.defineProperty( SPE.Emitter.prototype, 'sizeMiddleSpread', {
    get: function() {
        return this._sizeMiddleSpread;
    },
    set: function( value ) {
        if ( typeof value === 'number' ) {
            this._sizeMiddleSpread = value;
            this._updateFlags.sizeMiddle = true;
            this._updateCounts.sizeMiddle = 0;
        }
        else {
            console.warn( 'Invalid sizeMiddleSpread specified: ' + value + '. Must be a number. sizeMiddleSpread remains at: ' + this._sizeMiddleSpread );
        }
    }
} );

Object.defineProperty( SPE.Emitter.prototype, 'sizeEnd', {
    get: function() {
        return this._sizeEnd;
    },
    set: function( value ) {
        if ( typeof value === 'number' ) {
            this._sizeEnd = value;
            this._updateFlags.sizeEnd = true;
            this._updateCounts.sizeEnd = 0;
        }
        else {
            console.warn( 'Invalid sizeEnd specified: ' + value + '. Must be a number. sizeEnd remains at: ' + this._sizeEnd );
        }
    }
} );
Object.defineProperty( SPE.Emitter.prototype, 'sizeEndSpread', {
    get: function() {
        return this._sizeEndSpread;
    },
    set: function( value ) {
        if ( typeof value === 'number' ) {
            this._sizeEndSpread = value;
            this._updateFlags.sizeEnd = true;
            this._updateCounts.sizeEnd = 0;
        }
        else {
            console.warn( 'Invalid sizeEndSpread specified: ' + value + '. Must be a number. sizeEndSpread remains at: ' + this._sizeEndSpread );
        }
    }
} );

Object.defineProperty( SPE.Emitter.prototype, 'colorStart', {
    get: function() {
        return this._colorStart;
    },
    set: function( value ) {
        if ( value instanceof THREE.Color ) {
            this._colorStart = value;
            this._updateFlags.colorStart = true;
            this._updateCounts.colorStart = 0;
        }
        else {
            console.warn( 'Invalid colorStart specified: ' + value + '. Must be instance of THREE.Color. colorStart remains at: ' + this._colorStart );
        }
    }
} );
Object.defineProperty( SPE.Emitter.prototype, 'colorStartSpread', {
    get: function() {
        return this._colorStartSpread;
    },
    set: function( value ) {
        if ( value instanceof THREE.Vector3 ) {
            this._colorStartSpread = value;
            this._updateFlags.colorStart = true;
            this._updateCounts.colorStart = 0;
        }
        else {
            console.warn( 'Invalid colorStartSpread specified: ' + value + '. Must be instance of THREE.Vector3. colorStartSpread remains at: ' + this._colorStartSpread );
        }
    }
} );


Object.defineProperty( SPE.Emitter.prototype, 'colorMiddle', {
    get: function() {
        return this._colorMiddle;
    },
    set: function( value ) {
        if ( value instanceof THREE.Color === false ) {
            value = this._colorMiddle.addColors( this._colorStart, this._colorEnd ).multiplyScalar( 0.5 );
        }
        else if ( value instanceof THREE.Color ) {
            this._colorMiddle = value;
        }

        this._updateFlags.colorMiddle = true;
        this._updateCounts.colorMiddle = 0;
    }
} );
Object.defineProperty( SPE.Emitter.prototype, 'colorMiddleSpread', {
    get: function() {
        return this._colorMiddleSpread;
    },
    set: function( value ) {
        if ( value instanceof THREE.Vector3 ) {
            this._colorMiddleSpread = value;
            this._updateFlags.colorMiddle = true;
            this._updateCounts.colorMiddle = 0;
        }
        else {
            console.warn( 'Invalid colorMiddleSpread specified: ' + value + '. Must be a number. colorMiddleSpread remains at: ' + this._colorMiddleSpread );
        }
    }
} );

Object.defineProperty( SPE.Emitter.prototype, 'colorEnd', {
    get: function() {
        return this._colorEnd;
    },
    set: function( value ) {
        if ( value instanceof THREE.Color ) {
            this._colorEnd = value;
            this._updateFlags.colorEnd = true;
            this._updateCounts.colorEnd = 0;
        }
        else {
            console.warn( 'Invalid colorEnd specified: ' + value + '. Must be instance of THREE.Color. colorEnd remains at: ' + this._colorEnd );
        }
    }
} );
Object.defineProperty( SPE.Emitter.prototype, 'colorEndSpread', {
    get: function() {
        return this._colorEndSpread;
    },
    set: function( value ) {
        if ( value instanceof THREE.Vector3 ) {
            this._colorEndSpread = value;
            this._updateFlags.colorEnd = true;
            this._updateCounts.colorEnd = 0;
        }
        else {
            console.warn( 'Invalid colorEndSpread specified: ' + value + '. Must be instance of THREE.Vector3. colorEndSpread remains at: ' + this._colorEndSpread );
        }
    }
} );

Object.defineProperty( SPE.Emitter.prototype, 'opacityStart', {
    get: function() {
        return this._opacityStart;
    },
    set: function( value ) {
        if ( typeof value === 'number' ) {
            this._opacityStart = value;
            this._updateFlags.opacityStart = true;
            this._updateCounts.opacityStart = 0;
        }
        else {
            console.warn( 'Invalid opacityStart specified: ' + value + '. Must be a number. opacityStart remains at: ' + this._opacityStart );
        }
    }
} );
Object.defineProperty( SPE.Emitter.prototype, 'opacityStartSpread', {
    get: function() {
        return this._opacityStartSpread;
    },
    set: function( value ) {
        if ( typeof value === 'number' ) {
            this._opacityStartSpread = value;
            this._updateFlags.opacityStart = true;
            this._updateCounts.opacityStart = 0;
        }
        else {
            console.warn( 'Invalid opacityStartSpread specified: ' + value + '. Must be a number. opacityStartSpread remains at: ' + this._opacityStartSpread );
        }
    }
} );


Object.defineProperty( SPE.Emitter.prototype, 'opacityMiddle', {
    get: function() {
        return this._opacityMiddle;
    },
    set: function( value ) {
        if ( typeof value === 'number' ) {
            this._opacityMiddle = value;
        }
        else {
            this._opacityMiddle = Math.abs( this._opacityEnd + this._opacityStart );
        }

        this._updateFlags.opacityMiddle = true;
        this._updateCounts.opacityMiddle = 0;
    }
} );
Object.defineProperty( SPE.Emitter.prototype, 'opacityMiddleSpread', {
    get: function() {
        return this._opacityMiddleSpread;
    },
    set: function( value ) {
        if ( typeof value === 'number' ) {
            this._opacityMiddleSpread = value;
            this._updateFlags.opacityMiddle = true;
            this._updateCounts.opacityMiddle = 0;
        }
        else {
            console.warn( 'Invalid opacityMiddleSpread specified: ' + value + '. Must be a number. opacityMiddleSpread remains at: ' + this._opacityMiddleSpread );
        }
    }
} );

Object.defineProperty( SPE.Emitter.prototype, 'opacityEnd', {
    get: function() {
        return this._opacityEnd;
    },
    set: function( value ) {
        if ( typeof value === 'number' ) {
            this._opacityEnd = value;
            this._updateFlags.opacityEnd = true;
            this._updateCounts.opacityEnd = 0;
        }
        else {
            console.warn( 'Invalid opacityEnd specified: ' + value + '. Must be a number. opacityEnd remains at: ' + this._opacityEnd );
        }
    }
} );
Object.defineProperty( SPE.Emitter.prototype, 'opacityEndSpread', {
    get: function() {
        return this._opacityEndSpread;
    },
    set: function( value ) {
        if ( typeof value === 'number' ) {
            this._opacityEndSpread = value;
            this._updateFlags.opacityEnd = true;
            this._updateCounts.opacityEnd = 0;
        }
        else {
            console.warn( 'Invalid opacityEndSpread specified: ' + value + '. Must be a number. opacityEndSpread remains at: ' + this._opacityEndSpread );
        }
    }
} );


Object.defineProperty( SPE.Emitter.prototype, 'angleStart', {
    get: function() {
        return this._angleStart;
    },
    set: function( value ) {
        if ( typeof value === 'number' ) {
            this._angleStart = value;
            this._updateFlags.angleStart = true;
            this._updateCounts.angleStart = 0;
        }
        else {
            console.warn( 'Invalid angleStart specified: ' + value + '. Must be a number. angleStart remains at: ' + this._angleStart );
        }
    }
} );
Object.defineProperty( SPE.Emitter.prototype, 'angleStartSpread', {
    get: function() {
        return this._angleStartSpread;
    },
    set: function( value ) {
        if ( typeof value === 'number' ) {
            this._angleStartSpread = value;
            this._updateFlags.angleStart = true;
            this._updateCounts.angleStart = 0;
        }
        else {
            console.warn( 'Invalid angleStartSpread specified: ' + value + '. Must be a number. angleStartSpread remains at: ' + this._angleStartSpread );
        }
    }
} );


Object.defineProperty( SPE.Emitter.prototype, 'angleMiddle', {
    get: function() {
        return this._angleMiddle;
    },
    set: function( value ) {
        if ( typeof value === 'number' ) {
            this._angleMiddle = value;
        }
        else {
            this._angleMiddle = Math.abs( this._angleEnd + this._angleStart );
        }

        this._updateFlags.angleMiddle = true;
        this._updateCounts.angleMiddle = 0;
    }
} );
Object.defineProperty( SPE.Emitter.prototype, 'angleMiddleSpread', {
    get: function() {
        return this._angleMiddleSpread;
    },
    set: function( value ) {
        if ( typeof value === 'number' ) {
            this._angleMiddleSpread = value;
            this._updateFlags.angleMiddle = true;
            this._updateCounts.angleMiddle = 0;
        }
        else {
            console.warn( 'Invalid angleMiddleSpread specified: ' + value + '. Must be a number. angleMiddleSpread remains at: ' + this._angleMiddleSpread );
        }
    }
} );

Object.defineProperty( SPE.Emitter.prototype, 'angleEnd', {
    get: function() {
        return this._angleEnd;
    },
    set: function( value ) {
        if ( typeof value === 'number' ) {
            this._angleEnd = value;
            this._updateFlags.angleEnd = true;
            this._updateCounts.angleEnd = 0;
        }
        else {
            console.warn( 'Invalid angleEnd specified: ' + value + '. Must be a number. angleEnd remains at: ' + this._angleEnd );
        }
    }
} );
Object.defineProperty( SPE.Emitter.prototype, 'angleEndSpread', {
    get: function() {
        return this._angleEndSpread;
    },
    set: function( value ) {
        if ( typeof value === 'number' ) {
            this._angleEndSpread = value;
            this._updateFlags.angleEndSpread = true;
            this._updateCounts.angleEndSpread = 0;
        }
        else {
            console.warn( 'Invalid angleEndSpread specified: ' + value + '. Must be a number. angleEndSpread remains at: ' + this._angleEndSpread );
        }
    }
} );


// Extend SPE.Emitter's prototype with functions from utils object.
for ( var i in SPE.utils ) {
    SPE.Emitter.prototype[ i ] = SPE.utils[ i ];
}