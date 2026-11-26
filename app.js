const STORAGE_KEY = "mein-weihnachtswunschzettel";
const form = document.querySelector("#wish-form");
const wishList = document.querySelector("#wish-list");
const emptyState = document.querySelector("#empty-state");
const wishCount = document.querySelector("#wish-count");
const wishSummary = document.querySelector("#wish-summary");
const notice = document.querySelector("#notice");
const sharePanel = document.querySelector("#share-panel");
const shareUrlInput = document.querySelector("#share-url");
const shareHelp = document.querySelector("#share-help");
const shareButton = document.querySelector("#share-button");
const copyShareUrlButton = document.querySelector("#copy-share-url");

function encodeSharedWishes(wishesToShare) {
  const data = wishesToShare.map(({ name, url }) => [name, url || ""]);
  const bytes = new TextEncoder().encode(JSON.stringify(data));
  let binary = "";

  for (let index = 0; index < bytes.length; index += 0x8000) {
    binary += String.fromCharCode(...bytes.subarray(index, index + 0x8000));
  }

  return btoa(binary)
    .replace(/\+/g, "-")
    .replace(/\//g, "_")
    .replace(/=+$/g, "");
}

function decodeSharedWishes(encoded) {
  if (!encoded.startsWith("1.")) return JSON.parse(encoded);

  const base64 = encoded
    .slice(2)
    .replace(/-/g, "+")
    .replace(/_/g, "/");
  const binary = atob(base64);
  const bytes = Uint8Array.from(binary, (character) => character.charCodeAt(0));
  return JSON.parse(new TextDecoder().decode(bytes));
}

function readSharedWishes() {
  const params = new URLSearchParams(window.location.hash.slice(1));
  const encoded = params.get("w");
  if (!encoded) return null;

  try {
    const parsed = decodeSharedWishes(encoded);
    if (
      !Array.isArray(parsed) ||
      parsed.some(
        (wish) =>
          !wish ||
          (Array.isArray(wish)
            ? typeof wish[0] !== "string" ||
              (wish[1] !== undefined && typeof wish[1] !== "string")
            : typeof wish.name !== "string" ||
              (wish.url !== undefined && typeof wish.url !== "string")),
      )
    ) {
      throw new Error("Ungültiges Format für den geteilten Wunschzettel.");
    }

    return parsed.map((wish, index) => {
      const [name, rawUrl] = Array.isArray(wish)
        ? wish
        : [wish.name, wish.url];
      let url = "";
      if (rawUrl) {
        try {
          const parsedUrl = new URL(rawUrl);
          if (parsedUrl.protocol === "https:" || parsedUrl.protocol === "http:") {
            url = parsedUrl.href;
          }
        } catch {
          url = "";
        }
      }

      return {
        id: `shared-${index}`,
        name: name.slice(0, 100),
        url,
        done: false,
      };
    });
  } catch {
    showNotice("Dieser geteilte Wunschzettel-Link ist ungültig oder beschädigt.");
    return [];
  }
}

function showNotice(message) {
  notice.textContent = message;
  notice.hidden = false;
}

function hideNotice() {
  notice.textContent = "";
  notice.hidden = true;
}

function loadWishes() {
  try {
    const saved = window.localStorage.getItem(STORAGE_KEY);
    if (!saved) return [];

    const parsed = JSON.parse(saved);
    if (!Array.isArray(parsed)) {
      throw new Error("Ungültiges Format für den gespeicherten Wunschzettel.");
    }

    return parsed.filter(
      (wish) =>
        wish &&
        typeof wish.id === "string" &&
        typeof wish.name === "string",
    );
  } catch {
    showNotice("Dein gespeicherter Wunschzettel konnte nicht gelesen werden. Du kannst trotzdem neue Wünsche hinzufügen.");
    return [];
  }
}

const sharedWishes = readSharedWishes();
const isSharedView = sharedWishes !== null;
let wishes = isSharedView ? sharedWishes : loadWishes();

if (isSharedView) {
  document.body.classList.add("shared-view");
  document.title = "Weihnachten 2026 — Laurynas Wünsche";
  document.querySelector("#page-title").textContent = "Weihnachten 2026";
  document.querySelector(".intro-text").textContent = "Hier ist ein Wunschzettel voller Weihnachtswünsche.";
  document.querySelector(".intro .eyebrow").hidden = true;
  document.querySelector(".intro-flourish").hidden = true;
  document.querySelector("#list-eyebrow").textContent = "Für das Christkind und seine Helfer";
  document.querySelector("#list-title").firstChild.textContent = "Laurynas Wünsche ";
}

function saveWishes() {
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(wishes));
    hideNotice();
    return true;
  } catch {
    showNotice("Deine Änderungen konnten nicht gespeichert werden. Prüfe bitte den Speicherplatz oder die Datenschutzeinstellungen deines Browsers.");
    return false;
  }
}

function createIconButton(label, className, iconMarkup, onClick) {
  const button = document.createElement("button");
  button.type = "button";
  button.className = className;
  button.setAttribute("aria-label", label);
  button.innerHTML = iconMarkup;
  button.addEventListener("click", onClick);
  return button;
}

function renderWishes() {
  wishList.replaceChildren();
  emptyState.hidden = wishes.length > 0;
  wishCount.textContent = String(wishes.length);

  if (isSharedView) {
    wishSummary.textContent = "";
  } else {
    const openCount = wishes.filter((wish) => !wish.done).length;
    wishSummary.textContent =
      wishes.length === 0
        ? "Noch keine Wünsche eingetragen"
        : `${openCount} offene${openCount === 1 ? "r Wunsch" : " Wünsche"} von ${wishes.length}`;
  }

  wishes.forEach((wish) => {
    const card = document.createElement("article");
    card.className = `wish-card${wish.done ? " is-done" : ""}`;

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

    if (wish.url) {
      const link = document.createElement("a");
      link.className = "wish-link";
      link.href = wish.url;
      link.target = "_blank";
      link.rel = "noopener noreferrer";
      link.setAttribute("aria-label", `Link zu ${wish.name} öffnen`);
      link.innerHTML = '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M10 13a5 5 0 0 0 7.07 0l3-3A5 5 0 0 0 13 2.93l-1.72 1.71"/><path d="M14 11a5 5 0 0 0-7.07 0l-3 3A5 5 0 0 0 11 21.07l1.71-1.71"/></svg><span>Link</span>';
      actions.append(link);
    }

    if (!isSharedView) {
      const toggleButton = createIconButton(
        wish.done ? "Wunsch als offen markieren" : "Wunsch als erledigt markieren",
        "done-button",
        '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="m5 12 4 4L19 6"/></svg>',
        () => {
          wishes = wishes.map((item) =>
            item.id === wish.id ? { ...item, done: !item.done } : item,
          );
          saveWishes();
          renderWishes();
        },
      );
      actions.append(toggleButton);

      const removeButton = createIconButton(
        `Wunsch ${wish.name} entfernen`,
        "remove-button",
        '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M3 6h18M8 6V4h8v2m3 0-1 14H6L5 6m4 4v6m6-6v6"/></svg>',
        () => {
          wishes = wishes.filter((item) => item.id !== wish.id);
          saveWishes();
          renderWishes();
        },
      );
      actions.append(removeButton);
    }

    card.append(icon, details, actions);
    wishList.append(card);
  });
}

form.addEventListener("submit", (event) => {
  event.preventDefault();
  if (!form.reportValidity()) return;

  const formData = new FormData(form);
  const rawUrl = String(formData.get("url") || "").trim();
  let url = "";

  if (rawUrl) {
    try {
      const parsedUrl = new URL(rawUrl);
      if (parsedUrl.protocol !== "https:" && parsedUrl.protocol !== "http:") {
        showNotice("Bitte gib einen Link ein, der mit http:// oder https:// beginnt.");
        return;
      }
      url = parsedUrl.href;
    } catch {
      showNotice("Bitte überprüfe den Link und gib eine gültige Webadresse ein.");
      return;
    }
  }

  wishes.unshift({
    id: window.crypto.randomUUID(),
    name: String(formData.get("name")).trim(),
    url,
    done: false,
  });

  saveWishes();
  renderWishes();
  form.reset();
  document.querySelector("#wish-name").focus();
});

shareButton.addEventListener("click", async () => {
  const encodedWishes = encodeSharedWishes(wishes);
  const shareUrl = new URL(window.location.href);
  shareUrl.hash = `w=1.${encodedWishes}`;
  shareUrlInput.value = shareUrl.href;
  sharePanel.hidden = false;

  if (window.location.protocol === "file:") {
    shareHelp.textContent =
      "Die Website ist noch nicht online. Lade sie zuerst auf einen Webhost hoch – lokale Dateilinks funktionieren nur auf deinem Gerät.";
    copyShareUrlButton.textContent = "Kopieren";
    return;
  }

  shareHelp.textContent = "Wer den Link hat, kann deinen Wunschzettel ansehen.";
  try {
    await navigator.clipboard.writeText(shareUrl.href);
    copyShareUrlButton.textContent = "Kopiert!";
  } catch {
    copyShareUrlButton.textContent = "Kopieren";
    shareHelp.textContent =
      "Link markieren und kopieren. Wer ihn hat, kann deinen Wunschzettel ansehen.";
    shareUrlInput.focus();
    shareUrlInput.select();
  }
});

copyShareUrlButton.addEventListener("click", async () => {
  shareUrlInput.focus();
  shareUrlInput.select();
  try {
    await navigator.clipboard.writeText(shareUrlInput.value);
    copyShareUrlButton.textContent = "Kopiert!";
  } catch {
    shareHelp.textContent = "Der Link ist markiert. Kopiere ihn mit Strg+C.";
  }
});

document.querySelector("#print-button").addEventListener("click", () => {
  window.print();
});

renderWishes();
