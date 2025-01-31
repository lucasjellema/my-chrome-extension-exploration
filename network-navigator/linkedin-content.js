let companyPage, personPage

const pageTypeChecker = () => {

  // check if the current page is from a location which has /company/ in the url
  if (window.location.href.includes('/company/')) {
    // if it is, add the content script
    console.log('SHOW COMPANY MENU ITEM');
    companyPage = true
  } else {
    console.log('DO NOT SHOW COMPANY MENU ITEM');
    companyPage = false
  }
  if (window.location.href.includes('/in/')) {
    // if it is, add the content script
    console.log('SHOW PERSON MENU ITEM');
    personPage = true
  } else {
    console.log('DO NOT SHOW PERSON MENU ITEM');
    personPage =  false
  }
  chrome.runtime.sendMessage({ action: "togglePageType", personPage: personPage, companyPage: companyPage });
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
  if (message.type === 'linkedInInfoRequest') {
    console.log("LinkedIn Info request received: ");
    let profile = getProfile()
    profile.type = personPage ? 'person' : 'company'
    console.log("Profile:", profile)
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
  addCurrentEducation(profile)
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
    const button = document.querySelector('button[aria-label^="Current company:"]');
    if (button) {
      const companyLogo = button.querySelector('img');
      if (companyLogo) {
        console.log("Company logo found:", companyLogo.src);
        const imageUrl = companyLogo.src;
        profile.currentCompanyLogo = imageUrl
      }
      const company = button.querySelector('span');
      if (company) {
        console.log("Company found:", company.textContent);
        profile.currentCompany = company.textContent.replace(/\n/g, '').trim()
      }
    }
  }
  catch (error) {

  }
}

const addCurrentEducation = (profile) => {
  try {
    const button = document.querySelector('button[aria-label^="Education:"]');
    if (button) {
      const educationLogo = button.querySelector('img');
      if (educationLogo) {
        console.log("education logo found:", educationLogo.src);
        const imageUrl = educationLogo.src;
        profile.latestEducationLogo = imageUrl
      }
      const education = button.querySelector('span');
      if (education) {
        console.log("Education found:", education.textContent);
        profile.latestEducation = education.textContent.replace(/\n/g, '').trim()
      }
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
          console.log("liExperiences[i] ", i, liExperiences[i]);
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

            // if there is a UL element inside divChildren[1] then this is a list of multiple experiences within the same company and it needs to be treated a little bit differently
            const secondDivChild = divChildren[1].querySelectorAll(':scope > div')[1]
            if (secondDivChild) {
              const multiExperienceUL = secondDivChild.querySelector(':scope > ul')
              const aUnderMultiExperienceUL = multiExperienceUL.querySelector('a')
              if (aUnderMultiExperienceUL && !aUnderMultiExperienceUL.href.includes('overlay')) {
                console.log('multiple exp in one company')
                console.log(aUnderMultiExperienceUL)
                const firstDivChild = divChildren[1].querySelectorAll(':scope > div')[0]
                console.log(firstDivChild)
                // first span under the first div
                const firstSpan = firstDivChild.querySelector('span')
                console.log("company " + firstSpan.textContent)
                newExperience.company = firstSpan.textContent

                const experienceList = multiExperienceUL.querySelectorAll(':scope > li')
                console.log(experienceList)
                // loop over experienceList
                for (let j = 0; j < experienceList.length; j++) {
                  console.log("# multi exp" + j)
                  const thisExperience = { ...newExperience }
                  const experienceElement = experienceList[j]
                  console.log(experienceElement)
                  const divs = experienceElement.querySelector(':scope > div').querySelectorAll(':scope > div')[1].querySelectorAll(':scope > div')
                  console.log("divs:" + divs)


                  // the first DIV has role and period - inside an A element
                  const a = divs[0].querySelector('a')
                  // inside this A element , there is a DIV and one or more SPAN elements; 
                  // the DIV contains a span with the role, the direct SPAN childlen contains the period, location, involvement and other details

                  const roleSpan = a.querySelector(':scope > div').querySelector('span')
                  console.log('role job:' + roleSpan.textContent)
                  thisExperience.role = roleSpan.textContent


                  const spans = a.querySelectorAll(':scope > span')
                  console.log(spans)
                  for (let k = 0; k < spans.length; k++) {
                    const span = spans[k].querySelector(':scope > span') // find first child span of span
                    console.log(span)
                    const spanText = span.textContent
                    console.log(spanText)
                    if (spanText.includes('·')) {
                      const spanTextSplit = spanText.split('·')
                      thisExperience.period = spanTextSplit[0].trim()
                      console.log('period job:' + span.textContent)
                      if (spanTextSplit.length > 1) thisExperience.duration = spanTextSplit[1].trim()
                    }
                    // TODO process the other spans - for example extract location from span that contains a comma?
                  }


                  // the second div contains the further description in the first span under the div - deeply nested
                  if (divs.length > 1) {
                    console.log('try to find about job:' + divs[1])

                    const span = divs[1].querySelector('span')
                    console.log('about job:' + span?.textContent)
                    thisExperience.about = span?.textContent
                  }
                  profile.experience.push(thisExperience);



                }

                continue; // ready with this DIV
                // find div : div : divs

                //   const divChildren = findDirectDivChildrenOfFirstDiv(experienceElement);
                //   const experienceRole = divChildren[1].querySelector('span').textContent 
              }


            }




            const experienceRole = divChildren[1].querySelector('span').textContent
            //console.log("experienceRole ", experienceRole);
            newExperience.role = experienceRole


            const experienceDetails = divChildren[1].querySelector(':scope > div').querySelector(':scope > div').querySelectorAll(' :scope > span')
            //console.log("experienceDetails ", experienceDetails);

            // I expect two or three SPAN elements. The first is the company, the second is the period and the third is the location
            // each span contains two spans. I do not know the difference between the two. They both contain the relevant text
            if (experienceDetails && experienceDetails.length > 0) {

              const experienceCompany = experienceDetails[0].querySelector('span').textContent.split('·')
              newExperience.company = experienceCompany[0].trim()
              if (experienceCompany.length > 1) newExperience.involvement = experienceCompany[1].trim()



              const experiencePeriod = experienceDetails[1].querySelector('span').textContent.split('·')
              newExperience.period = experiencePeriod[0].trim()
              if (experiencePeriod.length > 1) newExperience.duration = experiencePeriod[1].trim()


              if (experienceDetails.length > 2) {
                const experienceLocation = experienceDetails[2].querySelector('span').textContent.split('·')
                //console.log("experienceLocation ", experienceLocation);
                newExperience.location = experienceLocation[0].trim()
              }
            }
            console.log("newExperience ", newExperience);

          }
          catch (error) {
            console.error("AddExperience" + error)
          }

          profile.experience.push(newExperience)
        }
      }
      console.log("profile.experience ", profile.experience);
    } catch (error) { console.error("AddExperience" + error) }
  } catch (error) { console.error("AddExperience" + error) }
}


