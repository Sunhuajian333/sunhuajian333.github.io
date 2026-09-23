const featureImage = document.querySelector("#packagingFeatureImage");
const featureVideo = document.querySelector("#packagingFeatureVideo");
const featureBrand = document.querySelector("#packagingFeatureBrand");
const featureMeta = document.querySelector("#packagingFeatureMeta");
const featureKicker = document.querySelector("#packagingFeatureKicker");
const featureTitle = document.querySelector("#packagingFeatureTitle");
const featureCopy = document.querySelector("#packagingFeatureCopy");
const featureProject = document.querySelector("#packagingFeatureProject");
const featureTabs = [...document.querySelectorAll(".packaging-feature-switcher button")];
const laotanEndingImage = "/works/laotan-packaging/ending.webp";

function setTwoLineText(element, value = "") {
  const [first, second = ""] = value.split("|");
  element.replaceChildren(
    document.createTextNode(first),
    document.createElement("br"),
    document.createTextNode(second),
  );
}

function setActiveTab(activeTab) {
  featureTabs.forEach((tab) => {
    const active = tab === activeTab;
    tab.classList.toggle("active", active);
    tab.setAttribute("aria-selected", String(active));
  });
}

featureTabs.forEach((tab) => {
  tab.addEventListener("click", () => {
    setActiveTab(tab);

    if (!tab.dataset.packagingVideo) {
      featureVideo.pause();
      featureVideo.classList.remove("active");
      featureImage.classList.remove("media-hidden");
      return;
    }

    featureImage.classList.add("media-hidden");
    featureVideo.classList.add("active");
    featureBrand.textContent = tab.dataset.packagingBrand;
    featureMeta.textContent = tab.dataset.packagingMeta;
    featureKicker.textContent = tab.dataset.packagingKicker;
    setTwoLineText(featureTitle, tab.dataset.packagingTitle);
    setTwoLineText(featureCopy, tab.dataset.packagingCopy);
    featureProject.dataset.project = tab.dataset.packagingProject;
    featureVideo.currentTime = 0;
    featureVideo.play().catch(() => {});
  });
});

featureVideo.addEventListener("ended", () => {
  featureImage.src = laotanEndingImage;
  featureImage.alt = "老坛酸菜面调料包装场景展示";
  featureImage.classList.remove("media-hidden");
  featureVideo.classList.remove("active");
  featureImage.animate(
    [{ opacity: .35 }, { opacity: 1 }],
    { duration: 420, easing: "ease-out" },
  );
});

const packagingSection = document.querySelector("#packaging-showcase");
if (packagingSection) {
  new IntersectionObserver(([entry]) => {
    if (!entry.isIntersecting) featureVideo.pause();
    else if (featureVideo.classList.contains("active")) featureVideo.play().catch(() => {});
  }, { threshold: 0.12 }).observe(packagingSection);
}

featureProject?.addEventListener("click", () => {
  if (featureProject.dataset.project !== "laotan-packaging") return;
  window.location.href = "/projects/laotan/";
});
