import {setupPopovers} from './popover.js';
import {isElementVisible, throttledDebounce} from './utils.js';

async function fetchPageContent(pageData) {
    // TODO: handle non 200 status codes/time outs
    // TODO: add retries
    const response = await fetch(`${pageData.baseURL}/api/pages/${pageData.slug}/content/`);
    const content = await response.text();

    return content;
}

function setupCarousels() {
    const carouselElements = document.getElementsByClassName("carousel-container");

    if (carouselElements.length == 0) {
        return;
    }

    for (let i = 0; i < carouselElements.length; i++) {
        const carousel = carouselElements[i];
        carousel.classList.add("show-right-cutoff");
        const itemsContainer = carousel.getElementsByClassName("carousel-items-container")[0];

        const determineSideCutoffs = () => {
            if (itemsContainer.scrollLeft != 0) {
                carousel.classList.add("show-left-cutoff");
            } else {
                carousel.classList.remove("show-left-cutoff");
            }

            if (Math.ceil(itemsContainer.scrollLeft) + itemsContainer.clientWidth < itemsContainer.scrollWidth) {
                carousel.classList.add("show-right-cutoff");
            } else {
                carousel.classList.remove("show-right-cutoff");
            }
        }

        const determineSideCutoffsRateLimited = throttledDebounce(determineSideCutoffs, 20, 100);

        itemsContainer.addEventListener("scroll", determineSideCutoffsRateLimited);
        window.addEventListener("resize", determineSideCutoffsRateLimited);

        afterContentReady(determineSideCutoffs);
    }
}

const minuteInSeconds = 60;
const hourInSeconds = minuteInSeconds * 60;
const dayInSeconds = hourInSeconds * 24;
const monthInSeconds = dayInSeconds * 30;
const yearInSeconds = monthInSeconds * 12;

function relativeTimeSince(timestamp) {
    const delta = Math.round((Date.now() / 1000) - timestamp);

    if (delta < minuteInSeconds) {
        return "1m";
    }
    if (delta < hourInSeconds) {
        return Math.floor(delta / minuteInSeconds) + "m";
    }
    if (delta < dayInSeconds) {
        return Math.floor(delta / hourInSeconds) + "h";
    }
    if (delta < monthInSeconds) {
        return Math.floor(delta / dayInSeconds) + "d";
    }
    if (delta < yearInSeconds) {
        return Math.floor(delta / monthInSeconds) + "mo";
    }

    return Math.floor(delta / yearInSeconds) + "y";
}

function updateRelativeTimeForElements(elements) {
    for (let i = 0; i < elements.length; i++) {
        const element = elements[i];
        const timestamp = element.dataset.dynamicRelativeTime;

        if (timestamp === undefined)
            continue

        element.textContent = relativeTimeSince(timestamp);
    }
}

function setupSearchBoxes() {
    // 限制搜索记录的长度

    const searchWidgets = document.getElementsByClassName("search");
    // let container = document.querySelector('.search-engines');
    // function addSearchEngineItem() {
    //     isSearchEnginesMenu = true;
    //     // 渲染搜索引擎选项
    //     engines.forEach(engine => {
    //         let newItem = document.createElement('div');
    //         newItem.classList.add('search-engine-item');
    //         let img = document.createElement('img');
    //         img.src = engine.icon; // 假设这是第二张图片的路径
    //         img.alt = engine.name;
    //         // 将图片和文本添加到新的项中
    //         newItem.appendChild(img);
    //         // 将新的项添加到容器中
    //
    //         newItem.addEventListener('click', () => {
    //             // 设置当前选中的搜索引擎
    //             localStorage.setItem('selectedSearchEngine', engine.url)
    //             updateIconImg.src = engine.icon;
    //             isSearchEnginesMenu = false;
    //             // 聚焦到输入框
    //             searchInput.focus();
    //             deleteSearchEngineItem()
    //
    //         });
    //         container.appendChild(newItem);
    //     });
    // }

    // 当没有search组件的时候
    if (searchWidgets.length === 0) {
        return;
    }

    const searchEngines = document.getElementById('search-engines');
    const searchIcon = document.getElementById('search-icon');
    const searchAction = document.getElementById('search-action');
    const searchInput = document.getElementById('search-input');

    console.log(searchInput.value,searchInput.value.length,"start")

    const searchHistory = document.getElementById('search-history');
    // 获取图片元素
    const updateIconImg = document.querySelector('#search-icon img');
    let defaultSearchUrl = ""
    // 定义搜索引擎列表
    // let engines = [
    // ];

    // if (searchWidgets.length > 0) {
    //     const searchUrlTemplate = localStorage.getItem("selectedSearchEngine")
    //     const bangs = searchWidgets[0].querySelectorAll(".search-bangs > input");
    //     for (let j = 0; j < bangs.length; j++) {
    //         const bang = bangs[j];
    //         if (bang.dataset.url === searchUrlTemplate) {
    //             updateIconImg.src = bang.dataset.icon
    //         }
    //         engines.push({name: bang.dataset.title, url: bang.dataset.url, icon: bang.dataset.icon})
    //     }
    // }


    let isSearchEnginesMenu = false; // 用于跟踪菜单是否可见
    // 点击G图标显示菜单
    searchIcon.addEventListener('click', () => {
        if (isSearchEnginesMenu) {
            isSearchEnginesMenu = false;
            deleteSearchEngineItem()
            return;
        }

        isSearchEnginesMenu = true;
        searchEngines.style.display = 'flex'
    });




    // 获取所有具有search-engine-item类的元素
    let items = document.querySelectorAll('.search-engine-item');

    // 为每个元素添加点击事件监听器
    items.forEach(function(item) {
        item.addEventListener('click', function() {
            isSearchEnginesMenu = true;
            localStorage.setItem('selectedSearchEngine', item.dataset.url)
            localStorage.setItem('SelectTitle', item.dataset.title)
            updateIconImg.src = item.dataset.icon;
            // 聚焦到输入框
            searchInput.focus();
            deleteSearchEngineItem()
        });
    });

    items.forEach(function (item) {
        // 获取历史选择的搜索引擎
        let searchTitle = localStorage.getItem("SelectTitle")
        if (searchTitle !== "" && searchTitle === item.dataset.title) {
            item.dispatchEvent(new Event('click'))
            isSearchEnginesMenu = false;
            console.log('isSearchEnginesMenu', isSearchEnginesMenu)

        }
    });

    function deleteSearchEngineItem() {
        searchEngines.style.display = 'none';
    }

    // 点击其他地方隐藏菜单
    document.addEventListener('click', (event) => {
        // document.body.classList.add('click-animated');

        // if(searchEngines.contains(event.target)){
        //     return
        // }
        //
        // if (!searchIcon.contains(event.target)) {
        //     isSearchEnginesMenu = false;
        //     deleteSearchEngineItem()
        //     searchInput.focus();
        // }

    });

    // 实际执行一次
    for (let i = 0; i < searchWidgets.length; i++) {
        const widget = searchWidgets[i];
        defaultSearchUrl = widget.dataset.defaultSearchUrl;
        const newTab = widget.dataset.newTab === "true";
        const inputElement = widget.getElementsByClassName("search-input")[0];
        const bangElement = widget.getElementsByClassName("search-bang")[0];
        const bangs = widget.querySelectorAll(".search-bangs > input");
        const bangsMap = {};
        const kbdElement = widget.getElementsByTagName("kbd")[0];
        let currentBang = null;

        for (let j = 0; j < bangs.length; j++) {
            const bang = bangs[j];
            bangsMap[bang.dataset.shortcut] = bang;
        }

        const handleKeyDown = (event) => {
            if (event.key === "Escape") {
                inputElement.blur();
                return;
            }

            if (event.key === "Enter") {
                if (!event.shiftKey) {
                    event.preventDefault(); // 阻止默认的换行行为
                }

                const input = inputElement.value.trim();
                let query;
                let searchUrlTemplate;

                if (currentBang != null) {
                    // 判断是否有选中的搜索引擎
                    query = input.slice(currentBang.dataset.shortcut.length + 1);
                    searchUrlTemplate = currentBang.dataset.url;
                } else {
                    query = input;
                    searchUrlTemplate = localStorage.getItem("selectedSearchEngine")
                    if (searchUrlTemplate == null || searchUrlTemplate === "") {
                        searchUrlTemplate = defaultSearchUrl;
                    }
                }

                if (query.length == 0 && currentBang == null) {
                    return;
                }

                const url = searchUrlTemplate.replace("!QUERY!", encodeURIComponent(query));
                actionSearch(query, true, url)
                // saveSearch(query, url)
                // if (newTab && !event.ctrlKey || !newTab && event.ctrlKey) {
                //     window.open(url, '_blank').focus();
                // } else {
                //     window.location.href = url;
                // }

                return;
            }
        };

        // const changeCurrentBang = (bang) => {
        //     console.log(bang)
        //     currentBang = bang;
        //     bangElement.textContent = bang != null ? bang.dataset.title : "";
        // }
        //
        // const handleInput = (event) => {
        //     const value = event.target.value.trim();
        //     if (value in bangsMap) {
        //         changeCurrentBang(bangsMap[value]);
        //         return;
        //     }
        //
        //     const words = value.split(" ");
        //     if (words.length >= 2 && words[0] in bangsMap) {
        //         changeCurrentBang(bangsMap[words[0]]);
        //         return;
        //     }
        //
        //     changeCurrentBang(null);
        // };

        inputElement.addEventListener("input", (event) => {
            changeTextareaHeight(inputElement)
            if (inputElement.value.length > 0) {
                searchInputClear.style.display = 'flex'
                return
            }

            searchInputClear.style.display = 'none'
        });



        const searchInputClear = document.getElementById("search-input-clear");
        searchInputClear.addEventListener("click", function () {
            changeTextareaHeight(inputElement)
            inputElement.value = '';
            searchInputClear.style.display = 'none'
            inputElement.focus()
        })

        inputElement.addEventListener("focus", (e) => {
            changeTextareaHeight(inputElement)
            const displayStyle = window.getComputedStyle(searchEngines).display;
            if (displayStyle !== "none") {
                searchEngines.style.display = "none";
            }

            document.addEventListener("keydown", handleKeyDown);
            // searchInput.addEventListener("input", handleInput);
        });

        inputElement.addEventListener('click', function (event) {
            if (!renderSearchHistory()){
                return
            }
            searchHistory.style.display = "grid";
        });

        // 设置延迟事件、避免影响
        inputElement.addEventListener("blur", (e) => {

            // if (document.activeElement.classList.contains('search-history-item')) {
            //     return;  // 如果点击的是搜索历史项，不执行隐藏操作
            // }

            // 设置延迟事件、避免影响
            setTimeout(() => {
                // searchEngines.style.display = "none";

                searchHistory.style.display = "none";
                // document.querySelector('.search-br').style.display = "none";
                isSearchEnginesMenu = false;
                document.removeEventListener("keydown", handleKeyDown);
                // document.removeEventListener("input", handleInput);
            }, 200)

        });

        document.addEventListener("keydown", (event) => {
            if (['INPUT', 'TEXTAREA'].includes(document.activeElement.tagName)) {
                return;
            }

            if (event.key !== "s"){
                return;
            }

            inputElement.focus();
            event.preventDefault();
        });

        // kbdElement.addEventListener("mousedown", () => {
        //     requestAnimationFrame(() => inputElement.focus());
        // });
    }


    searchAction.addEventListener('click', () => {
        actionSearch(searchInput.value.trim(), true)
    });

    function changeTextareaHeight(event) {
        event.style.height = 'auto'; // Reset height
        event.style.height = event.scrollHeight + 'px'; // 根据内容调整高度
    }

    function actionSearch(query = "", newTab = true, url = "") {
        if (url === "") {
            let searchUrlTemplate = localStorage.getItem("selectedSearchEngine")
            searchUrlTemplate = searchUrlTemplate || defaultSearchUrl || "https://www.baidu.com/s?wd={QUERY}"
            url = searchUrlTemplate.replace("!QUERY!", encodeURIComponent(query))
        }

        if (query !== "") {
            searchInput.value = ""
            addSearchRecord(query, url)
        }

        console.log(url)
        newTab ? window.open(url, '_blank').focus() : window.location.href = url;
    }

    const MAX_HISTORY_LENGTH = 10;
    function addSearchRecord(searchTerm, searchEnginesUrl) {
        if (searchTerm === "") {
            return
        }

        const searchTime = new Date().toLocaleString();
        const searchRecord = {
            term: searchTerm,
            time: searchTime,
            url: searchEnginesUrl
        };

        let searchRecords = JSON.parse(localStorage.getItem('searchHistory')) || [];
        const existingIndex = searchRecords.findIndex(record => record.term === searchTerm)
        if (existingIndex !== -1) {
            searchRecords.splice(existingIndex, 1);  // 删除旧的位置
        }

        searchRecords.unshift(searchRecord);
        if (searchRecords.length > MAX_HISTORY_LENGTH) {
            searchRecords.pop()
        }

        localStorage.setItem("searchHistory", JSON.stringify(searchRecords))
    }


    function renderSearchHistory() {
        searchHistory.innerHTML = ''; // 清空搜索历史
        const searchHistoryList = JSON.parse(localStorage.getItem('searchHistory')) || [];
        if (searchHistoryList.length===0){
            return false
        }

        searchHistoryList.forEach(record => {
            const newItem = document.createElement('div');
            newItem.className = 'search-history-item';
            const span = document.createElement('span');
            span.textContent = record.term;

            newItem.addEventListener("click", function () {
                searchInput.value = record.term
                setTimeout(() => {
                    actionSearch(record.term, true, record.url)
                }, 0)
            });

            newItem.appendChild(span);
            searchHistory.appendChild(newItem)
        });

        return true
    }

}

function setupDynamicRelativeTime() {
    const elements = document.querySelectorAll("[data-dynamic-relative-time]");
    const updateInterval = 60 * 1000;
    let lastUpdateTime = Date.now();

    updateRelativeTimeForElements(elements);

    const updateElementsAndTimestamp = () => {
        updateRelativeTimeForElements(elements);
        lastUpdateTime = Date.now();
    };

    const scheduleRepeatingUpdate = () => setInterval(updateElementsAndTimestamp, updateInterval);

    if (document.hidden === undefined) {
        scheduleRepeatingUpdate();
        return;
    }

    let timeout = scheduleRepeatingUpdate();

    document.addEventListener("visibilitychange", () => {
        if (document.hidden) {
            clearTimeout(timeout);
            return;
        }

        const delta = Date.now() - lastUpdateTime;

        if (delta >= updateInterval) {
            updateElementsAndTimestamp();
            timeout = scheduleRepeatingUpdate();
            return;
        }

        timeout = setTimeout(() => {
            updateElementsAndTimestamp();
            timeout = scheduleRepeatingUpdate();
        }, updateInterval - delta);
    });
}

function setupGroups() {
    const groups = document.getElementsByClassName("widget-type-group");

    if (groups.length == 0) {
        return;
    }

    for (let g = 0; g < groups.length; g++) {
        const group = groups[g];
        const titles = group.getElementsByClassName("widget-header")[0].children;
        const tabs = group.getElementsByClassName("widget-group-contents")[0].children;
        let current = 0;

        for (let t = 0; t < titles.length; t++) {
            const title = titles[t];
            title.addEventListener("click", () => {
                if (t == current) {
                    return;
                }

                for (let i = 0; i < titles.length; i++) {
                    titles[i].classList.remove("widget-group-title-current");
                    tabs[i].classList.remove("widget-group-content-current");
                }

                if (current < t) {
                    tabs[t].dataset.direction = "right";
                } else {
                    tabs[t].dataset.direction = "left";
                }

                current = t;

                title.classList.add("widget-group-title-current");
                tabs[t].classList.add("widget-group-content-current");
            });
        }
    }
}

function setupLazyImages() {
    const images = document.querySelectorAll("img[loading=lazy]");

    if (images.length == 0) {
        return;
    }

    function imageFinishedTransition(image) {
        image.classList.add("finished-transition");
    }

    afterContentReady(() => {
        setTimeout(() => {
            for (let i = 0; i < images.length; i++) {
                const image = images[i];

                if (image.complete) {
                    image.classList.add("cached");
                    setTimeout(() => imageFinishedTransition(image), 1);
                } else {
                    // TODO: also handle error event
                    image.addEventListener("load", () => {
                        image.classList.add("loaded");
                        setTimeout(() => imageFinishedTransition(image), 400);
                    });
                }
            }
        }, 1);
    });
}

function attachExpandToggleButton(collapsibleContainer) {
    const showMoreText = "Show more";
    const showLessText = "Show less";

    let expanded = false;
    const button = document.createElement("button");
    const icon = document.createElement("span");
    icon.classList.add("expand-toggle-button-icon");
    const textNode = document.createTextNode(showMoreText);
    button.classList.add("expand-toggle-button");
    button.append(textNode, icon);
    button.addEventListener("click", () => {
        expanded = !expanded;

        if (expanded) {
            collapsibleContainer.classList.add("container-expanded");
            button.classList.add("container-expanded");
            textNode.nodeValue = showLessText;
            return;
        }

        const topBefore = button.getClientRects()[0].top;

        collapsibleContainer.classList.remove("container-expanded");
        button.classList.remove("container-expanded");
        textNode.nodeValue = showMoreText;

        const topAfter = button.getClientRects()[0].top;

        if (topAfter > 0)
            return;

        window.scrollBy({
            top: topAfter - topBefore,
            behavior: "instant"
        });
    });

    collapsibleContainer.after(button);

    return button;
}


function setupCollapsibleLists() {
    const collapsibleLists = document.querySelectorAll(".list.collapsible-container");

    if (collapsibleLists.length == 0) {
        return;
    }

    for (let i = 0; i < collapsibleLists.length; i++) {
        const list = collapsibleLists[i];

        if (list.dataset.collapseAfter === undefined) {
            continue;
        }

        const collapseAfter = parseInt(list.dataset.collapseAfter);

        if (collapseAfter == -1) {
            continue;
        }

        if (list.children.length <= collapseAfter) {
            continue;
        }

        attachExpandToggleButton(list);

        for (let c = collapseAfter; c < list.children.length; c++) {
            const child = list.children[c];
            child.classList.add("collapsible-item");
            child.style.animationDelay = ((c - collapseAfter) * 20).toString() + "ms";
        }
    }
}

function setupCollapsibleGrids() {
    const collapsibleGridElements = document.querySelectorAll(".cards-grid.collapsible-container");

    if (collapsibleGridElements.length == 0) {
        return;
    }

    for (let i = 0; i < collapsibleGridElements.length; i++) {
        const gridElement = collapsibleGridElements[i];

        if (gridElement.dataset.collapseAfterRows === undefined) {
            continue;
        }

        const collapseAfterRows = parseInt(gridElement.dataset.collapseAfterRows);

        if (collapseAfterRows == -1) {
            continue;
        }

        const getCardsPerRow = () => {
            return parseInt(getComputedStyle(gridElement).getPropertyValue('--cards-per-row'));
        };

        const button = attachExpandToggleButton(gridElement);

        let cardsPerRow;

        const resolveCollapsibleItems = () => {
            const hideItemsAfterIndex = cardsPerRow * collapseAfterRows;

            if (hideItemsAfterIndex >= gridElement.children.length) {
                button.style.display = "none";
            } else {
                button.style.removeProperty("display");
            }

            let row = 0;

            for (let i = 0; i < gridElement.children.length; i++) {
                const child = gridElement.children[i];

                if (i >= hideItemsAfterIndex) {
                    child.classList.add("collapsible-item");
                    child.style.animationDelay = (row * 40).toString() + "ms";

                    if (i % cardsPerRow + 1 == cardsPerRow) {
                        row++;
                    }
                } else {
                    child.classList.remove("collapsible-item");
                    child.style.removeProperty("animation-delay");
                }
            }
        };

        const observer = new ResizeObserver(() => {
            if (!isElementVisible(gridElement)) {
                return;
            }

            const newCardsPerRow = getCardsPerRow();

            if (cardsPerRow == newCardsPerRow) {
                return;
            }

            cardsPerRow = newCardsPerRow;
            resolveCollapsibleItems();
        });

        afterContentReady(() => observer.observe(gridElement));
    }
}

const contentReadyCallbacks = [];

function afterContentReady(callback) {
    contentReadyCallbacks.push(callback);
}

const weekDayNames = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
const monthNames = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];

function makeSettableTimeElement(element, hourFormat) {
    const fragment = document.createDocumentFragment();
    const hour = document.createElement('span');
    const minute = document.createElement('span');
    const amPm = document.createElement('span');
    fragment.append(hour, document.createTextNode(':'), minute);

    if (hourFormat == '12h') {
        fragment.append(document.createTextNode(' '), amPm);
    }

    element.append(fragment);

    return (date) => {
        const hours = date.getHours();

        if (hourFormat == '12h') {
            amPm.textContent = hours < 12 ? 'AM' : 'PM';
            hour.textContent = hours % 12 || 12;
        } else {
            hour.textContent = hours < 10 ? '0' + hours : hours;
        }

        const minutes = date.getMinutes();
        minute.textContent = minutes < 10 ? '0' + minutes : minutes;
    };
};

function timeInZone(now, zone) {
    let timeInZone;

    try {
        timeInZone = new Date(now.toLocaleString('en-US', {timeZone: zone}));
    } catch (e) {
        // TODO: indicate to the user that this is an invalid timezone
        console.error(e);
        timeInZone = now
    }

    const diffInHours = Math.round((timeInZone.getTime() - now.getTime()) / 1000 / 60 / 60);

    return {time: timeInZone, diffInHours: diffInHours};
}

function setupClocks() {
    const clocks = document.getElementsByClassName('clock');

    if (clocks.length == 0) {
        return;
    }

    const updateCallbacks = [];

    for (var i = 0; i < clocks.length; i++) {
        const clock = clocks[i];
        const hourFormat = clock.dataset.hourFormat;
        const localTimeContainer = clock.querySelector('[data-local-time]');
        const localDateElement = localTimeContainer.querySelector('[data-date]');
        const localWeekdayElement = localTimeContainer.querySelector('[data-weekday]');
        const localYearElement = localTimeContainer.querySelector('[data-year]');
        const timeZoneContainers = clock.querySelectorAll('[data-time-in-zone]');

        const setLocalTime = makeSettableTimeElement(
            localTimeContainer.querySelector('[data-time]'),
            hourFormat
        );

        updateCallbacks.push((now) => {
            setLocalTime(now);
            localDateElement.textContent = now.getDate() + ' ' + monthNames[now.getMonth()];
            localWeekdayElement.textContent = weekDayNames[now.getDay()];
            localYearElement.textContent = now.getFullYear();
        });

        for (var z = 0; z < timeZoneContainers.length; z++) {
            const timeZoneContainer = timeZoneContainers[z];
            const diffElement = timeZoneContainer.querySelector('[data-time-diff]');

            const setZoneTime = makeSettableTimeElement(
                timeZoneContainer.querySelector('[data-time]'),
                hourFormat
            );

            updateCallbacks.push((now) => {
                const {time, diffInHours} = timeInZone(now, timeZoneContainer.dataset.timeInZone);
                setZoneTime(time);
                diffElement.textContent = (diffInHours <= 0 ? diffInHours : '+' + diffInHours) + 'h';
            });
        }
    }

    const updateClocks = () => {
        const now = new Date();

        for (var i = 0; i < updateCallbacks.length; i++)
            updateCallbacks[i](now);

        setTimeout(updateClocks, (60 - now.getSeconds()) * 1000);
    };

    updateClocks();
}

async function setupPage() {
    const pageElement = document.getElementById("page");
    const pageContentElement = document.getElementById("page-content");
    const pageContent = await fetchPageContent(pageData);

    pageContentElement.innerHTML = pageContent;

    try {
        setupPopovers();
        setupClocks()
        setupCarousels();
        setupSearchBoxes();
        setupCollapsibleLists();
        setupCollapsibleGrids();
        setupGroups();
        setupDynamicRelativeTime();
        setupLazyImages();
    } finally {
        pageElement.classList.add("content-ready");

        for (let i = 0; i < contentReadyCallbacks.length; i++) {
            contentReadyCallbacks[i]();
        }

        setTimeout(() => {
            document.body.classList.add("page-columns-transitioned");
        }, 300);
    }
}

setupPage();
