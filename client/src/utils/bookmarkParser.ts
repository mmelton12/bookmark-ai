interface ParsedBookmark {
  title: string;
  url: string;
  dateAdded?: Date;
  folder?: string;
}

export const parseBookmarkHTML = (html: string): ParsedBookmark[] => {
  const parser = new DOMParser();
  const doc = parser.parseFromString(html, 'text/html');
  const bookmarks: ParsedBookmark[] = [];
  let currentFolder = '';

  const processNode = (node: Element) => {
    if (node.tagName === 'DT') {
      const anchor = node.querySelector('A');
      if (anchor) {
        const bookmark: ParsedBookmark = {
          title: anchor.textContent || '',
          url: anchor.getAttribute('href') || '',
          dateAdded: anchor.getAttribute('add_date') 
            ? new Date(parseInt(anchor.getAttribute('add_date') || '0') * 1000)
            : undefined,
        };
        if (currentFolder) {
          bookmark.folder = currentFolder;
        }
        bookmarks.push(bookmark);
      }
    } else if (node.tagName === 'H3') {
      currentFolder = node.textContent || '';
    } else if (node.tagName === 'DL') {
      const prevFolder = currentFolder;
      Array.from(node.children).forEach(processNode);
      currentFolder = prevFolder;
    }
  };

  const dlElements = doc.getElementsByTagName('DL');
  if (dlElements.length > 0) {
    Array.from(dlElements[0].children).forEach(processNode);
  }

  return bookmarks;
};
