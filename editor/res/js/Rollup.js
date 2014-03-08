(function() {
	var groups = {};

	function Rollup( options ) {
		this.options = {
			title: '',
			content: null,
			duration: 500,
			easing: 'ease',
			group: 'standard',
			solo: false,
			callback: null
		};

		if( options ) {
			for( var i in options ) {
				if( options.hasOwnProperty( i ) ) {
					this.options[ i ] = options[ i ];
				}
			}
		}

		this.toggle = this.toggle.bind( this );

		this.domElement = null;
		this.state = false;
		this._makeElements();

		groups[ this.options.group ] = groups[ this.options.group ] || [];
		groups[ this.options.group ].push( this );
	}

	Rollup.prototype = {
		_makeElements: function() {
			var container = document.createElement( 'div' ),
				title = document.createElement( 'h4' ),
				content = this.options.content || document.createElement( 'div' ),
				transition = 'height ' + this.options.duration + 'ms ' + this.options.easing,
				clearFix = document.createElement( 'div' ),
				arrow = document.createElement( 'div' );

			container.className = 'roll-up';
			title.classList.add( 'title' );
			content.classList.add( 'content' );
			arrow.classList.add( 'arrow' );

			clearFix.classList.add( 'clear-fix' );

			title.innerHTML = this.options.title;

			title.addEventListener( 'click', this.toggle, false );

			container.style.webkitTransition = transition;
			container.style.MozTransition = transition;
			container.style.msTransition = transition;
			container.style.transition = transition;

			// content.appendChild( clearFix );
			container.appendChild( title );
			container.appendChild( arrow );
			container.appendChild( content );

			this.domElement = container;
			this.contentElement = content;
			this.titleElement = title;
		},

		_getOffsetHeight: function() {
			return this.titleElement.offsetHeight + this.contentElement.offsetHeight;
		},

		toggle: function() {
			if( !this.state ) {
				this.open();
			}
			else {
				this.close();
			}

			if( typeof this.options.callback === 'function' ) {
				var self = this;
				// setTimeout( function() {
					self.options.callback();
				// }, this.options.duration + 50 );
			}
		},

		open: function() {
			var group = groups[ this.options.group ],
				rollup;

			this.state = true;
			this.domElement.classList.add( 'open' );
			this.domElement.style.height = (this._getOffsetHeight() + 2) + 'px';

			if( this.options.solo ) {
				for( var i = 0; i < group.length; ++i ) {
					rollup = group[ i ];
					if( rollup !== this && rollup.options.solo && rollup.state ) {
						rollup.close();
					}
				}
			}
		},

		close: function() {
			this.state = false;
			this.domElement.classList.remove( 'open' );
			this.domElement.style.height = this.titleElement.offsetHeight + 'px';
		}
	};

	window.Rollup = Rollup;
}());