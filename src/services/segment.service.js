import SegmentDAO from '../daos/segment.dao.js'

class SegmentService {
  static async createSegment (dto) {
    const newSegment = await SegmentDAO.insert(dto)

    return newSegment
  }

  static async getSegments (filter) {
    const foundSegments = await SegmentDAO.find(filter)
    const count = Intl.NumberFormat('en-US').format(foundSegments.length)

    return { count, segments: foundSegments }
  }

  static async getSegment (segmentId) {
    const foundSegment = await SegmentDAO.findById(segmentId)

    return foundSegment
  }

  static async updateSegment (segmentId, dto) {
    const updateSegment = await SegmentDAO.update(segmentId, dto)

    return updateSegment
  }

  static async deleteSegment (segmentId) {
    const deletedSegment = await SegmentDAO.remove(segmentId)

    return deletedSegment
  }
}

export default SegmentService
