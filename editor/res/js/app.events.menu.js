/**
 * File menu
 */
app.events.on( 'menu:new', function() {

    // Remove all old emitters.
    CONFIG.editor.emitter = CONFIG.editor.emitter.splice(0, 1);

    var emitter = CONFIG.editor.emitter[ 0 ],
        group = CONFIG.editor.group;


    // Make sure the currentEmitterIndex is reset.
    app.currentEmitterIndex = 0;

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

    // Recreate the emitters (used in this case to remove the old
    // emitters that we don't want anymore.)
    app.editor.resetEmitters();

    app.settings.emitterSelector.updateArrows();
    app.settings.emitterSelector.updateName();

    setTimeout( function() {
        app.events.fire( 'menu:centerEmitter' );
    }, 250 );
} );



app.events.on( 'menu:export', function() {
    app.files.export( CONFIG.editor.group, CONFIG.editor.emitter );
} );


/**
 * Edit Menu
 */
app.events.on( 'menu:undo', function() {
    app.history.prev();
} );

app.events.on( 'menu:redo', function() {
    app.history.next();
} );



/**
 * View Menu
 */
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


app.events.on( 'menu:showAxisHelper', function() {
    var active = utils.menuItemHasClass( 'showAxisHelper', 'on' );

    CONFIG.showAxisHelper = active;

    if( active ) {
        app.editor.worldAxis.material.opacity = 1;
    }
    else {
        app.editor.worldAxis.material.opacity = 0;
    }
} );

app.events.on( 'menu:slidersSetValueOnMouseDown', function() {
    var active = utils.menuItemHasClass( 'slidersSetValueOnMouseDown', 'on' );

    CONFIG.slidersSetValueOnMouseDown = active;
} );


/**
 * Tool Menu
 */
app.events.on( 'menu:centerEmitter', function() {
    app.editor.controls.focus( app.editor.focusMesh );
} );

app.events.on( 'menu:frameEmitter', function() {
    app.editor.controls.focus( app.editor.focusMesh, true );
} );


/**
 * Misc
 */
app.events.on( 'toggleSettingsPanel', function( isClosed ) {
    setTimeout( function() {
        app.editor._onResize(
            null,
            window.innerWidth - ( isClosed ? 0 : 320 ),
            window.innerHeight
        );
    }, !isClosed ? 500 : 0 );
} );