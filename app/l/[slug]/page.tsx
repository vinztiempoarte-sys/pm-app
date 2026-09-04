import { notFound } from "next/navigation";
import { getYoutubeEmbedUrl } from "@/lib/youtube";
import { LeadForm } from "@/components/mini-landing/LeadForm";
import { LandingChat } from "@/components/chat/LandingChat";

type LandingData = {
  full_name: string | null;
  bio: string | null;
  brand_color: string | null;
  brand_logo_url: string | null;
  video_url: string | null;
  links: { id: string; label: string; url: string }[];
};

async function getLandingData(slug: string): Promise<LandingData | null> {
  const res = await fetch(
    `${process.env.NEXT_PUBLIC_SUPABASE_URL}/functions/v1/landing-publica?slug=${encodeURIComponent(slug)}`,
    { cache: "no-store" }
  );
  if (!res.ok) return null;
  return res.json();
}

export default async function MiniLandingPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const data = await getLandingData(slug);

  if (!data) {
    notFound();
  }

  const accent = data.brand_color || "oklch(0.537 0.19 18.6)";
  const embedUrl = data.video_url ? getYoutubeEmbedUrl(data.video_url) : null;

  return (
    <div className="mx-auto flex min-h-full w-full max-w-sm flex-col items-center gap-6 px-4 py-12">
      {data.brand_logo_url ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={data.brand_logo_url}
          alt={data.full_name ?? ""}
          className="h-20 w-20 rounded-full object-cover"
        />
      ) : (
        <div
          className="flex h-20 w-20 items-center justify-center rounded-full text-2xl font-bold text-white"
          style={{ backgroundColor: accent }}
        >
          {(data.full_name ?? "?").charAt(0).toUpperCase()}
        </div>
      )}

      <div className="space-y-1 text-center">
        <h1 className="text-lg font-semibold">{data.full_name}</h1>
        {data.bio && (
          <p className="text-sm text-muted-foreground">{data.bio}</p>
        )}
      </div>

      {embedUrl && (
        <div className="aspect-video w-full overflow-hidden rounded-2xl">
          <iframe
            src={embedUrl}
            title="Vídeo de presentación"
            className="h-full w-full"
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
            allowFullScreen
          />
        </div>
      )}

      <div className="flex w-full flex-col gap-3">
        {data.links.map((link) => (
          <a
            key={link.id}
            href={`/l/${slug}/go/${link.id}?url=${encodeURIComponent(link.url)}`}
            className="rounded-2xl border px-4 py-3 text-center text-sm font-medium shadow-sm transition-colors hover:bg-muted/50"
            style={{ borderColor: accent }}
          >
            {link.label}
          </a>
        ))}
        {data.links.length === 0 && (
          <p className="text-center text-sm text-muted-foreground">
            Todavía no hay enlaces.
          </p>
        )}
      </div>

      <LandingChat slug={slug} accent={accent} />

      <LeadForm slug={slug} accent={accent} />
    </div>
  );
}
