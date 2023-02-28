import SegmentDAO from '../daos/segment.dao'

class SegmentService {
  static async createSegment (newSegmentDto) {
    const newSegment = await SegmentDAO.insert(newSegmentDto)

    return newSegment
  }

  static async getSegments (filter, projection) {
    const foundSegments = await SegmentDAO.findAll(filter, projection)
    const count = Intl.NumberFormat('en-US').format(foundSegments.length)

    return { count, segments: foundSegments }
  }

  static async getSegment (segmentId) {
    const foundSegment = await SegmentDAO.findById(segmentId)

    return foundSegment
  }

  static async updateSegment (segmentId, updateSegmentDto) {
    const updateSegment = await SegmentDAO.update(segmentId, updateSegmentDto)

    return updateSegment
  }

  static async deleteSegment (segmentId) {
    const deletedSegment = await SegmentDAO.remove(segmentId)

    return deletedSegment
  }
}

export default SegmentService
