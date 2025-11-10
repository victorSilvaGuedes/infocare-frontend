// Crie este arquivo em: app/providers.tsx
'use client' // Obrigatório! Provedores usam contexto, que é do lado do cliente.

import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import React from 'react'

export default function Providers({ children }: { children: React.ReactNode }) {
	// Criamos uma instância do QueryClient.
	// Usamos useState para garantir que esta instância
	// seja criada apenas uma vez por ciclo de vida do componente,
	// evitando recriações em re-renders.
	const [queryClient] = React.useState(
		() =>
			new QueryClient({
				defaultOptions: {
					queries: {
						// Configuração padrão: não tenta buscar dados novamente
						// quando a janela ganha foco. Em mobile, isso é
						// menos útil e economiza dados.
						refetchOnWindowFocus: false,
						// Tempo de cache padrão
						staleTime: 1000 * 60 * 5, // 5 minutos
					},
				},
			})
	)

	return (
		<QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
	)
}
