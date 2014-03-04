(function() {

    var DEFAULT_TEXTURES = {
        'Bullet': 'res/img/bullet.png',
        'Cloud': 'res/img/cloud.png',
        'Smoke': 'res/img/smokeparticle.png',
        'Star': 'res/img/star.png',
        'Custom...': ''
    };

    function makeSelect( options, defaultIndex, onChange ) {
        var select = document.createElement( 'select' ),
            option;

        for( var i in options ) {
            option = document.createElement( 'option' );
            option.value = i;
            option.textContent = i;
            select.appendChild( option );
        }  

        select.selectedIndex = defaultIndex;

        select.addEventListener( 'change', function( e ) {
            var selectedOption = e.srcElement.selectedOptions[0].value;
            onChange( options[ selectedOption ], selectedOption, options );
        }, false );

        return select;
    }


    function makeRollableWrapper( titleText, isOpen ) {
        var wrapper = document.createElement( 'div' ),
            title = document.createElement( 'h6' ),
            innerWrapper = document.createElement( 'div' ),
            arrow = document.createElement( 'div' );

        wrapper.className = 'setting-wrapper transition-all';
        innerWrapper.className = 'setting-inner-wrapper transition-all';
        arrow.className = 'arrow absolute';

        if( isOpen ) {
            wrapper.classList.add( 'open' );
        }

        title.textContent = titleText;

        title.addEventListener( 'mouseup', function( e ) {
            wrapper.classList.toggle( 'open' );
        }, false );

        wrapper.appendChild( title );
        wrapper.appendChild( arrow );
        wrapper.appendChild( innerWrapper );

        return {
            wrapper: wrapper,
            innerWrapper: innerWrapper
        };
    }


    function Editor() {
        this.elements = {
            particleWrapper: document.querySelector( '.particle-wrapper' ),
            menu: document.querySelector( '.menu' ),
            settings: document.querySelector( '.settings' ),
            settingsHandle: document.querySelector( '.visibility-handle' ),
            settingsHandleText: document.querySelector( '.visibility-handle > p' )
        };

        // Bind scope
        this._toggleSettings = this._toggleSettings.bind( this );
        this._onResize = this._onResize.bind( this );
        this._animate = this._animate.bind( this );


        this.dt = 0.016;
        this._settingsIsOpen = true;

        this._createScene();
        this._createSettings();
        this._createParticles();
        this._addListeners();
    }

    Editor.prototype = {

        _createScene: function() {
            this.scene = new THREE.Scene();
            this.camera = new THREE.PerspectiveCamera( 75, window.innerWidth / window.innerHeight, 1, 10000 );
            this.stats = new Stats();
            this.renderer = new THREE.WebGLRenderer( { antialias: true } );
            this.renderer.setSize( window.innerWidth, window.innerHeight );
            this.clock = new THREE.Clock();
            this.controls = new THREE.EditorControls( this.camera, this.renderer.domElement );

            this.grid = new THREE.Mesh(
                new THREE.PlaneGeometry( 200, 200, 20, 20 ),
                new THREE.MeshBasicMaterial( {
                    color: 0xaaaaaa,
                    wireframe: true
                } )
            );

            this.grid.rotation.x = Math.PI * 0.5;

            this.scene.add( this.grid );

            var statsEl = this.stats.domElement,
                rendererEl = this.renderer.domElement;

            statsEl.style.position = 'absolute';
            statsEl.style.bottom = '0';
            statsEl.style.zIndex = '1';

            rendererEl.style.position = 'absolute';
            rendererEl.style.top = '0';

            this.camera.position.y = 5;
            this.camera.position.z = -10;
            this.camera.lookAt( this.scene.position );

            this.elements.particleWrapper.appendChild( statsEl );
            this.elements.particleWrapper.appendChild( rendererEl );
        },

        _createParticles: function() {
            this.particleGroup = new SPE.Group( {
                texture: THREE.ImageUtils.loadTexture( 'res/img/smokeparticle.png' ),
                maxAge: 5
            } );

            this.particleEmitter = new SPE.Emitter( {
                position: new THREE.Vector3(),
                velocity: new THREE.Vector3( 0, 3, 0 ),
                velocitySpread: new THREE.Vector3( 2, 0, 2 ),
                acceleration: new THREE.Vector3( 0, -1, 0 )
            } );

            this.particleGroup.addEmitter( this.particleEmitter );
            this.scene.add( this.particleGroup.mesh );
        },

        _makeImageUpload: function() {
            var self = this,
                wrapper = makeRollableWrapper( 'Texture', false ),
                input = document.createElement( 'input' ),
                select = makeSelect( DEFAULT_TEXTURES, 2, function( selectedOption, name ) {
                    console.log( selectedOption, name );

                    var texture, fakeClick;

                    if( name !== 'Custom...' ) {
                        input.style.display = 'none';
                        texture = THREE.ImageUtils.loadTexture( selectedOption )
                        self.particleGroup.texture = texture;
                        self.particleGroup.uniforms.texture.value = texture;
                    }
                    else {
                        input.style.display = 'block';

                        if( uploadedTexture !== null ) {
                            console.log( uploadedTexture );
                            self.particleGroup.texture = uploadedTexture;
                            self.particleGroup.uniforms.texture.value = uploadedTexture;
                        }
                    }
                } ),
                uploadedTexture = null;

            wrapper.wrapper.classList.add( 'image-upload' );

            input.type = 'file';
            input.accept = 'image/*';

            input.addEventListener( 'change', function( e ) {
                var reader = new FileReader();

                reader.onload = function( e ) {
                    uploadedTexture = THREE.ImageUtils.loadTexture( e.target.result );
                    self.particleGroup.texture = uploadedTexture;
                    self.particleGroup.uniforms.texture.value = uploadedTexture;
                };

                reader.readAsDataURL( e.target.files[0] );
            }, false ); 

            wrapper.innerWrapper.appendChild( select );
            wrapper.innerWrapper.appendChild( input );
            this.elements.settings.appendChild( wrapper.wrapper );
        },

        _createSettings: function() {
            this._makeImageUpload();
        },

        _addListeners: function() {
            this.elements.settingsHandle.addEventListener( 'mouseup', this._toggleSettings, false );

            window.addEventListener( 'resize', this._onResize, false );
        },

        _toggleSettings: function( e ) {
            var settings = this.elements.settings;

            if( this._settingsIsOpen ) {
                settings.style.webkitTransform = 'translate3d( ' + (settings.offsetWidth - 2) + 'px, 0, 0 )';
                this.elements.settingsHandleText.textContent = '<';
                this._settingsIsOpen = false;
            }
            else {
                settings.style.webkitTransform = 'translate3d( 0px, 0, 0 )';
                this.elements.settingsHandleText.textContent = '>';
                this._settingsIsOpen = true;
            }
        },

        _onResize: function( e ) {
            this.renderer.setSize( window.innerWidth, window.innerHeight );
            this.camera.aspect = window.innerWidth / window.innerHeight;
            this.camera.updateProjectionMatrix();
        },

        _animate: function() {
            requestAnimationFrame( this._animate );
            this.dt = this.clock.getDelta();
            this.stats.update();
            this.renderer.render( this.scene, this.camera );
            this.particleGroup.tick( this.dt );
        },  

        start: function() {
            this._animate();
        }

    };

    window.Editor = Editor;
}());