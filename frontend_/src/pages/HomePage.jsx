import React from "react";
import Hero from "../components/Hero";
import SuccessCarousel from "../components/Carousel";
import AboutBlock from "../components/About";
import CoursesBlock from "../components/Courses";
import ContactBlock from "../components/Contact";

export default function HomePage() {
    return (
        <div>
            <Hero />
            <SuccessCarousel />
            <AboutBlock />
            <CoursesBlock />
            <ContactBlock />
        </div>
    );
}
