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
           files: {
                files: ['src/js/*.js']               
            }
        }
                       });
    grunt.registerTask('default', [ 'sass', 'watch']);
};


