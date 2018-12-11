module.exports = function(grunt) {
    grunt.initConfig({
        clean: ['.tmp','public/web/css/mp-g-bl.*.css','public/web/js/mp-g-bl.*.js'],
        useminPrepare: {
            html: 'public/web/biz_login.html',
            options: {
                dest: 'public/web/'
            }
        },
        filerev: {
            options: {
                algorithm: 'md5',
                length: 8
            },
            js: {
                src: 'public/web/js/mp-g-bl.*.js'
            },
            css:{
                src: 'public/web/css/mp-g-bl.*.css'
            }
        },
        usemin:{
            html: 'public/web/biz_login.html'
        },
        copy: {
            main: {
                files: [
                    {src: 'public/web/biz_login.html', dest: 'public/web/biz_login.test.html'}
                ]
            }
        },

        cssmin:{
            options:{aggressiveMerging:'false'}
        },
//
//        css_url_replace: {
//            task:{
//                options: {
//                    staticRoot: 'public/web/business/css'
//                },
//                files: {
//                    '.tmp/css/mp-g-bl.bs-ace-mp.css': '.tmp/css/mp-g-bl.bs-ace-mp.css'
//                }
//            }
//        }
    });

    grunt.loadNpmTasks('grunt-contrib-copy');
    grunt.loadNpmTasks('grunt-contrib-uglify');
    grunt.loadNpmTasks('grunt-contrib-concat');
    grunt.loadNpmTasks('grunt-contrib-cssmin');
    grunt.loadNpmTasks('grunt-filerev');
    grunt.loadNpmTasks('grunt-usemin');
    grunt.loadNpmTasks('grunt-contrib-clean');
//    grunt.loadNpmTasks('grunt-css-url-replace');

    // simple build task
    grunt.registerTask('default', [
        'clean',
//        'copy:main',
        'useminPrepare',
        'concat:generated',
//        'css_url_replace',
        'cssmin:generated',
        'uglify:generated',
        'filerev',
        'usemin'
    ]);
};
