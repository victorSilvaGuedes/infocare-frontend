// Crie este arquivo: app/components/AppLoader.tsx
import { Loader2 } from 'lucide-react'

export function AppLoader() {
	return (
		<div className="flex min-h-screen flex-1 flex-col items-center justify-center">
			{/* O 'animate-spin' é uma classe utilitária do Tailwind */}
			<Loader2 className="h-8 w-8 animate-spin text-primary" />
			<p className="mt-2 text-muted-foreground">Carregando...</p>
		</div>
	)
}
