
app.events.on( 'setting:position', function( value, title ) {
	app.editor.particleEmitter.position[ title.replace( ':', '' ) ] = value;
} );