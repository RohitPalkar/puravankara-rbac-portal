import { PipeTransform, Injectable } from '@nestjs/common';

@Injectable()
export class RawStringPipe implements PipeTransform {
  transform(value: unknown): string {
    return String(value);
  }
}
