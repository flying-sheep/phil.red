import LinkIcon from '@mui/icons-material/Link'
import IconButton from '@mui/material/IconButton'
import { useSnackbar } from 'notistack'
import { type FC, useCallback } from 'react'

type CopySectionLinkButtonProps = {
	anchor: string
	size: 'small' | 'medium' | 'large'
}

const CopySectionLinkButton: FC<CopySectionLinkButtonProps> = ({
	anchor,
	size = 'medium',
}) => {
	const url = new URL(window.location.href)
	url.hash = anchor

	const { enqueueSnackbar } = useSnackbar()
	const copy = useCallback(() => {
		navigator.clipboard.writeText(url.href)
		enqueueSnackbar(`Copied section link to #${anchor}`, { variant: 'info' })
	}, [url.href, anchor, enqueueSnackbar])

	return (
		<IconButton
			onClick={copy}
			aria-label="copy section link"
			sx={{ ml: 1 }}
			size={size}
		>
			<LinkIcon />
		</IconButton>
	)
}

export default CopySectionLinkButton
