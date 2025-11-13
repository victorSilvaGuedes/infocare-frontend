// Salve como: app/(private)/familiar/internacoes/page.tsx
'use client'

// Imports do React
import { useState, useMemo } from 'react'
import Link from 'next/link'

// Hooks de dados
import {
	useGetMinhasAssociacoes,
	StatusInternacao,
} from '@/app/queries/familiar-associacoes.queries'

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
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group'
import { Label } from '@/components/ui/label'
import { ArrowLeft, AlertTriangle } from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { cn } from '@/lib/utils'

// Tipo para o filtro de status (da internação)
type StatusFilter = StatusInternacao | 'TODAS'

export default function FamiliarPacientesPage() {
	// --- Filtro de status (para o RadioGroup) ---
	const [statusFilter, setStatusFilter] = useState<StatusFilter>('ATIVA')

	// --- Hooks de dados ---
	// 1. Buscamos APENAS as associações que já foram 'aprovadas'
	const {
		data: associacoesAprovadas,
		isLoading,
		isError,
		error,
	} = useGetMinhasAssociacoes({ status: 'aprovada' })

	// --- Funções auxiliares ---
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

	// 2. Filtro client-side
	// Filtra a lista de associações APROVADAS pelo status da INTERNAÇÃO
	const filteredAssociacoes = useMemo(() => {
		if (!associacoesAprovadas) return []
		if (statusFilter === 'TODAS') {
			return associacoesAprovadas
		}
		return associacoesAprovadas.filter(
			(assoc) => assoc.internacao.status === statusFilter
		)
	}, [associacoesAprovadas, statusFilter])

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
					<AlertTitle>Erro ao carregar pacientes</AlertTitle>
					<AlertDescription>
						{error?.response?.data?.message || error?.message}
					</AlertDescription>
				</Alert>
			</div>
		)
	}

	// --- Renderização principal ---
	return (
		<>
			<div className="flex flex-1 flex-col">
				{/* Header (sem botão "+") */}
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
					<h1 className="text-xl font-bold">Pacientes Associados</h1>
					<div className="w-9"></div> {/* Espaçador */}
				</div>

				{/* Filtros (ATIVAS, ALTA, TODAS) */}
				<div className="px-6 pb-4">
					<RadioGroup
						value={statusFilter}
						onValueChange={(value: StatusFilter) => setStatusFilter(value)}
						className="flex items-center space-x-4"
					>
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
						<div className="flex items-center space-x-2">
							<RadioGroupItem
								value="TODAS"
								id="r-todas"
							/>
							<Label htmlFor="r-todas">Todas</Label>
						</div>
					</RadioGroup>
				</div>

				{/* Lista de Internações Aprovadas */}
				<div className="flex-1 space-y-4 px-6 pb-6">
					{filteredAssociacoes.length === 0 ? (
						<div className="flex flex-1 flex-col items-center justify-center rounded-md border border-dashed p-8 text-center">
							<p className="text-muted-foreground">
								{statusFilter === 'TODAS'
									? 'Nenhuma associação aprovada encontrada.'
									: `Nenhuma internação ${statusFilter.toLowerCase()} encontrada.`}
							</p>
						</div>
					) : (
						filteredAssociacoes.map((associacao) => (
							// 3. (ATUALIZADO) O Link aponta para a página de detalhes da ASSOCIAÇÃO
							<Link
								key={associacao.id}
								href={`/familiar/internacoes/${associacao.id}`}
								passHref
								className="block"
							>
								<Card className="cursor-pointer transition-colors hover:bg-muted/50">
									<CardHeader className="flex flex-row items-start justify-between space-y-0 pb-2">
										<div>
											<CardTitle className="text-lg font-medium">
												{associacao.internacao.paciente.nome}
											</CardTitle>
											<CardDescription className="text-sm">
												{associacao.internacao.diagnostico || 'N/A'}
											</CardDescription>
										</div>
										{/* Badge de Status da Internação */}
										<Badge
											variant={
												associacao.internacao.status === 'ALTA'
													? 'secondary'
													: 'default'
											}
											className={cn(
												'ml-2 shrink-0',
												associacao.internacao.status === 'ATIVA'
													? 'bg-blue-600 text-white'
													: 'bg-gray-500 text-white'
											)}
										>
											{associacao.internacao.status}
										</Badge>
									</CardHeader>
									<CardContent>
										<p className="text-sm text-muted-foreground">
											<span className="font-medium">Entrada:</span>{' '}
											{formatData(associacao.internacao.dataInicio)}
										</p>
									</CardContent>
								</Card>
							</Link>
						))
					)}
				</div>
			</div>
		</>
	)
}
