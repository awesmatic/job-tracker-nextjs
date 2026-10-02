import { getServerSession } from 'next-auth';
import { NextResponse } from 'next/server';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

async function getCurrentUser() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.email) return null;

  return prisma.user.findUnique({
    where: { email: session.user.email },
  });
}

export async function PATCH(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const user = await getCurrentUser();
  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { id } = await params;
  const body = await req.json();

  const existing = await prisma.application.findFirst({
    where: { id, userId: user.id },
  });

  if (!existing) {
    return NextResponse.json({ error: 'Not found' }, { status: 404 });
  }

  const updated = await prisma.application.update({
    where: { id },
    data: {
      company: body.company ?? existing.company,
      role: body.role ?? existing.role,
      url: body.url ?? existing.url,
      status: body.status ?? existing.status,
      notes: body.notes ?? existing.notes,
    },
  });

  return NextResponse.json(updated);
}

export async function DELETE(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const user = await getCurrentUser();
  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { id } = await params;

  const existing = await prisma.application.findFirst({
    where: { id, userId: user.id },
  });

  if (!existing) {
    return NextResponse.json({ error: 'Not found' }, { status: 404 });
  }

  await prisma.application.delete({ where: { id } });

  return NextResponse.json({ success: true });
}
