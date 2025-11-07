"use client";
import { useEffect, useState } from "react";

export default function TestYT() {
  const [vid, setVid] = useState<string>("");

  useEffect(() => {
    const sp = new URLSearchParams(window.location.search);
    setVid(sp.get("v") || "");
  }, []);

  const suspect = vid
    ? `https://www.youtube-nocookie.com/embed/${vid}?playsinline=1&modestbranding=1&rel=0`
    : "";
  const demo = `https://www.youtube-nocookie.com/embed/M7lc1UVf-VE?playsinline=1&modestbranding=1&rel=0`;

  return (
    <div style={{ padding: 24, color: "#fff", fontFamily: "ui-sans-serif, system-ui", background: "#0b1020", minHeight: "100vh" }}>
      <h1>YT Embed Diagnostics</h1>
      <p>Provide a video with <code>?v=VIDEO_ID</code> in the URL.</p>
      <div style={{ display: "grid", gap: 24, gridTemplateColumns: "1fr 1fr" }}>
        <div>
          <h3>Suspect Video {vid ? `(${vid})` : "(none provided)"}</h3>
          <div style={{ position: "relative", paddingTop: "56.25%" }}>
            {suspect ? (
              <iframe
                src={suspect}
                title="suspect"
                style={{ position: "absolute", inset: 0, width: "100%", height: "100%" }}
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                allowFullScreen
              />
            ) : (
              <div style={{ position: "absolute", inset: 0, display: "grid", placeItems: "center" }}>No video id</div>
            )}
          </div>
        </div>
        <div>
          <h3>Known OK (YouTube demo)</h3>
          <div style={{ position: "relative", paddingTop: "56.25%" }}>
            <iframe
              src={demo}
              title="demo"
              style={{ position: "absolute", inset: 0, width: "100%", height: "100%" }}
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
              allowFullScreen
            />
          </div>
        </div>
      </div>
    </div>
  );
}
