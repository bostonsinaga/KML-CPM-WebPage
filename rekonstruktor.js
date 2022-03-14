/*
    ditulis oleh boston sinaga (feb - mar 2022)
    email: bostonsinga@gmail.com
*/

let templatePlacemarkXML_scaleToggle = 1.3;
function getTemplatePlacemarkXML_style(id, icoSrc) {

    if (templatePlacemarkXML_scaleToggle == 1.3)
        templatePlacemarkXML_scaleToggle = 1.1;
    else templatePlacemarkXML_scaleToggle = 1.3;

    return `
    <Style id="${id}">
        <IconStyle>
            <scale>${templatePlacemarkXML_scaleToggle}</scale>
            <Icon>
                <href>${icoSrc}</href>
            </Icon>
            <hotSpot x="20" y="2" xunits="pixels" yunits="pixels"/>
        </IconStyle>
        <BalloonStyle>
        </BalloonStyle>
        <ListStyle>
        </ListStyle>
    </Style>`;
}

function getTemplatePlacemarkXML_styleMap(id, icoSrc) { // only call this, not above. Because they connected

    return `${getTemplatePlacemarkXML_style(id.n, icoSrc) + getTemplatePlacemarkXML_style(id.h, icoSrc)}
    <StyleMap id="${id.map}">
        <Pair>
            <key>normal</key>
            <styleUrl>#${id.n}</styleUrl>
        </Pair>
        <Pair>
            <key>highlight</key>
            <styleUrl>#${id.h}</styleUrl>
        </Pair>
    </StyleMap>`;
}

function getTemplatePathXML_style(id, icoNm) {
    return `
    <Style id="${id}">
        <BalloonStyle>
        </BalloonStyle>
        <LineStyle>
            <color>${icoNm}</color>
        </LineStyle>
    </Style>`;
}

function getTemplatePathXML_styleMap(id, icoSrc) { // only call this, not above. Because they connected

    return `${getTemplatePathXML_style(id.n, icoSrc) + getTemplatePathXML_style(id.h, icoSrc)}
    <StyleMap id="${id.map}">
        <Pair>
            <key>normal</key>
            <styleUrl>#${id.n}</styleUrl>
        </Pair>
        <Pair>
            <key>highlight</key>
            <styleUrl>#${id.h}</styleUrl>
        </Pair>
    </StyleMap>`;
}

REKONSTRUKSI = () => {

    // susun ulang 'XML_TEXT' //

    let matchStr = '';

    function cariIndex(targetStr, steps, isReverse = false) {

        if (isReverse) {
            for (let i = XML_TEXT.length - 1; i >= 0; i--) {

                for (j = i; j > i - targetStr.length; j--) {
                    matchStr += XML_TEXT[j];
                }
    
                if (matchStr == targetStr) return i + steps;
                matchStr = '';
            }
        }
        else {
            for (let i = 0; i < XML_TEXT.length; i++) {

                for (j = i; j < i + targetStr.length; j++) {
                    matchStr += XML_TEXT[j];
                }

                if (matchStr == targetStr) return i + steps;
                matchStr = '';
            }
        }
    }

    // use template xml
    let styleSetXML = `
    <name>${XML_OBJ.querySelector('name').innerHTML}</name>
    <open>1</open>`;
    {
        const iconSources = [
            'http://maps.google.com/mapfiles/kml/pushpin/ylw-pushpin.png',
            'http://maps.google.com/mapfiles/kml/pushpin/red-pushpin.png',
            'http://maps.google.com/mapfiles/kml/pushpin/wht-pushpin.png',
            'http://maps.google.com/mapfiles/kml/pushpin/blue-pushpin.png',
            'http://maps.google.com/mapfiles/kml/shapes/placemark_square.png',
            'http://maps.google.com/mapfiles/kml/shapes/ranger_station.png',
            'http://maps.google.com/mapfiles/kml/paddle/H.png'
        ];

        const styleIDs = [
            {n: 'sn_closure', h: 'sh_closure', map: 'msn_closure'},
            {n: 'sn_coilan', h: 'sh_coilan', map: 'msn_coilan'},
            {n: 'sn_client', h: 'sh_client', map: 'msn_client'},
            {n: 'sn_tiang', h: 'sh_tiang', map: 'msn_tiang'},
            {n: 'sn_odp', h: 'sh_odp', map: 'msn_odp'},
            {n: 'sn_pop', h: 'sh_pop', map: 'msn_pop'},
            {n: 'sn_handhole', h: 'sh_handhole', map: 'msn_handhole'}
        ];

        for (let i = 0; i < iconSources.length; i++) {
            styleSetXML += getTemplatePlacemarkXML_styleMap(styleIDs[i], iconSources[i]);
        }
    }
    {
        const iconNames = [
            'ff00ff00',
            'ff00ffff',
            'ffff00ff',
            'ffffff55'
        ];

        const styleIDs = [
            {n: 'sn_backbone', h: 'sh_backbone', map: 'msn_backbone'},
            {n: 'sn_akses', h: 'sh_akses', map: 'msn_akses'},
            {n: 'sn_tanam', h: 'sh_tanam', map: 'msn_tanam'},
            {n: 'sn_berbeda', h: 'sh_berbeda', map: 'msn_berbeda'},
        ];

        for (let i = 0; i < iconNames.length; i++) {
            styleSetXML += getTemplatePathXML_styleMap(styleIDs[i], iconNames[i]);
        }

        styleSetXML += '\n';
    }

    const stylesText = XML_TEXT.slice(cariIndex('<Document>', 10), cariIndex('<Folder>', -1));
    XML_TEXT = XML_TEXT.replace(stylesText, styleSetXML);

    let bigFolderText = XML_TEXT.slice(
        cariIndex('<Folder>', -1) + 8,
        cariIndex('<redloF/>', -8, true)
    );

    let bigFolderText_buffer = bigFolderText;

    if (IS_WAKTU_DATA) {
        bigFolderText = bigFolderText.replace(
            `<description>${XML_OBJ.querySelector('Folder description').innerHTML}</description>`,
            '<description></description>'
        );
    }

    for (e of KML.styleName) {
        bigFolderText = bigFolderText.replace(
            '>' + e[0] + '<',
            '>' + e[1] + '<'
        );
    }

    XML_TEXT = XML_TEXT.replace(bigFolderText_buffer, bigFolderText);

    // download new kml
    unduh.classList.add('unduh-siap');
}

function downloadKML() {

    const name = XML_OBJ.querySelector('name').innerHTML;

    var element = document.createElement('a');
    element.setAttribute('href', 'data:text/plain;charset=utf-8,' + encodeURIComponent(XML_TEXT));

    element.setAttribute('download', `${name.slice(0, name.length - 4)}.kml`);

    element.style.display = 'none';
    document.body.appendChild(element);
    element.click();
    document.body.removeChild(element);
}

unduh.addEventListener('click', () => downloadKML());