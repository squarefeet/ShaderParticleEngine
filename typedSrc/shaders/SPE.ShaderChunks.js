SPE.shaderChunks = {
    getFloatOverLifetime: ( function() {
        var src = [
            'float get%name%OverLifetime() {',
            '	',
            '}'
        ];

        return function( name ) {
            var shader = src.replace( '%name%', name );

            return shader;
        };
    }() )
};