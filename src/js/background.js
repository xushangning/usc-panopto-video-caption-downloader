chrome.runtime.onMessage.addListener((request, _sender, sendResponse) => {
    if (request.type === 'download') {
        chrome.downloads.download(
            request.options,
            () => sendResponse({result: "success"})
        );
    }
    return true;
});
