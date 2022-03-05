/*
    ditulis oleh boston sinaga (feb - mar 2022)
    email: bostonsinga@gmail.com
*/

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

    const styleSetXML = `
        <Style id="sh_ylw-pushpin">
            <IconStyle>
                <scale>1.3</scale>
                <Icon>
                    <href>http://maps.google.com/mapfiles/kml/pushpin/ylw-pushpin.png</href>
                </Icon>
                <hotSpot x="20" y="2" xunits="pixels" yunits="pixels"/>
            </IconStyle>
            <BalloonStyle>
            </BalloonStyle>
            <ListStyle>
            </ListStyle>
        </Style>
        <Style id="sn_ylw-pushpin">
            <IconStyle>
                <scale>1.1</scale>
                <Icon>
                    <href>http://maps.google.com/mapfiles/kml/pushpin/ylw-pushpin.png</href>
                </Icon>
                <hotSpot x="20" y="2" xunits="pixels" yunits="pixels"/>
            </IconStyle>
            <BalloonStyle>
            </BalloonStyle>
            <ListStyle>
            </ListStyle>
        </Style>
        <StyleMap id="msn_ylw-pushpin">
            <Pair>
                <key>normal</key>
                <styleUrl>#sn_ylw-pushpin</styleUrl>
            </Pair>
            <Pair>
                <key>highlight</key>
                <styleUrl>#sh_ylw-pushpin</styleUrl>
            </Pair>
        </StyleMap>
        <Style id="sh_red-pushpin">
            <IconStyle>
                <scale>1.3</scale>
                <Icon>
                    <href>http://maps.google.com/mapfiles/kml/pushpin/red-pushpin.png</href>
                </Icon>
                <hotSpot x="20" y="2" xunits="pixels" yunits="pixels"/>
            </IconStyle>
            <BalloonStyle>
            </BalloonStyle>
            <ListStyle>
            </ListStyle>
        </Style>
        <Style id="sn_red-pushpin">
            <IconStyle>
                <scale>1.1</scale>
                <Icon>
                    <href>http://maps.google.com/mapfiles/kml/pushpin/red-pushpin.png</href>
                </Icon>
                <hotSpot x="20" y="2" xunits="pixels" yunits="pixels"/>
            </IconStyle>
            <BalloonStyle>
            </BalloonStyle>
            <ListStyle>
            </ListStyle>
        </Style>
        <StyleMap id="msn_red-pushpin">
            <Pair>
                <key>normal</key>
                <styleUrl>#sn_red-pushpin</styleUrl>
            </Pair>
            <Pair>
                <key>highlight</key>
                <styleUrl>#sh_red-pushpin</styleUrl>
            </Pair>
        </StyleMap>
        <Style id="sh_wht-pushpin">
            <IconStyle>
                <scale>1.3</scale>
                <Icon>
                    <href>http://maps.google.com/mapfiles/kml/pushpin/wht-pushpin.png</href>
                </Icon>
                <hotSpot x="20" y="2" xunits="pixels" yunits="pixels"/>
            </IconStyle>
            <BalloonStyle>
            </BalloonStyle>
            <ListStyle>
            </ListStyle>
        </Style>
        <Style id="sn_wht-pushpin">
            <IconStyle>
                <scale>1.1</scale>
                <Icon>
                    <href>http://maps.google.com/mapfiles/kml/pushpin/wht-pushpin.png</href>
                </Icon>
                <hotSpot x="20" y="2" xunits="pixels" yunits="pixels"/>
            </IconStyle>
            <BalloonStyle>
            </BalloonStyle>
            <ListStyle>
            </ListStyle>
        </Style>
        <StyleMap id="msn_wht-pushpin">
            <Pair>
                <key>normal</key>
                <styleUrl>#sn_wht-pushpin</styleUrl>
            </Pair>
            <Pair>
                <key>highlight</key>
                <styleUrl>#sh_wht-pushpin</styleUrl>
            </Pair>
        </StyleMap>
        <Style id="sh_blue-pushpin">
            <IconStyle>
                <scale>1.3</scale>
                <Icon>
                    <href>http://maps.google.com/mapfiles/kml/pushpin/blue-pushpin.png</href>
                </Icon>
                <hotSpot x="20" y="2" xunits="pixels" yunits="pixels"/>
            </IconStyle>
            <BalloonStyle>
            </BalloonStyle>
            <ListStyle>
            </ListStyle>
        </Style>
        <Style id="sn_blue-pushpin">
            <IconStyle>
                <scale>1.1</scale>
                <Icon>
                    <href>http://maps.google.com/mapfiles/kml/pushpin/blue-pushpin.png</href>
                </Icon>
                <hotSpot x="20" y="2" xunits="pixels" yunits="pixels"/>
            </IconStyle>
            <BalloonStyle>
            </BalloonStyle>
            <ListStyle>
            </ListStyle>
        </Style>
        <StyleMap id="msn_blue-pushpin">
            <Pair>
                <key>normal</key>
                <styleUrl>#sn_blue-pushpin</styleUrl>
            </Pair>
            <Pair>
                <key>highlight</key>
                <styleUrl>#sh_blue-pushpin</styleUrl>
            </Pair>
        </StyleMap>
        <Style id="sn_placemark_square">
            <IconStyle>
                <scale>1.2</scale>
                <Icon>
                    <href>http://maps.google.com/mapfiles/kml/shapes/placemark_square.png</href>
                </Icon>
            </IconStyle>
            <BalloonStyle>
            </BalloonStyle>
            <ListStyle>
            </ListStyle>
        </Style>
        <Style id="sh_placemark_square_highlight">
            <IconStyle>
                <scale>1.2</scale>
                <Icon>
                    <href>http://maps.google.com/mapfiles/kml/shapes/placemark_square_highlight.png</href>
                </Icon>
            </IconStyle>
            <BalloonStyle>
            </BalloonStyle>
            <ListStyle>
            </ListStyle>
        </Style>
        <StyleMap id="msn_placemark_square">
            <Pair>
                <key>normal</key>
                <styleUrl>#sn_placemark_square</styleUrl>
            </Pair>
            <Pair>
                <key>highlight</key>
                <styleUrl>#sh_placemark_square_highlight</styleUrl>
            </Pair>
        </StyleMap>
        <Style id="sn_ranger_station">
            <IconStyle>
                <scale>1.2</scale>
                <Icon>
                    <href>http://maps.google.com/mapfiles/kml/shapes/ranger_station.png</href>
                </Icon>
                <hotSpot x="0.5" y="0" xunits="fraction" yunits="fraction"/>
            </IconStyle>
            <BalloonStyle>
            </BalloonStyle>
            <ListStyle>
            </ListStyle>
        </Style>
        <Style id="sh_ranger_station">
            <IconStyle>
                <scale>1.4</scale>
                <Icon>
                    <href>http://maps.google.com/mapfiles/kml/shapes/ranger_station.png</href>
                </Icon>
                <hotSpot x="0.5" y="0" xunits="fraction" yunits="fraction"/>
            </IconStyle>
            <BalloonStyle>
            </BalloonStyle>
            <ListStyle>
            </ListStyle>
        </Style>
        <StyleMap id="msn_ranger_station">
            <Pair>
                <key>normal</key>
                <styleUrl>#sn_ranger_station</styleUrl>
            </Pair>
            <Pair>
                <key>highlight</key>
                <styleUrl>#sh_ranger_station</styleUrl>
            </Pair>
        </StyleMap>
        <Style id="sn_backbone">
            <BalloonStyle>
            </BalloonStyle>
            <LineStyle>
                <color>ff00ff00</color>
            </LineStyle>
        </Style>
        <Style id="sh_backbone">
            <IconStyle>
                <scale>1.2</scale>
            </IconStyle>
            <BalloonStyle>
            </BalloonStyle>
            <LineStyle>
                <color>ff00ff00</color>
            </LineStyle>
        </Style>
        <StyleMap id="msn_backbone">
            <Pair>
                <key>normal</key>
                <styleUrl>#sn_backbone</styleUrl>
            </Pair>
            <Pair>
                <key>highlight</key>
                <styleUrl>#sh_backbone</styleUrl>
            </Pair>
        </StyleMap>
        <Style id="sn_akses">
            <BalloonStyle>
            </BalloonStyle>
            <LineStyle>
                <color>ff00ff00</color>
            </LineStyle>
        </Style>
        <Style id="sh_akses">
            <IconStyle>
                <scale>1.2</scale>
            </IconStyle>
            <BalloonStyle>
            </BalloonStyle>
            <LineStyle>
                <color>ff00ff00</color>
            </LineStyle>
        </Style>
        <StyleMap id="msn_akses">
            <Pair>
                <key>normal</key>
                <styleUrl>#sn_akses</styleUrl>
            </Pair>
            <Pair>
                <key>highlight</key>
                <styleUrl>#sh_akses</styleUrl>
            </Pair>
        </StyleMap>
    `;

    const end_stylesText_index = cariIndex('<Folder>', -1);
    const stylesText = xmlText.slice(cariIndex('</open>', 7), end_stylesText_index);
    xmlText = xmlText.replace(stylesText, styleSetXML);

    let bigFolderText = xmlText.slice(
        end_stylesText_index + 8,
        cariIndex('<redloF/>', -8, true)
    );

    let bigFolderText_buffer = bigFolderText;

    for (e of KML.styleName) {
        if (e[1].slice(0, 5) != 'sisa*') {
            bigFolderText = bigFolderText.replace(e[0], e[1]);
        }
    }

    xmlText = xmlText.replace(bigFolderText_buffer, bigFolderText);

    ////////////////

    // tampilkan sisa
    const sisaLength = KML.sisa.length;
    if (sisaLength != 0) {
        
        sisa.querySelector('header').innerHTML = `Sisa (${sisaLength})`;
        const sisaPlacemarks = sisa.querySelector('.placemarks');
        const sisaOptions = sisa.querySelector('.options');
        sisa.classList.add('sisa-berhasil');
        sisaPlacemarks.innerHTML = '';

        let styleNameSisa = [];

        KML.styleName.forEach(e => {
            if (e[1].slice(0, 5) == 'sisa*') {
                styleNameSisa.push(e[1].slice(5, e[1].length));
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

        sisaDOMs = sisaPlacemarks.querySelectorAll('.placemark');
        let selectedIndexes, selectedColor = Array.from(
            {length: sisaLength}, () => 'rgba(191, 191, 191, 0.5)'
        );
        
        sisaDOMs.forEach((el, ct) => {
            el.addEventListener('click', () => {

                selectedIndexes = [];
                selectedColor[ct] = 'rgba(255, 184, 143, 0.5)';
                el.style.backgroundColor = selectedColor[ct];
                selectedIndexes.push(ct);
                
                if (i != ct) {
                    for (let i = 0; i < sisaLength; i++) {
                        if (styleNameSisa[ct] == styleNameSisa[i]) {
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

        sisaOptions.querySelector('.tombol-ganti').addEventListener('click', () => {
            console.log(sisaOptions.querySelector('input[name="jenis"]:checked').value);
            muatUlang();
        });
    }

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