import { ApiProperty } from "@nestjs/swagger";

export class CreateStudentDto {
    @ApiProperty()    
    rut: string;
    @ApiProperty() 
    nombre: string;
    @ApiProperty()
    year_admision: number;
    @ApiProperty()
    nombre_estandar: string;
    @ApiProperty()
    catalogo: string;
    @ApiProperty()
    year_estado: number;
    @ApiProperty()
    cod_estado: string;
    @ApiProperty()
    nombre_estado: string;

}
