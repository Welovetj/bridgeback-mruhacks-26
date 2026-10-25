import { useState } from "react";
import { AnimatePresence, motion, useMotionValue, useTransform } from "framer-motion";
import { matches } from "../data/people.js";
import "./jobs.css";
import "./matches.css";

function Matches() {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [swipeDirection, setSwipeDirection] = useState(1);
  const [connectedCount, setConnectedCount] = useState(0);

  function decide(direction) {
    setSwipeDirection(direction);
    if (direction > 0) setConnectedCount((count) => count + 1);
    setCurrentIndex((index) => index + 1);
  }

  function restart() {
    setCurrentIndex(0);
    setConnectedCount(0);
  }

  const currentMatch = matches[currentIndex];

  return (
    <section className="match-explorer" aria-label="Candidate matches">
      <header className="match-explorer__header">
        <div>
          <h2>Find talent</h2>
          <p>Swipe through candidates matched to your open roles.</p>
        </div>
        <span className="match-explorer__count" aria-live="polite">
          {Math.min(currentIndex, matches.length)} of {matches.length} reviewed
        </span>
      </header>

      {currentMatch ? (
        <>
          <div className="match-deck">
            <button
              className="match-deck__arrow match-deck__arrow--previous"
              type="button"
              onClick={() => decide(-1)}
              aria-label="Skip this candidate"
            >
              <span aria-hidden="true">‹</span>
            </button>

            <div className="match-deck__stack">
              {matches.slice(currentIndex + 1, currentIndex + 3).map((match, index) => (
                <div
                  className={`match-profile match-profile--back match-profile--back-${index + 1}`}
                  key={match.job.id}
                  aria-hidden="true"
                />
              ))}
              <AnimatePresence initial={false} custom={swipeDirection}>
                <MatchCard
                  key={currentMatch.job.id}
                  match={currentMatch}
                  direction={swipeDirection}
                  onDecision={decide}
                />
              </AnimatePresence>
            </div>

            <button
              className="match-deck__arrow match-deck__arrow--next"
              type="button"
              onClick={() => decide(1)}
              aria-label="Connect with this candidate"
            >
              <span aria-hidden="true">›</span>
            </button>
          </div>

          <p className="match-deck__hint">
            <span aria-hidden="true">←</span>
            <span>drag to swipe</span>
            <span aria-hidden="true">→</span>
          </p>
          <p className="match-explorer__connected" aria-live="polite">
            {connectedCount > 0
              ? `${connectedCount} ${connectedCount === 1 ? "candidate" : "candidates"} connected`
              : "Connect with a candidate to start a conversation"}
          </p>
        </>
      ) : (
        <div className="match-empty">
          <span className="match-empty__icon" aria-hidden="true">✓</span>
          <h3>You’ve reviewed every match</h3>
          <p>{connectedCount ? `You connected with ${connectedCount} ${connectedCount === 1 ? "candidate" : "candidates"}.` : "No candidates connected this time."}</p>
          <button type="button" className="match-action match-action--connect" onClick={restart}>
            Review matches again
          </button>
        </div>
      )}
    </section>
  );
}

function MatchCard({ match, direction, onDecision }) {
  const { job, candidate, matched, percent } = match;
  const x = useMotionValue(0);
  const rotate = useTransform(x, [-240, 240], [-16, 16]);

  function handleDragEnd(_, info) {
    if (info.offset.x > 100) onDecision(1);
    else if (info.offset.x < -100) onDecision(-1);
  }

  function handleKeyDown(event) {
    if (event.target !== event.currentTarget) return;
    if (event.key === "ArrowRight") onDecision(1);
    if (event.key === "ArrowLeft") onDecision(-1);
  }

  return (
    <motion.article
      className="match-profile"
      style={{ x, rotate }}
      drag="x"
      dragConstraints={{ left: 0, right: 0 }}
      dragElastic={0.8}
      onDragEnd={handleDragEnd}
      onKeyDown={handleKeyDown}
      tabIndex={0}
      role="group"
      aria-label={`${candidate.name}, ${candidate.role}, ${percent}% match for ${job.title}`}
      custom={direction}
      initial={{ opacity: 0, scale: 0.94, y: 18 }}
      animate={{ opacity: 1, scale: 1, y: 0 }}
      exit={{ opacity: 0, x: direction * 600, rotate: direction * 18, transition: { duration: 0.24 } }}
      transition={{ type: "spring", stiffness: 280, damping: 25 }}
    >
      <div className="match-profile__photo">
        <span className="match-profile__photo-fallback" aria-hidden="true">
          {candidate.name
            .split(/\s+/)
            .map((part) => part[0])
            .join("")}
        </span>
        <img
          src={candidate.photo}
          alt={candidate.name}
          draggable="false"
          onError={(event) => {
            event.currentTarget.hidden = true;
          }}
        />
        <div className="match-score" aria-label={`${percent}% match`}>
          <strong>{percent}%</strong>
          <span>match</span>
        </div>
      </div>

      <div className="match-profile__content">
        <div className="match-profile__identity">
          <div>
            <h3>{candidate.name}</h3>
            <p>{candidate.role}</p>
          </div>
          <span className="match-profile__availability">{candidate.status}</span>
        </div>
        <p className="match-profile__description">
          Matched for <strong>{job.title}</strong>. {job.description}
        </p>
        <p className="match-profile__location">
          <span aria-hidden="true">⌖</span> {job.location}
          <span aria-hidden="true">·</span> {job.type}
        </p>
        <ul className="match-profile__skills" aria-label="Candidate skills">
          {candidate.skills.map((skill) => (
            <li className={matched.includes(skill) ? "is-matched" : ""} key={skill}>
              {skill}
            </li>
          ))}
        </ul>
        <div className="match-profile__actions">
          <button
            className="match-action match-action--skip"
            type="button"
            onClick={() => onDecision(-1)}
          >
            Skip
          </button>
          <button
            className="match-action match-action--connect"
            type="button"
            onClick={() => onDecision(1)}
          >
            Connect
          </button>
        </div>
      </div>
    </motion.article>
  );
}

export default Matches;
