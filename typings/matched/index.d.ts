declare module 'matched' {
	import {IOptions} from 'glob'

	namespace glob {
		function sync(patterns: string[], options: IOptions): string[]
	}
	function glob(patterns: string[], options: IOptions): Promise<string[]>
	export = glob
}
