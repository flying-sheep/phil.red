import { FunctionComponent } from 'typed-jsx'

export enum Type {
	// block
	Paragraph,
	Section,
	Title,
	BulletList, EnumList, ListItem,
	DefList, DefItem, DefTerm, Def,
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

interface Paragraph extends Element { type: Type.Paragraph }
export const Paragraph = mkFun<Paragraph>(Type.Paragraph)

interface Section extends Element { type: Type.Section }
export const Section = mkFun<Section>(Type.Section)

interface Title extends Element { type: Type.Title, level: number }
export const Title = mkFun<Title>(Type.Title)

interface BulletList extends Element { type: Type.BulletList, bullet?: Bullet, text?: string }
export const BulletList = mkFun<BulletList>(Type.BulletList)
// TODO: rst also has prefix/suffix
interface EnumList extends Element { type: Type.EnumList, enumeration?: Enumeration }
export const EnumList = mkFun<EnumList>(Type.EnumList)
interface ListItem extends Element { type: Type.ListItem }
export const ListItem = mkFun<ListItem>(Type.ListItem)

interface DefList extends Element { type: Type.DefList }
export const DefList = mkFun<DefList>(Type.DefList)
interface DefItem extends Element { type: Type.DefItem }
export const DefItem = mkFun<DefItem>(Type.DefItem)
interface DefTerm extends Element { type: Type.DefTerm }
export const DefTerm = mkFun<DefItem>(Type.DefTerm)
interface Def extends Element { type: Type.Def }
export const Def = mkFun<Def>(Type.Def)

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
	style?: Partial<React.CSSProperties>,
	config?: Plotly.Config,
}
export const Plotly = mkFun<Plotly>(Type.Plotly)
