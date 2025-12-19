import { ApiProperty } from "@nestjs/swagger";

export class CarreraResponseDto{
    @ApiProperty()
    cod_programa: string;
    @ApiProperty()
    nombre_estandar: string;
    @ApiProperty()
    count: number

}