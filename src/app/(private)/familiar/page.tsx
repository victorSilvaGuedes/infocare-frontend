// Salve como: app/(private)/familiar/page.tsx
// (Versão REATORADA - Com o botão "Associações" unificado)
'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { toast } from 'sonner'
// 1. (ATUALIZADO) Ícones corretos
import { Mail, LogOut, User, BedDouble } from 'lucide-react'
import { Separator } from '@/components/ui/separator'

// Hooks e Componentes
import { useAuthStore } from '@/app/stores/useAuthStore'
import { useAuthReady } from '@/app/hooks/useAuthReady'
import { AppLoader } from '@/components/AppLoader'
import { MenuButton } from '@/components/MenuButton'
import { MenuAction } from '@/components/MenuAction'
import { EditFamiliarDialog } from '@/components/EditFamiliarDialog'

export default function FamiliarPage() {
	const router = useRouter()
	const { logout } = useAuthStore()
	const { ready, usuario } = useAuthReady()

	const [isEditOpen, setIsEditOpen] = useState(false)

	const handleLogout = () => {
		logout()
		toast.success('Você saiu da sua conta.')
		router.replace('/login')
	}

	if (!ready) {
		return <AppLoader />
	}

	return (
		<>
			<div className="flex flex-1 flex-col">
				{/* Cabeçalho de Boas-Vindas */}
				<div className="p-6">
					<h1 className="text-2xl font-bold">Olá, {usuario?.nome}</h1>
					<p className="text-muted-foreground">O que gostaria de fazer hoje?</p>
				</div>

				{/* Lista de Ações (Atualizada) */}
				<div className="flex-1 p-6 pt-0">
					<div className="flex flex-col gap-3">
						<MenuButton
							href="/familiar/internacoes"
							icon={BedDouble}
							label="Internações Associadas"
							description="Ver internações e evoluções de pacientes"
						/>

						{/* 2. (ATUALIZADO) Botão unificado com o nome correto */}
						<MenuButton
							href="/familiar/associacoes" // Aponta para a lista
							icon={Mail}
							label="Minhas Associações"
							description="Ver status e solicitar novos acessos"
						/>

						{/* O botão "Solicitar Associação" (Send) foi removido */}

						{/* Ações de Perfil */}
						<MenuAction
							onClick={() => setIsEditOpen(true)}
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

			{/* Renderizar o Dialog */}
			<EditFamiliarDialog
				open={isEditOpen}
				onOpenChange={setIsEditOpen}
			/>
		</>
	)
}
