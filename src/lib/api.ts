// app/lib/api.ts
import axios from 'axios'
import { useAuthStore } from '@/app/stores/useAuthStore'

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3333'

const api = axios.create({
	baseURL: API_BASE_URL,
})

// --- Interceptor de REQUISIÇÃO ---
api.interceptors.request.use(
	(config) => {
		const { token } = useAuthStore.getState()
		if (token) {
			config.headers.Authorization = `Bearer ${token}`
		}
		return config
	},
	(error) => {
		return Promise.reject(error)
	}
)

// --- Interceptor de RESPOSTA ---
api.interceptors.response.use(
	(response) => {
		return response
	},
	(error) => {
		if (axios.isAxiosError(error) && error.response) {
			if (error.response.status === 401) {
				// ======================================================
				// CORREÇÃO 1: (TS18048) Garantir que é sempre string
				// ======================================================
				const originalRequestUrl = error.config?.url || ''
				// ======================================================

				// ======================================================
				// CORREÇÃO 2: (Lógica) Usar .endsWith()
				// ======================================================
				if (
					originalRequestUrl.endsWith('/profissionais/login') ||
					originalRequestUrl.endsWith('/familiares/login')
				) {
					// É um 401 da tela de login (Credenciais inválidas)
					// Deixa o 'onError' do useMutation (no LoginForm) tratar.
					return Promise.reject(error)
				}
				// ======================================================

				// É um 401 de qualquer outra rota (Token expirado)
				console.error(
					'Erro 401: Não autorizado (Token expirado?). Deslogando usuário.'
				)

				const { logout } = useAuthStore.getState()
				logout()

				if (typeof window !== 'undefined') {
					window.location.href = '/login'
				}
			}
		}

		// Para todos os outros erros (500, 404, 403, etc.)
		return Promise.reject(error)
	}
)

export default api
