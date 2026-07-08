import { NextResponse } from 'next/server';
import tutorAgent from '@/agent';
import prisma from '@/lib/prisma';

export async function POST(req: Request) {
  try {
    const { message, conversationId } = await req.json();

    if (!message || typeof message !== 'string') {
      return NextResponse.json(
        { error: 'Field "message" diperlukan (string)' },
        { status: 400 },
      );
    }

    // === Dapatkan atau buat conversation ===
    let conversation;
    if (conversationId) {
      conversation = await prisma.conversation.findUnique({
        where: { id: conversationId },
        include: { messages: { orderBy: { createdAt: 'asc' } } },
      });
    }

    if (!conversation) {
      conversation = await prisma.conversation.create({
        data: {},
        include: { messages: true },
      });
    }

    // === Simpan pesan user ===
    await prisma.message.create({
      data: {
        role: 'user',
        content: message,
        conversationId: conversation.id,
      },
    });

    // === Panggil Mastra Agent ===
    const response = await tutorAgent.generate(message);

    const reply =
      typeof response === 'object' && 'text' in response
        ? response.text
        : String(response);

    // === Simpan response agent ===
    await prisma.message.create({
      data: {
        role: 'assistant',
        content: reply,
        conversationId: conversation.id,
      },
    });

    return NextResponse.json({
      reply,
      conversationId: conversation.id,
    });
  } catch (error) {
    console.error('[Chat API Error]', error);
    return NextResponse.json(
      { error: 'Terjadi kesalahan saat memproses pesan.' },
      { status: 500 },
    );
  }
}
