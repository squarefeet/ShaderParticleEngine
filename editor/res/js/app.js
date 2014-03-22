THREE.Color.prototype.invert = function() {
    this.r *= -1;
    this.g *= -1;
    this.b *= -1;
};

var app = app || {};

// Load saved configs here? Only on load / error create
// the instances below...

app.events = new PubSub( { debug: false } );
app.menu = new Menu();
app.editor = new Editor();
app.settings = new SettingsPanel();
app.files = new Files();
app.statusBar = new StatusBar();

app.popupWindows = {
    export: new PopupWindow( {
        title: 'Export...',
        buttons: {
            'close': function() {}
        }
    } )
};


document.body.appendChild( app.menu.domElement );
document.body.appendChild( app.settings.domElement );
document.body.appendChild( app.editor.domElement );
document.body.appendChild( app.statusBar.domElement );

setTimeout( function() {
    app.statusBar.registerStatusElements();

    app.settings.scroller.refresh();
    // app.editor.start();
    app.events.fire( 'menu:new' );
}, 50 );