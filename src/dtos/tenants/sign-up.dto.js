/* eslint-disable camelcase */
import { tenantValidator } from "../../validators/index.js";

export class SignUpDto {
  constructor(
    businessName,
    firstName,
    lastName,
    phoneNo,
    email,
    password,
    confirmPassword,
  ) {
    this.businessName = businessName;
    this.firstName = firstName;
    this.lastName = lastName;
    this.phoneNo = phoneNo;
    this.email = email;
    this.password = password;
    this.confirmPassword = confirmPassword;
  }

  static from(body) {
    const parsedData = tenantValidator.validateSignUpDto(body);

    return new SignUpDto(
      parsedData.business_name,
      parsedData.first_name,
      parsedData.last_name,
      parsedData.phone_no,
      parsedData.email,
      parsedData.password,
      parsedData.confirm_password,
    );
  }
}
