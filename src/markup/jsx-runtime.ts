import { ComponentInstance } from 'typed-jsx'
import { Elem } from './MarkupDocument'

export { data as jsx } from 'typed-jsx'

export declare namespace JSX {
	type Element = Elem
	type IntrinsicElements = {}
	type ElementClass = ComponentInstance
	interface IntrinsicAttributes {}
	interface IntrinsicClassAttributes<T> {}
	interface ElementChildrenAttribute { children: {} }
}
