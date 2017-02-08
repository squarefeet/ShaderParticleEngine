Shader Particle Engine v1.0.6 ![](https://travis-ci.org/squarefeet/ShaderParticleEngine.svg?branch=master)
=============================


Overview
--------
The purpose of this library is to make creating particle effects using THREE.js and WebGL as simple as possible. The heavy-lifting is done by the GPU, freeing up CPU cycles.

Emitters are created by first creating an instance of `SPE.Group`. It is in the group where `ShaderMaterial` settings are applied, and the texture for all emitters added to that group is set. Multiple groups can be created, but if efficiency is a high-priority then as few groups as possible should be created. The group takes care of uploading emitter data to the GPU for simulation and rendering, so the fewer chunks of data that get sent the better.

Once a group has been created, an instance of `SPE.Emitter` can then be added to it. Each emitter can have its own behaviour and appearance.


For more information on groups and emitters, see the docs below:

* [Group documentation](./docs/SPE.Group.md)
* [Emitter documentation](./docs/SPE.Emitter.md)


Examples can be found [here](https://squarefeet.github.io/ShaderParticleEngine/)



Dependencies
------------
* THREE.js r72+ (preferably r81+).



Changelog
---------
A full changelog can be seen [here](./docs/ChangeLog.md).

A migration log can be found [here](./docs/MigrationLog.md).



Documentation
-------------
A massive improvement over the previous versions of this library is _actual documentation!_ I'll be working on making some tutorials, and adding presets and more examples in the very near future.

* Full api documentation (created using the wonderful [JSDoc](http://usejsdoc.org/)) is available [here](https://squarefeet.github.io/ShaderParticleEngine/docs/api/).

* An annotated version of the library (created using the equally wonderful [Docco](https://jashkenas.github.io/docco/)) can be found [here](https://squarefeet.github.io/ShaderParticleEngine/docs/source/SPE.html).




Building
--------
This project uses [Grunt](http://gruntjs.com/) to create the distributions, one dev build (not minimized) and one production build (minimized). If you make changes and want to build it, follow these steps:

If you don't have grunt installed, first make sure you've got [NodeJS](http://nodejs.org/) and NPM installed, then install Grunt CLI. You might have to do this as root:

```npm install -g grunt-cli```

Now you can install the local grunt package:

```cd [projectFolder] && npm install && grunt```

The output of grunt will sit in the `build` folder.


Thanks
------
Huge thanks to [Stemkoski](http://stemkoski.github.io/Three.js/) for the initial inspiration for this library. A lot has changed since the project first began, but it wouldn't have existed without his initial work and help. Big thanks to everyone involved in [THREE.js](https://github.com/mrdoob/three.js), too.

Thanks to @giuliandrimba for the [bower.json PR](https://github.com/squarefeet/ShaderParticleEngine/pull/76).
