/*
    ditulis oleh boston sinaga (feb - mar 2022)
    email: bostonsinga@gmail.com
*/

const hasil = document.querySelector('.hasil');
const sisa = document.querySelector('.sisa');
const unduh = document.querySelector('.unduh');
let xmlText, rekonstruksi = undefined;

/*  data yang akan dicari */
let KML;
function setupKML() {
    KML = {
        placemark: undefined,
        style: undefined,
        styleMap: undefined,
        styleName: [],
        jalur: [],
        closure: [],
        ODP: [],
        tiang: [],
        coilan: [],
        client: [],
        POP: [],
        sisa: [],
        sisaIconSource: []
    };
}
setupKML();

function getKoordinat(xmlDOM, divisionFlag, query) { // 0'all' 1'front' 2'back'
    
    const str = xmlDOM.querySelector(query).innerHTML;
    let kors = {lat: [], lon: []};
    let val = '', buff = [];
    
    for (e of str) {
        if (e == ',') {
            buff.push(parseFloat(val));
            val = '';
        }
        else if (e != ' ') {
            val += e;
        }
    }

    let buffbuff = 0;

    buff.forEach((e, i) => {
        if (i < buff.length) {
            if (e < buffbuff) kors.lat.push(e);
            else kors.lon.push(e);
            buffbuff = e;
        }
    });

    return divisionFlag == 0 ? kors : (divisionFlag == 1 ?
        {lat: kors.lat[0], lon: kors.lon[0]} : // front
        {lat: kors.lat[kors.lat.length - 1], lon: kors.lon[kors.lon.length - 1]} // back
    );
}

function tampilData() {

    // ADD XML DATA

    let columnEnum, curParDOM, output = [];

    function tulisNama(defTemStr, el, ct) {
        const elType = el.querySelector('name');
        if (elType) output.push(elType.innerHTML);
        else output.push(`${defTemStr}${ct+1}`);
    }

    function tulisKeterangan(defTemStr, el, ct) {
        const elType = el.querySelector('description');
        if (elType) output.push(elType.innerHTML);
        else output.push(`${defTemStr}${ct+1}`);
    }

    function tulisJarak(lat, lon) {

        /*
        * The math module contains a function
        * named toRadians which converts from
        * degrees to radians.
        */
        
        lon[0] *= Math.PI / 180;
        lon[1] *= Math.PI / 180;
        lat[0] *= Math.PI / 180;
        lat[1] *= Math.PI / 180;

        // Haversine formula
        let dlon = lon[1] - lon[0];
        let dlat = lat[1] - lat[0];
        let a = Math.pow(Math.sin(dlat / 2), 2)
                + Math.cos(lat[0]) * Math.cos(lat[1])
                * Math.pow(Math.sin(dlon / 2), 2);
            
        let c = 2 * Math.asin(Math.sqrt(a));

        // Radius of earth in kilometers. Use 3956
        // for miles
        let r = 6371;

        // calculate the result
        return(c * r);
    }

    function tulisTikor(kors, isSingle, type) {
        let val = '', deg, min, mataAngin, multiBuffer;

        const dirFill = () => {
            
            const fill = (input) => {
                val += Math.abs(parseInt(input)) + '\xB0';
                min = Math.abs(input % 1 * 60);
            }

            if (kors.lon == 'x') {
                fill(kors.lat);
                return parseInt(kors.lat) < 0 ? 'S' : 'N';
            }
            else if (kors.lat == 'x') {
                fill(kors.lon);
                return parseInt(kors.lat) < 0 ? 'W' : 'E';
            }
        };
        
        const fullFill = () => {
            val += parseInt(min) + "'" + Math.abs(min % 1 * 60).toFixed(2) + `"${mataAngin}`;
        };

        if (isSingle) {
            if (type == 'lat') {
                kors.lon = 'x';
            }
            else {
                kors.lat = 'x';
            }

            mataAngin = dirFill();
            fullFill();
        }
        else {
            multiBuffer = kors.lon;
            kors.lon = 'x';
            mataAngin = dirFill();
            fullFill();
            
            if (mataAngin == 'N' || mataAngin == 'S') {
                val += ' ';
            }

            kors.lon = multiBuffer;
            kors.lat = 'x';
            mataAngin = dirFill();
            fullFill();
        }

        output.push(val);
    }

    function tulisMultiTikor(el, flag) {
        tulisTikor(getKoordinat(el, flag, 'LineString coordinates'), false);
    }

    function tulisSingleTikor(el, type) {
        tulisTikor(getKoordinat(el, 1, 'Point coordinates'), true, type);
    }

    function sekat(ctr) {
        while (ctr--) output.push('=>');
    }

    function forEachCurPar(func) {
        curParDOM.forEach((el, ct) => {
            func(el, ct);
            if (ct == curParDOM.length - 1) sekat(1);
        });
    }

    // JALUR //

    curParDOM = KML.jalur;

    columnEnum = {
        NAMA: 0,
        KETERANGAN: 1,
        HARGA_PER_METER: 2,
        JARAK: 3,
        TOTAL_HARGA: 4,
        TIKOR_AWAL: 5,
        TIKOR_AKHIR: 6
    };

    for (let i = 0; i < Object.keys(columnEnum).length; i++) {

        switch (i) {
            case columnEnum.NAMA: {
                forEachCurPar((el, ct) => {
                    tulisNama('Jalur ', el, ct);
                });
            break;}
            case columnEnum.KETERANGAN: {
                forEachCurPar((el, ct) => {
                    tulisKeterangan('Kabel ', el, ct);
                });
            break;}
            case columnEnum.HARGA_PER_METER: {
                forEachCurPar((el) => {
                    
                });
            break;}
            case columnEnum.JARAK: {
                forEachCurPar((el) => {
                    const kors = getKoordinat(el, 0, 'LineString coordinates');
                    let totalJarak = 0;
                    for (let i = 0; i < kors.lat.length - 1; i++) {
                        totalJarak += tulisJarak(
                            [kors.lat[i], kors.lat[i+1]],
                            [kors.lon[i], kors.lon[i+1]]
                        );
                    }
                    output.push(`${parseInt(totalJarak * 1000)}m`);
                });
            break;}
            case columnEnum.TOTAL_HARGA: {
                forEachCurPar((el) => {
                    
                });
            break;}
            case columnEnum.TIKOR_AWAL: {
                forEachCurPar((el) => {
                    tulisMultiTikor(el, 1);
                });
            break;}
            case columnEnum.TIKOR_AKHIR: {
                forEachCurPar((el) => {
                    tulisMultiTikor(el, 2);
                });
            break;}
        }
    }

    //////////////

    sekat(2);

    // CLOSURE //

    curParDOM = KML.closure;

    columnEnum = {
        NAMA: 0,
        LATITUDE: 1,
        LONGITUDE: 2,
        HARGA: 3,
        KETERANGAN: 4
    };

    for (let i = 0; i < Object.keys(columnEnum).length; i++) {

        switch (i) {
            case columnEnum.NAMA: {
                forEachCurPar((el, ct) => {
                    tulisNama('Closure ', el, ct);
                });
            break;}
            case columnEnum.LATITUDE: {
                forEachCurPar((el) => {
                    tulisSingleTikor(el, 'lat');
                });
            break;}
            case columnEnum.LONGITUDE: {
                forEachCurPar((el) => {
                    tulisSingleTikor(el, 'lon');
                });            
            break;}
            case columnEnum.HARGA: {
                forEachCurPar((el) => {
                    
                });
            break;}
            case columnEnum.KETERANGAN: {
                forEachCurPar((el, ct) => {
                    tulisKeterangan('Tanggal ', el, ct);
                });
            break;}
        }
    }

    //////////////

    sekat(2);

    // ODP //

    curParDOM = KML.ODP;

    columnEnum = {
        NAMA: 0,
        LATITUDE: 1,
        LONGITUDE: 2,
        KAPASITAS: 3,
        HARGA: 4,
        KETERANGAN: 5
    };

    for (let i = 0; i < Object.keys(columnEnum).length; i++) {

        switch (i) {
            case columnEnum.NAMA: {
                forEachCurPar((el, ct) => {
                    tulisNama('ODP ', el, ct);
                });
            break;}
            case columnEnum.LATITUDE: {
                forEachCurPar((el) => {
                    tulisSingleTikor(el, 'lat');
                });
            break;}
            case columnEnum.LONGITUDE: {
                forEachCurPar((el) => {
                    tulisSingleTikor(el, 'lon');
                });
            break;}
            case columnEnum.KAPASITAS: {
                forEachCurPar((el) => {
                    
                });
            break;}
            case columnEnum.HARGA: {
                forEachCurPar((el) => {
                    
                });
            break;}
            case columnEnum.KETERANGAN: {
                forEachCurPar((el, ct) => {
                    tulisKeterangan('Tanggal ', el, ct);
                });
            break;}
        }
    }
    
    //////////////

    sekat(2);

    // TIANG //

    curParDOM = KML.tiang;

    columnEnum = {
        NAMA: 0,
        LATITUDE: 1,
        LONGITUDE: 2,
        TINGGI: 3,
        HARGA: 4,
        KETERANGAN: 5
    };

    for (let i = 0; i < Object.keys(columnEnum).length; i++) {

        switch (i) {
            case columnEnum.NAMA: {
                forEachCurPar((el, ct) => {
                    tulisNama('Tiang ', el, ct);
                });
            break;}
            case columnEnum.LATITUDE: {
                forEachCurPar((el) => {
                    tulisSingleTikor(el, 'lat');
                });
            break;}
            case columnEnum.LONGITUDE: {
                forEachCurPar((el) => {
                    tulisSingleTikor(el, 'lon');
                });
            break;}
            case columnEnum.TINGGI: {
                forEachCurPar((el) => {
                    output.push(`7`);
                });
            break;}
            case columnEnum.HARGA: {
                forEachCurPar((el) => {
                    
                });
            break;}
            case columnEnum.KETERANGAN: {
                forEachCurPar((el, ct) => {
                    tulisKeterangan('Tanggal ', el, ct);
                });
            break;}
        }
    }
    
    //////////////

    const hasilSection = hasil.querySelector('section');
    hasilSection.innerHTML = JSON.stringify(output);
    hasil.classList.add('hasil-berhasil');

    hasilSection.addEventListener('click', () => {
        var range = document.createRange();
        range.selectNode(hasilSection);
        window.getSelection().removeAllRanges();
        window.getSelection().addRange(range);
    });
}

// CARI DATA //

function cariData() {

    for (e of KML.placemark) {

        let iconSource = '', iconName = '';
        const eStyle = e.querySelector('styleUrl').innerHTML;

        function generateIconName(func) {
            for (i of KML.styleMap) {
                if (`#${i.id}` == eStyle) {

                    const stylePairNormalID = i.querySelector('Pair styleUrl').innerHTML;
                    for (j of KML.style) {
                        if (`#${j.id}` == stylePairNormalID) {
                            func(j);
                            break;
                        }
                    }
                    break;
                }
            }
        }

        if (e.querySelector('LineString')) {
            KML.jalur.push(e);
            
            generateIconName(dom => {
                try {
                    iconName = dom.querySelector('LineStyle color').innerHTML;
                }
                catch (err) {
                    iconName = 'ff000000';
                }
            });

            switch (iconName) {
                case 'ff00ffff': {
                    KML.styleName.push([eStyle, '#msn_akses']);
                    break;
                }
                case 'ff00ff00': {
                    KML.styleName.push([eStyle, '#msn_backbone']);
                    break;
                }
                default: {
                    KML.sisa.push(e);
                    KML.sisaIconSource.push(iconName);
                    KML.styleName.push([eStyle, `sisa*${iconName}`]);
                }
            }
        }
        else {
            
            generateIconName(dom => {
                try {
                    iconSource = dom.querySelector('IconStyle Icon href').innerHTML;
                }
                catch (err) {
                    iconSource = 'https://maps.google.com/mapfiles/kml/shapes/donut.png';
                }

                let h = iconSource.length, buffer = '';
                while (h--) {
                    if (iconSource.charAt(h) != '/') {
                        buffer += iconSource.charAt(h);
                    }
                    else {
                        iconName = buffer.split('').reverse().join('');
                        break;
                    }
                }
            });

            switch (iconName) {
                case 'ylw-pushpin.png': {
                    KML.closure.push(e);
                    KML.styleName.push([eStyle, '#msn_ylw-pushpin']);
                    break;
                }
                case 'placemark_square.png': {
                    KML.ODP.push(e);
                    KML.styleName.push([eStyle, '#msn_placemark_square']);
                    break;
                }
                case 'blue-pushpin.png': {
                    KML.tiang.push(e);
                    KML.styleName.push([eStyle, '#msn_blue-pushpin']);
                    break;
                }
                case 'red-pushpin.png': {
                    KML.coilan.push(e);
                    KML.styleName.push([eStyle, '#msn_red-pushpin']);
                    break;
                }
                case 'wht-pushpin.png': {
                    KML.client.push(e);
                    KML.styleName.push([eStyle, '#msn_wht-pushpin']);
                    break;
                }
                case 'ranger_station.png': {
                    KML.POP.push(e);
                    KML.styleName.push([eStyle, '#msn_ranger_station']);
                    break;
                }
                default: {
                    KML.sisa.push(e);
                    KML.sisaIconSource.push(iconSource);
                    KML.styleName.push([eStyle, `sisa*${iconName}`]);
                }
            }
        }
    }
}

//////////////

function muatUlang() {

    const xmlParser = new DOMParser();
    const xmlDoc = xmlParser.parseFromString(xmlText, 'text/xml'); 
    const xmlObj = xmlDoc.querySelector('Document');

    if (KML.placemark != undefined) {
        setupKML();
        hasil.querySelector('section').innerHTML = '';
        sisa.querySelector('.placemarks').innerHTML = '';
        unduh.classList.remove('unduh-siap');
    }

    setTimeout(() => {
        KML.placemark = xmlObj.querySelectorAll('Placemark');
        KML.style = xmlObj.querySelectorAll('Style');
        KML.styleMap = xmlObj.querySelectorAll('StyleMap');

        cariData();
        tampilData();
        rekonstruksi();
    }, 10);
}

function olahData() {

    const [file] = document.querySelector('input[type=file]').files;
    const reader = new FileReader();

    reader.addEventListener("load", () => {
        xmlText = reader.result;
        muatUlang();
    }, false);

    if (file) {
        reader.readAsText(file);
    }
}