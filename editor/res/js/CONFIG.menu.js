var CONFIG = CONFIG || {};

(function() {

    var MENU_EVENT_PREFIX = 'menu:';

    function makeMenuItem( eventName, img, toggleable, statusText ) {
        return {
            image: img,
            toggleable: toggleable,
            eventName: eventName,
            statusText: CONFIG.statusText.menu[ eventName ],
            action: function() {
                app.events.fire( MENU_EVENT_PREFIX + eventName );
            }
        };
    }

    function makeMenuLineRule() {
        return {
            image: null,
            toggleable: null,
            eventName: null,
            action: utils.noop,
            rule: true
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
                "New": makeMenuItem( 'new', 'menu-new.png', false ),
                // "Open": makeMenuItem( 'open', 'menu-open.png', false ),
                // "Save": makeMenuItem( 'save', 'menu-save.png', false ),
                // "Save As...": makeMenuItem( 'saveas', 'menu-save-as.png', false ),
                // "Revert": makeMenuItem( 'revert', 'menu-revert.png', false ),
                // "Import": makeMenuItem( 'import', 'menu-import.png', false ),
                "Export": makeMenuItem( 'export', 'menu-export.png', false ),
                // "Exit": makeMenuItem( 'exit', 'menu-exit.png', false )
            },

            Edit: {
                "Undo": makeMenuItem( 'undo', 'menu-undo.png' ),
                "Redo": makeMenuItem( 'redo', 'menu-redo.png' ),
            },

            View: {
                "Show Grid": makeMenuItem( 'showGrid', 'menu-show-grid.png', true ),
                "Show Bounding Box": makeMenuItem( 'showEmitterBoundingBox', 'menu-bounding-box.png', true ),
                "Show Axis Helper": makeMenuItem( 'showAxisHelper', 'menu-axis-helper.png', true ),
                "Adaptive Grid": makeMenuItem( 'adaptiveGrid', 'menu-adaptive-grid.png', true ),
                "Set Slider Value on Mousedown": makeMenuItem( 'slidersSetValueOnMouseDown', 'menu-bounding-box.png', true ),
            },

            Tools: {
                "Center Emitter": makeMenuItem( 'centerEmitter', 'menu-center-emitter.png' ),
                "Frame Emitter": makeMenuItem( 'frameEmitter', 'menu-frame-emitter.png' ),
                // "Increase Emitter Size": makeMenuItem( 'increaseSize', 'menu-increase-size.png' ),
                // "Decrease Emitter Size": makeMenuItem( 'decreaseSize', 'menu-decrease-size.png' )
            }
        },

        icons: [
            makeIconItem( 'Frame emitter', 'frameEmitter', 'frame-emitter.png' ),
            makeIconItem( 'Increase (+) emitter size', 'increaseSize', 'increase-size.png' ),
            makeIconItem( 'Decrease (-) emitter size', 'decreaseSize', 'decrease-size.png' ),
        ]
    };

}());