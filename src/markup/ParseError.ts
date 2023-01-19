import type { Positon } from 'restructured'

export default class ParseError extends Error {
	orig: Error
	pos: Positon

	constructor(orig: Error, pos: Positon) {
		super()
		this.message = orig.message
		this.orig = orig
		this.pos = pos
	}
}
