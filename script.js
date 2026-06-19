const basePrice = 499;
const productName = "FuelBite Combo Pack";
const whatsappNumber = "919847217286";
const couponCode = "FIRSTBITE";
const discountRate = 0.2;

const state = {
  packs: 1,
  quantity: 1,
  cartPacks: 0,
  cartSubtotal: 0
};

const totalPrice = document.querySelector("[data-total-price]");
const regularPrice = document.querySelector("[data-regular-price]");
const discountAmount = document.querySelector("[data-discount-amount]");
const staticBasePrices = document.querySelectorAll("[data-base-price]");
const staticOfferPrices = document.querySelectorAll("[data-offer-price]");
const quantityOutput = document.querySelector("[data-quantity]");
const cartCount = document.querySelector("[data-cart-count]");
const cartBody = document.querySelector("[data-cart-body]");
const cartSubtotal = document.querySelector("[data-cart-subtotal]");
const cartDiscount = document.querySelector("[data-cart-discount]");
const cartTotal = document.querySelector("[data-cart-total]");
const cartDrawer = document.querySelector(".cart-drawer");
const cartBackdrop = document.querySelector("[data-cart-backdrop]");
const searchStatus = document.querySelector("[data-search-status]");
const couponCopyStatus = document.querySelector("[data-coupon-copy-status]");
const mobileTotal = document.querySelector("[data-mobile-total]");
const mobileRegular = document.querySelector("[data-mobile-regular]");
const selectionWhatsappLinks = document.querySelectorAll(".hero-whatsapp-link, .quick-whatsapp-link, .mobile-order-bar a");
const checkoutWhatsappLinks = document.querySelectorAll(".checkout-link");
const copyCouponButtons = document.querySelectorAll("[data-copy-coupon]");
const revealTargets = document.querySelectorAll("[data-reveal]");
const hero = document.querySelector("[data-hero]");
const reducedMotionQuery = window.matchMedia("(prefers-reduced-motion: reduce)");

function formatPrice(value) {
  return new Intl.NumberFormat("en-IN").format(value);
}

function getDiscount(subtotal) {
  return Math.round(subtotal * discountRate);
}

function updateStaticPricing() {
  const firstOrderDiscount = getDiscount(basePrice);
  const firstOrderTotal = basePrice - firstOrderDiscount;

  staticBasePrices.forEach((element) => {
    element.textContent = formatPrice(basePrice);
  });
  staticOfferPrices.forEach((element) => {
    element.textContent = formatPrice(firstOrderTotal);
  });
}

function updateSelection() {
  const selectedOrder = getOrderSnapshot(false);
  totalPrice.textContent = formatPrice(selectedOrder.total);
  regularPrice.textContent = formatPrice(selectedOrder.subtotal);
  discountAmount.textContent = formatPrice(selectedOrder.discount);
  mobileTotal.textContent = formatPrice(selectedOrder.total);
  mobileRegular.textContent = formatPrice(selectedOrder.subtotal);
  quantityOutput.value = state.quantity;
  quantityOutput.textContent = state.quantity;
  updateWhatsAppLinks();
}

function renderCart() {
  cartCount.textContent = state.cartPacks;
  const cartOrder = getOrderSnapshot(true);
  cartSubtotal.textContent = formatPrice(state.cartPacks ? cartOrder.subtotal : 0);
  cartDiscount.textContent = formatPrice(state.cartPacks ? cartOrder.discount : 0);
  cartTotal.textContent = formatPrice(state.cartPacks ? cartOrder.total : 0);

  if (!state.cartPacks) {
    cartBody.innerHTML = `
      <div class="cart-empty">
        <p>Choose your packs, then send the order on WhatsApp.</p>
        <button class="button button-primary cart-empty-add" type="button" data-cart-add-selection>Add selected pack</button>
      </div>
    `;
    updateWhatsAppLinks();
    return;
  }

  const bites = state.cartPacks * 12;
  cartBody.innerHTML = `
    <div class="cart-line">
      <div class="cart-line-info">
        <div>
          <h3>${productName}</h3>
          <p>${state.cartPacks} pack${state.cartPacks > 1 ? "s" : ""} / ${bites} bites with coupon ${couponCode}</p>
        </div>
        <strong><s>INR ${formatPrice(cartOrder.subtotal)}</s> INR ${formatPrice(cartOrder.total)}</strong>
      </div>
      <div class="cart-line-actions">
        <div class="cart-stepper" aria-label="Adjust pack quantity">
          <button type="button" data-cart-change="-1" aria-label="Remove one pack">-</button>
          <output aria-label="Packs in order">${state.cartPacks}</output>
          <button type="button" data-cart-change="1" aria-label="Add one pack">+</button>
        </div>
        <button class="cart-remove" type="button" data-cart-remove>Remove</button>
      </div>
    </div>
  `;
  updateWhatsAppLinks();
}

function getOrderSnapshot(preferCart) {
  const useCart = preferCart && state.cartPacks;
  const packs = useCart ? state.cartPacks : state.packs * state.quantity;
  const subtotal = useCart ? state.cartSubtotal : basePrice * state.packs * state.quantity;
  const discount = getDiscount(subtotal);
  const total = subtotal - discount;
  const bites = packs * 12;
  return { packs, subtotal, discount, total, bites };
}

function buildWhatsAppUrl(preferCart) {
  const order = getOrderSnapshot(preferCart);
  const message = [
    "Hi FuelBite, I want to order:",
    `${productName}`,
    `Quantity: ${order.packs} pack${order.packs > 1 ? "s" : ""} / ${order.bites} bites`,
    `Subtotal: INR ${formatPrice(order.subtotal)}`,
    `Coupon: ${couponCode} - 20% first order offer`,
    `Discount: INR ${formatPrice(order.discount)}`,
    `Total after coupon: INR ${formatPrice(order.total)}`,
    "Please confirm availability and delivery details."
  ].join("\n");

  return `https://wa.me/${whatsappNumber}?text=${encodeURIComponent(message)}`;
}

function updateWhatsAppLinks() {
  const selectionUrl = buildWhatsAppUrl(false);
  const checkoutUrl = buildWhatsAppUrl(true);
  selectionWhatsappLinks.forEach((link) => {
    link.href = selectionUrl;
  });
  checkoutWhatsappLinks.forEach((link) => {
    if (state.cartPacks) {
      link.href = checkoutUrl;
      link.classList.remove("is-disabled");
      link.removeAttribute("aria-disabled");
      link.removeAttribute("tabindex");
      return;
    }

    link.removeAttribute("href");
    link.classList.add("is-disabled");
    link.setAttribute("aria-disabled", "true");
    link.setAttribute("tabindex", "-1");
  });
}

function openCart() {
  cartDrawer.classList.add("is-open");
  cartDrawer.setAttribute("aria-hidden", "false");
  cartBackdrop.hidden = false;
  document.body.classList.add("is-locked");
}

function closeCart() {
  cartDrawer.classList.remove("is-open");
  cartDrawer.setAttribute("aria-hidden", "true");
  cartBackdrop.hidden = true;
  document.body.classList.remove("is-locked");
}

document.querySelectorAll("[data-packs]").forEach((button) => {
  button.addEventListener("click", () => {
    state.packs = Number(button.dataset.packs);
    document.querySelectorAll("[data-packs]").forEach((item) => {
      const isSelected = item === button;
      item.classList.toggle("is-selected", isSelected);
      item.setAttribute("aria-checked", String(isSelected));
    });
    updateSelection();
  });
});

document.querySelectorAll("[data-quantity-change]").forEach((button) => {
  button.addEventListener("click", () => {
    const nextQuantity = state.quantity + Number(button.dataset.quantityChange);
    state.quantity = Math.min(12, Math.max(1, nextQuantity));
    updateSelection();
  });
});

document.querySelectorAll(".add-button").forEach((button) => {
  button.addEventListener("click", () => {
    state.cartPacks += state.packs * state.quantity;
    state.cartSubtotal += basePrice * state.packs * state.quantity;
    renderCart();
    openCart();
  });
});

cartBody.addEventListener("click", (event) => {
  const changeButton = event.target.closest("[data-cart-change]");
  const removeButton = event.target.closest("[data-cart-remove]");
  const addSelectionButton = event.target.closest("[data-cart-add-selection]");

  if (addSelectionButton) {
    state.cartPacks = state.packs * state.quantity;
    state.cartSubtotal = state.cartPacks * basePrice;
    renderCart();
    return;
  }

  if (changeButton) {
    state.cartPacks = Math.max(0, state.cartPacks + Number(changeButton.dataset.cartChange));
    state.cartSubtotal = state.cartPacks * basePrice;
    renderCart();
    return;
  }

  if (removeButton) {
    state.cartPacks = 0;
    state.cartSubtotal = 0;
    renderCart();
  }
});

copyCouponButtons.forEach((button) => {
  button.addEventListener("click", () => {
    copyCouponCode();
  });
});

document.querySelector(".bag-button").addEventListener("click", openCart);
document.querySelector("[data-close-cart]").addEventListener("click", closeCart);
cartBackdrop.addEventListener("click", closeCart);

document.addEventListener("keydown", (event) => {
  if (event.key === "Escape") {
    closeCart();
  }
});

document.querySelectorAll(".thumb").forEach((thumb) => {
  thumb.addEventListener("click", () => {
    const galleryImage = document.querySelector("#gallery-image");
    galleryImage.src = thumb.dataset.image;
    galleryImage.alt = thumb.dataset.alt;
    document.querySelectorAll(".thumb").forEach((item) => item.classList.toggle("is-active", item === thumb));
  });
});

document.querySelectorAll(".faq-item button").forEach((button) => {
  button.addEventListener("click", () => {
    const panel = button.nextElementSibling;
    const isOpen = button.getAttribute("aria-expanded") === "true";
    button.setAttribute("aria-expanded", String(!isOpen));
    button.querySelector("span").textContent = isOpen ? "+" : "-";
    panel.hidden = isOpen;
  });
});

const menuToggle = document.querySelector(".menu-toggle");
const primaryNav = document.querySelector("#primary-nav");

menuToggle.addEventListener("click", () => {
  const isOpen = menuToggle.getAttribute("aria-expanded") === "true";
  menuToggle.setAttribute("aria-expanded", String(!isOpen));
  menuToggle.setAttribute("aria-label", isOpen ? "Open menu" : "Close menu");
  primaryNav.classList.toggle("is-open", !isOpen);
});

primaryNav.addEventListener("click", (event) => {
  if (event.target instanceof HTMLAnchorElement) {
    menuToggle.setAttribute("aria-expanded", "false");
    menuToggle.setAttribute("aria-label", "Open menu");
    primaryNav.classList.remove("is-open");
  }
});

document.querySelector(".wishlist-button").addEventListener("click", (event) => {
  const button = event.currentTarget;
  button.classList.toggle("is-active");
  button.setAttribute("aria-label", button.classList.contains("is-active") ? "FuelBite saved" : "Save FuelBite");
});

document.querySelector(".search-form").addEventListener("submit", (event) => {
  event.preventDefault();
  const query = document.querySelector("#site-search").value.trim().toLowerCase();
  const routes = [
    { keywords: ["shop", "price", "pack", "buy", "order"], target: "#shop", label: "Shop" },
    { keywords: ["protein", "energy", "performance", "benefit"], target: "#performance", label: "Performance" },
    { keywords: ["nutrition", "calorie", "sugar", "fiber", "fat"], target: "#nutrition", label: "Nutrition" },
    { keywords: ["ingredient", "dates", "almond", "cashew", "walnut", "seeds"], target: "#ingredients", label: "Ingredients" },
    { keywords: ["contact", "phone", "email", "instagram"], target: "#contact", label: "Contact" }
  ];

  const match = routes.find((route) => route.keywords.some((keyword) => query.includes(keyword)));

  if (match) {
    scrollToSection(match.target);
    showSearchStatus(`Showing ${match.label}`);
  } else if (query) {
    showSearchStatus("Try nutrition, ingredients, price, or contact");
  }
});

function scrollToSection(selector) {
  const target = document.querySelector(selector);
  const behavior = window.matchMedia("(prefers-reduced-motion: reduce)").matches ? "auto" : "smooth";
  if (!target) {
    return;
  }

  if (window.location.hash !== selector) {
    window.location.hash = selector;
    return;
  }

  target.scrollIntoView({ behavior, block: "start" });
}

function showSearchStatus(message) {
  searchStatus.textContent = message;
  searchStatus.classList.add("is-visible");
  window.clearTimeout(showSearchStatus.timer);
  showSearchStatus.timer = window.setTimeout(() => {
    searchStatus.classList.remove("is-visible");
  }, 2200);
}

function showCouponStatus(message) {
  if (!couponCopyStatus) {
    return;
  }

  couponCopyStatus.textContent = message;
}

function copyCouponCode() {
  const copiedMessage = `Coupon ${couponCode} copied. It is already included in your WhatsApp order.`;
  const fallbackCopy = () => {
    const field = document.createElement("textarea");
    field.value = couponCode;
    field.setAttribute("readonly", "");
    field.style.position = "fixed";
    field.style.left = "-9999px";
    document.body.append(field);
    field.select();
    document.execCommand("copy");
    field.remove();
    showCouponStatus(copiedMessage);
  };

  if (navigator.clipboard?.writeText) {
    navigator.clipboard.writeText(couponCode).then(() => {
      showCouponStatus(copiedMessage);
    }).catch(fallbackCopy);
    return;
  }

  fallbackCopy();
}

function clamp(value, min, max) {
  return Math.min(max, Math.max(min, value));
}

function updateHeroMotion() {
  if (!hero || reducedMotionQuery.matches) {
    return;
  }

  const rect = hero.getBoundingClientRect();
  const distance = Math.max(1, rect.height * 0.82);
  const progress = clamp(-rect.top / distance, 0, 1);

  hero.style.setProperty("--hero-copy-y", `${progress * -34}px`);
  hero.style.setProperty("--hero-copy-opacity", String(1 - progress * 0.32));
  hero.style.setProperty("--hero-stage-y", `${progress * 28}px`);
  hero.style.setProperty("--hero-stage-scale", String(1 + progress * 0.08));
  hero.style.setProperty("--hero-image-scale", String(1 + progress * 0.06));
  hero.style.setProperty("--hero-offer-y", `${progress * -18}px`);
  hero.style.setProperty("--hero-offer-opacity", String(1 - progress * 0.18));
}

function initHeroMotion() {
  if (!hero || reducedMotionQuery.matches) {
    return;
  }

  let isScheduled = false;
  const scheduleHeroUpdate = () => {
    if (isScheduled) {
      return;
    }

    isScheduled = true;
    window.requestAnimationFrame(() => {
      updateHeroMotion();
      isScheduled = false;
    });
  };

  updateHeroMotion();
  window.addEventListener("scroll", scheduleHeroUpdate, { passive: true });
  window.addEventListener("resize", scheduleHeroUpdate);
}

function initScrollReveals() {
  if (!revealTargets.length) {
    return;
  }

  if (reducedMotionQuery.matches || !("IntersectionObserver" in window)) {
    revealTargets.forEach((target) => target.classList.add("is-visible"));
    return;
  }

  document.body.classList.add("reveal-ready");
  const revealObserver = new IntersectionObserver((entries, observer) => {
    entries.forEach((entry) => {
      if (!entry.isIntersecting) {
        return;
      }

      entry.target.classList.add("is-visible");
      observer.unobserve(entry.target);
    });
  }, {
    rootMargin: "0px 0px -12% 0px",
    threshold: 0.12
  });

  revealTargets.forEach((target) => {
    revealObserver.observe(target);
  });
}

updateStaticPricing();
updateSelection();
renderCart();
initHeroMotion();
initScrollReveals();
