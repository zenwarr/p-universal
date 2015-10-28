var gulp = require('gulp');
var sass = require('gulp-ruby-sass');
var autoprefixer = require('gulp-autoprefixer');
var livereload = require('gulp-livereload');
var spritesmith = require('gulp.spritesmith');
var plumber = require('gulp-plumber');
var newer = require('gulp-newer');

var watching = false;

/************************************************************
 * Styles
 ************************************************************/

var styles_input = 'src/styles';
var styles_output = 'css';

var autoprefixer_options = {
  browsers: ['last 2 versions', '> 1%', 'ie 8'],
  remove: false
};

gulp.task('sass', function() {
  var stream = gulp.src(styles_input + '/*.sass')
      .pipe(plumber())
      .pipe(sass({
        style: 'expanded'
      }))
      .pipe(autoprefixer(autoprefixer_options))
      .pipe(gulp.dest(styles_output));

  if (watching)
    stream.pipe(livereload());
});

gulp.task('raw_css', function() {
  var stream = gulp.src(styles_input + '/*.css')
      .pipe(plumber())
      .pipe(autoprefixer(autoprefixer_options))
      .pipe(gulp.dest(styles_output));

  if (watching)
    stream.pipe(livereload());
});

/************************************************************
 * Scripts
 ************************************************************/

var scripts_input = 'src/scripts';
var scripts_output = 'js';

gulp.task('js', function() {
  var stream = gulp.src(scripts_input + '/*.*')
      .pipe(plumber())
      .pipe(gulp.dest(scripts_output));

  if (watching)
    stream.pipe(livereload());

  var thirdparty_stream = gulp.src(scripts_input + '/3rdparty/*.*')
      .pipe(plumber())
      .pipe(gulp.dest(scripts_output));

  if (watching)
    thirdparty_stream.pipe(livereload());
});

/************************************************************
 * HTML
 ************************************************************/

gulp.task('html', function() {
  // do nothing

  if (watching) {
    gulp.src('*.html')
        .pipe(livereload());
  }
});

/************************************************************
 * Images
 ************************************************************/

var images_input = 'src/img';
var images_output = 'img';

var image_dirs = ['content'];

gulp.task('images', function() {
  var stream = gulp.src(images_input + '/*.*')
      .pipe(plumber())
      .pipe(newer(images_output))
      .pipe(gulp.dest(images_output));

  if (watching)
    stream.pipe(livereload());
});

for (var j = 0; j < image_dirs.length; ++j) {
  (function() {
    var local_j = j;
    gulp.task('images-' + image_dirs[j], function() {
      var input_dir = images_input + '/' + image_dirs[local_j];
      var output_dir = images_output + '/' + image_dirs[local_j];
      var stream = gulp.src(input_dir + '/*.*')
          .pipe(plumber())
          .pipe(newer(output_dir))
          .pipe(gulp.dest(output_dir));

      if (watching)
        stream.pipe(livereload());
    });
  })();
}

gulp.task('all-images', function() {
  gulp.start('images');
  for (var j = 0; j < image_dirs.length; ++j) {
    gulp.start('images-' + image_dirs[j]);
  }
});

/************************************************************
 * Sprites
 ************************************************************/

var sprites = [{
    name: 'sprite'
  }, {
    name:'sprite2x',
    css_postfix: '-2x'
  }];

for (var j = 0; j < sprites.length; ++j) {
  (function() {
    var local_j = j;
    gulp.task('sprite-' + sprites[j].name, function() {
      var spr_data = sprites[local_j];
      var stream = gulp.src(images_input + '/' + spr_data.name + '/*.png')
          .pipe(plumber())
          .pipe(spritesmith({
            imgName: spr_data.name + '.png',
            cssName: 'sprites/' + spr_data.name + '.sass',
            algorithm: 'binary-tree',
            padding: 4,
            imgPath: '../img/sprites/' + spr_data.name + '.png',
            cssVarMap: function(sprite) {
              if (spr_data.css_postfix != undefined)
                sprite.name = sprite.name + spr_data.css_postfix;
            }
          }));

      stream.img.pipe(gulp.dest(images_output + '/sprites'));
      stream.css.pipe(gulp.dest(styles_input));

      if (watching) {
        stream.img.pipe(livereload());
        stream.css.pipe(livereload());
      }
    });
  })();
}

gulp.task('all-sprites', function() {
  for (var j = 0; j < sprites.length; ++j) {
    gulp.start('sprite-' + sprites[j].name);
  }
});

/************************************************************
 * Live reload
 ************************************************************/

gulp.task('watch', function() {
  watching = true;

  livereload.listen();

  gulp.watch(styles_input + '/**', ['sass', 'raw_css']);

  gulp.watch(scripts_input + '/**', ['js']);

  gulp.watch(images_input + '/*.*', ['images']);
  for (var j = 0; j < image_dirs.length; ++j) {
    gulp.watch(images_input + '/' + image_dirs[j] + '/*.*',
               ['images-' + image_dirs[j]]);
  }

  for (var j = 0; j < sprites.length; ++j)
    gulp.watch(images_input + '/' + sprites[j].name + '/*.png',
               ['sprite-' + sprites[j].name]);

  gulp.watch('*.html', ['html']);
});

gulp.task('default', function() {
  gulp.start('html', 'all-sprites', 'all-images', 'sass', 'raw_css', 'js', 'watch');
});

gulp.task('build', function() {
  gulp.start('html', 'all-sprites', 'all-images', 'sass', 'raw_css', 'js');
});
