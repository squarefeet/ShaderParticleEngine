/* jshint undef: true, unused: true, strict: true */

var SPE = {
    distributions: {
        BOX: 1,
        SPHERE: 2,
        DISC: 3,
    },

    // Set this value to however many 'steps' you
    // want value-over-lifetime properties to have.
    //
    // It's adjustable to fix an interpolation problem:
    //
    // - Assuming you specify an opacity value as [0, 1, 0]
    // 	 and the valueOverLifetimeLength is 4, then the
    // 	 opacity value array will be reinterpolated to
    // 	 be [0, 0.66, 0.66, 0].
    //   This isn't ideal, as particles would never reach
    //   full opacity.
    //
    // NOTE:
    // 	- This property affects the length of ALL
    // 	  value-over-lifetime properties for ALL
    // 	  emitters and ALL groups.
    //
    // 	- Only values >= 3 && <= 4 are allowed.
    valueOverLifetimeLength: 4
};

// Module loader support:
if ( typeof define === 'function' && define.amd ) {
    define( 'spe', SPE );
}
else if ( typeof exports !== 'undefined' && typeof module !== 'undefined' ) {
    module.exports = SPE;
}