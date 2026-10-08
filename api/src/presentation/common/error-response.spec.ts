import { BadRequestException, NotFoundException, UnauthorizedException } from '@nestjs/common';
import {
  CapacityExceededError,
  InvalidInviteForPublication,
  InviteNotOpenError,
  NotInviteOwner,
  ValidationError,
} from '../../domain/errors.js';
import { toErrorResponse } from './error-response.js';

const TRACE = '0123456789abcdef';

describe('toErrorResponse', () => {
  it('traduz ValidationError em 422 com uma entrada em details e a mensagem da regra', () => {
    const { status, body } = toErrorResponse(
      new ValidationError('companionCount', 'companionLimit'),
      TRACE,
    );
    expect(status).toBe(422);
    expect(body).toEqual({
      code: 'VALIDATION_FAILED',
      message: 'O número de acompanhantes está acima do limite deste convite.',
      details: [{ field: 'companionCount', rule: 'companionLimit' }],
      traceId: TRACE,
    });
  });

  it('traduz InvalidInviteForPublication em uma entrada required por campo faltando', () => {
    const { status, body } = toErrorResponse(
      new InvalidInviteForPublication(['eventName', 'eventTime']),
      TRACE,
    );
    expect(status).toBe(422);
    expect(body.code).toBe('INVITE_NOT_PUBLISHABLE');
    expect(body.details).toEqual([
      { field: 'eventName', rule: 'required' },
      { field: 'eventTime', rule: 'required' },
    ]);
  });

  it('dá o mesmo corpo para convite de outro anfitrião e para recurso ausente', () => {
    const outro = toErrorResponse(new NotInviteOwner(), TRACE);
    const ausente = toErrorResponse(
      new NotFoundException('Cannot GET /public/invites/TOKEN'),
      TRACE,
    );
    expect(outro).toEqual(ausente);
    expect(outro.status).toBe(404);
    expect(JSON.stringify(ausente.body)).not.toContain('TOKEN');
  });

  it('traduz os conflitos de situação em 409', () => {
    expect(toErrorResponse(new CapacityExceededError(), TRACE).body.code).toBe('CAPACITY_EXCEEDED');
    expect(toErrorResponse(new InviteNotOpenError(), TRACE).body.code).toBe('INVITE_NOT_OPEN');
    expect(toErrorResponse(new InviteNotOpenError(), TRACE).status).toBe(409);
  });

  it('traduz as exceções do framework pelo status', () => {
    expect(toErrorResponse(new BadRequestException(), TRACE).body.code).toBe('MALFORMED_REQUEST');
    expect(toErrorResponse(new UnauthorizedException(), TRACE).body.code).toBe('UNAUTHENTICATED');
  });

  it('nunca leva a mensagem de um erro inesperado para o corpo', () => {
    const { status, body } = toErrorResponse(
      new Error('falhou com o email ana@exemplo.com'),
      TRACE,
    );
    expect(status).toBe(500);
    expect(body.code).toBe('INTERNAL_ERROR');
    expect(JSON.stringify(body)).not.toContain('ana@exemplo.com');
  });

  it('deixa details ausente, e não vazio, quando não se aplica', () => {
    const { body } = toErrorResponse(new CapacityExceededError(), TRACE);
    expect('details' in body).toBe(false);
  });
});
