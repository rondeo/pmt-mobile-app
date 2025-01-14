import { Component } from "@angular/core";
import { IonicPage, NavParams, NavController, ToastController } from "ionic-angular";
import { PmtSchedules } from "../../providers";
import { BookingService } from "../../services";
import { PmtSchedule, PmtBooking } from "../../models";

@IonicPage({
  name: 'page-schedule-detail',
  segment: 'schedule-detail'
})

@Component({
    selector: 'page-schedule-detail',
    templateUrl: 'schedule-detail.html'
})
export class ScheduleDetailPage {

  public vehicleLogo: string = '/assets/img/bus-logo.jpg';
  public emptySeat: string = '/assets/img/seat-black-empty.svg';
  public occupiedSeat: string = '/assets/img/seat-black.png';
  public selectedSeat: string = '/assets/img/seat-blue.png';
  
  param: number;
  public schedule: any;
  public seatPositions: Array<number> = [];

  constructor(public navCtrl: NavController,
    public navParams: NavParams,
    public toastCtrl: ToastController,
    public bookingService: BookingService,
    public scheduleService: PmtSchedules) {
    // set sample data
    this.param = this.navParams.get('id');
    const schedule = this.scheduleService.query({ id: this.param })[0];
    this.schedule = schedule ? schedule: this.scheduleService.query()[0];
    console.log(schedule);
  }

  ionViewDidLoad() {
    console.log('ScheduleDetailPage ionViewDidLoad')
  }

  seatColor(s): string {
    return this.isSeatAvailable(s) ? 'green' : 'secondary';
  }

  selectSeat(seat) {
    if (!this.isSeatAvailable(seat)){
      return;
    }
    const index = this.seatPositions.indexOf(seat);
    if (index >= 0) {
      this.seatPositions.splice(index, 1);
    } else {
      this.seatPositions.push(seat);
    }
  }

  getSeats(){
    const N = this.schedule.vehicle_id.seating_capacity || 16; // seatCapacity
    return Array.from({length: N}, (v, k) => k+1); 
  }

  padSeats(seats: number[]): number[] {
    switch (seats.length) {
      case 14:
        seats.splice(0, 0, null, null);
        seats.splice(7, 0, null);
        seats.splice(11, 0, null);
        seats.splice(15, 0, null);
        break;
      case 15:
        // 0:1
        seats.splice(0, 0, null, null);
        seats.splice(7, 0, null);
        seats.splice(11, 0, null);
        seats.splice(15, 0, null);
        break;
      case 16:
      default:
        seats.splice(0, 0, null, null);
        seats.splice(11, 0, null);
        seats.splice(15, 0, null);
    }
    console.log(seats);
    return seats;
  }

  seatsAvailable(schedule: PmtSchedule){
    const totalSeats = schedule.vehicle_id ? schedule.vehicle_id.seating_capacity : 0;
    const reservedSeats = schedule.pmt_reservation_ids ? schedule.pmt_reservation_ids.length : 0;
    return totalSeats - reservedSeats; // available
  }
  isSeatAvailable(seat: number): Boolean{
    const reservedSeats: Array<number> = this.schedule.pmt_reservation_ids || [];
    return reservedSeats.some(x => x === seat);
  }

  isSeatSelected(seat: number): Boolean{
    return this.seatPositions.some(x => x === seat);
  }

  viewSummary(reservation) {
    let toast = this.toastCtrl.create({
      message: 'Here is your booking details',
      cssClass: 'cruiseToast',
      duration: 2000
    });
    toast.present(toast);
  }

  // go to checkout page
  checkout() {
    const bookingData: PmtBooking = { 
      seatPositions: this.seatPositions,
      seatQuantity: this.seatPositions.length,
      amount: this.seatPositions.length * this.schedule.fare,
      bookingStage: 'page-checkout-booking',
    };
    this.bookingService.setBookingData(bookingData).then(data => data);
    this.navCtrl.push('page-checkout-booking');
  }
}
