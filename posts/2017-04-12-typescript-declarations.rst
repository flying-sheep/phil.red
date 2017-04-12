Before I have to relearn this again here the necessary ``tsconfig.json`` settings:

.. code:: typescript

	{
		"compilerOptions": {
			"baseUrl": ".",                                  // without this, "paths" doesn’t work
			"paths" :{ "*": ["typings/*", "*"] },            // add `typings/` to search path
			"typeRoots": ["node_modules/@types", "typings"]  // accept module declaration files/dirs from there
		},
		"include": ["index.ts"]  // "typings/**/*.d.ts" doesn’t need to be here
	}

Now i can create module declaration files as ``typings/module-name.d.ts``, e.g. a node-style module function from the templates_:

.. _templates: https://www.typescriptlang.org/docs/handbook/declaration-files/templates.html

.. code:: typescript

	/* eslint import/no-extraneous-dependencies: 0 */
	import { Plugin } from 'postcss'
	
	declare namespace postcssModules {
		interface Options { ... }
	}
	declare const postcssModules: Plugin<postcssModules.Options>
	export = postcssModules

And for the record, a ``tsconfig.json`` boilerplate:

.. code:: typescript

	{
		"compilerOptions": {
			"module": "commonjs",        // output format, for apps use "none"
			"moduleResolution": "node",  // accept `module/index.ts` when doing `import 'module'`
			"target": "es2015",          // don’t convert language features; browsers and node are modern
			"lib": ["es2015"],           // Promise & co.
			// stronger types (in the 2.3 future, use `"strict": true`)
			"alwaysStrict": true,
			"noImplicitAny": true,
			"noImplicitThis": true,
			"strictNullChecks": true,
			// general
			"removeComments": true,
			"sourceMap": true,
			// custom typings
			"baseUrl": ".",
			"paths" :{ "*": ["typings/*", "*"] },
			"typeRoots": ["node_modules/@types", "typings"]
		},
		"include": ["index.ts"]
	}
