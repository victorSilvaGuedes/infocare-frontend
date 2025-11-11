// Salve como: app/(private)/profissional/pacientes/components/CreatePacienteDialog.tsx
'use client'

import { z } from 'zod'
import { zodResolver } from '@hookform/resolvers/zod'
import { useForm } from 'react-hook-form'
import { useCreatePaciente } from '@/app/queries/pacientes.queries'
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
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from '@/components/ui/select'

import {
	Form,
	FormControl,
	FormField,
	FormItem,
	FormLabel,
	FormMessage,
} from '@/components/ui/form'
import { ScrollArea } from '@/components/ui/scroll-area'

// Lista de tipos sanguíneos
const tiposSanguineos = ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-']

// Funções de máscara
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

// Schema de validação com Zod
const formSchema = z.object({
	nome: z.string().min(3, { message: 'Nome deve ter no mínimo 3 caracteres.' }),
	cpf: z
		.string()
		.length(14, { message: 'CPF deve estar no formato xxx.xxx.xxx-xx' }),
	dataNascimento: z
		.string()
		.nonempty('Data de nascimento é obrigatória.')
		.regex(/^\d{4}-\d{2}-\d{2}$/, 'Formato de data inválido.'),
	telefone: z
		.string()
		.optional()
		.transform((val) => (val === '' ? undefined : val)),
	tipoSanguineo: z.string().optional(),
})

type FormValues = z.infer<typeof formSchema>

interface CreatePacienteDialogProps {
	open: boolean
	onOpenChange: (open: boolean) => void
}

export function CreatePacienteDialog({
	open,
	onOpenChange,
}: CreatePacienteDialogProps) {
	const { mutateAsync: createPaciente, isPending } = useCreatePaciente()

	const form = useForm({
		resolver: zodResolver(formSchema),
		defaultValues: {
			nome: '',
			cpf: '',
			dataNascimento: undefined,
			telefone: '',
			tipoSanguineo: undefined,
		},
	})

	const onSubmit = async (data: FormValues) => {
		try {
			await createPaciente({
				...data,
				dataNascimento: new Date(data.dataNascimento),
			})
			onOpenChange(false)
		} catch (error) {
			console.error('Falha ao criar paciente:', error)
		}
	}

	const handleOpenChange = (isOpen: boolean) => {
		onOpenChange(isOpen)
		if (!isOpen) form.reset()
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
							<DialogTitle>Adicionar Novo Paciente</DialogTitle>
							<DialogDescription>
								Preencha os dados do novo paciente.
							</DialogDescription>
						</DialogHeader>

						<div className="space-y-4 py-4">
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
												disabled={isPending}
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
												disabled={isPending}
											/>
										</FormControl>
										<FormMessage />
									</FormItem>
								)}
							/>

							{/* Data de nascimento */}
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
												disabled={isPending}
												className="block w-full"
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
												disabled={isPending}
											/>
										</FormControl>
										<FormMessage />
									</FormItem>
								)}
							/>

							{/* Tipo sanguíneo */}
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
											disabled={isPending}
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
						</div>

						{/* Footer */}
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
								{isPending ? 'Salvando...' : 'Salvar Paciente'}
							</Button>
						</DialogFooter>
					</form>
				</Form>
			</DialogContent>
		</Dialog>
	)
}
