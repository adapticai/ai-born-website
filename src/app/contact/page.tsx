import React from "react";

import { Background } from "@/components/background";
import Contact from "@/components/blocks/contact";
import { NavbarWrapper } from "@/components/blocks/navbar-wrapper";

const Page = () => {
  return (
    <>
      <NavbarWrapper />
      <Background>
        <Contact />
      </Background>
    </>
  );
};

export default Page;
