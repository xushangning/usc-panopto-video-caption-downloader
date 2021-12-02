'use strict';

import * as zip from '@zip.js/zip.js';

const downloadCaptionsButton = document.getElementsByClassName('action-buttons')[0]
    .appendChild(document.createElement('li'))
    .appendChild(document.createElement('button'));
downloadCaptionsButton.textContent = 'Download captions';

function isUuid(s) {
    return /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(s);
}

downloadCaptionsButton.addEventListener('click', async (event) => {
    // ALL content in the <body> is wrapped in a <form>, likely designed to
    // thwart injection of <button>... Call preventDefault to prevent form
    // submission.
    event.preventDefault();

    const ENDPOINT = 'https://uscviterbi.hosted.panopto.com/Panopto/Pages/Viewer/DeliveryInfo.aspx';
    const postBody = new URLSearchParams([
        ['getCaptions', 'true'],
        ['language', '0'],
        ['responseType', 'json']
    ]);
    const zipWriter = new zip.ZipWriter(new zip.BlobWriter('application/zip'));

    const videoRows = document.querySelector('#detailsTable').tBodies[0].rows;
    for (const row of videoRows) {
        // Skip placeholder rows.
        if (!isUuid(row.id)) {
            continue;
        }

        postBody.set('deliveryId', row.id);
        const resp = await fetch(new Request(ENDPOINT, {
            method: 'POST',
            body: postBody,
        }));
        const captionInfo = await resp.json();

        let captions = '';
        for (const c of captionInfo) {
            captions += c.Caption + '\n\n';
        }

        const title = row.querySelector('.detail-title').textContent.trim().replaceAll('/', '-');
        await zipWriter.add(title + '.txt', new zip.TextReader(captions));
    }

    const captionUrl = URL.createObjectURL(await zipWriter.close());
    const filename = document.getElementById('contentHeaderText').textContent + ' Captions.zip';
    chrome.runtime.sendMessage(
        {
            type: 'download',
            options: {
                url: captionUrl,
                filename: filename
            }
        },
        () => URL.revokeObjectURL(captionUrl)
    );
});
