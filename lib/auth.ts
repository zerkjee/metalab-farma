import NextAuth from "next-auth"
import { PrismaAdapter } from "@auth/prisma-adapter"
import Credentials from "next-auth/providers/credentials"
import bcrypt from "bcryptjs"
import { z } from "zod"
import { prisma } from "./prisma"

const loginSchema = z.object({
  email: z.string().email(),
  senha: z.string().min(6),
})

export const { handlers, auth, signIn, signOut } = NextAuth({
  adapter: PrismaAdapter(prisma),
  session: { strategy: "jwt" },
  pages: {
    signIn: "/login",
    error: "/login",
  },
  providers: [
    Credentials({
      name: "credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        senha: { label: "Senha", type: "password" },
      },
      async authorize(credentials) {
        const parsed = loginSchema.safeParse(credentials)
        if (!parsed.success) return null

        const usuario = await prisma.usuario.findUnique({
          where: { email: parsed.data.email.toLowerCase().trim() },
        })

        if (!usuario?.senha || !usuario.ativo) return null

        const senhaCorreta = await bcrypt.compare(parsed.data.senha, usuario.senha)
        if (!senhaCorreta) return null

        return {
          id: usuario.id,
          email: usuario.email,
          name: usuario.nome,
          role: usuario.papel,
        }
      },
    }),
  ],
  callbacks: {
    jwt({ token, user }) {
      if (user) {
        token.id = user.id
        const role = (user as any).role
        const ROLES_VALIDOS = ["CLIENTE", "ADMIN", "SUPER_ADMIN"] as const
        token.role = ROLES_VALIDOS.includes(role) ? role : "CLIENTE"
      }
      return token
    },
    session({ session, token }) {
      if (token) {
        session.user.id = token.id as string
        session.user.role = token.role as string
      }
      return session
    },
  },
})
