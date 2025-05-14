// BackgroundSlideshow.jsx
import React, { useEffect, useState } from "react";
import "../index.css";
import image1 from "../assets/image 1 (1).png";
import image2 from "../assets/image 1 (2).png";
import image3 from "../assets/image 1 (3).png";
import image4 from "../assets/image 1 (4).png";
import image5 from "../assets/image 1 (5).png";
import image6 from "../assets/image 1 (6).png";
import image7 from "../assets/image 1 (7).png";
import image8 from "../assets/image 1 (8).png";

const images = [image1, image2, image3, image4, image5, image6, image7, image8];

export default function BackgroundSlideshow() {
  const [current, setCurrent] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrent((prev) => (prev + 1) % images.length);
    }, 5000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="background-container">
      {images.map((img, index) => (
        <img
          key={index}
          src={img}
          className={`background-image ${index === current ? "active" : ""}`}
          alt={`slideshow-${index}`}
        />
      ))}
    </div>
  );
}
