// Salve como: app/components/CreateEvolucaoDialog.tsx
'use client'

import { useState, useRef } from 'react'
// ======================================================
// 1. IMPORTAÇÃO REATORADA
//    useTranscribeAudio agora vem do novo 'util.queries'
// ======================================================
import { useCreateEvolucao } from '@/app/queries/evolucao.queries'
import { useTranscribeAudio } from '@/app/queries/util.queries'
// ======================================================

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
import { Mic, StopCircle, Loader2, AlertCircle } from 'lucide-react'

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
	// 3. Hooks de Mutação (Corrigidos)
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

	// ======================================================
	// 7. FUNÇÃO DE TRANSCRIÇÃO ATUALIZADA
	//    Agora aceita um 'blob' opcional para evitar
	//    problemas de 'state' (race conditions).
	// ======================================================
	const handleTranscribe = async (directBlob?: Blob) => {
		// Usa o blob passado diretamente (de 'onstop')
		// ou o blob do 'state' (do botão 'Tentar Novamente')
		const blobToTranscribe = directBlob || audioBlob
		if (!blobToTranscribe) return

		setAudioError(null) // Limpa erros antigos
		try {
			const data = await transcribeAudio({ audioFile: blobToTranscribe })
			const textoTranscrevido = data.transcricao

			// Atualiza o formulário
			const textoAtual = form.getValues('descricao')
			form.setValue(
				'descricao',
				textoAtual ? `${textoAtual}\n\n${textoTranscrevido}` : textoTranscrevido
			)

			setAudioBlob(null) // Sucesso! Limpa o blob.
		} catch (err) {
			console.error('Falha na mutação de transcrição', err)
			// Falha! Se veio do 'onstop', seta o blob no state
			// para que o botão 'Tentar Novamente' apareça.
			if (directBlob) {
				setAudioBlob(directBlob)
			}
			setAudioError('A transcrição falhou. Verifique sua conexão.')
		}
	}

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
				audioChunksRef.current = []

				mediaRecorderRef.current.ondataavailable = (event) => {
					audioChunksRef.current.push(event.data)
				}

				// ======================================================
				// 8. MUDANÇA PRINCIPAL (Transcrever ao Parar)
				//    'onstop' agora chama 'handleTranscribe'
				//    automaticamente.
				// ======================================================
				mediaRecorderRef.current.onstop = () => {
					const blob = new Blob(audioChunksRef.current, { type: 'audio/webm' })
					setIsRecording(false)
					handleTranscribe(blob) // CHAMA A TRANSCRIÇÃO IMEDIATAMENTE
				}
				// ======================================================

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
			mediaRecorderRef.current.stop() // Isso irá disparar o 'onstop'
			mediaRecorderRef.current.stream
				.getTracks()
				.forEach((track) => track.stop())
		}
	}

	// 9. Handler de Submissão Final (Sem mudanças)
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
					<DialogTitle>Adicionar Evolução</DialogTitle>
					<DialogDescription>
						Descreva a evolução do paciente{' '}
						<span className="font-semibold">{pacienteNome}</span>.
					</DialogDescription>
				</DialogHeader>

				{audioError && (
					<Alert variant="destructive">
						<AlertCircle className="h-4 w-4" />
						<AlertTitle>Erro na Transcrição</AlertTitle>
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
						<div className="flex flex-col w-full items-center justify-center gap-4">
							{!isRecording ? (
								<Button
									type="button"
									variant="outline"
									size="icon"
									className="h-16 w-16 rounded-full border-2 border-red-500 text-red-500 hover:bg-red-50 hover:text-red-600"
									onClick={startRecording}
									disabled={isTranscribing} // Desativa se uma transcrição ainda estiver ocorrendo
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

							{/* ======================================================
                  10. BOTÃO DE TENTAR NOVAMENTE
                      Só aparece se a transcrição falhar (audioBlob existir)
                  ====================================================== */}
							{audioBlob && !isTranscribing && (
								<Button
									type="button"
									onClick={() => handleTranscribe()} // Chama sem argumento
									className="flex-1"
									variant="outline"
								>
									Tentar Transcrição Novamente
								</Button>
							)}
							{/* ====================================================== */}

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
