import babel from 'rollup-plugin-babel';

let pkg = require( './package.json' );

export default {
    entry: 'src/index.js',
    format: 'umd',
    moduleName: 'SPE',
    globals: {
        three: 'THREE'
    },
    plugins: [
        babel( {
            exclude: 'node_modules/**'
        } ),
    ],
    external: Object.keys( pkg.dependencies ),
    dest: 'build/SPE.js',
    sourceMap: false
}