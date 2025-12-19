import { ApiProperty } from "@nestjs/swagger";
import { IsNumber, IsString } from "class-validator";

export class RetencionResponseDto {
    @ApiProperty({ description: "Año cohorte" })
    @IsNumber()
    anio_cohorte: number;

    @ApiProperty({ description: "cod_programa o 'global'" })
    @IsString()
    carrera: string;

    @ApiProperty()
    @IsNumber()
    matriculados_primera_vez: number;

    @ApiProperty()
    @IsNumber()
    retenidos_anio_siguiente: number;

    @ApiProperty()
    @IsNumber()
    tasa_retencion: number;
}