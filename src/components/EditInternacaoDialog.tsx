// Salve como: app/components/EditInternacaoDialog.tsx
'use client'

import { useEffect, useRef, useState } from 'react' // 1. Imports de Hooks
import {
	useGetInternacaoById,
	useUpdateInternacao,
	UpdateInternacaoDTO,
} from '@/app/queries/internacao.queries'
// 2. IMPORTAÇÃO ATUALIZADA
import { useTranscribeAudio } from '@/app/queries/util.queries'

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
// 3. NOVOS ÍCONES
import {
	AlertTriangle,
	Mic,
	StopCircle,
	Loader2,
	AlertCircle,
} from 'lucide-react'

// Schema Zod (sem alteração)
const editInternacaoSchema = z.object({
	diagnostico: z.string().optional(),
	observacoes: z.string().optional(),
	quarto: z.string().optional(),
	leito: z.string().optional(),
})

type EditInternacaoFormValues = z.infer<typeof editInternacaoSchema>

// 4. TIPO DO CAMPO-ALVO
type RecordingTarget = 'diagnostico' | 'observacoes'

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

	// 5. HOOKS DE TRANSCRIÇÃO (NOVOS)
	const { mutateAsync: transcribeAudio, isPending: isTranscribing } =
		useTranscribeAudio()
	const [isRecording, setIsRecording] = useState(false)
	const [audioError, setAudioError] = useState<string | null>(null)
	const [recordingTarget, setRecordingTarget] =
		useState<RecordingTarget | null>(null)
	const mediaRecorderRef = useRef<MediaRecorder | null>(null)
	const audioChunksRef = useRef<Blob[]>([])

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

	// 3. Efeito para pré-popular o formulário (Sem alteração)
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

	// 6. NOVAS FUNÇÕES DE GRAVAÇÃO (Refatoradas)
	const handleTranscribe = async (blob: Blob) => {
		if (!recordingTarget) return
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
			setRecordingTarget(null)
		}
	}

	const startRecording = async (target: RecordingTarget) => {
		setAudioError(null)
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
					handleTranscribe(blob)
				}

				mediaRecorderRef.current.start()
				setIsRecording(true)
			} catch (err) {
				console.error('Erro ao acessar o microfone:', err)
				setAudioError(
					'Permissão ao microfone negada. Verifique as configurações.'
				)
				setRecordingTarget(null)
			}
		} else {
			setAudioError('Gravador de áudio não suportado neste navegador.')
			setRecordingTarget(null)
		}
	}

	const stopRecording = () => {
		if (mediaRecorderRef.current && isRecording) {
			mediaRecorderRef.current.stop()
			mediaRecorderRef.current.stream
				.getTracks()
				.forEach((track) => track.stop())
		}
	}

	// 7. FUNÇÃO HELPER PARA UI DE BOTÃO (NOVA)
	const renderRecordButton = (target: RecordingTarget) => {
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

	// 8. Handler de Submissão (Sem alteração)
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
					onOpenChange(false)
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

							{/* Campo de Diagnóstico (ATUALIZADO) */}
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
										{/* Botão de Gravação para Diagnóstico */}
										<div className="flex items-center justify-end pt-1">
											{renderRecordButton('diagnostico')}
										</div>
										<FormMessage />
									</FormItem>
								)}
							/>

							{/* Campo de Observações (ATUALIZADO) */}
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
									variant="outline"
									onClick={() => onOpenChange(false)}
									// 9. LÓGICA DE DISABLED ATUALIZADA
									disabled={isUpdating || isTranscribing || isRecording}
								>
									Cancelar
								</Button>
								<Button
									type="submit"
									disabled={
										isUpdating || isLoading || isTranscribing || isRecording
									}
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
