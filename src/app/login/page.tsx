// app/login/page.tsx
import { LoginForm } from './LoginForm' // Importamos nosso componente

export default function LoginPage() {
	return (
		<main className="flex min-h-screen flex-1 flex-col items-center justify-center p-6">
			<LoginForm />
		</main>
	)
}
