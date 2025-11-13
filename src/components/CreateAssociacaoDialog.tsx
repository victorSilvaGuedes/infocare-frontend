// Salve como: app/components/CreateAssociacaoDialog.tsx
'use client'

import { z } from 'zod'
import { zodResolver } from '@hookform/resolvers/zod'
import { useForm } from 'react-hook-form'
// (NOVO) Importar o hook de criação
import { useCreateAssociacao } from '@/app/queries/familiar-associacoes.queries'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import {
	Dialog,
	DialogContent,
	DialogDescription,
	DialogFooter,
	DialogHeader,
	DialogTitle,
} from '@/components/ui/dialog'
import {
	Form,
	FormControl,
	FormField,
	FormItem,
	FormLabel,
	FormMessage,
} from '@/components/ui/form'
import { Alert, AlertDescription, AlertTitle } from './ui/alert'
import { Info } from 'lucide-react'

// Zod Schema
const formSchema = z.object({
	// Usamos 'coerce' para converter a string do input para número
	idInternacao: z.coerce
		.number({ message: 'O ID deve ser um número.' })
		.int()
		.positive({ message: 'O ID da internação é obrigatório.' }),
})

type FormValues = z.infer<typeof formSchema>

interface CreateAssociacaoDialogProps {
	open: boolean
	onOpenChange: (open: boolean) => void
}

export function CreateAssociacaoDialog({
	open,
	onOpenChange,
}: CreateAssociacaoDialogProps) {
	const { mutateAsync: createAssociacao, isPending } = useCreateAssociacao()

	const form = useForm({
		resolver: zodResolver(formSchema),
		defaultValues: {
			idInternacao: undefined,
		},
	})

	const onSubmit = async (data: FormValues) => {
		const payload = { idInternacao: Number(data.idInternacao) }
		await createAssociacao(payload)
		onOpenChange(false)
	}

	// Reseta o formulário ao fechar
	const handleOpenChange = (isOpen: boolean) => {
		onOpenChange(isOpen)
		if (!isOpen) {
			form.reset()
		}
	}

	return (
		<Dialog
			open={open}
			onOpenChange={handleOpenChange}
		>
			<DialogContent className="sm:max-w-[425px]">
				<Form {...form}>
					<form onSubmit={form.handleSubmit(onSubmit)}>
						<DialogHeader>
							<DialogTitle>Solicitar Nova Associação</DialogTitle>
							<DialogDescription>
								Insira o ID da internação do paciente que você deseja
								acompanhar.
							</DialogDescription>
						</DialogHeader>

						<div className="space-y-4 py-4">
							<Alert>
								<Info className="h-4 w-4" />
								<AlertTitle className="font-semibold">
									Onde encontro o ID?
								</AlertTitle>
								<AlertDescription>
									O ID da internação é fornecido pelo profissional de saúde
									responsável (ex: médico, enfermeiro) no hospital.
								</AlertDescription>
							</Alert>

							<FormField
								control={form.control}
								name="idInternacao"
								render={({ field }) => (
									<FormItem>
										<FormLabel>ID da Internação</FormLabel>
										<FormControl>
											<Input
												type="number"
												placeholder="Ex: 123"
												{...field}
												value={
													(field.value as string | number | undefined) ?? ''
												}
												disabled={isPending}
											/>
										</FormControl>
										<FormMessage />
									</FormItem>
								)}
							/>
						</div>

						<DialogFooter>
							<Button
								type="button"
								variant="outline"
								onClick={() => onOpenChange(false)}
								disabled={isPending}
							>
								Cancelar
							</Button>
							<Button
								type="submit"
								disabled={isPending}
							>
								{isPending ? 'Enviando...' : 'Enviar Solicitação'}
							</Button>
						</DialogFooter>
					</form>
				</Form>
			</DialogContent>
		</Dialog>
	)
}
