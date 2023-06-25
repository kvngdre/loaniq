export class TenantResponseDto {
  constructor({ businessName, cacNumber }) {
    this.businessName = businessName;
    this.cacNumber = cacNumber;
  }

  static from(dto) {
    return new TenantResponseDto(dto);
  }
}
