import { z } from "zod"
import { normalizeHexColor } from "@/lib/product-color"

const colorSchema = z.preprocess((value) => {
  if (value == null || value === "") return null
  if (typeof value !== "string") return value
  return normalizeHexColor(value) ?? value
}, z.string().regex(/^#[0-9a-fA-F]{6}$/).nullable().optional())

export const loginSchema = z.object({
  email: z.string().email("Email inválido"),
  senha: z.string().min(6, "Mínimo 6 caracteres"),
})

export const senhaSchema = z
  .string()
  .min(8, "Mínimo 8 caracteres")
  .max(72, "Máximo 72 caracteres")
  .regex(/[A-Z]/, "Deve conter pelo menos 1 letra maiúscula")
  .regex(/[a-z]/, "Deve conter pelo menos 1 letra minúscula")
  .regex(/[0-9]/, "Deve conter pelo menos 1 número")
  .regex(/[^A-Za-z0-9]/, "Deve conter pelo menos 1 caractere especial")

function validarCPF(cpf: string): boolean {
  if (cpf.length !== 11 || /^(\d)\1{10}$/.test(cpf)) return false;
  let sum = 0;
  for (let i = 0; i < 9; i++) sum += parseInt(cpf[i]) * (10 - i);
  let rem = (sum * 10) % 11;
  if (rem === 10 || rem === 11) rem = 0;
  if (rem !== parseInt(cpf[9])) return false;
  sum = 0;
  for (let i = 0; i < 10; i++) sum += parseInt(cpf[i]) * (11 - i);
  rem = (sum * 10) % 11;
  if (rem === 10 || rem === 11) rem = 0;
  return rem === parseInt(cpf[10]);
}

export const registroSchema = z.object({
  nome: z.string().min(2, "Nome muito curto").max(80, "Nome muito longo"),
  email: z.string().email("Email inválido"),
  senha: senhaSchema,
  confirmarSenha: z.string(),
  cpf: z.string()
    .regex(/^\d{11}$/, "CPF deve ter 11 dígitos")
    .refine(validarCPF, "CPF inválido"),
  telefone: z.string().optional(),
  endereco: z.object({
    cep: z.string().regex(/^\d{8}$/, "CEP inválido"),
    logradouro: z.string().min(3),
    numero: z.string().min(1),
    complemento: z.string().optional(),
    bairro: z.string().min(2),
    cidade: z.string().min(2),
    estado: z.string().length(2),
  }),
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

const kitItemInputSchema = z.object({
  produtoId: z.string().min(1),
  quantidade: z.number().int().positive(),
  ordem: z.number().int().min(0).optional(),
})

export const produtoSchema = z.object({
  nome: z.string().min(2),
  slug: z.string().min(2),
  sku: z.string().min(1),
  ean: z.string().nullable().optional(),
  marca: z.string().optional(),
  subtitulo: z.string().nullable().optional(),
  categoriaId: z.string().nullable().optional(),
  tipo: z.enum(["SIMPLES", "KIT"]).default("SIMPLES"),
  // Preço e estoque
  preco: z.coerce.number().positive(),
  precoOriginal: z.coerce.number().positive().nullable().optional(),
  estoque: z.coerce.number().int().min(0),
  estoqueMin: z.coerce.number().int().min(0).optional(),
  // Conteúdo
  descricaoCurta: z.string().nullable().optional(),
  descricaoHtml: z.string().optional().default(""),
  composicao: z.string().nullable().optional(),
  modoDeUso: z.string().nullable().optional(),
  // Logística (Melhor Envio)
  pesoGramas: z.coerce.number().int().positive().nullable().optional(),
  alturaCm: z.coerce.number().int().positive().nullable().optional(),
  larguraCm: z.coerce.number().int().positive().nullable().optional(),
  comprimentoCm: z.coerce.number().int().positive().nullable().optional(),
  // Descoberta
  tags: z.array(z.string()).optional().default([]),
  // Visual
  corPrincipal: colorSchema,
  corSecundaria: colorSchema,
  imagemUrl: z.string().nullable().optional(),
  // SEO
  metaTitulo: z.string().nullable().optional(),
  metaDescricao: z.string().nullable().optional(),
  palavrasChave: z.string().nullable().optional(),
  // Flags
  ativo: z.boolean().default(true),
  destaque: z.boolean().default(false),
  // Kit
  kitItens: z.array(kitItemInputSchema).optional(),
})

export const cupomSchema = z.object({
  codigo: z.string().min(3).toUpperCase(),
  tipo: z.enum(["PERCENTUAL", "VALOR_FIXO", "FRETE_GRATIS"]),
  valor: z.coerce.number().positive(),
  usoMaximo: z.coerce.number().int().positive().optional(),
  validade: z.string().optional(),
  ativo: z.boolean().default(true),
})
