const emojijson = require('emoji-datasource-apple/emoji.json');
let resultingJson = {}
fs = require('fs');

let fileContent = '// Do not edit this file manually. It was generated with "yarn generate-smileys"\n';
emojijson.forEach(e => {
   const varName = `s${e.image.replace(/-/g, '').replace('.png', '')}`;
   let fileName = `emoji-datasource-apple/img/apple/64/${e.image}`;
   if (!fs.existsSync(`./node_modules/${fileName}`)) {
      console.warn(`file ${fileName} is  missing`);
      return
   }
   fileContent += `import ${varName} from '${fileName}';\n`;
   if (!resultingJson[e.category]) {
      resultingJson[e.category] = {}
      console.log("Adding category: " + e.category);
   }
   resultingJson[e.category][hexDecode(e.unified)] = {
      src: '___'+ varName, // add ___ prefix ti img value so it can be replaced on regex later
      alt: e.short_names[0]
   }
   if (e.skin_variations) {
      if (!resultingJson[e.category][hexDecode(e.unified)].skinVariations) {
         resultingJson[e.category][hexDecode(e.unified)].skinVariations = {}
      }
      // add original smile to skin variation
      resultingJson[e.category][hexDecode(e.unified)].skinVariations[hexDecode(e.unified)] = {
         src: '___'+ varName, // add ___ prefix ti img value so it can be replaced on regex later
         alt: e.short_names[0]
      }

      Object.entries(e.skin_variations).forEach(([skinCode, skinValue]) => {

         const innerVarName = `s${skinValue.image.replace(/-/g, '').replace('.png', '')}`;
         let innerFileName = `emoji-datasource-apple/img/apple/64/${skinValue.image}`;
         if (!fs.existsSync(`./node_modules/${innerFileName}`)) {
            console.warn(`file ${innerFileName} is  missing`);
            return
         }
         fileContent += `import ${innerVarName} from '${innerFileName}';\n`;

         resultingJson[e.category][hexDecode(e.unified)].skinVariations[hexDecode(skinValue.unified)] = {
            src:  '___'+ innerVarName,
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

fileContent += `
export interface SmileVariation {
  alt: string;
  src: typeof import('.png');
}

export interface Smile extends SmileVariation {
  skinVariations?: Record<string, SmileVariation>;
}

export type SmileysStructure = Record<string, Record<string, Smile>>;
export const smileys: SmileysStructure = ${smileyData}
`

let fileName = `${__dirname}/src/ts/utils/smileys.ts`;
fs.writeFile(fileName, fileContent, function (err) {
   if (err) return console.error(err);
   console.log(`Finished writing to ${fileName}`);
});
