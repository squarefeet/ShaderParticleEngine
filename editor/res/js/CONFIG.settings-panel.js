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
                app.events.fire( 'setting:' + eventName );
            }
        };
    }

    CONFIG.settingsPanel = {

        general: {
            type: makeSetting( 'Emitter Type', 'type', 'select', ['cube', 'sphere', 'disk'] ),
            particleCount: makeSetting( 'Particle Count', 'particleCount', 'slider', [''], 0, 10000, true )
        },

        positioning: {
            position: makeSetting( 'Position', 'position', 'slider', ['x', 'y', 'z'], -200, 200 ),
            positionSpread: makeSetting( 'Position Spread', 'positionSpread', 'slider', ['x', 'y', 'z'], -200, 200 ),
            radius: makeSetting( 'Radius', 'radius', 'slider', [''], 1, 200 ),
            radiusSpread: makeSetting( 'Radius Spread', 'radiusSpread', 'slider', [''], 0, 200 ),
            radiusSpreadClamp: makeSetting( 'Radius Spread Clamp', 'radiusSpreadClamp', 'slider', [''], 0, 10 ),
            radiusScale: makeSetting( 'Radius Scale', 'radiusScale', 'slider', ['x', 'y', 'z'], 0, 1 ),
        },

        movement: {
            acceleration: makeSetting( 'Acceleration', 'acceleration', 'slider', ['x', 'y', 'z'], -200, 200 ),
            accelerationSpread: makeSetting( 'Acceleration Spread', 'accelerationSpread', 'slider', ['x', 'y', 'z'], -200, 200 ),
            velocity: makeSetting( 'Velocity', 'velocity', 'slider', ['x', 'y', 'z'], -200, 200 ),
            velocitySpread: makeSetting( 'Velocity Spread', 'velocitySpread', 'slider', ['x', 'y', 'z'], -200, 200 ),
            speed: makeSetting( 'Speed', 'speed', 'slider', [''], 0, 200 ),
            speedSpread: makeSetting( 'Speed Spread', 'speedSpread', 'slider', [''], 0, 200 ),
        },

        sizing: {
            size: makeSetting( 'Size', 'size', 'slider', ['Start', 'Middle', 'End'], 0, 50 ),
            sizeSpread: makeSetting( 'Size Spread', 'sizeSpread', 'slider', ['Start', 'Middle', 'End'], 0, 50 ),
        }

    };

}());