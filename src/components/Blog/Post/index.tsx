import * as React from 'react'
import { RouteComponentProps } from 'react-router-dom'

import style from './style.css'

export default function Post({ match }: RouteComponentProps<{id: string}>) {
	return <article className={style.c}>{match.params.id}</article>
}
