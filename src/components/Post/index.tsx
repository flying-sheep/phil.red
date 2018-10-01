import * as React from 'react'
import { RouteComponentProps } from 'react-router-dom'

import style from './style.css'

export default function Post({ match }: RouteComponentProps) {
	return <article className={style.c}>{match.url}</article>
}
