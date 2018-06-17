export function pasteHtmlAtCaret(html: string, div: HTMLTextAreaElement) {
  div.focus();
  let divOuter = document.createElement('div');
  divOuter.innerHTML = html;
  let img = divOuter.firstChild;
  let sel = window.getSelection();
  let range = sel.getRangeAt(0);
  range.deleteContents();
  // Range.createContextualFragment() would be useful here but is
  // non-standard and not supported in all browsers (IE9, for one)
  let frag = document.createDocumentFragment();
  frag.appendChild(img);
  range.insertNode(frag);
  // Preserve the selection
  range = range.cloneRange();
  range.setStartAfter(img);
  range.collapse(true);
  sel.removeAllRanges();
  sel.addRange(range);
}

export const Utils = {
  videoFiles: {

  },
  previewFiles: {

  },
  imagesFiles: {

  }
};