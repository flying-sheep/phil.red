import restructured, { Node } from 'restructured'


export default function rstConvert(code: string): Node {
	return restructured.parse(code)
}
