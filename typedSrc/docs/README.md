Shader Particle Engine
======================

The purpose of this library is to make creating particle effects using THREE.js and WebGL as simple as possible. The heavy-lifting is done by the GPU, freeing up CPU cycles.

There are two main parts to the library, `SPE.Group` and `SPE.Emitter`.



SPE.Group
---------
A group is where emitters sharing the same texture and appearance attributes (`blending`, `depthTest`, etc.) should be added. Any number of groups can be created, but it's best to keep the number as low as possible to avoid sending more data than necessary to the GPU.

[Group documentation](./SPE.Group.md)

SPE.Emitter
-----------
An emitter is where you can customise the appearance and behaviour of your particles. Many options are available, including size, color, position, various forces, etc. Emitters with different parameters can be added to the same group.

[Emitter documentation](./SPE.Emitter.md)


