// Salve como: app/components/CreateInternacaoDialog.tsx
// (Versão completa para a página /internacoes)

'use client'

import { useEffect } from 'react'
import {
	useCreateInternacao,
	CreateInternacaoDTO,
} from '@/app/queries/internacao.queries'
import { useAuthStore } from '@/app/stores/useAuthStore'
import { usePacientes } from '@/app/queries/pacientes.queries' // Para o dropdown

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
import { Textarea } from '@/components/ui/textarea'
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from '@/components/ui/select'
import { ScrollArea } from '@/components/ui/scroll-area'
import { AppLoader } from './AppLoader'

// 1. Schema de Validação (Agora inclui idPaciente)
const internacaoFormSchema = z.object({
	// O Zod espera uma string do formulário, vamos converter para número
	idPaciente: z.string({ required_error: 'Selecione um paciente.' }),
	diagnostico: z.string().optional(),
	observacoes: z.string().optional(),
	quarto: z.string().optional(),
	leito: z.string().optional(),
})

type InternacaoFormValues = z.infer<typeof internacaoFormSchema>

// 2. Props do Dialog
interface CreateInternacaoDialogProps {
	open: boolean
	onOpenChange: (open: boolean) => void
}

export function CreateInternacaoDialog({
	open,
	onOpenChange,
}: CreateInternacaoDialogProps) {
	// 3. Hooks de Dados
	const { mutate: createInternacao, isPending: isCreating } =
		useCreateInternacao()
	const { data: pacientes, isLoading: isLoadingPacientes } = usePacientes()
	const idProfissionalLogado = useAuthStore((state) => state.usuario?.id)

	// 4. Configuração do Formulário
	const form = useForm<InternacaoFormValues>({
		resolver: zodResolver(internacaoFormSchema),
		defaultValues: {
			diagnostico: '',
			observacoes: '',
			quarto: '',
			leito: '',
			idPaciente: undefined, // Começa indefinido
		},
	})

	// Efeito para limpar o formulário ao fechar
	useEffect(() => {
		if (!open) {
			form.reset()
		}
	}, [open, form])

	// 5. Handler de Submissão
	const onSubmit = (values: InternacaoFormValues) => {
		// Prepara os dados para a API (CreateInternacaoDTO)
		const data: CreateInternacaoDTO = {
			...values,
			// Convertemos o ID do paciente de string (do select) para número
			idPaciente: parseInt(values.idPaciente, 10),
			// Anexamos o ID do profissional logado
			idProfissionalResponsavel: idProfissionalLogado,
			// Opcionais devem ser 'undefined' se vazios
			diagnostico: values.diagnostico || undefined,
			observacoes: values.observacoes || undefined,
			quarto: values.quarto || undefined,
			leito: values.leito || undefined,
		}

		createInternacao(data, {
			onSuccess: () => {
				onOpenChange(false) // Fecha o dialog em sucesso
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
					<DialogTitle>Criar Internação</DialogTitle>
					<DialogDescription>
						Selecione o paciente e preencha os dados da nova internação.
					</DialogDescription>
				</DialogHeader>

				{/* 6. Renderização de Loading (se estiver buscando pacientes) */}
				{isLoadingPacientes ? (
					<div className="py-12">
						<AppLoader />
					</div>
				) : (
					/* 7. O Formulário */
					<Form {...form}>
						<form
							onSubmit={form.handleSubmit(onSubmit)}
							className="space-y-4"
						>
							{/* CAMPO DE SELECT DO PACIENTE */}
							<FormField
								control={form.control}
								name="idPaciente"
								render={({ field }) => (
									<FormItem>
										<FormLabel>Paciente</FormLabel>
										<Select
											onValueChange={field.onChange}
											defaultValue={field.value}
											value={field.value} // Garantir que o valor é controlado
										>
											<FormControl>
												<SelectTrigger>
													<SelectValue placeholder="Selecione o paciente..." />
												</SelectTrigger>
											</FormControl>
											<SelectContent>
												<ScrollArea className="h-48">
													{pacientes?.map((p) => (
														<SelectItem
															key={p.id}
															value={p.id.toString()} // O Select usa strings
														>
															{p.nome} (CPF: {p.cpf})
														</SelectItem>
													))}
												</ScrollArea>
											</SelectContent>
										</Select>
										<FormMessage />
									</FormItem>
								)}
							/>

							{/* CAMPOS DE QUARTO E LEITO */}
							<div className="grid grid-cols-2 gap-4">
								<FormField
									control={form.control}
									name="quarto"
									render={({ field }) => (
										<FormItem>
											<FormLabel>Quarto (Opcional)</FormLabel>
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
											<FormLabel>Leito (Opcional)</FormLabel>
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

							{/* CAMPO DE DIAGNÓSTICO */}
							<FormField
								control={form.control}
								name="diagnostico"
								render={({ field }) => (
									<FormItem>
										<FormLabel>Diagnóstico (Opcional)</FormLabel>
										<FormControl>
											<Textarea
												placeholder="Diagnóstico inicial..."
												{...field}
											/>
										</FormControl>
										<FormMessage />
									</FormItem>
								)}
							/>

							{/* CAMPO DE OBSERVAÇÕES */}
							<FormField
								control={form.control}
								name="observacoes"
								render={({ field }) => (
									<FormItem>
										<FormLabel>Observações (Opcional)</FormLabel>
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
									variant="ghost"
									onClick={() => onOpenChange(false)}
									disabled={isCreating}
								>
									Cancelar
								</Button>
								<Button
									type="submit"
									disabled={isCreating || isLoadingPacientes}
								>
									{isCreating ? 'Registrando...' : 'Registrar Internação'}
								</Button>
							</DialogFooter>
						</form>
					</Form>
				)}
			</DialogContent>
		</Dialog>
	)
}
