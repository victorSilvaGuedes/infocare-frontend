export type Paciente = {
	id: number
	nome: string
	cpf: string
	dataNascimento: string // JSON sempre envia datas como string ISO
	tipoSanguineo: string | null
	telefone: string | null
}
