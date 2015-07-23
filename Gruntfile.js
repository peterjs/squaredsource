'use strict';

module.exports = function(grunt) {

    // Project configuration.
//    grunt.initConfig({
//        nodeunit: {
//            files: ['test/**/*_test.js']
//        },
//        jshint: {
//            options: {
//                jshintrc: '.jshintrc'
//            },
//            gruntfile: {
//                src: 'Gruntfile.js'
//            },
//            lib: {
//                src: ['lib/**/*.js']
//            },
//            test: {
//                src: ['test/**/*.js']
//            },
//        },
//        watch: {
//            gruntfile: {
//                files: '<%= jshint.gruntfile.src %>',
//                tasks: ['jshint:gruntfile']
//            },
//            lib: {
//                files: '<%= jshint.lib.src %>',
//                tasks: ['jshint:lib', 'nodeunit']
//            },
//            test: {
//                files: '<%= jshint.test.src %>',
//                tasks: ['jshint:test', 'nodeunit']
//            },
//        },
//    });

    grunt.initConfig({
      nodewebkit: {
        options: {
            build_dir: './webkitbuilds', // Where the build version of my node-webkit app is saved
            mac: true, // We want to build it for mac
            win: true, // We want to build it for win
            linux32: false, // We don't need linux32
            linux64: true // We don't need linux64
        },
          // TODO only include the modules defined in package.json
          src: ['./*', './lib/*', './img/*', './node_modules/**/**/*']
      }
    });

    // These plugins provide necessary tasks.
    grunt.loadNpmTasks('grunt-contrib-nodeunit');
    grunt.loadNpmTasks('grunt-contrib-jshint');
    grunt.loadNpmTasks('grunt-contrib-watch');
    grunt.loadNpmTasks('grunt-node-webkit-builder');

    // Default task.
//    grunt.registerTask('default', ['jshint', 'nodeunit']);

    grunt.registerTask('default', 'nodewebkit');
};
