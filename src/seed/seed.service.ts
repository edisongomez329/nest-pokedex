import { BadRequestException, Injectable, InternalServerErrorException } from '@nestjs/common';
import axios, { AxiosInstance } from 'axios';
import { PokeResponse } from './interfaces/poke-response.interface';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Pokemon } from 'src/pokemon/entities/pokemon.entity';
import { CreatePokemonDto } from 'src/pokemon/dto/create-pokemon.dto';
import { PokemonService } from 'src/pokemon/pokemon.service';
import { AxiosAdapter } from 'src/common/adapters/axios.adapter';

@Injectable()
export class SeedService {

  private readonly axios: AxiosInstance = axios;

  constructor(
    private readonly pokemonService: PokemonService,
    @InjectModel(Pokemon.name)
    private readonly pokemonModel: Model<Pokemon>,
    private readonly axiosAdapter: AxiosAdapter
  ){}

  async executeSeedWithAxios() {
    const data = await this.axiosAdapter.get<PokeResponse>('https://pokeapi.co/api/v2/pokemon?limit=10');

    console.log({msg: 'data with axios'});

    this.iterateData(data);

    return data.results;
  }
  
  async executeSeedWithFetch() {
    const response = await fetch('https://pokeapi.co/api/v2/pokemon?limit=10');

    const data = await response.json() as PokeResponse;
    
    console.log({msg: 'data with fetch'});

    this.iterateData(data);
    

    return data.results;
  }

  private async iterateData(data: PokeResponse) {
    let pokemons: CreatePokemonDto[] = [];
    
    //forEach con desesctructuracion
    data.results.forEach( ({name, url}) => {
      console.log({name, url});
      const segments = url.split('/');
      const no = +segments[ segments.length - 2]

      let pokemon: CreatePokemonDto = {
        no: no,
        name: name
      }; 
      pokemons.push(pokemon);
    });
    console.log("Pokemons a insertar", pokemons);
    //await this.pokemonService.recreateManySeed(pokemons);
    await this.recreateManySeed(pokemons);
  }

  /**
   * Elimina todos los pokemons que existan, e inserta un nuevo array de pokemons
   * Ejemplo usando la inyección de mongooseModule, para esto se de exportar desde el modulo de pokemon
   * @param createPokemonsDto array de nuevos pokemon a insertar
   * @returns 
   */
  async recreateManySeed(createPokemonsDto: CreatePokemonDto[]) {
    try {
      await this.pokemonModel.deleteMany({});

      const pokemon = await this.pokemonModel.insertMany(createPokemonsDto);
      return pokemon;
    } catch (error) {
      if (error.code === 11000)
      throw new BadRequestException(`Pokemon exists in DB ${JSON.stringify(error.keyValue)}`);

    throw new InternalServerErrorException(`Can't create or update pokemon`);
    }
  }
}
