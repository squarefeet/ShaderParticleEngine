SPE.utils = {
    types: {
        BOOLEAN: 'boolean',
        STRING: 'string',
        NUMBER: 'number',
        OBJECT: 'object'
    },

    ensureTypedArg: function( arg, type, defaultValue ) {
        if ( typeof arg === type ) {
            return arg;
        }
        else {
            return defaultValue;
        }
    },

    ensureInstanceOf: function( arg, instance, defaultValue ) {
        if ( instance !== undefined && arg instanceof instance ) {
            return arg;
        }
        else {
            return defaultValue;
        }
    },

    clamp: function( value, min, max ) {
        return Math.max( min, Math.min( value, max ) );
    },


    randomFloat: function( base, spread ) {
        return base + spread * ( Math.random() - 0.5 );
    },

    // TODO: Use this.randomFloat to add spread values in random* functions?
    randomVector3: function( attribute, index, base, spread ) {
        var x = base.x + ( Math.random() * spread.x - ( spread.x * 0.5 ) ),
            y = base.y + ( Math.random() * spread.y - ( spread.y * 0.5 ) ),
            z = base.z + ( Math.random() * spread.z - ( spread.z * 0.5 ) );

        attribute.typedArray.setVec3Components( index, x, y, z );
    },

    randomColor: function( attribute, index, base, spread ) {
        var r = base.r + ( Math.random() * spread.x - ( spread.x * 0.5 ) ),
            g = base.g + ( Math.random() * spread.y - ( spread.y * 0.5 ) ),
            b = base.b + ( Math.random() * spread.z - ( spread.z * 0.5 ) );

        r = this.clamp( r, 0, 1 );
        g = this.clamp( g, 0, 1 );
        b = this.clamp( b, 0, 1 );

        attribute.typedArray.setVec3Components( index, r, g, b );
    },

    randomVector3OnSphere: function( attribute, index, base, radius, radiusSpread, radiusScale, radiusSpreadClamp ) {
        var depth = 2 * Math.random() - 1,
            t = 6.2832 * Math.random(),
            r = Math.sqrt( 1 - depth * depth ),
            rand = this.randomFloat( radius, radiusSpread ),
            x = 0,
            y = 0,
            z = 0;

        if ( radiusSpreadClamp ) {
            rand = Math.round( rand / radiusSpreadClamp ) * radiusSpreadClamp;
        }

        // Set position on sphere
        x = r * Math.cos( t ) * rand;
        y = r * Math.sin( t ) * rand;
        z = depth * rand;

        // Apply radius scale to this position
        x *= radiusScale.x;
        y *= radiusScale.y;
        z *= radiusScale.z;

        // Translate to the base position.
        x += base.x;
        y += base.y;
        z += base.z;

        // Set the values in the typed array.
        attribute.typedArray.setVec3Components( index, x, y, z );
    },

    randomVector3OnDisc: function( attribute, index, base, radius, radiusSpread, radiusScale, radiusSpreadClamp ) {
        var t = 6.2832 * Math.random(),
            rand = Math.abs( this.randomFloat( radius, radiusSpread ) ),
            x = 0,
            y = 0,
            z = 0;

        if ( radiusSpreadClamp ) {
            rand = Math.round( rand / radiusSpreadClamp ) * radiusSpreadClamp;
        }

        // Set position on sphere
        x = r * Math.cos( t ) * rand;
        y = r * Math.sin( t ) * rand;

        // Apply radius scale to this position
        x *= radiusScale.x;
        y *= radiusScale.y;

        // Translate to the base position.
        x += base.x;
        y += base.y;
        z += base.z;

        // Set the values in the typed array.
        attribute.typedArray.setVec3Components( index, x, y, z );
    }
};