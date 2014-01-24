// ShaderParticleEmitter 0.7.0
//
// (c) 2013 Luke Moody (http://www.github.com/squarefeet) 
//     & Lee Stemkoski (http://www.adelphi.edu/~stemkoski/)
// 
// Based on Lee Stemkoski's original work: 
//    (https://github.com/stemkoski/stemkoski.github.com/blob/master/Three.js/js/ParticleEngine.js).
//
// ShaderParticleEmitter may be freely distributed under the MIT license (See LICENSE.txt)

function ShaderParticleEmitter( options ) {
    // If no options are provided, fallback to an empty object.
    options = options || {};

    // Helps with minification. Not as easy to read the following code,
    // but should still be readable enough!
    var that = this;


    that.particlesPerSecond     = typeof options.particlesPerSecond === 'number' ? options.particlesPerSecond : 100;
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

    that.sizeStart              = parseFloat( typeof options.sizeStart === 'number' ? options.sizeStart : 1.0 );
    that.sizeStartSpread        = parseFloat( typeof options.sizeStartSpread === 'number' ? options.sizeStartSpread : 0.0 );
    that.sizeEnd                = parseFloat( typeof options.sizeEnd === 'number' ? options.sizeEnd : that.sizeStart );

    that.angle                  = parseFloat( typeof options.angle === 'number' ? options.angle : 0 );
    that.angleSpread            = parseFloat( typeof options.angleSpread === 'number' ? options.angleSpread : 0 );
    that.angleAlignVelocity     = options.angleAlignVelocity || false;

    that.angularVelocity        = parseFloat( typeof options.angularVelocity === 'number' ? options.angularVelocity : 0 );
    that.angularVelocitySpread  = parseFloat( typeof options.angularVelocitySpread === 'number' ? options.angularVelocitySpread : 0 );

    that.colorStart             = options.colorStart instanceof THREE.Color ? options.colorStart : new THREE.Color( 'white' );
    that.colorStartSpread       = options.colorStartSpread instanceof THREE.Vector3 ? options.colorStartSpread : new THREE.Vector3(0,0,0);
    that.colorEnd               = options.colorEnd instanceof THREE.Color ? options.colorEnd : that.colorStart.clone();
    that.colorMiddle            = options.colorMiddle instanceof THREE.Color ? options.colorMiddle :
        new THREE.Color().addColors( that.colorStart, that.colorEnd ).multiplyScalar( 0.5 );

    that.opacityStart           = parseFloat( typeof options.opacityStart !== 'undefined' ? options.opacityStart : 1 );
    that.opacityEnd             = parseFloat( typeof options.opacityEnd === 'number' ? options.opacityEnd : 0 );
    that.opacityMiddle          = parseFloat(
        typeof options.opacityMiddle !== 'undefined' ?
        options.opacityMiddle :
        Math.abs(that.opacityEnd + that.opacityStart) / 2
    );

    that.emitterDuration        = typeof options.emitterDuration === 'number' ? options.emitterDuration : null;
    that.alive                  = parseInt( typeof options.alive === 'number' ? options.alive : 1, 10 );

    that.isStatic               = typeof options.isStatic === 'number' ? options.isStatic : 0;

    that.isDynamic = options.dynamic || false;

    // The following properties are used internally, and mostly set when this emitter
    // is added to a particle group.
    that.numParticles           = 0;
    that.attributes             = null;
    that.vertices               = null;
    that.verticesIndex          = 0;
    that.age                    = 0.0;
    that.maxAge                 = 0.0;

    that.particleIndex = 0.0;

    that.__id = null;

    that.userData = {};
}

ShaderParticleEmitter.prototype = {

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

        if( that.isDynamic ) {
            that._checkValues( i );
        }
    },


    _checkValues: function( i ) {
        var that = this,
            a = that.attributes;

        // Size
        if( that.sizeStartSpread !== 0.0 || a.sizeStart.value[ i ] !== that.sizeStart ) {
            a.sizeStart.value[ i ] = that._randomFloat( that.sizeStart, that.sizeStartSpread );
            a.sizeStart.needsUpdate = true;
        }

        if( a.sizeEnd.value[ i ] !== that.sizeEnd ) {
            a.sizeEnd.value[ i ] = that.sizeEnd;
            a.sizeEnd.needsUpdate = true;
        }

        // Opacity
        if( a.opacityStart.value[ i ] !== that.opacityStart ) {
            a.opacityStart.value[ i ] = that.opacityStart;
            a.opacityStart.needsUpdate = true;
        }
        if( a.opacityMiddle.value[ i ] !== that.opacityMiddle ) {
            a.opacityMiddle.value[ i ] = that.opacityMiddle;
            a.opacityMiddle.needsUpdate = true;
        }
        if( a.opacityEnd.value[ i ] !== that.opacityEnd ) {
            a.opacityEnd.value[ i ] = that.opacityEnd;
            a.opacityEnd.needsUpdate = true;
        }

        // Angle
        if( a.angleAlignVelocity.value[ i ] !== that.angleAlignVelocity ) {
            a.angleAlignVelocity.value[ i ] = that.angleAlignVelocity ? 1.0 : 0.0;
            a.angleAlignVelocity.needsUpdate = true;
        }
        else if( !that.angleAlignVelocity && a.angle.value[ i ] !== that.angle ) {
            a.angle.value[ i ] = that.angle;
            a.angle.needsUpdate = true;
        }
    },

    /**
     * Update this emitter's particle's positions. Called by the ShaderParticleGroup
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
            numParticles = that.numParticles,
            end = start + numParticles,
            pps = that.particlesPerSecond,
            ppsdt = pps * dt,
            m = that.maxAge,
            emitterAge = that.age,
            duration = that.emitterDuration,
            pIndex = that.particleIndex;

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
        if( that.alive === 0 ) {
            that.age = 0.0;
            return;
        }

        // If the emitter has a specified lifetime and we've exceeded it,
        // mark the emitter as dead and exit this function.
        if( typeof duration === 'number' && emitterAge > duration ) {
            that.alive = 0;
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

        if( pIndex >= start + that.numParticles ) {
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
                end = that.verticesIndex + that.numParticles,
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
    },


    _setRandomVector3Attribute: function( attr, base, spread ) {
        var that = this,
            start = that.verticesIndex,
            end = start + that.numParticles,
            alive = that.attributes.alive.value;

        spread = spread || new THREE.Vector3();

        for( var i = start; i < end; ++i ) {
            if( alive[ i ] === 0.0 ) {
                that._randomizeExistingVector3( attr.value[ i ], base, spread );
            }
        }
    },

    _setRandomColorAttribute: function( attr, base, spread ) {
        var that = this,
            start = that.verticesIndex,
            end = start + that.numParticles;

        spread = spread || new THREE.Vector3();

        for( var i = start; i < end; ++i ) {
            that._randomizeExistingColor( attr.value[ i ], base, spread );
        }
    },

    _setRandomFloatAttribute: function( attr, base, spread ) {
        var that = this,
            start = that.verticesIndex,
            end = start + that.numParticles,
            alive = that.attributes.alive.value;

        spread = spread || 0;

        for( var i = start; i < end; ++i ) {
            if( alive[ i ] === 0.0 ) {
                attr.value[ i ] = that._randomFloat( base, spread );
            }
        }
    },


    setOption: function( optionName, value ) {
        var that = this;


        if( typeof that.attributes[ optionName ] === 'undefined' && typeof that[ optionName ] === 'undefined' ) {
            console.log( "Won't set", optionName + ".", "Invalid property." );
            return;
        }

        if( that.attributes[ optionName ] ) {
            that[ optionName ] = value;

            if( typeof that[ optionName ] === 'number' ) {
                that._setRandomFloatAttribute(
                    that.attributes[ optionName ],
                    that[ optionName ],
                    that[ optionName + 'Spread' ]
                );
            }
            else if( that[ optionName ] instanceof THREE.Vector3 ) {
                that._setRandomVector3Attribute(
                    that.attributes[ optionName ],
                    that[ optionName ],
                    that[ optionName + 'Spread' ]
                );
            }
            else if( that[ optionName ] instanceof THREE.Color ) {
                that._setRandomColorAttribute(
                    that.attributes[ optionName ],
                    that[ optionName ],
                    that[ optionName + 'Spread' ]
                );
            }

            that.attributes[ optionName ].needsUpdate = true;
        }

        else if( that[ optionName ] ) {
            that[ optionName ] = value;

            if( optionName.indexOf( 'Spread' ) > -1 && that.type === 'cube' ) {
                var baseName = optionName.replace( 'Spread', '' );
                that.setOption( baseName, that[ baseName ] );
            }
        }

    }
};

// Extend ShaderParticleEmitter's prototype with functions from utils object.
for( var i in shaderParticleUtils ) {
    ShaderParticleEmitter.prototype[ '_' + i ] = shaderParticleUtils[i];
}
