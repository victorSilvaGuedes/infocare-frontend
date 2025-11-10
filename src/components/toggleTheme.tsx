'use client'

import * as React from 'react'
import { Moon, Sun } from 'lucide-react'
import { useTheme } from 'next-themes'

import { Button } from '@/components/ui/button'
// Os imports do DropdownMenu foram removidos

export function ModeToggle() {
	// Usamos 'resolvedTheme' para saber o tema atual (mesmo se estiver "system")
	const { setTheme, resolvedTheme } = useTheme()

	// Função que será chamada no clique
	const toggleTheme = () => {
		// Se o tema atual for dark, muda para light. Senão, muda para dark.
		setTheme(resolvedTheme === 'dark' ? 'light' : 'dark')
	}

	return (
		// Removemos o DropdownMenu e o DropdownMenuTrigger,
		// deixando apenas o Button.
		<Button
			variant="outline"
			size="icon"
			onClick={toggleTheme} // Adicionamos o onClick aqui
		>
			{/* Os ícones de Sol e Lua já possuem as classes de transição
        corretas (ex: 'dark:scale-0'), então eles vão
        alternar automaticamente com a mudança do tema.
      */}
			<Sun className="h-[1.2rem] w-[1.2rem] scale-100 rotate-0 transition-all dark:scale-0 dark:-rotate-90" />
			<Moon className="absolute h-[1.2rem] w-[1.2rem] scale-0 rotate-90 transition-all dark:scale-100 dark:rotate-0" />
			<span className="sr-only">Toggle theme</span>
		</Button>
		// O DropdownMenuContent foi removido
	)
}
