import type { Note, NewNote } from "@/types/note";
import type { User } from "@/types/user";
import { API } from "./api";

export interface NotesResponse {
  notes: Note[];
  totalPages: number;
}
type RegisterData = {
  email: string;
  password: string;
};
type LoginData = {
  email: string;
  password: string;
};
type UpdateProfileData = {
  email: string;
  username: string;
};

export async function fetchNotes(
  search: string = "",
  page: number = 1,
  perPage: number = 12,
  tag?: string,
): Promise<NotesResponse> {
  const response = await API.get<NotesResponse>("/notes", {
    params: {
      ...(search.trim() ? { search } : {}),
      page,
      perPage,
      ...(tag && tag !== "all" ? { tag } : {}),
    },
  });

  return response.data;
}

export async function fetchNoteById(id: string): Promise<Note> {
  const response = await API.get<Note>(`/notes/${id}`);
  return response.data;
}

export async function createNote(newNoteData: NewNote): Promise<Note> {
  const response = await API.post<Note>("/notes", newNoteData);
  return response.data;
}

export async function deleteNote(id: string): Promise<Note> {
  const response = await API.delete<Note>(`/notes/${id}`);
  return response.data;
}

export async function register(registerData: RegisterData): Promise<User> {
  const response = await API.post<User>("/auth/register", registerData);
  return response.data;
}
export async function login(loginData: LoginData): Promise<User> {
  const response = await API.post<User>("/auth/login", loginData);
  return response.data;
}

export async function logout(): Promise<void> {
  await API.post("/auth/logout");
}

export async function updateProfile(data: UpdateProfileData): Promise<User> {
  const response = await API.patch<User>("/users/me", data);
  return response.data;
}

export async function checkSession(): Promise<User | { isLogged: boolean }> {
  const response = await API.get("/auth/session");
  return response.data;
}

export async function getMe(): Promise<User> {
  const response = await API.get<User>("/users/me");
  return response.data;
}
