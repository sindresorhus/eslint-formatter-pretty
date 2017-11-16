# eslint-formatter-pretty [![Build Status](https://travis-ci.org/sindresorhus/eslint-formatter-pretty.svg?branch=master)](https://travis-ci.org/sindresorhus/eslint-formatter-pretty)

> Pretty formatter for [ESLint](https://eslint.org)

![](screenshot.png)


## Install

```
$ npm install --save-dev eslint-formatter-pretty
```


## Usage

### ESLint CLI

```
$ eslint --format=pretty file.js
```

### [grunt-eslint](https://github.com/sindresorhus/grunt-eslint)

```js
grunt.initConfig({
	eslint: {
		target: ['file.js'].
		options: {
			format: 'pretty'
		}
	}
});

grunt.loadNpmTasks('grunt-eslint');
grunt.registerTask('default', ['eslint']);
```

### [gulp-eslint](https://github.com/adametry/gulp-eslint)

```js
const gulp = require('gulp');
const eslint = require('gulp-eslint');

gulp.task('lint', () =>
	gulp.src('file.js')
		.pipe(eslint())
		.pipe(eslint.format('pretty'))
);
```

### [eslint-loader](https://github.com/MoOx/eslint-loader) *(webpack)*

```js
module.exports = {
	entry: ['file.js'],
	module: {
		rules: [
			{
				test: /\.js$/,
				exclude: /node_modules/,
				loader: 'eslint-loader',
				options: {
					formatter: require('eslint-formatter-pretty')
				}
			}
		]
	}
};
```


## Tip

In iTerm, <kbd>Cmd</kbd>+click the filename header to open the file in your editor.


## License

MIT © [Sindre Sorhus](https://sindresorhus.com)
