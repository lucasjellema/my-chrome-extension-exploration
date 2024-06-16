# Exploration of Chrome Extensions

This document will help you take your first steps with Chrome Extensions. It will provide instructions for creating, editing, inspecting and installing some simple Chrome Extensions that will help you get an an understanding of how extensions are createdm, what they can do and how they are developed and confiured.

You will find supporting details on Chrome Extensipn Development in [this slide deck](https://github.com/lucasjellema/presentations/raw/master/2024/CodeCafe-ChromeExtensionDevelopment.pptx) - prepared for the June 2024 Conclusion Code Cafe.

## First Chrome Browser Extension - Add a button in every web page

The first extension we will discuss is not incredubly useful. But it does show some important aspects of the browser extensions. Like how to create one (albeit the simplest one possible) and like how an extension can directly manipulate any page loaded in the browser. In this case in a silly way, but in any meaningful you want it to as well.  

Create a new folder. You can give it any name you like. I called it `add-button-extension`.

In this folder, create a file called `manifest.json`. This name needs to be spelled exactly right.

Add the following content to this file:
```
{
  "manifest_version": 3,
  "name": "Add button extension",
  "version": "1.0",
  "permissions": [
    "activeTab",
    "scripting"
  ],
  "content_scripts": [
    {
      "matches": ["<all_urls>"],
      "js": ["content.js"]
    }
  ]
}
```

This is the configuration of a new extension. It is called *Add button extension*. It needs permission to access the *activeTab* and to execute *scripting*. It executes the code in the file `content.js`, and it will execute for every page (every url).

Next, create the file `content.js` in the same folder. Add the following content to this file:
```
const body = document.querySelector("body");
body.innerHTML = '<button id="add-button">My Big Fat Button</button>'+body.innerHTML;
``` 
This code will add a `button` element in the `body` of the page loaded in the active browser tab. The button has a label *My Big Fat Button* - and nothing happens when it is pressed.

To add this extension in your browser, start Google Chrome. Type in the address bar: `chrome://extensions`. 

Click on the button *Load unpacked*.
![](images/load-unpacked.png)

In the file dialog that appears, select the folder that contains the extension files. Click on *Select Folder*. 

The extension will be added to your browser:
![](images/extension-added.png)

Now open any web page - for example a LinkedIn page, nu.nl, Google.com or Outlook Web Client.   

![](images/mybigfatbutton.png)

## Extension #2




## Resources

Accessing a page variable in Chrome Extension - read a variable in page and send its value to be used in content.js 
https://andreacassani.com/blog/access-page-variable-chrome-extension (included injecting script in page )

How to write and install your own Chrome extension
https://www.xda-developers.com/how-write-install-own-chrome-extension/

Implement custom context menu options
https://developer.chrome.com/docs/extensions/develop/ui/context-menu
and samples: basic https://github.com/GoogleChrome/chrome-extensions-samples/tree/main/api-samples/contextMenus/basic and locales: https://github.com/GoogleChrome/chrome-extensions-samples/tree/main/api-samples/contextMenus/global_context_search 

Chrome Extension Samples - [GitHub Repo](https://github.com/GoogleChrome/chrome-extensions-samples/blob/main/README.md)

Decode Chrome Extensions - Unveiling the Extensions: A Guide to Extracting Chrome Extension Source Code. - https://medium.com/@suriyakumar.vijayanayagam/unveiling-the-extensions-a-guide-to-extracting-chrome-extension-source-code-33e8f6956b43


Tutorial: Reading Time
https://github.com/GoogleChrome/chrome-extensions-samples/blob/main/functional-samples/tutorial.reading-time