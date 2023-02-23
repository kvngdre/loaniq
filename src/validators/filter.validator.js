import Joi from 'joi'
import Segment from '../models/segmentModel'
import State from '../models/stateModel'

async function getSegments () {
  return await Segment.find({ active: true }).select('code')
}

async function getCountryStates () {
  return await State.find()
}

export default async function (filters) {
  if (filters.segment) var segments = await getSegments()
  if (filters.state) var countryStates = await getCountryStates()

  function validateSegment (value, helpers) {
    const foundSegment = segments.find((segment) => segment.code === value)
    if (!foundSegment) return helpers.message('Segment is not supported')

    return foundSegment._id
  }

  function validateCountryState (value, helpers) {
    const foundState = countryStates.find(
      (state) => state.name.toLowerCase() === value.toLowerCase()
    )
    if (!foundState) return helpers.message('State is incorrect')

    return foundState.name
  }

  const schema = Joi.object({
    name: Joi.string().label('Name').optional().allow(''),
    segment: Joi.string()
      .label('Segment')
      .optional()
      .allow('')
      .custom(validateSegment),
    state: Joi.string()
      .label('State')
      .optional()
      .allow('')
      .custom(validateCountryState),
    minAge: Joi.number().label('Minimum age').min(0).optional().allow(''),
    maxAge: Joi.number().label('Maximum age').min(0).optional().allow(''),
    minBal: Joi.number()
      .label('Minimum balance')
      .min(0)
      .optional()
      .allow(''),
    maxBal: Joi.number()
      .label('Maximum balance')
      .min(0)
      .optional()
      .allow(''),
    minPay: Joi.number()
      .label('Minimum net pay')
      .min(0)
      .optional()
      .allow(''),
    maxPay: Joi.number()
      .label('Maximum net pay')
      .min(0)
      .optional()
      .allow('')
  })

  return schema.validate(filters)
};
