document.addEventListener("DOMContentLoaded", () => {
	const body = document.body;
	const themeRadioButtonsDesktop = document.querySelectorAll(
		'input[name="theme"]'
	);
	const themeRadioButtonsMobile = document.querySelectorAll(
		'input[name="theme-mobile"]'
	);

	// Function to get the system's preferred theme
	const getSystemTheme = () => {
		return window.matchMedia("(prefers-color-scheme: dark)").matches
			? "dark"
			: "light";
	};

	// Function to apply the theme
	const applyTheme = (theme) => {
		let actualThemeToApply = theme; // This will be the theme stored in localStorage

		if (theme === "default") {
			// If "default" is chosen, determine the actual theme from system preference
			body.removeAttribute("data-theme"); // Remove attribute to revert to system preference
			// No need to explicitly set data-theme="light" or "dark" here,
			// as removing the attribute will make CSS use prefers-color-scheme.
			// We'll update the radio buttons based on the *system's* current state.
		} else {
			// For 'light' or 'dark' explicit selections
			body.setAttribute("data-theme", theme);
		}

		// Store the user's explicit preference ('default', 'light', or 'dark')
		localStorage.setItem("user-theme", actualThemeToApply);

		// Update the checked state for ALL theme radio buttons (desktop and mobile)
		document
			.querySelectorAll('input[name="theme"], input[name="theme-mobile"]')
			.forEach((radio) => {
				if (radio.value === actualThemeToApply) {
					radio.checked = true;
				} else if (actualThemeToApply === "default") {
					// Special handling for "default" option:
					// Check the "default" radio button if it's the saved preference.
					// This ensures the UI reflects that "default" is active.
					if (radio.value === "default") {
						radio.checked = true;
					} else {
						radio.checked = false; // Uncheck others
					}
				} else {
					radio.checked = false; // Uncheck others
				}
			});
	};

	// Function to load theme from localStorage or system preference
	const loadThemePreference = () => {
		const savedTheme = localStorage.getItem("user-theme");
		let themeToApply = savedTheme || "default"; // If no theme saved, 'default' (system)

		// Apply theme and update radio buttons
		applyTheme(themeToApply);
	};

	// Event listener to toggle theme when ANY desktop radio button changes
	themeRadioButtonsDesktop.forEach((radio) => {
		radio.addEventListener("change", (event) => {
			applyTheme(event.target.value);
		});
	});

	// Event listener to toggle theme when ANY mobile radio button changes
	themeRadioButtonsMobile.forEach((radio) => {
		radio.addEventListener("change", (event) => {
			applyTheme(event.target.value);
		});
	});

	// Load theme when the page loads
	loadThemePreference();

	// Listen for system preference changes (if theme is 'default' in localStorage)
	// This listener ensures that if the user's system theme changes while 'default'
	// is selected, your site's theme will also update.
	window
		.matchMedia("(prefers-color-scheme: dark)")
		.addEventListener("change", () => {
			if (localStorage.getItem("user-theme") === "default") {
				// If the user's saved preference is "default", re-apply it
				// to ensure the UI updates according to the new system preference.
				applyTheme("default");
			}
		});

	/* --- Toggle do Sumário em telas pequenas (menu lateral) --- */

	const openSummaryButton = document.getElementById("open-summary-button");
	const summarySidebar = document.getElementById("summary-sidebar");
	const headerEl = document.querySelector("header");
	const menuIconSpan = openSummaryButton
		? openSummaryButton.querySelector(".material-symbols-outlined")
		: null;
	let summaryOverlay = null;

	const createOverlayWithId = (id) => {
		if (document.getElementById(id)) return document.getElementById(id);
		const o = document.createElement("div");
		o.id = id;
		o.className = "summary-overlay"; // reuse same visual style
		document.body.appendChild(o);
		return o;
	};

	const openSummary = () => {
		// fechar controles se estiverem abertos (não permitir ambos)
		if (controlsSidebar && controlsSidebar.classList.contains("open"))
			closeControls();
		// ajustar padding-top para não ficar embaixo do header
		if (headerEl && summarySidebar) {
			const headerHeight = headerEl.offsetHeight || 0;
			// adiciona 1rem extra para afastar o conteúdo do header
			const rootFontSize =
				parseFloat(
					getComputedStyle(document.documentElement).fontSize
				) || 16;
			const extra = rootFontSize; // 1rem em pixels
		}
		// aplicar padding-top imediatamente (para que o conteúdo interno já fique posicionado)
		if (headerEl && summarySidebar) {
			const headerHeight = headerEl.offsetHeight || 0;
			const rootFontSize =
				parseFloat(
					getComputedStyle(document.documentElement).fontSize
				) || 16;
			const extra = rootFontSize; // 1rem em pixels
			summarySidebar.style.paddingTop = headerHeight + extra + "px";
		}
		// abrir o sidebar (adiciona classe para rodar a transição)
		summarySidebar.classList.add("open");
		// abrir o sidebar (adiciona classe primeiro para rodar a transição)
		summarySidebar.classList.add("open");
		// após a transição de abertura, aplicar o padding-top para evitar
		// que a alteração seja visível antes da animação
		if (headerEl && summarySidebar) {
			const onOpenTransition = (ev) => {
				if (ev.propertyName !== "transform") return;
				const headerHeight = headerEl.offsetHeight || 0;
				const rootFontSize =
					parseFloat(
						getComputedStyle(document.documentElement).fontSize
					) || 16;
				const extra = rootFontSize; // 1rem em pixels
				summarySidebar.style.paddingTop = headerHeight + extra + "px";
				summarySidebar.removeEventListener(
					"transitionend",
					onOpenTransition
				);
			};
			summarySidebar.addEventListener("transitionend", onOpenTransition);
			// fallback: se transitionend não disparar (browsers antigos), aplica após 300ms
			setTimeout(() => {
				if (!summarySidebar.style.paddingTop) {
					const headerHeight = headerEl.offsetHeight || 0;
					const rootFontSize =
						parseFloat(
							getComputedStyle(document.documentElement).fontSize
						) || 16;
					const extra = rootFontSize;
					summarySidebar.style.paddingTop =
						headerHeight + extra + "px";
				}
			}, 320);
		}
		// trocar o ícone do botão para 'close'
		if (menuIconSpan) menuIconSpan.textContent = "close";
		if (openSummaryButton)
			openSummaryButton.setAttribute("aria-expanded", "true");
		summaryOverlay = createOverlayWithId("summary-overlay");
		// small delay to allow transition of visibility
		requestAnimationFrame(() => summaryOverlay.classList.add("visible"));
		// close when clicking overlay
		summaryOverlay.addEventListener("click", closeSummary, { once: true });
		// prevent body scroll while open
		document.body.style.overflow = "hidden";
	};

	const closeSummary = () => {
		if (!summarySidebar) return;
		summarySidebar.classList.remove("open");
		// restaurar padding-top (remover inline style)
		// remover classe para iniciar a transição de fechamento
		summarySidebar.classList.remove("open");
		// remover o padding só após a transição terminar (evitar salto visível)
		if (summarySidebar) {
			const onCloseTransition = (ev) => {
				if (ev.propertyName !== "transform") return;
				summarySidebar.style.paddingTop = "";
				summarySidebar.removeEventListener(
					"transitionend",
					onCloseTransition
				);
			};
			summarySidebar.addEventListener("transitionend", onCloseTransition);
			// fallback
			setTimeout(() => {
				if (summarySidebar && summarySidebar.style.paddingTop)
					summarySidebar.style.paddingTop = "";
			}, 320);
		}
		// iniciar transição de fechamento
		summarySidebar.classList.remove("open");
		// remover o padding só após a transição terminar (evitar salto visível)
		if (summarySidebar) {
			const onCloseTransition = (ev) => {
				if (ev.propertyName !== "transform") return;
				// aguarda pequeno delay após a transição para garantir que saiu da tela
				setTimeout(() => {
					summarySidebar.style.paddingTop = "";
				}, 120);
				summarySidebar.removeEventListener(
					"transitionend",
					onCloseTransition
				);
			};
			summarySidebar.addEventListener("transitionend", onCloseTransition);
			// fallback
			setTimeout(() => {
				if (summarySidebar && summarySidebar.style.paddingTop)
					summarySidebar.style.paddingTop = "";
			}, 520);
		}
		// trocar o ícone de volta para 'menu'
		if (menuIconSpan) menuIconSpan.textContent = "menu";
		if (openSummaryButton)
			openSummaryButton.setAttribute("aria-expanded", "false");
		if (summaryOverlay) {
			summaryOverlay.classList.remove("visible");
			// remove after transition
			setTimeout(() => {
				if (summaryOverlay && summaryOverlay.parentNode)
					summaryOverlay.parentNode.removeChild(summaryOverlay);
				summaryOverlay = null;
			}, 220);
		}
		document.body.style.overflow = "";
	};

	if (openSummaryButton && summarySidebar) {
		openSummaryButton.addEventListener("click", (e) => {
			// Only toggle in small viewports; on desktop the sidebar is visible by layout
			if (window.matchMedia("(max-width: 1080px)").matches) {
				if (summarySidebar.classList.contains("open")) {
					closeSummary();
				} else {
					openSummary();
				}
			}
		});
	}

	// Close on Escape (summary or controls)
	document.addEventListener("keydown", (ev) => {
		if (ev.key === "Escape") {
			if (summarySidebar && summarySidebar.classList.contains("open"))
				closeSummary();
			if (controlsSidebar && controlsSidebar.classList.contains("open"))
				closeControls();
		}
	});

	// Garantir que o estado é resetado ao redimensionar para desktop
	window.addEventListener("resize", () => {
		if (window.matchMedia("(min-width: 1081px)").matches) {
			if (summarySidebar && summarySidebar.classList.contains("open")) {
				summarySidebar.classList.remove("open");
			}
			if (summaryOverlay) {
				if (summaryOverlay.parentNode)
					summaryOverlay.parentNode.removeChild(summaryOverlay);
				summaryOverlay = null;
			}
			if (controlsSidebar && controlsSidebar.classList.contains("open")) {
				controlsSidebar.classList.remove("open");
			}
			if (controlsOverlay) {
				if (controlsOverlay.parentNode)
					controlsOverlay.parentNode.removeChild(controlsOverlay);
				controlsOverlay = null;
			}
			document.body.style.overflow = "";
		}
	});

	/* --- Toggle do painel de Controles (menu lateral pela direita) --- */

	const openControlsButton = document.getElementById("open-controls-button");
	const controlsSidebar = document.getElementById("controls-sidebar");
	const controlsIconSpan = openControlsButton
		? openControlsButton.querySelector(".material-symbols-outlined")
		: null;
	let controlsOverlay = null;

	const openControls = () => {
		// fechar sumário se estiver aberto
		if (summarySidebar && summarySidebar.classList.contains("open"))
			closeSummary();
		// ajustar padding-top para não ficar embaixo do header
		if (headerEl && controlsSidebar) {
			const headerHeight = headerEl.offsetHeight || 0;
			const rootFontSize =
				parseFloat(
					getComputedStyle(document.documentElement).fontSize
				) || 16;
			const extra = rootFontSize; // 1rem
		}
		controlsSidebar.classList.add("open");
		// abrir o painel de controles e só aplicar padding após transição
		controlsSidebar.classList.add("open");
		if (headerEl && controlsSidebar) {
			const onOpenTransition = (ev) => {
				if (ev.propertyName !== "transform") return;
				const headerHeight = headerEl.offsetHeight || 0;
				const rootFontSize =
					parseFloat(
						getComputedStyle(document.documentElement).fontSize
					) || 16;
				const extra = rootFontSize; // 1rem
				controlsSidebar.style.paddingTop = headerHeight + extra + "px";
				controlsSidebar.removeEventListener(
					"transitionend",
					onOpenTransition
				);
			};
			controlsSidebar.addEventListener("transitionend", onOpenTransition);
			setTimeout(() => {
				if (!controlsSidebar.style.paddingTop) {
					const headerHeight = headerEl.offsetHeight || 0;
					const rootFontSize =
						parseFloat(
							getComputedStyle(document.documentElement).fontSize
						) || 16;
					const extra = rootFontSize;
					controlsSidebar.style.paddingTop =
						headerHeight + extra + "px";
				}
			}, 320);
		}
		// aplicar padding-top imediatamente para que o conteúdo interno fique posicionado
		if (headerEl && controlsSidebar) {
			const headerHeight = headerEl.offsetHeight || 0;
			const rootFontSize =
				parseFloat(
					getComputedStyle(document.documentElement).fontSize
				) || 16;
			const extra = rootFontSize; // 1rem
			controlsSidebar.style.paddingTop = headerHeight + extra + "px";
		}
		// abrir o painel de controles
		controlsSidebar.classList.add("open");
		if (openControlsButton)
			openControlsButton.setAttribute("aria-expanded", "true");
		controlsOverlay = createOverlayWithId("controls-overlay");
		requestAnimationFrame(() => controlsOverlay.classList.add("visible"));
		controlsOverlay.addEventListener("click", closeControls, {
			once: true,
		});
		document.body.style.overflow = "hidden";
	};

	const closeControls = () => {
		if (!controlsSidebar) return;
		controlsSidebar.classList.remove("open");
		if (controlsSidebar) controlsSidebar.style.paddingTop = "";
		if (controlsSidebar) {
			const onCloseTransition = (ev) => {
				if (ev.propertyName !== "transform") return;
				controlsSidebar.style.paddingTop = "";
				controlsSidebar.removeEventListener(
					"transitionend",
					onCloseTransition
				);
			};
			controlsSidebar.addEventListener(
				"transitionend",
				onCloseTransition
			);
			setTimeout(() => {
				if (controlsSidebar && controlsSidebar.style.paddingTop)
					controlsSidebar.style.paddingTop = "";
			}, 320);
		}
		// iniciar transição de fechamento
		controlsSidebar.classList.remove("open");
		// remover padding após o painel ter saído da tela (pequeno delay)
		if (controlsSidebar) {
			const onCloseTransition = (ev) => {
				if (ev.propertyName !== "transform") return;
				setTimeout(() => {
					controlsSidebar.style.paddingTop = "";
				}, 120);
				controlsSidebar.removeEventListener(
					"transitionend",
					onCloseTransition
				);
			};
			controlsSidebar.addEventListener(
				"transitionend",
				onCloseTransition
			);
			// fallback
			setTimeout(() => {
				if (controlsSidebar && controlsSidebar.style.paddingTop)
					controlsSidebar.style.paddingTop = "";
			}, 520);
		}
		if (controlsIconSpan) controlsIconSpan.textContent = "settings";
		if (openControlsButton)
			openControlsButton.setAttribute("aria-expanded", "false");
		if (controlsOverlay) {
			controlsOverlay.classList.remove("visible");
			setTimeout(() => {
				if (controlsOverlay && controlsOverlay.parentNode)
					controlsOverlay.parentNode.removeChild(controlsOverlay);
				controlsOverlay = null;
			}, 220);
		}
		document.body.style.overflow = "";
	};

	if (openControlsButton && controlsSidebar) {
		openControlsButton.addEventListener("click", () => {
			if (window.matchMedia("(max-width: 1080px)").matches) {
				if (controlsSidebar.classList.contains("open")) {
					closeControls();
				} else {
					openControls();
				}
			}
		});
	}
});
