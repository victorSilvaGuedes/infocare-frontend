// Salve em: app/(private)/profissional/pacientes/page.tsx
// (Versão REATORADA com o Link de Pesquisa CORRETO)
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
	Dialog,
	DialogContent,
	DialogDescription,
	DialogHeader,
	DialogTitle,
} from '@/components/ui/dialog'
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
	Edit,
	Trash2,
	BedDouble,
	SquareMousePointer, // Ícone para "Internações"
} from 'lucide-react'
import { Badge } from '@/components/ui/badge'

export default function PacientesPage() {
	// 1. Hooks de Dados
	const { data: pacientes, isLoading, isError, error } = usePacientes()
	const { mutate: deletePaciente, isPending: isDeleting } = useDeletePaciente()

	// 2. Estados de UI
	const [isCreateOpen, setCreateOpen] = useState(false)
	const [isEditOpen, setIsEditOpen] = useState(false)
	const [isDeleteOpen, setIsDeleteOpen] = useState(false)
	const [isActionsOpen, setIsActionsOpen] = useState(false)

	const [selectedPaciente, setSelectedPaciente] = useState<Paciente | null>(
		null
	)

	// 3. Funções de Ação
	const handleOpenActions = (paciente: Paciente) => {
		setSelectedPaciente(paciente)
		setIsActionsOpen(true)
	}

	const handleCloseDialogs = () => {
		setSelectedPaciente(null)
		setIsActionsOpen(false)
		setIsEditOpen(false)
		setIsDeleteOpen(false)
	}

	const handleOpenEdit = () => {
		setIsActionsOpen(false)
		setIsEditOpen(true)
	}

	const handleOpenDelete = () => {
		setIsActionsOpen(false)
		setIsDeleteOpen(true)
	}

	const handleDelete = () => {
		if (selectedPaciente) {
			deletePaciente(selectedPaciente.id, {
				onSuccess: () => {
					handleCloseDialogs()
				},
			})
		}
	}

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
							<Card
								key={paciente.id}
								className="cursor-pointer transition-colors hover:bg-muted/50"
								onClick={() => handleOpenActions(paciente)}
							>
								<CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
									<CardTitle className="text-lg font-medium">
										{paciente.nome}
									</CardTitle>
									<Badge className="bg-blue-600 text-white">
										ID: {paciente.id}
									</Badge>
								</CardHeader>
								<CardContent className="space-y-1 flex flex-row items-center justify-between">
									<div>
										<p className="text-sm text-muted-foreground">
											<span className="font-medium">CPF:</span> {paciente.cpf}
										</p>
										<p className="text-sm text-muted-foreground">
											<span className="font-medium">Nascimento:</span>{' '}
											{formatData(paciente.dataNascimento)}
										</p>
										<p className="text-sm text-muted-foreground">
											<span className="font-medium">Telefone:</span>{' '}
											{paciente.telefone || 'N/A'}
										</p>
										<p className="text-sm text-muted-foreground">
											<span className="font-medium">Sangue:</span>{' '}
											{paciente.tipoSanguineo || 'N/A'}
										</p>
									</div>
									<SquareMousePointer className="text-muted-foreground" />
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

			{/* 2. (ATUALIZADO) Dialog de Ações */}
			<Dialog
				open={isActionsOpen}
				onOpenChange={handleCloseDialogs}
			>
				<DialogContent>
					<DialogHeader>
						<DialogTitle>{selectedPaciente?.nome}</DialogTitle>
						<DialogDescription>
							Selecione uma ação para este paciente.
						</DialogDescription>
					</DialogHeader>
					<div className="grid grid-cols-1 gap-4 py-4">
						{/* ========================================================== */}
						{/* (A CORREÇÃO ESTÁ AQUI)                                   */}
						{/* Aponta para /internacoes e passa o nome como 'search'     */}
						{/* ========================================================== */}
						<Button
							variant="outline"
							asChild
						>
							<Link
								href={`/profissional/internacoes?search=${encodeURIComponent(
									selectedPaciente?.nome || ''
								)}`}
							>
								<BedDouble className="mr-2 h-4 w-4" />
								Ver Histórico de Internações
							</Link>
						</Button>
						{/* ========================================================== */}

						{/* (CORREÇÃO DE ESTILO) Usando 'outline' para consistência */}
						<Button
							variant="default"
							onClick={handleOpenEdit}
						>
							<Edit className="mr-2 h-4 w-4" />
							Editar Dados
						</Button>

						{/* (CORREÇÃO DE ESTILO) Usando 'destructive' para consistência */}
						<Button
							variant="default"
							onClick={handleOpenDelete}
							className="bg-red-500 hover:bg-red-600 focus:bg-red-600 text-white"
						>
							<Trash2 className="mr-2 h-4 w-4" />
							Excluir Paciente
						</Button>
					</div>
				</DialogContent>
			</Dialog>

			{/* 3. Dialog de Confirmação de Exclusão */}
			<AlertDialog
				open={isDeleteOpen}
				onOpenChange={handleCloseDialogs}
			>
				<AlertDialogContent>
					<AlertDialogHeader>
						<AlertDialogTitle>Tem certeza absoluta?</AlertDialogTitle>
						<AlertDialogDescription>
							<div className="flex flex-col gap-2">
								<span>
									Esta ação <b>não pode</b> ser desfeita.
								</span>
								<span>
									Isso excluirá permanentemente o paciente{' '}
									<b>{selectedPaciente?.nome}</b> e todo o seu histórico
									(internações, evoluções).
								</span>
							</div>
						</AlertDialogDescription>
					</AlertDialogHeader>
					<AlertDialogFooter>
						<AlertDialogCancel disabled={isDeleting}>
							Cancelar
						</AlertDialogCancel>
						<AlertDialogAction
							onClick={handleDelete}
							disabled={isDeleting}
							className="bg-red-500 hover:bg-red-600 focus:bg-red-600 text-white"
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
				onOpenChange={handleCloseDialogs}
			/>
		</>
	)
}
