// this is https://github.com/vega/react-vega/pull/613

import deepEqual from 'fast-deep-equal'
import React from 'react'
import type { EmbedOptions, Result, VisualizationSpec } from 'vega-embed'

export type UseVegaEmbedParams = {
	ref: React.RefObject<HTMLDivElement | null>
	spec: VisualizationSpec
	options?: EmbedOptions | undefined
	onEmbed?: ((result: Result) => void) | undefined
	onError?: ((error: unknown) => void) | undefined
}

export function useVegaEmbed(params: UseVegaEmbedParams): Result | null {
	const [result, setResult] = React.useState<Result | null>(null)

	const { ref, spec, onEmbed, onError, options = {} } = params

	useDeepEffect(() => {
		let cancel = false
		let currentResult: Result | null = null

		const createView = async () => {
			if (!ref.current || cancel) return
			const embed = (await import('vega-embed')).default
			try {
				currentResult = await embed(ref.current, spec, options)

				if (cancel) {
					currentResult.finalize()
					return
				}

				setResult(currentResult)

				onEmbed?.(currentResult)
			} catch (error) {
				console.error(`[react-vega] Error creating view: ${error}`)
				onError?.(error)
			}
		}

		createView()
		return () => {
			cancel = true
			currentResult?.finalize()
		}
	}, [spec, options])

	return result
}

function useDeepEffect(
	effect: React.EffectCallback,
	deps: React.DependencyList,
) {
	const ref = React.useRef<React.DependencyList | null>(null)
	const signalRef = React.useRef<number>(0)
	if (!ref.current || !deepEqual(deps, ref.current)) {
		signalRef.current += 1
	}
	ref.current = deps
	// biome-ignore lint/correctness/useExhaustiveDependencies: nah that tracks
	React.useEffect(effect, [signalRef.current])
}

export type VegaEmbedProps = Omit<UseVegaEmbedParams, 'ref'> &
	React.HTMLAttributes<HTMLDivElement>

export const VegaEmbed = React.forwardRef<HTMLDivElement, VegaEmbedProps>(
	(props, forwardedRef) => {
		const { spec, options, onEmbed, onError, ...divProps } = props

		const ref = React.useRef<HTMLDivElement>(null)

		React.useImperativeHandle(forwardedRef, () => {
			if (!ref.current) {
				throw new Error('VegaEmbed: ref is not attached to a div element')
			}
			return ref.current
		}, [])

		useVegaEmbed({ ref, spec, options, onEmbed, onError })

		return <div ref={ref} {...divProps} />
	},
)

VegaEmbed.displayName = 'VegaEmbed'
