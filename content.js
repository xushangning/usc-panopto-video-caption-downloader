'use strict';

let downloadCaptionsButton = document.getElementsByClassName('action-buttons')[0]
    .appendChild(document.createElement('li'))
    .appendChild(document.createElement('button'));
downloadCaptionsButton.textContent = 'Download captions';

downloadCaptionsButton.addEventListener('click', async (event) => {
    // ALL content in the <body> is wrapped in a <form>, likely designed to
    // thwart injection of <button>... Call preventDefault to prevent form
    // submission.
    event.preventDefault();

    const ENDPOINT = 'https://uscviterbi.hosted.panopto.com/Panopto/Pages/Viewer/DeliveryInfo.aspx';
    const videoRow = document.querySelector('#detailsTable tr');
    let postBody = new URLSearchParams([
        ['getCaptions', 'true'],
        ['language', '0'],
        ['responseType', 'json']
    ]);

    postBody.set('deliveryId', videoRow.id);
    let resp = await fetch(new Request(ENDPOINT, {
        method: 'POST',
        body: postBody,
    }));
    let captions = await resp.json();

    let captionArray = [];
    for (const line of captions) {
        captionArray.push(line.Caption + '\n');
    }

    let captionUrl = URL.createObjectURL(new Blob(captionArray, {type: 'text/plain'}));
    chrome.runtime.sendMessage(
        {
            type: 'download',
            options: {
                url: captionUrl,
                filename: 'abcd.txt'
            }
        },
        () => URL.revokeObjectURL(captionUrl)
    );
});
