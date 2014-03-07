
app.events.on( 'setting:position', function( value, title ) {
	title = title.replace( ':', '' );

	console.log( value, title );
} );