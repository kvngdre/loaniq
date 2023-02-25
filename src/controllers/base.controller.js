class BaseController {
  static getMsgFromCount (count) {
    if (count === 1) return `${count} record found.`
    return `${count} records found.`
  }

  static apiResponse = (message, data = undefined) => {
    return {
      success: true,
      message,
      data
    }
  }
}

export default BaseController
