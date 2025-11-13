// Salve como: app/(private)/profissional/page.tsx
'use client'

import { useState } from 'react' // 1. Importar useState
import { useRouter } from 'next/navigation'
import { toast } from 'sonner'
import { Users, BedDouble, Mail, LogOut, User } from 'lucide-react' // 2. Importar 'User'
import { useAuthStore } from '@/app/stores/useAuthStore'
import { EditProfissionalDialog } from '@/components/EditProfissionalDialog'
import { MenuAction } from '@/components/MenuAction'
import { MenuButton } from '@/components/MenuButton'
import { Separator } from '@/components/ui/separator'

// 4. Importar o novo Dialog

export default function ProfissionalDashboardPage() {
	const { usuario, logout } = useAuthStore()
	const router = useRouter()

	// 5. Estado para controlar o dialog
	const [isEditOpen, setIsEditOpen] = useState(false)

	const handleLogout = () => {
		logout()
		toast.success('Você saiu da sua conta.')
		router.replace('/login')
	}

	return (
		<>
			<div className="flex flex-1 flex-col">
				{/* Cabeçalho de Boas-Vindas */}
				<div className="p-6">
					<h1 className="text-2xl font-bold">Olá, {usuario?.nome}</h1>
					<p className="text-muted-foreground">O que gostaria de fazer hoje?</p>
				</div>

				{/* Lista de Ações */}
				<div className="flex-1 p-6 pt-0">
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

						{/* 6. Botão de Editar Perfil */}
						<MenuAction
							onClick={() => setIsEditOpen(true)} // Abre o dialog
							icon={User}
							label="Editar Perfil"
							description="Atualizar seus dados"
							isDestructive={false}
						/>

						<Separator />

						<MenuAction
							onClick={handleLogout}
							icon={LogOut}
							label="Sair"
							description="Encerrar sua sessão"
							isDestructive={true}
						/>
					</div>
				</div>
			</div>

			{/* 7. Renderizar o Dialog */}
			<EditProfissionalDialog
				open={isEditOpen}
				onOpenChange={setIsEditOpen}
			/>
		</>
	)
}
