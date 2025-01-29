chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  console.log("Received message:", message);
  if (message.type === 'linkedInInfoRequest') {
      console.log("LinkedIn Info request received: ");
      let profile = getProfile()
      sendResponse({ status: 'success', data: profile, linkedInUrl: window.location.href });
    // }
    // else {
    //   sendResponse({ status: 'error', message });
    // }
  }
});

console.log('content.js loaded - linkedin-summarizer extension');

const getProfile=()=>{        
  
  console.log("Send Profile Details")

  const profile = {}
  addName(profile)
  addContact(profile)
  addCurrentRole(profile)
  addCurrentCompany(profile)
  addAbout(profile)
  addExperience(profile)
  return profile
//  chrome.runtime.sendMessage({ type: 'linkedinProfile', data: profile });
}

const addName = (profile) => {
    const element = document.getElementsByClassName('text-heading-xlarge')[0]
    if (!element) return
    const name = element.textContent
    profile.name = name
}

const addContact = (profile) => {
    const element = document.getElementsByClassName('pv-contact-info__header')[0]
    if (!element) return
    const contact = element.textContent
    profile.contact = contact
}



const addCurrentRole = (profile) => {
    const element = document.getElementsByClassName('text-body-medium')[0]
    if (!element) return
    const role = element.textContent.replace(/\n/g, '').trim()

    profile.currentRole = role
}

const addCurrentCompany = (profile) => {
    const element = document.getElementsByClassName('pv-text-details__right-panel')[0]
    if (!element) return
    const company = element.textContent.replace(/\n/g, '').trim()
    profile.currentCompany = company
}

const addAbout = (profile) => {
    let element = document.querySelectorAll('[data-generated-suggestion-target^="urn:li:fsu_profileActionDelegate"]');
    if (!element) return
    const about = element[1].innerText	//  textContent.replace(/\n/g, '').trim()
    profile.about = about
}


const addExperience = (profile) => {
    let element = document.querySelectorAll('[data-view-name="profile-component-entity"]');
    if (!element) return
    // loop over these elements
    const experience = []
    for (let i = 0; i < element.length; i++) {

        const nodelist = element[i].querySelectorAll('.display-flex.flex-column.full-width')

        for (const child of nodelist) {


            // then find the children div and span and span for role, where and when
            if (child?.children?.length === 3) {
                const [firstChild, secondChild, thirdChild] = child.children;

                // Check if the first child is a div and the next two children are spans
                if (firstChild.tagName.toLowerCase() === 'div' &&
                    secondChild.tagName.toLowerCase() === 'span' &&
                    thirdChild.tagName.toLowerCase() === 'span') {
                    console.log('The element has the correct structure.');

                    console.log(`experience found`, firstChild.innerText, secondChild.innerText, thirdChild.innerText)
                    const newExperience = {}

                    newExperience.role = firstChild.innerText
                    newExperience.where = secondChild.innerText
                    newExperience.when = thirdChild.innerText

                    experience.push(newExperience)


                } else {
                    console.log('The element does not have the correct structure.');
                }
            }
        }
    }
    profile.experience = experience
}


const observer = new MutationObserver((mutations) => {
    mutations.forEach((mutation) => {
        if (mutation.addedNodes.length || mutation.removedNodes.length) {
            addButtonToSaveProfile()
        }
    });
});

// Start observing the document body for changes
//observer.observe(document.body, { childList: true, subtree: true });