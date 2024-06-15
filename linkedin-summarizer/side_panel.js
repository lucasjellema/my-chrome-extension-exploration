chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message.type === 'linkedInInfo') {
    const contentDiv = document.getElementById('content');

profile = message.data
    //      data":{"name":"Charbel Bechara","currentRole":"Helping customers with their cloud journey","currentCompany":"Nutanix                                                                                                                                              NDU","about":"Currently I am working as a Business Development Manager at Gartner and my role is to acquire and help new customers in achieving their business initiatives. My duties include but are not limited to the following:\n\n- Meeting with CxOs, VPs or Directors and understanding their priorities\n- Agreeing on best ways and solution to address priorities\n- Alig
    document.getElementById('name').innerHTML = 'Name: ' + JSON.stringify(message.data.name);
    document.getElementById('role').innerHTML = 'Role:' + JSON.stringify(message.data.currentRole);
    document.getElementById('company').innerHTML = 'Company: ' + JSON.stringify(message.data.currentCompany);
    contentDiv.textContent = JSON.stringify(message);
  }
});

let profile

document.getElementById('saveButton').addEventListener('click', async () => {
  const fileContent = JSON.stringify(profile);
  if (fileContent) {
    // Use the File System Access API to save the file
    try {
      
      const handle = await getNewFileHandle(profile.name);

      // Create a writable stream
      const writableStream = await handle.createWritable();

      // Write the content to the file
      await writableStream.write(fileContent);

      // Close the file and write the contents to disk.
      await writableStream.close();

      alert('File saved successfully!');
    } catch (err) {
      console.error('Error saving file:', err);
      alert('Failed to save file.');
    }
  } else {
    alert('Please enter some content to save.');
  }
});


async function getNewFileHandle(candidate) {
  const options = {
    suggestedName: `${candidate}-candidate_profile.json`,
    types: [
      {
        description: 'Text Files',
        accept: { 'applicaton/json  ': ['.json'] }
      }
    ]

  };
  const handle = await window.showSaveFilePicker(options);
  return handle;
}