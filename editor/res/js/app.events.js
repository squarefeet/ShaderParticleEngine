(function() {

    var setShaderStartMiddleEndAttribute = function( attributeName ) {
        var emitter = app.editor.particleEmitter,
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
    app.events.on( 'setting:particleCount', function( value, title ) {
        CONFIG.editor.emitter.particleCount = value;
        app.editor._createParticles();
    } );

    app.events.on( 'setting:maxAge', function( value, title ) {
        CONFIG.editor.group.maxAge = value;
        app.editor._createParticles();
    } );

    app.events.on( 'setting:duration', function( value, title ) {
        app.editor.particleEmitter.age = 0.0;
        app.editor.particleEmitter.duration = value || null;
        app.editor.particleEmitter.alive = 1;
    } );


    // Positioning
    app.events.on( 'setting:position', function( value, title ) {
    	app.editor.particleEmitter.position[ title.replace( ':', '' ) ] = value;
    } );

    app.events.on( 'setting:positionSpread', function( value, title ) {
        app.editor.particleEmitter.positionSpread[ title.replace( ':', '' ) ] = value;
        app.editor._updateFocusMesh();
    } );

    app.events.on( 'setting:radius', function( value, title ) {
        app.editor.particleEmitter.radius = value;
    } );

    app.events.on( 'setting:radiusSpread', function( value, title ) {
        app.editor.particleEmitter.radiusSpread = value;
    } );

    app.events.on( 'setting:radiusSpreadClamp', function( value, title ) {
        app.editor.particleEmitter.radiusSpreadClamp = value;
    } );

    app.events.on( 'setting:radiusScale', function( value, title ) {
        app.editor.particleEmitter.radiusScale[ title.replace( ':', '' ) ] = value;
    } );


    // Movement
    app.events.on( 'setting:acceleration', function( value, title ) {
        app.editor.particleEmitter.acceleration[ title.replace( ':', '' ) ] = value;
        app.editor._updateFocusMesh();
    } );

    app.events.on( 'setting:accelerationSpread', function( value, title ) {
        app.editor.particleEmitter.accelerationSpread[ title.replace( ':', '' ) ] = value;
        app.editor._updateFocusMesh();
    } );

    app.events.on( 'setting:velocity', function( value, title ) {
        app.editor.particleEmitter.velocity[ title.replace( ':', '' ) ] = value;
        app.editor._updateFocusMesh();
    } );

    app.events.on( 'setting:velocitySpread', function( value, title ) {
        app.editor.particleEmitter.velocitySpread[ title.replace( ':', '' ) ] = value;
        app.editor._updateFocusMesh();
    } );

    app.events.on( 'setting:speed', function( value, title ) {
        app.editor.particleEmitter.speed = value;
    } );

    app.events.on( 'setting:speedSpread', function( value, title ) {
        app.editor.particleEmitter.speedSpread = value;
    } );


    // Sizing
    app.events.on( 'setting:size', function( value, title ) {
        app.editor.particleEmitter[ 'size' + title.replace( ':', '' ) ] = value;
        setShaderStartMiddleEndAttribute( 'size' );
    } );

    app.events.on( 'setting:sizeSpread', function( value, title ) {
        app.editor.particleEmitter[ 'size' + title.replace( ':', '' ) + 'Spread' ] = value;
        setShaderStartMiddleEndAttribute( 'size' );
    } );

    // Opacity
    app.events.on( 'setting:opacity', function( value, title ) {
        app.editor.particleEmitter[ 'opacity' + title.replace( ':', '' ) ] = value;
        setShaderStartMiddleEndAttribute( 'opacity' );
    } );

    app.events.on( 'setting:opacitySpread', function( value, title ) {
        app.editor.particleEmitter[ 'opacity' + title.replace( ':', '' ) + 'Spread' ] = value;
        setShaderStartMiddleEndAttribute( 'opacity' );
    } );

    // Angle
    app.events.on( 'setting:angle', function( value, title ) {
        app.editor.particleEmitter[ 'angle' + title.replace( ':', '' ) ] = value;
        setShaderStartMiddleEndAttribute( 'angle' );
    } );

    app.events.on( 'setting:angleSpread', function( value, title ) {
        app.editor.particleEmitter[ 'angle' + title.replace( ':', '' ) + 'Spread' ] = value;
        setShaderStartMiddleEndAttribute( 'angle' );
    } );

    app.events.on( 'setting:color', function( value, title ) {
        for( var i = 0; i < value.length; ++i ) {
            color[ i ] = value[ i ] / 255;
        }

        app.editor.particleEmitter[ 'color' + title.replace( ':', '' ) ].fromArray( color );
        setShaderStartMiddleEndAttribute( 'color' );
    } );

    app.events.on( 'setting:colorSpread', function( value, title ) {
        app.editor.particleEmitter[ 'color' + title.replace( ':', '' ) + 'Spread' ].set( value, value, value );
        setShaderStartMiddleEndAttribute( 'color' );
    } );



    // Menu items
    app.events.on( 'icon:centerEmitter', function() {
        app.editor.controls.focus( app.editor.focusMesh );
    } );

    app.events.on( 'icon:frameEmitter', function() {
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
        var active = document.querySelector( 'li.showGrid' ).classList.contains( 'on' );

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
        var active = document.querySelector( 'li.adaptiveGrid' ).classList.contains( 'on' );
        
        CONFIG.adaptiveGrid = active;
        app.editor._createGrid();
    } );

    app.events.on( 'menu:showEmitterBoundingBox', function() {
        var active = document.querySelector( 'li.showEmitterBoundingBox' ).classList.contains( 'on' );

        CONFIG.showEmitterBoundingBox = active;

        if( active ) {
            app.editor.focusMesh.material.opacity = CONFIG.emitterBoundingBoxOpacity;
        }
        else {
            app.editor.focusMesh.material.opacity = 0;
        }
    } );

    app.events.on( 'menu:slidersSetValueOnMouseDown', function() {
        var active = document.querySelector( 'li.slidersSetValueOnMouseDown' ).classList.contains( 'on' );
        
        CONFIG.slidersSetValueOnMouseDown = active;
    } );

}());