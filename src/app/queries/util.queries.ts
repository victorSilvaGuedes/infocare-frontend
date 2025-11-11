// Salve como: app/queries/evolucao.queries.ts

'use client'

import { useMutation, useQueryClient } from '@tanstack/react-query'
import type { AxiosError } from 'axios'
import api from '@/lib/api' // (Certifique-se que o seu apiClient (axios) está em '@/lib/api')
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

// (Dados para TRANSCREVER - POST /evolucoes/transcrever)
// O FormData aceita File | Blob
export type TranscribeAudioDTO = {
	audioFile: Blob
}

// (Tipo da Resposta da Transcrição)
// Esta é a definição correta que bate com o backend
export type TranscribeAudioResponse = {
	transcricao: string
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
				// Quando uma evolução é criada, invalidamos a query
				// da internação específica, para que ela recarregue
				// com a nova evolução na lista (quando formos ver detalhes).
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

// --- Hook POST (Transcrever Áudio) ---
const transcribeAudio = async (
	data: TranscribeAudioDTO
): Promise<TranscribeAudioResponse> => {
	const formData = new FormData() // O backend (multer) vai esperar pelo campo 'audio'
	formData.append('audio', data.audioFile)

	const response = await api.post('/util/transcrever', formData, {
		headers: {
			'Content-Type': 'multipart/form-data',
		},
	})
	// response.data aqui será { transcricao: "..." }
	return response.data
}

export function useTranscribeAudio() {
	// Não precisamos invalidar queries aqui
	return useMutation<
		TranscribeAudioResponse, // <-- Usa o tipo correto
		AxiosError<ApiErrorResponse>,
		TranscribeAudioDTO
	>({
		mutationFn: transcribeAudio,
		onSuccess: () => {
			toast.success('Áudio transcrito com sucesso!')
		},
		onError: (error) => {
			const errorMessage =
				error.response?.data?.message || 'Falha ao conectar com o servidor.'
			toast.error('Erro ao transcrever áudio', {
				description: errorMessage,
			})
		},
	})
}
