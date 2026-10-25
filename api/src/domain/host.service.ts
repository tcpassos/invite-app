import { Injectable } from '@nestjs/common';
import argon2 from 'argon2';
import { TEXT_LIMITS } from '@invite-app/contract';
import { HostEmailAlreadyRegisteredError, HostRepository } from '../data/host.repository.js';
import type { Host } from '../model/host.js';
import { ValidationError } from './errors.js';

const ARGON2_OPTIONS = { type: argon2.argon2id } as const;

@Injectable()
export class HostService {
  constructor(private readonly hosts: HostRepository) {}

  async signUp(
    name: string | undefined,
    email: string | undefined,
    password: string | undefined,
  ): Promise<Host> {
    this.validateSignup(name, email, password);
    const passwordHash = await argon2.hash(password!, ARGON2_OPTIONS);
    try {
      return await this.hosts.create(name!.trim(), email!.trim().toLowerCase(), passwordHash);
    } catch (error) {
      if (error instanceof HostEmailAlreadyRegisteredError) {
        throw new ValidationError('email', 'alreadyRegistered');
      }
      throw error;
    }
  }

  async signIn(email: string | undefined, password: string | undefined): Promise<Host | null> {
    const normalizedEmail = email?.trim().toLowerCase() ?? '';
    if (!password || password.length > TEXT_LIMITS.passwordMax) return null;
    const candidate = await this.hosts.findByEmail(normalizedEmail);
    if (!candidate) {
      await argon2.hash(password, ARGON2_OPTIONS);
      return null;
    }
    if (!(await argon2.verify(candidate.passwordHash, password))) return null;
    return candidate;
  }

  async getHostProfile(hostId: string) {
    const host = await this.hosts.findById(hostId);
    return host ? this.profile(host) : null;
  }

  profile(host: Host) {
    return { name: host.name, email: host.email };
  }

  private validateSignup(
    name: string | undefined,
    email: string | undefined,
    password: string | undefined,
  ): void {
    if (!name?.trim()) throw new ValidationError('name', 'required');
    if (name.trim().length > TEXT_LIMITS.hostName) {
      throw new ValidationError('name', 'maxLength');
    }
    if (!email?.trim()) throw new ValidationError('email', 'required');
    if (email.trim().length > TEXT_LIMITS.email) throw new ValidationError('email', 'maxLength');
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) {
      throw new ValidationError('email', 'allowedValue');
    }
    if (!password) throw new ValidationError('password', 'required');
    if (password.length < TEXT_LIMITS.passwordMin) {
      throw new ValidationError('password', 'minLength');
    }
    if (password.length > TEXT_LIMITS.passwordMax) {
      throw new ValidationError('password', 'maxLength');
    }
  }
}
