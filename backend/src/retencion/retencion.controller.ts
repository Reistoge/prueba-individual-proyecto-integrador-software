import { Controller, Get, Query } from '@nestjs/common';
import { RetencionService } from './retencion.service';
import { ApiOperation, ApiResponse, ApiQuery } from '@nestjs/swagger';
import { RetencionResponseDto } from './dto/retencion-response.dto';
import { CarreraResponseDto } from './dto/carrera-response.dto';

@Controller('retencion')
export class RetencionController {
  constructor(private readonly retencionService: RetencionService) { }

  @Get('resumen')
  @ApiOperation({ summary: "Obtiene retención global. Si se especifica 'filename', lee del JSON local." })
  @ApiResponse({ type: RetencionResponseDto, isArray: true })
  @ApiQuery({ name: 'from', required: false, type: Number })
  @ApiQuery({ name: 'to', required: false, type: Number })
  @ApiQuery({ name: 'catalogo', required: false, type: String })
  @ApiQuery({ name: 'filename', required: false, type: String, description: 'Nombre del archivo en seed/ (ej: output.json)' })
  getResumen(
    @Query('from') from?: number,
    @Query('to') to?: number,
    @Query('catalogo') catalogo?: string,
    @Query('filename') filename?: string // <--- Nuevo parámetro
  ) {
    return this.retencionService.obtenerResumen({ from, to, catalogo }, filename);
  }

  @Get('carreras')
  @ApiOperation({ summary: "Listado de carreras disponibles" })
  @ApiResponse({ type: CarreraResponseDto, isArray: true })
  getCarreras() {
    return this.retencionService.obtenerCarreras();
  }

  @Get('por-carrera')
  @ApiOperation({ summary: "Retención por carrera. Si se especifica 'filename', lee del JSON local." })
  @ApiResponse({ type: RetencionResponseDto, isArray: true })
  @ApiQuery({ name: 'from', required: false, type: Number })
  @ApiQuery({ name: 'to', required: false, type: Number })
  @ApiQuery({ name: 'catalogo', required: false, type: String })
  @ApiQuery({ name: 'filename', required: false, type: String })
  getCarreraByPrograma(
    @Query('cod_programa') codPrograma: string,
    @Query('from') from?: number,
    @Query('to') to?: number,
    @Query('catalogo') catalogo?: string,
    @Query('filename') filename?: string // <--- Nuevo parámetro
  ) {
    return this.retencionService.obtenerPorCarrera(codPrograma, { from, to, catalogo }, filename);
  }
}