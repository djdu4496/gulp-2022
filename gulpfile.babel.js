import gulp from 'gulp';
import pug from 'gulp-pug';
import del from 'del';
import ws from 'gulp-webserver';
import watch from 'gulp-watch';
import image from 'gulp-image';
import dartSass from 'sass';
import gulpSass from 'gulp-sass';
import autoPrefixer from 'gulp-autoprefixer';
import miniCSS from 'gulp-csso';
import bro from 'gulp-bro';
import babelify from 'babelify';
import ghPages from 'gulp-gh-pages';

const sass = gulpSass(dartSass);

const routes = {
  pug: {
    src: "src/*.pug",
    dest: "build",
    watch: "src/**/*.pug"
  },
  img: {
    src: "src/img/logo.svg",
    dest: "build/img"
  },
  scss: {
    src: "src/scss/style.scss",
    dest: "build/css",
    watch: "src/scss/*.scss"
  },
  js: {
    src: "src/js/main.js",
    dest: "build/js",
    watch: "src/js/*.js"
  }
}

const clean = () => del(['build/', '.publish/'])

const watches = () => {
  watch(routes.pug.watch, gPug);
  watch(routes.img.src, img);
  watch(routes.scss.watch, styles);
  watch(routes.js.watch, js);
}

const gPug = () => 
  gulp.src(routes.pug.src)
  .pipe(pug())
  .pipe(gulp.dest(routes.pug.dest))

const webserver = () => gulp.src(routes.pug.dest).pipe(ws({ livereload: true}))

const img = () => gulp.src(routes.img.src).pipe(image()).pipe(gulp.dest(routes.img.dest));

const styles = () => gulp.src(routes.scss.src)
.pipe(sass().on('error', sass.logError))
.pipe(autoPrefixer())
.pipe(miniCSS())
.pipe(gulp.dest(routes.scss.dest));

const js = () => 
  gulp.src(routes.js.src)
  .pipe(bro({                                                      
    transform: [                                             
      babelify.configure({ presets: ["@babel/preset-env"] }),
      [ 'uglifyify', { global: true } ]                      
    ]		                                                     
  }))
  .pipe(gulp.dest(routes.js.dest))

const ghDeploy = () => {
  const options = {
    cacheDir: "xxx"
  };
  return gulp.src('build/**/*')
  .pipe(ghPages([options]));
}

const prepare = gulp.series([clean, img]);
const assets = gulp.series([gPug, styles, js]);
const live = gulp.parallel([webserver, watches]);
export const build = gulp.series([prepare, assets]);
export const dev = gulp.series([build, live]);
export const deploy = gulp.series([build, clean, ghDeploy, clean]);