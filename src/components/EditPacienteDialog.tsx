// Salve como: app/components/EditPacienteDialog.tsx
'use client'

import { useEffect } from 'react'
import {
	usePacienteById,
	useUpdatePaciente,
	CreatePacienteDTO,
} from '@/app/queries/pacientes.queries'
import { AppLoader } from './AppLoader'

import { z } from 'zod'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'

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
import { ScrollArea } from '@/components/ui/scroll-area'

// --- Máscaras ---
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

// --- Schema ---
const updatePacienteSchema = z.object({
	nome: z.string().min(3, { message: 'Nome deve ter no mínimo 3 caracteres.' }),
	cpf: z
		.string()
		.length(14, { message: 'CPF deve estar no formato xxx.xxx.xxx-xx' }),
	dataNascimento: z
		.string()
		.nonempty('Data de nascimento é obrigatória.')
		.regex(/^\d{4}-\d{2}-\d{2}$/, 'Formato de data inválido.'),
	tipoSanguineo: z
		.string()
		.optional()
		.transform((val) => (val === '' || val === 'none' ? undefined : val)),
	telefone: z
		.string()
		.optional()
		.transform((val) => (val === '' ? undefined : val)),
})

type UpdatePacienteFormValues = z.infer<typeof updatePacienteSchema>

// --- Tipos sanguíneos ---
const tiposSanguineos = ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-']

interface EditPacienteDialogProps {
	pacienteId: number | null
	open: boolean
	onOpenChange: (open: boolean) => void
}

export function EditPacienteDialog({
	pacienteId,
	open,
	onOpenChange,
}: EditPacienteDialogProps) {
	const {
		data: paciente,
		isLoading,
		isError,
		error,
	} = usePacienteById(pacienteId)

	const { mutate: updatePaciente, isPending: isUpdating } = useUpdatePaciente()

	const form = useForm({
		resolver: zodResolver(updatePacienteSchema),
		defaultValues: {
			nome: '',
			cpf: '',
			dataNascimento: '',
			tipoSanguineo: '',
			telefone: '',
		},
	})

	useEffect(() => {
		if (paciente) {
			form.reset({
				nome: paciente.nome,
				cpf: paciente.cpf,
				dataNascimento: paciente.dataNascimento
					? new Date(paciente.dataNascimento).toISOString().split('T')[0]
					: '',
				tipoSanguineo: paciente.tipoSanguineo || '',
				telefone: paciente.telefone || '',
			})
		}
	}, [paciente, form])

	// --- onSubmit padronizado ---
	const onSubmit = (values: UpdatePacienteFormValues) => {
		if (!pacienteId) return

		const dataToUpdate: CreatePacienteDTO = {
			nome: values.nome,
			cpf: values.cpf,
			dataNascimento: new Date(values.dataNascimento),
			tipoSanguineo: values.tipoSanguineo,
			telefone: values.telefone,
		}

		updatePaciente(
			{ id: pacienteId, ...dataToUpdate },
			{
				onSuccess: () => {
					onOpenChange(false)
				},
			}
		)
	}

	const handleOpenChange = (isOpen: boolean) => {
		onOpenChange(isOpen)
		if (!isOpen) {
			form.reset({
				nome: '',
				cpf: '',
				dataNascimento: '',
				tipoSanguineo: '',
				telefone: '',
			})
		}
	}

	return (
		<Dialog
			open={open}
			onOpenChange={handleOpenChange}
		>
			<DialogContent className="sm:max-w-[425px]">
				<DialogHeader>
					<DialogTitle>Editar Paciente</DialogTitle>
					<DialogDescription>
						Atualize os dados do paciente e clique em salvar.
					</DialogDescription>
				</DialogHeader>

				{isLoading && <AppLoader />}

				{isError && (
					<Alert variant="destructive">
						<AlertTriangle className="h-4 w-4" />
						<AlertTitle>Erro</AlertTitle>
						<AlertDescription>
							Não foi possível carregar os dados do paciente. {error?.message}
						</AlertDescription>
					</Alert>
				)}

				{paciente && (
					<Form {...form}>
						<form
							onSubmit={form.handleSubmit(onSubmit)}
							className="space-y-4 py-4"
						>
							{/* Nome */}
							<FormField
								control={form.control}
								name="nome"
								render={({ field }) => (
									<FormItem>
										<FormLabel>Nome Completo</FormLabel>
										<FormControl>
											<Input
												placeholder="Nome do paciente"
												{...field}
												disabled={isUpdating}
											/>
										</FormControl>
										<FormMessage />
									</FormItem>
								)}
							/>

							{/* CPF */}
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
												disabled={isUpdating}
											/>
										</FormControl>
										<FormMessage />
									</FormItem>
								)}
							/>

							{/* Data de Nascimento (igual CreatePacienteDialog) */}
							<FormField
								control={form.control}
								name="dataNascimento"
								render={({ field }) => (
									<FormItem>
										<FormLabel>Data de Nascimento</FormLabel>
										<FormControl>
											<Input
												type="date"
												value={field.value || ''}
												onChange={(e) => field.onChange(e.target.value)}
												disabled={isUpdating}
												className="w-full"
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
												placeholder="(xx) xxxxx-xxxx"
												{...field}
												onChange={(e) =>
													field.onChange(maskTelefone(e.target.value))
												}
												disabled={isUpdating}
											/>
										</FormControl>
										<FormMessage />
									</FormItem>
								)}
							/>

							{/* Tipo Sanguíneo */}
							<FormField
								control={form.control}
								name="tipoSanguineo"
								render={({ field }) => (
									<FormItem>
										<FormLabel>Tipo Sanguíneo (Opcional)</FormLabel>
										<Select
											onValueChange={(v) =>
												field.onChange(v === 'none' ? undefined : v)
											}
											value={field.value || ''}
											disabled={isUpdating}
										>
											<FormControl>
												<SelectTrigger>
													<SelectValue placeholder="Selecione o tipo" />
												</SelectTrigger>
											</FormControl>
											<SelectContent>
												<ScrollArea className="h-48">
													<SelectItem value="none">
														Não sabe / Não informar
													</SelectItem>
													{tiposSanguineos.map((tipo) => (
														<SelectItem
															key={tipo}
															value={tipo}
														>
															{tipo}
														</SelectItem>
													))}
												</ScrollArea>
											</SelectContent>
										</Select>
										<FormMessage />
									</FormItem>
								)}
							/>

							{/* Footer */}
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
									disabled={isUpdating}
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
