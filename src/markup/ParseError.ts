export default class ParseError extends Error {
	orig: Error
	position: number

	constructor(orig: Error, position: number) {
		super()
		this.message = orig.message
		this.orig = orig
		this.position = position
	}
}
