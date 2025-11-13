// Salve como: app/(public)/register/familiar/page.tsx
'use client'

import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { z } from 'zod'
import { zodResolver } from '@hookform/resolvers/zod'
import { useForm } from 'react-hook-form'
import { useState } from 'react'
import { useCreateFamiliar } from '@/app/queries/familiar.queries'

// UI
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import {
	Form,
	FormControl,
	FormField,
	FormItem,
	FormLabel,
	FormMessage,
} from '@/components/ui/form'
import { ArrowLeft, Loader2, Eye, EyeOff } from 'lucide-react'

// --- Funções de Máscara ---
const maskCPF = (value: string) => {
	return value
		.replace(/\D/g, '')
		.replace(/(\d{3})(\d)/, '$1.$2')
		.replace(/(\d{3})(\d)/, '$1.$2')
		.replace(/(\d{3})(\d{1,2})$/, '$1-$2')
		.substring(0, 14)
}

const maskTelefone = (value: string) => {
	return value
		.replace(/\D/g, '')
		.replace(/(\d{2})(\d)/, '($1) $2')
		.replace(/(\d{5})(\d)/, '$1-$2')
		.replace(/(\d{4})-(\d)(\d{4})/, '$1$2-$3')
		.substring(0, 15)
}
// --- Fim das Funções de Máscara ---

// 1. Schema Zod (com confirmação de senha)
const formSchema = z
	.object({
		nome: z
			.string()
			.min(3, { message: 'Nome deve ter no mínimo 3 caracteres.' }),
		cpf: z
			.string()
			.length(14, { message: 'CPF deve estar no formato xxx.xxx.xxx-xx' }),
		email: z.string().email({ message: 'E-mail inválido.' }),
		telefone: z
			.string()
			.optional()
			.transform((val) => (val === '' ? undefined : val)),
		senha: z
			.string()
			.min(6, { message: 'Senha deve ter no mínimo 6 caracteres.' }),
		confirmarSenha: z.string(),
	})
	.refine((data) => data.senha === data.confirmarSenha, {
		message: 'As senhas não coincidem.',
		path: ['confirmarSenha'], // Onde o erro deve aparecer
	})

type FormValues = z.infer<typeof formSchema>

export default function RegisterFamiliarPage() {
	const router = useRouter()
	const { mutateAsync: createFamiliar, isPending } = useCreateFamiliar()
	const [showPassword, setShowPassword] = useState(false)
	const [showConfirmPassword, setShowConfirmPassword] = useState(false)

	const form = useForm({
		resolver: zodResolver(formSchema),
		defaultValues: {
			nome: '',
			cpf: '',
			email: '',
			telefone: '',
			senha: '',
			confirmarSenha: '',
		},
	})

	// 2. Handler de Submissão
	const onSubmit = async (data: FormValues) => {
		const { ...dto } = data

		try {
			await createFamiliar(dto)
			router.push('/login')
		} catch (error) {
			console.error('Falha ao criar conta:', error)
		}
	}

	return (
		<div className="flex flex-1 flex-col p-6">
			{/* Botão de Voltar */}
			<div className="flex items-start">
				<Button
					variant="ghost"
					size="icon"
					asChild
				>
					<Link href="/login">
						<ArrowLeft className="h-5 w-5" />
					</Link>
				</Button>
			</div>

			{/* Conteúdo Centralizado */}
			<div className="flex flex-1 flex-col items-center justify-center">
				<div className="w-full max-w-sm">
					<div className="mb-6 text-center">
						<h1 className="text-2xl font-bold">Criar Conta (Familiar)</h1>
						<p className="text-muted-foreground">
							Preencha seus dados para se registrar.
						</p>
					</div>

					<Form {...form}>
						<form
							onSubmit={form.handleSubmit(onSubmit)}
							className="space-y-4"
						>
							<FormField
								control={form.control}
								name="nome"
								render={({ field }) => (
									<FormItem>
										<FormLabel>Nome Completo</FormLabel>
										<FormControl>
											<Input
												placeholder="Seu nome"
												{...field}
												disabled={isPending}
											/>
										</FormControl>
										<FormMessage />
									</FormItem>
								)}
							/>
							<FormField
								control={form.control}
								name="cpf"
								render={({ field }) => (
									<FormItem>
										<FormLabel>CPF</FormLabel>
										<FormControl>
											<Input
												placeholder="xxx.xxx.xxx-xx"
												{...field}
												onChange={(e) =>
													field.onChange(maskCPF(e.target.value))
												}
												disabled={isPending}
											/>
										</FormControl>
										<FormMessage />
									</FormItem>
								)}
							/>
							<FormField
								control={form.control}
								name="email"
								render={({ field }) => (
									<FormItem>
										<FormLabel>E-mail</FormLabel>
										<FormControl>
											<Input
												type="email"
												placeholder="seu@email.com"
												{...field}
												disabled={isPending}
											/>
										</FormControl>
										<FormMessage />
									</FormItem>
								)}
							/>
							<FormField
								control={form.control}
								name="telefone"
								render={({ field }) => (
									<FormItem>
										<FormLabel>Telefone (Opcional)</FormLabel>
										<FormControl>
											<Input
												placeholder="(xx) xxxxx-xxxx"
												{...field}
												onChange={(e) =>
													field.onChange(maskTelefone(e.target.value))
												}
												disabled={isPending}
											/>
										</FormControl>
										<FormMessage />
									</FormItem>
								)}
							/>

							{/* Campo de Senha com botão de mostrar/ocultar */}
							<FormField
								control={form.control}
								name="senha"
								render={({ field }) => (
									<FormItem>
										<FormLabel>Senha</FormLabel>
										<FormControl>
											<div className="relative">
												<Input
													type={showPassword ? 'text' : 'password'}
													placeholder="Mínimo 6 caracteres"
													{...field}
													disabled={isPending}
													className="pr-10"
												/>
												<Button
													type="button"
													variant="ghost"
													size="icon"
													className="absolute right-2 top-1/2 -translate-y-1/2 h-7 w-7 text-muted-foreground"
													onClick={() => setShowPassword(!showPassword)}
													disabled={isPending}
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

							{/* Campo de Confirmar Senha com botão de mostrar/ocultar */}
							<FormField
								control={form.control}
								name="confirmarSenha"
								render={({ field }) => (
									<FormItem>
										<FormLabel>Confirmar Senha</FormLabel>
										<FormControl>
											<div className="relative">
												<Input
													type={showConfirmPassword ? 'text' : 'password'}
													placeholder="Repita sua senha"
													{...field}
													disabled={isPending}
													className="pr-10"
												/>
												<Button
													type="button"
													variant="ghost"
													size="icon"
													className="absolute right-2 top-1/2 -translate-y-1/2 h-7 w-7 text-muted-foreground"
													onClick={() =>
														setShowConfirmPassword(!showConfirmPassword)
													}
													disabled={isPending}
													tabIndex={-1}
												>
													{showConfirmPassword ? (
														<EyeOff className="h-4 w-4" />
													) : (
														<Eye className="h-4 w-4" />
													)}
													<span className="sr-only">
														{showConfirmPassword
															? 'Ocultar senha'
															: 'Mostrar senha'}
													</span>
												</Button>
											</div>
										</FormControl>
										<FormMessage />
									</FormItem>
								)}
							/>

							<Button
								type="submit"
								className="w-full"
								disabled={isPending}
							>
								{isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
								{isPending ? 'Criando conta...' : 'Criar Conta'}
							</Button>
						</form>
					</Form>

					<div className="mt-4 text-center text-sm">
						Já tem uma conta?{' '}
						<Link
							href="/login"
							className="underline hover:text-primary"
						>
							Faça o login
						</Link>
					</div>
				</div>
			</div>
		</div>
	)
}
