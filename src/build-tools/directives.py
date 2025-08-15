from docutils.nodes import Element, General
from docutils.parsers import rst

class PlotlyElement(General, Element):
	tagname = 'plotly'
		
class PlotlyDirective(rst.Directive):
	required_arguments = 1
	option_spec = dict(href=rst.directives.uri)

	def run(self) -> list[Element]:
		node = PlotlyElement(self.content)
		node['url'] = self.arguments[0]
		node['href'] = self.options['href']
		node.source, node.line = self.state_machine.get_source_and_line(self.lineno)
		return [node]

rst.directives.register_directive("plotly", PlotlyDirective)
