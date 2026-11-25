import { Link } from '../router';
import { ContentLayout } from '../components/ContentLayout';

export function StrategyPage() {
  return (
    <ContentLayout pageTitle="Endless Runner Strategy Guide: Timing, Reflexes & Mechanics">
      <article className="prose-article">
        <header className="article-header">
          <div className="article-badge">Advanced Strategy Guide</div>
          <h1 className="article-title">How to Master Endless Runner Games: Timing, Reflexes &amp; Mechanics</h1>
          <p className="article-lead">
            Moving beyond button mashing: a deep analytical breakdown of kinetic anticipation,
            airborne vulnerability, resource discipline, and high-velocity track positioning in Pulse Rush.
          </p>
          <div className="article-actions">
            <Link to="/" className="btn">Play Endless · Neon City</Link>
            <Link to="/guide" className="btn ghost">Basic Game Guide</Link>
          </div>
        </header>

        <section className="article-section">
          <h2>1. Anticipation Over Reaction: The Focal Point Rule</h2>
          <p>
            The single most common mistake in high-speed 3D runners is tracking the avatar directly with your eyes.
            In Pulse Rush, the runner starts at 16 m/s (~58 km/h) and accelerates up to a blistering 30 m/s (~108 km/h).
            At top velocity, you cover 30 meters of track every second.
          </p>
          <p>
            Human visual reaction time averages between 200 and 250 milliseconds. At 30 m/s, you travel approximately
            7.5 meters before your brain can even initiate a muscular response. If you stare at your character's feet,
            an oncoming laser wall or concrete block will strike you before your input registers.
          </p>
          <div className="callout callout--tip">
            <h3>Pro Strategy: The 40-Meter Horizon Scan</h3>
            <p>
              Fix your gaze approximately two-thirds up the screen, just above the horizon line. Treat the track as
              a sequence of upcoming hazard clusters rather than individual obstacles. Scan for:
            </p>
            <ul className="feature-list">
              <li><strong>Passage Openings:</strong> Locate the unblocked lane through laser gates early.</li>
              <li><strong>Track Gaps:</strong> Identify missing floor segments at least 30 meters in advance.</li>
              <li><strong>Sweeper Trajectories:</strong> Observe oscillating beams to predict whether they will swing left or right as you arrive.</li>
            </ul>
          </div>
        </section>

        <section className="article-section">
          <h2>2. Airborne Physics &amp; The Fast-Fall Technique</h2>
          <p>
            In any runner with realistic physics, entering the air is a commitment. Once airborne, your lateral steering
            control remains active, but vertical trajectory is governed strictly by gravity (-28 m/s²).
          </p>
          <p>
            A full jump takes you to an apex of approximately 1.9 meters, with an initial upward velocity of 10.5 m/s. While jumping is
            essential for clearing standard 1.0-meter concrete blocks and track gaps, excessive jumping creates severe vulnerability:
            if a low laser beam appears immediately behind a block while you are descending, you cannot duck beneath it.
          </p>
          <div className="table-wrapper">
            <table className="data-table">
              <thead>
                <tr>
                  <th>Phase</th>
                  <th>Vertical Velocity</th>
                  <th>Strategic Consideration</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td><strong>Ground Run</strong></td>
                  <td>0 m/s</td>
                  <td>Maximum agility: full slide and jump options available instantaneously.</td>
                </tr>
                <tr>
                  <td><strong>Standard Jump</strong></td>
                  <td>+10.5 m/s &rarr; 0 m/s</td>
                  <td>High commitment: cannot slide or duck while rising through the air.</td>
                </tr>
                <tr>
                  <td><strong>Fast-Fall Slide</strong></td>
                  <td>-16.0 m/s</td>
                  <td>Immediate downward cancellation: forces the runner back onto the track to resume ground options.</td>
                </tr>
              </tbody>
            </table>
          </div>
          <p>
            <strong>The Fast-Fall Technique:</strong> As soon as your runner has cleared the physical crest of an obstacle or gap,
            immediately press <code>Shift</code> (or tap <strong>Slide</strong> on touch). This overrides gravity and drives the
            runner down at -16 m/s, resetting your grounded state and giving you full evasion capabilities for the next obstacle.
          </p>
        </section>

        <section className="article-section">
          <h2>3. Energy Economics: Strategic Pulse Allocation</h2>
          <p>
            Pulse Energy is not an emergency panic button&mdash;it is a renewable tactical resource. Understanding the difference
            between permeable laser energy and solid concrete geometry is fundamental to surviving past 1,000 meters.
          </p>
          <ul className="feature-list">
            <li>
              <strong>Permeable Hazards (Dash Safe):</strong> Low Laser Beams, Laser Gates, and Moving Sweepers. Dashing
              phases your molecular hitbox, allowing you to pass through with zero damage.
            </li>
            <li>
              <strong>Solid Hazards (Dash Fatal):</strong> Concrete Blocks, Tall Side Walls, and Missing Track Gaps. Dashing into
              a solid concrete block or over a gap without jumping results in immediate crash or fall.
            </li>
          </ul>
          <p>
            Each Pulse Dash costs exactly <strong>40 energy units</strong> and enforces a <strong>0.7-second cooldown</strong>.
            Energy regenerates at +13 units per second and awards a +8 energy bonus for every safely cleared hazard.
            If you waste a dash on a single laser gate that could easily be steered through, you may lack the 40 energy
            required when trapped in an unavoidable dense laser matrix moments later.
          </p>
        </section>

        <section className="article-section">
          <h2>4. Track Geometry &amp; The "Center Bias" Principle</h2>
          <p>
            The Pulse Rush track has a total width of 6.4 meters (-3.2 m to +3.2 m). Moving laterally beyond &plusmn;3.2 meters
            causes the runner to drop off the track into the cyberpunk abyss.
          </p>
          <p>
            Adopting a <strong>Center Bias</strong> is the golden rule of positioning:
          </p>
          <ul className="feature-list">
            <li>
              <strong>Shortest Travel Distance:</strong> From the center (x = 0), reaching either the far-left or far-right lane
              requires only 2.5 meters of traversal. If you hug the left rail and need to dodge an obstacle on the right, you must
              traverse 5.0 meters&mdash;doubling your transit time.
            </li>
            <li>
              <strong>Evasion Redundancy:</strong> Hugging either rail cuts your escape options in half. In the center, you have
              equal escape vectors left and right.
            </li>
            <li>
              <strong>Return to Center:</strong> After dodging a hazard on the perimeter, immediately apply gentle counter-steering
              to restore your position to the central third of the track.
            </li>
          </ul>
        </section>

        <section className="article-section">
          <h2>5. Velocity Scaling: Surviving at 30 m/s</h2>
          <p>
            The game's dynamic difficulty curve scales velocity from 16 m/s at 0 meters up to 30 m/s past 1,000 meters.
            As speed increases:
          </p>
          <ul className="feature-list">
            <li><strong>Forward Momentum Overrides Delay:</strong> Obstacle warning time shrinks from ~2.5 seconds down to ~1.2 seconds.</li>
            <li><strong>Jump Horizontal Distance Increases:</strong> Because forward speed is higher, a standard jump carries you significantly further down the track.</li>
            <li><strong>Score Accumulation Accelerates:</strong> Distance points award +10 points per meter, meaning you accumulate score nearly twice as fast at top speed.</li>
          </ul>
        </section>

        <section className="article-section">
          <h2>Summary: The Veteran Runner Checklist</h2>
          <div className="grid-cards">
            <div className="info-card">
              <h3>1. Look Ahead</h3>
              <p>Keep your gaze on the horizon line to read obstacle combinations 30&ndash;40 meters early.</p>
            </div>
            <div className="info-card">
              <h3>2. Fast-Fall Early</h3>
              <p>Cancel unnecessary airtime with Slide (<code>Shift</code>) immediately after clearing jump obstacles.</p>
            </div>
            <div className="info-card">
              <h3>3. Save Dash for Lasers</h3>
              <p>Never dash into solid concrete blocks. Save your 40 energy for dense laser gates and sweepers.</p>
            </div>
            <div className="info-card">
              <h3>4. Re-Center Constantly</h3>
              <p>Avoid riding the outer rails. Always return to the track center to preserve 360-degree evasion vectors.</p>
            </div>
          </div>
        </section>

        <footer className="article-footer">
          <Link to="/" className="btn big">Test Strategy in Endless Mode</Link>
          <Link to="/guide" className="btn ghost">Read Full Controls &amp; Guide</Link>
        </footer>
      </article>
    </ContentLayout>
  );
}
