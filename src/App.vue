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
let page3IdleAnimationInterval = null;
const page3OutTransitionImageSrc = ref("");
const isPage3OutTransitioning = ref(false);
const isPage3OutTransitionFinished = ref(false);
const isLoading = ref(true);
const rsvpIdleImageSrc = ref("");
const page2OutTransitionImageSrc = ref("");
const page4OutTransitionImageSrc = ref("");
const isPage4OutTransitioning = ref(false);
const isPage4OutTransitionFinished = ref(false);
const page5TransitionImageSrc = ref("");
const isPage5TransitionFinished = ref(false);
const page5IdleImageSrc = ref("");
let page5IdleAnimationInterval = null;

const preloadImages = async (path, totalFrames) => {
    const imagePaths = [];
    for (let i = 0; i < totalFrames; i++) {
        const imagePath = `${path}${i.toString().padStart(4, "0")}.png`;
        imagePaths.push(imagePath);
    }
    const imagePromises = imagePaths.map((path) => {
        return new Promise((resolve, reject) => {
            const img = new Image();
            img.onload = () => {
                console.log(`Loaded image: ${path}`);
                resolve();
            };
            img.onerror = () =>
                reject(new Error(`Failed to load image: ${path}`));
            img.src = path;
        });
    });
    try {
        await Promise.all(imagePromises);
        return imagePaths;
    } catch (error) {
        console.error("Error preloading images:", error);
        return [];
    }
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
        console.log("Loading screen 3 idle animation frames...");
        const screenThreeIdleFrames = await preloadImages(
            "/assets/screenThree/SCREEN3_IDLE/screen3idle_frame",
            7
        );
        console.log("Loading screen 3 out transition frames...");
        const screenThreeOutTransitionFrames = await preloadImages(
            "/assets/screenThree/SCREEN3_OUTTRANSITION/screen3outtransition_frame",
            16
        );
        console.log("Loading screen 4 out transition frames...");
        const screenFourOutTransitionFrames = await preloadImages(
            "/assets/screenFour/screen4outtransition_frame",
            11
        );
        console.log("Loading screen 5 in transition frames...");
        const screenFiveInTransitionFrames = await preloadImages(
            "/assets/screenFive/SCREEN5_INTRANSITION/screen5intransition_frame",
            11
        );
        console.log("Loading screen 5 idle animation frames...");
        const screenFiveIdleFrames = await preloadImages(
            "/assets/screenFive/SCREEN5_IDLE/screen5idle_frame",
            8
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
        } else if (path.includes("SCREEN3")) {
            page3IdleImageSrc.value = frames[frameIndex];
        } else if (path.includes("SCREEN5")) {
            page5IdleImageSrc.value = frames[frameIndex];
        }
    }, interval);
    return frames[frameIndex];
};

const stopIdleAnimation = () => {
    clearInterval(page2IdleAnimationInterval);
    clearInterval(page3IdleAnimationInterval);
    clearInterval(page5IdleAnimationInterval);
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
    page3IdleImageSrc.value = await startIdleAnimation(
        "/assets/screenThree/SCREEN3_IDLE/screen3idle_frame",
        7,
        170,
        page3IdleAnimationInterval
    );
};

const handleLocationPageTouchMove = async (event) => {
    if (!isPage3OutTransitioning.value) {
        const touchCurrentY = event.touches[0].clientY;
        const touchDiff = touchStartY.value - touchCurrentY;
        if (touchDiff > scrollThreshold) {
            isPage3OutTransitioning.value = true;
            stopIdleAnimation();
            await playPage3OutTransitionAnimation();
            isPage3OutTransitionFinished.value = true;
            await navigateToRsvpPage();
        }
    }
};

const playPage3OutTransitionAnimation = async () => {
    const frames = await preloadImages(
        "/assets/screenThree/SCREEN3_OUTTRANSITION/screen3outtransition_frame",
        16
    );
    for (const frame of frames) {
        page3OutTransitionImageSrc.value = frame;
        await new Promise((resolve) => setTimeout(resolve, 100));
    }
    rsvpIdleImageSrc.value = frames[frames.length - 1];
};

const navigateToRsvpPage = async () => {
    router.push("/rsvp");
};

const handleRsvpPageTouchMove = async (event) => {
    if (!isPage4OutTransitioning.value) {
        const touchCurrentY = event.touches[0].clientY;
        const touchDiff = touchStartY.value - touchCurrentY;
        if (touchDiff > scrollThreshold) {
            isPage4OutTransitioning.value = true;
            await playPage4OutTransitionAnimation();
            isPage4OutTransitionFinished.value = true;
            await navigateToCountingPage();
        }
    }
};

const playPage4OutTransitionAnimation = async () => {
    const frames = await preloadImages(
        "/assets/screenFour/screen4outtransition_frame",
        11
    );
    for (const frame of frames) {
        page4OutTransitionImageSrc.value = frame;
        await new Promise((resolve) => setTimeout(resolve, 100));
    }
};

const navigateToCountingPage = async () => {
    await playPage5TransitionAnimation();
    isPage5TransitionFinished.value = true;
    router.push("/counting");
    page5IdleImageSrc.value = await startIdleAnimation(
        "/assets/screenFive/SCREEN5_IDLE/screen5idle_frame",
        8,
        200,
        page5IdleAnimationInterval
    );
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
            isPage4OutTransitioning.value = false;
            isPage4OutTransitionFinished.value = false;
            isPage5TransitionFinished.value = false;
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
            class="fixed z-50 inset-0 bg-[#FFF4E2] flex items-center justify-center"
        >
            <span class="text-brown-600">Loading...</span>
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
                        !isPage3OutTransitionFinished &&
                        !isPage4OutTransitionFinished &&
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
            <img
                v-if="page3IdleImageSrc && !isPage3OutTransitioning"
                :src="page3IdleImageSrc"
                alt="Page 3 Idle"
                class="w-full h-full object-cover"
            />
            <transition name="fade">
                <img
                    v-if="page3OutTransitionImageSrc && isPage3OutTransitioning"
                    :src="page3OutTransitionImageSrc"
                    alt="Page 3 Out Transition"
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
            <img
                v-if="
                    rsvpIdleImageSrc &&
                    !isPage4OutTransitioning &&
                    !isPage4OutTransitionFinished
                "
                :src="rsvpIdleImageSrc"
                alt="RSVP Idle"
                class="w-full h-full object-cover"
            />
            <transition name="fade">
                <img
                    v-if="
                        page4OutTransitionImageSrc &&
                        (isPage4OutTransitioning ||
                            isPage4OutTransitionFinished)
                    "
                    :src="page4OutTransitionImageSrc"
                    alt="Page 4 Out Transition"
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
    transition: opacity 0.3s;
}

.fade-enter,
.fade-leave-to {
    opacity: 0;
}
</style>
