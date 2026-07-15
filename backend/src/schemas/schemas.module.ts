import { Module } from '@nestjs/common';
import { SchemasService } from './schemas.service';
import { SchemasController } from './schemas.controller';

@Module({
  controllers: [SchemasController],
  providers: [SchemasService],
})
export class SchemasModule {}
