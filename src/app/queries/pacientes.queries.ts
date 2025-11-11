// Salve em: app/queries/pacientes.queries.ts
// (Versão ATUALIZADA com 'Internacao' e 'PacienteDetails')

'use client'

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import type { AxiosError } from 'axios'
import api from '@/lib/api'
import { Paciente } from '@/lib/types' // O seu tipo 'Paciente' básico
import { toast } from 'sonner'

// 1. (NOVO) Importar o tipo Internacao (básico)
// (Assumindo que 'internacao.queries.ts' exporta este tipo)
// Se der erro aqui, crie o tipo: export type Internacao = { [qualquercoisa]: any }
// (Idealmente, importe o tipo 'Internacao' que definimos em 'internacao.queries.ts')
import { Internacao } from './internacao.queries'

// --- Tipos de DTOs e Erros (Existentes) ---

export type CreatePacienteDTO = {
	nome: string
	cpf: string
	dataNascimento: Date
	tipoSanguineo?: string
	telefone?: string
}

type ApiErrorResponse = {
	message: string
	status?: 'error'
	errors?: Array<{ campo: string; mensagem: string }>
}

export type UpdatePacienteData = Partial<CreatePacienteDTO> & { id: number }

// 2. (NOVO) Tipo de Detalhes do Paciente
// (Inclui as internações, como o backend envia em GET /pacientes/:id)
export type PacienteDetails = Paciente & {
	internacoes: Internacao[] // <--- A ADIÇÃO CRÍTICA
}

// --- Hooks GET (Listagem - sem alteração) ---
const fetchPacientes = async (): Promise<Paciente[]> => {
	const { data } = await api.get('/pacientes')
	return data
}

export function usePacientes() {
	return useQuery<Paciente[], Error>({
		queryKey: ['pacientes'],
		queryFn: fetchPacientes,
	})
}

// --- 3. (ATUALIZADO) Hook GET (Buscar por ID) ---
const fetchPacienteById = async (
	pacienteId: number
): Promise<PacienteDetails> => {
	// <--- ATUALIZADO TIPO DE RETORNO
	const { data } = await api.get(`/pacientes/${pacienteId}`)
	return data
}

export function usePacienteById(pacienteId: number | null | undefined) {
	return useQuery<PacienteDetails, Error>({
		// <--- ATUALIZADO TIPO DE RETORNO
		queryKey: ['paciente', pacienteId],
		queryFn: () => fetchPacienteById(pacienteId!),
		enabled: !!pacienteId,
	})
}

// --- Hooks de Mutação (POST, PUT, DELETE - sem alteração) ---

// (useCreatePaciente - sem alteração)
const createPaciente = async (
	pacienteData: CreatePacienteDTO
): Promise<Paciente> => {
	const { data } = await api.post('/pacientes', pacienteData)
	return data
}
export function useCreatePaciente() {
	const queryClient = useQueryClient()
	return useMutation<Paciente, AxiosError<ApiErrorResponse>, CreatePacienteDTO>(
		{
			mutationFn: createPaciente,
			onSuccess: (novoPaciente) => {
				queryClient.invalidateQueries({ queryKey: ['pacientes'] })
				toast.success('Paciente criado com sucesso!', {
					description: `${novoPaciente.nome} foi adicionado.`,
				})
			},
			onError: (error) => {
				const errorMessage = error.response?.data?.message || error.message
				toast.error('Erro ao criar paciente', {
					description: errorMessage,
				})
			},
		}
	)
}

// (useUpdatePaciente - sem alteração)
const updatePaciente = async ({
	id,
	...pacienteData
}: UpdatePacienteData): Promise<Paciente> => {
	const { data } = await api.put(`/pacientes/${id}`, pacienteData)
	return data
}
export function useUpdatePaciente() {
	const queryClient = useQueryClient()
	return useMutation<
		Paciente,
		AxiosError<ApiErrorResponse>,
		UpdatePacienteData
	>({
		mutationFn: updatePaciente,
		onSuccess: (pacienteAtualizado) => {
			queryClient.invalidateQueries({ queryKey: ['pacientes'] })
			queryClient.invalidateQueries({
				queryKey: ['paciente', pacienteAtualizado.id],
			})
			queryClient.setQueryData(
				['paciente', pacienteAtualizado.id],
				pacienteAtualizado
			)
			toast.success('Paciente atualizado com sucesso!')
		},
		onError: (error) => {
			const errorMessage = error.response?.data?.message || error.message
			toast.error('Erro ao atualizar paciente', {
				description: errorMessage,
			})
		},
	})
}

// (useDeletePaciente - sem alteração)
const deletePaciente = async (pacienteId: number): Promise<void> => {
	await api.delete(`/pacientes/${pacienteId}`)
}
export function useDeletePaciente() {
	const queryClient = useQueryClient()
	return useMutation<void, AxiosError<ApiErrorResponse>, number>({
		mutationFn: deletePaciente,
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: ['pacientes'] })
			toast.success('Paciente excluído com sucesso.')
		},
		onError: (error) => {
			const errorMessage = error.response?.data?.message || error.message
			toast.error('Erro ao excluir paciente', {
				description: errorMessage,
			})
		},
	})
}
