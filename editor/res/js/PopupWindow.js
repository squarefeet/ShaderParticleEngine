(function() {

    var WINDOW_WRAPPER = null;


    function PopupWindow( options ) {
        this.options = {
            title: 'My Window',
            content: '',
            buttons: {},
            closeOnButtonPress: true
        };

        if( options ) {
            for( var i in options ) {
                this.options[ i ] = options[ i ];
            }
        }

        if( !document.querySelector( '.window-wrapper' ) ) {
            var wrapper = document.createElement( 'div' );
            wrapper.classList.add( 'window-wrapper' );

            var container = document.createElement( 'div' );
            container.classList.add( 'window-container' );

            wrapper.appendChild( container );
            WINDOW_WRAPPER = container;
            document.body.appendChild( wrapper );
        }

        this._create();
    }

    PopupWindow.prototype = {
        _createButtons: function() {
            var buttons = this.options.buttons,
                self = this,
                button, i;

            for( i in buttons ) {
                button = document.createElement( 'div' );
                button.classList.add( 'button' );
                button.textContent = i;
                button.addEventListener( 'click', (function( btn ) {
                    return function( e ) {
                        if( self.options.closeOnButtonPress ) {
                            self.hide();
                        }

                        btn();
                    };
                }( buttons[ i ] )), false );

                this.buttonWrapper.appendChild( button );
            }
        },

        _create: function() {
            this.domElement = document.createElement( 'div' );
            this.titleBar = document.createElement( 'div' );
            this.title = document.createElement( 'h3' );
            this.contentWrapper = document.createElement( 'div' );
            this.buttonWrapper = document.createElement( 'div' );
            this.closeButton = document.createElement( 'div' );

            this.domElement.classList.add( 'popup-window' );
            this.titleBar.classList.add( 'title-bar' );
            this.contentWrapper.classList.add( 'content-wrapper' );
            this.buttonWrapper.classList.add( 'button-wrapper' );
            this.closeButton.classList.add( 'close-button' );

            this.domElement.style.webkitTransform = 'translate3d(0, -' + (window.innerHeight * 0.7) + 'px, 0) scale(0.5)';

            this.title.textContent = this.options.title;
            this.contentWrapper.innerHTML = this.options.content;

            this._createButtons();

            var clearfix = document.createElement( 'div' );
            clearfix.classList.add( 'clear-fix' );

            this.buttonWrapper.appendChild( clearfix );

            this.titleBar.appendChild( this.title );
            this.domElement.appendChild( this.titleBar );
            this.domElement.appendChild( this.contentWrapper );
            this.domElement.appendChild( this.buttonWrapper );
            this.titleBar.appendChild( this.closeButton );

            WINDOW_WRAPPER.appendChild( this.domElement );
        },

        show: function() {
            this.domElement.classList.add( 'show' );
        },

        hide: function() {
            this.domElement.classList.remove( 'show' );
        },

        setContent: function( content ) {
            this.contentWrapper.innerHTML = content;
        }
    };

    window.PopupWindow = PopupWindow;
}());