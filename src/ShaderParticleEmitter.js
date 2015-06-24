// ShaderParticleEmitter 0.8.0
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
    that._sizeEnd = that._sizeStart;
    that._sizeEndSpread = 0.0;

    that._sizeMiddle = Math.abs( that._sizeEnd + that._sizeStart ) / 2;
    that._sizeMiddleSpread = 0.0;

    that._angleStart = 0.0;
    that._angleStartSpread = 0.0;
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


    // Generic
    that.duration = null;
    that.alive = 1.0;
    that.isStatic = 0.0;

    // Particle spawn callback function.
    that.onParticleSpawn = null;



    // that._particleCount = typeof options.particleCount === 'number' ? options.particleCount : 100;
    // that._type = ( options.type === 'cube' || options.type === 'sphere' || options.type === 'disk' ) ? options.type : 'cube';

    for ( var i in options ) {
        that[ i ] = options[ i ];
    }

    that.particleCount = options.particleCount;
    that.type = options.type;
    that.position = options.position;
    that.positionSpread = options.positionSpread;
    that.radius = options.radius;
    that.radiusSpread = options.radiusSpread;
    that.radiusScale = options.radiusScale;
    that.radiusSpreadClamp = options.radiusSpreadClamp;
    that.acceleration = options.acceleration;
    that.accelerationSpread = options.accelerationSpread;
    that.velocity = options.velocity;
    that.velocitySpread = options.velocitySpread;
    that.speed = options.speed;
    that.speedSpread = options.speedSpread;


    // Sizes
    that.sizeStart = options.sizeStart;
    that.sizeStartSpread = options.sizeStartSpread;

    that.sizeEnd = parseFloat( typeof options.sizeEnd === 'number' ? options.sizeEnd : that.sizeStart );
    that.sizeEndSpread = parseFloat( typeof options.sizeEndSpread === 'number' ? options.sizeEndSpread : 0.0 );

    that.sizeMiddle = parseFloat(
        typeof options.sizeMiddle !== 'undefined' ?
        options.sizeMiddle :
        Math.abs( that.sizeEnd + that.sizeStart ) / 2
    );
    that.sizeMiddleSpread = parseFloat( typeof options.sizeMiddleSpread === 'number' ? options.sizeMiddleSpread : 0 );


    // Angles
    that.angleStart = parseFloat( typeof options.angleStart === 'number' ? options.angleStart : 0 );
    that.angleStartSpread = parseFloat( typeof options.angleStartSpread === 'number' ? options.angleStartSpread : 0 );

    that.angleEnd = parseFloat( typeof options.angleEnd === 'number' ? options.angleEnd : 0 );
    that.angleEndSpread = parseFloat( typeof options.angleEndSpread === 'number' ? options.angleEndSpread : 0 );

    that.angleMiddle = parseFloat(
        typeof options.angleMiddle !== 'undefined' ?
        options.angleMiddle :
        Math.abs( that.angleEnd + that.angleStart ) / 2
    );
    that.angleMiddleSpread = parseFloat( typeof options.angleMiddleSpread === 'number' ? options.angleMiddleSpread : 0 );

    that.angleAlignVelocity = options.angleAlignVelocity || false;


    // Colors
    that.colorStart = options.colorStart instanceof THREE.Color ? options.colorStart : new THREE.Color( 'white' );
    that.colorStartSpread = options.colorStartSpread instanceof THREE.Vector3 ? options.colorStartSpread : new THREE.Vector3();

    that.colorEnd = options.colorEnd instanceof THREE.Color ? options.colorEnd : that.colorStart.clone();
    that.colorEndSpread = options.colorEndSpread instanceof THREE.Vector3 ? options.colorEndSpread : new THREE.Vector3();

    that.colorMiddle =
        options.colorMiddle instanceof THREE.Color ?
        options.colorMiddle :
        new THREE.Color().addColors( that.colorStart, that.colorEnd ).multiplyScalar( 0.5 );
    that.colorMiddleSpread = options.colorMiddleSpread instanceof THREE.Vector3 ? options.colorMiddleSpread : new THREE.Vector3();



    // Opacities
    that.opacityStart = parseFloat( typeof options.opacityStart !== 'undefined' ? options.opacityStart : 1 );
    that.opacityStartSpread = parseFloat( typeof options.opacityStartSpread !== 'undefined' ? options.opacityStartSpread : 0 );

    that.opacityEnd = parseFloat( typeof options.opacityEnd === 'number' ? options.opacityEnd : 0 );
    that.opacityEndSpread = parseFloat( typeof options.opacityEndSpread !== 'undefined' ? options.opacityEndSpread : 0 );

    that.opacityMiddle = parseFloat(
        typeof options.opacityMiddle !== 'undefined' ?
        options.opacityMiddle :
        Math.abs( that.opacityEnd + that.opacityStart ) / 2
    );
    that.opacityMiddleSpread = parseFloat( typeof options.opacityMiddleSpread === 'number' ? options.opacityMiddleSpread : 0 );


    // Generic
    that.duration = typeof options.duration === 'number' ? options.duration : null;
    that.alive = parseFloat( typeof options.alive === 'number' ? options.alive : 1.0 );
    that.isStatic = typeof options.isStatic === 'number' ? options.isStatic : 0;

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
            particlePosition = that.vertices[ i ],
            a = that.attributes,
            particleVelocity = a.velocity.value[ i ],

            vSpread = that.velocitySpread,
            aSpread = that.accelerationSpread;

        // Optimise for no position spread or radius
        if (
            ( type === 'cube' && spread.x === 0 && spread.y === 0 && spread.z === 0 ) ||
            ( type === 'sphere' && that.radius === 0 ) ||
            ( type === 'disk' && that.radius === 0 )
        ) {
            particlePosition.copy( that.position );
            that.randomizeExistingVector3( particleVelocity, that.velocity, vSpread );

            if ( type === 'cube' ) {
                that.randomizeExistingVector3( that.attributes.acceleration.value[ i ], that.acceleration, aSpread );
            }
        }

        // If there is a position spread, then get a new position based on this spread.
        else if ( type === 'cube' ) {
            that.randomizeExistingVector3( particlePosition, that.position, spread );
            that.randomizeExistingVector3( particleVelocity, that.velocity, vSpread );
            that.randomizeExistingVector3( that.attributes.acceleration.value[ i ], that.acceleration, aSpread );
        }

        else if ( type === 'sphere' ) {
            that.randomizeExistingVector3OnSphere( particlePosition, that.position, that.radius, that.radiusSpread, that.radiusScale, that.radiusSpreadClamp );
            that.randomizeExistingVelocityVector3OnSphere( particleVelocity, that.position, particlePosition, that.speed, that.speedSpread );
        }

        else if ( type === 'disk' ) {
            that.randomizeExistingVector3OnDisk( particlePosition, that.position, that.radius, that.radiusSpread, that.radiusScale, that.radiusSpreadClamp );
            that.randomizeExistingVelocityVector3OnSphere( particleVelocity, that.position, particlePosition, that.speed, that.speedSpread );
        }

        if ( typeof that.onParticleSpawn === 'function' ) {
            that.onParticleSpawn( a, i );
        }
    },

    /**
     * Update this emitter's particle's positions. Called by the SPE.Group
     * that this emitter belongs to.
     *
     * @param  {Number} dt
     */
    tick: function( dt ) {

        if ( this.isStatic ) {
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
            this._updateFlags.particleCount = true;
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
            this._updateFlags.positionSpread = true;
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
            this._updateFlags.radius = true;
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
            this._updateFlags.radiusSpread = true;
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
            this._updateFlags.radiusScale = true;
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
            this._updateFlags.radiusSpreadClamp = true;
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
            this._updateFlags.accelerationSpread = true;
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
            this._updateFlags.velocitySpread = true;
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
            this._updateFlags.speed = true;
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
            this._updateFlags.speedSpread = true;
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
            this._updateFlags.sizeStartSpread = true;
        }
        else {
            console.warn( 'Invalid sizeStartSpread specified: ' + value + '. Must be a number. sizeStartSpread remains at: ' + this._sizeStartSpread );
        }
    }
} );

// Extend SPE.Emitter's prototype with functions from utils object.
for ( var i in SPE.utils ) {
    SPE.Emitter.prototype[ i ] = SPE.utils[ i ];
}