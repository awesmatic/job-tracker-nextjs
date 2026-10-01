import { prisma } from '@/lib/prisma';

export default async function Test() {
  const count = await prisma.application.count();
  return <div>Application count: {count}</div>;
}
