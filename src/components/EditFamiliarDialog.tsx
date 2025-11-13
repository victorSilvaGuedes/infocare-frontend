// Salve como: app/components/EditFamiliarDialog.tsx
'use client'

import { useEffect } from 'react'
import {
	useGetFamiliarMe,
	useUpdateFamiliarMe,
} from '@/app/queries/familiar.queries'
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

// --- Função de Máscara (copiada do CreatePacienteDialog) ---
const maskTelefone = (value: string) => {
	return value
		.replace(/\D/g, '')
		.replace(/(\d{2})(\d)/, '($1) $2')
		.replace(/(\d{5})(\d)/, '$1-$2')
		.replace(/(\d{4})-(\d)(\d{4})/, '$1$2-$3')
		.substring(0, 15)
}

// 1. Schema Zod (baseado no updateFamiliarSchema do backend)
const editFamiliarSchema = z.object({
	nome: z.string().min(3, { message: 'Nome deve ter no mínimo 3 caracteres.' }),
	email: z.string().email({ message: 'E-mail inválido.' }),
	telefone: z
		.string()
		.optional()
		.transform((val) => (val === '' ? undefined : val)),
})

type EditFormValues = z.infer<typeof editFamiliarSchema>

// 2. Props do Dialog
interface EditFamiliarDialogProps {
	open: boolean
	onOpenChange: (open: boolean) => void
}

export function EditFamiliarDialog({
	open,
	onOpenChange,
}: EditFamiliarDialogProps) {
	// 3. Hooks de Dados
	const { data: familiar, isLoading, isError, error } = useGetFamiliarMe()
	const { mutate: updateProfile, isPending: isUpdating } = useUpdateFamiliarMe()

	// 4. Configuração do Formulário
	const form = useForm({
		resolver: zodResolver(editFamiliarSchema),
		defaultValues: {
			nome: '',
			email: '',
			telefone: '',
		},
	})

	// 5. Efeito para pré-popular o formulário
	useEffect(() => {
		if (familiar) {
			form.reset({
				nome: familiar.nome,
				email: familiar.email,
				telefone: familiar.telefone || '',
			})
		}
	}, [familiar, form, open])

	// 6. Handler de Submissão
	const onSubmit = (values: EditFormValues) => {
		updateProfile(values, {
			onSuccess: () => {
				onOpenChange(false) // Fecha o dialog
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

				{familiar && (
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
