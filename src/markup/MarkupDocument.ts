export enum Type {
	// block
	Paragraph,
	Section,
	Title,
	BulletList, EnumList, ListItem,
	CodeBlock,
	Table, Row, Cell,
	// inline
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

type Props<P> = Omit<P, 'type' | 'children'> & { children?: Node[] | Node }


// Block

interface Paragraph extends Element { type: Type.Paragraph }
export const Paragraph = (props: Omit<Paragraph, 'type'>) => ({ type: Type.Paragraph, ...props })

interface Section extends Element { type: Type.Section }
export const Section = (props: Omit<Section, 'type'>) => ({ type: Type.Section, ...props })

interface Title extends Element { type: Type.Title, level: number }
export const Title = (props: Omit<Title, 'type'>) => ({ type: Type.Title, ...props })

interface BulletList extends Element { type: Type.BulletList, bullet?: Bullet, text?: string }
export const BulletList = (props: Omit<BulletList, 'type'>) => ({ type: Type.BulletList, ...props })
interface EnumList extends Element { type: Type.EnumList, enumeration?: Enumeration }  // TODO: rst also has prefix/suffix
export const EnumList = (props: Omit<EnumList, 'type'>) => ({ type: Type.EnumList, ...props })
interface ListItem extends Element { type: Type.ListItem }
export const ListItem = (props: Omit<ListItem, 'type'>) => ({ type: Type.ListItem, ...props })

interface CodeBlock extends Element { type: Type.CodeBlock, language?: string }
export const CodeBlock = (props: Omit<CodeBlock, 'type'>) => ({ type: Type.CodeBlock, ...props })

interface Table extends Element { type: Type.Table, caption?: string }
export const Table = (props: Omit<Table, 'type'>) => ({ type: Type.Table, ...props })
interface Row extends Element { type: Type.Row }
export const Row = (props: Omit<Row, 'type'>) => ({ type: Type.Row, ...props })
interface Cell extends Element { type: Type.Cell }
export const Cell = (props: Omit<Cell, 'type'>) => ({ type: Type.Cell, ...props })

// Inline

interface Emph extends Element { type: Type.Emph }
export const Emph = (props: Omit<Emph, 'type'>) => ({ type: Type.Emph, ...props })

interface Strong extends Element { type: Type.Strong }
export const Strong = (props: Omit<Strong, 'type'>) => ({ type: Type.Strong, ...props })

interface Link extends Element { type: Type.Link, ref: {name: string} | {href: string} }
export const Link = (props: Omit<Link, 'type'>) => ({ type: Type.Link, ...props })

interface Code extends Element { type: Type.Code }
export const Code = (props: Omit<Code, 'type'>) => ({ type: Type.Code, ...props })

interface InlineMath extends Element { type: Type.InlineMath, math: string }
export const InlineMath = (props: Omit<InlineMath, 'type'>) => ({ type: Type.InlineMath, ...props })

// Custom

interface Plotly extends Element {
	type: Type.Plotly,
	url: string,
	onClickLink?: string,
	style?: Partial<CSSStyleDeclaration>,
	config?: Plotly.Config,
}
export const Plotly = (props: Omit<Plotly, 'type'>) => ({ type: Type.Plotly, ...props })
