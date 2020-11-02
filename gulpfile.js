const gulp = require('gulp');
const uglify = require('gulp-uglify');
const concat = require('gulp-concat');
const cleanCSS = require('gulp-clean-css');
const imagemin = require('gulp-imagemin');
const browserSync = require('browser-sync');
const reload = browserSync.reload;
const sass = require('gulp-sass');
const sourcemaps = require('gulp-sourcemaps');
const clean = require('gulp-clean');
const {series, parallel} = require('gulp');


const path = {
    src: {
        html: './app/*.html',
        styles: {
            css: [
                './app/styles/CSS/**/*.css'
            ],
            sass: './app/styles/SASS/**/*.scss'
        },
        js: './app/js/main.js',
        fonts: ['./app/fonts/**/*'],
        images: './app/img/**/*'
    },
    build: {
        html: 'build/',
        styles: 'build/styles/',
        js: 'build/js/',
        fonts: 'build/fonts/',
        images: 'build/img/'
    }
};


// SCSS to CSS (inside 'app/')
function style() {
    return gulp.src('./app/styles/SASS/main.scss')
    .pipe(sourcemaps.init())
    .pipe(sass().on('error', sass.logError))
    .pipe(sourcemaps.write())
    .pipe(gulp.dest('./app/styles/CSS'))
    .pipe(browserSync.stream());
};

// uglifying JS file (from 'app/' to 'build/')
function js() {
    return gulp.src(path.src.js)
    .pipe(uglify())
    .pipe(concat('main.js'))
    .pipe(gulp.dest(path.build.js))
    .pipe(reload({stream:true}))
};

// minifying CSS (from 'app/' to 'build/')
function css() {
    return gulp.src(path.src.styles.css)
    .pipe(cleanCSS())
    .pipe(concat('main.css'))
    .pipe(gulp.dest(path.build.styles))
    .pipe(reload({stream: true}))
};

// create index.html in 'build/'
function html() {
    return gulp.src(path.src.html)
    .pipe(gulp.dest(path.build.html))
    .pipe(reload({stream: true}))
};

// transfering fonts from 'app/' to 'build/'
function fonts() {
    return gulp.src(path.src.fonts)
    .pipe(gulp.dest(path.build.fonts))
    .pipe(reload({stream: true}))
};

// minifying images and transfering them from 'app/' to 'build/'
function img() {
    return gulp.src(path.src.images)
    .pipe(imagemin([
        imagemin.gifsicle({interlaced: true}),
        imagemin.mozjpeg({quality: 75, progressive: true}),
        imagemin.optipng({optimizationLevel: 5}),
        imagemin.svgo({
            plugins: [
                {removeViewBox: true},
                {cleanupIDs: false}
            ]
        })
    ], {
        verbose: true
    }))
    .pipe(gulp.dest(path.build.images))
};

// clean 'build/' folder
function cleanBuild() {
    return gulp.src('build').pipe(clean());
};

// build the project
const build = series(cleanBuild, img, html, fonts, css, js)

// server
function watch() {
    browserSync.init({
        server: {
            // baseDir: 'build'
            baseDir: 'app'
        }
    });
    gulp.watch('./app/styles/**/*.scss', style);
    gulp.watch('./app/index.html').on('change', reload);
    gulp.watch('./app/js/**/*.js').on('change', reload);
}




exports.style = style; // converts .scss into .css
exports.watch = watch; // watches *.scss, *.html and *.js
exports.js = js; // uglifies all *.js and glues them together (main.js)
exports.css = css; // minifies all *.css and glues them together (main.css)
exports.html = html; // copies *.html into the build/ folder
exports.fonts = fonts; // copies all fonts into the build/fonts/ folder
exports.img = img; // optimises all images and puts`em into the build/images folder
exports.cleanBuild = cleanBuild; // deletes buid/ folder
exports.build = build; // deletes previous build/ folder and creates new one w/ all the operations written previously 