( function() {

    var setShaderStartMiddleEndAttribute = function( attributeName ) {
        var emitter = utils.getCurrentEmitter().instance,
            start = emitter.verticesIndex,
            end = start + emitter.particleCount,
            attributeValue = emitter.attributes[ attributeName ] ? emitter.attributes[ attributeName ].value : null;

        for ( var i = start; i < end; ++i ) {

            if ( emitter.attributes[ attributeName + 'Start' ] ) {
                emitter.attributes[ attributeName + 'Start' ].value[ i ] =
                    emitter.randomColor( emitter[ attributeName + 'Start' ], emitter[ attributeName + 'StartSpread' ] );

                emitter.attributes[ attributeName + 'Middle' ].value[ i ] =
                    emitter.randomColor( emitter[ attributeName + 'Middle' ], emitter[ attributeName + 'MiddleSpread' ] );

                emitter.attributes[ attributeName + 'End' ].value[ i ] =
                    emitter.randomColor( emitter[ attributeName + 'End' ], emitter[ attributeName + 'EndSpread' ] );

                emitter.attributes[ attributeName + 'Start' ].needsUpdate = true;
                emitter.attributes[ attributeName + 'Middle' ].needsUpdate = true;
                emitter.attributes[ attributeName + 'End' ].needsUpdate = true;
            }
            else if ( emitter.attributes[ attributeName ].value instanceof THREE.Vector3 ) {
                attributeValue[ i ].set(
                    Math.abs( emitter.randomFloat( emitter[ attributeName + 'Start' ], emitter[ attributeName + 'StartSpread' ] ) ),
                    Math.abs( emitter.randomFloat( emitter[ attributeName + 'Middle' ], emitter[ attributeName + 'MiddleSpread' ] ) ),
                    Math.abs( emitter.randomFloat( emitter[ attributeName + 'End' ], emitter[ attributeName + 'EndSpread' ] ) )
                );

                emitter.attributes[ attributeName ].needsUpdate = true;
            }
            else {
                attributeValue[ i ].set(
                    Math.abs( emitter.randomFloat( emitter[ attributeName + 'Start' ], emitter[ attributeName + 'StartSpread' ] ) ),
                    Math.abs( emitter.randomFloat( emitter[ attributeName + 'Middle' ], emitter[ attributeName + 'MiddleSpread' ] ) ),
                    Math.abs( emitter.randomFloat( emitter[ attributeName + 'End' ], emitter[ attributeName + 'EndSpread' ] ) ),
                    0
                );

                emitter.attributes[ attributeName ].needsUpdate = true;
            }
        }
    };

    var color = [],
        colorSpread = [];


    // Group settings
    app.events.on( 'setting:texture', function( value, event ) {
        value = value.toLowerCase();

        if ( value !== 'custom' ) {
            value = THREE.ImageUtils.loadTexture( 'res/img/' + value + '.png' );
            CONFIG.editor.group.texture = value;
            app.editor.particleGroup.uniforms.texture.value = value;
        }
    } );

    app.events.on( 'setting:maxAge', function( value, title ) {
        CONFIG.editor.group.maxAge = value;
        app.editor.recreateEmitters();
    } );

    app.events.on( 'setting:hasPerspective', function( value, title ) {
        CONFIG.editor.group.hasPerspective = !!value;
        app.editor.particleGroup.defines.hasPerspective = !!value;
        app.editor.recreateEmitters();
    } );

    app.events.on( 'setting:colorize', function( value, title ) {
        CONFIG.editor.group.colorize = !!value;
        app.editor.particleGroup.defines.colorize = !!value;
        app.editor.recreateEmitters();
    } );

    app.events.on( 'setting:transparent', function( value, title ) {
        CONFIG.editor.group.transparent = Number( !!value );
        app.editor.recreateEmitters();
    } );

    app.events.on( 'setting:depthWrite', function( value, title ) {
        CONFIG.editor.group.depthWrite = !!value;
        app.editor.recreateEmitters();
    } );

    app.events.on( 'setting:depthTest', function( value, title ) {
        CONFIG.editor.group.depthTest = !!value;
        app.editor.recreateEmitters();
    } );

    app.events.on( 'setting:blending', function( value, title ) {
        CONFIG.editor.group.blending = THREE[ value + 'Blending' ];
        app.editor.particleGroup.material.blending = THREE[ value + 'Blending' ];
        app.editor.particleGroup.material.needsUpdate = true;
    } );

    app.events.on( 'setting:alphaTest', function( value, title ) {
        CONFIG.editor.group.alphaTest = value;
        app.editor.particleGroup.material.alphaTest = value;
        app.editor.particleGroup.material.needsUpdate = true;
    } );


    // General emitter settings
    app.events.on( 'setting:type', function( value, isRestore ) {
        value = value.toLowerCase();

        var emitter = utils.getCurrentEmitter();

        // Store the previous value in the history object.
        if ( !isRestore ) {
            app.history.add( 'setting:type', emitter.config.type );
        }
        else {
            app.settings.setSingleAttribute( true, 'type', null, value );
        }


        emitter.config.type = value;
        emitter.instance.type = value;
        app.settings.showOnlyApplicableRollups( value );

        if ( value === 'disk' || value === 'sphere' ) {
            var velocity = emitter.instance.attributes.velocity.value,
                acceleration = emitter.instance.attributes.acceleration.value;

            for ( var i = 0; i < velocity.length; ++i ) {
                velocity[ i ].set( 0, 0, 0 );
                acceleration[ i ].set( 0, 0, 0 );
            }

            emitter.config.acceleration.set( 0, 0, 0 );
            emitter.config.velocity.set( 0, 0, 0 );
        }

        if ( utils.getCurrentEmitter().instance.isStatic ) {
            app.editor.recreateEmitters();
        }
    } );

    app.events.on( 'setting:particleCount', function( value, title, isStartEvent, isRestore ) {
        var emitter = utils.getCurrentEmitter();

        // Store the previous value in the history object.
        if ( isStartEvent && !isRestore ) {
            app.history.add( 'setting:particleCount', emitter.config.particleCount, title, isStartEvent );
        }
        else if ( isRestore ) {
            app.settings.setSingleAttribute( true, 'particleCount', null, value );
        }


        emitter.config.particleCount = value;
        app.editor.recreateEmitters();
    } );

    app.events.on( 'setting:alive', function( value, title, isStartEvent, isRestore ) {
        var emitter = utils.getCurrentEmitter();

        // Store the previous value in the history object.
        if ( isStartEvent && !isRestore ) {
            app.history.add( 'setting:alive', emitter.config.alive, title, isStartEvent );
        }
        else if ( isRestore ) {
            app.settings.setSingleAttribute( true, 'alive', null, value );
        }

        emitter.config.alive = value;
        emitter.instance.alive = value;
    } );

    app.events.on( 'setting:duration', function( value, title, isStartEvent, isRestore ) {
        var emitter = utils.getCurrentEmitter();

        // Store the previous value in the history object.
        if ( isStartEvent && !isRestore ) {
            app.history.add( 'setting:duration', emitter.config.duration, title, isStartEvent );
        }
        else if ( isRestore ) {
            app.settings.setSingleAttribute( true, 'duration', null, value );
        }

        emitter.config.duration = value || null;
        emitter.instance.duration = value || null;
        emitter.instance.age = 0.0;
        emitter.instance.alive = 1;
    } );

    app.events.on( 'setting:static', function( value, isRestore ) {
        var emitter = utils.getCurrentEmitter();

        // Store the previous value in the history object.
        if ( !isRestore ) {
            app.history.add( 'setting:static', emitter.config.isStatic );
        }
        else {
            app.settings.setSingleAttribute( true, 'isStatic', null, value );
        }

        emitter.config.isStatic = Number( value );
        emitter.instance.isStatic = Number( value );
        app.editor.recreateEmitters();
    } );


    // Positioning
    app.events.on( 'setting:position', function( value, title, isStartEvent, isRestore ) {
        var emitter = utils.getCurrentEmitter();

        title = title.replace( ':', '' );

        // Store the previous value in the history object.
        if ( isStartEvent && !isRestore ) {
            app.history.add( 'setting:position', emitter.config.position[ title ], title, isStartEvent );
        }
        else if ( isRestore ) {
            app.settings.setSingleAttribute( true, 'position', title, value );
        }

        emitter.config.position[ title ] = value;
        emitter.instance.position[ title ] = value;
    } );

    app.events.on( 'setting:positionSpread', function( value, title, isStartEvent, isRestore ) {
        var emitter = utils.getCurrentEmitter();

        title = title.replace( ':', '' );

        // Store the previous value in the history object.
        if ( isStartEvent && !isRestore ) {
            app.history.add( 'setting:positionSpread', emitter.config.positionSpread[ title ], title, isStartEvent );
        }
        else if ( isRestore ) {
            app.settings.setSingleAttribute( true, 'positionSpread', title, value );
        }

        emitter.config.positionSpread[ title ] = value;
        emitter.instance.positionSpread[ title ] = value;
        app.editor._updateFocusMesh();
    } );

    app.events.on( 'setting:radius', function( value, title, isStartEvent, isRestore ) {
        var emitter = utils.getCurrentEmitter();

        // Store the previous value in the history object.
        if ( isStartEvent && !isRestore ) {
            app.history.add( 'setting:radius', emitter.config.radius, title, isStartEvent );
        }
        else if ( isRestore ) {
            app.settings.setSingleAttribute( true, 'radius', null, value );
        }

        emitter.config.radius = value;
        emitter.instance.radius = value;
    } );

    app.events.on( 'setting:radiusSpread', function( value, title, isStartEvent, isRestore ) {
        var emitter = utils.getCurrentEmitter();

        // Store the previous value in the history object.
        if ( isStartEvent && !isRestore ) {
            app.history.add( 'setting:radiusSpread', emitter.config.radiusSpread, title, isStartEvent );
        }
        else if ( isRestore ) {
            app.settings.setSingleAttribute( true, 'radiusSpread', null, value );
        }

        emitter.config.radiusSpread = value;
        emitter.instance.radiusSpread = value;
    } );

    app.events.on( 'setting:radiusSpreadClamp', function( value, title, isStartEvent, isRestore ) {
        var emitter = utils.getCurrentEmitter();

        // Store the previous value in the history object.
        if ( isStartEvent && !isRestore ) {
            app.history.add( 'setting:radiusSpreadClamp', emitter.config.radiusSpreadClamp, title, isStartEvent );
        }
        else if ( isRestore ) {
            app.settings.setSingleAttribute( true, 'radiusSpreadClamp', null, value );
        }

        emitter.config.radiusSpreadClamp = value;
        emitter.instance.radiusSpreadClamp = value;
    } );

    app.events.on( 'setting:radiusScale', function( value, title, isStartEvent, isRestore ) {
        var emitter = utils.getCurrentEmitter();

        title = title.replace( ':', '' );

        // Store the previous value in the history object.
        if ( isStartEvent && !isRestore ) {
            app.history.add( 'setting:radiusScale', emitter.config.radiusScale[ title ], title, isStartEvent );
        }
        else if ( isRestore ) {
            app.settings.setSingleAttribute( true, 'radiusScale', title, value );
        }

        emitter.config.radiusScale[ title ] = value;
        emitter.instance.radiusScale[ title ] = value;
    } );


    // Movement
    app.events.on( 'setting:acceleration', function( value, title, isStartEvent, isRestore ) {
        var emitter = utils.getCurrentEmitter();

        title = title.replace( ':', '' );

        // Store the previous value in the history object.
        if ( isStartEvent && !isRestore ) {
            app.history.add( 'setting:acceleration', emitter.config.acceleration[ title ], title, isStartEvent );
        }
        else if ( isRestore ) {
            app.settings.setSingleAttribute( true, 'acceleration', title, value );
        }

        emitter.config.acceleration[ title ] = value;
        emitter.instance.acceleration[ title ] = value;
        app.editor._updateFocusMesh();
    } );

    app.events.on( 'setting:accelerationSpread', function( value, title, isStartEvent, isRestore ) {
        var emitter = utils.getCurrentEmitter();

        title = title.replace( ':', '' );

        // Store the previous value in the history object.
        if ( isStartEvent && !isRestore ) {
            app.history.add( 'setting:accelerationSpread', emitter.config.accelerationSpread[ title ], title, isStartEvent );
        }
        else if ( isRestore ) {
            app.settings.setSingleAttribute( true, 'accelerationSpread', title, value );
        }

        emitter.config.accelerationSpread[ title ] = value;
        emitter.instance.accelerationSpread[ title ] = value;
        app.editor._updateFocusMesh();
    } );

    app.events.on( 'setting:velocity', function( value, title, isStartEvent, isRestore ) {
        var emitter = utils.getCurrentEmitter();

        title = title.replace( ':', '' );

        // Store the previous value in the history object.
        if ( isStartEvent && !isRestore ) {
            app.history.add( 'setting:velocity', emitter.config.velocity[ title ], title, isStartEvent );
        }
        else if ( isRestore ) {
            app.settings.setSingleAttribute( true, 'velocity', title, value );
        }

        emitter.config.velocity[ title ] = value;
        emitter.instance.velocity[ title ] = value;
        app.editor._updateFocusMesh();
    } );

    app.events.on( 'setting:velocitySpread', function( value, title, isStartEvent, isRestore ) {
        var emitter = utils.getCurrentEmitter();

        title = title.replace( ':', '' );

        // Store the previous value in the history object.
        if ( isStartEvent && !isRestore ) {
            app.history.add( 'setting:velocitySpread', emitter.config.velocitySpread[ title ], title, isStartEvent );
        }
        else if ( isRestore ) {
            app.settings.setSingleAttribute( true, 'velocitySpread', title, value );
        }

        emitter.config.velocitySpread[ title ] = value;
        emitter.instance.velocitySpread[ title ] = value;
        app.editor._updateFocusMesh();
    } );

    app.events.on( 'setting:speed', function( value, title, isStartEvent, isRestore ) {
        var emitter = utils.getCurrentEmitter();

        // Store the previous value in the history object.
        if ( isStartEvent && !isRestore ) {
            app.history.add( 'setting:speed', emitter.config.speed, title, isStartEvent );
        }
        else if ( isRestore ) {
            app.settings.setSingleAttribute( true, 'speed', null, value );
        }

        emitter.config.speed = value;
        emitter.instance.speed = value;
    } );

    app.events.on( 'setting:speedSpread', function( value, title, isStartEvent, isRestore ) {
        var emitter = utils.getCurrentEmitter();

        // Store the previous value in the history object.
        if ( isStartEvent && !isRestore ) {
            app.history.add( 'setting:speedSpread', emitter.config.speedSpread, title, isStartEvent );
        }
        else if ( isRestore ) {
            app.settings.setSingleAttribute( true, 'speedSpread', null, value );
        }

        emitter.config.speedSpread = value;
        emitter.instance.speedSpread = value;
    } );


    // Sizing
    app.events.on( 'setting:size', function( value, title, isStartEvent, isRestore ) {
        var emitter = utils.getCurrentEmitter();

        title = title.replace( ':', '' );

        // Store the previous value in the history object.
        if ( isStartEvent && !isRestore ) {
            app.history.add( 'setting:size', emitter.config[ 'size' + title ], title, isStartEvent );
        }
        else if ( isRestore ) {
            app.settings.setSingleAttribute( true, 'size', title, value );
        }



        var component = 'size' + title;

        emitter.config[ component ] = value;
        emitter.instance[ component ] = value;
        setShaderStartMiddleEndAttribute( 'size' );
    } );

    app.events.on( 'setting:sizeSpread', function( value, title, isStartEvent, isRestore ) {
        var emitter = utils.getCurrentEmitter();

        title = title.replace( ':', '' );

        // Store the previous value in the history object.
        if ( isStartEvent && !isRestore ) {
            app.history.add( 'setting:sizeSpread', emitter.config[ 'size' + title + 'Spread' ], title, isStartEvent );
        }
        else if ( isRestore ) {
            app.settings.setSingleAttribute( true, 'sizeSpread', title, value );
        }



        var component = 'size' + title + 'Spread';

        emitter.config[ component ] = value;
        emitter.instance[ component ] = value;
        setShaderStartMiddleEndAttribute( 'size' );
    } );

    // Opacity
    app.events.on( 'setting:opacity', function( value, title, isStartEvent, isRestore ) {
        var emitter = utils.getCurrentEmitter();

        title = title.replace( ':', '' );

        // Store the previous value in the history object.
        if ( isStartEvent && !isRestore ) {
            app.history.add( 'setting:opacity', emitter.config[ 'opacity' + title ], title, isStartEvent );
        }
        else if ( isRestore ) {
            app.settings.setSingleAttribute( true, 'opacity', title, value );
        }



        var component = 'opacity' + title;


        emitter.config[ component ] = value;
        emitter.instance[ component ] = value;
        setShaderStartMiddleEndAttribute( 'opacity' );
    } );

    app.events.on( 'setting:opacitySpread', function( value, title, isStartEvent, isRestore ) {
        var emitter = utils.getCurrentEmitter();

        title = title.replace( ':', '' );

        // Store the previous value in the history object.
        if ( isStartEvent && !isRestore ) {
            app.history.add( 'setting:opacitySpread', emitter.config[ 'opacity' + title + 'Spread' ], title, isStartEvent );
        }
        else if ( isRestore ) {
            app.settings.setSingleAttribute( true, 'opacitySpread', title, value );
        }



        var component = 'opacity' + title + 'Spread';

        emitter.config[ component ] = value;
        emitter.instance[ component ] = value;
        setShaderStartMiddleEndAttribute( 'opacity' );
    } );

    // Angle
    app.events.on( 'setting:angle', function( value, title, isStartEvent, isRestore ) {
        var emitter = utils.getCurrentEmitter();

        title = title.replace( ':', '' );

        // Store the previous value in the history object.
        if ( isStartEvent && !isRestore ) {
            app.history.add( 'setting:angle', emitter.config[ 'angle' + title ], title, isStartEvent );
        }
        else if ( isRestore ) {
            app.settings.setSingleAttribute( true, 'angle', title, value );
        }



        var component = 'angle' + title;

        emitter.config[ component ] = value;
        emitter.instance[ component ] = value;
        setShaderStartMiddleEndAttribute( 'angle' );
    } );

    app.events.on( 'setting:angleSpread', function( value, title, isStartEvent, isRestore ) {
        var emitter = utils.getCurrentEmitter();

        title = title.replace( ':', '' );

        // Store the previous value in the history object.
        if ( isStartEvent && !isRestore ) {
            app.history.add( 'setting:angleSpread', emitter.config[ 'angle' + title + 'Spread' ], title, isStartEvent );
        }
        else if ( isRestore ) {
            app.settings.setSingleAttribute( true, 'angleSpread', title, value );
        }



        var component = 'angle' + title + 'Spread';

        emitter.config[ component ] = value;
        emitter.instance[ component ] = value;
        setShaderStartMiddleEndAttribute( 'angle' );
    } );


    // Color
    app.events.on( 'setting:color', function( value, title ) {
        var emitter = utils.getCurrentEmitter();

        for ( var i = 0; i < value.length; ++i ) {
            color[ i ] = value[ i ] / 255;
        }

        title = 'color' + title.replace( ':', '' );
        emitter.config[ title ].fromArray( color );
        emitter.instance[ title ].fromArray( color );
        setShaderStartMiddleEndAttribute( 'color' );
    } );

    app.events.on( 'setting:colorSpread', function( value, title ) {
        var emitter = utils.getCurrentEmitter();

        title = 'color' + title.replace( ':', '' ) + 'Spread';
        emitter.config[ title ].set( value, value, value );
        emitter.instance[ title ].set( value, value, value );
        setShaderStartMiddleEndAttribute( 'color' );
    } );

}() );