import { IsNumber, IsOptional, IsPositive, Min, isNumber } from "class-validator";

export class PaginationDto {

    @IsOptional()
    @IsNumber()
    @IsPositive()
    @Min(1)
    limit: number;

    @IsNumber()
    @IsOptional()
    @IsPositive()    
    offset: number;
}