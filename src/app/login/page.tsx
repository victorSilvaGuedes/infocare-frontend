// Salve como: app/login/page.tsx
import { LoginForm } from './LoginForm'

export default function LoginPage() {
	return (
		<main className="relative flex min-h-screen flex-1 flex-col items-center justify-center p-6 bg-background">
			{/* Formulário de Login (Centralizado) */}
			<div className="w-full max-w-sm">
				<LoginForm />
			</div>
		</main>
	)
}
