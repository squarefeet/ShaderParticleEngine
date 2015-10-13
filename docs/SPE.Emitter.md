SPE.Emitter
===========

Creating an Emitter
-------------------
A single particle emitter is created as shown below. It's only argument is a map of [options](#configuring-an-emitter):

```
var emitter = new SPE.Emitter( {
	optionName: optionValue
} );
```


Adding an Emitter to a Group
----------------------------
Many emitters can be added to a single group. These emitters will be rendered using the same attribute buffers and will save valuable time in your render loop by keeping CPU -> GPU data transfer to a minimum.

To add an emitter to a group, do the following:

```
group.addEmitter( emitter );
```

If you have multiple emitters to add at the same time, the method can be 'chained' as follows:
```
group.addEmitter( emitter1 ).addEmitter( emitter2 ); // etc.
```


Removing an Emitter from a Group
--------------------------------
TODO!



Configuring an Emitter
----------------------
The available options are listed below, following this format:

`optionName`
*optionType*
**default value**

Option description text...

----

All options are type or instanced checked, so if a particular option asks for a number, for example, make sure it's given a number and not a string, or the value won't be applied.

----

**Available options**

`type` *Number* **SPE.distributions.BOX**

There are three available distributions:

* `SPE.distributions.BOX`
* `SPE.distributions.SPHERE`
* `SPE.distributions.DISC`

When the `type` option is supplied, it will be used as the default distribution type for all other properties that support a distribution type (such as `position`, `velocity`, etc.).

Note that if, for example, the `position` property has a `distribution` value, it will override the default one.


----


`particleCount` *Number* **100**

The total number of particles this emitter should hold.

----

`duration` *Number | null* **null**

If a number is supplied to this property, the emitter will only emit particles for that number of seconds.

----

`position` *Object* **{}**

The `position` option can have the following properties set on it:

* `value` *THREE.Vector3* **new THREE.Vector3()**
	* This is "origin" of the emitter. It's relative to an emitter group's mesh position.

* `spread` *THREE.Vector3* **new THREE.Vector3()**
	* Using the `value` option above, each particle will have it's starting position spread out using this Vector3 as it's spread distance.

* `spreadClamp` *THREE.Vector3* **new THREE.Vector3()**
	* When spreading out the particles' start positions, you can clamp the spread values to multiples of this vector. Handy for creating grids, etc.

* `distribution` *Number* **`type`**
	* You can override the distribution method used when assigning a particle's start position here. Note that if no `distribution` value is specified, or is of the incorrect type, it will inherit from the emitter's `type` property.


----


`velocity` *Object* **{}**

The `velocity` option can have the following properties set on it:

* `value` *THREE.Vector3* **new THREE.Vector3()**
	* The velocity vector to apply to each particle.

* `spread` *THREE.Vector3* **new THREE.Vector3()**
	* Using the `value` option above, each particle will have it's velocity value spread out, using this Vector3 value as it's spread amount.

* `distribution` *Number* **`type`**
	* You can override the distribution method used when assigning a particle's start position here. Note that if no `distribution` value is specified, or is of the incorrect type, it will inherit from the emitter's `type` property.

	* Using a `SPE.distributions.BOX` type will use all three components of the `value` and `spread` vectors to create a velocity vector on a per-particle basis.
	* Using `SPE.distributions.SPHERE` type will use **ONLY** the `.x` component of the `value` and `spread` vectors to create a direction vector, using each particle's position as the origin.


----


`acceleration` *Object* **{}**

The `acceleration` option can have the following properties set on it:

* `value` *THREE.Vector3* **new THREE.Vector3()**
	* The acceleration vector to apply to each particle.

* `spread` *THREE.Vector3* **new THREE.Vector3()**
	* Using the `value` option above, each particle will have it's acceleration value spread out, using this Vector3 value as it's spread amount.

* `distribution` *Number* **`type`**
	* You can override the distribution method used when assigning a particle's start position here. Note that if no `distribution` value is specified, or is of the incorrect type, it will inherit from the emitter's `type` property.

	* Using a `SPE.distributions.BOX` type will use all three components of the `value` and `spread` vectors to create a acceleration vector on a per-particle basis.
	* Using `SPE.distributions.SPHERE` type will use **ONLY** the `.x` component of the `value` and `spread` vectors to create a direction vector, using each particle's position as the origin.


----


`drag` *Object* **{}**

The `drag` option can have the following properties set on it:

* `value` *Number* **0**
	* The amount of drag to reduce the `velocity` value by over the particle's lifetime. Giving a value of `1`, for example, will mean that by the end of a particle's life, it's velocity value will be `0`.

	* Must be provided with a value between `0` and `1`.

* `spread` *Number* **0**
	* Will spread out the amount of drag applied to each particle using this number.


----


`wiggle` *Object* **{}**

This is quite a fun one! The values of this object will determine whether a particle will wiggle, or jiggle, or wave, or shimmy, or waggle, or... Well you get the idea.

The wiggle is calculated over-time, meaning that a particle will start off with no wiggle, and end up wiggling about with the distance of the `value` specified by the time it dies.

It's quite handy to simulate fire embers, or similar effects where the particle's position should slightly change over time, and such change isn't easily controlled by rotation, velocity, or acceleration.

* `value` *Number* **0**
	* The distance of the wiggle.

* `spread` *Number* **0**
	* Will spread out the amount of wiggle applied to each particle using this number.


----


`rotation` *Object* **{}**

Rotates the entire emitter around a given axis. Can be a static rotation, or a rotation applied over a particle's lifetime. The options are as follows:

* `axis` *THREE.Vector3* **new THREE.Vector3( 0, 1, 0 )**
	* This is the axis of rotation. The default value will cause a rotation around the y-axis of the emitter. This argument is normalize for you, so don't worry about providing a normalized vector here.

* `axisSpread` *THREE.Vector3* **new THREE.Vector3( 0, 0, 0 )**
	* Will alter the axis of rotation for each particle based on this spread value. This argument is normalize for you, so don't worry about providing a normalized vector here.

* `angle` *Number* **0**
	* The angle of rotation, measured in *radians*.

* `angleSpread` *Number* **0**
	* The amount of variance to apply to each particle's rotation angle. Measured in *radians*.

* `static` *Boolean* **false**
	* Whether this rotation will be static (`true`), or whether each particle will rotate from `0` to `angle` radians over its lifetime.

* `center` *THREE.Vector3* **`position.value`**
	* The center of rotation. If not specified, it inherits from the `position.value` property.


----


`maxAge` *Object* **{}**

Controls how long a particle will live for, and allows for variance. Contains the following options:

* `value` *Number* **2**
	* The maximum age of a particle, measured in seconds. Particles older than this value will be killed in cold blood.

* `spread` *Number* **0**
	* How much variance to apply to each particle's maximum age.


----


`color` *Object* **{}**

Controls the colour of your particles. It's a value-over-lifetime property, so arrays of values can be given to the `value` property, and will be re-interpolated (if necessary) to make sure the arrays are the same length as `SPE.valueOverLifetimeLength` before they're used.

Contains the following options:

* `value` *THREE.Color | Array* **new THREE.Color()**
	* Either provide a single `THREE.Color` instance, or an array of `THREE.Color` instances that control the color of a particle over it's lifetime.
	* Note that if ANY of the array's values are not Color instances, it will fallback to the default value given above.

* `spread` *THREE.Vector3* **new THREE.Vector3()**
	* The amount of variance to apply to each particle's color.


----


`opacity` *Object* **{}**

Controls the opacity/transparency of your particles. It's a value-over-lifetime property, so arrays of values can be given to the `value` property, and will be re-interpolated (if necessary) to make sure the arrays are the same length as `SPE.valueOverLifetimeLength` before they're used.

Contains the following options:

* `value` *Number | Array* **1**
	* Either provide a single number, or an array of numbers that control the opacity of a particle over it's lifetime.
	* Note that if ANY of the array's values are not numbers, it will fallback to the default value given above.

* `spread` *Number* **0**
	* The amount of variance to apply to each particle's opacity value.

----

`size` *Object* **{}**

Controls the size of your particles. It's a value-over-lifetime property, so arrays of values can be given to the `value` property, and will be re-interpolated (if necessary) to make sure the arrays are the same length as `SPE.valueOverLifetimeLength` before they're used.

Contains the following options:

* `value` *Number | Array* **1**
	* Either provide a single number, or an array of numbers that control the size of a particle over it's lifetime.
	* Note that if ANY of the array's values are not numbers, it will fallback to the default value given above.

* `spread` *Number* **0**
	* The amount of variance to apply to each particle's size value.


----


`angle` *Object* **{}**

Controls the angle of the texture used to render particles. It's a value-over-lifetime property, so arrays of values can be given to the `value` property, and will be re-interpolated (if necessary) to make sure the arrays are the same length as `SPE.valueOverLifetimeLength` before they're used.

The angle used to create a 2D rotation around the x/y axes of the texture before sampling.

Contains the following options:

* `value` *Number | Array* **1**
	* Either provide a single number, or an array of numbers that control the angle of a particle's texture over it's lifetime.
	* Note that if ANY of the array's values are not numbers, it will fallback to the default value given above.

* `spread` *Number* **0**
	* The amount of variance to apply to each particle's texture angle.

