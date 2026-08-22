import type { Metadata } from "next";
import Link from "next/link";
import css from "./NotFound.module.css";

export const metadata: Metadata = {
  title: "404 - Page Not Found | NoteHub",
  description: "Sorry, the page you are looking for does not exist.",
  openGraph: {
    title: "404 - Page Not Found | NoteHub",
    description: "Sorry, the page you are looking for does not exist.",
    url: "https://notehub.com/404",
    images: [
      {
        url: "https://ac.goit.global/fullstack/react/notehub-og-meta.jpg",
        width: 1200,
        height: 630,
        alt: "Page Not Found - NoteHub",
      },
    ],
  },
};

export default function NotFound() {
  return (
    <main className={css.main}>
      <div className={css.container}>
        <h1 className={css.title}>404 - Page Not Found</h1>
        <p className={css.description}>
          Sorry, the page you are looking for does not exist or has been moved.
        </p>
        <Link href="/" className={css.link}>
          Return Home
        </Link>
      </div>
    </main>
  );
}
