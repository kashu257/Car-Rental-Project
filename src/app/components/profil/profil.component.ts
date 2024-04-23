import { Component, OnInit } from '@angular/core';
import {
  FormBuilder,
  FormControl,
  FormGroup,
  Validators,
} from '@angular/forms';
import { ToastrService } from 'ngx-toastr';
import { CustomerReal } from 'src/app/models/customer-real';
import { User } from 'src/app/models/user';
import { AuthService } from 'src/app/services/auth.service';
import { CustomerService } from 'src/app/services/customer.service';
import { UserService } from 'src/app/services/user.service';


@Component({
  selector: 'app-profil',
  templateUrl: './profil.component.html',
  styleUrls: ['./profil.component.css'],
})
export class ProfilComponent implements OnInit {
  profileForm: FormGroup;
  customerForm: FormGroup;
  email: string;
  password: FormControl;
  user: User = new User();
  customer: CustomerReal;
  status: string;

  constructor(
    private userService: UserService,
    private formBuilder: FormBuilder,
    private toastrService: ToastrService,
    private customerService: CustomerService,
    private authService: AuthService
  ) {}

  ngOnInit(): void {
    this.createProfileAddForm();
    this.email = localStorage.getItem('email');
    this.getUser();
    this.getCustomer(), this.createCustomerForm();
  }

  createProfileAddForm() {
    this.profileForm = this.formBuilder.group({
      id: this.user.id,
      firstName: ['', Validators.required],
      lastName: ['', Validators.required],
      email: ['', Validators.required],
      password: ['', Validators.required],
      status: true,
    });
  }
  createCustomerForm() {
    this.customerForm = this.formBuilder.group({
      companyName: ['', Validators.required],
    });
  }
  getCustomer() {
    this.customerService
      .getCustomerId(this.authService.getCurrentUserId())
      .subscribe((response) => {
        console.log(response)
        this.customer = response.data;
        this.customerForm.patchValue(response.data);
      });
  }
  updateCustomer() {
    if (this.customerForm.valid) {
      this.customerForm.addControl(
        'userId',
        new FormControl(this.customer.userId)
      );
      this.customerForm.addControl(
        'FindeksScore',
        new FormControl(this.customer.findeksScore)
      );
      let customerModel = Object.assign({}, this.customerForm.value);

      this.customerService.customerUpdate(customerModel).subscribe(
        (response) => {
          this.toastrService.success(response.message);
        },
        (errorResponse) => {
          this.toastrService.error('Error');
        }
      );
    } else {
      this.toastrService.error('Form left blank', 'Warning');
    }
  }
  getUser() {
    if (this.email) {
      this.userService.getByEmail(this.email).subscribe(
        (response) => {
          this.user = response;
          if (response.status) {
            this.status = 'Active';
          } else {
            this.status = 'Inactive';
          }
        },
        (responseError) => {
          this.toastrService.error(responseError.error);
        }
      );
    }
  }
  updateProfile() {
    if (this.profileForm.valid) {
      let profileModel = Object.assign({}, this.profileForm.value);
      this.userService.profileUpdate(profileModel).subscribe(
        (response) => {
          this.toastrService.success(response.message);
        },
        (responseError) => {
          this.toastrService.error(responseError.error);
        }
      );
    } else {
      this.toastrService.error('You Left the Form Blank');
    }
  }
}
