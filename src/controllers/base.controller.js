class BaseController {
  getMsgFromCount(count) {
    if (parseInt(count) === 1) return `${count} record found.`;
    return `${count} records found.`;
  }

  apiResponse = (message, data = undefined) => {
    return {
      success: true,
      message,
      data,
    };
  };
}

export default BaseController;
