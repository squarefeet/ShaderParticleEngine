# TODO #

### Library ###

* Move SPE.Group#maxAge to SPE.Emitter#maxAge



### Editor ###

* Open file
* Save file
* Save As...

* Undo / Redo
    * Create History constructor to keep track of changes.
    * History#back
    * History#forwards.

* Compress group & emitter settings
	* LZMA didn't work out, esp. when adding in b64 image string.

* Decompress group & emitter settings

* Options menu: Round values to 2 decimal places on export / save

* Support multiple emitters
    * Set name on creating new emitter
        * Default: "Emitter #"
    * **DONE** Segregate group settings from emitter settings
    * Once segregated, have emitter selector below group settings
    * One axis helper per emitter

* **DONE** Fix iScroll bug when using select boxes

* **DONE** Set correct FPS z-index

* View menu: Show / hide axis helper(s)

* **DONE** Implement rest of the group settings events.

* Make sure axis helper moves with emitter position.

* Finish making menu icons.

* Add preferences with for things like export settings, etc.