module.exports = function(grunt) {
    grunt.initConfig({
        clean: ['.tmp','public/web/css/mp-g-admin.*.css','public/web/js/mp-g-admin.*.js'],
        useminPrepare: {
            html: 'public/web/biz_admin.html',
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
                src: 'public/web/js/mp-g-admin.*.js'
            },
            css:{
                src: 'public/web/css/mp-g-admin.*.css'
            }
        },
        usemin:{
            html: 'public/web/biz_admin.html'
        },
        copy: {
            main: {
                files: [
                    {src: 'public/web/biz_admin.html', dest: 'public/web/biz_admin.test.html'}
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
