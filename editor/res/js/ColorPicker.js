/**
 * Adapted from: http://stackoverflow.com/a/14779540/1056594
 */
function ColorPicker( options ) {
    options = options || {};

    this.width = options.width || 320;
    this.height = options.height || 320;
    this.startAngle = options.startAngle || Math.PI;
    this.endAngle = options.endAngle || (this.startAngle + Math.PI * 2);
    this.saturation = options.saturation || 100;
    this.lightness = options.lightness || 50;
    this.padding = options.padding || 1;
    this.callback = options.callback || null;
    this.title = options.title || '';

    this.size = Math.min( this.width, this.height ) * 0.5 - (this.padding);
    this.step = Math.PI / Math.max(this.size, 780);
    this.hsl = [ 0, this.saturation, this.lightness ];
    this.rgb = [ 0, 0, 0 ];

    this._active = 0;
    this._offset = { x: null, y: null };
    this._pos = { x: 0, y: 0 };
    this._pixels = null;

    this._makeCanvas();
    this._addEvents();
    this._draw();
}


ColorPicker.prototype = {
    _makeCanvas: function() {
        this.domElement = document.createElement( 'div' );
        this.domElement.style.position = 'relative';
        this.domElement.style.width = this.width + 'px';
        this.domElement.style.height = this.height + 'px';


        this.titleEl = document.createElement( 'div' );
        this.titleEl.classList.add( 'slider-title' );
        this.titleEl.style.lineHeight = this.height + 'px';
        this.titleEl.textContent = this.title;

        this.canvas = document.createElement( 'canvas' );
        this.canvas.style.position = 'absolute';
        this.ctx = this.canvas.getContext( '2d' );
        this.canvas.width = this.width;
        this.canvas.height = this.height;

        this.posCanvas = document.createElement( 'canvas' );
        this.posCanvas.style.position = 'absolute';
        this.posCanvas.style.zIndex = '2';
        this.posCtx = this.posCanvas.getContext( '2d' );
        this.posCanvas.width = this.width;
        this.posCanvas.height = this.height;

        this.domElement.appendChild( this.titleEl );
        this.domElement.appendChild( this.canvas );
        this.domElement.appendChild( this.posCanvas );
    },

    _draw: function() {
        var ctx = this.ctx,
            start = this.startAngle,
            end = this.endAngle,
            step = this.step,
            size = this.size,
            hsl = this.hsl,
            angle = 0;

        ctx.clearRect( 0, 0, this.width, this.height );

        ctx.save();
        ctx.translate( this.width * 0.5, this.height * 0.5 );

        for (angle = start; angle <= end; angle += step) {
            ctx.save();
            ctx.rotate( -angle );
            grad = ctx.createLinearGradient( 0, 0, 0, size );
            grad.addColorStop( 0.1, 'black' );

            hsl[0] = Math.round( 360 - ( angle - start ) / ( end - start ) * 360 );

            grad.addColorStop( 0.55, 'hsl(' + hsl[0] + ', ' + hsl[1] + '%, ' + hsl[2] + '%)' );
            grad.addColorStop( 0.9, 'white' );
            ctx.fillStyle = grad;

            ctx.fillRect( this.width * 0.1, 0, 1, size * 0.9);
            ctx.restore();
        }

        ctx.restore();
    },

    _drawPos: function() {
        var ctx = this.posCtx;

        this._pixels = this.ctx.getImageData( this._pos.x, this._pos.y, 1, 1 ).data;
        this._setRGB();

        ctx.clearRect( 0, 0, this.width, this.height );

        var max = 255 - Math.max.apply( null, this.rgb );

        ctx.fillStyle = 'rgb(' + max + ', ' + max + ', ' + max + ')';
        ctx.beginPath();
        ctx.arc( this.width * 0.5, this.height * 0.5, this.size * 0.18, 0, Math.PI * 2, false );
        ctx.closePath();
        ctx.fill();


        ctx.fillStyle = 'rgb(' + this.rgb.join(',') + ')';
        ctx.beginPath();
        ctx.arc( this.width * 0.5, this.height * 0.5, this.size * 0.15, 0, Math.PI * 2, false );
        ctx.closePath();
        ctx.fill();

        ctx.beginPath();
        ctx.arc( this._pos.x, this._pos.y, 3, 0, Math.PI * 2, false );
        ctx.moveTo( this._pos.x, 0 );
        ctx.lineTo( this._pos.x, this.height );
        ctx.moveTo( 0, this._pos.y );
        ctx.lineTo( this.width, this._pos.y );
        ctx.closePath();
        ctx.stroke();


        if( typeof this.callback === 'function' ) {
            this.callback( this.rgb, this.title );
        }
    },

    _addEvents: function() {
        this.posCanvas.addEventListener( 'mousedown', this, false );
        document.body.addEventListener( 'mousemove', this, false );
        document.body.addEventListener( 'mouseup', this, false );
        this.posCanvas.addEventListener( 'mousewheel', this, false );
    },

    _calculateOffset: function() {
        this._offset.x = 0;
        this._offset.y = 0;

        var el = this.canvas;

        while( el !== document.body ) {
            this._offset.x += el.offsetLeft;
            this._offset.y += el.offsetTop;
            el = el.parentNode;
        }
    },

    _setRGB: function( data ) {
        data = data || this._pixels;

        for( var i = 0; i < 3; ++i ) {
            this.rgb[ i ] = data[ i ];
        }
    },

    handleEvent: function( e ) {
        switch( e.type ) {
            case 'mousedown':
                this._onMousedown( e );
                break;

            case 'mousemove':
                this._onMousemove( e );
                break;

            case 'mouseup':
                this._onMouseup( e );
                break;

            case 'mousewheel':
                this._onMousewheel( e );
                break;
        }
    },

    _onMousedown: function( e ) {
        e.preventDefault();
        e.stopPropagation();

        this._active = 1;

        if( this._offset.x === null ) {
            this._calculateOffset();
        }

        this._pos.x = e.offsetX | 0;
        this._pos.y = e.offsetY | 0;
        this._drawPos();
    },

    _onMousemove: function( e ) {
        if( !this._active ) return;

        this._pos.x = e.offsetX | 0;
        this._pos.y = e.offsetY | 0;
        this._drawPos();
    },

    _onMouseup: function( e ) {
        if( !this._active ) return;
        this._active = 0;
    },

    _onMousewheel: function( e ) {
        e.preventDefault();
        e.stopPropagation();
        this.setSaturation( this.saturation - ( e.deltaY * 0.01 ) );
    },

    setSaturation: function( value ) {
        value = Math.max( 0, Math.min( 100, value ) );
        this.saturation = value;
        this.hsl[ 1 ] = value;
        this._draw();
        this._drawPos();
    },

    setLightness: function( value ) {
        value = Math.max( 0, Math.min( 100, value ) );
        this.lightness = value;
        this.hsl[ 2 ] = value;
        this._draw();
        this._drawPos();
    }
};