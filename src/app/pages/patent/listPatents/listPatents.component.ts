import { Component, OnInit } from '@angular/core';
import { ToastrService } from 'ngx-toastr';
import { Patent } from 'src/app/models/patent';
import { PatentService } from 'src/app/service/patent.service';
import { TokenService } from 'src/app/service/token.service';
import { ParkingService } from 'src/app/service/parking.service';
import { Parking } from 'src/app/models/parking';
import { UserService } from 'src/app/service/user.service';
import { CurrentAccount } from 'src/app/models/current-account';

@Component({
  selector: 'app-listPatents',
  templateUrl: './listPatents.component.html',
})
export class ListPatentsComponent implements OnInit {
  patents: Patent[] = [];
  parking!: Parking;
  account!: CurrentAccount;

  balance!: number;
  userId!: number;
  startedParking!: boolean;

  valueByHour!: number;
  parkingId!: number;

  //paginado:
  length: any;
  page: number = 1;

  constructor(
    private patentService: PatentService,
    private userService: UserService,
    private parkingService: ParkingService,
    private toastr: ToastrService,
    private tokenService: TokenService
  ) {
    this.userId = Number(this.tokenService.getIdUser());
  }

  ngOnInit(): void {
    this.getInfoUser();
    this.listAllPatents();
    this.checkStartedParking();
  }

  getInfoUser() {
    this.userService
      .findCurrentAccountById(this.tokenService.getIdUser())
      .subscribe((data: any) => {
        this.account = data;
        this.balance = data.balance;
      });
  }

  listAllPatents(): void {
    this.patentService
      .getAll(this.tokenService.getIdUser())
      .subscribe((data) => {
        this.patents = data;
      });
  }

  checkStartedParking() {
    this.parkingService
      .existStartedParkingOfUser(this.userId)
      .subscribe((data) => {
        this.startedParking = data; //devuelve true o false
      });
  }

  checkParking(patent: String): void {
    if (this.startedParking) {
      this.finalize();
    } else {
      this.createParking(patent);
    }
  }

  createParking(patent: String): void {
    let date = new Date();
    this.parking = new Parking(true, date.toString(), patent, this.userId);
    this.parkingService.create(this.parking).subscribe({
      next: (data) => {
        //guardo bien los datos
        this.parking = data;
        this.parkingId = this.parking.id;
        this.startedParking = true;
      },
      error: (err) => {
        this.toastr.error(err.error.mensaje, 'Error', {
          timeOut: 3000,
          positionClass: 'toast-top-center',
        });
      },
    });
  }

  finalize(): void {
    this.parkingService.finishParking(this.userId).subscribe({
      next: (data) => {
        this.parking = data;
        this.startedParking = false;

        this.toastr.success(
          'Se acredito el pago de ' + this.parking.amount + '$',
          'Pago acreditado!',
          {
            timeOut: 3000,
            positionClass: 'toast-top-center',
          }
        );
        setInterval(() => window.location.reload(), 1000);
      },
      error: (err) => {
        this.toastr.error(err.error.mensaje, 'Error', {
          timeOut: 3000,
          positionClass: 'toast-top-center',
        });
      },
    });
  }

  deleteById(patent: Patent): void {
    if (
      confirm('¿Estás seguro de eliminar la patente ' + patent.patent + '?')
    ) {
      this.patentService.delete(patent.id).subscribe({
        next: () => {
          this.toastr.success('', 'Patente Eliminada', {
            timeOut: 3000,
            positionClass: 'toast-top-center',
          });
          this.listAllPatents();
        },
        error: (err) => {
          this.toastr.error(err.error.mensaje, 'Error', {
            timeOut: 3000,
            positionClass: 'toast-top-center',
          });
        },
      });
    }
  }
}
