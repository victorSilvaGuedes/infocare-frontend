'use client'

import { useState } from 'react'
import Link from 'next/link'
import {
	useGetMinhasAssociacoes,
	StatusAssociacao,
} from '@/app/queries/familiar-associacoes.queries'

import { AppLoader } from '@/components/AppLoader'
import { Button } from '@/components/ui/button'
import {
	Card,
	CardContent,
	CardDescription,
	CardHeader,
	CardTitle,
} from '@/components/ui/card'
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group'
import { Label } from '@/components/ui/label'
import { ArrowLeft, AlertTriangle, Plus } from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { cn } from '@/lib/utils'

// Importa o Dialog
import { CreateInternacaoDialog } from '@/components/CreateInternacaoDialog'
import { CreateAssociacaoDialog } from '@/components/CreateAssociacaoDialog'

type StatusFilter = StatusAssociacao | 'TODAS'

export default function FamiliarAssociacoesPage() {
	const [statusFilter, setStatusFilter] = useState<StatusFilter>('pendente')
	const [openDialog, setOpenDialog] = useState(false)
	const [isCreateOpen, setIsCreateOpen] = useState(false)
	const {
		data: associacoes,
		isLoading,
		isError,
		error,
	} = useGetMinhasAssociacoes({ status: statusFilter })

	const formatData = (dateString: string) => {
		if (!dateString) return 'N/A'
		return new Date(dateString).toLocaleDateString('pt-BR', {
			day: '2-digit',
			month: '2-digit',
			year: 'numeric',
			hour: '2-digit',
			minute: '2-digit',
		})
	}

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
					<AlertTitle>Erro ao carregar associações</AlertTitle>
					<AlertDescription>
						{error?.response?.data?.message || error?.message}
					</AlertDescription>
				</Alert>
			</div>
		)
	}

	return (
		<div className="flex flex-1 flex-col">
			{/* Header */}
			<div className="flex items-center justify-between p-6">
				<Button
					variant="ghost"
					size="icon"
					asChild
				>
					<Link href="/familiar">
						<ArrowLeft className="h-5 w-5" />
					</Link>
				</Button>
				<h1 className="text-xl font-bold">Minhas Associações</h1>

				{/* Botão que abre o Dialog */}
				<Button
					variant="default"
					size="icon"
					onClick={() => setIsCreateOpen(true)}
				>
					<Plus className="h-5 w-5" />
				</Button>
			</div>

			{/* Filtros */}
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

			{/* Lista de associações */}
			<div className="flex-1 space-y-4 px-6 pb-6">
				{associacoes && associacoes.length === 0 ? (
					<div className="flex flex-1 flex-col items-center justify-center rounded-md border border-dashed p-8 text-center">
						<p className="text-muted-foreground">
							Nenhuma associação
							{statusFilter !== 'TODAS' &&
								` ${statusFilter.toLowerCase()}`}{' '}
							encontrada.
						</p>
					</div>
				) : (
					associacoes?.map((associacao) => {
						const href = `/familiar/internacoes/${associacao.id}`
						const isRejeitadaOuPendente =
							associacao.status === 'rejeitada' ||
							associacao.status === 'pendente'

						const card = (
							<Card
								className={cn(
									'transition-colors',
									isRejeitadaOuPendente
										? 'opacity-70 cursor-not-allowed'
										: 'cursor-pointer hover:bg-muted/50'
								)}
							>
								<CardHeader className="flex flex-row items-start justify-between space-y-0 pb-2">
									<div>
										<CardTitle className="text-lg font-medium">
											Paciente: {associacao.internacao.paciente.nome}
										</CardTitle>
										{!isRejeitadaOuPendente && (
											<CardDescription className="text-sm">
												<span className="font-medium">Diagnóstico:</span>{' '}
												{associacao.internacao.diagnostico || 'N/A'}
											</CardDescription>
										)}
									</div>
									<div className="flex flex-col gap-2 items-center">
										<Badge
											variant={
												associacao.status === 'aprovada'
													? 'default'
													: associacao.status === 'rejeitada'
													? 'destructive'
													: 'secondary'
											}
											className={cn(
												'ml-2 shrink-0',
												associacao.status === 'pendente' &&
													'bg-yellow-500 text-black',
												associacao.status === 'aprovada' &&
													'bg-green-600 text-white'
											)}
										>
											{associacao.status.charAt(0).toUpperCase() +
												associacao.status.slice(1)}
										</Badge>

										{!isRejeitadaOuPendente && (
											<Badge
												variant={
													associacao.internacao.status === 'ALTA'
														? 'secondary'
														: 'default'
												}
												className={cn(
													associacao.internacao.status === 'ATIVA'
														? 'bg-blue-600 text-white'
														: 'bg-gray-500 text-white'
												)}
											>
												{associacao.internacao.status}
											</Badge>
										)}
									</div>
								</CardHeader>
								<CardContent className="space-y-2">
									<p className="text-sm text-muted-foreground">
										<span className="font-medium">Solicitado em:</span>{' '}
										{formatData(associacao.dataSolicitacao)}
									</p>
								</CardContent>
							</Card>
						)

						return isRejeitadaOuPendente ? (
							<div key={associacao.id}>{card}</div>
						) : (
							<Link
								key={associacao.id}
								href={href}
								passHref
								className="block"
							>
								{card}
							</Link>
						)
					})
				)}
			</div>

			{/* Dialog de criação de internação */}
			<CreateInternacaoDialog
				open={openDialog}
				onOpenChange={setOpenDialog}
			/>

			<CreateAssociacaoDialog
				open={isCreateOpen}
				onOpenChange={setIsCreateOpen}
			/>
		</div>
	)
}
