const share = () =>
  new Promise((resolve, reject) => {
    console.log('share called ')

    const shareData = {
      title: 'Cryptonite',
      text: 'Get the best crypto deals',
      url: 'https://drorpoliakfull.herokuapp.com',
    }

    if (navigator.share) {
      navigator
        .share(shareData)
        .then(resolve)
        .catch(reject)
    } else {
      console.log('navigator.share is not supported')
    }
  })

export default share
