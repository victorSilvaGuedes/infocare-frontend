// Salve em: app/(private)/profissional/pacientes/page.tsx
'use client'

import { useState } from 'react'
import Link from 'next/link'
import { Paciente } from '@/lib/types'
import {
	usePacientes,
	useDeletePaciente,
} from '@/app/queries/pacientes.queries'

// Componentes
import { AppLoader } from '@/components/AppLoader'
import { CreatePacienteDialog } from '@/components/CreatePacienteDialog'
import { EditPacienteDialog } from '@/components/EditPacienteDialog'

// UI
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import {
	AlertDialog,
	AlertDialogAction,
	AlertDialogCancel,
	AlertDialogContent,
	AlertDialogDescription,
	AlertDialogFooter,
	AlertDialogHeader,
	AlertDialogTitle,
} from '@/components/ui/alert-dialog'
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'
import {
	ArrowLeft,
	UserPlus,
	AlertTriangle,
	User,
	Edit,
	Trash2,
} from 'lucide-react'
import { Badge } from '@/components/ui/badge'

export default function PacientesPage() {
	// 1. Hooks de Dados
	const { data: pacientes, isLoading, isError, error } = usePacientes()
	const { mutate: deletePaciente, isPending: isDeleting } = useDeletePaciente()

	// 2. Estados de UI (Gerenciamento dos Modais)
	const [isCreateOpen, setCreateOpen] = useState(false)
	const [isEditOpen, setIsEditOpen] = useState(false)
	const [isDeleteOpen, setDeleteOpen] = useState(false)

	// O 'selectedPaciente' agora é setado no momento do clique no botão de ação
	const [selectedPaciente, setSelectedPaciente] = useState<Paciente | null>(
		null
	)

	// 3. Funções de Ação (Simplificadas)
	const handleCloseActions = () => {
		setSelectedPaciente(null)
	}

	// [NOVO] Handler para abrir o Dialog de Edição
	const handleOpenEdit = (paciente: Paciente) => {
		setSelectedPaciente(paciente)
		setIsEditOpen(true)
	}

	// [NOVO] Handler para abrir o Dialog de Exclusão
	const handleOpenDelete = (paciente: Paciente) => {
		setSelectedPaciente(paciente)
		setDeleteOpen(true)
	}

	const handleDelete = () => {
		if (selectedPaciente) {
			deletePaciente(selectedPaciente.id, {
				onSuccess: () => {
					setDeleteOpen(false)
					handleCloseActions()
				},
			})
		}
	}

	// Helper para formatar data
	const formatData = (dateString: string) => {
		return new Date(dateString).toLocaleDateString('pt-BR', { timeZone: 'UTC' })
	}

	// 4. Renderização (Loading / Erro)
	if (isLoading) {
		return <AppLoader />
	}

	if (isError) {
		return (
			<div className="flex flex-1 items-center justify-center p-6">
				<Alert
					variant="destructive"
					className="max-w-md"
				>
					<AlertTriangle className="h-4 w-4" />
					<AlertTitle>Erro ao carregar pacientes</AlertTitle>
					<AlertDescription>{error?.message}</AlertDescription>
				</Alert>
			</div>
		)
	}

	// 5. Renderização (Sucesso)
	return (
		<>
			<div className="flex flex-1 flex-col">
				{/* --- Header --- */}
				<div className="flex items-center justify-between p-6">
					<Button
						variant="ghost"
						size="icon"
						asChild
					>
						<Link href="/profissional">
							<ArrowLeft className="h-5 w-5" />
						</Link>
					</Button>
					<h1 className="text-xl font-bold">Pacientes</h1>
					<Button
						variant="default"
						size="icon"
						onClick={() => setCreateOpen(true)}
					>
						<UserPlus className="h-5 w-5" />
					</Button>
				</div>

				{/* --- Lista de Pacientes --- */}
				<div className="flex-1 space-y-4 px-6 pb-6">
					{pacientes && pacientes.length === 0 && (
						<div className="flex flex-1 flex-col items-center justify-center rounded-md border border-dashed p-8 text-center">
							<p className="text-muted-foreground">
								Nenhum paciente cadastrado.
							</p>
						</div>
					)}

					{pacientes &&
						pacientes.map((paciente) => (
							<Card key={paciente.id}>
								<CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
									<CardTitle className="text-lg font-medium">
										{paciente.nome}
									</CardTitle>
									<Badge className="bg-blue-600 text-white">
										ID: {paciente.id}
									</Badge>
								</CardHeader>
								<CardContent className="space-y-1 flex justify-between items-center">
									<div>
										<p className="text-sm text-muted-foreground">
											CPF: {paciente.cpf}
										</p>
										<p className="text-sm text-muted-foreground">
											Nascimento: {formatData(paciente.dataNascimento)}
										</p>
										<p className="text-sm text-muted-foreground">
											Tel: {paciente.telefone || 'N/A'}
										</p>
										<p className="text-sm text-muted-foreground">
											Sangue: {paciente.tipoSanguineo || 'N/A'}
										</p>
									</div>

									<div className="flex gap-4">
										<Button
											variant="ghost"
											size="icon"
											onClick={() => handleOpenEdit(paciente)}
										>
											<Edit />
											<span className="sr-only">Editar</span>
										</Button>
										<Button
											variant="ghost"
											size="icon"
											className="text-destructive hover:text-destructive"
											onClick={() => handleOpenDelete(paciente)}
										>
											<Trash2 />
											<span className="sr-only">Excluir</span>
										</Button>
									</div>
									{/* --- Fim dos Botões de Ação --- */}
								</CardContent>
							</Card>
						))}
				</div>
			</div>

			{/* --- Dialogs (Modais) --- */}

			{/* 1. Dialog de Criar Paciente */}
			<CreatePacienteDialog
				open={isCreateOpen}
				onOpenChange={setCreateOpen}
			/>

			{/* 2. [REMOVIDO] O Dialog de Ações não é mais necessário */}

			{/* 3. Dialog de Confirmação de Exclusão */}
			<AlertDialog
				open={isDeleteOpen}
				onOpenChange={(isOpen) => {
					setDeleteOpen(isOpen)
					if (!isOpen) {
						handleCloseActions()
					}
				}}
			>
				<AlertDialogContent>
					<AlertDialogHeader>
						<AlertDialogTitle>Tem certeza absoluta?</AlertDialogTitle>
						<AlertDialogDescription>
							<p>
								Esta ação <b>não pode</b> ser desfeita.
							</p>
							<p>
								Isso excluirá permanentemente o paciente{' '}
								<b>{selectedPaciente?.nome}</b> e todo o seu histórico
								(internações, evoluções).
							</p>
						</AlertDialogDescription>
					</AlertDialogHeader>
					<AlertDialogFooter>
						<AlertDialogCancel disabled={isDeleting}>
							Cancelar
						</AlertDialogCancel>
						<AlertDialogAction
							onClick={handleDelete}
							disabled={isDeleting}
						>
							{isDeleting ? 'Excluindo...' : 'Sim, excluir'}
						</AlertDialogAction>
					</AlertDialogFooter>
				</AlertDialogContent>
			</AlertDialog>

			{/* 4. Dialog de Edição */}
			<EditPacienteDialog
				open={isEditOpen}
				pacienteId={selectedPaciente?.id || null}
				onOpenChange={(isOpen) => {
					setIsEditOpen(isOpen)
					if (!isOpen) {
						handleCloseActions() // Reseta o paciente selecionado
					}
				}}
			/>
		</>
	)
}
