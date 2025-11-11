// Salve como: app/queries/internacao.queries.ts
// (Versão ATUALIZADA com Tipos de Detalhes)

'use client'

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import type { AxiosError } from 'axios'
import api from '@/lib/api'
import { toast } from 'sonner'
// 1. (NOVO) Importar o tipo Evolucao do outro ficheiro
import { Evolucao } from './evolucao.queries'

// --- Definições de Tipos (Baseadas no Backend) ---

type StatusInternacao = 'ATIVA' | 'ALTA'

export type Internacao = {
	id: number
	idPaciente: number
	idProfissionalResponsavel: number | null
	dataInicio: string // ISO String
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

// 2. (NOVO) Tipo para a Evolução com dados do Profissional
// (Baseado no 'include' do seu backend GET /internacoes/:id)
export type EvolucaoComProfissional = Evolucao & {
	profissional: {
		nome: string
		tipo: string
	}
}

// 3. (NOVO) Tipo para os Detalhes Completos da Internação
export type InternacaoDetails = InternacaoComRelacoes & {
	evolucoes: EvolucaoComProfissional[]
	// (Pode adicionar 'paciente: Paciente' se o backend o enviar completo)
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

export type UpdateInternacaoDTO = {
	idProfissionalResponsavel?: number | null
	diagnostico?: string | null
	observacoes?: string | null
	quarto?: string | null
	leito?: string | null
}

export type UpdateInternacaoData = UpdateInternacaoDTO & { id: number }

// --- Hooks de Query (TanStack Query) ---

// (Hook GET /internacoes - Listagem - Sem alteração)
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

// 4. --- (ATUALIZADO) Hook GET (Buscar Internação por ID) ---
const fetchInternacaoById = async (
	internacaoId: number
): Promise<InternacaoDetails> => {
	// <--- ATUALIZADO O TIPO DE RETORNO
	const { data } = await api.get(`/internacoes/${internacaoId}`)
	return data
}

export function useGetInternacaoById(internacaoId: number | null | undefined) {
	return useQuery<InternacaoDetails, Error>({
		// <--- ATUALIZADO O TIPO DE RETORNO
		queryKey: ['internacao', internacaoId],
		queryFn: () => fetchInternacaoById(internacaoId!),
		enabled: !!internacaoId,
	})
}

// (Hook POST /internacoes - Criar - Sem alteração)
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

// (Hook PUT /:id/alta - Dar Alta - Sem alteração)
const darAltaInternacao = async (internacaoId: number): Promise<Internacao> => {
	const { data } = await api.put(`/internacoes/${internacaoId}/alta`)
	return data
}
export function useDarAltaInternacao() {
	const queryClient = useQueryClient()
	return useMutation<Internacao, AxiosError<ApiErrorResponse>, number>({
		mutationFn: darAltaInternacao,
		onSuccess: (internacaoComAlta) => {
			queryClient.invalidateQueries({ queryKey: ['internacoes'] })
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

// (Hook PUT /:id - Atualizar - Sem alteração)
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
			queryClient.invalidateQueries({ queryKey: ['internacoes'] })
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

// (Hook DELETE /:id - Excluir - Sem alteração)
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
