var app = app || {};

app.events = new PubSub();
app.menu = new Menu();
app.settings = new SettingsPanel();
app.editor = new Editor();

document.body.appendChild( app.menu.domElement );
document.body.appendChild( app.settings.domElement );
document.body.appendChild( app.editor.domElement );

setTimeout( function() {
    app.settings.scroller.refresh();
}, 50 );