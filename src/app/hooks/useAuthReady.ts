'use client'

import { useAuthStore } from '@/app/stores/useAuthStore'

/**
 * Hook que centraliza o estado de autenticação e hidratação.
 * Ele só retorna `ready = true` quando a reidratação terminou.
 */
export function useAuthReady() {
	const { isHydrating, isAuthenticated, usuario } = useAuthStore()

	const ready = !isHydrating
	const logged = isAuthenticated && !!usuario

	return {
		ready, // indica que o Zustand terminou de carregar o storage
		logged, // indica que há um usuário autenticado
		usuario, // o usuário reidratado
	}
}
