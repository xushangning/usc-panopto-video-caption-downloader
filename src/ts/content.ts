import * as zip from '@zip.js/zip.js';

const downloadCaptionsButton = document.getElementsByClassName('action-buttons')[0]
    .appendChild(document.createElement('li'))
    .appendChild(document.createElement('button'));
downloadCaptionsButton.textContent = 'Download captions';

function isUuid(s: string) {
    return /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(s);
}

function sentenceTerminates(s: string) {
    return s.endsWith('.') || s.endsWith('?') || s.endsWith('!');
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

    const videoTable = document.querySelector('#detailsTable');
    if (videoTable === null) {
        throw new Error('Videos not found in the web page.');
    }
    const videoRows = (videoTable as HTMLTableElement).tBodies[0].rows;
    let i = 0;
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
            captions += c.Caption + (sentenceTerminates(c.Caption) ? '\n\n' : ' ');
        }

        const title = row.querySelector('.detail-title');
        let basename = i.toString();
        if (title && title.textContent && title.textContent.trim().length) {
            // Reformat dates to remove slashes.
            basename = title.textContent.trim().replace(/(\d{1,2})\/(\d{1,2})\/(\d{2,4})/g, '$3-$1-$2').replaceAll('/', '-');
        }
        await zipWriter.add(basename + '.txt', new zip.TextReader(captions));

        ++i;
    }

    const captionUrl = URL.createObjectURL(await zipWriter.close());
    let filename = 'Captions.zip';
    const folderName = document.getElementById('contentHeaderText');
    if (folderName !== null && folderName.textContent !== null) {
        filename = folderName.textContent + ' ' + filename;
    }
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
