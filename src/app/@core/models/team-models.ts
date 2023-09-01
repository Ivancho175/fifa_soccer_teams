export class Team {
  id?: number;
  nombre!: string;
  estadio!: string;
  sitioWeb!: string;
  nacionalidad!: string;
  fundacion!: Date | string;
  entrenador!: string;
  capacidad!: number;
  valor!: number;
}

export class Response {
  content!: Team[];
  pageable!: any;
  totalPages!: number;
  totalElements!: number;
  last!: boolean;
  numberOfElements!: number;
  sort!: any;
  first!: boolean;
  size!: number;
  number!: number;
  empty!: boolean;
}
