"use client";

import { useState } from "react";
import Link from "next/link";
import { useQuery, keepPreviousData } from "@tanstack/react-query";
import { useDebouncedCallback } from "use-debounce";

import NoteList from "@/components/NoteList/NoteList";
import SearchBox from "@/components/SearchBox/SearchBox";
import Pagination from "@/components/Pagination/Pagination";

import { fetchNotes, type NotesResponse } from "@/lib/api";
import css from "./Notes.module.css";

interface NotesClientProps {
  tag?: string;
}

export default function NotesClient({ tag }: NotesClientProps) {
  const [inputValue, setInputValue] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [page, setPage] = useState(1);

  const debouncedSetSearch = useDebouncedCallback((value: string) => {
    setSearchQuery(value);
    setPage(1);
  }, 500);

  const handleSearchChange = (value: string) => {
    setInputValue(value);
    debouncedSetSearch(value);
  };

  const { data, isLoading, isError, error } = useQuery<NotesResponse>({
    queryKey: ["notes", searchQuery, page, tag],
    queryFn: () => fetchNotes(searchQuery, page, 12, tag),
    placeholderData: keepPreviousData,
  });

  const notes = data?.notes ?? [];
  const totalPages = data?.totalPages ?? 0;

  return (
    <div className={css.app}>
      <header className={css.toolbar}>
        <Link href="/notes/action/create" className={css.button}>
          Create note +
        </Link>
        <SearchBox value={inputValue} onChange={handleSearchChange} />
      </header>

      {isLoading ?
        <p>Loading, please wait...</p>
      : isError ?
        <p>Something went wrong. {error.message}</p>
      : <>
          <NoteList items={notes} />
          {totalPages > 1 && (
            <Pagination
              pageCount={totalPages}
              forcePage={page - 1}
              onPageChange={(selected) => setPage(selected + 1)}
            />
          )}
        </>
      }
    </div>
  );
}
