<script setup>
import { ref, onMounted, watch } from "vue";
import { useRouter } from "vue-router";

const router = useRouter();
const currentFrame = ref(0);
const totalFrames = 96; // Using frames 0000 to 0095
const imageSrc = ref("");
const images = ref([]);
const isIdleVisible = ref(true);
const isTransitionFinished = ref(false);
const touchStartY = ref(0);
const scrollThreshold = 50; // Adjust the scroll threshold as needed
const isScrollTextVisible = ref(true);
const page2TransitionFrames = ref([]);
const totalPage2TransitionFrames = 49; // Using frames 0000 to 0048
const isPage2TransitionFinished = ref(false);
const page2IdleFrames = ref([]);
const totalPage2IdleFrames = 32; // Using frames 0000 to 0031
const page2IdleImageSrc = ref("");
const page2OutTransitionFrames = ref([]);
const totalPage2OutTransitionFrames = 10; // Using frames 0000 to 0009
const isPage2OutTransitionFinished = ref(false);
const isPage2OutTransitioning = ref(false);
let page2IdleAnimationInterval = null;

const page3TransitionFrames = ref([]);
const totalPage3TransitionFrames = 15; // Using frames 0000 to 0027
const isPage3TransitionFinished = ref(false);
const page3TransitionImageSrc = ref("");

const page3IdleFrames = ref([]);
const totalPage3IdleFrames = 32; // Using frames 0000 to 0031
const page3IdleImageSrc = ref("");
let page3IdleAnimationInterval = null;

const preloadImages = async () => {
  const imagePromises = [];
  for (let i = 0; i < totalFrames; i++) {
    const imageModule = import(
      `./assets/screenOne/PG1_IDLE/screen1idle_frame${i
        .toString()
        .padStart(4, "0")}.png`
    );
    imagePromises.push(imageModule);
  }
  try {
    const loadedImages = await Promise.all(imagePromises);
    images.value = loadedImages.map((module) => module.default);
  } catch (error) {
    console.error("Error preloading images:", error);
  }
};

onMounted(async () => {
  await preloadImages();
  startAnimation();
});

const startAnimation = () => {
  setInterval(() => {
    currentFrame.value = (currentFrame.value + 1) % totalFrames;
    imageSrc.value = images.value[currentFrame.value];
  }, 25); // Adjust the interval duration (in milliseconds) to control the animation speed
};

const transitionFrames = ref([]);
const totalTransitionFrames = 23; // Using frames 0000 to 0022 for the transition
const transitionImageSrc = ref("");
const isTransitioning = ref(false);

const preloadTransitionImages = async () => {
  const imagePromises = [];
  for (let i = 0; i < totalTransitionFrames; i++) {
    const imageModule = import(
      `./assets/screenOne/PG1_TRANSITION/screen1_frame${i
        .toString()
        .padStart(4, "0")}.png`
    );
    imagePromises.push(imageModule);
  }
  try {
    const loadedImages = await Promise.all(imagePromises);
    transitionFrames.value = loadedImages.map((module) => module.default);
  } catch (error) {
    console.error("Error preloading transition images:", error);
  }
};

onMounted(async () => {
  await preloadTransitionImages();
});

const handleTouchStart = (event) => {
  touchStartY.value = event.touches[0].clientY;
};

const handleTouchMove = (event) => {
  if (!isTransitioning.value) {
    const touchCurrentY = event.touches[0].clientY;
    const touchDiff = touchStartY.value - touchCurrentY;
    if (touchDiff > scrollThreshold) {
      console.log("Transitioning from root screen to time screen");
      isTransitioning.value = true;
      isIdleVisible.value = false;
      isScrollTextVisible.value = false;
      playTransitionAnimation();
    }
  }
};

const playTransitionAnimation = () => {
  let frameIndex = 0;
  const animationInterval = setInterval(() => {
    transitionImageSrc.value = transitionFrames.value[frameIndex];
    console.log(`Transition frame: ${frameIndex}`);
    frameIndex++;
    if (frameIndex >= totalTransitionFrames) {
      clearInterval(animationInterval);
      isTransitionFinished.value = true;
      navigateToNextPage();
    }
  }, 50); // Adjust the interval duration (in milliseconds) to control the transition animation speed
};

const navigateToNextPage = () => {
  const preloadPage2TransitionImages = async () => {
    const imagePromises = [];
    for (let i = 0; i < totalPage2TransitionFrames; i++) {
      const imageModule = import(
        `./assets/screenTwo/Page2_InTransition/screen2intransition_frame${i
          .toString()
          .padStart(4, "0")}.png`
      );
      imagePromises.push(imageModule);
    }
    try {
      const loadedImages = await Promise.all(imagePromises);
      page2TransitionFrames.value = loadedImages.map(
        (module) => module.default
      );
    } catch (error) {
      console.error("Error preloading page 2 transition images:", error);
    }
  };

  preloadPage2TransitionImages().then(() => {
    let page2FrameIndex = 0;
    const page2AnimationInterval = setInterval(() => {
      transitionImageSrc.value = page2TransitionFrames.value[page2FrameIndex];
      page2FrameIndex++;
      if (page2FrameIndex >= totalPage2TransitionFrames) {
        clearInterval(page2AnimationInterval);
        isPage2TransitionFinished.value = true;
        navigateToTimePage();
      }
    }, 50); // Adjust the interval duration (in milliseconds) to control the page 2 transition animation speed
  });
};

const navigateToTimePage = () => {
  const preloadPage2IdleImages = async () => {
    const imagePromises = [];
    for (let i = 0; i < totalPage2IdleFrames; i++) {
      const imageModule = import(
        `./assets/screenTwo/Page2_Idle/screen2idle_frame${i
          .toString()
          .padStart(4, "0")}.png`
      );
      imagePromises.push(imageModule);
    }
    try {
      const loadedImages = await Promise.all(imagePromises);
      page2IdleFrames.value = loadedImages.map((module) => module.default);
    } catch (error) {
      console.error("Error preloading page 2 idle images:", error);
    }
  };

  preloadPage2IdleImages().then(() => {
    router.push("/time");
    startPage2IdleAnimation();
  });
};

const startPage2IdleAnimation = () => {
  let page2IdleFrameIndex = 0;
  page2IdleAnimationInterval = setInterval(() => {
    page2IdleImageSrc.value = page2IdleFrames.value[page2IdleFrameIndex];
    page2IdleFrameIndex = (page2IdleFrameIndex + 1) % totalPage2IdleFrames;
  }, 50); // Adjust the interval duration (in milliseconds) to control the page 2 idle animation speed
};

const stopPage2IdleAnimation = () => {
  clearInterval(page2IdleAnimationInterval);
};

const handleTimePageTouchStart = (event) => {
  touchStartY.value = event.touches[0].clientY;
};

const handleTimePageTouchMove = (event) => {
  if (!isPage2OutTransitioning.value) {
    const touchCurrentY = event.touches[0].clientY;
    const touchDiff = touchStartY.value - touchCurrentY;
    if (touchDiff > scrollThreshold) {
      console.log("Transitioning from time screen to location screen");
      isPage2OutTransitioning.value = true;
      stopPage2IdleAnimation();
      playPage2OutTransitionAnimation();
    }
  }
};

const playPage2OutTransitionAnimation = () => {
  let frameIndex = 0;
  const animationInterval = setInterval(() => {
    if (
      page2OutTransitionFrames.value &&
      page2OutTransitionFrames.value.length > 0 &&
      frameIndex < page2OutTransitionFrames.value.length
    ) {
      page2IdleImageSrc.value = page2OutTransitionFrames.value[frameIndex];
      console.log(`Page 2 out transition frame: ${frameIndex}`);
      frameIndex++;
      if (frameIndex >= page2OutTransitionFrames.value.length) {
        clearInterval(animationInterval);
        isPage2OutTransitionFinished.value = true;
        navigateToLocationPage();
      }
    }
  }, 80); // Adjust the interval duration (in milliseconds) to control page 2 out transition speed
};

const preloadPage3TransitionImages = async () => {
  const imagePromises = [];
  for (let i = 0; i < totalPage3TransitionFrames; i++) {
    const imageModule = import(
      `./assets/screenThree/page3_intransition/page3intransition_frame${i
        .toString()
        .padStart(4, "0")}.png`
    );
    imagePromises.push(imageModule);
  }
  try {
    const loadedImages = await Promise.all(imagePromises);
    page3TransitionFrames.value = loadedImages.map((module) => module.default);
  } catch (error) {
    console.error("Error preloading page 3 transition images:", error);
  }
};

onMounted(async () => {
  await preloadPage3TransitionImages();
});

const navigateToLocationPage = () => {
  let page3FrameIndex = 0;
  const page3AnimationInterval = setInterval(() => {
    page3TransitionImageSrc.value =
      page3TransitionFrames.value[page3FrameIndex];
    page3FrameIndex++;
    if (page3FrameIndex >= totalPage3TransitionFrames) {
      clearInterval(page3AnimationInterval);
      isPage3TransitionFinished.value = true;
      navigateToLocationIdlePage();
    }
  }, 80); // Adjust the interval duration (in milliseconds) to control the page 3 transition animation speed
};

const navigateToLocationIdlePage = () => {
  const preloadPage3IdleImages = async () => {
    const imagePromises = [];
    for (let i = 0; i < totalPage3IdleFrames; i++) {
      const imageModule = import(
        `./assets/screenThree/page3_idle/Screen3idle_frame${i
          .toString()
          .padStart(4, "0")}.png`
      );
      imagePromises.push(imageModule);
    }
    try {
      const loadedImages = await Promise.all(imagePromises);
      page3IdleFrames.value = loadedImages.map((module) => module.default);
    } catch (error) {
      console.error("Error preloading page 3 idle images:", error);
    }
  };

  preloadPage3IdleImages().then(() => {
    router.push("/location");
    startPage3IdleAnimation();
  });
};

const startPage3IdleAnimation = () => {
  let page3IdleFrameIndex = 0;
  page3IdleAnimationInterval = setInterval(() => {
    page3IdleImageSrc.value = page3IdleFrames.value[page3IdleFrameIndex];
    page3IdleFrameIndex = (page3IdleFrameIndex + 1) % totalPage3IdleFrames;
  }, 30); // Adjust the interval duration (in milliseconds) to control the page 3 idle animation speed
};

const stopPage3IdleAnimation = () => {
  clearInterval(page3IdleAnimationInterval);
};

const preloadPage2OutTransitionImages = async () => {
  const imagePromises = [];
  for (let i = 0; i < totalPage2OutTransitionFrames; i++) {
    const imageModule = import(
      `./assets/screenTwo/Page2_OutTransition/screen2outtransition_frame${i
        .toString()
        .padStart(4, "0")}.png`
    );
    imagePromises.push(imageModule);
  }
  try {
    const loadedImages = await Promise.all(imagePromises);
    page2OutTransitionFrames.value = loadedImages.map(
      (module) => module.default
    );
  } catch (error) {
    console.error("Error preloading page 2 out transition images:", error);
  }
};

onMounted(async () => {
  await preloadPage2OutTransitionImages();
});

watch(
  () => router.currentRoute.value,
  (newRoute) => {
    if (newRoute.path === "/") {
      currentFrame.value = 0;
      imageSrc.value = images.value[0];
      window.scrollTo(0, 0);
      isTransitioning.value = false;
      isTransitionFinished.value = false;
      isPage2TransitionFinished.value = false;
      isPage2OutTransitionFinished.value = false;
      isPage2OutTransitioning.value = false;
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
    <div class="flex flex-col items-center justify-center w-full">
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
            !isPage2TransitionFinished &&
            !isPage2OutTransitionFinished
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
    <router-view v-slot="{ Component }">
      <transition name="fade" mode="out-in">
        <component :is="Component" />
      </transition>
    </router-view>
    <div
      v-if="$route.path === '/time'"
      class="fixed top-0 left-0 w-full h-full"
      @touchstart="handleTimePageTouchStart"
      @touchmove="handleTimePageTouchMove"
    >
      <img
        v-if="page2IdleImageSrc && !isPage2OutTransitionFinished"
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
