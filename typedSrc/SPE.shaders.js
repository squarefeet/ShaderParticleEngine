SPE.shaders = {
    vertex: [


    // void getFloatOverLifetime( inout float value, in float age, in float maxAge, in int valueOverLifetimeLength, in float valueOverLifetime ) {
    //     float deltaAge = ( age / maxAge ) * float( valueOverLifetimeLength - 1 );

    //     // Assuming a max valueOverLifetimeLength of 100 here.
    //     // Can't see it being broken, as uniform size limits are pretty tight.
    //     //
    //     // At the moment, I'm only ever passing arrays of length 3, so no worries.
    //     for ( int i = 0; i < 100; ++i ) {
    //         if ( i == valueOverLifetimeLength ) {
    //             break;
    //         }

    //         if ( deltaAge >= float( i ) && deltaAge <= float( i + 1 ) ) {
    //             value = mix( valueOverLifetime[ i ], valueOverLifetime[ i + 1 ], deltaAge - float( i ) );
    //             break;
    //         }
    //     }
    // }
    ].join( '\n' ),
    fragment: [].join( '\n' )
};