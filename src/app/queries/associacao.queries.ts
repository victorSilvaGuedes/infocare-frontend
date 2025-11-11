// Salve como: app/queries/associacao.queries.ts
// (Versão CORRIGIDA - usando lowercase enums)
'use client'

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import type { AxiosError } from 'axios'
import api from '@/lib/api'
import { toast } from 'sonner'

// --- Tipos de Dados ---

// 1. Tipo do Enum Status (CORRIGIDO para lowercase)
export type StatusAssociacao = 'pendente' | 'aprovada' | 'rejeitada'

// 2. Tipo da Resposta da API
export type AssociacaoComRelacoes = {
	id: number
	idFamiliar: number
	idInternacao: number
	status: StatusAssociacao
	dataSolicitacao: string // ISO String
	familiar: {
		id: number
		nome: string
		email: string
	}
	internacao: {
		id: number
		diagnostico: string | null
		dataInicio: string
		paciente: {
			nome: string
		}
	}
}

// 3. Tipo de Erro da API
type ApiErrorResponse = {
	message: string
	status?: 'error'
	errors?: Array<{ campo: string; mensagem: string }>
}

// --- Hooks ---

// 4. Hook GET (Listar Associações)
type GetAssociacoesParams = {
	status?: StatusAssociacao | 'TODAS' // (Corrigido)
}

const fetchAssociacoes = async (
	params: GetAssociacoesParams
): Promise<AssociacaoComRelacoes[]> => {
	const { status } = params
	const queryParams = status && status !== 'TODAS' ? { status } : {}
	const { data } = await api.get('/associacoes', { params: queryParams })
	return data
}

export function useGetAssociacoes(params: GetAssociacoesParams) {
	const queryKey = ['associacoes', params]
	return useQuery<AssociacaoComRelacoes[], Error>({
		queryKey: queryKey,
		queryFn: () => fetchAssociacoes(params),
	})
}

// 5. Hook PUT (Aprovar)
const aprovarAssociacao = async (id: number): Promise<void> => {
	await api.put(`/associacoes/${id}/aprovar`)
}

export function useAprovarAssociacao() {
	const queryClient = useQueryClient()
	return useMutation<void, AxiosError<ApiErrorResponse>, number>({
		mutationFn: aprovarAssociacao,
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: ['associacoes'], exact: false })
			toast.success('Solicitação aprovada com sucesso!')
		},
		onError: (error) => {
			const errorMessage = error.response?.data?.message || error.message
			toast.error('Erro ao aprovar solicitação', {
				description: errorMessage,
			})
		},
	})
}

// 6. Hook PUT (Rejeitar)
const rejeitarAssociacao = async (id: number): Promise<void> => {
	await api.put(`/associacoes/${id}/rejeitar`)
}

export function useRejeitarAssociacao() {
	const queryClient = useQueryClient()
	return useMutation<void, AxiosError<ApiErrorResponse>, number>({
		mutationFn: rejeitarAssociacao,
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: ['associacoes'], exact: false })
			toast.info('Solicitação rejeitada.')
		},
		onError: (error) => {
			const errorMessage = error.response?.data?.message || error.message
			toast.error('Erro ao rejeitar solicitação', {
				description: errorMessage,
			})
		},
	})
}
