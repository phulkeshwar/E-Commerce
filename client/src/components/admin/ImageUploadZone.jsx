import { useState } from "react";
import { uploadImageRequest } from "../../api/upload.api";

export function ImageUploadZone({ value, onChange }) {
  const [uploading, setUploading] = useState(false);

  const handleFileChange = async (event) => {
    const file = event.target.files?.[0];

    if (!file) {
      return;
    }

    setUploading(true);
    try {
      const formData = new FormData();
      formData.append("image", file);
      const image = await uploadImageRequest(formData);
      onChange(image.url);
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="upload-zone">
      <label className="field">
        <span className="field-label">Image file</span>
        <input className="input" type="file" accept="image/*" onChange={handleFileChange} />
      </label>
      <label className="field">
        <span className="field-label">Image URL</span>
        <input
          className="input"
          value={value}
          onChange={(event) => onChange(event.target.value)}
          placeholder={uploading ? "Uploading..." : "Paste an image URL or upload a file"}
        />
      </label>
    </div>
  );
}
