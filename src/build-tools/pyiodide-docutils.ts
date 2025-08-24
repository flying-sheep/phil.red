// https://sphinx-docutils.readthedocs.io/en/latest/docutils.nodes.html#docutils.nodes.Node
// https://sphinx-docutils.readthedocs.io/en/latest/docutils.nodes.html#docutils.nodes.Element

import path from 'node:path'
import { loadPyodide, type PyodideAPI } from 'pyodide'
import type { PyProxy, PyProxyWithGet, PySequence } from 'pyodide/ffi'

export interface Node extends PyProxyWithGet {
	parent: Element | undefined
	tagname?: string
	astext(): string
}

export interface Element extends Node {
	tagname: string
	children: PySequence
}

const python = String.raw

const DIRECTIVE_CODE = python`
from docutils.nodes import Element, General
from docutils.parsers import rst

class VegaElement(General, Element):
	tagname = 'vega'
		
class VegaDirective(rst.Directive):
	has_content = True

	def run(self) -> list[Element]:
		node = VegaElement("".join(self.content))
		node.source, node.line = self.state_machine.get_source_and_line(self.lineno)
		return [node]

rst.directives.register_directive("vega", VegaDirective)
`

export async function load(): Promise<{
	pyodide: PyodideAPI
	core: PyProxy
}> {
	const pyodide = await loadPyodide({
		packages: ['docutils', 'pygments'],
		packageBaseUrl: 'https://cdn.jsdelivr.net/pyodide/v0.28.1/full/',
		packageCacheDir: path.join(import.meta.dirname, '../../.pyodide-cache'),
	})
	const core = await pyodide.pyimport('docutils.core')
	await pyodide.runPython(DIRECTIVE_CODE)
	return { pyodide, core }
}

// https://sphinx-docutils.readthedocs.io/en/latest/docutils.core.html#docutils.core.publish_programmatically
export async function publish(
	source: string,
	path: string | undefined,
	core: PyProxy,
): Promise<Element> {
	return core['publish_doctree'](source, path)
}
