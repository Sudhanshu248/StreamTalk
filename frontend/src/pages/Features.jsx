// FeaturesSwiper.jsx
import React from "react";
import { Swiper, SwiperSlide } from "swiper/react";
import { Navigation, Pagination, A11y } from "swiper/modules";
import "swiper/css";
import "swiper/css/navigation";
import "swiper/css/pagination";
import "./Features.css"; // custom styles

export default function FeaturesSwiper() {
  const features = [
    {
      title: "Connect with people with high quality video calls",
      imgSrc: "/images/videoCall.jpg",
      alt: "Video Calls",
    },
    {
      title: "Chat with people in multiple languages",
      imgSrc: "/images/multilingualChat.png",
      alt: "Multilingual Chat",
    },
    {
      title: "Write and save important notes during meeting",
      imgSrc: "/images/makeNotes.jpg",
      alt: "Make Notes",
    },
    {
      title: "Get AI-Powered Summary after the completion of meeting",
      imgSrc: "/images/AI-Summary.jpg",
      alt: "AI Summary",
    },
  ];

  return (
    <section className="featuresSwiperSection">
      <Swiper
        modules={[Navigation, Pagination, A11y]}
        spaceBetween={40}
        slidesPerView={1}
        navigation
        pagination={{ clickable: true }}
        a11y={{ prevSlideMessage: "Previous feature", nextSlideMessage: "Next feature" }}
      >
        {features.map(({ title, description, imgSrc, alt }, index) => (
          <SwiperSlide key={index}>
            <div className="featureSlide">
              <div className="featureImageContainers">
                <img src={imgSrc} alt={alt} loading="lazy" />
              </div>
              <div className="featureTextContainer">
                <h4>{title}</h4>
                <p>{description}</p>
              </div>
            </div>
          </SwiperSlide>
        ))}
      </Swiper>
    </section>
  );
}