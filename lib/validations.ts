import { z } from "zod"

export const loginSchema = z.object({
  email: z.string().email("Email inválido"),
  senha: z.string().min(6, "Mínimo 6 caracteres"),
})

export const registroSchema = z.object({
  nome: z.string().min(2, "Nome muito curto"),
  email: z.string().email("Email inválido"),
  senha: z.string().min(6, "Mínimo 6 caracteres"),
  confirmarSenha: z.string(),
  cpf: z.string().regex(/^\d{11}$/, "CPF inválido (apenas números, 11 dígitos)"),
  telefone: z.string().optional(),
}).refine((d) => d.senha === d.confirmarSenha, {
  message: "Senhas não conferem",
  path: ["confirmarSenha"],
})

export const enderecoSchema = z.object({
  cep: z.string().regex(/^\d{8}$/, "CEP inválido"),
  logradouro: z.string().min(3),
  numero: z.string().min(1),
  complemento: z.string().optional(),
  bairro: z.string().min(2),
  cidade: z.string().min(2),
  estado: z.string().length(2, "Use a sigla do estado (ex: SP)"),
})

export const checkoutSchema = z.object({
  nome: z.string().min(2),
  email: z.string().email(),
  cpf: z.string().regex(/^\d{11}$/, "CPF inválido"),
  telefone: z.string().optional(),
  endereco: enderecoSchema,
  metodoPagamento: z.enum(["PIX", "CARTAO_CREDITO", "BOLETO"]),
  freteId: z.string(),
})

export const produtoSchema = z.object({
  nome: z.string().min(2),
  slug: z.string().min(2),
  sku: z.string().min(1),
  marca: z.string().optional(),
  preco: z.coerce.number().positive(),
  precoOriginal: z.coerce.number().positive().optional(),
  estoque: z.coerce.number().int().min(0),
  descricaoCurta: z.string().optional(),
  descricaoHtml: z.string().optional().default(""),
  corPrincipal: z.string().optional(),
  imagemUrl: z.string().optional(),
  ativo: z.boolean().default(true),
  destaque: z.boolean().default(false),
})

export const cupomSchema = z.object({
  codigo: z.string().min(3).toUpperCase(),
  tipo: z.enum(["PERCENTUAL", "VALOR_FIXO", "FRETE_GRATIS"]),
  valor: z.coerce.number().positive(),
  usoMaximo: z.coerce.number().int().positive().optional(),
  validade: z.string().optional(),
  ativo: z.boolean().default(true),
})
