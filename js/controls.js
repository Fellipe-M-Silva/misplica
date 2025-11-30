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

	const createOverlay = () => {
		if (document.getElementById("summary-overlay"))
			return document.getElementById("summary-overlay");
		const o = document.createElement("div");
		o.id = "summary-overlay";
		o.className = "summary-overlay";
		document.body.appendChild(o);
		return o;
	};

	const openSummary = () => {
		// ajustar padding-top para não ficar embaixo do header
		if (headerEl && summarySidebar) {
			const headerHeight = headerEl.offsetHeight || 0;
			// adiciona 1rem extra para afastar o conteúdo do header
			const rootFontSize =
				parseFloat(
					getComputedStyle(document.documentElement).fontSize
				) || 16;
			const extra = rootFontSize; // 1rem em pixels
			summarySidebar.style.paddingTop = headerHeight + extra + "px";
		}
		summarySidebar.classList.add("open");
		// trocar o ícone do botão para 'close'
		if (menuIconSpan) menuIconSpan.textContent = "close";
		if (openSummaryButton)
			openSummaryButton.setAttribute("aria-expanded", "true");
		summaryOverlay = createOverlay();
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
		if (summarySidebar) summarySidebar.style.paddingTop = "";
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
			if (window.matchMedia("(max-width: 768px)").matches) {
				if (summarySidebar.classList.contains("open")) {
					closeSummary();
				} else {
					openSummary();
				}
			}
		});
	}

	// Close on Escape
	document.addEventListener("keydown", (ev) => {
		if (
			ev.key === "Escape" &&
			summarySidebar &&
			summarySidebar.classList.contains("open")
		) {
			closeSummary();
		}
	});

	// Garantir que o estado é resetado ao redimensionar para desktop
	window.addEventListener("resize", () => {
		if (window.matchMedia("(min-width: 769px)").matches) {
			if (summarySidebar && summarySidebar.classList.contains("open")) {
				summarySidebar.classList.remove("open");
			}
			if (summaryOverlay) {
				if (summaryOverlay.parentNode)
					summaryOverlay.parentNode.removeChild(summaryOverlay);
				summaryOverlay = null;
			}
			document.body.style.overflow = "";
		}
	});
});
