import { Link } from '../router';
import { ContentLayout } from '../components/ContentLayout';

export function GuidePage() {
  return (
    <ContentLayout pageTitle="Pulse Rush Game Guide & Controls">
      <article className="prose-article">
        <header className="article-header">
          <div className="article-badge">Official Gameplay Guide</div>
          <h1 className="article-title">Pulse Rush: Comprehensive Gameplay Guide</h1>
          <p className="article-lead">
            Master the neon grid. Learn input techniques, energy dynamics, Endless Marathon progression,
            obstacle evasion tactics, and scoring systems in Pulse Rush.
          </p>
          <div className="article-actions">
            <Link to="/" className="btn">Play Endless · Neon City</Link>
            <Link to="/strategy" className="btn ghost">Advanced Strategy Guide</Link>
          </div>
        </header>

        <section className="article-section">
          <h2>1. Input Controls &amp; Movement Kinematics</h2>
          <p>
            Pulse Rush supports both precision keyboard controls on desktop and dedicated touch controls
            on mobile devices in landscape mode. The simulation updates on a fixed 60 Hz accumulator tick,
            guaranteeing identical input responsiveness across all devices and refresh rates.
          </p>

          <div className="table-wrapper">
            <table className="data-table">
              <thead>
                <tr>
                  <th>Action</th>
                  <th>Desktop Keyboard</th>
                  <th>Mobile Touch (Landscape)</th>
                  <th>Mechanical Effect</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td><strong>Steer Left / Right</strong></td>
                  <td><code>A</code> / <code>D</code> or <code>&larr;</code> / <code>&rarr;</code></td>
                  <td>Drag left thumb zone</td>
                  <td>Lateral steering velocity up to 9.5 m/s, with lateral acceleration up to 70 m/s².</td>
                </tr>
                <tr>
                  <td><strong>Jump</strong></td>
                  <td><code>Space</code> or <code>&uarr;</code></td>
                  <td>Tap <strong>Jump</strong> button</td>
                  <td>Initial upward velocity of +10.5 m/s. Includes 0.1s coyote time and 0.12s jump buffering.</td>
                </tr>
                <tr>
                  <td><strong>Slide / Fast-Fall</strong></td>
                  <td><code>Shift</code> or <code>&darr;</code></td>
                  <td>Tap <strong>Slide</strong> button</td>
                  <td>Lowers runner profile to 0.7 m for 0.75s. In mid-air, triggers an immediate fast-fall at -16.0 m/s.</td>
                </tr>
                <tr>
                  <td><strong>Pulse Dash</strong></td>
                  <td><code>E</code></td>
                  <td>Tap <strong>Dash</strong> button</td>
                  <td>Consumes 40 Pulse energy for a 1.8&times; speed surge lasting 0.28s; phases safely through laser hazards.</td>
                </tr>
                <tr>
                  <td><strong>Pause / Resume</strong></td>
                  <td><code>Esc</code></td>
                  <td>Tap <strong>II</strong> button in HUD</td>
                  <td>Halts physics simulation and opens the pause menu without resetting run progress.</td>
                </tr>
              </tbody>
            </table>
          </div>
        </section>

        <section className="article-section">
          <h2>2. How Endless Marathon Mode Works</h2>
          <p>
            Pulse Rush operates in **Endless Marathon Mode**. There is no artificial distance limit or finish line&mdash;gameplay
            continues indefinitely until the runner collides with a solid hazard or falls off the track.
          </p>
          <ul className="feature-list">
            <li>
              <strong>Infinite Procedural Generation:</strong> Track geometry, neon rails, and hazard patterns are streamed
              and buffered continuously ahead of the player using an O(1) rolling ring-buffer architecture.
            </li>
            <li>
              <strong>Dynamic Velocity Curve:</strong> You begin running at a base speed of 16.0 m/s (~58 km/h).
              Speed smoothly scales upward at +0.014 m/s per meter traversed, capping at a maximum velocity of 30.0 m/s (~108 km/h).
            </li>
            <li>
              <strong>Milestone HUD Loop:</strong> The top HUD progress bar tracks 1,000-meter marathon milestone intervals,
              allowing you to track continuous multi-kilometer endurance runs.
            </li>
          </ul>
        </section>

        <section className="article-section">
          <h2>3. Pulse Energy Economics &amp; Phasing Mechanics</h2>
          <p>
            Your Pulse Energy bar (displayed in the top HUD) is your primary tactical survival tool.
            Knowing when to spend and when to save energy separates novice runners from leaderboard contenders.
          </p>
          <ul className="feature-list">
            <li><strong>Maximum Capacity:</strong> 100 Pulse Energy units.</li>
            <li><strong>Energy Cost:</strong> Activating Pulse Dash costs exactly 40 units (indicated by the amber notch on the HUD bar).</li>
            <li><strong>Passive Regeneration:</strong> Energy regenerates naturally at +13 units per second when not actively dashing.</li>
            <li><strong>Obstacle Clear Reward:</strong> Safely navigating past any hazard rewards +8 bonus energy and +50 points.</li>
            <li><strong>Cooldown Enforced:</strong> A 0.7-second cooldown prevents spamming dashes and rewards deliberate timing.</li>
          </ul>

          <div className="callout callout--warning">
            <h3>Laser Phasing vs. Solid Obstacles</h3>
            <p>
              Pulse Dash allows you to phase safely through <strong>Laser Beams</strong>, <strong>Laser Gates</strong>, and <strong>Sweepers</strong>.
              However, Pulse Energy <em>cannot</em> phase through solid concrete blocks or jump over track gaps. Solid obstacles must always be dodged or jumped.
            </p>
          </div>
        </section>

        <section className="article-section">
          <h2>4. Obstacle Avoidance Strategies</h2>
          <div className="grid-cards">
            <div className="info-card">
              <h3>Concrete Blocks (Solid)</h3>
              <p>Standard 1.0 m concrete obstacles. Clear standard center blocks by jumping. Steer laterally around tall side blocks.</p>
            </div>
            <div className="info-card">
              <h3>Low Laser Beams (Energy)</h3>
              <p>Suspended horizontal beams (0.95 m&ndash;2.8 m). Slide underneath them to conserve energy, or Pulse Dash through if caught mid-stride.</p>
            </div>
            <div className="info-card">
              <h3>Laser Gates (Energy)</h3>
              <p>Vertical laser barriers that leave a single narrow passage. Steer smoothly through the open lane or dash straight through the laser field.</p>
            </div>
            <div className="info-card">
              <h3>Sweepers (Moving Energy)</h3>
              <p>Oscillating vertical laser hazards swinging laterally across the track width. Read their oscillation period or dash through at the center.</p>
            </div>
            <div className="info-card">
              <h3>Track Gaps (Fatal Void)</h3>
              <p>Missing track floor sections (8 m&ndash;12 m wide). You must time your jump before reaching the void. Use fast-fall to land quickly upon clearing.</p>
            </div>
            <div className="info-card">
              <h3>Boost Pads (Utility)</h3>
              <p>Floor-mounted energy pads granting a +30% forward speed surge for 1.4 seconds. Ideal for accelerating distance scoring.</p>
            </div>
          </div>
        </section>

        <section className="article-section">
          <h2>5. Scoring Formulas &amp; Progression</h2>
          <p>
            Scores in Pulse Rush reflect pure survival distance combined with active hazard clearance bonuses:
          </p>
          <ul className="feature-list">
            <li><strong>Distance Score:</strong> +10 points for every meter traversed along the neon track.</li>
            <li><strong>Clearance Bonus:</strong> +50 points awarded for every obstacle safely passed without collision.</li>
            <li><strong>Local Record Persistence:</strong> Your personal best distance, total score, and run time are recorded automatically in browser local storage.</li>
          </ul>
        </section>

        <section className="article-section">
          <h2>6. Practical Beginner Tips</h2>
          <ul className="feature-list">
            <li><strong>Stay Centered:</strong> Keep your avatar within the central third of the track. Hugging the left or right rail halves your evasion options.</li>
            <li><strong>Master the Fast-Fall:</strong> After jumping over a concrete block or gap, tap Slide (<code>Shift</code>) mid-air to land immediately at -16 m/s.</li>
            <li><strong>Never Panic Dash:</strong> Do not dash when you can steer or slide. Save your 40 energy for dense hazard intersections where no lane is clear.</li>
            <li><strong>Look Far Ahead:</strong> Fix your eyes near the horizon line to register upcoming obstacle patterns 30 to 40 meters early.</li>
          </ul>
        </section>

        <section className="article-section">
          <h2>7. Frequently Asked Questions (FAQ)</h2>
          <div className="faq-list">
            <div className="faq-item">
              <h3>How does Endless Marathon differ from finite levels?</h3>
              <p>
                In Endless Marathon Mode, obstacles, rails, and floor tiles generate procedurally as you run. The run continues
                until you collide with an obstacle or fall into a gap, enabling true infinite endurance runs.
              </p>
            </div>

            <div className="faq-item">
              <h3>Why can't I pulse dash through concrete blocks or over gaps?</h3>
              <p>
                Pulse Dash utilizes electromagnetic phasing that disrupts laser energy fields (beams, gates, sweepers).
                Physical concrete blocks and missing track floor are solid geometry that cannot be phased; they must be dodged or jumped.
              </p>
            </div>

            <div className="faq-item">
              <h3>How does Fast-Fall work?</h3>
              <p>
                Pressing <code>Shift</code> (or tapping <strong>Slide</strong> on mobile) while in mid-air immediately accelerates your downward
                velocity to -16 m/s. This allows you to land quickly and immediately prepare for the next obstacle without floating in the air.
              </p>
            </div>

            <div className="faq-item">
              <h3>Are my high scores and settings saved online or locally?</h3>
              <p>
                All records (best distance, highest score, best time, and selected graphics quality) are saved locally on your device via
                browser <code>localStorage</code>. No personal accounts or external servers are required, keeping your data private.
              </p>
            </div>

            <div className="faq-item">
              <h3>What should I do if the game stutters or drops frames?</h3>
              <p>
                Open the game menu and switch the **Graphics** setting from High to **Medium** or **Low**. Low mode disables point lights
                and reduces pixel-ratio scaling, delivering smooth 60 FPS performance on mobile devices and older laptops.
              </p>
            </div>

            <div className="faq-item">
              <h3>Can I play on mobile devices?</h3>
              <p>
                Yes. Pulse Rush is fully optimized for touch devices. For the best experience, rotate your phone into landscape mode:
                drag your left thumb to steer, and tap Jump, Slide, and Dash on the right.
              </p>
            </div>

            <div className="faq-item">
              <h3>What causes a run to end?</h3>
              <p>
                Runs end strictly when you collide with a solid obstacle, make contact with a laser hazard without active Pulse Dash phasing,
                or steer off the edge of the track into a gap.
              </p>
            </div>
          </div>
        </section>

        <footer className="article-footer">
          <Link to="/" className="btn big">Launch Pulse Rush</Link>
          <Link to="/strategy" className="btn ghost">Read Advanced Strategy</Link>
        </footer>
      </article>
    </ContentLayout>
  );
}
