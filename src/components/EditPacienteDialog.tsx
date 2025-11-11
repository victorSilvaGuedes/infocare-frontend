// Salve como: app/components/EditPacienteDialog.tsx
'use client'

import { useEffect } from 'react'
import {
	usePacienteById,
	useUpdatePaciente,
	CreatePacienteDTO,
} from '@/app/queries/pacientes.queries'
import { AppLoader } from './AppLoader'

// Zod e React Hook Form
import { z } from 'zod'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'

// UI (Shadcn)
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
import { Calendar } from '@/components/ui/calendar'
import {
	Popover,
	PopoverContent,
	PopoverTrigger,
} from '@/components/ui/popover'
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'
import { AlertTriangle, CalendarIcon } from 'lucide-react'
import { cn } from '@/lib/utils'
import { format } from 'date-fns'
import { ptBR } from 'date-fns/locale'

// 1. (NOVO) Imports do Select
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from '@/components/ui/select'
import { ScrollArea } from '@/components/ui/scroll-area'

// --- Funções de Máscara (Mantidas) ---
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

// Schema Zod (Sem alteração)
const updatePacienteSchema = z.object({
	nome: z.string().min(3, { message: 'Nome deve ter no mínimo 3 caracteres.' }),
	cpf: z
		.string()
		.length(14, { message: 'CPF deve estar no formato xxx.xxx.xxx-xx' }),
	dataNascimento: z.date({
		error: (issue) =>
			issue.input === undefined
				? 'Data de nascimento é obrigatória.'
				: 'Por favor, insira uma data válida.',
	}),
	tipoSanguineo: z
		.string()
		.optional()
		.transform((val) => (val === '' ? undefined : val)),
	telefone: z
		.string()
		.optional()
		.transform((val) => (val === '' ? undefined : val)),
})

type UpdatePacienteFormValues = z.infer<typeof updatePacienteSchema>

// 2. (NOVO) Array de tipos sanguíneos
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
	// ... (Hooks 'usePacienteById' e 'useUpdatePaciente' sem alteração) ...
	const {
		data: paciente,
		isLoading,
		isError,
		error,
	} = usePacienteById(pacienteId)
	const { mutate: updatePaciente, isPending: isUpdating } = useUpdatePaciente()

	const form = useForm({
		resolver: zodResolver(updatePacienteSchema),
		// Valores padrão vazios ou indefinidos
		defaultValues: {
			nome: '',
			cpf: '',
			dataNascimento: undefined,
			tipoSanguineo: '',
			telefone: '',
		},
	})

	// ... (useEffect e onSubmit sem alteração) ...
	useEffect(() => {
		if (paciente) {
			form.reset({
				...paciente,
				dataNascimento: new Date(paciente.dataNascimento),
				tipoSanguineo: paciente.tipoSanguineo || '',
				telefone: paciente.telefone || '',
			})
		}
	}, [paciente, form])

	const onSubmit = (values: UpdatePacienteFormValues) => {
		if (!pacienteId) return
		const dataToUpdate: CreatePacienteDTO = {
			...values,
			tipoSanguineo: values.tipoSanguineo || undefined,
			telefone: values.telefone || undefined,
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
				dataNascimento: undefined,
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
						Atualize os dados do paciente. Clique em salvar para aplicar.
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
							className="space-y-4"
						>
							{/* --- Nome (Sem alteração) --- */}
							<FormField
								control={form.control}
								name="nome"
								render={({ field }) => (
									<FormItem>
										<FormLabel>Nome</FormLabel>
										<FormControl>
											<Input
												placeholder="Nome completo"
												{...field}
											/>
										</FormControl>
										<FormMessage />
									</FormItem>
								)}
							/>
							{/* --- CPF (Sem alteração) --- */}
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
											/>
										</FormControl>
										<FormMessage />
									</FormItem>
								)}
							/>
							{/* --- Data de Nascimento (Sem alteração) --- */}
							<FormField
								control={form.control}
								name="dataNascimento"
								render={({ field }) => (
									<FormItem className="flex flex-col">
										<FormLabel>Data de Nascimento</FormLabel>
										<Popover>
											<PopoverTrigger asChild>
												<FormControl>
													<Button
														variant={'outline'}
														className={cn(
															'w-full pl-3 text-left font-normal',
															!field.value && 'text-muted-foreground'
														)}
													>
														{field.value ? (
															format(field.value, 'PPP', { locale: ptBR })
														) : (
															<span>Selecione a data</span>
														)}
														<CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
													</Button>
												</FormControl>
											</PopoverTrigger>
											<PopoverContent
												className="w-auto p-0"
												align="start"
											>
												<Calendar
													mode="single"
													selected={field.value}
													onSelect={field.onChange}
													disabled={(date) =>
														date > new Date() || date < new Date('1900-01-01')
													}
													initialFocus
												/>
											</PopoverContent>
										</Popover>
										<FormMessage />
									</FormItem>
								)}
							/>
							{/* --- Telefone (Sem alteração) --- */}
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

							{/* 3. (ATUALIZADO) Campo Tipo Sanguíneo --- */}
							<FormField
								control={form.control}
								name="tipoSanguineo"
								render={({ field }) => (
									<FormItem>
										<FormLabel>Tipo Sanguíneo (Opcional)</FormLabel>
										<Select
											onValueChange={field.onChange}
											value={field.value || ''} // Garante que o valor é controlado
											disabled={isUpdating}
										>
											<FormControl>
												<SelectTrigger>
													<SelectValue placeholder="Selecione o tipo" />
												</SelectTrigger>
											</FormControl>
											<SelectContent>
												<ScrollArea className="h-48">
													{/* Opção para limpar o campo */}
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

							{/* --- Footer (Sem alteração) --- */}
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
