"use client";

import "./styles.css";
import { useState } from "react";

interface Image {
  id: number;
  name: string;
  url: string;
}

const images: Image[] = [
  { id: 1, name: "Image 1", url: "https://i.imgur.com/eZnzOPS.jpg" },
  { id: 2, name: "Image 2", url: "https://i.imgur.com/gPceaBv.jpg" },
  { id: 3, name: "Image 3", url: "https://i.imgur.com/7JG15Mw.jpg" },
  { id: 4, name: "Image 4", url: "https://i.imgur.com/EmkcmxZ.jpg" },
  { id: 5, name: "Image 5", url: "https://i.imgur.com/3aG8lNQ.jpg" },
];

export default function App() {
  const [selectedId, setSelectedId] = useState<number>(1);

  const prevImage = () => {
    setSelectedId((prev) => (prev <= 1 ? images.length : prev - 1));
  };

  const nextImage = () => {
    setSelectedId((prev) => (prev >= images.length ? 1 : prev + 1));
  };

  return (
    <div className="App">
      {/* Navigation Bar */}
      <nav className="navbar">
        <h1 className="nav-title">C H R I S O C P H O T O</h1>
        <div className="hamburger-menu">☰</div>
      </nav>
      
      <div className="image">
        <div className="image_slider">
          <div className="images">
            {images
              .filter((image) => image.id === selectedId)
              .map((image) => (
                <img key={image.id} src={image.url} alt={image.name} className="resized-image" />
              ))}
          </div>

          <div className="thumbnails">
            {images.map((image: Image) => (
              <img
                key={image.id}
                src={image.url}
                alt={image.name}
                onClick={() => setSelectedId(image.id)}
                className={`thumbnail ${image.id === selectedId ? "selected" : ""}`}
              />
            ))}
          </div>

          <button className="button_prev" onClick={prevImage}> Prev </button>
          <button className="button_next" onClick={nextImage}> Next </button>
        </div>
      </div>
      
      {/* Global CSS Overrides */}
      <style jsx global>{`
        .navbar {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 15px 20px;
          background-color: #333;
          color: white;
          font-size: 20px;
          font-weight: bold;
          position: fixed;
          top: 0;
          left: 0;
          width: 100%;
          z-index: 1000;
        }
        .nav-title {
          margin: 0;
        }
        .hamburger-menu {
          font-size: 24px;
          cursor: pointer;
        }
        .App {
          padding-top: 60px; /* Ensures content doesn't overlap with fixed navbar */
        }
        .resized-image {
          width: 100%;
          height: auto;
          max-width: 100%;
          border-radius: 8px;
        }
        .thumbnail {
          width: 80px;
          height: 80px;
          margin: 5px;
          cursor: pointer;
          border-radius: 8px;
          transition: transform 0.3s ease;
        }
        .thumbnail.selected {
          transform: scale(1.1);
          border: 2px solid #0070f3;
        }
        .thumbnail:hover {
          transform: scale(1.1);
        }
      `}</style>
    </div>
  );
}
