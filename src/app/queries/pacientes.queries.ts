// app/queries/pacientes.queries.ts
'use client'

// 1. ADICIONE useMutation, useQueryClient
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import type { AxiosError } from 'axios' // 1. IMPORTAR O TIPO DE ERRO DO AXIOS
import api from '@/lib/api'
import { Paciente } from '@/lib/types'
import { toast } from 'sonner'

// --- Tipo para os dados de CRIAÇÃO (Baseado no Zod do backend) ---
export type CreatePacienteDTO = {
	nome: string
	cpf: string
	dataNascimento: Date // O formulário usará Date
	tipoSanguineo?: string
	telefone?: string
}

// 2. (NOVO) TIPO PARA A RESPOSTA DE ERRO DA NOSSA API
type ApiErrorResponse = {
	message: string
	status?: 'error'
	errors?: Array<{ campo: string; mensagem: string }>
}

// --- (Existente) Hook GET ---
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

// --- (NOVO) Hook POST (Criar Paciente) ---
const createPaciente = async (
	pacienteData: CreatePacienteDTO
): Promise<Paciente> => {
	const { data } = await api.post('/pacientes', pacienteData)
	return data
}

export function useCreatePaciente() {
	const queryClient = useQueryClient()

	// 3. ATUALIZAR O TIPO DE ERRO GENÉRICO
	return useMutation<
		Paciente,
		AxiosError<ApiErrorResponse>, // <--- DE Error PARA AxiosError
		CreatePacienteDTO
	>({
		mutationFn: createPaciente,
		onSuccess: (novoPaciente) => {
			queryClient.invalidateQueries({ queryKey: ['pacientes'] })
			toast.success('Paciente criado com sucesso!', {
				description: `${novoPaciente.nome} foi adicionado.`,
			})
		},
		// 4. ATUALIZAR A ASSINATURA do onError
		onError: (error) => {
			// <--- REMOVIDO o ': any'
			// 'error' agora é do tipo AxiosError<ApiErrorResponse>
			const errorMessage = error.response?.data?.message || error.message
			toast.error('Erro ao criar paciente', {
				description: errorMessage,
			})
		},
	})
}

// --- (NOVO) Hook DELETE (Excluir Paciente) ---
const deletePaciente = async (pacienteId: number): Promise<void> => {
	await api.delete(`/pacientes/${pacienteId}`)
}

export function useDeletePaciente() {
	const queryClient = useQueryClient()

	// 5. ATUALIZAR O TIPO DE ERRO GENÉRICO
	return useMutation<
		void,
		AxiosError<ApiErrorResponse>, // <--- DE Error PARA AxiosError
		number
	>({
		mutationFn: deletePaciente,
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: ['pacientes'] })
			toast.success('Paciente excluído com sucesso.')
		},
		// 6. ATUALIZAR A ASSINATURA do onError
		onError: (error) => {
			// <--- REMOVIDO o ': any'
			const errorMessage = error.response?.data?.message || error.message
			toast.error('Erro ao excluir paciente', {
				description: errorMessage,
			})
		},
	})
}

export type UpdatePacienteData = Partial<CreatePacienteDTO> & { id: number }

// --- (NOVO) Tipo de Resposta de Paciente Único ---
// O endpoint GET /pacientes/:id retorna o mesmo tipo Paciente
const fetchPacienteById = async (pacienteId: number): Promise<Paciente> => {
	const { data } = await api.get(`/pacientes/${pacienteId}`)
	return data
}

export function usePacienteById(pacienteId: number | null | undefined) {
	return useQuery<Paciente, Error>({
		// A query key é um array. O segundo item é o ID.
		queryKey: ['paciente', pacienteId],
		queryFn: () => fetchPacienteById(pacienteId!), // O '!' é seguro por causa do 'enabled'
		// 'enabled: !!pacienteId' é crucial:
		// Isso previne que a query rode com um ID 'undefined'
		// quando o dialog estiver fechado.
		enabled: !!pacienteId,
	})
}

// --- (NOVO) Hook PUT (Atualizar Paciente) ---
const updatePaciente = async ({
	id,
	...pacienteData
}: UpdatePacienteData): Promise<Paciente> => {
	// O 'pacienteData' contém os campos (nome, cpf, etc.)
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
			// 1. Invalida a lista de pacientes (para atualizar a UI)
			queryClient.invalidateQueries({ queryKey: ['pacientes'] })

			// 2. Invalida o cache deste paciente específico
			queryClient.invalidateQueries({
				queryKey: ['paciente', pacienteAtualizado.id],
			})

			// 3. (Opcional, mas recomendado) Atualiza o cache imediatamente
			// Se não fizermos isso, o dialog pode mostrar dados antigos
			// se for reaberto antes da invalidação (ponto 2) completar.
			queryClient.setQueryData(
				['paciente', pacienteAtualizado.id],
				pacienteAtualizado
			)

			toast.success('Paciente atualizado com sucesso!', {
				description: `${pacienteAtualizado.nome} foi atualizado.`,
			})
		},
		onError: (error) => {
			const errorMessage = error.response?.data?.message || error.message
			toast.error('Erro ao atualizar paciente', {
				description: errorMessage,
			})
		},
	})
}
