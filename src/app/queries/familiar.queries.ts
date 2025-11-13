// Salve como: app/queries/familiar.queries.ts
'use client'

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import type { AxiosError } from 'axios'
import api from '@/lib/api'
import { toast } from 'sonner'
import { useAuthStore } from '@/app/stores/useAuthStore' // Importar o Zustand

// --- Tipos de Dados ---

// 1. Tipo Familiar (baseado no 'familiarSelect' do backend)
export type Familiar = {
	id: number
	nome: string
	cpf: string
	email: string
	telefone: string | null
}

// 2. DTO de Atualização (baseado no 'updateFamiliarSchema')
export type UpdateFamiliarDTO = {
	nome?: string
	email?: string
	telefone?: string // O schema aceita "" (string vazia)
}

export type CreateFamiliarDTO = {
	nome: string
	cpf: string
	email: string
	senha: string
	telefone?: string
}

// Tipo de Erro Padrão
type ApiErrorResponse = {
	message: string
	status?: 'error'
	errors?: Array<{ campo: string; mensagem: string }>
}

// --- Hooks ---

// 3. Hook GET (/me)
const fetchFamiliarMe = async (): Promise<Familiar> => {
	const { data } = await api.get('/familiares/me')
	return data
}

export function useGetFamiliarMe() {
	return useQuery<Familiar, Error>({
		queryKey: ['familiarMe'], // Key específica para o familiar
		queryFn: fetchFamiliarMe,
	})
}

// 4. Hook PUT (/me)
const updateFamiliarMe = async (data: UpdateFamiliarDTO): Promise<Familiar> => {
	const { data: updatedData } = await api.put('/familiares/me', data)
	return updatedData
}

export function useUpdateFamiliarMe() {
	const queryClient = useQueryClient()
	const setUsuarioAuth = useAuthStore((state) => state.setUsuario)

	return useMutation<Familiar, AxiosError<ApiErrorResponse>, UpdateFamiliarDTO>(
		{
			mutationFn: updateFamiliarMe,
			onSuccess: (familiarAtualizado) => {
				// 5. Atualiza o estado global do Zustand
				setUsuarioAuth({
					id: familiarAtualizado.id,
					nome: familiarAtualizado.nome,
					email: familiarAtualizado.email,
					tipo: 'familiar',
				})

				// 6. Invalida a query
				queryClient.invalidateQueries({ queryKey: ['familiarMe'] })
				toast.success('Perfil atualizado com sucesso!')
			},
			onError: (error) => {
				const errorMessage = error.response?.data?.message || error.message
				toast.error('Erro ao atualizar perfil', {
					description: errorMessage,
				})
			},
		}
	)
}

const createFamiliar = async (data: CreateFamiliarDTO): Promise<Familiar> => {
	const { data: newData } = await api.post('/familiares', data)
	return newData
}

export function useCreateFamiliar() {
	// Não precisamos de invalidar queries aqui, pois o usuário não está logado.
	return useMutation<Familiar, AxiosError<ApiErrorResponse>, CreateFamiliarDTO>(
		{
			mutationFn: createFamiliar,
			onSuccess: () => {
				// O backend já envia o e-mail, como vimos no seu código.
				toast.success('Conta criada com sucesso!', {
					description: 'Verifique seu e-mail. Você já pode fazer o login.',
				})
			},
			onError: (error) => {
				const errorMessage =
					error.response?.data?.message || 'Erro ao criar conta.'
				// Ex: "Já existe um usuário com este CPF ou E-mail."
				toast.error('Falha no cadastro', {
					description: errorMessage,
				})
			},
		}
	)
}
