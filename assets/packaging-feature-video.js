const featureImage = document.querySelector("#packagingFeatureImage");
const featureVideo = document.querySelector("#packagingFeatureVideo");
const featureBrand = document.querySelector("#packagingFeatureBrand");
const featureMeta = document.querySelector("#packagingFeatureMeta");
const featureKicker = document.querySelector("#packagingFeatureKicker");
const featureTitle = document.querySelector("#packagingFeatureTitle");
const featureCopy = document.querySelector("#packagingFeatureCopy");
const featureProject = document.querySelector("#packagingFeatureProject");
const featureTabs = [...document.querySelectorAll(".packaging-feature-switcher button")];

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

const packagingSection = document.querySelector("#packaging-showcase");
if (packagingSection) {
  new IntersectionObserver(([entry]) => {
    if (!entry.isIntersecting) featureVideo.pause();
    else if (featureVideo.classList.contains("active")) featureVideo.play().catch(() => {});
  }, { threshold: 0.12 }).observe(packagingSection);
}

featureProject?.addEventListener("click", () => {
  if (featureProject.dataset.project !== "laotan-packaging") return;

  const dialog = document.querySelector("#caseDialog");
  const gallery = document.querySelector("#caseDialogGallery");
  const lightbox = document.querySelector("#caseImageLightbox");
  const lightboxImage = document.querySelector("#caseImageLightboxImage");
  const lightboxCaption = document.querySelector("#caseImageLightboxCaption");

  document.querySelector("#caseDialogTitle").textContent = "老坛酸菜面调料包装";
  document.querySelector("#caseDialogMeta").textContent = "食品包装 · 2026";
  document.querySelector("#caseDialogSummary").textContent =
    "以紫黄撞色与地域风味场景强化酸菜面调料的味觉记忆，呈现包装系统、产品形态与核心卖点。";

  const tiles = [1, 2, 3].map((number) => {
    const button = document.createElement("button");
    button.type = "button";
    button.className = "case-gallery-tile";
    button.setAttribute("aria-label", `查看老坛酸菜面调料包装第 ${number} 张大图`);

    const image = document.createElement("img");
    image.src = `/works/laotan-packaging/${String(number).padStart(2, "0")}.webp`;
    image.alt = `老坛酸菜面调料包装 — 图片 ${number}`;
    image.loading = "lazy";
    image.addEventListener("load", () => {
      const ratio = image.naturalWidth / image.naturalHeight;
      button.style.setProperty("--preview-ratio", `${image.naturalWidth} / ${image.naturalHeight}`);
      button.classList.toggle("is-wide", ratio >= 1.45);
      button.classList.toggle("is-landscape", ratio >= 1 && ratio < 1.45);
      button.classList.toggle("is-standard", ratio >= .46 && ratio < 1);
    }, { once: true });

    button.append(image);
    button.addEventListener("click", () => {
      lightboxImage.src = image.src;
      lightboxImage.alt = image.alt;
      lightboxCaption.textContent = `老坛酸菜面调料包装 · ${String(number).padStart(2, "0")}`;
      lightbox.classList.remove("is-phone-preview");
      lightbox.showModal();
    });
    return button;
  });

  gallery.replaceChildren(...tiles);
  dialog.showModal();
});
