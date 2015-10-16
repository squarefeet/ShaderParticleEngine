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

    ensureArrayTypedArg: function( arg, type, defaultValue ) {
        // If the argument being checked is an array, loop through
        // it and ensure all the values are of the correct type,
        // falling back to the defaultValue if any aren't.
        if ( Array.isArray( arg ) ) {
            for ( var i = arg.length - 1; i >= 0; --i ) {
                if ( typeof arg[ i ] !== type ) {
                    return defaultValue;
                }
            }

            return arg;
        }

        // If the arg isn't an array then just fallback to
        // checking the type.
        return this.ensureTypedArg( arg, type, defaultValue );
    },

    ensureInstanceOf: function( arg, instance, defaultValue ) {
        if ( instance !== undefined && arg instanceof instance ) {
            return arg;
        }
        else {
            return defaultValue;
        }
    },

    ensureArrayInstanceOf: function( arg, instance, defaultValue ) {
        // If the argument being checked is an array, loop through
        // it and ensure all the values are of the correct type,
        // falling back to the defaultValue if any aren't.
        if ( Array.isArray( arg ) ) {
            for ( var i = arg.length - 1; i >= 0; --i ) {
                if ( instance !== undefined && arg[ i ] instanceof instance === false ) {
                    return defaultValue;
                }
            }

            return arg;
        }

        // If the arg isn't an array then just fallback to
        // checking the type.
        return this.ensureInstanceOf( arg, instance, defaultValue );
    },


    // A bit of a long-winded name, this one, but it ensures that
    // a value-over-lifetime SPE.Emitter object has `value` and
    // `spread` are of equal length, and no longer than the `maxLength`
    // argument.
    ensureValueOverLifetimeCompliance: function( property, minLength, maxLength ) {
        minLength = minLength || 3;
        maxLength = maxLength || 3;

        // First, ensure both properties are arrays.
        if ( Array.isArray( property._value ) === false ) {
            property._value = [ property._value ];
        }

        if ( Array.isArray( property._spread ) === false ) {
            property._spread = [ property._spread ];
        }

        var valueLength = this.clamp( property._value.length, minLength, maxLength ),
            spreadLength = this.clamp( property._spread.length, minLength, maxLength ),
            desiredLength = Math.max( valueLength, spreadLength );

        property._value = this.interpolateArray( property._value, desiredLength );
        property._spread = this.interpolateArray( property._spread, desiredLength );
    },


    // Perform a linear interpolation of an array.
    //
    // Example:
    //  srcArray = [1, 10];
    //  newLength = 10;
    //
    //  returns [1, 2, 3, 4, 5, 6, 7, 8, 9, 10];
    interpolateArray: function( srcArray, newLength ) {
        var newArray = [ srcArray[ 0 ] ],
            factor = ( srcArray.length - 1 ) / ( newLength - 1 );

        for ( var i = 1; i < newLength - 1; ++i ) {
            var f = i * factor,
                before = Math.floor( f ),
                after = Math.ceil( f ),
                delta = f - before;

            newArray[ i ] = this.lerpTypeAgnostic( srcArray[ before ], srcArray[ after ], delta );
        }

        newArray.push( srcArray[ srcArray.length - 1 ] );

        return newArray;
    },

    clamp: function( value, min, max ) {
        return Math.max( min, Math.min( value, max ) );
    },

    zeroToEpsilon: function( value, randomise ) {
        var epsilon = 0.00001,
            result = value;

        if ( value === 0 ) {
            result = randomise ? Math.random() * epsilon * 10 : epsilon;
        }

        else if ( value > 0 && value < epsilon ) {
            result = randomise ? Math.random() * epsilon * 10 : epsilon;;
        }
        else if ( value < 0 && value > -epsilon ) {
            result = -( randomise ? Math.random() * epsilon * 10 : epsilon );
        }

        return result;
    },

    // Linearly interpolate two values.
    //
    // `start` and `end` values MUST be of the same type/instance
    //
    // Supported types/instances:
    //  - Number
    //  - THREE.Vector2
    //  - THREE.Vector3
    //  - THREE.Vector4
    //  - THREE.Color
    lerpTypeAgnostic: function( start, end, delta ) {
        var types = this.types,
            out;

        if ( typeof start === types.NUMBER && typeof end === types.NUMBER ) {
            return start + ( ( end - start ) * delta );
        }
        else if ( start instanceof THREE.Vector2 && end instanceof THREE.Vector2 ) {
            out = start.clone();
            out.x = this.lerp( start.x, end.x, delta );
            out.y = this.lerp( start.y, end.y, delta );
            return out;
        }
        else if ( start instanceof THREE.Vector3 && end instanceof THREE.Vector3 ) {
            out = start.clone();
            out.x = this.lerp( start.x, end.x, delta );
            out.y = this.lerp( start.y, end.y, delta );
            out.z = this.lerp( start.z, end.z, delta );
            return out;
        }
        else if ( start instanceof THREE.Vector4 && end instanceof THREE.Vector4 ) {
            out = start.clone();
            out.x = this.lerp( start.x, end.x, delta );
            out.y = this.lerp( start.y, end.y, delta );
            out.z = this.lerp( start.z, end.z, delta );
            out.w = this.lerp( start.w, end.w, delta );
            return out;
        }
        else if ( start instanceof THREE.Color && end instanceof THREE.Color ) {
            out = start.clone();
            out.r = this.lerp( start.r, end.r, delta );
            out.g = this.lerp( start.g, end.g, delta );
            out.b = this.lerp( start.b, end.b, delta );
            return out;
        }
        else {
            console.warn( "Invalid argument types, or argument types do not match:", start, end );
        }
    },

    lerp: function( start, end, delta ) {
        return start + ( ( end - start ) * delta );
    },

    roundToNearestMultiple: function( n, multiple ) {
        if ( multiple === 0 ) {
            return n;
        }

        var remainder = Math.abs( n ) % multiple;

        if ( remainder === 0 ) {
            return n;
        }

        if ( n < 0 ) {
            return -( Math.abs( n ) - remainder );
        }

        return n + multiple - remainder;
    },

    arrayValuesAreEqual: function( array ) {
        for ( var i = 0; i < array.length - 1; ++i ) {
            if ( array[ i ] !== array[ i + 1 ] ) {
                return false;
            }
        }

        return true;
    },

    // colorsAreEqual: function() {
    //     var colors = Array.prototype.slice.call( arguments ),
    //         numColors = colors.length;

    //     for ( var i = 0, color1, color2; i < numColors - 1; ++i ) {
    //         color1 = colors[ i ];
    //         color2 = colors[ i + 1 ];

    //         if (
    //             color1.r !== color2.r ||
    //             color1.g !== color2.g ||
    //             color1.b !== color2.b
    //         ) {
    //             return false
    //         }
    //     }

    //     return true;
    // },


    randomFloat: function( base, spread ) {
        return base + spread * ( Math.random() - 0.5 );
    },

    // TODO: Use this.randomFloat to add spread values in random* functions?
    randomVector3: function( attribute, index, base, spread, spreadClamp ) {
        var x = base.x + ( Math.random() * spread.x - ( spread.x * 0.5 ) ),
            y = base.y + ( Math.random() * spread.y - ( spread.y * 0.5 ) ),
            z = base.z + ( Math.random() * spread.z - ( spread.z * 0.5 ) );

        // console.log( x, y, z );
        if ( spreadClamp ) {
            x = -spreadClamp.x * 0.5 + this.roundToNearestMultiple( x, spreadClamp.x );
            y = -spreadClamp.y * 0.5 + this.roundToNearestMultiple( y, spreadClamp.y );
            z = -spreadClamp.z * 0.5 + this.roundToNearestMultiple( z, spreadClamp.z );
        }
        // console.log( x, y, z );
        // console.log( '\n\n' );

        attribute.typedArray.setVec3Components( index, x, y, z );
    },

    randomColor: function( attribute, index, base, spread ) {
        var r = base.r + ( Math.random() * spread.x ),
            g = base.g + ( Math.random() * spread.y ),
            b = base.b + ( Math.random() * spread.z );

        r = this.clamp( r, 0, 1 );
        g = this.clamp( g, 0, 1 );
        b = this.clamp( b, 0, 1 );


        attribute.typedArray.setVec3Components( index, r, g, b );
    },

    randomColorAsHex: ( function() {
        var workingColor = new THREE.Color();

        return function( attribute, index, base, spread ) {
            var numItems = base.length,
                colors = [];

            for ( var i = 0; i < numItems; ++i ) {
                var spreadVector = spread[ i ];

                workingColor.copy( base[ i ] );

                workingColor.r += ( Math.random() * spreadVector.x ) - ( spreadVector.x / 2 );
                workingColor.g += ( Math.random() * spreadVector.y ) - ( spreadVector.y / 2 );
                workingColor.b += ( Math.random() * spreadVector.z ) - ( spreadVector.z / 2 );

                workingColor.r = this.clamp( workingColor.r, 0, 1 );
                workingColor.g = this.clamp( workingColor.g, 0, 1 );
                workingColor.b = this.clamp( workingColor.b, 0, 1 );

                colors.push( workingColor.getHex() );
            }

            attribute.typedArray.setVec4Components( index, colors[ 0 ], colors[ 1 ], colors[ 2 ], colors[ 3 ] );
        };
    }() ),

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
        x = Math.cos( t ) * rand;
        y = Math.sin( t ) * rand;

        // Apply radius scale to this position
        x *= radiusScale.x;
        y *= radiusScale.y;

        // Translate to the base position.
        x += base.x;
        y += base.y;
        z += base.z;

        // Set the values in the typed array.
        attribute.typedArray.setVec3Components( index, x, y, z );
    },


    randomDirectionVector3OnSphere: ( function() {
        var v = new THREE.Vector3();

        return function( attribute, index, posX, posY, posZ, emitterPosition, speed, speedSpread ) {
            v.copy( emitterPosition );

            v.x -= posX;
            v.y -= posY;
            v.z -= posZ;

            v.normalize().multiplyScalar( -this.randomFloat( speed, speedSpread ) );

            attribute.typedArray.setVec3Components( index, v.x, v.y, v.z );
        };
    }() ),

    getPackedRotationAxis: ( function() {
        var v = new THREE.Vector3(),
            vSpread = new THREE.Vector3(),
            c = new THREE.Color();

        return function( axis, axisSpread ) {
            v.copy( axis ).normalize();
            vSpread.copy( axisSpread ).normalize();

            v.x += ( -axisSpread.x * 0.5 ) + ( Math.random() * axisSpread.x );
            v.y += ( -axisSpread.y * 0.5 ) + ( Math.random() * axisSpread.y );
            v.z += ( -axisSpread.z * 0.5 ) + ( Math.random() * axisSpread.z );

            v.x = Math.abs( v.x );
            v.y = Math.abs( v.y );
            v.z = Math.abs( v.z );

            v.normalize();

            c.setRGB( v.x, v.y, v.z );
            return c.getHex();
        };
    }() )
};