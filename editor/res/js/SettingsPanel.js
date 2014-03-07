(function() {

    function SettingsPanel() {
        // Bind scope
        for( var i in this ) {
            if( typeof this[ i ] === 'function' ) {
                this[ i ] = this[ i ].bind( this );
            }
        }

        this._makeElements();
    }

    SettingsPanel.prototype = {
        _refreshScroller: function() {
            this.scroller.refresh();
        },

        _toggleOpen: function() {
            this.domElement.classList.toggle( 'closed' );
        },

        _makeElements: function() {
            this.domElement = document.createElement( 'section' );
            this.handle = document.createElement( 'div' );
            this.scrollWrapper = document.createElement( 'div' );
            this.scrollContainer = document.createElement( 'div' );

            this.domElement.classList.add( 'settings-panel', 'closed' );
            this.handle.classList.add( 'handle' );
            this.scrollWrapper.classList.add( 'scroll-wrapper' );
            this.scrollContainer.classList.add( 'scroll-container' );

            this.scrollWrapper.appendChild( this.scrollContainer );
            this.domElement.appendChild( this.handle );
            this.domElement.appendChild( this.scrollWrapper );

            this.handle.addEventListener( 'click', this._toggleOpen, false );

            this._makePanels();
        },

        _makePanels: function() {
            var settings = CONFIG.settingsPanel;

            for( var i in settings ) {
                this._makePanelGroup( i, settings[ i ])
            }

            this.scroller = new IScroll( this.scrollWrapper, {
                mouseWheel: true,
                scrollbars: true,
                fadeScrollbars: false,
                interactiveScrollbars: true,
                click: true,
                preventDefault: false,
                disableTouch: true
            } );
        },

        _makePanelGroup: function( groupName, group ) {
            var i, rollup, content, groupTitle, wrapper;

            wrapper = document.createElement( 'div' );
            wrapper.classList.add( 'group-wrapper' );

            groupTitle = document.createElement( 'h2' );
            groupTitle.classList.add( 'group-title' );
            groupTitle.textContent = groupName;
            wrapper.appendChild( groupTitle );

            for( i in group ) {
                content = document.createElement( 'div' );

                if( group[ i ].type === 'slider' ) {
                    for( var j = 0, el; j < group[ i ].children.length; ++j ) {
                        el = new Slider({
                            parent: content,
                            title: group[ i ].children[ j ] ? group[ i ].children[ j ] + ':' : '',
                            width: Math.min(window.innerWidth, window.innerHeight) * 0.25,
                            fromValue: group[ i ].minValue,
                            toValue: group[ i ].maxValue,
                            round: group[ i ].round
                        });

                        el.registerCallback( group[ i ].action );
                    }
                }

                rollup = new Rollup({
                    title: group[ i ].title,
                    content: content,
                    group: groupName,
                    solo: true,
                    callback: this._refreshScroller
                });

                wrapper.appendChild( rollup.domElement );
            }

            this.scrollContainer.appendChild( wrapper );
        }
    };

    window.SettingsPanel = SettingsPanel;

}());