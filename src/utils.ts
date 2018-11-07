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

export function partition<I>(array: I[], pred: (item: I) => boolean): [I[], I[]] {
	const a: I[] = []
	const b: I[] = []
	for (const element of array) {
		(pred ? a : b).push(element)
	}
	return [a, b]
}

export function notEmpty<TValue>(value: TValue | null | undefined): value is TValue {
	return value !== null && value !== undefined
}
