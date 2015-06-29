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
    app.settings.showOnlyApplicableRollups( utils.getCurrentEmitter().instance.type );

} );


app.events.on( 'settings:emitterSelector:nameChange', function( value ) {
    CONFIG.editor.names[ app.currentEmitterIndex ] = value;
} );