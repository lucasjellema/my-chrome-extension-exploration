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

const getProfile = () => {

  console.log("Send Profile Details")

  const profile = {}
  addName(profile)
  addImage(profile)
  addContact(profile)
  addCurrentRole(profile)
  addCurrentCompany(profile)
  addAbout(profile)
  addExperience(profile)
  return profile
  //  chrome.runtime.sendMessage({ type: 'linkedinProfile', data: profile });
}

const addName = (profile) => {
  try {
    const nameElement = document.querySelector('div span a h1');
    if (nameElement) {
      const name = nameElement.textContent
      console.log("Name found:", name);
      profile.name = name
      return
    }

    const element = document.getElementsByClassName('text-heading-xlarge')[0]
    if (!element) return
    const name = element.textContent
    profile.name = name
  } catch (error) {
    console.error("AddName" + error)
  }
}

const addImage = (profile) => {
  try {
    //  const imgElement = document.querySelector('div.pv-top-card__non-self-photo-wrapper button[aria-label="open profile picture"] img');
    const imgElement = document.querySelector('div button[aria-label="open profile picture"] img');

    if (imgElement) {
      console.log("Image found:", imgElement);
    } else {
      console.log("Image not found.");
    }

    if (!imgElement) return
    const image = imgElement.src
    profile.image = image
  } catch (error) {

  }
}

const addContact = (profile) => {
  try {
    const element = document.getElementsByClassName('pv-contact-info__header')[0]
    if (!element) return
    const contact = element.textContent
    profile.contact = contact
  } catch (error) {

  }
}



const addCurrentRole = (profile) => {
  try {
    const element = document.getElementsByClassName('text-body-medium')[0]
    if (!element) return
    const role = element.textContent.replace(/\n/g, '').trim()

    profile.currentRole = role
  } catch (error) {

  }
}

const addCurrentCompany = (profile) => {
  try {
    const element = document.getElementsByClassName('pv-text-details__right-panel')[0]
    if (!element) return
    const company = element.textContent.replace(/\n/g, '').trim()
    profile.currentCompany = company

    const button = document.querySelector('button[aria-label^="Current company:"]');
    const companyLogo = button.querySelector('img');
    if (companyLogo) {
      console.log("Company logo found:", companyLogo.src);
      const imageUrl = companyLogo.src;
      profile.currentCompanyLogo = imageUrl
    }
  }
  catch (error) {

  }
}

const addAbout = (profile) => {
  try {
    let element = document.querySelectorAll('[data-generated-suggestion-target^="urn:li:fsu_profileActionDelegate"]');
    if (!element) return
    const about = element[1].innerText	//  textContent.replace(/\n/g, '').trim()
    profile.about = about
  } catch (error) {

  }
}


const findFirstElementUnderAncestor = (ancestor, selector) => {
  while (ancestor) {
    const ul = ancestor.querySelector(selector); // Depth-first search for UL within the ancestor
    if (ul) {
      console.log("Element found:", ul);
      return ul;
    }
    ancestor = ancestor.parentElement; // Move up the tree
  }
  return null;
}

const findDirectChildren = (parentElement, childElementType, maxChildren = -1) => {
  const divs = parentElement.querySelectorAll(`:scope > ${childElementType}`); // Selects only direct children
  if (divs.length > 0) {
    const max = maxChildren == -1 ? 9999 : maxChildren
    return divs.slice(0, max);
  }
  else {
    return [];
  }
}

function findDirectDivChildrenOfFirstDiv(parentElement) {
  // Find all direct <div> children of the parent
  const firstDiv = parentElement.querySelector(':scope > div');

  if (!firstDiv) {
    console.log("No direct <div> child found.");
    return [];
  }

  // Find all direct <div> children of the first <div> child
  return firstDiv.querySelectorAll(':scope > div');
}

const addExperience = (profile) => {
  profile.experience = []
  try {
    const span = [...document.querySelectorAll('span')].find(el => el.textContent.trim() === "Experience");
    try {
      let ulExperience = findFirstElementUnderAncestor(span, 'ul');
      //      console.log("ul with experience ", ulExperience);

      let liExperiences = ulExperience.querySelectorAll(':scope > li');
      if (liExperiences && liExperiences.length > 0) {

        for (let i = 0; i < liExperiences.length; i++) {
          // console.log("liExperiences[i] ", liExperiences[i]);
          const newExperience = {}
          const experienceElement = liExperiences[i]
          try {

            const divChildren = findDirectDivChildrenOfFirstDiv(experienceElement);

            //   console.log("divs ", divChildren);
            //             const experienceDivs = findDirectChildren(experienceElement.querySelector('div'), 'div',2)
            // console.log("experienceDivs ", experienceDivs);

            const experienceCompanyUrl = divChildren[0].querySelector('a').href
            // console.log("experienceCompanyUrl ", experienceCompanyUrl);
            newExperience.companyUrl = experienceCompanyUrl

            const experienceCompanyImageUrl = divChildren[0].querySelector('a').querySelector('img')?.src
            if (experienceCompanyImageUrl) {

              newExperience.companyImageUrl = experienceCompanyImageUrl
            }
            const experienceRole = divChildren[1].querySelector('span').textContent
            //console.log("experienceRole ", experienceRole);
            newExperience.role = experienceRole


            const experienceDetails = divChildren[1].querySelector(':scope > div').querySelector(':scope > div').querySelectorAll(' :scope > span')
            //console.log("experienceDetails ", experienceDetails);

            // I expect two or three SPAN elements. The first is the company, the second is the period and the third is the location
            // each span contains two spans. I do not know the difference between the two. They both contain the relevant text
            if (experienceDetails && experienceDetails.length > 0) {

              const experienceCompany = experienceDetails[0].querySelector('span').textContent
              //console.log("experienceCompany ", experienceCompany);
              newExperience.company = experienceCompany

              const experiencePeriod = experienceDetails[1].querySelector('span').textContent
              //console.log("experiencePeriod ", experiencePeriod);
              newExperience.period = experiencePeriod

              if (experienceDetails.length > 2) {
                const experienceLocation = experienceDetails[2].querySelector('span').textContent
                //console.log("experienceLocation ", experienceLocation);
                newExperience.location = experienceLocation
              }
            }
            console.log("newExperience ", newExperience);
          } catch (error) {
            console.error("AddExperience" + error)
          }
          profile.experience.push(newExperience)
        }
      }
      profile.experience = experience
    } catch (error) { console.error("AddExperience" + error) }
  } catch (error) { console.error("AddExperience" + error) }
}


