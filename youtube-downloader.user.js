// ==UserScript==
// @name        YouTube Downloader
// @namespace   YouTubeDownloader_Moscovium
// @version     1.0.0
// @author      moscovium-mc
// @description Extract YouTube video download functionality from Downloader. Adds download button to YouTube player and supports Shorts videos.
// @license     MIT
// @icon        https://www.google.com/s2/favicons?sz=64&domain=youtube.com
// @homepageURL https://github.com/moscovium-mc/youtube-downloader
// @supportURL  https://github.com/moscovium-mc/youtube-downloader/issues
// @downloadURL https://raw.githubusercontent.com/moscovium-mc/youtube-downloader/main/youtube-downloader.user.js
// @updateURL   https://raw.githubusercontent.com/moscovium-mc/youtube-downloader/main/youtube-downloader.user.js
// @match       https://www.youtube.com/*
// @match       https://*.youtube.com/*
// @grant       GM_openInTab
// @grant       GM.openInTab
// @grant       GM_addStyle
// @grant       GM_xmlhttpRequest
// @grant       GM_download
// @grant       unsafeWindow
// @run-at      document-start
// ==/UserScript==

(function () {
    'use strict';

    // Common Utilities 
    const CommonUtils = {
        getSupportedLang: function () {
            const lang = navigator.language || navigator.userLanguage;
            const supportedLanguages = {
                "en": "en", "es": "es", "fr": "fr", "pt": "pt", "ru": "ru",
                "ja": "ja", "de": "de", "ko": "ko", "it": "it", "id": "id",
                "tr": "tr", "pl": "pl", "uk": "uk", "nl": "nl", "vi": "vi",
                "th": "th", "ar": "ar", "fa": "fa", "hi": "hi", "ms": "ms",
                "zh-CN": "zh-CN", "zh-TW": "zh-TW"
            };
            const langCode = lang.split("-")[0];
            if (langCode === "zh") {
                return lang === "zh-CN" ? "zh-CN" : "zh-TW";
            }
            return supportedLanguages[langCode] || "en";
        },

        openInTab: function (url, options = { "active": true, "insert": true, "setParent": true }) {
            if (typeof GM_openInTab === "function") {
                GM_openInTab(url, options);
            } else {
                GM.openInTab(url, options);
            }
        },

        generateDownloadSvg: function (color = "#FFF", width = 25, height = 25) {
            let svg = document.createElementNS("http://www.w3.org/2000/svg", "svg");
            svg.setAttribute("t", "1768806429307");
            svg.setAttribute("class", "icon");
            svg.setAttribute("viewBox", "0 0 1024 1024");
            svg.setAttribute("version", "1.1");
            svg.setAttribute("xmlns", "http://www.w3.org/2000/svg");
            svg.setAttribute("p-id", "21520");
            svg.setAttribute("width", width);
            svg.setAttribute("height", height);
            let path = document.createElementNS("http://www.w3.org/2000/svg", "path");
            path.setAttribute("d", "M684.5 512H573.1V389.8c0-11.2-9.1-20.4-20.4-20.4h-81.5c-11.3 0-20.4 9.1-20.4 20.4v122.4l-112.4 0.6c-4 0-7.1 2.3-8.5 5.5 0 0.1-0.1 0.1-0.1 0.2-0.3 0.6-0.3 1.3-0.4 2-0.1 0.6-0.3 1.2-0.2 1.8 0 0.1-0.1 0.3-0.1 0.4 0 0.4 0.2 0.7 0.3 1.1 0.2 0.8 0.3 1.6 0.7 2.4 0.2 0.4 0.4 0.7 0.6 1 0.3 0.6 0.6 1.2 1 1.7l168.2 188c0.4 0.4 0.8 0.6 1.2 1 0.2 0.2 0.3 0.5 0.6 0.7 0.2 0.2 0.5 0.2 0.8 0.4 0.7 0.4 1.4 0.7 2.1 1 0.2 0.1 0.5 0.2 0.7 0.2 2.9 0.9 6 0.6 8.3-1.3 0.5-0.4 0.8-1.1 1.2-1.6 0.3-0.2 0.6-0.4 0.9-0.7l175.2-187.8c0.5-0.6 0.8-1.3 1.2-1.9 0.2-0.3 0.4-0.5 0.5-0.9 0.4-0.8 0.6-1.6 0.7-2.3 0.1-0.4 0.3-0.6 0.3-1v-1c0.6-5.4-3.6-9.7-9.1-9.7zM471.3 349.1h81.5c11.3 0 20.4-9.1 20.4-20.4v-20.4c0-11.2-9.1-20.4-20.4-20.4h-81.5c-11.3 0-20.4 9.1-20.4 20.4v20.4c0 11.3 9.1 20.4 20.4 20.4zM512 64C264.6 64 64 264.6 64 512s200.6 448 448 448 448-200.6 448-448S759.4 64 512 64z m0 814.6c-202.4 0-366.5-164.1-366.5-366.6 0-202.4 164.1-366.5 366.5-366.5S878.5 309.6 878.5 512 714.4 878.6 512 878.6z");
            path.setAttribute("fill", color);
            svg.appendChild(path);
            return svg;
        }
    };

    // Download HUD (Hover Button for Shorts) 
    const DownloadHud = {
        instances: new Map(),

        createStyleText: function (id, zIndex, buttonSize) {
            return `
            #${id} {
                position: fixed;
                z-index: ${zIndex} !important;
                overflow: hidden;
                background: rgba(0, 0, 0, 0.3);
                width: ${buttonSize}px;
                height: ${buttonSize}px;
                border-radius: 50%;
                display: none;
                align-items: center;
                justify-content: center;
                cursor: pointer;
                pointer-events: auto !important;
                font-size: 16px;
            }
            #${id}::before {
                content: "";
                position: absolute;
                inset: 0;
                border-radius: inherit;
                padding: 2px;
                background: linear-gradient(90deg, red, orange, yellow, green, cyan, blue, violet, red);
                background-size: 200% 200%;
                opacity: 0;
                transition: opacity .25s;
                -webkit-mask:linear-gradient(#000 0 0) content-box, linear-gradient(#000 0 0);
                -webkit-mask-composite: xor;
                mask-composite: exclude;
            }
            #${id}.yt-downloader-hover {
                opacity: 1;
            }
            #${id}.yt-downloader-hover::before {
                opacity: 1;
                animation: yt-downloader-rainbow-move 3s linear infinite;
            }
            #${id} svg {
                fill: currentColor;
                pointer-events: none;
            }
            @keyframes yt-downloader-rainbow-move {
                0% { background-position: 0% 50%; }
                100% { background-position: 200% 50%; }
            }
        `;
        },

        isPointInRect: function (x, y, rect) {
            return x >= rect.left && x <= rect.right && y >= rect.top && y <= rect.bottom;
        },

        isVisibleElement: function (element, minTargetSize) {
            const rect = element.getBoundingClientRect();
            if (rect.width <= minTargetSize || rect.height <= minTargetSize) {
                return false;
            }
            const computedStyle = window.getComputedStyle(element);
            if (computedStyle.display === "none" || computedStyle.visibility === "hidden" || computedStyle.opacity === "0") {
                return false;
            }
            return true;
        },

        createHoverDownloadButton: function (options = {}) {
            const {
                id = "yt-downloader-hud",
                zIndex = 2147483647,
                buttonSize = 48,
                buttonPosition = "top-center",
                buttonEdgeOffset = 15,
                iconSize = 25,
                iconColor = "#fff",
                minTargetSize = 50,
                targetSelector = "video",
                getAnchorRect = null,
                onClick = null
            } = options;

            if (this.instances.has(id)) {
                return this.instances.get(id).api;
            }

            const state = {
                activeTarget: null,
                mouseX: -500,
                mouseY: -500,
                destroyed: false,
                disabled: false,
                buttonPosition,
                buttonEdgeOffset
            };

            const style = GM_addStyle(this.createStyleText(id, zIndex, buttonSize));
            const button = document.createElement("div");
            button.id = id;
            button.style.cursor = "pointer!important";
            const svgIcon = CommonUtils.generateDownloadSvg(iconColor, iconSize, iconSize);
            button.appendChild(svgIcon);
            (document.body || document.documentElement).appendChild(button);

            const updateButtonPos = () => {
                if (state.destroyed) return;
                if (!state.activeTarget || button.style.display === "none") return;

                let rect = null;
                if (typeof getAnchorRect === "function") {
                    rect = getAnchorRect(state.activeTarget);
                }
                if (!rect) {
                    rect = state.activeTarget.getBoundingClientRect();
                }
                if (!rect) return;

                const edgeOffset = Number.isFinite(Number(state.buttonEdgeOffset)) ? Number(state.buttonEdgeOffset) : 15;
                let top = rect.top + edgeOffset;
                let left = rect.left + rect.width / 2 - buttonSize / 2;

                switch (state.buttonPosition) {
                    case "bottom-center":
                        top = rect.bottom - buttonSize - edgeOffset;
                        left = rect.left + rect.width / 2 - buttonSize / 2;
                        break;
                    case "left-center":
                        top = rect.top + rect.height / 2 - buttonSize / 2;
                        left = rect.left + edgeOffset;
                        break;
                    case "right-center":
                        top = rect.top + rect.height / 2 - buttonSize / 2;
                        left = rect.right - buttonSize - edgeOffset;
                        break;
                    default:
                        top = rect.top + edgeOffset;
                        left = rect.left + rect.width / 2 - buttonSize / 2;
                        break;
                }

                if (left < 5) left = 5;
                if (top < 5) top = 5;
                if (top > window.innerHeight - buttonSize - 5) {
                    top = window.innerHeight - buttonSize - 5;
                }
                if (left > window.innerWidth - buttonSize - 5) {
                    left = window.innerWidth - buttonSize - 5;
                }

                button.style.top = `${top}px`;
                button.style.left = `${left}px`;
            };

            const pickTarget = () => {
                const targets = document.querySelectorAll(targetSelector);
                for (const element of targets) {
                    const rect = element.getBoundingClientRect();
                    if (!this.isPointInRect(state.mouseX, state.mouseY, rect)) continue;
                    if (!this.isVisibleElement(element, minTargetSize)) continue;
                    if (targetSelector === "video" && element.readyState < 3) continue;
                    return element;
                }
                return null;
            };

            const checkHover = () => {
                if (state.destroyed) return;
                if (state.disabled) {
                    button.style.display = "none";
                    state.activeTarget = null;
                    return;
                }
                if (state.mouseX < 0 || state.mouseY < 0) return;

                const buttonRect = button.getBoundingClientRect();
                const isHoveringButton = button.style.display === "flex" && this.isPointInRect(state.mouseX, state.mouseY, buttonRect);
                if (isHoveringButton) {
                    button.classList.add("yt-downloader-hover");
                    return;
                }
                button.classList.remove("yt-downloader-hover");

                const found = pickTarget();
                if (found) {
                    state.activeTarget = found;
                    button.style.display = "flex";
                    updateButtonPos();
                } else {
                    button.style.display = "none";
                    state.activeTarget = null;
                }
            };

            const onMouseMove = (event) => {
                if (state.destroyed) return;
                state.mouseX = event.clientX;
                state.mouseY = event.clientY;
                checkHover();
            };

            const onMouseDown = (event) => {
                if (state.destroyed) return;
                if (state.disabled) return;
                if (button.style.display !== "flex") return;

                const rect = button.getBoundingClientRect();
                if (!this.isPointInRect(event.clientX, event.clientY, rect)) return;

                event.preventDefault();
                event.stopPropagation();

                if (typeof onClick === "function") {
                    try {
                        onClick(state.activeTarget);
                    } catch (error) {
                        console.error("DownloadHud onClick error", error);
                    }
                }
            };

            const onScroll = () => {
                if (state.destroyed) return;
                if (state.disabled) return;
                if (state.activeTarget && button.style.display === "flex") {
                    updateButtonPos();
                }
            };

            window.addEventListener("mousemove", onMouseMove, true);
            window.addEventListener("mousedown", onMouseDown, true);
            window.addEventListener("scroll", onScroll, { passive: true, capture: true });

            const timer = setInterval(() => {
                if (state.destroyed) return;
                if (state.mouseX >= 0 && state.mouseY >= 0) {
                    checkHover();
                }
            }, 300);

            const destroy = () => {
                if (state.destroyed) return;
                state.destroyed = true;
                clearInterval(timer);
                window.removeEventListener("mousemove", onMouseMove, true);
                window.removeEventListener("mousedown", onMouseDown, true);
                window.removeEventListener("scroll", onScroll, true);
                button.remove();
                style.remove();
                this.instances.delete(id);
            };

            const hideButton = () => {
                button.style.display = "none";
            };

            const disable = () => {
                state.disabled = true;
                button.style.display = "none";
                state.activeTarget = null;
            };

            const enable = () => {
                state.disabled = false;
                checkHover();
            };

            const showButtonForTarget = (target) => {
                if (!target || state.disabled) return;
                state.activeTarget = target;
                button.style.display = "flex";
                updateButtonPos();
            };

            const setButtonPosition = (position, edgeOffset) => {
                const validPositions = new Set(["top-center", "bottom-center", "left-center", "right-center"]);
                if (validPositions.has(position)) {
                    state.buttonPosition = position;
                }
                if (edgeOffset != null && Number.isFinite(Number(edgeOffset))) {
                    state.buttonEdgeOffset = Number(edgeOffset);
                }
                if (state.activeTarget && button.style.display === "flex") {
                    updateButtonPos();
                }
            };

            const getCurrentTargetElement = () => state.activeTarget;

            const api = {
                getCurrentTargetElement,
                hideButton,
                disable,
                enable,
                showButtonForTarget,
                setButtonPosition,
                destroy
            };

            this.instances.set(id, { api });
            return api;
        },

        mountVideoHoverDownload: function (spec = {}) {
            const { getDownloadUrl, invokeDownload = CommonUtils.openInTab, ...hoverButtonOptions } = spec;
            if (typeof getDownloadUrl !== "function") {
                console.error("DownloadHud.mountVideoHoverDownload: getDownloadUrl is required");
                return null;
            }
            return this.createHoverDownloadButton({
                ...hoverButtonOptions,
                onClick: (target) => {
                    if (!target) return;
                    const url = getDownloadUrl(target);
                    if (url && !String(url).includes("undefined")) {
                        invokeDownload(url);
                    }
                }
            });
        }
    };

    // YouTube Downloader 
    const YouTubeDownloader = {
        downloadVideo: function () {
            const url = "https://www.tool77.com/" + CommonUtils.getSupportedLang() + "/v/downloader?url=" + encodeURIComponent(window.location.href);
            CommonUtils.openInTab(url);
        },

        generateButtonInPlayer: function () {
            return new Promise((resolve) => {
                const buttonId = "yt-downloader-button";
                const boxContainer = document.createElement("div");
                boxContainer.className = "ytp-button";
                boxContainer.id = buttonId;
                boxContainer.setAttribute("style", "position: relative;display: inline-block;width: 48px;height: 100%;");

                const boxInner = document.createElement("div");
                boxInner.setAttribute("style", "position: absolute;width: 100%;height: 100%;");

                const boxActiveButton = document.createElement("button");
                boxActiveButton.setAttribute("style", "background-color: transparent;width: 100%;height: 100%;outline: none;flex: 1 1 0%;display: flex;-webkit-box-align: center;align-items: center;-webkit-box-pack: center;justify-content: center;border: none;padding: 0px;cursor: pointer;");

                boxContainer.appendChild(boxInner);
                boxInner.appendChild(boxActiveButton);
                boxActiveButton.appendChild(CommonUtils.generateDownloadSvg("#FFF"));

                boxContainer.addEventListener("click", () => {
                    this.downloadVideo();
                });

                const injectButton = () => {
                    const player = document.querySelector("#player-container-outer .html5-video-player");
                    if (player) {
                        const rightControls = player.querySelector(".ytp-right-controls");
                        if (rightControls && !rightControls.querySelector("#" + buttonId)) {
                            rightControls.prepend(boxContainer);
                        }
                    }
                };

                const interval = setInterval(() => {
                    if (!document.querySelector("#" + buttonId)) {
                        injectButton();
                    } else {
                        resolve();
                        clearInterval(interval);
                    }
                }, 500);
            });
        },

        setupShortsDownloader: function () {
            let downloadHud = DownloadHud.mountVideoHoverDownload({
                buttonSize: 48,
                iconSize: 25,
                buttonEdgeOffset: 15,
                getDownloadUrl: () => {
                    return window.location.href;
                }
            });

            // Check URL changes for Shorts navigation (SPA)
            let lastUrl = window.location.href;
            setInterval(() => {
                const currentUrl = window.location.href;
                if (currentUrl !== lastUrl) {
                    lastUrl = currentUrl;
                    if (currentUrl.includes("/shorts/")) {
                        downloadHud.enable();
                    } else {
                        downloadHud.disable();
                    }
                }
            }, 500);
        },

        run: function () {
            // Add button to regular video player
            this.generateButtonInPlayer();
            // Add hover button for Shorts videos
            this.setupShortsDownloader();
        },

        start: function () {
            if (/youtube\.com/.test(window.location.host)) {
                // Wait for page to be interactive
                if (document.readyState === "loading") {
                    document.addEventListener("DOMContentLoaded", () => this.run());
                } else {
                    this.run();
                }
            }
        }
    };

    // Start the downloader
    YouTubeDownloader.start();
})();
