// Salve como: app/components/CreateEvolucaoDialog.tsx
'use client'

import { useState, useRef } from 'react'
import {
	useCreateEvolucao,
	useTranscribeAudio,
} from '@/app/queries/evolucao.queries'
import { useAuthStore } from '@/app/stores/useAuthStore'

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
import { Textarea } from '@/components/ui/textarea'
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'
import { Mic, StopCircle, Send, Loader2, AlertCircle } from 'lucide-react'

// 1. Schema de Validação (Apenas a descrição)
const evolucaoFormSchema = z.object({
	descricao: z
		.string()
		.min(5, { message: 'A descrição deve ter pelo menos 5 caracteres.' }),
})

type EvolucaoFormValues = z.infer<typeof evolucaoFormSchema>

// 2. Props do Dialog
interface CreateEvolucaoDialogProps {
	internacaoId: number | null
	pacienteNome: string
	open: boolean
	onOpenChange: (open: boolean) => void
}

export function CreateEvolucaoDialog({
	internacaoId,
	pacienteNome,
	open,
	onOpenChange,
}: CreateEvolucaoDialogProps) {
	// 3. Hooks de Mutação
	const { mutate: createEvolucao, isPending: isSaving } = useCreateEvolucao()
	const { mutateAsync: transcribeAudio, isPending: isTranscribing } =
		useTranscribeAudio()

	// 4. Estado do Gravador
	const [isRecording, setIsRecording] = useState(false)
	const [audioBlob, setAudioBlob] = useState<Blob | null>(null)
	const [audioError, setAudioError] = useState<string | null>(null)
	// Refs para o MediaRecorder e os "pedaços" do áudio
	const mediaRecorderRef = useRef<MediaRecorder | null>(null)
	const audioChunksRef = useRef<Blob[]>([])

	// 5. Configuração do Formulário
	const form = useForm<EvolucaoFormValues>({
		resolver: zodResolver(evolucaoFormSchema),
		defaultValues: { descricao: '' },
	})

	// 6. Funções de Gravação (MediaRecorder API)

	const startRecording = async () => {
		setAudioError(null)
		setAudioBlob(null)
		if (navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
			try {
				const stream = await navigator.mediaDevices.getUserMedia({
					audio: true,
				})
				mediaRecorderRef.current = new MediaRecorder(stream)

				// Limpa os pedaços antigos
				audioChunksRef.current = []

				// Ouve os dados
				mediaRecorderRef.current.ondataavailable = (event) => {
					audioChunksRef.current.push(event.data)
				}

				// Gravação parada
				mediaRecorderRef.current.onstop = () => {
					const blob = new Blob(audioChunksRef.current, { type: 'audio/webm' })
					setAudioBlob(blob)
					setIsRecording(false)
				}

				// Inicia
				mediaRecorderRef.current.start()
				setIsRecording(true)
			} catch (err) {
				console.error('Erro ao acessar o microfone:', err)
				setAudioError(
					'Permissão ao microfone negada. Verifique as configurações do seu navegador.'
				)
			}
		} else {
			setAudioError('Gravador de áudio não suportado neste navegador.')
		}
	}

	const stopRecording = () => {
		if (mediaRecorderRef.current && isRecording) {
			mediaRecorderRef.current.stop()
			// Desliga a trilha do microfone (luzinha)
			mediaRecorderRef.current.stream
				.getTracks()
				.forEach((track) => track.stop())
		}
	}

	// 7. Função de Transcrição
	const handleTranscribe = async () => {
		if (!audioBlob) return
		try {
			// Chamamos a mutação (que chama nosso backend)
			// 'data' aqui será: { transcricao: "..." }
			const data = await transcribeAudio({ audioFile: audioBlob })

			// --- A CORREÇÃO ESTÁ AQUI ---
			// Lemos data.transcricao em vez de data.text
			const textoTranscrevido = data.transcricao
			// --- FIM DA CORREÇÃO ---

			// Atualiza o formulário com o texto retornado
			const textoAtual = form.getValues('descricao')
			form.setValue(
				'descricao',
				textoAtual
					? `${textoAtual}\n\n${textoTranscrevido}` // Usa a variável corrigida
					: textoTranscrevido // Usa a variável corrigida
			)

			setAudioBlob(null) // Limpa o áudio após transcrição
		} catch (err) {
			// O onError do 'useTranscribeAudio' (que não vimos) já mostra o toast
			console.error('Falha na mutação de transcrição', err)
		}
	}

	// 8. Handler de Submissão Final
	const onSubmit = (values: EvolucaoFormValues) => {
		if (!internacaoId) return

		createEvolucao(
			{
				idInternacao: internacaoId,
				descricao: values.descricao,
			},
			{
				onSuccess: () => {
					form.reset()
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
					<DialogTitle>Adicionar Evolução</DialogTitle>
					<DialogDescription>
						Descreva a evolução do paciente{' '}
						<span className="font-semibold">{pacienteNome}</span>.
					</DialogDescription>
				</DialogHeader>

				{audioError && (
					<Alert variant="destructive">
						<AlertCircle className="h-4 w-4" />
						<AlertTitle>Erro no Áudio</AlertTitle>
						<AlertDescription>{audioError}</AlertDescription>
					</Alert>
				)}

				<Form {...form}>
					<form
						onSubmit={form.handleSubmit(onSubmit)}
						className="space-y-4"
					>
						<FormField
							control={form.control}
							name="descricao"
							render={({ field }) => (
								<FormItem>
									<FormLabel>Descrição da Evolução</FormLabel>
									<FormControl>
										<Textarea
											placeholder="Descreva a evolução ou grave um áudio..."
											className="min-h-[150px]"
											{...field}
										/>
									</FormControl>
									<FormMessage />
								</FormItem>
							)}
						/>

						{/* Painel de Gravação */}
						<div className="flex w-full items-center justify-center gap-4">
							{!isRecording ? (
								<Button
									type="button"
									variant="outline"
									size="icon"
									className="h-16 w-16 rounded-full border-2 border-red-500 text-red-500 hover:bg-red-50 hover:text-red-600"
									onClick={startRecording}
									disabled={isTranscribing}
								>
									<Mic className="h-8 w-8" />
									<span className="sr-only">Gravar</span>
								</Button>
							) : (
								<Button
									type="button"
									variant="outline"
									size="icon"
									className="h-16 w-16 rounded-full border-2 border-muted"
									onClick={stopRecording}
									disabled={isTranscribing}
								>
									<StopCircle className="h-8 w-8 text-red-500" />
									<span className="sr-only">Parar</span>
								</Button>
							)}

							{audioBlob && !isTranscribing && (
								<Button
									type="button"
									onClick={handleTranscribe}
									className="flex-1"
								>
									Transcrever Áudio
								</Button>
							)}

							{isTranscribing && (
								<Button
									type="button"
									disabled
									className="flex-1"
								>
									<Loader2 className="mr-2 h-4 w-4 animate-spin" />
									Transcrevendo...
								</Button>
							)}
						</div>

						<DialogFooter>
							<Button
								type="button"
								variant="outline"
								onClick={() => onOpenChange(false)}
								disabled={isSaving || isTranscribing}
							>
								Cancelar
							</Button>
							<Button
								type="submit"
								disabled={isSaving || isTranscribing}
							>
								{isSaving ? 'Salvando...' : 'Salvar Evolução'}
							</Button>
						</DialogFooter>
					</form>
				</Form>
			</DialogContent>
		</Dialog>
	)
}
