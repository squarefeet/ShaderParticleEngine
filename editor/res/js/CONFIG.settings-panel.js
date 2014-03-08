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
            action: function() {
                app.events.fire.apply( app.events, ['setting:' + eventName, null].concat( Array.prototype.slice.call( arguments ) ) );
            }
        };
    }

    CONFIG.settingsPanel = {

        general: {
            texture: makeSetting( 'Texture', 'texture', 'select', ['Bullet', 'Cloud', 'Smoke', 'Star', 'Custom'] ),
            type: makeSetting( 'Emitter Type', 'type', 'select', ['cube', 'sphere', 'disk'] ),
            particleCount: makeSetting( 'Particle Count', 'particleCount', 'slider', [''], 0, 10000, true ),
            maxAge: makeSetting( 'Age', 'age', 'slider', [''], 0, 30, true ),
            duration: makeSetting( 'Duration', 'duration', 'slider', [''], 0, 10 ),
            isStatic: makeSetting( 'Static', 'static', 'checkbox', [''], 0, 1 )
        },

        positioning: {
            position: makeSetting( 'Position', 'position', 'slider', ['x', 'y', 'z'], -20, 20 ),
            positionSpread: makeSetting( 'Position Spread', 'positionSpread', 'slider', ['x', 'y', 'z'], 0, 20 ),
            radius: makeSetting( 'Radius', 'radius', 'slider', [''], 1, 20 ),
            radiusSpread: makeSetting( 'Radius Spread', 'radiusSpread', 'slider', [''], 0, 20 ),
            radiusSpreadClamp: makeSetting( 'Radius Spread Clamp', 'radiusSpreadClamp', 'slider', [''], 0, 10 ),
            radiusScale: makeSetting( 'Radius Scale', 'radiusScale', 'slider', ['x', 'y', 'z'], 0, 1 ),
        },

        movement: {
            acceleration: makeSetting( 'Acceleration', 'acceleration', 'slider', ['x', 'y', 'z'], -20, 20 ),
            accelerationSpread: makeSetting( 'Acceleration Spread', 'accelerationSpread', 'slider', ['x', 'y', 'z'], 0, 20 ),
            velocity: makeSetting( 'Velocity', 'velocity', 'slider', ['x', 'y', 'z'], -20, 20 ),
            velocitySpread: makeSetting( 'Velocity Spread', 'velocitySpread', 'slider', ['x', 'y', 'z'], 0, 20 ),
            speed: makeSetting( 'Speed', 'speed', 'slider', [''], 0, 20 ),
            speedSpread: makeSetting( 'Speed Spread', 'speedSpread', 'slider', [''], 0, 20 ),
        },

        sizing: {
            size: makeSetting( 'Size', 'size', 'slider', ['Start', 'Middle', 'End'], 0, 50 ),
            sizeSpread: makeSetting( 'Size Spread', 'sizeSpread', 'slider', ['Start', 'Middle', 'End'], 0, 50 ),
        },

        color: {
            color: makeSetting( 'Color', 'color', 'color', ['Start', 'Middle', 'End'], 0, 255 ),
            colorSpread: makeSetting( 'Color Spread', 'colorSpread', 'color', ['Start', 'Middle', 'End'], 0, 255 ),
        },

        opacity: {
            opacity: makeSetting( 'Opacity', 'opacity', 'slider', ['Start', 'Middle', 'End'], 0, 1 ),
            opacitySpread: makeSetting( 'Opacity Spread', 'opacitySpread', 'slider', ['Start', 'Middle', 'End'], 0, 1 ),
        }

    };

}());