// Salve como: app/(private)/profissional/associacoes/page.tsx
// (Versão CORRIGIDA - usando lowercase enums)
'use client'

// Imports do React
import { useState } from 'react'
import Link from 'next/link'

// Hooks de dados
import {
	useGetAssociacoes,
	useAprovarAssociacao,
	useRejeitarAssociacao,
	AssociacaoComRelacoes,
	StatusAssociacao,
} from '@/app/queries/associacao.queries'

// Componentes
import { AppLoader } from '@/components/AppLoader'

// UI
import { Button } from '@/components/ui/button'
import {
	Card,
	CardContent,
	CardDescription,
	CardHeader,
	CardTitle,
} from '@/components/ui/card'
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'
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
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group'
import { Label } from '@/components/ui/label'
import { ArrowLeft, AlertTriangle, Check, X } from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { cn } from '@/lib/utils'

// Tipo para o filtro de status (Corrigido)
type StatusFilter = StatusAssociacao | 'TODAS'

export default function AssociacoesPage() {
	// --- Filtro de status (Corrigido para 'pendente') ---
	const [statusFilter, setStatusFilter] = useState<StatusFilter>('pendente')

	// --- Hooks de dados ---
	const {
		data: associacoes,
		isLoading,
		isError,
		error,
	} = useGetAssociacoes({ status: statusFilter })

	// --- Hooks de mutação ---
	const { mutate: aprovar, isPending: isAprovando } = useAprovarAssociacao()
	const { mutate: rejeitar, isPending: isRejeitando } = useRejeitarAssociacao()

	// --- Estados de UI ---
	const [isActionsOpen, setIsActionsOpen] = useState(false)
	const [isAprovarOpen, setIsAprovarOpen] = useState(false)
	const [isRejeitarOpen, setIsRejeitarOpen] = useState(false)
	const [selectedAssociacao, setSelectedAssociacao] =
		useState<AssociacaoComRelacoes | null>(null)

	// --- Funções auxiliares ---
	const handleOpenActions = (associacao: AssociacaoComRelacoes) => {
		setSelectedAssociacao(associacao)
		setIsActionsOpen(true)
	}
	const handleOpenAprovar = () => {
		setIsActionsOpen(false)
		setIsAprovarOpen(true)
	}
	const handleOpenRejeitar = () => {
		setIsActionsOpen(false)
		setIsRejeitarOpen(true)
	}
	const handleCloseDialogs = () => {
		setSelectedAssociacao(null)
		setIsActionsOpen(false)
		setIsAprovarOpen(false)
		setIsRejeitarOpen(false)
	}
	const handleConfirmarAprovar = () => {
		if (selectedAssociacao) {
			aprovar(selectedAssociacao.id, { onSuccess: handleCloseDialogs })
		}
	}
	const handleConfirmarRejeitar = () => {
		if (selectedAssociacao) {
			rejeitar(selectedAssociacao.id, { onSuccess: handleCloseDialogs })
		}
	}
	const formatData = (dateString: string) => {
		if (!dateString) return 'N/A'
		return new Date(dateString).toLocaleDateString('pt-BR', {
			timeZone: 'UTC',
			day: '2-digit',
			month: '2-digit',
			year: 'numeric',
			hour: '2-digit',
			minute: '2-digit',
		})
	}

	// --- Estados de carregamento e erro ---
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
					<AlertTitle>Erro ao carregar solicitações</AlertTitle>
					<AlertDescription>{error?.message}</AlertDescription>
				</Alert>
			</div>
		)
	}

	// --- Renderização principal ---
	return (
		<>
			<div className="flex flex-1 flex-col">
				{/* Header */}
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
					<h1 className="text-xl font-bold">Solicitações</h1>
					<div className="w-9"></div> {/* Espaçador */}
				</div>

				{/* Filtros (Corrigido para lowercase) */}
				<div className="px-6 pb-4">
					<RadioGroup
						value={statusFilter}
						onValueChange={(value: StatusFilter) => setStatusFilter(value)}
						className="flex flex-wrap items-center gap-x-4 gap-y-2"
					>
						<div className="flex items-center space-x-2">
							<RadioGroupItem
								value="pendente"
								id="r-pendente"
							/>
							<Label htmlFor="r-pendente">Pendentes</Label>
						</div>
						<div className="flex items-center space-x-2">
							<RadioGroupItem
								value="aprovada"
								id="r-aprovada"
							/>
							<Label htmlFor="r-aprovada">Aprovadas</Label>
						</div>
						<div className="flex items-center space-x-2">
							<RadioGroupItem
								value="rejeitada"
								id="r-rejeitada"
							/>
							<Label htmlFor="r-rejeitada">Rejeitadas</Label>
						</div>
						<div className="flex items-center space-x-2">
							<RadioGroupItem
								value="TODAS"
								id="r-todas"
							/>
							<Label htmlFor="r-todas">Todas</Label>
						</div>
					</RadioGroup>
				</div>

				{/* Lista de Solicitações (Corrigido para lowercase) */}
				<div className="flex-1 space-y-4 px-6 pb-6">
					{associacoes && associacoes.length === 0 ? (
						<div className="flex flex-1 flex-col items-center justify-center rounded-md border border-dashed p-8 text-center">
							<p className="text-muted-foreground">
								Nenhuma solicitação
								{statusFilter !== 'TODAS' &&
									` ${statusFilter.toLowerCase()}`}{' '}
								encontrada.
							</p>
						</div>
					) : (
						associacoes?.map((associacao) => (
							<Card
								key={associacao.id}
								className="cursor-pointer transition-colors hover:bg-muted/50"
								onClick={() => handleOpenActions(associacao)}
							>
								<CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
									<CardTitle className="text-lg font-medium">
										{associacao.familiar.nome}
									</CardTitle>
									<Badge
										variant={
											associacao.status === 'aprovada'
												? 'default'
												: associacao.status === 'rejeitada' // Corrigido
												? 'destructive'
												: 'secondary'
										}
										className={cn(
											associacao.status === 'pendente' && // Corrigido
												'bg-yellow-500 text-black',
											associacao.status === 'aprovada' && // Corrigido
												'bg-green-600 text-white'
										)}
									>
										{/* Capitaliza a primeira letra apenas para exibição */}
										{associacao.status.charAt(0).toUpperCase() +
											associacao.status.slice(1)}
									</Badge>
								</CardHeader>
								<CardContent className="space-y-1">
									<p className="text-sm font-medium">
										Paciente: {associacao.internacao.paciente.nome}
									</p>
									<p className="text-sm text-muted-foreground">
										<span className="font-medium">Diagnóstico:</span>{' '}
										{associacao.internacao.diagnostico || 'N/A'}
									</p>
									<p className="text-sm text-muted-foreground">
										<span className="font-medium">Data da Solicitação:</span>{' '}
										{formatData(associacao.dataSolicitacao)}
									</p>
								</CardContent>
							</Card>
						))
					)}
				</div>
			</div>

			{/* --- Dialogs e Alerts (Corrigido) --- */}

			{/* Dialog de Ações (Aprovar/Rejeitar) */}
			<Dialog
				open={isActionsOpen}
				onOpenChange={handleCloseDialogs}
			>
				<DialogContent>
					<DialogHeader>
						<DialogTitle>{selectedAssociacao?.familiar.nome}</DialogTitle>
						<DialogDescription>
							Solicitação para acompanhar o paciente{' '}
							<b>{selectedAssociacao?.internacao.paciente.nome}</b>.
						</DialogDescription>
					</DialogHeader>
					{/* Mostra botões apenas se PENDENTE (Corrigido) */}
					{selectedAssociacao?.status === 'pendente' && (
						<div className="grid grid-cols-1 gap-4 py-4 sm:grid-cols-2">
							<Button
								variant="destructive"
								onClick={handleOpenRejeitar} // Corrigido
								disabled={isAprovando || isRejeitando} // Corrigido
							>
								<X className="mr-2 h-4 w-4" />
								Rejeitar
							</Button>
							<Button
								variant="default"
								className="bg-green-600 hover:bg-green-700"
								onClick={handleOpenAprovar}
								disabled={isAprovando || isRejeitando} // Corrigido
							>
								<Check className="mr-2 h-4 w-4" />
								Aprovar
							</Button>
						</div>
					)}
				</DialogContent>
			</Dialog>

			{/* Alert de Confirmação "Aprovar" */}
			<AlertDialog
				open={isAprovarOpen}
				onOpenChange={handleCloseDialogs}
			>
				<AlertDialogContent>
					<AlertDialogHeader>
						<AlertDialogTitle>Aprovar Solicitação?</AlertDialogTitle>
						<AlertDialogDescription>
							Tem certeza que deseja aprovar o acesso de{' '}
							<b>{selectedAssociacao?.familiar.nome}</b> ao prontuário do
							paciente <b>{selectedAssociacao?.internacao.paciente.nome}</b>?
						</AlertDialogDescription>
					</AlertDialogHeader>
					<AlertDialogFooter>
						<AlertDialogCancel disabled={isAprovando}>
							Cancelar
						</AlertDialogCancel>
						<AlertDialogAction
							onClick={handleConfirmarAprovar}
							disabled={isAprovando}
							className="bg-green-600 hover:bg-green-700"
						>
							{isAprovando ? 'Aprovando...' : 'Sim, Aprovar'}
						</AlertDialogAction>
					</AlertDialogFooter>
				</AlertDialogContent>
			</AlertDialog>

			{/* Alert de Confirmação "Rejeitar" (Corrigido) */}
			<AlertDialog
				open={isRejeitarOpen}
				onOpenChange={handleCloseDialogs}
			>
				<AlertDialogContent>
					<AlertDialogHeader>
						<AlertDialogTitle>Rejeitar Solicitação?</AlertDialogTitle>
						<AlertDialogDescription>
							Tem certeza que deseja rejeitar o acesso de{' '}
							<b>{selectedAssociacao?.familiar.nome}</b>? Esta ação não pode ser
							desfeita.
						</AlertDialogDescription>
					</AlertDialogHeader>
					<AlertDialogFooter>
						<AlertDialogCancel disabled={isRejeitando}>
							Cancelar
						</AlertDialogCancel>
						<AlertDialogAction
							onClick={handleConfirmarRejeitar}
							disabled={isRejeitando}
							className="bg-red-500 hover:bg-red-600"
						>
							{isRejeitando ? 'Rejeitando...' : 'Sim, Rejeitar'}
						</AlertDialogAction>
					</AlertDialogFooter>
				</AlertDialogContent>
			</AlertDialog>
		</>
	)
}
