import type { Position } from './MarkupDocument'

export default class ParseError extends Error {
	orig: Error
	pos: Position

	constructor(orig: Error, pos: Position) {
		super()
		this.message = orig.message
		this.orig = orig
		this.pos = pos
	}
}
