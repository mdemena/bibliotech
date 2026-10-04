"use client";

import { useState, useTransition } from "react";
import { Save, AlertTriangle, User, Globe } from "lucide-react";
import { useTranslations, useLocale } from "next-intl";
import { useRouter } from "@/i18n/routing";
import { updateProfile } from "@/lib/actions/profile";
import { languages } from "@/lib/languages";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

interface ProfileData {
  displayName: string;
  firstName: string;
  lastName: string;
  birthDate: string;
  locale: string;
}

function langName(code: string): string {
  return (languages.find((l) => l.code === code)?.name ?? code);
}

export function ProfileClient({
  data,
  locale,
}: {
  data: ProfileData;
  locale: string;
}) {
  const t = useTranslations("profile");
  const tCommon = useTranslations("common");
  const active = useLocale();
  const router = useRouter();

  const [firstName, setFirstName] = useState(data.firstName);
  const [lastName, setLastName] = useState(data.lastName);
  const [birthDate, setBirthDate] = useState(data.birthDate);
  const [newLocale, setNewLocale] = useState(data.locale || active);
  const [error, setError] = useState<string | null>(null);
  const [saved, setSaved] = useState(false);
  const [pending, startTransition] = useTransition();

  const save = () => {
    setError(null);
    setSaved(false);
    startTransition(async () => {
      const fd = new FormData();
      fd.set("first_name", firstName.trim());
      fd.set("last_name", lastName.trim());
      fd.set("birth_date", birthDate);
      fd.set("locale", newLocale);

      const res = await updateProfile(fd);
      if (res.error) {
        setError(res.error);
        return;
      }
      setSaved(true);

      if (newLocale !== active) {
        setTimeout(() => {
          router.replace("/profile", { locale: newLocale });
        }, 600);
      }
    });
  };

  return (
    <div className="px-4 py-6 md:px-8 space-y-8 max-w-2xl">
      <div>
        <h1 className="text-3xl font-extrabold tracking-tight text-gray-900 dark:text-white">
          {t("title")}
        </h1>
        <p className="text-gray-500 dark:text-gray-400 mt-1 font-medium">
          {t("subtitle")}
        </p>
      </div>

      {error && (
        <div className="auth-error">
          <AlertTriangle size={16} />
          <span>
            {error.startsWith("profile.") ? t(error.replace("profile.", "")) : error}
          </span>
        </div>
      )}
      {saved && !error && (
        <div className="bg-green-50 dark:bg-green-900/20 text-green-700 dark:text-green-400 p-4 rounded-xl text-sm border border-green-100 dark:border-green-900/30 flex items-center gap-3">
          <span>{t("saved")}</span>
        </div>
      )}

      <form
        onSubmit={(e) => {
          e.preventDefault();
          save();
        }}
        className="space-y-8"
      >
        <div>
          <Label htmlFor="display">
            <User size={14} /> {t("display_name")}
          </Label>
          <Input id="display" className="py-3" value={data.displayName} disabled />
          <p className="text-[10px] text-gray-400 mt-1">{t("display_hint")}</p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
          <div>
            <Label htmlFor="first_name">{t("first_name")}</Label>
            <Input
              id="first_name"
              className="py-3"
              value={firstName}
              onChange={(e) => setFirstName(e.target.value)}
            />
          </div>
          <div>
            <Label htmlFor="last_name">{t("last_name")}</Label>
            <Input
              id="last_name"
              className="py-3"
              value={lastName}
              onChange={(e) => setLastName(e.target.value)}
            />
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
          <div>
            <Label htmlFor="birth_date">
              {t("birth_date")} <span className="text-gray-400 font-medium">({t("optional")})</span>
            </Label>
            <Input
              id="birth_date"
              type="date"
              className="py-3"
              value={birthDate}
              onChange={(e) => setBirthDate(e.target.value)}
            />
          </div>

          <div>
            <Label htmlFor="profile_locale">
              <Globe size={14} /> {tCommon("language")}
            </Label>
            <select
              id="profile_locale"
              className="w-full bg-gray-50 dark:bg-gray-900 border border-gray-100 dark:border-gray-800 rounded-xl py-3 px-4 text-sm font-bold outline-none focus:ring-2 focus:ring-blue-500/20 dark:text-white"
              value={newLocale}
              onChange={(e) => setNewLocale(e.target.value)}
            >
              {languages.map((l) => (
                <option key={l.code} value={l.code}>
                  {langName(l.code)}
                </option>
              ))}
            </select>
          </div>
        </div>

        <Button type="submit" disabled={pending} className="shadow-xl shadow-blue-500/20">
          <Save size={18} className="mr-2" />
          {t("save")}
        </Button>
      </form>
    </div>
  );
}
