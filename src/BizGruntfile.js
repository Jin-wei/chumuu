module.exports = function(grunt) {
    grunt.initConfig({
        clean: ['.tmp','public/web/css/mp-g-biz.*.css','public/web/js/mp-g-biz.*.js'],
        useminPrepare: {
            html: 'public/web/business.html',
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
                src: 'public/web/js/mp-g-biz.*.js'
            },
            css:{
                src: 'public/web/css/mp-g-biz.*.css'
            }
        },
        usemin:{
            html: 'public/web/business.html'
        },
        copy: {
            main: {
                files: [
                    {src: 'public/web/business.html', dest: 'public/web/business.test.html'}
                ]
            }
        },

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

    // simple build task
    grunt.registerTask('default', [
        'clean',
//        'copy:main',
        'useminPrepare',
        'concat:generated',
        'cssmin:generated',
        'uglify:generated',
        'filerev',
        'usemin'
    ]);
};
