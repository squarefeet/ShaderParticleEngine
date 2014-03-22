function Files() {
	this._currentFileName = null;

	this._parentKeyName = 'spe-editor';
}


Files.prototype = {

	_getAllKeys: function() {

	},

	_setValueForKey: function() {

	},

	_createZipArchive: function() {

	},

	open: function() {

	},

	save: function() {
		if( this._currentFileName === null ) {
			return this.saveAs();
		}
	},

	saveAs: function() {

	},

	export: function( groupSettings, emitterSettings ) {
		var groupArray = [],
			emitterArray = [],
			group = CONFIG.editor.group,
			emitter = CONFIG.editor.emitter,
			lineFeed = '\r\n',
			length, output;

		groupArray.push( '// Create particle group' );
		groupArray.push( 'var particleGroup = new SPE.Group({' );
		groupArray.push( '\tmaxAge:' + group.maxAge + ',' );
		groupArray.push( '\ttexture: THREE.ImageUtils.loadTexture("' + group.texture.sourceFile + '")' );
		groupArray.push( '});' );
		groupArray.join( lineFeed );

		emitterArray.push( '// Create particle emitter' );
		emitterArray.push( 'var particleEmitter = new SPE.Emitter({' );

		for( var i in emitter ) {
			var setting = emitter[ i ];

			if( !utils.settingIsEqual( setting, CONFIG.editor.defaultEmitter[ i ] ) &&
				utils.settingAdheresToType( i, emitter.type )
			) {
				emitterArray.push( '\t' + utils.stringifySetting( i, setting ) + ',' );
			}
		}

		length = emitterArray.length - 1;

		// Remove trailing comma.
		emitterArray[ length ] = emitterArray[ length ].substr(0, emitterArray[ length ].length - 1 );

		emitterArray.push( '});' );


		output = groupArray.join( lineFeed );
		output += lineFeed;
		output += lineFeed;
		output += emitterArray.join( lineFeed );
		output += lineFeed;
		output += lineFeed;
		output += '// Add emitter to group.' + lineFeed;
		output += 'particleGroup.addEmitter( particleEmitter );';
		output += lineFeed;
		output += lineFeed;
		output += '// Add mesh to your scene. Adjust as necessary.' + lineFeed;
		output += 'scene.add( particleGroup.mesh );';

		// window.open( 'data:,' + encodeURI( output ) );

		app.popupWindows.export.setContent( '<pre>' + output + '</pre>' );
		app.popupWindows.export.show();
	},

	import: function() {

	}

};