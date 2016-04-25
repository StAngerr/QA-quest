module.exports = function(grunt) { 
    
    grunt.loadNpmTasks('grunt-contrib-sass'); 
    grunt.loadNpmTasks('grunt-spritesmith'); 
    grunt.loadNpmTasks('grunt-contrib-watch');
    grunt.loadNpmTasks('grunt-contrib-connect');
    
        
    grunt.initConfig({
        appPath: {
            app: require('./bower.json').appPath || 'ui-app'
        },
       sass: {
            dist: {
                options: {
                    style: 'compressed',
                    sourcemap: 'none'
                },
                files: {
                    '<%= appPath.app %>/src/styles/main.css': '<%= appPath.app %>/src/scss/main.scss'
                }
            }
        },
        sprite:{
            bot: {
                src: '<%= appPath.app %>/src/images/bot/*.png',
                dest: '<%= appPath.app %>/src/images/botAnimationSprite.png',
                destCss: '<%= appPath.app %>/src/scss/sprite_bot_movement.scss'
            },
            buttons: {
                src: '<%= appPath.app %>/src/images/cabin_buttons/*.png',
                dest: '<%= appPath.app %>/src/images/itemsInsidecabin.png',
                destCss: '<%= appPath.app %>/src/scss/sprite_inside_cabin.scss'
            },
            pictures: {
                src: '<%= appPath.app %>/src/images/pop_up_figures/pictures_brown/*.png',
                dest: '<%= appPath.app %>/src/images/pop_up_figures_static.png',
                destCss: '<%= appPath.app %>/src/scss/sprite_pop_up_figures.scss'
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
                files: ['<%= appPath.app %>/src/js/*/*.js', '<%= appPath.app %>/src/js/lib/wade_src/*.*']
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
    grunt.registerTask('mkstyles', [ 'sprite','sass']);
    
    grunt.registerTask('runServ', ['connect:server', 'sprite','watch']);
};


