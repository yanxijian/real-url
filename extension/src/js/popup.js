// Copyright 2018 The Chromium Authors. All rights reserved.
// Use of this source code is governed by a BSD-style license that can be
// found in the LICENSE file.

'use strict';

document.addEventListener('DOMContentLoaded', init);

let g_popMenus = [{
    id: "ru-btn-copyurl",
    func: "copyurl",
    url: "https://github.com/wbt5/real-url"
}];

/**
 * 获取指定ID的标签
 */
function $(id) {
    return document.getElementById(id);
}

/**
 * 绑定点击事件
 */
function init() {
    chrome.tabs.query({ active: true, currentWindow: true }, function(tabs) {
        if (tabs) {
            // 关联点击事件
            for (var menu of g_popMenus) {
                $(menu["id"]).addEventListener('click', ruPopMenuClick, false);
            }
        }
    });
}

/**
 * 点击事件响应
 */
function ruPopMenuClick(event) {
    var sender = event.currentTarget;
    for (var menu of g_popMenus) {
        if (menu["id"] == sender.id && menu["url"]) {
            chrome.tabs.create({ url: menu["url"] });
            break;
        }
    }
}