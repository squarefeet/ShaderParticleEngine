var utils = {
    noop: function() {},

    // This is a bit of a tangled mess... Should refactor at some point...
    getDefaultValue: function( property, component ) {
        var defaultGroup = CONFIG.editor.defaultGroup,
            defaultEmitter = CONFIG.editor.defaultEmitter;

        if( typeof defaultGroup[ property ] !== 'undefined' ) {
            if( component && typeof defaultGroup[ property ][ component ] !== 'undefined' ) {
                return defaultGroup[ property ][ component ];
            }
            else {
                return defaultGroup[ property ]
            }
        }

        else if( typeof defaultEmitter[ property ] !== 'undefined' ) {
            if( component && typeof defaultEmitter[ property ][ component ] !== 'undefined' ) {
                return defaultEmitter[ property ][ component ];
            }
            else {
                return defaultEmitter[ property ]
            }
        }

        else {
            var startSpreadProp = property.replace( 'Spread', component + 'Spread' ),
                startProp = property + component,
                vecComponent = utils.lifecycleComponentToVectorComponent( component );

            if( typeof defaultEmitter[ startSpreadProp ] !== 'undefined' ) {

                if( component && typeof defaultEmitter[ startSpreadProp ][ vecComponent ] !== 'undefined' ) {
                    return defaultEmitter[ startSpreadProp ][ vecComponent ];
                }
                else {
                    return defaultEmitter[ startSpreadProp ];
                }
            }
            else if( typeof defaultEmitter[ startProp ] !== 'undefined' ) {
                return defaultEmitter[ startProp ];
            }
        }

        return undefined;
    },

    lifecycleComponentToVectorComponent: function( component ) {
        var out;

        switch( component ) {
            case 'Start':
                out = 'x';
                break;

            case 'Middle':
                out = 'y';
                break;

            case 'End':
                out = 'z';
                break;
        }

        return out;
    },

    settingIsEqual: function( a, b ) {
        if( typeof a === 'number' ) {
            return a === b;
        }
        else if( a instanceof THREE.Vector3 || a instanceof THREE.Color ) {
            return a.equals( b );
        }
        else {
            return a === b;
        }
    },

    settingAdheresToType: function( settingName, type ) {
        if( ~CONFIG.editor.globalSettings.indexOf( settingName ) ) {
            return true;
        }
        else if( type === 'cube' && ~CONFIG.editor.cubeSettings.indexOf( settingName ) ) {
            return true;
        }
        else if( ( type === 'disk' || type === 'sphere' ) && ~CONFIG.editor.sphereDiskSettings.indexOf( settingName ) ) {
            return true;
        }
        else {
            return false;
        }
    },

    stringifySetting: function( name, value ) {
        if( typeof value === 'number' ) {
            return name + ': ' + value;
        }
        else if( typeof value === 'string' ) {
            return name + ': ' + "'" + value + "'";
        }

        else if( value instanceof THREE.Vector3 ) {
            return name + ': new THREE.Vector3( ' + value.x + ', ' + value.y + ', ' + value.z + ' )'
        }

        else if( value instanceof THREE.Color ) {
            return name + ': new THREE.Color( 0x' + value.getHexString() + ' )'
        }
        else {
            return name + ': ' + value;
        }
    },

    getBase64Texture: function( cb ) {
        var canvas = document.createElement( 'canvas' ),
            ctx = canvas.getContext( '2d' ),
            image = new Image();

        image.onload = function() {
            ctx.drawImage( image, 0, 0 );
            cb( canvas.toDataURL() );
        };

        image.src = CONFIG.editor.group.texture.sourceFile;
    },

    isUsingPackagedTexture: function() {
        var tex = CONFIG.editor.group.texture.sourceFile,
            packaged = CONFIG.editor.packagedTextures;

        for( var i = 0; i < packaged.length; ++i ) {
            if( ~tex.indexOf( packaged[ i ] ) ) {
                return true;
            }
        }

        return false;
    },

    // Keeping this for its use of LZMA. Will delete when other "compressor"
    // is finalized.
    compressSettings_old: (function() {
        var lzma;

        return function( groupSettings, emitterSettings ) {
            if( !lzma ) {
                lzma = new LZMA( 'res/js/vendor/lzma_worker.js');
            }

            // FIXME: create utils.generateOptimisedSettings
            // that will only generate key/value pairs for settings
            // that are not defaults.
            //
            // Argument against: If defaults change in the future,
            // these optimised settings will no longer be valid...

            var canvas = document.createElement( 'canvas' );
            var ctx = canvas.getContext( '2d' );
            var image = new Image();

            image.onload = function() {
                ctx.drawImage( image, 0, 0 );

                var str = {
                    group: {
                        texture: canvas.toDataURL(),
                        maxAge: groupSettings.maxAge
                    },
                    emitter: emitterSettings
                };

                str = JSON.stringify( str );

                console.log( str.length, str );

                // lzma.compress( str, 1, function( result ) {
                //     console.log( 'compressed', result.toString().length );

                //     lzma.decompress( result, function( res ) {
                //         console.log( res.length );
                //     } );
                // } );
            };

            image.src = groupSettings.texture.sourceFile;


        };
    }()),

    compressSettings: function() {
        var group = CONFIG.editor.group,
            groupCompressKeys = CONFIG.editor.groupCompressed,
            emitter = CONFIG.editor.emitter,
            emitterCompressKeys = CONFIG.editor.emitterCompressed,
            groupCompressed = {},
            emitterCompressed = [],
            full = {},

            groupString = '',
            emitterString = '',
            splitter = ';',
            b64 = utils.getBase64Texture( function( b64Str ) {

                for( var i in group ) {
                    if( i === 'texture' ) {
                        // groupCompressed[ groupCompressKeys[ i ] ] = group.texture.sourceFile;
                        groupCompressed[ groupCompressKeys[ i ] ] = b64Str;
                    }
                    else {
                        groupCompressed[ groupCompressKeys[ i ] ] = group[ i ].toString();
                    }
                }

                for( var i = 0; i < emitter.length; ++i ) {

                    var currentEmitter = emitter[ i ];
                    emitterCompressed[ i ] = {};

                    for( var prop in currentEmitter ) {
                        if( currentEmitter[ prop ] instanceof THREE.Vector3 || currentEmitter[ prop ] instanceof THREE.Color ) {
                            emitterCompressed[ i ][ emitterCompressKeys[ prop ] ] = currentEmitter[ prop ].toArray().toString();
                        }
                        else {
                            emitterCompressed[ i ] [ emitterCompressKeys[ prop ] ] = currentEmitter[ prop ];
                        }
                    }
                }


                for( var i in groupCompressed ) {
                    if( i === 't' ) continue;

                    groupString += i + ':' + groupCompressed[ i ] + splitter;
                }

                for( var i = 0; i < emitterCompressed.length; ++i ) {
                    emitterString += '=';

                    for( var j in emitterCompressed[ i ] ) {
                        emitterString += j + ':' + emitterCompressed[ i ][ j ] + splitter;
                    }
                }

                full.g = groupCompressed;
                full.e = emitterCompressed;

                full.es = emitterString;
                full.gs = groupString;

                console.log( full, JSON.stringify( full ).length );
            } );
    },

    uncompressSettings: function( compressionString ) {

    },

    menuItemHasClass: function( name, klass ) {
        return document.querySelector( 'li.' + name ).classList.contains( klass );
    },

    addStatusTextAttribute: function( el, text ) {
        el.setAttribute( CONFIG.statusTextAttribute, text );
    },

    captializeString: function( str ) {
        return str.charAt(0).toUpperCase() + str.slice(1);
    },

    getCurrentEmitter: function() {
        return {
            config: CONFIG.editor.emitter[ app.currentEmitterIndex ],
            instance: app.editor.particleEmitters[ app.currentEmitterIndex ]
        };
    },

    // jQuery 2.0's $.fn.extend method.
    // (c) jQuery team, 2014. MIT licensed.
    extend: function() {
        var options, name, src, copy, copyIsArray, clone,
            target = arguments[0] || {},
            i = 1,
            length = arguments.length,
            deep = false;

        // Handle a deep copy situation
        if ( typeof target === "boolean" ) {
            deep = target;

            // skip the boolean and the target
            target = arguments[ i ] || {};
            i++;
        }

        // Handle case when target is a string or something (possible in deep copy)
        if ( typeof target !== "object" && !jQuery.isFunction(target) ) {
            target = {};
        }

        // extend jQuery itself if only one argument is passed
        if ( i === length ) {
            target = this;
            i--;
        }

        for ( ; i < length; i++ ) {
            // Only deal with non-null/undefined values
            if ( (options = arguments[ i ]) != null ) {
                // Extend the base object
                for ( name in options ) {
                    src = target[ name ];
                    copy = options[ name ];

                    // Prevent never-ending loop
                    if ( target === copy ) {
                        continue;
                    }

                    // Recurse if we're merging plain objects or arrays
                    if ( deep && copy && ( typeof copy === 'object' || (copyIsArray = Array.isArray(copy)) ) ) {
                        if ( copyIsArray ) {
                            copyIsArray = false;
                            clone = src && Array.isArray(src) ? src : [];

                        } else {
                            clone = src && typeof src === 'object' ? src : {};
                        }

                        // Never move original objects, clone them
                        target[ name ] = utils.extend( deep, clone, copy );

                    // Don't bring in undefined values
                    } else if ( copy !== undefined ) {
                        target[ name ] = copy;
                    }
                }
            }
        }

        // Return the modified object
        return target;
    }
};