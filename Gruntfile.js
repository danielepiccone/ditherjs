module.exports = function(grunt) {

  // Project configuration.
  grunt.initConfig({
      pkg: grunt.file.readJSON('package.json'),
      concat: {
          options: {
              separator: ';',
          },
          dist: {
              src: ['src/ditherjs.js','src/jquery.ditherjs.js'],
              dest: 'dist/jquery.<%= pkg.name %>.js',
          },
      },
      uglify: {
          options: {
              banner: '/*! <%= pkg.name %> <%= grunt.template.today("yyyy-mm-dd") %> */\n'
          },
          build: {
              src: 'src/<%= pkg.name %>.js',
              dest: 'dist/<%= pkg.name %>.min.js'
          },
          jquery_build: {
              src: 'dist/jquery.<%= pkg.name %>.js',
              dest: 'dist/jquery.<%= pkg.name %>.min.js'
          }
      },
  });

  // Load the plugin that provides the "uglify" task.
  grunt.loadNpmTasks('grunt-contrib-uglify');
  grunt.loadNpmTasks('grunt-contrib-concat');

  // Default task(s).
  grunt.registerTask('default', ['concat','uglify']);

};
