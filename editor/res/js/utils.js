var utils = {
    noop: function() {},

    settingIsEqual: function( a, b ) {
        if( typeof a === 'number' ) {
            return a === b;
        }
        else if( a instanceof THREE.Vector3 || a instanceof THREE.Color ) {
            return a.equals( b );
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
            emitterCompressed = {},
            full = {},
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

                for( var i in emitter ) {
                    if( emitter[ i ] instanceof THREE.Vector3 || emitter[ i ] instanceof THREE.Color ) {
                        emitterCompressed[ emitterCompressKeys[ i ] ] = emitter[ i ].toArray().toString();
                    }
                    else {
                        emitterCompressed[ emitterCompressKeys[ i ] ] = emitter[ i ];
                    }
                }

                full.g = groupCompressed;
                full.e = emitterCompressed;

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
    }
};