function History( options ) {
    this.options = {
        maxSnapshots: 100
    };

    if( options ) {
        for( var i in options ) {
            this.options[ i ] = options[ i ];
        }
    }

    this.snapshots = [];
    this.currentIndex = 0;
    this.isRestoreKey = 'IS_RESTORE';
}

History.prototype = {

    _trim: function() {
        if( this.snapshots.length && this.currentIndex < this.snapshots.length ) {
            this.snapshots = this.snapshots.slice( 0, this.currentIndex );
        }
    },

    _createSnapshot: function( eventName, values ) {
        return {
            eventName: eventName,
            values: values
        };
    },

    // Just store the eventName and the old value...
    add: function( eventName ) {

        console.log( arguments );
        var args = Array.prototype.slice.call( arguments, 1 );

        // If the currentIndex is not at the end of the snapshots array, then
        // remove all the entries in the snapshots array after the point we're
        // currently at, essentially creating a new branch and discarding the
        // previous one.
        this._trim();


        this.snapshots.push( this._createSnapshot( eventName, args ) );

        this.currentIndex = this.snapshots.length;
    },

    restore: function( index ) {
        var snapshot = this.snapshots[ index ],
            args = [ snapshot.eventName, null ].concat( snapshot.values );

        args.push( this.isRestoreKey );

        app.events.fire.apply( app.events, args );
    },

    prev: function() {
        if( --this.currentIndex >= 0 ) {
            this.restore( this.currentIndex );
        }
        else {
            this.currentIndex = 0;
        }
    },

    next: function() {
        if( ++this.currentIndex <= this.snapshots.length - 1 ) {
            this.restore( this.currentIndex );
        }
        else {
            this.currentIndex = this.snapshots.length;
        }
    }
};