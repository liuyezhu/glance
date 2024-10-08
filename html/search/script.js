// script.js

// 存储搜索历史的数组（在实际应用中，可以考虑使用localStorage或服务器存储）
let searchHistory = [];

// 当前选择的搜索引擎
let currentSearchEngine = "google";

// 保存搜索历史
function saveSearchHistory() {
    const searchBox = document.getElementById("searchBox");
    const searchTerm = searchBox.value.trim();
    if (searchTerm && !searchHistory.includes(searchTerm)) {
        searchHistory.push(searchTerm);
        updateSearchHistoryList();
    }
}

// 更新搜索历史列表
function updateSearchHistoryList() {
    const searchHistoryList = document.getElementById("searchHistoryList");
    searchHistoryList.innerHTML = "";
    searchHistory.forEach(term => {
        const listItem = document.createElement("li");
        listItem.classList.add("list-group-item");
        listItem.textContent = term;
        listItem.onclick = () => {
            document.getElementById("searchBox").value = term;
            $('#searchHistoryModal').modal('hide');
        };
        searchHistoryList.appendChild(listItem);
    });
}

// 更新搜索框中的搜索引擎URL模板
function updateSearchEngine() {
    const select = document.getElementById("searchEngineSelect");
    currentSearchEngine = select.value;
}

// 执行搜索
function performSearch() {
    const searchBox = document.getElementById("searchBox");
    const searchTerm = searchBox.value.trim();
    if (searchTerm) {
        let searchUrl;
        switch (currentSearchEngine) {
            case "google":
                searchUrl = `https://www.google.com/search?q=${searchTerm}`;
                break;
            case "bing":
                searchUrl = `https://www.bing.com/search?q=${searchTerm}`;
                break;
            case "duckduckgo":
                searchUrl = `https://duckduckgo.com/?q=${searchTerm}`;
                break;
            default:
                searchUrl = `https://www.google.com/search?q=${searchTerm}`;
        }
        window.open(searchUrl, "_blank");
    }
}

// 初始化搜索历史列表
document.addEventListener("DOMContentLoaded", () => {
    updateSearchHistoryList();
});