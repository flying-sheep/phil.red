import '@testing-library/jest-dom'
import { render, screen } from '@testing-library/react'
import App from '../src/components/App'

describe('App', () => {
	it('renders', async () => {
		render(<App/>)
		await screen.findByRole('heading')
		expect(screen.getByRole('heading')).toHaveTextContent('hello there')
	})
})
