import { IPlayer } from '../../players/interfaces/player.interface';

export interface ICategory {
  readonly category: string;
  description: string;
  events: IEvent[];
  players: IPlayer[];
}

export interface IEvent {
  name: string;
  operation: string;
  value: number;
}
