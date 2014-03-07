(function() {

    function SettingsPanel() {
        this._makeElements();
    }

    SettingsPanel.prototype = {
        _makeElements: function() {
            this.domElement = document.createElement( 'section' );
            this.handle = document.createElement( 'div' );
            
            this.domElement.classList.add( 'settings-panel' );
            this.handle.classList.add( 'handle' );

            this.domElement.appendChild( this.handle ) ;

            this._makePanels();
        },

        _makePanels: function() {
            var settings = CONFIG.settingsPanel;

            for( var i in settings ) {
                this._makePanelGroup( i, settings[ i ])
            }
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
                    }
                }

                rollup = new Rollup({
                    title: group[ i ].title,
                    content: content,
                    group: groupName,
                    solo: true
                });

                wrapper.appendChild( rollup.domElement );
            }

            this.domElement.appendChild( wrapper );
        }
    };

    window.SettingsPanel = SettingsPanel;

}());