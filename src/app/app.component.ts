import {
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  OnDestroy,
  OnInit,
  ViewChild,
} from '@angular/core';
import { CoreService } from './@core/services/core.service';
import { Subscription, lastValueFrom } from 'rxjs';
import { Team, Response } from './@core/models/team-models';
import {
  FormBuilder,
  FormControl,
  FormGroup,
  FormGroupDirective,
  Validators,
} from '@angular/forms';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AppComponent implements OnInit, OnDestroy {
  title = 'fifa_soccer_teams';
  private apiSubscription!: Subscription;
  private teamCreateSubscription!: Subscription;
  private teamEditSubscription!: Subscription;
  private teamDeleteSubscription!: Subscription;
  private filterByDatesSubscription!: Subscription;
  public teamDetail!: Team | undefined;
  public openCreateTeamPanel: boolean = false;
  public openEditTeamPanel: boolean = false;
  public page: number = 0;
  public teams: Team[] = [];

  public createTeamForm: FormGroup;
  public editTeamForm: FormGroup;
  public filtersForm: FormGroup;

  @ViewChild('createTeamFormRef') createTeamFormRef!: FormGroupDirective;
  @ViewChild('editTeamFormRef') editTeamFormRef!: FormGroupDirective;
  @ViewChild('filtersFormRef') filtersFormRef!: FormGroupDirective;

  constructor(
    private coreService: CoreService,
    private ref: ChangeDetectorRef,
    private formBuilder: FormBuilder
  ) {
    this.createTeamForm = this.formBuilder.group({
      nombre: new FormControl('', [Validators.required]),
      estadio: new FormControl('', [Validators.required]),
      sitioWeb: new FormControl('', [Validators.required]),
      nacionalidad: new FormControl('', [Validators.required]),
      fundacion: new FormControl('', [Validators.required]),
      entrenador: new FormControl('', [Validators.required]),
      capacidad: new FormControl('', [Validators.required]),
      valor: new FormControl('', [Validators.required]),
    });
    this.editTeamForm = this.formBuilder.group({
      nombre: new FormControl(''),
      estadio: new FormControl(''),
      sitioWeb: new FormControl(''),
      nacionalidad: new FormControl(''),
      fundacion: new FormControl(''),
      entrenador: new FormControl(''),
      capacidad: new FormControl(''),
      valor: new FormControl(''),
    });
    this.filtersForm = this.formBuilder.group({
      fechaInicio: new FormControl('', Validators.required),
      fechaFin: new FormControl('', Validators.required),
    });
  }

  ngOnDestroy(): void {
    this.apiSubscription ? this.apiSubscription.unsubscribe() : null;
    this.teamCreateSubscription
      ? this.teamCreateSubscription.unsubscribe()
      : null;
    this.teamEditSubscription ? this.teamEditSubscription.unsubscribe() : null;
    this.teamDeleteSubscription
      ? this.teamDeleteSubscription.unsubscribe()
      : null;
    this.filterByDatesSubscription
      ? this.filterByDatesSubscription.unsubscribe()
      : null;
  }

  ngOnInit(): void {
    this.getTeams();
  }

  private getTeams() {
    this.apiSubscription = this.coreService
      .getTeams()
      .subscribe((res: Response | any) => {
        this.teams = res.content;
        this.teams.forEach((team: Team) => {
          team.fundacion = new Date(team.fundacion);
          const day = team.fundacion.getUTCDate();
          const month = team.fundacion.getUTCMonth() + 1;
          const year = team.fundacion.getUTCFullYear();
          team.fundacion = `${day.toString().length === 1 ? '0' + day : day}/${
            month.toString().length === 1 ? '0' + month : month
          }/${year}`;
        });
        this.ref.markForCheck();
      });
  }

  public async setTeamDetail(id: number) {
    const p: Team | any = await lastValueFrom(this.coreService.getTeamById(id));
    this.teamDetail = p;
    this.teamDetail!.fundacion = new Date(this.teamDetail!.fundacion);
    const day = this.teamDetail!.fundacion.getUTCDate();
    const month = this.teamDetail!.fundacion.getUTCMonth() + 1;
    const year = this.teamDetail!.fundacion.getUTCFullYear();
    this.teamDetail!.fundacion = `${
      day.toString().length === 1 ? '0' + day : day
    }/${month.toString().length === 1 ? '0' + month : month}/${year}`;
    this.ref.markForCheck();
  }

  public createTeam(form: FormGroup) {
    this.teamCreateSubscription = this.coreService
      .createTeam(form.value)
      .subscribe((res) => {
        this.getTeams();
        this.closeCreatePanel();
        this.ref.markForCheck();
      });
  }

  public async setEditTeamForm(id: number, event: Event) {
    event.stopPropagation();
    this.openEditTeamPanel = true;
    const p: Team | any = await lastValueFrom(this.coreService.getTeamById(id));
    localStorage.setItem('teamToEditId', p.id);
    p.fundacion = new Date(p.fundacion);
    const day = p.fundacion.getUTCDate();
    const month = p.fundacion.getUTCMonth() + 1;
    const year = p.fundacion.getUTCFullYear();
    p.fundacion = `${year}-${
      month.toString().length === 1 ? '0' + month : month
    }-${day.toString().length === 1 ? '0' + day : day}`;
    this.setEditInputValue('nombre', p.nombre);
    this.setEditInputValue('estadio', p.estadio);
    this.setEditInputValue('sitioWeb', p.sitioWeb);
    this.setEditInputValue('nacionalidad', p.nacionalidad);
    this.setEditInputValue('fundacion', p.fundacion);
    this.setEditInputValue('entrenador', p.entrenador);
    this.setEditInputValue('capacidad', p.capacidad);
    this.setEditInputValue('valor', p.valor);
  }

  public async editTeam(form: FormGroup) {
    const id = localStorage.getItem('teamToEditId');
    const p: Team | any = await lastValueFrom(
      this.coreService.getTeamById(+id!)
    );
    const newData = { ...p, ...form.value };
    this.teamEditSubscription = this.coreService
      .editTeam(+id!, newData)
      .subscribe((response) => {
        this.getTeams();
        this.openEditTeamPanel = false;
        this.editTeamForm.reset();
        this.editTeamFormRef.resetForm();
        this.ref.markForCheck();
      });
  }

  private setEditInputValue(input: string, value: any) {
    this.editTeamForm.get(input)?.setValue(value);
  }

  public deleteTeam(id: number, event: Event) {
    event.stopPropagation();
    this.teamDeleteSubscription = this.coreService
      .deleteTeam(id)
      .subscribe((res) => {
        this.getTeams();
        this.ref.markForCheck();
      });
  }

  public closeDetailPanel() {
    this.teamDetail = undefined;
  }

  public closeCreatePanel() {
    this.openCreateTeamPanel = false;
    this.createTeamForm.reset();
    this.createTeamFormRef.resetForm();
  }

  public closeEditPanel() {
    this.openEditTeamPanel = false;
    this.editTeamForm.reset();
    this.editTeamFormRef.resetForm();
  }

  public filterListByDates(form: FormGroup) {
    this.filterByDatesSubscription = this.coreService
      .filterListByDates(form.value)
      .subscribe((res: any) => {
        this.teams = res;
        this.ref.markForCheck();
      });
  }

  public refreshList() {
    this.filtersForm.reset();
    this.filtersFormRef.resetForm();
    this.getTeams();
    this.ref.markForCheck();
  }
}
