// ShaderParticleGroup 0.3.0
// 
// (c) 2013 Luke Moody (http://www.github.com/squarefeet) & Lee Stemkoski (http://www.adelphi.edu/~stemkoski/)
//     Based on Lee Stemkoski's original work (https://github.com/stemkoski/stemkoski.github.com/blob/master/Three.js/js/ParticleEngine.js).
//
// ShaderParticleGroup may be freely distributed under the MIT license (See LICENSE.txt)


function ShaderParticleGroup( options ) {
    this.fixedTimeStep          = parseFloat( options.fixedTimeStep || 0.016, 10 );

    // Uniform properties ( applied to all particles )
    this.maxAge                 = parseFloat( options.maxAge || 3 );
    this.texture                = ( typeof options.texture === 'string' ? ASSET_LOADER.loaded.textures[ options.texture ] : options.texture ) || null;
    this.hasPerspective         = parseInt( typeof options.hasPerspective === 'number' ? options.hasPerspective : 1 );
    this.colorize               = parseInt( options.colorize || 1 );

    this.blending               = typeof options.blending === 'number' ? options.blending : THREE.AdditiveBlending;
    this.transparent            = options.transparent || true;
    this.alphaTest              = options.alphaTest || 0.5;
    this.depthWrite             = options.depthWrite || false;
    this.depthTest              = options.depthTest || true;

    // Create uniforms
    this.uniforms = {
        duration:       { type: 'f', value: this.maxAge },
        texture:        { type: 't', value: this.texture },
        hasPerspective: { type: 'i', value: this.hasPerspective },
        colorize:       { type: 'i', value: this.colorize }
    };

    this.attributes = {
        acceleration:   { type: 'v3', value: [] },
        velocity:       { type: 'v3', value: [] },
        alive:          { type: 'f', value: [] },
        age:            { type: 'f', value: [] },
        size:           { type: 'f', value: [] },
        sizeEnd:        { type: 'f', value: [] },

        customColor:    { type: 'c', value: [] },
        customColorEnd: { type: 'c', value: [] },

        opacity:        { type: 'f', value: [] },
        opacityEnd:     { type: 'f', value: [] }
    };

    this.emitters   = [];

    this.geometry   = new THREE.Geometry();

    this.material   = new THREE.ShaderMaterial({
        uniforms:       this.uniforms,
        attributes:     this.attributes,
        vertexShader:   ShaderParticleGroup.shaders.vertex,
        fragmentShader: ShaderParticleGroup.shaders.fragment,
        blending:       THREE.AdditiveBlending,
        transparent:    this.transparent,
        alphaTest:      this.alphaTest,
        depthWrite:     this.depthWrite,
        depthTest:      this.depthTest,
    });

    this.mesh       = new THREE.ParticleSystem( this.geometry, this.material );
    this.mesh.dynamic = true;
}

ShaderParticleGroup.prototype = {

    _randomVector3: function( base, spread ) {
        var v = new THREE.Vector3();

        v.copy( base );

        v.x += Math.random() * spread.x - (spread.x/2);
        v.y += Math.random() * spread.y - (spread.y/2);
        v.z += Math.random() * spread.z - (spread.z/2);

        return v;
    },

    _randomColor: function( base, spread ) {
        var v = new THREE.Color();

        v.copy( base );

        v.r += Math.random() * spread.x - (spread.x/2);
        v.g += Math.random() * spread.y - (spread.y/2);
        v.b += Math.random() * spread.z - (spread.z/2);

        v.r = Math.min( v.r, 255 );
        v.g = Math.min( v.g, 255 );
        v.b = Math.min( v.b, 255 );

        return v;
    },

    _randomFloat: function( base, spread ) {
        return base + spread * (Math.random() - 0.5);
    },

    _randomVector3OnSphere: function( base, radius, scale ) {
        var z = 2 * Math.random() - 1;
        var t = 6.2832 * Math.random();
        var r = Math.sqrt( 1 - z*z );
        var vec = new THREE.Vector3( r * Math.cos(t), r * Math.sin(t), z );

        vec.multiplyScalar( radius ).add( base );

        if( scale ) {
            vec.multiply( scale );
        }

        return vec;
    },

    _randomVelocityVector3OnSphere: function( base, position, speed, speedSpread, scale, radius ) {
        var direction = new THREE.Vector3().subVectors( base, position );

        direction.normalize().multiplyScalar( this._randomFloat( speed, speedSpread ) );

        if( scale ) {
            direction.multiply( scale );
        }

        return direction;
    },

    _randomizeExistingVector3: function( vector, base, spread ) {
        vector.set(
            Math.random() * base.x - spread.x,
            Math.random() * base.y - spread.y,
            Math.random() * base.z - spread.z
        );
    },

    addEmitter: function( emitter ) {
        if( emitter.duration ) {
            emitter.numParticles = emitter.particlesPerSecond * (this.maxAge < emitter.emitterDuration ? this.maxAge : emitter.emitterDuration) | 0;
        }
        else {
            emitter.numParticles = emitter.particlesPerSecond * this.maxAge | 0;
        }

        emitter.numParticles = Math.ceil(emitter.numParticles);

        var vertices = this.geometry.vertices,
            start = vertices.length,
            end = emitter.numParticles + start,
            a = this.attributes,
            acceleration = a.acceleration.value,
            velocity = a.velocity.value,
            alive = a.alive.value,
            age = a.age.value,
            size = a.size.value,
            sizeEnd = a.sizeEnd.value,
            customColor = a.customColor.value,
            customColorEnd = a.customColorEnd.value,
            opacity = a.opacity.value,
            opacityEnd = a.opacityEnd.value;

        emitter.particleIndex = parseFloat( start, 10 );

        // Create the values
        for( var i = start; i < end; ++i ) {

            if( emitter.type === 'sphere' ) {
                vertices[i]     = this._randomVector3OnSphere( emitter.position, emitter.radius, emitter.radiusScale );
                velocity[i]     = this._randomVelocityVector3OnSphere( vertices[i], emitter.position, emitter.speed, emitter.speedSpread, emitter.radiusScale, emitter.radius );
            }
            else {
                vertices[i]     = this._randomVector3( emitter.position, emitter.positionSpread );
                velocity[i]     = this._randomVector3( emitter.velocity, emitter.velocitySpread );
            }


            acceleration[i] = this._randomVector3( emitter.acceleration, emitter.accelerationSpread );

            // Fix for bug #1 (https://github.com/squarefeet/ShaderParticleEngine/issues/1)
            // For some stupid reason I was limiting the size value to a minimum of 0.1. Derp.
            size[i]         = this._randomFloat( emitter.size, emitter.sizeSpread );
            sizeEnd[i]      = emitter.sizeEnd;
            age[i]          = 0.0;
            alive[i]        = 0.0;


            customColor[i]      = this._randomColor( emitter.colorStart, emitter.colorSpread );
            customColorEnd[i]   = emitter.colorEnd;
            opacity[i]          = emitter.opacityStart;
            opacityEnd[i]       = emitter.opacityEnd;
        }

        // Cache properties on the emitter so we can access
        // them from its tick function.
        emitter.verticesIndex   = parseFloat( start );
        emitter.attributes      = this.attributes;
        emitter.vertices        = this.geometry.vertices;
        emitter.maxAge          = this.maxAge;

        // Save this emitter in an array for processing during this.tick()
        this.emitters.push( emitter );
    },

    _flagUpdate: function() {
        // Set flags to update (causes less garbage than 
        // ```ParticleSystem.sortParticles = true``` in THREE.r58 at least)
        this.attributes.age.needsUpdate = true;
        this.attributes.alive.needsUpdate = true;
        this.geometry.verticesNeedUpdate = true;
    },

    tick: function( dt ) {
        dt = dt || this.fixedTimeStep;

        for( var i = 0; i < this.emitters.length; ++i ) {
            this.emitters[i].tick( dt );
        }

        this._flagUpdate();
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
        'attribute float opacityEnd;',

        'attribute vec3 acceleration;',
        'attribute vec3 velocity;',
        'attribute float alive;',
        'attribute float age;',
        'attribute float size;',
        'attribute float sizeEnd;',

        'varying vec4 vColor;',

        // Linearly lerp a float
        'float Lerp( float start, float end ) {',
            'return (start + ((end - start) * (age / duration)));',
        '}',

        // Linearly lerp a vector3
        'vec3 Lerp( vec3 start, vec3 end ) {',
            'return (start + ((end - start) * (age / duration)));',
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

            'if( alive > 0.5 ) {',
                // Integrate color "tween"
                'vec3 color = vec3( customColor );',
                'if( customColor != customColorEnd ) {',
                    'color = Lerp( customColor, customColorEnd );',
                '}',

                // Store the color of this particle in the varying vColor, 
                // so frag shader can access it.
                'if( opacity != opacityEnd ) {',
                    'vColor = vec4( color, Lerp( opacity, opacityEnd ) );',
                '}',
                'else {',
                    'vColor = vec4( color, opacity );',
                '}',

                // Get the position of this particle so we can use it
                // when we calculate any perspective that might be required.
                'vec4 pos = GetPos();',

                // Determine point size .
                'float pointSize = Lerp( size, sizeEnd );',

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

            'vec4 rotatedTexture = texture2D( texture,  rotatedUV );',

            'if( colorize == 1 ) {',
                'gl_FragColor = vColor * rotatedTexture;',
            '}',
            'else {',
                'gl_FragColor = rotatedTexture;',
            '}',
        '}'
    ].join('\n')
};;

// ShaderParticleEmitter 0.3.0
// 
// (c) 2013 Luke Moody (http://www.github.com/squarefeet) & Lee Stemkoski (http://www.adelphi.edu/~stemkoski/)
//     Based on Lee Stemkoski's original work (https://github.com/stemkoski/stemkoski.github.com/blob/master/Three.js/js/ParticleEngine.js).
//
// ShaderParticleEmitter may be freely distributed under the MIT license (See LICENSE.txt)

function ShaderParticleEmitter( options ) {
    // If no options are provided, fallback to an empty object.
    options = options || {};

    // Helps with minification. Not as easy to read the following code,
    // but should still be readable enough!
    var that = this;


    that.particlesPerSecond     = typeof options.particlesPerSecond === 'number' ? options.particlesPerSecond : 100;
    that.type                   = (options.type === 'cube' || options.type === 'sphere') ? options.type : 'cube';

    that.position               = options.position instanceof THREE.Vector3 ? options.position : new THREE.Vector3();
    that.positionSpread         = options.positionSpread instanceof THREE.Vector3 ? options.positionSpread : new THREE.Vector3();

    // These two properties are only used when this.type === 'sphere'
    that.radius                 = typeof options.radius === 'number' ? options.radius : 10;
    that.radiusScale            = options.radiusScale instanceof THREE.Vector3 ? options.radiusScale : new THREE.Vector3(1, 1, 1);

    that.acceleration           = options.acceleration instanceof THREE.Vector3 ? options.acceleration : new THREE.Vector3();
    that.accelerationSpread     = options.accelerationSpread instanceof THREE.Vector3 ? options.accelerationSpread : new THREE.Vector3();

    that.velocity               = options.velocity instanceof THREE.Vector3 ? options.velocity : new THREE.Vector3();
    that.velocitySpread         = options.velocitySpread instanceof THREE.Vector3 ? options.velocitySpread : new THREE.Vector3();

    // And again here; only used when this.type === 'sphere'
    that.speed                  = parseFloat( typeof options.speed === 'number' ? options.speed : 0, 10 );
    that.speedSpread            = parseFloat( typeof options.speedSpread === 'number' ? options.speedSpread : 0, 10 );

    that.size                   = parseFloat( typeof options.size === 'number' ? options.size : 10.0, 10 );
    that.sizeSpread             = parseFloat( typeof options.sizeSpread === 'number' ? options.sizeSpread : 0, 10 );
    that.sizeEnd                = parseFloat( typeof options.sizeEnd === 'number' ? options.sizeEnd : 10.0, 10 );

    that.colorStart             = options.colorStart instanceof THREE.Color ? options.colorStart : new THREE.Color( 'white' );
    that.colorEnd               = options.colorEnd instanceof THREE.Color ? options.colorEnd : new THREE.Color( 'blue' );
    that.colorSpread            = options.colorSpread instanceof THREE.Vector3 ? options.colorSpread : new THREE.Vector3();

    that.opacityStart           = parseFloat( typeof options.opacityStart !== 'undefined' ? options.opacityStart : 1, 10 );
    that.opacityEnd             = parseFloat( typeof options.opacityEnd === 'number' ? options.opacityEnd : 0, 10 );

    that.emitterDuration        = typeof options.emitterDuration === 'number' ? options.emitterDuration : null;
    that.alive                  = parseInt( typeof options.alive === 'number' ? options.alive : 1, 10);

    // The following properties are used internally, and mostly set when 
    that.numParticles           = 0;
    that.attributes             = null;
    that.vertices               = null;
    that.verticesIndex          = 0;
    that.age                    = 0.0;
    that.maxAge                 = 0.0;

    that.particleIndex = 0.0;

    that.userData = {};
}

ShaderParticleEmitter.prototype = {
    _resetParticle: function( p ) {
        var spread = this.positionSpread,
            type = this.type;

        // Optimise for no position spread or radius
        if(
            ( type === 'cube' && spread.x === 0 && spread.y === 0 && spread.z === 0 ) ||
            ( type === 'sphere' && this.radius === 0 )
        ) {
            p.copy( this.position );
        }

        // If there is a position spread, then get a new position based on this spread.
        else if( type === 'cube' ) {
            this._randomizeExistingVector3( p, this.position, spread );
        }

        else if( type === 'sphere') {
            this._randomizeExistingVector3OnSphere( p, this.position, this.radius );
        }
    },

    _randomizeExistingVector3: function( v, base, spread ) {
        var r = Math.random;

        v.copy( base );

        v.x += r() * spread.x - (spread.x/2);
        v.y += r() * spread.y - (spread.y/2);
        v.z += r() * spread.z - (spread.z/2);
    },

    _randomizeExistingVector3OnSphere: function( v, base, radius ) {
        var rand = Math.random;

        var z = 2 * rand() - 1;
        var t = 6.2832 * rand();
        var r = Math.sqrt( 1 - z*z );

        var x = ((r * Math.cos(t)) * radius) + base.x;
        var y = ((r * Math.sin(t)) * radius) + base.y;
        var z = (z * radius) + base.z; 

        v.set(x, y, z).multiply( this.radiusScale );
    },


    // This function is called by the instance of `ShaderParticleEmitter` that 
    // this emitter has been added to.
    tick: function( dt ) {

        // Cache some values for quicker access in loops.
        var a = this.attributes,
            alive = a.alive.value,
            age = a.age.value,
            start = this.verticesIndex,
            numParticles = this.numParticles,
            end = start + numParticles,
            pps = this.particlesPerSecond,
            ppsdt = pps * dt,
            m = this.maxAge,
            emitterAge = this.age,
            duration = this.emitterDuration,
            pIndex = this.particleIndex;

        // Loop through all the particles in this emitter and
        // determine whether they're still alive and need advancing
        // or if they should be dead and therefore marked as such
        // and pushed into the recycled vertices array for reuse.
        for( var i = start; i < end; ++i ) {
            if( alive[ i ] === 0.0 ) {
                continue;
            }

            if( age[ i ] === 0.0 ) {
                this._resetParticle( this.vertices[ i ] );
            }

            if( alive[ i ] === 1.0 ) {
                age[ i ] += dt;
            }

            if( age[ i ] >= m ) {
                age[ i ] = 0.0;
                alive[ i ] = 0.0;
            }
        }

        // If the emitter is dead, reset any particles that are in
        // the recycled vertices array and reset the age of the 
        // emitter to zero ready to go again if required, then
        // exit this function.
        if( this.alive === 0 ) {
            this.age = 0.0;
            return;
        }

        // If the emitter has a specified lifetime and we've exceeded it,
        // mark the emitter as dead and exit this function.
        if( typeof duration === 'number' && emitterAge > duration ) {
            this.alive = 0;
            this.age = 0.0;
            return;
        }


        // If the emitter age is less than the maximum age of a particle,
        // then we still have particles to emit. 
        // if( emitterAge <= m ) {
        //     // Determine indices of particles to activate
        //     //  Fix for bug #2 (https://github.com/squarefeet/ShaderParticleEngine/issues/2)
        //     //  Rather than use Math.round, I'm flooring the indexes here.
        //     //  This stops any particles that technically shouldn't be marked as
        //     //  alive from being set so.
        //     //
        //     //  Using a bitwise OR because it's quicker on current gen browsers.
        //     //      See http://jsperf.com/jsfvsbitnot/10 re bitwise OR performance.
        //     var startIndex  = start + ( pps * emitterAge ) | 0;
        //     var endIndex    = start + ( pps * (emitterAge + dt) ) | 0;

        //     // If the end index is greater than the number of particles the
        //     // emitter has, then clamp the end index to this number.
        //     if( endIndex > start + numParticles ) {
        //         endIndex = start + numParticles;
        //     }

        //     // Loop through the particles we want to activate and mark
        //     // them as alive, and reset them.
        //     for( var i = startIndex; i < endIndex; i++ ) {
        //         alive[i] = 1.0;
        //         this._resetParticle( this.vertices[i] );
        //     }

        //     // this.particleIndex += endIndex;
        // }

        // else {
            var n = Math.min( end, pIndex + ppsdt );

            for( i = pIndex | 0; i < n; ++i ) {
                alive[ i ] = 1.0;
                this._resetParticle( this.vertices[ i ] );
            }

            this.particleIndex += ppsdt;

            if( pIndex >= start + this.numParticles ) {
                this.particleIndex = parseFloat( start, 10 );
            }
        // }

        // Add the delta time value to the age of the emitter.
        this.age += dt;
    }
};