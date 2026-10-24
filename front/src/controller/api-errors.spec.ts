import type { ApiError } from '@invite-app/contract';
import { ApiRequestError, ApiUnavailableError } from './api-client';
import { fieldErrors, isUncertainFailure, readPublic } from './api-errors';

const erro = (status: number, body: Omit<ApiError, 'message' | 'traceId'>) =>
  new ApiRequestError(status, { message: 'x', traceId: 'a1b2c3d4e5f60718', ...body });

describe('readPublic', () => {
  it('devolve o dado quando a leitura dá certo', async () => {
    await expect(readPublic(Promise.resolve({ eventName: 'Festa' }))).resolves.toEqual({
      kind: 'ok',
      data: { eventName: 'Festa' },
    });
  });

  it('separa não encontrado, limite de taxa e indisponível', async () => {
    const naoEncontrado = readPublic(Promise.reject(erro(404, { code: 'NOT_FOUND' })));
    await expect(naoEncontrado).resolves.toEqual({ kind: 'notFound' });

    const ocupado = readPublic(Promise.reject(erro(429, { code: 'RATE_LIMITED' })));
    await expect(ocupado).resolves.toEqual({ kind: 'busy' });

    const quinhentos = readPublic(Promise.reject(erro(500, { code: 'INTERNAL_ERROR' })));
    await expect(quinhentos).resolves.toEqual({ kind: 'unavailable' });

    const foraDoAr = readPublic(Promise.reject(new ApiUnavailableError(undefined)));
    await expect(foraDoAr).resolves.toEqual({ kind: 'unavailable' });
  });

  it('não engole erro de programação', async () => {
    await expect(readPublic(Promise.reject(new TypeError('bug')))).rejects.toThrow('bug');
  });
});

describe('fieldErrors', () => {
  it('indexa a regra pelo campo do contrato e fica com a primeira', () => {
    const recusa = erro(422, {
      code: 'VALIDATION_FAILED',
      details: [
        { field: 'name', rule: 'required' },
        { field: 'dietaryNote.freeText', rule: 'descriptionRequired' },
        { field: 'name', rule: 'maxLength' },
      ],
    });
    expect(fieldErrors(recusa)).toEqual({
      name: 'required',
      'dietaryNote.freeText': 'descriptionRequired',
    });
  });

  it('não inventa campo quando o erro não é de validação', () => {
    expect(fieldErrors(erro(409, { code: 'CAPACITY_EXCEEDED' }))).toEqual({});
    expect(fieldErrors(new Error('x'))).toEqual({});
  });
});

describe('isUncertainFailure', () => {
  it('vale para rede e 500, e não para recusa da API', () => {
    expect(isUncertainFailure(new ApiUnavailableError(undefined))).toBe(true);
    expect(isUncertainFailure(erro(500, { code: 'INTERNAL_ERROR' }))).toBe(true);
    expect(isUncertainFailure(erro(409, { code: 'CAPACITY_EXCEEDED' }))).toBe(false);
  });
});
