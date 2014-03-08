(function() {

    var makeTreeBranch = function( branchName, menuItems ) {

    };



    function Menu() {
        this.tree = CONFIG.menu.tree;

        this.domElement = document.createElement( 'nav' );
        this.domElement.classList.add( 'menu' );

        this.itemsWrapper = document.createElement( 'div' );
        this.itemsWrapper.classList.add( 'items-wrapper' );
        this.domElement.appendChild( this.itemsWrapper );

        this.menuItems = [];
        this.childrenItems = [];
        this.menuIsActive = false;
        this.activeMenuItem = null;


        // Bind scope
        for( var i in this ) {
            if( typeof this[ i ] === 'function' ) {
                this[ i ] = this[ i ].bind( this );
            }
        }


        document.addEventListener( 'mouseup', this._onDocumentClick, true );

        this._makeElements();
    }

    Menu.prototype = {
        _activateMenuItem: function( menuItem ) {
            for( var i = 0; i < this.menuItems.length; ++i ) {
                if( typeof menuItem !== 'undefined' && this.menuItems[ i ] === menuItem ) {
                    this.childrenItems[ i ].style.marginLeft = this.menuItems[ i ].offsetLeft + 'px';
                    this.childrenItems[ i ].style.display = 'block';
                    this.menuItems[ i ].classList.add( 'active' );
                }
                else {
                    this.childrenItems[ i ].style.display = 'none';  
                    this.menuItems[ i ].classList.remove( 'active' );
                }
            }

            if( menuItem ) {
                this.menuIsActive = true;
            }
        },

        _onMenuItemClick: function( e ) {
            this._activateMenuItem( e.srcElement.parentNode );
        },

        _onMenuItemHover: function( e ) {
            if( !this.menuIsActive ) return;

            this._activateMenuItem( e.srcElement.parentNode );
        },

        _onDocumentClick: function( e ) {
            if( !this.menuIsActive ) return;

            this.menuIsActive = false;
            this._activateMenuItem();
        },

        _makeTreeBranch: function( branchName, menuItems ) {
            var parentMenuItem = document.createElement( 'div' ),
                parentMenuLabel = document.createElement( 'span' ),
                childWrapper = document.createElement( 'ul' ),
                child, icon, childLabel;

            parentMenuItem.classList.add( 'item' );
            parentMenuLabel.classList.add( 'item-label' );
            parentMenuLabel.textContent = branchName;

            // Create an individual menu item, many times.
            for( var i in menuItems ) {
                child = document.createElement( 'li' );
                icon = new Image();
                childLabel = document.createElement( 'span' );

                child.classList.add( menuItems[ i ].eventName );

                if( menuItems[ i ].toggleable && CONFIG[ menuItems[ i ].eventName ] ) {
                    child.classList.add( 'on' );
                }

                icon.src = 'res/img/icons/menu/' + menuItems[ i ].image;
                childLabel.textContent = i;

                child.addEventListener( 'mouseup', (function( item, el ) {
                    return function( e ) {
                        if( item.toggleable ) {
                            el.classList.toggle( 'on' );
                        }

                        item.action();
                    };
                }( menuItems[ i ], child )), false );

                child.appendChild( icon );
                child.appendChild( childLabel );
                childWrapper.appendChild( child );
            }

            // Add mouseup listener to the parent.
            parentMenuItem.addEventListener( 'mouseup', this._onMenuItemClick, false );
            parentMenuLabel.addEventListener( 'mousemove', this._onMenuItemHover, false );

            // Store the items and children for reference when clicking.
            this.menuItems.push( parentMenuItem );
            this.childrenItems.push( childWrapper );

            // Append elements to their parents.
            parentMenuItem.appendChild( parentMenuLabel );
            this.domElement.appendChild( parentMenuItem );
            this.itemsWrapper.appendChild( childWrapper );
        },

        _makeElements: function() {
            var i,
                logo = document.createElement( 'div' );

            logo.classList.add( 'logo' );
            this.domElement.appendChild( logo );

            for( i in this.tree ) {
                this._makeTreeBranch( i, this.tree[ i ] );
            }
        }
    };


    window.Menu = Menu;

}());