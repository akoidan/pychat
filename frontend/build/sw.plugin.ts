import {
  OutputBundle,
  Plugin,
  NormalizedOutputOptions,
  OutputChunk
} from "rollup";

export interface PluginOptions {
  swFilePath: string;
  // swValueReplace: string;
}

export function outputManifest({swFilePath}: PluginOptions): Plugin {

  return {
    name: "vite-raw-sw-plugin",
    generateBundle: async function (options: NormalizedOutputOptions, bundle: OutputBundle) {
      const swFile: OutputChunk = Object.values(bundle).find((v) => (v as any).facadeModuleId === swFilePath) as any;
      if (!swFile) {
        throw Error(`${swFilePath} not found in ${JSON.stringify(Object.keys(bundle))}`);
      }
      // Object.values(bundle).filter(v => (v as OutputChunk).facadeModuleId).forEach((v: any) => {
      //   if ((v as OutputChunk).code.indexOf(swValueReplace)) {
      //     (v as OutputChunk).code = (v as OutputChunk).code.replace(swValueReplace, swFile.fileName);
      //   }
      // })

      let swCode = `const serviceWorkerOption = {}; serviceWorkerOption.assets = ${JSON.stringify(Object.keys(bundle))};\n`
      swFile.code = swCode + swFile.code;
    },
  };
}
