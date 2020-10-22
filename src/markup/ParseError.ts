export default class ParseError extends Error {
	orig: Error
	pos: number

	constructor(orig: Error, pos: number) {
		super()
		this.message = orig.message
		this.orig = orig
		this.pos = pos
	}
}
