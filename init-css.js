#!/usr/bin/env node
/* eslint-disable no-console */

const fsp = require('fs').promises

const glob = require('glob') // eslint-disable-line import/no-extraneous-dependencies

const unspecific = `\
declare const mod: { [cls: string]: string }
export default mod
`

for (const def of glob.sync('src/**/*.css').map((css) => `${css}.d.ts`)) {
	fsp.writeFile(def, unspecific, { flag: 'wx' })
		.then(() => console.log(`${def} written`))
		.catch((e) => (e.code === 'EEXIST' ? console.log(`${def} exists`) : console.error(e)))
}
