// Salve como: app/queries/profissional.queries.ts
'use client'

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import type { AxiosError } from 'axios'
import api from '@/lib/api'
import { toast } from 'sonner'
import { useAuthStore } from '@/app/stores/useAuthStore'

// --- Tipos de Dados ---

// 1. (CORRIGIDO) Enum 'Especialidade' (baseado no seu Prisma)
export type Especialidade =
	| 'MEDICO'
	| 'ENFERMEIRO'
	| 'TECNICO_ENFERMAGEM'
	| 'FISIOTERAPEUTA'
	| 'NUTRICIONISTA'
	| 'PSICOLOGO'
	| 'OUTRO'

// 2. (CORRIGIDO) Tipo 'Profissional'
export type Profissional = {
	id: number
	nome: string
	cpf: string
	email: string
	telefone: string | null
	crm: string | null
	coren: string | null
	especialidade: Especialidade // <-- Corrigido
}

// 3. (CORRIGIDO) DTO de Atualização
export type UpdateProfissionalDTO = {
	nome?: string
	email?: string
	telefone?: string | null
	especialidade?: Especialidade // <-- Corrigido
	crm?: string | null
	coren?: string | null
}

// Tipo de Erro Padrão
type ApiErrorResponse = {
	message: string
	status?: 'error'
	errors?: Array<{ campo: string; mensagem: string }>
}

// --- Hooks ---

// 4. Hook GET (/me)
const fetchProfissionalMe = async (): Promise<Profissional> => {
	const { data } = await api.get('/profissionais/me')
	return data
}

export function useGetProfissionalMe() {
	return useQuery<Profissional, Error>({
		queryKey: ['profissionalMe'],
		queryFn: fetchProfissionalMe,
	})
}

// 5. Hook PUT (/me)
const updateProfissionalMe = async (
	data: UpdateProfissionalDTO
): Promise<Profissional> => {
	const { data: updatedData } = await api.put('/profissionais/me', data)
	return updatedData
}

export function useUpdateProfissionalMe() {
	const queryClient = useQueryClient()
	const setUsuarioAuth = useAuthStore((state) => state.setUsuario)

	return useMutation<
		Profissional,
		AxiosError<ApiErrorResponse>,
		UpdateProfissionalDTO
	>({
		mutationFn: updateProfissionalMe,
		onSuccess: (profissionalAtualizado) => {
			// Atualiza o Zustand (para o "Olá, Nome" mudar)
			setUsuarioAuth({
				id: profissionalAtualizado.id,
				nome: profissionalAtualizado.nome,
				email: profissionalAtualizado.email,
				tipo: 'profissional',
			})

			// Invalida a query do 'useGetProfissionalMe'
			queryClient.invalidateQueries({ queryKey: ['profissionalMe'] })

			toast.success('Perfil atualizado com sucesso!')
		},
		onError: (error) => {
			const errorMessage = error.response?.data?.message || error.message
			toast.error('Erro ao atualizar perfil', {
				description: errorMessage,
			})
		},
	})
}
