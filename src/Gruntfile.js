module.exports = function(grunt) {
    grunt.initConfig({
        clean: ['.tmp','public/web/css/mp-g.*.css','public/web/js/mp-g.*.js'],

        replace: {
            dist:
            {
                options: {
                    patterns: [
                        {
                            json: grunt.file.readJSON('conf.json')
                        }
                    ]
                },
                files: [
                    {src: ['public/web/customer.html'], dest: 'public/web/customer.html'}
                ]
            }
        },

        useminPrepare: {
            html: 'public/web/customer.html',
            options: {
                dest: 'public/web'
            }
        },
        filerev: {
            options: {
                algorithm: 'md5',
                length: 8
            },
            js: {
                src: 'public/web/js/mp-g.*.js'
            },
            css:{
                src: 'public/web/css/mp-g.*.css'
            }
        },
        usemin:{
            html: 'public/web/customer.html'
        },
        copy: {
            // includes files within path
            main: {
                files: [
                    {cwd: '.tmp/concat/',expand: true, src: '**', dest: 'public/web/', filter: 'isFile'}
                ]
            },
            cust: {
                files: [
                    {src: 'public/web/customer.html', dest: 'public/web/customer.test.html'},
                    {src: 'public/web/customer/login.html', dest: 'public/web/customer/login.test.html'},
                    {src: 'public/web/customer/active.html', dest: 'public/web/customer/active.test.html'}
                ]
            },
            css: {
                files: [
                    {cwd: '.tmp/concat/css/',expand:true, src: '*.css', dest: '.tmp/concat/css.min'}
                ]
            },
            js: {
                files: [
                    {cwd: '.tmp/concat/js/',expand:true, src: '*.js', dest: 'public/web/js'}
                ]
            }
        },
        /* concat:{
         options:{separator:';'}
         },*/

        cssmin:{
            options:{aggressiveMerging:'false'}
        }
    });

    grunt.loadNpmTasks('grunt-contrib-copy');
    grunt.loadNpmTasks('grunt-contrib-uglify');
    grunt.loadNpmTasks('grunt-contrib-concat');
    grunt.loadNpmTasks('grunt-contrib-cssmin');
    grunt.loadNpmTasks('grunt-filerev');
    grunt.loadNpmTasks('grunt-usemin');
    grunt.loadNpmTasks('grunt-contrib-clean');
    grunt.loadNpmTasks('grunt-replace');

    // simple build task
    grunt.registerTask('default', [
        'clean',
        'replace',
//        'copy:cust',
        'useminPrepare',
        'concat:generated',
        'cssmin:generated',
        'uglify:generated',
        'filerev',
        'usemin'
    ]);
};
