"use client";

import Image from "next/image";
import { useEffect, useRef, useState } from "react";
import styles from "./page.module.css";

const STORAGE_KEY = "nori-home-state";

const primaryNavItems = [
  { label: "Home", icon: "⌂", view: "home" },
  { label: "Chat", icon: "◉", view: "chat" },
];

const secondaryNavItems = [
  { label: "History", icon: "◷" },
  { label: "Projects", icon: "□" },
  { label: "Bookmarks", icon: "▯" },
  { label: "Templates", icon: "⌘" },
  { label: "Settings", icon: "⚙" },
];

const materialTypes = [
  { key: "text", label: "Text", icon: "/doc.png", alt: "Text document icon" },
  { key: "pdf", label: "PDF", icon: "/pdf.png", alt: "PDF document icon" },
  { key: "image", label: "Image", icon: "/image.png", alt: "Image file icon" },
  { key: "link", label: "Link", icon: "/link.png", alt: "Link icon" },
];

const initialUploads = [
  {
    id: 1,
    name: "The Future of AI.pdf",
    meta: "PDF - 1.4 MB",
    icon: "/pdf.png",
    alt: "PDF document icon",
  },
  {
    id: 2,
    name: "mountain.jpg",
    meta: "Image - 2.6 MB",
    icon: "/image.png",
    alt: "Image file icon",
  },
  {
    id: 3,
    name: "Renewable energy is essential for our future...",
    meta: "Text - 320 characters",
    icon: "/doc.png",
    alt: "Text document icon",
  },
];

const steps = [
  {
    title: "Upload your content",
    description: "Add text, PDF, image or link",
    icon: "⇪",
  },
  {
    title: "AI researches",
    description: "It will analyze and gather key insights",
    icon: "◔",
  },
  {
    title: "Let's chat",
    description: "Ask questions and get answers",
    icon: "◌",
  },
];

const recentResearch = [
  { title: "The Future of AI.pdf", time: "Today, 9:41 AM", icon: "/pdf.png", alt: "PDF icon" },
  { title: "Mountain Landscape.jpg", time: "Today, 9:35 AM", icon: "/image.png", alt: "Image icon" },
  {
    title: "Renewable energy is essential...",
    time: "Yesterday, 8:20 PM",
    icon: "/doc.png",
    alt: "Document icon",
  },
  { title: "https://example.com/article", time: "May 12, 2024", icon: "/link.png", alt: "Link icon" },
];

const starterPrompts = [
  "Summarize the key points.",
  "Quiz me on this material.",
  "Explain the hardest part simply.",
  "Make a short study plan.",
];

const coachCards = [
  { title: "Lesson mode", text: "Walk through the material step by step like a tutor." },
  { title: "Quiz mode", text: "Generate quick questions and check your answers." },
  { title: "Weak spots", text: "Repeat difficult topics until they stick." },
];

function formatBytes(size) {
  if (size < 1024 * 1024) {
    return `${(size / 1024).toFixed(1)} KB`;
  }

  return `${(size / (1024 * 1024)).toFixed(1)} MB`;
}

function buildFileUpload(file, icon, alt, label) {
  return {
    id: `${file.name}-${file.lastModified}`,
    name: file.name,
    meta: `${label} - ${formatBytes(file.size)}`,
    icon,
    alt,
  };
}

function readStoredState() {
  if (typeof window === "undefined") {
    return null;
  }

  try {
    const rawValue = window.localStorage.getItem(STORAGE_KEY);

    if (!rawValue) {
      return null;
    }

    return JSON.parse(rawValue);
  } catch {
    return null;
  }
}

async function readJsonResponse(response) {
  const rawText = await response.text();

  if (!rawText) {
    return {};
  }

  try {
    return JSON.parse(rawText);
  } catch {
    const preview = rawText.replace(/\s+/g, " ").trim().slice(0, 220);
    throw new Error(
      preview
        ? `The AI server returned an unexpected response (${response.status} ${response.statusText}): ${preview}`
        : `The AI server returned an unexpected response (${response.status} ${response.statusText}).`,
    );
  }
}

function getInitialState() {
  const storedState = readStoredState();

  return {
    uploads: storedState?.uploads?.length ? storedState.uploads : initialUploads,
    composerType:
      storedState?.composerType === "text" || storedState?.composerType === "link"
        ? storedState.composerType
        : null,
    textDraft: typeof storedState?.textDraft === "string" ? storedState.textDraft : "",
    linkDraft: typeof storedState?.linkDraft === "string" ? storedState.linkDraft : "",
    workspaceView: storedState?.workspaceView === "chat" ? "chat" : "home",
    messageDraft:
      typeof storedState?.messageDraft === "string" ? storedState.messageDraft : "",
    chatMessages: Array.isArray(storedState?.chatMessages) ? storedState.chatMessages : [],
  };
}

export default function Home() {
  const [initialState] = useState(getInitialState);
  const [uploads, setUploads] = useState(initialState.uploads);
  const [composerType, setComposerType] = useState(initialState.composerType);
  const [textDraft, setTextDraft] = useState(initialState.textDraft);
  const [linkDraft, setLinkDraft] = useState(initialState.linkDraft);
  const [workspaceView, setWorkspaceView] = useState(initialState.workspaceView);
  const [messageDraft, setMessageDraft] = useState(initialState.messageDraft);
  const [chatMessages, setChatMessages] = useState(initialState.chatMessages);
  const [isSending, setIsSending] = useState(false);
  const [chatError, setChatError] = useState("");
  const documentInputRef = useRef(null);
  const pdfInputRef = useRef(null);
  const imageInputRef = useRef(null);

  useEffect(() => {
    window.localStorage.setItem(
      STORAGE_KEY,
      JSON.stringify({
        uploads,
        composerType,
        textDraft,
        linkDraft,
        workspaceView,
        messageDraft,
        chatMessages,
      }),
    );
  }, [chatMessages, composerType, linkDraft, messageDraft, textDraft, uploads, workspaceView]);

  const addUploads = (items) => {
    if (!items.length) {
      return;
    }

    setUploads((current) => [...items, ...current]);
  };

  const handleFileChange = (event, config) => {
    const files = Array.from(event.target.files ?? []);
    const mapped = files.map((file) =>
      buildFileUpload(file, config.icon, config.alt, config.label),
    );

    addUploads(mapped);
    event.target.value = "";
  };

  const handleMaterialSelect = (type) => {
    setComposerType(null);

    if (type === "text") {
      setComposerType("text");
      return;
    }

    if (type === "link") {
      setComposerType("link");
      return;
    }

    if (type === "pdf") {
      pdfInputRef.current?.click();
      return;
    }

    if (type === "image") {
      imageInputRef.current?.click();
      return;
    }

    documentInputRef.current?.click();
  };

  const handleAddText = () => {
    const value = textDraft.trim();

    if (!value) {
      return;
    }

    addUploads([
      {
        id: `text-${Date.now()}`,
        name: value.slice(0, 48) + (value.length > 48 ? "..." : ""),
        meta: `Text - ${value.length} characters`,
        icon: "/doc.png",
        alt: "Text document icon",
      },
    ]);
    setTextDraft("");
    setComposerType(null);
  };

  const handleAddLink = () => {
    const value = linkDraft.trim();

    if (!value) {
      return;
    }

    addUploads([
      {
        id: `link-${Date.now()}`,
        name: value,
        meta: "Link - ready to research",
        icon: "/link.png",
        alt: "Link icon",
      },
    ]);
    setLinkDraft("");
    setComposerType(null);
  };

  const handleRemoveUpload = (id) => {
    setUploads((current) => current.filter((item) => item.id !== id));
  };

  const handleResetResearch = () => {
    setWorkspaceView("home");
    setComposerType(null);
    setTextDraft("");
    setLinkDraft("");
    setMessageDraft("");
    setChatMessages([]);
    setChatError("");
  };

  const handleStartResearch = () => {
    if (!uploads.length) {
      return;
    }

    setWorkspaceView("chat");
  };

  const handleSendMessage = async () => {
    const trimmed = messageDraft.trim();

    if (!trimmed || isSending) {
      return;
    }

    const nextUserMessage = {
      id: `user-${Date.now()}`,
      role: "user",
      text: trimmed,
    };
    const nextHistory = [...chatMessages, nextUserMessage];

    setChatMessages(nextHistory);
    setMessageDraft("");
    setChatError("");
    setIsSending(true);

    try {
      const response = await fetch("/api/chat", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          message: trimmed,
          uploads,
          history: nextHistory,
        }),
      });

      const payload = await readJsonResponse(response);

      if (!response.ok) {
        throw new Error(payload?.error || "Unable to reach the AI server right now.");
      }

      setChatMessages((current) => [
        ...current,
        {
          id: `assistant-${Date.now()}`,
          role: "assistant",
          text: payload.reply || "The AI server returned an empty reply.",
        },
      ]);
    } catch (error) {
      setChatError(
        error instanceof Error ? error.message : "Unable to reach the AI server right now.",
      );
    } finally {
      setIsSending(false);
    }
  };

  return (
    <div className={styles.page}>
      <input
        ref={documentInputRef}
        className={styles.hiddenInput}
        type="file"
        accept=".txt,.doc,.docx,.rtf"
        multiple
        onChange={(event) =>
          handleFileChange(event, {
            icon: "/doc.png",
            alt: "Text document icon",
            label: "Document",
          })
        }
      />
      <input
        ref={pdfInputRef}
        className={styles.hiddenInput}
        type="file"
        accept=".pdf"
        multiple
        onChange={(event) =>
          handleFileChange(event, {
            icon: "/pdf.png",
            alt: "PDF document icon",
            label: "PDF",
          })
        }
      />
      <input
        ref={imageInputRef}
        className={styles.hiddenInput}
        type="file"
        accept="image/*"
        multiple
        onChange={(event) =>
          handleFileChange(event, {
            icon: "/image.png",
            alt: "Image file icon",
            label: "Image",
          })
        }
      />

      <aside className={styles.sidebar}>
        <div className={styles.brand}>
          <div className={styles.brandMark}>✦</div>
          <div>
            <p className={styles.brandTitle}>Researcher</p>
          </div>
        </div>

        <nav className={styles.nav}>
          {primaryNavItems.map((item) => (
            <button
              key={item.label}
              className={`${styles.navItem} ${styles.navButton} ${
                workspaceView === item.view ? styles.navItemActive : ""
              }`}
              onClick={() => setWorkspaceView(item.view)}
            >
              <span className={styles.navIcon}>{item.icon}</span>
              <span>{item.label}</span>
            </button>
          ))}

          {secondaryNavItems.map((item) => (
            <a key={item.label} href="#" className={styles.navItem}>
              <span className={styles.navIcon}>{item.icon}</span>
              <span>{item.label}</span>
            </a>
          ))}
        </nav>

        <div className={styles.sidebarFooter}>
          <div className={styles.profileCard}>
            <div className={styles.avatar}>A</div>
            <div>
              <p className={styles.profileName}>Alex</p>
              <p className={styles.profileEmail}>alex@email.com</p>
            </div>
            <span className={styles.chevron}>⌄</span>
          </div>

          <button className={styles.modeButton}>
            <span>☼</span>
            <span>Light Mode</span>
            <span className={styles.chevron}>⌄</span>
          </button>
        </div>
      </aside>

      <main className={styles.content}>
        <header className={styles.header}>
          <div>
            <p className={styles.sectionLabel}>
              {workspaceView === "chat" ? "Chat" : "Home"}
            </p>
          </div>
          <button className={styles.primaryAction} onClick={handleResetResearch}>
            + New Research
          </button>
        </header>

        {workspaceView === "home" ? (
          <>
            <section className={styles.heroCard}>
              <div className={styles.heroText}>
                <p className={styles.emojiLead} aria-hidden="true">
                  👋
                </p>
                <h1 className={styles.heroTitle}>
                  What would you like
                  <br />
                  to <span>research</span> today? 🚀
                </h1>
                <p className={styles.heroDescription}>
                  Send any text, PDF, image or link and I&apos;ll research it and chat
                  with you.
                </p>
              </div>

              <div className={styles.heroIllustration}>
                <div className={styles.sparkleOne}>✦</div>
                <div className={styles.sparkleTwo}>✦</div>
                <div className={styles.sparkleThree}>✦</div>
                <div className={styles.docGlow}>
                  <div className={styles.docIcon}>⌕</div>
                </div>
              </div>

              <div className={styles.materialGrid}>
                {materialTypes.map((item) => (
                  <button
                    key={item.key}
                    className={`${styles.materialCard} ${
                      composerType === item.key ? styles.materialCardActive : ""
                    }`}
                    onClick={() => handleMaterialSelect(item.key)}
                  >
                    <span className={styles.materialIcon}>
                      <Image src={item.icon} alt={item.alt} width={72} height={72} />
                    </span>
                    <span className={styles.materialLabel}>{item.label}</span>
                  </button>
                ))}
              </div>

              {(composerType === "text" || composerType === "link") && (
                <div className={styles.composerCard}>
                  <div className={styles.composerHeader}>
                    <h3>{composerType === "text" ? "Add text" : "Add link"}</h3>
                    <button
                      className={styles.composerClose}
                      onClick={() => setComposerType(null)}
                      aria-label="Close composer"
                    >
                      x
                    </button>
                  </div>

                  {composerType === "text" ? (
                    <>
                      <textarea
                        className={styles.composerTextarea}
                        placeholder="Paste notes, a paragraph, or a full lesson here..."
                        value={textDraft}
                        onChange={(event) => setTextDraft(event.target.value)}
                      />
                      <div className={styles.composerActions}>
                        <button
                          className={styles.secondaryAction}
                          onClick={() => documentInputRef.current?.click()}
                        >
                          Add .doc or .txt file instead
                        </button>
                        <button className={styles.primaryActionSmall} onClick={handleAddText}>
                          Add Text
                        </button>
                      </div>
                    </>
                  ) : (
                    <>
                      <input
                        className={styles.composerInput}
                        type="url"
                        placeholder="https://example.com/article"
                        value={linkDraft}
                        onChange={(event) => setLinkDraft(event.target.value)}
                      />
                      <div className={styles.composerActions}>
                        <p className={styles.composerHint}>
                          Paste any article, YouTube, or reference link.
                        </p>
                        <button className={styles.primaryActionSmall} onClick={handleAddLink}>
                          Add Link
                        </button>
                      </div>
                    </>
                  )}
                </div>
              )}
            </section>

            <section className={styles.uploadsCard}>
              <div className={styles.cardHeader}>
                <h2>Your uploads ({uploads.length})</h2>
              </div>

              <div className={styles.uploadList}>
                {uploads.map((file) => (
                  <div key={file.id} className={styles.uploadItem}>
                    <div className={styles.fileBadge}>
                      <Image src={file.icon} alt={file.alt} width={38} height={38} />
                    </div>
                    <div className={styles.uploadMeta}>
                      <p className={styles.uploadName}>{file.name}</p>
                      <p className={styles.uploadDetails}>{file.meta}</p>
                    </div>
                    <div className={styles.uploadActions}>
                      <span className={styles.success}>&#10003;</span>
                      <button
                        className={styles.removeButton}
                        onClick={() => handleRemoveUpload(file.id)}
                        aria-label={`Remove ${file.name}`}
                      >
                        x
                      </button>
                    </div>
                  </div>
                ))}
              </div>

              <button className={styles.startButton} onClick={handleStartResearch}>
                Start Research
              </button>
            </section>

            <section className={styles.howCard}>
              <h2>How it works</h2>
              <div className={styles.stepsGrid}>
                {steps.map((step, index) => (
                  <article key={step.title} className={styles.stepCard}>
                    <div className={styles.stepIcon}>{step.icon}</div>
                    <div>
                      <p className={styles.stepTitle}>
                        {index + 1}. {step.title}
                      </p>
                      <p className={styles.stepDescription}>{step.description}</p>
                    </div>
                  </article>
                ))}
              </div>
            </section>
          </>
        ) : (
          <section className={styles.chatWorkspace}>
            <div className={styles.chatMain}>
              <div className={styles.chatSummary}>
                <div>
                  <p className={styles.chatEyebrow}>Session overview</p>
                  <h2 className={styles.chatHeading}>Your materials are ready to study</h2>
                </div>
                <div className={styles.chatSummaryStats}>
                  <span>{uploads.length} sources</span>
                  <span>Adaptive tutor mode</span>
                </div>
              </div>

              <div className={styles.sourceStrip}>
                {uploads.map((file) => (
                  <div key={file.id} className={styles.sourceChip}>
                    <Image src={file.icon} alt={file.alt} width={26} height={26} />
                    <span>{file.name}</span>
                  </div>
                ))}
              </div>

              <div className={styles.messagesCard}>
                {chatMessages.length ? (
                  chatMessages.map((message) => (
                    <article
                      key={message.id}
                      className={`${styles.messageBubble} ${
                        message.role === "assistant"
                          ? styles.assistantMessage
                          : styles.userMessage
                      }`}
                    >
                      <p>{message.text}</p>
                    </article>
                  ))
                ) : (
                  <div className={styles.blankChatState}>
                    <p className={styles.blankChatEyebrow}>Ready to begin</p>
                    <h3>Ask your first question about the uploaded materials</h3>
                    <p>
                      Start with a summary request, a quiz, or ask for a simple
                      explanation.
                    </p>
                  </div>
                )}
              </div>

              <div className={styles.promptRow}>
                {starterPrompts.map((prompt) => (
                  <button
                    key={prompt}
                    className={styles.promptChip}
                    onClick={() => setMessageDraft(prompt)}
                  >
                    {prompt}
                  </button>
                ))}
              </div>

              <div className={styles.chatComposer}>
                <textarea
                  className={styles.chatTextarea}
                  placeholder="Ask the tutor to explain, quiz, compare, or review your answers..."
                  value={messageDraft}
                  onChange={(event) => setMessageDraft(event.target.value)}
                />
                {chatError ? <p className={styles.chatError}>{chatError}</p> : null}
                <div className={styles.chatComposerFooter}>
                  <div className={styles.chatComposerMeta}>
                    <span>Explains clearly</span>
                    <span>Builds quizzes</span>
                    <span>Tracks weak topics</span>
                  </div>
                  <button className={styles.primaryActionSmall} onClick={handleSendMessage}>
                    {isSending ? "Thinking..." : "Send"}
                  </button>
                </div>
              </div>
            </div>

            <aside className={styles.chatRail}>
              <section className={styles.railCard}>
                <div className={styles.railHeader}>
                  <h3>Recent research</h3>
                </div>
                <div className={styles.recentList}>
                  {recentResearch.map((item) => (
                    <div key={`${item.title}-${item.time}`} className={styles.recentItem}>
                      <Image src={item.icon} alt={item.alt} width={34} height={34} />
                      <div className={styles.recentMeta}>
                        <p>{item.title}</p>
                        <span>{item.time}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </section>

              <section className={styles.railCard}>
                <div className={styles.railHeader}>
                  <h3>Study tools</h3>
                </div>
                <div className={styles.railList}>
                  {coachCards.map((card) => (
                    <article key={card.title} className={styles.toolCard}>
                      <p className={styles.toolTitle}>{card.title}</p>
                      <p className={styles.toolText}>{card.text}</p>
                    </article>
                  ))}
                </div>
              </section>

              <section className={styles.railCard}>
                <div className={styles.railHeader}>
                  <h3>Next actions</h3>
                </div>
                <div className={styles.actionList}>
                  <button className={styles.railAction}>Generate quiz</button>
                  <button className={styles.railAction}>Explain weak spots</button>
                  <button className={styles.railAction}>Make flashcards</button>
                </div>
              </section>
            </aside>
          </section>
        )}
      </main>
    </div>
  );
}
