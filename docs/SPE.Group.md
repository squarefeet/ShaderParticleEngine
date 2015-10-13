SPE.Group
=========


Creating a group
----------------
A group is created as follows, and takes a map of option key/value pairs as its only argument:

```
var group = new SPE.Group( {
	optionName: optionValue,
	// etc.
} );
```

Adding emitters to a group
--------------------------
Many emitters can be added to a single group. These emitters will be rendered using the same attribute buffers and will save valuable time in your render loop by keeping CPU -> GPU data transfer to a minimum.

To add an emitter to a group, do the following, where `emitter` is an instance of `SPE.Emitter`.

```
group.addEmitter( emitter );
```

If you have multiple emitters to add at the same time, the method can be 'chained' as follows:
```
group.addEmitter( emitter1 ).addEmitter( emitter2 ); // etc.
```


Adding a group to a scene
-------------------------
To render the group, add the group's `mesh` object to your scene:

```
scene.add( group.mesh );
```


Updating a group
----------------
A group must be updated on a per-frame basis, so within a render/animation loop do the following to update the group:

```
group.tick( deltaTime );
```

The deltaTime argument is a number denoting the time it took to render the previous frame. It's easily got by using an instance of `THREE.Clock()` and using the `.getDelta()` method. If you don't pass a `deltaTime` argument to your group's `.tick()` function, the value of `group.fixedTimeStep` will be used.



Configuring a group
-------------------
The available options are listed below, following this format:

`optionName`
*optionType*
**default value**

Description

----

**Available options**

`texture`
*THREE.Texture*
**null**

The texture to apply to all particles in the group.

-

`fixedTimeStep`
*Number*
**0.016**

If no `deltaTime` value is passed to the groups `.tick()` function, this value is used.

-

`hasPerspective`
*Boolean*
**true**

Whether the group's particles will take into account their distance from the camera when calculating the particle's size.

-

`colorize`
*Boolean*
**true**

Whether colours should be applied to the particles.
If `true`, a particle's colour will be combined with the colour from the supplied `texture`. If `false`, only the colour from the `texture` will be used.

-

`blending`
*Number*
**THREE.AdditiveBlending**

The blending style to apply to the group's material. Can accept any of [THREE.js's blending values](http://threejs.org/docs/#Reference/Constants/Materials).

-

`transparent`
*Boolean*
**true**

Whether the group should be rendered with transparency or not. In most scenarios, this property should be left as `true`, as without it, no emitter opacity styles will be renderered. See [THREE.js's Material documentation](http://threejs.org/docs/#Reference/Materials/Material) for more information on this property.

-

`alphaTest`
*Number*
**0.5**

Sets the alpha value to be used when running an alpha test on the `texture` property.

-

`depthWrite`
*Boolean*
**false**

Whether rendering the group has any effect on the depth buffer.

-

`depthTest`
*Boolean*
**true**

Whether to have depth test enabled when rendering this group.

-

`fog`
*Boolean*
**true**

Whether this group's particles should be affected by it's parent scene's fog value.

-
