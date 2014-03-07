var app = app || {};

app.events = new PubSub();
app.menu = new Menu();
app.settings = new SettingsPanel();

document.body.appendChild( app.menu.domElement );
document.body.appendChild( app.settings.domElement );

setTimeout( function() {
    app.settings.scroller.refresh();
}, 1000 );