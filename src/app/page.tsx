// app/page.tsx
import Link from 'next/link'
import Image from 'next/image'

import { Button } from '@/components/ui/button'
import {
	Card,
	CardContent,
	CardDescription,
	CardFooter,
	CardHeader,
	CardTitle,
} from '@/components/ui/card'

export default function Home() {
	return (
		// Fundo da página que centraliza o Card
		<main className="flex min-h-screen flex-col items-center justify-center">
			{/* O Card limita o conteúdo e dá a borda */}
			<Card className="w-full max-w-sm text-center p-4">
				<CardHeader>
					<Image
						src="/logo.png" // Verifique o caminho do seu logo na pasta /public
						alt="Logo InfoCare"
						width={100} // Tamanho menor para o card
						height={100}
						className="mx-auto mb-4"
					/>
					<CardTitle>Bem-vindo(a) ao InfoCare</CardTitle>
					<CardDescription>Acompanhe quem você ama.</CardDescription>
				</CardHeader>

				<CardContent>
					<p className="text-sm text-muted-foreground">
						Uma plataforma intuitiva para facilitar a comunicação sobre a
						evolução clínica de seus entes queridos.
					</p>
				</CardContent>

				<CardFooter>
					<Button
						asChild
						size="lg"
						className="w-full"
					>
						<Link href="/login">Começar</Link>
					</Button>
				</CardFooter>
			</Card>
		</main>
	)
}
