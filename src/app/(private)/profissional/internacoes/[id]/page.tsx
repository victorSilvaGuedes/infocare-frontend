// Salve em: app/(private)/profissional/internacoes/[id]/page.tsx
'use client'

import { useParams } from 'next/navigation'
import Link from 'next/link'
import { useGetInternacaoById } from '@/app/queries/internacao.queries'

// Componentes
import { AppLoader } from '@/components/AppLoader'
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { ArrowLeft, AlertTriangle } from 'lucide-react'
import { cn } from '@/lib/utils'

export default function InternacaoDetailPage() {
	const params = useParams()
	const id = Array.isArray(params.id) ? params.id[0] : params.id
	const internacaoId = id ? parseInt(id, 10) : null

	const {
		data: internacao,
		isLoading,
		isError,
		error,
	} = useGetInternacaoById(internacaoId)

	// Helper para formatar data e hora
	const formatDataHora = (dateString: string) => {
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
					<AlertTitle>Erro ao carregar internação</AlertTitle>
					<AlertDescription>{error?.message}</AlertDescription>
					<Button
						variant="link"
						asChild
					>
						<Link href="/profissional/internacoes">Voltar</Link>
					</Button>
				</Alert>
			</div>
		)
	}

	if (!internacao) {
		return <AppLoader /> // ou um estado de "Não encontrado"
	}

	return (
		<div className="flex flex-1 flex-col">
			{/* --- Header --- */}
			<div className="flex items-center justify-between p-6">
				<Button
					variant="ghost"
					size="icon"
					asChild
				>
					<Link href="/profissional/internacoes">
						<ArrowLeft className="h-5 w-5" />
					</Link>
				</Button>
				<h1 className="truncate text-xl font-bold">
					{internacao.paciente.nome}
				</h1>
				<div className="w-9"></div> {/* Espaçador */}
			</div>

			{/* --- Resumo da Internação --- */}
			<div className="space-y-2 px-6 pb-4">
				<div className="flex flex-wrap gap-2">
					<Badge variant="destructive">ID: {internacao.id}</Badge>
					<Badge
						variant="default"
						className={cn(
							internacao.status === 'ALTA' && 'bg-green-600 text-white',
							internacao.status === 'ATIVA' && 'bg-blue-500 text-white'
						)}
					>
						{internacao.status}
					</Badge>
					<Badge variant="default">Quarto: {internacao.quarto || 'N/A'}</Badge>
					<Badge variant="default">
						Leito: {internacao.leito?.toUpperCase() || 'N/A'}
					</Badge>
				</div>
				<div className="text-sm text-muted-foreground">
					<span className="font-medium">Diagnóstico:</span>{' '}
					{internacao.diagnostico || 'N/A'}
				</div>
				<div className="text-sm text-muted-foreground">
					<span className="font-medium">Observações:</span>{' '}
					{internacao.observacoes || 'N/A'}
				</div>
				<p className="text-sm text-muted-foreground">
					<span className="font-medium">Entrada:</span>{' '}
					{formatDataHora(internacao.dataInicio)}
				</p>
				{internacao.dataAlta && (
					<p className="text-sm text-muted-foreground">
						<span className="font-medium">Alta:</span>{' '}
						{formatDataHora(internacao.dataAlta)}
					</p>
				)}
			</div>

			{/* --- Lista de Evoluções --- */}
			<div className="flex-1 space-y-4 px-6 pb-6">
				<h2 className="border-b pb-2 text-lg font-semibold">
					Histórico de Evoluções
				</h2>

				{internacao.evolucoes.length === 0 && (
					<div className="flex flex-1 flex-col items-center justify-center rounded-md border border-dashed p-8 text-center">
						<p className="text-muted-foreground">
							Nenhuma evolução registrada.
						</p>
					</div>
				)}

				{internacao.evolucoes.map((evolucao) => (
					<Card
						key={evolucao.id}
						className="bg-muted/30"
					>
						<CardHeader className="pb-2">
							<CardTitle className="text-base font-medium">
								Por: {evolucao.profissional.nome}
							</CardTitle>
							<p className="text-xs text-muted-foreground">
								{formatDataHora(evolucao.dataHora)}
							</p>
						</CardHeader>
						<CardContent>
							{/* Usamos 'whitespace-pre-wrap' para respeitar
                  as quebras de linha que o Gemini nos deu */}
							<p className="whitespace-pre-wrap text-sm">
								{evolucao.descricao}
							</p>
						</CardContent>
					</Card>
				))}
			</div>
		</div>
	)
}
