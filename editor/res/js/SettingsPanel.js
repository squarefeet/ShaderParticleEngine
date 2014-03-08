(function() {

    function SettingsPanel() {
        // Bind scope
        for( var i in this ) {
            if( typeof this[ i ] === 'function' ) {
                this[ i ] = this[ i ].bind( this );
            }
        }

        this.attributes = {};

        this._makeElements();
        this.setAttributesFromMap( CONFIG.editor );
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

            console.log( this.attributes );

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
            var i, rollup, content, groupTitle, wrapper,
                self = this;

            wrapper = document.createElement( 'div' );
            wrapper.classList.add( 'group-wrapper' );

            groupTitle = document.createElement( 'h2' );
            groupTitle.classList.add( 'group-title' );
            groupTitle.textContent = groupName;
            wrapper.appendChild( groupTitle );


            for( i in group ) {
                content = document.createElement( 'div' );

                if( group[ i ].type === 'slider' ) {
                    var numChildren = group[ i ].children.length;

                    if( numChildren > 1 ) {
                        this.attributes[ i ] = {};
                    }

                    for( var j = 0, el; j < numChildren; ++j ) {
                        el = new Slider({
                            parent: content,
                            title: group[ i ].children[ j ] ? group[ i ].children[ j ] + ':' : '',
                            width: Math.min(window.innerWidth, window.innerHeight) * 0.25,
                            fromValue: group[ i ].minValue,
                            toValue: group[ i ].maxValue,
                            round: group[ i ].round,
                            name: i
                        });

                        el.registerCallback( group[ i ].action );

                        // el.registerCallback( (function( name, title ) {
                        //     return function( value ) {
                        //         self.setAttribute( name, value, title );
                        //     };
                        // }( i, group[ i ].children[ j ] )) ); 

                        if( numChildren > 1 ) {
                            this.attributes[ i ][ group[ i ].children[ j ] ] = el;
                        }
                        else {
                            this.attributes[ i ] = el;
                        }
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
        },

        setAttribute: function( attribute, value, childName ) {
            var group = app.editor.particleGroup,
                emitter = app.editor.particleEmitter,
                groupSingle = group.hasOwnProperty( attribute ),
                groupMerged = group.hasOwnProperty( attribute + childName ),
                emitterSingle = emitter.hasOwnProperty( attribute ),
                emitterMerged = emitter.hasOwnProperty( attribute + childName );


            // console.log( attribute, value, childName );
            // if( childName ) {

                if( groupSingle || groupMerged ) {
                    console.log( 'group setting', group[ attribute ], group[ attribute + childName ] );

                }
                else if( emitterSingle || emitterMerged ) {
                    console.log( 'emitter setting', emitter[ attribute ], emitter[ attribute + childName ] );
                }

                // attribute = this.attributes[ attribute ][ childName ];

            // }
        },

        setAttributesFromMap: function( map ) {
            var groupAttributes = map.group,
                emitterAttributes = map.emitter,
                attribute, subAttribute, additionalString;

            for( var i in groupAttributes ) {
                if( attribute = this.attributes[ i ] ) {
                    if( attribute instanceof Slider ) {
                        attribute._setValue( groupAttributes[ i ] );
                    }
                }
            }


            for( var i in emitterAttributes ) {
                if( attribute = this.attributes[ i ] ) {
                    if( emitterAttributes[ i ] instanceof THREE.Vector3 ) {
                        attribute.x._setValue( emitterAttributes[ i ].x );
                        attribute.y._setValue( emitterAttributes[ i ].y );
                        attribute.z._setValue( emitterAttributes[ i ].z );
                    }
                    else if( typeof emitterAttributes[ i ] === 'number' ) {
                        attribute._setValue( emitterAttributes [ i ] );
                    }
                    else {
                        attribute._setValue( emitterAttributes [ i ] );
                    }
                }
                else {
                    // if( ~i.indexOf( 'Spread') ) {
                        attribute = i.replace( 'Spread', '' );
                        subAttribute = attribute.replace( /Start|Middle|End/, '' );

                        additionalString = ~i.indexOf( 'Spread' ) ? 'Spread' : '';

                        if( ~i.indexOf( 'Start' ) && this.attributes[ subAttribute + 'Spread' ] ) {
                            this.attributes[ subAttribute + additionalString ][ 'Start' ]._setValue( emitterAttributes[ i ] );
                        }
                        else if( ~i.indexOf( 'Middle' ) && this.attributes[ subAttribute + 'Spread' ] ) {
                            this.attributes[ subAttribute + additionalString ][ 'Middle' ]._setValue( emitterAttributes[ i ] );
                        }
                        else if( ~i.indexOf( 'End' ) && this.attributes[ subAttribute + 'Spread' ] ) {
                            this.attributes[ subAttribute + additionalString ][ 'End' ]._setValue( emitterAttributes[ i ] );
                        }
                    }
                // }
            }
        }
    };

    window.SettingsPanel = SettingsPanel;

}());