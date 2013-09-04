// ShaderParticleEmitter 0.4.0
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
    that.opacityMiddle          = parseFloat( 
        typeof options.opacityMiddle !== 'undefined' ? 
        options.opacityMiddle : 
        Math.abs(that.opacityEnd + that.opacityStart) / 2, 
    10 );

    that.emitterDuration        = typeof options.emitterDuration === 'number' ? options.emitterDuration : null;
    that.alive                  = parseInt( typeof options.alive === 'number' ? options.alive : 1, 10);

    that.static                 = typeof options.static === 'number' ? options.static : 0;

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

        if( this.static ) {
            return;
        }

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

        var n = Math.min( end, pIndex + ppsdt );

        for( i = pIndex | 0; i < n; ++i ) {
            if( alive[ i ] !== 1.0 ) {
                alive[ i ] = 1.0;
                this._resetParticle( this.vertices[ i ] );
            }
        }

        this.particleIndex += ppsdt;

        if( pIndex >= start + this.numParticles ) {
            this.particleIndex = parseFloat( start, 10 );
        }

        // Add the delta time value to the age of the emitter.
        this.age += dt;
    }
};
