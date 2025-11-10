// Salve como: app/components/EditInternacaoDialog.tsx
'use client'

import { useEffect } from 'react'
import {
	useGetInternacaoById,
	useUpdateInternacao,
	UpdateInternacaoDTO,
} from '@/app/queries/internacao.queries'

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
import { Textarea } from '@/components/ui/textarea'
import { AppLoader } from './AppLoader'
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'
import { AlertTriangle } from 'lucide-react'

// Schema Zod (baseado no updateInternacaoSchema do backend)
// (Não precisamos do idProfissional aqui por enquanto)
const editInternacaoSchema = z.object({
	diagnostico: z.string().optional(),
	observacoes: z.string().optional(),
	quarto: z.string().optional(),
	leito: z.string().optional(),
})

type EditInternacaoFormValues = z.infer<typeof editInternacaoSchema>

// Props do Dialog
interface EditInternacaoDialogProps {
	internacaoId: number | null
	open: boolean
	onOpenChange: (open: boolean) => void
}

export function EditInternacaoDialog({
	internacaoId,
	open,
	onOpenChange,
}: EditInternacaoDialogProps) {
	// 1. Hooks de Dados
	const {
		data: internacao,
		isLoading,
		isError,
		error,
	} = useGetInternacaoById(internacaoId)

	const { mutate: updateInternacao, isPending: isUpdating } =
		useUpdateInternacao()

	// 2. Configuração do Formulário
	const form = useForm<EditInternacaoFormValues>({
		resolver: zodResolver(editInternacaoSchema),
		defaultValues: {
			diagnostico: '',
			observacoes: '',
			quarto: '',
			leito: '',
		},
	})

	// 3. Efeito para pré-popular o formulário
	useEffect(() => {
		if (internacao) {
			form.reset({
				diagnostico: internacao.diagnostico || '',
				observacoes: internacao.observacoes || '',
				quarto: internacao.quarto || '',
				leito: internacao.leito || '',
			})
		}
	}, [internacao, form])

	// 4. Handler de Submissão
	const onSubmit = (values: EditInternacaoFormValues) => {
		if (!internacaoId) return

		const dataToUpdate: UpdateInternacaoDTO = {
			diagnostico: values.diagnostico || null,
			observacoes: values.observacoes || null,
			quarto: values.quarto || null,
			leito: values.leito || null,
		}

		updateInternacao(
			{ id: internacaoId, ...dataToUpdate },
			{
				onSuccess: () => {
					onOpenChange(false) // Fecha o dialog
				},
			}
		)
	}

	return (
		<Dialog
			open={open}
			onOpenChange={onOpenChange}
		>
			<DialogContent className="sm:max-w-[425px]">
				<DialogHeader>
					<DialogTitle>Editar Internação</DialogTitle>
					<DialogDescription>
						Atualize os dados da internação.
					</DialogDescription>
				</DialogHeader>

				{isLoading && <AppLoader />}

				{isError && (
					<Alert variant="destructive">
						<AlertTriangle className="h-4 w-4" />
						<AlertTitle>Erro</AlertTitle>
						<AlertDescription>
							Não foi possível carregar os dados. {error?.message}
						</AlertDescription>
					</Alert>
				)}

				{internacao && (
					<Form {...form}>
						<form
							onSubmit={form.handleSubmit(onSubmit)}
							className="space-y-4"
						>
							{/* Campos de Quarto e Leito */}
							<div className="grid grid-cols-2 gap-4">
								<FormField
									control={form.control}
									name="quarto"
									render={({ field }) => (
										<FormItem>
											<FormLabel>Quarto</FormLabel>
											<FormControl>
												<Input
													placeholder="Ex: 201"
													{...field}
												/>
											</FormControl>
											<FormMessage />
										</FormItem>
									)}
								/>
								<FormField
									control={form.control}
									name="leito"
									render={({ field }) => (
										<FormItem>
											<FormLabel>Leito</FormLabel>
											<FormControl>
												<Input
													placeholder="Ex: A"
													{...field}
												/>
											</FormControl>
											<FormMessage />
										</FormItem>
									)}
								/>
							</div>

							{/* Campo de Diagnóstico */}
							<FormField
								control={form.control}
								name="diagnostico"
								render={({ field }) => (
									<FormItem>
										<FormLabel>Diagnóstico</FormLabel>
										<FormControl>
											<Textarea
												placeholder="Diagnóstico..."
												{...field}
											/>
										</FormControl>
										<FormMessage />
									</FormItem>
								)}
							/>

							{/* Campo de Observações */}
							<FormField
								control={form.control}
								name="observacoes"
								render={({ field }) => (
									<FormItem>
										<FormLabel>Observações</FormLabel>
										<FormControl>
											<Textarea
												placeholder="Observações..."
												{...field}
											/>
										</FormControl>
										<FormMessage />
									</FormItem>
								)}
							/>

							<DialogFooter>
								<Button
									type="button"
									variant="outline"
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
