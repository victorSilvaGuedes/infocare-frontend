// app/stores/useAuthStore.ts
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
		}),
		{
			name: 'infocare-auth-storage',
			storage: createJSONStorage(() => localStorage),

			// Versão compatível com os tipos do zustand persist:
			// a função externa é chamada antes da reidratação e pode retornar
			// uma função que será chamada após a reidratação com (state?, error?)
			onRehydrateStorage: () => (state) => {
				if (state) {
					// Mutamos o objeto reidratado para marcar que a hidratação terminou.
					state.isHydrating = false
				}
			},
		}
	)
)
