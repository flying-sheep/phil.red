const anchor = (title: string): { name: string; anchor: string } => {
	const name = title.toLocaleLowerCase()
	const anchor = name.replaceAll(' ', '-')
	return { name, anchor }
}

export default anchor
