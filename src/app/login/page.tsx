// Salve como: app/login/page.tsx
import Image from 'next/image'
import { LoginForm } from './LoginForm'
import {
	Card,
	CardContent,
	CardDescription,
	CardHeader,
	CardTitle,
} from '@/components/ui/card'

export default function LoginPage() {
	return (
		<main className="relative flex min-h-screen flex-1 flex-col items-center justify-center p-6 bg-background">
			{/* Formulário de Login (Centralizado) */}
			<div className="w-full max-w-sm">
				<LoginForm />
			</div>

			{/* Card Flutuante (Fixo no canto inferior direito) 
        - fixed: Tira do fluxo normal e fixa na tela
        - bottom-6 right-6: Posiciona no canto
        - hidden md:block: Esconde no mobile, mostra no desktop
        - z-50: Garante que fique sobre outros elementos se necessário
      */}
			<Card className="fixed bottom-6 right-6 hidden w-[320px] shadow-2xl border-muted-foreground/20 lg:block z-50">
				<CardHeader className="pb-2">
					<CardTitle className="text-lg">Acesso Mobile</CardTitle>
					<CardDescription className="text-sm">
						Escaneie para testar no celular:
					</CardDescription>
				</CardHeader>
				<CardContent className="flex flex-col gap-4">
					{/* QR Code e Texto lado a lado ou empilhado (aqui empilhado para caber no canto) */}
					<div className="flex justify-center bg-white p-1 rounded-lg border w-fit mx-auto">
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
		</main>
	)
}
