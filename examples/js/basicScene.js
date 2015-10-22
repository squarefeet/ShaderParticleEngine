var scene = new THREE.Scene(),
    camera = new THREE.PerspectiveCamera( 64, window.innerWidth / window.innerHeight, 0.1, 10000 ),
    renderer = new THREE.WebGLRenderer( {
        antialias: true
    } ),
    stats = new Stats(),
    clock = new THREE.Clock(),
    fixedTimeStep = false;


function animate() {
    requestAnimationFrame( animate );
    stats.update();

    if ( typeof onAnimate === 'function' ) {
        onAnimate();
    }

    render();
}

function render() {
    group.tick( !fixedTimeStep ? clock.getDelta() : undefined );
    renderer.render( scene, camera );
}