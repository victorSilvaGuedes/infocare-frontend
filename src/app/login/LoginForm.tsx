// app/login/LoginForm.tsx
'use client'

import { z } from 'zod'
import { zodResolver } from '@hookform/resolvers/zod'
import { useForm } from 'react-hook-form'
import { useRouter } from 'next/navigation'
import { useMutation } from '@tanstack/react-query'
import { toast } from 'sonner'
import { AxiosError } from 'axios'
import { useState } from 'react'
import Link from 'next/link'
import Image from 'next/image'

// Nossos imports internos
import { useAuthStore } from '@/app/stores/useAuthStore'
import api from '@/lib/api'

// Imports dos componentes Shadcn/UI
import { Button } from '@/components/ui/button'
import {
	Form,
	FormControl,
	FormField,
	FormItem,
	FormLabel,
	FormMessage,
} from '@/components/ui/form'
import { Input } from '@/components/ui/input'
import {
	Card,
	CardContent,
	CardDescription,
	CardHeader,
	CardTitle,
} from '@/components/ui/card'
// Imports do Radio Group (correto)
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group'

import { Lock, Mail, User, Eye, EyeOff } from 'lucide-react'

// ======================================================
// A CORREÇÃO ESTÁ AQUI
// ======================================================
const loginFormSchema = z.object({
	email: z.string().email({ message: 'Por favor, insira um email válido.' }),
	senha: z
		.string()
		.min(6, { message: 'A senha deve ter pelo menos 6 caracteres.' }),

	// A propriedade correta é 'message'
	tipoUsuario: z.enum(['profissional', 'familiar'], {
		message: 'Você deve selecionar um tipo de usuário.',
	}),
})
// ======================================================
// FIM DA CORREÇÃO
// ======================================================

type LoginFormValues = z.infer<typeof loginFormSchema>

// --- Tipos de Resposta da API (Permanecem os mesmos) ---
type Usuario = {
	id: number
	nome: string
	email: string
	tipo: 'profissional' | 'familiar'
}

type LoginResponse = {
	token: string
	usuario: Usuario
}

type ApiErrorResponse = {
	message: string
	status?: 'error'
	errors?: Array<{ campo: string; mensagem: string }>
}

// --- O Componente ---
export function LoginForm() {
	const router = useRouter()
	const { login } = useAuthStore()
	const [showPassword, setShowPassword] = useState(false)

	const form = useForm<LoginFormValues>({
		resolver: zodResolver(loginFormSchema),
		defaultValues: {
			email: '',
			senha: '',
			tipoUsuario: undefined,
		},
	})

	// --- Lógica de Mutação (Permanece a mesma) ---
	const loginMutation = useMutation<
		LoginResponse,
		AxiosError<ApiErrorResponse>,
		LoginFormValues
	>({
		mutationFn: async (data) => {
			const endpoint =
				data.tipoUsuario === 'profissional'
					? '/profissionais/login'
					: '/familiares/login'

			const response = await api.post(endpoint, {
				email: data.email,
				senha: data.senha,
			})
			return response.data
		},
		onSuccess: (data) => {
			login(data.token, data.usuario)

			const destino =
				data.usuario.tipo === 'profissional' ? '/profissional' : '/familiar'

			toast.success('Login realizado com sucesso!', {
				description: `Bem-vindo(a), ${data.usuario.nome}.`,
			})
			router.push(destino)
		},
		onError: (error) => {
			let errorMessage = 'Ocorreu um erro. Tente novamente.'
			if (error.response?.data?.message) {
				errorMessage = error.response.data.message
			}
			toast.error('Falha no Login', {
				description: errorMessage,
			})
		},
	})

	const isLoading = loginMutation.isPending

	function onSubmit(data: LoginFormValues) {
		loginMutation.mutate(data)
	}

	// --- JSX (Com o RadioGroup) ---
	return (
		<Card className="w-full max-w-sm center">
			<Image
				src="/logo.png"
				alt="Logo InfoCare"
				className="mx-auto"
				width={100}
				height={100}
			/>
			<CardHeader>
				<CardTitle className="text-2xl">InfoCare</CardTitle>
				<CardDescription>Acesse sua conta para continuar.</CardDescription>
			</CardHeader>
			<CardContent>
				<Form {...form}>
					<form
						onSubmit={form.handleSubmit(onSubmit)}
						className="space-y-6"
					>
						{/* Campo: Tipo de Usuário (RadioGroup) */}
						<FormField
							control={form.control}
							name="tipoUsuario"
							render={({ field }) => (
								<FormItem className="space-y-3">
									<FormLabel>
										<User className="mr-2 h-4 w-4 inline-block align-middle" />
										Eu sou:
									</FormLabel>
									<FormControl>
										<RadioGroup
											onValueChange={field.onChange}
											defaultValue={field.value}
											className="flex space-x-4"
											disabled={isLoading}
										>
											<FormItem className="flex items-center space-x-2 space-y-0">
												<FormControl>
													<RadioGroupItem value="profissional" />
												</FormControl>
												<FormLabel className="font-normal">
													Profissional
												</FormLabel>
											</FormItem>
											<FormItem className="flex items-center space-x-2 space-y-0">
												<FormControl>
													<RadioGroupItem value="familiar" />
												</FormControl>
												<FormLabel className="font-normal">Familiar</FormLabel>
											</FormItem>
										</RadioGroup>
									</FormControl>
									<FormMessage />
								</FormItem>
							)}
						/>

						{/* Campo: Email */}
						<FormField
							control={form.control}
							name="email"
							render={({ field }) => (
								<FormItem>
									<FormLabel>
										<Mail className="mr-2 h-4 w-4 inline-block align-middle" />
										Email:
									</FormLabel>
									<FormControl>
										<Input
											placeholder="seu@email.com"
											type="email"
											{...field}
											disabled={isLoading}
										/>
									</FormControl>
									<FormMessage />
								</FormItem>
							)}
						/>

						{/* Campo: Senha */}
						<FormField
							control={form.control}
							name="senha"
							render={({ field }) => (
								<FormItem>
									<FormLabel>
										<Lock className="mr-2 h-4 w-4 inline-block align-middle" />
										Senha:
									</FormLabel>
									<FormControl>
										<div className="relative">
											<Input
												placeholder="••••••••"
												type={showPassword ? 'text' : 'password'}
												{...field}
												disabled={isLoading}
												className="pr-10"
											/>
											<Button
												type="button"
												variant="ghost"
												size="icon"
												className="absolute right-2 top-1/2 -translate-y-1/2 h-7 w-7 text-muted-foreground"
												onClick={() => setShowPassword(!showPassword)}
												disabled={isLoading}
												tabIndex={-1}
											>
												{showPassword ? (
													<EyeOff className="h-4 w-4" />
												) : (
													<Eye className="h-4 w-4" />
												)}
												<span className="sr-only">
													{showPassword ? 'Ocultar senha' : 'Mostrar senha'}
												</span>
											</Button>
										</div>
									</FormControl>
									<FormMessage />
								</FormItem>
							)}
						/>

						{/* Botão de Submit */}
						<Button
							type="submit"
							className="w-full"
							disabled={isLoading}
						>
							{isLoading ? 'Entrando...' : 'Entrar'}
						</Button>
					</form>
				</Form>

				{/* Link de Registro */}
				<div className="mt-4 text-center text-sm">
					Não tem uma conta?{' '}
					<Link
						href="/registrar"
						className="underline hover:text-primary"
					>
						Crie agora
					</Link>
				</div>
			</CardContent>
		</Card>
	)
}
