import * as THREE from 'three';
import TypedArrayHelper from './TypedArrayHelper';
import typeSizeMap from '@/constants/typeSizeMap';

const HAS_OWN = Object.prototype.hasOwnProperty;

/**
 * A helper to handle creating and updating a THREE.BufferAttribute instance.
 *
 * @author  Luke Moody
 * @constructor
 * @param {String} type          The buffer attribute type. See `typeSizeMap`` for valid values.
 * @param {Boolean=} dynamicBuffer Whether this buffer attribute should be marked as dynamic or not.
 * @param {Function=} arrayType     A reference to a TypedArray constructor. Defaults to Float32Array if none provided.
 */
export default class ShaderAttribute {
	constructor( type, dynamicBuffer, arrayType ) {
		this.type = typeof type === 'string' && HAS_OWN.call( typeSizeMap, type ) ? type : 'f';
		this.componentSize = typeSizeMap[ this.type ];
		this.arrayType = arrayType || Float32Array;
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
	setUpdateRange( min, max ) {
		this.updateMin = Math.min( min * this.componentSize, this.updateMin * this.componentSize );
		this.updateMax = Math.max( max * this.componentSize, this.updateMax * this.componentSize );
	}

	/**
	 * Calculate the number of indices that this attribute should mark as needing
	 * updating. Also marks the attribute as needing an update.
	 */
	flagUpdate() {
		const attr = this.bufferAttribute,
			range = attr.updateRange;

		range.offset = this.updateMin;
		range.count = Math.min( ( this.updateMax - this.updateMin ) + this.componentSize, this.typedArray.array.length );
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
		this.bufferAttribute.usage = this.dynamicBuffer ?
			THREE.DynamicDrawUsage :
			THREE.StaticDrawUsage;
	}

	/**
	 * Perform a splice operation on this attribute's buffer.
	 * @param  {Number} start The start index of the splice. Will be multiplied by the number of components for this attribute.
	 * @param  {Number} end The end index of the splice. Will be multiplied by the number of components for this attribute.
	 */
	splice( start, end ) {
		this.typedArray.splice( start, end );

		// Reset the reference to the attribute's typed array
		// since it has probably changed.
		this.forceUpdateAll();
	}

	forceUpdateAll() {
		this.bufferAttribute.array = this.typedArray.array;
		this.bufferAttribute.updateRange.offset = 0;
		this.bufferAttribute.updateRange.count = -1;

		this.bufferAttribute.usage = THREE.StaticDrawUsage;
		this.bufferAttribute.needsUpdate = true;
	}

	/**
	 * Make sure this attribute has a typed array associated with it.
	 *
	 * If it does, then it will ensure the typed array is of the correct size.
	 *
	 * If not, a new `TypedArrayHelper` instance will be created.
	 *
	 * @param  {Number} size The size of the typed array to create or update to.
	 */
	_ensureTypedArray( size ) {
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
			this.typedArray = new TypedArrayHelper( this.arrayType, size, this.componentSize );
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
	_createBufferAttribute( size ) {
		// Make sure the typedArray is present and correct.
		this._ensureTypedArray( size );

		// Don't create it if it already exists, but do
		// flag that it needs updating on the next render
		// cycle.
		if ( this.bufferAttribute !== null ) {
			this.bufferAttribute.array = this.typedArray.array;

			// Since THREE.js version 81, dynamic count calculation was removed
			// so I need to do it manually here.
			//
			// In the next minor release, I may well remove this check and force
			// dependency on THREE r81+.
			if ( parseFloat( THREE.REVISION ) >= 81 ) {
				this.bufferAttribute.count = this.bufferAttribute.array.length / this.bufferAttribute.itemSize;
			}

			this.bufferAttribute.needsUpdate = true;
			return;
		}

		this.bufferAttribute = new THREE.BufferAttribute( this.typedArray.array, this.componentSize );

		this.bufferAttribute.usage = this.dynamicBuffer ?
			THREE.DynamicDrawUsage :
			THREE.StaticDrawUsage;
	}

	/**
	 * Returns the length of the typed array associated with this attribute.
	 * @return {Number} The length of the typed array. Will be 0 if no typed array has been created yet.
	 */
	getLength() {
		if ( this.typedArray === null ) {
			return 0;
		}

		return this.typedArray.array.length;
	}

}

