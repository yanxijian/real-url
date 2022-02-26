// Copyright 2018 The Chromium Authors. All rights reserved.
// Use of this source code is governed by a BSD-style license that can be
// found in the LICENSE file.

'use strict';

var g_floatwindow;
var mid_ru_floatwindow = "ru_floatwindow";
var mid_ru_menu_nav = "ru-menu-nav";
var mid_ru_btn_copyurl = "ru-btn-copyurl";
var mid_ru_btn_hide = "ru-btn-hide";
var mid_ru_img = "-img";

let g_floatMenus = [{
        id: mid_ru_btn_copyurl,
        icon: "/img/copyurl.svg",
        url: "https://github.com/wbt5/real-url"
    },
    {
        id: mid_ru_btn_hide,
        icon: "/img/hide.svg",
        url: null
    }
];

/**
 * 获取指定ID的标签
 */
function $(id) {
    return document.getElementById(id);
}

function floatMenuHtml() {
    var html = "\
        <ul class='ru-nav' id='ru-menu-nav' style='position:absolute; z-index:999;'>\
            <!-- 复制直播源 -->\
            <li class='ru-nav-item-copyurl'>\
                <a href='javascript:void(0);' id='ru-btn-copyurl' role='button' draggable='false'>\
                    <img class='glyphicon' id='ru-btn-copyurl-img' style='color: transparent;'></span>\
                    <span class='ru-text-span'>复制直播源</span>\
                </a>\
            </li>\
            <!-- 隐藏悬浮条 -->\
            <li class='ru-nav-item-hide'>\
                <a href='javascript:void(0);' id='ru-btn-hide' role='button' draggable='false'>\
                    <img class='glyphicon' id='ru-btn-hide-img' style='color: transparent;'></img>\
                    <span class='ru-text-span'>隐藏悬浮条</span>\
                </a>\
            </li>\
        </ul>\
    ";
    return html;
}

(function() {
    'use strict';
    // 创建新元素
    g_floatwindow = document.createElement(mid_ru_floatwindow);
    // 搜寻body元素
    var bodyTag = document.querySelector("body");
    // 将新元素作为子节点插入到body元素的最后一个子节点之后
    bodyTag.appendChild(g_floatwindow);
    g_floatwindow.innerHTML = floatMenuHtml();
    // 先隐藏
    g_floatwindow.style.display = "none";

    // 更新悬浮菜单显隐
    chrome.storage.local.get(mid_ru_floatwindow, function(result) {
        var visible = typeof result.ru_floatwindow == "undefined" ? false : result.ru_floatwindow;
        g_floatwindow.style.display = visible ? "block" : "none";
    });

    // 设置悬浮菜单点击事件和图片
    for (var menu of g_floatMenus) {
        $(menu["id"]).addEventListener('click', ruFloatMenuClick, false);
        $(menu["id"]).addEventListener('mouseenter', ruFloatMenuEnter, false);
        $(mid_ru_menu_nav).addEventListener('mouseleave', ruFloatMenuLeave, false);

        let img = $(menu["id"] + mid_ru_img);
        img.setAttribute('src', chrome.runtime.getURL(menu["icon"]));
    }

})();

/**
 * 设置变化
 */
chrome.storage.onChanged.addListener(function(changes, namespace) {
    for (var key in changes) {
        if (key == mid_ru_floatwindow) {
            var storageChange = changes[key];
            var visible = storageChange.newValue;
            g_floatwindow.style.display = visible ? "block" : "none";
        }
    }
});

/**
 * Click 事件响应
 */
function ruFloatMenuClick(event) {
    var sender = event.currentTarget;
    for (var menu of g_floatMenus) {
        if (menu["id"] == mid_ru_btn_hide) {
            chrome.storage.local.set({ "ru_floatwindow": false });
            break;
        } else if (menu["id"] == sender.id && menu["url"]) {
            window.open(menu["url"], '_blank');
            break;
        }
    }
}

/**
 * Enter 事件响应
 */
function ruFloatMenuEnter(event) {
    for (var menu of g_floatMenus) {
        $(menu["id"]).style.visibility = "visible";
    }
}

/**
 * Leave 事件响应
 */
function ruFloatMenuLeave(event) {
    setTimeout(function() {
        for (var menu of g_floatMenus) {
            if (menu["id"] && menu["id"] != mid_ru_btn_copyurl)
                $(menu["id"]).style.visibility = "hidden";
        }
    }, 100);
}