THREE.Color.prototype.invert = function() {
    this.r *= -1;
    this.g *= -1;
    this.b *= -1;
};

var app = app || {};

app.events = new PubSub( { debug: false } );
app.menu = new Menu();
app.editor = new Editor();
app.settings = new SettingsPanel();
app.files = new Files();

app.popupWindows = {
    export: new PopupWindow( {
        title: 'Export...',
        buttons: {
            'close': function() {}
        }
    } )
}


document.body.appendChild( app.menu.domElement );
document.body.appendChild( app.settings.domElement );
document.body.appendChild( app.editor.domElement );

setTimeout( function() {
    app.settings.scroller.refresh();
    // app.editor.start();
}, 50 );