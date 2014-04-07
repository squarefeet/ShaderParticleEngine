function Files() {
	this._currentFileName = null;

	this._parentKeyName = 'spe-editor';
}


Files.prototype = {

	_getAllKeys: function() {

	},

	_setValueForKey: function() {

	},

	_getLineFeed: function() {
		return '\r\n';
	},

	_getIndentation: function() {
		return CONFIG.spacesOrTabs === 'spaces' ? (new Array( CONFIG.tabWidth + 1 )).join( ' ' ) : '\t';
	},

	_getBlendingString: function() {
		return CONFIG.editor.blendStrings[ CONFIG.editor.group.blending ];
	},

	_getGroupExport: function( callback ) {
		var group = CONFIG.editor.group,
			outputArray = [],
			indent = this._getIndentation(),
			lineFeed = this._getLineFeed(),
			self = this;

		utils.getBase64Texture( function( b64Str ) {
			outputArray.push( '// Create particle group' );
			outputArray.push( 'var particleGroup = new SPE.Group({' );
			outputArray.push( indent + 'texture: THREE.ImageUtils.loadTexture("' + b64Str + '")' );
			outputArray.push( indent + 'maxAge: ' + group.maxAge + ',' );
			outputArray.push( indent + 'hasPerspective: ' + group.hasPerspective + ',' );
			outputArray.push( indent + 'colorize: ' + group.colorize + ',' );
			outputArray.push( indent + 'transparent: ' + group.transparent + ',' );
			outputArray.push( indent + 'alphaTest: ' + group.alphaTest + ',' );
			outputArray.push( indent + 'depthWrite: ' + group.depthWrite + ',' );
			outputArray.push( indent + 'depthTest: ' + group.depthTest + ',' );
			outputArray.push( indent + 'blending: ' + self._getBlendingString() );
			outputArray.push( '});' );

			callback( outputArray );
		} );
	},

	_getEmitterExport: function( callback ) {
		var emitter = CONFIG.editor.emitter,
			outputArray = [],
			indent = this._getIndentation(),
			lineFeed = this._getLineFeed(),
			self = this,
			emitterArray;

		for( var i = 0; i < emitter.length; ++i ) {
			emitterArray = [];

			emitterArray.push( '// Create particle emitter ' + i );
			emitterArray.push( 'var ' + CONFIG.editor.names[ i ].replace( /-/g, '' ) + 'Emitter = new SPE.Emitter( {' );

			for( var property in emitter[ i ] ) {
				var setting = emitter[ i ][ property ];

				if( utils.settingAdheresToType( property, emitter[ i ].type ) ) {
					emitterArray.push( indent + utils.stringifySetting( property, setting ) + ',' );
				}
			}

			length = emitterArray.length - 1;

			// Remove trailing comma.
			emitterArray[ length ] = emitterArray[ length ].substr(0, emitterArray[ length ].length - 1 );
			emitterArray.push( '} );' );
			emitterArray.push( lineFeed );
			emitterArray.push( 'particleGroup.addEmitter( ' + CONFIG.editor.names[ i ].replace( /-/g, '' ) + 'Emitter );' );

			outputArray.push( emitterArray );
		}

		return outputArray;
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
		var lineFeed = this._getLineFeed(),
			self = this;

		this._getGroupExport( function( group ) {
			var emitter = self._getEmitterExport(),
				out = '';

			out += group.join( lineFeed );
			out += lineFeed;
			out += lineFeed;

			for( var i = 0; i < emitter.length; ++i ) {
				out += emitter[ i ].join( lineFeed );
				out += lineFeed;
				out += lineFeed;
			}

			out += '// Add mesh to your scene. Adjust as necessary.' + lineFeed;
			out += 'scene.add( particleGroup.mesh );';

			app.popupWindows.export.setContent( '<pre>' + out + '</pre>' );
			app.popupWindows.export.show();
		});
	},

	import: function() {

	}

};