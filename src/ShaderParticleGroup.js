// ShaderParticleGroup 0.2.0
// 
// (c) 2013 Luke Moody (http://www.github.com/squarefeet) & Lee Stemkoski (http://www.adelphi.edu/~stemkoski/)
//     Based on Lee Stemkoski's original work (https://github.com/stemkoski/stemkoski.github.com/blob/master/Three.js/js/ParticleEngine.js).
//
// ShaderParticleGroup may be freely distributed under the MIT license (See LICENSE.txt)

function ShaderParticleGroup( options ) {
    this.fixedTimeStep          = options.fixedTimeStep || 0.016;

    // Uniform properties ( applied to all particles )
    this.maxAge                 = options.maxAge || 3;
    this.texture                = ( typeof options.texture === 'string' ? ASSET_LOADER.loaded.textures[ options.texture ] : options.texture ) || null;
    this.hasPerspective         = typeof options.hasPerspective === 'number' ? options.hasPerspective : 1;
    this.colorize               = options.colorize || 1;

    this.blending               = options.blending || THREE.AdditiveBlending;
    this.transparent            = options.transparent || true;
    this.alphaTest              = options.alphaTest || 0.5;
    this.depthWrite             = options.depthWrite || false;
    this.depthTest              = options.depthTest || true;

    // Create uniforms
    this.uniforms = {
        duration:       { type: 'f', value: parseFloat( this.maxAge ) },
        texture:        { type: 't', value: this.texture },
        hasPerspective: { type: 'i', value: parseInt( this.hasPerspective ) },
        colorize:       { type: 'i', value: parseInt( this.colorize ) }
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
    this.geometry   = null;
    this.material   = null;
    this.mesh       = null;

    this._createGeometry();
    this._createMaterial();
    this._createMesh();

}

ShaderParticleGroup.prototype = {
    _createGeometry: function() {
        this.geometry = new THREE.Geometry();
    },

    _createMaterial: function() {
        this.material = new THREE.ShaderMaterial({
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
    },

    _createMesh: function() {
        this.mesh = new THREE.ParticleSystem( this.geometry, this.material );
        this.mesh.dynamic = true;
    },

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

        // var vec = new THREE.Vector3().addVectors( base, vec3.multiplyScalar( radius ) );

        if( scale ) {
            vec.multiply( scale );
        }

        return vec;
    },

    _randomVelocityVector3OnSphere: function( base, position, speed, speedSpread, scale ) {
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
            emitter.numParticles = emitter.particlesPerSecond * (this.maxAge < emitter.emitterDuration ? this.maxAge : emitter.emitterDuration);
        }
        else {
            emitter.numParticles = emitter.particlesPerSecond * this.maxAge;
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

        // Create the values
        for( var i = start; i < end; ++i ) {

            if( emitter.type === 'sphere' ) {
                vertices[i]     = this._randomVector3OnSphere( emitter.position, emitter.radius, emitter.radiusScale );
                velocity[i]     = this._randomVelocityVector3OnSphere( vertices[i], emitter.position, emitter.speed, emitter.speedSpread, emitter.radiusScale );
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
        emitter.verticesIndex   = start;
        emitter.attributes      = this.attributes;
        emitter.vertices        = this.geometry.vertices;
        emitter.maxAge          = this.maxAge;

        // Save this emitter in an array for processing during this.tick()
        this.emitters.push( emitter );
    },

    tick: function( dt ) {
        dt = dt || this.fixedTimeStep;

        for( var i = 0; i < this.emitters.length; ++i ) {
            this.emitters[i].tick( dt );
        }

        // Set flags to update (causes less garbage than 
        // ```ParticleSystem.sortParticles = true``` in THREE.r58 at least)
        this.attributes.age.needsUpdate = true;
        this.attributes.alive.needsUpdate = true;
        this.geometry.verticesNeedUpdate = true;
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
};