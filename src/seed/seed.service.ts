import { Injectable } from '@nestjs/common';
import axios, { AxiosInstance } from 'axios';
import { PokeResponse } from './interfaces/poke-response.interface';

@Injectable()
export class SeedService {

  private readonly axios: AxiosInstance = axios

  async executeSeedWithAxios() {
    const { data } = await this.axios.get<PokeResponse>('https://pokeapi.co/api/v2/pokemon?limit=1');

    console.log({msg: 'data with axios'});

    this.iterateData(data);

    return data.results;
  }
  
  async executeSeedWithFetch() {
    const response = await fetch('https://pokeapi.co/api/v2/pokemon?limit=1');

    const data = await response.json() as PokeResponse;
    
    console.log({msg: 'data with fetch'});

    this.iterateData(data);
    

    return data.results;
  }

  private iterateData(data: PokeResponse) {
    //forEach con desesctructuracion
    data.results.forEach(({name, url}) => {
      console.log({name, url});
      const segments = url.split('/');
      const no = segments[ segments.length - 2]

      console.log({name, no});
    });
  }
}
