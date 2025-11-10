// app/(private)/profissional/pacientes/components/CreatePacienteDialog.tsx
'use client'

import { z } from 'zod'
import { zodResolver } from '@hookform/resolvers/zod'
import { useForm } from 'react-hook-form'
import { useCreatePaciente } from '@/app/queries/pacientes.queries'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'

// [MUDANÇA] Imports do Dialog, substituindo o Drawer
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
// --- Fim das Funções de Máscara ---

// Schema Zod (Corrigido e Mantido)
const formSchema = z.object({
	nome: z.string().min(3, { message: 'Nome deve ter no mínimo 3 caracteres.' }),
	cpf: z
		.string()
		.length(14, { message: 'CPF deve estar no formato xxx.xxx.xxx-xx' }),

	// Usamos z.date() com as mensagens de erro corretas
	dataNascimento: z.date({
		error: (issue) =>
			issue.input === undefined
				? 'Data de nascimento é obrigatória.'
				: 'Por favor, insira uma data válida.',
	}),

	telefone: z
		.string()
		.optional()
		.transform((val) => (val === '' ? undefined : val)),
	tipoSanguineo: z
		.string()
		.optional()
		.transform((val) => (val === '' ? undefined : val)),
})

type FormValues = z.infer<typeof formSchema>

// Props do componente
interface CreatePacienteDialogProps {
	open: boolean
	onOpenChange: (open: boolean) => void
}

// [MUDANÇA] Renomeado para CreatePacienteDialog
export function CreatePacienteDialog({
	open,
	onOpenChange,
}: CreatePacienteDialogProps) {
	const { mutateAsync: createPaciente, isPending } = useCreatePaciente()

	// [CORREÇÃO] Remova o <FormValues> daqui.
	// O hook vai inferir o tipo automaticamente do zodResolver.
	const form = useForm({
		resolver: zodResolver(formSchema),
		defaultValues: {
			nome: '',
			cpf: '',
			dataNascimento: undefined,
			telefone: '',
			tipoSanguineo: '',
		},
	})

	// A lógica de Submit (Mantida)
	// Agora 'data' terá o tipo correto inferido do schema
	const onSubmit = async (data: FormValues) => {
		try {
			await createPaciente(data)
			onOpenChange(false)
		} catch (error) {
			console.error('Falha ao criar paciente:', error)
		}
	}

	// Lógica de Fechar/Reset (Mantida)
	const handleOpenChange = (isOpen: boolean) => {
		onOpenChange(isOpen)
		if (!isOpen) {
			form.reset()
		}
	}

	return (
		// [MUDANÇA] Trocado Drawer por Dialog
		<Dialog
			open={open}
			onOpenChange={handleOpenChange}
		>
			<DialogContent className="sm:max-w-[425px]">
				{/* O <Form> e <form> envolvem o conteúdo para o submit do footer funcionar */}
				<Form {...form}>
					<form onSubmit={form.handleSubmit(onSubmit)}>
						<DialogHeader>
							<DialogTitle>Adicionar Novo Paciente</DialogTitle>
							<DialogDescription>
								Preencha os dados do novo paciente.
							</DialogDescription>
						</DialogHeader>

						{/* Div para o conteúdo do formulário com espaçamento e padding */}
						<div className="space-y-4 py-4">
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

							{/* Input de data nativo (mantido da sua versão) */}
							<FormField
								control={form.control}
								name="dataNascimento"
								render={({ field }) => (
									<FormItem>
										<FormLabel>Data de Nascimento</FormLabel>
										<FormControl>
											<Input
												type="date"
												{...field}
												// Converte o valor de Date para string (yyyy-mm-dd)
												value={
													field.value
														? field.value.toISOString().split('T')[0]
														: ''
												}
												// Converte a string (yyyy-mm-dd) de volta para Date
												onChange={(e) => field.onChange(e.target.valueAsDate)}
												disabled={isPending}
												className="block w-full"
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
							<FormField
								control={form.control}
								name="tipoSanguineo"
								render={({ field }) => (
									<FormItem>
										<FormLabel>Tipo Sanguíneo (Opcional)</FormLabel>
										<FormControl>
											<Input
												placeholder="Ex: A+"
												{...field}
												disabled={isPending}
											/>
										</FormControl>
										<FormMessage />
									</FormItem>
								)}
							/>
						</div>

						{/* [MUDANÇA] Footer do Dialog (sem botão de cancelar) */}
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
