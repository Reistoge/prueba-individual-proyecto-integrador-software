import { Controller, Get, Post, Body, Patch, Param, Delete, Query } from '@nestjs/common';
import { RetencionService } from './retencion.service';
import { CreateRetencionDto } from './dto/create-retencion.dto';
import { UpdateRetencionDto } from './dto/update-retencion.dto';
import { ApiOperation, ApiResponse } from '@nestjs/swagger';
import { RetencionResponseDto } from './dto/retencion-response.dto';
import { CarreraResponseDto } from './dto/carrera-response.dto';

@Controller('retencion')
export class RetencionController {
  constructor(private readonly retencionService: RetencionService) { }


  @Get('resumen')
  @ApiOperation({ summary: " obtiene retención por año (todas las carreras)." }) @ApiResponse({ type: RetencionResponseDto, isArray: true })
  getResumen() {
    return this.retencionService.obtenerResumen();
  }
  @Get('carreras')
  @ApiOperation({ summary: "Listado de carreras disponibles" })
  @ApiResponse({ type: CarreraResponseDto, isArray: true })
  getCarreras() {
    return this.retencionService.obtenerCarreras();
  }

  @Get('por-carrera')
  @ApiOperation({ summary: "Retención por carrera y año cohorte" })
  @ApiResponse({ type: RetencionResponseDto, isArray: true })
  getCarreraByPrograma(@Query('cod_programa') codPrograma: string) {
    return this.retencionService.obtenerPorCarrera(codPrograma);
  }




}
