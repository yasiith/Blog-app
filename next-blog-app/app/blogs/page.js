// client side is used for BlogItem
'use client';
import Header from "@/Components/Header";
import Bloglist from "@/Components/Bloglist";
import Footer from "@/Components/Footer";

export default function Home() {
  return (
    <>
      <Header/>
      <Bloglist/>
      <Footer/>
    </>
  );
}

