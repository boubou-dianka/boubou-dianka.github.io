/* Portfolio de Boubou Dianka : petites interactions.
   - menu sur mobile
   - ligne sous l'en-tête quand on fait défiler
   - lien actif dans le menu selon la partie affichée
   - bouton « Copier » pour l'adresse e-mail
   - apparition douce des blocs au défilement
   - figures des travaux : agrandissement au clic dans une visionneuse
   Tout reste lisible et utilisable si JavaScript est désactivé. */
(function () {
  "use strict";

  function q(sel, racine) { return (racine || document).querySelector(sel); }
  function qa(sel, racine) { return Array.prototype.slice.call((racine || document).querySelectorAll(sel)); }

  /* ---------- Menu sur mobile ---------- */
  var bouton = q(".menu-bouton");
  var nav = q("#nav");
  function fermer() { bouton.setAttribute("aria-expanded", "false"); nav.classList.remove("ouverte"); }
  if (bouton && nav) {
    bouton.addEventListener("click", function () {
      var ouvert = bouton.getAttribute("aria-expanded") === "true";
      bouton.setAttribute("aria-expanded", String(!ouvert));
      nav.classList.toggle("ouverte", !ouvert);
    });
    nav.addEventListener("click", function (e) { if (e.target.closest("a")) fermer(); });
    document.addEventListener("keydown", function (e) {
      if (e.key === "Escape" && nav.classList.contains("ouverte")) { fermer(); bouton.focus(); }
    });
  }

  /* ---------- Ligne sous l'en-tête ---------- */
  var entete = q(".entete");
  function majEntete() { if (entete) entete.classList.toggle("defile", window.scrollY > 8); }
  window.addEventListener("scroll", majEntete, { passive: true });
  majEntete();

  /* ---------- Lien actif dans le menu ---------- */
  var liens = qa('.nav a[href^="#"]');
  if (liens.length && "IntersectionObserver" in window) {
    var parId = {};
    liens.forEach(function (a) { parId[a.getAttribute("href").slice(1)] = a; });
    var obs = new IntersectionObserver(function (entrees) {
      entrees.forEach(function (en) {
        var lien = parId[en.target.id];
        if (!lien) return;
        if (en.isIntersecting) {
          liens.forEach(function (a) { a.removeAttribute("aria-current"); });
          lien.setAttribute("aria-current", "location");
        } else if (lien.getAttribute("aria-current")) {
          lien.removeAttribute("aria-current");
        }
      });
    }, { rootMargin: "-45% 0px -50% 0px" });
    Object.keys(parId).forEach(function (id) { var s = document.getElementById(id); if (s) obs.observe(s); });
  }

  /* ---------- Copier l'adresse e-mail ---------- */
  qa("[data-copier]").forEach(function (b) {
    var texte = q("span", b);
    var libelle = texte ? texte.textContent : b.textContent;
    b.addEventListener("click", function () {
      var valeur = b.getAttribute("data-copier");
      var fini = function (ok) {
        if (!ok) {
          var cible = q("[data-copiable]", b.parentNode);
          if (cible && window.getSelection) {
            var plage = document.createRange();
            plage.selectNodeContents(cible);
            var sel = window.getSelection();
            sel.removeAllRanges();
            sel.addRange(plage);
          }
        }
        if (texte) texte.textContent = ok ? (b.getAttribute("data-copie") || "OK") : (b.getAttribute("data-selection") || libelle);
        setTimeout(function () { if (texte) texte.textContent = libelle; }, 1800);
      };
      try {
        if (navigator.clipboard && navigator.clipboard.writeText) {
          navigator.clipboard.writeText(valeur).then(function () { fini(true); }, function () { fini(false); });
          return;
        }
      } catch (err) { /* copie refusée : on sélectionne le texte à la place */ }
      fini(false);
    });
  });

  /* ---------- Apparition au défilement ---------- */
  var blocs = qa(".apparait");
  function toutAfficher() { blocs.forEach(function (b) { b.classList.add("visible"); }); }
  if (blocs.length && "IntersectionObserver" in window) {
    var obsBlocs = new IntersectionObserver(function (entrees) {
      entrees.forEach(function (en) {
        // visible à l'écran, ou déjà dépassé (saut direct vers une partie plus bas)
        if (en.isIntersecting || en.boundingClientRect.top < 0) {
          en.target.classList.add("visible");
          obsBlocs.unobserve(en.target);
        }
      });
    }, { rootMargin: "0px 0px -6% 0px", threshold: 0 });
    blocs.forEach(function (b) { obsBlocs.observe(b); });
    window.addEventListener("beforeprint", toutAfficher);
  } else {
    toutAfficher();
  }

  /* ---------- Figures : agrandissement dans une visionneuse ----------
     Sans JavaScript, le lien ouvre simplement l'image en grand. */
  var zooms = qa("a[data-zoom]");
  var vis = document.createElement("dialog");
  if (zooms.length && typeof vis.showModal === "function") {
    vis.className = "visionneuse";
    vis.setAttribute("aria-label", "Enlarged figure");
    vis.innerHTML = '<button class="visionneuse-fermer" type="button" aria-label="Close"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" aria-hidden="true"><path d="M6 6l12 12M18 6 6 18"/></svg></button><figure><img alt=""><figcaption></figcaption></figure>';
    document.body.appendChild(vis);
    var visImg = q("img", vis), visLeg = q("figcaption", vis), declencheur = null;
    zooms.forEach(function (a) {
      a.addEventListener("click", function (e) {
        e.preventDefault();
        var img = q("img", a), fig = a.closest("figure"), leg = fig ? q("figcaption", fig) : null;
        visImg.src = a.getAttribute("href");
        visImg.alt = img ? img.alt : "";
        visLeg.textContent = leg ? leg.textContent : "";
        declencheur = a;
        vis.showModal();
      });
    });
    // fermer : bouton, clic à côté de la figure, ou touche Échap (géré par le navigateur)
    vis.addEventListener("click", function (e) {
      if (e.target === vis || e.target.closest(".visionneuse-fermer")) vis.close();
    });
    vis.addEventListener("close", function () {
      visImg.removeAttribute("src");
      if (declencheur) declencheur.focus();
    });
  }

  /* ---------- Année du pied de page ---------- */
  qa("[data-annee]").forEach(function (el) { el.textContent = String(new Date().getFullYear()); });
})();
