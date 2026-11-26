const WISHES = [
  {
    name: "Sportleggings Adidas Own the Run Größe M schwarz",
    url: "https://www.intersport.de/p/adidas-damen-tights-own-the-run-full-length-p1149174?articleId=a102106934",
  },
  {
    name: "Windweste Rennrad Größe S",
    url: "https://straede.cc/products/fahrradweste-damen-vest-women?variant=45516477628683",
  },
];

const wishList = document.querySelector("#wish-list");
const emptyState = document.querySelector("#empty-state");
const wishCount = document.querySelector("#wish-count");

document.body.classList.add("shared-view");
document.title = "Weihnachten 2026 — Laurynas Wünsche";
document.querySelector("#page-title").textContent = "Weihnachten 2026";
document.querySelector(".intro-text").textContent =
  "Hier ist ein Wunschzettel voller Weihnachtswünsche.";
document.querySelector(".intro .eyebrow").hidden = true;
document.querySelector(".intro-flourish").hidden = true;
document.querySelector("#list-eyebrow").textContent =
  "Für das Christkind und seine Helfer";
document.querySelector("#list-title").firstChild.textContent =
  "Laurynas Wünsche ";

function getSafeUrl(value) {
  if (typeof value !== "string" || !value.trim()) return "";

  try {
    const url = new URL(value);
    return url.protocol === "https:" || url.protocol === "http:"
      ? url.href
      : "";
  } catch {
    return "";
  }
}

function renderWishes() {
  wishList.replaceChildren();
  emptyState.hidden = WISHES.length > 0;
  wishCount.textContent = String(WISHES.length);

  WISHES.forEach((wish) => {
    const card = document.createElement("article");
    card.className = "wish-card";

    const icon = document.createElement("div");
    icon.className = "wish-icon";
    icon.setAttribute("aria-hidden", "true");
    icon.textContent = "✦";

    const details = document.createElement("div");
    details.className = "wish-details";

    const title = document.createElement("h3");
    title.className = "wish-title";
    title.textContent = wish.name;
    details.append(title);

    const actions = document.createElement("div");
    actions.className = "wish-actions";
    const safeUrl = getSafeUrl(wish.url);

    if (safeUrl) {
      const link = document.createElement("a");
      link.className = "wish-link";
      link.href = safeUrl;
      link.target = "_blank";
      link.rel = "noopener noreferrer";
      link.setAttribute("aria-label", `Link zu ${wish.name} öffnen`);
      link.innerHTML =
        '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M10 13a5 5 0 0 0 7.07 0l3-3A5 5 0 0 0 13 2.93l-1.72 1.71"/><path d="M14 11a5 5 0 0 0-7.07 0l-3 3A5 5 0 0 0 11 21.07l1.71-1.71"/></svg><span>Link</span>';
      actions.append(link);
    }

    card.append(icon, details, actions);
    wishList.append(card);
  });
}

document.querySelector("#print-button").addEventListener("click", () => {
  window.print();
});

renderWishes();
