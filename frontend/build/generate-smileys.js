const emojijson = require('emoji-datasource-apple/emoji.json');
let resultingJson = {}
fs = require('fs');


emojijson.forEach(e => {

   let fileName = `emoji-datasource-apple/img/apple/64/${e.image}`;
   if (!fs.existsSync(`../node_modules/${fileName}`)) {
      console.warn(`file ${fileName} is  missing`);
      return
   }

   if (!resultingJson[e.category]) {
      resultingJson[e.category] = {}
      console.log("Adding category: " + e.category);
   }
   resultingJson[e.category][hexDecode(e.unified)] = {
      src: e.image, // add ___ prefix ti img value so it can be replaced on regex later
      alt: e.short_names[0]
   }
   if (e.skin_variations) {
      if (!resultingJson[e.category][hexDecode(e.unified)].skinVariations) {
         resultingJson[e.category][hexDecode(e.unified)].skinVariations = {}
      }
      Object.entries(e.skin_variations).forEach(([skinCode, skinValue]) => {

         let innerFileName = `emoji-datasource-apple/img/apple/64/${skinValue.image}`;
         if (!fs.existsSync(`../node_modules/${innerFileName}`)) {
            console.warn(`file ${innerFileName} is  missing`);
            return
         }

         resultingJson[e.category][hexDecode(e.unified)].skinVariations[hexDecode(skinValue.unified)] = {
            src:  skinValue.image,
            alt: e.short_names[0]
         }
      })

   }
});

function hexDecode(v){
    return '---' + v.split('-').map( a => {
       const encodedString = eval(`String.fromCodePoint('0x${a}')`);
       return encodedString.split('').map((a, i) => a.charCodeAt(0).toString(16).padStart(4, '0')).join('---');
    }).join('---');
}

const preparedJson = {
   'Smileys': resultingJson['Smileys & Emotion'],
   'People': resultingJson['People & Body'],
   'Nature': resultingJson['Animals & Nature'],
   'Activity': resultingJson['Activities'],
   'Travel & Places': resultingJson['Travel & Places'],
   'Objects': resultingJson['Objects'],
   'Flags': resultingJson['Flags'],
   'Symbols': resultingJson['Symbols'],
}
let smileyData = JSON.stringify(preparedJson, null, 2);
smileyData = smileyData.replace(/"___((\w|-)+)"/g, '$1')
smileyData =  smileyData.replace(/---/g, '\\u')


let fileName = `${__dirname}/../src/assets/smileys.json`;
fs.writeFile(fileName, smileyData, function (err) {
   if (err) return console.error(err);
   console.log(`Finished writing to ${fileName}`);
});
