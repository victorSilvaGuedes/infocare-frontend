// Salve como: app/queries/evolucao.queries.ts
'use client'

import { useMutation, useQueryClient } from '@tanstack/react-query'
import type { AxiosError } from 'axios'
import api from '@/lib/api'
import { toast } from 'sonner'

// --- Tipos de Erro e Evolução ---

// (O tipo de Erro que nossa API retorna)
type ApiErrorResponse = {
	message: string
	status?: 'error'
	errors?: Array<{ campo: string; mensagem: string }>
}

// (O tipo de dado de uma Evolução)
export type Evolucao = {
	id: number
	idInternacao: number
	idProfissional: number
	dataHora: string // ISO String
	descricao: string
}

// --- DTOs (Data Transfer Objects) ---

// (Dados para CRIAR uma evolução - POST /evolucoes)
export type CreateEvolucaoDTO = {
	idInternacao: number
	descricao: string
}

// --- Hook POST (Criar Evolução) ---
const createEvolucao = async (data: CreateEvolucaoDTO): Promise<Evolucao> => {
	const { data: evolucao } = await api.post('/evolucoes', data)
	return evolucao
}

export function useCreateEvolucao() {
	const queryClient = useQueryClient()

	return useMutation<Evolucao, AxiosError<ApiErrorResponse>, CreateEvolucaoDTO>(
		{
			mutationFn: createEvolucao,
			onSuccess: (novaEvolucao) => {
				// Invalida a query da internação específica
				queryClient.invalidateQueries({
					queryKey: ['internacao', novaEvolucao.idInternacao],
				})

				toast.success('Evolução registrada com sucesso!', {
					description: 'O prontuário foi atualizado.',
				})
			},
			onError: (error) => {
				const errorMessage = error.response?.data?.message || error.message
				toast.error('Erro ao salvar evolução', {
					description: errorMessage,
				})
			},
		}
	)
}

// (TODA A LÓGICA DE TRANSCRIÇÃO FOI MOVIDA PARA util.queries.ts)
