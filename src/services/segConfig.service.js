/* eslint-disable camelcase */
import SegConfigDAO from '../daos/segConfig.dao.js'
import ValidationError from '../errors/ValidationError.js'

class SegConfigService {
  static createConfig = async (dto) => {
    const { tenantId, segmentId, min_net_pay, max_net_pay } = dto

    // ! Validating net pay range
    const isValid = await this.#validatePayRange(
      tenantId,
      segmentId,
      min_net_pay,
      max_net_pay
    )
    if (!isValid) {
      throw new ValidationError('Overlap or gap found in net pay range.')
    }

    const newSegConfig = await SegConfigDAO.insert(dto)

    return newSegConfig
  }

  static async getConfigs (tenantId) {
    const foundSegConfigs = await SegConfigDAO.find({ tenantId })
    const count = Intl.NumberFormat('en-US').format(foundSegConfigs.length)

    return { count, segConfigs: foundSegConfigs }
  }

  static async getConfig (segConfigId) {
    const foundSegConfig = await SegConfigDAO.findById(segConfigId)

    return foundSegConfig
  }

  static async updateConfig (segConfigId, dto) {
    const foundSegConfig = await SegConfigDAO.update(
      segConfigId,
      dto
    )
    foundSegConfig.set(dto)

    const triggers = ['min_net_pay', 'max_net_pay']

    const containsTrigger = triggers.some((trigger) =>
      Object.keys(dto).includes(trigger)
    )

    if (containsTrigger) {
      const { tenantId, segmentId, min_net_pay, max_net_pay } = foundSegConfig

      const isValid = this.#validatePayRange(
        tenantId,
        segmentId,
        min_net_pay,
        max_net_pay
      )
      if (isValid) {
        throw new ValidationError('Overlap or gap found in net pay range.')
      }
    }

    await foundSegConfig.save()

    return foundSegConfig
  }

  static async deleteConfig (segmentConfigId) {
    const deletedSegConfig = await SegConfigDAO.remove(segmentConfigId)

    return deletedSegConfig
  }

  static async #validatePayRange (tenantId, segmentId, min, max) {
    const current = [min, max]

    const foundDocs = await SegConfigDAO.findDocsByField(
      { tenantId, segment: segmentId },
      {},
      { min_net_pay: -1 }
    )

    function getMinMaxArray (docs) {
      const result = [current]

      for (const doc of docs) {
        result.push([doc._doc.min_net_pay, doc._doc.max_net_pay])
      }
      result.sort((a, b) => a[0] - b[0])

      return result
    }

    // * Find gaps or overlapping range.
    function findGaps (ranges) {
      const len = ranges.length
      let numOfBadRange = 0
      let end = ranges[0][1]

      for (let idx = 1; idx < len; idx++) {
        if (ranges[idx][0] !== end) {
          numOfBadRange += 1

          return [numOfBadRange, idx]
        } else {
          end = ranges[idx][1]
        }
      }

      return [numOfBadRange, null]
    }

    const [badRange] = findGaps(getMinMaxArray(foundDocs))

    return !!badRange
  }
}

export default SegConfigService
