"use client";

import Image from "next/image";
import { useRef, useState } from "react";
import styles from "./page.module.css";

const sidebarItems = [
  { label: "Home", icon: "\u2302", active: true },
  { label: "History", icon: "\u25F7" },
  { label: "Projects", icon: "\u25A1" },
  { label: "Bookmarks", icon: "\u25AF" },
  { label: "Templates", icon: "\u2318" },
  { label: "Settings", icon: "\u2699" },
];

const materialTypes = [
  { key: "document", label: "Text", icon: "/doc.png", alt: "Text document icon" },
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
    icon: "\u21EA",
  },
  {
    title: "AI researches",
    description: "It will analyze and gather key insights",
    icon: "\u25D4",
  },
  {
    title: "Let's chat",
    description: "Ask questions and get answers",
    icon: "\u25CC",
  },
];

const starterPrompts = [
  "Give me the 5 key ideas from these materials.",
  "Quiz me on the weak parts first.",
  "Explain this like I'm a beginner.",
  "Create a short study plan from these uploads.",
];

const recentResearch = [
  { title: "The Future of AI.pdf", time: "Today, 9:41 AM", icon: "/pdf.png", alt: "PDF icon" },
  { title: "Mountain Landscape.jpg", time: "Today, 9:35 AM", icon: "/image.png", alt: "Image icon" },
  { title: "Renewable energy is essential...", time: "Yesterday, 8:20 PM", icon: "/doc.png", alt: "Document icon" },
  { title: "https://example.com/article", time: "May 12, 2024", icon: "/link.png", alt: "Link icon" },
];

const tutorMessages = [
  {
    id: "m1",
    role: "assistant",
    title: "Research ready",
    text: "I've reviewed your uploads and turned them into one study workspace. The materials mostly focus on AI trends, visual references, and sustainability notes.",
  },
  {
    id: "m2",
    role: "assistant",
    title: "What I noticed",
    text: "There are three recurring themes: future impact, practical examples, and long-term risk. I can explain them simply, quiz you, or compare ideas across the files.",
  },
  {
    id: "m3",
    role: "user",
    text: "Start by explaining the main idea in simple words.",
  },
  {
    id: "m4",
    role: "assistant",
    title: "Simple explanation",
    text: "At a high level, the materials say that powerful tools become useful only when people can apply them clearly. The big opportunity is not just the technology itself, but how it changes learning, work, and decision making.",
  },
];

const coachCards = [
  {
    title: "Lesson mode",
    text: "Walk through the material step by step like a tutor.",
  },
  {
    title: "Quiz mode",
    text: "Generate quick questions and check your answers.",
  },
  {
    title: "Weak spots",
    text: "Repeat difficult topics until they stick.",
  },
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

export default function Home() {
  const [workspaceView, setWorkspaceView] = useState("home");
  const [uploads, setUploads] = useState(initialUploads);
  const [composerType, setComposerType] = useState(null);
  const [textDraft, setTextDraft] = useState("");
  const [linkDraft, setLinkDraft] = useState("");
  const [messageDraft, setMessageDraft] = useState("");
  const documentInputRef = useRef(null);
  const pdfInputRef = useRef(null);
  const imageInputRef = useRef(null);

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

    if (type === "document") {
      documentInputRef.current?.click();
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

    setComposerType("link");
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

  const handleNewResearch = () => {
    setWorkspaceView("home");
    setComposerType(null);
    setTextDraft("");
    setLinkDraft("");
    setMessageDraft("");
  };

  const handleStartResearch = () => {
    if (!uploads.length) {
      return;
    }

    setWorkspaceView("chat");
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
          <div className={styles.brandMark}>\u2726</div>
          <div>
            <p className={styles.brandTitle}>Researcher</p>
          </div>
        </div>

        <nav className={styles.nav}>
          {sidebarItems.map((item) => (
            <a
              key={item.label}
              href="#"
              className={`${styles.navItem} ${item.active ? styles.navItemActive : ""}`}
            >
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
            <span className={styles.chevron}>\u2304</span>
          </div>

          <button className={styles.modeButton}>
            <span>\u263C</span>
            <span>Light Mode</span>
            <span className={styles.chevron}>\u2304</span>
          </button>
        </div>
      </aside>

      <main className={styles.content}>
        <header className={styles.header}>
          <div>
            <p className={styles.sectionLabel}>
              {workspaceView === "home" ? "Home" : "Research Chat"}
            </p>
          </div>
          <button className={styles.primaryAction} onClick={handleNewResearch}>
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
                <div className={styles.sparkleOne}>\u2726</div>
                <div className={styles.sparkleTwo}>\u2726</div>
                <div className={styles.sparkleThree}>\u2726</div>
                <div className={styles.docGlow}>
                  <div className={styles.docIcon}>\u2315</div>
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

              <div className={styles.quickAddRow}>
                <button
                  className={styles.secondaryAction}
                  onClick={() => setComposerType("text")}
                >
                  Paste text
                </button>
                <button
                  className={styles.secondaryAction}
                  onClick={() => setComposerType("link")}
                >
                  Add link
                </button>
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
                  <span>Personal tutor mode</span>
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
                {tutorMessages.map((message) => (
                  <article
                    key={message.id}
                    className={`${styles.messageBubble} ${
                      message.role === "assistant"
                        ? styles.assistantMessage
                        : styles.userMessage
                    }`}
                  >
                    {message.role === "assistant" && message.title ? (
                      <p className={styles.messageTitle}>{message.title}</p>
                    ) : null}
                    <p>{message.text}</p>
                  </article>
                ))}
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
                <div className={styles.chatComposerFooter}>
                  <div className={styles.chatComposerMeta}>
                    <span>Adaptive tutor</span>
                    <span>Quiz aware</span>
                    <span>Tracks weak topics</span>
                  </div>
                  <button className={styles.primaryActionSmall}>Send</button>
                </div>
              </div>
            </div>

            <aside className={styles.chatRail}>
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
