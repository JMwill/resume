const gulp        = require('gulp');
const rename      = require('gulp-rename');
const changed     = require('gulp-changed');
const browserSync = require('browser-sync');

const sass        = require('gulp-sass');
const postcss     = require('gulp-postcss');
const cleanCSS    = require('gulp-clean-css');
const cssnext     = require('postcss-cssnext');

const shell       = require('gulp-shell');

const sourcemaps  = require('gulp-sourcemaps');
const del         = require('del');

const package   = require('./package.json');
const version   = package.version;
const servePort = (package.config && package.config.port) || 3000;
const reload    = browserSync.reload;

let paths = {
    styles: {
        build: 'src/styles/index.scss',
        buildDest: 'dist/styles',
        src: 'src/styles/**/*.scss',
        dest: `dev/${version}/styles/`
    },
    thirdParts: {
        src: 'third-part/**/*',
        dev: `dev/${version}/third-part/`,
        build: `dist/third-part/`
    },
    clean: {
        dev: `dev/${version}/`,
        build: 'dist/'
    },
    favicon: {
        src: 'src/favicon.ico',
        build: 'dist/'
    }
};

gulp.task('devMoveThirdPart', () => {
    return gulp.src(paths.thirdParts.src)
        .pipe(gulp.dest(paths.thirdParts.dev))
        .pipe(browserSync.stream());
});

// dev task define
gulp.task('devClean', () => {
    return del(paths.clean.dev);
});

gulp.task('devStyles', () => {
    let postcssPlugin = [
        cssnext({ browsers: ['last 5 version'] })
    ];
    return gulp.src(paths.styles.src)
        .pipe(changed(paths.styles.dest))
        .pipe(sourcemaps.init())
        .pipe(sass().on('error', sass.logError))
        .pipe(postcss(postcssPlugin))
        .pipe(cleanCSS())
        .pipe(sourcemaps.write())
        .pipe(gulp.dest(paths.styles.dest))
        // .pipe(rename({
        //     basename: 'main',
        //     suffix: '.min'
        // }))
        .pipe(browserSync.stream());
});

gulp.task('devHtml', shell.task('node compile-html.js dev'));

// gulp.task('devcompile', gulp.series('devClean', gulp.parallel('devStyles', 'devMoveThirdPart'), 'devHtml'));
// 取消移动第三方库, 目前转为使用CDN
gulp.task('devcompile', gulp.series('devClean', 'devStyles', 'devHtml'));

gulp.task('watch', gulp.series('devcompile', () => {
    // gulp.watch(paths.thirdParts.src, gulp.parallel('devMoveThirdPart'));

    gulp.watch(paths.styles.src, gulp.parallel('devStyles'));

    gulp.watch('src/components', gulp.parallel('devHtml'));
    gulp.watch('src/dev.html', gulp.parallel('devHtml'));
    gulp.watch(`dev/${version}/index.html`)
        .on('change', reload);
}));

gulp.task('serve', gulp.series('devcompile', () => {
    browserSync.init({
        server: {
            port: servePort,
            baseDir: `dev/${version}`
        }
    });
}));

gulp.task('dev', gulp.parallel('watch', 'serve'));

// build task define
gulp.task('buildClean', () => {
    return del(paths.clean.build);
});

gulp.task('buildHtml', shell.task('node compile-html.js build'));

gulp.task('buildStyles', () => {
    let postcssPlugin = [
        cssnext({ browsers: ['last 1 version'] })
    ];
    return gulp.src(paths.styles.build)
        .pipe(sass({outputStyle: 'compressed'}).on('error', sass.logError))
        .pipe(postcss(postcssPlugin))
        .pipe(cleanCSS())
        .pipe(rename({
            basename: 'index',
            suffix: '.min'
        }))
        .pipe(gulp.dest(paths.styles.buildDest))
});

gulp.task('buildMoveThirdPart', () => {
    return gulp.src(paths.thirdParts.src)
        .pipe(gulp.dest(paths.thirdParts.build));
});

gulp.task('moveFavicon', () => {
    return gulp.src(paths.favicon.src)
        .pipe(gulp.dest(paths.favicon.build));
});

// gulp.task('build', gulp.series('buildClean', gulp.parallel('buildStyles', 'buildMoveThirdPart'), 'buildHtml'));
// 取消移动第三方库, 目前转为使用CDN
gulp.task('build', gulp.series('buildClean', 'buildStyles', gulp.parallel('buildHtml', 'moveFavicon')));