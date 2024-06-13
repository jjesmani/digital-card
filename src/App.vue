<script setup>
import { ref, onMounted, watch } from "vue";
import { useRouter } from "vue-router";

const router = useRouter();
const currentFrame = ref(0);
const imageSrc = ref("");
const images = ref([]);
const isIdleVisible = ref(true);
const isTransitionFinished = ref(false);
const touchStartY = ref(0);
const scrollThreshold = 50;
const isScrollTextVisible = ref(true);
const transitionImageSrc = ref("");
const isTransitioning = ref(false);
const page2IdleImageSrc = ref("");
const isPage2OutTransitionFinished = ref(false);
const isPage2OutTransitioning = ref(false);
const isPage2IdleVisible = ref(true);
let page2IdleAnimationInterval = null;
const page3TransitionImageSrc = ref("");
const isPage3TransitionFinished = ref(false);
const page3IdleImageSrc = ref("");
const isLoading = ref(true);
const rsvpIdleImageSrc = ref("");
const isRsvpIdleVisible = ref(true);
const page2OutTransitionImageSrc = ref("");
const page5TransitionImageSrc = ref("");
const isPage5TransitionFinished = ref(false);
const page5IdleImageSrc = ref("");
const loadingPercentage = ref(0);
const totalFrames = ref(0);
const loadedFrames = ref(0);
const isPage3FadingOut = ref(false);
const isPage3FadingIn = ref(false);
const isRsvpFadingOut = ref(false);
const isPage5TransitionStarted = ref(false);

const preloadImage = (path) => {
    return new Promise((resolve, reject) => {
        const img = new Image();
        img.onload = () => {
            console.log(`Loaded image: ${path}`);
            loadedFrames.value++;
            loadingPercentage.value = Math.floor(
                (loadedFrames.value / totalFrames.value) * 100
            );
            resolve(path);
        };
        img.onerror = () => reject(new Error(`Failed to load image: ${path}`));
        img.src = path;
    });
};

const preloadImages = async (path, frames) => {
    const imagePaths = [];
    for (let i = 0; i < frames; i++) {
        const imagePath = `${path}${i.toString().padStart(4, "0")}.png`;
        imagePaths.push(imagePath);
    }
    totalFrames.value += frames;
    const loadedImages = await Promise.all(
        imagePaths.map((path) => preloadImage(path))
    );
    return loadedImages;
};

onMounted(async () => {
    try {
        console.log("Loading screen 1 idle animation frames...");
        const screenOneIdleFrames = await preloadImages(
            "/assets/screenOne/SCREEN1_IDLE/screen1idle_frame",
            8
        );
        console.log("Loading screen 1 out transition frames...");
        const screenOneOutTransitionFrames = await preloadImages(
            "/assets/screenOne/SCREEN1_OUTTRANSITION/screen1outtransition_frame",
            12
        );
        console.log("Loading screen 2 in transition frames...");
        const screenTwoInTransitionFrames = await preloadImages(
            "/assets/screenTwo/SCREEN2_INTRANSITION/screen2intransition_frame",
            24
        );
        console.log("Loading screen 2 idle animation frames...");
        const screenTwoIdleFrames = await preloadImages(
            "/assets/screenTwo/SCREEN2_IDLE/screen2idle_frame",
            8
        );
        console.log("Loading screen 2 out transition frames...");
        const screenTwoOutTransitionFrames = await preloadImages(
            "/assets/screenTwo/SCREEN2_OUTTRANSITION/screen2outtransition_frame",
            11
        );
        console.log("Loading screen 3 in transition frames...");
        const screenThreeInTransitionFrames = await preloadImages(
            "/assets/screenThree/SCREEN3_INTRANSITION/screen3intransition_frame",
            15
        );
        console.log("Loading screen 3 idle image...");
        totalFrames.value++;
        await preloadImage(
            "/assets/screenThree/SCREEN3_IDLE/screen3idle_frame0000.png"
        );
        console.log("Loading screen 4 idle image...");
        totalFrames.value++;
        await preloadImage(
            "/assets/screenFour/screen4outtransition_frame0000.png"
        );
        console.log("Loading screen 5 in transition frames...");
        const screenFiveInTransitionFrames = await preloadImages(
            "/assets/screenFive/SCREEN5_INTRANSITION/screen5intransition_frame",
            11
        );
        console.log("Loading screen 5 idle image...");
        totalFrames.value++;
        await preloadImage(
            "/assets/screenFive/SCREEN5_IDLE/screen5idle_frame0000.png"
        );

        isLoading.value = false;
        console.log("Loading complete.");

        // Start the initial animation
        startAnimation(screenOneIdleFrames, 100);
    } catch (error) {
        console.error("Error in onMounted:", error);
        isLoading.value = false; // Set loading state to false in case of an error
    }
});

const startAnimation = (frames, interval) => {
    setInterval(() => {
        currentFrame.value = (currentFrame.value + 1) % frames.length;
        imageSrc.value = frames[currentFrame.value];
    }, interval);
};

const handleTouchStart = (event) => {
    touchStartY.value = event.touches[0].clientY;
};

const handleTouchMove = async (event) => {
    if (!isTransitioning.value) {
        const touchCurrentY = event.touches[0].clientY;
        const touchDiff = touchStartY.value - touchCurrentY;
        if (touchDiff > scrollThreshold) {
            isTransitioning.value = true;
            isIdleVisible.value = false;
            isScrollTextVisible.value = false;
            await playTransitionAnimation(
                "/assets/screenOne/SCREEN1_OUTTRANSITION/screen1outtransition_frame",
                12,
                80
            );
            isTransitionFinished.value = true;
            await navigateToNextPage();
        }
    }
};

const playTransitionAnimation = async (path, totalFrames, interval) => {
    const frames = await preloadImages(path, totalFrames);
    for (const frame of frames) {
        transitionImageSrc.value = frame;
        await new Promise((resolve) => setTimeout(resolve, interval));
    }
};

const navigateToNextPage = async () => {
    isTransitionFinished.value = false; // Reset isTransitionFinished
    await playTransitionAnimation(
        "/assets/screenTwo/SCREEN2_INTRANSITION/screen2intransition_frame",
        24,
        80
    );
    isTransitionFinished.value = true; // Set isTransitionFinished to true after transition
    router.push("/time");
    page2IdleImageSrc.value = await startIdleAnimation(
        "/assets/screenTwo/SCREEN2_IDLE/screen2idle_frame",
        8,
        200,
        page2IdleAnimationInterval
    );
};

const startIdleAnimation = async (
    path,
    totalFrames,
    interval,
    animationInterval
) => {
    const frames = await preloadImages(path, totalFrames);
    let frameIndex = 0;
    animationInterval = setInterval(() => {
        frameIndex = (frameIndex + 1) % frames.length;
        if (path.includes("SCREEN2")) {
            page2IdleImageSrc.value = frames[frameIndex];
        }
    }, interval);
    return frames[frameIndex];
};

const stopIdleAnimation = () => {
    clearInterval(page2IdleAnimationInterval);
};

const handleTimePageTouchMove = async (event) => {
    if (!isPage2OutTransitioning.value) {
        const touchCurrentY = event.touches[0].clientY;
        const touchDiff = touchStartY.value - touchCurrentY;
        if (touchDiff > scrollThreshold) {
            isPage2OutTransitioning.value = true;
            isPage2IdleVisible.value = false;
            stopIdleAnimation();
            await playPage2OutTransitionAnimation();
            isPage2OutTransitionFinished.value = true;
            await navigateToLocationPage();
        }
    }
};

const playPage2OutTransitionAnimation = async () => {
    const frames = await preloadImages(
        "/assets/screenTwo/SCREEN2_OUTTRANSITION/screen2outtransition_frame",
        11
    );
    for (const frame of frames) {
        page2OutTransitionImageSrc.value = frame;
        await new Promise((resolve) => setTimeout(resolve, 60));
    }
};

const navigateToLocationPage = async () => {
    const page3TransitionFrames = await preloadImages(
        "/assets/screenThree/SCREEN3_INTRANSITION/screen3intransition_frame",
        15
    );
    for (const frame of page3TransitionFrames) {
        page3TransitionImageSrc.value = frame;
        await new Promise((resolve) => setTimeout(resolve, 80));
    }
    isPage3TransitionFinished.value = true;
    router.push("/location");
    page3IdleImageSrc.value =
        "/assets/screenThree/SCREEN3_IDLE/screen3idle_frame0000.png";
};

const handleLocationPageTouchMove = async (event) => {
    const touchCurrentY = event.touches[0].clientY;
    const touchDiff = touchStartY.value - touchCurrentY;
    if (touchDiff > scrollThreshold) {
        isPage3FadingOut.value = true;
        await new Promise((resolve) => setTimeout(resolve, 500));
        isPage3FadingOut.value = false;
        isPage3FadingIn.value = true;
        await navigateToRsvpPage();
        await new Promise((resolve) => setTimeout(resolve, 500));
        isPage3FadingIn.value = false;
    }
};

const navigateToRsvpPage = async () => {
    router.push("/rsvp");
    rsvpIdleImageSrc.value =
        "/assets/screenFour/screen4outtransition_frame0000.png";
};

const handleRsvpPageTouchMove = async (event) => {
    const touchCurrentY = event.touches[0].clientY;
    const touchDiff = touchStartY.value - touchCurrentY;
    if (touchDiff > scrollThreshold) {
        isRsvpFadingOut.value = true;
        await new Promise((resolve) => setTimeout(resolve, 500));
        isRsvpFadingOut.value = false;
        isPage5TransitionStarted.value = true;
        await navigateToCountingPage();
    }
};

const navigateToCountingPage = async () => {
    await playPage5TransitionAnimation();
    isPage5TransitionFinished.value = true;
    router.push("/counting");
    page5IdleImageSrc.value =
        "/assets/screenFive/SCREEN5_IDLE/screen5idle_frame0000.png";
};

const playPage5TransitionAnimation = async () => {
    const frames = await preloadImages(
        "/assets/screenFive/SCREEN5_INTRANSITION/screen5intransition_frame",
        11
    );
    for (const frame of frames) {
        page5TransitionImageSrc.value = frame;
        await new Promise((resolve) => setTimeout(resolve, 100));
    }
};

watch(
    () => router.currentRoute.value,
    (newRoute) => {
        if (newRoute.path === "/") {
            currentFrame.value = 0;
            imageSrc.value = images.value[0];
            window.scrollTo(0, 0);
            isTransitioning.value = false;
            isTransitionFinished.value = false;
            isPage2OutTransitionFinished.value = false;
            isPage2OutTransitioning.value = false;
            isPage2IdleVisible.value = true;
            isIdleVisible.value = true;
            isScrollTextVisible.value = true;
            isPage5TransitionFinished.value = false;
            isRsvpIdleVisible.value = true; // Reset RSVP idle visibility
            isPage3FadingOut.value = false;
            isPage3FadingIn.value = false;
            isRsvpFadingOut.value = false;
            isPage5TransitionStarted.value = false;
        }
    }
);
</script>

<template>
    <div
        class="bg-[#FFF4E2] min-h-screen flex flex-col items-center justify-center relative"
        @touchstart="handleTouchStart"
        @touchmove="handleTouchMove"
    >
        <div
            v-if="isLoading"
            class="fixed z-50 inset-0 bg-[#FFF4E2] flex items-center justify-center flex-col"
        >
            <span class="loader"></span>
            <span class="text-brown-600 mt-4"
                >Loading... {{ loadingPercentage }}%</span
            >
        </div>
        <div v-else class="flex flex-col items-center justify-center w-full">
            <div class="flex items-center justify-center relative">
                <transition name="fade">
                    <img
                        v-if="isIdleVisible && imageSrc"
                        :src="imageSrc"
                        alt="Screen 1 Idle"
                        class="max-w-full max-h-full object-contain"
                    />
                </transition>
                <p
                    v-if="isScrollTextVisible"
                    class="text-[#9A7373] absolute bottom-0 left-1/2 transform -translate-x-1/2 mb-4"
                >
                    scroll to open
                </p>
            </div>
        </div>
        <div class="fixed top-0 left-0 w-full h-full">
            <transition name="fade">
                <img
                    v-if="
                        transitionImageSrc &&
                        !isPage2OutTransitionFinished &&
                        !isTransitionFinished
                    "
                    :src="transitionImageSrc"
                    alt="Transition"
                    class="w-full h-full object-cover"
                />
            </transition>
        </div>
        <div class="fixed top-0 left-0 w-full h-full">
            <transition name="fade">
                <img
                    v-if="page3TransitionImageSrc && !isPage3TransitionFinished"
                    :src="page3TransitionImageSrc"
                    alt="Page 3 Transition"
                    class="w-full h-full object-cover"
                />
            </transition>
        </div>
        <div class="fixed top-0 left-0 w-full h-full">
            <transition name="fade">
                <img
                    v-if="page5TransitionImageSrc && !isPage5TransitionFinished"
                    :src="page5TransitionImageSrc"
                    alt="Page 5 Transition"
                    class="w-full h-full object-cover"
                />
            </transition>
        </div>
        <router-view v-slot="{ Component }">
            <transition name="fade">
                <component :is="Component" />
            </transition>
        </router-view>
        <div
            v-if="$route.path === '/time'"
            class="fixed top-0 left-0 w-full h-full"
            @touchstart="handleTouchStart"
            @touchmove="handleTimePageTouchMove"
        >
            <img
                v-if="page2IdleImageSrc && isPage2IdleVisible"
                :src="page2IdleImageSrc"
                alt="Page 2 Idle"
                class="w-full h-full object-cover"
            />
            <transition name="fade">
                <img
                    v-if="page2OutTransitionImageSrc && isPage2OutTransitioning"
                    :src="page2OutTransitionImageSrc"
                    alt="Page 2 Out Transition"
                    class="w-full h-full object-cover"
                />
            </transition>
        </div>
        <div
            v-if="$route.path === '/location'"
            class="fixed top-0 left-0 w-full h-full bg-[#FFF4E2]"
            @touchstart="handleTouchStart"
            @touchmove="handleLocationPageTouchMove"
        >
            <transition name="fade">
                <img
                    v-if="
                        page3IdleImageSrc &&
                        !isPage3FadingOut &&
                        !isPage3FadingIn
                    "
                    :src="page3IdleImageSrc"
                    alt="Page 3 Idle"
                    class="w-full h-full object-cover"
                />
            </transition>
        </div>
        <div
            v-if="$route.path === '/rsvp'"
            class="fixed top-0 left-0 w-full h-full"
            @touchstart="handleTouchStart"
            @touchmove="handleRsvpPageTouchMove"
        >
            <transition name="fade">
                <img
                    v-if="
                        rsvpIdleImageSrc &&
                        !isRsvpFadingOut &&
                        !isPage5TransitionStarted
                    "
                    :src="rsvpIdleImageSrc"
                    alt="RSVP Idle"
                    class="w-full h-full object-cover"
                />
            </transition>
        </div>
        <div
            v-if="$route.path === '/counting'"
            class="fixed top-0 left-0 w-full h-full"
        >
            <img
                v-if="page5IdleImageSrc"
                :src="page5IdleImageSrc"
                alt="Page 5 Idle"
                class="w-full h-full object-cover"
            />
        </div>
    </div>
</template>
<style>
html,
body {
    background-color: #fff4e2;
}
.fade-enter-active,
.fade-leave-active {
    transition: opacity 0.5s;
}
.fade-enter,
.fade-leave-to {
    opacity: 0;
}
.loader {
    width: 48px;
    height: 48px;
    border: 5px solid #9a7373;
    border-bottom-color: transparent;
    border-radius: 50%;
    display: inline-block;
    box-sizing: border-box;
    animation: rotation 1s linear infinite;
}
@keyframes rotation {
    0% {
        transform: rotate(0deg);
    }
    100% {
        transform: rotate(360deg);
    }
}
</style>
