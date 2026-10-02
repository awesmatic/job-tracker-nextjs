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

export async function GET() {
  const user = await getCurrentUser();
  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const applications = await prisma.application.findMany({
    where: { userId: user.id },
    orderBy: { appliedAt: 'desc' },
  });

  return NextResponse.json(applications);
}

export async function POST(req: Request) {
  const user = await getCurrentUser();
  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const body = await req.json();

  if (!body.company || !body.role) {
    return NextResponse.json(
      { error: 'Company and role are required' },
      { status: 400 }
    );
  }

  const application = await prisma.application.create({
    data: {
      userId: user.id,
      company: body.company,
      role: body.role,
      url: body.url || null,
      status: body.status || 'applied',
      notes: body.notes || null,
    },
  });

  return NextResponse.json(application);
}
