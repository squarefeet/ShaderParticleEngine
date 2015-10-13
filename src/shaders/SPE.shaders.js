SPE.shaders = {
    vertex: [
        SPE.shaderChunks.defines,
        SPE.shaderChunks.uniforms,
        SPE.shaderChunks.attributes,
        SPE.shaderChunks.varyings,

        SPE.shaderChunks.branchAvoidanceFunctions,
        SPE.shaderChunks.unpackColor,
        SPE.shaderChunks.floatOverLifetime,
        SPE.shaderChunks.colorOverLifetime,
        SPE.shaderChunks.paramFetchingFunctions,
        SPE.shaderChunks.forceFetchingFunctions,
        SPE.shaderChunks.rotationFunctions,


        'void main() {',


        //
        // Setup...
        //
        '    float age = getAge();',
        '    float alive = getAlive();',
        '    float maxAge = getMaxAge();',
        '    float positionInTime = (age / maxAge);',
        '    float isAlive = when_gt( alive, 0.0 );',

        '    #ifdef SHOULD_WIGGLE_PARTICLES',
        '        float wiggleAmount = positionInTime * getWiggle();',
        '        float wiggleSin = isAlive * sin( wiggleAmount );',
        '        float wiggleCos = isAlive * cos( wiggleAmount );',
        '    #endif',



        // Save the value is isAlive to a varying for
        // access in the fragment shader
        // '	vIsAlive = isAlive;',



        //
        // Forces
        //

        // Get forces & position
        '    vec3 vel = getVelocity( age );',
        '    vec3 accel = getAcceleration( age );',
        '    vec3 force = vec3( 0.0 );',
        '    vec3 pos = vec3( position );',

        // Can't figure out why positionInTime needs to be multiplied
        // by 0.6 to give the desired result...Should be value between
        // 0.0 and 1.0!?
        '    float drag = (1.0 - (positionInTime * 0.6) * acceleration.w);',

        // Integrate forces...
        '    force += vel;',
        '    force *= drag;',
        '    force += accel * age;',
        '    pos += force;',


        // Wiggly wiggly wiggle!
        '    #ifdef SHOULD_WIGGLE_PARTICLES',
        '        pos.x += wiggleSin;',
        '        pos.y += wiggleCos;',
        '        pos.z += wiggleSin;',
        '    #endif',


        // Rotate the emitter around it's central point
        '    #ifdef SHOULD_ROTATE_PARTICLES',
        '        pos = getRotation( pos, positionInTime );',
        '    #endif',

        // Convert pos to a world-space value
        '    vec4 mvPos = modelViewMatrix * vec4( pos, 1.0 );',

        // Determine point size.
        '    float pointSize = getFloatOverLifetime( positionInTime, size ) * isAlive;',

        // Determine perspective
        '    #ifdef HAS_PERSPECTIVE',
        '        float perspective = scale / length( mvPos.xyz );',
        '    #else',
        '        float perspective = 1.0;',
        '    #endif',

        // Apply perpective to pointSize value
        '    float pointSizePerspective = pointSize * perspective;',


        //
        // Appearance
        //

        // Determine color and opacity for this particle
        '    #ifdef COLORIZE',
        '    	vec3 c = isAlive * getColorOverLifetime(',
        '    		positionInTime,',
        '    		unpackColor( color.x ),',
        '    		unpackColor( color.y ),',
        '    		unpackColor( color.z ),',
        '    		unpackColor( color.w )',
        '    	);',
        '    #else',
        '    	vec3 c = vec3(1.0);',
        '	 #endif',

        '    float o = isAlive * getFloatOverLifetime( positionInTime, opacity );',

        // Assign color to vColor varying.
        '	 vColor = vec4( c, o );',

        // Determine angle
        //
        '    #ifdef SHOULD_ROTATE_TEXTURE',
        '	     vAngle = isAlive * getFloatOverLifetime( positionInTime, angle );',
        '    #endif',



        //
        // Write values
        //

        // Set PointSize according to size at current point in time.
        '	 gl_PointSize = pointSizePerspective;',
        '	 gl_Position = projectionMatrix * mvPos;',
        '}'
    ].join( '\n' ),

    fragment: [
        SPE.shaderChunks.uniforms,
        SPE.shaderChunks.varyings,

        'void main() {',
        '    vec3 outgoingLight = vColor.xyz;',

        SPE.shaderChunks.rotateTexture,

        '    outgoingLight = vColor.xyz * rotatedTexture.xyz;',
        '    gl_FragColor = vec4( outgoingLight.xyz, rotatedTexture.w * vColor.w );',
        '}'
    ].join( '\n' )
};