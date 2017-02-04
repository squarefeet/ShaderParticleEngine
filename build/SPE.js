(function (global, factory) {
  typeof exports === 'object' && typeof module !== 'undefined' ? module.exports = factory(require('three')) :
  typeof define === 'function' && define.amd ? define(['three'], factory) :
  (global.SPE = factory(global.THREE));
}(this, (function (three) { 'use strict';

/**
 * @typedef {Number} distribution
 * @property {Number} SPE.distributions.BOX Values will be distributed within a box.
 * @property {Number} SPE.distributions.SPHERE Values will be distributed within a sphere.
 * @property {Number} SPE.distributions.DISC Values will be distributed within a 2D disc.
 */

/**
 * A map of supported distribution types used
 * by SPE.Emitter instances.
 *
 * These distribution types can be applied to
 * an emitter globally, which will affect the
 * `position`, `velocity`, and `acceleration`
 * value calculations for an emitter, or they
 * can be applied on a per-property basis.
 *
 * @enum {Number}
 */
const distributions = {
  /**
   * Values will be distributed within a box.
   * @type {Number}
   */
  BOX: 1,

  /**
   * Values will be distributed on a sphere.
   * @type {Number}
   */
  SPHERE: 2,

  /**
   * Values will be distributed on a 2d-disc shape.
   * @type {Number}
   */
  DISC: 3
};

/**
 * Set this value to however many 'steps' you
 * want value-over-lifetime properties to have.
 *
 * It's adjustable to fix an interpolation problem:
 *
 * Assuming you specify an opacity value as [0, 1, 0]
 *      and the `valueOverLifetimeLength` is 4, then the
 *      opacity value array will be reinterpolated to
 *      be [0, 0.66, 0.66, 0].
 *   This isn't ideal, as particles would never reach
 *   full opacity.
 *
 * NOTE:
 *     This property affects the length of ALL
 *       value-over-lifetime properties for ALL
 *       emitters and ALL groups.
 *
 *     Only values >= 3 && <= 4 are allowed.
 *
 * @type {Number}
 */
const valueOverLifetimeLength = '4';

/**
 * A map of uniform types to their component size.
 * @enum {Number}
 */
const typeSizeMap = {
  /**
   * Float
   * @type {Number}
   */
  f: 1,

  /**
   * Vec2
   * @type {Number}
   */
  v2: 2,

  /**
   * Vec3
   * @type {Number}
   */
  v3: 3,

  /**
   * Vec4
   * @type {Number}
   */
  v4: 4,

  /**
   * Color
   * @type {Number}
   */
  c: 3,

  /**
   * Mat3
   * @type {Number}
   */
  m3: 9,

  /**
   * Mat4
   * @type {Number}
   */
  m4: 16
};

const shaderChunks = {
    // Register color-packing define statements.
    defines: ['#define PACKED_COLOR_SIZE 256.0', '#define PACKED_COLOR_DIVISOR 255.0'].join('\n'),

    // All uniforms used by vertex / fragment shaders
    uniforms: ['uniform float deltaTime;', 'uniform float runTime;', 'uniform sampler2D texture;', 'uniform vec4 textureAnimation;', 'uniform float scale;'].join('\n'),

    // All attributes used by the vertex shader.
    //
    // Note that some attributes are squashed into other ones:
    //
    // * Drag is acceleration.w
    attributes: ['attribute vec4 acceleration;', 'attribute vec3 velocity;', 'attribute vec4 rotation;', 'attribute vec3 rotationCenter;', 'attribute vec4 params;', 'attribute vec4 size;', 'attribute vec4 angle;', 'attribute vec4 color;', 'attribute vec4 opacity;'].join('\n'),

    //
    varyings: ['varying vec4 vColor;', '#ifdef SHOULD_ROTATE_TEXTURE', '    varying float vAngle;', '#endif', '#ifdef SHOULD_CALCULATE_SPRITE', '    varying vec4 vSpriteSheet;', '#endif'].join('\n'),

    // Branch-avoiding comparison fns
    // - http://theorangeduck.com/page/avoiding-shader-conditionals
    branchAvoidanceFunctions: ['float when_gt(float x, float y) {', '    return max(sign(x - y), 0.0);', '}', 'float when_lt(float x, float y) {', '    return min( max(1.0 - sign(x - y), 0.0), 1.0 );', '}', 'float when_eq( float x, float y ) {', '    return 1.0 - abs( sign( x - y ) );', '}', 'float when_ge(float x, float y) {', '  return 1.0 - when_lt(x, y);', '}', 'float when_le(float x, float y) {', '  return 1.0 - when_gt(x, y);', '}',

    // Branch-avoiding logical operators
    // (to be used with above comparison fns)
    'float and(float a, float b) {', '    return a * b;', '}', 'float or(float a, float b) {', '    return min(a + b, 1.0);', '}'].join('\n'),

    // From:
    // - http://stackoverflow.com/a/12553149
    // - https://stackoverflow.com/questions/22895237/hexadecimal-to-rgb-values-in-webgl-shader
    unpackColor: ['vec3 unpackColor( in float hex ) {', '   vec3 c = vec3( 0.0 );', '   float r = mod( (hex / PACKED_COLOR_SIZE / PACKED_COLOR_SIZE), PACKED_COLOR_SIZE );', '   float g = mod( (hex / PACKED_COLOR_SIZE), PACKED_COLOR_SIZE );', '   float b = mod( hex, PACKED_COLOR_SIZE );', '   c.r = r / PACKED_COLOR_DIVISOR;', '   c.g = g / PACKED_COLOR_DIVISOR;', '   c.b = b / PACKED_COLOR_DIVISOR;', '   return c;', '}'].join('\n'),

    unpackRotationAxis: ['vec3 unpackRotationAxis( in float hex ) {', '   vec3 c = vec3( 0.0 );', '   float r = mod( (hex / PACKED_COLOR_SIZE / PACKED_COLOR_SIZE), PACKED_COLOR_SIZE );', '   float g = mod( (hex / PACKED_COLOR_SIZE), PACKED_COLOR_SIZE );', '   float b = mod( hex, PACKED_COLOR_SIZE );', '   c.r = r / PACKED_COLOR_DIVISOR;', '   c.g = g / PACKED_COLOR_DIVISOR;', '   c.b = b / PACKED_COLOR_DIVISOR;', '   c *= vec3( 2.0 );', '   c -= vec3( 1.0 );', '   return c;', '}'].join('\n'),

    floatOverLifetime: ['float getFloatOverLifetime( in float positionInTime, in vec4 attr ) {', '    highp float value = 0.0;', '    float deltaAge = positionInTime * float( VALUE_OVER_LIFETIME_LENGTH - 1 );', '    float fIndex = 0.0;', '    float shouldApplyValue = 0.0;',

    // This might look a little odd, but it's faster in the testing I've done than using branches.
    // Uses basic maths to avoid branching.
    //
    // Take a look at the branch-avoidance functions defined above,
    // and be sure to check out The Orange Duck site where I got this
    // from (link above).

    // Fix for static emitters (age is always zero).
    '    value += attr[ 0 ] * when_eq( deltaAge, 0.0 );', '', '    for( int i = 0; i < VALUE_OVER_LIFETIME_LENGTH - 1; ++i ) {', '       fIndex = float( i );', '       shouldApplyValue = and( when_gt( deltaAge, fIndex ), when_le( deltaAge, fIndex + 1.0 ) );', '       value += shouldApplyValue * mix( attr[ i ], attr[ i + 1 ], deltaAge - fIndex );', '    }', '', '    return value;', '}'].join('\n'),

    colorOverLifetime: ['vec3 getColorOverLifetime( in float positionInTime, in vec3 color1, in vec3 color2, in vec3 color3, in vec3 color4 ) {', '    vec3 value = vec3( 0.0 );', '    value.x = getFloatOverLifetime( positionInTime, vec4( color1.x, color2.x, color3.x, color4.x ) );', '    value.y = getFloatOverLifetime( positionInTime, vec4( color1.y, color2.y, color3.y, color4.y ) );', '    value.z = getFloatOverLifetime( positionInTime, vec4( color1.z, color2.z, color3.z, color4.z ) );', '    return value;', '}'].join('\n'),

    paramFetchingFunctions: ['float getAlive() {', '   return params.x;', '}', 'float getAge() {', '   return params.y;', '}', 'float getMaxAge() {', '   return params.z;', '}', 'float getWiggle() {', '   return params.w;', '}'].join('\n'),

    forceFetchingFunctions: ['vec4 getPosition( in float age ) {', '   return modelViewMatrix * vec4( position, 1.0 );', '}', 'vec3 getVelocity( in float age ) {', '   return velocity * age;', '}', 'vec3 getAcceleration( in float age ) {', '   return acceleration.xyz * age;', '}'].join('\n'),

    rotationFunctions: [
    // Huge thanks to:
    // - http://www.neilmendoza.com/glsl-rotation-about-an-arbitrary-axis/
    '#ifdef SHOULD_ROTATE_PARTICLES', '   mat4 getRotationMatrix( in vec3 axis, in float angle) {', '       axis = normalize(axis);', '       float s = sin(angle);', '       float c = cos(angle);', '       float oc = 1.0 - c;', '', '       return mat4(oc * axis.x * axis.x + c,           oc * axis.x * axis.y - axis.z * s,  oc * axis.z * axis.x + axis.y * s,  0.0,', '                   oc * axis.x * axis.y + axis.z * s,  oc * axis.y * axis.y + c,           oc * axis.y * axis.z - axis.x * s,  0.0,', '                   oc * axis.z * axis.x - axis.y * s,  oc * axis.y * axis.z + axis.x * s,  oc * axis.z * axis.z + c,           0.0,', '                   0.0,                                0.0,                                0.0,                                1.0);', '   }', '', '   vec3 getRotation( in vec3 pos, in float positionInTime ) {', '      if( rotation.y == 0.0 ) {', '           return pos;', '      }', '', '      vec3 axis = unpackRotationAxis( rotation.x );', '      vec3 center = rotationCenter;', '      vec3 translated;', '      mat4 rotationMatrix;', '      float angle = 0.0;', '      angle += when_eq( rotation.z, 0.0 ) * rotation.y;', '      angle += when_gt( rotation.z, 0.0 ) * mix( 0.0, rotation.y, positionInTime );', '      translated = rotationCenter - pos;', '      rotationMatrix = getRotationMatrix( axis, angle );', '      return center - vec3( rotationMatrix * vec4( translated, 0.0 ) );', '   }', '#endif'].join('\n'),

    // Fragment chunks
    rotateTexture: ['#ifdef USE_TEXTURE', '    vec2 vUv = vec2( gl_PointCoord.x, 1.0 - gl_PointCoord.y );', '', '    #ifdef SHOULD_ROTATE_TEXTURE', '        float x = gl_PointCoord.x - 0.5;', '        float y = 1.0 - gl_PointCoord.y - 0.5;', '        float c = cos( -vAngle );', '        float s = sin( -vAngle );', '        vUv = vec2( c * x + s * y + 0.5, c * y - s * x + 0.5 );', '    #endif', '',

    // Spritesheets overwrite angle calculations.
    '    #ifdef SHOULD_CALCULATE_SPRITE', '        float framesX = vSpriteSheet.x;', '        float framesY = vSpriteSheet.y;', '        float columnNorm = vSpriteSheet.z;', '        float rowNorm = vSpriteSheet.w;', '        vUv.x = gl_PointCoord.x * framesX + columnNorm;', '        vUv.y = 1.0 - (gl_PointCoord.y * framesY + rowNorm);', '    #endif', '', '    vec4 rotatedTexture = texture2D( texture, vUv );', '#endif'].join('\n')
};

const shaders = {
    vertex: [shaderChunks.defines, shaderChunks.uniforms, shaderChunks.attributes, shaderChunks.varyings, three.ShaderChunk.common, three.ShaderChunk.logdepthbuf_pars_vertex, three.ShaderChunk.fog_pars_vertex, shaderChunks.branchAvoidanceFunctions, shaderChunks.unpackColor, shaderChunks.unpackRotationAxis, shaderChunks.floatOverLifetime, shaderChunks.colorOverLifetime, shaderChunks.paramFetchingFunctions, shaderChunks.forceFetchingFunctions, shaderChunks.rotationFunctions, 'void main() {',

    //
    // Setup...
    //
    '    highp float age = getAge();', '    highp float alive = getAlive();', '    highp float maxAge = getMaxAge();', '    highp float positionInTime = (age / maxAge);', '    highp float isAlive = when_gt( alive, 0.0 );', '    #ifdef SHOULD_WIGGLE_PARTICLES', '        float wiggleAmount = positionInTime * getWiggle();', '        float wiggleSin = isAlive * sin( wiggleAmount );', '        float wiggleCos = isAlive * cos( wiggleAmount );', '    #endif',

    //
    // Forces
    //

    // Get forces & position
    '    vec3 vel = getVelocity( age );', '    vec3 accel = getAcceleration( age );', '    vec3 force = vec3( 0.0 );', '    vec3 pos = vec3( position );',

    // Calculate the required drag to apply to the forces.
    '    float drag = 1.0 - (positionInTime * 0.5) * acceleration.w;',

    // Integrate forces...
    '    force += vel;', '    force *= drag;', '    force += accel * age;', '    pos += force;',

    // Wiggly wiggly wiggle!
    '    #ifdef SHOULD_WIGGLE_PARTICLES', '        pos.x += wiggleSin;', '        pos.y += wiggleCos;', '        pos.z += wiggleSin;', '    #endif',

    // Rotate the emitter around it's central point
    '    #ifdef SHOULD_ROTATE_PARTICLES', '        pos = getRotation( pos, positionInTime );', '    #endif',

    // Convert pos to a world-space value
    '    vec4 mvPosition = modelViewMatrix * vec4( pos, 1.0 );',

    // Determine point size.
    '    highp float pointSize = getFloatOverLifetime( positionInTime, size ) * isAlive;',

    // Determine perspective
    '    #ifdef HAS_PERSPECTIVE', '        float perspective = scale / length( mvPosition.xyz );', '    #else', '        float perspective = 1.0;', '    #endif',

    // Apply perpective to pointSize value
    '    float pointSizePerspective = pointSize * perspective;',

    //
    // Appearance
    //

    // Determine color and opacity for this particle
    '    #ifdef COLORIZE', '       vec3 c = isAlive * getColorOverLifetime(', '           positionInTime,', '           unpackColor( color.x ),', '           unpackColor( color.y ),', '           unpackColor( color.z ),', '           unpackColor( color.w )', '       );', '    #else', '       vec3 c = vec3(1.0);', '    #endif', '    float o = isAlive * getFloatOverLifetime( positionInTime, opacity );',

    // Assign color to vColor varying.
    '    vColor = vec4( c, o );',

    // Determine angle
    '    #ifdef SHOULD_ROTATE_TEXTURE', '        vAngle = isAlive * getFloatOverLifetime( positionInTime, angle );', '    #endif',

    // If this particle is using a sprite-sheet as a texture, we'll have to figure out
    // what frame of the texture the particle is using at it's current position in time.
    '    #ifdef SHOULD_CALCULATE_SPRITE', '        float framesX = textureAnimation.x;', '        float framesY = textureAnimation.y;', '        float loopCount = textureAnimation.w;', '        float totalFrames = textureAnimation.z;', '        float frameNumber = mod( (positionInTime * loopCount) * totalFrames, totalFrames );', '        float column = floor(mod( frameNumber, framesX ));', '        float row = floor( (frameNumber - column) / framesX );', '        float columnNorm = column / framesX;', '        float rowNorm = row / framesY;', '        vSpriteSheet.x = 1.0 / framesX;', '        vSpriteSheet.y = 1.0 / framesY;', '        vSpriteSheet.z = columnNorm;', '        vSpriteSheet.w = rowNorm;', '    #endif',

    //
    // Write values
    //

    // Set PointSize according to size at current point in time.
    '    gl_PointSize = pointSizePerspective;', '    gl_Position = projectionMatrix * mvPosition;', three.ShaderChunk.logdepthbuf_vertex, three.ShaderChunk.fog_vertex, '}'].join('\n'),

    fragment: [shaderChunks.uniforms, three.ShaderChunk.common, three.ShaderChunk.fog_pars_fragment, three.ShaderChunk.logdepthbuf_pars_fragment, shaderChunks.varyings, shaderChunks.branchAvoidanceFunctions, 'void main() {', '    vec3 outgoingLight = vColor.xyz;', '    ', '    #ifdef ALPHATEST', '       if ( vColor.w < float(ALPHATEST) ) discard;', '    #endif', shaderChunks.rotateTexture, three.ShaderChunk.logdepthbuf_fragment, '    #ifdef USE_TEXTURE', '        outgoingLight = vColor.xyz * rotatedTexture.xyz;', '        gl_FragColor = vec4( outgoingLight.xyz, rotatedTexture.w * vColor.w );', '    #else', '        gl_FragColor = vec4( outgoingLight.xyz, vColor.w );', '    #endif', three.ShaderChunk.fog_fragment, '}'].join('\n')
};

class ShaderAttribute {
    constructor(type, dynamicBuffer, arrayType = Float32Array) {
        const typeMap = typeSizeMap;

        this.type = typeof type === 'string' && typeMap.hasOwnProperty(type) ? type : 'f';
        this.componentSize = typeMap[this.type];
        this.arrayType = arrayType;
        this.typedArray = null;
        this.bufferAttribute = null;
        this.dynamicBuffer = !!dynamicBuffer;

        this.updateMin = 0;
        this.updateMax = 0;
    }

    /**
     * Calculate the minimum and maximum update range for this buffer attribute using
     * component size independant min and max values.
     *
     * @param {Number} min The start of the range to mark as needing an update.
     * @param {Number} max The end of the range to mark as needing an update.
     */
    setUpdateRange(min, max) {
        this.updateMin = Math.min(min * this.componentSize, this.updateMin * this.componentSize);
        this.updateMax = Math.max(max * this.componentSize, this.updateMax * this.componentSize);
    }

    /**
     * Calculate the number of indices that this attribute should mark as needing
     * updating. Also marks the attribute as needing an update.
     */
    flagUpdate() {
        const attr = this.bufferAttribute,
              range = attr.updateRange;

        range.offset = this.updateMin;
        range.count = Math.min(this.updateMax - this.updateMin + this.componentSize, this.typedArray.array.length);
        // console.log( range.offset, range.count, this.typedArray.array.length );
        // console.log( 'flagUpdate:', range.offset, range.count );
        attr.needsUpdate = true;
    }

    /**
     * Reset the index update counts for this attribute
     */
    resetUpdateRange() {
        this.updateMin = 0;
        this.updateMax = 0;
    }

    resetDynamic() {
        this.bufferAttribute.dynamic = this.dynamicBuffer;
    }

    /**
     * Perform a splice operation on this attribute's buffer.
     * @param  {Number} start The start index of the splice. Will be multiplied by the number of components for this attribute.
     * @param  {Number} end The end index of the splice. Will be multiplied by the number of components for this attribute.
     */
    splice(start, end) {
        this.typedArray.splice(start, end);

        // Reset the reference to the attribute's typed array
        // since it has probably changed.
        this.forceUpdateAll();
    }

    forceUpdateAll() {
        this.bufferAttribute.array = this.typedArray.array;
        this.bufferAttribute.updateRange.offset = 0;
        this.bufferAttribute.updateRange.count = -1;
        this.bufferAttribute.dynamic = false;
        this.bufferAttribute.needsUpdate = true;
    }

    /**
     * Make sure this attribute has a typed array associated with it.
     *
     * If it does, then it will ensure the typed array is of the correct size.
     *
     * If not, a new SPE.TypedArrayHelper instance will be created.
     *
     * @param  {Number} size The size of the typed array to create or update to.
     */
    _ensureTypedArray(size) {
        // Condition that's most likely to be true at the top: no change.
        if (this.typedArray !== null && this.typedArray.size === size * this.componentSize) {
            return;
        }

        // Resize the array if we need to, telling the TypedArrayHelper to
        // ignore it's component size when evaluating size.
        else if (this.typedArray !== null && this.typedArray.size !== size) {
                this.typedArray.setSize(size);
            }

            // This condition should only occur once in an attribute's lifecycle.
            else if (this.typedArray === null) {
                    this.typedArray = new SPE.TypedArrayHelper(this.arrayType, size, this.componentSize);
                }
    }

    /**
     * Creates a THREE.BufferAttribute instance if one doesn't exist already.
     *
     * Ensures a typed array is present by calling _ensureTypedArray() first.
     *
     * If a buffer attribute exists already, then it will be marked as needing an update.
     *
     * @param  {Number} size The size of the typed array to create if one doesn't exist, or resize existing array to.
     */
    _createBufferAttribute(size) {
        // Make sure the typedArray is present and correct.
        this._ensureTypedArray(size);

        // Don't create it if it already exists, but do
        // flag that it needs updating on the next render
        // cycle.
        if (this.bufferAttribute !== null) {
            this.bufferAttribute.array = this.typedArray.array;

            // Since THREE.js version 81, dynamic count calculation was removed
            // so I need to do it manually here :(
            this.bufferAttribute.count = this.bufferAttribute.array.length / this.bufferAttribute.itemSize;
            this.bufferAttribute.needsUpdate = true;
            return;
        }

        this.bufferAttribute = new three.BufferAttribute(this.typedArray.array, this.componentSize);
        this.bufferAttribute.setDynamic(this.dynamicBuffer);
    }

    /**
     * Returns the length of the typed array associated with this attribute.
     * @return {Number} The length of the typed array. Will be 0 if no typed array has been created yet.
     */
    getLength() {
        if (this.typedArray === null) {
            return 0;
        }

        return this.typedArray.array.length;
    }
}

/**
 * A helper class for TypedArrays.
 *
 * Allows for easy resizing, assignment of various component-based
 * types (Vector2s, Vector3s, Vector4s, Mat3s, Mat4s),
 * as well as Colors (where components are `r`, `g`, `b`),
 * Numbers, and setting from other TypedArrays.
 *
 * @author Luke Moody
 * @constructor
 * @param {Function} TypedArrayConstructor The constructor to use (Float32Array, Uint8Array, etc.)
 * @param {Number} size                 The size of the array to create
 * @param {Number} componentSize        The number of components per-value (ie. 3 for a vec3, 9 for a Mat3, etc.)
 * @param {Number} indexOffset          The index in the array from which to start assigning values. Default `0` if none provided
 */
class TypedArrayHelper {
    constructor(TypedArrayConstructor = Float32Array, size = 1, componentSize = 1, indexOffset = 0) {
        this.componentSize = componentSize;
        this.size = size;
        this.TypedArrayConstructor = TypedArrayConstructor;
        this.array = new TypedArrayConstructor(size * this.componentSize);
        this.indexOffset = indexOffset;
    }

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
    setSize(size, noComponentMultiply) {
        const currentArraySize = this.array.length;

        if (!noComponentMultiply) {
            size = size * this.componentSize;
        }

        if (size < currentArraySize) {
            return this.shrink(size);
        } else if (size > currentArraySize) {
            return this.grow(size);
        } else {
            console.info('TypedArray is already of size:', size + '.', 'Will not resize.');
        }
    }

    /**
     * Shrinks the internal array.
     *
     * @param  {Number} size The new size of the typed array. Must be smaller than `this.array.length`.
     * @return {SPE.TypedArrayHelper}      Instance of this class.
     */
    shrink(size) {
        this.array = this.array.subarray(0, size);
        this.size = size;
        return this;
    }

    /**
     * Grows the internal array.
     * @param  {Number} size The new size of the typed array. Must be larger than `this.array.length`.
     * @return {SPE.TypedArrayHelper}      Instance of this class.
     */
    grow(size) {
        const existingArray = this.array,
              newArray = new this.TypedArrayConstructor(size);

        newArray.set(existingArray);
        this.array = newArray;
        this.size = size;

        return this;
    }

    /**
     * Perform a splice operation on this array's buffer.
     * @param  {Number} start The start index of the splice. Will be multiplied by the number of components for this attribute.
     * @param  {Number} end The end index of the splice. Will be multiplied by the number of components for this attribute.
     * @returns {Object} The SPE.TypedArrayHelper instance.
     */
    splice(start, end) {
        start *= this.componentSize;
        end *= this.componentSize;

        const data = [],
              array = this.array,
              size = array.length;

        for (let i = 0; i < size; ++i) {
            if (i < start || i >= end) {
                data.push(array[i]);
            }
            // array[ i ] = 0;
        }

        this.setFromArray(0, data);

        return this;
    }

    /**
     * Copies from the given TypedArray into this one, using the index argument
     * as the start position. Alias for `TypedArray.set`. Will automatically resize
     * if the given source array is of a larger size than the internal array.
     *
     * @param {Number} index      The start position from which to copy into this array.
     * @param {TypedArray} array The array from which to copy; the source array.
     * @return {SPE.TypedArrayHelper} Instance of this class.
     */
    setFromArray(index, array) {
        const sourceArraySize = array.length,
              newSize = index + sourceArraySize;

        if (newSize > this.array.length) {
            this.grow(newSize);
        } else if (newSize < this.array.length) {
            this.shrink(newSize);
        }

        this.array.set(array, this.indexOffset + index);

        return this;
    }

    /**
     * Set a Vector2 value at `index`.
     *
     * @param {Number} index The index at which to set the vec2 values from.
     * @param {Vector2} vec2  Any object that has `x` and `y` properties.
     * @return {SPE.TypedArrayHelper} Instance of this class.
     */
    setVec2(index, vec2) {
        return this.setVec2Components(index, vec2.x, vec2.y);
    }

    /**
     * Set a Vector2 value using raw components.
     *
     * @param {Number} index The index at which to set the vec2 values from.
     * @param {Number} x     The Vec2's `x` component.
     * @param {Number} y     The Vec2's `y` component.
     * @return {SPE.TypedArrayHelper} Instance of this class.
     */
    setVec2Components(index, x, y) {
        const array = this.array,
              i = this.indexOffset + index * this.componentSize;

        array[i] = x;
        array[i + 1] = y;
        return this;
    }

    /**
     * Set a Vector3 value at `index`.
     *
     * @param {Number} index The index at which to set the vec3 values from.
     * @param {Vector3} vec2  Any object that has `x`, `y`, and `z` properties.
     * @return {SPE.TypedArrayHelper} Instance of this class.
     */
    setVec3(index, vec3) {

        return this.setVec3Components(index, vec3.x, vec3.y, vec3.z);
    }

    /**
     * Set a Vector3 value using raw components.
     *
     * @param {Number} index The index at which to set the vec3 values from.
     * @param {Number} x     The Vec3's `x` component.
     * @param {Number} y     The Vec3's `y` component.
     * @param {Number} z     The Vec3's `z` component.
     * @return {SPE.TypedArrayHelper} Instance of this class.
     */
    setVec3Components(index, x, y, z) {
        var array = this.array,
            i = this.indexOffset + index * this.componentSize;

        array[i] = x;
        array[i + 1] = y;
        array[i + 2] = z;
        return this;
    }

    /**
     * Set a Vector4 value at `index`.
     *
     * @param {Number} index The index at which to set the vec4 values from.
     * @param {Vector4} vec2  Any object that has `x`, `y`, `z`, and `w` properties.
     * @return {SPE.TypedArrayHelper} Instance of this class.
     */
    setVec4(index, vec4) {
        return this.setVec4Components(index, vec4.x, vec4.y, vec4.z, vec4.w);
    }

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
    setVec4Components(index, x, y, z, w) {
        var array = this.array,
            i = this.indexOffset + index * this.componentSize;

        array[i] = x;
        array[i + 1] = y;
        array[i + 2] = z;
        array[i + 3] = w;
        return this;
    }

    /**
     * Set a Matrix3 value at `index`.
     *
     * @param {Number} index The index at which to set the matrix values from.
     * @param {Matrix3} mat3 The 3x3 matrix to set from. Must have a TypedArray property named `elements` to copy from.
     * @return {SPE.TypedArrayHelper} Instance of this class.
     */
    setMat3(index, mat3) {
        return this.setFromArray(this.indexOffset + index * this.componentSize, mat3.elements);
    }

    /**
     * Set a Matrix4 value at `index`.
     *
     * @param {Number} index The index at which to set the matrix values from.
     * @param {Matrix4} mat3 The 4x4 matrix to set from. Must have a TypedArray property named `elements` to copy from.
     * @return {SPE.TypedArrayHelper} Instance of this class.
     */
    setMat4(index, mat4) {
        return this.setFromArray(this.indexOffset + index * this.componentSize, mat4.elements);
    }

    /**
     * Set a Color value at `index`.
     *
     * @param {Number} index The index at which to set the vec3 values from.
     * @param {Color} color  Any object that has `r`, `g`, and `b` properties.
     * @return {SPE.TypedArrayHelper} Instance of this class.
     */
    setColor(index, color) {
        return this.setVec3Components(index, color.r, color.g, color.b);
    }

    /**
     * Set a Number value at `index`.
     *
     * @param {Number} index The index at which to set the vec3 values from.
     * @param {Number} numericValue  The number to assign to this index in the array.
     * @return {SPE.TypedArrayHelper} Instance of this class.
     */
    setNumber(index, numericValue) {
        this.array[this.indexOffset + index * this.componentSize] = numericValue;
        return this;
    }

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
    getValueAtIndex(index) {
        return this.array[this.indexOffset + index];
    }

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
    getComponentValueAtIndex(index) {
        return this.array.subarray(this.indexOffset + index * this.componentSize);
    }

}

const types = {
    /**
     * Boolean type.
     * @type {String}
     */
    BOOLEAN: 'boolean',

    /**
     * String type.
     * @type {String}
     */
    STRING: 'string',

    /**
     * Number type.
     * @type {String}
     */
    NUMBER: 'number',

    /**
     * Object type.
     * @type {String}
     */
    OBJECT: 'object'
};

/**
 * Given a value, a type, and a default value to fallback to,
 * ensure the given argument adheres to the type requesting,
 * returning the default value if type check is false.
 *
 * @param  {(boolean|string|number|object)} arg          The value to perform a type-check on.
 * @param  {String} type         The type the `arg` argument should adhere to.
 * @param  {(boolean|string|number|object)} defaultValue A default value to fallback on if the type check fails.
 * @return {(boolean|string|number|object)}              The given value if type check passes, or the default value if it fails.
 */
function ensureTypedArg(arg, type, defaultValue) {
    if (typeof arg === type) {
        return arg;
    } else {
        return defaultValue;
    }
}

/**
 * Given an array of values, a type, and a default value,
 * ensure the given array's contents ALL adhere to the provided type,
 * returning the default value if type check fails.
 *
 * If the given value to check isn't an Array, delegates to SPE.utils.ensureTypedArg.
 *
 * @param  {Array|boolean|string|number|object} arg          The array of values to check type of.
 * @param  {String} type         The type that should be adhered to.
 * @param  {(boolean|string|number|object)} defaultValue A default fallback value.
 * @return {(boolean|string|number|object)}              The given value if type check passes, or the default value if it fails.
 */
function ensureArrayTypedArg(arg, type, defaultValue) {
    // If the argument being checked is an array, loop through
    // it and ensure all the values are of the correct type,
    // falling back to the defaultValue if any aren't.
    if (Array.isArray(arg)) {
        for (let i = arg.length - 1; i >= 0; --i) {
            if (typeof arg[i] !== type) {
                return defaultValue;
            }
        }

        return arg;
    }

    // If the arg isn't an array then just fallback to
    // checking the type.
    return ensureTypedArg(arg, type, defaultValue);
}

/**
 * Ensures the given value is an instance of a constructor function.
 *
 * @param  {Object} arg          The value to check instance of.
 * @param  {Function} instance     The constructor of the instance to check against.
 * @param  {Object} defaultValue A default fallback value if instance check fails
 * @return {Object}              The given value if type check passes, or the default value if it fails.
 */
function ensureInstanceOf(arg, instance, defaultValue) {
    if (instance !== undefined && arg instanceof instance) {
        return arg;
    } else {
        return defaultValue;
    }
}

/**
 * Given an array of values, ensure the instances of all items in the array
 * matches the given instance constructor falling back to a default value if
 * the check fails.
 *
 * If given value isn't an Array, delegates to `SPE.utils.ensureInstanceOf`.
 *
 * @param  {Array|Object} arg          The value to perform the instanceof check on.
 * @param  {Function} instance     The constructor of the instance to check against.
 * @param  {Object} defaultValue A default fallback value if instance check fails
 * @return {Object}              The given value if type check passes, or the default value if it fails.
 */
function ensureArrayInstanceOf(arg, instance, defaultValue) {
    // If the argument being checked is an array, loop through
    // it and ensure all the values are of the correct type,
    // falling back to the defaultValue if any aren't.
    if (Array.isArray(arg)) {
        for (let i = arg.length - 1; i >= 0; --i) {
            if (instance !== undefined && arg[i] instanceof instance === false) {
                return defaultValue;
            }
        }

        return arg;
    }

    // If the arg isn't an array then just fallback to
    // checking the type.
    return ensureInstanceOf(arg, instance, defaultValue);
}

/**
 * Ensures that any "value-over-lifetime" properties of an emitter are
 * of the correct length (as dictated by `SPE.valueOverLifetimeLength`).
 *
 * Delegates to `SPE.utils.interpolateArray` for array resizing.
 *
 * If properties aren't arrays, then property values are put into one.
 *
 * @param  {Object} property  The property of an SPE.Emitter instance to check compliance of.
 * @param  {Number} minLength The minimum length of the array to create.
 * @param  {Number} maxLength The maximum length of the array to create.
 */
function ensureValueOverLifetimeCompliance(property, minLength, maxLength) {
    minLength = minLength || 3;
    maxLength = maxLength || 3;

    // First, ensure both properties are arrays.
    if (Array.isArray(property._value) === false) {
        property._value = [property._value];
    }

    if (Array.isArray(property._spread) === false) {
        property._spread = [property._spread];
    }

    var valueLength = clamp(property._value.length, minLength, maxLength),
        spreadLength = clamp(property._spread.length, minLength, maxLength),
        desiredLength = Math.max(valueLength, spreadLength);

    if (property._value.length !== desiredLength) {
        property._value = interpolateArray(property._value, desiredLength);
    }

    if (property._spread.length !== desiredLength) {
        property._spread = interpolateArray(property._spread, desiredLength);
    }
}

/**
 * Performs linear interpolation (lerp) on an array.
 *
 * For example, lerping [1, 10], with a `newLength` of 10 will produce [1, 2, 3, 4, 5, 6, 7, 8, 9, 10].
 *
 * Delegates to `SPE.utils.lerpTypeAgnostic` to perform the actual
 * interpolation.
 *
 * @param  {Array} srcArray  The array to lerp.
 * @param  {Number} newLength The length the array should be interpolated to.
 * @return {Array}           The interpolated array.
 */
function interpolateArray(srcArray, newLength) {
    const sourceLength = srcArray.length,
          newArray = [typeof srcArray[0].clone === 'function' ? srcArray[0].clone() : srcArray[0]],
          factor = (sourceLength - 1) / (newLength - 1);

    for (var i = 1; i < newLength - 1; ++i) {
        var f = i * factor,
            before = Math.floor(f),
            after = Math.ceil(f),
            delta = f - before;

        newArray[i] = lerpTypeAgnostic(srcArray[before], srcArray[after], delta);
    }

    newArray.push(typeof srcArray[sourceLength - 1].clone === 'function' ? srcArray[sourceLength - 1].clone() : srcArray[sourceLength - 1]);

    return newArray;
}

/**
 * Clamp a number to between the given min and max values.
 * @param  {Number} value The number to clamp.
 * @param  {Number} min   The minimum value.
 * @param  {Number} max   The maximum value.
 * @return {Number}       The clamped number.
 */
function clamp(value, min, max) {
    return Math.max(min, Math.min(value, max));
}

/**
 * If the given value is less than the epsilon value, then return
 * a randomised epsilon value if specified, or just the epsilon value if not.
 * Works for negative numbers as well as positive.
 *
 * @param  {Number} value     The value to perform the operation on.
 * @param  {Boolean} randomise Whether the value should be randomised.
 * @return {Number}           The result of the operation.
 */
function zeroToEpsilon(value, randomise) {
    const epsilon = 0.00001;
    let result = value;

    result = randomise ? Math.random() * epsilon * 10 : epsilon;

    if (value < 0 && value > -epsilon) {
        result = -result;
    }

    // if ( value === 0 ) {
    //     result = randomise ? Math.random() * epsilon * 10 : epsilon;
    // }
    // else if ( value > 0 && value < epsilon ) {
    //     result = randomise ? Math.random() * epsilon * 10 : epsilon;
    // }
    // else if ( value < 0 && value > -epsilon ) {
    //     result = -( randomise ? Math.random() * epsilon * 10 : epsilon );
    // }

    return result;
}

/**
 * Linearly interpolates two values of various types. The given values
 * must be of the same type for the interpolation to work.
 * @param  {(number|Object)} start The start value of the lerp.
 * @param  {(number|object)} end   The end value of the lerp.
 * @param  {Number} delta The delta posiiton of the lerp operation. Ideally between 0 and 1 (inclusive).
 * @return {(number|object|undefined)}       The result of the operation. Result will be undefined if
 *                                               the start and end arguments aren't a supported type, or
 *                                               if their types do not match.
 */
function lerpTypeAgnostic(start, end, delta) {
    let out;

    if (typeof start === types.NUMBER && typeof end === types.NUMBER) {
        return start + (end - start) * delta;
    } else if (start instanceof three.Vector2 && end instanceof three.Vector2) {
        out = start.clone();
        out.x = lerp(start.x, end.x, delta);
        out.y = lerp(start.y, end.y, delta);
        return out;
    } else if (start instanceof three.Vector3 && end instanceof three.Vector3) {
        out = start.clone();
        out.x = lerp(start.x, end.x, delta);
        out.y = lerp(start.y, end.y, delta);
        out.z = lerp(start.z, end.z, delta);
        return out;
    } else if (start instanceof three.Vector4 && end instanceof three.Vector4) {
        out = start.clone();
        out.x = lerp(start.x, end.x, delta);
        out.y = lerp(start.y, end.y, delta);
        out.z = lerp(start.z, end.z, delta);
        out.w = lerp(start.w, end.w, delta);
        return out;
    } else if (start instanceof three.Color && end instanceof three.Color) {
        out = start.clone();
        out.r = lerp(start.r, end.r, delta);
        out.g = lerp(start.g, end.g, delta);
        out.b = lerp(start.b, end.b, delta);
        return out;
    } else {
        console.warn('Invalid argument types, or argument types do not match:', start, end);
    }
}

/**
 * Perform a linear interpolation operation on two numbers.
 * @param  {Number} start The start value.
 * @param  {Number} end   The end value.
 * @param  {Number} delta The position to interpolate to.
 * @return {Number}       The result of the lerp operation.
 */
function lerp(start, end, delta) {
    return start + (end - start) * delta;
}

/**
 * Rounds a number to a nearest multiple.
 *
 * @param  {Number} n        The number to round.
 * @param  {Number} multiple The multiple to round to.
 * @return {Number}          The result of the round operation.
 */
function roundToNearestMultiple(n, multiple) {
    let remainder = 0;

    if (multiple === 0) {
        return n;
    }

    remainder = Math.abs(n) % multiple;

    if (remainder === 0) {
        return n;
    }

    if (n < 0) {
        return -(Math.abs(n) - remainder);
    }

    return n + multiple - remainder;
}

/**
 * Check if all items in an array are equal. Uses strict equality.
 *
 * @param  {Array} array The array of values to check equality of.
 * @return {Boolean}       Whether the array's values are all equal or not.
 */
function arrayValuesAreEqual(array) {
    for (let i = 0; i < array.length - 1; ++i) {
        if (array[i] !== array[i + 1]) {
            return false;
        }
    }

    return true;
}

// colorsAreEqual() {
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
// };


/**
 * Given a start value and a spread value, create and return a random
 * number.
 * @param  {Number} base   The start value.
 * @param  {Number} spread The size of the random variance to apply.
 * @return {Number}        A randomised number.
 */
function randomFloat(base, spread) {
    return base + spread * (Math.random() - 0.5);
}

/**
 * Given an SPE.ShaderAttribute instance, and various other settings,
 * assign values to the attribute's array in a `vec3` format.
 *
 * @param  {Object} attribute   The instance of SPE.ShaderAttribute to save the result to.
 * @param  {Number} index       The offset in the attribute's TypedArray to save the result from.
 * @param  {Object} base        THREE.Vector3 instance describing the start value.
 * @param  {Object} spread      THREE.Vector3 instance describing the random variance to apply to the start value.
 * @param  {Object} spreadClamp THREE.Vector3 instance describing the multiples to clamp the randomness to.
 */
function randomVector3(attribute, index, base, spread, spreadClamp) {
    let x = base.x + (Math.random() * spread.x - spread.x * 0.5),
        y = base.y + (Math.random() * spread.y - spread.y * 0.5),
        z = base.z + (Math.random() * spread.z - spread.z * 0.5);

    // var x = randomFloat( base.x, spread.x ),
    // y = randomFloat( base.y, spread.y ),
    // z = randomFloat( base.z, spread.z );

    if (spreadClamp) {
        x = -spreadClamp.x * 0.5 + roundToNearestMultiple(x, spreadClamp.x);
        y = -spreadClamp.y * 0.5 + roundToNearestMultiple(y, spreadClamp.y);
        z = -spreadClamp.z * 0.5 + roundToNearestMultiple(z, spreadClamp.z);
    }

    attribute.typedArray.setVec3Components(index, x, y, z);
}

/**
 * Given an SPE.Shader attribute instance, and various other settings,
 * assign Color values to the attribute.
 * @param  {Object} attribute The instance of SPE.ShaderAttribute to save the result to.
 * @param  {Number} index     The offset in the attribute's TypedArray to save the result from.
 * @param  {Object} base      THREE.Color instance describing the start color.
 * @param  {Object} spread    THREE.Vector3 instance describing the random variance to apply to the start color.
 */
function randomColor(attribute, index, base, spread) {
    let r = base.r + Math.random() * spread.x,
        g = base.g + Math.random() * spread.y,
        b = base.b + Math.random() * spread.z;

    r = clamp(r, 0, 1);
    g = clamp(g, 0, 1);
    b = clamp(b, 0, 1);

    attribute.typedArray.setVec3Components(index, r, g, b);
}

const randomColorAsHex = function () {
    const workingColor = new three.Color();

    /**
     * Assigns a random color value, encoded as a hex value in decimal
     * format, to a SPE.ShaderAttribute instance.
     * @param  {Object} attribute The instance of SPE.ShaderAttribute to save the result to.
     * @param  {Number} index     The offset in the attribute's TypedArray to save the result from.
     * @param  {Object} base      THREE.Color instance describing the start color.
     * @param  {Object} spread    THREE.Vector3 instance describing the random variance to apply to the start color.
     */
    return function (attribute, index, base, spread) {
        const numItems = base.length,
              colors = [];

        for (let i = 0; i < numItems; ++i) {
            const spreadVector = spread[i];

            workingColor.copy(base[i]);

            workingColor.r += Math.random() * spreadVector.x - spreadVector.x * 0.5;
            workingColor.g += Math.random() * spreadVector.y - spreadVector.y * 0.5;
            workingColor.b += Math.random() * spreadVector.z - spreadVector.z * 0.5;

            workingColor.r = clamp(workingColor.r, 0, 1);
            workingColor.g = clamp(workingColor.g, 0, 1);
            workingColor.b = clamp(workingColor.b, 0, 1);

            colors.push(workingColor.getHex());
        }

        attribute.typedArray.setVec4Components(index, colors[0], colors[1], colors[2], colors[3]);
    };
}();

/**
 * Assigns a random vector 3 value to an SPE.ShaderAttribute instance, projecting the
 * given values onto a sphere.
 *
 * @param  {Object} attribute The instance of SPE.ShaderAttribute to save the result to.
 * @param  {Number} index     The offset in the attribute's TypedArray to save the result from.
 * @param  {Object} base              THREE.Vector3 instance describing the origin of the transform.
 * @param  {Number} radius            The radius of the sphere to project onto.
 * @param  {Number} radiusSpread      The amount of randomness to apply to the projection result
 * @param  {Object} radiusScale       THREE.Vector3 instance describing the scale of each axis of the sphere.
 * @param  {Number} radiusSpreadClamp What numeric multiple the projected value should be clamped to.
 */
function randomVector3OnSphere(attribute, index, base, radius, radiusSpread, radiusScale, radiusSpreadClamp, distributionClamp) {
    var depth = 2 * Math.random() - 1,
        t = 6.2832 * Math.random(),
        r = Math.sqrt(1 - depth * depth),
        rand = randomFloat(radius, radiusSpread),
        x = 0,
        y = 0,
        z = 0;

    if (radiusSpreadClamp) {
        rand = Math.round(rand / radiusSpreadClamp) * radiusSpreadClamp;
    }

    // Set position on sphere
    x = r * Math.cos(t) * rand;
    y = r * Math.sin(t) * rand;
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
    attribute.typedArray.setVec3Components(index, x, y, z);
}

function seededRandom(seed) {
    const x = Math.sin(seed) * 10000;
    return x - (x | 0);
}

/**
 * Assigns a random vector 3 value to an SPE.ShaderAttribute instance, projecting the
 * given values onto a 2d-disc.
 *
 * @param  {Object} attribute The instance of SPE.ShaderAttribute to save the result to.
 * @param  {Number} index     The offset in the attribute's TypedArray to save the result from.
 * @param  {Object} base              THREE.Vector3 instance describing the origin of the transform.
 * @param  {Number} radius            The radius of the sphere to project onto.
 * @param  {Number} radiusSpread      The amount of randomness to apply to the projection result
 * @param  {Object} radiusScale       THREE.Vector3 instance describing the scale of each axis of the disc. The z-component is ignored.
 * @param  {Number} radiusSpreadClamp What numeric multiple the projected value should be clamped to.
 */
function randomVector3OnDisc(attribute, index, base, radius, radiusSpread, radiusScale, radiusSpreadClamp) {
    const t = 6.2832 * Math.random();
    let rand = Math.abs(randomFloat(radius, radiusSpread));

    let x = 0,
        y = 0,
        z = 0;

    if (radiusSpreadClamp) {
        rand = Math.round(rand / radiusSpreadClamp) * radiusSpreadClamp;
    }

    // Set position on sphere
    x = Math.cos(t) * rand;
    y = Math.sin(t) * rand;

    // Apply radius scale to this position
    x *= radiusScale.x;
    y *= radiusScale.y;

    // Translate to the base position.
    x += base.x;
    y += base.y;
    z += base.z;

    // Set the values in the typed array.
    attribute.typedArray.setVec3Components(index, x, y, z);
}

const randomDirectionVector3OnSphere = function () {
    const v = new three.Vector3();

    /**
     * Given an SPE.ShaderAttribute instance, create a direction vector from the given
     * position, using `speed` as the magnitude. Values are saved to the attribute.
     *
     * @param  {Object} attribute       The instance of SPE.ShaderAttribute to save the result to.
     * @param  {Number} index           The offset in the attribute's TypedArray to save the result from.
     * @param  {Number} posX            The particle's x coordinate.
     * @param  {Number} posY            The particle's y coordinate.
     * @param  {Number} posZ            The particle's z coordinate.
     * @param  {Object} emitterPosition THREE.Vector3 instance describing the emitter's base position.
     * @param  {Number} speed           The magnitude to apply to the vector.
     * @param  {Number} speedSpread     The amount of randomness to apply to the magnitude.
     */
    return function (attribute, index, posX, posY, posZ, emitterPosition, speed, speedSpread) {
        v.copy(emitterPosition);

        v.x -= posX;
        v.y -= posY;
        v.z -= posZ;

        v.normalize().multiplyScalar(-randomFloat(speed, speedSpread));

        attribute.typedArray.setVec3Components(index, v.x, v.y, v.z);
    };
}();

const randomDirectionVector3OnDisc = function () {
    const v = new three.Vector3();

    /**
     * Given an SPE.ShaderAttribute instance, create a direction vector from the given
     * position, using `speed` as the magnitude. Values are saved to the attribute.
     *
     * @param  {Object} attribute       The instance of SPE.ShaderAttribute to save the result to.
     * @param  {Number} index           The offset in the attribute's TypedArray to save the result from.
     * @param  {Number} posX            The particle's x coordinate.
     * @param  {Number} posY            The particle's y coordinate.
     * @param  {Number} posZ            The particle's z coordinate.
     * @param  {Object} emitterPosition THREE.Vector3 instance describing the emitter's base position.
     * @param  {Number} speed           The magnitude to apply to the vector.
     * @param  {Number} speedSpread     The amount of randomness to apply to the magnitude.
     */
    return function (attribute, index, posX, posY, posZ, emitterPosition, speed, speedSpread) {
        v.copy(emitterPosition);

        v.x -= posX;
        v.y -= posY;
        v.z -= posZ;

        v.normalize().multiplyScalar(-randomFloat(speed, speedSpread));

        attribute.typedArray.setVec3Components(index, v.x, v.y, 0);
    };
}();

const getPackedRotationAxis = function () {
    const v = new three.Vector3(),
          vSpread = new three.Vector3(),
          c = new three.Color(),
          addOne = new three.Vector3(1, 1, 1);

    /**
     * Given a rotation axis, and a rotation axis spread vector,
     * calculate a randomised rotation axis, and pack it into
     * a hexadecimal value represented in decimal form.
     * @param  {Object} axis       THREE.Vector3 instance describing the rotation axis.
     * @param  {Object} axisSpread THREE.Vector3 instance describing the amount of randomness to apply to the rotation axis.
     * @return {Number}            The packed rotation axis, with randomness.
     */
    return function (axis, axisSpread) {
        v.copy(axis).normalize();
        vSpread.copy(axisSpread).normalize();

        v.x += -axisSpread.x * 0.5 + Math.random() * axisSpread.x;
        v.y += -axisSpread.y * 0.5 + Math.random() * axisSpread.y;
        v.z += -axisSpread.z * 0.5 + Math.random() * axisSpread.z;

        // v.x = Math.abs( v.x );
        // v.y = Math.abs( v.y );
        // v.z = Math.abs( v.z );

        v.normalize().add(addOne).multiplyScalar(0.5);

        c.setRGB(v.x, v.y, v.z);

        return c.getHex();
    };
}();

var utils = Object.freeze({
	types: types,
	ensureTypedArg: ensureTypedArg,
	ensureArrayTypedArg: ensureArrayTypedArg,
	ensureInstanceOf: ensureInstanceOf,
	ensureArrayInstanceOf: ensureArrayInstanceOf,
	ensureValueOverLifetimeCompliance: ensureValueOverLifetimeCompliance,
	interpolateArray: interpolateArray,
	clamp: clamp,
	zeroToEpsilon: zeroToEpsilon,
	lerpTypeAgnostic: lerpTypeAgnostic,
	lerp: lerp,
	roundToNearestMultiple: roundToNearestMultiple,
	arrayValuesAreEqual: arrayValuesAreEqual,
	randomFloat: randomFloat,
	randomVector3: randomVector3,
	randomColor: randomColor,
	randomColorAsHex: randomColorAsHex,
	randomVector3OnSphere: randomVector3OnSphere,
	seededRandom: seededRandom,
	randomVector3OnDisc: randomVector3OnDisc,
	randomDirectionVector3OnSphere: randomDirectionVector3OnSphere,
	randomDirectionVector3OnDisc: randomDirectionVector3OnDisc,
	getPackedRotationAxis: getPackedRotationAxis
});

class Emitter {
    constructor(options = {}) {
        const lifetimeLength = valueOverLifetimeLength;

        // Ensure we have a map of options to play with,
        // and that each option is in the correct format.
        options.position = ensureTypedArg(options.position, types.OBJECT, {});
        options.velocity = ensureTypedArg(options.velocity, types.OBJECT, {});
        options.acceleration = ensureTypedArg(options.acceleration, types.OBJECT, {});
        options.radius = ensureTypedArg(options.radius, types.OBJECT, {});
        options.drag = ensureTypedArg(options.drag, types.OBJECT, {});
        options.rotation = ensureTypedArg(options.rotation, types.OBJECT, {});
        options.color = ensureTypedArg(options.color, types.OBJECT, {});
        options.opacity = ensureTypedArg(options.opacity, types.OBJECT, {});
        options.size = ensureTypedArg(options.size, types.OBJECT, {});
        options.angle = ensureTypedArg(options.angle, types.OBJECT, {});
        options.wiggle = ensureTypedArg(options.wiggle, types.OBJECT, {});
        options.maxAge = ensureTypedArg(options.maxAge, types.OBJECT, {});

        if (options.onParticleSpawn) {
            console.warn('onParticleSpawn has been removed. Please set properties directly to alter values at runtime.');
        }

        this.uuid = three.Math.generateUUID();

        this.type = ensureTypedArg(options.type, types.NUMBER, distributions.BOX);

        // Start assigning properties...kicking it off with props that DON'T support values over
        // lifetimes.
        //
        // Btw, values over lifetimes are just the new way of referring to *Start, *Middle, and *End.
        this.position = {
            _value: ensureInstanceOf(options.position.value, three.Vector3, new three.Vector3()),
            _spread: ensureInstanceOf(options.position.spread, three.Vector3, new three.Vector3()),
            _spreadClamp: ensureInstanceOf(options.position.spreadClamp, three.Vector3, new three.Vector3()),
            _distribution: ensureTypedArg(options.position.distribution, types.NUMBER, this.type),
            _randomise: ensureTypedArg(options.position.randomise, types.BOOLEAN, false),
            _radius: ensureTypedArg(options.position.radius, types.NUMBER, 10),
            _radiusScale: ensureInstanceOf(options.position.radiusScale, three.Vector3, new three.Vector3(1, 1, 1)),
            _distributionClamp: ensureTypedArg(options.position.distributionClamp, types.NUMBER, 0)
        };

        this.velocity = {
            _value: ensureInstanceOf(options.velocity.value, three.Vector3, new three.Vector3()),
            _spread: ensureInstanceOf(options.velocity.spread, three.Vector3, new three.Vector3()),
            _distribution: ensureTypedArg(options.velocity.distribution, types.NUMBER, this.type),
            _randomise: ensureTypedArg(options.position.randomise, types.BOOLEAN, false)
        };

        this.acceleration = {
            _value: ensureInstanceOf(options.acceleration.value, three.Vector3, new three.Vector3()),
            _spread: ensureInstanceOf(options.acceleration.spread, three.Vector3, new three.Vector3()),
            _distribution: ensureTypedArg(options.acceleration.distribution, types.NUMBER, this.type),
            _randomise: ensureTypedArg(options.position.randomise, types.BOOLEAN, false)
        };

        this.drag = {
            _value: ensureTypedArg(options.drag.value, types.NUMBER, 0),
            _spread: ensureTypedArg(options.drag.spread, types.NUMBER, 0),
            _randomise: ensureTypedArg(options.position.randomise, types.BOOLEAN, false)
        };

        this.wiggle = {
            _value: ensureTypedArg(options.wiggle.value, types.NUMBER, 0),
            _spread: ensureTypedArg(options.wiggle.spread, types.NUMBER, 0)
        };

        this.rotation = {
            _axis: ensureInstanceOf(options.rotation.axis, three.Vector3, new three.Vector3(0.0, 1.0, 0.0)),
            _axisSpread: ensureInstanceOf(options.rotation.axisSpread, three.Vector3, new three.Vector3()),
            _angle: ensureTypedArg(options.rotation.angle, types.NUMBER, 0),
            _angleSpread: ensureTypedArg(options.rotation.angleSpread, types.NUMBER, 0),
            _static: ensureTypedArg(options.rotation.static, types.BOOLEAN, false),
            _center: ensureInstanceOf(options.rotation.center, three.Vector3, this.position._value.clone()),
            _randomise: ensureTypedArg(options.position.randomise, types.BOOLEAN, false)
        };

        this.maxAge = {
            _value: ensureTypedArg(options.maxAge.value, types.NUMBER, 2),
            _spread: ensureTypedArg(options.maxAge.spread, types.NUMBER, 0)
        };

        // The following properties can support either single values, or an array of values that change
        // the property over a particle's lifetime (value over lifetime).
        this.color = {
            _value: ensureArrayInstanceOf(options.color.value, three.Color, new three.Color()),
            _spread: ensureArrayInstanceOf(options.color.spread, three.Vector3, new three.Vector3()),
            _randomise: ensureTypedArg(options.position.randomise, types.BOOLEAN, false)
        };

        this.opacity = {
            _value: ensureArrayTypedArg(options.opacity.value, types.NUMBER, 1),
            _spread: ensureArrayTypedArg(options.opacity.spread, types.NUMBER, 0),
            _randomise: ensureTypedArg(options.position.randomise, types.BOOLEAN, false)
        };

        this.size = {
            _value: ensureArrayTypedArg(options.size.value, types.NUMBER, 1),
            _spread: ensureArrayTypedArg(options.size.spread, types.NUMBER, 0),
            _randomise: ensureTypedArg(options.position.randomise, types.BOOLEAN, false)
        };

        this.angle = {
            _value: ensureArrayTypedArg(options.angle.value, types.NUMBER, 0),
            _spread: ensureArrayTypedArg(options.angle.spread, types.NUMBER, 0),
            _randomise: ensureTypedArg(options.position.randomise, types.BOOLEAN, false)
        };

        // Assign renaining option values.
        this.particleCount = ensureTypedArg(options.particleCount, types.NUMBER, 100);
        this.duration = ensureTypedArg(options.duration, types.NUMBER, null);
        this.isStatic = ensureTypedArg(options.isStatic, types.BOOLEAN, false);
        this.activeMultiplier = ensureTypedArg(options.activeMultiplier, types.NUMBER, 1);
        this.direction = ensureTypedArg(options.direction, types.NUMBER, 1);

        // Whether this emitter is alive or not.
        this.alive = ensureTypedArg(options.alive, types.BOOLEAN, true);

        // The following properties are set internally and are not
        // user-controllable.
        this.particlesPerSecond = 0;

        // The current particle index for which particles should
        // be marked as active on the next update cycle.
        this.activationIndex = 0;

        // The offset in the typed arrays this emitter's
        // particle's values will start at
        this.attributeOffset = 0;

        // The end of the range in the attribute buffers
        this.attributeEnd = 0;

        // Holds the time the emitter has been alive for.
        this.age = 0.0;

        // Holds the number of currently-alive particles
        this.activeParticleCount = 0.0;

        // Holds a reference to this emitter's group once
        // it's added to one.
        this.group = null;

        // Holds a reference to this emitter's group's attributes object
        // for easier access.
        this.attributes = null;

        // Holds a reference to the params attribute's typed array
        // for quicker access.
        this.paramsArray = null;

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
            // params: ensureTypedArg( options.maxAge.randomise, types.BOOLEAN, !!options.maxAge.spread ) ||
            //     ensureTypedArg( options.wiggle.randomise, types.BOOLEAN, !!options.wiggle.spread ),
            position: ensureTypedArg(options.position.randomise, types.BOOLEAN, false) || ensureTypedArg(options.radius.randomise, types.BOOLEAN, false),
            velocity: ensureTypedArg(options.velocity.randomise, types.BOOLEAN, false),
            acceleration: ensureTypedArg(options.acceleration.randomise, types.BOOLEAN, false) || ensureTypedArg(options.drag.randomise, types.BOOLEAN, false),
            rotation: ensureTypedArg(options.rotation.randomise, types.BOOLEAN, false),
            rotationCenter: ensureTypedArg(options.rotation.randomise, types.BOOLEAN, false),
            size: ensureTypedArg(options.size.randomise, types.BOOLEAN, false),
            color: ensureTypedArg(options.color.randomise, types.BOOLEAN, false),
            opacity: ensureTypedArg(options.opacity.randomise, types.BOOLEAN, false),
            angle: ensureTypedArg(options.angle.randomise, types.BOOLEAN, false)
        };

        this.updateFlags = {};
        this.updateCounts = {};

        // A map to indicate which emitter parameters should update
        // which attribute.
        this.updateMap = {
            maxAge: 'params',
            position: 'position',
            velocity: 'velocity',
            acceleration: 'acceleration',
            drag: 'acceleration',
            wiggle: 'params',
            rotation: 'rotation',
            size: 'size',
            color: 'color',
            opacity: 'opacity',
            angle: 'angle'
        };

        for (var i in this.updateMap) {
            if (this.updateMap.hasOwnProperty(i)) {
                this.updateCounts[this.updateMap[i]] = 0.0;
                this.updateFlags[this.updateMap[i]] = false;
                this._createGetterSetters(this[i], i);
            }
        }

        this.bufferUpdateRanges = {};
        this.attributeKeys = null;
        this.attributeCount = 0;

        // Ensure that the value-over-lifetime property objects above
        // have value and spread properties that are of the same length.
        //
        // Also, for now, make sure they have a length of 3 (min/max arguments here).
        ensureValueOverLifetimeCompliance(this.color, lifetimeLength, lifetimeLength);
        ensureValueOverLifetimeCompliance(this.opacity, lifetimeLength, lifetimeLength);
        ensureValueOverLifetimeCompliance(this.size, lifetimeLength, lifetimeLength);
        ensureValueOverLifetimeCompliance(this.angle, lifetimeLength, lifetimeLength);
    }

    _createGetterSetters(propObj, propName) {
        var self = this;

        for (var i in propObj) {
            if (propObj.hasOwnProperty(i)) {

                var name = i.replace('_', '');

                Object.defineProperty(propObj, name, {
                    get: function (prop) {
                        return function () {
                            return this[prop];
                        };
                    }(i),

                    set: function (prop) {
                        return function (value) {
                            var mapName = self.updateMap[propName],
                                prevValue = this[prop],
                                length = valueOverLifetimeLength;

                            if (prop === '_rotationCenter') {
                                self.updateFlags.rotationCenter = true;
                                self.updateCounts.rotationCenter = 0.0;
                            } else if (prop === '_randomise') {
                                self.resetFlags[mapName] = value;
                            } else {
                                self.updateFlags[mapName] = true;
                                self.updateCounts[mapName] = 0.0;
                            }

                            self.group._updateDefines();

                            this[prop] = value;

                            // If the previous value was an array, then make
                            // sure the provided value is interpolated correctly.
                            if (Array.isArray(prevValue)) {
                                ensureValueOverLifetimeCompliance(self[propName], length, length);
                            }
                        };
                    }(i)
                });
            }
        }
    }

    _setBufferUpdateRanges(keys) {
        this.attributeKeys = keys;
        this.attributeCount = keys.length;

        for (var i = this.attributeCount - 1; i >= 0; --i) {
            this.bufferUpdateRanges[keys[i]] = {
                min: Number.POSITIVE_INFINITY,
                max: Number.NEGATIVE_INFINITY
            };
        }
    }

    _calculatePPSValue(groupMaxAge) {
        var particleCount = this.particleCount;

        // Calculate the `particlesPerSecond` value for this emitter. It's used
        // when determining which particles should die and which should live to
        // see another day. Or be born, for that matter. The "God" property.
        if (this.duration) {
            this.particlesPerSecond = particleCount / (groupMaxAge < this.duration ? groupMaxAge : this.duration);
        } else {
            this.particlesPerSecond = particleCount / groupMaxAge;
        }
    }

    _setAttributeOffset(startIndex) {
        this.attributeOffset = startIndex;
        this.activationIndex = startIndex;
        this.activationEnd = startIndex + this.particleCount;
    }

    _assignValue(prop, index) {
        switch (prop) {
            case 'position':
                this._assignPositionValue(index);
                break;

            case 'velocity':
            case 'acceleration':
                this._assignForceValue(index, prop);
                break;

            case 'size':
            case 'opacity':
                this._assignAbsLifetimeValue(index, prop);
                break;

            case 'angle':
                this._assignAngleValue(index);
                break;

            case 'params':
                this._assignParamsValue(index);
                break;

            case 'rotation':
                this._assignRotationValue(index);
                break;

            case 'color':
                this._assignColorValue(index);
                break;
        }
    }

    _assignPositionValue(index) {
        var distributions$$1 = SPE.distributions,
            utils = utils,
            prop = this.position,
            attr = this.attributes.position,
            value = prop._value,
            spread = prop._spread,
            distribution = prop._distribution;

        switch (distribution) {
            case distributions$$1.BOX:
                randomVector3(attr, index, value, spread, prop._spreadClamp);
                break;

            case distributions$$1.SPHERE:
                randomVector3OnSphere(attr, index, value, prop._radius, prop._spread.x, prop._radiusScale, prop._spreadClamp.x, prop._distributionClamp || this.particleCount);
                break;

            case distributions$$1.DISC:
                randomVector3OnDisc(attr, index, value, prop._radius, prop._spread.x, prop._radiusScale, prop._spreadClamp.x);
                break;
        }
    }

    _assignForceValue(index, attrName) {
        var distributions$$1 = SPE.distributions,
            utils = utils,
            prop = this[attrName],
            value = prop._value,
            spread = prop._spread,
            distribution = prop._distribution,
            pos,
            positionX,
            positionY,
            positionZ,
            i;

        switch (distribution) {
            case distributions$$1.BOX:
                randomVector3(this.attributes[attrName], index, value, spread);
                break;

            case distributions$$1.SPHERE:
                pos = this.attributes.position.typedArray.array;
                i = index * 3;

                // Ensure position values aren't zero, otherwise no force will be
                // applied.
                // positionX = zeroToEpsilon( pos[ i ], true );
                // positionY = zeroToEpsilon( pos[ i + 1 ], true );
                // positionZ = zeroToEpsilon( pos[ i + 2 ], true );
                positionX = pos[i];
                positionY = pos[i + 1];
                positionZ = pos[i + 2];

                randomDirectionVector3OnSphere(this.attributes[attrName], index, positionX, positionY, positionZ, this.position._value, prop._value.x, prop._spread.x);
                break;

            case distributions$$1.DISC:
                pos = this.attributes.position.typedArray.array;
                i = index * 3;

                // Ensure position values aren't zero, otherwise no force will be
                // applied.
                // positionX = zeroToEpsilon( pos[ i ], true );
                // positionY = zeroToEpsilon( pos[ i + 1 ], true );
                // positionZ = zeroToEpsilon( pos[ i + 2 ], true );
                positionX = pos[i];
                positionY = pos[i + 1];
                positionZ = pos[i + 2];

                randomDirectionVector3OnDisc(this.attributes[attrName], index, positionX, positionY, positionZ, this.position._value, prop._value.x, prop._spread.x);
                break;
        }

        if (attrName === 'acceleration') {
            var drag = clamp(randomFloat(this.drag._value, this.drag._spread), 0, 1);
            this.attributes.acceleration.typedArray.array[index * 4 + 3] = drag;
        }
    }

    _assignAbsLifetimeValue(index, propName) {
        var array = this.attributes[propName].typedArray,
            prop = this[propName],
            utils = utils,
            value;

        if (arrayValuesAreEqual(prop._value) && arrayValuesAreEqual(prop._spread)) {
            value = Math.abs(randomFloat(prop._value[0], prop._spread[0]));
            array.setVec4Components(index, value, value, value, value);
        } else {
            array.setVec4Components(index, Math.abs(randomFloat(prop._value[0], prop._spread[0])), Math.abs(randomFloat(prop._value[1], prop._spread[1])), Math.abs(randomFloat(prop._value[2], prop._spread[2])), Math.abs(randomFloat(prop._value[3], prop._spread[3])));
        }
    }

    _assignAngleValue(index) {
        var array = this.attributes.angle.typedArray,
            prop = this.angle,
            utils = utils,
            value;

        if (arrayValuesAreEqual(prop._value) && arrayValuesAreEqual(prop._spread)) {
            value = randomFloat(prop._value[0], prop._spread[0]);
            array.setVec4Components(index, value, value, value, value);
        } else {
            array.setVec4Components(index, randomFloat(prop._value[0], prop._spread[0]), randomFloat(prop._value[1], prop._spread[1]), randomFloat(prop._value[2], prop._spread[2]), randomFloat(prop._value[3], prop._spread[3]));
        }
    }

    _assignParamsValue(index) {
        this.attributes.params.typedArray.setVec4Components(index, this.isStatic ? 1 : 0, 0.0, Math.abs(randomFloat(this.maxAge._value, this.maxAge._spread)), randomFloat(this.wiggle._value, this.wiggle._spread));
    }

    _assignRotationValue(index) {
        this.attributes.rotation.typedArray.setVec3Components(index, getPackedRotationAxis(this.rotation._axis, this.rotation._axisSpread), randomFloat(this.rotation._angle, this.rotation._angleSpread), this.rotation._static ? 0 : 1);

        this.attributes.rotationCenter.typedArray.setVec3(index, this.rotation._center);
    }

    _assignColorValue(index) {
        randomColorAsHex(this.attributes.color, index, this.color._value, this.color._spread);
    }

    _resetParticle(index) {
        var resetFlags = this.resetFlags,
            updateFlags = this.updateFlags,
            updateCounts = this.updateCounts,
            keys = this.attributeKeys,
            key,
            updateFlag;

        for (var i = this.attributeCount - 1; i >= 0; --i) {
            key = keys[i];
            updateFlag = updateFlags[key];

            if (resetFlags[key] === true || updateFlag === true) {
                this._assignValue(key, index);
                this._updateAttributeUpdateRange(key, index);

                if (updateFlag === true && updateCounts[key] === this.particleCount) {
                    updateFlags[key] = false;
                    updateCounts[key] = 0.0;
                } else if (updateFlag == true) {
                    ++updateCounts[key];
                }
            }
        }
    }

    _updateAttributeUpdateRange(attr, i) {
        var ranges = this.bufferUpdateRanges[attr];

        ranges.min = Math.min(i, ranges.min);
        ranges.max = Math.max(i, ranges.max);
    }

    _resetBufferRanges() {
        var ranges = this.bufferUpdateRanges,
            keys = this.bufferUpdateKeys,
            i = this.bufferUpdateCount - 1,
            key;

        for (i; i >= 0; --i) {
            key = keys[i];
            ranges[key].min = Number.POSITIVE_INFINITY;
            ranges[key].max = Number.NEGATIVE_INFINITY;
        }
    }

    _onRemove() {
        // Reset any properties of the emitter that were set by
        // a group when it was added.
        this.particlesPerSecond = 0;
        this.attributeOffset = 0;
        this.activationIndex = 0;
        this.activeParticleCount = 0;
        this.group = null;
        this.attributes = null;
        this.paramsArray = null;
        this.age = 0.0;
    }

    _decrementParticleCount() {
        --this.activeParticleCount;

        // TODO:
        //  - Trigger event if count === 0.
    }

    _incrementParticleCount() {
        ++this.activeParticleCount;

        // TODO:
        //  - Trigger event if count === this.particleCount.
    }

    _checkParticleAges(start, end, params, dt) {
        for (var i = end - 1, index, maxAge, age, alive; i >= start; --i) {
            index = i * 4;

            alive = params[index];

            if (alive === 0.0) {
                continue;
            }

            // Increment age
            age = params[index + 1];
            maxAge = params[index + 2];

            if (this.direction === 1) {
                age += dt;

                if (age >= maxAge) {
                    age = 0.0;
                    alive = 0.0;
                    this._decrementParticleCount();
                }
            } else {
                age -= dt;

                if (age <= 0.0) {
                    age = maxAge;
                    alive = 0.0;
                    this._decrementParticleCount();
                }
            }

            params[index] = alive;
            params[index + 1] = age;

            this._updateAttributeUpdateRange('params', i);
        }
    }

    _activateParticles(activationStart, activationEnd, params, dtPerParticle) {
        var direction = this.direction;

        for (var i = activationStart, index, dtValue; i < activationEnd; ++i) {
            index = i * 4;

            // Don't re-activate particles that aren't dead yet.
            // if ( params[ index ] !== 0.0 && ( this.particleCount !== 1 || this.activeMultiplier !== 1 ) ) {
            //     continue;
            // }

            if (params[index] != 0.0 && this.particleCount !== 1) {
                continue;
            }

            // Increment the active particle count.
            this._incrementParticleCount();

            // Mark the particle as alive.
            params[index] = 1.0;

            // Reset the particle
            this._resetParticle(i);

            // Move each particle being activated to
            // it's actual position in time.
            //
            // This stops particles being 'clumped' together
            // when frame rates are on the lower side of 60fps
            // or not constant (a very real possibility!)
            dtValue = dtPerParticle * (i - activationStart);
            params[index + 1] = direction === -1 ? params[index + 2] - dtValue : dtValue;

            this._updateAttributeUpdateRange('params', i);
        }
    }

    /**
     * Simulates one frame's worth of particles, updating particles
     * that are already alive, and marking ones that are currently dead
     * but should be alive as alive.
     *
     * If the emitter is marked as static, then this function will do nothing.
     *
     * @param  {Number} dt The number of seconds to simulate (deltaTime)
     */
    tick(dt) {
        if (this.isStatic) {
            return;
        }

        if (this.paramsArray === null) {
            this.paramsArray = this.attributes.params.typedArray.array;
        }

        var start = this.attributeOffset,
            end = start + this.particleCount,
            params = this.paramsArray,
            // vec3( alive, age, maxAge, wiggle )
        ppsDt = this.particlesPerSecond * this.activeMultiplier * dt,
            activationIndex = this.activationIndex;

        // Reset the buffer update indices.
        this._resetBufferRanges();

        // Increment age for those particles that are alive,
        // and kill off any particles whose age is over the limit.
        this._checkParticleAges(start, end, params, dt);

        // If the emitter is dead, reset the age of the emitter to zero,
        // ready to go again if required
        if (this.alive === false) {
            this.age = 0.0;
            return;
        }

        // If the emitter has a specified lifetime and we've exceeded it,
        // mark the emitter as dead.
        if (this.duration !== null && this.age > this.duration) {
            this.alive = false;
            this.age = 0.0;
            return;
        }

        var activationStart = this.particleCount === 1 ? activationIndex : activationIndex | 0,
            activationEnd = Math.min(activationStart + ppsDt, this.activationEnd),
            activationCount = activationEnd - this.activationIndex | 0,
            dtPerParticle = activationCount > 0 ? dt / activationCount : 0;

        this._activateParticles(activationStart, activationEnd, params, dtPerParticle);

        // Move the activation window forward, soldier.
        this.activationIndex += ppsDt;

        if (this.activationIndex > end) {
            this.activationIndex = start;
        }

        // Increment the age of the emitter.
        this.age += dt;
    }

    /**
     * Resets all the emitter's particles to their start positions
     * and marks the particles as dead if the `force` argument is
     * true.
     *
     * @param  {Boolean} [force=undefined] If true, all particles will be marked as dead instantly.
     * @return {Emitter}       This emitter instance.
     */
    reset(force) {
        this.age = 0.0;
        this.alive = false;

        if (force === true) {
            var start = this.attributeOffset,
                end = start + this.particleCount,
                array = this.paramsArray,
                attr = this.attributes.params.bufferAttribute;

            for (var i = end - 1, index; i >= start; --i) {
                index = i * 4;

                array[index] = 0.0;
                array[index + 1] = 0.0;
            }

            attr.updateRange.offset = 0;
            attr.updateRange.count = -1;
            attr.needsUpdate = true;
        }

        return this;
    }

    /**
     * Enables the emitter. If not already enabled, the emitter
     * will start emitting particles.
     *
     * @return {Emitter} This emitter instance.
     */
    enable() {
        this.alive = true;
        return this;
    }

    /**
     * Disables th emitter, but does not instantly remove it's
     * particles fromt the scene. When called, the emitter will be
     * 'switched off' and just stop emitting. Any particle's alive will
     * be allowed to finish their lifecycle.
     *
     * @return {Emitter} This emitter instance.
     */
    disable() {
        this.alive = false;
        return this;
    }

    /**
     * Remove this emitter from it's parent group (if it has been added to one).
     * Delgates to SPE.group.prototype.removeEmitter().
     *
     * When called, all particle's belonging to this emitter will be instantly
     * removed from the scene.
     *
     * @return {Emitter} This emitter instance.
     *
     * @see SPE.Group.prototype.removeEmitter
     */
    remove() {
        if (this.group !== null) {
            this.group.removeEmitter(this);
        } else {
            console.error('Emitter does not belong to a group, cannot remove.');
        }

        return this;
    }

    update() {
        this.position.value = this.position.value;
        this.position.spread = this.position.spread;
        this.position.spreadClamp = this.position.spreadClamp;

        this.acceleration.value = this.acceleration.value;
        this.acceleration.spread = this.acceleration.spread;

        this.velocity.value = this.velocity.value;
        this.velocity.spread = this.velocity.spread;

        this.color.value = this.color.value;

        this.opacity.value = this.opacity.value;
    }
}

/**
 * An SPE.Group instance.
 * @typedef {Object} Group
 * @see SPE.Group
 */

/**
 * A map of options to configure an SPE.Group instance.
 * @typedef {Object} GroupOptions
 *
 * @property {Object} texture An object describing the texture used by the group.
 *
 * @property {Object} texture.value An instance of THREE.Texture.
 *
 * @property {Object=} texture.frames A THREE.Vector2 instance describing the number
 *                                    of frames on the x- and y-axis of the given texture.
 *                                    If not provided, the texture will NOT be treated as
 *                                    a sprite-sheet and as such will NOT be animated.
 *
 * @property {Number} [texture.frameCount=texture.frames.x * texture.frames.y] The total number of frames in the sprite-sheet.
 *                                                                   Allows for sprite-sheets that don't fill the entire
 *                                                                   texture.
 *
 * @property {Number} texture.loop The number of loops through the sprite-sheet that should
 *                                 be performed over the course of a single particle's lifetime.
 *
 * @property {Number} fixedTimeStep If no `dt` (or `deltaTime`) value is passed to this group's
 *                                  `tick()` function, this number will be used to move the particle
 *                                  simulation forward. Value in SECONDS.
 *
 * @property {Boolean} hasPerspective Whether the distance a particle is from the camera should affect
 *                                    the particle's size.
 *
 * @property {Boolean} colorize Whether the particles in this group should be rendered with color, or
 *                              whether the only color of particles will come from the provided texture.
 *
 * @property {Number} blending One of Three.js's blending modes to apply to this group's `ShaderMaterial`.
 *
 * @property {Boolean} transparent Whether these particle's should be rendered with transparency.
 *
 * @property {Number} alphaTest Sets the alpha value to be used when running an alpha test on the `texture.value` property. Value between 0 and 1.
 *
 * @property {Boolean} depthWrite Whether rendering the group has any effect on the depth buffer.
 *
 * @property {Boolean} depthTest Whether to have depth test enabled when rendering this group.
 *
 * @property {Boolean} fog Whether this group's particles should be affected by their scene's fog.
 *
 * @property {Number} scale The scale factor to apply to this group's particle sizes. Useful for
 *                          setting particle sizes to be relative to renderer size.
 */

/**
 * The SPE.Group class. Creates a new group, containing a material, geometry, and mesh.
 *
 * @constructor
 * @param {GroupOptions} options A map of options to configure the group instance.
 */
class Group {
    constructor(options = {}) {
        // Ensure we have a map of options to play with
        options.texture = ensureTypedArg(options.texture, types.OBJECT, {});

        // Assign a UUID to this instance
        this.uuid = three.Math.generateUUID();

        // If no `deltaTime` value is passed to the `SPE.Group.tick` function,
        // the value of this property will be used to advance the simulation.
        this.fixedTimeStep = ensureTypedArg(options.fixedTimeStep, types.NUMBER, 0.016);

        // Set properties used in the uniforms map, starting with the
        // texture stuff.
        this.texture = ensureInstanceOf(options.texture.value, three.Texture, null);
        this.textureFrames = ensureInstanceOf(options.texture.frames, three.Vector2, new three.Vector2(1, 1));
        this.textureFrameCount = ensureTypedArg(options.texture.frameCount, types.NUMBER, this.textureFrames.x * this.textureFrames.y);
        this.textureLoop = ensureTypedArg(options.texture.loop, types.NUMBER, 1);
        this.textureFrames.max(new three.Vector2(1, 1));

        this.hasPerspective = ensureTypedArg(options.hasPerspective, types.BOOLEAN, true);
        this.colorize = ensureTypedArg(options.colorize, types.BOOLEAN, true);

        this.maxParticleCount = ensureTypedArg(options.maxParticleCount, types.NUMBER, null);

        // Set properties used to define the ShaderMaterial's appearance.
        this.blending = ensureTypedArg(options.blending, types.NUMBER, three.AdditiveBlending);
        this.transparent = ensureTypedArg(options.transparent, types.BOOLEAN, true);
        this.alphaTest = parseFloat(ensureTypedArg(options.alphaTest, types.NUMBER, 0.0));
        this.depthWrite = ensureTypedArg(options.depthWrite, types.BOOLEAN, false);
        this.depthTest = ensureTypedArg(options.depthTest, types.BOOLEAN, true);
        this.fog = ensureTypedArg(options.fog, types.BOOLEAN, true);
        this.scale = ensureTypedArg(options.scale, types.NUMBER, 300);

        // Where emitter's go to curl up in a warm blanket and live
        // out their days.
        this.emitters = [];
        this.emitterIDs = [];

        // Create properties for use by the emitter pooling functions.
        this._pool = [];
        this._poolCreationSettings = null;
        this._createNewWhenPoolEmpty = 0;

        // Whether all attributes should be forced to updated
        // their entire buffer contents on the next tick.
        //
        // Used when an emitter is removed.
        this._attributesNeedRefresh = false;
        this._attributesNeedDynamicReset = false;

        this.particleCount = 0;

        // Map of uniforms to be applied to the ShaderMaterial instance.
        this.uniforms = {
            texture: {
                type: 't',
                value: this.texture
            },
            textureAnimation: {
                type: 'v4',
                value: new three.Vector4(this.textureFrames.x, this.textureFrames.y, this.textureFrameCount, Math.max(Math.abs(this.textureLoop), 1.0))
            },
            fogColor: {
                type: 'c',
                value: null
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
            VALUE_OVER_LIFETIME_LENGTH: valueOverLifetimeLength,

            SHOULD_ROTATE_TEXTURE: false,
            SHOULD_ROTATE_PARTICLES: false,
            SHOULD_WIGGLE_PARTICLES: false,

            SHOULD_CALCULATE_SPRITE: this.textureFrames.x > 1 || this.textureFrames.y > 1,
            USE_TEXTURE: !!this.texture
        };

        // Map of all attributes to be applied to the particles.
        //
        // See ShaderAttribute for a bit more info on this bit.
        this.attributes = {
            position: new ShaderAttribute('v3', true),
            acceleration: new ShaderAttribute('v4', true), // w component is drag
            velocity: new ShaderAttribute('v3', true),
            rotation: new ShaderAttribute('v4', true),
            rotationCenter: new ShaderAttribute('v3', true),
            params: new ShaderAttribute('v4', true), // Holds (alive, age, delay, wiggle)
            size: new ShaderAttribute('v4', true),
            angle: new ShaderAttribute('v4', true),
            color: new ShaderAttribute('v4', true),
            opacity: new ShaderAttribute('v4', true)
        };

        this.attributeKeys = Object.keys(this.attributes);
        this.attributeCount = this.attributeKeys.length;

        // Create the ShaderMaterial instance that'll help render the
        // particles.
        this.material = new three.ShaderMaterial({
            uniforms: this.uniforms,
            vertexShader: shaders.vertex,
            fragmentShader: shaders.fragment,
            blending: this.blending,
            transparent: this.transparent,
            alphaTest: this.alphaTest,
            depthWrite: this.depthWrite,
            depthTest: this.depthTest,
            defines: this.defines,
            fog: this.fog
        });

        // Create the BufferGeometry and Points instances, ensuring
        // the geometry and material are given to the latter.
        this.geometry = new three.BufferGeometry();
        this.mesh = new three.Points(this.geometry, this.material);

        if (this.maxParticleCount === null) {
            console.warn('SPE.Group: No maxParticleCount specified. Adding emitters after rendering will probably cause errors.');
        }
    }

    _updateDefines() {
        var emitters = this.emitters,
            i = emitters.length - 1,
            emitter,
            defines = this.defines;

        for (i; i >= 0; --i) {
            emitter = emitters[i];

            // Only do angle calculation if there's no spritesheet defined.
            //
            // Saves calculations being done and then overwritten in the shaders.
            if (!defines.SHOULD_CALCULATE_SPRITE) {
                defines.SHOULD_ROTATE_TEXTURE = defines.SHOULD_ROTATE_TEXTURE || !!Math.max(Math.max.apply(null, emitter.angle.value), Math.max.apply(null, emitter.angle.spread));
            }

            defines.SHOULD_ROTATE_PARTICLES = defines.SHOULD_ROTATE_PARTICLES || !!Math.max(emitter.rotation.angle, emitter.rotation.angleSpread);

            defines.SHOULD_WIGGLE_PARTICLES = defines.SHOULD_WIGGLE_PARTICLES || !!Math.max(emitter.wiggle.value, emitter.wiggle.spread);
        }

        this.material.needsUpdate = true;
    }

    _applyAttributesToGeometry() {
        var attributes = this.attributes,
            geometry = this.geometry,
            geometryAttributes = geometry.attributes,
            attribute,
            geometryAttribute;

        // Loop through all the shader attributes and assign (or re-assign)
        // typed array buffers to each one.
        for (var attr in attributes) {
            if (attributes.hasOwnProperty(attr)) {
                attribute = attributes[attr];
                geometryAttribute = geometryAttributes[attr];

                // Update the array if this attribute exists on the geometry.
                //
                // This needs to be done because the attribute's typed array might have
                // been resized and reinstantiated, and might now be looking at a
                // different ArrayBuffer, so reference needs updating.
                if (geometryAttribute) {
                    geometryAttribute.array = attribute.typedArray.array;
                }

                // // Add the attribute to the geometry if it doesn't already exist.
                else {
                        geometry.addAttribute(attr, attribute.bufferAttribute);
                    }

                // Mark the attribute as needing an update the next time a frame is rendered.
                attribute.bufferAttribute.needsUpdate = true;
            }
        }

        // Mark the draw range on the geometry. This will ensure
        // only the values in the attribute buffers that are
        // associated with a particle will be used in THREE's
        // render cycle.
        this.geometry.setDrawRange(0, this.particleCount);
    }

    /**
     * Adds an SPE.Emitter instance to this group, creating particle values and
     * assigning them to this group's shader attributes.
     *
     * @param {Emitter} emitter The emitter to add to this group.
     */
    addEmitter(emitter) {
        // Ensure an actual emitter instance is passed here.
        //
        // Decided not to throw here, just in case a scene's
        // rendering would be pause d. Logging an error instead
        // of stopping execution if exceptions aren't caught.
        if (emitter instanceof Emitter === false) {
            console.error('`emitter` argument must be instance of SPE.Emitter. Was provided with:', emitter);
            return;
        }

        // If the emitter already exists as a member of this group, then
        // stop here, we don't want to add it again.
        else if (this.emitterIDs.indexOf(emitter.uuid) > -1) {
                console.error('Emitter already exists in this group. Will not add again.');
                return;
            }

            // And finally, if the emitter is a member of another group,
            // don't add it to this group.
            else if (emitter.group !== null) {
                    console.error('Emitter already belongs to another group. Will not add to requested group.');
                    return;
                }

        var attributes = this.attributes,
            start = this.particleCount,
            end = start + emitter.particleCount;

        // Update this group's particle count.
        this.particleCount = end;

        // Emit a warning if the emitter being added will exceed the buffer sizes specified.
        if (this.maxParticleCount !== null && this.particleCount > this.maxParticleCount) {
            console.warn('SPE.Group: maxParticleCount exceeded. Requesting', this.particleCount, 'particles, can support only', this.maxParticleCount);
        }

        // Set the `particlesPerSecond` value (PPS) on the emitter.
        // It's used to determine how many particles to release
        // on a per-frame basis.
        emitter._calculatePPSValue(emitter.maxAge._value + emitter.maxAge._spread);
        emitter._setBufferUpdateRanges(this.attributeKeys);

        // Store the offset value in the TypedArray attributes for this emitter.
        emitter._setAttributeOffset(start);

        // Save a reference to this group on the emitter so it knows
        // where it belongs.
        emitter.group = this;

        // Store reference to the attributes on the emitter for
        // easier access during the emitter's tick function.
        emitter.attributes = this.attributes;

        // Ensure the attributes and their BufferAttributes exist, and their
        // TypedArrays are of the correct size.
        for (var attr in attributes) {
            if (attributes.hasOwnProperty(attr)) {
                // When creating a buffer, pass through the maxParticle count
                // if one is specified.
                attributes[attr]._createBufferAttribute(this.maxParticleCount !== null ? this.maxParticleCount : this.particleCount);
            }
        }

        // Loop through each particle this emitter wants to have, and create the attributes values,
        // storing them in the TypedArrays that each attribute holds.
        for (var i = start; i < end; ++i) {
            emitter._assignPositionValue(i);
            emitter._assignForceValue(i, 'velocity');
            emitter._assignForceValue(i, 'acceleration');
            emitter._assignAbsLifetimeValue(i, 'opacity');
            emitter._assignAbsLifetimeValue(i, 'size');
            emitter._assignAngleValue(i);
            emitter._assignRotationValue(i);
            emitter._assignParamsValue(i);
            emitter._assignColorValue(i);
        }

        // Update the geometry and make sure the attributes are referencing
        // the typed arrays properly.
        this._applyAttributesToGeometry();

        // Store this emitter in this group's emitter's store.
        this.emitters.push(emitter);
        this.emitterIDs.push(emitter.uuid);

        // Update certain flags to enable shader calculations only if they're necessary.
        this._updateDefines(emitter);

        // Update the material since defines might have changed
        this.material.needsUpdate = true;
        this.geometry.needsUpdate = true;
        this._attributesNeedRefresh = true;

        // Return the group to enable chaining.
        return this;
    }

    /**
     * Removes an SPE.Emitter instance from this group. When called,
     * all particle's belonging to the given emitter will be instantly
     * removed from the scene.
     *
     * @param {Emitter} emitter The emitter to add to this group.
     */
    removeEmitter(emitter) {
        var emitterIndex = this.emitterIDs.indexOf(emitter.uuid);

        // Ensure an actual emitter instance is passed here.
        //
        // Decided not to throw here, just in case a scene's
        // rendering would be paused. Logging an error instead
        // of stopping execution if exceptions aren't caught.
        if (emitter instanceof Emitter === false) {
            console.error('`emitter` argument must be instance of SPE.Emitter. Was provided with:', emitter);
            return;
        }

        // Issue an error if the emitter isn't a member of this group.
        else if (emitterIndex === -1) {
                console.error('Emitter does not exist in this group. Will not remove.');
                return;
            }

        // Kill all particles by marking them as dead
        // and their age as 0.
        var start = emitter.attributeOffset,
            end = start + emitter.particleCount,
            params = this.attributes.params.typedArray;

        // Set alive and age to zero.
        for (var i = start; i < end; ++i) {
            params.array[i * 4] = 0.0;
            params.array[i * 4 + 1] = 0.0;
        }

        // Remove the emitter from this group's "store".
        this.emitters.splice(emitterIndex, 1);
        this.emitterIDs.splice(emitterIndex, 1);

        // Remove this emitter's attribute values from all shader attributes.
        // The `.splice()` call here also marks each attribute's buffer
        // as needing to update it's entire contents.
        for (var attr in this.attributes) {
            if (this.attributes.hasOwnProperty(attr)) {
                this.attributes[attr].splice(start, end);
            }
        }

        // Ensure this group's particle count is correct.
        this.particleCount -= emitter.particleCount;

        // Call the emitter's remove method.
        emitter._onRemove();

        // Set a flag to indicate that the attribute buffers should
        // be updated in their entirety on the next frame.
        this._attributesNeedRefresh = true;
    }

    /**
     * Fetch a single emitter instance from the pool.
     * If there are no objects in the pool, a new emitter will be
     * created if specified.
     *
     * @return {Emitter|null}
     */
    getFromPool() {
        var pool = this._pool,
            createNew = this._createNewWhenPoolEmpty;

        if (pool.length) {
            return pool.pop();
        } else if (createNew) {
            this.addEmitter(new Emitter(this._poolCreationSettings));
        }

        return null;
    }

    /**
     * Release an emitter into the pool.
     *
     * @param  {ShaderParticleEmitter} emitter
     * @return {Group} This group instance.
     */
    releaseIntoPool(emitter) {
        if (emitter instanceof Emitter === false) {
            console.error('Argument is not instanceof SPE.Emitter:', emitter);
            return;
        }

        emitter.reset();
        this._pool.unshift(emitter);

        return this;
    }

    /**
     * Get the pool array
     *
     * @return {Array}
     */
    getPool() {
        return this._pool;
    }

    /**
     * Add a pool of emitters to this particle group
     *
     * @param {Number} numEmitters      The number of emitters to add to the pool.
     * @param {EmitterOptions|Array} emitterOptions  An object, or array of objects, describing the options to pass to each emitter.
     * @param {Boolean} createNew       Should a new emitter be created if the pool runs out?
     * @return {Group} This group instance.
     */
    addPool(numEmitters, emitterOptions, createNew) {
        var emitter;

        // Save relevant settings and flags.
        this._poolCreationSettings = emitterOptions;
        this._createNewWhenPoolEmpty = !!createNew;

        // Create the emitters, add them to this group and the pool.
        for (var i = 0; i < numEmitters; ++i) {
            if (Array.isArray(emitterOptions)) {
                emitter = new Emitter(emitterOptions[i]);
            } else {
                emitter = new Emitter(emitterOptions);
            }
            this.addEmitter(emitter);
            this.releaseIntoPool(emitter);
        }

        return this;
    }

    _triggerSingleEmitter(pos) {
        var emitter = this.getFromPool(),
            self = this;

        if (emitter === null) {
            console.log('SPE.Group pool ran out.');
            return;
        }

        // TODO:
        // - Make sure buffers are update with this new position.
        if (pos instanceof three.Vector3) {
            emitter.position.value.copy(pos);

            // Trigger the setter for this property to force an
            // update to the emitter's position attribute.
            emitter.position.value = emitter.position.value;
        }

        emitter.enable();

        setTimeout(function () {
            emitter.disable();
            self.releaseIntoPool(emitter);
        }, Math.max(emitter.duration, emitter.maxAge.value + emitter.maxAge.spread) * 1000);

        return this;
    }

    /**
     * Set a given number of emitters as alive, with an optional position
     * vector3 to move them to.
     *
     * @param  {Number} numEmitters The number of emitters to activate
     * @param  {Object} [position=undefined] A THREE.Vector3 instance describing the position to activate the emitter(s) at.
     * @return {Group} This group instance.
     */
    triggerPoolEmitter(numEmitters, position) {
        if (typeof numEmitters === 'number' && numEmitters > 1) {
            for (var i = 0; i < numEmitters; ++i) {
                this._triggerSingleEmitter(position);
            }
        } else {
            this._triggerSingleEmitter(position);
        }

        return this;
    }

    _updateUniforms(dt) {
        this.uniforms.runTime.value += dt;
        this.uniforms.deltaTime.value = dt;
    }

    _resetBufferRanges() {
        var keys = this.attributeKeys,
            i = this.attributeCount - 1,
            attrs = this.attributes;

        for (i; i >= 0; --i) {
            attrs[keys[i]].resetUpdateRange();
        }
    }

    _updateBuffers(emitter) {
        var keys = this.attributeKeys,
            i = this.attributeCount - 1,
            attrs = this.attributes,
            emitterRanges = emitter.bufferUpdateRanges,
            key,
            emitterAttr,
            attr;

        for (i; i >= 0; --i) {
            key = keys[i];
            emitterAttr = emitterRanges[key];
            attr = attrs[key];
            attr.setUpdateRange(emitterAttr.min, emitterAttr.max);
            attr.flagUpdate();
        }
    }

    /**
     * Simulate all the emitter's belonging to this group, updating
     * attribute values along the way.
     * @param  {Number} [dt=Group's `fixedTimeStep` value] The number of seconds to simulate the group's emitters for (deltaTime)
     */
    tick(dt) {
        var emitters = this.emitters,
            numEmitters = emitters.length,
            deltaTime = dt || this.fixedTimeStep,
            keys = this.attributeKeys,
            i,
            attrs = this.attributes;

        // Update uniform values.
        this._updateUniforms(deltaTime);

        // Reset buffer update ranges on the shader attributes.
        this._resetBufferRanges();

        // If nothing needs updating, then stop here.
        if (numEmitters === 0 && this._attributesNeedRefresh === false && this._attributesNeedDynamicReset === false) {
            return;
        }

        // Loop through each emitter in this group and
        // simulate it, then update the shader attribute
        // buffers.
        for (var i = 0, emitter; i < numEmitters; ++i) {
            emitter = emitters[i];
            emitter.tick(deltaTime);
            this._updateBuffers(emitter);
        }

        // If the shader attributes have been refreshed,
        // then the dynamic properties of each buffer
        // attribute will need to be reset back to
        // what they should be.
        if (this._attributesNeedDynamicReset === true) {
            i = this.attributeCount - 1;

            for (i; i >= 0; --i) {
                attrs[keys[i]].resetDynamic();
            }

            this._attributesNeedDynamicReset = false;
        }

        // If this group's shader attributes need a full refresh
        // then mark each attribute's buffer attribute as
        // needing so.
        if (this._attributesNeedRefresh === true) {
            i = this.attributeCount - 1;

            for (i; i >= 0; --i) {
                attrs[keys[i]].forceUpdateAll();
            }

            this._attributesNeedRefresh = false;
            this._attributesNeedDynamicReset = true;
        }
    }

    /**
     * Dipose the geometry and material for the group.
     *
     * @return {Group} Group instance.
     */
    dispose() {
        this.geometry.dispose();
        this.material.dispose();
        return this;
    }

    update() {
        this.texture = ensureInstanceOf(this.texture, three.Texture, null);
        this.textureFrames = ensureInstanceOf(this.textureFrames, three.Vector2, new three.Vector2(1, 1));
        this.textureFrameCount = ensureTypedArg(this.textureFrameCount, types.NUMBER, this.textureFrames.x * this.textureFrames.y);
        this.textureLoop = ensureTypedArg(this.textureLoop, types.NUMBER, 1);

        this.defines.USE_TEXTURE = !!this.texture;

        this.uniforms.texture.value = this.texture;
        this.uniforms.scale.value = this.scale;
        this.uniforms.textureAnimation.value.set(this.textureFrames.x, this.textureFrames.y, this.textureFrameCount, Math.max(Math.abs(this.textureLoop), 1.0));

        this.material.needsUpdate = true;
    }

    updateAll() {
        var emitters = this.emitters,
            numEmitters = emitters.length;

        this.update();

        // If nothing needs updating, then stop here.
        if (numEmitters === 0) {
            return;
        }

        for (var i = 0, emitter; i < numEmitters; ++i) {
            emitters[i].update();
        }
    }
}

var index = {
	distributions,
	typeSizeMap,
	valueOverLifetimeLength,
	shaderChunks,
	shaders,
	ShaderAttribute,
	TypedArrayHelper,
	utils,
	Emitter,
	Group
};

return index;

})));
