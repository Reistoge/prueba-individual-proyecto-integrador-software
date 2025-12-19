import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

export type StudentAcademicStatusDocument = StudentAcademicStatus & Document;

@Schema({ timestamps: true })
export class StudentAcademicStatus {

    @Prop({ required: true })
    rut: string;

    @Prop({ required: true })
    nombre: string;

    @Prop({ required: true })
    year_admision: number;

    @Prop({ required: true })
    cod_programa: string;

    @Prop({ required: true })
    nombre_estandar: string;

    @Prop({ required: true })
    catalogo: string;

    @Prop({ required: true })
    year_estado: number;

    @Prop()
    cod_estado: string;

    @Prop({ required: true })
    nombre_estado: string;

}

export const StudentAcademicStatusSchema = SchemaFactory.createForClass(StudentAcademicStatus);