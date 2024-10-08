document.addEventListener('DOMContentLoaded', function () {
    const searchIcon = document.getElementById('search-icon');
    const searchEngines = document.getElementById('search-engines');
    const searchInput = document.getElementById('search-input');
    const searchContainer = document.getElementById('search-icon');

    // 定义搜索引擎列表
    const engines = [
        {name: 'Google', url: 'https://www.google.com/search?q='},
        {name: 'Bing', url: 'https://www.bing.com/search?q='},
        {name: 'Yahoo', url: 'https://search.yahoo.com/search?p='},
        {name: 'Baidu', url: 'https://www.baidu.com/s?wd='}
    ];

    // 渲染搜索引擎选项
    engines.forEach(engine => {
        const li = document.createElement('li');
        li.textContent = engine.name;
        li.addEventListener('click', () => {
            // 设置当前选中的搜索引擎
            localStorage.setItem('selectedSearchEngine', engine.url);
            // 隐藏菜单
            searchEngines.style.display = 'none';
            // 聚焦到输入框
            searchInput.focus();
        });
        searchEngines.appendChild(li);
    });


    let isMenuVisible = false; // 用于跟踪菜单是否可见

    // 点击G图标显示菜单
    searchIcon.addEventListener('click', () => {

        // 如果菜单当前不可见，则显示它
        if (!isMenuVisible) {
            searchEngines.style.display = 'block';
            isMenuVisible = true;
        }
        // 如果菜单当前可见，则隐藏它
        else {
            searchEngines.style.display = 'none';
            isMenuVisible = false;
        }
    });

    // 点击其他地方隐藏菜单
    document.addEventListener('click', (event) => {
        if (!searchContainer.contains(event.target)) {
            searchEngines.style.display = 'none';
        }
    });

    // 监听输入框的回车事件
    searchInput.addEventListener('keypress', (event) => {
        if (event.key === 'Enter') {
            event.preventDefault();
            const selectedEngine = localStorage.getItem('selectedSearchEngine');
            if (selectedEngine) {
                const query = searchInput.value;
                window.open(selectedEngine + encodeURIComponent(query), '_blank');
                searchInput.value = ''; // 清空输入框
            }
        }
    });

    // 初始化：如果之前有选中的搜索引擎，则设置默认选项（这里可以省略，因为用户第一次使用时不会有默认选项）
    // const savedEngine = localStorage.getItem('selectedSearchEngine');
    // if (savedEngine) {
    //     // 这里可以设置一个默认选中的样式，但在这个例子中我们不需要，因为用户点击后会自动隐藏菜单并聚焦到输入框
    // }

    // 防止点击菜单项时触发点击其他地方隐藏菜单的事件
    searchEngines.addEventListener('click', (event) => {
        event.stopPropagation();
    });
});