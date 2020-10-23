import {
	FunctionComponent, ComponentInstance, data,
} from 'typed-jsx'
import { Language } from 'prism-react-renderer'

namespace markupElement {
	export declare namespace JSX {
		type Element = Elem
		type IntrinsicElements = {}
		type ElementClass = ComponentInstance
		interface IntrinsicAttributes {}
		interface IntrinsicClassAttributes<T> {}
		interface ElementChildrenAttribute { children: {} }
	}
}
const markupElement = data
export { markupElement }

export enum Type {
	// block
	Section,
	Title,
	Paragraph,
	BlockQuote,
	BulletList, EnumList, ListItem,
	DefList, DefItem, DefTerm, Def,
	FieldList, Field,
	CodeBlock,
	Table, Row, Cell,
	// inline
	LineBreak,
	Emph,
	Strong,
	Link,
	Code,
	InlineMath,
	// custom
	Plotly,
}

/// this doesn’t use HTML 4 type (circle, disc, square),
/// but CSS list-style-type.
export enum Bullet {
	disc = 'disc',
	circle = 'circle',
	square = 'square',
	text = '__text__', // custom text
	// none can be represented by null.
}

/// This doesn’t use HTML props (a, A, i, I, 1),
/// but CSS list-style-type.
export enum Enumeration {
	decimal = 'decimal',
	decimalLeadingZero = 'decimal-leading-zero',
	lowerRoman = 'lower-roman',
	upperRoman = 'upper-roman',
	lowerGreek = 'lower-greek',
	lowerAlpha = 'lower-alpha',
	upperAlpha = 'upper-alpha',
	lowerLatin = 'lower-latin',
	upperLatin = 'upper-latin',
	arabicIndic = 'arabic-indic',
	armenian = 'armenian',
	bengali = 'bengali',
	cjkEarthlyBranch = 'cjk-earthly-branch',
	cjkHeavenlyStem = 'cjk-heavenly-stem',
	devanagari = 'devanagari',
	ethiopicNumeric = 'ethiopic_numeric',
	georgian = 'georgian',
	gujarati = 'gujarati',
	gurmukhi = 'gurmukhi',
	kannada = 'kannada',
	khmer = 'khmer',
	lao = 'lao',
	malayalam = 'malayalam',
	oriya = 'oriya',
	telugu = 'telugu',
	thai = 'thai',
	// none can be represented by null.
}

// Generics

export type Node = string | Elem

export type Elem =
	// Block
	Section | Title | Paragraph | BlockQuote |
	BulletList | EnumList | ListItem |
	DefList | DefItem | DefTerm | Def |
	FieldList | Field |
	CodeBlock |
	Table | Row | Cell |
	// Inline
	LineBreak | Emph | Strong | Link | Code | InlineMath |
	// Custom
	Plotly

interface Element {
	type: Type
	children: Node[]
	pos: number | { line: number, column: number } | undefined
}

export interface Document {
	title: string
	children: Node[]
	metadata: {[key: string]: any}
}
export const Document = (props: Document) => props

function flatten<E, A extends E | A[]>(nested: A[]): E[] {
	const cumul: E[] = []
	for (const elem of nested) {
		if (Array.isArray(elem)) {
			cumul.push(...flatten<E, A>(elem))
		} else {
			cumul.push(elem as E)
		}
	}
	return cumul
}

function arrayify<E, A extends E | A[]>(obj: undefined | E | A[]): E[] {
	if (obj === undefined) return []
	if (Array.isArray(obj)) return flatten(obj)
	return [obj]
}

type Nodes = Node | Nodes[]
type Props<P> = Omit<P, 'type' | 'children'> & { children?: Nodes }
function mkFun<P>(type: Type): FunctionComponent<Props<P>, P> {
	return ({ children: nested, ...props }) => ({
		type, children: arrayify(nested), ...props,
	} as unknown as P)
}

// Block

export interface Section extends Element { type: Type.Section }
export const Section = mkFun<Section>(Type.Section)

export interface Title extends Element { type: Type.Title, level: number }
export const Title = mkFun<Title>(Type.Title)

export interface Paragraph extends Element { type: Type.Paragraph }
export const Paragraph = mkFun<Paragraph>(Type.Paragraph)

export interface BlockQuote extends Element { type: Type.BlockQuote }
export const BlockQuote = mkFun<Paragraph>(Type.BlockQuote)

export interface BulletList extends Element {
	type: Type.BulletList, bullet?: Bullet, text?: string
}
export const BulletList = mkFun<BulletList>(Type.BulletList)
// TODO: rst also has prefix/suffix
export interface EnumList extends Element { type: Type.EnumList, enumeration?: Enumeration }
export const EnumList = mkFun<EnumList>(Type.EnumList)
export interface ListItem extends Element { type: Type.ListItem }
export const ListItem = mkFun<ListItem>(Type.ListItem)

export interface DefList extends Element { type: Type.DefList }
export const DefList = mkFun<DefList>(Type.DefList)
export interface DefItem extends Element { type: Type.DefItem }
export const DefItem = mkFun<DefItem>(Type.DefItem)
export interface DefTerm extends Element { type: Type.DefTerm }
export const DefTerm = mkFun<DefItem>(Type.DefTerm)
export interface Def extends Element { type: Type.Def }
export const Def = mkFun<Def>(Type.Def)

export interface FieldList extends Element { type: Type.FieldList }
export const FieldList = mkFun<FieldList>(Type.FieldList)
export interface Field extends Element { type: Type.Field, name: string }
export const Field = mkFun<Field>(Type.Field)

export interface CodeBlock extends Element { type: Type.CodeBlock, language?: Language }
export const CodeBlock = mkFun<CodeBlock>(Type.CodeBlock)

export interface Table extends Element { type: Type.Table, caption?: string }
export const Table = mkFun<Table>(Type.Table)
export interface Row extends Element { type: Type.Row }
export const Row = mkFun<Row>(Type.Row)
export interface Cell extends Element { type: Type.Cell }
export const Cell = mkFun<Cell>(Type.Cell)

// Inline

export interface LineBreak extends Element { type: Type.LineBreak }
export const LineBreak = mkFun<LineBreak>(Type.LineBreak)

export interface Emph extends Element { type: Type.Emph }
export const Emph = mkFun<Emph>(Type.Emph)

export interface Strong extends Element { type: Type.Strong }
export const Strong = mkFun<Strong>(Type.Strong)

export interface Link extends Element { type: Type.Link, ref: {name: string} | {href: string} }
export const Link = mkFun<Link>(Type.Link)

export interface Code extends Element { type: Type.Code }
export const Code = mkFun<Code>(Type.Code)

export interface InlineMath extends Element { type: Type.InlineMath, math: string }
export const InlineMath = mkFun<InlineMath>(Type.InlineMath)

// Custom

export interface Plotly extends Element {
	type: Type.Plotly,
	url: string,
	onClickLink?: string,
	style?: Partial<React.CSSProperties>,
	config?: Plotly.Config,
}
export const Plotly = mkFun<Plotly>(Type.Plotly)
