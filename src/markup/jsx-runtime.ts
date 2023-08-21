import type { ComponentInstance } from 'typed-jsx'

import type { Elem, ElementType as ET } from './MarkupDocument'

export { data as jsx } from 'typed-jsx'

// eslint-disable-next-line @typescript-eslint/no-namespace
export declare namespace JSX {
	type Element = Elem
	type ElementType = ET
	type IntrinsicElements = Record<string, never>
	type ElementClass = ComponentInstance
	type IntrinsicAttributes = { children?: unknown }
	// eslint-disable-next-line @typescript-eslint/no-unused-vars
	type IntrinsicClassAttributes<T> = Record<string, never>
	interface ElementChildrenAttribute {
		children: unknown
	}
}
