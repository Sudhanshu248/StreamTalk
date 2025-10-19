import React, { useEffect, useRef, useState } from "react";
import "./hero.css";

export default function FeaturesSection() {
  const featureRefs = useRef([]);
  const [visibleFeatures, setVisibleFeatures] = useState([]);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach(({ target, isIntersecting }) => {
          if (isIntersecting) {
            const index = featureRefs.current.indexOf(target);
            if (index !== -1) {
              setVisibleFeatures((prev) => {
                if (!prev.includes(index)) {
                  return [...prev, index];
                }
                return prev;
              });
              observer.unobserve(target);
            }
          }
        });
      },
      { threshold: 0.3 }
    );

    featureRefs.current.forEach((el) => {
      if (el) observer.observe(el);
    });

    return () => observer.disconnect();
  }, []);

  const featuresData = [
    {
      imgSrc: "/images/highQuality-videoCall.png",
      alt: "High Quality Video Calls",
      title: "High-Quality Video Calls",
      text:
        "Connect with people seamlessly through crystal-clear video calls, optimized for low latency and high reliability — just like Google Meet or Zoom.",
      reverse: false,
    },
    {
      imgSrc: "/images/realTime-chat.png",
      alt: "Multilingual Chat",
      title: "Multilingual Real-Time Chat",
      text:
        "Chat with participants in multiple languages simultaneously. Our platform translates messages in real-time, breaking language barriers and fostering global collaboration.",
      reverse: true,
    },
    {
      imgSrc: "/images/writeNotes.png",
      alt: "Note Taking",
      title: "Write Notes During Meetings",
      text:
        "Not down important points during your meetings with our integrated note-taking feature. After the meeting, download your notes as a file for easy reference and sharing.",
      reverse: false,
    },
    {
      imgSrc: "/images/ai-summary.png",
      alt: "AI Meeting Summary",
      title: "AI-Generated Meeting Summaries",
      text:
        "Save time with AI-powered summaries that capture key discussion points and action items. Get concise, accurate meeting summaries instantly after your call ends.",
      reverse: true,
    },
  ];

  return (
    <section className="featuresSection">
      {featuresData.map(({ imgSrc, alt, title, text, reverse }, i) => (
        <div
          key={i}
          ref={(el) => (featureRefs.current[i] = el)}
          className={`feature ${reverse ? "reverse" : ""} ${
            visibleFeatures.includes(i) ? "visible" : "hidden"
          }`}
        >
          <div className="featureImageContainer">
            <img
              src={imgSrc}
              alt={alt}
              className="featureImage"
              loading="lazy"
            />
          </div>
          <div className="featureText">
            <h3>{title}</h3>
            <p>{text}</p>
          </div>
        </div>
      ))}
    </section>
  );
}