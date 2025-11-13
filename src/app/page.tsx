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
		<main className="flex min-h-screen flex-col items-center justify-center p-6">
			<Card className="w-full max-w-sm text-center">
				<CardHeader>
					<Image
						src="/logo.png"
						alt="Logo InfoCare"
						width={100}
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
					<Button asChild size="lg" className="w-full">
						<Link href="/login">Começar</Link>
					</Button>
				</CardFooter>
			</Card>
		</main>
	)
}
