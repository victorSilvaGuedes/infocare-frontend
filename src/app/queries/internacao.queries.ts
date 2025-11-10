// Salve como: app/queries/internacao.queries.ts
// (Versão corrigida com dataInicio)

'use client'

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import type { AxiosError } from 'axios'
import api from '@/lib/api'
import { toast } from 'sonner'

// --- Definições de Tipos (Baseadas no Backend) ---

type StatusInternacao = 'ATIVA' | 'ALTA'

export type Internacao = {
	id: number
	idPaciente: number
	idProfissionalResponsavel: number | null

	// ==========================================================
	// CORREÇÃO AQUI
	dataInicio: string // ISO String (Estava dataEntrada)
	// ==========================================================

	dataAlta: string | null // ISO String
	status: StatusInternacao
	diagnostico: string | null
	observacoes: string | null
	quarto: string | null
	leito: string | null
}

export type InternacaoComRelacoes = Internacao & {
	paciente: {
		nome: string
		dataNascimento: string
	}
	profissionalResponsavel: {
		nome: string
		tipo: string
	} | null
}

export type CreateInternacaoDTO = {
	idPaciente: number
	idProfissionalResponsavel?: number
	diagnostico?: string
	observacoes?: string
	quarto?: string
	leito?: string
}

type ApiErrorResponse = {
	message: string
	status?: 'error'
	errors?: Array<{ campo: string; mensagem: string }>
}

// --- Hooks de Query (TanStack Query) ---

type GetInternacoesParams = {
	status?: StatusInternacao | 'TODAS'
}

const fetchInternacoes = async (
	params: GetInternacoesParams
): Promise<InternacaoComRelacoes[]> => {
	const { status } = params
	const queryParams = status && status !== 'TODAS' ? { status } : {}
	const { data } = await api.get('/internacoes', { params: queryParams })
	return data
}

export function useGetInternacoes(params: GetInternacoesParams) {
	const queryKey = ['internacoes', params]

	return useQuery<InternacaoComRelacoes[], Error>({
		queryKey: queryKey,
		queryFn: () => fetchInternacoes(params),
	})
}

const createInternacao = async (
	internacaoData: CreateInternacaoDTO
): Promise<Internacao> => {
	const { data } = await api.post('/internacoes', internacaoData)
	return data
}

export function useCreateInternacao() {
	const queryClient = useQueryClient()

	return useMutation<
		Internacao,
		AxiosError<ApiErrorResponse>,
		CreateInternacaoDTO
	>({
		mutationFn: createInternacao,
		onSuccess: (novaInternacao) => {
			queryClient.invalidateQueries({ queryKey: ['internacoes'] })
			queryClient.invalidateQueries({
				queryKey: ['paciente', novaInternacao.idPaciente],
			})
			toast.success('Internação criada com sucesso!', {
				description: `A internação foi registrada.`,
			})
		},
		onError: (error) => {
			const errorMessage = error.response?.data?.message || error.message
			toast.error('Erro ao criar internação', {
				description: errorMessage,
			})
		},
	})
}

export type UpdateInternacaoDTO = {
	idProfissionalResponsavel?: number | null
	diagnostico?: string | null
	observacoes?: string | null
	quarto?: string | null
	leito?: string | null
}

// (Tipo de dados para a mutação, incluindo o ID)
export type UpdateInternacaoData = UpdateInternacaoDTO & { id: number }

// --- (NOVO) Hook GET (Buscar Internação por ID) ---
// (O backend GET /:id retorna dados completos, incluindo evolucoes)
// (Vamos simplificar o tipo de retorno por enquanto)
const fetchInternacaoById = async (
	internacaoId: number
): Promise<Internacao> => {
	const { data } = await api.get(`/internacoes/${internacaoId}`)
	return data
}

export function useGetInternacaoById(internacaoId: number | null | undefined) {
	return useQuery<Internacao, Error>({
		queryKey: ['internacao', internacaoId],
		queryFn: () => fetchInternacaoById(internacaoId!),
		enabled: !!internacaoId, // Só executa se internacaoId não for nulo
	})
}

// --- (NOVO) Hook PUT (Dar Alta) ---
const darAltaInternacao = async (internacaoId: number): Promise<Internacao> => {
	const { data } = await api.put(`/internacoes/${internacaoId}/alta`)
	return data
}

export function useDarAltaInternacao() {
	const queryClient = useQueryClient()
	return useMutation<Internacao, AxiosError<ApiErrorResponse>, number>({
		mutationFn: darAltaInternacao,
		onSuccess: (internacaoComAlta) => {
			// Invalida a lista de internações (para remover a 'ATIVA')
			queryClient.invalidateQueries({ queryKey: ['internacoes'] })
			// Invalida a query específica desta internação
			queryClient.invalidateQueries({
				queryKey: ['internacao', internacaoComAlta.id],
			})

			toast.success('Alta registrada com sucesso!', {
				description: 'O paciente recebeu alta e a internação foi finalizada.',
			})
		},
		onError: (error) => {
			const errorMessage = error.response?.data?.message || error.message
			toast.error('Erro ao registrar alta', {
				description: errorMessage,
			})
		},
	})
}

// --- (NOVO) Hook PUT (Atualizar Internação) ---
const updateInternacao = async ({
	id,
	...data
}: UpdateInternacaoData): Promise<Internacao> => {
	const { data: updatedData } = await api.put(`/internacoes/${id}`, data)
	return updatedData
}

export function useUpdateInternacao() {
	const queryClient = useQueryClient()
	return useMutation<
		Internacao,
		AxiosError<ApiErrorResponse>,
		UpdateInternacaoData
	>({
		mutationFn: updateInternacao,
		onSuccess: (internacaoAtualizada) => {
			// Atualiza a lista
			queryClient.invalidateQueries({ queryKey: ['internacoes'] })
			// Atualiza o cache desta internação
			queryClient.setQueryData(
				['internacao', internacaoAtualizada.id],
				internacaoAtualizada
			)
			toast.success('Internação atualizada com sucesso!')
		},
		onError: (error) => {
			const errorMessage = error.response?.data?.message || error.message
			toast.error('Erro ao atualizar internação', {
				description: errorMessage,
			})
		},
	})
}

// --- (NOVO) Hook DELETE (Excluir Internação) ---
const deleteInternacao = async (internacaoId: number): Promise<void> => {
	await api.delete(`/internacoes/${internacaoId}`)
}

export function useDeleteInternacao() {
	const queryClient = useQueryClient()
	return useMutation<void, AxiosError<ApiErrorResponse>, number>({
		mutationFn: deleteInternacao,
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: ['internacoes'] })
			toast.success('Internação excluída com sucesso.')
		},
		onError: (error) => {
			const errorMessage = error.response?.data?.message || error.message
			toast.error('Erro ao excluir internação', {
				description: errorMessage,
			})
		},
	})
}
