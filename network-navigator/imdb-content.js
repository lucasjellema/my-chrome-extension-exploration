let namePage, titlePage

const pageTypeChecker = () => {

  if (window.location.href.includes('/name/')) {
    namePage = true
  } else {

    namePage = false
  }
  if (window.location.href.includes('/title/')) {
    titlePage = true
  } else {
    titlePage = false
  }
  chrome.runtime.sendMessage({ action: "togglePageType", contentExtension: "imdb", namePage: namePage, titlePage: titlePage });
}
let lastUrl = location.href;
pageTypeChecker()

const urlChangeObserver = new MutationObserver(() => {
  if (location.href !== lastUrl) {
    console.log("URL changed to:", location.href);
    lastUrl = location.href;
    pageTypeChecker()
    // Perform actions on URL change
  }
});

// Observe changes in the document body (for SPAs)
urlChangeObserver.observe(document.body, { childList: true, subtree: true });


chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  console.log("Received message:", message);
  if (message.type === 'imdbInfoRequest') {
    console.log("IMDB Info request received: ");
    let profile = getProfile()
    profile.type = titlePage ? 'title' : 'name'
    console.log("Profile:", profile)
    sendResponse({ status: 'success', data: profile, imdbUrl: window.location.href });
  }
});

console.log('imdb-content.js loaded - imdb extension');

const getProfile = () => {


  const profile = {}
  addName(profile)

  if (titlePage) {
    addType(profile)
    addRating(profile)
    addImage(profile)
    addPeriod(profile)
    addChipsAndAbout(profile)
    addCast(profile)

  }
  return profile
}

const addName = (profile) => {
  profile.name = document.querySelector('h1').textContent
}

const addType = (profile) => {
  const h1 = document.querySelector('h1')
  profile.type = "Movie"
  if (h1) {
    const nextSib = h1.nextElementSibling
    const nextSibLi = nextSib.querySelector('li')
    const type = nextSibLi.textContent
    if (type === 'TV Series') {
      profile.subtype = type
    } else {
      profile.subtype = "Movie"
    }
  }
}


const addPeriod = (profile) => {
  const h1 = document.querySelector('h1')
  if (h1) {
    const nextSib = h1.nextElementSibling

    if (profile.type === "Movie") {
      const nextSibLi = nextSib.querySelector('li:nth-of-type(1)')
      const period = nextSibLi.textContent
      if (period) {
        profile.period = period
      }

    } else {
      const nextSibLi = nextSib.querySelector('li:nth-of-type(2)')
      const period = nextSibLi.textContent
      if (period) {
        profile.period = period
      }
    }
  }
}
const addImage = (profile) => {
  const h1 = document.querySelector('h1')
  if (h1) {
    const grandparent = h1.parentElement.parentElement
    if (grandparent) {
      const nextElementSibling = grandparent.nextElementSibling
      if (nextElementSibling) {
        const img = nextElementSibling.querySelector('img')
        if (img) {
          profile.image = img.src
        }
      }
    }
  }
}

const addChipsAndAbout = (profile) => {
  let chipDiv = document.querySelector("div.ipc-chip-list");
  console.log('chipDiv', chipDiv)
  if (chipDiv) {
    const chips = chipDiv.querySelector('div:nth-of-type(2)').querySelectorAll('a');
    if (chips) {
      profile.chips = [...chips].map(chip => chip.textContent.trim());
    }
  }
  let plotP = chipDiv.nextElementSibling
  console.log('plotP', plotP)
  if (plotP) {
    profile.plot = plotP.querySelector('span:nth-of-type(2)').textContent.trim();
  }
}

const addCast = (profile) => {
  let castDiv = document.querySelector('section[data-testid="title-cast"]');
  console.log('castDiv', castDiv)
  if (castDiv) {
    const cast = castDiv.querySelector('div:nth-of-type(2)').querySelector('div:nth-of-type(2)').querySelectorAll(':scope > div');
    console.log('cast', cast)
    if (cast) {
      profile.cast = []
      for (let i = 0; i < cast.length; i++) {
        console.log('cast', cast[i])
        const character = {}
        const el = cast[i]
        const image = el.querySelector('img')
        if (image) {
          character.image = image.src
          character.name = image.alt
        }
        const el2 = el.querySelector('div:nth-of-type(2)')
        if (el2) {
          character.actorUrl = el2.querySelector('a')?.href
          character.actorName = el2.querySelector('a')?.textContent
          character.characterName = el2.querySelector('div')?.textContent // actuall the div contain a UL with LIs for every character played by the actor
          character.details = el2.querySelector('button:nth-of-type(2)')?.textContent
        }
        profile.cast.push(character)

      }

    }
  }

}


const addRating = (profile) => {
  let starIcon = document.querySelector("svg.ipc-icon--star");
  if (starIcon) {
    console.log('starIcon', starIcon)
    const ratingValue = starIcon.parentElement.nextElementSibling.textContent.trim();
    if (ratingValue) {
      profile.rating = ratingValue;
    }
  }
}