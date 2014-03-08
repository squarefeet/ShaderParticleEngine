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
            var currentY = Math.abs( this.scroller.y ),
                pastCenter = currentY > ( Math.abs( this.scroller.maxScrollY ) * 0.5 ),
                self = this,
                start = Date.now(),
                dt = 0;

            var interval = setInterval( function() {
                dt += Date.now() - start;
                start = Date.now();

                if( dt > 500 ) {
                    clearInterval( interval );
                    return;
                }

                self.scroller.refresh();

                if( pastCenter ) {
                    self.scroller.scrollTo( 0, self.scroller.maxScrollY, 0 );
                }
            }, 1000 / 60 );
        },

        _toggleOpen: function() {
            this.domElement.classList.toggle( 'closed' );
            app.events.fire( 'toggleSettingsPanel', null, this.domElement.classList.contains( 'closed' ) );
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

                var numChildren = group[ i ].children.length;

                

                if( group[ i ].type === 'slider' ) {
                    if( numChildren > 1 ) {
                        this.attributes[ i ] = {};
                    }
                    
                    // else {
                    //     var title = document.createElement( 'span' );
                    //     title.textContent = group[ i ].title;
                    //     content.classList.add( 'single-attribute' );
                    //     content.appendChild( title );
                    // }

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

                        if( numChildren > 1 ) {
                            this.attributes[ i ][ group[ i ].children[ j ] ] = el;
                        }
                        else {
                            this.attributes[ i ] = el;
                        }
                    }
                }


                else if( group[ i ].type === 'color' ) {
                    if( numChildren > 1 ) {
                        this.attributes[ i ] = {};
                    }
                    for( var j = 0, el; j < numChildren; ++j ) {
                        el = new ColorPicker({
                            width: 100,
                            height: 100,
                            callback: group[ i ].action,
                            title: group[ i ].children[ j ] ? group[ i ].children[ j ] + ':' : '',
                        });

                        content.appendChild( el.domElement );

                        if( numChildren > 1 ) {
                            this.attributes[ i ][ group[ i ].children[ j ] ] = el;
                        }
                        else {
                            this.attributes[ i ] = el;
                        }
                    }
                }

                // if( numChildren > 1 ) {
                    rollup = new Rollup({
                        title: group[ i ].title,
                        content: content,
                        group: groupName,
                        callback: this._refreshScroller,
                        solo: CONFIG.soloSettingGroupRollups
                    });

                    wrapper.appendChild( rollup.domElement );
                // }
                // else {
                //     wrapper.appendChild( content );
                // }
            }

            this.scrollContainer.appendChild( wrapper );
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
                        // attribute._setValue( emitterAttributes [ i ] );
                    }
                }
                else {
                    attribute = i.replace( 'Spread', '' );
                    subAttribute = attribute.replace( /Start|Middle|End/, '' );

                    additionalString = ~i.indexOf( 'Spread' ) ? 'Spread' : '';

                    if( typeof emitterAttributes[ i ] === 'number' ) {

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
                }
            }

            app.editor._updateFocusMesh();
        }

    };

    window.SettingsPanel = SettingsPanel;

}());