<<<<<<< HEAD
# TODO #

### Library ###

* Move SPE.Group#maxAge to SPE.Emitter#maxAge



### Editor ###

* Open file
* Save local
* Save

* Undo / Redo
    * **DONE** Create History constructor to keep track of changes.
    * **DONE** History#back
    * **DONE** History#forwards.

* Compress group & emitter settings
	* LZMA didn't work out, esp. when adding in b64 image string.

* Decompress group & emitter settings

* Options menu: Round values to 2 decimal places on export / save

* **DONE** Support multiple emitters
    * **DONE** Set name on creating new emitter
        * **DONE** Default: "Untitled-#"
    * **DONE** Segregate group settings from emitter settings
    * **DONE** Once segregated, have emitter selector below group settings

* **DONE** Fix iScroll bug when using select boxes

* **DONE** Set correct FPS z-index

* **DONE** View menu: Show / hide axis helper(s)

* **DONE** Implement rest of the group settings events.

* **DONE** Make sure axis helper moves with emitter position.

* Finish making menu icons.

* Add preferences with for things like export settings, etc.
=======
SPE Dev Todo List
=================

* General optimization.
* ~~Add Browserify support (see [here](https://github.com/squarefeet/ShaderParticleEngine/pull/62))~~.
* ~~Add Bower support (see [here](https://github.com/squarefeet/ShaderParticleEngine/pull/76)).~~
	* ~~Credit @giuliandrimba for bower.json.~~
* Add unit tests.
* Look into using FBO to store particle positions.
	* Will enable Curl Noise, Gravity Wells, etc.
* ~~Full documentation.~~
* Tutorials/guides.
* Triangle distribution option.
* Angle velocity (see [here](https://github.com/squarefeet/ShaderParticleEngine/pull/25)).
* Look into adding proper angleAlignVelocity support.
* [Publish to NPM](https://gist.github.com/coolaj86/1318304)

* Custom distribution type?
* Indexed points on sphere (num points, use particle index as counter)
* Use of texture maps (more than one texture per image)
	* Emitter can control offset, size.
	* How to work this in with spritesheet support?
>>>>>>> 098b7057d62125213c0abcda6c44cc0a368027ca
