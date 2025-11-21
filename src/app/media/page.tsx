/**
 * Media & Press Kit Page
 * Dedicated page for media resources and press kit downloads
 */

import { PressKitDownloadButton } from '@/components/PressKitDownloadButton';
import { pageMetadata } from '@/lib/metadata';
import { getCurrentUser } from '@/lib/auth';

export const metadata = pageMetadata.media;

export default async function MediaPage() {
  // Get current user for tracking
  const user = await getCurrentUser();

  return (
    <div className="container mx-auto px-4 py-16">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="mb-12">
          <h1 className="text-4xl font-bold mb-4">Media & Press Kit</h1>
          <p className="text-lg text-muted-foreground">
            Resources for journalists, media outlets, and press enquiries about AI-Born
          </p>
        </div>

        {/* Press Kit Download Section */}
        <section className="mb-16 p-8 border rounded-2xl bg-card">
          <h2 className="text-2xl font-semibold mb-4">Download Press Kit</h2>
          <p className="text-muted-foreground mb-6">
            Complete press kit including book synopsis, press release, chapter list, selected
            excerpts, interview topics, high-resolution cover art, and logos.
          </p>

          <div className="space-y-4">
            <PressKitDownloadButton
              size="lg"
              className="w-full sm:w-auto"
              userEmail={user?.email}
              userName={user?.name}
            />

            <div className="text-sm text-muted-foreground">
              <p className="font-medium mb-2">Press kit includes:</p>
              <ul className="list-disc list-inside space-y-1">
                <li>One-page book synopsis</li>
                <li>Official press release</li>
                <li>Complete chapter list</li>
                <li>Selected book excerpts</li>
                <li>Suggested interview topics</li>
                <li>High-resolution cover art (multiple formats)</li>
                <li>Author headshots (when available)</li>
                <li>Logos (SVG format)</li>
              </ul>
            </div>
          </div>
        </section>

        {/* Book Information */}
        <section className="mb-16">
          <h2 className="text-2xl font-semibold mb-6">Book Information</h2>

          <div className="grid md:grid-cols-2 gap-6">
            <div className="space-y-4">
              <div>
                <h3 className="font-semibold text-sm text-muted-foreground uppercase mb-1">
                  Title
                </h3>
                <p className="text-lg">
                  AI-Born: The Machine Core, the Human Cortex, and the Next Economy of Being
                </p>
              </div>

              <div>
                <h3 className="font-semibold text-sm text-muted-foreground uppercase mb-1">
                  Author
                </h3>
                <p className="text-lg">Mehran Granfar</p>
              </div>

              <div>
                <h3 className="font-semibold text-sm text-muted-foreground uppercase mb-1">
                  Publisher
                </h3>
                <p className="text-lg">Mic Press, LLC</p>
              </div>
            </div>

            <div className="space-y-4">
              <div>
                <h3 className="font-semibold text-sm text-muted-foreground uppercase mb-1">
                  Formats
                </h3>
                <p className="text-lg">Hardcover, eBook, Audiobook</p>
              </div>

              <div>
                <h3 className="font-semibold text-sm text-muted-foreground uppercase mb-1">
                  Website
                </h3>
                <p className="text-lg">
                  <a
                    href="https://ai-born.org"
                    className="text-brand-cyan hover:underline"
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    ai-born.org
                  </a>
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* About the Author */}
        <section className="mb-16">
          <h2 className="text-2xl font-semibold mb-4">About the Author</h2>
          <div className="prose prose-lg max-w-none">
            <p className="text-muted-foreground">
              Mehran Granfar is Founder & CEO of Adaptic.ai, an AI-born institutional platform
              fusing autonomous intelligence with modern finance. A systems architect and
              strategic futurist, he works where AI, governance, and economic design
              meet—helping organisations evolve from AI-enabled to AI-native.
            </p>
          </div>
        </section>

        {/* Media Enquiries */}
        <section className="mb-16 p-8 border rounded-2xl bg-muted/50">
          <h2 className="text-2xl font-semibold mb-4">Media Enquiries</h2>

          <div className="space-y-4">
            <div>
              <h3 className="font-semibold mb-2">Interview Requests</h3>
              <p className="text-muted-foreground mb-2">
                Mehran Granfar is available for podcast, radio, TV, and print interviews.
              </p>
              <p className="text-sm text-muted-foreground">
                Lead time: Typically 48-72 hours
              </p>
            </div>

            <div>
              <h3 className="font-semibold mb-2">Review Copies</h3>
              <p className="text-muted-foreground">
                Advanced review copies available for established media outlets and reviewers.
              </p>
            </div>

            <div>
              <h3 className="font-semibold mb-2">Speaking Opportunities</h3>
              <p className="text-muted-foreground">
                Available for conferences, corporate events, and academic lectures on AI
                transformation, organisational design, and the future of work.
              </p>
            </div>

            <div className="pt-4 border-t">
              <p className="font-semibold mb-2">Contact</p>
              <a
                href="mailto:press@ai-born.org"
                className="text-brand-cyan hover:underline text-lg"
              >
                press@ai-born.org
              </a>
            </div>
          </div>
        </section>

        {/* Quick Facts */}
        <section>
          <h2 className="text-2xl font-semibold mb-6">Quick Facts</h2>

          <div className="grid md:grid-cols-2 gap-6">
            <div className="space-y-3">
              <div>
                <h3 className="font-semibold text-sm mb-1">Core Thesis</h3>
                <p className="text-sm text-muted-foreground">
                  When three people can orchestrate what once required 30,000, the enterprise—and
                  human purpose—must be redesigned from first principles.
                </p>
              </div>

              <div>
                <h3 className="font-semibold text-sm mb-1">Primary Audience</h3>
                <p className="text-sm text-muted-foreground">
                  C-suite executives, enterprise architects, strategic consultants, investors,
                  and policy makers navigating AI transformation.
                </p>
              </div>
            </div>

            <div className="space-y-3">
              <div>
                <h3 className="font-semibold text-sm mb-1">Key Frameworks</h3>
                <p className="text-sm text-muted-foreground">
                  The Five Planes, Defensibility Stack, New Triumvirate, Iteration Half-Life,
                  Cognitive Overhead Index
                </p>
              </div>

              <div>
                <h3 className="font-semibold text-sm mb-1">Tone</h3>
                <p className="text-sm text-muted-foreground">
                  Institutional, pragmatic, and ultimately hopeful—architecture over spectacle
                </p>
              </div>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}
