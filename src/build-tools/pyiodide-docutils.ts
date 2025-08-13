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
