'use client'

import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'
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

			{/* Grid de Ações */}
			<div className="flex-1 p-6 pt-0">
				<div className="grid grid-cols-2 gap-4">
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
				</div>
			</div>

			{/* Botão de Sair */}
			<div className="p-6 pt-0">
				<Button
					variant="outline"
					className="w-full"
					onClick={handleLogout}
				>
					<LogOut className="mr-2 h-4 w-4" />
					Sair
				</Button>
			</div>
		</div>
	)
}

// Componente de Item de Menu
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
			className="h-full"
		>
			<Card className="flex h-full flex-col justify-center p-4 transition-colors hover:bg-muted/50">
				<Icon className="mb-2 h-7 w-7 text-primary" />
				<p className="text-base font-semibold">{label}</p>
				<p className="text-xs text-muted-foreground">{description}</p>
			</Card>
		</Link>
	)
}
