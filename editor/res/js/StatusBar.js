function StatusBar() {
	this.domElement = null;
	this._create();
}

StatusBar.prototype = {
	_create: function() {
		this.domElement = document.createElement( 'div' );
		this.readout = document.createElement( 'p' );

		this.domElement.classList.add( 'status-bar' );

		this.domElement.appendChild( this.readout );
	},

	registerStatusElements: function() {
		var statusElements = document.querySelectorAll( '[' + CONFIG.statusTextAttribute + ']' ),
			self = this;

		for( var i = 0, il = statusElements.length; i < il; ++i ) {
			statusElements[ i ].addEventListener( 'mouseover', function() {
				self.setStatusMessage( this.getAttribute( CONFIG.statusTextAttribute ) );
			}, false);

			statusElements[ i ].addEventListener( 'mouseout', function() {
				self.setStatusMessage();
			}, false);
		}
	},

	setStatusMessage: function( message ) {
		this.readout.textContent = message || '';
	}
}