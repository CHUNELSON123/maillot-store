"use client";

import { FormEvent, useEffect, useState } from "react";
import { useCustomer } from "../hooks/use-customer";
import { useAuth } from "@/modules/auth/hooks/use-auth";
import { authService } from "@/modules/auth/services/auth.service";

const inputClass = "mt-1 h-9 w-full border border-neutral-200 bg-white px-3 text-xs outline-none focus:border-[#d28a00]";

export function ProfileForm() {
  const { customer, isLoading, error, getProfile, updateProfile } = useCustomer();
  const { user } = useAuth();
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [phone, setPhone] = useState("");
  const [profileSuccess, setProfileSuccess] = useState("");
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [passwordBusy, setPasswordBusy] = useState(false);
  const [passwordError, setPasswordError] = useState("");
  const [passwordSuccess, setPasswordSuccess] = useState("");

  useEffect(() => { void getProfile(); }, [getProfile]);
  useEffect(() => {
    if (!customer) return;
    setFirstName(customer.firstName);
    setLastName(customer.lastName);
    setPhone(customer.phone ?? "");
  }, [customer]);

  const saveProfile = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault(); setProfileSuccess("");
    try {
      await updateProfile({ firstName, lastName, phone: phone || undefined });
      setProfileSuccess("Personal information updated.");
    } catch { /* The customer hook exposes its request error. */ }
  };

  const changePassword = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault(); setPasswordError(""); setPasswordSuccess("");
    if (newPassword !== confirmPassword) { setPasswordError("The new passwords do not match."); return; }
    setPasswordBusy(true);
    try {
      await authService.changePassword({ currentPassword, newPassword });
      setCurrentPassword(""); setNewPassword(""); setConfirmPassword("");
      setPasswordSuccess("Your password has been changed.");
    } catch (cause) { setPasswordError(cause instanceof Error ? cause.message : "Could not update your password."); }
    finally { setPasswordBusy(false); }
  };

  return <div className="space-y-5">
    <form onSubmit={saveProfile} className="border border-neutral-200 bg-white">
      <header className="border-b border-neutral-100 px-4 py-3"><h2 className="text-sm font-bold">Personal Information</h2><p className="mt-1 text-[10px] text-neutral-500">Manage your personal information.</p></header>
      <div className="grid gap-x-4 gap-y-3 p-4 sm:grid-cols-2">
        <label className="text-[10px] font-semibold text-neutral-700">First Name<input required minLength={2} maxLength={100} value={firstName} onChange={(event) => setFirstName(event.target.value)} className={inputClass}/></label>
        <label className="text-[10px] font-semibold text-neutral-700">Last Name<input required minLength={2} maxLength={100} value={lastName} onChange={(event) => setLastName(event.target.value)} className={inputClass}/></label>
        <label className="text-[10px] font-semibold text-neutral-700">Email Address<input type="email" value={user?.email ?? ""} readOnly className={`${inputClass} bg-neutral-50 text-neutral-500`}/></label>
        <label className="text-[10px] font-semibold text-neutral-700">Phone Number<input type="tel" value={phone} onChange={(event) => setPhone(event.target.value)} maxLength={30} className={inputClass}/></label>
      </div>
      <footer className="flex flex-wrap items-center justify-between gap-2 border-t border-neutral-100 px-4 py-3">{(profileSuccess || (error && !isLoading)) && <p role="status" className={`text-[10px] ${profileSuccess ? "text-green-700" : "text-red-700"}`}>{profileSuccess || error}</p>}<button type="submit" disabled={isLoading} className="h-8 bg-[#d28a00] px-4 text-[10px] font-bold text-white hover:bg-[#b87700] disabled:opacity-60">{isLoading ? "SAVING…" : "SAVE CHANGES"}</button></footer>
    </form>

    <form onSubmit={changePassword} className="border border-neutral-200 bg-white">
      <header className="border-b border-neutral-100 px-4 py-3"><h2 className="text-sm font-bold">Change Password</h2><p className="mt-1 text-[10px] text-neutral-500">Use a unique password with at least 8 characters.</p></header>
      <div className="grid gap-x-4 gap-y-3 p-4 sm:grid-cols-2">
        <label className="text-[10px] font-semibold text-neutral-700 sm:col-span-2">Current Password<input required type="password" autoComplete="current-password" value={currentPassword} onChange={(event) => setCurrentPassword(event.target.value)} className={inputClass}/></label>
        <label className="text-[10px] font-semibold text-neutral-700">New Password<input required minLength={8} type="password" autoComplete="new-password" value={newPassword} onChange={(event) => setNewPassword(event.target.value)} className={inputClass}/></label>
        <label className="text-[10px] font-semibold text-neutral-700">Confirm New Password<input required minLength={8} type="password" autoComplete="new-password" value={confirmPassword} onChange={(event) => setConfirmPassword(event.target.value)} className={inputClass}/></label>
      </div>
      <footer className="flex flex-wrap items-center justify-between gap-2 border-t border-neutral-100 px-4 py-3">{(passwordError || passwordSuccess) && <p role="status" className={`text-[10px] ${passwordSuccess ? "text-green-700" : "text-red-700"}`}>{passwordSuccess || passwordError}</p>}<button type="submit" disabled={passwordBusy} className="h-8 bg-[#d28a00] px-4 text-[10px] font-bold text-white hover:bg-[#b87700] disabled:opacity-60">{passwordBusy ? "UPDATING…" : "UPDATE PASSWORD"}</button></footer>
    </form>
  </div>;
}
