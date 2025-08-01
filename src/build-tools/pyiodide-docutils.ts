import { loadPyodide, type PyodideInterface } from 'pyodide'
import type { PyCallable, PyDict, PyProxy } from 'pyodide/ffi'

export interface DocutilsCore {
	Publisher: PyProxy
	publish_cmdline: PyCallable
	publish_file: PyCallable
	publish_string: PyCallable
	publish_parts: PyCallable
	publish_doctree: PyCallable
	publish_from_doctree: PyCallable
	publish_cmdline_to_binary: PyCallable
	publish_programmatically: PyCallable
	rst2something: PyCallable
	rst2html: PyCallable
	rst2html4: PyCallable
	rst2html5: PyCallable
	rst2latex: PyCallable
	rst2man: PyCallable
	rst2odt: PyCallable
	rst2pseudoxml: PyCallable
	rst2s5: PyCallable
	rst2xetex: PyCallable
	rst2xml: PyCallable
}

export interface Node {
	parent: Node | undefined
	source: string | undefined
	line: number
	document: Document
	asdom: PyCallable // (dom=None)
	pformat: PyCallable // (indent='    ', level=0)
	copy: PyCallable // ()
	deepcopy: PyCallable // ()
	astext: PyCallable // ()
	setup_child: PyCallable // (child)
	walk: PyCallable // (visitor)
	walkabout: PyCallable // (visitor)
	traverse: PyCallable // (condition=None, include_self=True, descend=True, siblings=False, ascend=False)
	findall: PyCallable // (condition=None, include_self=True, descend=True, siblings=False, ascend=False)
	next_node: PyCallable //(condition=None, include_self=False, descend=True, siblings=False, ascend=False)
}

// biome-ignore lint/complexity/noBannedTypes: it is a string
export interface Text extends Node, String {
	tagname: '#text'
	children: []
	shortrepr: PyCallable // (maxlen=18)
	_dom_node: PyCallable // (domroot)
	astext: PyCallable // ()
	copy: PyCallable // ()
	deepcopy: PyCallable // ()
	pformat: PyCallable // (indent='    ', level=0)
	rstrip: PyCallable // (chars=None)
	lstrip: PyCallable // (chars=None)
}

export interface Element<Cn = Node[]> extends Node {
	// class attrs
	basic_attributes: string[] // = ('ids', 'classes', 'names', 'dupnames')
	local_attributes: string[] // = ('backrefs',)
	list_attributes: string[] // = ('ids', 'classes', 'names', 'dupnames', 'backrefs')
	known_attributes: string[] // = ('ids', 'classes', 'names', 'dupnames', 'backrefs', 'source')
	child_text_separator: string // = '\n\n'
	// instance attrs
	rawsource: string
	children: Cn
	attributes: PyDict
	tagname: string | undefined
	_dom_node: PyCallable // (domroot)
	shortrepr: PyCallable // ()
	starttag: PyCallable // (quoteattr=None)
	endtag: PyCallable // ()
	emptytag: PyCallable // ()
	__iadd__: PyCallable // (other)
	astext: PyCallable // ()
	non_default_attributes: PyCallable // ()
	attlist: PyCallable // ()
	get: PyCallable // (key, failobj=None)
	hasattr: PyCallable // (attr)
	delattr: PyCallable // (attr)
	setdefault: PyCallable // (key, failobj=None)
	has_key: PyCallable // (attr)
	get_language_code: PyCallable // (fallback='')
	append: PyCallable // (item)
	extend: PyCallable // (item)
	insert: PyCallable // (index, item)
	pop: PyCallable // (i=-1)
	remove: PyCallable // (item)
	index: PyCallable // (item, start=0, stop=9223372036854775807)
	previous_sibling: PyCallable // ()
	is_not_default: PyCallable // (key)
	update_basic_atts: PyCallable // (dict_)
	append_attr_list: PyCallable // (attr, values)
	coerce_append_attr_list: PyCallable // (attr, value)
	replace_attr: PyCallable // (attr, value, force=True)
	copy_attr_convert: PyCallable // (attr, value, replace=True)
	copy_attr_coerce: PyCallable // (attr, value, replace)
	copy_attr_concatenate: PyCallable // (attr, value, replace)
	copy_attr_consistent: PyCallable // (attr, value, replace)
	update_all_atts: PyCallable // (dict_, update_fun=<function Element.copy_attr_consistent>, replace=True, and_source=False)
	update_all_atts_consistantly: PyCallable // (dict_, replace=True, and_source=False)
	update_all_atts_concatenating: PyCallable // (dict_, replace=True, and_source=False)
	update_all_atts_coercion: PyCallable // (dict_, replace=True, and_source=False)
	update_all_atts_convert: PyCallable // (dict_, and_source=False)
	clear: PyCallable // ()
	replace: PyCallable // (old, new)
	replace_self: PyCallable // (new)
	first_child_matching_class: PyCallable // (childclass, start=0, end=9223372036854775807)
	first_child_not_matching_class: PyCallable // (childclass, start=0, end=9223372036854775807)
	pformat: PyCallable // (indent='    ', level=0)
	copy: PyCallable // () → Element
	deepcopy: PyCallable // () → Element
	set_class: PyCallable // (name)
	note_referenced_by: PyCallable // (name=None, id=None)
	// classmethod is_not_list_attribute(attr)
	// classmethod is_not_known_attribute(attr)
}

// https://sphinx-docutils.readthedocs.io/en/latest/docutils.nodes.html#docutils.nodes.document
export interface Document extends Element {
	current_source: string
	current_line: number
	settings: unknown
	reporter: unknown
	indirect_targets: Node[]
	substitution_defs: PyDict // string → substitution_definition
	substitution_names: PyDict // string (case-normalized) → string (case-sensitive)
	refnames: PyDict // string → Node
	refids: PyDict // string → Node
	nameids: PyDict // string (name) → string (id)
	nametypes: PyDict // string (name) → boolean (“is link explicit”)
	ids: PyDict // string → Node
	footnote_refs: PyDict // string → footnote_reference[]
	citation_refs: PyDict // string → citation_reference[]
	autofootnotes: Element[] // footnote
	autofootnote_refs: Element[] // footnote_reference[]
	symbol_footnotes: Element[] // footnote
	symbol_footnote_refs: Element[] // footnote_reference[]
	footnotes: Element[] // footnote
	citations: Element[] // citation
	autofootnote_start: number
	symbol_footnote_start: number
	id_counter: unknown
	parse_messages: unknown[]
	transform_messages: unknown[]
	transformer: unknown
	include_log: unknown
	decoration: unknown
	asdom: PyCallable // (dom=None)
	set_id: PyCallable // (node, msgnode=None, suggested_prefix='')
	set_name_id_map: PyCallable // (node, id, msgnode=None, explicit=None)
	set_duplicate_name_id: PyCallable // (node, id, name, msgnode, explicit)
	has_name: PyCallable // (name)
	note_implicit_target: PyCallable // (target, msgnode=None)
	note_explicit_target: PyCallable // (target, msgnode=None)
	note_refname: PyCallable // (node)
	note_refid: PyCallable // (node)
	note_indirect_target: PyCallable // (target)
	note_anonymous_target: PyCallable // (target)
	note_autofootnote: PyCallable // (footnote)
	note_autofootnote_ref: PyCallable // (ref)
	note_symbol_footnote: PyCallable // (footnote)
	note_symbol_footnote_ref: PyCallable // (ref)
	note_footnote: PyCallable // (footnote)
	note_footnote_ref: PyCallable // (ref)
	note_citation: PyCallable // (citation)
	note_citation_ref: PyCallable // (ref)
	note_substitution_def: PyCallable // (subdef, def_name, msgnode=None)
	note_substitution_ref: PyCallable // (subref, refname)
	note_pending: PyCallable // (pending, priority=None)
	note_parse_message: PyCallable // (message)
	note_transform_message: PyCallable // (message)
	note_source: PyCallable // (source, offset)
	copy: PyCallable // ()
	get_decoration: PyCallable // ()
}

type Inline = FootnoteReference

export interface TextElement extends Element<Inline | TextElement> {
	child_text_separator: string
}

// https://sphinx-docutils.readthedocs.io/en/latest/docutils.nodes.html#docutils.nodes.footnote_reference
export interface FootnoteReference {
	tagname: 'footnote_reference'
}

export async function load(): Promise<{
	pyodide: PyodideInterface
	core: DocutilsCore
}> {
	const pyodide = await loadPyodide({ packages: ['docutils'] })
	const core: DocutilsCore = await pyodide.pyimport('docutils.core')
	return { pyodide, core }
}

export async function publish(source: string, core: DocutilsCore) {
	const document: Document = core.publish_doctree(source)
	return convert(document)
}

function convert(node: Node): Node {
	switch (node?.tagname) {
		case 'document':
		case 'paragraph':
			return { type: 'paragraph', children: node.children.map(convert) }
		case 'literal':
			return { type: 'literal', children: node.children.map(convert) }
		case undefined:
			return node.toString()
		default:
			throw new Error(`Unknown tagname: ${node.tagname}`)
	}
}
console.log(convert(document))
