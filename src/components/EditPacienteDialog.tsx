// Salve como: app/components/EditPacienteDialog.tsx
'use client'

import { useEffect } from 'react'
import {
	usePacienteById,
	useUpdatePaciente,
	CreatePacienteDTO, // Reutilizamos este tipo para o Zod
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

// --- [CORREÇÃO] Adicionando as Funções de Máscara ---
const maskCPF = (value: string) => {
	return value
		.replace(/\D/g, '') // Remove tudo que não é dígito
		.replace(/(\d{3})(\d)/, '$1.$2') // Coloca ponto após o terceiro dígito
		.replace(/(\d{3})(\d)/, '$1.$2') // Coloca ponto após o sexto dígito
		.replace(/(\d{3})(\d{1,2})$/, '$1-$2') // Coloca hífen antes dos últimos 2 dígitos
		.substring(0, 14) // Limita ao tamanho máximo do CPF formatado
}

const maskTelefone = (value: string) => {
	return value
		.replace(/\D/g, '')
		.replace(/(\d{2})(\d)/, '($1) $2') // Coloca parênteses nos dois primeiros dígitos
		.replace(/(\d{5})(\d)/, '$1-$2') // Coloca hífen após o quinto dígito (para celular)
		.replace(/(\d{4})-(\d)(\d{4})/, '$1$2-$3') // Ajuste para telefone fixo
		.substring(0, 15) // Limita ao tamanho máximo (xx) xxxxx-xxxx
}
// --- Fim da Correção ---

// 1. Definir o Schema de Validação (baseado no Zod do backend)
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

// O tipo de dados do formulário
type UpdatePacienteFormValues = z.infer<typeof updatePacienteSchema>

// 2. Definir as Props do Dialog
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
	// 3. Buscar os dados do Paciente
	const {
		data: paciente,
		isLoading,
		isError,
		error,
	} = usePacienteById(pacienteId)

	// 4. Hook de Mutação (Atualização)
	const { mutate: updatePaciente, isPending: isUpdating } = useUpdatePaciente()

	// 5. Configuração do Formulário
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

	// 6. Efeito para pré-popular o formulário
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

	// 7. Handler de Submissão
	const onSubmit = (values: UpdatePacienteFormValues) => {
		if (!pacienteId) return

		// Prepara os dados para a API (CreatePacienteDTO)
		// Opcionais devem ser 'undefined' se vazios, não string vazia
		const dataToUpdate: CreatePacienteDTO = {
			...values,
			tipoSanguineo: values.tipoSanguineo || undefined,
			telefone: values.telefone || undefined,
		}

		updatePaciente(
			{ id: pacienteId, ...dataToUpdate },
			{
				onSuccess: () => {
					onOpenChange(false) // Fecha o dialog em sucesso
				},
			}
		)
	}

	// [MUDANÇA] Adicionado handleOpenChange para resetar o form
	// (Evita que dados antigos apareçam ao reabrir o dialog)
	const handleOpenChange = (isOpen: boolean) => {
		onOpenChange(isOpen)
		if (!isOpen) {
			// Reseta para os valores padrão (vazios)
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
			onOpenChange={handleOpenChange} // [MUDANÇA]
		>
			<DialogContent className="sm:max-w-[425px]">
				<DialogHeader>
					<DialogTitle>Editar Paciente</DialogTitle>
					<DialogDescription>
						Atualize os dados do paciente. Clique em salvar para aplicar.
					</DialogDescription>
				</DialogHeader>

				{/* 8. Renderização de Loading / Erro DENTRO do dialog */}
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

				{/* 9. O Formulário (só aparece se tiver dados) */}
				{paciente && (
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
												placeholder="Nome completo"
												{...field}
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
												// [CORREÇÃO] Adicionando a máscara de CPF
												onChange={(e) =>
													field.onChange(maskCPF(e.target.value))
												}
											/>
										</FormControl>
										<FormMessage />
									</FormItem>
								)}
							/>
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
												// [CORREÇÃO] Adicionando a máscara de Telefone
												onChange={(e) =>
													field.onChange(maskTelefone(e.target.value))
												}
											/>
										</FormControl>
										<FormMessage />
									</FormItem>
								)}
							/>
							<FormField
								control={form.control}
								name="tipoSanguineo"
								render={({ field }) => (
									<FormItem>
										<FormLabel>Tipo Sanguíneo (Opcional)</FormLabel>
										<FormControl>
											<Input
												placeholder="A+"
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
