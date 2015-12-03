// Generated on 2014-10-27 using generator-angular 0.9.8
'use strict';

// # Globbing
// for performance reasons we're only matching one level down:
// 'test/spec/{,*/}*.js'
// use this if you want to recursively match all subfolders:
// 'test/spec/**/*.js'

module.exports = function(grunt) {

        // Load grunt tasks automatically
        require('load-grunt-tasks')(grunt);

        // Time how long tasks take. Can help when optimizing build times
        require('time-grunt')(grunt);

        grunt.loadNpmTasks('grunt-ngdoc');
        grunt.loadNpmTasks('grunt-angular-templates');
        grunt.loadNpmTasks('grunt-contrib-concat');

        var modRewrite = require('connect-modrewrite');

        // Configurable paths for the application
        var appConfig = {
            app: require('./bower.json').appPath || 'app',
            dist: 'dist'
        };

        grunt.template.addDelimiters('handlebars-like-delimiters', '{{', '}}');

        // Define the configuration for all the tasks
        grunt.initConfig({

                // Project settings
                yeoman: appConfig,

                // Watches files for changes and runs tasks based on the changed files
                watch: {
                    bower: {
                        files: ['bower.json'],
                        tasks: ['wiredep']
                    },
                    jsTest: {
                        files: ['test/spec/{,*/}*.js'],
                        tasks: ['newer:jshint:test']
                    },
                    compass: {
                        files: ['<%= yeoman.app %>/styles/{,*/}*.{scss,sass}'],
                        tasks: ['compass:server', 'autoprefixer']
                    },
                    gruntfile: {
                        files: ['Gruntfile.js']
                    },
                    livereload: {
                        options: {
                            livereload: '<%= connect.options.livereload %>'
                        },
                        files: [
                            '.tmp/styles/{,*/}*.css',
                            '<%= yeoman.app %>/images/{,*/}*.{png,jpg,jpeg,gif,webp,svg}'
                        ]
                    },
                    ngdocs: {
                        files: ['app/scripts/{,*/}*.js'],
                        tasks: ['ngdocs']
                    },
                },

                template: {

                    'process-html-template': {

                        options: {
                            data: function() {
                                    
                                var data = {};

                                data.date = grunt.template.today('dddd, mmmm dS, yyyy, h:MM:ss TT Z');
                                data.seconds = (new Date).getTime();

                                return data;                       
                            },
                            delimiters: 'handlebars-like-delimiters'
                        },
                        files: {
                            'dist/build.html': ['app/build.html']
                        }
                    }
                },
                
                ngtemplates: {
                    lister: {
                        cwd:    'app',
                        src:    'views/directives/lister.html',
                        dest:   '.tmp/template.js'
                    }
                },

                concat: {
                    options: {
                     
                    },
                    build: {
                      src: ['app/scripts/directives/lister.js','.tmp/template.js'],
                      dest: '../lister.js',
                    },
                },

                // The actual grunt server settings
                connect: {
                    options: {
                        livereload: 35730
                    },
                    local: {
                        options: {
                            port: 9090,
                            hostname: 'localhost',
                            open: true,
                            base: [
                                '.tmp',
                                '<%= yeoman.app %>'
                            ],
                            middleware: function(connect, options) {

                                return [modRewrite(['^[^\\.]*$ /index.html [L]']),
                                    connect.static('.tmp'),
                                    connect.static(appConfig.app),
                                    connect().use('/bower_components', connect.static('./bower_components'))
                                ];

                            }
                        }
                    },
                    docs: {
                        options: {
                            port: 9001,
                            hostname: 'localhost',
                            base: 'docs/',
                            open: true
                        }
                    }
                },


                // Empties folders to start fresh
                clean: {
                    dist: {
                        files: [{
                            dot: true,
                            src: [
                                '.tmp',
                                '<%= yeoman.dist %>/{,*/}*',
                                '!<%= yeoman.dist %>/.git*'
                            ]
                        }]
                    },
                    server: '.tmp',
                    cleanup: '<%= yeoman.dist %>/config'
                },

                // Add vendor prefixed styles
                autoprefixer: {
                    options: {
                        browsers: ['last 1 version']
                    },
                    dist: {
                        files: [{
                            expand: true,
                            cwd: '.tmp/styles/',
                            src: '{,*/}*.css',
                            dest: '.tmp/styles/'
                        }]
                    }
                },

                // Automatically inject Bower components into the app
                wiredep: {
                    app: {
                        src: ['<%= yeoman.app %>/index.html'],
                        ignorePath: /\.\.\//
                    },
                    sass: {
                        src: ['<%= yeoman.app %>/styles/{,*/}*.{scss,sass}'],
                        ignorePath: /(\.\.\/){1,2}bower_components\//
                    }
                },

                // Compiles Sass to CSS and generates necessary files if requested
                compass: {
                    options: {
                        sassDir: '<%= yeoman.app %>/styles',
                        cssDir: '.tmp/styles',
                        generatedImagesDir: '.tmp/images/generated',
                        imagesDir: '<%= yeoman.app %>/images',
                        javascriptsDir: '<%= yeoman.app %>/scripts',
                        fontsDir: '<%= yeoman.app %>/fonts',
                        importPath: './bower_components',
                        httpImagesPath: '/images',
                        httpGeneratedImagesPath: '/images/generated',
                        httpFontsPath: '/fonts',
                        relativeAssets: false,
                        assetCacheBuster: false,
                        raw: 'Sass::Script::Number.precision = 10\n'
                    },
                    dist: {
                        options: {
                            generatedImagesDir: '<%= yeoman.dist %>/images/generated'
                        }
                    },
                    server: {
                        options: {
                            debugInfo: true
                        }
                    }
                },

                // Renames files for browser caching purposes
                filerev: {
                    dist: {
                        src: [
                            '<%= yeoman.dist %>/scripts/{,*/}*.js',
                            '<%= yeoman.dist %>/styles/{,*/}*.css'
                        ]
                    }
                },

                // Reads HTML for usemin blocks to enable smart builds that automatically
                // concat, minify and revision files. Creates configurations in memory so
                // additional tasks can operate on them
                useminPrepare: {
                    html: '<%= yeoman.app %>/index.html',
                    options: {
                        dest: '<%= yeoman.dist %>',
                        flow: {
                            html: {
                                steps: {
                                    js: ['concat', 'uglifyjs'],
                                    css: ['cssmin']
                                },
                                post: {}
                            }
                        }
                    }
                },

                useminPrepareDev: {
                    html: '<%= yeoman.app %>/index.html',
                    options: {
                        dest: '<%= yeoman.dist %>',
                        flow: {
                            steps: {
                                'js': ['concat'],
                                'css': ['concat']
                            },
                            post: {}
                        }
                    }
                },

                // Performs rewrites based on filerev and the useminPrepare configuration
                usemin: {
                    html: ['<%= yeoman.dist %>/{,*/}*.html'],
                    css: ['<%= yeoman.dist %>/styles/{,*/}*.css'],
                    options: {
                        assetsDirs: ['<%= yeoman.dist %>', '<%= yeoman.dist %>/images']
                    }
                },

                ngconstant: {
                    options: {
                        space: '  ',
                        wrap: '\'use strict\';\n\n {%= __ngModule %}',
                        name: 'config',
                        dest: '<%= yeoman.dist %>/config/config.js'
                    },
                    local: {
                        constants: {
                            CONFIG: grunt.file.readJSON('config/local.json')
                        },
                        options: {
                            dest: '<%= yeoman.app %>/config/config.js'
                        }
                    },
                    development: {
                        constants: {
                            CONFIG: grunt.file.readJSON('config/development.json')
                        }
                    },
                    production: {
                        constants: {
                            CONFIG: grunt.file.readJSON('config/production.json')
                        }
                    },
                    staging: {
                        constants: {
                            CONFIG: grunt.file.readJSON('config/staging.json')
                        }
                    }
                },
                imagemin: {
                    dist: {
                        files: [{
                            expand: true,
                            cwd: '<%= yeoman.app %>/images',
                            src: '{,*/}*.{png,jpg,jpeg,gif}',
                            dest: '<%= yeoman.dist %>/images'
                        }]
                    }
                },

                svgmin: {
                    dist: {
                        files: [{
                            expand: true,
                            cwd: '<%= yeoman.app %>/images',
                            src: '{,*/}*.svg',
                            dest: '<%= yeoman.dist %>/images'
                        }]
                    }
                },

                htmlmin: {
                    dist: {
                        options: {
                            collapseWhitespace: true,
                            conservativeCollapse: true,
                            collapseBooleanAttributes: true,
                            removeCommentsFromCDATA: true,
                            removeOptionalTags: true
                        },
                        files: [{
                            expand: true,
                            cwd: '<%= yeoman.dist %>',
                            src: ['*.html', 'views/**/*.html'],
                            dest: '<%= yeoman.dist %>'
                        }]
                    }
                },

                // ng-annotate tries to make the code safe for minification automatically
                // by using the Angular long form for dependency injection.
                ngAnnotate: {
                    dist: {
                        files: [{
                            expand: true,
                            cwd: '.tmp/concat/scripts',
                            src: ['*.js', '!oldieshim.js'],
                            dest: '.tmp/concat/scripts'
                        }]
                    }
                },

                // Replace Google CDN references
                cdnify: {
                    dist: {
                        html: ['<%= yeoman.dist %>/*.html']
                    }
                },

                // Copies remaining files to places other tasks can use
                copy: {
                    build: {
                        files: [{
                                expand: true,
                                dot: true,
                                cwd: 'app/styles/directives',
                                src: ['_lister.scss'],
                                dest: '../'
                            }
                        ]
                    },
                    iconfont: {
                        files: [
                            {
                                expand: true,
                                dot: true,
                                cwd: 'bower_components/material-design-icons/iconfont',
                                src: ['*.*'],
                                dest: '<%= yeoman.app %>/iconfont'
                            }
                        ]
                    },
                    development: {
                        files: [{
                                expand: true,
                                dot: true,
                                cwd: '.',
                                dest: '<%= yeoman.dist %>',
                                rename: function(dest, src) {
                                    return dest + src.replace(/telerik\/development/, "");
                                },
                                src: [                                    
                                    'telerik/development/*',
                                    'telerik/development/App_Resources/**/*'
                                ]
                            },
                            {
                                expand: true,
                                cwd: 'telerik/development/',
                                dest: '<%= yeoman.dist %>',
                                src: ['Plugins/**/*']
                            }]
                    },
                    staging: {
                        files: [{
                                expand: true,
                                dot: true,
                                cwd: '.',
                                dest: '<%= yeoman.dist %>',
                                rename: function(dest, src) {
                                    return dest + src.replace(/telerik\/staging/, "");
                                },
                                src: [
                                    'telerik/staging/*',
                                    'telerik/staging/App_Resources/**/*'
                                ]
                        }]
                    },
                    production: {
                        files: [{
                                expand: true,
                                dot: true,
                                cwd: '.',
                                dest: '<%= yeoman.dist %>',
                                rename: function(dest, src) {
                                    return dest + src.replace(/telerik\/production/, "");
                                },
                                src: [
                                    'telerik/production/*',
                                    'telerik/production/App_Resources/**/*'
                                ]
                        }]
                    },                    
                    styles: {
                        expand: true,
                        cwd: '<%= yeoman.app %>/styles',
                        dest: '.tmp/styles/',
                        src: '{,*/}*.css'
                    }
                },

                // Run some tasks in parallel to speed up the build process
                concurrent: {
                    server: [
                        'compass:server'
                    ],
                    dist: [
                        'compass:dist',
                        'imagemin',
                        'svgmin'
                    ]
                },

                exec: {
                    livesynccloud: {
                        cwd: '<%= yeoman.dist %>',
                        command: 'appbuilder livesync cloud'
                    }
                },

                prompt: {
                    builder: {
                        options: {
                            questions: [{
                                config: 'builder',
                                message: 'Please select...',
                                name: 'option',
                                type: 'list',
                                choices: ['LiveSync Cloud']
                            }],
                            then: function(results) {
                                if(results.builder == 'LiveSync Cloud')
                                    grunt.task.run('exec:livesynccloud');
                            }
                        }
                    }
                },

                ngdocs: {
                  options: {
                    dest: 'docs',
                    html5Mode: false,
                    startPage: '/',
                    title: "Lister Documentation",
                    titleLink: "/",
                    bestMatch: true,
                  
                  },
                  all: ['<%= yeoman.app %>/scripts/{,*/}*.js']
                }          
            });
    
            grunt.registerTask('doc', '', function() {

                 return grunt.task.run(["ngdocs","connect:docs:keepalive","watch"]);
            });

            grunt.registerTask('serve', 'Compile then start a connect web server', function(target) {

                if (arguments.length === 0) {
                    grunt.log.error('Please specify a target to serve. Options: serve:local, serve:staging, serve:production');
                    return false;
                }

                if (grunt.option('jshint'))
                    grunt.config.merge({
                        watch: {
                            js: {
                                files: ['<%= yeoman.app %>/scripts/{,*/}*.js'],
                                tasks: ['newer:jshint:all']
                            }
                        }
                    });

                if (target === 'local') {
                    return grunt.task.run([
                        'clean:server',
                        'ngconstant:local',
                        'wiredep',
                        'concurrent:server',
                        'autoprefixer',
                        'copy:iconfont',
                        'connect:local',
                        'watch'
                    ]);

                } else {

                    var tasks = ['clean:dist',
                        'ngconstant:' + target,
                        'wiredep'
                    ];

                    //If --nomin is detected then do not minify the js and css
                    if (grunt.option('nomin') || target=='development') {
                        tasks = grunt.util._.union(tasks, ['useminPrepareDev',
                            'concurrent:dist',
                            'autoprefixer',
                            'concat',
                            'ngAnnotate',
                            'copy:dist',
                            //'cdnify',
                            'filerev',
                            'usemin',
                            'connect:dist:keepalive'
                        ]);
                    } else {
                        tasks = grunt.util._.union(tasks, ['useminPrepare',
                            'concurrent:dist',
                            'autoprefixer',
                            'concat',
                            'ngAnnotate',
                            'copy:dist',
                            //'cdnify',
                            'filerev',
                            'uglify',
                            'cssmin',
                            'usemin',
                            'htmlmin',
                            'connect:dist:keepalive'
                        ]);
                    }

                    return grunt.task.run(tasks);
                }
            });

            grunt.registerTask('useminPrepareDev', function() {
                grunt.config.set('useminPrepare', grunt.config('useminPrepareDev'));
                grunt.task.run('useminPrepare');
            });

            grunt.registerTask('build', 'Compile', function(target) {
                return grunt.task.run([ 'copy:build',
                                        'ngtemplates:lister',
                                        'concat:build']);
            });
        };
