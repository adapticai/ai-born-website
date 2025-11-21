/**
 * Brand Color Test Component
 *
 * This component demonstrates the AI-Born brand color system.
 * Use this for visual QA and design review purposes.
 *
 * @example
 * import { BrandColorTest } from '@/components/BrandColorTest';
 * <BrandColorTest />
 */

export function BrandColorTest() {
  const colors = [
    {
      name: "Obsidian",
      class: "bg-brand-obsidian",
      hex: "#0a0a0f",
      purpose: "Backgrounds, midnight ink",
    },
    {
      name: "Cyan",
      class: "bg-brand-cyan",
      hex: "#00d9ff",
      purpose: "Machine flowlines, primary accent",
    },
    {
      name: "Ember",
      class: "bg-brand-ember",
      hex: "#ff9f40",
      purpose: "Human halo, secondary accent",
    },
    {
      name: "Porcelain",
      class: "bg-brand-porcelain",
      hex: "#fafafa",
      purpose: "Body copy, high-contrast text",
    },
  ];

  return (
    <div className="container mx-auto p-8">
      <h1 className="text-4xl font-bold mb-8 font-display">
        AI-Born Brand Colors
      </h1>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
        {colors.map((color) => (
          <div
            key={color.name}
            className="rounded-2xl overflow-hidden shadow-xl border border-border"
          >
            <div className={`${color.class} h-32 w-full`} />
            <div className="p-4 bg-card">
              <h3 className="font-semibold text-lg mb-1">{color.name}</h3>
              <p className="text-sm text-muted-foreground font-mono mb-2">
                {color.hex}
              </p>
              <p className="text-sm text-muted-foreground">{color.purpose}</p>
              <p className="text-xs text-muted-foreground mt-2 font-mono">
                {color.class}
              </p>
            </div>
          </div>
        ))}
      </div>

      <div className="space-y-8">
        <section>
          <h2 className="text-2xl font-semibold mb-4 font-display">
            Text Contrast Examples
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* High contrast combinations */}
            <div className="bg-brand-obsidian text-brand-porcelain p-6 rounded-2xl">
              <h3 className="text-xl font-semibold mb-2">
                Porcelain on Obsidian
              </h3>
              <p className="text-sm mb-2">
                This is body text. Contrast ratio: 19.3:1 (AAA)
              </p>
              <p className="text-xs opacity-70">
                Excellent for all text sizes and weights.
              </p>
            </div>

            <div className="bg-brand-porcelain text-brand-obsidian p-6 rounded-2xl border border-border">
              <h3 className="text-xl font-semibold mb-2">
                Obsidian on Porcelain
              </h3>
              <p className="text-sm mb-2">
                This is body text. Contrast ratio: 19.3:1 (AAA)
              </p>
              <p className="text-xs opacity-70">
                Excellent for all text sizes and weights.
              </p>
            </div>

            {/* Accent color examples */}
            <div className="bg-brand-obsidian p-6 rounded-2xl">
              <h3 className="text-xl font-semibold mb-2 text-brand-cyan">
                Cyan on Obsidian
              </h3>
              <p className="text-sm text-brand-porcelain mb-2">
                Accent color for{" "}
                <span className="text-brand-cyan font-semibold">
                  machine core
                </span>{" "}
                elements. Contrast ratio: 10.8:1 (AAA)
              </p>
            </div>

            <div className="bg-brand-obsidian p-6 rounded-2xl">
              <h3 className="text-xl font-semibold mb-2 text-brand-ember">
                Ember on Obsidian
              </h3>
              <p className="text-sm text-brand-porcelain mb-2">
                Accent color for{" "}
                <span className="text-brand-ember font-semibold">
                  human cortex
                </span>{" "}
                elements. Contrast ratio: 8.9:1 (AAA)
              </p>
            </div>
          </div>
        </section>

        <section>
          <h2 className="text-2xl font-semibold mb-4 font-display">
            Interactive Elements
          </h2>
          <div className="flex flex-wrap gap-4">
            <button className="bg-brand-cyan text-brand-obsidian px-6 py-3 rounded-lg font-semibold hover:bg-brand-cyan/90 transition-colors">
              Primary Action
            </button>
            <button className="bg-brand-ember text-brand-obsidian px-6 py-3 rounded-lg font-semibold hover:bg-brand-ember/90 transition-colors">
              Secondary Action
            </button>
            <button className="bg-brand-obsidian text-brand-porcelain border border-brand-cyan px-6 py-3 rounded-lg font-semibold hover:bg-brand-cyan/10 transition-colors">
              Outlined Button
            </button>
          </div>
        </section>

        <section>
          <h2 className="text-2xl font-semibold mb-4 font-display">
            Card Variants
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-brand-obsidian text-brand-porcelain p-6 rounded-2xl border border-brand-cyan/20 shadow-xl">
              <h3 className="text-lg font-semibold mb-2">Dark Card</h3>
              <p className="text-sm opacity-90">
                With subtle cyan border for machine-core aesthetic.
              </p>
            </div>

            <div className="bg-brand-porcelain text-brand-obsidian p-6 rounded-2xl border border-brand-ember/20 shadow-xl">
              <h3 className="text-lg font-semibold mb-2">Light Card</h3>
              <p className="text-sm opacity-90">
                With subtle ember border for human-cortex warmth.
              </p>
            </div>

            <div className="bg-gradient-to-br from-brand-obsidian to-brand-obsidian/80 text-brand-porcelain p-6 rounded-2xl border border-brand-cyan shadow-xl">
              <h3 className="text-lg font-semibold mb-2 text-brand-cyan">
                Featured Card
              </h3>
              <p className="text-sm opacity-90">
                Combining gradient background with brand accents.
              </p>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}
