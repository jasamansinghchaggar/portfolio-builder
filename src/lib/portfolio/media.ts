import type { Portfolio } from "@/lib/portfolio/schema";

export async function refreshPortfolioImageUrls(
  portfolio: Portfolio,
  signImage: (path: string) => Promise<string | null>,
): Promise<Portfolio> {
  const sections = await Promise.all(
    portfolio.sections.map(async (section) => {
      const imagePath = section.content.imagePath;
      if (typeof imagePath !== "string" || !imagePath) return section;

      const imageUrl = await signImage(imagePath).catch(() => null);
      return {
        ...section,
        content: {
          ...section.content,
          imageUrl: imageUrl ?? "",
        },
      };
    }),
  );

  return { ...portfolio, sections };
}
