import type { Conversation, Message, Ticket } from './entities.ts';

/**
 * In-memory persistence stub for the vertical slice.
 *
 * The db iteration replaces this with Prisma + pgvector (packages/db) behind
 * the same method surface, so capabilities.ts never changes. Everything is
 * keyed by `orgId` to keep the multi-tenant boundary explicit from day one.
 */

interface KnowledgeDoc {
  id: string;
  orgId: string;
  title: string;
  content: string;
}

/** Seed KB so the slice returns real hits without a database. */
const SEED_KNOWLEDGE: Omit<KnowledgeDoc, 'orgId'>[] = [
  {
    id: 'kb_reset_password',
    title: 'Resetear contraseña',
    content:
      'Para resetear tu contraseña, ve a Ajustes > Seguridad y haz clic en "Restablecer contraseña". Recibirás un correo con un enlace válido por 30 minutos.',
  },
  {
    id: 'kb_billing',
    title: 'Facturación y planes',
    content:
      'Las facturas se generan el día 1 de cada mes. Puedes cambiar de plan en cualquier momento desde Ajustes > Facturación; el cobro es prorrateado.',
  },
  {
    id: 'kb_business_hours',
    title: 'Horario de soporte humano',
    content:
      'Nuestro equipo de soporte humano atiende de lunes a viernes, 9:00 a 18:00 (hora de Colombia).',
  },
];

class InMemoryStore {
  private knowledge = new Map<string, KnowledgeDoc[]>();
  private conversations = new Map<string, Conversation>();
  private messages = new Map<string, Message[]>();
  private tickets: Ticket[] = [];

  /** Lazily seed an org's KB the first time it's accessed. */
  knowledgeFor(orgId: string): KnowledgeDoc[] {
    let docs = this.knowledge.get(orgId);
    if (!docs) {
      docs = SEED_KNOWLEDGE.map((d) => ({ ...d, orgId }));
      this.knowledge.set(orgId, docs);
    }
    return docs;
  }

  ensureConversation(orgId: string, conversationId: string): Conversation {
    let convo = this.conversations.get(conversationId);
    if (!convo) {
      convo = {
        id: conversationId,
        orgId,
        channel: 'web',
        status: 'active',
        createdAt: new Date().toISOString(),
      };
      this.conversations.set(conversationId, convo);
    }
    return convo;
  }

  appendMessage(
    orgId: string,
    conversationId: string,
    role: Message['role'],
    content: string,
  ): Message {
    this.ensureConversation(orgId, conversationId);
    const msg: Message = {
      id: crypto.randomUUID(),
      orgId,
      conversationId,
      role,
      content,
      createdAt: new Date().toISOString(),
    };
    const list = this.messages.get(conversationId) ?? [];
    list.push(msg);
    this.messages.set(conversationId, list);
    return msg;
  }

  messagesFor(orgId: string, conversationId: string): Message[] {
    return (this.messages.get(conversationId) ?? []).filter((m) => m.orgId === orgId);
  }

  setConversationStatus(orgId: string, conversationId: string, status: Conversation['status']): void {
    const convo = this.ensureConversation(orgId, conversationId);
    convo.status = status;
  }

  createTicket(orgId: string, conversationId: string, reason: string): Ticket {
    const ticket: Ticket = {
      id: crypto.randomUUID(),
      orgId,
      conversationId,
      reason,
      status: 'open',
      createdAt: new Date().toISOString(),
    };
    this.tickets.push(ticket);
    return ticket;
  }
}

export const store = new InMemoryStore();
export type { KnowledgeDoc };
