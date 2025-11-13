// Salve como: app/components/EditProfissionalDialog.tsx
'use client'

import { useEffect } from 'react'
import {
	useGetProfissionalMe,
	useUpdateProfissionalMe,
	Especialidade, // 1. (CORRIGIDO)
	UpdateProfissionalDTO,
} from '@/app/queries/profissional.queries'
import { AppLoader } from './AppLoader'

// Zod e React Hook Form
import { z } from 'zod'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'

// UI
import { Button } from '@/components/ui/button'
import {
	Dialog,
	DialogContent,
	DialogHeader,
	DialogTitle,
	DialogDescription,
	DialogFooter,
} from '@/components/ui/dialog'
import {
	Form,
	FormControl,
	FormField,
	FormItem,
	FormLabel,
	FormMessage,
} from '@/components/ui/form'
import { Input } from '@/components/ui/input'
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'
import { AlertTriangle } from 'lucide-react'
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from '@/components/ui/select'

// --- Função de Máscara (Mantida) ---
const maskTelefone = (value: string) => {
	return value
		.replace(/\D/g, '')
		.replace(/(\d{2})(\d)/, '($1) $2')
		.replace(/(\d{5})(\d)/, '$1-$2')
		.replace(/(\d{4})-(\d)(\d{4})/, '$1$2-$3')
		.substring(0, 15)
}

// 2. (CORRIGIDO) Enum Zod
const especialidadeEnum = z.enum([
	'MEDICO',
	'ENFERMEIRO',
	'TECNICO_ENFERMAGEM',
	'FISIOTERAPEUTA',
	'NUTRICIONISTA',
	'PSICOLOGO',
	'OUTRO',
])

// 3. (CORRIGIDO) Schema Zod
const editProfissionalSchema = z.object({
	nome: z.string().min(3, { message: 'Nome deve ter no mínimo 3 caracteres.' }),
	email: z.string().email({ message: 'E-mail inválido.' }),
	telefone: z
		.string()
		.optional()
		.transform((val) => (val === '' ? undefined : val)),
	especialidade: especialidadeEnum, // <-- Corrigido
	crm: z
		.string()
		.optional()
		.transform((val) => (val === '' ? undefined : val)),
	coren: z
		.string()
		.optional()
		.transform((val) => (val === '' ? undefined : val)),
})

type EditFormValues = z.infer<typeof editProfissionalSchema>

interface EditProfissionalDialogProps {
	open: boolean
	onOpenChange: (open: boolean) => void
}

export function EditProfissionalDialog({
	open,
	onOpenChange,
}: EditProfissionalDialogProps) {
	// --- Hooks de Dados ---
	const {
		data: profissional,
		isLoading,
		isError,
		error,
	} = useGetProfissionalMe()
	const { mutate: updateProfile, isPending: isUpdating } =
		useUpdateProfissionalMe()

	// 4. (CORRIGIDO) Configuração do Formulário
	const form = useForm({
		resolver: zodResolver(editProfissionalSchema),
		defaultValues: {
			nome: '',
			email: '',
			telefone: '',
			especialidade: 'OUTRO', // <-- Corrigido
			crm: '',
			coren: '',
		},
	})

	// 5. (CORRIGIDO) "Ouvir" o campo 'especialidade'
	const especialidadeSelecionada = form.watch('especialidade')

	// 6. (CORRIGIDO) Efeito para pré-popular o formulário
	useEffect(() => {
		if (profissional) {
			form.reset({
				nome: profissional.nome,
				email: profissional.email,
				telefone: profissional.telefone || '',
				especialidade: profissional.especialidade, // <-- Corrigido
				crm: profissional.crm || '',
				coren: profissional.coren || '',
			})
		}
	}, [profissional, open, form])

	// 7. (CORRIGIDO) Handler de Submissão
	const onSubmit = (values: EditFormValues) => {
		const dataToUpdate: UpdateProfissionalDTO = {
			...values,
			telefone: values.telefone || null,
			// Lógica para limpar campos irrelevantes
			crm: values.especialidade === 'MEDICO' ? values.crm || null : null,
			coren:
				values.especialidade === 'ENFERMEIRO' ||
				values.especialidade === 'TECNICO_ENFERMAGEM'
					? values.coren || null
					: null,
		}

		updateProfile(dataToUpdate, {
			onSuccess: () => {
				onOpenChange(false)
			},
		})
	}

	return (
		<Dialog
			open={open}
			onOpenChange={onOpenChange}
		>
			<DialogContent className="sm:max-w-[425px]">
				<DialogHeader>
					<DialogTitle>Editar Perfil</DialogTitle>
					<DialogDescription>Atualize seus dados pessoais.</DialogDescription>
				</DialogHeader>

				{isLoading && <AppLoader />}

				{isError && (
					<Alert variant="destructive">
						<AlertTriangle className="h-4 w-4" />
						<AlertTitle>Erro</AlertTitle>
						<AlertDescription>
							Não foi possível carregar seus dados. {error?.message}
						</AlertDescription>
					</Alert>
				)}

				{profissional && (
					<Form {...form}>
						<form
							onSubmit={form.handleSubmit(onSubmit)}
							className="space-y-4"
						>
							{/* Nome */}
							<FormField
								control={form.control}
								name="nome"
								render={({ field }) => (
									<FormItem>
										<FormLabel>Nome</FormLabel>
										<FormControl>
											<Input
												placeholder="Seu nome completo"
												{...field}
											/>
										</FormControl>
										<FormMessage />
									</FormItem>
								)}
							/>
							{/* Email */}
							<FormField
								control={form.control}
								name="email"
								render={({ field }) => (
									<FormItem>
										<FormLabel>E-mail</FormLabel>
										<FormControl>
											<Input
												type="email"
												placeholder="seu.email@exemplo.com"
												{...field}
											/>
										</FormControl>
										<FormMessage />
									</FormItem>
								)}
							/>
							{/* Telefone */}
							<FormField
								control={form.control}
								name="telefone"
								render={({ field }) => (
									<FormItem>
										<FormLabel>Telefone (Opcional)</FormLabel>
										<FormControl>
											<Input
												placeholder="(xx) 9xxxx-xxxx"
												{...field}
												onChange={(e) =>
													field.onChange(maskTelefone(e.target.value))
												}
											/>
										</FormControl>
										<FormMessage />
									</FormItem>
								)}
							/>

							{/* 8. (CORRIGIDO) Campo ESPECIALIDADE (Select) */}
							<FormField
								control={form.control}
								name="especialidade"
								render={({ field }) => (
									<FormItem>
										<FormLabel>Especialidade</FormLabel>
										<Select
											onValueChange={field.onChange}
											value={field.value}
										>
											<FormControl>
												<SelectTrigger>
													<SelectValue placeholder="Selecione a especialidade" />
												</SelectTrigger>
											</FormControl>
											<SelectContent>
												{Object.values(especialidadeEnum.enum).map((esp) => (
													<SelectItem
														key={esp}
														value={esp}
													>
														{/* Formata o texto, ex: TECNICO_ENFERMAGEM -> TECNICO ENFERMAGEM */}
														{esp.replace(/_/g, ' ')}
													</SelectItem>
												))}
											</SelectContent>
										</Select>
										<FormMessage />
									</FormItem>
								)}
							/>

							{/* 9. (CORRIGIDO) Campo CRM (Condicional) */}
							{especialidadeSelecionada === 'MEDICO' && (
								<FormField
									control={form.control}
									name="crm"
									render={({ field }) => (
										<FormItem>
											<FormLabel>CRM (Opcional)</FormLabel>
											<FormControl>
												<Input
													placeholder="000000-SP"
													{...field}
													value={field.value || ''}
												/>
											</FormControl>
											<FormMessage />
										</FormItem>
									)}
								/>
							)}

							{/* 10. (CORRIGIDO) Campo COREN (Condicional) */}
							{(especialidadeSelecionada === 'ENFERMEIRO' ||
								especialidadeSelecionada === 'TECNICO_ENFERMAGEM') && (
								<FormField
									control={form.control}
									name="coren"
									render={({ field }) => (
										<FormItem>
											<FormLabel>Coren (Opcional)</FormLabel>
											<FormControl>
												<Input
													placeholder="0000000-ENF"
													{...field}
													value={field.value || ''}
												/>
											</FormControl>
											<FormMessage />
										</FormItem>
									)}
								/>
							)}

							<DialogFooter className="pt-4">
								<Button
									type="button"
									variant="ghost"
									onClick={() => onOpenChange(false)}
									disabled={isUpdating}
								>
									Cancelar
								</Button>
								<Button
									type="submit"
									disabled={isUpdating || isLoading}
								>
									{isUpdating ? 'Salvando...' : 'Salvar Alterações'}
								</Button>
							</DialogFooter>
						</form>
					</Form>
				)}
			</DialogContent>
		</Dialog>
	)
}
