// ShaderParticleEmitter 0.2.0
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
    that.speed                  = typeof options.speed === 'number' ? options.speed : 0;
    that.speedSpread            = typeof options.speedSpread === 'number' ? options.speedSpread : 0;

    that.size                   = typeof options.size === 'number' ? options.size : 10.0;
    that.sizeSpread             = typeof options.sizeSpread === 'number' ? options.sizeSpread : 0;
    that.sizeEnd                = typeof options.sizeEnd === 'number' ? options.sizeEnd : 10.0;

    that.colorStart             = options.colorStart instanceof THREE.Color ? options.colorStart : new THREE.Color( 'white' );
    that.colorEnd               = options.colorEnd instanceof THREE.Color ? options.colorEnd : new THREE.Color( 'blue' );
    that.colorSpread            = options.colorSpread instanceof THREE.Vector3 ? options.colorSpread : new THREE.Vector3();

    that.opacityStart           = typeof options.opacityStart !== 'undefined' ? options.opacityStart : 1;
    that.opacityEnd             = typeof options.opacityEnd === 'number' ? options.opacityEnd : 0;

    that.emitterDuration        = typeof options.emitterDuration === 'number' ? options.emitterDuration : null;
    that.alive                  = typeof options.alive === 'number' ? options.alive : 1;

    // The following properties are used internally, and mostly set when 
    that.numParticles           = null;
    that.attributes             = null;
    that.vertices               = null;
    that.verticesIndex          = 0;
    that.age                    = 0;
    that.maxAge                 = null;
    that.recycled               = [];

    that.userData = {};
}

ShaderParticleEmitter.prototype = {
    _resetParticle: function( p ) {
        var spread = this.positionSpread;

        // Optimise for no position spread or radius
        if(
            ( this.type === 'cube' && spread.x === 0 && spread.y === 0 && spread.z === 0 ) ||
            ( this.type === 'sphere' && this.radius === 0 )
        ) {
            p.copy( this.position );
        }

        // If there is a position spread, then get a new position based on this spread.
        else if( this.type === 'cube' ) {
            this._randomizeExistingVector3( p, this.position, spread );
        }

        else if( this.type === 'sphere') {
            this._randomizeExistingVector3OnSphere( p, this.position, this.radius );
        }
    },

    _randomizeExistingVector3: function( v, base, spread ) {
        v.copy( base );

        v.x += Math.random() * spread.x - (spread.x/2);
        v.y += Math.random() * spread.y - (spread.y/2);
        v.z += Math.random() * spread.z - (spread.z/2);
    },

    _randomizeExistingVector3OnSphere: function( v, base, radius ) {
        var z = 2 * Math.random() - 1;
        var t = 6.2832 * Math.random();
        var r = Math.sqrt( 1 - z*z );

        var x = ((r * Math.cos(t)) * radius) + base.x;
        var y = ((r * Math.sin(t)) * radius) + base.y;
        var z = (z * radius) + base.z;

        x *= this.radiusScale.x;
        y *= this.radiusScale.y;
        z *= this.radiusScale.z;

        v.set(x, y, z);
    },

    // This function is called by the instance of `ShaderParticleEmitter` that 
    // this emitter has been added to.
    tick: function( dt ) {

        // Cache some values for quicker access in loops.
        var a = this.attributes,
            alive = a.alive.value,
            age = a.age.value,
            velocity = a.velocity.value,
            start = this.verticesIndex,
            end = start + this.numParticles,
            r = this.recycled,
            pps = this.particlesPerSecond,
            m = this.maxAge,
            emitterAge = this.age,
            duration = this.emitterDuration,
            numParticles = this.numParticles;

        // Reset the recycled vertices array.
        // r.length = 0;

        // Loop through all the particles in this emitter and
        // determine whether they're still alive and need advancing
        // or if they should be dead and therefore marked as such
        // and pushed into the recycled vertices array for reuse.
        for( var i = start; i < end; ++i ) {
            if( alive[i] === 1.0 ) {
                age[i] += dt;
            }

            if(age[i] >= m) {
                age[i] = 0.0;
                alive[i] = 0.0;
                r.push(i);
            }
        }

        // If the emitter is dead, reset any particles that are in
        // the recycled vertices array and reset the age of the 
        // emitter to zero ready to go again if required, then
        // exit this function.
        if( !this.alive ) {
            if(r.length) {
                for(var i = 0; i < r.length; ++i) {
                    this._resetParticle( this.vertices[ r[i] ] );
                }
            }

            this.age = 0;
            return;
        }

        // If the emitter has a specified lifetime and we've exceeded it,
        // mark the emitter as dead and exit this function.
        if( typeof duration === 'number' && this.age > duration ) {
            this.alive = 0;
            return;
        }


        // If the emitter age is less than the maximum age of a particle,
        // then we still have particles to emit. 
        if( emitterAge <= m ) {
            // Determine indices of particles to activate
            //  Fix for bug #2 (https://github.com/squarefeet/ShaderParticleEngine/issues/2)
            //  Rather than use Math.round, I'm flooring the indexes here.
            //  This stops any particles that technically shouldn't be marked as
            //  alive from being set so.
            //
            //  Using a bitwise OR because it's quicker on current gen browsers.
            //      See http://jsperf.com/jsfvsbitnot/10 re bitwise OR performance.
            var startIndex  = start + ( pps * emitterAge ) | 0;
            var endIndex    = start + ( pps * (emitterAge + dt) ) | 0;

            // If the end index is greater than the number of particles the
            // emitter has, then clamp the end index to this number.
            if( endIndex > start + numParticles ) {
                endIndex = start + numParticles;
            }

            // Loop through the particles we want to activate and mark
            // them as alive, and reset them.
            for( var i = startIndex; i < endIndex; i++ ) {
                alive[i] = 1.0;
                this._resetParticle( this.vertices[i] );
            }
        }


        // If we have any particles (vertices) in the recycled vertices 
        // array then we need to mark them as alive and reset them.
        //
        // Fix for bug #2 (https://github.com/squarefeet/ShaderParticleEngine/issues/2)
        // Rather than loop through all of the vertices in the recycled array,
        // we need to clamp the maximum number of vertices that we reset so
        // that we don't activate too many particles. This smooths out any
        // historical dt variations during a particles lifecycle, but note
        // that it doesn't stop gaps appearing in a particle stream if 
        // dt isn't fairly consistent.
        var numVerticesToReset = Math.min( r.length - 1, (pps * dt | 0) - 1 );

        // Moved to a backwards loop here so we can safely remove
        // vertices that have been marked as alive. Hopefully the 
        // splice operation shouldn't slow things down too much.
        // JSPerf seems to suggest that it won't...(!)
        for(var i = numVerticesToReset; i >= 0; --i) {
            alive[ r[i] ] = 1.0;
            this._resetParticle( this.vertices[ r[i] ] );
            r.splice(i, 1);
        }

        // Add the delta time value to the age of the emitter.
        this.age += dt;
    }
};