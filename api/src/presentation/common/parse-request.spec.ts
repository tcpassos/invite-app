import { BadRequestException } from '@nestjs/common';
import {
  asObject,
  optionalInteger,
  optionalObject,
  optionalString,
  optionalStringArray,
  optionalStringRecord,
} from './parse-request.js';

describe('parseRequest', () => {
  it('recusa corpo que não é objeto', () => {
    for (const body of [null, 'texto', 3, [1, 2]]) {
      expect(() => asObject(body)).toThrow(BadRequestException);
    }
    expect(asObject({ a: 1 })).toEqual({ a: 1 });
  });

  it('deixa campo ausente passar, porque ausência é regra do Domínio e não forma', () => {
    const body = asObject({});
    expect(optionalString(body, 'name')).toBeUndefined();
    expect(optionalInteger(body, 'companionCount')).toBeUndefined();
    expect(optionalStringArray(body, 'categories')).toBeUndefined();
    expect(optionalObject(body, 'dietaryNote')).toBeUndefined();
  });

  it('recusa campo presente no tipo errado', () => {
    expect(() => optionalString({ name: 3 }, 'name')).toThrow(BadRequestException);
    expect(() => optionalInteger({ companionCount: '3' }, 'companionCount')).toThrow(
      BadRequestException,
    );
    expect(() => optionalInteger({ companionCount: 1.5 }, 'companionCount')).toThrow(
      BadRequestException,
    );
    expect(() => optionalStringArray({ categories: ['VEGAN', 1] }, 'categories')).toThrow(
      BadRequestException,
    );
    expect(() =>
      optionalStringRecord({ colorOverrides: { primary: 1 } }, 'colorOverrides'),
    ).toThrow(BadRequestException);
  });

  it('deixa passar valor no tipo certo, mesmo fora da regra, que é do Domínio', () => {
    expect(optionalInteger({ companionCount: -5 }, 'companionCount')).toBe(-5);
    expect(optionalString({ status: 'TALVEZ' }, 'status')).toBe('TALVEZ');
  });

  it('aceita nulo só onde o contrato declara nulo', () => {
    expect(optionalInteger({ peopleLimit: null }, 'peopleLimit', { nullable: true })).toBeNull();
    expect(() => optionalInteger({ companionCount: null }, 'companionCount')).toThrow(
      BadRequestException,
    );
  });
});
