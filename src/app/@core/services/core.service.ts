import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Team } from '../models/team-models';

@Injectable({
  providedIn: 'root',
})
export class CoreService {
  private url = 'https://wo-fifa.azurewebsites.net/';

  constructor(private http: HttpClient) {}

  public getTeams(page?: Number, limit?: Number) {
    return this.http.get(
      this.url + `equipos/listar/${page ? page : 0}/${limit ? limit : 2000}`
    );
  }

  public getTeamById(id: number) {
    return this.http.get(this.url + `equipos/consultar/${id}`);
  }

  public createTeam(data: Team) {
    return this.http.post(this.url + 'equipos/crear', data);
  }

  public editTeam(id: number, data: Team) {
    return this.http.put(this.url + `equipos/actualizar/${id}`, data);
  }

  public deleteTeam(id: number) {
    return this.http.delete(this.url + `equipos/eliminar/${id}`);
  }

  public filterListByDates(data: any) {
    let { fechaInicio, fechaFin } = data;
    fechaInicio = new Date(fechaInicio);
    const initDay = fechaInicio.getUTCDate();
    const initMonth = fechaInicio.getUTCMonth() + 1;
    const initYear = fechaInicio.getUTCFullYear();
    fechaInicio = `${
      initDay.toString().length === 1 ? '0' + initDay : initDay
    }-${
      initMonth.toString().length === 1 ? '0' + initMonth : initMonth
    }-${initYear}`;

    fechaFin = new Date(fechaFin);
    const endDay = fechaFin.getUTCDate();
    const endMonth = fechaFin.getUTCMonth() + 1;
    const endYear = fechaFin.getUTCFullYear();
    fechaFin = `${endDay.toString().length === 1 ? '0' + endDay : endDay}-${
      endMonth.toString().length === 1 ? '0' + endMonth : endMonth
    }-${endYear}`;

    return this.http.get(
      this.url + `equipos/consultar/${fechaInicio}/${fechaFin}`
    );
  }
}
