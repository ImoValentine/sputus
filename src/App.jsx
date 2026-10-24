import React, { useEffect, useMemo, useRef, useState } from 'react';

const KEYS = { submissions: 'sputus.submissions.v1', profile: 'sputus.profile.v1' };
const CATEGORIES = ['Poetry', 'Short story', 'Fiction', 'Non-fiction', 'Essay', 'Memoir', 'Flash fiction', 'Creative writing', 'Creative coding'];
const PRIZE_BENEFITS = [
  'Certificate and a place on the SPUTUS plaque',
  'LinkedIn publications',
  'Social media marketing for a product of the winner’s choice, valued at R2,000',
  'Connections with talent seekers in the winner’s domain',
];
const PRIZE_MONEY = ['First prize: R13,000', 'Second prize: R8,000', 'Third prize: R3,000'];
const COMPETITIONS = [
  {
    id: 'say-it-like-it-is-mock',
    title: 'Say it like it is',
    organiser: 'SPUTUS · Mock competition',
    category: 'Creative writing',
    closingDate: '2027-02-03',
    timezone: 'SAST (UTC+2)',
    fee: 'R200',
    prize: 'R13,000 first prize · R8,000 second prize · R3,000 third prize, plus winner benefits',
    maxMb: 10,
    eligibility: 'Open internationally to writers aged 20 and older.',
    eligibilityShort: 'International · ages 20+',
    description: 'Write three short works exploring a relationship that changes over time. You are either a male or female member of the nobility, and you meet someone who becomes a friend, lover, teacher, or muse.',
    rules: 'Submit three original short works, each no longer than 7,000 words. The writing must show character development through the relationship. Include one element of climax and one element of anticlimax. This is a mock competition; an entry is not delivered to a real organiser.',
    judging: 'Entries will be considered for character development, the evolving relationship, and effective use of climax and anticlimax.',
    isMock: true,
  },
  {
    id: 'creative-coding-embedded-systems',
    title: 'Creative Coding Solutions',
    organiser: 'SPUTUS · Creative coding competition',
    category: 'Creative coding',
    closingDate: '2027-03-05',
    timezone: 'SAST (UTC+2)',
    fee: 'R200',
    prize: 'R13,000 first prize · R8,000 second prize · R3,000 third prize, plus winner benefits',
    maxMb: 10,
    eligibility: 'Open internationally to entrants aged 20 and older.',
    eligibilityShort: 'International · ages 20+',
    description: 'Design a robust application that monitors the logs and performance of an embedded system, such as a robot arm or advanced laser printer.',
    rules: 'The solution must be implemented in C++ and use multithreading, AI, and redundancy in cloud computing. Explain how the application monitors system logs and performance and remains robust. Account for computation time, algorithmic complexity, and data structures. This preview accepts PDF files only; it does not collect source code.',
    judging: 'Solutions will be assessed on C++ implementation, multithreading, AI, cloud redundancy, monitoring and robustness, plus thoughtful treatment of computation time, algorithmic complexity, and data structures.',
    postWinnerNote: 'After winners are announced, Agent 1M0 will review submissions to Innovation Challenges. If multiple participants’ projects align in key aspects, goals, or opinions, they will be notified of the connection and invited to collaborate on a shared project.',
  },
  {
    id: 'what-shall-we-do',
    title: 'What shall we do?',
    organiser: 'SPUTUS · Creative writing competition',
    category: 'Creative writing',
    closingDate: '',
    timezone: 'SAST (UTC+2)',
    fee: 'R200',
    prize: 'R13,000 first prize · R8,000 second prize · R3,000 third prize, plus winner benefits',
    maxMb: 10,
    eligibility: 'Open internationally to writers aged 20 and older.',
    eligibilityShort: 'International · ages 20+',
    description: 'A creative writing competition about revolution, inevitability, and the possibility of choosing a more humane path through a world in shambles.',
    rules: 'Submit one original creative writing work of no more than 4,000 words. Topic: “Viva the revolution. Revolution is inevitable; the world is in shambles. History has taught us that there is always bloodshed. A revolution is inevitable. How shall we have a nicer one this time round?” This preview accepts PDF files only; entries are not delivered to a real organiser.',
    judging: 'Entries will be considered for originality, craft, and their response to the topic.',
  },
];
const load = (key, fallback) => { try { return JSON.parse(localStorage.getItem(key)) ?? fallback; } catch { return fallback; } };
const store = (key, value) => localStorage.setItem(key, JSON.stringify(value));
const makeId = () => globalThis.crypto?.randomUUID?.() || `${Date.now()}-${Math.random().toString(36).slice(2)}`;
const dateLabel = date => date ? new Intl.DateTimeFormat(undefined, { day: 'numeric', month: 'short', year: 'numeric', timeZone: 'UTC' }).format(new Date(`${date}T12:00:00Z`)) : 'Not set';
const deadlineEnd = date => new Date(`${date}T21:59:59Z`); // 23:59:59 SAST
const isClosed = date => Boolean(date && deadlineEnd(date) < new Date());
const closingSoon = date => { if (!date) return false; const end = deadlineEnd(date); return end >= new Date() && end < new Date(Date.now() + 14 * 86400000); };

function App() {
  const competitions = COMPETITIONS;
  const [submissions, setSubmissions] = useState(() => load(KEYS.submissions, []));
  const [profile, setProfile] = useState(() => load(KEYS.profile, { name: '' }));
  const [view, setView] = useState(() => location.hash.slice(1) || 'discover');
  const [modal, setModal] = useState(null);
  const [query, setQuery] = useState('');
  const [category, setCategory] = useState('');
  const [sort, setSort] = useState('closing');
  const [toast, setToast] = useState('');
  const closeRef = useRef(null);

  useEffect(() => store(KEYS.submissions, submissions), [submissions]);
  useEffect(() => store(KEYS.profile, profile), [profile]);
  useEffect(() => {
    const onHash = () => setView(location.hash.slice(1) || 'discover');
    addEventListener('hashchange', onHash);
    return () => removeEventListener('hashchange', onHash);
  }, []);
  useEffect(() => {
    if (!modal) return undefined;
    closeRef.current?.focus();
    const escape = event => { if (event.key === 'Escape') setModal(null); };
    addEventListener('keydown', escape);
    return () => removeEventListener('keydown', escape);
  }, [modal]);
  useEffect(() => {
    if (!toast) return undefined;
    const timeout = setTimeout(() => setToast(''), 2800);
    return () => clearTimeout(timeout);
  }, [toast]);

  const shownCompetitions = useMemo(() => competitions
    .filter(item => (!category || item.category === category) && (!query || `${item.title} ${item.organiser} ${item.category} ${item.description}`.toLowerCase().includes(query.toLowerCase())))
    .sort((a, b) => sort === 'title' ? a.title.localeCompare(b.title) : (a.closingDate || '9999').localeCompare(b.closingDate || '9999')),
  [competitions, category, query, sort]);

  function navigate(next) {
    const page = ['discover', 'submissions', 'guidance', 'about'].includes(next) ? next : 'discover';
    setView(page);
    if (location.hash !== `#${page}`) history.replaceState(null, '', `#${page}`);
  }
  function saveProfile(next) {
    setProfile(next);
    setModal(null);
    setToast('Profile saved in this browser.');
  }
  function submitEntry(entry) {
    setSubmissions(current => [entry, ...current]);
    setProfile(current => ({ ...current, name: entry.writer }));
    setModal({ type: 'success', entry });
  }

  return <>
    <a className="skip-link" href="#main">Skip to content</a>
    <header className="site-header">
      <a className="brand" href="#discover" onClick={() => navigate('discover')} aria-label="SPUTUS home"><span className="brand-mark" aria-hidden="true">S</span><span>SPUTUS<span className="brand-period">.</span><small>SPITTING BARS.</small></span></a>
      <nav aria-label="Main navigation">
        <NavLink name="discover" current={view} onNavigate={navigate}>Discover</NavLink>
        <NavLink name="submissions" current={view} onNavigate={navigate}>My submissions <span className="nav-count">{submissions.length}</span></NavLink>
        <NavLink name="guidance" current={view} onNavigate={navigate}>Guidance</NavLink>
        <NavLink name="about" current={view} onNavigate={navigate}>About us</NavLink>
      </nav>
      <button className="profile-button" onClick={() => setModal({ type: 'profile' })} aria-label="Open profile settings"><span className="avatar">{profile.name?.trim().charAt(0).toUpperCase() || 'W'}</span><span className="profile-name">{profile.name || 'Writer profile'}</span><span aria-hidden="true">⌄</span></button>
    </header>
    <div className="demo-note"><span className="note-dot" /> Preview mode <span>— entries and competitions stay in this browser only.</span></div>
    <main id="main">
      {view === 'discover' && <>
        <section className="hero">
          <div className="hero-copy"><p className="eyebrow">A place for the words you’ve finished</p><h1>Find your next<br /><em>open door.</em></h1><p className="hero-intro">Discover writing competitions, understand the rules, and submit your finished work as a PDF.</p></div>
          <div className="hero-visual"><img className="hero-book" src="/images/leather-book.jpg" alt="An ornate leather-bound book with a glowing golden emblem" /><div className="hero-aside"><div className="hero-aside-copy"><p>Your work,<br />your words.<br /><strong>The stage is here.</strong></p></div></div></div>
        </section>
        <section className="catalog" aria-labelledby="catalog-heading">
          <div className="section-heading"><div><p className="eyebrow">The open call</p><h2 id="catalog-heading">Find a competition</h2></div></div>
          <div className="filters"><label className="search-field"><span aria-hidden="true">⌕</span><input type="search" value={query} onChange={event => setQuery(event.target.value)} placeholder="Search competitions" aria-label="Search competitions" /></label><label className="select-field"><select value={category} onChange={event => setCategory(event.target.value)} aria-label="Filter by category"><option value="">All categories</option>{CATEGORIES.map(item => <option key={item}>{item}</option>)}</select></label><label className="select-field"><select value={sort} onChange={event => setSort(event.target.value)} aria-label="Sort competitions"><option value="closing">Closing soon</option><option value="title">Title A–Z</option></select></label></div>
          <div className="competition-list" aria-live="polite">
            {shownCompetitions.length ? shownCompetitions.map(item => <CompetitionCard key={item.id} competition={item} onDetails={() => setModal({ type: 'details', competition: item })} />) : <div className="empty-state"><div className="empty-symbol" aria-hidden="true">⌕</div><h3>No matching calls</h3><p>Try another search or category.</p></div>}
          </div>
        </section>
        <section className="lower-note"><span className="lower-glyph" aria-hidden="true">¶</span><div><p className="eyebrow">Good work deserves a fair reading</p><h2>Know the rules.<br /><em>Master them.<br />Break them.<br />Reforge them.</em></h2><p className="proceeds-note">70% of the proceeds go to empowering university students in the faculties of Science and Arts—sponsoring students in need with study material, upskilling, tuition fees, and internships.</p></div><button className="arrow-link" onClick={() => navigate('guidance')}>Read the writer’s guide <span aria-hidden="true">→</span></button></section>
      </>}
      {view === 'submissions' && <Submissions submissions={submissions} onDetails={entry => setModal({ type: 'confirmation', entry })} onDiscover={() => navigate('discover')} />}
      {view === 'guidance' && <Guidance />}
      {view === 'about' && <AboutUs />}
    </main>
    <footer><p>Designed, Developed by Imraan Jacobs, powered by Jacobs &amp; co Dynamic Development</p></footer>

    {modal && <Modal closeRef={closeRef} onClose={() => setModal(null)}>
      {modal.type === 'details' && <CompetitionDetails competition={modal.competition} alreadyEntered={submissions.some(item => item.competitionId === modal.competition.id)} onEnter={() => setModal({ type: 'entry', competition: modal.competition })} />}
      {modal.type === 'entry' && <EntryForm competition={modal.competition} initialName={profile.name} alreadyEntered={submissions.some(item => item.competitionId === modal.competition.id)} onSubmit={submitEntry} />}
      {modal.type === 'profile' && <ProfileForm profile={profile} onSave={saveProfile} />}
      {modal.type === 'confirmation' && <Confirmation entry={modal.entry} onClose={() => setModal(null)} />}
      {modal.type === 'success' && <Success entry={modal.entry} onSubmissions={() => { setModal(null); navigate('submissions'); }} />}
    </Modal>}
    <div className={`toast ${toast ? 'show' : ''}`} role="status" aria-live="polite">{toast}</div>
  </>;
}

function NavLink({ name, current, onNavigate, children }) {
  return <a className={`nav-link ${current === name ? 'active' : ''}`} href={`#${name}`} onClick={event => { event.preventDefault(); onNavigate(name); }}>{children}</a>;
}

function CompetitionCard({ competition: item, onDetails }) {
  const closed = isClosed(item.closingDate);
  return <article className="competition-card"><div className="card-top"><span className="tag">{item.category}</span><span className="status">{item.isMock ? 'Mock call · ' : ''}{closed ? 'Closed' : closingSoon(item.closingDate) ? 'Closing soon' : 'Open'}</span></div><h3 className="card-title">{item.title}</h3><span className="organiser">{item.organiser}</span><div className="card-meta"><div><span className="meta-label">Deadline · {item.timezone || 'UTC'}</span><span className="meta-value">{dateLabel(item.closingDate)}</span></div><div><span className="meta-label">Eligibility</span><span className="meta-value">{item.eligibilityShort || 'See requirements'}</span></div></div><div className="card-actions"><span className="fee">{item.fee || 'No fee listed'}</span><button className="small-link" onClick={onDetails}>View details <span aria-hidden="true">→</span></button></div></article>;
}

function Submissions({ submissions, onDetails, onDiscover }) {
  return <section className="page-section"><div className="page-heading"><p className="eyebrow">Your entry history</p><h1>My submissions<span className="brand-period">.</span></h1><p>Every entry you submit, gathered in one place.</p></div><div className="submission-list" aria-live="polite">{submissions.length ? submissions.map(entry => <article className="submission-row" key={entry.id}><div><h2>{entry.competition}</h2><p>{entry.filename} · {new Date(entry.submittedAt).toLocaleDateString()}</p></div><span className="ref-number">{entry.reference}</span><span className="pill">{entry.status}</span><button className="small-link" onClick={() => onDetails(entry)}>View confirmation →</button></article>) : <div className="empty-state"><div className="empty-symbol" aria-hidden="true">¶</div><h3>No entries yet</h3><p>When you submit a finished PDF to an open competition, your confirmation and reference will appear here.</p><button className="empty-action" onClick={onDiscover}>Explore competitions →</button></div>}</div></section>;
}

const GUIDES = [
  ['01', 'Read the call twice', 'Check who can enter, the deadline and timezone, word limits, formatting rules, and whether simultaneous submissions are allowed.'],
  ['02', 'Prepare your PDF', 'Export a clean, readable PDF. Follow the call’s anonymity and naming requirements, then open the exported file to check every page.'],
  ['03', 'Keep your reference', 'Save your confirmation number and a copy of the exact file you submitted. Check your entry status for any organiser updates.'],
  ['04', 'Protect your work', 'Submit only work you have the right to share. Review the competition’s terms and privacy information before accepting its declarations.'],
];
function Guidance() {
  return <section className="page-section"><div className="page-heading"><p className="eyebrow">A little before the send</p><h1>Writer’s guidance<span className="brand-period">.</span></h1><p>Practical notes for sending finished work with care.</p></div><div className="guide-grid">{GUIDES.map(([number, title, description]) => <article key={number}><span>{number}</span><h2>{title}</h2><p>{description}</p></article>)}</div></section>;
}

function AboutUs() {
  return <section className="page-section"><div className="page-heading"><p className="eyebrow">Words, ideas, and opportunity</p><h1>About SPUTUS<span className="brand-period">.</span></h1><p>SPUTUS brings creative opportunities into one place and makes each call’s requirements clear.</p></div><div className="about-grid"><article><span className="eyebrow">What we do</span><h2>A stage for finished work and bold ideas.</h2><p>From creative writing to creative coding, SPUTUS invites people to share considered work, take on a challenge, and connect their ideas with new audiences.</p></article><article><span className="eyebrow">Why it matters</span><h2>Opportunity should travel further.</h2><p>70% of proceeds go toward empowering university students in the faculties of Science and Arts, including study materials, upskilling, tuition fees, and internships for students in need.</p></article></div><section className="creator-note"><p className="eyebrow">A note from the creator</p><h2>About the creator of SPUTUS:</h2><p>Imraan Jacobs — I created this platform as a system of servitude. My reasoning has duality: first, nurturing my own creativity, passions, and intellectual ambition; and second, potentially nurturing the creativity, passions, and intellectual ambitions of others. But mostly, it is for fun. I echo the sentiments of mankind: growth and cultivation of the mind are fun. Any competitor in any competition will turn out more refined than they were before.</p><p>Imraan Jacobs is a software engineer, writer, worm farmer, and philosopher, but before all that, he is just a person who tries. He holds the belief that it is unvirtuous not to try.</p></section></section>;
}

function Modal({ children, closeRef, onClose }) {
  return <div className="modal-backdrop" onMouseDown={event => { if (event.target === event.currentTarget) onClose(); }}><section className="dialog" role="dialog" aria-modal="true" tabIndex={-1} onMouseDown={event => event.stopPropagation()}><button ref={closeRef} className="dialog-close" onClick={onClose} aria-label="Close dialog">×</button>{children}</section></div>;
}

function CompetitionDetails({ competition: item, alreadyEntered, onEnter }) {
  const [acceptedRules, setAcceptedRules] = useState(false);
  const [acceptedPrize, setAcceptedPrize] = useState(false);
  const closed = isClosed(item.closingDate);
  return <>
    <p className="eyebrow">{item.category} · {item.isMock ? 'Mock competition · ' : ''}{closed ? 'Closed' : 'Open for entries'}</p>
    <h2>{item.title}</h2>
    <p className="detail-organiser">Hosted by {item.organiser}</p>
    <div className="detail-block"><h3>Overview</h3><p>{item.description}</p></div>
    <div className="detail-block"><h3>Eligibility</h3><p>{item.eligibility}</p></div>
    <div className="detail-block"><h3>Rules &amp; requirements</h3><p>{item.rules}</p><p>PDF only · Maximum {item.maxMb} MB · {item.timezone || 'UTC'} deadline: {dateLabel(item.closingDate)}</p></div>
    <div className="detail-block">
      <h3>Prize pool &amp; benefits</h3>
      <ul className="detail-list">{PRIZE_MONEY.map(prize => <li key={prize}>{prize}</li>)}</ul>
      <ul className="detail-list">{PRIZE_BENEFITS.map(benefit => <li key={benefit}>{benefit}</li>)}</ul>
    </div>
    <div className="detail-block"><h3>Judging</h3><p>{item.judging || 'Judging criteria not provided.'}</p><p>No AI will be used in the judging process.</p></div>
    {item.postWinnerNote && <div className="detail-block"><h3>Post-award collaboration</h3><p>{item.postWinnerNote}</p></div>}
    <div className="detail-block"><h3>Entry details</h3><p>{item.fee || 'No fee listed'} · {item.prize || 'See prize pool above'}</p></div>
    <label className="declaration"><input type="checkbox" checked={acceptedRules} onChange={event => setAcceptedRules(event.target.checked)} /> I have read and agree to the competition rules.</label>
    <label className="declaration"><input type="checkbox" checked={acceptedPrize} onChange={event => setAcceptedPrize(event.target.checked)} /> I have reviewed the prize pool and acknowledge that judging is conducted without AI.</label>
    <div className="detail-actions"><button className="primary-button" disabled={!acceptedRules || !acceptedPrize || closed || alreadyEntered} onClick={onEnter}>{closed ? 'Entries closed' : alreadyEntered ? 'Entry already submitted' : 'Enter competition'}</button></div>
  </>;
}

function EntryForm({ competition, initialName, alreadyEntered, onSubmit }) {
  const [file, setFile] = useState(null);
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);
  async function handleFile(event) {
    setError('');
    const selected = event.target.files?.[0];
    if (!selected) { setFile(null); return; }
    if (!selected.name.toLowerCase().endsWith('.pdf') || (selected.type && selected.type !== 'application/pdf')) { setFile(null); setError('Choose a file with a PDF extension and PDF media type.'); return; }
    if (selected.size > Number(competition.maxMb) * 1048576) { setFile(null); setError(`This file exceeds the ${competition.maxMb} MB limit.`); return; }
    const signature = new TextDecoder().decode(await selected.slice(0, 5).arrayBuffer());
    if (signature !== '%PDF-') { setFile(null); setError('This file does not have a valid PDF signature.'); return; }
    setFile(selected);
  }
  function submit(event) {
    event.preventDefault();
    if (alreadyEntered) return setError('An entry for this competition is already recorded in this browser.');
    if (!file) return setError('Choose a valid PDF within the file size limit.');
    const data = new FormData(event.currentTarget);
    const writer = String(data.get('name') || '').trim();
    const email = String(data.get('email') || '').trim();
    const country = String(data.get('country') || '').trim();
    const age = Number(data.get('age'));
    if (!writer || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) return setError('Enter your name and a valid email address.');
    if (!country) return setError('Enter your country of residence.');
    if (age < 20 || age > 120) return setError('This competition is open to writers aged 20 and older.');
    if (!data.get('declare')) return setError('Accept the declaration to submit your entry.');
    if (!data.get('prize-ack')) return setError('Acknowledge the prize and judging information before submitting.');
    setBusy(true);
    onSubmit({ id: makeId(), competitionId: competition.id, competition: competition.title, writer, email, country, age, filename: file.name, bytes: file.size, reference: `SP-${new Date().getFullYear()}-${Math.random().toString(36).slice(2, 8).toUpperCase()}`, submittedAt: new Date().toISOString(), status: 'Received' });
    setBusy(false);
  }
  return <><p className="eyebrow">A finished work, ready to go</p><h2>Enter {competition.title}</h2><p>Prepare your entry and review the details before submitting. Your PDF is checked in this browser preview and is not uploaded to a server.</p><form onSubmit={submit} noValidate><div className="form-grid"><div className="form-field"><label htmlFor="writer-name">Your name</label><input id="writer-name" name="name" required defaultValue={initialName} autoComplete="name" /></div><div className="form-field"><label htmlFor="writer-email">Email address</label><input id="writer-email" name="email" type="email" required autoComplete="email" /></div><div className="form-field"><label htmlFor="writer-country">Country of residence</label><input id="writer-country" name="country" required autoComplete="country-name" /></div><div className="form-field"><label htmlFor="writer-age">Age</label><input id="writer-age" name="age" type="number" min="20" max="120" required /></div><div className="form-field full"><label htmlFor="entry-file">Completed work · PDF only</label><label className="upload-zone" htmlFor="entry-file"><input id="entry-file" type="file" accept="application/pdf,.pdf" required onChange={handleFile} /><strong>{file?.name || 'Choose a PDF'}</strong><span>{file ? `${(file.size / 1048576).toFixed(2)} MB · select to replace` : `Maximum ${competition.maxMb} MB. You can replace the file before submission.`}</span></label></div><div className="form-field"><label htmlFor="entry-category">Writing category</label><select id="entry-category" defaultValue={competition.category}><option>{competition.category}</option></select></div></div><label className="declaration"><input type="checkbox" name="declare" required /> I confirm this is my original work and I accept the competition rules and terms.</label><label className="declaration"><input type="checkbox" name="prize-ack" required /> I acknowledge the listed prize pool, human judging without AI, and any post-award collaboration terms for this competition.</label><div className="review-box"><strong>Before you submit</strong><p>{competition.title} · deadline {dateLabel(competition.closingDate)} ({competition.timezone || 'UTC'})</p><p>International · ages 20+ · maximum PDF size: {competition.maxMb} MB</p></div>{error && <p className="form-error" role="alert">{error}</p>}<button className="primary-button" type="submit" disabled={busy}>{busy ? 'Submitting…' : 'Submit entry'}</button></form></>;
}

function Confirmation({ entry }) {
  return <><p className="eyebrow">Submission confirmation</p><h2>{entry.competition}</h2><div className="detail-block"><p>Reference · <span className="ref-number">{entry.reference}</span></p><p>Submitted · {new Date(entry.submittedAt).toLocaleString()}</p><p>File · {entry.filename}</p><p>Status · {entry.status}</p><p>This local preview does not store or transmit the PDF.</p></div></>;
}
function Success({ entry, onSubmissions }) {
  return <><div className="success-mark" aria-hidden="true">✓</div><p className="eyebrow">Entry recorded in this browser</p><h2>Thank you, {entry.writer}.</h2><p>Your entry is recorded in the local preview. The PDF itself was not uploaded or stored, and an organiser has not received it.</p><div className="review-box"><p><strong>Competition</strong> · {entry.competition}</p><p><strong>Reference</strong> · <span className="ref-number">{entry.reference}</span></p><p><strong>Submitted</strong> · {new Date(entry.submittedAt).toLocaleString()}</p><p><strong>File</strong> · {entry.filename}</p><p><strong>Status</strong> · Received</p></div><button className="primary-button" onClick={onSubmissions}>View my submissions</button></>;
}

function ProfileForm({ profile, onSave }) {
  function submit(event) { event.preventDefault(); onSave({ name: new FormData(event.currentTarget).get('name').trim() }); }
  return <><p className="eyebrow">Your details</p><h2>Writer profile</h2><p>Used to prefill this browser’s entry forms.</p><form onSubmit={submit}><div className="profile-initial"><span className="avatar">{profile.name?.charAt(0).toUpperCase() || 'W'}</span><input name="name" defaultValue={profile.name} placeholder="Your name" autoComplete="name" aria-label="Your name" /></div><button className="primary-button">Save profile</button></form></>;
}

export default App;
