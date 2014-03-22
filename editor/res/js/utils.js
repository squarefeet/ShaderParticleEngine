var utils = {
    noop: function() {},

    settingIsEqual: function( a, b ) {
        if( typeof a === 'number' ) {
            return a === b;
        }
        else if( a instanceof THREE.Vector3 || a instanceof THREE.Color ) {
            return a.equals( b );
        }
    },

    settingAdheresToType: function( settingName, type ) {
        if( ~CONFIG.editor.globalSettings.indexOf( settingName ) ) {
            return true;
        }
        else if( type === 'cube' && ~CONFIG.editor.cubeSettings.indexOf( settingName ) ) {
            return true;
        }
        else if( ( type === 'disk' || type === 'sphere' ) && ~CONFIG.editor.sphereDiskSettings.indexOf( settingName ) ) {
            return true;
        }
        else {
            return false;
        }
    },

    stringifySetting: function( name, value ) {
        if( typeof value === 'number' ) {
            return name + ': ' + value;
        }
        else if( typeof value === 'string' ) {
            return name + ': ' + "'" + value + "'";
        }

        else if( value instanceof THREE.Vector3 ) {
            return name + ': new THREE.Vector3( ' + value.x + ', ' + value.y + ', ' + value.z + ' )'
        }

        else if( value instanceof THREE.Color ) {
            return name + ': new THREE.Color( 0x' + value.getHexString() + ' )'
        }
        else {
            return name + ': ' + value;
        }
    },

    compressSettings: function( groupSettings, emitterSettings ) {

    },

    uncompressSettings: function( compressionString ) {

    },

    menuItemHasClass: function( name, klass ) {
        return document.querySelector( 'li.' + name ).classList.contains( klass );
    },

    addStatusTextAttribute: function( el, text ) {
        el.setAttribute( CONFIG.statusTextAttribute, text );
    }
};