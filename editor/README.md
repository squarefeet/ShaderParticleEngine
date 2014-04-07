## SPE Editor ##

#### About ####
This has been something I've wanted to get done for a _long_ time now, and it's almost complete (there's a list of what does and doesn't work / hasn't been implemented yet below). I wanted to make this because I got quite bored of playing with values and refreshing my browser to see how the result looked. I wanted a real-time editor. So here it is.

It's taken quite a while to put together, because I used it as a bit of a learning task as well - hence why I haven't used jQuery for the UI or anything like that. Apart from iScroll, and the SPE dependencies, it's all written from scratch. The code is a little messy in parts, but it will get tidied up in time.


#### Documentation ####
This is on its way... I hope the UI is intuitive enough in the meantime.


#### What Currently Works ####
* Multiple emitters
* All SPE.Group and SPE.Emitter settings.
* Undo / Redo on all Emitter settings.
* File -> New
* File -> Export
* Edit -> All menu items
* View -> All menu items
* Tools -> Center Emitter
* Tools -> Frame Emitter


#### What Currently Doesn't Work ####
* Undo / Redo on Group settings
* Removing an emitter after adding it.



#### Feature Still To Implement ####
* File -> Open (open a saved session from local storage)
* File -> Save (save current session to local storage)
* File -> Save As... (as above, but with a new name)
* File -> Import (import a previously exported SPE document)
* Edit -> Options
* Increasing/decreasing size of emitters (scaling up and down all necessary attributes).
* Rounding to nearest 2 decimal places when doing export.


#### Known bugs ####
* Browser support:
    * Works great in Chrome and Safari
    * Firefox has issues with the scrolling speed of the Settings Panel. Need to look into iScroll for that...