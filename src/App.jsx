import { useEffect, useRef, useState } from 'react'


const GALLERY_IMAGES = Array.from({ length: 25 }, (_, i) => `/assets/n${i + 1}.png`)
  .sort(() => Math.random() - 0.5)

const ROADMAP = [
  { phase: '01', title: 'Mint',        desc: 'Public mint opens. 4,444 NULLs enter the world.',                      active: true  },
  { phase: '02', title: 'Holder Drop', desc: 'Exclusive airdrop for all verified NULL holders.',                      active: false },
  { phase: '03', title: 'CC0 Release', desc: 'Full commercial rights granted. Your NULL is yours completely.',        active: false },
  { phase: '04', title: 'DAO',         desc: 'Holder-governed treasury and voting go live. Every NULL is a vote.',   active: false },
]

const FAQS = [
  { q: 'What blockchain is NULLs on?',    a: 'Solana. Fast execution, low fees, and native to culture-first drops.' },
  { q: 'What wallet do I need?',          a: 'Any Solana wallet — Phantom, Backpack, or Solflare all work.' },
  { q: 'What is CC0?',                    a: 'CC0 means no rights reserved. You own your NULL fully and can use it commercially, personally, or however you choose — no permission needed.' },
  { q: 'What is $NULLS?',                 a: '$NULLS is the memecoin companion launched on pump.fun alongside the collection. Coin meets identity.' },
  { q: 'How many unique traits are there?', a: '150 unique traits across 8 categories. No two NULLs are identical.' },
  { q: 'When does mint open?',            a: 'Soon. Follow on Telegram and X for the exact date and whitelist info.' },
]

export default function App() {
  const loadingScreenRef = useRef(null)
  const loadingBarFillRef = useRef(null)
  const loadingLabelRef = useRef(null)
  const introScreenRef = useRef(null)
  const pointerFieldRef = useRef(null)
  const noiseRef = useRef(null)
  const displacementRef = useRef(null)
  const blindfoldRef = useRef(null)
  const collectionRef = useRef(null)
  const heroCarouselRef = useRef(null)
  const [openFaq, setOpenFaq] = useState(null)

  // Loading animation effect
  useEffect(() => {
    const loadingScreen = loadingScreenRef.current
    const loadingBarFill = loadingBarFillRef.current
    const loadingLabel = loadingLabelRef.current
    if (!loadingScreen || !loadingBarFill || !loadingLabel) return

    document.body.classList.add('is-loading')

    let displayProgress = 0
    let targetProgress = 0
    let loaderRaf

    const renderProgress = (p) => {
      const pInt = Math.floor(p)
      loadingBarFill.style.width = `${p.toFixed(1)}%`
      loadingBarFill.parentElement.setAttribute('aria-valuenow', String(pInt))
      loadingLabel.textContent = `Loading ${pInt}%`
    }

    const animateTick = () => {
      const diff = targetProgress - displayProgress
      if (diff > 0.05) {
        displayProgress += Math.max(0.4, diff * 0.08)
        if (displayProgress > targetProgress) displayProgress = targetProgress
        renderProgress(displayProgress)
      }
      loaderRaf = requestAnimationFrame(animateTick)
    }

    loaderRaf = requestAnimationFrame(animateTick)

    const updateLoader = (loaded, total) => {
      const raw = total > 0 ? (loaded / total) * 99 : 0
      targetProgress = Math.max(targetProgress, raw)
    }

    const preloadAsset = (src) => new Promise((resolve) => {
      const img = new Image()
      img.onload = resolve
      img.onerror = resolve
      img.src = src
    })

    const sources = ['/assets/Nlogo.png', ...GALLERY_IMAGES]

    const preloadAllAssets = async () => {
      let loaded = 0
      updateLoader(loaded, sources.length)

      await Promise.all(
        sources.map((src) =>
          preloadAsset(src).then(() => {
            loaded += 1
            updateLoader(loaded, sources.length)
          })
        )
      )

      if (document.readyState !== 'complete') {
        await new Promise((resolve) => window.addEventListener('load', resolve, { once: true }))
      }

      targetProgress = 100
      await new Promise((resolve) => {
        const waitFor100 = () => {
          if (displayProgress >= 99.9) { resolve() }
          else { requestAnimationFrame(waitFor100) }
        }
        requestAnimationFrame(waitFor100)
      })
      cancelAnimationFrame(loaderRaf)
      renderProgress(100)
      loadingScreen.classList.add('hidden')
      document.body.classList.remove('is-loading')
      const introScreen = introScreenRef.current
      if (introScreen) {
        introScreen.classList.add('visible')
        document.body.classList.add('is-intro')
      }
    }

    preloadAllAssets()

    return () => {
      cancelAnimationFrame(loaderRaf)
    }
  }, [])

  // Pointer, ripple, scroll, SVG noise effect
  useEffect(() => {
    const root = document.documentElement
    const field = pointerFieldRef.current
    const noise = noiseRef.current
    const displacement = displacementRef.current
    const blindfold = blindfoldRef.current
    const collection = collectionRef.current
    if (!field || !noise || !displacement || !blindfold || !collection) return

    const detailTabs = Array.from(document.querySelectorAll('.detail-tab'))
    const storyCards = Array.from(document.querySelectorAll('.story-card'))

    let pointerX = window.innerWidth * 0.5
    let pointerY = window.innerHeight * 0.42
    let currentX = pointerX
    let currentY = pointerY
    let lastRipple = 0
    let lastMoveAt = performance.now()
    let rafId

    const setPointer = (x, y) => {
      pointerX = x
      pointerY = y
      lastMoveAt = performance.now()
    }

    const spawnRipple = (x, y) => {
      const now = performance.now()
      if (now - lastRipple < 84) return
      lastRipple = now

      const ripple = document.createElement('span')
      ripple.className = Math.random() < 0.16 ? 'ripple gold' : 'ripple'
      ripple.style.setProperty('--x', `${x - 14}px`)
      ripple.style.setProperty('--y', `${y - 14}px`)
      field.appendChild(ripple)
      ripple.addEventListener('animationend', () => ripple.remove(), { once: true })
    }

    const onPointerMove = (e) => {
      setPointer(e.clientX, e.clientY)
      spawnRipple(e.clientX, e.clientY)
    }

    const onPointerDown = (e) => {
      setPointer(e.clientX, e.clientY)
      spawnRipple(e.clientX, e.clientY)
      spawnRipple(e.clientX + 20, e.clientY + 8)
    }

    const onTouchMove = (e) => {
      const touch = e.touches[0]
      if (!touch) return
      setPointer(touch.clientX, touch.clientY)
    }

    window.addEventListener('pointermove', onPointerMove, { passive: true })
    window.addEventListener('pointerdown', onPointerDown, { passive: true })
    window.addEventListener('touchmove', onTouchMove, { passive: true })

    const toggleBlockHover = (active) => {
      document.body.classList.toggle('block-hover', active)
    }

    blindfold.addEventListener('pointerenter', () => toggleBlockHover(true))
    blindfold.addEventListener('pointerleave', () => toggleBlockHover(false))
    blindfold.addEventListener('focus', () => toggleBlockHover(true))
    blindfold.addEventListener('blur', () => toggleBlockHover(false))

    const frame = () => {
      currentX += (pointerX - currentX) * 0.12
      currentY += (pointerY - currentY) * 0.12

      const dx = pointerX - currentX
      const dy = pointerY - currentY
      const velocity = Math.min(1, (Math.abs(dx) + Math.abs(dy)) / 46)
      const idleFade = Math.max(0.1, 1 - Math.min(1, (performance.now() - lastMoveAt) / 2200))
      const intensity = velocity * 0.88 + idleFade * 0.14

      root.style.setProperty('--pointer-x', `${currentX}px`)
      root.style.setProperty('--pointer-y', `${currentY}px`)
      root.style.setProperty('--pointer-intensity', intensity.toFixed(3))
      root.style.setProperty('--drift-x', `${(currentX - window.innerWidth / 2) * 0.07}px`)
      root.style.setProperty('--drift-y', `${(currentY - window.innerHeight / 2) * 0.05}px`)

      const scrollY = window.scrollY
      const landingProgress = Math.min(1, scrollY / (window.innerHeight * 0.72))
      const collectionStart = collection.offsetTop - window.innerHeight * 0.82
      const collectionRange = window.innerHeight * 0.92
      const screenProgress = Math.max(0, Math.min(1, (scrollY - collectionStart) / collectionRange))

      root.style.setProperty('--landing-progress', landingProgress.toFixed(3))
      root.style.setProperty('--screen-progress', screenProgress.toFixed(3))

      const viewportCenter = window.innerHeight * 0.5
      detailTabs.forEach((tab) => {
        const rect = tab.getBoundingClientRect()
        const tabCenter = rect.top + rect.height / 2
        const distance = Math.abs(viewportCenter - tabCenter)
        const focus = Math.max(0, 1 - distance / (window.innerHeight * 0.42))
        const opacity = 0.22 + focus * 0.78
        const translateY = 44 - focus * 44
        const scale = 0.96 + focus * 0.04
        tab.style.opacity = opacity.toFixed(3)
        tab.style.transform = `translateY(${translateY.toFixed(1)}px) scale(${scale.toFixed(3)})`
      })

      storyCards.forEach((card) => {
        const rect = card.getBoundingClientRect()
        const cardCenter = rect.top + rect.height / 2
        const distance = Math.abs(viewportCenter - cardCenter)
        const focus = Math.max(0, 1 - distance / (window.innerHeight * 0.45))
        const opacity = 0.18 + focus * 0.82
        const translateY = 56 - focus * 56
        const scale = 0.97 + focus * 0.03
        card.style.opacity = opacity.toFixed(3)
        card.style.transform = `translateY(${translateY.toFixed(1)}px) scale(${scale.toFixed(3)})`
      })

      noise.setAttribute('baseFrequency', `${(0.011 + intensity * 0.01).toFixed(4)} ${(0.017 + intensity * 0.01).toFixed(4)}`)
      displacement.setAttribute('scale', `${(6 + intensity * 18).toFixed(2)}`)

      rafId = requestAnimationFrame(frame)
    }

    rafId = requestAnimationFrame(frame)

    return () => {
      cancelAnimationFrame(rafId)
      window.removeEventListener('pointermove', onPointerMove)
      window.removeEventListener('pointerdown', onPointerDown)
      window.removeEventListener('touchmove', onTouchMove)
    }
  }, [])

  // Center hero carousel on mount
  useEffect(() => {
    const carousel = heroCarouselRef.current
    if (!carousel) return
    const items = [...carousel.querySelectorAll('li')]
    const mid = items[Math.floor(items.length / 2)]
    if (mid) {
      requestAnimationFrame(() => requestAnimationFrame(() => {
        carousel.scrollLeft = mid.offsetLeft + mid.offsetWidth / 2 - carousel.clientWidth / 2
      }))
    }
  }, [])


  const handleEnter = () => {
    const introScreen = introScreenRef.current
    if (introScreen) {
      introScreen.classList.add('hidden')
      document.body.classList.remove('is-intro')
    }
  }

  return (
    <>
      {/* Grain / film noise overlay */}
      <div className="grain-overlay" aria-hidden="true" />

      {/* Loading screen */}
      <div
        className="loading-screen"
        id="loading-screen"
        ref={loadingScreenRef}
        aria-live="polite"
        aria-label="Loading page"
      >
        <img src="/assets/Nlogo.png" alt="NULLs loading logo" className="loading-logo" />
<div className="loading-bar-wrap">
          <div
            className="loading-bar"
            role="progressbar"
            aria-valuemin={0}
            aria-valuemax={100}
            aria-valuenow={0}
          >
            <span className="loading-bar-fill" ref={loadingBarFillRef}></span>
          </div>
          <span className="loading-label" ref={loadingLabelRef}>Loading 0%</span>
        </div>
      </div>

      {/* Intro video screen */}
      <div className="intro-screen" ref={introScreenRef} aria-label="Intro">
        <video
          className="intro-video"
          src="/assets/welcome11O11.mp4"
          autoPlay
          muted
          playsInline
          loop
          aria-hidden="true"
        />
        <button className="intro-enter" onClick={handleEnter}>
          Enter the Nothing
        </button>
      </div>

      {/* SVG filter for wordmark distortion */}
      <svg width="0" height="0" aria-hidden="true" focusable="false">
        <filter id="null-distort">
          <feTurbulence
            ref={noiseRef}
            id="noise"
            type="fractalNoise"
            baseFrequency="0.012 0.018"
            numOctaves="2"
            seed="7"
            result="noise"
          />
          <feDisplacementMap
            ref={displacementRef}
            id="displacement"
            in="SourceGraphic"
            in2="noise"
            scale="8"
            xChannelSelector="R"
            yChannelSelector="G"
          />
        </filter>
      </svg>

      {/* Pointer field for ripple effects */}
      <div className="pointer-field" aria-hidden="true" ref={pointerFieldRef}>
        <div className="pointer-core"></div>
      </div>

      <div className="page-shell">
        {/* Landing / Hero section */}
        <section className="landing">
          <div className="page-dim" aria-hidden="true"></div>
          <header className="topbar">
            <nav className="nav-left">
              <a href="#collection">Collection</a>
              <a href="#manifesto">Manifesto</a>
              <a href="#members">Members</a>
            </nav>
            <div className="nav-center">
              <a href="/" aria-label="NULLs home">
                <img src="/assets/Nlogo.png" alt="NULLs mark" />
              </a>
            </div>
            <div className="nav-right">
              <a href="https://t.me/nulls_portal" target="_blank" rel="noreferrer">Telegram</a>
            </div>
          </header>

          <div className="hero">
            <div className="hero-stack">
              <ul className="hero-carousel" ref={heroCarouselRef} aria-hidden="true">
                {GALLERY_IMAGES.map((src, i) => (
                  <li key={src}>
                    <img src={src} alt="" />
                  </li>
                ))}
              </ul>
              <div className="hero-word">
                <h1 className="wordmark" aria-label="NULLs">
                  <span className="wordmark-text">NULLS</span>
                  <span
                    className="wordmark-block"
                    ref={blindfoldRef}
                    tabIndex={0}
                    aria-label="Reveal theme"
                  ></span>
                </h1>
              </div>
              <div className="hero-caption">
                <span>A collection of 4,444 unseen.</span>
                <span>no origin.</span>
              </div>
            </div>
            <div className="hero-bottom">
              <div className="hero-cta">
                <a href="#" className="cta-btn">Buy Coin</a>
                <a href="https://launchmynft.io/sol/22942" target="_blank" rel="noreferrer" className="cta-btn">Mint NFT</a>
              </div>
            </div>
            <div className="scroll-prompt" aria-hidden="true">
              <span>Scroll</span>
              <div className="scroll-track">
                <div className="scroll-bar"></div>
              </div>
            </div>
          </div>
        </section>

        {/* Content / Collection */}
        <section className="content" id="collection" ref={collectionRef}>
          <section className="screen-section">
            {/* Details widget */}
            <div className="details-widget" id="members">
              <div className="detail-tabs" role="tablist" aria-label="NULLs details">
                <button
                  className="detail-tab"
                  type="button"
                  role="tab"
                  aria-selected="false"
                  data-label="Ticker"
                  data-title="$NULLS"
                  data-body="Memecoin attention wrapped around a visual identity that can last longer."
                >
                  <span className="detail-kicker">Ticker</span>
                  <strong>$NULLS</strong>
                  <span>Coin meets collection</span>
                </button>
                <button
                  className="detail-tab"
                  type="button"
                  role="tab"
                  aria-selected="false"
                  data-label="Launchpad"
                  data-title="Pump.fun"
                  data-body="Art based memecoin."
                >
                  <span className="detail-kicker">Launchpad</span>
                  <strong>Pump.fun</strong>
                  <span>Art based memecoin</span>
                </button>
                <button
                  className="detail-tab"
                  type="button"
                  role="tab"
                  aria-selected="false"
                  data-label="Chain"
                  data-title="Solana"
                  data-body="Fast execution, sharp culture, and a cleaner lane for identity-first drops."
                >
                  <span className="detail-kicker">Chain</span>
                  <strong>Solana</strong>
                  <span>Fast and culture native</span>
                </button>
              </div>
            </div>

            {/* Story grid / Manifesto */}
            <div className="story-grid" id="manifesto">
              <article className="story-card">
                <span className="story-card-label">The Concept</span>
                <h3>Identity.</h3>
                <p>
                  In a world obsessed with labels, NULLs choose to be nothing. A matte-black vessel.
                  A blank face. A declaration of presence without performance.
                </p>
              </article>
              <article className="story-card">
                <span className="story-card-label">The Art</span>
                <h3>Craft.</h3>
                <p>
                  150 unique traits across 8 categories: face treatments, hair, outfits, and
                  accessories. Each NULL is a one-of-a-kind convergence built from designed elements.
                </p>
              </article>
              <article className="story-card">
                <span className="story-card-label">The Vision</span>
                <h3>Owned.</h3>
                <p>
                  NULLs is a statement. Holder-governed. CC0 licensed. Built on Solana for
                  permanence. Your NULL is yours fully, completely, unconditionally.
                </p>
              </article>
            </div>

            {/* Roadmap */}
            <div className="roadmap-section" id="roadmap">
              <p className="section-kicker">Roadmap</p>
              <div className="roadmap-steps">
                {ROADMAP.map((step) => (
                  <div className={`roadmap-step${step.active ? ' active' : ''}`} key={step.phase}>
                    <div className="roadmap-dot" />
                    <div className="roadmap-body">
                      <span className="roadmap-phase">{step.phase}</span>
                      <h4 className="roadmap-title">{step.title}</h4>
                      <p className="roadmap-desc">{step.desc}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* FAQ */}
            <div className="faq-section" id="faq">
              <p className="section-kicker">FAQ</p>
              {FAQS.map((item, i) => (
                <div className="faq-item" key={i}>
                  <button
                    className="faq-q"
                    aria-expanded={openFaq === i}
                    onClick={() => setOpenFaq(openFaq === i ? null : i)}
                  >
                    {item.q}
                    <span className="faq-icon" aria-hidden="true">+</span>
                  </button>
                  <div className={`faq-a${openFaq === i ? ' open' : ''}`}>
                    <p>{item.a}</p>
                  </div>
                </div>
              ))}
            </div>

            <div className="section-cta">
              <a href="#" className="cta-btn cta-btn--light">Buy Coin</a>
            </div>
          </section>

          <footer className="site-footer">
            <div className="site-footer-left">
              <span>&copy; NULLs 2026</span>
              <span>4,444 unseen</span>
              <span>Solana</span>
            </div>
            <div className="site-footer-right">
              <a href="#collection">Collection</a>
              <a href="#manifesto">No Origin</a>
              <a href="https://x.com" target="_blank" rel="noreferrer">X</a>
            </div>
          </footer>
        </section>
      </div>
    </>
  )
}
