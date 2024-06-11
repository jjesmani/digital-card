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

const preloadImages = async (path, totalFrames, step = 1) => {
  const imagePaths = [];
  for (let i = 0; i < totalFrames; i += step) {
    const imagePath = `${path}${i.toString().padStart(4, "0")}.png`;
    imagePaths.push(imagePath);
  }
  return imagePaths;
};

onMounted(async () => {
  const screenOneIdleFrames = await preloadImages(
    "/assets/screenOne/SCREEN1_IDLE/screen1idle_frame",
    8,
    1
  );
  const screenOneOutTransitionFrames = await preloadImages(
    "/assets/screenOne/SCREEN1_OUTTRANSITION/screen1outtransition_frame",
    12
  );
  const screenTwoInTransitionFrames = await preloadImages(
    "/assets/screenTwo/SCREEN2_INTRANSITION/screen2intransition_frame",
    24
  );
  const screenTwoIdleFrames = await preloadImages(
    "/assets/screenTwo/SCREEN2_IDLE/screen2idle_frame",
    8,
    2
  );
  const screenTwoOutTransitionFrames = await preloadImages(
    "/assets/screenTwo/SCREEN2_OUTTRANSITION/screen2outtransition_frame",
    11
  );
  const screenThreeInTransitionFrames = await preloadImages(
    "/assets/screenThree/SCREEN3_INTRANSITION/screen3intransition_frame",
    15
  );
  const screenThreeIdleFrames = await preloadImages(
    "/assets/screenThree/SCREEN3_IDLE/screen3idle_frame",
    7
  );
  const screenThreeOutTransitionFrames = await preloadImages(
    "/assets/screenThree/SCREEN3_OUTTRANSITION/screen3outtransition_frame",
    17
  );

  // Store the preloaded frames in separate variables or an object

  isLoading.value = false;

  // Start the initial animation
  startAnimation(screenOneIdleFrames, 100);
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
        60
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
  await playTransitionAnimation(
    "/assets/screenTwo/SCREEN2_INTRANSITION/screen2intransition_frame",
    24,
    60
  );
  router.push("/time");
  page2IdleImageSrc.value = await startIdleAnimation(
    "/assets/screenTwo/SCREEN2_IDLE/screen2idle_frame",
    8,
    120,
    page2IdleAnimationInterval
  );
};

const startIdleAnimation = async (
  path,
  totalFrames,
  interval,
  animationInterval
) => {
  const frames = await preloadImages(path, totalFrames, 2);
  let frameIndex = 0;
  animationInterval = setInterval(() => {
    frameIndex = (frameIndex + 1) % frames.length;
    page2IdleImageSrc.value = frames[frameIndex];
  }, interval);
  return frames[frameIndex];
};

const stopIdleAnimation = () => {
  clearInterval(page2IdleAnimationInterval);
  clearInterval(page3IdleAnimationInterval);
};

const handleTimePageTouchMove = async (event) => {
  if (!isPage2OutTransitioning.value) {
    const touchCurrentY = event.touches[0].clientY;
    const touchDiff = touchStartY.value - touchCurrentY;
    if (touchDiff > scrollThreshold) {
      isPage2OutTransitioning.value = true;
      isPage2IdleVisible.value = false;
      stopIdleAnimation();
      await playTransitionAnimation(
        "/assets/screenTwo/SCREEN2_OUTTRANSITION/screen2outtransition_frame",
        11,
        50
      );
      isPage2OutTransitionFinished.value = true;
      await navigateToLocationPage();
    }
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
    100,
    page3IdleAnimationInterval
  );
};

const handleLocationPageTouchMove = async (event) => {
  console.log("handleLocationPageTouchMove called");
  if (!isPage3OutTransitioning.value) {
    console.log("isPage3OutTransitioning is false");
    const touchCurrentY = event.touches[0].clientY;
    const touchDiff = touchStartY.value - touchCurrentY;
    console.log("touchDiff:", touchDiff);
    if (touchDiff > scrollThreshold) {
      console.log("Scroll threshold exceeded");
      isPage3OutTransitioning.value = true;
      stopIdleAnimation();
      console.log("Playing screen3 out transition animation");
      await playTransitionAnimation(
        "/assets/screenThree/SCREEN3_OUTTRANSITION/screen3outtransition_frame",
        17,
        60
      );
      console.log("Screen3 out transition animation finished");
      isPage3OutTransitionFinished.value = true;
      await navigateToRsvpPage();
    }
  }
};

const navigateToRsvpPage = async () => {
  console.log("Navigating to RSVP page");
  router.push("/rsvp");
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
            !isPage3OutTransitionFinished
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
          v-if="page3OutTransitionImageSrc && isPage3OutTransitioning"
          :src="page3OutTransitionImageSrc"
          alt="Page 3 Out Transition"
          class="w-full h-full object-cover"
        />
      </transition>
    </div>
    <router-view v-slot="{ Component }">
      <transition name="fade" mode="out-in">
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
    </div>
    <div
      v-if="$route.path === '/location'"
      class="fixed top-0 left-0 w-full h-full"
      @touchstart="handleTouchStart"
      @touchmove="handleLocationPageTouchMove"
    >
      <img
        v-if="page3IdleImageSrc && !isPage3OutTransitioning"
        :src="page3IdleImageSrc"
        alt="Page 3 Idle"
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
</style>
