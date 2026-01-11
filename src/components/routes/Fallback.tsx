import type { FC } from 'react'
import { useNavigate, useParams } from 'react-router'

const Fallback: FC<object> = () => {
	const params = useParams<'p'>()
	const navigate = useNavigate()

	navigate(params.p ? decodeURIComponent(params.p) : '/', { replace: true })

	return null
}

export default Fallback
