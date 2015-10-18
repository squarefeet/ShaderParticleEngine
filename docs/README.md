Shader Particle Engine
======================

Contents
--------
* [Overview](#overview)
* [Changelog](#changelog)
* [API Documentation](#api-documentation)
* [Annotated Source](#annotated-source)


Overview
--------
The purpose of this library is to make creating particle effects using THREE.js and WebGL as simple as possible. The heavy-lifting is done by the GPU, freeing up CPU cycles.

Emitters are created by first creating an instance of `SPE.Group`. It is in the group where `ShaderMaterial` settings are applied, and the texture for all emitters added to that group is set. Multiple groups can be created, but if efficiency is a high-priority then as few groups as possible should be created. The group takes care of uploading emitter data to the GPU for simulation and rendering, so the fewer chunks of data that get sent the better.

Once a group has been created, an instance of `SPE.Emitter` can then be added to it. Each emitter can have its own behaviour and appearance.


For more information on groups and emitters, see the docs below:

* [Group documentation](./SPE.Group.md)
* [Emitter documentation](./SPE.Emitter.md)


Changelog
---------
A full changelog can be seen [here](./APIChangelog.md).

API Documentation
--------------------
Full api documentation (created using the wonderful [JSDoc](http://usejsdoc.org/)) is available [here](./api/index.html).

Annotated Source
--------------------
An annotated version of the library (created using the equally wonderful [Docco](https://jashkenas.github.io/docco/)) can be found [here](./source/index.html).