import { FunctionComponent } from 'typed-jsx'

export enum Type {
	// block
	Paragraph,
	Section,
	Title,
	BulletList, EnumList, ListItem,
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
	text = '__text__',  // custom text
	// none can be represented by null.
}

/// This doesn’t use HTML props (a, A, i, I, 1),
/// but CSS list-style-type.
export enum Enumeration {
	decimal = 'decimal',
	decimal_leading_zero = 'decimal-leading-zero',
	lower_roman = 'lower-roman',
	upper_roman = 'upper-roman',
	lower_greek = 'lower-greek',
	lower_alpha = 'lower-alpha',
	upper_alpha = 'upper-alpha',
	lower_latin = 'lower-latin',
	upper_latin = 'upper-latin',
	arabic_indic = 'arabic-indic',
	armenian = 'armenian',
	bengali = 'bengali',
	cjk_earthly_branch = 'cjk-earthly-branch',
	cjk_heavenly_stem = 'cjk-heavenly-stem',
	devanagari = 'devanagari',
	ethiopic_numeric = 'ethiopic_numeric',
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
	Paragraph | Section | Title | BulletList | EnumList | ListItem | CodeBlock | Table | Row | Cell |
	// Inline
	LineBreak | Emph | Strong | Link | Code | InlineMath |
	// Custom
	Plotly

interface Element {
	type: Type
	children: Node[]
}

export interface Document {
	title: string
	children: Node[]
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

type Nodes = Node | Nodes[]
type Props<P> = Omit<P, 'type' | 'children'> & { children?: Nodes }
function mkFun<P>(type: Type): FunctionComponent<Props<P>, P> {
	return ({children: nestedChildren, ...props}) => {
		const children: Node[] = Array.isArray(nestedChildren) ? flatten(nestedChildren) : nestedChildren !== undefined ? [nestedChildren] : []
		return { type, children, ...props } as unknown as P
	}
}


// Block

interface Paragraph extends Element { type: Type.Paragraph }
export const Paragraph = mkFun<Paragraph>(Type.Paragraph)

interface Section extends Element { type: Type.Section }
export const Section = mkFun<Section>(Type.Section)

interface Title extends Element { type: Type.Title, level: number }
export const Title = mkFun<Title>(Type.Title)

interface BulletList extends Element { type: Type.BulletList, bullet?: Bullet, text?: string }
export const BulletList = mkFun<BulletList>(Type.BulletList)
interface EnumList extends Element { type: Type.EnumList, enumeration?: Enumeration }  // TODO: rst also has prefix/suffix
export const EnumList = mkFun<EnumList>(Type.EnumList)
interface ListItem extends Element { type: Type.ListItem }
export const ListItem = mkFun<ListItem>(Type.ListItem)

interface CodeBlock extends Element { type: Type.CodeBlock, language?: string }
export const CodeBlock = mkFun<CodeBlock>(Type.CodeBlock)

interface Table extends Element { type: Type.Table, caption?: string }
export const Table = mkFun<Table>(Type.Table)
interface Row extends Element { type: Type.Row }
export const Row = mkFun<Row>(Type.Row)
interface Cell extends Element { type: Type.Cell }
export const Cell = mkFun<Cell>(Type.Cell)

// Inline

interface LineBreak extends Element { type: Type.LineBreak }
export const LineBreak = mkFun<LineBreak>(Type.LineBreak)

interface Emph extends Element { type: Type.Emph }
export const Emph = mkFun<Emph>(Type.Emph)

interface Strong extends Element { type: Type.Strong }
export const Strong = mkFun<Strong>(Type.Strong)

interface Link extends Element { type: Type.Link, ref: {name: string} | {href: string} }
export const Link = mkFun<Link>(Type.Link)

interface Code extends Element { type: Type.Code }
export const Code = mkFun<Code>(Type.Code)

interface InlineMath extends Element { type: Type.InlineMath, math: string }
export const InlineMath = mkFun<InlineMath>(Type.InlineMath)

// Custom

interface Plotly extends Element {
	type: Type.Plotly,
	url: string,
	onClickLink?: string,
	style?: Partial<CSSStyleDeclaration>,
	config?: Plotly.Config,
}
export const Plotly = mkFun<Plotly>(Type.Plotly)
