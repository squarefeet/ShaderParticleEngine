var Slider = function( options ) {
    this.options = {
        parent: document.body,
        width: 150,
        height: 25,
        handleWidth: 20,
        handleHeight: 20,
        className: 'range-slider',
        orientation: 'horizontal',

        fromValue: -100,
        toValue: 100,
        startValue: 0,
        title: null,
        round: false
    };

    if( options ) {
        for( var i in options ) {
            this.options[ i ] = options[ i ];
        }
    }

    this.HAS_TOUCH = null;
    this.START_EVENT = null;
    this.MOVE_EVENT = null;
    this.END_EVENT = null;


    this.value = typeof this.options.startValue === 'number' ?
        this.options.startValue :
        Math.min(this.options.fromValue, this.options.toValue) + (Math.abs(this.options.toValue - this.options.fromValue) / 2);

    this.previousValue = this.value;

    this.internalValue = this._scaleValue(
        this.value,
        this.options.fromValue,
        this.options.toValue,
        0,
        this.options.orientation === 'horizontal' ? this.options.width : this.options.height
    );

    this.offsetX = null;
    this.offsetY = null;

    this.active = 0;
    this.x = 0;
    this.y = 0;
    this.startX = 0;
    this.startY = 0;

    this.callbacks = [];


    // Bind scope
    this._onTouchstart = this._onTouchstart.bind( this );
    this._onTouchmove = this._onTouchmove.bind( this );
    this._onTouchend = this._onTouchend.bind( this );

    this._determineInputTypes();
    this._make();
    this._scaleValue();
    this._positionHandle();

    this.enableInteraction();
};

Slider.prototype = {
    _determineInputTypes: function() {
        var hasTouch = this.HAS_TOUCH = 'ontouchstart' in window;
        this.START_EVENT = hasTouch ? 'touchstart' : 'mousedown';
        this.MOVE_EVENT = hasTouch ? 'touchmove' : 'mousemove';
        this.END_EVENT = hasTouch ? 'touchend' : 'mouseup';
    },

    _getPositionForAxis: function( e, axis ) {
        if( this.offsetX === null ) {
            this._calculateOffset();
        }

        axis = axis.toUpperCase();

        var offset = this['offset' + axis];

        return this.HAS_TOUCH ?
            e.touches[0][ 'page' + axis ] - offset:
            e[ 'page' + axis ] - offset;
    },

    _make: function() {
        var self = this;

        this.wrapper = document.createElement( 'div' );
        this.handle = document.createElement( 'div' );
        this.valueSlider = document.createElement( 'div' );
        this.readout = document.createElement( 'div' );
        this.title = document.createElement( 'div' );
        this.resetButton = document.createElement( 'div' );
        var clearfix = document.createElement( 'div' );

        this.wrapper.className = this.options.className;
        this.handle.className = 'slider-handle';
        this.valueSlider.className = 'slider-value';
        this.readout.className = 'slider-readout';
        this.title.className = 'slider-title';
        this.resetButton.className = 'reset-button';
        clearfix.className = 'clear-fix';

        if( this.options.title ) {
            this.title.textContent = this.options.title;
        }

        this.readout.addEventListener( 'dblclick', function() {
            self.disableInteraction();
            self.readout.setAttribute( 'contenteditable', true );
            self.readout.focus();
            document.execCommand( 'selectAll', false, null );
        }, false );

        this.readout.addEventListener( 'keydown', function( e ) {
            if( e.keyCode === 13 ) {
                self.readout.blur();
            }
        }, false );

        this.readout.addEventListener( 'blur', function( e ) {
            self.readout.removeAttribute( 'contenteditable' );
            self._setValue( +self.readout.textContent );
            self.enableInteraction();
        }, false );

        this.resetButton.addEventListener( 'click', function() {
            self._setValue( self.options.startValue );
        }, false );

        this.wrapper.style.width = this.options.width + 'px';
        this.wrapper.style.height = this.options.height + 'px';

        this.resetButton.style.width = this.options.height + 'px';
        this.resetButton.style.height = this.options.height + 'px';

        this.handle.style.width = this.options.handleWidth + 'px';
        this.handle.style.height = this.options.handleHeight + 'px';
        this.handle.style.marginLeft = (-this.options.handleWidth/2) + 'px';
        this.handle.style.marginTop = (-this.options.handleHeight/2) + 'px';

        this.valueSlider.style.height = this.options.height + 'px';

        this.readout.style.width = this.options.width + 'px';
        this.readout.style.height = this.readout.style.lineHeight = this.options.height + 'px';

        if( this.options.orientation === 'horizontal' ) {
            this.handle.style.top = '50%';
        }
        else {
            this.handle.style.left = '50%';
        }

        this._positionHandle();

        this.wrapper.appendChild( this.handle );
        this.wrapper.appendChild( this.valueSlider );
        this.wrapper.appendChild( this.readout );
        this.options.parent.appendChild( this.title );
        this.options.parent.appendChild( this.wrapper );
        this.options.parent.appendChild( this.resetButton );
        this.options.parent.appendChild( clearfix );
    },

    _calculateOffset: function() {
        this.offsetX = 0;
        this.offsetY = 0;

        var el = this.wrapper;

        while( el !== document.body ) {
            this.offsetX += el.offsetLeft;
            this.offsetY += el.offsetTop;
            el = el.parentNode;
        }
    },

    _positionHandle: function() {
        var isHorz = this.options.orientation === 'horizontal',
            x = isHorz ? this.internalValue : 0,
            y = isHorz ? 0 : this.internalValue;

        this.handle.style.webkitTransform = 'translate3d(' + x + 'px, ' + y + 'px, 0)';
        this.valueSlider.style.width = x + 'px';

        this.readout.textContent = this.options.round ? this.value : this.value.toFixed(2);
    },

    _clampInternalValue: function() {
        this.internalValue = Math.min(
            this.options.orientation === 'horizontal' ? this.options.width : this.options.height,
            Math.max( 0, this.internalValue )
        );
    },

    _callCallbacks: function() {
        if( this.previousValue === this.value ) {
            return;
        }

        for( var i = 0; i < this.callbacks.length; ++i ) {
            this.callbacks[i]( this.value, this.options.title );
        }
    },

    _determineValue: function( x, y ) {
        if( this.options.orientation === 'horizontal' ) {
            this.internalValue = !CONFIG.slidersSetValueOnMouseDown ? this.internalValue + x : x;
        }
        else {
            this.internalValue = !CONFIG.slidersSetValueOnMouseDown ? this.internalValue + y : y;
        }

        this._clampInternalValue();

        this.previousValue = this.value;

        this.value = this._scaleValue(
            this.internalValue,
            0,
            this.options.orientation === 'horizontal' ? this.options.width : this.options.height,
            this.options.fromValue,
            this.options.toValue
        );

        if( this.options.round ) {
            this.value = Math.round( this.value );
        }


        this._positionHandle();
        this._callCallbacks();
    },

    _setValue: function( value ) {
        this.previousValue = this.value;

        this.value = ( isNaN( value ) || typeof value !== 'number' ) ? this.value : value;

        if( this.options.round ) {
            this.value = Math.round( this.value );
        }

        if( this.value < this.options.fromValue ) {
            this.options.fromValue = this.value;
        }
        else if( this.value > this.options.toValue ) {
            this.options.toValue = this.value;
        }

        this.internalValue = this._scaleValue(
            this.value,
            this.options.fromValue,
            this.options.toValue,
            0,
            this.options.orientation === 'horizontal' ? this.options.width : this.options.height
        );

        this._positionHandle();
        this._callCallbacks();
    },

    _scaleValue: function( num, lowIn, highIn, lowOut, highOut ) {
        return ((num - lowIn) / (highIn - lowIn)) * (highOut - lowOut) + lowOut;
    },

    _onTouchstart: function( e ) {
        e.preventDefault();
        e.stopPropagation();

        this.active = 1;

        this.startX = this._getPositionForAxis( e, 'x' );
        this.startY = this._getPositionForAxis( e, 'y' );

        if( CONFIG.slidersSetValueOnMouseDown ) {
            this._determineValue( this.startX, this.startY);
        }
    },

    _onTouchmove: function( e ) {
        if( !this.active ) return;

        e.preventDefault();

        var x = this._getPositionForAxis( e, 'x' ),
            y = this._getPositionForAxis( e, 'y' );



        if( CONFIG.slidersSetValueOnMouseDown ) {
            this._determineValue( x, y );
        }
        else {
            this._determineValue( x - this.startX, y - this.startY );
            this.startX = x;
            this.startY = y;
        }
    },

    _onTouchend: function( e ) {
        if( !this.active ) return;
        this.active = 0;
    },

    enableInteraction: function() {
        this.wrapper.addEventListener( this.START_EVENT, this._onTouchstart, false );
        this.handle.addEventListener( this.START_EVENT, this._onTouchstart, false );
        document.addEventListener( this.MOVE_EVENT, this._onTouchmove, false );
        document.addEventListener( this.END_EVENT, this._onTouchend, false );
    },

    disableInteraction: function() {
        this.wrapper.removeEventListener( this.START_EVENT, this._onTouchstart, false );
        this.handle.removeEventListener( this.START_EVENT, this._onTouchstart, false );
        document.removeEventListener( this.MOVE_EVENT, this._onTouchmove, false );
        document.removeEventListener( this.END_EVENT, this._onTouchend, false );
    },

    registerCallback: function( fn ) {
        this.callbacks.push( fn );
    }
};