import { Injectable } from '@angular/core';
import { map } from 'rxjs/operators';
import { _throw}  from 'rxjs/observable/throw';
import { ApiResponse, Notification, Customer } from '../../models';
import { ApiService, EnvService, AuthService } from '../../services';
import { hasProp } from '../../helpers';


@Injectable()
export class Notifications {

  notifications: Notification[] = [];
  user: Customer;

  constructor(private env: EnvService,
    private apiService: ApiService,
    private authService: AuthService,
    ) {
    const notifications = []; // Initial Values
    for (const notification of notifications) {
      this.notifications.push(new Notification(notification));
    }
    this.authService.isAuthenticated().then((pmtBooking) => {
      if (pmtBooking && hasProp(pmtBooking, 'customer')) {
        this.user = new Customer(pmtBooking.customer);
        if (hasProp(this.user, 'id')){
          const queryString = `?customer_id=${this.user.id}&recipient=CUSTOMER&sort=-created_at`;
            this.recordRetrieve(queryString).then().catch(err => console.log(err));                
        }
      }
    }).catch(err => console.log(err));
  }

  query(params?: any) {
    if (!params) {
      return this.notifications;
    }
    return this.notifications.filter((notification) => {
      for (const key in params) {
          if (params.hasOwnProperty(key)) {
            const field = notification[key];
            if (typeof field === 'string' && field.toLowerCase().indexOf(params[key].toLowerCase()) >= 0) {
              return notification;
            } else if (field === params[key]) {
              return notification;
            }
          }
      }
      return null;
    });
  }

  add(record: Notification) {
    this.notifications.push(record);
  }

  delete(record: Notification) {
    this.notifications.splice(this.notifications.indexOf(record), 1);
  }

  async recordRetrieve(queryString = ''): Promise<ApiResponse> {
      const url = `${this.env.API_URL}/notifications${queryString}`;
      const proRes = this.apiService.getApi(url).pipe(
          map((res: ApiResponse) => {
              console.log(res);
              if (res.success && res.payload.length > 0) {
                  res.payload.forEach(element => {
                      this.add(element);
                  });
              } else {
                  _throw(res.message);
              }
              return res;
          }));
      return await proRes.toPromise();
  }

  async recordCreate(record: Notification): Promise<ApiResponse> {
      const url = `${this.env.API_URL}/notifications`;
      const proRes = this.apiService.postApi(url, record).pipe(
          map((res: ApiResponse) => {
              if (res.success && res.payload) {
                  console.log('recordCreate() successful');
              } else {
                  _throw(res.message);
              }
              return res;
          }));
      return await proRes.toPromise();
  }

  async recordUpdate(record: Notification, payload): Promise<ApiResponse> {
      const url = `${this.env.API_URL}/notifications/${record.id}`;
      const proRes = this.apiService.updateApi(url, payload).pipe(
          map((res: ApiResponse) => {
              if (res.success) {
                  this.delete(record);
              } else {
                  _throw(res.message);
              }
              return res;
          }));
      return await proRes.toPromise();
  }

  async recordDelete(record: Notification, payload): Promise<ApiResponse> {
      const url = `${this.env.API_URL}/notifications/${record.id}`;
      const proRes = this.apiService.deleteApi(url).pipe(
          map((res: ApiResponse) => {
              if (res.success) {
                  this.delete(record);
              } else {
                  _throw(res.message);
              }
              return res;
          }));
      return await proRes.toPromise();
  }
}
