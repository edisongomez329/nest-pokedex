import { BadRequestException, HttpCode, HttpStatus, Injectable, InternalServerErrorException, NotFoundException } from '@nestjs/common';
import { CreatePokemonDto } from './dto/create-pokemon.dto';
import { UpdatePokemonDto } from './dto/update-pokemon.dto';
import { InjectModel } from '@nestjs/mongoose';
import { Pokemon } from './entities/pokemon.entity';
import { Model, isValidObjectId } from 'mongoose';
import { PaginationDto } from 'src/common/DTOs/pagination.dto';

@Injectable()
export class PokemonService {

  constructor(
    @InjectModel(Pokemon.name)
    private readonly pokemonModel: Model<Pokemon>
  ) { }

  @HttpCode(HttpStatus.OK) //sirve para personalizar los códigos de respuesta HTTP
  async create(createPokemonDto: CreatePokemonDto) {

    createPokemonDto.name = createPokemonDto.name.toLocaleLowerCase();

    try {
      const pokemon = await this.pokemonModel.create(createPokemonDto);
      return pokemon;
    } catch (error) {
      this.handleException(error);
    }
  }

  /**
   * Elimina todos los pokemons que existan, e inserta un nuevo array de pokemons
   * @param createPokemonsDto array de nuevos pokemon a insertar
   * @returns 
   */
  async recreateManySeed(createPokemonsDto: CreatePokemonDto[]) {
    try {
      await this.pokemonModel.deleteMany({});

      const pokemon = await this.pokemonModel.insertMany(createPokemonsDto);
      return pokemon;
    } catch (error) {
      this.handleException(error);
    }
  }

  findAll() {
    return this.pokemonModel.find();
  }

  findAllPaginated({limit, offset}: PaginationDto) {
    return this.pokemonModel.find()
                            .limit(limit)
                            .skip(offset);
  }

  async findOne(term: string) {
    let pokemon: Pokemon;

    if (!isNaN(+term)) {
      pokemon = await this.pokemonModel.findOne({ no: term })
    }

    if (!pokemon && isValidObjectId(term))
      pokemon = await this.pokemonModel.findOne({ id: term })

    if (!pokemon)
      pokemon = await this.pokemonModel.findOne({ name: term })

    if (!pokemon)
      throw new NotFoundException(`Pokemon with id ${term}`);

    return pokemon;
  }

  async update(term: string, updatePokemonDto: UpdatePokemonDto) {
    const pokemon = await this.findOne(term);

    if (updatePokemonDto.name)
      updatePokemonDto.name = updatePokemonDto.name.toLocaleLowerCase();

    try {
      await pokemon.updateOne(updatePokemonDto, { new: true });

      return { ...pokemon.toJSON(), ...updatePokemonDto };

    } catch (error) {
      this.handleException(error);
    }

  }

  async remove(id: string) {
    const pokemon = await this.findOne(id);
    await pokemon.deleteOne();
    return {id};
  }

  async removeSimple(id: string) {
    const result = await this.pokemonModel.findByIdAndDelete(id);
    
    return {result};
  }

  async removeOne(id: string) {
    const result = await this.pokemonModel.deleteOne({_id: id});
    
    return {result};
  }

  async removeOneV2(id: string) {
    const { deletedCount } = await this.pokemonModel.deleteOne({_id: id});
    if(deletedCount === 0){
      throw new BadRequestException(`Pokemon with id ${id} not found`);
    }
    return;
  }

  private handleException(error: any) {
    console.log(error);
    if (error.code === 11000)
      throw new BadRequestException(`Pokemon exists in DB ${JSON.stringify(error.keyValue)}`);

    throw new InternalServerErrorException(`Can't create or update pokemon`);
  }
}
