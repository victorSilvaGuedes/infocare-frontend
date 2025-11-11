// app/layout.tsx
import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'
import { cn } from '@/lib/utils'
import Providers from './providers'

// 1. Importe o Toaster do Sonner (estilizado pelo Shadcn)
import { Toaster } from '@/components/ui/sonner'
import { ThemeProvider } from '@/components/theme-provider'

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
							{/* <div className="fixed top-4 right-4">
								<ModeToggle />
							</div> */}
							{children}
						</div>

						{/* 2. Adicione o Toaster aqui (fora do div principal) 
              Ele funcionará globalmente.
              Usamos 'richColors' para estilos mais bonitos de sucesso/erro.
          */}
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
