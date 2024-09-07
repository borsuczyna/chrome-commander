const executeMessage = (action) => {
    chrome.runtime.sendMessage({ isCommanderAction: true, action });
};

let commands = [];
let lastCommandsUsage = [];
let commanderVisible = false;
let commanderFadeOutTimeout = null;
let commanderLastSearchValue = '';
let currentPageZoom = 100/Math.round(window.devicePixelRatio * 100);

const executeCommandByIndex = (index) => {
    markAsRecentlyUsed(index);
    executeMessage(commands[index].name);
}

async function loadLastCommandsUsage() {
    const result = await new Promise((resolve) => {
        chrome.storage.local.get(['lastCommandsUsage'], (result) => {
            resolve(result);
        });
    });

    lastCommandsUsage = result.lastCommandsUsage || [];
}

function betterIncludes(input, search) {
    const normalizedInput = input.toLowerCase();
    const normalizedSearch = search.toLowerCase();
    const searchWords = normalizedSearch.split(/\s+/);

    return searchWords.every(word => normalizedInput.includes(word));
}

function markAsRecentlyUsed(index) {
    if (lastCommandsUsage.includes(index)) {
        lastCommandsUsage = lastCommandsUsage.filter(i => i !== index);
    }

    lastCommandsUsage = [index, ...lastCommandsUsage].slice(0, 10);
    chrome.storage.local.set({ lastCommandsUsage });
}

window.addEventListener('resize', () => {
    const newPageZoom = 100/Math.round(window.devicePixelRatio * 100);
    if (currentPageZoom !== newPageZoom) {
        currentPageZoom = newPageZoom;
        let commanderElement = document.getElementById('__commander');
        commanderElement.remove();
        appendCommanderToBody();
    }
});

function appendCommanderToBody() {
    const commanderElement = document.createElement('div');
    commanderElement.innerHTML = `
        <style>
            #__commander {
                position: fixed;
                z-index: 999999999;
                left: 50%;
                transform: translate(-50%, 0%);
                background-color: #33333366;
                color: white;
                color: white;
                font-family: monospace;
                flex-direction: column;
                display: none;
                animation: __commanderFadeIn 0.3s ease-in-out;
                
                border: ${1 * currentPageZoom}px solid #ffffff33;
                min-width: ${500 * currentPageZoom}px;
                top: ${30 * currentPageZoom}px;
                font-size: ${14 * currentPageZoom}px;
                border-radius: ${6 * currentPageZoom}px;
                padding: ${3 * currentPageZoom}px;
                box-shadow: 0 0 ${8 * currentPageZoom}px #00000099;
                backdrop-filter: blur(${8 * currentPageZoom}px) saturate(10%) invert(30%) brightness(80%) contrast(200%);
                gap: ${3 * currentPageZoom}px;
            }

            #__commander #__items {
                display: flex;
                flex-direction: column;
                gap: ${3 * currentPageZoom}px;
                max-height: ${400 * currentPageZoom}px;
                overflow-y: auto;
                width: 100%;
            }

            #__commander #__items::-webkit-scrollbar {
                width: ${6 * currentPageZoom}px !important;
            }

            #__commander #__items::-webkit-scrollbar-thumb {
                background-color: #ffffff44 !important;
                border-radius: ${3 * currentPageZoom}px !important;
            }

            #__commander #__items::-webkit-scrollbar-track {
                background-color: #ffffff11 !important;
                border-radius: ${3 * currentPageZoom}px !important;
            }

            #__commander #__items::-webkit-scrollbar-track:hover {
                background-color: #ffffff22 !important;
            }

            #__commander .__item-search {
                background-color: #ffffff11;
                color: white;
                font-family: monospace;
                transition: border-color 0.1s;
                
                border: ${1 * currentPageZoom}px solid #ffffff23;
                text-shadow: ${1 * currentPageZoom}px ${1 * currentPageZoom}px ${2 * currentPageZoom}px #00000099;
                padding: ${3 * currentPageZoom}px ${6 * currentPageZoom}px;
                margin-bottom: ${2 * currentPageZoom}px;
                border-radius: ${5 * currentPageZoom}px;
                font-size: ${16 * currentPageZoom}px;
            }

            #__commander .__item-search:focus {
                outline: none;
            }

            #__commander .__item-search::placeholder {
                color: #cccccc;
                text-shadow: ${1 * currentPageZoom}px ${1 * currentPageZoom}px ${2 * currentPageZoom}px #00000099;
            }

            #__commander .__item {
                cursor: pointer;
                background-color: #ffffff03;
                color: #ffffffaa;
                display: flex;
                justify-content: space-between;
                transition: background-color 0.1s, border-color 0.1s, color 0.1s;
                border: ${1 * currentPageZoom}px solid #ffffff11;
                text-shadow: ${1 * currentPageZoom}px ${1 * currentPageZoom}px ${2 * currentPageZoom}px #00000099;
                padding: ${3 * currentPageZoom}px ${6 * currentPageZoom}px;
                border-radius: ${5 * currentPageZoom}px;
            }

            #__commander .__item.active,
            #__commander .__item:hover {
                background-color: #ffffff22;
                border-color: #ffffff44;
                color: #ffffffee;
            }

            #__commander .__item-shortcut {
                display: flex;
                gap: ${5 * currentPageZoom}px;
                align-items: center;
            }

            #__commander .__item-shortcut-key {
                background-color: #ffffff22;
                color: #ffffffaa;
                display: flex;
                justify-content: center;
                align-items: center;
                border: ${1 * currentPageZoom}px solid #ffffff33;
                padding: ${2 * currentPageZoom}px ${4 * currentPageZoom}px;
                border-radius: ${5 * currentPageZoom}px;
                font-size: ${12 * currentPageZoom}px;
                min-width: ${10 * currentPageZoom}px;
            }

            #__commander .__item.hidden {
                display: none;
            }

            @keyframes __commanderFadeIn {
                from {
                    opacity: 0;
                    transform: translate(-50%, -100%);
                }

                to {
                    opacity: 1;
                    transform: translate(-50%, 0%);
                }
            }

            @keyframes __commanderFadeOut {
                from {
                    opacity: 1;
                    transform: translate(-50%, 0%);
                }

                to {
                    opacity: 0;
                    transform: translate(-50%, -100%);
                }
            }
        </style>

        <div id="__commander">
            <input type="text" placeholder="Search..." class="__item-search">
            <div id="__items"></div>
            <div class="__item" id="__no-results-found">No matches found</div>
        </div>
    `;

    document.body.appendChild(commanderElement);
}

function handleCommanderKeyDown(event) {
    let items = document.querySelectorAll('#__commander .__item:not(.hidden)');
    let activeItem = document.querySelector('#__commander .__item.active');
    let currentItemIndex = Array.from(items).findIndex(item => item === activeItem);
    
    function getNextItem() {
        if (currentItemIndex === items.length - 1) {
            return items[0];
        } else {
            return items[currentItemIndex + 1];
        }
    }

    function getPreviousItem() {
        if (currentItemIndex === 0) {
            return items[items.length - 1];
        } else {
            return items[currentItemIndex - 1];
        }
    }

    if (event.key === 'Escape') {
        setCommanderVisible(false);
    } else if (event.key === 'ArrowDown') {
        activeItem.classList.remove('active');
        getNextItem().classList.add('active');
        getNextItem().scrollIntoView({ behavior: 'auto', block: 'nearest', inline: 'nearest' });
    } else if (event.key === 'ArrowUp') {
        activeItem.classList.remove('active');
        getPreviousItem().classList.add('active');
        getPreviousItem().scrollIntoView({ behavior: 'auto', block: 'nearest', inline: 'nearest' });
    } else if (event.key === 'Enter') {
        let index = parseInt(activeItem.getAttribute('data-index'));
        let command = commands[index];
        
        if (command) {
            executeCommandByIndex(index);
            markAsRecentlyUsed(index);
            setCommanderVisible(false);
        }
    } else {
        return;
    }

    event.preventDefault();
}

function handleCommanderClick(event) {
    if (!event.target.closest('#__commander')) {
        setCommanderVisible(false);
    }
}

function focusSearchInput(event) {
    event.target.focus();
}

function renderCommands() {
    let items = document.querySelector('#__commander #__items');
    items.innerHTML = `
        ${commands.map((command, index) => `<div class="__item" data-index="${index}">
            <span>${command.name}</span>

            ${command.shortcut ? `<div class="__item-shortcut">
                ${command.shortcut.map(key => `<span class="__item-shortcut-key">${key}</span>`).join('')}
            </div>` : ''}    
        </div>`).join('')}
    `;

    let itemElements = document.querySelectorAll('#__commander #__items .__item');
    itemElements.forEach(item => {
        item.addEventListener('click', () => {
            let index = parseInt(item.getAttribute('data-index'));
            executeCommandByIndex(index);
            setCommanderVisible(false);
        });
    });

    // sort recently used commands to the top
    let sortedItems = Array.from(itemElements).sort((a, b) => {
        let indexA = parseInt(a.getAttribute('data-index'));
        let indexB = parseInt(b.getAttribute('data-index'));

        let aIsRecentlyUsed = lastCommandsUsage.includes(indexA);
        let bIsRecentlyUsed = lastCommandsUsage.includes(indexB);

        if (aIsRecentlyUsed && !bIsRecentlyUsed) {
            return -1;
        } else if (!aIsRecentlyUsed && bIsRecentlyUsed) {
            return 1;
        } else if (aIsRecentlyUsed && bIsRecentlyUsed) {
            return lastCommandsUsage.indexOf(indexA) - lastCommandsUsage.indexOf(indexB);
        } else {
            return 0;
        }
    });

    sortedItems.forEach((item, index) => {
        items.appendChild(item);
    });
}

function updateSearchResults() {
    if (commanderLastSearchValue === this.value)
        return;

    commanderLastSearchValue = this.value;

    let searchInput = document.querySelector('#__commander .__item-search');
    let searchValue = searchInput.value.toLowerCase();
    let items = document.querySelectorAll('#__commander .__item');

    items.forEach(item => {
        if (item.classList.contains('__item-search'))
            return;

        item.classList.toggle('hidden', !betterIncludes(item.innerText, searchValue));
    });

    let visibleItems = document.querySelectorAll('#__commander .__item:not(.hidden)');
    let firstVisibleItem = visibleItems[0];

    items.forEach(item => {
        item.classList.toggle('active', item === firstVisibleItem);
    });

    if (firstVisibleItem)
        firstVisibleItem.scrollIntoView({ behavior: 'auto', block: 'nearest', inline: 'nearest' });

    let noResultsFound = document.getElementById('__no-results-found');
    noResultsFound.classList.toggle('hidden', visibleItems.length > 0);
}

async function setCommanderVisible(visible) {
    let commanderElement = document.getElementById('__commander');

    if (visible) {
        commanderElement.style.display = 'flex';
        commanderElement.style.animation = '__commanderFadeIn 0.3s ease-in-out';

        if (commanderFadeOutTimeout) {
            clearTimeout(commanderFadeOutTimeout);
        }

        document.addEventListener('keydown', handleCommanderKeyDown);
        document.addEventListener('click', handleCommanderClick);

        // render commands
        await loadLastCommandsUsage();
        renderCommands();

        // make first item active
        let items = document.querySelectorAll('#__commander .__item');
        items.forEach((item, index) => {
            item.classList.toggle('active', index === 0);
        });

        items[0].scrollIntoView({ behavior: 'auto', block: 'nearest', inline: 'nearest' });

        // hide no-results-found
        let noResultsFound = document.getElementById('__no-results-found');
        noResultsFound.classList.add('hidden');

        // focus search input
        let searchInput = document.querySelector('#__commander .__item-search');
        commanderLastSearchValue = '';
        searchInput.focus();
        searchInput.addEventListener('blur', focusSearchInput);
        searchInput.value = '';

        // use all possible events for key input
        searchInput.addEventListener('input', updateSearchResults);
        searchInput.addEventListener('keyup', updateSearchResults);
        searchInput.addEventListener('keypress', updateSearchResults);
    } else {
        commanderElement.style.animation = '__commanderFadeOut 0.2s ease-in-out';
        commanderFadeOutTimeout = setTimeout(() => {
            commanderElement.style.display = 'none';
        }, 200);

        document.removeEventListener('keydown', handleCommanderKeyDown);
        document.removeEventListener('click', handleCommanderClick);

        let searchInput = document.querySelector('#__commander .__item-search');
        searchInput.removeEventListener('blur', focusSearchInput);
        searchInput.removeEventListener('input', updateSearchResults);
        searchInput.removeEventListener('keyup', updateSearchResults);
    }
}

function toggleCommanderVisibility(event) {
    commands = event.detail.commands;
    commanderVisible = !commanderVisible;
    setCommanderVisible(commanderVisible);
}

document.addEventListener("__commanderToggleVisibility", toggleCommanderVisibility);
appendCommanderToBody();
loadLastCommandsUsage();