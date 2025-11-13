// Salve em: app/stores/useAuthStore.ts
// (Versão ATUALIZADA com a ação setUsuario)

import { create } from 'zustand'
import { createJSONStorage, persist } from 'zustand/middleware'

type Usuario = {
	id: number
	nome: string
	email: string
	tipo: 'profissional' | 'familiar'
}

interface AuthState {
	token: string | null
	usuario: Usuario | null
	isAuthenticated: boolean
	isHydrating: boolean
	login: (token: string, usuario: Usuario) => void
	logout: () => void
	setUsuario: (usuario: Usuario) => void // <--- 1. (NOVO) Adicione a ação ao tipo
}

export const useAuthStore = create<AuthState>()(
	persist(
		(set) => ({
			token: null,
			usuario: null,
			isAuthenticated: false,
			isHydrating: true,

			login: (token, usuario) =>
				set({
					token,
					usuario,
					isAuthenticated: true,
				}),

			logout: () =>
				set({
					token: null,
					usuario: null,
					isAuthenticated: false,
				}),

			// 2. (NOVO) Adicione a implementação da ação
			// Ela atualiza apenas os dados do 'usuario' e mantém o 'token'
			setUsuario: (usuario) => set((state) => ({ ...state, usuario })),
		}),
		{
			name: 'infocare-auth-storage',
			storage: createJSONStorage(() => localStorage),

			onRehydrateStorage: () => (state) => {
				if (state) {
					state.isHydrating = false
				}
			},
		}
	)
)
