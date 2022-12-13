const nano = require('nano')('http://admin:Modulo80!@r-mes.ovh:5984/');
const fs = require('fs');

const modifs = nano.use('ordinaires_2');


// Create a function for mapping the objects
async function restructure() {
    let docs = await getDocuments();
    let newDocs = docs.rows.map(doc => {
        let core = doc.doc;
        let pic = core.resource;
        let lien = core.lien ? core.lien : '' ;
        let lyrics = core.lyrics ? core.lyrics : 'Pas de paroles';
        let resourceObj = {
            'use_case': "rmes",
            'pic': pic,
            'lien': lien,
            'lyrics': lyrics,
        }
        if (core.resource) delete core.resource;
        if (core.lien) delete core.lien;
        if (core.lyrics) delete core.lyrics;
        let newDoc = { ...core, 'resource': resourceObj};
        return newDoc;
    });
    return newDocs;
}

// Get all documents with all_doc view
async function getDocuments() {
    const docs = await modifs.list({ include_docs: true });
    return docs;
}

async function updateAll(newDocs) {
    await modifs.bulk({ docs: newDocs});
}

async function main() {
    const newDocs = await restructure();
    let save = {docs: newDocs};
    let saveStr = JSON.stringify(save);
    fs.writeFileSync("save.json",saveStr); // remove line if you don't want a local save
     try {
         console.log(newDocs[0]);
         await updateAll(newDocs);
     }catch(e) {
         console.log(e);
     }

}
main();