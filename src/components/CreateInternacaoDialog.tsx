// Salve como: app/components/CreateInternacaoDialog.tsx
'use client'

import { useEffect, useRef, useState } from 'react'
import {
	useCreateInternacao,
	CreateInternacaoDTO,
} from '@/app/queries/internacao.queries'
import { useAuthStore } from '@/app/stores/useAuthStore'
import { usePacientes } from '@/app/queries/pacientes.queries'
// 1. IMPORTAÇÃO ATUALIZADA
import { useTranscribeAudio } from '@/app/queries/util.queries'

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
// 2. NOVOS ÍCONES
import { Mic, StopCircle, Loader2, AlertCircle } from 'lucide-react'
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'

// 1. Schema de Validação (Sem alteração)
const internacaoFormSchema = z.object({
	idPaciente: z.string().min(1, { message: 'Selecione um paciente.' }),
	diagnostico: z.string().optional(),
	observacoes: z.string().optional(),
	quarto: z.string().optional(),
	leito: z.string().optional(),
})

type InternacaoFormValues = z.infer<typeof internacaoFormSchema>

// 2. Props do Dialog (Sem alteração)
interface CreateInternacaoDialogProps {
	open: boolean
	onOpenChange: (open: boolean) => void
}

// 3. TIPO DO CAMPO-ALVO
type RecordingTarget = 'diagnostico' | 'observacoes'

export function CreateInternacaoDialog({
	open,
	onOpenChange,
}: CreateInternacaoDialogProps) {
	// 3. Hooks de Dados
	const { mutate: createInternacao, isPending: isCreating } =
		useCreateInternacao()
	const { data: pacientes, isLoading: isLoadingPacientes } = usePacientes()
	const idProfissionalLogado = useAuthStore((state) => state.usuario?.id)

	// 4. HOOKS DE TRANSCRIÇÃO (NOVOS)
	const { mutateAsync: transcribeAudio, isPending: isTranscribing } =
		useTranscribeAudio()
	const [isRecording, setIsRecording] = useState(false)
	const [audioError, setAudioError] = useState<string | null>(null)
	// Estado para saber qual botão foi clicado (diagnostico ou observacoes)
	const [recordingTarget, setRecordingTarget] =
		useState<RecordingTarget | null>(null)
	const mediaRecorderRef = useRef<MediaRecorder | null>(null)
	const audioChunksRef = useRef<Blob[]>([])

	// 5. Configuração do Formulário (Sem alteração)
	const form = useForm<InternacaoFormValues>({
		resolver: zodResolver(internacaoFormSchema),
		defaultValues: {
			diagnostico: '',
			observacoes: '',
			quarto: '',
			leito: '',
			idPaciente: undefined,
		},
	})

	// Efeito para limpar o formulário ao fechar (Sem alteração)
	useEffect(() => {
		if (!open) {
			form.reset()
		}
	}, [open, form])

	// 6. NOVAS FUNÇÕES DE GRAVAÇÃO (Refatoradas)
	const handleTranscribe = async (blob: Blob) => {
		if (!recordingTarget) return // Não sabe onde colocar o texto
		setAudioError(null)

		try {
			const data = await transcribeAudio({ audioFile: blob })
			const textoTranscrevido = data.transcricao

			// Coloca o texto no campo-alvo
			const textoAtual = form.getValues(recordingTarget)
			form.setValue(
				recordingTarget,
				textoAtual ? `${textoAtual}\n\n${textoTranscrevido}` : textoTranscrevido
			)
		} catch (err) {
			console.error('Falha na mutação de transcrição', err)
			setAudioError('A transcrição falhou. Verifique sua conexão.')
		} finally {
			// Limpa o alvo, permitindo que a UI volte ao normal
			setRecordingTarget(null)
		}
	}

	const startRecording = async (target: RecordingTarget) => {
		setAudioError(null)
		// Seta qual campo estamos gravando
		setRecordingTarget(target)

		if (navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
			try {
				const stream = await navigator.mediaDevices.getUserMedia({
					audio: true,
				})
				mediaRecorderRef.current = new MediaRecorder(stream)
				audioChunksRef.current = []

				mediaRecorderRef.current.ondataavailable = (event) => {
					audioChunksRef.current.push(event.data)
				}

				mediaRecorderRef.current.onstop = () => {
					const blob = new Blob(audioChunksRef.current, { type: 'audio/webm' })
					setIsRecording(false)
					// Transcreve automaticamente ao parar
					handleTranscribe(blob)
				}

				mediaRecorderRef.current.start()
				setIsRecording(true)
			} catch (err) {
				console.error('Erro ao acessar o microfone:', err)
				setAudioError(
					'Permissão ao microfone negada. Verifique as configurações.'
				)
				setRecordingTarget(null) // Reseta o alvo se falhar
			}
		} else {
			setAudioError('Gravador de áudio não suportado neste navegador.')
			setRecordingTarget(null)
		}
	}

	const stopRecording = () => {
		if (mediaRecorderRef.current && isRecording) {
			mediaRecorderRef.current.stop() // Dispara o 'onstop'
			mediaRecorderRef.current.stream
				.getTracks()
				.forEach((track) => track.stop())
		}
	}

	// 7. Handler de Submissão (Sem alteração)
	const onSubmit = (values: InternacaoFormValues) => {
		const data: CreateInternacaoDTO = {
			...values,
			idPaciente: parseInt(values.idPaciente, 10),
			idProfissionalResponsavel: idProfissionalLogado,
			diagnostico: values.diagnostico || undefined,
			observacoes: values.observacoes || undefined,
			quarto: values.quarto || undefined,
			leito: values.leito || undefined,
		}

		createInternacao(data, {
			onSuccess: () => {
				onOpenChange(false)
			},
		})
	}

	// 8. FUNÇÃO HELPER PARA UI DE BOTÃO
	const renderRecordButton = (target: RecordingTarget) => {
		// 1. Está transcrevendo ESTE campo?
		if (isTranscribing && recordingTarget === target) {
			return (
				<Button
					type="button"
					variant="outline"
					size="sm"
					disabled
				>
					<Loader2 className="mr-2 h-4 w-4 animate-spin" />
					Transcrevendo...
				</Button>
			)
		}

		// 2. Está gravando ESTE campo?
		if (isRecording && recordingTarget === target) {
			return (
				<Button
					type="button"
					variant="outline"
					size="sm"
					onClick={stopRecording}
				>
					<StopCircle className="mr-2 h-4 w-4 text-red-500" />
					Parar Gravação
				</Button>
			)
		}

		// 3. Está Ocupado (gravando outro campo ou transcrevendo)?
		if (isRecording || isTranscribing) {
			return (
				<Button
					type="button"
					variant="outline"
					size="sm"
					disabled
				>
					<Mic className="mr-2 h-4 w-4" />
					Gravar Áudio
				</Button>
			)
		}

		// 4. Estado Padrão (Pronto para gravar)
		return (
			<Button
				type="button"
				variant="outline"
				size="sm"
				onClick={() => startRecording(target)}
			>
				<Mic className="mr-2 h-4 w-4" />
				Gravar Áudio
			</Button>
		)
	}

	return (
		<Dialog
			open={open}
			onOpenChange={onOpenChange}
		>
			<DialogContent className="sm:max-w-[500px]">
				<DialogHeader>
					<DialogTitle>Criar Internação</DialogTitle>
					<DialogDescription>
						Selecione o paciente e preencha os dados da nova internação.
					</DialogDescription>
				</DialogHeader>

				{/* ALERTA DE ERRO DE ÁUDIO (NOVO) */}
				{audioError && (
					<Alert
						variant="destructive"
						className="my-2"
					>
						<AlertCircle className="h-4 w-4" />
						<AlertTitle>Erro no Áudio</AlertTitle>
						<AlertDescription>{audioError}</AlertDescription>
					</Alert>
				)}

				{isLoadingPacientes ? (
					<div className="py-12">
						<AppLoader />
					</div>
				) : (
					<Form {...form}>
						<form
							onSubmit={form.handleSubmit(onSubmit)}
							className="space-y-4"
						>
							{/* CAMPO DE SELECT DO PACIENTE (Sem alteração) */}
							<FormField
								control={form.control}
								name="idPaciente"
								render={({ field }) => (
									<FormItem>
										<FormLabel>Paciente</FormLabel>
										<Select
											onValueChange={field.onChange}
											defaultValue={field.value}
											value={field.value}
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
															value={p.id.toString()}
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

							{/* CAMPOS DE QUARTO E LEITO (Sem alteração) */}
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

							{/* CAMPO DE DIAGNÓSTICO (ATUALIZADO) */}
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
										{/* Botão de Gravação para Diagnóstico */}
										<div className="flex items-center justify-end pt-1">
											{renderRecordButton('diagnostico')}
										</div>
										<FormMessage />
									</FormItem>
								)}
							/>

							{/* CAMPO DE OBSERVAÇÕES (ATUALIZADO) */}
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
										{/* Botão de Gravação para Observações */}
										<div className="flex items-center justify-end pt-1">
											{renderRecordButton('observacoes')}
										</div>
										<FormMessage />
									</FormItem>
								)}
							/>

							<DialogFooter>
								<Button
									type="button"
									variant="ghost"
									onClick={() => onOpenChange(false)}
									// 9. LÓGICA DE DISABLED ATUALIZADA
									disabled={isCreating || isTranscribing || isRecording}
								>
									Cancelar
								</Button>
								<Button
									type="submit"
									disabled={
										isCreating ||
										isLoadingPacientes ||
										isTranscribing ||
										isRecording
									}
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
