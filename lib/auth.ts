import NextAuth from "next-auth"
import { PrismaAdapter } from "@auth/prisma-adapter"
import Credentials from "next-auth/providers/credentials"
import bcrypt from "bcryptjs"
import { z } from "zod"
import { prisma } from "./prisma"
import { logger } from "./logger"

const loginSchema = z.object({
  email: z.string().email(),
  senha: z.string().min(8),
})

export const { handlers, auth, signIn, signOut } = NextAuth({
  adapter: PrismaAdapter(prisma),
  session: { strategy: "jwt", maxAge: 8 * 60 * 60 },
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
        if (!parsed.success) {
          logger.warn("auth.authorize: validação falhou", { reason: parsed.error.issues[0]?.message })
          return null
        }

        const email = parsed.data.email.toLowerCase().trim()

        let usuario
        try {
          usuario = await prisma.usuario.findUnique({
            where: { email },
          })
        } catch (err) {
          logger.error("auth.authorize: erro ao consultar banco", err)
          return null
        }

        if (!usuario) {
          logger.warn("auth.authorize: usuário não encontrado", { email: email.replace(/(?<=.{3}).(?=.*@)/g, '*') })
          return null
        }

        if (!usuario.ativo) {
          logger.warn("auth.authorize: usuário inativo", { userId: usuario.id })
          return null
        }

        if (!usuario.senha) {
          logger.warn("auth.authorize: usuário sem senha", { userId: usuario.id })
          return null
        }

        const senhaCorreta = await bcrypt.compare(parsed.data.senha, usuario.senha)
        if (!senhaCorreta) {
          logger.warn("auth.authorize: senha incorreta", { userId: usuario.id, papel: usuario.papel })
          return null
        }

        logger.info("auth.authorize: login bem-sucedido", { userId: usuario.id, papel: usuario.papel })

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
        const roleRaw = (user as { role?: unknown }).role
        const ROLES_VALIDOS = ["CLIENTE", "ADMIN", "SUPER_ADMIN"] as const
        const role = typeof roleRaw === 'string' ? roleRaw : ''
        token.role = (ROLES_VALIDOS as readonly string[]).includes(role) ? role : "CLIENTE"
        logger.info("auth.jwt: token criado", { userId: token.id, role: token.role })
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
