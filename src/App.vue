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
    120
  );
};

const startIdleAnimation = async (path, totalFrames, interval) => {
  const frames = await preloadImages(path, totalFrames, 2);
  let frameIndex = 0;
  page2IdleAnimationInterval = setInterval(() => {
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
  page3IdleImageSrc.value = await startPage3IdleAnimation(
    "/assets/screenThree/SCREEN3_IDLE/screen3idle_frame",
    7,
    100
  );
};

const startPage3IdleAnimation = async (path, totalFrames, interval) => {
  const frames = await preloadImages(path, totalFrames);
  let frameIndex = 0;
  page3IdleAnimationInterval = setInterval(() => {
    frameIndex = (frameIndex + 1) % frames.length;
    page3IdleImageSrc.value = frames[frameIndex];
  }, interval);
  return frames[frameIndex];
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
      <div role="status">
        <svg
          aria-hidden="true"
          class="w-8 h-8 text-gray-200 animate-spin dark:text-gray-600 fill-brown-600"
          viewBox="0 0 100 101"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path
            d="M100 50.5908C100 78.2051 77.6142 100.591 50 100.591C22.3858 100.591 0 78.2051 0 50.5908C0 22.9766 22.3858 0.59082 50 0.59082C77.6142 0.59082 100 22.9766 100 50.5908ZM9.08144 50.5908C9.08144 73.1895 27.4013 91.5094 50 91.5094C72.5987 91.5094 90.9186 73.1895 90.9186 50.5908C90.9186 27.9921 72.5987 9.67226 50 9.67226C27.4013 9.67226 9.08144 27.9921 9.08144 50.5908Z"
            fill="currentColor"
          />
          <path
            d="M93.9676 39.0409C96.393 38.4038 97.8624 35.9116 97.0079 33.5539C95.2932 28.8227 92.871 24.3692 89.8167 20.348C85.8452 15.1192 80.8826 10.7238 75.2124 7.41289C69.5422 4.10194 63.2754 1.94025 56.7698 1.05124C51.7666 0.367541 46.6976 0.446843 41.7345 1.27873C39.2613 1.69328 37.813 4.19778 38.4501 6.62326C39.0873 9.04874 41.5694 10.4717 44.0505 10.1071C47.8511 9.54855 51.7191 9.52689 55.5402 10.0491C60.8642 10.7766 65.9928 12.5457 70.6331 15.2552C75.2735 17.9648 79.3347 21.5619 82.5849 25.841C84.9175 28.9121 86.7997 32.2913 88.1811 35.8758C89.083 38.2158 91.5421 39.6781 93.9676 39.0409Z"
            fill="currentFill"
          />
        </svg>
        <span class="sr-only">Loading...</span>
      </div>
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
          v-if="transitionImageSrc && !isPage2OutTransitionFinished"
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
    >
      <img
        v-if="page3IdleImageSrc"
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
