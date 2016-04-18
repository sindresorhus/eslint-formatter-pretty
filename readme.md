# eslint-formatter-pretty [![Build Status](https://travis-ci.org/sindresorhus/eslint-formatter-pretty.svg?branch=master)](https://travis-ci.org/sindresorhus/eslint-formatter-pretty)

>  Pretty formatter for [ESLint](http://eslint.org)

![](screenshot.png)


## Install

```
$ npm install --save-dev eslint-formatter-pretty
```


## Usage

### ESLint CLI

```
$ eslint --format=node_modules/eslint-formatter-pretty file.js
```

### [grunt-eslint](https://github.com/sindresorhus/grunt-eslint)

```js
grunt.initConfig({
	eslint: {
		options: {
			format: 'node_modules/eslint-formatter-pretty'
		},
		target: ['file.js']
	}
});

grunt.loadNpmTasks('grunt-eslint');
grunt.registerTask('default', ['eslint']);
```


## Tip

In iTerm, <kbd>Cmd</kbd>+click the filename header to open the file in your editor.


## License

MIT © [Sindre Sorhus](https://sindresorhus.com)
