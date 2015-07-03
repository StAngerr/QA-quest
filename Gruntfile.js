module.exports = function(grunt) { 
    
    grunt.loadNpmTasks('grunt-contrib-sass'); 
    grunt.loadNpmTasks('grunt-spritesmith'); 
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
        sprite:{
            bot: {
                src: 'src/images/bot/*.png',
                dest: 'src/images/botAnimationSprite.png',
                destCss: 'src/scss/sprite_bot_movement.scss'
            },
            buttons: {
                src: 'src/images/cabin_buttons/*.png',
                dest: 'src/images/itemsInsidecabin.png',
                destCss: 'src/scss/sprite_inside_cabin.scss'
            }
        }, 
         watch: {
            css: {
                options:{
                    livereload: true
                },
                files: ['**/*.css','**/*.html']
            },
        sass: {
                files: ['**/*.scss'],
                tasks: ['sass']
            },
           files: {
                files: ['src/js/*/*.js', 'src/js/lib/wade_src/*.*']               
            }

        },
        connect: {
            server: {
              options: {
                port: 9009,
                base: './',
                 hostname: '0.0.0.0',
                livereload: true,
              }
            }
        }     
    });
    grunt.registerTask('default', [ 'sass', 'watch']);
    
    grunt.registerTask('runServ', ['connect:server', 'sprite','watch']);
};


