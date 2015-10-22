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
See the [API documentation](https://squarefeet.github.io/ShaderParticleEngine/docs/api/global.html#GroupOptions)
