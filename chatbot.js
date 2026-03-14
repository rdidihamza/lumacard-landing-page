(function () {
  const knowledge = window.LumaCardChatKnowledge || [];

  const quickQuestions = [
    "How does it work?",
    "Is my data secure?",
    "What do I need to apply?",
    "How fast is the process?",
    "Can I compare offers?"
  ];

  const fallbackAnswer = "I'm here to help with LumaCard questions about applications, security, offers, and next steps.";

  const normalize = (value) => value
    .toLowerCase()
    .replace(/[^a-z0-9\s]/g, " ")
    .replace(/\s+/g, " ")
    .trim();

  const tokenize = (value) => normalize(value).split(" ").filter(Boolean);

  const scoreEntry = (input, entry) => {
    const normalizedInput = normalize(input);
    const tokens = tokenize(input);
    let score = 0;

    entry.variations.forEach((variation) => {
      const normalizedVariation = normalize(variation);
      if (normalizedInput === normalizedVariation) score += 120;
      if (normalizedInput.includes(normalizedVariation) || normalizedVariation.includes(normalizedInput)) score += 45;

      const variationTokens = tokenize(variation);
      const tokenMatches = variationTokens.filter((token) => tokens.includes(token)).length;
      score += tokenMatches * 7;
    });

    (entry.keywords || []).forEach((keyword) => {
      const normalizedKeyword = normalize(keyword);
      if (tokens.includes(normalizedKeyword)) score += 12;
      if (normalizedInput.includes(normalizedKeyword)) score += 5;
    });

    return score;
  };

  const findBestAnswer = (input) => {
    if (!input.trim()) return fallbackAnswer;

    const ranked = knowledge
      .map((entry) => ({ entry, score: scoreEntry(input, entry) }))
      .sort((a, b) => b.score - a.score);

    if (!ranked.length || ranked[0].score < 20) return fallbackAnswer;
    return ranked[0].entry.answer;
  };

  const template = `
    <div class="chatbot-widget" data-chatbot>
      <button class="chatbot-toggle" type="button" aria-expanded="false" aria-controls="chatbot-panel" data-chatbot-toggle>
        <span class="chatbot-toggle-icon" aria-hidden="true"></span>
        <span class="chatbot-toggle-text">Ask LumaCard</span>
      </button>

      <section class="chatbot-panel" id="chatbot-panel" aria-label="LumaCard Assistant" hidden data-chatbot-panel>
        <header class="chatbot-header">
          <div>
            <p class="chatbot-kicker">Local assistant</p>
            <h2>LumaCard Assistant</h2>
          </div>
          <button class="chatbot-close" type="button" aria-label="Close assistant" data-chatbot-close>&times;</button>
        </header>

        <div class="chatbot-messages" data-chatbot-messages></div>

        <div class="chatbot-suggestions" data-chatbot-suggestions></div>

        <form class="chatbot-form" data-chatbot-form>
          <label class="sr-only" for="chatbot-input">Ask a question</label>
          <input id="chatbot-input" class="chatbot-input" type="text" placeholder="Ask about offers, privacy, or next steps" autocomplete="off" data-chatbot-input>
          <button class="button button-primary chatbot-send" type="submit">Send</button>
        </form>
      </section>
    </div>
  `;

  const addMessage = (messagesNode, role, text) => {
    const wrapper = document.createElement("div");
    wrapper.className = `chatbot-message chatbot-message-${role}`;

    const bubble = document.createElement("div");
    bubble.className = "chatbot-bubble";
    bubble.textContent = text;

    wrapper.appendChild(bubble);
    messagesNode.appendChild(wrapper);
    messagesNode.scrollTop = messagesNode.scrollHeight;
  };

  const mountSuggestions = (container, onClick) => {
    container.innerHTML = "";
    quickQuestions.forEach((question) => {
      const button = document.createElement("button");
      button.type = "button";
      button.className = "chatbot-chip";
      button.textContent = question;
      button.addEventListener("click", () => onClick(question));
      container.appendChild(button);
    });
  };

  const initChatbot = () => {
    document.body.insertAdjacentHTML("beforeend", template);

    const widget = document.querySelector("[data-chatbot]");
    const toggle = widget.querySelector("[data-chatbot-toggle]");
    const panel = widget.querySelector("[data-chatbot-panel]");
    const closeButton = widget.querySelector("[data-chatbot-close]");
    const form = widget.querySelector("[data-chatbot-form]");
    const input = widget.querySelector("[data-chatbot-input]");
    const messages = widget.querySelector("[data-chatbot-messages]");
    const suggestions = widget.querySelector("[data-chatbot-suggestions]");

    const openChat = () => {
      panel.hidden = false;
      requestAnimationFrame(() => {
        widget.classList.add("is-open");
        toggle.setAttribute("aria-expanded", "true");
      });
      if (!messages.childElementCount) {
        addMessage(messages, "bot", "Hi, I'm the LumaCard Assistant. I can help answer common questions about credit card offers, security, and the application process.");
      }
      input.focus();
    };

    const closeChat = () => {
      widget.classList.remove("is-open");
      toggle.setAttribute("aria-expanded", "false");
      window.setTimeout(() => {
        if (!widget.classList.contains("is-open")) {
          panel.hidden = true;
        }
      }, 220);
    };

    const handleQuestion = (question) => {
      addMessage(messages, "user", question);
      window.setTimeout(() => {
        addMessage(messages, "bot", findBestAnswer(question));
      }, 220);
      input.value = "";
    };

    mountSuggestions(suggestions, handleQuestion);

    toggle.addEventListener("click", () => {
      if (widget.classList.contains("is-open")) {
        closeChat();
      } else {
        openChat();
      }
    });

    closeButton.addEventListener("click", closeChat);

    form.addEventListener("submit", (event) => {
      event.preventDefault();
      const question = input.value.trim();
      if (!question) return;
      handleQuestion(question);
    });

    document.addEventListener("click", (event) => {
      if (!widget.classList.contains("is-open")) return;
      if (widget.contains(event.target)) return;
      closeChat();
    });

    document.addEventListener("keydown", (event) => {
      if (event.key === "Escape" && widget.classList.contains("is-open")) {
        closeChat();
      }
    });
  };

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", initChatbot);
  } else {
    initChatbot();
  }
})();
