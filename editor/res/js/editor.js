(function() {

    var DEFAULT_TEXTURES = {
        'Bullet': 'res/img/bullet.png',
        'Cloud': 'res/img/cloud.png',
        'Smoke': 'res/img/smokeparticle.png',
        'Star': 'res/img/star.png',
        'Custom...': ''
    };


    var GROUP_SETTINGS = {
        texture: THREE.ImageUtils.loadTexture( 'res/img/smokeparticle.png' ),
        maxAge: 5
    };


    var EMITTER_SETTINGS = {
        type: 'cube',

        particleCount: 1000,

        position: new THREE.Vector3(),
        positionSpread: new THREE.Vector3(),

        acceleration: new THREE.Vector3( 0, -2, 0 ),
        accelerationSpread: new THREE.Vector3( 1, 0, 1 ),

        velocity: new THREE.Vector3( 0, 5, 0 ),
        velocitySpread: new THREE.Vector3( 1, 1, 1 ),

        radius: 10,
        radiusSpread: 0,
        radiusSpreadClamp: 3,
        radiusScale: new THREE.Vector3( 1, 1, 1 ),

        speed: 5,
        speedSpread: 1,

        sizeStart: 1,
        sizeStartSpread: 0,

        sizeMiddle: 2,
        sizeMiddleSpread: 0,

        sizeEnd: 0,
        sizeEndSpread: 0,

        angleStart: 0,
        angleStartSpread: 0,

        angleMiddle: 0,
        angleMiddleSpread: 0,

        angleEnd: 0,
        angleEndSpread: 0,

        colorStart: new THREE.Color( 0x5577FF ),
        colorStartSpread: new THREE.Vector3(),

        colorMiddle: new THREE.Color( 0xFFFFFF ),
        colorMiddleSpread: new THREE.Vector3(),

        colorEnd: new THREE.Color( 0x557700 ),
        colorEndSpread: new THREE.Vector3(),

        opacityStart: 1,
        opacityStartSpread: 0,

        opacityMiddle: 0.1,
        opacityMiddleSpread: 0.1,

        opacityEnd: 0,
        opacityEndSpread: 0,

        duration: null,

        alive: 1,
        isStatic: 0
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

            this.focusMesh = new THREE.Mesh(
                new THREE.CubeGeometry( 5, 5, 5 ),
                new THREE.MeshBasicMaterial( {
                    color: 0xffffff,
                    wireframe: true,
                    transparent: true,
                    opacity: 0.1
                } )
            );
            this.focusMesh.position.y = 2.5;
            this.scene.add( this.focusMesh );


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
            this.particleGroup = new SPE.Group( GROUP_SETTINGS );

            this.particleEmitter = new SPE.Emitter( EMITTER_SETTINGS );

            this.particleGroup.addEmitter( this.particleEmitter );
            this.scene.add( this.particleGroup.mesh );
        },

        _makeTextureSelect: function() {
            var self = this,
                container = makeRollableWrapper( 'Texture', false ),
                input = document.createElement( 'input' ),
                select = makeSelect( DEFAULT_TEXTURES, 2, function( selectedOption, name ) {
                    if( name !== 'Custom...' ) {
                        input.style.display = 'none';
                        texture = THREE.ImageUtils.loadTexture( selectedOption )
                        self.setTexture( texture );
                    }
                    else {
                        input.style.display = 'block';

                        if( uploadedTexture !== null ) {
                            self.setTexture( uploadedTexture );
                        }
                    }
                } ),
                uploadedTexture = null;

            container.wrapper.classList.add( 'image-upload' );

            input.type = 'file';
            input.accept = 'image/*';

            input.addEventListener( 'change', function( e ) {
                var reader = new FileReader();

                reader.onload = function( e ) {
                    uploadedTexture = THREE.ImageUtils.loadTexture( e.target.result );
                    self.setTexture( uploadedTexture );
                };

                reader.readAsDataURL( e.target.files[0] );
            }, false );

            container.innerWrapper.appendChild( select );
            container.innerWrapper.appendChild( input );
            this.elements.settings.appendChild( container.wrapper );
        },

        _createSettings: function() {
            this._makeTextureSelect();
        },

        _addListeners: function() {
            var self = this;

            this.elements.settingsHandle.addEventListener( 'mouseup', this._toggleSettings, false );

            document.querySelector( '.icon.reset-camera' ).addEventListener( 'mouseup', function() {
                self.controls.focus( self.focusMesh, true );
            }, false );

            document.querySelector( '.icon.decrease-size' ).addEventListener( 'mouseup', function() {

            }, false );

            document.querySelector( '.icon.increase-size' ).addEventListener( 'mouseup', function() {

            }, false );

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


        // "Public" API
        start: function() {
            this._animate();
        },


        setTexture: function( texture ) {
            this.particleGroup.texture = texture;
            this.particleGroup.uniforms.texture.value = texture;
        },

        increaseSize: function() {

        },

        decreaseSize: function() {

        }

    };

    window.Editor = Editor;
}());