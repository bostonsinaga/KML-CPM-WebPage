/*
    ditulis oleh boston sinaga (feb - mar 2022)
    email: bostonsinga@gmail.com
*/

const hasil = document.querySelector('.hasil');
const unduh = document.querySelector('.unduh');
const petunjuk = document.querySelector('.petunjuk');
const petunjukKlasifikasi = petunjuk.querySelectorAll('section div');

let XML_OBJ, XML_TEXT, REKONSTRUKSI = undefined, IS_WAKTU_DATA = false;

const pathClr = {
    backbone: [
        '005500ff', '00aa00ff', '00aa00ff', '00aa00ff', '00aa00ff', '00aa00ff',
        '00aa00ff','00aa00ff', '55ff00ff', '55aa7fff', '55ff7fff'
    ],
    tanam: [
        'aa007fff', 'aa557fff', 'aa00ffff', 'aa55ffff', 'ff007fff',
        'ff557fff','ffaa7fff', 'ff00ffff', 'ff55ffff', 'ffaaffff'
    ],
    berbeda: [
        '00007fff', '00557fff', '0000ffff', '0055ffff', '00aaffff', 'aaaaffff','00ffffff',
        'aaffffff', '55007fff', '55557fff', '5500ffff', '5555ffff', '55aaffff', '55ffffff'
    ],
    akses: ['ffff00ff', '*lain']
};

const tagSgn = {
    tiang: [
        'blue-pushpin.png', 'flag.png', 'purple-pushpin.png', 'blu-blank.png',
        'blu-diamond.png', 'blu-circle.png', 'blu-square.png', 'blu-stars.png'
    ],
    odp: [
        'placemark_square.png', 'square.png', 'donut.png',
        'open-diamond.png', 'cross-hairs.png', 'placemark_circle.png'
    ],
    coilan: [
        'red-pushpin.png', 'red-blank.png', 'red-diamond.png', 'red-circle.png',
        'red-square.png', 'red-stars.png', 'pink-pushpin.png'
    ],
    client: [
        'wht-pushpin.png', 'wht-blank.png', 'wht-diamond.png',
        'wht-circle.png', 'wht-square.png', 'wht-stars.png'
    ],
    pop: [
        'ranger_station.png', 'campground.png', 'grn-blank.png', 'grn-diamond.png',
        'grn-circle.png', 'grn-square.png', 'grn-stars.png'
    ],
    handhole: [
        'H.png', 'grn-pushpin.png', 'ltblu-pushpin.png'
    ],
    closure: ['ylw-pushpin.png', '*lain']
};

const tagSgn_folderName = {
    tiang: [
        'pushpin/', 'shapes/', 'pushpin/', 'paddle/',
        'paddle/', 'paddle/', 'paddle', 'paddle/'
    ],
    odp: [
        'shapes/', 'shapes/', 'shapes/',
        'shapes/', 'shapes/', 'shapes/'
    ],
    coilan: [
        'pushpin/', 'paddle/', 'paddle/', 'paddle/',
        'paddle', 'paddle/', 'pushpin/'
    ],
    client: [
        'pushpin/', 'paddle/', 'paddle/',
        'paddle/', 'paddle', 'paddle/'
    ],
    pop: [
        'shapes/', 'shapes/', 'paddle/', 'paddle/',
        'paddle/', 'paddle', 'paddle/'
    ],
    handhole: [
        'paddle/', 'pushpin/', 'pushpin/'
    ],
    closure: ['pushpin/']
};

function cetakPetunjuk(el, ct, obj, isPath) {
    const objName = Object.keys(obj)[ct];
    const folderName = isPath == false ? Object.keys(tagSgn_folderName)[ct] : undefined;

    let i = 0;
    for (e of obj[objName]) {
        const div = document.createElement('div');

        if (e == '*lain') {
            div.innerHTML = '<i>*sisanya</i>';
            div.style.width = 'auto';
            div.style.border = 'none';
        }
        else {
            if (isPath) div.style.backgroundColor = `#${e}`;
            else {
                div.style.backgroundImage = `url(http://maps.google.com/mapfiles/kml/${tagSgn_folderName[folderName][i]}/${e})`;
                div.style.border = 'none';
            }
        }

        el.querySelector('section').appendChild(div);
        i++;
    }
}

// untuk keterangan waktu
const bulanStr = [
    ['Januari', 31], ['Februari', 28], ['Maret', 31], ['April', 30],
    ['Mei', 31],['Juni', 30], ['Juli', 31], ['Agustus', 31],
    ['September', 30], ['Oktober', 31], ['November', 30], ['Desember', 31],
];

// tampilkan tanda petunjuk
petunjukKlasifikasi.forEach((el, ct) => {
    if (ct < 4) cetakPetunjuk(el, ct, pathClr, true);
    else cetakPetunjuk(el, ct - 4, tagSgn, false);
});

/*  data yang akan dicari */
const KML = {
    placemark: undefined,
    style: undefined,
    styleMap: undefined,
    styleName: [],
    jalur: [],
    jalurTanam: [],
    closure: [],
    ODP: [],
    tiang: [],
    coilan: [],
    client: [],
    POP: [],
    handhole: []
};

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

    let columnEnum, columnEnumLength, curParDOM, output = [];

    function tulisNama(defTemStr, el, ct, tnmEl = undefined) {
        const elType = el.querySelector('name');

        let tanamTag = '';
        if (tnmEl) {
            tanamTag = '@-';
        }
        
        if (elType) {
            output.push(elType.innerHTML + tanamTag);
        }
        else output.push(`${defTemStr}${ct+1}${tanamTag}`);
    }

    // buat bulan dan tahun dalam format JSON untuk mengotomatisasikan tanggal
    // pada deskipsi folder utama
    function tulisKeterangan(el, ct, tot) {
        const elType = el.querySelector('description');

        let waktuData, waktu = '';
        try {
            waktuData = JSON.parse(XML_OBJ.querySelector('Folder description').innerHTML);
        }
        catch (er) {
            waktuData = undefined;
        }

        if (waktuData) { 
            IS_WAKTU_DATA = true;

            if (waktuData[0] > 0 && waktuData[0] < 13) {
                
                // tahun kabisat
                const bulan = bulanStr[waktuData[0] - 1];
                if (bulan[0] == 'Februari') {
                    if (waktuData[1] % 4 == 0) bulan[1] = 29;
                    else bulan[1] = 28;
                }

                // membuat tanggal berdasarkan jumlah maksimal
                waktu += Math.ceil(bulan[1] / tot * (ct + 1));
                
                waktu += ' ' + bulanStr[waktuData[0] - 1][0];
                waktu += ' ' + waktuData[1];
            }
        }
        
        if (elType) output.push(elType.innerHTML);
        else output.push(waktu);
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
        let val = '', min, mataAngin, multiBuffer;

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

    function forEachCurPar(func, isJalur = false) {

        if (curParDOM.length == 0) {
            sekat(1);
        }
        else {
            curParDOM.forEach((el, ct) => {
                if (isJalur) {
                    func(el, ct, KML.jalurTanam[ct]);
                }
                else {
                    func(el, ct);
                }

                if (ct == curParDOM.length - 1) sekat(1);
            });
        }
    }

    function updateColumnEnumLength() {
        columnEnumLength = Object.keys(columnEnum).length;
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
    updateColumnEnumLength();

    for (let i = 0; i < columnEnumLength; i++) {

        switch (i) {
            case columnEnum.NAMA: {
                forEachCurPar((el, ct) => {
                    tulisNama('Jalur ', el, ct, KML.jalurTanam[ct]);
                });
            break;}
            case columnEnum.KETERANGAN: {
                forEachCurPar((el, ct) => {
                    tulisKeterangan(el, ct, KML.jalur.length);
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
                    output.push(parseInt(totalJarak * 1000));
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
    updateColumnEnumLength();

    for (let i = 0; i < columnEnumLength; i++) {

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
                    tulisKeterangan(el, ct, KML.closure.length);
                });
            break;}
        }
    }

    //////////////

    sekat(2);

    // HANDHOLE //

    curParDOM = KML.handhole;
    columnEnum = {
        NAMA: 0,
        LATITUDE: 1,
        LONGITUDE: 2,
        HARGA: 3,
        KETERANGAN: 4
    };
    updateColumnEnumLength();

    for (let i = 0; i < columnEnumLength; i++) {

        switch (i) {
            case columnEnum.NAMA: {
                forEachCurPar((el, ct) => {
                    tulisNama('Hand Hole ', el, ct);
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
                    tulisKeterangan(el, ct, KML.handhole.length);
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
    updateColumnEnumLength();

    for (let i = 0; i < columnEnumLength; i++) {

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
                    tulisKeterangan(el, ct, KML.ODP.length);
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
    updateColumnEnumLength();

    for (let i = 0; i < columnEnumLength; i++) {

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
                forEachCurPar(el => {
                    let ukuran;
                    try {
                        ukuran = parseInt(el.querySelector('description').innerHTML[0]);
                    }
                    catch (er) {
                        ukuran = 7;
                    }

                    if (ukuran > 0) output.push(ukuran);
                    else output.push(7);
                });
            break;}
            case columnEnum.HARGA: {
                forEachCurPar((el) => {
                    
                });
            break;}
            case columnEnum.KETERANGAN: {
                forEachCurPar((el, ct) => {
                    tulisKeterangan(el, ct, KML.tiang.length);
                });
            break;}
        }
    }
    
    //////////////

    const copyAll = (obj) => {
        var range = document.createRange();
        range.selectNode(obj);
        window.getSelection().removeAllRanges();
        window.getSelection().addRange(range);
    }

    const outputText = JSON.stringify(output);

    const hasilSection = hasil.querySelector('section');
    hasilSection.innerHTML = outputText;
    hasilSection.addEventListener('click', () => copyAll(hasilSection));

    if(outputText.length > 50000) {
        const partsCount = Math.ceil(outputText.length / 50000);
        let partsTag = 0, partsTag_buff, outputTextParts = [];

        for (let i = 1; i <= partsCount; i++) {
            partsTag_buff = partsTag;

            if (i == partsCount) {
                outputTextParts.push(outputText.slice(partsTag_buff));
            }
            else {
                partsTag += parseInt(outputText.length / partsCount);
                outputTextParts.push(outputText.slice(partsTag_buff, partsTag));
            }
        }

        hasilSection.innerHTML = outputTextParts[0];
        hasilSection.classList.add('section-multi');

        const hasilSections = Array.from(
            {length: partsCount - 1}, () => document.createElement('section')
        );

        hasilSections.forEach((el,ct) => {

            if (ct != partsCount - 2) {
                el.classList.add('section-multi');
            }

            el.innerHTML = outputTextParts[ct+1];
            hasil.appendChild(el);
            el.addEventListener('click', () => copyAll(el));
        });
    }
}

// CARI DATA //

function generateIconName(isPath, eStyle) {

    let iconSource = '', iconName = '';

    for (i of KML.styleMap) {
        if (`#${i.id}` == eStyle) {
            
            const stylePairNormalID = i.querySelector('Pair styleUrl').innerHTML;
            
            for (j of KML.style) {
                if (`#${j.id}` == stylePairNormalID) {
                    
                    if (isPath) {
                        try {
                            iconName = j.querySelector('LineStyle color').innerHTML;
                        }
                        catch (err) {
                            iconName = 'ff000000';
                        }
                    }
                    else {
                        try {
                            iconSource = j.querySelector('IconStyle Icon href').innerHTML;
                        }
                        catch (err) {
                            iconSource = 'https://maps.google.com/mapfiles/kml/pushpin/ylw-pushpin.png';
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
                    }

                    break;
                }
            }
            break;
        }
    }

    return iconName;
}

function cariData() {
    
    for (e of KML.placemark) {

        let iconName, jenis, isRun = true;
        const eStyle = e.querySelector('styleUrl').innerHTML;

        if (e.querySelector('LineString')) {

            let isTanam = false;
            KML.jalur.push(e);
            iconName  = generateIconName(true, eStyle).split('').reverse().join('');

            if (isRun)
            for (i of pathClr.backbone) {
                if (i == iconName) {
                    jenis = 'backbone';
                    isRun = false; break;
                }
            }

            if (isRun)
            for (i of pathClr.tanam) {
                if (i == iconName) {
                    jenis = 'tanam';
                    isRun = false;
                    
                    // set for 'tanam'
                    isTanam = true;
                    KML.jalurTanam.push(e);
                    
                    break;
                }
            }

            if (isRun)
            for (i of pathClr.berbeda) {
                if (i == iconName) {
                    jenis = 'berbeda';
                    isRun = false; break;
                }
            }

            if (isRun) jenis = 'akses';

            KML.styleName.push([eStyle, `#msn_${jenis}`]);
            if (isTanam == false) KML.jalurTanam.push(undefined);
        }
        else {
            
            iconName = generateIconName(false, eStyle);

            if (isRun)
            for (i of tagSgn.tiang) {
                if (i == iconName) {
                    KML.tiang.push(e);
                    jenis = 'tiang';
                    isRun = false; break;
                }
            }

            if (isRun)
            for (i of tagSgn.odp) {
                if (i == iconName) {
                    KML.ODP.push(e);
                    jenis = 'odp';
                    isRun = false; break;
                }
            }

            if (isRun)
            for (i of tagSgn.coilan) {
                if (i == iconName) {
                    KML.coilan.push(e);
                    jenis = 'coilan';
                    isRun = false; break;
                }
            }

            if (isRun)
            for (i of tagSgn.client) {
                if (i == iconName) {
                    KML.client.push(e);
                    jenis = 'client';
                    isRun = false; break;
                }
            }

            if (isRun)
            for (i of tagSgn.pop) {
                if (i == iconName) {
                    KML.POP.push(e);
                    jenis = 'pop';
                    isRun = false; break;
                }
            }

            if (isRun)
            for (i of tagSgn.handhole) {
                if (i == iconName) {
                    KML.handhole.push(e);
                    jenis = 'handhole';
                    isRun = false; break;
                }
            }

            if (isRun) {
                KML.closure.push(e);
                jenis = 'closure';
            }

            KML.styleName.push([eStyle, `#msn_${jenis}`]);
        }
    }
}

//////////////

function proses() {

    const xmlParser = new DOMParser();
    const xmlDoc = xmlParser.parseFromString(XML_TEXT, 'text/xml'); 
    XML_OBJ = xmlDoc.querySelector('Document');

    if (KML.placemark != undefined) {
        setupKML();
        const hasilSections = hasil.querySelectorAll('section');
        hasilSections[0].innerHTML = '';
        hasilSections[0].classList.remove('section-multi');

        // if multi
        if (hasilSections.length > 1) {
            hasilSections.forEach((el, ct) => {
                if (ct > 0) {
                    hasil.removeChild(el);
                }
            });
        }

        unduh.classList.remove('unduh-siap');
    }

    setTimeout(() => {
        KML.placemark = XML_OBJ.querySelectorAll('Placemark');
        KML.style = XML_OBJ.querySelectorAll('Style');
        KML.styleMap = XML_OBJ.querySelectorAll('StyleMap');

        cariData();
        tampilData(); // generates JSON form
        REKONSTRUKSI();
    }, 10);
}

function olahData() {

    // hilangkan petunjuk
    petunjuk.style.display = 'none';

    const [file] = document.querySelector('input[type=file]').files;
    const reader = new FileReader();

    reader.addEventListener("load", () => {

        XML_TEXT = reader.result;
        hasil.classList.add('hasil-berhasil');
        
        proses();

        const inputCard = document.querySelector('.input-card');
        inputCard.classList.add('input-card-selesai');        
        inputCard.querySelector('input').style.display = 'none';
    }, false);

    if (file) {
        reader.readAsText(file);
    }
}


