function Editor() {
	this.domElement = document.createElement( 'section' );
	this.domElement.classList.add( 'editor-wrapper' );

    // Bind scope
    for( var i in this ) {
        if( typeof this[ i ] === 'function' ) {
            this[ i ] = this[ i ].bind( this );
        }
    }

	this._createScene();
	this._createParticles();
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
                color: 0x444444,
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


        var rendererEl = this.renderer.domElement;

        rendererEl.style.position = 'absolute';
        rendererEl.style.top = '0';

        this.camera.position.y = 5;
        this.camera.position.z = 10;
        this.camera.lookAt( this.scene.position );

        this.domElement.appendChild( this.stats.domElement );
        this.domElement.appendChild( rendererEl );

        this.renderer.render( this.scene, this.camera );
    },

    _createParticles: function() {
    	var settings = CONFIG.editor;

        this.particleGroup = new SPE.Group( settings.group );
        this.particleEmitter = new SPE.Emitter( settings.emitter );
        this.particleGroup.addEmitter( this.particleEmitter );
        this.scene.add( this.particleGroup.mesh );
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