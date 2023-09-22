export class RoleDto {
  constructor({ name, description }) {
    this.name = name;
    this.description = description;
  }

  static from({ name, description }) {
    return new RoleDto({
      name,
      description,
    });
  }

  /**
   *
   * @param {Array} roles
   * @returns
   */
  static fromMany(roles) {
    return roles.map((role) =>
      RoleDto.from({ name: role.name, description: role.description }),
    );
  }
}
