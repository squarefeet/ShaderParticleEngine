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
};