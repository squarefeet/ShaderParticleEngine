// ShaderParticleEmitter 0.7.5
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


    that.particleCount          = typeof options.particleCount === 'number' ? options.particleCount : 100;
    that.type                   = (options.type === 'cube' || options.type === 'sphere' || options.type === 'disk') ? options.type : 'cube';

    that.position               = options.position instanceof THREE.Vector3 ? options.position : new THREE.Vector3();
    that.positionSpread         = options.positionSpread instanceof THREE.Vector3 ? options.positionSpread : new THREE.Vector3();

    // These two properties are only used when this.type === 'sphere' or 'disk'
    that.radius                 = typeof options.radius === 'number' ? options.radius : 10;
    that.radiusSpread           = typeof options.radiusSpread === 'number' ? options.radiusSpread : 0;
    that.radiusScale            = options.radiusScale instanceof THREE.Vector3 ? options.radiusScale : new THREE.Vector3(1, 1, 1);
    that.radiusSpreadClamp      = typeof options.radiusSpreadClamp === 'number' ? options.radiusSpreadClamp : 0;

    that.acceleration           = options.acceleration instanceof THREE.Vector3 ? options.acceleration : new THREE.Vector3();
    that.accelerationSpread     = options.accelerationSpread instanceof THREE.Vector3 ? options.accelerationSpread : new THREE.Vector3();

    that.velocity               = options.velocity instanceof THREE.Vector3 ? options.velocity : new THREE.Vector3();
    that.velocitySpread         = options.velocitySpread instanceof THREE.Vector3 ? options.velocitySpread : new THREE.Vector3();


    // And again here; only used when this.type === 'sphere' or 'disk'
    that.speed                  = parseFloat( typeof options.speed === 'number' ? options.speed : 0.0 );
    that.speedSpread            = parseFloat( typeof options.speedSpread === 'number' ? options.speedSpread : 0.0 );


    // Sizes
    that.sizeStart              = parseFloat( typeof options.sizeStart === 'number' ? options.sizeStart : 1.0 );
    that.sizeStartSpread        = parseFloat( typeof options.sizeStartSpread === 'number' ? options.sizeStartSpread : 0.0 );

    that.sizeEnd                = parseFloat( typeof options.sizeEnd === 'number' ? options.sizeEnd : that.sizeStart );
    that.sizeEndSpread          = parseFloat( typeof options.sizeEndSpread === 'number' ? options.sizeEndSpread : 0.0 );

    that.sizeMiddle             = parseFloat(
        typeof options.sizeMiddle !== 'undefined' ?
        options.sizeMiddle :
        Math.abs(that.sizeEnd + that.sizeStart) / 2
    );
    that.sizeMiddleSpread       = parseFloat( typeof options.sizeMiddleSpread === 'number' ? options.sizeMiddleSpread : 0 );


    // Angles
    that.angleStart             = parseFloat( typeof options.angleStart === 'number' ? options.angleStart : 0 );
    that.angleStartSpread       = parseFloat( typeof options.angleStartSpread === 'number' ? options.angleStartSpread : 0 );

    that.angleEnd               = parseFloat( typeof options.angleEnd === 'number' ? options.angleEnd : 0 );
    that.angleEndSpread         = parseFloat( typeof options.angleEndSpread === 'number' ? options.angleEndSpread : 0 );

    that.angleMiddle            = parseFloat(
        typeof options.angleMiddle !== 'undefined' ?
        options.angleMiddle :
        Math.abs(that.angleEnd + that.angleStart) / 2
    );
    that.angleMiddleSpread      = parseFloat( typeof options.angleMiddleSpread === 'number' ? options.angleMiddleSpread : 0 );

    that.angleAlignVelocity     = options.angleAlignVelocity || false;


    // Colors
    that.colorStart             = options.colorStart instanceof THREE.Color ? options.colorStart : new THREE.Color( 'white' );
    that.colorStartSpread       = options.colorStartSpread instanceof THREE.Vector3 ? options.colorStartSpread : new THREE.Vector3();

    that.colorEnd               = options.colorEnd instanceof THREE.Color ? options.colorEnd : that.colorStart.clone();
    that.colorEndSpread         = options.colorEndSpread instanceof THREE.Vector3 ? options.colorEndSpread : new THREE.Vector3();

    that.colorMiddle            =
        options.colorMiddle instanceof THREE.Color ?
        options.colorMiddle :
        new THREE.Color().addColors( that.colorStart, that.colorEnd ).multiplyScalar( 0.5 );
    that.colorMiddleSpread      = options.colorMiddleSpread instanceof THREE.Vector3 ? options.colorMiddleSpread : new THREE.Vector3();



    // Opacities
    that.opacityStart           = parseFloat( typeof options.opacityStart !== 'undefined' ? options.opacityStart : 1 );
    that.opacityStartSpread     = parseFloat( typeof options.opacityStartSpread !== 'undefined' ? options.opacityStartSpread : 0 );

    that.opacityEnd             = parseFloat( typeof options.opacityEnd === 'number' ? options.opacityEnd : 0 );
    that.opacityEndSpread       = parseFloat( typeof options.opacityEndSpread !== 'undefined' ? options.opacityEndSpread : 0 );

    that.opacityMiddle          = parseFloat(
        typeof options.opacityMiddle !== 'undefined' ?
        options.opacityMiddle :
        Math.abs(that.opacityEnd + that.opacityStart) / 2
    );
    that.opacityMiddleSpread      = parseFloat( typeof options.opacityMiddleSpread === 'number' ? options.opacityMiddleSpread : 0 );


    // Generic
    that.duration               = typeof options.duration === 'number' ? options.duration : null;
    that.alive                  = parseFloat( typeof options.alive === 'number' ? options.alive : 1.0 );
    that.isStatic               = typeof options.isStatic === 'number' ? options.isStatic : 0;

    // The following properties are used internally, and mostly set when this emitter
    // is added to a particle group.
    that.particlesPerSecond     = 0;
    that.attributes             = null;
    that.vertices               = null;
    that.verticesIndex          = 0;
    that.age                    = 0.0;
    that.maxAge                 = 0.0;

    that.particleIndex = 0.0;

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
            type = that.type,
            spread = that.positionSpread,
            particlePosition = that.vertices[i],
            a = that.attributes,
            particleVelocity = a.velocity.value[i],

            vSpread = that.velocitySpread,
            aSpread = that.accelerationSpread;

        // Optimise for no position spread or radius
        if(
            ( type === 'cube' && spread.x === 0 && spread.y === 0 && spread.z === 0 ) ||
            ( type === 'sphere' && that.radius === 0 ) ||
            ( type === 'disk' && that.radius === 0 )
        ) {
            particlePosition.copy( that.position );
            that._randomizeExistingVector3( particleVelocity, that.velocity, vSpread );

            if( type === 'cube' ) {
                that._randomizeExistingVector3( that.attributes.acceleration.value[i], that.acceleration, aSpread );
            }
        }

        // If there is a position spread, then get a new position based on this spread.
        else if( type === 'cube' ) {
            that._randomizeExistingVector3( particlePosition, that.position, spread );
            that._randomizeExistingVector3( particleVelocity, that.velocity, vSpread );
            that._randomizeExistingVector3( that.attributes.acceleration.value[i], that.acceleration, aSpread );
        }

        else if( type === 'sphere') {
            that._randomizeExistingVector3OnSphere( particlePosition, that.position, that.radius, that.radiusSpread, that.radiusScale, that.radiusSpreadClamp );
            that._randomizeExistingVelocityVector3OnSphere( particleVelocity, that.position, particlePosition, that.speed, that.speedSpread );
        }

        else if( type === 'disk') {
            that._randomizeExistingVector3OnDisk( particlePosition, that.position, that.radius, that.radiusSpread, that.radiusScale, that.radiusSpreadClamp );
            that._randomizeExistingVelocityVector3OnSphere( particleVelocity, that.position, particlePosition, that.speed, that.speedSpread );
        }
    },

    /**
     * Update this emitter's particle's positions. Called by the SPE.Group
     * that this emitter belongs to.
     *
     * @param  {Number} dt
     */
    tick: function( dt ) {

        if( this.isStatic ) {
            return;
        }

        // Cache some values for quicker access in loops.
        var that = this,
            a = that.attributes,
            alive = a.alive.value,
            age = a.age.value,
            start = that.verticesIndex,
            particleCount = that.particleCount,
            end = start + particleCount,
            pps = that.particlesPerSecond * that.alive,
            ppsdt = pps * dt,
            m = that.maxAge,
            emitterAge = that.age,
            duration = that.duration,
            pIndex = that.particleIndex;

        // if( that.alive !== 1.0 && that.alive > 0.0 ) {
        //     end *= that.alive;
        //     pps = particleCount / that.maxAge | 0;
        //     // console.log( end );
        // }

        // Loop through all the particles in this emitter and
        // determine whether they're still alive and need advancing
        // or if they should be dead and therefore marked as such.
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
        if( that.alive === 0.0 ) {
            that.age = 0.0;
            return;
        }

        // If the emitter has a specified lifetime and we've exceeded it,
        // mark the emitter as dead and exit this function.
        if( typeof duration === 'number' && emitterAge > duration ) {
            that.alive = 0.0;
            that.age = 0.0;
            return;
        }

        var n = Math.max( Math.min( end, pIndex + ppsdt ), 0);

        for( i = pIndex | 0; i < n; ++i ) {
            if( alive[ i ] !== 1.0 ) {
                alive[ i ] = 1.0;
                that._resetParticle( i );
            }
        }

        that.particleIndex += ppsdt;

        if( that.particleIndex < 0.0 ) {
            that.particleIndex = 0.0;
        }

        if( pIndex >= start + particleCount ) {
            that.particleIndex = parseFloat( start );
        }

        // Add the delta time value to the age of the emitter.
        that.age += dt;

        if( that.age < 0.0 ) {
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

        if( force ) {
            var start = that.verticesIndex,
                end = that.verticesIndex + that.particleCount,
                a = that.attributes,
                alive = a.alive.value,
                age = a.age.value;

            for( var i = start; i < end; ++i ) {
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

// Extend SPE.Emitter's prototype with functions from utils object.
for( var i in SPE.utils ) {
    SPE.Emitter.prototype[ '_' + i ] = SPE.utils[i];
}
