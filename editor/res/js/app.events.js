(function() {

    var setShaderStartMiddleEndAttribute = function( attributeName ) {
        var emitter = utils.getCurrentEmitter().instance,
            start = emitter.verticesIndex,
            end = start + emitter.particleCount,
            attributeValue = emitter.attributes[ attributeName ] ? emitter.attributes[ attributeName ].value : null;

        for( var i = start; i < end; ++i ) {

            if( emitter.attributes[ attributeName + 'Start' ] ) {
                emitter.attributes[ attributeName + 'Start' ].value[ i ] =
                    emitter._randomColor( emitter[ attributeName + 'Start' ], emitter[ attributeName + 'StartSpread' ] );

                emitter.attributes[ attributeName + 'Middle' ].value[ i ] =
                    emitter._randomColor( emitter[ attributeName + 'Middle' ], emitter[ attributeName + 'MiddleSpread' ] );

                emitter.attributes[ attributeName + 'End' ].value[ i ] =
                    emitter._randomColor( emitter[ attributeName + 'End' ], emitter[ attributeName + 'EndSpread' ] );

                emitter.attributes[ attributeName + 'Start' ].needsUpdate = true;
                emitter.attributes[ attributeName + 'Middle' ].needsUpdate = true;
                emitter.attributes[ attributeName + 'End' ].needsUpdate = true;
            }
            else if( emitter.attributes[ attributeName ].value instanceof THREE.Vector3 ) {
                attributeValue[ i ].set(
                    Math.abs( emitter._randomFloat( emitter[ attributeName + 'Start' ],     emitter[ attributeName + 'StartSpread' ] ) ),
                    Math.abs( emitter._randomFloat( emitter[ attributeName + 'Middle' ],    emitter[ attributeName + 'MiddleSpread' ] ) ),
                    Math.abs( emitter._randomFloat( emitter[ attributeName + 'End' ],       emitter[ attributeName + 'EndSpread' ] ) )
                );

                emitter.attributes[ attributeName ].needsUpdate = true;
            }
            else {
                attributeValue[ i ].set(
                    Math.abs( emitter._randomFloat( emitter[ attributeName + 'Start' ],     emitter[ attributeName + 'StartSpread' ] ) ),
                    Math.abs( emitter._randomFloat( emitter[ attributeName + 'Middle' ],    emitter[ attributeName + 'MiddleSpread' ] ) ),
                    Math.abs( emitter._randomFloat( emitter[ attributeName + 'End' ],       emitter[ attributeName + 'EndSpread' ] ) ),
                    0
                );

                emitter.attributes[ attributeName ].needsUpdate = true;
            }
        }
    };

    var color = [],
        colorSpread = [];


    // General
    app.events.on( 'setting:type', function( value ) {
        value = value.toLowerCase();

        var emitter = utils.getCurrentEmitter();

        emitter.config.type = value;
        emitter.instance.type = value;
        app.settings.showOnlyApplicableRollups( value );

        if( value === 'disk' || value === 'sphere' ) {
            var velocity = emitter.instance.attributes.velocity.value,
                acceleration = emitter.instance.attributes.acceleration.value;

            for( var i = 0; i < velocity.length; ++i ) {
                velocity[ i ].set( 0, 0, 0 );
                acceleration[ i ].set( 0, 0, 0 );
            }

            emitter.config.acceleration.set( 0, 0, 0 );
            emitter.config.velocity.set( 0, 0, 0 );
        }
    } );

    app.events.on( 'setting:texture', function( value, event ) {
        value = value.toLowerCase();

        if( value !== 'custom' ) {
            value = THREE.ImageUtils.loadTexture( 'res/img/' + value + '.png' );
            CONFIG.editor.group.texture = value;
            app.editor.particleGroup.uniforms.texture.value = value;
        }
    } );

    app.events.on( 'setting:particleCount', function( value, title ) {
        var emitter = utils.getCurrentEmitter();

        emitter.config.particleCount = value;
        app.editor.recreateEmitters();
    } );

    app.events.on( 'setting:alive', function( value, title ) {
        var emitter = utils.getCurrentEmitter();

        emitter.config.alive = value;
        emitter.instance.alive = value;
    } );

    app.events.on( 'setting:maxAge', function( value, title ) {
        CONFIG.editor.group.maxAge = value;
        app.editor.recreateEmitters();
    } );

    app.events.on( 'setting:duration', function( value, title ) {
        var emitter = utils.getCurrentEmitter();

        emitter.config.duration = value || null;
        emitter.instance.age = 0.0;
        emitter.instance.duration = value || null;
        emitter.instance.alive = 1;
    } );

    app.events.on( 'setting:hasPerspective', function( value, title ) {
        CONFIG.editor.group.hasPerspective = Number( !!value );
        app.editor.particleGroup.uniforms.hasPerspective.value = value;
    } );


    app.events.on( 'setting:colorize', function( value, title ) {
        CONFIG.editor.group.colorize = Number( !!value );
        app.editor.particleGroup.uniforms.colorize.value = value;
    } );

    app.events.on( 'setting:transparent', function( value, title ) {
        CONFIG.editor.group.transparent = Number( !!value );
        app.editor._createParticles();
    } );


    app.events.on( 'setting:depthWrite', function( value, title ) {
        CONFIG.editor.group.depthWrite = !!value;
        app.editor._createParticles();
    } );


    app.events.on( 'setting:depthTest', function( value, title ) {
        CONFIG.editor.group.depthTest = !!value;
        app.editor._createParticles();
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




    // Positioning
    app.events.on( 'setting:position', function( value, title ) {
        var emitter = utils.getCurrentEmitter();

        title = title.replace( ':', '' );

        emitter.config.position[ title ] = value;
    	emitter.instance.position[ title ] = value;
    } );

    app.events.on( 'setting:positionSpread', function( value, title ) {
        var emitter = utils.getCurrentEmitter();

        title = title.replace( ':', '' );

        emitter.config.positionSpread[ title ] = value;
        emitter.instance.positionSpread[ title ] = value;
        app.editor._updateFocusMesh();
    } );

    app.events.on( 'setting:radius', function( value, title ) {
        var emitter = utils.getCurrentEmitter();

        emitter.config.radius = value;
        emitter.instance.radius = value;
    } );

    app.events.on( 'setting:radiusSpread', function( value, title ) {
        var emitter = utils.getCurrentEmitter();

        emitter.config.radiusSpread = value;
        emitter.instance.radiusSpread = value;
    } );

    app.events.on( 'setting:radiusSpreadClamp', function( value, title ) {
        var emitter = utils.getCurrentEmitter();

        emitter.config.radiusSpreadClamp = value;
        emitter.instance.radiusSpreadClamp = value;
    } );

    app.events.on( 'setting:radiusScale', function( value, title ) {
        var emitter = utils.getCurrentEmitter();

        title = title.replace( ':', '' );
        emitter.config.radiusScale[ title ] = value;
        emitter.instance.radiusScale[ title ] = value;
    } );


    // Movement
    app.events.on( 'setting:acceleration', function( value, title ) {
        var emitter = utils.getCurrentEmitter();

        title = title.replace( ':', '' );

        emitter.config.acceleration[ title ] = value;
        emitter.instance.acceleration[ title ] = value;
        app.editor._updateFocusMesh();
    } );

    app.events.on( 'setting:accelerationSpread', function( value, title ) {
        var emitter = utils.getCurrentEmitter();

        title = title.replace( ':', '' );
        emitter.config.accelerationSpread[ title ] = value;
        emitter.instance.accelerationSpread[ title ] = value;
        app.editor._updateFocusMesh();
    } );

    app.events.on( 'setting:velocity', function( value, title ) {
        var emitter = utils.getCurrentEmitter();

        title = title.replace( ':', '' )
        emitter.config.velocity[ title ] = value;
        emitter.instance.velocity[ title ] = value;
        app.editor._updateFocusMesh();
    } );

    app.events.on( 'setting:velocitySpread', function( value, title ) {
        var emitter = utils.getCurrentEmitter();

        title = title.replace( ':', '' )
        emitter.config.velocitySpread[ title ] = value;
        emitter.instance.velocitySpread[ title ] = value;
        app.editor._updateFocusMesh();
    } );

    app.events.on( 'setting:speed', function( value, title ) {
        var emitter = utils.getCurrentEmitter();

        emitter.config.speed = value;
        emitter.instance.speed = value;
    } );

    app.events.on( 'setting:speedSpread', function( value, title ) {
        var emitter = utils.getCurrentEmitter();

        emitter.config.speedSpread = value;
        emitter.instance.speedSpread = value;
    } );


    // Sizing
    app.events.on( 'setting:size', function( value, title ) {
        var emitter = utils.getCurrentEmitter();

        title = 'size' + title.replace( ':', '' );
        emitter.config[ title ] = value;
        emitter.instance[ title ] = value;
        setShaderStartMiddleEndAttribute( 'size' );
    } );

    app.events.on( 'setting:sizeSpread', function( value, title ) {
        var emitter = utils.getCurrentEmitter();

        title = 'size' + title.replace( ':', '' ) + 'Spread';
        emitter.config[ title ] = value;
        emitter.instance[ title ] = value;
        setShaderStartMiddleEndAttribute( 'size' );
    } );

    // Opacity
    app.events.on( 'setting:opacity', function( value, title ) {
        var emitter = utils.getCurrentEmitter();

        title = 'opacity' + title.replace( ':', '' );
        emitter.config[ title ] = value;
        emitter.instance[ title ] = value;
        setShaderStartMiddleEndAttribute( 'opacity' );
    } );

    app.events.on( 'setting:opacitySpread', function( value, title ) {
        var emitter = utils.getCurrentEmitter();

        title = 'opacity' + title.replace( ':', '' ) + 'Spread';
        emitter.config[ title ] = value;
        emitter.instance[ title ] = value;
        setShaderStartMiddleEndAttribute( 'opacity' );
    } );

    // Angle
    app.events.on( 'setting:angle', function( value, title ) {
        var emitter = utils.getCurrentEmitter();

        title = 'angle' + title.replace( ':', '' );
        emitter.config[ title ] = value;
        emitter.instance[ title ] = value;
        setShaderStartMiddleEndAttribute( 'angle' );
    } );

    app.events.on( 'setting:angleSpread', function( value, title ) {
        var emitter = utils.getCurrentEmitter();

        title = 'angle' + title.replace( ':', '' ) + 'Spread';
        emitter.config[ title ] = value;
        emitter.instance[ title ] = value;
        setShaderStartMiddleEndAttribute( 'angle' );
    } );

    app.events.on( 'setting:color', function( value, title ) {
        var emitter = utils.getCurrentEmitter();

        for( var i = 0; i < value.length; ++i ) {
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



    // Menu items
    app.events.on( 'menu:new', function() {
        var emitter = CONFIG.editor.emitter[ app.currentEmitterIndex ],
            group = CONFIG.editor.group;


        for( var i in group ) {
            group[ i ] = CONFIG.editor.defaultGroup[ i ];
        }

        for( var i in emitter ) {
            if( typeof emitter[ i ] === 'string' || typeof emitter[ i ] === 'number' ) {
                emitter[ i ] = CONFIG.editor.defaultEmitter[ i ];
            }
            else if( emitter[ i ] instanceof THREE.Vector3 ) {
                emitter[ i ].copy( CONFIG.editor.defaultEmitter[ i ] );
            }
            else if( emitter[ i ] instanceof THREE.Color ) {
                emitter[ i ].copy( CONFIG.editor.defaultEmitter[ i ] );
            }
            else {
                emitter[ i ] = CONFIG.editor.defaultEmitter[ i ];
            }
        }

        app.settings.setAttributesFromMap( CONFIG.editor );

        app.events.fire( 'menu:frameEmitter' );
    } );

    app.events.on( 'menu:export', function() {
        app.files.export( CONFIG.editor.group, CONFIG.editor.emitter );
    } );



    app.events.on( 'menu:centerEmitter', function() {
        app.editor.controls.focus( app.editor.focusMesh );
    } );

    app.events.on( 'menu:frameEmitter', function() {
        app.editor.controls.focus( app.editor.focusMesh, true );
    } );


    app.events.on( 'toggleSettingsPanel', function( isClosed ) {
        setTimeout( function() {
            app.editor._onResize(
                null,
                window.innerWidth - ( isClosed ? 0 : 320 ),
                window.innerHeight
            );
        }, !isClosed ? 500 : 0 );
    } );


    app.events.on( 'menu:showGrid', function() {
        var active = utils.menuItemHasClass( 'showGrid', 'on' );

        CONFIG.showGrid = active;

        if( active ) {
            app.editor._updateFocusMesh();
            app.editor.grid.visible = true;
        }
        else {
            app.editor.grid.visible = false;
        }
    } );

    app.events.on( 'menu:adaptiveGrid', function() {
        var active = utils.menuItemHasClass( 'adaptiveGrid', 'on' );

        CONFIG.adaptiveGrid = active;
        app.editor._createGrid();
    } );

    app.events.on( 'menu:showEmitterBoundingBox', function() {
        var active = utils.menuItemHasClass( 'showEmitterBoundingBox', 'on' );

        CONFIG.showEmitterBoundingBox = active;

        if( active ) {
            app.editor.focusMesh.material.opacity = CONFIG.emitterBoundingBoxOpacity;
        }
        else {
            app.editor.focusMesh.material.opacity = 0;
        }
    } );

    app.events.on( 'menu:slidersSetValueOnMouseDown', function() {
        var active = utils.menuItemHasClass( 'slidersSetValueOnMouseDown', 'on' );

        CONFIG.slidersSetValueOnMouseDown = active;
    } );



    // Emitter Selector
    app.events.on( 'settings:emitterSelector:left', function() {
        if( --app.currentEmitterIndex < 0 ) {
            app.currentEmitterIndex = 0;
            app.settings.emitterSelector.updateArrows();
            app.settings.emitterSelector.updateName();
            return;
        }

        app.settings.emitterSelector.updateName();
        app.settings.setAttributesFromMap( CONFIG.editor );
        app.settings.emitterSelector.updateArrows();
    } );

    app.events.on( 'settings:emitterSelector:right', function() {
        if( ++app.currentEmitterIndex === CONFIG.editor.emitter.length ) {
            app.currentEmitterIndex = CONFIG.editor.emitter.length - 1;
            app.settings.emitterSelector.updateArrows();
            app.settings.emitterSelector.updateName();
            return;
        }

        app.settings.emitterSelector.updateName();
        app.settings.setAttributesFromMap( CONFIG.editor );
        app.settings.emitterSelector.updateArrows();
    } );


    app.events.on( 'settings:emitterSelector:add', function() {
        ++app.currentEmitterIndex;

        var emitter = {},
            globalSettings = CONFIG.editor.globalSettings,
            cubeSettings = CONFIG.editor.cubeSettings,
            sphereDiskSettings = CONFIG.editor.sphereDiskSettings,
            defaultEmitter = CONFIG.editor.defaultEmitter,
            setting;

        for( var i = 0; i < globalSettings.length; ++i ) {
            setting = globalSettings[ i ];

            if( typeof defaultEmitter[ setting ] === 'string' || typeof defaultEmitter[ setting ] === 'number' ) {
                emitter[ setting ] = defaultEmitter[ setting ];
            }
            else if( defaultEmitter[ setting ] instanceof THREE.Vector3 ) {
                emitter[ setting ] = new THREE.Vector3();
                emitter[ setting ].copy( defaultEmitter[ setting ] );
            }
            else if( defaultEmitter[ setting ] instanceof THREE.Color ) {
                emitter[ setting ] = new THREE.Color();
                emitter[ setting ].copy( defaultEmitter[ setting ] );
            }
            else {
                emitter[ setting ] = defaultEmitter[ setting ];
            }
        }

        for( var i = 0; i < cubeSettings.length; ++i ) {
            setting = cubeSettings[ i ];

            if( typeof defaultEmitter[ setting ] === 'string' || typeof defaultEmitter[ setting ] === 'number' ) {
                emitter[ setting ] = defaultEmitter[ setting ];
            }
            else if( defaultEmitter[ setting ] instanceof THREE.Vector3 ) {
                emitter[ setting ] = new THREE.Vector3();
                emitter[ setting ].copy( defaultEmitter[ setting ] );
            }
            else if( defaultEmitter[ setting ] instanceof THREE.Color ) {
                emitter[ setting ] = new THREE.Color();
                emitter[ setting ].copy( defaultEmitter[ setting ] );
            }
            else {
                emitter[ setting ] = defaultEmitter[ setting ];
            }
        }

        for( var i = 0; i < sphereDiskSettings.length; ++i ) {
            setting = sphereDiskSettings[ i ];

            if( typeof defaultEmitter[ setting ] === 'string' || typeof defaultEmitter[ setting ] === 'number' ) {
                emitter[ setting ] = defaultEmitter[ setting ];
            }
            else if( defaultEmitter[ setting ] instanceof THREE.Vector3 ) {
                emitter[ setting ] = new THREE.Vector3();
                emitter[ setting ].copy( defaultEmitter[ setting ] );
            }
            else if( defaultEmitter[ setting ] instanceof THREE.Color ) {
                emitter[ setting ] = new THREE.Color();
                emitter[ setting ].copy( defaultEmitter[ setting ] );
            }
            else {
                emitter[ setting ] = defaultEmitter[ setting ];
            }
        }

        CONFIG.editor.emitter.push( emitter );

        app.editor.recreateEmitters();
        app.settings.emitterSelector.updateName();
        app.settings.setAttributesFromMap( CONFIG.editor );
        app.settings.emitterSelector.updateArrows();
    } );


    app.events.on( 'settings:emitterSelector:nameChange', function( value ) {
        CONFIG.editor.names[ app.currentEmitterIndex ] = value;
    } );
}());