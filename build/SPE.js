var SPE = {
    distributions: {
        BOX: 1,
        SPHERE: 2,
        DISC: 3,
    },

    // Set this value to however many 'steps' you
    // want value-over-lifetime properties to have.
    //
    // It's adjustable to fix an interpolation problem:
    //
    // - Assuming you specify an opacity value as [0, 1, 0]
    // 	 and the valueOverLifetimeLength is 4, then the
    // 	 opacity value array will be reinterpolated to
    // 	 be [0, 0.66, 0.66, 0].
    //   This isn't ideal, as particles would never reach
    //   full opacity.
    //
    // NOTE:
    // 	- This property affects the length of ALL
    // 	  value-over-lifetime properties for ALL
    // 	  emitters and ALL groups.
    //
    // 	- Only values >= 3 && <= 4 are allowed.
    valueOverLifetimeLength: 4
};;

/**
 * A helper class for TypedArrays.
 *
 * Allows for easy resizing, assignment of various component-based
 * types (Vector2s, Vector3s, Vector4s, Mat3s, Mat4s),
 * as well as Colors (where components are `r`, `g`, `b`),
 * Numbers, and setting from other TypedArrays.
 *
 * @author Luke Moody
 * @param {TypedArray} TypedArrayConstructor The constructor to use (Float32Array, Uint8Array, etc.)
 * @param {Number} size                 The size of the array to create
 * @param {Number} componentSize        The number of components per-value (ie. 3 for a vec3, 9 for a Mat3, etc.)
 * @param {Number} indexOffset          The index in the array from which to start assigning values. Default `0` if none provided
 */
SPE.TypedArrayHelper = function( TypedArrayConstructor, size, componentSize, indexOffset ) {
    this.componentSize = componentSize || 1;
    this.size = ( size || 1 );
    this.TypedArrayConstructor = TypedArrayConstructor || Float32Array;
    this.array = new TypedArrayConstructor( size * this.componentSize );
    this.indexOffset = indexOffset || 0;
}

SPE.TypedArrayHelper.constructor = SPE.TypedArrayHelper;

/**
 * Sets the size of the internal array.
 *
 * Delegates to `this.shrink` or `this.grow` depending on size
 * argument's relation to the current size of the internal array.
 *
 * Note that if the array is to be shrunk, data will be lost.
 *
 * @param {Number} size The new size of the array.
 */
SPE.TypedArrayHelper.prototype.setSize = function( size, noComponentMultiply ) {
    var currentArraySize = this.array.length;

    if ( !noComponentMultiply ) {
        size = size * this.componentSize;
    }

    if ( size < currentArraySize ) {
        return this.shrink( size );
    }
    else if ( size > currentArraySize ) {
        return this.grow( size );
    }
    else {
        console.info( 'TypedArray is already of size:', size + '.', 'Will not resize.' );
    }
};

/**
 * Shrinks the internal array.
 *
 * @param  {Number} size The new size of the typed array. Must be smaller than `this.array.length`.
 * @return {SPE.TypedArrayHelper}      Instance of this class.
 */
SPE.TypedArrayHelper.prototype.shrink = function( size ) {
    this.array = this.array.subarray( 0, size );
    this.size = size;
    return this;
};

/**
 * Grows the internal array.
 * @param  {Number} size The new size of the typed array. Must be larger than `this.array.length`.
 * @return {SPE.TypedArrayHelper}      Instance of this class.
 */
SPE.TypedArrayHelper.prototype.grow = function( size ) {
    var existingArray = this.array,
        newArray = new this.TypedArrayConstructor( size );

    newArray.set( existingArray );
    this.array = newArray;
    this.size = size;

    return this;
};


/**
 * Copies from the given TypedArray into this one, using the index argument
 * as the start position. Alias for `TypedArray.set`. Will automatically resize
 * if the given source array is of a larger size than the internal array.
 *
 * @param {Number} index      The start position from which to copy into this array.
 * @param {TypedArray} typedArray The TypedArray from which to copy; the source array.
 * @return {SPE.TypedArrayHelper} Instance of this class.
 */
SPE.TypedArrayHelper.prototype.setFromTypedArray = function( index, typedArray ) {
    var sourceArraySize = typedArray.length,
        newSize = index + sourceArraySize;

    if ( newSize > this.array.length ) {
        this.grow( newSize );
    }

    this.array.set( typedArray, this.indexOffset + index );

    return this;
};

/**
 * Set a Vector2 value at `index`.
 *
 * @param {Number} index The index at which to set the vec2 values from.
 * @param {Vector2} vec2  Any object that has `x` and `y` properties.
 * @return {SPE.TypedArrayHelper} Instance of this class.
 */
SPE.TypedArrayHelper.prototype.setVec2 = function( index, vec2 ) {
    return this.setVec2Components( index, vec2.x, vec2.y );
};

/**
 * Set a Vector2 value using raw components.
 *
 * @param {Number} index The index at which to set the vec2 values from.
 * @param {Number} x     The Vec2's `x` component.
 * @param {Number} y     The Vec2's `y` component.
 * @return {SPE.TypedArrayHelper} Instance of this class.
 */
SPE.TypedArrayHelper.prototype.setVec2Components = function( index, x, y ) {
    var array = this.array,
        i = this.indexOffset + ( index * this.componentSize );

    array[ i ] = x;
    array[ i + 1 ] = y;
    return this;
};

/**
 * Set a Vector3 value at `index`.
 *
 * @param {Number} index The index at which to set the vec3 values from.
 * @param {Vector3} vec2  Any object that has `x`, `y`, and `z` properties.
 * @return {SPE.TypedArrayHelper} Instance of this class.
 */
SPE.TypedArrayHelper.prototype.setVec3 = function( index, vec3 ) {
    return this.setVec3Components( index, vec3.x, vec3.y, vec3.z );
};

/**
 * Set a Vector3 value using raw components.
 *
 * @param {Number} index The index at which to set the vec3 values from.
 * @param {Number} x     The Vec3's `x` component.
 * @param {Number} y     The Vec3's `y` component.
 * @param {Number} z     The Vec3's `z` component.
 * @return {SPE.TypedArrayHelper} Instance of this class.
 */
SPE.TypedArrayHelper.prototype.setVec3Components = function( index, x, y, z ) {
    var array = this.array,
        i = this.indexOffset + ( index * this.componentSize );

    array[ i ] = x;
    array[ i + 1 ] = y;
    array[ i + 2 ] = z;
    return this;
};

/**
 * Set a Vector4 value at `index`.
 *
 * @param {Number} index The index at which to set the vec4 values from.
 * @param {Vector4} vec2  Any object that has `x`, `y`, `z`, and `w` properties.
 * @return {SPE.TypedArrayHelper} Instance of this class.
 */
SPE.TypedArrayHelper.prototype.setVec4 = function( index, vec4 ) {
    return this.setVec4Components( index, vec4.x, vec4.y, vec4.z, vec4.w );
};

/**
 * Set a Vector4 value using raw components.
 *
 * @param {Number} index The index at which to set the vec4 values from.
 * @param {Number} x     The Vec4's `x` component.
 * @param {Number} y     The Vec4's `y` component.
 * @param {Number} z     The Vec4's `z` component.
 * @param {Number} w     The Vec4's `w` component.
 * @return {SPE.TypedArrayHelper} Instance of this class.
 */
SPE.TypedArrayHelper.prototype.setVec4Components = function( index, x, y, z, w ) {
    var array = this.array,
        i = this.indexOffset + ( index * this.componentSize );

    array[ i ] = x;
    array[ i + 1 ] = y;
    array[ i + 2 ] = z;
    array[ i + 3 ] = w;
    return this;
};

/**
 * Set a Matrix3 value at `index`.
 *
 * @param {Number} index The index at which to set the matrix values from.
 * @param {Matrix3} mat3 The 3x3 matrix to set from. Must have a TypedArray property named `elements` to copy from.
 * @return {SPE.TypedArrayHelper} Instance of this class.
 */
SPE.TypedArrayHelper.prototype.setMat3 = function( index, mat3 ) {
    return this.setFromTypedArray( this.indexOffset + ( index * this.componentSize ), mat3.elements );
};

/**
 * Set a Matrix4 value at `index`.
 *
 * @param {Number} index The index at which to set the matrix values from.
 * @param {Matrix4} mat3 The 4x4 matrix to set from. Must have a TypedArray property named `elements` to copy from.
 * @return {SPE.TypedArrayHelper} Instance of this class.
 */
SPE.TypedArrayHelper.prototype.setMat4 = function( index, mat4 ) {
    return this.setFromTypedArray( this.indexOffset + ( index * this.componentSize ), mat4.elements );
};

/**
 * Set a Color value at `index`.
 *
 * @param {Number} index The index at which to set the vec3 values from.
 * @param {Color} color  Any object that has `r`, `g`, and `b` properties.
 * @return {SPE.TypedArrayHelper} Instance of this class.
 */
SPE.TypedArrayHelper.prototype.setColor = function( index, color ) {
    return this.setVec3Components( index, color.r, color.g, color.b );
};

/**
 * Set a Number value at `index`.
 *
 * @param {Number} index The index at which to set the vec3 values from.
 * @param {Number} numericValue  The number to assign to this index in the array.
 * @return {SPE.TypedArrayHelper} Instance of this class.
 */
SPE.TypedArrayHelper.prototype.setNumber = function( index, numericValue ) {
    this.array[ this.indexOffset + ( index * this.componentSize ) ] = numericValue;
    return this;
};

/**
 * Returns the value of the array at the given index, taking into account
 * the `indexOffset` property of this class.
 *
 * Note that this function ignores the component size and will just return a
 * single value.
 *
 * @param  {Number} index The index in the array to fetch.
 * @return {Number}       The value at the given index.
 */
SPE.TypedArrayHelper.prototype.getValueAtIndex = function( index ) {
    return this.array[ this.indexOffset + index ];
};

/**
 * Returns the component value of the array at the given index, taking into account
 * the `indexOffset` property of this class.
 *
 * If the componentSize is set to 3, then it will return a new TypedArray
 * of length 3.
 *
 * @param  {Number} index The index in the array to fetch.
 * @return {TypedArray}       The component value at the given index.
 */
SPE.TypedArrayHelper.prototype.getComponentValueAtIndex = function( index, array ) {
    return this.array.subarray( this.indexOffset + ( index * this.componentSize ) );
};;

SPE.ShaderAttribute = function( type, dynamicBuffer, arrayType ) {
    var typeMap = SPE.ShaderAttribute.typeSizeMap;

    this.type = typeof type === 'string' && typeMap.hasOwnProperty( type ) ? type : 'f';
    this.componentSize = typeMap[ this.type ];
    this.arrayType = arrayType || Float32Array;
    this.typedArray = null;
    this.bufferAttribute = null;
    this.dynamicBuffer = !!dynamicBuffer;

    this.updateMin = 0;
    this.updateMax = 0;
}

SPE.ShaderAttribute.constructor = SPE.ShaderAttribute;

SPE.ShaderAttribute.typeSizeMap = {
    f: 1,
    v2: 2,
    v3: 3,
    v4: 4,
    c: 3,
    m3: 9,
    m4: 16
};

SPE.ShaderAttribute.prototype.setUpdateRange = function( min, max ) {
    this.updateMin = Math.min( min * this.componentSize, this.updateMin * this.componentSize );
    this.updateMax = Math.max( max * this.componentSize, this.updateMax * this.componentSize );
};

SPE.ShaderAttribute.prototype.flagUpdate = function() {
    var attr = this.bufferAttribute,
        range = attr.updateRange;

    range.offset = this.updateMin;
    range.count = ( this.updateMax - this.updateMin ) + this.componentSize;
    attr.needsUpdate = true;
};

SPE.ShaderAttribute.prototype.resetUpdateRange = function() {
    this.updateMin = 0;
    this.updateMax = 0;
};

SPE.ShaderAttribute.prototype._ensureTypedArray = function( size ) {
    // Condition that's most likely to be true at the top: no change.
    if ( this.typedArray !== null && this.typedArray.size === size * this.componentSize ) {
        return;
    }

    // Resize the array if we need to, telling the TypedArrayHelper to
    // ignore it's component size when evaluating size.
    else if ( this.typedArray !== null && this.typedArray.size !== size ) {
        this.typedArray.setSize( size );
    }

    // This condition should only occur once in an attribute's lifecycle.
    else if ( this.typedArray === null ) {
        this.typedArray = new SPE.TypedArrayHelper( this.arrayType, size, this.componentSize );
    }
};

SPE.ShaderAttribute.prototype._createBufferAttribute = function( size ) {
    // Make sure the typedArray is present and correct.
    this._ensureTypedArray( size );

    // Don't create it if it already exists, but do
    // flag that it needs updating on the next render
    // cycle.
    if ( this.bufferAttribute !== null ) {
        // TODO:
        // - Has this been removed in THREE r72?
        //
        // - Looks like there's a `dynamic` property on
        //   a BufferAttribute now :s
        //
        // - No mention of this in the docs.
        this.bufferAttribute.needsUpdate = true;
        return;
    }

    this.bufferAttribute = new THREE.BufferAttribute( this.typedArray.array, this.componentSize );
    this.bufferAttribute.dynamic = this.dynamicBuffer;
};

SPE.ShaderAttribute.prototype.getLength = function() {
    if ( this.typedArray === null ) {
        return 0;
    }

    return this.typedArray.array.length;
};;

SPE.shaderChunks = {
    defines: [
        // '#define PI 3.141592653589793',
        // '#define PI_2 6.283185307179586',
        '#define PACKED_COLOR_SIZE 256.0',
        '#define PACKED_COLOR_DIVISOR 255.0'
    ].join( '\n' ),

    uniforms: [
        'uniform float deltaTime;',
        'uniform float runTime;',
        'uniform sampler2D texture;',
        'uniform vec4 textureAnimation;',
        'uniform float scale;',
    ].join( '\n' ),

    attributes: [
        'attribute vec4 acceleration;',
        'attribute vec3 velocity;',
        'attribute vec4 rotation;',
        'attribute vec3 rotationCenter;',
        'attribute vec4 params;',
        'attribute vec4 size;',
        'attribute vec4 angle;',
        'attribute vec4 color;',
        'attribute vec4 opacity;'
    ].join( '\n' ),

    varyings: [
        'varying vec4 vColor;',
        '#ifdef SHOULD_ROTATE_TEXTURE',
        '    varying float vAngle;',
        '#endif',
        // 'varying float vIsAlive;',

        '#ifdef SHOULD_CALCULATE_SPRITE',
        '    varying vec3 vLifetime;',
        '#endif'
    ].join( '\n' ),

    branchAvoidanceFunctions: [
        // Branch-avoiding comparison fns
        // - http://theorangeduck.com/page/avoiding-shader-conditionals
        'float when_gt(float x, float y) {',
        '    return max(sign(x - y), 0.0);',
        '}',

        'float when_lt(float x, float y) {',
        '    return min( max(1.0 - sign(x - y), 0.0), 1.0 );',
        '}',

        'float when_eq( float x, float y ) {',
        '    return 1.0 - abs( sign( x - y ) );',
        '}',

        'float when_ge(float x, float y) {',
        '  return 1.0 - when_lt(x, y);',
        '}',

        'float when_le(float x, float y) {',
        '  return 1.0 - when_gt(x, y);',
        '}',

        // Branch-avoiding logical operators
        // (to be used with above comparison fns)
        'float and(float a, float b) {',
        '    return a * b;',
        '}',

        'float or(float a, float b) {',
        '    return min(a + b, 1.0);',
        '}',
    ].join( '\n' ),

    unpackColor: [
        // From:
        // - http://stackoverflow.com/a/12553149
        // - https://stackoverflow.com/questions/22895237/hexadecimal-to-rgb-values-in-webgl-shader
        'vec3 unpackColor( in float hex ) {',
        '   vec3 c = vec3( 0.0 );',

        '   float r = mod( (hex / PACKED_COLOR_SIZE / PACKED_COLOR_SIZE), PACKED_COLOR_SIZE );',
        '   float g = mod( (hex / PACKED_COLOR_SIZE), PACKED_COLOR_SIZE );',
        '   float b = mod( hex, PACKED_COLOR_SIZE );',

        '   c.r = r / PACKED_COLOR_DIVISOR;',
        '   c.g = g / PACKED_COLOR_DIVISOR;',
        '   c.b = b / PACKED_COLOR_DIVISOR;',

        '   return c;',
        '}',
    ].join( '\n' ),

    floatOverLifetime: [
        'float getFloatOverLifetime( in float positionInTime, in vec4 attr ) {',
        '    float value = 0.0;',
        '    float deltaAge = positionInTime * float( VALUE_OVER_LIFETIME_LENGTH - 1 );',
        '    float fIndex = 0.0;',
        '    float shouldApplyValue = 0.0;',

        // This might look a little odd, but it's quite elegant. Uses
        // basic maths to avoid branching. Nice.
        //
        // Take a look at the branch-avoidance functions defined above,
        // and be sure to check out The Orange Duck site where I got this
        // from (link above).
        '    for( int i = 0; i < VALUE_OVER_LIFETIME_LENGTH - 1; ++i ) {',
        '       fIndex = float( i );',
        '       shouldApplyValue = and( when_ge( deltaAge, fIndex ), when_lt( deltaAge, fIndex + 1.0 ) );',
        '       value += shouldApplyValue * mix( attr[ i ], attr[ i + 1 ], deltaAge - fIndex );',
        '    }',

        '    return value;',
        '}',
    ].join( '\n' ),

    colorOverLifetime: [
        'vec3 getColorOverLifetime( in float positionInTime, in vec3 color1, in vec3 color2, in vec3 color3, in vec3 color4 ) {',
        '    vec3 value = vec3( 0.0 );',
        '    value.x = getFloatOverLifetime( positionInTime, vec4( color1.x, color2.x, color3.x, color4.x ) );',
        '    value.y = getFloatOverLifetime( positionInTime, vec4( color1.y, color2.y, color3.y, color4.y ) );',
        '    value.z = getFloatOverLifetime( positionInTime, vec4( color1.z, color2.z, color3.z, color4.z ) );',
        '    return value;',
        '}',
    ].join( '\n' ),

    paramFetchingFunctions: [
        'float getAlive() {',
        '   return params.x;',
        '}',

        'float getAge() {',
        '   return params.y;',
        '}',

        'float getMaxAge() {',
        // '   return max( getAge(), params.z );',
        '   return params.z;',
        '}',

        'float getWiggle() {',
        '   return params.w;',
        '}',
    ].join( '\n' ),

    forceFetchingFunctions: [
        'vec4 getPosition( in float age ) {',
        '   return modelViewMatrix * vec4( position, 1.0 );',
        '}',

        'vec3 getVelocity( in float age ) {',
        '   return velocity * age;',
        '}',

        'vec3 getAcceleration( in float age ) {',
        '   return acceleration.xyz * age;',
        '}',
    ].join( '\n' ),


    rotationFunctions: [
        // Huge thanks to:
        // - http://www.neilmendoza.com/glsl-rotation-about-an-arbitrary-axis/
        '#ifdef SHOULD_ROTATE_PARTICLES',
        '   mat4 getRotationMatrix( in vec3 axis, in float angle) {',
        '       axis = normalize(axis);',
        '       float s = sin(angle);',
        '       float c = cos(angle);',
        '       float oc = 1.0 - c;',

        '       return mat4(oc * axis.x * axis.x + c,           oc * axis.x * axis.y - axis.z * s,  oc * axis.z * axis.x + axis.y * s,  0.0,',
        '                   oc * axis.x * axis.y + axis.z * s,  oc * axis.y * axis.y + c,           oc * axis.y * axis.z - axis.x * s,  0.0,',
        '                   oc * axis.z * axis.x - axis.y * s,  oc * axis.y * axis.z + axis.x * s,  oc * axis.z * axis.z + c,           0.0,',
        '                   0.0,                                0.0,                                0.0,                                1.0);',
        '   }',

        '   vec3 getRotation( in vec3 pos, in float positionInTime ) {',
        '      vec3 axis = unpackColor( rotation.x );',
        '      vec3 center = rotationCenter;',
        '      vec3 translated;',
        '      mat4 rotationMatrix;',

        '      pos *= -1.0;',

        '      float angle = 0.0;',
        '      angle += when_eq( rotation.z, 0.0 ) * rotation.y;',
        '      angle += when_gt( rotation.z, 0.0 ) * mix( 0.0, rotation.y, positionInTime );',
        '      translated = rotationCenter - pos;',
        '      rotationMatrix = getRotationMatrix( axis, angle );',
        '      return center + vec3( rotationMatrix * vec4( translated, 1.0 ) );',
        '   }',
        '#endif'
    ].join( '\n' ),


    // Fragment chunks
    rotateTexture: [
        '    vec2 vUv = vec2( gl_PointCoord.x, 1.0 - gl_PointCoord.y );',
        '',
        '    #ifdef SHOULD_ROTATE_TEXTURE',
        '       float x = gl_PointCoord.x - 0.5;',
        '       float y = 1.0 - gl_PointCoord.y - 0.5;',
        '       float c = cos( -vAngle );',
        '       float s = sin( -vAngle );',

        '       vUv = vec2( c * x + s * y + 0.5, c * y - s * x + 0.5 );',
        '    #endif',
        '',

        // Spritesheets overwrite angle calculations.
        '    #ifdef SHOULD_CALCULATE_SPRITE',
        '        float age = vLifetime.x;',
        '        float maxAge = vLifetime.y;',
        '        float positionInTime = vLifetime.z;',

        '        float framesX = textureAnimation.x;',
        '        float framesY = textureAnimation.y;',
        '        float loopCount = textureAnimation.w;',
        '        float totalFrames = textureAnimation.z;',
        '        float frameNumber = mod( (positionInTime * loopCount) * totalFrames, totalFrames );',

        '        float column = floor(mod( frameNumber, framesX ));',
        '        float row = floor( (frameNumber - column) / framesX );',

        '        float columnNorm = column / framesX;',
        '        float rowNorm = row / framesY;',

        '        vUv.x = gl_PointCoord.x * (1.0/framesX) + columnNorm;',
        '        vUv.y = 1.0 - (gl_PointCoord.y * (1.0/framesY) + rowNorm);',
        '    #endif',

        '',
        '    vec4 rotatedTexture = texture2D( texture, vUv );',
    ].join( '\n' )
};;

SPE.shaders = {
    vertex: [
        SPE.shaderChunks.defines,
        SPE.shaderChunks.uniforms,
        SPE.shaderChunks.attributes,
        SPE.shaderChunks.varyings,

        THREE.ShaderChunk[ "common" ],
        THREE.ShaderChunk[ "logdepthbuf_pars_vertex" ],

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
        '    highp float age = getAge();',
        '    highp float alive = getAlive();',
        '    highp float maxAge = getMaxAge();',
        '    highp float positionInTime = (age / maxAge);',
        '    highp float isAlive = when_eq( alive, 1.0 );',

        '    #ifdef SHOULD_WIGGLE_PARTICLES',
        '        float wiggleAmount = positionInTime * getWiggle();',
        '        float wiggleSin = isAlive * sin( wiggleAmount );',
        '        float wiggleCos = isAlive * cos( wiggleAmount );',
        '    #endif',

        // Save the positionInTime value to a varying so
        // it can be accessed in the fragment shader to
        // animate textures.
        '#ifdef SHOULD_CALCULATE_SPRITE',
        '    vLifetime = vec3( age, maxAge, positionInTime );',
        '#endif',

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
        '    float drag = 1.0 - (positionInTime * 0.5) * acceleration.w;',
        // 'float drag = 1.0;',

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

        THREE.ShaderChunk[ "logdepthbuf_vertex" ],

        '}'
    ].join( '\n' ),

    fragment: [
        SPE.shaderChunks.uniforms,

        THREE.ShaderChunk[ "common" ],
        THREE.ShaderChunk[ "fog_pars_fragment" ],
        THREE.ShaderChunk[ "logdepthbuf_pars_fragment" ],

        SPE.shaderChunks.varyings,

        SPE.shaderChunks.branchAvoidanceFunctions,

        'void main() {',
        '    vec3 outgoingLight = vColor.xyz;',

        SPE.shaderChunks.rotateTexture,

        THREE.ShaderChunk[ "logdepthbuf_fragment" ],

        '    outgoingLight = vColor.xyz * rotatedTexture.xyz;',

        THREE.ShaderChunk[ "fog_fragment" ],

        '    gl_FragColor = vec4( outgoingLight.xyz, rotatedTexture.w * vColor.w );',
        '}'
    ].join( '\n' )
};;

SPE.utils = {
    types: {
        BOOLEAN: 'boolean',
        STRING: 'string',
        NUMBER: 'number',
        OBJECT: 'object'
    },

    ensureTypedArg: function( arg, type, defaultValue ) {
        if ( typeof arg === type ) {
            return arg;
        }
        else {
            return defaultValue;
        }
    },

    ensureArrayTypedArg: function( arg, type, defaultValue ) {
        // If the argument being checked is an array, loop through
        // it and ensure all the values are of the correct type,
        // falling back to the defaultValue if any aren't.
        if ( Array.isArray( arg ) ) {
            for ( var i = arg.length - 1; i >= 0; --i ) {
                if ( typeof arg[ i ] !== type ) {
                    return defaultValue;
                }
            }

            return arg;
        }

        // If the arg isn't an array then just fallback to
        // checking the type.
        return this.ensureTypedArg( arg, type, defaultValue );
    },

    ensureInstanceOf: function( arg, instance, defaultValue ) {
        if ( instance !== undefined && arg instanceof instance ) {
            return arg;
        }
        else {
            return defaultValue;
        }
    },

    ensureArrayInstanceOf: function( arg, instance, defaultValue ) {
        // If the argument being checked is an array, loop through
        // it and ensure all the values are of the correct type,
        // falling back to the defaultValue if any aren't.
        if ( Array.isArray( arg ) ) {
            for ( var i = arg.length - 1; i >= 0; --i ) {
                if ( instance !== undefined && arg[ i ] instanceof instance === false ) {
                    return defaultValue;
                }
            }

            return arg;
        }

        // If the arg isn't an array then just fallback to
        // checking the type.
        return this.ensureInstanceOf( arg, instance, defaultValue );
    },


    // A bit of a long-winded name, this one, but it ensures that
    // a value-over-lifetime SPE.Emitter object has `value` and
    // `spread` are of equal length, and no longer than the `maxLength`
    // argument.
    ensureValueOverLifetimeCompliance: function( property, minLength, maxLength ) {
        minLength = minLength || 3;
        maxLength = maxLength || 3;

        // First, ensure both properties are arrays.
        if ( Array.isArray( property._value ) === false ) {
            property._value = [ property._value ];
        }

        if ( Array.isArray( property._spread ) === false ) {
            property._spread = [ property._spread ];
        }

        var valueLength = this.clamp( property._value.length, minLength, maxLength ),
            spreadLength = this.clamp( property._spread.length, minLength, maxLength ),
            desiredLength = Math.max( valueLength, spreadLength );

        property._value = this.interpolateArray( property._value, desiredLength );
        property._spread = this.interpolateArray( property._spread, desiredLength );
    },


    // Perform a linear interpolation of an array.
    //
    // Example:
    //  srcArray = [1, 10];
    //  newLength = 10;
    //
    //  returns [1, 2, 3, 4, 5, 6, 7, 8, 9, 10];
    interpolateArray: function( srcArray, newLength ) {
        var newArray = [ srcArray[ 0 ] ],
            factor = ( srcArray.length - 1 ) / ( newLength - 1 );

        for ( var i = 1; i < newLength - 1; ++i ) {
            var f = i * factor,
                before = Math.floor( f ),
                after = Math.ceil( f ),
                delta = f - before;

            newArray[ i ] = this.lerpTypeAgnostic( srcArray[ before ], srcArray[ after ], delta );
        }

        newArray.push( srcArray[ srcArray.length - 1 ] );

        return newArray;
    },

    clamp: function( value, min, max ) {
        return Math.max( min, Math.min( value, max ) );
    },

    zeroToEpsilon: function( value, randomise ) {
        var epsilon = 0.00001,
            result = value;

        if ( value === 0 ) {
            result = randomise ? Math.random() * epsilon * 10 : epsilon;
        }

        else if ( value > 0 && value < epsilon ) {
            result = randomise ? Math.random() * epsilon * 10 : epsilon;;
        }
        else if ( value < 0 && value > -epsilon ) {
            result = -( randomise ? Math.random() * epsilon * 10 : epsilon );
        }

        return result;
    },

    // Linearly interpolate two values.
    //
    // `start` and `end` values MUST be of the same type/instance
    //
    // Supported types/instances:
    //  - Number
    //  - THREE.Vector2
    //  - THREE.Vector3
    //  - THREE.Vector4
    //  - THREE.Color
    lerpTypeAgnostic: function( start, end, delta ) {
        var types = this.types,
            out;

        if ( typeof start === types.NUMBER && typeof end === types.NUMBER ) {
            return start + ( ( end - start ) * delta );
        }
        else if ( start instanceof THREE.Vector2 && end instanceof THREE.Vector2 ) {
            out = start.clone();
            out.x = this.lerp( start.x, end.x, delta );
            out.y = this.lerp( start.y, end.y, delta );
            return out;
        }
        else if ( start instanceof THREE.Vector3 && end instanceof THREE.Vector3 ) {
            out = start.clone();
            out.x = this.lerp( start.x, end.x, delta );
            out.y = this.lerp( start.y, end.y, delta );
            out.z = this.lerp( start.z, end.z, delta );
            return out;
        }
        else if ( start instanceof THREE.Vector4 && end instanceof THREE.Vector4 ) {
            out = start.clone();
            out.x = this.lerp( start.x, end.x, delta );
            out.y = this.lerp( start.y, end.y, delta );
            out.z = this.lerp( start.z, end.z, delta );
            out.w = this.lerp( start.w, end.w, delta );
            return out;
        }
        else if ( start instanceof THREE.Color && end instanceof THREE.Color ) {
            out = start.clone();
            out.r = this.lerp( start.r, end.r, delta );
            out.g = this.lerp( start.g, end.g, delta );
            out.b = this.lerp( start.b, end.b, delta );
            return out;
        }
        else {
            console.warn( "Invalid argument types, or argument types do not match:", start, end );
        }
    },

    lerp: function( start, end, delta ) {
        return start + ( ( end - start ) * delta );
    },

    roundToNearestMultiple: function( n, multiple ) {
        if ( multiple === 0 ) {
            return n;
        }

        var remainder = Math.abs( n ) % multiple;

        if ( remainder === 0 ) {
            return n;
        }

        if ( n < 0 ) {
            return -( Math.abs( n ) - remainder );
        }

        return n + multiple - remainder;
    },

    arrayValuesAreEqual: function( array ) {
        for ( var i = 0; i < array.length - 1; ++i ) {
            if ( array[ i ] !== array[ i + 1 ] ) {
                return false;
            }
        }

        return true;
    },

    // colorsAreEqual: function() {
    //     var colors = Array.prototype.slice.call( arguments ),
    //         numColors = colors.length;

    //     for ( var i = 0, color1, color2; i < numColors - 1; ++i ) {
    //         color1 = colors[ i ];
    //         color2 = colors[ i + 1 ];

    //         if (
    //             color1.r !== color2.r ||
    //             color1.g !== color2.g ||
    //             color1.b !== color2.b
    //         ) {
    //             return false
    //         }
    //     }

    //     return true;
    // },


    randomFloat: function( base, spread ) {
        return base + spread * ( Math.random() - 0.5 );
    },

    // TODO: Use this.randomFloat to add spread values in random* functions?
    randomVector3: function( attribute, index, base, spread, spreadClamp ) {
        var x = base.x + ( Math.random() * spread.x - ( spread.x * 0.5 ) ),
            y = base.y + ( Math.random() * spread.y - ( spread.y * 0.5 ) ),
            z = base.z + ( Math.random() * spread.z - ( spread.z * 0.5 ) );

        // console.log( x, y, z );
        if ( spreadClamp ) {
            x = -spreadClamp.x * 0.5 + this.roundToNearestMultiple( x, spreadClamp.x );
            y = -spreadClamp.y * 0.5 + this.roundToNearestMultiple( y, spreadClamp.y );
            z = -spreadClamp.z * 0.5 + this.roundToNearestMultiple( z, spreadClamp.z );
        }
        // console.log( x, y, z );
        // console.log( '\n\n' );

        attribute.typedArray.setVec3Components( index, x, y, z );
    },

    randomColor: function( attribute, index, base, spread ) {
        var r = base.r + ( Math.random() * spread.x ),
            g = base.g + ( Math.random() * spread.y ),
            b = base.b + ( Math.random() * spread.z );

        r = this.clamp( r, 0, 1 );
        g = this.clamp( g, 0, 1 );
        b = this.clamp( b, 0, 1 );


        attribute.typedArray.setVec3Components( index, r, g, b );
    },

    randomColorAsHex: ( function() {
        var workingColor = new THREE.Color();

        return function( attribute, index, base, spread ) {
            var numItems = base.length,
                colors = [];

            for ( var i = 0; i < numItems; ++i ) {
                var spreadVector = spread[ i ];

                workingColor.copy( base[ i ] );

                workingColor.r += ( Math.random() * spreadVector.x ) - ( spreadVector.x / 2 );
                workingColor.g += ( Math.random() * spreadVector.y ) - ( spreadVector.y / 2 );
                workingColor.b += ( Math.random() * spreadVector.z ) - ( spreadVector.z / 2 );

                workingColor.r = this.clamp( workingColor.r, 0, 1 );
                workingColor.g = this.clamp( workingColor.g, 0, 1 );
                workingColor.b = this.clamp( workingColor.b, 0, 1 );

                colors.push( workingColor.getHex() );
            }

            attribute.typedArray.setVec4Components( index, colors[ 0 ], colors[ 1 ], colors[ 2 ], colors[ 3 ] );
        };
    }() ),

    randomVector3OnSphere: function( attribute, index, base, radius, radiusSpread, radiusScale, radiusSpreadClamp ) {
        var depth = 2 * Math.random() - 1,
            t = 6.2832 * Math.random(),
            r = Math.sqrt( 1 - depth * depth ),
            rand = this.randomFloat( radius, radiusSpread ),
            x = 0,
            y = 0,
            z = 0;

        if ( radiusSpreadClamp ) {
            rand = Math.round( rand / radiusSpreadClamp ) * radiusSpreadClamp;
        }

        // Set position on sphere
        x = r * Math.cos( t ) * rand;
        y = r * Math.sin( t ) * rand;
        z = depth * rand;

        // Apply radius scale to this position
        x *= radiusScale.x;
        y *= radiusScale.y;
        z *= radiusScale.z;

        // Translate to the base position.
        x += base.x;
        y += base.y;
        z += base.z;

        // Set the values in the typed array.
        attribute.typedArray.setVec3Components( index, x, y, z );
    },

    randomVector3OnDisc: function( attribute, index, base, radius, radiusSpread, radiusScale, radiusSpreadClamp ) {
        var t = 6.2832 * Math.random(),
            rand = Math.abs( this.randomFloat( radius, radiusSpread ) ),
            x = 0,
            y = 0,
            z = 0;

        if ( radiusSpreadClamp ) {
            rand = Math.round( rand / radiusSpreadClamp ) * radiusSpreadClamp;
        }

        // Set position on sphere
        x = Math.cos( t ) * rand;
        y = Math.sin( t ) * rand;

        // Apply radius scale to this position
        x *= radiusScale.x;
        y *= radiusScale.y;

        // Translate to the base position.
        x += base.x;
        y += base.y;
        z += base.z;

        // Set the values in the typed array.
        attribute.typedArray.setVec3Components( index, x, y, z );
    },


    randomDirectionVector3OnSphere: ( function() {
        var v = new THREE.Vector3();

        return function( attribute, index, posX, posY, posZ, emitterPosition, speed, speedSpread ) {
            v.copy( emitterPosition );

            v.x -= posX;
            v.y -= posY;
            v.z -= posZ;

            v.normalize().multiplyScalar( -this.randomFloat( speed, speedSpread ) );

            attribute.typedArray.setVec3Components( index, v.x, v.y, v.z );
        };
    }() ),

    getPackedRotationAxis: ( function() {
        var v = new THREE.Vector3(),
            vSpread = new THREE.Vector3(),
            c = new THREE.Color();

        return function( axis, axisSpread ) {
            v.copy( axis ).normalize();
            vSpread.copy( axisSpread ).normalize();

            v.x += ( -axisSpread.x * 0.5 ) + ( Math.random() * axisSpread.x );
            v.y += ( -axisSpread.y * 0.5 ) + ( Math.random() * axisSpread.y );
            v.z += ( -axisSpread.z * 0.5 ) + ( Math.random() * axisSpread.z );

            v.x = Math.abs( v.x );
            v.y = Math.abs( v.y );
            v.z = Math.abs( v.z );

            v.normalize();

            c.setRGB( v.x, v.y, v.z );
            return c.getHex();
        };
    }() )
};;

SPE.Group = function( options ) {
    var utils = SPE.utils,
        types = utils.types;

    // Ensure we have a map of options to play with
    options = utils.ensureTypedArg( options, types.OBJECT, {} );
    options.texture = utils.ensureTypedArg( options.texture, types.OBJECT, {} );

    // Assign a UUID to this instance
    this.uuid = THREE.Math.generateUUID();

    // If no `deltaTime` value is passed to the `SPE.Group.tick` function,
    // the value of this property will be used to advance the simulation.
    this.fixedTimeStep = utils.ensureTypedArg( options.fixedTimeStep, types.NUMBER, 0.016 );

    // Set properties used in the uniforms map, starting with the
    // texture stuff.
    this.texture = utils.ensureInstanceOf( options.texture.value, THREE.Texture, null );
    this.textureFrames = utils.ensureInstanceOf( options.texture.frames, THREE.Vector2, new THREE.Vector2( 1, 1 ) );
    this.textureFrameCount = utils.ensureTypedArg( options.texture.frameCount, types.NUMBER, this.textureFrames.x * this.textureFrames.y );
    this.textureLoop = utils.ensureTypedArg( options.texture.loop, types.NUMBER, 1 );
    this.textureFrames.max( new THREE.Vector2( 1, 1 ) );

    this.hasPerspective = utils.ensureTypedArg( options.hasPerspective, types.BOOLEAN, true );
    this.colorize = utils.ensureTypedArg( options.colorize, types.BOOLEAN, true );


    // Set properties used to define the ShaderMaterial's appearance.
    this.blending = utils.ensureTypedArg( options.blending, types.NUMBER, THREE.AdditiveBlending );
    this.transparent = utils.ensureTypedArg( options.transparent, types.BOOLEAN, true );
    this.alphaTest = utils.ensureTypedArg( options.alphaTest, types.NUMBER, 0.5 );
    this.depthWrite = utils.ensureTypedArg( options.depthWrite, types.BOOLEAN, false );
    this.depthTest = utils.ensureTypedArg( options.depthTest, types.BOOLEAN, true );
    this.fog = utils.ensureTypedArg( options.fog, types.BOOLEAN, true );
    // this.fogColor = utils.ensureInstanceOf( options.fogColor, THREE.Color, new THREE.Color() );
    this.scale = utils.ensureTypedArg( options.scale, types.NUMBER, 300 );

    // Where emitter's go to curl up in a warm blanket and live
    // out their days.
    this.emitters = [];
    this.emitterIDs = [];

    // Create properties for use by the emitter pooling functions.
    this._pool = [];
    this._poolCreationSettings = null;
    this._createNewWhenPoolEmpty = 0;


    // Map of uniforms to be applied to the ShaderMaterial instance.
    this.uniforms = {
        texture: {
            type: 't',
            value: this.texture
        },
        textureAnimation: {
            type: 'v4',
            value: new THREE.Vector4(
                this.textureFrames.x,
                this.textureFrames.y,
                this.textureFrameCount,
                Math.max( Math.abs( this.textureLoop ), 1.0 )
            )
        },
        fogColor: {
            type: 'c',
            value: this.fogColor
        },
        fogNear: {
            type: 'f',
            value: 10
        },
        fogFar: {
            type: 'f',
            value: 200
        },
        fogDensity: {
            type: 'f',
            value: 0.5
        },
        deltaTime: {
            type: 'f',
            value: 0
        },
        runTime: {
            type: 'f',
            value: 0
        },
        scale: {
            type: 'f',
            value: this.scale
        }
    };

    // Add some defines into the mix...
    this.defines = {
        HAS_PERSPECTIVE: this.hasPerspective,
        COLORIZE: this.colorize,
        VALUE_OVER_LIFETIME_LENGTH: SPE.valueOverLifetimeLength,

        SHOULD_ROTATE_TEXTURE: false,
        SHOULD_ROTATE_PARTICLES: false,
        SHOULD_WIGGLE_PARTICLES: false,

        SHOULD_CALCULATE_SPRITE: this.textureFrames.x > 1 || this.textureFrames.y > 1
    };

    // Map of all attributes to be applied to the particles.
    //
    // See SPE.ShaderAttribute for a bit more info on this bit.
    this.attributes = {
        position: new SPE.ShaderAttribute( 'v3', true ),
        acceleration: new SPE.ShaderAttribute( 'v4', true ), // w component is drag
        velocity: new SPE.ShaderAttribute( 'v3', true ),
        rotation: new SPE.ShaderAttribute( 'v4', true ),
        rotationCenter: new SPE.ShaderAttribute( 'v3', true ),
        params: new SPE.ShaderAttribute( 'v4', true ), // Holds (alive, age, delay, wiggle)
        size: new SPE.ShaderAttribute( 'v4', true ),
        angle: new SPE.ShaderAttribute( 'v4', true ),
        color: new SPE.ShaderAttribute( 'v4' ),
        opacity: new SPE.ShaderAttribute( 'v4', true )
    };

    this.attributeKeys = Object.keys( this.attributes );
    this.attributeCount = this.attributeKeys.length;

    // Create the ShaderMaterial instance that'll help render the
    // particles.
    this.material = new THREE.ShaderMaterial( {
        uniforms: this.uniforms,
        vertexShader: SPE.shaders.vertex,
        fragmentShader: SPE.shaders.fragment,
        blending: this.blending,
        transparent: this.transparent,
        alphaTest: this.alphaTest,
        depthWrite: this.depthWrite,
        depthTest: this.depthTest,
        defines: this.defines,
        fog: this.fog
    } );

    // Create the BufferGeometry and Points instances, ensuring
    // the geometry and material are given to the latter.
    this.geometry = new THREE.BufferGeometry();
    this.mesh = new THREE.Points( this.geometry, this.material );
};

SPE.Group.constructor = SPE.Group;


SPE.Group.prototype._updateDefines = function( emitter ) {
    // Only do angle calculation if there's no spritesheet defined.
    //
    // Saves calculations being done and then overwritten in the shaders.
    if ( !this.defines.SHOULD_CALCULATE_SPRITE ) {
        this.defines.SHOULD_ROTATE_TEXTURE = this.defines.SHOULD_ROTATE_TEXTURE || !!Math.max(
            Math.max.apply( null, emitter.angle.value ),
            Math.max.apply( null, emitter.angle.spread )
        );
    }

    this.defines.SHOULD_ROTATE_PARTICLES = this.defines.SHOULD_ROTATE_PARTICLES || !!Math.max(
        emitter.rotation.angle,
        emitter.rotation.angleSpread
    );

    this.defines.SHOULD_WIGGLE_PARTICLES = this.defines.SHOULD_WIGGLE_PARTICLES || !!Math.max(
        emitter.wiggle.value,
        emitter.wiggle.spread
    );
};

SPE.Group.prototype._applyAttributesToGeometry = function() {
    var attributes = this.attributes,
        geometry = this.geometry,
        geometryAttributes = geometry.attributes,
        attribute,
        geometryAttribute;

    for ( var attr in attributes ) {
        attribute = attributes[ attr ];

        // Update the array if this attribute exists on the geometry.
        //
        // This needs to be done because the attribute's typed array might have
        // been resized and reinstantiated, and might now be looking at a
        // different ArrayBuffer, so reference needs updating.
        if ( geometryAttribute = geometryAttributes[ attr ] ) {
            geometryAttribute.array = attribute.typedArray.array;
        }

        // Add the attribute to the geometry if it doesn't already exist.
        else {
            geometry.addAttribute( attr, attribute.bufferAttribute );
        }

        attribute.bufferAttribute.needsUpdate = true;
    }
};

SPE.Group.prototype.addEmitter = function( emitter ) {
    // Ensure an actual emitter instance is passed here.
    //
    // Decided not to throw here, just in case a scene's
    // rendering would be paused. Logging an error instead
    // of stopping execution if exceptions aren't caught.
    if ( emitter instanceof SPE.Emitter === false ) {
        console.error( '`emitter` argument must be instance of SPE.Emitter. Was provided with:', emitter );
        return;
    }
    else if ( this.emitterIDs.indexOf( emitter.uuid ) > -1 ) {
        console.warn( 'Emitter already exists in this group. Will not add again.' );
        return;
    }


    console.time( 'SPE.Group.prototype.addEmitter' );


    var attributes = this.attributes,
        start = attributes.position.getLength() / 3,
        totalParticleCount = start + emitter.particleCount,
        utils = SPE.utils;

    // Set the `particlesPerSecond` value (PPS) on the emitter.
    // It's used to determine how many particles to release
    // on a per-frame basis.
    emitter._calculatePPSValue( emitter.maxAge._value + emitter.maxAge._spread );
    emitter._setBufferUpdateRanges( this.attributeKeys );

    // Store the offset value in the TypedArray attributes for this emitter.
    emitter.attributeOffset = start;
    emitter.activationIndex = start;

    // Store reference to the attributes on the emitter for
    // easier access during the emitter's tick function.
    emitter.attributes = this.attributes;



    // Ensure the attributes and their BufferAttributes exist, and their
    // TypedArrays are of the correct size.
    for ( var attr in attributes ) {
        attributes[ attr ]._createBufferAttribute( totalParticleCount );
    }



    // Loop through each particle this emitter wants to have, and create the attributes values,
    // storing them in the TypedArrays that each attribute holds.
    //
    // TODO: Optimise this!
    for ( var i = start, relativeIndex, particleStartTime; i < totalParticleCount; ++i ) {
        relativeIndex = i - start;
        particleStartTime = relativeIndex / emitter.particlesPerSecond;

        emitter._assignPositionValue( i );
        emitter._assignForceValue( i, 'velocity' );
        emitter._assignForceValue( i, 'acceleration' );
        emitter._assignLifetimeValue( i, 'opacity' );
        emitter._assignLifetimeValue( i, 'size' );
        emitter._assignAngleValue( i );
        emitter._assignRotationValue( i );
        emitter._assignParamsValue( i );
        emitter._assignColorValue( i );

        // alive, age, maxAge, wiggle
        // attributes.params.typedArray.setVec4Components( i,
        //     emitter.isStatic ? 1 : 0,
        //     0,
        //     Math.abs( utils.randomFloat( emitter.maxAge._value, emitter.maxAge._spread ) ),
        //     utils.randomFloat( emitter.wiggle._value, emitter.wiggle._spread )
        // );

    }

    // Update the geometry and make sure the attributes are referencing
    // the typed arrays properly.
    this._applyAttributesToGeometry();

    // Store this emitter in this group's emitter's store.
    this.emitters.push( emitter );
    this.emitterIDs.push( emitter.uuid );

    // Update certain flags to enable shader calculations only if they're necessary.
    this._updateDefines( emitter );

    // Update the material since defines might have changed
    this.material.needsUpdate = true;

    console.timeEnd( 'SPE.Group.prototype.addEmitter' );

    return this;
};

SPE.Group.prototype.removeEmitter = function( emitter ) {
    var emitterIndex = this.emitterIDs.indexOf( emitter.uuid );

    // Ensure an actual emitter instance is passed here.
    //
    // Decided not to throw here, just in case a scene's
    // rendering would be paused. Logging an error instead
    // of stopping execution if exceptions aren't caught.
    if ( emitter instanceof SPE.Emitter === false ) {
        console.error( '`emitter` argument must be instance of SPE.Emitter. Was provided with:', emitter );
        return;
    }
    else if ( emitterIndex === -1 ) {
        console.warn( 'Emitter does not exist in this group. Will not remove.' );
        return;
    }

    // Kill all particles
    var start = emitter.attributeOffset,
        end = start + emitter.particleCount,
        params = this.attributes.params.typedArray;

    for ( var i = start; i < end; ++i ) {
        params.array[ i * 4 ] = 0.0;
        params.array[ i * 4 + 1 ] = 0.0;
    }

    this.emitters.splice( emitterIndex, 1 );
    this.emitterIDs.splice( emitterIndex, 1 );

    this.attributes.params.bufferAttribute.updateRange.count = -1;
    this.attributes.params.bufferAttribute.needsUpdate = true;
};

SPE.Group.prototype._updateUniforms = function( dt ) {
    this.uniforms.runTime.value += dt;
    this.uniforms.deltaTime.value = dt;
};

/**
 * Fetch a single emitter instance from the pool.
 * If there are no objects in the pool, a new emitter will be
 * created if specified.
 *
 * @return {ShaderParticleEmitter | null}
 */
SPE.Group.prototype.getFromPool = function() {
    var that = this,
        pool = that._pool,
        createNew = that._createNewWhenPoolEmpty;

    if ( pool.length ) {
        return pool.pop();
    }
    else if ( createNew ) {
        return new SPE.Emitter( that._poolCreationSettings );
    }

    return null;
},


/**
 * Release an emitter into the pool.
 *
 * @param  {ShaderParticleEmitter} emitter
 * @return {this}
 */
SPE.Group.prototype.releaseIntoPool = function( emitter ) {
    if ( !( emitter instanceof SPE.Emitter ) ) {
        console.error( 'Will not add non-emitter to particle group pool:', emitter );
        return;
    }

    emitter.reset();
    this._pool.unshift( emitter );

    return this;
};


/**
 * Get the pool array
 *
 * @return {Array}
 */
SPE.Group.prototype.getPool = function() {
    return this._pool;
};


/**
 * Add a pool of emitters to this particle group
 *
 * @param {Number} numEmitters      The number of emitters to add to the pool.
 * @param {Object} emitterSettings  An object describing the settings to pass to each emitter.
 * @param {Boolean} createNew       Should a new emitter be created if the pool runs out?
 * @return {this}
 */
SPE.Group.prototype.addPool = function( numEmitters, emitterSettings, createNew ) {
    var that = this,
        emitter;

    // Save relevant settings and flags.
    that._poolCreationSettings = emitterSettings;
    that._createNewWhenPoolEmpty = !!createNew;

    // Create the emitters, add them to this group and the pool.
    for ( var i = 0; i < numEmitters; ++i ) {
        emitter = new SPE.Emitter( emitterSettings );
        that.addEmitter( emitter );
        that.releaseIntoPool( emitter );
    }

    return that;
};


/**
 * Internal method. Sets a single emitter to be alive
 *
 * @private
 *
 * @param  {THREE.Vector3} pos
 * @return {this}
 */
SPE.Group.prototype._triggerSingleEmitter = function( pos ) {
    var that = this,
        emitter = that.getFromPool();

    if ( emitter === null ) {
        console.log( 'SPE.Group pool ran out.' );
        return;
    }

    // TODO:
    // - Make sure buffers are update with thus new position.
    if ( pos instanceof THREE.Vector3 ) {
        emitter.position.value.copy( pos );
    }

    emitter.enable();

    setTimeout( function() {
        emitter.disable();
        that.releaseIntoPool( emitter );
    }, emitter.maxAge.value + emitter.maxAge.spread );

    return that;
};


/**
 * Set a given number of emitters as alive, with an optional position
 * vector3 to move them to.
 *
 * @param  {Number} numEmitters
 * @param  {THREE.Vector3} position
 * @return {this}
 */
SPE.Group.prototype.triggerPoolEmitter = function( numEmitters, position ) {
    var that = this;

    if ( typeof numEmitters === 'number' && numEmitters > 1 ) {
        for ( var i = 0; i < numEmitters; ++i ) {
            that._triggerSingleEmitter( position );
        }
    }
    else {
        that._triggerSingleEmitter( position );
    }

    return that;
};


SPE.Group.prototype._resetBufferRanges = function() {
    var keys = this.attributeKeys,
        i = this.attributeCount - 1,
        attrs = this.attributes;

    for ( i; i >= 0; --i ) {
        attrs[ keys[ i ] ].resetUpdateRange();
    }
};


SPE.Group.prototype._updateBuffers = function( emitter ) {
    var keys = this.attributeKeys,
        i = this.attributeCount - 1,
        attrs = this.attributes,
        emitterRanges = emitter.bufferUpdateRanges,
        key,
        emitterAttr,
        attr;

    for ( i; i >= 0; --i ) {
        key = keys[ i ];
        emitterAttr = emitterRanges[ key ];
        attr = attrs[ key ];
        attr.setUpdateRange( emitterAttr.min, emitterAttr.max );
        // attr.setUpdateRange( 0, 1000000 );
        attr.flagUpdate();
    }
};


SPE.Group.prototype.tick = function( dt ) {
    var emitters = this.emitters,
        numEmitters = emitters.length,
        deltaTime = dt || this.fixedTimeStep,
        bufferUpdateRanges = this.bufferUpdateRanges;

    if ( numEmitters === 0 ) {
        return;
    }

    this._updateUniforms( deltaTime );
    this._resetBufferRanges();

    for ( var i = 0, emitter; i < numEmitters; ++i ) {
        emitter = emitters[ i ];
        emitter.tick( deltaTime );
        this._updateBuffers( emitter );
    }
};;

SPE.Emitter = function( options ) {
    var utils = SPE.utils,
        types = utils.types,
        lifetimeLength = SPE.valueOverLifetimeLength;

    // Ensure we have a map of options to play with,
    // and that each option is in the correct format.
    options = utils.ensureTypedArg( options, types.OBJECT, {} );
    options.position = utils.ensureTypedArg( options.position, types.OBJECT, {} );
    options.velocity = utils.ensureTypedArg( options.velocity, types.OBJECT, {} );
    options.acceleration = utils.ensureTypedArg( options.acceleration, types.OBJECT, {} );
    options.radius = utils.ensureTypedArg( options.radius, types.OBJECT, {} );
    options.drag = utils.ensureTypedArg( options.drag, types.OBJECT, {} );
    options.rotation = utils.ensureTypedArg( options.rotation, types.OBJECT, {} );
    options.color = utils.ensureTypedArg( options.color, types.OBJECT, {} );
    options.opacity = utils.ensureTypedArg( options.opacity, types.OBJECT, {} );
    options.size = utils.ensureTypedArg( options.size, types.OBJECT, {} );
    options.angle = utils.ensureTypedArg( options.angle, types.OBJECT, {} );
    options.wiggle = utils.ensureTypedArg( options.wiggle, types.OBJECT, {} );
    options.maxAge = utils.ensureTypedArg( options.maxAge, types.OBJECT, {} );

    this.uuid = THREE.Math.generateUUID();

    this.type = utils.ensureTypedArg( options.type, types.NUMBER, SPE.distributions.BOX );

    // Start assigning properties...kicking it off with props that DON'T support values over
    // lifetimes.
    //
    // Btw, values over lifetimes are just the new way of referring to *Start, *Middle, and *End.
    this.position = {
        _value: utils.ensureInstanceOf( options.position.value, THREE.Vector3, new THREE.Vector3() ),
        _spread: utils.ensureInstanceOf( options.position.spread, THREE.Vector3, new THREE.Vector3() ),
        _spreadClamp: utils.ensureInstanceOf( options.position.spreadClamp, THREE.Vector3, new THREE.Vector3() ),
        _distribution: utils.ensureTypedArg( options.position.distribution, types.NUMBER, this.type ),
        _randomise: utils.ensureTypedArg( options.position.randomise, types.BOOLEAN, false )
    };

    // TODO: Use this as the old `speed` property.
    this.velocity = {
        _value: utils.ensureInstanceOf( options.velocity.value, THREE.Vector3, new THREE.Vector3() ),
        _spread: utils.ensureInstanceOf( options.velocity.spread, THREE.Vector3, new THREE.Vector3() ),
        _distribution: utils.ensureTypedArg( options.velocity.distribution, types.NUMBER, this.type ),
        _randomise: utils.ensureTypedArg( options.position.randomise, types.BOOLEAN, false )
    };

    this.acceleration = {
        _value: utils.ensureInstanceOf( options.acceleration.value, THREE.Vector3, new THREE.Vector3() ),
        _spread: utils.ensureInstanceOf( options.acceleration.spread, THREE.Vector3, new THREE.Vector3() ),
        _distribution: utils.ensureTypedArg( options.acceleration.distribution, types.NUMBER, this.type ),
        _randomise: utils.ensureTypedArg( options.position.randomise, types.BOOLEAN, false )
    };

    this.radius = {
        _value: utils.ensureTypedArg( options.radius.value, types.NUMBER, 10 ),
        _spread: utils.ensureTypedArg( options.radius.spread, types.NUMBER, 0 ),
        _spreadClamp: utils.ensureTypedArg( options.radius.spreadClamp, types.NUMBER, 0 ),
        _scale: utils.ensureInstanceOf( options.radius.scale, THREE.Vector3, new THREE.Vector3( 1, 1, 1 ) ),
        _randomise: utils.ensureTypedArg( options.position.randomise, types.BOOLEAN, false )
    };

    this.drag = {
        _value: utils.ensureTypedArg( options.drag.value, types.NUMBER, 0 ),
        _spread: utils.ensureTypedArg( options.drag.spread, types.NUMBER, 0 ),
        _randomise: utils.ensureTypedArg( options.position.randomise, types.BOOLEAN, false )
    };

    this.wiggle = {
        _value: utils.ensureTypedArg( options.wiggle.value, types.NUMBER, 0 ),
        _spread: utils.ensureTypedArg( options.wiggle.spread, types.NUMBER, 0 )
    };


    this.rotation = {
        _axis: utils.ensureInstanceOf( options.rotation.axis, THREE.Vector3, new THREE.Vector3( 0.0, 1.0, 0.0 ) ),
        _axisSpread: utils.ensureInstanceOf( options.rotation.axisSpread, THREE.Vector3, new THREE.Vector3() ),
        _angle: utils.ensureTypedArg( options.rotation.angle, types.NUMBER, 0 ),
        _angleSpread: utils.ensureTypedArg( options.rotation.angleSpread, types.NUMBER, 0 ),
        _static: utils.ensureTypedArg( options.rotation.static, types.BOOLEAN, false ),
        _center: utils.ensureInstanceOf( options.rotation.center, THREE.Vector3, this.position._value ),
        _randomise: utils.ensureTypedArg( options.position.randomise, types.BOOLEAN, false )
    };


    this.maxAge = {
        _value: utils.ensureTypedArg( options.maxAge.value, types.NUMBER, 2 ),
        _spread: utils.ensureTypedArg( options.maxAge.spread, types.NUMBER, 0 )
    };



    // The following properties can support either single values, or an array of values that change
    // the property over a particle's lifetime (value over lifetime).
    this.color = {
        _value: utils.ensureArrayInstanceOf( options.color.value, THREE.Color, new THREE.Color() ),
        _spread: utils.ensureArrayInstanceOf( options.color.spread, THREE.Vector3, new THREE.Vector3() ),
        _randomise: utils.ensureTypedArg( options.position.randomise, types.BOOLEAN, false )
    };

    this.opacity = {
        _value: utils.ensureArrayTypedArg( options.opacity.value, types.NUMBER, 1 ),
        _spread: utils.ensureArrayTypedArg( options.opacity.spread, types.NUMBER, 0 ),
        _randomise: utils.ensureTypedArg( options.position.randomise, types.BOOLEAN, false )
    };

    this.size = {
        _value: utils.ensureArrayTypedArg( options.size.value, types.NUMBER, 1 ),
        _spread: utils.ensureArrayTypedArg( options.size.spread, types.NUMBER, 0 ),
        _randomise: utils.ensureTypedArg( options.position.randomise, types.BOOLEAN, false )
    };

    this.angle = {
        _value: utils.ensureArrayTypedArg( options.angle.value, types.NUMBER, 0 ),
        _spread: utils.ensureArrayTypedArg( options.angle.spread, types.NUMBER, 0 ),
        _randomise: utils.ensureTypedArg( options.position.randomise, types.BOOLEAN, false )
    };


    // Assign renaining option values.
    this.particleCount = utils.ensureTypedArg( options.particleCount, types.NUMBER, 100 );
    this.duration = utils.ensureTypedArg( options.duration, types.NUMBER, null );
    this.isStatic = utils.ensureTypedArg( options.isStatic, types.BOOLEAN, false );
    this.activeMultiplier = utils.ensureTypedArg( options.activeMultiplier, types.NUMBER, 1 );



    // The following properties are set internally and are not
    // user-controllable.
    this.particlesPerSecond = 0;

    // The current particle index for which particles should
    // be marked as active on the next update cycle.
    this.activationIndex = 0;

    // Whether this emitter is alive or not.
    this.alive = true;

    // Holds the time the emitter has been alive for.
    this.age = 0.0;

    // A set of flags to determine whether particular properties
    // should be re-randomised when a particle is reset.
    //
    // If a `randomise` property is given, this is preferred.
    // Otherwise, it looks at whether a spread value has been
    // given.
    //
    // It allows randomization to be turned off as desired. If
    // all randomization is turned off, then I'd expect a performance
    // boost as no attribute buffers (excluding the `params`)
    // would have to be re-passed to the GPU each frame (since nothing
    // except the `params` attribute would have changed).
    this.resetFlags = {
        // params: utils.ensureTypedArg( options.maxAge.randomise, types.BOOLEAN, !!options.maxAge.spread ) ||
        //     utils.ensureTypedArg( options.wiggle.randomise, types.BOOLEAN, !!options.wiggle.spread ),
        position: utils.ensureTypedArg( options.position.randomise, types.BOOLEAN, false ) ||
            utils.ensureTypedArg( options.radius.randomise, types.BOOLEAN, false ),
        velocity: utils.ensureTypedArg( options.velocity.randomise, types.BOOLEAN, false ),
        acceleration: utils.ensureTypedArg( options.acceleration.randomise, types.BOOLEAN, false ) ||
            utils.ensureTypedArg( options.drag.randomise, types.BOOLEAN, false ),
        rotation: utils.ensureTypedArg( options.rotation.randomise, types.BOOLEAN, false ),
        rotationCenter: utils.ensureTypedArg( options.rotation.randomise, types.BOOLEAN, false ),
        size: utils.ensureTypedArg( options.size.randomise, types.BOOLEAN, false ),
        color: utils.ensureTypedArg( options.color.randomise, types.BOOLEAN, false ),
        opacity: utils.ensureTypedArg( options.opacity.randomise, types.BOOLEAN, false ),
        angle: utils.ensureTypedArg( options.angle.randomise, types.BOOLEAN, false ),
    };

    this.updateFlags = {};
    this.updateCounts = {};

    // A map to indicate which emitter parameters should update
    // which attribute.
    this.updateMap = {
        maxAge: 'params',
        position: 'position', //
        velocity: 'velocity', //
        acceleration: 'acceleration', //
        radius: 'position', //
        drag: 'acceleration',
        wiggle: 'params',
        rotation: 'rotation',
        size: 'size',
        color: 'color',
        opacity: 'opacity',
        angle: 'angle'
    };

    for ( var i in this.updateMap ) {
        // this.updateFlags[ i ] = false;
        // this.updateCounts[ i ] = 0;
        this._createGetterSetters( this[ i ], i );
    }

    this.bufferUpdateRanges = {};
    this.attributeKeys = null;
    this.attributeCount = 0;


    // Ensure that the value-over-lifetime property objects above
    // have value and spread properties that are of the same length.
    //
    // Also, for now, make sure they have a length of 3 (min/max arguments here).
    utils.ensureValueOverLifetimeCompliance( this.color, lifetimeLength, lifetimeLength );
    utils.ensureValueOverLifetimeCompliance( this.opacity, lifetimeLength, lifetimeLength );
    utils.ensureValueOverLifetimeCompliance( this.size, lifetimeLength, lifetimeLength );
    utils.ensureValueOverLifetimeCompliance( this.angle, lifetimeLength, lifetimeLength );
};

SPE.Emitter.constructor = SPE.Emitter;

SPE.Emitter.prototype._createGetterSetters = function( propObj, propName ) {
    var self = this;

    for ( var i in propObj ) {
        var name = i.replace( '_', '' );

        Object.defineProperty( propObj, name, {
            get: ( function( prop ) {
                return function() {
                    return this[ prop ];
                };
            }( i ) ),

            set: ( function( prop ) {
                return function( value ) {
                    var mapName = self.updateMap[ propName ],
                        prevValue = this[ prop ],
                        length = SPE.valueOverLifetimeLength;

                    if ( prop === '_rotationCenter' ) {
                        self.updateFlags.rotationCenter = true;
                        self.updateCounts.rotationCenter = 0.0;
                    }
                    else if ( prop === '_randomise' ) {
                        self.resetFlags[ mapName ] = value;
                    }
                    else {
                        self.updateFlags[ mapName ] = true;
                        self.updateCounts[ mapName ] = 0.0;
                    }

                    this[ prop ] = value;

                    // If the previous value was an array, then make
                    // sure the provided value is interpolated correctly.
                    if ( Array.isArray( prevValue ) ) {
                        SPE.utils.ensureValueOverLifetimeCompliance( self[ propName ], length, length )
                    }
                };
            }( i ) )
        } )
    }
};

SPE.Emitter.prototype._setBufferUpdateRanges = function( keys ) {
    this.attributeKeys = keys;
    this.attributeCount = keys.length;

    for ( var i = this.attributeCount - 1; i >= 0; --i ) {
        this.bufferUpdateRanges[ keys[ i ] ] = {
            min: Number.POSITIVE_INFINITY,
            max: Number.NEGATIVE_INFINITY
        };
    }
};

SPE.Emitter.prototype._calculatePPSValue = function( groupMaxAge ) {
    var particleCount = this.particleCount;


    // Calculate the `particlesPerSecond` value for this emitter. It's used
    // when determining which particles should die and which should live to
    // see another day. Or be born, for that matter. The "God" property.
    if ( this.duration ) {
        this.particlesPerSecond = particleCount / ( groupMaxAge < this.duration ? groupMaxAge : this.duration );
    }
    else {
        this.particlesPerSecond = particleCount / groupMaxAge;
    }

    // this.particlesPerSecond = Math.max( this.particlesPerSecond, 1 );
};



SPE.Emitter.prototype._assignValue = function( prop, index ) {
    switch ( prop ) {
        case 'position':
            this._assignPositionValue( index );
            break;

        case 'radius':
            if ( this.position._distribution !== SPE.distributions.BOX ) {
                this._assignPositionValue( index );
            }
            break;

        case 'velocity':
        case 'acceleration':
            this._assignForceValue( index, prop );
            break;

        case 'size':
        case 'opacity':
            this._assignLifetimeValue( index, prop );
            break;

        case 'angle':
            this._assignAngleValue( index );
            break;

        case 'params':
            this._assignParamsValue( index );
            break;

        case 'rotation':
            this._assignRotationValue( index );
            break;

        case 'color':
            this._assignColorValue( index );
            break;
    }
};

SPE.Emitter.prototype._assignPositionValue = function( index ) {
    var distributions = SPE.distributions,
        utils = SPE.utils,
        prop = this.position,
        attr = this.attributes.position,
        value = prop._value,
        spread = prop._spread,
        distribution = prop._distribution;

    switch ( distribution ) {
        case distributions.BOX:
            utils.randomVector3( attr, index, value, spread, prop._spreadClamp );
            break;

        case distributions.SPHERE:
            utils.randomVector3OnSphere( attr, index, value, this.radius._value, this.radius._spread, this.radius._scale, this.radius._spreadClamp );
            break;

        case distributions.DISC:
            utils.randomVector3OnDisc( attr, index, value, this.radius._value, this.radius._spread, this.radius._scale, this.radius._spreadClamp );
            break;
    }
};

SPE.Emitter.prototype._assignForceValue = function( index, attrName ) {
    var distributions = SPE.distributions,
        utils = SPE.utils,
        prop = this[ attrName ],
        value = prop._value,
        spread = prop._spread,
        distribution = prop._distribution,
        pos,
        positionX,
        positionY,
        positionZ;

    switch ( distribution ) {
        case distributions.BOX:
            utils.randomVector3( this.attributes[ attrName ], index, value, spread );
            break;

        case distributions.SPHERE:
        case distributions.DISC:
            pos = this.attributes.position.typedArray.array;

            // Ensure position values aren't zero, otherwise no force will be
            // applied.
            positionX = utils.zeroToEpsilon( pos[ index * 3 ], true );
            positionY = utils.zeroToEpsilon( pos[ index * 3 + 1 ], true );
            positionZ = utils.zeroToEpsilon( pos[ index * 3 + 2 ], true );

            utils.randomDirectionVector3OnSphere(
                this.attributes[ attrName ], index,
                positionX, positionY, positionZ,
                this.position._value,
                this[ attrName ]._value.x,
                this[ attrName ]._spread.x
            );
            break;
    }

    if ( attrName === 'acceleration' ) {
        var drag = utils.clamp( utils.randomFloat( this.drag._value, this.drag._spread ), 0, 1 );
        this.attributes.acceleration.typedArray.array[ index * 4 + 3 ] = drag;
    }
};

SPE.Emitter.prototype._assignLifetimeValue = function( index, propName ) {
    var array = this.attributes[ propName ].typedArray,
        prop = emitter[ propName ],
        utils = SPE.utils,
        value;

    if ( utils.arrayValuesAreEqual( prop._value ) && utils.arrayValuesAreEqual( prop._spread ) ) {
        value = Math.abs( utils.randomFloat( prop._value[ 0 ], prop._spread[ 0 ] ) );
        array.setVec4Components( index, value, value, value, value );
    }
    else {
        array.setVec4Components( index,
            Math.abs( utils.randomFloat( prop._value[ 0 ], prop._spread[ 0 ] ) ),
            Math.abs( utils.randomFloat( prop._value[ 1 ], prop._spread[ 1 ] ) ),
            Math.abs( utils.randomFloat( prop._value[ 2 ], prop._spread[ 2 ] ) ),
            Math.abs( utils.randomFloat( prop._value[ 3 ], prop._spread[ 3 ] ) )
        );
    }
};

SPE.Emitter.prototype._assignAngleValue = function( index ) {
    var array = this.attributes.angle.typedArray,
        prop = emitter.angle,
        utils = SPE.utils,
        value;

    if ( utils.arrayValuesAreEqual( prop._value ) && utils.arrayValuesAreEqual( prop._spread ) ) {
        value = utils.randomFloat( prop._value[ 0 ], prop._spread[ 0 ] );
        array.setVec4Components( index, value, value, value, value );
    }
    else {
        array.setVec4Components( index,
            utils.randomFloat( prop._value[ 0 ], prop._spread[ 0 ] ),
            utils.randomFloat( prop._value[ 1 ], prop._spread[ 1 ] ),
            utils.randomFloat( prop._value[ 2 ], prop._spread[ 2 ] ),
            utils.randomFloat( prop._value[ 3 ], prop._spread[ 3 ] )
        );
    }
};

SPE.Emitter.prototype._assignParamsValue = function( index ) {
    this.attributes.params.typedArray.setVec4Components( index,
        this.isStatic ? 1 : 0,
        0.0,
        Math.abs( SPE.utils.randomFloat( this.maxAge._value, this.maxAge._spread ) ),
        SPE.utils.randomFloat( this.wiggle._value, this.wiggle._spread )
    );
};

SPE.Emitter.prototype._assignRotationValue = function( index ) {
    this.attributes.rotation.typedArray.setVec3Components( index,
        SPE.utils.getPackedRotationAxis( this.rotation._axis, this.rotation._axisSpread ),
        SPE.utils.randomFloat( this.rotation._angle, this.rotation._angleSpread ),
        this.rotation._static ? 0 : 1
    );

    this.attributes.rotationCenter.typedArray.setVec3( index, this.rotation._center );
};

SPE.Emitter.prototype._assignColorValue = function( index ) {
    SPE.utils.randomColorAsHex( this.attributes.color, index, this.color._value, this.color._spread );
};

SPE.Emitter.prototype._resetParticle = function( index ) {
    var resetFlags = this.resetFlags,
        updateFlags = this.updateFlags,
        updateCounts = this.updateCounts,
        keys = this.attributeKeys,
        key,
        updateFlag;

    for ( var i = this.attributeCount - 1; i >= 0; --i ) {
        key = keys[ i ];
        updateFlag = updateFlags[ key ];

        if ( resetFlags[ key ] || updateFlag ) {
            this._assignValue( key, index );
            this._updateAttributeUpdateRange( key, index );

            if ( updateFlag === true && ( ++updateCounts[ key ] ) === this.particleCount ) {
                updateFlags[ key ] = false;
                updateCounts[ key ] = 0.0;
            }
        }
    }
};

SPE.Emitter.prototype._updateAttributeUpdateRange = function( attr, i ) {
    var ranges = this.bufferUpdateRanges[ attr ],
        min = ranges.min,
        max = ranges.max;

    ranges.min = Math.min( i, ranges.min );
    ranges.max = Math.max( i, ranges.max );
};

SPE.Emitter.prototype._resetBufferRanges = function() {
    var ranges = this.bufferUpdateRanges,
        keys = this.bufferUpdateKeys,
        i = this.bufferUpdateCount - 1,
        key;

    for ( i; i >= 0; --i ) {
        key = keys[ i ];
        ranges[ key ].min = Number.POSITIVE_INFINITY;
        ranges[ key ].max = Number.NEGATIVE_INFINITY;
    }
};

SPE.Emitter.prototype._resetUpdateFlags = function() {
    this.position.needsUpdate = false;
    this.velocity.needsUpdate = false;
    this.acceleration.needsUpdate = false;
    this.radius.needsUpdate = false;
    this.drag.needsUpdate = false;
    this.wiggle.needsUpdate = false;
    this.rotation.needsUpdate = false;
    this.maxAge.needsUpdate = false;
    this.color.needsUpdate = false;
    this.opacity.needsUpdate = false;
    this.size.needsUpdate = false;
    this.angle.needsUpdate = false;
};


SPE.Emitter.prototype.tick = function( dt ) {
    if ( this.isStatic ) {
        return;
    }

    var start = this.attributeOffset,
        end = start + this.particleCount,
        params = this.attributes.params.typedArray.array, // vec3( alive, age, maxAge, wiggle )
        ppsDt = this.particlesPerSecond * this.activeMultiplier * dt,
        activationIndex = this.activationIndex;

    // Reset the buffer update indices.
    this._resetBufferRanges();

    // Reset update flags
    this._resetUpdateFlags();

    // Increment age for those particles that are alive,
    // and kill off any particles whose age is over the limit.
    for ( var i = end - 1, index, maxAge, age, alive; i >= start; --i ) {
        index = i * 4;

        alive = params[ index ];

        // Increment age
        if ( alive === 1.0 ) {
            age = params[ index + 1 ];
            maxAge = params[ index + 2 ];
            age += dt;

            // Mark particle as dead
            if ( age >= maxAge ) {
                age = 0.0;
                alive = 0.0;
            }

            params[ index ] = alive;
            params[ index + 1 ] = age;

            this._updateAttributeUpdateRange( 'params', i );
        }
    }

    // If the emitter is dead, reset the age of the emitter to zero,
    // ready to go again if required
    if ( this.alive === false ) {
        // this._updatePostTick( updatedParamsMin, updatedParamsMax );
        paramsUpdateRange.min = updatedParamsMin;
        paramsUpdateRange.max = updatedParamsMax;
        this.age = 0.0;
        return;
    }

    // If the emitter has a specified lifetime and we've exceeded it,
    // mark the emitter as dead.
    if ( this.duration !== null && this.age > this.duration ) {
        this.alive = false;
        this.age = 0.0;
    }


    var activationStart = activationIndex | 0,
        activationEnd = activationStart + ppsDt,
        activationCount = activationEnd - this.activationIndex + 1 | 0,
        dtPerParticle = activationCount > 0 ? dt / activationCount : 0;

    for ( var i = activationStart, index; i < activationEnd; ++i ) {
        index = i * 4;

        if ( params[ index ] === 0.0 ) {
            // Mark the particle as alive.
            params[ index ] = 1.0;
            // this.updateFlags.params = true;
            this._resetParticle( i );

            // Move each particle being activated to
            // it's actual position in time.
            //
            // This stops particles being 'clumped' together
            // when frame rates are on the lower side of 60fps
            // or not constant (a very real possibility!)
            params[ index + 1 ] = dtPerParticle * ( i - activationStart );
            // params[ index + 1 ] = 0.0;

            this._updateAttributeUpdateRange( 'params', i );
        }
    }

    // Move the activation window forward, soldier.
    this.activationIndex += ppsDt;

    if ( this.activationIndex > end ) {
        this.activationIndex = start;
    }


    // Increment the age of the emitter.
    this.age += dt;
};

SPE.Emitter.prototype.reset = function( force ) {
    this.age = 0.0;
    this.alive = false;

    if ( force === true ) {
        var start = this.attributeOffset,
            end = start + this.particleCount,
            array = this.attributes.params.typedArray.array,
            attr = this.attributes.params.bufferAttribute;

        for ( var i = end - 1, index; i >= start; --i ) {
            index = i * 4;

            array[ index ] = 0.0;
            array[ index + 1 ] = 0.0;
        }

        attr.updateRange.offset = 0;
        attr.updateRange.count = -1;
        attr.needsUpdate = true;
    }
};

SPE.Emitter.prototype.enable = function() {
    this.alive = true;
};

SPE.Emitter.prototype.disable = function() {
    this.alive = false;
};