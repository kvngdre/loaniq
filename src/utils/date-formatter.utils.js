const formatter = new Intl.DateTimeFormat("en-GB", {
  month: "long",
  year: "numeric",
  day: "2-digit",
  hour: "2-digit",
  minute: "2-digit",
  second: "2-digit",
  hour12: true,
});

export const dateFormatter = {
  /**
   *
   * @param {(number|Date)} [date]
   * @returns
   */
  format: (date = new Date()) => formatter.format(date),
};
