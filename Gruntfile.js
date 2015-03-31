module.exports = function(grunt) { 
    
    grunt.loadNpmTasks('grunt-contrib-sass');  
    grunt.loadNpmTasks('grunt-contrib-watch');
    

    grunt.initConfig({
       sass: {
            dist: {
                options: {
                    style: 'compressed',
                    sourcemap: 'none'
                },
                files: {
                    'styles/main.css': 'styles/main.scss'
                }
            }
        },
        watch: {
            options: {
                livereload: true
            },
            sass: {
                files: ['src/styles/*.scss'],
                tasks: ['sass']
            },
            js: {
                files: ['js/*.js']               
            }
        }
                       });
    grunt.registerTask('default', [ 'sass', 'watch']);
};


