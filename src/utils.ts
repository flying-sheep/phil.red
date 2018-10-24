export function rsplit(string: string, sep: string, limit: number = Infinity): string[] {
	if (!Number.isFinite(limit)) return string.split(sep)
	let prefix = string
	const suffixes = []
	for (let split = limit - 1; split > 0; split -= 1) {
		const end = prefix.lastIndexOf(sep)
		if (end === -1) break
		suffixes.push(prefix.slice(end + 1))
		prefix = prefix.slice(0, end)
	}
	return [prefix, ...suffixes.reverse()]
}

/* eslint import/prefer-default-export: 0 */
