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