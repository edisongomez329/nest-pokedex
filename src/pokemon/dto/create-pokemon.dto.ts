import { IsInt, IsNumber, IsPositive, IsString, MIN_LENGTH, Min, MinLength } from "class-validator";

export class CreatePokemonDto {


    @IsInt()
    @IsPositive()  
    
    @Min(1)  
    no: number;

    @IsString()
    @MinLength(2)    
    name: string;
}
