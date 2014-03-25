(function() {

    function SettingsPanel() {
        // Bind scope
        for( var i in this ) {
            if( typeof this[ i ] === 'function' ) {
                this[ i ] = this[ i ].bind( this );
            }
        }

        this.attributes = {};
        this.rollups = {};
        this.textureInput = null;

        this._makeElements();
        this.setAttributesFromMap( CONFIG.editor );
    }

    SettingsPanel.prototype = {
        _refreshScroller: function() {
            if( !this.scroller ) return;

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

            this.domElement.classList.add( 'settings-panel' );
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
                click: false,
                preventDefault: false
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

                else if( group[ i ].type === 'select' || group[ i ].type === 'texture-select' ) {
                    var select = document.createElement( 'select' );
                    select.setAttribute('data-attribute-name', i );
                    select.addEventListener( 'change', this._onSelectChange, false );

                    for( var j = 0, el; j < numChildren; ++j ) {
                        el = document.createElement( 'option' );
                        el.textContent = el.value = group[ i ].children[ j ];
                        select.appendChild( el );
                    }

                    content.appendChild( select );

                    this.attributes[ i ] = select;

                    if( group[ i ].type === 'texture-select' ) {
                        var file = document.createElement( 'input' );
                        file.type = 'file';
                        file.accept = 'image/*';
                        file.addEventListener( 'change', this._onTextureUpload, false );
                        file.classList.add( 'hidden' );
                        content.appendChild( file );

                        this.textureInput = file;
                    }
                }

                else if( group[ i ].type === 'checkbox' ) {
                    var checkbox = document.createElement( 'input' );
                    checkbox.type = 'checkbox';
                    checkbox.action = group[ i ].action;
                    content.appendChild( checkbox );

                    checkbox.addEventListener( 'change', function( e ) {
                        this.action( this.checked );
                    }, false );

                    this.attributes[ i ] = checkbox;
                }

                if( group[ i ].type !== 'checkbox' && group[ i ].type !== 'select' ) {
                    rollup = new Rollup({
                        title: group[ i ].title,
                        content: content,
                        group: groupName,
                        callback: this._refreshScroller,
                        solo: CONFIG.soloSettingGroupRollups
                    });

                    utils.addStatusTextAttribute( rollup.domElement, group[ i ].statusText );
                    this.rollups[ group[ i ].title ] = rollup;
                    wrapper.appendChild( rollup.domElement );
                }
                else {
                    var contentWrapper = document.createElement( 'div' ),
                        title = document.createElement( 'h4' );

                    contentWrapper.classList.add( 'roll-up', 'clear-fix' );
                    title.classList.add( 'title', 'float-left' );
                    content.classList.add( 'inline', 'float-right' );

                    title.textContent = group[ i ].title;

                    contentWrapper.appendChild( title );
                    contentWrapper.appendChild( content );

                    utils.addStatusTextAttribute( contentWrapper, group[ i ].statusText );

                    wrapper.appendChild( contentWrapper );
                }
            }


            this.showOnlyApplicableRollups( CONFIG.editor.emitter.type );
            this.scrollContainer.appendChild( wrapper );
        },

        _onSelectChange: function( e ) {
            var attributeName = e.target.getAttribute( 'data-attribute-name' ),
                value = e.target.value;

            if( attributeName !== 'texture' ) {
                app.events.fire( 'setting:' + attributeName, null, value );
            }
            else {
                app.events.fire( 'setting:' + attributeName, null, value );

                if( value === 'Custom' ) {
                    this.textureInput.classList.remove( 'hidden' );
                }
                else {
                    this.textureInput.classList.add( 'hidden' );
                }
            }
        },

        _onTextureUpload: function( e ) {
            var reader = new FileReader();

            reader.onload = function( e ) {
                var texture = THREE.ImageUtils.loadTexture( e.target.result );
                CONFIG.editor.group.texture = texture;
                app.editor.particleEmitter.type = texture;
                app.editor.particleGroup.uniforms.texture.value = texture;
            };

            reader.readAsDataURL( e.target.files[0] );
        },

        setAttributesFromMap: function( map ) {
            // TODO: Set select and color values as well.
            var groupAttributes = map.group,
                emitterAttributes = map.emitter,
                attribute, subAttribute, additionalString;

            for( var i in groupAttributes ) {
                if( attribute = this.attributes[ i ] ) {
                    if( attribute instanceof Slider ) {
                        attribute._setValue( groupAttributes[ i ] );
                    }
                    else if( attribute.tagName) {
                        if( attribute.tagName === 'SELECT' ) {
                            if( i === 'blending' ) {
                                this.attributes[ i ].value = CONFIG.editor.blendModes[ groupAttributes[ i ] ];
                            }
                        }
                        else {
                            this.attributes[ i ].checked = !!groupAttributes[ i ];
                        }
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
                    else if( attribute.tagName ) {
                        if( attribute.tagName === 'SELECT' ) {
                            if( i === 'type' ) {
                                this.attributes[ i ].value = utils.captializeString( emitterAttributes[ i ] );
                            }
                        }
                        else {
                            console.log( i, emitterAttributes[ i ] );
                            this.attributes[ i ].checked = !!emitterAttributes[ i ];
                        }
                    }

                    else if( typeof emitterAttributes[ i ] === 'number' ) {
                        attribute._setValue( emitterAttributes [ i ] );
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
                    else {
                         // else if( i === 'type' ) {
                                // this.attributes[ i ].value = CONFIG.editor.types[ groupAttributes[ i ] ];
                                console.log( i, CONFIG.editor.types[ emitterAttributes[ i ] ] );
                            // }
                    }
                }
            }

            app.editor._updateFocusMesh();
        },

        showOnlyApplicableRollups: function( emitterType ) {
            var rollups = this.rollups,
                applicableRollups = [];

            // Group properties
            applicableRollups.push( 'Texture' );
            applicableRollups.push( 'Has Perspective' );
            applicableRollups.push( 'Colorize' );
            applicableRollups.push( 'Blending' );
            applicableRollups.push( 'Transparent' );
            applicableRollups.push( 'Alpha Test' );
            applicableRollups.push( 'Depth Write' );
            applicableRollups.push( 'Depth Test' );
            applicableRollups.push( 'Age' );

            applicableRollups.push( 'Alive' );
            applicableRollups.push( 'Angle' );
            applicableRollups.push( 'Angle Spread' );
            applicableRollups.push( 'Color' );
            applicableRollups.push( 'Color Spread' );
            applicableRollups.push( 'Duration' );
            applicableRollups.push( 'Emitter Type' );
            applicableRollups.push( 'Opacity' );
            applicableRollups.push( 'Opacity Spread' );
            applicableRollups.push( 'Particle Count' );
            applicableRollups.push( 'Position' );
            applicableRollups.push( 'Size' );
            applicableRollups.push( 'Size Spread' );
            applicableRollups.push( 'Static' );
            applicableRollups.push( 'Texture' );

            if( emitterType === 'sphere' || emitterType === 'disk' ) {
                applicableRollups.push( 'Radius' );
                applicableRollups.push( 'Radius Scale' );
                applicableRollups.push( 'Radius Spread' );
                applicableRollups.push( 'Radius Spread Clamp' );
                applicableRollups.push( 'Radius Scale' );
                applicableRollups.push( 'Speed' );
                applicableRollups.push( 'Speed Spread' );
            }
            else {
                applicableRollups.push( 'Position Spread' );
                applicableRollups.push( 'Velocity' );
                applicableRollups.push( 'Velocity Spread' );
                applicableRollups.push( 'Acceleration' );
                applicableRollups.push( 'Acceleration Spread' );
            }


            for( var i in rollups ) {
                if( ~applicableRollups.indexOf( i ) ) {
                    rollups[ i ].domElement.style.display = 'block';
                }
                else {
                    rollups[ i ].domElement.style.display = 'none';
                }
            }

            this._refreshScroller();
        }

    };

    window.SettingsPanel = SettingsPanel;

}());