export type UploadLimits = { maxFiles: number; maxFileBytes: number };
export const imageTypes: Record<string, string[]> = {
  "image/jpeg": ["jpg", "jpeg"],
  "image/png": ["png"],
  "image/webp": ["webp"],
};
export function photoSelectionError(
  files: { name: string; type: string; size: number }[],
  limits: UploadLimits,
): string | null {
  if (files.length > limits.maxFiles)
    return `Choose at most ${limits.maxFiles} photos.`;
  if (files.reduce((sum, file) => sum + file.size, 0) > 31 * 1048576)
    return "Keep the combined photo size under 31 MB.";
  for (const file of files) {
    if (file.size <= 0 || file.size > limits.maxFileBytes)
      return `Each photo must be non-empty and no larger than ${limits.maxFileBytes / 1048576} MB.`;
    const extension = file.name.split(".").pop()?.toLowerCase() ?? "";
    if (!imageTypes[file.type]?.includes(extension))
      return "Choose JPEG, PNG or WebP files with matching file extensions.";
  }
  return null;
}
