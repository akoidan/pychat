// Do not edit this file manually. It was generated with "yarn generate-smileys"

export interface SmileVariation {
  alt: string;
  src: typeof import('.png');
}

export interface Smile extends SmileVariation {
  skinVariations?: Record<string, SmileVariation>;
}

export type SmileysStructure = Record<string, Record<string, Smile>>;
export const smileys: SmileysStructure = {

}
