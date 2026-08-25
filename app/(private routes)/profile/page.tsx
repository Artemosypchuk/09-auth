import css from "./ProfilePage.module.css";

import { redirect } from "next/navigation";
import axios from "axios";

import Link from "next/link";
import Image from "next/image";

import { getMe } from "@/lib/api/serverApi";

export default async function Profile() {
  let user;
  try {
    user = await getMe();
  } catch (error: unknown) {
    if (axios.isAxiosError(error) && error.response?.status === 401) {
      redirect("/sign-in");
    }

    throw error;
  }
  const avatarSrc = user?.avatar || "https://ac.goit.global/ph/placeholder.png";
  return (
    <main className={css.mainContent}>
      <div className={css.profileCard}>
        <div className={css.header}>
          <h1 className={css.formTitle}>Profile Page</h1>
          <Link href="/profile/edit" className={css.editProfileButton}>
            Edit Profile
          </Link>
        </div>
        <div className={css.avatarWrapper}>
          <Image
            src={avatarSrc}
            alt="User Avatar"
            width={120}
            height={120}
            className={css.avatar}
          />
        </div>
        <div className={css.profileInfo}>
          <p>Username: {user?.username}</p>
          <p>Email: {user?.email}</p>
        </div>
      </div>
    </main>
  );
}
