function Files() {
	this._currentFileName = null;

	this.domElement = null;
	this._buildDOMElements();
}


Files.prototype = {

	_buildDOMElements: function() {
		this.domElement = document.createElement( 'div' );
	},

	_getAllKeys: function() {

	},

	_setValueForKey: function() {

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

	export: function( speSettings ) {

	},

	import: function() {

	}

};