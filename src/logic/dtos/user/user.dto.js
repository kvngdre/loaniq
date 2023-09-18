export class UserDto {
  constructor({
    firstName,
    lastName,
    displayName,
    jobTitle,
    phoneNumber,
    email,
    isEmailVerified,
    role,
    status,
    configurations,
  }) {
    this.firstName = firstName;
    this.lastName = lastName;
    this.displayName = displayName;
    this.jobTitle = jobTitle;
    this.phoneNumber = phoneNumber;
    this.email = email;
    this.isEmailVerified = isEmailVerified;
    this.role = role;
    this.status = status;
    this.configurations = configurations;
  }
}
