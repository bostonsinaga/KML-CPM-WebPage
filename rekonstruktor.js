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

    return `        <Style id="${id}">
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
        </StyleMap>
    `;
}

rekonstruksi = () => {

    // susun ulang 'xmlText' //

    let matchStr = '';

    function cariIndex(targetStr, steps, isReverse = false) {

        if (isReverse) {
            for (let i = xmlText.length - 1; i >= 0; i--) {

                for (j = i; j > i - targetStr.length; j--) {
                    matchStr += xmlText[j];
                }
    
                if (matchStr == targetStr) return i + steps;
                matchStr = '';
            }
        }
        else {
            for (let i = 0; i < xmlText.length; i++) {

                for (j = i; j < i + targetStr.length; j++) {
                    matchStr += xmlText[j];
                }

                if (matchStr == targetStr) return i + steps;
                matchStr = '';
            }
        }
    }

    // use template xml
    let styleSetXML = '';
    {
        const iconSources = [
            'http://maps.google.com/mapfiles/kml/pushpin/ylw-pushpin.png',
            'http://maps.google.com/mapfiles/kml/pushpin/red-pushpin.png',
            'http://maps.google.com/mapfiles/kml/pushpin/wht-pushpin.png',
            'http://maps.google.com/mapfiles/kml/pushpin/blue-pushpin.png',
            'http://maps.google.com/mapfiles/kml/shapes/placemark_square.png',
            'http://maps.google.com/mapfiles/kml/shapes/ranger_station.png'
        ];

        const styleIDs = [
            {n: 'sn_closure', h: 'sh_closure', map: 'msn_closure'},
            {n: 'sn_coilan', h: 'sh_coilan', map: 'msn_coilan'},
            {n: 'sn_client', h: 'sh_client', map: 'msn_client'},
            {n: 'sn_tiang', h: 'sh_tiang', map: 'msn_tiang'},
            {n: 'sn_odp', h: 'sh_odp', map: 'msn_odp'},
            {n: 'sn_pop', h: 'sh_pop', map: 'msn_pop'}
        ];

        for (let i = 0; i < iconSources.length; i++) {
            styleSetXML += getTemplatePlacemarkXML_styleMap(styleIDs[i], iconSources[i]);
        }
    }
    {
        const iconNames = [
            'ff00ff00',
            'ff00ffff'
        ];

        const styleIDs = [
            {n: 'sn_backbone', h: 'sh_backbone', map: 'msn_backbone'},
            {n: 'sn_akses', h: 'sh_akses', map: 'msn_akses'},
        ];

        for (let i = 0; i < iconNames.length; i++) {
            styleSetXML += getTemplatePathXML_styleMap(styleIDs[i], iconNames[i]);
        }

        if (KML.sisa.length == 0) styleSetXML += '\n';
    }

    // tambahkan stye xml sisa agar tidak terjadi bug saat 'ganti' jenis
    KML.sisa.forEach((e, i) => {

        const eStyle = e.querySelector('styleUrl').innerHTML;
        let eName;

        if (eStyle.slice(0, 5) == '#msn_') {
            eName = eStyle.slice(5);
        }
        else if (eStyle.slice(0, 3) == '#m_') {
            eName = eStyle.slice(3);
        }

        const styleID = {n: `sn_${eName}`, h: `sh_${eName}`, map: eStyle.slice(1)};

        if (e.querySelector('LineString')) {
            styleSetXML += getTemplatePathXML_styleMap(styleID, KML.sisaIconSource[i]);
        }
        else {
            styleSetXML += getTemplatePlacemarkXML_styleMap(styleID, KML.sisaIconSource[i]);
        }
        
        if (i == KML.sisa.length - 1) styleSetXML += '\n';
    });

    const stylesText = xmlText.slice(cariIndex('</open>', 7), cariIndex('<Folder>', -1));
    xmlText = xmlText.replace(stylesText, styleSetXML);

    let bigFolderText = xmlText.slice(
        cariIndex('<Folder>', -1) + 8,
        cariIndex('<redloF/>', -8, true)
    );

    let bigFolderText_buffer = bigFolderText;

    for (e of KML.styleName) {
        if (e[1].slice(0, 5) != 'sisa*') {
            bigFolderText = bigFolderText.replace(
                '>' + e[0] + '<',
                '>' + e[1] + '<'
            );
        }
    }

    xmlText = xmlText.replace(bigFolderText_buffer, bigFolderText);

    ////////////////

    // tampilkan sisa
    const sisaLength = KML.sisa.length;
    if (sisaLength != 0) {
        
        sisa.querySelector('header').innerHTML = `Sisa (${sisaLength}) **masih dalam pengembangan`;
        const sisaPlacemarks = sisa.querySelector('.placemarks');
        const sisaOptions = sisa.querySelector('.options');
        sisa.classList.add('sisa-berhasil');
        sisaPlacemarks.innerHTML = '';

        let styleNameSisa = {style: [], icon: []};

        KML.styleName.forEach(e => {
            if (e[1].slice(0, 5) == 'sisa*') {
                styleNameSisa.style.push(e[0]);
                styleNameSisa.icon.push(e[1].slice(5, e[1].length));
            }
        });

        KML.sisa.forEach((el, ct) => {

            const div = document.createElement('div');
            div.classList.add('placemark');

            const getNama = () => {
                let str;
                try {
                    str = el.querySelector('name').innerHTML;
                }
                catch (err) {
                    str = 'untitled';
                }
                return str;
            };

            if (el.querySelector('LineString')) {
                const colorHex = KML.sisaIconSource[ct].split('').reverse().join('');
                div.innerHTML = `
                    <div class="nama">${getNama()}</div>
                    <div style="background-color: #${colorHex};" class="dot"></div>
                `;
            }
            else {
                div.innerHTML = `
                    <div class="nama">${getNama()}</div>
                    <img src="${KML.sisaIconSource[ct]}">
                `;
            }
            
            sisaPlacemarks.appendChild(div);
        });

        const sisaDOMs = sisaPlacemarks.querySelectorAll('.placemark');
        let selectedIndexes = undefined, selectedColor = Array.from(
            {length: sisaLength}, () => 'rgba(191, 191, 191, 0.5)'
        );
        
        sisaDOMs.forEach((el, ct) => {
            el.addEventListener('click', () => {

                selectedIndexes = [];
                selectedColor[ct] = 'rgba(255, 184, 143, 0.5)';
                el.style.backgroundColor = selectedColor[ct];
                selectedIndexes.push(ct);
                
                for (let i = 0; i < sisaLength; i++) {
                    if (i != ct) {
                        if (styleNameSisa.icon[ct] == styleNameSisa.icon[i]) {
                            selectedColor[i] = selectedColor[ct];
                            sisaDOMs[i].style.backgroundColor = selectedColor[i];
                            selectedIndexes.push(i);
                        }
                        else {
                            selectedColor[i] = 'rgba(191, 191, 191, 0.5)';
                            sisaDOMs[i].style.backgroundColor = selectedColor[i];
                        }
                    }
                }
            });

            el.addEventListener('mouseover', () => {
                el.style.backgroundColor = selectedColor[ct].replace('0.5', '1');
            });

            el.addEventListener('mouseout', () => {
                el.style.backgroundColor = selectedColor[ct];
            });
        });

        // Tombol Ganti
        if (IS_GANTI_BUTTON_ACTIVATED == false) {
            sisaOptions.querySelector('.tombol-ganti').addEventListener('click', () => {
                IS_GANTI_BUTTON_ACTIVATED = true;

                if (selectedIndexes) {

                    let styleStr = '#msn_';
                    const jenis = sisaOptions.querySelector('input[name="jenis"]:checked').value;
                    
                    if (jenis == 'jalur-backbone') styleStr += 'backbone';
                    else if (jenis == 'jalur-akses') styleStr += 'akses';
                    else if (jenis == 'pop') styleStr += 'pop';
                    else if (jenis == 'closure') styleStr += 'closure';
                    else if (jenis == 'coilan') styleStr += 'coilan';
                    else if (jenis == 'odp') styleStr += 'odp';
                    else if (jenis == 'client') styleStr += 'client';
                    else if (jenis == 'tiang') styleStr += 'tiang';

                    bigFolderText_buffer = bigFolderText;

                    for (e of selectedIndexes) {
                        bigFolderText = bigFolderText.replace(
                            '>' + styleNameSisa.style[e] + '<',
                            '>' + styleStr + '<'
                        );
                    }

                    xmlText = xmlText.replace(bigFolderText_buffer, bigFolderText);
                    muatUlang();
                }
            });
        }
    }
    else sisa.classList.remove('sisa-berhasil');

    // download new kml
    unduh.classList.add('unduh-siap');
}

function downloadKML() {

    var element = document.createElement('a');
    element.setAttribute('href', 'data:text/plain;charset=utf-8,' + encodeURIComponent(xmlText));
    element.setAttribute('download', 'doc.kml');

    element.style.display = 'none';
    document.body.appendChild(element);
    element.click();
    document.body.removeChild(element);
}

unduh.addEventListener('click', () => downloadKML());