var shaderParticleUtils = {

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

        v.copy( base );

        v.x += Math.random() * spread.x - (spread.x/2);
        v.y += Math.random() * spread.y - (spread.y/2);
        v.z += Math.random() * spread.z - (spread.z/2);

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

        v.copy( base );

        v.r += (Math.random() * spread.x) - (spread.x/2);
        v.g += (Math.random() * spread.y) - (spread.y/2);
        v.b += (Math.random() * spread.z) - (spread.z/2);

        v.r = Math.max( 0, Math.min( v.r, 1 ) );
        v.g = Math.max( 0, Math.min( v.g, 1 ) );
        v.b = Math.max( 0, Math.min( v.b, 1 ) );

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
        return base + spread * (Math.random() - 0.5);
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
        var z = 2 * Math.random() - 1;
        var t = 6.2832 * Math.random();
        var r = Math.sqrt( 1 - z*z );
        var vec = new THREE.Vector3( r * Math.cos(t), r * Math.sin(t), z );

        var rand = this._randomFloat( radius, radiusSpread );

        if( radiusSpreadClamp ) {
            rand = Math.round( rand / radiusSpreadClamp ) * radiusSpreadClamp;
        }

        vec.multiplyScalar( rand );

        if( radiusScale ) {
            vec.multiply( radiusScale );
        }

        vec.add( base );

        return vec;
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
        var t = 6.2832 * Math.random();
        var rand = this._randomFloat( radius, radiusSpread );

        if( radiusSpreadClamp ) {
            rand = Math.round( rand / radiusSpreadClamp ) * radiusSpreadClamp;
        }

        var vec = new THREE.Vector3( Math.cos(t), Math.sin(t), 0 ).multiplyScalar( rand );

        if ( radiusScale ) {
            vec.multiply( radiusScale );
        }

        vec.add( base );

        return vec ;
    },

    /**
     * Create a new vector and project it onto spiral
     *
     * @return {THREE.Vector3}
     */
    randomVector3OnSpiral: function( emitter ){
        var vec = new THREE.Vector3();
        emitter._randomizeExistingVector3OnSpiral(vec, emitter.position,
                                                  emitter.radius,
                                                  emitter.radiusSpread,
                                                  emitter.radiusScale,
                                                  emitter.radiusSpreadClamp,
                                                  emitter.radiusMax,
                                                  emitter.spiralSkew,
                                                  emitter.spiralRotation);
        return vec;
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
        var direction = new THREE.Vector3().subVectors( base, position );

        direction.normalize().multiplyScalar( Math.abs( this._randomFloat( speed, speedSpread ) ) );

        if( scale ) {
            direction.multiply( scale );
        }

        return direction;
    },

    /**
     * Create a new THREE.Vector3 instance, and given a spiral w/ a specified radius and
     * point `position` on spiral, set direction towards sphere center with tangential
     * component and random magnitude
     *
     * @param  {THREE.Vector3} base
     * @param  {THREE.Vector3} position
     * @param  {Number} speed
     * @param  {Number} speedSpread
     * @param  {Number} radiusMax
     *
     * @private
     *
     * @return {THREE.Vector3}
     */
    randomVelocityVector3OnSpiral: function( emitter, base ){
        var direction = new THREE.Vector3();
        emitter._randomizeExistingVelocityVector3OnSpiral(direction, base,
                                                          emitter.position,
                                                          emitter.speed,
                                                          emitter.speedSpread,
                                                          emitter.radiusMax);
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

        v.x += Math.random() * spread.x - (spread.x/2);
        v.y += Math.random() * spread.y - (spread.y/2);
        v.z += Math.random() * spread.z - (spread.z/2);
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

        v.r += (Math.random() * spread.x) - (spread.x/2);
        v.g += (Math.random() * spread.y) - (spread.y/2);
        v.b += (Math.random() * spread.z) - (spread.z/2);

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
            r = Math.sqrt( 1 - z*z ),
            rand = this._randomFloat( radius, radiusSpread );

        if( radiusSpreadClamp ) {
            rand = Math.round( rand / radiusSpreadClamp ) * radiusSpreadClamp;
        }

        v.set(
            (r * Math.cos(t)) * rand,
            (r * Math.sin(t)) * rand,
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
        var rand = Math.random,
            t = 6.2832 * rand(),
            rand = Math.abs( this._randomFloat( radius, radiusSpread ) );

        if( radiusSpreadClamp ) {
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

    /**
     * Project Vector onto a point spiral with specified attrs
     *
     * Spiral generated by rotating series of ellipses generated with the
     * specified skew in accordance with the density wave theory
     *
     * @private
     *
     * @param  {THREE.Vector3} v
     * @param  {THREE.Vector3} base
     * @param  {Number} radius
     * @param  {THREE.Vector3} radiusSpread
     * @param  {THREE.Vector3} radiusScale
     * @param  {Number} radiusSpreadClamp
     * @param  {Number} radiusMax
     * @param  {Number} spiralSkew
     * @param  {Number} spiralRotation
     *
     */
    randomizeExistingVector3OnSpiral: function( v, base, radius, radiusSpread,
                                                radiusScale, radiusSpreadClamp,
                                                radiusMax, spiralSkew,
                                                spiralRotation ) {
        /// generate vertex in mostly same manner as disk...
        var rand = Math.random,
            t = 6.2832 * rand(),
            rand = Math.abs( this._randomFloat( radius, radiusSpread ) );

        if( radiusSpreadClamp ) {
            rand = Math.round( rand / radiusSpreadClamp ) * radiusSpreadClamp;
        }

        /// ...except skewed to be an ellipse...
        var ct  = Math.cos(t);
        var sst = Math.sin(t) * spiralSkew;

        /// ...thats also rotated...
        var p = rand / radiusMax;
        var angle = 6.2832 * p * spiralRotation;
        var sa = Math.sin(angle);
        var ca = Math.cos(angle);

        /// apply rotational transformation on ellipse
        v.set(
            ca * ct - sa * sst,
            sa * ct + ca * sst,
            0
        ).multiplyScalar( rand );

        if ( radiusScale ) {
            v.multiply( radiusScale );
        }

        /// randomize z position for buldge in center
        /// TODO parameterize height
        v.z = (Math.random() - 0.5 ) * Math.pow(0.9975, v.length()) * 100;

        v.add( base );
    },

    randomizeExistingVelocityVector3OnSphere: function( v, base, position, speed, speedSpread ) {
        v.copy(position)
            .sub(base)
            .normalize()
            .multiplyScalar( Math.abs( this._randomFloat( speed, speedSpread ) ) );
    },

    randomizeExistingVelocityVector3OnSpiral: function( v, base, position, speed, speedSpread, radiusMax ) {
        v.copy(position).sub(base);

        /// scale speed w/ distance
        var d = v.length();
        var p = d / radiusMax;

        v.normalize();

        var tangent = v.cross(new THREE.Vector3(0,0,-1));

        /// velocity component towards center of spiral
        v.negate().multiplyScalar(3*p);

        // tangent velocity component
        v.add(tangent.multiplyScalar(2*p));

        // total speed
        v.multiplyScalar( Math.abs( this._randomFloat( speed, speedSpread ) ) );
    },

    generateID: function() {
        var str = 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx';

        str = str.replace(/[xy]/g, function(c) {
            var rand = Math.random();
            var r = rand*16|0%16, v = c === 'x' ? r : (r&0x3|0x8);

            return v.toString(16);
        });

        return str;
    }
};
