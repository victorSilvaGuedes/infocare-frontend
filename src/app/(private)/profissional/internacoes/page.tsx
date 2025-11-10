// Salve como: app/(private)/profissional/internacoes/page.tsx
// (Versão ATUALIZADA com Filtros, Badges de Status e Ações Condicionais)
'use client'

import { useState } from 'react'
import Link from 'next/link'
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
// 1. (NOVO) Importar o Dialog de Evolução
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
	AlertDialog,
	AlertDialogAction,
	AlertDialogCancel,
	AlertDialogContent,
	AlertDialogDescription,
	AlertDialogFooter,
	AlertDialogHeader,
	AlertDialogTitle,
} from '@/components/ui/alert-dialog'
// 2. (NOVOS) Imports para o Filtro
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group'
import { Label } from '@/components/ui/label'
// 3. (NOVOS ÍCONES)
import {
	ArrowLeft,
	AlertTriangle,
	BedDouble,
	Plus,
	Edit,
	Trash2,
	LogOut,
	FilePlus, // Para "Adicionar Evolução"
} from 'lucide-react'
import { Badge } from '@/components/ui/badge'

// Tipo para o nosso filtro de estado
type StatusFilter = 'ATIVA' | 'ALTA' | 'TODAS'

export default function InternacoesPage() {
	// 4. (ATUALIZADO) Hooks de Dados com Filtro
	const [statusFilter, setStatusFilter] = useState<StatusFilter>('TODAS')

	const {
		data: internacoes,
		isLoading,
		isError,
		error,
	} = useGetInternacoes({ status: statusFilter }) // <--- Conectado ao estado

	// Hooks de Mutação
	const { mutate: darAlta, isPending: isDandoAlta } = useDarAltaInternacao()
	const { mutate: deleteInternacao, isPending: isDeleting } =
		useDeleteInternacao()

	// 5. (ATUALIZADO) Estados de UI (incluindo Evolução)
	const [isCreateOpen, setCreateOpen] = useState(false)
	const [isEditOpen, setIsEditOpen] = useState(false)
	const [isAltaOpen, setIsAltaOpen] = useState(false)
	const [isDeleteOpen, setIsDeleteOpen] = useState(false)
	const [isEvolucaoOpen, setIsEvolucaoOpen] = useState(false) // <--- NOVO

	const [selectedInternacao, setSelectedInternacao] =
		useState<InternacaoComRelacoes | null>(null)

	// 6. (ATUALIZADO) Funções de Ação
	const handleOpenEdit = (internacao: InternacaoComRelacoes) => {
		setSelectedInternacao(internacao)
		setIsEditOpen(true)
	}

	const handleOpenAlta = (internacao: InternacaoComRelacoes) => {
		setSelectedInternacao(internacao)
		setIsAltaOpen(true)
	}

	const handleOpenDelete = (internacao: InternacaoComRelacoes) => {
		setSelectedInternacao(internacao)
		setIsDeleteOpen(true)
	}

	const handleOpenEvolucao = (internacao: InternacaoComRelacoes) => {
		setSelectedInternacao(internacao)
		setIsEvolucaoOpen(true)
	}

	// Função para fechar e limpar todos os modais
	const handleCloseDialogs = () => {
		setSelectedInternacao(null)
		setIsEditOpen(false)
		setIsAltaOpen(false)
		setIsDeleteOpen(false)
		setIsEvolucaoOpen(false) // <--- ATUALIZADO
	}

	// Handlers de Confirmação
	const handleConfirmarAlta = () => {
		if (selectedInternacao) {
			darAlta(selectedInternacao.id, {
				onSuccess: handleCloseDialogs,
			})
		}
	}

	const handleConfirmarDelete = () => {
		if (selectedInternacao) {
			deleteInternacao(selectedInternacao.id, {
				onSuccess: handleCloseDialogs,
			})
		}
	}

	// Helper para formatar datas (Mantendo sua versão)
	const formatData = (dateString: string) => {
		return new Date(dateString).toLocaleDateString('pt-BR', {
			timeZone: 'UTC',
			day: '2-digit',
			month: '2-digit',
			year: 'numeric',
			hour: '2-digit',
			minute: '2-digit',
		})
	}

	// Helper para Título Dinâmico
	const getTitulo = () => {
		if (statusFilter === 'ATIVA') return 'Internações Ativas'
		if (statusFilter === 'ALTA') return 'Internações com Alta'
		return 'Todas Internações'
	}

	// Renderização (Loading / Erro)
	if (isLoading) {
		return <AppLoader />
	}

	if (isError) {
		// ... (bloco de erro sem alteração)
	}

	// 4. Renderização (Sucesso)
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
					<h1 className="text-xl font-bold">{getTitulo()}</h1>
					<Button
						variant="default"
						size="icon"
						onClick={() => setCreateOpen(true)}
					>
						<Plus className="h-5 w-5" />
					</Button>
				</div>

				{/* 7. (NOVO) Filtros de Status */}
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
							<Label htmlFor="r-alta">Com Alta</Label>
						</div>
					</RadioGroup>
				</div>

				{/* --- Lista de Internações (ATUALIZADA) --- */}
				<div className="flex-1 space-y-4 px-6 pb-6">
					{internacoes && internacoes.length === 0 && (
						<div className="flex flex-1 flex-col items-center justify-center rounded-md border border-dashed p-8 text-center">
							<p className="text-muted-foreground">
								Nenhuma internação
								{statusFilter !== 'TODAS' &&
									` ${statusFilter.toLowerCase()}`}{' '}
								encontrada.
							</p>
						</div>
					)}

					{internacoes &&
						internacoes.map((internacao) => (
							<Card key={internacao.id}>
								<CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
									<div>
										<CardTitle className="text-lg font-medium">
											{internacao.paciente.nome}
										</CardTitle>
										<CardDescription className="text-md">
											{internacao.diagnostico || '-'}
										</CardDescription>
									</div>
									{/* 8. (NOVO) Badge de Status */}
									<Badge
										variant={
											internacao.status === 'ALTA' ? 'secondary' : 'default'
										}
										className={
											internacao.status === 'ATIVA'
												? 'bg-green-600 text-white' // Verde para ATIVA
												: ''
										}
									>
										{internacao.status}
									</Badge>
								</CardHeader>

								{/* 9. (ATUALIZADO) CardContent com ações condicionais */}
								<CardContent className="space-y-2">
									<div className="flex justify-between items-start">
										{/* Informações da Internação */}
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
												Resp:{' '}
												{internacao.profissionalResponsavel?.nome || 'N/A'}
											</p>
										</div>

										{/* Botões de Ação */}
										<div className="flex flex-col sm:flex-row gap-1">
											{/* SÓ APARECE SE ATIVA */}
											{internacao.status === 'ATIVA' && (
												<>
													<Button
														variant="ghost"
														size="icon"
														className="text-green-600 hover:text-green-700"
														onClick={(e) => {
															e.stopPropagation()
															handleOpenEvolucao(internacao)
														}}
													>
														<FilePlus className="h-5 w-5" />
														<span className="sr-only">Adicionar Evolução</span>
													</Button>
													<Button
														variant="ghost"
														size="icon"
														onClick={(e) => {
															e.stopPropagation()
															handleOpenEdit(internacao)
														}}
													>
														<Edit className="h-5 w-5" />
														<span className="sr-only">Editar</span>
													</Button>
													<Button
														variant="ghost"
														size="icon"
														className="text-blue-600 hover:text-blue-700"
														onClick={(e) => {
															e.stopPropagation()
															handleOpenAlta(internacao)
														}}
													>
														<LogOut className="h-5 w-5" />
														<span className="sr-only">Dar Alta</span>
													</Button>
												</>
											)}

											{/* Botão de Excluir (sempre aparece) */}
											<Button
												variant="ghost"
												size="icon"
												className="text-destructive hover:text-destructive"
												onClick={(e) => {
													e.stopPropagation()
													handleOpenDelete(internacao)
												}}
											>
												<Trash2 className="h-5 w-5" />
												<span className="sr-only">Excluir</span>
											</Button>
										</div>
									</div>
								</CardContent>
							</Card>
						))}
				</div>
			</div>

			{/* --- Dialogs e Alerts --- */}

			<CreateInternacaoDialog
				open={isCreateOpen}
				onOpenChange={setCreateOpen}
			/>

			<EditInternacaoDialog
				open={isEditOpen}
				onOpenChange={handleCloseDialogs}
				internacaoId={selectedInternacao?.id || null}
			/>

			{/* 10. (NOVO) Dialog de Evolução */}
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
							<div>
								<p>
									Esta ação <b>finalizará</b> a internação do paciente{' '}
									<b>{selectedInternacao?.paciente.nome}</b>.{' '}
									<p>
										O status será alterado para <b>ALTA</b>, e não será mais
										possível adicionar evoluções ou associações.
									</p>
									<p>
										Familiares associados receberão um e-mail de notificação.
									</p>
								</p>
							</div>
						</AlertDialogDescription>
					</AlertDialogHeader>
					<AlertDialogFooter>
						<AlertDialogCancel disabled={isDandoAlta}>
							Cancelar
						</AlertDialogCancel>
						<AlertDialogAction
							onClick={handleConfirmarAlta}
							disabled={isDandoAlta}
							className="bg-blue-600 hover:bg-blue-700"
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
							<div>
								<p>
									Esta ação <b>excluirá</b> a internação do paciente{' '}
									<b>{selectedInternacao?.paciente.nome}</b>.{' '}
								</p>

								<p>
									Isso excluirá permanentemente a internação e todo o seu
									histórico (evoluções, associações).
								</p>
							</div>
						</AlertDialogDescription>
					</AlertDialogHeader>
					<AlertDialogFooter>
						<AlertDialogCancel disabled={isDeleting}>
							Cancelar
						</AlertDialogCancel>
						<AlertDialogAction
							onClick={handleConfirmarDelete}
							disabled={isDeleting}
							className="bg-red-500 hover:bg-red-600"
						>
							{isDeleting ? 'Excluindo...' : 'Sim, excluir'}
						</AlertDialogAction>
					</AlertDialogFooter>
				</AlertDialogContent>
			</AlertDialog>
		</>
	)
}
