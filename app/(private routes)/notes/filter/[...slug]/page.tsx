import type { Metadata } from "next";
import {
  QueryClient,
  HydrationBoundary,
  dehydrate,
} from "@tanstack/react-query";
import { fetchNotes } from "@/lib/api/clientApi";
import NotesClient from "./Notes.client";

interface NotesFilterPageProps {
  params: Promise<{ slug?: string[] }>;
}

export async function generateMetadata({
  params,
}: NotesFilterPageProps): Promise<Metadata> {
  const { slug } = await params;
  const rawTag = slug?.[0];

  const isAll = !rawTag || rawTag.toLowerCase() === "all";
  const formattedTag =
    isAll ? "All Notes" : `${rawTag.charAt(0).toUpperCase()}${rawTag.slice(1)}`;

  const title = `${formattedTag} | NoteHub`;
  const description =
    isAll ?
      "Browse all your personal notes in NoteHub."
    : `Browse your personal notes filtered by "${formattedTag}" tag in NoteHub.`;

  const filterPath = isAll ? "all" : encodeURIComponent(rawTag);

  return {
    title,
    description,
    openGraph: {
      title,
      description,
      url: `https://notehub.com/notes/filter/${filterPath}`,
      images: [
        {
          url: "https://ac.goit.global/fullstack/react/notehub-og-meta.jpg",
          width: 1200,
          height: 630,
          alt: `NoteHub - ${formattedTag}`,
        },
      ],
    },
  };
}


export default async function NotesFilterPage({
  params,
}: NotesFilterPageProps) {
  const { slug } = await params;
  const rawTag = slug?.[0];
  const tag = !rawTag || rawTag.toLowerCase() === "all" ? undefined : rawTag;

  const queryClient = new QueryClient();

  await queryClient.prefetchQuery({
    queryKey: ["notes", "", 1, tag],
    queryFn: () => fetchNotes("", 1, 12, tag),
  });

  return (
    <HydrationBoundary state={dehydrate(queryClient)}>
      <NotesClient tag={tag} />
    </HydrationBoundary>
  );
}
