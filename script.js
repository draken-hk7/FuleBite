const basePrice = 400;
const productName = "FuelBite Combo Pack";
const whatsappNumber = "919847217286";

const state = {
  packs: 1,
  quantity: 1,
  cartPacks: 0,
  cartTotal: 0
};

const totalPrice = document.querySelector("[data-total-price]");
const quantityOutput = document.querySelector("[data-quantity]");
const cartCount = document.querySelector("[data-cart-count]");
const cartBody = document.querySelector("[data-cart-body]");
const cartTotal = document.querySelector("[data-cart-total]");
const cartDrawer = document.querySelector(".cart-drawer");
const cartBackdrop = document.querySelector("[data-cart-backdrop]");
const searchStatus = document.querySelector("[data-search-status]");
const mobileTotal = document.querySelector("[data-mobile-total]");
const selectionWhatsappLinks = document.querySelectorAll(".hero-whatsapp-link, .quick-whatsapp-link, .mobile-order-bar a");
const checkoutWhatsappLinks = document.querySelectorAll(".checkout-link");

function formatPrice(value) {
  return new Intl.NumberFormat("en-IN").format(value);
}

function updateSelection() {
  const selectedTotal = basePrice * state.packs * state.quantity;
  totalPrice.textContent = formatPrice(selectedTotal);
  mobileTotal.textContent = formatPrice(selectedTotal);
  quantityOutput.value = state.quantity;
  quantityOutput.textContent = state.quantity;
  updateWhatsAppLinks();
}

function renderCart() {
  cartCount.textContent = state.cartPacks;
  cartTotal.textContent = formatPrice(state.cartTotal);

  if (!state.cartPacks) {
    cartBody.innerHTML = "<p>Choose your packs, then send the order on WhatsApp.</p>";
    updateWhatsAppLinks();
    return;
  }

  const bites = state.cartPacks * 12;
  cartBody.innerHTML = `
    <div class="cart-line">
      <div>
        <h3>${productName}</h3>
        <p>${state.cartPacks} pack${state.cartPacks > 1 ? "s" : ""} / ${bites} bites</p>
      </div>
      <strong>INR ${formatPrice(state.cartTotal)}</strong>
    </div>
  `;
  updateWhatsAppLinks();
}

function getOrderSnapshot(preferCart) {
  const useCart = preferCart && state.cartPacks;
  const packs = useCart ? state.cartPacks : state.packs * state.quantity;
  const total = useCart ? state.cartTotal : basePrice * state.packs * state.quantity;
  const bites = packs * 12;
  return { packs, total, bites };
}

function buildWhatsAppUrl(preferCart) {
  const order = getOrderSnapshot(preferCart);
  const message = [
    "Hi FuelBite, I want to order:",
    `${productName}`,
    `Quantity: ${order.packs} pack${order.packs > 1 ? "s" : ""} / ${order.bites} bites`,
    `Total: INR ${formatPrice(order.total)}`,
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
    link.href = checkoutUrl;
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
    state.cartTotal += basePrice * state.packs * state.quantity;
    renderCart();
    openCart();
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

updateSelection();
renderCart();
