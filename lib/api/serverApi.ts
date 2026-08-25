import { cookies } from "next/headers";

import type { AxiosResponse } from "axios";

import api from "@/app/api/api";
import { Note } from "@/types/note";
import { User } from "@/types/user";

interface FetchNotesParams {
  search?: string;
  page?: number;
  tag?: string;
}

interface FetchNotesResponse {
  notes: Note[];
  totalPages: number;
}
async function getAuthHeader() {
  const cookieStore = await cookies();
  return {
    Cookie: cookieStore.toString(),
  };
}

export async function fetchNotes(
  params?: FetchNotesParams,
): Promise<FetchNotesResponse | undefined> {
  try {
    const headers = await getAuthHeader();
    const { data } = await api.get<FetchNotesResponse>("/notes", {
      params,
      headers,
    });
    console.log(data);
    return data;
  } catch (error) {
    console.error("Error fetching notes:", error);
    throw error;
  }
}

export async function fetchNoteById(id: string): Promise<Note | undefined> {
  try {
    const headers = await getAuthHeader();
    const { data } = await api.get<Note>(`/notes/${id}`, {
      headers,
    });
    return data;
  } catch (error) {
    console.error(`Error in fetchNoteById (${id}):`, error);
    throw error;
  }
}

export async function getMe(): Promise<User | undefined> {
  try {
    const headers = await getAuthHeader();
    const { data } = await api.get<User>("/users/me", {
      headers,
    });
    return data;
  } catch (error) {
    console.error("Error in getMe:", error);
    throw error;
  }
}

export async function checkSession(): Promise<AxiosResponse<User>> {
  try {
    const headers = await getAuthHeader();
    const response = await api.get<User>("/auth/session", {
      headers,
    });
    return response;
  } catch (error) {
    console.error("Error in checkSession:", error);
    throw error;
  }
}
