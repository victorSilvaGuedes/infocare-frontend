'use client'

import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { toast } from 'sonner'
import { Card } from '@/components/ui/card'
import { Users, BedDouble, Mail, LogOut } from 'lucide-react'

import { useAuthStore } from '@/app/stores/useAuthStore'

export default function ProfissionalDashboardPage() {
	const { usuario, logout } = useAuthStore()
	const router = useRouter()

	const handleLogout = () => {
		logout()
		toast.success('Você saiu da sua conta.')
		router.replace('/login')
	}

	return (
		<div className="flex flex-1 flex-col">
			{/* Cabeçalho de Boas-Vindas */}
			<div className="p-6">
				<h1 className="text-2xl font-bold">Olá, {usuario?.nome}</h1>
				<p className="text-muted-foreground">O que gostaria de fazer hoje?</p>
			</div>

			{/* [MUDANÇA] Grid de Ações agora é uma Lista Vertical */}
			<div className="flex-1 p-6 pt-0">
				{/* Trocado grid grid-cols-2 gap-4 por flex flex-col gap-3 */}
				<div className="flex flex-col gap-3">
					<MenuButton
						href="/profissional/pacientes"
						icon={Users}
						label="Pacientes"
						description="Visualizar e gerenciar pacientes"
					/>

					<MenuButton
						href="/profissional/internacoes"
						icon={BedDouble}
						label="Internações"
						description="Visualizar e gerenciar internações"
					/>

					<MenuButton
						href="/profissional/associacoes"
						icon={Mail}
						label="Associações"
						description="Revisar solicitações"
					/>

					<MenuAction
						onClick={handleLogout}
						icon={LogOut}
						label="Sair"
						description="Encerrar sua sessão"
					/>
				</div>
			</div>
		</div>
	)
}

// --- Componentes de Item de Menu (Atualizados para Lista) ---

interface MenuButtonProps {
	href: string
	icon: React.ElementType
	label: string
	description: string
}

function MenuButton({ href, icon: Icon, label, description }: MenuButtonProps) {
	return (
		<Link
			href={href}
			passHref
		>
			{/* [MUDANÇA] Layout interno agora é flex-row (horizontal) */}
			<Card className="flex flex-row items-center gap-4 p-4 transition-colors hover:bg-muted/50">
				<Icon className="h-7 w-7 text-primary" />
				{/* Adicionado um div para agrupar o texto verticalmente */}
				<div>
					<p className="text-base font-semibold">{label}</p>
					<p className="text-xs text-muted-foreground">{description}</p>
				</div>
			</Card>
		</Link>
	)
}

interface MenuActionProps {
	onClick: () => void
	icon: React.ElementType
	label: string
	description: string
}

function MenuAction({
	onClick,
	icon: Icon,
	label,
	description,
}: MenuActionProps) {
	return (
		<button
			onClick={onClick}
			className="w-full text-left"
		>
			{/* [MUDANÇA] Layout interno agora é flex-row (horizontal) */}
			<Card className="flex flex-row items-center gap-4 p-4 transition-colors hover:bg-muted/50">
				<Icon className="h-7 w-7 text-destructive" />
				{/* Adicionado um div para agrupar o texto verticalmente */}
				<div>
					<p className="text-base font-semibold">{label}</p>
					<p className="text-xs text-muted-foreground">{description}</p>
				</div>
			</Card>
		</button>
	)
}
