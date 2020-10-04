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
	disc,
	circle,
	square,
	text,  // custom text
	// none can be represented by null.
}

/// This doesn’t use HTML props (a, A, i, I, 1),
/// but CSS list-style-type.
export enum Enumeration {
	decimal,
	decimal_leading_zero,
	lower_roman, upper_roman,
	lower_greek,
	lower_alpha, lower_latin,
	upper_alpha, upper_latin,
	arabic_indic,
	armenian,
	bengali,
	cjk_earthly_branch,
	cjk_heavenly_stem,
	devanagari,
	ethiopic_numeric,
	georgian,
	gujarati,
	gurmukhi,
	kannada,
	khmer,
	lao,
	malayalam,
	oriya,
	telugu,
	thai,
	// none can be represented by null.
}

// Generics

export type Node = string | Element

export interface Element {
	type: Type
	children: Node[]
}

export interface Document {
	title: string
	children: Node[]
}
export const Document = (props: Document) => props

type Props<P> = Omit<P, 'type' | 'children'> & { children?: Node | Node[] }
function mkFun<P>(type: Type): FunctionComponent<Props<P>, P> {
	return (props) => ({ type, ...props } as unknown as P)
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
