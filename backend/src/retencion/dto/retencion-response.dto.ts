import { ApiProperty } from "@nestjs/swagger";
import { IsArray, IsNumber, IsString, ValidateNested } from "class-validator";


export class RetencionResponseDto{
    @ApiProperty({description: "year"})
    @IsNumber()
    anio_cohorte: number;
    
    @ApiProperty({description: "cod_programa, nombre_estandar cuando aplique"})
    @IsString()
    carrera:string;
    
    @ApiProperty()
    @IsString()
    matriculados_primera_vez: string;
    
    @ApiProperty()
    @IsString()
    retenidos_anio_siguiente:string;

}