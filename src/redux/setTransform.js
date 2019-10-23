// setTransform was created to convert yup's Sets into arrays and back with redux persisting and rehydration
// It's currently not needed since I'm not generating any schema so there's nothing to persist
// I'm keeping it though as an example for a setTransform function should I neetd one later on.
import { createTransform } from 'redux-persist'
import { produce } from 'immer'
import { empty } from '../../src/components/utility/empty'

// Required since the coins list is held in a 'Set' which, if not transformed, will be
// persisted as an empty array (since the redux-persist cache which is localStorage doesn't support Sets)
const setTransform = createTransform(
  // transform state on its way to being serialized and persisted.
  (inboundState, key) => {
    if (empty(inboundState.schema)) return inboundState

    return produce(inboundState, draft => {
      const fields = draft.schema.fields
      const { quote, base } = fields
      quote._whitelist.list = [...quote._whitelist.list]
      base._whitelist.list = [...base._whitelist.list]
    })
  },
  // transform state being rehydrated
  (outboundState, key) => {
    return produce(outboundState, draft => {
      const fields = draft.schema.fields
      const { quote, base } = fields
      quote._whitelist.list = new Set(quote._whitelist.list)
      base._whitelist.list = new Set(base._whitelist.list)
    })
  },
  // define which reducers this transform gets called for.
  { whitelist: ['form'] }
)

export default setTransform
