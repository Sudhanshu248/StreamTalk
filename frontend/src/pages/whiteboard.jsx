import React, { useState } from "react";

export default function NotesDownloader() {
  const [notes, setNotes] = useState("");

  const handleDownload = () => {
    // Preserve line breaks exactly
    const blob = new Blob([notes], { type: "text/plain" });
    const url = URL.createObjectURL(blob);

    const a = document.createElement("a");
    a.href = url;
    a.download = "notes.txt";
    a.click();

    URL.revokeObjectURL(url);
  };

  return (
    <div>
      <textarea
        rows="10"
        cols="70"
        value={notes}
        onChange={(e) => setNotes(e.target.value)}
        placeholder="Write your notes here..."
      />
      <br />
      <button onClick={handleDownload}>Download Notes</button>
    </div>
  );
}
