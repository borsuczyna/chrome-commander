const commands = [
    // open pages
    {
        name: 'Open new tab',
        shortcut: ['Ctrl', 'T'],
        action: () => chrome.tabs.create({ url: "chrome://newtab" }),
    },
    {
        name: 'Open new window',
        shortcut: ['Ctrl', 'N'],
        action: () => chrome.windows.create({ url: "chrome://newtab" }),
    },
    {
        name: 'Open new incognito window',
        shortcut: ['Ctrl', 'Shift', 'N'],
        action: () => chrome.windows.create({ url: "chrome://newtab", incognito: true }),
    },
    {
        name: 'Open downloads page',
        shortcut: ['Ctrl', 'J'],
        action: () => chrome.tabs.create({ url: "chrome://downloads" }),
    },
    {
        name: 'Open history',
        shortcut: ['Ctrl', 'H'],
        action: () => chrome.tabs.create({ url: "chrome://history" }),
    },
    {
        name: 'Open extensions manager',
        action: () => chrome.tabs.create({ url: "chrome://extensions" }),
    },
    {
        name: 'Open settings',
        action: () => chrome.tabs.create({ url: "chrome://settings" }),
    },
    {
        name: 'Open bookmarks page',
        shortcut: ['Ctrl', 'Shift', 'O'],
        action: () => chrome.tabs.create({ url: "chrome://bookmarks" }),
    },
    {
        name: 'Open passwords manager',
        action: () => chrome.tabs.create({ url: "chrome://settings/passwords" }),
    },
    {
        name: 'Open autofill settings',
        action: () => chrome.tabs.create({ url: "chrome://settings/autofill" }),
    },
    {
        name: 'Open help page',
        shortcut: ['F1'],
        action: () => chrome.tabs.create({ url: "chrome://settings/help" }),
    },
    {
        name: 'Open flags page',
        action: () => chrome.tabs.create({ url: "chrome://flags" }),
    },
    // tabs
    {
        name: 'Reopen recently closed tab',
        action: () => {
            chrome.sessions.getRecentlyClosed((sessions) => {
                let tab = sessions.find((session) => session.tab);
                if (tab) {
                    chrome.sessions.restore(tab.sessionId);
                }
            });
        },
    },
    {
        name: 'Close current tab',
        shortcut: ['Ctrl', 'W'],
        action: () => chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
            if (tabs[0]) {
                chrome.tabs.remove(tabs[0].id);
            }
        }),
    },
        {
        name: 'Close all tabs',
        shortcut: ['Ctrl', 'Shift', 'W'],
        action: () => chrome.tabs.query({}, (tabs) => {
            tabs.forEach((tab) => {
                chrome.tabs.remove(tab.id);
            });

            chrome.tabs.create({ url: "chrome://newtab" });
        }),
    },
    {
        name: 'Close all tabs but current',
        action: () => chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
            chrome.tabs.query({}, (allTabs) => {
                let currentTabId = tabs[0].id;
                allTabs.forEach((tab) => {
                    if (tab.id !== currentTabId) {
                        chrome.tabs.remove(tab.id);
                    }
                });
            });
        }),
    },
    {
        name: 'Close all tabs to the right',
        action: () => chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
            chrome.tabs.query({}, (allTabs) => {
                let currentTabIndex = allTabs.findIndex((tab) => tab.id === tabs[0].id);
                allTabs.slice(currentTabIndex + 1).forEach((tab) => {
                    chrome.tabs.remove(tab.id);
                });
            });
        }),
    },
    {
        name: 'Close all tabs to the left',
        action: () => chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
            chrome.tabs.query({}, (allTabs) => {
                let currentTabIndex = allTabs.findIndex((tab) => tab.id === tabs[0].id);
                allTabs.slice(0, currentTabIndex).forEach((tab) => {
                    chrome.tabs.remove(tab.id);
                });
            });
        }),
    },
    {
        name: 'Close last tab',
        action: () => chrome.tabs.query({}, (tabs) => {
            if (tabs.length > 1) {
                let lastTab = tabs[tabs.length - 1];
                chrome.tabs.remove(lastTab.id);
            }
        }),
    },
    {
        name: 'Close first tab',
        action: () => chrome.tabs.query({}, (tabs) => {
            if (tabs.length > 1) {
                let firstTab = tabs[0];
                chrome.tabs.remove(firstTab.id);
            }
        }),
    },
    // zoom
    {
        name: 'Zoom in',
        shortcut: ['Ctrl', '+'],
        action: () => executeCurrentTabFunction((tab) => {
            chrome.tabs.getZoom(tab.id, (zoomFactor) => {
                chrome.tabs.setZoom(tab.id, zoomFactor + 0.1);
            });
        }),
    },
    {
        name: 'Zoom out',
        shortcut: ['Ctrl', '-'],
        action: () => executeCurrentTabFunction((tab) => {
            chrome.tabs.getZoom(tab.id, (zoomFactor) => {
                chrome.tabs.setZoom(tab.id, zoomFactor - 0.1);
            });
        }),
    },
    {
        name: 'Reset zoom',
        shortcut: ['Ctrl', '0'],
        action: () => executeCurrentTabFunction((tab) => {
            chrome.tabs.setZoom(tab.id, 0);
        }),
    },
    // refresh
    {
        name: 'Refresh',
        shortcut: ['F5'],
        action: () => executeCurrentTabFunction((tab) => {
            chrome.tabs.reload(tab.id);
        }),
    },
    {
        name: 'Hard refresh',
        shortcut: ['Ctrl', 'F5'],
        action: () => executeCurrentTabFunction((tab) => {
            chrome.tabs.reload(tab.id, { bypassCache: true });
        }),
    },
    {
        name: 'Reload all tabs',
        action: () => chrome.tabs.query({}, (tabs) => {
            tabs.forEach((tab) => {
                chrome.tabs.reload(tab.id);
            });
        }),
    },
    // navigation
    {
        name: 'Go back',
        shortcut: ['Alt', 'Left'],
        action: () => {
            chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
                chrome.scripting.executeScript({
                    target: { tabId: tabs[0].id },
                    function: () => history.back(),
                });
            });
        }
    },
    {
        name: 'Go forward',
        shortcut: ['Alt', 'Right'],
        action: () => {
            chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
                chrome.scripting.executeScript({
                    target: { tabId: tabs[0].id },
                    function: () => history.forward(),
                });
            });
        }
    },
    {
        name: 'Go to next tab',
        shortcut: ['Ctrl', 'Tab'],
        action: () => executeCurrentTabFunction((tab) => {
            chrome.tabs.query({ currentWindow: true }, (tabs) => {
                let currentTabIndex = tabs.findIndex((t) => t.id === tab.id);
                let nextTab = tabs[currentTabIndex + 1] || tabs[0];
                chrome.tabs.update(nextTab.id, { active: true });
            });
        }),
    },
    {
        name: 'Go to previous tab',
        shortcut: ['Ctrl', 'Shift', 'Tab'],
        action: () => executeCurrentTabFunction((tab) => {
            chrome.tabs.query({ currentWindow: true }, (tabs) => {
                let currentTabIndex = tabs.findIndex((t) => t.id === tab.id);
                let previousTab = tabs[currentTabIndex - 1] || tabs[tabs.length - 1];
                chrome.tabs.update(previousTab.id, { active: true });
            });
        }),
    },
    {
        name: 'Go to first tab',
        action: () => chrome.tabs.query({ currentWindow: true }, (tabs) => {
            chrome.tabs.update(tabs[0].id, { active: true });
        }),
    },
    {
        name: 'Go to last tab',
        action: () => chrome.tabs.query({ currentWindow: true }, (tabs) => {
            chrome.tabs.update(tabs[tabs.length - 1].id, { active: true });
        }),
    },
    // extensions
    {
        name: 'Reload extensions',
        action: () => {
            chrome.runtime.reload();
        },
    },
    // tab options
    {
        name: 'Duplicate tab',
        action: () => executeCurrentTabFunction((tab) => {
            chrome.tabs.duplicate(tab.id);
        }),
    },
    {
        name: 'Pin tab',
        action: () => executeCurrentTabFunction((tab) => {
            chrome.tabs.update(tab.id, { pinned: true });
        }),
    },
    {
        name: 'Unpin tab',
        action: () => executeCurrentTabFunction((tab) => {
            chrome.tabs.update(tab.id, { pinned: false });
        }),
    },
    {
        name: 'Mute tab',
        action: () => executeCurrentTabFunction((tab) => {
            chrome.tabs.update(tab.id, { muted: true });
        }),
    },
    {
        name: 'Unmute tab',
        action: () => executeCurrentTabFunction((tab) => {
            chrome.tabs.update(tab.id, { muted: false });
        }),
    },
    {
        name: 'Move tab to new window',
        action: () => executeCurrentTabFunction((tab) => {
            chrome.windows.create({ tabId: tab.id });
        }),
    },
    // page options
    {
        name: 'Print page',
        shortcut: ['Ctrl', 'P'],
        action: () => executeCurrentTabFunction((tab) => {
            chrome.scripting.executeScript({
                target: { tabId: tab.id },
                function: () => window.print(),
            });
        }),
    },
    // scroll
    {
        name: 'Scroll to top',
        shortcut: ['Home'],
        action: () => executeCurrentTabFunction((tab) => {
            chrome.scripting.executeScript({
                target: { tabId: tab.id },
                function: () => window.scrollTo(0, 0),
            });
        }),
    },
    {
        name: 'Scroll to bottom',
        shortcut: ['End'],
        action: () => executeCurrentTabFunction((tab) => {
            chrome.scripting.executeScript({
                target: { tabId: tab.id },
                function: () => window.scrollTo(0, document.body.scrollHeight),
            });
        }),
    },
    {
        name: 'Scroll up',
        shortcut: ['PageUp'],
        action: () => executeCurrentTabFunction((tab) => {
            chrome.scripting.executeScript({
                target: { tabId: tab.id },
                function: () => window.scrollBy(0, -window.innerHeight),
            });
        }),
    },
    {
        name: 'Scroll down',
        shortcut: ['PageDown'],
        action: () => executeCurrentTabFunction((tab) => {
            chrome.scripting.executeScript({
                target: { tabId: tab.id },
                function: () => window.scrollBy(0, window.innerHeight),
            });
        }),
    },
    {
        name: 'Scroll left',
        action: () => executeCurrentTabFunction((tab) => {
            chrome.scripting.executeScript({
                target: { tabId: tab.id },
                function: () => window.scrollBy(-window.innerWidth, 0),
            });
        }),
    },
    {
        name: 'Scroll right',
        action: () => executeCurrentTabFunction((tab) => {
            chrome.scripting.executeScript({
                target: { tabId: tab.id },
                function: () => window.scrollBy(window.innerWidth, 0),
            });
        }),
    },
    // javascript
    {
        name: 'Enable JavaScript',
        action: () => executeCurrentTabFunction((tab) => {
            chrome.contentSettings.javascript.set({ primaryPattern: "<all_urls>", setting: "allow" });
        }),
    },
    {
        name: 'Disable JavaScript',
        action: () => executeCurrentTabFunction((tab) => {
            chrome.contentSettings.javascript.set({ primaryPattern: "<all_urls>", setting: "block" });
        }),
    },
    // cookies
    {
        name: 'Enable cookies',
        action: () => executeCurrentTabFunction((tab) => {
            chrome.contentSettings.cookies.set({ primaryPattern: "<all_urls>", setting: "allow" });
        }),
    },
    {
        name: 'Disable cookies',
        action: () => executeCurrentTabFunction((tab) => {
            chrome.contentSettings.cookies.set({ primaryPattern: "<all_urls>", setting: "block" });
        }),
    },
    {
        name: 'Clear page cookies',
        action: () => executeCurrentTabFunction((tab) => {
            chrome.cookies.getAll({ domain: tab.url }, (cookies) => {
                cookies.forEach((cookie) => {
                    chrome.cookies.remove({ url: tab.url, name: cookie.name });
                });
            });
        }),
    },
    {
        name: 'Clear all cookies',
        action: async () => {
            let response = await askPrompt("Are you sure you want to clear all cookies? (yes/no)");
            if (response && response.toLowerCase() === "yes") {
                chrome.cookies.getAll({}, (cookies) => {
                    cookies.forEach((cookie) => {
                        chrome.cookies.remove({ url: cookie.secure ? "https://" : "http://" + cookie.domain + cookie.path, name: cookie.name });
                    });
                });
            }
        }
    },
    // cache
    {
        name: 'Clear cache',
        action: () => chrome.browsingData.remove({ since: 0 }, { cache: true }),
    },
    // local storage
    {
        name: 'Clear local storage',
        action: () => executeCurrentTabFunction((tab) => {
            chrome.scripting.executeScript({
                target: { tabId: tab.id },
                function: () => localStorage.clear(),
            });
        }),
    },
    // session storage
    {
        name: 'Clear session storage',
        action: () => executeCurrentTabFunction((tab) => {
            chrome.scripting.executeScript({
                target: { tabId: tab.id },
                function: () => sessionStorage.clear(),
            });
        }),
    },
    // notifications
    {
        name: 'Clear notifications',
        action: () => chrome.notifications.getAll((notifications) => {
            Object.keys(notifications).forEach((id) => {
                chrome.notifications.clear(id);
            });
        }),
    },
    // media
    {
        name: 'Mute all tabs',
        action: () => chrome.tabs.query({}, (tabs) => {
            tabs.forEach((tab) => {
                chrome.tabs.update(tab.id, { muted: true });
            });
        }),
    },
    {
        name: 'Unmute all tabs',
        action: () => chrome.tabs.query({}, (tabs) => {
            tabs.forEach((tab) => {
                chrome.tabs.update(tab.id, { muted: false });
            });
        }),
    },
    {
        name: 'Play all media',
        action: () => chrome.tabs.query({}, (tabs) => {
            tabs.forEach((tab) => {
                chrome.scripting.executeScript({
                    target: { tabId: tab.id },
                    function: () => {
                        let media = document.querySelectorAll("video, audio");
                        media.forEach(m => m.play());
                    }
                });
            });
        }),
    },
    {
        name: 'Pause all media',
        action: () => chrome.tabs.query({}, (tabs) => {
            tabs.forEach((tab) => {
                chrome.scripting.executeScript({
                    target: { tabId: tab.id },
                    function: () => {
                        let media = document.querySelectorAll("video, audio");
                        media.forEach(m => m.pause());
                    }
                });
            });
        }),
    },
    // window options
    {
        name: 'Minimize window',
        action: () => chrome.windows.getCurrent((window) => {
            chrome.windows.update(window.id, { state: "minimized" });
        }),
    },
    {
        name: 'Maximize window',
        action: () => chrome.windows.getCurrent((window) => {
            chrome.windows.update(window.id, { state: "maximized" });
        }),
    },
    {
        name: 'Restore window',
        action: () => chrome.windows.getCurrent((window) => {
            chrome.windows.update(window.id, { state: "normal" });
        }),
    },
    {
        name: 'Close window',
        action: () => chrome.windows.getCurrent((window) => {
            chrome.windows.remove(window.id);
        }),
    },
    // history
    {
        name: 'Clear history',
        action: () => chrome.browsingData.remove({ since: 0 }, { history: true }),
    },
    // bookmarks
    {
        name: 'Bookmark current page',
        shortcut: ['Ctrl', 'D'],
        action: () => chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
            chrome.bookmarks.create({ title: tabs[0].title, url: tabs[0].url });
        }),
    },
    {
        name: 'Remove bookmark',
        action: () => chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
            chrome.bookmarks.search({ url: tabs[0].url }, (bookmarks) => {
                if (bookmarks.length > 0) {
                    chrome.bookmarks.remove(bookmarks[0].id);
                }
            });
        }),
    },
    // search
    {
        name: 'Search with Google',
        shortcut: ['Ctrl', 'K'],
        action: async () => {
            chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
                chrome.scripting.executeScript({
                    target: { tabId: tabs[0].id },
                    function: () => {
                        let search = window.prompt("Search with Google", "");
                        if (search) {
                            window.location.href = `https://www.google.com/search?q=${search}`;
                        }
                    }
                });
            });
        },
    },
    {
        name: 'Search with DuckDuckGo',
        action: async () => {
            chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
                chrome.scripting.executeScript({
                    target: { tabId: tabs[0].id },
                    function: () => {
                        let search = window.prompt("Search with DuckDuckGo", "");
                        if (search) {
                            window.location.href = `https://duckduckgo.com/?q=${search}`;
                        }
                    }
                });
            });
        },
    },
    {
        name: 'Search with Bing',
        action: async () => {
            chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
                chrome.scripting.executeScript({
                    target: { tabId: tabs[0].id },
                    function: () => {
                        let search = window.prompt("Search with Bing", "");
                        if (search) {
                            window.location.href = `https://www.bing.com/search?q=${search}`;
                        }
                    }
                });
            });
        },
    },
    {
        name: 'Search with YouTube',
        action: async () => {
            chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
                chrome.scripting.executeScript({
                    target: { tabId: tabs[0].id },
                    function: () => {
                        let search = window.prompt("Search with YouTube", "");
                        if (search) {
                            window.location.href = `https://www.youtube.com/results?search_query=${search}`;
                        }
                    }
                });
            });
        },
    },
    // other
    {
        name: 'Copy URL',
        shortcut: ['Ctrl', 'C'],
        action: () => executeCurrentTabFunction((tab) => {
            setClipboard(tab.url);
        }),
    },
    {
        name: 'Copy page title',
        action: () => executeCurrentTabFunction((tab) => {
            setClipboard(tab.title);
        }),
    },
    {
        name: 'Copy page as Markdown',
        action: () => executeCurrentTabFunction((tab) => {
            setClipboard(`[${tab.title}](${tab.url})`);
        }),
    },
    {
        name: 'Copy page as HTML',
        action: () => executeCurrentTabFunction((tab) => {
            setClipboard(`<a href="${tab.url}">${tab.title}</a>`);
        }),
    },
    {
        name: 'Copy page as JSON',
        action: () => executeCurrentTabFunction((tab) => {
            setClipboard(JSON.stringify({ title: tab.title, url: tab.url }));
        }),
    },
    {
        name: 'Copy page as XML',
        action: () => executeCurrentTabFunction((tab) => {
            setClipboard(`<page><title>${tab.title}</title><url>${tab.url}</url></page>`);
        }),
    },
    {
        name: 'Copy page as CSV',
        action: () => executeCurrentTabFunction((tab) => {
            setClipboard(`title,url\n${tab.title},${tab.url}`);
        }),
    },
    {
        name: 'Copy page as QR code',
        action: async () => executeCurrentTabFunction(async (tab) => {
            let qrCodeUrl = `https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=${tab.url}`;
            setClipboard(qrCodeUrl);
        }),
    },
    {
        name: 'Show page as QR code',
        action: () => executeCurrentTabFunction((tab) => {
            let qrCodeUrl = `https://api.qrserver.com/v1/create-qr-code/?size=400x400&data=${tab.url}`;
            chrome.tabs.create({ url: qrCodeUrl });
        }),
    },
    // copying page source
    {
        name: 'Copy page source',
        action: () => executeCurrentTabFunction((tab) => {
            chrome.scripting.executeScript({
                target: { tabId: tab.id },
                function: () => {
                    let source = document.documentElement.outerHTML;
                    navigator.clipboard.writeText(source);
                }
            });
        }),
    },
    {
        name: 'Copy page source as Markdown',
        action: () => executeCurrentTabFunction((tab) => {
            chrome.scripting.executeScript({
                target: { tabId: tab.id },
                function: () => {
                    markdown = htmlToMarkdown(document.documentElement.outerHTML);
                    navigator.clipboard.writeText(markdown);
                }
            });
        }),
    },
    {
        name: 'View page source',
        action: () => executeCurrentTabFunction((tab) => {
            chrome.tabs.create({ url: `view-source:${tab.url}` });
        }),
    },
    // bypass ad
    {
        name: 'Skip ad (bypass.vip)',
        action: async () => {
            chrome.tabs.query({ active: true, currentWindow: true }, async (tabs) => {
                let url = tabs[0].url;
                let apiUrl = `https://api.bypass.vip/bypass?url=${url}`;
                let response = await fetch(apiUrl);
                let data = await response.json();

                if (data.status === "success") {
                    chrome.tabs.update(tabs[0].id, { url: data.result });
                } else {
                    showAlert(data.message);
                }
            });
        }
    },
    {
        name: 'Skip all ads links on page and copy to clipboard (bypass.vip)',
        action: async () => {
            bypassAllLinksOnPage(false);
        }
    },
    {
        name: 'Skip all ads links on page and open in new tab (bypass.vip)',
        action: async () => {
            bypassAllLinksOnPage(true);
        }
    },
    // AI
    {
        name: 'Ask ChatGPT',
        action: async () => {
            let prompt = await askPrompt("Ask ChatGPT anything");
            if (!prompt || prompt.trim() === "") return;

            chrome.tabs.query({ active: true, currentWindow: true }, async (tabs) => {
                let chatgptUrl = `https://chatgpt.com/?q=${prompt}`;
                chrome.tabs.update(tabs[0].id, { url: chatgptUrl });
            });
        }
    },
    {
        name: 'Ask Copilot (BingAI)',
        action: async () => {
            let prompt = await askPrompt("Ask Copilot anything");
            if (!prompt || prompt.trim() === "") return;

            chrome.tabs.query({ active: true, currentWindow: true }, async (tabs) => {
                let copilotUrl = `https://www.bing.com/chat?sendquery=1&q=${prompt}&form=HECODX`;
                chrome.tabs.update(tabs[0].id, { url: copilotUrl });
            });
        }
    },
    {
        name: 'Generate image with Copilot (BingAI)',
        action: async () => {
            let prompt = await askPrompt("Generate image with Copilot");
            if (!prompt || prompt.trim() === "") return;
            prompt = `Generate an image of ${prompt}`;

            chrome.tabs.query({ active: true, currentWindow: true }, async (tabs) => {
                let copilotUrl = `https://www.bing.com/chat?sendquery=1&q=${prompt}&form=HECODX`;
                chrome.tabs.update(tabs[0].id, { url: copilotUrl });
            });
        }
    },
];

function bypassAllLinksOnPage(openInNewTab) {
    chrome.tabs.query({ active: true, currentWindow: true }, async (tabs) => {
        let matches = [
            /https:\/\/linkvertise\.com\/\d+\/.*/g,
            /https:\/\/link-to\.net\/\d+\/.*/g,
            /https:\/\/direct-link\.net\/\d+\/.*/g,
            /https:\/\/link-target\.net\/\d+\/.*/g,
            /https:\/\/link-hub\.net\/\d+\/.*/g,
            /https:\/\/link-center\.net\/\d+\/.*/g,
        ];

        let tab = tabs[0];
        let bypassedUrls = [];

        // find all links on page
        let tabSource = (await chrome.scripting.executeScript({
            target: { tabId: tab.id },
            function: () => document.documentElement.outerHTML
        }))[0].result;

        let aTags = tabSource.match(/<a[^>]*>.*?<\/a>/g).map(a => a.match(/<a[^>]*>.*?<\/a>/)[0]);
        let links = aTags.map(a => a.match(/href="([^"]*)"/)[1]);

        // filter links
        links = links.filter(link => matches.some(m => m.test(link)));

        // bypass links
        for (let link of links) {
            try {
                let apiUrl = `https://api.bypass.vip/bypass?url=${link}`;
                let response = await fetch(apiUrl);
                let data = await response.json();

                if (data.status === "success") {
                    bypassedUrls.push(data.result);
                }

                await new Promise(resolve => setTimeout(resolve, 200));
            } catch (error) {
                console.error(error);
            }
        }

        if (openInNewTab) {
            bypassedUrls.forEach(url => chrome.tabs.create({ url: url }));
        } else {
            setClipboard(bypassedUrls.join("\n"));
            showAlert(`${bypassedUrls.length} links bypassed and copied to clipboard`);
        }
    });
}

function showAlert(message) {
    chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
        chrome.scripting.executeScript({
            target: { tabId: tabs[0].id },
            function: (message) => {
                alert(message);
            },
            args: [message]
        });
    });
}

async function askPrompt(message) {
    return new Promise((resolve) => {
        chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
            chrome.scripting.executeScript({
                target: { tabId: tabs[0].id },
                function: (message) => {
                    return window.prompt(message);
                },
                args: [message]
            }, (response) => {
                resolve(response[0].result);
            });
        });
    });
}

function setClipboard(text) {
    chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
        chrome.scripting.executeScript({
            target: { tabId: tabs[0].id },
            function: (text) => {
                navigator.clipboard.writeText(text);
            },
            args: [text]
        });
    });
}

function executeCurrentTabFunction(func) {
    chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
        if (tabs[0]) {
            func(tabs[0]);
        }
    });
}

chrome.commands.onCommand.addListener((command) => {
    if (command === "toggle-visibility") {
        chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
            if (tabs[0].url.startsWith("chrome://")) {
                return;
            }

            chrome.scripting.executeScript({
                target: { tabId: tabs[0].id },
                function: toggleCommanderVisibility,
                args: [commands]
            });
        });
    }
});

chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
    if (!message.isCommanderAction)
        return;

    // let command = commands[message.action];
    let command = commands.find(c => c.name === message.action)?.action;
    if (command) {
        command();
    } else {
        console.error(`Command "${message.action}" not found`);
    }
});


function toggleCommanderVisibility(commands) {
    const event = new CustomEvent("__commanderToggleVisibility", {
        detail: {
            commands: commands,
        }
    });
    document.dispatchEvent(event);
}