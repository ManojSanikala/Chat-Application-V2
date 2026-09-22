(function () {

    "use strict";

    let currentSlide = 0;
    let slideTimer = null;
    let isReady = false;

    function getSlides() {
        return Array.from(document.querySelectorAll(".home-slide"));
    }

    function getDots() {
        return Array.from(document.querySelectorAll("[data-home-dot]"));
    }

    function showSlide(index, direction) {
        const slides = getSlides();
        const dots = getDots();

        if (!slides.length) {
            return;
        }

        const total = slides.length;
        const nextIndex = (index + total) % total;
        const previousIndex = currentSlide;
        const moveDirection = typeof direction === "number"
            ? direction
            : (nextIndex >= previousIndex ? 1 : -1);

        if (isReady && nextIndex === previousIndex) {
            return;
        }

        slides.forEach(function (slide, i) {
            slide.classList.remove("active", "exit-left", "no-transition");
            if (!isReady) {
                slide.classList.add("no-transition");
            }
            if (i === nextIndex) {
                slide.classList.add("active");
            } else if (i === previousIndex && moveDirection > 0) {
                slide.classList.add("exit-left");
            }
        });

        currentSlide = nextIndex;
        isReady = true;

        window.requestAnimationFrame(function () {
            slides.forEach(function (slide) {
                slide.classList.remove("no-transition");
            });
        });

        dots.forEach(function (dot, i) {
            dot.classList.toggle("active", i === currentSlide);
        });
    }

    function startAutoPlay() {
        stopAutoPlay();
        slideTimer = window.setInterval(function () {
            showSlide(currentSlide + 1, 1);
        }, 5000);
    }

    function stopAutoPlay() {
        if (slideTimer) {
            window.clearInterval(slideTimer);
            slideTimer = null;
        }
    }

    function focusFriendSearch() {
        const input = document.getElementById("friendSearchInput");
        if (!input) {
            return;
        }

        const usersPanel = document.querySelector(".users-panel");
        if (usersPanel) {
            usersPanel.scrollIntoView({
                behavior: "smooth",
                block: "start"
            });
        }

        input.focus();
        input.scrollIntoView({
            behavior: "smooth",
            block: "center"
        });
    }

    function handleAction(action) {
        switch (action) {
            case "find-friends":
                focusFriendSearch();
                break;
            case "requests":
                if (typeof window.loadFriendRequests === "function") {
                    window.loadFriendRequests();
                }
                break;
            case "calls":
                if (typeof window.openCallLogs === "function") {
                    window.openCallLogs();
                }
                break;
            case "profile":
                if (typeof window.openSettingsModal === "function") {
                    window.openSettingsModal();
                }
                break;
            default:
                break;
        }
    }

    document.addEventListener("DOMContentLoaded", function () {
        const carousel = document.getElementById("homeCarousel");

        if (carousel) {
            showSlide(0, 1);
            startAutoPlay();

            getDots().forEach(function (dot) {
                dot.addEventListener("click", function () {
                    const target = Number(dot.dataset.homeDot);
                    const direction = target >= currentSlide ? 1 : -1;
                    showSlide(target, direction);
                    startAutoPlay();
                });
            });
        }

        document.querySelectorAll("[data-home-action]").forEach(function (element) {
            if (element.closest("#homeCarousel")) {
                return;
            }

            element.addEventListener("click", function () {
                handleAction(element.dataset.homeAction);
            });
        });

        document.querySelectorAll("[data-home-scroll]").forEach(function (element) {
            element.addEventListener("click", function () {
                const target = document.getElementById(element.dataset.homeScroll);
                if (target) {
                    target.scrollIntoView({
                        behavior: "smooth",
                        block: "center"
                    });
                }
            });
        });
    });

})();
