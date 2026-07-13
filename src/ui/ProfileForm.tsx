"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useRef, useState } from "react";

import { Button } from "@/components/ui/button";
import { PLAYER_COLORS } from "@/config/physics";
import { createClient } from "@/lib/supabase/client";
import type { Tables } from "@/types/supabase";

type ProfileRow = Tables<"profiles">;

interface ProfileFormProps {
  userId: string;
  initialProfile: Pick<
    ProfileRow,
    "display_name" | "cap_color" | "avatar_url" | "updated_at"
  >;
}

const inputClassName =
  "h-9 w-full rounded-md border border-input bg-background px-3 text-sm outline-none ring-ring/50 transition-shadow focus-visible:border-ring focus-visible:ring-3";

const HEX_COLOR_PATTERN = /^#[0-9A-Fa-f]{6}$/;
const MAX_AVATAR_BYTES = 2 * 1024 * 1024;
const ALLOWED_AVATAR_TYPES = new Set([
  "image/jpeg",
  "image/png",
  "image/webp",
]);

function validateDisplayName(value: string): string | null {
  const trimmed = value.trim();
  if (trimmed.length < 1 || trimmed.length > 32) {
    return "El nombre debe tener entre 1 y 32 caracteres.";
  }
  return null;
}

function validateCapColor(value: string): string | null {
  if (!HEX_COLOR_PATTERN.test(value)) {
    return "El color debe ser un hex válido (#RRGGBB).";
  }
  return null;
}

function translateProfileError(message: string): string {
  const normalized = message.toLowerCase();

  if (normalized.includes("display_name_length")) {
    return "El nombre debe tener entre 1 y 32 caracteres.";
  }
  if (normalized.includes("cap_color_hex")) {
    return "El color debe ser un hex válido (#RRGGBB).";
  }
  if (normalized.includes("payload too large")) {
    return "La imagen es demasiado grande (máx. 2 MB).";
  }
  if (normalized.includes("row-level security")) {
    return "No tienes permiso para actualizar este perfil.";
  }

  return message || "Ha ocurrido un error. Inténtalo de nuevo.";
}

/** Formulario editable de perfil: nombre, color de chapa, avatar y logout. */
export function ProfileForm({ userId, initialProfile }: ProfileFormProps) {
  const router = useRouter();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [displayName, setDisplayName] = useState(initialProfile.display_name);
  const [capColor, setCapColor] = useState(initialProfile.cap_color);
  const [avatarUrl, setAvatarUrl] = useState(initialProfile.avatar_url);
  const [updatedAt, setUpdatedAt] = useState(initialProfile.updated_at);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [loggingOut, setLoggingOut] = useState(false);
  const [avatarPreview, setAvatarPreview] = useState<string | null>(null);
  const [pendingAvatarFile, setPendingAvatarFile] = useState<File | null>(null);

  const previewSrc = avatarPreview ?? avatarUrl;

  const handleAvatarChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    setError(null);
    setSuccess(null);

    if (!file) {
      setPendingAvatarFile(null);
      setAvatarPreview(null);
      return;
    }

    if (!ALLOWED_AVATAR_TYPES.has(file.type)) {
      setError("Formato no válido. Usa JPEG, PNG o WebP.");
      event.target.value = "";
      return;
    }

    if (file.size > MAX_AVATAR_BYTES) {
      setError("La imagen no puede superar 2 MB.");
      event.target.value = "";
      return;
    }

    setPendingAvatarFile(file);
    setAvatarPreview(URL.createObjectURL(file));
  };

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError(null);
    setSuccess(null);

    const nameError = validateDisplayName(displayName);
    if (nameError) {
      setError(nameError);
      return;
    }

    const colorError = validateCapColor(capColor);
    if (colorError) {
      setError(colorError);
      return;
    }

    setSaving(true);
    const supabase = createClient();
    const trimmedName = displayName.trim();

    try {
      let nextAvatarUrl = avatarUrl;

      if (pendingAvatarFile) {
        const extension =
          pendingAvatarFile.type === "image/png"
            ? "png"
            : pendingAvatarFile.type === "image/webp"
              ? "webp"
              : "jpg";
        const storagePath = `${userId}/avatar.${extension}`;

        const { error: uploadError } = await supabase.storage
          .from("avatars")
          .upload(storagePath, pendingAvatarFile, {
            upsert: true,
            contentType: pendingAvatarFile.type,
          });

        if (uploadError) {
          setError(translateProfileError(uploadError.message));
          return;
        }

        const { data: publicUrlData } = supabase.storage
          .from("avatars")
          .getPublicUrl(storagePath);

        nextAvatarUrl = `${publicUrlData.publicUrl}?t=${Date.now()}`;
      }

      const { data, error: updateError } = await supabase
        .from("profiles")
        .update({
          display_name: trimmedName,
          cap_color: capColor,
          avatar_url: nextAvatarUrl,
        })
        .eq("id", userId)
        .select("display_name, cap_color, avatar_url, updated_at")
        .single();

      if (updateError) {
        setError(translateProfileError(updateError.message));
        return;
      }

      setDisplayName(data.display_name);
      setCapColor(data.cap_color);
      setAvatarUrl(data.avatar_url);
      setUpdatedAt(data.updated_at);
      setPendingAvatarFile(null);
      if (avatarPreview) {
        URL.revokeObjectURL(avatarPreview);
        setAvatarPreview(null);
      }
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
      setSuccess("Perfil guardado correctamente.");
      router.refresh();
    } finally {
      setSaving(false);
    }
  };

  const handleLogout = async () => {
    setError(null);
    setSuccess(null);
    setLoggingOut(true);

    const supabase = createClient();

    try {
      const { error: signOutError } = await supabase.auth.signOut();
      if (signOutError) {
        setError(translateProfileError(signOutError.message));
        return;
      }

      router.push("/");
      router.refresh();
    } finally {
      setLoggingOut(false);
    }
  };

  return (
    <div className="w-full max-w-md rounded-lg border border-border bg-popover p-6 shadow-lg">
      <header className="mb-6 text-center">
        <h1 className="font-heading text-2xl text-primary">Mi perfil</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Personaliza tu nombre, color de chapa y avatar para partidas online.
        </p>
      </header>

      <form className="flex flex-col gap-4" onSubmit={handleSubmit}>
        <div className="flex flex-col items-center gap-3">
          <div
            className="flex size-20 items-center justify-center overflow-hidden rounded-full border border-border bg-muted"
            aria-hidden={!previewSrc}
          >
            {previewSrc ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={previewSrc}
                alt=""
                className="size-full object-cover"
              />
            ) : (
              <span
                className="size-full rounded-full"
                style={{ backgroundColor: capColor }}
              />
            )}
          </div>
          <div className="flex flex-col items-center gap-1">
            <input
              ref={fileInputRef}
              id="profile-avatar"
              type="file"
              accept="image/jpeg,image/png,image/webp"
              className="sr-only"
              onChange={handleAvatarChange}
            />
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => fileInputRef.current?.click()}
            >
              {avatarUrl || pendingAvatarFile ? "Cambiar avatar" : "Subir avatar"}
            </Button>
            <p className="text-xs text-muted-foreground">Opcional · máx. 2 MB</p>
          </div>
        </div>

        <div className="flex flex-col gap-1.5">
          <label
            htmlFor="profile-display-name"
            className="text-xs font-medium text-muted-foreground"
          >
            Nombre visible
          </label>
          <input
            id="profile-display-name"
            type="text"
            required
            minLength={1}
            maxLength={32}
            value={displayName}
            className={inputClassName}
            onChange={(e) => setDisplayName(e.target.value)}
          />
        </div>

        <div className="flex flex-col gap-2">
          <span className="text-xs font-medium text-muted-foreground">
            Color de chapa
          </span>
          <div className="flex items-center gap-3">
            <input
              id="profile-cap-color"
              type="color"
              value={capColor}
              className="size-10 cursor-pointer rounded-md border border-input bg-background p-0.5"
              onChange={(e) => setCapColor(e.target.value)}
            />
            <input
              type="text"
              value={capColor}
              maxLength={7}
              pattern="^#[0-9A-Fa-f]{6}$"
              className={`${inputClassName} font-mono uppercase`}
              onChange={(e) => setCapColor(e.target.value)}
            />
          </div>
          <div className="flex flex-wrap gap-2" role="group" aria-label="Colores predefinidos">
            {PLAYER_COLORS.map((color) => {
              const selected = capColor.toLowerCase() === color.toLowerCase();
              return (
                <button
                  key={color}
                  type="button"
                  aria-label={`Color ${color}`}
                  aria-pressed={selected}
                  className="size-8 rounded-full border-2 transition-transform outline-none focus-visible:ring-3 focus-visible:ring-ring/50 active:scale-95"
                  style={{
                    backgroundColor: color,
                    borderColor: selected ? "var(--foreground)" : "transparent",
                  }}
                  onClick={() => setCapColor(color)}
                />
              );
            })}
          </div>
        </div>

        {error && (
          <p className="rounded-md border border-destructive/30 bg-destructive/10 px-3 py-2 text-sm text-destructive">
            {error}
          </p>
        )}

        {success && (
          <p className="rounded-md border border-border bg-muted px-3 py-2 text-sm text-muted-foreground">
            {success}
          </p>
        )}

        <Button type="submit" className="w-full" size="lg" disabled={saving || loggingOut}>
          {saving ? "Guardando…" : "Guardar cambios"}
        </Button>
      </form>

      <p className="mt-4 text-center text-xs text-muted-foreground">
        Última actualización:{" "}
        <time dateTime={updatedAt}>
          {new Date(updatedAt).toLocaleString("es-ES")}
        </time>
      </p>

      <div className="mt-6 flex flex-col gap-3 border-t border-border pt-6">
        <Button
          type="button"
          variant="outline"
          className="w-full"
          disabled={saving || loggingOut}
          onClick={handleLogout}
        >
          {loggingOut ? "Cerrando sesión…" : "Cerrar sesión"}
        </Button>

        <p className="text-center">
          <Link
            href="/"
            className="text-sm text-muted-foreground underline-offset-4 hover:text-foreground hover:underline"
          >
            Volver al juego
          </Link>
        </p>
      </div>
    </div>
  );
}
