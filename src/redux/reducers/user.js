import { SET_A2HS } from '../types'

const initialState = { a2hs: { accepted: null, prompted: null } }

// ! redux actions / payload granularity
//
// * key : action relation
// redux docs advice against necessarily making store keys 1:1 with actions,
// saying that one action can update several keys if needed.
// I had the opposite case: of having several actions updating one key.
// That's when I wanted all 'form' values, errors etc to sit together, while they were updated by several different events:
// the initial build out of configuration, the user population, the location, the address, validations.
// The next lines are concerned with such cases, where multiple different events update one store key.
//
// Since a redux reducer must return a modified clone of the entire key content,
// whoever forms that key object needs to know its previous content in its entirety.
// It's either the calling function forming the entire key or the reducer here.
// Unless the calling function anyway uses a useSelector, (and even then),
// it's not nice to require it to append something it doesn't deal with to make this technical requirement.
// It's the job of the reducer, that unlike the calling function, has the entire key content ('state').
// The "price" is that any event dispatched by the calling function needs to have its own action,
// which in redux means modifying 3,498 places...
// But this is of course good for more granular audit trail (which means more granular blame, which is an important benefit of redux).
// I started with 'SET_FORM', progressed with SET_FORM_VALUES, but that wasn't good enough either, as it didn't describe
// the event. Today I would probably call it: 'SET_LOCATION.
//
// * payload granularity - key child level
// Even when there are multiple actions updating one single key, it's better if each action doesn't go any deeper than
// the key's child.
// In such cases, all of the data pertaining to one single event should be grouped under one single object (e.g. 'a2hs' here),
// senabling to add more pieces of data pertaining to that event later on if needed
// w/o the need to change anything else other than adding the new data in the calling function.
// For that purpose, the object in its entirety should be the payload (here: 'a2hs') rather than its properties,
// so that the reducer doesn't know what's inside.
//
// * payload granularity - deeper levels
// The above is not possible when the update is deeper than a key's child.
// Such was the case with SET_FORM_VALUES.
// That means letting the reducer know the structure of the content, which is bug-prone and not future friendly.
// A more uniform solution for deeper updates (that would also work for the shallow ones) would be to use
// Immer in the reducers. Immer would allow making that deep "update" w/o having to repeat interim key names,
// and would maintain redcuers' blissful ignorance.
//
export default (state = initialState, action) => {
  const { type, a2hs } = action
  switch (type) {
    case SET_A2HS:
      return {
        ...state,
        a2hs,
      }
    default:
      return state
  }
}
