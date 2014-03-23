var CONFIG = CONFIG || {};


(function() {

    function makeSetting( title, eventName, type, children, min, max, round ) {
        return {
            title: title,
            type: type,
            children: children,
            minValue: min,
            maxValue: max,
            round: !!round,
            statusText: CONFIG.statusText.settingsPanel[ eventName ],
            action: function() {
                app.events.fire.apply( app.events, [ 'setting:' + eventName, null ].concat( Array.prototype.slice.call( arguments ) ) );
            }
        };
    }

    CONFIG.settingsPanel = {
        group: {
            texture: makeSetting( 'Texture', 'texture', 'texture-select', CONFIG.editor.packagedTextures.concat( [ 'Custom' ] ) ),
            maxAge: makeSetting( 'Age', 'maxAge', 'slider', [''], 0, 10 ),
            hasPerspective: makeSetting( 'Has Perspective', 'hasPerspective', 'checkbox', [''], 0, 1 ),
            colorize: makeSetting( 'Colorize', 'colorize', 'checkbox', [''], 0, 1 ),
            blending: makeSetting( 'Blending', 'blending', 'select', [ 'None', 'Normal', 'Additive', 'Subtractive', 'Multiply' ] ),
            transparent: makeSetting( 'Transparent', 'transparent', 'checkbox', [''], 0, 1 ),
            alphaTest: makeSetting( 'Alpha Test', 'alphaTest', 'slider', [''], 0, 1 ),
            depthWrite: makeSetting( 'Depth Write', 'depthWrite', 'checkbox', [''], false, true ),
            depthTest: makeSetting( 'Depth Test', 'depthTest', 'checkbox', [''], false, true )
        },

        general: {
            type: makeSetting( 'Emitter Type', 'type', 'select', ['Cube', 'Sphere', 'Disk'] ),
            particleCount: makeSetting( 'Particle Count', 'particleCount', 'slider', [''], 1, 10000, true ),
            alive: makeSetting( 'Alive', 'alive', 'slider', [''], 0, 1 ),
            duration: makeSetting( 'Duration', 'duration', 'slider', [''], 0, 10 ),
            isStatic: makeSetting( 'Static', 'static', 'checkbox', [''], 0, 1 )
        },

        positioning: {
            position: makeSetting( 'Position', 'position', 'slider', ['x', 'y', 'z'], -20, 20 ),
            positionSpread: makeSetting( 'Position Spread', 'positionSpread', 'slider', ['x', 'y', 'z'], 0, 20 ),
            radius: makeSetting( 'Radius', 'radius', 'slider', [''], 0, 5 ),
            radiusSpread: makeSetting( 'Radius Spread', 'radiusSpread', 'slider', [''], 0, 5 ),
            radiusSpreadClamp: makeSetting( 'Radius Spread Clamp', 'radiusSpreadClamp', 'slider', [''], 0, 10 ),
            radiusScale: makeSetting( 'Radius Scale', 'radiusScale', 'slider', ['x', 'y', 'z'], 0, 1 ),
        },

        movement: {
            velocity: makeSetting( 'Velocity', 'velocity', 'slider', ['x', 'y', 'z'], -20, 20 ),
            velocitySpread: makeSetting( 'Velocity Spread', 'velocitySpread', 'slider', ['x', 'y', 'z'], 0, 20 ),
            acceleration: makeSetting( 'Acceleration', 'acceleration', 'slider', ['x', 'y', 'z'], -20, 20 ),
            accelerationSpread: makeSetting( 'Acceleration Spread', 'accelerationSpread', 'slider', ['x', 'y', 'z'], 0, 20 ),
            speed: makeSetting( 'Speed', 'speed', 'slider', [''], 0, 5 ),
            speedSpread: makeSetting( 'Speed Spread', 'speedSpread', 'slider', [''], 0, 5 ),
        },

        sizing: {
            size: makeSetting( 'Size', 'size', 'slider', ['Start', 'Middle', 'End'], 0, 50 ),
            sizeSpread: makeSetting( 'Size Spread', 'sizeSpread', 'slider', ['Start', 'Middle', 'End'], 0, 50 ),
        },

        color: {
            color: makeSetting( 'Color', 'color', 'color', ['Start', 'Middle', 'End'], 0, 255 ),
            colorSpread: makeSetting( 'Color Spread', 'colorSpread', 'slider', ['Start', 'Middle', 'End'], 0, 1 ),
        },

        opacity: {
            opacity: makeSetting( 'Opacity', 'opacity', 'slider', ['Start', 'Middle', 'End'], 0, 1 ),
            opacitySpread: makeSetting( 'Opacity Spread', 'opacitySpread', 'slider', ['Start', 'Middle', 'End'], 0, 1 ),
        },

        angle: {
            angle: makeSetting( 'Angle', 'angle', 'slider', ['Start', 'Middle', 'End'], -Math.PI, Math.PI ),
            angleSpread: makeSetting( 'Angle Spread', 'angleSpread', 'slider', ['Start', 'Middle', 'End'], 0, Math.PI * 2 ),
        }

    };

}());