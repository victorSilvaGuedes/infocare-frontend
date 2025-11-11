// Salve como: app/(private)/profissional/internacoes/page.tsx
'use client'

// Imports do React
import { useState, useMemo } from 'react'
import Link from 'next/link'
import { useSearchParams } from 'next/navigation'

// Hooks de dados
import {
	useGetInternacoes,
	InternacaoComRelacoes,
	useDarAltaInternacao,
	useDeleteInternacao,
} from '@/app/queries/internacao.queries'

// Componentes
import { AppLoader } from '@/components/AppLoader'
import { CreateInternacaoDialog } from '@/components/CreateInternacaoDialog'
import { EditInternacaoDialog } from '@/components/EditInternacaoDialog'
import { CreateEvolucaoDialog } from '@/components/CreateEvolucaoDialog'

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
import { Input } from '@/components/ui/input'
import {
	ArrowLeft,
	AlertTriangle,
	Plus,
	Edit,
	Trash2,
	LogOut,
	FilePlus,
	ClipboardList,
	SquareMousePointer,
} from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { cn } from '@/lib/utils'

type StatusFilter = 'ATIVA' | 'ALTA' | 'TODAS'

export default function InternacoesPage() {
	// --- Filtro de status ---
	const [statusFilter, setStatusFilter] = useState<StatusFilter>('TODAS')

	// --- Parâmetros da URL ---
	const searchParams = useSearchParams()

	// --- Campo de busca (inicializa com o valor da URL apenas uma vez) ---
	const [searchTerm, setSearchTerm] = useState(
		() => searchParams.get('search') || ''
	)

	// --- Hooks de dados ---
	const {
		data: internacoes,
		isLoading,
		isError,
		error,
	} = useGetInternacoes({ status: statusFilter })

	// --- Hooks de mutação ---
	const { mutate: darAlta, isPending: isDandoAlta } = useDarAltaInternacao()
	const { mutate: deleteInternacao, isPending: isDeleting } =
		useDeleteInternacao()

	// --- Estados de UI ---
	const [isCreateOpen, setCreateOpen] = useState(false)
	const [isEditOpen, setIsEditOpen] = useState(false)
	const [isAltaOpen, setIsAltaOpen] = useState(false)
	const [isDeleteOpen, setIsDeleteOpen] = useState(false)
	const [isEvolucaoOpen, setIsEvolucaoOpen] = useState(false)
	const [isActionsOpen, setIsActionsOpen] = useState(false)
	const [selectedInternacao, setSelectedInternacao] =
		useState<InternacaoComRelacoes | null>(null)

	// --- Funções auxiliares ---
	const handleOpenActions = (internacao: InternacaoComRelacoes) => {
		setSelectedInternacao(internacao)
		setIsActionsOpen(true)
	}
	const handleOpenEvolucao = () => {
		setIsActionsOpen(false)
		setIsEvolucaoOpen(true)
	}
	const handleOpenEdit = () => {
		setIsActionsOpen(false)
		setIsEditOpen(true)
	}
	const handleOpenAlta = () => {
		setIsActionsOpen(false)
		setIsAltaOpen(true)
	}
	const handleOpenDelete = () => {
		setIsActionsOpen(false)
		setIsDeleteOpen(true)
	}
	const handleCloseDialogs = () => {
		setSelectedInternacao(null)
		setIsActionsOpen(false)
		setIsEditOpen(false)
		setIsAltaOpen(false)
		setIsDeleteOpen(false)
		setIsEvolucaoOpen(false)
	}
	const handleConfirmarAlta = () => {
		if (selectedInternacao) {
			darAlta(selectedInternacao.id, { onSuccess: handleCloseDialogs })
		}
	}
	const handleConfirmarDelete = () => {
		if (selectedInternacao) {
			deleteInternacao(selectedInternacao.id, { onSuccess: handleCloseDialogs })
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
	const getTitulo = () => {
		if (statusFilter === 'ATIVA') return 'Internações Ativas'
		if (statusFilter === 'ALTA') return 'Internações com Alta'
		return 'Todas Internações'
	}

	// --- Filtro client-side ---
	const filteredInternacoes = useMemo(() => {
		if (!internacoes) return []
		if (searchTerm.trim() === '') return internacoes
		return internacoes.filter((internacao) =>
			internacao.paciente.nome.toLowerCase().includes(searchTerm.toLowerCase())
		)
	}, [internacoes, searchTerm])

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
					<AlertTitle>Erro ao carregar internações</AlertTitle>
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
					<h1 className="text-xl font-bold">{getTitulo()}</h1>
					<Button
						variant="default"
						size="icon"
						onClick={() => setCreateOpen(true)}
					>
						<Plus className="h-5 w-5" />
					</Button>
				</div>

				{/* Filtros */}
				<div className="px-6 pb-4">
					<RadioGroup
						value={statusFilter}
						onValueChange={(value: StatusFilter) => setStatusFilter(value)}
						className="flex items-center space-x-4"
					>
						<div className="flex items-center space-x-2">
							<RadioGroupItem
								value="TODAS"
								id="r-todas"
							/>
							<Label htmlFor="r-todas">Todas</Label>
						</div>
						<div className="flex items-center space-x-2">
							<RadioGroupItem
								value="ATIVA"
								id="r-ativa"
							/>
							<Label htmlFor="r-ativa">Ativas</Label>
						</div>
						<div className="flex items-center space-x-2">
							<RadioGroupItem
								value="ALTA"
								id="r-alta"
							/>
							<Label htmlFor="r-alta">Alta</Label>
						</div>
					</RadioGroup>
				</div>

				{/* Barra de pesquisa */}
				<div className="px-6 pb-4">
					<Input
						placeholder="Buscar pelo nome do paciente..."
						value={searchTerm}
						onChange={(e) => setSearchTerm(e.target.value)}
					/>
				</div>

				{/* Lista de internações */}
				<div className="flex-1 space-y-4 px-6 pb-6">
					{filteredInternacoes.length === 0 ? (
						<div className="flex flex-1 flex-col items-center justify-center rounded-md border border-dashed p-8 text-center">
							<p className="text-muted-foreground">
								{searchTerm ? (
									<>
										Nenhuma internação encontrada para <b>{searchTerm}</b>
										{statusFilter !== 'TODAS' && ` com status ${statusFilter}`}.
									</>
								) : (
									<>
										Nenhuma internação
										{statusFilter !== 'TODAS' &&
											` ${statusFilter.toLowerCase()}`}{' '}
										encontrada.
									</>
								)}
							</p>
						</div>
					) : (
						filteredInternacoes.map((internacao) => (
							<Card
								key={internacao.id}
								className="cursor-pointer transition-colors hover:bg-muted/50"
								onClick={() => handleOpenActions(internacao)}
							>
								<CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
									<div>
										<CardTitle className="text-lg font-medium">
											{internacao.paciente.nome}
										</CardTitle>
										<CardDescription className="text-sm">
											<p>
												<span className="font-medium">Diagnóstico:</span>{' '}
												{internacao.diagnostico || 'Sem diagnóstico'}
											</p>
											<p>
												<span className="font-medium">Observações:</span>{' '}
												{internacao.observacoes || 'Sem observações'}
											</p>
										</CardDescription>
									</div>
									<Badge
										variant="default"
										className={cn(
											internacao.status === 'ALTA' && 'bg-green-600 text-white',
											internacao.status === 'ATIVA' && 'bg-blue-600 text-white'
										)}
									>
										{internacao.status}
									</Badge>
								</CardHeader>
								<CardContent className="space-y-1 flex flex-row items-center justify-between">
									<div className="space-y-2">
										<div className="flex flex-wrap gap-2">
											<Badge variant="secondary">
												Quarto: {internacao.quarto || 'N/A'}
											</Badge>
											<Badge variant="secondary">
												Leito: {internacao.leito || 'N/A'}
											</Badge>
										</div>
										<p className="text-sm text-muted-foreground">
											Entrada: {formatData(internacao.dataInicio)}
										</p>
										{internacao.dataAlta && (
											<p className="text-sm text-muted-foreground">
												Alta: {formatData(internacao.dataAlta)}
											</p>
										)}
										<p className="text-sm text-muted-foreground">
											Responsável:{' '}
											{internacao.profissionalResponsavel?.nome || 'N/A'}
										</p>
									</div>
									<SquareMousePointer className="text-muted-foreground" />
								</CardContent>
							</Card>
						))
					)}
				</div>
			</div>

			{/* Dialogs e Alerts */}
			<CreateInternacaoDialog
				open={isCreateOpen}
				onOpenChange={setCreateOpen}
			/>

			<Dialog
				open={isActionsOpen}
				onOpenChange={handleCloseDialogs}
			>
				<DialogContent>
					<DialogHeader>
						<DialogTitle>{selectedInternacao?.paciente.nome}</DialogTitle>
						<DialogDescription>
							{selectedInternacao?.diagnostico ||
								'Selecione uma ação para esta internação.'}
						</DialogDescription>
					</DialogHeader>
					<div className="grid grid-cols-1 gap-4 py-4">
						<Button
							variant="outline"
							asChild
						>
							<Link
								href={`/profissional/internacoes/${selectedInternacao?.id}`}
							>
								<ClipboardList className="mr-2 h-4 w-4" />
								Ver Detalhes e Evoluções
							</Link>
						</Button>
						{selectedInternacao?.status === 'ATIVA' && (
							<>
								<Button
									variant="default"
									onClick={handleOpenEdit}
								>
									<Edit className="mr-2 h-4 w-4" />
									Editar Dados
								</Button>
								<Button
									variant="default"
									className="bg-green-600 hover:bg-green-700 focus:bg-green-700 text-white"
									onClick={handleOpenEvolucao}
								>
									<FilePlus className="mr-2 h-4 w-4" />
									Adicionar Evolução
								</Button>
								<Button
									variant="default"
									className="bg-blue-600 hover:bg-blue-700 focus:bg-blue-700 text-white"
									onClick={handleOpenAlta}
								>
									<LogOut className="mr-2 h-4 w-4" />
									Dar Alta
								</Button>
							</>
						)}
						<Button
							variant="default"
							onClick={handleOpenDelete}
							className="bg-red-600 hover:bg-red-700 focus:bg-red-700 text-white"
						>
							<Trash2 className="mr-2 h-4 w-4" />
							Excluir Internação
						</Button>
					</div>
				</DialogContent>
			</Dialog>

			<EditInternacaoDialog
				open={isEditOpen}
				onOpenChange={handleCloseDialogs}
				internacaoId={selectedInternacao?.id || null}
			/>

			<CreateEvolucaoDialog
				open={isEvolucaoOpen}
				onOpenChange={handleCloseDialogs}
				internacaoId={selectedInternacao?.id || null}
				pacienteNome={selectedInternacao?.paciente.nome || ''}
			/>

			<AlertDialog
				open={isAltaOpen}
				onOpenChange={handleCloseDialogs}
			>
				<AlertDialogContent>
					<AlertDialogHeader>
						<AlertDialogTitle>Confirmar Alta?</AlertDialogTitle>
						<AlertDialogDescription>
							Você tem certeza que deseja dar alta a este paciente?
						</AlertDialogDescription>
					</AlertDialogHeader>
					<AlertDialogFooter>
						<AlertDialogCancel disabled={isDandoAlta}>
							Cancelar
						</AlertDialogCancel>
						<AlertDialogAction
							onClick={handleConfirmarAlta}
							disabled={isDandoAlta}
							className="bg-blue-600 hover:bg-blue-700 text-white"
						>
							{isDandoAlta ? 'Registrando...' : 'Sim, dar alta'}
						</AlertDialogAction>
					</AlertDialogFooter>
				</AlertDialogContent>
			</AlertDialog>

			<AlertDialog
				open={isDeleteOpen}
				onOpenChange={handleCloseDialogs}
			>
				<AlertDialogContent>
					<AlertDialogHeader>
						<AlertDialogTitle>Tem certeza absoluta?</AlertDialogTitle>
						<AlertDialogDescription>
							Essa ação é irreversível e removerá todos os dados relacionados a
							esta internação.
						</AlertDialogDescription>
					</AlertDialogHeader>
					<AlertDialogFooter>
						<AlertDialogCancel disabled={isDeleting}>
							Cancelar
						</AlertDialogCancel>
						<AlertDialogAction
							onClick={handleConfirmarDelete}
							disabled={isDeleting}
							className="bg-red-500 hover:bg-red-600 focus:bg-red-600 text-white"
						>
							{isDeleting ? 'Excluindo...' : 'Sim, excluir'}
						</AlertDialogAction>
					</AlertDialogFooter>
				</AlertDialogContent>
			</AlertDialog>
		</>
	)
}
