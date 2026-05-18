import { NextRequest, NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import { z } from 'zod';
import { auth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { logAudit, getClientIp } from '@/lib/audit';
import { logger } from '@/lib/logger';
import { senhaSchema } from '@/lib/validations';

const criarAdminSchema = z.object({
  nome: z.string().min(2).max(80),
  email: z.string().email(),
  senha: senhaSchema,
  papel: z.enum(['ADMIN', 'SUPER_ADMIN']),
}).strict();

export async function POST(req: NextRequest) {
  const session = await auth();
  if (session?.user?.role !== 'SUPER_ADMIN') {
    return NextResponse.json({ erro: 'Acesso negado' }, { status: 403 });
  }

  const body = await req.json().catch(() => null);
  const parsed = criarAdminSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ erro: 'Dados inválidos', detalhes: parsed.error.issues }, { status: 400 });
  }

  const { nome, email, senha, papel } = parsed.data;

  try {
    const exists = await prisma.usuario.findUnique({ where: { email } });
    if (exists) {
      return NextResponse.json({ erro: 'Email já cadastrado' }, { status: 409 });
    }

    const hash = await bcrypt.hash(senha, 12);
    const usuario = await prisma.usuario.create({
      data: { nome, email, senha: hash, papel },
      select: { id: true, nome: true, email: true, papel: true, criadoEm: true },
    });

    void logAudit({
      adminId: session.user.id!,
      adminEmail: session.user.email!,
      acao: 'admin.criado',
      recurso: 'Admin',
      recursoId: usuario.id,
      detalhe: { email: usuario.email, papel: usuario.papel },
      ip: getClientIp(req),
    });

    return NextResponse.json(usuario, { status: 201 });
  } catch (error) {
    logger.error('Erro criando admin', error);
    return NextResponse.json({ erro: 'Erro interno' }, { status: 500 });
  }
}

export async function GET() {
  const session = await auth();
  if (session?.user?.role !== 'SUPER_ADMIN') {
    return NextResponse.json({ erro: 'Acesso negado' }, { status: 403 });
  }

  try {
    const admins = await prisma.usuario.findMany({
      where: { papel: { in: ['ADMIN', 'SUPER_ADMIN'] } },
      select: { id: true, nome: true, email: true, papel: true, ativo: true, criadoEm: true },
      orderBy: { criadoEm: 'desc' },
    });

    return NextResponse.json(admins);
  } catch (error) {
    logger.error('Erro listando admins', error);
    return NextResponse.json({ erro: 'Erro interno' }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest) {
  const session = await auth();
  if (session?.user?.role !== 'SUPER_ADMIN') {
    return NextResponse.json({ erro: 'Acesso negado' }, { status: 403 });
  }

  const { searchParams } = new URL(req.url);
  const id = searchParams.get('id');
  if (!id) return NextResponse.json({ erro: 'ID obrigatório' }, { status: 400 });

  if (id === session.user.id) {
    return NextResponse.json({ erro: 'Não é possível remover sua própria conta' }, { status: 400 });
  }

  try {
    const usuario = await prisma.usuario.findUnique({ where: { id } });
    if (!usuario || !['ADMIN', 'SUPER_ADMIN'].includes(usuario.papel)) {
      return NextResponse.json({ erro: 'Admin não encontrado' }, { status: 404 });
    }

    await prisma.usuario.update({ where: { id }, data: { ativo: false } });

    void logAudit({
      adminId: session.user.id!,
      adminEmail: session.user.email!,
      acao: 'admin.removido',
      recurso: 'Admin',
      recursoId: id,
      detalhe: { email: usuario.email, papel: usuario.papel },
      ip: getClientIp(req),
    });

    return NextResponse.json({ ok: true });
  } catch (error) {
    logger.error('Erro removendo admin', error);
    return NextResponse.json({ erro: 'Erro interno' }, { status: 500 });
  }
}
