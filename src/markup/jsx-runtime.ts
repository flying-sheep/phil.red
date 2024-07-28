import type { ComponentInstance } from 'typed-jsx'

import type { ElementType as ET, Elem } from './MarkupDocument'

export { data as jsx } from 'typed-jsx'

export declare namespace JSX {
	type Element = Elem
	type ElementType = ET
	type IntrinsicElements = Record<string, never>
	type ElementClass = ComponentInstance
	type IntrinsicAttributes = { children?: unknown }
	type IntrinsicClassAttributes<T> = Record<string, never>
	interface ElementChildrenAttribute {
		children: unknown
	}
}
