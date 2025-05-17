import { useState, useEffect } from "react";
import Image1 from "../assets/mountain-landscape.jpg"
import Image2 from "../assets/coastal-town.jpg"
import Image3 from "../assets/limestone-bay.jpg"
import Image4 from "../assets/hot-air-balloons.jpg"
import Image5 from "../assets/snow-mountains.jpg"


export default function WaitPage() {
  const images = [
    Image1,
    Image2,
    Image3,
    Image4,
    Image5,
    // Add more images as needed
  ];

  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Simulate loading
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 2000);

    return () => clearTimeout(timer);
  }, []);

  const goToPrevious = () => {
    setCurrentImageIndex((prevIndex) =>
      prevIndex === 0 ? images.length - 1 : prevIndex - 1
    );
  };

  const goToNext = () => {
    setCurrentImageIndex((prevIndex) =>
      prevIndex === images.length - 1 ? 0 : prevIndex + 1
    );
  };

  const selectImage = (index) => {
    setCurrentImageIndex(index);
  };

  return (
    <div className="wait-page">
      {/* Background Image */}
      <div className="background-image">
        <img
          src={images[currentImageIndex] || "/placeholder.svg"}
          alt="Background landscape"
        />
      </div>

      {/* Content Overlay */}
      <div className="content-overlay">
        <div className="header-content">
          <h1>Generating ...</h1>
          <p>
            This text presents my research journey on the topic of Music and
            Tourism Imaginaries and gives the context which led to the
            publication of this special issue of Via Tourism Review.
          </p>
        </div>

        {/* Navigation Arrows */}
        <div className="navigation-arrows">
          <button
            onClick={goToPrevious}
            className="nav-button"
            aria-label="Previous image"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="24"
              height="24"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="m15 18-6-6 6-6" />
            </svg>
          </button>
          <button
            onClick={goToNext}
            className="nav-button"
            aria-label="Next image"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="24"
              height="24"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="m9 18 6-6-6-6" />
            </svg>
          </button>
        </div>

        {/* Thumbnail Preview */}
        <div className="thumbnail-container">
          {images
            .filter((_, index) => {
              // Show only the next two images after the current one
              const nextIndex1 = (currentImageIndex + 1) % images.length;
              const nextIndex2 = (currentImageIndex + 2) % images.length;
              return index === nextIndex1 || index === nextIndex2;
            })
            .map((image, filteredIndex) => {
              const actualIndex =
                (currentImageIndex + filteredIndex + 1) % images.length;
              return (
                <div
                  key={actualIndex}
                  onClick={() => selectImage(actualIndex)}
                  className="thumbnail"
                >
                  <img
                    src={image || "/placeholder.svg"}
                    alt={`Thumbnail ${actualIndex + 1}`}
                  />
                </div>
              );
            })}
        </div>
      </div>
    </div>
  );
}
