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
}

History.prototype = {

    addSnapshot: function( lastActionName ) {
        // `lastActionName` should be the event name or some
        // sort of user-understandable string to describe what
        // has changed.
        //
        // DEEP COPY ALL OBJECTS.
        //
        // Snapshot menu settings.
        //  base CONFIG settings, no child objects.
        //
        // Snapshot emitter settings
        //  All emitters: CONFIG.editor.emitter and CONFIG.editor.group
        //
        // Store snapshots as compressed objects using utils.compress
    },

    prev: function() {

    },

    next: function() {

    }
};