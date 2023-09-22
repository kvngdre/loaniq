export class UserDto {
  constructor({
    id,
    tenantId,
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
    createdAt,
    updatedAt,
  }) {
    this.id = id;
    this.tenantId = tenantId;
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
    this.createdAt = createdAt;
    this.updatedAt = updatedAt;
  }

  static from({
    id,
    tenantId,
    firstName,
    lastName,
    displayName,
    jobTitle,
    phoneNumber,
    email,
    role,
    status,
    configurations,
    createdAt,
    updatedAt,
  }) {
    return new UserDto({
      id,
      tenantId,
      firstName,
      lastName,
      displayName,
      jobTitle,
      phoneNumber,
      email,
      role,
      status,
      configurations,
      createdAt,
      updatedAt,
    });
  }

  /**
   *
   * @param {Array} users
   * @returns
   */
  static fromMany(users) {
    return users.map((user) =>
      UserDto.from({
        id: user._id,
        tenantId: user.tenantId,
        firstName: user.firstName,
        lastName: user.lastName,
        displayName: user.displayName,
        jobTitle: user.jobTitle,
        phoneNumber: user.phoneNumber,
        email: user.email,
        role: user.role.name,
        status: user.status,
        segments: user.segments,
        configurations: user.configurations,
        createdAt: user.createdAt,
        updatedAt: user.updatedAt,
      }),
    );
  }
}
