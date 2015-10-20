SPE.Emitter
===========

Creating an Emitter
-------------------
A single particle emitter is created as shown below. It's only argument is a map of [options](#configuring-an-emitter):

```javascript
var emitter = new SPE.Emitter( {
	optionName: optionValue
} );
```


Adding an Emitter to a Group
----------------------------
Many emitters can be added to a single group. These emitters will be rendered using the same attribute buffers and will save valuable time in your render loop by keeping CPU -> GPU data transfer to a minimum.

To add an emitter to a group, do the following:

```javascript
group.addEmitter( emitter );
```

If you have multiple emitters to add at the same time, the method can be 'chained' as follows:

```javascript
group.addEmitter( emitter1 ).addEmitter( emitter2 ); // etc.
```


Removing an Emitter from a Group
--------------------------------
Emitters can also be removed from a group, but bear in mind that in doing so, the emitter will be instantly removed from the scene. Any particles that were onscreen at the time of removal will disappear.

If you need to just turn off an emitter, use the emitter's `disable()` function instead.

To remove an emitter from a group:

```javascript
// Either:
group.removeEmitter( emitter);

// Or:
emitter.remove();
```




Configuring an Emitter
----------------------
An emitter's properties can be split into three groups:


* Basic properties
* Properties that can change over a particle's lifetime.
* General configuration.

Basic properties constists of `position`, `velocity`, `acceleration`, `radius` (only used when `SPE.distributions.DISC` or `SPE.distributions.SPHERE` is used), `drag`, `wiggle`, `rotation`, and `maxAge`. These properties do _not_ change over the course of a particle's lifetime, but most of them _can_ be re-randomised when a particle is spawned to avoid consistent behaviours.

Properties that can change over a particle's lifetime are referred to as _value-over-lifetime_ properties. These are: `color`, `size`, `opacity`, and `angle` (read: _texture rotation_). These properties can either be given an array of values that a particle will move through over its lifetime, or just a single value if a lifetime-relative value isn't required.

Most of the above properties can be randomised through use of a `spread` property.

The general configuration properties consist of `duration`, `isStatic`, `particleCount`, and `activeMultiplier`.

For more information on an emitter's properties and available values and types, see the [API documentation](https://squarefeet.github.io/ShaderParticleEngine/docs/api/global.html#EmitterOptions)