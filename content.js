(() => {
  const ROOT_ID = "botton-dictation-root";
  const STORAGE_KEY = "launcherOffset";
  const LANGUAGE_MODE_KEY = "languageMode";
  const DOMAIN_LANGUAGE_KEY = "domainLanguageMemory";
  const LAST_SUCCESSFUL_LANGUAGE_KEY = "lastSuccessfulLanguage";
  const DEFAULT_OFFSET = { x: 14, y: 14 };
  const DEFAULT_LANGUAGE_MODE = "ru-RU";
  const LANGUAGE_OPTIONS = ["ru-RU", "en-US", "auto"];
  const EDITABLE_INPUT_TYPES = new Set(["", "text", "search", "url", "tel", "email", "number"]);
  const SpeechRecognitionClass = window.SpeechRecognition || window.webkitSpeechRecognition;

  let root = null;
  let micButton = null;
  let languageButton = null;
  let enterButton = null;
  let spaceButton = null;
  let backspaceButton = null;
  let closeButton = null;
  let statusNode = null;
  let dragHandle = null;
  let visualizerNode = null;
  let recognition = null;
  let listening = false;
  let dictationSessionActive = false;
  let dictationRestartTimer = null;
  let statusTimer = null;
  let hideTimer = null;
  let attachObserver = null;
  let lastFocusedEditable = null;
  let savedSelectionRange = null;
  let currentAnchor = null;
  let dismissedForPage = false;
  let launcherOffset = { ...DEFAULT_OFFSET };
  let languageMode = DEFAULT_LANGUAGE_MODE;
  let domainLanguageMemory = {};
  let lastSuccessfulLanguage = null;
  let currentRecognitionLanguage = null;
  let languageSettingsTouched = false;

  if (window.top !== window) {
    return;
  }

  observeEditableFocus();
  ensureUiMounted();
  startMountObserver();
  restoreSavedOffset();
  restoreSavedLanguageSettings();

  window.addEventListener("resize", () => repositionLauncher());
  window.addEventListener("scroll", () => repositionLauncher(), true);

  function ensureUiMounted() {
    if (root?.isConnected || document.getElementById(ROOT_ID)) {
      root = document.getElementById(ROOT_ID) || root;
      return;
    }

    const mountTarget = document.body || document.documentElement;
    if (!mountTarget) {
      window.addEventListener("DOMContentLoaded", ensureUiMounted, { once: true });
      return;
    }

    injectUi(mountTarget);
  }

  function injectUi(mountTarget) {
    root = document.createElement("div");
    root.id = ROOT_ID;
    root.innerHTML = `
      <style>
        #${ROOT_ID} {
          position: fixed;
          left: 0;
          top: 0;
          z-index: 2147483647;
          width: max-content;
          font-family: Arial, sans-serif;
          color: #0f1720;
          opacity: 0;
          pointer-events: none;
          transform: translateY(6px) scale(0.96);
          transition: opacity 160ms ease, transform 160ms ease;
        }
        #${ROOT_ID}.is-visible {
          opacity: 1;
          pointer-events: auto;
          transform: translateY(0) scale(1);
        }
        #${ROOT_ID} .botton-card {
          position: relative;
          display: flex;
          align-items: center;
          gap: 10px;
        }
        #${ROOT_ID} .botton-fab {
          position: relative;
          width: 48px;
          height: 48px;
          border: 0;
          border-radius: 999px;
          display: grid;
          place-items: center;
          color: #f8faf7;
          background: linear-gradient(180deg, #1d7b66 0%, #125445 100%);
          box-shadow: 0 16px 36px rgba(9, 30, 24, 0.24);
          cursor: pointer;
          user-select: none;
          transition: transform 160ms ease, box-shadow 160ms ease, background 160ms ease;
        }
        #${ROOT_ID} .botton-fab:hover {
          transform: translateY(-1px);
        }
        #${ROOT_ID} .botton-fab::before {
          content: "";
          position: absolute;
          inset: -7px;
          border-radius: 999px;
          background: rgba(28, 160, 120, 0.18);
          opacity: 0;
          transform: scale(0.9);
          transition: opacity 180ms ease, transform 180ms ease;
          pointer-events: none;
        }
        #${ROOT_ID} .botton-fab.is-listening {
          background: linear-gradient(180deg, #d45555 0%, #8c2323 100%);
          box-shadow: 0 18px 46px rgba(121, 28, 28, 0.3);
        }
        #${ROOT_ID} .botton-fab.is-listening::before {
          opacity: 1;
          transform: scale(1);
          animation: botton-pulse 1.2s ease-in-out infinite;
        }
        #${ROOT_ID} .botton-fab.is-error {
          background: linear-gradient(180deg, #d48a2f 0%, #9c5e0d 100%);
        }
        #${ROOT_ID} .botton-drag {
          position: absolute;
          inset: 0;
          border-radius: 999px;
          cursor: grab;
        }
        #${ROOT_ID} .botton-drag:active {
          cursor: grabbing;
        }
        #${ROOT_ID} .botton-icon {
          position: relative;
          width: 20px;
          height: 20px;
          pointer-events: none;
        }
        #${ROOT_ID} .botton-icon::before {
          content: "";
          position: absolute;
          left: 5px;
          top: 1px;
          width: 10px;
          height: 12px;
          border: 2.2px solid currentColor;
          border-bottom: 0;
          border-radius: 8px 8px 6px 6px;
        }
        #${ROOT_ID} .botton-icon::after {
          content: "";
          position: absolute;
          left: 9px;
          top: 13px;
          width: 2.2px;
          height: 6px;
          background: currentColor;
          box-shadow: -5px 5px 0 -3px currentColor, 5px 5px 0 -3px currentColor;
        }
        #${ROOT_ID} .botton-close {
          position: absolute;
          top: -5px;
          right: -5px;
          width: 20px;
          height: 20px;
          border: 0;
          border-radius: 999px;
          display: grid;
          place-items: center;
          background: rgba(248, 250, 247, 0.98);
          color: #526057;
          box-shadow: 0 8px 18px rgba(12, 23, 18, 0.14);
          font-size: 13px;
          line-height: 1;
          cursor: pointer;
        }
        #${ROOT_ID} .botton-language {
          min-width: 46px;
          height: 28px;
          border: 0;
          border-radius: 999px;
          padding: 0 10px;
          background: rgba(248, 250, 247, 0.98);
          color: #29453b;
          box-shadow: 0 10px 24px rgba(12, 23, 18, 0.12);
          font-size: 11px;
          font-weight: 700;
          letter-spacing: 0.04em;
          cursor: pointer;
          transition: transform 160ms ease, box-shadow 160ms ease, background 160ms ease;
        }
        #${ROOT_ID} .botton-language:hover {
          transform: translateY(-1px);
        }
        #${ROOT_ID} .botton-language.is-active {
          background: rgba(232, 243, 238, 0.98);
          color: #125445;
        }
        #${ROOT_ID} .botton-action {
          min-width: 36px;
          height: 28px;
          border: 0;
          border-radius: 999px;
          padding: 0 9px;
          background: rgba(248, 250, 247, 0.98);
          color: #29453b;
          box-shadow: 0 10px 24px rgba(12, 23, 18, 0.12);
          font-size: 12px;
          font-weight: 700;
          cursor: pointer;
          transition: transform 160ms ease, box-shadow 160ms ease, background 160ms ease;
        }
        #${ROOT_ID} .botton-action:hover {
          transform: translateY(-1px);
        }
        #${ROOT_ID} .botton-visualizer {
          display: flex;
          align-items: center;
          gap: 3px;
          min-width: 34px;
          height: 20px;
          padding: 7px 9px;
          border-radius: 999px;
          background: rgba(245, 248, 244, 0.96);
          box-shadow: 0 10px 24px rgba(12, 23, 18, 0.12);
          opacity: 0;
          transform: translateX(-6px) scale(0.96);
          transform-origin: left center;
          pointer-events: none;
          transition: opacity 180ms ease, transform 180ms ease;
        }
        #${ROOT_ID} .botton-visualizer.is-visible {
          opacity: 1;
          transform: translateX(0) scale(1);
        }
        #${ROOT_ID} .botton-bar {
          width: 3px;
          height: 8px;
          border-radius: 999px;
          background: linear-gradient(180deg, #1d7b66 0%, #125445 100%);
          transform-origin: center;
        }
        #${ROOT_ID} .botton-visualizer.is-listening .botton-bar {
          animation: botton-bars 900ms ease-in-out infinite;
        }
        #${ROOT_ID} .botton-visualizer.is-listening .botton-bar:nth-child(2) { animation-delay: 120ms; }
        #${ROOT_ID} .botton-visualizer.is-listening .botton-bar:nth-child(3) { animation-delay: 240ms; }
        #${ROOT_ID} .botton-visualizer.is-listening .botton-bar:nth-child(4) { animation-delay: 360ms; }
        #${ROOT_ID} .botton-visualizer.is-listening .botton-bar:nth-child(5) { animation-delay: 480ms; }
        #${ROOT_ID} .botton-visualizer.is-error .botton-bar {
          background: linear-gradient(180deg, #d48a2f 0%, #9c5e0d 100%);
          height: 10px;
        }
        #${ROOT_ID} .botton-status {
          position: absolute;
          right: 0;
          bottom: 60px;
          max-width: 220px;
          padding: 8px 10px;
          border-radius: 14px;
          background: rgba(249, 247, 240, 0.98);
          box-shadow: 0 10px 28px rgba(12, 23, 18, 0.14);
          font-size: 12px;
          line-height: 1.35;
          color: #32433a;
          opacity: 0;
          transform: translateY(8px);
          pointer-events: none;
          transition: opacity 180ms ease, transform 180ms ease;
        }
        #${ROOT_ID} .botton-status.is-visible {
          opacity: 1;
          transform: translateY(0);
        }
        @keyframes botton-bars {
          0%, 100% { transform: scaleY(0.55); opacity: 0.45; }
          50% { transform: scaleY(1.7); opacity: 1; }
        }
        @keyframes botton-pulse {
          0%, 100% { opacity: 0.45; transform: scale(0.95); }
          50% { opacity: 0.9; transform: scale(1.08); }
        }
      </style>
      <div class="botton-card">
        <button class="botton-language" type="button" aria-label="Режим языка" title="Переключить язык">RU</button>
        <button class="botton-fab" type="button" aria-label="Запустить диктовку" title="Диктовка">
          <span class="botton-drag"></span>
          <span class="botton-icon"></span>
        </button>
        <button class="botton-action botton-backspace" type="button" aria-label="Backspace" title="Backspace">⌫</button>
        <button class="botton-action botton-space" type="button" aria-label="Space" title="Space">␠</button>
        <button class="botton-action botton-enter" type="button" aria-label="Enter" title="Enter">↵</button>
        <button class="botton-close" type="button" aria-label="Скрыть launcher" title="Скрыть">×</button>
        <div class="botton-visualizer" aria-hidden="true">
          <span class="botton-bar"></span>
          <span class="botton-bar"></span>
          <span class="botton-bar"></span>
          <span class="botton-bar"></span>
          <span class="botton-bar"></span>
        </div>
        <div class="botton-status" aria-live="polite">Сфокусируй текстовое поле и нажми на микрофон.</div>
      </div>
    `;

    mountTarget.appendChild(root);

    micButton = root.querySelector(".botton-fab");
    languageButton = root.querySelector(".botton-language");
    enterButton = root.querySelector(".botton-enter");
    spaceButton = root.querySelector(".botton-space");
    backspaceButton = root.querySelector(".botton-backspace");
    closeButton = root.querySelector(".botton-close");
    statusNode = root.querySelector(".botton-status");
    visualizerNode = root.querySelector(".botton-visualizer");
    dragHandle = root.querySelector(".botton-drag");

    micButton.addEventListener("pointerdown", preserveInputFocus, true);
    micButton.addEventListener("click", () => toggleListening());
    languageButton.addEventListener("pointerdown", rememberInputFocus, true);
    languageButton.addEventListener("click", () => cycleLanguageMode());
    enterButton.addEventListener("pointerdown", preserveInputFocus, true);
    enterButton.addEventListener("click", () => handleEditorAction("enter"));
    spaceButton.addEventListener("pointerdown", preserveInputFocus, true);
    spaceButton.addEventListener("click", () => handleEditorAction("space"));
    backspaceButton.addEventListener("pointerdown", preserveInputFocus, true);
    backspaceButton.addEventListener("click", () => handleEditorAction("backspace"));

    closeButton.addEventListener("click", () => {
      stopListening();
      dismissedForPage = true;
      hideLauncherImmediately();
    });

    enableDragging(root, dragHandle);
    syncUiState();
    syncLanguageUi();
    maybeShowForCurrentFocus();
  }

  function startMountObserver() {
    if (attachObserver) {
      return;
    }

    attachObserver = new MutationObserver(() => {
      if (!document.getElementById(ROOT_ID)) {
        ensureUiMounted();
      }
    });

    attachObserver.observe(document.documentElement, {
      childList: true,
      subtree: true
    });
  }

  async function restoreSavedOffset() {
    if (!chrome?.storage?.local) {
      return;
    }

    try {
      const result = await chrome.storage.local.get(STORAGE_KEY);
      const saved = result?.[STORAGE_KEY];
      if (saved && Number.isFinite(saved.x) && Number.isFinite(saved.y)) {
        launcherOffset = saved;
        repositionLauncher();
      }
    } catch (_error) {
      // ignore
    }
  }

  async function restoreSavedLanguageSettings() {
    if (!chrome?.storage?.local) {
      return;
    }

    try {
      const result = await chrome.storage.local.get([
        LANGUAGE_MODE_KEY,
        DOMAIN_LANGUAGE_KEY,
        LAST_SUCCESSFUL_LANGUAGE_KEY
      ]);
      const savedMode = result?.[LANGUAGE_MODE_KEY];
      const savedDomainMemory = result?.[DOMAIN_LANGUAGE_KEY];
      const savedLastLanguage = normalizeLanguageTag(result?.[LAST_SUCCESSFUL_LANGUAGE_KEY]);

      if (!languageSettingsTouched && LANGUAGE_OPTIONS.includes(savedMode)) {
        languageMode = savedMode;
      }

      if (!languageSettingsTouched) {
        domainLanguageMemory = isPlainObject(savedDomainMemory) ? normalizeDomainLanguageMemory(savedDomainMemory) : {};
        lastSuccessfulLanguage = savedLastLanguage;
      }
      syncLanguageUi();
    } catch (_error) {
      // ignore
    }
  }

  function maybeShowForCurrentFocus() {
    const target = findInputTarget();
    if (target) {
      showLauncherForTarget(target);
    }
  }

  async function toggleListening() {
    if (dictationSessionActive) {
      stopListening();
      syncUiState();
      updateStatus("Диктовка остановлена.");
      return;
    }

    if (!SpeechRecognitionClass) {
      flashErrorState();
      updateStatus("В этом браузере нет SpeechRecognition API.");
      return;
    }

    const initialInput = findInputTarget();
    if (!initialInput) {
      updateStatus("Активное поле не найдено.");
      return;
    }

    try {
      await ensureMicrophoneAccess();
    } catch (error) {
      flashErrorState();
      updateStatus(error.message || "Не удалось получить доступ к микрофону.");
      return;
    }

    dictationSessionActive = true;
    syncUiState();
    await startListeningCycle(initialInput);
  }

  function stopListening() {
    dictationSessionActive = false;

    if (dictationRestartTimer) {
      clearTimeout(dictationRestartTimer);
      dictationRestartTimer = null;
    }

    if (recognition) {
      try {
        recognition.stop();
      } catch (_error) {
        // ignore
      }
    }

    listening = false;
    recognition = null;
  }

  async function startListeningCycle(initialInput = null) {
    recognition = new SpeechRecognitionClass();
    recognition.continuous = false;
    recognition.interimResults = false;
    recognition.maxAlternatives = 1;
    currentRecognitionLanguage = await resolveRecognitionLanguage(initialInput);
    recognition.lang = currentRecognitionLanguage.tag;

    recognition.onstart = () => {
      listening = true;
      syncUiState();
      updateStatus(`Слушаю: ${formatActiveLanguageLabel(currentRecognitionLanguage)}`);
    };

    recognition.onresult = async (event) => {
      const transcript = Array.from(event.results)
        .filter((result) => result.isFinal)
        .map((result) => result[0]?.transcript?.trim() || "")
        .filter(Boolean)
        .join(" ")
        .trim();

      if (!transcript) {
        return;
      }

      const liveInput = findInputTarget() || initialInput;
      const inserted = appendTextToInput(liveInput, transcript);

      if (inserted) {
        const appliedLanguage = await persistSuccessfulLanguage(transcript, currentRecognitionLanguage?.tag);
        const languageLabel = formatLanguageShort(appliedLanguage || currentRecognitionLanguage?.tag);
        updateStatus(`Текст вставлен. Язык: ${languageLabel}`);
        return;
      }

      const copied = await copyTextToClipboard(transcript);
      const appliedLanguage = copied
        ? await persistSuccessfulLanguage(transcript, currentRecognitionLanguage?.tag)
        : currentRecognitionLanguage?.tag;
      const languageLabel = formatLanguageShort(appliedLanguage || currentRecognitionLanguage?.tag);
      updateStatus(copied
        ? `Поле не найдено. Текст скопирован в буфер. Язык: ${languageLabel}`
        : `Не удалось вставить текст. Сфокусируй поле и попробуй снова. Язык: ${languageLabel}`);
    };

    recognition.onerror = (event) => {
      if (event.error === "aborted" && !dictationSessionActive) {
        return;
      }

      flashErrorState();
      updateStatus(mapRecognitionError(event.error));
    };

    recognition.onend = () => {
      listening = false;
      recognition = null;
      currentRecognitionLanguage = null;
      syncUiState();

      if (!dictationSessionActive) {
        scheduleHideCheck();
        return;
      }

      dictationRestartTimer = setTimeout(() => {
        dictationRestartTimer = null;
        if (dictationSessionActive) {
          startListeningCycle(findInputTarget() || initialInput).catch((error) => {
            dictationSessionActive = false;
            listening = false;
            recognition = null;
            currentRecognitionLanguage = null;
            flashErrorState();
            syncUiState();
            updateStatus(error.message || "Не удалось перезапустить диктовку.");
          });
        }
      }, 150);
    };

    try {
      recognition.start();
    } catch (error) {
      recognition = null;
      listening = false;
      dictationSessionActive = false;
      currentRecognitionLanguage = null;
      flashErrorState();
      syncUiState();
      updateStatus(error.message || "Не удалось запустить распознавание речи.");
    }
  }

  function syncUiState() {
    if (!micButton || !visualizerNode) {
      return;
    }

    const active = dictationSessionActive || listening;
    micButton.classList.toggle("is-listening", active);
    micButton.classList.remove("is-error");
    micButton.setAttribute("aria-label", active ? "Остановить диктовку" : "Запустить диктовку");
    micButton.setAttribute("title", active ? "Остановить диктовку" : "Запустить диктовку");

    visualizerNode.classList.toggle("is-visible", active);
    visualizerNode.classList.toggle("is-listening", active);
    visualizerNode.classList.remove("is-error");
    syncLanguageUi();
  }

  function syncLanguageUi() {
    if (!languageButton) {
      return;
    }

    const label = formatLanguageModeLabel(languageMode);
    languageButton.textContent = label;
    languageButton.classList.toggle("is-active", languageMode !== DEFAULT_LANGUAGE_MODE);
    languageButton.setAttribute("aria-label", `Режим языка: ${label}`);
    languageButton.setAttribute("title", `Режим языка: ${label}`);
  }

  function updateStatus(text) {
    if (!statusNode) {
      return;
    }

    statusNode.textContent = text;
    statusNode.classList.add("is-visible");

    if (statusTimer) {
      clearTimeout(statusTimer);
    }

    statusTimer = setTimeout(() => {
      if (dictationSessionActive) {
        statusNode.textContent = currentRecognitionLanguage
          ? `Слушаю: ${formatActiveLanguageLabel(currentRecognitionLanguage)}`
          : "Диктовка активна.";
        return;
      }

      statusNode.classList.remove("is-visible");
    }, 2200);
  }

  function observeEditableFocus() {
    document.addEventListener("focusin", (event) => {
      const target = getEditableTarget(event.target);
      if (target) {
        lastFocusedEditable = target;
        dismissedForPage = false;
        showLauncherForTarget(target);
      }
    }, true);

    document.addEventListener("focusout", () => {
      scheduleHideCheck();
    }, true);

    document.addEventListener("selectionchange", () => {
      const selection = window.getSelection?.();
      if (!selection || selection.rangeCount === 0) {
        return;
      }

      const range = selection.getRangeAt(0);
      const container = range.commonAncestorContainer;
      const element = container instanceof Element ? container : container?.parentElement;
      const editable = element?.closest?.("[contenteditable='true'], [role='textbox']");
      if (editable && isEditableTarget(editable)) {
        savedSelectionRange = range.cloneRange();
      }
    }, true);
  }

  function showLauncherForTarget(target) {
    const editableTarget = getEditableTarget(target);
    if (dismissedForPage || !root?.isConnected || !editableTarget) {
      return;
    }

    currentAnchor = editableTarget;
    repositionLauncher();
    root.classList.add("is-visible");
  }

  function scheduleHideCheck() {
    if (hideTimer) {
      clearTimeout(hideTimer);
    }

    hideTimer = setTimeout(() => {
      if (dictationSessionActive || listening) {
        return;
      }

      const active = document.activeElement;
      if (isEditableTarget(active)) {
        showLauncherForTarget(active);
        return;
      }

      hideLauncherImmediately();
    }, 140);
  }

  function hideLauncherImmediately() {
    root?.classList.remove("is-visible");
    currentAnchor = null;
    if (statusNode) {
      statusNode.classList.remove("is-visible");
    }
  }

  function repositionLauncher() {
    if (!root?.isConnected || !currentAnchor || !isEditableTarget(currentAnchor)) {
      return;
    }

    const rect = currentAnchor.getBoundingClientRect();
    const left = rect.right - root.offsetWidth + launcherOffset.x;
    const top = rect.bottom + launcherOffset.y;
    moveRootTo(root, left, top);
  }

  function findInputTarget() {
    const active = getDeepActiveElement();
    const activeTarget = getEditableTarget(active);
    if (activeTarget) {
      return activeTarget;
    }

    if (isEditableTarget(lastFocusedEditable)) {
      return lastFocusedEditable;
    }

    const selectors = [
      "textarea",
      "input",
      "[contenteditable]",
      "[role='textbox']"
    ];

    for (const selector of selectors) {
      const nodes = Array.from(document.querySelectorAll(selector));
      const target = nodes.find((node) => isPromptLikeTarget(node));
      if (target) {
        return target;
      }
    }

    return null;
  }

  function appendTextToInput(target, transcript) {
    target = getEditableTarget(target);
    if (!target) {
      return false;
    }

    const currentValue = readInputValue(target);
    const prefix = currentValue.trim() ? " " : "";
    const nextValue = `${currentValue}${prefix}${transcript}`.trim();

    if (target instanceof HTMLTextAreaElement || target instanceof HTMLInputElement) {
      target.focus();
      const selection = getTextControlSelection(target);
      const nextText = buildInsertedText(currentValue, transcript, selection.start, selection.end);
      setNativeInputValue(target, nextText.value);
      if (typeof target.setSelectionRange === "function" && selection.hasSelectionApi) {
        const caretPosition = nextText.caret;
        target.setSelectionRange(caretPosition, caretPosition);
      }
      target.dispatchEvent(new Event("input", { bubbles: true }));
      target.dispatchEvent(new Event("change", { bubbles: true }));
      return true;
    }

    target.focus();
    if (!restoreSelection(target)) {
      placeCaretAtEnd(target);
    }
    const inserted = tryInsertText(prefix + transcript);
    if (!inserted) {
      target.textContent = nextValue;
    }
    target.dispatchEvent(new InputEvent("input", { bubbles: true, data: transcript, inputType: "insertText" }));
    target.dispatchEvent(new Event("change", { bubbles: true }));
    return true;
  }

  function handleEditorAction(action) {
    const target = findInputTarget();
    if (!target) {
      updateStatus("Активное поле не найдено.");
      return;
    }

    const applied = applyEditorAction(target, action);
    if (!applied) {
      updateStatus(getActionFailureStatus(action));
      return;
    }

    updateStatus(getActionSuccessStatus(action));
  }

  function applyEditorAction(target, action) {
    target = getEditableTarget(target);
    if (!target) {
      return false;
    }

    if (target instanceof HTMLTextAreaElement) {
      target.focus();
      const selection = getTextControlSelection(target);
      if (action === "enter") {
        replaceTextControlRange(target, "\n", selection, "insertLineBreak");
        return true;
      }
      if (action === "space") {
        replaceTextControlRange(target, " ", selection, "insertText");
        return true;
      }

      return deleteTextControlBackward(target, selection);
    }

    if (target instanceof HTMLInputElement) {
      target.focus();
      const selection = getTextControlSelection(target);
      if (action === "enter") {
        return dispatchSyntheticEnter(target);
      }
      if (action === "space") {
        replaceTextControlRange(target, " ", selection, "insertText");
        return true;
      }

      return deleteTextControlBackward(target, selection);
    }

    target.focus();
    if (!restoreSelection(target)) {
      placeCaretAtEnd(target);
    }

    if (action === "enter") {
      return dispatchContentEditableEnter(target);
    }

    if (action === "space") {
      return insertContentEditableText(target, " ", "insertText");
    }

    return deleteContentEditableBackward(target);
  }

  function getActionSuccessStatus(action) {
    switch (action) {
      case "enter":
        return "Enter выполнен.";
      case "space":
        return "Пробел вставлен.";
      default:
        return "Backspace выполнен.";
    }
  }

  function getActionFailureStatus(action) {
    switch (action) {
      case "enter":
        return "Не удалось выполнить Enter.";
      case "space":
        return "Не удалось вставить пробел.";
      default:
        return "Не удалось выполнить Backspace.";
    }
  }

  function readInputValue(target) {
    if (!target) {
      return "";
    }

    if (target instanceof HTMLTextAreaElement || target instanceof HTMLInputElement) {
      return target.value || "";
    }

    return target.textContent || "";
  }

  function isEditableTarget(node) {
    return Boolean(getEditableTarget(node));
  }

  function isPromptLikeTarget(node) {
    if (!isEditableTarget(node) || !(node instanceof HTMLElement)) {
      return false;
    }

    const label = [
      node.getAttribute("aria-label"),
      node.getAttribute("placeholder"),
      node.getAttribute("data-placeholder"),
      node.textContent
    ].join(" ").toLowerCase();

    if (label.includes("search")) {
      return false;
    }

    const rect = node.getBoundingClientRect();
    return rect.bottom >= window.innerHeight * 0.25;
  }

  function isVisible(node) {
    if (!(node instanceof HTMLElement)) {
      return false;
    }

    const style = window.getComputedStyle(node);
    const rect = node.getBoundingClientRect();
    return style.display !== "none" &&
      style.visibility !== "hidden" &&
      rect.width > 0 &&
      rect.height > 0;
  }

  function mapRecognitionError(code) {
    switch (code) {
      case "not-allowed":
        return "Микрофон не доступен. Разреши доступ для сайта и Chrome.";
      case "no-speech":
        return "Речь не распознана. Попробуй еще раз.";
      case "audio-capture":
        return "Не удалось получить звук с микрофона.";
      case "network":
        return "Ошибка распознавания речи. Проверь соединение.";
      default:
        return "Не удалось распознать речь.";
    }
  }

  async function ensureMicrophoneAccess() {
    if (!window.isSecureContext) {
      throw new Error("Микрофон работает только на защищенных страницах HTTPS.");
    }

    if (!navigator.mediaDevices?.getUserMedia) {
      throw new Error("В этом браузере недоступен доступ к микрофону.");
    }

    let stream;
    try {
      stream = await navigator.mediaDevices.getUserMedia({ audio: true });
    } catch (error) {
      switch (error?.name) {
        case "NotAllowedError":
        case "SecurityError":
          throw new Error("Chrome или Windows не дали доступ к микрофону.");
        case "NotFoundError":
          throw new Error("Микрофон не найден.");
        case "NotReadableError":
        case "AbortError":
          throw new Error("Микрофон занят другим приложением или недоступен.");
        default:
          throw new Error("Не удалось открыть микрофон.");
      }
    }

    stream.getTracks().forEach((track) => track.stop());
  }

  async function cycleLanguageMode() {
    const currentIndex = LANGUAGE_OPTIONS.indexOf(languageMode);
    const nextMode = LANGUAGE_OPTIONS[(currentIndex + 1) % LANGUAGE_OPTIONS.length] || DEFAULT_LANGUAGE_MODE;
    languageSettingsTouched = true;
    languageMode = nextMode;
    currentRecognitionLanguage = createLanguageSelection(
      nextMode === DEFAULT_LANGUAGE_MODE ? null : nextMode,
      nextMode === DEFAULT_LANGUAGE_MODE ? "auto" : "manual"
    );
    syncLanguageUi();
    await saveLanguageSettings();
    updateStatus(`Режим языка: ${formatLanguageModeLabel(languageMode)}`);
    restoreEditableFocusSoon();
  }

  async function saveLanguageSettings() {
    if (!chrome?.storage?.local) {
      return;
    }

    try {
      await chrome.storage.local.set({
        [LANGUAGE_MODE_KEY]: languageMode,
        [DOMAIN_LANGUAGE_KEY]: domainLanguageMemory,
        [LAST_SUCCESSFUL_LANGUAGE_KEY]: lastSuccessfulLanguage
      });
    } catch (_error) {
      // ignore
    }
  }

  async function resolveRecognitionLanguage(activeInput) {
    const mode = languageMode;

    if (mode === "ru-RU") {
      return createLanguageSelection("ru-RU", "manual");
    }

    if (mode === "en-US") {
      return createLanguageSelection("en-US", "manual");
    }

    const hostname = window.location.hostname || "";
    const candidates = [
      hostname ? domainLanguageMemory[hostname] : null,
      findLanguageFromNode(activeInput),
      normalizeLanguageTag(document.documentElement.lang),
      ...(Array.isArray(navigator.languages) ? navigator.languages.map(normalizeLanguageTag) : []),
      normalizeLanguageTag(navigator.language),
      lastSuccessfulLanguage,
      "ru-RU"
    ];

    for (const candidate of candidates) {
      if (candidate) {
        return createLanguageSelection(candidate, "auto");
      }
    }

    return createLanguageSelection("ru-RU", "auto");
  }

  function createLanguageSelection(tag, source) {
    return {
      tag,
      source
    };
  }

  function normalizeLanguageTag(value) {
    if (typeof value !== "string") {
      return null;
    }

    const normalized = value.trim().toLowerCase();
    if (!normalized) {
      return null;
    }

    if (normalized === "ru" || normalized.startsWith("ru-")) {
      return "ru-RU";
    }
    if (normalized === "en" || normalized.startsWith("en-")) {
      return "en-US";
    }
    if (normalized === "uk" || normalized.startsWith("uk-")) {
      return "uk-UA";
    }
    if (normalized === "es" || normalized.startsWith("es-")) {
      return "es-ES";
    }
    if (normalized === "de" || normalized.startsWith("de-")) {
      return "de-DE";
    }
    if (normalized === "fr" || normalized.startsWith("fr-")) {
      return "fr-FR";
    }

    return null;
  }

  function findLanguageFromNode(node) {
    if (!(node instanceof HTMLElement)) {
      return null;
    }

    const languageNode = node.closest("[lang]");
    if (languageNode instanceof HTMLElement) {
      return normalizeLanguageTag(languageNode.lang || languageNode.getAttribute("lang"));
    }

    return null;
  }

  async function persistSuccessfulLanguage(transcript, fallbackLanguage) {
    const inferredLanguage = inferTranscriptLanguage(transcript) || normalizeLanguageTag(fallbackLanguage);
    if (!inferredLanguage) {
      return normalizeLanguageTag(fallbackLanguage);
    }

    lastSuccessfulLanguage = inferredLanguage;
    const hostname = window.location.hostname || "";
    if (hostname) {
      domainLanguageMemory[hostname] = inferredLanguage;
    }

    await saveLanguageSettings();
    return inferredLanguage;
  }

  function inferTranscriptLanguage(transcript) {
    if (/[А-Яа-яЁё]/.test(transcript)) {
      return "ru-RU";
    }

    if (/[A-Za-z]/.test(transcript)) {
      return "en-US";
    }

    return null;
  }

  function formatLanguageModeLabel(mode) {
    switch (mode) {
      case "ru-RU":
        return "RU";
      case "en-US":
        return "EN";
      default:
        return "AUTO";
    }
  }

  function formatLanguageShort(tag) {
    switch (normalizeLanguageTag(tag)) {
      case "ru-RU":
        return "RU";
      case "en-US":
        return "EN";
      case "uk-UA":
        return "UK";
      case "es-ES":
        return "ES";
      case "de-DE":
        return "DE";
      case "fr-FR":
        return "FR";
      default:
        return "AUTO";
    }
  }

  function formatActiveLanguageLabel(selection) {
    if (!selection?.tag) {
      return formatLanguageModeLabel(languageMode);
    }

    if (languageMode === DEFAULT_LANGUAGE_MODE) {
      return `AUTO · ${formatLanguageShort(selection.tag)}`;
    }

    return formatLanguageShort(selection.tag);
  }

  function isPlainObject(value) {
    return Boolean(value) && typeof value === "object" && !Array.isArray(value);
  }

  function normalizeDomainLanguageMemory(memory) {
    const normalizedEntries = Object.entries(memory)
      .map(([hostname, tag]) => [hostname, normalizeLanguageTag(tag)])
      .filter(([, tag]) => Boolean(tag));

    return Object.fromEntries(normalizedEntries);
  }

  function setNativeInputValue(element, value) {
    const prototype = element instanceof HTMLTextAreaElement
      ? HTMLTextAreaElement.prototype
      : HTMLInputElement.prototype;
    const descriptor = Object.getOwnPropertyDescriptor(prototype, "value");
    descriptor?.set?.call(element, value);
  }

  function replaceTextControlRange(target, text, selection, inputType) {
    if (typeof target.setRangeText === "function" && selection.hasSelectionApi) {
      target.setRangeText(text, selection.start, selection.end, "end");
    } else {
      const nextValue = `${target.value.slice(0, selection.start)}${text}${target.value.slice(selection.end)}`;
      setNativeInputValue(target, nextValue);
      if (typeof target.setSelectionRange === "function" && selection.hasSelectionApi) {
        const caret = selection.start + text.length;
        target.setSelectionRange(caret, caret);
      }
    }

    dispatchTextInputEvents(target, text, inputType);
  }

  function deleteTextControlBackward(target, selection) {
    if (selection.start !== selection.end) {
      replaceTextControlRange(target, "", selection, "deleteContentBackward");
      return true;
    }

    if (selection.start <= 0) {
      return false;
    }

    replaceTextControlRange(target, "", {
      start: selection.start - 1,
      end: selection.end,
      hasSelectionApi: selection.hasSelectionApi
    }, "deleteContentBackward");
    return true;
  }

  function dispatchTextInputEvents(target, data, inputType) {
    try {
      target.dispatchEvent(new InputEvent("input", {
        bubbles: true,
        data,
        inputType
      }));
    } catch (_error) {
      target.dispatchEvent(new Event("input", { bubbles: true }));
    }
    target.dispatchEvent(new Event("change", { bubbles: true }));
  }

  function dispatchSyntheticEnter(target) {
    return dispatchSyntheticKey(target, "Enter", "Enter", true);
  }

  function dispatchSyntheticKey(target, key, code, submitForm = false) {
    const keyEventInit = {
      bubbles: true,
      cancelable: true,
      key,
      code
    };

    target.dispatchEvent(new KeyboardEvent("keydown", keyEventInit));
    target.dispatchEvent(new KeyboardEvent("keypress", keyEventInit));
    target.dispatchEvent(new KeyboardEvent("keyup", keyEventInit));

    if (submitForm) {
      const form = target.form || target.closest("form");
      if (form && typeof form.requestSubmit === "function") {
        form.requestSubmit();
      }
    }

    return true;
  }

  function dispatchContentEditableEnter(target) {
    const before = readInputValue(target);
    const selectionBefore = serializeSelection();
    dispatchSyntheticKey(target, "Enter", "Enter");
    const after = readInputValue(target);
    const selectionAfter = serializeSelection();
    if (before !== after || selectionBefore !== selectionAfter) {
      return true;
    }

    return insertContentEditableLineBreak(target);
  }

  function insertContentEditableText(target, text, inputType) {
    if (typeof document.execCommand === "function") {
      try {
        if (document.execCommand("insertText", false, text)) {
          target.dispatchEvent(new InputEvent("input", {
            bubbles: true,
            data: text,
            inputType
          }));
          target.dispatchEvent(new Event("change", { bubbles: true }));
          return true;
        }
      } catch (_error) {
        // ignore and fall through to range-based insertion
      }
    }

    const selection = window.getSelection?.();
    if (!selection || selection.rangeCount === 0) {
      return false;
    }

    const range = selection.getRangeAt(0);
    range.deleteContents();
    const textNode = document.createTextNode(text);
    range.insertNode(textNode);
    range.setStartAfter(textNode);
    range.collapse(true);
    selection.removeAllRanges();
    selection.addRange(range);
    savedSelectionRange = range.cloneRange();
    target.dispatchEvent(new InputEvent("input", {
      bubbles: true,
      data: text,
      inputType
    }));
    target.dispatchEvent(new Event("change", { bubbles: true }));
    return true;
  }

  function insertContentEditableLineBreak(target) {
    if (typeof document.execCommand === "function") {
      try {
        if (document.execCommand("insertLineBreak")) {
          target.dispatchEvent(new InputEvent("input", {
            bubbles: true,
            data: "\n",
            inputType: "insertLineBreak"
          }));
          target.dispatchEvent(new Event("change", { bubbles: true }));
          return true;
        }
      } catch (_error) {
        // ignore and fall through to range-based insertion
      }
    }

    const selection = window.getSelection?.();
    if (!selection || selection.rangeCount === 0) {
      return false;
    }

    const range = selection.getRangeAt(0);
    range.deleteContents();
    const lineBreak = document.createElement("br");
    range.insertNode(lineBreak);
    range.setStartAfter(lineBreak);
    range.collapse(true);
    selection.removeAllRanges();
    selection.addRange(range);
    savedSelectionRange = range.cloneRange();
    target.dispatchEvent(new InputEvent("input", {
      bubbles: true,
      data: "\n",
      inputType: "insertLineBreak"
    }));
    target.dispatchEvent(new Event("change", { bubbles: true }));
    return true;
  }

  function deleteContentEditableBackward(target) {
    const selection = window.getSelection?.();
    if (!selection || selection.rangeCount === 0) {
      return false;
    }

    const range = selection.getRangeAt(0);
    if (!range.collapsed) {
      range.deleteContents();
    } else {
      const deleteRange = createBackwardDeleteRange(range);
      if (!deleteRange) {
        return false;
      }
      deleteRange.deleteContents();
      range.setStart(deleteRange.startContainer, deleteRange.startOffset);
      range.collapse(true);
    }

    selection.removeAllRanges();
    selection.addRange(range);
    savedSelectionRange = range.cloneRange();
    target.dispatchEvent(new InputEvent("input", {
      bubbles: true,
      data: "",
      inputType: "deleteContentBackward"
    }));
    target.dispatchEvent(new Event("change", { bubbles: true }));
    return true;
  }

  function createBackwardDeleteRange(range) {
    const { startContainer, startOffset } = range;

    if (startContainer.nodeType === Node.TEXT_NODE && startOffset > 0) {
      const deleteRange = range.cloneRange();
      deleteRange.setStart(startContainer, startOffset - 1);
      deleteRange.setEnd(startContainer, startOffset);
      return deleteRange;
    }

    let previousNode = null;
    if (startContainer.nodeType === Node.TEXT_NODE) {
      previousNode = findPreviousEditableNode(startContainer);
    } else if (startContainer.childNodes[startOffset - 1]) {
      previousNode = deepestRightNode(startContainer.childNodes[startOffset - 1]);
    } else {
      previousNode = findPreviousEditableNode(startContainer);
    }

    if (!previousNode) {
      return null;
    }

    const deleteRange = range.cloneRange();
    if (previousNode.nodeType === Node.TEXT_NODE) {
      const length = previousNode.textContent?.length || 0;
      if (!length) {
        return null;
      }
      deleteRange.setStart(previousNode, length - 1);
      deleteRange.setEnd(previousNode, length);
      return deleteRange;
    }

    const parent = previousNode.parentNode;
    if (!parent) {
      return null;
    }

    const nodeIndex = Array.prototype.indexOf.call(parent.childNodes, previousNode);
    if (nodeIndex < 0) {
      return null;
    }
    deleteRange.setStart(parent, nodeIndex);
    deleteRange.setEnd(parent, nodeIndex + 1);
    return deleteRange;
  }

  function deepestRightNode(node) {
    let current = node;
    while (current?.lastChild) {
      current = current.lastChild;
    }
    return current;
  }

  function findPreviousEditableNode(node) {
    let current = node;
    while (current) {
      if (current.previousSibling) {
        return deepestRightNode(current.previousSibling);
      }
      current = current.parentNode;
    }
    return null;
  }

  function serializeSelection() {
    const selection = window.getSelection?.();
    if (!selection || selection.rangeCount === 0) {
      return "";
    }

    const range = selection.getRangeAt(0);
    const startContainer = range.startContainer;
    const endContainer = range.endContainer;
    return [
      startContainer?.nodeType,
      startContainer?.textContent?.length || 0,
      range.startOffset,
      endContainer?.nodeType,
      endContainer?.textContent?.length || 0,
      range.endOffset,
      range.collapsed
    ].join(":");
  }

  function getDeepActiveElement() {
    let active = document.activeElement;
    while (active?.shadowRoot?.activeElement) {
      active = active.shadowRoot.activeElement;
    }
    return active;
  }

  function getEditableTarget(node) {
    if (!(node instanceof HTMLElement)) {
      return null;
    }

    if (node instanceof HTMLTextAreaElement) {
      return isVisible(node) ? node : null;
    }

    if (node instanceof HTMLInputElement) {
      return EDITABLE_INPUT_TYPES.has(node.type) && isVisible(node) ? node : null;
    }

    const editable = node.closest("[contenteditable], [role='textbox']");
    if (editable instanceof HTMLElement && isVisible(editable)) {
      if (editable.isContentEditable || editable.getAttribute("role") === "textbox") {
        return editable;
      }
    }

    return null;
  }

  function getTextControlSelection(target) {
    try {
      const start = target.selectionStart;
      const end = target.selectionEnd;
      if (Number.isFinite(start) && Number.isFinite(end)) {
        return { start, end, hasSelectionApi: true };
      }
    } catch (_error) {
      // Some input types do not expose text selection APIs.
    }

    const length = target.value?.length || 0;
    return { start: length, end: length, hasSelectionApi: false };
  }

  function buildInsertedText(currentValue, transcript, start, end) {
    const left = currentValue.slice(0, start);
    const right = currentValue.slice(end);
    const prefix = left && !/\s$/.test(left) ? " " : "";
    const suffix = right && !/^\s/.test(right) ? " " : "";
    const inserted = `${prefix}${transcript}${suffix}`;

    return {
      value: `${left}${inserted}${right}`,
      caret: `${left}${inserted}`.length
    };
  }

  function placeCaretAtEnd(target) {
    const selection = window.getSelection();
    if (!selection) {
      return;
    }

    const range = document.createRange();
    range.selectNodeContents(target);
    range.collapse(false);
    selection.removeAllRanges();
    selection.addRange(range);
  }

  function tryInsertText(text) {
    if (typeof document.execCommand === "function") {
      try {
        return document.execCommand("insertText", false, text);
      } catch (_error) {
        return false;
      }
    }

    return false;
  }

  function preserveInputFocus(event) {
    rememberInputFocus();
    event.preventDefault();
  }

  function rememberInputFocus() {
    const target = findInputTarget();
    if (target) {
      lastFocusedEditable = target;
      currentAnchor = target;
    }
  }

  function restoreEditableFocusSoon() {
    const target = findInputTarget() || lastFocusedEditable;
    if (!target || typeof target.focus !== "function") {
      return;
    }

    requestAnimationFrame(() => {
      try {
        target.focus();
      } catch (_error) {
        // ignore
      }
    });
  }

  function restoreSelection(target) {
    if (!savedSelectionRange || !(target instanceof HTMLElement)) {
      return false;
    }

    if (!(target.isContentEditable || target.getAttribute("role") === "textbox")) {
      return false;
    }

    const selection = window.getSelection?.();
    if (!selection) {
      return false;
    }

    try {
      selection.removeAllRanges();
      selection.addRange(savedSelectionRange);
      return true;
    } catch (_error) {
      // ignore invalid saved range
    }

    return false;
  }

  function flashErrorState() {
    if (!micButton || !visualizerNode) {
      return;
    }

    micButton.classList.add("is-error");
    visualizerNode.classList.add("is-visible", "is-error");
    visualizerNode.classList.remove("is-listening");

    setTimeout(() => {
      if (!dictationSessionActive && !listening && micButton && visualizerNode) {
        micButton.classList.remove("is-error");
        visualizerNode.classList.remove("is-error");
        if (!dictationSessionActive && !listening) {
          visualizerNode.classList.remove("is-visible");
        }
      }
    }, 1400);
  }

  async function copyTextToClipboard(text) {
    if (!text || !navigator.clipboard?.writeText) {
      return false;
    }

    try {
      await navigator.clipboard.writeText(text);
      return true;
    } catch (_error) {
      return false;
    }
  }

  function enableDragging(container, handle) {
    if (!container || !handle) {
      return;
    }

    let dragState = null;

    handle.addEventListener("pointerdown", (event) => {
      if (!currentAnchor || !root?.isConnected) {
        return;
      }

      const rootRect = container.getBoundingClientRect();
      const anchorRect = currentAnchor.getBoundingClientRect();

      dragState = {
        shiftX: event.clientX - rootRect.left,
        shiftY: event.clientY - rootRect.top,
        anchorLeft: anchorRect.right - rootRect.width,
        anchorTop: anchorRect.bottom
      };

      handle.setPointerCapture?.(event.pointerId);
      event.preventDefault();
    });

    handle.addEventListener("pointermove", (event) => {
      if (!dragState || !container.isConnected) {
        return;
      }

      const nextLeft = event.clientX - dragState.shiftX;
      const nextTop = event.clientY - dragState.shiftY;
      launcherOffset = {
        x: nextLeft - dragState.anchorLeft,
        y: nextTop - dragState.anchorTop
      };

      moveRootTo(container, nextLeft, nextTop);
      event.preventDefault();
    });

    const finishDrag = async (event) => {
      if (!dragState || !container.isConnected) {
        return;
      }

      dragState = null;
      handle.releasePointerCapture?.(event.pointerId);
      await saveOffset();
      repositionLauncher();
      event.preventDefault();
    };

    handle.addEventListener("pointerup", finishDrag);
    handle.addEventListener("pointercancel", finishDrag);
  }

  async function saveOffset() {
    if (!chrome?.storage?.local) {
      return;
    }

    try {
      await chrome.storage.local.set({
        [STORAGE_KEY]: launcherOffset
      });
    } catch (_error) {
      // ignore
    }
  }

  function moveRootTo(container, left, top) {
    const maxLeft = Math.max(12, window.innerWidth - container.offsetWidth - 12);
    const maxTop = Math.max(12, window.innerHeight - container.offsetHeight - 12);
    const clampedLeft = clamp(left, 12, maxLeft);
    const clampedTop = clamp(top, 12, maxTop);

    container.style.left = `${clampedLeft}px`;
    container.style.top = `${clampedTop}px`;
  }

  function clamp(value, min, max) {
    return Math.min(Math.max(value, min), max);
  }
})();
