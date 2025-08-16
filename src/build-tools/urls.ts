export const get = (pkg: string, ver: string, file: string) =>
	`https://cdnjs.cloudflare.com/ajax/libs/${pkg}/${ver}/${file}`
export const prism = (file: string) => get('prism', '1.30.0', file)
