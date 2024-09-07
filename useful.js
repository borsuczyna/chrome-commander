function htmlToMarkdown(code) {
    let parser = new DOMParser();
    let doc = parser.parseFromString(code, "text/html");
    let markdown = '';

    function parseElement(element) {
        if (element.nodeType === Node.TEXT_NODE) {
            markdown += element.textContent;
        } else if (element.nodeType === Node.ELEMENT_NODE) {
            let style = window.getComputedStyle(element);

            // skip invisible elements
            if (style.display === 'none' || style.visibility === 'hidden') {
                return;
            }

            // skip script and style elements
            if (element.tagName === 'SCRIPT' || element.tagName === 'STYLE') {
                return;
            }

            if (element.tagName === 'A') {
                markdown += `[${element.textContent}](${element.href})`;
            } else if (element.tagName === 'IMG') {
                markdown += `![${element.alt}](${element.src})`;
            } else if (element.tagName === 'BR') {
                markdown += '\n';
            } else if (element.tagName === 'HR') {
                markdown += '\n---\n';
            } else if (element.tagName === 'P') {
                markdown += '\n\n';
            } else if (element.tagName.match(/H[1-6]/)) {
                let level = parseInt(element.tagName[1]);
                let hash = '#'.repeat(level);
                markdown += `${hash} ${element.textContent}\n\n`;
            } else if (element.tagName === 'UL') {
                markdown += '\n';
                for (let i = 0; i < element.children.length; i++) {
                    markdown += `- ${element.children[i].textContent}\n`;
                }
                markdown += '\n';
            } else if (element.tagName === 'OL') {
                markdown += '\n';
                for (let i = 0; i < element.children.length; i++) {
                    markdown += `${i + 1}. ${element.children[i].textContent}\n`;
                }
                markdown += '\n';
            } else if (element.tagName === 'LI') {
                markdown += `- ${element.textContent}\n`;
            } else if (element.tagName === 'BLOCKQUOTE') {
                markdown += `> ${element.textContent}\n`;
            } else if (element.tagName === 'CODE') {
                markdown += `\`${element.textContent}\``;
            } else if (element.tagName === 'PRE') {
                markdown += '```\n' + element.textContent + '\n```\n';
            } else if (element.tagName === 'STRONG' || element.tagName === 'B' || style.fontWeight === 'bold' || style.fontWeight >= 600) {
                markdown += `**${element.textContent}**`;
            } else if (element.tagName === 'EM' || element.tagName === 'I' || style.fontStyle === 'italic') {
                markdown += `*${element.textContent}*`;
            } else if (element.tagName === 'U' || element.tagName === 'INS' || style.textDecoration === 'underline') {
                markdown += `<u>${element.textContent}</u>`;
            } else if (element.tagName === 'S' || element.tagName === 'STRIKE' || style.textDecoration === 'line-through') {
                markdown += `<s>${element.textContent}</s>`;
            } else if (element.tagName === 'DEL' || element.tagName === 'STRIKE' || style.textDecoration === 'line-through') {
                markdown += `<del>${element.textContent}</del>`;
            } else if (element.tagName === 'A' && element.href) {
                markdown += `[${element.textContent}](${element.href})`;
            } else {
                markdown += element.textContent;
            }
        }

        for (let i = 0; i < element.childNodes.length; i++) {
            parseElement(element.childNodes[i]);
        }
    }

    parseElement(doc.body);

    markdown = markdown.replace(/\n\n\n+/g, '\n\n');
    markdown = markdown.replace(/\s{2,}/g, ' ');
    markdown = markdown.trim();

    return markdown;
}