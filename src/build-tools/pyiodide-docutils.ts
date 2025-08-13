// https://sphinx-docutils.readthedocs.io/en/latest/docutils.nodes.html#docutils.nodes.Node
// https://sphinx-docutils.readthedocs.io/en/latest/docutils.nodes.html#docutils.nodes.Element

import { loadPyodide, type PyodideAPI } from 'pyodide'
import type { PyProxy, PyProxyWithGet } from 'pyodide/ffi'

export async function load(): Promise<{
	pyodide: PyodideAPI
	core: PyProxy
}> {
	const pyodide = await loadPyodide({
		packages: ['docutils'],
		packageBaseUrl: 'https://cdn.jsdelivr.net/pyodide/v0.28.1/full/',
	})

	await pyodide.runPython(`
		from docutils.nodes import Element, General
		from docutils.parsers import rst
		
		class PlotlyElement(General, Element):
			tagname = 'plotly'
				
		class PlotlyDirective(rst.Directive):
			required_arguments = 1
			option_spec = dict(href=rst.directives.uri)

			def run(self):
				node = PlotlyElement(self.content)
				node.source, node.line = self.state_machine.get_source_and_line(self.lineno)
		
		rst.directives.register_directive("plotly", PlotlyDirective)
	`)

	const core = await pyodide.pyimport('docutils.core')
	return { pyodide, core }
}

// https://sphinx-docutils.readthedocs.io/en/latest/docutils.core.html#docutils.core.publish_programmatically
export async function publish(
	source: string,
	path: string | undefined,
	core: PyProxy,
): Promise<PyProxyWithGet> {
	return core['publish_doctree'](source, path)
}
