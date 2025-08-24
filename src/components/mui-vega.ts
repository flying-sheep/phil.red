import { useTheme } from '@mui/material/styles'
import { useMemo } from 'react'
import type { Config } from 'vega-lite'

export interface MuiVegaThemePreferences {
	color?: 'primary' | 'secondary' | 'error' | 'warning'
	background?: 'transparent' | 'paper' | 'default'
}

/**
 * Get MaterialVegaOptions from the Material UI theme
 */
export function useMuiVegaOptions({
	color = 'primary',
	background = 'transparent',
}: MuiVegaThemePreferences = {}): Config {
	const theme = useTheme()

	return useMemo<Config>(
		() => ({
			font: theme.typography.fontFamily ?? 'sans-serif',
			labelPadding: theme.spacing(1),
			background:
				background === 'transparent'
					? 'transparent'
					: theme.vars.palette.background[background],
			thickDomainLineWidth: 2,
			title: { color: theme.vars.palette.text.primary },
			axis: {
				titleColor: theme.vars.palette.text.primary,
				labelColor: theme.vars.palette.text.secondary,
				tickColor: theme.vars.palette.text.secondary,
				domainColor: theme.vars.palette.divider,
				gridColor: theme.vars.palette.divider,
			},
			legend: {
				titleColor: theme.vars.palette.text.primary,
				labelColor: theme.vars.palette.text.secondary,
			},
			mark: {
				color: theme.vars.palette[color].main,
			},
			/*
			range: {
				category: (['light', 'dark'] as const).flatMap((mode) => [
					theme.vars.palette.primary[mode],
					theme.vars.palette.secondary[mode],
					theme.vars.palette.error[mode],
					theme.vars.palette.warning[mode],
					theme.vars.palette.info[mode],
					theme.vars.palette.success[mode],
				]),
			},
			*/
		}),
		[theme, color, background],
	)
}
