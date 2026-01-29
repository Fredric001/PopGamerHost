const fs = require('fs-extra');
const path = require('path');

/**
 * Combines HTML, CSS, and JS strings into a single HTML string.
 * @param {string} html - The HTML content
 * @param {string} css - The CSS content (optional)
 * @param {string} js - The JS content (optional)
 * @returns {string} - The combined HTML string
 */
function combineFiles(html, css, js) {
    let htmlContent = html || '';

    if (css && css.trim()) {
        const styleTag = `<style>\n${css}\n</style>`;
        // Insert before </head> or <body> if </head> not found
        if (htmlContent.includes('</head>')) {
            htmlContent = htmlContent.replace('</head>', `${styleTag}\n</head>`);
        } else if (htmlContent.includes('<body>')) {
            htmlContent = htmlContent.replace('<body>', `${styleTag}\n<body>`);
        } else {
            // If basically empty or just a fragment, append
             htmlContent = `${styleTag}\n${htmlContent}`;
        }
    }

    if (js && js.trim()) {
        const scriptTag = `<script>\n${js}\n</script>`;
        // Insert before </body>
        if (htmlContent.includes('</body>')) {
            htmlContent = htmlContent.replace('</body>', `${scriptTag}\n</body>`);
        } else {
            htmlContent += `\n${scriptTag}`;
        }
    }

    return htmlContent;
}

module.exports = { combineFiles };
