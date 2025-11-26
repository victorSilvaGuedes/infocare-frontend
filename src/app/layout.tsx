// app/layout.tsx
import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'
import { cn } from '@/lib/utils'
import Providers from './providers'

// 1. Importe o Toaster do Sonner (estilizado pelo Shadcn)
import { Toaster } from '@/components/ui/sonner'
import { ThemeProvider } from '@/components/theme-provider'
import {
	Card,
	CardContent,
	CardDescription,
	CardHeader,
	CardTitle,
} from '@/components/ui/card'
import Image from 'next/image'
import { ModeToggle } from '@/components/toggleTheme'

const inter = Inter({ subsets: ['latin'], variable: '--font-sans' })

export const metadata: Metadata = {
	title: 'InfoCare',
	description: 'Aplicativo para gestão de informações de saúde',
}

export default function RootLayout({
	children,
}: Readonly<{
	children: React.ReactNode
}>) {
	return (
		<html
			lang="pt-BR"
			suppressHydrationWarning
		>
			<head />
			<body
				className={cn(
					'min-h-screen bg-background font-sans antialiased',
					inter.variable
				)}
			>
				<ThemeProvider
					attribute="class"
					defaultTheme="system"
					enableSystem
					disableTransitionOnChange
				>
					<Providers>
						<div className="relative mx-auto flex w-full min-h-screen max-w-md flex-col bg-background">
							<div className="fixed top-4 right-4 hidden lg:block">
								<ModeToggle />
							</div>
							{children}
							<Card className="fixed bottom-6 left-6 hidden w-[320px] shadow-2xl border-muted-foreground/20 lg:block z-50">
								<CardHeader className="pb-2">
									<CardTitle className="text-lg">Acesso Mobile</CardTitle>
									<CardDescription className="text-sm">
										Escaneie para testar no celular:
									</CardDescription>
								</CardHeader>
								<CardContent className="flex flex-col gap-4">
									{/* QR Code e Texto lado a lado ou empilhado (aqui empilhado para caber no canto) */}
									<div className="flex justify-center w-fit mx-auto">
										{/* Certifique-se que o arquivo existe em public/qrcode.png */}
										<Image
											src="/qrcode.png"
											alt="QR Code"
											width={120}
											height={120}
											className="object-contain"
										/>
									</div>

									{/* Credenciais */}
									<div className="space-y-2 rounded-md bg-muted/50 p-3 text-sm">
										<p className="font-semibold text-primary mb-2">
											Credenciais de Teste (Profissional)
										</p>

										<div>
											<span className="font-semibold text-muted-foreground block">
												Email:
											</span>
											<code className="block w-full rounded border bg-background px-2 py-1 font-mono select-all">
												profissional.teste@hospital.com
											</code>
										</div>

										<div>
											<span className="font-semibold text-muted-foreground block">
												Senha:
											</span>
											<code className="block w-full rounded border bg-background px-2 py-1 font-mono select-all">
												medicosenha123
											</code>
										</div>
									</div>
								</CardContent>
							</Card>
						</div>
						<Toaster
							richColors
							closeButton
						/>
					</Providers>
				</ThemeProvider>
			</body>
		</html>
	)
}
