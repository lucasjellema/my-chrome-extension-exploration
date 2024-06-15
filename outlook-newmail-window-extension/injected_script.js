console.log('Outlook Extension Injected script loaded');

// conclusion: Outlook Mail does not itself use the Graph API
// the token I can read from session storage is not the authentication token required for Graph API;l I am not sure yet what can be invoked or done using that token 


// a call to fetch the contents of a folder (this is not a Graph API call):
// https://outlook.office.com/owa/service.svc?action=FindItem&app=Mail&n=46
// https://stackoverflow.com/questions/60852539/documentation-for-the-office-365-json-interface-for-web-applications

// calling https://outlook.office.com/owa/service.svc does not seem supported/allowed and I also could not get it to work


// async function getAccessToken() {
    
//         let token = sessionStorage.getItem('LokiAuthToken');
//         if (!token) {
//             console.log('token not found');
//             return;
//         }
//         console.log("token found")
//         return token
// }

// async function callOwaService() {
//     const token = await getAccessToken();
//     fetch('https://outlook.office.com/owa/service.svc', {
//       method: 'GET',
//       headers: {
//         'Authorization': `Bearer ${token}`,
//         'Content-Type': 'application/json'
//       }
//     })
//     .then(response => {
//       if (!response.ok) {
//         throw new Error('Network response was not ok');
//       }
//       return response.json();
//     })
//     .then(data => {
//       console.log('API response:', data);
//     })
//     .catch(error => {
//       console.error('Error calling API:', error);
//     });
//   }


// callOwaService()



// if (window.trustedTypes && trustedTypes.createPolicy) {
//     // Create a policy named 'default'
//     trustedTypes.createPolicy('default', {
//         createScriptURL: (url) => url,
//         createHTML: (html) => html,
//         createScript: (script) => script
//     });
// }


// const trustedScriptURL = trustedTypes.defaultPolicy.createScriptURL('https://outlook.office.com/mail/owa.worker.js');
// // const script = document.createElement('script');
// // script.src = trustedScriptURL;

// // // Optionally, set other attributes or event listeners
// // script.onload = () => console.log('Script loaded');
// // script.onerror = (err) => console.error('Error loading script:', err);

// // document.head.appendChild(script);



// // Initialize the worker
// const worker = new Worker(trustedScriptURL);
// console.log('Worker initialized', worker);
// // Send a message to fetch mail details
// worker.postMessage({
//     type: 'FETCH_MAIL_DETAILS',
//     payload: { itemId: 'some-item-id' }
// });

// // Listen for messages from the worker
// worker.onmessage = function(event) {

//     console.log('Worker message received:', event.data);
//     const message = event.data;
//     if (message.type === 'MAIL_DETAILS') {
//         console.log('Mail details:', message.payload);
//     } else if (message.type === 'ERROR') {
//         console.error('Error:', message.payload);
//     }
// };



// async function getEventDetails(accessToken, eventId) {
//     const url = `https://graph.microsoft.com/v1.0/me/events/${eventId}`;
//     const response = await fetch(url, {
//         method: 'GET',
//         headers: {
//             'Authorization': `Bearer ${accessToken}`,
//             'Content-Type': 'application/json'
//         }
//     });

//     if (response.ok) {
//         const eventDetails = await response.json();
//         console.log('Event Details:', eventDetails);
//     } else {
//         console.error('Failed to retrieve event details:', response.statusText);
//     }
// }

// async function getMailItemDetails(itemId, accessToken) {
//     try {
//         // const item = Office.context.mailbox.item;
//         // const itemId = item.itemId;

// //        const accessToken = await getAccessToken();
//         const graphResponse = await fetch(`https://graph.microsoft.com/v1.0/me/messages/${itemId}`, {
//             headers: {
//                 Authorization: `Bearer ${accessToken}`
//             }
//         });

//         if (!graphResponse.ok) {
//             throw new Error('Failed to fetch mail item details');
//         }

//         const mailItem = await graphResponse.json();
//         console.log(mailItem);
//     } catch (error) {
//         console.error('Error fetching mail item details:', error);
//     }
// }

// async function getUserData() {
//     try {
// // session storage, key == LokiAuthToken
//         let token = sessionStorage.getItem('LokiAuthToken');
//         if (!token) {
//             console.log('token not found');
//             return;
//         }
//         console.log("token found")
//         const mailItemId= "AAMkADRlMDcxZTM5LTFiMDEtNDdmOC1hZTVmLWQyNGU4NzIyZjJkNgBGAAAAAABywpyGPjenTqLKwJvlGtiQBwA/oeYzLHPrQ5H3KeTtt87ZAAAADs/7AAD1oin7cJ/FT5MuN9cCLOsZAAWpSJI1AAA="
// getMailItemDetails(mailItemId, token);

//   //      console.log("user token encoded",userTokenEncoded);
//         // let userToken = jwt_decode(userTokenEncoded); // Using the https://www.npmjs.com/package/jwt-decode library.
//         // console.log(userToken.name); // user name
//         // console.log(userToken.preferred_username); // email
//         // console.log(userToken.oid); // user id     
//     }
//     catch (exception) {
//         console.log('exception while getting token',exception);
//         if (exception.code === 13003) {
//             // SSO is not supported for domain user accounts, only
//             // Microsoft 365 Education or work account, or a Microsoft account.
//         } else {
//             // Handle error
//         }
//     }
// }

//console.log(`outlook extension - I will try to get a token`)
//setTimeout(() =>   getUserData(), 1000);