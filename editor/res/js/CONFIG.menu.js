var CONFIG = CONFIG || {};

(function() {

    var MENU_EVENT_PREFIX = 'menu:',
        ICON_EVENT_PREFIX = 'icon:';

    function makeMenuItem( eventName, img, prefix, toggleable ) {
        return {
            image: img,
            toggleable: toggleable,
            eventName: eventName, 
            action: function() {
                app.events.fire( ( prefix || MENU_EVENT_PREFIX ) + eventName );
            }
        };
    }

    function makeIconItem( displayName, eventName, img ) {
        return {
            displayName: displayName,
            image: img,
            action: function() {
                app.events.fire( ICON_EVENT_PREFIX + eventName );
            }
        };
    }


    CONFIG.menu = {
        tree: {
            File: {
                "New": makeMenuItem( 'new', 'menu-new.png' ),
                "Open": makeMenuItem( 'open', 'menu-open.png' ),
                "Save": makeMenuItem( 'save', 'menu-save.png' ),
                "Save As...": makeMenuItem( 'new', 'menu-save-as.png' ),
                "Revert": makeMenuItem( 'revert', 'menu-revert.png' ),
                "Import": makeMenuItem( 'import', 'menu-import.png' ),
                "Export": makeMenuItem( 'export', 'menu-export.png' ),
                "Exit": makeMenuItem( 'exit', 'menu-exit.png' )
            },

            Edit: {
                "Undo": makeMenuItem( 'undo', 'menu-undo.png' ),
                "Redo": makeMenuItem( 'redo', 'menu-redo.png' ),
            },

            View: {
                "Show Grid": makeMenuItem( 'showGrid', 'menu-show-grid.png', null, true ),
                "Adaptive Grid": makeMenuItem( 'adaptiveGrid', 'menu-adaptive-grid.png', null, true ),
                "Show Bounding Box": makeMenuItem( 'showEmitterBoundingBox', 'menu-bounding-box.png', null, true ),
                "Set Slider Value on Mousedown": makeMenuItem( 'slidersSetValueOnMouseDown', 'menu-bounding-box.png', null, true ),
            },

            Tools: {
                "Center Emitter": makeMenuItem( 'centerEmitter', 'menu-center-emitter.png', ICON_EVENT_PREFIX ),
                "Frame Emitter": makeMenuItem( 'frameEmitter', 'menu-frame-emitter.png', ICON_EVENT_PREFIX ),
                "Increase Emitter Size": makeMenuItem( 'increaseSize', 'menu-increase-size.png', ICON_EVENT_PREFIX ),
                "Decrease Emitter Size": makeMenuItem( 'decreaseSize', 'menu-decrease-size.png', ICON_EVENT_PREFIX )
            }
        },

        icons: [
            makeIconItem( 'Frame emitter', 'frameEmitter', 'frame-emitter.png' ),
            makeIconItem( 'Increase (+) emitter size', 'increaseSize', 'increase-size.png' ),
            makeIconItem( 'Decrease (-) emitter size', 'decreaseSize', 'decrease-size.png' ),
        ]
    };

}());