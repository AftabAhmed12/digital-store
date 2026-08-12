import { useMemo, useRef } from "react";
import ReactQuill, { Quill } from "react-quill";
import "react-quill/dist/quill.snow.css";
import api from "../api/axios.js";

// Rich text editor for blog content: bold/italic/underline, headings (text size),
// hyperlinks, lists, and inline image insertion. Images are uploaded to Cloudinary
// via the backend and inserted as <img> tags directly in the content flow — so an
// admin can type a paragraph, insert an image, keep typing, insert another image, etc.
export default function RichTextEditor({ value, onChange }) {
  const quillRef = useRef(null);

  const imageHandler = () => {
    const input = document.createElement("input");
    input.setAttribute("type", "file");
    input.setAttribute("accept", "image/*");
    input.click();

    input.onchange = async () => {
      const file = input.files[0];
      if (!file) return;

      const editor = quillRef.current.getEditor();
      const range = editor.getSelection(true);

      // Show a temporary placeholder while uploading
      editor.insertText(range.index, "Uploading image...", { italic: true });

      try {
        const fd = new FormData();
        fd.append("image", file);
        const res = await api.post("/blogs/admin/upload-image", fd, {
          headers: { "Content-Type": "multipart/form-data" },
        });

        editor.deleteText(range.index, "Uploading image...".length);
        editor.insertEmbed(range.index, "image", res.data.url, "user");
        editor.setSelection(range.index + 1);
      } catch (err) {
        editor.deleteText(range.index, "Uploading image...".length);
        alert("Image upload failed. Please try again.");
      }
    };
  };

  const modules = useMemo(
    () => ({
      toolbar: {
        container: [
          [{ header: [1, 2, 3, false] }],
          ["bold", "italic", "underline", "strike"],
          [{ color: [] }, { background: [] }],
          [{ list: "ordered" }, { list: "bullet" }],
          ["link", "image"],
          ["blockquote", "code-block"],
          ["clean"],
        ],
        handlers: { image: imageHandler },
      },
    }),
    []
  );

  return (
    <div className="rich-text-editor">
      <ReactQuill
        ref={quillRef}
        theme="snow"
        value={value}
        onChange={onChange}
        modules={modules}
        placeholder="Write your post... add an image, keep writing, add another image."
      />
    </div>
  );
}
