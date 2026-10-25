// HostService do Diagrama de Componentes: a conta e a entrada do anfitrião (UC001). Quem
// abre a sessão é a Apresentação, com o anfitrião que este serviço devolve (Guia, 4.2).
import { Injectable } from '@nestjs/common';
import argon2 from 'argon2';
import { TEXT_LIMITS } from '@invite-app/contract';
import { HostRepository } from '../data/host.repository.js';
import type { Host } from '../model/index.js';
import { ValidationError } from './errors.js';

const ARGON2_OPTIONS = { type: argon2.argon2id } as const;

// Conferência sem conta, para a entrada recusada gastar o mesmo tempo nos dois casos e o
// tempo não contar quais emails têm conta (UC001 A2 e ADR-0010).
let dummyHash: Promise<string> | undefined;
const getDummyHash = () => (dummyHash ??= argon2.hash('sem-conta', ARGON2_OPTIONS));

// Forma mínima de email: algo, arroba, algo, ponto, algo. Quem confirma é a entrega.
const EMAIL_FORMAT = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

@Injectable()
export class HostService {
  constructor(private readonly hosts: HostRepository) {}

  /** Cria a conta (UC001 A1), ou recusa o email que já tem conta (RN3). */
  async signUp(name?: string, email?: string, password?: string): Promise<Host> {
    const cleanName = name?.trim() ?? '';
    const cleanEmail = email?.trim().toLowerCase() ?? '';
    if (!cleanName) throw new ValidationError('name', 'required');
    if (cleanName.length > TEXT_LIMITS.hostName) throw new ValidationError('name', 'maxLength');
    if (!cleanEmail) throw new ValidationError('email', 'required');
    if (cleanEmail.length > TEXT_LIMITS.email) throw new ValidationError('email', 'maxLength');
    if (!EMAIL_FORMAT.test(cleanEmail)) throw new ValidationError('email', 'allowedValue');
    if (!password) throw new ValidationError('password', 'required');
    if (password.length < TEXT_LIMITS.passwordMin) {
      throw new ValidationError('password', 'minLength');
    }
    if (password.length > TEXT_LIMITS.passwordMax) {
      throw new ValidationError('password', 'maxLength');
    }

    const passwordHash = await argon2.hash(password, ARGON2_OPTIONS);
    const host = await this.hosts.createIfEmailFree(cleanName, cleanEmail, passwordHash);
    if (!host) throw new ValidationError('email', 'alreadyRegistered');
    return host;
  }

  /** O anfitrião das credenciais, ou vazio, sem dizer se errou o email ou a senha (UC001 A2). */
  async signIn(email?: string, password?: string): Promise<Host | null> {
    if (!password || password.length > TEXT_LIMITS.passwordMax) return null;
    const host = await this.hosts.findByEmail(email?.trim() ?? '');
    const valid = await argon2.verify(host?.passwordHash ?? (await getDummyHash()), password);
    return host && valid ? host : null;
  }

  /** Quem está com a sessão aberta, ou vazio se a conta não existe mais. */
  getHostProfile(hostId: string): Promise<Host | null> {
    return this.hosts.findById(hostId);
  }
}
