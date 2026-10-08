// Toda requisição com corpo precisa vir como application/json (Guia da Arquitetura, 10.4).
// Um formulário de outro site só consegue enviar texto ou formulário sem passar pela
// checagem de origem, então recusar esses tipos fecha a escrita forjada no painel.
// A recusa vira 400 MALFORMED_REQUEST no filtro, como tipo de conteúdo não suportado.
import {
  Injectable,
  UnsupportedMediaTypeException,
  type CanActivate,
  type ExecutionContext,
} from '@nestjs/common';
import type { Request } from 'express';

function hasBody(req: Request): boolean {
  const length = req.headers['content-length'];
  if (length !== undefined) return Number(length) > 0;
  return req.headers['transfer-encoding'] !== undefined;
}

@Injectable()
export class JsonContentTypeGuard implements CanActivate {
  canActivate(context: ExecutionContext): boolean {
    const req = context.switchToHttp().getRequest<Request>();
    if (hasBody(req) && !req.is('application/json')) {
      throw new UnsupportedMediaTypeException();
    }
    return true;
  }
}
