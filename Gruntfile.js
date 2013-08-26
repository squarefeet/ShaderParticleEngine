module.exports = function( grunt ) {
    var packageJSON = grunt.file.readJSON('package.json');

    var licenseBanner =     '/* ' + packageJSON.name + ' ' + packageJSON.version + '\n' +
                            ' * ' + '\n' +
                            ' * (c) 2013 Luke Moody (http://www.github.com/squarefeet) & Lee Stemkoski (http://www.adelphi.edu/~stemkoski/)' + '\n' +
                            ' *     Based on Lee Stemkoski\'s original work (https://github.com/stemkoski/stemkoski.github.com/blob/master/Three.js/js/ParticleEngine.js).' + '\n' +
                            ' *' + '\n' +
                            ' * ' + packageJSON.name + ' may be freely distributed under the MIT license (See LICENSE.txt at root of this repository.)' + '\n */\n';


    // Specify input files and output paths
    var files = [
            'src/ShaderParticleGroup.js',
            'src/ShaderParticleEmitter.js'
        ],
        outputPath = 'build/ShaderParticles.js',
        outputPathMin = outputPath.replace( '.js', '.min.js' );


    var uglifySettings = {
        min: {
            options: {
                mangle: true,
                compress: {
                    dead_code: true,
                },
                banner: licenseBanner
            },
            files: {}
        }
    };

    // Set the path for where the minified files should be saved
    uglifySettings.min.files[ outputPathMin ] = [ outputPath ];


    grunt.initConfig({
        uglify: uglifySettings,

        concat: {
            options: {
                separator: ';\n\n'
            },
            dist: {
                src: files,
                dest: outputPath,
            },
        }
    });

    grunt.loadNpmTasks( 'grunt-contrib-concat' );
    grunt.loadNpmTasks( 'grunt-contrib-uglify' );

    grunt.registerTask( 'default', ['concat', 'uglify'] );
};