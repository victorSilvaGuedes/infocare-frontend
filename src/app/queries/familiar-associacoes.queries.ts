import { StatusAssociacao } from './associacao.queries'
// Salve como: app/queries/familiar-associacoes.queries.ts

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import type { AxiosError } from 'axios'
import api from '@/lib/api'
import { toast } from 'sonner'

// Importar tipos reutilizáveis
import { EvolucaoComProfissional, StatusInternacao } from './internacao.queries'

// (Exporta os tipos para uso na página)
export type { StatusAssociacao, EvolucaoComProfissional, StatusInternacao }

// --- Tipos de Dados ---

// (Tipo da Lista - vindo da sua última atualização)
export type AssociacaoComRelacoes = {
	id: number
	idFamiliar: number
	idInternacao: number
	status: StatusAssociacao
	dataSolicitacao: string
	dataResposta: string | null
	internacao: {
		id: number
		diagnostico: string | null
		dataInicio: string
		status: StatusInternacao
		paciente: {
			nome: string
		}
	}
	profissionalResposta: {
		nome: string
	} | null
}

// (Tipo da Página de Detalhes - vindo da sua última atualização)
export type AssociacaoDetails = {
	id: number
	status: StatusAssociacao
	dataResposta: string | null
	profissionalResposta: {
		nome: string
	} | null
	internacao: {
		id: number
		dataInicio: string
		dataAlta: string | null
		diagnostico: string | null
		observacoes: string | null
		quarto: string | null
		leito: string | null
		status: StatusInternacao
		paciente: {
			nome: string
		}
		profissionalResponsavel: {
			nome: string
		} | null
		evolucoes: EvolucaoComProfissional[]
	}
}

// (NOVO) DTO para criar a associação
export type CreateAssociacaoDTO = {
	idInternacao: number
}

// Tipo de Erro Padrão
type ApiErrorResponse = {
	message: string
	status?: 'error'
	errors?: Array<{ campo: string; mensagem: string }>
}

// --- Hooks ---

// (Hook useGetMinhasAssociacoes - sem alteração)
type GetMinhasAssociacoesParams = {
	status?: StatusAssociacao | 'TODAS'
}
const fetchMinhasAssociacoes = async (
	params: GetMinhasAssociacoesParams
): Promise<AssociacaoComRelacoes[]> => {
	const { status } = params
	const queryParams = status && status !== 'TODAS' ? { status } : {}
	const { data } = await api.get('/familiares/me/associacoes', {
		params: queryParams,
	})
	return data
}
export function useGetMinhasAssociacoes(params: GetMinhasAssociacoesParams) {
	const queryKey = ['minhasAssociacoes', params]
	return useQuery<AssociacaoComRelacoes[], AxiosError<ApiErrorResponse>>({
		queryKey: queryKey,
		queryFn: () => fetchMinhasAssociacoes(params),
	})
}

// (Hook useGetMinhaAssociacaoById - sem alteração)
const fetchMinhaAssociacaoById = async (
	id: number
): Promise<AssociacaoDetails> => {
	const { data } = await api.get(`/familiares/me/associacoes/${id}`)
	return data
}
export function useGetMinhaAssociacaoById(id: number | null) {
	return useQuery<AssociacaoDetails, AxiosError<ApiErrorResponse>>({
		queryKey: ['minhaAssociacao', id],
		queryFn: () => fetchMinhaAssociacaoById(id!),
		enabled: !!id,
	})
}

// ==========================================================
// --- (INÍCIO DO NOVO HOOK) ---
/**
 * Hook: POST /associacoes
 * Descrição: Familiar (logado) cria uma nova solicitação.
 */
// ==========================================================
const createAssociacao = async (
	data: CreateAssociacaoDTO
): Promise<AssociacaoComRelacoes> => {
	// A rota de criação é a /associacoes (como no seu backend)
	const { data: newData } = await api.post('/associacoes', data)
	return newData
}

export function useCreateAssociacao() {
	const queryClient = useQueryClient()
	return useMutation<
		AssociacaoComRelacoes,
		AxiosError<ApiErrorResponse>,
		CreateAssociacaoDTO
	>({
		mutationFn: createAssociacao,
		onSuccess: () => {
			// Atualiza a lista de "Minhas Associações" para mostrar
			// a nova solicitação "pendente".
			queryClient.invalidateQueries({ queryKey: ['minhasAssociacoes'] })
			toast.success('Solicitação enviada com sucesso!', {
				description: 'Sua solicitação está pendente de aprovação.',
			})
		},
		onError: (error) => {
			const errorMessage = error.response?.data?.message || error.message
			// O backend já trata erros (duplicidade, ID não encontrado)
			toast.error('Erro ao enviar solicitação', {
				description: errorMessage,
			})
		},
	})
}
