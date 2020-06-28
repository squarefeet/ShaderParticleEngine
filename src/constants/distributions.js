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
export default {

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
	DISC: 3,

	/**
	 * Values will be distributed along a line.
	 * @type {Number}
	 */
	LINE: 4,
};