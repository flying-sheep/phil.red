import type { ComponentInstance } from 'typed-jsx'

import type { Elem, ElementType as ET } from './MarkupDocument'

export { data as jsx } from 'typed-jsx'

export declare namespace JSX {
	type Element = Elem
	type ElementType = ET
	type IntrinsicElements = Record<string, never>
	type ElementClass = ComponentInstance
	type IntrinsicAttributes = { children?: unknown }
	type IntrinsicClassAttributes<_T> = Record<string, never>
	interface ElementChildrenAttribute {
		children: unknown
	}
}
