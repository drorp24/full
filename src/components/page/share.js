import { temporarilySetValue } from '../../redux/actions'

const share = dispatch => () => {
  const shareData = {
    title: 'Cryptonite',
    text: 'Get the best crypto deals',
    url: 'https://drorpoliakfull.herokuapp.com',
  }

  if (navigator.share) {
    navigator
      .share(shareData)
      .then(() => {
        temporarilySetValue({
          type: 'SET_DEVICE',
          key: 'appShared',
          value: true,
          time: 5,
          toggle: false,
        })(dispatch)
      })
      .catch(() => {
        temporarilySetValue({
          type: 'SET_DEVICE',
          key: 'appShared',
          value: false,
          time: 5,
          toggle: false,
        })(dispatch)
      })
  } else {
    temporarilySetValue({
      type: 'SET_DEVICE',
      key: 'appShared',
      value: false,
      time: 5,
      toggle: false,
    })(dispatch)
  }
}

export default share
