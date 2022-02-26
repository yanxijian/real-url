'use strict';

let g_supportedUrls = [
    "https://live.bilibili.com/"
];

var mid_ru_floatwindow = "ru_floatwindow";
var mtxt_ru_showfloatwindow = "显示悬浮条";
var mtxt_ru_hidefloatwindow = "隐藏悬浮条";

let g_contextMenus = [{
        id: "ru_copyurl",
        title: "复制直播源",
        url: "https://github.com/wbt5/real-url"
    },
    {
        id: mid_ru_floatwindow,
        title: mtxt_ru_showfloatwindow,
        url: null
    }
];

var opt_ru_floatwindow_show = { "ru_floatwindow": true };
var opt_ru_floatwindow_hide = { "ru_floatwindow": false };

var flag_menuCreated = false;

function floadWindowVisible(result) {
    return typeof result.ru_floatwindow == "undefined" ? false : result.ru_floatwindow;
}

function doCreateContextMenu(menu, pid) {
    chrome.contextMenus.create({
        id: menu["id"],
        /** 类型，可选：["normal", "checkbox", "radio", "separator"]，默认 normal */
        type: "normal",
        /** 显示的文字，除非为“separator”类型否则此参数必需，如果类型为“selection”，可以使用%s显示选定的文本*/
        title: menu["title"],
        /**  上下文环境，可选：["all", "page", "frame", "selection", "link", "editable", "image", "video", "audio"]，默认page*/
        contexts: ["all"],
        parentId: pid
    });
}

function createContextMenus() {
    if (flag_menuCreated)
        return;
    flag_menuCreated = true;

    for (var menu of g_contextMenus) {
        doCreateContextMenu(menu);
    }

    chrome.storage.local.get(mid_ru_floatwindow, function(result) {
        var visible = floadWindowVisible(result);
        chrome.contextMenus.update(mid_ru_floatwindow, { title: visible ? mtxt_ru_hidefloatwindow : mtxt_ru_showfloatwindow });
    });
}

/**
 * 更新悬浮条
 **/
function updateFloatWindow() {
    if (chrome.extension.isAllowedFileSchemeAccess(function(isAllowedAccess) {
            if (!isAllowedAccess) {
                // alert for a quick demonstration, please create your own user-friendly UI
                alert("使用悬浮条功能需要在“管理扩展程序”中开启“允许访问文件网址”选项");

                chrome.tabs.create({ url: "chrome://extensions/?id=" + chrome.runtime.id });
                return;
            }

            chrome.storage.local.get(mid_ru_floatwindow, function(result) {
                var visible = floadWindowVisible(result);
                // 取反
                chrome.storage.local.set(visible ? opt_ru_floatwindow_hide : opt_ru_floatwindow_show);
            });
        }));
};

/**
 * 更新右键菜单
 **/
function updateContextMenu(tabId) {
    chrome.tabs.get(tabId, function(tab) {
        if (tab.url) {
            if (!flag_menuCreated) {
                for (var supportedUrl of g_supportedUrls) {
                    if (tab.url.startsWith(supportedUrl)) {
                        createContextMenus();
                        return;
                    }
                }
            }
            chrome.contextMenus.removeAll();
            flag_menuCreated = false;
        }
    });
};

/**
 * 创建右键菜单
 **/
chrome.runtime.onInstalled.addListener(() => {
    createContextMenus();
});

/**
 * 回调
 **/
chrome.contextMenus.onClicked.addListener(function(info, tab) {
    // 子菜单：悬浮窗
    if (info.menuItemId == mid_ru_floatwindow) {
        updateFloatWindow();
        return;
    }

    for (var menu of g_contextMenus) {
        if (info.menuItemId === menu["id"]) {
            window.open(menu["url"], '_blank')
            return;
        }
    }
});

/**
 * 切换标签
 **/
chrome.tabs.onActivated.addListener(function(info) {
    updateContextMenu(info.tabId);
});

/**
 * 新窗口
 **/
chrome.tabs.onUpdated.addListener(function(tabId, info, tab) {
    if (info.status == "complete") {
        updateContextMenu(tabId);
    }
});

/**
 * 多窗口
 **/
chrome.windows.onFocusChanged.addListener(function(winId) {
    chrome.tabs.query({ lastFocusedWindow: true, active: true }, function(tabs) {
        if (tabs && tabs[0] && tabs[0].id)
            updateContextMenu(tabs[0].id);
    });
});

/**
 * 设置变化
 */
chrome.storage.onChanged.addListener(function(changes, namespace) {
    for (var key in changes) {
        if (key == mid_ru_floatwindow) {
            var storageChange = changes[key];
            var visible = storageChange.newValue;
            chrome.contextMenus.update(mid_ru_floatwindow, { title: visible ? mtxt_ru_hidefloatwindow : mtxt_ru_showfloatwindow });
        }
    }
});