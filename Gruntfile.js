module.exports = function(grunt) { 
    
    grunt.loadNpmTasks('grunt-contrib-sass');  
    grunt.loadNpmTasks('grunt-contrib-watch');
     grunt.loadNpmTasks('grunt-contrib-connect');
    

    grunt.initConfig({
       sass: {
            dist: {
                options: {
                    style: 'compressed',
                    sourcemap: 'none'
                },
                files: {
                    'src/styles/main.css': 'src/scss/main.scss'
                }
            }
        },
        watch: {
            options: {
                livereload: true
            },
            sass: {
                files: ['src/scss/*.scss'],
                tasks: ['sass']
            },
           
        },
        connect: {
            server: {
                options: {
                    port: 8000,
                    keepalive: true,
                    hostname: 'localhost',
                    base: './'
                }
            }
        }
                       });
    grunt.registerTask('default', [ 'sass', 'watch']);
};


