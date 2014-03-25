THREE.Color.prototype.invert = function() {
    this.r *= -1;
    this.g *= -1;
    this.b *= -1;
};

var app = app || {};

// Load saved configs here? Only on load / error create
// the instances below...

app.currentEmitterIndex = 0;

app.events = new PubSub( { debug: true } );
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
    app.events.fire( 'toggleSettingsPanel', null, app.settings.domElement.classList.contains( 'closed' ) );
    app.statusBar.registerStatusElements();
    app.settings.scroller.refresh();
    app.editor.start();
    app.events.fire( 'menu:new' );

    setTimeout( function() {
        document.querySelector( '.loader' ).style.opacity = 0;

        setTimeout( function() {
            app.menu.domElement.style.opacity = 1;
        }, 300 );

        setTimeout( function() {
            app.settings.domElement.style.opacity = 1;
        }, 500 );

        setTimeout( function() {
            app.statusBar.domElement.style.opacity = 1;
        }, 750 );

        setTimeout( function() {
            app.editor.renderer.domElement.style.opacity = 1;
            document.querySelector( '.loader' ).style.display = 'none';
        }, 1000 );
    }, 1000 );


}, 50 );