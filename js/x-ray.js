document.addEventListener("DOMContentLoaded", () => {
	console.log("DOM totalmente carregado. Iniciando x-ray.js");

	// --- X-Ray Toggle Logic ---
	// Ensure toggles have accessible pressed state
	document.querySelectorAll(".x-ray-toggle").forEach((b) => {
		b.setAttribute("aria-pressed", "false");
	});

	document.querySelectorAll(".x-ray-toggle").forEach((button) => {
		console.log("Botão de Raio-X encontrado:", button.id);
		button.addEventListener("click", () => {
			const selectedSignType = button.dataset.signType; // Ex: "estatico", "dinamico"
			console.log(
				`Botão '${button.id}' clicado. Tipo de signo selecionado: ${selectedSignType}`
			);

			const clickedButton = button;

			// Verifica o estado ATUAL da lente correspondente ao botão clicado
			const isCurrentlyActive = document.body.classList.contains(
				`x-ray-active-${selectedSignType}`
			);

			if (isCurrentlyActive) {
				// Deactivate the currently active lens
				document.body.classList.remove(
					`x-ray-active-${selectedSignType}`
				);
				clickedButton.classList.remove("active");
				clickedButton.setAttribute("aria-pressed", "false");
				// remove indicators and close any explanation modal
				hideAllXrayIndicators();
				closeSignExplanationModal();
				console.log(
					`Lente '${selectedSignType}' desativada pelo clique.`
				);
				return;
			}

			// Otherwise, activate this lens: first clear previous state
			document.body.classList.remove(
				"x-ray-active-estatico",
				"x-ray-active-dinamico",
				"x-ray-active-metalinguistico"
			);
			console.log("Classes 'x-ray-active' removidas do body.");

			// Remove active state and aria-pressed from all toggles
			document.querySelectorAll(".x-ray-toggle").forEach((btn) => {
				btn.classList.remove("active");
				btn.setAttribute("aria-pressed", "false");
				btn.setAttribute("aria-expanded", "false");
			});
			console.log(
				"Classe 'active' removida de todos os botões de Raio-X."
			);

			// Remove previous indicators
			hideAllXrayIndicators();
			console.log(
				"Indicadores e data-xray-active removidos de todos os elementos."
			);

			// Close any open explanation modal (but do not change active lens state here)
			closeSignExplanationModal();

			// Activate selected lens
			document.body.classList.add(`x-ray-active-${selectedSignType}`);
			console.log(
				`Lente de Raio-X ativada: Adicionado 'x-ray-active-${selectedSignType}' ao body.`
			);
			showXrayIndicators(selectedSignType);

			clickedButton.classList.add("active");
			clickedButton.setAttribute("aria-pressed", "true");
			console.log(
				`Classe 'active' adicionada ao botão '${clickedButton.id}'.`
			);
		});
	});

	// --- Functions for X-Ray Indicators ---
	// showXrayIndicators agora recebe o 'activeSignType' para buscar as explicações corretas
	function showXrayIndicators(activeSignType) {
		console.log(
			`showXrayIndicators chamado para o tipo: ${activeSignType}`
		);
		// Seleciona os wrappers que contêm o tipo de signo ativo
		const elementsToHighlight = document.querySelectorAll(
			`.sign-wrapper[data-sign-type*="${activeSignType}"]`
		);

		if (elementsToHighlight.length === 0) {
			console.log(
				`Nenhum elemento encontrado com data-sign-type*="${activeSignType}"`
			);
		}

		elementsToHighlight.forEach((element, index) => {
			console.log(`Processando elemento ${index + 1}:`, element);

			// Marcar o sign-wrapper como ativo para o CSS
			element.dataset.xrayActive = "true";
			console.log(`data-xray-active='true' adicionado ao elemento.`);

			// Cria o botão indicador (sem precisar verificar a posição do parent,
			// já que o .sign-wrapper já é relative)
			const indicator = document.createElement("button");
			indicator.classList.add("x-ray-indicator");
			indicator.innerHTML = `<span class="material-symbols-outlined">${getIconForSignType(
				activeSignType
			)}</span>`;
			console.log("Indicador criado:", indicator);

			// Store data attributes on the indicator itself for easy access,
			// pegando as informações específicas da lente ativa
			indicator.dataset.signName =
				element.dataset[`${activeSignType}Name`];
			indicator.dataset.signCategory = activeSignType; // A categoria ativa
			indicator.dataset.signExplanation =
				element.dataset[`${activeSignType}Explanation`];

			// Accessibility: label and keyboard support
			const nameLabel = indicator.dataset.signName || "Explicação";
			indicator.setAttribute(
				"aria-label",
				`${nameLabel} — Abrir explicação`
			);
			indicator.setAttribute("role", "button");
			indicator.tabIndex = 0;

			console.log(
				"Dados do signo adicionados ao indicador:",
				indicator.dataset.signName,
				indicator.dataset.signCategory,
				indicator.dataset.signExplanation
			);

			// Append indicator to the sign-wrapper
			element.appendChild(indicator);
			console.log("Indicador anexado ao elemento.");

			// Determine preferred side based on element's horizontal position
			const rect = element.getBoundingClientRect();
			console.log("getBoundingClientRect do elemento:", rect);
			console.log("Largura da janela:", window.innerWidth);

			if (
				rect.left > window.innerWidth / 2 ||
				rect.right > window.innerWidth - 100
			) {
				indicator.classList.add("position-left");
				console.log("Adicionado classe 'position-left' ao indicador.");
			} else {
				indicator.classList.add("position-right");
				console.log("Adicionado classe 'position-right' ao indicador.");
			}

			// Add click listener to the indicator
			indicator.addEventListener("click", (event) => {
				event.stopPropagation(); // Prevent parent clicks from interfering
				console.log("Indicador clicado. Abrindo modal de explicação.");
				openSignExplanationModal(
					indicator.dataset.signName,
					indicator.dataset.signCategory,
					indicator.dataset.signExplanation,
					indicator // Passa o indicador para posicionamento
				);
			});

			// Keyboard support: open on Enter or Space
			indicator.addEventListener("keydown", (ev) => {
				if (ev.key === "Enter" || ev.key === " ") {
					ev.preventDefault();
					indicator.click();
				}
			});
		});
	}

	function hideAllXrayIndicators() {
		console.log(
			"hideAllXrayIndicators: Chamado para limpar todos os destaques."
		);

		document
			.querySelectorAll(".x-ray-indicator")
			.forEach((indicator, idx) => {
				console.log(
					`hideAllXrayIndicators: Removendo indicador #${idx + 1}...`
				);
				indicator.remove(); // Remove o botão do DOM
			});
		console.log(
			"hideAllXrayIndicators: Todos os indicadores foram removidos."
		);

		// Remover o atributo data-xray-active de TODOS os wrappers
		document.querySelectorAll(".sign-wrapper").forEach((wrapper, idx) => {
			if (wrapper.dataset.xrayActive) {
				delete wrapper.dataset.xrayActive;
				console.log(
					`hideAllXrayIndicators: data-xray-active removido do wrapper #${
						idx + 1
					}.`
				);
			}
		});
		console.log(
			"hideAllXrayIndicators: Atributos data-xray-active removidos dos wrappers."
		);
	}

	function getIconForSignType(type) {
		switch (type) {
			case "estatico":
				return "widgets";
			case "dinamico":
				return "magic_button";
			case "metalinguistico":
				return "info";
			default:
				return "help";
		}
	}

	// --- Dedicated Modal for Sign Explanations ---
	// O modal continua sendo criado dinamicamente, mas agora com uma nova classe para seu overlay
	const signExplanationModalOverlay = document.createElement("div");
	signExplanationModalOverlay.id = "sign-explanation-modal-overlay";
	signExplanationModalOverlay.classList.add("sign-explanation-modal-overlay");
	signExplanationModalOverlay.style.display = "none";
	document.body.appendChild(signExplanationModalOverlay);

	signExplanationModalOverlay.innerHTML = `
        <div class="dialog-content" id="sign-explanation-modal-content">
            <div class="dialog-header">
                <h4 class="dialog-title" id="sign-explanation-modal-title"></h4>
                <button class="close-dialog" id="close-sign-explanation-modal-button">
                    <span class="material-symbols-outlined">close</span>
                </button>
            </div>
            <div class="dialog-body">
                <p class="dialog-text" id="sign-explanation-modal-category"></p>
                <p class="dialog-text" id="sign-explanation-modal-text"></p>
            </div>
        </div>
    `;

	const signExplanationModalContent = document.getElementById(
		"sign-explanation-modal-content"
	);
	const signExplanationModalTitle = document.getElementById(
		"sign-explanation-modal-title"
	);
	const signExplanationModalCategory = document.getElementById(
		"sign-explanation-modal-category"
	);
	const signExplanationModalText = document.getElementById(
		"sign-explanation-modal-text"
	);

	window.addEventListener("scroll", () => {
		if (signExplanationModalOverlay.style.display === "flex") {
			console.log("Página rolou. Fechando modal de explicação.");
			closeSignExplanationModal();
		}
	});

	document
		.getElementById("close-sign-explanation-modal-button")
		.addEventListener("click", closeSignExplanationModal);

	signExplanationModalOverlay.addEventListener("click", (event) => {
		if (event.target === signExplanationModalOverlay) {
			console.log("Clique no overlay do modal de explicação. Fechando.");
			closeSignExplanationModal();
		}
	});

	function getSignTypeDetails(type) {
		switch (type) {
			case "estatico":
				return { text: "Estático", class: "sign-type-estatico" };
			case "dinamico":
				return { text: "Dinâmico", class: "sign-type-dinamico" };
			case "metalinguistico":
				return {
					text: "Metalinguístico",
					class: "sign-type-metalinguistico",
				};
			default:
				return { text: "Desconhecido", class: "sign-type-unknown" };
		}
	}

	function openSignExplanationModal(
		title,
		category,
		explanation,
		indicatorElement
	) {
		console.log("openSignExplanationModal chamado.");

		signExplanationModalTitle.textContent = title;
		const categoryDetails = getSignTypeDetails(category);
		const categoryChip = document.createElement("span");
		categoryChip.classList.add("sign-category-chip", categoryDetails.class);
		categoryChip.textContent = categoryDetails.text;
		signExplanationModalCategory.innerHTML = "";
		signExplanationModalCategory.appendChild(categoryChip);
		signExplanationModalText.textContent = explanation;

		console.log(
			`Modal preenchido: Título="${title}", Categoria="${categoryDetails.text}", Explicação="${explanation}"`
		);

		const indicatorRect = indicatorElement.getBoundingClientRect();
		let modalContentWidth = signExplanationModalContent.offsetWidth;
		let modalContentHeight = signExplanationModalContent.offsetHeight;

		if (modalContentWidth === 0) modalContentWidth = 300;
		if (modalContentHeight === 0) modalContentHeight = 150;

		let modalTop = indicatorRect.bottom + window.scrollY + 10;
		let modalLeft = indicatorRect.left + window.scrollX;
		console.log(
			`Posição inicial calculada: Top=${modalTop}, Left=${modalLeft}`
		);

		if (modalLeft + modalContentWidth > window.innerWidth - 20) {
			modalLeft = window.innerWidth - modalContentWidth - 20;
		}
		if (modalLeft < 20) {
			modalLeft = 20;
		}

		if (
			modalTop + modalContentHeight >
			window.innerHeight + window.scrollY - 20
		) {
			modalTop =
				indicatorRect.top + window.scrollY - modalContentHeight - 10;
			if (modalTop < window.scrollY + 20) {
				modalTop = window.scrollY + 20;
			}
		}

		signExplanationModalOverlay.style.position = "absolute";
		signExplanationModalOverlay.style.top = `${modalTop}px`;
		signExplanationModalOverlay.style.left = `${modalLeft}px`;
		signExplanationModalOverlay.style.width = "auto";
		signExplanationModalOverlay.style.height = "auto";
		signExplanationModalOverlay.style.backgroundColor = "transparent";
		signExplanationModalOverlay.style.zIndex = "1001";

		// Keep reference to last active toggle to restore focus on modal close
		let _lastActiveToggle = null;

		signExplanationModalContent.style.position = "static";

		signExplanationModalOverlay.style.display = "flex";
		console.log("Modal display: flex definido.");

		requestAnimationFrame(() => {
			signExplanationModalOverlay.classList.add("is-visible");
			console.log(
				"Modal de explicação exibido e posicionado via classe 'is-visible' após requestAnimationFrame."
			);
		});
	}

	function closeSignExplanationModal() {
		console.log("Fechando modal de explicação.");
		signExplanationModalOverlay.classList.remove("is-visible");

		setTimeout(() => {
			signExplanationModalOverlay.style.display = "none";
			console.log("Modal display:none definido após transição.");
		}, 300);
		// NOTE: Do NOT remove the 'active' state from the x-ray-toggle buttons here.
		// The lens state should persist while the selected lens is active. Closing
		// the explanation modal must not deactivate the currently selected lens.
	}
});
